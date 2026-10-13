import fs from 'fs';
import Papa from 'papaparse';

const csvPath = 'public/data/dive-sites.csv';
const csvText = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

const shifted = parsed.data.filter(r => r.Water_Correction && r.Water_Correction.includes('minimum_nearest_shoreline_crossing'));
console.log('Total shifted sites:', shifted.length);

// Print the first 10 shifted sites
for (let i = 0; i < 10; i++) {
  const r = shifted[i];
  console.log({
    id: r.ID,
    name: r.Site_Name,
    country: r.Country,
    lat: r.Latitude,
    lng: r.Longitude,
    ref_lat: r.Ref_Latitude,
    ref_lng: r.Ref_Longitude,
    shift_m: r.Coordinate_Shift_m,
    diff_lat: (parseFloat(r.Latitude) - parseFloat(r.Ref_Latitude)).toFixed(5),
    diff_lng: (parseFloat(r.Longitude) - parseFloat(r.Ref_Longitude)).toFixed(5),
  });
}
