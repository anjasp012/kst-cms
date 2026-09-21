import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  ImageIcon
} from 'lucide-react'
import { uploadFile } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { toast } from 'sonner'
import CoordinatePicker from '@/components/ui/CoordinatePicker'

export default function KSTFormModal({ open, kst, onSave, onClose }) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeFormTab, setActiveFormTab] = useState('umum')

  const [formData, setFormData] = useState({
    nama: '',
    slug: '',
    wilayah: 'Jawa',
    kota_provinsi: '',
    pengelola: 'BRIN',
    status: 'Aktif',
    tahun_operasi: 2021,
    thumbnail_url: '',
    latitude: '',
    longitude: '',
    deskripsi_profil: '',
    peran_kawasan: '',
    fokus_utama_raw: 'Pangan, Energi, Laut, Teknologi Digital',
    terhubung_dengan: 'Peneliti, industri, pemerintah, komunitas, dan mitra pendidikan.',
    fasilitas: [],
    riset: [],
    dampak: [],
    potensi_kolaborasi_raw: 'Industri, Akademisi, Pemerintah, Komunitas',
    galeri: [],
    is_active: true
  })

  useEffect(() => {
    if (kst) {
      setFormData({
        nama: kst.nama || '',
        slug: kst.slug || '',
        wilayah: kst.wilayah || 'Jawa',
        kota_provinsi: kst.kota_provinsi || '',
        pengelola: kst.pengelola || 'BRIN',
        status: kst.status || 'Aktif',
        tahun_operasi: kst.tahun_operasi || 2021,
        thumbnail_url: kst.thumbnail_url || '',
        latitude: kst.latitude !== null && kst.latitude !== undefined ? String(kst.latitude) : '',
        longitude: kst.longitude !== null && kst.longitude !== undefined ? String(kst.longitude) : '',
        deskripsi_profil: kst.deskripsi_profil || '',
        peran_kawasan: kst.peran_kawasan || '',
        fokus_utama_raw: (kst.fokus_utama || []).join(', '),
        terhubung_dengan: kst.terhubung_dengan || '',
        fasilitas: kst.fasilitas || [],
        riset: kst.riset || [],
        dampak: kst.dampak || [],
        potensi_kolaborasi_raw: (kst.potensi_kolaborasi || []).join(', '),
        galeri: kst.galeri || [],
        is_active: kst.is_active ?? true
      })
    } else {
      setFormData({
        nama: '',
        slug: '',
        wilayah: 'Jawa',
        kota_provinsi: '',
        pengelola: 'BRIN',
        status: 'Aktif',
        tahun_operasi: 2021,
        thumbnail_url: '',
        latitude: '',
        longitude: '',
        deskripsi_profil: '',
        peran_kawasan: 'Mendukung pengembangan riset, inovasi, dan penerapan teknologi di wilayah ini.',
        fokus_utama_raw: 'Pangan, Energi, Laut, Teknologi Digital',
        terhubung_dengan: 'Peneliti, industri, pemerintah, komunitas, dan mitra pendidikan.',
        fasilitas: [],
        riset: [],
        dampak: [],
        potensi_kolaborasi_raw: 'Industri, Akademisi, Pemerintah, Komunitas',
        galeri: [],
        is_active: true
      })
    }
  }, [kst, open])

  const autoSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadFile(file)
      setFormData(prev => ({ ...prev, thumbnail_url: res.relative_url || res.url }))
      toast.success('Foto sampul berhasil diunggah')
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah foto')
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const newUrls = []
      for (const file of files) {
        const res = await uploadFile(file)
        newUrls.push(res.relative_url || res.url)
      }
      setFormData(prev => ({ ...prev, galeri: [...prev.galeri, ...newUrls] }))
      toast.success(`${newUrls.length} foto berhasil ditambahkan ke galeri`)
    } catch (err) {
      toast.error(err.message || 'Gagal upload foto galeri')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nama.trim() || !formData.slug.trim()) {
      toast.error('Nama dan Slug wajib diisi')
      return
    }

    setLoading(true)
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
        fasilitas: formData.fasilitas,
        riset: formData.riset,
        dampak: formData.dampak,
        potensi_kolaborasi: formData.potensi_kolaborasi_raw.split(',').map(s => s.trim()).filter(Boolean),
        galeri: formData.galeri,
        is_active: formData.is_active
      }

      await onSave(payload)
      toast.success(kst ? 'Data KST berhasil diperbarui' : 'KST baru berhasil ditambahkan')
      onClose()
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data KST')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-5 border-b border-zinc-200 dark:border-zinc-800">
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-500" />
              <span>{kst ? 'Edit Kawasan Sains dan Teknologi' : 'Tambah KST Baru'}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-2 px-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
            <button
              type="button"
              onClick={() => setActiveFormTab('umum')}
              className={`px-3 py-2.5 font-medium border-b-2 transition-all ${
                activeFormTab === 'umum'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              1. Informasi & Spasial
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('profil')}
              className={`px-3 py-2.5 font-medium border-b-2 transition-all ${
                activeFormTab === 'profil'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              2. Profil & Fokus
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('galeri')}
              className={`px-3 py-2.5 font-medium border-b-2 transition-all ${
                activeFormTab === 'galeri'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              3. Galeri Foto
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* TAB 1: INFORMASI UMUM & KOORDINAT POSTGIS */}
            {activeFormTab === 'umum' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Nama KST *</Label>
                    <Input
                      value={formData.nama}
                      onChange={(e) => {
                        const name = e.target.value
                        setFormData({
                          ...formData,
                          nama: name,
                          slug: !kst ? autoSlug(name) : formData.slug
                        })
                      }}
                      placeholder="Contoh: KST Jawa Barat"
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Slug URL (Identifier Unik) *</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="kst-jawa-barat"
                      required
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Wilayah *</Label>
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
                    <Label className="text-xs font-medium">Kota / Provinsi *</Label>
                    <Input
                      value={formData.kota_provinsi}
                      onChange={(e) => setFormData({ ...formData, kota_provinsi: e.target.value })}
                      placeholder="Bandung, Jawa Barat"
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Tahun Operasi</Label>
                    <Input
                      type="number"
                      value={formData.tahun_operasi}
                      onChange={(e) => setFormData({ ...formData, tahun_operasi: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* KOORDINAT INTERAKTIF POSTGIS */}
                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
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

                {/* THUMBNAIL UPLOAD */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Foto Sampul / Thumbnail</Label>
                  <div className="flex items-center gap-3">
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
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <Button type="button" variant="secondary" className="h-9 text-xs gap-1.5" disabled={uploading}>
                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        Upload
                      </Button>
                    </div>
                  </div>
                  {formData.thumbnail_url && (
                    <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <img 
                        src={getImageUrl(formData.thumbnail_url)} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PROFIL & FOKUS */}
            {activeFormTab === 'profil' && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Deskripsi Profil Kawasan</Label>
                  <textarea
                    value={formData.deskripsi_profil}
                    onChange={(e) => setFormData({ ...formData, deskripsi_profil: e.target.value })}
                    placeholder="Tuliskan gambaran umum dan peran strategis KST ini..."
                    rows={3}
                    className="w-full p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Peran Kawasan</Label>
                  <textarea
                    value={formData.peran_kawasan}
                    onChange={(e) => setFormData({ ...formData, peran_kawasan: e.target.value })}
                    placeholder="Mendukung pengembangan riset, inovasi, dan penerapan teknologi..."
                    rows={2}
                    className="w-full p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Fokus Utama (Pisahkan dengan koma)</Label>
                  <Input
                    value={formData.fokus_utama_raw}
                    onChange={(e) => setFormData({ ...formData, fokus_utama_raw: e.target.value })}
                    placeholder="Pangan, Energi, Laut, Teknologi Digital"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Terhubung dengan</Label>
                  <Input
                    value={formData.terhubung_dengan}
                    onChange={(e) => setFormData({ ...formData, terhubung_dengan: e.target.value })}
                    placeholder="Peneliti, industri, pemerintah, komunitas, dan mitra pendidikan."
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Potensi Kolaborasi (Pisahkan dengan koma)</Label>
                  <Input
                    value={formData.potensi_kolaborasi_raw}
                    onChange={(e) => setFormData({ ...formData, potensi_kolaborasi_raw: e.target.value })}
                    placeholder="Industri, Akademisi, Pemerintah, Komunitas"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: GALERI FOTO */}
            {activeFormTab === 'galeri' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">Foto Galeri Dokumentasi</Label>
                    <p className="text-[11px] text-zinc-500">Unggah dokumentasi laboratorium atau kegiatan riset.</p>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <Button type="button" variant="outline" className="h-8 text-xs gap-1.5" disabled={uploading}>
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Foto
                    </Button>
                  </div>
                </div>

                {formData.galeri.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {formData.galeri.map((url, i) => (
                      <div key={i} className="group relative h-24 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        <img 
                          src={getImageUrl(url)} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            galeri: prev.galeri.filter((_, idx) => idx !== i)
                          }))}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    Belum ada foto galeri diunggah.
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
              />
              <Label htmlFor="is_active" className="text-xs cursor-pointer">
                Status Aktif
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-8 text-xs">
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="h-8 text-xs">
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

