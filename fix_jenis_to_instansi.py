import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Replace Jenis Instansi
old_jenis = """            <div className="space-y-1.5">
              <Label className="text-xs">Jenis Instansi</Label>
              <Input
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
              </datalist>
            </div>"""

new_instansi = """            <div className="space-y-1.5">
              <Label className="text-xs">Jenis Instansi *</Label>
              <div className="relative">
                <Input
                  list="instansi-list"
                  value={formData.instansi_nama || ''}
                  onChange={(e) => setFormData({ ...formData, instansi_nama: e.target.value })}
                  placeholder="Pilih dari daftar atau ketik nama instansi baru..."
                  className="h-9 text-xs w-full bg-white dark:bg-zinc-950"
                  autoComplete="off"
                />
                <datalist id="instansi-list">
                  {instansiList.map((inst) => (
                    <option key={inst.id} value={inst.nama} />
                  ))}
                </datalist>
              </div>
            </div>"""

text = text.replace(old_jenis, new_instansi)

# Also formData.jenis -> formData.instansi_nama in formData initialization
text = text.replace("jenis: ''", "instansi_nama: ''")
text = text.replace("jenis: item.jenis", "instansi_nama: item.instansi_nama")

# Also payload mapping
text = text.replace("jenis: formData.jenis,", "instansi_nama: formData.instansi_nama,")

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
print("Done")
