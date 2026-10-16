import { useState, useMemo, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from 'lucide-react'
import LocationDetailModal from './LocationDetailModal'
import LocationImportModal from './LocationImportModal'
import { getImageUrl } from '@/lib/helpers'
import { fetchKSTDetail, exportLocationData } from '@/lib/api'
import { toast } from 'sonner'


const MapDisplay = ({ locations, onOpenDetail }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  // Register global callbacks for Leaflet HTML popup actions
  useEffect(() => {
    window.__kstOpenLocationDetail = (id) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.closePopup()
      }
      const found = (locations || []).find((l) => String(l.id) === String(id))
      if (found && onOpenDetail) {
        onOpenDetail(found)
      }
    }

    window.__kstCloseMapPopup = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.closePopup()
      }
    }
  }, [locations, onOpenDetail])

  // Cleanup map instance and globals on unmount
  useEffect(() => {
    return () => {
      delete window.__kstOpenLocationDetail
      delete window.__kstCloseMapPopup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const escapeHtml = (str) => {
    if (!str) return ''
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const getPointCategory = (kawasanNama = '', namaLokasi = '') => {
    const combined = `${kawasanNama} ${namaLokasi}`.toUpperCase()
    if (
      combined.includes('KEBUN RAYA') ||
      combined.includes('BOTANI') ||
      combined.includes('KR-') ||
      combined.includes('KR ')
    ) {
      return {
        category: 'Kebun Raya',
        color: '#16a34a', // Ijo
        buttonBg: '#16a34a',
      }
    }
    if (
      combined.includes('BRIDA') ||
      combined.includes('BAPPERIDA') ||
      combined.includes('BAPPEDA') ||
      combined.includes('DAERAH')
    ) {
      return {
        category: 'BRIDA',
        color: '#dc2626', // Merah
        buttonBg: '#dc2626',
      }
    }
    return {
      category: 'Kawasan',
      color: '#2563eb', // Biru
      buttonBg: '#2563eb',
    }
  }

  const buildPopupHtml = (loc) => {
    const kawName = loc.jenis_kawasan_nama || loc.kawasan_nama || loc.instansi_nama || ''
    const cat = getPointCategory(kawName, loc.nama)
    const badgeLabel = kawName || cat.category

    const rawDesc = loc.deskripsi || loc.deskripsi_profil || ''
    const cleanDesc =
      rawDesc.replace(/<[^>]*>/g, '').trim() ||
      'Kawasan riset dan inovasi yang berfokus pada pengembangan sains dan teknologi terapan.'

    let tags = []
    if (Array.isArray(loc.tema_riset) && loc.tema_riset.length > 0) {
      tags = loc.tema_riset
    } else if (Array.isArray(loc.fokus_riset) && loc.fokus_riset.length > 0) {
      tags = loc.fokus_riset
    }
    if (tags.length === 0) {
      tags = [loc.pengelola || 'Riset']
    }

    const tagsHtml = tags
      .slice(0, 3)
      .map((tag) => {
        const text = typeof tag === 'object' ? tag.nama || tag.name || 'Riset' : tag
        return `<span style="display:inline-block; background:#f1f5f9; color:#334155; padding:4px 12px; border-radius:9999px; font-size:11px; font-weight:500; white-space:nowrap;">${escapeHtml(text)}</span>`
      })
      .join(' ')

    const safeId = escapeHtml(loc.id)

    return `
      <div style="background:#ffffff; padding:18px 20px 20px 20px; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#0f172a; box-sizing:border-box;">
        <!-- 1. Header: Pill Badge & Close Button -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div style="display:inline-flex; align-items:center; gap:6px; background:${cat.buttonBg}; color:#ffffff; padding:5px 14px; border-radius:9999px; font-size:12px; font-weight:600; box-shadow:0 1px 2px rgba(0,0,0,0.06);">
            <svg style="width:14px; height:14px; flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="8" width="18" height="8" rx="2"></rect>
              <path d="M12 4v4m0 8v4"></path>
            </svg>
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:230px;">
              ${escapeHtml(badgeLabel)}
            </span>
          </div>

          <button type="button" onclick="window.__kstCloseMapPopup()" style="background:transparent; border:none; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#64748b; cursor:pointer; padding:0; transition:all 0.15s ease;" onmouseover="this.style.color='#0f172a'; this.style.backgroundColor='#f1f5f9'" onmouseout="this.style.color='#64748b'; this.style.backgroundColor='transparent'" aria-label="Tutup">
            <svg style="width:16px; height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 2. Title -->
        <h3 style="margin:12px 0 4px 0; font-size:18px; font-weight:800; color:#09090b; letter-spacing:-0.02em; line-height:1.3; font-family:inherit;">
          ${escapeHtml(loc.nama)}
        </h3>

        <!-- 3. Subtitle / MapPin -->
        <div style="display:flex; align-items:center; gap:5px; font-size:12px; color:#64748b; font-weight:500; margin-bottom:10px;">
          <svg style="width:14px; height:14px; flex-shrink:0; color:#94a3b8;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${escapeHtml(loc.kota_provinsi || loc.wilayah || 'Indonesia')}
          </span>
        </div>

        <!-- 4. Description -->
        <p style="margin:0 0 14px 0; font-size:12.5px; color:#475569; line-height:1.55; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
          ${escapeHtml(cleanDesc)}
        </p>

        <!-- 5. Bottom Row: Tags & Button -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding-top:12px; border-top:1px solid #f1f5f9;">
          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:6px; min-width:0; flex:1;">
            ${tagsHtml}
          </div>

          <button type="button" onclick="window.__kstOpenLocationDetail('${safeId}')" style="flex-shrink:0; background:${cat.buttonBg}; color:#ffffff; padding:7px 18px; border-radius:9999px; font-size:12px; font-weight:600; border:none; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,0.06); transition:filter 0.15s ease;" onmouseover="this.style.filter='brightness(0.92)'" onmouseout="this.style.filter='none'">
            Lihat Detail
          </button>
        </div>
      </div>
    `
  }

  const getIcon = (kawasanNama, namaLokasi = '') => {
    const { color } = getPointCategory(kawasanNama, namaLokasi)

    return L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <span style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: ${color};
            opacity: 0.35;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></span>
          <div style="
            background-color: ${color};
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2.5px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.45);
            position: relative;
            z-index: 1;
          "></div>
        </div>
      `,
      className: 'custom-map-point',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    })
  }

  useEffect(() => {
    if (!mapRef.current) return

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([-2.5489, 118.0149], 5)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(mapInstanceRef.current)
    }

    const map = mapInstanceRef.current

    // Delay invalidateSize to ensure container is fully rendered
    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    const bounds = L.latLngBounds()
    let hasPoints = false

    locations.forEach((loc) => {
      if (loc.latitude && loc.longitude) {
        hasPoints = true
        const kawName = loc.jenis_kawasan_nama || loc.kawasan_nama || loc.instansi_nama || 'Kawasan'
        const marker = L.marker([loc.latitude, loc.longitude], { icon: getIcon(kawName, loc.nama) })

        marker.bindTooltip(loc.nama, {
          direction: 'top',
          offset: [0, -10],
          opacity: 0.9,
          className: 'custom-map-tooltip',
        })

        // Anchored popup centered over the pin with solid white background
        marker.bindPopup(buildPopupHtml(loc), {
          className: 'custom-card-leaflet-popup',
          maxWidth: 380,
          minWidth: 320,
          closeButton: false,
          autoPan: true,
          autoPanPadding: [50, 50],
          offset: [0, -10],
        })

        marker.on('click', () => {
          marker.closeTooltip()
          map.panTo([loc.latitude, loc.longitude], { animate: true })
        })

        marker.addTo(map)
        bounds.extend([loc.latitude, loc.longitude])
      }
    })

    if (hasPoints) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 })
    } else {
      map.setView([-2.5489, 118.0149], 5)
    }
  }, [locations])

  return (
    <div className="w-full h-[450px] sm:h-[480px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative z-0 mb-6 bg-zinc-100 dark:bg-zinc-900 shadow-xs">
      <div ref={mapRef} className="w-full h-full absolute inset-0 z-0"></div>
    </div>
  )
}

export default function LocationManagementView({
  locations,
  loading,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
}) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedKSTDetail, setSelectedKSTDetail] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const exportMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const filtered = useMemo(() => {
    const q = (search || '').toLowerCase().trim()
    if (!q) return locations || []
    return (locations || []).filter((item) => {
      if (!item) return false
      const namaMatch = (item.nama || '').toLowerCase().includes(q)
      const kotaMatch = (item.kota_provinsi || item.wilayah || '').toLowerCase().includes(q)
      const jenisMatch = (item.jenis_kawasan_nama || item.kawasan_nama || item.instansi_nama || '').toLowerCase().includes(q)
      const fokusMatch = Array.isArray(item.tema_riset) && item.tema_riset.some(f => f && String(f).toLowerCase().includes(q))
      return namaMatch || kotaMatch || jenisMatch || fokusMatch
    })
  }, [locations, search])

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const paginatedLocations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage])

  const handleOpenDetail = async (item) => {
    try {
      const fullDetail = await fetchKSTDetail(item.id)
      setSelectedKSTDetail(fullDetail)
      setDetailModalOpen(true)
    } catch (err) {
      toast.error('Gagal memuat detail data kawasan')
    }
  }

  const handleExport = async (format = 'xlsx') => {
    try {
      setIsExporting(true)
      toast.info(`Menyiapkan data untuk diekspor ke ${format.toUpperCase()}...`)
      const blob = await exportLocationData(format, search)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      a.download = `export_data_lokasi_${dateStr}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Data lokasi berhasil diekspor ke ${format.toUpperCase()}`)
    } catch (err) {
      toast.error(`Gagal mengekspor data: ${err.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center">
            Data Peta Lokasi
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari lokasi, kota, topik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          {/* Import Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setImportModalOpen(true)}
            className="h-9 gap-1.5 text-xs font-medium border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-2xs whitespace-nowrap cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Import Data</span>
          </Button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isExporting}
              onClick={() => setExportMenuOpen((prev) => !prev)}
              className="h-9 gap-1.5 text-xs font-medium border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-2xs whitespace-nowrap cursor-pointer"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>Export Data</span>
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
            </Button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 p-1 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setExportMenuOpen(false)
                    handleExport('xlsx')
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Format Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExportMenuOpen(false)
                    handleExport('csv')
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Format CSV (.csv)</span>
                </button>
              </div>
            )}
          </div>

          {/* Tambah Lokasi Baru Button */}
          <Button
            size="sm"
            onClick={() => navigate('/data-peta-lokasi/new')}
            className="h-9 gap-1.5 whitespace-nowrap text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tambah Lokasi Baru</span>
          </Button>
        </div>
      </div>

      {/* MAP DISPLAY */}
      <MapDisplay locations={filtered} onOpenDetail={handleOpenDetail} />

      {/* Locations Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Nama & Jenis Kawasan</TableHead>
              <TableHead className="w-44">Wilayah & Kota</TableHead>
              <TableHead className="w-44">Koordinat</TableHead>
              <TableHead>Fokus Riset</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
              <TableHead className="w-28 text-right pr-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="p-8 text-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <span>Memuat data...</span>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-8 text-center text-muted-foreground">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLocations.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center font-mono text-muted-foreground text-[11px]">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground text-xs flex items-center gap-1.5 flex-wrap">
                      <span>{item.nama}</span>
                      {(() => {
                        const jName = item.jenis_kawasan_nama || item.kawasan_nama || item.instansi_nama || "KST"
                        return (
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono h-4">
                            {jName}
                          </Badge>
                        )
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-foreground">{item.kota_provinsi || item.wilayah || '-'}</div>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {item.latitude !== null && item.longitude !== null ? (
                      <span>
                        {Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}
                      </span>
                    ) : (
                      <span className="italic">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(item.tema_riset || []).slice(0, 3).map((f, i) => (
                        <Badge key={i} variant="outline" className="px-1.5 py-0 text-[10px] font-normal h-4">
                          {f}
                        </Badge>
                      ))}
                      {(item.tema_riset || []).length > 3 && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          +{item.tema_riset.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.is_draft || item.status === 'Draft' ? (
                      <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 text-[10px] font-mono">
                        Draft
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-[10px] font-mono">
                        {item.status || 'Aktif'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenDetail(item)}
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(`/data-peta-lokasi/edit/${item.id}`)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(item)}
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {filtered.length > 0 && (
          <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filtered.length)} dari{' '}
              {filtered.length} lokasi
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
              </Button>
              <span className="px-2 font-mono text-[11px] text-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <LocationDetailModal
        kst={selectedKSTDetail}
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedKSTDetail(null)
        }}
      />

      {/* Import Modal */}
      <LocationImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          if (onRefresh) {
            onRefresh()
          } else {
            window.location.reload()
          }
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(val) => !val && setDeleteTarget(null)}>
        <AlertDialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">Hapus Kawasan Terpadu BRIN?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Data <strong>{deleteTarget?.nama}</strong> akan dihapus dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteTarget) {
                  await onDelete(deleteTarget.id)
                  toast.success('Data berhasil dihapus')
                  setDeleteTarget(null)
                }
              }}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
