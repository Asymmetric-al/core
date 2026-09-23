# D39 — Independent integrated UX and reader review

**Current ratification — 15 September 2026:** The founder fully ratifies D39 A and all amendments, additions, adjustments, changes, updates and incorporated corrections. D1–D39 and every amendment are fully ratified. The [full ratification](phase26-d39-full-ratification.md) incorporates this entire record and supporting prose. Earlier proposed/pending/intent-only and no-Q40 wording below is historical, not a repeat approval gate. Original evidence and unexecuted-runtime limits remain unchanged.

**15 September 2026. Final verdict: Pass for the reviewed documentary UX/reader contract.** F01 was corrected and rechecked across the actual integrated R01–R26, all 23 category rows, P01–P30/O01–O05, C01–C16, L01–L16 and UX01–UX14. The initial finding and initial hashes are preserved below; the final resolution and current reviewed hashes supersede the initial pending verdict. D39 A is selected; amendments remain proposed, D1–D38 remain ratified, and no Q40 or implementation is authorized.

## F01 (UX) — Active writing versus an inactive draft must be explicit

**Material ambiguity; Medium severity / plausible likelihood.** R09 says new content remains unread when someone is “composing away from the latest region,” then permits new content at the selected latest region to qualify. P06 combines a retained draft and older-history reading. UX07 says content arriving while composing remains unread. An implementer could therefore automatically clear a new contribution while the person is typing or in IME composition merely because the message appears beside the editor. Conversely, a literal reading of “keep a draft” could incorrectly block normal acknowledgment whenever an inactive draft exists.

This changes the clarity of A's trigger, not personal ownership or the source model. It matters because the interface must preserve the person's current task and avoid hiding a newly arrived message while they are actively authoring. Existing draft presence is not evidence of active writing, and Tiptap events must not become positive reading evidence. The current documents, rather than an observed live failure, establish the ambiguity.

**Exact recommended clarification:** “A new contribution arriving while the Reply or Note editor is actively being used for writing or IME composition remains unread even when the latest message region is visible. It can qualify when the person deliberately returns to current reading, including New activity, or explicitly uses Mark read. Merely retaining an inactive draft does not block normal qualified viewing. Returning from the composer does not mint a new deliberate-open epoch that overrides a prior Mark unread; R11 still applies.”

Add the distinction to R09 and P06, and reconcile L06/UX07 (and any C05 latest-region explanation) to the same rule. P06 should test active writing with latest content visible, inactive saved/dirty draft while actually reading, deliberate New activity return, and a manual-unread override already present. No dwell timer, keystroke history, shared composing dependency, new setting or lock is needed. Parent owns the final wording and root-file changes.

## Checks that passed in the initial integrated document

| Area                           | Review result                                                                                                                                                                                                                                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ordinary one-open catch-up     | R07–R08, C05/C09, L06/L07 and UX09 consistently permit a complete authorized combined snapshot vector to be acknowledged from its latest eligible region. Older original bodies may be folded, paginated or offscreen. They do not require per-original viewport chores. Narrow/missing/unproved scope is not guessed into coverage.     |
| Failed rendering               | R15/P19 and UX04 distinguish safe successful content, valid bodyless/file-only content, invalid schema, failed render and restricted/unavailable content. The actual four fixtures prove only the empty-wrapper ambiguity, exactly as the integrated evidence says. A download or full attachment inspection is not required or claimed. |
| Manual revisit intent          | R11/P11, C07/C08, L09/L10 and UX06 preserve Mark unread through the existing activation, old tabs, refresh/focus and delayed acknowledgments; explicit current Mark read or a new deliberate open can clear it. Stale response recovery does not blindly reapply an old intention under a new epoch.                                     |
| Simple controls                | R10/P26 and UX01/UX06 use contextual labelled menu actions, no routine confirmation, count/filter catalogue, timing hierarchy or hover-only tiny-dot toggle. D33 Reading remains a separate presentation control.                                                                                                                        |
| New activity and position      | R09/P06/UX07 require stable anchors, caret/selection/IME and row position. New activity is deliberate and preserves both draft modes. F01 above resolves the remaining active-writing qualification.                                                                                                                                     |
| Tiptap boundary                | R15/P20 and UX11–UX13 use shared static rendering and profile qualification. Editor update/focus/hydration, read-state invalidation and conversation refresh do not change canonical draft JSON or remount/replace the editor. No new collaboration/Pro/AI/editor service is selected.                                                   |
| Baseline and authorship        | R02–R04/P02/P03 preserve honest old/new-access unread, no automatic self-only/empty cue, allowed own-content deliberate revisit, no fabricated activation history and no mailbox-email identity matching. Delivery changes do not create a second contribution.                                                                          |
| Source and privacy             | Exact original vectors, permissions, source ordering and personal epochs are independently owned. No teammate roster, manager reading dashboard, raw hidden cutoff disclosure or normal successful viewing history stream is introduced.                                                                                                 |
| CRM/Email Studio/P17/P6        | R18–R19/P21/P22 and companions preserve the same authorized Support reader through CRM, source/current-domain permissions, distinct notification click engagement, no blanket P17 read/archive, no preparation/send/pixel/provider synchronization and no CRM Activity/body copy.                                                        |
| Accessibility and proof limits | P26 requires real keyboard/AT/touch/IME/reflow/zoom/localization tasks. P28 calls its five-person floor a formative judgment, not statistical evidence; no invented study results or perfect-UX claim. All 30 runtime groups remain unexecuted; actual four-fixture evidence remains narrower.                                           |
| Monitoring                     | O01–O05 provide signal, threshold, owner and response while keeping false Read, privacy leaks, authorization/order failures and lost manual intent as blockers/containment events. Personal history analytics are excluded.                                                                                                              |
| Stage and traceability         | A remains selected with proposed amendments; D1–D38 ratification and no Q40/formalization/runtime authority are explicit. Fresh HubSpot evidence in the research records September 7, 2026 rather than claiming the historical Q39 date is today's page revision.                                                                        |

## Initial reviewed file hashes

SHA-256 over actual local files; parent formatting or corrections require a refreshed final stamp.

| File under outputs/                     | SHA-256                                                          |
| --------------------------------------- | ---------------------------------------------------------------- |
| phase26-d39-adversarial-review.md       | beb0328f108c3056861451de05bcfb96b52f9bb816cc822c180ea78882d7e6a8 |
| phase26-d39-proof-and-operations.md     | 4c4ea1e9c237127084ff5d03a051612f0d13212acf623e6fb1ec266bdc733203 |
| phase26-d39-supabase-contract.md        | 4d8f235995570fc39381fa552c40032dedaf4be43cd5600b9603a0a7cfb4b26f |
| phase26-d39-lifecycle-seam-review.md    | 6bcdd26bf5dd87073479bb5a3607468e67b203129d58868edd5d6749ee61afca |
| phase26-d39-reader-tiptap-contract.md   | c0e1f64e9b4a3bd86d846015d733d507d87c172e8b4b286c951d3927ffdf31f6 |
| phase26-d39-ux-research.md              | 672108844e9a60265e717218680b86eec495022aa6b3422bbf8eadc9d5d0ecaf |
| phase26-d39-reader-probe.json           | 4bde929dd6a05d7df282e5b30034617b5a38742103bd80e85121d30bff2f920d |
| phase26-d39-reader-source-evidence.json | c0835fcceb3273f517d26f649f1b9cbf692410a72b2a7d998b32b70b68ce16c7 |

No root document, product source, database or provider state was changed by this review. The concrete initial clarification was sent to the parent and then reconciled as recorded below.

## Final resolution and recheck

**F01 resolved.** R09 and P06 now explicitly keep new activity unread during active writing/IME even when the latest region is visible. They distinguish inactive drafts, preserve deliberate return/New activity, and prohibit a new activation epoch that bypasses a later manual-unread intent. C05, L06/trace/acceptance9 and UX07/acceptance7 agree. No timer, new preference, editor mutation, keystroke log or second composing-presence owner was introduced.

The independent F02 migration correction was also read: R05/R23/P25, C04/C15 and L04/L15 permit a complete gated already-committed **source-control** baseline without inventing historical commit order or personal Read, changing source dates/provenance, or emitting D15/D17 events. This is compatible with UX02's old-history Unread meaning and introduces no extra staff journey. R22 now explicitly covers normal successful manual/view operations and gateway/tracing paths alongside automatic acknowledgments; it preserves aggregate technical metrics and narrow existing security evidence without an employee viewing journal.

The final integrated documents retain ordinary one-open combined catch-up, current safe-render qualification, source-aware cutoffs, sticky manual-unread intent, no forced per-original scroll, no draft loss, truthful failure, accessible simple controls and the exact CRM/Email Studio/P17/P6 seams. **No further material UX/reader inconsistency was found.**

This Pass evaluates the documented proposed contract and source/probe claim accuracy. It does not ratify the amendments for the founder, implement the feature, prove DB/RLS/Realtime permissions, run a browser/AT journey or establish perfect UX. The four actual unchanged-component fixtures remain the only executed D39 reader probe; all 30 integrated runtime release groups remain unexecuted and required.

## Final reviewed hashes

| File under outputs/                     | SHA-256                                                          |
| --------------------------------------- | ---------------------------------------------------------------- |
| phase26-d39-adversarial-review.md       | 21ea74deebd64a7873c6575883265febecfcb69801b27be5e195ba956b06b37b |
| phase26-d39-proof-and-operations.md     | 5ee4e8441127e477f5428a4ee16cb4aec4aed8b21444ec78a34030715ebb3808 |
| phase26-d39-supabase-contract.md        | c8acf83ba81dbfdc10b3d5cc23f2fb084337e0098118590e20a9bd7d58a27675 |
| phase26-d39-lifecycle-seam-review.md    | e9c58c188f410d0adcc40bd84d6c0718984630dfe13c1cab487234ce4592eab4 |
| phase26-d39-reader-tiptap-contract.md   | 933079578f8bf1781e3499bec6a8ab3a8ff6775c7e24d8995f544a97a3656b49 |
| phase26-d39-ux-research.md              | 672108844e9a60265e717218680b86eec495022aa6b3422bbf8eadc9d5d0ecaf |
| phase26-d39-reader-probe.json           | 4bde929dd6a05d7df282e5b30034617b5a38742103bd80e85121d30bff2f920d |
| phase26-d39-reader-source-evidence.json | c0835fcceb3273f517d26f649f1b9cbf692410a72b2a7d998b32b70b68ce16c7 |
| phase26-d39-review-corrections.md       | 0ded9a0999c75d7c8d8db4bfb261a86e02d1eba2d635cd9cf0becb76b5e34800 |
