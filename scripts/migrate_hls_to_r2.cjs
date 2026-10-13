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
  bucket: env.R2_BUCKET_NAME || 'thedivevillage-media',
  endpoint: env.R2_ENDPOINT || 'https://e89adf53cebe848fd4e126c6b9d88d0c.r2.cloudflarestorage.com'
};

console.log('Using R2 bucket:', r2Creds.bucket);
console.log('Using R2 endpoint:', r2Creds.endpoint);

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

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function uploadBufferToR2(buffer, targetKey, contentType) {
  return new Promise((resolve, reject) => {
    const payloadHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const signed = signS3Request({
      method: 'PUT',
      key: targetKey,
      headers: {
        'content-length': String(buffer.length),
        'content-type': contentType
      },
      payloadHash
    });

    const req = https.request({
      hostname: signed.hostname,
      port: 443,
      path: signed.path,
      method: 'PUT',
      headers: signed.headers
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({
            statusCode: res.statusCode,
            etag: (res.headers['etag'] || '').replace(/"/g, ''),
            bytes: buffer.length
          });
        } else {
          reject(new Error(`R2 upload of ${targetKey} failed: HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.end(buffer);
  });
}

function streamCloudinaryToR2(sourceUrl, targetKey, expectedBytes, contentType) {
  return new Promise((resolve, reject) => {
    const client = sourceUrl.startsWith('https') ? https : http;
    const downloadReq = client.get(sourceUrl, (downloadRes) => {
      if (downloadRes.statusCode >= 300 && downloadRes.statusCode < 400 && downloadRes.headers.location) {
        return streamCloudinaryToR2(downloadRes.headers.location, targetKey, expectedBytes, contentType)
          .then(resolve)
          .catch(reject);
      }
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

      uploadReq.on('error', (err) => {
        downloadReq.destroy();
        reject(err);
      });

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
        uploadReq.destroy();
        reject(err);
      });
    });

    downloadReq.on('error', reject);
  });
}

const backgroundVideos = [
  {
    name: 'ClownFish',
    masterUrl: 'https://res.cloudinary.com/qvbunv8y/video/upload/sp_4k/v1791626590/TDV-Media/Background/ClownFish.m3u8'
  },
  {
    name: 'baracuda',
    masterUrl: 'https://res.cloudinary.com/qvbunv8y/video/upload/sp_4k/v1791627870/TDV-Media/Background/baracuda.m3u8'
  },
  {
    name: 'Turtle',
    masterUrl: 'https://res.cloudinary.com/qvbunv8y/video/upload/sp_4k/v1791626669/TDV-Media/Background/Turtle.m3u8'
  },
  {
    name: 'Night_Dive',
    masterUrl: 'https://res.cloudinary.com/qvbunv8y/video/upload/sp_4k/v1791626977/TDV-Media/Background/Night_Dive.m3u8'
  }
];

async function migrateAsset(asset) {
  console.log(`\n======================================================`);
  console.log(`Processing HLS package: ${asset.name}`);
  console.log(`Master URL: ${asset.masterUrl}`);

  const masterContent = await fetchText(asset.masterUrl);
  const lines = masterContent.split('\n');

  const newMasterLines = [];
  let renditionIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#EXT-X-STREAM-INF')) {
      newMasterLines.push(line);
      const subPath = lines[i + 1].trim();
      i++; // skip next line in loop since we consume it

      const subUrl = 'https://res.cloudinary.com' + subPath;
      const resMatch = line.match(/RESOLUTION=([0-9x]+)/);
      const resName = resMatch ? resMatch[1] : `rendition_${renditionIndex}`;

      const renditionFileName = `rendition_${resName}.m3u8`;
      const tsFileName = `segment_${resName}.ts`;
      const r2Prefix = `TDV-Media/HLS/${asset.name}`;

      const r2TsKey = `${r2Prefix}/${tsFileName}`;
      const r2SubKey = `${r2Prefix}/${renditionFileName}`;

      console.log(`\n  [Rendition ${resName}]`);
      console.log(`  Sub-playlist source: ${subUrl}`);

      const subPlaylistText = await fetchText(subUrl);

      // Find the .ts filename used in this sub-playlist
      const tsMatch = subPlaylistText.match(/([a-zA-Z0-9_\-]+\.ts)/);
      if (!tsMatch) {
        throw new Error(`Could not find .ts reference in sub-playlist for ${asset.name} ${resName}`);
      }
      const origTsName = tsMatch[1];
      const subBaseUrl = subUrl.substring(0, subUrl.lastIndexOf('/') + 1);
      const origTsUrl = subBaseUrl + origTsName;

      // Check if .ts already exists on R2
      const existingTs = await headR2Object(r2TsKey);
      if (existingTs.statusCode === 200 && existingTs.contentLength > 0) {
        console.log(`  -> TS segment already verified on R2 (${existingTs.contentLength} bytes): ${r2TsKey}`);
      } else {
        console.log(`  -> Streaming TS to R2 (${origTsUrl} -> ${r2TsKey})...`);
        const tsResult = await streamCloudinaryToR2(origTsUrl, r2TsKey, 0, 'video/MP2T');
        console.log(`  -> Uploaded TS: ${tsResult.bytesStreamed} bytes (ETag: ${tsResult.etag})`);
      }

      // Rewrite sub-playlist to reference the local segment_*.ts
      const rewrittenSub = subPlaylistText.split(origTsName).join(tsFileName);

      // Upload rewritten sub-playlist to R2
      console.log(`  -> Uploading rewritten sub-playlist: ${r2SubKey}`);
      await uploadBufferToR2(Buffer.from(rewrittenSub, 'utf8'), r2SubKey, 'application/x-mpegURL');

      newMasterLines.push(renditionFileName);
      renditionIndex++;
    } else {
      newMasterLines.push(line);
    }
  }

  // Upload rewritten master playlist
  const r2MasterKey = `TDV-Media/HLS/${asset.name}/master.m3u8`;
  const rewrittenMaster = newMasterLines.join('\n');
  console.log(`\n  -> Uploading master playlist to R2: ${r2MasterKey}`);
  await uploadBufferToR2(Buffer.from(rewrittenMaster, 'utf8'), r2MasterKey, 'application/x-mpegURL');

  // Verify master playlist
  const headMaster = await headR2Object(r2MasterKey);
  console.log(`  -> Master verified: HTTP ${headMaster.statusCode}, ${headMaster.contentLength} bytes, Type: ${headMaster.contentType}`);
}

async function main() {
  console.log('Starting Cloudflare R2 HLS Migration for 360 VR Videos...');
  const startTime = Date.now();

  for (const asset of backgroundVideos) {
    await migrateAsset(asset);
  }

  console.log(`\n======================================================`);
  console.log(`All HLS packages successfully migrated to R2! Total time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

main().catch((err) => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
