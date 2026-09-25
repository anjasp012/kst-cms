import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# 1. Ensure `fetchInstansi` is imported
if "fetchInstansi" not in text:
    text = text.replace("fetchWilayahZones,", "fetchWilayahZones,\n  fetchInstansi,")

# 2. Add state for `instansiList`
if "const [instansiList, setInstansiList] = useState([])" not in text:
    target_state = "const [provinces, setProvinces] = useState([])"
    replacement_state = "const [provinces, setProvinces] = useState([])\n  const [instansiList, setInstansiList] = useState([])"
    text = text.replace(target_state, replacement_state)

# 3. Add fetch logic in `loadMasterData`
target_fetch = """const data = await fetchProvinces()
      setProvinces(data)"""

replacement_fetch = """const [provs, instansis] = await Promise.all([
        fetchProvinces(),
        request(`${API_BASE}/kst/instansi`)
      ])
      setProvinces(provs)
      setInstansiList(instansis)"""

if "fetchProvinces()" in text and "setProvinces(data)" in text:
    text = text.replace(target_fetch, replacement_fetch)

# If it didn't find the exact target_fetch, try regex
elif "setInstansiList(instansis)" not in text:
    # Just replace the loadMasterData body manually
    text = re.sub(r'const data = await fetchProvinces\(\)\n\s*setProvinces\(data\)', replacement_fetch, text)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
print("Done")
