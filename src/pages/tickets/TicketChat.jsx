/**
 * src/pages/tickets/TicketChat.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces LiveChat.js, which existed in FOUR role folders. In the old stack
 *   the controller saved messages and the SignalR hub broadcast them, and the
 *   two were never connected — so refreshing the page lost half the
 *   conversation. The hub also had no authentication at all.
 *
 * WHAT IT ACHIEVES
 *   Loads history over REST and subscribes to new messages over Socket.IO. The
 *   backend routes both through the same service, so what you see live and what
 *   survives a refresh are the same thing.
 *
 *   Optimistic send: the message appears immediately and is reconciled when the
 *   server confirms, so the conversation feels instant on a slow connection.
 */
import { useEffect, useRef, useState } from 'react';
import { Box, TextField, IconButton, Stack, Typography, Avatar, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmptyState from '../../components/EmptyState.jsx';
import ForumIcon from '@mui/icons-material/ForumOutlined';
import useApi from '../../hooks/useApi.js';
import useSocket from '../../hooks/useSocket.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import { logs as logsApi } from '../../api/services/index.js';
import { NEUTRAL, SECONDARY } from '../../theme/tokens.js';

export default function TicketChat({ ticketId }) {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const { data, loading } = useApi(() => logsApi.chat.list(ticketId, { limit: 100 }), [ticketId]);

  useEffect(() => { if (data) setMessages(data); }, [data]);

  // Live updates. Joining the ticket room is authorised server-side using the
  // same participant check the REST endpoint applies.
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    socket.emit('log:join', ticketId);
    const onMessage = (message) => {
      if (message.logId !== ticketId) return;
      // Replace the optimistic copy if this is our own message coming back.
      setMessages((prev) =>
        prev.some((m) => m.id === message.id)
          ? prev
          : [...prev.filter((m) => !m.optimistic || m.message !== message.message), message],
      );
    };
    socket.on('chat:message', onMessage);
    return () => {
      socket.off('chat:message', onMessage);
      socket.emit('log:leave', ticketId);
    };
  }, [socket, ticketId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    // Show it immediately; reconcile when the server answers.
    const optimistic = {
      id: `pending-${Date.now()}`,
      message: text,
      optimistic: true,
      createdAt: new Date().toISOString(),
      sender: { id: user.id, name: user.name },
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');
    setSending(true);

    try {
      const { data: saved } = await logsApi.chat.send(ticketId, text);
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? saved : m)));
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);   // give the text back rather than losing it
      toast.error(error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'grid', placeItems: 'center', py: 5 }}><CircularProgress size={24} /></Box>;
  }

  return (
    <Box>
      <Box sx={{ maxHeight: 420, overflowY: 'auto', mb: 2, pr: 0.5 }}>
        {messages.length === 0 ? (
          <EmptyState
            icon={ForumIcon}
            title="No messages yet"
            description="Use this to ask questions or post progress updates on the ticket."
            dense
          />
        ) : (
          <Stack spacing={2}>
            {messages.map((message) => {
              const mine = message.sender?.id === user?.id;
              return (
                <Stack
                  key={message.id}
                  direction="row"
                  spacing={1.5}
                  sx={{ flexDirection: mine ? 'row-reverse' : 'row', opacity: message.optimistic ? 0.6 : 1 }}
                >
                  <Avatar sx={{ width: 30, height: 30, fontSize: '0.6875rem', bgcolor: mine ? SECONDARY.main : NEUTRAL[300] }}>
                    {(message.sender?.name ?? '?').split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </Avatar>
                  <Box sx={{ maxWidth: '72%' }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mb: 0.25, justifyContent: mine ? 'flex-end' : 'flex-start' }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {mine ? 'You' : message.sender?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        px: 1.75, py: 1.25, borderRadius: 2,
                        backgroundColor: mine ? SECONDARY.main : NEUTRAL[50],
                        color: mine ? '#fff' : 'text.primary',
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{message.message}</Typography>
                    </Box>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        )}
        <div ref={endRef} />
      </Box>

      <Box component="form" onSubmit={send}>
        <Stack direction="row" spacing={1}>
          <TextField
            placeholder="Write a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            multiline
            maxRows={4}
          />
          <IconButton type="submit" color="primary" disabled={!draft.trim() || sending} sx={{ alignSelf: 'flex-end' }}>
            <SendIcon />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}
