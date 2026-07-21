import apiClient from './apiClient';

/**
 * Public, unauthenticated endpoints backing the customer-facing order
 * lookup page. Every function returns response.data.
 */

/**
 * @param {string} orderId
 * @returns {Promise<{ success: true, data: object }>}
 */
export function lookup(orderId) {
  return apiClient.post('/public/lookup', { orderId }).then((res) => res.data);
}

/**
 * @returns {Promise<{ success: true, data: Array<object> }>}
 */
export function getDestinations() {
  return apiClient.get('/public/destinations').then((res) => res.data);
}
