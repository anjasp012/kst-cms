import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

text = text.replace('Pilih Kota / Kabupaten {loadingWilayah && \'(Memuat...)\'}', 'Pilih Kota / Kabupaten * {loadingWilayah && \'(Memuat...)\'}')
text = text.replace('<Label className="text-[11px] text-zinc-500">Kota / Kabupaten & Provinsi (Input Manual)</Label>', '<Label className="text-[11px] text-zinc-500">Kota / Kabupaten & Provinsi (Input Manual) *</Label>')

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
