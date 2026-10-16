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
