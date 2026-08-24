/**
 * src/pages/admin/AuditLogAdmin.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The backend now records every admin mutation (user lifecycle, reference
 *   data changes) in `audit_logs` — see server/src/services/audit.service.js.
 *   Nothing surfaced that data until now; this is the read-only browser for it.
 *
 * WHAT IT ACHIEVES
 *   A paginated, filterable view of who did what and when. Admin-only, same as
 *   the endpoint it calls.
 */
import { useState } from 'react';
import { Stack, TextField, MenuItem, Typography, Chip } from '@mui/material';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable, { CellStack } from '../../components/DataTable.jsx';
import useApi from '../../hooks/useApi.js';
import { auditLogs as auditLogsApi } from '../../api/services/index.js';

const TARGET_TYPES = ['User', 'Department', 'Category', 'Sla'];

/** "user.deactivate" -> "Deactivate", shown alongside the target-type chip. */
function actionVerb(action) {
  const verb = action.split('.')[1] ?? action;
  return verb.charAt(0).toUpperCase() + verb.slice(1);
}

export default function AuditLogAdmin() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [targetType, setTargetType] = useState('');

  const { data: rows, meta, loading, error } = useApi(
    () => auditLogsApi.list({ page, limit, ...(targetType && { targetType }) }),
    [page, limit, targetType],
  );

  const columns = [
    {
      id: 'createdAt',
      label: 'When',
      render: (row) => (
        <CellStack
          primary={new Date(row.createdAt).toLocaleDateString()}
          secondary={new Date(row.createdAt).toLocaleTimeString()}
        />
      ),
      width: 140,
    },
    {
      id: 'actor',
      label: 'Admin',
      render: (row) => <CellStack primary={row.actor?.name ?? 'Unknown'} secondary={row.actor?.email} />,
    },
    {
      id: 'action',
      label: 'Action',
      render: (row) => (
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Chip size="small" variant="outlined" label={row.targetType} />
          <Typography variant="body2">{actionVerb(row.action)}</Typography>
        </Stack>
      ),
    },
    {
      id: 'targetId',
      label: 'Target',
      render: (row) => <Typography variant="body2" color="text.secondary">{row.targetId ? `#${row.targetId}` : '—'}</Typography>,
      hideBelow: 'sm',
    },
    {
      id: 'metadata',
      label: 'Detail',
      render: (row) => (
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }} noWrap>
          {row.metadata ? JSON.stringify(row.metadata) : '—'}
        </Typography>
      ),
      hideBelow: 'md',
    },
  ];

  return (
    <>
      <PageHeader
        title="Audit log"
        subtitle="Who changed what, across users and reference data."
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
        <TextField
          select
          label="Target type"
          value={targetType}
          onChange={(e) => { setTargetType(e.target.value); setPage(1); }}
          sx={{ maxWidth: { sm: 220 } }}
        >
          <MenuItem value="">All</MenuItem>
          {TARGET_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
      </Stack>

      <DataTable
        columns={columns}
        rows={rows ?? []}
        loading={loading}
        error={error}
        emptyTitle="No admin actions recorded yet"
        emptyDescription="User and reference-data changes made by admins will show up here."
        pagination={{
          page, limit, total: meta?.total ?? 0,
          onPageChange: setPage,
          onLimitChange: (l) => { setLimit(l); setPage(1); },
        }}
      />
    </>
  );
}
