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

    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex');
    const credentialScope = dateStamp + '/auto/s3/aws4_request';
    const stringToSign = 'AWS4-HMAC-SHA256\n' + amzDate + '\n' + credentialScope + '\n' + canonicalRequestHash;

    const signingKey = getSignatureKey(r2Creds.secretAccessKey, dateStamp, 'auto', 's3');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

    const authHeader = 'AWS4-HMAC-SHA256 Credential=' + r2Creds.accessKeyId + '/' + credentialScope + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature;

    const fileStream = fs.createWriteStream(outputPath);
    const req = https.request({
      hostname: host,
      path: canonicalUri,
      method: 'GET',
      headers: {
        ...normHeaders,
        'Authorization': authHeader
      }
    }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed with status ${res.statusCode} for ${key}`));
      }
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(() => resolve(outputPath));
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function putObject(key, bodyBuffer, contentType = 'video/mp4') {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const host = new URL(r2Creds.endpoint).host;

    const payloadHash = crypto.createHash('sha256').update(bodyBuffer).digest('hex');
    const canonicalUri = '/' + r2Creds.bucket + '/' + key.split('/').map(encodeURIComponent).join('/');

    const normHeaders = {
      'content-length': bodyBuffer.length.toString(),
      'content-type': contentType,
      'host': host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate
    };

    const headerKeys = Object.keys(normHeaders).sort();
    const canonicalHeaders = headerKeys.map(k => k + ':' + normHeaders[k] + '\n').join('');
    const signedHeaders = headerKeys.join(';');

    const canonicalRequest = [
      'PUT',
      canonicalUri,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');

    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex');
    const credentialScope = dateStamp + '/auto/s3/aws4_request';
    const stringToSign = 'AWS4-HMAC-SHA256\n' + amzDate + '\n' + credentialScope + '\n' + canonicalRequestHash;

    const signingKey = getSignatureKey(r2Creds.secretAccessKey, dateStamp, 'auto', 's3');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

    const authHeader = 'AWS4-HMAC-SHA256 Credential=' + r2Creds.accessKeyId + '/' + credentialScope + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature;

    const req = https.request({
      hostname: host,
      path: canonicalUri,
      method: 'PUT',
      headers: {
        ...normHeaders,
        'Authorization': authHeader
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });
    req.on('error', reject);
    req.write(bodyBuffer);
    req.end();
  });
}

function verifyMoovPosition(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(1024 * 64);
  fs.readSync(fd, buffer, 0, buffer.length, 0);
  fs.closeSync(fd);
  const moovIdx = buffer.indexOf('moov');
  const mdatIdx = buffer.indexOf('mdat');
  return {
    sizeKb: (fs.statSync(filePath).size / 1024).toFixed(1),
    moovOffset: moovIdx,
    mdatOffset: mdatIdx,
    isFastStart: moovIdx !== -1 && (mdatIdx === -1 || moovIdx < mdatIdx)
  };
}

const tempDir = path.resolve(__dirname, 'temp_batch_proc');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const publicPreviewDir = path.resolve(__dirname, '../public/media/TDV-Media/Services/previews');
if (!fs.existsSync(publicPreviewDir)) {
  fs.mkdirSync(publicPreviewDir, { recursive: true });
}

const publicBaseDir = path.resolve(__dirname, '../public/media');

// The list of services to process that need 3s preview + FastStart
const itemsToProcess = [
  // Snorkeling
  { id: 'reefexplorer', r2Key: 'TDV-Media/Services/reefexplorer.mp4', previewKey: 'TDV-Media/Services/previews/reefexplorer_preview.mp4' },
  { id: 'oceanexplorer', r2Key: 'TDV-Media/Services/oceanexplorer.mp4', previewKey: 'TDV-Media/Services/previews/oceanexplorer_preview.mp4' },

  // Courses
  { id: 'skindiver', r2Key: 'TDV-Media/Services/Skin_Diver.mp4', previewKey: 'TDV-Media/Services/previews/skindiver_preview.mp4' },
  { id: 'scubadiver', r2Key: 'TDV-Media/Services/Scuba_Diver.mp4', previewKey: 'TDV-Media/Services/previews/scubadiver_preview.mp4' },
  { id: 'openwater', r2Key: 'TDV-Media/Services/Open_Water_Diver.mp4', previewKey: 'TDV-Media/Services/previews/openwater_preview.mp4' },
  { id: 'adventurediver', r2Key: 'TDV-Media/Services/AdventureDiver.mp4', previewKey: 'TDV-Media/Services/previews/adventurediver_preview.mp4' },
  { id: 'advancedow', r2Key: 'TDV-Media/Services/Advanced_Open_Water.mp4', previewKey: 'TDV-Media/Services/previews/advancedow_preview.mp4' },
  { id: 'efr', r2Key: 'TDV-Media/Services/EFR_Primary_Secondary_Care.mp4', previewKey: 'TDV-Media/Services/previews/efr_preview.mp4' },
  { id: 'rescuediver', r2Key: 'TDV-Media/Services/Rescue_Diver.mp4', previewKey: 'TDV-Media/Services/previews/rescuediver_preview.mp4' },
  { id: 'reactivate', r2Key: 'TDV-Media/Services/Reactivate_with_dive.mp4', previewKey: 'TDV-Media/Services/previews/reactivate_preview.mp4' },
  { id: 'fullrefresher', r2Key: 'TDV-Media/Services/Full_Refresher_with_dive.mp4', previewKey: 'TDV-Media/Services/previews/fullrefresher_preview.mp4' },
  { id: 'literefresher', r2Key: 'TDV-Media/Services/Lite_Refresher.mp4', previewKey: 'TDV-Media/Services/previews/literefresher_preview.mp4' },

  // Specialities
  { id: 'buoyancy', r2Key: 'TDV-Media/Services/Peak_Perormance_Buoyancy.mp4', previewKey: 'TDV-Media/Services/previews/buoyancy_preview.mp4' },
  { id: 'projectaware', r2Key: 'TDV-Media/Services/Project_AWARE.mp4', previewKey: 'TDV-Media/Services/previews/projectaware_preview.mp4' },
  { id: 'deepdiver', r2Key: 'TDV-Media/Services/DeepDiver.mp4', previewKey: 'TDV-Media/Services/previews/deepdiver_preview.mp4' },
  { id: 'wreckdiver', r2Key: 'TDV-Media/Services/Wreck_Diver.mp4', previewKey: 'TDV-Media/Services/previews/wreckdiver_preview.mp4' },
  { id: 'nightdiver', r2Key: 'TDV-Media/Services/Night_Diver.mp4', previewKey: 'TDV-Media/Services/previews/nightdiver_preview.mp4' },
  { id: 'nitrox', r2Key: 'TDV-Media/Services/Enriched_Air_Nitrox.mp4', previewKey: 'TDV-Media/Services/previews/nitrox_preview.mp4' },
  { id: 'driftdiver', r2Key: 'TDV-Media/Services/Drift_Dive.mp4', previewKey: 'TDV-Media/Services/previews/driftdiver_preview.mp4' },

  // Combos
  { id: 'dsdow', r2Key: 'TDV-Media/Services/Discover_Scuba_Dive_Open_Water.mp4', previewKey: 'TDV-Media/Services/previews/dsdow_preview.mp4' },
  { id: 'owadvanced', r2Key: 'TDV-Media/Services/Open_water_Advanced_Openwater.mp4', previewKey: 'TDV-Media/Services/previews/owadvanced_preview.mp4' },
  { id: 'efrrescue', r2Key: 'TDV-Media/Services/Emergency_First_Response_Rescue_Diver.mp4', previewKey: 'TDV-Media/Services/previews/efrrescue_preview.mp4' },
  { id: 'fundives', r2Key: 'TDV-Media/Extras for Gallery/Hawksbill_Sea_Turtle_2.mp4', previewKey: 'TDV-Media/Services/previews/fundives_preview.mp4' },

  // Pro Courses
  { id: 'divemaster', r2Key: 'TDV-Media/Services/DiveMaster.mp4', previewKey: 'TDV-Media/Services/previews/divemaster_preview.mp4' },
  { id: 'efrrescuedm', r2Key: 'TDV-Media/Services/Emergency_First_Response_Rescue_DiveMaster.mp4', previewKey: 'TDV-Media/Services/previews/efrrescuedm_preview.mp4' },
  { id: 'efrrescuedmprereq', r2Key: 'TDV-Media/Services/Emergency_First_Response_Rescue_DiveMaster_Prequesites.mp4', previewKey: 'TDV-Media/Services/previews/efrrescuedmprereq_preview.mp4' },
  { id: 'zerotohero', r2Key: 'TDV-Media/Services/Zero_to_hero_-_Open_Water_to_Dive_Master.mp4', previewKey: 'TDV-Media/Services/previews/zerotohero_preview.mp4' },

  // Freediving
  { id: 'basicfreediver', r2Key: 'TDV-Media/Services/BasicFreeDiver.mp4', previewKey: 'TDV-Media/Services/previews/basicfreediver_preview.mp4' },
  { id: 'freediver', r2Key: 'TDV-Media/Services/Freediver.mp4', previewKey: 'TDV-Media/Services/previews/freediver_preview.mp4' },

  // Surfing
  { id: 'surfacademy', r2Key: 'TDV-Media/Services/3_Day_Surf_Academy_Course.mp4', previewKey: 'TDV-Media/Services/previews/surfacademy_preview.mp4' }
];

console.log(`Starting Batch Processing for ${itemsToProcess.length} services...`);

let processedCount = 0;
for (const item of itemsToProcess) {
  processedCount++;
  console.log(`\n[${processedCount}/${itemsToProcess.length}] Processing ${item.id} (${item.r2Key})...`);
  const rawFile = path.join(tempDir, `${item.id}_raw.mp4`);
  const previewFile = path.join(tempDir, `${item.id}_preview.mp4`);
  const faststartMasterFile = path.join(tempDir, `${item.id}_faststart.mp4`);

  // Ensure target public directories exist
  const localPreviewTarget = path.join(publicBaseDir, item.previewKey);
  fs.mkdirSync(path.dirname(localPreviewTarget), { recursive: true });
  const localMasterTarget = path.join(publicBaseDir, item.r2Key);
  fs.mkdirSync(path.dirname(localMasterTarget), { recursive: true });

  // 1. Download raw file from R2 if not already cached
  if (!fs.existsSync(rawFile) || fs.statSync(rawFile).size < 10000) {
    console.log(`Downloading: ${item.r2Key}...`);
    try {
      await downloadR2(item.r2Key, rawFile);
    } catch (e) {
      console.error(`Failed downloading ${item.r2Key}:`, e.message);
      continue;
    }
  }

  // 2. Generate 3-second micro-preview (< 100 KB) with moov at byte 0
  if (!fs.existsSync(localPreviewTarget) || fs.statSync(localPreviewTarget).size < 1000) {
    console.log(`Generating 3s preview...`);
    try {
      const previewArgs = [
        '-y',
        '-ss', '0',
        '-t', '3',
        '-i', rawFile,
        '-vf', 'scale=360:-2,pad=ceil(iw/2)*2:ceil(ih/2)*2',
        '-c:v', 'libx264',
        '-profile:v', 'baseline',
        '-level', '3.0',
        '-pix_fmt', 'yuv420p',
        '-crf', '28',
        '-preset', 'fast',
        '-an',
        '-movflags', '+faststart',
        previewFile
      ];
      execFileSync(ffmpegPath, previewArgs, { stdio: 'pipe' });
      fs.copyFileSync(previewFile, localPreviewTarget);
      const previewBytes = fs.readFileSync(localPreviewTarget);
      const stat = verifyMoovPosition(localPreviewTarget);
      console.log(`Preview ready: ${stat.sizeKb} KB (FastStart: ${stat.isFastStart})`);

      // Upload preview to R2
      await putObject(item.previewKey, previewBytes, 'video/mp4');
      console.log(`Uploaded preview to R2: ${item.previewKey}`);
    } catch (err) {
      console.error(`Error generating preview for ${item.id}:`, err.message);
    }
  } else {
    console.log(`Preview already exists locally: ${localPreviewTarget}`);
  }

  // 3. FastStart Master File (Method D)
  if (!fs.existsSync(localMasterTarget) || fs.statSync(localMasterTarget).size < 10000) {
    console.log(`Applying FastStart to master file...`);
    try {
      const fsArgs = [
        '-y',
        '-i', rawFile,
        '-c', 'copy',
        '-movflags', '+faststart',
        faststartMasterFile
      ];
      execFileSync(ffmpegPath, fsArgs, { stdio: 'pipe' });
      fs.copyFileSync(faststartMasterFile, localMasterTarget);
      const fsBytes = fs.readFileSync(localMasterTarget);
      const stat = verifyMoovPosition(localMasterTarget);
      console.log(`Master FastStart ready: ${stat.sizeKb} KB (FastStart: ${stat.isFastStart})`);

      // Upload faststart master back to R2
      await putObject(item.r2Key, fsBytes, 'video/mp4');
      console.log(`Uploaded FastStart master to R2: ${item.r2Key}`);
    } catch (err) {
      console.error(`Error faststarting master for ${item.id}:`, err.message);
    }
  } else {
    console.log(`Master already exists locally: ${localMasterTarget}`);
  }
}

console.log('\n================ BATCH PROCESSING COMPLETE ================');
