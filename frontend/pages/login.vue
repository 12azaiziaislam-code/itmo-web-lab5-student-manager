<template>
  <div>
    <h2>Sign In</h2>

    <div v-if="serverError" class="alert-error">
      {{ serverError }}
    </div>

    <form @submit.prevent="handleSubmit" novalidate>
      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          autocomplete="username"
          placeholder="Enter username"
        />
        <small v-if="errors.username" class="error-msg">{{ errors.username }}</small>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          placeholder="Enter password"
        />
        <small v-if="errors.password" class="error-msg">{{ errors.password }}</small>
      </div>

      <div class="auth-actions">
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
        </button>

        <div class="text-center" style="font-size: 14px; margin-top: 6px;">
          Don't have an account?
          <NuxtLink to="/register">Register</NuxtLink>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useSubmit } from '~/composables/useSubmit';
import { getErrorMessage } from '~/utils/errors';

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
});

const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: ''
});

const errors = ref({});
const serverError = ref('');

function validate() {
  const e = {};
  if (!form.username.trim()) {
    e.username = 'Username is required';
  }
  if (!form.password) {
    e.password = 'Password is required';
  }
  errors.value = e;
  return Object.keys(e).length === 0;
}

const { isSubmitting, submit: handleSubmit } = useSubmit(async () => {
  serverError.value = '';
  if (!validate()) return;

  try {
    await authStore.login({
      username: form.username.trim(),
      password: form.password
    });
    clearNuxtData();
    await navigateTo('/');
  } catch (err) {
    serverError.value = getErrorMessage(err, 'Invalid username or password');
  }
});
</script>
