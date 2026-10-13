import https from 'node:https';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const u = 'https://res.cloudinary.com/qvbunv8y/video/upload/c_crop,w_608,h_1080,x_656,y_0/v1791458554/TDV-Media/Services/AdventureDiver.mp4';
const f = 'crop_check.mp4';

await new Promise((resolve) => {
  https.get(u, (res) => {
    console.log('Status:', res.statusCode, 'Headers:', res.headers['content-type']);
    const stream = fs.createWriteStream(f);
    res.pipe(stream);
    stream.on('finish', () => { stream.close(); resolve(); });
  });
});

try {
  const out = execSync(`"${ffmpegPath}" -i "${f}" 2>&1`, { encoding: 'utf8' });
  console.log(out.split('\n').filter(l => l.includes('Stream')).join('\n'));
} catch (e) {
  console.log(e.stdout.split('\n').filter(l => l.includes('Stream')).join('\n'));
}
if (fs.existsSync(f)) fs.unlinkSync(f);
