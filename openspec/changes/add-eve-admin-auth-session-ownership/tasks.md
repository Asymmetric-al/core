<!-- Partner DRAFT for GitHub issue #426. Task list for the `add-eve-admin-auth-session-ownership` OpenSpec
change; enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off. Acceptance and scope
grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md] and
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the admin-auth/session-ownership OpenSpec contract

- [ ] 1.1 Add the `eve-admin-auth-session-ownership` capability via this change's spec delta
      (`specs/eve-admin-auth-session-ownership/spec.md`), building on #422 (admin memory), #423
      (approval/budget), and #425 (runtime foundation) without restating them
- [ ] 1.2 State the six requirements as spec: current-admin-identity mapping; service identity with explicit
      initiator metadata; verified-context-only tenant/user derivation; ownership enforcement on session/
      approval/memory/audit/replay access; server-side fail-closed auth-before-mount; and no new authority /
      spec-only
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-admin-auth-session-ownership --strict`

## 2. Record ADR-0008 (admin auth and session ownership)

- [ ] 2.1 Author ADR-0008 in this change's `design.md`, traceable from #422 (admin memory), ADR-0005 (#423),
      and ADR-0007 (#425)
- [ ] 2.2 Land the ADR at the repo's chosen ADR location (confirm convention with maintainers, same as ADR-0001)
- [ ] 2.3 Cross-link ADR-0008 from the parent PRD and issue #426

## 3. Identity mapping and service identity

- [ ] 3.1 Specify that admin UI requests act as the current admin identity, inheriting that user's tenant, role,
      and permissions, audited under that identity (audit-record shape stays #419)
- [ ] 3.2 Specify that background jobs, schedules, and system-initiated work run under a service identity with
      explicit initiator metadata and are never silently attributed to a real admin user

## 4. Verified-context derivation and ownership enforcement

- [ ] 4.1 Specify that tenant and user are derived from verified route/admin session context only, and IDs from
      prompts, model output, tool input, or remote responses are never authority
- [ ] 4.2 Specify that session create, continue, stream, approval response, memory read/write, audit read, and
      replay/debug artifact access each enforce user and tenant ownership
- [ ] 4.3 Specify that enforcement is server-side and fails closed, holds before the #427/#428 admin mount, and
      applies to the #425 runtime-hosted sessions

## 5. Boundary and subordination

- [ ] 5.1 Draw the boundary: #417 owns the protected-area/auth contract; #419 owns the audit-record shape; #422
      owns memory content; #423 owns approval/budget; #424 owns retention/replay; #425 hosts sessions;
      #427/#428 own the admin shell and mount; #426 owns the auth/session-ownership gate they pass through
- [ ] 5.2 State that the boundary grants no new authority, never bypasses #417 protected-area/approval limits or
      #418 emergency-off precedence, introduces no live auth code/session store/middleware/UI/schema, and keeps
      the release switch off until auth is verified

## 6. Acceptance checks (AFK)

- [ ] 6.1 Maintainer review of the identity mapping, service-identity/initiator rule, verified-context-only
      derivation, ownership enforcement matrix, and fail-closed auth-before-mount posture
- [ ] 6.2 Confirm tenant and user cannot be selected by prompt, model output, tool input, or remote response —
      the charter data-boundary / identity-correctness posture
- [ ] 6.3 Confirm no live auth code, session store, middleware, admin UI, or Supabase schema is included, and
      that the audit-record shape (#419), memory content (#422), approval policy (#423), retention/replay
      (#424), and session-hosting runtime (#425) are not redefined here
- [ ] 6.4 Confirm the change is subordinate to #417/#422/#423/#425, OpenSpec, `AGENTS.md`, `docs/ai/*`, and
      existing CI gates, and that the release switch stays off until auth is verified
- [ ] 6.5 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
