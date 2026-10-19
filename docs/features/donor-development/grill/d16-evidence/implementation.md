# D16 — shared approved choices: implementation evidence

2026-10-10. Fresh source inspection at checkout
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`, with the current grooming documents.
Research only. The founder selected A: authorized people choose the appropriate
approved list, with no additional organization-defined restriction by kind of
partnership work. D1–D15 remain settled. This appendix supports A with bounded
implementation obligations; it does not implement admission, select defaults,
authorize saved-list switching or claim product readiness.

## Findings and recommendation

Keep A. One canonical source eligibility rule should combine the inherited scope,
current permission/disclosure, approved new-use availability and valid list/stage
relationship. D16 removes the proposed additional process-specific rule layer; it
does not remove those source checks. The UI can explain intended use through names
and guidance without implementing a hidden staff/missionary/church allowlist.

Suggested precise clause:

> Use the shared approved choices available for new work in the actual source
> scope. List names, screen, role labels, ministry category and personal settings
> do not create an additional process-specific restriction or assign a list.
> Persist one valid source list with the chosen stage from that list, or the
> permitted unassessed state. A draft choice changes neither existing work nor
> source authority; the accepted command revalidates the exact final pair and
> records one coherent result.

No new SQL model or database experiment was warranted for D16. The relevant engine
mechanics have already been tested in the distinct D14 and D15 probes. Repeating
them under renamed toy tables would not resolve the missing real source/UI command
path. The CRM/UI reviewer executed a narrow actual SearchableSelect item-change
test, reviewed below; this appendix does not duplicate it or substitute a synthetic
admission form.

## Fresh source facts

1. A text search for `cultivation`, `stage.list`, `stage_list`, `stage_catalog`
   and `stage_preset` in `packages/api/src`, `packages/database`,
   `supabase/migrations`, `apps/admin` and `apps/missionary` found no implementing
   P27 list/applicability command. Staged-gift names belong to another domain.
   This is a bounded checkout search, not an assertion about unseen deployments.
2. The [admin workspace collection](../../../../../packages/database/collections/admin-workspace.ts:10)
   is explicitly a local demo and its stage enum is fixed at line 35. The
   [CRM grid](../../../../../packages/database/types/crm-grid.ts:4) represents
   donor lifecycle status, which the [model](../../../../../packages/api/src/admin/crm/model.ts:41)
   maps from `donor.status` at line 54. The
   [board](<../../../../../apps/admin/app/(app)/crm/kanban-view.tsx:29>) groups
   status labels and sorts them alphabetically. None supplies a P27 list binding,
   dynamic stage membership, accepted absence or shared source eligibility.
3. [SearchableSelect](../../../../../packages/ui/components/shadcn/searchable-select.tsx:22)
   accepts separate string `value` and `label` plus disabled state. At lines 28–38
   it exposes Base UI's controlled value/default/callback contract; at lines 73–84
   it builds the items collection and forwards those props. At lines 102–106 it
   looks up the selected display label in the current items and falls back to a
   placeholder. At lines 129–134 item identity uses value, not label. It does not
   know the business parent list, validate source eligibility, clear an incompatible
   dependent stage, decide user intent or save a journey.
4. The [generic form Select wrapper](../../../../../packages/ui/components/primitives/tanstack-form.tsx:522)
   handles a non-null callback by changing the field value at lines 531–535 and
   ignores null. This is the separate Select primitive, not proof that
   SearchableSelect or every consumer shares that null policy. Neither callback
   constitutes persistence, coherent multi-field admission or permission proof.
5. The [generic table mutation hook](../../../../../packages/ui/components/shadcn/data-table/hooks/use-data-table-mutation.ts:75)
   performs direct single-table browser insert/update/upsert and optimistic cache
   changes. Its availability is not authority to implement compound P27 admission
   or saved-list change as two independent field patches. The canonical privileged
   business command remains in `packages/api` under existing data boundaries.
6. [CRM gift-history view settings](../../../../../packages/api/src/admin/crm/table-preferences/view-settings.ts:11)
   deliberately fall back from personal preference to tenant to system defaults.
   That is presentation configuration. It is not precedent for changing a shared
   journey's list according to the viewer or choosing the first returned option.
7. The [operation wrapper](../../../../../packages/api/src/shared/with-operation.ts:128)
   creates a new request UUID per call. The [note route](../../../../../packages/api/src/admin/crm/notes/index.ts:52)
   passes it to the [note service](../../../../../packages/api/src/admin/crm/notes/service.ts:190),
   which uses it for a duplicate lookup, then inserts at line 224 and separately
   logs at line 256. This is an existing limited pattern, not proof of a stable
   user-intent key across HTTP retries or an atomic P27 result/history transaction.
   No unrelated note-service change is proposed.

## Graded concerns, exact amendments and future acceptance

Ratings describe risks in an unqualified implementation, not observed P27 defects.

**I1 — A hidden applicability layer recreates B. High / plausible.** A developer
may take the roadmap's named staff/support-raising/church presets as mandatory
assignments, filter choices by route or staff label, or introduce a `purpose → list`
table because the data model appears to need one. **Exact clause:** “Do not add a
separate process-type applicability rule. Current source scope, permission and
new-use availability remain the eligibility boundary; guidance is not an ACL.”
**Proof:** equivalent permitted work and actors receive the same source-approved
choice set through staff, missionary where authorized, API, contextual and reviewed
group paths. A surface may present appropriate guidance, but cannot independently
reject an otherwise eligible list or silently select another. Conversely a shared
catalog never grants admission or hidden configuration/record visibility. D16 now;
exact capabilities and source disclosure qualification remain required.

**I2 — A draft list change retains a stage from another list. High / likely if
independent field callbacks are treated as business state.** Stable IDs and friendly
labels solve different problems. Choosing list B after stage A1 must not keep A1,
map to B1 by equal label/rank, or silently count the draft edit as reassessment.
**Exact clause:** “A changed draft list must leave a truthful, coherent final
list/stage choice before acceptance. Preserve only independently valid meaning;
do not infer cross-list equivalence from text, order or a missing-option callback.”
**Proof:** actual form and command with A1 and B1 sharing a label but different
identities, asynchronous stale option responses, canceled drafts, optional unassessed
stage and a known still-valid source choice. The user should see what remains
chosen and resolve only the missing/invalid information; no automatic first-stage
selection or compulsory assessment follows. D14's composite membership fixture
proves an engine mechanism, not actual draft behavior. D16 does not choose the
precise clear-versus-review interaction or authorize clearing an already saved stage.

**I3 — A valid picker selection is mistaken for an authoritative command. High /
plausible.** An exposed item can be withdrawn or permission can change between
render and submit; a forged body can combine valid IDs from different lists/scopes.
Nullable assessment does not allow a missing or foreign list. **Exact clause:**
“The accepting source command must re-prove current permitted list scope and
new-use availability, and stage membership/eligibility when a stage is supplied.
It must commit one coherent list plus stage-or-valid-absence outcome.” **Proof:**
real source/API/database tests for wrong-list stage, unauthorized or unavailable
list, omitted/foreign parent with null stage, retirement/revocation race and partial
failure. No source authorization from a label, dropdown membership, JWT cache,
service credential, generic RLS or browser validation alone. Do not add a new
physical scope model solely for this decision; consume exact P27/P12 source scope.

**I4 — A retry with a different list becomes false success or duplicate work.
High / plausible.** A lost-response retry must recover the accepted final meaning.
Submitting another list/stage under that bound submitted identity must not return a
misleading old success, overwrite the old result or create a second journey.
**Exact clause:** “A bound submitted command's immutable meaning includes its selected
list and stage or valid absence. Exact replay returns the same permitted result;
changed meaning under the same bound submitted intent conflicts. Reconcile an
unknown outcome before revising intent; confirmed nonacceptance permits the
qualified revised-intent path. A deliberate different operation uses its separately
authorized source path.” **Proof:** actual browser/
HTTP retry after response loss, duplicate group row, concurrent callers, payload
change and current authorization on result recovery. Editing an unsubmitted draft
is not a new durable business event per keystroke. Choosing a different list is not
an additional ordinary-journey uniqueness dimension. D14's creation-payload check
supports the general mechanism but does not certify P27 admission payloads.

**I5 — Shared choice mutates existing bindings or invents defaults. High /
plausible with presentation fallback reuse.** Returning to a screen, changing a
saved filter, restoring a list, switching role or changing array order cannot move
the journey. **Exact clause:** “One accepted list binding is shared source truth.
D16 changes neither existing bindings nor default/prefill/list-switch behavior.
Current known valid context need not be asked again, but presentation preference
must not manufacture source assignment.” **Proof:** two authorized viewers,
different surfaces and reordered equal-label options preserve the source ID and
meaning; D15 withdrawn-list current work and return remain visible; zero valid
new-use options do not fall back to withdrawn/foreign lists. Initial suggestions,
the one-option interaction and existing-work switch controls remain later choices.

**I6 — Minimal policy becomes an incomplete release claim. High / certain current
evidence gap.** A simpler choice rule still needs a real admission/list-stage source,
consistent readers, compatible types, current authorization and coherent effects.
**Exact clause:** “Implement shared eligibility once at the owning source and have
all callers consume it; qualify real end-to-end admission before activation.
Reusing existing controls does not substitute for that source contract.” **Proof:**
actual current-source tests, nonowner DB/API permission tests, retirement and draft
payload races, durable results, accessible user flow, cache/loading/error states,
old-writer containment and measured representative query behavior. No new rule
builder, registry of partnership types, second catalog, migration scheduler or
approval system is required to accept D16. No financial, contact, task or workflow
effect follows merely from list choice or display.

## Evidence reused, not rerun

- [D14 list-creation probe](../d14-evidence/list-creation-probe/README.md): cases
  1–2 show the wrong-list counterexample and composite membership, including the
  foreign parent with null assessment; cases 5–6 show exact replay and immutable
  payload conflict; case 12 shows coherent concurrent creation; case 14 preserves
  existing bindings. All 14 passed in that recorded run. The functions concern
  list creation, not the final admission API.
- [D15 retirement probe](../d15-evidence/list-retirement-probe/README.md): cases
  2–3 serialize admission versus withdrawal; case 4 permits continuing stage use;
  case 7 exposes the active-only-reader failure. All 9 passed in that recorded
  run. The fixture remains owner-executed synthetic PostgreSQL, not P12/RLS proof.
- Existing [SearchableSelect tests](../../../../../tests/unit/packages/ui/searchable-select.test.tsx:17)
  describe stable IDs with equal labels, disabled items, refreshed labels and
  no-results search; the [consumer null-policy tests](../../../../../tests/unit/packages/ui/searchable-select-consumer-null-policy.test.tsx:45)
  explicitly inject a nullable callback and distinguish that seam from claiming
  search/loading produces null. Those tests are existing evidence, not a P27
  parent/dependent-form test.

## New actual primitive evidence, coordinated with the UX reviewer

The [D16 selector probe](source-probe/README.md), its test source and recorded
metadata were reviewed after the UX agent executed it: **1/1 passed**. It renders
the real unmocked SearchableSelect, keeps the caller-controlled A-stage ID, then
replaces the options with list B's same-label/different-ID stage. The visible value
becomes the placeholder, no change callback fires and B is not selected. Explicitly
clicking B emits B's identity once. Thus neither a placeholder nor refreshed
options proves that caller state was cleared, source absence was recorded, or
the dependent pair is valid. This directly motivates I2; it is not a discovered
bug in a nonexistent P27 form or a requirement to change the shared primitive.

The actual run used jsdom, Node 24.19.0, Base UI 1.8.0, React 19.2.3 and Vitest
4.1.4. The manifest's React 19.3.0/Vitest 5.0.3 were not the executed versions;
Bun was unavailable. A scoped evidence config avoided repeating a previously
observed root-config Sentry export failure. This is no root CI, browser layout,
accessibility, real draft/admission, API, database or authorization qualification.
The source artifact includes precise dependency/file hashes and command evidence.

No new SQL fixture or repeat of old database tests was run. No product code,
migration, formal specification, ticket, live database or remote application was
changed. This note records current-source inspection and actionable qualification
requirements. It does not claim D16 has a deployed source contract.

## Consolidated decision status

The [completed D16 review](../phase27-d16-adversarial-review.md) consolidates this
research and records Accept. The founder subsequently explicitly ratified its
exact decision and safeguards on 2026-10-10. Earlier recommendation language is
research provenance; no additional default, sole-option or saved-list correction
policy is inferred. [Q17](../phase27-q17-initial-list-choice.md) is unanswered.
