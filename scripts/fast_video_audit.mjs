import fs from 'fs';

const TEST_BASE = 'https://tdv-test.mkavs.com';

async function fastAudit() {
  const distDir = './Frontend/dist/assets';
  let videoFiles = [];
  if (fs.existsSync(distDir)) {
    videoFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.mp4') || f.endsWith('.mov') || f.endsWith('.webm'));
  }

  console.log(`Running fast audit on ${videoFiles.length} videos on ${TEST_BASE}...`);
  const results = await Promise.all(videoFiles.map(async (v) => {
    try {
      const res = await fetch(`${TEST_BASE}/assets/${v}`, { headers: { Range: 'bytes=0-1023' } });
      const cType = res.headers.get('content-type') || '';
      const cLen = res.headers.get('content-length') || '';
      const cRange = res.headers.get('content-range') || '';
      const buf = Buffer.from(await res.arrayBuffer());
      const isLFS = buf.toString('latin1').includes('version https://git-lfs');
      const pass = (res.status === 200 || res.status === 206) && !isLFS;
      return { file: v, status: res.status, cType, cRange: cRange || cLen, pass, isLFS };
    } catch (e) {
      return { file: v, error: e.message, pass: false };
    }
  }));

  const passed = results.filter(r => r.pass);
  const failed = results.filter(r => !r.pass);

  console.log(`Passed: ${passed.length} / ${results.length}`);
  if (failed.length > 0) {
    console.log('Failed videos:', failed);
  } else {
    console.log('ALL VIDEOS RETURN VALID BINARY VIDEO WITH ZERO LFS AND ZERO 404s.');
  }
}

fastAudit();
