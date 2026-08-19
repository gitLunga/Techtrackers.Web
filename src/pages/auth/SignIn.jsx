/**
 * src/pages/auth/SignIn.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces screens/Logins/SignIn.jsx. The old version had four problems worth
 *   naming, because they shaped this rewrite:
 *     1. It hard-coded `https://localhost:44328/api/User/login` inline.
 *     2. It stored the raw user object in localStorage and considered that
 *        "logged in" — there was no token, because the old API issued none.
 *     3. Role routing was a five-branch switch on lower-cased role strings, so
 *        a role the switch didn't know simply fell through to an error toast.
 *     4. There was no loading state: submitting twice fired two logins.
 *
 * WHAT IT ACHIEVES
 *   Signs in through AuthContext, which stores the JWT pair and makes the user
 *   available app-wide. Routing after sign-in is derived from the role's home
 *   path, so adding a role is a one-line change in AuthContext, not a new branch
 *   here.
 *
 *   Honours `location.state.from`, so a user who was sent to login by
 *   ProtectedRoute lands back where they were going.
 */
import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box, Card, CardContent, TextField, Button, Typography, Link,
  InputAdornment, IconButton, Alert, Stack, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/MailOutline';
import LockIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../auth/AuthContext.jsx';
import { ROLE_HOME } from '../../auth/AuthContext.jsx';
import AuthShell from './AuthShell.jsx';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async ({ email, password }) => {
    setFormError(null);
    try {
      const user = await signIn(email, password);
      // Back to wherever they were headed, else their role's home.
      const intended = location.state?.from?.pathname;
      const home = ROLE_HOME[user.roles?.[0]] ?? '/staff';
      navigate(intended && intended !== '/login' ? intended : home, { replace: true });
    } catch (error) {
      // The API returns the same message for unknown email and wrong password,
      // deliberately — showing anything more specific would let someone
      // discover which addresses have accounts.
      setFormError(error.message);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to log and track technical support issues."
    >
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h3" sx={{ mb: 0.5 }}>Sign in</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your work email and password.
          </Typography>

          {formError && <Alert severity="error" sx={{ mb: 2.5 }}>{formError}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              <TextField
                label="Email address"
                type="email"
                autoComplete="email"
                autoFocus
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                })}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                {...register('password', { required: 'Password is required' })}
              />

              <Box sx={{ textAlign: 'right', mt: -1 }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot your password?
                </Link>
              </Box>

              {/* Disabled while submitting — the old form could be fired twice. */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
