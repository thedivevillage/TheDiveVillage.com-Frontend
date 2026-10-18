const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'qvbunv8y',
  api_key: '494533968621116',
  api_secret: 'eZa4bBcDJbsQ3RpEkfJgdWww-vM',
  secure: true
});

const mappingFilePath = path.resolve(__dirname, 'cloudinary_image_mapping.json');
let mapping = {};
if (fs.existsSync(mappingFilePath)) {
  try {
    mapping = JSON.parse(fs.readFileSync(mappingFilePath, 'utf8'));
  } catch (e) {
    mapping = {};
  }
}

function saveMapping() {
  fs.writeFileSync(mappingFilePath, JSON.stringify(mapping, null, 2), 'utf8');
}

function getFiles(dir, exts = ['.webp', '.png', '.jpg', '.jpeg', '.gif']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getFiles(full, exts));
    } else if (exts.includes(path.extname(item.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

// Target Directories
const workspaceRoot = __dirname;
const frontendRoot = path.join(workspaceRoot, 'Frontend');

const targetFolders = [
  {
    dir: path.join(frontendRoot, 'public/media/thumbnails'),
    cloudinaryFolder: 'TDV-Media/thumbnails',
    urlPrefix: '/media/thumbnails/'
  },
  {
    dir: path.join(frontendRoot, 'src/assets/Media/done'),
    cloudinaryFolder: 'TDV-Media/Products/done',
    importPrefix: '../assets/Media/done/'
  },
  {
    dir: path.join(frontendRoot, 'src/assets/Media/Cap'),
    cloudinaryFolder: 'TDV-Media/Products/Cap',
    importPrefix: '../assets/Media/Cap/'
  },
  {
    dir: path.join(frontendRoot, 'src/assets'),
    recursive: false,
    cloudinaryFolder: 'TDV-Media/UI',
    importPrefix: '../assets/'
  },
  {
    dir: path.join(frontendRoot, 'public/media/TDV-Media/AirportToAirport'),
    cloudinaryFolder: 'TDV-Media/AirportToAirport',
    urlPrefix: '/media/TDV-Media/AirportToAirport/'
  },
  {
    dir: path.join(frontendRoot, 'public/media/TDV-Media/Extras for Gallery/posters'),
    cloudinaryFolder: 'TDV-Media/Extras for Gallery/posters',
    urlPrefix: '/media/TDV-Media/Extras for Gallery/posters/'
  }
];

let tasks = [];

for (const group of targetFolders) {
  if (!fs.existsSync(group.dir)) continue;
  let files;
  if (group.recursive === false) {
    files = fs.readdirSync(group.dir, { withFileTypes: true })
      .filter(item => item.isFile() && ['.webp', '.png', '.jpg', '.jpeg'].includes(path.extname(item.name).toLowerCase()))
      .map(item => path.join(group.dir, item.name));
  } else {
    files = getFiles(group.dir);
  }

  for (const f of files) {
    const filename = path.basename(f);
    const relToGroup = path.relative(group.dir, f).replace(/\\/g, '/');
    let subfolder = group.cloudinaryFolder;
    const dirname = path.dirname(relToGroup);
    if (dirname && dirname !== '.') {
      subfolder = `${group.cloudinaryFolder}/${dirname}`;
    }

    let matchKeys = [];
    if (group.urlPrefix) {
      matchKeys.push(`${group.urlPrefix}${relToGroup}`);
    }
    if (group.importPrefix) {
      matchKeys.push(`${group.importPrefix}${relToGroup}`);
    }
    matchKeys.push(relToGroup);
    matchKeys.push(filename);

    tasks.push({
      filePath: f,
      folder: subfolder,
      filename,
      matchKeys
    });
  }
}

console.log(`Prepared ${tasks.length} images to upload to Cloudinary.`);

async function uploadSingle(task, idx, total) {
  const normPath = task.filePath.replace(/\\/g, '/');
  if (mapping[normPath]) {
    console.log(`[${idx + 1}/${total}] Already uploaded: ${path.basename(task.filePath)} -> ${mapping[normPath]}`);
    return;
  }

  console.log(`[${idx + 1}/${total}] Uploading ${path.basename(task.filePath)} to ${task.folder}...`);

  try {
    const res = await cloudinary.uploader.upload(task.filePath, {
      folder: task.folder,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      resource_type: 'image'
    });

    if (res && res.secure_url) {
      mapping[normPath] = res.secure_url;
      for (const k of task.matchKeys) {
        mapping[k] = res.secure_url;
      }
      saveMapping();
      console.log(`  ✓ SUCCESS: ${res.secure_url}`);
    } else {
      console.error(`  ✗ NO URL returned for ${task.filePath}`);
    }
  } catch (err) {
    console.error(`  ✗ ERROR uploading ${task.filePath}:`, err.message || err);
  }
}

async function run() {
  for (let i = 0; i < tasks.length; i++) {
    await uploadSingle(tasks[i], i, tasks.length);
  }
  console.log('\n=== CLOUDINARY UPLOAD COMPLETED ===');
  console.log(`Total mapped image items: ${Object.keys(mapping).length}`);
}

run();
