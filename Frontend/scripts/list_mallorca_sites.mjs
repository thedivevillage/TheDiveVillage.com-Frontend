import fs from 'fs';
import Papa from 'papaparse';

const csvPath = 'public/data/dive-sites.csv';
const csvText = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

// Filter sites in Spain around Mallorca: lat 39.1 to 40.0, lng 2.2 to 3.5
const mallorcaSites = parsed.data.filter(r => {
  const lat = parseFloat(r.Latitude);
  const lng = parseFloat(r.Longitude);
  return r.Country === 'Spain' && lat >= 39.1 && lat <= 40.0 && lng >= 2.2 && lng <= 3.5;
});

console.log('Mallorca sites count:', mallorcaSites.length);
mallorcaSites.forEach(s => {
  console.log(`${s.ID}: ${s.Site_Name} | lat: ${s.Latitude}, lng: ${s.Longitude} | Ref: ${s.Ref_Latitude}, ${s.Ref_Longitude} | shift: ${s.Coordinate_Shift_m} | ${s.Water_Correction}`);
});
