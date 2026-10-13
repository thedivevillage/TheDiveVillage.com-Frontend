import fs from 'fs';

let content = fs.readFileSync('TheDiveVillage-Frontend/Frontend/src/data/servicesData.js', 'utf8');

// Replace Scuba_Diving.webp occurrences with Scubadiving.webp
content = content.replace(
  /TDV-Media\/Extras%20for%20Gallery\/Scuba_Diving\.webp/g,
  'TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
);

// Replace Scuba_Diver.mp4 in Extras with TDV-Media/Services/Scuba_Diver.mp4
content = content.replace(
  /const extScubaDiverVid = 'https:\/\/res\.cloudinary\.com\/qvbunv8y\/video\/upload\/v1791458185\/TDV-Media\/Extras%20for%20Gallery\/Scuba_Diver\.mp4';/,
  "const extScubaDiverVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791458832/TDV-Media/Services/Scuba_Diver.mp4';"
);

fs.writeFileSync('TheDiveVillage-Frontend/Frontend/src/data/servicesData.js', content, 'utf8');
console.log('servicesData.js URLs updated.');

// Also update images.js and galleryData.js for Scuba_Diving.webp
let images = fs.readFileSync('TheDiveVillage-Frontend/Frontend/src/utils/images.js', 'utf8');
images = images.replace(
  /TDV-Media\/Extras%20for%20Gallery\/Scuba_Diving\.webp/g,
  'TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
);
fs.writeFileSync('TheDiveVillage-Frontend/Frontend/src/utils/images.js', images, 'utf8');
console.log('images.js URLs updated.');

let gallery = fs.readFileSync('TheDiveVillage-Frontend/Frontend/src/utils/galleryData.js', 'utf8');
gallery = gallery.replace(
  /TDV-Media\/Extras%20for%20Gallery\/Scuba_Diving\.webp/g,
  'TDV-Media/Extras%20for%20Gallery/Scubadiving.webp'
);
fs.writeFileSync('TheDiveVillage-Frontend/Frontend/src/utils/galleryData.js', gallery, 'utf8');
console.log('galleryData.js URLs updated.');
