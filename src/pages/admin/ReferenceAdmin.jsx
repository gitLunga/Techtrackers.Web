/**
 * src/pages/admin/ReferenceAdmin.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Departments, categories and SLA targets, each configured through the shared
 *   CrudPage. Together these replace five old screens and five stylesheets.
 *
 *   Two of them had no UI at all before: there was NO way to manage categories
 *   (the ticket form needed a valid CategoryId and you had to know it by heart),
 *   and NO way to configure SLA targets despite SLA being the product's whole
 *   purpose — the numbers were only ever set by inserting rows in SQL.
 *
 * WHAT IT ACHIEVES
 *   Each export is a few lines of configuration rather than a component, which
 *   is the payoff of having built CrudPage once.
 */
import { Typography, Chip, Stack } from '@mui/material';
import CrudPage from '../../components/CrudPage.jsx';
import { departments as deptApi, categories as catApi, slas as slaApi } from '../../api/services/index.js';
import { PRIORITY_META } from '../../components/PriorityChip.jsx';

/* --------------------------------------------------------- departments -- */
export function DepartmentsAdmin() {
  return (
    <CrudPage
      title="Departments"
      subtitle="Departments own tickets and give them their reference prefix."
      addLabel="Add department"
      emptyTitle="No departments yet"
      emptyDescription="Add the first department so users and tickets can be assigned to one."
      fetchAll={() => deptApi.list()}
      onCreate={(v) => deptApi.create({ name: v.name, code: v.code || undefined })}
      onUpdate={(row, v) => deptApi.update(row.id, { name: v.name, code: v.code })}
      onDelete={(row) => deptApi.remove(row.id)}
      columns={[
        { id: 'name', label: 'Department', render: (r) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.name}</Typography> },
        {
          id: 'code',
          label: 'Reference prefix',
          // Makes the connection explicit: this code becomes ICT-0001.
          render: (r) => <Chip size="small" label={`${r.code}-0001`} variant="outlined" />,
        },
        { id: 'users', label: 'Users', render: (r) => <Typography variant="body2">{r._count?.users ?? 0}</Typography> },
        { id: 'logs', label: 'Tickets', render: (r) => <Typography variant="body2">{r._count?.logs ?? 0}</Typography> },
      ]}
      fields={[
        { name: 'name', label: 'Department name', required: true, helperText: 'e.g. Information Technology' },
        { name: 'code', label: 'Reference prefix', helperText: 'Letters only, 2-5 characters. Leave blank to derive it from the name.' },
      ]}
    />
  );
}

/* ---------------------------------------------------------- categories -- */
export function CategoriesAdmin() {
  return (
    <CrudPage
      title="Issue categories"
      subtitle="These populate the category dropdown when someone logs an issue."
      addLabel="Add category"
      emptyTitle="No categories yet"
      emptyDescription="Add categories so people can classify the issues they log."
      fetchAll={() => catApi.list()}
      onCreate={(v) => catApi.create(v.name)}
      onUpdate={(row, v) => catApi.update(row.id, v.name)}
      onDelete={(row) => catApi.remove(row.id)}
      columns={[
        { id: 'name', label: 'Category', render: (r) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.name}</Typography> },
        { id: 'logs', label: 'Tickets using it', render: (r) => <Typography variant="body2">{r._count?.logs ?? 0}</Typography> },
      ]}
      fields={[{ name: 'name', label: 'Category name', required: true, helperText: 'e.g. Network Connectivity' }]}
    />
  );
}

/* ---------------------------------------------------------------- SLAs -- */
/** 240 -> "4h", 4320 -> "3 days" — minutes are how the API stores it, not how people read it. */
function formatMinutes(minutes) {
  if (minutes == null) return '—';
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (hours < 24) return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
  const days = hours / 24;
  return `${Number.isInteger(days) ? days : days.toFixed(1)} days`;
}

export function SlaAdmin() {
  return (
    <CrudPage
      title="SLA targets"
      subtitle="One target per priority. A ticket's priority automatically selects its deadlines."
      addLabel="Set a target"
      emptyTitle="No SLA targets configured"
      emptyDescription="Without these, tickets cannot be logged — the API needs a target for each priority."
      fetchAll={() => slaApi.list()}
      // The API upserts by priority, so create and update are the same call.
      onCreate={(v) => slaApi.save({
        priority: v.priority,
        description: v.description,
        responseMinutes: Number(v.responseMinutes),
        resolutionMinutes: Number(v.resolutionMinutes),
      })}
      onUpdate={(row, v) => slaApi.save({
        priority: row.priority,
        description: v.description,
        responseMinutes: Number(v.responseMinutes),
        resolutionMinutes: Number(v.resolutionMinutes),
      })}
      onDelete={(row) => slaApi.remove(row.id)}
      columns={[
        {
          id: 'priority',
          label: 'Priority',
          render: (r) => (
            <Stack direction="row" alignItems="center" spacing={1}>
              <span style={{ width: 3, height: 14, borderRadius: 2, background: PRIORITY_META[r.priority]?.color, display: 'inline-block' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {PRIORITY_META[r.priority]?.label ?? r.priority}
              </Typography>
            </Stack>
          ),
        },
        { id: 'responseMinutes', label: 'Respond within', render: (r) => <Typography variant="body2">{formatMinutes(r.responseMinutes)}</Typography> },
        { id: 'resolutionMinutes', label: 'Resolve within', render: (r) => <Typography variant="body2">{formatMinutes(r.resolutionMinutes)}</Typography> },
        { id: 'description', label: 'When to use', render: (r) => <Typography variant="body2" color="text.secondary">{r.description || '—'}</Typography>, hideBelow: 'md' },
      ]}
      fields={[
        {
          name: 'priority', label: 'Priority', type: 'select', required: true, disableOnEdit: true,
          options: Object.entries(PRIORITY_META).map(([value, meta]) => ({ value, label: meta.label })),
        },
        { name: 'responseMinutes', label: 'Respond within (minutes)', type: 'number', required: true, helperText: 'Time to acknowledge and assign. e.g. 15' },
        { name: 'resolutionMinutes', label: 'Resolve within (minutes)', type: 'number', required: true, helperText: 'Must be larger than the response time. e.g. 240' },
        { name: 'description', label: 'When to use this priority', helperText: 'e.g. System down or business-critical outage' },
      ]}
    />
  );
}
