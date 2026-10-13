import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const targetDir = path.resolve('c:/Users/lenovo-1/Documents/GitHub/TheDiveVillage/TheDiveVillage-Frontend/Frontend/src/assets/New folder');
const tempDir = path.resolve('c:/Users/lenovo-1/Documents/GitHub/TheDiveVillage/TheDiveVillage-Frontend/Frontend/src/assets/temp_compressed');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const files = fs.readdirSync(targetDir).filter(f => 
  f.endsWith('.mp4') || f.endsWith('.MP4') || f.endsWith('.mov') || f.endsWith('.MOV')
);

console.log(`================================================================`);
console.log(`OPTIMIZED HIGH-SPEED GALLERY VIDEO COMPRESSION (${files.length} FILES)`);
console.log(`================================================================\n`);

function compressFile(file) {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(targetDir, file);
    const outName = file.replace(/\.(mov|MOV|MP4)$/, '.mp4');
    const outputPath = path.join(tempDir, outName);

    const origSize = fs.statSync(inputPath).size;

    // High performance web compression flags:
    // -vf scale=-2:720 (720p HD limit - ideal for web gallery cards)
    // -c:v libx264 -crf 27 -preset ultrafast -pix_fmt yuv420p
    // -movflags +faststart
    // -c:a aac -b:a 96k
    const args = [
      '-y',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-crf', '27',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=-2:720',
      '-movflags', '+faststart',
      '-c:a', 'aac',
      '-b:a', '96k',
      outputPath
    ];

    const child = spawn('ffmpeg', args);

    child.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        const newSize = fs.statSync(outputPath).size;
        const reduction = (((origSize - newSize) / origSize) * 100).toFixed(1);
        console.log(`✅ [${outName}] ${(origSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024 / 1024).toFixed(2)} MB (${reduction}% reduction)`);
        resolve({ file, outName, origSize, newSize });
      } else {
        console.error(`❌ Failed compressing ${file}`);
        resolve(null);
      }
    });
  });
}

async function runParallel(items, limit) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const item = items[index++];
      const res = await compressFile(item);
      if (res) results.push(res);
    }
  }

  const workers = Array(limit).fill(0).map(() => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  const startTime = Date.now();
  const results = await runParallel(files, 2);

  let totalOrig = 0;
  let totalNew = 0;
  for (const r of results) {
    totalOrig += r.origSize;
    totalNew += r.newSize;
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n================================================================`);
  console.log(`COMPRESSION SUMMARY (Completed in ${durationSec}s):`);
  console.log(`Original Total:   ${(totalOrig / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Compressed Total: ${(totalNew / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Savings:    ${(((totalOrig - totalNew) / totalOrig) * 100).toFixed(1)}% reduction`);
  console.log(`================================================================\n`);

  // Overwrite original assets with compressed assets
  for (const r of results) {
    const srcTemp = path.join(tempDir, r.outName);
    const destPath = path.join(targetDir, r.file);
    fs.copyFileSync(srcTemp, destPath);
  }

  // Clean up temp dir
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('Original assets successfully updated with high-performance web MP4s.');
}

main();
