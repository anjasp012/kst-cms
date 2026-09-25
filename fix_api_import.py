import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

text = text.replace("import { \n  fetchKST,", "import { \n  request,\n  API_BASE,\n  fetchKST,")
if "request," not in text:
    text = text.replace("import {", "import { request, API_BASE,", 1)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
