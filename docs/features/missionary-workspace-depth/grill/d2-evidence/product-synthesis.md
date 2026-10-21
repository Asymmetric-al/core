# D2 — ordinary CRM sharing with optional follow-up notification

Independent research synthesis, 2026-10-15 America/Los_Angeles. No application, live data, tracker, canonical specification or root session file was edited by this workstream.

**Recommended disposition: Accept with required amendments.** The founder chose a simpler product than the prior recommendation: Share makes the contact generally available to staff in the organization's CRM; optionally notify someone for follow-up. The choice rejects a per-prospect collaborator-permission product. Preserve that simplification. Existing source safety, privacy and action boundaries still apply; this is not permission to make every field available to every person carrying a staff label.

This is proposed decision wording and adversarial evidence, not a formal Phase 28 specification or approval of a new P9 producer. The latest D2 choice and subsequent answer explicitly choosing staff to notify (rather than an all-staff alert) were supplied by the parent agent; the inspected session still contains the earlier unanswered Q2 and is a dated input to reconcile.

## What was selected, what is judgment, what remains open

| Status                        | Meaning                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder-selected D2 direction | A single deliberate Share brings the reviewed contact into ordinary organization CRM availability. There is no contact-by-contact collaborator audience to maintain. The missionary may choose staff to notify for follow-up; the notification is optional and does not alert all staff.                                                                                                                             |
| Inherited constraints         | One native source of CRM truth; current tenant/source/field permissions; P10 strictest-applicable safety; P4/P9 identity resolution and correction; P27 separate cultivation/task/history meanings; private-note non-republication; truthful save/retry outcomes.                                                                                                                                                    |
| Engineering recommendation    | Reuse the existing contact/record shell and owner commands, combine qualified admission/reuse with one understandable Share where possible, show one ordinary audience description, and reuse an existing optional staff-notification mechanism. In-app only and off by default are recommended scope/defaults, not additional founder answers. No new permission, watcher, recipient-group or scheduling framework. |
| Not selected                  | Universal new staff read/edit/export powers; disclosure of protected identity/care/finance/private history; notification channel, repeated subscriptions or mandatory broadcast; task assignment/SLA; automatic ongoing publication of later private edits; irreversible sharing or a new Unshare product; retention/departure rights; a physical P9 storage layout.                                                 |

Do not relabel the rejected collaborator option as a hidden prerequisite. A normal permission check is not a collaborator product. Conversely, a broad staff role check does not replace the existing current source decision.

## Exact candidate D2 wording

> **D2 — Share into the organization's ordinary CRM.** When an authorized missionary deliberately shares a prospect, the reviewed contact information becomes available in the organization's normal staff CRM, using its existing contact access and safety rules. The missionary does not choose or maintain a separate collaborator list for that contact. Eligible staff can discover and use the same source-backed contact through ordinary CRM paths; sharing is not just a notification or another private list.
>
> “Staff” means the organization's staff acting through current CRM authority. Sharing does not bypass restricted-identity, field, care, finance, consent, export or other source boundaries, grant staff membership, or give another missionary broad CRM access. Existing independently authorized facts remain governed by their owners. The exact qualified create/reuse/correction outcome must not duplicate, overwrite or expose a hidden person merely because a name or address matches.
>
> Share includes only the reviewed eligible contact facts. Earlier private notes, private history and unrelated source records do not become shared content. It does not enroll cultivation, change responsibility, create a task or gift, subscribe a supporter, contact the supporter or publish publicly.
>
> The missionary may optionally choose eligible staff to notify for follow-up, rather than alerting all staff. That choice draws attention; it does not set who can access the contact or assign work by itself. Sharing remains a distinct source outcome from notification acceptance, delivery and any later staff action. A notification failure cannot undo a successful Share or justify repeating it with a new identity.
>
> D2 does not select an irreversible publication policy, an Unshare mechanism, future automatic sharing, a retention period or new exceptional/successor access. Existing source restriction/correction duties remain available under their own authority, and already delivered information cannot be promised recalled. Any additional lifecycle rule requires its own explicit decision.

The source qualification may allow one contextual command to perform the exact reviewed canonical admission/reuse and sharing effects. “Distinct meanings” does not require two buttons, duplicate data entry or a second confirmation ceremony. The owner contracts must identify the accepted facts and effects; a provisional preparation entry appearing in a special staff panel alone does not meet ordinary CRM availability.

## Authority and evidence inspected

| Source                                                             | Sections actually inspected for this pass                                                                                               | Classification / consequence                                                                                                                                                                                                         |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `phase28-session.md`                                               | D1/E1 register, original Q1, current unanswered Q2 and coverage/conflict register                                                       | Research/decision record. D2 supersedes the earlier collaborator recommendation and unanswered audience status; it does not erase D1's private starting state.                                                                       |
| `phase28-d1-adversarial-review.md`                                 | Corrected D1 and separate engineering recommendation, carried from immediately preceding review                                         | D1 selected ordinary privacy; P9 bounded preparation remains a recommendation, not a ratified canonical-admission implementation.                                                                                                    |
| `docs/adr/0211-distinct-human-approval-for-projection-widening.md` | Entire ADR                                                                                                                              | Accepted policy-change control. It explicitly is not a generalized approval requirement on every edit.                                                                                                                               |
| `phase-27-donor-development/owner-reconciliation.md`               | P9/P3/P12/P28 D26; role-aware assignments; P27/P28/P34 Request/appeal meaning                                                           | New shared context and current/historical permissions are separate. Once its source/policy is qualified, ordinary eligible updates do not require supervisory policy approval. Private notes cannot be republished.                  |
| `phase-27-donor-development/partnerships.md`                       | REQ27-P05 responsibility and acceptance; previously inspected P01–P03 admission/reuse                                                   | Responsibility, task ownership and access remain distinct. Unknown eligible assignee is not resolved by choosing an admin or first row.                                                                                              |
| `phase-27-donor-development/proof.md`                              | REQ27-Q09/Q10                                                                                                                           | Clear single Save for ordinary action; material disclosure explained before commitment; source-owned correction/retention and accessible recovery.                                                                                   |
| `phase-09-full-crm-depth-relationship-graph.md`                    | Architecture overview items 3–9; negative stories 32–34 and developer stories 35–39                                                     | Derived staff labels are not authority; ordinary CRM shell/search/writes/export retain existing owners; missionary cannot browse broad staff records.                                                                                |
| `phase-10-sensitive-data-safety.md`                                | A1–A8 and source safety/identity-access descriptions                                                                                    | Person publication sensitivity and field need-to-know compose with strictest-applicable rules; ordinary staff operate only on entitled facts; clearance is independently scoped. No source date is used as current deployment proof. |
| `roadmap.md`                                                       | P28 coverage, ownership, implementation, guardrails, acceptance and open decisions                                                      | Shared relationship work belongs in the native CRM; privacy and anonymous protections include notification/export derivatives.                                                                                                       |
| Platform Product Intent / Platform Principles                      | Administrative Foundation; Administrative Foundation With Surface-Appropriate Simplicity, plus previously inspected one-platform intent | Useful staff continuity with a simple missionary action is aligned. Admin-first does not override permission or safety.                                                                                                              |

No fresh competitor, user interview, runtime, notification-provider or performance study was performed. D1's probe is still only PostgreSQL mechanics evidence and supplies no D2 application qualification.

## Material concerns, with exact proposed fixes

Likelihood is conditional on the shortcut named, not a measured incident rate. Category numbers refer to the user's 22-category review scheme. Each concern gives the practical impact, evidence and answer disposition rather than manufacturing a new subsystem.

### D2-PS01 — ‘Any staff’ could become a universal grant

**Categories:** 5–7, 10, 15. **Severity:** High. **Likelihood:** Likely if implemented as a staff Boolean or unrestricted tenant-wide data export.

**Concern and why:** The chosen ordinary audience is broad, but protected identity, care/finance fields, contact restrictions and independent action capabilities do not become ordinary merely because Share was clicked. Replacing current source authority with `isStaff` would turn a simple user experience into an unsafe permission shortcut. Restricting sharing back to a custom group of selected relationship workers would instead silently undo the founder's choice.

**Evidence:** P9 architecture item 3; P10 A1/A6/A7; P27 D26; D2 summary versus prior Q2.

**Impact on answer:** Keep the broad ordinary CRM destination, explicitly subject to the normal source floor. If the founder later means access for staff who currently lack ordinary CRM access, that is a separate P12 policy amendment, not inferred here.

**Permanent fix:** Use the existing ordinary CRM access path and its subtractive field/record restrictions; do not add recipient ACLs or broad bypasses.

**Exact clause:** “Share uses the organization's ordinary staff CRM audience and existing current source permissions. It creates no custom collaborator list and no new universal staff capability; stricter protected-record/field, action and export limits remain in force.”

### D2-PS02 — Share might publish the entire private preparation

**Categories:** 4, 5, 10, 14, 15. **Severity:** High. **Likelihood:** Possible with a single `shared=true` flag on mixed contact/notes/history storage.

**Concern and why:** The user said the contact becomes available. That does not authorize republication of personal planning, private narrative, protected history, attachments or independently sourced facts. A one-flag implementation may change all their readers, and a separately typed summary can still launder private history if copied from it.

**Evidence:** Selected D1 boundaries; P27 D26 explicit prohibition on copied/imported/quoted/summarized private content; current Q2 excludes earlier private notes.

**Impact:** Preserve D2; the precise eligible contact disclosure is reviewed and source-qualified. Do not ask the founder to rebuild a field-by-field ACL product.

**Permanent fix:** Define one bounded source-owned contact disclosure contract and show understandable facts/consequences, with private material outside that admission. Qualify disclosure and original private access separately.

**Exact clause:** “Share admits only the reviewed eligible contact facts to ordinary CRM use. It does not relabel, copy or summarize earlier private notes/history or change their audience. The Share review must make the actual disclosed facts understandable without turning routine use into permission configuration.”

### D2-PS03 — Ordinary CRM availability may be replaced by a fake shared staging list

**Categories:** 1, 2, 3, 10, 11, 19. **Severity:** High for false product state or duplicate identity. **Likelihood:** Possible while the D1 P9 producer/admission contract is not qualified.

**Concern and why:** A notice with a link or a staff-readable preparation card is not necessarily a usable ordinary contact. Keeping parallel staff/preparation contacts would also perpetuate two person records. The opposite shortcut—upserting on email or revealing hidden matches—corrupts identity or discloses protected records.

**Evidence:** P9 record shell/search/write ownership; P27 P02/P03 canonical reuse and hidden result rules; D1 engineering recommendation remains unratified.

**Impact:** D2 requires an exact source-qualified CRM outcome. It need not impose two user actions; the input/admission distinction is semantic, not a compulsory wizard.

**Permanent fix:** The owner identifies one qualified canonical create/reuse/correction or other accepted ordinary contact outcome, with explicit unresolved outcomes and retained private preparation. Do not decide physical storage in this research note.

**Exact clause:** “Successful Share means the permitted contact is available through ordinary source-backed CRM discovery and detail, not merely that a notification or staging record exists. Use the qualified identity/contact owner to accept or reuse the exact record without duplicate entry, hidden-match disclosure or unreviewed overwrite. A blocked admission leaves the private preparation and its truthful state intact.”

### D2-PS04 — An optional notification could recreate collaborator permissions

**Categories:** 3, 8, 9, 11, 17. **Severity:** Medium–High. **Likelihood:** Likely if recipient selection is reused as sharing audience or subscription management.

**Concern and why:** A recipient picker could accidentally decide who sees the contact, require a team configuration screen, create a watcher list or keep sending updates indefinitely. That reintroduces the rejected product in a different UI. The opposite shortcut—broadcast to every staff member—is also not what optional follow-up notification establishes.

**Evidence:** The founder's request for simpler ordinary CRM availability; prior Q2's selected collaborator recommendation was explicitly displaced; P27 assignment/access separation.

**Impact:** Keep notification optional and subordinate to Share. Exact existing supported recipient/channel behavior is engineering qualification; do not invent a mandatory contact-by-contact audience setup.

**Permanent fix:** Reuse a minimal existing eligible staff-recipient control only when notification is deliberately requested. No independent notification groups, watchers, scheduling or subscriptions are needed to deliver D2.

**Exact clause:** “Notification selection controls attention only. Sharing audience is unchanged whether notification is omitted, requested or unavailable. Reuse a bounded existing eligible staff-recipient mechanism; no new collaborator permissions, per-contact audience administration, standing watcher subscription or automatic all-staff broadcast is introduced.”

### D2-PS05 — ‘For follow-up’ might silently assign mandatory work

**Categories:** 4, 5, 10, 11, 17, 18. **Severity:** High for false accountability; Medium for noise. **Likelihood:** Possible if the notification action creates a shared task or changes representative automatically.

**Concern and why:** A notification can say someone should look, but delivery is neither acceptance of responsibility nor completed follow-up. Auto-creating an assigned task, deadline, escalation or compulsory reply would add an operational product the founder did not choose. Allowing notification to a person without current source access would also create a leak or an unhelpful dead end.

**Evidence:** P27 P05 task/partnership/Party responsibility separation; D26 no involuntary management or logging; ordinary notification is explicitly optional.

**Impact:** Preserve the optional nudge. If a deliberate actual task is desired later, use P9's qualified shared-task action, with its own meaning—not a concealed send side effect.

**Permanent fix:** Distinguish shared, notification admitted/delivered and actual source task/response. Revalidate recipient eligibility; do not grant access to make a notification work.

**Exact clause:** “An optional follow-up notification does not assign responsibility, create a task/deadline, enroll cultivation, prove reading or record a completed exchange. An actual task or assignment requires its own deliberately included qualified source action. Recipient eligibility and content disclosure are checked independently; notification never grants missing access.”

### D2-PS06 — Share and notification failures could become one misleading result

**Categories:** 2, 12, 13, 18, 21. **Severity:** High for duplicate identity/effects; Medium for confusing recovery. **Likelihood:** Plausible under ordinary response loss or notification outages.

**Concern and why:** A successfully shared contact can appear “Share failed” if its optional notice fails. Repeating Share under a new operation may duplicate admission, history or notifications. Conversely, a successful notification acknowledgement does not prove source sharing or staff receipt.

**Evidence:** D1 accepted save/recovery safeguards; P27 Q09; existing permanent source-effect identity principles; no D2 runtime proof obtained.

**Impact:** Keep both requested capabilities and truthful partial results. Notification cannot become a blanket blocker on ordinary shared CRM use.

**Permanent fix:** Keep separate source/notification outcomes and stable operation identities. The owning command preserves any required accepted notification intent under its actual qualified transaction/execution contract. No new scheduler or delivery ledger.

**Exact clause:** “A successful Share remains successful when an optional notification is unavailable or fails. Show and recover each outcome honestly using its original accepted identity. Unknown source acceptance is reconciled before repeating; a notification receipt is not proof of contact admission, delivery, reading or follow-up.”

### D2-PS07 — Simplicity may be defeated by universal approval or configuration

**Categories:** 1, 8, 9, 17, 19. **Severity:** Medium. **Likelihood:** Possible if ADR-0211 is applied indiscriminately to every Share.

**Concern and why:** Projection-policy widening needs governance, but treating each already-qualified ordinary source disclosure as a new policy change would require a second human on every contact share. A mandatory tenant group wizard, review board or full Email Studio setup similarly defeats the founder's requested simple handoff.

**Evidence:** ADR-0211 ends “policy change control, not generalized blocking approval for all edits”; P27 D26 says ordinary eligible updates need no fresh approval after source/policy qualification.

**Impact:** A source/policy extension must be accepted and qualified once at its correct boundary; ordinary authorized Share can stay simple. Do not waive actual owner-required disclosure approval for exceptional data by calling it routine.

**Permanent fix:** Separate policy authoring from use of the accepted source policy; apply only the proportional current source gates to the actual action.

**Exact clause:** “Qualifying or widening the projection policy follows its existing owner approval. Using the already qualified ordinary Share action does not automatically require a new supervisor approval or recipient-group configuration. Any stricter source-specific exception remains explicit; it is not a general ceremony for every contact.”

### D2-PS08 — Share could be declared irreversible, or Unshare invented, without a decision

**Categories:** 4, 5, 10, 13, 14, 15, 20. **Severity:** High. **Likelihood:** Possible if an implementation uses a permanent publish marker or adds a symmetric privacy toggle.

**Concern and why:** Once staff have seen/exported information, prior disclosure cannot be recalled. That fact does not mean future access can never be narrowed or that the missionary owns a new “make private again” power. A reversible toggle might remove org records others rely on; an irreversible toggle might obstruct legitimate restriction/correction. Neither lifecycle was selected.

**Evidence:** D1 explicitly left lifecycle/retention/unsharing open; P27 Q10 source restriction propagation; D26 current reads and historical access; ADR-0211 immediate narrowing with audit within its policy scope.

**Impact:** Keep D2's initial sharing audience. Do not ratify permanence or add an Unshare control merely to answer the adversarial concern.

**Permanent fix:** Preserve existing source restriction/correction/disposition authority and an honest disclosure limitation. Record any new missionary unshare/withdrawal promise as a separate product choice.

**Exact clause:** “D2 chooses the result of a successful Share, not an irreversible-publication rule or a new Unshare permission. Current owner-controlled restriction/correction and lawful retention remain effective. Already viewed or exported information cannot be promised recalled. Any additional return-to-private or withdrawal behavior requires an explicit decision and must preserve independently accepted source work.”

### D2-PS09 — Broader visibility could also broaden editing, export and missionary access

**Categories:** 5–7, 10, 11, 14, 15. **Severity:** High. **Likelihood:** Possible with a generalized shared flag or inherited role union.

**Concern and why:** Making a contact findable in staff CRM does not allow every staff member to edit every field, export protected data or see all linked money. Nor does the missionary gain staff context, unrelated donors or notes in return. A new common canonical identity must not merge private and shared readers automatically.

**Evidence:** P9 negative stories 32–34 and A18 governed export; P27 D26 independent create/read/history/correct rights; source-specific finance boundaries.

**Impact:** Preserve the useful shared contact destination without adding reciprocal or administrative powers.

**Permanent fix:** Use existing operation-specific capabilities and purpose-bound joined projections; do not treat discoverability as every-action permission.

**Exact clause:** “Ordinary CRM availability does not itself grant correction, deletion, export, financial history or protected-note access. Each action/field remains governed by its source. The sharing missionary retains only their permitted workspace slice; shared identity never becomes reciprocal access to the organization's broader CRM.”

### D2-PS10 — A simpler action still needs proof of real usefulness

**Categories:** 1, 9, 16–18, 21, 22. **Severity:** Medium. **Likelihood:** Unknown without actual source/UI and intended-user testing.

**Concern and why:** Simpler is a reasonable judgment, not a measured outcome. Without an observed source path, Share could add duplicate-entry work, hidden-match dead ends or stale notification links. Neither a checkbox labeled Shared nor a model review shows that staff can find and correctly use the contact. No valid numerical latency/recipient-volume budget is available here.

**Evidence:** Product intent administrative foundation; P27 Q09/Q10; prior research limits and source-owned contact foundations.

**Impact:** Accept the simpler direction and record proof obligations. Do not add configurable machinery to compensate for uncertainty.

**Permanent fix:** A complete source/UI test must demonstrate capture→review→Share→ordinary staff discovery, private-history exclusion, optional notify/no-notify, recovery and current authority. Later representative tests measure comprehension, duplicated effort and interruption. Counts of shares/notifications are not ministry outcomes.

**Exact clause:** “Before activation, prove successful ordinary CRM discovery/use and protected exclusions through actual source/database/UI paths, with and without optional notification and under interruption/revocation. Measure real task success and operating cost for the admitted profile; no synthetic review, delivered-notice count or invented performance budget qualifies the product.”

## Alternatives and necessity

- **Selected simpler direction:** ordinary CRM sharing plus an optional staff nudge. This fits the organization's operational home and avoids a separate collaborator-grant product.
- **Prior collaborator recommendation:** useful only if a real relationship requires a narrower shared audience beyond existing source restrictions. The user rejected it as the ordinary D2 model. Do not build it speculatively or retain mandatory custom-team configuration under a different label.
- **No new sharing feature:** keep private capture and rely on copied details, email or staff re-entry. This fails the stated native shared-contact outcome and adds manual glue. It is not a valid claim of complete D2.
- **Share alone without optional notification:** useful as the core independently recoverable effect, but does not satisfy the user's optional notification outcome when that source capability is required and unbuilt. Keep the missing optional capability explicit rather than declaring the whole request complete.
- **Automatic sharing of all contacts:** simpler implementation but directly contradicts D1. D2 is the deliberate transition, not a reversal of the restricted-start choice.
- **Permanent one-way publication or symmetric Unshare:** neither is necessary to choose the ordinary audience. Both would introduce unchosen lifecycle meaning and must not be adopted for implementation convenience.

## Minimal notification recommendation

Use an optional “Notify staff” affordance in or immediately after the Share journey, using existing recipient eligibility and notification controls. There is no need for a tenant-wide audience-management screen, a separate permission grant, a persistent watcher list or a general workflow. Staff selection is now an explicit founder choice; show that selector only when notification is chosen and limit it to the existing qualified staff-directory purpose. In-app only, off by default is the recommended minimal delivery profile, clearly labeled as engineering/product discipline rather than an additional founder answer. Exact maximum recipients must follow measured and qualified source limits, not a new hard-coded number in this review. Do not expand into email/push/SMS merely because another adapter is available.

Do not broadcast by default, grant missing access to fulfill a selection, send the prospect a verification/welcome message, or impose a due date on the notified staff member. No optional free-text message box is necessary to deliver the stated outcome; adding one would require its own safe content/audience rules and must not become an easy private-note republication path. Prefer a source-owned notice with a safe label/reference and current authorization at open. This is a simplification recommendation, not a claim that the current notification implementation is qualified.

If no notification producer can meet the exact purpose, sharing remains source-truthful and usable while that notification lane is visibly unavailable and still incomplete. Do not make sending email mandatory just because that is the first provider API available.

## Mandatory gates and monitoring

**Before affected capability activation, not merely monitor:** accepted source sharing/admission policy; exact eligible contact facts; current P10/P12 projection and operation authority; hidden-match-safe identity outcome; no private-history republication; source-acknowledged Share and same-operation recovery; optional notice eligibility/receipt/retry independence; migrated and current readers/derivatives enforcing the same scope; ordinary contact discoverability; actual positive/negative source/UI proof. New unshare, exception, retention or departure rights remain undecided and cannot be supplied by monitoring.

The engineering team must qualify the actual source and derive measured performance/operating budgets before release. This review supplies no arbitrary throughput, SLA, recipient cap or escalation period.

| Future signal                                                                               | Exact threshold available now | Owner / response                                                                                                                      |
| ------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Confirmed unauthorized contact/private-history disclosure from sharing or its notice        | Any confirmed instance        | P9/P12 and relevant safety owner contain affected disclosure, preserve minimal evidence and requalify before expansion.               |
| Duplicate accepted Share/notice for one exact intended source effect                        | Any confirmed instance        | Effect owner fences the affected writer/replay and reconciles existing receipts; do not recreate the contact or notification blindly. |
| UI reports Share failed after a proven accepted Share solely because optional notice failed | Any reproduced instance       | P28/source UX owner blocks that incorrect outcome, repairs the state presentation and reruns recovery.                                |

These signals detect regression; they cannot replace preventive privacy/integrity tests. Ordinary notification volume, absent follow-up logs and number of shared prospects must not become missionary diligence or donor-value measures.

## Reconciliation notes for the parent

Record D2 as answered; retain original Q2 wording as historical offered options and mark the collaborator recommendation superseded for the ordinary path. Do not rewrite D1 to make contacts staff-visible from first entry. Keep E1's bounded P9 preparation model labeled engineering recommendation. D2 settles the ordinary destination audience but not every canonical-admission trigger, field correction, later private edit, retention or unshare rule.

The user requested simplicity. The next genuine unresolved question should arise from a concrete remaining user consequence, not a menu of notification recipient types, hypothetical sharing modes or database policies. No follow-up question is needed merely to preserve already accepted P10/P12 restrictions; if an actual desired behavior conflicts with them, explain that exact conflict before proposing a scoped amendment.
