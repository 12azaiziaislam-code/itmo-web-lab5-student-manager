<template>
  <div class="container">
    <header class="app-header">
      <div>
        <h1>Student Management System</h1>
        <div v-if="authStore.username" class="user-badge">
          Signed in as <strong>{{ authStore.username }}</strong> ({{ authStore.role || 'USER' }})
        </div>
        <nav class="nav-links">
          <NuxtLink to="/">Students</NuxtLink>
          <NuxtLink to="/profile">Profile</NuxtLink>
        </nav>
      </div>
      <button
        v-if="authStore.isAuthenticated"
        type="button"
        class="btn btn-danger btn-sm"
        @click="handleLogout"
      >
        Logout
      </button>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

async function handleLogout() {
  await authStore.logout();
  clearNuxtData();
  await navigateTo('/login');
}
</script>
