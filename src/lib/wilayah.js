/**
 * Helper API Wilayah Indonesia (Lokal Database KST & Kemendagri 2025/2026)
 * Menyediakan data resmi 38 Provinsi dan 514 Kota/Kabupaten di Indonesia
 * langsung dari database internal PostgreSQL (kst_db) tanpa ketergantungan API pihak ketiga.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8002/api/v1'

// Cache in-memory agar pergantian pilihan instan tanpa re-fetch
let provincesCache = null
const regenciesCache = {}

export async function fetchProvinces() {
  if (provincesCache) return provincesCache

  try {
    const res = await fetch(`${API_BASE}/kst/wilayah/provinces`)
    if (!res.ok) throw new Error('Gagal memuat data provinsi dari database')
    const data = await res.json()
    provincesCache = data
    return data
  } catch (err) {
    console.error('Error fetching provinces from database:', err)
    return []
  }
}

export async function fetchRegencies(provinceId) {
  if (!provinceId) return []
  if (regenciesCache[provinceId]) return regenciesCache[provinceId]

  try {
    const res = await fetch(`${API_BASE}/kst/wilayah/regencies?province_kode=${encodeURIComponent(provinceId)}`)
    if (!res.ok) throw new Error('Gagal memuat data kota/kabupaten dari database')
    const data = await res.json()
    regenciesCache[provinceId] = data
    return data
  } catch (err) {
    console.error(`Error fetching regencies for province ${provinceId}:`, err)
    return []
  }
}

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
      // Keep acronyms like DKI, DIY, IKN if needed, otherwise titlecase
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
