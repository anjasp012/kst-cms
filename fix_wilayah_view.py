import re

with open("src/components/WilayahManagementView.jsx", "r") as f:
    text = f.read()

text = re.sub(r'\s*<Globe2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />', '', text)
text = re.sub(r'\s*<p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">\n\s*Data referensi resmi Provinsi dan Kabupaten/Kota di Indonesia\.\n\s*</p>', '', text)

# Also fix the gap-2.5 on the h1 if needed, but flex gap-2.5 is fine, it will just space nothing if there's no icon. Let's leave it or remove it.
text = text.replace('flex items-center gap-2.5', 'flex items-center')

with open("src/components/WilayahManagementView.jsx", "w") as f:
    f.write(text)
