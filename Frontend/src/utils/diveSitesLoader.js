import Papa from 'papaparse'

// In-memory cache for parsed dive site data
let cachedData = null
let pendingPromise = null

/**
 * Parses and validates dive sites from the local CSV dataset.
 * Adheres strictly to the supplied columns without fabricating ratings,
 * reviews, or missing attributes.
 */
export async function loadDiveSites(csvUrl = '/data/dive-sites.csv') {
  if (cachedData) {
    return cachedData
  }

  if (pendingPromise) {
    return pendingPromise
  }

  pendingPromise = (async () => {
    try {
      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error(`Failed to load dive sites CSV: HTTP ${response.status} ${response.statusText}`)
      }

      const csvText = await response.text()
      if (!csvText || csvText.trim().length === 0) {
        throw new Error('Dive sites CSV file is empty')
      }

      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: 'greedy',
        dynamicTyping: false,
      })

      if (parsed.errors && parsed.errors.length > 0) {
        console.warn('[DiveExplorer] CSV parsing warnings:', parsed.errors.slice(0, 5))
      }

      const rows = parsed.data || []
      const validSites = []
      const skippedRows = []
      const countriesSet = new Set()
      const naturalTypesSet = new Set()
      const seenIds = new Set()

      // Explicit coordinate and dataset corrections for scraped data anomalies
      const DATASET_OVERRIDES = {
        // ID 7336: Duplicate of Komodo Batu Bolong in Indonesia (-8.53608, 119.61399) with flipped positive lat sign mislabeled under Philippines
        '7336': { exclude: true },
        // ID 24530: Typo in longitude (88.47792 instead of 80.47792); real site is Mirissa, Sri Lanka (5.9405, 80.4550)
        '24530': { exclude: true },
        // ID 24531: Accurate coastal reef coordinates for Mirissa, Sri Lanka
        '24531': { country: 'Sri Lanka', latitude: 5.9405, longitude: 80.4550 },

        // User requested removals:
        // Homestead Crater - USA (ID: 3051)
        '3051': { exclude: true },
        // Niagara River Drift Dives - USA (ID: 844)
        '844': { exclude: true },
        // Babbacombe Beach - UK (IDs: 15157, 15259)
        '15157': { exclude: true },
        '15259': { exclude: true },
        // Greenends / Greensends Gully - UK (ID: 439)
        '439': { exclude: true },
        // Conger Alley - UK (ID: 4671)
        '4671': { exclude: true },

        // Inland / on-land freshwater & cenote dive sites removed:
        // Devil's Den - USA (ID: 3223)
        '3223': { exclude: true },
        // Rainbow River - USA (ID: 1558)
        '1558': { exclude: true },
        // Cenote Angelita - Mexico (ID: 2732)
        '2732': { exclude: true },
        // Cenote Tanimax - Mexico (ID: 2769)
        '2769': { exclude: true },
        // Cenote Chak Mol - Mexico (ID: 2804)
        '2804': { exclude: true },
        // Cenote Tajma Ha - Mexico (ID: 3290)
        '3290': { exclude: true },
        // Jardin del Eden - Mexico (ID: 6618)
        '6618': { exclude: true },
        // Cenote Dos Ojos - Mexico (IDs: 6621, 11280)
        '6621': { exclude: true },
        '11280': { exclude: true },
        // Cuevitas - Mexico (ID: 7067)
        '7067': { exclude: true },

        // User requested moves to the authentic open-water coast:
        // Seacrest Cove 2 - USA (Elliott Bay / Puget Sound Coast, Seattle, WA)
        '3019': { latitude: 47.5898, longitude: -122.3805 },
        // Port of Hoodsport - USA (Hood Canal Coastal Waters, Hoodsport, WA)
        '4936': { latitude: 47.4042, longitude: -123.1388 },
        // Brixham Breakwater Beach - UK (Torbay Coast / English Channel, Devon, UK)
        '14': { latitude: 50.4008, longitude: -3.5032 },
        // Punta Osejava - Croatia (ID: 24743)
        '24743': { latitude: 43.28666666666666, longitude: 17.019444444444442 },

        // User requested moves from land to authentic coastal waters (Punta Cautius and similar sites):
        // Mallorca
        '378': { latitude: 39.46380, longitude: 2.50350 }, // Punta Cautius (Calvià cliff drop-off)
        '377': { latitude: 39.46580, longitude: 2.49650 }, // Punta Martin
        '14877': { latitude: 39.46150, longitude: 2.50250 }, // Punta Marc
        '383': { latitude: 39.45450, longitude: 2.51800 }, // Carlotta
        '14639': { latitude: 39.45400, longitude: 2.52400 }, // Punta Cala Figuera
        '384': { latitude: 39.47350, longitude: 2.52150 }, // Portalls Vells
        '381': { latitude: 39.53250, longitude: 2.59250 }, // Illetes
        '9487': { latitude: 39.51650, longitude: 2.54100 }, // Palmanova Bay
        '10242': { latitude: 39.52450, longitude: 2.43350 }, // Cala Montjo
        '14617': { latitude: 39.54450, longitude: 2.62550 }, // Palma Cavern
        '2150': { latitude: 39.75650, longitude: 2.61750 }, // Sa Foradada
        '19369': { latitude: 39.93950, longitude: 3.18400 }, // Es Castellet - The Pinnacle
        '19370': { latitude: 39.96350, longitude: 3.17600 }, // Gorgonias Garden / El Eden De Gorgonias
        '19372': { latitude: 39.92150, longitude: 3.05650 }, // Cala Molins - Cala Carbó
        '17513': { latitude: 39.63100, longitude: 3.43550 }, // Hide And Seek

        // Menorca
        '7189': { latitude: 40.01150, longitude: 3.79300 }, // Pont d'En Gil
        '11694': { latitude: 40.01150, longitude: 3.79350 }, // Sa Cigonya
        '11695': { latitude: 39.96650, longitude: 3.83150 }, // Cala Blanca
        '11705': { latitude: 39.97200, longitude: 3.82650 }, // Canyons
        '2237': { latitude: 40.02150, longitude: 4.20850 }, // Coves De Addaia
        '2241': { latitude: 40.02350, longitude: 4.19700 }, // Punta Grossa
        '2243': { latitude: 40.03150, longitude: 4.19450 }, // La Cueva Grande
        '2244': { latitude: 40.03180, longitude: 4.19450 }, // La Chimenea
        '7413': { latitude: 40.02600, longitude: 4.19350 }, // El Queso Suizo / Swiss Cheese
        '7348': { latitude: 40.06950, longitude: 4.14350 }, // Lightning Corner / Es Racó Des Llamp
        '7349': { latitude: 40.06900, longitude: 4.14850 }, // Cueva De Los Ingleses / English Cave
        '17633': { latitude: 40.07600, longitude: 4.09200 }, // Ad Jatia

        // Ibiza & Formentera
        '2057': { latitude: 39.11700, longitude: 1.50900 }, // Punta Jaime
        '2056': { latitude: 39.11750, longitude: 1.52250 }, // Sa Aigua Blanca
        '2074': { latitude: 39.11500, longitude: 1.54200 }, // Las Anclas
        '2073': { latitude: 39.10350, longitude: 1.55150 }, // Bajo De Ses Caletes
        '2077': { latitude: 39.08000, longitude: 1.40250 }, // Portitxol
        '5587': { latitude: 38.93150, longitude: 1.50450 }, // The Arches Of Cala Olivera

        // Canary Islands
        '333': { latitude: 28.91800, longitude: -13.66850 }, // Cathedral
        '354': { latitude: 28.85700, longitude: -13.84300 }, // Flamingo
        '370': { latitude: 28.91880, longitude: -13.66800 }, // Playa Chica Bay
        '371': { latitude: 28.91950, longitude: -13.67050 }, // Harbour Wall
        '924': { latitude: 28.91850, longitude: -13.67000 }, // Shrimp Cave
        '926': { latitude: 28.91850, longitude: -13.65400 }, // Waikiki
        '927': { latitude: 28.91800, longitude: -13.65800 }, // Richies Reef
        '1061': { latitude: 28.04950, longitude: -16.72200 }, // Playa Las Vistas
        '1109': { latitude: 28.91900, longitude: -13.66500 }, // Playa Grande
        '1110': { latitude: 28.91800, longitude: -13.66600 }, // Veril De Fariones
        '1111': { latitude: 28.91750, longitude: -13.66400 }, // Los Arcos
        '1112': { latitude: 28.91720, longitude: -13.66100 }, // La Pared
        '1182': { latitude: 28.91830, longitude: -13.66950 }, // Red Coral (Playa Chica Wall)
        '1184': { latitude: 29.08350, longitude: -13.44900 }, // Mala (Charco Del Palo)
        '1185': { latitude: 29.07650, longitude: -13.45250 }, // The Elevator (Skulls Cave)

        // Costa Brava
        '87': { latitude: 41.72250, longitude: 2.94000 }, // Mar Menuda
        '770': { latitude: 41.67400, longitude: 2.80200 }, // Punta Santa Anna
        '822': { latitude: 42.35000, longitude: 3.22650 }, // Agua Dolç
        '826': { latitude: 42.34150, longitude: 3.23800 }, // Figarola
        '2152': { latitude: 41.84800, longitude: 3.14100 }, // Margarita
        '3057': { latitude: 42.10500, longitude: 3.17950 }, // Cova De La Sal
        '3059': { latitude: 42.10670, longitude: 3.17450 }, // Port Del Rei
        '3067': { latitude: 42.11350, longitude: 3.17300 }, // La Xinxa
        '3068': { latitude: 42.11580, longitude: 3.16850 }, // Punta Del Ferro
        '14890': { latitude: 41.72050, longitude: 2.94100 }, // Santa Anna
        '15242': { latitude: 41.88750, longitude: 3.18300 }, // Port Pelegri
        '20164': { latitude: 42.06660, longitude: 3.21050 }, // Negre Del Falaguer

        // Costa Blanca / Cabo de Palos
        '79': { latitude: 37.63050, longitude: -0.70150 }, // Balky Point
        '9358': { latitude: 38.76500, longitude: 0.22350 }, // San Martin Norte
        '14378': { latitude: 38.63600, longitude: 0.08000 }, // La Higuera
        '16208': { latitude: 37.63220, longitude: -0.69020 }, // Cala De La Escalerica
        '16209': { latitude: 37.63460, longitude: -0.68900 }, // Cala Fria
        '20174': { latitude: 38.76500, longitude: 0.22400 }, // San Martin Norte (La Virgen)
        '20175': { latitude: 38.76400, longitude: 0.22380 }, // San Martin Sur
        '20176': { latitude: 38.76200, longitude: 0.22350 }, // Piedras Rotas
        '20178': { latitude: 38.75400, longitude: 0.22900 }, // Termas
        '20181': { latitude: 38.74600, longitude: 0.22900 }, // Pared Negra
        '20184': { latitude: 38.74200, longitude: 0.23150 }, // Cueva De Las Gambas
        '20185': { latitude: 38.74050, longitude: 0.23350 }, // Montaña Hundida
        '22532': { latitude: 38.63500, longitude: 0.07050 }, // Racó

        // Exclusions: duplicates, controversial names, and gibberish clubs
        '12386': { exclude: true }, // AREA 51
        '12041': { exclude: true }, // FORREST 05 GUMP
        '846': { exclude: true },   // Free Diver gibberish
        '855': { exclude: true },   // SubShark gibberish
        '12671': { exclude: true }, // Simon's Cave duplicate
        '12668': { exclude: true }, // Coral Gardens duplicate
        '342': { exclude: true },   // Kuwait Qarouh duplicate
        '20420': { exclude: true }, // Kuwait Qarouh Island duplicate
        '13479': { exclude: true }, // Doodles duplicate
        '22854': { exclude: true }, // Steps duplicate

        // Canonical site names & coastal coordinates
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

        // English name canonical overrides (eliminating Taiwanese, Chinese, Korean, Greek/Cyrillic non-Latin characters)
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
      }

      rows.forEach((row, index) => {
        const lineNum = index + 2 // 1-indexed, accounting for header line
        const id = (row.ID || row.id || `site-${index}`).toString().trim()
        let siteName = (row.Site_Name || row.site_name || row.Name || row.name || '').trim()
        let country = (row.Country || row.country || '').trim()
        let latStr = row.Latitude ?? row.latitude
        let lngStr = row.Longitude ?? row.longitude
        const naturalTypes = (row.Natural_Types || row.natural_types || '').trim()
        const sourceUrl = (row.Source_URL || row.source_url || row.URL || row.url || '').trim()
        const coordShift = row.Coordinate_Shift_m ?? ''
        const waterCorrection = row.Water_Correction ?? ''

        // Apply dataset overrides if present
        if (DATASET_OVERRIDES[id]) {
          const override = DATASET_OVERRIDES[id]
          if (override.exclude) {
            skippedRows.push({ line: lineNum, id, siteName, reason: 'Excluded known invalid/duplicate dataset entry', row })
            return
          }
          if (override.country) country = override.country
          if (override.siteName) siteName = override.siteName
          if (override.latitude != null) latStr = override.latitude
          if (override.longitude != null) lngStr = override.longitude
        }

        // Strict English guarantee: strip any remaining non-Latin script characters (CJK, Hangul, Cyrillic)
        const nonLatinRegex = /[\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0E00-\u0E7F\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF]/g
        if (nonLatinRegex.test(siteName)) {
          siteName = siteName.replace(nonLatinRegex, '').replace(/\s{2,}/g, ' ').trim()
          if (!siteName) {
            siteName = `${country} Dive Site ${id}`
          }
        }

        // 1. Validate site name
        if (!siteName) {
          skippedRows.push({ line: lineNum, id, reason: 'Missing location name', row })
          return
        }

        // 2. Validate coordinates
        const lat = parseFloat(latStr)
        const lng = parseFloat(lngStr)

        if (isNaN(lat) || isNaN(lng)) {
          skippedRows.push({ line: lineNum, id, siteName, reason: `Invalid non-numeric coordinates (${latStr}, ${lngStr})`, row })
          return
        }

        if (lat < -90 || lat > 90) {
          skippedRows.push({ line: lineNum, id, siteName, reason: `Latitude outside valid range [-90, 90]: ${lat}`, row })
          return
        }

        if (lng < -180 || lng > 180) {
          skippedRows.push({ line: lineNum, id, siteName, reason: `Longitude outside valid range [-180, 180]: ${lng}`, row })
          return
        }

        // 3. Track duplicates if ID exists
        if (id && seenIds.has(id)) {
          skippedRows.push({ line: lineNum, id, siteName, reason: `Duplicate site ID: ${id}`, row })
          return
        }
        if (id) seenIds.add(id)

        // 4. Collect metadata
        if (country) countriesSet.add(country)
        if (naturalTypes) {
          naturalTypes.split(';').forEach((t) => {
            const cleanT = t.trim()
            if (cleanT) naturalTypesSet.add(cleanT)
          })
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
        })
      })

      if (skippedRows.length > 0) {
        console.info(`[DiveExplorer] Parsed ${validSites.length} valid dive sites. Skipped ${skippedRows.length} malformed/missing records:`, skippedRows)
      } else {
        console.info(`[DiveExplorer] Successfully parsed all ${validSites.length} dive sites without errors.`)
      }

      // Convert to GeoJSON FeatureCollection
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
      }

      // Calculate country aggregates and centroids
      const countryStatsMap = new Map()
      validSites.forEach((site) => {
        const c = site.country
        if (!countryStatsMap.has(c)) {
          countryStatsMap.set(c, {
            country: c,
            count: 0,
            sumLat: 0,
            sumLng: 0,
            sites: [],
          })
        }
        const entry = countryStatsMap.get(c)
        entry.count += 1
        entry.sumLat += site.latitude
        entry.sumLng += site.longitude
        entry.sites.push(site)
      })

      // Canonical mainland coordinates [longitude, latitude] for all 101 countries
      const COUNTRY_COORDS = {
        'Argentina': [-63.6167, -38.4161],
        'Aruba': [-69.9683, 12.5211],
        'Australia': [133.7751, -25.2744],
        'Bahamas': [-77.3963, 25.0343],
        'Barbados': [-59.5432, 13.1939],
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
        'Greece': [21.8243, 39.0742],
        'Grenada': [-61.6042, 12.1165],
        'Guam': [144.7937, 13.4443],
        'Honduras': [-86.2419, 15.2000],
        'Iceland': [-18.5707, 64.9631],
        'India': [78.9629, 20.5937], // Mainland Central India
        'Indonesia': [113.9213, -0.7893],
        'Iran': [53.6880, 32.4279],
        'Ireland': [-8.2439, 53.4129],
        'Italy': [12.5674, 41.8719],
        'Jamaica': [-77.2975, 18.1096],
        'Japan': [138.2529, 36.2048],
        'Jordan': [36.2384, 30.5852],
        'Kenya': [37.9062, -0.0236],
        'Kuwait': [47.4818, 29.3117],
        'Madagascar': [46.8691, -18.7669],
        'Malaysia': [101.9758, 4.2105],
        'Maldives': [73.2207, 3.2028],
        'Malta': [14.3754, 35.9375],
        'Mexico': [-102.5528, 23.6345],
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
        'Portugal': [-8.2245, 39.3999],
        'Puerto Rico': [-66.5901, 18.2208],
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
        'Venezuela': [-66.5897, 6.4238],
        'Vietnam': [108.2772, 14.0583],
        'Western Sahara': [-12.8858, 24.2155],
      }

      const countryCentroids = Array.from(countryStatsMap.values())
        .map((entry) => {
          const canonical = COUNTRY_COORDS[entry.country] ||
            COUNTRY_COORDS[Object.keys(COUNTRY_COORDS).find((k) => k.toLowerCase() === entry.country.toLowerCase())]
          const lng = canonical ? canonical[0] : (entry.sumLng / entry.count)
          const lat = canonical ? canonical[1] : (entry.sumLat / entry.count)

          let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity
          entry.sites.forEach((s) => {
            if (s.longitude < minLng) minLng = s.longitude
            if (s.longitude > maxLng) maxLng = s.longitude
            if (s.latitude < minLat) minLat = s.latitude
            if (s.latitude > maxLat) maxLat = s.latitude
          })

          return {
            country: entry.country,
            count: entry.count,
            latitude: lat,
            longitude: lng,
            bounds: minLng !== Infinity ? [[minLng, minLat], [maxLng, maxLat]] : null,
            sites: entry.sites,
          }
        })
        .sort((a, b) => b.count - a.count)

      // GeoJSON FeatureCollection for Country Centroid Points
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
      }

      const countries = Array.from(countriesSet).sort((a, b) => a.localeCompare(b))
      const naturalTypes = Array.from(naturalTypesSet).sort((a, b) => a.localeCompare(b))

      cachedData = {
        sites: validSites,
        geojson,
        countries,
        countryCentroids,
        geojsonCountries,
        naturalTypes,
        stats: {
          totalRows: rows.length,
          validCount: validSites.length,
          skippedCount: skippedRows.length,
          skippedRows,
          countriesCount: countries.length,
        },
        error: null,
      }

      return cachedData
    } catch (err) {
      console.error('[DiveExplorer] Error loading CSV data:', err)
      return {
        sites: [],
        geojson: { type: 'FeatureCollection', features: [] },
        countries: [],
        countryCentroids: [],
        geojsonCountries: { type: 'FeatureCollection', features: [] },
        naturalTypes: [],
        stats: { totalRows: 0, validCount: 0, skippedCount: 0, skippedRows: [], countriesCount: 0 },
        error: err.message || 'Unable to load dive location dataset.',
      }
    } finally {
      pendingPromise = null
    }
  })()

  return pendingPromise
}

/**
 * Generates a high-performance, vibrant map style with rich oceanic blue waters,
 * crisp coastlines, and guaranteed tile/glyph availability (zero 403 errors).
 */
export function getSaturatedMapStyle(mode = 'oceanic') {
  if (mode === 'satellite') {
    return {
      version: 8,
      name: 'DiveVillageSatellite',
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        'satellite-tiles': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: '&copy; Esri &copy; Earthstar Geographics',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'satellite-layer',
          type: 'raster',
          source: 'satellite-tiles',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    }
  }

  // Default: Oceanic Voyager - Clean, saturated turquoise/azure oceans with crisp continents & reefs
  return {
    version: 8,
    name: 'DiveVillageOceanic',
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      'voyager-tiles': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxzoom: 20,
      },
    },
    layers: [
      {
        id: 'voyager-base',
        type: 'raster',
        source: 'voyager-tiles',
        minzoom: 0,
        maxzoom: 20,
        paint: {
          'raster-saturation': 0.2,
          'raster-contrast': 0.08,
        },
      },
    ],
  }
}

