/**
 * src/pages/auth/AuthShell.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old sign-in, registration, forgot-password and account-recovery screens
 *   each had their own full-page layout and their own stylesheet (SignIn.css,
 *   Registration.css, ForgotPassword.css, otpStyle.css) — four takes on the same
 *   centred card.
 *
 * WHAT IT ACHIEVES
 *   One frame for every unauthenticated page: brand panel on the left at desktop
 *   width, the form centred on the right, and just the form on mobile.
 */
import { Box, Typography, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import { PRIMARY, SECONDARY } from '../../theme/tokens.js';

const HIGHLIGHTS = [
  'Log an issue in seconds and track it to resolution',
  'Automatic SLA deadlines based on priority',
  'Escalation before deadlines are missed, not after',
];

export default function AuthShell({ title, subtitle, children }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Brand panel — desktop only; on mobile the form gets the whole screen. */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          width: '46%',
          p: 8,
          color: '#fff',
          background: `linear-gradient(150deg, ${PRIMARY.main} 0%, ${PRIMARY.dark} 60%, #041717 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 6 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: SECONDARY.main, display: 'grid', placeItems: 'center', fontWeight: 700 }}>
            T
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>Techtrackers</Typography>
        </Stack>

        <Typography variant="h1" sx={{ mb: 2, color: '#fff', maxWidth: 460 }}>
          {title}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.72)', maxWidth: 420, mb: 5 }}>
          {subtitle}
        </Typography>

        <Stack spacing={2}>
          {HIGHLIGHTS.map((text) => (
            <Stack key={text} direction="row" spacing={1.5} alignItems="flex-start">
              <CheckCircleIcon sx={{ fontSize: 19, color: SECONDARY.light, mt: '2px' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
                {text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2.5, sm: 4 },
          backgroundColor: 'background.default',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>{children}</Box>
      </Box>
    </Box>
  );
}
