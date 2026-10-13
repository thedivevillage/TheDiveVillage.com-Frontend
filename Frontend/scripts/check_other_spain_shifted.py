import csv

with open('public/data/dive-sites.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

spain_shifted = [
    r for r in rows
    if r['Country'] == 'Spain' and r.get('Coordinate_Shift_m') and float(r.get('Coordinate_Shift_m')) > 0
]

print(f"Total shifted Spain sites: {len(spain_shifted)}")
# Let's inspect Costa Brava (lat 41-43, lng 2.5-3.5)
costa_brava = [r for r in spain_shifted if 41.5 <= float(r['Latitude']) <= 42.5 and 2.5 <= float(r['Longitude']) <= 3.5]
print(f"Costa Brava shifted ({len(costa_brava)}):")
for s in costa_brava:
    print(f"  {s['ID']}: {s['Site_Name']} | Lat: {s['Latitude']}, Lng: {s['Longitude']} | Ref: {s['Ref_Latitude']}, {s['Ref_Longitude']}")

# Let's inspect Costa Blanca (lat 36.5-38.8, lng -1.0 to 0.5)
costa_blanca = [r for r in spain_shifted if 36.5 <= float(r['Latitude']) <= 38.8 and -1.0 <= float(r['Longitude']) <= 0.5]
print(f"Costa Blanca shifted ({len(costa_blanca)}):")
for s in costa_blanca:
    print(f"  {s['ID']}: {s['Site_Name']} | Lat: {s['Latitude']}, Lng: {s['Longitude']} | Ref: {s['Ref_Latitude']}, {s['Ref_Longitude']}")
