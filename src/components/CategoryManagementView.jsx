import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  FlaskConical,
  Cpu,
  Handshake,
  Award,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Globe2,
} from 'lucide-react'
import {
  fetchCategoriesList,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/api'
import { toast } from 'sonner'

const TYPE_CONFIG = {
  tema_riset: {
    label: 'Tema Riset',
    singular: 'Tema Riset',
    description: 'Kategori fokus bidang riset dan keilmuan yang dikembangkan di KST (contoh: Energi & Material, Maritim, Kesehatan).',
    icon: FlaskConical,
    color: 'emerald',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    placeholder: 'Contoh: Kecerdasan Buatan & Robotika',
  },
  tipe_fasilitas: {
    label: 'Fasilitas',
    singular: 'Fasilitas',
    description: 'Jenis sarana dan prasarana riset yang disediakan oleh KST (contoh: Laboratorium, Pilot Plant, Observatorium).',
    icon: Cpu,
    color: 'blue',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    placeholder: 'Contoh: Cleanroom & Fabrikasi Mikro',
  },
  dampak: {
    label: 'Dampak',
    singular: 'Dampak',
    description: 'Pilar dampak strategis kawasan KST terhadap ilmu pengetahuan, daya saing industri, dan kesejahteraan masyarakat.',
    icon: Award,
    color: 'amber',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    placeholder: 'Contoh: Penguatan Iptek & Inovasi Daerah',
  },
  potensi_kolaborasi: {
    label: 'Kolaborasi',
    singular: 'Kolaborasi',
    description: 'Sektor dan ekosistem mitra kerja sama strategis kawasan KST (contoh: Industri, Akademisi, Pemerintah, Komunitas).',
    icon: Handshake,
    color: 'purple',
    badgeClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    placeholder: 'Contoh: Lembaga Riset Internasional',
  },
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function CategoryManagementView({
  activeType = 'tema_riset',
  onCategoriesChanged,
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal form states
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nama: '',
    slug: '',
    deskripsi: '',
    is_active: true,
  })

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const config = TYPE_CONFIG[activeType] || TYPE_CONFIG.tema_riset
  const Icon = config.icon

  // Load items from API
  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchCategoriesList(activeType, true)
      if (Array.isArray(data)) {
        setItems(data)
      } else {
        setItems([])
      }
    } catch (err) {
      toast.error(err.message || `Gagal memuat data ${config.label}`)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [activeType, config.label])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  // Filtered by search
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (it) =>
        it.nama?.toLowerCase().includes(q) ||
        it.slug?.toLowerCase().includes(q)
    )
  }, [items, search])

  // Handlers for Add / Edit
  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      nama: '',
      slug: '',
      deskripsi: '',
      is_active: true,
    })
    setFormOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setFormData({
      nama: item.nama || '',
      slug: item.slug || '',
      deskripsi: item.deskripsi || '',
      is_active: Boolean(item.is_active),
    })
    setFormOpen(true)
  }

  const handleNameChange = (e) => {
    const val = e.target.value
    setFormData((prev) => ({
      ...prev,
      nama: val,
      slug: editingItem ? prev.slug : slugify(val),
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.nama.trim()) {
      toast.error('Nama wajib diisi')
      return
    }

    setSaving(true)
    try {
      const payload = {
        tipe: activeType,
        nama: formData.nama.trim(),
        slug: formData.slug.trim() || slugify(formData.nama),
        deskripsi: formData.deskripsi?.trim() || null,
        is_active: Boolean(formData.is_active),
      }

      if (editingItem) {
        await updateCategory(editingItem.id, payload, activeType)
        toast.success(`${config.singular} berhasil diperbarui`)
      } else {
        await createCategory(payload)
        toast.success(`${config.singular} baru berhasil ditambahkan`)
      }

      setFormOpen(false)
      await loadItems()
      if (onCategoriesChanged) onCategoriesChanged()
    } catch (err) {
      toast.error(err.message || `Gagal menyimpan ${config.singular}`)
    } finally {
      setSaving(false)
    }
  }

  // Quick toggle status active/inactive
  const handleToggleActive = async (item) => {
    try {
      await updateCategory(item.id, { is_active: !item.is_active }, activeType)
      toast.success(
        `Status ${item.nama} diubah ke ${!item.is_active ? 'Aktif' : 'Nonaktif'}`
      )
      await loadItems()
      if (onCategoriesChanged) onCategoriesChanged()
    } catch (err) {
      toast.error('Gagal memperbarui status')
    }
  }

  // Handlers for Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCategory(deleteTarget.id, activeType)
      toast.success(`${deleteTarget.nama} berhasil dihapus`)
      setDeleteTarget(null)
      await loadItems()
      if (onCategoriesChanged) onCategoriesChanged()
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus item')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Description & Search / Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center">
              Master Data &mdash; {config.label}
            </h1>
            <Badge variant="outline" className="text-[11px] font-mono">
              {filteredItems.length} Data
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder={`Cari ${config.singular.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            />
          </div>

          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="h-9 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium shadow-sm whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Tambah {config.singular}
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            <span className="text-xs font-mono">Memuat data {config.label}...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {search ? 'Tidak ada data yang cocok dengan pencarian' : `Belum ada data ${config.label}`}
            </div>
            <p className="text-[11px] text-zinc-400">
              Klik tombol &quot;Tambah {config.singular}&quot; untuk menambahkan data baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-500 font-mono">
                  <th className="py-3 px-4 w-12 text-center">NO</th>
                  <th className="py-3 px-4 w-48">NAMA</th>
                  <th className="py-3 px-4 min-w-[200px]">DESKRIPSI SINGKAT</th>
                  <th className="py-3 px-4 font-mono w-36">SLUG</th>
                  <th className="py-3 px-4 text-center w-28">STATUS</th>
                  <th className="py-3 px-4 text-right w-24">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {filteredItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors group"
                  >
                    <td className="py-3 px-4 text-center text-zinc-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors flex-shrink-0" />
                        <span className="font-semibold">{item.nama}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      {item.deskripsi ? (
                        <span className="line-clamp-2 leading-relaxed">{item.deskripsi}</span>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600 italic text-[11px]">- Belum ada deskripsi -</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                      {item.slug}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        title="Klik untuk mengubah status"
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                      >
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" />
                            Nonaktif
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                          className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(item)}
                          title="Hapus"
                          className="h-7 w-7 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Dialog Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl p-0 overflow-hidden">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 shadow-sm flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingItem ? `Edit ${config.singular}` : `Tambah ${config.singular} Baru`}
                </DialogTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {config.description}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Nama {config.singular} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  autoFocus
                  value={formData.nama}
                  onChange={handleNameChange}
                  placeholder={config.placeholder}
                  className="h-9 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Deskripsi Singkat <span className="text-zinc-400 font-normal">(Opsional)</span>
                </Label>
                <textarea
                  rows={2}
                  value={formData.deskripsi || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deskripsi: e.target.value }))}
                  placeholder={`Penjelasan ringkas mengenai ${config.singular.toLowerCase()} ini...`}
                  className="w-full p-2.5 rounded-md text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Slug Identifier <span className="text-zinc-400 font-normal font-mono text-[10px]">(Otomatis)</span>
                </Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="slug-otomatis"
                  className="h-9 text-xs font-mono bg-zinc-50/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    Status Aktif
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Tampilkan sebagai opsi pilihan di formulir KST
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="p-4 px-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormOpen(false)}
                className="text-xs h-9 border-zinc-200 dark:border-zinc-800"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="h-9 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium shadow-sm px-4"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Hapus {config.singular}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Apakah Anda yakin ingin menghapus data &quot;<strong>{deleteTarget?.nama}</strong>&quot;?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium"
            >
              {deleting ? 'Menghapus...' : 'Hapus Sekarang'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

