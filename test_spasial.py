import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

header = r'<h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Identitas, Wilayah Administratif & Titik Koordinat</h3>\n          </div>'

thumb_regex = r'(          {/\* FOTO SAMPUL / THUMBNAIL \*/}.*?          </div>\n          </div>)'
thumb_match = re.search(thumb_regex, text, flags=re.DOTALL)
thumb = thumb_match.group(1)
text = text.replace(thumb, '')
thumb_adjusted = thumb.replace('pt-2 border-t', 'pb-4 border-b').replace('FOTO SAMPUL / THUMBNAIL', '1. FOTO SAMPUL / THUMBNAIL')

# Put thumbnail right after header
text = text.replace(header, header + "\n\n" + thumb_adjusted)

# Now Wilayah and Coordinate Picker. They are inside grid or outside?
# Wilayah is inside the grid: `<div className="md:col-span-2 p-4...`
# Coordinate is OUTSIDE the grid: `{/* PEMILIH KOORDINAT PETA OPENSTREETMAP */}`

wilayah_regex = r'(            {/\* INTEGRASI API WILAYAH INDONESIA \*/}.*?              \n            </div>)'
wilayah_match = re.search(wilayah_regex, text, flags=re.DOTALL)
if not wilayah_match:
    wilayah_match = re.search(r'(            {/\* INTEGRASI API WILAYAH INDONESIA \*/}.*?            </div>\n\n            <div className="space-y-1\.5">)', text, flags=re.DOTALL)
wilayah = wilayah_match.group(1).replace('            <div className="space-y-1.5">', '')
text = text.replace(wilayah, '')

# We will append Wilayah to the end of the Grid block? No, outside the grid block, right before CoordinatePicker.
coord_regex = r'          {/\* PEMILIH KOORDINAT PETA OPENSTREETMAP \*/}'
new_coord_block = wilayah.replace('md:col-span-2 ', '') + "\n\n          {/* PEMILIH KOORDINAT PETA OPENSTREETMAP */}"
text = text.replace(coord_regex, new_coord_block)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
print("Done")
