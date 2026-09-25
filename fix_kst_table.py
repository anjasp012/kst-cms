import re

with open("src/components/KSTManagementView.jsx", "r") as f:
    text = f.read()

text = text.replace("item.fokus_utama", "item.tema_riset")
text = text.replace("Fokus Utama", "Tema Riset")

with open("src/components/KSTManagementView.jsx", "w") as f:
    f.write(text)
print("Done")
