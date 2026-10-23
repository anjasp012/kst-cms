import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  TreePine,
  FlaskConical,
  ShieldCheck,
  Handshake,
  Layers,
  Compass,
  ChevronLeft,
  ChevronRight,
  Atom,
  Cpu,
  Sprout,
  Users,
  ExternalLink,
  Play,
  Film
} from 'lucide-react'
import { getImageUrl, getThumbnailUrl, isVideoUrl } from '@/lib/helpers'

const ICON_MAP = {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  TreePine,
  FlaskConical,
  ShieldCheck,
  Handshake,
  Layers,
  Compass,
  Atom,
  Cpu,
  Sprout,
  Users,
  ExternalLink,
}

function getFieldIcon(iconName, defaultIcon = FileText) {
  if (!iconName) return defaultIcon
  return ICON_MAP[iconName] || defaultIcon
}

function DynamicFieldBlock({ field }) {
  if (!field) return null
  const isList = Array.isArray(field.value)
  const hasValue = isList
    ? field.value.length > 0 && field.value.some(v => v != null && String(v).trim() !== '')
    : field.value != null && String(field.value).trim() !== ''

  if (!hasValue) return null

  const IconComp = getFieldIcon(field.icon, FileText)

  return (
    <div className="space-y-2 pt-2">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <IconComp className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
        <span>{field.label || field.nama || 'Informasi'}</span>
      </h3>
      {isList ? (
        <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 list-disc list-inside">
          {field.value.map((item, idx) => {
            const strVal = typeof item === 'string' ? item : JSON.stringify(item)
            return (
              <li key={idx} className="leading-relaxed">
                {strVal.includes('<') ? (
                  <span
                    className="inline-block prose prose-xs dark:prose-invert max-w-none [&_p]:inline [&_ul]:list-disc [&_ul]:pl-4"
                    dangerouslySetInnerHTML={{ __html: strVal }}
                  />
                ) : (
                  strVal
                )}
              </li>
            )
          })}
        </ul>
      ) : typeof field.value === 'string' && field.value.includes('<') ? (
        <div
          className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed prose prose-xs dark:prose-invert max-w-none [&_p]:mb-1.5 [&_a]:text-blue-600 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: field.value }}
        />
      ) : (
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line text-justify">
          {String(field.value)}
        </p>
      )}
    </div>
  )
}

export default function LocationDetailModal({ kst, open, onClose }) {
  const [activeTab, setActiveTab] = useState('profil')
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const thumbRefs = useRef([])
  const thumbScrollRef = useRef(null)

  // Drag to scroll state for mouse on desktop
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)
  const hasDragged = useRef(false)

  const handleMouseDown = (e) => {
    isDragging.current = true
    hasDragged.current = false
    startX.current = e.pageX - (thumbScrollRef.current?.offsetLeft || 0)
    scrollLeftStart.current = thumbScrollRef.current?.scrollLeft || 0
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current || !thumbScrollRef.current) return
    const x = e.pageX - (thumbScrollRef.current.offsetLeft || 0)
    const walk = (x - startX.current) * 1.3
    if (Math.abs(walk) > 4) {
      hasDragged.current = true
    }
    thumbScrollRef.current.scrollLeft = scrollLeftStart.current - walk
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  // Reset active photo index and scroll when modal opens or location changes
  useEffect(() => {
    setActivePhotoIdx(0)
    setScrollProgress(0)
    if (thumbScrollRef.current) {
      thumbScrollRef.current.scrollLeft = 0
    }
  }, [kst?.id, open])

  // Track thumbnail slider scroll
  const handleThumbScroll = (e) => {
    const el = e.currentTarget
    const max = el.scrollWidth - el.clientWidth
    if (max > 0) {
      setScrollProgress(el.scrollLeft / max)
    }
  }

  // Auto scroll active thumbnail into view
  useEffect(() => {
    if (thumbRefs.current && thumbRefs.current[activePhotoIdx]) {
      thumbRefs.current[activePhotoIdx]?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [activePhotoIdx])

  // Prepare photos gallery - must be called unconditionally before any return
  const photos = useMemo(() => {
    if (!kst) return []
    const list = []
    if (kst.thumbnail_url) {
      list.push({
        url: getImageUrl(kst.thumbnail_url),
        thumbUrl: getThumbnailUrl(kst.thumbnail_url),
        caption: 'Foto Utama / Tampak Depan'
      })
    }
    if (Array.isArray(kst.galeri)) {
      kst.galeri.forEach((item, idx) => {
        const u = typeof item === 'string' ? item : item.url
        const t = typeof item === 'object' && item.thumbnail_url ? item.thumbnail_url : u
        const c = typeof item === 'object' && item.caption ? item.caption : (item.keterangan || `Dokumentasi ${idx + 1}`)
        const isVideo = (typeof item === 'object' && item.tipe === 'video') || isVideoUrl(u)
        if (u) {
          const resolvedUrl = getImageUrl(u)
          const resolvedThumb = getThumbnailUrl(t)
          // avoid duplicates with thumbnail
          if (!list.some(p => p.url === resolvedUrl)) {
            list.push({ url: resolvedUrl, thumbUrl: resolvedThumb, caption: c, isVideo })
          }
        }
      })
    }
    if (list.length === 0) {
      list.push({
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=400&q=80',
        caption: 'Foto Kawasan'
      })
    }
    return list
  }, [kst])

  if (!kst) return null

  const categoryName = (kst.jenis_kawasan_nama || kst.jenis_kawasan || kst.kawasan_nama || kst.instansi_nama || 'KST').trim()
  const isKebunRaya = categoryName.toLowerCase().includes('kebun') || categoryName.toLowerCase().includes('kr ') || (kst.nama || '').toLowerCase().includes('kr ')
  const isBrida = categoryName.toLowerCase().includes('brida') || categoryName.toLowerCase().includes('bappeda') || categoryName.toLowerCase().includes('bapperida')

  const safePhotoIdx = (activePhotoIdx >= 0 && activePhotoIdx < photos.length) ? activePhotoIdx : 0
  const activePhoto = photos[safePhotoIdx] || photos[0] || { url: '', caption: '' }

  // Category Badge Style
  const getBadgeConfig = () => {
    if (isKebunRaya) {
      return {
        bg: 'bg-[#14532d] text-white',
        icon: Sprout,
        label: categoryName || 'Kebun Raya'
      }
    }
    if (isBrida) {
      return {
        bg: 'bg-[#991b1b] text-white',
        icon: Atom,
        label: categoryName || 'BRIDA'
      }
    }
    return {
      bg: 'bg-[#1e3a8a] text-white',
      icon: Building2,
      label: categoryName || 'Kawasan Riset (KST)'
    }
  }

  const badgeConfig = getBadgeConfig()
  const BadgeIcon = badgeConfig.icon

  // Sub-tabs label
  const tabProfilLabel = isBrida ? 'Profil & Kontak' : (isKebunRaya ? 'Profil & Botani' : 'Profil & Riset')
  const tabEkosistemLabel = isKebunRaya ? 'Tata Kelola & Layanan' : (isBrida ? 'Layanan & Mitra Inovasi' : 'Ekosistem & Layanan')

  // Extra fields grouping on client side (no hardcoded API wrapper)
  const extraList = Array.isArray(kst.extra_fields) ? kst.extra_fields : []

  const isEcosystemField = (ef) => {
    const text = `${ef.slug || ''} ${ef.label || ef.nama || ''}`.toLowerCase()
    // For BRIDA, keep saluran-digital on Profil tab
    if (isBrida && (text.includes('saluran') || text.includes('digital') || text.includes('kontak'))) {
      return false
    }
    return [
      'ekosistem', 'organisasi', 'or-terkait', 'pusat-riset', 'pr-terkait',
      'layanan', 'pemanfaatan', 'saluran', 'digital', 'mitra', 'tata-kelola',
      'tata kelola', 'legalitas', 'kontak', 'kewenangan', 'pic'
    ].some(k => text.includes(k))
  }

  const profileExtraFields = extraList.filter(ef => !isEcosystemField(ef))
  const ecosystemExtraFields = extraList.filter(ef => isEcosystemField(ef))

  // Proportional to 3.5 visible thumbnails out of total photos
  const indicatorWidth = photos.length <= 3.5
    ? 100
    : Math.max(16, Math.min(50, Math.round((3.5 / photos.length) * 100)))

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-[640px] sm:max-w-[720px] w-full max-h-[90vh] overflow-y-auto no-scrollbar p-0 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl">

        <div className="p-5 sm:p-6 pb-6 space-y-3.5">
          {/* 1. Header: Pill Badge & Title & Alamat */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-xs"
              style={{ backgroundColor: isKebunRaya ? '#14532d' : isBrida ? '#881337' : '#1e3a8a', color: '#fff' }}>
              <BadgeIcon className="w-3.5 h-3.5" />
              <span>{badgeConfig.label}</span>
            </div>

            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {kst.nama}
            </h2>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-normal">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="leading-snug">{kst.alamat || kst.kota_provinsi || kst.wilayah || 'Indonesia'}</span>
            </div>
          </div>

          {/* 2. Photo Gallery: Compact Preview, Caption/Counter, 3.5-Item Thumbnail Slider & Indicator */}
          <div className="space-y-2">
            {/* Compact Preview Image or Video Player */}
            <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden bg-black border border-zinc-200/80 dark:border-zinc-800 select-none shadow-xs flex items-center justify-center">
              {activePhoto?.isVideo ? (
                <video
                  key={activePhoto.url}
                  src={activePhoto.url}
                  poster={activePhoto.thumbUrl !== activePhoto.url && !isVideoUrl(activePhoto.thumbUrl) ? activePhoto.thumbUrl : undefined}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={activePhoto?.url || ''}
                  alt={activePhoto?.caption || kst?.nama || 'Foto Kawasan'}
                  className="w-full h-full object-cover transition-opacity duration-200"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80'
                  }}
                />
              )}
            </div>

            {/* Caption & Counter Row with Next/Prev Controls */}
            <div className="flex items-center justify-between px-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="truncate max-w-[70%] font-medium text-zinc-600 dark:text-zinc-300">
                {activePhoto?.caption || 'Foto Kawasan'}
              </span>
              {photos.length > 1 && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx(prev => (prev === 0 ? photos.length - 1 : prev - 1))}
                    className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    aria-label="Foto Sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-zinc-400 dark:text-zinc-500 font-medium px-0.5">
                    {safePhotoIdx + 1}/{photos.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx(prev => (prev === photos.length - 1 ? 0 : prev + 1))}
                    className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    aria-label="Foto Berikutnya"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* 3.5 Thumbnail Items Slider */}
            {photos.length > 1 && (
              <div className="space-y-2">
                <div
                  ref={thumbScrollRef}
                  onScroll={handleThumbScroll}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="flex items-center gap-2.5 overflow-x-auto py-1 no-scrollbar select-none cursor-grab active:cursor-grabbing scroll-smooth"
                >
                  {photos.map((p, idx) => {
                    const isActive = idx === safePhotoIdx
                    return (
                      <button
                        key={idx}
                        ref={(el) => (thumbRefs.current[idx] = el)}
                        type="button"
                        onClick={(e) => {
                          if (hasDragged.current) {
                            e.preventDefault()
                            return
                          }
                          setActivePhotoIdx(idx)
                        }}
                        className={`relative shrink-0 w-[calc((100%-30px)/3.5)] min-w-[calc((100%-30px)/3.5)] max-w-[calc((100%-30px)/3.5)] aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 bg-zinc-900 ${isActive
                          ? 'border-[2.5px] border-blue-600 ring-2 ring-blue-500/20 shadow-md scale-[1.02]'
                          : 'border border-zinc-200 dark:border-zinc-700 opacity-70 hover:opacity-100 hover:border-zinc-400'
                          }`}
                      >
                        {p.isVideo ? (
                          <div className="w-full h-full relative flex items-center justify-center bg-black">
                            {p.thumbUrl && p.thumbUrl !== p.url && !isVideoUrl(p.thumbUrl) ? (
                              <img
                                src={p.thumbUrl}
                                alt={`Video Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                            ) : (
                              <video
                                src={`${p.url}#t=0.5`}
                                preload="metadata"
                                muted
                                className="w-full h-full object-cover pointer-events-none"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center pointer-events-none">
                              <div className="w-6 h-6 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-sm">
                                <Play className="w-3 h-3 fill-current ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-1 left-1.5 px-1 py-0.2 rounded text-[8px] font-bold bg-black/75 text-white font-mono pointer-events-none">
                              VIDEO
                            </span>
                          </div>
                        ) : (
                          <img
                            src={p.thumbUrl || p.url}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover pointer-events-none"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = p.url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80'
                            }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Bottom Slider Position Indicator Track */}
                <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-blue-600 rounded-full transition-all duration-200 ease-out"
                    style={{
                      width: `${indicatorWidth}%`,
                      left: `${scrollProgress * (100 - indicatorWidth)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Navigation Tabs (Only rendered if there are ecosystem extra fields) */}
          {ecosystemExtraFields.length > 0 && (
            <div className="border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-around pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('profil')}
                className={`pb-2.5 flex-1 text-center text-xs sm:text-sm font-semibold transition-all relative ${activeTab === 'profil'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
              >
                {tabProfilLabel}
                {activeTab === 'profil' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ekosistem')}
                className={`pb-2.5 flex-1 text-center text-xs sm:text-sm font-semibold transition-all relative ${activeTab === 'ekosistem'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
              >
                {tabEkosistemLabel}
                {activeTab === 'ekosistem' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            </div>
          )}

          {/* 4. Tab Content: 2-Column Responsive Layout */}
          <div className="pt-2">
            {activeTab === 'profil' || ecosystemExtraFields.length === 0 ? (
              profileExtraFields.length > 0 ? (
                /* Profile with extra fields: Left (Tentang + Lokasi), Right (Profile extra fields) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  {/* LEFT COLUMN: Tentang Kawasan & Lokasi Dimensi */}
                  <div className="space-y-4 sm:pr-3">
                    {kst.deskripsi && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                          <span>
                            {isKebunRaya ? 'Tentang Kebun Raya' : isBrida ? 'Profil Instansi' : 'Tentang Kawasan'}
                          </span>
                        </h3>
                        {kst.deskripsi.includes('<') ? (
                          <div
                            className="prose prose-xs dark:prose-invert max-w-none text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-1.5"
                            dangerouslySetInnerHTML={{ __html: kst.deskripsi }}
                          />
                        ) : (
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line text-justify">
                            {kst.deskripsi}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Lokasi & Dimensi */}
                    <div className={`space-y-2 ${kst.deskripsi ? 'pt-2 border-t border-zinc-100 dark:border-zinc-800/60' : ''}`}>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        <span>Lokasi & Dimensi</span>
                      </h3>
                      <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                        <div>
                          <strong className="font-semibold text-zinc-800 dark:text-zinc-200">&bull; Alamat:</strong>{' '}
                          {kst.alamat || kst.kota_provinsi || '-'}
                        </div>
                        {(kst.latitude ?? kst.koordinat?.latitude) != null && (
                          <div>
                            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">&bull; Latitude:</strong>{' '}
                            {kst.latitude ?? kst.koordinat?.latitude}
                          </div>
                        )}
                        {(kst.longitude ?? kst.koordinat?.longitude) != null && (
                          <div>
                            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">&bull; Longitude:</strong>{' '}
                            {kst.longitude ?? kst.koordinat?.longitude}
                          </div>
                        )}
                        {kst.luas_ha != null && (
                          <div>
                            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">&bull; Luas:</strong>{' '}
                            {kst.luas_ha} Ha
                          </div>
                        )}
                        {kst.pengelola && (
                          <div>
                            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">&bull; Pengelola:</strong>{' '}
                            {kst.pengelola}
                          </div>
                        )}
                        {kst.status && (
                          <div>
                            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">&bull; Status:</strong>{' '}
                            {kst.status}
                          </div>
                        )}
                        {(kst.telepon || kst.email || kst.website) && (
                          <div className="pt-1.5 space-y-1 border-t border-zinc-100 dark:border-zinc-800/60 mt-1.5">
                            {kst.telepon && (
                              <div className="flex items-start gap-1.5">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 w-16 shrink-0">&bull; Telepon:</span>
                                <span>{kst.telepon}</span>
                              </div>
                            )}
                            {kst.email && (
                              <div className="flex items-start gap-1.5">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 w-16 shrink-0">&bull; Email:</span>
                                <a href={`mailto:${kst.email}`} className="text-blue-600 hover:underline">{kst.email}</a>
                              </div>
                            )}
                            {kst.website && (
                              <div className="flex items-start gap-1.5">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 w-16 shrink-0">&bull; Website:</span>
                                <a href={kst.website.startsWith('http') ? kst.website : `http://${kst.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                                  {kst.website}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Profile Extra Fields */}
                  <div className="space-y-4 sm:pl-3 pt-2 sm:pt-0">
                    {profileExtraFields.map((field) => (
                      <DynamicFieldBlock key={field.id || field.slug} field={field} />
                    ))}
                  </div>
                </div>
              ) : (
                /* Profile WITHOUT extra fields: Left (Tentang), Right (Lokasi & Dimensi) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div className="space-y-4 sm:pr-3">
                    {kst.deskripsi && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                          <span>
                            {isKebunRaya ? 'Tentang Kebun Raya' : isBrida ? 'Profil Instansi' : 'Tentang Kawasan'}
                          </span>
                        </h3>
                        {kst.deskripsi.includes('<') ? (
                          <div
                            className="prose prose-xs dark:prose-invert max-w-none text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-1.5"
                            dangerouslySetInnerHTML={{ __html: kst.deskripsi }}
                          />
                        ) : (
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line text-justify">
                            {kst.deskripsi}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 sm:pl-3 pt-2 sm:pt-0">
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        <span>Lokasi & Dimensi</span>
                      </h3>
                      <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                        <div>
                          <strong className="font-semibold text-zinc-800 dark:text-zinc-200">&bull; Alamat:</strong>{' '}
                          {kst.alamat || kst.kota_provinsi || '-'}
                        </div>
                        {(kst.latitude ?? kst.koordinat?.latitude) != null && (
                          <div>
                            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">&bull; Latitude:</strong>{' '}
                            {kst.latitude ?? kst.koordinat?.latitude}
                          </div>
                        )}
                        {(kst.longitude ?? kst.koordinat?.longitude) != null && (
                          <div>
                            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">&bull; Longitude:</strong>{' '}
                            {kst.longitude ?? kst.koordinat?.longitude}
                          </div>
                        )}
                        {kst.luas_ha != null && (
                          <div>
                            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">&bull; Luas:</strong>{' '}
                            {kst.luas_ha} Ha
                          </div>
                        )}
                        {kst.pengelola && (
                          <div>
                            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">&bull; Pengelola:</strong>{' '}
                            {kst.pengelola}
                          </div>
                        )}
                        {kst.status && (
                          <div>
                            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">&bull; Status:</strong>{' '}
                            {kst.status}
                          </div>
                        )}
                        {(kst.telepon || kst.email || kst.website) && (
                          <div className="pt-1.5 space-y-1 border-t border-zinc-100 dark:border-zinc-800/60 mt-1.5">
                            {kst.telepon && (
                              <div className="flex items-start gap-1.5">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 w-16 shrink-0">&bull; Telepon:</span>
                                <span>{kst.telepon}</span>
                              </div>
                            )}
                            {kst.email && (
                              <div className="flex items-start gap-1.5">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 w-16 shrink-0">&bull; Email:</span>
                                <a href={`mailto:${kst.email}`} className="text-blue-600 hover:underline">{kst.email}</a>
                              </div>
                            )}
                            {kst.website && (
                              <div className="flex items-start gap-1.5">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 w-16 shrink-0">&bull; Website:</span>
                                <a href={kst.website.startsWith('http') ? kst.website : `http://${kst.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                                  {kst.website}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* TAB 2: EKOSISTEM & LAYANAN (Only rendered if ecosystemExtraFields exist) */
              ecosystemExtraFields.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  {/* LEFT COLUMN */}
                  <div className="space-y-4 sm:pr-3">
                    {ecosystemExtraFields.filter((_, idx) => idx % 2 === 0).map((field) => (
                      <DynamicFieldBlock key={field.id || field.slug} field={field} />
                    ))}
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-4 sm:pl-3 pt-4 sm:pt-0">
                    {ecosystemExtraFields.filter((_, idx) => idx % 2 === 1).map((field) => (
                      <DynamicFieldBlock key={field.id || field.slug} field={field} />
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>

        </div>

      </DialogContent>
    </Dialog>
  )
}

