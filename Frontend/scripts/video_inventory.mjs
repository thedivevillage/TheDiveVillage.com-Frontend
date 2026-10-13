import fs from 'fs';
import path from 'path';

const srcDir = './src';
const assetDir = './src/assets';

// 1. Find all video files on disk
function getDiskVideos(dir) {
  let list = [];
  const entries = fs.readdirSync(dir);
  for (const e of entries) {
    const full = path.join(dir, e);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      list = list.concat(getDiskVideos(full));
    } else {
      const ext = path.extname(e).toLowerCase();
      if (['.mp4', '.mov', '.webm', '.mkv'].includes(ext)) {
        list.push({
          filename: e,
          relPath: full.replace(/\\/g, '/'),
          sizeBytes: stat.size,
          sizeMB: (stat.size / (1024 * 1024)).toFixed(2)
        });
      }
    }
  }
  return list;
}

const diskVideos = getDiskVideos(assetDir);

// 2. Scan all codebase files for video references
const usages = {};
function scanCodebase(dir) {
  const entries = fs.readdirSync(dir);
  for (const e of entries) {
    const full = path.join(dir, e);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanCodebase(full);
    } else if (/\.(jsx?|tsx?|css|html|json)$/.test(e)) {
      const content = fs.readFileSync(full, 'utf8');
      // Look for import or string matching video extensions
      const regex = /['"]([^'"]+?\.(?:mp4|MP4|mov|MOV|webm|WEBM))['"]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const raw = match[1];
        const base = path.basename(raw);
        if (!usages[base]) usages[base] = [];
        usages[base].push({
          sourceFile: full.replace(/\\/g, '/'),
          rawReference: raw
        });
      }
    }
  }
}

scanCodebase(srcDir);

// 3. Classify videos
const inventory = diskVideos.map(v => {
  const refList = usages[v.filename] || [];
  const isReferenced = refList.length > 0;
  
  // Identify role
  let role = 'Unreferenced Asset';
  let is360 = false;
  let isAboveFold = false;
  let isLazy = true;

  if (v.filename === 'Hero_fast.mp4' || v.filename === 'Hero(1).mp4' || v.filename === 'Hero_optimized.mp4') {
    role = 'Homepage Hero 360 Video Background';
    is360 = true;
    isAboveFold = true;
    isLazy = false;
  } else if (v.filename === 'Diving(1).mp4') {
    role = 'About Page 360 Video Background & Shop Promo';
    is360 = true;
    isAboveFold = false;
    isLazy = true;
  } else if (v.filename === 'Book_fast.mp4' || v.filename === 'Book(2).mp4') {
    role = 'Contact Page / BookUs 360 Video Background';
    is360 = true;
    isAboveFold = false;
    isLazy = true;
  } else if (v.filename === 'Turtle_fast.mp4' || v.filename === 'Turtle Anna(1).mp4' || v.filename === 'Turtle Anna.mp4') {
    role = 'Gallery / Day Dive 360 Background';
    is360 = true;
    isAboveFold = false;
    isLazy = true;
  } else if (v.filename === 'nightdive_fast.mp4' || v.filename === 'nightdive.mp4') {
    role = 'Night Dive 360 Video Background';
    is360 = true;
    isAboveFold = false;
    isLazy = true;
  } else if (v.filename === '2.mp4') {
    role = 'Services / Login background video';
    is360 = false;
    isAboveFold = false;
    isLazy = true;
  } else if (v.filename === 'cursor.webm') {
    role = 'Custom Cursor Animation';
    is360 = false;
    isAboveFold = true;
    isLazy = false;
  } else if (v.filename === 'preloader.mp4') {
    role = 'App Preloader Animation';
    is360 = false;
    isAboveFold = true;
    isLazy = false;
  } else if (v.relPath.includes('New folder')) {
    role = 'Gallery / Experience Showcase Video';
    is360 = false;
    isAboveFold = false;
    isLazy = true;
  }

  return {
    ...v,
    isReferenced,
    references: refList,
    role,
    is360,
    isAboveFold,
    isLazy
  };
});

console.log('Total Disk Videos:', diskVideos.length);
console.log('Total Referenced Videos:', inventory.filter(i => i.isReferenced).length);
console.log('Total Unreferenced Videos:', inventory.filter(i => !i.isReferenced).length);

const totalDiskBytes = diskVideos.reduce((acc, v) => acc + v.sizeBytes, 0);
const totalRefBytes = inventory.filter(i => i.isReferenced).reduce((acc, v) => acc + v.sizeBytes, 0);

console.log(`Total Disk Size: ${(totalDiskBytes / (1024*1024)).toFixed(2)} MB`);
console.log(`Total Active Ref Size: ${(totalRefBytes / (1024*1024)).toFixed(2)} MB`);

fs.writeFileSync('./scripts/video_inventory.json', JSON.stringify(inventory, null, 2));
console.log('Saved inventory to ./scripts/video_inventory.json');
