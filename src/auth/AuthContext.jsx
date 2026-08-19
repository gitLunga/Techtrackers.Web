/**
 * src/auth/AuthContext.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old app "authenticated" by writing the user object to localStorage in
 *   SignIn.jsx and then reading it back, per component, wherever it was needed.
 *   There was no token (the old backend issued none), no shared state, and no
 *   way to know if you were still signed in. Every screen re-parsed localStorage
 *   itself.
 *
 * WHAT IT ACHIEVES
 *   One source of truth for "who is signed in", exposed through `useAuth()`.
 *   Components read `user`, `hasRole(...)`, `signIn()`, `signOut()` and never
 *   touch localStorage.
 *
 *   On boot it re-validates the stored session against `GET /auth/me` rather
 *   than trusting localStorage: a token can be revoked or the account
 *   deactivated server-side while the browser tab was closed.
 */
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { auth as authApi } from '../api/services/index.js';
import { tokenStore, setUnauthenticatedHandler } from '../api/client.js';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'ADMIN',
  HOD: 'HOD',
  TECHNICIAN: 'TECHNICIAN',
  STAFF: 'STAFF',
  EXTERNAL_TECHNICIAN: 'EXTERNAL_TECHNICIAN',
};

/** Where each role lands after signing in. */
export const ROLE_HOME = {
  ADMIN: '/admin',
  HOD: '/hod',
  TECHNICIAN: '/technician',
  EXTERNAL_TECHNICIAN: '/technician',
  STAFF: '/staff',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStore.getUser());
  // `loading` starts true so ProtectedRoute waits for validation instead of
  // bouncing a signed-in user to /login for a frame.
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    const refreshToken = tokenStore.getRefresh();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // A failed logout call must never trap the user in the app.
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  // The API client calls this when a token refresh has definitively failed.
  useEffect(() => {
    setUnauthenticatedHandler(() => setUser(null));
  }, []);

  // Validate the stored session once, on boot.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStore.getAccess()) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        if (!cancelled) {
          setUser(data);
          tokenStore.set({ user: data });
        }
      } catch {
        if (!cancelled) {
          tokenStore.clear();
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data } = await authApi.login(email, password);
    tokenStore.set(data);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(() => {
    const roles = user?.roles ?? [];
    return {
      user,
      roles,
      loading,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
      /** hasRole('ADMIN', 'HOD') -> true if the user holds ANY of them. */
      hasRole: (...allowed) => allowed.some((r) => roles.includes(r)),
      isTechnician: roles.includes(ROLES.TECHNICIAN) || roles.includes(ROLES.EXTERNAL_TECHNICIAN),
      /** The landing route for whichever role this user holds. */
      homePath: ROLE_HOME[roles[0]] ?? '/staff',
      refreshUser: async () => {
        const { data } = await authApi.me();
        setUser(data);
        tokenStore.set({ user: data });
        return data;
      },
    };
  }, [user, loading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

export default AuthContext;
