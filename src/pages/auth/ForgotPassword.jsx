/**
 * src/pages/auth/ForgotPassword.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces ForgotPassword.jsx + AccountRecovery.jsx, which split one flow
 *   across two screens with two stylesheets and hard-coded the (already broken)
 *   `/api/Account/RequestOtp/request-otp` URL.
 *
 * WHAT IT ACHIEVES
 *   The whole three-step reset as ONE screen with a stepper, so the user always
 *   knows where they are and can go back a step without losing their place.
 *
 *   The success message after step 1 is deliberately vague — "if an account
 *   exists" — matching the backend, which returns the same response for unknown
 *   addresses so the endpoint cannot be used to discover who has an account.
 */
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Card, CardContent, TextField, Button, Typography, Stack, Alert, Box,
  Stepper, Step, StepLabel, Link, LinearProgress,
} from '@mui/material';
import AuthShell from './AuthShell.jsx';
import { auth as authApi } from '../../api/services/index.js';

const STEPS = ['Your email', 'One-time code', 'New password'];

const RULES = [
  { test: (v) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v) => /[a-z]/.test(v), label: 'One lowercase letter' },
  { test: (v) => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: (v) => /[0-9]/.test(v), label: 'One number' },
];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn, onSuccess) => {
    setBusy(true); setError(null);
    try {
      const result = await fn();
      onSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const requestCode = () =>
    run(() => authApi.forgotPassword(email), (res) => {
      setInfo(res.message);
      setStep(1);
    });

  const verifyCode = () =>
    run(() => authApi.verifyOtp(email, code), () => { setInfo(null); setStep(2); });

  const resetPassword = () =>
    run(() => authApi.resetPassword(email, code, password), () => {
      navigate('/login', { replace: true, state: { justReset: true } });
    });

  const passed = RULES.filter((r) => r.test(password)).length;

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a one-time code to confirm it's you."
    >
      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h3" sx={{ mb: 3 }}>Forgot password</Typography>

          <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
            {STEPS.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
          {info && <Alert severity="info" sx={{ mb: 2.5 }}>{info}</Alert>}
          {busy && <LinearProgress sx={{ mb: 2 }} />}

          {step === 0 && (
            <Stack spacing={2.5}>
              <TextField
                label="Email address"
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Use the address you sign in with."
              />
              <Button variant="contained" size="large" disabled={!email || busy} onClick={requestCode}>
                Send code
              </Button>
            </Stack>
          )}

          {step === 1 && (
            <Stack spacing={2.5}>
              <Typography variant="body2" color="text.secondary">
                Enter the 6-digit code sent to <strong>{email}</strong>. It expires in 10 minutes.
              </Typography>
              <TextField
                label="One-time code"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputProps={{ inputMode: 'numeric', style: { letterSpacing: '0.5em', fontSize: '1.25rem' } }}
                placeholder="000000"
              />
              <Button variant="contained" size="large" disabled={code.length !== 6 || busy} onClick={verifyCode}>
                Verify code
              </Button>
              <Stack direction="row" justifyContent="space-between">
                <Button size="small" onClick={() => setStep(0)}>Change email</Button>
                <Button size="small" onClick={requestCode} disabled={busy}>Resend code</Button>
              </Stack>
            </Stack>
          )}

          {step === 2 && (
            <Stack spacing={2.5}>
              <Box>
                <TextField
                  label="New password"
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {password && (
                  <Stack spacing={0.25} sx={{ mt: 1.5 }}>
                    {RULES.map((rule) => (
                      <Typography
                        key={rule.label}
                        variant="caption"
                        sx={{ color: rule.test(password) ? 'success.main' : 'text.secondary' }}
                      >
                        {rule.test(password) ? '✓' : '○'} {rule.label}
                      </Typography>
                    ))}
                  </Stack>
                )}
              </Box>

              <TextField
                label="Confirm password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={Boolean(confirm) && confirm !== password}
                helperText={confirm && confirm !== password ? 'Passwords do not match' : ' '}
              />

              <Button
                variant="contained"
                size="large"
                disabled={passed !== RULES.length || password !== confirm || busy}
                onClick={resetPassword}
              >
                Reset password
              </Button>
            </Stack>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link component={RouterLink} to="/login" variant="body2">Back to sign in</Link>
          </Box>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
