/**
 * src/pages/shared/Notifications.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old app had THREE notification screens (NotificationsPage.jsx,
 *   NotifView.jsx, Notification.jsx) plus a fourth endpoint bolted onto
 *   LogController — nobody could tell which was current. Its live endpoint was
 *   `GET /{userId}/staged`, so changing the number in the URL read someone
 *   else's notifications.
 *
 * WHAT IT ACHIEVES
 *   One screen, implicitly scoped to you — no user id appears in any request.
 *   Clicking a notification navigates to the ticket it refers to, which the old
 *   screens never did, so a notification was a dead end.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, List, ListItemButton, ListItemIcon, ListItemText, Typography, Box,
  Button, Stack, Chip, Divider, Tabs, Tab,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import WarningIcon from '@mui/icons-material/WarningAmber';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsIcon from '@mui/icons-material/NotificationsNone';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import useApi from '../../hooks/useApi.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import { notifications as notificationsApi } from '../../api/services/index.js';
import { STATUS, NEUTRAL } from '../../theme/tokens.js';

const TYPE_META = {
  INFORMATION: { Icon: InfoIcon, tone: STATUS.info },
  WARNING: { Icon: WarningIcon, tone: STATUS.warning },
  ALERT: { Icon: ReportProblemIcon, tone: STATUS.error },
};

export default function Notifications() {
  const navigate = useNavigate();
  const toast = useToast();
  const { homePath } = useAuth();
  const [filter, setFilter] = useState('all');

  const { data, meta, loading, reload } = useApi(
    () => notificationsApi.list({ limit: 50, ...(filter === 'unread' ? { unreadOnly: true } : {}) }),
    [filter],
  );

  const open = async (notification) => {
    if (!notification.isRead) {
      try { await notificationsApi.markRead(notification.id); } catch { /* non-blocking */ }
    }
    // A notification about a ticket should take you to that ticket.
    if (notification.logId) navigate(`${homePath}/tickets/${notification.logId}`);
    else reload();
  };

  const markAllRead = async () => {
    try {
      const { data: result } = await notificationsApi.markAllRead();
      toast.success(`${result.updated} notification${result.updated === 1 ? '' : 's'} marked as read`);
      reload();
    } catch (error) {
      toast.error(error);
    }
  };

  const unreadCount = meta?.unreadCount ?? 0;

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
        action={
          unreadCount > 0 && (
            <Button variant="outlined" startIcon={<DoneAllIcon />} onClick={markAllRead}>
              Mark all as read
            </Button>
          )
        }
      />

      <Card>
        <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ px: 2, borderBottom: `1px solid ${NEUTRAL[100]}` }}>
          <Tab value="all" label="All" />
          <Tab value="unread" label={`Unread${unreadCount ? ` (${unreadCount})` : ''}`} />
        </Tabs>

        {loading ? (
          <Box sx={{ p: 4 }}><Typography variant="body2" color="text.secondary">Loading…</Typography></Box>
        ) : (data ?? []).length === 0 ? (
          <EmptyState
            icon={NotificationsIcon}
            title={filter === 'unread' ? 'Nothing unread' : 'No notifications yet'}
            description="You'll be notified when a ticket you're involved in changes, or when an SLA deadline is approaching."
          />
        ) : (
          <List disablePadding>
            {(data ?? []).map((notification, index) => {
              const meta = TYPE_META[notification.type] ?? TYPE_META.INFORMATION;
              const { Icon, tone } = meta;
              return (
                <Box key={notification.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItemButton
                    onClick={() => open(notification)}
                    sx={{
                      py: 1.75, borderRadius: 0,
                      // Unread gets a tinted background and a left rule so the
                      // distinction survives a quick scan.
                      backgroundColor: notification.isRead ? 'transparent' : NEUTRAL[25],
                      borderLeft: notification.isRead ? '3px solid transparent' : `3px solid ${tone.main}`,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 42 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', backgroundColor: tone.light, color: tone.main }}>
                        <Icon sx={{ fontSize: 16 }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      // `secondary` renders as <p> by default; it contains a
                      // Stack (a div), which is invalid HTML nesting.
                      secondaryTypographyProps={{ component: 'div' }}
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: notification.isRead ? 400 : 600, whiteSpace: 'pre-line' }}>
                          {notification.message}
                        </Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                          {notification.log && (
                            <Chip size="small" variant="outlined" label={notification.log.reference} />
                          )}
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </Box>
              );
            })}
          </List>
        )}
      </Card>
    </>
  );
}
