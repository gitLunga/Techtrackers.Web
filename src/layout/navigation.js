/**
 * src/layout/navigation.js
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old app had FOUR sidebars — Staff/Navigation/Sidebar.jsx,
 *   TECHNICIAN/TechnicianSidebar.jsx, ADMIN/.../AdminSidebar.jsx and
 *   HOD/Sidebar.js — each with its own JSX, its own CSS file and its own set of
 *   PNG icons (the same `dashboard.png` was duplicated into five folders).
 *   Adding a nav item meant editing four components consistently.
 *
 * WHAT IT ACHIEVES
 *   Navigation becomes DATA. One list, with each item declaring which roles may
 *   see it. AppSidebar renders whatever the current user is entitled to, so a
 *   role's menu is a filter over this array rather than a separate component.
 *
 *   Icons are MUI components, not PNGs: they inherit colour from the theme, stay
 *   crisp at any size, and cost nothing to download.
 */
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import AddCircleIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupsIcon from '@mui/icons-material/Groups';
import HandshakeIcon from '@mui/icons-material/Handshake';
import NotificationsIcon from '@mui/icons-material/NotificationsNone';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import TimerIcon from '@mui/icons-material/TimerOutlined';
import StarIcon from '@mui/icons-material/StarBorder';
import { ROLES } from '../auth/AuthContext.jsx';

const ALL_TECH = [ROLES.TECHNICIAN, ROLES.EXTERNAL_TECHNICIAN];

/**
 * `section` groups items under a heading in the sidebar.
 * `roles` is the allow-list; omit it to show the item to everyone.
 */
export const NAV_ITEMS = [
  // ---- everyone -----------------------------------------------------------
  { label: 'Dashboard', to: '', icon: DashboardIcon, exact: true },

  // ---- staff --------------------------------------------------------------
  { label: 'Log an Issue', to: 'log-issue', icon: AddCircleIcon, roles: [ROLES.STAFF, ROLES.ADMIN, ROLES.HOD] },
  { label: 'My Issues', to: 'my-issues', icon: ListAltIcon, roles: [ROLES.STAFF] },

  // ---- technician ---------------------------------------------------------
  { label: 'Assigned to Me', to: 'assigned', icon: AssignmentIndIcon, roles: ALL_TECH },
  { label: 'Collaborations', to: 'collaborations', icon: HandshakeIcon, roles: ALL_TECH },
  { label: 'My Ratings', to: 'ratings', icon: StarIcon, roles: ALL_TECH },

  // ---- admin / HOD --------------------------------------------------------
  { label: 'All Tickets', to: 'tickets', icon: ListAltIcon, roles: [ROLES.ADMIN, ROLES.HOD] },
  { label: 'Assign Work', to: 'assign', icon: AssignmentIndIcon, roles: [ROLES.ADMIN, ROLES.HOD] },
  { label: 'Technicians', to: 'technicians', icon: GroupsIcon, roles: [ROLES.ADMIN, ROLES.HOD] },

  // ---- reports ------------------------------------------------------------
  { section: 'Reports', label: 'Overview', to: 'reports', icon: BarChartIcon, roles: [ROLES.ADMIN, ROLES.HOD, ...ALL_TECH] },
  { section: 'Reports', label: 'SLA Compliance', to: 'reports/sla', icon: TimerIcon, roles: [ROLES.ADMIN, ROLES.HOD] },
  { section: 'Reports', label: 'Technician Performance', to: 'reports/technicians', icon: GroupsIcon, roles: [ROLES.ADMIN, ROLES.HOD] },

  // ---- administration -----------------------------------------------------
  { section: 'Administration', label: 'Users', to: 'users', icon: PeopleIcon, roles: [ROLES.ADMIN] },
  { section: 'Administration', label: 'Departments', to: 'departments', icon: ApartmentIcon, roles: [ROLES.ADMIN] },
  { section: 'Administration', label: 'Categories', to: 'categories', icon: CategoryIcon, roles: [ROLES.ADMIN] },
  { section: 'Administration', label: 'SLA Targets', to: 'slas', icon: TimerIcon, roles: [ROLES.ADMIN] },

  // ---- everyone -----------------------------------------------------------
  { label: 'Notifications', to: 'notifications', icon: NotificationsIcon },
];

/** The items this user may see, grouped by section, in declaration order. */
export function navigationFor(roles = []) {
  const visible = NAV_ITEMS.filter((item) => !item.roles || item.roles.some((r) => roles.includes(r)));

  const grouped = new Map();
  for (const item of visible) {
    const key = item.section ?? '';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  }
  return [...grouped.entries()].map(([section, items]) => ({ section, items }));
}
