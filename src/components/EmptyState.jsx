/**
 * src/components/EmptyState.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old tables rendered nothing at all when there was no data — just a
 *   header row above blank space. A user cannot tell "you have no tickets" from
 *   "this failed to load", and the second is alarming.
 *
 * WHAT IT ACHIEVES
 *   Says plainly that there is nothing here, why, and usually offers the action
 *   that would create the first item.
 */
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import { NEUTRAL } from '../theme/tokens.js';

export default function EmptyState({
  icon: Icon = InboxIcon,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  dense = false,
}) {
  return (
    <Box sx={{ textAlign: 'center', py: dense ? 4 : 8, px: 3 }}>
      <Box
        sx={{
          width: 56, height: 56, mx: 'auto', mb: 2,
          borderRadius: '50%', display: 'grid', placeItems: 'center',
          backgroundColor: NEUTRAL[50], color: NEUTRAL[400],
        }}
      >
        <Icon sx={{ fontSize: 26 }} />
      </Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 3 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
