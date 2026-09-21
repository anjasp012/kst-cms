import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import SuggestionDetailModal from './SuggestionDetailModal'
import { exportSuggestionsToExcel } from '@/lib/excelExport'
import { toast } from 'sonner'
import { 
  Search, 
  Trash2, 
  Eye, 
  Loader2, 
  MessageSquare,
  FileSpreadsheet,
  FileCode
} from 'lucide-react'

export default function SuggestionsTable({
  suggestions,
  loading,
  onDelete,
  onBulkDelete
}) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Filtered by search query
  const filtered = useMemo(() => {
    return suggestions.filter(s => {
      const matchSearch = 
        s.topic_wanted?.toLowerCase().includes(search.toLowerCase()) ||
        s.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.persona_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.zone_name?.toLowerCase().includes(search.toLowerCase())
      return matchSearch
    })
  }, [suggestions, search])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(s => s.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleRowClick = (suggestion) => {
    setSelectedSuggestion(suggestion)
    setDetailModalOpen(true)
  }

  const confirmDeleteSingle = (s, e) => {
    e.stopPropagation()
    setItemToDelete(s)
    setIsBulkDeleting(false)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteBulk = () => {
    if (selectedIds.length === 0) return
    setIsBulkDeleting(true)
    setItemToDelete(null)
    setDeleteConfirmOpen(true)
  }

  const handleExecuteDelete = async () => {
    if (isBulkDeleting) {
      await onBulkDelete(selectedIds)
      setSelectedIds([])
    } else if (itemToDelete) {
      await onDelete(itemToDelete.id)
    }
    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }

  const handleExportExcel = () => {
    const dataToExport = filtered.length > 0 ? filtered : suggestions
    if (dataToExport.length === 0) {
      toast.warning('Tidak ada data usulan untuk diekspor')
      return
    }
    exportSuggestionsToExcel(dataToExport)
    toast.success(`Berhasil mengunduh laporan Excel (${dataToExport.length} data usulan)`)
  }

  const handleExportJSON = () => {
    const dataToExport = filtered.length > 0 ? filtered : suggestions
    if (dataToExport.length === 0) {
      toast.warning('Tidak ada data usulan untuk diekspor')
      return
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`
    const downloadAnchor = document.createElement('a')
    const fileDateStr = new Date().toISOString().split('T')[0]
    downloadAnchor.setAttribute('href', jsonString)
    downloadAnchor.setAttribute('download', `Laporan_Usulan_ResearchTable_${fileDateStr}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success(`Berhasil mengunduh format JSON (${dataToExport.length} data)`)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            type="text"
            placeholder="Cari topik usulan, nama pengunjung, zona riset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>

        {/* Right side: Bulk Action OR Export Report Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono mr-1">
                {selectedIds.length} dipilih:
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={confirmDeleteBulk}
                className="h-8 text-xs gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Terpilih
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportExcel}
                className="h-9 text-xs font-medium border-emerald-300 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Ekspor Excel (.xls)
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleExportJSON}
                className="h-9 text-xs font-medium border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 gap-1.5"
              >
                <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                JSON
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Card without status */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
              <tr>
                <th className="p-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={handleSelectAll}
                    className="rounded border-zinc-300 dark:border-zinc-700 bg-transparent cursor-pointer"
                  />
                </th>
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3 text-left">Topik Riset yang Dicari</th>
                <th className="p-3 w-36 text-left">Pengunjung</th>
                <th className="p-3 w-36 text-left">Modul Pengguna</th>
                <th className="p-3 w-36 text-left">Token Tantangan</th>
                <th className="p-3 w-32 text-right">Waktu Masuk</th>
                <th className="p-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-zinc-500 font-mono">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                    <span>Memuat data usulan...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-zinc-500 font-mono">
                    <MessageSquare className="w-7 h-7 mx-auto mb-2 text-zinc-400 opacity-50" />
                    <span>Tidak ada data usulan riset</span>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors"
                  >
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                        className="rounded border-zinc-300 dark:border-zinc-700 bg-transparent cursor-pointer"
                      />
                    </td>
                    <td className="p-3 text-center font-mono text-zinc-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-relaxed">
                        {item.topic_wanted}
                      </div>
                      {item.feedback && (
                        <div className="text-[11px] text-zinc-400 line-clamp-1 italic mt-0.5">
                          "{item.feedback}"
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-zinc-800 dark:text-zinc-200 font-medium">
                        {item.visitor_name || 'Anonim'}
                      </div>
                      {item.age_range && (
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {item.age_range}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-zinc-800 dark:text-zinc-200 font-medium">
                        {item.persona_name || '-'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-blue-600 dark:text-blue-400">
                        {item.zone_name || '-'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleRowClick(item)}
                          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => confirmDeleteSingle(item, e)}
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

      {/* Suggestion Detail Modal without status */}
      <SuggestionDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        suggestion={selectedSuggestion}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data</AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDeleting
                ? `Apakah Anda yakin ingin menghapus ${selectedIds.length} data usulan yang dipilih?`
                : `Apakah Anda yakin ingin menghapus data usulan ini?`}
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
