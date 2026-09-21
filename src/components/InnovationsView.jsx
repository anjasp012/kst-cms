import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  Lightbulb, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Award, 
  Sliders, 
  Loader2, 
  Check
} from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

export default function InnovationsView({
  innovations,
  zones,
  personas,
  loading,
  onSaveInnovation,
  onDeleteInnovation,
  onUpdateRelevance,
  onNavigateToForm
}) {
  const [search, setSearch] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)



  const filtered = useMemo(() => {
    return innovations.filter(item => {
      const matchSearch = 
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.short_description?.toLowerCase().includes(search.toLowerCase())
      return matchSearch
    })
  }, [innovations, search])

  const handleOpenAdd = () => {
    onNavigateToForm(null)
  }

  const handleOpenEdit = (item) => {
    onNavigateToForm(item)
  }

  const handleOpenDelete = (item) => {
    setItemToDelete(item)
    setDeleteConfirmOpen(true)
  }

  const handleExecuteDelete = async () => {
    if (itemToDelete) {
      await onDeleteInnovation(itemToDelete.id)
    }
    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }



  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cari inovasi, topik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="h-9 text-xs font-medium gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Inovasi
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
              <tr>
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3 text-left">Judul Inovasi</th>
                <th className="p-3 w-36 text-left">Modul Pengguna</th>
                <th className="p-3 w-36 text-left">Zona Riset</th>
                <th className="p-3 w-28 text-center">TRL Level</th>
                <th className="p-3 text-left">Dampak Terapan</th>
                <th className="p-3 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500 font-mono">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                    <span>Memuat katalog inovasi...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500 font-mono">
                    <Lightbulb className="w-7 h-7 mx-auto mb-2 text-zinc-400 opacity-50" />
                    <span>Inovasi tidak ditemukan</span>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 text-center font-mono text-zinc-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="p-3">
                      <div className="flex items-start gap-3">
                        {item.thumbnail_url ? (
                          <img src={getImageUrl(item.thumbnail_url)} alt="" className="w-10 h-10 rounded object-cover border border-zinc-200 dark:border-zinc-800 bg-white flex-shrink-0" onError={(e) => e.target.style.display = 'none'} onLoad={(e) => e.target.style.display = 'block'} />
                        ) : (
                          <div className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-4 h-4 text-zinc-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                            {item.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-mono text-zinc-400">
                              /{item.slug}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">
                        {item.persona_name || `Modul ${item.persona_id}`}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">
                        {item.zone?.name || `Zona ${item.zone_id}`}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="approved">
                        TRL {item.trl}/9
                      </Badge>
                    </td>
                    <td className="p-3">
                      <p className="text-zinc-600 dark:text-zinc-300 line-clamp-2 text-xs">
                        {item.impact || item.short_description}
                      </p>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>



      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Inovasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus inovasi "{itemToDelete?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecuteDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
