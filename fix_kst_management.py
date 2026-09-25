import re

with open("src/components/KSTManagementView.jsx", "r") as f:
    text = f.read()

# Remove state
text = re.sub(r'\s*const \[selectedWilayah, setSelectedWilayah\] = useState\(\'ALL\'\)\n', '\n', text)
text = re.sub(r'\s*const wilayahList = \[\'ALL\', \'Sumatera\', \'Jawa\', \'Kalimantan\', \'Sulawesi\', \'Nusa Tenggara\', \'Maluku & Papua\'\]\n', '\n', text)

# Remove logic from filtered useMemo
old_memo = """  const filtered = useMemo(() => {
    return locations.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.kota_provinsi.toLowerCase().includes(search.toLowerCase()) ||
        (item.fokus_utama || []).some(f => f.toLowerCase().includes(search.toLowerCase()))

      const matchWilayah = selectedWilayah === 'ALL' || item.wilayah.toLowerCase() === selectedWilayah.toLowerCase()

      return matchSearch && matchWilayah
    })
  }, [locations, search, selectedWilayah])"""

new_memo = """  const filtered = useMemo(() => {
    return locations.filter((item) => {
      return item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.kota_provinsi.toLowerCase().includes(search.toLowerCase()) ||
        (item.fokus_utama || []).some(f => f.toLowerCase().includes(search.toLowerCase()))
    })
  }, [locations, search])"""

text = text.replace(old_memo, new_memo)

# Remove UI Wilayah Filter Pills
ui_pills = r'\s*\{\/\* Wilayah Filter Pills \*\/\}\n\s*<div className="flex items-center gap-1\.5 overflow-x-auto w-full pb-1">\n\s*\{wilayahList\.map\(\(w\) => \(\n\s*<button.*?<\/button>\n\s*\)\)\}\n\s*<\/div>'
text = re.sub(ui_pills, '', text, flags=re.DOTALL)

with open("src/components/KSTManagementView.jsx", "w") as f:
    f.write(text)
