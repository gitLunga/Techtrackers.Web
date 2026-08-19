/**
 * src/pages/tickets/StatusActions.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   In the old app, status buttons were hard-coded per screen — the technician
 *   view had "Resolve" and "On Hold", the admin view had "Close" and "Open" —
 *   and none of them knew which transitions were actually legal. Pressing the
 *   wrong one produced a server error the UI showed as a generic failure.
 *
 * WHAT IT ACHIEVES
 *   Offers only the transitions the backend will accept, by reading the SAME
 *   transition table the API enforces. An illegal action is never rendered, so
 *   it can never be attempted.
 *
 *   ON_HOLD requires a note (a backend rule), so choosing it opens a dialog that
 *   asks for one rather than letting the request fail.
 */
import { useState } from 'react';
import {
  Button, Menu, MenuItem, ListItemIcon, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { STATUS_META } from '../../components/StatusChip.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { logs as logsApi } from '../../api/services/index.js';

/**
 * Mirrors STATUS_TRANSITIONS in the backend's constants/index.js.
 * Kept in sync deliberately: the server is the authority, this only decides
 * what to OFFER.
 */
const TRANSITIONS = {
  PENDING: ['ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'CLOSED'],
  ASSIGNED: ['IN_PROGRESS', 'ON_HOLD', 'ESCALATED', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['ON_HOLD', 'ESCALATED', 'RESOLVED', 'CLOSED'],
  ON_HOLD: ['IN_PROGRESS', 'ESCALATED', 'CLOSED'],
  ESCALATED: ['IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
};

export default function StatusActions({ ticket, onChanged }) {
  const toast = useToast();
  const { user, hasRole, isTechnician } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [pending, setPending] = useState(null);   // status awaiting a note
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = hasRole('ADMIN');
  const isHod = hasRole('HOD');
  const isAssignedTech = ticket.technician?.id === user?.id;
  const isReporter = ticket.reportedBy?.id === user?.id;

  // Mirrors assertCanModify() on the server.
  const canDrive = isAdmin || isHod || isAssignedTech;
  // A reporter may only CLOSE a ticket the technician already resolved — they
  // must not be able to mark their own issue resolved.
  const reporterMayClose = isReporter && ticket.status === 'RESOLVED';

  let available = canDrive ? (TRANSITIONS[ticket.status] ?? []) : reporterMayClose ? ['CLOSED'] : [];

  // Reopening a CLOSED ticket goes through its own endpoint, not a transition.
  const canReopen = (isAdmin || isHod) && ticket.status === 'CLOSED';

  if (available.length === 0 && !canReopen) return null;

  const apply = async (status, withNote) => {
    setSaving(true);
    try {
      await logsApi.changeStatus(ticket.id, status, withNote || undefined);
      toast.success(`Ticket moved to ${STATUS_META[status]?.label ?? status}`);
      setPending(null);
      setNote('');
      onChanged?.();
    } catch (error) {
      toast.error(error);
    } finally {
      setSaving(false);
    }
  };

  const choose = (status) => {
    setAnchorEl(null);
    // The backend rejects ON_HOLD without a note, so ask for one first.
    if (status === 'ON_HOLD') { setPending(status); return; }
    apply(status);
  };

  const reopen = async () => {
    setAnchorEl(null);
    setSaving(true);
    try {
      await logsApi.reopen(ticket.id, 'Reopened for further investigation');
      toast.success('Ticket reopened');
      onChanged?.();
    } catch (error) {
      toast.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        endIcon={<ExpandMoreIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={saving}
      >
        {saving ? <CircularProgress size={18} color="inherit" /> : 'Update status'}
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {available.map((status) => {
          const meta = STATUS_META[status];
          const Icon = meta.Icon;
          return (
            <MenuItem key={status} onClick={() => choose(status)}>
              <ListItemIcon><Icon sx={{ fontSize: 18, color: meta.tone.main }} /></ListItemIcon>
              Mark as {meta.label}
            </MenuItem>
          );
        })}
        {canReopen && <MenuItem onClick={reopen}>Reopen ticket</MenuItem>}
      </Menu>

      {/* Note required for ON_HOLD */}
      <Dialog open={Boolean(pending)} onClose={() => setPending(null)} fullWidth maxWidth="sm">
        <DialogTitle>Why is this on hold?</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            minRows={3}
            label="Reason"
            placeholder="e.g. Awaiting a replacement battery from the supplier"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            helperText="This is recorded in the ticket history and shown to the person who reported it."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPending(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!note.trim() || saving}
            onClick={() => apply(pending, note.trim())}
          >
            Put on hold
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
