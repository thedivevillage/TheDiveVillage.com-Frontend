import { useEffect } from 'react'

export default function SEOHead({
  title = 'The Dive Village | It is a Community',
  description = 'The Dive Village | It is a Community. Experience world-class scuba diving certifications, guided freediving excursions, and premium ocean apparel with certified professional divemasters at The Dive Village.',
  keywords = 'scuba diving, freediving, scuba certification, diving courses, dive center, dive gear, underwater exploration, ocean apparel, dive village',
  canonicalUrl = 'https://thedivevillage.com',
  ogImage = 'https://res.cloudinary.com/q7b4kjd9/image/upload/v1791691225/TDV-Media/UI/Logo.png',
  ogType = 'website'
}) {
  useEffect(() => {
    // Update Title
    document.title = title

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = description

    // Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.name = 'keywords'
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.content = keywords

    // Helper to get or create meta tag
    const setMetaTag = (attrName, attrValue, content) => {
      if (!content) return
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attrName, attrValue)
        document.head.appendChild(el)
      }
      el.content = content
    }

    setMetaTag('name', 'title', title)
    setMetaTag('property', 'og:site_name', 'The Dive Village | It is a Community')
    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:type', ogType)
    setMetaTag('name', 'application-name', 'The Dive Village | It is a Community')
    setMetaTag('name', 'apple-mobile-web-app-title', 'The Dive Village | It is a Community')

    // Full absolute URL for og:image
    const fullImageUrl = ogImage
      ? ogImage.startsWith('http')
        ? ogImage
        : typeof window !== 'undefined'
        ? new URL(ogImage, window.location.origin).href
        : ogImage
      : 'https://res.cloudinary.com/q7b4kjd9/image/upload/v1791691225/TDV-Media/UI/Logo.png'

    setMetaTag('property', 'og:image', fullImageUrl)
    setMetaTag('property', 'og:image:secure_url', fullImageUrl)
    setMetaTag('property', 'og:image:alt', title)
    setMetaTag('property', 'og:url', canonicalUrl || (typeof window !== 'undefined' ? window.location.href : ''))

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', title)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', fullImageUrl)
    setMetaTag('name', 'twitter:url', canonicalUrl || (typeof window !== 'undefined' ? window.location.href : ''))

    // Canonical link tag
    if (typeof document !== 'undefined') {
      let linkCanonical = document.querySelector('link[rel="canonical"]')
      if (!linkCanonical) {
        linkCanonical = document.createElement('link')
        linkCanonical.setAttribute('rel', 'canonical')
        document.head.appendChild(linkCanonical)
      }
      linkCanonical.setAttribute('href', canonicalUrl || window.location.href)
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType])

  return null
}
