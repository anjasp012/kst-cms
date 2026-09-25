import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Make Jenis Instansi UI Required (Add asterisk)
text = text.replace('<Label className="text-xs">Jenis Instansi</Label>', '<Label className="text-xs">Jenis Instansi *</Label>')

# Update validation alert
old_val = """    if (!formData.nama.trim() || !formData.slug.trim()) {
      toast.error('Nama dan Slug KST wajib diisi')
      return
    }
    
    if (!formData.kota_provinsi || !formData.kota_provinsi.trim()) {
      toast.error('Lokasi (Kabupaten / Kota) wajib diisi')
      return
    }"""

new_val = """    if (!formData.nama.trim()) {
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
    }"""

text = text.replace(old_val, new_val)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
