const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('ecolink_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error('Server mengembalikan response yang tidak valid.');
  }

  if (!response.ok) {
    throw new Error(
      result?.message || 'Terjadi kesalahan saat menghubungi server.'
    );
  }

  return result;
}

export function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getProfile() {
  return request('/me/profile');
}

export function updateProfile(payload) {
  return request('/me/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function getDashboard() {
  return request('/me/dashboard');
}

export async function classifyWasteImage(file) {
  const token = localStorage.getItem('ecolink_token');
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('http://127.0.0.1:8080/api/ai/classify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Server mengembalikan response yang tidak valid.');
  }
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Gagal mengklasifikasikan gambar.');
  }
  return data;
}

export function getOrganizationDashboard() {
  return request('/organization/dashboard');
}

export function getOrganizationCampaigns() {
  return request('/organization/campaigns');
}

export function createOrganizationCampaign(payload) {
  return request('/organization/campaigns', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateOrganizationCampaignStatus(id, status) {
  return request(`/organization/campaigns/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getPassport() {
  return request('/me/passport');
}

export function getMyMissions() {
  return request('/me/missions');
}

export function getMyBadges() {
  return request('/me/badges');
}

export function getMyTransactions(status = '') {
  const query = status
    ? `?status=${encodeURIComponent(status)}`
    : '';

  return request(`/me/transactions${query}`);
}

export function createTransaction(payload) {
  return request('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getTransactionById(id) {
  return request(`/transactions/${id}`);
}

export function getBankTransactions(status = '') {
  const query = status
    ? `?status=${encodeURIComponent(status)}`
    : '';

  return request(`/bank/transactions${query}`);
}

export function verifyTransaction(id) {
  return request(`/transactions/${id}/verify`, {
    method: 'PUT',
  });
}

export function getMyCampaigns() {
  return request('/me/campaigns');
}

export function getCampaigns() {
  return request('/campaigns');
}

export function getCampaignById(id) {
  return request(`/campaigns/${id}`);
}

export function getWasteBankById(id) {
  return request(`/waste-banks/${id}`);
}

export function getWasteBanks() {
  return request('/waste-banks');
}

export function joinCampaign(id) {
  return request(`/campaigns/${id}/join`, {
    method: 'POST',
  });
}

export function logoutUser() {
  localStorage.removeItem('ecolink_token');
  localStorage.removeItem('ecolink_user');
}

export function saveAuth(data) {
  localStorage.setItem('ecolink_token', data.token);
  localStorage.setItem(
    'ecolink_user',
    JSON.stringify(data.user)
  );
}

export function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem('ecolink_user')
    );
  } catch {
    return null;
  }
}

export function updateStoredUser(user) {
  const current = getStoredUser() || {};

  localStorage.setItem(
    'ecolink_user',
    JSON.stringify({
      ...current,
      ...user,
    })
  );
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('ecolink_token'));
}
