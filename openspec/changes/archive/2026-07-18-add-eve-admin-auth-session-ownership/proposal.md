# Proposal: Eve current-admin auth and session ownership

## Why

Issue #426 is the authorization gate between the isolated runtime foundation
and the later admin workspace/mount. Eve 0.25.1 can authenticate every HTTP
session route and carry that caller into durable context, but its installed
documentation explicitly leaves per-user and per-tenant session ownership to
the application.

The repository already has a verified Supabase admin context and owner-scoped
memory/replay records. This slice composes those boundaries so prompt, model,
tool, or remote-supplied identity can never select Eve's tenant or user.

## What changes

- Map Eve HTTP route auth to the current Supabase-verified admin identity,
  retaining tenant, user, profile, and role without accepting identity from
  request content.
- Persist a minimal app-owned session ACL binding while Eve continues to own
  durable session content and workflow state.
- Claim the binding at the first `turn.started` event and check it before every
  continuation, cancel, or stream attachment.
- Add a validated service-identity factory requiring an explicit accountable
  human or trigger and bind service sessions to both values.
- Restrict admin memory, approval response, audit read, and replay/debug access
  to the verified user and tenant through the existing server data boundary.
- Keep loopback-only deterministic eval access separate from production admin
  auth, with no app-owned binding or external effect.
- Promote EVE-DESIGN-0008 to ADR-0027.

## What does not change

- The release switch remains off. No live model, provider, tool, sandbox,
  deployment, admin UI, or Next.js mount is enabled.
- Eve/Workflow still owns durable conversations; Supabase stores only the
  authorization binding and existing governance artifacts.
- #417 protected-area rules, #418 emergency precedence, #419 audit shape,
  #422 memory content, #423 approval/budget policy, and #424 retention rules
  remain authoritative.

## Verification

- Focused identity, ownership-store, route-path, artifact-access, and migration
  tests
- `eve info`, `eve build`, and strict offline eval
- Package lint/typecheck, strict OpenSpec validation, and repository CI gates
