import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const assetsRoot = path.resolve('./Frontend/src/assets');
const tempDir = path.resolve('./Frontend/src/assets/.temp_compressed');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

function getAllVideoFiles(dirPath, arrayOfFiles = []) {
  const entries = fs.readdirSync(dirPath);
  for (const entry of entries) {
    if (entry === '.temp_compressed' || entry.startsWith('.')) continue;
    const fullPath = path.join(dirPath, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllVideoFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(entry).toLowerCase();
      // Only process video formats (leave small webm cursor animation alone)
      if (['.mp4', '.mov', '.m4v'].includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  }
  return arrayOfFiles;
}

const allFiles = getAllVideoFiles(assetsRoot);

console.log(`================================================================`);
console.log(`FOUND ${allFiles.length} VIDEO FILES TO AUDIT & COMPRESS`);
console.log(`FFmpeg binary: ${ffmpegPath}`);
console.log(`================================================================\n`);

function compressFile(filePath) {
  return new Promise((resolve) => {
    const origSize = fs.statSync(filePath).size;
    const origExt = path.extname(filePath);
    const baseName = path.basename(filePath);
    const relPath = path.relative(assetsRoot, filePath).replace(/\\/g, '/');
    
    // Hash-based or sanitized temp filename to prevent collision
    const tempFileName = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.mp4`;
    const outputPath = path.join(tempDir, tempFileName);

    // Is it a 360 video (ClownFish)?
    const is360 = baseName.toLowerCase().includes('clownfish');
    
    // Scale filter: Cap max dimension to 1920, ensure even dimensions for libx264
    const scaleFilter = is360 
      ? "scale='min(3840,iw)':-2" 
      : "scale='min(1920,iw)':-2";

    const args = [
      '-y',
      '-i', filePath,
      '-c:v', 'libx264',
      '-crf', '24',
      '-preset', 'faster',
      '-pix_fmt', 'yuv420p',
      '-vf', scaleFilter,
      '-movflags', '+faststart',
      '-c:a', 'aac',
      '-b:a', '128k',
      outputPath
    ];

    const child = spawn(ffmpegPath, args);

    let stderr = '';
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    child.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        const newSize = fs.statSync(outputPath).size;
        
        // If compressed file is smaller or if original was HEVC / MOV / unoptimized, keep new file
        const shouldReplace = newSize < origSize || origExt.toLowerCase() !== '.mp4' || stderr.includes('hevc');
        
        if (shouldReplace) {
          // Replace original file
          fs.copyFileSync(outputPath, filePath);
          fs.unlinkSync(outputPath);
          const reduction = (((origSize - newSize) / origSize) * 100).toFixed(1);
          console.log(`✅ [${relPath}] ${(origSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024 / 1024).toFixed(2)} MB (${reduction}% saved)`);
          resolve({ relPath, origSize, newSize, success: true });
        } else {
          // Original was already smaller/optimal
          fs.unlinkSync(outputPath);
          console.log(`ℹ️ [${relPath}] Already optimal (${(origSize / 1024 / 1024).toFixed(2)} MB). Kept original.`);
          resolve({ relPath, origSize, newSize: origSize, success: true });
        }
      } else {
        console.error(`❌ Failed compressing ${relPath}: code ${code}`);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        resolve({ relPath, origSize, newSize: origSize, success: false });
      }
    });
  });
}

async function runParallel(files, concurrency = 2) {
  const results = [];
  let index = 0;

  async function worker(workerId) {
    while (index < files.length) {
      const current = files[index++];
      const res = await compressFile(current);
      results.push(res);
    }
  }

  const workers = Array(concurrency).fill(0).map((_, i) => worker(i));
  await Promise.all(workers);
  return results;
}

async function main() {
  const startTime = Date.now();
  const results = await runParallel(allFiles, 3);

  let totalOrig = 0;
  let totalNew = 0;
  let successCount = 0;

  for (const r of results) {
    totalOrig += r.origSize;
    totalNew += r.newSize;
    if (r.success) successCount++;
  }

  // Remove temp directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalSavedMB = ((totalOrig - totalNew) / (1024 * 1024)).toFixed(2);
  const percentSaved = (((totalOrig - totalNew) / totalOrig) * 100).toFixed(1);

  console.log(`\n================================================================`);
  console.log(`BATCH COMPRESSION COMPLETED IN ${totalTimeSec}s`);
  console.log(`Processed: ${successCount} / ${allFiles.length} files`);
  console.log(`Original Total:   ${(totalOrig / 1024 / 1024).toFixed(2)} MB (${(totalOrig / (1024 * 1024 * 1024)).toFixed(2)} GB)`);
  console.log(`Compressed Total: ${(totalNew / 1024 / 1024).toFixed(2)} MB (${(totalNew / (1024 * 1024 * 1024)).toFixed(2)} GB)`);
  console.log(`Total Saved:      ${totalSavedMB} MB (${percentSaved}% reduction)`);
  console.log(`================================================================\n`);
}

main().catch((err) => {
  console.error('Fatal error in batch compression:', err);
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
});
