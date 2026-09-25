import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

text = re.sub(r'\s*toast\.success\(`Fasilitas.*?ditambahkan ke formulir`\)', '', text)
text = re.sub(r'\s*toast\.success\(`Tema riset.*?ditambahkan ke formulir`\)', '', text)
text = re.sub(r'\s*toast\.success\(`Pilar dampak.*?ditambahkan ke formulir`\)', '', text)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
print("Done")
