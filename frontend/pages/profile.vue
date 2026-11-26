<template>
  <div>
    <div style="margin-bottom: 15px;">
      <NuxtLink to="/" class="btn btn-secondary btn-sm">
        ← Back to Students
      </NuxtLink>
    </div>

    <div v-if="pending" class="card text-center" style="padding: 25px;">
      Loading profile...
    </div>

    <div v-else-if="error" class="card">
      <div class="alert-error">
        {{ getErrorMessage(error, 'Failed to load user profile') }}
      </div>
      <button type="button" class="btn btn-primary btn-sm" @click="refresh()">
        Retry
      </button>
    </div>

    <div v-else-if="profile" class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <h2 style="margin: 0;">User Profile</h2>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" @click="refresh()">
            Refresh
          </button>
          <button type="button" class="btn btn-danger btn-sm" @click="handleLogout">
            Logout
          </button>
        </div>
      </div>

      <table style="margin-top: 15px;">
        <tbody>
          <tr>
            <th style="width: 35%;">User ID</th>
            <td>{{ profile.id }}</td>
          </tr>
          <tr>
            <th>Username</th>
            <td>{{ profile.username }}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{{ profile.email }}</td>
          </tr>
          <tr>
            <th>Role</th>
            <td><strong>{{ profile.role }}</strong></td>
          </tr>
          <tr>
            <th>Permissions</th>
            <td>
              {{ profile.role === 'ADMIN'
                ? 'Full access (View, Create, Edit, Delete students)'
                : 'Read-only access (View and search students)' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useApi } from '~/composables/useApi';
import { getErrorMessage } from '~/utils/errors';

definePageMeta({
  middleware: 'auth'
});

const authStore = useAuthStore();
const { apiFetch } = useApi();

const { data: profile, pending, error, refresh } = await useAsyncData(
  'user-profile',
  async () => {
    const data = await apiFetch('/users/me');
    authStore.user = data;
    authStore.username = data.username;
    authStore.role = data.role;
    return data;
  }
);

async function handleLogout() {
  await authStore.logout();
  clearNuxtData();
  await navigateTo('/login');
}
</script>
