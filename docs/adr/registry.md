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

## Accepted Phase 2 foundation records — AL-481

- [0207-site-before-ledger-with-locale-and-currency-facets.md](0207-site-before-ledger-with-locale-and-currency-facets.md) records the settled Site presentation/attribution foundation and its explicit owner amendments.
- [0208-currency-aware-minor-units.md](0208-currency-aware-minor-units.md) records the settled checked minor-unit and metadata-authority contract.

The canonical directory ended at 0206 before these additions; neither 0207 nor
0208 appeared in the pending-collision register. These platform records preserve
existing identities and record accepted target intent, not implementation or
activation evidence. Source issue: [AL-481](https://github.com/Asymmetric-al/core/issues/481).

## Accepted Phase 3 foundation records — AL-490

- [0209-static-field-policies-and-subtract-only-projection.md](0209-static-field-policies-and-subtract-only-projection.md) is Phase 3 ADR-A: static field-only policy and subtract-only conditional/row resolution.
- [0210-code-authoritative-capability-foundation.md](0210-code-authoritative-capability-foundation.md) is Phase 3 ADR-B: code authority, read-only inspection and future-additive deferred tables.
- [0211-distinct-human-approval-for-projection-widening.md](0211-distinct-human-approval-for-projection-widening.md) is Phase 3 ADR-C: mandatory distinct-human widening approval and immediate narrowing, independent of financial approval mode.
- [0212-one-export-policy-and-shared-csv-safe-cell.md](0212-one-export-policy-and-shared-csv-safe-cell.md) is Phase 3 ADR-D: exportable authority and one shared csvSafeCell.

The canonical directory ended at 0208 before these additions; numbers 0209–0212
were absent from both the directory and pending-collision register. Existing
identities are preserved. These records document accepted planning intent, not
runtime implementation. Source: [AL-490](https://github.com/Asymmetric-al/core/issues/490)
and the [amended Phase 3 PRD](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md).

## Accepted Phase 4 foundation records — AL-504

- [0213-profile-claim-anchor-and-reserved-person-foundation.md](0213-profile-claim-anchor-and-reserved-person-foundation.md) records the profile claim anchor, separate historical proof/current access and reserved typed person migration target.
- [0214-path2-tenant-isolation-with-shared-native-credential.md](0214-path2-tenant-isolation-with-shared-native-credential.md) records Path 2 isolation with a shared non-authorizing native credential.
- [0215-guest-attribution-exact-claim-proof-and-current-access.md](0215-guest-attribution-exact-claim-proof-and-current-access.md) records quiet guest attribution, exact fresh claim proof and current source admission with native G01/provider gates outstanding.
- [0216-non-destructive-source-governed-replayable-donor-merge.md](0216-non-destructive-source-governed-replayable-donor-merge.md) records source-approved mutable repairs, frozen history and governed replayable Undo.

The directory ended at 0212 before these additions. Numbers 0213–0216 were absent
from both the directory and pending-collision register; existing accepted records
are preserved. These are accepted target decisions under
[AL-504](https://github.com/Asymmetric-al/core/issues/504) and the
[current Phase 4 owner PRD](../prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md),
not implementation, native/provider qualification or activation evidence.

## Accepted Phase 6 foundation records — AL-551

- [0217: Asym-owned canonical communication header and typed detail](0217-canonical-communication-header-and-typed-detail.md)
- [0218: Capture communication by construction at the sole email gateway](0218-capture-at-the-sole-email-gateway.md)
- [0219: Delivery attaches through exact scoped identity and quarantine](0219-delivery-attachment-and-scoped-quarantine.md)
- [0220: Freeze the actual send-time consent evaluation](0220-freeze-the-send-time-consent-evaluation.md)
- [0221: Keep bounded payload ownership behind one communication spine](0221-bounded-payload-owners-and-one-communication-spine.md)
- [0222: Synchronous delivery ingestion with durable reconciliation](0222-synchronous-ingestion-and-durable-reconciliation.md)
- [0223: Irreversible communication redaction and retention classes](0223-irreversible-communication-redaction-and-retention.md)

The canonical directory ended at 0216 before allocation. Numbers 0217–0223
were absent from the directory and inspected pending-collision register; existing
accepted identities remain unchanged. These seven records map one-to-one to
current Phase 6 F1–F7 under [AL-551](https://github.com/Asymmetric-al/core/issues/551)
and its October 8 owner reconciliation. Phase 17 ADRs are supporting owners,
not substitutes. Acceptance records target intent, not runtime or activation.
