/**
 * src/api/client.js
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old frontend had NO API layer. All 41 components that talked to the
 *   server hard-coded `https://localhost:44328/api/...` inline, each with its
 *   own `fetch`, its own `response.ok` check and its own error handling. That
 *   meant:
 *     - changing the API host required editing 41 files
 *     - every component reinvented error handling, slightly differently
 *     - nothing could attach an auth token, because there wasn't one
 *
 * WHAT IT ACHIEVES
 *   ONE axios instance that every request goes through, with two interceptors:
 *
 *   REQUEST  — attaches `Authorization: Bearer <token>`. Components never think
 *              about auth again.
 *
 *   RESPONSE — unwraps the backend's `{ success, message, data }` envelope so
 *              callers get the payload directly, and on a 401 silently refreshes
 *              the access token and retries the original request ONCE. Because
 *              access tokens live 15 minutes, without this a user would be
 *              kicked out mid-session every quarter of an hour.
 *
 *   Concurrent 401s are queued behind a single refresh — otherwise a dashboard
 *   firing six requests at once would trigger six refreshes, and token rotation
 *   would invalidate five of them and log the user out.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const TOKEN_KEY = 'techtrackers.accessToken';
export const REFRESH_KEY = 'techtrackers.refreshToken';
export const USER_KEY = 'techtrackers.user';

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) ?? null;
    } catch {
      return null;
    }
  },
  set: ({ accessToken, refreshToken, user }) => {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Normalises anything thrown by axios into one predictable shape. */
export class ApiError extends Error {
  constructor(message, { status, errors, original } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;   // field-level validation failures from the backend
    this.original = original;
  }
  /** "title: must be at least 5 characters" — ready to show under a form field. */
  get fieldErrors() {
    if (!Array.isArray(this.errors)) return {};
    return this.errors.reduce((acc, e) => ({ ...acc, [e.field]: e.message }), {});
  }
}

function toApiError(error) {
  if (error.response) {
    const { status, data } = error.response;
    return new ApiError(data?.message || `Request failed (${status})`, {
      status,
      errors: data?.errors,
      original: error,
    });
  }
  if (error.code === 'ECONNABORTED') {
    return new ApiError('The server took too long to respond. Please try again.', { original: error });
  }
  return new ApiError('Cannot reach the server. Check your connection and that the API is running.', { original: error });
}

// --- single-flight refresh -------------------------------------------------
let refreshPromise = null;
let onUnauthenticated = () => {};

/** AuthContext registers what should happen when refreshing finally fails. */
export function setUnauthenticatedHandler(handler) {
  onUnauthenticated = handler;
}

async function refreshAccessToken() {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('No refresh token');

  // A bare axios call, NOT `api` — otherwise a failing refresh would recurse
  // through this same interceptor forever.
  const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
  tokenStore.set(data.data);
  return data.data.accessToken;
}

api.interceptors.response.use(
  // Unwrap { success, message, data } but keep `meta` reachable for paginated lists.
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      return { data: body.data, meta: body.meta, message: body.message };
    }
    return { data: body };
  },

  async (error) => {
    const request = error.config;
    const status = error.response?.status;

    const isRefreshCall = request?.url?.includes('/auth/refresh');
    const isLoginCall = request?.url?.includes('/auth/login');

    if (status === 401 && !request._retried && !isRefreshCall && !isLoginCall) {
      request._retried = true;
      try {
        // Everyone waits on the SAME refresh; token rotation makes parallel
        // refreshes actively harmful.
        refreshPromise = refreshPromise ?? refreshAccessToken().finally(() => { refreshPromise = null; });
        const token = await refreshPromise;
        request.headers.Authorization = `Bearer ${token}`;
        return api(request);
      } catch {
        tokenStore.clear();
        onUnauthenticated();
        return Promise.reject(new ApiError('Your session has expired. Please sign in again.', { status: 401 }));
      }
    }

    return Promise.reject(toApiError(error));
  },
);

export default api;
