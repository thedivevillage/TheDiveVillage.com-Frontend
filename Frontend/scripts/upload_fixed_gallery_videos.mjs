import https from 'node:https';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const r2Creds = {
  accessKeyId: process.env.R2_ACCESS_KEY_ID || 'c94775f05ccec5fefaa79206167e5d18',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'fb886b042d18e4c7118459b4435eb0da5af3986d86e0b320d6b8d80a943dcf37',
  bucket: process.env.R2_BUCKET_NAME || 'thedivevillage-media',
  endpoint: process.env.R2_ENDPOINT || 'https://e89adf53cebe848fd4e126c6b9d88d0c.r2.cloudflarestorage.com'
};

console.log('Target Bucket:', r2Creds.bucket);
console.log('Target Endpoint:', r2Creds.endpoint);

function hmac(key, string) {
  return crypto.createHmac('sha256', key).update(string, 'utf8').digest();
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = hmac('AWS4' + key, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  return hmac(kService, 'aws4_request');
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

const uploads = [
  {
    localPath: path.resolve(__dirname, '../public/media/videos/Magnificent_Sea_Anemone.mp4'),
    r2Key: 'TDV-Media/Extras for Gallery/Magnificent_Sea_Anemone.mp4',
    contentType: 'video/mp4'
  },
  {
    localPath: path.resolve(__dirname, '../public/media/videos/Manta_Ray_2.mp4'),
    r2Key: 'TDV-Media/Extras for Gallery/Manta_Ray_2.mp4',
    contentType: 'video/mp4'
  },
  {
    localPath: path.resolve(__dirname, '../public/media/videos/Magnificent_Sea_Anemone_thumb.webp'),
    r2Key: 'TDV-Media/Extras for Gallery/posters/Magnificent_Sea_Anemone_thumb.webp',
    contentType: 'image/webp'
  },
  {
    localPath: path.resolve(__dirname, '../public/media/videos/Manta_Ray_2_thumb.webp'),
    r2Key: 'TDV-Media/Extras for Gallery/posters/Manta_Ray_2_thumb.webp',
    contentType: 'image/webp'
  }
];

async function run() {
  for (const item of uploads) {
    if (!fs.existsSync(item.localPath)) {
      console.error('File not found:', item.localPath);
      continue;
    }
    const buffer = fs.readFileSync(item.localPath);
    console.log(`Uploading ${path.basename(item.localPath)} (${(buffer.length / 1024 / 1024).toFixed(2)} MB) -> ${item.r2Key}...`);
    try {
      const res = await putObject(item.r2Key, buffer, item.contentType);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(` SUCCESS [${res.statusCode}] -> https://media.thedivevillage.com/${encodeURI(item.r2Key)}`);
      } else {
        console.error(` FAILED [${res.statusCode}]`, res.data);
      }
    } catch (err) {
      console.error(` ERROR:`, err.message);
    }
  }
}

run();
