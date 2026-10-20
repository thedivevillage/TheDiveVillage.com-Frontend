/**
 * WebGL Lifecycle & Telemetry Tracker
 * 
 * Accurately tracks Three.js WebGLRenderer creation, disposal, active canvases,
 * and distinguishes EXPECTED navigation unmount teardowns from UNEXPECTED active scene losses.
 */

const telemetryState = {
  activeRenderers: 0,
  activeCanvases: 0,
  isIntentionalTeardown: false,
  currentScene: 'none',
  lastEvent: null,
  lossHistory: [],
}

export function setIntentionalTeardown(value) {
  telemetryState.isIntentionalTeardown = Boolean(value)
}

export function getIsIntentionalTeardown() {
  return telemetryState.isIntentionalTeardown
}

export function setCurrentScene(sceneName) {
  telemetryState.currentScene = sceneName
}

export function logRendererCreated(gl, sceneName = '360 Video Sphere') {
  telemetryState.activeRenderers++
  telemetryState.currentScene = sceneName

  const glContext = gl?.getContext ? gl.getContext() : gl
  const glVersion = glContext ? (glContext instanceof WebGL2RenderingContext ? 'WebGL 2.0' : 'WebGL 1.0') : 'Unknown'
  
  let gpuRenderer = 'Unknown'
  let gpuVendor = 'Unknown'
  try {
    const dbgExt = glContext?.getExtension('WEBGL_debug_renderer_info')
    if (dbgExt) {
      gpuRenderer = glContext.getParameter(dbgExt.UNMASKED_RENDERER_WEBGL) || 'Unknown'
      gpuVendor = glContext.getParameter(dbgExt.UNMASKED_VENDOR_WEBGL) || 'Unknown'
    }
  } catch (e) {
    // Sandboxed contexts may block unmasked info
  }

  const info = {
    scene: sceneName,
    webglVersion: glVersion,
    gpuRenderer,
    gpuVendor,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    canvasDimensions: gl?.domElement ? `${gl.domElement.width}x${gl.domElement.height}` : 'unknown',
    activeRenderers: telemetryState.activeRenderers,
    timestamp: new Date().toISOString(),
  }

  telemetryState.lastEvent = { type: 'created', ...info }
  console.info(`[WebGL Lifecycle] ✓ Renderer Created [${glVersion}] for "${sceneName}" (Total Active: ${telemetryState.activeRenderers})`, info)
  return info
}

export function logRendererDisposed(gl, sceneName = '360 Video Sphere') {
  telemetryState.activeRenderers = Math.max(0, telemetryState.activeRenderers - 1)
  const info = {
    scene: sceneName,
    activeRenderers: telemetryState.activeRenderers,
    timestamp: new Date().toISOString(),
  }
  telemetryState.lastEvent = { type: 'disposed', ...info }
  console.info(`[WebGL Lifecycle] ⏻ Renderer Cleanly Disposed for "${sceneName}" (Remaining Active: ${telemetryState.activeRenderers})`, info)
}

export function handleContextLost(event, details = {}) {
  // Always prevent default so the browser allows WebGL context restoration
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault()
  }

  const isExpected = telemetryState.isIntentionalTeardown
  const eventRecord = {
    type: 'contextlost',
    isExpected,
    scene: telemetryState.currentScene,
    timestamp: new Date().toISOString(),
    ...details,
  }

  telemetryState.lossHistory.push(eventRecord)
  telemetryState.lastEvent = eventRecord

  if (isExpected) {
    console.info('[WebGL Lifecycle] ℹ Context Lost (EXPECTED: Intentional route teardown / component unmount):', eventRecord)
  } else {
    console.warn('[WebGL Lifecycle] ⚠ Context Lost (UNEXPECTED: Loss occurred during active scene playback!):', eventRecord)
  }

  return isExpected
}

export function handleContextRestored(details = {}) {
  const eventRecord = {
    type: 'contextrestored',
    scene: telemetryState.currentScene,
    timestamp: new Date().toISOString(),
    ...details,
  }

  telemetryState.lastEvent = eventRecord
  console.info('[WebGL Lifecycle] ↺ Context Restored: WebGL is operational again. Resynchronizing scene...', eventRecord)
}

export function getWebGLProfile() {
  const memory = typeof window !== 'undefined' && window.performance && window.performance.memory
    ? {
        usedJSHeapSizeMB: (window.performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2),
        totalJSHeapSizeMB: (window.performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2),
      }
    : 'Not available'

  return {
    ...telemetryState,
    memory,
    lossCount: telemetryState.lossHistory.length,
    timestamp: new Date().toISOString(),
  }
}

// Expose profile snapshot globally for verification and profiling
if (typeof window !== 'undefined') {
  window.__TDV_WEBGL_PROFILE__ = getWebGLProfile
}
