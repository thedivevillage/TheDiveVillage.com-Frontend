import csv

with open('public/data/dive-sites.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

mallorca_menorca = [
    r for r in rows
    if r['Country'] == 'Spain' and 39.0 <= float(r['Latitude']) <= 40.2 and 2.0 <= float(r['Longitude']) <= 4.5
]

shifted = [s for s in mallorca_menorca if s.get('Coordinate_Shift_m') and float(s.get('Coordinate_Shift_m')) > 0]
print(f"Shifted in Mallorca & Menorca ({len(shifted)}):")
for s in shifted:
    print(f"{s['ID']}: {s['Site_Name']} | Lat: {s['Latitude']}, Lng: {s['Longitude']} | Ref: {s['Ref_Latitude']}, {s['Ref_Longitude']}")
