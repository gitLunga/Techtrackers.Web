/**
 * src/pages/tickets/AssignDialog.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces AssignTech.jsx. The old screen listed technicians as names and
 *   emails only, so an admin dispatching work had no idea who was already
 *   overloaded — and it would happily assign a ticket to a staff member,
 *   because it only checked the id was greater than zero.
 *
 * WHAT IT ACHIEVES
 *   Shows each technician's live open-ticket count and specialisation, and
 *   surfaces the backend's own recommendation (least-loaded, same department
 *   preferred). Assignment becomes an informed decision rather than a guess.
 */
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItemButton,
  ListItemAvatar, Avatar, ListItemText, Typography, Chip, Stack, Alert,
  CircularProgress, Box, Divider,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import useApi from '../../hooks/useApi.js';
import { useToast } from '../../components/Toast.jsx';
import { technicians as techApi, logs as logsApi } from '../../api/services/index.js';
import { STATUS, NEUTRAL } from '../../theme/tokens.js';

/** Green under 3 open tickets, amber to 6, red beyond — load at a glance. */
function loadTone(count) {
  if (count <= 2) return STATUS.success;
  if (count <= 5) return STATUS.warning;
  return STATUS.error;
}

export default function AssignDialog({ open, onClose, ticket, onAssigned }) {
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const { data: technicians, loading } = useApi(() => techApi.list(), [open], { immediate: open });

  // The backend's own recommendation, fetched alongside the list.
  useEffect(() => {
    if (!open) return;
    logsApi.suggestTechnician(ticket.id)
      .then(({ data }) => setSuggestion(data.recommended))
      .catch(() => setSuggestion(null));
  }, [open, ticket.id]);

  const assign = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      // `reassign` tells the backend this is a deliberate override rather than
      // an accidental double-assign.
      await logsApi.assign(ticket.id, selected, Boolean(ticket.technician));
      toast.success('Technician assigned');
      onAssigned?.();
    } catch (error) {
      toast.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {ticket.technician ? 'Reassign this ticket' : 'Assign a technician'}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {ticket.technician && (
          <Alert severity="info" sx={{ borderRadius: 0 }}>
            Currently assigned to <strong>{ticket.technician.name}</strong>. They will be notified of the change.
          </Alert>
        )}

        {suggestion && (
          <Box sx={{ p: 2, backgroundColor: NEUTRAL[25] }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <AutoAwesomeIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
              <Typography variant="overline" color="text.secondary">Suggested</Typography>
            </Stack>
            <Typography variant="body2">
              <strong>{suggestion.name}</strong> — {suggestion.openTaskCount} open ticket
              {suggestion.openTaskCount === 1 ? '' : 's'}
              {suggestion.specialization ? `, ${suggestion.specialization}` : ''}
            </Typography>
          </Box>
        )}

        <Divider />

        {loading ? (
          <Box sx={{ p: 4, display: 'grid', placeItems: 'center' }}><CircularProgress size={24} /></Box>
        ) : (
          <List disablePadding>
            {(technicians ?? []).map((tech) => {
              const tone = loadTone(tech.openTaskCount);
              const isCurrent = ticket.technician?.id === tech.id;
              return (
                <ListItemButton
                  key={tech.id}
                  selected={selected === tech.id}
                  disabled={isCurrent}
                  onClick={() => setSelected(tech.id)}
                  sx={{ borderRadius: 0, py: 1.5 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38, fontSize: '0.8125rem' }}>
                      {tech.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{tech.name}</Typography>
                        {isCurrent && <Chip size="small" label="Current" />}
                        {tech.type === 'EXTERNAL' && <Chip size="small" variant="outlined" label="External" />}
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {tech.specialization ?? 'No specialisation set'}
                        {tech.department?.name ? ` · ${tech.department.name}` : ''}
                      </Typography>
                    }
                  />
                  <Chip
                    size="small"
                    label={`${tech.openTaskCount} open`}
                    sx={{ backgroundColor: tone.light, color: tone.dark, flexShrink: 0 }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!selected || saving} onClick={assign}>
          {saving ? 'Assigning…' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
