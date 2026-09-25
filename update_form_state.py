with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

new_fields = """    nama: '',
    slug: '',
    jenis: 'KST',
    telepon: '',
    website: '',
    email: '',
    alamat: '',
    wilayah: null,"""
text = text.replace("    nama: '',\n    slug: '',\n    wilayah: null,", new_fields)

fill_fields = """          nama: item.nama || '',
          slug: item.slug || '',
          jenis: item.jenis || 'KST',
          telepon: item.telepon || '',
          website: item.website || '',
          email: item.email || '',
          alamat: item.alamat || '',
          wilayah: item.wilayah || null,"""
text = text.replace("          nama: item.nama || '',\n          slug: item.slug || '',\n          wilayah: item.wilayah || null,", fill_fields)

submit_fields = """        nama: formData.nama.trim(),
        slug: formData.slug.trim(),
        jenis: formData.jenis,
        telepon: formData.telepon,
        website: formData.website,
        email: formData.email,
        alamat: formData.alamat,
        wilayah: formData.wilayah,"""
text = text.replace("        nama: formData.nama.trim(),\n        slug: formData.slug.trim(),\n        wilayah: formData.wilayah,", submit_fields)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
