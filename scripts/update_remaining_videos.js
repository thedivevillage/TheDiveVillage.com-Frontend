import fs from 'fs';

// 1. Update Contact.jsx
let contact = fs.readFileSync('TheDiveVillage-Frontend/Frontend/src/pages/Contact.jsx', 'utf8');
contact = contact.replace(
  /import compiledNightDiveVideo[^\n\r]+/,
  "const compiledNightDiveVideo = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/Night_Dive.mp4'"
);
contact = contact.replace(
  /import bookVideo[^\n\r]+/,
  "const bookVideo = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/baracuda.mp4'"
);
fs.writeFileSync('TheDiveVillage-Frontend/Frontend/src/pages/Contact.jsx', contact, 'utf8');
console.log('Contact.jsx updated.');

// 2. Update InteractiveVideoSphere.jsx
let sphere = fs.readFileSync('TheDiveVillage-Frontend/Frontend/src/components/InteractiveVideoSphere.jsx', 'utf8');
sphere = sphere.replace(
  /import clownfishVideo[^\n\r]+/,
  "const clownfishVideo = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/ClownFish.mp4'"
);
fs.writeFileSync('TheDiveVillage-Frontend/Frontend/src/components/InteractiveVideoSphere.jsx', sphere, 'utf8');
console.log('InteractiveVideoSphere.jsx updated.');

// 3. Update Preloader.jsx
let preloader = fs.readFileSync('TheDiveVillage-Frontend/Frontend/src/components/Preloader.jsx', 'utf8');
preloader = preloader.replace(
  /import preloaderVideoLocal[^\n\r]+/,
  "const preloaderVideoLocal = 'https://res.cloudinary.com/bbgt5nk7/video/upload/v1790244018/dive-village/ui-videos/preloader_mp4.mp4'"
);
fs.writeFileSync('TheDiveVillage-Frontend/Frontend/src/components/Preloader.jsx', preloader, 'utf8');
console.log('Preloader.jsx updated.');

// 4. Update mediaReadyManager.js
let mediaReady = fs.readFileSync('TheDiveVillage-Frontend/Frontend/src/utils/mediaReadyManager.js', 'utf8');
mediaReady = mediaReady.replace(
  /import clownfishVideo[^\n\r]+/,
  "const clownfishVideo = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/ClownFish.mp4'"
);
fs.writeFileSync('TheDiveVillage-Frontend/Frontend/src/utils/mediaReadyManager.js', mediaReady, 'utf8');
console.log('mediaReadyManager.js updated.');
