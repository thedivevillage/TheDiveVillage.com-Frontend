import LazyVideo from './LazyVideo'
import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import SectionReveal from './SectionReveal'
import Button from './Button'
import { GALLERY_ITEMS } from '../utils/galleryData'

export default function GalleryPreview() {
  const navigate = useNavigate()
  const scrollContainerRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const [isHovered, setIsHovered] = useState(false)
  const [itemsList] = useState(GALLERY_ITEMS)

  const previewItems = itemsList.filter(item => item.type === 'image').slice(0, 10)

  const goToGallery = () => navigate('/gallery')

  // Auto scroll from left to right using smooth requestAnimationFrame only when visible
  useEffect(() => {
    let animId
    let isVisible = false
    let lastTime = performance.now()
    let cachedThirdWidth = scrollContainerRef.current ? scrollContainerRef.current.scrollWidth / 3 : 1000

    const handleResize = () => {
      if (scrollContainerRef.current) {
        cachedThirdWidth = scrollContainerRef.current.scrollWidth / 3
      }
    }
    window.addEventListener('resize', handleResize, { passive: true })

    const startLoop = () => {
      if (!animId && isVisible) {
        lastTime = performance.now()
        animId = requestAnimationFrame(loop)
      }
    }

    const stopLoop = () => {
      if (animId) {
        cancelAnimationFrame(animId)
        animId = null
      }
    }

    const loop = (currentTime) => {
      if (!isVisible) {
        animId = null
        return
      }

      const delta = (currentTime - lastTime) / 1000
      lastTime = currentTime

      if (!isDragging.current && !isHovered && scrollContainerRef.current) {
        // Shift smoothly at ~60px/s (scroll right -> content moves left)
        const scrollSpeed = (typeof window !== 'undefined' && window.innerWidth < 640) ? 22 : 60
        scrollContainerRef.current.scrollLeft += scrollSpeed * delta
        if (scrollContainerRef.current.scrollLeft >= cachedThirdWidth * 2) {
          scrollContainerRef.current.scrollLeft = cachedThirdWidth
        }
      }
      animId = requestAnimationFrame(loop)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting
          if (isVisible) {
            startLoop()
          } else {
            stopLoop()
          }
        })
      },
      { threshold: 0.05, rootMargin: '100px 0px' }
    )

    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current)
    }

    return () => {
      stopLoop()
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [isHovered])

  // Initialize scroll position in the middle so left-to-right scrolling works instantly
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth / 3
    }
  }, [])



  const handlePointerDown = (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    isDragging.current = true
    const clientX = e.pageX !== undefined ? e.pageX : (e.clientX || 0)
    startX.current = clientX - scrollContainerRef.current.offsetLeft
    scrollLeft.current = scrollContainerRef.current.scrollLeft
  }

  const handlePointerLeave = (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    isDragging.current = false
    setIsHovered(false)
  }

  const handlePointerUp = (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    isDragging.current = false
  }

  const handlePointerMove = (e) => {
    if (!isDragging.current) return
    if (e && e.stopPropagation) e.stopPropagation()
    e.preventDefault()
    const clientX = e.pageX !== undefined ? e.pageX : (e.clientX || 0)
    const x = clientX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX.current) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk
  }

  return (
    <section id="gallery" data-no-bg-drag="true" className="relative py-16 sm:py-20 scroll-mt-20 pointer-events-auto overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="mb-12 text-center">
          <h2
            className="font-heading text-h2 font-bold text-white"
            style={{ textShadow: '0 2px 14px rgba(0, 0, 0, 0.85), 0 1px 4px rgba(0, 0, 0, 0.95)' }}
          >
            The Dive Village <span className="font-heading font-bold text-accent">Gallery</span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl text-white font-medium text-center"
            style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.85), 0 1px 4px rgba(0, 0, 0, 0.95)' }}
          >
            Where the sea is your classroom, playground, and escape.
          </p>
        </SectionReveal>
      </div>

      {/* Infinite scroll marquee & drag gallery */}
      <div 
        data-no-bg-drag="true"
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        <div 
          ref={scrollContainerRef}
          data-no-bg-drag="true"
          onMouseDown={handlePointerDown}
          onMouseLeave={handlePointerLeave}
          onMouseUp={handlePointerUp}
          onMouseMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex gap-2.5 sm:gap-4 overflow-x-auto scrollbar-none no-scrollbar cursor-grab active:cursor-grabbing select-none py-4 px-3 sm:px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {[...previewItems, ...previewItems, ...previewItems].map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              onClick={goToGallery}
              className="relative flex-shrink-0 w-[44vw] min-w-[155px] max-w-[210px] aspect-square sm:aspect-auto sm:w-[230px] sm:h-[310px] lg:w-[260px] lg:h-[350px] rounded-2xl overflow-hidden border border-white/20 shadow-none group cursor-pointer bg-transparent"
            >
              {item.type === 'video' ? (
                <LazyVideo
                  src={item.src}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              ) : (
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />
              )}
              {/* Title without black gradient overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-2.5 sm:p-4 pointer-events-none">
                <h4
                  className="text-white font-heading font-bold text-xs sm:text-base leading-tight drop-shadow-md truncate"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="mt-10 text-center">
          <Button
            onClick={goToGallery}
            variant="secondary"
            className="!border-white/30 !bg-white/15 !text-white backdrop-blur-xl transition-all duration-300 hover:!bg-[#FFCD00] hover:!text-navy hover:!border-[#FFCD00] shadow-md"
          >
            View Full Gallery
          </Button>
        </SectionReveal>
      </div>
    </section>
  )
}
