import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

old_defaults = """    thumbnail_url: '',
    latitude: -6.917464,
    longitude: 107.619122,

    // 1. Profil
    deskripsi_profil: '',
    peran_kawasan: '',
    fokus_utama: ['Pangan & Pertanian', 'Energi & Material', 'Teknologi Digital'],
    terhubung_dengan: 'Peneliti, industri, pemerintah, komunitas, dan mitra pendidikan.',"""

new_defaults = """    thumbnail_url: '',
    latitude: '',
    longitude: '',

    // 1. Profil
    deskripsi_profil: '',
    peran_kawasan: '',
    fokus_utama: [],
    terhubung_dengan: '',"""

text = text.replace(old_defaults, new_defaults)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
