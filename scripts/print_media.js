import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../Frontend/src');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getFiles(full));
    } else if (/\.(js|jsx|ts|tsx)$/.test(item.name)) {
      results.push(full);
    }
  }
  return results;
}

const files = getFiles(srcDir);
const importRegex = /import\s+([\w$]+)\s+from\s+['"]([^'"]+\.(mp4|mov|webm|m4v|jpg|jpeg|png|webp|glb|mp3|svg|ico))['"]/g;

const references = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(srcDir, file).replace(/\\/g, '/');
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    references.push({
      file: relFile,
      varName: match[1],
      assetPath: match[2],
    });
  }
});

const videos = references.filter(r => /\.(mp4|mov|webm|m4v)$/i.test(r.assetPath));
const glb = references.filter(r => /\.glb$/i.test(r.assetPath));
const audio = references.filter(r => /\.mp3$/i.test(r.assetPath));

console.log('=== VIDEOS (' + videos.length + ') ===');
videos.forEach(v => console.log(`• [${v.file}] ${v.varName} -> ${v.assetPath}`));

console.log('\n=== 3D GLB MODELS (' + glb.length + ') ===');
glb.forEach(v => console.log(`• [${v.file}] ${v.varName} -> ${v.assetPath}`));

console.log('\n=== AUDIO (' + audio.length + ') ===');
audio.forEach(v => console.log(`• [${v.file}] ${v.varName} -> ${v.assetPath}`));
