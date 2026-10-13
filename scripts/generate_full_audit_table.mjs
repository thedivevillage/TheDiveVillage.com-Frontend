import fs from 'fs';
import path from 'path';

const audit = JSON.parse(fs.readFileSync('./scripts/full_video_audit_results.json', 'utf8'));

console.log(`\n================================================================`);
console.log(`COMPLETE TDV VIDEO ASSET INVENTORY & AUDIT REPORT`);
console.log(`================================================================\n`);

console.log(`Total Video Assets in Assets Directory: ${audit.length}`);
const totalBytes = audit.reduce((acc, a) => acc + a.sizeBytes, 0);
console.log(`Total Raw Video Footprint: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB (${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB)\n`);

const referenced = audit.filter(a => a.isReferenced);
const unreferenced = audit.filter(a => !a.isReferenced);

const refBytes = referenced.reduce((acc, a) => acc + a.sizeBytes, 0);
const unrefBytes = unreferenced.reduce((acc, a) => acc + a.sizeBytes, 0);

console.log(`Referenced Video Assets: ${referenced.length} (${(refBytes / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`Unreferenced / Dead Weight Video Assets: ${unreferenced.length} (${(unrefBytes / (1024 * 1024)).toFixed(2)} MB)\n`);

// Groupings:
// 1. 360 Three.js Background Videos
// 2. Standard 2D Gallery / Promo Videos
// 3. UI / Functional Videos (preloader, cursor)
// 4. Unreferenced Video Assets

const threeD360 = audit.filter(a => ['Hero_fast.mp4', 'Hero(1).mp4', 'Hero_optimized.mp4', 'Book_fast.mp4', 'Book(2).mp4', 'Diving(1).mp4', 'Turtle_fast.mp4', 'Turtle Anna.mp4', 'Turtle Anna(1).mp4', 'nightdive_fast.mp4', 'nightdive.mp4'].includes(a.filename));
const uiFunctional = audit.filter(a => ['preloader.mp4', 'cursor.webm'].includes(a.filename));
const gallery2D = audit.filter(a => a.isReferenced && !threeD360.includes(a) && !uiFunctional.includes(a));
const unrefList = audit.filter(a => !a.isReferenced);

console.log('--- 1. 360 THREE.JS SPHERE BACKGROUND VIDEOS ---');
threeD360.forEach(v => {
  console.log(`• ${v.filename.padEnd(22)} | Size: ${(v.sizeMB + ' MB').padEnd(10)} | Res: ${(v.meta.width + 'x' + v.meta.height).padEnd(11)} | Codec: ${(v.meta.codec || 'N/A').padEnd(14)} | Dur: ${(v.meta.durationSec + 's').padEnd(7)} | Ref: ${v.isReferenced ? 'YES (' + v.components + ')' : 'NO'}`);
});

console.log('\n--- 2. UI & ANIMATION VIDEOS (ABOVE-THE-FOLD / CRITICAL) ---');
uiFunctional.forEach(v => {
  console.log(`• ${v.filename.padEnd(22)} | Size: ${(v.sizeMB + ' MB').padEnd(10)} | Res: ${(v.meta.width + 'x' + v.meta.height).padEnd(11)} | Codec: ${(v.meta.codec || 'N/A').padEnd(14)} | Dur: ${(v.meta.durationSec + 's').padEnd(7)} | Ref: ${v.isReferenced ? 'YES (' + v.components + ')' : 'NO'}`);
});

console.log('\n--- 3. 2D GALLERY & SHOWCASE VIDEOS (LAZY-LOADED) ---');
gallery2D.forEach(v => {
  console.log(`• ${v.filename.padEnd(48)} | Size: ${(v.sizeMB + ' MB').padEnd(10)} | Res: ${(v.meta.width + 'x' + v.meta.height).padEnd(11)} | Codec: ${(v.meta.codec || 'N/A').padEnd(14)} | Dur: ${(v.meta.durationSec + 's').padEnd(7)} | Ref: YES (${v.components})`);
});

console.log('\n--- 4. UNREFERENCED / ORPHANED VIDEO ASSETS IN ASSETS FOLDER ---');
unrefList.forEach(v => {
  console.log(`• ${v.filename.padEnd(35)} | Size: ${(v.sizeMB + ' MB').padEnd(10)} | Res: ${(v.meta.width + 'x' + v.meta.height).padEnd(11)} | Codec: ${(v.meta.codec || 'N/A').padEnd(14)} | Dur: ${(v.meta.durationSec + 's').padEnd(7)}`);
});
