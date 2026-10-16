export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
export const SWAGGER_URL = API_BASE.replace(/\/api\/v1\/?$/, '') + '/docs';

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

function forceLogout() {
  clearTokens();
  window.location.href = '/';
}

export const PUBLIC_ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN || '7f2b9a4c1d8e03f56a9b8c2d1e4f7a0b3c5d6e8f9a0b1c2d3e4f5a6b7c8d9e0f';

function authHeaders(url = '') {
  const jwt = getJwt();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }
  if (url.includes('/kst/')) {
    headers['X-Access-Token'] = PUBLIC_ACCESS_TOKEN;
  }
  return headers;
}

export async function request(url, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    ...authHeaders(url),
    ...(options.headers || {}),
  };
  if (isFormData) {
    delete headers['Content-Type'];
  }

  let res = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers,
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
        forceLogout();
      }
    } catch (e) {
      forceLogout();
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      forceLogout();
      throw new Error('Sesi telah berakhir, silakan login kembali.');
    }
    let errorDetail = 'Permintaan gagal';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail?.responseMessage || errJson.detail || errJson.responseMessage || errJson.message || 'Terjadi kesalahan pada server';
    } catch (_) { }

    if (typeof errorDetail === 'string') {
      const lowErr = errorDetail.toLowerCase();
      if (lowErr.includes('foreignkeyviolation') || lowErr.includes('violates foreign key constraint') || lowErr.includes('is still referenced')) {
        errorDetail = 'Data ini tidak dapat dihapus karena masih digunakan atau terhubung dengan data lain di sistem (misal data lokasi kawasan). Silakan ubah atau hapus data terkait terlebih dahulu.';
      } else if (lowErr.includes('uniqueviolation') || lowErr.includes('duplicate key value')) {
        errorDetail = 'Data dengan nama atau identitas tersebut sudah terdaftar di sistem. Silakan gunakan nama atau identitas lain.';
      } else if (lowErr.includes('internal server error:') || lowErr.includes('psycopg2.')) {
        errorDetail = 'Terjadi kendala pada sistem database saat memproses data. Silakan periksa kembali data terkait.';
      }
    }

    throw new Error(errorDetail);
  }

  return res.json();
}

// =========================================================================
// 🔐 1. AUTENTIKASI ADMIN CMS (/auth)
// =========================================================================
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

// =========================================================================
// 📊 2. ANALITIK & STATISTIK CMS (/admin)
// =========================================================================
export async function fetchKSTAnalytics() {
  return request(`${API_BASE}/admin/analytics`);
}

// =========================================================================
// 📁 3. FILE UPLOAD MEDIA (/admin)
// =========================================================================
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

// =========================================================================
// 🗺️ 4. MANAJEMEN LOKASI KST (/admin/lokasi)
// =========================================================================
export async function fetchKSTLocations(params = {}) {
  const query = new URLSearchParams();
  if (params.wilayah) query.append('wilayah', params.wilayah);
  if (params.fokus) query.append('fokus', params.fokus);
  if (params.fasilitas) query.append('fasilitas', params.fasilitas);
  if (params.q) query.append('q', params.q);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`${API_BASE}/admin/lokasi/peta${qs}`);
}

export async function fetchKSTDetail(idOrSlug) {
  return request(`${API_BASE}/admin/lokasi/${idOrSlug}`);
}

export async function createKST(payload) {
  return request(`${API_BASE}/admin/lokasi`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateKST(id, payload) {
  return request(`${API_BASE}/admin/lokasi/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteKST(id) {
  return request(`${API_BASE}/admin/lokasi/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchFieldLabels() {
  return request(`${API_BASE}/admin/lokasi/field-labels`);
}
export const fetchLabelDataLokasi = fetchFieldLabels;
export const fetchFieldLabelLocation = fetchFieldLabels;

export async function createFieldLabel(payload) {
  return request(`${API_BASE}/admin/lokasi/field-labels`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
export const createLabelDataLokasi = createFieldLabel;

export async function updateFieldLabel(id, payload) {
  return request(`${API_BASE}/admin/lokasi/field-labels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
export const updateLabelDataLokasi = updateFieldLabel;

export async function deleteFieldLabel(id) {
  return request(`${API_BASE}/admin/lokasi/field-labels/${id}`, {
    method: 'DELETE',
  });
}
export const deleteLabelDataLokasi = deleteFieldLabel;


export async function downloadLocationTemplate(format = 'xlsx') {
  const jwt = getJwt();
  const res = await fetch(`${API_BASE}/admin/lokasi/template?format=${format}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (!res.ok) throw new Error('Gagal mengunduh template import');
  return res.blob();
}

export async function exportLocationData(format = 'xlsx', search = '') {
  const jwt = getJwt();
  const qs = search ? `&search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_BASE}/admin/lokasi/export?format=${format}${qs}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (!res.ok) throw new Error('Gagal mengekspor data lokasi');
  return res.blob();
}

export async function importLocationData(file, mode = 'create_or_update') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode);
  return request(`${API_BASE}/admin/lokasi/import`, {
    method: 'POST',
    body: formData,
  });
}

// Aliases
export const fetchLocations = fetchKSTLocations;
export const fetchLocationDetail = fetchKSTDetail;
export const createLocation = createKST;
export const updateLocation = updateKST;
export const deleteLocation = deleteKST;

export const fetchLokasi = fetchKSTLocations;
export const fetchDetailLokasi = fetchKSTDetail;
export const createLokasi = createKST;
export const updateLokasi = updateKST;
export const deleteLokasi = deleteKST;

// =========================================================================
// 🏷️ 5. MASTER KATEGORI GABUNGAN (DROPDOWN) (/admin/kategori)
// =========================================================================
let categoriesCache = null;

export async function fetchKSTCategories(forceRefresh = false) {
  if (!forceRefresh && categoriesCache) return categoriesCache;
  try {
    const res = await request(`${API_BASE}/admin/kategori`);
    categoriesCache = res;
    return res;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return {
      tema_riset: ['Energi & Material', 'Kesehatan', 'Pangan & Pertanian', 'Lingkungan', 'Teknologi Digital', 'Maritim'],
      tipe_fasilitas: ['Laboratorium', 'Observatorium', 'Pilot Plant', 'Akses Data & Koleksi'],
      raw: []
    };
  }
}
export const fetchKategori = fetchKSTCategories;

// =========================================================================
// 🧪 6. FOKUS / TEMA RISET (/admin/fokus-riset)
// =========================================================================
export async function fetchThemes(includeInactive = true) {
  const qs = includeInactive ? '?include_inactive=true' : '';
  return request(`${API_BASE}/admin/fokus-riset${qs}`);
}

export async function createTheme(payload) {
  categoriesCache = null;
  return request(`${API_BASE}/admin/fokus-riset`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTheme(id, payload) {
  categoriesCache = null;
  return request(`${API_BASE}/admin/fokus-riset/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteTheme(id) {
  categoriesCache = null;
  return request(`${API_BASE}/admin/fokus-riset/${id}`, {
    method: 'DELETE',
  });
}

export const fetchTemaRiset = fetchThemes;
export const createTemaRiset = createTheme;
export const updateTemaRiset = updateTheme;
export const deleteTemaRiset = deleteTheme;
export const fetchFokusRiset = fetchThemes;
export const createFokusRiset = createTheme;
export const updateFokusRiset = updateTheme;
export const deleteFokusRiset = deleteTheme;

// =========================================================================
// 🏢 7. JENIS KAWASAN (/admin/jenis-kawasan)
// =========================================================================
export async function fetchJenisKawasan(includeInactive = true) {
  const qs = includeInactive ? '?include_inactive=true' : '';
  return request(`${API_BASE}/admin/jenis-kawasan${qs}`);
}

export async function createJenisKawasan(payload) {
  return request(`${API_BASE}/admin/jenis-kawasan`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateJenisKawasan(id, payload) {
  return request(`${API_BASE}/admin/jenis-kawasan/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteJenisKawasan(id) {
  return request(`${API_BASE}/admin/jenis-kawasan/${id}`, {
    method: 'DELETE',
  });
}

export const fetchKawasan = fetchJenisKawasan;
export const createKawasan = createJenisKawasan;
export const updateKawasan = updateJenisKawasan;
export const deleteKawasan = deleteJenisKawasan;

export const fetchInstansi = fetchJenisKawasan;
export const createInstansi = createJenisKawasan;
export const updateInstansi = updateJenisKawasan;
export const deleteInstansi = deleteJenisKawasan;

// Helper router kategori umum (Jenis Kawasan & Fokus Riset)
export async function fetchCategoriesList(tipe, includeInactive = true) {
  if (tipe === 'jenis_kawasan' || tipe === 'kawasan' || tipe === 'instansi') {
    return fetchJenisKawasan(includeInactive);
  }
  return fetchThemes(includeInactive);
}

export async function createCategory(payload) {
  if (payload.tipe === 'jenis_kawasan' || payload.tipe === 'kawasan' || payload.tipe === 'instansi') {
    return createJenisKawasan(payload);
  }
  return createTheme(payload);
}

export async function updateCategory(id, payload, tipe) {
  if (tipe === 'jenis_kawasan' || tipe === 'kawasan' || tipe === 'instansi') {
    return updateJenisKawasan(id, payload);
  }
  return updateTheme(id, payload);
}

export async function deleteCategory(id, tipe) {
  if (tipe === 'jenis_kawasan' || tipe === 'kawasan' || tipe === 'instansi') {
    return deleteJenisKawasan(id);
  }
  return deleteTheme(id);
}

// =========================================================================
// 🇮🇩 11. MASTER WILAYAH: PROVINSI & KABUPATEN / KOTA (/admin/wilayah)
// =========================================================================
export async function fetchMasterWilayah(adaLokasi = true) {
  return request(`${API_BASE}/admin/wilayah?ada_lokasi=${adaLokasi}`);
}

export async function fetchProvinces() {
  return request(`${API_BASE}/admin/wilayah/provinsi`);
}

export async function createProvince(payload) {
  return request(`${API_BASE}/admin/wilayah/provinsi`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProvince(kode, payload) {
  return request(`${API_BASE}/admin/wilayah/provinsi/${kode}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteProvince(kode) {
  return request(`${API_BASE}/admin/wilayah/provinsi/${kode}`, {
    method: 'DELETE',
  });
}

export async function fetchRegencies(provinceKode, q) {
  const query = new URLSearchParams();
  if (provinceKode) query.append('province_kode', provinceKode);
  if (q) query.append('q', q);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`${API_BASE}/admin/wilayah/kabupaten-kota${qs}`);
}

export async function createRegency(payload) {
  return request(`${API_BASE}/admin/wilayah/kabupaten-kota`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateRegency(kode, payload) {
  return request(`${API_BASE}/admin/wilayah/kabupaten-kota/${kode}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteRegency(kode) {
  return request(`${API_BASE}/admin/wilayah/kabupaten-kota/${kode}`, {
    method: 'DELETE',
  });
}

export const fetchProvinsi = fetchProvinces;
export const createProvinsi = createProvince;
export const updateProvinsi = updateProvince;
export const deleteProvinsi = deleteProvince;

export const fetchKabupatenKota = fetchRegencies;
export const createKabupatenKota = createRegency;
export const updateKabupatenKota = updateRegency;
export const deleteKabupatenKota = deleteRegency;

// =========================================================================
// 📸 12. GALERI MEDIA (FOTO & VIDEO) (/admin/galeri)
// =========================================================================
export async function fetchGaleri(lokasiId, tipe) {
  const params = new URLSearchParams();
  if (lokasiId) params.append('lokasi_id', lokasiId);
  if (tipe) params.append('tipe', tipe);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return request(`${API_BASE}/admin/galeri${qs}`);
}

export async function createGaleriItem(payload) {
  return request(`${API_BASE}/admin/galeri`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateGaleriItem(id, payload) {
  return request(`${API_BASE}/admin/galeri/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteGaleriItem(id) {
  return request(`${API_BASE}/admin/galeri/${id}`, {
    method: 'DELETE',
  });
}

// =========================================================================
// 🌐 13. PUBLIC / FRONTEND API CLIENT HELPERS (/kst)
// =========================================================================
export async function fetchPublicMasterData() {
  return request(`${API_BASE}/kst/master`);
}

export async function fetchPublicLokasiRingkas() {
  return request(`${API_BASE}/kst/data-lokasi`);
}

export async function filterPublicLokasi(payload) {
  return request(`${API_BASE}/kst/data-lokasi/filter`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchPublicLokasiDetail(idOrSlug) {
  return request(`${API_BASE}/kst/data-lokasi/${idOrSlug}`);
}

export const fetchMasterData = fetchPublicMasterData;
export const fetchLokasiRingkas = fetchPublicLokasiRingkas;
export const filterLokasi = filterPublicLokasi;

// =========================================================================
// ⚡ 14. QUICK FILTER API (ADMIN & PUBLIC)
// =========================================================================
export async function fetchQuickFiltersAdmin(isActive = null) {
  const qs = isActive !== null ? `?is_active=${isActive}` : '';
  return request(`${API_BASE}/admin/quick-filter${qs}`);
}

export async function createQuickFilterAdmin(payload) {
  return request(`${API_BASE}/admin/quick-filter`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateQuickFilterAdmin(id, payload) {
  return request(`${API_BASE}/admin/quick-filter/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteQuickFilterAdmin(id) {
  return request(`${API_BASE}/admin/quick-filter/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchPublicQuickFilters() {
  return request(`${API_BASE}/kst/quick-filter`);
}

export const fetchQuickFilters = fetchQuickFiltersAdmin;
export const createQuickFilter = createQuickFilterAdmin;
export const updateQuickFilter = updateQuickFilterAdmin;
export const deleteQuickFilter = deleteQuickFilterAdmin;

// =========================================================================
// 📊 15. DASHBOARD OVERVIEW & ANALYTICS
// =========================================================================
export async function fetchDashboardOverview() {
  return request(`${API_BASE}/admin/dashboard/overview`);
}
