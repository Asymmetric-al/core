## Context

See proposal.md for the six review findings. The installed Next.js
`use-server.md` and Server Actions guide require a real callable boundary and
request-time authentication. Core's post routes already re-export authenticated
handlers from published API subpaths; its ordinary API functions do not become
Server Actions by import.

## Goals / Non-Goals

Correct the Core remaps where readers act on them and make their existing
guards detect local loss. Keep the vendor narrative and reviewed pin/hash;
do not create product endpoints, another query layer or a new app folder scheme.

## Decisions

- Use actual post and post-like thin route re-exports plus the published
  DashboardStats type instead of the invented API root namespace. Mention
  server-read authorization preconditions; keep ordinary server functions out
  of client imports.
- Keep server tags/invalidators API-owned. Browser query keys can remain local
  to their client owner; explicit coordination avoids an API-to-app dependency.
- Bound each assertion at the next non-indented instruction instead of the end
  of the file. Preserve continuation lines and fail when the marker is missing.
  Repeat the same five deletion mutations before and after to prove the guard.
- Edit canonical sources only and use skills:sync for all three runtime mirrors.

## Risks / Trade-offs

- Vendor refresh can restore conflicting recipes: preserve the local remaps,
  source/transport notes and bounded assertions documented in provenance.
- Package examples can drift: verify imports against package exports and thin
  route examples against current route files.
- Static documentation verification does not prove runtime behavior; no app
  code changes or new runtime claims are part of this correction.

## Migration Plan

Publish canonical changes with their generated mirrors and tests. Rollback
reverts those together and reruns sync/verification. Leave this change active
until the PR merges; no application or data migration is required.

## Reference Recipes And Reviewed Refresh

The resolved-history corrections remain documentation and test changes. Next.js
API links name discovered installed documentation files. React examples expose
explicit pending attributes and commit the canonical optimistic base, with
success/failure coverage that executes the actual fenced examples. A TypeScript
checker protects payload-bearing ActionResult success. CSS snapshot guidance
states isolation limits without claiming a browser visual test.

Refresh intake uses a pinned Skills CLI against a verified immutable checkout
outside the canonical tree. Maintainers review the raw installed tree/hash,
reconcile upstream deletions, and reapply Core adaptations before mirror sync.
All required runtime mirrors remain present; raw upstream provenance is never
computed from adapted content. This change performs no upstream refresh and
advances no upstream commit or hash.
