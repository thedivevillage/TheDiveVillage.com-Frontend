/**
 * Route & Media Prefetcher
 * Prefetches the initial byte fragments of the top service videos
 * on hover / idle so that video playback begins in 0ms on page entry.
 */

const prefetchedUrls = new Set()

const TOP_SERVICE_VIDEOS = [
  'https://media.thedivevillage.com/TDV-Media/Services/Try_Dive.mp4',
  'https://media.thedivevillage.com/TDV-Media/Services/Discover_Scuba_Dive_Lite.mp4',
  'https://media.thedivevillage.com/TDV-Media/Services/Discover_Scuba_Dive.mp4',
  'https://media.thedivevillage.com/TDV-Media/Services/Bubblemaker.mp4',
  'https://media.thedivevillage.com/TDV-Media/Services/Additional_dive_ater_discover_scuba_dive.mp4',
]

export function prefetchVideoChunk(url, bytes = '0-327680') {
  if (typeof window === 'undefined' || prefetchedUrls.has(url)) return
  prefetchedUrls.add(url)

  try {
    fetch(url, {
      method: 'GET',
      headers: { Range: `bytes=${bytes}` },
      cache: 'force-cache',
    }).catch(() => {})
  } catch (e) {}
}

export function prefetchServicesMedia() {
  TOP_SERVICE_VIDEOS.forEach((vid) => prefetchVideoChunk(vid))
}

export function prefetchRoute(to) {
  if (!to || typeof window === 'undefined') return
  const path = typeof to === 'string' ? to.toLowerCase() : ''

  if (path.includes('services')) {
    prefetchServicesMedia()
  } else if (path.includes('book-us') || path.includes('book')) {
    try {
      fetch('/data/dive-sites.json', { cache: 'force-cache' }).catch(() => {})
    } catch (_) {}
  }
}

export function initIdlePrefetching() {
  if (typeof window === 'undefined') return
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 2500))
  schedule(() => {
    // Lightly warm up top assets when idle
    prefetchVideoChunk(TOP_SERVICE_VIDEOS[0])
    try {
      fetch('/data/dive-sites.json', { cache: 'force-cache' }).catch(() => {})
    } catch (_) {}
  })
}
