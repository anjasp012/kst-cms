import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Globe2,
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
  const isTabProvinsi = activeTab === 'provinsi'
  const isTabKabupaten = activeTab === 'kabupaten_kota'

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
      {/* Header with Title and Tabs (replacing Add button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center">
            Master Data &mdash; Wilayah Indonesia
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={isTabProvinsi ? 'Cari provinsi...' : 'Cari kabupaten/kota...'}
              value={isTabProvinsi ? provinceSearch : regencySearch}
              onChange={(e) => {
                if (isTabProvinsi) {
                  setProvinceSearch(e.target.value)
                } else {
                  setRegencySearch(e.target.value)
                  setRegencyPage(1)
                }
              }}
              className="pl-8"
            />
          </div>

          {/* Sub-tab Switcher di sebelah kanan search */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val)
              if (val === 'kabupaten_kota' && regencies.length === 0) loadRegencies()
            }}
          >
            <TabsList className="h-9">
              <TabsTrigger value="provinsi" className="text-xs h-7 px-3">
                Provinsi ({provinces.length})
              </TabsTrigger>
              <TabsTrigger value="kabupaten_kota" className="text-xs h-7 px-3">
                Kabupaten / Kota ({regencies.length || '514'})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🗺️ TAB 1: PROVINSI TABLE */}
      {/* ========================================================================= */}
      {isTabProvinsi && (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="w-28 font-mono">Kode</TableHead>
                <TableHead>Nama Provinsi</TableHead>
                <TableHead className="text-center w-40">Kota / Kabupaten</TableHead>
                <TableHead className="w-28 text-right pr-4">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingProvinces ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-8 text-center text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <span>Memuat data...</span>
                  </TableCell>
                </TableRow>
              ) : filteredProvinces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-8 text-center text-muted-foreground">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProvinces.map((prov, idx) => (
                  <TableRow key={prov.kode}>
                    <TableCell className="text-center font-mono text-muted-foreground text-[11px]">
                      {(provincePage - 1) * provincesPerPage + idx + 1}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] font-semibold">
                        {prov.kode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground text-xs">
                        {prov.nama}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRegenciesOfProvince(prov)}
                        className="h-6 text-[10px] font-mono gap-1.5"
                        title="Klik untuk melihat daftar Kabupaten/Kota di provinsi ini"
                      >
                        <Building2 className="w-3 h-3 text-muted-foreground" />
                        {prov.total_regencies || 0} Kab/Kota
                      </Button>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEditProvince(prov)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteProvinceTarget(prov)}
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

          {/* Province Pagination Controls */}
          {filteredProvinces.length > 0 && (
            <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
              <div>
                Menampilkan {(provincePage - 1) * provincesPerPage + 1} -{' '}
                {Math.min(provincePage * provincesPerPage, filteredProvinces.length)} dari{' '}
                {filteredProvinces.length} provinsi
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={provincePage <= 1}
                  onClick={() => setProvincePage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                </Button>
                <span className="px-2 font-mono text-[11px] text-foreground">
                  {provincePage} / {totalProvincePages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={provincePage >= totalProvincePages}
                  onClick={() => setProvincePage((prev) => Math.min(prev + 1, totalProvincePages))}
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏙️ TAB 2: KABUPATEN / KOTA TABLE */}
      {/* ========================================================================= */}
      {isTabKabupaten && (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="w-28 font-mono">Kode</TableHead>
                <TableHead>Nama Kabupaten / Kota</TableHead>
                <TableHead className="w-28">Tipe</TableHead>
                <TableHead>Provinsi Induk</TableHead>
                <TableHead className="w-28 text-right pr-4">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRegencies ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-8 text-center text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <span>Memuat data...</span>
                  </TableCell>
                </TableRow>
              ) : filteredRegencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-8 text-center text-muted-foreground">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRegencies.map((reg, idx) => (
                  <TableRow key={reg.kode}>
                    <TableCell className="text-center font-mono text-muted-foreground text-[11px]">
                      {(regencyPage - 1) * regenciesPerPage + idx + 1}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] font-semibold">
                        {reg.kode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground text-xs">
                        {reg.nama}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={reg.tipe?.toLowerCase() === 'kota' ? 'default' : 'secondary'}
                        className="px-1.5 py-0 text-[10px] font-mono h-4"
                      >
                        {reg.tipe || 'Kabupaten'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {reg.province_name || `Provinsi ${reg.province_kode}`}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEditRegency(reg)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteRegencyTarget(reg)}
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

          {/* Regency Pagination Controls */}
          {filteredRegencies.length > 0 && (
            <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
              <div>
                Menampilkan {(regencyPage - 1) * regenciesPerPage + 1} -{' '}
                {Math.min(regencyPage * regenciesPerPage, filteredRegencies.length)} dari{' '}
                {filteredRegencies.length} kab/kota
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={regencyPage <= 1}
                  onClick={() => setRegencyPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                </Button>
                <span className="px-2 font-mono text-[11px] text-foreground">
                  {regencyPage} / {totalRegencyPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={regencyPage >= totalRegencyPages}
                  onClick={() => setRegencyPage((prev) => Math.min(prev + 1, totalRegencyPages))}
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📝 PROVINCE DIALOGS */}
      {/* ========================================================================= */}
      <Dialog open={provinceFormOpen} onOpenChange={setProvinceFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProvince ? 'Edit Data Provinsi' : 'Tambah Provinsi Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveProvince} className="space-y-4">
            {/* 1. Nama Provinsi */}
            <div className="space-y-2">
              <Label htmlFor="prov-nama">
                Nama Provinsi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prov-nama"
                required
                autoFocus
                value={provinceFormData.nama}
                onChange={(e) => setProvinceFormData((prev) => ({ ...prev, nama: e.target.value }))}
                placeholder="Contoh: JAWA BARAT"
              />
            </div>

            {/* 2. Kode Kemendagri */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="prov-kode">
                  Kode Kemendagri <span className="text-destructive">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">2 Digit Angka</span>
              </div>
              <Input
                id="prov-kode"
                required
                disabled={Boolean(editingProvince)}
                value={provinceFormData.kode}
                onChange={(e) => setProvinceFormData((prev) => ({ ...prev, kode: e.target.value }))}
                placeholder="Contoh: 32"
                className="font-mono text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                Kode resmi 2 digit Kemendagri / BPS (misal: 31 DKI Jakarta, 32 Jawa Barat).
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProvinceFormOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={savingProvince}
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
        <AlertDialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">Hapus Provinsi?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus data provinsi &quot;<strong>{deleteProvinceTarget?.nama}</strong>&quot;? Seluruh data kabupaten/kota di bawah provinsi ini akan ikut terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProvinceConfirm}
              disabled={deletingProvince}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRegency ? 'Edit Data Kabupaten / Kota' : 'Tambah Kabupaten / Kota Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveRegency} className="space-y-4">
            {/* 1. Provinsi Induk */}
            <div className="space-y-2">
              <Label>
                Provinsi Induk <span className="text-destructive">*</span>
              </Label>
              <Select
                value={regencyFormData.province_kode}
                onValueChange={(val) => setRegencyFormData((prev) => ({ ...prev, province_kode: val }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Provinsi Induk" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.kode} value={p.kode}>
                      {p.kode} &mdash; {p.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Nama Kabupaten / Kota */}
            <div className="space-y-2">
              <Label htmlFor="reg-nama">
                Nama Kabupaten / Kota <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg-nama"
                required
                autoFocus
                value={regencyFormData.nama}
                onChange={(e) => setRegencyFormData((prev) => ({ ...prev, nama: e.target.value }))}
                placeholder="Contoh: Kabupaten Bandung / Kota Bogor"
              />
            </div>

            {/* 3. Tipe Wilayah */}
            <div className="space-y-2">
              <Label>
                Tipe Wilayah Administratif
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={regencyFormData.tipe === 'Kabupaten' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRegencyFormData((prev) => ({ ...prev, tipe: 'Kabupaten' }))}
                  className="w-full"
                >
                  Kabupaten
                </Button>
                <Button
                  type="button"
                  variant={regencyFormData.tipe === 'Kota' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRegencyFormData((prev) => ({ ...prev, tipe: 'Kota' }))}
                  className="w-full"
                >
                  Kota
                </Button>
              </div>
            </div>

            {/* 4. Kode Kemendagri */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reg-kode">
                  Kode Kemendagri <span className="text-destructive">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">Format: XX.XX</span>
              </div>
              <Input
                id="reg-kode"
                required
                disabled={Boolean(editingRegency)}
                value={regencyFormData.kode}
                onChange={(e) => setRegencyFormData((prev) => ({ ...prev, kode: e.target.value }))}
                placeholder={`Contoh: ${regencyFormData.province_kode || '32'}.04`}
                className="font-mono text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                Kode resmi Kemendagri/BPS (contoh: 32.04 untuk Kab. Bandung, 32.73 untuk Kota Bandung).
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRegencyFormOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={savingRegency}
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
        <AlertDialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">Hapus Kabupaten / Kota?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus data &quot;<strong>{deleteRegencyTarget?.nama}</strong>&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRegencyConfirm}
              disabled={deletingRegency}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deletingRegency ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
