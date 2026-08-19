/**
 * src/components/StatusChip.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Ticket status appeared in at least six places in the old app — staff table,
 *   admin table, technician table, HOD table, issue detail, reports — and each
 *   styled it independently. Colours disagreed, and so did the labels: the same
 *   state showed as "INPROGRESS" on one screen and "In Progress" on another,
 *   because the raw database string was rendered directly.
 *
 * WHAT IT ACHIEVES
 *   ONE component owns how a status looks and reads. Change the colour of
 *   ON_HOLD here and it changes everywhere, by construction.
 *
 *   It also translates the backend's enum into human text once, centrally, so
 *   no screen renders `IN_PROGRESS` at a user again.
 */
import { Chip } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BuildIcon from '@mui/icons-material/Build';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { STATUS } from '../theme/tokens.js';

/** Backend enum -> label, colour and icon. The single definition in the app. */
export const STATUS_META = {
  PENDING:     { label: 'Pending',     tone: STATUS.neutral, Icon: ScheduleIcon },
  ASSIGNED:    { label: 'Assigned',    tone: STATUS.info,    Icon: AssignmentIndIcon },
  IN_PROGRESS: { label: 'In Progress', tone: STATUS.info,    Icon: BuildIcon },
  ON_HOLD:     { label: 'On Hold',     tone: STATUS.warning, Icon: PauseCircleIcon },
  ESCALATED:   { label: 'Escalated',   tone: STATUS.error,   Icon: ReportProblemIcon },
  RESOLVED:    { label: 'Resolved',    tone: STATUS.success, Icon: CheckCircleIcon },
  CLOSED:      { label: 'Closed',      tone: STATUS.neutral, Icon: TaskAltIcon },
};

export default function StatusChip({ status, size = 'small', withIcon = true }) {
  const meta = STATUS_META[status] ?? {
    label: status ?? 'Unknown',
    tone: STATUS.neutral,
    Icon: ScheduleIcon,
  };
  const { label, tone, Icon } = meta;

  return (
    <Chip
      size={size}
      label={label}
      icon={withIcon ? <Icon sx={{ fontSize: 15, color: `${tone.main} !important` }} /> : undefined}
      sx={{
        backgroundColor: tone.light,
        color: tone.dark,
        border: `1px solid ${tone.main}22`,
        '& .MuiChip-label': { paddingInline: 1 },
      }}
    />
  );
}
