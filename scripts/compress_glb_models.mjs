import fs from 'fs';
import path from 'path';
import gltfPipeline from 'gltf-pipeline';

const processGltf = gltfPipeline.processGltf;
const processGlb = gltfPipeline.processGlb;

function getAllGlbFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const entries = fs.readdirSync(dirPath);
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllGlbFiles(fullPath, arrayOfFiles);
    } else if (entry.toLowerCase().endsWith('.glb')) {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

const assetsDir = path.resolve('./Frontend/src/assets');
const allGlbs = getAllGlbFiles(assetsDir);

console.log(`================================================================`);
console.log(`FOUND ${allGlbs.length} GLB 3D MODELS TO OPTIMIZE WITH DRACO`);
console.log(`================================================================\n`);

const options = {
  dracoOptions: {
    compressionLevel: 7
  }
};

async function compressModels() {
  let totalOrig = 0;
  let totalNew = 0;

  for (const file of allGlbs) {
    const origSize = fs.statSync(file).size;
    const rel = path.relative(assetsDir, file).replace(/\\/g, '/');
    console.log(`Optimizing [${rel}] (${(origSize / 1024 / 1024).toFixed(2)} MB)...`);

    try {
      const glbBuffer = fs.readFileSync(file);
      const results = await processGlb(glbBuffer, options);
      const newBuffer = results.glb;
      const newSize = newBuffer.length;

      if (newSize < origSize) {
        fs.writeFileSync(file, newBuffer);
        const percent = (((origSize - newSize) / origSize) * 100).toFixed(1);
        console.log(`  ✅ [${rel}] ${(origSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024 / 1024).toFixed(2)} MB (${percent}% saved)\n`);
        totalOrig += origSize;
        totalNew += newSize;
      } else {
        console.log(`  ℹ️ [${rel}] Already optimal. Kept original.\n`);
        totalOrig += origSize;
        totalNew += origSize;
      }
    } catch (err) {
      console.error(`  ❌ Error processing ${rel}:`, err.message);
      totalOrig += origSize;
      totalNew += origSize;
    }
  }

  const savedMB = ((totalOrig - totalNew) / (1024 * 1024)).toFixed(2);
  const totalPercent = (((totalOrig - totalNew) / totalOrig) * 100).toFixed(1);

  console.log(`================================================================`);
  console.log(`3D MODEL OPTIMIZATION COMPLETE`);
  console.log(`Original:   ${(totalOrig / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Compressed: ${(totalNew / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Saved: ${savedMB} MB (${totalPercent}% reduction)`);
  console.log(`================================================================\n`);
}

compressModels();
