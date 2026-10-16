/**
 * Helper API Wilayah Indonesia (Lokal Database KST & Kemendagri 2025/2026)
 * Menyediakan data resmi 38 Provinsi dan 514 Kota/Kabupaten di Indonesia
 * langsung dari database internal PostgreSQL (kst_provinsi & kst_kabupaten_kota).
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

// Cache in-memory agar pergantian pilihan instan tanpa re-fetch
let provincesCache = null
const regenciesCache = {}

export async function fetchProvinces() {
  if (provincesCache && provincesCache.length > 0) return provincesCache

  try {
    const token = localStorage.getItem('kst_jwt')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    const res = await fetch(`${API_BASE}/admin/wilayah/provinsi`, { headers })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        provincesCache = data
        return data
      }
    }
  } catch (err) {
    console.error('Error fetching provinces from local database:', err)
  }
  return []
}

export async function fetchRegencies(provinceId) {
  if (!provinceId) return []
  if (regenciesCache[provinceId] && regenciesCache[provinceId].length > 0) {
    return regenciesCache[provinceId]
  }

  try {
    const token = localStorage.getItem('kst_jwt')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    const res = await fetch(`${API_BASE}/admin/wilayah/kabupaten-kota?province_kode=${encodeURIComponent(provinceId)}`, { headers })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        regenciesCache[provinceId] = data
        return data
      }
    }
  } catch (err) {
    console.error(`Error fetching regencies for province ${provinceId}:`, err)
  }
  return []
}

export const fetchProvinsi = fetchProvinces
export const fetchKabupatenKota = fetchRegencies

/**
 * Mapping otomatis Nama / Kode Provinsi ke Wilayah Utama BRIN
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
 * Mengubah nama resmi ALL-CAPS / Title Case (cth: "KABUPATEN BOGOR", "Kota Bandung")
 * menjadi format rapi ("Kab. Bogor", "Kota Bandung")
 */
export function formatCityName(name = '') {
  if (!name) return ''
  return name
    .replace(/\bkabupaten\b/gi, 'Kab.')
    .replace(/\bkota\b/gi, 'Kota')
    .split(' ')
    .map(word => {
      if (word.startsWith('Kab.') || word === 'Kota') return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
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

/**
 * Koordinat & Zoom Level Resmi 38 Provinsi Indonesia
 */
export const PROVINCE_COORDINATES = {
  // Sumatera
  '11': { nama: 'ACEH', lat: 4.695135, lng: 96.749399, zoom: 8 },
  '12': { nama: 'SUMATERA UTARA', lat: 2.115355, lng: 99.545097, zoom: 8 },
  '13': { nama: 'SUMATERA BARAT', lat: -0.73994, lng: 100.800005, zoom: 8 },
  '14': { nama: 'RIAU', lat: 0.293347, lng: 101.706825, zoom: 8 },
  '15': { nama: 'JAMBI', lat: -1.610123, lng: 103.61312, zoom: 8 },
  '16': { nama: 'SUMATERA SELATAN', lat: -3.319437, lng: 104.914398, zoom: 8 },
  '17': { nama: 'BENGKULU', lat: -3.577847, lng: 102.346388, zoom: 8 },
  '18': { nama: 'LAMPUNG', lat: -4.558585, lng: 105.406808, zoom: 8 },
  '19': { nama: 'KEPULAUAN BANGKA BELITUNG', lat: -2.741051, lng: 106.440587, zoom: 8 },
  '21': { nama: 'KEPULAUAN RIAU', lat: 3.945651, lng: 108.142867, zoom: 7 },
  // Jawa
  '31': { nama: 'DKI JAKARTA', lat: -6.208763, lng: 106.845599, zoom: 11 },
  '32': { nama: 'JAWA BARAT', lat: -6.914744, lng: 107.609811, zoom: 9 },
  '33': { nama: 'JAWA TENGAH', lat: -7.150975, lng: 110.140259, zoom: 9 },
  '34': { nama: 'DI YOGYAKARTA', lat: -7.875385, lng: 110.426209, zoom: 10 },
  '35': { nama: 'JAWA TIMUR', lat: -7.536064, lng: 112.238402, zoom: 8 },
  '36': { nama: 'BANTEN', lat: -6.405817, lng: 106.064018, zoom: 9 },
  // Bali & Nusa Tenggara
  '51': { nama: 'BALI', lat: -8.409518, lng: 115.188916, zoom: 10 },
  '52': { nama: 'NUSA TENGGARA BARAT', lat: -8.652933, lng: 117.361648, zoom: 9 },
  '53': { nama: 'NUSA TENGGARA TIMUR', lat: -8.657382, lng: 121.079371, zoom: 8 },
  // Kalimantan
  '61': { nama: 'KALIMANTAN BARAT', lat: -0.278781, lng: 111.475285, zoom: 7 },
  '62': { nama: 'KALIMANTAN TENGAH', lat: -1.681488, lng: 113.382355, zoom: 7 },
  '63': { nama: 'KALIMANTAN SELATAN', lat: -3.092642, lng: 115.283759, zoom: 8 },
  '64': { nama: 'KALIMANTAN TIMUR', lat: 0.538659, lng: 116.419389, zoom: 7 },
  '65': { nama: 'KALIMANTAN UTARA', lat: 3.073093, lng: 116.04139, zoom: 7 },
  // Sulawesi
  '71': { nama: 'SULAWESI UTARA', lat: 0.624693, lng: 123.975002, zoom: 8 },
  '72': { nama: 'SULAWESI TENGAH', lat: -1.430025, lng: 121.445618, zoom: 7 },
  '73': { nama: 'SULAWESI SELATAN', lat: -3.668799, lng: 119.974053, zoom: 8 },
  '74': { nama: 'SULAWESI TENGGARA', lat: -4.14491, lng: 122.174605, zoom: 8 },
  '75': { nama: 'GORONTALO', lat: 0.699937, lng: 122.446724, zoom: 9 },
  '76': { nama: 'SULAWESI BARAT', lat: -2.844137, lng: 119.232078, zoom: 8 },
  // Maluku & Papua
  '81': { nama: 'MALUKU', lat: -3.238462, lng: 130.145273, zoom: 7 },
  '82': { nama: 'MALUKU UTARA', lat: 1.570999, lng: 127.808769, zoom: 8 },
  '91': { nama: 'PAPUA BARAT', lat: -1.336115, lng: 133.174716, zoom: 7 },
  '92': { nama: 'PAPUA BARAT DAYA', lat: -1.0827, lng: 131.6094, zoom: 8 },
  '93': { nama: 'PAPUA SELATAN', lat: -7.4705, lng: 139.5722, zoom: 7 },
  '94': { nama: 'PAPUA TENGAH', lat: -3.9749, lng: 136.2337, zoom: 7 },
  '95': { nama: 'PAPUA PEGUNUNGAN', lat: -4.0833, lng: 138.9333, zoom: 8 },
  '96': { nama: 'PAPUA', lat: -4.269928, lng: 138.080353, zoom: 7 },
}

export function getProvinceCoordinates(provKodeOrName) {
  if (!provKodeOrName) return null
  const key = String(provKodeOrName).trim()
  if (PROVINCE_COORDINATES[key]) return PROVINCE_COORDINATES[key]

  const clean = key.toUpperCase().replace(/PROVINSI\s+/g, '').trim()
  for (const code in PROVINCE_COORDINATES) {
    const item = PROVINCE_COORDINATES[code]
    if (clean === item.nama || clean.includes(item.nama) || item.nama.includes(clean)) {
      return item
    }
  }
  return null
}

const cityGeocodeCache = {}

export async function geocodeCity(cityName, provinceName = '') {
  if (!cityName) return null
  const cacheKey = `${cityName}__${provinceName}`.toLowerCase()
  if (cityGeocodeCache[cacheKey]) return cityGeocodeCache[cacheKey]

  const query = `${cityName}, ${provinceName}, Indonesia`.replace(/\s*,\s*,/g, ',').trim()
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=1`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const result = {
          lat: Number(parseFloat(data[0].lat).toFixed(6)),
          lng: Number(parseFloat(data[0].lon).toFixed(6)),
          zoom: 12
        }
        cityGeocodeCache[cacheKey] = result
        return result
      }
    }
  } catch (err) {
    console.warn('Geocode city error:', err)
  }
  return null
}

