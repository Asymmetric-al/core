# Phase 26 D6 — Assignment configuration and staff experience

10 September 2026. **Fully founder-ratified D6, including every amendment, adjustment, change and update. Shared Unassigned remains the default; the exact configuration, effects, safeguards and UX here are accepted in full.** D1–D5 remain accepted. This blueprint is exploratory grooming, not implemented UI or a formal specification. Ratified requirement language: [D6-R01–R20 and all 23 categories](phase26-d6-adversarial-review.md). Evidence and actual proof limits: [D6 evidence](phase26-d6-evidence.md).

## The experience in plain language

A tenant's ordinary support email reaches its responsible inbox. By default, named staff share responsibility for reviewing Unassigned work. A staff member can choose **Assign to me** or explicitly assign someone else. Reading or replying does not secretly claim it. The requester continues using email without choosing a staff member, understanding routing, linking a CRM record or signing in merely to converse.

An administrator can instead choose automatic distribution for an inbox. **Round-robin** takes turns. **Balanced** chooses the eligible person with the fewest Open Support conversations in the tenant. Both respect an explicit receiving pool, each person's receiving choice and any automatic assignment limit. A pool of one person expresses “give new requests to Maria when eligible.” If nobody qualifies, the request stays visibly Unassigned; no information is lost and no arbitrary person is used as a fallback.

The interface should feel like the existing Asym workspace: restrained typography, one dominant action, clear alignment and spacing, semantic text rather than a field of badges. Use the repository's shared Base UI/Maia/Zinc primitives. This is a behavioral and information design, not a second design system or a mandate for a new dashboard.

## Common configuration, defaults and consequences

Defaults apply to **new configuration**, not a silent reset of existing tenant settings. The mode is per inbox. Receiving choices and limits are per staff principal and tenant, with one authority even when surfaced in an inbox editor.

| Setting                             | Common options / ratified starting value                                                                          | Editing authority and effect                                                                                                                                                                                                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Default first assignment**        | **Shared**; Round-robin; Balanced                                                                                 | Authorized inbox routing administrator. One choice, one published revision. Applies to new and disclosed still-pending automatic first assignments; never silently takes existing work.                                                                                                          |
| **Coverage**                        | Explicit named staff and/or a qualified Support team; no inferred everyone/admin default                          | Authorized operational configuration. At least one current authorized human before live inbox activation. Shows who is responsible for Unassigned review. A new steward role is unnecessary.                                                                                                     |
| **Receiving pool**                  | All configured coverage people, or an explicitly selected subset using the same qualified people/team association | Relevant for automatic policies/rules. Direct/team overlap counts once. Current membership and actual access are rechecked. Pool membership grants no access or manual-handling monopoly.                                                                                                        |
| **Responsible team**                | None, or a deliberately chosen qualified Support team                                                             | Optional ownership default distinct from a team used merely to find candidates. Show “No team default” honestly. An explicit routing result may set a team; never infer it from the selected pool.                                                                                               |
| **One-person distribution**         | Choose one person in an automatic pool                                                                            | Summary: “Assign to Maria when eligible.” Same receiving, permission and limit checks. No fourth Fixed person algorithm or fallback-person field.                                                                                                                                                |
| **Receive new Support assignments** | **Off until explicitly enabled** by the worker or an authorized administrator                                     | Current tenant only. Read-only summary in the inbox editor; authorized Manage opens person settings with a separate Save. Self receiving is a separately labelled immediate command with pending feedback. Off changes future automatic receipt, not current work/coverage/access/notifications. |
| **Automatic assignment limit**      | **No limit**, or a positive integer deliberately set per person                                                   | Read-only summary in the inbox editor; authorized Manage opens tenant-labelled person settings and its own Save. Counts assigned Open across tenant Support, including deferred Open. Zero is invalid: use receiving Off.                                                                        |
| **Workload context**                | Permitted Open count, with both Waiting categories separately identifiable                                        | Display from an authorized operational projection. No unauthorized inbox/CRM count or detail disclosure. A failed read is “Unavailable,” not zero.                                                                                                                                               |
| **Specific assignment rules**       | None fabricated by default; qualified ordered rules may leave Shared or choose person/pool                        | Shared automation-management authority/vocabulary. First qualifying match precedes default. An unavailable consequential fact blocks unsafe fallthrough. Explicit rules still apply with Shared default.                                                                                         |
| **No eligible automatic receiver**  | Retain visible Unassigned with a concise reason and the same pending initial intent                               | Fixed safety behavior under every automatic mode. May retry when eligibility returns; must not steal a later claim/unassignment/move/end.                                                                                                                                                        |
| **Pause automatic assignments**     | Not paused for new configuration; Shared default with no rules still assigns nobody                               | Separate immediate authorized per-inbox command with pending feedback, not part of staged Save/Cancel. Stops all automatic rules/defaults at the commit fence. Holds relevant pending work; manual authorized handling remains available.                                                        |
| **Save changes**                    | Explicit section-scoped Save; edits alone do not change routing                                                   | Expected-version command and impact review. No stale signature/SLA/auto-close fields are resent. Show policy saved separately from any ongoing pending-work processing.                                                                                                                          |

Pool configuration and coverage may share the same people; they remain different meanings. A person can be responsible for shared review while their automatic receiving flag is Off. An authorized staff member outside the pool can still manually handle work when existing permissions allow it.

**All-Off is a valid operational state.** A nonempty qualified pool can be saved when every member is Off or full. Show: “No one is receiving new assignments right now. Requests will stay Unassigned until someone becomes eligible.” Do not force an off-duty worker to switch On just to finish setup. A missing/deleted pool is an invalid automatic configuration, while temporary all-Off is a truthful availability state. If a formerly valid pool becomes empty later, preserve intake and show a configuration/coverage issue; do not start selecting unrelated staff.

No universal numeric limit is justified. The administrator sees No limit explicitly before activating an automatic mode and may choose an appropriate positive value. A cap of8 in examples is illustrative, not an Asym default or a response-time promise.

## One settings surface

The existing inbox settings navigation leads to **Assignment**. Avoid keeping both a “Round-robin” toggle in Inbox settings and a second Assignment form that saves stale copies of the same row.

The normal Shared configuration reads approximately:

```text
Assignment

Coverage             Donor Care · Maria, Daniel
Default first assignment
  ● Shared        Staff review Unassigned and choose who takes each request.
  ○ Round-robin   Take turns among eligible people.
  ○ Balanced      Assign to the eligible person with the fewest Open requests.

Responsible team     Donor Care
Specific rules       No active assignment rules     Manage rules

                                      Cancel   Save changes
```

This is a content sketch, not a pixel or exact-component prescription. When there are active rules, replace the summary with, for example, **“Default: Shared · 2 specific assignment rules active.”** The adjacent per-inbox pause action is labelled **Pause automatic assignments** and explains it stops those rules as well. Do not show an “Automation off” label beside active rules.

Choosing an automatic mode reveals the relevant pool and a compact staff table. Keep the mode explanations directly beside the choices; do not force a documentation visit to discover what Balanced means.

```text
Receiving pool       Donor Care

Person       Receive new   Open   Waiting   Automatic assignment limit
Maria        On             6       4       8
Daniel       Off            2       3       No limit

Open includes assigned Open conversations in every Support inbox in this tenant.
Waiting work remains a responsibility and is shown separately.
```

Only show those numbers through an authorized operational projection. Where a viewer cannot receive the count, show a permitted eligibility summary or “Workload detail unavailable” rather than leaking a hidden inbox. The actual selector's server-side authorized aggregate is separate from what each staff picker can disclose. The full distinction between Waiting for requester and Waiting on our side is available through the existing workload/detail disclosure, without three additional badges on every row.

A limit field includes **No limit** and a positive-number option. A receiving toggle controls only automatic receipt. Showing “6 Open / automatic limit 8” avoids implying the four Waiting conversations are not work or that a person cannot ever exceed 8. A person already over the configured limit remains the owner of their existing work.

The inbox table's receiving/limit values are **read-only summaries**. An authorized **Manage** action opens the existing person-settings pattern, clearly labelled with the person and tenant, with its own **Save person settings** and effect summary covering every Support inbox in that tenant. The number input and administrator receiving control live there. The worker's own receiving toggle persists separately and immediately, with pending/failure feedback. Inbox Pause/Resume also persists independently. **Cancel** on staged inbox settings does not undo a person-setting, self-toggle or Pause command; the surfaces must make this distinction visible without a blanket confirmation dialog.

The **Specific rules** link uses the existing shared declarative vocabulary and applicable management permission. A narrow example can target a qualified Support team for an owner-authorized known criterion; the editor must not offer arbitrary CRM field access or imply matching an address proves identity. A rule preview only exposes facts/results the administrator can view. More-specific Unknown facts show a safe review outcome instead of an apparently successful broad fallback.

Each automatic rule result needs a valid configured person or nonempty qualified pool. Shared with a specific person rule does not require an unused default pool. Any initial elapsed-wait predicate uses original elapsed UTC admission age of still-pending automatic work, including Pause; validation/preview cannot promise to wake completed Shared work later or reset its age on a settings edit.

## Save, pending work and Pause

Saving configuration applies to **new plus still-pending automatic first assignments**. The review states this scope in ordinary language and shows changes and an as-of count. No checkbox ambiguously labelled “Apply to backlog” is needed.

Example:

```text
Change default to Balanced

New requests will use Balanced.
5 requests are still waiting for an automatic first assignment and will be
rechecked with these settings. Already assigned requests and older Shared,
manually unassigned or moved requests will keep their current handling.

                                      Cancel   Save changes
```

The number can change while the review is open. A concurrent human claim, move or ending must win its valid control guard and exclude that request; Save cannot overwrite it to match the preview. After publication the surface can truthfully say **“Settings saved · Rechecking pending assignments”**, then show current outcomes. Failure/unknown progress stays discoverable; it is not a second invisible configuration value.

For automatic-to-Shared:

- Pending items now governed by the Shared default become intentional Shared work. Later enabling automatic mode does not quietly pull them back in.
- Pending items still governed by a specific automatic rule remain eligible for that rule, with that distinction shown in the change summary.
- Existing owners, manual Shared backlog, deliberate unassignments and moved/reopened work are excluded.

**Pause** is temporary: it fences every automatic assignment attempt for that inbox and retains relevant pending intent. **Resume** rechecks current policy and current eligibility. Selecting Shared is a durable default choice, with specific rules still visible. Changing policy while paused is valid: work now resolving Shared is released, while remaining automatic work stays held until Resume. A retired rule cannot reappear because an old worker resumes.

Cancel before submission discards staged settings. After submission, closing the panel does not undo the command. Reconcile its identity and show the saved/failed/unknown outcome. A lost response must not produce a second conflicting save. Preserve unsaved edits during version conflicts and explain which setting changed, rather than clearing the whole form.

## Daily staff experience

In the shared queue, **Unassigned** is a normal assignment state. Show the existing D3 work label, relevant received/queue age and follow-up information. Do not convert it into an extra work status or hide Waiting items under an Open-only shortcut.

**Assign to me** is one purposeful action. The server resolves the current authenticated person, current permission and reviewed assignment/control version. Two staff members choosing it simultaneously get one winner. The other sees **“Maria took this request”** with the current owner and their existing draft retained; it does not steal the request or force a refresh that loses composition.

The **Assign** picker shows permitted staff identity and relevant receiving/limit context. A manual handoff to a person who is Off or at their automatic limit can still be intentional. A restrained advisory beside that target makes it clear; selecting and committing the handoff is the deliberate act. Access loss, invalid staff identity or a forbidden destination are hard denials, not warnings an operator can override.

Validate the resulting person/responsible-team relationship even when changing only the person and preserving the team. An incompatible pair requires a clear explicit valid choice; silently changing the team is not a fix. This check does not require automatic-pool membership for otherwise authorized manual handling.

Opening, reading, composing or pressing plain Send does not assign the sender. Assignment changes do not alter recipients, internal notes, attachments, D3 status, D5 ending reason, reminders or a giving/CRM action. The selected detail and any unsent draft remain stable after an assignment. The real filter membership updates, but the UI must not unexpectedly switch the user to someone else's conversation.

When an automatic item is waiting, use one short reason such as **“No one receiving assignments”**, **“All eligible people at limit”**, **“Automatic assignments paused”** or **“Routing needs review.”** A keyboard/touch-accessible details disclosure can explain permitted pool/policy facts. Do not imply an unknown count is zero, show restricted criteria, or use a delayed explanation as authority over the current assignee. Shared-by-policy does not get an error badge.

The worker's receiving control is accessible in their Support context and useful on mobile. Text says **Receive new Support assignments** and identifies the tenant. Turning it Off gives concise confirmation of the actual effect; it does not imply logout, muted notifications or abandoned existing work. There is no check-in timer or browser-driven override. An administrator's delegated change is attributable and visible through current settings/history.

## Concrete examples and adversarial counterexamples

These are synthetic task fixtures for design and testing, not claims about ministry workflow prevalence.

| Situation                                                                     | Expected experience                                                                                                                                             |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Maria and Daniel cover a small Shared inbox                                   | Both can see Unassigned. Maria chooses Assign to me. Daniel sees the new owner; neither must enter a routing workflow merely to reply.                          |
| The tenant wants turns                                                        | Administrator chooses Round-robin and eligible pool. Successful automatic placements rotate; retries, failed candidates and manual claims do not consume turns. |
| Maria has 6 Open and Daniel has 2; both receiving and below limits            | Balanced chooses Daniel using the declared count. It does not infer Daniel has more skill or that Maria's Waiting work has no effort.                           |
| Only Maria handles this inbox                                                 | A one-person automatic pool selects Maria when eligible. Off/full/permission loss leaves a visible pending Unassigned item, not an administrator fallback.      |
| Maria has 8 Open at limit 8; an old Waiting item receives a substantive reply | Her existing conversation becomes Open under D3, remains assigned and may make 9. New automatic assignments pause for her; the reply is not rejected.           |
| Everyone is Off when the admin saves an automatic mode                        | Save is allowed with an explicit no-receiver message. Intake remains visible. A later eligible receiver can receive the same pending initial work.              |
| Someone manually unassigns an item while a routing worker retries             | The old automatic intent is fenced. The item stays intentionally Unassigned; the worker cannot reclaim it.                                                      |
| Shared is selected while 2 explicit assignment rules remain                   | Summary states those rules remain active. Pause automatic assignments is the control for stopping all automatic placements.                                     |
| A Party match is absent versus unavailable                                    | Known absence can use an explicit no-Party route. Unavailable/denied/ambiguous consequential facts show routing review and do not auto-create a contact.        |
| Staff opens the linked CRM record                                             | Owner permission is checked; navigation preserves context. Assignment creates no access to restricted giving/member-care facts or authority to change them.     |

## Accessibility, mobile and low-bandwidth acceptance

Use semantic labels, native shared controls and visible keyboard focus. Radio choices expose mode and description programmatically. Popovers/menus/drawers have predictable focus entry/return and dismissal. Status/error updates are announced without stealing focus. Color may reinforce a state but never be the only explanation.

On narrow screens, prioritize one conversation or settings surface at a time, with clear Back navigation and preserved draft/selection. Staff names wrap; neither identity nor rotation order depends on Latin names, capitalization or visual sort. Compact count labels retain their units. Touch users can inspect routing reasons without hover. Respect reduced motion; use no animated queue reshuffling as a substitute for clear ownership updates.

Slow links show pending state without pretending a local cache committed an assignment. A timeout displays reconciliation rather than a second unconditional claim. Offline clients retain permissible drafts but cannot authorize routing from stale settings/permission/counts. Server UTC instants support local time display; receiving is explicit rather than a guessed local shift.

## Boundaries and remaining product questions

These configuration choices complete D6's first-assignment scope. They do not select service hours, SLA enforcement, a holiday calendar, automatic departure redistribution, a reminder/notification subscription policy, AI routing, skill scoring, multi-channel workforce limits or an automatic backlog-adoption feature. Where those later decisions have a real need, reuse the existing owner capability and preserve this contract. No weaker fallback or disabled “coming soon” control is part of the ratified intended D6 experience.

Existing Phase6 notification preferences/delivery and Phase17 Email Studio wording remain shared capabilities. An assignment is internal work and sends no donor email. Optional already-qualified staff notifications derive from the committed effect once. This avoids introducing a routing-specific Resend path or duplicating a communication event in CRM history.

The full [D6-P01–P22 proof groups](phase26-d6-adversarial-review.md) include actual authorization/concurrency, mobile/accessibility, Save races, current-policy recovery and end-to-end CRM navigation. No UI was built or browser-tested in this grill; the behavioral design and source counterexamples are documented, with production proof explicitly required before activation.
