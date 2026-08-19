/**
 * src/pages/reports/SlaComplianceReport.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   This report did not exist in the old system, in any form. The backend stored
 *   SLA deadlines and a job escalated against them, but nothing could answer the
 *   question the whole product is built around: "are we actually meeting our
 *   SLAs?"
 *
 * WHAT IT ACHIEVES
 *   Headline compliance, a breakdown per priority (so you can see whether it is
 *   the CRITICAL tickets slipping, which matters far more than the LOW ones),
 *   and the count of tickets breached right now.
 */
import { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Stack, LinearProgress,
  TextField, Alert, Skeleton, Chip,
} from '@mui/material';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/DataTable.jsx';
import useApi from '../../hooks/useApi.js';
import { reports as reportsApi } from '../../api/services/index.js';
import { PRIORITY_META } from '../../components/PriorityChip.jsx';
import { STATUS } from '../../theme/tokens.js';

/** Above 90% is healthy, 70-90 needs watching, below is a problem. */
function complianceTone(pct) {
  if (pct == null) return STATUS.neutral;
  if (pct >= 90) return STATUS.success;
  if (pct >= 70) return STATUS.warning;
  return STATUS.error;
}

function BigMetric({ label, value, suffix = '', caption, tone }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">{label}</Typography>
        <Typography sx={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.15, color: tone?.main ?? 'text.primary' }}>
          {value ?? '—'}{value != null && suffix}
        </Typography>
        {caption && <Typography variant="caption" color="text.secondary">{caption}</Typography>}
        {typeof value === 'number' && suffix === '%' && (
          <LinearProgress
            variant="determinate"
            value={value}
            sx={{
              height: 5, borderRadius: 3, mt: 1.5,
              '& .MuiLinearProgress-bar': { backgroundColor: tone?.main, borderRadius: 3 },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default function SlaComplianceReport() {
  const [range, setRange] = useState({ from: '', to: '' });

  const params = {
    ...(range.from && { from: new Date(range.from).toISOString() }),
    ...(range.to && { to: new Date(range.to).toISOString() }),
  };

  const { data, loading, error } = useApi(() => reportsApi.slaCompliance(params), [range.from, range.to]);

  const byPriority = Object.entries(data?.byPriority ?? {}).map(([priority, stats]) => ({
    id: priority,
    priority,
    ...stats,
  }));

  const resolutionTone = complianceTone(data?.resolutionCompliancePercent);
  const responseTone = complianceTone(data?.responseCompliancePercent);

  return (
    <>
      <PageHeader
        title="SLA compliance"
        subtitle="Whether tickets are being resolved within their agreed service targets."
        action={
          <Stack direction="row" spacing={1.5}>
            <TextField
              type="date" size="small" label="From" InputLabelProps={{ shrink: true }}
              value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              sx={{ width: 160 }}
            />
            <TextField
              type="date" size="small" label="To" InputLabelProps={{ shrink: true }}
              value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              sx={{ width: 160 }}
            />
          </Stack>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error.message}</Alert>}

      {loading ? (
        <Grid container spacing={2.5}>
          {[0, 1, 2].map((i) => <Grid item xs={12} md={4} key={i}><Skeleton variant="rounded" height={150} /></Grid>)}
        </Grid>
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <BigMetric
                label="Resolution SLA met"
                value={data?.resolutionCompliancePercent}
                suffix="%"
                caption={`of ${data?.resolvedTickets ?? 0} resolved tickets`}
                tone={resolutionTone}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <BigMetric
                label="Response SLA met"
                value={data?.responseCompliancePercent}
                suffix="%"
                caption="Assigned within the response window"
                tone={responseTone}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <BigMetric
                label="Breached right now"
                value={data?.currentlyBreachedOpenTickets}
                caption="Open tickets already past their deadline"
                tone={data?.currentlyBreachedOpenTickets > 0 ? STATUS.error : STATUS.success}
              />
            </Grid>
          </Grid>

          <Typography variant="h4" sx={{ mb: 1.5 }}>By priority</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A dip in CRITICAL compliance matters far more than the same dip in LOW.
          </Typography>

          <DataTable
            columns={[
              {
                id: 'priority',
                label: 'Priority',
                render: (r) => (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 3, height: 15, borderRadius: 1, backgroundColor: PRIORITY_META[r.priority]?.color }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {PRIORITY_META[r.priority]?.label ?? r.priority}
                    </Typography>
                  </Stack>
                ),
              },
              { id: 'total', label: 'Resolved', render: (r) => <Typography variant="body2">{r.total}</Typography> },
              { id: 'metResolution', label: 'Met deadline', render: (r) => <Typography variant="body2">{r.metResolution}</Typography> },
              {
                id: 'compliancePercent',
                label: 'Compliance',
                width: 220,
                render: (r) => {
                  const tone = complianceTone(r.compliancePercent);
                  return (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <LinearProgress
                        variant="determinate"
                        value={r.compliancePercent ?? 0}
                        sx={{
                          flex: 1, height: 6, borderRadius: 3,
                          '& .MuiLinearProgress-bar': { backgroundColor: tone.main, borderRadius: 3 },
                        }}
                      />
                      <Chip
                        size="small"
                        label={`${r.compliancePercent ?? 0}%`}
                        sx={{ backgroundColor: tone.light, color: tone.dark, minWidth: 52 }}
                      />
                    </Stack>
                  );
                },
              },
            ]}
            rows={byPriority}
            emptyTitle="No resolved tickets in this period"
            emptyDescription="Compliance can only be measured once tickets have been resolved."
          />
        </>
      )}
    </>
  );
}
