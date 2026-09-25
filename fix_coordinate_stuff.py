import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Fix Nominatim Query
old_query = "const query = encodeURIComponent(`${formatCityName(regName)}, ${formatProvinceName(provName)}, Indonesia`)"
new_query = "const query = encodeURIComponent(`${regName}, ${provName}, Indonesia`)"
text = text.replace(old_query, new_query)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)


with open("src/components/ui/CoordinatePicker.jsx", "r") as f:
    text_picker = f.read()

# Remove the Free Search Box UI
target_search_ui = """      {/* Free Search Box (Nominatim OpenStreetMap) */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              placeholder="Cari lokasi / alamat (misal: Cibinong, Bandung, Medan)..."
              className="pl-8 h-8 text-xs bg-white dark:bg-zinc-900"
            />
          </div>
          <Button
            type="button"
            onClick={handleSearch}
            variant="secondary"
            disabled={searching}
            className="h-8 text-xs px-3"
          >
            {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Cari'}
          </Button>
        </div>

        {/* Dropdown Hasil Pencarian */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-[500] max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            {searchResults.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelectPlace(item)}
                className="w-full text-left p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 transition-colors flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>"""

if target_search_ui in text_picker:
    text_picker = text_picker.replace(target_search_ui, "")

# We can also remove Search state and handleSearch functions from CoordinatePicker.jsx just to keep it clean, but removing the UI is enough.
with open("src/components/ui/CoordinatePicker.jsx", "w") as f:
    f.write(text_picker)

print("Done")
