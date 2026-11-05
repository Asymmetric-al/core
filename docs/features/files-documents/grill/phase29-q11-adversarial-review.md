# Phase 29 Q11 — fixed deadline at issuance: adversarial review

**Disposition: Accept with required amendments.**

Conrad selected **A — Fix the deadline at issuance** on 2026-10-20 and
ratified the exact corrected decision and complete required amendment package
on 2026-10-21 (Asia/Bangkok). Q01–Q10 remain ratified. This is adopted grooming
intent, not formal specification publication, implementation or activation.

## Evidence, scope and limits

Local Core and live GitHub `develop` were reverified at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab`.
This review combines current owner contracts, bounded source/migration inspection,
primary technical/product guidance, and independent
[owner](phase29-q11-owner-adversarial.md),
[runtime](phase29-q11-runtime-adversarial.md) and
[UX](phase29-q11-ux-adversarial.md) reviews. The
[researched question](phase29-q11-question.md) preserves the alternatives.

- **Ratified intent:** private recipient confirmation/current authority;
  purpose-bound files; durable receipt and correction lineage; exact own-file
  reads; bounded completed access; Q07's 720-hour maximum; Q10's prospective,
  separate finite unfinished and completed stages.
- **Ratified Q11 intent:** establish the original unfinished end at original
  source access issuance rather than first entry, with the complete required
  amendments explicitly adopted on 2026-10-21.
- **Current implementation:** account authentication, provider sending,
  workflow handoff and database examples are adjacent capabilities. The bounded
  census does not establish a qualified native request-issuance lane.
- **External fact:** comparable products use explicit request deadlines and
  distinguish authentication, delivery and business completion. None chooses
  Core's initial duration or proves its exact authorization contract.
- **Product judgment:** a known original end is a simpler ordinary task model.
  It trades away working time lost before first entry. That cost must be made
  workable, not hidden behind the word “issued.”
- **Unknown:** the initial numerical/calculation policy, precise native source
  capability and transaction mapping, real-role/provider behavior, actual
  recipient/reviewer completion times and intended-user usability.

Severity describes the consequence if an omission is implemented. Likelihood
is qualitative engineering judgment, not an observed incident rate. This review
does not claim a production native-issuance exploit or a representative user study.

Selected repository evidence, relative to `/home/conrad/code/core`:

| Evidence                                                                                                     | Consequence for this decision                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`; `docs/ai/document-authority.md`; `openspec/project.md`                                          | Owner intent, generated projections, implemented behavior and qualification are distinct. This local package does not activate a source or amend unrelated owners.                                                      |
| `openspec/specs/platform-principles/spec.md`; `platform-boundaries/spec.md`                                  | Operational truth, tenant safety, scoped surfaces and fewer unnecessary steps govern the tradeoff. CMS, Site, templates and account roles do not own request authority.                                                 |
| `docs/adr/0025-producer-owned-protected-actions.md:28–50,74–92`                                              | Source owns issuance and assurance; new credentials have new prepared-message identities; GET/HEAD cannot create business effects. A credential/message identity is not original request access identity.               |
| Same ADR, host/doorway and Phase24 D57 clauses                                                               | Frozen exact tenant host and current host qualification apply. Neither delivery repair nor a replacement link may move the request to a platform/Site/provider fallback.                                                |
| `docs/adr/0037-scanner-safe-exact-artifact-access.md:45–67,83–88`                                            | POST alone is not proof of human intent; specialized official-document lifetimes are not native request defaults.                                                                                                       |
| Feature ADRs 0001, 0003, 0007–0010                                                                           | Confirmation is not membership; pending correction fences its predecessor; fulfillment, expiry, current permission and fresh access retain their exact scopes.                                                          |
| `docs/prds/workflow-studio/01-product-and-experience.md:65–77`; `12-owner-bindings-and-decisions.md:68–85`   | Existing Workflow external-task language requires source qualification; its suggested 14-day value does not settle this initial access period.                                                                          |
| `packages/api/src/auth/callback.ts:6–17,28–59`; `packages/ui/components/auth/LoginScreen.tsx:142–170`        | Account login/callback is not exact native request issuance or a new clock.                                                                                                                                             |
| `packages/api/src/email/template-test-send.ts:254–288`; `email/webhooks/resend.ts:639–646,688–710,737–751`   | Test-send/provider timestamps describe communication, not original request admission.                                                                                                                                   |
| `packages/api/src/workflows/ledger.ts:117–175,279–328`; work-claim migration `20260611181000`                | Durable transport/recovery exists; it does not by itself make a new business issuance, audit and handoff atomic. Worker lease expiry is not recipient expiry.                                                           |
| `docs/guides/architecture/data-access-boundary.md`; `packages/api/src/shared/with-operation.ts:128–167`      | Source business commands stay in `packages/api`; privileged paths need the same exact source checks, not a browser-RLS assumption.                                                                                      |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1542–1587,1643–1654,1670–1672`  | Sole capability PDP, coarse tenant RLS, live administrative scope/ceilings, exact grant dependencies, tiered egress audit and required mutation boundary govern. Q11 cannot select an alternative model.                |
| `packages/auth/context.ts:240–338`; `permissions.ts:61–117`; membership RPC migration `20260802041500:22–50` | Current source revalidates the user and caller-scoped memberships, but retains a broad profile-role compatibility path. That implementation is not the qualified P12 capability contract or native issuance permission. |
| `packages/email/resend/send.ts:123–185,188–208,245–296`                                                      | Adapter failure covers both no-send validation and exhausted transport attempts. It cannot prove that a source transaction rolled back or a provider never accepted a message.                                          |

Detailed role, adapter, migration and installed-version observations are in the
runtime note. Existing sound authentication checks are credited there; broad
statements that Core merely trusts JWT role claims would be inaccurate.

### Current external comparison

| Primary source checked                                                                                                                                                                                                                          | Supported lesson and boundary                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Box request settings](https://support.box.com/hc/en-us/articles/360045304813-Using-File-Request-to-get-Content-from-Anyone); [ShareFile request options](https://docs.sharefile.com/en-us/sharefile/sharefile-app/sharefile-web/request-files) | Explicit request expiry is a credible product pattern, and sign-in is separate. Neither supplies the ordinary Core lifetime, source event or identity model.                                              |
| [Content Snare email troubleshooting](https://contentsnare.com/help/knowledge-base/my-client-doesnt-receive-emails/), updated 30 April 2026                                                                                                     | Filtering, suppression and disabled communication can stop an invitation independently of the request. Its settings and suppression-removal powers are not imported.                                      |
| [Amazon SES event terminology](https://docs.aws.amazon.com/ses/latest/dg/monitor-using-event-publishing.html); [Resend event types](https://resend.com/docs/webhooks/event-types)                                                               | Send acceptance and delivery to a recipient mail server are different evidence. Neither proves human reading or source authority. SES is a comparator, not a proposed provider change.                    |
| [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)                                                                                                                                                                 | Its documented 24-hour send-key window supplements durable source identity. Expiration of that window cannot justify issuing access again.                                                                |
| [Foundant follow-up logic](https://support.foundant.com/hc/en-us/articles/4411213334935-Follow-Up-Submission-Logic), updated 15 December 2025                                                                                                   | Submission and administrator completion differ. This supports truthful next-actor status, not a particular initial duration or promise of readback.                                                       |
| [Microsoft false-click guidance](https://learn.microsoft.com/en-us/defender-office-365/attack-simulation-training-faq)                                                                                                                          | Security inspection can produce clicks without recipient action. Core must keep its actual proof/source boundary.                                                                                         |
| [GOV.UK check answers](https://design-system.service.gov.uk/patterns/check-answers/); [service-problem guidance](https://design-system.service.gov.uk/patterns/problem-with-the-service-pages/)                                                 | Review meaningful terms and explain service failures and preserved work honestly. Apply the interaction lesson within Core's existing components; add no extra ceremony or invented restoration estimate. |

These are documented product/technical behaviors, not live comparator tests or
measured ministry preferences. No direct evidence shows a single best clock for
all organizations. W3C guidance informs the accessibility requirements below;
the UX note records source dates and scope. Research was limited to genuinely
comparable behavior; generic CRM tasks, CMS publishing and giving checkout
timers do not determine private-request access.

## Adversarial check

### What could go wrong with this answer?

“Issuance” could mean draft creation, each credential, each email attempt or
first delivered message. Those interpretations produce different ends and
accidental renewal. A lost reply could lead to a second grant. A grant written
without a working qualified doorway could be called usable. Issuing access to
an already-completed request could fabricate historical completed eligibility.
Fix the source act, effect identity, independent outcomes and causal history.

### What hidden assumptions are we making?

We do not yet know the useful period, source issuer capability, exact fulfillment
predicate, real delivery delays or review workload. Neither “staff” nor
“invitation created” proves authorization. Initial source eligibility may exist
before a recipient visit, but required confirmation still governs protected use.
An existing expiry field or timer does not establish the needed policy.

### How does this affect the whole product?

One source-owned deadline must be consistent across staff, donor, missionary,
request-only access, background work and authorized reporting. Communication,
credential and custody owners retain their responsibilities. Site/CMS/template
edits cannot change permission. Specialized official-document, giving or
workflow rules are not silently replaced by this ordinary-source policy.

### How does this affect the end-user experience?

A gives one predictable end. It can also leave little time when delivery,
connectivity or staff review is slow. Keep the actual date visible, preserve
received work, identify the next actor, and give owned help. Do not repair
confusion with repeated confirmations, blame, forced download, silent extensions
or emailing private attachments.

### Does this follow modern best practices?

Explicit expiration is a documented collection pattern, but no universal
initial interval exists. Current guidance supports accessible dates/statuses,
precise authorization, durable retry identity and separate delivery outcomes.
Competitor resumption or extension features do not authorize those powers here.
The source comparison below qualifies what each example actually proves.

### Does this fit Asym’s existing repo and product direction?

Yes, with source-owned access issuance, P4/P12 authority, ADR-0025 transport,
P17/P6 communication, shared custody and Base UI/base-maia. It does not turn
Asym into a drive, create broad guest membership or add a second permission
service. Existing generic code is a reuse candidate, not qualification proof.

### Should we adjust the recommendation?

Keep A, narrowed to the **original source access issuance** and an immutable
original unfinished end, subject to genuine restrictions. The strongest B
remains a finite entry window followed by a finite first-entry working period.
It better preserves work time after late discovery and is not inherently unsafe.
A wins on predictable ordinary task behavior, not a fabricated industry mandate.
If a cohort cannot work within its eventual initial terms, do not activate that
cohort on the assumption staff can extend it.

## Corrected decision to record

For a new ordinary Private Document Request, the owning source SHALL establish
and durably preserve the finite original unfinished-access deadline when it
first authoritatively makes that exact recipient's purpose-bound request access
available under its complete approved policy. This **Document Request Access
Issuance** is distinct from draft/task creation, notification, credential
issuance, recipient confirmation and fulfillment. It does not itself prove that
the recipient has received, read or acted on anything.

Issuance SHALL resolve the actual finite end once from trusted source context
and the policy applicable to that effect, preserving its calculation/limit
scope and original outcome. The numerical period, calculation convention and
any staff editing/extension capability remain separate decisions. Missing,
nonfinite, invalid or already-ended initial terms cannot produce a new
currently available admission. A pre-issuance preview SHALL distinguish a rule
or estimate from the actual committed result, and material approval/precondition
conflicts SHALL not silently change the authorized terms.

Original access identity, protected credential identity and communication
identity SHALL remain separate. Concurrent issuers, retries, lost responses,
provider failures, credential replacement, visits, proof renewal, due-date
edits and policy-default changes cannot create a later original end or duplicate
the same business admission. A genuinely new or changed admission requires its
own explicit source procedure; Q11 creates no such power.

Resolve any existing effect for the stable source intent before calculating
new timing. Original issuance time and resolved end are outputs of the first
admitted effect, not newly computed intent fields to compare on each retry.
Changing wall time or a default must neither reset the end nor falsely reject
the same intent; genuinely conflicting source/recipient/material reviewed
inputs still fail under the exact command contract.

The source SHALL prove exact issuer capability and current tenant/environment,
recipient revision, purpose, resource, stage, host and applicable policy at the
authoritative decision boundary. Issuance, required historical evidence and
durable follow-up intent SHALL be coherent and recoverable. Revalidate relevant
state/time after waits; an early SQL timestamp or a provider event cannot
manufacture eligibility. Define the source occurrence/linearization contract,
including rollback, physical commit after a boundary and unknown outcomes.
No provider call may be held under source locks.

A qualified path to entry is an activation precondition. Known unsupported
hosts, transport or assurance cannot be marketed as usable merely because a
grant row was written. After a real issuance, delivery/entry outages are
separate faults: preserve the original act and end, deny unsafe access, recover
under the same authorized effect and expose an accountable status. Do not
silently re-anchor the deadline to first successful repair or delivery.

“Fixed” preserves the original end; it does not defeat genuine revocation,
shortening, purpose restrictions or current action checks. Removing a genuine
shortening cause cannot revive the longer end. Repairing a representation or
proof outage is different from a permission extension. Q10's unfinished-stage
scope remains: eligible normal fulfillment can admit the separately bounded
completed stage; a stale unfinished expiry cannot cap or erase that valid stage.

Completed admission requires the original source admission and applicable
historical eligibility to have existed at the fulfillment's causal decision
point. An otherwise permitted source may fulfill before the recipient's first
visit; no browser must be open. First issuing access after an already-existing
completion cannot backfill ordinary completed eligibility. A legitimate atomic
source operation needs causal ordering and eligibility proof, not an arbitrary
strict inequality between timestamps rounded to the same precision.

Show one coherent source request with the actual applicable end, requested-by
target separately labeled, truthful receipt/review state and permitted own-file
actions. Preserve the qualified entry flow without a timer-start ceremony.
Display delivery, access, proof, file readiness and source completion honestly;
temporary proof failure is not a claim of expiry. Staff review delay must not
become recipient lateness.

Before activation, qualify the complete finite calculation, useful recipient
and staff-review opportunity, exact source permissions, database/current-use
enforcement, concurrency/recovery, real browser/assistive-technology journeys
and rollout/restore behavior. Preserve source retention, audit minimization,
independent file uses and all Q01–Q10 requirements. No general drive, new
notification cadence, grace, active-expiry recovery or Q08 timing setting follows.

## Ownership, invariants and lifecycle

| Fact                                                                        | Authoritative owner / consequence                                                                                                                                                      |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Original request purpose, intended recipient/revision and issuer capability | Exact requesting source with P4/P12. Account identity, shared email and staff task visibility do not independently grant issuance power.                                               |
| Original access issuance and original unfinished end                        | Owning source durable business effect, policy/calculation provenance and applicable scoped limits. Templates, provider logs, browser clocks and activity are projections/observations. |
| Recipient confirmation and current assurance                                | Qualified source/P4 entry contract. Successful account sign-in is not universal proof for this request.                                                                                |
| Credential issuance and prepared communication                              | Source credential owner and P17/P6 transport. New credential/message identity is permitted only by its own contract and never silently resets original access.                         |
| Received versions and correction lineage                                    | Source submissions plus shared custody. Receipt, safe representation and business acceptance are distinct.                                                                             |
| Normal fulfillment and completed admission/end                              | Exact source under Q06–Q10; source outcome may succeed without recipient admission.                                                                                                    |
| Rendering/status/reporting/cache                                            | Source-authorized projections. A cached date is not current permission or mutation authority.                                                                                          |
| Retention/disposal and independent uses                                     | Owning records/custody policies. Expiry neither deletes retained evidence nor recalls downloaded copies.                                                                               |

Q01's already-ratified closed native document-request participant successor
still needs exact P4/P12 and P17/P6 integration before activation. Current
membership-backed contexts do not acquire that capability from a deadline.
Do not invent a fifth generic context, fake Party, anonymous exception or
profile-role fallback. P12's sole capability resolver remains the authority;
RLS stays its coarse tenant defense rather than a second capability engine.
The current implementation gap is explicit, not an additional founder choice.

Let `I` mean the original qualified source issuance occurrence and `U0` its
resolved original unfinished end. These are explanatory names, not schema
requirements. For a new live admission, the qualified decision must establish
a valid finite future end. The admitted result is preserved:

- The same business issuance has **one original `I`, one admitted policy result
  and one `U0`**, even if it has several allowed credential/message identities.
- Later current restrictions may shorten or stop unfinished access. Clearing a
  restriction cannot erase genuine shortening history. Every limit retains
  action/stage/purpose scope.
- `U0` is not recomputed from today's policy, current requested target, locale,
  template or first visit. Source-authorized projections display its currently
  applicable consequence.
- Timestamp ordering alone does not prove causal authorization. Original
  admission/eligibility must exist at normal fulfillment, including legitimate
  same-transaction outcomes with equal displayed timestamps.
- After actual unfinished expiry, a new visit cannot create initial or completed
  rights. Delayed recovery of a proved prior effect uses its original terms.
- Q10's valid completed stage uses the original fulfillment and Q07 maximum,
  with true overall caps; the old unfinished-only end does not survive as an
  unrelated ceiling.
- Required effect/audit/continuing-dependency facts remain immutable while
  retained, with authorized disposition rather than a requirement to retain
  private data forever. A purged transport key cannot make the old business
  effect new.

No particular initial value or even `U0 = I + N days` is selected. An absolute
source date can also be fixed at issuance under an approved rule. The later
decision must define units, precision, elapsed/civil arithmetic and timezone
handling where applicable. Reject invalid/null/infinite values; do not rely on
SQL null behavior or a time-varying CHECK constraint to enforce current expiry.

PostgreSQL distinguishes transaction-start time from current clock time.
Source authorization must account for waits, rollback and uncertain commit;
no timestamp function alone proves physical commit or correct serialization.
Relevant permission/policy changes and missing-row creation races need one
coherent source order. Current enforcement cannot depend on expiry sweep timing.
[PostgreSQL time functions](https://www.postgresql.org/docs/17/functions-datetime.html),
[transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html).

| Condition or transition                                                | Required outcome                                                                                                                                     |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Draft, copied template, prepared task or scheduled intent only         | No original access clock or entitlement from those facts alone.                                                                                      |
| Qualified issuance with complete permitted terms                       | Preserve one original effect/end and return its actual result under current disclosure authority.                                                    |
| Source denies actor/recipient/host/policy or no usable finite interval | No new live admission; explain the safe staff action without exposing unrelated private facts.                                                       |
| Issuance definitely rolls back                                         | No issued-right claim or dependent send; a later authorized attempt is evaluated afresh.                                                             |
| Issuance outcome is unknown                                            | Reconcile the same effect; do not assert failure, resend blindly, backdate or create a new end.                                                      |
| Issuance committed, notification not sent/unknown/failed               | Preserve `I/U0`; show source and delivery outcomes separately and recover only authorized communication.                                             |
| Relevant wait crosses a permission or temporal boundary                | Apply the qualified source order and fresh checks; an early timestamp cannot admit an invalid action.                                                |
| Two authorized staff or automation deliveries race                     | One original semantic effect; distinguish duplicate intent from a different authorized operation.                                                    |
| Later default, requested target, locale or display timezone changes    | Original result persists; current true restrictions still apply.                                                                                     |
| Credential replaced, another device enters, proof refresh succeeds     | Current proof may restore permitted use of the same access; no time reset or role enrollment.                                                        |
| Incorrect recipient/contact revision or host no longer qualified       | Stop unsafe affected use/issuance; use explicit source correction/reissue procedure, no same-email or host fallback.                                 |
| Source fulfills before first recipient visit                           | Apply Q10 only if original admission and at-fulfillment eligibility already existed.                                                                 |
| Source was already complete before first access issuance               | No manufactured ordinary completed admission from historical completion. Existing authorized recovery/fresh paths retain their own conditions.       |
| Source validly issues and fulfills in one atomic operation             | Only if its existing predicates permit it and causal eligibility is proved; equal timestamp precision is not a reason to invent or reject authority. |
| Candidate upload/correction starts before end but is unadmitted at end | No start-time grace. Preserve prior durable submissions and reconcile unknown outcomes; Q03 remains binding.                                         |
| Timely source fulfillment is observed later                            | Recover the original eligible stage/end; do not reset from consumer or repair time.                                                                  |
| Actual source completion occurs after unfinished authority ended       | Source work may complete independently; no ordinary recipient revival or automatic Q08 fallback.                                                     |
| Reopen, clone, new purpose or recipient reassignment                   | No implicit restart; use only explicit owning-domain procedures, retaining original history.                                                         |
| Restore/old worker carries earlier permissive state                    | Reconcile authoritative effect and adverse history before serving; do not resurrect access.                                                          |

## Recipient, staff and recovery journeys

### 1. Prepare and issue

Authorized staff work in the existing source context. Show purpose, intended
recipient through permitted data, requested work and the initial timing rule.
Do not force a manual date picker or a second confirmation merely to start
time. When the exact end depends on actual issuance, label the preflight
estimate/rule accordingly and display the resolved result after success.

Check current issuer capability, recipient revision, host and policy at issue
time. A user who can review files is not necessarily permitted to issue access.
A preview cannot preserve permission through later revocation. If an approved
input or promised boundary is materially incompatible at commit, return an
actionable conflict rather than silently widening it. No implicit bulk-issuance
feature is added; if an existing source batch exists, each effect and partial
outcome must remain attributable.

### 2. Observe issuance and communication

After durable issuance, staff can distinguish **Access issued** from
**Invitation pending**, **Invitation failed** or **Delivery status unknown**,
where their role permits those facts. Do not label a queued send “recipient
notified.” A provider delivery result does not prove inbox placement or reading.

A timed-out command should show “We’re checking whether this request was
issued,” while the system resolves the same effect. Do not make staff create a
duplicate request to discover whether the first one succeeded. A known
notification failure is not a rollback of access; supported resend/replacement
uses its own authorized mechanism and retains the original end.

If a source cannot provide a qualified entry route at all, do not enable the
cohort. If it breaks after issue, expose an owned fault, preserve history and
repair safely without promising recovered time. That is a readiness problem,
not a justification for first-entry anchoring behind the user's back.

### 3. Arrive and confirm

Email links, portal/task entry and any other already-qualified route resolve
the same source context. The ADR-0025 tenant-host doorway, inert GET/HEAD,
deliberate proof and current source checks remain. Never expose a private
request's title, recipient, deadline or existence to an unqualified visitor.

A compatible proof can be reused only as qualified by Q01; no new membership
or timer-start ceremony. A failed code request or confirmation-service outage
must not be called “expired request.” Offer safe retry/help for that actual
state. New technical proof neither reissues the source access nor extends it.
If the request has already validly completed, enter its current read-only view.

### 4. Understand and do the work

The main content shows the requested work, actual next action and relevant
time. A useful ordinary label is:

> Access while this request is unfinished ends [localized date, time and zone].

Show **Requested by** separately when present. Add Q10's brief conditional
explanation of completed reading when needed; do not overload the first screen
with internal lifecycle terms. If an independent earlier restriction controls,
show the actual permitted consequence without disclosing a sensitive reason.

Allow the existing permitted selection/upload/correction workflow. Receipt
confirmation identifies the exact submission; progress is not receipt.
Resuming on weak connectivity reconciles server-confirmed work and does not
claim that a locally selected but unsent file was saved. Starting before expiry
does not imply a grace period. Exact file/action limits stay as previously owned.

### 5. Submit, correct and wait for review

Use **Received — awaiting review** when true. Distinguish remaining recipient
work from the organization's review. On-time submitted work does not become
late solely because staff have not completed review.

Corrections are still immutable new submissions with Q03 predecessor fencing,
acceptance/freeze constraints and exact scope. A correction cannot reset the
original end. The staff view shows the same actual access consequence, with
current reviewer authority, without encouraging premature acceptance merely to
beat the deadline. Quantitative cohort qualification must include review time.

### 6. Return, renew proof and change context

Returning on another device or obtaining new proof preserves the original
end and qualified current file/history scope. Do not make users remember which
invitation is “the one that started the clock.” Handle superseded credentials
through the source's existing safe entry/recovery contract.

Name/address/locale changes are not authority transfer. A contact correction,
recipient reassignment, tenant-host change or staff departure needs its exact
owner rules and current dependency checks. Do not infer that all staff departures
either revoke or preserve every source admission. The user sees a safe,
actionable outcome, not a leaked internal permission diagnosis.

### 7. Complete, expire or become unavailable

Eligible source-confirmed fulfillment moves to Q10's completed view and displays
its actual read end; no browser needs to be open. The original unfinished
deadline no longer caps that valid stage solely through its former scope.
Current permitted previews/original downloads and concise history remain bounded.

At genuine unfinished expiry, remove actions that can no longer succeed and
give the owned help route. Do not delete received evidence, label everything
rejected, require another upload, or promise a fresh completed grant where none
was originally admitted. If a current outage merely prevents observation,
show uncertainty rather than fabricate expiry/completion or an empty history.
Preserve other independently authorized actions during a partial component failure.

### 8. Resolve faults, appeals and new work

Support can inspect only its authorized evidence: source issue, immutable terms,
delivery/proof status, current limits and relevant receipt/fulfillment. It
cannot impersonate the recipient, edit SQL dates, clear adverse history or
use email attachments to bypass permission.

Ordinary repair recovers the same effect and current rights. Genuine new work,
extension, active-expiry recovery and Q08 fresh access remain separate owner
decisions. Retained copies are not a personal storage entitlement. No new
reminder, satisfaction tracker, appeal workflow or escalation queue is created
by this review.

### Accessibility and constrained conditions

Keep shared Base UI/base-maia and semantic Zinc tokens. Dates and statuses are
text in the main flow, not color/countdown/toast-only information. Announce
meaningful asynchronous results without focus theft; provide readable errors
and preserve appropriate focus on retry. No per-second live-region countdown.

Qualify keyboard/speech/screen-reader interaction, touch targets, zoom/reflow,
RTL, translated long strings and actual small-screen workflows. Display a
consistent instant with explicit timezone and enough precision; avoid ambiguous
numeric dates and false “end of day” copy. Names are display text, not identity
keys; do not add Western name/address forms to a request-only flow.

Timing and proof must be assessed separately. WCAG 2.2's longer-than-20-hours
exception under 2.2.1 is not a recommended duration or blanket exception for
shorter proof/session/upload timers. Accessible authentication is 3.3.8 AA;
2.2.5 Re-authenticating is AAA, not an AA claim. Actual accessibility still
needs browser/manual proof.
[Timing guidance](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html),
[accessible authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html),
[re-authenticating](https://www.w3.org/WAI/WCAG22/Understanding/re-authenticating.html).

## Exact required amendments

These are ratified grooming clauses for later authorized canonical publication.

| ID                                     | Required language                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q11-C01 Original source issuance       | The source SHALL define one original access-issuance effect for the exact tenant/environment, purpose, request and recipient revision. It SHALL establish access availability under approved policy, distinct from drafts, task creation, credentials, delivery, confirmation and fulfillment. Caller-controlled metadata SHALL NOT manufacture the act or attribution.                                                                                                                   |
| Q11-C02 Complete finite terms          | At issuance the source SHALL resolve and preserve a valid finite original unfinished end. Null, infinity, invalid arithmetic and already-ended live admissions SHALL be rejected. Initial count, calculation units/calendar convention and any editing power SHALL be explicitly selected and qualified before activation, not borrowed from credential or other-purpose defaults.                                                                                                        |
| Q11-C03 Immutable admitted result      | The original policy/calculation result and applicable limit scopes SHALL be recoverable unchanged. Due-date/default/locale/template changes SHALL NOT recompute the end. Preflight estimates and actual results SHALL be distinguished; material actor-approval or command-precondition conflicts require safe reconciliation, not silent widening.                                                                                                                                       |
| Q11-C04 Exact authority and entry      | Issuance SHALL prove the issuer's exact source capability and current source/recipient/host/policy, independently of task visibility or broad staff role. Required Q01 confirmation/current proof remains necessary for protected use. GET/HEAD/scanner activity, generic login and return visits SHALL neither issue access nor restart time.                                                                                                                                            |
| Q11-C05 Business idempotency           | Duplicate/concurrent commands SHALL converge on one original semantic admission despite new transport keys, retries and crashes. Resolve an existing effect before computing new timing/defaults: original issuance time and end are first-admission outputs, not regenerated intent fields. Same-intent retry SHALL recover them; conflicting material intent SHALL fail. A new credential/message SHALL NOT create a new source period. Scope uniqueness to the actual owner lifecycle. |
| Q11-C06 Coherent durable effect        | Required issuance terms, actor/policy evidence and durable secondary-effect intent SHALL be atomic or equivalently recoverable under a proved fail-closed source contract. No orphan live admission or phantom send may arise from partial writes. Unknown commit SHALL be reconciled before new effects or destructive compensation.                                                                                                                                                     |
| Q11-C07 Time and concurrent changes    | Qualify issuance occurrence/linearization, authoritative current time and relevant source/permission order after waits, including repeated waits and physical commit across a boundary. Rollback creates no issuance. An old transaction timestamp, stale lease or provider timestamp SHALL NOT establish authority; provider calls SHALL NOT occur under source locks.                                                                                                                   |
| Q11-C08 Restrictions and nonextension  | Preserve the original end while honoring true scoped revocation/shortening and current action restrictions. Clearing a genuine shortening cause SHALL NOT restore a longer end. Reauth, delivery repair, activity, due edits, copying, reopening and replay SHALL NOT automatically extend/reissue source authority.                                                                                                                                                                      |
| Q11-C09 Credentials and communication  | Preserve separate original admission, credential and prepared-message identities. Replacement credentials follow their owning contract, including new message identity where required, while retaining original source terms. Delivery retry/failure/open/click SHALL NOT start, pause or reset recipient time or widen scope.                                                                                                                                                            |
| Q11-C10 Fulfillment causality          | Ordinary completed admission SHALL require original source admission and exact historical eligibility at the qualified fulfillment decision, before its applicable unfinished end. First issuance after earlier completion SHALL NOT backfill that eligibility. Qualified pre-visit or atomic source fulfillment remains possible without an online browser or arbitrary strict timestamp separation. Q07/Q10 limits and no-revival rules remain binding.                                 |
| Q11-C11 Honest outcome recovery        | Distinguish issued/not issued/unknown, communication outcomes, assurance, file readiness, source completion and current access. Temporary proof/observer failure SHALL NOT be presented as proved source-access expiry/revocation or a definitive not-issued outcome; protected use still fails closed until current proof and authority are established. Recover the same result only under current disclosure authority.                                                                |
| Q11-C12 Structural authorization       | Enforce same-scope relationships, required finite values, semantic uniqueness, immutable original facts, trusted attribution and deliberate delete rules. Actual grants, effective USING/WITH CHECK, views/RPCs, definer/service and storage paths SHALL reject forbidden state transitions. Preserve P12's sole capability resolver, coarse tenant RLS and owning mutation boundary; qualify Q01's exact participant successor, not a generic new context or profile-role fallback.      |
| Q11-C13 Current private use            | Apply current exact source/recipient/action/representation authority on metadata, history, previews, originals, replay, full/HEAD/range/conditional/resume and stream paths. Cached dates or valid technical tokens SHALL not authorize access. Preserve Q04's expiry/revocation/stream contract and Q10's stage-aware expiry; no job-lag grace.                                                                                                                                          |
| Q11-C14 Truthful task UI               | Keep one source context, separate Requested by and actual access end, clear next actor, received/review/current-file states and scoped staff delivery diagnostics. Do not blame recipients for review, require timer-start confirmation, force downloads, create duplicate requests for retry or promise unselected recovery.                                                                                                                                                             |
| Q11-C15 Accessible temporal UX         | Preserve Core's shared UI system and qualify actual keyboard/AT/mobile/reflow/RTL/localized date and authentication flows. Show a stable truthful instant and timezone; essential information SHALL not depend on color, countdown, toast or tooltip alone. Evaluate each actual timer against applicable accessibility requirements.                                                                                                                                                     |
| Q11-C16 Owned lifecycle changes        | Recipient/host/purpose changes, issuer dependency loss, factual correction, reopening, new work and active-expiry recovery SHALL use explicit owner procedures with prior facts preserved. No broad rule that staff departure always revokes or preserves access, no retargeting by email match, and no implied new extension capability.                                                                                                                                                 |
| Q11-C17 Retention and privacy          | Access expiry SHALL not determine evidence deletion, holds or independent file-use permissions. Retain minimal required original/effect/adverse provenance under owned retention/disposal rules. General logs, messages and caches SHALL not contain private file details, raw proof, sensitive reasons or durable bearer material. No download-recall claim.                                                                                                                             |
| Q11-C18 Provider and route readiness   | Activate only a qualified source entry/host/assurance/communication contract. A known unsupported path SHALL not be called usable. Post-issuance failures retain original history/end and trigger owned safe repair; provider success/failure/unknown SHALL not rewrite authority or authorize platform/Site/provider-host fallback.                                                                                                                                                      |
| Q11-C19 Bounded implementation         | Reuse source/PDP/custody/communication/recovery infrastructure with scoped indexed reads, bounded pages/retries and measured per-cohort budgets. Preserve existing P12 R6 governed-read and owner-required mutation-fence contracts. No new global serialization, full-history scan per use, provider call per authorization, second timer service or generic permission engine follows from Q11.                                                                                         |
| Q11-C20 Durable explainability         | Authorized history SHALL explain who issued what scope, under which original terms, with which outcome, restrictions and recoveries. Distinguish business/security evidence from operational telemetry. Do not infer actual receipt, reading, human intent or device saving from transport events.                                                                                                                                                                                        |
| Q11-C21 Compatible rollout and restore | Use prospective qualified cohorts, explicit policy/type mappings and compatible readers/writers/workers. Never backfill issuance from email/task timestamps or replace unknown ends with defaults. Mixed versions, restore and rollback SHALL preserve original effects and adverse history; unsafe fallback stays closed until reconciled.                                                                                                                                               |
| Q11-C22 Readiness and trace            | Prove an adequate complete finite policy, recipient/reviewer/help journeys and real-role/concurrency/provider/UI behavior before activation. Trace Q11 through glossary/ADR, authorized canonical owners/generated OpenSpec, tasks/tickets and release evidence. Numeric policy, active recovery, Q08 settings and notifications remain explicit decisions; selected documents and adjacent tests are not native qualification.                                                           |

## Category-by-category adversarial review

### 1. Problem validity, necessity, and alternatives

**Material concern: yes. Severity: medium. Likelihood: plausible.**
A fixed end can solve ambiguity while still giving late recipients too little
usable time. There is no measured Asym cohort evidence establishing that any
particular duration works. Strongest B offers finite entry plus finite work,
not unlimited storage. Existing source infrastructure is the no-new-platform
alternative; its unrelated default does not supply this policy. **Effect:**
retain A as a simplicity judgment, narrow claims of “best” and leave the count
open. **Permanent fix:** require usable source/recipient/review qualification
before activation and avoid freezing an arbitrary formula. Exact changes:
C01–C02, C19, C22; P01, P28–P30.

### 2. Brittleness

**Material concern: yes. Severity: high. Likelihood: likely if implicit.**
Using `created_at`, first send, current defaults or a successful callback for
issuance works only when drafting, delivery and entry coincide. Current
callback/send/webhook seams show that they are different events. Changes in
providers, resends or scheduling then move access. **Effect:** narrow “issuance”
to the durable original source effect. **Permanent fix:** freeze the admitted
result and qualify event mappings independently from transport; exact C01,
C03, C09, C18 and P02–P04, P09, P13 prevent this interpretation.

### 3. Technical debt

**Material concern: yes. Severity: high. Likelihood: plausible.**
Adding another `expires_at` to generic tasks or deriving dates separately in
apps creates competing authorities. Q10 already separates stage/purpose
limits; the data-access guide owns commands in `packages/api`. Generic
handoff/lease helpers do not prove atomic issuance. **Effect:** retain A,
change the implementation requirement. **Permanent fix:** one owner command
and projection contract, explicit original-versus-current terms and reusable
existing infrastructure. C03, C06, C12, C19; P07, P20, P25, P28.

### 4. Edge cases

**Material concern: yes. Severity: high. Likelihood: plausible.**
Drafts held for weeks, two devices, same-timestamp issue/fulfill, completion
before first visit, timezone changes and proof expiry can select the wrong
clock or wrongly deny a valid outcome. These are distinct under Q01/Q10 and
ADR-0025. **Effect:** constrain A's event/order semantics; do not add new
workflows. **Permanent fix:** distinguish causal order, original terms and
technical proof, and use the lifecycle matrix. C02–C04, C07, C10–C11, C15;
P02, P08, P11–P16, P24, P27.

### 5. Footguns

**Material concern: yes. Severity: high. Likelihood: likely without guards.**
A “Resend,” “Copy,” “Reopen” or new idempotency key could accidentally grant
more time; clearing a failed-send flag could erase a real restriction. A manual
date editor could ship despite no owner approval. ADR-0025 explicitly permits
new credential/message identities, making conflation a concrete trap.
**Effect:** narrow A; these are not renewal controls. **Permanent fix:** preserve
semantic original identity and require explicit owner lifecycle procedures.
C05, C08–C09, C16; P05, P09–P10, P17–P18.

### 6. Tenant safety

**Material concern: yes. Severity: critical. Likelihood: plausible.**
Reusing an issuance/replay result across tenant, environment, request, recipient
revision or host can disclose private metadata or grant the wrong scope.
Platform boundaries and ADR-0025 require exact ownership; provider IDs and
global email matches are insufficient. **Effect:** A remains valid only with
structural scoping. **Permanent fix:** same-scope relationships, scoped semantic
keys, trusted host/context and current disclosure on replay. C01, C04–C05,
C12–C13, C18; P06, P19–P21, P23.

### 7. Database, RLS, and authorization safety

**Material concern: yes. Severity: critical. Likelihood: plausible.**
An actor allowed to view a request could update its recipient/end or invoke a
privileged issuer. A permitted old row could become a cross-tenant or longer-lived
new row. RLS policy composition and service paths matter; no native deployed
policy is established by this review. **Effect:** adds release-blocking
structural proof, not a claim of a live exploit. **Permanent fix:** C04, C07,
C12 and P06, P19–P20 require exact issuer capability, same-tenant FKs, mandatory
finite terms, appropriate uniqueness/indexes, controlled defaults/nullability,
immutable original/audit fields and deliberate delete/disposition rules.

Inspect grants/columns, SELECT/INSERT/UPDATE/DELETE policies, both `USING` and
effective `WITH CHECK`, views, RPC execution grants, function owner/search path,
service-role and storage paths. Omitted `WITH CHECK` can inherit `USING`; its
absence is not automatically a bypass. Permissive policies combine by OR,
restrictive by AND; owner/BYPASSRLS privileges need separate treatment.
Test policy-row races and valid-old/forbidden-new states, not only happy-path
reads. No money writes are introduced; financial precision is unchanged.
[PostgreSQL policy semantics](https://www.postgresql.org/docs/17/sql-createpolicy.html),
[row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html).

### 8. Overengineering

**Material concern: yes. Severity: medium. Likelihood: plausible.**
Addressing timing with a new timer service, custom authentication system,
general grant framework or many user controls would expand a simple task into
a platform. Core already assigns source, proof, communication and custody
owners. B's extra activation stage is not chosen. **Effect:** narrow solution
scope, not weaken correctness. **Permanent fix:** outcome requirements and
existing owner seams, no new vendor or generic scheduler. C04, C14, C19, C22;
P22, P28, P30. A source-specific atomic boundary is necessary, not speculative
abstraction.

### 9. UX/UI and user friction

**Material concern: yes. Severity: high. Likelihood: likely without explicit copy.**
“Sent,” “due,” “expired” and “complete” can misdescribe different states.
Recipients may lose time before seeing a request; staff can falsely blame them
for review. Comparator documentation distinguishes collection, delivery and
administrative completion; WCAG requires actual timing/entry evaluation.
**Effect:** retain A with truthful status and useful cohort gates. **Permanent
fix:** eight journeys, separate requested/access dates, safe recovery and no new
ceremony. C11, C14–C15, C18, C22; P22–P24, P27, P30.

### 10. Source of truth, ownership, and domain invariants

**Material concern: yes. Severity: high. Likelihood: likely if names are overloaded.**
Source access, credential issuance and delivery may become dual owners of time.
A present-day grant could be used to invent historical completed eligibility.
ADR-0025 and Q10 make these separate facts. **Effect:** changes the bare answer
into the exact source/causal contract. **Permanent fix:** one original semantic
admission/end, separate credential identities, original policy provenance and
causal completion eligibility. C01, C03, C05–C06, C09–C10, C20;
P03–P07, P11–P13, P26.

### 11. Hidden coupling

**Material concern: yes. Severity: high. Likelihood: plausible.**
Editing a due date, tenant host, policy template or locale could unexpectedly
change authority; provider delivery could control admission. Current presentation
and communication owners cannot own access. **Effect:** retain A but sever
implicit writes from these projections. **Permanent fix:** freeze admitted
result, resolve real current dependencies through their exact owner and preserve
host rules without fallback. C03, C08–C09, C16, C18; P09–P10, P17, P23.

### 12. Failure modes

**Material concern: yes. Severity: high. Likelihood: likely over time.**
Issuance may commit before a response/send fails; a source can be active while
delivery is unknown. A boolean adapter failure cannot by itself distinguish
no attempt from ambiguous external acceptance. Current transport seams confirm
the need for bounded interpretation. **Effect:** require richer native outcome
handling without rewriting unrelated adapters in this grooming turn.
**Permanent fix:** durable same-effect recovery, honest independent outcomes
and no destructive rollback from a lost acknowledgement. C06, C09, C11,
C18–C20; P07–P09, P13, P25–P26.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: yes. Severity: critical. Likelihood: plausible.**
Concurrent staff issuance, stale policy checks, late commits, credential reissue,
task reopening and old expiry jobs can jointly violate a valid-looking local
check. Clock time and transport keys are insufficient serialization.
**Effect:** A needs an explicit source order. **Permanent fix:** stable semantic
effect, current relevant checks after waits, no reset, stage-aware expiry,
causal fulfillment and rollback/unknown proof. C05–C10, C13, C16, C21;
P05–P18, P21, P25, P29.

### 14. Data integrity risks

**Material concern: yes. Severity: high. Likelihood: plausible.**
Original terms may be overwritten by current policy, a new command key or a
retry; receipt/fulfillment could point to another admission. Historical reports
then claim rights that never existed. **Effect:** preserve A, strengthen original
facts and lineage. **Permanent fix:** owner-defined uniqueness and same-scope
references, immutable calculation evidence and attributable corrections with
safe retention. C03, C05–C06, C10, C12, C17, C20; P04–P07,
P11–P13, P19–P20, P26.

### 15. Security and privacy risks

**Material concern: yes. Severity: critical. Likelihood: plausible.**
A nonsecret selector could reveal request timing/existence; a valid token or
cached response could outlive authority. Support diagnostics might expose
private missionary names, file descriptions or raw credentials. Source proof
and current reading were already ratified. **Effect:** Q11 cannot weaken them.
**Permanent fix:** inert private entry, current every-path delivery, minimal
audit/telemetry, exact role access and no attachment fallback. C04, C09,
C12–C13, C16–C18, C20; P19–P23, P26–P27.

### 16. Scalability and performance risks

**Material concern: yes. Severity: medium to high. Likelihood: plausible at load.**
Full-history scans, synchronized expiry sweeps, provider lookups per read or
global issuance locks fail on large tenants and retry bursts. Existing work
queues are not proof of native throughput. **Effect:** impose bounded design
and measured gates; no invented “fast” or capacity claim. **Permanent fix:**
scoped indexed queries, bounded retries/pages, source-local serialization and
current checks independent of cleanup. C07, C13, C19, C22; P25, P28.
Exact limits, units and production-shaped thresholds must be declared before
qualification; unresolved budgets are release gates, not monitoring substitutes.

P12 R6 already bounds a governed read's governance work at **at most one
governance-row SELECT plus one ledger UPDATE**, with its documented physical
carve-out and tiered audit rules. That is not a total business-query budget or
an issuance-write limit. Q11 preserves that contract and the owner-required
grant mutation fence; it does not authorize bypassing them for speed.

### 17. Operational burden

**Material concern: yes. Severity: high. Likelihood: plausible.**
If A's period routinely expires before delivery/review, staff may repeatedly
clone requests, edit SQL or promise extensions they cannot authorize. That
violates the platform's preference for reliable system behavior.
**Effect:** narrows eligible cohorts and requires useful initial policy; does
not reject A or grant extensions. **Permanent fix:** automatic same-effect
reconciliation, owned failure visibility, source-safe help and measured journey
qualification. C06, C11, C16, C18–C22; P25–P26, P28–P30.

### 18. Observability and auditability gaps

**Material concern: yes. Severity: high. Likelihood: likely if transport logs substitute.**
Staff cannot explain whether authority was issued, a message accepted, proof
completed or a deadline shortened. Email logs are mutable observations, not
durable original rights; open/click data does not prove reading.
**Effect:** require a minimal source explanation contract. **Permanent fix:**
original actor/scope/policy/effect/result evidence and attributable recovery,
separate operational diagnostics and privacy-safe recipient status.
C03, C06, C11, C17, C20; P04, P07, P13, P22, P26.

### 19. Dependency and integration risks

**Material concern: yes. Severity: high. Likelihood: likely over time.**
Provider timeout, suppression, key expiry, schema changes or host failure
could lead to duplicate messages/new grants or misleading delivery status.
Finite provider idempotency is not durable source identity. **Effect:** preserve
A's boundary and require exact adapter qualification. **Permanent fix:**
source-owned effects, current dispatch rules, same-effect reconciliation,
separate credential/message lineage and no provider-host fallback.
C05–C06, C09, C11, C18–C20; P08–P09, P13, P23, P25–P26.

### 20. Migration, rollout, and upgrade risks

**Material concern: yes. Severity: high. Likelihood: plausible.**
Backfilling from sent/task timestamps or deploying new readers beside old
resetting workers can invent issuance and extend access. Restore can lose later
revocation or replay old grants. **Effect:** limits A to proved prospective
cohorts until old terms are mapped. **Permanent fix:** explicit compatibility,
no guessed history, safe feature stop, restore reconciliation and roll-forward
that preserves new facts. C03, C08, C10, C21–C22; P18, P29–P30.
Rollback to code that ignores these terms is not a safe rollback.

### 21. Testability, traceability, and proof

**Material concern: yes. Severity: high. Likelihood: likely without exact criteria.**
“Fixed when sent” admits several incompatible implementations. Existing mocked
send/login/task tests cannot prove real source identity, RLS or expiry. Local
ratification can be mistaken for a published or activated feature.
**Effect:** retain A with falsifiable clauses and explicit evidence levels.
**Permanent fix:** C01–C22 linked to P01–P30, owner/ADR/glossary mapping,
authorized generated projection and release proof. C22 and P30 require the
whole chain; implementation/test coverage remains a future activation gate.

### 22. Other development hazards

**Material concern: no additional independent concern found.**
Checked monetary side effects, tax-document identity, new vendor/tooling needs,
general-drive expansion, hidden notification consent, unsupported crypto,
permanent storage and additional app surfaces. Q11 requires none of those.
Their relevant boundaries are already covered by C09, C14, C17–C22 and the
inherited owners. This is a scoped negative finding, not a whole-repository
security approval; no additional feature or dependency is justified.

## Proof required before activation

| ID      | Falsifiable acceptance evidence                                                                                                                                                                                                                                                                                                              |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q11-P01 | Approved initial policy declares actual finite calculation, units, scope and qualified recipient/reviewer opportunity. Missing/null/infinite/invalid/past results cannot issue live access; no unrelated default is imported.                                                                                                                |
| Q11-P02 | Draft, preview, task creation, scheduled intent, generic login, GET/HEAD/scanner and provider events do not create original issuance or change its end. Any existing scheduling uses the actual qualified source effect.                                                                                                                     |
| Q11-P03 | Successful issuance returns the actual original scope/policy/result/end; the same outcome is recovered after response loss. The original access identity differs from each permitted credential/message identity.                                                                                                                            |
| Q11-P04 | Due-date, default, timezone/locale and template changes after issuance preserve original result/provenance. Material approval/precondition changes between preview and issue do not silently widen terms.                                                                                                                                    |
| Q11-P05 | Two staff, new transport keys and concurrent retries for the same source intent converge on one original admission/end. Retry after wall-time/default changes recovers original I/U0 under current disclosure; regenerated output values do not falsely conflict. Changed source/recipient/material reviewed intent cannot reuse the effect. |
| Q11-P06 | Cross-tenant/environment/source/recipient-revision/context replay is denied without disclosure. The actual issuer capability is tested separately from reading, reviewing, staff role and support access.                                                                                                                                    |
| Q11-P07 | Fault injection before each required write, at commit and before handoff proves coherent original facts, required audit and durable follow-up. Rollback yields no phantom issued right/message; unknown outcomes recover without duplication or destructive compensation.                                                                    |
| Q11-P08 | Locks/permission changes cross temporal boundaries, including a second wait. Qualify source occurrence versus physical commit, rollback, current authorization and unknown-commit handling; an early clock sample cannot authorize an otherwise invalid issue.                                                                               |
| Q11-P09 | Delayed/duplicate/failed/unknown delivery, suppression and credential replacement preserve original end. A new credential uses the required new message identity without a new source period; old prepared messages are not rewritten.                                                                                                       |
| Q11-P10 | Reauth, device changes, return visits, resend, correction, copied request and reopen do not reset the old admission. Genuine new lifecycle commands cannot be confused with repair or transport retry.                                                                                                                                       |
| Q11-P11 | Otherwise-permitted fulfillment before first visit admits completed access only when original source admission and historical eligibility already existed. Missing proof fails closed without invalidating independently valid source completion.                                                                                            |
| Q11-P12 | First issuance after an earlier completion cannot manufacture ordinary completed admission. Legitimate atomic issuance/fulfillment, if owner-permitted, proves causal eligibility without relying on a strict inequality of equal-precision timestamps.                                                                                      |
| Q11-P13 | Delayed projection/recovery of original issuance or fulfillment preserves original times/terms and applies current disclosure. Provider or repair timestamps never backfill historical eligibility.                                                                                                                                          |
| Q11-P14 | At the exclusive unfinished end, new unadmitted intake/correction/read fails as appropriate; upload-start time grants no grace. Earlier durable work and unknown-outcome reconciliation preserve Q03/Q09 facts.                                                                                                                              |
| Q11-P15 | Eligible timely fulfillment transitions to Q07/Q10 under genuine overall caps. Old unfinished deadlines/expiry jobs cannot erase that valid stage; actual late completion does not revive recipient authority.                                                                                                                               |
| Q11-P16 | Expired proof with still-valid source access has qualified re-entry under the same end. Proof-service unavailability is not reported as expired source access; failed/unknown entry never becomes a permission bypass.                                                                                                                       |
| Q11-P17 | Contact/recipient/host/purpose revision and issuer dependency loss follow their exact source policy. No email-match retarget, blanket staff-departure rule or platform/Site/provider-host fallback occurs.                                                                                                                                   |
| Q11-P18 | Genuine shortening/revocation and adverse history survive cache, retries, reset attempts and restoration of a removed cause. Repairing a file/proof outage does not alter original time or bypass actual restrictions.                                                                                                                       |
| Q11-P19 | Real-role SQL tests cover grants/columns and effective USING/WITH CHECK for all mutations, views/RPC/definer/service/storage paths, including a permitted old row becoming forbidden new state. Broad staff and anonymous roles cannot write issuer/tenant/recipient/time/history.                                                           |
| Q11-P20 | Same-scope keys/references, semantic uniqueness, finite checks, required/null/default behavior, immutable original evidence and delete/retention behavior prevent invalid states. Related-policy races and absent-row duplicate creation are exercised.                                                                                      |
| Q11-P21 | Current stage/authority protects metadata/history/counts/search/replay and full/HEAD/range/conditional/resume/stream delivery. Browser/client/CDN/service-worker caches cannot replay private success across true expiry, revocation or account changes.                                                                                     |
| Q11-P22 | Staff distinguish issued/not-issued/unknown and delivery outcomes; recipients see actual dates, receipt/review/next actor and own-file actions. No false notified/read/saved claims, duplicate-issue retry workflow or recipient blame for review.                                                                                           |
| Q11-P23 | Known unsupported entry/host/assurance prevents qualified activation; faults after real issue retain original facts/end and expose safe owned recovery. Provider uncertainty never turns into unauthorized new grant or alternate doorway.                                                                                                   |
| Q11-P24 | Timezone/DST/date-only/localization, precision and boundary display agree with server enforcement. Keyboard, speech, screen-reader, reflow/RTL/touch and each actual proof/session timer pass applicable manual/automated accessibility criteria.                                                                                            |
| Q11-P25 | Producer crash, lost wake, stale lease, repeated job and provider dedupe-window expiry recover the same durable source/communication effect without new original access; configured retry/reconciliation bounds are exercised.                                                                                                               |
| Q11-P26 | Authorized evidence reconstructs issuer, original terms, outcome, real restrictions and repairs. General logs/metrics omit private filenames/content, recipient data and credentials; retention/disposal does not silently reopen old effects.                                                                                               |
| Q11-P27 | Real delayed-entry, mobile interruption, low-bandwidth, proof failure, partial preview/history failure and return-after-completion journeys preserve confirmed work and correct action availability without an extra timer ceremony or forced download.                                                                                      |
| Q11-P28 | Production-shaped skew/concurrency/large tenants and retries satisfy existing P12 R6 scoped governance limits and declared numeric query/page/lock/latency/egress/recovery budgets at boundary and excess. Preserve owner-required mutation fences. Expiry correctness does not depend on a sweep or provider lookup.                        |
| Q11-P29 | Prospective rollout, old/new readers and writers, late workers, backup restore, feature stop and rollback/roll-forward preserve original scope/end and adverse state. Unknown legacy issuance is not inferred from task/send dates.                                                                                                          |
| Q11-P30 | Trace choice→glossary/ADR→canonical owner/generated OpenSpec→design/tasks→authorized tickets→implementation/tests→release evidence. Representative recipient/staff/help qualification reports sample limits, shows useful initial terms and blocks activation on unresolved critical journeys.                                               |

Fresh bounded evidence: **3 existing tests passed; 31 were intentionally
filtered out; 1 file**, Vitest 5.0.3 on Node 24.21.0, reported duration
473 milliseconds. The runtime reviewer exercised three cases in
`tests/unit/packages/email/resend.test.ts`:

- Supplied idempotency key reaches the SDK's mocked request.
- Missing key causes validation failure without a fetch.
- Already-aborted requests exhaust retries and return a timeout failure.

The installed SDK used stubbed fetch, in a cleared environment with masked root
env files, a read-only filesystem and disabled networking. This characterizes
the adapter; it does **not** simulate provider acceptance followed by a lost
response, native issuance, SQL/RLS, concurrency or browser/AT. The runtime note
contains exact filters and execution conditions. No tests were written merely
to mirror this design, and Q10 tests are not counted as fresh Q11 evidence.

## Synthesis and sequencing

1. **Ratified decision:** Conrad adopted the precise original source act,
   immutable admitted result, identity separation, no-reset/causal-completion
   rules and truthful issuance/delivery distinction. They correct the bare A;
   they are not optional polish. The founder record below preserves adoption
   of the complete amendment package.
2. **In authorized specification/design:** select the finite initial calculation
   and usable cohort, map exact issuer/current-recipient/P12 dependency types,
   entry/host contract, causal source operation and scoped limits. Define
   states/errors and persistence relationships without introducing another
   permission engine. Active recovery and Q08 settings remain separate choices.
3. **Require implementation safeguards:** trusted source context, semantic
   idempotency, coherent durable facts and follow-up, effective role/RLS/service
   enforcement, current use after waits, stage-aware expiry and privacy-safe
   recovery/UI. No silent legacy default or transport-driven time reset.
4. **Before activation:** run P01–P30 at the actual native seams with real roles,
   concurrency/fault injection, providers, browser/AT and representative
   recipient/reviewer/help tasks. Set actual numerical operational budgets and
   useful finite terms; unresolved values are release gates. Ship only proved
   cohorts with compatible readers/workers, stop controls and forward recovery.
5. **After activation:** use the named controls below. Monitoring does not
   replace authorization, finite policy or required usability qualification.
   Do not normalize manual date repair or serial request cloning as operations.

No duration can be chosen from these documents alone as a proven ministry
need. Resolve it in the next founder decision after this package is ratified,
then qualify the resulting journey before release. That is an explicit product
dependency, not deferred repair of a known bug or permission to ship incomplete.

## Residual operational controls

These are ratified detection/response requirements, not observed rates. Each
threshold is an invariant or explicit qualification event; numerical service
budgets are separately required before activation by C19/C22 and P28.

| Signal                                                                                     | Threshold                                                                 | Accountable owner                             | Required response                                                                                                                     |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized issuance or cross-scope disclosure                                            | Any confirmed occurrence                                                  | Source authorization owner + security on-call | Stop affected lane/cohort, contain access, preserve minimal evidence and requalify.                                                   |
| Original end changes without authorized lifecycle effect, or duplicate original admission  | Any invariant violation                                                   | Source mutation owner                         | Suspend offending issue/replay path; reconcile original facts, repair projections and add the failing proof case.                     |
| Grant/result cannot be explained from original retained source evidence                    | Any unexplained live admission                                            | Source operations owner                       | Deny unsafe use, reconcile from authoritative evidence; never infer from provider/task timestamps or reset time.                      |
| Ambiguous provider/command result creates a new original admission or altered end          | Any occurrence                                                            | Communication/source integration owner        | Stop duplicate-effect path and reconcile existing source/provider identities; retain distinct known/unknown outcomes.                 |
| Real recipient receives false expiry, false notified/read status or blame for staff review | Any reproducible case                                                     | Product/source owner                          | Correct state mapping and copy, preserve received work and requalify affected journeys.                                               |
| Critical entry or accessibility journey cannot complete under intended policy              | Any failed release/qualification case, or confirmed production regression | Product/accessibility owner                   | Block activation or contain affected cohort; fix the journey or explicitly revise policy before reopening.                            |
| Old worker, restore or rollback widens access or loses adverse history                     | Any failed compatibility/canary check                                     | Release/source owner                          | Keep affected access closed, reconcile original/adverse state and roll forward safely.                                                |
| Staff workaround bypasses policy (SQL date edit, clone renewal, private attachment)        | Any confirmed instance                                                    | Source operations + product owner             | Stop the bypass, protect affected data, determine missing legitimate capability and require an explicit owner decision/qualified fix. |

## Recorded outcome and remaining proof

Q11 A and the complete required amendment package are ratified by Conrad,
2026-10-21. The reviewed disposition was **Accept with required amendments**.
The exact corrected decision, Q11-C01–C22, Q11-P01–P30, eight journey groups
and all eight operational controls are adopted grooming intent.

Current source inspection and official documentation support these amendments;
they do not prove native source issuance, real-role SQL, provider qualification,
expiry races or actual browser/AT operation. Any targeted adjacent test evidence
is separately recorded in the runtime note with its limitations.

The complete initial period/calculation, new deadline-editor/extension/recovery
power, notification cadence, Q08 fresh settings and Q12 choice remain unselected.
Formal owner/OpenSpec publication awaits `/to-prd`; tickets await `/to-issues`.
No runtime, provider, permission or dependency change is authorized by this
grooming review.

## Founder ratification — 2026-10-21

Conrad instructed: “Yes, ratify Q11 A with the required amendments. Record it
and move to the next question in this Phase 29 grill-with-docs session, with
the research, practical options, and your recommendation.”

This adopts the exact corrected decision, Q11-C01–C22, Q11-P01–P30,
reviewed lifecycle, eight journey groups and all eight operational controls.
Recording changes status and trace; substantive decision, clauses, proof,
journeys and controls are preserved. No initial duration/calculation, new
authority, communication, implementation or formal publication is inferred.
