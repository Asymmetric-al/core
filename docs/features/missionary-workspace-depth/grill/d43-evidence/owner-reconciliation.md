# D43 — pending confirmation after Page-entry Off: owner reconciliation

October 18, 2026. Fresh documentary owner review of Core
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and its research working tree.
Q43 **A — Let those readers finish** is selected. D42 is ratified; D43's detailed
amendments remain recommendations until adopted. This note changes no formal
PRD, ADR, OpenSpec, implementation, schema, live configuration or provider state.
No earlier executable program was run or imported.

## Disposition and exact recommended decision

**Accept with required amendments.** A is a narrow, useful distinction between
removing an entry point and cancelling an already accepted instruction. It does
not need another tenant option for how pending requests behave.

> **D43 — Let accepted signup requests finish after Page signup is hidden.**
> Turning off **Show newsletter signup on this page** prevents new signup
> requests through that Page. A request the native newsletter source already
> accepted may still be confirmed before its original deadline, using its
> existing confirmation journey, while the exact newsletter, destination and
> current authorization and safety rules permit it. Opening a form, attempting
> submission or receiving a message is not source acceptance.
>
> The original required confirmation message, and a permitted deliberate resend
> for that same still-valid request, may proceed after Page-entry Off. Neither
> creates a new signup, changes the destination, restarts the deadline or bypasses
> current sending rules. Expired, withdrawn, revoked or superseded intent cannot
> be revived by retry, resend or reopening the Page.
>
> Authorized staff can disable native newsletter signup through its source-owned
> availability control. While disabled, new and pending admissions cannot complete
> and unstarted confirmation effects cannot be admitted for dispatch. This does
> not unsubscribe existing readers, block withdrawal, or stop independently
> authorized newsletter issues. Re-enabling can permit the same still-valid,
> non-revoked pending request before its unchanged deadline; it does not reset or
> automatically replay a terminal transport effect. Actual purpose closure,
> withdrawal and revocation retain their stronger source-owned meanings.
>
> Existing subscriptions, withdrawal access, giving and Page reach are unaffected
> by Page-entry Off. Confirmation uses the existing protected-action doorway and
> exact native source authority; it does not require the hidden public form to
> return, reveal a retired Page, create an account or grant CRM access.

The availability control above is a **required developing-product contract**, not
an assertion that a native signup-disable screen already exists. Reuse the
existing capability/settings surface and exact configuration authority when
implemented and qualified. If that source command/control is absent, add that
narrow command and accessible control as part of native capability delivery;
do not invent a role, a generic settings engine or a pending-request dashboard.

## Scope and evidence

- **Selected product direction:** Q43 A settles D6-C07's pending-after-Page-Off
  branch. It does not blanket-ratify D6 or the other earlier review packets.
- **Ratified constraint:** D42's qualified-address Join, ordinary guest
  confirmation, one proof-reuse option and no identity elevation remain intact.
- **Unresolved policy:** D6-C15's proposed 72 elapsed hours and 24-hour cleanup
  periods remain unadopted. D43 preserves the original finite source deadline;
  it chooses neither those numbers nor a new clock or retention period.
- **Repository fact:** the inspected owner contracts establish separate public
  presentation, protected actions, native business authority and communication
  effects. They do not establish a working native newsletter closure or signup
  availability UI. Research approval does not establish activation.
- **Product judgment:** preserve a valid accepted instruction across a Page-only
  visibility change, and require a distinct real source availability stop. This
  is not a claim that a vendor's similar control has identical semantics.

## Owner map and required reconciliation

| Owner and inspected evidence                                                                                                                                                                                                                                                                                            | Consequence for D43                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [P3 projection and consent](../../../../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md:60), [current serving](../../../../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md:900)                                                       | One subtract-only projection/consent path remains authoritative. Source failure is not permission; current safety cannot be replaced by a cached visible form or an old released Page.                                                                                                                                                                                    |
| [P6 A17](../../../../prds/sitestacker-parity/phase-06-shared-communication-event-model.md:175), [intent fence](../../../../prds/sitestacker-parity/phase-06-shared-communication-event-model.md:230), [compiler/dispatch service](../../../../prds/sitestacker-parity/phase-06-shared-communication-event-model.md:257) | P28 owns whether the pending business instruction remains eligible. P6 owns the one qualified communication plan/intent, exact recipient authority, dispatch boundary and transport outcome. Invalidating only the matching source fence may supersede unstarted work; unrelated issues cannot be cancelled by sharing an owner.                                          |
| [P12 four authorization contexts](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552)                                                                                                                                                                                              | Server context supplies Tenant and actor. Public projection is read-only, not a mutation grant. A qualified guest source capability does not manufacture a workforce assignment, donor role or fifth context. Page contributor authority does not imply organization-wide native signup configuration authority.                                                          |
| [P17 protected actions](../../../../prds/sitestacker-parity/phase-17-system-messages-template-management.md:1607), [fixed origin and response contract](../../../../prds/sitestacker-parity/phase-17-system-messages-template-management.md:1666)                                                                       | One source-owned descriptor and scanner-resistant shared doorway remain. Source owns expiry, recipient, replay, revocation and completion; P17 owns presentation, not newsletter consent. The canonical protected-action paragraph currently requires Party/contact authority: the native no-Party guest branch needs the explicit narrow reconciliation described below. |
| [P17 distinct recipient/suppression authorities](../../../../prds/sitestacker-parity/phase-17-system-messages-template-management.md:2139)                                                                                                                                                                              | Consent, address authority, provider suppression and delivery evidence remain different facts. Page entry or availability changes do not clear complaints, hard bounces or wider objections.                                                                                                                                                                              |
| [P22 current scope and reach](../../../../prds/sitestacker-parity/phase-22-public-ministry-pages.md:328)                                                                                                                                                                                                                | Page reach, publication, contributor authority, giving and source actions are separate. A hidden signup or retired Page never licenses stale public content, a new public audience or a recovered old release.                                                                                                                                                            |
| [ADR0140 derived settings](../../../../adr/0140-derived-public-page-setup-and-settings.md:102)                                                                                                                                                                                                                          | Settings display is a derived view of its real owner. Unknown/unavailable does not mean Off or On. Reuse owner workflows and progressive disclosure; do not add a generic Save All, shadow settings blob or unexplained disabled switch.                                                                                                                                  |
| [P23 D24 public audience](../../../../../openspec/changes/add-web-studio-cms/specs/web-studio-cms/spec.md:927), [D26 native form outcome](../../../../../openspec/changes/add-web-studio-cms/specs/web-studio-cms/spec.md:1017)                                                                                         | Public output remains audience-invariant. Receipt, private pending state and confirmation result belong to the private interaction. Source acceptance must be durable and atomic with required intent/outbox registration before a received result; browser submission, public DTO or provider delivery cannot supply acceptance.                                         |
| [P25 EX11–EX12](../../../../prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/experience.md:159)                                                                                                                                                                                                         | Older external Request newsletter handoffs are not native membership. Ordinary publication/route edits are prospective; accepted work keeps frozen scope and rechecks current purpose/recipient rules. Page retirement is neither automatic erasure nor stale-public fallback.                                                                                            |
| [D6-C06/C07](../phase28-d6-adversarial-review.md:351), [D7-C12](../phase28-d7-adversarial-review.md:499), [D42-C07](../phase28-d42-verified-email-newsletter-signup-adversarial-review.md:515)                                                                                                                          | Adopt only the selected D6-C07 branch with D43 safeguards. Signup Off is not a global issue-send stop. D42 proof-reuse Off affects subsequent admission method; it does not cancel this pending request or rewrite evidence.                                                                                                                                              |

### Precise protected-action admission gap

P17 currently says: “A tenant contract must bind one exact Party/contact
authority.” P6 separately permits a contract-qualified same-Tenant non-constituent
recipient authority. Those two statements do **not** establish an already
qualified guest protected action. No no-Party exception was found in P17's
protected-action section or its no-Party/non-constituent searches.

**Required narrow owner amendment:** “For the qualified native P28 newsletter
confirmation producer, the tenant protected-action descriptor MAY bind the exact
same-Tenant non-constituent recipient-authority revision and source occurrence
instead of a Party/contact authority. It SHALL use the existing protected-action
protocol, fixed verified Tenant Donor Portal origin, exact assurance and current
source checks. It SHALL create no Party, contact, Auth user, account claim,
workforce assignment or generalized private-access grant. This exception SHALL
not admit arbitrary recipients or other producers.”

This is a formal reconciliation requirement for later `/to-prd`, with the
associated OpenSpec/ADR/owner propagation and runtime fixtures. It does not edit
those artifacts now and does not block recording the bounded product decision.
An affected route must remain unavailable until its real contract is qualified.
The older P32-only newsletter-consent owner wording also retains D42's explicit
native-P28 reconciliation requirement; it is not a new P32 prerequisite.

## Minimal control semantics

| Control or event                                               | New signup through this Page                                                                                       | Already accepted pending request                                                                                                                                                      | Existing subscriptions / issues                                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Page **Show newsletter signup** Off                            | Reject at source acceptance; an open old browser form is not exempt.                                               | May finish and obtain the original required confirmation or a permitted deliberate resend within the original deadline and current rules.                                             | Unchanged; withdrawal remains accessible. No global send stop.                                       |
| D42 **Let signed-in readers use their verified email** Off     | Subsequent new joins use ordinary confirmation where signup is otherwise available.                                | Does not cancel already accepted pending work or reset evidence.                                                                                                                      | Unchanged.                                                                                           |
| Native signup availability Off                                 | Block all native new admission covered by that source control, including other Page entries in its declared scope. | Current confirmation/admission fence; do not dispatch new confirmation effects while disabled. Pending business intent is not automatically revoked.                                  | Membership and withdrawal unchanged; independently lawful issue sending remains under its own owner. |
| Native signup availability On again                            | Current eligible entry may accept fresh deliberate requests.                                                       | Same still-valid, non-revoked source occurrence may finish before the original deadline. Terminal delivery intents do not reset or replay automatically.                              | No backfill, automatic rejoin, issue audience expansion or duplicate sends.                          |
| Actual purpose closure, withdrawal, revocation or supersession | Apply the exact owning restriction.                                                                                | Deny affected completion; fence matching unstarted effects. Reopening cannot revive terminal intent.                                                                                  | Follow the exact source rule; do not reinterpret it as a mere visibility choice.                     |
| Owner or provider unavailable                                  | Show truthful unavailability; never default to allowed.                                                            | Preserve durable known facts and original deadline; fail closed for actions whose current authority cannot be established. An outage is not consent withdrawal.                       | Do not claim sending or successful changes from unavailable evidence.                                |
| Page unpublished, retired or safety-contained                  | Respect current P22/P3 reach and restrictions.                                                                     | Resolve the actual current purpose/recipient policy through the protected source route. Neither blanket permission nor blanket cancellation follows merely from this different event. | No stale public fallback, no hidden Page disclosure and no change to independent lawful facts.       |

No additional “finish pending after Off” toggle, per-reader exception, temporary
grace period or cancellation dashboard is justified. Native availability Off is
a complete stop of **signup admission while disabled**, not a newly selected
permanent cancel-all-pending policy or a broad newsletter-pause product decision.
Its exact scope must be stated on the real owner control. Default capability and
Page activation requirements remain as already governed; missing policy cannot
turn the capability on.

## Lifecycle and correction rules

1. **Admission boundary:** source acceptance and the matching Page-entry change
   must have a defined ordering. If Page Off wins before new acceptance, reject
   the old form's new request. If durable acceptance wins first, the request
   qualifies for A. An ambiguous HTTP response recovers that same operation; it
   does not guess failure and create a new signup.
2. **Original message after Page Off:** keep the original qualified required
   confirmation intent eligible only while the accepted request is valid and
   current source/recipient/send rules allow. Page visibility alone does not
   advance a cancellation fence for that accepted occurrence. No extra notice
   or reminder is created merely because someone hid the entry.
3. **Deliberate resend:** an admitted private receipt/source capability may
   request another confirmation for the same destination and still-pending
   occurrence. Use abuse bounds and source-authorized effect identity; reconcile
   ambiguous existing transport first. A legitimate new resend effect is not an
   identical request replay. Any capability replacement preserves the original
   absolute expiry and prevents superseded proof from completing.
4. **Signup availability Off:** block new and pending admission while Off and
   gate unstarted confirmation effects. This current restriction alone need
   not erase the pending business record. A P6 intent already terminally
   suppressed or superseded stays terminal after On. Any permitted later
   deliberate resend uses the source's qualified recovery/new-effect contract,
   not a status reset or automatic replay.
5. **In-flight transport:** P6 dispatch linearization distinguishes prevented
   unstarted work from an already in-flight, submitted or indeterminate attempt.
   A later Off cannot recall an email. Current source authorization at the
   explicit confirmation action still prevents admission while native signup is
   disabled or a stronger restriction applies. Never report “prevented” for an
   already admitted provider effect.
6. **Address or purpose change:** a different address/newsletter is a new
   instruction, not recovery of this one. It cannot enter through a hidden Page
   or reuse old proof. Another currently admitted entry may offer its ordinary
   fresh flow; existing pending evidence is not retargeted.
7. **Origin and Page independence:** the source-qualified P17 action remains on
   its exact current verified, frozen Tenant Donor Portal origin/path, not a
   tenant-supplied redirect or the hidden public form. Host retirement, reuse,
   stale origin or a current safety failure yields a safe unavailable result,
   not cross-tenant relocation or an old Page snapshot. Use only approved minimal
   review facts; do not expose private Page or referral context.
8. **Completion and replay:** the native source creates or resolves the one
   current exact subscription atomically with durable completion evidence. A
   concurrent eligible D42 Join converges on that membership and supersedes
   obsolete pending proof. Later withdrawal wins current state; an old completed
   operation retry returns its prior result without re-subscribing.

## Material owner concerns and exact prevention

| Finding                                                                                                                              | Severity / likelihood / evidence                                                                                            | Effect on A and required correction                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OR01: “Off” acquires several incompatible meanings. Staff may believe hiding a Page stops every pending request or newsletter issue. | **High / likely** if a generic “Enable newsletters” label is reused. D6-C07, D7-C12 and D42-C07 assign different meanings.  | **Clarifies A.** Keep the control matrix and exact Page helper. Require real source availability Off for stopping new/pending signup admission, without a second pending-mode preference.                                                                             |
| OR02: Browser-opened or delayed submissions masquerade as already accepted work.                                                     | **High / plausible.** P23/P25 source acceptance is durable and atomic, whereas browser state and provider evidence are not. | **Narrows A to source-accepted occurrences.** Add an acceptance-versus-Off race fixture, same-operation recovery and trusted source timestamps/scope.                                                                                                                 |
| OR03: Guest confirmation is incorrectly presented as already admitted by P17, or a fake Party/login is added to fit it.              | **High / plausible.** P17's exact Party/contact requirement differs from P6's non-constituent branch.                       | **Changes owner reconciliation, not the chosen journey.** Adopt the precise no-Party producer exception above through the formal owner process; preserve the one protected doorway.                                                                                   |
| OR04: Hidden or retired public Page content becomes a fallback confirmation authority.                                               | **High / plausible.** P22 current reach, P23 D24 and P17 origin requirements disallow that shortcut.                        | **Narrows presentation.** Confirm through qualified protected source authority with minimal approved facts; no public projection mutation, new audience, hidden-form revival or stale release.                                                                        |
| OR05: Resend, reopening or availability recovery silently resets expiry, replays mail or revives revoked consent.                    | **High / plausible.** P6 terminal effect identity and D6/D42 consent generations are separate from availability.            | **Adds lifecycle precision.** Preserve original deadline, distinguish still-pending source intent from terminal transport, require deliberate authorized resend and never reset terminal effects.                                                                     |
| OR06: A new global stop is accidentally broad enough to cancel issued newsletters or narrow enough to be cosmetic.                   | **High / plausible.** P6 invalidation is exact-fence only; inspected docs do not prove a working native closure UI.         | **Requires a concrete narrow source control.** Native signup Off fences new/pending admission and unstarted proof effects in its declared scope; preserves members, withdrawal and independently lawful issues. No inferred new role or broad purpose-closure choice. |
| OR07: Proposed timing is accidentally adopted through the word “original.”                                                           | **Medium / likely** in status consolidation. D6-C15 remains separately unresolved.                                          | **Preserves scope.** Reference the original owner-approved finite deadline without selecting 72 hours, 24-hour cleanup or retention. Prove boundary behavior with symbolic durations pending that decision.                                                           |

## Required future proof and limits

The parent review should require exact acceptance-before/after-Off races, queued
confirmation across Page Off, resends without deadline extension, source
availability Off/On, a transport intent suppressed while Off, delayed provider
acceptance, stale-origin and wrong-Tenant attempts, concurrent D42 Join,
withdrawal races, expired/superseded proof, hidden-page non-disclosure, inaccessible
owner controls and keyboard/screen-reader operation. Tests must assert visible
and authoritative outcomes, not merely that a button disappeared.

This note establishes documentary compatibility and identifies required owner
amendments. It does not establish a working mutation boundary, RLS policy,
protected no-Party action, configuration screen, delivery contract, performance
limit or deployed runtime proof. Those remain implementation/release gates, not
permission to invent another product decision or claim Phase 28 is shipped.
