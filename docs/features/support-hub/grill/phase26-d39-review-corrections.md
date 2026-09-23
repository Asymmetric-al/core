# D39 — Incorporated adversarial corrections

**Current ratification — 15 September 2026:** The founder fully ratifies D39 A and all amendments, additions, adjustments, changes, updates and incorporated corrections. D1–D39 and every amendment are fully ratified. The [full ratification](phase26-d39-full-ratification.md) incorporates this entire record and supporting prose. Earlier proposed/pending/intent-only and no-Q40 wording below is historical, not a repeat approval gate. Original evidence and unexecuted-runtime limits remain unchanged.

**15 September 2026. A selected; detailed amendments proposed; D1–D38 fully ratified; no Q40.** These corrections are part of the complete [R01–R26 decision](phase26-d39-adversarial-review.md). Findings are preserved rather than hidden by the final pass. No runtime proof or implementation follows.

## F01 — Visible new activity during active composition

**Concern:** Root's first R09/P06 could be read to acknowledge newly arrived content whenever the latest region was visible, even while the worker was actively typing. The UX companion excluded composing. This ambiguity could erase a useful cue without a deliberate return to reading. **Severity/likelihood:** medium/plausible adjacent editor/reader behavior; not an observed production incident.

**Permanent correction:** R09/P06, UX07 and source/lifecycle companions explicitly suppress automatic catch-up of new arrivals during active composition, including adjacent visible content. Deliberate return to current reading/New activity can qualify the actual snapshot under an existing valid activation, never acquire a new epoch merely to undo a newer Mark unread. An inactive saved draft does not block ordinary reading. No timer, keyboard surveillance, editor mutation or additional setting is added.

**Proof:** actual simultaneous incoming-content/typing/IME/new-activity tests, with and without newer manual intent, are required by P06/P11/P20/P26. These tests remain unexecuted.

## F02 — Initialize existing source order without inventing history

**Concern:** First-eligibility atomic ordinals cannot be retroactively assigned at the historical transaction of already-committed content. A literal implementation could guess historical commit order from timestamps/IDs or leave old content without valid personal coverage. **Severity/likelihood:** high/plausible migration trap established by actual legacy source shape and PostgreSQL sequence semantics.

**Permanent correction:** R05/R23/P25 and C04/C15/L04/L15 qualify a gated, complete already-committed source baseline before personal reading is enabled. Stable control ordinals initialize under a source generation; future eligibility serializes above it. Preserve real source IDs, dates and provenance; emit no source-content, D15-attention or D17-clock event, and claim no reconstructed historic commit order. This is source-control initialization, distinct from the rejected per-user enrollment cutoff. Old unfamiliar content remains unread on demand.

**Proof:** actual restartable source baseline with simultaneous publication, privacy transitions, mixed versions and activation barrier is required by P07/P10/P25. No new database migration was executed here.

## Synthesis refinements already incorporated before integrated review

The initial strict idea of separately presenting every merged original's head was rejected as needless friction. R08/C05/C09/L06/L07/UX09 allow the exact complete authorized combined snapshot vector to catch up after its latest eligible region safely renders, without requiring all older bodies to mount. Unknown or inaccessible scope is still excluded; newly arriving content remains outside the offered cut.

R22/C12 explicitly cover gateway/trace logging as well as application analytics: successful personal reading operations do not create a durable actor/source/time viewing journal. Aggregate diagnostics and narrowly owned security evidence remain available. This closes accidental surveillance through an otherwise ordinary success logger without inventing a new service.

The independent [data review](phase26-d39-final-supabase-review.md), [lifecycle review](phase26-d39-final-lifecycle-review.md) and [UX review](phase26-d39-final-ux-review.md) record their actual reviewed versions and final outcomes. Their pass is a documentary/protocol review, not DB/RLS/browser/AT proof.
