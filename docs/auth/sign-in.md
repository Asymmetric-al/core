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
- The browser never receives demo emails or their passphrases from the server response.

### 2) Full login mode

Any value other than `"true"` for `DEMO_ONLY_LOGIN` renders full email and passphrase login.

Optional demo CTA appears as a secondary action when demo availability is enabled.

---

## Environment variables

### Supabase public auth

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- one of:
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferred)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy-compatible)

Notes:

- Shared auth/database clients prefer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` when both keys are present.
- Local contributor setup is slightly stricter today: `bun run setup` and `bun run setup:verify` still validate `NEXT_PUBLIC_SUPABASE_ANON_KEY`, so keep the anon key populated for onboarding and connectivity checks.

### Demo feature flags

- `DEMO_ONLY_LOGIN=true|false`
- `ALLOW_DEMO_ACCOUNTS=true|false` (production safety guard)

### Demo credentials (server-side only)

- Shared demo passphrase (see the env var name in `.env.example` under “Demo accounts and cron”)
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

## Canonical test accounts (deterministic seed)

After **`supabase db reset --local`** (or any workflow that applies `supabase/seed.sql`), Auth contains **one** email user tied to the full demo dataset.

| Field | Value |
| --- | --- |
| Email | `demo-owner@givehope.test` |
| Passphrase | Run **`bun run seed:demo:login`** — it prints the string passed to `extensions.crypt(...)` in `supabase/seed.sql`. |
| User id | `11111111-1111-1111-1111-111111111111` (same as `profiles.id`; see `@asym/auth/constants` `DEMO_USER_ID` / `DEMO_PROFILE_ID`) |
| `profiles.role` | `admin` (with `authz.memberships` including staff, donor, and missionary for the default tenant) |

Use that email and printed passphrase for **Supabase Auth email sign-in** on any app login screen when your Next.js apps point at the **same** Supabase project as `NEXT_PUBLIC_SUPABASE_URL` (with anon or publishable key).

**Hosted / cloud Supabase** does not include this user until you run the same seed (for example `bash ./scripts/seed-demo.sh hosted` against the project that script targets, or your team’s equivalent) **or** you create users yourself. To create env-driven demo users without hand-editing SQL, use **`bun run seed:demo:users`** (see below): you choose the emails and a shared passphrase in env (see `.env.example`); the Admin API creates or updates those users ([`auth.admin.createUser` / `updateUserById`](https://supabase.com/docs/reference/javascript/auth-admin-createuser)).

### E2E / CI “Demo Access” (cookie bypass)

When **`E2E_AUTH_BYPASS=true`** (or Playwright’s defaults), **`POST /api/auth/demo-account`** can set an httpOnly **E2E cookie** instead of calling Supabase’s email sign-in API. The login UI’s **Demo Access** button then works **without** the demo email env vars or the shared passphrase env var from `.env.example`, but this is **non-production only** (`isE2EAuthBypassEnabled()` in `@asym/auth`).

### Optional `.env.local` alignment with the seed user

If you want the **Demo Access** button to use Supabase Auth email sign-in (same user as seed) instead of relying only on E2E bypass, set at least:

```bash
DEMO_ADMIN_EMAIL=demo-owner@givehope.test
# paste the passphrase printed by: bun run seed:demo:login
# set the shared passphrase variable from .env.example (demo section)
```

Missionary and donor demo buttons need the same pattern with emails that exist in **your** Auth database (either additional seed users or `seed:demo:users`).

---

## Demo user seeding

Create or update demo auth users + profile roles:

```bash
bun run seed:demo:users
```

Required env vars for the script:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Shared demo passphrase env (see `.env.example`)
- the `DEMO_*_EMAIL` variables you want to seed

The script is idempotent and prints a summary table (`created`, `updated`, `skipped`).

---

## Middleware + layout responsibilities

### Shared proxy middleware

`@asym/auth/middleware` is used by each app `proxy.ts` and is responsible for:

- Supabase SSR cookie bridging (`getAll`/`setAll`)
- token refresh/validation via `supabase.auth.getUser()`
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
