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
console.log(`STARTING WEB VIDEO COMPRESSION AUDIT & CONVERSION (${files.length} FILES)`);
console.log(`================================================================\n`);

function compressFile(file) {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(targetDir, file);
    // Standardize output extension to .mp4
    const outName = file.replace(/\.(mov|MOV|MP4)$/, '.mp4');
    const outputPath = path.join(tempDir, outName);

    const origSize = fs.statSync(inputPath).size;
    console.log(`Compressing [${file}] (${(origSize / 1024 / 1024).toFixed(2)} MB)...`);

    // FFmpeg web optimization flags:
    // -c:v libx264 -crf 27 -preset fast -pix_fmt yuv420p
    // -vf "scale='min(1920,iw)':-2"
    // -movflags +faststart
    // -c:a aac -b:a 96k
    const args = [
      '-y',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-crf', '27',
      '-preset', 'fast',
      '-pix_fmt', 'yuv420p',
      '-vf', "scale='min(1920,iw)':-2",
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
        console.log(`  ✅ Done: [${outName}] ${(origSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024 / 1024).toFixed(2)} MB (${reduction}% reduction)\n`);
        resolve({ file, outName, origSize, newSize });
      } else {
        console.error(`  ❌ Failed compressing ${file} with exit code ${code}`);
        reject(new Error(`FFmpeg exit code ${code}`));
      }
    });
  });
}

async function runAll() {
  let totalOrig = 0;
  let totalNew = 0;
  const results = [];

  for (const f of files) {
    try {
      const res = await compressFile(f);
      totalOrig += res.origSize;
      totalNew += res.newSize;
      results.push(res);
    } catch (err) {
      console.error(`Skipping ${f} due to error: ${err.message}`);
    }
  }

  console.log(`================================================================`);
  console.log(`COMPRESSION COMPLETE SUMMARY:`);
  console.log(`Original Total: ${(totalOrig / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Compressed Total: ${(totalNew / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Savings: ${(((totalOrig - totalNew) / totalOrig) * 100).toFixed(1)}%`);
  console.log(`================================================================\n`);

  // Overwrite original files with compressed files
  for (const r of results) {
    const srcTemp = path.join(tempDir, r.outName);
    const destPath = path.join(targetDir, r.file);
    fs.copyFileSync(srcTemp, destPath);
  }

  // Clean up temp dir
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('Original assets updated with compressed Web-optimized versions.');
}

runAll();
