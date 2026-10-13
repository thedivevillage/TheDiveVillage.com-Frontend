import { useState, useEffect, Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useLocation } from 'react-router'
import {
  OPTIMIZED_CLOWNFISH_360,
  OPTIMIZED_BARRACUDA_360,
  OPTIMIZED_TURTLE_360,
  OPTIMIZED_NIGHT_DIVE_360,
  RAW_CLOUDINARY_CLOWNFISH,
  RAW_CLOUDINARY_BARRACUDA,
  RAW_CLOUDINARY_TURTLE,
  RAW_CLOUDINARY_NIGHT_DIVE,
  MASTER_1080P_CLOWNFISH,
  MASTER_1080P_BARRACUDA,
  MASTER_1080P_TURTLE,
  MASTER_1080P_NIGHT_DIVE,
} from '../utils/videoOptimizer'

// Cloudinary High-Fidelity Dynamically Optimized Video URLs
const CLOUDINARY_CLOWNFISH = OPTIMIZED_CLOWNFISH_360 || RAW_CLOUDINARY_CLOWNFISH
const CLOUDINARY_BARRACUDA = OPTIMIZED_BARRACUDA_360 || RAW_CLOUDINARY_BARRACUDA
const CLOUDINARY_TURTLE = OPTIMIZED_TURTLE_360 || RAW_CLOUDINARY_TURTLE
const CLOUDINARY_NIGHT_DIVE = OPTIMIZED_NIGHT_DIVE_360 || RAW_CLOUDINARY_NIGHT_DIVE
const CLOUDINARY_AUDIO = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791685502/TDV-Media/Audio/Audio.mp3'

import { globalAudio } from '../utils/audioManager'
import {
  setHeroVideoReady,
  getOrCreateHeroVideoElement,
  setHeroWebGLReady,
  HERO_VIDEO_SRC,
  pauseHeroVideo,
  resumeHeroVideo,
} from '../utils/mediaReadyManager'
import { usePageVisibility } from '../hooks/usePageVisibility'
import { attachHlsStream } from '../hooks/useCloudinaryHls'

const videoFile = CLOUDINARY_CLOWNFISH
const bookFile = CLOUDINARY_BARRACUDA
const turtleVideo = CLOUDINARY_TURTLE
const nightDiveVideo = CLOUDINARY_NIGHT_DIVE

function getOrCreateDomVideoContainer() {
  let container = document.getElementById('hero-360-video-dom-root')
  if (!container) {
    container = document.createElement('div')
    container.id = 'hero-360-video-dom-root'
    container.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0.001;pointer-events:none;overflow:hidden;z-index:-99999;'
    document.body.appendChild(container)
  }
  return container
}

/**
 * Custom hook to generate and manage Three.js VideoTexture with HLS support and Page Visibility lifecycle.
 */
function useDirectVideoTexture(src, fallbackMp4, playbackRate = 0.5, priority = false, isVisible = true) {
  const [texture, setTexture] = useState(null)
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
    let video = null
    let hlsController = null

    // For priority hero video: reuse the singleton warm video element
    if (priority) {
      video = getOrCreateHeroVideoElement(src, playbackRate)
    } else {
      const domContainer = getOrCreateDomVideoContainer()
      video = document.createElement('video')
      if (src && (src.startsWith('http://') || src.startsWith('https://')) && !src.includes(window.location.host)) {
        video.crossOrigin = 'anonymous'
      }
      video.muted = true
      video.defaultMuted = true
      video.volume = 0
      video.playsInline = true
      video.setAttribute('muted', '')
      video.setAttribute('playsinline', '')
      video.setAttribute('webkit-playsinline', '')
      video.loop = true
      video.autoplay = true
      video.preload = 'auto'
      video.playbackRate = playbackRate
      domContainer.appendChild(video)

      if (src.includes('.m3u8')) {
        hlsController = attachHlsStream({
          video,
          hlsUrl: src,
          mp4FallbackUrl: fallbackMp4,
          autoPlay: true,
          playbackRate,
        })
        hlsControllerRef.current = hlsController
      } else {
        video.src = src
      }
    }

    if (!video) return

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
        if (priority) setHeroVideoReady(true)
      }
    }

    const startPlayback = () => {
      if (!isMounted || !isVisible) return
      video.playbackRate = playbackRate
      tryActivateTexture()
      if (video.paused) {
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (isMounted) {
                video.playbackRate = playbackRate
                tryActivateTexture()
              }
            })
            .catch((err) => {
              // Expected if user interaction is pending
            })
        }
      }
    }

    const handleEvent = () => {
      if (!isMounted) return
      startPlayback()
    }

    const handleUserInteraction = () => {
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

    window.addEventListener('pointerdown', handleUserInteraction, { passive: true })
    window.addEventListener('touchstart', handleUserInteraction, { passive: true })

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

      if (!priority) {
        if (hlsController) {
          hlsController.destroy()
        }
        video.pause()
        video.removeAttribute('src')
        video.load()
        if (video.parentNode) {
          video.parentNode.removeChild(video)
        }
      } else {
        pauseHeroVideo()
      }

      if (vidTexture) {
        vidTexture.dispose()
        vidTexture = null
      }
      setTexture(null)
      hlsControllerRef.current = null
    }
  }, [src, fallbackMp4, playbackRate, priority])

  // Stop/start HLS fragment downloading and video decoding when tab visibility toggles
  useEffect(() => {
    if (priority) return // Hero video handled globally by pauseHeroVideo/resumeHeroVideo
    const controller = hlsControllerRef.current
    if (!isVisible) {
      if (controller) controller.stopLoad()
    } else {
      if (controller) controller.startLoad()
    }
  }, [isVisible, priority])

  return { texture, hasNewFrameRef, lastTimeRef }
}

function VideoSphere({ videoSrc, joystickVelocity, isNightDive, isVisible }) {
  const meshRef = useRef()
  const meshRef2 = useRef()
  const meshRef3 = useRef()
  const geomRef = useRef()
  const matRef = useRef()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isAbout = location.pathname === '/about'
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  const { camera } = useThree()

  const INITIAL_YAW = Math.PI / 2.65 - Math.PI * 1.1
  const INITIAL_PITCH = isAbout ? -(Math.PI / 6) : Math.PI / 17.1

  const targetRotation = useRef({ x: INITIAL_PITCH, y: INITIAL_YAW })
  const targetOpacity2 = useRef(0)
  const targetOpacity3 = useRef(0)
  const vid2PlayingRef = useRef(false)
  const vid3PlayingRef = useRef(false)
  const hasRenderedInitialFrameRef = useRef(false)
  const [loadSecondary, setLoadSecondary] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Primary playback rate is 0.5x for smooth ambient feel
  const primaryPlaybackRate = 0.5
  const isHeroSingleton = !isNightDive && isHome
  const activeHeroSrc = !isNightDive ? videoSrc || (isAbout ? bookFile : videoFile) : null
  const heroFallbackMp4 = isAbout ? MASTER_1080P_BARRACUDA : MASTER_1080P_CLOWNFISH

  const { texture, hasNewFrameRef: hasNewFrame1, lastTimeRef: lastTime1 } = useDirectVideoTexture(
    activeHeroSrc,
    heroFallbackMp4,
    primaryPlaybackRate,
    isHeroSingleton,
    isVisible
  )

  // Secondary videos are strictly lazy-loaded only when user scrolls or needs them ON DESKTOP
  const shouldLoadSecondary = !isMobile && isHome && !isNightDive && loadSecondary
  const { texture: texture2, hasNewFrameRef: hasNewFrame2, lastTimeRef: lastTime2 } = useDirectVideoTexture(
    shouldLoadSecondary ? bookFile : null,
    MASTER_1080P_BARRACUDA,
    0.5,
    false,
    isVisible
  )
  const { texture: texture3, hasNewFrameRef: hasNewFrame3, lastTimeRef: lastTime3 } = useDirectVideoTexture(
    shouldLoadSecondary ? turtleVideo : null,
    MASTER_1080P_TURTLE,
    0.5,
    false,
    isVisible
  )

  // Flip turtle video texture horizontally so it displays correctly on the sphere
  useEffect(() => {
    if (texture3) {
      texture3.wrapS = THREE.RepeatWrapping
      texture3.repeat.x = -1
      texture3.offset.x = 1
      texture3.needsUpdate = true
    }
  }, [texture3])

  // Explicit disposal of Three.js geometry & materials on unmount
  useEffect(() => {
    return () => {
      if (geomRef.current) geomRef.current.dispose()
      if (matRef.current) matRef.current.dispose()
      if (meshRef2.current?.geometry) meshRef2.current.geometry.dispose()
      if (meshRef2.current?.material) meshRef2.current.material.dispose()
      if (meshRef3.current?.geometry) meshRef3.current.geometry.dispose()
      if (meshRef3.current?.material) meshRef3.current.material.dispose()
    }
  }, [])

  useEffect(() => {
    let scrollRafId = null

    const handleScroll = () => {
      if (scrollRafId) return
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null
        const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 640
        if (isMobileScreen) {
          targetRotation.current.y = INITIAL_YAW
          targetRotation.current.x = INITIAL_PITCH
          targetOpacity2.current = 0
          targetOpacity3.current = 0
          return
        }

        const scrollY = window.scrollY

        if (isHome) {
          if (!loadSecondary && scrollY > 150) {
            setLoadSecondary(true)
          }

          const triggerThreshold = window.innerHeight * 0.65
          const isElementInView = (el) => {
            if (!el) return false
            const rect = el.getBoundingClientRect()
            return rect.top < triggerThreshold && rect.bottom > 0
          }

          const customizeSectionEl = document.getElementById('customize-dive-section')
          const diveSectionEl = document.getElementById('who-can-dive-section')
          const airportEl = document.getElementById('airport-to-airport-section')
          const galleryEl = document.getElementById('gallery-section') || document.getElementById('gallery')
          const testimonialsEl = document.getElementById('testimonials-section')
          const customerReviewsEl = document.getElementById('customer-reviews')
          const closingCtaEl = document.getElementById('closing-cta-section')

          if (isElementInView(customerReviewsEl) || isElementInView(closingCtaEl)) {
            // 4. Review Section & Closing CTA -> Clownfish
            targetOpacity2.current = 0
            targetOpacity3.current = 0
          } else if (isElementInView(galleryEl) || isElementInView(testimonialsEl)) {
            // 3. Gallery & Testimonials -> Turtle
            targetOpacity2.current = 0
            targetOpacity3.current = 1
          } else if (isElementInView(customizeSectionEl) || isElementInView(diveSectionEl) || isElementInView(airportEl)) {
            // 2. Customize panel through Airport section -> Barracuda
            targetOpacity2.current = 1
            targetOpacity3.current = 0
          } else {
            // 1. Beginning until Customize Your Dive -> Clownfish
            targetOpacity2.current = 0
            targetOpacity3.current = 0
          }
        }

        targetRotation.current.y = INITIAL_YAW
        targetRotation.current.x = INITIAL_PITCH
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      if (scrollRafId) cancelAnimationFrame(scrollRafId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isAbout, isHome, loadSecondary, INITIAL_PITCH, INITIAL_YAW])

  // --- DRAG LOGIC ---
  const isDragging = useRef(false)
  const previousPointer = useRef({ x: 0, y: 0 })
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onPointerMove = (e) => {
      if (!isDragging.current) return
      const dx = e.clientX - previousPointer.current.x
      const dy = e.clientY - previousPointer.current.y
      previousPointer.current = { x: e.clientX, y: e.clientY }
      dragOffset.current.y += dx * 0.005
      dragOffset.current.x += dy * 0.005
    }

    const onPointerUp = () => {
      isDragging.current = false
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }

    const onPointerDown = (e) => {
      if (window.innerWidth < 640) return
      if (
        e.target.closest(
          'button, a, input, textarea, select, [role="button"], .joystick-container, [data-no-bg-drag], .cursor-grab, [class*="cursor-grab"], [class*="overflow-x-auto"], [class*="snap-x"], [class*="carousel"], [data-carousel]'
        )
      ) {
        return
      }
      isDragging.current = true
      previousPointer.current = { x: e.clientX, y: e.clientY }
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerup', onPointerUp)
      window.addEventListener('pointercancel', onPointerUp)
    }

    window.addEventListener('pointerdown', onPointerDown)

    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (isNightDive || !isVisible) return
    if (meshRef.current) {
      // 1. Frame-driven texture 1 update (strictly on presented frames)
      if (texture && texture.image) {
        const vid1 = texture.image
        if (!vid1.paused && vid1.readyState >= 2 && vid1.videoWidth > 0) {
          if (hasNewFrame1.current || vid1.currentTime !== lastTime1.current) {
            lastTime1.current = vid1.currentTime
            hasNewFrame1.current = false
            texture.needsUpdate = true
            if (!hasRenderedInitialFrameRef.current) {
              hasRenderedInitialFrameRef.current = true
              setHeroWebGLReady(true)
            }
          }
        }
      }

      // 2. Secondary texture 2 update with state-transition play/pause (desktop only)
      if (!isMobile && texture2 && texture2.image) {
        const vid2 = texture2.image
        if (targetOpacity2.current > 0.01 && isVisible) {
          if (vid2.paused) {
            vid2PlayingRef.current = true
            vid2.play().catch(() => {})
          }
          if (vid2.readyState >= 2 && vid2.videoWidth > 0 && vid2.videoHeight > 0) {
            if (hasNewFrame2.current || vid2.currentTime !== lastTime2.current) {
              lastTime2.current = vid2.currentTime
              hasNewFrame2.current = false
              texture2.needsUpdate = true
            }
          }
        } else {
          if (vid2PlayingRef.current || !vid2.paused) {
            vid2PlayingRef.current = false
            vid2.pause()
          }
        }
      }

      // 3. Secondary texture 3 update with state-transition play/pause (desktop only)
      if (!isMobile && texture3 && texture3.image) {
        const vid3 = texture3.image
        if (targetOpacity3.current > 0.01 && isVisible) {
          if (vid3.paused) {
            vid3PlayingRef.current = true
            vid3.play().catch(() => {})
          }
          if (vid3.readyState >= 2 && vid3.videoWidth > 0 && vid3.videoHeight > 0) {
            if (hasNewFrame3.current || vid3.currentTime !== lastTime3.current) {
              lastTime3.current = vid3.currentTime
              hasNewFrame3.current = false
              texture3.needsUpdate = true
            }
          }
        } else {
          if (vid3PlayingRef.current || !vid3.paused) {
            vid3PlayingRef.current = false
            vid3.pause()
          }
        }
      }

      if (joystickVelocity && joystickVelocity.current) {
        dragOffset.current.y += joystickVelocity.current.x * delta * 0.4
        dragOffset.current.x += joystickVelocity.current.y * delta * 0.4
      }

      const finalTargetX = targetRotation.current.x + dragOffset.current.x
      const finalTargetY = targetRotation.current.y + dragOffset.current.y

      meshRef.current.rotation.y += (finalTargetY - meshRef.current.rotation.y) * delta * 5
      meshRef.current.rotation.x += (finalTargetX - meshRef.current.rotation.x) * delta * 5

      if (!isMobile && meshRef2.current && meshRef2.current.material && isHome) {
        meshRef2.current.rotation.y = meshRef.current.rotation.y - Math.PI / 2.5
        meshRef2.current.rotation.x = meshRef.current.rotation.x - Math.PI / 6
        meshRef2.current.material.opacity += (targetOpacity2.current - meshRef2.current.material.opacity) * delta * 2.5
      }

      if (!isMobile && meshRef3.current && meshRef3.current.material && isHome) {
        meshRef3.current.rotation.y = meshRef.current.rotation.y + Math.PI * 1.45
        meshRef3.current.rotation.x = meshRef.current.rotation.x - Math.PI / 7
        meshRef3.current.material.opacity += (targetOpacity3.current - meshRef3.current.material.opacity) * delta * 2.5
      }
    }
  })

  return (
    <group>
      <mesh ref={meshRef} scale={[-1, 1, 1]} visible={Boolean(texture)}>
        <sphereGeometry ref={geomRef} args={[500, 60, 40]} />
        <meshBasicMaterial
          ref={matRef}
          map={texture}
          side={THREE.BackSide}
          transparent={false}
          opacity={1}
          depthWrite={false}
          color="#ffffff"
        />
      </mesh>
      {!isMobile && isHome && !isNightDive && (
        <>
          <mesh ref={meshRef2} scale={[-0.99, 0.99, 0.99]} visible={Boolean(texture2)}>
            <sphereGeometry args={[500, 60, 40]} />
            <meshBasicMaterial map={texture2} side={THREE.BackSide} transparent={true} opacity={0} depthWrite={false} />
          </mesh>
          <mesh ref={meshRef3} scale={[-0.98, 0.98, 0.98]} visible={Boolean(texture3)}>
            <sphereGeometry args={[500, 60, 40]} />
            <meshBasicMaterial map={texture3} side={THREE.BackSide} transparent={true} opacity={0} depthWrite={false} />
          </mesh>
        </>
      )}
    </group>
  )
}

export default function VideoSphereBackground() {
  const [mounted, setMounted] = useState(true)
  const [isMuted, setIsMuted] = useState(globalAudio.getIsMuted())
  const [isNightDive, setIsNightDive] = useState(false)
  const location = useLocation()
  const joystickVelocity = useRef({ x: 0, y: 0 })
  const nightVideoRef = useRef(null)
  const nightHlsControllerRef = useRef(null)

  // Reusable Page Visibility hook
  const isVisible = usePageVisibility()

  const isAbout = location.pathname === '/about'
  const isSpherePage = location.pathname === '/' || isAbout
  const shouldRenderCanvas = isVisible && isSpherePage && !isNightDive
  const currentVideo = isNightDive ? nightDiveVideo : isAbout ? bookFile : videoFile

  useEffect(() => {
    setMounted(true)
  }, [])

  // Watch for night-dive class on body
  useEffect(() => {
    const checkNightDive = () => setIsNightDive(document.body.classList.contains('night-dive'))
    checkNightDive()
    const observer = new MutationObserver(checkNightDive)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Control night dive video playback and HLS stream when mode changes or tab visibility changes
  useEffect(() => {
    const video = nightVideoRef.current
    if (!video) return

    if (isNightDive && isSpherePage && isVisible) {
      if (!nightHlsControllerRef.current) {
        nightHlsControllerRef.current = attachHlsStream({
          video,
          hlsUrl: nightDiveVideo,
          mp4FallbackUrl: MASTER_1080P_NIGHT_DIVE,
          autoPlay: true,
        })
      } else {
        nightHlsControllerRef.current.startLoad()
        video.play().catch(() => {})
      }
    } else {
      if (nightHlsControllerRef.current) {
        nightHlsControllerRef.current.stopLoad()
      }
      video.pause()
    }
  }, [isNightDive, isSpherePage, isVisible])

  // Pause / resume hero 360 video when switching between sphere pages, non-sphere pages, or hidden tab
  useEffect(() => {
    if (!isSpherePage || !isVisible || isNightDive) {
      pauseHeroVideo()
    } else {
      resumeHeroVideo()
    }
  }, [isSpherePage, isVisible, isNightDive])

  // Synchronize with global singleton audio manager
  useEffect(() => {
    const unsub = globalAudio.subscribe(({ isMuted: muted }) => {
      setIsMuted(muted)
    })
    return () => unsub()
  }, [])

  const handleToggleAudio = () => {
    globalAudio.toggle()
  }

  if (!mounted) return null

  const isHiddenJoystickPath =
    location.pathname.startsWith('/about') ||
    location.pathname.startsWith('/gallery') ||
    location.pathname.startsWith('/services') ||
    location.pathname.startsWith('/courses') ||
    location.pathname.startsWith('/shop') ||
    location.pathname.startsWith('/product') ||
    location.pathname.startsWith('/cart') ||
    location.pathname.startsWith('/wishlist') ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/contact') ||
    location.pathname.startsWith('/scuba') ||
    location.pathname.startsWith('/snorkeling') ||
    location.pathname.startsWith('/surfing') ||
    location.pathname === '/book-us' ||
    location.pathname === '/login' ||
    location.pathname === '/signup'

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="h-full w-full overflow-hidden relative"
          style={{
            background: 'radial-gradient(circle at center, #003865 0%, #001e3d 55%, #000e1c 100%)',
          }}
        >
          <video
            ref={(el) => {
              if (el) {
                el.muted = true
                el.defaultMuted = true
                nightVideoRef.current = el
              }
            }}
            autoPlay={isSpherePage && isNightDive && isVisible}
            loop
            muted
            playsInline
            preload={isSpherePage && isNightDive ? 'auto' : 'none'}
            disablePictureInPicture
            disableRemotePlayback
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: isSpherePage && isNightDive ? 1 : 0,
              pointerEvents: 'none',
              transition: 'opacity 0.4s ease-in-out',
              zIndex: isSpherePage && isNightDive ? 2 : -1,
              transform: 'translate3d(0, 0, 0)',
              willChange: 'opacity, transform',
              backfaceVisibility: 'hidden',
              display: isSpherePage ? 'block' : 'none',
            }}
          />
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
              display: shouldRenderCanvas ? 'block' : 'none',
              pointerEvents: shouldRenderCanvas ? 'auto' : 'none',
            }}
          >
            <Canvas
              frameloop={shouldRenderCanvas ? 'always' : 'never'}
              dpr={[1, 1.5]}
              camera={{ position: [0, 0, 0.1], fov: 85 }}
              gl={{ powerPreference: 'high-performance', antialias: false }}
              onCreated={({ gl, scene }) => {
                scene.background = new THREE.Color('#001e3d')
                gl.domElement.addEventListener(
                  'webglcontextlost',
                  (e) => {
                    e.preventDefault()
                    console.warn('THREE.WebGLRenderer: Context Lost. Handling gracefully.')
                  },
                  false
                )
                gl.domElement.addEventListener(
                  'webglcontextrestored',
                  () => {
                    console.info('THREE.WebGLRenderer: Context Restored.')
                  },
                  false
                )
              }}
            >
              <color attach="background" args={['#001e3d']} />
              {isSpherePage && (
                <>
                  <Suspense fallback={null}>
                    <VideoSphere
                      videoSrc={currentVideo}
                      key={currentVideo}
                      isNightDive={isNightDive}
                      joystickVelocity={joystickVelocity}
                      isVisible={isVisible}
                    />
                  </Suspense>
                  <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableDamping={true}
                    dampingFactor={0.05}
                    autoRotate={false}
                    rotateSpeed={-0.15}
                  />
                </>
              )}
            </Canvas>
          </div>
        </div>
      </div>
      {!isNightDive && !isHiddenJoystickPath && <JoystickControl joystickVelocity={joystickVelocity} />}
      <AudioToggle isMuted={isMuted} onToggle={handleToggleAudio} />
    </>
  )
}

function AudioToggle({ isMuted, onToggle }) {
  const location = useLocation()
  const isLightPage =
    location.pathname.startsWith('/gallery') ||
    location.pathname.startsWith('/services') ||
    location.pathname.startsWith('/shop') ||
    location.pathname.startsWith('/product') ||
    location.pathname === '/cart' ||
    location.pathname === '/wishlist' ||
    location.pathname === '/checkout'

  const lastClickRef = useRef(0)

  const handleDebouncedToggle = (e) => {
    e.stopPropagation()
    const now = Date.now()
    if (now - lastClickRef.current < 250) return
    lastClickRef.current = now
    onToggle()
  }

  return (
    <button
      onClick={handleDebouncedToggle}
      className={`fixed bottom-6 right-6 z-[9000] flex h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border shadow-2xl transition-all duration-300 hover:scale-110 hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] cursor-pointer touch-manipulation active:scale-95 ${
        isLightPage
          ? 'bg-[#001e3d] text-white border-white/20 shadow-[0_6px_24px_rgba(0,30,61,0.35)]'
          : 'bg-[#001e3d]/85 text-white border-white/30 backdrop-blur-2xl shadow-[0_6px_24px_rgba(0,0,0,0.5)]'
      }`}
      aria-label={isMuted ? 'Play underwater ambiance' : 'Mute underwater ambiance'}
      title={isMuted ? 'Unmute underwater ambiance' : 'Mute underwater ambiance'}
    >
      {!isMuted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M11 5L6 9H2V15H6L11 19V5Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M11 5L6 9H2V15H6L11 19V5Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="23" y1="1" x2="1" y2="23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
}

function JoystickControl({ joystickVelocity }) {
  const location = useLocation()
  const containerRef = useRef(null)
  const isDragging = useRef(false)
  const [thumbPos, setThumbPos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [isDraggingState, setIsDraggingState] = useState(false)

  useEffect(() => {
    return () => {
      document.body.removeAttribute('data-360-dragging')
    }
  }, [])

  if (
    location.pathname.startsWith('/gallery') ||
    location.pathname.startsWith('/services') ||
    location.pathname.startsWith('/courses') ||
    location.pathname.startsWith('/shop') ||
    location.pathname.startsWith('/product') ||
    location.pathname.startsWith('/cart') ||
    location.pathname.startsWith('/wishlist') ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/contact')
  ) {
    return null
  }

  const MAX_RADIUS = 14

  const handlePointerDown = (e) => {
    isDragging.current = true
    setIsDraggingState(true)
    document.body.setAttribute('data-360-dragging', 'true')
    updateJoystick(e)
    try {
      e.target.setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e) => {
    if (!isDragging.current) return
    updateJoystick(e)
  }

  const handlePointerUp = (e) => {
    isDragging.current = false
    setIsDraggingState(false)
    document.body.removeAttribute('data-360-dragging')
    setThumbPos({ x: 0, y: 0 })
    if (joystickVelocity) joystickVelocity.current = { x: 0, y: 0 }
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

    if (joystickVelocity) {
      joystickVelocity.current = {
        x: dx / MAX_RADIUS,
        y: dy / MAX_RADIUS,
      }
    }
  }

  const isDarkBlue = isHovered || isDraggingState

  return (
    <div
      data-360-toggle="container"
      className="fixed top-1/2 right-2 sm:right-6 -translate-y-1/2 z-[8000] flex flex-col items-center gap-1.5 sm:gap-2 pointer-events-auto joystick-container scale-90 sm:scale-100 origin-right"
    >
      <span className="text-[9px] sm:text-[10px] font-bold text-white/90 uppercase tracking-widest bg-white/10 border border-white/25 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md backdrop-blur-2xl shadow-[0_4px_16px_rgba(0,0,0,0.25)] select-none pointer-events-none">
        360° Toggle
      </span>
      <div
        ref={containerRef}
        data-360-toggle="clickable"
        data-cursor-interactive="true"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => {
          if (!isDragging.current) {
            setIsHovered(false)
          }
        }}
        className="group/toggle relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/30 bg-white/10 backdrop-blur-2xl flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing touch-none transition-all duration-300 hover:bg-white/15 hover:border-white/40 [clip-path:circle(50%)]"
      >
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-xl transition-all duration-300 pointer-events-none ${
            isDarkBlue
              ? '!bg-[#001e3d] border-white/70 shadow-[0_0_16px_rgba(0,30,61,0.6)]'
              : 'bg-white/30 border-white/50 shadow-[0_2px_12px_rgba(255,255,255,0.25)]'
          } border group-hover/toggle:!bg-[#001e3d] group-hover/toggle:border-white/70 group-hover/toggle:shadow-[0_0_16px_rgba(0,30,61,0.6)]`}
          style={{
            transform: `translate(${thumbPos.x}px, ${thumbPos.y}px)`,
            transition: isDragging.current
              ? 'none'
              : 'transform 0.2s ease-out, background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
          }}
        />
      </div>
    </div>
  )
}
