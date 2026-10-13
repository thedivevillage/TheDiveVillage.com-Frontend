const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const directoryPath = path.join(__dirname, 'src', 'assets');
const SIZE_LIMIT = 2 * 1024 * 1024; // 2 MB

async function compressImage(filePath) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size > SIZE_LIMIT) {
            console.log(`Compressing ${path.basename(filePath)} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)...`);
            
            const tempFilePath = filePath + '.tmp';
            
            // If it's a JPG or JPEG
            if (filePath.match(/\.jpe?g$/i)) {
                await sharp(filePath)
                    .resize({ width: 1920, withoutEnlargement: true })
                    .jpeg({ quality: 75, progressive: true })
                    .toFile(tempFilePath);
            } 
            // If it's a PNG
            else if (filePath.match(/\.png$/i)) {
                await sharp(filePath)
                    .resize({ width: 1920, withoutEnlargement: true })
                    .png({ quality: 75, compressionLevel: 8 })
                    .toFile(tempFilePath);
            }
            else {
                return; // skip other formats for now
            }
            
            // Replace original with compressed version
            fs.renameSync(tempFilePath, filePath);
            
            const newStats = fs.statSync(filePath);
            console.log(` -> Done! New size: ${(newStats.size / (1024 * 1024)).toFixed(2)} MB`);
        }
    } catch (error) {
        console.error(`Failed to compress ${filePath}:`, error);
    }
}

async function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await scanDirectory(fullPath);
        } else if (fullPath.match(/\.(jpe?g|png)$/i)) {
            await compressImage(fullPath);
        }
    }
}

scanDirectory(directoryPath).then(() => {
    console.log("All large images have been compressed!");
});
