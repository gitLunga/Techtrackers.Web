/**
 * src/App.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old App.js declared every route as public. Typing /admindashboard
 *   rendered the admin console for anyone — the only protection was not knowing
 *   the URL. It also contained three broken routes (`<issueReport />` with a
 *   lowercase name is parsed by JSX as an unknown HTML element, not a component,
 *   so those routes rendered nothing at all) and imported SignIn twice under two
 *   names.
 *
 * WHAT IT ACHIEVES
 *   The whole route table, with its access policy visible on the same line as
 *   each route. Four role areas share ONE layout; what differs is which nav
 *   items and screens each role can reach.
 *
 *   Screens still to be rebuilt point at <ComingSoon /> rather than being
 *   omitted, so the structure is navigable and nothing 404s silently.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import { useAuth, ROLES } from './auth/AuthContext.jsx';
import AppLayout from './layout/AppLayout.jsx';

import SignIn from './pages/auth/SignIn.jsx';
import StaffDashboard from './pages/staff/StaffDashboard.jsx';
import LogIssue from './pages/staff/LogIssue.jsx';
import ComingSoon from './pages/shared/ComingSoon.jsx';

const ALL_TECH = [ROLES.TECHNICIAN, ROLES.EXTERNAL_TECHNICIAN];

/** Sends "/" to the signed-in user's home, or to login if there isn't one. */
function RootRedirect() {
  const { isAuthenticated, loading, homePath } = useAuth();
  if (loading) return null;
  return <Navigate to={isAuthenticated ? homePath : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* ---------------------------------------------------------- public -- */}
      <Route path="/login" element={<SignIn />} />
      <Route path="/forgot-password" element={<ComingSoon title="Forgot password" />} />
      <Route path="/reset-password" element={<ComingSoon title="Reset password" />} />

      {/* ----------------------------------------------------------- staff -- */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allow={[ROLES.STAFF, ROLES.ADMIN, ROLES.HOD]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffDashboard />} />
        <Route path="log-issue" element={<LogIssue />} />
        <Route path="my-issues" element={<ComingSoon title="My issues" />} />
        <Route path="tickets/:id" element={<ComingSoon title="Ticket detail" />} />
        <Route path="notifications" element={<ComingSoon title="Notifications" />} />
        <Route path="profile" element={<ComingSoon title="My profile" />} />
        <Route path="change-password" element={<ComingSoon title="Change password" />} />
      </Route>

      {/* ------------------------------------------------------ technician -- */}
      <Route
        path="/technician"
        element={
          <ProtectedRoute allow={ALL_TECH}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ComingSoon title="Technician dashboard" />} />
        <Route path="assigned" element={<ComingSoon title="Assigned to me" />} />
        <Route path="collaborations" element={<ComingSoon title="Collaborations" />} />
        <Route path="ratings" element={<ComingSoon title="My ratings" />} />
        <Route path="tickets/:id" element={<ComingSoon title="Ticket detail" />} />
        <Route path="reports" element={<ComingSoon title="Reports" />} />
        <Route path="notifications" element={<ComingSoon title="Notifications" />} />
        <Route path="profile" element={<ComingSoon title="My profile" />} />
        <Route path="change-password" element={<ComingSoon title="Change password" />} />
      </Route>

      {/* ------------------------------------------------------------- HOD -- */}
      <Route
        path="/hod"
        element={
          <ProtectedRoute allow={[ROLES.HOD]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ComingSoon title="Department dashboard" />} />
        <Route path="tickets" element={<ComingSoon title="Department tickets" />} />
        <Route path="assign" element={<ComingSoon title="Assign work" />} />
        <Route path="technicians" element={<ComingSoon title="Technicians" />} />
        <Route path="log-issue" element={<LogIssue />} />
        <Route path="tickets/:id" element={<ComingSoon title="Ticket detail" />} />
        <Route path="reports" element={<ComingSoon title="Reports" />} />
        <Route path="reports/sla" element={<ComingSoon title="SLA compliance" />} />
        <Route path="reports/technicians" element={<ComingSoon title="Technician performance" />} />
        <Route path="notifications" element={<ComingSoon title="Notifications" />} />
        <Route path="profile" element={<ComingSoon title="My profile" />} />
        <Route path="change-password" element={<ComingSoon title="Change password" />} />
      </Route>

      {/* ----------------------------------------------------------- admin -- */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allow={[ROLES.ADMIN]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ComingSoon title="Admin dashboard" />} />
        <Route path="tickets" element={<ComingSoon title="All tickets" />} />
        <Route path="assign" element={<ComingSoon title="Assign work" />} />
        <Route path="technicians" element={<ComingSoon title="Technicians" />} />
        <Route path="log-issue" element={<LogIssue />} />
        <Route path="tickets/:id" element={<ComingSoon title="Ticket detail" />} />
        <Route path="users" element={<ComingSoon title="Users" />} />
        <Route path="departments" element={<ComingSoon title="Departments" />} />
        <Route path="categories" element={<ComingSoon title="Categories" />} />
        <Route path="slas" element={<ComingSoon title="SLA targets" />} />
        <Route path="reports" element={<ComingSoon title="Reports" />} />
        <Route path="reports/sla" element={<ComingSoon title="SLA compliance" />} />
        <Route path="reports/technicians" element={<ComingSoon title="Technician performance" />} />
        <Route path="notifications" element={<ComingSoon title="Notifications" />} />
        <Route path="profile" element={<ComingSoon title="My profile" />} />
        <Route path="change-password" element={<ComingSoon title="Change password" />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
