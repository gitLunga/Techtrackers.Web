/**
 * src/pages/tickets/TicketDetail.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces FIVE separate detail screens — IssueDetails.jsx (staff, admin and
 *   technician versions), DetailView.js and DetailViewIssues.js (HOD) — plus
 *   their four stylesheets. They showed different subsets of the same ticket,
 *   so what you could see depended on which door you came through.
 *
 * WHAT IT ACHIEVES
 *   One ticket page for every role. What differs is which ACTIONS are offered,
 *   and those are derived from the ticket and the user rather than from which
 *   copy of the screen you happened to load.
 *
 *   Brings together things the old UI had scattered across separate pages or
 *   omitted entirely: the SLA clock, the full status history (a table the old
 *   backend never even wrote to), chat, attachments, escalations and feedback.
 */
import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Grid, Card, CardContent, Typography, Box, Stack, Button, Divider,
  Chip, Alert, Skeleton, Tabs, Tab, IconButton, Tooltip, LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAddAlt';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import PlaceIcon from '@mui/icons-material/PlaceOutlined';
import DevicesIcon from '@mui/icons-material/DevicesOther';
import HistoryIcon from '@mui/icons-material/History';
import ForumIcon from '@mui/icons-material/ForumOutlined';
import StarIcon from '@mui/icons-material/StarBorder';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PageHeader from '../../components/PageHeader.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import PriorityChip from '../../components/PriorityChip.jsx';
import SlaIndicator from '../../components/SlaIndicator.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusActions from './StatusActions.jsx';
import AssignDialog from './AssignDialog.jsx';
import TicketChat from './TicketChat.jsx';
import TicketHistory from './TicketHistory.jsx';
import FeedbackPanel from './FeedbackPanel.jsx';
import CollaborationDialog from './CollaborationDialog.jsx';
import useApi from '../../hooks/useApi.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { logs as logsApi } from '../../api/services/index.js';
import { NEUTRAL, STATUS } from '../../theme/tokens.js';

/** One label/value row in the details panel. */
function Field({ label, value, icon: Icon }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={0.75} alignItems="center">
        {Icon && <Icon sx={{ fontSize: 16, color: 'text.secondary' }} />}
        {typeof value === 'string' || typeof value === 'number' ? (
          <Typography variant="body2">{value || '—'}</Typography>
        ) : (
          value ?? <Typography variant="body2">—</Typography>
        )}
      </Stack>
    </Box>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole, isTechnician, homePath } = useAuth();

  const [tab, setTab] = useState('chat');
  const [assignOpen, setAssignOpen] = useState(false);
  const [collabOpen, setCollabOpen] = useState(false);

  const { data: ticket, loading, error, reload } = useApi(() => logsApi.get(Number(id)), [id]);

  if (loading) {
    return (
      <>
        <Skeleton width={280} height={44} />
        <Skeleton width={180} height={24} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}><Skeleton variant="rounded" height={320} /></Grid>
          <Grid item xs={12} md={4}><Skeleton variant="rounded" height={320} /></Grid>
        </Grid>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
        <Alert severity="error">{error.message}</Alert>
      </>
    );
  }
  if (!ticket) return null;

  // ---- what may this person do with THIS ticket? -------------------------
  const isAdmin = hasRole('ADMIN');
  const isHod = hasRole('HOD');
  const isAssignedTech = ticket.technician?.id === user?.id;
  const isReporter = ticket.reportedBy?.id === user?.id;

  const canAssign = isAdmin || isHod;
  const canCollaborate = isTechnician && isAssignedTech;
  const canGiveFeedback = isReporter && ['RESOLVED', 'CLOSED'].includes(ticket.status);

  const backTo = location.state?.from ?? `${homePath}/tickets`;

  return (
    <>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(backTo)} sx={{ mb: 1.5, ml: -1 }}>
        Back to tickets
      </Button>

      <PageHeader
        title={ticket.reference}
        subtitle={ticket.title}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {canAssign && (
              <Button variant="outlined" startIcon={<PersonAddIcon />} onClick={() => setAssignOpen(true)}>
                {ticket.technician ? 'Reassign' : 'Assign'}
              </Button>
            )}
            {canCollaborate && (
              <Button variant="outlined" onClick={() => setCollabOpen(true)}>
                Invite a colleague
              </Button>
            )}
            <StatusActions ticket={ticket} onChanged={reload} />
          </Stack>
        }
      />

      {/* An overdue ticket is the first thing that should be said about it. */}
      {ticket.slaStatus?.resolutionBreached && !ticket.slaStatus?.terminal && (
        <Alert severity="error" icon={<ReportProblemIcon />} sx={{ mb: 2.5 }}>
          This ticket has passed its SLA resolution deadline
          {ticket.escalationLevel > 0 && ` and is at escalation level ${ticket.escalationLevel}`}.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ---------------------------------------------------------- main -- */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }} flexWrap="wrap" useFlexGap>
                <StatusChip status={ticket.status} />
                <PriorityChip priority={ticket.priority} />
                {ticket.category && <Chip size="small" variant="outlined" label={ticket.category.name} />}
              </Stack>

              <Typography variant="overline" color="text.secondary">Description</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 0.5, mb: 3 }}>
                {ticket.description}
              </Typography>

              {ticket.note && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="overline" sx={{ display: 'block' }}>Latest note</Typography>
                  {ticket.note}
                </Alert>
              )}

              <Divider sx={{ mb: 2.5 }} />

              <Grid container spacing={2.5}>
                <Grid item xs={6} sm={4}>
                  <Field label="Reported by" value={ticket.reportedBy?.name} />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Field label="Department" value={ticket.department?.name} />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Field label="Location" value={ticket.location} icon={PlaceIcon} />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Field label="Technician" value={ticket.assignedTo} />
                </Grid>
                {ticket.asset && (
                  <Grid item xs={6} sm={4}>
                    <Field label="Asset" value={`${ticket.asset.tag} — ${ticket.asset.name}`} icon={DevicesIcon} />
                  </Grid>
                )}
                <Grid item xs={6} sm={4}>
                  <Field label="Logged" value={new Date(ticket.timestamps.createdAt).toLocaleString()} />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Field
                    label="Resolution due"
                    value={
                      ticket.timestamps.resolutionDueAt
                        ? new Date(ticket.timestamps.resolutionDueAt).toLocaleString()
                        : '—'
                    }
                  />
                </Grid>
              </Grid>

              {ticket.attachments?.length > 0 && (
                <>
                  <Divider sx={{ my: 2.5 }} />
                  <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Attachments ({ticket.attachments.length})
                  </Typography>
                  <Stack spacing={1}>
                    {ticket.attachments.map((file) => (
                      <Stack
                        key={file.id}
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        sx={{ p: 1.25, borderRadius: 2, backgroundColor: NEUTRAL[50] }}
                      >
                        <AttachFileIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" noWrap>{file.originalName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(file.sizeBytes / 1024).toFixed(0)} KB
                          </Typography>
                        </Box>
                        {/* Served from a dedicated endpoint - the old API
                            base64-inlined every attachment into the JSON. */}
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            component="a"
                            href={logsApi.attachmentUrl(ticket.id, file.id)}
                            target="_blank"
                            rel="noopener"
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>

          {/* Conversation / history / feedback */}
          <Card>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{ px: 2, borderBottom: `1px solid ${NEUTRAL[100]}` }}
            >
              <Tab value="chat" label="Conversation" icon={<ForumIcon sx={{ fontSize: 17 }} />} iconPosition="start" />
              <Tab value="history" label="History" icon={<HistoryIcon sx={{ fontSize: 17 }} />} iconPosition="start" />
              <Tab value="feedback" label="Feedback" icon={<StarIcon sx={{ fontSize: 17 }} />} iconPosition="start" />
            </Tabs>

            <Box sx={{ p: 2.5 }}>
              {tab === 'chat' && <TicketChat ticketId={ticket.id} />}
              {tab === 'history' && <TicketHistory history={ticket.statusHistory} escalations={ticket.escalations} />}
              {tab === 'feedback' && (
                <FeedbackPanel
                  ticket={ticket}
                  canGiveFeedback={canGiveFeedback}
                  onSubmitted={reload}
                />
              )}
            </Box>
          </Card>
        </Grid>

        {/* -------------------------------------------------------- sidebar -- */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Service level</Typography>

              {ticket.sla ? (
                <>
                  <SlaIndicator slaStatus={ticket.slaStatus} />
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2}>
                    <Field label="Priority target" value={`${ticket.sla.resolutionMinutes} minutes to resolve`} />
                    <Field
                      label="First response"
                      value={
                        ticket.timestamps.respondedAt
                          ? new Date(ticket.timestamps.respondedAt).toLocaleString()
                          : 'Not yet responded'
                      }
                    />
                    {ticket.timestamps.resolvedAt && (
                      <Field label="Resolved" value={new Date(ticket.timestamps.resolvedAt).toLocaleString()} />
                    )}
                    <Field
                      label="Escalation level"
                      value={
                        ticket.escalationLevel > 0 ? (
                          <Chip
                            size="small"
                            label={`Level ${ticket.escalationLevel}`}
                            sx={{ backgroundColor: STATUS.error.light, color: STATUS.error.dark }}
                          />
                        ) : (
                          <Typography variant="body2">None</Typography>
                        )
                      }
                    />
                  </Stack>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No SLA attached to this ticket.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <AssignDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        ticket={ticket}
        onAssigned={() => { setAssignOpen(false); reload(); }}
      />
      <CollaborationDialog
        open={collabOpen}
        onClose={() => setCollabOpen(false)}
        ticket={ticket}
      />
    </>
  );
}
