# Phase 28 D27 — resume own saved preparation after returning

**Disposition: Accept with required amendments.**

**Status: the corrected decision and required amendments were explicitly ratified
on October 17, 2026 UTC.** Reviewed **October 17, 2026 UTC** against
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and the current working tree.
D26 remains ratified. This is the completed answer review for Q27, not an
implemented capability or formal PRD/ADR/OpenSpec/ticket. The founder's
[research-only boundary](phase28-founder-brief.md:21) remains in force. No Q28
was posed during the initial review; the subsequent ratification and continuation
are recorded below.

## Exact corrected decision to record

> **D27 — Optional resumption of own saved preparation.** When the organization
> permits it, a returning missionary may discover and deliberately resume
> selected, still-eligible preparation they originally authored in the same
> organization and ministry, provided the source and current authorization
> explicitly admit that history. Regaining workspace access, having the same
> email, being the original author or retaining an old record is insufficient
> on its own. Current permission must precede search, counts, previews and reads.
>
> Resume continues the same preparation and deliberately includes it in the
> missionary's current working context. It does not copy a contact, change the
> original author or historical membership, grant access or mark old information
> newly verified. Under the explicit D28 return clarification, authorized Resume
> accepted before expiry admits only the selected entry to qualified normal
> current-work retention and ends its departure deadline. Original departure and
> deadline history remain intact; unselected entries keep their deadlines. This
> inclusion belongs to the preparation source and is separate from its existing
> Active/Archived state. Earlier selections do not automatically return after an
> ended participation period.
>
> Maya may review, resume selected entries now or later, leave other entries
> alone, and make ordinary permitted corrections. Archived preparation stays
> archived unless she deliberately uses **Return to active prospects**. That
> clearly labeled action may combine authorized resumption and the existing
> archive-return transition without requiring two separate confirmations.
>
> Provide a small **Earlier preparation** view within ordinary prospect work,
> with authorized search, clear saved/changed dates and the same familiar detail
> editor. No mandatory return wizard, per-entry staff approval queue, compulsory
> reason, bulk restoration or second database is needed. Explain current
> availability honestly without disclosing forbidden records.
>
> Resumption grants staff, coaches and successors no new private-content access.
> It does not restart sharing, tasks, reminders, sending, subscriptions or
> connected accounts, or change consent, gifts or commitments. Current
> restrictions, erasure and retention still apply. Held evidence is not ordinary
> readable preparation; purged content cannot be recovered through this feature.
> Turning permission back on permits a fresh current decision, never resurrection
> of ended grants. Independently valid access retains its own rules.

The founder selected useful resumption with flexibility and simplicity. The
amendments make that outcome precise; they do not choose a retention duration,
cross-ministry portability, staff custody, bulk editing, backup restore or a
universal return policy for other source domains.

## Evidence, ownership and alternatives

Evidence labels below are deliberate: **repository intent** describes the owning
contract; **current source** describes inspected code; **external fact** describes
directly read primary documentation; **judgment** is a proposed product choice;
**unqualified** means runtime or user evidence has not established the claim.

| Class                    | Finding and consequence                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Founder evidence         | A is selected. This verifies desired direction, not frequency of returns or a measured improvement in missionary productivity. No supporter or ministry participant was contacted.                                                                                                                                                                                                               |
| Repository intent        | [D3](phase28-d3-adversarial-review.md:43) explicitly reserved returning-user history access. [D4](phase28-d4-adversarial-review.md:24) already owns ordinary archive/return. D27 adds a narrow current history/resumption contract, not a reinterpretation that old access always survived.                                                                                                      |
| Owning domains           | P4 owns authenticated identity/linkage; P9 owns preparation/contact truth; P12 owns current exact assignment, purpose, field and history access. P28 consumes them. ADR0001 keeps CRM in Asym Postgres; ADR0183 keeps task truth with its source. [Detailed owner reconciliation](d27-evidence/governance-and-ownership.md).                                                                     |
| Current source           | The bounded inspection did not find a qualified private-preparation/resumption producer. Current portal data is not proof of one. `crm_notes` is tenant-owned staff work with nullable author metadata and different RLS; it must not be repurposed by filtering on author. [Fresh source/database evidence](d27-evidence/database-and-authorization.md).                                        |
| Current auth             | The request context validates the session and fails closed on profile/membership query errors. It still exposes a coarse role/membership shape and compatibility fallbacks, not the exact source-history admission required here. This is a D27 adoption gap, not a claim that the already-fixed query-error fallback still exists.                                                              |
| Primary product evidence | Current HubSpot and Atlassian documentation separates account access, retained work and identity continuity. MPDX offers findable hidden contacts but couples hiding to relationship status. These are comparisons, not authority to import old-grant restoration, administrative reassignment or contact-status changes. [Primary research and dates](d27-evidence/ux-and-primary-research.md). |
| Technical evidence       | Current PostgreSQL/Supabase documentation distinguishes grants from RLS, old-row visibility from new-row checks, stale JWT claims from current authority, and ordinary reads from privileged bypass. No hosted database or deployment was inspected. [Technical evidence](d27-evidence/database-and-authorization.md).                                                                           |
| Tested reasoning         | The finite [counterexample model](d27-evidence/resumption-counterexamples.py) compares unsafe alternatives with the proposed rules. Its [result](d27-evidence/resumption-counterexamples.json) is design evidence, not SQL/RLS/Auth/HTTP/UI or capacity qualification.                                                                                                                           |
| Unqualified claims       | Actual missionary comprehension, production data volume, latency, complete deployment privilege inventory and exact source retention configuration remain release proof obligations. No invented interview, throughput benchmark or production exploit is reported.                                                                                                                              |

**Strongest alternative:** B keeps ordinary authorized CRM and new preparation,
without a returning-history workflow. It avoids this access/lifecycle extension,
but makes retained private work inconvenient to reuse and can encourage manual
re-entry. That inconvenience is a reasonable inference, not measured behavior.
A earns its additional boundary by reusing one source entry with deliberate
selection. A navigation-only “Resume” would not preserve the selection in current
work; cloning preparation would create competing truth. Restoring everything on
login would undermine the user's deliberate choice. A generic permission or
retention workflow builder would solve a much larger, unrequested problem.

The permanent path is the smallest qualified extension to existing P4/P9/P12
owners. **Do not build a disconnected recovery service, contact migration tool,
new coach role or independent authorization engine.** Qualification blocks this
capability where its source is missing; it need not stall unrelated Phase 28 work.

## User journey and UI direction

Use Core's exact `base-maia`, Base UI and semantic Zinc-oriented tokens. A quiet
list/detail composition, generous readable spacing and one clear primary action
fit this job. The following is behavioral design guidance, not a fabricated
tested screen or a new component system.

| Moment                          | What Maya sees and does                                                                                                                                                        | Required behavior                                                                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Returns to work                 | Her normal workspace. A small Earlier preparation entry point is available where the capability is allowed.                                                                    | No forced onboarding, urgency badge or old-prospect count before historical authorization. Do not inject every earlier entry into today's active work.                                                                      |
| Finds earlier work              | Search and simple Active/Archived filtering within authorized earlier preparation. Rows show permitted identity/label, state and original saved/last substantive change dates. | No task backlog, supporter score or stale-contact warning inferred merely from age. Page through all eligible results; empty and failed-load states differ.                                                                 |
| Reviews an entry                | Familiar detail view, permitted prior context and clear field provenance. Primary **Resume** for an eligible active entry.                                                     | Reviewing is not resuming. No compulsory re-entry of unchanged fields or new “verified” timestamp. Current shared facts are shown only through their own permitted source, without silently overwriting private assertions. |
| Resumes                         | The original entry becomes included in the current working context, then opens for ordinary permitted work. Concise feedback: **Ready to continue**.                           | One accepted source effect. No duplicate contact, automatic task or communication. Keep a visible retry/recovery path if the response is lost.                                                                              |
| Reviews archived preparation    | Archived state is explicit. **Return to active prospects** remains the action for actually bringing it back to active work.                                                    | Read/review or resumption alone preserves archive. An explicit return may atomically include the entry in current work and perform D4 return. No hidden relationship-status change.                                         |
| Leaves it for later             | Back or close returns to the list with authorized filters/position preserved.                                                                                                  | No rejection reason or “overdue recovery” task. Maya can resume another entry later.                                                                                                                                        |
| Access or eligibility changes   | Protected content is cleared and a neutral, actionable unavailable state appears.                                                                                              | Never present a stale private preview underneath an error. Do not identify a hidden record or explain a confidential classification. An authorized configuration-disabled explanation can be specific.                      |
| Wants to stop active work again | Existing D4 archive behavior, where eligible.                                                                                                                                  | No new destructive “undo return” tool; nothing reverses intervening corrections, communication or retention.                                                                                                                |

Authorized staff configure the capability through existing policy administration,
with a clear effect explanation. They do not need to inspect entries or approve
each selection. A simple permit/disable control, defaulting to no new access
when missing/unqualified, is sufficient. Do not infer extra per-record settings,
custom formulas or a new inheritance hierarchy from “full flexibility.” Current
role/source constraints still narrow who can use it.

Jordan's coaching view gains nothing from resumption. A later deliberate D24,
D25 or D26 sharing action remains separate and must qualify its own source.
Donors and public visitors receive no new view, message or changed preference.

**Usability obligations:** keyboard access and visible unobscured focus; named
controls; status feedback exposed to assistive technology without gratuitous
focus stealing; touch targets meeting WCAG 2.2 AA; narrow-screen reflow at
320 CSS pixels and zoom; wrapping international names, RTL and localized dates.
Use absolute dates alongside optional relative wording so “last year” does not
hide history. Store instants consistently and display the selected user's time
zone; date-only facts retain their source meaning. No map, graph or animation
is required. Fetch summaries before bodies, retain non-sensitive navigation state
on retry, and avoid persistent offline copies of private preparation.

Fresh [W3C status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html),
[target sizing](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
and [reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
support these accessibility requirements. They do not substitute for manual
keyboard/screen-reader and real user qualification.

## Exact required amendments

These are ratified decision requirements for a later authorized specification,
not active grants or a production schema. Each clause uses MUST to remove
implementation ambiguity while leaving unnecessary storage/UI details unfrozen.

### D27-C01 — Bounded optional capability

The organization MUST control whether own-preparation resumption is permitted.
Missing or unqualified policy MUST grant no new capability. Maya MUST choose
which eligible entries to resume and when. The policy MUST use the existing P12
administration and source rules, with no new unrestricted rule builder,
compulsory return ceremony or per-entry staff approval. A returning missionary
MUST be able to use ordinary independently authorized work without resuming any
earlier preparation.

### D27-C02 — Exact subject and scope

The source MUST bind each eligible entry to its canonical original human author,
original authorship/assignment provenance and exact Tenant/ministry scope, plus
Legal Entity or other source scope where required. The validated current
principal MUST resolve to that author through qualified P4 identity evidence.
Email/name equality, CRM merge guesses, an Auth account alone, assignment alone,
or another worker's authorship MUST NOT establish eligibility. Recreated and
reactivated assignments MUST each qualify against the exact current assignment
and its current activation context; old membership identity alone is insufficient.

### D27-C03 — Current history authority before disclosure

Discovery, search, totals, snippets, reads, resumption, edits and recovered
results MUST resolve current source-purpose-field-history authority before
disclosure or effect. The currently admitted authority MUST be distinct from
old expired/revoked grants and from working-list inclusion. The current author
identity and readable source history are both required. D27 MUST NOT expose
private content through administrator configuration, diagnostics, exports,
Realtime, coach views, identity matching or hidden-result counts.

### D27-C04 — One preparation and one working meaning

Resume MUST record deliberate inclusion of the SAME preparation identity in the
exact current working context, using the source's existing inclusion/assignment
mechanism where qualified. If absent, that small relationship MUST be owned by
P9 alongside the preparation, not a parallel recovery ledger. It MUST neither
grant access nor replace original authorship, origin membership, source scope or
historical assertions. Old working inclusion MUST NOT automatically carry across
ended participation even if the same membership ID is reactivated. There MUST
be at most one effective inclusion for the same preparation/current context.
Temporary withholding that does not end participation MUST NOT force a new
selection ceremony; existing inclusion remains usable when its independent
current source/history authority permits it again.

### D27-C05 — Archive, access and inclusion are independent

Source Active/Archived state MUST retain D4 meaning. Resume or preview MUST NOT
implicitly unarchive. The deliberate **Return to active prospects** command MAY
compose current inclusion and D4 return atomically, after both current checks,
when its label makes that consequence explicit. Already included entries MUST
open without another effect. Ordinary permitted correction MUST remain possible
without manufacturing an active state. No second “resumed/active” workflow,
automatic archive on departure or scheduled reactivation is introduced.

### D27-C06 — Eligible content and accurate history

Only the source's eligible own preparation and permitted fields MAY be exposed.
Staff notes, member-care records, another person's preparation, private messages
and independent CRM history MUST NOT be imported into it. An entry whose
sharing/classification/scope has changed MUST use its current owner rules; D27
MUST NOT silently relabel it private or copy it to evade those rules. Original
saved/substantive-change dates and provenance MUST remain truthful. Resume alone
MUST NOT mark contact information verified, update an authored fact, erase a
correction, infer consent or merge/create a canonical person.

### D27-C07 — Retention, holds and erasure

The source MUST distinguish an ordinarily readable retained body from evidence
retained only for audit/hold and from erased/purged content. Retention alone MUST
NOT grant a body read. Under the founder's explicit D28 return clarification,
authorized Resume accepted strictly before expiry MUST admit only the selected
same preparation to qualified normal current-work retention and end applicability
of its departure schedule. Original departure time, policy and deadline history
MUST remain intact. Login, reactivation, viewing or resuming another entry MUST
NOT extend unselected preparation. Missing current-work retention qualification
MUST reject admission without cancelling the existing obligation.

Resume MUST NOT extend a hold, copy content out of a restricted tier or restore
expired, erased, held-only or purged content. A hold preventing disposal does not
by itself remove independently valid ordinary access before expiry; applicable
use restrictions still govern. A later genuine departure applies to work admitted
to that later context, without restarting unselected older episodes. See the
[selected D28-C07 meaning](phase28-d28-preparation-retention-adversarial-review.md#d28-c07--return-must-have-one-explicit-retention-meaning).
Before activation, the source owner MUST qualify exact body/evidence/derivative
disposition, triggers, durations and backup restoration against D3-C06. D27
selects no universal timer or indefinite retention. Missing qualified policy
blocks this source capability, not unrelated authorized work.

### D27-C08 — No revived external or domain effects

Resume MUST NOT revive sharing grants, coach access, task completion/reopening,
reminders, newsletters, connected accounts, subscriptions, communication consent,
financial commitments or gifts. Existing independently authorized duties and
communication remain governed by their own owners; the command neither starts
nor cancels them. No provider call, task engine, notification fan-out, calendar
resubscription, AI processing or vendor integration is required for resumption.

### D27-C09 — Integrity and trusted attribution

Tenant and required scope/identity keys MUST be non-null for qualified new
records. Tenant-aware foreign keys MUST bind preparation, current context and
admission/audit relations so a cross-tenant pair is impossible. Unique keys MUST
protect one effective inclusion and semantic command identity. Origin author,
origin assignment, Tenant, source scope and audit actor MUST be server-derived
and immutable through this command; existing historical null/ambiguous authors
MUST be withheld rather than guessed. Current inclusion MUST be separately
attributed to the current actor/assignment. Revocation/departure MUST end access
without cascading away original evidence. Source deletion rules MUST separately
own body/evidence removal; no blanket Auth-delete cascade is inferred. Timestamps
MUST retain source precision and ordering. No money column or financial mutation
is needed.

### D27-C10 — RLS, grants, functions and privileged execution

The API boundary MUST enforce current source authority; database privileges and
RLS MUST independently restrict every exposed path. Ordinary browser roles MUST
not directly author historical identity, admission or audit fields. Mutations
MUST constrain both permitted old state (`USING`) and permitted new state
(`WITH CHECK`), with column privileges/commands/constraints protecting immutable
fields. Merely remaining in the same Tenant is insufficient.

Views, RPCs, direct REST/GraphQL, Storage and Realtime MUST preserve equivalent
boundaries or be inaccessible. A privileged worker/service role MUST re-prove
the same command authority; `FORCE ROW LEVEL SECURITY` does not bind BYPASSRLS or
superusers. Prefer invoker functions; any necessary definer function MUST have
qualified ownership, fixed safe search path, exact execute grants, validated
principal/scope and no unrestricted dynamic SQL. Existing staff `crm_notes`
grants and mutable/nullable author metadata MUST NOT become D27 authority.

PostgreSQL can reuse `USING` as an implicit check when an applicable policy omits
`WITH CHECK`; omission is not automatically an exploit. Explicit policy review
and tests must still establish the required old/new invariants. Likewise a
definer function uses its owner's privileges; bypass depends on those privileges
and RLS configuration. These precise primary-platform rules take precedence over
overbroad shorthand in helper guidance.

### D27-C11 — Atomic acceptance, retries and races

The source MUST atomically resolve current eligibility, match the reviewed
source revision/current context and authority fence, accept one inclusion and
record its effect/audit evidence. Locks or an equivalent qualified concurrency
protocol MUST order changes to eligibility against acceptance; a loose
check-then-write is insufficient. A revoke/erase/scope change ordered first
MUST prevent the stale effect. Acceptance ordered first remains truthful
history but grants no later read after revocation. Competing Resume requests
MUST converge on one business effect, including different transport keys.
Permission and body-retention expiry MUST be checked against current time after
waits at acceptance, not only against transaction-start time or a cached decision.
Retries with the same semantic intent MUST recover that effect under current
authority; conflicting payload/revision MUST request a safe refresh, not overwrite.

### D27-C12 — Policy changes and client isolation

Disabling resumption MUST fence dependent discovery, reads and commands while
preserving independently valid access. Re-enabling MUST evaluate current rules;
it MUST NOT resurrect a terminal grant or silently reuse prior-participation
selection. A temporary policy block is not a mandatory new approval episode.
Caches, query keys and result recovery MUST be scoped to the exact current
principal, Tenant, assignment/activation context, purpose and governing policy
version, with source revision where relevant. Sensitive responses MUST not use
shared/public caches or persistent offline copies. Sign-out, context change and
revocation MUST clear affected client state and invalidate in-flight results.
Authorization MUST never depend on stale JWT metadata or cache lifetime.

### D27-C13 — Honest availability and failure recovery

The UI MUST distinguish authorized empty results, temporary load failure,
accepted-but-refreshing results and unavailable access without revealing hidden
records. Success MUST follow durable acceptance, not click or optimistic state.
If the response is lost, the same operation/result path MUST safely recover it;
the user MUST NOT have to create a new contact or retype private facts. Revoked
content MUST disappear from active display as the client receives authoritative
denial/invalidation; no system can recall information already seen or copied.
Any guarantee about live client invalidation timing MUST be qualified rather
than implied by an RLS policy alone.

### D27-C14 — Bounded, usable retrieval

Earlier preparation MUST use authorized server pagination and indexed scope/
author/context lookups, not load all bodies and filter in the browser. The
proposed initial service profile is **25 summary rows per page, hard request
maximum 100**, detail on demand, and a single-entry command. These are engineering
bounds, not measured capacity or a total limit on a missionary's records.
No bulk-resume wizard or export is required. Preserve source-owned field limits;
do not invent arbitrary name/note truncation. Before activation, publish measured
volume/concurrency/latency fixtures and limits, explain query plans including RLS,
and qualify every supported deployment profile. No unmeasured scale claim passes.

### D27-C15 — Accessible, calm UX

The journey above MUST preserve familiar prospect navigation, one obvious
primary action, deliberate selection and visible current state. It MUST satisfy
WCAG 2.2 AA and Core `base-maia` conventions, including keyboard/focus, meaningful
status messages, narrow-screen/zoom, RTL/long names and error recovery. Information
age MUST be shown as provenance, not a warning that a person is stale or unworthy
of attention. No forced questionnaire, reason, repeated confirmation, streak,
quota or performance judgment is introduced. User testing MUST verify that Maya
understands what Resume changes and what remains private.

### D27-C16 — Business history and operational ownership

Durable source history MUST identify the original preparation, current actor/
assignment/context, accepted effect, source revision, policy decision/version and
time, without unnecessary duplicated body text. Original author and current
actor MUST remain distinct. Technical telemetry MUST contain reason codes and
correlation references, not private notes, names, addresses or tokens. P12 owns
authorization diagnosis; P9 owns preparation/inclusion repair; the privacy owner
owns disposition qualification. Repairs MUST use authorized idempotent commands,
not routine direct SQL or private-body access granted to support staff.
Accepted effect/audit history MUST be append-only within its qualified retention
contract; corrections append attributable evidence rather than rewriting who
performed the original action. This does not require indefinite body retention.

### D27-C17 — Safe rollout and upgrade

The source producer, identity/admission contract, retention profile, command/RLS,
cache behavior and UI MUST qualify before enablement. Deploy compatible schema
and server guards before readers/UI; missing policy/schema MUST fail closed.
Backfill MUST neither guess authors from email nor mark all retained records
eligible or selected. Old writers/readers MUST not bypass the new boundary.
Use a capability kill switch, restricted pilot and roll-forward repair. Disabling
the feature after accepted writes MUST preserve source history and truthful
inclusion; rollback MUST not destructively drop retained source data or restore
old grants. Restore drills MUST honor later erasure and permission decisions.

### D27-C18 — Traceable acceptance

The Q27 answer, glossary, these clauses, later authorized P4/P9/P12/P28 amendments,
ADRs/OpenSpec, implementation tasks/tickets, tests and release evidence MUST trace
the same names and boundaries. Source-owned requirements MUST be reconciled in
their canonical authoring sources and declared projections; a consumer note is
not a new grant. P01–P24 below MUST be evidenced at their real seams before
activation. Finite model results MUST never be reported as passing production
authorization, performance, accessibility or ministry-usability tests.

## Material concern register

Severity describes impact if the unsafe design ships. Likelihood is a reasoned
design exposure, not a measured incident rate. Each fix is exact in the cited C
clause; “changes” narrows the implementation, not the founder's selected A.

| ID  | What can go wrong and why it matters                                                                                                           | Severity / likelihood / supporting evidence                                                                                          | Effect on A          | Permanent fix and exact language                                                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| F01 | An account/email match or coarse missionary role exposes another person's or an earlier assignment's private history.                          | Critical / plausible if legacy auth is reused; current context lacks the required exact D27 admission. Governance/database evidence. | Narrows              | C02/C03: canonical author AND exact current source-history authority before every disclosure.                                              |
| F02 | Staff-owned CRM notes are reused as private preparation; nullable/caller-controlled author metadata becomes permission evidence.               | High / likely under naive reuse; fresh migration and API inspection documents different ownership/grants.                            | Changes architecture | C04/C09/C10: one qualified preparation source; trusted immutable origin and separate current inclusion.                                    |
| F03 | Retained or held-only material becomes readable, or Resume rewrites departure history, renews unselected work or recovers expired/erased data. | High / plausible; D3 explicitly reserves disposition and prohibits retention-as-access.                                              | Narrows              | C07/C17: ordinary body eligibility, preserved deadline history, selected-entry current-work admission and exact disposition/restore gates. |
| F04 | Old working selections return en masse, or Resume implicitly unarchives and changes contact status.                                            | Medium / likely if “restore” is overloaded; D4, MPDX contrast and lifecycle reasoning.                                               | Clarifies            | C04/C05/C15: deliberate current inclusion, independent Active/Archived state, explicit D4 return.                                          |
| F05 | A new membership is created by rewriting origin membership/author, losing truthful history or duplicating contacts.                            | High / plausible; identity concepts remain separate in CRM OpenSpec.                                                                 | Narrows              | C02/C04/C09: preserve original identity; separate current-context relationship, tenant-aware FKs and uniqueness.                           |
| F06 | Cached content, late responses, search totals or replayed results cross a permission/context boundary.                                         | High / plausible; existing portal uses a static query key; RLS cannot retract delivered data.                                        | Adds safeguard       | C03/C12/C13: current authorization before output, scoped caches and in-flight invalidation, no private offline persistence.                |
| F07 | Revocation, erasure or correction races with Resume; two retries create duplicate effects.                                                     | High / plausible under ordinary concurrent tabs/network loss; PG isolation and counterexample schedules.                             | Adds safeguard       | C11: atomic source/authority fencing, semantic uniqueness and currently authorized result recovery.                                        |
| F08 | Privileged paths, views, RPCs or writable scope/actor fields bypass intended row policy.                                                       | Critical / plausible if API-only or author-only checks; primary PG/Supabase documentation.                                           | Narrows              | C09/C10: grants plus RLS, old/new-state invariants, immutable columns and equivalent service-path checks.                                  |
| F09 | Old contact assertions appear newly verified, or stale prep overwrites a later shared correction.                                              | Medium / likely without explicit provenance; P9 ownership/D3 correction rules.                                                       | Clarifies            | C06: preserve dates/provenance, separate current facts, no unreviewed merge or overwrite.                                                  |
| F10 | Returning restarts queued communication, tasks, coaching or consent and surprises donors.                                                      | High / plausible in broad restoration flows; source-owner separation and HubSpot scheduling contrast.                                | Narrows              | C08/C12: no restarted secondary effects; every owner retains current authority.                                                            |
| F11 | A complex recovery wizard, hidden archive, inaccessible controls or vague success makes the feature unusable.                                  | Medium / likely without designed states; MPDX discoverability/W3C/Core UI constraints.                                               | Changes UX           | C13–C15: compact authorized list/detail, truthful statuses, same editor, accessible named actions.                                         |
| F12 | Large history queries load sensitive bodies or stall; operations rely on manual SQL repair and content-rich logs.                              | Medium / plausible; no deployed volume benchmark exists, source is not qualified.                                                    | Adds safeguards      | C14/C16: indexed bounded reads, measured profile, minimal audit and authorized repair commands.                                            |
| F13 | Old code/backfills/backup restore infer access or drop history during rollout or rollback.                                                     | High / plausible with retained ambiguous legacy data; current producer gaps and D3 migration requirements.                           | Adds gates           | C17: deny-first compatibility, no guessed provenance, kill switch, preserve writes, restore qualification.                                 |
| F14 | A planning decision is claimed as completed secure UX; retention policy or universal portability is invented to close a gap.                   | High / plausible in this developing spec; source authority and research-only boundary.                                               | Bounds claims        | C01/C07/C18: record the selected outcome and exact gates, no fabricated qualification or unselected access policy.                         |

## Independent review of every requested category

Each row is evaluated independently. Shared concerns reference the register so
their severity, likelihood, evidence, effect and exact corrective language are
not restated inconsistently.

| Category                                                         | Material concern?                                       | Result and required treatment                                                                                                                                                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity and alternatives                  | **Yes**                                                 | Useful retained work is a valid selected job; frequency remains unmeasured. B is viable; clone/all-at-once restoration/navigation-only fail different parts of A. F04/F11/F14; C01/C04/C15/C18.                 |
| 2. Brittleness                                                   | **Yes**                                                 | Email, membership-ID reuse, missing provenance and changed eligibility break simplistic recovery. F01/F03/F05; C02/C03/C06/C07.                                                                                 |
| 3. Technical debt                                                | **Yes**                                                 | Repurposed staff notes, dual contact records or a separate recovery engine would institutionalize wrong ownership. F02/F05/F12; C04/C09/C10/C16.                                                                |
| 4. Edge cases                                                    | **Yes**                                                 | Same versus recreated membership, archived entries, multi-tenant identity, changed scope, held-only evidence, erasure, old links and lost responses are realistic. F01/F03–F07; C02–C07/C11–C13.                |
| 5. Footguns                                                      | **Yes**                                                 | Restore-all, caller-supplied author, automatic unarchive, indiscriminate retention renewal and misleading success are easy mistakes. F03–F05/F08/F11; C04/C05/C07/C09/C13.                                      |
| 6. Tenant safety                                                 | **Yes**                                                 | Exact tenant/ministry/context can leak through joins, caches, counts, identity repair and current inclusion. F01/F05/F06/F08; C02/C03/C09/C10/C12.                                                              |
| 7. Database, RLS and authorization safety                        | **Yes**                                                 | Existing note grants do not establish private history authority; writes can reparent permitted rows unless invariants hold across all paths. F01/F02/F05/F07/F08; C09–C12.                                      |
| 8. Overengineering                                               | **Yes**                                                 | A new recovery service, generic policy engine, per-entry approval or cloned activity ledger would add complexity with no selected job. F02/F11/F14; C01/C04/C08/C15.                                            |
| 9. UX/UI and user friction                                       | **Yes**                                                 | Hidden earlier work, intrusive onboarding, confusing Resume/Return meanings and inaccessible failure states undermine trust. F04/F09/F11; C05/C06/C13–C15.                                                      |
| 10. Source of truth, ownership and invariants                    | **Yes**                                                 | Original author, present actor, historical access and current inclusion can be conflated; derived list state can become a grant. F01/F02/F05/F09; C02–C06/C09.                                                  |
| 11. Hidden coupling                                              | **Yes**                                                 | Archive may alter contact preference; same account may revive grants; generic updated-at may extend retention. F03/F04/F10; C05/C07/C08/C12.                                                                    |
| 12. Failure modes                                                | **Yes**                                                 | Timeout after acceptance, failed refresh or stale permission result can show false success or provoke duplicate entry. F06/F07/F11; C11–C13.                                                                    |
| 13. Lifecycle, temporal correctness, concurrency and idempotency | **Yes**                                                 | Same-ID reactivation, policy off/on, scope edits and revoke/erase races need explicit ordering; retry identity must bind the business effect. F03–F07/F10; C02/C04/C07/C11/C12.                                 |
| 14. Data integrity risks                                         | **Yes**                                                 | Cloning, guessed identity, overwritten provenance and falsely fresh assertions corrupt relationships and history. F02/F05/F09; C04/C06/C09/C11.                                                                 |
| 15. Security and privacy risks                                   | **Yes**                                                 | Prior own content can still contain third-party/ministry-sensitive data; hold, cache, logs and admin tools are disclosure paths. F01/F03/F06/F08/F12; C03/C07/C10/C12/C16.                                      |
| 16. Scalability and performance risks                            | **Yes**                                                 | Unbounded prior-history searches and authorization-per-row round trips are unqualified. F12; C14. Page bounds are proposals; no claimed throughput or latency is treated as verified.                           |
| 17. Operational burden                                           | **Yes**                                                 | Ambiguous author repair, manual grant restoration and database fixes can make return a support project. F01/F12/F13; C02/C16/C17. Missing authority must not be “fixed” by broad staff access.                  |
| 18. Observability and auditability gaps                          | **Yes**                                                 | Technical logs alone cannot explain original authorship versus current resumption; body-rich audit creates new exposure. F05/F12; C09/C16.                                                                      |
| 19. Dependency and integration risks                             | **Yes — source contracts; no new external integration** | P4/P9/P12 and retention qualification are real dependencies. No vendor call/webhook/sync is needed; vendor restore behavior is rejected where it conflicts. F01/F02/F10/F14; C02/C07/C08/C18.                   |
| 20. Migration, rollout and upgrade risks                         | **Yes**                                                 | Mixed code, ambiguous old records and backup recovery can bypass new controls or erase accepted history. F13; C17.                                                                                              |
| 21. Testability, traceability and proof                          | **Yes**                                                 | “Own,” “eligible” and “resume” are otherwise not falsifiable. Model checks cannot substitute for actual authorization or user tests. F14; C18 and P01–P24.                                                      |
| 22. Other development hazards                                    | **Yes**                                                 | “Full flexibility” can drift into data portability, permanent retention or access restoration outside this decision. No additional financial mutation or new vendor dependency was found. F14; C01/C07/C08/C18. |

## Acceptance and proof obligations

These are future release obligations. Only the bounded model/document checks
described in the verification section have run for this review.

| ID  | Falsifiable outcome                                                                                                                                                                                                                                       | Required proof seam                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| P01 | A permitted returning original author can discover and resume one eligible entry; without the capability ordinary authorized work still works.                                                                                                            | Source/API/UI positive test; C01–C03.                                                                                          |
| P02 | Another person with the same/recycled email or guessed record ID sees no body, snippet or existence count.                                                                                                                                                | P4 identity and source/API/RLS negatives; C02/C03.                                                                             |
| P03 | Still-valid participation survives temporary withholding without reselection; ended/reactivated and recreated membership each require exact current admission and selection. Old/revoked/expired grants do not suffice.                                   | Assignment/activation/reentry matrix; C02–C04/C12.                                                                             |
| P04 | Wrong tenant, ministry, Legal Entity or source scope cannot be joined, listed, resumed or repaired into eligibility.                                                                                                                                      | Composite constraints plus all caller paths; C02/C09/C10.                                                                      |
| P05 | Resume preserves source ID, original author/origin membership, creation/verification facts and canonical contact count.                                                                                                                                   | Before/after authoritative facts; C04/C06/C09.                                                                                 |
| P06 | Selection is durable for current context; old selection does not automatically return after participation ends.                                                                                                                                           | Same-ID/new-ID lifecycle cases, no all-at-once restore; C04.                                                                   |
| P07 | Review/Resume leaves Archived unchanged; explicit Return can include and unarchive once.                                                                                                                                                                  | Source and user-visible D4 composition; C05.                                                                                   |
| P08 | Held-only, purged, ambiguous-author and currently ineligible bodies remain unavailable.                                                                                                                                                                   | Body/evidence/hold/erasure/source-state matrix; C06/C07.                                                                       |
| P09 | Resume preserves original departure/deadline history and ends only the selected eligible entry’s departure schedule under qualified current-work rules. Unselected deadlines, consent, suppression, gifts, tasks, reminders and sharing remain unchanged. | Authoritative owner before/after and event assertions; C07/C08.                                                                |
| P10 | Caller-controlled Tenant/author/actor/origin/approval or forbidden new state is rejected on insert/update.                                                                                                                                                | Direct SQL under real roles, REST/RPC/API/privileged worker; C09/C10.                                                          |
| P11 | Views/functions/Storage/Realtime/search/export/diagnostic paths expose no broader history.                                                                                                                                                                | Deployed grants/policy/function owner census and route tests; C03/C10.                                                         |
| P12 | Revocation or erasure ordered before acceptance prevents Resume; acceptance first remains history but not future authority. Expiry during a lock/wait is evaluated at acceptance.                                                                         | Actual concurrent transactions, clock boundaries and response-recovery tests; C11.                                             |
| P13 | Concurrent clicks, different transport keys and lost responses yield one durable inclusion/effect.                                                                                                                                                        | Actual uniqueness/idempotency/CAS with injected failure; C11.                                                                  |
| P14 | Source revision, classification or scope changes between preview and acceptance cannot be overwritten or hidden.                                                                                                                                          | Stale preview and two-tab mutation tests; C06/C11.                                                                             |
| P15 | Off fences dependent paths; On freshly evaluates and never resurrects terminal grants; independent valid access survives.                                                                                                                                 | Policy lifecycle and distinct authority-path cases; C12.                                                                       |
| P16 | Account/context switch, revocation and delayed responses cannot repopulate private content from old cache.                                                                                                                                                | Browser cache/in-flight/Realtime and server-cache tests; C12/C13.                                                              |
| P17 | Empty, failure, pending result and unavailable states are truthful; retry never requires duplicate contact creation.                                                                                                                                      | Network fault/UI tests; C13.                                                                                                   |
| P18 | Every authorized result remains reachable across page boundaries; maximum request size is enforced without silently truncating the full result set.                                                                                                       | 0/1/25/26/100/101 request/result boundary fixtures; C14.                                                                       |
| P19 | Published production-shaped volume/skew/concurrency profiles meet measured query/UI budgets without unbounded body loads.                                                                                                                                 | Query plans under real RLS, warm/cold and multi-tenant load tests; C14.                                                        |
| P20 | Keyboard/screen-reader/touch/RTL/long-name/320px/zoom and slow-network flows remain operable.                                                                                                                                                             | Automated accessibility plus manual browser evidence; C15.                                                                     |
| P21 | Representative returning missionaries explain Resume versus Return, privacy and no restarted outreach without coaching; staff understand permission versus body access.                                                                                   | Recorded usability protocol and findings; all critical misunderstandings fixed before activation, not statistical claims; C15. |
| P22 | Audit distinguishes original author from current actor; routine logs contain no private body or credential; authorized repair preserves boundaries.                                                                                                       | Audit schema/output/diagnostic/repair tests; C16.                                                                              |
| P23 | Missing settings, mixed readers/writers, legacy ambiguity, kill switch and backup restoration fail safely without erasing accepted work.                                                                                                                  | Migration/backfill/restore/roll-forward drills; C17.                                                                           |
| P24 | Every selected rule maps consistently through glossary, owner amendments, OpenSpec, later tickets/tests and exact release evidence.                                                                                                                       | Trace matrix and no implemented/qualified claim without real proof; C18.                                                       |

## Synthesis and order of work

1. **Before recording the corrected answer:** resolve the meaning of Resume,
   identity versus access, current inclusion versus archive, and absence of
   side effects. This review does so in C01–C08. The founder subsequently ratified
   A and these amendments; no retention duration or broader historical right
   is invented. Ratification does not establish runtime qualification.
2. **Capture in the later authorized design/specification:** coordinate the
   narrow P4/P9/P12 producer/consumer extension, exact disposition profile,
   source-owned current inclusion and the calm list/detail journey. Preserve
   canonical owner documents and generated projections. No new formal artifact
   or ticket has been created by this review.
3. **Require in implementation:** source constraints and the one command/read
   boundary first; real RLS/grants/privileged-path and race proof next; client
   isolation and the existing UI system next. Do not expose a UI backed by staff
   notes or an unqualified author-only filter. Reuse packages and source helpers
   where they actually satisfy the contract.
4. **Qualify before enablement:** actual source/privacy/retention, restore and
   compatibility tests, performance profile and representative usability.
   Eligibility/disclosure and integrity failures are release blockers, not
   monitoring-only risks. Then enable a bounded pilot and expand on evidence.
5. **Monitor residual operation:** use the responsibilities and responses below.
   Monitoring never substitutes for a source contract or negative access tests.

| Signal                                                                                                                 | Threshold                                                                                          | Accountable owner                                   | Response                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Confirmed cross-scope/private-body disclosure or grant resurrection                                                    | **1 confirmed event**                                                                              | P12 authorization owner with security incident lead | Disable D27 dependent paths, contain caches/jobs, preserve minimal evidence and fix/verify before re-enablement.                                                                                              |
| Duplicate effective inclusion, rewritten origin/deadline history or unauthorized retention change attributed to Resume | **1 confirmed invariant violation**                                                                | P9 preparation owner                                | Fence the affected command, use audited repair and replay/constraint tests; preserve original facts.                                                                                                          |
| Accepted effect cannot be recovered by operation reference under still-valid access                                    | **1 confirmed unrecoverable effect**                                                               | P9 service owner                                    | Investigate transaction/result persistence; repair through authorized command, never ask Maya to duplicate the source entry.                                                                                  |
| Latency/error rate against the deployment's qualified service profile                                                  | **2 consecutive 5-minute windows exceeding its recorded budget**                                   | Platform API on-call                                | Inspect safe traces/query plans, reduce rollout load or pause capability; do not weaken authorization. Numeric latency/error budgets and minimum sample sizes must be recorded in P19 evidence before launch. |
| Repeated misunderstanding that Resume sends, shares or restores every record                                           | **1 critical privacy misunderstanding in release testing; 2 distinct substantiated pilot reports** | Missionary Workspace product/UX owner               | Block release for the first condition; pause expansion and correct wording/flow, then re-test for pilot reports. No content-bearing surveillance analytics.                                                   |

## Verification and limits

Three independent workstreams researched governance/current source, database/
authorization and product/UX; a fourth constructed executable finite
counterexamples. The root reconciled their findings and independently reproduced
**14 unsafe alternatives, five positive controls and 94 assertions** with
identical output. The expiry-during-lock-wait proof refinement is captured in
C11/P12; it requires an actual database test and is not proved by this model.
Final counts, hash preservation and link/category/trace checks are
recorded in [verification](d27-evidence/review-verification.json) and
[cross-review resolution](d27-evidence/cross-review-resolution.md).

The original [Q27](d27-evidence/q27-before-answer.txt) and sixteen D26 evidence
artifacts are preserved; [prior hashes](d27-evidence/prior-evidence-sha256.json)
make that verifiable. Earlier D3/D4 database experiments are historical evidence,
not newly run qualification. No application code, schema, dependency, live data,
provider, external communication or GitHub state was changed. No production
database, end-to-end UI, accessibility, load or participant test is claimed.

The finished result of this turn is the reviewed decision and its exact required
amendments. Delivery remains subject to the explicitly named source and proof
gates, within the founder's research-only session.

## Subsequent explicit ratification and continuation

On October 17, 2026 UTC, the founder instructed: “Ratify this decision and
amendment. Then continue with this phase 28 grill-with-docs session.” The exact
corrected decision, C01–C18, bounded initial profile, P01–P24 and monitoring
responsibilities are now accepted future requirements. No additional permission
was requested. Ratification does not qualify the source, activate access, change
retention, implement a feature or authorize formal PRD/ADR/OpenSpec/tickets.

Thirteen initial D27 evidence artifacts, including the original verifier and
result, are preserved in the
[ratification manifest](d27-evidence/ratification-evidence-sha256.json). Their
initial pending-ratification flags remain historical evidence. The finite model
and earlier database experiments were not rerun. The
[current verification](d27-evidence/review-verification.json) separately checks
current ratification, preservation and continuation.

[Q28 research](phase28-q28-preparation-retention-control-research.md) subsequently
asked whether organizations may configure the finite retention period for
unshared preparation after departure or use an Asym-standard period. D27's
ratification selected neither option nor a numerical duration. The founder later
selected organization control in D28 and clarified return behavior below.

## Subsequent D28 return clarification

On October 17, 2026 UTC, the founder selected **“Keep resumed preparation as
current work under the normal retention rules; end its departure deadline.”**
The current decision, C07, F03 and P09 incorporate this narrow clarification:
original deadline history is preserved, while only selected eligible preparation
accepted before expiry leaves the departure schedule for qualified current-work
retention. No expired/held-only/purged content is restored and no unselected
entry is renewed. That clarification alone did not ratify the remaining D28
amendments; the founder subsequently explicitly ratified them in the
[D28 ratification](phase28-d28-preparation-retention-adversarial-review.md#subsequent-explicit-ratification-and-continuation).

The [clarification record](d28-evidence/return-clarification.md) links the original
D27 text and unchanged earlier evidence. The D27 verifier/result above record the
prior ratification state; the [current D28 verification](d28-evidence/review-verification.json)
checks this later reconciliation. No finite model or database experiment was rerun.
