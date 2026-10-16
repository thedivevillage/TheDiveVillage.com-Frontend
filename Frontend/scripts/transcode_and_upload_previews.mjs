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

const tempDir = path.resolve(__dirname, 'temp_video_proc');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const activities = [
  { id: 'canyoneering', name: 'Canyoneering', r2Key: 'TDV-Media/Services/Other/Canoneering.mp4', destKey: 'TDV-Media/AddOns/previews/canyoneering_preview.mp4' },
  { id: 'safari', name: 'Safari', r2Key: 'TDV-Media/AirportToAirport/gallery1.mp4', destKey: 'TDV-Media/AddOns/previews/safari_preview.mp4' },
  { id: 'trekking', name: 'Trekking', r2Key: 'TDV-Media/AddOns/Trekking.mp4', destKey: 'TDV-Media/AddOns/previews/trekking_preview.mp4' },
  { id: 'surfing', name: 'Surfing', r2Key: 'TDV-Media/Services/3_Day_Surf_Academy_Course.mp4', destKey: 'TDV-Media/AddOns/previews/surfing_preview.mp4' },
  { id: 'sightseeing', name: 'Sightseeing', r2Key: 'TDV-Media/AddOns/sightseeing.mp4', destKey: 'TDV-Media/AddOns/previews/sightseeing_preview.mp4' },
  { id: 'snorkeling', name: 'Snorkeling', r2Key: 'TDV-Media/Services/Discover_Snorkelling.mp4', destKey: 'TDV-Media/AddOns/previews/snorkeling_preview.mp4' },
  { id: 'camping_camper', name: 'Camping / Camper', r2Key: 'TDV-Media/AddOns/Campers.mp4', destKey: 'TDV-Media/AddOns/previews/campers_preview.mp4' },
  { id: 'liveaboard', name: 'Liveaboard', r2Key: 'TDV-Media/AddOns/liveaboard.mp4', destKey: 'TDV-Media/AddOns/previews/liveaboard_preview.mp4' },
];

console.log('Using ffmpeg at:', ffmpegPath);

for (const act of activities) {
  console.log(`\n================ Processing: ${act.name} (${act.id}) ================`);
  const rawFile = path.join(tempDir, `${act.id}_raw.mp4`);
  const optFile = path.join(tempDir, `${act.id}_preview.mp4`);

  if (!fs.existsSync(rawFile) || fs.statSync(rawFile).size < 1000) {
    console.log(`Downloading: ${act.r2Key}...`);
    await downloadR2(act.r2Key, rawFile);
  } else {
    console.log(`Reusing already downloaded raw file: ${rawFile}`);
  }
  const rawSize = (fs.statSync(rawFile).size / (1024 * 1024)).toFixed(2);
  console.log(`Raw size: ${rawSize} MB`);

  console.log(`Transcoding to 360p low-res preview...`);
  const ffmpegArgs = [
    '-y',
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
    '-t', '10',
    optFile
  ];

  execFileSync(ffmpegPath, ffmpegArgs, { stdio: 'inherit' });

  const optBytes = fs.readFileSync(optFile);
  const optKb = (optBytes.length / 1024).toFixed(1);
  console.log(`Transcoded size: ${optKb} KB (from ${rawSize} MB)`);

  console.log(`Uploading to R2: ${act.destKey}...`);
  const putRes = await putObject(act.destKey, optBytes, 'video/mp4');
  console.log(`Upload result: status ${putRes.statusCode}`);
}

console.log('\nAll 8 activity previews transcoded and uploaded successfully!');
