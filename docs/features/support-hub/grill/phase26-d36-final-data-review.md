# D36 — Final independent data/source review

14 September 2026. Reviewed the actual root `phase26-d36-adversarial-review.md`, `phase26-d36-ux-blueprint.md`, `phase26-d36-proof-and-operations.md` and `phase26-d36-evidence.md`, with the source/data and editor companion findings. No root file was edited by this reviewer. Source-evidence JSON generation was still in progress and its pending status is not a finding.

**Verdict: Accept with one required correction before the answer is finalized.** The architecture, recipient boundary, data safety, source lifecycle and 23-category coverage are otherwise materially complete for this narrow decision. This is an independent documentary review, not runtime release approval.

## Required correction F01 — Link edits can be falsely attributed as unchanged source

**Affected exact language:** D36-R05 says the label changes only “if any normalized text changes,” while supporting safe-link editing. The UX section “Edit without a specialist workflow,” P06 and editor companion ES03 repeat the text-only comparator.

**What can go wrong:** A worker changes a link's destination but leaves its visible text unchanged. The normalized text still matches the source, so the outgoing block can remain **Excerpt from [source]** although the destination was supplied by the worker. Supported structural edits can similarly change relationships without necessarily changing a naive flattened text string. This is an attribution and data-integrity error in precisely the source-bound feature being selected.

**Why it matters:** The recipient is encouraged to treat the attributed quotation as originating from the external sender. Safe URL validation proves permitted scheme/destination use, not who authored a changed link. Ordinary display comparison cannot prove source meaning remained unchanged.

**Severity:** High for an altered destination falsely attributed to someone else; **likelihood:** plausible once safe links are editable. No live exploit or empirical incident rate is claimed.

**Decision effect:** Amend the edited-marker contract; keep A, inline editing and the exact same simple interface. No new confirmation, diff viewer, AI classifier or change-reason field is needed.

**Permanent exact replacement:**

> Initially show **Excerpt from [sender], [date/time]**. Compare the candidate's qualified canonical semantic content with the inserted excerpt. A text change, including trimming, a changed link target, or another supported structural change that changes the represented content produces **Edited excerpt from …** in both the composer and outgoing HTML/plain text. Only explicitly qualified presentation-only formatting is excluded from that comparison. This is a deterministic code-owned canonical projection, not an AI or natural-language meaning judgment. Qualified Undo to the exact inserted semantic content may restore the original label.

**Acceptance addition to P06:**

> Change a safe link target while preserving its visible label and verify Edited excerpt in the composer, prepared HTML and actual plain text. Verify qualifying structural changes also mark Edited, presentation-only styling does not, and exact qualified Undo restores the unedited label. Source identity remains immutable throughout.

Propagate this narrow correction to the UX and ES03/associated editor proof language so the same decision does not retain a contradictory text-only definition.

## Confirmed source/data coverage

| Review requirement                                | Actual coverage                                                                                                                                                                                                                 | Result |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| All 23 requested categories explicitly evaluated  | Numbered table 1–23, with concern state, severity/likelihood, evidence, effect and exact clause/proof references; category23 explicitly records no additional material concern                                                  | Pass   |
| Current scaffold is not authority                 | R14/R16/R23 plus current-source experiment/evidence identify caller author/raw HTML, global token substitution, broad grants and schema gaps; no deployed exploit claim                                                         | Pass   |
| Exact source and selection                        | R02–R04/R07/R09/R11: original external email identity/revision, no DOM/substring authority, no cross-message widening, no merged-transcript shortcut                                                                            | Pass   |
| Source and reply target stay distinct             | R09–R11; P02/P15/P24 prove quote does not retarget or select historical audience                                                                                                                                                | Pass   |
| Legitimate external recipients remain serviceable | R09 explicitly rejects staff-RLS/account requirements for external correspondents; R10 reuses D2 disclosure and proportional review; P05/P14/P15                                                                                | Pass   |
| Source text stays inert                           | R08/R14/R20; P08/P10 address literal brace tokens, mentions, actions, URL/asset acquisition and complete canonical parity                                                                                                       | Pass   |
| Authenticated tenant/actor and immutable columns  | R16 and P11–P14 require trusted derivation, tenant-aware source/draft references, grants/effective RLS/views/RPC/definer/service closure and explicit immutable-column protection                                               | Pass   |
| Atomic private draft and replay                   | R04/R12–R13/R15–R16; P03/P11/P13/P18/P21 protect body/dependency parity, no duplicate result and no resurrection/overwrite                                                                                                      | Pass   |
| Privacy/retention reconciliation                  | R17 explicitly preserves finite controlled-derivative inventory, independently authored/received evidence owner correction, no global matching-text cascade, no dropping lineage at send and native-admission clock distinction | Pass   |
| Actual dispatch linearization and unknown outcome | R18 plus P20–P22 bind current guards to authoritative preparation/dispatch, retain immutable envelope and ADR0032 recovery, no cleaned blind resend or new key                                                                  | Pass   |
| P17/P6 seams                                      | R20 explicitly makes Support source/audience owner, P17 complete structured preparation owner and P6 delivery/evidence owner; no live history token/second mailer/library                                                       | Pass   |
| CRM continuity and independent business truth     | R19 and P23–P24 use the same authorized source/composer, preserve navigation, create no duplicate Party/activity and perform no giving action                                                                                   | Pass   |
| Boundaries and scope                              | R22 reuses finite qualified shared profile; R26 rejects broader platform/features; no arbitrary quote cap, generic source graph, new workflow or mandatory wizard                                                               | Pass   |
| Migration/rollback/repair                         | R23 and P25 require old-writer/schema closure, no invented backfill, preserved source restrictions and possibly sent evidence                                                                                                   | Pass   |
| Operations/proof honesty                          | All30 release groups are required and unexecuted; O01–O05 have named signals/thresholds/roles/responses; source probe is accurately a counterexample rather than product proof                                                  | Pass   |

No other material data/source correction is identified. The decision package incorporates this reviewer's C01–C15 outcomes without blindly freezing proposed table names or imposing external recipients' access to staff records. R17's final explicit independent-evidence/native-clock amendment closes the previously identified privacy ambiguity. Do not broaden this review into unrelated Support/platform implementation.

## Final actual-file verification — Pass

Re-read the corrected actual files on 14 September 2026. **F01 is resolved** in R05, the UX editing contract, P06, editor ES03 and the glossary definition: meaning-bearing text/order/structure/link changes are included; only qualified presentation-only formatting is exempt. The same-visible-text/different-href counterexample now has explicit prevention and proof. [Corrections record](phase26-d36-review-corrections.md) accurately preserves the historical finding and governing final wording.

Also checked F02's rare Choose excerpt fallback: exact source/revision and canonical block range, ordinary keyboard/touch/AT controls, preserved indivisible structures, bounded source access, no new recipient/privacy authority and no extra routine picker. P04/P09/P27 cover a small valid excerpt when the whole source exceeds the draft budget. F03 correctly preserves highlighted authored text without promising an unchanged caret after insertion. Neither introduces a new material data/source gap.

R17 retains the explicit independent-evidence/native-admission distinction, while R18/P20–P22 retain actual dispatch/source ordering and immutable unknown-send recovery. All 23 category outcomes, 26 clauses, 30 unexecuted release groups and five operating controls remain intact. This reviewer independently checked all **18 current-source hashes, line counts and pin bounds** in the now-present source manifest against the actual WSL worktree. The manifest contains **13 ratified-source entries and five PR records**; this subreview does not falsely claim a second live provider/PR query.

**Final verdict: Pass for the finished proposed D36 decision package. No remaining material data/source correction identified.** This supersedes the initial pending F01 disposition above without deleting its evidence. Founder ratification of the detailed amendments and the later actual implementation/release proof remain separate stages.
