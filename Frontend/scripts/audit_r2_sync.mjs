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

async function checkAll() {
  console.log(`Checking ${allFiles.length} files in public/media against R2...`);
  let inR2 = 0;
  let missing = [];

  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    const relKey = path.relative(mediaDir, file).replace(/\\/g, '/');
    const key = relKey.startsWith('TDV-Media/') ? relKey : `TDV-Media/${relKey}`;
    // Also try without TDV-Media if thumbnails
    let res = await headObject(relKey);
    if (res.statusCode !== 200 && key !== relKey) {
      res = await headObject(key);
    }

    if (res.statusCode === 200) {
      inR2++;
    } else {
      missing.push({ file, relKey, key });
    }
    if ((i + 1) % 25 === 0 || i === allFiles.length - 1) {
      console.log(`Progress: ${i + 1}/${allFiles.length} (In R2: ${inR2}, Missing: ${missing.length})`);
    }
  }

  console.log('\n=== RESULT ===');
  console.log(`Total: ${allFiles.length}`);
  console.log(`In R2: ${inR2}`);
  console.log(`Missing from R2: ${missing.length}`);
  if (missing.length > 0) {
    console.log('\nMissing sample:');
    missing.slice(0, 20).forEach(m => console.log(' - ' + m.relKey));
  }
}

checkAll();
