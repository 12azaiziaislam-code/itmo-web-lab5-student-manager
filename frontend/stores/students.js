import { defineStore } from 'pinia';

export function defaultFilters() {
  return {
    search: '', isuId: '', fullName: '', group: '',
    dormitoryNumber: '', room: '', accommodationFrom: '',
    accommodationTo: '', isInternational: '', notes: '',
    sortBy: 'isuId', order: 'asc', limit: 10, offset: 0
  };
}

export const useStudentStore = defineStore('students', {
  state: () => ({
    notification: null,
    filters: defaultFilters()
  }),

  actions: {
    notify(message, type = 'success') {
      this.notification = { message, type };
      setTimeout(() => { 
        this.notification = null; 
      }, 4000);
    },

    resetFilters() {
      this.filters = defaultFilters();
    },

    async createStudent(payload) {
      const token = useCookie('accessToken');
      const created = await $fetch('http://localhost:8080/api/students', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: payload
      });
      
      this.notify(`Student ${created.fullName} was added`);
      refreshNuxtData();
      return created;
    },

    async updateStudent(isuId, payload) {
      const token = useCookie('accessToken');
      const updated = await $fetch(`http://localhost:8080/api/students/${isuId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token.value}` },
        body: payload
      });
      
      this.notify(`Student ${updated.fullName} was updated`);
      refreshNuxtData();
      return updated;
    },

    async deleteStudent(isuId) {
      const token = useCookie('accessToken');
      await $fetch(`http://localhost:8080/api/students/${isuId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token.value}` }
      });
      
      this.notify(`Student ${isuId} was deleted`);
      refreshNuxtData();
    }
  }
});