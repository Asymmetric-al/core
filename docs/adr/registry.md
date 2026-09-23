# Platform ADR identity registry

Reconciled 2026-09-16 for AL-1861. This registry preserves accepted filenames
and disambiguates numbers; it does not choose product authority by recency or
promote unmerged decisions. Apply the [ADR policy](README.md) and
[document authority guide](../ai/document-authority.md).

## Existing collisions in the merged baseline

At `develop` commit `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`, 13 numeric
identifiers identify 30 different files in the canonical directory. Cite the
exact file below, including its subject. An older ruling committed later is not
a supersession of a different subject with the same number.

| Recorded number | Exact canonical file                                                                                                                       | Subject                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 0025            | [0025-eve-retention-replay-lifecycle.md](./0025-eve-retention-replay-lifecycle.md)                                                         | Eve retention and replay lifecycle                                                |
| 0025            | [0025-producer-owned-protected-actions.md](./0025-producer-owned-protected-actions.md)                                                     | Producer-owned protected actions                                                  |
| 0026            | [0026-contract-bounded-delivery-plans.md](./0026-contract-bounded-delivery-plans.md)                                                       | Contract-bounded Delivery Plans                                                   |
| 0026            | [0026-public-website-surface-in-donor-app.md](./0026-public-website-surface-in-donor-app.md)                                               | Public Website is a surface in `apps/donor`, `apps/web` reserved                  |
| 0027            | [0027-eve-admin-auth-session-ownership.md](./0027-eve-admin-auth-session-ownership.md)                                                     | Bind Eve sessions to verified admin or service identity                           |
| 0027            | [0027-one-notification-presentation-and-engagement-model.md](./0027-one-notification-presentation-and-engagement-model.md)                 | One notification presentation and engagement model                                |
| 0027            | [0027-transport-agnostic-public-content-reader.md](./0027-transport-agnostic-public-content-reader.md)                                     | Transport-agnostic reader, single Payload read in admin, availability seam        |
| 0028            | [0028-defense-in-depth-public-isolation.md](./0028-defense-in-depth-public-isolation.md)                                                   | Defense-in-depth public isolation                                                 |
| 0028            | [0028-eve-admin-workspace-operations-shell.md](./0028-eve-admin-workspace-operations-shell.md)                                             | Make the Eve admin workspace operations-first                                     |
| 0028            | [0028-sms-evidence-governance-transport-unavailable.md](./0028-sms-evidence-governance-transport-unavailable.md)                           | SMS evidence governance with transport unavailable                                |
| 0029            | [0029-eve-admin-mount-global-panel.md](./0029-eve-admin-mount-global-panel.md)                                                             | Mount Eve as a data-minimizing global admin panel                                 |
| 0029            | [0029-reference-not-copy-cms-operational.md](./0029-reference-not-copy-cms-operational.md)                                                 | Reference-not-copy CMS↔operational, operational-wins on drift                     |
| 0029            | [0029-tenant-owned-resend-and-composed-delivery-identities.md](./0029-tenant-owned-resend-and-composed-delivery-identities.md)             | Tenant-owned Resend and composed delivery identities                              |
| 0030            | [0030-canonical-message-document-and-presentation-dependencies.md](./0030-canonical-message-document-and-presentation-dependencies.md)     | Canonical message document and immutable presentation dependencies                |
| 0030            | [0030-eve-sandbox-engineering-worker.md](./0030-eve-sandbox-engineering-worker.md)                                                         | Contain Eve engineering work in a governed sandbox                                |
| 0030            | [0030-function-level-tagged-caching-publish-signal.md](./0030-function-level-tagged-caching-publish-signal.md)                             | Function-level tagged caching + cross-app publish signal, no route-segment config |
| 0032            | [0032-eve-autonomous-pr-operator.md](./0032-eve-autonomous-pr-operator.md)                                                                 | Use an issue-first governed GitHub operator for Eve                               |
| 0032            | [0032-immutable-prepared-message-and-whole-message-recovery.md](./0032-immutable-prepared-message-and-whole-message-recovery.md)           | Immutable prepared message and whole-message recovery                             |
| 0033            | [0033-canonical-generated-document-authorities-and-clean-cutover.md](./0033-canonical-generated-document-authorities-and-clean-cutover.md) | Canonical generated-document authorities and clean cutover                        |
| 0033            | [0033-eve-strict-auto-merge-policy.md](./0033-eve-strict-auto-merge-policy.md)                                                             | Require a complete fail-closed proof before Eve merges                            |
| 0034            | [0034-eve-subagent-catalog-shared-run-context.md](./0034-eve-subagent-catalog-shared-run-context.md)                                       | Use declared Eve specialists and append-only shared run context                   |
| 0034            | [0034-evidence-qualified-renderer-and-canonical-pdf-profiles.md](./0034-evidence-qualified-renderer-and-canonical-pdf-profiles.md)         | Evidence-qualified renderer and canonical PDF profiles                            |
| 0035            | [0035-eve-dynamic-workflow-orchestration.md](./0035-eve-dynamic-workflow-orchestration.md)                                                 | Gate Eve dynamic workflows with typed plans and continuous policy                 |
| 0035            | [0035-structured-document-authoring-and-approved-data-views.md](./0035-structured-document-authoring-and-approved-data-views.md)           | Structured document authoring and Approved Data Views                             |
| 0036            | [0036-code-owned-jurisdiction-packs-and-document-identities.md](./0036-code-owned-jurisdiction-packs-and-document-identities.md)           | Code-owned jurisdiction packs and document identities                             |
| 0036            | [0036-eve-engineering-health-monitors.md](./0036-eve-engineering-health-monitors.md)                                                       | Run Eve engineering monitors through an app-owned leased registry                 |
| 0037            | [0037-eve-email-discord-notifications.md](./0037-eve-email-discord-notifications.md)                                                       | Deliver Eve operator notifications from durable safe envelopes                    |
| 0037            | [0037-scanner-safe-exact-artifact-access.md](./0037-scanner-safe-exact-artifact-access.md)                                                 | Scanner-resistant exact-artifact access                                           |
| 0038            | [0038-eve-final-launch-readiness.md](./0038-eve-final-launch-readiness.md)                                                                 | Gate Eve activation with immutable target-bound evidence                          |
| 0038            | [0038-purpose-owned-records-schedules-and-verified-disposal.md](./0038-purpose-owned-records-schedules-and-verified-disposal.md)           | Purpose-owned records schedules and verified disposal                             |

## Earlier Eve renames

Eve runtime foundation moved from 0026 (and a temporary colliding 0031) to
[0062-eve-standalone-runtime-foundation.md](./0062-eve-standalone-runtime-foundation.md)
in commit `95b40f1301398a6253be904ae5cc9bbae187f644` on 2026-07-31.
Eve GitHub review moved to
[0063-eve-github-read-review-path.md](./0063-eve-github-read-review-path.md)
in commit `63ace7583e9d01acf8f342ed74d1857886c573bc` on 2026-08-01. Existing Eve references now link these exact records;
they do not refer to the communication-history or Delivery Plan records that
occupy the old numbers. These are documented earlier renames, not new renumbering.

## Pending branch collisions observed 2026-09-16

The following inspected branches used overlapping platform numbers. Only their
full paths plus exact source revisions identify the records. Their inclusion in
this table does not import, approve or implement the pending PRs.

| Recorded number | Planning record in the Phase 22 package                                                                                                               | Distinct pending implementation record                                                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0118            | `docs/adr/0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md`, Phase 22 PR 1323 head `70c50e8c97556c43be5543332fb0993b468b90ab` | [PR 1329: gift processing fee policy](https://github.com/Asymmetric-al/core/blob/134310f29e68f77888e462f37aaf101d7d4c567d/docs/adr/0118-gift-processing-fee-policy-lives-in-core.md) at `134310f29e68f77888e462f37aaf101d7d4c567d`       |
| 0120            | `docs/adr/0120-family-certified-public-page-presentation-profiles.md`, Phase 22 PR 1323 head `70c50e8c97556c43be5543332fb0993b468b90ab`               | [PR 1331: GraphQL gift engagement adapters](https://github.com/Asymmetric-al/core/blob/76317f72e0f901894281d5fde09301f3c99ef2a0/docs/adr/0120-graphql-gift-engagement-command-adapters.md) at `76317f72e0f901894281d5fde09301f3c99ef2a0` |

Before either distinct pending implementation record is promoted, recheck its
current head and the accepted directory. Resolve its identity deliberately in
that PR while preserving source links. Never reinterpret a Phase 22 reference
as a fee-policy or GraphQL decision because the number happens to match.

Feature-scoped `ADR-CD-*` and Support ADRs have their own directory-qualified
namespaces. They are not collisions in the platform series; still use complete
links across contexts.

## Accepted addition — 2026-09-23

[0206-immutable-posted-financial-facts-and-owner-operational-state.md](0206-immutable-posted-financial-facts-and-owner-operational-state.md)
records the founder's C-02 ruling: separate owner-controlled operational records,
with complete posted financial-row immutability and joined projections. The
canonical directory ended at 0205 before this addition, and the pending
collision register contained no 0206 record. This accepted addition does not renumber earlier ADRs
or claim implementation; C-01's correction-approval question is independent.
