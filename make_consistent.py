import re

with open("src/components/CategoryManagementView.jsx", "r") as f:
    text = f.read()

# Replace h2 with consistent h1 styling
old_h2 = r'<h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">\s*Daftar Master \{config\.label\}\s*</h2>'
new_h1 = '<h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center">\n              Master Data &mdash; {config.label}\n            </h1>'
text = re.sub(old_h2, new_h1, text)

with open("src/components/CategoryManagementView.jsx", "w") as f:
    f.write(text)

with open("src/components/WilayahManagementView.jsx", "r") as f:
    text = f.read()

old_h1_wilayah = r'<h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center">\s*Master Wilayah Indonesia\s*</h1>'
new_h1_wilayah = '<h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center">\n            Master Data &mdash; Wilayah Indonesia\n          </h1>'
text = re.sub(old_h1_wilayah, new_h1_wilayah, text)

with open("src/components/WilayahManagementView.jsx", "w") as f:
    f.write(text)
