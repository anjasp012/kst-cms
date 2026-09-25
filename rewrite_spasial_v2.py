import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Match the whole spasial tab block
spasial_regex = r'(\{/\* TAB 1: SPASIAL & INFORMASI UMUM \*/\}.*?\{/\* TAB 2: PROFIL KAWASAN \*/\})'
spasial_match = re.search(spasial_regex, text, flags=re.DOTALL)
if not spasial_match:
    print("Could not find spasial block!")
    exit(1)

original_spasial = spasial_match.group(1)
spasial_tab = original_spasial

# Extract Thumbnail
thumb_match = re.search(r'(          {/\* FOTO SAMPUL / THUMBNAIL \*/}.*?          </div>\n          </div>\n)', spasial_tab, flags=re.DOTALL)
if not thumb_match:
    print("Could not find thumbnail!")
    exit(1)
thumb = thumb_match.group(1)
spasial_tab = spasial_tab.replace(thumb, '')

# Extract Coordinate Picker
coord_match = re.search(r'(          {/\* PEMILIH KOORDINAT PETA OPENSTREETMAP \*/}.*?          </div>\n          </div>\n)', spasial_tab, flags=re.DOTALL)
if not coord_match:
    print("Could not find coordinate picker!")
    exit(1)
coord = coord_match.group(1)
spasial_tab = spasial_tab.replace(coord, '')

# Extract Wilayah
wilayah_match = re.search(r'(            {/\* INTEGRASI API WILAYAH INDONESIA \*/}.*?            </div>\n\n            <div className="space-y-1\.5">)', spasial_tab, flags=re.DOTALL)
if not wilayah_match:
    print("Could not find wilayah!")
    exit(1)
wilayah = wilayah_match.group(1).replace('            <div className="space-y-1.5">', '')
spasial_tab = spasial_tab.replace(wilayah, '')

header_end = r'            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Identitas, Wilayah Administratif & Titik Koordinat</h3>\n          </div>\n'
thumb_adjusted = thumb.replace('pt-2 border-t border-zinc-200 dark:border-zinc-800', 'pb-4 border-b border-zinc-200 dark:border-zinc-800')

spasial_tab_split = spasial_tab.split('          </div>\n\n        </Card>\n')
grid_and_header = spasial_tab_split[0]
grid_and_header = grid_and_header.replace(header_end, header_end + "\n" + thumb_adjusted + "\n")

# Put Wilayah inside the Card, after Grid
new_spasial = grid_and_header + "          </div>\n\n" + wilayah + "\n" + coord + "\n        </Card>\n      )}\n\n      {/* TAB 2: PROFIL KAWASAN */}"

text = text.replace(original_spasial, new_spasial)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
print("Success")
