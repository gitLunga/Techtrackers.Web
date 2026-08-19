/**
 * src/components/StatCard.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Every dashboard in the old app (staff, technician, admin, HOD) built its own
 *   metric tiles with its own CSS module, so the same "Open Issues" tile looked
 *   different depending on who was logged in.
 *
 * WHAT IT ACHIEVES
 *   One tile, four dashboards. Optionally clickable, so a tile can navigate to
 *   the filtered list it counts — which turns a static number into a way in.
 */
import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';
import { NEUTRAL } from '../theme/tokens.js';

export default function StatCard({ label, value, icon: Icon, tone, loading = false, onClick, helperText }) {
  const accent = tone?.main ?? NEUTRAL[500];
  const wash = tone?.light ?? NEUTRAL[50];

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        transition: 'border-color .15s, transform .15s',
        ...(onClick && {
          cursor: 'pointer',
          '&:hover': { borderColor: accent, transform: 'translateY(-1px)' },
        }),
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            {/* NOT noWrap: on a 2-up mobile grid "Total logged" clipped to
                "TOTAL LOGG". Wrapping to a second line is better than lying. */}
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.4, mb: 0.25 }}
            >
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={64} height={40} />
            ) : (
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
                {value ?? 0}
              </Typography>
            )}
            {helperText && !loading && (
              <Typography variant="caption" color="text.secondary">
                {helperText}
              </Typography>
            )}
          </Box>

          {Icon && (
            <Box
              sx={{
                width: 40, height: 40, flexShrink: 0,
                borderRadius: 2, display: 'grid', placeItems: 'center',
                backgroundColor: wash, color: accent,
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
