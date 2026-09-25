import re

with open("src/components/KSTManagementView.jsx", "r") as f:
    text = f.read()

replacement = """      {/* MAP DISPLAY */}
      <MapDisplay locations={filtered} />

      {/* Locations Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">"""

text = text.replace('      {/* Locations Table */}\n      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">', replacement)

with open("src/components/KSTManagementView.jsx", "w") as f:
    f.write(text)
