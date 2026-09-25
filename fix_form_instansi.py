import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Replace the select with a datalist input for instansi_nama
old_select = """              <select
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
                value={formData.instansi_id || ''}
                onChange={(e) => setFormData({ ...formData, instansi_id: e.target.value })}
              >
                <option value="" disabled>Pilih Instansi</option>
                {instansiList.map((inst) => (
                  <option key={inst.id} value={inst.id}>{inst.nama}</option>
                ))}
              </select>"""

new_input = """              <Input
                list="instansi-list"
                value={formData.instansi_nama || ''}
                onChange={(e) => setFormData({ ...formData, instansi_nama: e.target.value })}
                placeholder="Pilih atau ketik instansi baru..."
                className="h-9 text-xs w-full bg-white dark:bg-zinc-950"
              />
              <datalist id="instansi-list">
                {instansiList.map((inst) => (
                  <option key={inst.id} value={inst.nama} />
                ))}
              </datalist>"""

text = text.replace(old_select, new_input)
text = text.replace("instansi_id", "instansi_nama")

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
