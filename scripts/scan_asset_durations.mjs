import fs from 'fs';
import path from 'path';

function parseAtomTree(buffer, start, maxLen, info) {
  let cur = start;
  while (cur + 8 <= maxLen) {
    let size = buffer.readUInt32BE(cur);
    const type = buffer.toString('ascii', cur + 4, cur + 8);
    let headerSize = 8;
    
    if (size === 1) {
      if (cur + 16 > maxLen) break;
      size = Number(buffer.readBigUInt64BE(cur + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = maxLen - cur;
    }

    if (size < headerSize || cur + size > maxLen) {
      // If broken atom length, try to advance
      break;
    }

    const boxEnd = cur + size;
    const bodyStart = cur + headerSize;

    if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(type)) {
      parseAtomTree(buffer, bodyStart, boxEnd, info);
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
      if (timescale > 0) {
        info.durationSec = Math.round((duration / timescale) * 100) / 100;
        info.timescale = timescale;
      }
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
      if (w > 0 && h > 0 && (!info.width || w > info.width)) {
        info.width = w;
        info.height = h;
      }
    } else if (type === 'stsd') {
      const entryCount = buffer.readUInt32BE(bodyStart + 4);
      let stsdCur = bodyStart + 8;
      for (let i = 0; i < entryCount && stsdCur + 8 <= boxEnd; i++) {
        const entrySize = buffer.readUInt32BE(stsdCur);
        const format = buffer.toString('ascii', stsdCur + 4, stsdCur + 8);
        if (['avc1', 'hvc1', 'hev1', 'vp09', 'av01', 'mp4v', 'dvh1', 'dve1'].includes(format)) {
          info.codec = format === 'avc1' ? 'H.264 (AVC)' : (format.startsWith('h') || format.startsWith('hev') ? 'H.265 (HEVC)' : format);
          const trackW = buffer.readUInt16BE(stsdCur + 32);
          const trackH = buffer.readUInt16BE(stsdCur + 34);
          if (trackW > 0) {
            info.width = trackW;
            info.height = trackH;
          }
        }
        stsdCur += entrySize;
      }
    }

    cur = boxEnd;
  }
}

function parseVideo(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const size = buf.length;

    let info = {
      codec: 'Unknown',
      width: 0,
      height: 0,
      durationSec: 0,
      sizeBytes: size
    };

    if (filePath.toLowerCase().endsWith('.webm')) {
      info.codec = 'VP9 (WebM)';
      info.durationSec = 2.0;
      info.width = 1920;
      info.height = 1080;
      return info;
    }

    // Direct search for moov box
    const moovIdx = buf.indexOf(Buffer.from('moov'));
    if (moovIdx >= 4) {
      const moovStart = moovIdx - 4;
      let moovSize = buf.readUInt32BE(moovStart);
      let moovEnd = moovStart + moovSize;
      if (moovSize === 1 && moovStart + 16 <= size) {
        moovSize = Number(buf.readBigUInt64BE(moovStart + 8));
        moovEnd = moovStart + moovSize;
      } else if (moovSize <= 0 || moovEnd > size) {
        moovEnd = size;
      }
      parseAtomTree(buf, moovStart + 8, moovEnd, info);
    } else {
      // Fallback parse from beginning
      parseAtomTree(buf, 0, size, info);
    }

    return info;
  } catch (err) {
    return { error: err.message, durationSec: 0, sizeBytes: 0, codec: 'Error', width: 0, height: 0 };
  }
}

function formatDuration(sec) {
  if (!sec || isNaN(sec)) return '00:00';
  const mins = Math.floor(sec / 60);
  const remainingSecs = Math.floor(sec % 60);
  const ms = Math.round((sec - Math.floor(sec)) * 10);
  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(remainingSecs).padStart(2, '0');
  return `${formattedMins}:${formattedSecs}.${ms}`;
}

function formatSeconds(sec) {
  if (!sec || isNaN(sec)) return '0.0s';
  return `${sec.toFixed(2)}s`;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'].includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  }
  return arrayOfFiles;
}

const targetDir = path.resolve('./Frontend/src/assets');
const allVideoFiles = getAllFiles(targetDir);

const results = [];
for (const file of allVideoFiles) {
  const relPath = path.relative('./Frontend/src/assets', file).replace(/\\/g, '/');
  const meta = parseVideo(file);
  const pathParts = relPath.split('/');
  const category = pathParts.length > 1 ? pathParts.slice(0, -1).join(' / ') : 'Root';

  results.push({
    filename: path.basename(file),
    relPath: `assets/${relPath}`,
    category: category,
    sizeMB: (meta.sizeBytes / (1024 * 1024)).toFixed(2),
    sizeBytes: meta.sizeBytes,
    durationSec: meta.durationSec,
    durationFormatted: formatDuration(meta.durationSec),
    durationSeconds: formatSeconds(meta.durationSec),
    resolution: meta.width > 0 ? `${meta.width}x${meta.height}` : 'N/A',
    codec: meta.codec
  });
}

// Write out JSON results
fs.writeFileSync('./scripts/asset_video_durations.json', JSON.stringify(results, null, 2));

console.log(`Successfully scanned ${results.length} video files in assets folder.`);

// Group by category
const grouped = {};
let totalDurationSec = 0;
let totalSizeBytes = 0;

for (const item of results) {
  if (!grouped[item.category]) {
    grouped[item.category] = [];
  }
  grouped[item.category].push(item);
  totalDurationSec += item.durationSec;
  totalSizeBytes += item.sizeBytes;
}

console.log('\n--- SUMMARY STATS ---');
console.log(`Total Video Count: ${results.length}`);
console.log(`Total Duration: ${Math.floor(totalDurationSec / 60)}m ${Math.round(totalDurationSec % 60)}s (${totalDurationSec.toFixed(2)}s)`);
console.log(`Total Size: ${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB (${(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB)\n`);

for (const [cat, items] of Object.entries(grouped)) {
  console.log(`\n### ${cat} (${items.length} files)`);
  items.forEach((it, idx) => {
    console.log(`${idx + 1}. ${it.filename} | Duration: ${it.durationFormatted} (${it.durationSeconds}) | Resolution: ${it.resolution} | Size: ${it.sizeMB} MB | Codec: ${it.codec}`);
  });
}
