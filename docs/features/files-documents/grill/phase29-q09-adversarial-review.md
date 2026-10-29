# Phase 29 Q09 — otherwise-authorized late submissions: adversarial review

**Disposition: Accept with required amendments.**

Conrad selected and then ratified **A — Allow otherwise-authorized late
submissions and pending corrections** with the exact corrected decision and
complete required amendment package on 2026-10-20. Q01–Q08 remain ratified.
This is adopted grooming intent, not formal specification publication or
runtime activation.

## Evidence and limits

Local Core and live GitHub `develop` were reverified at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab`. The review combines current source,
governing owner contracts, the ratified feature decisions, primary external
documentation, and independent [owner](phase29-q09-owner-adversarial.md),
[runtime](phase29-q09-runtime-adversarial.md) and
[UX](phase29-q09-ux-adversarial.md) reviews.

- **Repository intent:** the source owns submission permission, dates,
  recipient obligations, evidence acceptance and fulfillment. Tasks and
  Workflow project or coordinate those facts. Q03 correction fencing,
  Q06 completion and Q07/Q08 read-only access remain binding.
- **Current implementation:** existing task fields, overdue filters, upload
  controls and recovery mechanisms are adjacent precedents. They do not
  establish a qualified native private-request admission or due policy.
- **Verified external facts:** comparable products implement different
  deadline effects. The documented distinctions below are evidence, not
  a universal nonprofit default or proof of Core implementation.
- **Product judgment:** for an ordinary collection request, a missed target
  alone need not force staff to unlock otherwise-permitted work.
- **Unresolved proof:** native real-role database authorization, concurrent
  admission, actual provider behavior, date-policy integration and recipient
  usability have not been qualified. No ministry survey, production incident
  rate, support savings or deadline-comprehension result is claimed.

Severity is prospective impact. Likelihood is qualitative engineering
judgment if the omission remains, not a measured probability. No native
production vulnerability was demonstrated.

Selected repository evidence, relative to `/home/conrad/code/core`:

| Evidence                                                                         | Consequence                                                                                                                                |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/ai/document-authority.md:10–48`; `openspec/project.md:6–18`                | Owner intent, generated views, current code and qualification are distinct.                                                                |
| `openspec/specs/platform-boundaries/spec.md:165–168,274–288,401–438`             | Private mutations stay server-owned; shared task and communication owners remain authoritative.                                            |
| Feature ADRs Q01–Q08, especially Q03:18–51 and Q06:22–45                         | Durable correction admission, current authority and normal fulfillment remain separate.                                                    |
| `docs/prds/workflow-studio/03-runtime-and-recovery.md:47–67`                     | Semantic effect identity, source-owned late acceptance, separate source/decision times, explicit clocks and source-timeout reconciliation. |
| `docs/prds/workflow-studio/contracts/requirements.json:145–156,204–211`          | External access is finite/revocable; source-owned clock rules are preserved.                                                               |
| `docs/prds/workflow-studio/contracts/recipe-catalog.json:495–523`                | Generic document request remains disabled/unqualified; suggested scheduling values are not native defaults.                                |
| `packages/api/src/missionary-portal/tasks.ts:30–40,81–98`; `task.ts:25–58,81–97` | Current mutable task dates/status do not define private-request receipt or permission.                                                     |
| `apps/missionary/app/tasks/page-client.tsx:793–821`                              | Browser overdue filtering is presentation, not authoritative time or admission.                                                            |
| `supabase/config.toml:34`                                                        | Local PostgreSQL major version is configured as 17; no hosted-version claim.                                                               |

The supporting reviews give the wider census and exact limitations.

## Adversarial check

### What could go wrong with this answer?

“Allow late” could be implemented as bypassing expiry, freezing a stale
permission snapshot or reopening accepted work. A generic deadline job could
still close the request, making the chosen behavior ineffective. Conversely,
staff could mistake a late receipt for accepted evidence or use “not complete”
to blame a recipient whose files arrived on time.

### What hidden assumptions are we making?

There is not yet proof of a native source capable of binding recipient,
requirement revision, current authority, immutable bytes, correction lineage,
applicable target and one durable receipt. A “due_at” column does not supply
that contract. Nor does a successful upload mean a requirement is satisfied.
The frequency of legitimate late work is unknown.

### How does this affect the whole product?

The requesting domain owns the result. Mission Control, recipient surfaces
and Workflow must project the same facts without copying independent date or
permission authority. Specialist financial, application, care and publication
deadlines retain their own rules. No generalized drive, calendar engine,
late-approval queue or document-specific replacement task system follows.

### How does this affect the end-user experience?

The person sees the real requested date and whether sending is currently
possible. Lateness is information, not a form error or compulsory explanation.
Receipt, checking, review and further requested work have distinct wording.
Recovering a lost response preserves the first received act instead of forcing
another upload. Staff receive exact current evidence without silently changing
the version already under review.

### Does this follow modern best practices?

It follows documented distinctions, not a claimed consensus:

- [Dropbox](https://help.dropbox.com/share/received-file-request) supports
  optionally receiving files after a deadline and marking them late. Its
  identity, version and general storage behavior are not adopted.
- [Box](https://support.box.com/hc/en-us/articles/360044783734-Box-File-Request-FAQ)
  can close submissions on a date and configures File Requests independently
  of shared links. Its upload-only model does not establish Core reading rights.
- [Submittable Next](https://next.support.submittable.com/hc/en-us/articles/41923721981719-Set-a-Public-and-Private-Deadline-for-a-Cycle-Soft-and-Hard-Close-Dates)
  separates public/private dates and can allow existing drafts after its hard
  date with additional approval. Core does not adopt hidden grace or that queue.
- [Foundant](https://support.foundant.com/hc/en-us/articles/4411213334935-Follow-Up-Submission-Logic)
  separates submitted follow-ups and administrator completion. It does not
  prove a universal late-submission rule.
- [W3C status guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  supports perceivable progress/results without unnecessary focus changes;
  [error guidance](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
  supports specific textual errors. Permitted lateness is not invalid input.
- [OWASP upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
  still requires authorization, bounded uploads and file validation. A soft
  target does not weaken any of those protections.

The [comparative research](phase29-q09-comparative-research.md) documents
additional close comparators and their limitations. General giving checkout
conversion advice does not establish private evidence intake or deadline law.

### Does this fit Asym’s existing repo and product direction?

Yes, if adopted as the ordinary source profile and qualified through existing
owners. Workflow explicitly defers late acceptance to the source. The same
contract contains date-only **expiry** and eligible Studio clock rules; those
must not be silently applied to this new submission target or used to equate
target and access end. A compatible qualified source rule may be reused.
Current task/date code is not the permanent authority.

### Should we adjust the recommendation?

Keep A, with the amendments below. B remains stronger where a real source
purpose requires a fixed intake boundary. Do not add a per-request policy
builder merely to avoid choosing the ordinary behavior. The required changes
make A precise without selecting a new duration, calendar default, extension
permission, grace period or notification program.

## Corrected decision to record

For the ordinary native Private Document Request, the requested due date is a
target for specified recipient work. Passing that target alone SHALL NOT close
submission or Q03-permitted correction, revoke reading, satisfy a requirement,
complete a request, or require an additional late-approval step.

Every admission SHALL still satisfy current source, tenant, recipient, purpose,
item/revision, finite access, binding intake cutoff, freeze/completion and
file-custody requirements. Unknown authority is not permission. Specialized
owners keep stricter deadlines. Q08 fresh completed access remains read-only.

The source SHALL preserve one trustworthy durable receipt of the exact
submission, its actual admission time and available immutable evidence of the
applicable target terms/revision. If target-only unavailability prevents proof,
record unresolved timing and governed recovery rather than a timing verdict.
Reconciliation must recover the terms applicable at admission; today's mutable
target is not a substitute. If those terms remain unprovable, timing remains
unknown while the receipt stays true.
For a resolved target instant, admission strictly after that instant is late;
equality is not after it. Use the source's qualified precision and temporal
interpretation. Upload start, browser time, provider metadata, delayed checks,
staff review and response delivery SHALL NOT substitute for admission.

Historical receipt timing and the terms applicable then SHALL remain preserved.
Later date changes may affect current outstanding work only through actual
source authority; they SHALL NOT silently rewrite receipt history, revive
expired rights or undo closure. Erroneous source facts require a governed,
attributable correction that preserves prior evidence. A later correction has its own receipt and
exact Q03 lineage. Newly assigned work uses explicitly applicable source terms,
without inheriting an unrelated past date or an invented new interval.

Recipient-overdue status SHALL describe currently outstanding recipient work,
not merely the absence of source fulfillment. On-time material awaiting
checking or review is not overdue recipient work. A failed check can require
further action without erasing the original received act or falsely declaring
the requirement satisfied.

Keep the recipient in the same task context with truthful dates, current
actions, progress, receipt and recovery. Lateness alone adds no compulsory
explanation, repeated confirmation, account enrollment or separate upload
journey. Date-only, absent and unavailable target states must be distinguished.
A target-only outage SHALL NOT manufacture a cutoff when current authority is
independently proved; unknown data needed for actual permission SHALL deny
the affected action.

Serialize admission, correction, review, date/revision changes and actual
closure/revocation at the owning mutation boundary. Preserve durable semantic
identity and reconcile unknown outcomes before retrying or cleaning up bytes.
Keep the submitted bytes, recipient, item, purpose, correction target and
material instruction scope bound to that intent. A source-qualified target-only
change may be resolved at first admission without changing that intent; once
admitted, replay preserves the captured terms or explicit unresolved timing.
Workflow, task views and communications remain source-authorized projections
and effects. No new reminder, escalation, active-access lifetime, fresh-access
clock, retention policy or deployment is selected by Q09.

## The recommended recipient and staff journey

### Recipient

1. Open the existing request through current Q01 confirmation and authority.
   Show the requested work, source-authorized context, received items and
   remaining actions. Do not ask again for identity fields already available.
2. Label the target **Requested by**, with a readable localized date and
   unambiguous zone/precision where time matters. Show an independently
   controlling submission/access limit where needed; do not require people
   to calculate which date wins.
3. If relevant work is overdue and submission is currently allowed, use calm
   copy such as **The requested date has passed. You can still submit the
   requested files.** Recheck the action on the server; this copy promises no
   future grace period.
4. Choose a file using an accessible standard control; drag-and-drop can
   supplement it. Retain Q03's inline exact correction target and one
   deliberate **Send corrected file** action. No mandatory reason just for
   lateness. Preserve supported file restrictions and source-specific evidence
   questions that actually serve the underlying requirement.
5. Show transfer progress separately from receipt. After durable admission,
   show **Received** and its time; where useful, **Received after the requested
   date**. Follow with **Checking file** or **Awaiting review** as appropriate.
   Never announce “Approved” or “Requirement complete” from upload success.
6. If the response is lost, show **We’re checking whether your submission was
   received**, then reconcile the same attempt. Do not display failed, late or
   success before evidence supports it. If the operation did not commit and
   new admission is needed, current rules and its actual admission time apply.
7. When actual permission or intake ends, explain the action-specific state
   only to a caller authorized to see it. Preserve independently authorized
   reading/help. Neutral entry screens must not expose the request's existence,
   filename, late status or recipient to an unqualified caller.

### Staff

Show current outstanding recipient work separately from material awaiting staff
review. For exact evidence, retain the receipt time, applicable date terms,
correction relationship and current review status. Opening a document is not a
review lock; a late correction cannot replace the bytes under an open reviewer.
Q03's durable correction fence prevents acceptance of a superseded candidate.

A changed target requires an existing source-authorized operation, not an edit
to the Tasks Hub projection. Q09 creates no such new editing capability.
Where it already exists, show the current requested date while preserving the
prior terms and affected receipt facts in authorized history. Do not produce a
new staff exception queue merely because a file arrived late.

A compatible target-only change need not force another upload or confirmation.
The source must qualify that compatibility, capture the actual terms at
admission, and preserve reviewed scope. A material instruction, recipient,
purpose or authority change still follows its proper guard; convenience cannot
silently reinterpret the selected file.

### Boundary examples

These are hypothetical tests, not invented ministry observations.

| Situation                                                   | Truthful outcome                                                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Files admitted before target, scanner finishes afterward    | Preserve on-time receipt; show actual checking/review state.                                                                                     |
| File admitted on target instant at authoritative precision  | Not late; a separate exclusive access/intake end may still deny admission.                                                                       |
| Required item still missing after target                    | Show overdue outstanding work and the current permitted action.                                                                                  |
| On-time file later fails a check                            | Preserve receipt; show the specific safe problem and current correction action. Do not claim the requirement was satisfied.                      |
| Recipient voluntarily corrects a pending on-time submission | Preserve original receipt; classify the correction against the terms actually applicable to it. No silent timestamp inheritance or new interval. |
| Staff requests an additional item or clarification later    | Identify the newly assigned work and its actual applicable due terms; do not retroactively apply an unrelated old target.                        |
| Target changed after a receipt                              | Current outstanding status can change under source policy; past receipt and original target provenance do not disappear.                         |
| Metadata for a target temporarily unavailable               | Show timing unavailable; continue only independently proved actions. Do not infer no target, late, or ended permission.                          |
| Browser has an old target or an old enabled button          | Current server source state governs; refresh accurate permitted context without losing safe user context.                                        |
| Bytes uploaded but admission outcome unknown                | Reconcile the same intent; no destructive cleanup or duplicate receipt merely because a response failed.                                         |
| Source has fulfilled, frozen or closed intake               | Q09 cannot reopen writing. Independent staff processing/reading follows its own authority.                                                       |
| Recipient has Q08 fresh completed access                    | Read-only, despite the original target being in the past.                                                                                        |

Keyboard, screen-reader, speech-input, touch, zoom/reflow, RTL, translated
dates and small screens must work with the existing shared Base UI/base-maia
controls and semantic tokens. Keep status in main content, with appropriate
announcements and field-linked actual errors. Avoid countdowns, color-only
lateness and automatic focus jumps. An expired session is not an ended source
grant; recover safe context without silently replaying a submission.

Low-bandwidth retries must not duplicate work. Do not claim resumable upload,
offline admission, a private local archive or guaranteed background completion
unless the actual implementation is supported and qualified. Names are display
data, not identity keys; this choice adds no address form.

## Ownership, invariants and lifecycle

| Fact                                                    | Authority                                                              | Derived or supporting systems                                             |
| ------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Requested work, applicable target and permitted changes | Requesting source                                                      | Staff/recipient views and shared tasks project them.                      |
| Recipient/proof/current allowed action                  | Q01/P4/P12 plus exact source                                           | Session, invitation and provider URL cannot grant authority.              |
| Immutable bytes, safety/representation availability     | Existing custody owner                                                 | Provider metadata supports custody, not business receipt or acceptance.   |
| Durable submission/correction receipt and lineage       | Source mutation boundary with custody evidence                         | Upload progress, callbacks and UI are observations.                       |
| Business evidence acceptance/fulfillment                | Requesting source under exact current evidence                         | Task Done, scan completion and due jobs cannot manufacture it.            |
| Recipient-overdue projection                            | Current source obligation plus applicable target and admitted evidence | Rebuildable projection, never a new write authority.                      |
| Required notifications/tasks                            | Existing P17/P6 and shared task/Workflow owners                        | Must be separately authorized; Q09 adds no program.                       |
| Retention, disposal and legal holds                     | Relevant source/custody owners                                         | Lateness and correction history confer no additional retention or access. |

The model has several independent dimensions, not one giant status enum.
Admission is unsubmitted, in progress, durably received or definitively not
received; unknown is the observer's knowledge of an operation. Checking and
review have their own states. Current recipient work can be outstanding or
awaiting another actor. Authority can end without successful fulfillment.

Allowed transitions include: authorized admission before or after a target;
Q03 correction of an exact eligible candidate; source-authorized changes to
current work; checking/review after receipt; source fulfillment under its
own authority. Target passage alone changes relevant timing information.

Forbidden transitions include: target passage to automatic approval,
completion or access revival; an expired grant to new admission; correction of
accepted/frozen work without its separate governing source procedure; retry
to a second effect; date edit to hidden historical relabeling; failed successor
to silent predecessor revival.

Before dispatch, abandoning a local selection creates no receipt. After
dispatch, closing the UI is not cancellation. Source cancellation or closure
must be an explicit authorized state transition, preserving already received
acts and exact lineage. A recipient's loss of access does not undo independently
authorized source work. Q06/Q07 begin only at normal source fulfillment.

For one deliberately submitted intent, the durable receipt, exact bytes,
relevant target/revision evidence or explicit unresolved timing, and required
history/effect intent must be mutually
consistent. For a correction, its predecessor fence and evidence-set change
must share the source's atomic boundary. Parallel sibling work must remain
intact. Competing admissions where no receipt row exists require a uniqueness/
serialization strategy too; locking an absent row is insufficient.

An unresolved target is not a license to omit receipt provenance. The exact
trusted source/item/recipient/intent, admission occurrence and its required
history must still be durable. If that required evidence cannot be recorded,
do not declare a received outcome. Missing target terms alone may leave the
receipt valid and its timeliness unresolved under the qualified recovery
contract; never imply its historical classification is complete.

Immutable submitted intent and server-resolved target terms are distinct.
Changing bytes or material reviewed scope conflicts with the same intent.
A qualified compatible target-only change before first admission can be
resolved under current source policy without replacing the intent. After
admission, retries cannot re-resolve against a newer target.

Recheck relevant source state and actual authoritative time after waits.
[PostgreSQL 17](https://www.postgresql.org/docs/17/functions-datetime.html)
distinguishes transaction-start time from actual current time. Do not blindly
use a transaction-start timestamp as proof that admission occurred before a
later cutoff. Define and test the source's durable admission boundary and
precision; this review does not mandate a new universal timestamp function.

For schema design, require tenant-aware source/item/recipient/submission
relationships; immutable receipt/attribution; uniqueness for the durable
business effect; valid correction/state combinations; deliberate delete
behavior; explicit absent versus unknown target semantics; finite permission
ends; and indexes for actual scoped lookup/ordering. Time passage is not a
permanent row check constraint. Cross-row currentness belongs in the serialized
source mutation with database constraints where expressible.

Test grants, RLS `USING` and effective `WITH CHECK`, views, RPCs, storage and
service paths with real roles. An allowed update must not move a row into
another tenant, owner, recipient, source, approval or timing state.
[PostgreSQL](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) reuses
`USING` as `WITH CHECK` for applicable policies when the latter is omitted;
absence of an explicitly written clause alone is not a proven bypass.
Owners/privileged roles can bypass RLS; source-command authorization remains
necessary. Constraint errors must not disclose other tenants' records.
No monetary values or precision choices are added.

## Exact required amendments

These are ratified grooming clauses for later authorized canonical publication.
They preserve Q01–Q08 rather than reopening those decisions.

| ID                                     | Required language                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Q09-C01 Ordinary target                | The ordinary request's due date SHALL be a requested-by target. Passing it alone SHALL NOT deny otherwise-authorized submission or Q03 correction, end reads, approve evidence, complete/cancel the request or create a late-approval gate. Specialized source policies remain authoritative.                                                                                                                                                                                                                                                                            |
| Q09-C02 Current admission              | Every new admission SHALL enforce current tenant/environment/source/recipient/purpose/item/revision authority, finite access, binding intake limits, freeze/closure/completion and custody eligibility. Unknown authority SHALL deny the affected action. Q08 fresh access SHALL remain read-only.                                                                                                                                                                                                                                                                       |
| Q09-C03 Trustworthy receipt timing     | The source SHALL durably preserve exact submission admission time and available immutable target-applicability evidence. If target-only failure prevents proof, timing SHALL remain explicitly unresolved; recovery must prove the admission-time terms, never substitute today's target or invent a verdict. Transfer start, client clock, provider dates, callback arrival, scanner completion, reviewer action and response receipt SHALL NOT replace receipt time.                                                                                                   |
| Q09-C04 Qualified date meaning         | Target comparison SHALL use a qualified source interpretation, timezone/calendar where applicable and authoritative precision. For a resolved instant, strictly later is late and equality is not late. Date-only/absent/unknown states SHALL be distinct; no accidental UTC-midnight, browser-local or generic Studio default. Actual cutoff/expiry boundary rules remain separate.                                                                                                                                                                                     |
| Q09-C05 Historical integrity           | Authorized date changes SHALL preserve original receipt and applicable target evidence. Current outstanding-work projection MAY follow the source's new terms without silently rewriting historical timeliness. Erroneous facts require explicit attributed owner correction with prior evidence preserved. No generic task edit, backdate, retry, migration or derived flag SHALL grant new authority or erase a prior received act.                                                                                                                                    |
| Q09-C06 Truthful outstanding work      | Recipient-overdue status SHALL require actual currently outstanding recipient work under its applicable target. Pending scanning/review or missing business acceptance alone SHALL NOT make timely submitted work recipient-overdue. Failed checks SHALL preserve receipt while accurately identifying any source-required next action.                                                                                                                                                                                                                                  |
| Q09-C07 Correction and new obligations | Each correction SHALL have its own receipt and exact Q03 relationship. Additional/clarification/replacement work SHALL use explicitly applicable source terms, without unrelated retroactive lateness or an automatic new interval. A correction SHALL NOT inherit predecessor approval or safety results.                                                                                                                                                                                                                                                               |
| Q09-C08 Exact review fencing           | Durable correction admission SHALL atomically apply Q03's predecessor fence and relevant evidence-set change. Stale review/completion SHALL NOT accept a superseded candidate; sibling material and independent uses remain intact. Failed successors SHALL NOT silently revive predecessors.                                                                                                                                                                                                                                                                            |
| Q09-C09 Serialized source effects      | Admission SHALL serialize with relevant target/revision, recipient, hard-limit, freeze, acceptance, completion and revocation changes. Qualified compatible target-only changes need not force reupload or confirmation; material meaning/scope changes keep their actual guards. Required receipt/history/effect intent SHALL be durable together or use an equivalent fail-closed recovery contract. Actual time SHALL be reevaluated after waits; no provider operation under a source lock.                                                                          |
| Q09-C10 Durable idempotency            | One deliberate submission identity SHALL converge on one exact durable effect across retry, double click, callback duplication and transport-key expiry. Bind submitted bytes and material recipient/item/purpose/correction/instruction scope; conflicting reuse SHALL fail. Server-resolved compatible target-only changes MAY be captured at first admission without replacing intent. Once admitted, replay retains its original time and captured terms/unresolved state. New corrections are separately identified; replay disclosure requires current permission. |
| Q09-C11 Unknown outcomes               | A transport/provider timeout SHALL NOT prove nonreceipt. Recover the same operation before duplicate submission or destructive cleanup; cleanup SHALL prove nonadmission/unreferenced custody under source policy. A missing response SHALL NOT move an already committed receipt after the target.                                                                                                                                                                                                                                                                      |
| Q09-C12 Target-only failure            | Unavailable target information SHALL NOT be treated as no target, a late result or a hard cutoff. Independently proved actions SHALL remain usable under a qualified source recovery contract preserving the receipt, available immutable provenance and unresolved timing. Reconcile only trustworthy admission-time terms; otherwise retain unknown timing. If missing information is needed to prove authority or a binding cutoff, deny that action. Activation requires resolved timing semantics and this recovery policy.                                         |
| Q09-C13 Trusted scope and attribution  | Tenant, actor, recipient, author/owner, source, review/approval facts and receipt time SHALL derive from trusted current context or validated source relationships, not caller declarations. Protected metadata, counts, history, cache keys, exports and recovery SHALL preserve exact role/tenant scope.                                                                                                                                                                                                                                                               |
| Q09-C14 Database enforcement           | The schema/mutation design SHALL enforce same-tenant relationships, semantic uniqueness, immutable provenance, legal states/nullability/delete behavior and bounded indexed access. Effective grants/RLS old-and-new-row behavior, views/RPC/definer/service/storage paths SHALL prevent authorized-row transitions into forbidden states.                                                                                                                                                                                                                               |
| Q09-C15 Private file boundaries        | Late intake SHALL retain file type/size/rate/quota, integrity, safety and representation gates. Original/preview/history reads remain independently authorized under Q04/Q05; lateness SHALL NOT publish files, revive superseded bytes, extend retention or bypass disposal/holds.                                                                                                                                                                                                                                                                                      |
| Q09-C16 Simple truthful UX             | Keep the existing request/item context, Requested by wording, current allowed action, exact correction target and durable receipt. Lateness alone SHALL NOT create a validation error, mandatory essay, repeated confirmation, new account/drive view or approval queue. Use action-specific blocked and unknown states.                                                                                                                                                                                                                                                 |
| Q09-C17 Accessible temporal UX         | Preserve Base UI/base-maia, shared semantics/tokens, keyboard/focus, speech/AT, touch, reflow, localization/RTL and time-zone clarity. Material progress/errors SHALL be perceivable without color-only/toast-only feedback or focus theft. Reauthentication/retry SHALL preserve safe context without unrequested replay or private offline storage.                                                                                                                                                                                                                    |
| Q09-C18 Workflow boundaries            | Target passage SHALL NOT let a task/timer complete, revoke or close the source through shorthand. Separately authorized reminders/escalations SHALL recheck exact current source work and governing dispatch rules. Q09 SHALL select no new message, cadence, escalation or generic execution platform.                                                                                                                                                                                                                                                                  |
| Q09-C19 Bounded operation              | Use existing custody/command/task/worker paths, bounded scoped queries/pages, suitable indexes and measured request/tenant/byte/concurrency budgets. No complete-history scan per row, provider fan-out per timing label or cron dependency for authority correctness. Abuse limits SHALL preserve ordinary qualified retries.                                                                                                                                                                                                                                           |
| Q09-C20 Minimal accountable history    | Preserve source-attributed receipt, target/revision applicability, correction and source decision history. Diagnostic telemetry SHALL minimize private names, addresses, filenames/content, tokens and deadline details. Staff correction/help SHALL use a real owner route; support messages do not grant rights.                                                                                                                                                                                                                                                       |
| Q09-C21 Safe adoption                  | Adopt prospectively for qualified ordinary-source cohorts and compatible reader/writer versions. No blanket reinterpretation of legacy deadlines or guessed receipt targets. Backfill only from reliable source evidence; unknown stays unknown. Rollback/restore SHALL preserve new receipt history and current adverse authority without reopening intake.                                                                                                                                                                                                             |
| Q09-C22 Trace and qualification        | Trace this selected answer and complete amendments into the authorized glossary/ADR, canonical owner requirements, generated OpenSpec, design/tasks, tickets, implementation and release proof at their proper stages. Native role/concurrency/provider/browser and representative-user evidence SHALL precede activation. Adjacent unit tests SHALL NOT be represented as that proof.                                                                                                                                                                                   |

## Category-by-category adversarial review

### 1. Problem validity, necessity, and alternatives

**Material concern: yes. Severity: medium. Likelihood: medium.**
An unconditional “late allowed” either solves a nonexistent blocking problem
or weakens a genuinely necessary cutoff. Q09's researched alternatives and
Workflow's source-policy contract support a scoped ordinary default, not a
universal rule. **Effect on A:** narrow its applicability. **Permanent fix:**
retain explicit specialist/hard limits and avoid a new configuration engine;
record C01/C02 and prove P01/P02. This avoids unnecessary staff unlocking while
keeping the strongest hard-cutoff alternative where it serves a real purpose.

### 2. Brittleness

**Material concern: yes. Severity: high. Likelihood: high.**
Client-local day filters, nullable dates and transaction-start timestamps can
misclassify receipt or use stale authority. Existing task code and PostgreSQL's
documented clock semantics show these assumptions are unsafe substitutes for a
source contract. **Effect:** refine A's temporal meaning. **Fix:** qualified
date semantics, actual admission evidence and after-wait checks, C03/C04/C09/C12;
P03–P05/P17. Unknown target metadata must not silently mean an expired grant.

### 3. Technical debt

**Material concern: yes. Severity: medium. Likelihood: high.**
Independent due flags and late-update jobs in each app would drift; a new
document queue would duplicate shared tasks. Existing shared-boundary ADRs
and current cross-surface date differences are concrete reasons to avoid that.
**Effect:** constrain implementation, not the selected behavior. **Fix:**
source-owned timing facts and shared projections/commands, C05/C18/C19;
P15/P23. Do not undertake an unrelated all-task rewrite.

### 4. Edge cases

**Material concern: yes. Severity: high. Likelihood: high.**
On-time-but-unsafe files, later clarification, missing siblings, exact
equality, absent dates and ambiguous local times can create false lateness or
false satisfaction. Q03 and Workflow's separate source dates make these
realistic boundary conditions. **Effect:** refine A. **Fix:** preserve receipt,
scope each obligation/date and distinguish checking from required recipient
work, C03–C07/C12; P03–P08/P18. The boundary table states exact expected outcomes.

### 5. Footguns

**Material concern: yes. Severity: high. Likelihood: medium.**
An administrator could edit a task date to “extend access,” or a frontend could
disable Send because any target is past. Existing mutable task fields do not
carry source permission. **Effect:** narrow what a due edit means. **Fix:**
date edits cannot reopen source work, authoritative server admission governs,
and copy shows actual action state, C01/C02/C05/C16/C18; P02/P09/P15.

### 6. Tenant safety

**Material concern: yes. Severity: critical. Likelihood: medium.**
Looking up a late request by email/file ID alone or caching status across
contexts could expose another organization's requirement or admit evidence to
the wrong tenant. Q01/P12 and platform boundaries require exact scope at every
path. **Effect:** constrain A's authorization. **Fix:** trusted context,
tenant-aware relationships and scoped reads/replay/caches, C02/C13/C14;
P16/P19/P20. This is a prospective design risk, not a demonstrated incident.

### 7. Database, RLS, and authorization safety

**Material concern: yes. Severity: critical. Likelihood: medium.**
An allowed row update could change recipient, target, ownership or approval;
privileged upload completion could bypass source checks. Adjacent upload/RLS
mechanisms do not establish the native contract. **Effect:** require database
and command qualification. **Fix:** constraints plus one serialized boundary,
old/new-row policies and privileged-path tests, C09/C13/C14; P10/P16/P20/P25.
Review effective `WITH CHECK`, not merely clause spelling; money precision
is unaffected.

### 8. Overengineering

**Material concern: yes. Severity: medium. Likelihood: medium.**
Soft/hard date builders, hidden grace, exception approvals and a new portal
could turn a target into a workflow product. Comparators offer such features
for different purposes; none is required for this selection. **Effect:** reduce
scope. **Fix:** reuse the existing request and owner commands; no extra late
gate or numerical scheduling policy, C01/C16/C18/C19; P01/P21/P28.

### 9. UX/UI and user friction

**Material concern: yes. Severity: high. Likelihood: high.**
An error-styled late badge, unclear zone or lost receipt can cause avoidable
resubmission and make staff delay look like recipient failure. W3C guidance
and the actual receipt/review distinction support a clearer design.
**Effect:** amend the journey. **Fix:** Requested by, actual receipt, calm
actionable states, field-linked real errors and accessible recovery,
C06/C07/C11/C16/C17; P06/P07/P11/P21/P22/P28.

### 10. Source of truth, ownership, and domain invariants

**Material concern: yes. Severity: high. Likelihood: high.**
Task Done, provider uploaded_at or a late boolean could become a competing
receipt/fulfillment authority. Workflow and Q03 explicitly separate them.
**Effect:** constrain A's model. **Fix:** preserve immutable admission and
applicable terms; derive current overdue only from source work, C03/C05/C06/C18;
P05/P06/P09/P15. Review and custody remain independently owned.

### 11. Hidden coupling

**Material concern: yes. Severity: high. Likelihood: medium.**
A timeout could close intake, a scan could become the receipt clock, or a
target edit could extend a grant through an implicit shared field. Workflow
already has distinct waits and source policies. **Effect:** refine integration
boundaries. **Fix:** separate target, permission and review facts; recheck
source before allowed timer effects, C01/C03/C12/C18; P05/P12/P15.

### 12. Failure modes

**Material concern: yes. Severity: high. Likelihood: medium.**
A committed admission with a lost response can be duplicated, marked late or
have its bytes deleted by “failed upload” cleanup. Adjacent Eve completion
cleanup covers definite failures, not proof of this native recovery case.
**Effect:** amend recovery. **Fix:** reconcile one intent, prove nonadmission
before cleanup and preserve independently permitted work during target-only
outages, C10–C12; P11–P14/P24.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: yes. Severity: high. Likelihood: high.**
Correction, reviewer acceptance, completion, revocation and target changes can
each pass stale checks and jointly violate lineage or authority. Q03/Q06 and
Workflow's race contract require an ordered source outcome. **Effect:** require
the existing atomic boundary to include relevant timing facts. **Fix:**
C03–C10; P03–P05/P08–P14/P17. Transport retries never redefine receipt time.

### 14. Data integrity risks

**Material concern: yes. Severity: high. Likelihood: medium.**
Date edits can erase which terms applied; duplicate callbacks can produce
multiple receipts; a correction may replace unrelated sibling evidence.
These are direct consequences of mutable task and multi-file models.
**Effect:** refine persistent facts. **Fix:** immutable provenance, exact
lineage and semantic uniqueness, C05/C07–C10/C14; P08–P14/P20/P25.

### 15. Security and privacy risks

**Material concern: yes. Severity: critical. Likelihood: medium.**
“Late allowed” may accidentally permit stale signed uploads, disclose
request/late status on an expired page or send private filenames to telemetry.
OWASP and Q01/Q04/Q05 retain their protections regardless of date.
**Effect:** bound A. **Fix:** current action-specific authorization, safe file
gates and minimized protected metadata/history, C02/C13/C15/C20;
P16/P19/P20/P24. Retention and safe deletion stay separately governed.

### 16. Scalability and performance risks

**Material concern: yes. Severity: medium. Likelihood: medium.**
Rebuilding overdue status by reading every file/history or calling providers
per row grows with tenant skew; a global timing lock blocks unrelated work.
No native workload measurements establish safe limits. **Effect:** constrain
implementation and evidence. **Fix:** scoped indexed queries, pagination,
local contention boundaries and explicit measured budgets, C14/C19;
P23. No invented file/count/latency limit is presented as proven.

### 17. Operational burden

**Material concern: yes. Severity: medium. Likelihood: medium.**
Manual “late unlock” tickets, deadline edits used as permission repairs and
direct database receipt fixes can become routine. That defeats A's purpose
and obscures who owns recovery. **Effect:** simplify ordinary work while
retaining accountable exceptions. **Fix:** no extra late queue; one owned
reconciliation/help route and immutable evidence, C11/C16/C18/C20;
P11/P12/P26/P28.

### 18. Observability and auditability gaps

**Material concern: yes. Severity: high. Likelihood: medium.**
Without target revision and receipt provenance staff cannot explain a late
label, distinguish provider delay from recipient delay, or safely correct a
projection. Generic traces are not durable business history. **Effect:** amend
evidence. **Fix:** attributable source facts with minimized diagnostics,
C03/C05/C10/C20; P05/P09/P26 and the eight controls below.

### 19. Dependency and integration risks

**Material concern: yes. Severity: high. Likelihood: medium.**
Delayed/duplicated storage callbacks, workflow wakes or notifications can
create a second effect or apply stale target rules. Provider success does not
establish source acceptance. **Effect:** preserve provider boundaries.
**Fix:** correlate exact intent/source revision, reconcile durable source
facts and reuse existing dispatch recovery, C03/C10/C11/C18;
P11–P15/P24. No vendor or runtime replacement is required.

### 20. Migration, rollout, and upgrade risks

**Material concern: yes. Severity: high. Likelihood: medium.**
A blanket reinterpretation of existing due columns could reopen closed
intake; backfilled target snapshots could fabricate historical timing.
Mixed clients may still disable Send after a target or misread new states.
**Effect:** limit initial adoption. **Fix:** explicit ordinary cohorts,
compatible readers/writers, trustworthy backfill only and history-preserving
restore/rollback, C21/C22; P25/P27. No old row becomes eligible by default.

### 21. Testability, traceability, and proof

**Material concern: yes. Severity: high. Likelihood: high.**
“Modern UX,” passing task tests or a polished mock could be mistaken for
correct native deadline/RLS behavior. The census shows that proof is absent.
**Effect:** make adoption conditional on falsifiable evidence. **Fix:**
C22 and P01–P28, source-to-release trace and actual user/role/concurrency
qualification. The six adjacent tests below prove only their stated seam.

### 22. Other development hazards

**Material concern: no additional independent concern found.**
Checked dependency selection, financial amounts, new organizational roles,
general storage scope and unrelated CMS/giving architecture. Q09 needs none
of these changes. Remaining hazards—backdated rights, unsafe rollback, status
ambiguity and unbounded access—are already assigned explicit requirements and
proof above. This finding introduces no new exception or claim of runtime safety.

## Proof required before activation

Each proof must assert business/user outcomes against the actual chosen source,
not merely repeat a helper's implementation. Tests need relevant tenants,
roles, source states, adverse paths and boundaries.

| ID      | Falsifiable acceptance proof                                                                                                                                                                                                                                                                                                                                                                         |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q09-P01 | A valid ordinary late submission and Q03-eligible late correction each produce one truthful receipt without a new late-approval gate or compulsory explanation.                                                                                                                                                                                                                                      |
| Q09-P02 | The same actions are denied after actual authority expiry, revocation, binding source cutoff, acceptance/freeze or normal fulfillment; specialist policies and Q08 read-only access remain intact.                                                                                                                                                                                                   |
| Q09-P03 | Before/equal/after resolved target at supported precision produce correct timing; equal target does not override an independent exclusive access end.                                                                                                                                                                                                                                                |
| Q09-P04 | Date-only rules, absent/unknown terms, different IANA zones, DST gaps/overlaps and locale/RTL display preserve the selected source interpretation; client clock skew cannot decide authority.                                                                                                                                                                                                        |
| Q09-P05 | Transfer, source admission, callback, scan, review and response deliberately occur on opposite sides of a target; the original authoritative receipt and terms remain correct.                                                                                                                                                                                                                       |
| Q09-P06 | All required material received on time but awaiting checking/review is not labeled recipient-overdue; genuinely outstanding source-required work is accurately distinguished.                                                                                                                                                                                                                        |
| Q09-P07 | A failed check preserves receipt and shows accurate remaining work; a new clarification/additional obligation does not inherit unrelated historical lateness or an invented interval.                                                                                                                                                                                                                |
| Q09-P08 | A late correction preserves original receipt, fences its exact predecessor at admission, does not revive it after failure, and leaves siblings/independent uses intact.                                                                                                                                                                                                                              |
| Q09-P09 | An authorized target edit changes only permitted current interpretation; historical receipt/target evidence remains explainable, erroneous-fact corrections retain attributed prior evidence, and unauthorized generic task/date changes cannot extend access. Qualified target-only changes avoid needless reupload while material instruction/scope changes cannot reinterpret the submitted file. |
| Q09-P10 | Race correction against review/fulfillment, target revision, grant expiry/revocation and simultaneous absent-row admissions: one valid serialized result, no superseded acceptance or double effect.                                                                                                                                                                                                 |
| Q09-P11 | Commit succeeds but response is lost across target/access boundaries: recovery finds the same receipt/time; denied disclosure does not undo the effect or expose private result.                                                                                                                                                                                                                     |
| Q09-P12 | Target-only outage preserves independently proved actions, receipt and available immutable provenance with timing unresolved. Recovery uses the target applicable at admission, not today's changed target; irrecoverable timing stays unknown. Authority/cutoff uncertainty denies the affected action without claiming source completion or nonreceipt.                                            |
| Q09-P13 | Double click, multiple tabs, callback duplication, replay after transport-key expiry and out-of-order events converge on one semantic effect; conflicting submitted payload/scope fails. A qualified target-only change before first admission can preserve intent, while replay after admission cannot substitute newer timing terms.                                                               |
| Q09-P14 | Definitive failure and unknown outcome follow different cleanup paths; no committed/referenced original is deleted and unadmitted abandoned custody is reconciled under policy.                                                                                                                                                                                                                      |
| Q09-P15 | An overdue projection or workflow timeout cannot close/approve/revoke the source; separately authorized dispatch rechecks current work and suppresses stale effects where cancellation remains possible.                                                                                                                                                                                             |
| Q09-P16 | Cross-tenant/environment/recipient/source IDs, caller-forged ownership/time/approval and stale proof fail through APIs, DB roles, storage and privileged service paths.                                                                                                                                                                                                                              |
| Q09-P17 | Hold a relevant lock across target and hard authority boundaries; subsequent admission uses the current serialized source outcome and correct time, not a pre-wait snapshot.                                                                                                                                                                                                                         |
| Q09-P18 | Multi-item requests, optional material and later-required work are scoped correctly; file count or generic completion alone cannot define outstanding recipient work.                                                                                                                                                                                                                                |
| Q09-P19 | Metadata/history/counts/errors/caches/exports/recovery disclose only the current authorized scope; neutral expired entry does not reveal request existence or lateness.                                                                                                                                                                                                                              |
| Q09-P20 | Real SQL grants, effective USING/WITH CHECK, views/RPCs/definer/service/storage paths and constraints prevent a valid-row update into an invalid tenant/owner/recipient/timing/review state.                                                                                                                                                                                                         |
| Q09-P21 | Keyboard, screen-reader and speech paths can select/send/recover; real invalid fields are explained, permitted lateness is not announced as an error, and focus/status remains coherent.                                                                                                                                                                                                             |
| Q09-P22 | Mobile/reflow/zoom/RTL/localized times and interrupted low-bandwidth use remain understandable; no unsupported offline/resume promise, unrequested replay or private browser archive.                                                                                                                                                                                                                |
| Q09-P23 | Production-shaped tenant skew, item/history volumes, concurrent submissions/reviews and retry bursts meet declared query/page/byte/latency budgets at limit and excess without cross-tenant/global locking.                                                                                                                                                                                          |
| Q09-P24 | Provider/checker/worker outages, delayed events and retries preserve custody, source receipt and independent permitted work; actual safety/quota gates still apply.                                                                                                                                                                                                                                  |
| Q09-P25 | Prospective cohorts, conservative unknown historical data, mixed versions and migration/backfill preserve previous authority and timing history; legacy due fields are not broadly reinterpreted.                                                                                                                                                                                                    |
| Q09-P26 | Staff can explain actual receipt, applicable target and correction history through durable authorized evidence, diagnose uncertain outcomes and reach the real accountable help owner without raw database repair.                                                                                                                                                                                   |
| Q09-P27 | Feature disable, rollback, restore and roll-forward preserve receipt/lineage and current adverse authority; no stale deadline job reopens/auto-completes work or deletes received evidence.                                                                                                                                                                                                          |
| Q09-P28 | Representative recipient/staff sessions distinguish requested date, hard limit, receipt and acceptance; complete ordinary late work and recover uncertainty without needless staff intervention. Report sample and limitations, not invented satisfaction gains.                                                                                                                                     |

Fresh evidence this turn: **6 existing tests passed in 2 files**, Vitest 5.0.3,
Node 24.21.0, duration 2.09 seconds; no tests filtered out. The four
`use-tasks-request-order` cases verify stale-response handling, and the two
`use-tasks-fetch-lifecycle` cases verify network/HTTP error states. External
fetch/auth are mocked. These do not test native receipt, timing, RLS,
concurrency, provider serving or real browser/AT behavior.

The first attempt invoked Vitest directly through Bun and failed jsdom worker
setup before any tests ran. Rerunning through the repository's Node-backed
`bunx --no-install vitest` invocation passed. No runtime/config/dependency
change was needed. The existing Vite future-config-loader warning remains
unrelated to this selected decision.

## Synthesis and sequencing

1. **Before recording a final answer:** adopt the refined meaning, exact
   original receipt/target history, actual outstanding-work distinction,
   separate authority and target-only failure treatment. These are required
   corrections to A, not optional enhancements. Conrad subsequently ratified
   the complete amendment package; the founder record below preserves that act.
2. **Capture in the authorized spec/design:** bind exact source capabilities,
   receipt/currentness model, obligation/date applicability, database paths,
   owner recovery and UX. Resolve the initial finite active-access policy and
   compatible target interpretation before activation. Q08 fresh timing and
   repetition remain separate open product decisions.
3. **Require in implementation:** one source mutation/receipt boundary,
   immutable evidence, current authorization after waits, exact Q03 fencing,
   semantic retry/recovery, bounded private custody and shared projections.
   Reuse existing machinery; do not add a generalized deadline engine.
4. **Qualify before rollout:** P01–P28 across real roles, concurrent commands,
   failure injection, mixed versions and actual recipient/staff journeys.
   Test representative long names, translations, small screens and constrained
   connections. The users need not understand the architecture to finish work.
5. **Activate narrowly and monitor residuals:** only after required safeguards
   pass. Monitoring below is not a substitute for authorization, invariant or
   recovery correctness. Each enabled source has an accountable owner and
   explicit operational budgets before activation.

Formal canonical PRD/OpenSpec integration awaits `/to-prd`; issue publication
awaits `/to-issues`. Q09's answer and future proof must keep stable references
through glossary, feature ADR, canonical requirement, generated view, design,
task/ticket, implementation and release evidence. Historical notes remain dated
provenance; none becomes activation evidence by being polished or comprehensive.

## Residual operational controls

Thresholds below are proposed correctness triggers, not measured incidence.
Budgeted controls require a concrete numeric source budget before activation;
no “monitor later” waiver is allowed.

| Signal                                                            | Threshold                                                                                       | Owner                                                  | Response                                                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Unauthorized admission or protected disclosure                    | Any confirmed occurrence                                                                        | Source authorization owner + platform security on-call | Stop affected path/cohort, contain access, preserve evidence and investigate scope.            |
| False recipient-overdue or historical receipt/target drift        | Any reproducible occurrence                                                                     | Private document request owner                         | Correct projection through governed repair, preserve original facts, regression-test the case. |
| Duplicate receipt, superseded acceptance or sibling corruption    | Any invariant violation                                                                         | Source mutation owner                                  | Suspend affected mutation, reconcile exact history and repair before re-enabling.              |
| Unknown admission outcome remains unresolved                      | Any operation exceeds its declared numeric reconciliation bound                                 | Custody/source operations owner                        | Reconcile same effect; escalate owned recovery, prevent speculative cleanup/resubmission.      |
| Cleanup proposes a received/referenced original                   | Any occurrence                                                                                  | Custody owner                                          | Block cleanup, protect referenced bytes, investigate classification and restore if needed.     |
| Stale source action dispatched from timing projection             | Any confirmed unauthorized/stale effect                                                         | Workflow/communication owner                           | Stop relevant dispatch, apply owner recovery and repair source recheck/cancellation.           |
| Query/lock/byte/retry budget breach                               | Any declared source budget exceeded in qualification; production alert at that configured limit | API/storage operations owner                           | Block rollout or bound affected lane, diagnose hot scope and preserve valid recovery.          |
| Recipient/staff cannot distinguish receipt, review and due action | Any critical task failure in qualification; reproducible production report                      | Product/accessibility owner                            | Fix copy/state/interaction and re-test affected paths before wider release.                    |

## Recorded outcome and remaining proof

Q09 A and its complete required amendment package are ratified by Conrad,
2026-10-20. The reviewed disposition was **Accept with required amendments**;
the exact corrected decision, Q09-C01–C22, Q09-P01–P28, reviewed lifecycle/UX
and all eight operational controls are adopted grooming intent. A new
active-access lifetime, date-edit permission, mandatory-date policy, grace
period, notification, fresh-access setting, implementation or Q10 choice is
not inferred.

## Founder ratification — 2026-10-20

Conrad instructed: “Yes, ratify Q09 A with the required amendments. Record it
and move to the next question in this Phase 29 grill-with-docs session, with
the research, practical options, and your recommendation.”

This adopts the exact corrected decision, Q09-C01–C22, Q09-P01–P28,
reviewed lifecycle/UX and all eight operational controls. Recording changes
status and trace; the substantive decision, requirements, proof and controls
are preserved. No active-access duration, new date-edit capability, mandatory
date, grace, reminder, fresh-access setting or formal publication is inferred.
