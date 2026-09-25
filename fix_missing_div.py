import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

target = """                <p className="text-[11px] text-zinc-400">Pilih berkas JPG/PNG untuk cover KST yang muncul pada preview peta dan kartu drawer.</p>
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">"""

replacement = """                <p className="text-[11px] text-zinc-400">Pilih berkas JPG/PNG untuk cover KST yang muncul pada preview peta dan kartu drawer.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">"""

text = text.replace(target, replacement)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
print("Done")
