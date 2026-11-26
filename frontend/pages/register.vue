<template>
  <div>
    <h2>Create Account</h2>

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
          maxlength="50"
          autocomplete="username"
          placeholder="3-50 characters"
        />
        <small v-if="errors.username" class="error-msg">{{ errors.username }}</small>
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          maxlength="100"
          autocomplete="email"
          placeholder="student@itmo.ru"
        />
        <small v-if="errors.email" class="error-msg">{{ errors.email }}</small>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          maxlength="100"
          autocomplete="new-password"
          placeholder="At least 6 characters"
        />
        <small v-if="errors.password" class="error-msg">{{ errors.password }}</small>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          maxlength="100"
          autocomplete="new-password"
          placeholder="Repeat password"
        />
        <small v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</small>
      </div>

      <div class="form-group">
        <label for="role">Role</label>
        <select id="role" v-model="form.role">
          <option value="USER">USER (Read-only)</option>
          <option value="ADMIN">ADMIN (Full CRUD)</option>
        </select>
        <small v-if="errors.role" class="error-msg">{{ errors.role }}</small>
      </div>

      <div class="auth-actions">
        <button type="submit" class="btn btn-success" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating account...' : 'Register' }}
        </button>

        <div class="text-center" style="font-size: 14px; margin-top: 6px;">
          Already have an account?
          <NuxtLink to="/login">Sign In</NuxtLink>
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
  email: '',
  password: '',
  confirmPassword: '',
  role: 'USER'
});

const errors = ref({});
const serverError = ref('');

function validate() {
  const e = {};
  const username = form.username.trim();
  const email = form.email.trim();

  if (!username) {
    e.username = 'Username is required';
  } else if (username.length < 3 || username.length > 50) {
    e.username = 'Username must be between 3 and 50 characters';
  }

  if (!email) {
    e.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
    e.email = 'Invalid email format';
  }

  if (!form.password) {
    e.password = 'Password is required';
  } else if (form.password.length < 6 || form.password.length > 100) {
    e.password = 'Password must be at least 6 characters';
  }

  if (form.confirmPassword !== form.password) {
    e.confirmPassword = 'Passwords do not match';
  }

  if (!['USER', 'ADMIN'].includes(form.role)) {
    e.role = 'Role must be USER or ADMIN';
  }

  errors.value = e;
  return Object.keys(e).length === 0;
}

const { isSubmitting, submit: handleSubmit } = useSubmit(async () => {
  serverError.value = '';
  if (!validate()) return;

  try {
    await authStore.register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role
    });
    clearNuxtData();
    await navigateTo('/');
  } catch (err) {
    serverError.value = getErrorMessage(err, 'Registration failed');
  }
});
</script>
