import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

text = text.replace('<Label className="text-xs font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">\n                  <Map className="w-3.5 h-3.5 text-zinc-500" />\n                  <span>Pilihan Kota / Kabupaten (API Kemendagri)</span>\n                </Label>', '<Label className="text-xs font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">\n                  <Map className="w-3.5 h-3.5 text-zinc-500" />\n                  <span>Pilihan Kota / Kabupaten (API Kemendagri) *</span>\n                </Label>')
text = text.replace('<span>Input Manual Nama Kota / Kabupaten</span>', '<span>Input Manual Nama Kota / Kabupaten *</span>')

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
