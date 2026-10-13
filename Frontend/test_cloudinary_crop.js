import https from 'node:https';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const tests = [
  { name: 'crop_ar', url: 'https://res.cloudinary.com/qvbunv8y/video/upload/c_crop,ar_9:16,g_center/v1791458554/TDV-Media/Services/AdventureDiver.mp4' },
  { name: 'crop_coord', url: 'https://res.cloudinary.com/qvbunv8y/video/upload/c_crop,w_608,h_1080,x_656,y_0/v1791458554/TDV-Media/Services/AdventureDiver.mp4' },
  { name: 'sponge_crop', url: 'https://res.cloudinary.com/qvbunv8y/video/upload/c_crop,w_608,h_1080,x_656,y_0/v1791458098/TDV-Media/Extras%20for%20Gallery/Giant_Barrel_Sponge.mp4' },
  { name: 'turtle_crop', url: 'https://res.cloudinary.com/qvbunv8y/video/upload/c_crop,w_608,h_1080,x_656,y_0/v1791458106/TDV-Media/Extras%20for%20Gallery/Hawksbill_Sea_Turtle_2.mp4' }
];

function download(u, file) {
  return new Promise((resolve) => {
    https.get(u, (res) => {
      console.log(u, 'HTTP Status:', res.statusCode);
      if (res.statusCode !== 200) return resolve(false);
      const stream = fs.createWriteStream(file);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(true); });
    }).on('error', () => resolve(false));
  });
}

for (const t of tests) {
  const f = `test_${t.name}.mp4`;
  const ok = await download(t.url, f);
  if (ok) {
    try {
      const out = execSync(`"${ffmpegPath}" -i "${f}" 2>&1`, { encoding: 'utf8' });
      const resMatch = out.match(/Stream #.*Video:.* (\d{3,4})x(\d{3,4})/);
      console.log(t.name, 'RESOLUTION:', resMatch ? resMatch[0] : 'unknown');
    } catch (e) {
      console.log(t.name, 'error');
    }
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
}
