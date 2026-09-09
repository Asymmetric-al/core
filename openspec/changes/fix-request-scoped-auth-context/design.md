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
