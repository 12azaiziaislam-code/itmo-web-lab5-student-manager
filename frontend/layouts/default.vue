<template>
  <div class="container">
    <header class="app-header">
      <div>
        <h1>Student Management System</h1>
        <div v-if="username" class="user-badge">
          Signed in as <strong>{{ username }}</strong> ({{ role || 'USER' }})
        </div>
        <nav class="nav-links">
          <NuxtLink to="/">Students</NuxtLink>
          <NuxtLink to="/profile">Profile</NuxtLink>
        </nav>
      </div>
      <button v-if="isAuthenticated" type="button" class="btn btn-danger btn-sm" @click="handleLogout">
        Logout
      </button>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const accessToken = useCookie('accessToken');
const refreshToken = useCookie('refreshToken');
const username = useCookie('username');
const role = useCookie('role');

const isAuthenticated = computed(() => Boolean(accessToken.value));

async function handleLogout() {
  accessToken.value = null;
  refreshToken.value = null;
  username.value = null;
  role.value = null;
  await navigateTo('/login');
}
</script>
