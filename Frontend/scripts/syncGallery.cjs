const fs = require('fs');
const path = require('path');

const galleryDir = path.resolve('c:/Users/Sonia/Desktop/TheDiveVillage-Frontend/Frontend/src/assets/New folder/Gallery');
const newFolderDir = path.resolve('c:/Users/Sonia/Desktop/TheDiveVillage-Frontend/Frontend/src/assets/New folder');

const galleryFiles = fs.readdirSync(galleryDir);
const newFolderFiles = fs.readdirSync(newFolderDir).filter(f => !fs.statSync(path.join(newFolderDir, f)).isDirectory());

console.log('Files in Gallery folder:', galleryFiles.length);
console.log('Files in New folder:', newFolderFiles.length);

const videosInGallery = galleryFiles.filter(f => f.match(/\.(mp4|mov|webm|MP4|MOV)$/i));
const imagesInGallery = galleryFiles.filter(f => f.match(/\.(jpg|jpeg|png|webp|JPG|PNG)$/i));

console.log('Videos in Gallery:', videosInGallery.length);
console.log('Images in Gallery:', imagesInGallery.length);

// Generate clean galleryData.js with only existing files
let imports = [];
let galleryItems = [];

// Helper to make safe js identifier
function toId(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+|_+$/g, '');
}

// 1. Process all videos in Gallery
videosInGallery.forEach((v, i) => {
  const varName = 'vid_' + toId(v).slice(0, 30) + '_' + i;
  imports.push(`import ${varName} from '../assets/New folder/Gallery/${v}'`);
  
  let category = 'activity';
  const lower = v.toLowerCase();
  if (lower.includes('manta') || lower.includes('turtle') || lower.includes('lionfish') || lower.includes('lobster') || lower.includes('fish') || lower.includes('closeup') || lower.includes('coral')) {
    category = 'marine';
  } else if (lower.includes('dive') || lower.includes('gx01') || lower.includes('trim') || lower.includes('dji_mimo')) {
    category = 'scuba';
  }

  // Clean human title
  let cleanTitle = v.replace(/\.[^/.]+$/, '').replace(/[_\\-]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  if (cleanTitle.length > 35) cleanTitle = cleanTitle.slice(0, 35) + '...';

  galleryItems.push({
    id: `gallery-v-${i}`,
    type: 'video',
    src: varName,
    title: cleanTitle || 'Ocean Dive Reel',
    location: 'Havelock Island, Andaman',
    category: category
  });
});

// 2. Process all images in Gallery
imagesInGallery.forEach((img, i) => {
  const varName = 'img_' + toId(img).slice(0, 30) + '_' + i;
  imports.push(`import ${varName} from '../assets/New folder/Gallery/${img}'`);
  
  let category = 'marine';
  const lower = img.toLowerCase();
  if (lower.includes('dive') || lower.includes('dji') || lower.includes('boat') || lower.includes('gopr')) {
    category = 'activity';
  } else if (lower.includes('life')) {
    category = (i % 2 === 0) ? 'marine' : 'scuba';
  }

  let cleanTitle = img.replace(/\.[^/.]+$/, '').replace(/[_\\-]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  if (cleanTitle.length > 35) cleanTitle = cleanTitle.slice(0, 35) + '...';

  galleryItems.push({
    id: `gallery-p-${i}`,
    type: 'image',
    src: varName,
    title: cleanTitle || 'Marine Chronicle',
    location: 'Andaman Archipelago',
    category: category
  });
});

const output = `// Media assets dynamically synchronized with src/assets/New folder/Gallery

${imports.join('\n')}

export const GALLERY_CATEGORIES = [
  { key: 'all', label: 'All Chronicles' },
  { key: 'marine', label: 'Marine Life' },
  { key: 'scuba', label: 'Scuba Diving' },
  { key: 'activity', label: 'Ocean Activities' },
  { key: 'videos', label: 'Motion Reels' },
  { key: 'photos', label: 'High-Res Stills' },
]

export const GALLERY_ITEMS = [
${galleryItems.map(item => `  {
    id: ${JSON.stringify(item.id)},
    type: ${JSON.stringify(item.type)},
    src: ${item.src},
    title: ${JSON.stringify(item.title)},
    location: ${JSON.stringify(item.location)},
    category: ${JSON.stringify(item.category)}
  }`).join(',\n')}
]
`;

fs.writeFileSync('c:/Users/Sonia/Desktop/TheDiveVillage-Frontend/Frontend/src/utils/galleryData.js', output);
console.log('Successfully written galleryData.js with', galleryItems.length, 'verified gallery items!');
