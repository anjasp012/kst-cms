/**
 * Application Helpers & Utility Functions
 * Dipisahkan dari src/lib/utils.js agar TIDAK tertimpa saat menjalankan:
 * npx shadcn@latest apply / add
 */

export function getImageUrl(url) {
  if (!url) return ''
  // If url is an object (e.g. from API upload response), extract the string URL
  if (typeof url === 'object') {
    url = url.relative_url || url.file_url || url.url || ''
  }
  if (typeof url !== 'string') return ''

  // Strip hardcoded localhost / 127.0.0.1 if old URL was stored in DB
  let clean = url.replace(/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/, '')
  if (clean.startsWith('/')) {
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')
    return backendUrl ? `${backendUrl}${clean}` : clean
  }
  return clean
}

export function isVideoUrl(val) {
  if (!val) return false
  if (typeof val === 'object') {
    if (val.type?.startsWith('video')) return true
    if (val.tipe === 'video') return true
    val = val.url || val.relative_url || val.file_url || ''
  }
  const str = String(val || '').toLowerCase()
  return /\.(mp4|webm|mov|m4v|ogg|avi|mkv)(\?.*)?$/i.test(str)
}

// In-memory cache for extracted video frame data URLs
const videoThumbCache = new Map()

export function captureVideoFrame(fileOrUrl, seekTime = 1.0) {
  if (!fileOrUrl) return Promise.resolve(null)
  const isFile = typeof Blob !== 'undefined' && (fileOrUrl instanceof Blob || fileOrUrl instanceof File)
  const cacheKey = isFile ? `${fileOrUrl.name}_${fileOrUrl.size}_${fileOrUrl.lastModified}` : String(fileOrUrl)
  
  if (videoThumbCache.has(cacheKey)) {
    return Promise.resolve(videoThumbCache.get(cacheKey))
  }

  return new Promise((resolve) => {
    try {
      const srcUrl = isFile ? URL.createObjectURL(fileOrUrl) : getImageUrl(fileOrUrl)
      const video = document.createElement('video')
      video.crossOrigin = 'anonymous'
      video.muted = true
      video.playsInline = true
      video.preload = 'metadata'
      video.src = srcUrl

      let isFinished = false
      const timeout = setTimeout(() => {
        cleanup()
        resolve(null)
      }, 6000)

      const cleanup = () => {
        clearTimeout(timeout)
        if (isFile) {
          try { URL.revokeObjectURL(srcUrl) } catch (_) {}
        }
        video.onloadedmetadata = null
        video.onseeked = null
        video.onerror = null
      }

      video.onloadedmetadata = () => {
        const dur = video.duration || 1
        video.currentTime = Math.min(seekTime, Math.max(0.1, dur * 0.25))
      }

      video.onseeked = () => {
        if (isFinished) return
        isFinished = true
        try {
          const w = Math.min(video.videoWidth || 640, 800)
          const h = Math.min(video.videoHeight || 360, 450)
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0, w, h)
          canvas.toBlob((blob) => {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
            const result = { blob, dataUrl }
            videoThumbCache.set(cacheKey, result)
            cleanup()
            resolve(result)
          }, 'image/jpeg', 0.85)
        } catch (_) {
          cleanup()
          resolve(null)
        }
      }

      video.onerror = () => {
        if (isFinished) return
        isFinished = true
        cleanup()
        resolve(null)
      }
    } catch (_) {
      resolve(null)
    }
  })
}

export function getThumbnailUrl(url) {
  if (!url) return ''
  // If url is an object (e.g. from gallery item or API upload response)
  if (typeof url === 'object') {
    url = url.thumbnail_url || url.thumbnail_relative_url || url.relative_url || url.file_url || url.url || ''
  }
  if (typeof url !== 'string') return ''

  // If already pointing to /uploads/thumbnails/
  if (url.includes('/uploads/thumbnails/')) {
    return getImageUrl(url)
  }

  // If it's a video file, it doesn't have a direct /uploads/thumbnails/ path unless generated as .jpg
  if (isVideoUrl(url)) {
    return getImageUrl(url)
  }

  // Convert /uploads/ to /uploads/thumbnails/
  if (url.includes('/uploads/')) {
    const thumbUrl = url.replace('/uploads/', '/uploads/thumbnails/')
    return getImageUrl(thumbUrl)
  }

  return getImageUrl(url)
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch (e) {
    return dateStr
  }
}

export function getTrlBadgeColor(trl) {
  if (trl <= 3) return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  if (trl <= 6) return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
}

export function getTrlCategory(trl) {
  if (trl <= 3) return 'Riset Dasar / Konsep'
  if (trl <= 6) return 'Pengembangan & Uji Lab'
  return 'Hilirisasi & Siap Terap'
}
