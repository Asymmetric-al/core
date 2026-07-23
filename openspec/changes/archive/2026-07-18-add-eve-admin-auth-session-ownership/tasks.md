## 1. Version-specific auth contract

- [x] 1.1 Read installed Eve auth, session-context, multi-tenant, session, and
      HTTP-channel guides before framework code
- [x] 1.2 Read installed Next.js 16 authentication/route-handler docs and
      current official Supabase SSR/`getUser()` guidance
- [x] 1.3 Confirm Eve route auth does not implement per-session ownership

## 2. Verified identity mapping

- [x] 2.1 Derive admin tenant, user, profile, and role only from the verified
      Supabase auth context
- [x] 2.2 Map the identity to Eve's current-caller snapshot without accepting
      prompt/model/tool/remote identity claims
- [x] 2.3 Add a distinct validated service identity with explicit initiator

## 3. Session ownership enforcement

- [x] 3.1 Add service-role-only, RLS-enabled session ACL metadata
- [x] 3.2 Claim first-turn ownership idempotently for only the exact identity
- [x] 3.3 Check continuation, cancel, and stream routes before dispatch
- [x] 3.4 Preserve loopback-only offline eval without creating an app binding

## 4. Governance-artifact ownership

- [x] 4.1 Preserve exact tenant/profile ownership for memory read/write
- [x] 4.2 Verify approval-response tenant/requester ownership before decision
- [x] 4.3 Scope audit reads and replay/debug access to tenant/profile ownership

## 5. Documentation and verification

- [x] 5.1 Promote the decision to ADR-0027 and link the implementation plan
- [x] 5.2 Add identity, route, admin/service ACL, artifact, and SQL tests
- [x] 5.3 Prove Eve info/build/eval, package checks, strict OpenSpec, and repo CI
