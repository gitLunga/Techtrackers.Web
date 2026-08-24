/**
 * src/layout/AppLayout.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old app had four complete dashboard shells — one per role — each with
 *   its own sidebar, header, CSS and routing. They drifted: the admin header had
 *   a search box the others lacked, the HOD sidebar didn't collapse, only the
 *   technician one showed a notification badge. Same product, four experiences.
 *
 * WHAT IT ACHIEVES
 *   ONE shell for every role. What differs between roles is only which nav items
 *   appear, which is a filter over navigation.js — not a different component.
 *
 *   Also fixes the responsive behaviour: the old sidebars were fixed-width divs
 *   that simply overlapped the content on a phone. Here the drawer is permanent
 *   on desktop and a temporary overlay on mobile, which is the standard pattern
 *   users already understand. Desktop users can further collapse the permanent
 *   drawer to an icon rail; that choice is remembered across reloads.
 */
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import AppSidebar from './AppSidebar.jsx';
import AppHeader from './AppHeader.jsx';
import { LAYOUT } from '../theme/tokens.js';

const COLLAPSE_STORAGE_KEY = 'techtrackers:sidebar-collapsed';

export default function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true',
  );

  useEffect(() => {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const sidebarWidth = isDesktop && collapsed ? LAYOUT.sidebarCollapsedWidth : LAYOUT.sidebarWidth;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppSidebar
        isDesktop={isDesktop}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={isDesktop && collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,   // lets wide tables scroll instead of stretching the page
          width: { lg: `calc(100% - ${sidebarWidth}px)` },
          transition: 'width 0.2s ease',
        }}
      >
        <AppHeader onMenuClick={() => setMobileOpen(true)} isDesktop={isDesktop} sidebarWidth={sidebarWidth} />
        {/* Spacer matching the fixed header, so content starts below it. */}
        <Toolbar sx={{ minHeight: `${LAYOUT.headerHeight}px !important` }} />

        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1440, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
