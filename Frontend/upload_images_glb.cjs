const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'qvbunv8y', 
  api_key: '494533968621116', 
  api_secret: 'eZa4bBcDJbsQ3RpEkfJgdWww-vM',
  secure: true
});

const mediaDir = path.join(__dirname, 'src', 'assets');
const mappingFile = path.join(__dirname, 'cloudinary_links.json');
let mappings = {};
if (fs.existsSync(mappingFile)) {
    mappings = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
}

async function uploadFile(filePath, isGlb) {
    const fileName = path.basename(filePath);
    console.log(`Uploading ${fileName}...`);
    
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: isGlb ? 'TDV-3D' : 'TDV-Images',
            resource_type: isGlb ? 'raw' : 'image', // Must be 'raw' for glb files on Cloudinary!
            use_filename: true,
            unique_filename: false,
            overwrite: true
        });
        
        console.log(`Success: ${result.secure_url}`);
        mappings[filePath] = result.secure_url;
        fs.writeFileSync(mappingFile, JSON.stringify(mappings, null, 2));
    } catch (err) {
        console.error(`Failed to upload ${fileName}:`, err.message);
    }
}

async function scanAndUpload(dir) {
    const list = fs.readdirSync(dir);
    for (let file of list) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await scanAndUpload(fullPath);
        } else {
            const isGlb = fullPath.endsWith('.glb');
            
            // We only need to retry GLB files since images succeeded
            if (isGlb) {
                if (!mappings[fullPath]) {
                    await uploadFile(fullPath, isGlb);
                }
            }
        }
    }
}

scanAndUpload(mediaDir).then(() => {
    console.log('\nAll missing GLB files have been uploaded to Cloudinary!');
});
