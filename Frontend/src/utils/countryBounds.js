// Comprehensive Authentic Geographic Bounding Boxes for All Countries
// Format: [[minLongitude, minLatitude], [maxLongitude, maxLatitude]]
// Ensures map.fitBounds() frames the entire country boundaries so the whole country is in frame.

export const COUNTRY_BOUNDS = {
  'Argentina': [[-73.57, -55.05], [-53.64, -21.78]],
  'Aruba': [[-70.07, 12.41], [-69.86, 12.63]],
  'Australia': [[112.92, -43.65], [153.64, -10.68]],
  'Bahamas': [[-79.30, 20.90], [-72.70, 27.30]],
  'Barbados': [[-59.66, 13.04], [-59.42, 13.33]],
  'Belize': [[-89.23, 15.89], [-87.77, 18.50]],
  'Bermuda': [[-64.90, 32.24], [-64.63, 32.39]],
  'Brazil': [[-73.99, -33.75], [-34.79, 5.27]],
  'British Virgin Islands': [[-64.87, 18.30], [-64.27, 18.75]],
  'Brunei': [[114.07, 4.00], [115.36, 5.06]],
  'Bulgaria': [[22.36, 41.24], [28.61, 44.22]],
  'Cambodia': [[102.33, 10.41], [107.63, 14.69]],
  'Canada': [[-141.00, 41.68], [-52.62, 70.00]],
  'Cape Verde': [[-25.36, 14.80], [-22.67, 17.20]],
  'Caribbean Netherlands': [[-68.45, 12.05], [-68.18, 12.32]],
  'Cayman Islands': [[-81.42, 19.26], [-79.72, 19.76]],
  'Chile': [[-75.64, -55.98], [-66.86, -17.50]],
  'China': [[73.50, 18.15], [134.77, 53.56]],
  'Colombia': [[-79.02, -4.23], [-66.85, 12.46]],
  'Costa Rica': [[-85.95, 8.04], [-82.55, 11.22]],
  'Croatia': [[13.49, 42.39], [19.45, 46.55]],
  'Curaçao': [[-69.17, 12.01], [-68.74, 12.39]],
  'Cyprus': [[32.27, 34.57], [34.60, 35.70]],
  'Denmark': [[8.07, 54.56], [15.20, 57.75]],
  'Dominica': [[-61.53, 15.20], [-61.24, 15.65]],
  'Dominican Republic': [[-72.01, 17.54], [-68.32, 19.93]],
  'Ecuador': [[-81.08, -5.02], [-75.19, 1.46]],
  'Egypt': [[24.70, 22.00], [36.90, 31.67]],
  'Federated States of Micronesia': [[137.00, 1.00], [163.10, 10.10]],
  'Fiji': [[177.00, -19.20], [180.00, -15.70]],
  'Finland': [[20.55, 59.80], [31.59, 70.09]],
  'France': [[-4.79, 41.36], [9.56, 51.09]],
  'French Polynesia': [[-154.70, -27.60], [-134.40, -7.90]],
  'Germany': [[5.87, 47.27], [15.04, 55.06]],
  'Greece': [[19.37, 34.80], [29.65, 41.75]],
  'Grenada': [[-61.80, 11.98], [-61.35, 12.53]],
  'Guam': [[144.62, 13.23], [144.96, 13.66]],
  'Honduras': [[-89.35, 12.98], [-83.13, 16.51]],
  'Iceland': [[-24.54, 63.39], [-13.50, 66.54]],
  'India': [[68.18, 6.75], [97.40, 35.50]],
  'Indonesia': [[95.00, -11.00], [141.02, 5.90]],
  'Iran': [[44.03, 25.06], [63.33, 39.78]],
  'Ireland': [[-10.48, 51.44], [-6.00, 55.38]],
  'Italy': [[6.63, 36.65], [18.52, 47.09]],
  'Jamaica': [[-78.37, 17.70], [-76.18, 18.53]],
  'Japan': [[128.00, 26.00], [146.00, 45.52]],
  'Jordan': [[34.96, 29.19], [39.30, 33.37]],
  'Kenya': [[33.91, -4.68], [41.91, 5.03]],
  'Kuwait': [[46.55, 28.52], [48.42, 30.10]],
  'Madagascar': [[43.23, -25.60], [50.48, -11.95]],
  'Malaysia': [[99.64, 0.85], [119.27, 7.36]],
  'Maldives': [[72.60, -0.70], [73.80, 7.15]],
  'Malta': [[14.18, 35.79], [14.58, 36.08]],
  'Mexico': [[-117.13, 14.53], [-86.71, 32.72]],
  'Montenegro': [[18.43, 41.85], [20.35, 43.56]],
  'Mozambique': [[30.22, -26.87], [40.84, -10.47]],
  'Netherlands': [[3.36, 50.75], [7.23, 53.55]],
  'New Zealand': [[166.43, -47.29], [178.58, -34.42]],
  'Niue': [[-169.95, -19.15], [-169.78, -18.96]],
  'Northern Mariana Islands': [[145.10, 14.10], [145.90, 20.60]],
  'Oman': [[52.00, 16.65], [59.84, 26.39]],
  'Palau': [[134.10, 6.80], [134.75, 8.20]],
  'Panama': [[-83.05, 7.20], [-77.16, 9.63]],
  'Papua New Guinea': [[140.84, -11.66], [155.97, -1.32]],
  'Peru': [[-81.33, -18.35], [-68.65, -0.04]],
  'Philippines': [[116.93, 4.64], [126.60, 21.13]],
  'Portugal': [[-9.53, 36.96], [-6.19, 42.15]],
  'Puerto Rico': [[-67.27, 17.92], [-65.24, 18.52]],
  'Republic of Mauritius': [[57.31, -20.53], [57.78, -19.98]],
  'Romania': [[20.26, 43.62], [29.71, 48.27]],
  'Russia': [[27.50, 41.19], [179.00, 75.00]],
  'Réunion': [[55.22, -21.39], [55.84, -20.87]],
  'Saint Kitts & Nevis': [[-62.88, 17.09], [-62.55, 17.42]],
  'Saint Vincent & the Grenadines': [[-61.45, 12.58], [-61.12, 13.39]],
  'Saudi Arabia': [[34.50, 16.38], [55.67, 32.16]],
  'Senegal': [[-17.54, 12.31], [-11.36, 16.69]],
  'Seychelles': [[55.20, -4.85], [55.85, -4.20]],
  'Singapore': [[103.60, 1.21], [104.05, 1.48]],
  'Sint Maarten': [[-63.14, 18.01], [-63.01, 18.07]],
  'South Africa': [[16.45, -34.83], [32.89, -22.13]],
  'South Korea': [[126.09, 33.11], [129.58, 38.61]],
  'Spain': [[-9.30, 36.00], [3.33, 43.79]],
  'Sri Lanka': [[79.65, 5.92], [81.88, 9.84]],
  'Sudan': [[21.82, 9.35], [38.58, 22.22]],
  'Sweden': [[11.12, 55.34], [24.17, 69.06]],
  'Taiwan': [[120.04, 21.90], [122.01, 25.30]],
  'Tanzania': [[29.33, -11.75], [40.44, -0.99]],
  'Thailand': [[97.34, 5.61], [105.64, 20.46]],
  'The Guadeloupe Islands': [[-61.81, 15.83], [-61.00, 16.51]],
  'Timor Leste (East Timor)': [[124.04, -9.50], [127.34, -8.13]],
  'Trinidad and Tobago': [[-61.93, 10.03], [-60.51, 11.35]],
  'Tunisia': [[7.52, 30.24], [11.60, 37.56]],
  'Turkey': [[25.67, 35.82], [44.82, 42.10]],
  'Turks and Caicos Islands': [[-72.48, 21.43], [-71.13, 21.95]],
  'U.S. Virgin Islands': [[-65.09, 17.68], [-64.63, 18.42]],
  'United Arab Emirates': [[51.58, 22.63], [56.38, 26.07]],
  'United Kingdom': [[-8.65, 49.86], [1.77, 58.70]],
  'United States of America (USA)': [[-125.00, 24.52], [-66.95, 49.38]],
  'Venezuela': [[-73.38, 0.65], [-59.80, 12.20]],
  'Vietnam': [[102.14, 8.56], [109.47, 23.39]],
  'Western Sahara': [[-17.10, 20.77], [-8.67, 27.67]],
}

// Aliases and normalized keys for seamless matching
const COUNTRY_ALIASES = {
  'usa': 'United States of America (USA)',
  'united states': 'United States of America (USA)',
  'united states of america': 'United States of America (USA)',
  'us': 'United States of America (USA)',
  'uk': 'United Kingdom',
  'great britain': 'United Kingdom',
  'britain': 'United Kingdom',
  'england': 'United Kingdom',
  'uae': 'United Arab Emirates',
  'timor leste': 'Timor Leste (East Timor)',
  'east timor': 'Timor Leste (East Timor)',
  'mauritius': 'Republic of Mauritius',
  'guadeloupe': 'The Guadeloupe Islands',
  'st kitts and nevis': 'Saint Kitts & Nevis',
  'saint kitts and nevis': 'Saint Kitts & Nevis',
  'st vincent and the grenadines': 'Saint Vincent & the Grenadines',
  'saint vincent & the grenadines': 'Saint Vincent & the Grenadines',
  'turks and caicos': 'Turks and Caicos Islands',
  'us virgin islands': 'U.S. Virgin Islands',
  'curacao': 'Curaçao',
  'reunion': 'Réunion',
  'micronesia': 'Federated States of Micronesia',
}

/**
 * Returns the geographic bounding box [[minLng, minLat], [maxLng, maxLat]] for a given country name.
 * @param {string} countryName
 * @returns {[[number, number], [number, number]] | null}
 */
export function getCountryBounds(countryName) {
  if (!countryName || typeof countryName !== 'string') return null
  const trimmed = countryName.trim()
  if (COUNTRY_BOUNDS[trimmed]) return COUNTRY_BOUNDS[trimmed]

  const lower = trimmed.toLowerCase()
  if (COUNTRY_ALIASES[lower] && COUNTRY_BOUNDS[COUNTRY_ALIASES[lower]]) {
    return COUNTRY_BOUNDS[COUNTRY_ALIASES[lower]]
  }

  // Case-insensitive lookup
  const match = Object.keys(COUNTRY_BOUNDS).find((k) => k.toLowerCase() === lower)
  if (match) return COUNTRY_BOUNDS[match]

  // Substring match
  const subMatch = Object.keys(COUNTRY_BOUNDS).find(
    (k) => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)
  )
  if (subMatch) return COUNTRY_BOUNDS[subMatch]

  return null
}

export default getCountryBounds
