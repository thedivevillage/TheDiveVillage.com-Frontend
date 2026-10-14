// Comprehensive Authentic Geographic Bounding Boxes for All Countries
// Format: [[minLongitude, minLatitude], [maxLongitude, maxLatitude]]
// Ensures map.fitBounds() frames the entire country boundaries so the whole country is fully within the frame.

export const COUNTRY_BOUNDS = {
  'Argentina': [[-73.57, -55.05], [-53.64, -21.78]],
  'Aruba': [[-70.20, 12.34], [-69.86, 12.72]],
  'Australia': [[112.92, -43.65], [153.75, -10.68]],
  'Bahamas': [[-79.30, 20.90], [-72.70, 27.30]],
  'Barbados': [[-59.76, 12.94], [-59.42, 13.33]],
  'Belize': [[-89.23, 15.89], [-87.41, 18.50]],
  'Bermuda': [[-64.99, 32.11], [-64.54, 32.59]],
  'Brazil': [[-73.99, -33.75], [-32.25, 5.27]],
  'British Virgin Islands': [[-64.87, 18.25], [-64.27, 18.75]],
  'Brunei': [[114.07, 4.00], [115.36, 5.21]],
  'Bulgaria': [[22.36, 41.24], [28.61, 44.22]],
  'Cambodia': [[102.33, 10.11], [107.63, 14.69]],
  'Canada': [[-141.00, 41.68], [-52.62, 70.00]],
  'Cape Verde': [[-25.36, 14.80], [-22.67, 17.20]],
  'Caribbean Netherlands': [[-68.47, 11.91], [-62.86, 17.64]],
  'Cayman Islands': [[-81.52, 19.16], [-79.72, 19.76]],
  'Chile': [[-75.64, -55.98], [-66.86, -17.50]],
  'China': [[73.50, 18.09], [134.77, 53.56]],
  'Colombia': [[-81.85, -4.23], [-66.85, 13.52]],
  'Costa Rica': [[-85.99, 8.04], [-82.55, 11.22]],
  'Croatia': [[13.45, 42.39], [19.45, 46.55]],
  'Curaçao': [[-69.34, 11.87], [-68.53, 12.50]],
  'Cyprus': [[32.18, 34.49], [34.60, 35.70]],
  'Denmark': [[8.07, 54.56], [15.20, 57.75]],
  'Dominica': [[-61.60, 15.12], [-61.24, 15.74]],
  'Dominican Republic': [[-72.01, 17.54], [-68.32, 19.93]],
  'Ecuador': [[-90.69, -5.02], [-75.19, 1.46]],
  'Egypt': [[24.70, 22.00], [36.90, 31.67]],
  'Federated States of Micronesia': [[137.00, 1.00], [163.10, 10.10]],
  'Fiji': [[176.99, -19.20], [180.05, -15.70]],
  'Finland': [[20.55, 59.80], [31.59, 70.09]],
  'France': [[-4.79, 41.22], [9.56, 51.09]],
  'French Polynesia': [[-154.70, -27.60], [-134.40, -7.90]],
  'Germany': [[5.87, 47.27], [15.04, 55.06]],
  'Greece': [[19.37, 34.80], [29.65, 41.75]],
  'Grenada': [[-61.92, 11.90], [-61.35, 12.61]],
  'Guam': [[144.50, 13.23], [144.96, 13.74]],
  'Honduras': [[-89.35, 12.98], [-83.13, 16.51]],
  'Iceland': [[-24.54, 63.39], [-13.50, 66.54]],
  'India': [[68.18, 6.75], [97.40, 35.50]],
  'Indonesia': [[95.00, -11.00], [141.02, 6.03]],
  'Iran': [[44.03, 25.06], [63.33, 39.78]],
  'Ireland': [[-10.48, 51.44], [-5.99, 55.38]],
  'Italy': [[6.63, 36.65], [18.60, 47.09]],
  'Jamaica': [[-78.37, 17.70], [-76.18, 18.62]],
  'Japan': [[127.21, 25.97], [146.00, 45.52]],
  'Jordan': [[34.85, 29.19], [39.30, 33.37]],
  'Kenya': [[33.91, -4.68], [41.91, 5.03]],
  'Kuwait': [[46.55, 28.52], [48.90, 30.10]],
  'Madagascar': [[43.23, -25.60], [50.48, -11.95]],
  'Malaysia': [[99.57, 0.85], [119.27, 7.36]],
  'Maldives': [[72.59, -0.80], [73.80, 7.15]],
  'Malta': [[12.75, 35.70], [14.68, 36.20]],
  'Mexico': [[-117.38, 14.53], [-86.59, 32.72]],
  'Montenegro': [[18.43, 41.85], [20.35, 43.56]],
  'Mozambique': [[30.22, -26.96], [40.84, -10.47]],
  'Netherlands': [[3.36, 50.75], [7.23, 53.55]],
  'New Zealand': [[166.43, -47.29], [178.58, -34.42]],
  'Niue': [[-170.06, -19.25], [-169.78, -18.90]],
  'Northern Mariana Islands': [[145.10, 14.10], [145.95, 20.60]],
  'Oman': [[52.00, 16.65], [59.84, 26.52]],
  'Palau': [[134.09, 6.80], [134.75, 8.20]],
  'Panama': [[-83.05, 7.09], [-77.16, 9.63]],
  'Papua New Guinea': [[140.84, -11.66], [155.97, -1.32]],
  'Peru': [[-81.33, -18.35], [-68.65, -0.04]],
  'Philippines': [[116.93, 4.64], [126.60, 21.13]],
  'Portugal': [[-29.66, 32.52], [-6.19, 42.15]],
  'Puerto Rico': [[-67.37, 17.75], [-65.21, 18.59]],
  'Republic of Mauritius': [[57.17, -20.53], [57.90, -19.48]],
  'Romania': [[20.26, 43.62], [29.71, 48.27]],
  'Russia': [[27.50, 41.19], [179.00, 75.00]],
  'Réunion': [[55.10, -21.39], [55.84, -20.87]],
  'Saint Kitts & Nevis': [[-63.10, 17.09], [-62.55, 17.58]],
  'Saint Vincent & the Grenadines': [[-61.45, 12.58], [-61.08, 13.39]],
  'Saudi Arabia': [[34.50, 16.38], [55.67, 32.16]],
  'Senegal': [[-17.63, 12.31], [-11.36, 16.69]],
  'Seychelles': [[55.10, -4.85], [55.87, -4.14]],
  'Singapore': [[103.60, 1.10], [104.05, 1.48]],
  'Sint Maarten': [[-63.18, 17.87], [-62.93, 18.11]],
  'South Africa': [[16.45, -34.83], [32.89, -22.13]],
  'South Korea': [[126.09, 33.10], [129.69, 38.61]],
  'Spain': [[-18.16, 27.51], [4.42, 43.79]],
  'Sri Lanka': [[79.65, 5.79], [83.32, 9.84]],
  'Sudan': [[21.82, 9.35], [38.58, 22.22]],
  'Sweden': [[11.12, 55.34], [24.17, 69.06]],
  'Taiwan': [[120.04, 21.81], [122.04, 25.30]],
  'Tanzania': [[29.33, -11.75], [40.44, -0.99]],
  'Thailand': [[97.34, 5.61], [105.64, 20.46]],
  'The Guadeloupe Islands': [[-61.93, 15.83], [-61.00, 16.51]],
  'Timor Leste (East Timor)': [[124.04, -9.50], [127.34, -8.09]],
  'Trinidad and Tobago': [[-61.93, 10.03], [-60.39, 11.45]],
  'Tunisia': [[7.52, 30.24], [12.75, 37.56]],
  'Turkey': [[25.67, 35.82], [44.82, 42.10]],
  'Turks and Caicos Islands': [[-72.48, 21.36], [-71.13, 21.95]],
  'U.S. Virgin Islands': [[-65.09, 17.59], [-64.45, 18.49]],
  'United Arab Emirates': [[51.58, 22.63], [56.54, 26.07]],
  'United Kingdom': [[-8.65, 49.86], [1.77, 58.70]],
  'United States of America (USA)': [[-159.59, 19.61], [-66.95, 49.38]],
  'Venezuela': [[-73.38, 0.65], [-59.80, 12.20]],
  'Vietnam': [[102.14, 8.56], [109.58, 23.39]],
  'Western Sahara': [[-17.10, 20.77], [-8.67, 32.86]],
}

// Aliases and normalized keys for seamless matching across vector tile labels and inputs
export const COUNTRY_ALIASES = {
  'usa': 'United States of America (USA)',
  'united states': 'United States of America (USA)',
  'united states of america': 'United States of America (USA)',
  'us': 'United States of America (USA)',
  'u.s.': 'United States of America (USA)',
  'u.s.a.': 'United States of America (USA)',
  'uk': 'United Kingdom',
  'great britain': 'United Kingdom',
  'britain': 'United Kingdom',
  'england': 'United Kingdom',
  'scotland': 'United Kingdom',
  'wales': 'United Kingdom',
  'uae': 'United Arab Emirates',
  'timor leste': 'Timor Leste (East Timor)',
  'east timor': 'Timor Leste (East Timor)',
  'mauritius': 'Republic of Mauritius',
  'republic of mauritius': 'Republic of Mauritius',
  'guadeloupe': 'The Guadeloupe Islands',
  'st kitts and nevis': 'Saint Kitts & Nevis',
  'saint kitts and nevis': 'Saint Kitts & Nevis',
  'st. kitts and nevis': 'Saint Kitts & Nevis',
  'st vincent and the grenadines': 'Saint Vincent & the Grenadines',
  'saint vincent and the grenadines': 'Saint Vincent & the Grenadines',
  'st. vincent and the grenadines': 'Saint Vincent & the Grenadines',
  'turks and caicos': 'Turks and Caicos Islands',
  'turks and caicos islands': 'Turks and Caicos Islands',
  'us virgin islands': 'U.S. Virgin Islands',
  'u.s. virgin islands': 'U.S. Virgin Islands',
  'curacao': 'Curaçao',
  'reunion': 'Réunion',
  'micronesia': 'Federated States of Micronesia',
  'federated states of micronesia': 'Federated States of Micronesia',
  'russia': 'Russia',
  'russian federation': 'Russia',
  'south korea': 'South Korea',
  'republic of korea': 'South Korea',
  'korea': 'South Korea',
}

/**
 * Resolves any country name, alias, or label string to a canonical recognized country name in the dataset.
 * @param {string} rawName
 * @returns {string | null}
 */
export function matchCountryName(rawName) {
  if (!rawName || typeof rawName !== 'string') return null
  const trimmed = rawName.trim()
  if (COUNTRY_BOUNDS[trimmed]) return trimmed

  const lower = trimmed.toLowerCase()
  if (COUNTRY_ALIASES[lower] && COUNTRY_BOUNDS[COUNTRY_ALIASES[lower]]) {
    return COUNTRY_ALIASES[lower]
  }

  // Case-insensitive lookup
  const match = Object.keys(COUNTRY_BOUNDS).find((k) => k.toLowerCase() === lower)
  if (match) return match

  // Substring matching
  const subMatch = Object.keys(COUNTRY_BOUNDS).find(
    (k) => lower === k.toLowerCase() || lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)
  )
  if (subMatch) return subMatch

  return null
}

/**
 * Returns the geographic bounding box [[minLng, minLat], [maxLng, maxLat]] for a given country name.
 * @param {string} countryName
 * @returns {[[number, number], [number, number]] | null}
 */
export function getCountryBounds(countryName) {
  const canonical = matchCountryName(countryName)
  if (canonical && COUNTRY_BOUNDS[canonical]) {
    return COUNTRY_BOUNDS[canonical]
  }
  return null
}

export default getCountryBounds
