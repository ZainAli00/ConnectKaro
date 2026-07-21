import apiClient from './apiClient';

/**
 * Thin wrappers over /api/admin/orders* (JWT-protected). Every function
 * returns response.data.
 */

/**
 * @param {object} [params] - search/filter/pagination query params
 * @returns {Promise<{ success: true, data: Array<object>, meta: { total: number, page: number, pageSize: number } }>}
 */
export function list(params) {
  return apiClient.get('/admin/orders', { params }).then((res) => res.data);
}

/**
 * @param {object} payload - new order fields
 * @returns {Promise<{ success: true, data: object }>}
 */
export function create(payload) {
  return apiClient.post('/admin/orders', payload).then((res) => res.data);
}

/**
 * @param {string} id
 * @returns {Promise<{ success: true, data: object }>}
 */
export function get(id) {
  return apiClient.get(`/admin/orders/${id}`).then((res) => res.data);
}

/**
 * @param {string} id
 * @param {object} patch - partial order fields to update
 * @returns {Promise<{ success: true, data: object }>}
 */
export function update(id, patch) {
  return apiClient.patch(`/admin/orders/${id}`, patch).then((res) => res.data);
}

/**
 * @param {string} id
 * @returns {Promise<{ success: true }>}
 */
export function remove(id) {
  return apiClient.delete(`/admin/orders/${id}`).then((res) => res.data);
}

/**
 * Forces a live re-sync of usage data for this order, bypassing the cache TTL.
 * @param {string} id
 * @returns {Promise<{ success: true, data: object }>}
 */
export function refreshUsage(id) {
  return apiClient.post(`/admin/orders/${id}/refresh-usage`).then((res) => res.data);
}
