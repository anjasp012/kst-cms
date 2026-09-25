import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

target = """            <div className="space-y-1.5">
              <Label className="text-xs">Wilayah Utama BRIN</Label>
              <select
                value={formData.wilayah}
                onChange={(e) => setFormData({ ...formData, wilayah: e.target.value })}
                className="w-full h-9 px-3 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-semibold"
              >
              <option value="Sumatera">Sumatera</option>
              <option value="Jawa">Jawa</option>
              <option value="Kalimantan">Kalimantan</option>
              <option value="Sulawesi">Sulawesi</option>
              <option value="Nusa Tenggara">Nusa Tenggara</option>
              <option value="Maluku & Papua">Maluku & Papua</option>
              </select>
          </div>"""

if target in text:
    text = text.replace(target, "")
    with open("src/components/KSTFormPage.jsx", "w") as f:
        f.write(text)
    print("Deleted")
else:
    print("Not found")
