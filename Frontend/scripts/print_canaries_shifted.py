import csv

with open('public/data/dive-sites.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

canaries = [
    r for r in rows
    if r['Country'] == 'Spain' and 27.5 <= float(r['Latitude']) <= 29.5 and -18.5 <= float(r['Longitude']) <= -13.0
]

shifted = [s for s in canaries if s.get('Coordinate_Shift_m') and float(s.get('Coordinate_Shift_m')) > 0]
print(f"Shifted in Canary Islands ({len(shifted)}):")
for s in shifted[:15]:
    print(f"{s['ID']}: {s['Site_Name']} | Lat: {s['Latitude']}, Lng: {s['Longitude']} | Ref: {s['Ref_Latitude']}, {s['Ref_Longitude']}")
