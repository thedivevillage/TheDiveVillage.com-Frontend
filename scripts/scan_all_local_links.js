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

const byCategory = {
  'Videos (.mp4 / .webm)': [],
  '3D Models (.glb)': [],
  'Audio (.mp3)': [],
  'Hero / Section Images (.webp / .jpg / .png)': [],
  'Gallery / Service Images': [],
  'UI, Branding & Icons (.png / .svg / .ico)': [],
};

references.forEach(r => {
  const ext = path.extname(r.assetPath).toLowerCase();
  if (['.mp4', '.mov', '.webm', '.m4v'].includes(ext)) {
    byCategory['Videos (.mp4 / .webm)'].push(r);
  } else if (['.glb'].includes(ext)) {
    byCategory['3D Models (.glb)'].push(r);
  } else if (['.mp3'].includes(ext)) {
    byCategory['Audio (.mp3)'].push(r);
  } else if (r.assetPath.includes('Services Thumbnails') || r.assetPath.includes('Airport to Airport') || r.assetPath.includes('The Ocean')) {
    byCategory['Hero / Section Images (.webp / .jpg / .png)'].push(r);
  } else if (r.assetPath.includes('Gallery')) {
    byCategory['Gallery / Service Images'].push(r);
  } else {
    byCategory['UI, Branding & Icons (.png / .svg / .ico)'].push(r);
  }
});

console.log(`TOTAL LOCAL ASSET IMPORTS IN FRONTEND: ${references.length}\n`);

for (const [cat, items] of Object.entries(byCategory)) {
  console.log(`========================================`);
  console.log(`${cat} (Total: ${items.length})`);
  console.log(`========================================`);
  items.forEach(i => {
    console.log(`• [${i.file}] ${i.varName} -> ${i.assetPath}`);
  });
  console.log();
}
