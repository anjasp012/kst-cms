import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Remove all `<p className="text-xs text-zinc-500">...</p>` tags
text = re.sub(r'\s*<p className="text-xs text-zinc-500">.*?</p>', '', text)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
