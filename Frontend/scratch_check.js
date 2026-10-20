const fs = require('fs');
const content = fs.readFileSync('g:/test_about.js', 'utf8');
const urls = content.match(/https:\/\/[^'"\s]+\.mp4/g);
console.log('URLs:', urls);
