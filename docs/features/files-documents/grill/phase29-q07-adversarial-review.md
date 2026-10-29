# Phase 29 Q07 — fixed completed-request access: adversarial review

**Disposition: Accept with required amendments.**

Conrad selected and then ratified **A — Up to 30 days from completion, with
earlier limits preserved**, with the exact corrected decision and complete
required amendment package on 20 October 2026. Q01–Q06 remain ratified.
Ratification does not activate a feature, grant access, select renewal or
publish a formal specification.

## Evidence and limits

Local Core and live GitHub `develop` were reverified at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab`. The review used the current
authority router, platform principles/boundaries, relevant owner contracts,
Q01–Q06, the Q07 question, source/migration/test inspection and current primary
documentation. Three independent passes cover
[source ownership](phase29-q07-owner-adversarial.md),
[runtime and database behavior](phase29-q07-runtime-adversarial.md) and
[comparators and UX](phase29-q07-ux-adversarial.md).

Evidence labels used throughout:

- **Repository intent:** governing requirements and explicitly ratified
  decisions; these do not establish deployed behavior.
- **Current source:** inspected implementation and adjacent tests. No qualified
  native completed-request recipient lane was established.
- **External fact:** documented comparator behavior or technical semantics,
  bounded to the cited product/version/purpose.
- **Product judgment:** 30 days is the selected ordinary maximum. It is not
  an industry standard, legal retention rule or measured optimum.
- **Unknown:** actual recipient return times, support demand, sensitive-purpose
  suitability, effective deployed RLS/provider behavior and production journey
  performance have not been established.

Risk likelihood below is a qualitative estimate **if the identified omission
is left unresolved**, not measured incident frequency or an allegation that
an unbuilt path currently exposes data. A high-impact design hazard can be
material without being a demonstrated production vulnerability.

Selected repository evidence below is relative to `/home/conrad/code/core`;
the supporting notes supply the fuller source census and limits.

| Evidence                                                                                                                 | Consequence for this decision                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/ai/document-authority.md:10–48`; `openspec/project.md:6–18`                                                        | Preserve owner/supersession and selected/ratified/implemented/qualified distinctions.                                                                                          |
| `openspec/specs/platform-principles/spec.md:13–24,139–167`; `openspec/specs/platform-boundaries/spec.md:163–184,270–288` | Current server-enforced scope and truthful accessible experience outrank a convenient date promise.                                                                            |
| Feature ADRs `0001` through `0006`, particularly Q06`:20–55`                                                             | Existing recipient, correction, exact-file, history and independent-source-work boundaries remain binding.                                                                     |
| `docs/prds/workflow-studio/contracts/requirements.json:134–161,204–211`; `03-runtime-and-recovery.md:15–75`              | Exact source evidence, current fences, stable effect identity and explicitly owned clock semantics. Generated Workflow OpenSpec is a projection, not another authoring source. |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1584–1587,1643–1655`                        | Live exact scope, egress controls, expiry-bounded caching and per-chunk long-stream expiry.                                                                                    |
| `docs/adr/0038-purpose-owned-records-schedules-and-verified-disposal.md:20–55`                                           | Retention/holds and read authority remain separate.                                                                                                                            |
| `packages/api/src/missionary-portal/task.ts:25–58,81–97`                                                                 | Generic task PATCH can set/reset completion time; it is not the immutable request anchor.                                                                                      |
| `supabase/migrations/20260802160104_eve_runtime_active_runs_guard.sql:128–158`                                           | An existing budget path checks `NOW()` after a lock, but that still means transaction start. This is a reuse warning, not a reproduced Q07 defect.                             |
| `packages/database/supabase/admin.ts:15–46`; `packages/api/src/shared/with-operation.ts:128–167`                         | Auth/role wrappers use a privileged client; native source/expiry enforcement cannot be assumed from RLS alone.                                                                 |
| `packages/api/src/eve/retention/control.ts:157–178`; `packages/api/src/reads/donor-history.ts:37–66`                     | Existing fixed-life URL and cached-read mechanisms do not prove live completed-recipient expiry. Reuse requires the exact current delivery contract.                           |

**Fresh checks:** 16 selected existing tests passed, with 10 filtered out,
across two Vitest 5.0.3 files in 572ms. They cover renderer timestamp parsing/
precision and mocked approval-control attribution/ownership. The runtime note
records the credential-free, read-only, network-disabled execution and exact
filters. These are adjacent checks, not native access, database concurrency,
RLS, provider, browser or accessibility qualification.

## Adversarial check

### What could go wrong with this answer?

"Thirty days from completion" can become `now + 30` on each return, can revive
expired authority when a delayed worker finishes, or can ignore an earlier
source deadline. A dynamic minimum can also silently grow when an earlier cap
is removed. A date on the page cannot enforce access through caches, originals,
ranges, recovery links and privileged delivery paths.

### What hidden assumptions are we making?

We must not assume that Completion means upload receipt, that a business date
is a trusted clock anchor, that all earlier limits use the same scope, or that
the recipient still has authority when fulfillment occurs. Nor can we assume
that 30 calendar days equals 720 elapsed hours or that every user can return
within the proposed period. Those distinctions are explicit below.

### How does this affect the whole product?

The requesting source owns fulfillment and this access policy; P4/P12 own
qualified identity/current authorization. File custody, preview, delivery,
session/proof, communication and retention retain their owners. The rule is
for the ordinary private-request completed view, not every file in Asym,
official-document access, CMS assets, staff records or organizational retention.

### How does this affect the end-user experience?

Keep the existing request page. Present the actual completed outcome and
effective access end near eligible current-file actions. Do not make users
calculate a date, inspect history, enroll again or decipher technical TTLs.
An expired session, an ended source grant, a missing file and an unknown
authorization state require different safe responses.

### Does this follow modern best practices?

Finite expiry is supported by current transfer/client-sharing products, but
their defaults and anchors differ. Dropbox Transfer documents plan-specific
7/30-day periods; Tresorit shared links document a 30-day default; ShareFile
supports administrator maximums. None chooses Core's completion anchor or
overrides its confirmed-recipient/exact-file contract.
[Dropbox](https://help.dropbox.com/share/dropbox-transfer),
[Tresorit](https://support.tresorit.com/hc/en-us/articles/360005537333-Manage-shared-links),
[ShareFile](https://docs.sharefile.com/en-us/sharefile/account_settings/file_settings/share_setting).

Foundant provides a closer nonprofit example of completed-form readback, but
not evidence for a universal original-file expiry interval. GOV.UK recommends
useful outcomes, next steps and helpful bookmarked returns. Core can adopt
those experience principles without granting permanent access or adding
unselected exports/messages.
[Foundant](https://support.foundant.com/hc/en-us/articles/4411213334935-Follow-Up-Submission-Logic),
[GOV.UK](https://design-system.service.gov.uk/patterns/confirmation-pages/).

### Does this fit Asym’s existing repo and product direction?

Yes, as a prospective, source-bound ordinary policy. It resolves Q06's open
duration/anchor choice while preserving Q01 current authority, Q03 correction
fencing, Q04 exact private reads and Q05 minimized history. Current P18/P34
numbers are purpose-specific and do not supersede this choice. No second PDP,
general drive, automatic extension or retention change is justified.

### Should we adjust the recommendation?

Keep A, but specify the exclusive end, trusted occurrence anchor, durable
ceiling, eligibility at completion, subsequent tightening, no implicit
lengthening, operation-level enforcement, truthful UX and prospective rollout.
Thirty days remains a maximum; a shorter controlling limit can consume all
of the apparent benefit. That must be visible and evaluated rather than
"fixed" by silently expanding permission.

## Corrected decision to record

> For a prospectively admitted ordinary Private Document Request that reaches
> normal source-confirmed fulfillment while the recipient's source authority
> remains eligible, permit the Q06 completed read-only view for **at most
> 30 elapsed 24-hour days (720 hours)** from the one authoritative
> source-recorded normal-fulfillment occurrence instant.
>
> Resolve and preserve its ordinary access ceiling under the admitted source
> policy and exact request/recipient scope, using any earlier binding source
> end. This is an exclusive boundary: new affected protected operations are
> denied at or after it. The 30-day calculation never creates permission,
> overrides an earlier end, broadens an audience or revives expired/revoked
> authority. Independent source work may complete after recipient expiry
> without exposing its outcome through that ended grant.
> Missing completed-read admission must not block independently authorized
> source completion. Delayed reconciliation must prove the original policy,
> recipient eligibility and binding limits at fulfillment, then satisfy current
> authority; today's state cannot manufacture an earlier entitlement.
>
> Preserve the admitted ceiling and authoritative completion evidence.
> Replays, late processing, visits, sign-in, help, resends, retries, changed
> defaults or removal of an earlier cap cannot silently move it later.
> Current restrictions and explicitly authorized earlier termination still
> apply. When the source actually shortens authority, preserve that narrowed
> end without automatic restoration.
> Temporary representation failure or a reversible owner-controlled
> restriction is distinct from ended source authority: recovery may restore
> an eligible representation only within unchanged, still-valid access.
>
> Every protected recipient read remains subject to current Q01/P4/P12 scope
> and assurance, exact-file and representation qualification, private delivery
> and inherited stream-expiry rules. Session/proof, delivery, retention/hold
> and source-access clocks remain separate. A delayed notification or outage
> does not automatically pause or extend the source period.
>
> Keep the same accessible task page, show the actual effective date/time and
> timezone beside the completed result, preserve eligible current-file
> actions and concise history, and distinguish safe re-entry, ended access,
> temporary failure and unavailable files. Do not promise a fresh 30 days,
> permanent private receipts, automatic renewal, deletion at expiry or a
> new document portal. Apply the policy prospectively and qualify the full
> source contract before activation.

## The smallest complete recipient journey

This is reviewed interaction intent, not an implemented or user-tested screen.
Copy applies only where its facts may currently be disclosed.

| Situation                                        | Recommended experience                                                                                                                                                              | Boundary                                                                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Request is active                                | Explain the selected post-completion rule once in context. Show a known earlier deadline directly. Keep submission due dates separately named.                                      | No invented future completion date or promise that an earlier binding end will be extended.                                    |
| Source completes and access is valid             | **Request complete**, the permitted outcome, eligible View/Download actions, concise history, and **Access ends [date] at [time] ([timezone])**.                                    | Same page and shared controls; no new archive, new enrollment or repeated confirmation ceremony.                               |
| Earlier source end leaves only a short interval  | Show that actual earlier date/time. Use a brief permitted explanation if needed.                                                                                                    | Do not say “30 days remaining.” Do not expose confidential reasons for the restriction.                                        |
| Returning after session/proof expiry             | Use the existing qualified same-request re-entry path and restore the still-permitted context.                                                                                      | Signing in changes proof/session state, not the source deadline or request completion.                                         |
| One file is unavailable                          | Explain the permitted file state; preserve independently authorized current status/history/other files.                                                                             | An outage is not revocation, deletion, rejection or permission to substitute another version.                                  |
| Access expires while the page is open            | Stop offering actions as available, reject subsequent protected operations and present the allowed end/help state. Preserve meaningful focus and announce the material change once. | The client timer improves clarity; the server enforces access. Previously seen/emitted data cannot be recalled.                |
| Returning after source access ended              | A neutral, permitted **Access to this request has ended** state and the actual governed help route.                                                                                 | No private title, filename, history, completion claim or recipient detail unless independently authorized. No implied renewal. |
| Current policy/outcome cannot be verified        | A truthful temporary verification/unavailable state with safe retry/help.                                                                                                           | Do not infer expired, rejected, deleted, open or complete from an exception. No unlimited fallback.                            |
| Source completes after recipient authority ended | Source staff see the outcome under their own permission; the old recipient link remains ended.                                                                                      | Worker success does not mint access or trigger a private notification without separate authorization.                          |

Use readable localized dates rather than ambiguous all-numeric forms or “in a
month.” Expose the actual timezone/offset clearly, including after a timezone
change; the underlying instant does not change. The deadline remains outside
collapsed history, tooltips and transient toasts. No noisy live countdown,
required hover, redundant re-entry, urgent download prompt or long policy
paragraph is needed.

Date precision must not overstate permission. Render the admitted cutoff with
sufficient precision; formatting must not change its instant. Any source-defined
precision normalization must be prospectively explicit before admission,
preserve recorded history and never produce an end later than the 720-hour
maximum or an applicable earlier binding end. Do not silently grant an extra
minute through formatting. No browser-local clock or timezone preference writes
the authoritative end.

Preserve exact `base-maia`, Base UI and semantic tokens in shared `packages/ui`.
Use semantic text and appropriately named controls, with coherent reading order,
keyboard/focus behavior, speech access, touch targets, zoom/reflow, RTL and long
names. A date alone is cheap to render; opening the page should not fetch all
file bytes merely to explain the end.

For accessibility, assess **each actual content-set timer**. WCAG 2.2.1 is
Level A and includes a longer-than-20-hour exception, but the maximum policy
does not prove that every effective shorter bound, proof challenge or session
timer qualifies. A short remaining interval is not by itself conclusive
nonconformance either: assess the actual timer and applicable mechanism or
exception. Security terminology is not automatic exemption. Keep Q06's
source-authorized accommodation/recovery and separate input-loss assessment.
WCAG 2.2.6 is AAA, not a universal AA requirement.
[Timing adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html),
[Timeouts](https://www.w3.org/WAI/WCAG22/Understanding/timeouts.html).

## Source ownership, temporal semantics and invariants

| Fact                                | Authority and invariant                                                                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Normal fulfillment                  | Requesting source, exact effect identity and evidence/revision scope. One durable occurrence; client dates and projected task flags are not authority.                   |
| Admitted ordinary access policy/end | Same source's qualified versioned policy for this request/recipient context. Maximum 720 elapsed hours from the trusted anchor and no later than earlier binding limits. |
| Current recipient permission        | P4/P12/current source context. A future end is necessary but insufficient; tenant, environment, recipient revision, purpose, action and assurance still match.           |
| Exact eligible files                | Source submission lineage/currentness and Q04 representation qualification. No new members, superseded bytes or latest-provider-version substitution.                    |
| Technical preparation/delivery      | Their source-bound service authority. Completing a job or regenerating a rendition cannot alter recipient access.                                                        |
| Completion and policy history       | Durable business evidence and security history. Preserve attribution and original facts separately from subsequent restrictions or correction/remediation.               |
| Retention/holds/disposal            | Owning purpose's record rules and custody. Access ending neither deletes evidence nor makes holds disclose it.                                                           |
| UI/search/cache/notification        | Derived presentation, never a write authority for time, eligibility, outcome or permission.                                                                              |

**Anchor.** Use the trustworthy source-recorded occurrence instant of the one
normal fulfillment effect. Where the source effect is consumed later, use its
qualified original occurrence/provenance, not the consumer's processing time.
Do not use a user-entered historical/effective business date, imported
unverified timestamp, generic `updated_at`, first view or email arrival.
Unknown, impossible or future provenance must not manufacture a valid window.
Correcting an erroneous source fact requires an explicit audited owner path;
it must not silently re-anchor an old grant.

For a native transition, capture/validate the source instant at the winning
authority boundary after relevant lock waits and current-state validation;
do not label transaction-start `NOW()` as physical commit time. A qualified
upstream occurrence can be consumed later only with trustworthy evidence of
the policy, recipient eligibility and binding ends at that original boundary.
Do not reconstruct those facts from today's roles or the current absence of
a deleted cap. Missing admission evidence denies completed-recipient access
without preventing independently authorized source completion.

**Ceiling versus current eligibility.** The conceptual maximum is the original
completion instant plus 720 elapsed hours. The admitted ceiling is bounded by
the applicable earlier source ends when the policy is resolved. Later valid
tightening may shorten/end authority. Removing that earlier cap or changing
the default does not automatically increase the admitted ceiling. When a later
source action actually shortens the affected authority, preserve that narrowed
end. Removing/relaxing its cause
cannot restore the prior later end without a separately qualified extension
rule, which Q07 does not select. Temporary file unavailability or a restriction
whose owner contract explicitly permits
clearance can recover under the same valid grant; clearing a condition does
not itself move time or resurrect a grant that was actually revoked/expired.

**Atomicity and races.** The source must atomically establish its relevant
completion facts, business-mutation fence, policy/effect linkage and required
durable history/effect intent, or provide an equivalent source-owned invariant
that denies completed reads until those facts agree. Serialize competing
completion, recipient reassignment, policy tightening and Q03 admission against
the same relevant source state. Read admission then uses current restrictions;
a transactionally valid completion does not override a revocation that follows.
Do not hold a source transaction open while calling providers or streaming bytes.

**Idempotency.** Key replay to the durable business effect and its exact scope.
Duplicate messages, lost responses, read-back, projection rebuild and worker
retry recover the same outcome/end. Preserve event occurrence, recording and
processing times distinctly where they differ; arbitrary transport IDs are not
the sole business deduplication guarantee.

Replaying a stored result is a fresh disclosure operation: an idempotency
cache may recover the business fact without returning private response JSON
after the caller's authority has ended.

**Clock discipline.** Thirty days here is 720 hours, or 2,592,000 ordinary
elapsed seconds, not a calendar month, working days or local end-of-day.
PostgreSQL distinguishes calendar-day intervals from hours, and transaction
start time from advancing wall-clock time. Use a qualified authoritative clock
at the actual operation boundary; a stale transaction timestamp cannot prove
later stream chunks are before expiry.
[PostgreSQL time functions](https://www.postgresql.org/docs/current/functions-datetime.html).

Independent arithmetic checked in this review: starting **20 October 2026,
15:00 America/New_York**, 720 elapsed hours ends **19 November, 14:00 -05:00**.
Adding 30 local calendar days instead ends at 15:00 and spans **721 hours**
across the DST change. This verifies the example, not Core's implementation.
The deployment must qualify its clock authority, precision and skew behavior;
no grace interval or production skew tolerance is invented by this review.

**Reads, streams and caches.** New metadata/history, original/preview,
HEAD/range/conditional/resume and recovery requests must respect the current
exclusive end. Long delivery keeps P12/Q04 per-chunk expiry and feasible
restriction termination. Provider URL lifetime or a valid session cannot
substitute. No public/private-cache setting alone proves end-to-end protection;
test actual route/CDN/browser/service-worker and back-navigation behavior.
`no-store` is a cache directive, not erasure or recall of copies previously
received. [HTTP caching](https://www.rfc-editor.org/rfc/rfc9111.html).

**Database integrity.** The concrete schema is not selected here. It must
enforce same-tenant/environment source, recipient, policy and evidence
relationships; required provenance and finite typed instants; uniqueness for
the durable effect; valid admission/end combinations; appropriate delete/hold
behavior; and indexes for bounded scoped lookups. A source that completed after
access ended must still be recordable without fabricating an eligible access
row. Avoid a blanket `end > completion` constraint that destroys that truth.

Recipient input must not set tenant, actor, authority, anchor, end, approval,
owner or clearance. Check SQL grants, column privileges, `USING` and new-row
`WITH CHECK`, role composition, views, functions/RPCs, storage and privileged
paths. A permitted row update must not transform scope or extend authority.
Omitted `WITH CHECK` can inherit `USING`; owners/BYPASSRLS/definer behavior and
policy combinations require real-role proof. A missing keyword alone is not a
validated bug. [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

## Exact required amendments

The following are the exact ratified requirement additions for later source
publication. They are grooming amendment language, not an already-published
OpenSpec change. Each concern below maps to these clauses and proof groups.

| ID                                                   | Required language                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q07-C01 Ordinary scope and adoption                  | The 30-day policy SHALL apply only to prospectively admitted ordinary completed Private Document Requests explicitly bound to it. It SHALL NOT replace specialized document, CMS, staff, public or retention contracts.                                                                                                                                                                                                                                                                                                                                                                                  |
| Q07-C02 Exact anchor and unit                        | The completed maximum SHALL be 720 elapsed hours from the one trustworthy source-recorded normal-fulfillment occurrence instant, bound to the exact effect and evidence scope. Client/effective business dates, processing time, notifications, first/last visit and mutable task timestamps SHALL NOT supply or reset that anchor.                                                                                                                                                                                                                                                                      |
| Q07-C03 Eligibility and non-revival                  | Completion SHALL resolve completed access only from trustworthy evidence of recipient eligibility, admitted policy and binding limits at fulfillment, followed by current authority checks. Today's state SHALL NOT manufacture historical admission. Missing read-admission evidence SHALL NOT block independently authorized source completion; such completion SHALL NOT restore ended recipient access or expose results through it.                                                                                                                                                                 |
| Q07-C04 Preserved ceiling and earlier limits         | The source SHALL durably preserve the admitted end, no later than the completion maximum or any then-binding earlier end applicable to that authority and scope. A later source action that actually shortens authority SHALL preserve the narrowed end; removing/relaxing its cause SHALL NOT restore the prior later end without a separately qualified extension rule. Member-specific limits SHALL NOT accidentally terminate unrelated permitted members. Cap removal, policy relaxation/default change, replay, login, return, help, resend or retry SHALL NOT silently lengthen the admitted end. |
| Q07-C05 Current authority and recoverable conditions | Every protected recipient operation SHALL revalidate current exact tenant/environment, principal/recipient revision, request, purpose, action, assurance and representation eligibility. Temporary failure or an explicitly reversible owner restriction MAY clear within unchanged valid authority; it SHALL NOT be confused with, or revive, expired/revoked authority.                                                                                                                                                                                                                                |
| Q07-C06 Durable completion and races                 | Completion, relevant admission fences, policy/effect linkage and required durable history/effect intent SHALL agree through the source-owned atomic boundary or an equivalent fail-closed invariant. Native clock capture/checks SHALL account for relevant lock waits and current-state validation. Competing corrections, completion, reassignment and restrictions SHALL have a durable authoritative ordering; retries SHALL recover the same business effect/end while private replay responses still require current disclosure authority.                                                         |
| Q07-C07 Exclusive server boundary                    | New affected protected operations SHALL be denied at or after the applicable end using qualified authoritative time at their enforcement boundary. Missing/nonfinite/invalid policy, provenance or time qualification SHALL deny affected access; no client clock, stale transaction time, delayed cleanup or unselected grace period SHALL extend it.                                                                                                                                                                                                                                                   |
| Q07-C08 All delivery paths                           | Metadata/history, originals, previews, HEAD/range/conditional/resume and recovery paths SHALL preserve Q04/P12 current authorization, exact bytes, per-chunk expiry and feasible restriction termination. Provider links, caches and derived projections SHALL NOT create an alternate lasting grant.                                                                                                                                                                                                                                                                                                    |
| Q07-C09 Durable data integrity                       | Source relationships SHALL be tenant/environment consistent; trusted anchor/end/policy/effect/actor fields and legal state combinations SHALL be constrained at the authoritative mutation boundary. Preserve historical fulfillment and explicit correction/remediation evidence; unknown legacy facts or late completion SHALL NOT be repaired by inventing eligible access.                                                                                                                                                                                                                           |
| Q07-C10 Database and privilege proof                 | Actual grants, column privileges, RLS USING/new-row behavior, composed policies, views, functions/RPCs, storage and service paths SHALL prevent scope forgery, attribution forgery, end extension and bypass. Client updates SHALL NOT turn an allowed row into an unauthorized state.                                                                                                                                                                                                                                                                                                                   |
| Q07-C11 Truthful deadline presentation               | The same request page SHALL show the actual effective end in readable localized date/time with clear timezone and sufficient precision near current status/actions. An earlier end SHALL replace the generic 30-day promise. Display, sorting, locale or timezone changes SHALL NOT change authority.                                                                                                                                                                                                                                                                                                    |
| Q07-C12 Safe re-entry                                | Session/proof expiry SHALL remain distinct from ended source access. Qualified same-request re-entry MAY restore a still-permitted view without new membership, repeated unnecessary enrollment or a reset deadline. Valid authentication SHALL NOT restore ended access or convert re-entry into an unrequested download.                                                                                                                                                                                                                                                                               |
| Q07-C13 Honest failure and end states                | Unknown policy/outcome, technical outage, file unavailability, expired proof and ended access SHALL have truthful independently scoped states. After source access ends, only the permitted neutral help/end projection MAY remain; no permanent private receipt/history fallback or false deletion/rejection claim is allowed.                                                                                                                                                                                                                                                                          |
| Q07-C14 Accessible shared UX                         | The journey SHALL preserve Core's shared Base UI/base-maia system, clear names, keyboard/focus, touch, zoom/reflow, localization and meaningful non-repeating status. Each actual timing limit SHALL have documented applicable accessibility treatment; a 30-day maximum or security label alone SHALL NOT prove conformance.                                                                                                                                                                                                                                                                           |
| Q07-C15 Independent custody and clocks               | Source access, intake due date, proof/session, delivery/worker/rendition and retention/hold/disposal clocks SHALL remain distinct. Expiry SHALL NOT delete evidence, extend retention, release a hold, recall downloaded copies or alter independent uses/rights.                                                                                                                                                                                                                                                                                                                                        |
| Q07-C16 Delayed and partial effects                  | Lost responses, delayed events/projections/notices and outages SHALL recover the original authoritative outcome/end without restarting or pausing the window. Required secondary effects SHALL use their existing durable owners; no email, reminder or renewal is implied by completion.                                                                                                                                                                                                                                                                                                                |
| Q07-C17 Governed assistance                          | The actual source help path SHALL explain or route the permitted problem without privileged bypass, private email attachment fallback, automatic extension or reopening. Any future fresh authority/accommodation SHALL be explicit, auditable and separately source-qualified.                                                                                                                                                                                                                                                                                                                          |
| Q07-C18 Bounded operation                            | The implementation SHALL use existing owned service/worker paths, scoped bounded queries, explicit pagination and measured concurrency/egress budgets. Ordinary reads SHALL NOT require a global expiry sweep, provider call under a database lock, per-view deadline write or unbounded history/file fetch.                                                                                                                                                                                                                                                                                             |
| Q07-C19 Audit and privacy                            | Durable evidence SHALL distinguish source completion, admitted policy/end, subsequent authority changes and actual access decisions from technical delivery outcomes. Diagnostics SHALL be correlation-safe and minimized; success SHALL NOT imply human reading, successful saving or evidence acceptance.                                                                                                                                                                                                                                                                                              |
| Q07-C20 Safe rollout and proof                       | Rollout SHALL identify the exact prospective cohort, owner contract, real-role/provider/browser qualification and compatible reader/writer behavior. Unknown legacy requests SHALL NOT receive fabricated anchors or changed ends. Kill switch, restore and roll-forward SHALL preserve history and deny resurrected access; fallback SHALL NOT reopen intake or widen grants.                                                                                                                                                                                                                           |
| Q07-C21 Evidence-based policy ownership              | The source/product owner SHALL record 30 days as the chosen ordinary maximum and evaluate validated unmet needs or systematically earlier caps without silently changing grants. Cohort qualification SHALL identify source policies that leave no completed readback before claiming Q06/Q07 is delivered; no minimum guaranteed window or implicit cap relaxation follows. Monitoring SHALL use named signals, thresholds, owners and responses; it SHALL NOT substitute for authorization, accessibility or activation gates.                                                                         |

## Category-by-category adversarial review

### 1. Problem validity, necessity, and alternatives

**Material concern: yes. Severity: medium. Likelihood: plausible.**
Thirty days could be copied from transfer products without proving useful
follow-up, or could be irrelevant when every request has an earlier cap.
The existing Q06 completed view is a known selected purpose; actual ministry
return needs are unknown. Fourteen days reduces continuing access; keeping a
source date is simpler when that date already fits. **Effect: narrows A, does
not invalidate it.** Retain the default as a product judgment and evaluate
actual effective windows rather than promising 30 days. Exact changes:
**C01/C11/C21; P01/P25**.

### 2. Brittleness

**Material concern: yes. Severity: high. Likelihood: plausible.**
An end recalculated from mutable completion, current defaults or consumer
processing time changes after replay, a timezone change or policy relaxation.
Existing clock patterns are purpose-specific; none proves this new contract.
**Effect: changes the definition from a duration hint to a durable source
bound.** Pin trusted occurrence/policy/end; distinguish recoverable state.
Exact changes: **C02/C04/C07/C16; P02/P04/P05/P08/P09**.

### 3. Technical debt

**Material concern: yes. Severity: medium. Likelihood: plausible.**
Separate admin/donor/missionary date formulas, duplicate permission checks or
a generic expiry engine would drift and make future changes risky. Core's
platform boundaries and data-access guide require shared owned business logic.
**Effect: constrains implementation, keeps A.** Put source policy and its
mutation/enforcement boundary in the existing owners; projections display
their result. Exact changes: **C05/C18/C20; P11/P22/P24**.

### 4. Edge cases

**Material concern: yes. Severity: high. Likelihood: expected boundary cases,
frequency unknown.** Completion can occur at/after an earlier end, a notice can
arrive late, the recipient may be reassigned, or a file may become unavailable.
Treating all cases as a fresh window leaks information or lies about the
outcome. Q06 already allows source work after expiry. **Effect: narrows A's
eligibility.** Preserve late source completion without regrant, exact
boundaries and independent states. Exact changes: **C03/C05/C07/C13/C16;
P03/P06/P08/P17**.

### 5. Footguns

**Material concern: yes. Severity: high. Likelihood: plausible.**
A developer may use `max(old_end, completion + 30 days)`, let a client write
expiry, treat null as infinity, or silently recompute a larger minimum after a
cap disappears. These are credible shortcuts, not demonstrated current bugs.
**Effect: tightens A.** Use a trusted bounded end, no implicit extension and
controlled source commands. Exact changes: **C03/C04/C07/C09/C10;
P04/P07/P12/P13**.

### 6. Tenant safety

**Material concern: yes. Severity: critical for sensitive disclosure.
Likelihood: unmeasured but plausible without explicit scoping.**
The same person/email/file ID can occur in different tenant, environment or
request contexts. A cached completed result or reused link could cross those
boundaries. Core P4/P12 and platform isolation prohibit that inference.
**Effect: keeps A only within exact current scope.** Scope all authoritative
relations, delivery and caches; do not union independent rights.
Exact changes: **C05/C08/C09/C10; P10/P11/P12/P15**.

### 7. Database, RLS, and authorization safety

**Material concern: yes. Severity: critical for an authorization bypass.
Likelihood: unmeasured; source-level protections alone are insufficient.**
A row that is readable may be writable into a different tenant/recipient,
later expiry or forged completion; definer/service paths may bypass RLS.
PG policy composition and new-row checks require effective-role testing.
**Effect: requires invariant and privilege proof, not a prescribed schema.**
Constrain same-scope relationships, uniqueness, valid finite values and trusted
attribution; preserve completed-without-access states. No money calculation is
introduced. Exact changes: **C09/C10/C20; P12/P13/P23**.

### 8. Overengineering

**Material concern: yes. Severity: medium. Likelihood: plausible.**
This choice can attract rolling renewal, calendar configuration, per-tenant
policy builders, special tokens, new schedulers, countdowns and reminder
campaigns. None is needed to deliver the selected cap. **Effect: narrows
implementation scope.** One explicit source policy, one fixed bound, existing
authorization and qualified help are sufficient. Exact changes:
**C01/C02/C16/C17/C18; P01/P09/P22**.

### 9. UX/UI and user friction

**Material concern: yes. Severity: high for misleading access; medium for
avoidable effort. Likelihood: plausible.**
"30 days" can hide a deadline tomorrow; a local date can be ambiguous; a
generic Expired page can suggest rejection or deletion. Comparator defaults
do not prove comprehension. **Effect: changes presentation, keeps A.**
Show the actual local cutoff alongside useful actions, keep re-entry simple,
and test timezones, mobile, long/RTL names, focus and AT. No address/name
recollection is needed for this choice. Exact changes:
**C11/C12/C13/C14; P16/P17/P18/P19/P25**.

### 10. Source of truth, ownership, and domain invariants

**Material concern: yes. Severity: high. Likelihood: plausible.**
A workflow status, renderer, client clock or notification timestamp can become
a competing authority. A current eligibility projection could rewrite history
or let new files enter an old scope. **Effect: fixes authority and invariants.**
The request source owns the durable effect/policy/end; P4/P12 and exact-file
owners retain their decisions. Exact changes:
**C02/C04/C05/C06/C09; P02/P05/P06/P11/P14**.

### 11. Hidden coupling

**Material concern: yes. Severity: high. Likelihood: plausible.**
Reading may become dependent on email delivery, session refresh, technical
rendition lifetime or record retention. This would make provider outages or a
hold alter human permission. Current owner contracts explicitly separate these
clocks. **Effect: removes coupling from A.** Resolve the source bound
independently and requalify each representation. Exact changes:
**C05/C08/C12/C15/C16; P09/P14/P20/P21**.

### 12. Failure modes

**Material concern: yes. Severity: high. Likelihood: expected failure classes,
frequency unknown.** Completion may commit before a response/projection is
lost; policy lookup can fail; cleanup can lag. Retrying as new completion or
falling back to unlimited access produces inconsistent authority. **Effect:
requires durable recovery.** Recover the original source effect, deny unknown
authority, isolate file failures and retain honest outcome states.
Exact changes: **C06/C07/C13/C16; P05/P08/P17/P21**.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: yes. Severity: high. Likelihood: plausible under ordinary
retry/concurrency.** A correction, reassignment or revocation can race
completion; daylight-saving arithmetic can add an hour; a later policy change
can grow an old grant. The independent arithmetic example demonstrates the
calendar/elapsed distinction. **Effect: makes A precise.** Serialize relevant
source facts, bind one effect, use 720 elapsed hours and deny at the exclusive
end without sliding. Exact changes: **C02/C03/C04/C06/C07/C16;
P02–P09/P24**.

### 14. Data integrity risks

**Material concern: yes. Severity: high. Likelihood: plausible.**
Duplicate completions, invalid timestamps, orphaned policy/evidence links or
overly strict checks can corrupt history or incorrectly discard a legitimate
completion after recipient expiry. **Effect: changes data acceptance rules.**
Separate durable fulfillment from eligible access, constrain trusted provenance
and relationships, and preserve explicit correction history.
Exact changes: **C06/C09/C10/C19; P03/P05/P07/P12/P23**.

### 15. Security and privacy risks

**Material concern: yes. Severity: high, potentially critical for sensitive
ministry data. Likelihood: unmeasured.**
A future end can be mistaken for permission, and cached filenames/history,
provider originals or logs can outlive the allowed disclosure. OWASP requires
server-side current authorization across resources. **Effect: restricts every
representation and diagnostic path.** Preserve exact access, safe cache
behavior, minimized records and neutral post-expiry output; no copy recall
claim. Exact changes: **C05/C07/C08/C13/C15/C19;
P10/P11/P14/P15/P20/P26**.

### 16. Scalability and performance risks

**Material concern: yes. Severity: medium. Likelihood: plausible as use grows.**
Repeated deadline writes, global expiry sweeps, per-file remote checks or
unbounded history loads can make a simple return page expensive and starve
active work. No tenant scale/SLO was measured. **Effect: constrains design,
does not invent capacity promises.** Indexed scoped reads, bounded pages and
existing admission/delivery budgets; enforce expiry without cleanup jobs.
Exact changes: **C07/C18; P08/P22**.

### 17. Operational burden

**Material concern: yes. Severity: medium. Likelihood: plausible.**
If the actual window is often short, staff may repeatedly resend links or
edit the DB to help, unintentionally extending authority. A help label alone
does not supply a safe service. **Effect: requires accountable assistance and
evidence about unmet needs.** Explain the controlling end through existing
permitted tools; separately authorize any later remedy.
Exact changes: **C17/C19/C21; P19/P25/P26**.

### 18. Observability and auditability gaps

**Material concern: yes. Severity: high for undetected access drift.
Likelihood: plausible.** Generic success/error logs cannot explain which
completion/policy/end governed a read or whether a replay extended it.
Private filenames in logs add harm. **Effect: requires minimal durable
evidence plus diagnostic separation.** Record the authoritative effect and
relevant policy changes, correlate decisions safely and distinguish emitted
bytes from user reading/saving. Exact changes:
**C06/C19/C21; P05/P26 and the operating controls below**.

### 19. Dependency and integration risks

**Material concern: yes. Severity: high. Likelihood: plausible.**
Provider URLs, caches, signed-token clocks or webhook delays can disagree with
Core's source boundary. Comparator settings are not native authorization
guarantees. **Effect: requires actual delivery qualification.** Core owns the
end; providers supply bounded delivery/processing under it. Reconcile late or
contradictory events without a new window and deny an unqualified direct path.
Exact changes: **C08/C16/C20; P08/P14/P15/P21/P24**.

### 20. Migration, rollout, and upgrade risks

**Material concern: yes. Severity: high. Likelihood: plausible if applied
globally.** Backfilling `completed_at` from `updated_at`, new readers plus old
writers, or restoring old rows can revive ended grants or shorten promised
access. **Effect: limits adoption to qualified prospective cohorts.**
Inventory legacy semantics; no automatic extension/backfill. Require
compatible rollout, source-bound kill switch and safe restore/roll-forward.
Exact changes: **C01/C09/C20; P07/P23/P24**.

### 21. Testability, traceability, and proof

**Material concern: yes. Severity: high. Likelihood: likely if a date UI or
mocked unit suite is treated as qualification.**
Tests can mirror a formula while missing exact expiry, role composition,
streams, stale pages or real user confusion. Current source and governing
intent are separate evidence layers. **Effect: requires falsifiable outcomes
and stage-correct trace.** Carry C/P IDs into owner sources, derived OpenSpec,
design/tasks, authorized tickets and release evidence. Exact changes:
**C10/C14/C20/C21; P01–P26**.

### 22. Other development hazards

**Material concern: no additional independent concern found.**
Checked money precision/posted facts, new licenses/dependencies, publication
authority, broader-drive scope and runtime/config mutation. This decision
introduces no money arithmetic or provider purchase, and the review changes
only grooming documentation. Disaster restore, scope creep and unsupported
clock defaults are already explicitly covered in C01/C07/C15/C20 rather than
counted as new independent findings. This is not a claim that the unbuilt
implementation has no remaining hazards.

## Proof required before activation

These are independently testable acceptance groups. Existing adjacent tests
cannot substitute for the source/role/provider/browser evidence named here.

| ID      | Required observable proof                                                                                                                                                                                                                                                                                                                                                                |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q07-P01 | Only prospectively admitted ordinary source profiles get this rule; specialist/legacy/independent rights remain unchanged. Fourteen-day and fixed-end alternatives are recorded as rejected options, not hidden configuration.                                                                                                                                                           |
| Q07-P02 | A trusted normal-fulfillment event produces exactly a 720-hour maximum. Rejected client/business/unknown/future timestamps cannot supply an anchor; date/month/year/DST boundaries preserve the selected elapsed meaning.                                                                                                                                                                |
| Q07-P03 | Completion immediately before, at and after an earlier source end has correct eligibility. After expiry/revocation or missing recipient admission, independently authorized source work can complete without recipient readback or a fabricated access grant. A delayed consumer proves the original relevant policy/eligibility/caps plus current authority, never today's state alone. |
| Q07-P04 | An earlier admitted end controls; later cap removal/default increase cannot lengthen it. A later genuine source-authority shortening remains binding after its cause is removed/relaxed, without restoring the prior later end. Clearing an explicitly temporary restriction restores only an eligible representation within unchanged valid authority.                                  |
| Q07-P05 | Duplicate messages, concurrent completion attempts, lost response, replay, projection rebuild and delayed processing recover one durable source outcome/end and no duplicate required effects. A replay after caller expiry preserves the business result without leaking its stored private response.                                                                                   |
| Q07-P06 | Completion races correction admission, recipient reassignment and restriction with one authoritative relevant ordering. No stale predecessor certification, new audience or invalid late submission is admitted.                                                                                                                                                                         |
| Q07-P07 | Missing/null/nonfinite/invalid policy, malformed provenance, unsupported precision and unknown legacy semantics deny affected access without fabricating expiry, completion or rejection.                                                                                                                                                                                                |
| Q07-P08 | At the actual declared precision, immediately before/at/after end checks behave correctly with cleanup paused, wrong client time, stale sessions, long transactions and qualified clock failure handling. No unselected grace appears.                                                                                                                                                   |
| Q07-P09 | Return, first view, login, proof refresh, resend, download retry, help, preview regeneration and delayed notice never slide/pause the source clock.                                                                                                                                                                                                                                      |
| Q07-P10 | Same email/person/file across tenants, environments, requests and recipient revisions cannot cross scope, including direct identifiers, error differences, counts, search and pagination.                                                                                                                                                                                                |
| Q07-P11 | Every metadata/history, original/preview, HEAD/range/conditional/resume/recovery and alternate delivery path requires current authority; no old URL, latest pointer or technical worker result grants access.                                                                                                                                                                            |
| Q07-P12 | Real user/recipient/staff/service roles, column grants, RLS USING/new-row checks, combined policies, views/RPCs/storage and privileged functions prevent scope/actor/anchor/end/clearance forgery and forbidden updates.                                                                                                                                                                 |
| Q07-P13 | Same-scope FKs/typed references, effect uniqueness, required fields, valid state constraints and delete/hold behavior protect integrity while allowing truthful completed-without-recipient-access outcomes.                                                                                                                                                                             |
| Q07-P14 | Original/preview eligibility and temporary recovery stay independent; superseded/new unrelated files remain inaccessible. Slow streams enforce per-chunk end and feasible termination; buffered/emitted limitations are measured without recall claims.                                                                                                                                  |
| Q07-P15 | Actual route/CDN/browser/service-worker/cache/back-navigation/logout/switch behavior does not create a new protected read or cross-context disclosure after authority ends. Already received copies are treated honestly.                                                                                                                                                                |
| Q07-P16 | Actual earlier ends and precision display correctly across locale/timezone/DST changes, zoom and RTL. No date rendering or hydration change moves the server end or promises an extra interval.                                                                                                                                                                                          |
| Q07-P17 | Unknown authority, session/proof expiry, ended source access, file unavailability, history-only failure and partial/lost outcomes yield distinct truthful allowed states and preserve independent valid work.                                                                                                                                                                            |
| Q07-P18 | Representative keyboard/speech/AT/touch/mobile/zoom/low-bandwidth journeys can find the end and actions, re-enter and recover focus. Each timing limit has documented applicable conformance proof; automated checks alone do not pass.                                                                                                                                                  |
| Q07-P19 | The actual governed help route works and gives a permitted outcome without enrollment/bypass/automatic extension/private attachment fallback or false promise.                                                                                                                                                                                                                           |
| Q07-P20 | Access expiry, retention, holds, disposal, independent source uses and previously saved copies remain separate; neither automated deletion nor retained-file access is inferred.                                                                                                                                                                                                         |
| Q07-P21 | Provider failure, delayed/out-of-order callbacks, unknown external success and outage recovery preserve the original effect/end. No provider URL, lifetime, delivery retry or fresh rendition may authorize recipient serving beyond current Core permission; independently qualified processing/custody lifetimes remain separate.                                                      |
| Q07-P22 | Production-shaped tenant skew, repeated returns, concurrent streams and history sizes remain inside approved query/page/concurrency/egress budgets, including boundary and one-unit-excess cases; no global sweep is required to deny expired access.                                                                                                                                    |
| Q07-P23 | Prospective cohort migration, mixed old/new readers/writers, rollback/roll-forward, backup restore and source fact correction preserve historical evidence and deny invented/revived access.                                                                                                                                                                                             |
| Q07-P24 | A scoped kill switch denies affected completed reads without reopening intake, deleting evidence or changing unrelated qualified rights. Re-enable requires current contracts and qualifications.                                                                                                                                                                                        |
| Q07-P25 | Representative recipients correctly understand actual cutoff, sign-in versus access expiry, unchanged source receipt and help. Identify cohorts with no usable completed readback under their binding limits before claiming delivery. Resolve safety-critical misunderstandings; report sample limits and validated unmet needs without invented support/satisfaction metrics.          |
| Q07-P26 | Durable source/audit records and minimized diagnostic signals explain why an end/read changed without leaking private contents or falsely claiming human reading/saving/acceptance. Required controls have an assigned owner and tested response.                                                                                                                                        |

## Synthesis and sequencing

1. **Before amendment ratification:** retain A and record the corrected
   decision, C01–C21, P01–P26 and controls. Explicitly adopt the fixed ceiling,
   exact source anchor, 720-hour meaning, non-revival, truthful earlier end and
   prospective scope. No unresolved empirical optimum is needed to choose a
   bounded initial policy; it must remain identified as judgment.
2. **At formal specification publication:** reconcile the requesting-source
   contract with P4/P12 admission, Q03/Q04/Q05/Q06, communication and custody
   owners. Carry exact IDs through canonical sources and their generated
   OpenSpec projections. Active-request authority, later renewal/accommodation
   and any communication policy must be explicitly resolved for the enabled
   profile; this review does not fill them with new product choices.
3. **In design:** define the actual authority/time boundary, policy/effect
   persistence, same-scope constraints, real-role grants, concurrency ordering,
   delivery/caching behavior, sufficient display precision and existing
   assistance integration. Use existing shared services and UI; do not build
   a general calendar/renewal engine.
4. **In implementation qualification:** first prove source invariants and
   real-role negative cases, then end-to-end current reads and failure
   recovery, then mobile/AT/help and production-shaped budgets. Qualification
   failures deny only the affected capability/profile where safely possible;
   they never authorize an easier fallback or indefinite access.
5. **In rollout:** admit a named prospective cohort behind a source-controlled
   activation gate, exercise kill/restore/roll-forward, then observe the
   signals below. Existing grants retain their real contracts; unknown
   legacy state is not converted automatically.

This is the permanent path: a simple finite source policy with explicit
authority and a useful completed journey. Monitoring is reserved for residual
operation and evidence-based product evaluation, never an alternative to
enforcing expiry or completing qualification.

## Residual operational controls

The role owners below must resolve to an assigned operational owner before
activation. Thresholds are intervention triggers, not claims about acceptable
leakage, measured SLOs or empirically optimal policy.

| Signal                                                                                           | Threshold                                                           | Owner                                               | Required response                                                                                                                                       |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Protected read accepted after its effective end or outside exact scope                           | Any confirmed occurrence                                            | Identity/security on-call                           | Deny the affected path/profile, preserve minimized evidence, investigate and requalify before re-enable.                                                |
| Admitted end moves later without a separately authorized owner action                            | Any confirmed occurrence                                            | Request-source engineering owner                    | Stop the offending writer/replay path, reconcile exact effects, preserve original history and assess affected grants.                                   |
| Authoritative expiry/clock canary violates its qualified boundary                                | Any failed boundary canary                                          | Platform/SRE on-call                                | Isolate the unqualified serving node/path and deny affected timed reads; restore qualified time/enforcement before return.                              |
| Persisted eligible completed view lacks valid source/policy/effect/end linkage                   | Any confirmed inconsistent record                                   | Request-source data owner                           | Quarantine affected read eligibility and repair through audited source reconciliation; never fill with now + 30.                                        |
| Displayed deadline implies availability after the authoritative end                              | Any reproducible mismatch                                           | Shared request UX/engineering owner                 | Correct the projection/formatting, suppress the misleading promise and verify locale/precision cases.                                                   |
| Provider/cache path bypasses current permission or substitutes identity                          | Any failed qualified contract canary or confirmed disclosure        | File-delivery/security owner                        | Disable that delivery path, preserve other independently safe actions and repeat real-provider qualification.                                           |
| Recipient cannot complete a required accessible re-entry/end/help journey                        | Any reproducible barrier                                            | Accessibility and requesting-source product owner   | Correct the journey or use an explicitly authorized accommodation; do not extend authority implicitly.                                                  |
| Validated ordinary follow-up need is defeated by the selected window or consistently earlier cap | First documented unmet use case requiring a product/source decision | Phase 29 product owner with requesting-source owner | Review the purpose, actual window and evidence; decide prospectively whether policy needs amendment. No automatic renewal or private-content analytics. |

## Recorded outcome and remaining proof

Q07 A and its full required amendment package are ratified by Conrad,
2026-10-20. The reviewed disposition was **Accept with required amendments**;
the exact corrected decision, C01–C21, P01–P26, reviewed temporal/UX contract
and all eight operational controls are now adopted grooming intent.
No Q08 choice or renewal/reminder policy is inferred.

The implementation remains unqualified. Current source observations and
adjacent tests do not prove native recipient RLS, exact live clocks,
provider delivery, browser behavior or accessibility. The evidence notes
separate fresh checks from historical tests. No product code, schema,
dependency, credential, provider configuration or permission was changed.
Formal source/OpenSpec publication awaits `/to-prd`; tickets await `/to-issues`.

## Founder ratification — 2026-10-20

Conrad instructed: “Yes, Ratify this with the required amendments. Record it
and move to the next question in this phase 29 grill-with-docs session, with
the research, practical options, and your recommendation.”

This adopts the exact corrected decision, Q07-C01–C21, Q07-P01–P26,
the reviewed temporal/UX contract and all eight operational controls.
Recording changed status/trace only; the decision, clause/proof rows and
controls are preserved. Renewal, active-request duration, notifications,
formal publication, implementation and activation are not inferred.
