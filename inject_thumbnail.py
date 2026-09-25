import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

thumb_block = """
          {/* FOTO SAMPUL / THUMBNAIL */}
          <div className="space-y-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <Label className="text-xs font-medium">Foto Sampul / Thumbnail</Label>
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                {formData.thumbnail_url ? (
                  <img
                    src={getImageUrl(formData.thumbnail_url)}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-zinc-400" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="/uploads/kst-jabar.jpg"
                    className="h-9 text-xs font-mono flex-1"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button type="button" variant="secondary" className="h-9 text-xs gap-1.5" disabled={uploading}>
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Unggah</span>
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400">Pilih berkas JPG/PNG untuk cover KST yang muncul pada preview peta dan kartu drawer.</p>
              </div>
            </div>
          </div>
"""

header_regex = r'(<h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Identitas, Wilayah Administratif & Titik Koordinat</h3>\s*</div>)'

text = re.sub(header_regex, r'\1' + thumb_block.replace('\\', '\\\\'), text)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
