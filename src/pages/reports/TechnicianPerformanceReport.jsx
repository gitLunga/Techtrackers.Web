/**
 * src/pages/reports/TechnicianPerformanceReport.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces TechnicianPerformanceReport.jsx, which existed in both the admin
 *   and HOD folders with separate stylesheets.
 *
 *   Its numbers were wrong twice over: average resolution time was computed as
 *   `resolutionDue - assignedAt` (the SLA window, identical for every ticket of
 *   a given priority), and the rating came from a feedback table anyone could
 *   post to unlimited times as anyone.
 *
 * WHAT IT ACHIEVES
 *   A scorecard whose figures mean something: real elapsed resolution time, SLA
 *   compliance, resolution rate, and ratings that only the ticket's reporter
 *   could leave, once.
 */
import { useState } from 'react';
import { Stack, TextField, Typography, Box, LinearProgress, Chip, Rating, Avatar, Alert } from '@mui/material';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable, { CellStack } from '../../components/DataTable.jsx';
import useApi from '../../hooks/useApi.js';
import { reports as reportsApi } from '../../api/services/index.js';
import { STATUS } from '../../theme/tokens.js';

function complianceTone(pct) {
  if (pct == null) return STATUS.neutral;
  if (pct >= 90) return STATUS.success;
  if (pct >= 70) return STATUS.warning;
  return STATUS.error;
}

export default function TechnicianPerformanceReport() {
  const [range, setRange] = useState({ from: '', to: '' });

  const params = {
    ...(range.from && { from: new Date(range.from).toISOString() }),
    ...(range.to && { to: new Date(range.to).toISOString() }),
  };

  const { data, loading, error } = useApi(
    () => reportsApi.technicianPerformance(params),
    [range.from, range.to],
  );

  const columns = [
    {
      id: 'technicianName',
      label: 'Technician',
      render: (r) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.6875rem' }}>
            {r.technicianName.split(' ').map((p) => p[0]).join('').slice(0, 2)}
          </Avatar>
          <CellStack primary={r.technicianName} secondary={r.department} />
        </Stack>
      ),
    },
    { id: 'assignedIssues', label: 'Assigned', render: (r) => <Typography variant="body2">{r.assignedIssues}</Typography> },
    { id: 'resolvedIssues', label: 'Resolved', render: (r) => <Typography variant="body2">{r.resolvedIssues}</Typography> },
    { id: 'openIssues', label: 'Open', render: (r) => <Typography variant="body2">{r.openIssues}</Typography>, hideBelow: 'md' },
    {
      id: 'averageResolutionHours',
      label: 'Avg resolution',
      render: (r) => (
        <Typography variant="body2">
          {r.averageResolutionHours != null ? `${r.averageResolutionHours}h` : '—'}
        </Typography>
      ),
      hideBelow: 'md',
    },
    {
      id: 'slaCompliancePercent',
      label: 'SLA met',
      width: 170,
      render: (r) => {
        const tone = complianceTone(r.slaCompliancePercent);
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <LinearProgress
              variant="determinate"
              value={r.slaCompliancePercent ?? 0}
              sx={{ flex: 1, height: 5, borderRadius: 3, '& .MuiLinearProgress-bar': { backgroundColor: tone.main, borderRadius: 3 } }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, color: tone.main, minWidth: 34, textAlign: 'right' }}>
              {r.slaCompliancePercent != null ? `${r.slaCompliancePercent}%` : '—'}
            </Typography>
          </Stack>
        );
      },
    },
    {
      id: 'averageRating',
      label: 'Rating',
      render: (r) =>
        r.averageRating != null ? (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Rating value={r.averageRating} precision={0.1} readOnly size="small" max={5} />
            <Typography variant="caption" color="text.secondary">({r.totalRatings})</Typography>
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary">No ratings</Typography>
        ),
      hideBelow: 'lg',
    },
    {
      id: 'escalatedIssues',
      label: 'Escalated',
      render: (r) =>
        r.escalatedIssues > 0 ? (
          <Chip size="small" label={r.escalatedIssues} sx={{ backgroundColor: STATUS.error.light, color: STATUS.error.dark }} />
        ) : (
          <Typography variant="body2" color="text.secondary">0</Typography>
        ),
      hideBelow: 'lg',
    },
  ];

  return (
    <>
      <PageHeader
        title="Technician performance"
        subtitle="Measured from when a ticket was logged to when it was actually resolved."
        action={
          <Stack direction="row" spacing={1.5}>
            <TextField type="date" size="small" label="From" InputLabelProps={{ shrink: true }} value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} sx={{ width: 160 }} />
            <TextField type="date" size="small" label="To" InputLabelProps={{ shrink: true }} value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} sx={{ width: 160 }} />
          </Stack>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error.message}</Alert>}

      <DataTable
        columns={columns}
        rows={data ?? []}
        // These rows have no `id` - they are keyed by the technician.
        getRowKey={(row) => row.technicianId}
        loading={loading}
        emptyTitle="No technicians to report on"
        emptyDescription="Add users with a technician role, and assign them tickets."
      />
    </>
  );
}
