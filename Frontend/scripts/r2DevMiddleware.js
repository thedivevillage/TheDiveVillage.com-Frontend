import https from 'node:https';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 64,
  maxFreeSockets: 32,
  timeout: 60000,
});

// High-speed RAM cache for initial video headers and segments (0ms latency)
const rangeCache = new Map();
const MAX_CACHE_ENTRIES = 200;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read credentials from backend env
const envPaths = [
  path.resolve(__dirname, '../../../TheDiveVillage.com-Backend/server/.env'),
  path.resolve(__dirname, '../../../TheDiveVillage.com-Backend/server/env'),
  path.resolve(__dirname, '../.env.local'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env')
];

function getR2Credentials() {
  const env = {};
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
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
      } catch (e) {
        console.warn('[R2 Dev Media] Could not read env path:', envPath, e.message);
      }
    }
  }

  return {
    accessKeyId: env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || 'c94775f05ccec5fefaa79206167e5d18',
    secretAccessKey: env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || 'fb886b042d18e4c7118459b4435eb0da5af3986d86e0b320d6b8d80a943dcf37',
    bucket: env.R2_BUCKET_NAME || 'thedivevillage-media',
    endpoint: env.R2_ENDPOINT || 'https://e89adf53cebe848fd4e126c6b9d88d0c.r2.cloudflarestorage.com'
  };
}

let r2Creds = getR2Credentials();

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

function proxyToLiveApi(req, res, cleanKey, rangeHeader) {
  const encodedPath = cleanKey.split('/').map(encodeURIComponent).join('/');
  const targetUrl = new URL(`https://api.thedivevillage.com/media/${encodedPath}`);

  const extraHeaders = {
    'host': targetUrl.host,
    'user-agent': req.headers['user-agent'] || 'Vite-Dev-Proxy'
  };
  if (rangeHeader) {
    extraHeaders['range'] = rangeHeader;
  }
  if (req.headers['accept']) {
    extraHeaders['accept'] = req.headers['accept'];
  }

  const proxyReq = https.request({
    hostname: targetUrl.hostname,
    port: 443,
    path: targetUrl.pathname + (targetUrl.search || ''),
    method: req.method,
    headers: extraHeaders,
    agent: httpsAgent
  }, (proxyRes) => {
    res.statusCode = proxyRes.statusCode || 200;

    const forwardHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'etag',
      'last-modified'
    ];

    forwardHeaders.forEach(h => {
      if (proxyRes.headers[h]) {
        res.setHeader(h, proxyRes.headers[h]);
      }
    });

    const lowerKey = cleanKey.toLowerCase();
    if (lowerKey.endsWith('.m3u8')) {
      res.setHeader('content-type', 'application/x-mpegURL');
    } else if (lowerKey.endsWith('.ts')) {
      res.setHeader('content-type', 'video/MP2T');
    }

    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('cache-control', rangeHeader ? 'no-cache' : 'public, max-age=86400');

    if (req.method === 'HEAD') {
      res.end();
    } else {
      proxyRes.pipe(res);
    }
  });

  proxyReq.on('error', (err) => {
    console.error('[Live API Media Proxy] Error fetching', cleanKey, err);
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end('Bad Gateway');
    }
  });

  proxyReq.end();
}

const MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.m3u8': 'application/x-mpegURL',
  '.ts': 'video/MP2T',
};

function serveLocalMediaFile(req, res, filePath) {
  try {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const ext = path.extname(filePath).toLowerCase();

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', range ? 'no-cache' : 'public, max-age=86400');
    res.setHeader('X-Media-Source', 'LOCAL-DISK-FASTSTART');

    if (range && range.startsWith('bytes=')) {
      const parts = range.replace(/bytes=/, '').trim().split('-');
      let start = parts[0] ? parseInt(parts[0], 10) : NaN;
      let end = parts[1] ? parseInt(parts[1], 10) : NaN;

      if (isNaN(start)) {
        start = fileSize - end;
        end = fileSize - 1;
      } else if (isNaN(end)) {
        end = fileSize - 1;
      }

      if (isNaN(start) || start >= fileSize || end >= fileSize || start > end || start < 0) {
        res.statusCode = 416;
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        res.end();
        return;
      }

      const chunksize = end - start + 1;
      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunksize);

      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      const stream = fs.createReadStream(filePath, { start, end });
      stream.on('error', () => { if (!res.headersSent) { res.statusCode = 500; res.end(); } });
      stream.pipe(res);
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Length', fileSize);
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      const stream = fs.createReadStream(filePath);
      stream.on('error', () => { if (!res.headersSent) { res.statusCode = 500; res.end(); } });
      stream.pipe(res);
    }
  } catch (err) {
    console.error('[Local Media Error]', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Local media streaming error');
    }
  }
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
          // Always ensure fresh credentials from .env
          r2Creds = getR2Credentials();
          const hasR2Creds = Boolean(r2Creds.accessKeyId && r2Creds.secretAccessKey);

          let cleanKey = decodeURIComponent(urlPath.replace(/^\/media\//, ''));
          cleanKey = cleanKey.replace(/^\/+/, '');

          // Guard against path traversal
          if (cleanKey.includes('..') || cleanKey.includes('\0')) {
            res.statusCode = 400;
            res.end('Bad Request');
            return;
          }

          // 0. Super-fast local disk check: if file is already prepared on disk, serve in < 1ms
          const localDiskPath = path.resolve(__dirname, '../public/media', cleanKey);
          if (fs.existsSync(localDiskPath) && fs.statSync(localDiskPath).isFile()) {
            serveLocalMediaFile(req, res, localDiskPath);
            return;
          }

          const cacheKey = req.headers.range ? `${cleanKey}@${req.headers.range}` : null;
          if (cacheKey && rangeCache.has(cacheKey)) {
            const cached = rangeCache.get(cacheKey);
            res.statusCode = cached.statusCode || 206;
            for (const [k, v] of Object.entries(cached.headers)) {
              res.setHeader(k, v);
            }
            res.setHeader('x-r2-cache', 'HIT-RAM');
            if (req.method === 'HEAD') {
              res.end();
            } else {
              res.end(cached.buffer);
            }
            return;
          }

          if (!hasR2Creds) {
            proxyToLiveApi(req, res, cleanKey, req.headers.range);
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
            headers: signed.headers,
            agent: httpsAgent
          }, (r2Res) => {
            if (r2Res.statusCode && r2Res.statusCode >= 400) {
              res.statusCode = r2Res.statusCode;
              res.end('Not Found in R2');
              return;
            }

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
            res.setHeader('cache-control', req.headers.range ? 'no-cache' : 'public, max-age=86400');

            if (req.method === 'HEAD') {
              res.end();
            } else if (cacheKey && r2Res.statusCode === 206) {
              const chunks = [];
              let totalLen = 0;
              const maxCap = 1048576; // 1MB
              r2Res.on('data', (c) => {
                res.write(c);
                if (totalLen <= maxCap) {
                  chunks.push(c);
                  totalLen += c.length;
                }
              });
              r2Res.on('end', () => {
                res.end();
                if (totalLen <= maxCap && rangeCache.size < MAX_CACHE_ENTRIES) {
                  const headersToStore = {};
                  forwardHeaders.forEach((h) => {
                    if (r2Res.headers[h]) headersToStore[h] = r2Res.headers[h];
                  });
                  headersToStore['access-control-allow-origin'] = '*';
                  headersToStore['cache-control'] = 'no-cache';
                  rangeCache.set(cacheKey, {
                    statusCode: r2Res.statusCode,
                    headers: headersToStore,
                    buffer: Buffer.concat(chunks),
                  });
                }
              });
            } else {
              r2Res.pipe(res);
            }
          });

          r2Req.on('error', (err) => {
            console.error('[R2 Dev Media] Error fetching:', cleanKey, err);
            if (!res.headersSent) {
              res.statusCode = 502;
              res.end('R2 Gateway Error');
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
