import fs from 'fs';

const TEST_BASE = 'https://tdv-test.mkavs.com';
const PROD_BASE = 'https://www.thedivevillage.co';

async function testTestSiteVideos() {
  const distDir = './Frontend/dist/assets';
  let videoFiles = [];
  if (fs.existsSync(distDir)) {
    videoFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.mp4') || f.endsWith('.mov') || f.endsWith('.webm'));
  }

  console.log(`Checking ${videoFiles.length} videos on TEST site (${TEST_BASE}):`);
  let testSuccess = 0;
  for (const v of videoFiles) {
    const url = `${TEST_BASE}/assets/${v}`;
    const res = await fetch(url, { headers: { Range: 'bytes=0-1023' } });
    const cType = res.headers.get('content-type') || '';
    const buf = Buffer.from(await res.arrayBuffer());
    const isLFS = buf.toString('latin1').includes('version https://git-lfs');
    if ((res.status === 200 || res.status === 206) && !isLFS) {
      testSuccess++;
      console.log(`  [PASS] ${v} (${res.status}, ${cType})`);
    } else {
      console.log(`  [FAIL] ${v} (${res.status}, ${cType}, isLFS: ${isLFS})`);
    }
  }

  console.log(`\nTest Site Video Results: ${testSuccess} / ${videoFiles.length} passed.`);
}

testTestSiteVideos();
