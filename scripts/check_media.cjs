const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const workspaceRoot = path.resolve(__dirname, '..');
const frontendDir = path.join(workspaceRoot, 'Frontend');
const srcDir = path.join(frontendDir, 'src');

let mapping = {};
const mapPath = path.join(workspaceRoot, 'cloudinary_mapping.json');
const rootMapPath = path.resolve(__dirname, '../../cloudinary_mapping.json');
if (fs.existsSync(rootMapPath)) {
  mapping = JSON.parse(fs.readFileSync(rootMapPath, 'utf8'));
} else if (fs.existsSync(mapPath)) {
  mapping = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
}

console.log('Mapping loaded with', Object.keys(mapping).length, 'keys');

function getAllFiles(dir, exts = ['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css']) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== '.git' && item.name !== 'dist') {
        res = res.concat(getAllFiles(full, exts));
      }
    } else if (exts.includes(path.extname(item.name).toLowerCase())) {
      res.push(full);
    }
  }
  return res;
}

const files = getAllFiles(srcDir);

// 1. Collect all video references
// Remote URLs:
const remoteUrlRegex = /(https?:\/\/[^\s'"`,;()]+\.(mp4|webm|mov|m4v)[^\s'"`,;()]*|https?:\/\/res\.cloudinary\.com[^\s'"`,;()]*\/video\/upload\/[^\s'"`,;()]+)/gi;
// Local paths in imports or requires or strings:
const localRefRegex = /['"](\.[^'"]*?\.(mp4|webm|mov|m4v|MP4|MOV))['"]/g;

const remoteUrls = new Map();
const localRefs = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = remoteUrlRegex.exec(content)) !== null) {
    const url = m[0].replace(/[',;)]+$/, '');
    if (!remoteUrls.has(url)) {
      remoteUrls.set(url, []);
    }
    remoteUrls.get(url).push(path.relative(frontendDir, file));
  }
  while ((m = localRefRegex.exec(content)) !== null) {
    const relRef = m[1];
    localRefs.push({
      ref: relRef,
      referencingFile: file,
      relFile: path.relative(frontendDir, file)
    });
  }
}

console.log(`\nFound ${remoteUrls.size} unique remote video URLs.`);
console.log(`Found ${localRefs.length} local video file references.`);

// Check local references
console.log('\n--- CHECKING LOCAL VIDEO REFERENCES ---');
const missingLocal = [];
for (const item of localRefs) {
  const dir = path.dirname(item.referencingFile);
  const resolved = path.resolve(dir, item.ref);
  if (!fs.existsSync(resolved)) {
    missingLocal.push({
      ref: item.ref,
      referencingFile: item.relFile,
      resolvedPath: resolved
    });
  }
}

if (missingLocal.length === 0) {
  console.log('All local video references exist on disk!');
} else {
  console.log(`FOUND ${missingLocal.length} BROKEN LOCAL VIDEO REFERENCES:`);
  for (const m of missingLocal) {
    console.log(` - File: ${m.referencingFile}`);
    console.log(`   Import/Ref: ${m.ref}`);
    console.log(`   Resolved to missing: ${m.resolvedPath}`);
  }
}

// Function to check remote URL via HTTP HEAD/GET
function testUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const mod = parsed.protocol === 'https:' ? https : http;
      const req = mod.request(parsed, {
        method: 'HEAD',
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ status: res.statusCode, ok: true, contentType: res.headers['content-type'] });
        } else if (res.statusCode === 405) {
          // If HEAD not allowed, try range GET
          const getReq = mod.request(parsed, {
            method: 'GET',
            headers: { Range: 'bytes=0-100', 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
          }, (getRes) => {
            getRes.destroy();
            resolve({
              status: getRes.statusCode,
              ok: getRes.statusCode >= 200 && getRes.statusCode < 400,
              contentType: getRes.headers['content-type']
            });
          });
          getReq.on('error', (err) => resolve({ status: 'ERR', ok: false, error: err.message }));
          getReq.on('timeout', () => { getReq.destroy(); resolve({ status: 'TIMEOUT', ok: false }); });
          getReq.end();
        } else {
          resolve({ status: res.statusCode, ok: false });
        }
      });
      req.on('error', (err) => resolve({ status: 'ERR', ok: false, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT', ok: false }); });
      req.end();
    } catch (e) {
      resolve({ status: 'INVALID_URL', ok: false, error: e.message });
    }
  });
}

async function verifyAllRemoteUrls() {
  console.log('\n--- VERIFYING REMOTE VIDEO URLS (HTTP STATUS) ---');
  let failed = [];
  let passed = 0;
  const urlList = Array.from(remoteUrls.keys());
  
  for (let i = 0; i < urlList.length; i++) {
    const url = urlList[i];
    const res = await testUrl(url);
    if (res.ok) {
      passed++;
      console.log(`[PASS] (${i + 1}/${urlList.length}) ${res.status} [${res.contentType || 'n/a'}]: ${url.substring(0, 90)}...`);
    } else {
      failed.push({ url, status: res.status, error: res.error, files: remoteUrls.get(url) });
      console.log(`[FAIL] (${i + 1}/${urlList.length}) Status: ${res.status}: ${url}`);
    }
  }
  
  console.log(`\nRemote Check Summary: ${passed} passed, ${failed.length} failed out of ${urlList.length}.`);
  if (failed.length > 0) {
    console.log('\nFAILED URLS:');
    for (const f of failed) {
      console.log(`- URL: ${f.url}`);
      console.log(`  Status: ${f.status} ${f.error || ''}`);
      console.log(`  Used in: ${f.files.join(', ')}`);
    }
  }
}

async function run() {
  await verifyAllRemoteUrls();
}

run();
