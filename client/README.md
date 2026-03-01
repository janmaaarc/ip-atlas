# IP Atlas

IP geolocation app built with Vite, React 19, TypeScript, and Tailwind CSS v4.

## Tech Stack

- **Framework**: React 19
- **Build**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **HTTP**: Axios (with cookie credentials)
- **Map**: Leaflet + React Leaflet
- **Charts**: Recharts
- **Language**: TypeScript 5.9

## Project Structure

```
src/
  App.tsx               # Router setup, providers (Theme, Auth, Toast)
  main.tsx              # React DOM entry point
  index.css             # Tailwind imports, dark mode variant, animations
  types.ts              # Shared types (GeoData, HistoryEntry, User, FavoriteIp, AnalyticsData)
  lib/
    api.ts              # Axios instance with cookie auth + 401 refresh interceptor
    exportHistory.ts    # CSV/JSON export utilities for search history
  hooks/
    useAuth.tsx          # Auth context (login, register, logout, deleteAccount, /me check)
    useTheme.tsx         # Theme context (light/dark, persisted in localStorage)
    useClipboard.ts      # Copy-to-clipboard with toast feedback
    useKeyboardShortcuts.ts # Global keyboard shortcut handler
    useAutoSuggest.ts    # Auto-suggest dropdown for recent IP searches
    useFocusTrap.ts      # Focus trap for modals (Tab/Shift+Tab cycling)
    useDistanceUnit.tsx  # Distance unit context (km/mi, persisted in localStorage)
  components/
    auth/
      LoginForm.tsx      # Email/password form with strength meter + show/hide toggle
    analytics/
      AnalyticsDashboard.tsx # Search analytics with stat cards and charts
      StatCard.tsx       # Summary stat card
      CountryChart.tsx   # Top countries bar chart
      OrgChart.tsx       # Top organizations bar chart
      TrendChart.tsx     # Daily search trend line chart
    geo/
      GeoDisplay.tsx     # Geolocation data card with copy, share, and favorite star
      GeoMap.tsx         # Leaflet map with primary pin + history pins
    history/
      SearchHistory.tsx  # Filterable history list with date range, bulk select, delete, and export
      FavoritesList.tsx  # Saved favorite IPs list with inline label editing and bulk delete
    search/
      IpSearch.tsx       # IP address search input with auto-suggest dropdown
      BatchIpLookup.tsx  # Batch IP lookup form (up to 25 IPs)
      BatchResultsTable.tsx # Results table for batch lookups
      IpCompare.tsx      # Side-by-side IP comparison with diff highlighting
    settings/
      SettingsModal.tsx  # Settings modal (distance unit, change password, delete account)
      ChangePasswordForm.tsx # Password change form with strength validation
      DeleteAccountSection.tsx # Account deletion with password confirmation
    ui/
      ThemeToggle.tsx    # Sun/moon icon button
      Toast.tsx          # Toast notification provider + context
      PasswordInput.tsx  # Shared password input with show/hide toggle + strength bar
      ConfirmDialog.tsx  # Reusable confirmation dialog with focus trap
      ErrorBoundary.tsx  # React error boundary with fallback UI
  pages/
    LoginPage.tsx        # Login/register page with theme toggle
    HomePage.tsx         # Main dashboard with tab navigation (Search, Batch, Compare, Analytics)
    SharedResultPage.tsx # Public page for viewing shared geo results
    NotFoundPage.tsx     # 404 page
```

## Setup

```bash
npm install
```

Create `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | API base URL (e.g. `http://localhost:8000`) |

Then run:

```bash
npm run dev
```

Opens at http://localhost:5173. Make sure the API is running first.

## Features

### Authentication
- Login and registration with email/password
- Password strength meter (3-segment bar: Weak / Fair / Strong)
- Live requirements checklist (8+ chars, uppercase, number)
- Confirm password field with real-time mismatch warning
- Show/hide password toggle on all password fields
- httpOnly cookie auth (tokens never stored in localStorage)
- Automatic token refresh on 401 responses with request queuing

### Account Management
- **Change password** from the settings modal (validates current password, enforces strength rules)
- **Delete account** with password confirmation and cascade deletion of all data

### Geolocation
- Auto-detects your IP geolocation on load
- Search any IPv4 address with client-side validation
- Displays: IP, city, region, country, coordinates, timezone, ISP
- Interactive Leaflet map with pin at coordinates
- Clear search to return to your own IP (also via Escape key)
- **Copy to clipboard** on IP, coordinates, and "Copy All" for full geo info

### Search History
- Paginated history list of all searched IPs
- Click any entry to view its geolocation again
- **Filter** by IP address, city, or country with search icon and clear (X) button
- **Date range presets** — filter by last 7 days, 30 days, or all time (server-side filtering)
- Bulk select with checkbox + "Select All" (operates on filtered results)
- Bulk delete selected entries
- **Export** filtered results as CSV or JSON (date-stamped filenames)
- History count badge in header (shows "X of Y" when paginated)

### Favorites
- **Star toggle** on the geo display to bookmark/unbookmark the current IP
- **Favorites list** in the sidebar with quick-select and remove
- **Inline label editing** — click the pencil icon to add/edit labels, Enter to save, Escape to cancel
- **Bulk delete** — select multiple favorites with checkboxes and delete in one action
- Persisted in database (unique per user + IP)

### Analytics Dashboard
- **Search trend** — line chart of daily searches over the last 30 days
- **Top countries** — horizontal bar chart of most-searched countries
- **Top organizations** — horizontal bar chart of most-searched ISPs/orgs
- **Summary stats** — total searches, unique IPs, and unique countries
- Lazy-loaded (code-split into separate chunk)

### Shareable Results
- **Share button** on geo display creates a 24-hour expiring link
- Link is automatically copied to clipboard
- Public page at `/shared/:token` — no auth required to view
- Shows full geolocation data for the shared IP

### Batch IP Lookup
- Enter up to 25 IPs (one per line) for simultaneous lookup
- Results table with IP, city, country, and status
- Click any successful result to view on the map
- Partial failure handling — shows which IPs succeeded and which failed

### Compare Two IPs
- Side-by-side IP comparison in a single view
- Differences highlighted with blue text and background tint (accessible — not color-only)
- Fields compared: IP, city, region, country, coords, org, timezone
- Responsive layout — stacks vertically on mobile

### Map
- Interactive Leaflet map with OpenStreetMap tiles
- **Dark map tiles** — auto-switches to CartoDB Dark Matter in dark mode
- **Street / Satellite toggle** — switch between map views
- **Fullscreen toggle** — expand map to fill viewport with `100dvh` for iOS Safari (Escape to exit)
- **Marker clustering** — groups nearby history pins with count badges when zoomed out
- **Distance calculation** — shows nearest history pin distance; each pin popup shows distance from primary (supports km/mi preference)
- **Polyline** — dashed line connecting primary pin to all history pins
- Primary pin for the currently viewed IP
- **Show all history pins** toggle to display smaller pins for all past searches
- Auto-fits map bounds when showing multiple pins
- Fly-to animation on single pin

### Auto-Suggest
- Recent IP addresses suggested as you type in the search input
- Arrow key navigation through suggestions
- Matches by prefix (top 5 results)
- Escape to dismiss, Enter to select

### Keyboard Shortcuts
- **Cmd/Ctrl+K**: Focus the IP search input (works from anywhere, switches to Search tab)
- **Cmd/Ctrl+Enter**: Submit the search form (when on the Search tab)
- **Escape**: Clear current search and return to your own IP (when not focused in an input)

### UI/UX
- Light/dark theme toggle (respects system preference, persisted in localStorage)
- Distance unit preference (km/mi) — toggle in Settings, persisted in localStorage, updates map distances immediately
- Muted color palette: stone tones (light) / zinc tones (dark)
- Sticky header with backdrop blur
- Sticky sidebar on desktop (scrolls independently)
- Tab navigation: Search / Batch / Compare / Analytics
- Fully responsive (mobile-first with sm/md/lg breakpoints)
- Toast notifications for all actions, errors, and state changes
- Loading skeletons during data fetching
- Accessible: aria-labels, aria-labelledby on modals, aria-live announcements, role="alert" on errors, role="dialog" on modals, keyboard-navigable
- Focus trapping in modals (Tab/Shift+Tab stays inside, focus restored on close)
- React Error Boundary catches component crashes with a reload fallback
- Lazy-loaded map component (code-split into separate chunk)
- Custom favicon matching the app icon

## Auth Flow

```
1. App loads -> AuthProvider calls GET /api/me
2. If 401 -> user is null -> ProtectedRoute redirects to /login
3. User logs in -> POST /api/login -> sets httpOnly cookies -> redirects to /
4. On subsequent 401s -> interceptor tries POST /api/refresh
5. If refresh succeeds -> retries original request (queues concurrent requests)
6. If refresh fails -> clears localStorage -> React Router redirects to /login
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Vite) |
| `npm run build` | Type-check + production build |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview production build |

## Deploy

Deployed on Vercel with SPA rewrites:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Set `VITE_API_URL` in Vercel environment variables to point to your deployed API.
