# Phase 26 publication and document provenance

## Current repository contract

The current Support contract is the [story book](../../prds/sitestacker-parity/phase-26-support-hub-conversation-management.md),
normative requirement volumes, glossary and OpenSpec design named by the
[reading guide](README.md). AL-1861 consolidates it with the other ratified
phase packages. All 217 story requirements, 717 acceptance-scenario identifiers
and 237 unchecked implementation/qualification tasks remain present.

The AL-1861 direct-body correction updates REQ26-D09-R21 and its
US26-D09-05-AC03 story/OpenSpec views to reference the synchronized native
`crm-core` contract. The D10 owner boundary also uses that current contract.
This removes an obsolete future documentation-repair instruction; it does not
change CRM ownership, add Twenty, grant access or claim Support implementation.

The [reconciliation source manifest](../../ai/audits/2026-09-16-documentation-reconciliation-sources.json)
records original source hashes separately from integrated file hashes. Subsequent
intentional documentation corrections are reconciled representations, not
formatting-only copies. Do not interpret an old source-packet hash as a hash of
the current file or substitute the original issue wording for a later documented
correction. Stable US26/REQ26/AC26 identities preserve meaning across generations.

## Preserved source generations

1. [AL-1656](https://github.com/Asymmetric-al/core/issues/1656) originally
   published eleven volumes and 175 comments. The dated publication/readback
   evidence retains manifest `9503ff46b1f85604d845c62a0045031cd1b43acb0e4b704c38a72ff6bfd205b8`.
2. Initial repository packaging is immutable commit
   [201e696](https://github.com/Asymmetric-al/core/commit/201e696335bd420b377609e63c523546d7a6cc29).
   Its formatting/provenance records describe that generation only.
3. Reviewed source PR [#1657](https://github.com/Asymmetric-al/core/pull/1657)
   at [ae74b985](https://github.com/Asymmetric-al/core/commit/ae74b9856e2d910096ab74e715f51c143364a5ce)
   introduced R01–R08: current status/scope, P23 activation dependencies, bounded
   Support ownership, native CRM specification synchronization, ranked authoring,
   task-preamble consolidation and derived OpenSpec maintenance. Its
   [original provenance narrative](https://github.com/Asymmetric-al/core/blob/ae74b9856e2d910096ab74e715f51c143364a5ce/docs/features/support-hub/publication-provenance.md)
   records those reviews and their exact proof. Its four amended volumes and
   775-path scope describe that PR head, not this larger reconciliation.

The [machine source record](publication-provenance.json) is an explicitly
bounded snapshot of generation 3 and its earlier evidence. Its recorded hashes,
counts and review fields remain unchanged. The separate reconciliation manifest
owns integrated hashes; neither file hashes itself.

## Verification and release meaning

Validate current requirement/story/projection alignment and stable IDs, scoped
formatting, links and the integrated hash manifest after direct edits. Original
synthetic models, parser proof and source-PR CI are dated evidence; they do not
prove current API, database/RLS, provider, browser, accessibility or capacity
behavior. The current implementation graph and publication state are recorded
separately in the reading guide. Document integration is not source-PR merge,
feature implementation or activation, and never completes a runtime task.
