import https from 'node:https';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Load R2 credentials from env files
const env = {};
const envPaths = [
  path.resolve(__dirname, '../.env.local'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../../TheDiveVillage.com-Backend/server/.env')
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
  accessKeyId: env.R2_ACCESS_KEY_ID || 'c94775f05ccec5fefaa79206167e5d18',
  secretAccessKey: env.R2_SECRET_ACCESS_KEY || 'fb886b042d18e4c7118459b4435eb0da5af3986d86e0b320d6b8d80a943dcf37',
  bucket: env.R2_BUCKET_NAME || 'thedivevillage-media',
  endpoint: env.R2_ENDPOINT || 'https://e89adf53cebe848fd4e126c6b9d88d0c.r2.cloudflarestorage.com'
};

console.log('Using R2 Bucket:', r2Creds.bucket);
console.log('Using R2 Endpoint:', r2Creds.endpoint);

function hmac(key, string) {
  return crypto.createHmac('sha256', key).update(string, 'utf8').digest();
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = hmac('AWS4' + key, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  return hmac(kService, 'aws4_request');
}

function headObject(key) {
  return new Promise((resolve) => {
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
      'HEAD',
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

    const req = https.request({
      hostname: host,
      path: canonicalUri,
      method: 'HEAD',
      headers: {
        ...normHeaders,
        'Authorization': authHeader
      }
    }, res => {
      resolve({
        statusCode: res.statusCode,
        contentLength: res.headers['content-length'] ? parseInt(res.headers['content-length'], 10) : null
      });
    });

    req.on('error', () => resolve({ statusCode: 500 }));
    req.end();
  });
}

function putObject(key, bodyBuffer, contentType) {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const host = new URL(r2Creds.endpoint).host;

    const payloadHash = crypto.createHash('sha256').update(bodyBuffer).digest('hex');
    const canonicalUri = '/' + r2Creds.bucket + '/' + key.split('/').map(encodeURIComponent).join('/');

    const normHeaders = {
      'cache-control': 'public, max-age=31536000, immutable',
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

// 2. Discover files to upload
const baseLocalDir = path.resolve(__dirname, '../public/media/TDV-Media/Extras for Gallery');
const postersDir = path.join(baseLocalDir, 'posters');
const previewsDir = path.join(baseLocalDir, 'previews');

const filesToUpload = [];

if (fs.existsSync(postersDir)) {
  for (const f of fs.readdirSync(postersDir)) {
    if (f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg')) {
      filesToUpload.push({
        localPath: path.join(postersDir, f),
        r2Key: `TDV-Media/Extras for Gallery/posters/${f}`,
        contentType: f.endsWith('.webp') ? 'image/webp' : (f.endsWith('.png') ? 'image/png' : 'image/jpeg')
      });
    }
  }
}

if (fs.existsSync(previewsDir)) {
  for (const f of fs.readdirSync(previewsDir)) {
    if (f.endsWith('.mp4') || f.endsWith('.webm')) {
      filesToUpload.push({
        localPath: path.join(previewsDir, f),
        r2Key: `TDV-Media/Extras for Gallery/previews/${f}`,
        contentType: f.endsWith('.webm') ? 'video/webm' : 'video/mp4'
      });
    }
  }
}

// Also check any standalone image files directly in base directory (e.g. Hawksbill_Sea_Turtle_2.webp)
if (fs.existsSync(baseLocalDir)) {
  for (const f of fs.readdirSync(baseLocalDir)) {
    const full = path.join(baseLocalDir, f);
    if (fs.statSync(full).isFile() && (f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'))) {
      filesToUpload.push({
        localPath: full,
        r2Key: `TDV-Media/Extras for Gallery/${f}`,
        contentType: f.endsWith('.webp') ? 'image/webp' : (f.endsWith('.png') ? 'image/png' : 'image/jpeg')
      });
    }
  }
}

console.log(`Found ${filesToUpload.length} files to check and upload to R2.`);

async function run() {
  let uploadedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < filesToUpload.length; i++) {
    const item = filesToUpload[i];
    const stat = fs.statSync(item.localPath);
    const sizeKb = (stat.size / 1024).toFixed(1);

    process.stdout.write(`[${i + 1}/${filesToUpload.length}] Checking ${item.r2Key} (${sizeKb} KB)... `);

    // Check if already in R2
    const head = await headObject(item.r2Key);
    if (head.statusCode === 200 && head.contentLength === stat.size) {
      console.log('✓ Already exists in R2 (matching size). Skipping.');
      skippedCount++;
      continue;
    }

    // Upload
    process.stdout.write('Uploading... ');
    const fileBytes = fs.readFileSync(item.localPath);
    try {
      const res = await putObject(item.r2Key, fileBytes, item.contentType);
      if (res.statusCode === 200) {
        console.log('✓ Uploaded successfully (HTTP 200)');
        uploadedCount++;
      } else {
        console.log(`✗ Failed (HTTP ${res.statusCode}): ${res.data}`);
        errorCount++;
      }
    } catch (err) {
      console.log(`✗ Error: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n================ SUMMARY ================');
  console.log(`Total files checked: ${filesToUpload.length}`);
  console.log(`Uploaded:            ${uploadedCount}`);
  console.log(`Already present:     ${skippedCount}`);
  console.log(`Errors:              ${errorCount}`);
  console.log('=========================================\n');
}

run();
