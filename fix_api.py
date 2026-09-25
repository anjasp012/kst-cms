import re
with open('src/lib/api.js', 'r') as f:
    text = f.read()

bad_block = """export async function fetchProvinces() {
  return request(`${API_BASE}/kst/wilayah/provinces`);
}` : '';
  return request(`${API_BASE}/kst/wilayah/provinces${qs}`);
}"""

good_block = """export async function fetchProvinces() {
  return request(`${API_BASE}/kst/wilayah/provinces`);
}"""

text = text.replace(bad_block, good_block)
with open('src/lib/api.js', 'w') as f:
    f.write(text)
