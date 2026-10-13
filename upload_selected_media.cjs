const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const cloudinary = require('cloudinary').v2;

// 1. Load credentials from TheDiveVillage-Backend/.env
const envPath = path.resolve(__dirname, '../TheDiveVillage-Backend/.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: Could not find .env file at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log('Using Cloudinary Account:', env.CLOUDINARY_CLOUD_NAME);

// 2. Target Folders ONLY
const mediaRoot = path.resolve(__dirname, 'Frontend/src/assets/Media');
const targetFolders = ['Extras for Gallery', 'Products', 'Services'];

const mappingFiles = [
  path.resolve(__dirname, '../cloudinary_mapping.json'),
  path.resolve(__dirname, 'Frontend/cloudinary_mapping.json')
];

let mapping = {};
if (fs.existsSync(mappingFiles[0])) {
  try {
    mapping = JSON.parse(fs.readFileSync(mappingFiles[0], 'utf8'));
  } catch (e) {
    mapping = {};
  }
}

function saveMapping() {
  const jsonStr = JSON.stringify(mapping, null, 2);
  for (const mf of mappingFiles) {
    fs.writeFileSync(mf, jsonStr, 'utf8');
  }
}

// 3. Collect files
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

let allFiles = [];
for (const folder of targetFolders) {
  const fullFolder = path.join(mediaRoot, folder);
  if (fs.existsSync(fullFolder)) {
    allFiles = allFiles.concat(getFiles(fullFolder));
  }
}

// Filter supported media files
const validExts = new Set(['.mp4', '.mov', '.m4v', '.jpg', '.jpeg', '.png', '.webp', '.glb', '.gltf']);
allFiles = allFiles.filter(f => validExts.has(path.extname(f).toLowerCase()));

console.log(`Found total ${allFiles.length} media files across target folders.`);

// 4. Upload helper functions
async function uploadFile(filePath, index, total) {
  const relPath = path.relative(mediaRoot, filePath).replace(/\\/g, '/');
  const ext = path.extname(filePath).toLowerCase();
  
  if (mapping[relPath]) {
    console.log(`[${index + 1}/${total}] Skipping (already mapped): ${relPath}`);
    return;
  }

  // Determine Cloudinary folder and resource type
  const folderParts = relPath.split('/');
  folderParts.pop(); // remove filename
  const cloudinaryFolder = 'TDV-Media/' + folderParts.join('/');
  
  const isVideo = ['.mp4', '.mov', '.m4v'].includes(ext);
  const is3D = ['.glb', '.gltf'].includes(ext);
  const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);

  let uploadPath = filePath;
  let tempCompressedPath = null;

  try {
    // If it's a 3D model > 10MB, compress it first so Cloudinary accepts raw upload
    if (is3D) {
      const stats = fs.statSync(filePath);
      if (stats.size > 10 * 1024 * 1024) {
        console.log(`[${index + 1}/${total}] Compressing large 3D model: ${path.basename(filePath)} (${(stats.size / 1024 / 1024).toFixed(1)}MB)...`);
        tempCompressedPath = filePath + '.opt.glb';
        execSync(`npx -y @gltf-transform/cli@latest optimize "${filePath}" "${tempCompressedPath}" --compress draco --texture-compress webp`, { stdio: 'pipe' });
        // Also update original file with the compressed version
        fs.copyFileSync(tempCompressedPath, filePath);
        uploadPath = filePath;
        if (fs.existsSync(tempCompressedPath)) fs.unlinkSync(tempCompressedPath);
        console.log(`[${index + 1}/${total}] Compressed to ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(1)}MB.`);
      }
    }

    console.log(`[${index + 1}/${total}] Uploading: ${relPath}...`);

    let result;
    if (isVideo) {
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(uploadPath, {
          resource_type: 'video',
          folder: cloudinaryFolder,
          use_filename: true,
          unique_filename: false,
          chunk_size: 6000000,
          timeout: 240000
        }, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
    } else if (is3D) {
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(uploadPath, {
          resource_type: 'raw',
          folder: cloudinaryFolder,
          use_filename: true,
          unique_filename: false,
          overwrite: true
        }, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
    } else if (isImage) {
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(uploadPath, {
          resource_type: 'image',
          folder: cloudinaryFolder,
          use_filename: true,
          unique_filename: false,
          overwrite: true
        }, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
    }

    if (result && result.secure_url) {
      mapping[relPath] = result.secure_url;
      saveMapping();
      console.log(`[${index + 1}/${total}] SUCCESS: ${result.secure_url}`);
    } else {
      console.error(`[${index + 1}/${total}] FAILED: No secure_url returned for ${relPath}`);
    }
  } catch (err) {
    console.error(`[${index + 1}/${total}] ERROR uploading ${relPath}:`, err.message || err);
  } finally {
    if (tempCompressedPath && fs.existsSync(tempCompressedPath)) {
      try { fs.unlinkSync(tempCompressedPath); } catch (_) {}
    }
  }
}

async function main() {
  console.log(`Starting upload process for ${allFiles.length} files...`);
  for (let i = 0; i < allFiles.length; i++) {
    await uploadFile(allFiles[i], i, allFiles.length);
  }
  console.log('\n--- UPLOAD FINISHED ---');
  console.log(`Total mapped URLs: ${Object.keys(mapping).length}`);
}

main();
