import axios from 'axios';

/**
 * Axios instance shared by every service module. Carries the httpOnly
 * refresh cookie automatically (withCredentials) and attaches the current
 * in-memory access token to every request. On a 401 from any endpoint other
 * than login/refresh themselves, makes ONE silent attempt to refresh the
 * session and retries the original request; if that also fails it clears
 * the token and rejects — redirecting to the login screen is the concern of
 * whichever feature/AuthProvider is consuming the rejected promise, not of
 * this file.
 */

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Module-scoped (not React state) so it survives outside any component tree
// and is readable/writable from anywhere that imports this file. Never
// persisted to localStorage/sessionStorage.
let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const AUTH_ENDPOINTS = ['/admin/auth/login', '/admin/auth/refresh'];

function isAuthEndpoint(url = '') {
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

let refreshPromise = null;

function performRefresh() {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post('/admin/auth/refresh')
      .then((response) => {
        const token = response.data?.accessToken ?? null;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!config || response?.status !== 401 || isAuthEndpoint(config.url) || config.__isRetry) {
      return Promise.reject(error);
    }

    try {
      await performRefresh();
      config.__isRetry = true;
      return apiClient(config);
    } catch (refreshError) {
      setAccessToken(null);
      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
