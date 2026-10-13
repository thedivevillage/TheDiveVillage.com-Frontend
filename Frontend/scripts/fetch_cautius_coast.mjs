import fs from 'fs';

// Let's check Overpass API or a geojson polygon for Mallorca
async function test() {
  const query = `[out:json];
way["natural"="coastline"](39.45,2.49,39.48,2.53);
(._;>;);
out skel;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
  });
  const data = await res.json();
  console.log('Nodes count:', data.elements.filter(e => e.type === 'node').length);
  const nodes = data.elements.filter(e => e.type === 'node');
  // Sort nodes by latitude near 39.463
  const near = nodes.filter(n => Math.abs(n.lat - 39.4634) < 0.005);
  console.log('Coastline nodes near lat 39.4634:', near);
}
test().catch(console.error);
