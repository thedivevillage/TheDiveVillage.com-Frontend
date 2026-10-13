import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// 1. Gather all Cloudinary URLs from all manifests and codebases
const manifests = [
  path.resolve(rootDir, 'TheDiveVillage-Frontend/Frontend/cloudinary_links.json'),
  path.resolve(rootDir, 'TheDiveVillage-Backend/server/scripts/unified_migration_manifest.json'),
  path.resolve(rootDir, 'TheDiveVillage-Backend/server/scripts/cloudinary-migration-report.json'),
  path.resolve(rootDir, 'TheDiveVillage-Backend/server/scripts/bbgt5nk7_url_mapping.json'),
  path.resolve(rootDir, 'TheDiveVillage-Frontend/Frontend/src/data/cloudinaryVideoMap.json'),
];

let allCloudinaryEntries = [];
let allCloudinaryNames = new Set();
let allCloudinaryUrls = [];

manifests.forEach(m => {
  if (fs.existsSync(m)) {
    try {
      const data = JSON.parse(fs.readFileSync(m, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach(item => {
          const fn = item.filename || item.originalItem || item.publicId || '';
          const url = item.destinationUrl || item.cloudinaryAsset || item.sourceUrl || item.secure_url || item.url || '';
          if (fn) allCloudinaryNames.add(path.basename(fn).toLowerCase());
          if (url) {
            allCloudinaryUrls.push(url);
            allCloudinaryNames.add(path.basename(url).toLowerCase());
          }
        });
      } else {
        Object.entries(data).forEach(([k, v]) => {
          allCloudinaryNames.add(path.basename(k).toLowerCase());
          if (typeof v === 'string') {
            allCloudinaryUrls.push(v);
            allCloudinaryNames.add(path.basename(v).toLowerCase());
          }
        });
      }
    } catch (e) {}
  }
});

// Also scan backend and frontend files for any res.cloudinary.com URLs
function scanDirForUrls(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      scanDirForUrls(full);
    } else if (/\.(js|jsx|ts|tsx|json|sql|prisma)$/.test(item.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.match(/https:\/\/res\.cloudinary\.com\/[^\s'"`\\]+/g);
      if (matches) {
        matches.forEach(u => {
          allCloudinaryUrls.push(u);
          const base = path.basename(u).toLowerCase();
          allCloudinaryNames.add(base);
          // also strip extension / format
          allCloudinaryNames.add(base.replace(/\.[^.]+$/, ''));
        });
      }
    }
  }
}

scanDirForUrls(path.resolve(rootDir, 'TheDiveVillage-Frontend'));
scanDirForUrls(path.resolve(rootDir, 'TheDiveVillage-Backend'));

// Now inspect all unique local references imported in Frontend
const srcDir = path.resolve(rootDir, 'TheDiveVillage-Frontend/Frontend/src');
function getSrcFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getSrcFiles(full));
    } else if (/\.(js|jsx|ts|tsx)$/.test(item.name)) {
      results.push(full);
    }
  }
  return results;
}

const importRegex = /import\s+([\w$]+)\s+from\s+['"]([^'"]+\.(mp4|mov|webm|m4v|jpg|jpeg|png|webp|glb|mp3|svg|ico))['"]/g;
const localImports = new Map(); // assetPath -> Array<{file, varName}>

getSrcFiles(srcDir).forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(srcDir, file).replace(/\\/g, '/');
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const assetPath = match[2];
    const absAsset = path.resolve(path.dirname(file), assetPath);
    if (!localImports.has(absAsset)) {
      localImports.set(absAsset, {
        rawPath: assetPath,
        baseName: path.basename(assetPath),
        occurrences: []
      });
    }
    localImports.get(absAsset).occurrences.push({ file: relFile, varName: match[1] });
  }
});

console.log(`=======================================================`);
console.log(`CROSS-CHECKING ${localImports.size} UNIQUE LOCAL ASSETS WITH CLOUDINARY`);
console.log(`=======================================================\n`);

const uploaded = [];
const missing = [];

for (const [absPath, info] of localImports.entries()) {
  const base = info.baseName.toLowerCase();
  const baseNoExt = base.replace(/\.[^.]+$/, '');
  const cleanBase = baseNoExt.replace(/[^a-z0-9]/gi, '_');

  // Check if matches any cloudinary name/url
  let foundUrl = null;
  for (const u of allCloudinaryUrls) {
    const uBase = path.basename(u).toLowerCase();
    const uBaseNoExt = uBase.replace(/\.[^.]+$/, '');
    if (uBase === base || uBaseNoExt === baseNoExt || uBaseNoExt === cleanBase || u.toLowerCase().includes('/' + cleanBase)) {
      foundUrl = u;
      break;
    }
  }

  // Also check direct match in cloudinary_links.json keys
  if (!foundUrl) {
    const directMapPath = path.resolve(rootDir, 'TheDiveVillage-Frontend/Frontend/cloudinary_links.json');
    if (fs.existsSync(directMapPath)) {
      const dMap = JSON.parse(fs.readFileSync(directMapPath, 'utf8'));
      for (const [k, v] of Object.entries(dMap)) {
        if (path.normalize(k).toLowerCase() === absPath.toLowerCase() || path.basename(k).toLowerCase() === base) {
          foundUrl = v;
          break;
        }
      }
    }
  }

  if (foundUrl) {
    uploaded.push({ ...info, absPath, foundUrl });
  } else {
    missing.push({ ...info, absPath });
  }
}

console.log(`✅ UPLOADED TO CLOUDINARY (${uploaded.length}):`);
uploaded.forEach(item => {
  console.log(`• ${item.baseName} (${item.occurrences.length} refs)`);
  console.log(`  Cloudinary: ${item.foundUrl}`);
});

console.log(`\n❌ NOT FOUND ON CLOUDINARY / MISSING (${missing.length}):`);
missing.forEach(item => {
  console.log(`• ${item.baseName} [used in: ${item.occurrences.map(o => o.file).join(', ')}]`);
  console.log(`  Path: ${item.absPath}`);
});
