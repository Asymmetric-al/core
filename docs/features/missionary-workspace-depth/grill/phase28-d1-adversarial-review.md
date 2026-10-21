# Phase 28 D1 — restricted start: adversarial decision review

**Disposition: Accept with required amendments.**

The founder selected A: restricted prospect preparation before deliberate
sharing. The decision survives this review. It needs a precise protection for
newly supplied identity, contact details and planning, implemented through the
existing CRM and permission owners. A privacy flag on a legacy donor row, or
private notes beside immediately shared contact details, would not deliver A.

This is the finished research/decision review for D1, not a formal Phase 28
specification, approved owner amendment, implementation, issue proposal or
release qualification. `/to-prd` and `/to-issues` remain separate transitions.

Reviewed October 15, 2026 America/Los_Angeles (October 16 UTC), against
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. Research artifacts and a disposable
database probe, plus the glossary clarification, are the only changes. No GitHub state, live data, provider
configuration or supporter communication was changed.

## Corrected decision to record

**Subsequent decision:** [D2](phase28-d2-adversarial-review.md) now resolves the
ordinary sharing destination as general staff CRM availability, with optional
notification to selected staff. D1 remains the dated restricted-start decision;
its previously unanswered sharing audience is no longer an open question.
The later [D3 review](phase28-d3-adversarial-review.md) records the founder's
selection of no new exceptional continuity access on departure/incapacity;
cleanup and retention remain distinct choices.

> **D1 — Restricted prospect preparation.** A currently authorized missionary
> may save early prospect preparation inside the sending organization's native
> CRM. The newly supplied name/contact assertions and prospecting context start
> restricted from ordinary relationship-staff access, not merely hidden on one
> screen. The same boundary covers their discovery and derived information.
>
> Existing independently authorized organizational records about the same person
> retain their own access and meaning. Saving preparation does not publish newly
> supplied identity/contact assertions to ordinary staff or authorize changes to
> independently authoritative canonical facts. It cannot expose a hidden match,
> claim ownership of a person, create a duplicate partnership, or imply consent,
> giving, cultivation enrollment, publication or coaching access.
>
> Existing owners retain their boundaries: Phase 9 owns CRM contact/relationship
> sources, Phase 4 retains identity resolution/repair, Phase 12 retains current
> access, and Phase 28 supplies the workspace experience. Restricted start does
> not authorize another person master, private CRM, consent store or task engine.
>
> Sharing is deliberate and source-authorized, with an understandable audience
> and exact permitted facts. It does not publish private notes or earlier private
> history. Canonical resolution/admission remains a distinct owner-controlled
> consequence; D1 does not choose its trigger or additional disclosure. D1 grants
> no new exceptional staff, spouse, coach or successor rights and does not select
> a sharing audience, retention period or departure-disclosure policy.
>
> Ordinary entry must be short, accessible and recoverable. Saved means the
> source acknowledged the restricted preparation; unresolved identity or a
> failed refresh does not change that fact. Unknown save outcomes reconcile the
> same operation. Current access is required again for reads, changes and result
> recovery. No private offline replay or automatic outward effect follows.

The first paragraph records the founder's selected product direction. The rest
preserves inherited source/privacy boundaries and states the review's required
save/recovery safeguards. It does not ratify an additional source model or
admission policy.

**Engineering recommendation, separate from the selected decision:** use a
bounded P9-owned preparation entry for unresolved assertions, with qualified
canonical reuse when available. Under this recommended design, saving the
preparation alone does not write canonical identity/contact facts. This is not
a claim that P9/P12 already implement that source. Its coordinated owner
extension belongs in the later authorized specification. Material new
audience/exception/lifecycle choices have not been approved by calling them
safeguards.

## Evidence and confidence

| Evidence class                  | What was established                                                                                                                                                                              | What was not established                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder decision                | A was explicitly selected, with Supabase safety and excellent UX required.                                                                                                                        | Extra staff access, sharing recipients, retention duration or successor access were not selected.                                             |
| Accepted repository intent      | ADR-0001; platform intent/principles/boundaries/surfaces; P3/4/9/10/12, P27 source/context/assignment contracts; current P28 roadmap; ADR-0211. Exact inspected clauses are in the source notes.  | A source document is not proof of implemented access or a hosted migration.                                                                   |
| Current code and migrations     | Actual missionary, staff, note, task, audit and cache paths were traced. Broad readers and legacy write paths are concrete obstacles to reusing those paths unchanged.                            | No production exposure, retained-data volume or hosted effective-grant census is claimed.                                                     |
| Primary technical documentation | Current Supabase docs/changelog and PostgreSQL 17 policy, view, function and transaction semantics were checked. Repository declares PG17, supabase-js 2.117.3 and SSR 0.12.7.                    | Hosted versions/configuration are unknown; generic documentation is not Core authorization proof.                                             |
| Executed database evidence      | Disposable network-isolated PostgreSQL 17.11, actual SQL roles, safe/unsafe comparisons and controlled two-session races. See the probe's machine-readable results.                               | This is engine-mechanics proof, not Core services, Supabase Auth JWTs, PostgREST, Realtime, Storage or application integration qualification. |
| Comparable products and UX      | Current primary Salesforce, Virtuous, Bloomerang and other relevant CRM documentation; WCAG, W3C internationalization, GOV.UK, Apple and Microsoft guidance.                                      | No authenticated competitor workflow, missionary interview, pilot, conversion improvement or task-time claim was invented.                    |
| Product judgment                | Restricted preparation can support tentative relationship work without ordinary early staff disclosure. A bounded source is less coupled than immediately creating a globally discoverable Party. | Benefit, adoption, actual operating cost and target-user comprehension remain hypotheses to test.                                             |

Detailed evidence:
[current runtime](d1-evidence/current-runtime.md),
[owner boundaries](d1-evidence/owner-boundaries.md),
[lifecycle and disclosure](d1-evidence/lifecycle-disclosure.md),
[UX research](d1-evidence/ux-research.md),
[product challenge](d1-evidence/product-synthesis.md),
[technical primary sources](d1-evidence/technical-research.md),
[PostgreSQL probe](d1-evidence/postgres-probe/README.md).

### What the database proof changes

The probe tests actual protections and intentionally unsafe alternatives. Its
results must be read by case, not as a blanket security pass:

- Omitted `WITH CHECK` can inherit `USING`; its absence alone is not a bypass.
  A result policy that ignores a sensitive classification field can still allow
  forbidden relabeling. Explicit column/command authority remains necessary.
- A targeted update needing SELECT can return zero rows when hidden. A blind
  constant update has different permission requirements. A successful HTTP/SQL
  call is not proof that the intended row changed.
- Applicable permissive policies combine with OR. Adding an author-only policy
  does not override an existing broad staff policy.
- FORCE RLS restrains an ordinary owner, not a superuser or BYPASSRLS role.
  Default views and SECURITY DEFINER functions use owner rights; their actual
  behavior depends on those rights. `security_invoker` does not repair an
  overprivileged caller.
- Hidden rows can affect UNIQUE/FK checks. A raw constraint error, conflict
  count or match notification must not become an existence detector.
- Atomic uniqueness, expected revisions and shared authorization fencing are
  different protections. The concurrency cases show why a separate pre-check
  is insufficient; they do not prove any existing Core command implements the
  safe mechanism.

These findings correct oversimplified skill advice. The review relies on the
primary documentation and executed results rather than preserving an inaccurate
checklist statement.

### Review verification

Independent product/owner cross-review caught and corrected the distinction
between the selected audience and the recommended new preparation source, the
unselected canonical-admission trigger, conditional removal rights and accepted
write versus failed-read semantics.

Final structural checks passed: all 22 categories, 12 consolidated concerns,
21 exact proposed clauses, 17 proof scenarios and seven requested adversarial
headings are present; all 44 local document links resolve; six JSON evidence
files parse; probe SQL/Python hashes match the executed result; Python syntax
is valid. The 34 expected outcomes include four observed two-session lock waits.
The container and its data volume were disposed of and verified absent.

Prettier passes for the research Markdown/JSON and the glossary; tracked diff
whitespace checks pass. The original founder brief is deliberately excluded
from formatting and remains byte-for-byte identical to the uploaded source
(SHA-256 `464e3ceb675f1bd3926b0974b003e885ef1b115b5b516a37da3d84fbed8f1dcb`).
These checks verify the review artifacts and probe evidence, not a shipped
application, production security, accessibility or performance.

## Concern register

Severity measures potential consequence: **High** for unauthorized disclosure,
identity corruption, material false state or irreversible loss; **Medium** for
substantial friction, maintenance or operation cost. Likelihood is qualitative
and conditional on the named shortcut, not a measured production incident rate.
Unknown evidence is marked unknown rather than assigned a numerical probability.

### R1 — Privacy could protect notes while exposing the new person

**Concern:** A normal Party/donor write can reveal the new name, email or context
through staff search, contact detail, facets and timeline even if the prospect
screen is private. That contradicts A and the user's reasonable expectation.
**High; likely if current ordinary creation/read paths are reused unchanged.**
P9 B1/A15/A17 and the static donor/staff trace establish the coupling; this is
not a reproduced production incident.

**Impact on answer:** Clarifies and strengthens A; does not replace it.
**Permanent prevention:** Keep attributed new assertions in the P9-owned
restricted preparation boundary until a separately authorized canonical action.
Do not suppress unrelated existing shared facts. Apply C01–C02 and proof P01/P02.

### R2 — Identity matching can disclose or corrupt someone else's record

**Concern:** Email, phone, name, household or church mailbox matching may select
the wrong person; a hidden match warning exposes existence; merge or auto-link
may transfer contact facts or access. Confidentiality may also be used to create
a second P27 enrollment. **High; plausible with naive upsert or global duplicate
warnings.** P4/P9 identity contracts and P27 P02/P03 constrain this; PostgreSQL
constraint-channel tests show the technical footgun. Salesforce's documented
hidden-duplicate warning is a counterexample to Asym's stronger nondisclosure
rule, not a pattern to copy.

**Impact:** A survives with controlled identity resolution. **Prevention:** No
name/email-as-person-key, no automatic merge, no caller-selected protected link,
no hidden-match count/message. Saving preparation must remain useful while
canonical identity is unresolved. Apply C03 and P03/P04.

### R3 — RLS, server roles and mutation fields can disagree

**Concern:** Broad same-tenant staff policies, privileged service queries,
function execution or allowed updates can bypass the narrower audience. An
attacker may change tenant, actor, source target or audience using an otherwise
allowed mutation. **High; likely if generic donor/note CRUD or an owner-only
example is treated as sufficient.** Current code/migration evidence and actual
SQL-role tests establish the mechanisms. Application role names alone do not
prove authority; account deletion and stale JWTs do not prove revocation.

**Impact:** Requires qualification, not rejection of Supabase. **Prevention:**
One current P12 decision and source-owned command, least privileges, exact
projection, immutable attribution/scope fields, tenant-aware relational
constraints, complete effective-policy tests, explicit privileged-path checks.
Apply C04–C05 and P05/P06.

### R4 — Derivatives and audit can defeat primary-record privacy

**Concern:** A task title, before/after audit snapshot, activity summary,
notification, count, export or AI input can disclose the restricted information.
The current note-command trace copies content into command logs with broader
committed staff-read policy; see exact source lines in the runtime note.
**High; likely if only the main table/detail is protected.** This is a static
code/policy mismatch conditional on actual deployment, not claimed live access.

**Impact:** A must cover source derivatives. **Prevention:** Authorize before
selection/aggregation/emission; make general operational audit identifier-only
and keep any required content history under its source audience. No private
material in analytics, errors, URLs, generic events or model prompts. Apply
C06–C07 and P07/P08. Fix affected legacy producers before enrolling them in D1;
the review does not authorize application changes now.

### R5 — Save, edit and revoke races can create false or stale outcomes

**Concern:** A lost response leads to a new insert; two tabs overwrite one
another; access is revoked between check and write; a late response or retry
returns a once-authorized body. A refresh failure can incorrectly report a
successful save as failed. **High; plausible under normal networks and parallel
use.** PostgreSQL statement-snapshot semantics, actual concurrency probes and
P12/P27 recovery contracts support the concern.

**Impact:** Requires precise acceptance/recovery semantics. **Prevention:**
Scoped permanent operation identity plus payload binding, expected source
revision, atomic result/audit acceptance, and authorization ordering shared
with revocation. Return current safe results. Discard late wrong-context client
responses even if abort fails. Apply C08–C09 and P09/P10.

### R6 — Restricted preparation could accidentally authorize other effects

**Concern:** Saving or sharing might create a managed partnership, send a
welcome/verification message, admit a newsletter recipient, expose giving,
start coaching or bypass a suppressed canonical destination by using the raw
private email. **High; plausible if a generic conversion flow or contact DTO is
reused.** P6/P12/P25/P27 explicitly separate these effects.

**Impact:** Preserves A but limits what Save means. **Prevention:** Preparation,
canonical identity admission, shared collaboration and cultivation admission
remain independent source decisions. Unknown contact eligibility is not
permission. Owner-qualified manual work stays useful; no local consent store or
raw-email send fallback. Apply C10–C11 and P11.

### R7 — Sharing, departure, deletion or restore could rewrite rights/history

**Concern:** A Share flag publishes private past notes; a new staff assignee,
spouse or coach inherits them; deleting a prospect cascades into Party/finance
history; restoring data revives revoked access or consent. **High; plausible if
generic ACL flips, cascades or account-based ownership are used.** P27 D26,
P12 grants/departure and retained-data rules prohibit these shortcuts.

**Impact:** D1 gives no new exceptional or successor rights. **Prevention:**
Distinct deliberate source actions, no private-history republication, immediate
access fencing, retained obligation/source lineage, existing lawful retention
and restore fences. Do not invent a retention period or manager inheritance.
Apply C12–C13 and P12/P13. The subsequent audience/continuity choices remain
explicit product decisions; denial is the safe boundary, not their final UX.

### R8 — A safe database could still produce an unusable or misleading flow

**Concern:** “Only you” overpromises; a required full contact form causes
invented details; name splitting/autofill corrupts another person's identity;
hidden-match errors are dead ends; save status, focus or tiny controls fail on
a phone. **High for wrong-identity/privacy errors; Medium for friction.
Plausible; no user-incidence estimate.** W3C/GOV.UK guidance and current CRM
examples identify the patterns, not validated Asym outcomes.

**Impact:** A needs a real user journey, not a private badge. **Prevention:** One
short entry, accurate current audience explanation, progressive optional
details, international input support, visible acknowledged result, same-operation
recovery, accessible controls and separately reviewed sharing. Apply C14–C15
and P14/P15. No universal wizard, mandatory essay or blanket browser-autofill ban.

### R9 — The product benefit could be asserted without evidence

**Concern:** Founder preference and vendor feature descriptions might be
misrepresented as evidence of adoption, ministry effectiveness or lower staff
burden. **Medium; likelihood unknown because no representative pilot exists.**
The current roadmap explicitly leaves this choice open; public benchmark docs
do not establish private-prospect defaults or Asym outcomes.

**Impact:** Accept A as product judgment. **Prevention:** Test the actual capture,
return and authorized handoff jobs with representative missionaries/staff;
measure comprehension and task success against their current workflow. Do not
silently replace A with staff-visible B because B is easier. Apply C16 and P14.

### R10 — Unbounded searches and manual reconciliation could become expensive

**Concern:** Per-row permission calls, full-table browser loads, global matching,
large offsets and a mandatory human queue for every private contact could slow
the product and create routine maintenance. **Medium; plausible, scale and
incidence unmeasured.** The current workspace contains capped/local-window
patterns; current Supabase guidance requires measured policies/query plans.

**Impact:** Does not show A is unscalable. **Prevention:** Narrow indexed
source/tenant/actor predicates, stable bounded pages, current-authority search,
restricted assertions independent of canonical-resolution completion, and
cause-owned exceptions only where necessary. No general resolver team, full
materialized duplicate directory or arbitrary limits. Apply C17–C18 and P16.

### R11 — A privacy feature could grow into a second platform

**Concern:** A new ACL engine, private contact graph, task store, event bus,
encryption product, generalized staging framework or mandatory approval on
every note increases coupling and long-term cost. **Medium–High; plausible if
every review concern creates a subsystem.** ADR-0001/P9/P12/P27 already assign
these owners. ADR-0211 governs projection-policy widening, not supervisor
approval of every ordinary authorized action.

**Impact:** Narrows the engineering design while preserving the outcome.
**Prevention:** One bounded P9 source extension, existing P12 policy system and
existing source task/history operations only. Ordinary preparation has no new
provider, automation or realtime dependency. Apply C19 and P01/P11.

### R12 — Migration and release could make a correct design unsafe

**Concern:** Old writers bypass the new source; retained contacts are bulk
reclassified; mixed-version deployments read new fields broadly; rollback or
restore reopens exposure. **High; plausible, actual retained-data distribution
unknown.** The source trace contains legacy donor/task paths; the brief and P27
require a census and source-preserving cutover.

**Impact:** A is a future qualified behavior, not a relabeling of existing data.
**Prevention:** Inventory reached records/readers/writers, preserve original
rights/lineage, deploy protections before entry, fence old writers, gate
activation on real-role proof, and make rollback disable the affected capability
without restoring permissive behavior. Apply C20–C21 and P13/P17.

## Every requested category evaluated

Shared concerns are cross-referenced so that one permanent safeguard is not
duplicated into several inconsistent requirements. Every row explicitly states
whether a material concern exists; the referenced concern supplies its impact,
conditional likelihood, evidence, answer effect and exact amendment/proof.

| #   | Category                                                      | Material concern and why                                                                                                                                                                                                                                                                                                                 | Permanent treatment / answer effect                                                                                                                                                                              |
| --- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity, and alternatives                 | **Yes — Medium, benefit unvalidated.** R9; tentative preparation is a founder-selected job, not an observed adoption problem. The strongest simpler alternative is immediate specifically authorized staff visibility with separately private notes.                                                                                     | C16/C19. Keep A; do not claim causal benefit. Existing authorized work is useful but a no-build option cannot claim to deliver restricted capture.                                                               |
| 2   | Brittleness                                                   | **Yes — High, likely under shortcut reuse.** R1/R3/R5: protection only works while all reads use one screen, tokens are fresh and no race occurs.                                                                                                                                                                                        | C01/C04/C08/C09. Enforce the source boundary across callers and operation outcomes rather than depending on UI convention.                                                                                       |
| 3   | Technical debt                                                | **Yes — Medium–High, plausible.** R11/R12: duplicating contacts/tasks or retaining old unrestricted writers creates conflicting authorities and migration debt.                                                                                                                                                                          | C19/C20. One owner extension and source-preserving cutover; no parallel personal schema or ongoing synchronization.                                                                                              |
| 4   | Edge cases                                                    | **Yes — High, plausible.** R2/R5/R7/R8: shared mailboxes, unknown identity, households, duplicate work, access loss, wrong autofill and restore can change meaning.                                                                                                                                                                      | C03/C08/C12–C15. Explicit scenario/proof matrix below; do not infer a person, permission, outcome or relationship from a label.                                                                                  |
| 5   | Footguns                                                      | **Yes — High, likely if generic CRUD is exposed.** R3/R4/R6: author/tenant/visibility updates, public RPC execution, raw audit bodies, “share all” and raw-address sending.                                                                                                                                                              | C04–C07/C10–C12. Trusted server context, narrow commands/grants, exact allowed transitions and independent send authority.                                                                                       |
| 6   | Tenant safety                                                 | **Yes — High, conditional on unchecked joins/context.** R2/R3/R5: globally valid IDs, stale client context or a service role can cross tenant/actor scope; a Site is not an authorization boundary.                                                                                                                                      | C04/C05/C09. Tenant-aware links and queries, current principal-purpose authority, negative cross-context tests; no new Site-based identity boundary.                                                             |
| 7   | Database, RLS, and authorization safety                       | **Yes — High, concrete mechanism evidence.** R3: grants, OR-composed policies, definer paths, fields not covered by policies and constraint errors can defeat naive RLS.                                                                                                                                                                 | C04/C05/C08. Validate actual roles, policy combinations, both old/new row conditions, immutable fields, nullability/checks/keys/FKs and privileged commands. Probe is mechanics evidence only.                   |
| 8   | Overengineering                                               | **Yes — Medium, plausible.** R11: a generic privacy/staging/approval platform solves imagined needs at the cost of ordinary capture.                                                                                                                                                                                                     | C19. Bounded preparation source; reuse existing owners, approve policy changes at their owner, avoid compulsory per-entry review.                                                                                |
| 9   | UX/UI and user friction                                       | **Yes — High/Medium, unmeasured incidence.** R8: inaccurate privacy labels, long forms, blocked hidden matches, lost saves, poor focus/touch and international identity assumptions.                                                                                                                                                     | C14–C16. One short phone-friendly flow, real recovery and accurate audience; test comprehension and completion, not only conformance.                                                                            |
| 10  | Source of truth, ownership, and domain invariants             | **Yes — High, likely if assertions become canonical facts.** R1/R2/R6/R11: entry, person identity, shared relationship, consent and cultivation may be conflated.                                                                                                                                                                        | C01–C03/C10/C19. P9 preparation, P4/P9 canonical identity/contact, P12 access, P27 managed work. One lineage and no second enrollment for confidentiality.                                                       |
| 11  | Hidden coupling                                               | **Yes — High, source-supported.** R1/R4/R7: Party creation triggers discoverability/timeline; private notes reach audit/task derivatives; assignment may imply access by accident.                                                                                                                                                       | C06/C12/C19. Inventory and qualify every reached derivative, and use explicit source references rather than access inherited from association.                                                                   |
| 12  | Failure modes                                                 | **Yes — High, plausible in ordinary network failures.** R5/R8: ambiguous save, failed refresh, partial audit or stale source response causes duplicate work or false success.                                                                                                                                                            | C08/C09/C15. Atomic authoritative acceptance, durable result lookup, honest uncertainty, current read access and cause-owned repair.                                                                             |
| 13  | Lifecycle, temporal correctness, concurrency, and idempotency | **Yes — High, mechanically demonstrated risk.** R5/R7: separate checks race; rekeyed retries duplicate; grant revocation loses ordering; backdating changes access.                                                                                                                                                                      | C08/C09/C12/C13. Expected revision plus permanent operation identity and current authorization fence. Historical occurrence time never becomes retroactive authority.                                            |
| 14  | Data integrity risks                                          | **Yes — High, plausible.** R2/R3/R12: mistaken merge, cross-tenant link, browser-supplied author, silent overwrite and reimport create bad facts.                                                                                                                                                                                        | C03–C05/C08/C20. Owner-authorized resolution, relational constraints, immutable provenance and source-preserving repair. Unknown is allowed without fake identities.                                             |
| 15  | Security and privacy risks                                    | **Yes — High, source-supported.** R3/R4/R7: table privacy can be defeated by logs, exports, backups, files, AI, notifications and inappropriate historical grants.                                                                                                                                                                       | C06/C07/C12/C13. Minimize collected/distributed data, bind every output to current purpose, preserve lawful source custody and avoid absolute secrecy/recall promises.                                           |
| 16  | Scalability and performance risks                             | **Yes — Medium, unquantified.** R10: unbounded loads, correlated permission work and global dedup can degrade. No tested workload establishes a latency guarantee.                                                                                                                                                                       | C17. Query/plan/row-count/network budgets must be measured for the actual source cohort; use bounded indexed paths, not invented speedup factors.                                                                |
| 17  | Operational burden                                            | **Yes — Medium, plausible.** R10/R11: every new name could require staff resolution or direct SQL; departure may orphan real duties.                                                                                                                                                                                                     | C18/C19/C13. Decouple preparation save from canonical matching, provide owner-command repair and keep accepted obligations distinct from private ideas.                                                          |
| 18  | Observability and auditability gaps                           | **Yes — High, source-supported.** R4/R5: absent receipts hinder recovery, but full payload logging leaks content; activity counts can become surveillance.                                                                                                                                                                               | C06–C08/C18. Minimal durable operation/security evidence, separately authorized content history and named failure ownership; no productivity inference from missing voluntary records.                           |
| 19  | Dependency and integration risks                              | **Yes — High for stale authorization; no required new vendor.** R5/R11: private realtime channel admission is not immediate revocation, and providers/AI may receive raw data. Current changelog also affects later compatibility qualification.                                                                                         | C07/C09/C19/C21. Native path works without integrations/realtime/AI; qualify exact optional adapters, versions and device support when used. Never loosen TLS or provider security to preserve obsolete clients. |
| 20  | Migration, rollout, and upgrade risks                         | **Yes — High, retained-state unknown.** R12/R7: flags/backfills/rollback can silently change visibility or revive completed effects.                                                                                                                                                                                                     | C20/C21. Census, compatible source deployment, writer fencing, cohort activation, safe disablement and restored restrictions before exposure.                                                                    |
| 21  | Testability, traceability, and proof                          | **Yes — High if evidence classes are conflated.** R9/R12: green mocks, synthetic SQL or documentation validation may be presented as feature qualification.                                                                                                                                                                              | C16/C21 and P01–P17. Trace exact clauses to real source/API/database/UI results, both positive and negative. No formal OpenSpec/ticket publication before the founder commands.                                  |
| 22  | Other development hazards                                     | **No additional distinct material concern found after checking terminology, phase scope, ministry assumptions, financial type leakage and dependency cycles.** Relevant risks are already R1/R6/R9/R11: restricted-start is not P10 high-risk classification, private data is not a donor-value model, and no new money store is needed. | C01/C10/C16/C19. Preserve these distinctions; do not invent a twenty-third subsystem merely to populate this category.                                                                                           |

## Exact review amendments for the later specification

These clauses are proposed wording for the authorized design/specification
transition, not a separately published formal spec. They preserve D1's chosen
ordinary audience; clauses explicitly reserving new rights do not decide them.

- **C01 — Protected meaning.** “Restricted prospect preparation protects the
  newly supplied identity/contact assertions and planning from ordinary staff
  access across every reached surface. It does not hide independently existing
  authorized facts and does not assign Phase 10 high-risk classification.”
- **C02 — Bounded source.** “P9 owns one bounded preparation source for unresolved
  prospect assertions. P4/P9 retain canonical identity/contact acceptance and
  repair; P12 retains permissions. Known authorized identity may be reused
  without duplicate entry. No Party, donor or Ministry Assignment is invented
  merely to satisfy a required foreign key.”
- **C03 — Identity and nondisclosure.** “Name/email/phone/mailbox similarity is
  evidence for qualified resolution, never automatic identity or merge. Hidden
  matches grant no access and produce no unauthorized existence signal through
  result shape, error, count, suggestion or workflow. Constraint diagnostics are
  handled inside the trusted source. Privacy does not justify a second P27
  enrollment for the same continuing purpose.”
- **C04 — Trusted authority.** “Every command/read resolves current principal,
  Tenant and exact source/purpose/field/history authority from trusted server
  context. Caller input cannot set authoritative actor, author, Tenant, approval,
  role, audit attribution or access scope. Relationship and assignment alone
  grant no rights. Current source authority is checked on result recovery too.”
- **C05 — Database invariants.** “Use non-null required scope and immutable source
  identity/provenance, tenant-consistent parent references, validated optional
  identity links, narrow column/operation authority and owner-defined valid
  combinations. General updates cannot change authorship, Tenant, target,
  disclosure or approval. Verify grants, complete RLS policy combinations,
  existing-row and resulting-row predicates, views/functions and privileged
  paths. No browser-direct privileged writer is introduced.”
- **C06 — Derivative protection.** “Apply current source eligibility before
  enumeration, joins, counts, facets, ranking, paging, exports, task labels,
  timeline composition and serialization. General audit/event/telemetry carries
  only allowed identifiers and outcomes; required content history stays under
  its source audience. Technical logs cannot become a private-note archive.”
- **C07 — Processor and channel boundary.** “Preparation grants no AI, external
  integration, attachment publication, email, push or realtime payload access.
  Each optional consumer requires an exact owner-qualified projection and
  revocation/retention contract. Native preparation remains usable without it.”
- **C08 — Atomic acceptance and retry.** “Bind the permanent operation identity
  to current scope, actor, action and intended payload; a changed meaning cannot
  reuse it. Co-accept source revision, required minimal audit and safe result
  evidence atomically. Repeated delivery produces one intended effect. Use
  expected revisions and an authorization fence shared with revocation; a
  separate pre-check does not establish commit-time permission.”
- **C09 — Currentness and recovery.** “Saved means authoritative acknowledgment.
  Preserve uncertainty after a lost response and reconcile the same operation.
  A failed refresh cannot reverse a successful save. Revocation/context changes
  deny future reads/effects, clear unsafe client state and reject late responses.
  Previously delivered data cannot be promised recalled; no restricted offline
  storage/replay is assumed.”
- **C10 — No implied effects.** “Saving preparation does not enroll cultivation,
  create a Request/commitment/gift, record an actual encounter, subscribe a
  newsletter, publish content or invite a coach. Optional next work uses its
  existing qualified source. No fictional ministry/person or financial values
  are required to complete preparation.”
- **C11 — Contact eligibility.** “A stored contact assertion is not contact
  permission. Consequential communication resolves the exact identity,
  destination, purpose and current suppression through its owner. Unknown
  eligibility is held/denied truthfully; raw-address sending cannot bypass a
  protected canonical restriction or expose its reason.”
- **C12 — Deliberate disclosure.** “Canonical admission, sharing and managed-work
  admission are distinct source actions. Any authorized sharing presents the
  exact eligible facts and audience before acceptance and preserves the prior
  state on cancel or failed acceptance. Private notes/history are never copied,
  summarized or relabeled into shared partnership history. D1 selects no new
  sharing, exceptional-reader or historical-access grant.”
- **C13 — Continuity and custody.** “Access loss immediately fences the former
  reader without waiting for a successor. Existing accepted obligations and
  lawful source evidence survive under their owners. Removing preparation does
  not delete the Party or related financial/shared history. Restore/import cannot
  revive expired access, consent or ended effects. New departure disclosure,
  retention duration and exceptional-access rules require an explicit decision.”
- **C14 — Minimal, accurate entry.** “Use a short accessible form with the
  current organization context and accurate audience explanation before Save.
  Collect only the owner-required minimum, supporting incomplete knowledge
  without invented fields. Preserve international names/contact meaning; test
  third-party autofill. Do not require a household, postal address, ask amount,
  essay, next task, stage or coaching enrollment merely to save preparation.”
- **C15 — Usable outcome.** “Show saving, acknowledged, definitely rejected and
  outcome-unknown states distinctly, with a real permitted repair action. Keep
  safe input on correctable failure, reveal the acknowledged result durably,
  preserve list position and give keyboard/screen-reader users equivalent
  focus, error and status feedback. Sharing is never an accidental Save side
  effect or a hover/color-only control.”
- **C16 — Evidence honesty.** “Treat expected trust/adoption benefits as
  hypotheses. Validate audience comprehension and entry/return/handoff tasks
  with representative missionaries and responsible staff. Record measured task
  success, time, navigation, correction and poor-network failures; do not claim
  performance, accessibility or ministry outcomes from mocks or vendor claims.”
- **C17 — Bounded work.** “Authorize in the source query and use indexed,
  selective predicates plus stable bounded pagination. Inspect actual query
  plans, rows examined/returned, memory and network payloads for the agreed
  cohort. Set numerical budgets from that evidence before release; avoid global
  browser datasets, unbounded recursion and fixed remembered speedup claims.”
- **C18 — Operable repair.** “Every rejected, interrupted or outcome-unknown
  request has a source-owned result/recovery path; a subsequent read failure
  does not reverse an accepted write. Routine use needs no direct SQL or
  staff approval for every tentative contact. Operational/security signals do
  not expose private content or become missionary diligence/relationship scores.”
- **C19 — Reuse with discipline.** “Use existing identity, permission, shared
  note/task/history and source-operation boundaries. If adopted through the
  coordinated owner amendment, introduce only the recommended bounded P9
  preparation extension. No alternate CRM, ACL engine, private
  task system, staging platform, new provider or automatic sync is required.
  ADR-0211 applies to policy widening, not blanket approval of ordinary entries.”
- **C20 — Safe cutover.** “Inventory reached retained data and every old/new
  reader/writer before activation. Preserve provenance, established rights,
  restrictions and completed/unresolved work. Do not bulk infer private/shared
  status or newly authored context. Fence incompatible writers and prove
  mixed-version behavior; ambiguity has a source-owned disposition.”
- **C21 — Qualification and disablement.** “Activate only after real source,
  actual-role database, API, concurrency, recovery, migration and representative
  accessible UI evidence passes for the exact scope. On failure, disable the
  affected capability while preserving restrictions and source evidence;
  rollback/restore must not reopen old exposure. Planning, mechanics proof and
  release evidence remain separately labeled.”

## Minimal permanent design and UX

The recommended source is a small P9-owned preparation entry representing
**what Maya supplied**, not a second representation of who Beth authoritatively
is. Canonical identity and new assertions are different facts. An internal
same-Tenant identity reference can be established only by its qualified owner;
it does not grant Maya access to the other Party facts or staff access to her
preparation. A correction to a shared canonical contact must not silently
overwrite or publish a private assertion.

The strongest engineering alternative is a canonical Party restricted from
birth. It is not inherently invalid, but requires every Party/subtype/contact,
directory, graph, merge, timeline and derivative reader to honor this new
purpose before the creation commits. It also represents ambiguous third-party
input less naturally. The bounded preparation source therefore has the smaller
credible change boundary. Do not build both models or an ongoing sync between
them. Exact SQL storage can reuse owner infrastructure if it proves these same
semantics; this decision does not freeze a table name or ORM layout.

Relational implementation should make invalid scope impossible where practical:
non-null Tenant/source identity, composite tenant parent references for
tenant-owned targets, correctly optional unresolved Party binding, immutable
attribution, owner-approved valid combinations and scoped operation uniqueness.
Global Auth principals need a current Tenant assignment, not a fabricated
tenant-owned Auth identity. Email/phone must not be a person-uniqueness key;
names are text, not mandatory Western first/last identity. No money column,
currency conversion or ledger belongs in preparation. Deletion behavior must
not cascade from auth/preparation into unrelated Party/financial history.

The phone experience should be one short capture in the current organization
context. A Ministry Assignment is included only where the action needs and the
user has authority for it; it is not a universal prerequisite. Allow selecting
an already permitted person without retyping. Display only authorized match
information. If canonical identity cannot be resolved, saving the restricted
preparation can still succeed; explain that precise result instead of asking
the person to invent details or change spelling to evade a block.

Keep an accurate audience label next to the work. Avoid an unqualified “Only
you” promise or a meaningless “Anyone with permission” badge. Explain the
ordinary audience and any actually approved organizational access in plain
language; do not create new exception rights just to fill the help text. Full
details should be available without a mandatory policy ceremony on every save.

Save has one meaning: source-acknowledged restricted preparation. Show the
persisted result, retain navigation position and recover the same operation
after interruption. A later deliberately selected sharing action needs its
own exact information/audience review. It is not part of quick capture, and
the design must not preselect private-history publication.

Use existing Base UI/base-maia components. Verify keyboard, focus, screen-reader
status, reflow and actual touch targets. WCAG 2.2's 24 CSS-pixel minimum/spacing
rule is a floor with exceptions, not a universal comfortable target design.
Third-party prospect entry needs browser testing: self-profile autofill can
replace Beth's details with Maya's. A blanket ban on paste/autofill is not the
answer. International names, scripts, punctuation, phone formats and shared
mailboxes require source-aware handling. Date-only plans must not acquire an
invented timezone or occurrence time; no new default timezone is chosen here.

## Edge-case and proof matrix

These are falsifiable outcomes to carry forward, not claims that Core already
passes them. The database probe proves only the identified mechanics subset.

| Proof                                                | Cases and observable pass condition                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 — Useful permitted entry                         | Maya creates, finds, reopens and edits her preparation through the actual source. No required dummy donor/ministry, financial amount, task or consent. Protection does not reduce the product to deny-only behavior.                                                                                                                                                 |
| P02 — Source audience                                | New name, email, note and unique marker stay absent from ordinary staff and unrelated missionary lists/detail/search/counts/facets/timeline/exports. Staff retain already-authorized independent Beth records unchanged.                                                                                                                                             |
| P03 — Ambiguous identity                             | Same names, changed address, spouses, church mailbox and one person in multiple ministries neither auto-merge nor overwrite canonical facts. Unresolved preparation can save without claiming a verified match.                                                                                                                                                      |
| P04 — Hidden match                                   | Compare absent/hidden-existing inputs across responses, counts, constraints, links and resolution UX. No unauthorized existence/owner/history signal. Same-author visible duplication may use only qualified visible evidence; canonical P27 work is not duplicated for confidentiality.                                                                             |
| P05 — Role and field matrix                          | Test author, other same-Tenant missionary, ordinary relationship staff, explicitly qualified source reader, coach-only, newsletter-recipient-only, revoked actor, anonymous/signed-in-anonymous and other Tenant. Caller-supplied scope/author/approval and arbitrary target links fail.                                                                             |
| P06 — Effective database paths                       | Test actual grants, inherited roles, permissive/restrictive policies, USING/result predicates, zero-row updates, definer/invoker views/functions, RPC execute privilege, service paths, search_path and direct API exposure. Every successful forbidden relabel/read is a failure, not a UI issue.                                                                   |
| P07 — Audit and derivatives                          | Put a synthetic private marker in the input. Unauthorized command logs, timeline summaries, task titles, notifications, reports, tracing and error responses contain neither marker nor revealing metadata. Required audit/history remains usable to its independently qualified reader.                                                                             |
| P08 — Optional consumers                             | No automatic AI, email, workflow, public story, push, external sync or sensitive realtime event on save/import. Files, if later admitted, enforce source access on metadata, preview, bytes and download; clean scanning/folder membership alone grants nothing.                                                                                                     |
| P09 — Repeat and concurrent operations               | Same scope/action/payload operation retry returns one effect. Changed payload with same identity is rejected. Distinct legitimate operations are not collapsed. Two stale edits cannot silently overwrite; two resolved same-purpose admissions cannot create duplicate work.                                                                                        |
| P10 — Access and response races                      | Exercise revoke-before/save-before, read/queued-effect/current-result recovery, slow old-Tenant response, two tabs and failed abort. Current revocation denies later access; committed work remains committed. Late responses cannot repopulate unsafe client state.                                                                                                 |
| P11 — No implied downstream authority                | Save/share does not imply newsletter consent, cultivation, call completion, gift, financial visibility or coach access. Unknown/suppressed destination cannot send via raw entered address. Manual permitted planning remains usable when an unrelated provider is unavailable.                                                                                      |
| P12 — Sharing and history                            | Once sharing scope is decided, review exact safe facts/audience, cancel safely, recheck current meaning, reconcile uncertain acceptance, and prove no private-note/attachment/history republication. A role or assignment change is not sharing.                                                                                                                     |
| P13 — Departure, delete and restore                  | Revoke former actor before handoff. Preserve accepted duties and lawful history without automatic successor access. Where its owner permits removal, remove only the exact preparation without cascading into Party/money; otherwise prove the permitted refusal/retention outcome. Restore/reimport does not revive access, consent, task effects or past outreach. |
| P14 — Representative task and audience comprehension | New and experienced missionaries plus responsible staff complete entry/return/permitted handoff and explain audience, ownership and save state. Record actual failures and compare with the existing workflow; agent roleplay is not a pilot.                                                                                                                        |
| P15 — Accessible international phone journey         | Real supported browsers with soft keyboard, zoom, narrow reflow, screen reader and keyboard; single/long/non-Latin names; apostrophes; shared email; international phone; third-party autofill; interrupted pre/post-commit submissions. Required meanings and recovery remain understandable and operable.                                                          |
| P16 — Measured load                                  | Real source predicates and permitted distributions for large-tenant/large-actor cohorts; authorization before pagination/counts, stable ordering, bounded client memory, measured query plans/rows/latency/network. Freeze budgets from evidence, not a generic millions-of-rows claim.                                                                              |
| P17 — Cutover/rollback                               | Retained-data census, source mapping and ambiguous cases; old-code/new-schema and new-code/old-schema attempts; writer fencing, narrowed activation and emergency disablement; pre-restriction backup restore. No new broad visibility, provenance loss or historical replay.                                                                                        |

## Ruthless synthesis: what to do and in what order

1. **Record now:** A's ordinary audience and the corrected D1 wording, separately
   labeling the bounded preparation source as an engineering recommendation. Preserve
   new identity/contact/context protection, one CRM, current authority,
   no implied effects and no private-history sharing. Record the source/UX
   evidence limits. This resolves D1 without pretending the whole Phase 28
   privacy lifecycle has already been chosen.
2. **Resolve the next product right before that capability is designed:** exact
   deliberate sharing/admission audience and facts, then any exceptional-access
   or departure-disclosure policy the founder actually wants. Existing rights
   retain their owner; no new grant is inferred. These are product choices,
   not database questions to hand back to the founder or hidden hardening.
3. **Capture in the later authorized spec/design:** the coordinated P9/P12 source
   extension, P4/P9 identity/repair interface, C01–C21 and the applicable proof
   scenarios. Reconcile source-owner clauses explicitly. Use existing tickets
   where they actually own the seam; no ticket or dependency graph is drafted
   here. In particular, the P25 newsletter-request enablers are not a general
   prospect foundation.
4. **Require during implementation:** trusted atomic source commands, minimal
   data/projections, effective role/grant/RLS/function tests, hidden-match-safe
   result handling, source-safe audit/history, stable retry/revision/revocation
   semantics and accessible recovery. Fix the reached legacy broad paths before
   using them; do not grandfather them as exceptions.
5. **Prove before activation:** real Core/Supabase role/API/source and browser
   journeys, retained-data/mixed-version/restore checks, measured budgets and
   representative pilots. E7/C-01/Phase 6 delivery gaps still gate only their
   affected features; they do not prevent private preparation research or
   independently qualified work.
6. **Operate after qualification:** the signals below detect regressions. They
   never replace release-blocking privacy, integrity or recovery proof.

### Only these items are placed in monitor

The table defines exact signals, thresholds, owners and actions. These are
review requirements for future operation, not monitoring deployed in this chat.
No unspecified “watch performance” or “monitor privacy” item closes a blocker.

| Signal                                                                                                             | Threshold                                            | Accountable owner                                  | Required response                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Successful unauthorized synthetic disclosure/write or protected marker in unauthorized diagnostic output           | **Any result > 0** in the qualification/canary suite | P12 authorization owner with P9 source owner       | Block activation or disable the affected capability; restrict the leaking path, preserve minimal evidence and investigate reached derivatives.    |
| Duplicate accepted effects for one exact operation/source-purpose identity, or accepted payload mismatch           | **Any result > 0**                                   | P9 source-operation owner                          | Stop the affected writer/replay, reconcile from durable source receipts and repair via owner commands; never blindly delete or resend.            |
| Accepted operation missing its required durable receipt/audit at reconciliation                                    | **Any result > 0**                                   | P9 source-operation owner and required audit owner | Treat as an invariant failure, stop the affected acceptance path and recover exact committed state. Do not infer failure from missing UI refresh. |
| Pilot participant misunderstands ordinary audience or performs wrong-identity/autofill save without recognizing it | **Any observed instance**                            | P28 product/UX owner with P12 policy owner         | Hold the affected flow, revise copy/interaction and rerun the failed scenario; do not count conformance as comprehension.                         |

**Unmeasured release gate, not monitor:** the P9 data owner and P28 frontend owner
must measure query, memory and network behavior against the agreed cohort, fix
numerical budgets, and prove them before activation. No unspecified future
threshold is treated as an operational control or a completed requirement.

Privacy and integrity failures are never merely tolerated through alerts.
Ordinary optional planning is not measured as missionary diligence, supporter
value or compliance activity.

## Adversarial check

### What could go wrong with this answer?

Implementers could protect only a note or screen while identity, audit and
derived paths remain broad; retries and merges could change meaning. The exact
amendments and negative/positive proof target those failures.

### What hidden assumptions are we making?

That restricted preparation is valuable to real missionaries, that a bounded
owner extension is proportionate, and that source services can enforce the
qualified boundary without routine human intervention. These are declared
product/engineering judgments with explicit validation, not observed ministry
facts. Hosted state and actual usability remain unproved.

### How does this affect the whole product?

It adds a focused preparation purpose to the existing CRM/permission owners.
Existing staff, donor, finance, public-content and newsletter-request rights
keep their own meaning; no shadow CRM, new money truth or implicit consent is
introduced.

### How does this affect the end-user experience?

One short capture and truthful audience/save state support early work. Identity
resolution must not expose others or force invented details. Later sharing is
deliberate and understandable; excellent UX still requires actual target-user
and accessible-device proof.

### Does this follow modern best practices?

Yes as a proposed direction: least privilege, explicit source authority,
transactional invariants, recoverable operations, data minimization and
accessible progressive entry. Current PostgreSQL/Supabase mechanics were
verified. Vendor warnings and skill shortcuts were rejected where they conflict
with Core or actual engine behavior.

### Does this fit Asym’s existing repo and product direction?

Yes with a coordinated P9/P12 extension and P4/P9 resolution. It fits ADR-0001,
platform boundaries and P27's deliberate, noncompulsory work. Existing legacy
read/write/audit patterns need correction at the affected seams; their presence
does not make them appropriate precedents.

### Should we adjust the recommendation?

Keep A. Amend its protected scope and implementation/proof obligations as
recorded above. Do not substitute staff-visible contacts with private notes,
promise absolute secrecy, or grant new sharing/exception/departure rights.
