import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

text = text.replace("potensi_kolaborasi: ['Industri', 'Akademisi', 'Pemerintah', 'Komunitas'],\n    daftar_kolaborasi: []", "potensi_kolaborasi: [],\n    daftar_kolaborasi: []")

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
