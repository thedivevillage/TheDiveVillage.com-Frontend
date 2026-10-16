/**
 * Centralized Media & CDN Configuration for The Dive Village (.com)
 * Standardized across Cloudinary (Images/GLB) and Cloudflare R2 (Videos/HLS).
 */

export const MEDIA_CONFIG = {
  cloudinary: {
    cloudName: 'q7b4kjd9',
    secondaryCloudName: 'qvbunv8y',
    baseUrl: 'https://res.cloudinary.com/q7b4kjd9/',
    imageUploadPrefix: 'https://res.cloudinary.com/q7b4kjd9/image/upload/',
    defaultQuality: 'auto:good',
    defaultFormat: 'f_auto',
    scaleMode: 'c_limit',
  },
  r2: {
    deliveryPrefix: '/media/TDV-Media/',
    publicDomain: 'media.thedivevillage.com',
    streams: {
      clownfish: {
        hls: '/media/TDV-Media/HLS/ClownFish/master.m3u8',
        mp4: '/media/TDV-Media/Background/ClownFish_1080p.mp4',
        raw: '/media/TDV-Media/Background/ClownFish.mp4',
      },
      barracuda: {
        hls: '/media/TDV-Media/HLS/baracuda/master.m3u8',
        mp4: '/media/TDV-Media/Background/baracuda_1080p.mp4',
        raw: '/media/TDV-Media/Background/baracuda.mp4',
      },
      turtle: {
        hls: '/media/TDV-Media/HLS/Turtle/master.m3u8',
        mp4: '/media/TDV-Media/Background/Turtle.mp4',
        raw: '/media/TDV-Media/Background/Turtle.mp4',
      },
      nightDive: {
        hls: '/media/TDV-Media/HLS/Night_Dive/master.m3u8',
        mp4: '/media/TDV-Media/Background/Night_Dive.mp4',
        raw: '/media/TDV-Media/Background/Night_Dive.mp4',
      },
      audio: '/media/TDV-Media/Audio/Audio.mp3',
    },
  },
  presets: {
    thumb_sm: { width: 100, quality: 'auto:good' },
    thumb_md: { width: 240, quality: 'auto:good' },
    card: { width: 600, quality: 'auto:good' },
    gallery: { width: 960, quality: 'auto:good' },
    hero: { width: 1600, quality: 'auto:good' },
    magnifier: { width: 2000, quality: 'auto:best' },
  },
  lqip: {
    width: 40,
    quality: 'low',
    blur: 200,
  },
  modelViewer: {
    maxDpr: 1.5,
    scriptUrl: 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js',
    loading: 'lazy',
    reveal: 'interaction',
  },
  threeD: {
    targetFps: 60,
    frameBudgetMs: 16.67,
    maxDpr: 1.5,
  },
}
