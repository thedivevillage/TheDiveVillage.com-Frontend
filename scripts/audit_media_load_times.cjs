const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const srcDir = path.resolve(__dirname, '../Frontend/src');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getFiles(full));
    } else if (/\.(js|jsx|ts|tsx)$/.test(item.name)) {
      results.push(full);
    }
  }
  return results;
}

const files = getFiles(srcDir);
const urlRegex = /https:\/\/[^\s'"`)]+\.(mp4|mov|webm|m4v|jpg|jpeg|png|webp|glb|mp3|svg|ico)/gi;
const allUrls = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    allUrls.add(match[0]);
  }
});

console.log('Total unique media URLs extracted:', allUrls.size);

function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const start = Date.now();
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'] || '';
      const contentLength = res.headers['content-length'] || 0;
      res.destroy();
      resolve({ url, statusCode, duration, contentType, contentLength });
    });
    req.on('error', (err) => {
      resolve({ url, statusCode: 0, duration: Date.now() - start, error: err.message });
    });
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ url, statusCode: 408, duration: 10000, error: 'Timeout' });
    });
  });
}

async function run() {
  const urls = Array.from(allUrls);
  const results = [];
  const concurrency = 15;
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(checkUrl));
    results.push(...batchResults);
    process.stdout.write(`Tested ${results.length}/${urls.length} URLs...\r`);
  }

  const ok = results.filter(r => r.statusCode >= 200 && r.statusCode < 400);
  const broken = results.filter(r => r.statusCode < 200 || r.statusCode >= 400);

  console.log('\n\n================ AUDIT SUMMARY ================');
  console.log('Total Media URLs:', results.length);
  console.log('Working (200 OK):', ok.length);
  console.log('Broken (404/Err):', broken.length);

  const avgDuration = Math.round(ok.reduce((acc, r) => acc + r.duration, 0) / (ok.length || 1));
  console.log('Average Latency :', avgDuration + 'ms');

  // Breakdown by media category/type
  const byType = {};
  ok.forEach(r => {
    const ext = path.extname(r.url.split('?')[0]).toLowerCase();
    if (!byType[ext]) byType[ext] = { count: 0, totalDuration: 0, min: 9999, max: 0 };
    byType[ext].count++;
    byType[ext].totalDuration += r.duration;
    if (r.duration < byType[ext].min) byType[ext].min = r.duration;
    if (r.duration > byType[ext].max) byType[ext].max = r.duration;
  });

  console.log('\n--- Latency Breakdown by File Format ---');
  for (const [ext, stat] of Object.entries(byType)) {
    const avg = Math.round(stat.totalDuration / stat.count);
    console.log(`${ext.padEnd(6)}: ${stat.count} files | Avg: ${avg}ms | Min: ${stat.min}ms | Max: ${stat.max}ms`);
  }

  if (broken.length > 0) {
    console.log('\n--- Broken Media URLs ---');
    broken.forEach(b => console.log(`[HTTP ${b.statusCode}] ${b.url}`));
  }

  fs.writeFileSync(path.resolve(__dirname, '../media_audit_results.json'), JSON.stringify({
    summary: { total: results.length, ok: ok.length, broken: broken.length, avgDurationMs: avgDuration, byType },
    broken,
    results
  }, null, 2));
}

run();
