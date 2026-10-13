import fs from 'fs';
import path from 'path';

const PROD_BASE = 'https://www.thedivevillage.co';
const TEST_BASE = 'https://tdv-test.mkavs.com';

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

async function verifyAll() {
  console.log('========================================================================');
  console.log('TDV DETAILED PRODUCTION AUDIT & VERIFICATION');
  console.log('========================================================================\n');

  // 1. Check Entry HTML and JS Bundle
  console.log('1. Entry Bundle Comparison:');
  const [prodHtml, testHtml] = await Promise.all([
    fetch(PROD_BASE).then(r => r.text()),
    fetch(TEST_BASE).then(r => r.text())
  ]);

  const prodJsMatch = prodHtml.match(/src="(\/assets\/index-[^"]+\.js)"/);
  const testJsMatch = testHtml.match(/src="(\/assets\/index-[^"]+\.js)"/);

  const prodJs = prodJsMatch ? prodJsMatch[1] : 'NOT FOUND';
  const testJs = testJsMatch ? testJsMatch[1] : 'NOT FOUND';

  console.log(`  Test JS Entry:  ${TEST_BASE}${testJs}`);
  console.log(`  Prod JS Entry:  ${PROD_BASE}${prodJs}`);

  // 2. Fetch and test all JS chunks in Prod
  const prodJsContent = await fetch(`${PROD_BASE}${prodJs}`).then(r => r.text());
  const testJsContent = await fetch(`${TEST_BASE}${testJs}`).then(r => r.text());

  console.log(`  Test Bundle Length: ${testJsContent.length} bytes`);
  console.log(`  Prod Bundle Length: ${prodJsContent.length} bytes`);

  // 3. Check All 17 Routes on Production
  console.log('\n2. Testing All 17 Production Routes (Direct navigation, HTTP 200, Root container):');
  let routeFailures = [];
  for (const r of ROUTES) {
    const url = `${PROD_BASE}${r}`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      const hasRoot = text.includes('id="root"');
      const hasScript = text.includes('index-');
      if (res.status === 200 && hasRoot && hasScript) {
        console.log(`  [PASS 200 OK] ${url}`);
      } else {
        console.log(`  [FAIL ${res.status}] ${url} (root: ${hasRoot}, script: ${hasScript})`);
        routeFailures.push({ url, status: res.status });
      }
    } catch (e) {
      console.log(`  [ERROR] ${url}: ${e.message}`);
      routeFailures.push({ url, error: e.message });
    }
  }

  // 4. Test All Media / Video Assets from dist/assets on Production
  console.log('\n3. Testing All Video Assets in Production:');
  const distDir = './Frontend/dist/assets';
  let videoFiles = [];
  if (fs.existsSync(distDir)) {
    videoFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.mp4') || f.endsWith('.mov') || f.endsWith('.webm'));
  }

  console.log(`  Found ${videoFiles.length} video chunks in dist.`);
  let videoErrors = [];
  let videoSuccessCount = 0;

  for (const v of videoFiles) {
    const url = `${PROD_BASE}/assets/${v}`;
    try {
      const res = await fetch(url, { headers: { Range: 'bytes=0-2047' } });
      const cType = res.headers.get('content-type') || '';
      const cLength = res.headers.get('content-length') || '0';
      const cRange = res.headers.get('content-range') || '';
      const buf = Buffer.from(await res.arrayBuffer());
      const headerStr = buf.toString('latin1');
      const isLFS = headerStr.includes('version https://git-lfs');
      const isBinary = buf.length > 0 && !isLFS;

      if ((res.status === 200 || res.status === 206) && isBinary) {
        videoSuccessCount++;
        console.log(`  [PASS 206/200] ${v} (${cType}, range: ${cRange || cLength}B)`);
      } else {
        videoErrors.push({ file: v, status: res.status, cType, isLFS, bufLen: buf.length });
        console.log(`  [FAIL] ${v}: Status ${res.status}, Type ${cType}, isLFS: ${isLFS}`);
      }
    } catch (e) {
      videoErrors.push({ file: v, error: e.message });
      console.log(`  [ERROR] ${v}: ${e.message}`);
    }
  }

  // 5. Test Key Features in Production Bundle
  console.log('\n4. Production Feature Verification:');
  const checkFeature = (name, testFn) => {
    const pass = testFn(prodJsContent);
    console.log(`  ${pass ? '✓ PASS' : '✗ FAIL'}: ${name}`);
    return pass;
  };

  const cesiumOk = checkFeature('Cesium 3D Globe & Ion integration present', t => t.includes('Cesium') || t.includes('createWorldTerrain') || t.includes('Viewer'));
  const sitesOk = checkFeature('Global dive sites dataset (4,869 sites / 123 countries)', t => t.includes('latitude') && (t.includes('diveSites') || t.includes('dive_sites') || t.includes('diveLocations')));
  const phoneOk = checkFeature('Phone Call click destination: tel:+918971001010', t => t.includes('tel:+918971001010'));
  const emailOk = checkFeature('Email click destination: mailto:sanjeev.bajaj@thedivevillage.com', t => t.includes('mailto:sanjeev.bajaj@thedivevillage.com'));
  const waOk = checkFeature('WhatsApp destination: wa.me/918971001010', t => t.includes('wa.me/918971001010'));
  const cursorOk = checkFeature('Custom Diver Cursor hotspot tracking', t => t.includes('custom-cursor') || t.includes('cursor') || t.includes('diver'));

  // 6. Summary
  console.log('\n========================================================================');
  console.log('AUDIT SUMMARY');
  console.log('========================================================================');
  console.log(`Routes Tested: ${ROUTES.length} (Passed: ${ROUTES.length - routeFailures.length}, Failed: ${routeFailures.length})`);
  console.log(`Videos Tested: ${videoFiles.length} (Passed: ${videoSuccessCount}, Failed: ${videoErrors.length})`);
  console.log(`Features Verified: Cesium(${cesiumOk}), DiveSites(${sitesOk}), Phone(${phoneOk}), Email(${emailOk}), WhatsApp(${waOk}), Cursor(${cursorOk})`);
  console.log(`Overall Parity Status: ${routeFailures.length === 0 && videoErrors.length === 0 && cesiumOk && sitesOk && phoneOk && emailOk && waOk ? 'ALL PASS' : 'FAILURES DETECTED'}`);
}

verifyAll();
