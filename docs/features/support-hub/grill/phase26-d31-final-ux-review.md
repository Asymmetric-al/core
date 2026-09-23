# D31 — Independent final UX review

**13 September 2026. A selected; actual proposed package reviewed.** This is a document-level review of the finished D31 journey, not a prototype or executed product test. No root document or runtime was changed.

## Actual documents reviewed

- [D31 corrected decision and R01–R24](phase26-d31-adversarial-review.md).
- [Chooser UX blueprint](phase26-d31-ux-blueprint.md).
- [Email Studio/CRM integration](phase26-d31-email-studio-integration.md).
- [P01–P32 and operating controls](phase26-d31-proof-and-operations.md).
- [Evidence and limits](phase26-d31-evidence.md), alongside the relevant [independent UX research](phase26-d31-ux-research.md), D3-R06/R07 and D24-R05.

## Initial disposition — one interaction clarification required

### UX-F01 — Define a populated Custom form's zone-change meaning

**Material concern: Yes. Severity: High for a wrong scheduled time; likelihood: plausible without a single contract.**

R04/R06 and the Custom journey provide a per-use zone control and say it affects the candidate, but do not explicitly say whether changing that zone preserves the entered wall-clock date/time or preserves the candidate UTC instant. The two interpretations produce different follow-up times. The ambiguity is particularly significant when editing an accepted reminder with seconds/microseconds: the package correctly forbids rounding unchanged old values, while deliberate new choices are minute-granular.

This does not invalidate A or justify another mode, toggle or modal. It requires one precise interpretation shared by date/time fields, preview, command and tests. The simplest recommended interpretation is that this is a **scheduling input zone**, not a display-conversion setting: changing it in a populated Custom form preserves the displayed wall-clock fields and produces a new visibly reviewed candidate. The existing accepted reminder remains untouched until the explicit Update follow-up action. Merely opening, cancelling, changing an external preference or viewing in another zone never rewrites saved precision or instant.

**Exact proposed addition:**

> In Custom, explicitly changing the input timezone preserves the entered local date and time and re-resolves a candidate in the newly selected zone. It does not automatically write. Show the resulting exact preview before Set follow-up or Update follow-up. Treat that deliberate input-zone change as a proposed replacement and apply the declared new-choice precision consistently; the original saved instant and precision remain unchanged unless replacement is admitted. Mere display conversion, open and cancel preserve the accepted instant exactly.

The root may choose instant-preserving conversion instead, provided the final wording, labels and proof clearly establish that single behavior. No user-facing choice between both interpretations is needed. This review does not independently select a new product mode.

**Proof addition:** with populated Custom and an existing-second reminder, change between Bangkok and New York; verify the chosen wall-fields/instant rule, exact preview, minute precision only on deliberate replacement, no write before Update, Cancel preservation, DST gap/overlap handling and correct new command generation. Extend P06/P10 rather than adding a separate test framework.

The finding was sent to the root. Final disposition will be appended after the actual amendment is reread.

## Other checks — no material defect found

| Journey or concern                    | Actual package finding                                                                                                                                                                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Entry and wording**                 | Follow up is labelled alongside current work controls. Set follow-up/Change follow-up and explicit Set/Update actions communicate intent without a second product surface or forced landing.                                                                                                     |
| **Quick choices**                     | Four choices plus Custom are consistent across permitted paths. Tomorrow/+7 dates use displayed HH:mm rather than an assumed morning/Monday. Normal deliberate quick activation needs no second Save/confirmation.                                                                               |
| **Arithmetic and precision**          | Duration-target minute ceiling and calendar reference-date handling prevent the midnight skip. Exact outcomes are shown. Existing seconds/microseconds survive open/cancel; no general personal timezone owner is invented.                                                                      |
| **Timezone fallback**                 | Root's final package expressly uses the existing tenant default, visible UTC fallback plus nonblocking qualified maintainer issue, and a per-use override. This is coherent and supersedes the research's exploratory missing-zone handling. No requester/missionary location inference is used. |
| **Stable review**                     | No arbitrary preview expiry or moving target under the pointer. Aged wording becomes anchored/absolute; Refresh is deliberate. Valid future Custom candidates remain usable, while future-time validation occurs at actual admission.                                                            |
| **Fresh Custom**                      | Today's date with time unset, typed entry plus calendar, locale hints, explicit combined preview and one Set follow-up action. No hidden nine/midnight selection or natural-language parser.                                                                                                     |
| **DST correction**                    | Gaps preserve input; overlaps require explicit occurrence choice. Ambiguous quick calendar choices open Review time in the same focused surface. No stacked modal or silent correction is required.                                                                                              |
| **Edit/remove/work now**              | Conditional replacement/removal preserve accepted work rules, Remove is distinct from Open/Work now, resolved work uses the explicit reopen path, and no fake unconditional Undo is offered.                                                                                                     |
| **Concurrency and uncertain outcome** | Current reminder remains authoritative until admission, stale edits do not overwrite newer work, unknown saves reconcile the same command, and prior receipts cannot become a newer snapshot.                                                                                                    |
| **Cross-surface continuity**          | Canonical Support detail from CRM preserves draft and return context. Current dual authorization applies; there is no duplicate CRM task, Activity or due-time synchronization.                                                                                                                  |
| **Bulk and keyboard**                 | Exact selected IDs, one reviewed instant/zone and per-item admission/outcomes are explicit. Delayed items cannot be silently rebased. Shortcuts inside TipTap or other inputs cannot invoke reminder work.                                                                                       |
| **Email Studio and D24**              | Set/change/remove/due perform no send or preparation. Ordinary reply preservation and fencing the legacy outgoing-message writer are required. D24's saved patch rejects reminder presets.                                                                                                       |
| **Due recovery and observability**    | Original due and actual processing are distinct. Shared source-owned recovery handles early/stale/delayed callbacks and provider horizons without new message alerts or browser alarms.                                                                                                          |
| **Maintenance and scope**             | No personal preset settings, inheritance hierarchy, recurrence, parser, new calendar library, preview-token store, scheduler or AI timing appears. Product/shared owners maintain one fixed definition and qualify all existing entry points.                                                    |
| **Mobile/accessibility**              | Responsive single surface, reachable primary actions, typed fields, named controls, stable focus, explicit errors and no hover/color-only meaning are required. Product 44-pixel action rows are distinguished from WCAG AA minimum/spacing rules.                                               |
| **Honest proof**                      | Source/temporal reference checks are separated from real SQL/RLS/concurrency/worker/browser/assistive-technology/load/usability tests. Numeric qualification fixtures are proposed targets, not measured capacity or universal optimal timings.                                                  |

No additional broad vendor research or feature expansion is needed for this final check. P01–P32 and actual staff/assistive-technology proof remain required and unexecuted.

## Final disposition — Pass

The actual revised **R04/R07**, Custom step 4 and precision paragraph, and **P06/P10** were reread on **13 September 2026**. They now state one clear rule: Custom input-zone changes retain the entered date/time, create a newly resolved minute-granular candidate, display old/new exact values including original precision, and require explicit Set/Update before writing. Read-only conversion and opening/cancelling retain the saved instant and precision. The New York 09:00 → Bangkok 09:00 case and existing-second reminder are explicitly covered by proof. **UX-F01 is resolved.**

The affected **R09**, resolved-work and due-flow paragraphs, and **P14/P16** were also reread. They preserve the already-qualified D3 Reopen-and-remind path without introducing another compound command, and retain D7's applicable coverage evaluation after due work becomes Open. The timer itself does not choose an assignee or complete another domain's work. These clarifications introduce no unnecessary picker step or new configuration.

**Pass: no material UX, accessibility-contract, scope or interaction-complexity defect remains in the actual reviewed D31 package.** The four quick choices, exact Custom, visible tenant/UTC/per-use zone, fixed reviewed candidates, edit/remove, CRM and selected-item journeys, no-email/D24 boundary and maintenance scope are coherent. Earlier findings remain as resolved review history. This is document-level assurance only; actual browser, assistive-technology, usability, database, concurrency, worker and performance proof remains required and unexecuted.
