/**
 * src/App.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The complete route table, with each route's access policy on the same line.
 *   The old App.js declared everything public — typing /admindashboard rendered
 *   the admin console for anyone — and contained three routes that rendered
 *   nothing at all (`<issueReport />` with a lowercase name is parsed by JSX as
 *   an unknown HTML element, not a component).
 *
 * WHAT IT ACHIEVES
 *   Four role areas sharing ONE layout and, wherever the screen is genuinely the
 *   same job, one component. TicketList and TicketDetail each serve all four
 *   roles because the backend scopes data by the caller's token — so "the admin
 *   ticket list" and "the staff ticket list" are the same screen with different
 *   results, not two codebases.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import { useAuth, ROLES } from './auth/AuthContext.jsx';
import AppLayout from './layout/AppLayout.jsx';

// auth
import SignIn from './pages/auth/SignIn.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';

// shared
import RoleDashboard from './pages/shared/RoleDashboard.jsx';
import Notifications from './pages/shared/Notifications.jsx';
import Profile from './pages/shared/Profile.jsx';
import ChangePassword from './pages/shared/ChangePassword.jsx';

// tickets
import TicketList from './pages/tickets/TicketList.jsx';
import TicketDetail from './pages/tickets/TicketDetail.jsx';

// staff
import StaffDashboard from './pages/staff/StaffDashboard.jsx';
import LogIssue from './pages/staff/LogIssue.jsx';

// technician
import Collaborations from './pages/technician/Collaborations.jsx';
import TechniciansList from './pages/technician/TechniciansList.jsx';
import TechnicianStats from './pages/technician/TechnicianStats.jsx';

// admin
import UsersAdmin from './pages/admin/UsersAdmin.jsx';
import { DepartmentsAdmin, CategoriesAdmin, SlaAdmin } from './pages/admin/ReferenceAdmin.jsx';

// reports
import ReportsOverview from './pages/reports/ReportsOverview.jsx';
import SlaComplianceReport from './pages/reports/SlaComplianceReport.jsx';
import TechnicianPerformanceReport from './pages/reports/TechnicianPerformanceReport.jsx';

const ALL_TECH = [ROLES.TECHNICIAN, ROLES.EXTERNAL_TECHNICIAN];

function RootRedirect() {
  const { isAuthenticated, loading, homePath } = useAuth();
  if (loading) return null;
  return <Navigate to={isAuthenticated ? homePath : '/login'} replace />;
}

/** Routes every signed-in role gets, mounted inside each role's area. */
function commonRoutes() {
  return (
    <>
      <Route path="tickets/:id" element={<TicketDetail />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="profile" element={<Profile />} />
      <Route path="change-password" element={<ChangePassword />} />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ---------------------------------------------------------- public -- */}
      <Route path="/login" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ----------------------------------------------------------- staff -- */}
      <Route
        path="/staff"
        element={<ProtectedRoute allow={[ROLES.STAFF, ROLES.ADMIN, ROLES.HOD]}><AppLayout /></ProtectedRoute>}
      >
        <Route index element={<StaffDashboard />} />
        <Route path="log-issue" element={<LogIssue />} />
        <Route path="my-issues" element={<TicketList title="My issues" subtitle="Every issue you have logged." />} />
        {commonRoutes()}
      </Route>

      {/* ------------------------------------------------------ technician -- */}
      <Route path="/technician" element={<ProtectedRoute allow={ALL_TECH}><AppLayout /></ProtectedRoute>}>
        <Route index element={<RoleDashboard />} />
        <Route path="assigned" element={<TicketList title="Assigned to me" subtitle="Tickets you are responsible for resolving." />} />
        <Route path="collaborations" element={<Collaborations />} />
        <Route path="ratings" element={<TechnicianStats />} />
        <Route path="reports" element={<ReportsOverview />} />
        {commonRoutes()}
      </Route>

      {/* ------------------------------------------------------------- HOD -- */}
      <Route path="/hod" element={<ProtectedRoute allow={[ROLES.HOD]}><AppLayout /></ProtectedRoute>}>
        <Route index element={<RoleDashboard />} />
        <Route path="tickets" element={<TicketList title="Department tickets" />} />
        <Route path="assign" element={<TicketList title="Assign work" subtitle="Unassigned tickets waiting for a technician." fixedFilters={{ status: 'PENDING' }} />} />
        <Route path="technicians" element={<TechniciansList />} />
        <Route path="technicians/:id" element={<TechnicianStats />} />
        <Route path="log-issue" element={<LogIssue />} />
        <Route path="reports" element={<ReportsOverview />} />
        <Route path="reports/sla" element={<SlaComplianceReport />} />
        <Route path="reports/technicians" element={<TechnicianPerformanceReport />} />
        {commonRoutes()}
      </Route>

      {/* ----------------------------------------------------------- admin -- */}
      <Route path="/admin" element={<ProtectedRoute allow={[ROLES.ADMIN]}><AppLayout /></ProtectedRoute>}>
        <Route index element={<RoleDashboard />} />
        <Route path="tickets" element={<TicketList title="All tickets" />} />
        <Route path="assign" element={<TicketList title="Assign work" subtitle="Unassigned tickets waiting for a technician." fixedFilters={{ status: 'PENDING' }} />} />
        <Route path="technicians" element={<TechniciansList />} />
        <Route path="technicians/:id" element={<TechnicianStats />} />
        <Route path="log-issue" element={<LogIssue />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="departments" element={<DepartmentsAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="slas" element={<SlaAdmin />} />
        <Route path="reports" element={<ReportsOverview />} />
        <Route path="reports/sla" element={<SlaComplianceReport />} />
        <Route path="reports/technicians" element={<TechnicianPerformanceReport />} />
        {commonRoutes()}
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
