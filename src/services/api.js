  // src/services/api.js
import axios from 'axios';

const getBaseUrl = () => {
  let url = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
};

const API = axios.create({
  baseURL: getBaseUrl(),
});

// Token interceptor - প্রতিটি request এর সাথে token পাঠাও
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ================================
// AUTH API
// ================================
export const auth = {
  // Login
  login: (credentials) => API.post('/auth/login', credentials),
  
  // Register
  register: (userData) => API.post('/auth/register', userData),
  
  // Password Reset Request
  requestPasswordReset: (email) => API.post('/auth/request-password-reset', { email }),
  
  // Password Reset Perform
  resetPassword: (data) => API.post('/auth/reset-password', data),
  
  // Verify Email (Link)
  verifyEmail: (token, id) => API.get(`/auth/verify-email?token=${token}&id=${id}`),
  verifyEmailByLink: ({ token, id }) => API.get(`/auth/verify-email?token=${token}&id=${id}`),
  
  // Verify Email (OTP)
  verifyEmailByOtp: ({ email, otp }) => API.post('/auth/verify-otp', { email, otp }),
  
  // Resend Verification Email / OTP
  resendVerification: (email) => API.post('/auth/resend-verification', { email }),
  resendOTP: ({ email }) => API.post('/auth/resend-otp', { email }),
  
  // Get User Profile
  getUserProfile: (username) => API.get(`/auth/profile/${username}`),
  
  // Get User Profile with Stats
  getUserProfileWithStats: (username) => API.get(`/auth/profile/stats/${username}`),
  
  // Update Profile
  updateProfile: (data) => API.patch('/auth/profile', data),
  
  // Update Name
  updateName: (name) => API.patch('/auth/profile/update-name', { name }),
  
  // Update Username
  updateUsername: (username) => API.patch('/auth/profile/update-username', { username }),
  
  // Update Email
  updateEmail: (data) => API.patch('/auth/profile/update-email', data),
  
  // Delete Account
  deleteAccount: () => API.delete('/auth/delete'),
};

// ================================
// NOTES API
// ================================
export const notes = {
  // Get all notes
  getAll: () => API.get('/note'),
  getNotes: () => API.get('/note'),
  
  // Get deleted notes (trash)
  getDeleted: () => API.get('/note/trash'),
  getDeletedNotes: () => API.get('/note/trash'),
  
  // Get single note
  getOne: (id) => API.get(`/note/${id}`),
  getNote: (id) => API.get(`/note/${id}`),
  
  // Create note
  create: (data) => API.post('/note', data),
  createNote: (data) => API.post('/note', data),
  
  // Update note
  update: (id, data) => API.patch(`/note/${id}`, data),
  updateNote: (id, data) => API.post(`/note/${id}`, data),
  
  // Delete note (soft delete)
  delete: (id) => API.delete(`/note/${id}`),
  deleteNote: (id) => API.delete(`/note/${id}`),
  
  // Restore note
  restore: (id) => API.post(`/note/${id}/restore`),
  restoreNote: (id) => API.post(`/note/${id}/restore`),
  
  // Hard delete note
  hardDelete: (id) => API.delete(`/note/trash/${id}`),
  hardDeleteNote: (id) => API.delete(`/note/trash/${id}`),
  
  // Pin note
  pin: (id) => API.post(`/note/${id}/pin`),
  pinNote: (id) => API.post(`/note/${id}/pin`),
  
  // Unpin note
  unpin: (id) => API.post(`/note/${id}/unpin`),
  unpinNote: (id) => API.post(`/note/${id}/unpin`),
  
  // Share note with permission
  share: (id, username, permission = 'read') => API.post(`/note/${id}/share`, { username, permission }),
  shareNote: (id, payload) => API.post(`/note/${id}/share`, payload),
  unshareNote: (id, targetUserId) => API.post(`/note/${id}/unshare`, { targetUserId }),
  getSharedUsers: (id) => API.get(`/note/${id}/shared-users`),
  
  // Pin read-only copy
  pinReadOnly: (id, pinned) => API.post(`/note/${id}/pin-readonly`, { pinned }),
  pinReadOnlyCopy: (id, pinned) => API.post(`/note/${id}/pin-readonly`, { pinned }),
  
  // Delete read-only copy
  deleteReadOnly: (id) => API.delete(`/note/${id}/delete-readonly`),
  deleteReadOnlyCopy: (id) => API.delete(`/note/${id}/delete-readonly`),
};

// ================================
// ANALYTICS API
// ================================
export const analytics = {
  // Get dashboard summary
  getDashboardSummary: () => API.get('/analytics/dashboard-summary'),
  
  // Get notes analytics with client timezone
  getAnalytics: (timezone) => {
    const tz = timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Dhaka');
    return API.get(`/analytics/analytics?timezone=${encodeURIComponent(tz)}`);
  },
  getNotesAnalytics: (timezone) => {
    const tz = timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Dhaka');
    return API.get(`/analytics/analytics?timezone=${encodeURIComponent(tz)}`);
  },
  
  // Update session time
  updateSession: (data) => API.post('/analytics/update-session', typeof data === 'object' ? data : { time: data }),
};

// ================================
// ADMIN API
// ================================
export const admin = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (query = '') => API.get(`/admin/users${query ? `?q=${encodeURIComponent(query)}` : ''}`),
  updateRole: (id, role) => API.patch(`/admin/users/${id}/role`, { role }),
  toggleVerification: (id) => API.patch(`/admin/users/${id}/toggle-verify`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getSystemLogs: () => API.get('/admin/system-logs'),
  getChartAnalytics: () => API.get('/admin/chart-analytics'),
  getSmtpStatus: () => API.get('/admin/smtp-status'),
  sendTestEmail: (to) => API.post('/admin/send-test-email', { to }),
  getServerHealth: () => API.get('/admin/server-health'),
  getEmailLogs: (status = 'all', q = '') => API.get(`/admin/email-logs?status=${status}&q=${encodeURIComponent(q)}`),
  clearEmailLogs: () => API.delete('/admin/email-logs'),
  sendNotification: (data) => API.post('/admin/notifications/send', data),
  clearNotifications: () => API.delete('/admin/notifications'),
};

// ================================
// NOTIFICATIONS API
// ================================
export const notifications = {
  get: () => API.get('/notifications'),
  markRead: (id) => API.patch(`/notifications/${id}/read`),
  markAllRead: () => API.patch('/notifications/read-all'),
  delete: (id) => API.delete(`/notifications/${id}`),
};

// Default export
export default API;