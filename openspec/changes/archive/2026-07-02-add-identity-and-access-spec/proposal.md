# Add Identity And Access Capability Spec

## Why

Authentication, tenant isolation, and permission enforcement are the platform's
most-referenced non-negotiable boundaries, but they had no capability spec: the
durable intent lives in `platform-boundaries` while the shipped enforcement
contract was unspecified. An audit confirmed a substantial, real auth
subsystem (Supabase-session identity, server-side tenant/role resolution,
app-layer-primary with RLS defense-in-depth, granular capability checks,
production-safe demo bypass) governed by no verifiable WHEN/THEN behavior.

## What Changes

- Add an `identity-and-access` capability spec documenting shipped behavior:
  server-side identity/tenant/role resolution from a validated Supabase
  session; tenant isolation enforced app-layer-first with RLS as
  defense-in-depth; server-side capability enforcement for sensitive actions
  (UI hiding is not protection); sensitive operations and secrets behind the
  server boundary with a fail-closed admin client; and a demo auth bypass that
  is impossible in production.
- Record the honest MVP posture: staff subroles currently share broad Mission
  Control access, with per-subrole narrowing reserved as forward work, while
  sensitive contribution actions already enforce granular capabilities.

## Impact

- Affected specs: `identity-and-access` (new)
- Affected code: none (documents `packages/auth/**`,
  `packages/api/src/shared/with-operation.ts`,
  `packages/api/src/admin/contribution-operations/permissions.ts`, and the
  Supabase RLS migrations)
