import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import CoordinatePicker from '@/components/ui/CoordinatePicker'
import { 
  Building2, 
  Upload, 
  Loader2, 
  MapPin, 
  Plus, 
  Trash2, 
  Sparkles, 
  Award, 
  Users, 
  FlaskConical, 
  Layers, 
  Image as ImageIcon,
  Video,
  Play,
  Film,
  Link as LinkIcon,
  CheckCircle2,
  Check,
  Save,
  Compass,
  Map,
  FileText,
  AlertCircle
} from 'lucide-react'
import { request, API_BASE, 
  uploadFile, 
  fetchKSTDetail, 
  createKST, 
  updateKST, 
  fetchKSTCategories,
  fetchThemes,
  createTheme,
  fetchFacilities,
  createFacility,
  fetchDampak,
  createDampak,
  fetchCollaborations,
  createCollaboration,
  fetchJenisKawasan
} from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { 
  fetchProvinces, 
  fetchRegencies, 
  mapProvinceToWilayah, 
  formatCityName, 
  formatProvinceName 
} from '@/lib/wilayah'
import { toast } from 'sonner'

export default function LocationFormPage({ onSaveSuccess }) {
  const navigate = useNavigate()
  const location = useLocation()
  const match = location.pathname.match(/\/(?:data-peta-lokasi|data-peta-kawasan|peta-kawasan|kst)\/edit\/([^/]+)/);
  const id = match ? match[1] : null;
  const isEdit = Boolean(id)

  const [loadingInitial, setLoadingInitial] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('spasial')
  const [missingFields, setMissingFields] = useState([])
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)
  const [showValidation, setShowValidation] = useState(false)

  // Validation helpers for input error states
  // Hanya 4 field wajib: nama, slug, kawasan/instansi, wilayah
  const isFieldInvalid = (fieldName) => {
    if (!showValidation) return false
    switch (fieldName) {
      case 'nama':
        return !formData.nama || !formData.nama.trim()
      case 'slug':
        return !formData.slug || !formData.slug.trim()
      case 'jenis_kawasan_nama':
      case 'kawasan_nama':
      case 'instansi_nama':
        return (
          (!formData.jenis_kawasan_nama || !formData.jenis_kawasan_nama.trim()) &&
          (!formData.kawasan_nama || !formData.kawasan_nama.trim()) &&
          (!formData.instansi_nama || !formData.instansi_nama.trim())
        )
      case 'kota_provinsi':
        return !formData.kota_provinsi || !formData.kota_provinsi.trim()
      default:
        return false
    }
  }

  const isTabInvalid = (tabId) => {
    if (!showValidation) return false
    switch (tabId) {
      case 'spasial':
        return (
          isFieldInvalid('nama') ||
          isFieldInvalid('slug') ||
          isFieldInvalid('jenis_kawasan_nama') ||
          isFieldInvalid('kota_provinsi')
        )
      default:
        return false
    }
  }

  const errorInputClass = (fieldName) =>
    isFieldInvalid(fieldName)
      ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30 dark:bg-red-950/20'
      : ''


  // API Wilayah Indonesia State
  const [provinces, setProvinces] = useState([])
  const [jenisKawasanList, setJenisKawasanList] = useState([])
  const [isCustomJenisKawasan, setIsCustomJenisKawasan] = useState(false)
  const [regencies, setRegencies] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedRegencyId, setSelectedRegencyId] = useState('')
  const [loadingWilayah, setLoadingWilayah] = useState(false)

  // Master Entities State (Objects with id, nama, deskripsi)
  const [masterThemes, setMasterThemes] = useState([])
  const [masterFacilities, setMasterFacilities] = useState([])
  const [masterDampak, setMasterDampak] = useState([])
  const [masterCollaborations, setMasterCollaborations] = useState([])

  // Inline "Buat Baru" Master State
  const [creatingMaster, setCreatingMaster] = useState(false)
  const [showNewThemeInput, setShowNewThemeInput] = useState(false)
  const [newThemeInput, setNewThemeInput] = useState('')
  const [showNewFacilityInput, setShowNewFacilityInput] = useState(false)
  const [newFacilityInput, setNewFacilityInput] = useState('')
  const [showNewThemeResearchInput, setShowNewThemeResearchInput] = useState(false)
  const [newThemeResearchInput, setNewThemeResearchInput] = useState('')
  const [showNewDampakInput, setShowNewDampakInput] = useState(false)
  const [newDampakInput, setNewDampakInput] = useState('')
  const [showNewCollabInput, setShowNewCollabInput] = useState(false)
  const [newCollabInput, setNewCollabInput] = useState('')



  // Master Categories State (Backward-compatible string arrays for selectors)
  const [categories, setCategories] = useState({
    tema_riset: ['Energi & Material', 'Kesehatan', 'Pangan & Pertanian', 'Lingkungan', 'Teknologi Digital', 'Maritim'],
    tipe_fasilitas: ['Laboratorium', 'Observatorium', 'Pilot Plant', 'Akses Data & Koleksi'],
    potensi_kolaborasi: ['Industri', 'Akademisi', 'Pemerintah', 'Komunitas'],
  })

  const [formData, setFormData] = useState({
    nama: '',
    slug: '',
    jenis_kawasan_nama: '',
    kawasan_nama: '',
    instansi_nama: '',
    telepon: '',
    email: '',
    website: '',
    alamat: '',
    wilayah: 'Jawa',
    kota_provinsi: '',
    pengelola: '',
    status: '',
    tahun_operasi: '',
    thumbnail_url: '',
    latitude: '',
    longitude: '',

    // 1. Profil
    deskripsi_profil: '',
    peran_kawasan: '',
    fokus_utama: [],
    terhubung_dengan: '',

    // 2. Fasilitas (Murni dinamis via tombol +)
    fasilitas: [],

    // 3. Riset (Murni dinamis via tombol +)
    riset: [],
    manfaat_riset: '',
    fasilitas_terhubung: '',

    // 4. Dampak (Murni dinamis via tombol +)
    dampak: [],
    highlight_fasilitas: 0,
    highlight_tema_riset: 0,
    highlight_program_kolaborasi: 0,
    highlight_mitra: 0,

    // 5. Kolaborasi
    potensi_kolaborasi: [],
    daftar_kolaborasi: [],

    // 6. Galeri Foto
    galeri: []
  })

  // Load Master Data & Provinces on Mount
  useEffect(() => {
    let isMounted = true

    // Fetch individual master data tables
    Promise.all([
      fetchThemes(true).catch(() => []),
      fetchFacilities(true).catch(() => []),
      fetchDampak(true).catch(() => []),
      fetchCollaborations(true).catch(() => [])
    ]).then(([themes, facilities, dampak, collaborations]) => {
      if (!isMounted) return
      const tActive = (themes || []).filter(x => x.is_active !== false)
      const fActive = (facilities || []).filter(x => x.is_active !== false)
      const dActive = (dampak || []).filter(x => x.is_active !== false)
      const cActive = (collaborations || []).filter(x => x.is_active !== false)

      if (tActive.length) setMasterThemes(tActive)
      if (fActive.length) setMasterFacilities(fActive)
      if (dActive.length) setMasterDampak(dActive)
      if (cActive.length) setMasterCollaborations(cActive)

      setCategories(prev => ({
        tema_riset: tActive.length ? tActive.map(t => t.nama) : prev.tema_riset,
        tipe_fasilitas: fActive.length ? fActive.map(f => f.nama) : prev.tipe_fasilitas,
        potensi_kolaborasi: cActive.length ? cActive.map(c => c.nama) : prev.potensi_kolaborasi,
      }))
    })

    const loadProvinces = async () => {
      const [provs, jenisKawasans] = await Promise.all([
        fetchProvinces(),
        fetchJenisKawasan().catch(() => [])
      ])
      if (isMounted) {
        if (Array.isArray(provs)) setProvinces(provs)
        if (Array.isArray(jenisKawasans)) setJenisKawasanList(jenisKawasans)
      }
    }
    loadProvinces()

    return () => { isMounted = false }
  }, [])

  // Auto-detect custom jenis kawasan if existing value is not in jenisKawasanList
  useEffect(() => {
    const currentKaw = formData.jenis_kawasan_nama || formData.kawasan_nama || formData.instansi_nama
    if (currentKaw && jenisKawasanList.length > 0) {
      const match = jenisKawasanList.some(
        jk => (jk.nama || '').trim().toLowerCase() === currentKaw.trim().toLowerCase()
      )
      if (!match) {
        setIsCustomJenisKawasan(true)
      }
    }
  }, [jenisKawasanList, formData.jenis_kawasan_nama, formData.kawasan_nama, formData.instansi_nama])

  // Toggle helpers for pill-badges
  const toggleTemaRiset = (tema) => {
    setFormData(prev => {
      const current = Array.isArray(prev.fokus_utama) ? prev.fokus_utama : []
      const exists = current.includes(tema)
      const updated = exists ? current.filter(t => t !== tema) : [...current, tema]
      return { ...prev, fokus_utama: updated }
    })
  }

  const togglePotensiKolaborasi = (kolab) => {
    setFormData(prev => {
      const current = Array.isArray(prev.potensi_kolaborasi) ? prev.potensi_kolaborasi : []
      const exists = current.includes(kolab)
      const updated = exists ? current.filter(k => k !== kolab) : [...current, kolab]
      return { ...prev, potensi_kolaborasi: updated }
    })
  }

  // Inline Master Creation Handlers
  const handleCreateInlineTheme = async () => {
    const val = newThemeInput.trim()
    if (!val) return
    setCreatingMaster(true)
    try {
      const res = await createTheme({ nama: val })
      setMasterThemes(prev => [...prev, res])
      setCategories(prev => ({
        ...prev,
        tema_riset: prev.tema_riset.includes(res.nama) ? prev.tema_riset : [...prev.tema_riset, res.nama]
      }))
      setFormData(prev => ({
        ...prev,
        fokus_utama: [...(prev.fokus_utama || []), res.nama]
      }))
      setNewThemeInput('')
      setShowNewThemeInput(false)
      toast.success(`Tema riset "${res.nama}" dibuat dan dipilih`)
    } catch (err) {
      toast.error(err.message || 'Gagal membuat tema riset baru')
    } finally {
      setCreatingMaster(false)
    }
  }

  const handleCreateInlineCollab = async () => {
    const val = newCollabInput.trim()
    if (!val) return
    setCreatingMaster(true)
    try {
      const res = await createCollaboration({ nama: val })
      setMasterCollaborations(prev => [...prev, res])
      setCategories(prev => ({
        ...prev,
        potensi_kolaborasi: prev.potensi_kolaborasi.includes(res.nama) ? prev.potensi_kolaborasi : [...prev.potensi_kolaborasi, res.nama]
      }))
      setFormData(prev => ({
        ...prev,
        potensi_kolaborasi: [...(prev.potensi_kolaborasi || []), res.nama]
      }))
      setNewCollabInput('')
      setShowNewCollabInput(false)
      toast.success(`Sektor kolaborasi "${res.nama}" dibuat dan dipilih`)
    } catch (err) {
      toast.error(err.message || 'Gagal membuat sektor kolaborasi baru')
    } finally {
      setCreatingMaster(false)
    }
  }

  // When Province Changes, fetch its Cities/Regencies & auto-set Wilayah
  const handleProvinceChange = async (provId) => {
    setSelectedProvinceId(provId)
    setSelectedRegencyId('')
    setRegencies([])

    if (!provId) return

    const provObj = provinces.find(p => p.id === provId || p.kode === provId)
    if (provObj) {
      const autoWilayah = provObj.wilayah || mapProvinceToWilayah(provObj.nama || provObj.name)
      setFormData(prev => ({ ...prev, wilayah: autoWilayah }))
    }

    setLoadingWilayah(true)
    try {
      const regList = await fetchRegencies(provId)
      setRegencies(regList)
    } finally {
      setLoadingWilayah(false)
    }
  }

  // When Regency Changes, auto-format kota_provinsi
  const handleRegencyChange = async (regId) => {
    setSelectedRegencyId(regId)
    if (!regId) return

    const regObj = regencies.find(r => r.id === regId || r.kode === regId)
    const provObj = provinces.find(p => p.id === selectedProvinceId || p.kode === selectedProvinceId)

    if (regObj && provObj) {
      const regName = regObj.nama || regObj.name
      const provName = provObj.nama || provObj.name
      const formatted = `${formatCityName(regName)}, ${formatProvinceName(provName)}`
      setFormData(prev => ({
        ...prev,
        kota_provinsi: formatted
      }))

      // Auto-fetch coordinates from Nominatim
      try {
        const query = encodeURIComponent(`${regName}, ${provName}, Indonesia`)
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`)
        const data = await res.json()
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat)
          const lon = parseFloat(data[0].lon)
          setFormData(prev => ({
            ...prev,
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lon.toFixed(6))
          }))
        }
      } catch (err) {
        console.error('Failed to auto-fetch coordinates for city', err)
      }
    }
  }

  // Load existing KST if Edit mode
  useEffect(() => {
    if (!id) return
    let isMounted = true

    const loadDetail = async () => {
      setLoadingInitial(true)
      try {
        const item = await fetchKSTDetail(id)
        if (!isMounted) return

        const kawName = item.jenis_kawasan_nama || item.kawasan_nama || item.instansi_nama || (item.jenis_kawasan ? item.jenis_kawasan.nama : '') || (item.kawasan ? item.kawasan.nama : '') || ''
        setFormData({
          nama: item.nama || '',
          slug: item.slug || '',
          jenis_kawasan_nama: kawName,
          kawasan_nama: kawName,
          instansi_nama: kawName,
          telepon: item.telepon || '',
          email: item.email || '',
          website: item.website || '',
          alamat: item.alamat || '',
          wilayah: item.wilayah || 'Jawa',
          kota_provinsi: item.kota_provinsi || '',
          pengelola: item.pengelola || 'BRIN',
          status: item.status || 'Aktif',
          tahun_operasi: item.tahun_operasi || 2021,
          thumbnail_url: item.thumbnail_url || '',
          latitude: item.latitude ?? -6.917464,
          longitude: item.longitude ?? 107.619122,

          deskripsi_profil: item.deskripsi_profil || '',
          peran_kawasan: item.peran_kawasan || '',
            terhubung_dengan: item.terhubung_dengan || 'Peneliti, industri, pemerintah, komunitas, dan mitra pendidikan.',

          fasilitas: Array.isArray(item.fasilitas) ? item.fasilitas : [],
          riset: Array.isArray(item.riset) ? item.riset : [],
          manfaat_riset: item.manfaat_riset || '',
          fasilitas_terhubung: item.fasilitas_terhubung || '',

          dampak: Array.isArray(item.dampak) ? item.dampak : [],
          highlight_fasilitas: item.highlight_fasilitas || (item.fasilitas?.length || 0),
          highlight_tema_riset: item.highlight_tema_riset || (item.riset?.length || 0),
          highlight_program_kolaborasi: item.highlight_program_kolaborasi || (item.daftar_kolaborasi?.length || 0),
          highlight_mitra: item.highlight_mitra || 0,

          potensi_kolaborasi: Array.isArray(item.potensi_kolaborasi) ? item.potensi_kolaborasi : [],
          daftar_kolaborasi: Array.isArray(item.daftar_kolaborasi) ? item.daftar_kolaborasi : [],
          galeri: Array.isArray(item.galeri) ? item.galeri.map(g => {
            if (typeof g === 'string') {
              const isVid = ['.mp4', '.webm', '.mov', '.m4v', '.ogg', '.avi', '.mkv'].some(ext => g.toLowerCase().endsWith(ext))
              return { tipe: isVid ? 'video' : 'foto', url: g }
            }
            return {
              id: g.id,
              tipe: g.tipe || 'foto',
              url: g.url || '',
            }
          }) : []
        })

        if (item.kota_provinsi && provinces.length > 0) {
          const matchedProv = provinces.find(p => item.kota_provinsi.toLowerCase().includes((p.nama || p.name || '').toLowerCase()))
          if (matchedProv) {
            setSelectedProvinceId(matchedProv.id || matchedProv.kode)
            fetchRegencies(matchedProv.id || matchedProv.kode).then(regs => {
              if (isMounted && Array.isArray(regs)) {
                setRegencies(regs)
                const matchedReg = regs.find(r => item.kota_provinsi.toLowerCase().includes((r.nama || r.name || '').toLowerCase()))
                if (matchedReg) setSelectedRegencyId(matchedReg.id || matchedReg.kode)
              }
            }).catch(() => {})
          }
        }
      } catch (err) {
        toast.error('Gagal memuat detail data lokasi')
        navigate('/data-peta-lokasi')
      } finally {
        setLoadingInitial(false)
      }
    }

    loadDetail()

    return () => {
      isMounted = false
    }
  }, [id, navigate])

  // Auto-slug generator
  const handleNamaChange = (e) => {
    const val = e.target.value
    setFormData(prev => ({
      ...prev,
      nama: val,
      slug: isEdit ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }))
  }

  // Thumbnail file upload
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const res = await uploadFile(file)
      setFormData(prev => ({
        ...prev,
        thumbnail_url: res.relative_url || res.file_url
      }))
      toast.success('Thumbnail berhasil diunggah')
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah thumbnail')
    } finally {
      setUploading(false)
    }
  }

  // Gallery file upload (Otomatis deteksi foto / video)
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setUploading(true)
    try {
      const newItems = []
      const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v', '.ogg', '.avi', '.mkv']
      for (const f of files) {
        const res = await uploadFile(f)
        const isVid = f.type.startsWith('video/') ||
                      videoExtensions.some(ext => f.name.toLowerCase().endsWith(ext)) ||
                      res.tipe === 'video'
        newItems.push({
          tipe: isVid ? 'video' : 'foto',
          url: res.relative_url || res.file_url,
        })
      }
      setFormData(prev => ({
        ...prev,
        galeri: [...prev.galeri, ...newItems]
      }))
      toast.success(`${newItems.length} media berhasil ditambahkan ke galeri`)
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah media galeri')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeGalleryItem = (idx) => {
    setFormData(prev => ({
      ...prev,
      galeri: prev.galeri.filter((_, i) => i !== idx)
    }))
  }

  const updateGalleryItemTitle = (idx, newJudul) => {
    setFormData(prev => {
      const updated = [...prev.galeri]
      if (typeof updated[idx] === 'string') {
        updated[idx] = { tipe: 'foto', url: updated[idx], judul: newJudul }
      } else {
        updated[idx] = { ...updated[idx], judul: newJudul }
      }
      return { ...prev, galeri: updated }
    })
  }

  // Facility handlers
  const addFacility = () => {
    setFormData(prev => ({
      ...prev,
      fasilitas: [...prev.fasilitas, { nama: '', tipe: '', deskripsi: '', is_custom_tipe: false }],
      highlight_fasilitas: prev.fasilitas.length + 1
    }))
  }

  const addFacilityFromMaster = (fac) => {
    setFormData(prev => ({
      ...prev,
      fasilitas: [
        ...prev.fasilitas,
        {
          nama: fac.nama,
          tipe: fac.nama,
          deskripsi: fac.deskripsi || ''
        }
      ],
      highlight_fasilitas: prev.fasilitas.length + 1
    }))
  }

  const handleCreateInlineFacility = async () => {
    const val = newFacilityInput.trim()
    if (!val) return
    setCreatingMaster(true)
    try {
      const res = await createFacility({ nama: val })
      setMasterFacilities(prev => [...prev, res])
      setCategories(prev => ({
        ...prev,
        tipe_fasilitas: prev.tipe_fasilitas.includes(res.nama) ? prev.tipe_fasilitas : [...prev.tipe_fasilitas, res.nama]
      }))
      addFacilityFromMaster(res)
      setNewFacilityInput('')
      setShowNewFacilityInput(false)
      toast.success(`Master fasilitas "${res.nama}" dibuat dan ditambahkan`)
    } catch (err) {
      toast.error(err.message || 'Gagal membuat fasilitas baru')
    } finally {
      setCreatingMaster(false)
    }
  }

  const updateFacility = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.fasilitas]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, fasilitas: updated }
    })
  }

  const removeFacility = (index) => {
    setFormData(prev => ({
      ...prev,
      fasilitas: prev.fasilitas.filter((_, i) => i !== index),
      highlight_fasilitas: Math.max(0, prev.fasilitas.length - 1)
    }))
  }

  // Research handlers (+ Button)
  const addResearch = () => {
    setFormData(prev => ({
      ...prev,
      riset: [...prev.riset, { judul: '', tema: '', bidang: '', deskripsi: '', is_custom_tema: false }],
      highlight_tema_riset: prev.riset.length + 1
    }))
  }

  const addResearchFromMaster = (theme) => {
    setFormData(prev => ({
      ...prev,
      riset: [
        ...prev.riset,
        {
          judul: `Riset ${theme.nama}`,
          tema: theme.nama,
          deskripsi: theme.deskripsi || ''
        }
      ],
      highlight_tema_riset: prev.riset.length + 1
    }))
  }

  const handleCreateInlineThemeResearch = async () => {
    const val = newThemeResearchInput.trim()
    if (!val) return
    setCreatingMaster(true)
    try {
      const res = await createTheme({ nama: val })
      setMasterThemes(prev => [...prev, res])
      setCategories(prev => ({
        ...prev,
        tema_riset: prev.tema_riset.includes(res.nama) ? prev.tema_riset : [...prev.tema_riset, res.nama]
      }))
      addResearchFromMaster(res)
      setNewThemeResearchInput('')
      setShowNewThemeResearchInput(false)
      toast.success(`Master tema riset "${res.nama}" dibuat dan ditambahkan`)
    } catch (err) {
      toast.error(err.message || 'Gagal membuat tema riset baru')
    } finally {
      setCreatingMaster(false)
    }
  }

  const updateResearch = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.riset]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, riset: updated }
    })
  }

  const removeResearch = (index) => {
    setFormData(prev => ({
      ...prev,
      riset: prev.riset.filter((_, i) => i !== index),
      highlight_tema_riset: Math.max(0, prev.riset.length - 1)
    }))
  }

  // Impact handlers (+ Button)
  const addImpact = () => {
    setFormData(prev => ({
      ...prev,
      dampak: [...prev.dampak, { judul: '', keterangan: '' }]
    }))
  }

  const addImpactFromMaster = (dampak) => {
    setFormData(prev => ({
      ...prev,
      dampak: [
        ...prev.dampak,
        {
          judul: dampak.nama,
          keterangan: dampak.deskripsi || ''
        }
      ]
    }))
  }

  const handleCreateInlineDampak = async () => {
    const val = newDampakInput.trim()
    if (!val) return
    setCreatingMaster(true)
    try {
      const res = await createDampak({ nama: val })
      setMasterDampak(prev => [...prev, res])
      addImpactFromMaster(res)
      setNewDampakInput('')
      setShowNewDampakInput(false)
      toast.success(`Master pilar dampak "${res.nama}" dibuat dan ditambahkan`)
    } catch (err) {
      toast.error(err.message || 'Gagal membuat pilar dampak baru')
    } finally {
      setCreatingMaster(false)
    }
  }

  const updateImpact = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.dampak]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, dampak: updated }
    })
  }

  const removeImpact = (index) => {
    setFormData(prev => ({
      ...prev,
      dampak: prev.dampak.filter((_, i) => i !== index)
    }))
  }

  // Collaboration partner handlers
  const addPartnerCollab = () => {
    const defaultTipe = categories.potensi_kolaborasi?.[0] || 'Industri'
    setFormData(prev => ({
      ...prev,
      daftar_kolaborasi: [...prev.daftar_kolaborasi, { mitra: '', tipe: defaultTipe, deskripsi: '' }],
      highlight_program_kolaborasi: prev.daftar_kolaborasi.length + 1
    }))
  }

  const updatePartnerCollab = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.daftar_kolaborasi]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, daftar_kolaborasi: updated }
    })
  }

  const removePartnerCollab = (index) => {
    setFormData(prev => ({
      ...prev,
      daftar_kolaborasi: prev.daftar_kolaborasi.filter((_, i) => i !== index),
      highlight_program_kolaborasi: Math.max(0, prev.daftar_kolaborasi.length - 1)
    }))
  }

  const executeSave = async (payload) => {
    setSaving(true)
    try {
      if (isEdit) {
        await updateKST(id, payload)
        toast.success(payload.is_draft ? 'Draft KST berhasil disimpan' : 'Data KST berhasil diperbarui')
      } else {
        await createKST(payload)
        toast.success(payload.is_draft ? 'Draft KST baru berhasil disimpan' : 'KST baru berhasil ditambahkan')
      }
      if (onSaveSuccess) onSaveSuccess()
      navigate('/data-peta-lokasi')
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data KST')
    } finally {
      setSaving(false)
    }
  }

  // Submit Handler
  const handleSubmit = async (e, asDraft = false) => {
    if (e) e.preventDefault()

    // Jika menyimpan sebagai draft, hanya Nama Lokasi yang wajib diisi
    if (asDraft) {
      if (!formData.nama || !formData.nama.trim()) {
        setShowValidation(true)
        setMissingFields([{ tab: 'Spasial & Wilayah', field: 'Nama Lokasi' }])
        setActiveTab('spasial')
        return
      }

      let slugVal = formData.slug ? formData.slug.trim() : ''
      if (!slugVal) {
        slugVal = formData.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `draft-${Date.now()}`
      }

      const currentKaw = (formData.jenis_kawasan_nama || formData.kawasan_nama || formData.instansi_nama || '').trim() || null

      const draftPayload = {
        nama: formData.nama.trim(),
        slug: slugVal,
        jenis_kawasan_nama: currentKaw,
        kawasan_nama: currentKaw,
        instansi_nama: currentKaw,
        telepon: formData.telepon ? formData.telepon.trim() : null,
        website: formData.website ? formData.website.trim() : null,
        email: formData.email ? formData.email.trim() : null,
        alamat: formData.alamat ? formData.alamat.trim() : null,
        wilayah: formData.wilayah || 'Jawa',
        kota_provinsi: formData.kota_provinsi ? formData.kota_provinsi.trim() : '',
        pengelola: formData.pengelola ? formData.pengelola.trim() : null,
        status: 'Draft',
        is_draft: true,
        tahun_operasi: formData.tahun_operasi ? parseInt(formData.tahun_operasi, 10) : null,
        thumbnail_url: formData.thumbnail_url || null,
        latitude: formData.latitude !== '' && formData.latitude !== null ? Number(formData.latitude) : null,
        longitude: formData.longitude !== '' && formData.longitude !== null ? Number(formData.longitude) : null,
        deskripsi_profil: formData.deskripsi_profil ? formData.deskripsi_profil.trim() : null,
        peran_kawasan: formData.peran_kawasan ? formData.peran_kawasan.trim() : null,
        fokus_utama: (formData.riset && formData.riset.length > 0)
          ? Array.from(new Set(formData.riset.map(r => r.tema).filter(Boolean)))
          : (Array.isArray(formData.fokus_utama) ? formData.fokus_utama : []),
        terhubung_dengan: formData.terhubung_dengan ? formData.terhubung_dengan.trim() : null,
        fasilitas: (formData.fasilitas || []).filter(f => f.nama && f.nama.trim()),
        riset: (formData.riset || []).filter(r => r.judul && r.judul.trim()),
        dampak: (formData.dampak || []).filter(d => (d.judul && d.judul.trim()) || (d.keterangan && d.keterangan.trim())),
        potensi_kolaborasi: Array.from(new Set([
          ...(Array.isArray(formData.potensi_kolaborasi) ? formData.potensi_kolaborasi : []),
          ...(formData.daftar_kolaborasi || []).map(d => d.tipe).filter(Boolean)
        ])),
        daftar_kolaborasi: (formData.daftar_kolaborasi || []).filter(d => d.mitra && d.mitra.trim()),
        galeri: formData.galeri || []
      }

      setShowValidation(false)
      setMissingFields([])
      executeSave(draftPayload)
      return
    }

    // Cek 4 field wajib: Nama Lokasi, Slug, Jenis Kawasan, Wilayah
    const requiredErrors = []
    if (!formData.nama || !formData.nama.trim()) requiredErrors.push('Nama Lokasi')
    if (!formData.slug || !formData.slug.trim()) requiredErrors.push('Slug URL')
    const currentKaw = (formData.jenis_kawasan_nama || formData.kawasan_nama || formData.instansi_nama || '').trim()
    if (!currentKaw) requiredErrors.push('Jenis Kawasan')
    if (!formData.kota_provinsi || !formData.kota_provinsi.trim()) requiredErrors.push('Kota/Kabupaten & Provinsi')

    if (requiredErrors.length > 0) {
      setShowValidation(true)
      setActiveTab('spasial')
      toast.error(`Field wajib belum diisi: ${requiredErrors.join(', ')}`)
      return
    }

    const validFasilitas = (formData.fasilitas || []).filter(f => f.nama && f.nama.trim())
    const validRiset = (formData.riset || []).filter(r => r.judul && r.judul.trim())
    const validDampak = (formData.dampak || []).filter(d => (d.judul && d.judul.trim()) || (d.keterangan && d.keterangan.trim()))
    const validMitra = (formData.daftar_kolaborasi || []).filter(d => d.mitra && d.mitra.trim())
    const validPotensi = formData.potensi_kolaborasi || []

    // Cek kelengkapan data opsional di seluruh tab
    const emptyFields = []
    if (formData.latitude === '' || formData.latitude === null || formData.longitude === '' || formData.longitude === null) {
      emptyFields.push({ tab: 'Spasial & Wilayah', field: 'Titik Koordinat (Latitude & Longitude)' })
    }
    if (!formData.thumbnail_url || !formData.thumbnail_url.trim()) emptyFields.push({ tab: 'Spasial & Wilayah', field: 'Foto Sampul (Thumbnail)' })
    if (!formData.pengelola || !formData.pengelola.trim()) emptyFields.push({ tab: 'Spasial & Wilayah', field: 'Pengelola Kawasan' })
    if (!formData.status?.trim()) emptyFields.push({ tab: 'Spasial & Wilayah', field: 'Status Kawasan' })
    if (!formData.tahun_operasi) emptyFields.push({ tab: 'Spasial & Wilayah', field: 'Tahun Mulai Operasi' })
    if (!formData.telepon || !formData.telepon.trim()) emptyFields.push({ tab: 'Spasial & Wilayah', field: 'Nomor Telepon' })
    if (!formData.email || !formData.email.trim()) emptyFields.push({ tab: 'Spasial & Wilayah', field: 'Alamat Email' })
    if (!formData.website || !formData.website.trim()) emptyFields.push({ tab: 'Spasial & Wilayah', field: 'Alamat Website' })
    if (!formData.alamat || !formData.alamat.trim()) emptyFields.push({ tab: 'Spasial & Wilayah', field: 'Alamat Lengkap' })
    if (!formData.deskripsi_profil || !formData.deskripsi_profil.trim()) emptyFields.push({ tab: 'Profil Kawasan', field: 'Deskripsi Profil Kawasan' })
    if (!formData.peran_kawasan || !formData.peran_kawasan.trim()) emptyFields.push({ tab: 'Profil Kawasan', field: 'Peran & Fungsi Kawasan' })
    if (validFasilitas.length === 0) emptyFields.push({ tab: 'Fasilitas Riset', field: 'Daftar Fasilitas Riset' })
    if (validRiset.length === 0) emptyFields.push({ tab: 'Tema Riset', field: 'Program Riset Unggulan' })
    if (validDampak.length === 0) emptyFields.push({ tab: 'Dampak', field: 'Data Capaian Dampak' })
    if (validMitra.length === 0 && validPotensi.length === 0) emptyFields.push({ tab: 'Mitra & Kerjasama', field: 'Mitra Kerjasama / Kolaborasi' })
    if (!formData.galeri || formData.galeri.length === 0) emptyFields.push({ tab: 'Galeri & Media', field: 'Foto / Video Galeri' })

    let slugVal = formData.slug ? formData.slug.trim() : ''
    if (!slugVal && formData.nama) {
      slugVal = formData.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `kst-${Date.now()}`
    }

    const payload = {
      nama: formData.nama.trim(),
      slug: slugVal,
      jenis_kawasan_nama: currentKaw || null,
      kawasan_nama: currentKaw || null,
      instansi_nama: currentKaw || null,
      telepon: formData.telepon ? formData.telepon.trim() : null,
      website: formData.website ? formData.website.trim() : null,
      email: formData.email ? formData.email.trim() : null,
      alamat: formData.alamat ? formData.alamat.trim() : null,
      wilayah: formData.wilayah || 'Jawa',
      kota_provinsi: formData.kota_provinsi ? formData.kota_provinsi.trim() : '',
      pengelola: formData.pengelola ? formData.pengelola.trim() : null,
      status: formData.status || 'Aktif',
      is_draft: false,
      tahun_operasi: formData.tahun_operasi ? parseInt(formData.tahun_operasi, 10) : null,
      thumbnail_url: formData.thumbnail_url || null,
      latitude: formData.latitude !== '' && formData.latitude !== null ? Number(formData.latitude) : null,
      longitude: formData.longitude !== '' && formData.longitude !== null ? Number(formData.longitude) : null,
      deskripsi_profil: formData.deskripsi_profil ? formData.deskripsi_profil.trim() : null,
      peran_kawasan: formData.peran_kawasan ? formData.peran_kawasan.trim() : null,
      fokus_utama: (validRiset.length > 0)
        ? Array.from(new Set(validRiset.map(r => r.tema).filter(Boolean)))
        : (Array.isArray(formData.fokus_utama) ? formData.fokus_utama : []),
      terhubung_dengan: formData.terhubung_dengan ? formData.terhubung_dengan.trim() : null,
      fasilitas: validFasilitas,
      riset: validRiset,
      dampak: validDampak,
      potensi_kolaborasi: Array.from(new Set([
        ...validPotensi,
        ...validMitra.map(d => d.tipe).filter(Boolean)
      ])),
      daftar_kolaborasi: validMitra,
      galeri: formData.galeri || []
    }

    // Jika ada field opsional kosong, tampilkan popup
    if (emptyFields.length > 0) {
      setShowValidation(false)
      setMissingFields(emptyFields)
      setPendingPayload(payload)
      setConfirmModalOpen(true)
      return
    }

    setShowValidation(false)
    setMissingFields([])
    executeSave(payload)
  }



  const tabsConfig = [
    { id: 'spasial', label: 'Spasial & Wilayah', icon: Compass },
    { id: 'profil', label: 'Profil Kawasan', icon: Building2 },
    { id: 'fasilitas', label: 'Fasilitas Riset', icon: FlaskConical, badge: formData.fasilitas.length },
    { id: 'riset', label: 'Tema Riset', icon: Sparkles, badge: formData.riset.length },
    { id: 'dampak', label: 'Dampak', icon: Award, badge: formData.dampak.length },
    { id: 'kolaborasi', label: 'Kolaborasi', icon: Users, badge: formData.daftar_kolaborasi.length },
    { id: 'galeri', label: 'Galeri & Media', icon: Film, badge: formData.galeri.length },
  ]

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-zinc-500 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin mb-2 text-zinc-400" />
        <span>Memuat data kawasan...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20 animate-fade-in">
      {/* Top Sticky Header */}
      <div className="sticky top-14 z-10 bg-zinc-50/90 dark:bg-[#09090b]/90 backdrop-blur-md py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-400 font-mono leading-none">
            {isEdit ? 'Ubah Data Lokasi' : 'Tambah Lokasi Baru'}
          </div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
            {formData.nama ? formData.nama : 'Peta Lokasi Kawasan BRIN'}
          </h1>
        </div>

        <div className="flex items-center gap-2">

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/data-peta-lokasi')}
            className="h-8 text-xs font-mono"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={(e) => handleSubmit(e, true)}
            className="h-8 text-xs font-medium gap-1.5 border-amber-300 dark:border-amber-800/80 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            title="Simpan sebagai Draft tanpa validasi kelengkapan data"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Draft</span>
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="h-8 text-xs font-medium gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Simpan</span>
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 rounded-xl shadow-sm overflow-x-auto">
        {tabsConfig.map((t) => {
          const Icon = t.icon
          const active = activeTab === t.id
          const hasError = isTabInvalid(t.id)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative ${
                active
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                  : hasError
                  ? 'text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 hover:bg-red-100/50'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${hasError && !active ? 'text-red-500' : ''}`} />
              <span>{t.label}</span>
              {hasError && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5" title="Ada data yang belum diisi" />
              )}
              {t.badge !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${active ? 'bg-zinc-700 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-800' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>


      {/* TAB 1: SPASIAL & INFORMASI UMUM */}
      {activeTab === 'spasial' && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-6">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Identitas, Wilayah Administratif & Titik Koordinat</h3>
          </div>

          {/* FOTO SAMPUL / THUMBNAIL */}
          <div className="space-y-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <Label className="text-xs font-medium">Foto Sampul Kawasan (Thumbnail) *</Label>
            <div className="flex items-start gap-4">
              <div className={`w-24 h-24 rounded-lg border overflow-hidden shrink-0 flex items-center justify-center ${isFieldInvalid('thumbnail_url') ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20' : 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'}`}>
                {formData.thumbnail_url ? (
                  <img
                    src={getImageUrl(formData.thumbnail_url)}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className={`w-8 h-8 ${isFieldInvalid('thumbnail_url') ? 'text-red-400' : 'text-zinc-400'}`} />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="/uploads/kst-jabar.jpg"
                    className={`h-9 text-xs font-mono flex-1 ${errorInputClass('thumbnail_url')}`}
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button type="button" variant="secondary" className="h-9 text-xs gap-1.5" disabled={uploading}>
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Unggah</span>
                    </Button>
                  </div>
                </div>
                {isFieldInvalid('thumbnail_url') ? (
                  <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Foto sampul lokasi wajib diunggah atau diisi</p>
                ) : (
                  <p className="text-[11px] text-zinc-400">Pilih berkas JPG/PNG untuk cover yang muncul pada preview peta dan kartu drawer.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Lokasi *</Label>
              <Input
                value={formData.nama}
                onChange={handleNamaChange}
                placeholder="Contoh: KST Jawa Barat / BRIDA Kota Medan"
                className={`h-9 text-xs ${errorInputClass('nama')}`}
              />
              {isFieldInvalid('nama') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Nama Lokasi wajib diisi</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Slug URL *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="kst-jawa-barat"
                className={`h-9 text-xs font-mono ${errorInputClass('slug')}`}
              />
              {isFieldInvalid('slug') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Slug URL wajib diisi</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Jenis Kawasan *</Label>
                {isCustomJenisKawasan && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomJenisKawasan(false)
                      const defVal = jenisKawasanList[0]?.nama || ''
                      setFormData(prev => ({ ...prev, jenis_kawasan_nama: defVal, kawasan_nama: defVal, instansi_nama: defVal }))
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center gap-1 font-medium"
                  >
                    ← Pilih dari daftar
                  </button>
                )}
              </div>

              {isCustomJenisKawasan ? (
                <div className="relative flex items-center">
                  <Input
                    autoFocus
                    value={formData.jenis_kawasan_nama || formData.kawasan_nama || formData.instansi_nama || ''}
                    onChange={(e) => setFormData({ ...formData, jenis_kawasan_nama: e.target.value, kawasan_nama: e.target.value, instansi_nama: e.target.value })}
                    placeholder="Ketik nama jenis kawasan baru..."
                    className={`h-9 text-xs w-full bg-white dark:bg-zinc-950 pr-8 ${errorInputClass('jenis_kawasan_nama')}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomJenisKawasan(false)
                      const defVal = jenisKawasanList[0]?.nama || ''
                      setFormData(prev => ({ ...prev, jenis_kawasan_nama: defVal, kawasan_nama: defVal, instansi_nama: defVal }))
                    }}
                    className="absolute right-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs p-1"
                    title="Kembali ke pilihan daftar"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <select
                  value={formData.jenis_kawasan_nama || formData.kawasan_nama || formData.instansi_nama || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '__custom__') {
                      setIsCustomJenisKawasan(true)
                      setFormData(prev => ({ ...prev, jenis_kawasan_nama: '', kawasan_nama: '', instansi_nama: '' }))
                    } else {
                      setFormData(prev => ({ ...prev, jenis_kawasan_nama: val, kawasan_nama: val, instansi_nama: val }))
                    }
                  }}
                  className={`w-full h-9 px-3 rounded-md bg-white dark:bg-zinc-950 border text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 ${isFieldInvalid('jenis_kawasan_nama') ? 'border-red-500 dark:border-red-500 focus:ring-red-500 bg-red-50/30 dark:bg-red-950/20' : 'border-zinc-200 dark:border-zinc-800 focus:ring-zinc-400'}`}
                >
                  <option value="">-- Pilih Jenis Kawasan --</option>
                  {jenisKawasanList.map((jk) => (
                    <option key={jk.id || jk.nama} value={jk.nama}>
                      {jk.nama}
                    </option>
                  ))}
                  {(formData.jenis_kawasan_nama || formData.kawasan_nama || formData.instansi_nama) && !jenisKawasanList.some(i => i.nama === (formData.jenis_kawasan_nama || formData.kawasan_nama || formData.instansi_nama)) && (
                    <option value={formData.jenis_kawasan_nama || formData.kawasan_nama || formData.instansi_nama}>{formData.jenis_kawasan_nama || formData.kawasan_nama || formData.instansi_nama} (Kustom)</option>
                  )}
                  <option value="__custom__" className="font-semibold text-blue-600 dark:text-blue-400">
                    + Tambah Lainnya (Ketik Manual)
                  </option>
                </select>
              )}
              {isFieldInvalid('jenis_kawasan_nama') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Jenis Kawasan wajib dipilih atau diisi</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Telepon *</Label>
              <Input
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                placeholder="021-1234567"
                className={`h-9 text-xs ${errorInputClass('telepon')}`}
              />
              {isFieldInvalid('telepon') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Nomor telepon wajib diisi</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@instansi.go.id"
                className={`h-9 text-xs ${errorInputClass('email')}`}
              />
              {isFieldInvalid('email') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Alamat email wajib diisi</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Website *</Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://instansi.go.id"
                className={`h-9 text-xs ${errorInputClass('website')}`}
              />
              {isFieldInvalid('website') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Alamat website wajib diisi</p>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs">Alamat Lengkap *</Label>
              <Input
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Jl. Raya No. 123..."
                className={`h-9 text-xs ${errorInputClass('alamat')}`}
              />
              {isFieldInvalid('alamat') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Alamat lengkap wajib diisi</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Pengelola Kawasan *</Label>
              <Input
                value={formData.pengelola}
                onChange={(e) => setFormData({ ...formData, pengelola: e.target.value })}
                placeholder="BRIN"
                className={`h-9 text-xs ${errorInputClass('pengelola')}`}
              />
              {isFieldInvalid('pengelola') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Pengelola kawasan wajib diisi</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Status *</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full h-9 px-3 rounded-md bg-white dark:bg-zinc-950 border text-xs text-zinc-900 dark:text-zinc-100 ${isFieldInvalid('status') ? 'border-red-500 dark:border-red-500 bg-red-50/30 dark:bg-red-950/20' : 'border-zinc-200 dark:border-zinc-800'}`}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pengembangan">Pengembangan</option>
                  <option value="Rencana">Rencana</option>
                </select>
                {isFieldInvalid('status') && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Status wajib dipilih</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Tahun Operasi *</Label>
                <Input
                  type="number"
                  value={formData.tahun_operasi}
                  onChange={(e) => setFormData({ ...formData, tahun_operasi: e.target.value })}
                  className={`h-9 text-xs font-mono ${errorInputClass('tahun_operasi')}`}
                />
                {isFieldInvalid('tahun_operasi') && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Tahun operasi wajib diisi</p>
                )}
              </div>
            </div>
          </div>

          {/* INTEGRASI API WILAYAH INDONESIA */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Integrasi Wilayah Administratif Indonesia (API Resmi)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Dropdown Provinsi */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Pilih Provinsi <span className="text-rose-500">*</span>
                </Label>
                <select
                  value={selectedProvinceId}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full h-9 px-3 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="">-- Pilih Provinsi (38 Provinsi) --</option>
                  {provinces.map((prov) => {
                    const val = prov.id || prov.kode
                    const label = prov.nama || prov.name
                    return (
                      <option key={val} value={val}>
                        {formatProvinceName(label)}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Dropdown Kota / Kabupaten */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Pilih Kab / Kota <span className="text-rose-500">*</span>
                  </Label>
                  {loadingWilayah && (
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Memuat...
                    </span>
                  )}
                </div>
                <select
                  value={selectedRegencyId}
                  onChange={(e) => handleRegencyChange(e.target.value)}
                  disabled={!selectedProvinceId || loadingWilayah}
                  className="w-full h-9 px-3 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900/40"
                >
                  <option value="">-- Pilih Kota / Kabupaten --</option>
                  {regencies.map((reg) => {
                    const val = reg.id || reg.kode
                    const label = reg.nama || reg.name
                    return (
                      <option key={val} value={val}>
                        {formatCityName(label)}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Hasil Format Kota & Provinsi */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Format Kota & Provinsi <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={formData.kota_provinsi}
                  onChange={(e) => setFormData({ ...formData, kota_provinsi: e.target.value })}
                  placeholder="Bandung, Jawa Barat"
                  className={`h-9 text-xs bg-white dark:bg-zinc-900 font-medium ${errorInputClass('kota_provinsi')}`}
                />
              </div>
            </div>
            {isFieldInvalid('kota_provinsi') && (
              <p className="text-[11px] text-red-500 dark:text-red-400 font-medium mt-1">
                * Wilayah kota / kabupaten & provinsi wajib diisi
              </p>
            )}
          </div>

          {/* PEMILIH KOORDINAT PETA OPENSTREETMAP */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className={`p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border transition-colors ${isFieldInvalid('koordinat') ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500/50 bg-red-50/10' : 'border-zinc-200 dark:border-zinc-800'}`}>
              <CoordinatePicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onChange={(lat, lng) => {
                  setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                  }))
                }}
              />
              {isFieldInvalid('koordinat') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-medium mt-2 flex items-center gap-1">
                  * Titik koordinat peta latitude dan longitude wajib ditentukan
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* TAB 2: PROFIL & FOKUS */}
      {activeTab === 'profil' && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-5">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Profil <strong className="font-bold">Jelajahi Kawasan Terpadu BRIN</strong></h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Deskripsi Profil Kawasan *</Label>
              <textarea
                rows={4}
                value={formData.deskripsi_profil}
                onChange={(e) => setFormData({ ...formData, deskripsi_profil: e.target.value })}
                placeholder="Kawasan ini menjadi pusat riset, pengembangan, dan kolaborasi yang mendukung potensi unggulan wilayah..."
                className={`w-full p-3 rounded-lg bg-white dark:bg-zinc-950 border text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-none focus:ring-1 ${isFieldInvalid('deskripsi_profil') ? 'border-red-500 dark:border-red-500 focus:ring-red-500 bg-red-50/30 dark:bg-red-950/20' : 'border-zinc-200 dark:border-zinc-800 focus:ring-zinc-400'}`}
              />
              {isFieldInvalid('deskripsi_profil') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Deskripsi profil kawasan wajib diisi</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Peran Kawasan *</Label>
              <textarea
                rows={2}
                value={formData.peran_kawasan}
                onChange={(e) => setFormData({ ...formData, peran_kawasan: e.target.value })}
                placeholder="Mendukung pengembangan riset, inovasi, dan penerapan teknologi di wilayah ini."
                className={`w-full p-3 rounded-lg bg-white dark:bg-zinc-950 border text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-none focus:ring-1 ${isFieldInvalid('peran_kawasan') ? 'border-red-500 dark:border-red-500 focus:ring-red-500 bg-red-50/30 dark:bg-red-950/20' : 'border-zinc-200 dark:border-zinc-800 focus:ring-zinc-400'}`}
              />
              {isFieldInvalid('peran_kawasan') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">* Peran kawasan wajib diisi</p>
              )}
            </div>

          </div>
        </Card>
      )}

      {/* TAB 3: FASILITAS RISET */}
      {activeTab === 'fasilitas' && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Fasilitas Unggulan Kawasan</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFacility}
              className="h-8 text-xs gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Fasilitas</span>
            </Button>
          </div>

          {formData.fasilitas.length === 0 ? (
            <div className={`p-8 border border-dashed rounded-xl text-center space-y-2 transition-colors ${isFieldInvalid('fasilitas') ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 text-red-600 dark:text-red-400' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}>
              <FlaskConical className={`w-8 h-8 mx-auto stroke-1 ${isFieldInvalid('fasilitas') ? 'text-red-500' : 'text-zinc-400'}`} />
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Belum ada fasilitas yang ditambahkan</div>
              <p className="text-[11px] text-zinc-400">Klik tombol Tambah Fasilitas untuk menambahkan fasilitas baru.</p>
              {isFieldInvalid('fasilitas') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-semibold">* Wajib menambahkan minimal 1 fasilitas riset</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFacility}
                className={`h-8 text-xs gap-1.5 mt-2 ${isFieldInvalid('fasilitas') ? 'border-red-400 text-red-600 dark:text-red-400' : ''}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Fasilitas</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.fasilitas.map((f, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Fasilitas #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFacility(idx)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors"
                      title="Hapus Fasilitas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px]">Tipe Fasilitas *</Label>
                      {f.is_custom_tipe && (
                        <button
                          type="button"
                          onClick={() => updateFacility(idx, 'is_custom_tipe', false)}
                          className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          ← Pilih dari daftar
                        </button>
                      )}
                    </div>
                    {f.is_custom_tipe ? (
                      <div className="relative flex items-center">
                        <Input
                          autoFocus
                          value={f.tipe || ''}
                          onChange={(e) => updateFacility(idx, 'tipe', e.target.value)}
                          placeholder="Ketik tipe fasilitas baru..."
                          className="h-8 text-xs bg-white dark:bg-zinc-900 pr-7"
                        />
                        <button
                          type="button"
                          onClick={() => updateFacility(idx, 'is_custom_tipe', false)}
                          className="absolute right-2 text-zinc-400 hover:text-zinc-600 text-xs p-1"
                          title="Kembali ke pilihan daftar"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <select
                        value={f.tipe || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === '__custom__') {
                            updateFacility(idx, 'is_custom_tipe', true)
                            updateFacility(idx, 'tipe', '')
                          } else {
                            updateFacility(idx, 'tipe', val)
                            const matchedFac = masterFacilities.find(m => m.nama === val)
                            if (matchedFac) {
                              if (!f.nama) {
                                updateFacility(idx, 'nama', matchedFac.nama)
                              }
                              if (!f.deskripsi) {
                                updateFacility(idx, 'deskripsi', matchedFac.deskripsi || '')
                              }
                            }
                          }
                        }}
                        className="w-full h-8 px-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                      >
                        <option value="">-- Pilih Tipe Fasilitas --</option>
                        {categories.tipe_fasilitas.map((tipe) => (
                          <option key={tipe} value={tipe}>{tipe}</option>
                        ))}
                        {f.tipe && !categories.tipe_fasilitas.includes(f.tipe) && (
                          <option value={f.tipe}>{f.tipe} (Kustom)</option>
                        )}
                        <option value="__custom__" className="font-semibold text-blue-600 dark:text-blue-400">
                          + Tambah Baru (Ketik Manual)
                        </option>
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Nama Fasilitas *</Label>
                    <Input
                      value={f.nama}
                      onChange={(e) => updateFacility(idx, 'nama', e.target.value)}
                      placeholder="Laboratorium Material"
                      className={`h-8 text-xs bg-white dark:bg-zinc-900 ${showValidation && !f.nama?.trim() ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30 dark:bg-red-950/20' : ''}`}
                    />
                    {showValidation && !f.nama?.trim() && (
                      <p className="text-[10px] text-red-500 font-medium">* Nama fasilitas wajib diisi</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Deskripsi Singkat</Label>
                    <textarea
                      rows={2}
                      value={f.deskripsi}
                      onChange={(e) => updateFacility(idx, 'deskripsi', e.target.value)}
                      placeholder="Pengujian karakteristik material dan validasi performa..."
                      className="w-full p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: TEMA RISET */}
      {activeTab === 'riset' && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Tema Riset & Inovasi</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addResearch}
              className="h-8 text-xs gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Tema Riset</span>
            </Button>
          </div>

          {formData.riset.length === 0 ? (
            <div className={`p-8 border border-dashed rounded-xl text-center space-y-2 transition-colors ${isFieldInvalid('riset') ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 text-red-600 dark:text-red-400' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}>
              <Sparkles className={`w-8 h-8 mx-auto stroke-1 ${isFieldInvalid('riset') ? 'text-red-500' : 'text-zinc-400'}`} />
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Belum ada tema riset yang ditambahkan</div>
              <p className="text-[11px] text-zinc-400">Klik tombol Tambah Tema Riset untuk menambahkan program riset baru.</p>
              {isFieldInvalid('riset') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-semibold">* Wajib menambahkan minimal 1 tema riset unggulan</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addResearch}
                className={`h-8 text-xs gap-1.5 mt-2 ${isFieldInvalid('riset') ? 'border-red-400 text-red-600 dark:text-red-400' : ''}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tema Riset</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.riset.map((r, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Tema Riset #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeResearch(idx)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors"
                      title="Hapus Tema Riset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px]">Tema Riset *</Label>
                      {r.is_custom_tema && (
                        <button
                          type="button"
                          onClick={() => updateResearch(idx, 'is_custom_tema', false)}
                          className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          ← Pilih dari daftar
                        </button>
                      )}
                    </div>
                    {r.is_custom_tema ? (
                      <div className="relative flex items-center">
                        <Input
                          autoFocus
                          value={r.tema || ''}
                          onChange={(e) => {
                            updateResearch(idx, 'tema', e.target.value)
                            updateResearch(idx, 'bidang', e.target.value)
                          }}
                          placeholder="Ketik tema riset baru..."
                          className="h-8 text-xs bg-white dark:bg-zinc-900 pr-7"
                        />
                        <button
                          type="button"
                          onClick={() => updateResearch(idx, 'is_custom_tema', false)}
                          className="absolute right-2 text-zinc-400 hover:text-zinc-600 text-xs p-1"
                          title="Kembali ke pilihan daftar"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <select
                        value={r.tema || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === '__custom__') {
                            updateResearch(idx, 'is_custom_tema', true)
                            updateResearch(idx, 'tema', '')
                            updateResearch(idx, 'bidang', '')
                          } else {
                            updateResearch(idx, 'tema', val)
                            updateResearch(idx, 'bidang', val)
                            const matchedTheme = masterThemes.find(m => m.nama === val)
                            if (matchedTheme) {
                              if (!r.judul || r.judul.startsWith('Riset ')) {
                                updateResearch(idx, 'judul', `Riset ${val}`)
                              }
                              if (!r.deskripsi) {
                                updateResearch(idx, 'deskripsi', matchedTheme.deskripsi || '')
                              }
                            }
                          }
                        }}
                        className="w-full h-8 px-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                      >
                        <option value="">-- Pilih Tema Riset --</option>
                        {categories.tema_riset.map((tema) => (
                          <option key={tema} value={tema}>{tema}</option>
                        ))}
                        {r.tema && !categories.tema_riset.includes(r.tema) && (
                          <option value={r.tema}>{r.tema} (Kustom)</option>
                        )}
                        <option value="__custom__" className="font-semibold text-blue-600 dark:text-blue-400">
                          + Tambah Baru (Ketik Manual)
                        </option>
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Judul Riset *</Label>
                    <Input
                      value={r.judul}
                      onChange={(e) => updateResearch(idx, 'judul', e.target.value)}
                      placeholder="Contoh: Riset Pangan Terpadu"
                      className={`h-8 text-xs bg-white dark:bg-zinc-900 ${showValidation && !r.judul?.trim() ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30 dark:bg-red-950/20' : ''}`}
                    />
                    {showValidation && !r.judul?.trim() && (
                      <p className="text-[10px] text-red-500 font-medium">* Judul riset wajib diisi</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Ringkasan Riset</Label>
                    <textarea
                      rows={2}
                      value={r.deskripsi}
                      onChange={(e) => updateResearch(idx, 'deskripsi', e.target.value)}
                      placeholder="Riset untuk mendukung ketahanan pangan dan inovasi lokal..."
                      className="w-full p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Manfaat Riset (Kotak Bawah Tab Riset)</Label>
              <textarea
                rows={2}
                value={formData.manfaat_riset}
                onChange={(e) => setFormData({ ...formData, manfaat_riset: e.target.value })}
                placeholder="Riset ini mendukung pengambilan keputusan, pengembangan teknologi..."
                className="w-full p-2.5 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fasilitas Terhubung</Label>
              <textarea
                rows={2}
                value={formData.fasilitas_terhubung}
                onChange={(e) => setFormData({ ...formData, fasilitas_terhubung: e.target.value })}
                placeholder="Laboratorium Material, Pilot Plant Pangan, Pusat Analisis Data, Observatorium Lingkungan."
                className="w-full p-2.5 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
              />
            </div>
          </div>
        </Card>
      )}

      {/* TAB 5: DAMPAK */}
      {activeTab === 'dampak' && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Dampak Strategis</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImpact}
              className="h-8 text-xs gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pilar Dampak</span>
            </Button>
          </div>

          {/* Pilar Dampak Dinamis */}
          {formData.dampak.length === 0 ? (
            <div className={`p-8 border border-dashed rounded-xl text-center space-y-2 transition-colors ${
              isFieldInvalid('dampak')
                ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}>
              <Award className={`w-8 h-8 mx-auto stroke-1 ${isFieldInvalid('dampak') ? 'text-red-500' : 'text-zinc-400'}`} />
              <div className={`text-xs font-medium ${isFieldInvalid('dampak') ? 'text-red-600 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                {isFieldInvalid('dampak') ? '* Wajib menambahkan minimal 1 pilar dampak strategis' : 'Belum ada pilar dampak yang ditambahkan'}
              </div>
              <p className={`text-[11px] ${isFieldInvalid('dampak') ? 'text-red-500/80 dark:text-red-400/80' : 'text-zinc-400'}`}>
                Klik tombol Tambah Pilar Dampak untuk menambahkan capaian dampak baru.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImpact}
                className={`h-8 text-xs gap-1.5 mt-2 ${isFieldInvalid('dampak') ? 'border-red-400 text-red-600 dark:text-red-400' : ''}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pilar Dampak</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.dampak.map((d, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400 font-semibold">Pilar #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeImpact(idx)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors"
                      title="Hapus Pilar Dampak"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                        Pilar Dampak *
                      </Label>
                      {d.is_custom_pilar && (
                        <button
                          type="button"
                          onClick={() => updateImpact(idx, 'is_custom_pilar', false)}
                          className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          ← Pilih dari daftar
                        </button>
                      )}
                    </div>
                    {d.is_custom_pilar ? (
                      <div className="relative flex items-center">
                        <Input
                          autoFocus
                          value={d.judul || ''}
                          onChange={(e) => updateImpact(idx, 'judul', e.target.value)}
                          placeholder="Ketik pilar dampak baru (cth: Penguatan Iptek)..."
                          className={`h-8 text-xs bg-white dark:bg-zinc-900 font-semibold pr-7 ${showValidation && !d.judul?.trim() ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30 dark:bg-red-950/20' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => updateImpact(idx, 'is_custom_pilar', false)}
                          className="absolute right-2 text-zinc-400 hover:text-zinc-600 text-xs p-1"
                          title="Kembali ke pilihan daftar"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <select
                        value={d.judul || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === '__custom__') {
                            updateImpact(idx, 'is_custom_pilar', true)
                            updateImpact(idx, 'judul', '')
                          } else {
                            updateImpact(idx, 'judul', val)
                            const matchedDampak = masterDampak.find(m => m.nama === val)
                            if (matchedDampak && !d.keterangan) {
                              updateImpact(idx, 'keterangan', matchedDampak.deskripsi || '')
                            }
                          }
                        }}
                        className={`w-full h-8 px-2 rounded-md bg-white dark:bg-zinc-900 border text-xs font-semibold ${showValidation && !d.judul?.trim() ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30 dark:bg-red-950/20' : 'border-zinc-200 dark:border-zinc-800'}`}
                      >
                        <option value="">-- Pilih Pilar Dampak --</option>
                        {masterDampak.map((item) => (
                          <option key={item.id || item.nama} value={item.nama}>
                            {item.nama}
                          </option>
                        ))}
                        {d.judul && !masterDampak.some(m => m.nama === d.judul) && (
                          <option value={d.judul}>{d.judul} (Kustom)</option>
                        )}
                        <option value="__custom__" className="font-semibold text-blue-600 dark:text-blue-400">
                          + Tambah Baru (Ketik Manual)
                        </option>
                      </select>
                    )}
                    {showValidation && !d.judul?.trim() && (
                      <p className="text-[10px] text-red-500 font-medium">* Judul pilar wajib diisi atau dipilih</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Uraian Dampak</Label>
                    <textarea
                      rows={2}
                      value={d.keterangan}
                      onChange={(e) => updateImpact(idx, 'keterangan', e.target.value)}
                      placeholder="Mendukung pengembangan ilmu pengetahuan dan teknologi berbasis kebutuhan nyata..."
                      className="w-full p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 6: KOLABORASI */}
      {activeTab === 'kolaborasi' && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-6">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Potensi & Kemitraan Kolaborasi</h3>
          </div>

          {/* Potensi Kolaborasi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Potensi Kolaborasi</Label>
              <span className="text-[11px] text-zinc-400 font-mono">
                {(formData.potensi_kolaborasi || []).length} terpilih
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">Pilih sektor mitra kerja sama yang menjadi potensi kolaborasi kawasan (tinggal klik untuk memilih, atau buat baru):</p>
            {isFieldInvalid('kolaborasi') && (
              <p className="text-[11px] text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> * Pilih minimal satu potensi kolaborasi atau tambahkan mitra kerja sama di bawah
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-1 items-center">
              {categories.potensi_kolaborasi.map((kolab) => {
                const isSelected = (formData.potensi_kolaborasi || []).includes(kolab)
                return (
                  <button
                    key={kolab}
                    type="button"
                    onClick={() => togglePotensiKolaborasi(kolab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                        : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    <span>{kolab}</span>
                  </button>
                )
              })}

              {showNewCollabInput ? (
                <div className="flex items-center gap-1.5 p-1 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/60">
                  <Input
                    autoFocus
                    value={newCollabInput}
                    onChange={(e) => setNewCollabInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateInlineCollab()
                      }
                    }}
                    placeholder="Nama sektor baru..."
                    className="h-7 text-xs border-0 bg-transparent px-2.5 w-44 focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateInlineCollab}
                    disabled={creatingMaster || !newCollabInput.trim()}
                    className="h-6 px-2.5 text-[11px] rounded-full"
                  >
                    {creatingMaster ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewCollabInput(false)
                      setNewCollabInput('')
                    }}
                    className="h-6 px-2 text-[11px] rounded-full"
                  >
                    Batal
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewCollabInput(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Buat Sektor Baru</span>
                </button>
              )}
            </div>
          </div>

          {/* Mitra Kolaborasi Terhubung */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Daftar Mitra Kolaborasi</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPartnerCollab}
                className="h-7 text-xs gap-1 font-mono"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Mitra</span>
              </Button>
            </div>

            {formData.daftar_kolaborasi.length === 0 ? (
              <div className={`p-6 border border-dashed rounded-lg text-center text-xs transition-colors ${
                isFieldInvalid('kolaborasi')
                  ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
              }`}>
                {isFieldInvalid('kolaborasi')
                  ? '* Belum ada mitra kolaborasi terdaftar. Pilih potensi di atas atau klik "+ Tambah Mitra".'
                  : 'Belum ada mitra kolaborasi terdaftar. Klik "+ Tambah Mitra" untuk menambahkan.'}
              </div>
            ) : (
              <div className="space-y-2">
                {formData.daftar_kolaborasi.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
                    <Input
                      value={p.mitra}
                      onChange={(e) => updatePartnerCollab(idx, 'mitra', e.target.value)}
                      placeholder="Nama Mitra (cth: Institut Teknologi Bandung)"
                      className={`h-8 text-xs flex-1 ${showValidation && !p.mitra?.trim() ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30 dark:bg-red-950/20' : ''}`}
                    />
                    {p.is_custom_tipe ? (
                      <div className="relative flex items-center">
                        <Input
                          autoFocus
                          value={p.tipe || ''}
                          onChange={(e) => updatePartnerCollab(idx, 'tipe', e.target.value)}
                          placeholder="Sektor..."
                          className="h-8 text-xs bg-white dark:bg-zinc-900 pr-6 w-32"
                        />
                        <button
                          type="button"
                          onClick={() => updatePartnerCollab(idx, 'is_custom_tipe', false)}
                          className="absolute right-1 text-zinc-400 hover:text-zinc-600 text-xs p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <select
                        value={p.tipe}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === '__custom__') {
                            updatePartnerCollab(idx, 'is_custom_tipe', true)
                            updatePartnerCollab(idx, 'tipe', '')
                          } else {
                            updatePartnerCollab(idx, 'tipe', val)
                          }
                        }}
                        className="h-8 px-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                      >
                        {categories.potensi_kolaborasi.map((kolab) => (
                          <option key={kolab} value={kolab}>{kolab}</option>
                        ))}
                        {p.tipe && !categories.potensi_kolaborasi.includes(p.tipe) && (
                          <option value={p.tipe}>{p.tipe} (Kustom)</option>
                        )}
                        <option value="__custom__" className="font-semibold text-blue-600 dark:text-blue-400">
                          + Tambah Baru
                        </option>
                      </select>
                    )}
                    <Input
                      value={p.deskripsi}
                      onChange={(e) => updatePartnerCollab(idx, 'deskripsi', e.target.value)}
                      placeholder="Ruang lingkup kerja sama"
                      className="h-8 text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removePartnerCollab(idx)}
                      className="text-zinc-400 hover:text-rose-600 p-1"
                      title="Hapus Mitra"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* TAB 7: GALERI MEDIA (FOTO & VIDEO) */}
      {activeTab === 'galeri' && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Galeri Media & Dokumentasi</h3>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {formData.galeri.length} Media
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Dokumentasi foto dan video profil kawasan.
              </p>
              {isFieldInvalid('galeri') && (
                <p className="text-[11px] text-red-500 dark:text-red-400 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> * Wajib mengunggah minimal 1 foto atau video dokumentasi kawasan
                </p>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleGalleryUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-blue-500" />}
                  <span>Unggah Media (Foto / Video)</span>
                </Button>
              </div>
            </div>
          </div>

          {formData.galeri.length === 0 ? (
            <div className={`p-12 border border-dashed rounded-xl text-center space-y-3 transition-colors ${
              isFieldInvalid('galeri')
                ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <ImageIcon className={`w-8 h-8 stroke-1 ${isFieldInvalid('galeri') ? 'text-red-500' : 'text-zinc-400'}`} />
                <Video className={`w-8 h-8 stroke-1 ${isFieldInvalid('galeri') ? 'text-red-500' : 'text-zinc-400'}`} />
              </div>
              <div className={`text-xs font-medium ${isFieldInvalid('galeri') ? 'text-red-600 dark:text-red-400' : ''}`}>
                {isFieldInvalid('galeri') ? '* Belum ada foto atau video dalam galeri kawasan ini.' : 'Belum ada foto atau video dalam galeri kawasan ini.'}
              </div>
              <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                Anda dapat mengunggah berkas foto (JPG/PNG/WEBP) atau video (MP4/WEBM/MOV). Tipe media akan terdeteksi otomatis.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleGalleryUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={uploading}>
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 text-blue-500" />}
                    <span>Unggah Media (Foto / Video)</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.galeri.map((item, idx) => {
                const isObj = typeof item === 'object' && item !== null
                const url = isObj ? item.url : item
                const tipe = isObj ? (item.tipe || 'foto') : (
                  (url && ['.mp4', '.webm', '.mov', '.m4v', '.ogg', '.avi', '.mkv'].some(ext => url.toLowerCase().endsWith(ext))) ? 'video' : 'foto'
                )

                return (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm flex flex-col group"
                  >
                    {/* Media Preview Box */}
                    <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden flex items-center justify-center">
                      {tipe === 'video' ? (
                        <video
                          src={getImageUrl(url)}
                          preload="metadata"
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={getImageUrl(url)}
                          alt={`Galeri ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      )}

                      {/* Badge Tipe Media */}
                      <div className="absolute top-2 left-2 z-10 pointer-events-none">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-1 ${
                          tipe === 'video' ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          {tipe === 'video' ? <Video className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                          {tipe === 'video' ? 'VIDEO' : 'FOTO'}
                        </span>
                      </div>

                      {/* Tombol Hapus */}
                      <button
                        type="button"
                        onClick={() => removeGalleryItem(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white transition-colors opacity-90 hover:opacity-100 shadow-md z-10"
                        title="Hapus Media"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Media URL info */}
                    <div className="p-2 flex items-center justify-between">
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate px-0.5" title={url}>
                        {url}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 z-20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-400 font-mono">
            Tab aktif: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{tabsConfig.find(t => t.id === activeTab)?.label}</span>
          </div>

        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/data-peta-lokasi')}
            className="h-8 text-xs font-mono"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={(e) => handleSubmit(e, true)}
            className="h-8 text-xs font-medium gap-1.5 border-amber-300 dark:border-amber-800/80 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            title="Simpan sebagai Draft tanpa validasi kelengkapan data"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Draft</span>
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="h-8 text-xs font-medium gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Simpan</span>
          </Button>
        </div>
      </div>

      {/* Popup modal: data opsional belum lengkap */}
      <AlertDialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <AlertDialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg">
          <AlertDialogHeader className="pr-8">
            <AlertDialogTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              Ada Data yang Belum Diisi
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2.5 mt-2">
                <p>
                  Beberapa data pendukung masih belum diisi ({missingFields.length} item). Klik salah satu untuk menuju tab terkait:
                </p>
                <div className="max-h-60 overflow-y-auto pr-1 space-y-1 rounded-lg bg-zinc-50 dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-800">
                  {missingFields.map((item, idx) => {
                    const tabMap = {
                      'Spasial & Wilayah': 'spasial',
                      'Profil Kawasan': 'profil',
                      'Fasilitas Riset': 'fasilitas',
                      'Tema Riset': 'riset',
                      'Dampak': 'dampak',
                      'Mitra & Kerjasama': 'kolaborasi',
                      'Galeri & Media': 'galeri',
                    }
                    const tabName = typeof item === 'string' ? 'Spasial & Wilayah' : item.tab
                    const fieldLabel = typeof item === 'string' ? item : item.field
                    const targetTab = tabMap[tabName] || 'spasial'
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveTab(targetTab)
                          setConfirmModalOpen(false)
                        }}
                        className="w-full flex items-center justify-between gap-2 text-[11px] leading-relaxed p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-left cursor-pointer transition-colors group"
                        title={`Klik untuk menuju ke tab ${tabName}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 whitespace-nowrap flex-shrink-0">
                            {tabName}
                          </span>
                          <span className="text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium truncate">
                            {fieldLabel}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          Buka tab &rarr;
                        </span>
                      </button>
                    )
                  })}
                </div>
                <p className="pt-1 leading-relaxed">
                  Apakah Anda yakin ingin tetap menyimpan, atau lengkapi data terlebih dahulu?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <AlertDialogCancel
              onClick={() => {
                const tabMap = {
                  'Spasial & Wilayah': 'spasial',
                  'Profil Kawasan': 'profil',
                  'Fasilitas Riset': 'fasilitas',
                  'Tema Riset': 'riset',
                  'Dampak': 'dampak',
                  'Mitra & Kerjasama': 'kolaborasi',
                  'Galeri & Media': 'galeri',
                }
                const first = missingFields[0]
                const tabName = typeof first === 'string' ? 'Spasial & Wilayah' : first?.tab
                if (tabName && tabMap[tabName]) {
                  setActiveTab(tabMap[tabName])
                }
              }}
              className="h-8 text-xs font-mono"
            >
              Lengkapi Data
            </AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setConfirmModalOpen(false)
                if (pendingPayload) {
                  executeSave({ ...pendingPayload, is_draft: true, status: 'Draft' })
                }
              }}
              className="h-8 text-xs border-amber-300 dark:border-amber-700/80 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 gap-1 font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Simpan Draft</span>
            </Button>
            <AlertDialogAction
              onClick={() => {
                setConfirmModalOpen(false)
                if (pendingPayload) {
                  executeSave(pendingPayload)
                }
              }}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Tetap Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </form>
  )
}
