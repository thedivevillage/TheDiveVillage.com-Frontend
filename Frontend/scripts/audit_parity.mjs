import fs from 'fs';

async function audit() {
  const testUrl = 'https://tdv-test.mkavs.com';
  const mainUrl = 'https://www.thedivevillage.co';
  const nakedUrl = 'https://thedivevillage.co';

  console.log('==================================================');
  console.log('1. REDIRECT CHAIN AUDIT');
  console.log('==================================================');
  const domains = [testUrl, nakedUrl, mainUrl];
  for (const d of domains) {
    try {
      const res = await fetch(d, { redirect: 'manual' });
      console.log(`${d} -> Status: ${res.status} | Location: ${res.headers.get('location')} | Server: ${res.headers.get('server')} | x-vercel-id: ${res.headers.get('x-vercel-id')}`);
    } catch (e) {
      console.log(`${d} -> Error: ${e.message}`);
    }
  }

  console.log('\n==================================================');
  console.log('2. INDEX.HTML AND MAIN ENTRY PARITY');
  console.log('==================================================');
  const [testHtmlRes, mainHtmlRes] = await Promise.all([
    fetch(testUrl),
    fetch(mainUrl)
  ]);
  const testHtml = await testHtmlRes.text();
  const mainHtml = await mainHtmlRes.text();

  console.log('Test HTML length:', testHtml.length);
  console.log('Main HTML length:', mainHtml.length);
  console.log('Exact Match?:', testHtml === mainHtml);

  const getScripts = (h) => {
    const matches = h.match(/src="(\/assets\/[^"]+)"/g) || [];
    return matches.map(m => m.replace('src="', '').replace('"', ''));
  };
  const getStyles = (h) => {
    const matches = h.match(/href="(\/assets\/[^"]+)"/g) || [];
    return matches.map(m => m.replace('href="', '').replace('"', ''));
  };

  const testScripts = getScripts(testHtml);
  const mainScripts = getScripts(mainHtml);
  const testStyles = getStyles(testHtml);
  const mainStyles = getStyles(mainHtml);

  console.log('Test scripts:', testScripts);
  console.log('Main scripts:', mainScripts);
  console.log('Test styles:', testStyles);
  console.log('Main styles:', mainStyles);

  console.log('\n==================================================');
  console.log('3. ROUTE PARITY & DIRECT URL / REFRESH HANDLING');
  console.log('==================================================');
  const routes = [
    '/',
    '/about',
    '/services',
    '/gallery',
    '/book-us',
    '/shop',
    '/cart',
    '/wishlist',
    '/checkout',
    '/contact',
    '/login',
    '/signup',
    '/profile',
    '/dashboard',
    '/admin',
    '/services/course-3',
    '/product/1'
  ];

  let routeErrors = 0;
  for (const r of routes) {
    const [tR, mR] = await Promise.all([
      fetch(testUrl + r, { redirect: 'manual' }),
      fetch(mainUrl + r, { redirect: 'manual' })
    ]);
    const tText = await tR.text();
    const mText = await mR.text();
    const match = (tR.status === mR.status) && (tText === mText);
    if (!match) routeErrors++;
    console.log(`${r.padEnd(26)} | TEST: ${tR.status} (${tText.length}b) | MAIN: ${mR.status} (${mText.length}b) | MATCH: ${match ? 'YES' : 'NO'}`);
  }

  console.log('\n==================================================');
  console.log('4. ASSET BUNDLE & VIDEO PARITY');
  console.log('==================================================');
  // Check main JS chunk contents on both
  if (testScripts.length > 0 && mainScripts.length > 0) {
    const mainJsUrlTest = testUrl + testScripts[0];
    const mainJsUrlMain = mainUrl + mainScripts[0];
    const [tJsR, mJsR] = await Promise.all([
      fetch(mainJsUrlTest),
      fetch(mainJsUrlMain)
    ]);
    const tJs = await tJsR.text();
    const mJs = await mJsR.text();
    console.log(`Main JS (${testScripts[0]}) -> TEST: ${tJsR.status} (${tJs.length}b) | MAIN: ${mJsR.status} (${mJs.length}b) | MATCH: ${tJs === mJs}`);
  }

  // Let's extract and check all video assets and major assets
  // Find all .mp4 assets referenced in JS or fetched
  const videoAssets = [
    '/assets/Hero_fast-*.mp4',
    '/assets/Book_fast-*.mp4',
    '/assets/nightdive_fast-*.mp4',
    '/assets/Turtle_fast-*.mp4',
    '/assets/Turtle Anna(1)-*.mp4',
    '/assets/surfing-*.mp4',
    '/assets/free diving -*.mp4',
    '/assets/Travel-*.mp4',
    '/assets/gallery1-*.mp4',
    '/assets/2-*.mp4',
    '/assets/dji_mimo_20260220_140750_0_1771571076972_video-*.mp4',
    '/assets/dji_mimo_20260204_084830_0_1770187393265_video-*.mp4',
    '/assets/DJI_20260525102811_0007_D-*.MP4',
    '/assets/DJI_20260525124204_0018_D-*.MP4',
    '/assets/DJI_20260525123656_0017_D-*.MP4',
    '/assets/20260630_153650_005-*.mp4',
    '/assets/20260707_165729_460-*.mp4',
    '/assets/dji_mimo_20260204_084858_0_1770187391850_video-*.mp4',
    '/assets/DJI_20260525104139_0011_D-*.MP4',
    '/assets/dji_mimo_20260124_112020_0_1769300692742_video-*.mp4',
    '/assets/Dive-*.MP4'
  ];

  // Scan dist/assets for actual files
  const distFiles = fs.readdirSync('./dist/assets');
  console.log(`\nScanning ${distFiles.length} files in dist/assets...`);
  
  const mp4Files = distFiles.filter(f => f.toLowerCase().endsWith('.mp4'));
  console.log(`Found ${mp4Files.length} MP4 files in build.`);

  let videoFailures = 0;
  for (const f of mp4Files) {
    const assetPath = `/assets/${f}`;
    const [tVR, mVR] = await Promise.all([
      fetch(testUrl + assetPath, { method: 'HEAD' }),
      fetch(mainUrl + assetPath, { method: 'HEAD' })
    ]);
    const tLen = tVR.headers.get('content-length');
    const mLen = mVR.headers.get('content-length');
    const tType = tVR.headers.get('content-type');
    const mType = mVR.headers.get('content-type');
    const match = (tVR.status === mVR.status) && (tLen === mLen) && (tType === mType);
    if (!match) videoFailures++;
    console.log(`${f.slice(0, 35).padEnd(36)} | TEST: ${tVR.status} (${tLen}b, ${tType}) | MAIN: ${mVR.status} (${mLen}b, ${mType}) | MATCH: ${match ? 'YES' : 'NO'}`);
  }

  console.log('\n==================================================');
  console.log(`SUMMARY: Route discrepancies: ${routeErrors} | Video discrepancies: ${videoFailures}`);
  console.log('==================================================');
}

audit();
