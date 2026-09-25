import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Add fetchInstansi to imports if not there
if "fetchInstansi" not in text:
    text = text.replace("fetchWilayahZones,", "fetchWilayahZones,\n  fetchInstansi,")

# Add state
if "instansiList" not in text:
    text = re.sub(r'const \[provinces, setProvinces\] = useState\(\[\]\)', 'const [provinces, setProvinces] = useState([])\n  const [instansiList, setInstansiList] = useState([])', text)

# Add fetch call
if "fetchInstansi()" not in text:
    text = re.sub(r'const loadMasterData = async \(\) => \{\n\s*try \{', 'const loadMasterData = async () => {\n    try {\n      const [provs, instansis] = await Promise.all([\n        fetchProvinces(),\n        request(`${API_BASE}/kst/instansi`)\n      ])\n      setProvinces(provs)\n      setInstansiList(instansis)\n', text)
    text = re.sub(r'const data = await fetchProvinces\(\)\n\s*setProvinces\(data\)', '', text) # remove old fetchProvinces

# Replace Jenis Instansi inputs
old_input = """              <Input
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

new_input = """              <select
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
                value={formData.instansi_id || ''}
                onChange={(e) => setFormData({ ...formData, instansi_id: e.target.value })}
              >
                <option value="" disabled>Pilih Instansi</option>
                {instansiList.map((inst) => (
                  <option key={inst.id} value={inst.id}>{inst.nama}</option>
                ))}
              </select>"""

text = text.replace(old_input, new_input)
text = text.replace("formData.jenis", "formData.instansi_id")

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
