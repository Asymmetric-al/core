# Phase26 documentation publication provenance

This record accompanies the documentation PR for [AL-1656](https://github.com/Asymmetric-al/core/issues/1656). It preserves the ratified specification while making the complete package discoverable in Core. The feature remains unimplemented; the active OpenSpec change and its 237 implementation/qualification tasks remain unchecked.

## Published contract and repository representation

All 11 approved volumes were freshly read back from the issue and matched to publication manifest `9503ff46b1f85604d845c62a0045031cd1b43acb0e4b704c38a72ff6bfd205b8`. The issue's original packet is unchanged. Repository formatting is a separate representation of that contract, not a replacement of the original publication hashes.

The [machine provenance register](publication-provenance.json) records each original pre-PR hash, the authored-before-format hash and the resulting repository hash. It also maps every published volume to its repository file. Embedded hashes and line ranges in the historical trace remain capture-time locators. Use current stable requirement identifiers for navigation; do not interpret those historical line numbers or hashes as the formatted current file.

The two files comprising this provenance record exclude themselves from their own manifest to avoid a circular hash. Git and the PR's exact-head audit identify their final contents.

## Deliberate documentation corrections

- The new [entry point](README.md) and context map identify the current formal glossary and complete contract.
- Current-stage notices clarify that `/to-spec` was selected, its testing approach confirmed and the specification published. Original chronological bodies remain intact; old pending questions and stage restrictions are historical.
- Four Windows-only links now resolve to canonical repository material. The two probe sources are archived as exact read-only text, with their original import/output locations retained as evidence rather than runnable test instructions.
- The already published evidence volume is included with the other ten formal volumes.

These are navigation, provenance and representation changes. They do not reopen any D1–D40 decision, alter a product requirement, create a feature implementation or claim runtime qualification.

## Preservation checks

Prettier 3.8.2 and an independent markdown-it 14.1.1 renderer checked all 768 candidate files. Ninety-nine files changed through formatting and 669 stayed byte-identical. All authored snapshots and actual readback hashes matched, with zero unsafe candidates. Five negative controls rejected altered hard breaks, table cells, URLs, ordered-list starts and literal code.

Changed Markdown required both semantic AST equality and independent rendered-token equality. The comparison ignores source coordinates, ordinary collapsed whitespace/paragraph-edge indentation, adjacent escaped-text segmentation and invisible formatter directives; it preserves hard-break nodes, table/cell structure, destinations, list order/starts and literal code. JSON retained deep values and exact numeric lexemes. Archived Python/text and the OpenSpec YAML remained byte-identical.

Exactly 216 scoped formatter guards protect large tables and literal examples in the formal requirement/trace volumes. They prevent table-padding expansion and preserve the literal required-field marker in a UI sketch. Normal formatting remains active elsewhere; no whole-file or path exclusion was introduced. Formatter idempotence and normal repository formatting checks remain required.

The complete per-file checks and hashes are in the machine register. These documentary comparisons do not prove the unimplemented API, database/RLS, browser, provider, accessibility, usability or capacity behavior. The confirmed acceptance contract remains binding.

## PR and release boundary

This PR targets `develop` and references AL-1656 without closing the specification authority issue. It includes the accepted glossary/ADRs, source history, full formal contract, source trace and active OpenSpec design/tasks. The three historical Python models and two read-only probe texts are finite synthetic evidence; they are not added to application execution, test discovery or CI.

The normal commit hooks, Shadscan floor, full pre-push preflight and GitHub branch protections apply. Required checks and an eligible approving review must be verified at the actual PR head. They are not waived by this record, a passing parser check or a bot that skips a large archive. Rollback is a documentation revert; it does not modify product data or the already published issue packet.
