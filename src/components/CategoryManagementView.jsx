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
  DialogFooter,
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
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Hash,
  Sparkles,
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
    label: 'Tipe Fasilitas',
    singular: 'Tipe Fasilitas',
    description: 'Jenis sarana dan prasarana riset yang disediakan oleh KST (contoh: Laboratorium, Pilot Plant, Observatorium).',
    icon: Cpu,
    color: 'blue',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    placeholder: 'Contoh: Cleanroom & Fabrikasi Mikro',
  },
  potensi_kolaborasi: {
    label: 'Potensi Kolaborasi',
    singular: 'Potensi Kolaborasi',
    description: 'Sektor dan mitra kerja sama strategis KST (contoh: Industri, Akademisi, Pemerintah, Komunitas).',
    icon: Handshake,
    color: 'amber',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    placeholder: 'Contoh: Startup & Inkubator Bisnis',
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
  onTypeChange,
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
    urutan: 0,
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
      urutan: items.length + 1,
      is_active: true,
    })
    setFormOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setFormData({
      nama: item.nama || '',
      slug: item.slug || '',
      urutan: item.urutan ?? 0,
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
        urutan: Number(formData.urutan) || 0,
        is_active: Boolean(formData.is_active),
      }

      if (editingItem) {
        await updateCategory(editingItem.id, payload)
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
      await updateCategory(item.id, { is_active: !item.is_active })
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
      await deleteCategory(deleteTarget.id)
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
      {/* Tab Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
            const TabIcon = cfg.icon
            const isActive = activeType === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTypeChange && onTypeChange(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
                <span>{cfg.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {key === activeType ? items.length : '•'}
                </span>
              </button>
            )
          })}
        </div>

        <Button
          onClick={handleOpenAdd}
          size="sm"
          className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Tambah {config.singular}
        </Button>
      </div>

      {/* Description & Search Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${config.badgeClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Daftar Master {config.label}
            </h2>
            <Badge variant="outline" className="text-[11px] font-mono">
              {filteredItems.length} Data
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl">
            {config.description}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder={`Cari ${config.singular.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
          />
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
                  <th className="py-3 px-4">NAMA</th>
                  <th className="py-3 px-4 font-mono">SLUG IDENTIFIER</th>
                  <th className="py-3 px-4 text-center font-mono w-24">URUTAN</th>
                  <th className="py-3 px-4 text-center w-28">STATUS</th>
                  <th className="py-3 px-4 text-right w-28">AKSI</th>
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
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors" />
                        <span>{item.nama}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                      {item.slug}
                    </td>
                    <td className="py-3 px-4 text-center text-zinc-500 dark:text-zinc-400 font-mono">
                      {item.urutan ?? 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        title="Klik untuk mengubah status"
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors cursor-pointer border"
                      >
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full">
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
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <span>{editingItem ? `Ubah ${config.singular}` : `Tambah ${config.singular} Baru`}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Nama {config.singular} <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                value={formData.nama}
                onChange={handleNameChange}
                placeholder={config.placeholder}
                className="text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Slug (URL Identifier)
              </Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="slug-otomatis"
                className="text-xs font-mono bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
              <p className="text-[10px] text-zinc-400">
                Dibuat otomatis dari nama jika dikosongkan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Urutan Tampilan
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.urutan}
                  onChange={(e) => setFormData((prev) => ({ ...prev, urutan: e.target.value }))}
                  className="text-xs font-mono bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900 h-4 w-4"
                  />
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    Aktifkan di Pilihan Form
                  </span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium"
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
            </DialogFooter>
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
