import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const cookieOptions = {
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  };

  const accessToken = useCookie('accessToken', cookieOptions);
  const refreshToken = useCookie('refreshToken', cookieOptions);
  const username = useCookie('username', cookieOptions);
  const role = useCookie('role', cookieOptions);

  const user = ref(null);

  let refreshPromise = null;

  const isAuthenticated = computed(() => Boolean(accessToken.value || refreshToken.value));
  const isAdmin = computed(() => role.value === 'ADMIN');

  function getBaseUrl() {
    const config = useRuntimeConfig();
    if (import.meta.server) {
      return config.apiInternalBase || 'http://localhost:8080/api';
    }
    return config.public?.apiBase || '/api';
  }

  function setSession(data) {
    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;
    username.value = data.username;
    role.value = data.role;
  }

  function clearSession() {
    accessToken.value = null;
    refreshToken.value = null;
    username.value = null;
    role.value = null;
    user.value = null;
  }

  async function login(credentials) {
    const data = await $fetch(`${getBaseUrl()}/auth/login`, {
      method: 'POST',
      body: credentials
    });
    setSession(data);
    return data;
  }

  async function register(payload) {
    const data = await $fetch(`${getBaseUrl()}/auth/register`, {
      method: 'POST',
      body: payload
    });
    setSession(data);
    return data;
  }

  async function refresh() {
    if (!refreshToken.value) {
      clearSession();
      throw new Error('No refresh token available');
    }

    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = $fetch(`${getBaseUrl()}/auth/refresh`, {
      method: 'POST',
      body: { refreshToken: refreshToken.value }
    })
      .then((data) => {
        setSession(data);
        return data;
      })
      .catch((err) => {
        clearSession();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });

    return refreshPromise;
  }

  async function fetchMe() {
    if (!accessToken.value) {
      if (!refreshToken.value) return null;
      await refresh();
    }

    try {
      const profile = await $fetch(`${getBaseUrl()}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken.value}` }
      });
      user.value = profile;
      username.value = profile.username;
      role.value = profile.role;
      return profile;
    } catch (err) {
      const status = err?.statusCode || err?.status || err?.response?.status;
      if (status === 401 && refreshToken.value) {
        await refresh();
        const profile = await $fetch(`${getBaseUrl()}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken.value}` }
        });
        user.value = profile;
        username.value = profile.username;
        role.value = profile.role;
        return profile;
      }
      throw err;
    }
  }

  async function logout() {
    const currentRefresh = refreshToken.value;
    try {
      if (currentRefresh) {
        await $fetch(`${getBaseUrl()}/auth/logout`, {
          method: 'POST',
          body: { refreshToken: currentRefresh }
        });
      }
    } catch {
    } finally {
      clearSession();
    }
  }

  return {
    accessToken,
    refreshToken,
    username,
    role,
    user,
    isAuthenticated,
    isAdmin,
    setSession,
    clearSession,
    login,
    register,
    refresh,
    fetchMe,
    logout
  };
});

export default useAuthStore;
