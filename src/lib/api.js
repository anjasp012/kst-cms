const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export function getJwt() {
  return localStorage.getItem('kst_jwt');
}

export function getRefreshToken() {
  return localStorage.getItem('kst_refresh');
}

export function saveTokens(jwt, refreshToken, username) {
  if (jwt) localStorage.setItem('kst_jwt', jwt);
  if (refreshToken) localStorage.setItem('kst_refresh', refreshToken);
  if (username) localStorage.setItem('kst_username', username);
}

export function clearTokens() {
  localStorage.removeItem('kst_jwt');
  localStorage.removeItem('kst_refresh');
  localStorage.removeItem('kst_username');
}

function authHeaders() {
  const jwt = getJwt();
  return {
    'Content-Type': 'application/json',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  };
}

async function request(url, options = {}) {
  let res = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  // Auto refresh token if 401 Unauthorized
  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: getRefreshToken() }),
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newJwt = refreshData.data?.jwt;
        const newRefresh = refreshData.data?.refresh_token;
        saveTokens(newJwt, newRefresh);

        res = await fetch(url, {
          ...options,
          headers: {
            ...authHeaders(),
            ...(options.headers || {}),
          },
        });
      } else {
        clearTokens();
      }
    } catch (e) {
      clearTokens();
    }
  }

  if (!res.ok) {
    let errorDetail = 'Permintaan gagal';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail?.responseMessage || errJson.detail || errJson.responseMessage || 'Terjadi kesalahan pada server';
    } catch (_) { }
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    let msg = 'Username atau password salah';
    try {
      const err = await res.json();
      msg = err.detail?.responseMessage || err.detail || msg;
    } catch (_) { }
    throw new Error(msg);
  }
  return res.json();
}

// 📊 1. ANALITIK & STATISTIK KST
export async function fetchKSTAnalytics() {
  return request(`${API_BASE}/admin/analytics`);
}

// 📁 2. FILE UPLOAD (Gambar / Thumbnail / Galeri)
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const jwt = localStorage.getItem('kst_jwt');
  const headers = {};
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  if (!res.ok) {
    let errDetail = 'Gagal mengunggah file';
    try {
      const errJson = await res.json();
      errDetail = errJson.detail || errDetail;
    } catch (_) {}
    throw new Error(errDetail);
  }
  
  return res.json();
}

// 🗺️ 3. KAWASAN SAINS DAN TEKNOLOGI (KST)
export async function fetchKSTLocations(params = {}) {
  const query = new URLSearchParams();
  if (params.wilayah) query.append('wilayah', params.wilayah);
  if (params.fokus) query.append('fokus', params.fokus);
  if (params.fasilitas) query.append('fasilitas', params.fasilitas);
  if (params.kolaborasi) query.append('kolaborasi', params.kolaborasi);
  if (params.q) query.append('q', params.q);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`${API_BASE}/kst/map${qs}`);
}

export async function fetchKSTDetail(idOrSlug) {
  return request(`${API_BASE}/kst/locations/${idOrSlug}`);
}

export async function createKST(payload) {
  return request(`${API_BASE}/kst/locations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateKST(id, payload) {
  return request(`${API_BASE}/kst/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteKST(id) {
  return request(`${API_BASE}/kst/locations/${id}`, {
    method: 'DELETE',
  });
}

// 🏛️ 4. MITRA RISET DAERAH (BAPPEDA / BAPPERIDA / BRIDA)
export async function fetchRegionalPartners(params = {}) {
  const query = new URLSearchParams();
  if (params.jenis) query.append('jenis', params.jenis);
  if (params.wilayah) query.append('wilayah', params.wilayah);
  if (params.q) query.append('q', params.q);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`${API_BASE}/kst/partners${qs}`);
}

export async function createRegionalPartner(payload) {
  return request(`${API_BASE}/kst/partners`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateRegionalPartner(id, payload) {
  return request(`${API_BASE}/kst/partners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteRegionalPartner(id) {
  return request(`${API_BASE}/kst/partners/${id}`, {
    method: 'DELETE',
  });
}

// 🏷️ 5. MASTER KATEGORI GABUNGAN (Untuk filter Wonderful BRIN & Form KST)
let categoriesCache = null;

export async function fetchKSTCategories(forceRefresh = false) {
  if (!forceRefresh && categoriesCache) return categoriesCache;
  try {
    const res = await request(`${API_BASE}/kst/categories`);
    categoriesCache = res;
    return res;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return {
      tema_riset: ['Energi & Material', 'Kesehatan', 'Pangan & Pertanian', 'Lingkungan', 'Teknologi Digital', 'Maritim'],
      tipe_fasilitas: ['Laboratorium', 'Observatorium', 'Pilot Plant', 'Akses Data & Koleksi'],
      potensi_kolaborasi: ['Industri', 'Akademisi', 'Pemerintah', 'Komunitas'],
      raw: []
    };
  }
}

// 🧪 5A. TEMA RISET (Tabel terpisah: kst_themeriset)
export async function fetchThemes(includeInactive = true) {
  const qs = includeInactive ? '?include_inactive=true' : '';
  return request(`${API_BASE}/kst/themeriset${qs}`);
}

export async function createTheme(payload) {
  categoriesCache = null;
  return request(`${API_BASE}/kst/themeriset`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTheme(id, payload) {
  categoriesCache = null;
  return request(`${API_BASE}/kst/themeriset/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteTheme(id) {
  categoriesCache = null;
  return request(`${API_BASE}/kst/themeriset/${id}`, {
    method: 'DELETE',
  });
}

// 🏢 5B. TIPE FASILITAS (Tabel terpisah: kst_facilities)
export async function fetchFacilities(includeInactive = true) {
  const qs = includeInactive ? '?include_inactive=true' : '';
  return request(`${API_BASE}/kst/facilities${qs}`);
}

export async function createFacility(payload) {
  categoriesCache = null;
  return request(`${API_BASE}/kst/facilities`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateFacility(id, payload) {
  categoriesCache = null;
  return request(`${API_BASE}/kst/facilities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteFacility(id) {
  categoriesCache = null;
  return request(`${API_BASE}/kst/facilities/${id}`, {
    method: 'DELETE',
  });
}

// 🤝 5C. POTENSI KOLABORASI (Tabel terpisah: kst_collaborations)
export async function fetchCollaborations(includeInactive = true) {
  const qs = includeInactive ? '?include_inactive=true' : '';
  return request(`${API_BASE}/kst/collaborations${qs}`);
}

export async function createCollaboration(payload) {
  categoriesCache = null;
  return request(`${API_BASE}/kst/collaborations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCollaboration(id, payload) {
  categoriesCache = null;
  return request(`${API_BASE}/kst/collaborations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteCollaboration(id) {
  categoriesCache = null;
  return request(`${API_BASE}/kst/collaborations/${id}`, {
    method: 'DELETE',
  });
}

// 🏆 5D. PILAR DAMPAK (Tabel terpisah: kst_dampak)
export async function fetchDampak(includeInactive = true) {
  const qs = includeInactive ? '?include_inactive=true' : '';
  return request(`${API_BASE}/kst/dampak${qs}`);
}

export async function createDampak(payload) {
  categoriesCache = null;
  return request(`${API_BASE}/kst/dampak`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDampak(id, payload) {
  categoriesCache = null;
  return request(`${API_BASE}/kst/dampak/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteDampak(id) {
  categoriesCache = null;
  return request(`${API_BASE}/kst/dampak/${id}`, {
    method: 'DELETE',
  });
}

// Backward-compatible router helper
export async function fetchCategoriesList(tipe, includeInactive = true) {
  if (tipe === 'tipe_fasilitas') return fetchFacilities(includeInactive);
  if (tipe === 'dampak') return fetchDampak(includeInactive);
  if (tipe === 'potensi_kolaborasi') return fetchCollaborations(includeInactive);
  return fetchThemes(includeInactive);
}

export async function createCategory(payload) {
  if (payload.tipe === 'tipe_fasilitas') return createFacility(payload);
  if (payload.tipe === 'dampak') return createDampak(payload);
  if (payload.tipe === 'potensi_kolaborasi') return createCollaboration(payload);
  return createTheme(payload);
}

export async function updateCategory(id, payload, tipe) {
  if (tipe === 'tipe_fasilitas') return updateFacility(id, payload);
  if (tipe === 'dampak') return updateDampak(id, payload);
  if (tipe === 'potensi_kolaborasi') return updateCollaboration(id, payload);
  return updateTheme(id, payload);
}

export async function deleteCategory(id, tipe) {
  if (tipe === 'tipe_fasilitas') return deleteFacility(id);
  if (tipe === 'dampak') return deleteDampak(id);
  if (tipe === 'potensi_kolaborasi') return deleteCollaboration(id);
  return deleteTheme(id);
}


// 🇮🇩 6. MASTER WILAYAH & PROVINSI
export async function fetchProvinces(wilayah) {
  const query = new URLSearchParams();
  if (wilayah) query.append('wilayah', wilayah);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`${API_BASE}/kst/wilayah/provinces${qs}`);
}

export async function createProvince(payload) {
  return request(`${API_BASE}/kst/wilayah/provinces`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProvince(kode, payload) {
  return request(`${API_BASE}/kst/wilayah/provinces/${kode}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteProvince(kode) {
  return request(`${API_BASE}/kst/wilayah/provinces/${kode}`, {
    method: 'DELETE',
  });
}

export async function fetchRegencies(provinceKode, q) {
  const query = new URLSearchParams();
  if (provinceKode) query.append('province_kode', provinceKode);
  if (q) query.append('q', q);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`${API_BASE}/kst/wilayah/regencies${qs}`);
}

