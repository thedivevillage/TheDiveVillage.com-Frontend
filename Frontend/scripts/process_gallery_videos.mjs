import https from 'node:https';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const env = {};
const envPaths = [
  path.resolve(__dirname, '../../../TheDiveVillage.com-Backend/server/.env'),
  path.resolve(__dirname, '../.env')
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        const k = trimmed.substring(0, eq).trim();
        let v = trimmed.substring(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (!env[k]) env[k] = v;
      }
    });
  }
}

const r2Creds = {
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  bucket: env.R2_BUCKET_NAME || 'thedivevillage-media',
  endpoint: env.R2_ENDPOINT || 'https://e89adf53cebe848fd4e126c6b9d88d0c.r2.cloudflarestorage.com'
};

function hmac(key, string) {
  return crypto.createHmac('sha256', key).update(string, 'utf8').digest();
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = hmac('AWS4' + key, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  return hmac(kService, 'aws4_request');
}

function downloadR2(key, outputPath) {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const host = new URL(r2Creds.endpoint).host;

    const canonicalUri = '/' + r2Creds.bucket + '/' + key.split('/').map(encodeURIComponent).join('/');

    const normHeaders = {
      'host': host,
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
      'x-amz-date': amzDate
    };

    const headerKeys = Object.keys(normHeaders).sort();
    const canonicalHeaders = headerKeys.map(k => k + ':' + normHeaders[k] + '\n').join('');
    const signedHeaders = headerKeys.join(';');

    const canonicalRequest = [
      'GET',
      canonicalUri,
      '',
      canonicalHeaders,
      signedHeaders,
      'UNSIGNED-PAYLOAD'
    ].join('\n');

    const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    const signingKey = getSignatureKey(r2Creds.secretAccessKey, dateStamp, 'auto', 's3');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const authHeader = `AWS4-HMAC-SHA256 Credential=${r2Creds.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const options = {
      hostname: host,
      path: canonicalUri,
      method: 'GET',
      headers: {
        ...normHeaders,
        'Authorization': authHeader
      }
    };

    const fileStream = fs.createWriteStream(outputPath);
    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${key}: HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(() => resolve(outputPath));
      });
    });

    req.on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });

    req.end();
  });
}

const GALLERY_VIDEOS = [
  { name: 'A_Moray_Eel_in_a_Giant_Barrel_Sponge.mp4', key: 'TDV-Media/Extras for Gallery/A_Moray_Eel_in_a_Giant_Barrel_Sponge.mp4' },
  { name: 'A_Seafan.mp4', key: 'TDV-Media/Extras for Gallery/A_Seafan.mp4' },
  { name: 'Beach_View.mp4', key: 'TDV-Media/Extras for Gallery/Beach_View.mp4' },
  { name: 'Big_Eye_Trevally.mp4', key: 'TDV-Media/Extras for Gallery/Big_Eye_Trevally.mp4' },
  { name: 'Bluespotted_Stingray.mp4', key: 'TDV-Media/Extras for Gallery/Bluespotted_Stingray.mp4' },
  { name: 'Clownfish_and_Sea_Anemone.mp4', key: 'TDV-Media/Extras for Gallery/Clownfish_and_Sea_Anemone.mp4' },
  { name: 'Giant_Barrel_Sponge.mp4', key: 'TDV-Media/Extras for Gallery/Giant_Barrel_Sponge.mp4' },
  { name: 'Hawksbill_Sea_Turtle_2.mp4', key: 'TDV-Media/Extras for Gallery/Hawksbill_Sea_Turtle_2.mp4' },
  { name: 'Leaf_Scorpian_fish.mp4', key: 'TDV-Media/Extras for Gallery/Leaf_Scorpian_fish.mp4' },
  { name: 'Magnificent_Sea_Anemone.mp4', key: 'TDV-Media/Extras for Gallery/Magnificent_Sea_Anemone.mp4' },
  { name: 'Manta_Ray_2.mp4', key: 'TDV-Media/Extras for Gallery/Manta_Ray_2.mp4' },
  { name: 'Marbled_Stingray.mp4', key: 'TDV-Media/Extras for Gallery/Marbled_Stingray.mp4' },
  { name: 'Silver_Barracudas.mp4', key: 'TDV-Media/Extras for Gallery/Silver_Barracudas.mp4' },
  { name: 'Whale_Shark_2.mp4', key: 'TDV-Media/Extras for Gallery/Whale_Shark_2.mp4' },
  { name: 'Whale_Shark.mp4', key: 'TDV-Media/Extras for Gallery/Whale_Shark.mp4' },
];

const targetDir = path.resolve(__dirname, '../public/media/TDV-Media/Extras for Gallery');
const previewsDir = path.join(targetDir, 'previews');
const postersDir = path.join(targetDir, 'posters');

fs.mkdirSync(targetDir, { recursive: true });
fs.mkdirSync(previewsDir, { recursive: true });
fs.mkdirSync(postersDir, { recursive: true });

async function processAll() {
  console.log(`Starting processing of ${GALLERY_VIDEOS.length} gallery videos...`);

  for (const item of GALLERY_VIDEOS) {
    const baseName = item.name.replace('.mp4', '');
    const localMaster = path.join(targetDir, item.name);
    const localPreview = path.join(previewsDir, `${baseName}_preview.mp4`);
    const localPoster = path.join(postersDir, `${baseName}_thumb.webp`);

    console.log(`\n=== Processing: ${item.name} ===`);

    // 1. Download if not exists
    if (!fs.existsSync(localMaster) || fs.statSync(localMaster).size < 1000) {
      console.log(`Downloading ${item.key} from R2...`);
      try {
        await downloadR2(item.key, localMaster);
        console.log(`Downloaded: ${(fs.statSync(localMaster).size / 1024 / 1024).toFixed(2)} MB`);
      } catch (e) {
        console.error(`Failed downloading ${item.name}:`, e.message);
        continue;
      }
    } else {
      console.log(`Master already exists: ${(fs.statSync(localMaster).size / 1024 / 1024).toFixed(2)} MB`);
    }

    // 2. Generate First-Frame Poster (.webp)
    if (!fs.existsSync(localPoster) || fs.statSync(localPoster).size === 0) {
      console.log(`Generating WebP first-frame poster...`);
      try {
        execFileSync(ffmpegPath, [
          '-y',
          '-ss', '0',
          '-i', localMaster,
          '-vframes', '1',
          '-vf', 'scale=720:-2',
          localPoster
        ], { stdio: 'pipe' });
        console.log(`Poster created: ${(fs.statSync(localPoster).size / 1024).toFixed(1)} KB`);
      } catch (e) {
        console.error(`Poster creation failed for ${item.name}:`, e.message);
      }
    } else {
      console.log(`Poster already exists.`);
    }

    // 3. Generate 3-second micro-preview (.mp4)
    if (!fs.existsSync(localPreview) || fs.statSync(localPreview).size === 0) {
      console.log(`Generating 3-second preview micro-video...`);
      try {
        execFileSync(ffmpegPath, [
          '-y',
          '-t', '3',
          '-i', localMaster,
          '-vf', 'scale=360:-2,pad=ceil(iw/2)*2:ceil(ih/2)*2',
          '-c:v', 'libx264',
          '-profile:v', 'baseline',
          '-level', '3.0',
          '-pix_fmt', 'yuv420p',
          '-crf', '28',
          '-preset', 'fast',
          '-an',
          '-movflags', '+faststart',
          localPreview
        ], { stdio: 'pipe' });
        console.log(`Preview created: ${(fs.statSync(localPreview).size / 1024).toFixed(1)} KB`);
      } catch (e) {
        console.error(`Preview creation failed for ${item.name}:`, e.message);
      }
    } else {
      console.log(`Preview already exists.`);
    }
  }

  console.log(`\nALL GALLERY VIDEOS PROCESSED SUCCESSFULLY!`);
}

processAll();
