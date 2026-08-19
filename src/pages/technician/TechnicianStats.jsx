/**
 * src/pages/technician/TechnicianStats.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces Ratings.jsx and TechnicianDetailView.jsx. The old technician
 *   dashboard needed FIVE separate endpoints to draw four tiles, and could not
 *   produce a resolution time or SLA compliance figure at all.
 *
 * WHAT IT ACHIEVES
 *   One `/technicians/:id/stats` call renders the whole picture: workload by
 *   status, average resolution time, SLA compliance and the rating breakdown.
 *
 *   Serves two audiences from one screen — a technician viewing their own
 *   performance, and an admin reviewing someone's. The backend enforces which
 *   is allowed.
 */
import { useParams } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Box, Stack, Rating, LinearProgress, Alert, Skeleton } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import useApi from '../../hooks/useApi.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { technicians as techApi } from '../../api/services/index.js';
import { STATUS, NEUTRAL, SECONDARY } from '../../theme/tokens.js';

export default function TechnicianStats() {
  const { id } = useParams();
  const { user } = useAuth();
  // No :id in the URL means "my own stats".
  const technicianId = Number(id ?? user?.id);

  const { data, loading, error } = useApi(() => techApi.stats(technicianId), [technicianId]);
  const { data: rating } = useApi(() => techApi.rating(technicianId), [technicianId]);

  if (loading) {
    return (
      <>
        <Skeleton width={260} height={44} sx={{ mb: 3 }} />
        <Grid container spacing={2.5}>
          {[0, 1, 2, 3].map((i) => (
            <Grid item xs={6} md={3} key={i}><Skeleton variant="rounded" height={116} /></Grid>
          ))}
        </Grid>
      </>
    );
  }
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!data) return null;

  const { technician, byStatus, totals, performance } = data;
  const isSelf = technicianId === user?.id;
  const distribution = rating?.distribution ?? {};
  const totalRatings = rating?.totalRatings ?? 0;

  return (
    <>
      <PageHeader
        title={isSelf ? 'My performance' : technician.name}
        subtitle={
          isSelf
            ? 'How your tickets are tracking against their service targets.'
            : `${technician.department ?? 'No department'} · technician performance`
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard label="Assigned" value={totals.assigned} icon={AssignmentIcon} tone={STATUS.info} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Still open" value={totals.open} icon={PendingActionsIcon} tone={STATUS.warning} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Resolved" value={byStatus.RESOLVED + byStatus.CLOSED} icon={TaskAltIcon} tone={STATUS.success} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Past SLA" value={totals.overdue} icon={ReportProblemIcon} tone={STATUS.error}
            helperText={totals.overdue > 0 ? 'Needs attention' : 'All on track'}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2.5 }}>Performance</Typography>

              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                    <Typography variant="body2">SLA compliance</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {performance.slaCompliancePercent ?? '—'}
                      {performance.slaCompliancePercent != null && '%'}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={performance.slaCompliancePercent ?? 0}
                    color={
                      (performance.slaCompliancePercent ?? 0) >= 90 ? 'success'
                      : (performance.slaCompliancePercent ?? 0) >= 70 ? 'warning' : 'error'
                    }
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Tickets resolved before their deadline
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="overline" color="text.secondary">Average resolution time</Typography>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 700 }}>
                    {performance.averageResolutionHours != null ? `${performance.averageResolutionHours}h` : '—'}
                  </Typography>
                  {/* Measured from when the ticket was LOGGED to when it was
                      resolved. The old reports used the SLA window instead, so
                      the number was identical for every ticket. */}
                  <Typography variant="caption" color="text.secondary">
                    From logged to resolved
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Satisfaction rating</Typography>

              {totalRatings === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No feedback received yet. Ratings appear once people rate resolved tickets.
                </Typography>
              ) : (
                <>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1 }}>
                      {rating.averageRating}
                    </Typography>
                    <Box>
                      <Rating value={rating.averageRating} precision={0.1} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {totalRatings} rating{totalRatings === 1 ? '' : 's'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={0.75}>
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = distribution[stars] ?? 0;
                      const pct = totalRatings ? (count / totalRatings) * 100 : 0;
                      return (
                        <Stack key={stars} direction="row" spacing={1.5} alignItems="center">
                          <Typography variant="caption" sx={{ width: 12 }}>{stars}</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{
                              flex: 1, height: 6, borderRadius: 3, backgroundColor: NEUTRAL[100],
                              '& .MuiLinearProgress-bar': { backgroundColor: SECONDARY.main, borderRadius: 3 },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ width: 20, textAlign: 'right' }}>
                            {count}
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
