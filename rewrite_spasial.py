import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Match the whole spasial tab block
spasial_regex = r'(\{/\* TAB 1: SPASIAL & INFORMASI UMUM \*/\}.*?\{/\* TAB 2: PROFIL KAWASAN \*/\})'
spasial_match = re.search(spasial_regex, text, flags=re.DOTALL)
spasial_tab = spasial_match.group(1)

# Extract Thumbnail
thumb_match = re.search(r'(          {/\* FOTO SAMPUL / THUMBNAIL \*/}.*?          </div>\n          </div>\n)', spasial_tab, flags=re.DOTALL)
thumb = thumb_match.group(1)
spasial_tab = spasial_tab.replace(thumb, '')

# Extract Coordinate Picker
coord_match = re.search(r'(          {/\* PEMILIH KOORDINAT PETA OPENSTREETMAP \*/}.*?          </div>\n          </div>\n)', spasial_tab, flags=re.DOTALL)
coord = coord_match.group(1)
spasial_tab = spasial_tab.replace(coord, '')

# Extract Wilayah
wilayah_match = re.search(r'(            {/\* INTEGRASI API WILAYAH INDONESIA \*/}.*?              \n            </div>\n)', spasial_tab, flags=re.DOTALL)
if not wilayah_match:
    wilayah_match = re.search(r'(            {/\* INTEGRASI API WILAYAH INDONESIA \*/}.*?            </div>\n)', spasial_tab, flags=re.DOTALL)
wilayah = wilayah_match.group(1)
spasial_tab = spasial_tab.replace(wilayah, '')

# Now spasial_tab contains the Header + the Grid with Identitas + Pengelola + Status
# Let's rebuild the sequence inside the Card:
# 1. Header
# 2. Thumbnail
# 3. Grid (Identitas + Pengelola)
# 4. Wilayah (we will put it OUTSIDE the grid, or inside a full-width grid block)
# 5. Coordinate

# Actually Wilayah is md:col-span-2, so it can be inside the grid or outside.
# Let's put Thumbnail inside the Card but before the Grid.

header_end = r'            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Identitas, Wilayah Administratif & Titik Koordinat</h3>\n          </div>\n'

# Adjust Thumbnail to not have border-t if it's at the top
thumb_adjusted = thumb.replace('pt-2 border-t border-zinc-200 dark:border-zinc-800', 'pb-4 border-b border-zinc-200 dark:border-zinc-800')

# Place Wilayah outside the grid, just before Coordinate
new_wilayah = wilayah.replace('md:col-span-2', '')

# Remove the grid closing tag from spasial_tab to append Wilayah and Coordinate?
# Or just close the grid, then Wilayah, then Coordinate.
spasial_tab_split = spasial_tab.split('          </div>\n\n        </Card>\n')
grid_and_header = spasial_tab_split[0]

# Add Thumbnail after header
grid_and_header = grid_and_header.replace(header_end, header_end + "\n" + thumb_adjusted + "\n")

# Combine everything
new_spasial = grid_and_header + "\n" + wilayah + "\n" + coord + "\n        </Card>\n      )}\n\n      {/* TAB 2: PROFIL KAWASAN */}"

text = text.replace(spasial_match.group(1), new_spasial)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
