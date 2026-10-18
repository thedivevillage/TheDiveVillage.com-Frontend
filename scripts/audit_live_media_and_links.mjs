import fs from 'fs';
import path from 'path';

const PROD_BASE = 'https://www.thedivevillage.com';
const srcDir = './Frontend/src';

function findFiles(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name !== 'node_modules' && f.name !== '.git') {
        files = files.concat(findFiles(full));
      }
    } else if (/\.(jsx?|tsx?|json)$/.test(f.name)) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = findFiles(srcDir);
const mediaPaths = new Set();
const remoteUrls = new Set();
const internalRoutes = new Set();

for (const file of allFiles) {
  const text = fs.readFileSync(file, 'utf8');

  // Find /media/... paths that have an actual file extension
  const mediaMatches = text.matchAll(/['"`](\/media\/[^'"`\s\)\},]+\.[a-zA-Z0-9]+)['"`]/g);
  for (const m of mediaMatches) {
    const clean = m[1].replace(/[',;)]+$/, '');
    mediaPaths.add(clean);
  }

  // Find Remote URLs
  const remoteMatches = text.matchAll(/['"`](https:\/\/[^'"`\s\)\},]+\.[a-zA-Z0-9]+)['"`]/g);
  for (const m of remoteMatches) {
    const clean = m[1].replace(/[',;)]+$/, '');
    if (
      clean.includes('res.cloudinary.com') ||
      clean.includes('thedivevillage.com') ||
      clean.includes('.mp4') ||
      clean.includes('.webm') ||
      clean.includes('.webp') ||
      clean.includes('.png') ||
      clean.includes('.jpg') ||
      clean.includes('.glb')
    ) {
      remoteUrls.add(clean);
    }
  }

  // Find internal navigation links to /...
  const routeMatches = text.matchAll(/(?:to|href)=['"`](\/[a-zA-Z0-9_\-\/]+)['"`]/g);
  for (const m of routeMatches) {
    const r = m[1];
    if (!r.startsWith('/media') && !r.startsWith('/assets') && !r.startsWith('/data')) {
      internalRoutes.add(r);
    }
  }
}

console.log(`Auditing:`);
console.log(`- ${mediaPaths.size} local /media/* paths`);
console.log(`- ${remoteUrls.size} remote asset URLs`);
console.log(`- ${internalRoutes.size} internal navigation routes`);

async function testUrl(url) {
  try {
    const res = await fetch(url, {
      headers: { Range: 'bytes=0-100', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000),
    });
    const isCloudflare = (res.headers.get('server') || '').toLowerCase().includes('cloudflare') || !!res.headers.get('cf-ray');
    return {
      url,
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
      contentType: res.headers.get('content-type'),
      isCloudflare,
      server: res.headers.get('server'),
      cfRay: res.headers.get('cf-ray'),
      acceptRanges: res.headers.get('accept-ranges') || res.headers.get('content-range'),
    };
  } catch (err) {
    return { url, status: 'TIMEOUT/ERROR', ok: false, error: err.message };
  }
}

async function runPool(items, fn, concurrency = 8) {
  const results = [];
  const queue = [...items];
  const workers = Array(concurrency).fill(null).map(async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      const res = await fn(item);
      results.push(res);
    }
  });
  await Promise.all(workers);
  return results;
}

async function run() {
  console.log('\n================ 1. AUDITING /media/* ASSETS ON PRODUCTION ================');
  const mediaList = Array.from(mediaPaths);
  const mediaResults = await runPool(mediaList, async (p) => {
    const fullUrl = `${PROD_BASE}${p}`;
    const res = await testUrl(fullUrl);
    return { path: p, ...res };
  }, 10);

  const mediaPassed = mediaResults.filter(r => r.ok);
  const mediaBroken = mediaResults.filter(r => !r.ok);
  const cloudflareCount = mediaPassed.filter(r => r.isCloudflare).length;

  console.log(`Media Assets: ${mediaPassed.length} passed (${cloudflareCount} confirmed via Cloudflare edge), ${mediaBroken.length} failed out of ${mediaList.length}.`);
  if (mediaBroken.length > 0) {
    console.log('\nBROKEN /media/* LINKS:');
    mediaBroken.forEach(b => console.log(`  ❌ [${b.status}] ${b.path} (error: ${b.error || ''})`));
  }

  console.log('\n================ 2. AUDITING REMOTE MEDIA ASSETS ================');
  const remoteList = Array.from(remoteUrls);
  const remoteResults = await runPool(remoteList, async (u) => {
    const res = await testUrl(u);
    return res;
  }, 10);

  const remotePassed = remoteResults.filter(r => r.ok);
  const remoteBroken = remoteResults.filter(r => !r.ok);
  console.log(`Remote Assets: ${remotePassed.length} passed, ${remoteBroken.length} failed out of ${remoteList.length}.`);
  if (remoteBroken.length > 0) {
    console.log('\nBROKEN REMOTE ASSETS:');
    remoteBroken.forEach(b => console.log(`  ❌ [${b.status}] ${b.url} (error: ${b.error || ''})`));
  }

  console.log('\n================ 3. AUDITING INTERNAL APPLICATION ROUTES ================');
  const routeList = Array.from(internalRoutes);
  const routeResults = await runPool(routeList, async (r) => {
    const fullUrl = `${PROD_BASE}${r}`;
    const res = await testUrl(fullUrl);
    return { route: r, ...res };
  }, 10);

  const routesPassed = routeResults.filter(r => r.ok);
  const routesBroken = routeResults.filter(r => !r.ok);
  console.log(`Routes: ${routesPassed.length} passed, ${routesBroken.length} failed out of ${routeList.length}.`);
  if (routesBroken.length > 0) {
    console.log('\nBROKEN ROUTES:');
    routesBroken.forEach(b => console.log(`  ❌ [${b.status}] ${b.route} (error: ${b.error || ''})`));
  }

  const report = {
    timestamp: new Date().toISOString(),
    media: { total: mediaList.length, passed: mediaPassed.length, cloudflare: cloudflareCount, broken: mediaBroken },
    remote: { total: remoteList.length, passed: remotePassed.length, broken: remoteBroken },
    routes: { total: routeList.length, passed: routesPassed.length, broken: routesBroken },
  };

  fs.writeFileSync('./scripts/audit_report.json', JSON.stringify(report, null, 2));
  console.log('\nFull audit saved to ./scripts/audit_report.json');
}

run();
