import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const cloudinary = require('c:/Users/Sonia/Desktop/TDV/TheDiveVillage-Backend/server/node_modules/cloudinary').v2;

cloudinary.config({
  cloud_name: 'qvbunv8y',
  api_key: '494533968621116',
  api_secret: 'eZa4bBcDJbsQ3RpEkfJgdWww-vM',
});

async function getAllResources(resourceType) {
  let resources = [];
  let nextCursor = null;

  do {
    try {
      const result = await cloudinary.api.resources({
        resource_type: resourceType,
        max_results: 500,
        next_cursor: nextCursor,
      });
      resources = resources.concat(result.resources);
      nextCursor = result.next_cursor;
    } catch (err) {
      console.error(`Error fetching ${resourceType}:`, err.message);
      break;
    }
  } while (nextCursor);

  return resources;
}

async function run() {
  console.log('Connecting to Cloudinary (cloud_name: qvbunv8y)...');
  const [images, videos, raw] = await Promise.all([
    getAllResources('image'),
    getAllResources('video'),
    getAllResources('raw'),
  ]);

  const all = [
    ...images.map(r => ({ ...r, category: 'image' })),
    ...videos.map(r => ({ ...r, category: 'video' })),
    ...raw.map(r => ({ ...r, category: 'raw' })),
  ];

  console.log(`\n=== TOTAL ASSETS ON CLOUDINARY: ${all.length} ===`);
  console.log(`- Images: ${images.length}`);
  console.log(`- Videos & Audio: ${videos.length}`);
  console.log(`- Raw Files (GLB 3D models, etc.): ${raw.length}`);

  // Calculate total storage
  const totalBytes = all.reduce((acc, it) => acc + (it.bytes || 0), 0);
  console.log(`- Total Storage Used: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);

  // Breakdown by folder
  const folders = {};
  all.forEach(item => {
    const folder = path.dirname(item.public_id).replace(/\\/g, '/');
    folders[folder] = (folders[folder] || 0) + 1;
  });

  console.log('\n=== ASSETS BY FOLDER ===');
  for (const [folder, count] of Object.entries(folders)) {
    console.log(`• ${folder}: ${count} assets`);
  }

  // 1. Group by exact byte size (exact duplicates)
  const bySize = {};
  all.forEach(item => {
    if (item.bytes > 500) {
      if (!bySize[item.bytes]) bySize[item.bytes] = [];
      bySize[item.bytes].push(item);
    }
  });

  const exactDuplicates = Object.entries(bySize).filter(([_, list]) => list.length > 1);

  console.log(`\n======================================================`);
  console.log(`=== EXACT FILE DUPLICATES (SAME BYTES): ${exactDuplicates.length} GROUPS ===`);
  console.log(`======================================================`);
  exactDuplicates.forEach(([bytes, list]) => {
    console.log(`\n[Size: ${(bytes / 1024).toFixed(1)} KB] (${list.length} duplicates):`);
    list.forEach(i => {
      console.log(`   • [${i.resource_type}] ${i.public_id} -> ${i.secure_url}`);
    });
  });

  // 2. Group by same base name / slug across folders
  const byName = {};
  all.forEach(item => {
    const base = path.basename(item.public_id).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!byName[base]) byName[base] = [];
    byName[base].push(item);
  });

  const nameDuplicates = Object.entries(byName).filter(([_, list]) => list.length > 1);

  console.log(`\n======================================================`);
  console.log(`=== DUPLICATES BY NAME / SLUG ACROSS FOLDERS: ${nameDuplicates.length} GROUPS ===`);
  console.log(`======================================================`);
  nameDuplicates.forEach(([name, list]) => {
    console.log(`\n[Base name: "${name}"] (${list.length} files):`);
    list.forEach(i => {
      console.log(`   • [${i.resource_type}] ${i.public_id} (${(i.bytes / 1024).toFixed(1)} KB) -> ${i.secure_url}`);
    });
  });

  // Save full JSON inventory
  const jsonReportPath = path.resolve('TheDiveVillage-Frontend/cloudinary_full_inventory.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalAssets: all.length,
    totalStorageMB: (totalBytes / (1024 * 1024)).toFixed(2),
    folderCounts: folders,
    exactDuplicatesCount: exactDuplicates.length,
    exactDuplicates: exactDuplicates.map(([bytes, list]) => ({
      sizeKB: (bytes / 1024).toFixed(1),
      assets: list.map(l => ({ public_id: l.public_id, type: l.resource_type, url: l.secure_url }))
    })),
    nameDuplicatesCount: nameDuplicates.length,
    nameDuplicates: nameDuplicates.map(([name, list]) => ({
      name,
      assets: list.map(l => ({ public_id: l.public_id, type: l.resource_type, url: l.secure_url, bytes: l.bytes }))
    })),
    allAssets: all.map(a => ({
      public_id: a.public_id,
      format: a.format,
      resource_type: a.resource_type,
      bytes: a.bytes,
      created_at: a.created_at,
      secure_url: a.secure_url
    }))
  }, null, 2));

  console.log(`\n✅ Full inventory report generated at: ${jsonReportPath}`);
}

run();
