import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# 1. Remove the native alert() for required fields
text = re.sub(r'\s*alert\(\'.*?wajib diisi\'\)\n', '\n', text)

# 2. Inject confirmation logic before saving
old_save_logic = """    setSaving(true)
    try {
      const payload = {"""

new_save_logic = """    // Check empty optional fields
    const emptyFields = []
    if (!formData.pengelola) emptyFields.push('Pengelola')
    if (!formData.status) emptyFields.push('Status')
    if (!formData.tahun_operasi) emptyFields.push('Tahun Operasi')
    if (!formData.latitude || !formData.longitude) emptyFields.push('Titik Koordinat')
    if (!formData.deskripsi_profil) emptyFields.push('Profil Kawasan')
    
    if (emptyFields.length > 0) {
      const proceed = window.confirm(`Data berikut belum diisi:\\n- ${emptyFields.join('\\n- ')}\\n\\nTetap simpan?`)
      if (!proceed) return
    }

    setSaving(true)
    try {
      const payload = {"""

text = text.replace(old_save_logic, new_save_logic)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
