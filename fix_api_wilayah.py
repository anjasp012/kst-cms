import re

with open("src/lib/api.js", "r") as f:
    text = f.read()

text = re.sub(r'export async function fetchProvinces\(wilayah\) \{.*?\}', 'export async function fetchProvinces() {\n  return request(`${API_BASE}/kst/wilayah/provinces`);\n}', text, flags=re.DOTALL)

with open("src/lib/api.js", "w") as f:
    f.write(text)
