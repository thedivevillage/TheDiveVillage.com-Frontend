import fs from 'fs';

// Convert lat, lng, zoom to tile x, y and pixel inside tile
function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const xTile = (lng + 180) / 360 * n;
  const latRad = lat * Math.PI / 180;
  const yTile = (1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n;
  return {
    tileX: Math.floor(xTile),
    tileY: Math.floor(yTile),
    pixelX: Math.floor((xTile - Math.floor(xTile)) * 256),
    pixelY: Math.floor((yTile - Math.floor(yTile)) * 256),
  };
}

const cautiusLand = latLngToTile(39.46340, 2.50922, 14);
const cautiusWater = latLngToTile(39.4638, 2.5035, 14);
console.log('Cautius Land tile z14:', cautiusLand);
console.log('Cautius Water tile z14:', cautiusWater);

// Download tile and check if they are in the same tile
const tileUrl = `https://a.basemaps.cartocdn.com/rastertiles/voyager/14/${cautiusLand.tileX}/${cautiusLand.tileY}.png`;
console.log('Tile URL:', tileUrl);
