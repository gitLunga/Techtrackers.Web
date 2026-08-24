/**
 * src/pages/admin/AssetsAdmin.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The system tracked tickets ABOUT hardware but never the hardware itself.
 *   This is the admin screen for the inventory added in server/src/services/
 *   asset.service.js — built on CrudPage like departments/categories/SLAs,
 *   since it's the same shape: a table, add/edit/delete, backend-enforced
 *   delete guards.
 */
import { Typography, Chip, Stack } from '@mui/material';
import CrudPage from '../../components/CrudPage.jsx';
import useApi from '../../hooks/useApi.js';
import { assets as assetsApi, departments as deptApi, users as usersApi } from '../../api/services/index.js';
import { ASSET_STATUS_META } from '../../components/AssetStatusChip.jsx';

export default function AssetsAdmin() {
  const { data: departments } = useApi(() => deptApi.list(), []);
  const { data: usersPage } = useApi(() => usersApi.list({ limit: 100 }), []);
  const users = usersPage ?? [];

  return (
    <CrudPage
      title="Assets"
      subtitle="Hardware inventory — tag, assign, and track which tickets were raised against each item."
      addLabel="Add asset"
      emptyTitle="No assets yet"
      emptyDescription="Add hardware here so tickets can reference the specific item involved."
      fetchAll={() => assetsApi.list({ limit: 100 })}
      onCreate={(v) => assetsApi.create({
        tag: v.tag,
        name: v.name,
        type: v.type,
        serialNumber: v.serialNumber || undefined,
        departmentId: Number(v.departmentId),
        status: v.status,
        assignedToId: v.assignedToId ? Number(v.assignedToId) : undefined,
        notes: v.notes || undefined,
      })}
      onUpdate={(row, v) => assetsApi.update(row.id, {
        tag: v.tag,
        name: v.name,
        type: v.type,
        serialNumber: v.serialNumber || undefined,
        departmentId: Number(v.departmentId),
        status: v.status,
        assignedToId: v.assignedToId ? Number(v.assignedToId) : null,
        notes: v.notes || undefined,
      })}
      onDelete={(row) => assetsApi.remove(row.id)}
      columns={[
        { id: 'tag', label: 'Tag', render: (r) => <Chip size="small" label={r.tag} variant="outlined" /> },
        { id: 'name', label: 'Asset', render: (r) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.name}</Typography> },
        { id: 'type', label: 'Type', render: (r) => <Typography variant="body2">{r.type}</Typography>, hideBelow: 'sm' },
        {
          id: 'status',
          label: 'Status',
          render: (r) => (
            <Chip
              size="small"
              label={ASSET_STATUS_META[r.status]?.label ?? r.status}
              sx={{
                backgroundColor: ASSET_STATUS_META[r.status]?.tone.light,
                color: ASSET_STATUS_META[r.status]?.tone.dark,
              }}
            />
          ),
        },
        {
          id: 'assignedTo',
          label: 'Assigned to',
          render: (r) => <Typography variant="body2" color={r.assignedTo ? 'text.primary' : 'text.secondary'}>{r.assignedTo?.name ?? 'Unassigned'}</Typography>,
          hideBelow: 'md',
        },
        { id: 'ticketCount', label: 'Tickets', render: (r) => <Typography variant="body2">{r.ticketCount ?? 0}</Typography>, hideBelow: 'lg' },
      ]}
      fields={[
        { name: 'tag', label: 'Asset tag', required: true, helperText: 'Unique — e.g. IT-LAPTOP-014. Printable as a QR code for scan-to-log.' },
        { name: 'name', label: 'Name', required: true, helperText: 'e.g. Dell Latitude 5420' },
        { name: 'type', label: 'Type', required: true, helperText: 'e.g. Laptop, Printer, Monitor' },
        { name: 'serialNumber', label: 'Serial number (optional)' },
        {
          name: 'departmentId', label: 'Department', type: 'select', required: true,
          options: (departments ?? []).map((d) => ({ value: d.id, label: d.name })),
        },
        {
          name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'IN_STORAGE',
          options: Object.entries(ASSET_STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
        },
        {
          name: 'assignedToId', label: 'Assigned to (optional)', type: 'select',
          options: [{ value: '', label: 'Unassigned' }, ...users.map((u) => ({ value: u.id, label: u.name }))],
        },
        { name: 'notes', label: 'Notes (optional)' },
      ]}
    />
  );
}
