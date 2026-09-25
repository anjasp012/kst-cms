import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# 1. Remove from payload creation
text = re.sub(r'        fokus_utama: .*?,\n', '', text)
text = re.sub(r'        terhubung_dengan: formData\.terhubung_dengan \? formData\.terhubung_dengan\.trim\(\) : null,\n', '', text)

# 2. Rename `bidang` to `tema` in toggle and payload
text = text.replace("temaRiset.bidang", "temaRiset.tema")
text = text.replace("riset: formData.riset.filter(r => r.judul.trim()),", "riset: formData.riset.filter(r => r.judul.trim()),") # not needed, it's just passing it
# Actually the payload for riset is just formData.riset, so changing the state is enough.
text = text.replace("r.bidang", "r.tema")
text = text.replace("{ bidang: '', ", "{ tema: '', ")
text = text.replace("bidang: ''", "tema: ''")
text = text.replace("bidang:", "tema:")


# 3. Remove from UI Profil Kawasan
target_fokus = """            <div className="space-y-3">
              <div>
                <Label className="text-xs">Fokus / Tema Riset (Pilih dari Master)</Label>
                <p className="text-[11px] text-zinc-500 mb-2">Tema riset utama yang mendominasi kawasan ini.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {masterThemes.map((tema, idx) => {
                  const currentThemes = Array.isArray(formData.fokus_utama) ? formData.fokus_utama : []
                  const isActive = currentThemes.includes(tema.nama)
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleTemaRiset(tema.nama)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        isActive 
                          ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-blue-300'
                      }`}
                    >
                      {tema.nama}
                    </button>
                  )
                })}
              </div>
            </div>"""

target_terhubung = """            <div className="space-y-1.5">
              <Label className="text-xs">Terhubung Dengan (Ekosistem)</Label>
              <Input
                value={formData.terhubung_dengan || ''}
                onChange={(e) => setFormData({ ...formData, terhubung_dengan: e.target.value })}
                placeholder="Misal: Peneliti BRIN, Kampus ITB, Industri Swasta"
                className="h-9 text-xs"
              />
            </div>"""

if target_fokus in text:
    text = text.replace(target_fokus, "")
else:
    # Try regex
    text = re.sub(r'\s*<div className="space-y-3">\s*<div>\s*<Label className="text-xs">Fokus.*?</div>\s*</div>\s*</div>', '', text, flags=re.DOTALL)

if target_terhubung in text:
    text = text.replace(target_terhubung, "")

# 4. Rename Bidang to Tema in Riset UI
text = text.replace('<Label className="text-xs">Bidang Riset</Label>', '<Label className="text-xs">Tema Riset</Label>')
text = text.replace('placeholder="Misal: Energi Baru Terbarukan"', 'placeholder="Misal: Energi Baru Terbarukan"')

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)

print("Done")
