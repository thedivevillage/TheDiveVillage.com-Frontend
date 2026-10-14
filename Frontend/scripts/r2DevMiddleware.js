import https from 'node:https';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read credentials from backend env
const envPaths = [
  path.resolve(__dirname, '../../../TheDiveVillage.com-Backend/server/.env'),
  path.resolve(__dirname, '../../../TheDiveVillage.com-Backend/server/env'),
  path.resolve(__dirname, '../.env')
];
const env = {};

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
        if (!env[k]) {
          env[k] = v;
        }
      }
    });
  }
}

const r2Creds = {
  accessKeyId: env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY,
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

function signS3Request({ method, key, headers = {} }) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const host = new URL(r2Creds.endpoint).host;

  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  const canonicalUri = `/${r2Creds.bucket}/${encodedKey}`;

  const normHeaders = {
    'host': host,
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
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
    'UNSIGNED-PAYLOAD'
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

export function r2DevMediaPlugin() {
  return {
    name: 'r2-dev-media',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlPath = req.url ? req.url.split('?')[0] : '';
        if (!urlPath.startsWith('/media/')) {
          return next();
        }

        if (req.method !== 'GET' && req.method !== 'HEAD') {
          return next();
        }

        try {
          let cleanKey = decodeURIComponent(urlPath.replace(/^\/media\//, ''));
          cleanKey = cleanKey.replace(/^\/+/, '');

          // Guard against path traversal
          if (cleanKey.includes('..') || cleanKey.includes('\0')) {
            res.statusCode = 400;
            res.end('Bad Request');
            return;
          }

          const extraHeaders = {};
          if (req.headers.range) {
            extraHeaders['range'] = req.headers.range;
          }

          const signed = signS3Request({
            method: req.method,
            key: cleanKey,
            headers: extraHeaders
          });

          const r2Req = https.request({
            hostname: signed.hostname,
            port: 443,
            path: signed.path,
            method: req.method,
            headers: signed.headers
          }, (r2Res) => {
            res.statusCode = r2Res.statusCode || 200;

            const forwardHeaders = [
              'content-type',
              'content-length',
              'content-range',
              'accept-ranges',
              'etag',
              'last-modified'
            ];

            forwardHeaders.forEach(h => {
              if (r2Res.headers[h]) {
                res.setHeader(h, r2Res.headers[h]);
              }
            });

            const lowerKey = cleanKey.toLowerCase();
            if (lowerKey.endsWith('.m3u8')) {
              res.setHeader('content-type', 'application/x-mpegURL');
            } else if (lowerKey.endsWith('.ts')) {
              res.setHeader('content-type', 'video/MP2T');
            }

            res.setHeader('access-control-allow-origin', '*');
            res.setHeader('cache-control', 'public, max-age=31536000, immutable');

            if (req.method === 'HEAD') {
              res.end();
            } else {
              r2Res.pipe(res);
            }
          });

          r2Req.on('error', (err) => {
            console.error('[R2 Dev Media] Error fetching', cleanKey, err);
            if (!res.headersSent) {
              res.statusCode = 502;
              res.end('Bad Gateway');
            }
          });

          r2Req.end();
        } catch (err) {
          console.error('[R2 Dev Media] Middleware error:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end('Internal Server Error');
          }
        }
      });
    }
  };
}
