import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

old_select = """              <select
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
              >
                <option value="KST">Kawasan Sains (KST)</option>
                <option value="BRIDA">BRIDA</option>
                <option value="BAPPERIDA">BAPPERIDA</option>
                <option value="BAPPEDA">BAPPEDA</option>
              </select>"""

new_input = """              <Input
                list="jenis-instansi-list"
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                placeholder="Pilih atau ketik jenis instansi..."
                className="h-9 text-xs w-full bg-white dark:bg-zinc-950"
              />
              <datalist id="jenis-instansi-list">
                <option value="KST" />
                <option value="BRIDA" />
                <option value="BAPPERIDA" />
                <option value="BAPPEDA" />
              </datalist>"""

text = text.replace(old_select, new_input)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
