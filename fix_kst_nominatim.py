import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

old_regency = """  const handleRegencyChange = (regId) => {
    setSelectedRegencyId(regId)
    if (!regId) return

    const regObj = regencies.find(r => r.id === regId || r.kode === regId)
    const provObj = provinces.find(p => p.id === selectedProvinceId || p.kode === selectedProvinceId)

    if (regObj && provObj) {
      const regName = regObj.nama || regObj.name
      const provName = provObj.nama || provObj.name
      const formatted = `${formatCityName(regName)}, ${formatProvinceName(provName)}`
      setFormData(prev => ({
        ...prev,
        kota_provinsi: formatted
      }))
    }
  }"""

new_regency = """  const handleRegencyChange = async (regId) => {
    setSelectedRegencyId(regId)
    if (!regId) return

    const regObj = regencies.find(r => r.id === regId || r.kode === regId)
    const provObj = provinces.find(p => p.id === selectedProvinceId || p.kode === selectedProvinceId)

    if (regObj && provObj) {
      const regName = regObj.nama || regObj.name
      const provName = provObj.nama || provObj.name
      const formatted = `${formatCityName(regName)}, ${formatProvinceName(provName)}`
      setFormData(prev => ({
        ...prev,
        kota_provinsi: formatted
      }))

      // Auto-fetch coordinates from Nominatim
      try {
        const query = encodeURIComponent(`${formatCityName(regName)}, ${formatProvinceName(provName)}, Indonesia`)
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`)
        const data = await res.json()
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat)
          const lon = parseFloat(data[0].lon)
          setFormData(prev => ({
            ...prev,
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lon.toFixed(6))
          }))
        }
      } catch (err) {
        console.error('Failed to auto-fetch coordinates for city', err)
      }
    }
  }"""

text = text.replace(old_regency, new_regency)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
