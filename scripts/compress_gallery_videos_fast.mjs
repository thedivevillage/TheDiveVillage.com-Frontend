import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const targetDir = path.resolve('c:/Users/lenovo-1/Documents/GitHub/TheDiveVillage/TheDiveVillage-Frontend/Frontend/src/assets/New folder');
const tempDir = path.resolve('c:/Users/lenovo-1/Documents/GitHub/TheDiveVillage/TheDiveVillage-Frontend/Frontend/src/assets/temp_compressed');

if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

const files = fs.readdirSync(targetDir).filter(f => 
  f.endsWith('.mp4') || f.endsWith('.MP4') || f.endsWith('.mov') || f.endsWith('.MOV')
);

console.log(`================================================================`);
console.log(`HIGH-SPEED PARALLEL VIDEO COMPRESSION (${files.length} FILES)`);
console.log(`================================================================\n`);

function compressFile(file) {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(targetDir, file);
    const outName = file.replace(/\.(mov|MOV|MP4)$/, '.mp4');
    const outputPath = path.join(tempDir, outName);

    const origSize = fs.statSync(inputPath).size;

    // FFmpeg superfast flags:
    // -c:v libx264 -crf 27 -preset superfast -pix_fmt yuv420p
    // -vf "scale='min(1280,iw)':-2"
    // -movflags +faststart
    // -c:a aac -b:a 96k
    const args = [
      '-y',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-crf', '27',
      '-preset', 'superfast',
      '-threads', '4',
      '-pix_fmt', 'yuv420p',
      '-vf', "scale='min(1280,iw)':-2",
      '-movflags', '+faststart',
      '-c:a', 'aac',
      '-b:a', '96k',
      outputPath
    ];

    const child = spawn('ffmpeg', args);

    child.on('close', (code) => {
      if (code === 0) {
        const newSize = fs.statSync(outputPath).size;
        const reduction = (((origSize - newSize) / origSize) * 100).toFixed(1);
        console.log(`✅ [${outName}] ${(origSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024 / 1024).toFixed(2)} MB (${reduction}% smaller)`);
        resolve({ file, outName, origSize, newSize });
      } else {
        console.error(`❌ Failed compressing ${file}`);
        reject(new Error(`FFmpeg error ${code}`));
      }
    });
  });
}

async function runInParallel(items, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      const res = await compressFile(items[i]);
      results.push(res);
    }
  }

  const workers = Array(concurrency).fill(0).map(() => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  const startTime = Date.now();
  // Process 3 files in parallel
  const results = await runInParallel(files, 3);

  let totalOrig = 0;
  let totalNew = 0;
  for (const r of results) {
    totalOrig += r.origSize;
    totalNew += r.newSize;
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n================================================================`);
  console.log(`COMPRESSION COMPLETE IN ${durationSec}s:`);
  console.log(`Original Size:   ${(totalOrig / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Compressed Size: ${(totalNew / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Reduction: ${(((totalOrig - totalNew) / totalOrig) * 100).toFixed(1)}%`);
  console.log(`================================================================\n`);

  // Overwrite original files with compressed files
  for (const r of results) {
    const srcTemp = path.join(tempDir, r.outName);
    const destPath = path.join(targetDir, r.file);
    fs.copyFileSync(srcTemp, destPath);
  }

  // Clean up temp dir
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('Successfully updated gallery assets with ultra-fast lightweight web MP4s.');
}

main();
