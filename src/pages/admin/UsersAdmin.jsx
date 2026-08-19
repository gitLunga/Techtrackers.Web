/**
 * src/pages/admin/UsersAdmin.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   There was no user administration UI at all. The backend file meant to
 *   provide it (AddUserService.cs) was entirely commented out, so users had to
 *   be inserted by hand in SQL. TechnicianHandler and ExternalTechnicianHandler
 *   were the closest thing — two near-identical screens differing only in a
 *   hard-coded "internal"/"external" string.
 *
 * WHAT IT ACHIEVES
 *   Full user management. A technician is a USER WITH A ROLE, not a separate
 *   entity, so choosing a technician role reveals the technician profile fields
 *   in the same form — and the backend creates both records in one transaction.
 *
 *   Deactivate rather than delete: users are referenced by every ticket they
 *   ever touched, so removing them would destroy real history.
 */
import { useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Stack, Chip, Typography, Alert, IconButton, Tooltip, Grid, Divider, Switch,
  FormControlLabel, InputAdornment,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAddAlt1';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable, { CellStack } from '../../components/DataTable.jsx';
import useApi from '../../hooks/useApi.js';
import useDebounced from '../../hooks/useDebounced.js';
import { useToast } from '../../components/Toast.jsx';
import { users as usersApi, departments as deptApi } from '../../api/services/index.js';
import { STATUS } from '../../theme/tokens.js';

const ROLE_OPTIONS = [
  { value: 'STAFF', label: 'Staff' },
  { value: 'TECHNICIAN', label: 'Technician' },
  { value: 'EXTERNAL_TECHNICIAN', label: 'External technician' },
  { value: 'HOD', label: 'Head of Department' },
  { value: 'ADMIN', label: 'Administrator' },
];

const TECH_ROLES = ['TECHNICIAN', 'EXTERNAL_TECHNICIAN'];

const BLANK = {
  surname: '', initials: '', email: '', password: '', phone: '',
  departmentId: '', role: 'STAFF',
  specialization: '', availableFrom: '08:00', availableTo: '17:00', location: '',
};

export default function UsersAdmin() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [dialog, setDialog] = useState(null);
  const [values, setValues] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const debouncedSearch = useDebounced(search, 350);

  const { data: users, meta, loading, error, reload } = useApi(
    () => usersApi.list({ limit: 100, ...(debouncedSearch && { search: debouncedSearch }), ...(roleFilter && { role: roleFilter }) }),
    [debouncedSearch, roleFilter],
  );
  const { data: departments } = useApi(() => deptApi.list(), []);

  const isTechRole = TECH_ROLES.includes(values.role);

  const openCreate = () => { setValues(BLANK); setFormError(null); setDialog('create'); };

  const openEdit = (user) => {
    setValues({
      ...BLANK,
      surname: user.surname ?? '',
      initials: user.initials ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      departmentId: user.department?.id ?? '',
      role: user.roles?.[0] ?? 'STAFF',
      specialization: user.technicianProfile?.specialization ?? '',
      location: user.technicianProfile?.location ?? '',
      id: user.id,
    });
    setFormError(null);
    setDialog('edit');
  };

  const save = async () => {
    setSaving(true); setFormError(null);
    try {
      const technicianProfile = isTechRole
        ? {
            specialization: values.specialization || undefined,
            availableFrom: values.availableFrom || undefined,
            availableTo: values.availableTo || undefined,
            location: values.location || undefined,
          }
        : undefined;

      if (dialog === 'create') {
        await usersApi.create({
          surname: values.surname,
          initials: values.initials || undefined,
          email: values.email,
          password: values.password,
          phone: values.phone || undefined,
          departmentId: Number(values.departmentId),
          roles: [values.role],
          technicianProfile,
        });
        toast.success('User created');
      } else {
        await usersApi.update(values.id, {
          surname: values.surname,
          initials: values.initials,
          phone: values.phone || undefined,
          departmentId: Number(values.departmentId),
          roles: [values.role],
          technicianProfile,
        });
        toast.success('User updated');
      }
      setDialog(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user) => {
    try {
      if (user.isActive) {
        await usersApi.deactivate(user.id);
        toast.success(`${user.name} deactivated`);
      } else {
        await usersApi.reactivate(user.id);
        toast.success(`${user.name} reactivated`);
      }
      reload();
    } catch (err) {
      // e.g. "still has 3 open tickets. Reassign them before deactivating."
      toast.error(err);
    }
  };

  const valid = values.surname && values.email && values.departmentId &&
    (dialog === 'edit' || values.password.length >= 8);

  const columns = [
    { id: 'name', label: 'User', render: (u) => <CellStack primary={u.name} secondary={u.email} /> },
    {
      id: 'roles',
      label: 'Role',
      render: (u) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {u.roles.map((r) => (
            <Chip key={r} size="small" variant="outlined" label={ROLE_OPTIONS.find((o) => o.value === r)?.label ?? r} />
          ))}
        </Stack>
      ),
    },
    { id: 'department', label: 'Department', render: (u) => <Typography variant="body2">{u.department?.name ?? '—'}</Typography>, hideBelow: 'md' },
    {
      id: 'isActive',
      label: 'Status',
      render: (u) => (
        <Chip
          size="small"
          label={u.isActive ? 'Active' : 'Deactivated'}
          sx={{
            backgroundColor: u.isActive ? STATUS.success.light : STATUS.neutral.light,
            color: u.isActive ? STATUS.success.dark : STATUS.neutral.dark,
          }}
        />
      ),
    },
    {
      id: '__actions',
      label: '',
      align: 'right',
      width: 100,
      render: (u) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(u)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title={u.isActive ? 'Deactivate' : 'Reactivate'}>
            <IconButton size="small" color={u.isActive ? 'error' : 'success'} onClick={() => toggleActive(u)}>
              {u.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={meta?.total != null ? `${meta.total} user${meta.total === 1 ? '' : 's'}` : undefined}
        action={<Button variant="contained" startIcon={<PersonAddIcon />} onClick={openCreate}>Add user</Button>}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
        <TextField
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: { sm: 320 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
        />
        <TextField select label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} sx={{ maxWidth: { sm: 220 } }}>
          <MenuItem value="">All roles</MenuItem>
          {ROLE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
      </Stack>

      <DataTable
        columns={columns}
        rows={users ?? []}
        loading={loading}
        error={error}
        emptyTitle="No users found"
        emptyDescription="Try a different search, or add a user."
      />

      <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>{dialog === 'create' ? 'Add a user' : 'Edit user'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Grid container spacing={2.5} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={8}>
              <TextField label="Surname" required value={values.surname} onChange={(e) => setValues((v) => ({ ...v, surname: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Initials" value={values.initials} onChange={(e) => setValues((v) => ({ ...v, initials: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email address" type="email" required
                value={values.email}
                disabled={dialog === 'edit'}
                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                helperText={dialog === 'edit' ? 'Email cannot be changed after creation' : undefined}
              />
            </Grid>
            {dialog === 'create' && (
              <Grid item xs={12}>
                <TextField
                  label="Temporary password" type="text" required
                  value={values.password}
                  onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
                  helperText="At least 8 characters with upper, lower and a number. They can change it after signing in."
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField select label="Department" required value={values.departmentId} onChange={(e) => setValues((v) => ({ ...v, departmentId: e.target.value }))}>
                {(departments ?? []).map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Role" required value={values.role} onChange={(e) => setValues((v) => ({ ...v, role: e.target.value }))}>
                {ROLE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Phone (optional)" value={values.phone} onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))} />
            </Grid>

            {/* Technician fields appear only for technician roles — a technician
                is a user with a role, not a different kind of record. */}
            {isTechRole && (
              <>
                <Grid item xs={12}><Divider sx={{ my: 0.5 }} /><Typography variant="overline" color="text.secondary">Technician profile</Typography></Grid>
                <Grid item xs={12}>
                  <TextField label="Specialisation" value={values.specialization} onChange={(e) => setValues((v) => ({ ...v, specialization: e.target.value }))} helperText="e.g. Hardware & Networking" />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Available from" type="time" value={values.availableFrom} onChange={(e) => setValues((v) => ({ ...v, availableFrom: e.target.value }))} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Available to" type="time" value={values.availableTo} onChange={(e) => setValues((v) => ({ ...v, availableTo: e.target.value }))} InputLabelProps={{ shrink: true }} />
                </Grid>
                {values.role === 'EXTERNAL_TECHNICIAN' && (
                  <Grid item xs={12}>
                    <TextField label="Base location" value={values.location} onChange={(e) => setValues((v) => ({ ...v, location: e.target.value }))} helperText="Where this contractor is based" />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={!valid || saving}>
            {saving ? 'Saving…' : dialog === 'create' ? 'Create user' : 'Save changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
