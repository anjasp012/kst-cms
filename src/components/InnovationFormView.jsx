import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import SimpleEditor from '@/components/ui/SimpleEditor'
import {
  Award,
  Loader2,
  Check,
  FileText,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  X,
  Plus,
  Building2,
  Tag
} from 'lucide-react'
import { uploadFile } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { toast } from 'sonner'

export default function InnovationFormView({ innovation, zones, personas, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    zone_id: '',
    persona_id: '',
    trl: 7,
    short_description: '',
    summary: '',
    impact: '',
    thumbnail_url: '',
    research_center: '',
    relevant_tags: [],
    implementation_potential: [],
  })
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (innovation) {
      setFormData({
        title: innovation.title || '',
        slug: innovation.slug || '',
        zone_id: innovation.zone_id || (zones[0]?.id || ''),
        persona_id: innovation.persona_id || (personas && personas[0]?.id) || '',
        trl: innovation.trl || 7,
        short_description: innovation.short_description || '',
        summary: innovation.summary || '',
        impact: innovation.impact || '',
        thumbnail_url: innovation.thumbnail_url || '',
        research_center: innovation.research_center || '',
        relevant_tags: innovation.relevant_tags || [],
        implementation_potential: innovation.implementation_potential || [],
      })
    } else {
      setFormData({
        title: '',
        slug: '',
        zone_id: zones[0]?.id || '',
        persona_id: (personas && personas[0]?.id) || '',
        trl: 7,
        short_description: '',
        summary: '',
        impact: '',
        thumbnail_url: '',
        research_center: '',
        relevant_tags: [],
        implementation_potential: [],
      })
    }
  }, [innovation, zones])

  const handleTitleChange = (val) => {
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: !innovation ? autoSlug : prev.slug
    }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const res = await uploadFile(file)
      setFormData(prev => ({ ...prev, thumbnail_url: res.relative_url || res.url }))
      toast.success('Gambar berhasil diunggah')
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah gambar')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.slug.trim()) return
    setLoading(true)
    try {
      await onSave({
        ...formData,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        short_description: formData.short_description.trim(),
        summary: formData.summary,
        impact: formData.impact,
        thumbnail_url: formData.thumbnail_url.trim() || null,
        research_center: formData.research_center.trim() || null,
        relevant_tags: formData.relevant_tags,
        implementation_potential: formData.implementation_potential,
        zone_id: formData.zone_id,
        persona_id: formData.persona_id,
        trl: parseInt(formData.trl),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onCancel} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {innovation ? 'Edit Data Penelitian BRIN' : 'Tambah Penelitian Baru'}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Katalog inovasi hasil riset yang akan ditampilkan pada layar meja interaktif.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Gambar Visual */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
              <ImageIcon className="w-4 h-4 text-zinc-400" />
              <span>Gambar Visual Penelitian</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-mono text-zinc-500">Thumbnail / Gambar Inovasi (Opsional)</Label>
              <div className="flex items-center gap-3">
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/image.jpg atau upload file"
                  className="h-10 font-mono flex-1"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingImage}
                  />
                  <Button type="button" variant="secondary" className="h-10 gap-2" disabled={uploadingImage}>
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload File
                  </Button>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Bisa masukkan URL langsung atau upload gambar baru dari komputermu.</p>

              {formData.thumbnail_url && (
                <div className="mt-3">
                  <img src={getImageUrl(formData.thumbnail_url)} alt="Preview" className="h-32 object-contain bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 p-1" onError={(e) => e.target.style.display = 'none'} onLoad={(e) => e.target.style.display = 'block'} />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Informasi Utama */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <span>Informasi Utama</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-mono text-zinc-500">Judul Penelitian / Inovasi *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Contoh: Sistem Irigasi Pintar IoT"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-mono text-zinc-500">Slug Identifier *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="sistem-irigasi-pintar-iot"
                  required
                  className="h-10 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-mono text-zinc-500">Zona Riset BRIN *</Label>
                <div className="relative">
                  <select
                    value={formData.zone_id}
                    onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                    className="w-full h-10 pl-3 pr-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 appearance-none"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>
                        Zona: {z.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-mono text-zinc-500">Modul Pengguna (Persona) *</Label>
                <div className="relative">
                  <select
                    value={formData.persona_id}
                    onChange={(e) => setFormData({ ...formData, persona_id: e.target.value })}
                    className="w-full h-10 pl-3 pr-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 appearance-none"
                    required
                  >
                    <option value="" disabled>Pilih Modul Pengguna...</option>
                    {personas?.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
                </div>
              </div>
            </div>

            {/* TRL slider + Research Center — side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-mono text-zinc-500">
                  TRL (Tingkat Kesiapan Teknologi)
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="9"
                    step="1"
                    value={formData.trl}
                    onChange={(e) => setFormData({ ...formData, trl: parseInt(e.target.value) })}
                    className="flex-1 accent-zinc-900 dark:accent-zinc-100 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                  />
                  <Badge variant="approved" className="font-mono px-2.5 py-1 text-xs shrink-0">
                    TRL {formData.trl}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-mono text-zinc-500">Pusat Riset BRIN</Label>
                <Input
                  value={formData.research_center}
                  onChange={(e) => setFormData({ ...formData, research_center: e.target.value })}
                  placeholder="Contoh: Pusat Riset Konversi dan Konservasi Energi"
                  className="h-10"
                />
              </div>
            </div>

            {/* Zona Relevan Tags — di bawah TRL + Pusat Riset */}
            <div className="space-y-1.5">
              <Label className="text-sm font-mono text-zinc-500">Zona Relevan (Tag)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.relevant_tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="gap-1.5 pr-1 text-xs font-mono">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        relevant_tags: prev.relevant_tags.filter((_, idx) => idx !== i)
                      }))}
                      className="ml-0.5 p-0.5 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value
                    if (val && !formData.relevant_tags.includes(val)) {
                      setFormData(prev => ({
                        ...prev,
                        relevant_tags: [...prev.relevant_tags, val]
                      }))
                    }
                  }}
                  className="w-full h-10 pl-3 pr-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 appearance-none"
                >
                  <option value="">+ Tambah zona relevan...</option>
                  {zones
                    .filter(z => !formData.relevant_tags.includes(z.name))
                    .map(z => (
                      <option key={z.id} value={z.name}>{z.name}</option>
                    ))
                  }
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
              </div>
            </div>
          </div>

          {/* Section 3: Deskripsi & Dampak */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>Deskripsi & Dampak Terapan</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-mono text-zinc-500">Deskripsi Singkat *</Label>
              <Input
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="Monitoring dan kendali irigasi otomatis untuk efisiensi air lahan pertanian..."
                required
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-mono text-zinc-500">Ringkasan *</Label>
                <SimpleEditor
                  value={formData.summary}
                  onChange={(val) => setFormData(prev => ({ ...prev, summary: val }))}
                  placeholder="Penjelasan mendalam mengenai mekanisme teknologi riset..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-mono text-zinc-500">Manfaat *</Label>
                <SimpleEditor
                  value={formData.impact}
                  onChange={(val) => setFormData(prev => ({ ...prev, impact: val }))}
                  placeholder="Dampak nyata: menghemat air 40%, meningkatkan produktivitas..."
                />
              </div>
            </div>
          </div>

          {/* Section 4: Relevansi & Potensi */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
              <Tag className="w-4 h-4 text-zinc-400" />
              <span>Potensi Implementasi</span>
            </div>

            {/* Potensi Implementasi — tag input ketik sendiri */}
            <div className="space-y-1.5">
              <Label className="text-sm font-mono text-zinc-500">Potensi Implementasi (Tag)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.implementation_potential.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="gap-1.5 pr-1 text-xs font-mono">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        implementation_potential: prev.implementation_potential.filter((_, idx) => idx !== i)
                      }))}
                      className="ml-0.5 p-0.5 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault()
                      if (!formData.implementation_potential.includes(tagInput.trim())) {
                        setFormData(prev => ({
                          ...prev,
                          implementation_potential: [...prev.implementation_potential, tagInput.trim()]
                        }))
                      }
                      setTagInput('')
                    }
                  }}
                  placeholder="Ketik lalu tekan Enter..."
                  className="h-10 flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 gap-1.5"
                  onClick={() => {
                    if (tagInput.trim() && !formData.implementation_potential.includes(tagInput.trim())) {
                      setFormData(prev => ({
                        ...prev,
                        implementation_potential: [...prev.implementation_potential, tagInput.trim()]
                      }))
                      setTagInput('')
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </Button>
              </div>
              <p className="text-xs text-zinc-500">Ketik potensi implementasi lalu tekan Enter atau klik Tambah.</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="h-10 px-4"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 px-6 font-medium gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {innovation ? 'Simpan Perubahan' : 'Tambah Penelitian'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
