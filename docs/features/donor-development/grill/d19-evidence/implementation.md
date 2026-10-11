# D19 — optional destination stage: implementation evidence

2026-10-10. Fresh source inspection at
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. Founder answer A permits a deliberate
change to another approved list without a current destination stage. The intended
absence must be clear before the ordinary save. Research only: no formal
PRD/OpenSpec, issue, product code, migration, live database or remote mutation.

## Recommendation and minimal contract

Keep A. Preserve one required list with either a qualified stage belonging to that
list or known current absence, within D18's existing authoritative mutation. No
second catalog entry, synthetic “unassessed” stage ID, assessment task, deadline,
approval, mandatory reason, provider or new workflow subsystem is needed.

Suggested exact clause:

> When actually changing to another eligible approved list, the submitted intent
> SHALL identify that list and the clearly presented result: an eligible exact-list
> stage or no current assessment. Absence is an explicit supported disposition,
> not an omitted command field, invalid stage, failed lookup or inferred reset.
> Accept the coherent list/stage-or-absence, actual prior/resulting history and
> durable result together. Preserve earlier assessments, including on a return to
> a formerly used list; do not carry, map or restore one automatically. Required
> source/list identity, current authority, target eligibility and journey revision
> checks remain mandatory. This operation does not authorize clearing a current
> stage while remaining on the same list.

This selects meaning, not physical field names. A typed `unassessed` disposition
or a required nullable field can express it. If SQL null represents no current
stage, preserve caller intent before normalization; a default-null RPC parameter
alone cannot distinguish an omitted input. An intentional absence shown by the UI
does not require an extra confirmation click or second acknowledgment.

## Current implementation evidence

The bounded fresh search for `cultivation`, `stage_list`, `stageList`, `journey_id`,
`journeyId`, `list_change` and `listChange` in API/database/migrations/admin/missionary
source again found no matching P27 implementation. Existing schema/types do not
establish an implemented destination-stage command. D18's source examples and
release gaps remain; no product behavior is inferred from grooming documents.

There is a useful **different-domain presence pattern** in current Core:

- [Preference route](../../../../../packages/api/src/admin/crm/table-preferences/route.ts:58)
  explicitly documents absent = unchanged, null = clear, value = replace; lines
  64–67 admit nullable optional inputs. The patch builder at lines 82–94 includes
  only supplied scopes. That policy belongs to settings, not P27, but demonstrates
  that missing and null are intentionally distinct in current application code.
- [Preference service](../../../../../packages/api/src/admin/crm/table-preferences/service.ts:110)
  carries both nullable value and `p_pinned_action_id_is_set` at lines 118–129.
  It does not recover presence from `null` after the fact. The
  [SQL JSON patch](../../../../../supabase/migrations/20260611160000_crm_table_preferences.sql:72)
  checks key existence before checking JSON null; corresponding pin SQL checks the
  explicit supplied flag at lines 154 and 167. Do not copy settings' “unchanged”
  semantics onto a list switch: keeping an old-list stage is invalid.
- [Existing service test](../../../../../tests/unit/packages/api/admin/crm-table-preferences-service.test.ts:320)
  uses a Supabase stub and checks omitted pin with `is_set: false`, then explicit
  null scoped reset at lines 357–367. Inspected only, not rerun; it is not a
  PostgreSQL or P27 test. An initially guessed route-test filename was absent;
  no evidence from that nonexistent file is asserted.
- [Shared form Select](../../../../../packages/ui/components/primitives/tanstack-form.tsx:531)
  ignores null callbacks, and [SearchableSelect](../../../../../packages/ui/components/shadcn/searchable-select.tsx:102)
  displays a placeholder when its current value has no matching item. Neither
  represents a saved explicit absence contract. The actual primitive evidence and
  adaptation requirements are owned in [D19 UX](ux.md); a dropdown placeholder
  cannot establish submitted null, and the SQL probe cannot establish UI intent.

## Graded concerns and exact acceptance requirements

These are risks in an unqualified implementation, not observed defects in a
nonexistent P27 command. D18 already settles same-journey identity, current target
eligibility, atomicity, history and concurrency; D19 specializes its no-stage seam.

**I1 — Omission or an invalid stage silently becomes permission to clear. High /
likely if optional fields are coalesced.** SQL JSON extraction and JavaScript
`undefined` omission can discard presence. A selected stage that retires while
editing is an invalidated chosen assessment, not a new no-stage instruction.
**Exact amendment:** “Preserve the qualified stage disposition through UI, parsing,
normalization, command storage and retry. Require complete switch meaning; reject
or visibly reconcile missing/invalid material input. Do not fall back to no stage
when a chosen stage becomes invalid.” **Proof:** absent field, explicit absence,
valid stage, old-list stage, empty string/sentinel, lookup failure and selected-stage
retirement through actual UI/API/RPC paths. Probe case 2 proves extraction/presence
and wrong-stage rollback for fixed inputs. It does not qualify a production parser.

**I2 — Nullable stage bypasses required list or scope integrity. High / plausible.**
One `(scope,list,stage)` FK using MATCH SIMPLE stops checking when stage is null.
MATCH FULL over that whole tuple would instead prohibit the desired mixed state
of required list plus absent stage. **Exact amendment:** “Keep required tenant,
actual source scope and list identity non-null and independently reference the
valid scoped list. Validate an optional non-null stage against that exact parent.
History and result references preserve the same boundary.” **Proof:** probe case 1
demonstrates the actual unsafe insert and corrected nonexistent/foreign/missing
parent rejection. Real DDL still must prove actual owner scope, RLS/grants and all
writers. A null stage cannot bypass list availability, usable catalog, permission,
policy epoch or protected disclosure checks; case 7 tests only availability.

**I3 — A list is saved while its old assessment remains current, or history is
lost. High / plausible with separate field patches.** An SQL assignment such as
`stage_id = COALESCE(input_stage, old_stage)` would erase the meaning of intended
absence; separate writes can produce invalid intermediate state. **Exact amendment:**
“Commit the new required list and its explicit absent/concrete stage as one coherent
binding with required transition history and durable result. An intentional
absence does not retain an old stage as the current assessment, but preserves it
as earlier lawful history.” **Proof:** case 3 exercises no-stage atomic commit,
independent precommit visibility and a late receipt fault. Actual trusted actor,
recorded time, accepted meaning/provenance and required effect-intent writes remain
D18 source requirements; this fixture does not implement all those fields.

**I4 — A stale switch proposal clears a newer destination assessment. High /
plausible.** An old request A→B(null) can arrive after A→B(stage B) commits. Looking
only at the requested destination or a caller-asserted previous list would turn the
old switch into a same-list clear. **Exact amendment:** “Resolve from the actual
current journey and its observed revision; stale submitted absence does not become
same-list clearing or a rebased switch. Do not retry it under a newly fetched
revision without reviewed revised intent.” **Proof:** case 6 observes exact backend
blocking, then rejects stale absence while retaining B's assessment and only one
history/result. A fresh same-list clear is also rejected by this bounded switch
fixture. Same-value no-op handling and any separately authorized same-list clearing
remain their own contract; this test does not select them.

**I5 — Different dispositions collide under retry or revive old assessments.
High / plausible.** A nullable value omitted from a fingerprint can merge two
meanings. An A→B→A return can accidentally retrieve “last stage on A” as current.
**Exact amendment:** “Bind durable intent to the exact normalized disposition and
target with source revision. Exact replay recovers its historical accepted result;
omitted or changed stage meaning under the same identity conflicts. A later return
uses current submitted intent and current eligibility; it never restores an earlier
assessment or reapplies a prior receipt.” **Proof:** cases 4–5 distinguish null,
omission and concrete stage, preserve original stage 101 in history, leave the later
A binding unassessed and return the old B receipt without reapplying it. Actual
result authorization, schema-version compatibility, lost HTTP response and late
projection ordering still require owner/source tests.

**I6 — Reporting drops unassessed journeys or rewrites what was known. High /
likely with inner joins and generic counts.** `count(stage_id)` excludes null;
an inner stage join drops those rows; `<>` does not include null; `NULL = NULL`
does not return true. **Exact amendment:** “Keep known no-current-assessment visible
in current list/journey counts and permitted filters. Define aggregate denominators
and absence comparison deliberately. Do not infer ‘never assessed,’ no relationship,
zero activity, closure or negative response. Preserve uncertainty/denied/unloaded
data separately from known absence.” **Proof:** case 8 supplies exact count/join/
comparison counterexamples. Real source projections must distinguish those states,
carry current source revision and use appropriate authorized left joins or equivalent
bounded reads. A blanket COALESCE to a magic stage ID is not a solution.

For time-based reporting, an old assessed stage must not remain the open current
stage interval merely because it is the latest non-null event. List residence,
recorded stage residence and any supported unassessed interval have different
meanings. Preserve actual accepted list-change time and earlier assessment evidence;
do not backdate, fabricate a new stage visit or claim external supporter progress.
Exact duration, correction and report formulas remain with the reporting/history
owner; this decision does not select a new analytics schema.

**I7 — Optional assessment becomes an automatic work or financial obligation.
High / plausible with generic stage-entry hooks.** Known absence is a current
classification state, not an event proving donor activity or overdue work.
**Exact amendment:** “No new assessment queue, deadline, task, contact, consent,
ask response, commitment, money attribution or workflow activation follows solely
from saving without a stage. Existing appropriate next work, asks and owner-controlled
effects retain their actual identities and obligations.” **Proof:** real owner
tests must show no duplicate/new enrollment, source financial changes or native
effects caused by optionality. There are no such owners in this SQL fixture, so
none of those real guarantees is proven here. D19 changes no money type, currency,
Legal Entity, coverage rule or independent effect authority.

**I8 — A successful owner fixture is mistaken for launch qualification. High /
certain present evidence gap.** No implemented D19 source exists in inspected code.
**Exact amendment:** “Qualify the real UI/API/database/result flow and all writers
before exposure, including effective grants, nonowner RLS USING/WITH CHECK,
service/RPC behavior, safe current/result/history disclosure, protected null
observations and old-client compatibility. Complete absent-state read models and
source constraints before allowing writes that create them.” **Proof:** real-role
negative tests and migration/reader compatibility tests, not owner SQL assertions.
No additional schema hierarchy or universal nullable-field framework is required.

## Primary documentation and new bounded proof

Freshly fetched on 2026-10-10 for PostgreSQL major 17:

- [JSON functions/operators](https://www.postgresql.org/docs/17/functions-json.html):
  missing-path extraction returns SQL null; `jsonb ?` tests key presence and
  `jsonb_typeof` distinguishes JSON null. Case 2 executes the relevant distinction.
- [Foreign-key constraints](https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-FK):
  default matching exempts a row with any null referencing component; MATCH FULL
  instead allows only complete absence. Use independent required parent integrity
  for this nullable child-reference design, with actual owner keys and appropriate
  indexes. A cross-row eligibility CHECK is not a substitute for owner validation.
- [Aggregate functions](https://www.postgresql.org/docs/17/functions-aggregate.html):
  `count(*)` counts input rows; `count(expression)` counts only non-null values.
  Case 8 also executes equality/inequality and join counterexamples directly.

The [D19 probe](no-stage-probe/README.md) passed **8/8 first attempt** on PostgreSQL
17.11/read committed. Its pinned image, three exact input hashes, controlled backend
wait, full results, timestamps and exact container-removal evidence are retained.
It ran with network none, no ports or mounts, disposable tmpfs and no live credentials.
No failed runtime attempt or previous test was hidden or relabeled as D19 evidence.

This establishes only the listed engine/fixture mechanics. It neither runs Core
migrations nor proves product authorization, UI serialization, lifecycle policy,
history immutability, actual downstream effects, data completeness or production
performance. PostgreSQL owner execution and explicitly raised `40001` are not
nonowner RLS or Serializable-isolation proof. D18's earlier concrete-stage fixture
remains dated evidence; this no-stage run does not retroactively change its policy
scope or claim to requalify its tests.
