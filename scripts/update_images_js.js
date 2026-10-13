import fs from 'fs';

let content = fs.readFileSync('TheDiveVillage-Frontend/Frontend/src/utils/images.js', 'utf8');

// Replace local imports p1, p3, p4, p6, p7, p8, p9, p10, p11, p12
const pImports = [
  { name: 'p1', url: 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458188/TDV-Media/Extras%20for%20Gallery/Scuba_Diving.webp' },
  { name: 'p3', url: 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458178/TDV-Media/Extras%20for%20Gallery/Open_Water_Scuba_Diving.webp' },
  { name: 'p4', url: 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458189/TDV-Media/Extras%20for%20Gallery/Scubadiving_2.webp' },
  { name: 'p6', url: 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458191/TDV-Media/Extras%20for%20Gallery/Scubadiving.webp' },
  { name: 'p7', url: 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458192/TDV-Media/Extras%20for%20Gallery/Sea_fan.webp' },
  { name: 'p8', url: 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458193/TDV-Media/Extras%20for%20Gallery/Shoal.webp' },
  { name: 'p9', url: 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458204/TDV-Media/Extras%20for%20Gallery/Sunset.jpg' },
  { name: 'p10', url: 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791457833/TDV-Media/Extras%20for%20Gallery/Banded_Coral_Shrimp.webp' },
  { name: 'p11', url: 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458209/TDV-Media/Extras%20for%20Gallery/Varicose_Wart_Slug.webp' },
  { name: 'p12', url: 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458221/TDV-Media/Extras%20for%20Gallery/Yellowback_fusiliers.webp' }
];

pImports.forEach(item => {
  const reg = new RegExp(`import\\s+${item.name}\\s+from[^\n\r]+`);
  content = content.replace(reg, `const ${item.name} = '${item.url}';`);
});

// Also replace PANEL_IMAGES
const panelCloudinaryUrls = [
  'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452129/TDV-Images/1Threadfin_Butterflyfish.webp',
  'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452131/TDV-Images/2Lionfish.webp',
  'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452132/TDV-Images/3Crown_Jellyfish.webp',
  'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452133/TDV-Images/4Blue_and_Gold_Fusilier.webp',
  'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452134/TDV-Images/5Bubble_Coral.webp',
  'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452136/TDV-Images/6Crown_of_thorns_Starfish.webp',
  'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452137/TDV-Images/7Toadstool_Leather_Coral.webp',
  'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452138/TDV-Images/8Feather_Star_2.webp',
  'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452139/TDV-Images/9Giant_Clam.webp',
  'https://res.cloudinary.com/qvbunv8y/image/upload/v1791452128/TDV-Images/10Greenfish_Sea_Cucumber.webp'
];

content = content.replace(
  /const panelModules = import\.meta\.glob[^\n\r]+[\s\S]*?export const PANEL_IMAGES = Object\.values\(panelModules\)/,
  `export const PANEL_IMAGES = ${JSON.stringify(panelCloudinaryUrls, null, 2)}`
);

fs.writeFileSync('TheDiveVillage-Frontend/Frontend/src/utils/images.js', content, 'utf8');
console.log('images.js successfully converted to Cloudinary URLs!');
