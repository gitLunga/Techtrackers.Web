/**
 * src/layout/AppHeader.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces AdminHeader.jsx, StaffHeader.jsx, TechnicianHeader.jsx and
 *   HOD/Header.js — four components doing the same job with four stylesheets.
 *
 * WHAT IT ACHIEVES
 *   One header: mobile menu button, live notification badge, and the account
 *   menu. The badge polls the new `/notifications/unread-count` endpoint, which
 *   is a single cheap COUNT — the old headers fetched the entire notification
 *   list just to render a number on it.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Badge, Avatar, Menu, MenuItem,
  ListItemIcon, Divider, Typography, Box, Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/PersonOutline';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useAuth } from '../auth/AuthContext.jsx';
import { notifications as notificationsApi } from '../api/services/index.js';
import { LAYOUT, NEUTRAL } from '../theme/tokens.js';

const POLL_INTERVAL_MS = 60_000;

export default function AppHeader({ onMenuClick, isDesktop }) {
  const { user, roles, signOut, homePath } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [unread, setUnread] = useState(0);

  // A cheap count, polled. Socket.IO pushes new notifications live; this is the
  // fallback that keeps the badge honest if a socket event is missed.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await notificationsApi.unreadCount();
        if (!cancelled) setUnread(data.unreadCount ?? 0);
      } catch {
        // A failing badge must never interrupt the user.
      }
    };
    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  const handleSignOut = async () => {
    setAnchorEl(null);
    await signOut();
    navigate('/login', { replace: true });
  };

  const initials = (user?.initials || user?.surname || '?').slice(0, 2).toUpperCase();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { lg: `calc(100% - ${LAYOUT.sidebarWidth}px)` },
        ml: { lg: `${LAYOUT.sidebarWidth}px` },
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${NEUTRAL[100]}`,
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ minHeight: `${LAYOUT.headerHeight}px !important`, gap: 1 }}>
        {!isDesktop && (
          <IconButton edge="start" onClick={onMenuClick} aria-label="Open navigation">
            <MenuIcon />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Notifications">
          <IconButton onClick={() => navigate(`${homePath}/notifications`)} aria-label={`${unread} unread notifications`}>
            <Badge badgeContent={unread} color="error" max={99}>
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8125rem', fontWeight: 600 }}>
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {user?.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {roles.join(', ').replace(/_/g, ' ')}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); navigate(`${homePath}/profile`); }}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            My profile
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); navigate(`${homePath}/change-password`); }}>
            <ListItemIcon><LockResetIcon fontSize="small" /></ListItemIcon>
            Change password
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleSignOut} sx={{ color: 'error.main' }}>
            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
