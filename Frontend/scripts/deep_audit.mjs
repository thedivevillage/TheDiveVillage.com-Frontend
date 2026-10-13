import fs from 'fs';

async function deepAudit() {
  const testUrl = 'https://tdv-test.mkavs.com';
  const mainUrl = 'https://www.thedivevillage.co';

  // 1. Fetch test index JS and main index JS
  const tHtml = await (await fetch(testUrl)).text();
  const mHtml = await (await fetch(mainUrl)).text();

  const tScriptMatch = tHtml.match(/src="(\/assets\/index-[^"]+\.js)"/);
  const mScriptMatch = mHtml.match(/src="(\/assets\/index-[^"]+\.js)"/);

  console.log('Test HTML Entry JS:', tScriptMatch ? tScriptMatch[1] : 'NONE');
  console.log('Main HTML Entry JS:', mScriptMatch ? mScriptMatch[1] : 'NONE');

  // Let's check BookUs chunk on both test and main
  const checkChunk = async (url, chunkPattern) => {
    try {
      const res = await fetch(url + chunkPattern);
      return { status: res.status, size: (await res.text()).length };
    } catch (e) {
      return { status: 'ERR', size: 0 };
    }
  };

  // Let's find chunks in Test HTML and Main HTML
  const findChunks = (html) => {
    return [...html.matchAll(/\/assets\/[a-zA-Z0-9_-]+\.js/g)].map(m => m[0]);
  };

  console.log('Test Chunks referenced in HTML:', findChunks(tHtml));
  console.log('Main Chunks referenced in HTML:', findChunks(mHtml));

  // Check all routes on main domain for status, title, and body text
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
    '/admin'
  ];

  console.log('\n--- VERIFYING ROUTE RESPONSES ON BOTH ---');
  for (const r of routes) {
    const [tRes, mRes] = await Promise.all([
      fetch(testUrl + r),
      fetch(mainUrl + r)
    ]);
    const tT = await tRes.text();
    const mT = await mRes.text();
    console.log(`${r.padEnd(15)} | TEST status: ${tRes.status} (${tT.length}b) | MAIN status: ${mRes.status} (${mT.length}b)`);
  }
}

deepAudit();
