/**
 * src/pages/shared/Profile.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces the four SettingsModal.js copies (one per role folder), which were
 *   modals rather than pages and mostly non-functional.
 *
 * WHAT IT ACHIEVES
 *   Shows the account as the server sees it, sourced from `/auth/me` rather than
 *   from localStorage — so it reflects the truth after an admin changes your
 *   role or department.
 */
import { Card, CardContent, Grid, Typography, Box, Avatar, Chip, Stack, Divider, Button } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { NEUTRAL } from '../../theme/tokens.js';

function Row({ label, value }) {
  return (
    <Box sx={{ py: 1.5 }}>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
      <Typography variant="body2">{value || '—'}</Typography>
    </Box>
  );
}

export default function Profile() {
  const { user, roles, homePath } = useAuth();
  const navigate = useNavigate();

  const minutesToTime = (m) =>
    m == null ? null : `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  const tech = user?.technicianProfile;

  return (
    <>
      <PageHeader title="My profile" subtitle="Your account details as recorded in the system." />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ width: 76, height: 76, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 600 }}>
                {(user?.initials || user?.surname || '?').slice(0, 2).toUpperCase()}
              </Avatar>
              <Typography variant="h4">{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user?.email}</Typography>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                {roles.map((role) => (
                  <Chip key={role} size="small" label={role.replace(/_/g, ' ')} color="primary" variant="outlined" />
                ))}
              </Stack>

              <Divider sx={{ my: 3 }} />
              <Button fullWidth variant="outlined" startIcon={<LockResetIcon />} onClick={() => navigate(`${homePath}/change-password`)}>
                Change password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 1 }}>Account</Typography>
              <Divider />
              <Row label="Surname" value={user?.surname} />
              <Divider />
              <Row label="Initials" value={user?.initials} />
              <Divider />
              <Row label="Email address" value={user?.email} />
              <Divider />
              <Row label="Phone" value={user?.phone} />
              <Divider />
              <Row label="Department" value={user?.department?.name} />

              {tech && (
                <>
                  <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Technician profile</Typography>
                  <Divider />
                  <Row label="Specialisation" value={tech.specialization} />
                  <Divider />
                  <Row label="Type" value={tech.type === 'EXTERNAL' ? 'External contractor' : 'Internal'} />
                  <Divider />
                  <Row label="Availability" value={`${minutesToTime(tech.availableFrom)} – ${minutesToTime(tech.availableTo)}`} />
                  {tech.location && (<><Divider /><Row label="Base location" value={tech.location} /></>)}
                </>
              )}

              <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: NEUTRAL[50] }}>
                <Typography variant="caption" color="text.secondary">
                  To change your name, department or role, contact an administrator.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
