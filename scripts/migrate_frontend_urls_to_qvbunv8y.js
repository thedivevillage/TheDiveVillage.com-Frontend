import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../Frontend/src');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // Regex replacing ONLY the cloud name segment of Cloudinary URLs
  const regex = /https:\/\/res\.cloudinary\.com\/bbgt5nk7\//g;
  
  if (regex.test(content)) {
    const matches = content.match(regex) || [];
    changes = matches.length;
    const updated = content.replace(regex, 'https://res.cloudinary.com/qvbunv8y/');
    fs.writeFileSync(filePath, updated, 'utf8');
  }

  return changes;
}

function walkDir(dir) {
  let fileCount = 0;
  let totalReplacements = 0;
  const changedFiles = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = walkDir(fullPath);
      fileCount += sub.fileCount;
      totalReplacements += sub.totalReplacements;
      changedFiles.push(...sub.changedFiles);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx|json|css|html)$/.test(entry.name)) {
      fileCount++;
      const repCount = replaceInFile(fullPath);
      if (repCount > 0) {
        totalReplacements += repCount;
        changedFiles.push({ file: path.relative(srcDir, fullPath), replacements: repCount });
      }
    }
  }

  return { fileCount, totalReplacements, changedFiles };
}

console.log('🚀 [Frontend URL Migration] Replacing bbgt5nk7 -> qvbunv8y across Frontend/src...\n');
const result = walkDir(srcDir);

console.log(`\n======================================================`);
console.log(`✅ FRONTEND MIGRATION COMPLETE:`);
console.log(`   - Files Scanned: ${result.fileCount}`);
console.log(`   - Files Modified: ${result.changedFiles.length}`);
console.log(`   - Total URL Replacements: ${result.totalReplacements}`);
console.log(`\nModified Files:`);
result.changedFiles.forEach((f, idx) => {
  console.log(`   ${idx + 1}. ${f.file} (${f.replacements} URL references)`);
});
console.log(`======================================================\n`);
