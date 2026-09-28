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
  if (provincesCache) return provincesCache

  try {
    const res = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
    if (!res.ok) throw new Error('Gagal memuat data provinsi dari API')
    const data = await res.json()
    provincesCache = data
    return data
  } catch (err) {
    console.error('Error fetching provinces from API, fallback to local:', err)
    try {
      const resLocal = await fetch(`${API_BASE}/admin/wilayah/provinsi`)
      if (resLocal.ok) return await resLocal.json()
    } catch (_) {}
    return []
  }
}

export async function fetchRegencies(provinceId) {
  if (!provinceId) return []
  if (regenciesCache[provinceId]) return regenciesCache[provinceId]

  try {
    const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`)
    if (!res.ok) throw new Error('Gagal memuat data kota/kabupaten dari API')
    const data = await res.json()
    regenciesCache[provinceId] = data
    return data
  } catch (err) {
    console.error(`Error fetching regencies for province ${provinceId}:`, err)
    try {
      const resLocal = await fetch(`${API_BASE}/admin/wilayah/kabupaten-kota?province_kode=${encodeURIComponent(provinceId)}`)
      if (resLocal.ok) return await resLocal.json()
    } catch (_) {}
    return []
  }
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
