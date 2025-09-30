// src/services/api.js

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor for attaching token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------- Auth API -----------------
export const auth = {
  register: (userData) => API.post('/auth/register', userData),

  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      if (response.data.token) localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed.';
    }
  },

  requestOtp: (email) => API.post('/auth/request-otp', { email }),
  verifyOtp: (otpData) => API.post('/auth/verify-otp', otpData),
  resetPassword: (passwordData) => API.post('/auth/reset-password', passwordData),
  getUserProfile: (username) => API.get(`/auth/profile/${username}`),
  deleteUser: () => API.delete('/auth/delete'),

  // Email verification
  verifyEmailByLink: ({ token, id }) => API.get(`/auth/verify-email?token=${token}&id=${id}`),
  verifyEmailByOtp: (otpData) => API.post('/auth/verify-email-otp', otpData),
  resendOTP: ({ email }) => API.post('/auth/resend-otp', { email }),

  // Profile updates
  updateUserProfile: (profileData) => API.patch('/auth/profile', profileData),
  getUserProfileWithStats: (username) => API.get(`/auth/profile/stats/${username}`),
  updateName: (name) => API.patch('/auth/profile/update-name', { name }),
  updateUsername: (username) => API.patch('/auth/profile/update-username', { username }),
  updateEmail: ({ newEmail, currentPassword }) => API.patch('/auth/profile/update-email', { newEmail, currentPassword }),
};

// ----------------- Notes API -----------------
export const notes = {
  createNote: (noteData) => API.post('/note', noteData),
  getNotes: () => API.get('/note'),
  getDeletedNotes: () => API.get('/note/trash'),
  getNote: (id) => API.get(`/note/${id}`),
  viewNote: (id) => API.get(`/note/${id}`),

  updateNote: (id, updateData) => API.patch(`/note/${id}`, updateData),
  deleteNote: (id) => API.delete(`/note/${id}`),
  restoreNote: (id) => API.patch(`/note/${id}/restore`),
  hardDeleteNote: (id) => API.delete(`/note/trash/${id}`),

  pinNote: (id) => API.patch(`/note/${id}/pin`),
  unpinNote: (id) => API.patch(`/note/${id}/unpin`),
  shareNote: (id, { username }) => API.patch(`/note/${id}/share`, { username }),
  pinReadOnlyCopy: (id, pinned) => API.patch(`/note/${id}/pin-readonly`, { pinned }),
  deleteReadOnlyCopy: (id) => API.delete(`/note/${id}/delete-readonly`),
};

// ----------------- Analytics API -----------------
export const analytics = {
  getDashboardSummary: () => API.get('/analytics/dashboard-summary'),
  getAnalytics: () => API.get('/analytics/analytics'),
  updateSession: (data) => API.post('/analytics/update-session', data),
};
