const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8002/api/v1';

function getJwt() {
  return localStorage.getItem('kst_jwt');
}

function getRefreshToken() {
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

export async function checkApiHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8002';
    const res = await fetch(`${backendUrl}/`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    return false;
  }
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

// 📊 1. HISTORI PEMAKAIAN MODUL
export async function fetchModuleUsage() {
  return request(`${API_BASE}/admin/module-usage`);
}

export async function fetchAnalytics() {
  return request(`${API_BASE}/admin/analytics`);
}



// 📬 2. MODERASI USULAN RISET PENGUNJUNG
export async function fetchSuggestions({ status = null, limit = 50, offset = 0 } = {}) {
  let url = `${API_BASE}/admin/suggestions?limit=${limit}&offset=${offset}`;
  if (status && status !== 'ALL') {
    url += `&status=${status}`;
  }
  return request(url);
}

export async function updateSuggestionStatus(id, status, admin_notes = null) {
  return request(`${API_BASE}/admin/suggestions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, admin_notes }),
  });
}

export async function bulkUpdateSuggestionStatus(ids, status) {
  return request(`${API_BASE}/admin/suggestions/bulk-status`, {
    method: 'POST',
    body: JSON.stringify({ ids, status }),
  });
}

export async function deleteSuggestion(id) {
  return request(`${API_BASE}/admin/suggestions/${id}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteSuggestions(ids) {
  return request(`${API_BASE}/admin/suggestions/bulk-delete`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

// 👥 3. CRUD MODUL PENGGUNA (PERSONA) & TOKEN TANTANGAN (ZONA)
export async function fetchPersonas() {
  return request(`${API_BASE}/admin/personas`);
}

export async function createPersona(payload) {
  return request(`${API_BASE}/admin/personas`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePersona(id, payload) {
  return request(`${API_BASE}/admin/personas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deletePersona(id) {
  return request(`${API_BASE}/admin/personas/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchZones() {
  return request(`${API_BASE}/admin/zones`);
}

export async function createZone(payload) {
  return request(`${API_BASE}/admin/zones`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateZone(id, payload) {
  return request(`${API_BASE}/admin/zones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteZone(id) {
  return request(`${API_BASE}/admin/zones/${id}`, {
    method: 'DELETE',
  });
}

// 💡 4. KATALOG INOVASI
export async function fetchInnovations(zone_id = null) {
  let url = `${API_BASE}/admin/innovations`;
  if (zone_id) url += `?zone_id=${zone_id}`;
  return request(url);
}

export async function createInnovation(payload) {
  return request(`${API_BASE}/admin/innovations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateInnovation(id, payload) {
  return request(`${API_BASE}/admin/innovations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteInnovation(id) {
  return request(`${API_BASE}/admin/innovations/${id}`, {
    method: 'DELETE',
  });
}

export async function updateInnovationRelevance(id, mappings) {
  return request(`${API_BASE}/admin/innovations/${id}/relevance`, {
    method: 'POST',
    body: JSON.stringify(mappings),
  });
}

// 📁 5. FILE UPLOAD
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

// 🗺️ 6. KAWASAN SAINS DAN TEKNOLOGI (KST)
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

// 🏛️ 7. MITRA RISET DAERAH (BAPPEDA / BAPPERIDA / BRIDA)
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

