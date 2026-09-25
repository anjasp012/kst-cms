import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Extract segments
identitas_regex = r'(<div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">.*?<div className="space-y-1\.5 md:col-span-2">\s*<Label className="text-xs">Alamat Lengkap</Label>.*?</div>)'
identitas_match = re.search(identitas_regex, text, flags=re.DOTALL)
identitas_code = identitas_match.group(1)

wilayah_regex = r'(            {/\* INTEGRASI API WILAYAH INDONESIA \*/}.*?            {/\* INFO MANAJEMEN \*/})'
wilayah_match = re.search(wilayah_regex, text, flags=re.DOTALL)
wilayah_code = wilayah_match.group(1).replace('            {/* INFO MANAJEMEN */}', '')

manajemen_regex = r'(            {/\* INFO MANAJEMEN \*/}.*?                />\s*</div>\s*</div>\s*</div>)'
manajemen_match = re.search(manajemen_regex, text, flags=re.DOTALL)
manajemen_code = manajemen_match.group(1)

thumbnail_regex = r'(          {/\* FOTO SAMPUL / THUMBNAIL \*/}.*?          </div>\s*</div>)'
thumbnail_match = re.search(thumbnail_regex, text, flags=re.DOTALL)
thumbnail_code = thumbnail_match.group(1)

# Remove all parts from the original block
text = text.replace(identitas_code, "IDENTITAS_MARKER")
text = text.replace(wilayah_code, "WILAYAH_MARKER")
text = text.replace(manajemen_code, "MANAJEMEN_MARKER")
text = text.replace(thumbnail_code, "THUMBNAIL_MARKER")

# Now replace markers to reorder
# We will just construct the new block

new_block = thumbnail_code.replace('border-t border-zinc-200 dark:border-zinc-800', 'border-b border-zinc-200 dark:border-zinc-800 pb-5') + "\n\n"
new_block += identitas_code + "\n"
new_block += manajemen_code.replace('<div className="md:col-span-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-4">', '<div className="md:col-span-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-4 mt-2">') + "\n"
new_block += wilayah_code + "\n"
new_block += "          </div>\n"

# Remove markers
text = text.replace("IDENTITAS_MARKER", new_block)
text = text.replace("WILAYAH_MARKER", "")
text = text.replace("MANAJEMEN_MARKER", "")
text = text.replace("THUMBNAIL_MARKER", "")

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)

