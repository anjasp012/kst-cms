import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
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
  X,
  Sparkles, 
  Award, 
  Users, 
  FlaskConical, 
  Layers, 
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle2,
  Save,
  Compass,
  FileText
} from 'lucide-react'
import { uploadFile, fetchKSTDetail, createKST, updateKST } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { toast } from 'sonner'

export default function KSTFormPage({ onSaveSuccess }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [loadingInitial, setLoadingInitial] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('spasial')

  const [formData, setFormData] = useState({
    nama: '',
    slug: '',
    wilayah: 'Jawa',
    kota_provinsi: '',
    pengelola: 'BRIN',
    status: 'Aktif',
    tahun_operasi: 2021,
    thumbnail_url: '',
    latitude: -6.917464,
    longitude: 107.619122,

    // 1. Profil
    deskripsi_profil: '',
    peran_kawasan: '',
    fokus_utama_raw: 'Pangan, Energi, Laut, Teknologi Digital',
    terhubung_dengan: 'Peneliti, industri, pemerintah, komunitas, dan mitra pendidikan.',

    // 2. Fasilitas (List of { nama, tipe, deskripsi })
    fasilitas: [
      { nama: 'Laboratorium Material', tipe: 'Laboratorium', deskripsi: 'Pengujian karakteristik material dan validasi performa. Fasilitas ini mendukung kegiatan riset, pengujian, dan pengembangan solusi berbasis kebutuhan wilayah.' },
      { nama: 'Observatorium Lingkungan', tipe: 'Observatorium', deskripsi: 'Pemantauan kondisi lingkungan dan pengumpulan data lapangan. Fasilitas ini mendukung kegiatan riset, pengujian, dan pengembangan solusi berbasis kebutuhan wilayah.' },
      { nama: 'Pilot Plant Pangan', tipe: 'Pilot Plant', deskripsi: 'Pengembangan prototipe dan uji proses skala awal. Fasilitas ini mendukung kegiatan riset, pengujian, dan pengembangan solusi berbasis kebutuhan wilayah.' },
      { nama: 'Pusat Analisis Data', tipe: 'Pusat Analisis Data', deskripsi: 'Analisis, visualisasi, dan integrasi data riset. Fasilitas ini mendukung kegiatan riset, pengujian, dan pengembangan solusi berbasis kebutuhan wilayah.' }
    ],

    // 3. Riset (List of { judul, bidang, deskripsi })
    riset: [
      { judul: '1. Pangan', bidang: 'Pangan & Pertanian', deskripsi: 'Riset untuk mendukung ketahanan pangan dan inovasi lokal.' },
      { judul: '2. Energi', bidang: 'Energi & Material', deskripsi: 'Riset energi bersih, efisiensi, dan pemanfaatan sumber daya.' },
      { judul: '3. Laut', bidang: 'Maritim', deskripsi: 'Riset untuk memahami dan memanfaatkan potensi kelautan.' },
      { judul: '4. Antariksa', bidang: 'Antariksa', deskripsi: 'Penginderaan jauh, data satelit, dan dukungan pemantauan.' },
      { judul: '5. Kesehatan', bidang: 'Kesehatan', deskripsi: 'Riset kesehatan masyarakat, bioteknologi, dan deteksi.' },
      { judul: '6. Material Maju', bidang: 'Material Maju', deskripsi: 'Pengembangan material, manufaktur, dan teknologi industri.' }
    ],
    manfaat_riset: 'Riset ini mendukung pengambilan keputusan, pengembangan teknologi, dan pemecahan masalah di wilayah terkait.',
    fasilitas_terhubung: 'Laboratorium Material, Pilot Plant Pangan, Pusat Analisis Data, Observatorium Lingkungan.',

    // 4. Dampak
    dampak: [
      { judul: 'Penguatan Iptek', keterangan: 'Mendukung pengembangan ilmu pengetahuan dan teknologi berbasis kebutuhan nyata.' },
      { judul: 'Pemerataan Riset', keterangan: 'Membawa akses riset dan fasilitas teknologi lebih dekat ke berbagai wilayah.' },
      { judul: 'Kolaborasi Daerah', keterangan: 'Mendorong kerja sama antara peneliti, pemerintah daerah, industri, dan masyarakat.' },
      { judul: 'Daya Saing Wilayah', keterangan: 'Mendukung lahirnya solusi dan inovasi yang relevan dengan potensi lokal.' }
    ],
    highlight_fasilitas: 4,
    highlight_bidang_riset: 6,
    highlight_program_kolaborasi: 12,
    highlight_mitra: 32,

    // 5. Kolaborasi
    potensi_kolaborasi_raw: 'Industri, Akademisi, Pemerintah, Komunitas',
    daftar_kolaborasi: [
      { mitra: 'Institut Teknologi Bandung (ITB)', tipe: 'Akademisi', deskripsi: 'Joint-research bidang mikroelektronika dan material cerdas.' },
      { mitra: 'Dinas ESDM Provinsi Jawa Barat', tipe: 'Pemerintah', deskripsi: 'Program implementasi bauran energi baru terbarukan.' },
      { mitra: 'PT Bio Farma (Persero)', tipe: 'Industri', deskripsi: 'Kemitraan pengembangan vaksin dan terapi biologis.' }
    ],

    // 6. Galeri Foto
    galeri: [],
    is_active: true
  })

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
          fokus_utama_raw: (item.fokus_utama || []).join(', ') || 'Pangan, Energi, Laut, Teknologi Digital',
          terhubung_dengan: item.terhubung_dengan || 'Peneliti, industri, pemerintah, komunitas, dan mitra pendidikan.',

          fasilitas: Array.isArray(item.fasilitas) && item.fasilitas.length > 0 ? item.fasilitas : [
            { nama: 'Laboratorium Material', tipe: 'Laboratorium', deskripsi: 'Pengujian karakteristik material dan validasi performa.' }
          ],

          riset: Array.isArray(item.riset) && item.riset.length > 0 ? item.riset : [
            { judul: '1. Pangan', bidang: 'Pangan & Pertanian', deskripsi: 'Riset untuk mendukung ketahanan pangan dan inovasi lokal.' }
          ],
          manfaat_riset: item.manfaat_riset || 'Riset ini mendukung pengambilan keputusan, pengembangan teknologi, dan pemecahan masalah di wilayah terkait.',
          fasilitas_terhubung: item.fasilitas_terhubung || 'Laboratorium Material, Pilot Plant Pangan, Pusat Analisis Data, Observatorium Lingkungan.',

          dampak: Array.isArray(item.dampak) && item.dampak.length > 0 ? item.dampak : [
            { judul: 'Penguatan Iptek', keterangan: 'Mendukung pengembangan ilmu pengetahuan dan teknologi berbasis kebutuhan nyata.' },
            { judul: 'Pemerataan Riset', keterangan: 'Membawa akses riset dan fasilitas teknologi lebih dekat ke berbagai wilayah.' },
            { judul: 'Kolaborasi Daerah', keterangan: 'Mendorong kerja sama antara peneliti, pemerintah daerah, industri, dan masyarakat.' },
            { judul: 'Daya Saing Wilayah', keterangan: 'Mendukung lahirnya solusi dan inovasi yang relevan dengan potensi lokal.' }
          ],
          highlight_fasilitas: item.highlight_fasilitas || (item.fasilitas?.length || 4),
          highlight_bidang_riset: item.highlight_bidang_riset || (item.riset?.length || 6),
          highlight_program_kolaborasi: item.highlight_program_kolaborasi || 12,
          highlight_mitra: item.highlight_mitra || 32,

          potensi_kolaborasi_raw: (item.potensi_kolaborasi || []).join(', ') || 'Industri, Akademisi, Pemerintah, Komunitas',
          daftar_kolaborasi: Array.isArray(item.daftar_kolaborasi) && item.daftar_kolaborasi.length > 0 ? item.daftar_kolaborasi : [],
          galeri: Array.isArray(item.galeri) ? item.galeri : [],
          is_active: item.is_active ?? true
        })
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
    setFormData(prev => ({
      ...prev,
      fasilitas: [...prev.fasilitas, { nama: '', tipe: 'Laboratorium', deskripsi: '' }]
    }))
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
      fasilitas: prev.fasilitas.filter((_, i) => i !== index)
    }))
  }

  // Research handlers
  const addResearch = () => {
    const nextNum = formData.riset.length + 1
    setFormData(prev => ({
      ...prev,
      riset: [...prev.riset, { judul: `${nextNum}. `, bidang: 'Pangan & Pertanian', deskripsi: '' }]
    }))
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
      riset: prev.riset.filter((_, i) => i !== index)
    }))
  }

  // Impact handlers
  const updateImpact = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.dampak]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, dampak: updated }
    })
  }

  // Collaboration partner handlers
  const addPartnerCollab = () => {
    setFormData(prev => ({
      ...prev,
      daftar_kolaborasi: [...prev.daftar_kolaborasi, { mitra: '', tipe: 'Industri', deskripsi: '' }]
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
      daftar_kolaborasi: prev.daftar_kolaborasi.filter((_, i) => i !== index)
    }))
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nama.trim() || !formData.slug.trim()) {
      toast.error('Nama dan Slug KST wajib diisi')
      return
    }

    setSaving(true)
    try {
      const payload = {
        nama: formData.nama.trim(),
        slug: formData.slug.trim(),
        wilayah: formData.wilayah,
        kota_provinsi: formData.kota_provinsi.trim(),
        pengelola: formData.pengelola.trim() || 'BRIN',
        status: formData.status,
        tahun_operasi: parseInt(formData.tahun_operasi, 10) || 2021,
        thumbnail_url: formData.thumbnail_url.trim() || null,
        latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,

        deskripsi_profil: formData.deskripsi_profil.trim() || null,
        peran_kawasan: formData.peran_kawasan.trim() || null,
        fokus_utama: formData.fokus_utama_raw.split(',').map(s => s.trim()).filter(Boolean),
        terhubung_dengan: formData.terhubung_dengan.trim() || null,

        fasilitas: formData.fasilitas.filter(f => f.nama.trim()),
        riset: formData.riset.filter(r => r.judul.trim()),
        dampak: formData.dampak,
        potensi_kolaborasi: formData.potensi_kolaborasi_raw.split(',').map(s => s.trim()).filter(Boolean),
        daftar_kolaborasi: formData.daftar_kolaborasi.filter(d => d.mitra.trim()),
        galeri: formData.galeri,
        is_active: formData.is_active
      }

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

  const tabsConfig = [
    { id: 'spasial', label: '1. Spasial & Info Kawasan', icon: Compass },
    { id: 'profil', label: '2. Profil & Fokus', icon: Building2 },
    { id: 'fasilitas', label: '3. Fasilitas Riset', icon: FlaskConical, badge: formData.fasilitas.length },
    { id: 'riset', label: '4. Bidang Riset', icon: Sparkles, badge: formData.riset.length },
    { id: 'dampak', label: '5. Dampak & Kolaborasi', icon: Award },
    { id: 'galeri', label: '6. Galeri Foto', icon: ImageIcon, badge: formData.galeri.length },
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
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/kst')}
            className="h-8 text-xs gap-1.5 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </Button>

          <div>
            <div className="text-xs text-zinc-400 font-mono leading-none">
              {isEdit ? 'Ubah Data Kawasan' : 'Buat Kawasan Baru'}
            </div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
              {formData.nama ? formData.nama : (isEdit ? 'Edit KST' : 'Tambah Kawasan Sains (KST)')}
            </h1>
          </div>
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
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">1. Identitas & Titik Koordinat Spasial</h3>
            <p className="text-xs text-zinc-500">Informasi administratif kawasan dan penetapan titik koordinat PostGIS untuk Peta Interaktif.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama KST *</Label>
              <Input
                value={formData.nama}
                onChange={handleNamaChange}
                placeholder="KST Jawa Barat"
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Slug URL *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="kst-jawa-barat"
                required
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Wilayah</Label>
              <select
                value={formData.wilayah}
                onChange={(e) => setFormData({ ...formData, wilayah: e.target.value })}
                className="w-full h-9 px-3 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="Sumatera">Sumatera</option>
                <option value="Jawa">Jawa</option>
                <option value="Kalimantan">Kalimantan</option>
                <option value="Sulawesi">Sulawesi</option>
                <option value="Nusa Tenggara">Nusa Tenggara</option>
                <option value="Maluku & Papua">Maluku & Papua</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Kota / Kabupaten & Provinsi *</Label>
              <Input
                value={formData.kota_provinsi}
                onChange={(e) => setFormData({ ...formData, kota_provinsi: e.target.value })}
                placeholder="Bandung, Jawa Barat"
                required
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

          {/* FOTO SAMPUL / THUMBNAIL */}
          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
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
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">2. Tab Profil (Wonderful BRIN)</h3>
            <p className="text-xs text-zinc-500">Isi narasi profil, peran kawasan, tema fokus utama, serta mitra yang terhubung.</p>
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

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Fokus Utama (Pisahkan dengan koma)</Label>
              <Input
                value={formData.fokus_utama_raw}
                onChange={(e) => setFormData({ ...formData, fokus_utama_raw: e.target.value })}
                placeholder="Pangan, Energi, Laut, Teknologi Digital, Kesehatan, Material Maju"
                className="h-9 text-xs"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.fokus_utama_raw.split(',').map(s => s.trim()).filter(Boolean).map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[11px] font-mono">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Terhubung Dengan</Label>
              <Input
                value={formData.terhubung_dengan}
                onChange={(e) => setFormData({ ...formData, terhubung_dengan: e.target.value })}
                placeholder="Peneliti, industri, pemerintah, komunitas, dan mitra pendidikan."
                className="h-9 text-xs"
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
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">3. Fasilitas Unggulan Kawasan</h3>
              <p className="text-xs text-zinc-500">Kartu fasilitas yang tampil pada Tab Fasilitas di layar interaktif (Laboratorium, Pilot Plant, dll.).</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.fasilitas.map((f, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400">Fasilitas #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeFacility(idx)}
                    className="text-zinc-400 hover:text-rose-600 transition-colors"
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
                    <option value="Laboratorium">Laboratorium</option>
                    <option value="Pilot Plant">Pilot Plant</option>
                    <option value="Observatorium">Observatorium</option>
                    <option value="Pusat Analisis Data">Pusat Analisis Data</option>
                    <option value="Akses Data & Koleksi">Akses Data & Koleksi</option>
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
        </Card>
      )}

      {/* TAB 4: BIDANG RISET */}
      {activeTab === 'riset' && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">4. Bidang Riset & Inovasi</h3>
              <p className="text-xs text-zinc-500">6 kartu fokus riset yang tampil pada Tab Riset di peta (Pangan, Energi, Laut, dll.).</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addResearch}
              className="h-8 text-xs gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Bidang Riset</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.riset.map((r, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400">Bidang #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeResearch(idx)}
                    className="text-zinc-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Judul / Nomor</Label>
                    <Input
                      value={r.judul}
                      onChange={(e) => updateResearch(idx, 'judul', e.target.value)}
                      placeholder="1. Pangan"
                      className="h-8 text-xs bg-white dark:bg-zinc-900 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Klaster Bidang</Label>
                    <Input
                      value={r.bidang}
                      onChange={(e) => updateResearch(idx, 'bidang', e.target.value)}
                      placeholder="Pangan & Pertanian"
                      className="h-8 text-xs bg-white dark:bg-zinc-900"
                    />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Manfaat Riset (Kotak Bawah)</Label>
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

      {/* TAB 5: DAMPAK & KOLABORASI */}
      {activeTab === 'dampak' && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-6">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">5. Dampak Strategis & Data Highlight</h3>
            <p className="text-xs text-zinc-500">4 pilar dampak (Iptek, Pemerataan, Kolaborasi, Daya Saing) dan angka statistik highlight kawasan.</p>
          </div>

          {/* 4 Pilar Dampak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.dampak.map((d, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2"
              >
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                    Pilar #{idx + 1}: Judul
                  </Label>
                  <Input
                    value={d.judul}
                    onChange={(e) => updateImpact(idx, 'judul', e.target.value)}
                    className="h-8 text-xs bg-white dark:bg-zinc-900 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Uraian Dampak</Label>
                  <textarea
                    rows={2}
                    value={d.keterangan}
                    onChange={(e) => updateImpact(idx, 'keterangan', e.target.value)}
                    className="w-full p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

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
                <div className="text-[11px] text-zinc-400 font-mono">Bidang Riset</div>
                <Input
                  type="number"
                  value={formData.highlight_bidang_riset}
                  onChange={(e) => setFormData({ ...formData, highlight_bidang_riset: Number(e.target.value) })}
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

          {/* Mitra Kolaborasi Terhubung */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Daftar Mitra Kolaborasi (Industri, Akademisi, Pemerintah)</Label>
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
                    <option value="Akademisi">Akademisi</option>
                    <option value="Industri">Industri</option>
                    <option value="Pemerintah">Pemerintah</option>
                    <option value="Komunitas">Komunitas</option>
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
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* TAB 6: GALERI FOTO */}
      {activeTab === 'galeri' && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">6. Galeri Dokumentasi & Foto Riset</h3>
              <p className="text-xs text-zinc-500">Unggah kumpulan foto kegiatan riset, gedung laboratorium, dan fasilitas kawasan.</p>
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
    </form>
  )
}
