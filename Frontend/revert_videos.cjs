const fs = require('fs');
const path = require('path');

const servicesDataPath = path.join(__dirname, 'src', 'data', 'servicesData.js');
let servicesData = fs.readFileSync(servicesDataPath, 'utf8');

const mediaDir = path.join(__dirname, 'src', 'assets', 'Media');

// Helper to recursively find a file
function findFile(dir, searchName) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            const result = findFile(fullPath, searchName);
            if (result) return result;
        } else if (file.toLowerCase().endsWith('.mp4')) {
            // Strip out non-alphanumeric chars for loose matching
            const cleanFile = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanSearch = searchName.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cleanFile === cleanSearch || cleanFile.includes(cleanSearch) || cleanSearch.includes(cleanFile)) {
                return fullPath;
            }
        }
    }
    return null;
}

// Find all Cloudinary constants
const regex = /const (vid[a-zA-Z0-9_]+)\s*=\s*'https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/[^/]+\/TDV-Media\/([^']+)\.mp4';/g;
let match;
let count = 0;
while ((match = regex.exec(servicesData)) !== null) {
    const varName = match[1];
    let fileName = match[2];
    
    // Cloudinary names often have underscores instead of spaces
    fileName = fileName.replace(/_/g, ' ');

    let foundPath = findFile(mediaDir, fileName);
    if (!foundPath) {
        console.warn(`Could not find local file for ${fileName}`);
        continue;
    }

    // Convert absolute path to relative path for the import
    const relativePath = path.relative(path.join(__dirname, 'src', 'data'), foundPath).replace(/\\/g, '/');
    
    const importStatement = `import ${varName} from '${relativePath}'`;
    
    // Replace the const with the import in the file content
    servicesData = servicesData.replace(match[0], importStatement);
    count++;
}

fs.writeFileSync(servicesDataPath, servicesData, 'utf8');
console.log(`Reverted ${count} video links back to local imports in servicesData.js`);
