import fs from 'fs';

const mallorcaShifted = [
  { id: '377', name: 'Punta Martin', lat: 39.46552, lng: 2.50098, ref_lat: 39.46588, ref_lng: 2.49870 },
  { id: '378', name: 'Punta Cautius', lat: 39.46340, lng: 2.50922, ref_lat: 39.46376, ref_lng: 2.50694 },
  { id: '381', name: 'Illetes', lat: 39.53442, lng: 2.59094, ref_lat: 39.53476, ref_lng: 2.58865 },
  { id: '383', name: 'Carlotta', lat: 39.45730, lng: 2.51952, ref_lat: 39.45766, ref_lng: 2.51724 },
  { id: '384', name: 'Portalls Vells', lat: 39.47427, lng: 2.52673, ref_lat: 39.47463, ref_lng: 2.52445 },
  { id: '9487', name: 'Palmanova Bay', lat: 39.51343, lng: 2.54412, ref_lat: 39.51377, ref_lng: 2.54183 },
  { id: '10242', name: 'Cala Montjo', lat: 39.52754, lng: 2.43302, ref_lat: 39.52789, ref_lng: 2.43072 },
  { id: '14617', name: 'Palma Cavern', lat: 39.54714, lng: 2.62253, ref_lat: 39.54747, ref_lng: 2.62023 },
  { id: '14639', name: 'Punta Cala Figuera', lat: 39.45650, lng: 2.52433, ref_lat: 39.45687, ref_lng: 2.52204 },
  { id: '14877', name: 'Punta Marc', lat: 39.46161, lng: 2.50660, ref_lat: 39.46197, ref_lng: 2.50432 },
];

async function checkSite() {
  for (const s of mallorcaShifted) {
    const urlSite = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${s.ref_lat}&lon=${s.ref_lng}`;
    const resSite = await fetch(urlSite, { headers: { 'User-Agent': 'TDV-Check/1.0' } });
    const jSite = await resSite.json();
    
    console.log(`\n--- ${s.name} ---`);
    console.log(`Ref (${s.ref_lat}, ${s.ref_lng}):`, jSite.display_name || jSite.error);
    await new Promise(r => setTimeout(r, 1000));
  }
}
checkSite();
