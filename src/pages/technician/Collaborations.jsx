/**
 * src/pages/technician/Collaborations.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces CollabMain.jsx, TableCollaburationRequest.jsx,
 *   IssueDetailsCollaburationRequest.jsx, SortCollaburationRequest.jsx and
 *   sortUsersCollaburationRequest.jsx — five files (with that spelling) for one
 *   feature.
 *
 *   The old flow was also unsafe: `PUT /Collaboration/Respond/{id}` took an id
 *   from the URL and no identity at all, so anyone could accept anyone else's
 *   invitation.
 *
 * WHAT IT ACHIEVES
 *   Incoming and outgoing requests in one place, scoped to you by the token.
 *   Accepting genuinely grants access to the ticket — in the old system it only
 *   flipped a status column and the collaborator still could not see the ticket
 *   they had agreed to help with.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Tabs, Tab, List, ListItem, ListItemAvatar, Avatar, ListItemText,
  Typography, Stack, Button, Chip, Box, Divider,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import useApi from '../../hooks/useApi.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import { collaborations as collabApi } from '../../api/services/index.js';
import { STATUS, NEUTRAL } from '../../theme/tokens.js';

const STATUS_TONE = {
  PENDING: STATUS.warning,
  ACCEPTED: STATUS.success,
  DECLINED: STATUS.neutral,
  CANCELLED: STATUS.neutral,
};

export default function Collaborations() {
  const navigate = useNavigate();
  const toast = useToast();
  const { homePath } = useAuth();
  const [direction, setDirection] = useState('incoming');
  const [busyId, setBusyId] = useState(null);

  const { data, loading, reload } = useApi(
    () => collabApi.list({ direction, limit: 50 }),
    [direction],
  );

  const respond = async (id, status) => {
    setBusyId(id);
    try {
      await collabApi.respond(id, status);
      toast.success(`Request ${status.toLowerCase()}`);
      reload();
    } catch (error) {
      toast.error(error);
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (id) => {
    setBusyId(id);
    try {
      await collabApi.cancel(id);
      toast.success('Request cancelled');
      reload();
    } catch (error) {
      toast.error(error);
    } finally {
      setBusyId(null);
    }
  };

  const rows = data ?? [];

  return (
    <>
      <PageHeader
        title="Collaborations"
        subtitle="Requests to work together on a ticket."
      />

      <Card>
        <Tabs
          value={direction}
          onChange={(_, v) => setDirection(v)}
          sx={{ px: 2, borderBottom: `1px solid ${NEUTRAL[100]}` }}
        >
          <Tab value="incoming" label="Invitations to me" />
          <Tab value="outgoing" label="Requests I sent" />
          <Tab value="all" label="All" />
        </Tabs>

        {loading ? (
          <Box sx={{ p: 4 }}><Typography variant="body2" color="text.secondary">Loading…</Typography></Box>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={HandshakeIcon}
            title={direction === 'incoming' ? 'No invitations' : 'No requests sent'}
            description={
              direction === 'incoming'
                ? 'When a colleague asks for your help on a ticket, it will appear here.'
                : 'Open a ticket you are working on and use "Invite a colleague" to ask for help.'
            }
          />
        ) : (
          <List disablePadding>
            {rows.map((row, index) => {
              const tone = STATUS_TONE[row.status] ?? STATUS.neutral;
              const isIncoming = direction === 'incoming' || row.invitee?.id !== row.requester?.id;
              const other = direction === 'outgoing' ? row.invitee : row.requester;

              return (
                <Box key={row.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem
                    sx={{ py: 2, alignItems: 'flex-start' }}
                    secondaryAction={
                      row.status === 'PENDING' ? (
                        <Stack direction="row" spacing={1}>
                          {direction === 'outgoing' ? (
                            <Button size="small" color="inherit" disabled={busyId === row.id} onClick={() => cancel(row.id)}>
                              Cancel
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="small" variant="contained" startIcon={<CheckIcon />}
                                disabled={busyId === row.id}
                                onClick={() => respond(row.id, 'ACCEPTED')}
                              >
                                Accept
                              </Button>
                              <Button
                                size="small" color="inherit" startIcon={<CloseIcon />}
                                disabled={busyId === row.id}
                                onClick={() => respond(row.id, 'DECLINED')}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                        </Stack>
                      ) : (
                        <Chip size="small" label={row.status} sx={{ backgroundColor: tone.light, color: tone.dark }} />
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38, fontSize: '0.75rem' }}>
                        {(other?.name ?? '?').split(' ').map((p) => p[0]).join('').slice(0, 2)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      // Both slots hold block-level content (Typography renders
                      // <p>, Box renders <div>), so neither may stay a <p>.
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600, pr: 18 }}>
                          {direction === 'outgoing'
                            ? `You invited ${other?.name}`
                            : `${other?.name} asked for your help`}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ pr: 18 }}>
                          <Button
                            size="small"
                            sx={{ px: 0, minWidth: 0, textAlign: 'left' }}
                            onClick={() => navigate(`${homePath}/tickets/${row.log?.id}`)}
                          >
                            {row.log?.reference} — {row.log?.title}
                          </Button>
                          {row.message && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                              “{row.message}”
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {new Date(row.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </Box>
              );
            })}
          </List>
        )}
      </Card>
    </>
  );
}
