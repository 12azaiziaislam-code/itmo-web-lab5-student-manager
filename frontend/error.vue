<template>
  <div class="auth-fullscreen">
    <div class="auth-card text-center">
      <h1 style="font-size: 4rem; color: #e53e3e; margin: 0;">
        {{ error?.statusCode || 404 }}
      </h1>
      <h2>{{ errorTitle }}</h2>
      <p style="color: #4a5568; margin-bottom: 20px;">
        {{ errorMessage }}
      </p>
      <button class="btn btn-primary" @click="handleError">
        Back to Home
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  error: {
    type: Object,
    default: () => ({})
  }
});

const statusCode = computed(() => Number(props.error?.statusCode || 404));

const errorTitle = computed(() => {
  if (statusCode.value === 404) return 'Page Not Found';
  if (statusCode.value === 403) return 'Access Denied';
  if (statusCode.value === 401) return 'Unauthorized';
  return 'An Error Occurred';
});

const errorMessage = computed(() => {
  if (props.error?.statusMessage) return props.error.statusMessage;
  if (props.error?.message) return props.error.message;
  if (statusCode.value === 404) return 'The requested page or student record does not exist.';
  return 'Something went wrong while processing your request.';
});

function handleError() {
  clearError({ redirect: '/' });
}
</script>