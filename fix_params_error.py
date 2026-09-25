import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

target = """  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)"""

replacement = """  const navigate = useNavigate()
  const location = useLocation()
  const match = location.pathname.match(/\\/kst\\/edit\\/([^/]+)/);
  const id = match ? match[1] : null;
  const isEdit = Boolean(id)"""

text = text.replace(target, replacement)

# Make sure useLocation is imported
if "useLocation" not in text:
    text = text.replace("import { useNavigate }", "import { useNavigate, useLocation }")

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
print("Done")
