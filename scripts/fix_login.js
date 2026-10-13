import fs from 'fs';
import path from 'path';

const file = 'TheDiveVillage-Frontend/Frontend/src/pages/Login.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /import vidBarracuda from ['"][^'"]+['"]/,
  "const vidBarracuda = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/baracuda.mp4'"
);
fs.writeFileSync(file, content, 'utf8');
console.log('Login.jsx successfully updated!');
