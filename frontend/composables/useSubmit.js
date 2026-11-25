import { ref } from 'vue';

export function useSubmit(fn) {
  const isSubmitting = ref(false);

  async function submit(...args) {
    if (isSubmitting.value) return;
    isSubmitting.value = true;
    try {
      return await fn(...args);
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    submit
  };
}

export default useSubmit;