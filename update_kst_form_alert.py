import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# 1. Add AlertDialog Imports
alert_import = """import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
"""
text = text.replace("import { Card } from '@/components/ui/card'", alert_import + "import { Card } from '@/components/ui/card'")

# 2. Add State for Modal
state_injection = """  const [missingFields, setMissingFields] = useState([])
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)
"""
text = text.replace("  const [activeTab, setActiveTab] = useState('spasial')", "  const [activeTab, setActiveTab] = useState('spasial')\n" + state_injection)

# 3. Modify handleSubmit
old_handle_submit = """  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nama.trim()) {
      toast.error('Nama KST wajib diisi')
      return
    }
    if (!formData.slug.trim()) {
      toast.error('Slug URL wajib diisi')
      return
    }
    if (!formData.instansi_nama || !formData.instansi_nama.trim()) {
      toast.error('Jenis Instansi wajib diisi')
      return
    }
    if (!formData.kota_provinsi || !formData.kota_provinsi.trim()) {
      toast.error('Wilayah (Kota/Kabupaten) wajib diisi')
      return
    }

    // Check empty optional fields
    const emptyFields = []
    if (!formData.pengelola) emptyFields.push('Pengelola')
    if (!formData.status) emptyFields.push('Status')
    if (!formData.tahun_operasi) emptyFields.push('Tahun Operasi')
    if (!formData.latitude || !formData.longitude) emptyFields.push('Titik Koordinat')
    if (!formData.deskripsi_profil) emptyFields.push('Profil Kawasan')
    
    if (emptyFields.length > 0) {
      const proceed = window.confirm(`Data berikut belum diisi:\\n- ${emptyFields.join('\\n- ')}\\n\\nTetap simpan?`)
      if (!proceed) return
    }

    setSaving(true)
    try {
      const payload = {"""

new_handle_submit = """  const executeSave = async (payload) => {
    setSaving(true)
    try {
      if (isEdit) {
        await updateKST(id, payload)
        toast.success('Data KST berhasil diperbarui')
      } else {
        await createKST(payload)
        toast.success('KST baru berhasil ditambahkan')
      }
      if (onSaveSuccess) onSaveSuccess()
      navigate('/kst')
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data KST')
    } finally {
      setSaving(false)
    }
  }

  // Submit Handler
  const handleSubmit = async (e, asDraft = false) => {
    if (e) e.preventDefault()

    if (!formData.nama.trim()) {
      toast.error('Nama KST wajib diisi')
      return
    }
    if (!formData.slug.trim()) {
      toast.error('Slug URL wajib diisi')
      return
    }
    if (!formData.instansi_nama || !formData.instansi_nama.trim()) {
      toast.error('Jenis Instansi wajib diisi')
      return
    }
    if (!formData.kota_provinsi || !formData.kota_provinsi.trim()) {
      toast.error('Wilayah (Kota/Kabupaten) wajib diisi')
      return
    }

    const payload = {
      nama: formData.nama.trim(),
      slug: formData.slug.trim(),
      instansi_nama: formData.instansi_nama,
      telepon: formData.telepon,
      website: formData.website,
      email: formData.email,
      alamat: formData.alamat,
      wilayah: formData.wilayah,
      kota_provinsi: formData.kota_provinsi ? formData.kota_provinsi.trim() : '',
      pengelola: formData.pengelola ? formData.pengelola.trim() : null,
      status: asDraft ? 'Draft' : (formData.status || null),
      tahun_operasi: formData.tahun_operasi ? parseInt(formData.tahun_operasi, 10) : null,
      thumbnail_url: formData.thumbnail_url,
      latitude: formData.latitude !== '' ? Number(formData.latitude) : null,
      longitude: formData.longitude !== '' ? Number(formData.longitude) : null,

      deskripsi_profil: formData.deskripsi_profil.trim() || null,
      peran_kawasan: formData.peran_kawasan.trim() || null,
      fokus_utama: (formData.riset && formData.riset.length > 0)
        ? Array.from(new Set(formData.riset.map(r => r.bidang).filter(Boolean)))
        : (Array.isArray(formData.fokus_utama) ? formData.fokus_utama : []),
      terhubung_dengan: formData.terhubung_dengan ? formData.terhubung_dengan.trim() : null,

      fasilitas: formData.fasilitas.filter(f => f.nama.trim()),
      riset: formData.riset.filter(r => r.judul.trim()),
      potensi_kolaborasi: Array.from(new Set([
        ...(Array.isArray(formData.potensi_kolaborasi) ? formData.potensi_kolaborasi : []),
        ...formData.daftar_kolaborasi.map(d => d.tipe).filter(Boolean)
      ])),
      daftar_kolaborasi: formData.daftar_kolaborasi.filter(d => d.mitra.trim()),
      galeri: formData.galeri,
      is_active: formData.is_active
    }

    // Check empty optional fields
    const emptyFields = []
    if (!payload.pengelola) emptyFields.push('Pengelola')
    if (payload.status !== 'Draft' && !payload.status) emptyFields.push('Status')
    if (!payload.tahun_operasi) emptyFields.push('Tahun Operasi')
    if (payload.latitude === null || payload.longitude === null) emptyFields.push('Titik Koordinat')
    if (!payload.deskripsi_profil) emptyFields.push('Profil Kawasan')
    
    if (emptyFields.length > 0) {
      setMissingFields(emptyFields)
      setPendingPayload(payload)
      setConfirmModalOpen(true)
      return
    }

    executeSave(payload)
  }

  // To strip out the old block which did setSaving and execute"""

text = re.sub(r'  // Submit Handler.*?      const payload = \{', new_handle_submit + "\n      const NOOP = {", text, flags=re.DOTALL)

old_save_bottom = """      const NOOP = {
        nama: formData.nama.trim(),
        slug: formData.slug.trim(),
        instansi_nama: formData.instansi_nama,
        telepon: formData.telepon,
        website: formData.website,
        email: formData.email,
        alamat: formData.alamat,
        wilayah: formData.wilayah,
        kota_provinsi: formData.kota_provinsi ? formData.kota_provinsi.trim() : '',
        pengelola: formData.pengelola ? formData.pengelola.trim() : null,
        status: formData.status || null,
        tahun_operasi: formData.tahun_operasi ? parseInt(formData.tahun_operasi, 10) : null,
        thumbnail_url: formData.thumbnail_url,
        latitude: formData.latitude !== '' ? Number(formData.latitude) : null,
        longitude: formData.longitude !== '' ? Number(formData.longitude) : null,

        deskripsi_profil: formData.deskripsi_profil.trim() || null,
        peran_kawasan: formData.peran_kawasan.trim() || null,
        fokus_utama: (formData.riset && formData.riset.length > 0)
          ? Array.from(new Set(formData.riset.map(r => r.bidang).filter(Boolean)))
          : (Array.isArray(formData.fokus_utama) ? formData.fokus_utama : []),
        terhubung_dengan: formData.terhubung_dengan ? formData.terhubung_dengan.trim() : null,

        fasilitas: formData.fasilitas.filter(f => f.nama.trim()),
        riset: formData.riset.filter(r => r.judul.trim()),
        potensi_kolaborasi: Array.from(new Set([
          ...(Array.isArray(formData.potensi_kolaborasi) ? formData.potensi_kolaborasi : []),
          ...formData.daftar_kolaborasi.map(d => d.tipe).filter(Boolean)
        ])),
        daftar_kolaborasi: formData.daftar_kolaborasi.filter(d => d.mitra.trim()),
        galeri: formData.galeri,
        is_active: formData.is_active
      }

      if (isEdit) {
        await updateKST(id, payload)
        toast.success('Data KST berhasil diperbarui')
      } else {
        await createKST(payload)
        toast.success('KST baru berhasil ditambahkan')
      }

      if (onSaveSuccess) onSaveSuccess()
      navigate('/kst')
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data KST')
    } finally {
      setSaving(false)
    }
  }"""

text = text.replace(old_save_bottom, "  }")


with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
