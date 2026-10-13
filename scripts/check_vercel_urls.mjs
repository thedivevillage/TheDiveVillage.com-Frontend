async function check() {
  const urls = [
    'https://the-dive-village-frontend-1m8q506ez-mkavs-projects.vercel.app',
    'https://the-dive-village-frontend.vercel.app',
    'https://tdv-test.mkavs.com',
    'https://www.thedivevillage.co'
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u);
      const html = await res.text();
      const match = html.match(/src="([^"]*assets\/index-[^"]*\.js)"/);
      console.log(u);
      console.log('  Status:', res.status);
      console.log('  Script:', match ? match[1] : 'NOT FOUND');
      console.log('  x-vercel-id:', res.headers.get('x-vercel-id'));
    } catch (e) {
      console.error(u, e.message);
    }
  }
}
check();
