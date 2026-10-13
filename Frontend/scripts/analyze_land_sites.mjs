import fs from 'fs';
import Papa from 'papaparse';

const csvPath = 'public/data/dive-sites.csv';
const csvText = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

console.log('Total rows:', parsed.data.length);

const waterCorrectionCounts = {};
for (const row of parsed.data) {
  const wc = row.Water_Correction || 'none';
  waterCorrectionCounts[wc] = (waterCorrectionCounts[wc] || 0) + 1;
}
console.log('Water_Correction breakdown:', waterCorrectionCounts);

const spainSites = parsed.data.filter(r => r.Country === 'Spain');
console.log('Spain sites count:', spainSites.length);

for (const s of spainSites) {
  if (s.Site_Name.toLowerCase().includes('cautius')) {
    console.log('Found Cautius:', s);
  }
}
