import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

old_state = """    kota_provinsi: '',
    pengelola: 'BRIN',
    status: 'Aktif',
    tahun_operasi: 2021,"""

new_state = """    kota_provinsi: '',
    pengelola: '',
    status: '',
    tahun_operasi: '',"""

text = text.replace(old_state, new_state)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
