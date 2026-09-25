import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

text = re.sub(r'  // To strip out the old block which did setSaving and execute.*?  }', '', text, flags=re.DOTALL)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
