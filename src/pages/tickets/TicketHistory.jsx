/**
 * src/pages/tickets/TicketHistory.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old system HAD a LogStatusHistory table and never wrote a single row to
 *   it, so a ticket's past was unknowable — you could see the current status and
 *   nothing about how it got there. The new backend records every transition
 *   with who made it and why; this renders that.
 *
 * WHAT IT ACHIEVES
 *   A timeline answering "what happened to this ticket, and who did it" —
 *   status changes and SLA escalations merged into one chronological view,
 *   because to a reader they are the same story.
 */
import { Box, Typography, Stack, Chip } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import EmptyState from '../../components/EmptyState.jsx';
import HistoryIcon from '@mui/icons-material/History';
import { STATUS_META } from '../../components/StatusChip.jsx';
import { NEUTRAL, STATUS } from '../../theme/tokens.js';

export default function TicketHistory({ history = [], escalations = [] }) {
  // Merge both streams so the timeline reads as one sequence of events.
  const events = [
    ...history.map((h) => ({
      kind: 'status',
      at: h.createdAt,
      toStatus: h.toStatus,
      fromStatus: h.fromStatus,
      note: h.note,
      actor: h.changedBy?.name,
    })),
    ...escalations.map((e) => ({
      kind: 'escalation',
      at: e.createdAt,
      level: e.level,
      note: e.reason,
    })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at));

  if (events.length === 0) {
    return <EmptyState icon={HistoryIcon} title="No history yet" dense />;
  }

  return (
    <Stack spacing={0}>
      {events.map((event, index) => {
        const isEscalation = event.kind === 'escalation';
        const meta = isEscalation ? null : STATUS_META[event.toStatus];
        const Icon = isEscalation ? ReportProblemIcon : meta?.Icon;
        const tone = isEscalation ? STATUS.error : meta?.tone ?? STATUS.neutral;
        const last = index === events.length - 1;

        return (
          <Stack key={`${event.kind}-${event.at}-${index}`} direction="row" spacing={2}>
            {/* Timeline rail */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <Box
                sx={{
                  width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  backgroundColor: tone.light, color: tone.main, flexShrink: 0,
                }}
              >
                {Icon && <Icon sx={{ fontSize: 15 }} />}
              </Box>
              {!last && <Box sx={{ width: 2, flex: 1, minHeight: 24, backgroundColor: NEUTRAL[100], my: 0.5 }} />}
            </Box>

            <Box sx={{ pb: last ? 0 : 2.5, minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {isEscalation
                    ? `Escalated to level ${event.level}`
                    : event.fromStatus
                      ? `${STATUS_META[event.fromStatus]?.label ?? event.fromStatus} → ${meta?.label ?? event.toStatus}`
                      : `Created as ${meta?.label ?? event.toStatus}`}
                </Typography>
                {isEscalation && (
                  <Chip size="small" label="SLA" sx={{ backgroundColor: STATUS.error.light, color: STATUS.error.dark }} />
                )}
              </Stack>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {new Date(event.at).toLocaleString()}
                {event.actor ? ` · ${event.actor}` : ''}
              </Typography>

              {event.note && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, fontStyle: 'italic' }}>
                  {event.note}
                </Typography>
              )}
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
}
