import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

text = re.sub(r'            <p className="text-xs text-zinc-500">.*?</p>\n', '', text)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
