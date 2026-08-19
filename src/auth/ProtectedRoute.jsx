/**
 * src/auth/ProtectedRoute.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old App.js registered `/admindashboard/*` as a plain route. Typing that
 *   URL rendered the admin console for anybody — signed in or not, any role.
 *   The only thing standing between a staff member and the admin screens was
 *   not knowing the path.
 *
 *   (The real fix is server-side, and the new API enforces this properly. This
 *   is the UI half: don't show people doors they cannot open.)
 *
 * WHAT IT ACHIEVES
 *   Wraps a route so it renders only for a signed-in user holding one of the
 *   allowed roles. Anyone else is redirected — to login if unauthenticated, or
 *   to their own home if they are simply the wrong role.
 *
 *   `state={{ from }}` remembers where they were heading, so signing in returns
 *   them there instead of dumping them on a dashboard.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './AuthContext.jsx';

export default function ProtectedRoute({ allow = [], children }) {
  const { isAuthenticated, loading, hasRole, homePath } = useAuth();
  const location = useLocation();

  // Wait for the boot-time session check; redirecting now would sign out a
  // perfectly valid session on every page refresh.
  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allow.length > 0 && !hasRole(...allow)) {
    return <Navigate to={homePath} replace />;
  }

  return children;
}
