/**
 * src/components/SlaIndicator.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   SLA tracking is what this product is FOR, and the old UI never showed it.
 *   The backend stored deadlines, a job escalated against them — and the only
 *   way a user learned a ticket was overdue was a notification after the fact.
 *
 * WHAT IT ACHIEVES
 *   Renders the `slaStatus` block the new API returns on every ticket as a
 *   progress bar with time remaining. Someone scanning a list can see which
 *   tickets are about to breach, before they do.
 *
 *   Colour tracks urgency rather than being decorative: teal while there is
 *   plenty of time, amber past 75%, red once breached.
 */
import { Box, LinearProgress, Tooltip, Typography } from '@mui/material';
import { STATUS, SECONDARY, NEUTRAL } from '../theme/tokens.js';

/** "in 3h 20m" / "4h 10m overdue" — never a bare timestamp. */
function formatRemaining(minutes) {
  if (minutes == null) return 'No deadline';
  const overdue = minutes < 0;
  const total = Math.abs(minutes);
  const days = Math.floor(total / 1440);
  const hours = Math.floor((total % 1440) / 60);
  const mins = Math.round(total % 60);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (!days && mins) parts.push(`${mins}m`);
  const text = parts.join(' ') || '0m';

  return overdue ? `${text} overdue` : `in ${text}`;
}

export default function SlaIndicator({ slaStatus, showBar = true, compact = false }) {
  if (!slaStatus) return null;

  const { percentConsumed = 0, resolutionRemainingMinutes, resolutionBreached, terminal } = slaStatus;

  // A resolved or closed ticket has no live clock; showing one implies work is
  // still outstanding.
  if (terminal) {
    return (
      <Typography variant="caption" sx={{ color: STATUS.success.main, fontWeight: 600 }}>
        Completed
      </Typography>
    );
  }

  const tone = resolutionBreached
    ? STATUS.error.main
    : percentConsumed >= 75
      ? STATUS.warning.main
      : SECONDARY.main;

  const label = formatRemaining(resolutionRemainingMinutes);

  if (compact) {
    return (
      <Typography variant="caption" sx={{ color: tone, fontWeight: 600, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    );
  }

  return (
    <Tooltip title={`${percentConsumed}% of the SLA window used`}>
      <Box sx={{ minWidth: 116 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: tone, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {label}
          </Typography>
        </Box>
        {showBar && (
          <LinearProgress
            variant="determinate"
            value={Math.min(100, percentConsumed)}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: NEUTRAL[100],
              '& .MuiLinearProgress-bar': { backgroundColor: tone, borderRadius: 2 },
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
}
