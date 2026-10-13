const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = path.join(__dirname, 'src', 'assets', 'Media', 'Products', 'TDV - 3D Product Files');

const files = fs.readdirSync(dir);

for (const file of files) {
    if (file.endsWith('.glb') && !file.includes('compressed')) {
        const fullPath = path.join(dir, file);
        const tempPath = fullPath + '.tmp';
        
        console.log(`Compressing ${file}...`);
        try {
            // Run gltf-transform optimize
            execSync(`npx -y @gltf-transform/cli@latest optimize "${fullPath}" "${tempPath}" --compress draco --texture-compress webp`, { stdio: 'inherit' });
            
            // Overwrite original file
            if (fs.existsSync(tempPath)) {
                fs.renameSync(tempPath, fullPath);
                console.log(`Successfully compressed ${file}!`);
            }
        } catch (error) {
            console.error(`Failed to compress ${file}:`, error.message);
        }
    }
}
console.log('All 3D models compressed!');
