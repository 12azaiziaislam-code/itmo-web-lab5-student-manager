import { useAuthStore } from '~/stores/auth';

export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  function getBaseUrl() {
    if (import.meta.server) {
      return config.apiInternalBase || 'http://localhost:8080/api';
    }
    return config.public?.apiBase || '/api';
  }

  function buildHeaders(customHeaders = {}) {
    const token = authStore.accessToken;
    const headers = { ...customHeaders };
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async function requestWithRefresh(executor, path, options = {}) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${getBaseUrl()}${cleanPath}`;

    try {
      return await executor(url, {
        ...options,
        headers: buildHeaders(options.headers)
      });
    } catch (err) {
      const status = err?.statusCode || err?.status || err?.response?.status;
      const isAuthEndpoint = cleanPath.startsWith('/auth/');

      if (status === 401 && !isAuthEndpoint && authStore.refreshToken) {
        try {
          await authStore.refresh();
          return await executor(url, {
            ...options,
            headers: buildHeaders(options.headers)
          });
        } catch (refreshErr) {
          authStore.clearSession();
          if (import.meta.client) {
            await navigateTo('/login');
          }
          throw refreshErr;
        }
      }

      throw err;
    }
  }

  async function apiFetch(path, options = {}) {
    return await requestWithRefresh($fetch, path, options);
  }

  async function apiFetchRaw(path, options = {}) {
    return await requestWithRefresh($fetch.raw, path, options);
  }

  return {
    getBaseUrl,
    apiFetch,
    apiFetchRaw
  };
}
