/**
 * src/pages/staff/LogIssue.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces logissueform.js / LogIssueForm.js / LogIssue.jsx — the SAME form
 *   implemented three times, once per role folder, with three stylesheets.
 *
 *   The old form also posted `Staff_ID` from the client, so the request claimed
 *   who was reporting. The new API takes the reporter from the token and the
 *   field no longer exists.
 *
 * WHAT IT ACHIEVES
 *   One form, used by any role that may log an issue. Two things it does that
 *   the old one did not:
 *
 *   1. SHOWS THE SLA BEFORE SUBMITTING. Picking a priority immediately displays
 *      the response and resolution targets that priority will attract. The old
 *      form asked users to choose a priority with no indication of what it meant.
 *
 *   2. Validates against the backend's real constraints (title >= 5 chars,
 *      description >= 10) client-side, so the user is corrected as they type
 *      rather than after a round trip.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Card, CardContent, Grid, TextField, MenuItem, Button, Box, Typography,
  Stack, Alert, CircularProgress, Chip, IconButton, LinearProgress,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import TimerIcon from '@mui/icons-material/TimerOutlined';
import PageHeader from '../../components/PageHeader.jsx';
import useApi from '../../hooks/useApi.js';
import { useToast } from '../../components/Toast.jsx';
import { categories as categoriesApi, slas as slasApi, logs as logsApi } from '../../api/services/index.js';
import { PRIORITY_META } from '../../components/PriorityChip.jsx';
import { STATUS, NEUTRAL } from '../../theme/tokens.js';

const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** 240 -> "4h", 1440 -> "24h", 4320 -> "3 days" */
function formatMinutes(minutes) {
  if (minutes == null) return '—';
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (hours < 24) return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
  const days = hours / 24;
  return `${Number.isInteger(days) ? days : days.toFixed(1)} days`;
}

export default function LogIssue() {
  const navigate = useNavigate();
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [submitError, setSubmitError] = useState(null);

  const { data: categories, loading: categoriesLoading } = useApi(() => categoriesApi.list(), []);
  const { data: slaTargets } = useApi(() => slasApi.list(), []);

  const {
    register, handleSubmit, control, watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { title: '', description: '', categoryId: '', priority: 'MEDIUM', location: '' },
  });

  const selectedPriority = watch('priority');
  // The SLA the chosen priority will attract — shown before the user commits.
  const matchingSla = slaTargets?.find((s) => s.priority === selectedPriority);

  const handleFiles = (event) => {
    const picked = Array.from(event.target.files ?? []);
    const tooBig = picked.filter((f) => f.size > MAX_FILE_BYTES);
    if (tooBig.length) {
      toast.error(`${tooBig[0].name} is larger than 5MB and was not attached`);
    }
    const accepted = picked.filter((f) => f.size <= MAX_FILE_BYTES);
    setFiles((prev) => [...prev, ...accepted].slice(0, MAX_FILES));
    event.target.value = ''; // allow re-picking the same file after removing it
  };

  const onSubmit = async (values) => {
    setSubmitError(null);
    try {
      const { data } = await logsApi.create(values, files);
      toast.success(`Ticket ${data.reference} logged successfully`);
      navigate(`/staff/tickets/${data.id}`);
    } catch (error) {
      setSubmitError(error.message);
      // Field-level errors from the backend's validator, mapped onto the form.
      const fieldErrors = error.fieldErrors ?? {};
      if (Object.keys(fieldErrors).length) {
        setSubmitError(`${error.message}: ${Object.values(fieldErrors).join(', ')}`);
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Log an issue"
        subtitle="Describe the problem and we'll route it to the right technician."
        breadcrumbs={[{ label: 'Dashboard', to: '/staff' }, { label: 'Log an issue' }]}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              {submitError && <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert>}

              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={3}>
                  <TextField
                    label="What's the problem?"
                    placeholder="e.g. Laptop will not power on"
                    autoFocus
                    error={Boolean(errors.title)}
                    helperText={errors.title?.message ?? 'A short, specific summary'}
                    {...register('title', {
                      required: 'Please give the issue a title',
                      minLength: { value: 5, message: 'Title must be at least 5 characters' },
                      maxLength: { value: 200, message: 'Title must be 200 characters or fewer' },
                    })}
                  />

                  <TextField
                    label="Describe what happened"
                    multiline
                    minRows={5}
                    placeholder="When did it start? What have you already tried? Any error messages?"
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message ?? 'The more detail, the faster this gets resolved'}
                    {...register('description', {
                      required: 'Please describe the issue',
                      minLength: { value: 10, message: 'Please give at least 10 characters of detail' },
                      maxLength: { value: 5000, message: 'Description is too long' },
                    })}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="categoryId"
                        control={control}
                        rules={{ required: 'Please choose a category' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label="Category"
                            disabled={categoriesLoading}
                            error={Boolean(errors.categoryId)}
                            helperText={errors.categoryId?.message}
                          >
                            {(categories ?? []).map((category) => (
                              <MenuItem key={category.id} value={category.id}>
                                {category.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="priority"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} select label="Priority" helperText="Sets the response deadline">
                            {Object.entries(PRIORITY_META).map(([value, meta]) => (
                              <MenuItem key={value} value={value}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Box sx={{ width: 3, height: 14, borderRadius: 1, backgroundColor: meta.color }} />
                                  <span>{meta.label}</span>
                                </Stack>
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Where is it? (optional)"
                    placeholder="e.g. HR Office, 2nd floor, desk 14"
                    {...register('location', { maxLength: { value: 200, message: 'Location is too long' } })}
                  />

                  {/* Attachments */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>Attachments</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      Up to {MAX_FILES} files, 5MB each. Screenshots help a lot.
                    </Typography>

                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<AttachFileIcon />}
                      disabled={files.length >= MAX_FILES}
                    >
                      Choose files
                      <input
                        hidden
                        type="file"
                        multiple
                        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={handleFiles}
                      />
                    </Button>

                    {files.length > 0 && (
                      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                        {files.map((file, index) => (
                          <Chip
                            key={`${file.name}-${index}`}
                            label={`${file.name} (${(file.size / 1024).toFixed(0)} KB)`}
                            onDelete={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                            deleteIcon={<CloseIcon />}
                            sx={{ maxWidth: 260 }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>

                  {isSubmitting && <LinearProgress />}

                  <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                    <Button variant="outlined" onClick={() => navigate('/staff')} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                    >
                      {isSubmitting ? 'Submitting…' : 'Submit issue'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* SLA preview — the thing the old form was missing entirely. */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <TimerIcon sx={{ fontSize: 19, color: 'secondary.main' }} />
                <Typography variant="h5">Service targets</Typography>
              </Stack>

              {matchingSla ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Choosing <strong>{PRIORITY_META[selectedPriority]?.label}</strong> priority means:
                  </Typography>

                  <Stack spacing={2}>
                    <Box sx={{ p: 2, borderRadius: 2, backgroundColor: STATUS.info.light }}>
                      <Typography variant="overline" sx={{ color: STATUS.info.dark }}>
                        First response within
                      </Typography>
                      <Typography sx={{ fontSize: '1.375rem', fontWeight: 700, color: STATUS.info.dark }}>
                        {formatMinutes(matchingSla.responseMinutes)}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, borderRadius: 2, backgroundColor: NEUTRAL[50] }}>
                      <Typography variant="overline" color="text.secondary">
                        Resolution target
                      </Typography>
                      <Typography sx={{ fontSize: '1.375rem', fontWeight: 700 }}>
                        {formatMinutes(matchingSla.resolutionMinutes)}
                      </Typography>
                    </Box>
                  </Stack>

                  {matchingSla.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                      {matchingSla.description}
                    </Typography>
                  )}

                  <Alert severity="info" sx={{ mt: 2.5 }}>
                    The clock starts the moment you submit. You'll be notified as the deadline approaches.
                  </Alert>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Choose a priority to see its response and resolution targets.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
