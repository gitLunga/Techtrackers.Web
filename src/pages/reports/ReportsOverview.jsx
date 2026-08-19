/**
 * src/pages/reports/ReportsOverview.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces ReportPage.jsx, IssuesStatusReport.jsx, MonthlySummaryReport.jsx
 *   and Report.jsx — which existed in BOTH the admin and HOD folders, so eight
 *   files and eight stylesheets for three reports.
 *
 * WHAT IT ACHIEVES
 *   All the reporting in one place with a shared date range. Charts use
 *   @mui/x-charts so they inherit the theme palette — the old ones used chart.js
 *   with its own default colours, which is why charts never matched the UI
 *   around them.
 *
 *   The numbers are also different, because the old ones were wrong: they
 *   averaged `resolutionDue - assignedAt`, which is the SLA WINDOW, not how long
 *   anything took.
 */
import { useState } from 'react';
import { Grid, Card, CardContent, Typography, Stack, TextField, MenuItem, Box, Skeleton, Alert } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import PageHeader from '../../components/PageHeader.jsx';
import useApi from '../../hooks/useApi.js';
import { reports as reportsApi } from '../../api/services/index.js';
import { STATUS_META } from '../../components/StatusChip.jsx';
import { PRIMARY, SECONDARY, STATUS, NEUTRAL } from '../../theme/tokens.js';

/** Ordered so the chart palette is stable between renders. */
const CHART_COLOURS = [SECONDARY.main, PRIMARY.main, STATUS.warning.main, STATUS.success.main, STATUS.error.main, NEUTRAL[400]];

export default function ReportsOverview() {
  const [months, setMonths] = useState(6);

  const { data: counts, loading: countsLoading } = useApi(() => reportsApi.statusCounts(), []);
  const { data: monthly, loading: monthlyLoading } = useApi(() => reportsApi.monthlySummary({ months }), [months]);

  const statusData = Object.entries(counts?.byStatus ?? {})
    .filter(([, value]) => value > 0)
    .map(([status, value], i) => ({
      id: status,
      value,
      label: STATUS_META[status]?.label ?? status,
      color: CHART_COLOURS[i % CHART_COLOURS.length],
    }));

  const months_ = monthly ?? [];

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="How the service desk is performing."
        action={
          <TextField
            select
            size="small"
            label="Period"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value={3}>Last 3 months</MenuItem>
            <MenuItem value={6}>Last 6 months</MenuItem>
            <MenuItem value={12}>Last 12 months</MenuItem>
          </TextField>
        }
      />

      <Grid container spacing={3}>
        {/* Status mix */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 1 }}>Tickets by status</Typography>
              <Typography variant="caption" color="text.secondary">
                {counts?.total ?? 0} total · {counts?.open ?? 0} open · {counts?.overdue ?? 0} past SLA
              </Typography>

              {countsLoading ? (
                <Skeleton variant="circular" width={220} height={220} sx={{ mx: 'auto', mt: 3 }} />
              ) : statusData.length === 0 ? (
                <Alert severity="info" sx={{ mt: 3 }}>No tickets to report on yet.</Alert>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <PieChart
                    series={[{
                      data: statusData,
                      innerRadius: 52,
                      paddingAngle: 2,
                      cornerRadius: 4,
                highlightScope: { faded: 'global', highlighted: 'item' },
                    }]}
                    height={290}
                    // Reserve room at the bottom or the legend sits on top of
                    // the donut.
                    margin={{ top: 10, bottom: 60 }}
                    slotProps={{ legend: { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' }, itemMarkWidth: 10, itemMarkHeight: 10, labelStyle: { fontSize: 12 }, padding: 0 } }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Volume trend */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 1 }}>Logged vs resolved</Typography>
              <Typography variant="caption" color="text.secondary">Monthly volume over the selected period</Typography>

              {monthlyLoading ? (
                <Skeleton variant="rounded" height={260} sx={{ mt: 3 }} />
              ) : months_.length === 0 ? (
                <Alert severity="info" sx={{ mt: 3 }}>Not enough data for a trend yet.</Alert>
              ) : (
                <BarChart
                  height={280}
                  xAxis={[{ scaleType: 'band', data: months_.map((m) => m.month), tickLabelStyle: { fontSize: 11 } }]}
                  series={[
                    { data: months_.map((m) => m.total), label: 'Logged', color: SECONDARY.main },
                    { data: months_.map((m) => m.resolved), label: 'Resolved', color: STATUS.success.main },
                  ]}
                  slotProps={{ legend: { labelStyle: { fontSize: 12 } } }}
                  margin={{ top: 30, right: 10, bottom: 30, left: 40 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* SLA compliance trend */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 1 }}>SLA compliance over time</Typography>
              <Typography variant="caption" color="text.secondary">
                Percentage of resolved tickets that met their deadline, and average time to resolve
              </Typography>

              {monthlyLoading ? (
                <Skeleton variant="rounded" height={280} sx={{ mt: 3 }} />
              ) : months_.length === 0 ? (
                <Alert severity="info" sx={{ mt: 3 }}>No resolved tickets in this period.</Alert>
              ) : (
                <LineChart
                  height={300}
                  xAxis={[{ scaleType: 'point', data: months_.map((m) => m.month), tickLabelStyle: { fontSize: 11 } }]}
                  yAxis={[
                    { id: 'pct', scaleType: 'linear', min: 0, max: 100 },
                    { id: 'hours', scaleType: 'linear' },
                  ]}
                  series={[
                    {
                      data: months_.map((m) => m.slaCompliancePercent ?? 0),
                      label: 'SLA met (%)',
                      color: STATUS.success.main,
                      yAxisId: 'pct',
                      curve: 'monotoneX',
                    },
                    {
                      data: months_.map((m) => m.averageResolutionHours ?? 0),
                      label: 'Avg resolution (hours)',
                      color: PRIMARY.main,
                      yAxisId: 'hours',
                      curve: 'monotoneX',
                    },
                  ]}
                  slotProps={{ legend: { labelStyle: { fontSize: 12 } } }}
                  margin={{ top: 30, right: 50, bottom: 30, left: 45 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
