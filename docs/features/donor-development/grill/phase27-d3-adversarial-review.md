# Phase 27 D3 — one ordinary partnership, bounded independent purposes

2026-10-09. Core checkout `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
**Disposition: Accept with required amendments.** The founder selected A and
required minimal complexity and suitability for Supabase. D1 and amended D2
remain ratified. The founder explicitly ratified the tightened D3 wording below
on 2026-10-09: “yes, ratify this tightened D3.” The review's required amendments
are therefore accepted; remaining entry, lifecycle and sharing decisions are not
implicitly settled.

This completes the requested decision review, not the whole Phase 27 interview.
It is research and decision documentation under `/grill-with-docs`, not a PRD,
OpenSpec change, issue packet, application implementation or migration. The
user's `/to-prd` and `/to-issues` boundaries remain. No donor was contacted or
application/production database changed. A disposable PostgreSQL mechanics
experiment used synthetic scratch data; its limits are explicit below.

## Exact corrected D3 — ratified 2026-10-09

> **One ordinary partnership journey is the default for a supporter Party and
> its identified ministry in the source's exact scope.** Prayer, financial and
> other admitted forms of participation can coexist within that relationship.
> Successive asks, annual renewals, special appeals and stewardship do not by
> themselves create another journey. A journey is neither one ask status nor
> one task, assignee, financial state or permission boundary.
>
> An additional journey requires a genuinely distinct **continuing development
> outcome** that existing asks, shared tasks, responsibilities or authoritative
> relationships cannot adequately represent, and that needs independently
> managed relationship progress, follow-through and ending. Having its own
> deadline, response or task is insufficient: an ordinary ask has those too.
> Record the purpose and why separate relationship development is necessary
> through the authorized source operation. A new label, year, currency, staff
> member, preset, surface or confidentiality preference does not establish
> independence. No configurable purpose hierarchy or routine manager-approval
> process follows from this decision.
>
> Preserve independent ask responses, partner instructions and permitted
> participation facts. Prayer partnership is not a preliminary financial stage;
> giving does not prove prayer participation or consent. Declining one ask or
> changing one form of support does not by itself end or advance the continuing
> partnership. Appropriate existing source-linked tasks may satisfy its next
> action; do not create an extra administrative task solely because a journey
> exists, and do not hide other due obligations.
>
> Admit and reuse the same intended ordinary work through one authoritative
> source boundary. Database constraints and transactions enforce the declared
> identities and scope; they cannot determine semantic independence from prose.
> Reuse requires independent authority for the action and what its result
> discloses. Deduplication grants no access, does not expose hidden journeys and
> does not justify a duplicate to bypass denied work. A purpose edit does not
> change P12 processing authority, financial instructions or the permanent
> identity of an already accepted effect.
>
> This is a concurrent-purpose rule, not one enrollment per Party/ministry for
> all time. Preserve D2's correction, historical meaning and future-disposition
> boundaries. Pause, ending, reopening and merge collision rules must be settled
> before selecting the exact uniqueness predicate; they cannot be inferred from
> an `active` filter or a database error.
>
> Implement the eventual qualified model with ordinary relational PostgreSQL
> constraints and existing server-owned commands, shared tasks and durable
> execution. D3 introduces no second permission system, purpose registry,
> workflow engine, merge service, financial store or donor-facing setup flow.

**Material amendment:** “independent progress, follow-through and ending” alone
also describes an ordinary ask. The stronger test requires a distinct continuing
relationship outcome that the existing simpler records cannot adequately serve.
That bounds the exception and prevents the selected default being defeated by
renaming every special request. The other clauses carry forward existing owner
rules or clarify the selected answer; none expands disclosure or financial power.

## What the evidence establishes

| Classification              | Finding                                                                                                                                                                                                                                                          | Practical limit                                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository intent           | ADR-0136/P9 D19 own ministry identity; P9 owns Party/relationships/assignments/shared tasks; P27 owns journeys/asks; P12 governs current disclosure. D1/D2 remain binding.                                                                                       | Accepted contracts do not establish delivered services.                                                                                                 |
| Current checked-in behavior | No executable cultivation-enrollment/relationship-purpose source was found in the inspected packages/apps/migrations/tests. Existing donor ownership is profile-based; shared task inserts are separate calls and a general task collection includes seed state. | These are unqualified reuse seams, not demonstrated D3 production defects.                                                                              |
| Current stack               | Local Supabase config declares PostgreSQL major 17; package/lock entries pin `@supabase/supabase-js` 2.117.3 and `@supabase/ssr` 0.12.7.                                                                                                                         | No hosted project version/settings or complete Supabase deployment was queried.                                                                         |
| Primary practice evidence   | OMF presents prayer, practical help and finances as partnership; MPDX/Tnt distinguish particular appeals; current Salesforce/Virtuous distinguish individual solicitations and tasks.                                                                            | None supplies Core's exact enrollment model or proves all agencies work identically.                                                                    |
| Counterevidence/unknown     | No reviewed official source establishes a concrete requirement for a generic second-purpose engine for the exact same supporter and ministry.                                                                                                                    | Absence of that example does not justify prohibiting every genuine independent purpose. Actual mission-user evidence must qualify the exceptional path. |
| Measured mechanics          | An isolated PostgreSQL 17.11 experiment exercised 21 constraint/transaction/RLS/concurrency cases, including expected failure counterexamples.                                                                                                                   | It is not an application, Supabase Auth/PostgREST, production-scale or full authorization test.                                                         |
| Product judgment            | One thin ordinary journey plus existing asks/tasks is the best default; a narrowly justified exception preserves legitimate independent work.                                                                                                                    | Usability and exception admission need actual representative validation before release.                                                                 |

Fresh issue bodies for #512, #607, #610, #675 and #1284 were read; all remain
open. #512's later source-approved mutable-reference rule governs older blanket
merge language. No issue was changed. The source appendices distinguish retrieved
publication/modification dates, editions, inference and unavailable evidence.
The fresh AFP request returned HTTP 403; earlier AFP evidence is not presented
as freshly reverified.

## Adversarial check

### What could go wrong with this answer?

A single journey could collapse prayer, financial facts and simultaneous asks
into one misleading status. Alternatively, an arbitrary “independent purpose”
label could recreate duplicate pipelines. Database shortcuts could make pause,
concurrent creation or hidden records unsafe. Categories 1, 5, 7, 10 and 13 are
the most direct D3 hazards.

### What hidden assumptions are we making?

That staff can distinguish a continuing relationship outcome from an ask/task;
that future lifecycle rules define competing ordinary work; and that the caller
may observe the result of creation/reuse. Neither prose labels, an existing
profile nor a Supabase client call establishes these facts.

### How does this affect the whole product?

One P27 source serves permitted staff/P28 views. Asks, tasks, participation,
financial facts and permissions retain distinct owners and meanings. Purpose
labels cannot become P12 processing authority or fresh communication receipt
namespaces. No donor/public/CMS form needs a new journey-purpose field.

### How does this affect the end-user experience?

The ordinary case should open the existing permitted relationship and let staff
record the actual ask/action directly. Additional-purpose reasoning appears only
when another journey is deliberately proposed. Multiple open asks, due actions
and permitted relationship people remain discoverable without duplicate entry.

### Does this follow modern best practices?

The evidence supports ongoing partnership with separately tracked requests. It
also exposes MPDX's exclusive-status limitation, which Core should not copy.
Ordinary PostgreSQL keys/constraints/transactions are sufficient building blocks;
no special database engine or purpose ontology is justified. Published examples
and the mechanics experiment are not production performance proof.

### Does this fit Asym’s existing repo and product direction?

Yes, with existing P9/P12/financial/communication boundaries intact. Current task
and profile readers need source qualification. The already identified P9/P28
sharing conflict remains closed to new disclosure until its own explicit owner
amendment; D3 does not resolve it by grouping records.

### Should we adjust the recommendation?

**Accept with the stronger independent-outcome test and the exact boundaries
above.** Keep ordinary work simple. Do not freeze a lifecycle-dependent index,
add a configurable purpose system or automatically consolidate historical records.

## Supabase suitability: smallest sound approach

D3 fits standard relational PostgreSQL. The necessary distinctions are existing
business concepts, not a reason to add a framework:

- A P27 journey references its canonical Party and admitted purpose/ministry
  context. Its source identity, revision and historical meaning remain stable.
- Ordinary support has a source-recognizable identity; localized display text,
  staff, currency and browser request IDs are not its uniqueness discriminator.
- Existing asks, shared tasks, responsibility references and source-linked
  financial/communication facts remain separate. Do not copy arrays of asks,
  grants, gifts or transcript bodies into a journey JSON document.
- The authorized command performs compound writes in one database transaction,
  including durable history/receipt and a required local obligation or owned
  pending exception, with outbox intent where needed. Downstream effects use
  existing qualified owners/executors; no cross-provider transaction is promised.
- Normal same-scope FKs, `NOT NULL`, appropriate checks, B-tree uniqueness and
  measured indexes support these rules. The exact ordinary-work key/predicate
  follows the admitted lifecycle. No extension, new ORM, new Supabase project,
  generic registry, Redis lock or tenant-wide mutex is required by D3.

An additional journey can be represented within the same source model. D3 does
not establish a separate purpose-catalog table, relationship subtype registry or
arbitrary configuration language. Its explanation is not its identity, and a
random new ID is not evidence that a purpose is independent. Admit only meanings
that remain within P27; reference sending, care, deployment or project work owned
elsewhere rather than recreating those domains under “purpose.”

A server-owned database function or another approved transaction-capable path may
serve the qualified command. The architecture—not this grooming note—chooses the
exact path. Several awaited `supabase.from(...).insert(...)` HTTP calls are not
one shared database transaction. Browser `.upsert()` is not a substitute for
source admission, precise returned projection or compound write atomicity.

### Experiment and limits

The synthetic fixture ran on PostgreSQL **17.11** in a container with network
`none`, no published ports and temporary data; it was removed after the run.
The exact image digest, runner, probe and results are retained in
[d3-evidence/database.md](d3-evidence/database.md) and the linked mechanics
artifacts. Its states and key are deliberately hypothetical, not Core schema.

| Observed result                                                                                                                                                 | Consequence for the eventual design                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same-Tenant Party and exact Tenant/Legal Entity ministry composite references rejected wrong scope; required null and referenced-source deletion were rejected. | Encode real source scope structurally; a UUID FK alone is not same-scope proof.                                                                                            |
| `CHECK` alone accepted null; ordinary `UNIQUE` accepted duplicate null keys; `MATCH SIMPLE` skipped a partially null composite FK.                              | Required identity parts need `NOT NULL`; optional tuples need deliberate all-or-none semantics. Do not encode ordinary purpose as an accidental nullable loophole.         |
| `NULLS NOT DISTINCT` rejected duplicate optional null keys; `MATCH FULL` rejected a partially null tuple.                                                       | Standard Postgres can express those semantics when actually needed; neither replaces required non-null identities.                                                         |
| A running-only partial index permitted a paused duplicate, then the original row failed when reopened.                                                          | Lifecycle must determine the predicate; do not copy an `active` index from another domain.                                                                                 |
| Child-write failure rolled back the parent in one transaction; separate autocommit calls retained the parent.                                                   | Qualify the real compound command; sequential client calls are not atomic.                                                                                                 |
| RLS hid an existing row, but uniqueness still produced `23505`; the same role could create an absent key.                                                       | Generic duplicate errors can reveal existence. Authorize admission observability, not merely row lookup.                                                                   |
| A one-statement `INSERT … DO NOTHING` plus fallback CTE read returned nothing during a coordinated insert race, although the row existed.                       | The statement snapshot can miss the winner. Empty result does not mean safe creation failure or absence.                                                                   |
| A separate READ COMMITTED statement saw the winning row; 16 submissions with at most eight concurrent client workers converged on one row.                      | A bounded transactional insert/reload strategy is feasible. The reload and returned fields still require current authorization; this is not a complete production command. |

The race probe uses explicit connection/blocking observation before releasing the
competing transaction. It does not rely on a fixed delay as proof of ordering.
The load case verifies one narrow integrity outcome, **not** a throughput,
latency, capacity or production concurrency claim. The experiments do not cover
Core source grants, exact lifecycle, revocation, operation receipts or provider
effects; those remain release proof below.

### Current vendor guidance, without importing conflicting shortcuts

The current Supabase changelog and relevant changes were fetched. Its table
exposure change began rolling out as the default for new projects on
2026-05-30 and announces
existing-project enforcement on 2026-10-30. Existing objects retain their grants;
on this review date one cannot assume Core has opted in. Explicit grants and
RLS must be inspected regardless. Client automatic GET/HEAD retries do not make
multi-call writes atomic or prove durable business idempotency. Current minor
release guidance was checked; D3 does not require the affected optional extension
features or authorize a deployment upgrade.

Primary PostgreSQL semantics govern over simplified skill/vendor examples:
`USING` checks old-row access; `WITH CHECK` checks the proposed row; omitted
`WITH CHECK` can inherit `USING`; permissive policies combine with OR. A definer
function uses its owner's effective privileges rather than inherently bypassing
all RLS in every configuration. FORCE RLS does not constrain a BYPASSRLS role.
Views, RPC execution grants/search paths, service-role commands and other doors
need their own qualification. Do not grant raw authenticated CRUD simply because
a generic Supabase example uses it; Core requires its existing server authority.

## Individual category review

Each category below is independently evaluated. Severity is the consequence of
the named failure; likelihood is qualitative and conditional on the shortcut,
not measured production prevalence. Critical means possible restricted disclosure
or unauthorized effects; high means substantial integrity/donor-care/operational
harm; medium means material friction or maintenance burden. Findings describe
risks to the developing design, not a claim that D3 already exists in production.

### C01 — Problem validity, necessity and alternatives

**Material concern: yes. High severity; medium likelihood.** Independent
progress/follow-up/ending also describes a particular ask, so the original test
can admit unnecessary journeys. Primary MPDX/Tnt/Reliant special-ask procedures
and current Salesforce/Virtuous solicitation records show simpler records that
already handle those cases. No reviewed source proves generic extra-purpose
machinery necessary for the same pair.

**Effect:** narrows the exception; retains A. **Exact amendment:** “Additional
journeys require a distinct continuing development outcome that existing asks,
tasks, responsibilities and authoritative relationships cannot adequately
represent; independent ask status/deadline alone is insufficient.”

**Proof:** classify annual renewal, equipment request, prayer/financial overlap,
different staff and an actual agency-supplied independent-purpose case. Record
why the latter cannot use simpler records. If no credible case exists, do not
invent a broad purpose builder or claim the exception UX is validated. The
ordinary path does not depend on speculative configurations.

### C02 — Brittleness

**Material concern: yes. High severity; high likelihood if labels and current
people define identity.** Translated names, year labels, stage presets, ministry
participants and Support Binding changes could split or collapse ordinary work.
P9 D19 explicitly separates source identity from those mutable representations;
D2 preserves real intent and history.

**Effect:** preserves A with a source-identity safeguard. **Exact requirement:**
“Resolve the ordinary boundary from canonical source identities and the admitted
lifetime. Renames, tags, years, people, views or bindings alone do not change
purpose identity or free a duplicate slot.”

**Proof:** same ordinary purpose under two languages/names/representatives;
renamed ministry; zero participants; same person in two ministries; changed
binding. Distinct actual ministries remain distinct; routine metadata causes no
new journey, review storm or effect replay.

### C03 — Technical debt

**Material concern: yes. High severity; medium-high likelihood under shortcut
reuse.** Adding purpose strings to legacy profile-keyed donors or treating seed
task screens as durable work makes temporary structures authoritative. Copying
totals, assignment membership, notes or tasks creates parallel correction paths.
Current source inspection confirms these are unqualified seams, not the P27 model.

**Effect:** changes implementation prerequisites, not A. **Exact requirement:**
“Keep the journey thin and source-owned. Reuse canonical Party/ministry,
assignments, tasks, asks and qualified readers; do not make legacy profiles,
local collections or copied financial/interaction state an enrollment authority.”

**Proof:** native flow reaches actual qualified shared services; no writable
portfolio/purpose shadow store; update/correction in the source is reflected
without circular synchronization. Inventory old writers before activation.

### C04 — Edge cases

**Material concern: yes. High severity; medium-high likelihood across a long
relationship.** Prayer continues after giving stops; an equipment ask is declined
while another is pending; a worker leaves; a duplicate Party merge creates two
ordinary journeys; a paused journey competes with new work. These are plausible
pressure tests, not claims of observed agency incidents. D1/D2 and source merge
contracts forbid automatic history/grant transfer.

**Effect:** preserves A; lifecycle/collision semantics need their own decisions.
**Exact requirement:** “Keep partnership meaning, each ask, source instruction
and unfinished obligation separately interpretable. Apply D2's qualified
correction or explicit future disposition; no tag, merge or return event silently
combines histories, resumes work or repeats effects.”

**Proof:** the scenario matrix below, including unknown participation, household/
church contacts, genuine ministry/scope change and post-merge/unmerge edits.

### C05 — Footguns

**Material concern: yes. High severity; high likelihood if the exception is a
free-text escape hatch.** “2027 support,” a new UUID, private visibility or a
second representative could bypass one ordinary journey. A generic UPSERT could
mutate existing purpose/stage while ostensibly creating a record. Constraint
errors could invite staff to archive legitimate work just to proceed.

**Effect:** narrows admission and excludes unsafe convenience behavior.
**Exact requirement:** “A label, identifier, role, privacy need or stage preset
alone cannot establish independence. Creation does not overwrite an existing
journey. Conflicts explain the permitted next action; they never advise changing
purpose or ending work merely to evade a constraint.”

**Proof:** alternative-label and ordinary/extra-discriminator attempts;
unauthorized stage/owner fields in create; stale form; lost response; hidden
existing row. Reject forbidden changes and inspect the resulting database state.

### C06 — Tenant safety

**Material concern: yes—critical. Likelihood medium if only a client Tenant
filter is used.** A journey can reference a Party, ministry, task or ask in
another Tenant/entity; caches, duplicate suggestions or automation can return
another context's result. P9 ministry is exactly Tenant/Legal Entity scoped;
Party may be Tenant-scoped and must not gain a fictional Legal Entity column.

**Effect:** inherited safeguard. **Exact requirement:** “Derive current actor and
Tenant/context from trusted server evidence; validate requested target/action
against its actual source scope. Enforce same-Tenant Party and exact scoped
ministry/owner relationships, and qualify links to child work. Scope caches,
cursors, jobs and returned projections to current authority.”

**Proof:** two Tenants, two entities within one Tenant, same visible names,
wrong-source IDs, mixed imports and same-user context switches with late replies.
Direct SQL must reject scope inconsistency independently of browser behavior.

### C07 — Database, RLS and authorization safety

**Material concern: yes—critical. Likelihood high if ordinary CRUD/UPSERT is
substituted for source admission.** Required nullable keys, incomplete composite
FKs and broad policy composition can permit invalid states. A visible extra
journey could be updated into forbidden scope or ordinary identity. Service-role
or definer paths can bypass application assumptions. The isolated experiment
proved null/FK/uniqueness mechanics, not Core authorization.

**Effect:** preserve A; require the smallest adequate relational enforcement.
**Exact requirement:** “Required source identifiers are non-null and constrained
against their owners' matching scope. Optional composite references are entirely
absent or entirely valid. Check allowed old and resulting row state for every
mutation. Exact admitted ordinary identity/lifetime is database-enforced once
settled; mutable prose, request IDs or visibility are not that identity.”

Retain original actor/source evidence through owner-governed correction/retention;
restrict destructive parent deletion rather than cascading away cultivation
history. Derive attribution/approval evidence from trusted context. A user may
request a responsible person; the owner validates and resolves that assignment
rather than treating the supplied ID as authority. No D3 amount column or money
ledger is needed; any later monetary data follows exact source minor units,
currency and period. Index actual scoped access/FK paths; PostgreSQL does not
automatically index the referencing side, and a column occurring somewhere in an
index does not prove the query is supported.

Inventory actual grants, all applicable RLS policies, exposed REST/GraphQL,
views, invoker/definer functions, execute privileges, search paths, collections,
service commands, jobs and Storage/exports where used. Test INSERT, UPDATE,
DELETE, UPSERT and RETURNING, including ordinary/extra conversion and scope
swaps. Coarse RLS is defense within P12, not a second permissions engine.

**Hidden-existing conflict:** RLS-safe SELECT returning no row plus INSERT
conflict still reveals existence; hiding the error text alone is insufficient.
**Exact requirement:** “Independently authorize the command and the minimum
metadata its result reveals. Where that authority is absent, deny/defer equally
before revealing whether a hidden ordinary journey exists. Authorized metadata
reuse does not grant content/history/edit rights. Do not invent a coordinator
grant, new routine approval queue or duplicate to bypass denied work.” Trusted
internal lookup may obtain protected evidence for the owner decision; the rule
concerns disclosure, not an impossible prohibition on internal source reads.

**Proof:** real catalog/role/resulting-row tests plus paired absent/hidden-record
fixtures with indistinguishable unauthorized outcomes. Test metadata-permitted/
content-denied users as well as all-visible/all-hidden cases. Qualify current
P12 source admission before activation; no raw unique error or service-key
success counts as authority.

### C08 — Overengineering

**Material concern: yes. Medium-high severity; high likelihood if “purpose”
becomes a platform.** A configurable taxonomy, purpose registry, dedicated
scheduler, generalized merge/succession graph, per-mode pipeline or new approval
system adds maintenance before a real need is demonstrated. Existing asks/tasks/
relationships already cover the ordinary examples; D3's database building
blocks are standard PostgreSQL.

**Effect:** constrains implementation scope. **Exact requirement:** “Use the
existing enrollment source with a bounded ordinary-purpose rule and an
explainable exception. Do not require a purpose catalog, stage builder, new
permissions service or routine manager approval to record ordinary partnership
work. Add no abstraction solely to represent an unverified ministry scenario.”

**Proof:** ordinary create/reuse and ask/follow-up work without configuring
purpose types, installing optional products or requesting new approvals. Review
each proposed new object against an actual unmet outcome. Preserve future
qualified purposes without building speculative machinery now.

### C09 — UX/UI and user friction

**Material concern: yes. High severity for wrong action/disclosure; otherwise
medium. Likelihood high if a generic pipeline UI is copied.** One “Declined”
status could obscure which ask failed; purpose jargon and duplicate prompts can
cause unnecessary records. Mobile users can lose changes or act twice after a
connection failure. These are documented design hazards, not measured rates.

**Effect:** preserve A with concrete usability outcomes. **Exact requirement:**
“Present the ordinary partnership as the default context. Make individual ask
states, responsible people and due/blocked work understandable together. Offer
existing work only within current permission. Request a concise explanation of
separate continuing purpose only when another journey is proposed; no mandatory
essay, configuration wizard or per-save confirmation.”

Use the established shared shell/Base UI controls. Support keyboard and
click/tap alternatives to drag, unobscured focus, error associations, announced
status, narrow screens and zoom. Preserve full permitted names/aliases, local
scripts, source international addresses and date-only versus instant semantics;
no forced Western name splitting or new address requirement. Show pending,
confirmed, rejected and unconfirmed outcomes; retry the same intent, preserve
still-authorized input and reject old-scope responses. No silent offline replay.

**Proof:** staff/missionary role-scoped cases with prayer plus regular giving,
two differently resolved asks and a blocked action; 320px/400% zoom, keyboard,
screen reader, touch without drag, long/RTL names and poor connection. Record
observed assistance, errors and time; no invented improvement percentage. D3
adds no step to donation checkout or public forms.

### C10 — Source of truth, ownership and domain invariants

**Material concern: yes—critical if purpose becomes authority. Likelihood
medium-high.** Relationship purpose, P12 processing purpose, financial designation
and durable effect identity are different facts. Reusing one generic string or
current label across them can widen access, redirect money or repeat delivery.
“One journey” could also become one source for everything it displays.

**Effect:** inherited separation plus explicit D3 meaning.
**Exact requirement:** “P27 owns development purpose and journey/ask meaning;
P9 owns Party/ministry/relationships/assignments/shared work; P12 owns current
processing authority; financial and communication owners own their facts. A
purpose correction or extra journey does not create a new authorization,
financial destination or receipt namespace. Derived views never become writers.”

**Proof:** editing a purpose label changes no grant, contact restriction,
Designation, commitment, accepted effect or source history. Distinct asks can
have independent outcomes; one actual source gift/encounter remains one source
fact. Exact invariants are collected below.

### C11 — Hidden coupling

**Material concern: yes. High severity; medium likelihood.** Journey identity
could depend on staff versus missionary preset, Stage/Workflow Studio
configuration, Page publication, financial binding or a directory event. Closing
a journey could accidentally cancel a commitment or church relationship. These
owners are deliberately separate in v3, ADR-0136 and D2.

**Effect:** preserves native independence. **Exact requirement:** “A new preset,
role, surface, Site, directory assignment, Page or Support Binding does not by
itself create or retarget cultivation. Native ordinary partnership and follow-up
use qualified core owners without P34/P40/P42 or public/financial setup. Optional
consumers reuse the same source and admitted effects.”

**Proof:** native flow with optional products disabled, no Page/binding; change
presentation/role; retire/rebind source under its owner; no stage reset,
financial mutation or duplicate journey follows. Missing required source is
unavailable rather than a legacy profile fallback.

### C12 — Failure modes

**Material concern: yes. High severity; high likelihood without atomic compound
writes and recovery.** A journey can be saved without required history/work; a
task may exist without its links; a lost response can prompt duplicate creation.
A provider may have accepted a message while Core sees a timeout. The current
separate task insert/link/event calls and the experiment demonstrate why client
sequencing is insufficient.

**Effect:** require existing durable-command patterns. **Exact requirement:**
“Commit source mutation, attributable history/receipt and required local work or
owned pending exception atomically, with necessary outbox intent. Required
secondary effects remain visibly pending/blocked until their owner confirms
outcome; retry resolves the same business intent. No false success or blind resend
after ambiguous external acceptance.”

**Proof:** failure before/after each commit, child failure, outbox handoff,
response loss, provider timeout/outage and recovery. Authorized staff can identify
what committed and what remains uncertain. Do not promise a distributed
transaction or universal exactly-once network delivery.

### C13 — Lifecycle, temporal correctness, concurrency and idempotency

**Material concern: yes. High severity; high likelihood under shared editing and
retries.** Active-only uniqueness can let pause create duplicates; reopening can
collide; concurrent correction/merge/admission can overwrite work. A one-query
insert-or-read CTE can miss a concurrent winner. Renaming or moving a journey
must not create a fresh message identity. The experiment directly demonstrated
only the running-only partial-index pause/reopen collision and the CTE snapshot
miss in this category; it did not test Core merge, correction or message identity.

**Effect:** preserve A but prohibit premature lifetime/schema assumptions.
**Exact requirement:** “Define current/paused/ended/reopened/corrected/merged
collision outcomes before choosing the exact unique predicate. Use expected
source revisions and a qualified transaction with bounded retry/reload semantics.
No label, new request, annual date, archive flag or producer change makes the same
intended work new. Reuse revalidates current authority; same-key/different-content
requests conflict rather than silently overwrite.”

Journey admission dedupe is distinct from ask/task/message effects. One journey
may have many legitimate effects; two journeys/producers may request the same
single intended source effect. Work leases prevent concurrent attempts only;
expired leases do not make accepted effects repeatable. Define causal commit
orders for revoke/admit/edit/dispatch, retain prior accepted receipts and reject
stale new effects. Late/backdated imports cannot roll back newer source meaning.
Dates and scheduled boundaries use source-owned timezone/instant semantics.

**Proof:** independent connection barriers for create, pause/create/resume,
end/create/reopen, correction, merge/unmerge, retirement, task completion and
revocation; repeated native/Studio/import events; lost response; late pre-close
event. Test actual lifecycle states once chosen. The scratch fixture's states
and index are not that decision or integrated concurrency proof.

### C14 — Data integrity risks

**Material concern: yes. High severity; medium-high likelihood during merge or
import.** Two duplicate Parties may each have ordinary journeys. Repointing both
can conflict; silently merging them may mix private history and repeated tasks.
Conversely, two free-text purpose labels can hide the same relationship. #512
permits only source-approved mutable repair; it is not a P27 journey merge policy.

**Effect:** require a narrow P27 consumer contract with the existing merge owner.
**Exact requirement:** “Inventory P27 references and qualify collision handling
under the existing Party merge/correction process. Preserve original evidence,
asks, actors and accepted effects. No automatic journey/history/grant union or
name/tag-based consolidation. Keep unresolved source meaning explicit without
fabricating another purpose to evade a conflict.”

**Proof:** merge duplicate Parties with two ordinary journeys and differing
permissions/asks; unmerge after later edits; repeated repair; wrong association;
import with ambiguous profile-to-ministry mapping. Corrections remain attributable
and unrelated valid work stays usable. No new generic merge engine is needed.

### C15 — Security and privacy risks

**Material concern: yes—critical. Likelihood medium-high if “shared journey”
means shared audience.** Purpose labels/reasons/counts can disclose restricted
worker or donor circumstances. Prayer information may be sensitive. A task
participant may read safe instructions but lack stage-edit or financial access.
A private-purpose copy can become a workaround for inadequate permissions.

**Effect:** inherited P3/P10/P12 floors; no new sharing approval.
**Exact requirement:** “One journey does not unify read/edit/history rights.
Classify and minimize purpose metadata; do not copy private narratives into
names/reasons. Apply current field/source, door-declared processing-purpose,
legal-basis and residency floors to every governed read/action/egress; apply
contactability at its owning communication boundaries.
Confidentiality alone is not another purpose. Restricted aliases have no legal-name
fallback.”

Include briefs, filters/counts/rankings, notifications, files, exports, URLs,
logs, caches, backups and derived copies. Restricted decrypt/read-audit paths
remain with their owners; no raw secret/ciphertext exposure or claimed guarantee
that previously downloaded bytes can be recalled. Retention/erasure/redaction
must reach newly served derivatives under owner policy.

**Proof:** hidden source added to otherwise identical permitted dataset changes
no unauthorized observable result; safe task with hidden ask/financial/private
context; malicious purpose edit; valid role but forbidden legal purpose/residency;
revocation and same-user context switch. No ministry participation, business responsibility or display-role change
implicitly grants unrelated access; deliberate P12 access changes use their
owner commands.

### C16 — Scalability and performance risks

**Material concern: yes. High severity for wrong aggregates; medium for capacity.
Likelihood medium-high if loaded pages or broad scans become authority.** Current
readers cap gifts at 100, activities/pledges at 50 and reports at 5,000 rows;
those cannot establish whole-history or portfolio totals. Duplicate detection
by fetching all journeys or locking an entire Tenant scales poorly and leaks.

**Effect:** implementation qualification, not speculative infrastructure.
**Exact requirement:** “Use source-complete permitted projections, scoped indexed
admission and bounded pagination/batches. Show unavailable/truncated coverage;
never turn unknown into zero. Do not add per-row permission query loops,
whole-Tenant duplicate scans or global serialization for a narrow key.”

Inspect actual query plans and index order/selectivity; partial-index use depends
on the query proving its predicate and on prepared-query planning. Measure
large/skewed tenant and multi-tenant workloads against explicit pre-release
latency/resource budgets with units, distributions and concurrency. No index-count,
P95, rows-per-second or capacity promise is chosen from this decision. The 16
submissions/eight-worker experiment proves no performance threshold.

**Proof:** beyond-cap source reconciliation, hidden-record noninterference,
production-shaped plans/data/concurrent interactive and batch work, bounded
retries under contention. Release evidence names the workload and measured budget.

### C17 — Operational burden

**Material concern: yes. Medium-high severity; high likelihood if each exception
needs approval or each journey adds redundant tasks.** Staff could administer a
purpose catalog, repair hidden duplicates manually, or maintain a fake umbrella
task in addition to all actual ask work. Missing eligible ownership could make
work disappear. Existing shared tasks/assignments should carry actual work.

**Effect:** narrow the operational path. **Exact requirement:** “Use existing
appropriate source-linked work to satisfy the next-action requirement; show other
obligations without duplicating them. Add no routine approval or new queue.
If no existing eligible person/queue can receive work, preserve an authorized
visible needs-assignment exception. Repair through qualified source commands,
not recurring direct database edits.”

**Proof:** several asks without an extra coordination task; one legitimate meeting
addresses specified matters but leaves other obligations open; owner leaves;
no eligible queue exists; correction/import ambiguity. Ordinary users can recover
without learning database internals or re-entering the relationship.

### C18 — Observability and auditability gaps

**Material concern: yes. High severity; medium likelihood if request logs stand
in for business evidence.** A rejected/reused/created journey may look the same
to authorized operators; a retried request may record a new creator; a failed
secondary effect can remain hidden. Purpose explanations can leak in telemetry.

**Effect:** require durable attributable outcomes, not a new logging product.
**Exact requirement:** “Record source admission/correction and effect outcomes
with original trusted actor, scope, source revision, operation/effect identity
and minimal reason in durable owner history. Technical traces and security audit
remain distinct. Expose pending/failed/unknown work to its authorized owner;
diagnostics contain no unnecessary private content.”

**Proof:** lost response/retry preserves original creation actor and one receipt;
source change and downstream failure can be correlated; unauthorized logs/export
show no private purpose; an operator can safely distinguish committed work from
an unconfirmed outcome and use a supported repair command.

### C19 — Dependency and integration risks

**Material concern: yes. High severity; medium likelihood if vendor/client
behavior is treated as product authority.** Supabase retries do not deduplicate
business writes; provider webhooks can be delayed/duplicated/contradictory. CRM
“funded” labels can include pledges; CMS role/Page control does not grant CRM
access. Unqualified P9/P12 sources cannot be replaced with provider/profile data.

**Effect:** preserve source contracts and limit dependencies.
**Exact requirement:** “Core owns journey admission and intended effects; each
provider owns its external outcome evidence. Reconcile through the qualified
financial/communication owner, retaining source event/receipt identity and current
restrictions. Optional workflows use the same source commands. Check actual
installed/deployed versions and grants, not generic current documentation alone.”

**Proof:** duplicate/out-of-order webhook, lost callback and ambiguous external
success; ordinary flow without optional products; explicit unavailable source;
new/existing Supabase table grants across changed defaults; no provider status,
raw callback or CMS edit changes journey/financial truth automatically.

### C20 — Migration, rollout and upgrade risks

**Material concern: yes. High severity; high likelihood if D3 is treated as a
bulk-collapse rule.** Legacy prayer/financial labels, profiles and assignments do
not identify which rows represent one ordinary journey. Importing each as a
purpose creates false work; collapsing by name erases evidence. Old writers or
restored snapshots can revive revoked consent, redacted content and completed
messages. A valid new unique index can also fail on retained collisions.

**Effect:** required migration/activation boundaries, not a current migration.
**Exact requirement:** “Inventory retained sources/writers, map only evidenced
identities/meaning and preserve unresolved associations for authorized repair.
Backfill creates no new approved journey meaning, stage transition, task or
outreach. Qualify collisions before validation/activation; do not delete evidence
to make a constraint install.”

Use compatible additive staging where appropriate, resumable idempotent batches
and reconciliation; fence incompatible old clients/privileged writers before new
authority is active. Test mixed versions explicitly. Kill switches stop new
affected admission/effects while preserving authorized reads/reconciliation.
After new data is accepted, prefer safe roll-forward; rollback cannot restore a
weaker writer or erase new history. Restore reconciles current retention/erasure/
redaction, revocation/suppression, source revisions and effect receipts before
re-enabling affected paths; unknown current disposition keeps them unavailable.

**Proof:** repeated/interrupted mapping, retained duplicates/unknown times,
profile-to-many-ministries, old/new code-schema combinations, disable after
commit and restore before redaction while viewer still has a valid grant. No
replayed outreach, history union, revived content or lost real obligation.

### C21 — Testability, traceability and proof

**Material concern: yes. High severity; high likelihood if passing a toy database
probe or documentation checks is described as feature readiness.** The experiment
has no Core source/PDP/auth/session/browser/provider path. Unit stubs and migration
string tests cannot prove tenant safety or user outcomes. Proposed wording can
also drift into glossary/spec/tickets without ratification.

**Effect:** explicit proof and decision-status discipline.
**Exact requirement:** “Trace D3 and each constraint/outcome through the grooming
record, glossary after ratification, any necessary owner amendment, authorized
OpenSpec/design/tasks/issues, implementation tests and release evidence. Label
repository intent, current source, experiment observation, inference and unknown
separately. No mocked, skipped or demo bypass flow counts as qualification.”

**Proof:** real source-backed DB/API/browser paths, negative authorization,
independent-connection barriers, source corrections/migration/restore, accessibility
and representative mission-user tasks. The source appendix and probe are
reproducible evidence of mechanics only. Preserve D1/D2 and current phase/owner
terminology; the P9/P28 sharing proposal remains unratified.

### C22 — Other development hazards

**Material concern: yes. High severity; medium likelihood for recovery/egress
bypasses.** Administrative tools, imports, diagnostics, future projections or
restores can bypass the ordinary command. “Simplifying” faith-related information
can unnecessarily collect prayer/relational detail or turn participation into a
ranking. Most such hazards overlap C07/C15/C20; no additional independent
platform/vendor hazard requiring new infrastructure was established.

**Effect:** retain A with the same source boundary everywhere.
**Exact requirement:** “Administrative/import/recovery paths obey the same
admitted identity, authority, attribution and effect invariants. Collect only
purposeful source-supported partnership information; do not infer prayer,
spiritual commitment or human worth. New transports/projections require owner
qualification and admitted data placement.”

**Proof:** admin/import bypass attempt, restricted diagnostic/backup placement,
restored stale purpose, unauthorized export and source-retention expiry. Existing
owner restrictions apply even when the UI is absent.

## Ownership and invariants to preserve

| Authoritative fact                                                             | Owner                                 | D3 invariant                                                                                                           |
| ------------------------------------------------------------------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Party identity/relationships and ministry identity/lifecycle                   | P9 and accepted identity predecessors | Same canonical scope; identity is not a name/profile/current participant.                                              |
| Ordinary/independent development purpose, journey and ask meaning              | P27                                   | One source; independent ask meanings survive the unified relationship.                                                 |
| Staff assignment, shared tasks/activity and portfolio lens                     | P9/shared owners                      | Multiple role-qualified assignments and existing primary rule; no writable portfolio or copied task/encounter history. |
| Processing purpose, current action/field/history/classification/residency      | P3/P10/P12 and referenced owners      | Grouping/deduplication grants nothing; each observable result is independently authorized.                             |
| Received contributions/designation lines, recognition, commitments/fulfillment | P13/P14/P16; ADR-0206                 | No D3 money write, double coverage, pledge-as-cash, silent FX or unknown-as-zero.                                      |
| Financial support binding                                                      | P21 with P9/P12                       | Optional source reference; no identity/permission/financial succession by grouping.                                    |
| Communication eligibility/content/delivery                                     | P6/P17 and applicable channel owners  | Readable does not mean contactable; fire-time restrictions and permanent effect receipts remain current.               |
| Public/CMS publication, care, deployment/application work                      | Their existing owners                 | No private journey publication or new source authority through a purpose label.                                        |

Development encounter/reference ownership and the exact P27/P28 write/read
contract require qualification against P9 and the applicable communication or
manual-interaction source. Reusing one real encounter establishes neither a
universal encounter store nor sharing permission; the original privacy research
records that exact source seam as unresolved.

Always true: same declared ordinary intent cannot multiply through concurrent
callers or labels; genuinely distinct admitted purposes remain possible; there
is no global Party stage; financial/prayer participation and each ask outcome
are independently meaningful; one journey can contain several legitimate open
actions; completing one action affects only work it actually satisfies; ordinary
uniqueness does not automatically establish historical lifetime; private data
and grants do not merge; original accepted facts retain meaning under correction
and owner retention; one real financial/effect source is not counted or executed
twice merely because it appears in multiple development contexts.

Purpose admission, source-money coverage and intended communication identity are
three separate deduplication problems. A unique enrollment key cannot solve all
three. No new money/recognition/consent rule is admitted by D3.

## Scenario pressure tests

These are illustrative acceptance cases, not invented claims about universal
mission practice. The ordinary partnership examples are supported by published
procedures; the precise Core outcomes are product judgments within its owners.

| Scenario                                                                        | Required outcome                                                                                                                                      |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prayer partner also begins giving                                               | Same ordinary relationship can express both; no inferred prayer evidence, consent or automatic stage change.                                          |
| Monthly supporter declines equipment request while annual increase is pending   | Distinct ask outcomes; continuing relationship and commitment remain accurate.                                                                        |
| Financial support stops; permitted prayer/nonfinancial partnership continues    | No automatic whole-relationship failure/closure; honor actual restrictions.                                                                           |
| Another representative or missionary uses a different preset                    | Same underlying ordinary source and independently authorized view; no new journey or second writable stage merely for presentation.                   |
| A request has its own deadline, owner and tasks                                 | These alone are ordinary ask/work properties; no exceptional journey justified.                                                                       |
| Actual continuing outcome cannot be managed adequately through existing records | Deliberate bounded independent-purpose admission with source meaning, not a new generic purpose system.                                               |
| Sending church also gives                                                       | Preserve separate sending relationship/operational responsibilities with their owners; no automatic second development journey or member-gift access. |
| Confidential detail within ordinary partnership                                 | Preserve field/source privacy; neither another fake purpose nor shared full history.                                                                  |
| Existing ordinary journey invisible to proposed creator                         | No hidden-record oracle, unauthorized reuse or duplicate workaround; the same minimum-authority rule applies whether it exists or not.                |
| Existing metadata visible but history/stage edits forbidden                     | Return only admitted reuse metadata; no automatic contents/action grant.                                                                              |
| Two authorized creators, network retry, native plus Studio                      | One admitted ordinary effect; durable receipt/reload resolves the actual outcome.                                                                     |
| Several genuine tasks; one meeting covers two matters                           | Reuse one actual encounter where allowed; only addressed obligations complete; others remain visible.                                                 |
| Pause/create/resume or end/create/reopen race                                   | Apply the separately ratified lifecycle/collision rule, preserving history and open work; no constraint-driven invented policy.                       |
| Duplicate Party merge yields two ordinary journeys                              | Qualified existing-owner collision handling; no silent history/grant/effect merge.                                                                    |
| Wrong purpose versus genuinely changed future purpose                           | Attributable correction versus D2 explicit future disposition; no financial/consent rewrite.                                                          |
| Historical prayer/financial tags imported                                       | Do not infer two journeys or a consolidated authoritative history; no new outreach from import.                                                       |
| Restore predates revocation, erasure or completed message                       | Reconcile current owner dispositions before serving/acting; old purpose does not resurrect access/content/effects.                                    |

## Ruthless synthesis: ordered permanent path

1. **Completed 2026-10-09 — D3 ratified:** the founder explicitly accepted the
   tightened independent continuing-outcome test. The founder's A selection is
   preserved; this is not a lifetime single-row rule. The recorded default does
   not implicitly approve sharing, lifecycle or an arbitrary purpose catalog.
2. **In the remaining grooming, before formal specification:** settle source
   entry/admission and its permitted create/reuse observability, then exact
   lifecycle and competing-work outcomes; resolve stage/ask/action presentation
   and sharing in their own decisions. These dependencies are necessary to
   choose a physical uniqueness rule, not a reason to ask the founder for SQL.
   Validate the exceptional-purpose meaning against an actual intended-user
   case; do not manufacture a use case or gate ordinary work on an engine.
3. **In an authorized spec/design:** encode the ordinary/independent boundary,
   ownership and each C01–C22 acceptance outcome; extend the existing source
   merge/reference inventory narrowly. Qualify the exact P9/P12/shared-task seams
   and optional readers consumed. No broad future-phase dependency replaces an
   exact required contract. Do not create issues until `/to-issues`.
4. **In implementation:** choose the smallest normal relational representation
   matching those decisions. Use non-null scoped references, appropriate unique
   constraints/indexes, trusted current-authority source commands, one local
   transaction for compound acceptance/history/work, durable receipts/outbox and
   existing executors. Build one clear ordinary UX and a bounded exceptional
   operation; no routine manager step or free-form purpose platform.
5. **Before activation:** prove real database/authorization/concurrency/recovery,
   migrations/restores, accessible browser flows and representative field tasks.
   Inventory/fence old writers, stage constraints safely and use an effect kill
   switch with preserved reconciliation. Measure the actual workload and budgets.
   The experiment proves feasibility of components; it cannot waive these gates.

**No material correctness or privacy finding is deferred to monitoring.** Each
is a prevention or activation requirement. Existing operational monitoring should
supplement them with these precise signals; concrete duty assignments must exist
before release:

| Signal                                                                              | Threshold                                   | Owner                                                          | Response                                                                                                    |
| ----------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Confirmed duplicate current ordinary intent or duplicated accepted source effect    | One confirmed violation                     | P27 source owner; relevant shared executor/communication owner | Fence affected admission/dispatch, preserve receipts, reconcile through owner commands and requalify.       |
| Confirmed forbidden disclosure, hidden-existence oracle or stale-authority mutation | One confirmed occurrence                    | P12/security owner with offending source owner                 | Contain the affected path, retain minimal evidence, apply incident/correction process and requalify.        |
| Active journey has neither appropriate due work nor owned actionable exception      | One authoritative invariant violation       | P27 operations/shared-task owner                               | Expose permitted repair, restore actual obligation without duplicating it, investigate acceptance boundary. |
| Owned exception remains unresolved beyond its recorded review deadline              | First evaluation after that deadline        | Recorded eligible responsible person/queue                     | Escalate through existing source-owned work; keep blocked outreach blocked.                                 |
| A projection asserted complete disagrees with authoritative source reconciliation   | Any verified missing/duplicate covered fact | Owning reader and P27 reporting owner                          | Withdraw complete/total claim, show incomplete/unavailable coverage, correct and rebuild the derived view.  |

These are correctness predicates or source-owned deadlines, not invented SLAs.
Performance alerts require measured, approved numeric budgets before activation;
there is no unowned “watch it later” item.

## Evidence, proof and traceability

| Artifact                                                     | Scope                                                                                                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [Identity and lifecycle review](d3-evidence/identity.md)     | Ratified owners, exact OpenSpec references, current issue bodies, purpose/lifetime/correction/merge distinction.                         |
| [Database and mechanics review](d3-evidence/database.md)     | Current stack/source inspection, primary PostgreSQL/Supabase docs, experiment artifacts and strict proof limits.                         |
| [Authorization/privacy review](d3-evidence/authorization.md) | All-door/current-row/proposed-row constraints, hidden admission oracle, metadata-only authority, field/purpose/residency/restore floors. |
| [Financial/effect review](d3-evidence/financial.md)          | Separate money conservation, contact restrictions, task minimalism and permanent effect identity.                                        |
| [UX/comparative practice review](d3-evidence/ux.md)          | Current official nonprofit product documentation, strongest simpler alternative, mobile/accessibility/pilot outcomes.                    |
| [Missions practice review](d3-evidence/ministry.md)          | Current OMF/Reliant/MPDX/Tnt evidence, regional/historical limits, absence of a proven generic extra-purpose need.                       |

Primary technical sources include [PostgreSQL 17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html),
[partial indexes](https://www.postgresql.org/docs/17/indexes-partial.html),
[INSERT](https://www.postgresql.org/docs/17/sql-insert.html),
[transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html),
[row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html),
[CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html),
[Supabase database functions](https://supabase.com/docs/guides/database/functions),
[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[Data API exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
and [client retry scope](https://supabase.com/changelog/45071-automatic-postgrest-retries-for-transient-errors).

Primary practice sources include [OMF worker partnership](https://omf.org/get-involved/support-a-worker/),
[MPDX partnership statuses](https://help.mpdx.org/article/162-mpdx-status-mpd-phase),
[MPDX appeals](https://help.mpdx.org/article/190-set-up-appeal),
[Tnt campaigns](https://www.tntware.com/tntconnect/help/en/pages/campaignsoverview.aspx),
[Reliant special-ask training](https://solomon.reliant.org/pages/releaseview.action?pageId=106367316)
and [current Salesforce nonprofit solicitations](https://trailhead.salesforce.com/content/learn/modules/nonprofit-cloud-philanthropy-and-partnerships/work-with-prospects-and-donors).
Dates, scope limits and additional Blackbaud/Virtuous/WCAG/GOV.UK sources are
retained in the appendices. No unverified portfolio/performance statistic is used.

D3 traceability starts in the [grooming log](phase27-grill-log.md) and this exact
ratified wording. The root glossary now records the crystallized meaning only,
without SQL or plans. Later `/to-prd` and `/to-issues`
artifacts must map these concern IDs to requirements, scenarios, design/tasks,
implementation tests and release evidence. Reusing existing ADR-0136 needs no
new ADR merely to repeat it; any genuine accepted cross-owner change follows its
owner process. D3 does not silently ratify the separate sharing amendment.

## Completion and verification

Independent source-contract, authorization and missions reviewers checked the
synthesized decision. Their corrections were reconciled: communication opt-out
does not block otherwise authorized internal/self-service access; deliberate P12
access changes remain distinct from ministry/business roles; and development
encounter ownership still needs exact source qualification. No additional
material defect was identified in the bounded decision after those corrections.

The database experiment passed all 21 explicitly described mechanics checks with
connection-blocking barriers; exact version/digest, scripts/results and verified
container cleanup are preserved. All 22 requested categories and seven required
adversarial headings are present. Scoped formatting, local-link, artifact
consistency and whitespace checks passed. These documentation/mechanics checks
are not a Core/Supabase application, security, performance or user-pilot release
qualification. No application source, production schema, formal spec or GitHub
issue was changed.
