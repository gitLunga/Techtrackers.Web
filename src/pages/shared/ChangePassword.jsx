/**
 * src/pages/shared/ChangePassword.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old app had no way to change your password while signed in — the only
 *   route was the forgot-password OTP flow, even if you knew your password.
 *
 * WHAT IT ACHIEVES
 *   A self-service change, with the same password rules the backend enforces
 *   checked as you type. Because the API revokes every session on success, the
 *   screen says so up front and signs you out afterwards rather than leaving you
 *   confused by sudden 401s.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, TextField, Button, Stack, Alert, Box, Typography, LinearProgress } from '@mui/material';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import { auth as authApi } from '../../api/services/index.js';

/** Mirrors the backend's password policy so failures happen before the request. */
const RULES = [
  { test: (v) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v) => /[a-z]/.test(v), label: 'One lowercase letter' },
  { test: (v) => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: (v) => /[0-9]/.test(v), label: 'One number' },
];

export default function ChangePassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signOut } = useAuth();
  const [formError, setFormError] = useState(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');
  const passed = RULES.filter((r) => r.test(newPassword ?? '')).length;

  const onSubmit = async ({ currentPassword, newPassword: next }) => {
    setFormError(null);
    try {
      await authApi.changePassword(currentPassword, next);
      toast.success('Password changed. Please sign in again.');
      // The backend revokes all sessions, so sign out rather than leaving the
      // user with dead tokens and confusing 401s.
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      setFormError(error.message);
    }
  };

  return (
    <>
      <PageHeader title="Change password" subtitle="Choose a new password for your account." />

      <Card sx={{ maxWidth: 560 }}>
        <CardContent sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Changing your password signs you out of every device, including this one.
          </Alert>

          {formError && <Alert severity="error" sx={{ mb: 2.5 }}>{formError}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              <TextField
                label="Current password"
                type="password"
                autoComplete="current-password"
                error={Boolean(errors.currentPassword)}
                helperText={errors.currentPassword?.message}
                {...register('currentPassword', { required: 'Enter your current password' })}
              />

              <Box>
                <TextField
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  error={Boolean(errors.newPassword)}
                  helperText={errors.newPassword?.message}
                  {...register('newPassword', {
                    required: 'Choose a new password',
                    validate: (v) => RULES.every((r) => r.test(v)) || 'Password does not meet all the requirements',
                  })}
                />
                {newPassword && (
                  <Box sx={{ mt: 1.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(passed / RULES.length) * 100}
                      color={passed === RULES.length ? 'success' : passed >= 2 ? 'warning' : 'error'}
                      sx={{ height: 4, borderRadius: 2, mb: 1 }}
                    />
                    <Stack spacing={0.25}>
                      {RULES.map((rule) => (
                        <Typography
                          key={rule.label}
                          variant="caption"
                          sx={{ color: rule.test(newPassword) ? 'success.main' : 'text.secondary' }}
                        >
                          {rule.test(newPassword) ? '✓' : '○'} {rule.label}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>

              <TextField
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Confirm your new password',
                  validate: (v) => v === newPassword || 'Passwords do not match',
                })}
              />

              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button onClick={() => navigate(-1)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Changing…' : 'Change password'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
