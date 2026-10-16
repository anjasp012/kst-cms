import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Copy,
  Sparkles,
  CheckCircle2,
  Filter,
} from 'lucide-react'
import {
  fetchQuickFiltersAdmin,
  createQuickFilterAdmin,
  updateQuickFilterAdmin,
  deleteQuickFilterAdmin,
  fetchJenisKawasan,
  fetchThemes,
  filterPublicLokasi,
} from '@/lib/api'
import { toast } from 'sonner'

const WILAYAH_REGIONS = [
  'Jawa',
  'Sumatera',
  'Kalimantan',
  'Sulawesi',
  'Bali & Nusa Tenggara',
  'Maluku & Papua',
]

export default function QuickFilterManagementView() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Master data kriteria
  const [masterJenisKawasan, setMasterJenisKawasan] = useState([])
  const [masterFokusRiset, setMasterFokusRiset] = useState([])

  // Modal Dialog Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [saving, setSaving] = useState(false)

  // Form Fields (Simple: Nama, Slug, Filter Data)
  const [formData, setFormData] = useState({
    nama: '',
    slug: '',
    filter_data: {
      wilayah: [],
      jenis_kawasan: [],
      fokus_riset: [],
      search_input: '',
    },
  })

  // Live Filter Test state inside modal
  const [testingFilter, setTestingFilter] = useState(false)
  const [filterTestResult, setFilterTestResult] = useState(null)

  // Delete Alert Dialog
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Load Data
  const loadQuickFilters = useCallback(async () => {
    setLoading(true)
    try {
      const [qfRes, jkRes, frRes] = await Promise.all([
        fetchQuickFiltersAdmin(),
        fetchJenisKawasan().catch(() => []),
        fetchThemes(true).catch(() => []),
      ])
      setItems(Array.isArray(qfRes) ? qfRes : [])
      setMasterJenisKawasan(Array.isArray(jkRes) ? jkRes : [])
      setMasterFokusRiset(Array.isArray(frRes) ? frRes : [])
    } catch (err) {
      toast.error(err.message || 'Gagal memuat quick filter')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadQuickFilters()
  }, [loadQuickFilters])

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormData({
      nama: '',
      slug: '',
      filter_data: {
        wilayah: [],
        jenis_kawasan: [],
        fokus_riset: [],
        search_input: '',
      },
    })
    setFilterTestResult(null)
    setIsDialogOpen(true)
  }

  // Open Edit Dialog
  const handleOpenEdit = (item) => {
    setEditingItem(item)
    const fd = item.filter_data || {}
    setFormData({
      nama: item.nama || '',
      slug: item.slug || '',
      filter_data: {
        wilayah: Array.isArray(fd.wilayah) ? fd.wilayah : [],
        jenis_kawasan: Array.isArray(fd.jenis_kawasan) ? fd.jenis_kawasan : [],
        fokus_riset: Array.isArray(fd.fokus_riset) ? fd.fokus_riset : [],
        search_input: fd.search_input || '',
      },
    })
    setFilterTestResult(null)
    setIsDialogOpen(true)
  }

  // Auto-slugify
  const handleNameChange = (val) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setFormData((prev) => ({
      ...prev,
      nama: val,
      slug: prev.slug === '' || !editingItem ? slug : prev.slug,
    }))
  }

  // Toggle array item in filter_data
  const handleToggleFilterArray = (key, value) => {
    setFormData((prev) => {
      const curList = prev.filter_data[key] || []
      const exists = curList.includes(value)
      const newList = exists ? curList.filter((x) => x !== value) : [...curList, value]
      return {
        ...prev,
        filter_data: {
          ...prev.filter_data,
          [key]: newList,
        },
      }
    })
  }

  // Test Run Filter
  const handleTestFilterCriteria = async (payloadToTest = null) => {
    setTestingFilter(true)
    try {
      const p = payloadToTest || {
        wilayah: formData.filter_data.wilayah,
        jenis_kawasan: formData.filter_data.jenis_kawasan,
        fokus_riset: formData.filter_data.fokus_riset,
        search_input: formData.filter_data.search_input || undefined,
      }
      const res = await filterPublicLokasi(p)
      setFilterTestResult({
        total: res.total || 0,
        sample: res.data ? res.data.slice(0, 5) : [],
      })
      toast.success(`${res.total || 0} lokasi cocok ditemukan!`)
    } catch (err) {
      toast.error(err.message || 'Gagal menjalankan uji filter')
    } finally {
      setTestingFilter(false)
    }
  }

  // Submit Save
  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.nama.trim()) {
      toast.error('Nama Quick Filter wajib diisi!')
      return
    }

    setSaving(true)
    try {
      const payload = {
        nama: formData.nama.trim(),
        slug: formData.slug.trim(),
        filter_data: formData.filter_data,
      }

      if (editingItem) {
        await updateQuickFilterAdmin(editingItem.id, payload)
        toast.success('Quick Filter berhasil diperbarui')
      } else {
        await createQuickFilterAdmin(payload)
        toast.success('Quick Filter berhasil ditambahkan')
      }
      setIsDialogOpen(false)
      loadQuickFilters()
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan Quick Filter')
    } finally {
      setSaving(false)
    }
  }

  // Delete
  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteQuickFilterAdmin(deleteId)
      toast.success('Quick Filter berhasil dihapus')
      setDeleteId(null)
      loadQuickFilters()
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus Quick Filter')
    } finally {
      setDeleting(false)
    }
  }

  // Copy JSON Payload for POST /api/v1/kst/data-lokasi/filter
  const handleCopyJson = (item) => {
    const payloadStr = JSON.stringify(item.filter_data || {}, null, 2)
    navigator.clipboard.writeText(payloadStr)
    toast.success(`Payload filter "${item.nama}" berhasil disalin!`)
  }

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const q = searchQuery.toLowerCase()
      return (
        it.nama.toLowerCase().includes(q) ||
        it.slug.toLowerCase().includes(q)
      )
    })
  }, [items, searchQuery])

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Quick Filter
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar preset filter cepat untuk pencarian data lokasi di endpoint API publik
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadQuickFilters}
            disabled={loading}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 text-xs h-8 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Quick Filter</span>
          </Button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama / slug filter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Total: <strong className="text-foreground">{filteredItems.length}</strong> filter
        </span>
      </div>

      {/* Table Quick Filters */}
      <Card className="rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 text-center text-xs font-semibold">No</TableHead>
              <TableHead className="text-xs font-semibold">Nama Filter</TableHead>
              <TableHead className="text-xs font-semibold">Slug</TableHead>
              <TableHead className="text-xs font-semibold">Kriteria Yang Difilter</TableHead>
              <TableHead className="text-xs font-semibold text-right w-36">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-xs text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                    <span>Memuat quick filter...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                  Belum ada Quick Filter. Klik tombol <strong>Tambah Quick Filter</strong> untuk membuat baru.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item, idx) => {
                const fd = item.filter_data || {}
                const hasWilayah = fd.wilayah && fd.wilayah.length > 0
                const hasJK = fd.jenis_kawasan && fd.jenis_kawasan.length > 0
                const hasFR = fd.fokus_riset && fd.fokus_riset.length > 0
                const hasKW = !!fd.search_input

                return (
                  <TableRow key={item.id} className="hover:bg-muted/40">
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {idx + 1}
                    </TableCell>

                    <TableCell className="font-semibold text-xs text-foreground">
                      {item.nama}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.slug}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {hasWilayah && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none">
                            Wilayah: {fd.wilayah.join(', ')}
                          </Badge>
                        )}
                        {hasJK && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none">
                            Kawasan: {fd.jenis_kawasan.length} jenis
                          </Badge>
                        )}
                        {hasFR && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-none">
                            Riset: {fd.fokus_riset.length} topik
                          </Badge>
                        )}
                        {hasKW && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none">
                            Kata Kunci: "{fd.search_input}"
                          </Badge>
                        )}
                        {!hasWilayah && !hasJK && !hasFR && !hasKW && (
                          <span className="text-[11px] text-muted-foreground italic">Semua lokasi</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyJson(item)}
                          title="Salin JSON kriteria filter untuk method POST /api/v1/kst/data-lokasi/filter"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          <span>JSON</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(item.id)}
                          title="Hapus"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* SIMPLE FORM MODAL (CREATE / EDIT) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              <span>{editingItem ? 'Edit Quick Filter' : 'Tambah Quick Filter Baru'}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-1">
            {/* 1. Nama & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Nama Quick Filter <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Misal: KST Terpadu di Jawa"
                  value={formData.nama}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="text-xs h-8"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Slug URL</Label>
                <Input
                  placeholder="kst-jawa"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="text-xs h-8 font-mono"
                />
              </div>
            </div>

            {/* 2. Pilihan Filter Apa Saja */}
            <div className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-3.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">
                  Pilih Kriteria Filter:
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestFilterCriteria()}
                  disabled={testingFilter}
                  className="h-6 text-[11px] gap-1 px-2 border-primary/30 text-primary"
                >
                  <Sparkles className={`w-3 h-3 ${testingFilter ? 'animate-spin' : 'text-amber-500'}`} />
                  <span>Uji Filter</span>
                </Button>
              </div>

              {/* Wilayah / Pulau */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Wilayah / Pulau:</span>
                <div className="flex flex-wrap gap-1">
                  {WILAYAH_REGIONS.map((reg) => {
                    const isSelected = formData.filter_data.wilayah.includes(reg)
                    return (
                      <button
                        type="button"
                        key={reg}
                        onClick={() => handleToggleFilterArray('wilayah', reg)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-background hover:bg-muted text-foreground border-border'
                        }`}
                      >
                        {reg}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Jenis Kawasan */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Jenis Kawasan:</span>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1 border rounded bg-background">
                  {masterJenisKawasan.map((jk) => {
                    const isSelected = formData.filter_data.jenis_kawasan.includes(jk.slug)
                    return (
                      <button
                        type="button"
                        key={jk.id}
                        onClick={() => handleToggleFilterArray('jenis_kawasan', jk.slug)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-muted/30 hover:bg-muted text-foreground border-border'
                        }`}
                      >
                        {jk.nama}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Fokus Riset */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Fokus Riset:</span>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1 border rounded bg-background">
                  {masterFokusRiset.slice(0, 15).map((fr) => {
                    const isSelected = formData.filter_data.fokus_riset.includes(fr.slug)
                    return (
                      <button
                        type="button"
                        key={fr.id}
                        onClick={() => handleToggleFilterArray('fokus_riset', fr.slug)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                          isSelected
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-muted/30 hover:bg-muted text-foreground border-border'
                        }`}
                      >
                        {fr.nama}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Kata Kunci */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Kata Kunci Teks (Opsional):</span>
                <Input
                  placeholder="Kata kunci nama atau alamat..."
                  value={formData.filter_data.search_input}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filter_data: {
                        ...formData.filter_data,
                        search_input: e.target.value,
                      },
                    })
                  }
                  className="text-xs h-7"
                />
              </div>

              {/* Test Result Mini Banner */}
              {filterTestResult && (
                <div className="rounded border border-primary/20 bg-primary/5 p-2 text-xs flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Ditemukan: {filterTestResult.total} lokasi cocok</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilterTestResult(null)}
                    className="text-[10px] text-muted-foreground hover:underline"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
                className="text-xs h-8"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="text-xs h-8 font-semibold"
              >
                {saving ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Filter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold">Hapus Quick Filter ini?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Quick Filter ini akan dihapus dari sistem dan tidak dapat digunakan lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="text-xs h-8">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
