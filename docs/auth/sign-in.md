# Sign-in foundation

This repo uses a shared sign-in foundation across `admin`, `missionary`, and `donor` apps.

For implementation status, current wiring, and backlog handoff notes, see:

- `docs/auth/hardening-handoff.md`

## Modes

### 1) Demo-only mode

Set:

```bash
DEMO_ONLY_LOGIN=true
```

Behavior:

- `/login` renders a **single** `Demo Access` CTA.
- Client sends only `{ role }` to `/api/auth/demo-account`.
- Server signs in with env-backed demo credentials and sets Supabase cookies.
- Browser never receives demo emails/passwords.

### 2) Full login mode

Any value other than `"true"` for `DEMO_ONLY_LOGIN` renders full email/password login.

Optional demo CTA appears as a secondary action when demo availability is enabled.

---

## Environment variables

### Supabase public auth

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- one of:
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferred)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy-compatible)

### Demo feature flags

- `DEMO_ONLY_LOGIN=true|false`
- `ALLOW_DEMO_ACCOUNTS=true|false` (production safety guard)

### Demo credentials (server-side only)

- `DEMO_PASSWORD`
- `DEMO_ADMIN_EMAIL`
- `DEMO_MISSIONARY_EMAIL`
- `DEMO_DONOR_EMAIL`
- optional:
  - `DEMO_DELIVERY_EMAIL`
  - `DEMO_TICKETING_EMAIL`
  - `DEMO_MACHINERY_EMAIL`

### Service-role only

- `SUPABASE_SERVICE_ROLE_KEY` (seed scripts / server jobs only, never client)

---

## Demo user seeding

Create or update demo auth users + profile roles:

```bash
bun run seed:demo:users
```

Required env vars for the script:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEMO_PASSWORD`
- the `DEMO_*_EMAIL` variables you want to seed

The script is idempotent and prints a summary table (`created`, `updated`, `skipped`).

---

## Middleware + layout responsibilities

### Shared proxy middleware

`@asym/auth/middleware` is used by each app `proxy.ts` and is responsible for:

- Supabase SSR cookie bridging (`getAll`/`setAll`)
- token refresh/validation via `supabase.auth.getClaims()`
- redirecting unauthenticated users from protected routes to `/login?next=...`

### Server layout role checks

Protected server layouts perform role checks with:

- `supabase.auth.getUser()` (strong user check)
- `profiles.role` lookup

On mismatch, users are redirected to `/no-access`.

---

## Notes

- `next` redirect values are sanitized with `safeNextParam` to block open redirects.
- Auth callback route (`/auth/callback`) is implemented for PKCE-ready code exchange.
- Public self-registration is least-privilege: role assignment is enforced server-side to `donor`.
- Privileged roles (`admin`, `staff`, etc.) must be assigned through trusted admin/invite workflows.
- Sign-out is completed server-side through `/api/auth/signout` before client navigation to `/login`.
