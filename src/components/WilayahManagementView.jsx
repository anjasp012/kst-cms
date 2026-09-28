import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  MapPin,
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  fetchProvinces,
  createProvince,
  updateProvince,
  deleteProvince,
  fetchRegencies,
  createRegency,
  updateRegency,
  deleteRegency,
} from '@/lib/api'
import { toast } from 'sonner'

export default function WilayahManagementView({ onWilayahChanged }) {
  // Active sub-tab: 'provinsi' | 'kabupaten_kota'
  const [activeTab, setActiveTab] = useState('provinsi')
  const isTabProvinsi = activeTab === 'provinsi' || activeTab === 'provinces'
  const isTabKabupaten = activeTab === 'kabupaten_kota' || activeTab === 'kabupaten-kota' || activeTab === 'regencies'

  // --- PROVINCES STATE ---
  const [provinces, setProvinces] = useState([])
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [provinceSearch, setProvinceSearch] = useState('')
  const [provincePage, setProvincePage] = useState(1)
  const provincesPerPage = 15

  // Province modals
  const [provinceFormOpen, setProvinceFormOpen] = useState(false)
  const [editingProvince, setEditingProvince] = useState(null)
  const [savingProvince, setSavingProvince] = useState(false)
  const [provinceFormData, setProvinceFormData] = useState({
    kode: '',
    nama: '',
  })
  const [deleteProvinceTarget, setDeleteProvinceTarget] = useState(null)
  const [deletingProvince, setDeletingProvince] = useState(false)

  // --- REGENCIES STATE ---
  const [regencies, setRegencies] = useState([])
  const [loadingRegencies, setLoadingRegencies] = useState(false)
  const [regencySearch, setRegencySearch] = useState('')
  const [regencyPage, setRegencyPage] = useState(1)
  const regenciesPerPage = 15

  // Regency modals
  const [regencyFormOpen, setRegencyFormOpen] = useState(false)
  const [editingRegency, setEditingRegency] = useState(null)
  const [savingRegency, setSavingRegency] = useState(false)
  const [regencyFormData, setRegencyFormData] = useState({
    kode: '',
    province_kode: '32',
    nama: '',
    tipe: 'Kabupaten',
  })
  const [deleteRegencyTarget, setDeleteRegencyTarget] = useState(null)
  const [deletingRegency, setDeletingRegency] = useState(false)

  // Load provinces
  const loadProvinces = useCallback(async () => {
    setLoadingProvinces(true)
    try {
      const data = await fetchProvinces()
      if (Array.isArray(data)) {
        setProvinces(data)
      } else {
        setProvinces([])
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data provinsi')
      setProvinces([])
    } finally {
      setLoadingProvinces(false)
    }
  }, [])

  // Load regencies
  const loadRegencies = useCallback(async () => {
    setLoadingRegencies(true)
    try {
      const data = await fetchRegencies()
      if (Array.isArray(data)) {
        setRegencies(data)
      } else {
        setRegencies([])
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data kabupaten/kota')
      setRegencies([])
    } finally {
      setLoadingRegencies(false)
    }
  }, [])

  useEffect(() => {
    loadProvinces()
  }, [loadProvinces])

  useEffect(() => {
    if (isTabKabupaten && regencies.length === 0) {
      loadRegencies()
    }
  }, [isTabKabupaten, loadRegencies, regencies.length])

  // --- FILTERED PROVINCES ---
  const filteredProvinces = useMemo(() => {
    if (!provinceSearch.trim()) return provinces
    const q = provinceSearch.toLowerCase()
    return provinces.filter(
      (p) =>
        p.nama?.toLowerCase().includes(q) ||
        p.kode?.toLowerCase().includes(q)
    )
  }, [provinces, provinceSearch])

  useEffect(() => {
    setProvincePage(1)
  }, [provinceSearch])

  useEffect(() => {
    setRegencyPage(1)
  }, [regencySearch])

  const totalProvincePages = Math.ceil(filteredProvinces.length / provincesPerPage) || 1
  const paginatedProvinces = useMemo(() => {
    const start = (provincePage - 1) * provincesPerPage
    return filteredProvinces.slice(start, start + provincesPerPage)
  }, [filteredProvinces, provincePage])

  // --- FILTERED REGENCIES ---
  const filteredRegencies = useMemo(() => {
    if (!regencySearch.trim()) return regencies
    const q = regencySearch.toLowerCase()
    return regencies.filter((r) => {
      return (
        r.nama?.toLowerCase().includes(q) ||
        r.kode?.toLowerCase().includes(q) ||
        r.province_name?.toLowerCase().includes(q)
      )
    })
  }, [regencies, regencySearch])

  // Paginated regencies
  const totalRegencyPages = Math.ceil(filteredRegencies.length / regenciesPerPage) || 1
  const paginatedRegencies = useMemo(() => {
    const start = (regencyPage - 1) * regenciesPerPage
    return filteredRegencies.slice(start, start + regenciesPerPage)
  }, [filteredRegencies, regencyPage])

  // Jump from Province table to Regencies filtered by that province
  const handleViewRegenciesOfProvince = (prov) => {
    setRegencySearch(prov.nama)
    setActiveTab('kabupaten_kota')
    setRegencyPage(1)
    if (regencies.length === 0) {
      loadRegencies()
    }
  }

  // --- PROVINCE HANDLERS ---
  const handleOpenAddProvince = () => {
    setEditingProvince(null)
    setProvinceFormData({
      kode: '',
      nama: '',
    })
    setProvinceFormOpen(true)
  }

  const handleOpenEditProvince = (prov) => {
    setEditingProvince(prov)
    setProvinceFormData({
      kode: prov.kode,
      nama: prov.nama,
    })
    setProvinceFormOpen(true)
  }

  const handleSaveProvince = async (e) => {
    e.preventDefault()
    if (!provinceFormData.kode.trim() || !provinceFormData.nama.trim()) {
      toast.error('Kode dan Nama Provinsi wajib diisi')
      return
    }

    setSavingProvince(true)
    try {
      if (editingProvince) {
        await updateProvince(editingProvince.kode, {
          nama: provinceFormData.nama.trim(),
        })
        toast.success(`Provinsi ${provinceFormData.nama} berhasil diperbarui`)
      } else {
        await createProvince({
          kode: provinceFormData.kode.trim(),
          nama: provinceFormData.nama.trim(),
        })
        toast.success(`Provinsi ${provinceFormData.nama} berhasil ditambahkan`)
      }
      setProvinceFormOpen(false)
      await loadProvinces()
      if (onWilayahChanged) onWilayahChanged()
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data provinsi')
    } finally {
      setSavingProvince(false)
    }
  }

  const handleDeleteProvinceConfirm = async () => {
    if (!deleteProvinceTarget) return
    setDeletingProvince(true)
    try {
      await deleteProvince(deleteProvinceTarget.kode)
      toast.success(`Provinsi ${deleteProvinceTarget.nama} berhasil dihapus`)
      setDeleteProvinceTarget(null)
      await loadProvinces()
      if (onWilayahChanged) onWilayahChanged()
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus provinsi')
    } finally {
      setDeletingProvince(false)
    }
  }

  // --- REGENCY HANDLERS ---
  const handleOpenAddRegency = () => {
    setEditingRegency(null)
    setRegencyFormData({
      kode: '',
      province_kode: provinces[0]?.kode || '32',
      nama: '',
      tipe: 'Kabupaten',
    })
    setRegencyFormOpen(true)
  }

  const handleOpenEditRegency = (reg) => {
    setEditingRegency(reg)
    setRegencyFormData({
      kode: reg.kode,
      province_kode: reg.province_kode,
      nama: reg.nama,
      tipe: reg.tipe || 'Kabupaten',
    })
    setRegencyFormOpen(true)
  }

  const handleSaveRegency = async (e) => {
    e.preventDefault()
    if (!regencyFormData.kode.trim() || !regencyFormData.nama.trim()) {
      toast.error('Kode dan Nama Kabupaten/Kota wajib diisi')
      return
    }

    setSavingRegency(true)
    try {
      if (editingRegency) {
        await updateRegency(editingRegency.kode, {
          nama: regencyFormData.nama.trim(),
          province_kode: regencyFormData.province_kode,
          tipe: regencyFormData.tipe,
        })
        toast.success(`${regencyFormData.nama} berhasil diperbarui`)
      } else {
        await createRegency({
          kode: regencyFormData.kode.trim(),
          province_kode: regencyFormData.province_kode,
          nama: regencyFormData.nama.trim(),
          tipe: regencyFormData.tipe,
        })
        toast.success(`${regencyFormData.nama} berhasil ditambahkan`)
      }
      setRegencyFormOpen(false)
      await loadRegencies()
      await loadProvinces()
      if (onWilayahChanged) onWilayahChanged()
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data kabupaten/kota')
    } finally {
      setSavingRegency(false)
    }
  }

  const handleDeleteRegencyConfirm = async () => {
    if (!deleteRegencyTarget) return
    setDeletingRegency(true)
    try {
      await deleteRegency(deleteRegencyTarget.kode)
      toast.success(`${deleteRegencyTarget.nama} berhasil dihapus`)
      setDeleteRegencyTarget(null)
      await loadRegencies()
      await loadProvinces()
      if (onWilayahChanged) onWilayahChanged()
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus kabupaten/kota')
    } finally {
      setDeletingRegency(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Master Data &mdash; Wilayah Indonesia
            </h1>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🗺️ TAB 1: PROVINSI */}
      {/* ========================================================================= */}
      {isTabProvinsi && (
        <div className="space-y-4">
          {/* Controls Bar: Search (Kiri), Tab Switcher (Kanan) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-80">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Cari nama atau kode provinsi..."
                  value={provinceSearch}
                  onChange={(e) => setProvinceSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Tab Switcher */}
              <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setActiveTab('provinsi')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${isTabProvinsi
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  Provinsi ({provinces.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('kabupaten_kota')
                    if (regencies.length === 0) loadRegencies()
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${isTabKabupaten
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  Kabupaten / Kota ({regencies.length || '514'})
                </button>
              </div>
            </div>
          </div>

          {/* Provinces Table */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
            {loadingProvinces ? (
              <div className="p-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                <span className="text-xs">Memuat data provinsi...</span>
              </div>
            ) : filteredProvinces.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 text-xs">
                Tidak ada data provinsi yang cocok dengan pencarian
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-500 font-mono">
                        <th className="py-3 px-4 w-12 text-center">NO</th>
                        <th className="py-3 px-4 w-28 font-mono">KODE</th>
                        <th className="py-3 px-4">NAMA PROVINSI</th>
                        <th className="py-3 px-4 text-center w-40">KOTA / KABUPATEN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                      {paginatedProvinces.map((prov, idx) => (
                        <tr
                          key={prov.kode}
                          className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                        >
                          <td className="py-3 px-4 text-center text-zinc-400 font-mono text-[11px]">
                            {(provincePage - 1) * provincesPerPage + idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {prov.kode}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                            {prov.nama}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleViewRegenciesOfProvince(prov)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-900 transition-colors"
                              title="Klik untuk melihat daftar Kabupaten/Kota di provinsi ini"
                            >
                              <Building2 className="w-3 h-3" />
                              {prov.total_regencies || 0} Kab/Kota
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Province Pagination Controls */}
                {filteredProvinces.length > 0 && (
                  <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                    <div>
                      Menampilkan {(provincePage - 1) * provincesPerPage + 1} -{' '}
                      {Math.min(provincePage * provincesPerPage, filteredProvinces.length)} dari{' '}
                      {filteredProvinces.length} Provinsi
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={provincePage <= 1}
                        onClick={() => setProvincePage((prev) => Math.max(prev - 1, 1))}
                        className="h-8 px-2.5 text-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                      </Button>
                      <span className="px-2 font-mono text-[11px]">
                        {provincePage} / {totalProvincePages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={provincePage >= totalProvincePages}
                        onClick={() => setProvincePage((prev) => Math.min(prev + 1, totalProvincePages))}
                        className="h-8 px-2.5 text-xs"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏙️ TAB 2: KABUPATEN / KOTA */}
      {/* ========================================================================= */}
      {isTabKabupaten && (
        <div className="space-y-4">
          {/* Controls Bar: Search (Kiri), Tab Switcher + Add Button (Kanan) - Filter provinsi & tipe dihapus */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-80">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Cari kabupaten atau kota..."
                  value={regencySearch}
                  onChange={(e) => {
                    setRegencySearch(e.target.value)
                    setRegencyPage(1)
                  }}
                  className="pl-9 h-9 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Tab Switcher - Di samping kiri tombol tambah */}
              <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setActiveTab('provinsi')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${isTabProvinsi
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  Provinsi ({provinces.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('kabupaten_kota')
                    if (regencies.length === 0) loadRegencies()
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${isTabKabupaten
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  Kabupaten / Kota ({regencies.length || '514'})
                </button>
              </div>
            </div>
          </div>

          {/* Regencies Table */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
            {loadingRegencies ? (
              <div className="p-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                <span className="text-xs">Memuat data kabupaten/kota...</span>
              </div>
            ) : filteredRegencies.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 text-xs">
                Tidak ada data kabupaten/kota yang sesuai dengan pencarian
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-500 font-mono">
                        <th className="py-3 px-4 w-12 text-center">NO</th>
                        <th className="py-3 px-4 w-28 font-mono">KODE</th>
                        <th className="py-3 px-4">NAMA KABUPATEN / KOTA</th>
                        <th className="py-3 px-4 w-28">TIPE</th>
                        <th className="py-3 px-4">PROVINSI INDUK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                      {paginatedRegencies.map((reg, idx) => (
                        <tr
                          key={reg.kode}
                          className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                        >
                          <td className="py-3 px-4 text-center text-zinc-400 font-mono text-[11px]">
                            {(regencyPage - 1) * regenciesPerPage + idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {reg.kode}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                            {reg.nama}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${reg.tipe?.toLowerCase() === 'kota'
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                }`}
                            >
                              {reg.tipe || 'Kabupaten'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                            {reg.province_name || `Provinsi ${reg.province_kode}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <div>
                    Menampilkan {(regencyPage - 1) * regenciesPerPage + 1} -{' '}
                    {Math.min(regencyPage * regenciesPerPage, filteredRegencies.length)} dari{' '}
                    {filteredRegencies.length} Kab/Kota
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={regencyPage <= 1}
                      onClick={() => setRegencyPage((prev) => Math.max(prev - 1, 1))}
                      className="h-8 px-2.5 text-xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                    </Button>
                    <span className="px-2 font-mono text-[11px]">
                      {regencyPage} / {totalRegencyPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={regencyPage >= totalRegencyPages}
                      onClick={() => setRegencyPage((prev) => Math.min(prev + 1, totalRegencyPages))}
                      className="h-8 px-2.5 text-xs"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📝 PROVINCE DIALOGS */}
      {/* ========================================================================= */}
      <Dialog open={provinceFormOpen} onOpenChange={setProvinceFormOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden shadow-lg">
          <div className="p-5 pb-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center">
                  <Globe2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <span>{editingProvince ? 'Ubah Data Provinsi' : 'Tambah Provinsi Baru'}</span>
              </DialogTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Kelola master data nama dan kode resmi provinsi di Indonesia.
              </p>
            </DialogHeader>
          </div>

          <form onSubmit={handleSaveProvince}>
            <div className="p-5 space-y-4">
              {/* 1. Nama Provinsi */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Nama Provinsi <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  autoFocus
                  value={provinceFormData.nama}
                  onChange={(e) => setProvinceFormData((prev) => ({ ...prev, nama: e.target.value }))}
                  placeholder="Contoh: JAWA BARAT"
                  className="h-9 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* 2. Kode Kemendagri */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Kode Kemendagri <span className="text-rose-500">*</span>
                  </Label>
                  <span className="text-[10px] text-zinc-400 font-mono">2 Digit Angka</span>
                </div>
                <Input
                  required
                  disabled={Boolean(editingProvince)}
                  value={provinceFormData.kode}
                  onChange={(e) => setProvinceFormData((prev) => ({ ...prev, kode: e.target.value }))}
                  placeholder="Contoh: 32"
                  className="h-9 text-xs font-mono bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Kode resmi 2 digit Kemendagri / BPS (misal: 31 DKI Jakarta, 32 Jawa Barat).
                </p>
              </div>
            </div>

            <DialogFooter className="p-4 px-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProvinceFormOpen(false)}
                className="text-xs h-9 border-zinc-200 dark:border-zinc-800"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={savingProvince}
                className="h-9 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium shadow-sm px-4"
              >
                {savingProvince ? (
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

      <AlertDialog open={Boolean(deleteProvinceTarget)} onOpenChange={(open) => !open && setDeleteProvinceTarget(null)}>
        <AlertDialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Hapus Provinsi?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Apakah Anda yakin ingin menghapus data provinsi &quot;<strong>{deleteProvinceTarget?.nama}</strong>&quot;? Seluruh data kabupaten/kota di bawah provinsi ini akan ikut terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProvinceConfirm}
              disabled={deletingProvince}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium"
            >
              {deletingProvince ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========================================================================= */}
      {/* 📝 REGENCY DIALOGS */}
      {/* ========================================================================= */}
      <Dialog open={regencyFormOpen} onOpenChange={setRegencyFormOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden shadow-lg">
          <div className="p-5 pb-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span>{editingRegency ? 'Ubah Data Kabupaten / Kota' : 'Tambah Kabupaten / Kota Baru'}</span>
              </DialogTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Lengkapi rincian data administratif wilayah kabupaten atau kota.
              </p>
            </DialogHeader>
          </div>

          <form onSubmit={handleSaveRegency}>
            <div className="p-5 space-y-4">
              {/* 1. Provinsi Induk */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Provinsi Induk <span className="text-rose-500">*</span>
                </Label>
                <select
                  required
                  value={regencyFormData.province_kode}
                  onChange={(e) => setRegencyFormData((prev) => ({ ...prev, province_kode: e.target.value }))}
                  className="w-full h-9 rounded-md text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  {provinces.map((p) => (
                    <option key={p.kode} value={p.kode}>
                      {p.kode} &mdash; {p.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Nama Kabupaten / Kota */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Nama Kabupaten / Kota <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  autoFocus
                  value={regencyFormData.nama}
                  onChange={(e) => setRegencyFormData((prev) => ({ ...prev, nama: e.target.value }))}
                  placeholder="Contoh: Kabupaten Bandung / Kota Bogor"
                  className="h-9 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* 3. Tipe Wilayah */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Tipe Wilayah Administratif
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegencyFormData((prev) => ({ ...prev, tipe: 'Kabupaten' }))}
                    className={`h-9 rounded-md text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${regencyFormData.tipe === 'Kabupaten'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm font-semibold'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Kabupaten
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegencyFormData((prev) => ({ ...prev, tipe: 'Kota' }))}
                    className={`h-9 rounded-md text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${regencyFormData.tipe === 'Kota'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm font-semibold'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    Kota
                  </button>
                </div>
              </div>

              {/* 4. Kode Kemendagri */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Kode Kemendagri <span className="text-rose-500">*</span>
                  </Label>
                  <span className="text-[10px] text-zinc-400 font-mono">Format: XX.XX</span>
                </div>
                <Input
                  required
                  disabled={Boolean(editingRegency)}
                  value={regencyFormData.kode}
                  onChange={(e) => setRegencyFormData((prev) => ({ ...prev, kode: e.target.value }))}
                  placeholder={`Contoh: ${regencyFormData.province_kode || '32'}.04`}
                  className="h-9 text-xs font-mono bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Kode resmi Kemendagri/BPS (contoh: 32.04 untuk Kab. Bandung, 32.73 untuk Kota Bandung).
                </p>
              </div>
            </div>

            <DialogFooter className="p-4 px-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRegencyFormOpen(false)}
                className="text-xs h-9 border-zinc-200 dark:border-zinc-800"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={savingRegency}
                className="h-9 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium shadow-sm px-4"
              >
                {savingRegency ? (
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

      <AlertDialog open={Boolean(deleteRegencyTarget)} onOpenChange={(open) => !open && setDeleteRegencyTarget(null)}>
        <AlertDialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Hapus Kabupaten / Kota?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Apakah Anda yakin ingin menghapus data &quot;<strong>{deleteRegencyTarget?.nama}</strong>&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRegencyConfirm}
              disabled={deletingRegency}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium"
            >
              {deletingRegency ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
