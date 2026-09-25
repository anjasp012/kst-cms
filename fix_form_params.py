import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

old_id = """  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)"""

new_id = """  const navigate = useNavigate()
  // const { id } = useParams() // Doesn't work because App.jsx uses /*
  const location = window.location.pathname;
  const match = location.match(/\\/kst\\/edit\\/([^/]+)/);
  const id = match ? match[1] : null;
  const isEdit = Boolean(id);"""

text = text.replace(old_id, new_id)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
