import https from 'node:https';

https.get('https://thedivevillage.com/gallery', (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
    console.log('Scripts found in HTML:', scripts);
    if (scripts.length > 0) {
      checkScript(scripts[0]);
    }
  });
});

function checkScript(scriptPath) {
  const url = scriptPath.startsWith('http') ? scriptPath : `https://thedivevillage.com${scriptPath}`;
  https.get(url, (res) => {
    let js = '';
    res.on('data', chunk => js += chunk);
    res.on('end', () => {
      console.log('Script length:', js.length);
      const anemoneMatch = js.match(/Magnificent_Sea_Anemone[^"'\s,]*/g) || [];
      console.log('Anemone unique matches:');
      [...new Set(anemoneMatch)].forEach(m => console.log('  -', m));
      const mantaMatch = js.match(/Manta_Ray_2[^"'\s,]*/g) || [];
      console.log('Manta unique matches:');
      [...new Set(mantaMatch)].forEach(m => console.log('  -', m));
    });
  });
}
