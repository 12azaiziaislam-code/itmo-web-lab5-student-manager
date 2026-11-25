// frontend/utils/errors.js

export function getErrorMessage(err, defaultText = 'Something went wrong') {
  // Handle Nuxt 3 $fetch errors
  if (err && err.data) {
    return err.data.message || err.data.error || defaultText;
  }
  if (err && err.response && err.response._data) {
    return err.response._data.message || err.response._data.error || defaultText;
  }
  if (err && err.message) {
    return err.message;
  }
  return defaultText;
}