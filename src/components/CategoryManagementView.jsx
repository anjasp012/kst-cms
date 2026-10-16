import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Globe2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  fetchCategoriesList,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/api'
import { toast } from 'sonner'

const TYPE_CONFIG = {
  jenis_kawasan: {
    label: 'Jenis Kawasan',
    singular: 'Jenis Kawasan',
    description: 'Kategori jenis kawasan dan entitas (contoh: Kawasan Sains dan Teknologi (KST), BRIDA, Kebun Raya).',
    icon: Building2,
    color: 'blue',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    placeholder: 'Contoh: Kawasan Sains (KST)',
  },
  fokus_riset: {
    label: 'Fokus Riset',
    singular: 'Fokus Riset',
    description: 'Kategori fokus bidang riset dan keilmuan yang dikembangkan di kawasan (contoh: Energi & Material, Maritim, Kesehatan).',
    icon: FlaskConical,
    color: 'emerald',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    placeholder: 'Contoh: Kecerdasan Buatan & Robotika',
  },
  tema_riset: {
    label: 'Fokus Riset',
    singular: 'Fokus Riset',
    description: 'Kategori fokus bidang riset dan keilmuan yang dikembangkan di kawasan (contoh: Energi & Material, Maritim, Kesehatan).',
    icon: FlaskConical,
    color: 'emerald',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    placeholder: 'Contoh: Kecerdasan Buatan & Robotika',
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
    parent_id: 'none',
  })

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const config = TYPE_CONFIG[activeType] || TYPE_CONFIG.tema_riset
  const Icon = config.icon
  const isFokusRiset = activeType === 'fokus_riset' || activeType === 'tema_riset'

  // Parent candidates for hierarchical jenis_kawasan (e.g. Kawasan, BRIDA, Kebun Raya)
  const parentCandidates = useMemo(() => {
    if (activeType !== 'jenis_kawasan') return []
    return items.filter(
      (it) => !it.parent_id && (!editingItem || it.id !== editingItem.id)
    )
  }, [items, editingItem, activeType])

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

  // Items to display in the table (for jenis_kawasan: all utama/parent on top, followed by children)
  const displayableItems = useMemo(() => {
    if (activeType !== 'jenis_kawasan') return items
    const utamaItems = items.filter((it) => !it.parent_id)
    const childItems = items.filter((it) => Boolean(it.parent_id))
    return [...utamaItems, ...childItems]
  }, [items, activeType])

  // Filtered by search
  const filteredItems = useMemo(() => {
    if (!search.trim()) return displayableItems
    const q = search.toLowerCase()
    return displayableItems.filter(
      (it) =>
        it.nama?.toLowerCase().includes(q) ||
        it.slug?.toLowerCase().includes(q) ||
        it.parent_nama?.toLowerCase().includes(q)
    )
  }, [displayableItems, search])

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Reset page when search or activeType changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, activeType])

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
      deskripsi: '',
      is_active: true,
      parent_id: 'none',
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
      parent_id: item.parent_id || 'none',
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
        is_active: Boolean(formData.is_active),
      }

      if (!isFokusRiset) {
        payload.deskripsi = formData.deskripsi?.trim() || null
      }

      if (activeType === 'jenis_kawasan') {
        payload.parent_id =
          formData.parent_id && formData.parent_id !== 'none'
            ? formData.parent_id
            : null
      }

      if (editingItem) {
        const updated = await updateCategory(editingItem.id, payload, activeType)
        toast.success(`${config.singular} berhasil diperbarui`)
        // Optimistically update items state so UI reflects the new description immediately
        setItems((prev) =>
          prev.map((it) =>
            it.id === editingItem.id
              ? {
                ...it,
                ...payload,
                ...(updated && typeof updated === 'object' ? updated : {}),
              }
              : it
          )
        )
      } else {
        const created = await createCategory(payload)
        toast.success(`${config.singular} baru berhasil ditambahkan`)
        if (created && created.id) {
          setItems((prev) => [...prev, created])
        }
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
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center">
            Master Data &mdash; {config.label}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder={`Cari ${config.singular.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah {config.singular}
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead className="w-56">Nama</TableHead>
              {activeType === 'jenis_kawasan' && (
                <TableHead className="w-44">Kategori Induk</TableHead>
              )}
              {!isFokusRiset && <TableHead>Deskripsi</TableHead>}
              <TableHead className="w-40 font-mono">Slug</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
              <TableHead className="w-28 text-right pr-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={activeType === 'jenis_kawasan' ? 7 : (isFokusRiset ? 5 : 6)} className="p-8 text-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <span>Memuat data...</span>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={activeType === 'jenis_kawasan' ? 7 : (isFokusRiset ? 5 : 6)} className="p-8 text-center text-muted-foreground">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center font-mono text-muted-foreground text-[11px]">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground text-xs">
                      {item.nama}
                    </div>
                  </TableCell>
                  {activeType === 'jenis_kawasan' && (
                    <TableCell>
                      {item.parent_nama ? (
                        <Badge variant="secondary" className="font-normal text-[11px] gap-1">
                          <span className="opacity-60">↳</span> {item.parent_nama}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/60 text-xs font-mono">
                          -
                        </span>
                      )}
                    </TableCell>
                  )}
                  {!isFokusRiset && (
                    <TableCell className="text-muted-foreground text-xs">
                      {item.deskripsi ? (
                        <span className="line-clamp-2 leading-relaxed">{item.deskripsi}</span>
                      ) : (
                        <span className="text-muted-foreground/60 italic text-[11px]">- Belum ada deskripsi -</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground font-mono text-[11px]">
                    {item.slug}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      title="Klik untuk mengubah status"
                      className="inline-flex cursor-pointer transition-opacity hover:opacity-80"
                    >
                      {item.is_active ? (
                        <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-[10px] font-mono">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground border-border text-[10px] font-mono">
                          Nonaktif
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(item)}
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
        {filteredItems.length > 0 && (
          <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredItems.length)} dari{' '}
              {filteredItems.length} {config.label.toLowerCase()}
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

      {/* Add / Edit Dialog Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${config.singular}` : `Tambah ${config.singular} Baru`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            {/* 1. Nama */}
            <div className="space-y-2">
              <Label htmlFor="cat-nama">
                Nama {config.singular} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat-nama"
                required
                autoFocus
                value={formData.nama}
                onChange={handleNameChange}
                placeholder={config.placeholder}
              />
            </div>

            {/* Kategori Induk (Parent) - Khusus Jenis Kawasan */}
            {activeType === 'jenis_kawasan' && (
              <div className="space-y-2">
                <Label htmlFor="cat-parent">Kategori Induk (Parent)</Label>
                <Select
                  value={formData.parent_id || 'none'}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, parent_id: val }))
                  }
                >
                  <SelectTrigger id="cat-parent">
                    <SelectValue placeholder="Pilih Kategori Induk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Tanpa Induk (-) --</SelectItem>
                    {parentCandidates.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Pilih induk jika entitas ini merupakan sub-kategori (misal: turunan dari Kawasan).
                </p>
              </div>
            )}

            {/* 2. Slug */}
            <div className="space-y-2">
              <Label htmlFor="cat-slug">
                Slug Identifier <span className="text-muted-foreground font-normal font-mono text-[10px]">(Otomatis)</span>
              </Label>
              <Input
                id="cat-slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="slug-otomatis"
                className="font-mono text-muted-foreground"
              />
            </div>

            {/* 3. Deskripsi (Hanya untuk kategori yang membutuhkan deskripsi, Fokus Riset tidak perlu) */}
            {!isFokusRiset && (
              <div className="space-y-2">
                <Label htmlFor="cat-deskripsi">
                  Deskripsi <span className="text-muted-foreground font-normal">(Opsional)</span>
                </Label>
                <Textarea
                  id="cat-deskripsi"
                  rows={3}
                  value={formData.deskripsi || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deskripsi: e.target.value }))}
                  placeholder={`Penjelasan ringkas mengenai ${config.singular.toLowerCase()} ini...`}
                  className="resize-none leading-relaxed"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-foreground">
                  Status Aktif
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Tampilkan sebagai opsi pilihan di formulir
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
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
        <AlertDialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">Hapus {config.singular}?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Data <strong>{deleteTarget?.nama}</strong> akan dihapus dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

