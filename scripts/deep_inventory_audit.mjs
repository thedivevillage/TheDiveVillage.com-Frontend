import fs from 'fs';
import path from 'path';

// Video files directory
const assetsDir = path.resolve('c:/Users/lenovo-1/Documents/GitHub/TheDiveVillage/TheDiveVillage-Frontend/Frontend/src/assets');
const srcDir = path.resolve('c:/Users/lenovo-1/Documents/GitHub/TheDiveVillage/TheDiveVillage-Frontend/Frontend/src');

function getAllFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else if (exts.some(ext => item.name.toLowerCase().endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

// Quick atom parser for MP4 / MOV
function parseMp4Details(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const stat = fs.fstatSync(fd);
    // Read up to first 32MB to capture moov box
    const buffer = Buffer.alloc(Math.min(stat.size, 1024 * 1024 * 32));
    fs.readSync(fd, buffer, 0, buffer.length, 0);
    fs.closeSync(fd);

    let info = {
      codec: 'Unknown',
      width: 0,
      height: 0,
      fps: 30,
      durationSec: 0,
      hasAudio: false,
      is360: false,
      aspectRatio: '0:0'
    };

    function readBox(start, maxLen) {
      let cur = start;
      while (cur + 8 <= maxLen) {
        let size = buffer.readUInt32BE(cur);
        const type = buffer.toString('ascii', cur + 4, cur + 8);
        if (size === 1) {
          size = Number(buffer.readBigUInt64BE(cur + 8));
          cur += 16;
        } else if (size === 0) {
          size = maxLen - cur;
        }

        if (size < 8 || cur + size > maxLen) break;

        const boxEnd = cur + size;
        const bodyStart = cur + 8;

        if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(type)) {
          readBox(bodyStart, boxEnd);
        } else if (type === 'mvhd') {
          const version = buffer.readUInt8(bodyStart);
          let timescale, duration;
          if (version === 1) {
            timescale = buffer.readUInt32BE(bodyStart + 20);
            duration = Number(buffer.readBigUInt64BE(bodyStart + 24));
          } else {
            timescale = buffer.readUInt32BE(bodyStart + 12);
            duration = buffer.readUInt32BE(bodyStart + 16);
          }
          if (timescale > 0) info.durationSec = Math.round((duration / timescale) * 10) / 10;
        } else if (type === 'mdhd') {
          const version = buffer.readUInt8(bodyStart);
          let timescale;
          if (version === 1) {
            timescale = buffer.readUInt32BE(bodyStart + 20);
          } else {
            timescale = buffer.readUInt32BE(bodyStart + 12);
          }
          if (timescale > 0) info.timescale = timescale;
        } else if (type === 'hdlr') {
          const hdlrType = buffer.toString('ascii', bodyStart + 8, bodyStart + 12);
          if (hdlrType === 'soun') info.hasAudio = true;
        } else if (type === 'tkhd') {
          const version = buffer.readUInt8(bodyStart);
          let w, h;
          if (version === 1) {
            w = buffer.readUInt32BE(bodyStart + 88) >> 16;
            h = buffer.readUInt32BE(bodyStart + 92) >> 16;
          } else {
            w = buffer.readUInt32BE(bodyStart + 76) >> 16;
            h = buffer.readUInt32BE(bodyStart + 80) >> 16;
          }
          if (w > 0 && h > 0) {
            info.width = w;
            info.height = h;
          }
        } else if (type === 'stsd') {
          const entryCount = buffer.readUInt32BE(bodyStart + 4);
          let stsdCur = bodyStart + 8;
          for (let i = 0; i < entryCount && stsdCur + 8 <= boxEnd; i++) {
            const entrySize = buffer.readUInt32BE(stsdCur);
            const format = buffer.toString('ascii', stsdCur + 4, stsdCur + 8);
            if (['avc1', 'hvc1', 'hev1', 'vp09', 'av01', 'mp4v'].includes(format)) {
              info.codec = format === 'avc1' ? 'H.264 (avc1)' : (format.startsWith('h') || format.startsWith('hev') ? 'H.265 (HEVC)' : format);
              const trackW = buffer.readUInt16BE(stsdCur + 32);
              const trackH = buffer.readUInt16BE(stsdCur + 34);
              if (trackW > 0) info.width = trackW;
              if (trackH > 0) info.height = trackH;
            }
            stsdCur += entrySize;
          }
        }

        cur = boxEnd;
      }
    }

    readBox(0, buffer.length);
    if (info.width > 0 && info.height > 0) {
      const ratio = info.width / info.height;
      info.aspectRatio = `${info.width}:${info.height} (${(ratio).toFixed(2)}:1)`;
      // Check for equirectangular 2:1 ratio (tolerance 0.05)
      if (Math.abs(ratio - 2.0) < 0.05 || (info.width === 5760 && info.height === 2880) || (info.width === 3840 && info.height === 1920) || (info.width === 1920 && info.height === 960)) {
        info.is360 = true;
      }
    }
    return info;
  } catch (e) {
    return { error: e.message };
  }
}

async function runDeepAudit() {
  const videoFiles = getAllFiles(assetsDir, ['.mp4', '.mov', '.webm']);
  const codeFiles = getAllFiles(srcDir, ['.jsx', '.js', '.css', '.html']);

  console.log(`Discovered ${videoFiles.length} video files in assets.`);
  console.log(`Discovered ${codeFiles.length} source code files.\n`);

  const inventory = [];

  for (const vPath of videoFiles) {
    const filename = path.basename(vPath);
    const relPath = path.relative(path.resolve('c:/Users/lenovo-1/Documents/GitHub/TheDiveVillage/TheDiveVillage-Frontend/Frontend'), vPath).replace(/\\/g, '/');
    const stat = fs.statSync(vPath);
    const sizeBytes = stat.size;
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

    // Find references in code
    const references = [];
    for (const cPath of codeFiles) {
      const content = fs.readFileSync(cPath, 'utf8');
      if (content.includes(filename)) {
        const relCode = path.relative(path.resolve('c:/Users/lenovo-1/Documents/GitHub/TheDiveVillage/TheDiveVillage-Frontend/Frontend'), cPath).replace(/\\/g, '/');
        // Extract line or usage
        references.push({
          sourceFile: relCode,
        });
      }
    }

    const isReferenced = references.length > 0;
    const meta = parseMp4Details(vPath);

    // Determine 360 flag
    // Special known TDV 360 videos
    const isKnown360Name = ['hero', 'book', 'diving', 'turtle', 'nightdive'].some(k => filename.toLowerCase().includes(k)) && !filename.toLowerCase().includes('itinerary') && !filename.toLowerCase().includes('travel');
    const is360 = meta.is360 || isKnown360Name;

    // Determine critical / above-the-fold
    const isAboveFold = references.some(r => r.sourceFile.includes('CustomCursor') || r.sourceFile.includes('Preloader') || (r.sourceFile.includes('VideoSphere') && filename.toLowerCase().includes('hero')));
    const isLazy = !isAboveFold;

    // Audio required?
    const audioRequired = meta.hasAudio && !['Hero_fast.mp4', 'Book_fast.mp4', 'Turtle_fast.mp4', 'nightdive_fast.mp4', 'cursor.webm'].includes(filename);

    // Component / Page using it
    const components = [...new Set(references.map(r => path.basename(r.sourceFile, path.extname(r.sourceFile))))];

    inventory.push({
      filename,
      relPath,
      sizeBytes,
      sizeMB,
      meta,
      isReferenced,
      references,
      components: components.join(', ') || 'Unreferenced',
      is360,
      audioRequired,
      isAboveFold,
      isLazy
    });
  }

  // Sort by size descending
  inventory.sort((a, b) => b.sizeBytes - a.sizeBytes);

  console.log(JSON.stringify(inventory, null, 2));

  // Write out results
  fs.writeFileSync('./scripts/full_video_audit_results.json', JSON.stringify(inventory, null, 2));
}

runDeepAudit();
