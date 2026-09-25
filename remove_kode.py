import re

with open("src/components/WilayahManagementView.jsx", "r") as f:
    text = f.read()

# Remove Province Kode Header & Cell
text = re.sub(r'\s*<th className="py-3 px-4 w-28 font-mono">KODE KEMENDAGRI</th>', '', text)
text = re.sub(r'\s*<td className="py-3 px-4 font-mono font-semibold text-zinc-700 dark:text-zinc-300">\s*\{prov\.kode\}\s*</td>', '', text)

# Remove Regency Kode Header & Cell
text = re.sub(r'\s*<th className="py-3 px-4 w-24 font-mono">KODE</th>', '', text)
text = re.sub(r'\s*<td className="py-3 px-4 font-mono font-semibold text-zinc-700 dark:text-zinc-300">\s*\{reg\.kode\}\s*</td>', '', text)


with open("src/components/WilayahManagementView.jsx", "w") as f:
    f.write(text)
