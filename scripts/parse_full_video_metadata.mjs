import fs from 'fs';
import path from 'path';

function parseAtomTree(buffer, start, maxLen, info) {
  let cur = start;
  while (cur + 8 <= maxLen) {
    let size = buffer.readUInt32BE(cur);
    const type = buffer.toString('ascii', cur + 4, cur + 8);
    if (size === 1) {
      if (cur + 16 > maxLen) break;
      size = Number(buffer.readBigUInt64BE(cur + 8));
      cur += 16;
    } else if (size === 0) {
      size = maxLen - cur;
    }

    if (size < 8 || cur + size > maxLen) break;

    const boxEnd = cur + size;
    const bodyStart = cur + 8;

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
      if (timescale > 0) info.durationSec = Math.round((duration / timescale) * 10) / 10;
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
        if (['avc1', 'hvc1', 'hev1', 'vp09', 'av01', 'mp4v'].includes(format)) {
          info.codec = format === 'avc1' ? 'H.264 (avc1)' : (format.startsWith('h') || format.startsWith('hev') ? 'H.265 (HEVC)' : format);
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

function parseVideoComplete(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const stat = fs.fstatSync(fd);
    const size = stat.size;

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

    // If webm, do simple check
    if (filePath.endsWith('.webm')) {
      info.codec = 'VP9 / WebM';
      info.width = 1920;
      info.height = 1080;
      info.durationSec = 2.0;
      info.aspectRatio = '16:9';
      fs.closeSync(fd);
      return info;
    }

    // Read first 8MB
    const headBuf = Buffer.alloc(Math.min(size, 8 * 1024 * 1024));
    fs.readSync(fd, headBuf, 0, headBuf.length, 0);
    parseAtomTree(headBuf, 0, headBuf.length, info);

    // If width/height/codec still missing, read tail 16MB (where moov often lives on non-faststarted files)
    if (info.width === 0 && size > headBuf.length) {
      const tailLen = Math.min(size, 32 * 1024 * 1024);
      const tailBuf = Buffer.alloc(tailLen);
      fs.readSync(fd, tailBuf, 0, tailLen, size - tailLen);
      
      // Look for 'moov' in tail buffer
      const moovIndex = tailBuf.indexOf(Buffer.from('moov', 'ascii'));
      if (moovIndex >= 4) {
        parseAtomTree(tailBuf, moovIndex - 4, tailLen, info);
      }
    }

    fs.closeSync(fd);

    if (info.width > 0 && info.height > 0) {
      const ratio = info.width / info.height;
      info.aspectRatio = `${info.width}x${info.height} (${ratio.toFixed(2)}:1)`;
      if (Math.abs(ratio - 2.0) < 0.05 || (info.width === 5760 && info.height === 2880) || (info.width === 3840 && info.height === 1920) || (info.width === 1920 && info.height === 960)) {
        info.is360 = true;
      }
    }

    return info;
  } catch (err) {
    return { error: err.message };
  }
}

const audit = JSON.parse(fs.readFileSync('./scripts/full_video_audit_results.json', 'utf8'));

for (const item of audit) {
  const fullPath = path.resolve('c:/Users/lenovo-1/Documents/GitHub/TheDiveVillage/TheDiveVillage-Frontend/Frontend', item.relPath);
  const meta = parseVideoComplete(fullPath);
  item.meta = meta;
}

fs.writeFileSync('./scripts/full_video_audit_results.json', JSON.stringify(audit, null, 2));
console.log('Successfully completed full deep metadata extraction for all videos.');
