/**
 * src/components/PageHeader.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Every screen in the old app rolled its own title bar, so heading sizes,
 *   margins and the position of the primary action varied page to page. That
 *   inconsistency is the first thing a user notices, even if they cannot name it.
 *
 * WHAT IT ACHIEVES
 *   One title treatment for every page: title, optional subtitle, optional
 *   breadcrumb, and a slot for actions on the right. Screens stop making
 *   layout decisions.
 */
import { Box, Breadcrumbs, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function PageHeader({ title, subtitle, breadcrumbs = [], action }) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }}>
          {breadcrumbs.map((crumb, i) =>
            crumb.to && i < breadcrumbs.length - 1 ? (
              <Link key={crumb.label} component={RouterLink} to={crumb.to} variant="body2">
                {crumb.label}
              </Link>
            ) : (
              <Typography key={crumb.label} variant="body2" color="text.secondary">
                {crumb.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <Box>
          <Typography variant="h2">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
    </Box>
  );
}
