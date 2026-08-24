/**
 * src/layout/AppSidebar.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Renders navigation.js for whoever is signed in. Replaces four hand-written
 *   sidebars and the ~40 duplicated PNG icons they depended on.
 *
 * WHAT IT ACHIEVES
 *   A single dark-teal rail carrying the brand. Active state is derived from the
 *   router, so it cannot fall out of sync with the URL — the old sidebars tracked
 *   the selected item in local state, which meant using the browser back button
 *   left the wrong item highlighted.
 *
 *   Desktop users can also collapse it to an icon-only rail (LAYOUT.sidebarCollapsedWidth) via
 *   the chevron in the brand row; the choice is remembered in localStorage by AppLayout.
 */
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Avatar, IconButton, Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../auth/AuthContext.jsx';
import { navigationFor } from './navigation.js';
import { LAYOUT, PRIMARY } from '../theme/tokens.js';

function SidebarContent({ onNavigate, collapsed = false, isDesktop = false, onToggleCollapse }) {
  const { user, roles, homePath } = useAuth();
  const location = useLocation();
  const groups = navigationFor(roles);

  const base = homePath;
  const initials = (user?.initials || user?.surname || '?').slice(0, 2).toUpperCase();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: PRIMARY.main, color: '#fff' }}>
      {/* Brand */}
      <Box sx={{ height: LAYOUT.headerHeight, display: 'flex', alignItems: 'center', gap: 1.5, px: collapsed ? 1.5 : 2.5, flexShrink: 0 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: 'secondary.main', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
          T
        </Box>
        {!collapsed && (
          <Typography noWrap sx={{ fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.01em', flexGrow: 1 }}>
            Techtrackers
          </Typography>
        )}
        {isDesktop && (
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <IconButton
              size="small"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              sx={{
                color: 'rgba(255,255,255,0.72)',
                ml: collapsed ? 0 : 'auto',
                '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.09)' }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: collapsed ? 1 : 1.5, py: 2 }}>
        {groups.map(({ section, items }) => (
          <Box key={section || 'main'} sx={{ mb: 2 }}>
            {section && !collapsed && (
              <Typography
                variant="overline"
                sx={{ px: 1.5, color: 'rgba(255,255,255,0.45)', fontSize: '0.6875rem', display: 'block', mb: 0.5 }}
              >
                {section}
              </Typography>
            )}
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {items.map((item) => {
                const to = item.to ? `${base}/${item.to}` : base;
                // Derived from the URL, so it always matches what is on screen.
                const active = item.exact
                  ? location.pathname === to
                  : location.pathname === to || location.pathname.startsWith(`${to}/`);

                const button = (
                  <ListItemButton
                    component={NavLink}
                    to={to}
                    end={item.exact}
                    onClick={onNavigate}
                    selected={active}
                    sx={{
                      minHeight: 40,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      color: active ? '#fff' : 'rgba(255,255,255,0.72)',
                      backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff' },
                      '&.Mui-selected:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 34, color: 'inherit', justifyContent: 'center' }}>
                      <item.icon sx={{ fontSize: 19 }} />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500 }}
                      />
                    )}
                  </ListItemButton>
                );

                return collapsed ? (
                  <Tooltip key={to} title={item.label} placement="right">
                    {button}
                  </Tooltip>
                ) : (
                  <Box key={to}>{button}</Box>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Signed-in user */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: '0.8125rem', fontWeight: 600 }}>
          {initials}
        </Avatar>
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              {user?.name ?? 'Signed in'}
            </Typography>
            <Typography noWrap sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>
              {roles[0]?.replace('_', ' ').toLowerCase() ?? ''}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function AppSidebar({ isDesktop, open, onClose, collapsed = false, onToggleCollapse }) {
  if (isDesktop) {
    const width = collapsed ? LAYOUT.sidebarCollapsedWidth : LAYOUT.sidebarWidth;
    return (
      <Drawer
        variant="permanent"
        sx={{
          width,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: 'width 0.2s ease',
          '& .MuiDrawer-paper': { width, borderRight: 'none', overflowX: 'hidden', transition: 'width 0.2s ease' },
        }}
      >
        <SidebarContent collapsed={collapsed} isDesktop onToggleCollapse={onToggleCollapse} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: LAYOUT.sidebarWidth, borderRight: 'none' } }}
    >
      <SidebarContent onNavigate={onClose} />
    </Drawer>
  );
}
