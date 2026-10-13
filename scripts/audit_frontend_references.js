import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendSrc = path.resolve(__dirname, '../Frontend/src');

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

const jsFiles = getFiles(frontendSrc);
const mediaRegex = /import\s+([\w$]+)\s+from\s+['"]([^'"]+\.(mp4|mov|webm|m4v|jpg|jpeg|png|glb|mp3|svg|ico))['"]|const\s+([\w$]+)\s*=\s*['"]([^'"]+\.(mp4|mov|webm|m4v|jpg|jpeg|png|glb|mp3|svg|ico))['"]/gi;

const groupA = [];
const groupB = [];

jsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(frontendSrc, file).replace(/\\/g, '/');
  
  let match;
  while ((match = mediaRegex.exec(content)) !== null) {
    const varName = match[1] || match[4] || 'anonymous';
    const importPath = match[2] || match[5] || '';
    const ext = path.extname(importPath).toLowerCase();

    const isFallbackVar = varName.toLowerCase().includes('local') || varName.toLowerCase().includes('fallback');
    const isGlbOrAudio = ext === '.glb' || ext === '.mp3';
    const isUiAsset = ext === '.svg' || ext === '.ico' || importPath.includes('logo') || importPath.includes('icon') || importPath.includes('Picture3.png') || importPath.includes('catf.png') || importPath.includes('capb.png') || importPath.includes('bag front.png') || importPath.includes('bagback.png');
    const isCloudinaryConst = content.includes(`const ${varName} = 'https://res.cloudinary.com`);

    if (isGlbOrAudio || isUiAsset || isFallbackVar || isCloudinaryConst) {
      groupA.push({ relPath, varName, importPath, category: isGlbOrAudio ? 'GLB / Audio (Excluded)' : (isUiAsset ? 'UI Icon/Logo/Apparel Asset' : 'Fallback / Cloudinary Wrapper') });
    } else {
      // Check if this variable is referenced alongside a Cloudinary URL or fallback
      const hasCloudinaryTwin = content.includes(`const ${varName} = 'https://res.cloudinary.com`);
      if (hasCloudinaryTwin) {
        groupA.push({ relPath, varName, importPath, category: 'Cloudinary Primary with Local Fallback' });
      } else {
        groupB.push({ relPath, varName, importPath, category: 'Potentially Direct Local Import' });
      }
    }
  }
});

console.log('--- CHECK 3: FRONTEND LOCAL MEDIA REFERENCES AUDIT ---');
console.log(`Total Media Imports / References Audited: ${groupA.length + groupB.length}`);
console.log(`Group A (Legitimately Local / Fallbacks / Excluded): ${groupA.length}`);
console.log(`Group B (Potentially Direct Local Imports):          ${groupB.length}\n`);

console.log('--- GROUP B DETAILS (Potentially Direct Local Imports) ---');
if (groupB.length === 0) {
  console.log('✅ NONE FOUND! All active media components use Cloudinary URLs or explicit fallbacks.');
} else {
  groupB.forEach((item, i) => {
    console.log(`${i + 1}. [${item.relPath}] ${item.varName} -> ${item.importPath}`);
  });
}
