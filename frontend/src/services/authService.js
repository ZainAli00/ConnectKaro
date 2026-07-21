import apiClient from './apiClient';

/**
 * Thin wrappers over the /api/admin/auth/* endpoints. Every function
 * returns response.data (already the parsed { success, ... } payload) —
 * callers are responsible for updating apiClient's in-memory token and any
 * app-level admin state.
 */

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: true, accessToken: string, admin: { id: string, email: string, displayName: string } }>}
 */
export function login(email, password) {
  return apiClient.post('/admin/auth/login', { email, password }).then((res) => res.data);
}

/**
 * @returns {Promise<{ success: true, accessToken: string }>}
 */
export function refresh() {
  return apiClient.post('/admin/auth/refresh').then((res) => res.data);
}

/**
 * @returns {Promise<{ success: true }>}
 */
export function logout() {
  return apiClient.post('/admin/auth/logout').then((res) => res.data);
}

/**
 * @returns {Promise<{ success: true, admin: { id: string, email: string, displayName: string } }>}
 */
export function me() {
  return apiClient.get('/admin/auth/me').then((res) => res.data);
}
