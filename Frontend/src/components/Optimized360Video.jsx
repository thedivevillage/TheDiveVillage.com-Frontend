import { useState, useEffect, Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { MEDIA_CONFIG } from '../config/mediaConfig'
import { attachHlsStream } from '../hooks/useCloudinaryHls'

function getOrCreateDomVideoContainer() {
  let container = document.getElementById('optimized-360-video-dom-root')
  if (!container) {
    container = document.createElement('div')
    container.id = 'optimized-360-video-dom-root'
    container.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0.001;pointer-events:none;overflow:hidden;z-index:-99999;'
    document.body.appendChild(container)
  }
  return container
}

/**
 * Hook to manage Three.js VideoTexture with HLS adaptive streaming from Cloudflare R2.
 */
function useR2VideoTexture(hlsSrc, mp4Fallback, isVisible = true) {
  const [texture, setTexture] = useState(null)
  const videoRef = useRef(null)
  const hasNewFrameRef = useRef(false)
  const hlsControllerRef = useRef(null)

  useEffect(() => {
    if (!hlsSrc && !mp4Fallback) {
      setTexture(null)
      return
    }

    let isMounted = true
    let vidTexture = null
    let rvfcId = null
    let fallbackCleanup = null

    const domContainer = getOrCreateDomVideoContainer()
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.playsInline = true
    video.setAttribute('webkit-playsinline', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('muted', '')
    video.muted = true
    video.defaultMuted = true
    video.loop = true
    video.autoplay = true
    video.preload = 'auto'
    video.playbackRate = 0.5

    domContainer.appendChild(video)
    videoRef.current = video

    const hlsController = attachHlsStream({
      video,
      hlsUrl: hlsSrc,
      mp4FallbackUrl: mp4Fallback,
      autoPlay: isVisible,
      playbackRate: 0.5,
    })
    hlsControllerRef.current = hlsController

    const checkReadiness = () => {
      if (!isMounted) return false
      return video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0
    }

    const registerFrameCallback = () => {
      if (video.requestVideoFrameCallback) {
        const onVideoFrame = () => {
          if (!isMounted) return
          hasNewFrameRef.current = true
          rvfcId = video.requestVideoFrameCallback(onVideoFrame)
        }
        rvfcId = video.requestVideoFrameCallback(onVideoFrame)
      } else {
        const onTimeUpdate = () => {
          if (!isMounted) return
          hasNewFrameRef.current = true
        }
        video.addEventListener('timeupdate', onTimeUpdate)
        video.addEventListener('playing', onTimeUpdate)
        fallbackCleanup = () => {
          video.removeEventListener('timeupdate', onTimeUpdate)
          video.removeEventListener('playing', onTimeUpdate)
        }
      }
    }

    const tryActivateTexture = () => {
      if (!isMounted || !checkReadiness()) return
      if (!vidTexture) {
        vidTexture = new THREE.VideoTexture(video)
        vidTexture.minFilter = THREE.LinearFilter
        vidTexture.magFilter = THREE.LinearFilter
        vidTexture.format = THREE.RGBAFormat
        vidTexture.generateMipmaps = false
        vidTexture.colorSpace = THREE.SRGBColorSpace
        setTexture(vidTexture)
        registerFrameCallback()
      }
    }

    const startPlayback = () => {
      if (!isMounted) return
      if (video.paused && isVisible) {
        video
          .play()
          .then(() => {
            if (isMounted) tryActivateTexture()
          })
          .catch(() => {})
      }
    }

    const mediaEvents = ['loadedmetadata', 'canplay', 'playing', 'timeupdate']
    mediaEvents.forEach((evt) => video.addEventListener(evt, startPlayback))

    if (isVisible) {
      startPlayback()
    }

    const handleVisibility = () => {
      if (document.hidden) {
        video.pause()
      } else if (isVisible) {
        video.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibility)
      if (rvfcId && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(rvfcId)
      }
      if (fallbackCleanup) fallbackCleanup()
      mediaEvents.forEach((evt) => video.removeEventListener(evt, startPlayback))

      if (hlsController) {
        hlsController.destroy()
      }
      video.pause()
      video.removeAttribute('src')
      video.load()
      if (video.parentNode) {
        video.parentNode.removeChild(video)
      }
      if (vidTexture) {
        vidTexture.dispose()
        vidTexture = null
      }
      videoRef.current = null
      setTexture(null)
      hlsControllerRef.current = null
    }
  }, [hlsSrc, mp4Fallback, isVisible])

  return { texture, hasNewFrameRef }
}

function VideoSphereMesh({ texture, hasNewFrameRef }) {
  const meshRef = useRef(null)

  useFrame(() => {
    if (hasNewFrameRef.current && texture) {
      texture.needsUpdate = true
      hasNewFrameRef.current = false
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0006
    }
  })

  if (!texture) return null

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 48, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  )
}

/**
 * Reusable Optimized360Video component for Cloudflare R2 video delivery.
 * Encapsulates Three.js equirectangular projection, HLS adaptive streaming,
 * DPR throttling (60 FPS target), and automatic lifecycle resource disposal.
 */
export default function Optimized360Video({
  hlsUrl = MEDIA_CONFIG.r2.streams.clownfish.hls,
  fallbackMp4 = MEDIA_CONFIG.r2.streams.clownfish.mp4,
  poster = null,
  enableControls = true,
  className = '',
  style = {},
}) {
  const [isVisible, setIsVisible] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting && !document.hidden)
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { texture, hasNewFrameRef } = useR2VideoTexture(hlsUrl, fallbackMp4, isVisible)

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#001e3d] ${className}`}
      style={style}
    >
      <Canvas
        frameloop={isVisible ? 'always' : 'never'}
        dpr={[1, MEDIA_CONFIG.threeD.maxDpr]}
        camera={{ position: [0, 0, 0.1], fov: 80 }}
        gl={{ powerPreference: 'high-performance', antialias: false }}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <VideoSphereMesh texture={texture} hasNewFrameRef={hasNewFrameRef} />
          {enableControls && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              rotateSpeed={-0.35}
              autoRotate={false}
            />
          )}
        </Suspense>
      </Canvas>

      {!texture && poster && (
        <img
          src={poster}
          alt="360 View Preview"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500"
        />
      )}
    </div>
  )
}
