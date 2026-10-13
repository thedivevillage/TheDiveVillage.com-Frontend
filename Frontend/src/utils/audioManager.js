// Production CDN Audio URLs:
const CLOUDINARY_AUDIO_URL = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791685502/TDV-Media/Audio/Audio.mp3'

const AUDIO_SOURCES = [
  CLOUDINARY_AUDIO_URL,
].filter(Boolean)

class AudioManager {
  constructor() {
    this.audio = null
    this.isMuted = false
    this.listeners = new Set()
    this.hasUnlocked = false
    this.initialized = false
    this.currentSourceIndex = 0
    this.wasAudibleBeforeLeave = false
    this.unlockListenersAttached = false
    this.unlockFn = null
    this.resumeListenersAttached = false
    this.savedTime = 0

    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init())
      } else {
        this.init()
      }
    }
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return
    this.initialized = true

    // Check user preference from localStorage
    const storedMute = localStorage.getItem('tdv_audio_muted')
    if (storedMute !== null) {
      this.isMuted = storedMute === 'true'
    }

    // Reuse existing DOM audio element or create and append to document.body
    let audio = document.getElementById('tdv-global-ambient-audio')
    if (!audio) {
      audio = document.createElement('audio')
      audio.id = 'tdv-global-ambient-audio'
      audio.autoplay = true
      audio.loop = true
      audio.preload = 'auto'
      audio.crossOrigin = 'anonymous'
      audio.playsInline = true
      audio.setAttribute('autoplay', '')
      audio.setAttribute('playsinline', '')
      audio.setAttribute('webkit-playsinline', '')
      audio.style.cssText = 'display:none;position:fixed;pointer-events:none;'
      if (AUDIO_SOURCES.length > 0) {
        audio.src = AUDIO_SOURCES[0]
      }
      document.body.appendChild(audio)
    }

    audio.loop = true
    audio.playsInline = true
    audio.setAttribute('playsinline', '')
    audio.setAttribute('webkit-playsinline', '')

    if (this.isMuted) {
      audio.muted = true
      audio.volume = 0
    } else {
      audio.volume = 0.5
      // If audio is currently unmuted and playing, mark unlocked
      if (!audio.muted && !audio.paused) {
        this.hasUnlocked = true
        this.showMediaNotification()
      }
    }

    if (!audio.src && AUDIO_SOURCES.length > 0) {
      audio.src = AUDIO_SOURCES[0]
    }

    // Auto-fallback if the current source fails to load
    audio.addEventListener('error', () => {
      if (this.currentSourceIndex < AUDIO_SOURCES.length - 1) {
        this.currentSourceIndex++
        console.warn(`[AudioManager] Switching audio source to fallback: ${AUDIO_SOURCES[this.currentSourceIndex]}`)
        audio.src = AUDIO_SOURCES[this.currentSourceIndex]
        audio.load()
        if (!this.isMuted && !document.hidden) {
          audio.play().catch(() => {})
        }
      }
    })

    this.audio = audio

    // ─────────────────────────────────────────────────────────────
    // Instant Unmute Handlers: Covers Cursor Move, Wheel, Touch, Key, Click
    // Ensures audio un-mutes automatically without waiting for an explicit click
    // ─────────────────────────────────────────────────────────────
    const microEvents = [
      'mousemove',
      'pointermove',
      'wheel',
      'scroll',
      'pointerdown',
      'touchstart',
      'mousedown',
      'click',
      'keydown',
      'focus'
    ]

    const removeUnlockListeners = () => {
      if (!this.unlockListenersAttached) return
      this.unlockListenersAttached = false
      microEvents.forEach((evt) => {
        window.removeEventListener(evt, attemptUnmute, true)
        document.removeEventListener(evt, attemptUnmute, true)
      })
    }

    const attemptUnmute = () => {
      if (this.isMuted) {
        removeUnlockListeners()
        return
      }

      if (typeof document !== 'undefined' && document.hidden) {
        return
      }

      if (this.audio) {
        this.audio.muted = false
        this.audio.volume = 0.5
        const p = this.audio.play()
        if (p !== undefined) {
          p.then(() => {
            this.hasUnlocked = true
            this.wasAudibleBeforeLeave = true
            this.showMediaNotification()
            this.notify()
            removeUnlockListeners()
          }).catch(() => {
            // Keep muted if browser requires further activation
            this.audio.muted = true
          })
        } else {
          this.hasUnlocked = true
          this.wasAudibleBeforeLeave = true
          this.showMediaNotification()
          this.notify()
          removeUnlockListeners()
        }
      }
    }

    this.unlockFn = attemptUnmute
    this.unlockListenersAttached = true

    microEvents.forEach((evt) => {
      window.addEventListener(evt, attemptUnmute, { capture: true, passive: true })
      document.addEventListener(evt, attemptUnmute, { capture: true, passive: true })
    })

    window.addEventListener('tdv-unlock-audio', attemptUnmute)

    // ─────────────────────────────────────────────────────────────
    // Seamless Resume & Pause Matrix with Media Notification Lifecycle
    //
    // Handles tab switches ("tables are switched"), window minimize,
    // and mobile app switches/screen locks on both Desktop and Mobile:
    // 1. When leaving/minimizing: Audio pauses & media notification popup is REMOVED
    // 2. When returning: Audio resumes & media notification popup COMES BACK
    // ─────────────────────────────────────────────────────────────
    const handleLeaveSite = () => {
      if (this.isMuted || !this.audio) return
      if (!this.audio.muted || !this.audio.paused || this.audio.getAttribute('src')) {
        this.wasAudibleBeforeLeave = true
        if (this.audio.currentTime > 0) {
          this.savedTime = this.audio.currentTime
        }
        // Instantly silence and pause audio so browser drops active playback
        this.audio.muted = true
        this.audio.volume = 0
        this.audio.pause()
        // Immediately dismiss the media notification popup on desktop & mobile
        this.removeMediaNotification()
        // Crucial: remove src and load() so Chromium Global Media Controls and Android notification completely destroy the media card
        this.audio.removeAttribute('src')
        this.audio.load()
        this.notify()
      }
    }

    const handleEnterSite = () => {
      if (this.isMuted || !this.audio) return
      if (typeof document !== 'undefined' && document.hidden) return

      if (this.wasAudibleBeforeLeave && this.audio) {
        // Re-attach audio source if detached
        if (!this.audio.getAttribute('src')) {
          this.audio.src = AUDIO_SOURCES[this.currentSourceIndex]
          if (this.savedTime && Number.isFinite(this.savedTime)) {
            const seekTarget = this.savedTime
            this.audio.addEventListener(
              'loadedmetadata',
              () => {
                try {
                  this.audio.currentTime = seekTarget
                } catch (_) {}
              },
              { once: true }
            )
          }
        }
        // Instantly restore sound and media notification popup
        this.audio.muted = false
        this.audio.volume = 0.5
        const p = this.audio.play()
        if (p !== undefined) {
          p.then(() => {
            this.showMediaNotification()
            this.notify()
          }).catch((err) => {
            console.warn('[AudioManager] Resumption blocked by browser policy:', err)
            // Re-arm gesture listeners so next tap/scroll/cursor instantly restores
            this.attachResumeOnGesture()
          })
        } else {
          this.showMediaNotification()
          this.notify()
        }
      }
    }

    // 1. Tab visibility / window minimization
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        handleLeaveSite()
      } else {
        handleEnterSite()
      }
    })

    // 2. Desktop window focus & blur (User clicking off the website to another window/app)
    window.addEventListener('blur', () => {
      handleLeaveSite()
    })

    window.addEventListener('focus', () => {
      handleEnterSite()
    })

    // 3. Mobile device lifecycle (App switch & screen lock)
    window.addEventListener('pagehide', () => {
      handleLeaveSite()
    })

    window.addEventListener('pageshow', () => {
      handleEnterSite()
    })

    // ─────────────────────────────────────────────────────────────
    // Refresh & Boot Autoplay Retries
    // ─────────────────────────────────────────────────────────────
    const tryAutoplay = () => {
      if (this.isMuted || typeof document === 'undefined' || document.hidden) return
      this.audio.volume = 0.5
      this.audio.muted = false
      const p = this.audio.play()
      if (p !== undefined) {
        p.then(() => {
          this.hasUnlocked = true
          this.wasAudibleBeforeLeave = true
          this.showMediaNotification()
          this.notify()
          removeUnlockListeners()
        }).catch(() => {
          // If unmuted autoplay blocked on initial boot, play muted so stream is pre-buffered
          this.audio.muted = true
          this.audio.play().catch(() => {})
        })
      }
    }

    tryAutoplay()
    setTimeout(tryAutoplay, 150)
    setTimeout(tryAutoplay, 500)
    window.addEventListener('load', tryAutoplay, { once: true })

    // Expose global instance for easy debugging and components
    window.__tdvGlobalAudio = this
    window.globalAudio = this
  }

  subscribe(callback) {
    this.listeners.add(callback)
    callback({ isMuted: this.isMuted, isPlaying: this.isPlaying() })
    return () => this.listeners.delete(callback)
  }

  notify() {
    const state = { isMuted: this.isMuted, isPlaying: this.isPlaying() }
    this.listeners.forEach((cb) => {
      try {
        cb(state)
      } catch (err) {
        console.error(err)
      }
    })
  }

  isPlaying() {
    return !!(this.audio && !this.audio.paused && !this.audio.muted && this.audio.volume > 0)
  }

  getIsMuted() {
    return this.isMuted
  }

  toggle() {
    if (this.isMuted) {
      this.unmute()
    } else {
      this.mute()
    }
  }

  mute() {
    this.isMuted = true
    this.wasAudibleBeforeLeave = false
    localStorage.setItem('tdv_audio_muted', 'true')
    if (this.audio) {
      if (this.audio.currentTime > 0) {
        this.savedTime = this.audio.currentTime
      }
      this.audio.muted = true
      this.audio.volume = 0
      this.audio.pause()
      this.removeMediaNotification()
      this.audio.removeAttribute('src')
      this.audio.load()
    }
    this.notify()
  }

  unmute() {
    this.isMuted = false
    this.wasAudibleBeforeLeave = true
    localStorage.setItem('tdv_audio_muted', 'false')
    if (this.audio && typeof document !== 'undefined' && !document.hidden) {
      if (!this.audio.getAttribute('src')) {
        this.audio.src = AUDIO_SOURCES[this.currentSourceIndex]
        if (this.savedTime && Number.isFinite(this.savedTime)) {
          const seekTarget = this.savedTime
          this.audio.addEventListener(
            'loadedmetadata',
            () => {
              try {
                this.audio.currentTime = seekTarget
              } catch (_) {}
            },
            { once: true }
          )
        }
      }
      this.audio.muted = false
      this.audio.volume = 0.5
      const p = this.audio.play()
      if (p !== undefined) {
        p.then(() => {
          this.hasUnlocked = true
          this.showMediaNotification()
          this.notify()
        }).catch((e) => {
          console.warn('[AudioManager] Unmute play blocked:', e)
        })
      } else {
        this.showMediaNotification()
      }
    }
    this.notify()
  }

  showMediaNotification() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.playbackState = 'playing'
      if (typeof MediaMetadata !== 'undefined') {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'Underwater Ambiance',
          artist: 'The Dive Village',
          album: "It's a Community",
          artwork: [
            {
              src: 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691225/TDV-Media/UI/Logo.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        })
      }
      navigator.mediaSession.setActionHandler('play', () => {
        this.unmute()
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        this.mute()
      })
      navigator.mediaSession.setActionHandler('stop', () => {
        this.mute()
      })
    } catch (_) {}
  }

  removeMediaNotification() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.playbackState = 'none'
    } catch (_) {}
    try {
      navigator.mediaSession.metadata = null
    } catch (_) {}
    const actions = ['play', 'pause', 'stop', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack']
    actions.forEach((act) => {
      try {
        navigator.mediaSession.setActionHandler(act, null)
      } catch (_) {}
    })
  }

  attachResumeOnGesture() {
    if (this.resumeListenersAttached) return
    this.resumeListenersAttached = true

    const microEvents = [
      'mousemove',
      'pointermove',
      'wheel',
      'scroll',
      'pointerdown',
      'touchstart',
      'mousedown',
      'click',
      'keydown',
      'focus'
    ]

    const onResumeGesture = () => {
      if (this.isMuted) {
        cleanup()
        return
      }
      if (typeof document !== 'undefined' && document.hidden) return

      if (this.audio) {
        if (!this.audio.getAttribute('src')) {
          this.audio.src = AUDIO_SOURCES[this.currentSourceIndex]
          if (this.savedTime && Number.isFinite(this.savedTime)) {
            const seekTarget = this.savedTime
            this.audio.addEventListener(
              'loadedmetadata',
              () => {
                try {
                  this.audio.currentTime = seekTarget
                } catch (_) {}
              },
              { once: true }
            )
          }
        }
        this.audio.muted = false
        this.audio.volume = 0.5
        const p = this.audio.play()
        if (p !== undefined) {
          p.then(() => {
            this.showMediaNotification()
            this.notify()
            cleanup()
          }).catch(() => {})
        } else {
          this.showMediaNotification()
          this.notify()
          cleanup()
        }
      }
    }

    const cleanup = () => {
      this.resumeListenersAttached = false
      microEvents.forEach((evt) => {
        window.removeEventListener(evt, onResumeGesture, true)
        document.removeEventListener(evt, onResumeGesture, true)
      })
    }

    microEvents.forEach((evt) => {
      window.addEventListener(evt, onResumeGesture, { capture: true, passive: true })
      document.addEventListener(evt, onResumeGesture, { capture: true, passive: true })
    })
  }
}

export const globalAudio = new AudioManager()
export default globalAudio
