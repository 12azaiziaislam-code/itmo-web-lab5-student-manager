<template>
  <div class="auth-fullscreen">
    <div class="auth-card text-center">
      <h1 style="font-size: 4rem; color: #e53e3e; margin: 0;">
        {{ error?.statusCode || 404 }}
      </h1>
      <h2>Error Occurred</h2>
      <p style="color: #4a5568; margin-bottom: 20px;">
        {{ error?.message || 'Page not found.' }}
      </p>
      <button class="btn btn-primary" @click="handleError">
        Go to Home
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const handleError = () => {
  clearError({ redirect: '/' })
}
</script>