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

export function getDashboard() {
  return request('/me/dashboard');
}

export function getMyTransactions(status = '') {
  const query = status
    ? `?status=${encodeURIComponent(status)}`
    : '';

  return request(`/me/transactions${query}`);
}

export function getTransactionById(id) {
  return request(`/transactions/${id}`);
}

export function getMyCampaigns() {
  return request('/me/campaigns');
}

export function getCampaigns() {
  return request('/campaigns');
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

export function isAuthenticated() {
  return Boolean(localStorage.getItem('ecolink_token'));
}
