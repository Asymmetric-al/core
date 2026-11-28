# Sign-in limits: what is kept, and for how long

`private.sign_in_windows` (`supabase/migrations/20261127100000_n4_sign_in_limits.sql`,
AL-2671 N4) holds the counts behind Core's sign-in limits: 10 refused passwords
per account and 30 per client address, in fixed fifteen-minute windows. Row
security is enabled and forced, and no API role holds a privilege; only the four
`SECURITY DEFINER` functions listed in
[`function-execute-grants.md`](function-execute-grants.md) touch it, for
`service_role`.

## What a row holds

A row holds a kind (`account` or `address`), an unsalted SHA-256 digest of its
key, the start of its window, and a count. It holds no address, no client
address, no organization and no login.

- **The account key** is the typed sign-in address, trimmed and case-folded.
  Only ASCII addresses reach the limits: any other is refused as an unknown
  address first.
- **The address key** is the first `x-forwarded-for` entry, which is the
  visitor's own only where the host platform overwrites that header (Vercel
  does). An IPv6 client is counted by its /64; an IPv4-mapped IPv6 address is
  counted as the IPv4 address.

**What a digest is worth.** An unsalted digest hides a key only from a casual
reader. There are about four billion IPv4 addresses, so a digest of one can be
reversed by trying them all in minutes; a digest of a sign-in address can be
confirmed by anyone who guesses the address. Treat the table as holding the
addresses themselves, for as long as a row lives.

## How long a row lives

A row lives for its window and is gone within one tick after: the half-hourly
dispatch recovery scan (`packages/api/src/workflows/functions/dispatch-recovery-scan.ts`)
calls `public.trim_sign_in_windows()` in its existing step, whether or not anyone
signs in again, so no row outlives its window by more than about thirty minutes.
Each attempt also trims up to 200 ended rows as it passes. A trim that fails is
logged as `sign_in_windows_trim_failed`; it does not fail the scan.
