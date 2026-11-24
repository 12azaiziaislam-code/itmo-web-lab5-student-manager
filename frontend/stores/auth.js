import { defineStore } from 'pinia';
import axios from 'axios';
import api from '../services/api';

function setCookie(name, value) {
  document.cookie = name + '=' + value + '; path=/; max-age=604800';
}

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) return value;
  }
  return null;
}

function removeCookie(name) {
  document.cookie = name + '=; path=/; max-age=0';
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: getCookie('accessToken'),
    refreshToken: getCookie('refreshToken'),
    username: getCookie('username'),
    role: getCookie('role'),
    profile: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.role === 'ADMIN'
  },

  actions: {
    async login(credentials) {
      const { data } = await api.post('/auth/login', credentials);
      this.setSession(data);
    },

    async register(userData) {
      const { data } = await api.post('/auth/register', userData);
      this.setSession(data);
    },

    async refresh() {
      const { data } = await axios.post('/api/auth/refresh', {
        refreshToken: this.refreshToken
      });
      this.setSession(data);
    },

    async fetchProfile(signal) {
      const { data } = await api.get('/users/me', { signal });
      this.profile = data;
      this.role = data.role;
      setCookie('role', data.role);
    },

    setSession(data) {
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.username = data.username;
      this.role = data.role;

      setCookie('accessToken', data.accessToken);
      setCookie('refreshToken', data.refreshToken);
      setCookie('username', data.username);
      setCookie('role', data.role);
    },

    logout() {
      if (this.refreshToken) {
        axios.post('/api/auth/logout', { refreshToken: this.refreshToken }).catch(() => {});
      }
      this.accessToken = null;
      this.refreshToken = null;
      this.username = null;
      this.role = null;
      this.profile = null;

      removeCookie('accessToken');
      removeCookie('refreshToken');
      removeCookie('username');
      removeCookie('role');
    }
  }
});