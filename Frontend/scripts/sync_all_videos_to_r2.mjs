import https from 'node:https';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const r2Creds = {
  accessKeyId: 'c94775f05ccec5fefaa79206167e5d18',
  secretAccessKey: 'fb886b042d18e4c7118459b4435eb0da5af3986d86e0b320d6b8d80a943dcf37',
  bucket: 'thedivevillage-media',
  endpoint: 'https://e89adf53cebe848fd4e126c6b9d88d0c.r2.cloudflarestorage.com'
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

function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

const mediaDir = path.resolve(__dirname, '../public/media');
const allFiles = getFiles(mediaDir);
const videoFiles = allFiles.filter(f => {
  const ext = path.extname(f).toLowerCase();
  return ext === '.mp4' || ext === '.webm' || ext === '.mov';
});

// Also include src/assets/preloader.mp4 and cursor.webm
const preloaderPath = path.resolve(__dirname, '../src/assets/preloader.mp4');
if (fs.existsSync(preloaderPath)) {
  videoFiles.push(preloaderPath);
}
const cursorPath = path.resolve(__dirname, '../src/assets/cursor.webm');
if (fs.existsSync(cursorPath)) {
  videoFiles.push(cursorPath);
}

console.log(`Found ${videoFiles.length} local video files. Verifying each against Cloudflare R2...`);

const normMediaDir = mediaDir.replace(/\\/g, '/');

async function syncVideos() {
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < videoFiles.length; i++) {
    const filePath = videoFiles[i];
    const normPath = filePath.replace(/\\/g, '/');
    let key;
    if (normPath.startsWith(normMediaDir)) {
      key = normPath.slice(normMediaDir.length + 1);
    } else if (normPath.includes('preloader.mp4')) {
      key = 'TDV-Media/UI/preloader.mp4';
    } else if (normPath.includes('cursor.webm')) {
      key = 'TDV-Media/UI/cursor.webm';
    } else {
      key = 'TDV-Media/' + path.basename(filePath);
    }

    const stat = fs.statSync(filePath);
    const headRes = await headObject(key);

    if (headRes.statusCode === 200 && headRes.contentLength === stat.size) {
      skipped++;
      console.log(`[${i+1}/${videoFiles.length}] Exists in R2 (${(stat.size/1024/1024).toFixed(2)} MB): ${key}`);
    } else {
      console.log(`[${i+1}/${videoFiles.length}] Uploading to R2 (${(stat.size/1024/1024).toFixed(2)} MB): ${key}...`);
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'video/mp4';
      if (ext === '.webm') contentType = 'video/webm';
      else if (ext === '.mov') contentType = 'video/quicktime';

      try {
        const buffer = fs.readFileSync(filePath);
        const putRes = await putObject(key, buffer, contentType);
        if (putRes.statusCode === 200) {
          uploaded++;
          console.log(`  ✓ Uploaded: ${key}`);
        } else {
          failed++;
          console.error(`  ✗ Failed HTTP ${putRes.statusCode}: ${key}`);
        }
      } catch (e) {
        failed++;
        console.error(`  ✗ Error: ${key} - ${e.message}`);
      }
    }
  }

  console.log(`\n=== VIDEO SYNC COMPLETE ===`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Already verified: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

syncVideos();
