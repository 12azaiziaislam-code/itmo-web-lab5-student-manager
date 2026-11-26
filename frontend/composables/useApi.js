export function useApi() {
  const config = useRuntimeConfig();

  function getBaseUrl() {
    if (import.meta.server) {
      return config.apiInternalBase || 'http://localhost:8080/api';
    }
    return config.public?.apiBase || '/api';
  }

  function buildHeaders(customHeaders = {}) {
    const token = useCookie('accessToken').value;
    const headers = { ...customHeaders };
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async function apiFetch(path, options = {}) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return await $fetch(`${getBaseUrl()}${cleanPath}`, {
      ...options,
      headers: buildHeaders(options.headers)
    });
  }

  async function apiFetchRaw(path, options = {}) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return await $fetch.raw(`${getBaseUrl()}${cleanPath}`, {
      ...options,
      headers: buildHeaders(options.headers)
    });
  }

  return {
    getBaseUrl,
    apiFetch,
    apiFetchRaw
  };
}
