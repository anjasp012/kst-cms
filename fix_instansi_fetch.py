import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

target = """    const loadProvinces = async () => {
      const data = await fetchProvinces()
      if (isMounted && Array.isArray(data)) {
        setProvinces(data)
      }
    }
    loadProvinces()"""

replacement = """    const loadProvinces = async () => {
      const [provs, instansis] = await Promise.all([
        fetchProvinces(),
        request(`${API_BASE}/kst/instansi`).catch(() => [])
      ])
      if (isMounted) {
        if (Array.isArray(provs)) setProvinces(provs)
        if (Array.isArray(instansis)) setInstansiList(instansis)
      }
    }
    loadProvinces()"""

text = text.replace(target, replacement)

# ensure request and API_BASE are imported
if "API_BASE" not in text:
    text = text.replace("import { \n  fetchKST,", "import { \n  request,\n  API_BASE,\n  fetchKST,")
elif "request" not in text:
    text = text.replace("fetchKST,", "request,\n  fetchKST,")

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
print("Done")
