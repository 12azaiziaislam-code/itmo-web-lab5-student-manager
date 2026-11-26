export function getErrorMessage(err, defaultText = 'Something went wrong') {
  if (!err) return defaultText;

  const data = err.data || err.response?._data || err.response?.data;
  const status = err.statusCode || err.status || err.response?.status || data?.status;

  if (data) {
    if (typeof data === 'string' && data.trim()) return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
  }

  if (status === 401) return 'Unauthorized. Please log in again.';
  if (status === 403) return 'ADMIN role is required for this action.';
  if (status === 404) return 'Requested resource was not found.';
  if (status === 409) return 'Record with the same data already exists.';
  if (status === 422) return 'Validation error. Please check your input.';
  if (status >= 500) return 'Internal server error. Please try again later.';

  if (err.message) return err.message;
  return defaultText;
}

export default getErrorMessage;