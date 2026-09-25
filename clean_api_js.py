import re

with open("src/lib/api.js", "r") as f:
    text = f.read()

# Remove wilayah_zones API calls
text = re.sub(r'// 🌐 5E\. ZONA WILAYAH \(Tabel terpisah: kst_wilayah\).*?export async function deleteWilayahZone\(id\) \{.*?\n\}\n', '', text, flags=re.DOTALL)

# Remove from backward compatible router
text = re.sub(r'\s*if \(tipe === \'wilayah\'\) return fetchWilayahZones\(includeInactive\);', '', text)
text = re.sub(r'\s*if \(payload\.tipe === \'wilayah\'\) return createWilayahZone\(payload\);', '', text)
text = re.sub(r'\s*if \(tipe === \'wilayah\'\) return updateWilayahZone\(id, payload\);', '', text)
text = re.sub(r'\s*if \(tipe === \'wilayah\'\) return deleteWilayahZone\(id\);', '', text)

with open("src/lib/api.js", "w") as f:
    f.write(text)
