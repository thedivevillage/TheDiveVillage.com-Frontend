/**
 * Centralized Media & CDN Configuration for The Dive Village (.com)
 * (Optimization presets, LQIP, and throttles removed)
 */

export const MEDIA_CONFIG = {
  cloudinary: {
    cloudName: 'q7b4kjd9',
    secondaryCloudName: 'qvbunv8y',
    baseUrl: 'https://res.cloudinary.com/q7b4kjd9/',
    imageUploadPrefix: 'https://res.cloudinary.com/q7b4kjd9/image/upload/',
  },
  r2: {
    deliveryPrefix: 'https://media.thedivevillage.com/TDV-Media/',
    publicDomain: 'media.thedivevillage.com',
    streams: {
      clownfish: {
        hls: 'https://media.thedivevillage.com/TDV-Media/HLS/ClownFish/master.m3u8',
        mp4: 'https://media.thedivevillage.com/TDV-Media/Background/ClownFish.mp4',
        raw: 'https://media.thedivevillage.com/TDV-Media/Background/ClownFish.mp4',
      },
      barracuda: {
        hls: 'https://media.thedivevillage.com/TDV-Media/HLS/baracuda/master.m3u8',
        mp4: 'https://media.thedivevillage.com/TDV-Media/Background/baracuda.mp4',
        raw: 'https://media.thedivevillage.com/TDV-Media/Background/baracuda.mp4',
      },
      turtle: {
        hls: 'https://media.thedivevillage.com/TDV-Media/HLS/Turtle/master.m3u8',
        mp4: 'https://media.thedivevillage.com/TDV-Media/Background/Turtle.mp4',
        raw: 'https://media.thedivevillage.com/TDV-Media/Background/Turtle.mp4',
      },
      nightDive: {
        hls: 'https://media.thedivevillage.com/TDV-Media/HLS/Night_Dive/master.m3u8',
        mp4: 'https://media.thedivevillage.com/TDV-Media/Background/Night_Dive.mp4',
        raw: 'https://media.thedivevillage.com/TDV-Media/Background/Night_Dive.mp4',
      },
      audio: 'https://media.thedivevillage.com/TDV-Media/Audio/Audio.mp3',
    },
    ui: {
      cursor: 'https://media.thedivevillage.com/TDV-Media/UI/cursor.webm',
      preloader: 'https://media.thedivevillage.com/TDV-Media/UI/preloader.mp4',
    },
  },
  presets: {},
  lqip: null,
  modelViewer: {
    scriptUrl: 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js',
    loading: 'auto',
    reveal: 'auto',
  },
  threeD: {
    targetFps: 60,
    frameBudgetMs: 16.67,
    maxDpr: 2,
  },
}
