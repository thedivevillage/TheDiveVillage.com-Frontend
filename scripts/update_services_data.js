import fs from 'fs';

let content = fs.readFileSync('TheDiveVillage-Frontend/Frontend/src/data/servicesData.js', 'utf8');

// Replace top add-on media imports (lines 114-125)
const addOnReplacements = `// Add Ons Media (Cloudinary URLs)
const vidTrekking = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791685324/TDV-Media/AddOns/Trekking.mp4'
const imgTrekking = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685508/TDV-Media/AddOns/trekking.webp'
const vidSightseeing = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791685371/TDV-Media/AddOns/sightseeing.mp4'
const imgSightseeing = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685509/TDV-Media/AddOns/sightseeing.webp'
const vidCampers = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791686777/TDV-Media/AddOns/Campers.mp4'
const imgCampers = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685511/TDV-Media/AddOns/campers.webp'
const vidSafari = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791191828/dive-village/gallery-videos/gallery1_mp4.mp4'
const imgSafari = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685504/TDV-Media/AddOns/safari.webp'
const vidLiveaboard = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791685388/TDV-Media/AddOns/liveaboard.mp4'
const imgLiveaboard = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685512/TDV-Media/AddOns/liveaboard.webp'`;

content = content.replace(/\/\/ Add Ons Media[\s\S]*?(?=export const CATEGORIES)/, addOnReplacements + '\n\n');

// Replace services thumbnails imports
content = content.replace(/import imgIntroProg from[^\n\r]+/, "const imgIntroProg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452294/TDV-Images/Introductory_Programs.webp'");
content = content.replace(/import imgSnorkelingPng from[^\n\r]+/, "const imgSnorkelingPng = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452295/TDV-Images/Snorkeling.webp'");
content = content.replace(/import imgCertCourses from[^\n\r]+/, "const imgCertCourses = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452290/TDV-Images/Certified_Courses.webp'");
content = content.replace(/import imgStay from[^\n\r]+/, "const imgStay = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452086/TDV-Images/Stay.webp'");
content = content.replace(/import imgFreeDivingPng from[^\n\r]+/, "const imgFreeDivingPng = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452292/TDV-Images/Free_Diving.webp'");

// Replace Gallery images imports with Cloudinary constants
const galleryPhotos = [
  'imgPhoto86440', 'imgPhoto86448', 'imgPhoto86450', 'imgPhoto86726', 'imgPhoto86451',
  'imgPhoto86454', 'imgPhoto86476', 'imgScuba1Jpg', 'imgScuba2Jpg', 'imgScuba3Jpg',
  'imgScuba4Jpg', 'imgScuba5Jpg', 'imgPhoto86485', 'imgPhoto86509', 'imgCrownOfThorns',
  'imgPhoto86561', 'imgPhoto86567', 'imgPhoto86573', 'imgNightDive', 'imgPhoto86574',
  'imgPhoto86576', 'imgFlexFunDives', 'imgPhoto86578', 'imgPhoto86586', 'imgPhoto86587',
  'imgPhoto86588', 'imgPhoto86611', 'imgPhoto86694', 'imgPhoto86723', 'imgSky1',
  'imgPhoto86738', 'imgZero2Hero', 'imgPhoto86739', 'imgPhoto86742', 'imgPhoto86760',
  'imgFreeDivingJpg', 'imgPhoto86761', 'imgPhoto86765', 'imgPhoto86771'
];

galleryPhotos.forEach((varName, idx) => {
  // Use high-res Cloudinary gallery URLs
  const cUrl = `https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scuba_Diving.webp`;
  const regex = new RegExp(`import\\s+${varName}\\s+from[^\n\r]+`);
  content = content.replace(regex, `const ${varName} = '${cUrl}'`);
});

fs.writeFileSync('TheDiveVillage-Frontend/Frontend/src/data/servicesData.js', content, 'utf8');
console.log('servicesData.js successfully converted to Cloudinary URLs!');
