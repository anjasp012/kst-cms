import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

wilayah_block = """
          {/* INTEGRASI API WILAYAH INDONESIA */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Wilayah Administratif
                </span>
              </div>
              <button
                type="button"
                onClick={() => setManualKotaInput(!manualKotaInput)}
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 underline"
              >
                {manualKotaInput ? 'Gunakan Dropdown API Wilayah' : 'Input Manual Teks'}
              </button>
            </div>

            {!manualKotaInput ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dropdown Provinsi */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-500">Pilih Provinsi</Label>
                  <select
                    value={selectedProvinceId}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full h-8 px-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                  >
                    <option value="">-- Pilih Provinsi (38 Provinsi) --</option>
                    {provinces.map((prov) => {
                      const val = prov.id || prov.kode
                      const label = prov.nama || prov.name
                      return (
                        <option key={val} value={val}>
                          {formatProvinceName(label)}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Dropdown Kota / Kabupaten */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-500">
                    Pilih Kota / Kabupaten * {loadingWilayah && '(Memuat...)'}
                  </Label>
                  <select
                    value={selectedRegencyId}
                    onChange={(e) => handleRegencyChange(e.target.value)}
                    disabled={!selectedProvinceId || loadingWilayah}
                    className="w-full h-8 px-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs disabled:opacity-50"
                  >
                    <option value="">-- Pilih Kota/Kabupaten --</option>
                    {regencies.map((reg) => {
                      const val = reg.id || reg.kode
                      const label = reg.nama || reg.name
                      return (
                        <option key={val} value={val}>
                          {formatCityName(label)}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Hasil Format Kota & Provinsi */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-500">Format Kota & Provinsi</Label>
                  <Input
                    value={formData.kota_provinsi}
                    onChange={(e) => setFormData({ ...formData, kota_provinsi: e.target.value })}
                    placeholder="Bandung, Jawa Barat"
                    className="h-8 text-xs bg-white dark:bg-zinc-900 font-medium"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Label className="text-[11px] text-zinc-500">Kota / Kabupaten & Provinsi (Input Manual) *</Label>
                <Input
                  value={formData.kota_provinsi}
                  onChange={(e) => setFormData({ ...formData, kota_provinsi: e.target.value })}
                  placeholder="Contoh: Bandung, Jawa Barat"
                  className="h-8 text-xs bg-white dark:bg-zinc-900"
                />
              </div>
            )}
          </div>
"""

coord_target = r'          {/\* PEMILIH KOORDINAT PETA OPENSTREETMAP \*/}'
text = text.replace(coord_target, wilayah_block + '\n' + coord_target)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
