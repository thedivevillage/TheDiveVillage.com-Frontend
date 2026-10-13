import fs from 'fs';
import Papa from 'papaparse';

const csvPath = 'public/data/dive-sites.csv';
const csvText = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

// Check all sites in Spain that are in Mallorca/Balearics or that were shifted
const calviaSites = parsed.data.filter(r => {
  const lat = parseFloat(r.Latitude);
  const lng = parseFloat(r.Longitude);
  return r.Country === 'Spain' && lat >= 39.45 && lat <= 39.55 && lng >= 2.45 && lng <= 2.65;
});

console.log('Calvià / Palma Bay region sites:', calviaSites.length);
for (const s of calviaSites) {
  console.log(`${s.ID}: "${s.Site_Name}" -> lat: ${s.Latitude}, lng: ${s.Longitude} (Ref: ${s.Ref_Latitude}, ${s.Ref_Longitude}, shift: ${s.Coordinate_Shift_m})`);
}
