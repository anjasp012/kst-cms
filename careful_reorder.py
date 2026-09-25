import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# 1. Extract Thumbnail
idx_thumb_start = text.find('          {/* FOTO SAMPUL / THUMBNAIL */}')
idx_thumb_end = text.find('          </div>\n\n          {/* PEMILIH KOORDINAT', idx_thumb_start)
if idx_thumb_end == -1:
    idx_thumb_end = text.find('          </div>\n          </div>\n\n          {/* PEMILIH KOORDINAT', idx_thumb_start) + 17 # length of </div>\n</div>\n
    if text[idx_thumb_end:idx_thumb_end+10] != "          ":
        idx_thumb_end = text.find('          </div>\n', text.find('          </div>\n', idx_thumb_start) + 10) + 11

thumb_block = text[idx_thumb_start:idx_thumb_end]
text = text[:idx_thumb_start] + text[idx_thumb_end:] # remove thumb

# 2. Extract Wilayah
idx_wil_start = text.find('            {/* INTEGRASI API WILAYAH INDONESIA */}')
idx_wil_end = text.find('            <div className="space-y-1.5">\n              <Label className="text-xs">Pengelola Kawasan</Label>', idx_wil_start)
wil_block = text[idx_wil_start:idx_wil_end]
text = text[:idx_wil_start] + text[idx_wil_end:] # remove wilayah

# 3. Insert Wilayah before Coordinate Picker
idx_coord = text.find('          {/* PEMILIH KOORDINAT PETA OPENSTREETMAP */}')
# Make wilayah block full width
wil_block = wil_block.replace('md:col-span-2 p-4', 'p-4').replace('            {/*', '          {/*').replace('              <div', '            <div').replace('                <', '              <').replace('            </div>\n\n', '          </div>\n\n')

# Actually, the simplest way is to put Wilayah block OUTSIDE the grid, just above Coordinate Picker.
# Wait, the coordinate picker is outside the grid.
# The grid ends at `          </div>\n\n          {/* PEMILIH KOORDINAT`
text = text[:idx_coord] + wil_block.replace('md:col-span-2 ', '') + "\n" + text[idx_coord:]

# 4. Insert Thumbnail before the grid
idx_grid = text.find('          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">')
# Adjust thumbnail padding/border
thumb_adjusted = thumb_block.replace('pt-2 border-t', 'pb-4 border-b')
text = text[:idx_grid] + thumb_adjusted + "\n" + text[idx_grid:]


with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
print("Done")
