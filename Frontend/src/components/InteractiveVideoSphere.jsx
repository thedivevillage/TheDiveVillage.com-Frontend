import { useState, useEffect, Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import {
  OPTIMIZED_CLOWNFISH_360,
  RAW_CLOUDINARY_CLOWNFISH,
  MASTER_1080P_CLOWNFISH,
} from '../utils/videoOptimizer'
import { usePageVisibility } from '../hooks/usePageVisibility'
import { attachHlsStream } from '../hooks/useCloudinaryHls'

const clownfishVideo = OPTIMIZED_CLOWNFISH_360 || RAW_CLOUDINARY_CLOWNFISH
const videoFile = clownfishVideo

function getOrCreateDomVideoContainer() {
  let container = document.getElementById('interactive-video-dom-root')
  if (!container) {
    container = document.createElement('div')
    container.id = 'interactive-video-dom-root'
    container.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0.001;pointer-events:none;overflow:hidden;z-index:-99999;'
    document.body.appendChild(container)
  }
  return container
}

function useDirectVideoTexture(src, isVisible = true) {
  const [texture, setTexture] = useState(null)
  const videoRef = useRef(null)
  const hasNewFrameRef = useRef(false)
  const lastTimeRef = useRef(-1)
  const hlsControllerRef = useRef(null)

  useEffect(() => {
    if (!src) {
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
    video.playbackRate = 0.45
    video.setAttribute('fetchpriority', 'high')

    domContainer.appendChild(video)
    videoRef.current = video

    const hlsController = attachHlsStream({
      video,
      hlsUrl: src,
      mp4FallbackUrl: MASTER_1080P_CLOWNFISH,
      autoPlay: true,
      playbackRate: 0.45,
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
      if (!isMounted) return
      if (checkReadiness()) {
        if (!vidTexture) {
          vidTexture = new THREE.VideoTexture(video)
          vidTexture.update = () => {}
          vidTexture.colorSpace = THREE.SRGBColorSpace
          vidTexture.minFilter = THREE.LinearFilter
          vidTexture.magFilter = THREE.LinearFilter
          vidTexture.generateMipmaps = false
          if (isMounted) {
            setTexture(vidTexture)
          }
          registerFrameCallback()
        }
        hasNewFrameRef.current = true
        vidTexture.needsUpdate = true
      }
    }

    const startPlayback = () => {
      if (!isMounted || !isVisible) return
      tryActivateTexture()
      if (video.paused) {
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (isMounted) {
                video.playbackRate = 0.45
                tryActivateTexture()
              }
            })
            .catch(() => {})
        }
      }
    }

    const handleEvent = () => {
      if (!isMounted) return
      startPlayback()
    }

    const mediaEvents = [
      'loadstart',
      'loadedmetadata',
      'loadeddata',
      'canplay',
      'canplaythrough',
      'playing',
      'timeupdate',
      'resize',
    ]

    mediaEvents.forEach((evt) => {
      video.addEventListener(evt, handleEvent)
    })

    if (isVisible) {
      startPlayback()
    }

    const handleUserInteraction = () => {
      if (!isMounted) return
      if (videoRef.current && videoRef.current.paused && isVisible) {
        videoRef.current.playbackRate = 0.45
        videoRef.current
          .play()
          .then(() => {
            if (isMounted) tryActivateTexture()
          })
          .catch(() => {})
      } else {
        tryActivateTexture()
      }
    }

    window.addEventListener('pointerdown', handleUserInteraction, { once: true, passive: true })
    window.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true })

    return () => {
      isMounted = false
      if (rvfcId && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(rvfcId)
      }
      if (fallbackCleanup) {
        fallbackCleanup()
      }
      window.removeEventListener('pointerdown', handleUserInteraction)
      window.removeEventListener('touchstart', handleUserInteraction)
      mediaEvents.forEach((evt) => {
        video.removeEventListener(evt, handleEvent)
      })

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
  }, [src])

  // Manage visibility
  useEffect(() => {
    const video = videoRef.current
    const controller = hlsControllerRef.current
    if (!video) return

    if (!isVisible) {
      video.pause()
      if (controller) controller.stopLoad()
    } else {
      if (controller) controller.startLoad()
      video.play().catch(() => {})
    }
  }, [isVisible])

  return { texture, hasNewFrameRef, lastTimeRef }
}

function SphereMesh({ autoRotate, isVisible }) {
  const meshRef = useRef()
  const geomRef = useRef()
  const matRef = useRef()
  const { texture, hasNewFrameRef, lastTimeRef } = useDirectVideoTexture(videoFile, isVisible)

  useFrame(() => {
    if (!isVisible) return
    if (meshRef.current && texture && texture.image) {
      const vid = texture.image
      if (hasNewFrameRef.current || vid.currentTime !== lastTimeRef.current) {
        lastTimeRef.current = vid.currentTime
        hasNewFrameRef.current = false
        texture.needsUpdate = true
      }
    }
  })

  useEffect(() => {
    return () => {
      if (geomRef.current) geomRef.current.dispose()
      if (matRef.current) matRef.current.dispose()
    }
  }, [])

  if (!texture) return null

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]} rotation={[0.05, -1.2, 0]}>
      <sphereGeometry ref={geomRef} args={[500, 60, 40]} />
      <meshBasicMaterial ref={matRef} map={texture} side={THREE.BackSide} />
    </mesh>
  )
}

export default function InteractiveVideoSphere({ autoRotate = true, className = '' }) {
  const [mounted, setMounted] = useState(false)
  const controlsRef = useRef()
  const containerRef = useRef(null)
  const isDragging = useRef(false)
  const [thumbPos, setThumbPos] = useState({ x: 0, y: 0 })
  const isVisible = usePageVisibility()
  const MAX_RADIUS = 14

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePointerDown = (e) => {
    isDragging.current = true
    updateJoystick(e)
    e.target.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!isDragging.current) return
    updateJoystick(e)
  }

  const handlePointerUp = (e) => {
    isDragging.current = false
    setThumbPos({ x: 0, y: 0 })
    try {
      e.target.releasePointerCapture(e.pointerId)
    } catch {}
  }

  const updateJoystick = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    let dx = e.clientX - centerX
    let dy = e.clientY - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > MAX_RADIUS) {
      dx = (dx / distance) * MAX_RADIUS
      dy = (dy / distance) * MAX_RADIUS
    }
    setThumbPos({ x: dx, y: dy })
    if (controlsRef.current) {
      controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() - dx * 0.005)
      controlsRef.current.setPolarAngle(
        Math.max(0.1, Math.min(Math.PI - 0.1, controlsRef.current.getPolarAngle() + dy * 0.005))
      )
      controlsRef.current.update()
    }
  }

  if (!mounted) return null

  return (
    <div
      className={`relative w-full h-full bg-[#001e3d] overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
    >
      <Canvas
        frameloop={isVisible ? 'always' : 'never'}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 0.1], fov: 52 }}
        gl={{ powerPreference: 'high-performance', antialias: false }}
      >
        <color attach="background" args={['#001e3d']} />
        <Suspense fallback={null}>
          <SphereMesh autoRotate={autoRotate} isVisible={isVisible} />
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          enableZoom={false}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={autoRotate && isVisible}
          autoRotateSpeed={1.0}
          rotateSpeed={-0.15}
        />
      </Canvas>
    </div>
  )
}
