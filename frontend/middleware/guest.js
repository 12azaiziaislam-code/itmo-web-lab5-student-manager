import { useAuthStore } from '~/stores/auth';

function isAccessTokenValid(token) {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    return Boolean(payload?.exp) && Date.now() < payload.exp * 1000 - 10_000;
  } catch {
    return false;
  }
}

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();

  if (isAccessTokenValid(authStore.accessToken)) {
    return navigateTo('/', { redirectCode: 302 });
  }

  if (authStore.refreshToken) {
    try {
      await authStore.refresh();
      return navigateTo('/', { redirectCode: 302 });
    } catch {
      authStore.clearSession();
    }
  }
});
