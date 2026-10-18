import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mappingPath = path.resolve(__dirname, 'cloudinary_image_mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

const frontendSrc = path.resolve(__dirname, 'Frontend/src');

function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getFiles(full));
    } else if (/\.(jsx?|tsx?)$/.test(item.name)) {
      results.push(full);
    }
  }
  return results;
}

const jsFiles = getFiles(frontendSrc);
let updatedFilesCount = 0;

for (const file of jsFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Replace thumbnail references
  for (const [k, url] of Object.entries(mapping)) {
    if (k.startsWith('/media/thumbnails/') || k.startsWith('/media/TDV-Media/AirportToAirport/')) {
      if (content.includes(`'${k}'`)) {
        content = content.replaceAll(`'${k}'`, `'${url}'`);
      }
      if (content.includes(`"${k}"`)) {
        content = content.replaceAll(`"${k}"`, `"${url}"`);
      }
    }
  }

  // 2. Fix products.js local imports
  if (file.endsWith('products.js')) {
    content = content.replace(
      "import imgFullWetsuitFront from '../assets/Media/done/Full Wet Suit/Black Wetsuit with Dive Village Logos.png';",
      "const imgFullWetsuitFront = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1792325269/TDV-Media/Products/done/Full%20Wet%20Suit/Black_Wetsuit_with_Dive_Village_Logos.png';"
    );
    content = content.replace(
      "import imgFullWetsuitBack from '../assets/Media/done/Full Wet Suit/Rear-View Black Wetsuit with Cyan Zipper Strap.png';",
      "const imgFullWetsuitBack = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1792325344/TDV-Media/Products/done/Full%20Wet%20Suit/Rear-View_Black_Wetsuit_with_Cyan_Zipper_Strap.png';"
    );
  }

  // 3. Fix Preloader.jsx local video import
  if (file.endsWith('Preloader.jsx')) {
    content = content.replace(
      "import preloaderVideoLocal from '../assets/preloader.mp4'\n\nconst CLOUD_PRELOADER = '/media/TDV-Media/UI/preloader.mp4'\nconst preloaderVideo = preloaderVideoLocal || CLOUD_PRELOADER",
      "const CLOUD_PRELOADER = '/media/TDV-Media/UI/preloader.mp4'\nconst preloaderVideo = CLOUD_PRELOADER"
    );
    content = content.replace(
      "import preloaderVideoLocal from '../assets/preloader.mp4'",
      ""
    );
    content = content.replace(
      "const preloaderVideo = preloaderVideoLocal || CLOUD_PRELOADER",
      "const preloaderVideo = CLOUD_PRELOADER"
    );
  }

  // 4. Fix pinIconUrl in DiveExplorerMap.jsx & InteractiveDiveMap.jsx
  if (file.endsWith('DiveExplorerMap.jsx') || file.endsWith('InteractiveDiveMap.jsx')) {
    content = content.replace(
      "import pinIconUrl from '../assets/pin.png'",
      "const pinIconUrl = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1792325069/TDV-Media/UI/pin.png'"
    );
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedFilesCount++;
    console.log(`Updated references in: ${path.relative(frontendSrc, file)}`);
  }
}

console.log(`\nReplacement complete! Updated ${updatedFilesCount} files.`);
