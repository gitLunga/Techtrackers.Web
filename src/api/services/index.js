/**
 * src/api/services/index.js
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   This is the complete, typed-by-convention map of the backend. Every endpoint
 *   the app can call appears here exactly once, as a named function.
 *
 *   The old frontend spread 46 distinct URLs across 41 components as raw
 *   strings. Several were already broken before this rewrite — `/api/Account/
 *   RequestOtp/request-otp` and `/api/TechnicianHandler/AddTechnician/add` have
 *   the action segment twice (an artefact of ASP.NET's `[Route("api/
 *   [controller]/[action]")]` combined with `[HttpPost("add")]`), and
 *   `/api/TechnicianPerformance/GetAverageResolutionTime` had no controller at
 *   all. Nothing caught them, because a URL typo only fails at runtime.
 *
 * WHAT IT ACHIEVES
 *   A component calls `logs.list({ status: 'PENDING' })`. It cannot mistype a
 *   URL, because it never writes one. When the backend changes, this file
 *   changes — not 41 components.
 *
 *   Grouped by resource, mirroring the backend's own route files.
 */
import api from '../client.js';

/* ------------------------------------------------------------------ auth -- */
export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  // Password reset is three steps: request a code, optionally verify it, then reset.
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (email, code) => api.post('/auth/verify-otp', { email, code }),
  resetPassword: (email, code, newPassword) =>
    api.post('/auth/reset-password', { email, code, newPassword }),
};

/* ------------------------------------------------------------------ logs -- */
export const logs = {
  /**
   * One endpoint for every role. The backend scopes results from the JWT:
   * staff see their own tickets, technicians see theirs, HODs see their
   * department, admins see everything. The old app needed five different URLs
   * for this and let the CLIENT choose which — `?isTechnician=true` was a
   * query-string boolean.
   */
  list: (params = {}) => api.get('/logs', { params }),
  get: (id) => api.get(`/logs/${id}`),
  counts: () => api.get('/logs/counts'),

  /** Multipart, because a ticket can carry attachments. */
  create: (payload, files = []) => {
    if (!files.length) return api.post('/logs', payload);
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => v != null && form.append(k, v));
    files.forEach((file) => form.append('attachments', file));
    // Let the browser set the multipart boundary itself.
    return api.post('/logs', form, { headers: { 'Content-Type': undefined } });
  },

  changeStatus: (id, status, note) => api.patch(`/logs/${id}/status`, { status, note }),
  assign: (id, technicianId, reassign = false) => api.post(`/logs/${id}/assign`, { technicianId, reassign }),
  unassign: (id) => api.delete(`/logs/${id}/assign`),
  suggestTechnician: (id) => api.get(`/logs/${id}/suggest-technician`),
  reopen: (id, note) => api.post(`/logs/${id}/reopen`, { note }),
  escalate: (id, level, reason) => api.post(`/logs/${id}/escalate`, { level, reason }),

  /** Live SLA position — drives the countdown and progress bar. */
  slaStatus: (id) => api.get(`/logs/${id}/sla`),
  history: (id) => api.get(`/logs/${id}/history`),

  attachmentUrl: (logId, attachmentId) =>
    `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/logs/${logId}/attachments/${attachmentId}`,

  chat: {
    list: (logId, params) => api.get(`/logs/${logId}/chat`, { params }),
    send: (logId, message) => api.post(`/logs/${logId}/chat`, { message }),
  },
  feedbackFor: (logId) => api.get(`/logs/${logId}/feedback`),
};

/* ----------------------------------------------------------- technicians -- */
export const technicians = {
  /** Includes each technician's live open-ticket count for informed assignment. */
  list: (params = {}) => api.get('/technicians', { params }),
  /** Replaces the old five separate count endpoints with one call. */
  stats: (id) => api.get(`/technicians/${id}/stats`),
  rating: (id) => api.get(`/technicians/${id}/rating`),
};

/* ----------------------------------------------------------------- users -- */
export const users = {
  list: (params = {}) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (payload) => api.post('/users', payload),
  update: (id, payload) => api.patch(`/users/${id}`, payload),
  /** Deactivates rather than deletes — users are referenced by every ticket they touched. */
  deactivate: (id) => api.delete(`/users/${id}`),
  reactivate: (id) => api.post(`/users/${id}/reactivate`),
  roles: () => api.get('/users/roles'),
};

/* ------------------------------------------------------- reference data --- */
export const departments = {
  list: () => api.get('/departments'),
  get: (id) => api.get(`/departments/${id}`),
  create: (payload) => api.post('/departments', payload),
  update: (id, payload) => api.patch(`/departments/${id}`, payload),
  remove: (id) => api.delete(`/departments/${id}`),
};

export const categories = {
  list: () => api.get('/categories'),
  create: (name) => api.post('/categories', { name }),
  update: (id, name) => api.patch(`/categories/${id}`, { name }),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const slas = {
  list: () => api.get('/slas'),
  /** Upsert — one SLA per priority, so posting an existing priority updates it. */
  save: (payload) => api.post('/slas', payload),
  remove: (id) => api.delete(`/slas/${id}`),
};

/* -------------------------------------------------------- collaboration --- */
export const collaborations = {
  list: (params = {}) => api.get('/collaborations', { params }),
  request: (logId, inviteeId, message) => api.post('/collaborations', { logId, inviteeId, message }),
  respond: (id, status) => api.patch(`/collaborations/${id}`, { status }),
  cancel: (id) => api.delete(`/collaborations/${id}`),
};

/* -------------------------------------------------------- notifications --- */
export const notifications = {
  /** Always yours — no user id appears in any of these URLs. */
  list: (params = {}) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

/* ------------------------------------------------------------- feedback --- */
export const feedback = {
  submit: (logId, rating, comments) => api.post('/feedback', { logId, rating, comments }),
};

/* -------------------------------------------------------------- reports --- */
export const reports = {
  statusCounts: (params = {}) => api.get('/reports/status-counts', { params }),
  issues: (params = {}) => api.get('/reports/issues', { params }),
  monthlySummary: (params = {}) => api.get('/reports/monthly-summary', { params }),
  technicianPerformance: (params = {}) => api.get('/reports/technician-performance', { params }),
  /** New — the old backend stored SLA data but could not report compliance. */
  slaCompliance: (params = {}) => api.get('/reports/sla-compliance', { params }),
};

export default {
  auth, logs, technicians, users, departments, categories,
  slas, collaborations, notifications, feedback, reports,
};
