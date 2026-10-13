import csv

with open('public/data/dive-sites.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

ibiza = [
    r for r in rows
    if r['Country'] == 'Spain' and 38.5 <= float(r['Latitude']) <= 39.2 and 1.1 <= float(r['Longitude']) <= 1.8
]

shifted = [s for s in ibiza if s.get('Coordinate_Shift_m') and float(s.get('Coordinate_Shift_m')) > 0]
print(f"Shifted in Ibiza & Formentera ({len(shifted)}):")
for s in shifted:
    print(f"{s['ID']}: {s['Site_Name']} | Lat: {s['Latitude']}, Lng: {s['Longitude']} | Ref: {s['Ref_Latitude']}, {s['Ref_Longitude']}")
