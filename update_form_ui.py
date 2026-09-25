with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

contact_info_ui = """            <div className="space-y-1.5">
              <Label className="text-xs">Jenis Instansi *</Label>
              <select
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
              >
                <option value="KST">Kawasan Sains (KST)</option>
                <option value="BRIDA">BRIDA</option>
                <option value="BAPPERIDA">BAPPERIDA</option>
                <option value="BAPPEDA">BAPPEDA</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Telepon</Label>
              <Input
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                placeholder="021-1234567"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@instansi.go.id"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Website</Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://instansi.go.id"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs">Alamat Lengkap</Label>
              <Input
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Jl. Raya No. 123..."
                className="h-9 text-xs"
              />
            </div>

            {/* INTEGRASI API WILAYAH INDONESIA */}"""

text = text.replace("{/* INTEGRASI API WILAYAH INDONESIA */}", contact_info_ui)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
