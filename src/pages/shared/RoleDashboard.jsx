/**
 * src/pages/shared/RoleDashboard.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces WelcomeTechnician.jsx, DashboardPage.jsx (admin), HODDashboard.js
 *   and MainContent.jsx — four dashboards showing broadly the same numbers with
 *   four stylesheets. The technician one alone fetched its four tiles from four
 *   separate endpoints.
 *
 * WHAT IT ACHIEVES
 *   One dashboard whose tiles and headline adapt to the role, because the
 *   backend already scopes `/logs/counts` and `/logs` by who is asking. A
 *   technician sees their queue, an HOD their department, an admin everything —
 *   from the same two requests.
 */
import { useNavigate } from 'react-router-dom';
import { Grid, Typography, Stack, Button, Card, CardContent, Box, LinearProgress } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BuildIcon from '@mui/icons-material/Build';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import DataTable, { CellStack } from '../../components/DataTable.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import PriorityChip from '../../components/PriorityChip.jsx';
import SlaIndicator from '../../components/SlaIndicator.jsx';
import useApi from '../../hooks/useApi.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { logs as logsApi, reports as reportsApi } from '../../api/services/index.js';
import { STATUS } from '../../theme/tokens.js';

export default function RoleDashboard() {
  const navigate = useNavigate();
  const { user, roles, homePath, hasRole, isTechnician } = useAuth();

  const { data: counts, loading: countsLoading } = useApi(() => logsApi.counts(), []);
  const { data: recent, loading: recentLoading, error } = useApi(() => logsApi.list({ limit: 8, sort: 'newest' }), []);
  // SLA compliance is management information; technicians see their own.
  const { data: sla } = useApi(() => reportsApi.slaCompliance(), []);

  const isAdmin = hasRole('ADMIN');
  const isHod = hasRole('HOD');

  const title = isAdmin
    ? 'Service desk overview'
    : isHod
      ? `${user?.department?.name ?? 'Department'} overview`
      : isTechnician
        ? 'My work queue'
        : `Hello, ${user?.surname ?? 'there'}`;

  const subtitle = isAdmin
    ? 'Everything logged across the organisation.'
    : isHod
      ? 'Tickets raised by your department.'
      : isTechnician
        ? 'Tickets assigned to you, and how they are tracking against SLA.'
        : 'Here is where your reported issues stand right now.';

  const columns = [
    { id: 'reference', label: 'Ticket', render: (r) => <CellStack primary={r.reference} secondary={r.title} /> },
    { id: 'priority', label: 'Priority', render: (r) => <PriorityChip priority={r.priority} />, hideBelow: 'sm' },
    { id: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
    { id: 'sla', label: 'SLA', render: (r) => <SlaIndicator slaStatus={r.slaStatus} compact />, hideBelow: 'md' },
    {
      id: 'assignedTo',
      label: 'Technician',
      render: (r) => (
        <Typography variant="body2" color={r.technician ? 'text.primary' : 'text.secondary'} noWrap>
          {r.assignedTo}
        </Typography>
      ),
      hideBelow: 'lg',
    },
  ];

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          (isAdmin || isHod) && (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<PeopleIcon />} onClick={() => navigate(`${homePath}/technicians`)}>
                Technicians
              </Button>
              <Button variant="contained" onClick={() => navigate(`${homePath}/tickets`)}>
                All tickets
              </Button>
            </Stack>
          )
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            label={isTechnician ? 'Assigned to me' : 'Total tickets'}
            value={counts?.total} loading={countsLoading}
            icon={ConfirmationNumberIcon} tone={STATUS.info}
            onClick={() => navigate(`${homePath}/${isTechnician ? 'assigned' : 'tickets'}`)}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Open" value={counts?.open} loading={countsLoading}
            icon={PendingActionsIcon} tone={STATUS.warning}
            onClick={() => navigate(`${homePath}/${isTechnician ? 'assigned' : 'tickets'}?open=true`)}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="In progress" value={counts?.byStatus?.IN_PROGRESS} loading={countsLoading}
            icon={BuildIcon} tone={STATUS.info}
            onClick={() => navigate(`${homePath}/${isTechnician ? 'assigned' : 'tickets'}?status=IN_PROGRESS`)}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Past SLA" value={counts?.overdue} loading={countsLoading}
            icon={ReportProblemIcon} tone={STATUS.error}
            helperText={counts?.overdue > 0 ? 'Needs attention' : 'All within target'}
            onClick={() => navigate(`${homePath}/${isTechnician ? 'assigned' : 'tickets'}?overdue=true`)}
          />
        </Grid>
      </Grid>

      {/* SLA compliance headline — a figure the old system could not produce. */}
      {sla?.resolvedTickets > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" color="text.secondary">Resolution SLA met</Typography>
                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 700 }}>
                    {sla.resolutionCompliancePercent ?? 0}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    of {sla.resolvedTickets} resolved
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={sla.resolutionCompliancePercent ?? 0}
                  color={(sla.resolutionCompliancePercent ?? 0) >= 90 ? 'success' : (sla.resolutionCompliancePercent ?? 0) >= 70 ? 'warning' : 'error'}
                  sx={{ height: 5, borderRadius: 2, mt: 1 }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" color="text.secondary">Response SLA met</Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 700 }}>
                  {sla.responseCompliancePercent ?? 0}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={sla.responseCompliancePercent ?? 0}
                  color={(sla.responseCompliancePercent ?? 0) >= 90 ? 'success' : 'warning'}
                  sx={{ height: 5, borderRadius: 2, mt: 1 }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" color="text.secondary">Breached right now</Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: sla.currentlyBreachedOpenTickets > 0 ? 'error.main' : 'text.primary' }}>
                  {sla.currentlyBreachedOpenTickets ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">open tickets past deadline</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h4">{isTechnician ? 'My latest tickets' : 'Recent activity'}</Typography>
        <Button size="small" onClick={() => navigate(`${homePath}/${isTechnician ? 'assigned' : 'tickets'}`)}>
          View all
        </Button>
      </Stack>

      <DataTable
        columns={columns}
        rows={recent ?? []}
        loading={recentLoading}
        error={error}
        onRowClick={(row) => navigate(`${homePath}/tickets/${row.id}`)}
        emptyTitle={isTechnician ? 'Nothing assigned to you yet' : 'No tickets yet'}
        emptyDescription={
          isTechnician
            ? 'When an administrator assigns you a ticket it will appear here.'
            : 'Tickets will appear here as they are logged.'
        }
      />
    </>
  );
}
