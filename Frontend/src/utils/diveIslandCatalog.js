/**
 * Dive Island & Regional Hubs Catalog
 * 
 * Maps verified dive sites across worldwide destinations into authentic,
 * confirmed individual islands, atolls, and mainland coastal regions.
 * 
 * Rules:
 * - Every island is a confirmed geographical island or atoll.
 * - Merged islands are separated into individual islands.
 * - Dive sites are strictly dive sites, never mistakenly parsed as islands.
 * - Mainland coastal areas are designated as "Mainland" (or country name).
 */

export const CONFIRMED_ISLAND_HUBS = {
  'Philippines': [
    { name: 'Malapascua Island', lat: 11.33, lng: 124.11 },
    { name: 'Cebu Island', lat: 9.95, lng: 123.4 },
    { name: 'Sumilon Island', lat: 9.43, lng: 123.38 },
    { name: 'Panglao Island', lat: 9.58, lng: 123.77 },
    { name: 'Cabilao Island', lat: 9.88, lng: 123.78 },
    { name: 'Bohol Island', lat: 9.75, lng: 124.2 },
    { name: 'Apo Island', lat: 9.08, lng: 123.27 },
    { name: 'Negros Island', lat: 9.25, lng: 123.25 },
    { name: 'Siquijor Island', lat: 9.18, lng: 123.58 },
    { name: 'Boracay Island', lat: 11.97, lng: 121.92 },
    { name: 'Coron Island', lat: 11.95, lng: 120.25 },
    { name: 'Busuanga Island', lat: 12.15, lng: 119.95 },
    { name: 'Palawan Island', lat: 10.0, lng: 118.8 },
    { name: 'Mindoro Island', lat: 13.4, lng: 121.1 },
    { name: 'Siargao Island', lat: 9.85, lng: 126.05 },
    { name: 'Camiguin Island', lat: 9.17, lng: 124.72 },
    { name: 'Samal Island', lat: 7.05, lng: 125.72 },
    { name: 'Leyte Island', lat: 10.2, lng: 125.0 },
    { name: 'Romblon Island', lat: 12.55, lng: 122.28 },
    { name: 'Tablas Island', lat: 12.35, lng: 122.0 },
    { name: 'Tubbataha Reefs', lat: 8.9, lng: 119.9 },
    { name: 'Mainland', lat: 14.2, lng: 120.8, isMainland: true }, // Luzon (Anilao, Batangas, Subic Bay)
  ],
  'Indonesia': [
    { name: 'Bali Island', lat: -8.35, lng: 115.45 },
    { name: 'Nusa Penida Island', lat: -8.73, lng: 115.54 },
    { name: 'Nusa Lembongan Island', lat: -8.68, lng: 115.45 },
    { name: 'Gili Islands', lat: -8.35, lng: 116.04 },
    { name: 'Lombok Island', lat: -8.65, lng: 116.25 },
    { name: 'Komodo Island', lat: -8.6, lng: 119.55 },
    { name: 'Flores Island', lat: -8.5, lng: 120.0 },
    { name: 'Raja Ampat', lat: -0.5, lng: 130.5 },
    { name: 'Bunaken Island', lat: 1.62, lng: 124.76 },
    { name: 'Siladen Island', lat: 1.63, lng: 124.8 },
    { name: 'Lembeh Strait', lat: 1.45, lng: 125.23 },
    { name: 'Alor Archipelago', lat: -8.25, lng: 124.4 },
    { name: 'Banda Islands', lat: -4.52, lng: 129.9 },
    { name: 'Wakatobi', lat: -5.3, lng: 123.6 },
    { name: 'Derawan Island', lat: 2.28, lng: 118.24 },
    { name: 'Sangalaki Island', lat: 2.08, lng: 118.4 },
    { name: 'Kakaban Island', lat: 2.15, lng: 118.53 },
    { name: 'Pulau Weh', lat: 5.85, lng: 95.3 },
    { name: 'Thousand Islands (Kepulauan Seribu)', lat: -5.6, lng: 106.55 },
    { name: 'Mainland', lat: -7.0, lng: 110.0, isMainland: true },
  ],
  'Thailand': [
    { name: 'Koh Tao Island', lat: 10.1, lng: 99.83 },
    { name: 'Koh Phangan Island', lat: 9.75, lng: 100.0 },
    { name: 'Koh Samui Island', lat: 9.53, lng: 100.0 },
    { name: 'Phuket Island', lat: 7.95, lng: 98.35 },
    { name: 'Racha Islands', lat: 7.55, lng: 98.32 },
    { name: 'Koh Phi Phi Islands', lat: 7.74, lng: 98.77 },
    { name: 'Koh Lanta Island', lat: 7.55, lng: 99.05 },
    { name: 'Similan Islands', lat: 8.65, lng: 97.65 },
    { name: 'Surin Islands', lat: 9.42, lng: 97.87 },
    { name: 'Koh Chang Island', lat: 12.0, lng: 102.35 },
    { name: 'Koh Kood Island', lat: 11.65, lng: 102.55 },
    { name: 'Koh Larn Island', lat: 12.92, lng: 100.78 },
    { name: 'Mainland', lat: 12.93, lng: 100.88, isMainland: true }, // Pattaya, Krabi, Chumphon, Rayong
  ],
  'Maldives': [
    { name: 'North Malé Atoll', lat: 4.4, lng: 73.5 },
    { name: 'South Malé Atoll', lat: 3.95, lng: 73.45 },
    { name: 'North Ari Atoll', lat: 4.0, lng: 72.85 },
    { name: 'South Ari Atoll', lat: 3.6, lng: 72.85 },
    { name: 'Baa Atoll', lat: 5.15, lng: 73.05 },
    { name: 'Rasdhoo Atoll', lat: 4.26, lng: 72.99 },
    { name: 'Vaavu Atoll', lat: 3.55, lng: 73.55 },
    { name: 'Lhaviyani Atoll', lat: 5.4, lng: 73.5 },
    { name: 'Raa Atoll', lat: 5.65, lng: 72.95 },
    { name: 'Noonu Atoll', lat: 5.85, lng: 73.3 },
    { name: 'Dhaalu Atoll', lat: 2.85, lng: 72.95 },
    { name: 'Faafu Atoll', lat: 3.15, lng: 72.95 },
    { name: 'Meemu Atoll', lat: 2.95, lng: 73.5 },
    { name: 'Thaa Atoll', lat: 2.35, lng: 73.15 },
    { name: 'Fuvahmulah Island', lat: -0.3, lng: 73.42 },
    { name: 'Addu Atoll', lat: -0.63, lng: 73.15 },
  ],
  'Spain': [
    // Canary Islands
    { name: 'Tenerife Island', lat: 28.25, lng: -16.6 },
    { name: 'Gran Canaria Island', lat: 27.95, lng: -15.6 },
    { name: 'Lanzarote Island', lat: 29.0, lng: -13.65 },
    { name: 'Fuerteventura Island', lat: 28.35, lng: -14.05 },
    { name: 'La Palma Island', lat: 28.65, lng: -17.85 },
    { name: 'El Hierro Island', lat: 27.75, lng: -18.02 },
    { name: 'La Gomera Island', lat: 28.1, lng: -17.25 },
    // Balearic Islands
    { name: 'Mallorca Island', lat: 39.6, lng: 2.9 },
    { name: 'Menorca Island', lat: 40.0, lng: 4.0 },
    { name: 'Ibiza Island', lat: 38.98, lng: 1.4 },
    { name: 'Formentera Island', lat: 38.7, lng: 1.45 },
    // Coastal Islands
    { name: 'Medes Islands', lat: 42.05, lng: 3.22 },
    { name: 'Tabarca Island', lat: 38.16, lng: -0.47 },
    // Mainland
    { name: 'Mainland', lat: 37.6, lng: -0.7, isMainland: true }, // Costa Brava, Costa Blanca, Cabo de Palos, etc.
  ],
  'Italy': [
    { name: 'Sardinia Island', lat: 40.1, lng: 9.1 },
    { name: 'Sicily Island', lat: 37.6, lng: 14.1 },
    { name: 'Elba Island', lat: 42.78, lng: 10.28 },
    { name: 'Capri Island', lat: 40.55, lng: 14.24 },
    { name: 'Ischia Island', lat: 40.73, lng: 13.9 },
    { name: 'Giglio Island', lat: 42.36, lng: 10.9 },
    { name: 'San Pietro Island', lat: 39.14, lng: 8.28 },
    { name: 'Tremiti Islands', lat: 42.12, lng: 15.5 },
    { name: 'Mainland', lat: 44.3, lng: 9.2, isMainland: true }, // Liguria, Portofino, Naples, Tuscany, Calabria, Puglia
  ],
  'Greece': [
    { name: 'Crete Island', lat: 35.3, lng: 24.8 },
    { name: 'Santorini Island', lat: 36.39, lng: 25.46 },
    { name: 'Mykonos Island', lat: 37.45, lng: 25.35 },
    { name: 'Paros Island', lat: 37.08, lng: 25.15 },
    { name: 'Naxos Island', lat: 37.05, lng: 25.45 },
    { name: 'Ios Island', lat: 36.72, lng: 25.32 },
    { name: 'Milos Island', lat: 36.68, lng: 24.43 },
    { name: 'Rhodes Island', lat: 36.2, lng: 27.95 },
    { name: 'Kos Island', lat: 36.85, lng: 27.15 },
    { name: 'Corfu Island', lat: 39.6, lng: 19.85 },
    { name: 'Zakynthos Island', lat: 37.78, lng: 20.75 },
    { name: 'Kefalonia Island', lat: 38.2, lng: 20.55 },
    { name: 'Lefkada Island', lat: 38.7, lng: 20.65 },
    { name: 'Thassos Island', lat: 40.68, lng: 24.65 },
    { name: 'Mainland', lat: 38.0, lng: 23.5, isMainland: true },
  ],
  'Malta': [
    { name: 'Malta Island', lat: 35.88, lng: 14.43 },
    { name: 'Gozo Island', lat: 36.05, lng: 14.25 },
    { name: 'Comino Island', lat: 36.012, lng: 14.336 },
  ],
  'Malaysia': [
    { name: 'Sipadan Island', lat: 4.11, lng: 118.63 },
    { name: 'Mabul Island', lat: 4.25, lng: 118.63 },
    { name: 'Kapalai Island', lat: 4.23, lng: 118.68 },
    { name: 'Mataking & Pom Pom Islands', lat: 4.6, lng: 118.86 },
    { name: 'Tioman Island', lat: 2.8, lng: 104.15 },
    { name: 'Perhentian Islands', lat: 5.9, lng: 102.75 },
    { name: 'Redang Island', lat: 5.77, lng: 103.0 },
    { name: 'Langkawi Island', lat: 6.35, lng: 99.8 },
    { name: 'Layang Layang Atoll', lat: 7.37, lng: 113.84 },
    { name: 'Kapas Island', lat: 5.22, lng: 103.26 },
    { name: 'Tenggol Island', lat: 4.8, lng: 103.68 },
    { name: 'Gaya & Sapi Islands', lat: 5.98, lng: 116.02 },
    { name: 'Mainland', lat: 3.5, lng: 102.0, isMainland: true },
  ],
  'Mexico': [
    { name: 'Cozumel Island', lat: 20.45, lng: -86.95 },
    { name: 'Isla Mujeres', lat: 21.23, lng: -86.73 },
    { name: 'Socorro Island (Revillagigedo)', lat: 18.78, lng: -110.95 },
    { name: 'Isla Espiritu Santo', lat: 24.5, lng: -110.35 },
    { name: 'Mainland', lat: 20.6, lng: -87.05, isMainland: true }, // Riviera Maya, Cancun, Playa del Carmen, Cabo, La Paz
  ],
  'Egypt': [
    { name: 'Giftun Islands', lat: 27.24, lng: 33.95 },
    { name: 'Tiran Island', lat: 27.95, lng: 34.55 },
    { name: 'Brother Islands', lat: 26.3, lng: 34.85 },
    { name: 'Mainland', lat: 27.5, lng: 34.0, isMainland: true }, // Sharm El Sheikh, Dahab, Hurghada, Marsa Alam
  ],
  'Australia': [
    { name: 'Whitsunday Islands', lat: -20.25, lng: 148.95 },
    { name: 'Lord Howe Island', lat: -31.55, lng: 159.08 },
    { name: 'Rottnest Island', lat: -32.0, lng: 115.5 },
    { name: 'Moreton Island', lat: -27.2, lng: 153.4 },
    { name: 'Rowley Shoals', lat: -17.3, lng: 119.3 },
    { name: 'Heron Island & Southern GBR', lat: -23.44, lng: 151.91 },
    { name: 'Lizard Island', lat: -14.66, lng: 145.46 },
    { name: 'Mainland', lat: -16.8, lng: 145.8, isMainland: true }, // Queensland / GBR Coast, Ningaloo, NSW, Victoria
  ],
  'United States of America (USA)': [
    { name: 'Oahu Island', lat: 21.45, lng: -157.95 },
    { name: 'Maui Island', lat: 20.8, lng: -156.35 },
    { name: 'Hawaii Island (Big Island)', lat: 19.6, lng: -155.5 },
    { name: 'Kauai Island', lat: 22.05, lng: -159.5 },
    { name: 'Key Largo', lat: 25.08, lng: -80.44 },
    { name: 'Islamorada', lat: 24.92, lng: -80.63 },
    { name: 'Marathon', lat: 24.71, lng: -81.04 },
    { name: 'Key West', lat: 24.55, lng: -81.78 },
    { name: 'Santa Catalina Island', lat: 33.38, lng: -118.42 },
    { name: 'Santa Cruz & Channel Islands', lat: 34.0, lng: -119.7 },
    { name: 'Mainland', lat: 33.0, lng: -117.3, isMainland: true }, // California, Florida, North Carolina, Washington
  ],
  'United States Of America (USA)': [
    { name: 'Oahu Island', lat: 21.45, lng: -157.95 },
    { name: 'Maui Island', lat: 20.8, lng: -156.35 },
    { name: 'Hawaii Island (Big Island)', lat: 19.6, lng: -155.5 },
    { name: 'Kauai Island', lat: 22.05, lng: -159.5 },
    { name: 'Key Largo', lat: 25.08, lng: -80.44 },
    { name: 'Islamorada', lat: 24.92, lng: -80.63 },
    { name: 'Marathon', lat: 24.71, lng: -81.04 },
    { name: 'Key West', lat: 24.55, lng: -81.78 },
    { name: 'Santa Catalina Island', lat: 33.38, lng: -118.42 },
    { name: 'Santa Cruz & Channel Islands', lat: 34.0, lng: -119.7 },
    { name: 'Mainland', lat: 33.0, lng: -117.3, isMainland: true },
  ],
  'India': [
    { name: 'Havelock Island', lat: 12.0, lng: 92.98 },
    { name: 'Neil Island', lat: 11.83, lng: 93.05 },
    { name: 'South Andaman Island', lat: 11.6, lng: 92.73 },
    { name: 'Lakshadweep', lat: 10.7, lng: 72.4 },
    { name: 'Grande Island', lat: 15.35, lng: 73.77 },
    { name: 'Netrani Island', lat: 14.01, lng: 74.32 },
    { name: 'Mainland', lat: 10.0, lng: 78.0, isMainland: true }, // Kovalam, Pondicherry, Goa Mainland
  ],
  'Sri Lanka': [
    { name: 'Pigeon Island', lat: 8.72, lng: 81.2 },
    { name: 'Mainland', lat: 6.5, lng: 80.2, isMainland: true }, // Trincomalee, Mirissa, Weligama, Hikkaduwa, Galle
  ],
  'South Africa': [
    { name: 'Mainland', lat: -32.0, lng: 25.0, isMainland: true }, // False Bay, Sodwana Bay, Aliwal Shoal, Protea Banks
  ],
  'Croatia': [
    { name: 'Hvar Island', lat: 43.15, lng: 16.7 },
    { name: 'Brač Island', lat: 43.3, lng: 16.65 },
    { name: 'Vis Island', lat: 43.05, lng: 16.15 },
    { name: 'Korčula Island', lat: 42.95, lng: 16.9 },
    { name: 'Krk Island', lat: 45.05, lng: 14.6 },
    { name: 'Cres Island', lat: 44.95, lng: 14.4 },
    { name: 'Lošinj Island', lat: 44.53, lng: 14.47 },
    { name: 'Rab Island', lat: 44.75, lng: 14.75 },
    { name: 'Dugi Otok', lat: 44.0, lng: 15.0 },
    { name: 'Mainland', lat: 43.5, lng: 16.4, isMainland: true }, // Dubrovnik, Split, Makarska, Istria / Pula
  ],
  'Colombia': [
    { name: 'San Andrés Island', lat: 12.55, lng: -81.7 },
    { name: 'Providencia Island', lat: 13.35, lng: -81.38 },
    { name: 'Malpelo Island', lat: 4.0, lng: -81.6 },
    { name: 'Gorgona Island', lat: 2.96, lng: -78.18 },
    { name: 'Mainland', lat: 11.27, lng: -74.19, isMainland: true }, // Taganga, Santa Marta, Tayrona, Capurganá
  ],
  'Vietnam': [
    { name: 'Hon Mun Island', lat: 12.17, lng: 109.3 },
    { name: 'Cham Islands', lat: 15.95, lng: 108.5 },
    { name: 'Con Dao Island', lat: 8.68, lng: 106.6 },
    { name: 'Phu Quoc Island', lat: 10.23, lng: 103.96 },
    { name: 'Whale Island', lat: 12.65, lng: 109.4 },
    { name: 'Mainland', lat: 12.25, lng: 109.2, isMainland: true },
  ],
  'Japan': [
    { name: 'Okinawa Island', lat: 26.4, lng: 127.8 },
    { name: 'Kerama Islands', lat: 26.23, lng: 127.33 },
    { name: 'Ishigaki Island', lat: 24.4, lng: 124.18 },
    { name: 'Miyako Island', lat: 24.8, lng: 125.28 },
    { name: 'Hokkaido Island', lat: 43.3, lng: 140.6 },
    { name: 'Mainland', lat: 35.0, lng: 139.0, isMainland: true }, // Izu Peninsula, Tokyo Bay, Chiba, Wakayama, Fukuoka
  ],
  'South Korea': [
    { name: 'Jeju Island', lat: 33.23, lng: 126.55 },
    { name: 'Mainland', lat: 36.0, lng: 129.0, isMainland: true }, // Busan, Gangwon, Pohang
  ],
  'Taiwan': [
    { name: 'Green Island (Ludao)', lat: 22.66, lng: 121.49 },
    { name: 'Orchid Island (Lanyu)', lat: 22.05, lng: 121.55 },
    { name: 'Penghu Islands', lat: 23.57, lng: 119.58 },
    { name: 'Xiaoliuqiu Island', lat: 22.34, lng: 120.37 },
    { name: 'Mainland', lat: 23.5, lng: 121.0, isMainland: true }, // Kenting, Longdong / Northeast Coast
  ],
  'Fiji': [
    { name: 'Taveuni Island', lat: -16.8, lng: -179.95 },
    { name: 'Beqa Island', lat: -18.4, lng: 178.1 },
    { name: 'Kadavu Island', lat: -18.9, lng: 178.3 },
    { name: 'Mamanuca Islands', lat: -17.7, lng: 177.1 },
    { name: 'Viti Levu (Mainland)', lat: -17.8, lng: 178.0, isMainland: true },
  ],
  'Belize': [
    { name: 'Ambergris Caye', lat: 17.9, lng: -87.95 },
    { name: 'Turneffe Atoll', lat: 17.3, lng: -87.85 },
    { name: 'Lighthouse Reef Atoll', lat: 17.3, lng: -87.55 },
    { name: 'Glover\'s Reef Atoll', lat: 16.8, lng: -87.8 },
    { name: 'Mainland', lat: 16.8, lng: -88.3, isMainland: true },
  ],
  'Costa Rica': [
    { name: 'Cocos Island', lat: 5.53, lng: -87.05 },
    { name: 'Caño Island', lat: 8.7, lng: -83.88 },
    { name: 'Catalina Islands', lat: 10.48, lng: -85.86 },
    { name: 'Bat Islands', lat: 10.85, lng: -85.95 },
    { name: 'Mainland', lat: 9.5, lng: -84.0, isMainland: true }, // Guanacaste, Drake Bay, Golfo Dulce
  ],
  'Cape Verde': [
    { name: 'São Vicente Island', lat: 16.85, lng: -25.0 },
    { name: 'Sal Island', lat: 16.75, lng: -22.9 },
    { name: 'Boa Vista Island', lat: 16.15, lng: -22.85 },
    { name: 'Santo Antão Island', lat: 17.05, lng: -25.15 },
    { name: 'Santiago Island', lat: 15.05, lng: -23.6 },
  ],
  'Mozambique': [
    { name: 'Bazaruto Island', lat: -21.65, lng: 35.45 },
    { name: 'Benguerra Island', lat: -21.85, lng: 35.43 },
    { name: 'Inhaca Island', lat: -26.0, lng: 32.95 },
    { name: 'Mainland', lat: -23.85, lng: 35.55, isMainland: true }, // Tofo, Inhambane, Ponta do Ouro, Nacala, Pemba
  ],
  'Portugal': [
    { name: 'São Miguel Island', lat: 37.75, lng: -25.5 },
    { name: 'Santa Maria Island', lat: 36.98, lng: -25.1 },
    { name: 'Terceira Island', lat: 38.7, lng: -27.2 },
    { name: 'Pico Island', lat: 38.45, lng: -28.3 },
    { name: 'Faial Island', lat: 38.58, lng: -28.7 },
    { name: 'Madeira Island', lat: 32.75, lng: -16.95 },
    { name: 'Porto Santo Island', lat: 33.07, lng: -16.33 },
    { name: 'Berlengas Islands', lat: 39.42, lng: -9.51 },
    { name: 'Mainland', lat: 39.0, lng: -8.5, isMainland: true }, // Algarve, Cascais, Sesimbra, Peniche, Porto
  ],
  'United Kingdom': [
    { name: 'Isle of Wight', lat: 50.68, lng: -1.3 },
    { name: 'Isles of Scilly', lat: 49.92, lng: -6.32 },
    { name: 'Skomer Island', lat: 51.74, lng: -5.3 },
    { name: 'Orkney Islands', lat: 58.9, lng: -3.1 },
    { name: 'Isle of Man', lat: 54.23, lng: -4.5 },
    { name: 'Mainland', lat: 53.0, lng: -2.0, isMainland: true }, // Cornwall, Devon, Dorset, Scotland, Wales
  ],
  'France': [
    { name: 'Corsica Island', lat: 42.0, lng: 9.0 },
    { name: 'Porquerolles Island', lat: 43.0, lng: 6.2 },
    { name: 'Frioul & Riou Islands', lat: 43.25, lng: 5.33 },
    { name: 'Mainland', lat: 45.0, lng: 3.0, isMainland: true },
  ],
  'Ecuador': [
    { name: 'Santa Cruz Island', lat: -0.6, lng: -90.35 },
    { name: 'Isabela Island', lat: -0.85, lng: -91.0 },
    { name: 'San Cristóbal Island', lat: -0.9, lng: -89.5 },
    { name: 'Floreana Island', lat: -1.28, lng: -90.48 },
    { name: 'Wolf & Darwin Islands', lat: 1.5, lng: -92.0 },
    { name: 'Santiago Island', lat: -0.25, lng: -90.7 },
    { name: 'Mainland', lat: -1.5, lng: -80.5, isMainland: true },
  ],
  'Brazil': [
    { name: 'Fernando de Noronha Island', lat: -3.85, lng: -32.42 },
    { name: 'Ilhabela Island', lat: -23.85, lng: -45.35 },
    { name: 'Ilha Grande', lat: -23.15, lng: -44.25 },
    { name: 'Abrolhos Archipelago', lat: -17.96, lng: -38.7 },
    { name: 'Santa Catarina Island', lat: -27.6, lng: -48.5 },
    { name: 'Mainland', lat: -22.5, lng: -42.0, isMainland: true },
  ],
  'Canada': [
    { name: 'Vancouver Island', lat: 49.6, lng: -125.5 },
    { name: 'Haida Gwaii', lat: 53.3, lng: -132.3 },
    { name: 'Mainland', lat: 48.0, lng: -85.0, isMainland: true },
  ],
  'Caribbean Netherlands': [
    { name: 'Bonaire Island', lat: 12.18, lng: -68.28 },
    { name: 'Sint Eustatius Island', lat: 17.49, lng: -62.98 },
    { name: 'Saba Island', lat: 17.63, lng: -63.24 },
  ],
  'British Virgin Islands': [
    { name: 'Tortola Island', lat: 18.43, lng: -64.62 },
    { name: 'Virgin Gorda Island', lat: 18.48, lng: -64.38 },
    { name: 'Jost Van Dyke Island', lat: 18.45, lng: -64.75 },
    { name: 'Anegada Island', lat: 18.73, lng: -64.33 },
  ],
  'U.S. Virgin Islands': [
    { name: 'St. Thomas Island', lat: 18.34, lng: -64.93 },
    { name: 'St. John Island', lat: 18.33, lng: -64.73 },
    { name: 'St. Croix Island', lat: 17.73, lng: -64.75 },
  ],
  'Cayman Islands': [
    { name: 'Grand Cayman Island', lat: 19.32, lng: -81.25 },
    { name: 'Little Cayman Island', lat: 19.68, lng: -80.05 },
    { name: 'Cayman Brac Island', lat: 19.72, lng: -79.82 },
  ],
  'Bahamas': [
    { name: 'New Providence Island', lat: 25.02, lng: -77.4 },
    { name: 'Grand Bahama Island', lat: 26.65, lng: -78.5 },
    { name: 'Abaco Islands', lat: 26.4, lng: -77.1 },
    { name: 'Bimini Island', lat: 25.73, lng: -79.28 },
    { name: 'Andros Island', lat: 24.7, lng: -77.9 },
    { name: 'Eleuthera Island', lat: 25.1, lng: -76.2 },
    { name: 'Exuma Cays', lat: 24.0, lng: -76.2 },
    { name: 'San Salvador Island', lat: 24.05, lng: -74.5 },
  ],
  'Tanzania': [
    { name: 'Zanzibar Island', lat: -6.15, lng: 39.3 },
    { name: 'Pemba Island', lat: -5.2, lng: 39.75 },
    { name: 'Mafia Island', lat: -7.85, lng: 39.8 },
    { name: 'Mainland', lat: -6.8, lng: 39.28, isMainland: true },
  ],
  'Honduras': [
    { name: 'Roatán Island', lat: 16.33, lng: -86.53 },
    { name: 'Utila Island', lat: 16.1, lng: -86.9 },
    { name: 'Guanaja Island', lat: 16.48, lng: -85.88 },
    { name: 'Mainland', lat: 15.8, lng: -86.8, isMainland: true },
  ],
  'Panama': [
    { name: 'Bocas del Toro', lat: 9.35, lng: -82.25 },
    { name: 'Coiba Island', lat: 7.45, lng: -81.75 },
    { name: 'Pearl Islands', lat: 8.4, lng: -79.05 },
    { name: 'Mainland', lat: 8.9, lng: -79.5, isMainland: true },
  ],
  'Cambodia': [
    { name: 'Koh Rong Island', lat: 10.72, lng: 103.23 },
    { name: 'Koh Rong Sanloem Island', lat: 10.58, lng: 103.3 },
    { name: 'Koh Sdach Island', lat: 10.92, lng: 103.07 },
    { name: 'Mainland', lat: 10.6, lng: 103.5, isMainland: true },
  ],
  'Denmark': [
    { name: 'Zealand Island', lat: 55.5, lng: 11.8 },
    { name: 'Funen Island', lat: 55.3, lng: 10.3 },
    { name: 'Bornholm Island', lat: 55.15, lng: 14.9 },
    { name: 'Mainland', lat: 56.0, lng: 9.5, isMainland: true },
  ],
  'Sweden': [
    { name: 'Gotland Island', lat: 57.5, lng: 18.5 },
    { name: 'Öland Island', lat: 56.7, lng: 16.65 },
    { name: 'Stockholm Archipelago', lat: 59.3, lng: 18.8 },
    { name: 'Mainland', lat: 58.0, lng: 12.0, isMainland: true },
  ],
  'Ireland': [
    { name: 'Aran Islands', lat: 53.12, lng: -9.65 },
    { name: 'Valentia Island', lat: 51.9, lng: -10.35 },
    { name: 'Mainland', lat: 53.3, lng: -7.5, isMainland: true },
  ],
  'Seychelles': [
    { name: 'Mahé Island', lat: -4.67, lng: 55.45 },
    { name: 'Praslin Island', lat: -4.32, lng: 55.73 },
    { name: 'La Digue Island', lat: -4.36, lng: 55.83 },
  ],
  'Northern Mariana Islands': [
    { name: 'Saipan Island', lat: 15.2, lng: 145.75 },
    { name: 'Rota Island', lat: 14.15, lng: 145.2 },
    { name: 'Tinian Island', lat: 15.0, lng: 145.62 },
  ],
  'Kuwait': [
    { name: 'Kubbar Island', lat: 29.07, lng: 48.49 },
    { name: 'Qarooh Island', lat: 28.82, lng: 48.78 },
  ],
}

// Single island nations where all sites belong to the confirmed island territory
const SINGLE_ISLAND_TERRITORIES = {
  'Aruba': 'Aruba Island',
  'Barbados': 'Barbados Island',
  'Bermuda': 'Bermuda Island',
  'Curaçao': 'Curaçao Island',
  'Cyprus': 'Cyprus Island',
  'Dominica': 'Dominica Island',
  'Grenada': 'Grenada Island',
  'Guam': 'Guam Island',
  'Jamaica': 'Jamaica Island',
  'Montserrat': 'Montserrat Island',
  'Niue': 'Niue Island',
  'Palau': 'Palau (Rock Islands)',
  'Puerto Rico': 'Puerto Rico Island',
  'Republic Of Mauritius': 'Mauritius Island',
  'Réunion': 'Réunion Island',
  'Saint Kitts & Nevis': 'Saint Kitts & Nevis',
  'Saint Lucia': 'Saint Lucia Island',
  'Saint Vincent & The Grenadines': 'Saint Vincent & The Grenadines',
  'Sint Maarten': 'Sint Maarten Island',
  'The Guadeloupe Islands': 'Guadeloupe Island',
  'Trinidad And Tobago': 'Tobago & Trinidad',
  'Turks And Caicos Islands': 'Turks And Caicos Islands',
}

// Legacy alias for backwards compatibility
export const POPULAR_ISLAND_REGIONS = CONFIRMED_ISLAND_HUBS

/**
 * Resolves the confirmed island or mainland region for a given dive site.
 * Strictly guarantees that dive site names are never returned as islands.
 */
export function getIslandForSite(site) {
  if (!site) return 'Mainland'
  const country = (site.country || '').trim()
  const lat = parseFloat(site.latitude)
  const lng = parseFloat(site.longitude)
  const siteName = (site.siteName || '').trim().toLowerCase()
  const numId = Number(site.id)

  // 1. Direct Island overrides based on exact site name keywords or IDs
  if (country.toLowerCase() === 'philippines') {
    if (siteName.includes('malapascua') || siteName.includes('monad') || siteName.includes('gato island') || siteName.includes('chocolate island') || siteName.includes('lapus lapus')) {
      return 'Malapascua Island'
    }
    if (siteName.includes('sumilon')) {
      return 'Sumilon Island'
    }
    if (siteName.includes('apo island') || siteName.includes('apo reef') || numId === 19886 || (numId >= 27001 && numId <= 27008)) {
      return 'Apo Island'
    }
    if (siteName.includes('panglao') || siteName.includes('alona') || siteName.includes('balicasag') || siteName.includes('danae')) {
      return 'Panglao Island'
    }
    if (siteName.includes('cabilao')) {
      return 'Cabilao Island'
    }
    if (siteName.includes('siquijor') || siteName.includes('paliton') || siteName.includes('tubod') || siteName.includes('solangon')) {
      return 'Siquijor Island'
    }
    if (siteName.includes('dauin')) {
      return 'Negros Island'
    }
    if (siteName.includes('boracay')) {
      return 'Boracay Island'
    }
    if (siteName.includes('coron')) {
      return 'Coron Island'
    }
    if (siteName.includes('busuanga')) {
      return 'Busuanga Island'
    }
    if (siteName.includes('anilao') || siteName.includes('batangas') || siteName.includes('subic')) {
      return 'Mainland'
    }
  }

  if (country.toLowerCase() === 'indonesia') {
    if (siteName.includes('nusa lembongan') || siteName.includes('lembongan') || siteName.includes('ceningan')) {
      return 'Nusa Lembongan Island'
    }
    if (siteName.includes('nusa penida') || siteName.includes('crystal bay') || siteName.includes('manta point')) {
      return 'Nusa Penida Island'
    }
    if (siteName.includes('gili')) {
      return 'Gili Islands'
    }
    if (siteName.includes('tulamben') || siteName.includes('amed') || siteName.includes('padang bai') || siteName.includes('candidasa') || siteName.includes('menjangan')) {
      return 'Bali Island'
    }
    if (siteName.includes('bunaken')) {
      return 'Bunaken Island'
    }
    if (siteName.includes('siladen')) {
      return 'Siladen Island'
    }
    if (siteName.includes('komodo') || siteName.includes('batu bolong') || siteName.includes('rinca')) {
      return 'Komodo Island'
    }
    if (siteName.includes('raja ampat') || siteName.includes('misool') || siteName.includes('kri') || siteName.includes('mansuar')) {
      return 'Raja Ampat'
    }
    if (siteName.includes('weh') || siteName.includes('sabang') || siteName.includes('batee')) {
      return 'Pulau Weh'
    }
    if (siteName.includes('derawan')) return 'Derawan Island'
    if (siteName.includes('sangalaki')) return 'Sangalaki Island'
    if (siteName.includes('kakaban')) return 'Kakaban Island'
  }

  if (country.toLowerCase() === 'thailand') {
    if (siteName.includes('koh tao') || siteName.includes('chumphon pinnacle') || siteName.includes('sail rock') || siteName.includes('southwest pinnacle') || siteName.includes('shark island') || siteName.includes('mango bay') || siteName.includes('tanote') || siteName.includes('hin wong') || siteName.includes('twin peaks') || siteName.includes('green rock') || siteName.includes('white rock') || siteName.includes('aow leuk')) {
      return 'Koh Tao Island'
    }
    if (siteName.includes('koh phangan')) return 'Koh Phangan Island'
    if (siteName.includes('koh samui')) return 'Koh Samui Island'
    if (siteName.includes('phi phi') || siteName.includes('bida nok') || siteName.includes('bida nai') || siteName.includes('maya bay') || siteName.includes('shark point phi phi')) {
      return 'Koh Phi Phi Islands'
    }
    if (siteName.includes('racha yai') || siteName.includes('racha noi')) return 'Racha Islands'
    if (siteName.includes('similan') || siteName.includes('richelieu rock') || siteName.includes('elephant head')) return 'Similan Islands'
    if (siteName.includes('surin')) return 'Surin Islands'
    if (siteName.includes('koh chang')) return 'Koh Chang Island'
    if (siteName.includes('koh kood') || siteName.includes('koh mak')) return 'Koh Kood Island'
    if (siteName.includes('koh lanta') || siteName.includes('hin daeng') || siteName.includes('hin muang')) return 'Koh Lanta Island'
    if (siteName.includes('koh larn') || siteName.includes('koh sak') || siteName.includes('pattaya')) return 'Koh Larn Island'
    if (siteName.includes('phuket')) return 'Phuket Island'
  }

  if (country.toLowerCase() === 'spain') {
    if (siteName.includes('medes') || siteName.includes('illes medes')) return 'Medes Islands'
    if (siteName.includes('tabarca')) return 'Tabarca Island'
    if (siteName.includes('mallorca') || siteName.includes('cabrera') || siteName.includes('palma')) return 'Mallorca Island'
    if (siteName.includes('menorca')) return 'Menorca Island'
    if (siteName.includes('ibiza')) return 'Ibiza Island'
    if (siteName.includes('formentera')) return 'Formentera Island'
    if (siteName.includes('tenerife')) return 'Tenerife Island'
    if (siteName.includes('gran canaria')) return 'Gran Canaria Island'
    if (siteName.includes('lanzarote')) return 'Lanzarote Island'
    if (siteName.includes('fuerteventura')) return 'Fuerteventura Island'
    if (siteName.includes('la palma')) return 'La Palma Island'
    if (siteName.includes('el hierro')) return 'El Hierro Island'
    if (siteName.includes('la gomera')) return 'La Gomera Island'
    // Coast of mainland Spain
    if (lat >= 36.0 && lat <= 43.8 && lng >= -9.5 && lng <= 3.5) {
      const isBalearics = lng >= 1.0 && lng <= 4.5 && lat >= 38.5 && lat <= 40.5
      if (!isBalearics) return 'Mainland'
    }
  }

  if (country.toLowerCase() === 'malta') {
    if (siteName.includes('gozo')) return 'Gozo Island'
    if (siteName.includes('comino') || siteName.includes('blue lagoon') || siteName.includes('crystal lagoon') || siteName.includes('lantern point') || siteName.includes('p31')) {
      return 'Comino Island'
    }
    if (siteName.includes('cirkewwa') || siteName.includes('valletta') || siteName.includes('sliema') || siteName.includes('zurrieq') || siteName.includes('blue grotto')) {
      return 'Malta Island'
    }
  }

  if (country.toLowerCase() === 'kuwait') {
    if (siteName.includes('qarooh') || siteName.includes('qarouh')) return 'Qarooh Island'
    return 'Kubbar Island'
  }

  if (country.toLowerCase() === 'malaysia') {
    if (siteName.includes('sipadan')) return 'Sipadan Island'
    if (siteName.includes('mabul')) return 'Mabul Island'
    if (siteName.includes('kapalai')) return 'Kapalai Island'
    if (siteName.includes('tioman')) return 'Tioman Island'
    if (siteName.includes('perhentian')) return 'Perhentian Islands'
    if (siteName.includes('redang')) return 'Redang Island'
    if (siteName.includes('langkawi')) return 'Langkawi Island'
    if (siteName.includes('layang')) return 'Layang Layang Atoll'
  }

  if (country.toLowerCase() === 'egypt') {
    if (siteName.includes('giftun')) return 'Giftun Islands'
    if (siteName.includes('tiran') || siteName.includes('jackson') || siteName.includes('thomas') || siteName.includes('woodhouse') || siteName.includes('gordon')) {
      return 'Tiran Island'
    }
    if (siteName.includes('brother') || siteName.includes('akhawein')) return 'Brother Islands'
    return 'Mainland'
  }

  if (country.toLowerCase() === 'india') {
    if (siteName.includes('havelock') || siteName.includes('swaraj')) return 'Havelock Island'
    if ((siteName.includes('neil island') || siteName.includes('shaheed')) && lng > 90) return 'Neil Island'
    if (
      siteName.includes('grande island') ||
      siteName.includes('suzy') ||
      siteName.includes('davy jones') ||
      siteName.includes('bounty bay') ||
      siteName.includes('sail rock') ||
      siteName.includes('shelter cove') ||
      siteName.includes('turbo tunnel') ||
      (lat >= 15.2 && lat <= 15.5 && lng >= 73.6 && lng <= 73.9)
    ) {
      return 'Grande Island'
    }
    if (siteName.includes('netrani') || (lat >= 13.9 && lat <= 14.2 && lng >= 74.2 && lng <= 74.5)) return 'Netrani Island'
    if (
      siteName.includes('lakshadweep') ||
      siteName.includes('agatti') ||
      siteName.includes('bangaram') ||
      siteName.includes('kavaratti') ||
      siteName.includes('kadmat') ||
      siteName.includes('minicoy') ||
      siteName.includes('wall of wonder') ||
      (lat >= 8.0 && lat <= 12.5 && lng >= 71.0 && lng <= 74.2)
    ) {
      return 'Lakshadweep'
    }
    if (lng < 85) return 'Mainland'
  }

  if (country.toLowerCase().includes('usa') || country.toLowerCase().includes('united states')) {
    if (lng <= -154 && lng >= -161 && lat >= 18 && lat <= 23) {
      if (lat > 21.8) return 'Kauai Island'
      if (lat > 21.1) return 'Oahu Island'
      if (lat > 20.4) return 'Maui Island'
      return 'Hawaii Island (Big Island)'
    }
    if (lat >= 24.3 && lat <= 25.35 && lng >= -82.0 && lng <= -80.0) {
      if (lng < -81.5) return 'Key West'
      if (lng < -80.8) return 'Marathon'
      if (lng < -80.55) return 'Islamorada'
      return 'Key Largo'
    }
    if (siteName.includes('catalina') || (lat >= 33.2 && lat <= 33.5 && lng >= -118.6 && lng <= -118.25)) {
      return 'Santa Catalina Island'
    }
    if (lat >= 33.8 && lat <= 34.15 && lng >= -120.5 && lng <= -119.3) {
      return 'Santa Cruz & Channel Islands'
    }
    return 'Mainland'
  }

  // 2. Check Single-Island Territories
  const singleMatch = Object.keys(SINGLE_ISLAND_TERRITORIES).find(
    (k) => k.toLowerCase() === country.toLowerCase()
  )
  if (singleMatch) {
    return SINGLE_ISLAND_TERRITORIES[singleMatch]
  }

  // 3. Match against confirmed island hubs of the country by shortest distance
  const countryKey = Object.keys(CONFIRMED_ISLAND_HUBS).find(
    (k) => k.toLowerCase() === country.toLowerCase()
  )
  const hubs = countryKey ? CONFIRMED_ISLAND_HUBS[countryKey] : null

  if (hubs && hubs.length > 0 && !isNaN(lat) && !isNaN(lng)) {
    let bestHub = hubs[0].name
    let minDistance = Infinity

    for (const hub of hubs) {
      const dLat = lat - hub.lat
      const dLng = lng - hub.lng
      const dist = Math.hypot(dLat, dLng)
      if (dist < minDistance) {
        minDistance = dist
        bestHub = hub.name
      }
    }
    return bestHub
  }

  // 4. Default for purely mainland countries
  return 'Mainland'
}

/**
 * Returns a sorted array of confirmed unique islands / regions for a country,
 * including site count, geographical centroid coordinates, and bounding box.
 */
export function getIslandsForCountry(country, allSites = []) {
  if (!country) return []
  const sitesInCountry = allSites.filter(
    (s) => s.country && s.country.toLowerCase() === country.toLowerCase()
  )
  if (sitesInCountry.length === 0) return []

  const islandData = new Map()

  sitesInCountry.forEach((site) => {
    const island = getIslandForSite(site)
    const lat = parseFloat(site.latitude)
    const lng = parseFloat(site.longitude)

    if (!islandData.has(island)) {
      islandData.set(island, {
        name: island,
        count: 0,
        sumLat: 0,
        sumLng: 0,
        validCoordsCount: 0,
        minLng: Infinity,
        maxLng: -Infinity,
        minLat: Infinity,
        maxLat: -Infinity,
      })
    }

    const data = islandData.get(island)
    data.count += 1

    if (!isNaN(lat) && !isNaN(lng)) {
      data.sumLat += lat
      data.sumLng += lng
      data.validCoordsCount += 1
      if (lng < data.minLng) data.minLng = lng
      if (lng > data.maxLng) data.maxLng = lng
      if (lat < data.minLat) data.minLat = lat
      if (lat > data.maxLat) data.maxLat = lat
    }
  })

  return Array.from(islandData.values())
    .sort((a, b) => b.count - a.count) // Sort by most dive sites first
    .map((item) => {
      const avgLat = item.validCoordsCount > 0 ? item.sumLat / item.validCoordsCount : 0
      const avgLng = item.validCoordsCount > 0 ? item.sumLng / item.validCoordsCount : 0
      return {
        name: item.name,
        count: item.count,
        latitude: avgLat,
        longitude: avgLng,
        bounds: [
          [item.minLng === Infinity ? avgLng : item.minLng, item.minLat === Infinity ? avgLat : item.minLat],
          [item.maxLng === -Infinity ? avgLng : item.maxLng, item.maxLat === -Infinity ? avgLat : item.maxLat],
        ],
      }
    })
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

  const targetIsland = island.toLowerCase().trim()
  return sitesInCountry.filter((s) => {
    const sIsland = getIslandForSite(s).toLowerCase().trim()
    if (sIsland === targetIsland) return true
    if (
      (targetIsland === 'lakshadweep' || targetIsland === 'lakshadweep islands') &&
      (sIsland === 'lakshadweep' || sIsland === 'lakshadweep islands')
    ) {
      return true
    }
    return false
  })
}
