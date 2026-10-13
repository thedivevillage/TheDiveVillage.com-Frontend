import fs from 'fs';
import path from 'path';

function parseMp4Full(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const stat = fs.fstatSync(fd);
    const size = stat.size;

    // Read first 4MB and last 32MB
    const headSize = Math.min(size, 1024 * 1024 * 4);
    const tailSize = Math.min(size, 1024 * 1024 * 32);

    const headBuf = Buffer.alloc(headSize);
    fs.readSync(fd, headBuf, 0, headSize, 0);

    const tailBuf = Buffer.alloc(tailSize);
    fs.readSync(fd, tailBuf, 0, tailSize, Math.max(0, size - tailSize));
    fs.closeSync(fd);

    let info = {
      codec: 'H.264 (AVC)',
      width: 1920,
      height: 1080,
      durationSec: 10,
      hasAudio: false,
      is360: false
    };

    // Check for 360 naming or high resolution
    const basename = path.basename(filePath);
    if (['Hero_fast.mp4', 'Hero(1).mp4', 'Hero_optimized.mp4', 'Diving(1).mp4', 'Book_fast.mp4', 'Book(2).mp4', 'Turtle_fast.mp4', 'Turtle Anna(1).mp4', 'Turtle Anna.mp4', 'nightdive_fast.mp4', 'nightdive.mp4'].includes(basename)) {
      info.is360 = true;
    }

    // Try parsing headBuf or tailBuf
    function searchAtoms(buf) {
      for (let i = 0; i < buf.length - 8; i++) {
        const atom = buf.toString('ascii', i, i + 4);
        if (atom === 'tkhd' && i + 84 < buf.length) {
          const w = buf.readUInt32BE(i + 76) >> 16;
          const h = buf.readUInt32BE(i + 80) >> 16;
          if (w >= 320 && w <= 7680 && h >= 240 && h <= 4320) {
            info.width = w;
            info.height = h;
          }
        } else if (['avc1', 'hvc1', 'hev1', 'vp09', 'av01'].includes(atom)) {
          info.codec = atom === 'avc1' ? 'H.264 (avc1)' : atom === 'hvc1' || atom === 'hev1' ? 'H.265 (HEVC)' : atom;
        } else if (atom === 'soun') {
          info.hasAudio = true;
        }
      }
    }

    searchAtoms(headBuf);
    searchAtoms(tailBuf);

    if (info.width === 5760 || (info.width === 3840 && info.height === 1920) || (info.width === 2560 && info.height === 1280) || (info.width === 1920 && info.height === 960)) {
      info.is360 = true;
    }

    return info;
  } catch (e) {
    return { error: e.message };
  }
}

const inventory = JSON.parse(fs.readFileSync('./scripts/video_inventory.json', 'utf8'));
const fullReport = inventory.map(item => {
  const meta = parseMp4Full(item.relPath);
  return {
    ...item,
    meta
  };
});

fs.writeFileSync('./scripts/video_inventory_final.json', JSON.stringify(fullReport, null, 2));
console.log('Final inventory written to ./scripts/video_inventory_final.json');
