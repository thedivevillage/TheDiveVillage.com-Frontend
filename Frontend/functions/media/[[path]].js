export async function onRequest(context) {
  const { request, env } = context;

  // 1. Only allow GET and HEAD
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' }
    });
  }

  // 2. Extract and sanitize object key
  const url = new URL(request.url);
  const rawPath = url.pathname.replace(/^\/media\/?/, '');
  if (!rawPath) {
    return new Response('Not Found', { status: 404 });
  }

  let key;
  try {
    key = decodeURIComponent(rawPath);
  } catch {
    return new Response('Bad Request: Invalid URL encoding', { status: 400 });
  }

  // Path traversal and safety checks
  if (key.includes('..') || key.startsWith('/') || key.includes('\0')) {
    return new Response('Forbidden: Invalid path', { status: 403 });
  }

  const bucket = env?.MEDIA_BUCKET;
  if (!bucket) {
    // Graceful fallback: proxy to API server media streaming endpoint
    const backendUrl = `https://api.thedivevillage.com/media/${encodeURI(key)}`;
    const backendReq = new Request(backendUrl, request);
    return fetch(backendReq);
  }

  // Determine Content-Type based on extension
  const ext = key.toLowerCase().split('.').pop();
  let contentType = 'application/octet-stream';
  if (ext === 'mp4') contentType = 'video/mp4';
  else if (ext === 'webm') contentType = 'video/webm';
  else if (ext === 'mov') contentType = 'video/quicktime';
  else if (ext === 'mp3') contentType = 'audio/mpeg';
  else if (ext === 'm3u8') contentType = 'application/x-mpegURL';
  else if (ext === 'ts') contentType = 'video/MP2T';

  // 3. Handle HEAD request
  if (request.method === 'HEAD') {
    const object = await bucket.head(key);
    if (!object) {
      return new Response(null, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', String(object.size));
    headers.set('Accept-Ranges', 'bytes');
    headers.set('ETag', `"${object.httpEtag || object.etag}"`);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    return new Response(null, { status: 200, headers });
  }

  // 4. Handle GET request (with Range support)
  const rangeHeader = request.headers.get('Range') || request.headers.get('range');

  if (rangeHeader) {
    // Check object existence and size first
    const headObj = await bucket.head(key);
    if (!headObj) {
      return new Response('Not Found', { status: 404 });
    }

    const totalSize = headObj.size;

    // Parse Range header: bytes=start-end, bytes=start-, or bytes=-suffix
    const match = rangeHeader.trim().match(/^bytes=(\d*)-(\d*)$/);
    if (!match) {
      return new Response('Invalid Range format', {
        status: 416,
        headers: {
          'Content-Range': `bytes */${totalSize}`,
          'Accept-Ranges': 'bytes'
        }
      });
    }

    const [_, startStr, endStr] = match;
    let start, end;

    if (startStr === '' && endStr === '') {
      return new Response('Invalid Range values', {
        status: 416,
        headers: {
          'Content-Range': `bytes */${totalSize}`,
          'Accept-Ranges': 'bytes'
        }
      });
    } else if (startStr === '') {
      // Suffix range: bytes=-500 (last 500 bytes)
      const suffix = parseInt(endStr, 10);
      if (suffix === 0) {
        return new Response('Empty suffix range', {
          status: 416,
          headers: { 'Content-Range': `bytes */${totalSize}`, 'Accept-Ranges': 'bytes' }
        });
      }
      start = Math.max(0, totalSize - suffix);
      end = totalSize - 1;
    } else if (endStr === '') {
      // Open-ended range: bytes=1000-
      start = parseInt(startStr, 10);
      end = totalSize - 1;
    } else {
      // Closed range: bytes=1000-2000
      start = parseInt(startStr, 10);
      end = parseInt(endStr, 10);
    }

    // Validate bounds
    if (start < 0 || start >= totalSize || end < start) {
      return new Response('Range Not Satisfiable', {
        status: 416,
        headers: {
          'Content-Range': `bytes */${totalSize}`,
          'Accept-Ranges': 'bytes'
        }
      });
    }

    // Cap end at totalSize - 1
    end = Math.min(end, totalSize - 1);
    const rangeLength = end - start + 1;

    // Fetch bounded byte range directly from R2
    const object = await bucket.get(key, {
      range: { offset: start, length: rangeLength }
    });

    if (!object) {
      return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', String(rangeLength));
    headers.set('Content-Range', `bytes ${start}-${end}/${totalSize}`);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('ETag', `"${object.httpEtag || object.etag}"`);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    return new Response(object.body, { status: 206, headers });
  }

  // 5. Full GET request (no Range header)
  const object = await bucket.get(key);
  if (!object) {
    return new Response('Not Found', { status: 404 });
  }

  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Content-Length', String(object.size));
  headers.set('Accept-Ranges', 'bytes');
  headers.set('ETag', `"${object.httpEtag || object.etag}"`);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  return new Response(object.body, { status: 200, headers });
}
