'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

// 1. Load credentials strictly from git-ignored server/env
const envPath = path.resolve(__dirname, '../../TheDiveVillage.com-Backend/server/env');
if (!fs.existsSync(envPath)) {
  console.error('Error: Could not find credentials file at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
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
    env[k] = v;
  }
});

const r2Creds = {
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  bucket: env.R2_BUCKET_NAME,
  endpoint: env.R2_ENDPOINT
};

const cloudinaryCreds = {
  cloud_name: env.CLOUDINARY_CLOUD_NAME || 'qvbunv8y',
  api_key: env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET
};

const manifestPath = path.resolve(__dirname, '../r2_migration_manifest.json');
const inventoryPath = path.resolve(__dirname, '../migration_video_inventory.json');

// AWS S3 Signature Version 4 Helper
function hmac(key, string) {
  return crypto.createHmac('sha256', key).update(string, 'utf8').digest();
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = hmac('AWS4' + key, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  return hmac(kService, 'aws4_request');
}

function signS3Request({ method, key, headers = {}, payloadHash = 'UNSIGNED-PAYLOAD' }) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const host = new URL(r2Creds.endpoint).host;

  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  const canonicalUri = `/${r2Creds.bucket}/${encodedKey}`;

  const normHeaders = {
    'host': host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    ...headers
  };

  const headerKeys = Object.keys(normHeaders).map(k => k.toLowerCase()).sort();
  const canonicalHeaders = headerKeys.map(k => `${k}:${normHeaders[k]}\n`).join('');
  const signedHeaders = headerKeys.join(';');

  const canonicalRequest = [
    method,
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex');
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

  const signingKey = getSignatureKey(r2Creds.secretAccessKey, dateStamp, 'auto', 's3');
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

  const authHeader = `AWS4-HMAC-SHA256 Credential=${r2Creds.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    hostname: host,
    path: canonicalUri,
    headers: {
      ...normHeaders,
      'Authorization': authHeader
    }
  };
}

function headR2Object(key) {
  return new Promise((resolve) => {
    const signed = signS3Request({ method: 'HEAD', key });
    const req = https.request({
      hostname: signed.hostname,
      port: 443,
      path: signed.path,
      method: 'HEAD',
      headers: signed.headers
    }, (res) => {
      resolve({
        statusCode: res.statusCode,
        contentLength: res.headers['content-length'] ? parseInt(res.headers['content-length'], 10) : null,
        etag: (res.headers['etag'] || '').replace(/"/g, ''),
        contentType: res.headers['content-type']
      });
    });
    req.on('error', (err) => resolve({ statusCode: 500, error: err.message }));
    req.end();
  });
}

function getMimeType(key, format) {
  const ext = path.extname(key).toLowerCase() || `.${format}`;
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.webm') return 'video/webm';
  if (ext === '.mov') return 'video/quicktime';
  return 'application/octet-stream';
}

function streamCloudinaryToR2(sourceUrl, targetKey, expectedBytes, contentType) {
  return new Promise((resolve, reject) => {
    const client = sourceUrl.startsWith('https') ? https : http;
    const downloadReq = client.get(sourceUrl, (downloadRes) => {
      if (downloadRes.statusCode !== 200) {
        return reject(new Error(`Cloudinary returned HTTP ${downloadRes.statusCode} for ${sourceUrl}`));
      }

      const contentLength = downloadRes.headers['content-length']
        ? parseInt(downloadRes.headers['content-length'], 10)
        : expectedBytes;

      const signed = signS3Request({
        method: 'PUT',
        key: targetKey,
        headers: {
          'content-length': String(contentLength),
          'content-type': contentType
        },
        payloadHash: 'UNSIGNED-PAYLOAD'
      });

      const uploadReq = https.request({
        hostname: signed.hostname,
        port: 443,
        path: signed.path,
        method: 'PUT',
        headers: signed.headers
      }, (uploadRes) => {
        let uploadBody = '';
        uploadRes.on('data', c => uploadBody += c);
        uploadRes.on('end', () => {
          if (uploadRes.statusCode === 200) {
            resolve({
              statusCode: uploadRes.statusCode,
              etag: (uploadRes.headers['etag'] || '').replace(/"/g, ''),
              bytesStreamed,
              localMd5: md5Hash.digest('hex')
            });
          } else {
            reject(new Error(`R2 upload returned HTTP ${uploadRes.statusCode}: ${uploadBody}`));
          }
        });
      });

      uploadReq.on('error', reject);

      let bytesStreamed = 0;
      const md5Hash = crypto.createHash('md5');

      downloadRes.on('data', (chunk) => {
        bytesStreamed += chunk.length;
        md5Hash.update(chunk);
        uploadReq.write(chunk);
      });

      downloadRes.on('end', () => {
        uploadReq.end();
      });

      downloadRes.on('error', (err) => {
        uploadReq.destroy(err);
        reject(err);
      });
    });

    downloadReq.on('error', reject);
    downloadReq.setTimeout(60000, () => {
      downloadReq.destroy(new Error('Cloudinary download timed out (60s)'));
    });
  });
}

async function migrateSingleVideo(video, index, total, manifest) {
  const publicId = video.public_id;
  const format = video.format || 'mp4';
  const ext = path.extname(publicId);
  const targetKey = ext ? publicId : `${publicId}.${format}`;
  const contentType = getMimeType(targetKey, format);
  const expectedBytes = video.bytes;

  // Check if already in manifest and verified
  const existingEntry = manifest[publicId];
  if (existingEntry && existingEntry.status === 'verified') {
    // Idempotency: verify that the remote R2 object actually exists and matches size
    const head = await headR2Object(targetKey);
    if (head.statusCode === 200 && head.contentLength === expectedBytes) {
      console.log(`[${index + 1}/${total}] ⏩ Already verified on R2: ${targetKey} (${(expectedBytes / (1024 * 1024)).toFixed(2)} MB)`);
      return { ...existingEntry, skipped: true };
    }
  }

  console.log(`[${index + 1}/${total}] 🔄 Migrating: ${publicId} -> R2:/${targetKey} (${(expectedBytes / (1024 * 1024)).toFixed(2)} MB)...`);

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const uploadResult = await streamCloudinaryToR2(video.secure_url, targetKey, expectedBytes, contentType);

      // Verify immediately with HEAD
      const head = await headR2Object(targetKey);
      if (head.statusCode !== 200) {
        throw new Error(`Post-upload HEAD check failed with HTTP ${head.statusCode}`);
      }

      if (head.contentLength !== expectedBytes) {
        throw new Error(`Size mismatch: source is ${expectedBytes} bytes, R2 object is ${head.contentLength} bytes`);
      }

      if (head.etag && uploadResult.localMd5 && head.etag !== uploadResult.localMd5) {
        throw new Error(`Checksum mismatch: local MD5 ${uploadResult.localMd5} does not match R2 ETag ${head.etag}`);
      }

      console.log(`[${index + 1}/${total}] ✅ Verified: ${targetKey} | Size: ${head.contentLength} B | ETag/MD5: ${head.etag}`);

      const entry = {
        public_id: publicId,
        r2_key: targetKey,
        source_url: video.secure_url,
        source_bytes: expectedBytes,
        uploaded_bytes: head.contentLength,
        content_type: contentType,
        md5_checksum: uploadResult.localMd5,
        r2_etag: head.etag,
        status: 'verified',
        attempts,
        verified_at: new Date().toISOString()
      };

      manifest[publicId] = entry;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
      return entry;
    } catch (err) {
      console.error(`[${index + 1}/${total}] ⚠️ Attempt ${attempts}/${maxAttempts} failed for ${publicId}: ${err.message}`);
      if (attempts >= maxAttempts) {
        const failedEntry = {
          public_id: publicId,
          r2_key: targetKey,
          source_url: video.secure_url,
          source_bytes: expectedBytes,
          status: 'failed',
          error: err.message,
          failed_at: new Date().toISOString()
        };
        manifest[publicId] = failedEntry;
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
        return failedEntry;
      }
      // Backoff before retry
      await new Promise(r => setTimeout(r, attempts * 2000));
    }
  }
}

async function run() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('   TDV Phase 2: Cloudinary to Cloudflare R2 Video Migration     ');
  console.log('════════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(inventoryPath)) {
    console.error(`Error: Inventory file not found at ${inventoryPath}`);
    process.exit(1);
  }

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  const videos = inventory.videos || [];
  console.log(`Loaded ${videos.length} videos from inventory (${inventory.total_video_mb} MB).`);

  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log(`Loaded existing manifest with ${Object.keys(manifest).length} recorded items.`);
    } catch {
      manifest = {};
    }
  }

  let successCount = 0;
  let skippedCount = 0;
  let failCount = 0;
  let totalUploadedBytes = 0;

  for (let i = 0; i < videos.length; i++) {
    const res = await migrateSingleVideo(videos[i], i, videos.length, manifest);
    if (res.status === 'verified') {
      if (res.skipped) skippedCount++;
      else successCount++;
      totalUploadedBytes += res.uploaded_bytes;
    } else {
      failCount++;
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('                  Phase 2 Migration Summary                     ');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`Total Inventoried Videos:    ${videos.length}`);
  console.log(`Newly Uploaded & Verified:   ${successCount}`);
  console.log(`Already Verified (Skipped):  ${skippedCount}`);
  console.log(`Failed Assets:               ${failCount}`);
  console.log(`Total Bytes on R2:           ${totalUploadedBytes} (${(totalUploadedBytes / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`Manifest File:               ${manifestPath}`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failCount > 0) {
    console.error(`Migration finished with ${failCount} failures.`);
    process.exit(1);
  } else {
    console.log('🎉 All videos successfully verified on Cloudflare R2!');
  }
}

run().catch((err) => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
