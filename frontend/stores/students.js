import { defineStore } from 'pinia';

export function defaultFilters() {
  return {
    search: '',
    isuId: '',
    fullName: '',
    group: '',
    dormitoryNumber: '',
    room: '',
    accommodationFrom: '',
    accommodationTo: '',
    isInternational: '',
    notes: '',
    sortBy: 'isuId',
    order: 'asc',
    limit: 10,
    offset: 0
  };
}

let notificationTimer = null;

function resolveApiBase() {
  const config = useRuntimeConfig();
  if (import.meta.server && config.apiInternalBase) {
    return config.apiInternalBase;
  }
  if (config.public?.apiBase) {
    return config.public.apiBase;
  }
  return '/api';
}

function getAuthHeaders() {
  const token = useCookie('accessToken').value;
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export const useStudentStore = defineStore('students', {
  state: () => ({
    students: [],
    total: 0,
    loading: false,
    error: null,
    notification: null,
    filters: defaultFilters()
  }),

  getters: {
    currentPage: (state) => Math.floor(state.filters.offset / state.filters.limit) + 1,
    totalPages: (state) => Math.max(1, Math.ceil(state.total / state.filters.limit))
  },

  actions: {
    notify(message, type = 'success') {
      this.notification = { message, type };
      clearTimeout(notificationTimer);
      notificationTimer = setTimeout(() => {
        this.notification = null;
      }, 4000);
    },

    clearNotification() {
      clearTimeout(notificationTimer);
      this.notification = null;
    },

    resetFilters() {
      this.filters = defaultFilters();
    },

    async createStudent(payload) {
      const baseUrl = resolveApiBase();
      const created = await $fetch(`${baseUrl}/students`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: payload
      });
      this.notify(`Student ${created.fullName} (${created.isuId}) was added`);
      clearNuxtData();
      await refreshNuxtData();
      return created;
    },

    async updateStudent(isuId, payload) {
      const baseUrl = resolveApiBase();
      const updated = await $fetch(`${baseUrl}/students/${isuId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: payload
      });
      this.notify(`Student ${updated.fullName} (${isuId}) was updated`);
      clearNuxtData();
      await refreshNuxtData();
      return updated;
    },

    async deleteStudent(isuId) {
      const baseUrl = resolveApiBase();
      await $fetch(`${baseUrl}/students/${isuId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      this.notify(`Student ${isuId} was deleted`);
      clearNuxtData();
      await refreshNuxtData();
    }
  }
});

export default useStudentStore;