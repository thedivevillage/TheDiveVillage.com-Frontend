const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const csvPath = path.resolve(__dirname, '../public/data/dive-sites.csv');
const outJsonPath = path.resolve(__dirname, '../public/data/dive-sites.json');

const csvText = fs.readFileSync(csvPath, 'utf8');

const parsed = Papa.parse(csvText, {
  header: true,
  skipEmptyLines: 'greedy',
  dynamicTyping: false,
});

const rows = parsed.data || [];
const validSites = [];
const skippedRows = [];
const countriesSet = new Set();
const naturalTypesSet = new Set();
const seenIds = new Set();

const DATASET_OVERRIDES = {
  '7336': { exclude: true },
  '24530': { exclude: true },
  '24531': { country: 'Sri Lanka', latitude: 5.9405, longitude: 80.4550 },
  '3051': { exclude: true },
  '844': { exclude: true },
  '15157': { exclude: true },
  '15259': { exclude: true },
  '439': { exclude: true },
  '4671': { exclude: true },
  '3223': { exclude: true },
  '1558': { exclude: true },
  '2732': { exclude: true },
  '2769': { exclude: true },
  '2804': { exclude: true },
  '3290': { exclude: true },
  '6618': { exclude: true },
  '6621': { exclude: true },
  '11280': { exclude: true },
  '7067': { exclude: true },
  '3019': { latitude: 47.5898, longitude: -122.3805 },
  '4936': { latitude: 47.4042, longitude: -123.1388 },
  '14': { latitude: 50.4008, longitude: -3.5032 },
  '24743': { latitude: 43.28666666666666, longitude: 17.019444444444442 },
  '378': { latitude: 39.46380, longitude: 2.50350 },
  '377': { latitude: 39.46580, longitude: 2.49650 },
  '14877': { latitude: 39.46150, longitude: 2.50250 },
  '383': { latitude: 39.45450, longitude: 2.51800 },
  '14639': { latitude: 39.45400, longitude: 2.52400 },
  '384': { latitude: 39.47350, longitude: 2.52150 },
  '381': { latitude: 39.53250, longitude: 2.59250 },
  '9487': { latitude: 39.51650, longitude: 2.54100 },
  '10242': { latitude: 39.52450, longitude: 2.43350 },
  '14617': { latitude: 39.54450, longitude: 2.62550 },
  '2150': { latitude: 39.75650, longitude: 2.61750 },
  '19369': { latitude: 39.93950, longitude: 3.18400 },
  '19370': { latitude: 39.96350, longitude: 3.17600 },
  '19372': { latitude: 39.92150, longitude: 3.05650 },
  '17513': { latitude: 39.63100, longitude: 3.43550 },
  '7189': { latitude: 40.01150, longitude: 3.79300 },
  '11694': { latitude: 40.01150, longitude: 3.79350 },
  '11695': { latitude: 39.96650, longitude: 3.83150 },
  '11705': { latitude: 39.97200, longitude: 3.82650 },
  '2237': { latitude: 40.02150, longitude: 4.20850 },
  '2241': { latitude: 40.02350, longitude: 4.19700 },
  '2243': { latitude: 40.03150, longitude: 4.19450 },
  '2244': { latitude: 40.03180, longitude: 4.19450 },
  '7413': { latitude: 40.02600, longitude: 4.19350 },
  '7348': { latitude: 40.06950, longitude: 4.14350 },
  '7349': { latitude: 40.06900, longitude: 4.14850 },
  '17633': { latitude: 40.07600, longitude: 4.09200 },
  '2057': { latitude: 39.11700, longitude: 1.50900 },
  '2056': { latitude: 39.11750, longitude: 1.52250 },
  '2074': { latitude: 39.11500, longitude: 1.54200 },
  '2073': { latitude: 39.10350, longitude: 1.55150 },
  '2077': { latitude: 39.08000, longitude: 1.40250 },
  '5587': { latitude: 38.93150, longitude: 1.50450 },
  '333': { latitude: 28.91800, longitude: -13.66850 },
  '354': { latitude: 28.85700, longitude: -13.84300 },
  '370': { latitude: 28.91880, longitude: -13.66800 },
  '371': { latitude: 28.91950, longitude: -13.67050 },
  '924': { latitude: 28.91850, longitude: -13.67000 },
  '926': { latitude: 28.91850, longitude: -13.65400 },
  '927': { latitude: 28.91800, longitude: -13.65800 },
  '1061': { latitude: 28.04950, longitude: -16.72200 },
  '1109': { latitude: 28.91900, longitude: -13.66500 },
  '1110': { latitude: 28.91800, longitude: -13.66600 },
  '1111': { latitude: 28.91750, longitude: -13.66400 },
  '1112': { latitude: 28.91720, longitude: -13.66100 },
  '1182': { latitude: 28.91830, longitude: -13.66950 },
  '1184': { latitude: 29.08350, longitude: -13.44900 },
  '1185': { latitude: 29.07650, longitude: -13.45250 },
  '87': { latitude: 41.72250, longitude: 2.94000 },
  '770': { latitude: 41.67400, longitude: 2.80200 },
  '822': { latitude: 42.35000, longitude: 3.22650 },
  '826': { latitude: 42.34150, longitude: 3.23800 },
  '2152': { latitude: 41.84800, longitude: 3.14100 },
  '3057': { latitude: 42.10500, longitude: 3.17950 },
  '3059': { latitude: 42.10670, longitude: 3.17450 },
  '3067': { latitude: 42.11350, longitude: 3.17300 },
  '3068': { latitude: 42.11580, longitude: 3.16850 },
  '14890': { latitude: 41.72050, longitude: 2.94100 },
  '15242': { latitude: 41.88750, longitude: 3.18300 },
  '20164': { latitude: 42.06660, longitude: 3.21050 },
  '79': { latitude: 37.63050, longitude: -0.70150 },
  '9358': { latitude: 38.76500, longitude: 0.22350 },
  '14378': { latitude: 38.63600, longitude: 0.08000 },
  '16208': { latitude: 37.63220, longitude: -0.69020 },
  '16209': { latitude: 37.63460, longitude: -0.68900 },
  '20174': { latitude: 38.76500, longitude: 0.22400 },
  '20175': { latitude: 38.76400, longitude: 0.22380 },
  '20176': { latitude: 38.76200, longitude: 0.22350 },
  '20178': { latitude: 38.75400, longitude: 0.22900 },
  '20181': { latitude: 38.74600, longitude: 0.22900 },
  '20184': { latitude: 38.74200, longitude: 0.23150 },
  '20185': { latitude: 38.74050, longitude: 0.23350 },
  '22532': { latitude: 38.63500, longitude: 0.07050 },
  '12386': { exclude: true },
  '12041': { exclude: true },
  '846': { exclude: true },
  '855': { exclude: true },
  '12671': { exclude: true },
  '12668': { exclude: true },
  '342': { exclude: true },
  '20420': { exclude: true },
  '13479': { exclude: true },
  '22854': { exclude: true },
  '2814': { siteName: 'Hon Dai, Long Island' },
  '759': { siteName: 'Coral Gardens West Coast' },
  '7395': { siteName: 'Coral Gardens East Coast' },
  '7394': { siteName: "Simon's Cave" },
  '2083': { siteName: 'Kubbar Island' },
  '6541': { siteName: 'Qarooh Island' },
  '12040': { siteName: 'Atlantis', latitude: -21.82500, longitude: 35.50500 },
  '12052': { siteName: 'Turtle Coves', latitude: -21.83100, longitude: 35.50800 },
  '12054': { siteName: 'The Roller Coaster', latitude: -21.83800, longitude: 35.51000 },
  '12367': { siteName: 'Marlin Pinnacles', latitude: -21.84200, longitude: 35.51200 },
  '17848': { siteName: 'Shark Vaal', latitude: -21.84600, longitude: 35.51400 },
  '17849': { siteName: '9-Mile Shallow', latitude: -21.85100, longitude: 35.51500 },
  '18137': { siteName: 'Amphitheatre', latitude: -21.82100, longitude: 35.50300 },
  '18138': { siteName: 'Gap (2 Mile)', latitude: -21.81500, longitude: 35.50100 },
  '18139': { siteName: 'Kingfish Alley', latitude: -21.82800, longitude: 35.50600 },
  '6927': { siteName: 'Doodles', longitude: 32.90500 },
  '7638': { siteName: 'Steps', longitude: 32.90400 },
  '12580': { siteName: 'Bee Hive', longitude: 32.90600 },
  '22851': { siteName: 'Blacks', longitude: 32.90550 },
  '22853': { siteName: 'Checkers', longitude: 32.90450 },
  '22855': { siteName: 'Chreche', longitude: 32.90500 },
  '542': { siteName: 'Inhambane Outer Reef', latitude: -23.60930, longitude: 35.55000 },
  '9926': { siteName: 'Sharp Island South' },
  '10320': { siteName: 'Daqingzhen Pinnacle' },
  '10376': { siteName: 'Sangzhou Island' },
  '10617': { siteName: 'Baifu Bay' },
  '22898': { siteName: 'Twin Sail Rock' },
  '2429': { siteName: 'Stiladari / Poseidon Beach' },
  '25319': { siteName: 'Shikanoshima Island' },
  '10634': { siteName: 'The Grotto' },
  '11708': { siteName: 'Times Square' },
  '6182': { siteName: 'Little Hangaechang (Seopseom)' },
  '6887': { siteName: 'Supseom Island' },
  '8134': { siteName: 'Guryongpo Reef Resort' },
  '8135': { siteName: 'Geumgangsan Pinnacle' },
  '8651': { siteName: 'Namae House Reef' },
  '8725': { siteName: 'Octagonal Artificial Reef' },
  '8726': { siteName: 'Namae Beach' },
  '9249': { siteName: 'Taejongdae Gamji Beach' },
  '9843': { siteName: 'Seopseom Island' },
  '10887': { siteName: 'Taejongdae Gamji Beach' },
  '10888': { siteName: 'Pohang Cheongjin Artificial Reef Point' },
  '5024': { siteName: 'Confucius Rock' },
  '10234': { siteName: 'Shilang Reef' },
  '10245': { siteName: 'Longdong Bay Site 4 (Hemei)' },
  '10393': { siteName: 'Chushukou (Outlet Reef)' },
  '10756': { siteName: 'Soft Coral Garden' },
};

const nonLatinRegex = /[\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0E00-\u0E7F\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF]/g;

rows.forEach((row, index) => {
  const lineNum = index + 2;
  const id = (row.ID || row.id || `site-${index}`).toString().trim();
  let siteName = (row.Site_Name || row.site_name || row.Name || row.name || '').trim();
  let country = (row.Country || row.country || '').trim();
  let latStr = row.Latitude ?? row.latitude;
  let lngStr = row.Longitude ?? row.longitude;
  const naturalTypes = (row.Natural_Types || row.natural_types || '').trim();
  const sourceUrl = (row.Source_URL || row.source_url || row.URL || row.url || '').trim();
  const coordShift = row.Coordinate_Shift_m ?? '';
  const waterCorrection = row.Water_Correction ?? '';

  if (DATASET_OVERRIDES[id]) {
    const override = DATASET_OVERRIDES[id];
    if (override.exclude) return;
    if (override.country) country = override.country;
    if (override.siteName) siteName = override.siteName;
    if (override.latitude != null) latStr = override.latitude;
    if (override.longitude != null) lngStr = override.longitude;
  }

  if (nonLatinRegex.test(siteName)) {
    siteName = siteName.replace(nonLatinRegex, '').replace(/\s{2,}/g, ' ').trim();
    if (!siteName) {
      siteName = `${country} Dive Site ${id}`;
    }
  }

  if (!siteName) return;

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

  if (id && seenIds.has(id)) return;
  if (id) seenIds.add(id);

  if (country) countriesSet.add(country);
  if (naturalTypes) {
    naturalTypes.split(';').forEach((t) => {
      const cleanT = t.trim();
      if (cleanT) naturalTypesSet.add(cleanT);
    });
  }

  validSites.push({
    id,
    siteName,
    country: country || 'International Waters',
    latitude: lat,
    longitude: lng,
    naturalTypes,
    sourceUrl,
    coordinateShift: coordShift,
    waterCorrection,
  });
});

const geojson = {
  type: 'FeatureCollection',
  features: validSites.map((site) => ({
    type: 'Feature',
    id: site.id,
    geometry: {
      type: 'Point',
      coordinates: [site.longitude, site.latitude],
    },
    properties: {
      id: site.id,
      siteName: site.siteName,
      country: site.country,
      latitude: site.latitude,
      longitude: site.longitude,
      naturalTypes: site.naturalTypes,
      sourceUrl: site.sourceUrl,
      coordinateShift: site.coordinateShift,
      waterCorrection: site.waterCorrection,
    },
  })),
};

const countryStatsMap = new Map();
validSites.forEach((site) => {
  const c = site.country;
  if (!countryStatsMap.has(c)) {
    countryStatsMap.set(c, {
      country: c,
      count: 0,
      sumLat: 0,
      sumLng: 0,
      sites: [],
    });
  }
  const entry = countryStatsMap.get(c);
  entry.count += 1;
  entry.sumLat += site.latitude;
  entry.sumLng += site.longitude;
  entry.sites.push(site);
});

const COUNTRY_COORDS = {
  'Albania': [20.1683, 41.1533],
  'Argentina': [-63.6167, -38.4161],
  'Aruba': [-69.9683, 12.5211],
  'Australia': [133.7751, -25.2744],
  'Austria': [14.5501, 47.5162],
  'Azerbaijan': [47.5769, 40.1431],
  'Bahamas': [-77.3963, 25.0343],
  'Barbados': [-59.5432, 13.1939],
  'Belgium': [4.4699, 50.5039],
  'Belize': [-88.4976, 17.1899],
  'Bermuda': [-64.7505, 32.3078],
  'Brazil': [-51.9253, -14.2350],
  'British Virgin Islands': [-64.6399, 18.4207],
  'Brunei': [114.7277, 4.5353],
  'Bulgaria': [25.4858, 42.7339],
  'Cambodia': [104.9910, 12.5657],
  'Canada': [-106.3468, 56.1304],
  'Cape Verde': [-23.6052, 16.0021],
  'Caribbean Netherlands': [-68.2778, 12.1784],
  'Cayman Islands': [-81.2546, 19.3133],
  'Chile': [-71.5430, -35.6751],
  'China': [104.1954, 35.8617],
  'Colombia': [-74.2973, 4.5709],
  'Costa Rica': [-83.7534, 9.7489],
  'Croatia': [15.2000, 45.1000],
  'Curaçao': [-68.9900, 12.1696],
  'Cyprus': [33.4299, 35.1264],
  'Czech Republic': [15.4730, 49.8175],
  'Denmark': [9.5018, 56.2639],
  'Dominica': [-61.3710, 15.4150],
  'Dominican Republic': [-70.1627, 18.7357],
  'Ecuador': [-78.1834, -1.8312],
  'Egypt': [30.8025, 26.8206],
  'Federated States of Micronesia': [158.1561, 6.8874],
  'Federated States Of Micronesia': [158.1561, 6.8874],
  'Fiji': [178.0650, -17.7134],
  'Finland': [25.7482, 61.9241],
  'France': [2.2137, 46.2276],
  'French Polynesia': [-149.4068, -17.6797],
  'Germany': [10.4515, 51.1657],
  'Gibraltar': [-5.3536, 36.1408],
  'Greece': [21.8243, 39.0742],
  'Grenada': [-61.6042, 12.1165],
  'Guam': [144.7937, 13.4443],
  'Honduras': [-86.2419, 15.2000],
  'Iceland': [-18.5707, 64.9631],
  'India': [78.9629, 20.5937],
  'Indonesia': [113.9213, -0.7893],
  'Iran': [53.6880, 32.4279],
  'Ireland': [-8.2439, 53.4129],
  'Israel': [34.8516, 31.0461],
  'Italy': [12.5674, 41.8719],
  'Jamaica': [-77.2975, 18.1096],
  'Japan': [138.2529, 36.2048],
  'Jordan': [36.2384, 30.5852],
  'Kenya': [37.9062, -0.0236],
  'Kuwait': [47.4818, 29.3117],
  'Latvia': [24.6032, 56.8796],
  'Libya': [13.1707, 32.9036],
  'Madagascar': [46.8691, -18.7669],
  'Malaysia': [101.9758, 4.2105],
  'Maldives': [73.2207, 3.2028],
  'Malta': [14.3754, 35.9375],
  'Mexico': [-102.5528, 23.6345],
  'Monaco': [7.4246, 43.7384],
  'Montenegro': [19.3744, 42.7087],
  'Mozambique': [35.5296, -18.6657],
  'Netherlands': [5.2913, 52.1326],
  'New Zealand': [174.8860, -40.9006],
  'Niue': [-169.8672, -19.0544],
  'Northern Mariana Islands': [145.6739, 15.0979],
  'Oman': [55.9754, 21.4735],
  'Palau': [134.5825, 7.5150],
  'Panama': [-80.7821, 8.5379],
  'Papua New Guinea': [143.9555, -6.3150],
  'Peru': [-75.0152, -9.1899],
  'Philippines': [121.7740, 12.8797],
  'Poland': [19.1451, 51.9194],
  'Portugal': [-8.2245, 39.3999],
  'Puerto Rico': [-66.5901, 18.2208],
  'Qatar': [51.1839, 25.3548],
  'Republic of Mauritius': [57.5522, -20.3484],
  'Republic Of Mauritius': [57.5522, -20.3484],
  'Romania': [24.9668, 45.9432],
  'Russia': [105.3188, 61.5240],
  'Réunion': [55.5364, -21.1151],
  'Saint Kitts & Nevis': [-62.7830, 17.3578],
  'Saint Vincent & the Grenadines': [-61.2872, 13.2528],
  'Saint Vincent & The Grenadines': [-61.2872, 13.2528],
  'Saudi Arabia': [45.0792, 23.8859],
  'Senegal': [-14.4524, 14.4974],
  'Seychelles': [55.4920, -4.6796],
  'Singapore': [103.8198, 1.3521],
  'Sint Maarten': [-63.0548, 18.0425],
  'South Africa': [22.9375, -30.5595],
  'South Korea': [127.7669, 35.9078],
  'Spain': [-3.7492, 40.4637],
  'Sri Lanka': [80.7718, 7.8731],
  'Sudan': [30.2176, 12.8628],
  'Sweden': [18.6435, 60.1282],
  'Switzerland': [8.2275, 46.8182],
  'Taiwan': [120.9605, 23.6978],
  'Tanzania': [34.8888, -6.3690],
  'Thailand': [100.9925, 15.8700],
  'The Guadeloupe Islands': [-61.5510, 16.2650],
  'Timor Leste (East Timor)': [125.7275, -8.8742],
  'Trinidad and Tobago': [-61.2225, 10.6918],
  'Trinidad And Tobago': [-61.2225, 10.6918],
  'Tunisia': [9.5375, 33.8869],
  'Turkey': [35.2433, 38.9637],
  'Turks and Caicos Islands': [-71.7979, 21.6940],
  'Turks And Caicos Islands': [-71.7979, 21.6940],
  'U.S. Virgin Islands': [-64.8963, 18.3358],
  'United Arab Emirates': [53.8478, 23.4241],
  'United Kingdom': [-1.1743, 52.3555],
  'United States of America (USA)': [-98.5795, 39.8283],
  'United States Of America (USA)': [-98.5795, 39.8283],
  'Vanuatu': [166.9592, -15.3767],
  'Venezuela': [-66.5897, 6.4238],
  'Vietnam': [108.2772, 14.0583],
  'Western Sahara': [-12.8858, 24.2155],
};

const countryCentroids = Array.from(countryStatsMap.values())
  .map((entry) => {
    const canonical = COUNTRY_COORDS[entry.country] ||
      COUNTRY_COORDS[Object.keys(COUNTRY_COORDS).find((k) => k.toLowerCase() === entry.country.toLowerCase())];
    const lng = canonical ? canonical[0] : (entry.sumLng / entry.count);
    const lat = canonical ? canonical[1] : (entry.sumLat / entry.count);

    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    entry.sites.forEach((s) => {
      if (s.longitude < minLng) minLng = s.longitude;
      if (s.longitude > maxLng) maxLng = s.longitude;
      if (s.latitude < minLat) minLat = s.latitude;
      if (s.latitude > maxLat) maxLat = s.latitude;
    });

    return {
      country: entry.country,
      count: entry.count,
      latitude: lat,
      longitude: lng,
      bounds: minLng !== Infinity ? [[minLng, minLat], [maxLng, maxLat]] : null,
    };
  })
  .sort((a, b) => b.count - a.count);

const geojsonCountries = {
  type: 'FeatureCollection',
  features: countryCentroids.map((c) => ({
    type: 'Feature',
    id: `country-${c.country.replace(/\s+/g, '-').toLowerCase()}`,
    geometry: {
      type: 'Point',
      coordinates: [c.longitude, c.latitude],
    },
    properties: {
      country: c.country,
      count: c.count,
      latitude: c.latitude,
      longitude: c.longitude,
    },
  })),
};

const countries = Array.from(countriesSet).sort((a, b) => a.localeCompare(b));
const naturalTypes = Array.from(naturalTypesSet).sort((a, b) => a.localeCompare(b));

const output = {
  sites: validSites,
  countries,
  countryCentroids,
  geojsonCountries,
  naturalTypes,
  stats: {
    totalRows: rows.length,
    validCount: validSites.length,
    skippedCount: skippedRows.length,
    countriesCount: countries.length,
  },
  error: null,
};

fs.writeFileSync(outJsonPath, JSON.stringify(output), 'utf8');
console.log(`Successfully generated ${outJsonPath} (${(fs.statSync(outJsonPath).size / 1024).toFixed(1)} KB) with ${validSites.length} dive sites!`);

const distJsonPath = path.resolve(__dirname, '../dist/data/dive-sites.json');
const distCsvPath = path.resolve(__dirname, '../dist/data/dive-sites.csv');
if (fs.existsSync(path.dirname(distJsonPath))) {
  fs.writeFileSync(distJsonPath, JSON.stringify(output), 'utf8');
  fs.copyFileSync(csvPath, distCsvPath);
  console.log(`Also synchronized dist files at ${distJsonPath} and ${distCsvPath}`);
}

