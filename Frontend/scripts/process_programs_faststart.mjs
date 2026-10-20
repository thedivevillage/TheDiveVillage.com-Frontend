import https from 'node:https';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const env = {};
const envPaths = [
  path.resolve(__dirname, '../../../TheDiveVillage.com-Backend/server/.env'),
  path.resolve(__dirname, '../.env')
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        const k = trimmed.substring(0, eq).trim();
        let v = trimmed.substring(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (!env[k]) env[k] = v;
      }
    });
  }
}

const r2Creds = {
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  bucket: env.R2_BUCKET_NAME || 'thedivevillage-media',
  endpoint: env.R2_ENDPOINT || 'https://e89adf53cebe848fd4e126c6b9d88d0c.r2.cloudflarestorage.com'
};

function hmac(key, string) {
  return crypto.createHmac('sha256', key).update(string, 'utf8').digest();
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = hmac('AWS4' + key, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  return hmac(kService, 'aws4_request');
}

function downloadR2(key, outputPath) {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const host = new URL(r2Creds.endpoint).host;

    const canonicalUri = '/' + r2Creds.bucket + '/' + key.split('/').map(encodeURIComponent).join('/');

    const normHeaders = {
      'host': host,
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
      'x-amz-date': amzDate
    };

    const headerKeys = Object.keys(normHeaders).sort();
    const canonicalHeaders = headerKeys.map(k => k + ':' + normHeaders[k] + '\n').join('');
    const signedHeaders = headerKeys.join(';');

    const canonicalRequest = [
      'GET',
      canonicalUri,
      '',
      canonicalHeaders,
      signedHeaders,
      'UNSIGNED-PAYLOAD'
    ].join('\n');

    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex');
    const credentialScope = dateStamp + '/auto/s3/aws4_request';
    const stringToSign = 'AWS4-HMAC-SHA256\n' + amzDate + '\n' + credentialScope + '\n' + canonicalRequestHash;

    const signingKey = getSignatureKey(r2Creds.secretAccessKey, dateStamp, 'auto', 's3');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

    const authHeader = 'AWS4-HMAC-SHA256 Credential=' + r2Creds.accessKeyId + '/' + credentialScope + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature;

    const fileStream = fs.createWriteStream(outputPath);
    const req = https.request({
      hostname: host,
      path: canonicalUri,
      method: 'GET',
      headers: {
        ...normHeaders,
        'Authorization': authHeader
      }
    }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed with status ${res.statusCode} for ${key}`));
      }
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(() => resolve(outputPath));
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function putObject(key, bodyBuffer, contentType = 'video/mp4') {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const host = new URL(r2Creds.endpoint).host;

    const payloadHash = crypto.createHash('sha256').update(bodyBuffer).digest('hex');
    const canonicalUri = '/' + r2Creds.bucket + '/' + key.split('/').map(encodeURIComponent).join('/');

    const normHeaders = {
      'content-length': bodyBuffer.length.toString(),
      'content-type': contentType,
      'host': host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate
    };

    const headerKeys = Object.keys(normHeaders).sort();
    const canonicalHeaders = headerKeys.map(k => k + ':' + normHeaders[k] + '\n').join('');
    const signedHeaders = headerKeys.join(';');

    const canonicalRequest = [
      'PUT',
      canonicalUri,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');

    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex');
    const credentialScope = dateStamp + '/auto/s3/aws4_request';
    const stringToSign = 'AWS4-HMAC-SHA256\n' + amzDate + '\n' + credentialScope + '\n' + canonicalRequestHash;

    const signingKey = getSignatureKey(r2Creds.secretAccessKey, dateStamp, 'auto', 's3');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

    const authHeader = 'AWS4-HMAC-SHA256 Credential=' + r2Creds.accessKeyId + '/' + credentialScope + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature;

    const req = https.request({
      hostname: host,
      path: canonicalUri,
      method: 'PUT',
      headers: {
        ...normHeaders,
        'Authorization': authHeader
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });
    req.on('error', reject);
    req.write(bodyBuffer);
    req.end();
  });
}

function verifyMoovPosition(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(1024 * 64);
  fs.readSync(fd, buffer, 0, buffer.length, 0);
  fs.closeSync(fd);
  const moovIdx = buffer.indexOf('moov');
  const mdatIdx = buffer.indexOf('mdat');
  return {
    hasMoovInFirst64K: moovIdx !== -1,
    moovOffset: moovIdx,
    mdatOffset: mdatIdx,
    isFastStart: moovIdx !== -1 && (mdatIdx === -1 || moovIdx < mdatIdx)
  };
}

const tempDir = path.resolve(__dirname, 'temp_programs_proc');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const publicPreviewDir = path.resolve(__dirname, '../public/TDV-Media/Services/previews');
if (!fs.existsSync(publicPreviewDir)) {
  fs.mkdirSync(publicPreviewDir, { recursive: true });
}

const publicMasterDir = path.resolve(__dirname, '../public/TDV-Media/Services');
if (!fs.existsSync(publicMasterDir)) {
  fs.mkdirSync(publicMasterDir, { recursive: true });
}

const programs = [
  {
    id: 'prog-1',
    name: 'Try Dive',
    r2Key: 'TDV-Media/Services/Try_Dive.mp4',
    previewName: 'prog_try_dive_preview.mp4',
    previewR2Key: 'TDV-Media/Services/previews/prog_try_dive_preview.mp4'
  },
  {
    id: 'prog-2',
    name: 'DSD Lite',
    r2Key: 'TDV-Media/Services/Discover_Scuba_Dive_Lite.mp4',
    previewName: 'prog_dsd_lite_preview.mp4',
    previewR2Key: 'TDV-Media/Services/previews/prog_dsd_lite_preview.mp4'
  },
  {
    id: 'prog-3',
    name: 'Discover Scuba Dive',
    r2Key: 'TDV-Media/Services/Discover_Scuba_Dive.mp4',
    previewName: 'prog_dsd_preview.mp4',
    previewR2Key: 'TDV-Media/Services/previews/prog_dsd_preview.mp4'
  },
  {
    id: 'prog-4',
    name: 'Additional Dive after DSD',
    r2Key: 'TDV-Media/Services/Additional_dive_ater_discover_scuba_dive.mp4',
    previewName: 'prog_add_dive_preview.mp4',
    previewR2Key: 'TDV-Media/Services/previews/prog_add_dive_preview.mp4'
  },
  {
    id: 'prog-5',
    name: 'Bubblemaker',
    r2Key: 'TDV-Media/Services/Bubblemaker.mp4',
    previewName: 'prog_bubblemaker_preview.mp4',
    previewR2Key: 'TDV-Media/Services/previews/prog_bubblemaker_preview.mp4'
  }
];

console.log('Using ffmpeg at:', ffmpegPath);
console.log(`Starting processing for ${programs.length} Programs videos...\n`);

for (const prog of programs) {
  console.log(`================ [${prog.id}] ${prog.name} ================`);
  const rawFile = path.join(tempDir, `${prog.id}_raw.mp4`);
  const previewFile = path.join(tempDir, prog.previewName);
  const faststartMasterFile = path.join(tempDir, `${prog.id}_faststart.mp4`);

  // 1. Download Master File from R2
  if (!fs.existsSync(rawFile) || fs.statSync(rawFile).size < 10000) {
    console.log(`Downloading original master from R2: ${prog.r2Key}...`);
    await downloadR2(prog.r2Key, rawFile);
  } else {
    console.log(`Reusing local cached master file: ${rawFile}`);
  }
  const rawSizeMb = (fs.statSync(rawFile).size / (1024 * 1024)).toFixed(2);
  console.log(`Raw master size: ${rawSizeMb} MB`);

  // Check original moov position
  const rawMoovCheck = verifyMoovPosition(rawFile);
  console.log(`Original faststart status:`, rawMoovCheck);

  // 2. Generate 3-Second Micro-Preview Video (< 100 KB, moov at byte 0)
  console.log(`Generating 3-second low-res preview micro-video...`);
  const previewArgs = [
    '-y',
    '-ss', '0',
    '-t', '3',
    '-i', rawFile,
    '-vf', 'scale=360:-2,pad=ceil(iw/2)*2:ceil(ih/2)*2',
    '-c:v', 'libx264',
    '-profile:v', 'baseline',
    '-level', '3.0',
    '-pix_fmt', 'yuv420p',
    '-crf', '28',
    '-preset', 'fast',
    '-an',
    '-movflags', '+faststart',
    previewFile
  ];
  execFileSync(ffmpegPath, previewArgs, { stdio: 'inherit' });

  const previewBytes = fs.readFileSync(previewFile);
  const previewKb = (previewBytes.length / 1024).toFixed(1);
  const previewMoov = verifyMoovPosition(previewFile);
  console.log(`3-Second Preview generated: ${previewKb} KB | moovOffset: ${previewMoov.moovOffset} (FastStart: ${previewMoov.isFastStart})`);

  // Copy preview to public folder for 0ms instant local dev response
  const localPreviewDest = path.join(publicPreviewDir, prog.previewName);
  fs.copyFileSync(previewFile, localPreviewDest);
  console.log(`Saved local preview copy to: ${localPreviewDest}`);

  // Upload preview to R2
  console.log(`Uploading preview to R2: ${prog.previewR2Key}...`);
  const uploadPreviewRes = await putObject(prog.previewR2Key, previewBytes, 'video/mp4');
  console.log(`Preview upload status: ${uploadPreviewRes.statusCode}`);

  // 3. Implement Method D (FastStart) on the High-Resolution Master File
  console.log(`Applying Method D FastStart to Master 1080p File (-c copy -movflags +faststart)...`);
  const faststartArgs = [
    '-y',
    '-i', rawFile,
    '-c', 'copy',
    '-movflags', '+faststart',
    faststartMasterFile
  ];
  execFileSync(ffmpegPath, faststartArgs, { stdio: 'inherit' });

  const faststartBytes = fs.readFileSync(faststartMasterFile);
  const faststartMb = (faststartBytes.length / (1024 * 1024)).toFixed(2);
  const faststartMoov = verifyMoovPosition(faststartMasterFile);
  console.log(`Master FastStart generated: ${faststartMb} MB | moovOffset: ${faststartMoov.moovOffset} (FastStart: ${faststartMoov.isFastStart})`);

  // Copy faststarted master to public folder
  const localMasterDest = path.join(publicMasterDir, path.basename(prog.r2Key));
  fs.copyFileSync(faststartMasterFile, localMasterDest);
  console.log(`Saved local faststart master copy to: ${localMasterDest}`);

  // Upload FastStarted Master File back to R2 to replace the slow end-moov file
  console.log(`Uploading FastStarted Master to R2: ${prog.r2Key}...`);
  const uploadMasterRes = await putObject(prog.r2Key, faststartBytes, 'video/mp4');
  console.log(`Master FastStart u
    pload status: ${uploadMasterRes.statusCode}`);

  console.log(`Finished processing for ${prog.name}!\n`);
}

console.log('All 5 Programs videos successfully converted to FastStart (Method D) and 3-Second Previews created & uploaded!');
