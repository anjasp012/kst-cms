import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Check, 
  X,
  Loader2 
} from 'lucide-react'
import KSTDetailModal from './KSTDetailModal'
import KSTFormModal from './KSTFormModal'
import { getImageUrl } from '@/lib/utils'
import { fetchKSTDetail } from '@/lib/api'
import { toast } from 'sonner'

export default function KSTManagementView({
  locations,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [search, setSearch] = useState('')
  const [selectedWilayah, setSelectedWilayah] = useState('ALL')
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedKSTDetail, setSelectedKSTDetail] = useState(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingKST, setEditingKST] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const wilayahList = ['ALL', 'Sumatera', 'Jawa', 'Kalimantan', 'Sulawesi', 'Nusa Tenggara', 'Maluku & Papua']

  const filtered = useMemo(() => {
    return locations.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.kota_provinsi.toLowerCase().includes(search.toLowerCase()) ||
        (item.fokus_utama || []).some(f => f.toLowerCase().includes(search.toLowerCase()))

      const matchWilayah = selectedWilayah === 'ALL' || item.wilayah.toLowerCase() === selectedWilayah.toLowerCase()

      return matchSearch && matchWilayah
    })
  }, [locations, search, selectedWilayah])

  const handleOpenDetail = async (item) => {
    try {
      const fullDetail = await fetchKSTDetail(item.id)
      setSelectedKSTDetail(fullDetail)
      setDetailModalOpen(true)
    } catch (err) {
      toast.error('Gagal memuat detail KST')
    }
  }

  const handleOpenEdit = async (item) => {
    try {
      const fullDetail = await fetchKSTDetail(item.id)
      setEditingKST(fullDetail)
      setFormModalOpen(true)
    } catch (err) {
      setEditingKST(item)
      setFormModalOpen(true)
    }
  }

  const handleSaveForm = async (payload) => {
    if (editingKST) {
      await onUpdate(editingKST.id, payload)
    } else {
      await onCreate(payload)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cari kawasan sains, kota, topik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingKST(null)
            setFormModalOpen(true)
          }}
          className="h-9 text-xs font-medium gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah KST
        </Button>
      </div>

      {/* Wilayah Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1">
        {wilayahList.map((w) => (
          <button
            key={w}
            onClick={() => setSelectedWilayah(w)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              selectedWilayah === w
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {w === 'ALL' ? 'Semua Wilayah' : w}
          </button>
        ))}
      </div>

      {/* Locations Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
              <tr>
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3 text-left">Kawasan Sains (KST)</th>
                <th className="p-3 w-40 text-left">Wilayah & Kota</th>
                <th className="p-3 w-44 text-left">Koordinat (PostGIS)</th>
                <th className="p-3 text-left">Fokus Riset</th>
                <th className="p-3 w-24 text-center">Status</th>
                <th className="p-3 w-28 text-right pr-4">Aksi</th>
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
                    Tidak ada data yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 text-center font-mono text-zinc-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {item.thumbnail_url ? (
                            <img
                              src={getImageUrl(item.thumbnail_url)}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          ) : (
                            <Building2 className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                            {item.nama}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400">
                            /{item.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <div className="text-zinc-800 dark:text-zinc-200 font-medium">{item.kota_provinsi}</div>
                        <div className="text-[11px] font-mono text-zinc-400">{item.wilayah}</div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-zinc-500">
                      {item.latitude !== null && item.longitude !== null ? (
                        <span>
                          {Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(item.fokus_utama || []).slice(0, 3).map((f, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            {f}
                          </span>
                        ))}
                        {(item.fokus_utama || []).length > 3 && (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            +{item.fokus_utama.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {item.is_active ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(item)}
                          className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(item)}
                          className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
                          className="h-7 w-7 p-0 text-zinc-400 hover:text-rose-600"
                          title="Hapus"
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

      {/* Detail Modal */}
      <KSTDetailModal
        kst={selectedKSTDetail}
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedKSTDetail(null)
        }}
      />

      {/* Form Modal */}
      <KSTFormModal
        open={formModalOpen}
        kst={editingKST}
        onSave={handleSaveForm}
        onClose={() => {
          setFormModalOpen(false)
          setEditingKST(null)
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(val) => !val && setDeleteTarget(null)}>
        <AlertDialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">Hapus Kawasan Sains?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Data <strong>{deleteTarget?.nama}</strong> akan dihapus dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteTarget) {
                  await onDelete(deleteTarget.id)
                  toast.success('KST berhasil dihapus')
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
