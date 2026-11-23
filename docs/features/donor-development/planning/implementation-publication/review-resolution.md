# Phase 27 publication review resolution

Reviewed on 2026-10-11 against publication commit
`ca4f29066ef0dbc2a909deb11d92277c90c9ab4e`. This record concerns documentation,
verification and the implementation plan. It does not claim feature delivery.

| Review finding                                           | Disposition and completed correction                                                                                                                                                                   | Proof and remaining boundary                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P42 hash appears to identify the full glossary           | Clarified. The original hash and 15,881-byte count identify the rendered glossary diff, not the 444,016-byte source file. Preserve both dated identities separately and archive the exact P42 content. | The saved content reproduces the original hash. Full-file metadata agrees with the historical source manifest; future living glossary changes are allowed.                                                                                                                                                                                           |
| Missing historical probe log                             | Fixed all four omitted `.log` files, preserving original paths and bytes from the untouched working tree.                                                                                              | The archive verifier checks exact hashes and Git tracking. These are original captures, not newly executed probes.                                                                                                                                                                                                                                   |
| Phase 27 projection guard absent from blocking CI        | Added `verify:phase27-spec` to the existing required integrity job and local preflight, following the Phase 25 pattern.                                                                                | Renderer `--check` rejects drift in each generated projection without rewriting it. Archival verification also runs; a contract test checks the unconditional CI step.                                                                                                                                                                               |
| Publication verifier accepts an incomplete passing audit | Strengthened the verifier to reconstruct the expected check inventory and receipt effects independently of the supplied audit's PASS flags.                                                            | The intact 853-check audit passes. Eleven previously accepted corruptions fail, including removal of the protected-parent check with adjusted counts and recomputed checksum. Required operation receipts, exact labels/parents/blockers, native closure and complete payload hashes are verified. This proves receipt integrity, not runtime truth. |
| Acceptance cases require unavailable source behavior     | Confirmed. Prepared the [exact correction proposal](../implementation-corrections/README.md).                                                                                                          | Published issue bodies and native graph remain the approved original. Material acceptance/dependency changes require user review before tracker mutation. The 853-check publication audit remains valid for publication fidelity, not semantic sufficiency.                                                                                          |

The archival verifier is deliberately limited to dated grill evidence, the
explicitly advanced session-log snapshot, exact saved P42 content and the four
tracked logs. Isolated fixtures proved that missing/untracked logs and
same-length archive tampering fail; legitimate living glossary and normative
changes pass. It works from an unrelated current directory and a fresh Git
repository without historical commit objects. Current normative projections are
checked by the renderer, not frozen against old publication hashes.

The publication receipt retains its qualified #702 recovery evidence: known
prewrite metadata is proved, but no prewrite native-blocker snapshot was
retained. No later verifier change upgrades that limitation into stronger proof.

On 2026-10-11 all 68 implementation issues remained blocked, and the
specification-integration, E7, C-01 and exact Phase 6 outbound-owner
qualification gates remained in force. The original 68-ticket approval,
139-edge receipt and 15 scoped predecessor amendments are preserved; the
correction proposal does not silently replace them.

The new verification script changes only root package scripts. All eight Shadscan
root-library applicability findings were re-reviewed: dependency declarations,
workspace classification and application ownership are unchanged. Their exact
manifest proof hashes were refreshed; classifications, evidence fingerprints,
app floors and unrelated proof hashes were preserved. The normal hook rechecks
the complete staged audit.

## Current status amendment (2026-11-24)

Everything above records the October 11 state. Since then PR #1993 has merged
(2026-10-11, merge commit `9cada8f3d8ab59db391d3fd20df77fcadeb09813`), and
Phase 28 D48 (C-01) and D49/D50 (E7) settled the two owner choices on
2026-10-18. Each organization chooses its posted-gift correction approval
policy, with the light default for new organizations, preservation of an
existing stronger policy and a different human as approver wherever
independence is required. Earlier gifts keep their accepted campaign
attribution, changes go through append-only correction, and recurring origin
survives ordinary edits. Adapter, Phase 6 outbound, and source, RLS and
concurrency qualification gates remain; affected received-toward-appeal results
stay Unavailable until the association adapter is qualified. The
[publication record's current status](README.md#current-status-2026-11-24)
gives the exact sources, the correction packet's application to GitHub and the
tracker comments that conflict with D48.
