/**
 * Helper API Wilayah Indonesia (EMSifa API / Kemendagri Open Data)
 * Menyediakan data resmi 38 Provinsi dan 514 Kota/Kabupaten di Indonesia.
 */

// Cache in-memory
let provincesCache = null
const regenciesCache = {}

export async function fetchProvinces() {
  if (provincesCache) return provincesCache

  try {
    const res = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
    if (!res.ok) throw new Error('Gagal memuat data provinsi')
    const data = await res.json()
    provincesCache = data
    return data
  } catch (err) {
    console.error('Error fetching provinces:', err)
    return []
  }
}

export async function fetchRegencies(provinceId) {
  if (!provinceId) return []
  if (regenciesCache[provinceId]) return regenciesCache[provinceId]

  try {
    const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`)
    if (!res.ok) throw new Error('Gagal memuat data kota/kabupaten')
    const data = await res.json()
    regenciesCache[provinceId] = data
    return data
  } catch (err) {
    console.error(`Error fetching regencies for province ${provinceId}:`, err)
    return []
  }
}

/**
 * Mapping otomatis Nama Provinsi ke Wilayah Utama BRIN
 * (Sumatera, Jawa, Kalimantan, Sulawesi, Nusa Tenggara, Maluku & Papua)
 */
export function mapProvinceToWilayah(provinceName = '') {
  const p = provinceName.toUpperCase()

  if (
    p.includes('ACEH') ||
    p.includes('SUMATERA') ||
    p.includes('RIAU') ||
    p.includes('JAMBI') ||
    p.includes('BENGKULU') ||
    p.includes('LAMPUNG') ||
    p.includes('BANGKA')
  ) {
    return 'Sumatera'
  }

  if (
    p.includes('JAKARTA') ||
    p.includes('JAWA') ||
    p.includes('BANTEN') ||
    p.includes('YOGYAKARTA')
  ) {
    return 'Jawa'
  }

  if (p.includes('KALIMANTAN')) {
    return 'Kalimantan'
  }

  if (
    p.includes('SULAWESI') ||
    p.includes('GORONTALO')
  ) {
    return 'Sulawesi'
  }

  if (
    p.includes('BALI') ||
    p.includes('NUSA TENGGARA')
  ) {
    return 'Nusa Tenggara'
  }

  if (
    p.includes('MALUKU') ||
    p.includes('PAPUA')
  ) {
    return 'Maluku & Papua'
  }

  return 'Jawa'
}

/**
 * Mengubah nama resmi ALL-CAPS (cth: "KABUPATEN BOGOR", "KOTA BANDUNG")
 * menjadi format rapi ("Kab. Bogor", "Kota Bandung")
 */
export function formatCityName(name = '') {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/\bkabupaten\b/gi, 'Kab.')
    .replace(/\bkota\b/gi, 'Kota')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatProvinceName(name = '') {
  if (!name) return ''
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (['dki', 'di'].includes(word)) return word.toUpperCase()
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

