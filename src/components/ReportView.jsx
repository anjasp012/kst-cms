import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { exportSuggestionsToExcel } from '@/lib/excelExport'
import { toast } from 'sonner'
import {
  FileSpreadsheet,
  FileCode,
  Download,
  Filter,
  CheckCircle2,
  Clock3,
  XCircle,
  Inbox,
  Loader2,
  FileText,
} from 'lucide-react'

export default function ReportView({ analytics, suggestions = [] }) {
  const [exportFilter, setExportFilter] = useState('all')
  const [exporting, setExporting] = useState(false)

  const total = analytics?.total_suggestions ?? suggestions.length
  const approved = analytics?.reviewed_suggestions ?? suggestions.filter(s => s.status === 'REVIEWED').length
  const pending = analytics?.new_suggestions ?? suggestions.filter(s => s.status === 'NEW').length
  const rejected = suggestions.filter(s => s.status === 'ARCHIVED').length

  const approvedPct = total > 0 ? Math.round((approved / total) * 100) : 0
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0
  const rejectedPct = total > 0 ? Math.round((rejected / total) * 100) : 0

  const getFilteredData = () => {
    if (exportFilter === 'approved') return suggestions.filter(s => s.status === 'REVIEWED')
    if (exportFilter === 'pending') return suggestions.filter(s => s.status === 'NEW')
    if (exportFilter === 'rejected') return suggestions.filter(s => s.status === 'ARCHIVED')
    return suggestions
  }

  const handleExportExcel = () => {
    setExporting(true)
    try {
      const dataToExport = getFilteredData()
      if (dataToExport.length === 0) {
        toast.warning('Tidak ada data pada filter yang dipilih untuk diekspor')
        return
      }

      const filterNames = {
        all: 'Semua Status Usulan',
        approved: 'Usulan Approved (Ditinjau)',
        pending: 'Usulan Pending (Baru)',
        rejected: 'Usulan Rejected (Arsip)',
      }

      exportSuggestionsToExcel(dataToExport, filterNames[exportFilter])
      toast.success(`Berhasil mengunduh laporan ${dataToExport.length} data usulan`)
    } catch (err) {
      toast.error('Gagal mengekspor laporan: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  const handleExportJSON = () => {
    setExporting(true)
    try {
      const dataToExport = getFilteredData()
      if (dataToExport.length === 0) {
        toast.warning('Tidak ada data pada filter yang dipilih untuk diekspor')
        return
      }

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dataToExport, null, 2)
      )}`
      const downloadAnchor = document.createElement('a')
      const fileDateStr = new Date().toISOString().split('T')[0]
      downloadAnchor.setAttribute('href', jsonString)
      downloadAnchor.setAttribute('download', `Laporan_ResearchTable_${exportFilter}_${fileDateStr}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()

      toast.success(`Berhasil mengunduh berkas JSON (${dataToExport.length} data)`)
    } catch (err) {
      toast.error('Gagal mengekspor JSON: ' + err.message)
    } finally {
      setExporting(false)
    }
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
    <div className="space-y-6 animate-fade-in">
      {/* Title Banner */}
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Laporan Rekapitulasi & Ekspor Data
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Unduh data usulan riset pengunjung dalam format Microsoft Excel dan JSON untuk kebutuhan pelaporan.
        </p>
      </div>

      {/* Summary Metrics (DREAMWALL style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-medium">Total Usulan</span>
            <Inbox className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">{total}</div>
          <div className="mt-1 text-xs text-zinc-500">100% dari total input pengunjung</div>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-medium">Approved (Ditinjau)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{approved}</div>
          <div className="mt-1 text-xs text-zinc-500">{approvedPct}% telah ditinjau</div>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-medium">Pending (Baru)</span>
            <Clock3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{pending}</div>
          <div className="mt-1 text-xs text-zinc-500">{pendingPct}% usulan baru</div>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-medium">Rejected (Arsip)</span>
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{rejected}</div>
          <div className="mt-1 text-xs text-zinc-500">{rejectedPct}% diarsipkan</div>
        </div>
      </div>

      {/* Export Options Card (DREAMWALL style) */}
      <Card>
        <CardHeader className="p-5 pb-4">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <CardTitle className="text-sm font-semibold">Ekspor Berkas Data</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Pilih cakupan data yang ingin diekspor dan tentukan format unduhan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-5">
          {/* Scope Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <span>Cakupan Status Data:</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: `Semua Data (${total})` },
                { id: 'approved', label: `Hanya Approved (${approved})` },
                { id: 'pending', label: `Hanya Pending (${pending})` },
                { id: 'rejected', label: `Hanya Rejected (${rejected})` },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setExportFilter(item.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    exportFilter === item.id
                      ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold'
                      : 'bg-zinc-100/80 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Download Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleExportExcel}
              disabled={exporting}
              className="h-9 text-sm px-4 font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Unduh Dokumen Excel (.xls)
            </Button>

            <Button
              variant="outline"
              onClick={handleExportJSON}
              disabled={exporting}
              className="h-9 text-sm px-4"
            >
              <FileCode className="w-4 h-4 mr-2 text-zinc-500 dark:text-zinc-400" />
              Unduh Format JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview Table */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <CardTitle className="text-sm font-semibold">Pratinjau Data Laporan Terkini</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Cuplikan baris data usulan riset terbaru yang masuk dalam cakupan laporan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-zinc-600 dark:text-zinc-400 font-medium">
                  <th className="px-3 py-2.5 w-12 font-mono">No</th>
                  <th className="px-3 py-2.5">Topik Usulan</th>
                  <th className="px-3 py-2.5 w-36">Pengunjung</th>
                  <th className="px-3 py-2.5 w-28">Status</th>
                  <th className="px-3 py-2.5 w-40">Tanggal Masuk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {suggestions.slice(0, 8).map((item, index) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-zinc-400 dark:text-zinc-500">{index + 1}</td>
                    <td className="px-3 py-2.5 max-w-sm truncate text-zinc-900 dark:text-zinc-200 font-medium">{item.topic_wanted}</td>
                    <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{item.visitor_name || 'Anonim'}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={item.status === 'REVIEWED' ? 'approved' : item.status === 'NEW' ? 'pending' : 'rejected'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                ))}
                {suggestions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-500">
                      Belum ada data untuk ditampilkan dalam pratinjau.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
