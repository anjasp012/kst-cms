import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  FileUp,
  Loader2,
  Info,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { downloadLocationTemplate, importLocationData } from '@/lib/api'

export default function LocationImportModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('create_or_update')
  const [isImporting, setIsImporting] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(null) // 'xlsx' | 'csv' | null
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleDownloadTemplate = async (format = 'xlsx') => {
    try {
      setDownloadingTemplate(format)
      const blob = await downloadLocationTemplate(format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template_import_lokasi.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Template ${format.toUpperCase()} berhasil diunduh`)
    } catch (err) {
      toast.error(`Gagal mengunduh template: ${err.message}`)
    } finally {
      setDownloadingTemplate(null)
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    const ext = selected.name.toLowerCase()
    if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls') && !ext.endsWith('.csv')) {
      toast.error('Format file tidak didukung. Harap pilih file .xlsx, .xls, atau .csv')
      return
    }

    setFile(selected)
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0]
    if (!dropped) return

    const ext = dropped.name.toLowerCase()
    if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls') && !ext.endsWith('.csv')) {
      toast.error('Format file tidak didukung. Harap pilih file .xlsx, .xls, atau .csv')
      return
    }

    setFile(dropped)
    setResult(null)
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmitImport = async () => {
    if (!file) {
      toast.error('Pilih file terlebih dahulu.')
      return
    }

    try {
      setIsImporting(true)
      const res = await importLocationData(file, mode)
      setResult(res)

      if (res.success) {
        toast.success(`Import selesai! (${res.imported} baru, ${res.updated} diperbarui)`)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(res.message || 'Import gagal.')
      }
    } catch (err) {
      toast.error(`Terjadi kesalahan saat import: ${err.message}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleResetAndClose = () => {
    setFile(null)
    setResult(null)
    setIsImporting(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleResetAndClose()}>
      <DialogContent className="max-w-xl sm:max-w-2xl p-0 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Import Data Lokasi Kawasan</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              Tambahkan atau perbarui data kawasan secara massal menggunakan file spreadsheet Excel (.xlsx) atau CSV (.csv).
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* STEP 1: DOWNLOAD TEMPLATE */}
          <div className="space-y-2.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 p-4 rounded-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  Langkah 1: Unduh Format Template Resmi
                </span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Gunakan template resmi yang telah dilengkapi dengan contoh pengisian serta panduan nama kolom master wilayah dan fokus riset.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadTemplate('xlsx')}
                  disabled={downloadingTemplate !== null}
                  className="h-8 text-xs font-medium border-blue-300 dark:border-blue-800 bg-white dark:bg-zinc-900 hover:bg-blue-50 text-blue-700 dark:text-blue-300 gap-1.5 shadow-2xs"
                >
                  {downloadingTemplate === 'xlsx' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>Template Excel</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadTemplate('csv')}
                  disabled={downloadingTemplate !== null}
                  className="h-8 text-xs font-medium border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 gap-1.5 shadow-2xs"
                >
                  {downloadingTemplate === 'csv' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>CSV</span>
                </Button>
              </div>
            </div>
          </div>

          {/* STEP 2: UPLOAD FILE & OPTIONS */}
          {!result && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <span>Langkah 2: Unggah File Data Siap Import</span>
                </label>

                {/* Dropzone */}
                {!file ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shadow-xs">
                      <Upload className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Klik untuk memilih file atau seret file ke area ini
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 pt-0.5">
                        Mendukung format Microsoft Excel (.xlsx, .xls) atau CSV (.csv)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900 shadow-2xs">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        {file.name.endsWith('.csv') ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <FileSpreadsheet className="w-5 h-5" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={handleRemoveFile}
                      className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Mode Options */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Opsi Penanganan Data Duplikat:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMode('create_or_update')}
                    className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                      mode === 'create_or_update'
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-1 ring-blue-500'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between pb-0.5">
                      <span>Perbarui Data (Update)</span>
                      {mode === 'create_or_update' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      Jika lokasi sudah ada, perbarui data alamat, koordinat, dan fokus risetnya.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('skip_existing')}
                    className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                      mode === 'skip_existing'
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-1 ring-blue-500'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between pb-0.5">
                      <span>Lewati Duplikat (Skip)</span>
                      {mode === 'skip_existing' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      Hanya tambahkan data lokasi baru, abaikan jika nama lokasi sudah terdaftar.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESULT REPORT DISPLAY */}
          {result && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-4 rounded-xl border ${
                result.success
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
              }`}>
                <div className="flex items-center gap-2 pb-2">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <h4 className="font-bold text-sm">
                    {result.success ? 'Proses Import Selesai!' : 'Import Mengalami Kendala'}
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                  <div className="bg-white/70 dark:bg-zinc-900/70 p-2.5 rounded-lg text-center">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Total Baris</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-200">{result.total_rows || 0}</span>
                  </div>
                  <div className="bg-white/70 dark:bg-zinc-900/70 p-2.5 rounded-lg text-center">
                    <span className="text-[10px] text-emerald-600 uppercase tracking-wider block font-semibold">Ditambahkan</span>
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">{result.imported || 0}</span>
                  </div>
                  <div className="bg-white/70 dark:bg-zinc-900/70 p-2.5 rounded-lg text-center">
                    <span className="text-[10px] text-blue-600 uppercase tracking-wider block font-semibold">Diperbarui</span>
                    <span className="text-base font-bold text-blue-700 dark:text-blue-400">{result.updated || 0}</span>
                  </div>
                  <div className="bg-white/70 dark:bg-zinc-900/70 p-2.5 rounded-lg text-center">
                    <span className="text-[10px] text-amber-600 uppercase tracking-wider block font-semibold">Dilewati</span>
                    <span className="text-base font-bold text-amber-700 dark:text-amber-400">{result.skipped || 0}</span>
                  </div>
                </div>
              </div>

              {/* Errors List */}
              {Array.isArray(result.errors) && result.errors.length > 0 && (
                <div className="space-y-1.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl text-xs">
                  <span className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Catatan / Kendala Baris:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-400 text-[11px] max-h-36 overflow-y-auto pt-1">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetAndClose}
            className="text-xs"
          >
            {result ? 'Tutup' : 'Batal'}
          </Button>

          {!result ? (
            <Button
              type="button"
              size="sm"
              disabled={!file || isImporting}
              onClick={handleSubmitImport}
              className="gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Import...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Mulai Import Data</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleResetAndClose}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <span>Selesai & Muat Ulang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

      </DialogContent>
    </Dialog>
  )
}
