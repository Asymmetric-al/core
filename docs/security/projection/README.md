# AL-1954 projection integration contract

`@asym/api/projection` exports the server-only, synchronous pure
`resolveProjection({ surface, recordType, row, auth, policies, scope })` and its
public input/result/context/scope types. It consumes the existing #491
`FieldPolicySet` via type-only imports and the pure sensitivity taxonomy. It
loads no policy, session, grant, source record, provider or database. It adds no
capability registry, authorization producer, grant product or reader migration.

This is the bounded #1954 core under independent acceptance E1-r1. The controlling
contracts are current #1954, the approved #493 split, amended Phase 3 A1–A10 and
Module 3, the identity/access OpenSpec delta, Phase 12 B D12/D14 and ADR-0209.
Older illustrative `Partial<Row>` and unclassified Mission Control inspection
prose do not override explicit refused results and no-policy omission.

## Qualified inputs and currentness

`auth` is exactly one already-validated context. `ProjectionBinding` carries an
exact context reference/revision, principal, Tenant, purpose, surface, operation,
record type/ID and immutable source reference/revision. `auth.current` supplies
current context and source revisions. The enclosing `scope.binding` must match
every binding component. Private own row `id` and `tenant_id` must match it.

The binding identifies the exact source snapshot whose row and restriction facts
were acquired together by the producer. A source reference is not inferred from
an arbitrary row column. Producers must prove currentness, authenticity, purpose,
source attribution and row/source agreement before calling this seam; matching
strings, structural types, casts and synthetic fixtures cannot prove these live
facts. There is no `validated: true` bypass, role/JWT fallback or default Tenant.
Re-resolve deferred work using its proper source context before execution.

Four distinct input contracts are exported:

- `human`: one selected assignment ID/revision, current assignment revision and
  exact principal/Tenant; its already-resolved `ceiling` is bound to the exact
  context reference/revision and its purpose/operation. `readableFields` and
  `exportableFields` are the producer's current capability intersection for this
  target, not raw role or membership names. Exact finance evidence is separate.
  This is the supported pure input variant; no live producer is delivered here.
- `public`: exact host, current Site/resource/public-projection source facts,
  common binding/currentness and its public-only current capability ceiling.
- `nhi`: exact current credential, required current human owner and owner context
  reference/revision/current revision, own ceiling, live owner ceiling and the
  resulting intersection ceiling, plus common binding/currentness.
- `operator`: exact current purpose-bound audited grant, validity interval,
  evaluation instant, audit reference and its current capability ceiling, plus
  common binding/currentness.

Public, NHI and operator runtime support is explicitly **unavailable** in this
bounded implementation: every such input refuses. They are never converted to
human assignments. Their typed contracts reserve mandatory producer facts;
implementing their verification or runtime admission requires separate owner
qualification. Unknown variants also refuse. Human memberships, roles, mutable
Tenant defaults, `tenantOverrides` and household properties confer no authority.

## Required qualified scope

All six dispositions plus `predicates` are mandatory in `RowScope`. Each is
`applicable` with its complete facts or explicit `not_applicable`, qualified by
the enclosing exact source binding. Omission is refusal. N/A is a producer's
record-family/purpose determination, never permission for a caller to avoid a
floor. Entity-bearing financial records must always use applicable Legal Entity
facts; a producer must not mark them N/A or omit their immutable entity column.

- Legal Entity: exact private `legal_entity_id` equals the source entity and is
  included in the explicit current Tenant-bounded registry/grant intersection.
  Source `scopeRevision`, authority `revision` and `currentRevision` match. A
  wildcard, mutable default, Site, designation or processor account never repairs
  entity facts. N/A only accepts a row without a non-null entity value.
- Ownership: `ownerField` names an own private source field matching the current
  principal. No fixed owner-column alias is invented.
- Relationship: exact current viewer/record relationship fact has `related:true`.
  False, missing or mismatched facts refuse; each split line/supporter reference
  needs its own qualified binding and decision.
- Anonymity: source `intent` is `named`, `anonymous` or `unknown_offline`; guest
  status or a null online donor never supplies this intent. The producer supplies
  the complete classified whole `identityFields`, private `identityField`,
  `identityRequired` and exact purpose audience. Required identity is nonempty.
  `identity_restricted` anonymous/unknown-offline projections remove the entire
  identity field set while retaining otherwise admitted amount. Named data still
  follows policy. `finance` handling is limited to Mission Control and remains
  bounded by its qualified ceiling, policy and scope. An unknown offline identity
  needs explicit qualified intent and cannot fabricate a named party.
- Flags: complete `refuse` and `removeFields` specify source-qualified read
  restrictions. No flag value is invented or used to add access.
- State: `open`, `settled` and `locked` are recognized source states. None alone
  creates a blanket read denial. Exact purpose/source restrictions explicitly
  supply `refuse` and `removeFields`. Unsupported/missing state refuses.

Private IDs, intent and restrictions are available until all enforcement is
complete, and are not emitted unless independently policy-admitted. The scope
and context envelopes never appear in the result. Data must be finite plain
JSON-like primitives/objects/arrays (undefined is retained as supplied); cycles,
functions or accessor facts refuse. Inputs are never mutated. Callback-visible
facts are isolated frozen snapshots. Validation inspects every own descriptor,
including non-enumerable and symbol properties, without executing getters.
Hidden executable serializers and accessors refuse recursively, including hidden
array indices. Emitted containers come from that validated frozen data graph, not
the original mutable references. Supplied data values, property enumerability,
array length and sparse holes are preserved; object reference identity is not an
authority or output guarantee. Projection never invents defaults, aliases, totals
or nested paths.

## Ceiling, export and immutable floors

Policy set surface/record binding must match. Malformed or unavailable sets
refuse; malformed individual policies omit their field. Every policy property
must be its own data property; keys are whole lowercase identifiers excluding
`__proto__`, `constructor` and `prototype`. Inherited/dotted keys are inert.
All operations must be booleans, the category recognized, bindings exact and
`tenantId:null`. There is no taxonomy-default admission or dormant override.
Missing policies omit fields even in Mission Control. Only own input fields can
appear. Whole JSONB/arrays are indivisible; producers classify the most sensitive
contained data rather than trying to admit dotted descendants.

`read` intersects `visible` with `ceiling.readableFields`; editability is inert.
`bulk_export` intersects `exportable` with `ceiling.exportableFields`, independently
of `visible`. Its operation and purpose must be bound identically in context and
scope. Surface `export` always applies export ceilings/floors, even under `read`.
Mission Control bulk export also applies all external immutable floors.

Internal/care/security categories are always removed outside Mission Control and
from every bulk export. All six processor keys (`stripe_charge_id`,
`stripe_customer_id`, `stripe_subscription_id`, `stripe_payment_intent_id`,
`stripe_payment_method_id`, `stripe_refund_ids`) remain absent on every
non-Mission-Control/future/export path even with a poisoned public policy.
Mission Control read additionally requires `ceiling.finance` with exact
`kind:processor_identifier_read`, context reference/revision and bound purpose.
This is supplied evidence of the existing exact finance authority, not a new
grant/capability or a finance role check. Finance evidence still cannot admit a
field outside the policy and readable ceiling. Refund IDs stay whole arrays;
this read core implements no edits. The three receipt families `receipts`,
`gift_receipt_records`, `contribution_receipt_snapshots` always refuse.

A loaded `FieldPolicySet.get` must be pure and stable for a call. The resolver
compares two copied lookup results and omits a field on observed instability.
It cannot prove an arbitrary malicious callback stable for all time. Duplicate
raw policy validation remains the #491 reader's job: its one-item interface
contains no duplicate metadata. The composed reader test proves that a duplicate-
denied loaded set cannot be restored; it is synthetic database-boundary evidence.

## Subtractive extensions and consumers

Each trusted synchronous pure predicate receives frozen private row/binding
facts and returns exactly `retain`, `refuse` or `remove` with whole field keys.
There is no allowed replacement-value or grant shape, policy-source argument,
or household admission. Undefined, Promise, malformed result, exception or an
attempt to mutate frozen facts refuses. Removal sets compose by union, so pure
independent predicates commute. Callbacks and loaded policy accessors are trusted
server code obligated to perform no I/O; this library provides no sandbox for
arbitrary injected executable code.

`{kind:"allowed", projection:{}}` is a successful empty decision and differs
from `{kind:"refused"}`. Consumers must discard refused rows before enumeration,
pagination, counts, totals, search, formatting, CSV/export and template binding.
They must use only admitted projection fields for subsequent computations.
The synthetic reference consumer demonstrates amounts 1250, refused 9000 and
750 yielding count 2, total 2000 and the correct second admitted page. No DTO,
raw row, alias or private envelope may be serialized as a fallback.

## Retained delivery gates

Pure tests do not prove live current-session selected-context producers,
application/DB Tenant agreement, RLS, exact immutable entity/profile/root/line
attribution, actual donor/missionary SELECT migration, before-enforcement raw/DTO
parity and reviewed narrowing, private-fact ordering through actual readers,
adjacent Partners/recurring/encoded processor paths, repository-wide sensitive-
reader lint, client DataTable CSV pre-data-access refusal, #496/#632/#635
restricted/anonymity integration, or source-family closure outside bounded #1948.
These remain #493 gates. This issue neither closes #493 nor authorizes grant,
policy, schema, seed, RLS, producer/backfill, auth fallback, receipt enablement,
portal defaults, provider calls or deployment. Candidate-bound independent
acceptance/reviews, normal hooks and required current-head CI remain delivery
steps owned by the coordinator. See [delivery evidence](./delivery.md).
