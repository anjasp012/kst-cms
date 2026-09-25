import re
with open("src/components/CategoryManagementView.jsx", "r") as f:
    text = f.read()

text = re.sub(r'\s*wilayah: \{\s*label: \'Wilayah\',.*?\s*\},', '', text, flags=re.DOTALL)

with open("src/components/CategoryManagementView.jsx", "w") as f:
    f.write(text)
