import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

def replace_toast(match):
    msg = match.group(1)
    return f"toast.error({msg})\n      alert({msg})\n      return"

text = re.sub(r'toast\.error\((.*?)\)\n\s*return', replace_toast, text)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
