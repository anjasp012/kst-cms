import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
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
  Building, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  Globe, 
  Mail, 
  Loader2, 
  ExternalLink 
} from 'lucide-react'
import { toast } from 'sonner'

export default function PartnersView({
  partners,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [search, setSearch] = useState('')
  const [selectedJenis, setSelectedJenis] = useState('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    nama_organisasi: '',
    jenis: 'BRIDA',
    wilayah: 'Sumatera',
    alamat: '',
    telepon: '',
    website: '',
    email: '',
    latitude: '',
    longitude: ''
  })

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({
      nama_organisasi: '',
      jenis: 'BRIDA',
      wilayah: 'Sumatera',
      alamat: '',
      telepon: '',
      website: '',
      email: '',
      latitude: '',
      longitude: ''
    })
    setFormOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      nama_organisasi: item.nama_organisasi || '',
      jenis: item.jenis || 'BRIDA',
      wilayah: item.wilayah || 'Sumatera',
      alamat: item.alamat || '',
      telepon: item.telepon || '',
      website: item.website || '',
      email: item.email || '',
      latitude: item.latitude !== null && item.latitude !== undefined ? String(item.latitude) : '',
      longitude: item.longitude !== null && item.longitude !== undefined ? String(item.longitude) : ''
    })
    setFormOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nama_organisasi.trim()) {
      toast.error('Nama organisasi wajib diisi')
      return
    }

    setSaving(true)
    try {
      const payload = {
        nama_organisasi: formData.nama_organisasi.trim(),
        jenis: formData.jenis,
        wilayah: formData.wilayah.trim() || null,
        alamat: formData.alamat.trim() || null,
        telepon: formData.telepon.trim() || null,
        website: formData.website.trim() || null,
        email: formData.email.trim() || null,
        latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,
      }

      if (editingItem) {
        await onUpdate(editingItem.id, payload)
        toast.success('Data mitra berhasil diperbarui')
      } else {
        await onCreate(payload)
        toast.success('Mitra baru berhasil ditambahkan')
      }
      setFormOpen(false)
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data')
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(() => {
    return partners.filter((p) => {
      const matchSearch =
        p.nama_organisasi.toLowerCase().includes(search.toLowerCase()) ||
        (p.alamat || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(search.toLowerCase())

      const matchJenis = selectedJenis === 'ALL' || p.jenis === selectedJenis

      return matchSearch && matchJenis
    })
  }, [partners, search, selectedJenis])

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cari instansi, alamat, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          className="h-9 text-xs font-medium gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Mitra
        </Button>
      </div>

      {/* Jenis Filter Pills */}
      <div className="flex items-center gap-1.5 w-full">
        {['ALL', 'BRIDA', 'BAPPERIDA', 'BAPPEDA'].map((j) => (
          <button
            key={j}
            onClick={() => setSelectedJenis(j)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              selectedJenis === j
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {j === 'ALL' ? 'Semua Tipe' : j}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
              <tr>
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3 text-left">Nama Organisasi</th>
                <th className="p-3 w-28 text-center">Tipe</th>
                <th className="p-3 text-left">Alamat</th>
                <th className="p-3 w-48 text-left">Kontak & Website</th>
                <th className="p-3 w-36 text-left font-mono">Koordinat</th>
                <th className="p-3 w-20 text-right pr-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-zinc-400" />
                    <span>Memuat data...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    Tidak ada mitra yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 text-center font-mono text-zinc-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                        {item.nama_organisasi}
                      </div>
                      {item.wilayah && (
                        <div className="text-[11px] font-mono text-zinc-400">
                          {item.wilayah}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {item.jenis}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs">
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                        {item.alamat || '-'}
                      </p>
                    </td>
                    <td className="p-3 space-y-0.5">
                      {item.telepon && item.telepon !== '-' && (
                        <div className="text-[11px] text-zinc-500 font-mono">
                          {item.telepon}
                        </div>
                      )}
                      {item.website && (
                        <a
                          href={item.website.startsWith('http') ? item.website : `http://${item.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] text-zinc-700 dark:text-zinc-300 hover:underline font-mono"
                        >
                          <span className="truncate max-w-[130px]">{item.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-zinc-500">
                      {item.latitude !== null && item.longitude !== null ? (
                        <span>
                          {Number(item.latitude).toFixed(3)}, {Number(item.longitude).toFixed(3)}
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic">-</span>
                      )}
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
                          className="h-7 w-7 p-0 text-zinc-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Form Tambah / Edit Mitra */}
      <Dialog open={formOpen} onOpenChange={(val) => !val && setFormOpen(false)}>
        <DialogContent className="max-w-md p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {editingItem ? 'Edit Mitra Riset Daerah' : 'Tambah Mitra Riset'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs">Nama Organisasi *</Label>
                <Input
                  value={formData.nama_organisasi}
                  onChange={(e) => setFormData({ ...formData, nama_organisasi: e.target.value })}
                  placeholder="BRIDA Kota Medan"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipe</Label>
                  <select
                    value={formData.jenis}
                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                    className="w-full h-8 px-2 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="BRIDA">BRIDA</option>
                    <option value="BAPPERIDA">BAPPERIDA</option>
                    <option value="BAPPEDA">BAPPEDA</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Wilayah</Label>
                  <Input
                    value={formData.wilayah}
                    onChange={(e) => setFormData({ ...formData, wilayah: e.target.value })}
                    placeholder="Sumatera"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Alamat</Label>
                <Input
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Alamat kantor..."
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Telepon</Label>
                  <Input
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="(061) ..."
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@..."
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Website</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="http://..."
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs font-mono text-zinc-500">Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="3.5434"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-mono text-zinc-500">Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="98.6737"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving} className="h-8 text-xs">
                Batal
              </Button>
              <Button type="submit" disabled={saving} className="h-8 text-xs">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(val) => !val && setDeleteTarget(null)}>
        <AlertDialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">Hapus Data Mitra?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Data <strong>{deleteTarget?.nama_organisasi}</strong> akan dihapus dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteTarget) {
                  await onDelete(deleteTarget.id)
                  toast.success('Mitra berhasil dihapus')
                  setDeleteTarget(null)
                }
              }}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
