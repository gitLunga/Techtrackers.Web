/**
 * src/theme/index.js
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   MUI components look generic until you tell them what your product looks
 *   like. Without a theme, every developer restyles Button and Card at each call
 *   site — which is precisely how the old app ended up with 112 inline style
 *   blocks and 91 stylesheets.
 *
 * WHAT IT ACHIEVES
 *   Styles each MUI component ONCE, here, in `components.styleOverrides`. After
 *   this, a screen writes `<Button variant="contained">Assign</Button>` and it
 *   is automatically correct — right colour, radius, height, hover state.
 *
 *   That is what makes the UI consistent "throughout": consistency is enforced
 *   by the theme rather than by every developer remembering the rules.
 */
import { createTheme } from '@mui/material/styles';
import { PRIMARY, SECONDARY, STATUS, NEUTRAL, RADIUS, SHADOW, SPACING_UNIT } from './tokens.js';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: PRIMARY,
    secondary: SECONDARY,
    success: { main: STATUS.success.main, light: STATUS.success.light, dark: STATUS.success.dark },
    warning: { main: STATUS.warning.main, light: STATUS.warning.light, dark: STATUS.warning.dark },
    error:   { main: STATUS.error.main,   light: STATUS.error.light,   dark: STATUS.error.dark },
    info:    { main: STATUS.info.main,    light: STATUS.info.light,    dark: STATUS.info.dark },
    grey: NEUTRAL,
    background: { default: NEUTRAL[50], paper: NEUTRAL[0] },
    text: { primary: NEUTRAL[800], secondary: NEUTRAL[500], disabled: NEUTRAL[400] },
    divider: NEUTRAL[100],
  },

  shape: { borderRadius: RADIUS.md },
  spacing: SPACING_UNIT,

  typography: {
    // One system stack — no web font to download, and it looks native on every OS.
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '2rem',    fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.5rem',  fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1.125rem', fontWeight: 600 },
    h5: { fontSize: '1rem',    fontWeight: 600 },
    h6: { fontSize: '0.9375rem', fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    caption: { fontSize: '0.8125rem', color: NEUTRAL[500] },
    // ALL-CAPS button text is shouty and hurts readability at small sizes.
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
    overline: { fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        body: { backgroundColor: NEUTRAL[50], color: NEUTRAL[800] },
        // Slim, unobtrusive scrollbars that match the palette.
        '::-webkit-scrollbar': { width: 10, height: 10 },
        '::-webkit-scrollbar-thumb': { background: NEUTRAL[200], borderRadius: 8, border: `2px solid ${NEUTRAL[50]}` },
        '::-webkit-scrollbar-thumb:hover': { background: NEUTRAL[300] },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: RADIUS.sm, paddingInline: 16, minHeight: 40 },
        sizeSmall: { minHeight: 32, paddingInline: 12 },
        sizeLarge: { minHeight: 48, paddingInline: 24, fontSize: '0.9375rem' },
        containedPrimary: { '&:hover': { backgroundColor: PRIMARY.dark } },
        outlined: { borderColor: NEUTRAL[200], '&:hover': { borderColor: SECONDARY.main, backgroundColor: STATUS.info.light } },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: `1px solid ${NEUTRAL[100]}`, borderRadius: RADIUS.lg, boxShadow: SHADOW.xs },
      },
    },
    MuiCardContent: { styleOverrides: { root: { padding: 20, '&:last-child': { paddingBottom: 20 } } } },

    MuiPaper: { styleOverrides: { rounded: { borderRadius: RADIUS.lg } } },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: RADIUS.sm, fontWeight: 600, fontSize: '0.75rem', height: 24 },
        sizeSmall: { height: 22, fontSize: '0.6875rem' },
      },
    },

    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.sm,
          backgroundColor: NEUTRAL[0],
          '& fieldset': { borderColor: NEUTRAL[200] },
          '&:hover fieldset': { borderColor: NEUTRAL[300] },
          '&.Mui-focused fieldset': { borderWidth: 1.5, borderColor: SECONDARY.main },
        },
        input: { padding: '10px 14px' },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { fontSize: '0.875rem' } } },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: NEUTRAL[50],
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: NEUTRAL[500],
            borderBottom: `1px solid ${NEUTRAL[100]}`,
          },
        },
      },
    },
    MuiTableCell: { styleOverrides: { root: { borderBottom: `1px solid ${NEUTRAL[100]}`, padding: '12px 16px' } } },
    MuiTableRow: { styleOverrides: { root: { '&:last-child td': { borderBottom: 'none' } } } },

    MuiDialog: { styleOverrides: { paper: { borderRadius: RADIUS.lg, boxShadow: SHADOW.lg } } },
    MuiDialogTitle: { styleOverrides: { root: { fontSize: '1.125rem', fontWeight: 600, padding: '20px 24px 8px' } } },

    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: NEUTRAL[800], fontSize: '0.75rem', borderRadius: RADIUS.sm, padding: '6px 10px' },
      },
    },

    MuiAlert: { styleOverrides: { root: { borderRadius: RADIUS.sm, fontSize: '0.875rem' } } },

    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minHeight: 44 } } },

    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: RADIUS.sm, '&.Mui-selected': { backgroundColor: 'rgba(255,255,255,0.14)' } } },
    },

    MuiLink: { defaultProps: { underline: 'hover' }, styleOverrides: { root: { color: SECONDARY.main, fontWeight: 500 } } },
  },
});

export default theme;
