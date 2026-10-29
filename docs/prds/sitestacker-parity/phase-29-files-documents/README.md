# Phase 29 specification package

Start with the [main specification](../phase-29-files-documents.md). The full canonical behavioral volumes are:

| Volume                                                            | Scope                                                                                                                   |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [Common safeguards](proof.md)                                     | Ownership, current identity, all-door authorization, transactions, disclosure, clocks, operations, migration and proof  |
| [Request access](request-access.md)                               | Confirmed recipients, finite admissions, safe readback, original download, fresh access, sharing and linked replacement |
| [Collection and review](collection-review.md)                     | Exact evidence, review, acceptance, fulfillment, responsibility, questions, changes and terminal behavior               |
| [Organization and review tools](organization-and-review-tools.md) | Discovery, folders, templates, views, ZIP, comments, notices/reminders, staff evidence, resources and personal saves    |
| [Custody and integration](custody-and-integration.md)             | Immutable bytes, private intake, processing, providers, all existing/future consumers, copies, cutover and restore      |
| [Records policies and references](records-policies.md)            | Tenant-owned policies, disposal, partner references and supported external-event recording                              |

Canonical volumes own the prose; generated OpenSpec/trace/index files are not independent authoring sources. Run `bun docs/prds/sitestacker-parity/phase-29-files-documents/tools/render-spec.mjs --write` after a permitted amendment, and the same command without `--write` to verify consistency. Read all referenced OpenSpec contract bodies in full.

[Owner reconciliation](owner-reconciliation.md) separates current code from intended behavior and names exact capability gates. [Testing evidence](testing-evidence.md) records existing seams and their limits. [Source inventory](source-inventory.md), exact source maps and `grooming-preservation.json` preserve the session evidence. Historical alternatives and earlier stage prohibitions remain provenance; explicit later ratification and the current `/to-spec` instruction control forward work.

No implementation test has passed merely because its acceptance outcome appears here. No implementation task is complete merely because its specification is published.

`verify:phase29-spec` also runs inside the existing `verify:openspec-deltas` integrity gate, so normal CI and preflight reject source or projection drift without introducing another CI stage. Historical CI acceptance records and the existing stage sequence remain intact.
