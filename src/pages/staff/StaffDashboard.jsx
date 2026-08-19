/**
 * src/pages/staff/StaffDashboard.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces WelcomeStaff.js + MainContent.js + staffdashboard.module.css +
 *   WelcomeStaff.module.css. The old dashboard showed a greeting and a static
 *   list; the counts it displayed came from four separate endpoints, each
 *   fetched in its own useEffect.
 *
 * WHAT IT ACHIEVES
 *   The tickets this person cares about, with their SLA position visible — which
 *   the old UI never showed at all, despite SLA being the point of the product.
 *
 *   Two requests total: one for counts, one for the recent list. The tiles are
 *   clickable and navigate to the filtered list, so a number is a way in rather
 *   than a dead end.
 */
import { useNavigate } from 'react-router-dom';
import { Grid, Button, Card, CardContent, Typography, Box, Stack } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircleOutline';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import PriorityChip from '../../components/PriorityChip.jsx';
import SlaIndicator from '../../components/SlaIndicator.jsx';
import DataTable, { CellStack } from '../../components/DataTable.jsx';
import useApi from '../../hooks/useApi.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { logs as logsApi } from '../../api/services/index.js';
import { STATUS } from '../../theme/tokens.js';

export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: counts, loading: countsLoading } = useApi(() => logsApi.counts(), []);
  const { data: recent, loading: recentLoading, error } = useApi(
    () => logsApi.list({ limit: 5, sort: 'newest' }),
    [],
  );

  // `initials` alone renders "Hello, L" — technically the user's data, but it
  // reads like a bug. Surname is what a colleague would actually call them.
  const greetingName = user?.surname || user?.name || 'there';

  const columns = [
    {
      id: 'reference',
      label: 'Ticket',
      render: (row) => <CellStack primary={row.reference} secondary={row.title} />,
    },
    { id: 'priority', label: 'Priority', render: (row) => <PriorityChip priority={row.priority} />, hideBelow: 'sm' },
    { id: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
    {
      id: 'sla',
      label: 'SLA',
      render: (row) => <SlaIndicator slaStatus={row.slaStatus} compact />,
      hideBelow: 'md',
    },
    {
      id: 'assignedTo',
      label: 'Technician',
      render: (row) => (
        <Typography variant="body2" color={row.technician ? 'text.primary' : 'text.secondary'}>
          {row.assignedTo}
        </Typography>
      ),
      hideBelow: 'lg',
    },
  ];

  return (
    <>
      <PageHeader
        title={`Hello, ${greetingName}`}
        subtitle="Here is where your reported issues stand right now."
        action={
          <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => navigate('/staff/log-issue')}>
            Log an issue
          </Button>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Total logged" value={counts?.total} loading={countsLoading}
            icon={ConfirmationNumberIcon} tone={STATUS.info}
            onClick={() => navigate('/staff/my-issues')}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Still open" value={counts?.open} loading={countsLoading}
            icon={PendingActionsIcon} tone={STATUS.warning}
            onClick={() => navigate('/staff/my-issues?open=true')}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Resolved" value={counts?.byStatus?.RESOLVED} loading={countsLoading}
            icon={TaskAltIcon} tone={STATUS.success}
            onClick={() => navigate('/staff/my-issues?status=RESOLVED')}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          {/* Surfaced prominently: an overdue ticket is the thing a user most needs to know about. */}
          <StatCard
            label="Past SLA" value={counts?.overdue} loading={countsLoading}
            icon={ReportProblemIcon} tone={STATUS.error}
            helperText={counts?.overdue > 0 ? 'Needs chasing' : 'All within target'}
            onClick={() => navigate('/staff/my-issues?overdue=true')}
          />
        </Grid>
      </Grid>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h4">Recent tickets</Typography>
        <Button size="small" onClick={() => navigate('/staff/my-issues')}>View all</Button>
      </Stack>

      <DataTable
        columns={columns}
        rows={recent ?? []}
        loading={recentLoading}
        error={error}
        onRowClick={(row) => navigate(`/staff/tickets/${row.id}`)}
        emptyTitle="You haven't logged any issues yet"
        emptyDescription="When something breaks, log it here and you can track it through to resolution."
        emptyAction={{ actionLabel: 'Log your first issue', onAction: () => navigate('/staff/log-issue') }}
      />
    </>
  );
}
