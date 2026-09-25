import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

contact_info_ui = """            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
              <Label className="text-xs">Pengelola Kawasan</Label>"""

target = """            <div className="space-y-1.5">
              <Label className="text-xs">Pengelola Kawasan</Label>"""

text = text.replace(target, contact_info_ui)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
