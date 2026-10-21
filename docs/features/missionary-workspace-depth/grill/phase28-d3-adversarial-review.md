# Phase 28 D3 — no new continuity access; useful data without hidden disclosure

**Disposition: Accept with required amendments.** The founder selected A: no new
access right when a missionary leaves or cannot continue, with clean useful
data and simple, clear UX. The amendments below preserve that choice; they do
not introduce a custodian, approval queue, automatic sharing or a deletion rule.

Reviewed October 16, 2026 UTC against
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. This is a decision review and research
record, not a formal specification, source-owner amendment or implementation.
The session still requires explicit `/to-prd` and `/to-issues` transitions.
No live accounts, records, notifications, provider settings or GitHub state were
changed. D1 and the ratified D2 remain in force.

## Exact decision to record

> **D3 — No new continuity-access right.** A missionary's departure or inability
> to continue does not grant staff, administrators, coaches or a successor new
> access to unshared prospect details or private preparation. It does not
> automatically share, export, transfer or publish them. Organization ownership,
> cleanup and responsibility labels do not provide an access exception.
>
> Existing independently authorized CRM facts and already shared contacts keep
> their own permissions. Existing accepted organizational duties retain their
> source-owned continuity rules. An unshared prospect alone creates no duty,
> mandatory handoff, notification or task. Ending access does not wait for
> cleanup or a replacement, and it does not erase truthful history.
>
> Maintain useful data through accurate current state, authorized correction,
> source-owned identity resolution and clearly scoped removal/disposition.
> Removing preparation must not delete an independent contact, someone else's
> work, financial history, consent/suppression or required evidence. Retention
> does not confer read access; no arbitrary purge or indefinite-retention rule
> follows from this decision.
>
> Show whether the eligible contact details are available to staff; keep the
> audience of private notes and planning distinct. Give a short explanation
> where the consequence matters. Do not add a departure wizard, custodian picker or
> repeated privacy confirmations. Explain the actual effect of any cleanup
> action at that action. Do not promise absolute secrecy, automatic deletion,
> recall of previously delivered information or automatic restoration on return.

**Selected:** no new continuity right; simplicity, clarity and useful data.
**Required safeguards:** current authorization, no disclosure through cleanup,
independent-record/history preservation, honest lifecycle states and recovery.
**Not selected:** an archive control, deletion-on-departure, retention duration,
permanent archive, or a returning user's exact historical-access rule. Those
are not minor hardening hidden in the words “clean useful data.”

**Subsequent decision:** the founder later selected ordinary archive from active
prospects in [D4](phase28-d4-adversarial-review.md). That resolves the ordinary
unused-preparation cleanup choice; it does not select a retention duration,
automatic departure cleanup or new historical-access right. D3's original
scope and chronology above are retained.

## Evidence and current-versus-intended behavior

| Evidence class        | Verified finding                                                                                                                                                                                     | Limit                                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder feedback      | Explicit A and a strong simplicity/data-quality/UX constraint.                                                                                                                                       | No ministry interview or evidence that an exceptional continuity reader is needed.                                                                                        |
| Governing intent      | P4/P9 identity and source ownership; P12 current authority; P27 voluntary context and accepted-duty continuity; ADR-0183 source-owned work; D1/D2 access and sharing decisions.                      | Existing mechanisms and specific other-domain reactivation examples do not establish the new preparation producer or a universal return policy.                           |
| Current code          | Admin user mutation is read-only demo; scoped inspection found no general departure command or functioning CRM archive. Legacy membership/profile fallback and same-user cache gaps remain relevant. | Absence is limited to inspected paths, not a claim about every external operator or deployed service.                                                                     |
| Current schema        | Auth/profile/task/care cascades coexist with donor/finance/author blockers, pledge SET NULL and retained note/log attribution.                                                                       | Committed schema is not a hosted constraint census. A blocking FK rolls back the statement's cascades; it is inaccurate to claim every listed deletion always happens.    |
| Executed FK mechanics | Six scenarios / 18 assertions passed on PostgreSQL 17.11 using exact selected declarations: cascade, three blocking references with rollback, pledge SET NULL, note/log attribution retention.       | UUID-only Auth stub; no full migrations, RLS, Auth API/session, other graph edges or concurrency. These are mechanics counterexamples, not a permitted deletion workflow. |
| Primary platform docs | Supabase user deletion does not invalidate already issued JWTs; storage ownership may block deletion; storage ownership itself grants no access. PostgreSQL documents the exact FK and RLS behavior. | These are platform facts, not Core end-to-end authorization proof.                                                                                                        |
| Comparable products   | Primary CRM evidence separates deactivation/archive, retained activities, deletion and historical attribution; some archive behavior excludes records from matching.                                 | Vendor behavior is a comparison, not permission to import account-wide transfers, arbitrary retention or Asym impact claims.                                              |
| Product judgment      | Omitting an unsupported exception is simpler and consistent with D1; workspace cleanup should affect the intended work context.                                                                      | The exact cleanup interaction and measured user comprehension need evidence and, where it changes lifecycle policy, a product choice.                                     |

Detailed evidence: [owner/lifecycle](d3-evidence/owner-lifecycle.md),
[current runtime](d3-evidence/current-runtime.md),
[UX/data quality](d3-evidence/ux-data-quality.md),
[product synthesis](d3-evidence/product-synthesis.md), and
[technical research](d3-evidence/technical-research.md).
The [D3 FK probe](d3-evidence/postgres-probe/README.md) preserves exact excerpts,
source hashes, results, actual fixture constraints/roles and verified cleanup.
The [D1](phase28-d1-adversarial-review.md) and
[D2](phase28-d2-adversarial-review.md) reviews remain applicable evidence rather
than being silently reclassified as completed application behavior.

## Consolidated concerns

Severity is impact if the mistake occurs; likelihood is conditional reasoning,
not a measured incident rate. Concern IDs map to exact clauses and proof below.

### D3-R01 — Cleanup or handoff becomes an unauthorized reader

**What/why:** A manager's orphan list, successor reassignment, export, audit
payload or privileged repair exposes the unshared contact or private notes.
Even a name, count or matching hint can disclose protected existence. That
contradicts the selected privacy promise and can expose sensitive ministry
relationships. **Severity: High. Likelihood: plausible**, given broad legacy
readers and the temptation to equate organization ownership with permission.
P12 §I, D1's private-note/log trace and the runtime's `donors.missionary_id`
projection support the concern; no actual departure disclosure is claimed.
**Impact:** narrows implementation, preserves A. **Permanent fix / exact change:**
D3-C01/C02/C09: no new reader through any surface; keep current access and
responsibility separate; authorize before enumeration and serialization.

### D3-R02 — Deactivation leaves access alive, or return revives old rights

**What/why:** Disabling a membership leaves a legacy profile-role fallback,
valid JWT, open cache or pending command usable; a recreated assignment inherits
old history just because the person or email matches. **Severity: High.
Likelihood: plausible** if current paths are reused unchanged. Official
Supabase Auth docs, the scoped fallback/cache trace and exact P12 grant semantics
support this; there is no hosted revocation test. **Impact:** strengthens the
required enforcement, not the product audience. **Permanent fix / exact change:**
D3-C03/C08/C09: current P12/source authority at reads and acceptance, clear stale
presentation, no expired-grant resurrection. Do not make hard deletion or a new
Phase 28 session system the solution.

### D3-R03 — “Clean data” causes destructive or dishonest retention

**What/why:** Auth/profile deletion cascades away tasks/care, fails on independent
history, clears source attribution, or leaves private bodies behind while the
UI says deleted. The opposite shortcut keeps every body forever. Financial and
organizational records have independent obligations. **Severity: High.
Likelihood: plausible** if generic CRUD or demo cleanup is reused. The mixed FK
graph, P9 note/audit representations, P27 C08 and P9's explicit prohibition on
borrowing financial timers for Name/Phone substantiate the risk. **Impact:**
requires precise cleanup scope; does not invalidate no new access.
**Permanent fix / exact change:** D3-C04/C06/C10: source-governed removal,
retention/holds and derivatives; immutable attribution where required; no
forced FK bypass, arbitrary duration or permanent plaintext assumption.

### D3-R04 — A tidy list creates duplicates or corrupts useful facts

**What/why:** Removing a prospect deletes or globally deactivates the canonical
person; archived records disappear from safe matching; same-email merges combine
household members or permissions; stale private assertions overwrite a better
shared address. Clean appearance can conceal worse data. **Severity: High for
cross-record loss/disclosure; Medium for routine duplication. Likelihood:
plausible**, supported by P4/P9 boundaries and the vendor archive/matching
counterexample. **Impact:** qualifies “clean/useful,” without choosing an archive
feature. **Permanent fix / exact change:** D3-C04/C05: context-scoped lifecycle,
source-authorized correction, provenance and revision checks; hidden-safe
matching even when not in the active view; no automatic merging or consent.

### D3-R05 — Private preparation and real organizational duties are coupled

**What/why:** Offboarding silently completes or hides an accepted obligation,
leaves a departed person looking responsible, waits to revoke until handoff, or
creates a mandatory task for every tentative prospect. **Severity: High for
lost duties; Medium for needless work. Likelihood: plausible** if legacy personal
tasks or a primary contact pointer become the continuity authority. P27 A07/A08
and ADR-0183 explicitly reject these substitutions. **Impact:** preserves both
A and existing continuity. **Permanent fix / exact change:** D3-C02/C03/C07:
accepted work follows its source; no guessed successor or false completion;
private preparation creates no new organizational duty.

### D3-R06 — Races or retries turn a valid action into the wrong effect

**What/why:** A stale share commits after revocation; an accepted share is
reported undone when its response or notice fails; cleanup races a correction;
restore/reimport repeats an old effect or republishes restricted facts.
**Severity: High. Likelihood: plausible** under normal poor networks and
concurrency, though incidence is unmeasured. Prior executed D1/D2 mechanics
demonstrate why stale prechecks and transport-only deduplication are inadequate.
**Impact:** adds acceptance/recovery proof, not a workflow system.
**Permanent fix / exact change:** D3-C08/C10: order source acceptance against
revocation and revisions, retain durable operation identities, recover the same
accepted outcome under current access and reconcile restore before opening reads.

### D3-R07 — Privacy or cleanup wording is reassuring but false

**What/why:** “Private,” “only you,” “delete,” or a global “inactive contact” badge
implies more than the operation does. Repeated modals slow field work; staff may
already have separate authorized facts about the same person. **Severity:
Medium, High where wording induces unsafe disclosure. Likelihood: plausible**
until representative users demonstrate comprehension. D1/D2 semantics and
primary accessibility/CRM evidence support contextual, precise copy.
**Impact:** clarifies UI; no extra permission step. **Permanent fix / exact
change:** D3-C11/C12 and the minimal copy below: source-scoped status, one short
explanation, specific action labels, accessible errors and honest saved outcomes.

### D3-R08 — Paper compliance hides unfinished lifecycle and operation gaps

**What/why:** A mock/archive button or narrow test is treated as qualification;
unbounded cleanup queries scan entire tenants; operators repair records by
reading private content; erased actor IDs defeat diagnosis; rollbacks revive
broad readers. **Severity: High for access/history failures; Medium for burden
and slow queries. Likelihood: plausible** because this source producer and
complete lifecycle are not implemented in inspected paths. **Impact:** requires
release evidence, not new product complexity. **Permanent fix / exact change:**
D3-C06/C09/C10/C12: protected source receipts and minimal logs, actual grants/FK
census, bounded queries, compatible cutover and explicit proof gates. Do not
replace missing evidence with “monitor later.”

## All 22 requested categories

Each category was evaluated separately. “No new material concern” is scoped to
this decision, not a certification of the entire repository.

| #   | Category                                  | Material concern and result                                                                                                                                                                                                                                                                                                                               |
| --- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity, alternatives | **No material concern with the selected direction.** A removes an unevidenced exception instead of building a custodian flow. Strongest alternative is limited purpose-specific continuity access, but no concrete need has been established. Privacy/continuity UX still needs proof (R07); organization ownership alone does not favor the alternative. |
| 2   | Brittleness                               | **Yes — R02/R06.** Person IDs, stale role claims, absence inferred from inactivity and happy-path retries are fragile substitutes for current source state. C03/C08/C09 address them.                                                                                                                                                                     |
| 3   | Technical debt                            | **Yes — R02/R03/R08.** Reusing legacy task deletion, donor association, demo cleanup or a new private lifecycle engine would perpetuate contradictory ownership. Use existing source owners and retire only reached incompatible paths through C09/C10.                                                                                                   |
| 4   | Edge cases                                | **Yes — R02–R06.** Temporary absence versus departure, same-person return/new assignment, existing shared contact, independent protected match, shared household address, pending share, unknown result and restored data have distinct outcomes. Proof matrix covers them.                                                                               |
| 5   | Footguns                                  | **Yes — R01/R03/R04.** Generic Delete user, reassignment, same-email merge or archive-as-permission can expose or destroy data. C01/C04/C05/C06 forbid those substitutions.                                                                                                                                                                               |
| 6   | Tenant safety                             | **Yes — R01/R02/R08.** Cleanup IDs, aggregate orphan reports, worker context and caches can cross tenants or expose a different source audience. C09 requires tenant-bound relationships and authorization before discovery; no global fallback.                                                                                                          |
| 7   | Database, RLS, authorization safety       | **Yes — R01–R04/R06.** Check real grants, USING and WITH CHECK, mutability, composite tenant references, null semantics, FK deletes, role bypass, views/RPCs and server-derived attribution. No new money fields or arithmetic are introduced; financial records remain with their owners. C04/C08/C09/C10.                                               |
| 8   | Overengineering                           | **No material concern in A itself.** It adds no role, approval flow or exception engine. A cleanup builder, mandatory offboarding questionnaire or private-prospect review queue would introduce avoidable complexity; C01/C07/C11 keep those out. Source safety is still necessary.                                                                      |
| 9   | UX/UI and friction                        | **Yes — R07.** False privacy/deletion promises, repeated warnings, ambiguous inactive state, lost input and poor phone/error access matter. Use the small UI below; retain international contact values, timezone truth and existing accessible components.                                                                                               |
| 10  | Source of truth, ownership, invariants    | **Yes — R03–R05.** Login, canonical person, preparation, current permission, responsibility and retention are different facts. C01–C07 preserve one owner for each; cleanup is not a new master.                                                                                                                                                          |
| 11  | Hidden coupling                           | **Yes — R02–R05.** Auth deletion/FKs, donor primary association, notes, Tasks Hub and notification recipients must not implicitly choose each other's lifecycles. Source transitions replace incidental cascades.                                                                                                                                         |
| 12  | Failure modes                             | **Yes — R03/R06/R08.** Blocked deletes, partial secondary cleanup, lost responses, stale projection and unknown accepted share must remain distinguishable. Failure cannot reopen access or repeat disclosure; C08/C10/C11.                                                                                                                               |
| 13  | Lifecycle, time, concurrency, idempotency | **Yes — R02/R05/R06.** Departure is not inferred inactivity; accepted share ordering matters; return is not old-grant revival. No elapsed-time purge or silent replay. C03/C06/C08 plus P03/P07/P08/P10 below.                                                                                                                                            |
| 14  | Data integrity                            | **Yes — R03/R04/R05.** Cascades, null attribution, hidden duplicate suppression, stale writes and lost obligations can leave clean-looking but wrong data. C04–C08 preserve source facts and histories.                                                                                                                                                   |
| 15  | Security/privacy                          | **Yes — R01/R02/R03.** Logs, generated files, backups, storage, impersonation and staff cleanup views must respect the same purpose. Retained content is not accessible merely because the author left. C01/C06/C09/C10.                                                                                                                                  |
| 16  | Scalability/performance                   | **Yes — R08, unqualified rather than demonstrated failure.** Check indexed current-authority/lifecycle predicates, authorization before pagination/counts and bounded disposition batches. No supported tenant size, response-time claim or retention volume is established; C12 requires measured production-shaped budgets.                             |
| 17  | Operational burden                        | **Yes — R03/R05/R08.** Blocked deletes and unknown ownership invite manual SQL repair or private review queues. Use source-owned dispositions and safe diagnostics; no guessed successors, body-reading inventory or direct-FK repairs.                                                                                                                   |
| 18  | Observability/auditability                | **Yes — R01/R03/R08.** Deleting attribution, copying private text into audit or confusing auth success with completed lifecycle makes correction unsafe. C06/C08/C09 retain minimal protected business evidence separately from technical logs and ordinary staff history.                                                                                |
| 19  | Dependencies/integrations                 | **Yes — R02/R03/R06.** Supabase Auth/Storage/FKs have different semantics; imported/queued/restored work can retain stale authority. No new vendor is needed. C03/C08–C10 retain source ownership and valid current eligibility; optional sync/workflows do not gate native restriction.                                                                  |
| 20  | Migration/rollout/upgrades                | **Yes — R03/R08.** Existing records do not prove private/shared provenance; mixed-version writers and old broad readers can undermine the boundary. C10 requires source/data census, compatible stages, restore denials and safe roll-forward.                                                                                                            |
| 21  | Testability/traceability/proof            | **Yes — R08.** Existing docs and synthetic probes do not prove real departure. Link D3 through glossary, owner reconciliation, future OpenSpec/design/tasks/tickets and P01–P14 release evidence only at authorized transitions.                                                                                                                          |
| 22  | Other development hazards                 | **No additional distinct material concern found.** Checked emergency admin shortcuts, accidental production cleanup, absolute privacy claims, unsupported blanket retention and rollback resurrection; all are already assigned above rather than duplicated as speculative new findings.                                                                 |

## Exact clauses to carry into the later authorized specification

- **D3-C01 — No new reader.** Departure/incapacity adds no right to discover,
  read, export, transfer or publish unshared preparation. No administrator,
  successor, cleanup job, impersonation path or continuity label supplies a new
  human audience. Existing independently authorized functions retain only their
  established scope; there is no new continuity exception.
- **D3-C02 — Independent facts survive.** Already shared contacts, independent
  canonical facts and accepted duties retain their source meanings and access.
  Removing preparation neither unshares nor deletes those facts or grants its
  author wider staff visibility. D2's optional selected-staff notice remains
  attention, not assignment or access.
- **D3-C03 — End current access through its owner.** Permission termination
  follows authoritative P12/source state and does not wait for deletion or
  handoff. Inactivity, missing voluntary logs and temporary unavailability are
  not departure signals. Return requires current source authority and separately
  qualified historical access; expired/revoked grants do not resurrect.
- **D3-C04 — Scope cleanup to the intended source.** A removal operation on
  preparation cannot delete/global-deactivate a canonical person, sever
  financial/identity lineage, clear suppression, erase accepted duties or affect
  another worker's context. No physical FK cascade is accepted merely because
  it is already in a migration.
- **D3-C05 — Quality preserves truth.** Validate the facts needed for the actual
  job without compulsory invented names, email, country or giving status.
  Age, absent gifts and missing voluntary notes do not establish inaccuracy,
  inactivity or a reason to delete a person.
  Corrections preserve provenance and conflict detection. Safe identity
  resolution considers relevant retained records under current authority even
  when excluded from an active view; no hidden-match disclosure, automatic
  same-email merge, low-confidence canonical overwrite or inherited consent.
- **D3-C06 — Exact disposition, not a blanket timer.** Before activating the
  preparation source or a new cleanup operation, qualify removable bodies,
  retained evidence, holds, derivatives,
  retention triggers/durations and restore behavior with the source owner.
  Apply an established policy only within its qualified scope; bring any missing
  material policy choice back to the grill rather than inventing a duration.
  D3 specifies neither immediate deletion nor perpetual retention. Audit
  attribution and effect tombstones do not require unlimited plaintext or live
  login access. Retaining a record grants no ordinary read right.
- **D3-C07 — Real duties remain real.** Accepted duties follow existing
  source-owned responsibility and handoff rules. An ineligible/departed person
  cannot appear as healthy current coverage; no guessed successor, false Done
  or silent removal follows. A tentative unshared prospect creates no duty,
  cleanup task, reminder quota, missing-log penalty or mandatory staff queue.
- **D3-C08 — Ordered, recoverable transitions.** Source acceptance rechecks
  current tenant, principal, authorization and revision against concurrent
  revocation/correction. A share accepted first remains accepted history;
  later authorized correction or restriction remains possible. A revocation or
  narrowing that removes authority required for this share, ordered first,
  rejects the stale intent. An unrelated revoked grant does not erase another
  currently valid authority path. Retries recover the same durable
  business effect under current access; failures in refresh/notification cannot
  repeat or reverse acceptance. Cleanup/reimport never replay outward effects.
- **D3-C09 — One effective authorization boundary.** Derive tenant, actor,
  author and audit attribution from trusted context. Bind relationships to
  tenant/source identities; constrain caller-mutability of owner, visibility
  and lifecycle fields. Inspect grants, both mutation-policy checks, actual
  view/function owners, service paths, Storage and all derivatives. No null
  owner, author ID, historical role or current responsibility is an access grant.
  Clear stale presentation and reject late results after context changes.
- **D3-C10 — Source-preserving cutover and restore.** Inventory reached data,
  constraints, copies and pending effects before lifecycle migration; do not
  infer empty production from old docs or infer sharing from legacy row presence.
  Fence incompatible writers/readers; reconcile current denials and disposition
  before restored data/queues reopen. Rollback cannot widen access or replay
  sharing. Use source-approved correction, not ad hoc unlinking to defeat FKs.
- **D3-C11 — Small, honest UI.** Show whether the eligible contact details are
  available to staff, keeping private notes/planning audience distinct. Explain
  departure behavior contextually and cleanup consequences at the relevant
  action. No repeated modal, compulsory wizard or custodian choice. Saved,
  unavailable, failed and unknown remain distinct; post-submit close is not a
  cancellation guarantee. Existing shared components provide keyboard, focus,
  screen-reader status and mobile reflow behavior.
- **D3-C12 — Evidence before activation.** Prove the outcomes below through
  actual source services and Supabase roles/API/session/cache paths, not only
  mocks. Establish retained-data/query and representative user/device/network
  budgets before release. Do not claim a measured gain, safe retention policy
  or complete return path without the corresponding evidence.

## Minimal UX and data-quality direction

This is a design recommendation grounded in the selected rights, not an extra
disclosure or deletion policy.

| Place                                             | Minimal presentation                                                                                                                                              | Meaning                                                                                                                                                                                                                                                     |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contact-details section of restricted preparation | **Not shared with staff**                                                                                                                                         | A text status for these prepared contact facts, not a claim that the person is unknown everywhere in the organization. After D2, the contact can be available to staff while private notes/planning remain excluded. Do not rely only on a lock icon/color. |
| First-use or nearby explanatory help              | “These prospect details are not shared with staff until you choose **Make available to staff**.”                                                                  | One short explanation; repeated entry does not require a privacy modal. Existing independent CRM facts retain their own access.                                                                                                                             |
| Relevant departure/help context                   | “Leaving the organization does not share these details with staff.”                                                                                               | No new handoff right. Do not display a departure warning on every contact edit or promise permanent secrecy/deletion.                                                                                                                                       |
| D2 share review                                   | Keep the ratified organization, exact eligible contact facts, private-note exclusion and optional named-staff notification.                                       | D3 adds no step or notification.                                                                                                                                                                                                                            |
| A future approved cleanup control                 | Name the exact operation and what it affects; distinguish removal from a working list from permanent deletion.                                                    | No unimplemented Archive/Delete button, generic “all data removed” message or silent global contact deactivation.                                                                                                                                           |
| Access ends while a page is open                  | Clear unavailable protected detail and use the existing access-ended state. Preserve a safe explanation of any accepted operation only when currently authorized. | Do not leave a working editable form or invent successful cleanup. A previously accepted share is not undone.                                                                                                                                               |

“Clean useful data” has four concrete, non-speculative requirements now: accurate
source facts; no accidental duplicates/overwrites; active views that do not
misrepresent current access or responsibility; and lawful disposition that does
not destroy independent history. It is not measured by minimizing row count.

The smallest **candidate** for ordinary voluntary cleanup is an author-controlled
way to take unused preparation out of their active list, with clear recovery
where retention permits. That is not global contact archival and not selected
by D3. Its product choice belongs next in the grill; a retention duration or
automatic departure purge must not be smuggled in with it.

Names/addresses retain international scripts and source-supported formats; no
invented mandatory email or Western name split improves this decision. Time
labels display the actual source event in the user's locale/timezone, while
permission ordering uses authoritative state rather than a device clock. Poor
network recovery reconciles the same command; it does not add offline copies
or automatic replay of consequential actions.

## Independently testable outcome proof

These are acceptance obligations, not a claim that the future source exists.
Removal-specific cases apply only to an already permitted or subsequently
selected owner-qualified operation. Otherwise prove its truthful unavailable or
denied result and required retention; D3 does not require a new Delete feature.

| ID     | Outcome to prove                                                                                                                                       | Important negative/boundary case                                                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D3-P01 | End a missionary's authority; staff/successor gain no unshared contact or private narrative.                                                           | Names, counts, facets, audit, exports, cleanup summaries, deep links and recovered results remain protected; test another tenant.                                                               |
| D3-P02 | A previously shared contact and independently authorized facts remain available under their own rules.                                                 | No private notes join the shared record; no new assignment or notification appears solely from departure.                                                                                       |
| D3-P03 | Revocation takes effect through actual API/RLS/service/cache paths despite a retained profile and previously issued token.                             | Legacy role fallback, open tab, same-user context change, late response and pending mutation cannot bypass current authority.                                                                   |
| D3-P04 | Any selected/owner-permitted data removal obeys the exact retained-data/FK contract; unsupported operations remain unavailable.                        | Cascade-only, blocking-reference, SET NULL and historical attribution cases; a rejected statement leaves no committed partial cascade. The executed probe establishes selected mechanics only.  |
| D3-P05 | Permitted preparation correction, and removal if selected/authorized, leave canonical identity, another worker's work, finance and suppression intact. | Existing shared contact, household/shared email, hidden match and concurrent canonical edit; no new removal right is inferred.                                                                  |
| D3-P06 | Accepted source work remains truthfully accountable without exposing preparation.                                                                      | No fake completion, guessed successor or revocation delay; an unshared idea alone creates no task.                                                                                              |
| D3-P07 | Share/revoke order has one truthful source outcome for the authority required by the share.                                                            | Actual concurrent sessions in both orders; unrelated revocation with another valid path; old browser request after required authority ends; notification/response failure after accepted share. |
| D3-P08 | Repeat operations and unknown responses resolve once under current access.                                                                             | Same effect via different transport keys, changed payload, stale revision, cleanup/reimport and no historical outward replay.                                                                   |
| D3-P09 | Effective grants/policies block forbidden row transformation.                                                                                          | Cross-tenant/source FKs, caller author/owner fields, owner-null fallback, visibility/lifecycle edits, broad permissive policy, views/RPC/service roles and Storage.                             |
| D3-P10 | A returning user gets only currently qualified source/history access.                                                                                  | Same valid assignment versus a recreated one; old email, expired grant or restored backup does not independently authorize.                                                                     |
| D3-P11 | Migration/restore preserves restrictions, attribution and dispositions before activation.                                                              | Mixed-version reader/writer, ambiguous legacy provenance, pending jobs, rollback and inability to establish current authority.                                                                  |
| D3-P12 | Representative missionaries correctly explain sharing, departure and the proposed cleanup action.                                                      | Keyboard/screen reader, phone reflow, long international values, touch access and poor-network interruption; no repeated privacy ceremony.                                                      |
| D3-P13 | Lifecycle queries and recovery remain bounded at representative retained-data sizes.                                                                   | Authorization before pagination/counts, protected large tenants, current-authority indexes, concurrent work and expired retention candidates. Establish budgets from evidence, not this report. |
| D3-P14 | Staff can diagnose a failed permitted lifecycle action without seeing private bodies.                                                                  | Required source receipt/actor survives appropriate account lifecycle; telemetry contains minimal context; audit is not an alternate reader.                                                     |

## Synthesis: what to do, in order

1. **Before recording:** retain A, explicitly exclude cleanup-based access, and
   distinguish selected rights from unselected retention/removal policy. No new
   product exception is necessary. Record the clarified decision and glossary.
2. **Resolve next in the grill:** the ordinary unused-preparation cleanup
   behavior. Later qualify exact retention/disposition and returning-user history
   through their owners. These are explicit remaining branches, not approved
   automatic behavior or reasons to reopen A.
3. **In the later authorized spec/design:** reconcile C01–C12 with P4/P9/P12,
   P27 and reached storage/communication owners. Identify the exact source
   producer and lifecycle; do not duplicate global offboarding or create a
   shadow contact/permission/task system. Carry requirements and proof IDs
   consistently through OpenSpec, design, tasks and eventual issues.
4. **Implementation safeguards:** correct reached legacy authorization paths,
   bind source identities/revisions, protect derivatives, retain honest receipts
   and fence incompatible writers. Inventory actual retained data/FKs before
   destructive changes. This session does not implement those changes.
5. **Before release:** prove the applicable P01–P14 outcomes at the real seams,
   including denied/unavailable unselected operations and source-valid
   retention/restore and UX/query budgets. A qualified independent capability
   need not wait for unrelated finance/provider gates; missing preparation
   lifecycle qualification cannot be disguised by a generic archive button.
6. **Monitor only the bounded regressions below.** No missing voluntary logs,
   old prospects or inactive missionaries become a performance score or staff
   review queue. Privacy, retention and user comprehension are release gates.

| Signal                                                                                                                | Threshold              | Owner                                                           | Response                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Confirmed unauthorized preparation result after departure or audience widening through cleanup                        | Any confirmed instance | P12 access owner with P9 source owner                           | Disable affected read/command/projection, contain disclosure, correct authorization and re-prove before enabling.                                                                         |
| A new consequential operation succeeds after its required current authority ended, or an expired grant is resurrected | Any confirmed instance | P12 access owner                                                | Stop affected acceptance, invalidate stale paths and reconcile truthful source outcomes; preserve other independently valid authority paths and never delete people to repair permission. |
| Required lifecycle receipt/attribution missing, or independent source facts changed outside the authorized effect     | Any instance           | P9 source owner; financial owner if affected                    | Pause affected lifecycle writer and recover from source evidence; no broad replay or ad hoc FK bypass.                                                                                    |
| An accepted organizational obligation remains assigned as healthy to a source-confirmed ineligible actor              | Any confirmed instance | Obligation's source responsibility owner / P27 where applicable | Use the existing source exception and authorized disposition; do not expose preparation or invent a successor.                                                                            |

These are required future signals, not monitors configured in this session.
Retention backlog and performance thresholds must derive from the eventual
qualified policy/budget; none is invented or delegated to vague monitoring here.

## Adversarial check

### What could go wrong with this answer?

Cleanup could expose private details, delete unrelated history or leave a valid
old access path. Source-scoped lifecycle, current authority and explicit
independent-record preservation address those failures without a new reader.

### What hidden assumptions are we making?

We have no evidence that unshared tentative prospects create a continuity duty.
We also have no authority to infer a purge timer, permanent archive or automatic
return access from “clean useful data.” Those assumptions are rejected.

### How does this affect the whole product?

One native CRM retains its canonical facts, financial history and accepted
work. Auth, preparation, responsibility and disposition keep distinct owners.
Departure adds no staff, coach, successor, notification or outreach authority.

### How does this affect the end-user experience?

A clear **Not shared with staff** status and contextual explanation suffice.
No routine departure modal or special permission workflow appears. Any later
cleanup action explains precisely what disappears from view and what is retained.

### Does this follow modern best practices?

Yes as a qualified direction: least privilege, explicit lifecycle meaning,
reversible view cleanup where chosen, source-safe matching and honest history.
Vendor-wide reassignment and archive exclusion from matching are counterexamples
to examine, not defaults to copy. User benefit still requires user evidence.

### Does this fit Asym’s existing repo and product direction?

Yes: ADR-0001's native CRM, P4/P9 identity ownership, P12 authority and P27/ADR-0183
continuity support it. Current read-only admin UI, mixed delete graph and legacy
fallbacks are implementation gaps, not reasons to weaken the selected policy.

### Should we adjust the recommendation?

Keep A. Add the exact boundaries above and treat cleanup as a separate, small
product choice. Do not turn good data hygiene into an access exception, destructive
shortcut or a new administration subsystem.
