import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

old_payload = """        kota_provinsi: formData.kota_provinsi.trim(),
        pengelola: formData.pengelola.trim() || 'BRIN',
        status: formData.status,
        tahun_operasi: parseInt(formData.tahun_operasi, 10) || 2021,"""

new_payload = """        kota_provinsi: formData.kota_provinsi ? formData.kota_provinsi.trim() : '',
        pengelola: formData.pengelola ? formData.pengelola.trim() : null,
        status: formData.status || null,
        tahun_operasi: formData.tahun_operasi ? parseInt(formData.tahun_operasi, 10) : null,"""

text = text.replace(old_payload, new_payload)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
