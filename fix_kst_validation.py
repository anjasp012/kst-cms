import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

old_val = """    if (!formData.nama.trim() || !formData.slug.trim()) {
      toast.error('Nama dan Slug KST wajib diisi')
      return
    }"""

new_val = """    if (!formData.nama.trim() || !formData.slug.trim()) {
      toast.error('Nama dan Slug KST wajib diisi')
      return
    }
    
    if (!formData.kota_provinsi || !formData.kota_provinsi.trim()) {
      toast.error('Lokasi (Kabupaten / Kota) wajib diisi')
      return
    }"""

text = text.replace(old_val, new_val)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
