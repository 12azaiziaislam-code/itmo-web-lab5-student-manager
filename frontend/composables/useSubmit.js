// frontend/composables/useSubmit.js
import { ref } from 'vue'

export function useSubmit(submitCallback) {
  const isSubmitting = ref(false)
  const error = ref(null)

  const submit = async (...args) => {
    isSubmitting.value = true
    error.value = null
    try {
      await submitCallback(...args)
    } catch (err) {
      error.value = err
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  return { isSubmitting, error, submit }
}