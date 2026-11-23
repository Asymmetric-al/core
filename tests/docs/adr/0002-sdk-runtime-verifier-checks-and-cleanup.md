# 0002. Strip ambient Docker settings, enforce FK cleanup order and prove non-member refusal in the SDK verifier

**Status:** Recorded on 2026-11-23 from code comments in `tests/` removed under
AL-2676 ([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It
describes the code as it is and ratifies no product intent. Accepted platform
intent is in [`docs/adr/`](../../../docs/adr/README.md).

## Context

The local Supabase SDK runtime verifier
(`tests/integration/supabase/client-runtime-verification.mjs` and its helpers in
`tests/integration/supabase/client-runtime-checks.mjs`) stages tenant, legal
entity, membership, user and fund rows against an owned local Supabase stack
(gateway and database containers) and proves caller-token authorization before
cleaning up every fixture row.

## Accepted records this code implements

PR #2753 (AL-2676, WP3a part 1a) records why `LEGAL_ENTITY_FIXTURE_INSERT` and
`MEMBERSHIP_FIXTURE_INSERT` run via `psql` in the owned database container
(`legal_entities` grants `service_role` nothing under deny-by-default), why
Realtime is verified by a broadcast round trip rather than `postgres_changes`
(`20261119135300_request_tenant_policies.sql` section 5 removed `funds`,
`locations`, `posts`, `post_comments`, `post_fires`, `post_likes` and
`post_prayers` from `supabase_realtime`, leaving no application table
published), and why `tests/unit/scripts/supabase-client-runtime-safety.test.ts`
statically pins the hand-run verifier's source.

## Decisions

1. **Strip ambient Docker client settings when passing an explicit `--host`.**
   In `tests/integration/supabase/client-runtime-checks.mjs`,
   `DOCKER_CLIENT_SETTINGS` and `withoutDockerClientSettings` remove
   `DOCKER_HOST`, `DOCKER_CONTEXT`, `DOCKER_TLS_VERIFY` and `DOCKER_CERT_PATH`
   from the environment handed to `ownedDatabaseCommand`. An explicit
   `docker --host <endpoint> exec` must not inherit ambient Docker client
   settings that could redirect or alter the connection. Cited: AL-2676 fix
   check K7.
2. **Remove fixture rows in strict foreign-key order.** `orderFixtureCleanup` in
   `tests/integration/supabase/client-runtime-checks.mjs` orders teardown as:
   Realtime channels first; `funds` (which reference `legal_entities`);
   `legalEntity` and `membership` (which reference `tenants`); `users`;
   `tenants` (protected by every `ON DELETE RESTRICT` key above); and the
   post-cleanup census check last.
3. **Prove both cross-tenant refusal and non-member refusal under the fund's own
   tenant.** In `tests/integration/supabase/client-runtime-verification.mjs`,
   `verify` checks `caller-token-non-member-denied` (a signed-in user with no
   membership sending `x-asym-tenant` for the fund's own tenant) in addition to
   `caller-token-denied-under-other-tenant`. Checking only the member under
   another tenant would also pass a policy that trusted the `x-asym-tenant`
   header without verifying live membership. Cited: AL-2676 round M.
