import { useAuthStore } from '~/stores/auth';

function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000 - 10_000;
}

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  const hasValidAccess = Boolean(authStore.accessToken) && !isTokenExpired(authStore.accessToken);

  if (!hasValidAccess) {
    if (!authStore.refreshToken) {
      authStore.clearSession();
      return navigateTo('/login', { redirectCode: 302 });
    }

    try {
      await authStore.refresh();
    } catch {
      authStore.clearSession();
      return navigateTo('/login', { redirectCode: 302 });
    }
  }

  if (!authStore.role && authStore.accessToken) {
    const payload = decodeJwtPayload(authStore.accessToken);
    if (payload?.role) {
      authStore.role = payload.role;
    }
  }

  const requiredRole = to.meta.requiredRole;
  if (requiredRole && authStore.role !== requiredRole) {
    return abortNavigation(
      createError({
        statusCode: 403,
        statusMessage: `Access denied. ${requiredRole} role is required.`
      })
    );
  }
});
