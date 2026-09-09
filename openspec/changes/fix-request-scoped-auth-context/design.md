# Auth context correction design

## Context

See proposal.md. The existing public.current_user_memberships RPC is restricted to the authenticated caller and target tenant. It returns staff_role and is_active. The edge resolver already uses it; the server auth context still switches to the unexposed authz schema.

## Goals / Non-Goals

Resolve profile and membership data through the existing authenticated request client. Preserve cookie refresh, bearer binding, supported profile roles, and staff subroles. No schema exposure, broad grants, role-model redesign, new authentication transport, or production settings change.

## Decisions

Use the request client for profiles and the existing membership RPC. Granting extra service privileges would keep an unnecessary administrative dependency in every sign-in. Reject profile or membership errors before deriving a role, and filter memberships to active rows in the resolved tenant.

## Risks / Trade-offs

Membership-service failure now denies access rather than continuing with partial authorization data. This matches the existing edge policy. Confirm successful empty membership sets still preserve supported legacy roles. The observed service-role ACL is from isolated commissioning; production ACLs are not inferred.

## Migration Plan

No data migration. Run regression and repository gates, then test the separately identified candidate against isolated Core Auth/CMS. Present the candidate PR for human merge; rollback reverts this source-only change. Retain failed baseline evidence and keep the OpenSpec change active until merged.

## Verification evidence

Candidate `405b6da0abafeb55e83cbc1f3366e0b68dbd9743`, tree `0027f7e9164b02d102244637566f089089f7fdf3`, was tested against the unchanged Core database baseline `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` in an isolated CMS-enabled environment. The factory source manifest was `sha256:82dc4ee76963dfa93d3b419c73816ae63371ad0fca304430768e6b225a594664`.

- RED: the new request-context regression initially had four failures.
- GREEN: 149 focused auth checks; 3,852 full unit checks, four existing skips. Commands: `bunx vitest run packages/auth tests/unit/auth`, `bun run test:unit`.
- `bun run --cwd packages/auth lint`, `bun run --cwd packages/auth typecheck`, strict OpenSpec validation, and full `bun run ci:preflight` passed, including every application build. Pre-commit and pre-push hooks passed.
- Actual browser: donor password Auth HTTP 200 reached the dashboard with the CMS service credential configured; reload retained the dashboard session; sign-out followed by protected navigation redirected to login; a valid staff account was redirected away from the donor dashboard to `/`, as the proxy specifies. Desktop and mobile screenshots were inspected.
- Native cleanup verified unchanged candidate source and removed the browser, private networks, four database/Auth/API containers and synthetic volume. The local browser session and SSH tunnel were closed.

Scope review against `identity-and-access` and the current proxy confirms caller-bound profile and membership reads, preserved staff subroles, denial on unavailable authorization data, and unchanged role policy. CodeRabbit reported no source-behavior findings; its documentation findings are addressed in this update. No separate configured Core Guardian agent was available, so this is a local scope review, not an independent Guardian certificate.

The broader donor portal still returns HTTP 500 for its data endpoint and HTTP 400 for posts in the synthetic environment. Mobile navigation lacks accessible labels, and private-address media remains a separate limitation. Those observations are not counted as an application or accessibility pass. This is an operator-created auth correction, not a factory-generated delivery or production admission. The original baseline failure remains retained.
