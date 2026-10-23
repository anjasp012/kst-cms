import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import CoordinatePicker from '@/components/ui/CoordinatePicker'
import SimpleEditor from '@/components/ui/SimpleEditor'
import {
  Building2,
  MapPin,
  Upload,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Award,
  Users,
  FlaskConical,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Save,
  Compass,
  Map,
  FileText,
  AlertCircle,
  TreePine,
  ShieldCheck,
  Handshake,
  Globe,
  Phone,
  Mail,
  ChevronDown,
  X,
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Atom,
  HelpCircle,
  Search,
  ListPlus,
  Info,
  Tag,
  GripVertical,
  Film,
  Play
} from 'lucide-react'
import {
  uploadFile,
  fetchKSTDetail,
  createKST,
  updateKST,
  fetchJenisKawasan,
  fetchFieldLabels,
  fetchThemes as fetchFokusRiset,
  createFokusRiset
} from '@/lib/api'
import { getImageUrl, isVideoUrl, captureVideoFrame } from '@/lib/helpers'
import {
  fetchProvinces,
  fetchRegencies,
  mapProvinceToWilayah,
  formatCityName,
  formatProvinceName,
  getProvinceCoordinates,
  geocodeCity
} from '@/lib/wilayah'
import { toast } from 'sonner'

// Flat Preset Labels for quick optional fields (Unified list, no categories)
const PRESET_LABELS = [
  { nama: 'Fokus Riset', placeholder: 'Contoh: Bioteknologi, Maritim, Kebumian' },
  { nama: 'Fasilitas & Laboratorium', placeholder: 'Contoh: Lab Pengujian Kimia, Cleanroom' },
  { nama: 'Pusat Riset (PR) Terkait', placeholder: 'PR Limnologi, PR Bioteknologi' },
  { nama: 'Organisasi Riset (OR) Terkait', placeholder: 'OR Penerbangan, OR Energi' },
  { nama: 'Saluran Komunikasi & Akses Digital', placeholder: 'Website, email, nomor telepon, media sosial, atau saluran resmi...' },
  { nama: 'Koleksi Unggulan', placeholder: 'Contoh: Tumbuhan Kayu Kalimantan, Anggrek' },
  { nama: 'Yang Bisa Ditemui & Dilakukan', placeholder: 'Edukasi botani, observasi antariksa' },
  { nama: 'Pemanfaatan & Layanan', placeholder: 'Uji Kompatibilitas, Pengujian Material' },
  { nama: 'Tata Kelola & Legalitas', placeholder: 'SK Bupati No. 12/2022' },
  { nama: 'Pendamping / PIC', placeholder: 'Nama Pendamping / Satker BRIN' },
  { nama: 'Program Inovasi Daerah', placeholder: 'Fasilitasi HKI, Inkubasi Startup' },
  { nama: 'Sumber & Catatan', placeholder: 'Catatan internal atau tautan sumber data' }
]

export default function LocationFormPage({ onSaveSuccess }) {
  const navigate = useNavigate()
  const location = useLocation()
  const match = location.pathname.match(/\/(?:data-peta-lokasi|data-peta-kawasan|peta-kawasan|kst)\/edit\/([^/]+)/)
  const id = match ? match[1] : null
  const isEdit = Boolean(id)

  const [loadingInitial, setLoadingInitial] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [isDraggingGallery, setIsDraggingGallery] = useState(false)
  const [draggedCardIndex, setDraggedCardIndex] = useState(null)

  // Active Tab: 'utama' or field.id
  const [activeTab, setActiveTab] = useState('utama')
  const [showValidation, setShowValidation] = useState(false)

  // Kategori / Pilar Utama (tanpa parent_id) & Sub-Jenis
  const [jenisKawasanList, setJenisKawasanList] = useState([])
  const [selectedUtamaId, setSelectedUtamaId] = useState('')
  const [isCustomJenisKawasan, setIsCustomJenisKawasan] = useState(false)

  // Daftar Kategori Utama (semua item yang tidak punya parent_id)
  const kategoriUtamaList = useMemo(() => {
    const list = jenisKawasanList.filter((jk) => !jk.parent_id && jk.nama)
    if (list.length > 0) return list
    return [
      { id: 'kawasan', nama: 'Kawasan', deskripsi: 'Pilar Induk Kawasan Riset & Inovasi' },
      { id: 'brida', nama: 'BRIDA', deskripsi: 'Riset & Inovasi Daerah' },
      { id: 'kebun_raya', nama: 'Kebun Raya', deskripsi: 'Botani & Konservasi Ex-situ' },
    ]
  }, [jenisKawasanList])

  // Entitas utama yang sedang aktif/dipilih
  const selectedUtama = useMemo(() => {
    return kategoriUtamaList.find((k) => k.id === selectedUtamaId) || kategoriUtamaList[0] || null
  }, [kategoriUtamaList, selectedUtamaId])

  // Sub-jenis kawasan milik kategori utama terpilih
  const subJenisList = useMemo(() => {
    if (!selectedUtama) return []
    return jenisKawasanList.filter(
      (jk) => jk.parent_id === selectedUtama.id && jk.nama
    )
  }, [jenisKawasanList, selectedUtama])
  const [provinces, setProvinces] = useState([])
  const [regencies, setRegencies] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedRegencyId, setSelectedRegencyId] = useState('')
  const [loadingWilayah, setLoadingWilayah] = useState(false)
  const [mapTarget, setMapTarget] = useState(null)

  // Master Labels from API & + Dropdown State
  const [masterLabels, setMasterLabels] = useState([])
  const [fokusRisetMaster, setFokusRisetMaster] = useState([])
  const [fokusInput, setFokusInput] = useState('')
  const [savingFokusTag, setSavingFokusTag] = useState(false)
  const [openAddOptionalMenu, setOpenAddOptionalMenu] = useState(false)
  const [searchOptionalQuery, setSearchOptionalQuery] = useState('')
  const dropdownRef = useRef(null)

  // Main Form Data State
  const [formData, setFormData] = useState({
    nama: '',
    slug: '',
    deskripsi: '',
    jenis_kawasan_nama: 'Kawasan Sains dan Teknologi',
    pengelola: 'BRIN',
    status: 'Aktif',
    tahun_operasi: '',
    provinsi_kode: '',
    kabupaten_kota_kode: '',
    wilayah: 'Jawa',
    kota_provinsi: '',
    alamat: '',
    luas_ha: '',
    latitude: '',
    longitude: '',
    thumbnail_url: '',
    galeri: [],
    // Dynamic optional fields (saved in nilai_data_lokasi)
    extra_fields: []
  })

  // Close dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenAddOptionalMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load Provinces, Jenis Kawasan, Master Labels & Master Fokus Riset on Mount
  useEffect(() => {
    let isMounted = true
    Promise.all([
      fetchProvinces().catch(() => []),
      fetchJenisKawasan().catch(() => []),
      fetchFieldLabels().catch(() => []),
      fetchFokusRiset().catch(() => [])
    ]).then(([provs, jkList, labels, frList]) => {
      if (!isMounted) return
      setProvinces(provs || [])
      setJenisKawasanList(jkList || [])
      setFokusRisetMaster(frList || [])
      if (Array.isArray(labels) && labels.length > 0) {
        setMasterLabels(labels)
      } else {
        setMasterLabels(PRESET_LABELS)
      }
    })

    return () => { isMounted = false }
  }, [])

  // Load Initial Detail if Edit Mode
  useEffect(() => {
    if (!isEdit) return
    let isMounted = true

    const loadDetail = async () => {
      try {
        setLoadingInitial(true)
        const data = await fetchKSTDetail(id)
        if (!isMounted || !data) return

        const currentJenis = data.jenis_kawasan_nama || data.kawasan_nama || data.instansi_nama || ''

        // Prepare galeri
        const rawGaleri = Array.isArray(data.galeri) ? data.galeri : []
        const cleanGaleri = rawGaleri
          .map((g, idx) => {
            if (typeof g === 'string') {
              const isVid = /\.(mp4|webm|mov|m4v|ogg)$/i.test(g)
              return { url: g, thumbnail_url: null, caption: '', sort: idx, tipe: isVid ? 'video' : 'foto', type: isVid ? 'video' : 'foto' }
            }
            let url = g?.url || ''
            if (typeof url === 'object' && url !== null) {
              url = url.relative_url || url.file_url || url.url || ''
            }
            let thumbUrl = g?.thumbnail_url || null
            if (typeof thumbUrl === 'object' && thumbUrl !== null) {
              thumbUrl = thumbUrl.relative_url || thumbUrl.file_url || thumbUrl.url || null
            }
            const urlStr = String(url || '')
            const isVid = (g?.tipe === 'video') || (g?.type === 'video') || /\.(mp4|webm|mov|m4v|ogg)$/i.test(urlStr)
            return {
              url: urlStr,
              thumbnail_url: thumbUrl ? String(thumbUrl) : null,
              caption: g?.caption || g?.keterangan || '',
              sort: g?.sort != null ? Number(g.sort) : idx,
              tipe: isVid ? 'video' : 'foto',
              type: isVid ? 'video' : 'foto'
            }
          })
          .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))

        let rawThumb = data.thumbnail_url || ''
        if (typeof rawThumb === 'object' && rawThumb !== null) {
          rawThumb = rawThumb.relative_url || rawThumb.file_url || rawThumb.url || ''
        }
        const cleanThumb = String(rawThumb || '')

        // Auto-detect kategori utama dari jenis_kawasan
        const currentLower = currentJenis.toLowerCase()
        const matchedChild = jenisKawasanList.find(
          (jk) => jk.parent_id && jk.nama?.toLowerCase() === currentLower
        )
        if (matchedChild && matchedChild.parent_id) {
          setSelectedUtamaId(matchedChild.parent_id)
        } else {
          const matchedUtama = jenisKawasanList.find(
            (jk) => !jk.parent_id && (
              jk.nama?.toLowerCase() === currentLower ||
              currentLower.includes(jk.nama?.toLowerCase())
            )
          )
          if (matchedUtama) {
            setSelectedUtamaId(matchedUtama.id)
          }
        }

        // --- ASSEMBLE EXTRA FIELDS (DYNAMIC OPTIONAL FIELDS) ---
        let assembledExtraFields = []
        if (Array.isArray(data.extra_fields) && data.extra_fields.length > 0) {
          assembledExtraFields = data.extra_fields.map((ef, idx) => {
            let val = ef.value
            if (Array.isArray(val)) {
              // preserve array
            } else if (typeof val === 'string') {
              const trimmed = val.trim()
              if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                  const parsed = JSON.parse(trimmed)
                  if (Array.isArray(parsed)) val = parsed
                } catch (_) { }
              }
            }
            return {
              id: ef.id || `ef_${Date.now()}_${idx}`,
              field_label_id: ef.field_label_id || null,
              label: ef.label || 'Data Tambahan',
              slug: ef.slug || '',
              value: val != null ? val : ['']
            }
          })
        } else {
          // Backward-compatibility: auto-migrate legacy columns into extra_fields
          const now = Date.now()
          if (data.website || data.telepon || data.email) {
            const contactItems = [data.website, data.telepon, data.email].filter(Boolean)
            if (contactItems.length > 0) {
              assembledExtraFields.push({
                id: `ef_saluran_${now}`,
                label: 'Saluran Komunikasi & Akses Digital',
                slug: 'saluran-digital',
                value: contactItems
              })
            }
          }
          if (Array.isArray(data.info_profil) && data.info_profil.length > 0) {
            data.info_profil.forEach((b, bIdx) => {
              assembledExtraFields.push({
                id: `ef_prof_${now}_${bIdx}`,
                label: b.judul || 'Info Profil',
                tipe: b.tipe === 'list' ? 'list' : 'text',
                value: b.items || b.konten || ''
              })
            })
          }
          if (Array.isArray(data.info_ekosistem) && data.info_ekosistem.length > 0) {
            data.info_ekosistem.forEach((b, bIdx) => {
              assembledExtraFields.push({
                id: `ef_eko_${now}_${bIdx}`,
                label: b.judul || 'Info Ekosistem',
                tipe: b.tipe === 'list' ? 'list' : 'text',
                value: b.items || b.konten || ''
              })
            })
          }
          if (data.tata_kelola) {
            if (data.tata_kelola.uptd_pengelola) {
              assembledExtraFields.push({ id: `ef_uptd_${now}`, label: 'UPTD Pengelola', tipe: 'text', value: data.tata_kelola.uptd_pengelola })
            }
            if (data.tata_kelola.tingkat_manajemen) {
              assembledExtraFields.push({ id: `ef_tm_${now}`, label: 'Tingkat Manajemen', tipe: 'text', value: data.tata_kelola.tingkat_manajemen })
            }
            if (data.tata_kelola.kewenangan) {
              assembledExtraFields.push({ id: `ef_kew_${now}`, label: 'Kewenangan', tipe: 'text', value: data.tata_kelola.kewenangan })
            }
            if (data.tata_kelola.pendamping_pic) {
              assembledExtraFields.push({ id: `ef_pic_${now}`, label: 'Pendamping / PIC', tipe: 'text', value: data.tata_kelola.pendamping_pic })
            }
          }
        }

        const provKode = data.provinsi_kode || ''
        const kabKode = data.kabupaten_kota_kode || ''

        setFormData({
          nama: data.nama || '',
          slug: data.slug || '',
          deskripsi: data.deskripsi || data.deskripsi_profil || '',
          jenis_kawasan_nama: currentJenis,
          pengelola: data.pengelola || 'BRIN',
          status: data.status || 'Aktif',
          tahun_operasi: data.tahun_operasi || '',
          provinsi_kode: provKode,
          kabupaten_kota_kode: kabKode,
          wilayah: data.wilayah || 'Jawa',
          kota_provinsi: data.kota_provinsi || '',
          alamat: data.alamat || '',
          luas_ha: data.luas_ha != null ? String(data.luas_ha) : '',
          latitude: (() => {
            const v = data.latitude != null ? data.latitude : (data.koordinat?.latitude != null ? data.koordinat.latitude : (data.koordinat?.lat != null ? data.koordinat.lat : (data.lat != null ? data.lat : null)))
            return v != null ? String(v) : ''
          })(),
          longitude: (() => {
            const v = data.longitude != null ? data.longitude : (data.koordinat?.longitude != null ? data.koordinat.longitude : (data.koordinat?.lng != null ? data.koordinat.lng : (data.lng != null ? data.lng : null)))
            return v != null ? String(v) : ''
          })(),
          thumbnail_url: cleanThumb,
          galeri: cleanGaleri,
          extra_fields: assembledExtraFields
        })

        setSelectedProvinceId(provKode)
        setSelectedRegencyId(kabKode)

        if (provKode) {
          fetchRegencies(provKode).then(regs => {
            if (isMounted) setRegencies(regs || [])
          }).catch(err => {
            console.error('Failed to load regencies for edit:', err)
          })
        }

      } catch (err) {
        console.error('[Edit Load Error]:', err)
        toast.error(err.message || 'Gagal memuat data lokasi')
      } finally {
        if (isMounted) setLoadingInitial(false)
      }
    }

    loadDetail()
    return () => { isMounted = false }
  }, [id, isEdit])

  // Auto generate slug from nama directly
  const generateSlug = (text) => {
    return (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const handleNamaChange = (newNama) => {
    setFormData(prev => {
      const prevAutoSlug = generateSlug(prev.nama)
      const shouldAutoUpdateSlug = !prev.slug || prev.slug === prevAutoSlug || !isEdit
      return {
        ...prev,
        nama: newNama,
        slug: shouldAutoUpdateSlug ? generateSlug(newNama) : prev.slug
      }
    })
  }

  // Sinkronisasi otomatis selectedUtamaId bila belum terpasang atau baru selesai load data
  useEffect(() => {
    if (!kategoriUtamaList.length) return

    // Jika sedang dalam mode ketik kustom dan selectedUtamaId sudah ada, jangan pernah ubah selectedUtamaId
    if (isCustomJenisKawasan && selectedUtamaId) return

    const currentJenis = (formData.jenis_kawasan_nama || '').trim().toLowerCase()

    // Jika jenis_kawasan_nama sedang kosong (misal baru klik ketik kustom atau user menghapus teks), pertahankan pilar aktif
    if (!currentJenis) {
      if (!selectedUtamaId) {
        const defaultPilar = kategoriUtamaList.find((k) => k.nama.toLowerCase() === 'kawasan' || k.nama.toLowerCase().includes('sains')) || kategoriUtamaList[0]
        if (defaultPilar) setSelectedUtamaId(defaultPilar.id)
      }
      return
    }

    // Jika selectedUtamaId sudah cocok dengan jenis_kawasan_nama (utama langsung atau anaknya), biarkan
    if (selectedUtamaId) {
      const curUtama = kategoriUtamaList.find((k) => k.id === selectedUtamaId)
      if (curUtama) {
        if (currentJenis === curUtama.nama?.toLowerCase()) return
        const isChildOfCur = jenisKawasanList.some(
          (jk) => jk.parent_id === curUtama.id && jk.nama?.toLowerCase() === currentJenis
        )
        if (isChildOfCur) return
      }
    }

    // 1. Cek jika child item
    const childMatch = jenisKawasanList.find(
      (jk) => jk.parent_id && jk.nama?.trim().toLowerCase() === currentJenis
    )
    if (childMatch && childMatch.parent_id) {
      setSelectedUtamaId(childMatch.parent_id)
      return
    }

    // 2. Cek jika nama kategori utama langsung
    const utamaExact = kategoriUtamaList.find(
      (k) => k.nama?.trim().toLowerCase() === currentJenis
    )
    if (utamaExact) {
      setSelectedUtamaId(utamaExact.id)
      return
    }

    // 3. Cek fuzzy match (HANYA jika currentJenis memiliki teks minimal 3 karakter)
    if (currentJenis.length >= 3) {
      const fuzzy = kategoriUtamaList.find((k) => {
        const kName = k.nama?.trim().toLowerCase()
        return kName && (currentJenis.includes(kName) || kName.includes(currentJenis))
      })
      if (fuzzy) {
        setSelectedUtamaId(fuzzy.id)
        return
      }
    }

    // 4. Default ke Kawasan jika selectedUtamaId belum terpasang
    if (!selectedUtamaId) {
      const kawasanDef = kategoriUtamaList.find((k) => k.nama.toLowerCase() === 'kawasan' || k.nama.toLowerCase().includes('sains'))
      setSelectedUtamaId(kawasanDef?.id || kategoriUtamaList[0].id)
    }
  }, [jenisKawasanList, kategoriUtamaList, formData.jenis_kawasan_nama, selectedUtamaId, isCustomJenisKawasan])

  // Handle switching Kategori Utama
  const handlePilarChange = (utamaItem) => {
    setSelectedUtamaId(utamaItem.id)
    setIsCustomJenisKawasan(false)
    const children = jenisKawasanList.filter(
      (jk) => jk.parent_id === utamaItem.id && jk.nama
    )
    if (children.length > 0) {
      const isAlreadyChild = children.some(c => c.nama === formData.jenis_kawasan_nama)
      if (!isAlreadyChild) {
        setFormData(prev => ({
          ...prev,
          jenis_kawasan_nama: children[0].nama
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        jenis_kawasan_nama: utamaItem.nama
      }))
    }
  }

  // Handle Province & Regency Cascading via Relasi kst_provinsi & kst_kabupaten_kota
  const handleProvinceChange = async (provKode) => {
    setSelectedProvinceId(provKode)
    setSelectedRegencyId('')
    const p = provinces.find(x => String(x.kode || x.id) === String(provKode))
    const provName = p ? formatProvinceName(p.nama || p.name) : ''
    const matchedWilayah = p ? mapProvinceToWilayah(p.nama || p.name) : 'Jawa'

    // Otomatis zoom peta ke provinsi terpilih
    const provCoord = getProvinceCoordinates(provKode || p?.nama || p?.name)
    if (provCoord) {
      setMapTarget({
        lat: provCoord.lat,
        lng: provCoord.lng,
        zoom: provCoord.zoom,
        timestamp: Date.now()
      })
    }

    setFormData(prev => ({
      ...prev,
      provinsi_kode: provKode,
      kabupaten_kota_kode: '',
      wilayah: matchedWilayah,
      kota_provinsi: provName,
      ...(provCoord && (!prev.latitude || !prev.longitude) ? {
        latitude: String(provCoord.lat),
        longitude: String(provCoord.lng)
      } : {})
    }))

    if (provKode) {
      setLoadingWilayah(true)
      try {
        const regs = await fetchRegencies(provKode)
        setRegencies(regs || [])
      } catch (err) {
        console.error('Failed to load regencies:', err)
        setRegencies([])
      } finally {
        setLoadingWilayah(false)
      }
    } else {
      setRegencies([])
    }
  }

  const handleRegencyChange = async (regKode) => {
    setSelectedRegencyId(regKode)
    const r = regencies.find(x => String(x.kode || x.id) === String(regKode))
    const p = provinces.find(x => String(x.kode || x.id) === String(selectedProvinceId))
    const regName = r ? formatCityName(r.nama || r.name) : ''
    const provName = p ? formatProvinceName(p.nama || p.name) : ''
    const combined = regName && provName ? `${regName}, ${provName}` : (regName || provName)

    setFormData(prev => ({
      ...prev,
      kabupaten_kota_kode: regKode,
      kota_provinsi: combined
    }))

    // Otomatis zoom peta ke kota / kabupaten terpilih
    if (regName) {
      const cityCoord = await geocodeCity(regName, provName)
      if (cityCoord) {
        setMapTarget({
          lat: cityCoord.lat,
          lng: cityCoord.lng,
          zoom: cityCoord.zoom || 12,
          timestamp: Date.now()
        })
        setFormData(prev => ({
          ...prev,
          latitude: String(cityCoord.lat),
          longitude: String(cityCoord.lng)
        }))
      }
    }
  }

  // --- GALLERY MULTI-UPLOAD & DRAG-DROP ---
  const isVideoItem = (item) => {
    if (!item) return false
    const tipe = typeof item === 'object' ? item.tipe : ''
    const url = typeof item === 'object' ? (item.url || '') : item
    const urlStr = typeof url === 'object' ? (url.relative_url || url.file_url || url.url || '') : String(url || '')
    return tipe === 'video' || /\.(mp4|webm|mov|m4v|ogg)$/i.test(urlStr)
  }

  const processGalleryFiles = async (files) => {
    if (!files || files.length === 0) return
    setUploadingGallery(true)
    let successCount = 0
    try {
      const newItems = []
      for (const file of files) {
        try {
          const isVideo = file.type?.startsWith('video') || /\.(mp4|webm|mov|m4v|ogg)$/i.test(file.name)
          let thumbBlob = null

          // Jika file video, capture frame snapshot otomatis via canvas di client sebelum upload
          if (isVideo) {
            try {
              const frameResult = await captureVideoFrame(file, 1.0)
              if (frameResult?.blob) {
                thumbBlob = frameResult.blob
              }
            } catch (errCapture) {
              console.warn('Gagal capture thumbnail video via canvas:', errCapture)
            }
          }

          const res = await uploadFile(file, thumbBlob)
          const url = typeof res === 'object' && res !== null
            ? (res.relative_url || res.file_url || res.url || '')
            : String(res || '')

          if (!url) continue

          const thumbUrl = res?.thumbnail_relative_url || res?.thumbnail_url || null

          newItems.push({
            url,
            thumbnail_url: thumbUrl,
            caption: '',
            sort: formData.galeri.length + newItems.length,
            tipe: isVideo ? 'video' : 'foto',
            type: isVideo ? 'video' : 'foto'
          })
          successCount++
        } catch (err) {
          console.error('Failed to upload file:', file.name, err)
        }
      }

      if (newItems.length > 0) {
        setFormData(prev => ({
          ...prev,
          galeri: [...prev.galeri, ...newItems]
        }))
        toast.success(`${successCount} file foto/video berhasil ditambahkan ke galeri`)
      } else {
        toast.error('Gagal mengunggah file foto/video')
      }
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleAddGalleryFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await processGalleryFiles(files)
    }
    e.target.value = ''
  }

  const handleGalleryDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDraggingGallery) setIsDraggingGallery(true)
  }

  const handleGalleryDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingGallery(true)
  }

  const handleGalleryDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget && e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) {
      return
    }
    setIsDraggingGallery(false)
  }

  const handleGalleryDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingGallery(false)
    const files = Array.from(e.dataTransfer?.files || [])
    if (files.length > 0) {
      await processGalleryFiles(files)
    }
  }

  // --- REORDER GALLERY CARDS VIA DRAG-DROP ---
  const handleCardDragStart = (e, index) => {
    setDraggedCardIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    try {
      e.dataTransfer.setData('text/plain', String(index))
    } catch (_) {}
  }

  const handleCardDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleCardDrop = (e, targetIndex) => {
    e.preventDefault()
    if (draggedCardIndex === null || draggedCardIndex === targetIndex) return
    setFormData(prev => {
      const items = [...prev.galeri]
      const [draggedItem] = items.splice(draggedCardIndex, 1)
      items.splice(targetIndex, 0, draggedItem)
      const updated = items.map((it, idx) => ({ ...it, sort: idx }))
      return {
        ...prev,
        galeri: updated
      }
    })
    setDraggedCardIndex(null)
    toast.success('Urutan galeri diperbarui')
  }

  const moveGalleryItem = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= formData.galeri.length) return
    setFormData(prev => {
      const items = [...prev.galeri]
      const [item] = items.splice(fromIdx, 1)
      items.splice(toIdx, 0, item)
      const updated = items.map((it, idx) => ({ ...it, sort: idx }))
      return {
        ...prev,
        galeri: updated
      }
    })
  }

  const handleCardDragEnd = () => {
    setDraggedCardIndex(null)
  }

  const updateGalleryCaption = (idx, caption) => {
    setFormData(prev => {
      const updated = [...prev.galeri]
      updated[idx] = { ...updated[idx], caption }
      return { ...prev, galeri: updated }
    })
  }

  const removeGalleryItem = (idx) => {
    setFormData(prev => ({
      ...prev,
      galeri: prev.galeri.filter((_, i) => i !== idx)
    }))
  }

  // --- DYNAMIC OPTIONAL FIELDS & TABS ---
  const getLabelIcon = (labelStr = '') => {
    const l = (labelStr || '').toLowerCase()
    if (l.includes('riset') || l.includes('penelitian')) return FlaskConical
    if (l.includes('fasilitas') || l.includes('lab')) return Building2
    if (l.includes('koleksi') || l.includes('tumbuhan') || l.includes('kebun')) return TreePine
    if (l.includes('manfaat') || l.includes('layanan') || l.includes('mitra')) return Handshake
    if (l.includes('saluran') || l.includes('komunikasi') || l.includes('digital') || l.includes('media') || l.includes('website') || l.includes('web') || l.includes('portal') || l.includes('url') || l.includes('telepon') || l.includes('hp') || l.includes('kontak') || l.includes('wa') || l.includes('email') || l.includes('mail')) return Globe
    if (l.includes('kelola') || l.includes('hukum') || l.includes('legalitas')) return ShieldCheck
    if (l.includes('pic') || l.includes('pendamping') || l.includes('pengelola') || l.includes('orang')) return Users
    if (l.includes('organisasi') || l.includes('or ') || l.includes('lembaga')) return Building2
    if (l.includes('pusat riset') || l.includes('pr ')) return Atom
    if (l.includes('inovasi') || l.includes('program') || l.includes('capaian')) return Award
    if (l.includes('temui') || l.includes('kegiatan')) return Sparkles
    return FileText
  }

  const addExtraField = (labelItem) => {
    setOpenAddOptionalMenu(false)
    setSearchOptionalQuery('')
    const newId = `ef_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    const isFokus = (labelItem.slug === 'fokus-riset') ||
      (labelItem.nama || labelItem.label || '').toLowerCase().includes('fokus riset') ||
      (labelItem.nama || labelItem.label || '').toLowerCase().includes('tema riset')

    const newField = {
      id: newId,
      field_label_id: labelItem.id || null,
      label: labelItem.nama || labelItem.label || 'Data Opsional',
      slug: labelItem.slug || '',
      value: isFokus ? [] : [''],
      placeholder: labelItem.placeholder || ''
    }

    setFormData(prev => ({
      ...prev,
      extra_fields: [...(prev.extra_fields || []), newField]
    }))
    setActiveTab(newId)
    toast.success(`Tab "${newField.label}" ditambahkan`)
  }

  const addCustomExtraField = () => {
    setOpenAddOptionalMenu(false)
    setSearchOptionalQuery('')
    const newId = `ef_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    const newField = {
      id: newId,
      field_label_id: null,
      label: 'Field Opsional Baru',
      slug: '',
      value: [''],
      placeholder: 'Masukkan rincian informasi di sini...'
    }

    setFormData(prev => ({
      ...prev,
      extra_fields: [...(prev.extra_fields || []), newField]
    }))
    setActiveTab(newId)
    toast.success('Tab opsional baru ditambahkan')
  }

  const updateExtraField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      extra_fields: (prev.extra_fields || []).map(f => f.id === fieldId ? { ...f, ...updates } : f)
    }))
  }

  const removeExtraField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      extra_fields: (prev.extra_fields || []).filter(f => f.id !== fieldId)
    }))
    if (activeTab === fieldId) {
      setActiveTab('utama')
    }
    toast.success('Data opsional telah dihapus')
  }

  const addListItem = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      extra_fields: (prev.extra_fields || []).map(f => {
        if (f.id !== fieldId) return f
        const items = Array.isArray(f.value) ? f.value : (f.value ? [f.value] : [])
        return { ...f, value: [...items, ''] }
      })
    }))
  }

  const updateListItem = (fieldId, itemIdx, val) => {
    setFormData(prev => ({
      ...prev,
      extra_fields: (prev.extra_fields || []).map(f => {
        if (f.id !== fieldId) return f
        const items = Array.isArray(f.value) ? [...f.value] : []
        items[itemIdx] = val
        return { ...f, value: items }
      })
    }))
  }

  const removeListItem = (fieldId, itemIdx) => {
    setFormData(prev => ({
      ...prev,
      extra_fields: (prev.extra_fields || []).map(f => {
        if (f.id !== fieldId) return f
        const items = Array.isArray(f.value) ? f.value.filter((_, i) => i !== itemIdx) : []
        return { ...f, value: items }
      })
    }))
  }

  // --- SUBMIT / SAVE EXECUTION ---
  const executeSave = async (payload) => {
    setSaving(true)
    try {
      if (isEdit) {
        await updateKST(id, payload)
        toast.success(payload.is_draft ? 'Draft lokasi berhasil diperbarui' : 'Data lokasi berhasil diperbarui')
      } else {
        await createKST(payload)
        toast.success(payload.is_draft ? 'Draft lokasi baru berhasil disimpan' : 'Lokasi baru berhasil ditambahkan')
      }
      if (onSaveSuccess) onSaveSuccess()
      navigate('/data-peta-lokasi')
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data lokasi')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (e, asDraft = false) => {
    if (e) e.preventDefault()

    // Hanya Nama Lokasi yang wajib diisi, selain itu semua opsional / boleh null
    if (!formData.nama || !formData.nama.trim()) {
      setShowValidation(true)
      setActiveTab('utama')
      toast.error('Nama Kawasan / Lokasi wajib diisi')
      return
    }

    // Auto slug if empty
    let finalSlug = (formData.slug || '').trim()
    if (!finalSlug && formData.nama) {
      finalSlug = formData.nama.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `lokasi-${Date.now()}`
    }

    // Format extra_fields payload for nilai_data_lokasi table
    const formattedExtraFields = (formData.extra_fields || []).map((f) => {
      let cleanVal = f.value
      if (Array.isArray(cleanVal)) {
        cleanVal = cleanVal.filter(v => {
          if (!v) return false
          const s = String(v).trim()
          const textOnly = s.replace(/<[^>]*>/g, '').trim()
          return textOnly.length > 0 || (s.length > 0 && !s.includes('<'))
        })
      } else if (typeof cleanVal === 'string') {
        const trimmed = cleanVal.trim()
        const textOnly = trimmed.replace(/<[^>]*>/g, '').trim()
        cleanVal = textOnly ? trimmed : ''
      }

      // Pastikan untuk fokus riset, kirim UUID fokus_riset jika ada
      const isFokus = (f.slug === 'fokus-riset') || (f.label || '').toLowerCase().includes('fokus riset')
      if (isFokus && Array.isArray(cleanVal)) {
        cleanVal = cleanVal.map(valName => {
          const match = fokusRisetMaster.find(fr => (fr.nama || '').toLowerCase() === String(valName).toLowerCase() || fr.id === valName)
          return match ? match.id : valName
        })
      }

      return {
        field_label_id: f.field_label_id || null,
        label: (f.label || '').trim(),
        value: cleanVal,
      }
    })

    const payload = {
      nama: formData.nama.trim(),
      slug: finalSlug,
      jenis_kawasan_nama: formData.jenis_kawasan_nama ? String(formData.jenis_kawasan_nama).trim() : null,
      kawasan_nama: formData.jenis_kawasan_nama ? String(formData.jenis_kawasan_nama).trim() : null,
      instansi_nama: formData.jenis_kawasan_nama ? String(formData.jenis_kawasan_nama).trim() : null,
      pengelola: formData.pengelola ? formData.pengelola.trim() : null,
      status: formData.status || 'Aktif',
      tahun_operasi: formData.tahun_operasi ? parseInt(formData.tahun_operasi, 10) : null,
      provinsi_kode: formData.provinsi_kode || null,
      kabupaten_kota_kode: formData.kabupaten_kota_kode || null,
      wilayah: formData.wilayah || null,
      kota_provinsi: formData.kota_provinsi || null,
      alamat: formData.alamat ? formData.alamat.trim() : null,
      luas_ha: (formData.luas_ha !== '' && formData.luas_ha !== null && !isNaN(Number(formData.luas_ha))) ? Number(formData.luas_ha) : null,
      latitude: (formData.latitude !== '' && formData.latitude !== null && !isNaN(Number(formData.latitude))) ? Number(formData.latitude) : null,
      longitude: (formData.longitude !== '' && formData.longitude !== null && !isNaN(Number(formData.longitude))) ? Number(formData.longitude) : null,
      thumbnail_url: formData.thumbnail_url || null,
      galeri: (formData.galeri || []).map((item, idx) => {
        if (typeof item === 'string') {
          const isVid = /\.(mp4|webm|mov|m4v|ogg)$/i.test(item)
          return { url: item, thumbnail_url: null, caption: '', sort: idx, tipe: isVid ? 'video' : 'foto', type: isVid ? 'video' : 'foto' }
        }
        let u = item?.url
        if (typeof u === 'object' && u !== null) {
          u = u.relative_url || u.file_url || u.url || ''
        }
        const tipeVal = item?.tipe || item?.type || (/\.(mp4|webm|mov|m4v|ogg)$/i.test(String(u || '')) ? 'video' : 'foto')
        return {
          url: String(u || ''),
          thumbnail_url: item?.thumbnail_url || null,
          caption: item?.caption || '',
          sort: item?.sort != null ? Number(item.sort) : idx,
          tipe: tipeVal,
          type: tipeVal
        }
      }),
      extra_fields: formattedExtraFields,
      deskripsi: (() => {
        const d = (formData.deskripsi || '').trim()
        const textOnly = d.replace(/<[^>]*>/g, '').trim()
        return textOnly ? d : null
      })(),
      is_draft: asDraft
    }

    executeSave(payload)
  }

  // Filter labels for dropdown (Unified list without category division)
  const allLabels = masterLabels.length > 0 ? masterLabels : PRESET_LABELS
  const filteredLabels = allLabels.filter(lbl => {
    // Hilangkan dari daftar jika sudah ada tabnya di formData.extra_fields
    const alreadyExists = (formData.extra_fields || []).some(f => {
      const matchId = f.field_label_id && lbl.id && String(f.field_label_id) === String(lbl.id)
      const fLabel = (f.label || '').trim().toLowerCase()
      const lblNama = (lbl.nama || lbl.label || '').trim().toLowerCase()
      const matchLabel = fLabel === lblNama
      const matchSlug = f.slug && lbl.slug && f.slug.toLowerCase() === lbl.slug.toLowerCase()
      return matchId || matchLabel || matchSlug
    })
    if (alreadyExists) return false

    if (!searchOptionalQuery.trim()) return true
    const q = searchOptionalQuery.toLowerCase()
    return (
      (lbl.nama || '').toLowerCase().includes(q) ||
      (lbl.placeholder || '').toLowerCase().includes(q)
    )
  })

  // Find active optional field if not 'utama'
  const activeOptionalField = activeTab !== 'utama'
    ? formData.extra_fields.find(f => f.id === activeTab)
    : null

  const isFokusRisetTab = Boolean(
    activeOptionalField && (
      activeOptionalField.slug === 'fokus-riset' ||
      (activeOptionalField.label || '').toLowerCase().includes('fokus riset') ||
      (activeOptionalField.label || '').toLowerCase().includes('tema riset')
    )
  )

  const isSaluranTab = Boolean(
    activeOptionalField && (
      activeOptionalField.slug === 'saluran-digital' ||
      (activeOptionalField.label || '').toLowerCase().includes('saluran') ||
      (activeOptionalField.label || '').toLowerCase().includes('komunikasi')
    )
  )

  const selectedFokusList = useMemo(() => {
    if (!activeOptionalField || !activeOptionalField.value) return []
    let rawList = []
    if (Array.isArray(activeOptionalField.value)) {
      rawList = activeOptionalField.value
    } else if (typeof activeOptionalField.value === 'string') {
      const trimmed = activeOptionalField.value.trim()
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) rawList = parsed
        } catch (_) { }
      } else {
        rawList = trimmed.split(',').map(s => s.trim()).filter(Boolean)
      }
    }
    return rawList.map(item => {
      const strVal = typeof item === 'string' ? item : (item?.nama || item?.id || '')
      if (!strVal) return ''
      const match = fokusRisetMaster.find(fr => fr.id === strVal || (fr.nama || '').toLowerCase() === strVal.toLowerCase())
      return match ? match.nama : strVal
    }).filter(Boolean)
  }, [activeOptionalField?.value, fokusRisetMaster])

  const handleToggleFokusRiset = (frNama) => {
    if (!activeOptionalField || !frNama) return
    const trimmed = frNama.trim()
    if (!trimmed) return
    const exists = selectedFokusList.some(item => item.toLowerCase() === trimmed.toLowerCase())
    let updated
    if (exists) {
      updated = selectedFokusList.filter(item => item.toLowerCase() !== trimmed.toLowerCase())
    } else {
      updated = [...selectedFokusList, trimmed]
    }
    updateExtraField(activeOptionalField.id, { value: updated })
  }

  const handleAddFokusTag = async (rawTagName) => {
    const tagName = (rawTagName || fokusInput || '').trim()
    if (!tagName) return
    if (!activeOptionalField) return

    // Cek apakah sudah ada di selected list (case-insensitive)
    const isAlreadySelected = selectedFokusList.some(
      item => item.toLowerCase() === tagName.toLowerCase()
    )
    if (isAlreadySelected) {
      toast.info(`"${tagName}" sudah ada di daftar fokus riset terpilih.`)
      setFokusInput('')
      return
    }

    // Tambah ke selected list form
    const updated = [...selectedFokusList, tagName]
    updateExtraField(activeOptionalField.id, { value: updated })
    setFokusInput('')

    // Cek apakah sudah ada di master data fokus riset
    const existsInMaster = fokusRisetMaster.some(
      fr => (fr.nama || '').trim().toLowerCase() === tagName.toLowerCase()
    )

    if (!existsInMaster) {
      setSavingFokusTag(true)
      try {
        const newRecord = await createFokusRiset({
          nama: tagName,
          is_active: true
        })
        if (newRecord && (newRecord.id || newRecord.nama)) {
          setFokusRisetMaster(prev => {
            const alreadyHas = prev.some(p => (p.nama || '').toLowerCase() === tagName.toLowerCase())
            return alreadyHas ? prev : [...prev, newRecord]
          })
          toast.success(`"${tagName}" ditambahkan ke fokus riset & master data!`)
        }
      } catch (err) {
        console.warn('Gagal simpan ke master kst_fokus_riset (akan di-handle saat simpan form):', err)
        toast.info(`"${tagName}" ditambahkan ke form.`)
      } finally {
        setSavingFokusTag(false)
      }
    } else {
      toast.success(`"${tagName}" ditambahkan.`)
    }
  }

  const handleRemoveFokusTag = (tagName) => {
    if (!activeOptionalField || !tagName) return
    const updated = selectedFokusList.filter(
      item => item.toLowerCase() !== tagName.toLowerCase()
    )
    updateExtraField(activeOptionalField.id, { value: updated })
  }

  // Repeatable items management for optional tabs (Data 1, Data 2, ...)
  const currentItems = useMemo(() => {
    if (!activeOptionalField) return ['']
    const val = activeOptionalField.value
    if (isSaluranTab) {
      if (Array.isArray(val)) {
        if (val.length === 0) return ['']
        if (val.length === 1) return [String(val[0] || '')]
        const joined = val.filter(Boolean).map(x => String(x).startsWith('<p>') ? String(x) : `<p>${x}</p>`).join('')
        return [joined]
      }
      return [val ? String(val) : '']
    }
    if (Array.isArray(val)) {
      return val.length > 0 ? val : ['']
    }
    if (typeof val === 'string') {
      const trimmed = val.trim()
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(x => String(x || ''))
          }
        } catch (_) { }
      }
      return [val]
    }
    if (val != null) {
      return [String(val)]
    }
    return ['']
  }, [activeOptionalField?.value, isSaluranTab])

  const handleItemChange = (idx, text) => {
    if (!activeOptionalField) return
    if (isSaluranTab) {
      updateExtraField(activeOptionalField.id, { value: [text] })
      return
    }
    const updated = [...currentItems]
    updated[idx] = text
    updateExtraField(activeOptionalField.id, { value: updated })
  }

  const handleAddItem = () => {
    if (!activeOptionalField) return
    const updated = [...currentItems, '']
    updateExtraField(activeOptionalField.id, { value: updated })
  }

  const handleRemoveItem = (idx) => {
    if (!activeOptionalField) return
    if (currentItems.length <= 1) {
      updateExtraField(activeOptionalField.id, { value: [''] })
    } else {
      const updated = currentItems.filter((_, i) => i !== idx)
      updateExtraField(activeOptionalField.id, { value: updated })
    }
  }

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-zinc-500 font-mono text-xs gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span>Memuat data lokasi...</span>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">

      {/* 1. TOP HEADER & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate('/data-peta-lokasi')}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors font-medium mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Manajemen Lokasi</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <span>{isEdit ? `Edit: ${formData.nama || 'Lokasi'}` : 'Tambah Lokasi Baru'}</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Gunakan tab <strong>Utama</strong> untuk data pokok, dan klik tombol <strong>+ Tambah Data Opsional</strong> untuk menambah tab data khusus.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/data-peta-lokasi')}
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Simpan Draft
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={(e) => handleSubmit(e, false)}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
            Simpan Data
          </Button>
        </div>
      </div>

      {/* 2. AUTHENTIC TAB BAR + DROPDOWN BUTTON (Flex-wrap, multi-line, no horizontal scroll) */}
      <div className="relative z-30 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 h-auto min-h-9 flex flex-wrap items-center justify-start gap-1 p-1 rounded-xl w-full">
            {/* 1. Tab Utama */}
            <TabsTrigger value="utama" className="gap-1.5 text-xs font-semibold px-3.5 h-7 sm:h-7.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Utama</span>
              {showValidation && !formData.nama && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-0.5" />
              )}
            </TabsTrigger>

            {/* Dynamic Optional Tabs (Wraps to next line when many) */}
            {formData.extra_fields.map((field) => {
              const FIcon = getLabelIcon(field.label)
              return (
                <TabsTrigger
                  key={field.id}
                  value={field.id}
                  className="group gap-1.5 text-xs font-semibold px-3 pr-1.5 h-7 sm:h-7.5"
                >
                  <FIcon className="w-3.5 h-3.5 text-blue-600 opacity-80 group-data-[state=active]:opacity-100" />
                  <span className="max-w-[130px] sm:max-w-[170px] truncate">{field.label || 'Data Opsional'}</span>
                  {Array.isArray(field.value) && field.value.filter(x => x && String(x).trim()).length > 0 && (
                    <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] rounded-full font-mono font-bold">
                      {field.value.filter(x => x && String(x).trim()).length}
                    </span>
                  )}

                  {/* Delete Button */}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeExtraField(field.id)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation()
                        removeExtraField(field.id)
                      }
                    }}
                    className="w-4 h-4 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-red-500 flex items-center justify-center transition-colors ml-0.5 text-zinc-400"
                    title="Hapus tab ini"
                  >
                    <X className="w-2.5 h-2.5" />
                  </span>
                </TabsTrigger>
              )
            })}

            {/* Button: + Tambah Data Opsional (Follows the tabs and wraps with them) */}
            <div className="relative inline-flex" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setOpenAddOptionalMenu(!openAddOptionalMenu)}
                className="h-7 sm:h-7.5 px-2.5 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-white dark:hover:bg-zinc-950 transition-all shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                <span>Tambah Data Opsional</span>
                <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${openAddOptionalMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Clean, Neat Dropdown Menu Popover */}
              {openAddOptionalMenu && (
                <div className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">

                  {/* Dropdown Header & Search */}
                  <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        Pilih Data Opsional
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Otomatis jadi Tab
                      </span>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
                      <Input
                        value={searchOptionalQuery}
                        onChange={(e) => setSearchOptionalQuery(e.target.value)}
                        placeholder="Cari fokus riset, website, lab..."
                        className="h-8 pl-8 pr-7 text-xs bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      {searchOptionalQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchOptionalQuery('')}
                          className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600 text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Unified List of Optional Fields (Satu list utuh tanpa kategori) */}
                  <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
                    {filteredLabels.length === 0 ? (
                      <div className="p-4 text-center text-xs text-zinc-500">
                        {searchOptionalQuery
                          ? `Tidak ditemukan label untuk "${searchOptionalQuery}"`
                          : 'Semua label data opsional sudah ditambahkan ke tab.'}
                      </div>
                    ) : (
                      filteredLabels.map((lbl, idx) => {
                        const IconC = getLabelIcon(lbl.nama)
                        return (
                          <button
                            key={lbl.id || idx}
                            type="button"
                            onClick={() => addExtraField(lbl)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50/80 dark:hover:bg-blue-950/40 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-6 h-6 rounded-md bg-blue-100/70 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <IconC className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 truncate">
                                {lbl.nama}
                              </span>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>

                  {/* Custom Field Action */}
                  <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50">
                    <button
                      type="button"
                      onClick={addCustomExtraField}
                      className="w-full text-center py-2 px-3 rounded-lg border border-dashed border-border hover:bg-muted text-foreground text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Field Kustom Baru</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

          </TabsList>
        </Tabs>
      </div>

      {/* 3. TAB CONTENT: TAB UTAMA */}
      {activeTab === 'utama' && (
        <div className="space-y-6">

          {/* Active Optional Fields Shortcut Pills Banner */}
          {formData.extra_fields.length > 0 && (
            <div className="p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Tab Opsional Terpasang ({formData.extra_fields.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {formData.extra_fields.map(f => {
                    const FIcon = getLabelIcon(f.label)
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setActiveTab(f.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 text-zinc-700 dark:text-zinc-200 transition-all hover:scale-102"
                      >
                        <FIcon className="w-3 h-3 text-blue-600" />
                        <span>{f.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <span className="text-[11px] text-zinc-400">Klik tab di atas untuk mengedit</span>
            </div>
          )}

          {/* Card 1: Identitas & Informasi Pokok */}
          <Card className="p-5 space-y-4 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2.5 border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Identitas &amp; Informasi Pokok</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">* Wajib diisi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Kawasan (Kiri) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nama Kawasan / Lokasi <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.nama}
                  onChange={(e) => handleNamaChange(e.target.value)}
                  placeholder="Contoh: KR Balikpapan / BRIDA Kota Medan / KST Soekarno"
                  className={showValidation && !formData.nama ? 'border-red-500 bg-red-50/40' : ''}
                />
              </div>

              {/* Slug URL (Kanan) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Slug URL Identifier <span className="text-zinc-400 font-normal text-[11px]">(Opsional)</span>
                </Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="kr-balikpapan"
                  className="font-mono text-xs"
                />
              </div>

              {/* Deskripsi Kawasan (Bawahnya - Full Width) */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Deskripsi Kawasan
                </Label>
                <SimpleEditor
                  value={formData.deskripsi || ''}
                  onChange={(val) => setFormData(prev => ({ ...prev, deskripsi: val }))}
                  placeholder="Tuliskan gambaran umum, sejarah singkat, tujuan pendirian, atau profil kawasan..."
                  minHeight="130px"
                />
              </div>

              {/* PILAR KATEGORI UTAMA (DINAMIS DARI MASTER JENIS KAWASAN) */}
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Kategori / Pilar Utama <span className="text-zinc-400 font-normal text-[11px] font-sans">(Opsional)</span>
                  </Label>
                  <span className="text-[11px] text-zinc-400">
                    Format klasifikasi untuk tampilan di peta &amp; web publik
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {kategoriUtamaList.map((item) => {
                    const isSelected = selectedUtama?.id === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handlePilarChange(item)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${isSelected
                          ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/20 shadow-xs font-semibold'
                          : 'border-border hover:border-zinc-400 bg-card text-muted-foreground'
                          }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-secondary text-secondary-foreground'
                            }`}
                        >
                          <Layers className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold leading-tight text-foreground truncate">
                            {item.nama}
                          </div>
                          <div
                            className="text-[10px] text-muted-foreground truncate"
                            title={item.deskripsi || '-'}
                          >
                            {item.deskripsi || '-'}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sub-Kategori / Detail Spesifik: Ditampilkan jika pilar utama memiliki sub-jenis */}
              {subJenisList.length > 0 && (
                <div className="space-y-1.5 sm:col-span-2 p-3 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      <span>Sub-Jenis {selectedUtama?.nama || 'Kawasan'}</span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isCustomJenisKawasan) {
                          setIsCustomJenisKawasan(true)
                          setFormData(prev => ({ ...prev, jenis_kawasan_nama: '' }))
                        } else {
                          setIsCustomJenisKawasan(false)
                          setFormData(prev => ({ ...prev, jenis_kawasan_nama: subJenisList[0]?.nama || '' }))
                        }
                      }}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      {isCustomJenisKawasan ? 'Pilih dari daftar' : '+ Ketik Kustom'}
                    </button>
                  </div>

                  {isCustomJenisKawasan ? (
                    <Input
                      autoFocus
                      value={formData.jenis_kawasan_nama || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, jenis_kawasan_nama: e.target.value }))}
                      placeholder={`Ketik nama kustom untuk sub-jenis ${selectedUtama?.nama || 'kawasan'}...`}
                      className="bg-white dark:bg-zinc-900"
                    />
                  ) : (
                    <Select
                      value={formData.jenis_kawasan_nama || (subJenisList[0]?.nama || '')}
                      onValueChange={(val) => setFormData(prev => ({ ...prev, jenis_kawasan_nama: val }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`-- Pilih Sub-Jenis ${selectedUtama?.nama || 'Kawasan'} --`} />
                      </SelectTrigger>
                      <SelectContent>
                        {subJenisList.map((jk) => (
                          <SelectItem key={jk.id || jk.nama} value={jk.nama}>
                            {jk.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Pengelola / UPTD */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Instansi / Pengelola Utama
                </Label>
                <Input
                  value={formData.pengelola}
                  onChange={(e) => setFormData(prev => ({ ...prev, pengelola: e.target.value }))}
                  placeholder="BRIN / Dinas Lingkungan Hidup / Pemprov"
                />
              </div>

              {/* Status & Tahun Operasi */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Status Operasional
                  </Label>
                  <Select
                    value={formData.status || 'Aktif'}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Pengembangan">Pengembangan</SelectItem>
                      <SelectItem value="Perencanaan">Perencanaan</SelectItem>
                      <SelectItem value="Non-aktif">Non-aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Tahun Operasi
                  </Label>
                  <Input
                    type="number"
                    value={formData.tahun_operasi}
                    onChange={(e) => setFormData(prev => ({ ...prev, tahun_operasi: e.target.value }))}
                    placeholder="2021"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Lokasi Spasial, Alamat & Dimensi */}
          <Card className="p-5 space-y-4 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2.5 border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <Map className="w-4 h-4 text-emerald-600" />
                <span>Wilayah &amp; Alamat Lokasi</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Dropdown 1: Provinsi Relasional */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between h-5">
                  <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Provinsi
                  </Label>
                  <span className="text-[10px] text-zinc-400 font-mono">38 Provinsi</span>
                </div>
                <Select
                  value={formData.provinsi_kode || undefined}
                  onValueChange={(val) => handleProvinceChange(val)}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="-- Pilih Provinsi --" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {provinces.map(p => (
                      <SelectItem key={p.kode || p.id} value={String(p.kode || p.id)}>
                        {formatProvinceName(p.nama || p.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dropdown 2: Kabupaten / Kota Relasional */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between h-5">
                  <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Kota / Kabupaten
                  </Label>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {loadingWilayah ? 'Memuat...' : `${regencies.length} Kab/Kota`}
                  </span>
                </div>
                <Select
                  value={formData.kabupaten_kota_kode || undefined}
                  onValueChange={(val) => handleRegencyChange(val)}
                  disabled={loadingWilayah || !formData.provinsi_kode || regencies.length === 0}
                >
                  <SelectTrigger className="w-full h-10 disabled:opacity-50">
                    <SelectValue placeholder={
                      !formData.provinsi_kode
                        ? 'Pilih provinsi terlebih dahulu'
                        : loadingWilayah
                          ? 'Memuat kab/kota...'
                          : '-- Pilih Kab/Kota --'
                    } />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {regencies.map(r => (
                      <SelectItem key={r.kode || r.id} value={String(r.kode || r.id)}>
                        {formatCityName(r.nama || r.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Luas Lahan (Ha) (Opsional) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between h-5">
                  <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Luas Lahan (Ha)
                  </Label>
                  <span className="text-[10px] text-zinc-400 font-mono">Opsional</span>
                </div>
                <Input
                  type="number"
                  step="any"
                  value={formData.luas_ha}
                  onChange={(e) => setFormData(prev => ({ ...prev, luas_ha: e.target.value }))}
                  placeholder="Contoh: 309"
                  className="h-10"
                />
              </div>

              {/* Alamat Lengkap */}
              <div className="space-y-1.5 md:col-span-3">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Alamat Lengkap
                </Label>
                <Textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                  rows={2}
                  placeholder="Contoh: Km. 15, Kelurahan Karang Joang, Kecamatan Balikpapan Utara"
                />
              </div>

              {/* Titik Koordinat Spasial Interaktif */}
              <div className="md:col-span-3 pt-1">
                <CoordinatePicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onChange={(lat, lng) => setFormData(prev => ({
                    ...prev,
                    latitude: lat != null ? String(lat) : '',
                    longitude: lng != null ? String(lng) : ''
                  }))}
                  mapTarget={mapTarget}
                  category={formData.jenis_kawasan_nama || selectedUtama?.nama}
                />
              </div>
            </div>
          </Card>

          {/* Card 3: Galeri */}
          <Card className="p-5 space-y-4 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2.5 border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span>Galeri</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {formData.galeri.length} Foto / Media
              </span>
            </div>

            {/* Direct Multi-Upload Dropzone with Drag & Drop */}
            <div
              onDragOver={handleGalleryDragOver}
              onDragEnter={handleGalleryDragEnter}
              onDragLeave={handleGalleryDragLeave}
              onDrop={handleGalleryDrop}
              className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all text-center ${
                isDraggingGallery
                  ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 ring-4 ring-blue-500/20 scale-[1.01]'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-blue-50/20'
              }`}
            >
              <input
                id="gallery-file-input"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleAddGalleryFiles}
                disabled={uploadingGallery}
                className="hidden"
              />
              {uploadingGallery ? (
                <div className="flex flex-col items-center gap-2 text-blue-600 py-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-semibold">Mengunggah file foto/video...</span>
                </div>
              ) : isDraggingGallery ? (
                <div className="flex flex-col items-center gap-2 text-blue-600 py-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center animate-bounce shadow-md">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold">Lepaskan File Foto atau Video di Sini!</span>
                  <span className="text-xs text-blue-500/80">File akan langsung diunggah ke galeri</span>
                </div>
              ) : (
                <label htmlFor="gallery-file-input" className="flex flex-col items-center gap-1.5 cursor-pointer w-full py-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-blue-600">
                    Klik untuk Pilih atau Drag &amp; Drop Foto / Video ke Sini
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Mendukung multi-upload gambar (JPG, PNG, WEBP) &amp; video (MP4, WEBM). Urutan foto/video dapat digeser (drag &amp; drop).
                  </span>
                </label>
              )}
            </div>

            {/* Gallery Grid with Drag & Drop Reordering */}
            {formData.galeri.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
                {formData.galeri.map((item, idx) => {
                  const isVideo = isVideoItem(item)
                  const itemUrl = typeof item === 'object' && item !== null
                    ? (typeof item.url === 'object' ? (item.url?.relative_url || item.url?.file_url || item.url?.url) : item.url)
                    : item
                  const isBeingDragged = draggedCardIndex === idx

                  return (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => handleCardDragStart(e, idx)}
                      onDragOver={(e) => handleCardDragOver(e, idx)}
                      onDrop={(e) => handleCardDrop(e, idx)}
                      onDragEnd={handleCardDragEnd}
                      className={`group relative rounded-xl border p-2 flex flex-col justify-between transition-all bg-white dark:bg-zinc-900 select-none border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 ${
                        isBeingDragged ? 'opacity-40 border-dashed border-blue-500 scale-95 ring-2 ring-blue-300' : ''
                      }`}
                    >
                      {/* Media Preview (Photo or Video) */}
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        {isVideo ? (
                          <div className="w-full h-full relative flex items-center justify-center bg-black/90">
                            {item?.thumbnail_url ? (
                              <img
                                src={getImageUrl(item.thumbnail_url)}
                                alt={`Video Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={`${getImageUrl(itemUrl)}#t=0.5`}
                                preload="metadata"
                                muted
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center pointer-events-none">
                              <div className="w-8 h-8 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-md">
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/75 text-white font-mono pointer-events-none">
                              VIDEO
                            </span>
                          </div>
                        ) : (
                          <img
                            src={getImageUrl(itemUrl)}
                            alt={`Galeri ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Drag Handle Indicator */}
                        <div
                          className="absolute bottom-1 right-1 bg-black/60 hover:bg-black/80 text-white p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Geser kartu untuk mengubah urutan foto/video"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>

                        {/* Top-right: Delete button */}
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-md bg-black/60 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Hapus media ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Caption Input */}
                      <div className="mt-2">
                        <Input
                          type="text"
                          value={item.caption || ''}
                          onChange={(e) => updateGalleryCaption(idx, e.target.value)}
                          placeholder="Tulis caption..."
                          className="h-7 text-xs px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
                          title="Tulis caption foto/video ini"
                        />
                      </div>

                      {/* Bottom: Meta (Index, Move, & Type) */}
                      <div className="pt-2 flex items-center justify-between text-[10px] text-zinc-400 font-mono px-0.5 border-t border-zinc-100 dark:border-zinc-800/80 mt-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveGalleryItem(idx, idx - 1)}
                            className="w-4 h-4 rounded flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                            title="Pindah urutan ke kiri"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-zinc-600 dark:text-zinc-300">#{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === formData.galeri.length - 1}
                            onClick={() => moveGalleryItem(idx, idx + 1)}
                            className="w-4 h-4 rounded flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                            title="Pindah urutan ke kanan"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        <span className={`uppercase font-semibold text-[9px] px-1.5 py-0.5 rounded ${
                          isVideo ? 'bg-purple-100 dark:bg-purple-950 text-purple-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}>
                          {isVideo ? 'VIDEO' : 'FOTO'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 4. TAB CONTENT: DYNAMIC OPTIONAL FIELD TAB */}
      {activeOptionalField && (
        <Card className="p-5 sm:p-6 space-y-5 border-zinc-200 dark:border-zinc-800 shadow-sm">
          {/* Header of Optional Field Tab */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                {(() => {
                  const IconC = getLabelIcon(activeOptionalField.label)
                  return <IconC className="w-5 h-5" />
                })()}
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <Input
                    value={activeOptionalField.label}
                    onChange={(e) => updateExtraField(activeOptionalField.id, { label: e.target.value })}
                    placeholder="Judul Data Opsional..."
                    className="h-8 font-bold text-sm bg-transparent border-transparent hover:border-zinc-300 focus:border-blue-500 max-w-sm px-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Delete Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeExtraField(activeOptionalField.id)}
                className="hover:text-destructive gap-1 text-xs"
                title="Hapus tab ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Tab</span>
              </Button>
            </div>
          </div>

          {/* Body Content: Khusus Fokus Riset render Tag / Badge Input Interaktif */}
          {isFokusRisetTab ? (
            <div className="pt-2 space-y-4">
              {/* Card Container Tag Input */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-3.5">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-blue-600">
                      <Atom className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Tag Fokus Riset
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Ketik fokus riset baru lalu tekan <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px] text-zinc-700 dark:text-zinc-300">Enter</kbd> untuk menyimpan ke master data.
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50/50 dark:bg-zinc-800 text-xs shrink-0 font-mono self-start sm:self-auto">
                    {selectedFokusList.length} Tag Terpilih
                  </Badge>
                </div>

                {/* Input Manual Tag Baru */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input
                      type="text"
                      value={fokusInput}
                      onChange={(e) => setFokusInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddFokusTag()
                        }
                      }}
                      placeholder="Ketik fokus riset (misal: Bioteknologi Kelautan)... lalu tekan Enter"
                      className="pl-9 h-10 text-xs bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleAddFokusTag()}
                    disabled={!fokusInput.trim() || savingFokusTag}
                    className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shrink-0 shadow-2xs"
                  >
                    {savingFokusTag ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Tambah Tag</span>
                  </Button>
                </div>

                {/* Area Tag / Badge Terpilih */}
                <div className="pt-1">
                  <div className="flex items-center justify-between pb-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    <span>Daftar Tag Terpilih:</span>
                    {selectedFokusList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => updateExtraField(activeOptionalField.id, { value: [] })}
                        className="text-red-500 hover:underline text-[11px] cursor-pointer"
                      >
                        Hapus Semua
                      </button>
                    )}
                  </div>

                  {selectedFokusList.length === 0 ? (
                    <div className="py-4 px-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-center">
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        Belum ada fokus riset yang dipilih. Ketik tag baru di atas atau klik salah satu pilihan master di bawah.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/20 min-h-[46px] items-center">
                      {selectedFokusList.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/60 shadow-2xs hover:border-blue-300 transition-colors"
                        >
                          <Atom className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-semibold">{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFokusTag(tag)}
                            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/60 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer ml-0.5"
                            title={`Hapus tag ${tag}`}
                          >
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pilihan Cepat dari Master Data */}
              {fokusRisetMaster.length > 0 && (
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pilihan Cepat dari Master Data ({fokusRisetMaster.length})</span>
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Klik tag untuk memilih / membatalkan
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {fokusRisetMaster.map((fr) => {
                      const isSelected = selectedFokusList.some(
                        item => item.toLowerCase() === (fr.nama || '').trim().toLowerCase()
                      )
                      return (
                        <button
                          key={fr.id || fr.slug || fr.nama}
                          type="button"
                          onClick={() => handleToggleFokusRiset(fr.nama)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white font-semibold shadow-xs ring-2 ring-blue-500/20'
                              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 hover:text-blue-600 shadow-2xs'
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 opacity-60" />
                          )}
                          <span>{fr.nama}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : isSaluranTab ? (
            <div className="pt-2 space-y-3">
              <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 space-y-2.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs">
                <div className="flex items-center justify-between gap-2 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Rincian {activeOptionalField.label}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      (Nomor telepon, website resmi, email resmi)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleItemChange(0, '')}
                    className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline cursor-pointer"
                  >
                    Kosongkan
                  </button>
                </div>

                <SimpleEditor
                  value={currentItems[0] || ''}
                  onChange={(val) => handleItemChange(0, val)}
                  placeholder="Contoh:&#10;IG: kebunrayabalangan&#10;Youtube: KebunRayaBalangan&#10;Telepon: (021) 12345&#10;Website: https://brin.go.id"
                  minHeight="140px"
                />
              </div>
            </div>
          ) : (
            <div className="pt-2 space-y-3">
              {/* List of Data Items (Data 1, Data 2, ...) */}
              <div className="space-y-3">
                {currentItems.map((itemVal, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 space-y-2.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Data {idx + 1}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
                          Rincian {activeOptionalField.label}
                        </span>
                      </div>

                      {currentItems.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(idx)}
                          className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1 rounded-md"
                          title={`Hapus Data ${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Data {idx + 1}</span>
                        </Button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleItemChange(0, '')}
                          className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline"
                        >
                          Kosongkan
                        </button>
                      )}
                    </div>

                    <SimpleEditor
                      value={itemVal || ''}
                      onChange={(val) => handleItemChange(idx, val)}
                      placeholder={activeOptionalField.placeholder ? `${activeOptionalField.placeholder}` : `Tuliskan rincian data ke-${idx + 1} untuk ${activeOptionalField.label}...`}
                      minHeight="80px"
                    />
                  </div>
                ))}
              </div>

              {/* Button: + Tambah Data */}
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  className="w-full py-3 h-auto border-2 border-dashed border-blue-300 dark:border-blue-800/60 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>  Tambah Data {activeOptionalField.label || ''}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Bottom helper */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('utama')}
              className="text-xs text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Tab Utama</span>
            </button>
            <span className="text-[11px] text-zinc-400">
              Perubahan otomatis disimpan saat tombol Simpan Data ditekan
            </span>
          </div>
        </Card>
      )}

      {/* 5. BOTTOM ACTION BAR */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-xs text-zinc-500">
          Tab aktif:{' '}
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
            {activeTab === 'utama' ? 'UTAMA' : (activeOptionalField ? activeOptionalField.label : activeTab)}
          </span>
          {formData.extra_fields.length > 0 && (
            <span className="ml-2 text-zinc-400">({formData.extra_fields.length} data opsional)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/data-peta-lokasi')}
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Simpan Draft
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={(e) => handleSubmit(e, false)}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
            Simpan Data
          </Button>
        </div>
      </div>

    </div>
  )
}
