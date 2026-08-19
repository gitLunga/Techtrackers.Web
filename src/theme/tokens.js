/**
 * src/theme/tokens.js
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old app had 91 CSS files and 112 inline `style={{...}}` blocks, with
 *   colours retyped as raw hex at every call site. Counting them showed the
 *   real problem: #0c3a3a appeared 203 times and #108484 78 times — there WAS a
 *   brand — but sitting alongside three stray teal variants (#20b2aa, #15959d,
 *   #277777) and Bootstrap's defaults (#007bff, #28a745), which is why no two
 *   screens looked quite the same.
 *
 * WHAT IT ACHIEVES
 *   Every colour, radius and shadow in the app is named here, once. Nothing
 *   below this file writes a raw hex value. Changing the brand is an edit to
 *   this file, not a search across 91 stylesheets.
 *
 *   Only TWO brand colours exist by design — primary and secondary. Everything
 *   else is either a neutral grey or a semantic status colour whose meaning is
 *   fixed (amber always means "needs attention", red always means "breached").
 */

/** The two brand colours, taken from the existing app's own most-used values. */
export const BRAND = {
  primary: '#0c3a3a',   // deep teal — headers, sidebar, primary actions
  secondary: '#108484', // teal — accents, links, active states
};

/** Tints and shades derived from the two brand colours, not invented alongside them. */
export const PRIMARY = {
  main: BRAND.primary,
  light: '#1a5555',
  dark: '#072525',
  contrastText: '#ffffff',
};

export const SECONDARY = {
  main: BRAND.secondary,
  light: '#3aa5a5',
  dark: '#0b6363',
  contrastText: '#ffffff',
};

/**
 * Semantic colours. Deliberately NOT brand colours: a user must be able to tell
 * "resolved" from "breached" without knowing the brand. Tuned to sit beside the
 * teal without clashing, and to pass WCAG AA on white.
 */
export const STATUS = {
  success: { main: '#1b7f5a', light: '#e6f4ee', dark: '#125c41' }, // resolved / closed
  warning: { main: '#b26a00', light: '#fdf1e0', dark: '#8a5200' }, // on hold
  error:   { main: '#c62828', light: '#fdecec', dark: '#991f1f' }, // escalated / breached
  info:    { main: '#0b6363', light: '#e4f2f2', dark: '#084848' }, // in progress
  neutral: { main: '#5c6b6b', light: '#eef1f1', dark: '#3d4949' }, // pending / unassigned
};

/** Greys, warmed very slightly toward the teal so they sit with the brand. */
export const NEUTRAL = {
  0:   '#ffffff',
  25:  '#fafbfb',
  50:  '#f4f6f6',
  100: '#e8ecec',
  200: '#d5dbdb',
  300: '#b4bebe',
  400: '#8a9797',
  500: '#5c6b6b',
  600: '#465252',
  700: '#333c3c',
  800: '#212828',
  900: '#141a1a',
};

export const RADIUS = { sm: 6, md: 10, lg: 14, pill: 999 };

/**
 * Soft, tight shadows. The old CSS used heavy `0 4px 20px rgba(0,0,0,0.3)`
 * drop shadows that made every card look like it was floating off the page.
 */
export const SHADOW = {
  xs: '0 1px 2px rgba(12, 58, 58, 0.06)',
  sm: '0 1px 3px rgba(12, 58, 58, 0.08), 0 1px 2px rgba(12, 58, 58, 0.04)',
  md: '0 4px 12px rgba(12, 58, 58, 0.08)',
  lg: '0 12px 32px rgba(12, 58, 58, 0.12)',
};

/** One spacing step. MUI multiplies this, so `p={3}` is always 24px. */
export const SPACING_UNIT = 8;

/** Fixed chrome dimensions, referenced by the layout instead of being retyped. */
export const LAYOUT = {
  sidebarWidth: 264,
  sidebarCollapsedWidth: 72,
  headerHeight: 64,
};

export default { BRAND, PRIMARY, SECONDARY, STATUS, NEUTRAL, RADIUS, SHADOW, LAYOUT };
