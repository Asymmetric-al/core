# Phase 28 D29 — explicitly additional gifts and personal follow-up

**Disposition: Accept with required amendments.**

**Status: the corrected decision and required amendments were explicitly
ratified on October 18, 2026 UTC.** Originally reviewed **October 17, 2026, Asia/Bangkok** against
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and the current working tree.
The founder also selected authorized staff and missionaries when the organization
permits confirmation. D28 remains ratified. This
is a research/grill review under the [founder's boundary](phase28-founder-brief.md:21),
not a formal PRD, ADR, OpenSpec change, implementation or release qualification.
The initial review posed no Q30; the subsequent ratification and continuation
are recorded below.

## Exact corrected decision to record

> **D29 — Include explicitly additional gifts.** A source-qualified received
> monetary gift qualifies for personal follow-up when the donor has explicitly
> identified the relevant gift or precisely identified portion as additional
> support, even without a named appeal or specific one-time need.
>
> Confirming this purpose records an attributable donor statement for stewardship.
> It does not certify a mathematical amount above a commitment, change the
> accepted financial designation, apply money, issue a receipt or prove contact
> permission. A one-time payment, missing pledge, larger amount, generic note,
> imported label or arbitrary “special” checkbox is insufficient.
>
> A currently authorized recorder confirms the exact purpose once in the
> permitted gift context. The ordinary path uses one short, deliberate save,
> with no routine second approver, mandatory narrative, new donor checkout
> question or invented appeal. The source preserves the statement's origin,
> exact scope, recording actor and correction history without exposing private
> correspondence in the task.
>
> Maya sees **“Donor-stated additional support”** as a factual reason in the
> existing compatible follow-up. Each gift remains individually inspectable
> under current permissions; D20's reviewed-group handling and permanent
> coverage remain authoritative. Multiple reasons, recorders or retries do not
> create duplicate work. Sending and recording an actual interaction remain
> separate deliberate actions.
>
> A first valid confirmation after receipt may qualify the same still-unhandled
> gift from the source-qualified live cohort. Its actual gift date is preserved.
> Imported history, a new criterion, reclassification or confirmation of an old
> handled gift cannot generate fresh automatic work. Source corrections withdraw
> only invalid reasons and preserve completed human history and independent work.

**Selected actor clarification:** the founder explicitly chose **“Authorized
staff and missionaries when the organization permits it.”** Ordinary task editing,
gift visibility, authorship, staff status or missionary assignment is not that
permission. C03 preserves the selected actor class with the now-ratified exact
action/scope safeguards. The clarification selected who may be authorized; the
subsequent explicit ratification accepts all required amendments without
establishing a deployed grant. The earlier [clarification record](d29-evidence/actor-clarification.md)
retains its original point-in-time status.

The chosen A settles this sufficient additional-purpose case. It does not settle
every other native special-gift criterion reserved by D21-C03. In particular,
specific one-time-need criteria and mathematical above-commitment qualification
retain their separate owner rules. No universal monetary minimum is introduced.

## Evidence, current behavior and permanent direction

| Evidence class                | Finding and limit                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder fact                  | A includes properly recorded and confirmed additional gifts, with a factual reason in Maya's existing task and excellent understandable UX. The subsequent clarification permits authorized staff and missionaries when the organization permits confirmation.                                                                                                                                                             |
| Governing intent              | D19–D22, P28's [owner constraints](../../../prds/program-roadmap/owner-constraints.md:57), [ADR-0183](../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622), and P13/P14/P16 require exact purpose, money, recognition and task boundaries. Native work cannot be replaced by optional workflows or permanent manual chores.                                                                      |
| Explicit owner reconciliation | [ADR-0206](../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md) prohibits a mutable special-purpose column on any posted financial row. P28 operational purpose belongs in a separate source-owned record. P12 owns the action and disclosure contract; P9's shared task owner owns handling.                                                                                                |
| Current static code           | The manual task POST fixes `is_auto_generated: false`; generic task patch/delete and completion UI do not establish D20 reviewed coverage. The staged-gift mutation path has independently committed steps and replaceable allocation IDs. These are concrete reuse hazards, not proof that deployed D29 exists or that an exploit was executed. See [database/source review](d29-evidence/database-and-authorization.md). |
| Primary external evidence     | TntConnect exposes the limits of amount/status heuristics; MPDX documents exact processed-gift attribution; contemporary CRM task documentation separates acknowledgement, tasks and communications. Accessible forms/status guidance supports explicit labels, restrained disclosure and recoverable saves. Dates, retrieval outcomes and limits are in [UX research](d29-evidence/ux-and-primary-research.md).           |
| Reasoned product judgment     | A single scoped confirmation, a plain reason and existing grouped follow-up are simpler than a new classification dashboard, appeal detour or approval queue. This has not been measured with Core missionaries.                                                                                                                                                                                                           |
| Remaining proof               | Actual P28/P12/P13/P14/P16/task integration, database grants/RLS, correction races, retained-data migration, accessibility and representative field usability remain required. A document, source search or synthetic model does not establish these outcomes.                                                                                                                                                             |

The detailed [governance review](d29-evidence/governance-and-ownership.md),
[financial review](d29-evidence/financial-purpose-and-lifecycle.md),
[database review](d29-evidence/database-and-authorization.md) and
[UX review](d29-evidence/ux-and-primary-research.md) distinguish existing contracts,
review recommendations subsequently ratified here, current code and unavailable evidence. No competitor supplies
Core's permission, financial or retention policy.

**Strongest alternative:** scope automatic special-purpose work to an identified
one-time need, leaving general additional gifts to other independently qualified
reasons or manual follow-up. It reduces the initial evidence paths and potential
task volume. It misses donor-stated additional support that the founder expressly
selected. Manual Add is useful for a particular uncertain gift, but it cannot be
the permanent implementation of A. The permanent answer is a narrow affirmative
purpose contract, not an inference engine or a general financial editing power.

## Whole user journey and UI

**The donor's journey stays familiar.** This decision adds no checkout field,
extra receipt, required explanation or automatic thank-you. Existing lawful
giving instructions retain their owners. A donor's direct statement may be
recorded later through a qualified human path; absence of a statement is not a
negative judgment about the gift or person.

**Record from the exact gift.** An eligible recorder opens a source-qualified
received gift or its exact operational context. The compact form shows the
permitted donor/attribution, ministry, received date, ISO-labelled currency and
relevant amount. It explains: **“Record the donor's stated purpose. This may add
personal follow-up. It does not change the gift or its commitment application.”**
Use **Record additional support** for the contextual action. Its short review
asks the recorder to affirm the donor-stated purpose; avoid an unexplained
**Mark special** checkbox.

Reuse an already qualified donor-instruction reference where one exists. For a
direct human communication, record the donor/authorized representative, method
and occurrence time with its supported precision, plus the trusted recorder's
affirmation. Existing valid source facts are prefilled rather than re-entered.
Do not require a transcript, screenshot, attachment, shared interaction log or
personal narrative. These minimal records attest what was communicated; they
do not claim that software independently verified the donor's intention.

The normal scope is the displayed eligible gift allocation. Offer **Part of this
gift** only when needed, with the currency fixed by that source and exact amount
validation. If the relevant portion is uncertain, preserve the unconfirmed input
without admitting a reason; ordinary eligible manual follow-up remains available.
Do not expose other ministries' amounts to help Maya complete this form.

**One save with a truthful result.** Current authority, exact scope, source
revisions and purpose evidence are checked at acceptance. A durable acceptance
can truthfully say **“Purpose recorded.”** Add **“Follow-up is being updated”**
only when the accepted result identifies admitted work whose projection is still
pending. If the compatible task already exists, show **Open follow-up** when
authorized. Neither historical-only nor already-handled work implies a pending
task. A lost
response recovers the same outcome; it must not request duplicate confirmation.
If authority changed, preserve only still-authorized draft fields and explain
the current available action without exposing restricted evidence.

**Maya's daily queue stays calm.** Reuse the existing task list and D20 detail.
Show the supporter when permitted, action, due information and one concise
factual reason. In detail, show each authorized gift's date/currency/amount and
reasons. For a partial-purpose gift, distinguish its full permitted gift amount
from the confirmed additional portion; never label the whole amount additional.
Separate currency totals. Do not turn an “Auto” badge or generic checkbox into
proof that exact gift coverage was reviewed.

**Handle once; preserve independent facts.** Use D20's reviewed-set Done/Not
needed actions. New unreviewed gifts remain in the current compatible task.
Opening a message, recording the purpose and completing a task do not record a
conversation or send mail. If qualified purpose evidence changes, update only
that reason; a surviving amount reason or independent promise remains. Historical
completion stays truthful. No routine report of why Maya chose Not needed is added.

**Corrections remain contextual.** An authorized user can correct or withdraw an
incorrect purpose through the source's existing detail/action pattern. Show the
permitted consequence before a consequential correction, preserve source history
and refresh stale reviewed scope. Do not expose a donor's private message body
merely because someone can see the follow-up. Don't show a persistent alarm on
every gift lacking purpose evidence or create a compulsory purpose-review inbox.

**Accessible, international and usable in the field.** Preserve exact Core
`base-maia`, Base UI and semantic tokens. Use a short single-column form, persistent
labels, text statuses, keyboard/focus support, clear field errors, reflow and
status announcements. Locale affects display, not currency identity or arithmetic.
Support long names, RTL and date/time precision without requiring a Western name
split. Slow networks preserve permitted input and show saved only after durable
acceptance. No offline command is silently replayed with new scope. Automated
accessibility checks must be supplemented with actual keyboard/screen-reader and
phone tests; a polished mock is not that evidence.

## Exact required amendments

These future requirements preserve A and were explicitly ratified on October 18,
2026 UTC. C03 incorporates the separately selected actor clarification. Ratification
does not establish implementation, source qualification or an active permission.

### D29-C01 — A narrowly defined additional-purpose qualifier

P28 SHALL admit this special-gift follow-up reason only from the conjunction of
qualified effective received monetary support and an accepted, current,
donor-stated additional-support purpose for its exact eligible scope. The purpose
may be general additional support; no specific one-time need or appeal is required.
No amount minimum, history comparison, non-recurring payment rule, absence of a
commitment, donor value label or optional Workflow Studio prerequisite follows.
When the exact qualified live-source, donor-purpose, current eligibility and
scope conditions hold, P28 SHALL admit the reason through the durable D20 path;
no optional workflow or extra manual Add step is required.

### D29-C02 — Attributable evidence, not a magic label

The qualified producer SHALL support a closed evidence contract: an eligible
existing donor-instruction fact or an authorized recorder's direct attestation
of the donor/authorized representative's explicit communication. It SHALL bind
the communicating Party/standing, method and occurrence precision, exact source
scope, trusted recorder and recording time, evidence origin and relevant revisions.
Reusing a financial instruction requires a separately qualified permitted purpose
projection; it does not borrow financial application authority.

A generic memo, arbitrary flag, import column, third-party hearsay, source ID or
model classification SHALL NOT suffice. No protected care/private note may be
copied, summarized or relabeled into eligible evidence. The accepted minimal
attestation records a human assertion; it SHALL NOT claim independent verification
of truth or require a duplicate shared interaction. Conflicting authoritative
instructions for the same scope require owner resolution, not optimistic admission.

A permitted recorder MAY create a minimal newly authored attestation from a
donor communication they actually received or directly reviewed through an
authorized source. Its channel alone does not disqualify it. This grants no right
to copy the body, disclose protected contents or relabel existing protected
CRM/care history. The new fact needs its own qualified purpose and audience.

### D29-C03 — Exact confirmation authority; no approval queue

**Selected actor class, with required authorization safeguards:** authorized staff and
missionaries MAY confirm/correct this purpose when the organization grants the
exact currently qualified P12 action and source/subject scope. It SHALL be
separate from task editing, gift viewing, interaction authorship, financial
posting/correction/application and raw evidence access. Missing action mapping
denies the command. A coach, donor account, service role or workflow does not
inherit human confirmation power by role name.

One authorized deliberate save MAY both record and confirm the statement; no
routine second approver or per-gift supervisory queue is introduced. Any actual
projection-policy widening still follows its governing approval contract. Role
configuration SHALL use P12's existing registry/policy controls, not a new local
boolean or broad administrator bypass. The selected actor class is not a blanket
missionary/staff grant and does not itself qualify a new action mapping or runtime.

### D29-C04 — Exact contribution, subject and follow-up Party

Qualification SHALL bind current Tenant, Legal Entity, canonical business
contribution, relevant source allocation/support scope, typed ministry/project,
qualified follow-up Party, source provenance and current responsibility. P13/P14
must prove actual received support and permitted attribution. Recognition is not
new money, legal-donor identity or permission to contact every household member.
Anonymous, church, organizational, DAF and matching-gift cases require their exact
qualified route; a statement from an unrelated person cannot replace donor or
representative standing. Unqualified lanes remain unavailable without blocking
unrelated qualified gifts, posting or receipting.

### D29-C05 — Whole and partial purpose without a shadow ledger

A whole-scope purpose MAY reference the exact qualified source scope. A partial
purpose SHALL name an exact positive amount resolved from the donor's explicit
portion instruction under the source's currency/precision rules, bound to its
referenced source revision. Preserve that instruction; an exactly representable
“half this gift” can qualify without adding a percentage editor. Validate before
any rounding/coercion; reject ambiguous or indivisible portions, unsupported
fractional units, overflow, cross-currency values and amounts above that
referenced qualified source scope. Do not infer a portion by subtracting a commitment,
fees, previous gifts or another ministry's allocation.

The portion is purpose evidence, not a new financial allocation or balance.
P13/P14 own effective surviving money/recognition after correction. Preserve the
original statement and amount; current qualifying surviving support is separate.
An identified reversal can reduce the qualified surviving additional portion
without overwriting or falsifying that original assertion. A wholly additional
scope can remain qualified when its owner proves positive eligible surviving
support. For mixed ordinary/additional scope, if a partial reversal cannot identify
the affected portion, the affected reason becomes uncertain until source-qualified
resolution; never silently prorate or assume the additional portion survived.
Display original versus current amounts distinctly when correction makes that
distinction material. Physical staging allocation IDs are not assumed
stable; use qualified canonical lineage. Multiple portions/evidence records cannot
multiply D20's single gift-purpose member.

### D29-C06 — Preserve financial and other-purpose truth

No confirmation, correction, completion, import or privileged repair SHALL update
any posted financial column, create/reverse money, change a designation or legal
restriction, apply a commitment or alter a receipt. ADR-0206 requires separate
P28 operational records. P13/P14/P16 remain authoritative for their facts.
“Additional” here is donor-stated stewardship purpose, not mathematical excess.
A separately promised additional gift may legitimately fulfill a commitment;
mere application is not proof against its purpose. A conflicting authoritative
ordinary/catch-up/advance instruction for the same portion cannot be overridden
by this command. Required financial correction uses its owner; C-01 and E7 are
not settled by D29. Independent first/amount/fulfillment/recurring purposes remain.

### D29-C07 — Live provenance and confirmation timing

Activation SHALL define the exact qualified live source cohort prospectively.
Evidence may precede receipt, but no gift-purpose task qualifies before actual
eligible received support. The first valid purpose confirmation after receipt
MAY admit the same originally-live, still-unhandled eligible gift; keep financial,
communication-occurrence, recording, admission and task times distinct.

Historical imports, pre-activation history, new criteria, relabeling and transport
timestamps SHALL NOT manufacture live provenance or restart coverage. Originally
live delayed delivery and owner-qualified repair remain eligible through their
durable lineage. Unknown origin requires restricted owner resolution, not a guess.
No arbitrary new rolling date window or daily task sweep is introduced.

This explicitly narrows D20's reclassification prohibition for D29: a first
qualified purpose affirmation for a gift already in the recorded prospective
live cohort is delayed qualification of that same unconsumed gift-purpose, not
historical-only reclassification. The durable originally-live received-support
occurrence must belong to D29's prospective activation cohort. Every preactivation
receipt is excluded from new D29 admission, including gifts originally live under
an older system. Trusted source admission/provenance establishes membership; a
backdated gift date or later confirmation/import timestamp cannot create it. The
activation/receipt race requires durable owner ordering, not worker delivery order.

### D29-C08 — Correction and valid current states

Unconfirmed input is inert. An accepted affirmation, current qualification,
task materialization and human handling are separate facts, not one editable
status. Valid purpose correction/withdrawal SHALL preserve original evidence and
supersession, then requalify only affected reasons. No surviving reason or independent
obligation may be discarded. A restored still-unconsumed originally-live purpose
uses the same identity; completed coverage never replays merely because the reason
was corrected or re-entered. Unknown/review-required is neither confirmed nor false.
Ended recorder membership does not by itself falsify a statement validly accepted
earlier; later use still rechecks current source and consumer authority.

### D29-C09 — One business effect across reasons and retries

Use D20's canonical contribution/Party/typed-subject/special-purpose member and
compatible current task. Donor assertions, confirming actors, evidence versions,
reason codes, allocation rows, import IDs and request keys SHALL NOT create new
members for the same effect. Distinct equal-date/equal-amount gifts remain distinct.
Same operation/same payload recovers its accepted result; changed payload conflicts.
Different transports still deduplicate the durable business effect. Merges and
aliases use owner-qualified reconciliation, never name/email matching.

### D29-C10 — Existing task grouping and reviewed handling

D20's exact compatibility, one-current task, reviewed member/revision set,
residual work, current responsibility, Done/Not needed and conditional correction
contracts SHALL govern. A new reason for an already-handled member SHALL NOT
reopen it. A new unhandled gift may join the compatible pending task or create
the next one. Required distinct first/fulfillment work is not automatically the
same action; shared coverage requires the owning contract's proof. Generic manual
Done, title matching or opening a source link cannot consume native coverage.

### D29-C11 — Atomic acceptance and consequential race boundaries

The authoritative command SHALL atomically accept purpose state/revision,
required business/security evidence, durable receipt and identifier-only
projection intent. Required local failure rolls back all of them. Independent
financial posting never waits for this human task. Async task materialization
rechecks current qualification and handles missed delivery through durable intent.

Source correction, permission revocation, purpose correction, competing confirmation
and task handling SHALL have a qualified serialization order at their actual
acceptance boundaries. Reprove facts after waits; a preflight digest or queue
lease is insufficient. Check time-bounded authority against current time after
lock waits at final acceptance, not transaction-start time. A purpose write
committed before revocation remains
history, not authority for later disclosure. Stale materializers must not revive
withdrawn reasons or consume newly unreviewed gifts. No network call belongs in
the database acceptance transaction.

### D29-C12 — Database constraints and RLS backstops

The eventual Supabase/Postgres design SHALL enforce trusted non-null scope,
tenant-aware source/revision/receipt/outbox relations, immutable original
attribution, legal state combinations and scoped semantic uniqueness. A direct
update cannot retarget an accepted record to another readable donor, gift, entity,
subject or actor. Qualified correction appends attributable evidence rather than
rewriting origin. Deletion of a user or source relationship cannot cascade into
independent financial history or silently erase handled-work evidence.

Inspect effective schema/table/column grants, coarse Tenant RLS, SELECT/INSERT/
UPDATE/DELETE privileges, old-row USING and proposed-row WITH CHECK, policy
combination, views, RPC ownership/EXECUTE ACLs/search paths, Realtime, Storage if
actually used, and privileged paths together. PostgreSQL's omitted WITH CHECK
inheritance must be understood; omission alone is not a proved vulnerability.
RLS is neither a replacement for P12 nor a service-role guard. No second SQL
fine-grained permission engine or new attachment store is selected.

### D29-C13 — One trusted server mutation boundary

Business mutations SHALL live in `packages/api`, with thin app handlers. Tenant,
recording actor, attribution, authority and audit time derive from trusted current
context; supplied IDs are candidates to resolve, never authority. Strict schemas
and exact expected revisions SHALL prevent broad patching of purpose, original
scope, current reason or handled state. Imports, repair, tasks and optional
workflows must use the same qualified boundary. Browser collections cannot
directly insert confirmed purpose/automatic membership or bypass source checks.

### D29-C14 — Minimum disclosure and same authorization everywhere

Apply current source/P12 projection before list, search, count, join, history,
result recovery, cache, notification, export or serialization. Task access grants
no evidence-body, cross-ministry or financial access. Purpose confirmation and
evidence-body reading remain separate rights. Display only the permitted fact
and necessary scope; raw correspondence, care/location information, private notes
and inaccessible-record counts SHALL not leak through reasons or diagnostics.
Context changes must clear unsafe client state and reject late responses even
when request cancellation fails. No new coach summary, AI egress or export follows.
Revocation governs subsequent release at the owner's final authorized disclosure
boundary; bytes already released while authorized cannot be recalled.

### D29-C15 — Short contextual confirmation

Use the single gift-context flow above and Core's exact shared design system.
Show the eligible gift/scope, plain meaning, evidence basis and optional partial
portion only when needed. One deliberate save is enough for a qualified recorder;
no compulsory shared log, free-text report, attachment, second approval, new
appeal or donor checkout question. Unavailable authority must not invite repeated
failed saves or imply the user can obtain permission by editing a task.

### D29-C16 — Factual task reason and honest actions

Use a clear reason such as **“Donor-stated additional support”**, not a donor
rating, “above commitment” or generic Auto badge alone. Keep dates, ISO currencies,
whole-gift versus confirmed-portion amounts and each gift's handling evidence
distinguishable. Use D20 review actions for dynamic groups. Preserve list position,
focus, mobile reflow, localized display, keyboard access and status feedback.
Opening, confirming, completing, communicating and recording an interaction remain
separate facts. No outward message or new notification policy is selected.

### D29-C17 — Truthful failures and repair

Source accepted/task pending, rejected, stale, ambiguous response and no-current-
access outcomes SHALL be distinguishable without disclosing protected facts.
Recover a lost response using the same operation and current disclosure rights;
do not create another task, confirmation or financial correction. Accepted source
truth survives a failed refresh. Failed projection intents remain replayable and
owned; repair uses scoped source commands rather than direct SQL or bulk reflagging.
Unrelated qualified manual follow-up and financial operations remain available.

### D29-C18 — Retention and evidence integrity

Qualify separate schedules for minimal purpose assertions, supporting references/
bodies, correction/coverage receipts, security evidence, actual derivatives and
backups before activation. Append-only does not mean lawful retention forever.
D28's departure timer for unshared preparation does not govern this source.
Source restrictions, privacy deletion and applicable holds must be reconciled
without exposing restricted bodies or erasing independent money truth.

Deletion of a raw message need not invalidate a lawfully retained independent
minimal attestation if the source contract still proves its validity. Where it
does not, the reason must become unavailable/requalify, never fabricate evidence.
Restore/rollback cannot resurrect withdrawn purpose, expired access or handled
automatic work. No universal legal duration or permanent transcript archive is chosen.

### D29-C19 — Bounded work and measured capacity

Use exact scoped source/subject/current-purpose lookups, semantic uniqueness and
indexed pending intents; paginate permitted evidence/history. Do not scan all
giving history to decide a donor-stated purpose or grow work per evidence revision.
Measure joins, RLS costs, locks, correction fan-out, task membership and dominant-
tenant behavior against a declared deployment profile. Define numerical query,
payload, batch, retry, lock and backlog budgets before activation. Do not invent
throughput claims or silently drop authoritative gifts to meet a UI cap.

### D29-C20 — Durable business history and safe observability

Retain attributable confirmation/correction/admission/withdrawal and exact handled
coverage evidence under qualified schedules. Keep technical traces separate:
safe correlation IDs, outcome/reason codes, source revision and pending age, not
donor prose or sensitive names. Security records preserve P12-required actor and
authority evidence. No compulsory activity logging or new audit event for every
ordinary view is introduced. A task label alone cannot explain who confirmed
what or allow safe correction.

### D29-C21 — Dependencies and source disagreement

No new CRM, AI model, provider connector, workflow engine or message transport is
required. Optional integrations can supply only qualified owner facts, not a
generic metadata flag that confirms purpose. P13/P14/P16/P9/P12 and the shared
task contract retain their exact responsibilities. Missing/delayed/contradictory
facts block only the affected reason. An attempted eligible confirmation or an
already accepted/admitted effect whose required dependency becomes unavailable
has an owned bounded repair state. Ordinary absence of a donor statement creates
no repair task, compulsory review or negative classification. Missing facts do
not erase another valid reason or turn unknown into no support.

### D29-C22 — Safe rollout and legacy reconciliation

Inventory reached source writers, browser hooks, API/service paths, stored tasks,
evidence and physical allocation identities before activation. Do not extend a
non-atomic staging patch or unrestricted generic task delete into this contract.
Install compatible readers/permissions/constraints before enabling qualified
writes; use an explicitly recorded prospective live cohort. Legacy labels and
historical imports are not backfilled as new confirmations or new live gifts.

Preserve existing IDs, lawful origin, completed effects and independent obligations.
Where an actual unsafe legacy reason is reached, reconcile through its owner,
not by silently marking the task done. The admission kill switch stops new effects
while corrections, revocation and existing accepted obligations remain serviced.
Rollback must not re-enable a legacy writer that violates the new contract;
prefer safe roll-forward once new authoritative evidence exists.

### D29-C23 — Traceability and adversarial proof

Trace A, any actor clarification and these clauses through the glossary, later
authorized owner amendments, OpenSpec, tasks/tickets, implementation and release
evidence. Preserve original research and prior results. The proof matrix below
is outcome-based; successful mock or finite-model cases do not qualify actual
authorization, money, source timing, provider state or accessibility. Missing
source proof is an explicit release gate, not a claim that the task is done.

### D29-C24 — Proportionate user validation

Before release, test authorized missionary/staff recording, no-permission use,
mixed ordinary/additional gifts, late confirmation, grouped handling, correction,
unknown save and revoked access on phone and desktop. Users must distinguish
purpose confirmation from money editing, task completion and sending. Any critical
misunderstanding of scope, privacy or financial effect blocks release. Derive
ordinary task-success/time/network budgets from representative journeys rather
than inventing measurements. Optional feedback never captures private donor text.

## Lifecycle and invariants

| Fact/state                                              | Valid next effect                                                                                   | Forbidden shortcut                                                                                 |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Unconfirmed input or incomplete evidence                | Correct or cancel without an admitted reason; confirm only with current complete authority/evidence | Persist a checked box as confirmed or fabricate missing money/Party                                |
| Purpose known before receipt                            | Retain only through an eligible existing source; qualify when actual received support exists        | Create receipt, financial application or gift follow-up from a promise                             |
| Originally-live received gift without qualified purpose | Ordinary display/manual work; later first valid purpose affirmation may qualify                     | Treat silence as false, use date/amount inference or auto-contact donor                            |
| Accepted qualified purpose                              | Durable admission intent; recover the same outcome; authorized correction                           | Rewrite financial rows, create one task per statement or require finance rollback for task failure |
| Source/purpose becomes uncertain or invalid             | Requalify/withdraw affected reason; preserve surviving work and history                             | Guess surviving portion, discard all task reasons or call uncertainty completion                   |
| Still-unconsumed valid correction/restoration           | Reuse exact original member and current compatible task                                             | New member keyed by revision or unconditional re-open                                              |
| Covered gift-purpose                                    | Preserve handling and later factual corrections                                                     | Re-entered purpose, another recorder, import or policy update replays work                         |
| Expired disclosure or deleted/restricted evidence       | Enforce qualified retention/current-access rules; maintain only lawful minimal history              | Retention grants access, deleting a body fabricates a new confirmation, restore revives effects    |

There is at most one current compatible special-gift task and one member for the
same business contribution/Party/subject/purpose effect. Amount and purpose
reasons may coexist without multiplying that member. No purpose transition changes
money, consent, legal restrictions, an actual interaction or a send outcome.

## Consolidated material findings

Likelihood is a reasoned engineering judgment without the safeguards, not a
measured incident rate. Each remedy below is exact through the cited clauses and
proof cases; the category matrix independently records all requested categories.

| ID  | What could go wrong and why it matters                                                                                                                                                | Severity / likelihood                         | Evidence and effect on A                                                                                                                  | Permanent fix and exact change                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 | “Confirmed” is implemented as a caller-supplied flag, inferred memo or unspecified actor approval. Untrusted users can create apparently authoritative work.                          | High / likely with vague wording              | Q29 reserved evidence/actors; P12 and D21 require exact actions and source facts. **Narrows and specifies A.**                            | Typed attributable affirmation, exact permission and one authorized save. **C02–C03, C13; P02–P05.**                                         |
| F02 | Additional purpose is confused with excess, a changed designation or fulfillment. Money and donor intent become inconsistent.                                                         | Critical / plausible                          | P13/P16 and ADR-0206 preserve separate immutable financial facts; purpose and application have distinct meanings. **Narrows meaning.**    | Separate P28 operational fact; conflict resolution through owners; no posted-row update. **C01, C04–C06; P06–P10.**                          |
| F03 | Current generic task/staging writers are reused as if they implement this contract. Partial writes, mutable allocation IDs or generic delete/completion bypass evidence and coverage. | High / plausible                              | Fresh static code paths in the database review, not an exercised production exploit. **Changes implementation path.**                     | Qualified canonical lineage and atomic source command; inventory/fence reached old writers and readers. **C11–C13, C22; P14, P17, P27.**     |
| F04 | A mixed gift is labelled wholly additional, rounded, converted or guessed after a refund. Maya follows up for the wrong facts.                                                        | High / plausible                              | Exact P13 money and D20 gift grain; ambiguous partial corrections are realistic. **Adds required scope precision.**                       | Whole-scope reference or exact stated portion, source-owned surviving money, uncertainty on unallocated reversal. **C04–C06, C08; P07–P10.** |
| F05 | Late legitimate confirmation is forbidden, or any new label creates tasks from old history. The feature either misses its job or floods queues.                                       | High / plausible                              | D20 delayed originally-live work versus historical acquisition; D22 timing cannot be copied blindly. **Refines temporal behavior.**       | Prospective source cohort, distinct timestamps, later first valid confirmation and no retrospective replay. **C07–C09; P11–P13.**            |
| F06 | Multiple statements, actors, portions or reasons generate duplicate members/tasks; completed gifts recur.                                                                             | High / likely without durable identity        | D20 semantic membership and completion; transport idempotency alone is insufficient. **Preserves existing grain.**                        | Same business member, independent reasons, exact coverage and replay-safe intent. **C09–C11; P12–P16.**                                      |
| F07 | Concurrent correction, revoke, save or completion accepts a stale fact or hides unreviewed work.                                                                                      | Critical / plausible                          | Source boundaries and asynchronous task materialization require actual ordering. **Adds acceptance safeguards.**                          | Current authorization/source fences, expected revisions and exact reviewed set; test both serialized outcomes. **C08–C13; P15–P18.**         |
| F08 | Staff, coach, donor or another tenant gains body/financial access through a reason, count, cache or privileged path.                                                                  | Critical / plausible                          | P12/P27 minimal audience and D20 projection obligations; same Party is not shared authority. **Narrows disclosure.**                      | Tenant-aware references, action/read separation and current projection on every egress. **C03–C04, C12–C14; P03–P05, P19–P20.**              |
| F09 | DAF/advisor, church, household or matching attribution is treated as donor standing or multiplied across people.                                                                      | High / plausible                              | P14 recognition differs from legal donor/money and contact authority. **Bounds supported lanes.**                                         | Exact source-qualified confirming standing and follow-up Party; no fan-out, inference or anonymity leak. **C04, C14; P06, P19.**             |
| F10 | A second approval queue, transcript requirement or donor checkout prompt adds friction and sensitive data without improving the selected job.                                         | Medium / likely with overbroad “verification” | D21 prohibits routine per-gift approval; P27 distinguishes ordinary source contribution from policy widening. **Simplifies solution.**    | One short authorized confirmation, existing references and minimal assertion fields. **C02–C03, C15–C16; P21–P23.**                          |
| F11 | “Auto,” “confirmed” or a generic completion checkbox overstates certainty or consumes unseen gifts.                                                                                   | High / plausible                              | Existing UI is not D20 coverage; UX primary evidence separates task/acknowledgement/message states. **Changes UI semantics.**             | Plain reason, exact permitted scope, truthful saved/pending status and D20 reviewed handling. **C10, C15–C17; P16, P21–P24.**                |
| F12 | A lost response, failed audit/outbox or projection outage causes duplicate confirmation, missing work or false failure.                                                               | High / plausible                              | Existing independent write sequences and distributed secondary effects. **Adds durable recovery.**                                        | Atomic authoritative acceptance and same-operation current-rights recovery; source-owned pending repair. **C11, C17, C20; P14–P18, P25.**    |
| F13 | Raw evidence is retained forever, removed without validity rules or restored into unauthorized use.                                                                                   | High / plausible                              | Source retention differs from D28 preparation; append-only does not authorize perpetual bodies. **Adds lifecycle qualification.**         | Separate evidence schedules, lawful minimal attestation, restricted holds and restore fences. **C14, C18; P20, P26.**                        |
| F14 | High-volume revisions/corrections trigger history scans, duplicate joins or one-tenant queue starvation.                                                                              | Medium / plausible at growth                  | Exact source addressing avoids historical inference, but actual plans/workload remain unmeasured. **Bounds implementation.**              | Indexed exact lookups, one effect, bounded batches/pagination, declared measured budgets. **C09, C19–C20; P28–P29.**                         |
| F15 | A workflow/import/provider label bypasses qualification, or rollout converts legacy history into newly live work.                                                                     | High / plausible                              | P35 source binding is not qualified; historical data/projections are not source authority. **Narrows dependencies and migration.**        | One owner command, explicit live cohort, compatible rollout and safe roll-forward. **C07, C13, C21–C22; P11–P13, P27, P30.**                 |
| F16 | Selected intent and synthetic proof are reported as qualified UX or complete native special-gift coverage.                                                                            | High / plausible in a long spec session       | D21 reserves other criteria; founder's research boundary and document-authority distinguish statuses. **Bounds claims and traceability.** | Explicit actor status, complete clause/proof mapping and real release evidence; no invented interviews. **C23–C24; P31–P32.**                |

## Individual category review

| Category                                                          | Material concern?                                 | Independent evaluation and remedy                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity, and alternatives                  | **Yes**                                           | Explicit additional support is a coherent selected job; neither measured ministry demand nor every special criterion is established. Specific-need-only is simpler but excludes A; manual Add cannot replace native work. F01/F10/F16; C01–C03, C24.              |
| 2. Brittleness                                                    | **Yes**                                           | Flags, memo inference, staging IDs, actor labels and confirmation-at-posting assumptions break under source changes. F01/F03/F05; C02–C04, C07, C13.                                                                                                              |
| 3. Technical debt                                                 | **Yes**                                           | A second task store, mutable financial field or purpose logic copied into import/UI/worker paths duplicates authority. Existing generic paths are not a permanent producer. F02/F03/F15; C06, C11–C13, C21–C22.                                                   |
| 4. Edge cases                                                     | **Yes**                                           | Small additional gifts, mixed portions, partial refunds, representative statements, late confirmation, unknown origin and fulfilled promises need distinct outcomes. F04/F05/F09; C04–C08.                                                                        |
| 5. Footguns                                                       | **Yes**                                           | Mark-special buttons, broad patches, raw-body copying, retry-as-new and generic Done can misclassify, disclose or replay work. F01/F03/F06/F11; C02–C03, C09–C17.                                                                                                 |
| 6. Tenant safety                                                  | **Yes**                                           | Shared Parties, UUID-only relationships, caches and worker identities can mix tenant/entity/subject scopes. F08/F09; C04, C12–C14.                                                                                                                                |
| 7. Database, RLS, and authorization safety                        | **Yes**                                           | Constraints, old/new row checks, combined grants/policies, RPC/views and service-role paths must enforce the same boundary. Monetary evidence and origin require exact types and immutable scope. F01–F04/F07/F08; C05–C06, C11–C13.                              |
| 8. Overengineering                                                | **Yes**                                           | A classifier, rule builder, per-gift approval, transcript archive or new ledger solves a larger job and increases risk. No new vendor is necessary. F02/F10/F15; C01–C03, C15, C21.                                                                               |
| 9. UX/UI and user friction                                        | **Yes**                                           | One contextual save and factual task reason are required; moving gift groups, partial purpose, unknown results and inaccessible evidence make generic controls misleading. Mobile, accessibility and locale proof remain unperformed. F10/F11; C10, C15–C17, C24. |
| 10. Source of truth, ownership, and domain invariants             | **Yes**                                           | P28 purpose, P13 money, P14 attribution, P16 application and P9 handling are distinct. A joined read or human assertion cannot own another's truth. F02/F04/F06; C04–C06, C09–C13.                                                                                |
| 11. Hidden coupling                                               | **Yes**                                           | Sharing a task/source ID can wrongly couple purpose to receipt, fulfillment, communication, coaching or role access. F02/F08/F15; C06, C10, C14, C21.                                                                                                             |
| 12. Failure modes                                                 | **Yes**                                           | Accepted purpose with missing task, failed local audit, late response and provider/source disagreement need safe visible recovery. F07/F12; C11, C17, C20–C21.                                                                                                    |
| 13. Lifecycle, temporal correctness, concurrency, and idempotency | **Yes**                                           | Confirmation timing, live provenance, correction/revoke races and consumed coverage need permanent business identity and exact ordering. F05–F07/F12; C07–C11.                                                                                                    |
| 14. Data integrity risks                                          | **Yes**                                           | Duplicate evidence, mutable staging identity, guessed portion survival and caller attribution can corrupt history and current reason. F03–F07; C04–C13.                                                                                                           |
| 15. Security and privacy risks                                    | **Yes**                                           | Donor/private ministry material may leak through a reason, supporting body, audit or restore. Confirmation is not body-access authority. F08/F09/F13; C12–C14, C18.                                                                                               |
| 16. Scalability and performance risks                             | **Yes**                                           | Joining all historical gifts or materializing one task per assertion will degrade; no quantitative capacity claim is verified. F06/F14; C09, C19.                                                                                                                 |
| 17. Operational burden                                            | **Yes**                                           | Unowned pending work, broad repair scripts and compulsory approval/transcript collection create recurring manual intervention. F10/F12/F15; C15, C17, C20–C22.                                                                                                    |
| 18. Observability and auditability gaps                           | **Yes**                                           | A label/log line cannot prove donor assertion, actor, scope, correction and handled result; full-body logging creates another risk. F01/F12/F13; C02, C11, C18, C20.                                                                                              |
| 19. Dependency and integration risks                              | **Yes — owner seams; no new external dependency** | Existing source and task qualification is material. Competitor tools, AI and optional workflows are not required and cannot resolve Core purpose authority. F02/F15; C06, C21.                                                                                    |
| 20. Migration, rollout, and upgrade risks                         | **Yes**                                           | Legacy writers, history sweeps and mismatched reader/schema versions can bypass new facts or replay old work. F03/F05/F15; C07, C22.                                                                                                                              |
| 21. Testability, traceability, and proof                          | **Yes**                                           | Vague confirmation/actor/portion meaning is not falsifiable; a finite model cannot prove deployed RLS or UI. F01/F16; C23–C24 and P01–P32.                                                                                                                        |
| 22. Other development hazards                                     | **Yes**                                           | Calling A a complete special-gift definition or treating the selected actor class as a blanket permission would freeze unapproved scope. No additional money mutation, checkout redesign or external send is needed. F16; C01, C03, C23.                          |

## Outcome-based proof obligations

| ID  | Falsifiable expected outcome                                                                                                                                                                                                                                                                                                            | Clause trace      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| P01 | An eligible received gift with explicit additional purpose qualifies without a named appeal or specific need; a smaller amount still qualifies.                                                                                                                                                                                         | C01–C02           |
| P02 | One-time payment, larger history value, missing pledge, generic memo/flag, imported label and AI output alone admit no reason. Changing only these inputs cannot change admission.                                                                                                                                                      | C01–C02           |
| P03 | Each permitted actor class can perform only the selected scoped action; unpermitted missionary/staff/coach/donor/workflow and forged actor context cannot confirm.                                                                                                                                                                      | C03, C13          |
| P04 | Gift/task/interaction access alone does not confer confirmation; confirmation alone does not grant body, financial, contact or cross-subject access.                                                                                                                                                                                    | C03–C04, C14      |
| P05 | Direct table/view/RPC/privileged paths reject foreign scope and immutable-origin retargeting, including a move between two otherwise writable rows. Effective grants and USING/WITH CHECK behavior are tested.                                                                                                                          | C12–C13           |
| P06 | Qualified direct, organizational/representative and supported P14 attribution lanes produce the exact permitted Party/scope without anonymous leakage or household/member fan-out; unsupported lanes fail safely.                                                                                                                       | C04, C14          |
| P07 | Whole and mixed-purpose gifts show the exact portion; zero, negative, too-large, unsupported-precision, overflow and foreign-currency inputs are rejected before coercion.                                                                                                                                                              | C05               |
| P08 | Confirmation/correction leaves every posted financial field, P16 application and receipt byte-for-byte unchanged; a promised additional gift is not rejected solely because it fulfills its own commitment.                                                                                                                             | C06               |
| P09 | Conflicting authoritative ordinary/catch-up/advance instructions cannot be overridden by a purpose action. The owning financial correction remains separate and available.                                                                                                                                                              | C02, C06          |
| P10 | Exact reversal removes invalid purpose; identified partial correction preserves the original assertion while qualifying current surviving support. A wholly additional scope may survive a source-qualified partial refund; an unidentified mixed-purpose reversal makes only the affected reason uncertain without guessed arithmetic. | C05, C08          |
| P11 | Pre-receipt evidence creates no gift task; first valid later confirmation of an eligible originally-live receipt within the prospective D29 activation cohort admits once with unchanged gift date.                                                                                                                                     | C07               |
| P12 | Historical imports and every preactivation receipt (even formerly live), policy/criterion change, relabel and transport timestamps cannot create D29 live origin or reopen handled coverage; delayed originally-live delivery recovers correctly.                                                                                       | C07–C09           |
| P13 | Unknown origin remains unavailable pending owner resolution; a qualified origin correction can repair the same unconsumed effect without resetting dates or inventing a new identity.                                                                                                                                                   | C07–C08           |
| P14 | Failure of required purpose/history/audit/receipt/intent persistence leaves no partially accepted result; success plus lost response recovers the same outcome.                                                                                                                                                                         | C11, C17          |
| P15 | Duplicate same/different-key commands, multiple evidence records, concurrent confirmers and retried workers create one business member and at most one compatible current task. Changed-payload retry conflicts.                                                                                                                        | C09–C11           |
| P16 | Reviewed-group Done covers only the reviewed current gift set; a newly arriving gift remains pending. Additional reason on an already-covered gift does not reopen it.                                                                                                                                                                  | C09–C10           |
| P17 | Save versus source correction/revocation and materialization versus withdrawal have valid ordered outcomes using actual source/database fences, not mocked success flags. A lock wait crossing authority expiry is denied using current time at acceptance.                                                                             | C08, C11–C13      |
| P18 | Completed history and independent promises/other valid reasons survive withdrawal; eligible unconsumed correction restoration uses the original member. Former recorder departure alone does not erase accepted facts.                                                                                                                  | C08–C10           |
| P19 | Search/count/history/notifications/cache/Realtime/export/recovery enforce exact current tenant/entity/subject/Party projection; inaccessible details and existence do not leak.                                                                                                                                                         | C04, C12, C14     |
| P20 | Revocation after accepted write blocks subsequent unauthorized response/body release at the owner's final authorization boundary; previously authorized released bytes are not claimed recallable. Late client responses after context changes are rejected; raw evidence is absent from task payloads and logs.                        | C11, C14, C18     |
| P21 | A qualified user records an ordinary whole-gift purpose with one deliberate save and no mandatory transcript, shared log, second approver, new appeal or donor checkout change.                                                                                                                                                         | C02–C03, C15      |
| P22 | Users distinguish whole amount from additional portion, stated purpose from mathematical excess, saved purpose from task pending, task Done from actual communication. Any critical misunderstanding blocks release.                                                                                                                    | C15–C16, C24      |
| P23 | Keyboard, focus, screen reader, 320 CSS-pixel reflow, zoom, RTL/long names and localized dates/currencies remain usable without hidden disclosures; real manual evidence supplements automation.                                                                                                                                        | C15–C16, C24      |
| P24 | Slow/offline/lost-response/conflict paths preserve permitted input, never report unacknowledged success or silently replay commands, and recover accepted effects once.                                                                                                                                                                 | C15–C17           |
| P25 | Worker outage, dropped/duplicate event and projection lag recover from durable source intent with an owned visible status; no new financial effect or message is emitted.                                                                                                                                                               | C11, C17, C20–C21 |
| P26 | Evidence retention, holds, privacy deletion and restore preserve only qualified facts/copies; lawful minimal attestation validity is explicit and erased bodies do not reappear.                                                                                                                                                        | C18               |
| P27 | Retained-data census and mixed-version migration preserve original identity/coverage, block unsafe legacy writers, avoid historical task floods and retain a safe roll-forward path.                                                                                                                                                    | C22               |
| P28 | Exact source/RLS/query plans meet predeclared workload budgets with paginated history and no global historical scan or silent truncation of authoritative gift membership.                                                                                                                                                              | C19               |
| P29 | Dominant-tenant bursts, correction fan-out and queue contention meet predeclared fairness/lock/backlog budgets; cleanup/retry does not lose other tenants' work.                                                                                                                                                                        | C19–C20           |
| P30 | Optional workflow/provider/import/AI paths cannot confirm via metadata or bypass the same source-purpose command; native work functions without those integrations.                                                                                                                                                                     | C13, C21          |
| P31 | A, actor clarification/status, glossary, owner amendments and eventual canonical/generated spec/ticket/test/release records agree; historical evidence remains unchanged.                                                                                                                                                               | C23               |
| P32 | Representative missionary/staff journeys meet declared task-success/time/network budgets; the release record identifies unresolved source lanes and does not claim simulated checks as production proof.                                                                                                                                | C24               |

## Synthesis, order and monitored residual risks

1. **Resolved before recording this amended answer:** preserve A and the explicit
   selected staff/missionary actor class; separate donor-stated purpose from
   financial meaning and retain exact scoped permission. No silent role grant
   is acceptable. The corrected decision and complete required safeguards are
   now ratified; no numerical legal/performance guarantee is
   fabricated. No further product clarification blocks this review.
2. **Capture in the later authorized specification:** the P28 typed affirmative
   purpose, exact P12 actions/projections, qualified P13/P14 support and P16
   conflict boundaries, live-cohort timing, portion evidence, retention and D20
   coverage. Register the explicit owner amendments through the governing process.
   This turn does not create formal PRD/ADR/OpenSpec/tickets.
3. **Implement and prove the source first:** exact source relations, constrained
   authoritative command, current permission and durable evidence/intent. Then
   prove correction/revoke/duplicate races, compatible task materialization and
   retained-data migration. Build the short gift-context form and task reason on
   those actual contracts, retaining manual work during unrelated outages.
4. **Before activation:** pass P01–P32 at real source/database/UI seams; declare
   supported donor/recognition lanes, qualified retention schedules, numerical
   workload budgets and user results. Enable a bounded prospective cohort only
   after compatible readers and writer fences exist. Missing exact proof blocks
   the affected reason/lane, not posting or every missionary feature.
5. **Monitor residual failures with accountable owners:** use the signals below.
   Security, financial truth, source identity and unknown authority are release
   gates, never “monitor and hope.”

| Signal                                                                                                                   | Threshold                                                                                  | Accountable owner                                                      | Required response                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Cross-scope/private evidence disclosure or unauthorized confirmation                                                     | **1 confirmed event**                                                                      | P12 authorization owner and security incident lead                     | Contain affected commands/projections, preserve minimal incident evidence, repair and requalify before re-enabling.                             |
| Financial mutation from a purpose action, duplicate member/current task, replayed handled work or lost accepted evidence | **1 confirmed invariant violation**                                                        | P28 purpose owner with P9 task owner; financial owner for money impact | Fence affected admissions/writers, reconcile through source commands, preserve completed/financial history and add exact regression proof.      |
| Unmaterialized accepted intent or uncertain correction exceeds its qualified resolution deadline                         | **1 overdue obligation**                                                                   | P28 operations owner; exact source owner for unresolved facts          | Diagnose safe source/receipt traces, replay or correct the same operation, escalate at the declared response deadline; no bulk reflagging.      |
| Error/latency/lock/backlog budget exceeded                                                                               | **2 consecutive 5-minute windows at the predeclared minimum sample size**                  | Platform API/database on-call                                          | Limit rollout/load or pause affected materialization, preserve corrections and current access boundaries, diagnose plans and hot keys.          |
| User confuses purpose with money editing/sending, or cannot identify reviewed scope                                      | **1 critical release-test misunderstanding, or 2 substantiated independent pilot reports** | Missionary Workspace product/UX owner                                  | Block release for test failure; otherwise pause expansion, fix wording/flow and repeat representative tests without collecting private content. |

Exact source-dependent time and workload budgets must be recorded before
activation. The thresholds above are ratified operating decisions, not measured
Core performance or legal standards. No new alert inbox is required for every
unconfirmed gift.

## Adversarial check

### What could go wrong with this answer?

An attractive reason could hide a magic flag, financial reassignment, duplicate
task or private-message leak. C02–C14 make the qualifying fact, owner, scope and
effect independently testable.

### What hidden assumptions are we making?

That the exact donor statement can be lawfully attributed and projected, and
that a source can preserve live provenance and portion/correction truth. Those
are named proof gates. The founder explicitly selected staff and missionaries
when permitted; the actual action and source scope still require qualification.

### How does this affect the whole product?

It adds one P28 purpose criterion and consumes existing financial, permission and
task owners. It does not change donor checkout, finance posting, receipts,
newsletter consent, coaching or public ministry pages.

### How does this affect the end-user experience?

One contextual confirmation feeds the existing task with a plain reason. Maya
handles the reviewed gifts once. Corrections, unknown outcomes and authority
changes stay honest without forcing reports or an approval queue.

### Does this follow modern best practices?

It applies explicit source evidence, minimal fields, least privilege, durable
business idempotency and clear status. Competitor heuristics are rejected where
they conflict with Core. No research source proves this UI successful before
representative usability and accessibility testing.

### Does this fit Asym’s existing repo and product direction?

Yes, as the exact P28/P12/source extension described here. Current task and
staging code must not be mistaken for that producer. ADR-0206, ADR-0183, D19–D22
and the shared `base-maia` system remain governing boundaries.

### Should we adjust the recommendation?

Retain A with the required amendments. Use a scoped donor-purpose affirmation
and existing reviewed follow-up; reject financial inference, generic flags and
duplicate workflow machinery. Preserve the explicit selected actor class without
converting it into a blanket permission.

## Verification and limits

The review covers **all 22 requested categories**, **16 consolidated material
findings**, **24 exact amendment clauses** and **32 outcome proof obligations**.
Independent governance, financial, database/security, UX and semantic-model
workstreams are reconciled in [cross-review resolution](d29-evidence/cross-review-resolution.md).
The [finite model](d29-evidence/purpose-counterexamples.py),
[results](d29-evidence/purpose-counterexamples.json) and
[model limits](d29-evidence/model-readme.md) cover **14 counterexample families,
5 positive controls and 47 outcome assertions**. A separate
[root reproduction](d29-evidence/root-reproduction.json) produced identical output.
These test selected logical counterexamples, not actual Core/Supabase
authorization, transactions, financial sources or users.

All **23 D28 evidence artifacts** are pinned in the
[prior manifest](d29-evidence/prior-evidence-sha256.json); the
[original Q29](d29-evidence/q29-before-answer.txt) is preserved. No older finite
model or database experiment was rerun. Current structural/provenance verification
for that initial review is recorded in [original verification](d29-evidence/review-verification.json).
The separate [ratification verification](d29-evidence/ratification-verification.json)
checks the current status and continuation without rewriting those earlier results.

No actual missionary/staff interviews, hosted Supabase, end-to-end application,
accessibility, provider, migration or load qualification is claimed. The finished
result is the researched corrected decision and review within the authorized
grill boundary. A and the staff/missionary actor clarification are explicitly
selected; the required amendments are now explicitly ratified. No application/
schema/dependency, live data, provider, external communication, formal PRD/ADR/
OpenSpec/ticket or GitHub state was changed. No Q30 was posed during the initial
answer review.

## Subsequent explicit ratification and continuation

On **October 18, 2026 UTC**, the founder instructed: **“Ratify this decision and
amendment. Then continue with this phase 28 grill-with-docs session.”** The exact
corrected D29 decision, selected staff/missionary actor scope, C01–C24, P01–P32
and operational responsibilities are now accepted future requirements. No blanket
permission, implementation, source qualification or additional financial power
is inferred.

All sixteen initial evidence artifacts, including the original verifier and
result, remain unchanged in the
[ratification manifest](d29-evidence/ratification-evidence-sha256.json). The
[original review snapshot](d29-evidence/d29-before-ratification.txt) preserves its
pre-ratification status. No finite model or earlier database probe was rerun.

The [Q30 research brief](phase28-q30-one-time-need-purpose-research.md) takes up
the separately reserved question of whether confirmed support for a specific
one-time need independently qualifies when it is not also recorded as additional
support. Q30 is unanswered. No formal specification, ticket or implementation
transition is authorized by this continuation.
