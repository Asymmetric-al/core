## Context

See proposal.md for intent. Starting develop is
800213405e2c51e07180e86ee8322355e0fdb4eb. The primary checkout contains user
changes and remains untouched. Baseline and implementation use separate WSL
worktrees and existing opaque credentials. AL-1965 owns this campaign.

## Goals / Non-Goals

Deliver the approved coherent supported stack in reviewed family checkpoints.
Preserve existing product contracts and exact base-maia/Base UI ownership.
Production execution, feature activation, Twenty restoration and unrelated
architecture redesign are excluded. Eve and the native PDF builder stay at
their existing rollout settings.

## Decisions

1. Patch Next/React first. Official October 14 advisories cover Cache Components,
   RSC/Server Actions and image processing; npm audit alone misses relevant
   advisories. Qualify 16.4.2 / 19.3.1 / Node 24.22.1, refreshing official
   metadata before each checkpoint. Keep Bun 1.4.3. CI freezes exact runtime
   releases; setup permits current qualified Node 24 patches only.
2. Track all findings and test evidence in docs/maintenance/modernization/.
   Retained compatibility versions need current upstream ownership and tests.
   Product TypeScript remains 7; AST/parser tooling may use the maintained JS
   compiler API behind an explicit boundary. Do not force nested incompatible
   majors. Refresh the complete lock graph after each parent cohort.
3. Reconcile PR #2172 (OpenSpec) and #2160 (self-hosted CI) from current remote
   state. Do not edit another chat's worktree or duplicate its migration.
4. Upgrade tooling, Supabase/TanStack, Inngest and product GraphQL separately.
   TanStack DB plus adapter/collections move together with one physical runtime,
   mutation confirmation/rollback and bounded realtime recovery. Product GraphQL
   17 stays behind its package boundary; Payload keeps supported local GraphQL 16.
   Remove patches only after regression tests prove upstream behavior.
5. Public Payload v4 beta is the approved target rather than a v3 downgrade or
   another internal snapshot. Upgrade all Payload packages and transformers
   together. Use the versioned guide and committed migration runner. Inspect
   variants/custom-field and upload metadata collisions, use the predefined
   sizes-to-variants migration, preserve media serialization, and test Local API
   context/default access and JWT reauthentication without a legacy bypass.
6. Recover shipped Phase 47 PDF runtime sources from committed source maps and
   missing type-only definitions from declarations in Asymmetric-al/react-PDF.
   Accessible Phase 22 upstream cannot replace the shipped functionality. Record
   reconstruction provenance/hashes, prove baseline exports and documents, then
   use the owner's pnpm workflow to upgrade, build and import versioned artifacts.
7. Keep UI primitives/tokens, keyboard/focus and reduced motion stable while
   upgrading editor, email, Motion, icons, maps, panels and telemetry families.
   Upgrade Eve/Connect/AI SDK as one cohort. Enforce tenant/session, policy and
   budget checks in a governed model adapter before every provider call, including
   children. Stable attempt IDs and persistent exactly-once settlement cover
   streaming, completion, error, cancellation and replay; hooks observe events.
8. Upgrade Stripe SDK/API together. Preserve quoted methods, amounts/currencies
   and idempotency keys. Pause new command admission while workers/webhooks
   reconcile; require zero unresolved submitted requests before switching bodies,
   and prove abort behavior. Use the configured sandbox only.
9. Upgrade OpenPolicy privacy/cookies to current APIs. Replace removed Terms APIs
   with a small repository-owned document model and existing rendering components
   plus a current PDF library. Preserve reviewed text, dates and clause structure
   across browser, Markdown, HTML and PDF outputs.
10. Fix active docs and skills, separate formatter churn from semantic changes,
    regenerate mirrors, and preserve accepted ADRs via supersession. Remove
    obsolete duplicates or archive evidence with replacement links and no active
    routing. Refresh vendored examples through recorded provenance. Add link,
    command, version-reference, parity/provenance checks and weekly grouped
    Dependabot updates requiring review.

## Risks / Trade-offs

- Beta CMS storage/default-access changes -> versioned migration, explicit user
  contexts, representative backup/restore rehearsal and stable public serializer.
- Lost unpublished PDF functionality -> reconstruct shipped source first and
  compare exports, schema/document round trips and representative rendered output.
- Payment duplicate/ambiguous outcomes -> unchanged retry identity and body until
  a proven drain; workers/webhooks continue, unresolved state aborts the cutover.
- AI lifecycle changes bypass governance -> deny before every model call and
  exercise concurrent/replayed attempts and children with provider spies.
- Quality or documentation regression -> preserve existing test scope/floors,
  inspect substantive diffs and validate all three surfaces and generated outputs.

## Migration Plan

Land security, tooling/infrastructure, data/workflow/API, Payload, PDF provenance,
UI/editor/telemetry/AI, payment/legal, nested security and documentation cohorts
in dependency order. Requalify against develop after each merge and keep evidence
for each tested exact version and head. Rehearsals allow a short write pause and
payment drain but never mutate production. Finish with a cold combined install,
SBOM and official-advisory reconciliation, previews, and a hashed release package
containing committed migration order, preserved counts/assets/relationships,
restore evidence, rollback limits, reauthentication and monitoring instructions.
