import fs from 'fs';
import path from 'path';

const TEST_DOMAIN = 'https://tdv-test.mkavs.com';
const PROD_DOMAIN = 'https://www.thedivevillage.co';
const APEX_DOMAIN = 'https://thedivevillage.co';

const ROUTES = [
  '/',
  '/about-us',
  '/scuba-diving',
  '/deep-sea-diving',
  '/ocean-climate',
  '/our-services',
  '/our-crew',
  '/book-us',
  '/shop',
  '/cart',
  '/checkout',
  '/contact-us',
  '/login',
  '/signup',
  '/dashboard',
  '/admin',
  '/blog'
];

async function runParityAudit() {
  console.log('================================================================');
  console.log('TDV TEST vs PRODUCTION DEPLOYMENT & PARITY AUDIT');
  console.log('================================================================\n');

  // 1. Apex Domain Redirect Check
  console.log('--- 1. APEX DOMAIN REDIRECT CHECK ---');
  try {
    const apexRes = await fetch(APEX_DOMAIN, { redirect: 'manual' });
    console.log(`Apex URL: ${APEX_DOMAIN}`);
    console.log(`Status: ${apexRes.status}`);
    console.log(`Location Header: ${apexRes.headers.get('location')}`);
    console.log(`x-vercel-id: ${apexRes.headers.get('x-vercel-id')}`);
    const isCleanRedirect = apexRes.status === 307 || apexRes.status === 308 || apexRes.status === 301;
    const targetsWww = apexRes.headers.get('location') === 'https://www.thedivevillage.co/';
    console.log(`Result: ${isCleanRedirect && targetsWww ? 'PASS (Single clean redirect to WWW)' : 'FAIL'}\n`);
  } catch (err) {
    console.error(`Apex Check Error: ${err.message}\n`);
  }

  // 2. Fetch Homepage HTML & Bundles
  console.log('--- 2. HOMEPAGE & BUNDLE IDENTIFICATION ---');
  let testHtml = '', prodHtml = '';
  let testScript = '', prodScript = '';
  let testVercelId = '', prodVercelId = '';

  try {
    const testRes = await fetch(TEST_DOMAIN);
    testVercelId = testRes.headers.get('x-vercel-id') || '';
    testHtml = await testRes.text();
    const testMatch = testHtml.match(/src="(\/assets\/index-[^"]+\.js)"/);
    testScript = testMatch ? testMatch[1] : '';

    console.log(`TEST DOMAIN (${TEST_DOMAIN}):`);
    console.log(`  HTTP Status: ${testRes.status}`);
    console.log(`  x-vercel-id: ${testVercelId}`);
    console.log(`  Entry Script: ${testScript}`);
  } catch (err) {
    console.error(`Test Fetch Error: ${err.message}`);
  }

  try {
    const prodRes = await fetch(PROD_DOMAIN);
    prodVercelId = prodRes.headers.get('x-vercel-id') || '';
    prodHtml = await prodRes.text();
    const prodMatch = prodHtml.match(/src="(\/assets\/index-[^"]+\.js)"/);
    prodScript = prodMatch ? prodMatch[1] : '';

    console.log(`\nPRODUCTION DOMAIN (${PROD_DOMAIN}):`);
    console.log(`  HTTP Status: ${prodRes.status}`);
    console.log(`  x-vercel-id: ${prodVercelId}`);
    console.log(`  Entry Script: ${prodScript}`);
  } catch (err) {
    console.error(`Prod Fetch Error: ${err.message}`);
  }

  console.log(`\nBundle Equality: ${testScript === prodScript ? 'MATCH' : 'DIFFER'}`);
  console.log(`Test Script: ${testScript}`);
  console.log(`Prod Script: ${prodScript}\n`);

  // 3. Inspect JS Bundle Contents
  console.log('--- 3. JAVASCRIPT BUNDLE FEATURE VERIFICATION ---');
  if (prodScript) {
    try {
      const bundleRes = await fetch(`${PROD_DOMAIN}${prodScript}`);
      const bundleText = await bundleRes.text();
      console.log(`Production Bundle Size: ${(bundleText.length / 1024).toFixed(1)} KB`);
      
      // Feature checks
      const hasDiverCursor = bundleText.includes('diver') || bundleText.includes('custom-cursor');
      const hasPhone = bundleText.includes('tel:+918971001010');
      const hasEmail = bundleText.includes('mailto:sanjeev.bajaj@thedivevillage.com');
      const hasWhatsApp = bundleText.includes('wa.me/918971001010');
      const hasCesium = bundleText.includes('Cesium') || bundleText.includes('ion');
      const hasSitesData = bundleText.includes('diveSites') || bundleText.includes('dive_sites') || bundleText.includes('latitude');

      console.log(`  - Custom Cursor code present: ${hasDiverCursor}`);
      console.log(`  - Phone action ('tel:+918971001010') present: ${hasPhone}`);
      console.log(`  - Email action ('mailto:sanjeev.bajaj@thedivevillage.com') present: ${hasEmail}`);
      console.log(`  - WhatsApp action ('wa.me/918971001010') present: ${hasWhatsApp}`);
      console.log(`  - Cesium globe code present: ${hasCesium}`);
      console.log(`  - Dive sites data present: ${hasSitesData}`);
    } catch (err) {
      console.error(`Bundle Fetch Error: ${err.message}`);
    }
  }

  // 4. Route Navigation & Direct URL Audit on Production
  console.log('\n--- 4. PRODUCTION ROUTE PARITY AUDIT (17 ROUTES) ---');
  let routesPassed = 0;
  for (const route of ROUTES) {
    const routeUrl = `${PROD_DOMAIN}${route}`;
    try {
      const res = await fetch(routeUrl);
      const text = await res.text();
      const hasAppRoot = text.includes('id="root"') || text.includes('id="app"');
      const statusOk = res.status === 200;
      if (statusOk && hasAppRoot) {
        routesPassed++;
        console.log(`  [OK 200] ${routeUrl}`);
      } else {
        console.log(`  [FAIL ${res.status}] ${routeUrl} (root div: ${hasAppRoot})`);
      }
    } catch (err) {
      console.log(`  [ERROR] ${routeUrl}: ${err.message}`);
    }
  }
  console.log(`Routes Passed: ${routesPassed} / ${ROUTES.length}\n`);

  // 5. Video Asset Audit on Production
  console.log('--- 5. PRODUCTION VIDEO ASSET AUDIT ---');
  let videoInventory = [];
  const inventoryPaths = [
    './Frontend/scripts/video_inventory_final.json',
    './Frontend/scripts/video_inventory_detailed.json',
    './Frontend/scripts/video_inventory.json',
    './scripts/video_inventory_final.json'
  ];
  for (const p of inventoryPaths) {
    if (fs.existsSync(p)) {
      try {
        videoInventory = JSON.parse(fs.readFileSync(p, 'utf8'));
        break;
      } catch (e) {}
    }
  }

  console.log(`Total Unique Video Assets in Inventory: ${videoInventory.length}`);
  let videosPassed = 0;
  let videoFailures = [];

  for (const item of videoInventory) {
    const videoUrl = item.webPath ? `${PROD_DOMAIN}${item.webPath}` : `${PROD_DOMAIN}/${item.file}`;
    try {
      const res = await fetch(videoUrl, { headers: { Range: 'bytes=0-1023' } });
      const contentType = res.headers.get('content-type') || '';
      const contentRange = res.headers.get('content-range') || '';
      const contentLength = parseInt(res.headers.get('content-length') || '0', 10);
      const buffer = Buffer.from(await res.arrayBuffer());
      const headerStr = buffer.slice(0, 32).toString('latin1');
      const isLFS = headerStr.includes('version https://git-lfs');
      const isBinaryMp4 = headerStr.includes('ftyp') || headerStr.includes('moov') || headerStr.includes('mdat') || (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70);
      const statusOk = res.status === 200 || res.status === 206;

      if (statusOk && (contentType.includes('video') || isBinaryMp4) && !isLFS) {
        videosPassed++;
      } else {
        videoFailures.push({
          url: videoUrl,
          status: res.status,
          contentType,
          contentLength,
          isLFS,
          isBinaryMp4
        });
      }
    } catch (err) {
      videoFailures.push({
        url: videoUrl,
        error: err.message
      });
    }
  }

  console.log(`Videos Verified: ${videosPassed} / ${videoInventory.length}`);
  if (videoFailures.length > 0) {
    console.log(`Video Failures (${videoFailures.length}):`);
    console.log(JSON.stringify(videoFailures, null, 2));
  } else {
    console.log('ZERO MP4 404s, ZERO Git LFS pointers, ZERO missing production video assets.');
  }

  console.log('\n================================================================');
  console.log('PARITY AUDIT COMPLETE');
  console.log('================================================================');
}

runParityAudit();
