# Six-feature batch: landing page, sidebar, location, invite, QR

Status: approved
Date: 2026-08-24

## Context

The app already migrated from CRA to Vite with a rebuilt MUI-based shell
(`src/layout`, `src/auth`, `src/pages`). A CRA-era, unused copy of the app
still lives in `src/screens/**` — none of it is imported by the active app
(confirmed via grep), except that it holds the only implementation of the
marketing/landing page content, which needs to be ported forward rather
than rebuilt.

Six requested changes, sequenced into three phases of two. Each phase is
implemented, verified, committed, and pushed before the next starts.

## Phase 1 — Landing page + Sidebar/responsive

### 1a. Landing page

- Root route `"/"` (`RootRedirect` in `App.jsx`) currently sends
  unauthenticated visitors straight to `/login`. Change: unauthenticated
  visitors see a new landing page instead; authenticated visitors keep
  being redirected to their role home (`homePath`) as today.
- New `src/pages/public/Landing.jsx` composes ported sections — Header,
  Home (`#home`), About (`#about`), Services (`#services`), Contact
  (`#contact`) — sourced from `src/screens/Logins/{Header,HomePage,About,
  Service,Contact}.jsx` and `src/screens/Logins/LoginsStyle/*.css`. Content
  and plain-CSS styling are kept as-is (not restyled to MUI).
- Technical fixes required to run under Vite:
  - `require("../../Images/tut.png")` in `Header.jsx` → ES `import`.
  - Add `react-scroll` to `package.json` dependencies (keeps the existing
    smooth-scroll-spy nav behavior; it is plain React and works fine
    outside CRA).
  - Nav's "Login" link and the hero's "Get Started" button currently
    scroll-spy to an embedded legacy `SignIn` component that does not
    call the current `AuthContext`/API. Both become `react-router-dom`
    links to the real `/login` route. The embedded legacy `SignIn` is
    dropped from the composition (the working one lives at
    `src/pages/auth/SignIn.jsx` and is unaffected).
  - Hamburger + mobile nav toggle in the ported `Header.jsx` is
    unchanged (already has its own working mobile menu, separate from
    the authenticated app's sidebar).

### 1b. Sidebar collapse + responsive polish

- Add a desktop-only collapse toggle to `AppSidebar.jsx` that shrinks the
  permanent `Drawer` from `LAYOUT.sidebarWidth` to an icon-only rail
  (labels hidden, `Tooltip` on hover for each nav item). State persisted
  in `localStorage` (e.g. `sidebar:collapsed`), read on mount so it
  survives reloads. Mobile behavior (temporary overlay Drawer + hamburger
  button in `AppHeader.jsx`) is untouched — it already works correctly.
- Verify the nav list's existing `overflowY: auto` still behaves with
  icon-only items; apply the same fixed-header/scrollable-middle/fixed-
  footer pattern anywhere else content can overflow (long dialogs,
  `DataTable`).
- Responsive audit pass across staff/technician/admin dashboards, ticket
  list/detail, reports, and forms at `xs`/`sm`/`md` breakpoints; fix
  concrete breakage (overflowing tables, cramped `Grid` items, dialogs
  wider than viewport) using the MUI breakpoint patterns already used
  elsewhere in the app. This is a fix-what's-broken pass, not a rebuild.

**Verification for phase 1:** `npm run dev`, manually click through the
landing page nav (scroll-spy + Login/Get Started routing to `/login`),
resize to mobile width and confirm the landing page's own hamburger works,
then log in and confirm the authenticated sidebar collapse toggle and
mobile drawer both work, and spot-check 2-3 pages at mobile width.

## Phase 2 — Mandatory live location + invite-technician verification

### 2a. Live location on Log Issue

- `LogIssue.jsx`'s `location` field changes from optional free text to a
  required, auto-captured field. On mount, call
  `navigator.geolocation.getCurrentPosition` and store
  `{ latitude, longitude, accuracy }`; show a read-only chip like
  "Captured near lat, lng" (no reverse-geocoding available — no Maps API
  key in this project — so it stays coordinates, not a street address).
- If permission is denied, geolocation is unsupported, or the call times
  out: show a blocking `Alert` ("Location access is required to log an
  issue") with a Retry button that re-triggers the permission prompt.
  Submit stays disabled until coordinates are captured.
- The existing free-text field is kept as a supplementary, still-optional
  note (e.g. "which desk") alongside the now-required coordinates, since
  coordinates alone don't convey "HR office, 2nd floor". Payload adds
  `latitude`/`longitude` to the `logsApi.create` call.

### 2b. Invite-technician verification

- The "Invite a colleague" button already exists in `TicketDetail.jsx`
  gated by `canCollaborate = isTechnician && isAssignedTech`, using
  `ticket.technician?.id === user?.id`. Check for a type mismatch (string
  vs. numeric IDs) that would make this comparison silently always fail.
  If found, fix the comparison. If the flow already works end-to-end for
  a technician assigned to a ticket, no code change is needed here beyond
  confirming it.

**Verification for phase 2:** submit an issue with location permission
granted (confirm required + coordinates sent), and again with permission
denied (confirm blocked + retry works); as a technician assigned to a
ticket, confirm the "Invite a colleague" button appears and opens
`CollaborationDialog`.

## Phase 3 — QR scan-to-log

- New reusable `QrScanner` component using `html5-qrcode` (camera-based,
  works in any modern browser, no native app required).
- Entry point: a "Scan QR to log issue" button on `LogIssue.jsx` and the
  staff dashboard, opening the scanner in a dialog.
- QR payload format is not yet decided. The scanner attempts
  `JSON.parse` on the decoded string and maps recognized keys (`location`,
  `categoryId`, `title`, etc.) onto `LogIssue`'s form fields via one
  mapping function; unparseable/unrecognized payloads fall back to
  dropping the raw scanned text into the location note field. Deciding
  the final payload format later only means extending that one mapping
  function.

**Verification for phase 3:** scan a JSON-encoded test QR code and confirm
fields populate; scan a plain-text QR code and confirm it falls back to
the location note field.

## Out of scope

- Reverse geocoding / address lookup (no Maps API key available).
- New backend endpoints for account-provisioning technician invites (the
  "invite" ask was confirmed to mean ticket-level collaboration invites,
  which already exist).
- Restyling the landing page's ported sections to MUI.
