/**
 * Native Share Sheet helper with automatic image file attachment and Clipboard copy fallback.
 */
export async function shareContent({ title, text, url, imageUrl }) {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const shareData = {
    title: title || 'The Dive Village',
    text: text || 'Explore custom dive charters, ocean apparel, and dive training at The Dive Village.',
    url: shareUrl,
  }

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    // Attempt to attach the front image file if provided and supported
    if (imageUrl) {
      try {
        const file = await fetchImageAsFile(imageUrl, title)
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          const fileShareData = {
            ...shareData,
            files: [file],
          }
          if (navigator.canShare(fileShareData)) {
            await navigator.share(fileShareData)
            return { shared: true, withImage: true }
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return { cancelled: true }
        }
        console.warn('[shareContent] File share rejected, falling back to URL share:', err)
      }
    }

    try {
      await navigator.share(shareData)
      return { shared: true }
    } catch (err) {
      if (err.name !== 'AbortError') {
        return copyToClipboard(shareUrl)
      }
      return { cancelled: true }
    }
  }

  return copyToClipboard(shareUrl)
}

async function fetchImageAsFile(imageUrl, title) {
  try {
    if (!imageUrl || typeof window === 'undefined') return null

    // Ensure absolute URL
    const absoluteUrl = imageUrl.startsWith('http')
      ? imageUrl
      : new URL(imageUrl, window.location.origin).href

    const res = await fetch(absoluteUrl, { mode: 'cors' })
    if (!res.ok) return null
    const blob = await res.blob()
    const mimeType = blob.type || 'image/jpeg'
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg'
    const safeTitle = (title || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    return new File([blob], `${safeTitle || 'product'}-front.${ext}`, { type: mimeType })
  } catch (err) {
    console.warn('[shareContent] Could not fetch image as file:', err)
    return null
  }
}

async function copyToClipboard(text) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return { copied: true }
    }
  } catch {
    // Fallback for older browsers
  }
  return { copied: false }
}

