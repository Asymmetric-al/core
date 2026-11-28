# 0019. Sign-in, the session read and password changes go through Core's routes, with limits per account and per address

**Status:** Recorded on 2026-11-28 with N4, pull request 1, of the Core CRM,
CMS and database foundation program (AL-2671; `adopt-tenant-owned-domains`
tasks 6.1 and 6.2), and brought to the rule as built by its fix round. It
describes the code as it is and ratifies no product intent. Accepted platform
intent is in [`docs/adr/`](../../../../docs/adr/README.md).

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
   address, an unconfirmed address, an address with a letter outside ASCII and a
   limited attempt answer `401` with the same body (`SIGN_IN_REFUSED`). No
   provider text reaches a person. A provider that cannot be reached answers
   `503` (`SIGN_IN_UNAVAILABLE`). A password is never written to a log, an error
   body, a URL or a row. The staff app marks the browser for Web Studio's
   clipboard only on a success, so the three apps' refusals are identical.

3. **Limits per account and per address, in Postgres, reserved before the
   provider is asked.** `public.take_sign_in_attempt` adds the attempt to both
   counts of `private.sign_in_windows` in one statement, under the rows' own
   locks, and refuses past 10 for the account or 30 for the address in a fixed
   fifteen-minute window; a refused attempt takes no reservation, so a burst of
   parallel guesses never sends more than the limit to the provider. A refused
   password keeps its reservation, which is its count. A success gives the
   reservation back and clears the account's count
   (`release_sign_in_attempt(…, cleared => true)`); an answer that was the
   provider's own failure (a 429 or 5xx) gives it back without clearing; a
   password saved through recovery clears the account (`clear_sign_in_account`).
   A reservation that cannot be given back stays counted until its window ends
   and is logged as `sign_in_release_failed`. Recovery never consults the
   limits. The adapter is `packages/api/src/identity/sign-in-limits.ts`; the
   functions are `SECURITY DEFINER`, owned by `postgres`, for `service_role`
   only. What the table keeps and for how long is in
   [`docs/security/sign-in-limits.md`](../../../../docs/security/sign-in-limits.md).

   **A lever that stays until N6.** A stranger who knows an account's address
   can keep its password sign-in refused for as long as they keep at it: ten
   wrong passwords in each window, and the owner's correct password then gets
   the same `401`. That is what an account limit means (invariant 3); a success
   and a recovery clear the count, and recovery always gets the owner in. The
   remedy that removes it, exempting a browser that has signed in to that
   account before from the account count by a signed cookie, belongs to the
   package that owns the session cookies (N6).

4. **What "same account" and "same address" mean.** The account key is the
   address trimmed and case-folded (`signInAccountKey`, made by the auth
   handlers; the identity adapter only carries keys). Only an ASCII address
   reaches it: the installed provider folds a dotted capital `İ` onto an ASCII
   login, which JavaScript's case-folding does not, so a non-ASCII spelling would
   have had its own count; it is refused as an unknown address instead, and no
   login is lost, since the provider refuses to create a non-ASCII address. The
   provider also stores addresses in lower case and accepts any ASCII
   capitalisation; a test against the local stack pins each. The client address
   is the first `x-forwarded-for` entry, which is the visitor's own only where
   the host platform overwrites that header; an IPv6 client is counted by its
   /64. With the serve-under-paths switch on, the front's rewrite to the two
   dashboards does not carry the visitor's address, so every staff and
   missionary sign-in would share one address count: that is a condition of
   switching on (the switch-on checklist in `docs/ops/environments.md`), and
   carrying the visitor's address in the front's signed stamp is the first item
   of N4's second pull request.

5. **A new password needs the current one, or a recovery session, used once.**
   The password route checks the current password with a separate, cookie-free
   client under the same reservation, ends that check's own session at once
   (one retry; a failure is logged as `password_check_session_not_ended`), and
   only then changes the password on the person's session. A change signs the
   person out on their other devices: the provider ends every session but the
   one that made the change, and both forms say so. Without a current password
   the route saves only on a session whose `amr` shows recovery inside the
   recovery window, read from a token the provider verifies
   (`recoverySecondsLeft`, `packages/auth`, beside `readPasswordRecovery`).
   That save ends the exception: the route signs in with the new password on a
   cookie-free client, puts that fresh session in the cookies, and only then
   ends the recovery session, so a second save needs the current password. If
   the fresh session cannot be made, the person stays signed in on the recovery
   session and the failure is logged as `recovery_session_not_replaced`; no step
   signs the person out before their next session is in place. The provider's
   own refusals answer in Core's words, and an answer that is lost tells the
   person what to try. `secure_password_change` stays off: a script holding
   today's readable session token can still change the password at the
   provider directly, which N6 closes.

6. **Mission Control has an account page for every staff role.**
   `/account` (outside the administration pages) holds the change-password
   form, and the profile menu links to it for every role.

7. **`next` lands on a page, on the same name.** `safeNextParam` checks every
   path a request for it could finally be served at: the raw and once-decoded
   path, with a tenant or sub-role prefix and a dashboard base path taken off,
   in any letter case. It refuses the sign-in, register, recovery and callback
   pages and any API path in any of those forms, and drops any fragment. A
   doorway is exactly `/invite/<selector>`, returned in its canonical spelling
   without query or fragment; anything else under `/invite` is refused. With the
   switch on, the donor app also refuses a path that still holds a percent sign,
   a tab or a line break after one decoding. The callback lands at a safe `next`
   when the class it picks is the app's own; otherwise the class home wins.

8. **The operations address answers the sign-in and session routes.**
   `admitOperationsSignIn` passes `POST /api/auth/sign-in` through the mutation
   admission and `GET`/`HEAD /api/auth/session`, each with its `x-asym-*`
   headers stripped. The password route stays refused there.

## Consequences

- Until N4's second pull request, the provider's own limits see the server's
  addresses for sign-in. Turning on the forwarded-address Auth setting is an
  owner's step.
- The browser's data client still holds a readable session token (N6).
- Tests: the handlers' unit tests, the limiter's real-stack suite (bursts of 2
  and 20 sessions included), a suite against the installed provider on the local
  stack, and the auth-mail journeys (`auth-sign-in-through-core.spec.ts`,
  `auth-password-recovery.spec.ts`).
