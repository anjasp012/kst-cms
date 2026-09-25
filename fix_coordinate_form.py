import re

with open("src/components/ui/CoordinatePicker.jsx", "r") as f:
    text = f.read()

text = text.replace('<form onSubmit={handleSearch} className="flex gap-2">', '<div className="flex gap-2">')
text = text.replace('</form>', '</div>')

old_input = """            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi / alamat (misal: Cibinong, Bandung, Medan)..."
              className="pl-8 h-8 text-xs bg-white dark:bg-zinc-900"
            />"""

new_input = """            <Input
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
            />"""

text = text.replace(old_input, new_input)

with open("src/components/ui/CoordinatePicker.jsx", "w") as f:
    f.write(text)
