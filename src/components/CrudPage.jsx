/**
 * src/components/CrudPage.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Departments, categories and SLA targets are all the same screen: a table, an
 *   "add" button, edit and delete. The old app implemented them separately —
 *   ManageDepartments.jsx, ManageCategories.jsx, CreateDepartment.jsx,
 *   CreateCategory.jsx, ManagUserRoles.jsx — five components and five CSS
 *   modules for one pattern, each with slightly different behaviour.
 *
 * WHAT IT ACHIEVES
 *   The pattern once. A caller supplies its columns, its form fields and its
 *   three API calls; everything else — the dialog, validation wiring, delete
 *   confirmation, loading, empty state and error handling — comes from here.
 *
 *   Delete always confirms, because the backend legitimately refuses to remove
 *   reference data that is in use and the user needs to understand why.
 */
import { useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Stack, IconButton, Tooltip, Typography, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from './PageHeader.jsx';
import DataTable from './DataTable.jsx';
import { useToast } from './Toast.jsx';
import useApi from '../hooks/useApi.js';

export default function CrudPage({
  title,
  subtitle,
  columns,
  fields,              // [{ name, label, type, options, required, helperText }]
  fetchAll,
  onCreate,
  onUpdate,
  onDelete,
  addLabel = 'Add',
  emptyTitle,
  emptyDescription,
  canEdit = true,
  canDelete = true,
  getRowKey,
}) {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(fetchAll, []);
  const [dialog, setDialog] = useState(null);      // { mode, row }
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [formError, setFormError] = useState(null);

  const openCreate = () => {
    setValues(Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ''])));
    setFormError(null);
    setDialog({ mode: 'create' });
  };

  const openEdit = (row) => {
    setValues(Object.fromEntries(fields.map((f) => [f.name, row[f.name] ?? ''])));
    setFormError(null);
    setDialog({ mode: 'edit', row });
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      if (dialog.mode === 'create') await onCreate(values);
      else await onUpdate(dialog.row, values);
      toast.success(dialog.mode === 'create' ? `${addLabel.replace(/^Add\s*/i, '')} created` : 'Changes saved');
      setDialog(null);
      reload();
    } catch (err) {
      // Shown inside the dialog so the user keeps their input.
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await onDelete(deleting);
      toast.success('Deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      // e.g. "still has 8 tickets and cannot be deleted" — a real, useful answer.
      toast.error(err);
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  };

  const actionColumn = {
    id: '__actions',
    label: '',
    align: 'right',
    width: 100,
    render: (row) => (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        {canEdit && onUpdate && (
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {canDelete && onDelete && (
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleting(row); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    ),
  };

  const required = fields.filter((f) => f.required);
  const isValid = required.every((f) => String(values[f.name] ?? '').trim() !== '');

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          onCreate && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              {addLabel}
            </Button>
          )
        }
      />

      <DataTable
        columns={[...columns, ...(canEdit || canDelete ? [actionColumn] : [])]}
        rows={data ?? []}
        loading={loading}
        error={error}
        getRowKey={getRowKey}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={onCreate ? { actionLabel: addLabel, onAction: openCreate } : undefined}
      />

      {/* Create / edit */}
      <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>{dialog?.mode === 'create' ? addLabel : 'Edit'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                select={field.type === 'select'}
                type={field.type === 'number' ? 'number' : 'text'}
                label={field.label}
                value={values[field.name] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                helperText={field.helperText}
                required={field.required}
                disabled={field.disableOnEdit && dialog?.mode === 'edit'}
                autoFocus={fields[0].name === field.name}
              >
                {field.type === 'select' &&
                  (field.options ?? []).map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
              </TextField>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={!isValid || saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete this item?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This cannot be undone. Items still referenced by tickets or users cannot be deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleting(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={saving}>
            {saving ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
