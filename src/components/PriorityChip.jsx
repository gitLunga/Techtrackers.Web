/**
 * src/components/PriorityChip.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Same reasoning as StatusChip. Priority drove the SLA but was rendered as
 *   plain text in the old tables, so the most operationally important field on
 *   a ticket was also the least visible.
 *
 * WHAT IT ACHIEVES
 *   Priority reads at a glance, consistently. Deliberately uses a filled left
 *   bar rather than a full colour block so a table of CRITICAL rows does not
 *   turn into a wall of red and drown out the status column beside it.
 */
import { Box, Typography } from '@mui/material';
import { STATUS, NEUTRAL } from '../theme/tokens.js';

export const PRIORITY_META = {
  LOW:      { label: 'Low',      color: NEUTRAL[400] },
  MEDIUM:   { label: 'Medium',   color: STATUS.info.main },
  HIGH:     { label: 'High',     color: STATUS.warning.main },
  CRITICAL: { label: 'Critical', color: STATUS.error.main },
};

export default function PriorityChip({ priority }) {
  const meta = PRIORITY_META[priority] ?? { label: priority ?? '—', color: NEUTRAL[300] };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width: 3, height: 14, borderRadius: 1, backgroundColor: meta.color, flexShrink: 0 }} />
      <Typography variant="body2" sx={{ fontWeight: 600, color: meta.color, fontSize: '0.8125rem' }}>
        {meta.label}
      </Typography>
    </Box>
  );
}
