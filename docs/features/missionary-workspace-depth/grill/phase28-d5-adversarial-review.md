# Phase 28 D5 — direct contact correction governed by tenant permissions

**Disposition: Accept with required amendments.** Keep the founder's selected
direct correction and meaningful tenant settings. Use Core's existing permission
owners to make the settings, missionary editor and accepted database operation
agree. No separate permission system or routine staff approval is needed.

Reviewed October 16, 2026 (Asia/Bangkok) against
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. This is the completed research and
decision review, not a formal specification, owner-contract amendment,
implementation or release qualification. `/to-prd` and `/to-issues` remain
separate explicit transitions. No application, live data, permissions, provider,
notification or GitHub state was changed.

**Ratified October 16, 2026 (UTC):** the founder explicitly accepted this
decision and its required amendments: “Ratify this decision and amendment.
Then continue with this phase 28 grill-with-docs session.” D5 and C01–C17 are
therefore ratified. The accepted design direction remains subject to the exact
owner and runtime qualifications below; illustrative labels/layout are not a
mandated route or additional permission model. Ratification does not authorize
implementation or change the explicit workflow transitions above.

## Exact corrected decision to record

> **D5 — Direct ordinary contact correction under tenant permissions.**
> Missionaries can directly correct eligible ordinary shared contact details
> within their permitted workspace when the organization's current permissions
> allow it. The tenant controls the relevant missionary-purpose actions and
> eligible fields in tenant settings, through the existing permission system.
> Tenant configuration cannot override protected records, field/source limits
> or another domain's authority. Sharing, authorship and missionary status alone
> never grant editing rights.
>
> Give authorized tenant administrators a focused contact-editing entry in the
> existing permissions settings. Show what the configuration actually permits,
> including inherited restrictions and any pending governed change. Settings
> administration and contact editing are separate powers. Do not create a second
> permission flag, role builder, per-contact access list or approval inbox.
>
> The missionary sees the current permitted experience: editable controls only
> for eligible corrections, readable values where viewing but not editing is
> allowed, and no protected values where viewing is forbidden. Distinguish
> permission checking/unavailability from confirmed read-only access. Explain
> the shared effect briefly, then use one ordinary Save. No routine approval
> or extra confirmation is required for an already authorized correction.
>
> Save applies only the selected corrections to the authoritative contact source
> after current authorization and conflict checks. Preserve untouched fields,
> international values, lawful history and required attribution. Reject the
> whole selected action when any submitted correction is invalid or forbidden.
> Recover interrupted outcomes without repeating an accepted effect or
> overwriting newer information.
>
> Contact correction does not itself verify possession, change login or legal/
> billing/public identity, merge people, grant consent, send a message, alter
> giving or publish private notes. Apply each changed field's exact owner
> consequences; phone, email and postal corrections are not interchangeable.
> D1–D4 retain their audience, continuity and archive meanings.
>
> D5 creates neither a universal grant nor an invented installation preset.
> Preserve independently valid permissions; missing or unknown authority remains
> unavailable under the existing deny-by-default rules. Qualify the exact
> tenant/source/field mapping and migration before activation. Completion must
> prove a real tenant-authorized missionary can successfully correct a contact,
> as well as proving forbidden actions fail.

**Ratified:** direct correction, tenant control, simple and truthful UI.
**Ratified amendments:** the exact boundaries above and C01–C17 below.
**Accepted design direction:** the focused settings layout, labels and form-state
patterns below. **Not selected:** every field as editable, automatic grants for
all existing missionaries, a permanent all-tenants-off preset, blanket staff
approval, per-contact collaborators, notification, bulk editing or a new
retention policy. Tenant customization here concerns this contact-correction
purpose; it does not silently reopen unrelated Phase 28 permissions.

## Evidence, current behavior and limits

| Evidence class             | Established finding                                                                                                                                                                                                                                                       | Limit                                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder                    | Selected A and explicitly requires tenant settings plus UI that accurately reflects permission.                                                                                                                                                                           | No measured missionary/staff pilot, correction frequency or impact estimate exists. Reduced handoffs is a product judgment, not a measured outcome.                                                  |
| Governing owners           | P12 supplies one resolver, additive grants within one active assignment, source/field floors and distinct administration authority. P3/P11 own field policy; P4/P9 own identity/contact correction.                                                                       | These target contracts do not prove the exact new missionary correction/configuration path exists.                                                                                                   |
| Existing edit intent       | The active roster-safety OpenSpec delta already requires specific authorized named-partner profile/tag edits to keep working, while rejecting redacted identities.                                                                                                        | D5 is not the first-ever missionary edit. Reconcile these scoped rights with later exact field/source policy; neither a blanket revoke nor retention of an overbroad legacy payload is justified.    |
| Current settings           | Organization-settings handler is for post visibility, targets a fixed tenant, uses a coarse admin gate and checks SQL error rather than affected state. Tenant field overrides are explicitly dormant.                                                                    | Static scoped source findings; actual cross-tenant access or deployed settings behavior was not tested. Reusing these paths unchanged would not satisfy D5.                                          |
| Current editor/mutation    | A phone-only edit submits a broad snapshot; server constructs an address with `country: "USA"`, writes hidden/defaulted frequency and lacks relevant revision/audit/recovery checks.                                                                                      | Concrete source-level failure mechanisms if affected records/conditions exist; no live donor data was inspected or changed. The strict schema does reject arbitrary unknown keys.                    |
| Useful existing safeguards | Trusted server context, tenant/association/nonanonymous predicates, strict validation, read-only browser donor grants, shared Base UI and a field-ceiling parser.                                                                                                         | These are useful components, not the selected field/purpose authorization, tenant configuration or complete journey.                                                                                 |
| Primary platform evidence  | Fresh Supabase RLS/column/API/function docs, PostgreSQL 17 policy/grant/isolation docs and relevant changelog entries.                                                                                                                                                    | Documentation mechanics do not qualify applied Core grants, hosted versions, RPCs, Storage or privileged paths.                                                                                      |
| Primary UX comparisons     | Nonprofit CRM permission/editing separation, effective-permission inspection, current W3C and Base UI form/status guidance.                                                                                                                                               | Public documentation; no authenticated vendor testing or representative user feedback. Vendor defaults do not confer Asym rights.                                                                    |
| Executed mechanics         | PostgreSQL 17.11: 25/25 expected outcomes passed, including three controlled two-session races with observed lock waits. Selected-field authority, atomic correction/evidence, retries and an unsafe table/column-grant counterexample were tested; cleanup was verified. | Illustrative effective-authority snapshot, not the P12 resolver, final Core schema, Supabase Auth/Data API or browser qualification. Expected unsafe behavior is not an observed Core vulnerability. |

Evidence notes: [owner permissions](d5-evidence/owner-permissions.md),
[current runtime](d5-evidence/current-runtime.md),
[contact consequences](d5-evidence/contact-consequences.md),
[UX research](d5-evidence/ux-research.md),
[product synthesis](d5-evidence/product-synthesis.md),
[technical research](d5-evidence/technical-research.md), and
[PostgreSQL probe](d5-evidence/postgres-probe/README.md).
The [Q5 pre-answer research](phase28-q5-correction-research.md) retains the
original alternatives; it is not the answer or a competing permission policy.

## Concern register

Severity is harm if the failure occurs; likelihood is conditional engineering
judgment, not measured production incidence. Every concern identifies its
decision effect and exact preventive clauses/proof below.

### D5-R01 — Tenant settings create a second or misleading authority

**What could go wrong/why:** An application switch disagrees with P12, a static
`editable` ceiling is treated as a grant, the settings screen changes the wrong
tenant, or any person labeled admin can widen access. Removing one grant may
still leave another valid grant while the UI says editing is disabled. This
undermines the tenant's control and can permit unauthorized changes.
**Severity: High. Likelihood: plausible, high if current settings are copied
unchanged. Evidence:** P12's single resolver/additive grants/active assignment/
administrative ceiling; dormant P3 overrides; the fixed-tenant settings handler.
**Decision impact:** requires an exact integration, preserves A and tenant
control. **Permanent fix/exact wording:** C01–C03/C11/C15. Administer the existing
source model, show effective versus configured/pending state, and preserve
distinct management rights. Prove P01/P02/P04–P06/P18.

### D5-R02 — “Contact details” becomes blanket authority over other facts

**What/why:** A visible field or broad editor makes Name/Phone/email/address,
household representation, contact preference, private notes, legal identity and
giving fields seem equivalent. A missionary can change another source or
read fields solely because the editor expects them. **Severity: High.
Likelihood: plausible. Evidence:** the current editor's broad field set,
P9 B17's explicit exclusions and distinct P4/P25 email/postal contracts.
**Decision impact:** narrows eligible corrections to exact source/subject/field
purposes; it does not quietly reduce the feature to phone-only forever.
**Permanent fix/exact wording:** C02/C04/C08/C12. Qualify a named field inventory
and the bounded third-party missionary capability; field ownership is not a
tenant-editable label. Prove P03/P07/P14/P15.

### D5-R03 — A small edit overwrites unrelated, hidden or newer data

**What/why:** The current full snapshot/defaults can turn a phone edit into a US
address replacement, frequency change, clearing a redacted field or overwriting
a staff correction. A one-character name or missing email can block an otherwise
valid phone correction. **Severity: High. Likelihood: concrete conditional
mechanism if current form/writer is reused. Evidence:** exact form/default/payload
and mutation paths in the runtime note; existing tests even expect the US
country/default shape. **Decision impact:** changes the implementation contract,
not the simple Save experience. **Permanent fix/exact wording:** C04–C07/C12.
Selected corrections only; omission is unchanged, Clear is deliberate, and the
whole submitted action validates atomically. Prove P07/P09/P13/P17.

### D5-R04 — RLS appears safe while a privileged or column write bypasses policy

**What/why:** Same-tenant row access is mistaken for permission to edit every
column; a service-role command, RPC/view, direct table or caller-controlled
actor/tenant bypasses the chosen field policy. Revoking a column grant while a
table-wide grant survives has no intended effect. **Severity: High, potentially
cross-tenant or privacy-critical. Likelihood: plausible. Evidence:** primary
PostgreSQL/Supabase semantics and the current privileged writer. This is not a
claim that current browser donor UPDATE succeeds; committed grants are read-only.
**Decision impact:** requires end-to-end enforcement. **Permanent fix/exact
wording:** C02/C06/C13/C15. Inspect effective grants and both row states, lock down
unauthorized columns/attribution, and qualify every reached privileged path.
Prove P02/P04/P08/P18.

### D5-R05 — Stale permissions, concurrent edits and retries undo newer intent

**What/why:** Permission changes after opening the form; a precheck races a
revocation; two editors overwrite each other; a lost-response retry reapplies an
old phone number after a later correction. Conversely, a later revoke may be
misrepresented as undoing an accepted correction. **Severity: High for authority
and integrity. Likelihood: plausible under ordinary open tabs, poor networks and
staff/missionary overlap. Evidence:** P12 current epochs, P9 source revision and
recovery contracts, PostgreSQL concurrency, current missing revision/receipt.
**Decision impact:** adds ordered acceptance/recovery without user-visible
workflow complexity. **Permanent fix/exact wording:** C06/C07/C10. Current exact
authority plus relevant revision; atomic required evidence; replay returns a
historical outcome without repeating it. Prove P09–P13/P16.

### D5-R06 — The UI lies about what is allowed or what was saved

**What/why:** An enabled pencil is a false promise, a disabled field looks like
broken software, a loading policy looks like an explicit denial, or typing clears
a permission error and suggests Save is allowed again. Background refresh wipes
drafts; zero-row success or refresh failure produces false feedback. Blanket
denial can also make the selected capability useless. **Severity: Medium–High.
Likelihood: plausible. Evidence:** current anonymity-only edit gating, draft/reset/
generic result paths and current form-component semantics. **Decision impact:**
requires a coherent settings/editor state model and positive journey, not extra
warning dialogs. **Permanent fix/exact wording:** C09–C12/C17 and the UX tables.
Prove P01/P03/P06/P12/P16/P17/P20.

### D5-R07 — Correction silently changes consent, identity or prepared work

**What/why:** A new email is treated as verified or subscribed, a phone edit
changes SMS consent, a postal correction rewrites issued documents, or every
contact edit invalidates unrelated channel work. The opposite error leaves old
address-dependent work usable after its source withdraws it. **Severity: High.
Likelihood: plausible** because current forms mix preferences and addresses and
the owners deliberately separate these effects. **Evidence:** P4 claiming,
P6 recipient/current-dispatch authority, P9 B17 and P25 exact email/postal
contracts. **Decision impact:** requires source-specific consequences; no new
founder consent choice is needed to preserve accepted owners.
**Permanent fix/exact wording:** C04/C08/C14. No generic synchronization,
verification, send or cancellation; apply the exact changed source/purpose's
effects durably. Prove P14/P15/P20.

### D5-R08 — Drafts, history, settings previews and logs become broader readers

**What/why:** Removing permission to view a field leaves its value in a DTO,
hidden input, draft, cache, log, notification or privileged permission preview. A read
revocation leaves sensitive data visible; audit copies complete contact bodies
into a broader log. Clear/restore can resurrect an older fallback value.
**Severity: High. Likelihood: plausible. Evidence:** existing same-user cache
and source fallback concerns, D1–D4 and source/history constraints.
**Decision impact:** qualifies derivatives and recoverability; no new retention
schedule or archive reader. **Permanent fix/exact wording:** C09/C10/C14/C15.
Minimize and protect every derivative; preserve drafts only while display is
allowed; a permission preview is not impersonation. Prove P02/P05/P12/P15/P16/P18.

### D5-R09 — A new UI is activated over dormant policy and incompatible writers

**What/why:** Tenant rows are written but ignored, global baseline rows are
relaxed, old APIs retain broad write behavior, or migration infers grants from
`missionary_id`, prior successful edits or field-ceiling flags. Rollback revives
older values/permissions. **Severity: High. Likelihood: high if the current
foundation is mistaken for delivery. Evidence:** dormant override reader/SQL,
legacy donor/profile paths and source-owner convergence obligations.
**Decision impact:** requires exact producer and rollout qualification; it does
not justify postponing unrelated native work. **Permanent fix/exact wording:**
C01/C13/C15/C17. Inventory and converge reached writers/readers, preserve source
provenance, fence incompatible paths and prove safe activation/rollback.
Prove P08/P14/P18/P20.

### D5-R10 — Excess configuration or weak proof makes the feature costly and unusable

**What/why:** A separate matrix/role builder, per-contact grants, generic approval
queue or per-field network request makes a small correction burdensome. A
deny-only demo, stale documentation or pretty mock is mistaken for successful
delivery; operators then widen grants or repair data manually. **Severity:
Medium, High if repair bypasses access. Likelihood: plausible. Evidence:** the
founder's simplicity requirement, existing P12 administration/resolver contracts,
unqualified current UI and package-version discrepancy noted in UX research.
**Decision impact:** keep the solution small and require actual affirmative
utility. **Permanent fix/exact wording:** C11/C16/C17. Reuse existing permission
administration and shared components, bound queries, and prove a real authorized
save plus the negative cases. No speculative scaling system or new dependency.
Prove P01/P17/P19/P20.

## Review of all 22 categories

| #   | Category                                                     | Material concern and conclusion                                                                                                                                                                                                                                                                                                                          |
| --- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity and alternatives                 | **No material concern with the selected job.** Correcting known contact facts is explicit founder intent. Staff-applied correction is the strongest alternative; A avoids routine coordination but requires bounded edit authority. Reuse existing permission/contact owners; no separate correction product is needed. Impact claims remain unmeasured. |
| 2   | Brittleness                                                  | **Yes — R01/R05/R06.** A UI flag, stale token, old form or assumed field availability fails when policy/context/data changes. C01/C02/C07/C09 require current source-backed decisions.                                                                                                                                                                   |
| 3   | Technical debt                                               | **Yes — R01/R03/R09.** Shadow settings, full snapshots, defaulted display DTOs and competing writer/fallback paths create permanent dual authority. C04–C07/C15 establish one correction source and compatible consumers.                                                                                                                                |
| 4   | Edge cases                                                   | **Yes — R02–R08.** Overlapping grants, mixed fields, missing email, shared phone/address, unverified destination, one-character name, Clear, last-moment revoke, lost response, concurrent staff change and stale pending policy are covered explicitly.                                                                                                 |
| 5   | Footguns                                                     | **Yes — R01–R04/R07.** Wrong tenant, all-staff admin, field ceiling as grant, full-payload Save, US default and consent/identity side effects are concrete hazards. Exact settings/field/source boundaries prevent them.                                                                                                                                 |
| 6   | Tenant safety                                                | **Yes — R01/R04/R08.** Policy management, correction, cache, preview and result recovery must bind one trusted current Tenant context. No default-tenant fallback, cross-hat union or cross-tenant matching.                                                                                                                                             |
| 7   | Database, RLS and authorization                              | **Yes — R01–R05/R09.** Grants plus RLS, USING/WITH CHECK, immutable attribution, column changes, composite relationships, valid defaults, privileged paths and all reached writers need actual proof. No new financial types/arithmetic are introduced.                                                                                                  |
| 8   | Overengineering                                              | **Yes, a bounded design risk — R10.** A separate permission engine, global toggle with hidden exceptions, per-contact ACL or approval inbox is unnecessary. Existing focused P12 administration and source editing are sufficient; no new configuration language.                                                                                        |
| 9   | UX/UI and friction                                           | **Yes — R03/R06/R10.** Effective permissions must drive visible states and honest feedback. A short scoped editor, one Save, clear shared effect, phone-friendly controls and persistent errors resolve the main risks. Donor checkout is not changed.                                                                                                   |
| 10  | Source of truth, ownership and invariants                    | **Yes — R01/R02/R07.** Permission policy, contact facts, claims, consent, private preparation and history have separate owners. Tenant settings administer permission sources; they do not become a second contact or authorization authority.                                                                                                           |
| 11  | Hidden coupling                                              | **Yes — R02/R03/R07/R09.** Contact email/claiming, postal-use generations, profile fallbacks, updated-at activity and static field ceilings must not acquire accidental D5 meaning. Use exact source consequences.                                                                                                                                       |
| 12  | Failure modes                                                | **Yes — R05/R06/R09.** Unknown acceptance, no affected row, required-audit failure, failed refresh and permission-resolution outage need distinct source outcomes and UI. No partial Save or permissive fallback.                                                                                                                                        |
| 13  | Lifecycle, temporal correctness, concurrency and idempotency | **Yes — R05/R07.** Policy proposal/effectivity and contact corrections have separate histories. Source authority/revision orders acceptance; old retries cannot reapply, later revocation does not undo accepted history, and device clocks do not decide.                                                                                               |
| 14  | Data integrity                                               | **Yes — R02/R03/R05/R07.** Preserve untouched values, exact Clear, shared identity, provenance and newer corrections. No guessed identity merge, shared-mailbox uniqueness or private override.                                                                                                                                                          |
| 15  | Security and privacy                                         | **Yes — R02/R04/R08.** Hide forbidden data at serialization, protect drafts/receipts/logs/exports, and keep private preparation separate. A readable contact does not imply editable fields or broader notes/history.                                                                                                                                    |
| 16  | Scalability and performance                                  | **Yes — R10.** Repeated per-field policy lookups, broad invalidation and unbounded settings previews can scale poorly. Honor P12's existing logical read budget; qualify actual plans/workloads before claiming latency or capacity.                                                                                                                     |
| 17  | Operational burden                                           | **Yes — R01/R06/R09/R10.** Misleading settings and missing recovery encourage overgranting or manual repair. Use safe effective-access diagnostics, authoritative results and supported source correction rather than developer intervention.                                                                                                            |
| 18  | Observability and auditability                               | **Yes — R05/R08.** Required policy/correction history, actor attribution and retry evidence are distinct from technical logs. Minimize values, protect audit access and record truthful accepted/no-op/rejected outcomes.                                                                                                                                |
| 19  | Dependency and integration risks                             | **Yes — R04/R07/R09/R10.** Supabase exposure/grants, actual UI versions and existing source consumers need qualification. Native contact correction requires no optional CRM sync, workflow, SMS or AI dependency.                                                                                                                                       |
| 20  | Migration, rollout and upgrades                              | **Yes — R09.** Dormant overrides, broad old writers, legacy values and retained rights require explicit compatible activation and rollback. Never infer grants from historical behavior or replay correction side effects after restore.                                                                                                                 |
| 21  | Testability, traceability and proof                          | **Yes — R10.** A mocked policy or synthetic fixture cannot prove tenant configuration through real correction. C17/P01–P20 trace the selected decision into later authorized owner reconciliation, OpenSpec/design/tasks/issues and release evidence.                                                                                                    |
| 22  | Other development hazards                                    | **No additional distinct material concern found.** Checked unsupported field presets, subscription prompts, bulk tools, overbroad tenant customization, arbitrary retention, offline sensitive drafts and bypass recovery; existing concerns cover them without adding features.                                                                         |

## Exact clauses for the later authorized spec/design

- **D5-C01 — One permission authority.** Expose tenant-controlled missionary
  contact correction through existing P12 capability/grant administration and
  P3/P11 field/source policy. No parallel app flag, custom policy engine,
  per-contact ACL, broad CRM grant or missionary-to-staff promotion. Qualify the
  exact built-in-field tenant policy path; Phase 3's reserved/dormant override
  shape does not prove that producer exists.
- **D5-C02 — Effective scope.** Resolve one trusted current Tenant assignment/
  acting context, applicable grants, eligible contact/source/purpose and field
  floors. Edit requires view; view/share/authorship does not grant edit. A removed
  grant is not a cross-grant deny; surviving valid paths still count. Do not union
  independent hats. Missing/unknown authority denies without inventing a new
  installation preset or removing independently valid missionary/staff/donor
  rights, including the scoped missionary edit intent in the roster-safety spec.
- **D5-C03 — Govern configuration, not each contact edit.** Require exact current
  tenant-policy administration authority and its live assignable ceiling.
  Preserve P12 grant controls and ADR0211 for actual projection-policy widening,
  including distinct-human approval, current-base apply and truthful pending
  state. Ordinary authorized contact-value Save needs no new approval. Tenant
  settings cannot change platform baselines or bypass protected-field floors.
- **D5-C04 — Qualified field inventory.** Name each eligible field, authoritative
  source/subject/purpose, existing validation, read/edit/Clear power and required
  side effects. Qualify the new missionary actor without broadening independent
  legal/Auth/represented-Party/financial/public/private-note authority. Reuse
  existing owners for email/postal rather than treating all fields as strings.
- **D5-C05 — Selected changes only.** Submit deliberate editable-field changes,
  not a normalized read-model snapshot. Omitted means unchanged; Clear is explicit
  and source-valid. Validate the whole selected action; a forbidden or invalid
  submitted field rejects it even if that field's value appears unchanged.
  Do not silently drop denied changes, force unrelated profile completion or
  manufacture a correction/interaction from a true no-op.
- **D5-C06 — Atomic authoritative Save.** For the qualified ordinary correction
  action, server-derived tenant/actor/attribution,
  current field/source authority and relevant expected revision govern acceptance.
  Commit selected values and required minimal source audit/activity/retry evidence
  atomically. No matching source or failed required evidence is not success.
  Subsequent telemetry/refresh failure does not negate accepted source truth.
- **D5-C07 — Safe competition and retry.** Order relevant policy/revocation and
  source changes at the owner boundary. Conflict rather than overwrite newer
  facts silently. Recover the same durable intent without repeating a write;
  changed meaning cannot reuse it. Recovered results obey current read access
  and cannot overwrite newer presentation state. An unrelated policy change
  cannot erase a surviving right; fresh qualification replaces stale evidence.
- **D5-C08 — Exact contact consequences.** Correction does not itself establish
  verified possession, login/claim/representation, consent, send, giving,
  identity merge or public/document revision. Apply only the changed source/
  purpose's required consequences, including applicable destination/postal-use
  invalidation. Any source-mandatory withdrawal fence or acceptance prerequisite
  must succeed as required before accepting the correction; eventual processing
  is not a substitute. Independently asynchronous post-acceptance work uses its
  owner's durable mechanism and truthful recovery. No D5-invented outreach or
  contact-change notice is added; separately required owner proof, security
  notice, withdrawal or exact-effect confirmation retains its qualified contract
  and pending/accepted meaning. Do not import donor-self email ceremonies into
  missionary corrections without that exact source rule. No new workflow engine,
  generic outbox or provider call is implied by D5.
- **D5-C09 — Permission-truthful presentation.** Derive visible values/actions
  from the same qualified context as the command. Distinguish editable, readable
  only, not viewable, checking and unavailable. Do not serialize values the caller
  is not currently authorized to view into hidden or disabled fields. Explain
  shared effect before Save and actual outcome
  afterward; no routine confirmation, reason form or invented staff handoff.
- **D5-C10 — Permission changes and drafts.** Reconcile current permission during
  editing and at Save. Keep drafts on ordinary validation/conflict while their
  continued display is authorized; explain loss of edit rights and prevent
  stale submission. Remove affected data on loss of read authority/context
  change and reject late responses. No automatic resubmit when rights return,
  private offline cache or hidden overwrite via whole-form rollback.
- **D5-C11 — Focused tenant settings.** Use the existing tenant permissions area
  with a plainly labeled missionary contact-correction entry, exact configured
  population/scope and qualified field controls. Show effective versus pending
  results and inherited restrictions; removing one grant must not falsely promise
  universal disablement. Reuse safe view-only permission testing where needed,
  not impersonation or another matrix/role product. Settings saves also require
  current-base, atomic evidence and recoverable outcomes through their owner.
- **D5-C12 — Clear accessible forms.** Preserve base-maia/Base UI and semantic
  tokens. Use ordinary names and phone/address formats under exact source rules;
  no forced US country, Western name split, mandatory unrelated email or
  self-profile autofill contamination. Provide labels, associated errors,
  persistent permission/status feedback, predictable focus and usable phone
  controls. No hidden giving-frequency/preference defaults in contact Save.
- **D5-C13 — Database and API enforcement.** Qualify effective grants, RLS old
  and new rows, column mutability, exact tenant-aware relationships, valid
  defaults/nullability, immutable actor/source attribution, views/functions/RPCs,
  service roles, direct browser and reached derivative paths. One row-level policy
  or middleware is insufficient. Do not reopen generic table writes, alter the
  shared authenticated role per tenant, or use caller-supplied permission flags.
- **D5-C14 — Protected history and retention.** Required minimized evidence,
  prior contact assertions, safe diagnostics, exports and caches retain their
  exact audiences and retention rules. No complete form in broader logs or new
  contact-change notification. Corrections preserve lawful historical truth;
  Clear/backup restore cannot revive an older fallback or erased source body.
- **D5-C15 — Compatible activation.** Census exact existing policy/data/writers/
  readers, converge the authoritative source and fence incompatible legacy paths.
  Preserve and reconcile independently proved valid missionary profile/tag edit
  rights from the active roster-safety contract, alongside other valid rights.
  Do not backfill grants from roles, assignment, sharing, historical write success
  alone or field ceilings. Resolve exact new mappings before activation. Apply explicit database
  exposure/grants and preserve denied/retained state across mixed versions and
  rollback. Stop unsafe new writes without reverting to the old broad writer.
- **D5-C16 — Bounded operation.** Reuse the governed permission resolver and
  bounded source queries. Honor P12 R6's logical governed-read budget and exact
  indexed tenant/context/field lookup contracts. Avoid a policy request per
  keystroke/field, full-roster preview or mass client invalidation. Establish real
  query, network and task-success budgets before release rather than inventing
  a latency or tenant-size promise.
- **D5-C17 — Affirmative and negative proof.** Prove a tenant policy manager can
  configure the bounded capability and an eligible missionary can save once,
  reload and see the corrected shared result through actual qualified sources.
  Also prove forbidden fields/actors/tenants, races, interrupted outcomes,
  retained-data migration and accessible phone/desktop use. A deny-only surface,
  synthetic probe, mock or unrelated provider dependency is not completion.

## Minimal UX — settings and missionary editor

The product needs an existing permissions entry and a short contact editor.
It does not need a permission dashboard for missionaries or a new correction
request workflow. Exact labels/layout remain design guidance under base-maia.

| Tenant-administration moment | Recommended experience                                                                                                              | Required truth                                                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Find the control             | **Settings → Permissions → Missionary workspace → Contact details** as a focused view/entry into existing permission administration | Exact navigation can follow the established settings structure. One authority; no duplicate settings value. Show the current organization and configured role/group/assignment scope. |
| Understand scope             | “Control which shared contact details missionaries can update in their permitted workspace.”                                        | It does not grant broad CRM search or edit all contacts. Only qualified actions/fields are configurable.                                                                              |
| Configure                    | Existing permission controls for the eligible contact action/fields; concise effective-access summary                               | Do not invent new permission levels. An assigned grant, inherited restriction and an absolute field ceiling are different. A removed grant may leave another valid path.              |
| Save/configuration review    | Show applied versus pending state from the actual owner workflow; **Saved** only after authoritative acceptance                     | Ordinary grants follow P12; actual projection widening follows ADR0211. A pending change never enables a missionary control early.                                                    |
| Diagnose a surprise          | Existing safe, view-only permission explanation for a selected authorized context                                                   | No impersonation/write path, protected contact preview or global user enumeration as a shortcut.                                                                                      |

| Missionary state                     | Recommended UI/copy                                                                                                                              | Required behavior                                                                                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eligible fields can be edited        | **Edit contact details**; only editable inputs in the short editor; one **Save**                                                                 | Use the source's current values, not missing/defaulted display DTO fields. Before Save: “Changes update the contact details available to your organization's staff.”               |
| Contact visible, no fields editable  | Readable contact details; concise **“You can view these details, but your current access doesn’t allow changes.”** when an explanation is useful | No misleading pencil or permanent disabled form. Do not claim staff must approve, promise a request button, or blame tenant settings unless that exact reason is safely known.     |
| Some fields editable                 | Editable permitted fields; other visible values remain ordinary read-only text, with a short explanation where needed                            | Read-only values are not submitted. Do not turn hidden values into blank inputs or expose their existence through specific denial reasons.                                         |
| Permissions loading                  | Reserve stable space; **“Checking editing access…”** where needed                                                                                | Do not flash an enabled Edit or show a confirmed denial. No record count/value leak in the placeholder.                                                                            |
| Permission service unavailable       | **“Editing is temporarily unavailable. Try again.”**                                                                                             | Distinct from a tenant choosing read-only. Preserve separately authorized reading only where its contract permits it; no stale edit fallback.                                      |
| Saving                               | **“Saving…”** with safe duplicate-submit handling and stable focus                                                                               | No success before acceptance. Closing the editor after submission does not prove cancellation.                                                                                     |
| Saved                                | **“Contact details updated.”**                                                                                                                   | Accepted correction stays accepted if refresh fails; offer safe refresh without resubmitting a new edit.                                                                           |
| Source proves no change              | Quietly retain the correct values, or **“No changes to save.”** when feedback is useful                                                          | Do not claim values changed or create changed-value/interaction history. Still distinguish a proved no-op from a missing/forbidden target.                                         |
| Format/validation error              | Specific field error and corrective guidance                                                                                                     | Preserve allowed draft values. Do not call a permission error a bad phone number or erase it merely because the user types again.                                                  |
| Newer source value                   | **“These details changed while you were editing. Review the latest information.”**                                                               | Preserve the authorized draft and source-qualified current values; deliberate retry only. No silent overwrite, generic merge wizard or disclosure of hidden changes.               |
| Edit permission withdrawn            | **“Your access changed. These changes weren’t saved.”** only after a confirmed rejection                                                         | Stop stale editing; preserve draft only while readable. For an unknown request outcome, check it before claiming nothing saved. No automatic Save on re-enable.                    |
| Read access withdrawn/tenant changed | Remove affected values, drafts and editor context; explain current unavailability safely                                                         | Reject late responses. Do not offer copying/exporting the revoked draft as recovery. Previously seen information cannot be recalled, but further application disclosure must stop. |
| Unknown request outcome              | **“Checking whether your changes were saved…”** only while checking; then an honest unresolved message and **Check again** if needed             | Reconcile the original operation; no new request identity, false rollback or indefinite spinner.                                                                                   |

No warning wall is needed. The shared-effect sentence belongs near the editor;
permission explanations appear where they affect the action. Use consistent
Maia typography, spacing, semantic colors and clear hierarchy. Preserve ordinary
scroll/search/detail context and valid drafts. Do not use color, opacity, hover
or a tooltip alone to convey authority.

These ordinary Save recommendations do not flatten a separately qualified
email-proof request or postal withdrawal into an immediate value change. Preserve
the exact owner's required proof, safety fence and any effect-specific review,
with clear pending versus applied outcomes; add no generic ceremony to phone
correction and do not promise every owner action is the same form transaction.

Keyboard and screen-reader users need stable focus through pending/error states,
associated labels and announced status without focus theft. Core's 44-pixel
touch guidance remains the design requirement; WCAG 2.2 AA's target-size rule is
24 CSS pixels with applicable exceptions, not permission to shrink phone controls.
Check 320-CSS-pixel reflow, text contrast, long localized labels, native scripts,
international numbers and reduced motion. Browser autofill for the missionary's
own details must not corrupt a third-party contact. Times use the user's locale;
source ordering does not use their device clock.

Current shared-component and dependency details are evidence to test, not a
visual-quality certificate: the UX note records a manifest/installed Base UI
version mismatch and a submit-button disabled-focus interaction. No UI has been
built or browser-tested in this research session, and no package change is made.

## Ownership, invariants and lifecycle

| Authoritative fact                                       | Owner                                          | Invariant                                                                                                                                      |
| -------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Current tenant/context and effective editing authority   | P12 with P3/P10/P11 source/field floors        | One validated context, one resolver; configuration does not bypass floors. Administration and exercise are separate.                           |
| Shared contact values and correction                     | Exact P9/P4 subtype/contact source             | One authoritative fact, deliberate selected changes, stable identity, lawful attribution and conflict protection. No missionary override copy. |
| Login, claim, verified possession                        | P4/Auth exact purpose owners                   | Contact correction alone cannot transfer claims or change account authority.                                                                   |
| Recipient destination, consent, suppression and dispatch | P6 with exact contact/source-purpose contracts | No inferred opt-in or generic retargeting; current source use and sealed/prepared/accepted work retain their own transitions.                  |
| Personal mailing source and print/issued evidence        | Exact P25/P19/P18/P9 qualified contracts       | Material address changes/Clear and use generations follow source rules; historical issued facts are not edited in place.                       |
| Private preparation and archive state                    | D1–D4 qualified preparation source             | Shared-contact correction neither publishes private context nor reactivates archived preparation.                                              |
| Required policy/correction evidence                      | Its source/security-audit owner                | Minimal, attributable and retained under exact access/retention rules; a technical log is not business truth.                                  |
| Form, permission summary and cache                       | Derived presentation                           | Accurate current scope; cannot manufacture a grant or become a write authority.                                                                |

Policy configuration follows its owner states: proposed/pending where required,
effective, rejected/conflicted, revoked or superseded. Do not invent a second D5
approval lifecycle. Contact editing has draft, submitted/unknown, rejected,
accepted or current-source-conflict outcomes. Cancel before submission writes
nothing; dismiss after submission does not cancel an accepted or in-flight write.
Later correction is another valid source operation, not time travel or whole-row
rollback. No D5 timer, notification, implicit task, consent or automatic retry
after future policy re-enablement is introduced.

## Falsifiable acceptance and proof matrix

| ID     | Positive outcome                                                                                                                                    | Negative/boundary/failure proof                                                                                                                                                                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D5-P01 | Qualified tenant manager configures the bounded capability; authorized missionary corrects phone once, reloads and staff see the same source value. | No broad CRM access, duplicate private copy, approval ceremony or optional provider requirement. A permanently deny-only UI fails.                                                                                                                                                                                       |
| D5-P02 | Server and UI reflect current effective source/field authority.                                                                                     | Another tenant, unqualified missionary, wrong hat, hidden record, absent/malformed/unavailable permission and client-supplied allow flag cannot change/read forbidden facts.                                                                                                                                             |
| D5-P03 | Mixed editable/read-only fields render and submit accurately.                                                                                       | View does not imply edit; read-only fields are omitted; values not currently authorized for viewing never reach DOM/DTO/draft. A forbidden submitted field rejects the whole action even if unchanged.                                                                                                                   |
| D5-P04 | Only current scoped policy managers can configure exact tenant rights.                                                                              | Fixed-tenant fallback, role label, self-expansion, out-of-ceiling grant, global baseline edit and caller attribution fail; no zero-row success.                                                                                                                                                                          |
| D5-P05 | Applicable overlapping grants and selected context produce truthful results.                                                                        | Removing one grant with another valid path does not falsely disable; separate hats/tenants never union; an absolute field/source restriction still wins.                                                                                                                                                                 |
| D5-P06 | Effective and pending policy states follow the actual owner workflow.                                                                               | Actual projection widening cannot apply/self-approve early; ordinary permitted contact edits require no new approval; stale concurrent settings changes conflict safely.                                                                                                                                                 |
| D5-P07 | Phone-only, explicit Clear and no-op preserve untouched international/contact/source values.                                                        | Non-US address/additional keys, absent email, one-character name, hidden frequency/preference/status/notes and redacted fields cannot be overwritten by defaults or full snapshots.                                                                                                                                      |
| D5-P08 | Applied database/API roles enforce both row and field/source limits.                                                                                | Test grants, USING/WITH CHECK, forbidden tenant/actor/owner/audit mutations, table/column privilege interaction, direct REST/RPC/GraphQL, views/definers/service roles and reached Storage/derivative paths.                                                                                                             |
| D5-P09 | Concurrent staff/missionary corrections preserve authoritative ordering and readable conflicts.                                                     | Two valid stale edits cannot silently lose newer data; no automatic caller priority or snapshot restore.                                                                                                                                                                                                                 |
| D5-P10 | Relevant policy revocation versus Save is ordered in actual concurrent sessions.                                                                    | Revocation accepted first denies an unqualified correction; correction accepted first remains history; current reads obey later revocation.                                                                                                                                                                              |
| D5-P11 | Policy A→B→A and stale authority tokens require fresh exact qualification.                                                                          | An equal visible toggle is not proof of unchanged authority; unrelated changes do not erase a surviving right or cause automatic resubmission.                                                                                                                                                                           |
| D5-P12 | Lost response recovers one accepted intent under current read authority.                                                                            | Old retry after newer correction cannot reapply; changed payload on one intent rejects; old receipt cannot overwrite current UI; unknown is not failure.                                                                                                                                                                 |
| D5-P13 | Selected values and required audit/retry evidence commit together.                                                                                  | Invalid/forbidden second field, evidence failure, missing source or actor tampering leaves no partial accepted change; no-op does not create an exchange or false changed-value history.                                                                                                                                 |
| D5-P14 | Changed contact fields apply exact source consequences once.                                                                                        | Phone/name do not mutate claim/consent/public identity; email/postal use changes affect only qualified destinations/purposes. Failure of a required acceptance/withdrawal fence prevents acceptance; failure of independently asynchronous post-acceptance work is recoverable without undoing/repeating the correction. |
| D5-P15 | D1–D4/private notes and lawful historical evidence retain their audience/meaning.                                                                   | No draft/log/export/notification leak, automatic share/reactivation, inferred household authority, audit-body disclosure or erased/fallback-value resurrection.                                                                                                                                                          |
| D5-P16 | Permission changes, background refresh, dismissal and context switches have truthful UI outcomes.                                                   | No stale Edit/Save, lost authorized draft, hidden protected value, late-response leak, typing-away a permission denial or false unsaved statement after an accepted write.                                                                                                                                               |
| D5-P17 | Representative users complete the short admin/missionary journey on phone and desktop.                                                              | Keyboard/screen reader, touch, focus while saving, reflow/contrast, international data, long/localized copy, own-profile autofill and slow/interrupted network are tested.                                                                                                                                               |
| D5-P18 | Retained data and mixed-version rollout preserve source facts and independently valid rights, including scoped missionary profile/tag edit intent.  | Dormant overrides cannot masquerade as active policy; incompatible writer/fallback paths are fenced; no inferred grants from past write success, unsafe rollback, backup replay or browser-write reopening.                                                                                                              |
| D5-P19 | Actual permission/source queries and client work remain bounded.                                                                                    | P12 R6 plus representative field/role/tenant/record workloads and plans; no per-keystroke remote policy check, unbounded preview or claimed latency without measurements.                                                                                                                                                |
| D5-P20 | Complete native correction and diagnosis remain useful with unrelated optional systems unavailable.                                                 | Real source/configuration unavailability is honest; no new sync/workflow/AI/SMS gate, overgrant-to-repair workaround or mock-only completion.                                                                                                                                                                            |

Synthetic mechanics, static code findings and vendor documentation are separate
evidence classes. They do not mark this complete actual-source/browser matrix
passed. Positive and negative qualification are both release requirements.

## Ruthless synthesis and execution order

1. **Resolve before recording:** the tenant configures existing authority; direct
   correction remains source-scoped; the UI reflects effective rights; one Save
   means selected changes only. These amendments preserve the founder's choice
   and are now explicit. No new product fork is needed to design database checks.
2. **Record now:** D5's corrected decision, glossary meaning and this review.
   Keep selected capability, recommendations, inherited owners and unqualified
   runtime separate. No new ADR is necessary for composing existing owners.
3. **Capture in the authorized spec/design:** exact eligible subject/field/purpose
   inventory; P12 registered action/admin mapping and P3/P11 built-in tenant
   policy qualification; contact owner and all required effects; C01–C17 and
   P01–P20 trace. Resolve the concrete initial template/migration mapping there
   without inventing a universal grant or a permanent all-off feature here.
4. **Require in implementation:** authoritative policy configuration and current
   effective reads; selected-field source command; atomic evidence, revision and
   replay safety; shared settings/editor components; exact source effects and
   compatible writer/read-model convergence. Qualify the permission producer
   before exposing controls that claim it works.
5. **Prove before activation:** real multi-tenant roles and grants, positive
   configuration-to-correction journey, concurrent policy/edit races, changed
   contact effects, migrations, accessible phone use and representative query/
   task budgets. One missing exact field owner gates that field/capability; it
   does not hide the missing work or block unrelated native functionality.
6. **Monitor only demonstrated operational regressions below.** Initial
   correctness, user comprehension, policy mappings and performance budgets are
   qualification gates, not vague items to watch later.

| Signal                                                                                                                                          | Threshold                         | Owner                                                       | Response                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Accepted correction or settings change without required current tenant/source/field/administrative authority                                    | Any confirmed instance            | P12 access owner + P9 contact owner                         | Disable affected mutation path, contain impact and reconcile through source history; re-prove all reached writers before re-enabling. |
| Phone-only/selected correction changes an untouched value, another domain's fact or a newer accepted value                                      | Any confirmed instance            | P9 contact owner plus affected field/domain owner           | Stop the affected writer, preserve evidence and correct through the authoritative owner; no whole-row backup overwrite.               |
| Settings/editor claims effective permission or success that the qualified source contradicts, excluding an honestly surfaced intervening change | Any reproducible instance         | P12 administration owner + P28 workspace owner              | Correct projection/state feedback and cache/context handling; do not grant broader rights to hide the discrepancy.                    |
| Accepted intent duplicates an effect, lacks required evidence, or cannot be reconciled through its owner                                        | Any confirmed invariant violation | P9 source-operation owner; P12 for configuration operations | Pause affected operation, reconcile acceptance/current state and restore supported recovery before activation resumes.                |
| Protected field/draft/receipt/log content survives a confirmed loss of read authority in an application-controlled surface                      | Any confirmed instance            | P12 disclosure owner + owning surface team                  | Clear/disable affected derivative, contain disclosure and re-prove invalidation/late-response isolation.                              |

These are named future controls, not configured production monitors. No arbitrary
incident rates, retention periods, latency targets or headcounts are invented.

## Adversarial check

### What could go wrong with this answer?

A cosmetic tenant setting could leave broad writes active; a phone edit could
overwrite unrelated data; a stale form could save after permission changed.
One permission authority, selected changes and ordered source acceptance prevent
those failures without adding steps to the ordinary user journey.

### What hidden assumptions are we making?

Tenant configuration is not a new universal grant, and a field called editable
is not authority. Exact eligible fields, source predicates and initial mappings
need qualification. We have no pilot evidence for a new approval queue, bulk
tool or per-contact policy editor; none is added.

### How does this affect the whole product?

Staff and missionaries share authoritative contact facts under distinct current
permissions. Claims, consent, giving, public/issued identity and private
preparation remain with their owners. Donor self-service rights do not disappear
when missionary editing is restricted.

### How does this affect the end-user experience?

Tenant administrators manage a focused permission entry. Missionaries see
readable facts and only the corrections they can currently make, with one Save,
a short shared-effect explanation and honest recovery when access or data
changes. Clear layout and accessible states replace confusing disabled forms.

### Does this follow modern best practices?

Yes as a qualified direction: separate configuration from effective permission,
apply current server authority, validate selected changes, preserve source truth
and provide accessible feedback. Vendor permissions/defaults and current Base UI
documentation are comparison evidence, not a substitute for Core proof.

### Does this fit Asym’s existing repo and product direction?

Yes through P3/P4/P9/P10/P11/P12, exact communication/contact owners and base-maia.
It requires replacing incompatible legacy form/write behavior and qualifying
dormant tenant-field policy. Existing code is not preserved merely because it
already renders an Edit button.

### Should we adjust the recommendation?

Keep A with tenant control and the required amendments. Build the small settings
and direct-edit experience on existing authoritative owners, prove it actually
works for an allowed missionary, and enforce the same boundaries everywhere.
Do not add a parallel permission system or routine approval workflow.
