/**
 * src/pages/tickets/TicketList.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces SIX list screens: MyIssues.jsx, ViewAllLogs.jsx, AllIssues (HOD),
 *   Table.jsx (technician), InProgressIssuesPage.jsx and IssueSummaryPage.jsx.
 *   Each was a separate component with its own table markup, its own CSS module
 *   and its own hard-coded endpoint — five of which differed only in which
 *   filter they applied.
 *
 * WHAT IT ACHIEVES
 *   ONE list. The backend already scopes `GET /logs` by the caller's role, so
 *   staff see their own tickets, technicians see theirs and admins see
 *   everything — from the same request. This component only has to render.
 *
 *   Filters live in the URL (`?status=PENDING&overdue=true`), which means a
 *   filtered view is shareable, survives a refresh, and the browser back button
 *   works. The old screens kept filter state in React, so refreshing lost it.
 */
import { useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Card, CardContent, Grid, TextField, MenuItem, InputAdornment,
  Button, Stack, Typography, Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import AddCircleIcon from '@mui/icons-material/AddCircleOutline';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable, { CellStack } from '../../components/DataTable.jsx';
import StatusChip, { STATUS_META } from '../../components/StatusChip.jsx';
import PriorityChip, { PRIORITY_META } from '../../components/PriorityChip.jsx';
import SlaIndicator from '../../components/SlaIndicator.jsx';
import useApi from '../../hooks/useApi.js';
import useDebounced from '../../hooks/useDebounced.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { logs as logsApi } from '../../api/services/index.js';

export default function TicketList({ title = 'Tickets', subtitle, fixedFilters = {} }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { homePath, hasRole } = useAuth();

  const page = Number(params.get('page')) || 1;
  const limit = Number(params.get('limit')) || 20;
  const status = params.get('status') ?? '';
  const priority = params.get('priority') ?? '';
  const search = params.get('search') ?? '';
  const overdue = params.get('overdue') === 'true';

  // Typing shouldn't fire a request per keystroke.
  const debouncedSearch = useDebounced(search, 350);

  const query = useMemo(
    () => ({
      page, limit,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(overdue && { overdue: true }),
      ...fixedFilters,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, limit, status, priority, debouncedSearch, overdue, JSON.stringify(fixedFilters)],
  );

  const { data, meta, loading, error } = useApi(() => logsApi.list(query), [query]);

  /** Writes a filter into the URL and resets to page 1. */
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === '' || value == null || value === false) next.delete(key);
    else next.set(key, String(value));
    next.delete('page');
    setParams(next, { replace: true });
  };

  const hasFilters = Boolean(status || priority || search || overdue);

  const columns = [
    {
      id: 'reference',
      label: 'Ticket',
      render: (row) => <CellStack primary={row.reference} secondary={row.title} />,
    },
    {
      id: 'category',
      label: 'Category',
      render: (row) => <Typography variant="body2">{row.category?.name ?? '—'}</Typography>,
      hideBelow: 'lg',
    },
    { id: 'priority', label: 'Priority', render: (row) => <PriorityChip priority={row.priority} />, hideBelow: 'sm' },
    { id: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { id: 'sla', label: 'SLA', render: (row) => <SlaIndicator slaStatus={row.slaStatus} />, width: 140, hideBelow: 'md' },
    {
      id: 'assignedTo',
      label: 'Technician',
      render: (row) => (
        <Typography variant="body2" color={row.technician ? 'text.primary' : 'text.secondary'} noWrap>
          {row.assignedTo}
        </Typography>
      ),
      hideBelow: 'lg',
    },
  ];

  const canLogIssue = hasRole('STAFF', 'ADMIN', 'HOD');

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle ?? (meta?.total != null ? `${meta.total} ticket${meta.total === 1 ? '' : 's'}` : undefined)}
        action={
          canLogIssue && (
            <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => navigate(`${homePath}/log-issue`)}>
              Log an issue
            </Button>
          )
        }
      />

      {/* Filter bar */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                placeholder="Search reference, title or description"
                value={search}
                onChange={(e) => setFilter('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={2.5}>
              <TextField select label="Status" value={status} onChange={(e) => setFilter('status', e.target.value)}>
                <MenuItem value="">All statuses</MenuItem>
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <MenuItem key={value} value={value}>{meta.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} md={2.5}>
              <TextField select label="Priority" value={priority} onChange={(e) => setFilter('priority', e.target.value)}>
                <MenuItem value="">All priorities</MenuItem>
                {Object.entries(PRIORITY_META).map(([value, meta]) => (
                  <MenuItem key={value} value={value}>{meta.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                {/* The question a support desk actually asks first. */}
                <Button
                  variant={overdue ? 'contained' : 'outlined'}
                  color={overdue ? 'error' : 'primary'}
                  size="small"
                  onClick={() => setFilter('overdue', !overdue)}
                  sx={{ flexShrink: 0 }}
                >
                  Past SLA
                </Button>
                {hasFilters && (
                  <Button
                    size="small"
                    startIcon={<FilterAltOffIcon />}
                    onClick={() => setParams(new URLSearchParams(), { replace: true })}
                  >
                    Clear
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        rows={data ?? []}
        loading={loading}
        error={error}
        onRowClick={(row) => navigate(`${homePath}/tickets/${row.id}`, { state: { from: location.pathname + location.search } })}
        emptyTitle={hasFilters ? 'No tickets match these filters' : 'No tickets yet'}
        emptyDescription={
          hasFilters
            ? 'Try clearing a filter or widening your search.'
            : 'Tickets will appear here once issues are logged.'
        }
        pagination={{
          page,
          limit,
          total: meta?.total ?? 0,
          onPageChange: (p) => setFilter('page', p),
          onLimitChange: (l) => setFilter('limit', l),
        }}
      />
    </>
  );
}
