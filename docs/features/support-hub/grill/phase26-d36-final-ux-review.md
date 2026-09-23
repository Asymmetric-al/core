# D36 — Independent final UX and evidence review

**14 September 2026. Initial disposition: changes required before documentary pass.** Independently read the actual completed adversarial review, UX blueprint, proof/operations record and evidence register. The founder-selected A remains sound. Two material precision gaps and one small contradictory acceptance statement require correction; none requires replacing the product decision or adding an enterprise quotation product.

This is a review of the actual documentary contract, not a runtime/browser test of an implemented Asym feature. The earlier vendor research independently included primary-source verification and public official visual inspection. The root's pending source-evidence JSON is not treated as a finding by itself.

## Initial actual-file baseline

| File                                | SHA-256 at review                                                |
| ----------------------------------- | ---------------------------------------------------------------- |
| phase26-d36-adversarial-review.md   | 7d52c5052f73b7c858fd950c7f14f14c99880123f3a71aaa292e2a575a951aac |
| phase26-d36-ux-blueprint.md         | 9449a199a09846b196a01718b9b13d66922e025317fdd0f4303691ef69c1b577 |
| phase26-d36-proof-and-operations.md | 01d1a59b8c99d2742f2f8388416aa18cd0cd1bd615a0cc7c8f8009b84f975bf3 |
| phase26-d36-evidence.md             | 3d2f1231c3a5824c24f940042120a38697e923f16459e0e494a363b1241f5156 |

## Required corrections

### UX-F01 — Edited attribution compares text but allows meaningful non-text edits

**Material concern: yes. Severity: medium; likelihood: plausible under normal link editing.** R05 and the UX blueprint say any normalized text change yields Edited excerpt, while formatting-only changes do not. The same contract permits safe links and supported rich structure. P06 tests trim/rewrite but not a changed link destination with unchanged visible text, nor a meaningful structural change that leaves flattened text the same.

**Counterexample:** the source contains `View the receipt` linked to one permitted URL. Staff changes that hyperlink to another permitted URL while preserving the display text. The source-derived body changed substantively, but normalized text equality can retain an unedited Excerpt label. Similar ambiguity arises if a table/list relationship changes while flattened text stays equal. Safe URL syntax does not mean the source author provided that URL.

**Why it matters:** the contract promises truthful recipient-visible attribution. A string-only test makes that promise false for content the editor explicitly allows. This narrows the equality rule; it does not justify a semantic AI classifier, revision diff interface or extra editing ceremony.

**Exact proposed amendment to R05 and the blueprint:**

> Compare the current quote with its inserted qualified snapshot over the admitted canonical meaning-bearing content: text, order, supported structural relationships and link destinations. Any change to that content produces Edited excerpt in the composer and outgoing HTML/plain text. Purely presentational marks may be excluded by the code-owned profile. Unknown or unclassified changes conservatively count as edited. Exact eligible Undo may restore the initial label. This is a deterministic canonical comparison, not an AI or natural-language meaning classifier.

**Proof amendment P06:** include equal-visible-text/different-safe-URL, changed table/list structure, purely presentational formatting and exact Undo counterexamples. Require identical edited attribution in HTML and plain output. Propagate this corrected rule into the editor seam document wherever it currently says text-only equality.

### UX-F02 — The accessible fallback cannot work when the whole message exceeds the insertion limit

**Material concern: yes. Severity: medium; likelihood: plausible for long/nested messages and assistive-technology selections.** R03 calls Quote message followed by ordinary trimming the always-available accessible fallback. R22 and the blueprint correctly reject an over-budget whole-message insertion without truncation, then offer a smaller selected excerpt. P04 promises a keyboard/touch fallback without text selection; P09 promises smaller-excerpt recovery. Combined, these promises leave no usable fallback when the whole body is too large and selection cannot be reliably mapped.

**Counterexample:** an authorized staff user reads a long email, needs one paragraph, and their assistive-technology/browser selection cannot provide a qualified range. Whole-message insertion is rejected by the shared budget. Repeating “quote the message and trim it” cannot succeed, and copying arbitrary text would lose the managed source contract.

**Why it matters:** this is a direct hole in the promised low-friction and accessible journey, not a preference for a different UI. The normal one-action Add quote should remain unchanged.

**Exact proposed amendment to R03/R22 and the blueprint:**

> Quote message followed by normal trimming is the non-selection fallback when the whole qualified projection fits the draft limits. For a larger readable source, provide an accessible, source-bound bounded excerpt path in the existing source reader, with keyboard/touch/assistive-technology support and verified canonical range identity. The routine Add quote remains one action; this exceptional excerpt path must not become a mandatory wizard. If a particular source cannot support any safe bounded excerpt, state that limitation honestly and preserve the ordinary reply; do not claim that quoting is always available.

**Proof amendment P04/P09/P27:** include a whole projection above the draft limit, a small eligible paragraph, and unavailable/unmappable native selection. Demonstrate the equivalent accessible excerpt path, no silent truncation/widening, no arbitrary clipboard authority, preserved answer and normal Send after deliberate cancel. The implementation detail may stay inside the existing reader/profile; this finding does not require a second content editor or a general range-builder.

**Refined minimal route reviewed with the root:** **Choose excerpt → choose one permitted semantic block → optionally Extend through here → Add excerpt**. A single paragraph is immediately a complete one-block selection. Visible controls work with keyboard/touch/assistive technology, rather than requiring Shift-drag. Show the selected range/count before addition; server qualification uses the exact source/revision/block identities. Preserve indivisible table/list structure where splitting would lose relationships. An individually oversized or unsupported semantic block has an honest limitation and ordinary-reply path; there is no claim that every malformed source can produce a safe quote. This exceptional mode reuses the source reader and does not alter routine one-action Add quote.

### UX-F03 — P02 says the selection stays unchanged while the UX moves the caret

**Material concern: minor specification contradiction; severity: low; likelihood: certain if “selection” is tested literally.** P02 says existing answer, selection, signature, recipients and files are unchanged. The blueprint deliberately places the caret after the inserted block when the worker stayed in context. Both cannot be strict literal acceptance requirements.

**Exact correction:** replace “Existing answer, selection, signature, recipients and files are unchanged” with “Existing answer text, including any highlighted text, signature, recipients and files are not replaced or altered; caret and focus follow the documented insertion behavior.” This preserves the important no-overwrite invariant without freezing the pre-insertion Selection object.

## Checks that passed in the initial package

1. **All 23 categories are explicit.** The review contains independently labelled rows, material yes/no conclusions, failure/importance, qualitative severity/likelihood, evidence, decision effect and permanent clause/proof references. The last category correctly says no additional concern and lists what was checked. No category was silently skipped.
2. **Canonical ordinary case is complete.** No automatic quote appears in a fresh reply. Add quote is visibly labelled by the exact reply context, inserts without a mandatory picker/modal, and does not compete with Send. Per-message Quote message is distinct from Reply/Reply-all/retargeting. No arbitrary one-quote cap or transcript builder was introduced.
3. **Normal editing is appropriately simple.** The ordinary shared Reply editor supports trim/edit/remove/Undo with protected source identity. Edited excerpt is a reasonable deterministic honesty convention once UX-F01 closes its equality gap. No reason form, specialist editor, diff viewer or duplicate approval was added.
4. **Recipient/source changes are proportional.** Actual expansion/material identity changes receive one inline review and current server authorization; existing exact D2 review may satisfy it. Simple removal does not automatically add an extra prompt. Quotes never add recipients, and one original email thread remains distinct from merged staff handling history.
5. **The loading and recovery journey is honest.** Typing continues while extraction runs. Cancel and navigation fence late results. Send cannot silently omit an intended pending quote. Unrelated plain replies do not depend on optional extraction availability. Known/unknown draft and send outcomes remain distinct.
6. **Email Studio and CRM roles are coherent.** Support owns source/audience admission and draft provenance, P17 prepares the whole reviewed message, P6 handles immutable dispatch/reconciliation. Quoting does not create CRM identity, Activity, giving action, note history or a second mailer. Reader folding and provider templates cannot append concealed history.
7. **Nested content and files are addressed.** The package does not claim a selected source contains only newly authored words. It refuses silent truncation, heuristic stripping, hidden header reconstruction, remote loads and historical file acquisition. Media-only sources do not produce fake meaningful success.
8. **Evidence claims are disciplined.** Actual public Zoho and Teamwork visual observations are qualified as depicted layout, not live vendor security or Asym usability proof. Teamwork's old screenshot is identified as old. Kustomer browser verification is correctly distinguished from parser failure. HubSpot's commercial Quotes insertion is not used as message-quotation evidence. The finite source serializer probe is called a counterexample, not a deployed exploit or completed D36 test.
9. **External applicability is proportionate.** The root draws directly on its linked independent vendor review, does not claim industry unanimity, and distinguishes AI-specific, historical and self-selected feedback. Nonprofit workflow illustrations do not become observed ministry facts.
10. **Base UI/Maia and accessibility are specific.** Exact approved system remains required; typography, logical borders, focus/caret, contrast, RTL/Thai, 320CSS-pixel reflow, zoom, IME, touch and AT are in the contract. The proposed 44CSS-pixel touch target is not mislabeled as the WCAG AA minimum.
11. **Proof and operations do not claim execution.** All 30 release groups are explicitly unexecuted. Shared numeric budgets are release qualification, not invented measured facts. The small five-participant study is honestly a formative floor, not statistical proof. O01–O05 have signals, thresholds, accountable release roles and responses; those roles must become named teams/on-call assignments before activation.
12. **No unrelated scope was added.** No new CRM, source library, AI product, public guidance, helpdesk integration, quotation policy hierarchy, pipeline, private inbox access, actual message or implementation appears in this review package.

## Review conclusion

**Accept with required amendments remains the right product disposition.** Apply UX-F01 and UX-F02 and the small P02 wording correction, then reread the changed actual artifacts for documentary pass. These changes strengthen truthful content attribution and accessible recovery without changing the selected default, normal one-action insertion, existing editor, CRM seam or Email Studio ownership.

No Asym runtime, browser/AT, RLS, migration, concurrency or real-send proof was performed by this final documentary review.

## Final actual-file verification — Pass

**14 September 2026. Final documentary disposition: Pass.** Re-read the changed actual R03/R05 clauses, complete relevant UX sections, P02/P04/P06/P09/P27, editor ES03 and the correction register. The changes are present in the artifacts, not merely promised in a message.

- **UX-F01 resolved:** R05, the blueprint, P06 and ES03 now compare meaning-bearing canonical content, including link destinations and meaningful structural relationships. Only qualified presentation-only changes are exempt. A changed href with identical anchor text is an explicit counterexample; exact semantic Undo has the correct behavior. No AI meaning classifier or specialist edit UI was added.
- **UX-F02 resolved:** R03 and the blueprint now include **Choose excerpt → Start here → optional Extend through here → Add excerpt/Cancel** within the existing source reader. The one-block case is immediately addable. Exact source/revision/range, bounded loading, accessible controls, indivisible structures and truthful unsupported/over-budget cases are specified. P04/P09/P27 explicitly cover a small paragraph from an over-budget whole body when browser precision selection is unavailable. The remaining blueprint sentence now conditions whole-message-and-trim on fitting limits. Routine Add quote remains one action without a picker.
- **UX-F03 resolved:** P02 now protects authored/highlighted text from replacement while allowing the documented caret/focus behavior.

Recounted the actual package: **26 clauses, 23 category outcomes, 30 required/unexecuted runtime proof groups and five operating controls**. The source-evidence register now exists. The selected intent versus proposed amendments and unimplemented behavior remains clear. The earlier successful checks on source applicability, visual inspection qualifications, Base UI/Maia, CRM/Email Studio/P6 ownership and scope still hold. No further material UX or evidence contradiction was found in this bounded re-review.

| File                                | SHA-256 at final verification, before later deterministic formatting/mirroring |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| phase26-d36-adversarial-review.md   | 36375e96b6da59f1db9038a47c8d11497edff29db9b46f9767d42c6f499d1fc8               |
| phase26-d36-ux-blueprint.md         | 82ce935d7d5e35161e129b3fd7c9907f360ed607e28ecb60be8bd70614017590               |
| phase26-d36-proof-and-operations.md | a8d91e0cf6648339a82d6813b7a69aee17466fe5477bc1682260d3d975b8b0af               |
| phase26-d36-evidence.md             | 3d2f1231c3a5824c24f940042120a38697e923f16459e0e494a363b1241f5156               |
| phase26-d36-editor-seam-review.md   | 32c1826974ea23b60ac552407cc597a71a0b61bfcf2ba6f67cdbc56e05fc326c               |

This pass closes the independent documentary review. It does not ratify the founder's unpresented amendments, declare the eventual UI perfect, or execute any of the 30 runtime release groups. Product disposition remains **Accept with required amendments**, with those amendments now coherently documented.
