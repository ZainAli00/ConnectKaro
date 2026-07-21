import apiClient from './apiClient';

/**
 * Thin wrapper over GET /api/admin/stats (JWT-protected).
 * @returns {Promise<{ success: true, data: object }>}
 */
export function getStats() {
  return apiClient.get('/admin/stats').then((res) => res.data);
}
