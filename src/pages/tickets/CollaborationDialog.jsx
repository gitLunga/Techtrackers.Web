/**
 * src/pages/tickets/CollaborationDialog.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces the collaboration request half of CollabMain.jsx. The old flow let
 *   a technician invite themselves and did not check the invitee was a
 *   technician at all.
 *
 * WHAT IT ACHIEVES
 *   Invites a colleague onto a ticket. Excludes the current user and the already
 *   assigned technician from the list, so the two invalid choices cannot be made.
 *   Accepting the invite grants the colleague real visibility of the ticket —
 *   in the old system it only flipped a status column.
 */
import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Stack, Typography, CircularProgress, Box,
} from '@mui/material';
import useApi from '../../hooks/useApi.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import { technicians as techApi, collaborations as collabApi } from '../../api/services/index.js';

export default function CollaborationDialog({ open, onClose, ticket }) {
  const { user } = useAuth();
  const toast = useToast();
  const [inviteeId, setInviteeId] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: technicians, loading } = useApi(() => techApi.list(), [open], { immediate: open });

  // You cannot invite yourself, and inviting the person already assigned is
  // meaningless — remove both rather than letting the request fail.
  const candidates = (technicians ?? []).filter(
    (t) => t.id !== user?.id && t.id !== ticket.technician?.id,
  );

  const send = async () => {
    setSaving(true);
    try {
      await collabApi.request(ticket.id, inviteeId, message.trim() || undefined);
      toast.success('Collaboration request sent');
      setInviteeId('');
      setMessage('');
      onClose();
    } catch (error) {
      toast.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Invite a colleague to collaborate</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          They'll be notified and emailed. If they accept, they get access to this ticket and its conversation.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 3 }}><CircularProgress size={22} /></Box>
        ) : (
          <Stack spacing={2.5}>
            <TextField
              select
              label="Technician"
              value={inviteeId}
              onChange={(e) => setInviteeId(e.target.value)}
              helperText={candidates.length === 0 ? 'No other technicians available' : undefined}
            >
              {candidates.map((tech) => (
                <MenuItem key={tech.id} value={tech.id}>
                  {tech.name}
                  {tech.specialization ? ` — ${tech.specialization}` : ''}
                  {` (${tech.openTaskCount} open)`}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Message (optional)"
              multiline
              minRows={3}
              placeholder="e.g. Could you take a look at the power circuit with me?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!inviteeId || saving} onClick={send}>
          {saving ? 'Sending…' : 'Send request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
