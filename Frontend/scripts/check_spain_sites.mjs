import fs from 'fs';
import Papa from 'papaparse';

const csvPath = 'public/data/dive-sites.csv';
const csvText = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

const spainSites = parsed.data.filter(r => r.Country === 'Spain');
console.log('Total Spain sites:', spainSites.length);

const shiftedSpain = spainSites.filter(r => r.Coordinate_Shift_m && parseFloat(r.Coordinate_Shift_m) > 0);
console.log('Shifted Spain sites:', shiftedSpain.length);

// Breakdown of shifted by region/islands
const ibiza = spainSites.filter(r => {
  const lat = parseFloat(r.Latitude);
  const lng = parseFloat(r.Longitude);
  return lat >= 38.8 && lat <= 39.2 && lng >= 1.2 && lng <= 1.6;
});
console.log('Ibiza/Formentera sites:', ibiza.length, 'shifted:', ibiza.filter(s => s.Coordinate_Shift_m > 0).length);

const canaries = spainSites.filter(r => {
  const lat = parseFloat(r.Latitude);
  const lng = parseFloat(r.Longitude);
  return lat >= 27.5 && lat <= 29.5 && lng >= -18.5 && lng <= -13.0;
});
console.log('Canary Islands sites:', canaries.length, 'shifted:', canaries.filter(s => s.Coordinate_Shift_m > 0).length);

const costaBrava = spainSites.filter(r => {
  const lat = parseFloat(r.Latitude);
  const lng = parseFloat(r.Longitude);
  return lat >= 41.5 && lat <= 42.5 && lng >= 2.8 && lng <= 3.4;
});
console.log('Costa Brava sites:', costaBrava.length, 'shifted:', costaBrava.filter(s => s.Coordinate_Shift_m > 0).length);
