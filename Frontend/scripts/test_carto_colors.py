import math
import requests
from PIL import Image
import io

def lat_lng_to_tile_pixel(lat, lng, zoom=14):
    n = 2.0 ** zoom
    x_tile = (lng + 180.0) / 360.0 * n
    lat_rad = math.radians(lat)
    y_tile = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
    return int(x_tile), int(y_tile), int((x_tile % 1) * 256), int((y_tile % 1) * 256)

def get_pixel_color(lat, lng, zoom=14):
    tx, ty, px, py = lat_lng_to_tile_pixel(lat, lng, zoom)
    url = f"https://a.basemaps.cartocdn.com/rastertiles/voyager/{zoom}/{tx}/{ty}.png"
    r = requests.get(url, timeout=10)
    img = Image.open(io.BytesIO(r.content)).convert('RGB')
    return img.getpixel((px, py))

c_land = get_pixel_color(39.46340, 2.50922)
c_water = get_pixel_color(39.4635, 2.5035)

print(f"Current Cautius (39.46340, 2.50922) Color: RGB{c_land}")
print(f"Coast Cautius (39.4635, 2.5035) Color: RGB{c_water}")
