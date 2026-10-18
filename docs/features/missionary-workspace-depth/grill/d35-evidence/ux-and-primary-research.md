# D35 — missionary continuation: UX and primary research

Research date: **October 18, 2026 UTC**. The founder selected **A — Allow
missionary continuation when permitted**, while authorized staff retain their
own scoped ability to act. The founder also requests simple, usable tenant
controls and sensible defaults. These are user instructions, not findings from
an observed ministry workflow. The original
[Q35 snapshot](q35-before-answer.txt)
records the question before that answer. D34's limited history remains ratified.

**Recommendation: accept with required amendments.** Use one contextual
**Continue referral** action for a recognizable, currently eligible referral.
Explain its effect beside the action. Avoid a routine confirmation modal,
mandatory explanation, fresh-referrer form or staff approval queue. Keep the
organization control explicitly about missionary self-service so disabling it
does not silently disable authorized staff or undo accepted work.

This is a research/design recommendation for the parent review, not ratification
of the amendments, formal source specification, implementation or live security
proof. No numerical renewal window, arbitrary override matrix, bulk continuation,
new donor communication or new cultivation task is selected here.

## Governing repository evidence

| Source inspected                                                                                                                                                                                                                                | What it establishes and what remains bounded                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Founder referral journey](../phase28-founder-brief.md:137)                                                                                                                                                                                     | Deliberate continuation after expiry, source-linked history and restrictions are required. It does not imply contact permission or select a universal timer.                                                                                 |
| [D34 decision and required amendments](../phase28-d34-expired-referral-history-adversarial-review.md#exact-required-amendments)                                                                                                                 | A small Expired view, useful current identifying information, protected fields and independently authorized active access. Reading history alone has no continuation effect. D35 adds an action only through separately qualified authority. |
| [Q35 choice and boundaries](../phase28-q35-expired-referral-continuation-authority-research.md#the-single-choice)                                                                                                                               | The selected actor class is missionaries when authorized, alongside staff in their own scope. An eligible ordinary expired referral differs from withdrawal, invalidation and privacy revocation.                                            |
| [P9 A4](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353)                                                                                                                                                  | Native relationship identity and attributable lifecycle belong to the canonical owner. A generic browser edit to a contact's status is not the continuation command.                                                                         |
| [P12 current actor context](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552) and [purpose/contactability](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1654)      | Organization permission, exact current action scope, readable fields and contactability are separate. Being a missionary, original author or historical recipient does not itself grant the action.                                          |
| [P27 genuine return](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:377)                                                                                                                                        | Reopening preserves history, rechecks authority and does not revive consumed tasks or permissions. This is a useful boundary, not the exact P9 referral-continuation producer.                                                               |
| [Shared UI contract](../../../../../packages/ui/AGENTS.md:5), [configuration](../../../../../packages/ui/components.json:3) and [frontend rules](../../../../ai/rules/frontend.md:14)                                                           | Exact `base-maia`, Base UI, shared `@asym/ui` and semantic tokens remain mandatory. No imported competitor design or new component library.                                                                                                  |
| [Existing button](../../../../../packages/ui/components/shadcn/button-component.tsx:1), [dialog](../../../../../packages/ui/components/shadcn/dialog.tsx:1) and [alert dialog](../../../../../packages/ui/components/shadcn/alert-dialog.tsx:1) | Existing shared primitives support explicit buttons, pending affordances and qualified modal interactions. Their existence does not justify adding a modal to every continuation.                                                            |
| [Accessibility review](../../../../ai/skills/accessibility-review/SKILL.md:1) and [testing rules](../../../../ai/rules/testing.md:20)                                                                                                           | Actual keyboard, focus, phone and accessibility checks are needed when implemented. Documentation-only structural checks are not runtime qualification.                                                                                      |

The detailed source producer, deployed authorization path and retained-data
behavior are not established by this UX inspection. Q35's bounded static
findings are reused as provenance, not relabeled as a fresh full code audit.
Existing owner constraints outrank generic CRM patterns. No previous D34 evidence
or verifier is changed or rerun in this lane.

## Fresh primary research

All ten sources were directly opened on **October 18, 2026**. Document dates are
reported separately from retrieval. Public documentation establishes documented
patterns, not tested competitor behavior, actual missionary preferences or a
measured improvement in Core.

| Source and date                                                                                                                                            | Bounded evidence                                                                                                                                                                 | Application and limit                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MPDX — Status, MPD Phase](https://help.mpdx.org/article/162-mpdx-status-mpd-phase), updated September 18, 2023                                            | Hidden statuses include Expired Referral; a filter finds them and a direct status edit changes a contact's phase.                                                                | Supports findable past work and deliberate direct action. Do not copy whole-contact status changes, bulk reactivation or financial side effects.                                                                                                     |
| [TntConnect — TNT Phase](https://www.tntware.com/tntconnect/help/en/pages/contacts_mpdphase.aspx), undated manual                                          | Expired Referral indicates a passed reasonable contact window; the manual suggests seeking updated context.                                                                      | Stale introductions differ from refusal. It does not mandate a new introduction, a referrer-contact step or staff approval for Core.                                                                                                                 |
| [Dynamics 365 — Reopen leads](https://learn.microsoft.com/en-us/dynamics365/sales/re-open-lead-sales), updated May 29, 2026                                | Closed Leads offers an explicit Reactivate Lead action; role and configuration affect availability.                                                                              | Direct named action within configured authority is a useful precedent. Sales disqualification is not referral expiry; retained full records and inherited permissions are not Core policy. Public text was readable despite an authorization banner. |
| [Pipedrive — Archive deals and leads](https://support.pipedrive.com/en/article/archive-deals-leads), updated September 3, 2026                             | Archived items have an explicit Unarchive action. Visibility and actions differ; the guide also warns that a missing pipeline/stage can affect where an unarchived item appears. | Explain where continued work can be found. Do not copy ownership-as-permission, archived email access, bulk operations, automatic side effects or its archive lifecycle.                                                                             |
| [Nielsen Norman Group — Confirmation dialogs](https://www.nngroup.com/articles/confirmation-dialog/), published February 18, 2018; reviewed August 7, 2026 | Specific consequences make confirmation useful; unnecessary routine dialogs interrupt work and train automatic dismissal.                                                        | Prefer an informed direct action for this bounded operation. This is first-party expert guidance, not a D35 experiment. Do not claim all continuation is reversible or add an unsupported Undo.                                                      |
| [GOV.UK — Button](https://design-system.service.gov.uk/components/button/), current guidance, component history includes July 2026                         | Disabled buttons can confuse; slow responses and double-clicks can produce duplicate submissions. Client prevention does not replace server safeguards.                          | Show pending feedback and a real named action; make retries safe at the source. Do not copy GOV.UK colors/components or treat button disabling as idempotency.                                                                                       |
| [GOV.UK — Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/), current undated guidance                                 | Confirmation should reassure users about what completed and what follows. It identifies research gaps for transactions within wider tasks.                                       | Give accurate completion and next-location feedback. A small referral command does not need a whole confirmation page, PDF receipt or email.                                                                                                         |
| [W3C APG — Modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), current undated guidance                                                 | Dialogs need correct focus management; if an invoking control disappears, focus should move to a logical workflow location.                                                      | If a genuinely necessary review uses the shared dialog, preserve that behavior. The same disappeared-control concern informs testing the filtered list; the pattern does not require a dialog.                                                       |
| [W3C — WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), current explanatory guidance                                   | Sequential focus should preserve meaning and operability.                                                                                                                        | A continued row leaving Expired must not strand keyboard focus or move it unpredictably. This reading is not an implemented accessibility pass.                                                                                                      |
| [W3C — WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), current explanatory guidance                           | Appropriate displayed status feedback is available to assistive technology without unnecessary focus interruption.                                                               | Announce pending/result feedback proportionately. Do not turn every history refresh into an alert or rely solely on a vanishing toast.                                                                                                               |

The fundraising manuals are older domain precedents reopened today. The updated
CRM and design guidance adds current interaction evidence, but none establishes
Core's permitted audience, lawful retention, expiry schedule or a legal need for
particular confirmation steps. No live competitor account or actual user study
was exercised.

## Tenant control: one clear meaning

Recommended product-facing setting or existing permission affordance:

> **Allow missionaries to continue expired referrals**
>
> Missionaries with permission can return eligible expired referrals to active
> work. Current access and contact rules still apply.

Recommend **Off for new or unconfigured organizational scope**, as a proposed
least-privilege default rather than an already selected founder fact. Preserve
later explicit qualified choices during upgrades; an upgrade must not repeatedly
reset the organization's choice to Off. An existing permission configuration
that already expresses the same decision should be reused rather than adding a
second setting with competing authority. This is a product control, not a
mandate for a new database boolean alongside the permission system.

| Setting effect                | What it must mean                                                                                                                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Off                           | Missionaries cannot start a new continuation through this self-service path. D34 history still follows its own permission. Staff continue to use their independent current authority.                                |
| On                            | The organization permits the capability; the particular actor, referral and current scope still must qualify. It does not grant every missionary every expired referral or override privacy restrictions.            |
| Turn Off after use            | Prevent future missionary continuation commands under the current boundary. Do not erase accepted continuation history, automatically re-expire active work, withdraw referrals or revoke independently valid reads. |
| Staff administration          | Use current delegated configuration authority and required policy governance. Ordinary use does not require a second staff approval for every referral.                                                              |
| Finer scope already available | Use existing bounded grants if needed. D35 does not need another per-person/per-project override matrix, custom rule builder or missionary preference switch.                                                        |

Suggested Off explanation: **“Missionaries cannot continue referrals themselves.
Staff use their existing permissions.”** Avoid **“Disable all continuation”** or
**“Only staff can continue”** when no staff action authority is established.
Authorized staff may still act; staff role alone remains insufficient.

Do not add an overall staff-disable control merely because the user asked to
turn missionary self-service off. Staff authority is governed through the normal
permission system. A future desire to prohibit every actor's continuation would
be a different scoped decision, not an ambiguous interpretation of this control.

## Maya's whole journey

1. **Find current history.** Open Referrals and choose the ratified **Expired**
   view. Active remains the ordinary starting view. There is no new dashboard,
   notification, approval inbox or mandatory setup tour.
2. **Recognize the exact referral.** The row keeps D34's approved name/label,
   source occurrence and known dates. The current organization/ministry context
   is visible in the ordinary workspace shell. A name match is not identity;
   no unsafe details are revealed just to distinguish similar rows.
3. **Understand the action before using it.** On a currently eligible,
   actionable row, show **Continue referral** with concise effect text:
   **“Return this referral to active work. Contact rules still apply.”**
   Use one clearly labeled button, not an icon-only refresh arrow or a generic
   status dropdown with a selectable Active value.
4. **Act deliberately once.** Activating that button submits the qualified
   source command for this occurrence and scope. Reading the row, changing the
   filter, tabbing to the button or viewing a profile never performs it.
5. **See the actual outcome.** While the command is in flight show
   **“Continuing…”** with accessible pending feedback. A successful authoritative
   result is distinguished from a lost response or a later read failure.
6. **Continue ordinary work.** After source-confirmed continuation, reconcile
   the filtered results. Provide a currently permitted next-location link when
   available, without changing the user's filter unexpectedly. No contact,
   enrollment, old task, message, newsletter subscription or interaction is
   created merely to complete this flow.

D35's one action is additional to D34's read-only rows, not a reason to make the
whole row clickable. The visible and accessible name should identify the action;
its programmatic context should identify the approved referral occurrence.
Repeated ambiguous **Continue** buttons must not be the only way to identify
which item will change.

### One informed action; no automatic confirmation ritual

**Default recommendation: no extra “Are you sure?” modal.** The bounded ordinary
operation returns this eligible referral to active work; it does not send,
delete, spend money or override consent. The target and effect are already
visible. Repeating the same text in a modal adds a click without adding useful
review. A mandatory reason, promise to contact, approval or fresh-referrer form
would invent a workflow not selected by the founder.

If source qualification establishes a materially different consequence or
required choice that cannot be understood from the row, show that necessary
information before the deliberate command using the existing detail/review
surface. Do not add an empty second confirmation on top of that review. This is
not a tenant setting that lets administrators remove required source safeguards.

Do not promise **Undo** as a substitute for confirmation. Returning an expired
referral to active work is not necessarily the same as correcting a mistaken
continuation. A permitted source correction, if available, must preserve
history and current authority; a generic reverse status update is not adequate.

### Dates and identity remain honest

- If the qualified source provides a new follow-up deadline or another material
  current term, show it plainly before acceptance when it affects the user's
  decision, and show the actual accepted value afterward. This does not select a
  default duration, arbitrary date picker or extension-frequency control.
- An unknown old expiry date remains unknown. It does not block continuation
  merely because a layout wants a complete timestamp, nor prove eligibility by
  itself. The source must independently establish the eligible ordinary expiry.
- For same-name occurrences, use already-admitted distinguishing dates or an
  existing permitted reference. If Maya cannot recognize which occurrence will
  change, do not turn two identical ambiguous rows into actionable guesses.
  Resolve through existing qualified context/source help without unmasking
  private referral details or inventing another contact.
- Corrected labels/dates can update while the referral stays eligible. A
  materially changed target or terms require a fresh understandable review;
  an unchanged safe display correction must not invent a mandatory staff cycle.

## Successful removal from the Expired filter

A row disappearing is expected after genuine continuation, but silent removal
can look like deletion or a failed click. Retain a concise result in the view:

> **Referral continued.**
>
> **View active referral**

Use the success text only with authoritative completed-effect evidence. The
link appears only when the corresponding current active destination is
independently available. The result may use the approved label if current
receipt/display authority still permits it. A broader details page is never
opened solely because the mutation returned success.

Keep the Expired filter selected. Do not automatically jump to an unrelated
active record, reset search or select a similarly named item. When the operated
row/control leaves the document, move focus to a logical surviving location
(such as the list's result message or view control), using the established
component pattern and preserving the user's place. Do not rely on a short toast
as the sole confirmation or require Maya to chase a disappearing button.

A durable continuation fact and current state are separate. If the command
completed but current status cannot be fetched, say **“Referral continued.
Current status is unavailable. Refresh.”** Do not claim that the current active
record is displayed or accessible. If a later source change is known, show only
its currently permitted actual state. A projection delay is not permission to
claim Active prematurely, and an acknowledgement that only accepted a pending
request is not proof that continuation completed.

## Failure, changed authority and uncertain outcomes

| Actual situation                                              | Plain feedback and behavior                                                                                                                                                                                                                                      |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missionary self-service Off, historical row otherwise visible | Omit the unusable per-row action. A concise shared explanation can say **“Your organization has not enabled missionary continuation.”** only when that configuration fact is permitted. Do not show dozens of disabled buttons or imply record-specific refusal. |
| Action unavailable for this otherwise readable row            | Keep the permitted history. Explain an admitted actionable reason if one exists; otherwise **“This referral can't be continued here.”** Generic existing help may remain. Do not reveal withdrawal/privacy reasons the reader cannot see.                        |
| Request clearly failed without acceptance                     | **“Couldn't continue the referral. Try again.”** Keep the permitted context and reuse safe retry semantics. Do not create a new source occurrence.                                                                                                               |
| Lost/ambiguous response                                       | First reconcile the same operation. If still unknown: **“We couldn't confirm whether this referral continued. Check status before trying again.”** Offer **Check status**. Do not invite a fresh continuation or show failed/succeeded without evidence.         |
| Source changed before acceptance                              | **“This referral changed. Review the current details before continuing.”** Refresh only admitted context; do not silently move to another occurrence, scope or materially different terms.                                                                       |
| Another actor already continued it                            | If the current active state is readable, **“This referral is already active.”** Provide its qualified current destination. Do not falsely attribute the other actor's change to Maya or record another cycle.                                                    |
| Current authority or visibility removed                       | Use the governed non-revealing unavailable state and remove unauthorized content/action. Do not leave cached names, dates or continuation controls visible while retrying.                                                                                       |
| Temporary current-state fetch failure after proven completion | Confirm the durable completed effect separately, then **“Current status is unavailable. Refresh.”** Do not turn a successful command into a new failed attempt or assert an unfetched state.                                                                     |

Pending control feedback prevents accidental repeat input but is not the durable
idempotency mechanism. Two tabs, an interrupted connection, staff racing Maya
and a later retry must preserve one accepted business effect under the source's
qualified command. A current Active read without the operation's receipt can
show current state but cannot prove which actor caused it. Technical retry keys,
policy versions and graph identifiers stay out of user-facing copy.

No automatic queued continuation should execute later merely because the device
comes online or the organization re-enables the capability. A saved pending
operation may reconcile its actual earlier outcome; a new unaccepted action
requires current deliberate intent and source authority. The product needs no
offline mutation queue to make its simple read/history journey usable.

## Staff journey and correction

Staff configure the permission using the normal organization controls and can
explain its scope from the setting's own copy. They do not curate per-referral
allow lists or approve every missionary action. Staff who have current source
command authority can continue a qualified referral through their ordinary
surface; the missionary switch is not their action grant.

When Maya needs help, existing authorized source tools inspect the exact
occurrence and attributable outcome. A mistaken continuation can use a qualified
source correction when available, rather than rewriting expiry dates to make the
list look right. Disabling self-service is not a substitute for source correction
and is not a bulk rollback. This design introduces no new support ticket queue,
referrer outreach requirement, contact sharing workflow or manual database repair.

## Phone, low-bandwidth and accessible behavior

Use the shared Base UI button and semantic Maia styles. Retain ordinary text
hierarchy: recognizable label, Expired state, known dates, effect and action.
The button should remain easy to reach on a narrow screen without covering the
label or requiring a hover menu. Avoid a prominent destructive red treatment;
this is not deletion. No extra animation, countdown, map or avatar is useful.

Long international names and approved aliases must wrap; preserve original
scripts and right-to-left layout. Distinguishing context cannot exist only in a
tooltip. Dates retain source precision and timezone/date-only meaning. The
implemented journey must pass keyboard access, visible focus, zoom/reflow,
non-colour status and appropriate assistive-technology announcements.

Loading or a lost connection must leave Maya able to understand what is pending
or unknown. Do not optimistically announce success, remove the row as though
committed, or load the full Party profile to prepare a possible next page.
Current tenant/context changes fence pending results; a fast cached experience
cannot serve former private fields. No empirically unsupported latency or
network-volume promise is made by this note.

## Strong alternatives and product judgment

| Alternative                                                    | Strength                                                                   | Why it is not the recommended default                                                                                                                                                               |
| -------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorized staff only                                          | Centralizes continuation decisions and reduces missionary action scope.    | It adds a handoff for work the organization deliberately authorizes Maya to manage. This remains the effective mode when self-service is Off, subject to staff authority, not a new approval queue. |
| One informed direct action                                     | Few steps, explicit target/effect and ordinary task continuity.            | Requires actual source eligibility, safe retries and truthful feedback. It is the recommended A with those safeguards; the convenience benefit remains a testable product judgment.                 |
| Mandatory confirmation for every row                           | Can prevent an accidental click if it supplies useful consequence/context. | A generic duplicate prompt adds friction and may train dismissal. Prefer visible effect text; require additional review only for a real source consequence or missing decision.                     |
| Editable status dropdown or bulk reactivation                  | Familiar from some CRMs and superficially flexible.                        | Conflates source lifecycle, current work and permissions; encourages broad changes without exact per-item review. D35 does not authorize it.                                                        |
| New per-project exceptions, request queue and required reasons | Offers more apparent control.                                              | No evidenced need justifies a second policy hierarchy or routine staff review. Reuse existing scoped permissions and current source safeguards.                                                     |

## Material concerns and exact prevention language

Severity/likelihood are qualitative assessments of a naive implementation, not
measured incident rates.

| Concern; severity / likelihood                                                            | Why it matters                                                                                                       | Proposed requirement                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ambiguous Off disables staff or reverses past work; High / Medium                         | The founder selected missionary permission with staff still able to act. A generic global switch changes that scope. | **“Organization control SHALL explicitly govern missionary self-service. Off SHALL stop new missionary continuation under current policy without undoing accepted source history, disabling independently authorized staff or changing D34 history authority.”** |
| On becomes a blanket role grant; High / Medium                                            | Current exact permissions and source eligibility are still required.                                                 | **“Enablement SHALL permit only source-qualified actions by currently authorized actors in the exact tenant and scope; it SHALL NOT itself authorize every missionary or expired record.”**                                                                      |
| Unsafe or confusing target; High / Medium                                                 | Same-name rows and small history projections can make an action target unclear.                                      | **“Continue referral SHALL identify one recognizable, currently admitted source occurrence and its material effect; ambiguity SHALL NOT be resolved by guessing, duplicate creation or protected-field disclosure.”**                                            |
| Confirmation and mandatory-input inflation; Medium / High if generic workflows are copied | A routine action grows into forms and staff queues without new evidence.                                             | **“The default journey SHALL use one informed deliberate action without a routine duplicate confirmation, mandatory reason or per-row staff approval. Any added review SHALL expose a real source-required decision or consequence.”**                           |
| Disappearing row and focus loss; Medium / High without explicit handling                  | Success can look like deletion and strand keyboard users.                                                            | **“A source-confirmed continuation SHALL reconcile filtered membership, provide accessible durable outcome feedback and preserve logical focus; it SHALL NOT silently reset the filter or promise an unauthorized destination.”**                                |
| Ambiguous response or race causes duplicate continuation; High / Medium                   | Lost responses and simultaneous staff/missionary work can be mistaken for failure.                                   | **“Retries SHALL reconcile the same accepted business effect. Uncertain outcomes SHALL remain visibly uncertain until authoritative resolution; current Active state SHALL NOT manufacture actor attribution.”**                                                 |
| Accepted command mistaken for current state; High / Medium                                | The result can be durably completed while the read model is stale or access changed.                                 | **“Completed-effect evidence and current readable state SHALL be reported separately; success SHALL NOT imply restored fields, current contact permission or a fetched Active view.”**                                                                           |
| Generic Undo and auto-restoration; High / Medium                                          | A reverse status edit could erase history or revive closed tasks/consent.                                            | **“Continuation SHALL preserve source history and consumed effects. Correction SHALL use its qualified source contract; no generic Undo or automatic child restoration follows from this action.”**                                                              |
| Upgrade resets chosen policy; Medium / Medium                                             | Reapplying a default can unexpectedly disable staff-approved self-service.                                           | **“A default-Off recommendation applies to new/unconfigured scope; upgrades SHALL preserve existing explicit qualified organization choices.”**                                                                                                                  |

## Outcome tests required later

1. With self-service Off, an otherwise permitted history row remains readable
   under D34 but has no misleading unusable continuation CTA. A separately
   authorized staff member can still use their own qualified action.
2. Enabling self-service does not authorize a different tenant, ministry,
   missionary, revoked source or private context. Disabling it during a pending
   operation observes the source's current acceptance boundary.
3. One recognizable ordinary expired referral can be deliberately continued
   without a required extra reason, approval queue or generic confirmation.
   Mere viewing and filtering have no mutation effect.
4. Same-name occurrences and unknown dates do not cause a wrong-record action,
   invented deadline or a broad contact disclosure. Material source changes
   cannot silently change the target or accepted terms.
5. Double-click, two tabs, staff racing Maya, lost response and retry yield the
   qualified single effect and truthful attribution. Unknown outcome feedback
   does not instruct an unsafe new operation.
6. Successful removal from Expired is explained; keyboard focus remains logical,
   search/filter context is preserved and any next-location link is currently
   authorized. Failed or unknown outcomes are not optimistically shown as success.
7. Completed-effect/current-state disagreement shows each fact accurately, and a
   late response cannot restore content after actor/tenant/permission changes.
8. An upgrade preserves explicit configuration; Off does not re-expire accepted
   work or delete source history. History reads remain separately governed.
9. Real mobile, zoom/reflow, long and right-to-left names, keyboard, focus and
   screen-reader states work with the shared components on the complete journey.
10. No call, email, subscription, renewed task, new contact, cultivation reopening,
    referrer outreach, activity target progress or generic undo is created by
    continuation alone.

These are proposed acceptance cases, not tests executed in this research lane.
The default and UX recommendations still require the parent decision's explicit
status and later owner reconciliation. Source command, permission, mutation,
retention and rollout proof must precede activation; attractive copy does not
substitute for them. No user interviews or authenticated UI sessions were
fabricated, and no new external application writes were performed.
