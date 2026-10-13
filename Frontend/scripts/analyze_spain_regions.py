import csv

with open('public/data/dive-sites.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f"Total rows: {len(rows)}")

# Find all sites in Spain with "Punta", "Cala", "Playa", "Beach", "Cove", "Reef", "Cave", "Bay", "Port"
# that are on land
spain_sites = [r for r in rows if r['Country'] == 'Spain']
print(f"Total Spain sites: {len(spain_sites)}")

# Group by region
regions = {}
for r in spain_sites:
    lat = float(r['Latitude'])
    lng = float(r['Longitude'])
    reg = 'Other'
    if 39.0 <= lat <= 40.2 and 2.0 <= lng <= 4.5:
        reg = 'Mallorca & Menorca'
    elif 38.5 <= lat <= 39.2 and 1.1 <= lng <= 1.8:
        reg = 'Ibiza & Formentera'
    elif 27.5 <= lat <= 29.5 and -18.5 <= lng <= -13.0:
        reg = 'Canary Islands'
    elif 41.0 <= lat <= 42.6 and 2.5 <= lng <= 3.4:
        reg = 'Costa Brava'
    elif 36.5 <= lat <= 38.8 and -1.0 <= lng <= 0.5:
        reg = 'Costa Blanca / Cabo de Palos'
    elif 35.8 <= lat <= 37.0 and -6.5 <= lng <= -1.5:
        reg = 'Andalusia / Costa del Sol / Tarifa'
    
    regions.setdefault(reg, []).append(r)

for reg, sites in regions.items():
    shifted = [s for s in sites if s.get('Coordinate_Shift_m') and float(s.get('Coordinate_Shift_m')) > 0]
    print(f"Region: {reg} -> Total: {len(sites)}, Shifted: {len(shifted)}")
