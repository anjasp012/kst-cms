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
  CheckCircle2,
  Check,
  Save,
  Compass,
  Map,
  FileText
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
  createCollaboration
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

export default function KSTFormPage({ onSaveSuccess }) {
  const navigate = useNavigate()
  const location = useLocation()
  const match = location.pathname.match(/\/kst\/edit\/([^/]+)/);
  const id = match ? match[1] : null;
  const isEdit = Boolean(id)

  const [loadingInitial, setLoadingInitial] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('spasial')
  const [missingFields, setMissingFields] = useState([])
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)


  // API Wilayah Indonesia State
  const [provinces, setProvinces] = useState([])
  const [instansiList, setInstansiList] = useState([])
  const [regencies, setRegencies] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedRegencyId, setSelectedRegencyId] = useState('')
  const [loadingWilayah, setLoadingWilayah] = useState(false)
  const [manualKotaInput, setManualKotaInput] = useState(false)

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
    galeri: [],
    is_active: true
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
      const [provs, instansis] = await Promise.all([
        fetchProvinces(),
        request(`${API_BASE}/kst/instansi`).catch(() => [])
      ])
      if (isMounted) {
        if (Array.isArray(provs)) setProvinces(provs)
        if (Array.isArray(instansis)) setInstansiList(instansis)
      }
    }
    loadProvinces()

    return () => { isMounted = false }
  }, [])

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

        setFormData({
          nama: item.nama || '',
          slug: item.slug || '',
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
          galeri: Array.isArray(item.galeri) ? item.galeri : [],
          is_active: item.is_active ?? true
        })

        if (item.kota_provinsi) {
          setManualKotaInput(true)
        }
      } catch (err) {
        toast.error('Gagal memuat detail KST')
        navigate('/kst')
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

  // Gallery file upload
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setUploading(true)
    try {
      const uploadedUrls = []
      for (const f of files) {
        const res = await uploadFile(f)
        uploadedUrls.push(res.relative_url || res.file_url)
      }
      setFormData(prev => ({
        ...prev,
        galeri: [...prev.galeri, ...uploadedUrls]
      }))
      toast.success(`${uploadedUrls.length} foto berhasil ditambahkan ke galeri`)
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah foto galeri')
    } finally {
      setUploading(false)
    }
  }

  const removeGalleryImage = (idx) => {
    setFormData(prev => ({
      ...prev,
      galeri: prev.galeri.filter((_, i) => i !== idx)
    }))
  }

  // Facility handlers
  const addFacility = () => {
    const defaultTipe = categories.tipe_fasilitas?.[0] || 'Laboratorium'
    setFormData(prev => ({
      ...prev,
      fasilitas: [...prev.fasilitas, { nama: '', tipe: defaultTipe, deskripsi: '' }],
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
    const defaultTema = categories.tema_riset?.[0] || 'Energi & Material'
    setFormData(prev => ({
      ...prev,
      riset: [...prev.riset, { judul: '', tema: defaultTema, deskripsi: '' }],
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
        toast.success('Data KST berhasil diperbarui')
      } else {
        await createKST(payload)
        toast.success('KST baru berhasil ditambahkan')
      }
      if (onSaveSuccess) onSaveSuccess()
      navigate('/kst')
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data KST')
    } finally {
      setSaving(false)
    }
  }

  // Submit Handler
  const handleSubmit = async (e, asDraft = false) => {
    if (e) e.preventDefault()

    if (!formData.nama.trim()) {
      toast.error('Nama KST wajib diisi')
      return
    }
    if (!formData.slug.trim()) {
      toast.error('Slug URL wajib diisi')
      return
    }
    if (!formData.instansi_nama || !formData.instansi_nama.trim()) {
      toast.error('Jenis Instansi wajib diisi')
      return
    }
    if (!formData.kota_provinsi || !formData.kota_provinsi.trim()) {
      toast.error('Wilayah (Kota/Kabupaten) wajib diisi')
      return
    }

    const payload = {
      nama: formData.nama.trim(),
      slug: formData.slug.trim(),
      instansi_nama: formData.instansi_nama,
      telepon: formData.telepon,
      website: formData.website,
      email: formData.email,
      alamat: formData.alamat,
      wilayah: formData.wilayah,
      kota_provinsi: formData.kota_provinsi ? formData.kota_provinsi.trim() : '',
      pengelola: formData.pengelola ? formData.pengelola.trim() : null,
      status: asDraft ? 'Draft' : (formData.status || null),
      tahun_operasi: formData.tahun_operasi ? parseInt(formData.tahun_operasi, 10) : null,
      thumbnail_url: formData.thumbnail_url,
      latitude: formData.latitude !== '' ? Number(formData.latitude) : null,
      longitude: formData.longitude !== '' ? Number(formData.longitude) : null,

      deskripsi_profil: formData.deskripsi_profil.trim() || null,
      peran_kawasan: formData.peran_kawasan.trim() || null,
      fokus_utama: (formData.riset && formData.riset.length > 0)
        ? Array.from(new Set(formData.riset.map(r => r.tema).filter(Boolean)))
        : (Array.isArray(formData.fokus_utama) ? formData.fokus_utama : []),
      terhubung_dengan: formData.terhubung_dengan ? formData.terhubung_dengan.trim() : null,

      fasilitas: formData.fasilitas.filter(f => f.nama.trim()),
      riset: formData.riset.filter(r => r.judul.trim()),
      potensi_kolaborasi: Array.from(new Set([
        ...(Array.isArray(formData.potensi_kolaborasi) ? formData.potensi_kolaborasi : []),
        ...formData.daftar_kolaborasi.map(d => d.tipe).filter(Boolean)
      ])),
      daftar_kolaborasi: formData.daftar_kolaborasi.filter(d => d.mitra.trim()),
      galeri: formData.galeri,
      is_active: formData.is_active
    }

    // Check empty optional fields
    const emptyFields = []
    if (!payload.pengelola) emptyFields.push('Pengelola')
    if (payload.status !== 'Draft' && !payload.status) emptyFields.push('Status')
    if (!payload.tahun_operasi) emptyFields.push('Tahun Operasi')
    if (payload.latitude === null || payload.longitude === null) emptyFields.push('Titik Koordinat')
    if (!payload.deskripsi_profil) emptyFields.push('Profil Kawasan')
    
    if (emptyFields.length > 0) {
      setMissingFields(emptyFields)
      setPendingPayload(payload)
      setConfirmModalOpen(true)
      return
    }

    executeSave(payload)
  }



  const tabsConfig = [
    { id: 'spasial', label: 'Spasial & Wilayah', icon: Compass },
    { id: 'profil', label: 'Profil Kawasan', icon: Building2 },
    { id: 'fasilitas', label: 'Fasilitas Riset', icon: FlaskConical, badge: formData.fasilitas.length },
    { id: 'riset', label: 'Tema Riset', icon: Sparkles, badge: formData.riset.length },
    { id: 'dampak', label: 'Dampak', icon: Award, badge: formData.dampak.length },
    { id: 'kolaborasi', label: 'Kolaborasi', icon: Users, badge: formData.daftar_kolaborasi.length },
    { id: 'galeri', label: 'Galeri Foto', icon: ImageIcon, badge: formData.galeri.length },
  ]

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-zinc-500 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin mb-2 text-zinc-400" />
        <span>Memuat data KST...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20 animate-fade-in">
      {/* Top Sticky Header */}
      <div className="sticky top-14 z-10 bg-zinc-50/90 dark:bg-[#09090b]/90 backdrop-blur-md py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-400 font-mono leading-none">
            {isEdit ? 'Ubah Data Kawasan' : 'Buat Kawasan Baru'}
          </div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
            {formData.nama ? formData.nama : (isEdit ? 'Edit KST' : 'Tambah Kawasan Sains (KST)')}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/kst')}
            className="h-8 text-xs font-mono"
          >
            Batal
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="h-8 text-xs font-medium gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Simpan KST</span>
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 rounded-xl shadow-sm overflow-x-auto">
        {tabsConfig.map((t) => {
          const Icon = t.icon
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                active
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
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
            <Label className="text-xs font-medium">Foto Sampul Kawasan (Thumbnail)</Label>
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                {formData.thumbnail_url ? (
                  <img
                    src={getImageUrl(formData.thumbnail_url)}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-zinc-400" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="/uploads/kst-jabar.jpg"
                    className="h-9 text-xs font-mono flex-1"
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
                <p className="text-[11px] text-zinc-400">Pilih berkas JPG/PNG untuk cover KST yang muncul pada preview peta dan kartu drawer.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama KST *</Label>
              <Input
                value={formData.nama}
                onChange={handleNamaChange}
                placeholder="KST Jawa Barat"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Slug URL *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="kst-jawa-barat"
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Jenis Instansi *</Label>
              <div className="relative">
                <Input
                  list="instansi-list"
                  value={formData.instansi_nama || ''}
                  onChange={(e) => setFormData({ ...formData, instansi_nama: e.target.value })}
                  placeholder="Pilih dari daftar atau ketik nama instansi baru..."
                  className="h-9 text-xs w-full bg-white dark:bg-zinc-950"
                  autoComplete="off"
                />
                <datalist id="instansi-list">
                  {instansiList.map((inst) => (
                    <option key={inst.id} value={inst.nama} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Telepon</Label>
              <Input
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                placeholder="021-1234567"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@instansi.go.id"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Website</Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://instansi.go.id"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs">Alamat Lengkap</Label>
              <Input
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Jl. Raya No. 123..."
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Pengelola Kawasan</Label>
              <Input
                value={formData.pengelola}
                onChange={(e) => setFormData({ ...formData, pengelola: e.target.value })}
                placeholder="BRIN"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-9 px-3 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pengembangan">Pengembangan</option>
                  <option value="Rencana">Rencana</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Tahun Operasi</Label>
                <Input
                  type="number"
                  value={formData.tahun_operasi}
                  onChange={(e) => setFormData({ ...formData, tahun_operasi: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* INTEGRASI API WILAYAH INDONESIA */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Integrasi Wilayah Administratif Indonesia (API Resmi)
                </span>
              </div>
              <button
                  type="button"
                  onClick={() => setManualKotaInput(!manualKotaInput)}
                  className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 underline"
                >
                  {manualKotaInput ? 'Gunakan Dropdown API Wilayah' : 'Input Manual Teks'}
              </button>
            </div>

              {!manualKotaInput ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dropdown Provinsi */}
              <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-500">Pilih Provinsi</Label>
                  <select
                      value={selectedProvinceId}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full h-8 px-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
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
              <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-500">
                      Pilih Kota / Kabupaten * {loadingWilayah && '(Memuat...)'}
                  </Label>
                  <select
                      value={selectedRegencyId}
                      onChange={(e) => handleRegencyChange(e.target.value)}
                      disabled={!selectedProvinceId || loadingWilayah}
                      className="w-full h-8 px-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs disabled:opacity-50"
                    >
                    <option value="">-- Pilih Kota/Kabupaten --</option>
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
              <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-500">Format Kota & Provinsi</Label>
                  <Input
                      value={formData.kota_provinsi}
                      onChange={(e) => setFormData({ ...formData, kota_provinsi: e.target.value })}
                      placeholder="Bandung, Jawa Barat"
                      className="h-8 text-xs bg-white dark:bg-zinc-900 font-medium"
                    />
                </div>
              </div>
              ) : (
              <div className="space-y-1">
                <Label className="text-[11px] text-zinc-500">Kota / Kabupaten & Provinsi (Input Manual) *</Label>
                <Input
                    value={formData.kota_provinsi}
                    onChange={(e) => setFormData({ ...formData, kota_provinsi: e.target.value })}
                    placeholder="Contoh: Bandung, Jawa Barat"
                    className="h-8 text-xs bg-white dark:bg-zinc-900"
                  />
              </div>
              )}
          </div>




          {/* PEMILIH KOORDINAT PETA OPENSTREETMAP */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
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
            </div>
          </div>
        </Card>
      )}

      {/* TAB 2: PROFIL & FOKUS */}
      {activeTab === 'profil' && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-5">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Profil Kawasan (Wonderful BRIN)</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Deskripsi Profil Kawasan</Label>
              <textarea
                rows={4}
                value={formData.deskripsi_profil}
                onChange={(e) => setFormData({ ...formData, deskripsi_profil: e.target.value })}
                placeholder="Kawasan ini menjadi pusat riset, pengembangan, dan kolaborasi yang mendukung potensi unggulan wilayah..."
                className="w-full p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Peran Kawasan</Label>
              <textarea
                rows={2}
                value={formData.peran_kawasan}
                onChange={(e) => setFormData({ ...formData, peran_kawasan: e.target.value })}
                placeholder="Mendukung pengembangan riset, inovasi, dan penerapan teknologi di wilayah ini."
                className="w-full p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
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
              <span>Tambah Fasilitas Manual</span>
            </Button>
          </div>

          {/* Quick Picker Bar dari Master Fasilitas */}
          <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pilih Fasilitas Cepat (Tinggal Klik untuk Menambahkan)</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {masterFacilities.length} master tersedia
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Klik fasilitas di bawah untuk menambahkan langsung ke daftar kawasan ini beserta deskripsi singkatnya:
            </p>

            <div className="flex flex-wrap gap-2 pt-1 items-center">
              {masterFacilities.map((fac) => {
                const countAdded = formData.fasilitas.filter(f => f.nama.toLowerCase() === fac.nama.toLowerCase()).length
                return (
                  <button
                    key={fac.id || fac.nama}
                    type="button"
                    onClick={() => addFacilityFromMaster(fac)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border flex items-center gap-1.5 cursor-pointer ${
                      countAdded > 0
                        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-xs'
                    }`}
                    title={fac.deskripsi || fac.nama}
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{fac.nama}</span>
                    {countAdded > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                        ({countAdded})
                      </span>
                    )}
                  </button>
                )
              })}

              {showNewFacilityInput ? (
                <div className="flex items-center gap-1.5 p-1 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <Input
                    autoFocus
                    value={newFacilityInput}
                    onChange={(e) => setNewFacilityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateInlineFacility()
                      }
                    }}
                    placeholder="Nama fasilitas baru..."
                    className="h-7 text-xs border-0 bg-transparent px-2 w-44 focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateInlineFacility}
                    disabled={creatingMaster || !newFacilityInput.trim()}
                    className="h-6 px-2.5 text-[11px]"
                  >
                    {creatingMaster ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewFacilityInput(false)
                      setNewFacilityInput('')
                    }}
                    className="h-6 px-2 text-[11px]"
                  >
                    Batal
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewFacilityInput(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Buat Fasilitas Baru</span>
                </button>
              )}
            </div>
          </div>

          {formData.fasilitas.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center space-y-2 text-zinc-400">
              <FlaskConical className="w-8 h-8 mx-auto stroke-1 text-zinc-400" />
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Belum ada fasilitas yang ditambahkan</div>
              <p className="text-[11px] text-zinc-400">Pilih fasilitas siap pakai di atas atau klik Tambah Fasilitas Manual.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFacility}
                className="h-8 text-xs gap-1.5 mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Fasilitas Manual</span>
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
                    <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Fasilitas</span>
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
                    <Label className="text-[11px]">Nama Fasilitas</Label>
                    <Input
                      value={f.nama}
                      onChange={(e) => updateFacility(idx, 'nama', e.target.value)}
                      placeholder="Laboratorium Material"
                      className="h-8 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Tipe Fasilitas</Label>
                    <select
                      value={f.tipe}
                      onChange={(e) => updateFacility(idx, 'tipe', e.target.value)}
                      className="w-full h-8 px-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                    >
                      {categories.tipe_fasilitas.map((tipe) => (
                        <option key={tipe} value={tipe}>{tipe}</option>
                      ))}
                    </select>
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
              <span>Tambah Tema Riset Manual</span>
            </Button>
          </div>

          {/* Quick Picker Bar dari Master Tema Riset */}
          <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pilih Tema Riset Cepat (Tinggal Klik untuk Menambahkan)</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {masterThemes.length} tema tersedia
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Klik tema riset di bawah untuk otomatis menambahkan kartu riset beserta ringkasan deskripsinya:
            </p>

            <div className="flex flex-wrap gap-2 pt-1 items-center">
              {masterThemes.map((theme) => {
                const countAdded = formData.riset.filter(r => r.tema.toLowerCase() === theme.nama.toLowerCase()).length
                return (
                  <button
                    key={theme.id || theme.nama}
                    type="button"
                    onClick={() => addResearchFromMaster(theme)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border flex items-center gap-1.5 cursor-pointer ${
                      countAdded > 0
                        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-xs'
                    }`}
                    title={theme.deskripsi || theme.nama}
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{theme.nama}</span>
                    {countAdded > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                        ({countAdded})
                      </span>
                    )}
                  </button>
                )
              })}

              {showNewThemeResearchInput ? (
                <div className="flex items-center gap-1.5 p-1 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <Input
                    autoFocus
                    value={newThemeResearchInput}
                    onChange={(e) => setNewThemeResearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateInlineThemeResearch()
                      }
                    }}
                    placeholder="Nama tema riset baru..."
                    className="h-7 text-xs border-0 bg-transparent px-2 w-44 focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateInlineThemeResearch}
                    disabled={creatingMaster || !newThemeResearchInput.trim()}
                    className="h-6 px-2.5 text-[11px]"
                  >
                    {creatingMaster ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewThemeResearchInput(false)
                      setNewThemeResearchInput('')
                    }}
                    className="h-6 px-2 text-[11px]"
                  >
                    Batal
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewThemeResearchInput(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Buat Tema Baru</span>
                </button>
              )}
            </div>
          </div>

          {formData.riset.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center space-y-2 text-zinc-400">
              <Sparkles className="w-8 h-8 mx-auto stroke-1 text-zinc-400" />
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Belum ada tema riset yang ditambahkan</div>
              <p className="text-[11px] text-zinc-400">Pilih tema riset siap pakai di atas atau klik Tambah Tema Riset Manual.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addResearch}
                className="h-8 text-xs gap-1.5 mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tema Riset Manual</span>
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
                    <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Tema Riset</span>
                    <button
                      type="button"
                      onClick={() => removeResearch(idx)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors"
                      title="Hapus Tema Riset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Judul Riset</Label>
                      <Input
                        value={r.judul}
                        onChange={(e) => updateResearch(idx, 'judul', e.target.value)}
                        placeholder="Contoh: Riset Pangan Terpadu"
                        className="h-8 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Tema Riset</Label>
                      <select
                        value={r.tema}
                        onChange={(e) => updateResearch(idx, 'bidang', e.target.value)}
                        className="w-full h-8 px-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                      >
                        {categories.tema_riset.map((tema) => (
                          <option key={tema} value={tema}>{tema}</option>
                        ))}
                      </select>
                    </div>
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
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Dampak Strategis & Data Highlight</h3>
              </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImpact}
              className="h-8 text-xs gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pilar Dampak Manual</span>
            </Button>
          </div>

          {/* Quick Picker Bar dari Master Pilar Dampak */}
          <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pilih Pilar Dampak Cepat (Tinggal Klik untuk Menambahkan)</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {masterDampak.length} pilar tersedia
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Klik pilar dampak di bawah untuk menambahkan langsung ke daftar beserta uraian dampaknya:
            </p>

            <div className="flex flex-wrap gap-2 pt-1 items-center">
              {masterDampak.map((item) => {
                const countAdded = formData.dampak.filter(d => d.judul.toLowerCase() === item.nama.toLowerCase()).length
                return (
                  <button
                    key={item.id || item.nama}
                    type="button"
                    onClick={() => addImpactFromMaster(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border flex items-center gap-1.5 cursor-pointer ${
                      countAdded > 0
                        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-xs'
                    }`}
                    title={item.deskripsi || item.nama}
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{item.nama}</span>
                    {countAdded > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                        ({countAdded})
                      </span>
                    )}
                  </button>
                )
              })}

              {showNewDampakInput ? (
                <div className="flex items-center gap-1.5 p-1 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <Input
                    autoFocus
                    value={newDampakInput}
                    onChange={(e) => setNewDampakInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateInlineDampak()
                      }
                    }}
                    placeholder="Nama pilar dampak baru..."
                    className="h-7 text-xs border-0 bg-transparent px-2 w-44 focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateInlineDampak}
                    disabled={creatingMaster || !newDampakInput.trim()}
                    className="h-6 px-2.5 text-[11px]"
                  >
                    {creatingMaster ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewDampakInput(false)
                      setNewDampakInput('')
                    }}
                    className="h-6 px-2 text-[11px]"
                  >
                    Batal
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewDampakInput(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Buat Pilar Baru</span>
                </button>
              )}
            </div>
          </div>

          {/* Pilar Dampak Dinamis */}
          {formData.dampak.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center space-y-2 text-zinc-400">
              <Award className="w-8 h-8 mx-auto stroke-1 text-zinc-400" />
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Belum ada pilar dampak yang ditambahkan</div>
              <p className="text-[11px] text-zinc-400">Pilih pilar dampak siap pakai di atas atau klik Tambah Pilar Dampak Manual.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImpact}
                className="h-8 text-xs gap-1.5 mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pilar Dampak Manual</span>
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
                    <Label className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                      Judul Pilar (cth: Penguatan Iptek, Daya Saing Wilayah)
                    </Label>
                    <Input
                      value={d.judul}
                      onChange={(e) => updateImpact(idx, 'judul', e.target.value)}
                      placeholder="Penguatan Iptek"
                      className="h-8 text-xs bg-white dark:bg-zinc-900 font-semibold"
                    />
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

          {/* Data Highlight Metrik */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <Label className="text-xs font-semibold mb-2 block">Data Highlight Metrik (Kotak Bawah Tab Dampak)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-1">
                <div className="text-[11px] text-zinc-400 font-mono">Fasilitas</div>
                <Input
                  type="number"
                  value={formData.highlight_fasilitas}
                  onChange={(e) => setFormData({ ...formData, highlight_fasilitas: Number(e.target.value) })}
                  className="h-8 text-center text-sm font-bold font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-1">
                <div className="text-[11px] text-zinc-400 font-mono">Tema Riset</div>
                <Input
                  type="number"
                  value={formData.highlight_tema_riset}
                  onChange={(e) => setFormData({ ...formData, highlight_tema_riset: Number(e.target.value) })}
                  className="h-8 text-center text-sm font-bold font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-1">
                <div className="text-[11px] text-zinc-400 font-mono">Program Kolaborasi</div>
                <Input
                  type="number"
                  value={formData.highlight_program_kolaborasi}
                  onChange={(e) => setFormData({ ...formData, highlight_program_kolaborasi: Number(e.target.value) })}
                  className="h-8 text-center text-sm font-bold font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-1">
                <div className="text-[11px] text-zinc-400 font-mono">Mitra</div>
                <Input
                  type="number"
                  value={formData.highlight_mitra}
                  onChange={(e) => setFormData({ ...formData, highlight_mitra: Number(e.target.value) })}
                  className="h-8 text-center text-sm font-bold font-mono"
                />
              </div>
            </div>
          </div>
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
              <div className="p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-center text-xs text-zinc-400">
                Belum ada mitra kolaborasi terdaftar. Klik "+ Tambah Mitra" untuk menambahkan.
              </div>
            ) : (
              <div className="space-y-2">
                {formData.daftar_kolaborasi.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
                    <Input
                      value={p.mitra}
                      onChange={(e) => updatePartnerCollab(idx, 'mitra', e.target.value)}
                      placeholder="Nama Mitra (cth: Institut Teknologi Bandung)"
                      className="h-8 text-xs flex-1"
                    />
                    <select
                      value={p.tipe}
                      onChange={(e) => updatePartnerCollab(idx, 'tipe', e.target.value)}
                      className="h-8 px-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                    >
                      {categories.potensi_kolaborasi.map((kolab) => (
                        <option key={kolab} value={kolab}>{kolab}</option>
                      ))}
                    </select>
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

      {/* TAB 7: GALERI FOTO */}
      {activeTab === 'galeri' && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Galeri Dokumentasi & Foto Riset</h3>
              </div>
            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button type="button" size="sm" variant="outline" className="h-8 text-xs gap-1.5" disabled={uploading}>
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Unggah Foto</span>
              </Button>
            </div>
          </div>

          {formData.galeri.length === 0 ? (
            <div className="p-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center space-y-2 text-zinc-400">
              <ImageIcon className="w-8 h-8 mx-auto stroke-1" />
              <div className="text-xs">Belum ada foto yang diunggah ke galeri kawasan ini.</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.galeri.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-video bg-zinc-100 dark:bg-zinc-800"
                >
                  <img
                    src={getImageUrl(imgUrl)}
                    alt={`Galeri ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 z-20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 px-6 flex items-center justify-between">
        <div className="text-xs text-zinc-400 font-mono">
          Tab aktif: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{tabsConfig.find(t => t.id === activeTab)?.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/kst')}
            className="h-8 text-xs font-mono"
          >
            Batal
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="h-8 text-xs font-medium gap-1.5"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEdit ? 'Simpan Perubahan' : 'Buat Kawasan Sains'}</span>
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <AlertDialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">Ada Data yang Belum Diisi</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Beberapa data pendukung masih kosong:
              <ul className="list-disc list-inside mt-2 space-y-1">
                {missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
              <br />
              Apakah Anda yakin ingin tetap menyimpan KST ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmModalOpen(false)
                if (pendingPayload) {
                  executeSave(pendingPayload)
                }
              }}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              Tetap Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
