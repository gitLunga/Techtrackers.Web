/**
 * src/pages/technician/TechniciansList.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces ManageTech.jsx and TechnicianDetailView.jsx. The old list showed
 *   name and email only, so an admin deciding who to give work to had no idea
 *   who was already buried.
 *
 * WHAT IT ACHIEVES
 *   The dispatch view: who is available, what they specialise in, how loaded
 *   they are right now, and how they are performing. Load is colour-coded so an
 *   overloaded technician is obvious without reading numbers.
 */
import { useNavigate } from 'react-router-dom';
import { Typography, Stack, Chip, Avatar, Box, LinearProgress, Tooltip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable, { CellStack } from '../../components/DataTable.jsx';
import useApi from '../../hooks/useApi.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { technicians as techApi } from '../../api/services/index.js';
import { STATUS, NEUTRAL } from '../../theme/tokens.js';

/** Under 3 open = fine, to 5 = busy, beyond = overloaded. */
function loadTone(count) {
  if (count <= 2) return STATUS.success;
  if (count <= 5) return STATUS.warning;
  return STATUS.error;
}

export default function TechniciansList() {
  const navigate = useNavigate();
  const { homePath } = useAuth();
  const { data, loading, error } = useApi(() => techApi.list(), []);

  const maxLoad = Math.max(1, ...(data ?? []).map((t) => t.openTaskCount ?? 0));

  const columns = [
    {
      id: 'name',
      label: 'Technician',
      render: (t) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
            {t.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
          </Avatar>
          <CellStack primary={t.name} secondary={t.email} />
        </Stack>
      ),
    },
    {
      id: 'specialization',
      label: 'Specialisation',
      render: (t) => <Typography variant="body2">{t.specialization ?? '—'}</Typography>,
      hideBelow: 'md',
    },
    {
      id: 'type',
      label: 'Type',
      render: (t) => (
        <Chip
          size="small"
          variant="outlined"
          label={t.type === 'EXTERNAL' ? 'External' : 'Internal'}
        />
      ),
      hideBelow: 'lg',
    },
    {
      id: 'availability',
      label: 'Hours',
      render: (t) => (
        <Typography variant="body2" color="text.secondary">
          {t.availability ? `${t.availability.from}–${t.availability.to}` : '—'}
        </Typography>
      ),
      hideBelow: 'lg',
    },
    {
      id: 'openTaskCount',
      label: 'Current load',
      width: 170,
      render: (t) => {
        const tone = loadTone(t.openTaskCount);
        return (
          <Tooltip title={`${t.openTaskCount} open ticket${t.openTaskCount === 1 ? '' : 's'}`}>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: tone.main }}>
                  {t.openTaskCount} open
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(t.openTaskCount / maxLoad) * 100}
                sx={{
                  height: 4, borderRadius: 2, backgroundColor: NEUTRAL[100],
                  '& .MuiLinearProgress-bar': { backgroundColor: tone.main, borderRadius: 2 },
                }}
              />
            </Box>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Technicians"
        subtitle="Who is available, what they specialise in and how much work they are carrying."
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        loading={loading}
        error={error}
        onRowClick={(t) => navigate(`${homePath}/technicians/${t.id}`)}
        emptyTitle="No technicians yet"
        emptyDescription="Add users with a technician role and they will appear here."
      />
    </>
  );
}
