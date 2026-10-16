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
  Tag,
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Atom,
  Compass,
  Handshake,
  Globe,
  Phone,
  Mail,
  TreePine,
  ShieldCheck,
  Users,
  Building2,
  FlaskConical,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import {
  fetchFieldLabels,
  createFieldLabel,
  updateFieldLabel,
  deleteFieldLabel,
} from '@/lib/api'
import { toast } from 'sonner'

const ICON_MAP = {
  FileText,
  Atom,
  Compass,
  Handshake,
  Globe,
  Phone,
  Mail,
  TreePine,
  ShieldCheck,
  Users,
  Building2,
  FlaskConical,
  Award,
  Sparkles,
  Tag,
  Layers,
}

// Category colors removed (unified label list)


function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function LabelDataManagementView({ onLabelsChanged }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Modal form states
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nama: '',
    slug: '',
    tipe: 'text',
    placeholder: '',
    icon: 'FileText',
  })

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Load items from API
  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchFieldLabels()
      if (Array.isArray(data)) {
        setItems(data)
      } else {
        setItems([])
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat daftar label data lokasi')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  // Filtered by search (unified list without category)
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      return (
        !search.trim() ||
        it.nama?.toLowerCase().includes(search.toLowerCase()) ||
        it.slug?.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [items, search])

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedCategory])

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredItems.slice(start, start + itemsPerPage)
  }, [filteredItems, currentPage])

  // Handlers for Add / Edit
  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      nama: '',
      slug: '',
      tipe: 'text',
      placeholder: '',
        icon: 'FileText',
    })
    setFormOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setFormData({
      nama: item.nama || '',
      slug: item.slug || '',
      tipe: item.tipe || 'text',
      placeholder: item.placeholder || '',
      icon: item.icon || 'FileText',
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
      toast.error('Nama label wajib diisi')
      return
    }

    setSaving(true)
    try {
      const payload = {
        nama: formData.nama.trim(),
        slug: formData.slug.trim() || slugify(formData.nama),
        tipe: formData.tipe,
        placeholder: formData.placeholder?.trim() || null,
        icon: formData.icon || 'FileText',
      }

      if (editingItem) {
        await updateFieldLabel(editingItem.id, payload)
        toast.success(`Label "${payload.nama}" berhasil diperbarui`)
      } else {
        await createFieldLabel(payload)
        toast.success(`Label "${payload.nama}" berhasil ditambahkan`)
      }

      setFormOpen(false)
      loadItems()
      if (onLabelsChanged) onLabelsChanged()
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan label')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteFieldLabel(deleteTarget.id)
      toast.success(`Label "${deleteTarget.nama}" berhasil dihapus`)
      setDeleteTarget(null)
      loadItems()
      if (onLabelsChanged) onLabelsChanged()
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus label')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Master Data — Label Data Lokasi
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Definisi master label dan kolom data dinamis lokasi yang tersimpan pada tabel{' '}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
              label_data_lokasi
            </code>
            . Nilai data untuk tiap lokasi disimpan di{' '}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-mono text-[11px]">
              nilai_data_lokasi
            </code>
            .
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Label Baru</span>
        </Button>
      </div>

      {/* Filter Category & Search Bar */}
      <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cari label berdasarkan nama atau slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800"
            />
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400 self-center">
            Total:{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {filteredItems.length}
            </span>{' '}
            label
          </div>
        </div>
      </Card>

      {/* Grid Cards of Labels */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-xs">Memuat master label...</p>
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="py-16 text-center border rounded-xl border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
          <Layers className="w-10 h-10 mx-auto text-zinc-400 mb-2 opacity-50" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Tidak ada label data lokasi
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {search ? 'Coba ubah kata kunci pencarian Anda' : 'Klik tombol "Tambah Label Baru" untuk menambahkan master label'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {paginatedItems.map((item) => {
            const ItemIcon = ICON_MAP[item.icon] || FileText

            return (
              <Card
                key={item.id}
                className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {item.nama}
                        </h3>
                        <p className="text-[11px] font-mono text-zinc-400 truncate">
                          slug: {item.slug}
                        </p>
                      </div>
                    </div>
                  </div>

                  {item.placeholder && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-md border border-zinc-100 dark:border-zinc-800/60 italic">
                      "{item.placeholder}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0">
                      {item.kategori || 'umum'}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 font-normal">
                      tipe: {item.tipe || 'text'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(item)}
                      className="h-7 w-7 p-0 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400"
                      title="Edit label"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget(item)}
                      className="h-7 w-7 p-0 text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                      title="Hapus label"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-zinc-400">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 gap-1 border-zinc-200 dark:border-zinc-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 gap-1 border-zinc-200 dark:border-zinc-800"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog Form Add / Edit */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>{editingItem ? 'Edit Label Data Lokasi' : 'Tambah Label Data Lokasi Baru'}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nama Label *</Label>
              <Input
                type="text"
                placeholder="Contoh: Fokus Riset, Koleksi Unggulan..."
                value={formData.nama}
                onChange={handleNameChange}
                required
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Slug Identifier *</Label>
              <Input
                type="text"
                placeholder="fokus-riset"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))
                }
                required
                className="font-mono text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tipe Input</Label>
                <select
                  value={formData.tipe}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tipe: e.target.value }))}
                  className="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="text">Teks Singkat (text)</option>
                  <option value="list">Daftar Poin (list)</option>
                  <option value="textarea">Paragraf Panjang (textarea)</option>
                  <option value="url">Link / URL Web (url)</option>
                </select>
              </div>


            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Placeholder / Panduan Pengisian</Label>
              <Input
                type="text"
                placeholder="Contoh: Masukkan nama fokus riset atau laboratorium..."
                value={formData.placeholder}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, placeholder: e.target.value }))
                }
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Icon</Label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                className="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {Object.keys(ICON_MAP).map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                className="border-zinc-200 dark:border-zinc-800"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Label'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Hapus Label Data Lokasi?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500">
              Apakah Anda yakin ingin menghapus label{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">
                "{deleteTarget?.nama}"
              </strong>
              ? Data nilai yang sudah terhubung dengan label ini akan tetap tersimpan namun tidak lagi terikat pada master label ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Hapus</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
