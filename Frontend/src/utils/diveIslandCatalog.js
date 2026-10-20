/**
 * Dive Island & Regional Hubs Catalog
 * 
 * Maps verified dive sites across worldwide destinations into authentic
 * islands, atolls, and coastal dive regions.
 * Segregates distinct islands and mainland regions cleanly without combining them.
 */

export const POPULAR_ISLAND_REGIONS = {
  'Philippines': [
    { name: 'Malapascua Island', lat: 11.33, lng: 124.11 },
    { name: 'Cebu Island (Moalboal)', lat: 9.95, lng: 123.40 },
    { name: 'Cebu Island (Mactan & Central)', lat: 10.30, lng: 123.98 },
    { name: 'Sumilon Island', lat: 9.43, lng: 123.38 },
    { name: 'Panglao Island', lat: 9.58, lng: 123.77 },
    { name: 'Cabilao Island', lat: 9.88, lng: 123.78 },
    { name: 'Bohol Island', lat: 9.85, lng: 124.15 },
    { name: 'Coron Island', lat: 11.99, lng: 120.22 },
    { name: 'Busuanga Island', lat: 12.15, lng: 120.05 },
    { name: 'El Nido & Bacuit Bay (Palawan)', lat: 11.20, lng: 119.40 },
    { name: 'Mindoro Island (Puerto Galera)', lat: 13.52, lng: 120.97 },
    { name: 'Negros Island (Dauin & Dumaguete Coast)', lat: 9.18, lng: 123.26 },
    { name: 'Apo Island', lat: 9.08, lng: 123.27 },
    { name: 'Siquijor Island', lat: 9.18, lng: 123.58 },
    { name: 'Boracay Island', lat: 11.97, lng: 121.92 },
    { name: 'Luzon Mainland (Batangas & Anilao)', lat: 13.75, lng: 120.90 },
    { name: 'Luzon Mainland (Subic Bay & Zambales)', lat: 14.80, lng: 120.25 },
    { name: 'Tubbataha Reefs', lat: 8.90, lng: 119.90 },
    { name: 'Leyte (Sogod Bay)', lat: 10.20, lng: 125.00 },
    { name: 'Romblon Island', lat: 12.57, lng: 122.28 },
    { name: 'Tablas Island', lat: 12.40, lng: 122.05 },
    { name: 'Siargao Island', lat: 9.85, lng: 126.05 },
  ],
  'Indonesia': [
    { name: 'Bali Island', lat: -8.35, lng: 115.30 },
    { name: 'Nusa Penida', lat: -8.72, lng: 115.54 },
    { name: 'Nusa Lembongan & Ceningan', lat: -8.68, lng: 115.45 },
    { name: 'Gili Islands (Trawangan, Meno, Air)', lat: -8.35, lng: 116.04 },
    { name: 'Lombok Island', lat: -8.70, lng: 116.25 },
    { name: 'Komodo National Park', lat: -8.60, lng: 119.60 },
    { name: 'Raja Ampat (Papua)', lat: -0.50, lng: 130.50 },
    { name: 'Bunaken Island & Siladen', lat: 1.62, lng: 124.76 },
    { name: 'Manado Coast (North Sulawesi Mainland)', lat: 1.49, lng: 124.84 },
    { name: 'Lembeh Strait & Island', lat: 1.45, lng: 125.23 },
    { name: 'Alor Archipelago', lat: -8.25, lng: 124.40 },
    { name: 'Banda Islands', lat: -4.52, lng: 129.90 },
    { name: 'Wakatobi Islands', lat: -5.35, lng: 123.60 },
    { name: 'Derawan Island', lat: 2.28, lng: 118.24 },
    { name: 'Sangalaki & Maratua Islands', lat: 2.09, lng: 118.60 },
    { name: 'Pulau Weh (Aceh)', lat: 5.85, lng: 95.31 },
    { name: 'Seribu Islands (Thousand Islands)', lat: -5.60, lng: 106.55 },
  ],
  'Maldives': [
    { name: 'North Malé Atoll', lat: 4.35, lng: 73.50 },
    { name: 'South Malé Atoll', lat: 3.95, lng: 73.45 },
    { name: 'North Ari Atoll (Alif Alif)', lat: 4.05, lng: 72.85 },
    { name: 'South Ari Atoll (Alif Dhaal)', lat: 3.60, lng: 72.85 },
    { name: 'Baa Atoll (Hanifaru Bay)', lat: 5.15, lng: 73.05 },
    { name: 'Rasdhoo Atoll', lat: 4.26, lng: 72.99 },
    { name: 'Vaavu Atoll (Felidhoo)', lat: 3.55, lng: 73.55 },
    { name: 'Lhaviyani Atoll', lat: 5.40, lng: 73.50 },
    { name: 'Raa Atoll', lat: 5.65, lng: 72.95 },
    { name: 'Noonu Atoll', lat: 5.85, lng: 73.30 },
    { name: 'Dhaalu Atoll', lat: 2.85, lng: 73.00 },
    { name: 'Faafu Atoll', lat: 3.15, lng: 72.95 },
    { name: 'Meemu Atoll', lat: 3.00, lng: 73.50 },
    { name: 'Thaa Atoll', lat: 2.35, lng: 73.20 },
    { name: 'Fuvahmulah Atoll', lat: -0.29, lng: 73.42 },
    { name: 'Addu Atoll (Seenu)', lat: -0.63, lng: 73.16 },
  ],
  'Thailand': [
    { name: 'Koh Tao Island', lat: 10.10, lng: 99.83 },
    { name: 'Koh Samui Island', lat: 9.51, lng: 100.01 },
    { name: 'Koh Phangan Island', lat: 9.75, lng: 100.03 },
    { name: 'Phuket Island', lat: 7.88, lng: 98.39 },
    { name: 'Racha Islands (Racha Yai & Noi)', lat: 7.60, lng: 98.37 },
    { name: 'Phi Phi Islands', lat: 7.74, lng: 98.77 },
    { name: 'Krabi Coast (Mainland)', lat: 8.03, lng: 98.82 },
    { name: 'Similan Islands', lat: 8.65, lng: 97.64 },
    { name: 'Surin Islands', lat: 9.42, lng: 97.87 },
    { name: 'Koh Lanta Island', lat: 7.55, lng: 99.04 },
    { name: 'Hin Daeng & Hin Muang', lat: 7.15, lng: 98.82 },
    { name: 'Koh Chang Island & Trat', lat: 11.60, lng: 102.50 },
    { name: 'Pattaya & Rayong Coast (Mainland)', lat: 12.75, lng: 100.85 },
    { name: 'Chumphon Coast (Mainland)', lat: 10.45, lng: 99.30 },
  ],
  'Malaysia': [
    { name: 'Sipadan Island', lat: 4.11, lng: 118.62 },
    { name: 'Mabul & Kapalai Islands', lat: 4.24, lng: 118.63 },
    { name: 'Sabah Coast & Kota Kinabalu (Borneo)', lat: 5.98, lng: 116.07 },
    { name: 'Tioman Island', lat: 2.80, lng: 104.15 },
    { name: 'Perhentian Islands', lat: 5.90, lng: 102.75 },
    { name: 'Redang Island', lat: 5.77, lng: 103.01 },
    { name: 'Layang Layang Atoll', lat: 7.37, lng: 113.84 },
    { name: 'Langkawi Island', lat: 6.35, lng: 99.80 },
  ],
  'Spain': [
    { name: 'Mallorca Island (Balearic Islands)', lat: 39.60, lng: 2.95 },
    { name: 'Menorca Island (Balearic Islands)', lat: 39.95, lng: 4.10 },
    { name: 'Ibiza Island (Balearic Islands)', lat: 38.98, lng: 1.43 },
    { name: 'Formentera Island (Balearic Islands)', lat: 38.70, lng: 1.45 },
    { name: 'Tenerife Island (Canary Islands)', lat: 28.25, lng: -16.60 },
    { name: 'Gran Canaria Island (Canary Islands)', lat: 27.95, lng: -15.60 },
    { name: 'Lanzarote Island (Canary Islands)', lat: 29.02, lng: -13.65 },
    { name: 'Fuerteventura Island (Canary Islands)', lat: 28.35, lng: -14.05 },
    { name: 'La Palma Island (Canary Islands)', lat: 28.65, lng: -17.85 },
    { name: 'El Hierro Island (Canary Islands)', lat: 27.75, lng: -18.02 },
    { name: 'La Gomera Island (Canary Islands)', lat: 28.12, lng: -17.25 },
    { name: 'Medes Islands', lat: 42.05, lng: 3.22 },
    { name: 'Costa Brava Coast (Mainland)', lat: 41.90, lng: 3.15 },
    { name: 'Costa Blanca & Alicante (Mainland)', lat: 38.35, lng: -0.48 },
    { name: 'Cabo de Palos & Murcia (Mainland)', lat: 37.63, lng: -0.70 },
    { name: 'Costa del Sol & Andalusia (Mainland)', lat: 36.70, lng: -4.40 },
  ],
  'Malta': [
    { name: 'Malta Island (Valletta & Cirkewwa)', lat: 35.90, lng: 14.45 },
    { name: 'Gozo Island', lat: 36.05, lng: 14.25 },
    { name: 'Comino Island (Blue Lagoon)', lat: 36.01, lng: 14.33 },
  ],
  'India': [
    { name: 'Havelock Island (Swaraj Dweep)', lat: 12.00, lng: 93.00 },
    { name: 'Neil Island (Shaheed Dweep)', lat: 11.83, lng: 93.05 },
    { name: 'Port Blair & South Andaman', lat: 11.66, lng: 92.74 },
    { name: 'Nicobar Islands', lat: 8.00, lng: 93.50 },
    { name: 'Grande Island (Goa)', lat: 15.35, lng: 73.76 },
    { name: 'Goa Mainland Coast', lat: 15.50, lng: 73.80 },
    { name: 'Netrani Island (Karnataka)', lat: 14.01, lng: 74.32 },
    { name: 'Lakshadweep Islands', lat: 10.57, lng: 72.63 },
    { name: 'Kovalam & Kerala Coast (Mainland)', lat: 8.39, lng: 76.97 },
    { name: 'Pondicherry & East Coast (Mainland)', lat: 11.93, lng: 79.83 },
  ],
  'Greece': [
    { name: 'Santorini Island', lat: 36.38, lng: 25.46 },
    { name: 'Mykonos Island', lat: 37.45, lng: 25.35 },
    { name: 'Paros & Naxos Islands', lat: 37.05, lng: 25.25 },
    { name: 'Milos Island', lat: 36.70, lng: 24.42 },
    { name: 'Crete Island', lat: 35.30, lng: 24.80 },
    { name: 'Corfu Island', lat: 39.62, lng: 19.92 },
    { name: 'Zakynthos Island', lat: 37.78, lng: 20.90 },
    { name: 'Lefkada & Kefalonia Islands', lat: 38.50, lng: 20.60 },
    { name: 'Rhodes Island', lat: 36.20, lng: 28.00 },
    { name: 'Kos & Kalymnos Islands', lat: 36.90, lng: 27.00 },
    { name: 'Athens & Attica Coast (Mainland)', lat: 37.85, lng: 23.80 },
    { name: 'Peloponnese Coast (Mainland)', lat: 37.00, lng: 22.00 },
  ],
  'Italy': [
    { name: 'Sicily Island', lat: 37.75, lng: 14.25 },
    { name: 'Aeolian Islands (Lipari & Vulcano)', lat: 38.50, lng: 14.95 },
    { name: 'Sardinia Island', lat: 40.20, lng: 9.15 },
    { name: 'Maddalena Archipelago', lat: 41.22, lng: 9.42 },
    { name: 'Elba & Tuscan Archipelago', lat: 42.78, lng: 10.28 },
    { name: 'Capri & Ischia Islands', lat: 40.65, lng: 14.15 },
    { name: 'Portofino & Ligurian Coast (Mainland)', lat: 44.30, lng: 9.21 },
    { name: 'Amalfi Coast & Campania (Mainland)', lat: 40.60, lng: 14.60 },
    { name: 'Puglia & Adriatic Coast (Mainland)', lat: 40.90, lng: 17.30 },
  ],
  'United States of America (USA)': [
    { name: 'Key Largo & Upper Florida Keys', lat: 25.10, lng: -80.44 },
    { name: 'Islamorada & Middle Florida Keys', lat: 24.85, lng: -80.70 },
    { name: 'Key West & Lower Florida Keys', lat: 24.55, lng: -81.78 },
    { name: 'Southeast Florida Coast (Mainland)', lat: 26.10, lng: -80.10 },
    { name: 'Florida Gulf Coast (Mainland)', lat: 28.00, lng: -82.80 },
    { name: 'Oahu Island (Hawaii)', lat: 21.45, lng: -157.97 },
    { name: 'Maui & Molokai (Hawaii)', lat: 20.80, lng: -156.33 },
    { name: 'Hawaii Big Island (Kona)', lat: 19.65, lng: -155.85 },
    { name: 'Kauai Island (Hawaii)', lat: 22.05, lng: -159.50 },
    { name: 'Channel Islands & Catalina (California)', lat: 33.38, lng: -118.42 },
    { name: 'California Coast (Monterey & San Diego / Mainland)', lat: 35.00, lng: -120.00 },
    { name: 'North Carolina Outer Banks (Mainland)', lat: 34.70, lng: -76.60 },
    { name: 'Pacific Northwest Coast (Mainland)', lat: 47.60, lng: -122.33 },
    { name: 'New England Coast (Mainland)', lat: 42.50, lng: -70.60 },
  ],
  'Australia': [
    { name: 'Great Barrier Reef (Cairns & Port Douglas)', lat: -16.80, lng: 146.00 },
    { name: 'Whitsunday Islands', lat: -20.25, lng: 149.00 },
    { name: 'Townsville & Coral Sea', lat: -19.25, lng: 147.00 },
    { name: 'Southern Reef & Heron Island', lat: -23.44, lng: 151.91 },
    { name: 'Ningaloo Reef & Exmouth', lat: -22.00, lng: 114.00 },
    { name: 'Rottnest Island', lat: -32.00, lng: 115.52 },
    { name: 'Lord Howe Island', lat: -31.55, lng: 159.08 },
    { name: 'Moreton Island & Brisbane', lat: -27.20, lng: 153.40 },
    { name: 'Sydney & NSW Coast (Mainland)', lat: -33.85, lng: 151.25 },
    { name: 'Melbourne & Victoria Coast (Mainland)', lat: -38.30, lng: 144.80 },
    { name: 'Tasmania Island', lat: -42.80, lng: 147.30 },
  ],
  'Mexico': [
    { name: 'Cozumel Island', lat: 20.42, lng: -86.92 },
    { name: 'Isla Mujeres & Cancun', lat: 21.23, lng: -86.73 },
    { name: 'Riviera Maya Coast (Mainland)', lat: 20.62, lng: -87.07 },
    { name: 'Tulum & Akumal Coast (Mainland)', lat: 20.35, lng: -87.35 },
    { name: 'Socorro & Revillagigedo Islands', lat: 18.80, lng: -110.90 },
    { name: 'Cabo San Lucas & Los Cabos (Baja)', lat: 22.88, lng: -109.90 },
    { name: 'Cabo Pulmo Marine Park (Baja)', lat: 23.44, lng: -109.42 },
    { name: 'La Paz & Sea of Cortez (Baja)', lat: 24.25, lng: -110.32 },
  ],
  'Egypt': [
    { name: 'Sharm El Sheikh (Ras Mohammed & Tiran)', lat: 27.85, lng: 34.30 },
    { name: 'Dahab (Blue Hole & Canyon)', lat: 28.50, lng: 34.52 },
    { name: 'Nuweiba & Gulf of Aqaba', lat: 29.00, lng: 34.65 },
    { name: 'Hurghada (Giftun Islands)', lat: 27.25, lng: 33.85 },
    { name: 'El Gouna', lat: 27.40, lng: 33.68 },
    { name: 'Safaga & Soma Bay', lat: 26.75, lng: 33.95 },
    { name: 'Marsa Alam & Elphinstone Reef', lat: 25.10, lng: 34.90 },
    { name: 'Brother Islands & Daedalus Reef (Deep South)', lat: 26.30, lng: 34.85 },
    { name: 'Hamata & Fury Shoals (St. John’s)', lat: 24.25, lng: 35.35 },
  ],
  'Colombia': [
    { name: 'San Andrés Island', lat: 12.55, lng: -81.71 },
    { name: 'Providencia Island', lat: 13.35, lng: -81.37 },
    { name: 'Malpelo Island', lat: 4.00, lng: -81.60 },
    { name: 'Gorgona Island', lat: 2.96, lng: -78.18 },
    { name: 'Santa Marta & Tayrona Coast (Mainland)', lat: 11.27, lng: -74.19 },
    { name: 'Cartagena & Rosario Islands', lat: 10.18, lng: -75.75 },
    { name: 'Capurganá & Sapzurro (Mainland)', lat: 8.63, lng: -77.34 },
  ],
  'Caribbean Netherlands': [
    { name: 'Bonaire Island', lat: 12.15, lng: -68.28 },
    { name: 'Saba Island', lat: 17.63, lng: -63.24 },
    { name: 'Sint Eustatius Island (Statia)', lat: 17.49, lng: -62.98 },
  ],
  'Cayman Islands': [
    { name: 'Grand Cayman Island', lat: 19.32, lng: -81.25 },
    { name: 'Cayman Brac Island', lat: 19.72, lng: -79.80 },
    { name: 'Little Cayman Island', lat: 19.68, lng: -80.05 },
  ],
  'Fiji': [
    { name: 'Viti Levu & Coral Coast (Mainland)', lat: -18.25, lng: 177.80 },
    { name: 'Beqa Lagoon & Shark Reef', lat: -18.40, lng: 178.10 },
    { name: 'Mamanuca Islands', lat: -17.75, lng: 177.10 },
    { name: 'Yasawa Islands', lat: -16.90, lng: 177.40 },
    { name: 'Taveuni Island (Rainbow Reef)', lat: -16.80, lng: -179.95 },
    { name: 'Kadavu Island (Great Astrolabe Reef)', lat: -18.90, lng: 178.30 },
  ],
  'French Polynesia': [
    { name: 'Tahiti Island', lat: -17.65, lng: -149.45 },
    { name: 'Moorea Island', lat: -17.53, lng: -149.83 },
    { name: 'Bora Bora Island', lat: -16.50, lng: -151.74 },
    { name: 'Rangiroa Atoll', lat: -14.95, lng: -147.70 },
    { name: 'Fakarava Atoll', lat: -16.30, lng: -145.60 },
  ],
  'Costa Rica': [
    { name: 'Cocos Island (Isla del Coco)', lat: 5.53, lng: -87.05 },
    { name: 'Caño Island & Drake Bay', lat: 8.70, lng: -83.88 },
    { name: 'Catalina & Bat Islands', lat: 10.55, lng: -85.75 },
    { name: 'Golfo Dulce & Pacific Coast (Mainland)', lat: 8.50, lng: -83.40 },
  ],
  'Belize': [
    { name: 'Ambergris Caye (San Pedro)', lat: 17.92, lng: -87.96 },
    { name: 'Caye Caulker', lat: 17.74, lng: -88.03 },
    { name: 'Lighthouse Reef & Blue Hole', lat: 17.32, lng: -87.53 },
    { name: 'Turneffe Atoll', lat: 17.30, lng: -87.85 },
    { name: 'Glover’s Reef Atoll', lat: 16.80, lng: -87.80 },
    { name: 'Placencia & South Coast (Mainland)', lat: 16.52, lng: -88.37 },
  ],
  'Japan': [
    { name: 'Okinawa Main Island', lat: 26.40, lng: 127.80 },
    { name: 'Kerama Islands (Zamami & Tokashiki)', lat: 26.23, lng: 127.33 },
    { name: 'Miyako Islands', lat: 24.80, lng: 125.28 },
    { name: 'Ishigaki & Yaeyama Islands (Yonaguni)', lat: 24.40, lng: 124.15 },
    { name: 'Izu Peninsula & Ogasawara Islands', lat: 34.80, lng: 138.90 },
    { name: 'Honshu Mainland Coast', lat: 35.20, lng: 139.50 },
    { name: 'Hokkaido & Shakotan', lat: 43.30, lng: 140.60 },
  ],
  'Tanzania': [
    { name: 'Zanzibar Island (Unguja & Mnemba)', lat: -6.16, lng: 39.20 },
    { name: 'Pemba Island', lat: -5.15, lng: 39.75 },
    { name: 'Mafia Island', lat: -7.90, lng: 39.70 },
    { name: 'Dar es Salaam & Mainland Coast', lat: -6.80, lng: 39.30 },
  ],
  'Cape Verde': [
    { name: 'São Vicente Island', lat: 16.85, lng: -25.00 },
    { name: 'Santo Antão Island', lat: 17.05, lng: -25.15 },
    { name: 'Sal Island', lat: 16.75, lng: -22.90 },
    { name: 'Boa Vista Island', lat: 16.15, lng: -22.85 },
    { name: 'Santiago Island', lat: 15.05, lng: -23.60 },
  ],
  'Ecuador': [
    { name: 'Santa Cruz Island (Galapagos)', lat: -0.65, lng: -90.35 },
    { name: 'San Cristobal Island (Galapagos)', lat: -0.90, lng: -89.60 },
    { name: 'Isabela Island (Galapagos)', lat: -0.75, lng: -91.05 },
    { name: 'Wolf & Darwin Islands (Galapagos)', lat: 1.38, lng: -91.82 },
    { name: 'Ecuador Mainland Coast (Machalilla)', lat: -1.55, lng: -80.81 },
  ],
  'United Kingdom': [
    { name: 'Cornwall & Southwest Coast (Mainland)', lat: 50.20, lng: -5.10 },
    { name: 'Scilly Isles', lat: 49.92, lng: -6.30 },
    { name: 'Devon & Dorset Coast (Mainland)', lat: 50.50, lng: -3.50 },
    { name: 'Scotland Coast & Scapa Flow', lat: 58.90, lng: -3.00 },
    { name: 'Farne Islands & Northeast Coast (Mainland)', lat: 55.62, lng: -1.62 },
    { name: 'Wales Coast & Pembrokeshire (Mainland)', lat: 51.70, lng: -5.10 },
    { name: 'Isle of Man', lat: 54.15, lng: -4.48 },
    { name: 'Isle of Wight', lat: 50.68, lng: -1.30 },
  ],
  'South Africa': [
    { name: 'Aliwal Shoal (Umkomaas)', lat: -30.28, lng: 30.82 },
    { name: 'Protea Banks (Shelly Beach)', lat: -30.84, lng: 30.48 },
    { name: 'Sodwana Bay', lat: -27.54, lng: 32.68 },
    { name: 'False Bay & Cape Town (Mainland)', lat: -34.15, lng: 18.50 },
    { name: 'Mossel Bay & Garden Route (Mainland)', lat: -34.18, lng: 22.14 },
  ],
  'Turkey': [
    { name: 'Bodrum Peninsula (Mainland)', lat: 37.03, lng: 27.43 },
    { name: 'Kas & Kekova Coast (Mainland)', lat: 36.20, lng: 29.64 },
    { name: 'Fethiye & Oludeniz (Mainland)', lat: 36.62, lng: 29.11 },
    { name: 'Marmaris & Datca Coast (Mainland)', lat: 36.85, lng: 28.27 },
    { name: 'Antalya & Kemer Coast (Mainland)', lat: 36.60, lng: 30.55 },
  ],
  'Cyprus': [
    { name: 'Ayia Napa & Cape Greco', lat: 34.98, lng: 34.05 },
    { name: 'Larnaca (Zenobia Wreck)', lat: 34.92, lng: 33.64 },
    { name: 'Paphos & Akamas Peninsula', lat: 34.77, lng: 32.42 },
    { name: 'Limassol Coast', lat: 34.67, lng: 33.04 },
  ],
  'New Zealand': [
    { name: 'Poor Knights Islands', lat: -35.50, lng: 174.74 },
    { name: 'Bay of Islands', lat: -35.25, lng: 174.15 },
    { name: 'Goat Island & Leigh Marine Reserve', lat: -36.27, lng: 174.80 },
    { name: 'Coromandel Peninsula & Mercury Islands', lat: -36.75, lng: 175.75 },
    { name: 'Milford Sound & Fiordland', lat: -44.67, lng: 167.92 },
    { name: 'Wellington & Kapiti Island', lat: -40.85, lng: 174.92 },
  ],
  'Brazil': [
    { name: 'Fernando de Noronha Archipelago', lat: -3.85, lng: -32.42 },
    { name: 'Abrolhos Archipelago', lat: -17.96, lng: -38.70 },
    { name: 'Arraial do Cabo & Rio Coast (Mainland)', lat: -22.97, lng: -42.02 },
    { name: 'Ilhabela & São Paulo Coast (Mainland)', lat: -23.82, lng: -45.35 },
    { name: 'Angra dos Reis & Ilha Grande', lat: -23.15, lng: -44.23 },
    { name: 'Recife & Northeast Coast (Mainland)', lat: -8.05, lng: -34.88 },
  ],
  'Portugal': [
    { name: 'São Miguel Island (Azores)', lat: 37.75, lng: -25.50 },
    { name: 'Santa Maria Island (Azores)', lat: 36.98, lng: -25.10 },
    { name: 'Terceira Island (Azores)', lat: 38.72, lng: -27.22 },
    { name: 'Pico & Faial Islands (Azores)', lat: 38.53, lng: -28.53 },
    { name: 'Madeira Island', lat: 32.65, lng: -16.90 },
    { name: 'Porto Santo Island (Madeira)', lat: 33.06, lng: -16.33 },
    { name: 'Algarve Coast (Mainland)', lat: 37.10, lng: -8.60 },
    { name: 'Berlengas Archipelago (Peniche)', lat: 39.42, lng: -9.51 },
    { name: 'Lisbon & Sesimbra Coast (Mainland)', lat: 38.44, lng: -9.10 },
  ],
  'Croatia': [
    { name: 'Istria & Rovinj Coast (Mainland)', lat: 45.08, lng: 13.64 },
    { name: 'Kvarner Bay (Krk & Cres Islands)', lat: 45.00, lng: 14.50 },
    { name: 'Zadar & Kornati Islands', lat: 43.80, lng: 15.30 },
    { name: 'Split & Brač Island', lat: 43.30, lng: 16.60 },
    { name: 'Hvar & Pakleni Islands', lat: 43.17, lng: 16.44 },
    { name: 'Vis & Biševo Islands', lat: 43.05, lng: 16.18 },
    { name: 'Korčula & Lastovo Islands', lat: 42.95, lng: 16.90 },
    { name: 'Dubrovnik & Elafiti Islands', lat: 42.65, lng: 18.09 },
  ],
  'Vietnam': [
    { name: 'Hon Mun & Nha Trang Bay', lat: 12.18, lng: 109.30 },
    { name: 'Cham Islands (Hoi An / Da Nang)', lat: 15.95, lng: 108.50 },
    { name: 'Phu Quoc Island', lat: 10.23, lng: 103.96 },
    { name: 'Con Dao Archipelago', lat: 8.68, lng: 106.60 },
    { name: 'Whale Island (Van Phong Bay)', lat: 12.65, lng: 109.40 },
  ],
  'Mozambique': [
    { name: 'Bazaruto Archipelago', lat: -21.82, lng: 35.50 },
    { name: 'Tofo & Inhambane Coast', lat: -23.85, lng: 35.55 },
    { name: 'Ponta do Ouro Coast', lat: -26.83, lng: 32.90 },
    { name: 'Nacala & Pemba Coast', lat: -14.20, lng: 40.68 },
  ],
  'Taiwan': [
    { name: 'Green Island (Ludao)', lat: 22.66, lng: 121.49 },
    { name: 'Orchid Island (Lanyu)', lat: 22.05, lng: 121.55 },
    { name: 'Penghu Islands', lat: 23.57, lng: 119.58 },
    { name: 'Xiaoliuqiu (Lambai Island)', lat: 22.34, lng: 120.37 },
    { name: 'Kenting & South Coast (Mainland)', lat: 21.93, lng: 120.74 },
    { name: 'Northeast Coast (Mainland)', lat: 25.11, lng: 121.92 },
  ],
  'China': [
    { name: 'Sanya & Hainan Island', lat: 18.25, lng: 109.60 },
    { name: 'Hong Kong & Sai Kung', lat: 22.36, lng: 114.29 },
    { name: 'Huizhou & Daya Bay', lat: 22.45, lng: 114.90 },
    { name: 'Zhuhai & Wanshan Archipelago', lat: 22.00, lng: 113.75 },
    { name: 'Dalian & Liaoning Coast', lat: 38.95, lng: 121.52 },
  ],
  'South Korea': [
    { name: 'Jeju Island (Seogwipo)', lat: 33.23, lng: 126.55 },
    { name: 'Busan & South Coast (Mainland)', lat: 35.06, lng: 129.08 },
    { name: 'Pohang & East Sea Coast (Mainland)', lat: 36.10, lng: 129.50 },
    { name: 'Gangwon Coast (Mainland)', lat: 38.00, lng: 128.70 },
  ],
  'Kuwait': [
    { name: 'Kubbar Island', lat: 29.07, lng: 48.49 },
    { name: 'Qarooh Island', lat: 28.82, lng: 48.78 },
  ],
  'Jordan': [
    { name: 'Aqaba Marine Park (Red Sea Coast)', lat: 29.45, lng: 34.98 },
  ],
  'Israel': [
    { name: 'Eilat (Red Sea Coast)', lat: 29.50, lng: 34.92 },
    { name: 'Mediterranean Coast', lat: 32.80, lng: 34.98 },
  ],
  'Monaco': [
    { name: 'Monaco Coastal Waters', lat: 43.73, lng: 7.42 },
  ],
  'Gibraltar': [
    { name: 'Gibraltar Bay & Europa Point', lat: 36.12, lng: -5.35 },
  ],
  'Oman': [
    { name: 'Daymaniyat Islands', lat: 23.85, lng: 58.08 },
    { name: 'Musandam Peninsula', lat: 26.20, lng: 56.25 },
    { name: 'Mirbat & Salalah Coast', lat: 16.98, lng: 54.68 },
  ],
  'United Arab Emirates': [
    { name: 'Fujairah & East Coast', lat: 25.50, lng: 56.36 },
    { name: 'Dubai & Arabian Gulf', lat: 25.10, lng: 55.15 },
  ],
  'Saudi Arabia': [
    { name: 'Jeddah & Central Red Sea', lat: 21.50, lng: 39.10 },
    { name: 'Yanbu & North Red Sea', lat: 24.08, lng: 38.05 },
    { name: 'Farasan Islands & South Red Sea', lat: 16.70, lng: 42.10 },
  ],
  'Honduras': [
    { name: 'Roatan Island', lat: 16.32, lng: -86.53 },
    { name: 'Utila Island', lat: 16.10, lng: -86.90 },
    { name: 'Guanaja Island', lat: 16.48, lng: -85.90 },
  ],
  'Bahamas': [
    { name: 'New Providence Island (Nassau)', lat: 25.04, lng: -77.40 },
    { name: 'Grand Bahama Island', lat: 26.52, lng: -78.68 },
    { name: 'Bimini Islands', lat: 25.72, lng: -79.28 },
    { name: 'Exuma Cays', lat: 24.20, lng: -76.50 },
  ],
  'Dominican Republic': [
    { name: 'Bayahibe & Saona Island', lat: 18.25, lng: -68.75 },
    { name: 'Punta Cana & East Coast', lat: 18.60, lng: -68.35 },
    { name: 'Sosúa & North Coast', lat: 19.76, lng: -70.52 },
  ],
  'Jamaica': [
    { name: 'Montego Bay & Negril Coast', lat: 18.40, lng: -78.10 },
    { name: 'Ocho Rios & Port Antonio Coast', lat: 18.40, lng: -77.00 },
  ],
  'Panama': [
    { name: 'Coiba National Park & Pacific Islands', lat: 7.45, lng: -81.75 },
    { name: 'Bocas del Toro Archipelago', lat: 9.35, lng: -82.25 },
    { name: 'San Blas Islands (Guna Yala)', lat: 9.55, lng: -78.80 },
  ],
  'Vanuatu': [
    { name: 'Espiritu Santo Island', lat: -15.50, lng: 167.15 },
    { name: 'Efate Island (Port Vila)', lat: -17.75, lng: 168.30 },
  ],
  'France': [
    { name: 'French Riviera & Côte d’Azur (Mainland)', lat: 43.30, lng: 6.80 },
    { name: 'Corsica Island', lat: 42.00, lng: 9.00 },
  ],
  'Germany': [
    { name: 'Baltic & North Sea Coastal Waters (Mainland)', lat: 54.40, lng: 10.20 },
  ],
  'Netherlands': [
    { name: 'Zeeland & North Sea Coastal Waters', lat: 51.65, lng: 3.90 },
  ],
  'Denmark': [
    { name: 'Kattegat & Baltic Coastal Waters', lat: 55.70, lng: 11.50 },
  ],
  'Sweden': [
    { name: 'Bohuslän & West Coast', lat: 58.30, lng: 11.40 },
    { name: 'Baltic Sea Waters', lat: 59.30, lng: 18.80 },
  ],
  'Norway': [
    { name: 'Lofoten Islands & Norwegian Coast', lat: 68.20, lng: 14.00 },
  ],
  'Canada': [
    { name: 'Vancouver Island & BC Coast', lat: 49.30, lng: -124.00 },
    { name: 'Atlantic Coast (Mainland)', lat: 45.00, lng: -63.50 },
  ],
  'Chile': [
    { name: 'Easter Island (Rapa Nui)', lat: -27.12, lng: -109.35 },
    { name: 'Chilean Pacific Coast (Mainland)', lat: -33.00, lng: -71.60 },
  ],
  'Peru': [
    { name: 'Paracas & Pacific Coast (Mainland)', lat: -13.85, lng: -76.30 },
  ],
  'U.S. Virgin Islands': [
    { name: 'St. Thomas Island', lat: 18.34, lng: -64.93 },
    { name: 'St. John Island', lat: 18.33, lng: -64.73 },
    { name: 'St. Croix Island', lat: 17.74, lng: -64.78 },
  ],
  'British Virgin Islands': [
    { name: 'Tortola Island', lat: 18.43, lng: -64.62 },
    { name: 'Virgin Gorda Island', lat: 18.48, lng: -64.40 },
    { name: 'Jost Van Dyke Island', lat: 18.45, lng: -64.75 },
  ],
  'Trinidad and Tobago': [
    { name: 'Tobago Island', lat: 11.25, lng: -60.67 },
    { name: 'Trinidad Island', lat: 10.65, lng: -61.50 },
  ],
  'Saint Kitts & Nevis': [
    { name: 'Saint Kitts Island', lat: 17.30, lng: -62.75 },
    { name: 'Nevis Island', lat: 17.15, lng: -62.58 },
  ],
  'The Guadeloupe Islands': [
    { name: 'Basse-Terre (Cousteau Reserve)', lat: 16.15, lng: -61.75 },
    { name: 'Grande-Terre', lat: 16.25, lng: -61.40 },
    { name: 'Les Saintes Islands', lat: 15.86, lng: -61.58 },
  ],
  'Republic of Mauritius': [
    { name: 'Mauritius Island', lat: -20.25, lng: 57.55 },
    { name: 'Rodrigues Island', lat: -19.72, lng: 63.42 },
  ],
  'Seychelles': [
    { name: 'Mahé Island', lat: -4.68, lng: 55.48 },
    { name: 'Praslin & La Digue Islands', lat: -4.33, lng: 55.76 },
  ],
  'Federated States of Micronesia': [
    { name: 'Chuuk Lagoon (Truk Lagoon)', lat: 7.42, lng: 151.78 },
    { name: 'Yap Island', lat: 9.53, lng: 138.12 },
    { name: 'Pohnpei Island', lat: 6.88, lng: 158.22 },
  ],
  'Northern Mariana Islands': [
    { name: 'Saipan Island (The Grotto)', lat: 15.22, lng: 145.75 },
    { name: 'Rota Island', lat: 14.15, lng: 145.20 },
  ],
}

// Single-island nations or territories that are a single cohesive island
const SINGLE_ISLAND_TERRITORIES = {
  'Aruba': 'Aruba Island',
  'Curaçao': 'Curaçao Island',
  'Curaao': 'Curaçao Island',
  'Barbados': 'Barbados Island',
  'Bermuda': 'Bermuda Islands',
  'Bonaire': 'Bonaire Island',
  'Guam': 'Guam Island',
  'Montserrat': 'Montserrat Island',
  'Dominica': 'Dominica Island',
  'Anguilla': 'Anguilla Island',
  'Saint Lucia': 'Saint Lucia Island',
  'Niue': 'Niue Island',
  'Palau': 'Palau (Rock Islands & Koror)',
  'Réunion': 'Réunion Island',
  'Runion': 'Réunion Island',
  'Saint Vincent & the Grenadines': 'Saint Vincent & the Grenadines',
  'Grenada': 'Grenada Island',
  'Sint Maarten': 'Sint Maarten Island',
  'Timor Leste (East Timor)': 'Timor-Leste & Atauro Island',
}

/**
 * Resolves the clean, authentic island or mainland region for a given dive site.
 */
export function getIslandForSite(site) {
  if (!site) return 'Mainland / Coastal Region'
  const country = (site.country || '').trim()
  const lat = parseFloat(site.latitude)
  const lng = parseFloat(site.longitude)
  const siteName = (site.siteName || '').trim()
  const lowerName = siteName.toLowerCase()

  // 1. Direct high-profile island matches based on site name / ID
  if (country.toLowerCase() === 'philippines') {
    const numId = Number(site.id)
    if (lowerName.includes('apo island') || lowerName.includes('apo reef') || numId === 19886 || (numId >= 27001 && numId <= 27008)) {
      return 'Apo Island'
    }
    if (lowerName.includes('malapascua') || lowerName.includes('monad shoal') || lowerName.includes('gato island') || lowerName.includes('kalanggaman')) {
      return 'Malapascua Island'
    }
    if (lowerName.includes('panglao') || lowerName.includes('alona') || lowerName.includes('balicasag')) {
      return 'Panglao Island'
    }
    if (lowerName.includes('cabilao')) {
      return 'Cabilao Island'
    }
    if (lowerName.includes('siquijor') || lowerName.includes('paliton') || lowerName.includes('tubod')) {
      return 'Siquijor Island'
    }
    if (lowerName.includes('sumilon')) {
      return 'Sumilon Island'
    }
    if (lowerName.includes('boracay')) {
      return 'Boracay Island'
    }
    if (lowerName.includes('siargao')) {
      return 'Siargao Island'
    }
    if (lowerName.includes('dauin')) {
      return 'Negros Island (Dauin & Dumaguete Coast)'
    }
    if (lowerName.includes('coron')) {
      return 'Coron Island'
    }
    if (lowerName.includes('busuanga')) {
      return 'Busuanga Island'
    }
  }

  if (country.toLowerCase() === 'indonesia') {
    if (lowerName.includes('lembongan') || lowerName.includes('ceningan')) {
      return 'Nusa Lembongan & Ceningan'
    }
    if (lowerName.includes('nusa penida') || lowerName.includes('manta point') || lowerName.includes('crystal bay')) {
      return 'Nusa Penida'
    }
    if (lowerName.includes('gili trawangan') || lowerName.includes('gili air') || lowerName.includes('gili meno') || lowerName.includes('gili island')) {
      return 'Gili Islands (Trawangan, Meno, Air)'
    }
    if (lowerName.includes('bunaken') || lowerName.includes('siladen')) {
      return 'Bunaken Island & Siladen'
    }
    if (lowerName.includes('derawan')) {
      return 'Derawan Island'
    }
    if (lowerName.includes('sangkat') || lowerName.includes('sangalaki') || lowerName.includes('maratua') || lowerName.includes('kakaban')) {
      return 'Sangalaki & Maratua Islands'
    }
  }

  if (country.toLowerCase() === 'thailand') {
    if (lowerName.includes('koh tao') || lowerName.includes('sail rock') || lowerName.includes('chumphon pinnacle')) {
      return 'Koh Tao Island'
    }
    if (lowerName.includes('samui')) {
      return 'Koh Samui Island'
    }
    if (lowerName.includes('phangan')) {
      return 'Koh Phangan Island'
    }
    if (lowerName.includes('phi phi') || lowerName.includes('bida nok') || lowerName.includes('bida nai')) {
      return 'Phi Phi Islands'
    }
    if (lowerName.includes('racha yai') || lowerName.includes('racha noi') || lowerName.includes('raya island')) {
      return 'Racha Islands (Racha Yai & Noi)'
    }
    if (lowerName.includes('similan')) {
      return 'Similan Islands'
    }
    if (lowerName.includes('surin') || lowerName.includes('richelieu rock')) {
      return 'Surin Islands'
    }
    if (lowerName.includes('lanta')) {
      return 'Koh Lanta Island'
    }
    if (lowerName.includes('hin daeng') || lowerName.includes('hin muang')) {
      return 'Hin Daeng & Hin Muang'
    }
    if (lowerName.includes('koh chang')) {
      return 'Koh Chang Island & Trat'
    }
  }

  if (country.toLowerCase() === 'malta') {
    if (lowerName.includes('comino') || lowerName.includes('blue lagoon') || lowerName.includes('crystal lagoon') || lowerName.includes('santa marija') || lowerName.includes('p31')) {
      return 'Comino Island (Blue Lagoon)'
    }
    if (lowerName.includes('gozo') || lowerName.includes('dwejra') || lowerName.includes('azure window') || lowerName.includes('inland sea') || lowerName.includes('billinghurst') || lowerName.includes('cathedral cave')) {
      return 'Gozo Island'
    }
    if (lat >= 36.02 && lng < 14.31) {
      return 'Gozo Island'
    }
    if (lat >= 36.00 && lat < 36.03 && lng >= 14.31 && lng <= 14.36) {
      return 'Comino Island (Blue Lagoon)'
    }
    return 'Malta Island (Valletta & Cirkewwa)'
  }

  if (country.toLowerCase() === 'india') {
    if (lowerName.includes('havelock') || lowerName.includes('swaraj')) {
      return 'Havelock Island (Swaraj Dweep)'
    }
    if (lowerName.includes('neil') || lowerName.includes('shaheed')) {
      return 'Neil Island (Shaheed Dweep)'
    }
    if (lowerName.includes('port blair') || (lat > 11.0 && lat < 12.5 && lng > 92.5 && lng < 93.5)) {
      if (lng > 92.96 && lat > 11.93) return 'Havelock Island (Swaraj Dweep)'
      if (lng > 92.98 && lat <= 11.93) return 'Neil Island (Shaheed Dweep)'
      return 'Port Blair & South Andaman'
    }
    if (lowerName.includes('grande island') || lowerName.includes('sao jorge')) {
      return 'Grande Island (Goa)'
    }
    if (lowerName.includes('netrani')) {
      return 'Netrani Island (Karnataka)'
    }
  }

  if (country.toLowerCase() === 'kuwait') {
    if (lowerName.includes('qarooh') || lowerName.includes('qarouh')) return 'Qarooh Island'
    return 'Kubbar Island'
  }

  if (country.toLowerCase() === 'spain') {
    if (lowerName.includes('formentera')) return 'Formentera Island (Balearic Islands)'
    if (lowerName.includes('ibiza')) return 'Ibiza Island (Balearic Islands)'
    if (lowerName.includes('menorca')) return 'Menorca Island (Balearic Islands)'
    if (lowerName.includes('mallorca') || lowerName.includes('majorca')) return 'Mallorca Island (Balearic Islands)'
    if (lowerName.includes('el hierro') || lowerName.includes('la restinga')) return 'El Hierro Island (Canary Islands)'
    if (lowerName.includes('la palma')) return 'La Palma Island (Canary Islands)'
    if (lowerName.includes('la gomera')) return 'La Gomera Island (Canary Islands)'
    if (lowerName.includes('medes') || lowerName.includes('illes medes')) return 'Medes Islands'
  }

  // 2. Single-island territory check
  const singleKey = Object.keys(SINGLE_ISLAND_TERRITORIES).find(
    (k) => k.toLowerCase() === country.toLowerCase()
  )
  if (singleKey) {
    return SINGLE_ISLAND_TERRITORIES[singleKey]
  }

  // 3. Find closest authentic island or regional hub
  const countryKey = Object.keys(POPULAR_ISLAND_REGIONS).find(
    (k) => k.toLowerCase() === country.toLowerCase()
  )
  const hubs = countryKey ? POPULAR_ISLAND_REGIONS[countryKey] : null

  if (hubs && hubs.length > 0 && !isNaN(lat) && !isNaN(lng)) {
    let bestHub = hubs[0].name
    let minDistance = Infinity

    for (const hub of hubs) {
      const dLat = lat - hub.lat
      const dLng = lng - hub.lng
      const distance = Math.hypot(dLat, dLng)
      if (distance < minDistance) {
        minDistance = distance
        bestHub = hub.name
      }
    }
    return bestHub
  }

  // 4. Safe fallback for other countries
  return `${country} Mainland & Coastal Waters`
}

/**
 * Returns a sorted array of unique islands / regions for a country with their site counts.
 */
export function getIslandsForCountry(country, allSites = []) {
  if (!country) return []
  const sitesInCountry = allSites.filter(
    (s) => s.country && s.country.toLowerCase() === country.toLowerCase()
  )
  if (sitesInCountry.length === 0) return []

  const islandMap = new Map()
  sitesInCountry.forEach((site) => {
    const island = getIslandForSite(site)
    islandMap.set(island, (islandMap.get(island) || 0) + 1)
  })

  return Array.from(islandMap.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by most sites first
    .map(([island, count]) => ({
      name: island,
      count,
    }))
}

/**
 * Returns all dive site objects for a selected country and island.
 */
export function getSitesForIsland(country, island, allSites = []) {
  if (!country) return []
  const sitesInCountry = allSites.filter(
    (s) => s.country && s.country.toLowerCase() === country.toLowerCase()
  )
  if (!island) return sitesInCountry

  return sitesInCountry.filter((s) => getIslandForSite(s) === island)
}

/**
 * Computes geographic centroid, site count, and camera framing bounds for each island in a country.
 * Essential for the 3-Tier Map Navigation (Country View -> Islands display).
 */
export function getIslandCentroidsForCountry(country, allSites = []) {
  if (!country) return []
  const sitesInCountry = allSites.filter(
    (s) => s.country && s.country.toLowerCase() === country.toLowerCase()
  )
  if (sitesInCountry.length === 0) return []

  const groups = new Map()
  sitesInCountry.forEach((site) => {
    const island = getIslandForSite(site)
    if (!groups.has(island)) {
      groups.set(island, [])
    }
    groups.get(island).push(site)
  })

  const results = []
  for (const [islandName, sList] of groups.entries()) {
    let sumLat = 0
    let sumLng = 0
    let minLat = Infinity, maxLat = -Infinity
    let minLng = Infinity, maxLng = -Infinity
    let validCount = 0

    sList.forEach((s) => {
      const lat = parseFloat(s.latitude)
      const lng = parseFloat(s.longitude)
      if (!isNaN(lat) && !isNaN(lng)) {
        sumLat += lat
        sumLng += lng
        validCount++
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
      }
    })

    if (validCount > 0) {
      results.push({
        name: islandName,
        country: sitesInCountry[0].country,
        count: sList.length,
        latitude: sumLat / validCount,
        longitude: sumLng / validCount,
        bounds: [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
      })
    }
  }

  // Sort by highest dive site count first
  return results.sort((a, b) => b.count - a.count)
}
