# Support Hub — Phase 26 documentation

**Integrated planning status (2026-09-16, AL-1861).** The Phase 26 contract and
shared-owner clarifications from source PR #1657 are adopted in this
reconciliation branch; that source PR remains open. Its publication/provenance
registers stay exact historical records: “current repository” hashes in those
records mean the pinned source head
`ae74b9856e2d910096ab74e715f51c143364a5ce`, not these integrated files.
The [reconciliation manifest](../../ai/audits/2026-09-16-documentation-reconciliation-sources.json)
records integrated hashes and amendments separately. No product tasks or
runtime qualification are completed by this documentation adoption.

The [published specification, AL-1656](https://github.com/Asymmetric-al/core/issues/1656), records all forty ratified decisions and amendments. This directory preserves the decision history; the formal package below is the current implementation contract. Specification readiness does not mean the feature has shipped.

**Delivery graph snapshot (2026-09-16).** Specification issue #1656 has four
native index issues #1658–#1661 and 199 implementation leaves #1662–#1860.
Those leaves are delivery work, not 199 new product decisions or completed
acceptance proofs; the 237 OpenSpec implementation/qualification tasks remain
unchecked.

## Reading and implementation order

1. **Understand the intended behavior.** Start with the [user stories, implementation and testing contract](../../prds/sitestacker-parity/phase-26-support-hub-conversation-management.md) and [current consolidated glossary](../../prds/sitestacker-parity/phase-26-support-hub-glossary.md). The [source-of-truth ownership matrix](../../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md) and governing Core decisions retain their authority.
2. **Read the binding detail for the work in scope.** Follow the story's requirement identifiers into [Requirements A — D1–D13](../../prds/sitestacker-parity/phase-26-support-hub-requirements-a.md), [B — D14–D26](../../prds/sitestacker-parity/phase-26-support-hub-requirements-b.md), or [C — D27–D40](../../prds/sitestacker-parity/phase-26-support-hub-requirements-c.md), together with the [shared-owner design](../../../openspec/changes/add-support-hub-conversation-management/design.md). These establish the behavior, boundaries and required proof.
3. **Use the implementation queue.** The [future tasks](../../../openspec/changes/add-support-hub-conversation-management/tasks.md) identify work and qualification to perform against those requirements. Completion needs the applicable evidence; a checked task cannot redefine the governing contract or establish another owner's outcome.
4. **Navigate and cross-check coverage.** This package's [derived OpenSpec behavior projection](../../../openspec/changes/add-support-hub-conversation-management/specs/support-hub/spec.md) and [human-readable source trace](../../prds/sitestacker-parity/phase-26-support-hub-traceability.md) help locate story, requirement and acceptance identifiers. The [machine register](../../prds/sitestacker-parity/phase-26-support-hub-traceability.json) supports automated validation. These derived representations are synchronized from the governing contract, not maintained as independent product decisions.
5. **Inspect the basis and history.** Read the [proposal](../../../openspec/changes/add-support-hub-conversation-management/proposal.md), [publication evidence and proof limits](../../prds/sitestacker-parity/phase-26-support-hub-evidence.md), and [publication/review provenance](publication-provenance.md), then use the relevant decision history below.

For this Phase26 package, make an authorized contract correction in the governing requirement/design material and reconcile its queue, derived projection and trace in the same change. A disagreement is a documentation synchronization defect to resolve; it does not create a second source of product intent. The original published issue packet remains dated evidence, while the provenance register identifies subsequent reviewed repository amendments.

## Decision history and authority

The [feature ADRs](docs/adr/), [original feature glossary](CONTEXT.md), and [grill records](grill/) retain their recorded chronology, including questions and alternatives that were later resolved. Earlier pending-stage or no-publication statements are historical. The current contract incorporates D27-C, D29-X01 and every accepted correction; it neither reopens those choices nor promotes historical evidence into shipped behavior.

Email Studio/P17 owns governed content, canonical authoring and whole-message preparation; P6 owns actual communication and recovery. Support, canonical intake and native CRM retain their distinct owners and permission boundaries. The formal requirements define these seams in full.

The [September 15 issue-publication record](phase26-spec-publication.md) describes that completed event. Its statements about no source commit/PR are dated evidence, not a restriction on this separately authorized documentation PR. Original-capture hashes in traceability identify the evidence as captured. The PR provenance record maps repository formatting to those original captures and the published issue without claiming product runtime proof.

## Current summaries and earlier build records

The [operator contract](operator-guide.md) and [administration contract](admin-guide.md)
summarize the accepted target and qualification boundaries. They do not certify
current deployed behavior. The `phase-01` through `phase-07` notes, feature file
map/parity inventory and local Phase 8 release notes describe earlier implementation
stages; their phase numbers are unrelated to the program roadmap. The Phase 6
note separately states the current Workflow Studio migration boundary. Do not
restore old status, retry, role, template or automation semantics from those
records when implementing the current formal contract.

## Historical model artifacts

The three Python reference-model files in `grill/` preserve finite, synthetic experiments from the recorded review. They are not application code, an integration test suite, or evidence that runtime behavior passed. They use their original output paths; D29 and D35 can overwrite adjacent captured JSON, and D34 retains an old workspace output path. Inspect or reproduce them in a separate scratch copy, not in the evidence directory. They are not registered with Core's CI or release tests. Their exact captured bytes remain part of the provenance record.

The two `.ts.txt` probe sources in the same archive are read-only historical evidence with original import/output locations, not runnable repository tests. They are linked from their original reviews and retain the source bytes for inspection.
