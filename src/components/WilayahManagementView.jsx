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
  Globe2,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  MapPin,
  Building2,
} from 'lucide-react'
import {
  fetchProvinces,
  createProvince,
  updateProvince,
  deleteProvince,
} from '@/lib/api'
import { toast } from 'sonner'

const WILAYAH_OPTIONS = [
  'Sumatera',
  'Jawa',
  'Kalimantan',
  'Sulawesi',
  'Nusa Tenggara',
  'Maluku & Papua',
]

export default function WilayahManagementView({ onWilayahChanged }) {
  const [provinces, setProvinces] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedWilayah, setSelectedWilayah] = useState('ALL')
  const [search, setSearch] = useState('')

  // Form states
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    wilayah: 'Jawa',
  })

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchProvinces()
      if (Array.isArray(data)) {
        setProvinces(data)
      } else {
        setProvinces([])
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data wilayah provinsi')
      setProvinces([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredProvinces = useMemo(() => {
    return provinces.filter((p) => {
      const matchRegion =
        selectedWilayah === 'ALL' || p.wilayah === selectedWilayah
      const q = search.toLowerCase()
      const matchSearch =
        !search.trim() ||
        p.nama?.toLowerCase().includes(q) ||
        p.kode?.toLowerCase().includes(q) ||
        p.wilayah?.toLowerCase().includes(q)
      return matchRegion && matchSearch
    })
  }, [provinces, selectedWilayah, search])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      kode: '',
      nama: '',
      wilayah: selectedWilayah !== 'ALL' ? selectedWilayah : 'Jawa',
    })
    setFormOpen(true)
  }

  const handleOpenEdit = (prov) => {
    setEditingItem(prov)
    setFormData({
      kode: prov.kode,
      nama: prov.nama,
      wilayah: prov.wilayah || 'Jawa',
    })
    setFormOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.nama.trim()) {
      toast.error('Nama provinsi wajib diisi')
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        await updateProvince(editingItem.kode, {
          nama: formData.nama.trim(),
          wilayah: formData.wilayah,
        })
        toast.success(`Provinsi ${formData.nama} berhasil diperbarui`)
      } else {
        if (!formData.kode.trim()) {
          toast.error('Kode provinsi wajib diisi')
          setSaving(false)
          return
        }
        await createProvince({
          kode: formData.kode.trim(),
          nama: formData.nama.trim(),
          wilayah: formData.wilayah,
        })
        toast.success(`Provinsi ${formData.nama} berhasil ditambahkan`)
      }

      setFormOpen(false)
      await loadData()
      if (onWilayahChanged) onWilayahChanged()
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan provinsi')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProvince(deleteTarget.kode)
      toast.success(`Provinsi ${deleteTarget.nama} berhasil dihapus`)
      setDeleteTarget(null)
      await loadData()
      if (onWilayahChanged) onWilayahChanged()
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus provinsi')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Region Filter & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
          <button
            type="button"
            onClick={() => setSelectedWilayah('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              selectedWilayah === 'ALL'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Semua Wilayah
            <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
              {provinces.length}
            </span>
          </button>

          {WILAYAH_OPTIONS.map((w) => {
            const count = provinces.filter((p) => p.wilayah === w).length
            const active = selectedWilayah === w
            return (
              <button
                key={w}
                type="button"
                onClick={() => setSelectedWilayah(w)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  active
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {w}
                <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {count}
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
          Tambah Provinsi
        </Button>
      </div>

      {/* Info & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Globe2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Master Wilayah & 38 Provinsi Indonesia
            </h2>
            <Badge variant="outline" className="text-[11px] font-mono">
              {filteredProvinces.length} Provinsi
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Tersimpan langsung di database PostgreSQL lokal agar pencarian instan tanpa ketergantungan API pihak ketiga.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Cari provinsi atau kode..."
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
            <span className="text-xs font-mono">Memuat data provinsi...</span>
          </div>
        ) : filteredProvinces.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Tidak ada data provinsi yang cocok
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-500 font-mono">
                  <th className="py-3 px-4 w-12 text-center">NO</th>
                  <th className="py-3 px-4 w-24 font-mono">KODE</th>
                  <th className="py-3 px-4">NAMA PROVINSI</th>
                  <th className="py-3 px-4">KELOMPOK WILAYAH BRIN</th>
                  <th className="py-3 px-4 text-right w-28">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {filteredProvinces.map((prov, idx) => (
                  <tr
                    key={prov.kode}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-center text-zinc-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                      {prov.kode}
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {prov.nama}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {prov.wilayah}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(prov)}
                          title="Edit"
                          className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(prov)}
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

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <span>{editingItem ? 'Ubah Data Provinsi' : 'Tambah Provinsi Baru'}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Kode Kemendagri <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                disabled={Boolean(editingItem)}
                value={formData.kode}
                onChange={(e) => setFormData((prev) => ({ ...prev, kode: e.target.value }))}
                placeholder="Contoh: 31 (DKI Jakarta)"
                className="text-xs font-mono bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Nama Provinsi <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                value={formData.nama}
                onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
                placeholder="Contoh: JAWA BARAT"
                className="text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Kelompok Wilayah BRIN <span className="text-rose-500">*</span>
              </Label>
              <select
                value={formData.wilayah}
                onChange={(e) => setFormData((prev) => ({ ...prev, wilayah: e.target.value }))}
                className="w-full h-9 rounded-md text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                {WILAYAH_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
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
                  'Simpan Data'
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
              Hapus Provinsi?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Apakah Anda yakin ingin menghapus data provinsi &quot;<strong>{deleteTarget?.nama}</strong>&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
