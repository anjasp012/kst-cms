import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# I will just write a very robust python replacement that uses regex to find the elements in the raw text, 
# then removes them, and finally injects them at the right spots.

# 1. Grab Wilayah and remove it
wilayah_regex = r'(            {/\* INTEGRASI API WILAYAH INDONESIA \*/}.*?            </div>\n\n            <div className="space-y-1\.5">)'
wilayah_match = re.search(wilayah_regex, text, flags=re.DOTALL)
if wilayah_match:
    wilayah_str = wilayah_match.group(1).replace('            <div className="space-y-1.5">', '')
    text = text.replace(wilayah_str, '')

# 2. Grab Coordinate and replace it with (Wilayah + Coordinate)
coord_regex = r'(          {/\* PEMILIH KOORDINAT PETA OPENSTREETMAP \*/}.*?          </div>\n          </div>)'
coord_match = re.search(coord_regex, text, flags=re.DOTALL)
if coord_match:
    coord_str = coord_match.group(1)
    new_coord_block = wilayah_str.replace('md:col-span-2 ', '') + "\n\n" + coord_str
    text = text.replace(coord_str, new_coord_block)

# 3. Grab Thumbnail and remove it
thumb_regex = r'(          {/\* FOTO SAMPUL / THUMBNAIL \*/}.*?          </div>\n          </div>)'
thumb_match = re.search(thumb_regex, text, flags=re.DOTALL)
if thumb_match:
    thumb_str = thumb_match.group(1)
    text = text.replace(thumb_str, '')
    thumb_adjusted = thumb_str.replace('pt-2 border-t', 'pb-4 border-b').replace('FOTO SAMPUL / THUMBNAIL', 'FOTO SAMPUL / THUMBNAIL')
    
    # Insert Thumbnail right after the header block
    # `<div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">`
    # `<h3 ...>Identitas, ...</h3>`
    # `</div>`
    header_regex = r'(<h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Identitas, Wilayah Administratif & Titik Koordinat</h3>\s*</div>)'
    text = re.sub(header_regex, r'\1\n\n' + thumb_adjusted.replace('\\', '\\\\'), text)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
print("Done")
