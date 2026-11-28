# 0019. Sign-in, the session read and password changes go through Core's routes, with limits per account and per address

**Status:** Recorded on 2026-11-28 with N4, pull request 1, of the Core CRM,
CMS and database foundation program (AL-2671; `adopt-tenant-owned-domains`
tasks 6.1 and 6.2). It describes the code as it is and ratifies no product
intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md).

## Context

Before this record, the browser sent a password to Supabase Auth itself in
three places: the login form, the current-password check of the donor and
missionary settings, and the recovery screen's save. The client session read
its user from Supabase Auth in the browser. Supabase Auth's own limits counted
by the caller's address and could not tell one person from another, and its
messages reached the screen: an unconfirmed address read differently from a
wrong password. Mission Control had no place for a staff person to change their
own password.

## Decisions

1. **Core's routes call the provider; the browser does not.** Each app mounts
   three handlers from `packages/api/src/auth`: `POST /api/auth/sign-in`,
   `GET /api/auth/session` and `POST /api/auth/password`. The login form
   (`LoginScreen`), the change-password form, the recovery screen's save and
   `loadClientAuthState` call them through `ownApiFetch`. The server client sets
   the session cookie as it did before. The browser's data client and its
   token refresh stay (N6 moves the data path). Registration and the recovery
   request still call the provider from the browser until N4's second pull
   request.

2. **One answer for every refused sign-in.** A wrong password, an unknown
   address, an unconfirmed address and a limited attempt answer `401` with the
   same body (`SIGN_IN_REFUSED`). No provider text reaches a person. A provider
   that cannot be reached answers `503` (`SIGN_IN_UNAVAILABLE`). A password is
   never written to a log, an error body, a URL or a row.

3. **Limits per account and per address, in Postgres.** `private.sign_in_windows`
   counts refused passwords in fixed fifteen-minute windows, as SHA-256 digests
   only, through `public.take_sign_in_attempt` and
   `public.record_sign_in_failure` (`SECURITY DEFINER`, owned by `postgres`,
   `service_role` only; the adapter is `packages/api/src/identity/sign-in-limits.ts`).
   An account is refused for the rest of the window at 10 refused passwords from
   any addresses; an address is refused at 30 across any accounts. A password the
   provider accepts counts nothing, so busy shared addresses are not limited by
   successful sign-ins. A limit ends with its window. Recovery never consults
   either limit, so a limited person can always recover.

4. **What "same account" and "same address" mean.** The account key is the
   address trimmed and case-folded (`signInAccountKey`). The installed provider
   stores an address in lower case, accepts any capitalisation of an ASCII
   address, and refuses to create an address with a non-ASCII letter; a test
   against the local stack pins each. The client address is the first
   `x-forwarded-for` entry, which the host platform sets and overwrites, as
   WP8a's intake reads it. A request without one is refused as unavailable.

5. **A new password needs the current one, or a recovery session.** The
   password route checks the current password with a separate, cookie-free
   client, counts a refusal against the limits, ends that check's own session
   at once, and only then changes the password on the person's session, so the
   person's live sessions do not grow. Without a current password it saves only
   on a session whose `amr` shows recovery inside the recovery window, read by
   `getClaims()` on the server (`passwordRecoverySecondsLeft`). The provider's
   own refusals answer in Core's words. `secure_password_change` stays off: a
   script holding today's readable session token can still change the password
   at the provider directly, which N6 closes.

6. **Mission Control has an account page for every staff role.**
   `/account` (outside the administration pages) holds the change-password
   form, and the profile menu links to it for every role.

7. **`next` lands on a page, on the same name.** `safeNextParam` drops any
   fragment, keeps a doorway path (`/invite/<selector>`) without its query, and
   refuses the recovery, dashboard sign-in and register paths and any API path.
   With the switch on, the donor app also refuses a path that still holds a
   percent sign, a tab or a line break after one decoding. The callback lands at
   a safe `next` when the class it picks is the app's own; otherwise the class
   home wins.

8. **The operations address answers the sign-in and session routes.**
   `admitOperationsSignIn` passes `POST /api/auth/sign-in` through the mutation
   admission and `GET`/`HEAD /api/auth/session`, each with its `x-asym-*`
   headers stripped. The password route stays refused there.

## Consequences

- Until N4's second pull request, the provider's own limits see the server's
  addresses for sign-in. Turning on the forwarded-address Auth setting is an
  owner's step.
- The browser's data client still holds a readable session token (N6).
- Tests: the handlers' unit tests, the limiter's real-stack suite, a suite
  against the installed provider on the local stack, and the auth-mail journeys
  (`auth-sign-in-through-core.spec.ts`, `auth-password-recovery.spec.ts`).
