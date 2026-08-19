/**
 * src/pages/tickets/FeedbackPanel.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces the old feedback form, which took the rater's id FROM THE REQUEST
 *   BODY and checked nothing — so anyone could post unlimited ratings as anyone.
 *   Technician performance scores are averaged from this table, which made them
 *   meaningless.
 *
 * WHAT IT ACHIEVES
 *   Only shows the form when the backend would actually accept it: you reported
 *   the ticket, it is resolved or closed, and you have not rated it already.
 *   The rater's identity comes from the token, so there is no field to forge.
 */
import { useState } from 'react';
import { Box, Rating, Button, TextField, Typography, Stack, Alert, Avatar, Divider } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useToast } from '../../components/Toast.jsx';
import { feedback as feedbackApi } from '../../api/services/index.js';
import EmptyState from '../../components/EmptyState.jsx';
import { NEUTRAL } from '../../theme/tokens.js';

export default function FeedbackPanel({ ticket, canGiveFeedback, onSubmitted }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);

  const existing = ticket.feedback ?? [];
  const alreadyRated = existing.length > 0;

  const submit = async () => {
    setSaving(true);
    try {
      await feedbackApi.submit(ticket.id, rating, comments.trim() || undefined);
      toast.success('Thank you for your feedback');
      onSubmitted?.();
    } catch (error) {
      toast.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {existing.length > 0 && (
        <Stack spacing={2} sx={{ mb: canGiveFeedback && !alreadyRated ? 3 : 0 }}>
          {existing.map((item) => (
            <Stack key={item.id} direction="row" spacing={1.5}>
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: NEUTRAL[300] }}>
                {`${item.user?.initials ?? ''}${item.user?.surname?.[0] ?? ''}`.slice(0, 2)}
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Rating value={item.rating} readOnly size="small" />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Typography>
                </Stack>
                {item.comments && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{item.comments}</Typography>
                )}
              </Box>
            </Stack>
          ))}
        </Stack>
      )}

      {canGiveFeedback && !alreadyRated && (
        <>
          {existing.length > 0 && <Divider sx={{ mb: 3 }} />}
          <Typography variant="h6" sx={{ mb: 1 }}>How did we do?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your rating helps us track how the support team is performing.
          </Typography>

          <Rating
            value={rating}
            onChange={(_, v) => setRating(v ?? 0)}
            size="large"
            emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
            sx={{ mb: 2 }}
          />

          <TextField
            multiline
            minRows={3}
            placeholder="Anything you'd like to add? (optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button variant="contained" disabled={rating === 0 || saving} onClick={submit}>
            {saving ? 'Submitting…' : 'Submit feedback'}
          </Button>
        </>
      )}

      {existing.length === 0 && !canGiveFeedback && (
        <EmptyState
          icon={StarIcon}
          title="No feedback yet"
          description="The person who reported this ticket can rate it once the work is resolved."
          dense
        />
      )}

      {alreadyRated && canGiveFeedback && (
        <Alert severity="info" sx={{ mt: 2 }}>You have already rated this ticket.</Alert>
      )}
    </Box>
  );
}
