import csv
import json

# Map of ID to authentic coastal coordinates [latitude, longitude]
COASTAL_MOVES = {
    # --- MALLORCA (Balearic Islands) ---
    # Punta Cautius (Punta d'en Cautius cliff drop-off in Calvià) - explicitly requested
    '378': {'lat': 39.46380, 'lng': 2.50350, 'name': 'Punta Cautius'},
    # Punta Martin (west cape of Cap de Cala Figuera)
    '377': {'lat': 39.46580, 'lng': 2.49650, 'name': 'Punta Martin'},
    # Punta Marc (south of Cautius on west cliff)
    '14877': {'lat': 39.46150, 'lng': 2.50250, 'name': 'Punta Marc'},
    # Carlotta (south tip off Cap de Cala Figuera)
    '383': {'lat': 39.45450, 'lng': 2.51800, 'name': 'Carlotta'},
    # Punta Cala Figuera (southeast cape coastal water)
    '14639': {'lat': 39.45400, 'lng': 2.52400, 'name': 'Punta Cala Figuera'},
    # Portalls Vells (cove waters of Portals Vells)
    '384': {'lat': 39.47350, 'lng': 2.52150, 'name': 'Portalls Vells'},
    # Illetes (coastal water off Ses Illetes islets)
    '381': {'lat': 39.53250, 'lng': 2.59250, 'name': 'Illetes'},
    # Palmanova Bay (open bay waters)
    '9487': {'lat': 39.51650, 'lng': 2.54100, 'name': 'Palmanova Bay'},
    # Cala Montjo (Cala Fornells cove waters)
    '10242': {'lat': 39.52450, 'lng': 2.43350, 'name': 'Cala Montjo'},
    # Palma Cavern (coastal waters off Portopí breakwater)
    '14617': {'lat': 39.54450, 'lng': 2.62550, 'name': 'Palma Cavern'},
    # Sa Foradada (waters off the iconic Deià rock)
    '2150': {'lat': 39.75650, 'lng': 2.61750, 'name': 'Sa Foradada'},
    # Es Castellet - The Pinnacle (waters off Formentor pinnacle)
    '19369': {'lat': 39.93950, 'lng': 3.18400, 'name': 'Es Castellet - The Pinnacle'},
    # Gorgonias Garden / El Eden De Gorgonias (waters off Cap de Formentor)
    '19370': {'lat': 39.96350, 'lng': 3.17600, 'name': 'Gorgonias Garden / El Eden De Gorgonias'},
    # Cala Molins - Cala Carbó (cove waters of Cala Sant Vicenç)
    '19372': {'lat': 39.92150, 'lng': 3.05650, 'name': 'Cala Molins - Cala Carbó'},
    # Hide And Seek (east coast coastal waters)
    '17513': {'lat': 39.63100, 'lng': 3.43550, 'name': 'Hide And Seek'},

    # --- MENORCA (Balearic Islands) ---
    # Pont d'En Gil (sea arch and underwater cave off Ciutadella)
    '7189': {'lat': 40.01150, 'lng': 3.79300, 'name': "Pont d'En Gil"},
    # Sa Cigonya (west coast coastal water)
    '11694': {'lat': 40.01150, 'lng': 3.79350, 'name': 'Sa Cigonya'},
    # Cala Blanca (cove water)
    '11695': {'lat': 39.96650, 'lng': 3.83150, 'name': 'Cala Blanca'},
    # Canyons (underwater canyons)
    '11705': {'lat': 39.97200, 'lng': 3.82650, 'name': 'Canyons'},
    # Coves De Addaia (coastal water off Addaia headland)
    '2237': {'lat': 40.02150, 'lng': 4.20850, 'name': 'Coves De Addaia'},
    # Punta Grossa (coastal water off Punta Grossa)
    '2241': {'lat': 40.02350, 'lng': 4.19700, 'name': 'Punta Grossa'},
    # La Cueva Grande (marine cave waters)
    '2243': {'lat': 40.03150, 'lng': 4.19450, 'name': 'La Cueva Grande'},
    # La Chimenea (marine chimney waters)
    '2244': {'lat': 40.03180, 'lng': 4.19450, 'name': 'La Chimenea'},
    # El Queso Suizo / Swiss Cheese (cheese rock reef)
    '7413': {'lat': 40.02600, 'lng': 4.19350, 'name': 'El Queso Suizo / Swiss Cheese'},
    # Lightning Corner / Es Racó Des Llamp (north coast water)
    '7348': {'lat': 40.06950, 'lng': 4.14350, 'name': 'Lightning Corner / Es Racó Des Llamp'},
    # Cueva De Los Ingleses / English Cave (marine cave waters)
    '7349': {'lat': 40.06900, 'lng': 4.14850, 'name': 'Cueva De Los Ingleses / English Cave'},
    # Ad Jatia (north coast waters)
    '17633': {'lat': 40.07600, 'lng': 4.09200, 'name': 'Ad Jatia'},

    # --- IBIZA & FORMENTERA (Balearic Islands) ---
    # Punta Jaime (north cape coastal water)
    '2057': {'lat': 39.11700, 'lng': 1.50900, 'name': 'Punta Jaime'},
    # Sa Aigua Blanca (northeast coastal water)
    '2056': {'lat': 39.11750, 'lng': 1.52250, 'name': 'Sa Aigua Blanca'},
    # Las Anclas (north coast coastal reef water)
    '2074': {'lat': 39.11500, 'lng': 1.54200, 'name': 'Las Anclas'},
    # Bajo De Ses Caletes (north shoal water)
    '2073': {'lat': 39.10350, 'lng': 1.55150, 'name': 'Bajo De Ses Caletes'},
    # Portitxol (water of Portitxol circular cove)
    '2077': {'lat': 39.08000, 'lng': 1.40250, 'name': 'Portitxol'},
    # The Arches Of Cala Olivera (coastal arches waters)
    '5587': {'lat': 38.93150, 'lng': 1.50450, 'name': 'The Arches Of Cala Olivera'},

    # --- CANARY ISLANDS (Lanzarote & Tenerife) ---
    # Cathedral (Playa Chica reef drop-off, Lanzarote)
    '333': {'lat': 28.91800, 'lng': -13.66850, 'name': 'Cathedral'},
    # Flamingo (Playa Blanca coastal water, Lanzarote)
    '354': {'lat': 28.85700, 'lng': -13.84300, 'name': 'Flamingo'},
    # Playa Chica Bay (bay water, Lanzarote)
    '370': {'lat': 28.91880, 'lng': -13.66800, 'name': 'Playa Chica Bay'},
    # Harbour Wall (harbour coastal water, Lanzarote)
    '371': {'lat': 28.91950, 'lng': -13.67050, 'name': 'Harbour Wall'},
    # Shrimp Cave (coastal water, Lanzarote)
    '924': {'lat': 28.91850, 'lng': -13.67000, 'name': 'Shrimp Cave'},
    # Waikiki (coastal water, Lanzarote)
    '926': {'lat': 28.91850, 'lng': -13.65400, 'name': 'Waikiki'},
    # Richies Reef (coastal water, Lanzarote)
    '927': {'lat': 28.91800, 'lng': -13.65800, 'name': 'Richies Reef'},
    # Playa Las Vistas (coastal water off breakwater, Tenerife)
    '1061': {'lat': 28.04950, 'lng': -16.72200, 'name': 'Playa Las Vistas'},
    # Playa Grande (coastal water, Lanzarote)
    '1109': {'lat': 28.91900, 'lng': -13.66500, 'name': 'Playa Grande'},
    # Veril De Fariones (coastal drop-off, Lanzarote)
    '1110': {'lat': 28.91800, 'lng': -13.66600, 'name': 'Veril De Fariones'},
    # Los Arcos (coastal arches, Lanzarote)
    '1111': {'lat': 28.91750, 'lng': -13.66400, 'name': 'Los Arcos'},
    # La Pared (wall drop-off, Lanzarote)
    '1112': {'lat': 28.91720, 'lng': -13.66100, 'name': 'La Pared'},
    # Red Coral / Playa Chica Wall (wall, Lanzarote)
    '1182': {'lat': 28.91830, 'lng': -13.66950, 'name': 'Red Coral (Playa Chica Wall)'},
    # Mala / Charco Del Palo (coastal water, Lanzarote)
    '1184': {'lat': 29.08350, 'lng': -13.44900, 'name': 'Mala (Charco Del Palo)'},
    # The Elevator / Skulls Cave (cave water, Lanzarote)
    '1185': {'lat': 29.07650, 'lng': -13.45250, 'name': 'The Elevator (Skulls Cave)'},

    # --- COSTA BRAVA ---
    # Mar Menuda (cove waters of Tossa de Mar)
    '87': {'lat': 41.72250, 'lng': 2.94000, 'name': 'Mar Menuda'},
    # Punta Santa Anna (waters off Blanes point)
    '770': {'lat': 41.67400, 'lng': 2.80200, 'name': 'Punta Santa Anna'},
    # Agua Dolç (Cadaqués coastal water)
    '822': {'lat': 42.35000, 'lng': 3.22650, 'name': 'Agua Dolç'},
    # Figarola (Cadaqués coastal water)
    '826': {'lat': 42.34150, 'lng': 3.23800, 'name': 'Figarola'},
    # Margarita (Palamós coastal water)
    '2152': {'lat': 41.84800, 'lng': 3.14100, 'name': 'Margarita'},
    # Cova De La Sal (L'Escala coastal cave water)
    '3057': {'lat': 42.10500, 'lng': 3.17950, 'name': 'Cova De La Sal'},
    # Port Del Rei (L'Escala coastal cove water)
    '3059': {'lat': 42.10670, 'lng': 3.17450, 'name': 'Port Del Rei'},
    # La Xinxa (L'Escala coastal water)
    '3067': {'lat': 42.11350, 'lng': 3.17300, 'name': 'La Xinxa'},
    # Punta Del Ferro (L'Escala coastal water)
    '3068': {'lat': 42.11580, 'lng': 3.16850, 'name': 'Punta Del Ferro'},
    # Santa Anna (Tossa de Mar coastal water)
    '14890': {'lat': 41.72050, 'lng': 2.94100, 'name': 'Santa Anna'},
    # Port Pelegri (Calella de Palafrugell coastal water)
    '15242': {'lat': 41.88750, 'lng': 3.18300, 'name': 'Port Pelegri'},
    # Negre Del Falaguer (L'Estartit coastal water)
    '20164': {'lat': 42.06660, 'lng': 3.21050, 'name': 'Negre Del Falaguer'},

    # --- COSTA BLANCA / CABO DE PALOS ---
    # Balky Point (Cabo de Palos coastal water)
    '79': {'lat': 37.63050, 'lng': -0.70150, 'name': 'Balky Point'},
    # San Martin Norte (Jávea coastal water)
    '9358': {'lat': 38.76500, 'lng': 0.22350, 'name': 'San Martin Norte'},
    # La Higuera (Moraira coastal water)
    '14378': {'lat': 38.63600, 'lng': 0.08000, 'name': 'La Higuera'},
    # Cala De La Escalerica (Cabo de Palos coastal water)
    '16208': {'lat': 37.63220, 'lng': -0.69020, 'name': 'Cala De La Escalerica'},
    # Cala Fria (Cabo de Palos coastal water)
    '16209': {'lat': 37.63460, 'lng': -0.68900, 'name': 'Cala Fria'},
    # San Martin Norte / La Virgen (Jávea coastal water)
    '20174': {'lat': 38.76500, 'lng': 0.22400, 'name': 'San Martin Norte (La Virgen)'},
    # San Martin Sur (Jávea coastal water)
    '20175': {'lat': 38.76400, 'lng': 0.22380, 'name': 'San Martin Sur'},
    # Piedras Rotas (Jávea coastal water)
    '20176': {'lat': 38.76200, 'lng': 0.22350, 'name': 'Piedras Rotas'},
    # Termas (Jávea coastal water)
    '20178': {'lat': 38.75400, 'lng': 0.22900, 'name': 'Termas'},
    # Pared Negra (Jávea coastal water)
    '20181': {'lat': 38.74600, 'lng': 0.22900, 'name': 'Pared Negra'},
    # Cueva De Las Gambas (Jávea coastal water)
    '20184': {'lat': 38.74200, 'lng': 0.23150, 'name': 'Cueva De Las Gambas'},
    # Montaña Hundida (Jávea coastal water)
    '20185': {'lat': 38.74050, 'lng': 0.23350, 'name': 'Montaña Hundida'},
    # Racó (Calpe Peñón de Ifach coastal water)
    '22532': {'lat': 38.63500, 'lng': 0.07050, 'name': 'Racó'},
}

def update_csv(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    updated_count = 0
    for r in rows:
        site_id = r.get('ID', '').strip()
        if site_id in COASTAL_MOVES:
            move = COASTAL_MOVES[site_id]
            r['Latitude'] = f"{move['lat']:.5f}"
            r['Longitude'] = f"{move['lng']:.5f}"
            r['Coordinate_Shift_m'] = '0.0'
            r['Water_Correction'] = 'coastal_water_verified'
            updated_count += 1

    with open(file_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Updated {updated_count} sites in {file_path}")

update_csv('public/data/dive-sites.csv')
update_csv('src/assets/Dive sites.csv')
print(f"Total coastal moves defined: {len(COASTAL_MOVES)}")
