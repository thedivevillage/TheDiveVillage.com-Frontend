import https from 'https';

async function checkDomains() {
  const domains = [
    'https://tdv-test.mkavs.com/',
    'https://www.thedivevillage.co/',
    'https://thedivevillage.co/'
  ];

  for (const url of domains) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      console.log('----------------------------------------------------');
      console.log('URL:', url);
      console.log('HTTP Status:', res.status);
      console.log('Location:', res.headers.get('location'));
      console.log('x-vercel-id:', res.headers.get('x-vercel-id'));
      console.log('x-vercel-cache:', res.headers.get('x-vercel-cache'));
      console.log('etag:', res.headers.get('etag'));
      console.log('date:', res.headers.get('date'));
      
      if (res.status === 200) {
        const html = await res.text();
        const scripts = [...html.matchAll(/<script[^>]+src="([^">]+)"/g)].map(m => m[1]);
        const links = [...html.matchAll(/<link[^>]+href="([^">]+)"/g)].map(m => m[1]);
        console.log('Scripts:', scripts);
        console.log('CSS links:', links.filter(l => l.endsWith('.css')));
      }
    } catch (err) {
      console.error('Fetch error for', url, err);
    }
  }
}

checkDomains();
