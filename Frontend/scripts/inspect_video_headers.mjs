import fs from 'fs';
import path from 'path';

// Quick pure JS MP4 atom reader to extract video width, height, duration, timescale, and tracks
function parseMp4(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const stat = fs.fstatSync(fd);
    const buffer = Buffer.alloc(Math.min(stat.size, 1024 * 1024 * 16)); // Read first 16MB for moov
    fs.readSync(fd, buffer, 0, buffer.length, 0);
    fs.closeSync(fd);

    let offset = 0;
    let info = {
      codec: 'Unknown',
      width: 0,
      height: 0,
      durationSec: 0,
      hasAudio: false,
      is360: false
    };

    function readBox(start, maxLen) {
      let cur = start;
      while (cur + 8 <= maxLen) {
        let size = buffer.readUInt32BE(cur);
        const type = buffer.toString('ascii', cur + 4, cur + 8);
        if (size === 1) {
          // 64-bit large size
          size = Number(buffer.readBigUInt64BE(cur + 8));
          cur += 16;
        } else if (size === 0) {
          size = maxLen - cur;
        }

        if (size < 8 || cur + size > maxLen) break;

        const boxEnd = cur + size;
        const bodyStart = cur + 8;

        if (type === 'moov' || type === 'trak' || type === 'mdia' || type === 'minf' || type === 'stbl') {
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
          if (timescale > 0) info.durationSec = Math.round(duration / timescale);
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
          // Sample description table
          const entryCount = buffer.readUInt32BE(bodyStart + 4);
          let stsdCur = bodyStart + 8;
          for (let i = 0; i < entryCount && stsdCur + 8 <= boxEnd; i++) {
            const entrySize = buffer.readUInt32BE(stsdCur);
            const format = buffer.toString('ascii', stsdCur + 4, stsdCur + 8);
            if (['avc1', 'hvc1', 'hev1', 'vp09', 'av01', 'mp4v'].includes(format)) {
              info.codec = format;
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
      if (Math.abs(ratio - 2.0) < 0.05) {
        info.is360 = true;
      }
    }
    return info;
  } catch (e) {
    return { error: e.message };
  }
}

const inventory = JSON.parse(fs.readFileSync('./scripts/video_inventory.json', 'utf8'));

const detailed = inventory.map(item => {
  const meta = parseMp4(item.relPath);
  return {
    ...item,
    meta
  };
});

fs.writeFileSync('./scripts/video_inventory_detailed.json', JSON.stringify(detailed, null, 2));
console.log('Processed metadata for all videos.');

console.log('\n--- 360 VIDEOS IDENTIFIED ---');
detailed.filter(d => d.meta && d.meta.is360).forEach(d => {
  console.log(`${d.filename.padEnd(25)} | Res: ${d.meta.width}x${d.meta.height} | Dur: ${d.meta.durationSec}s | Codec: ${d.meta.codec} | Audio: ${d.meta.hasAudio} | Size: ${d.sizeMB} MB | Role: ${d.role}`);
});

console.log('\n--- NON-360 GALLERY / STANDARD VIDEOS ---');
detailed.filter(d => d.meta && !d.meta.is360 && d.isReferenced).forEach(d => {
  console.log(`${d.filename.padEnd(45)} | Res: ${d.meta.width}x${d.meta.height} | Dur: ${d.meta.durationSec}s | Codec: ${d.meta.codec} | Audio: ${d.meta.hasAudio} | Size: ${d.sizeMB} MB | Role: ${d.role}`);
});
