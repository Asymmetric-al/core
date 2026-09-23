Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-data-api"></a>

# Data, operation and event contracts

<a id="web-h-contract-status"></a>

## Contract status

Names below are proposed public application contracts, not claims that these functions or tables already exist. Reuse qualified existing records/functions before adding storage. The observable semantics are normative on adoption; physical names must converge with the current owner schema. No migration SQL is supplied as safe-to-run without that reconciliation.

<a id="web-h-canonical-composition-envelope"></a>

## Canonical composition envelope

```typescript
// Proposed wire DTO; validate with the admitted catalog before using it.
type CompositionDocument = {
  profile: "asym.page-composition/1" | "asym.page-composition/2";
  family: "page" | "article";
  catalogVersion: string;
  nodes: CompositionNode[];
};

type SemanticNode = {
  kind: "semantic";
  instanceId: string;
  semanticType: string; // exact registered ID, not arbitrary user type
  schemaVersion: number;
  content: unknown; // decoded by that exact admitted semantic schema
  presentation?: {
    rendererKey: string; // selected within the admitted package registry
    settingsVersion: number;
    values: unknown; // decoded by admitted finite settings schema
  };
};
type ReusableNode = {
  kind: "reusable";
  instanceId: string;
  reusableId: string;
  revisionId: string;
};
type LayoutNode = {
  kind: "layout";
  instanceId: string;
  layoutType: "stack" | "split" | "grid";
  schemaVersion: 1;
  settings: Record<string, string>; // exact layout-specific enum schema
  slots: Record<string, CompositionNode[]>; // exact slot keys and grammar
};
type CompositionNode = SemanticNode | ReusableNode | LayoutNode;
```

`unknown` marks an explicit required decoder boundary, not permission to store arbitrary JSON. The structural schema included in this bundle checks the envelope; the implementation MUST compose it with existing D7/D11/D14 leaf decoders, qualified renderer settings decoders and owner reference validators. Reject duplicate JSON keys, prototype-polluting properties, nonfinite/out-of-range numbers, excessive depth and size before traversal. Never evaluate content. Do not use a client-provided `tenantId` inside this document to authorize anything.

This DTO is the proposed normalized boundary; it does not claim historical Payload rows already use this layout. Map legacy documents without rewriting their meaning. New v2 node/byte ceilings are not retroactive v1 limits; retained v1/Article documents use their exact already-admitted owner limits. Instance IDs are unique within the exact document lineage. Edits and moves retain identity; copying/duplicating into a new lineage generates new IDs. References and scope are checked independently. `catalogVersion` selects a retained admitted decoder, not a user-provided import path. No field stores executable code, raw provider clients, permission arrays or arbitrary query predicates.

Unknown schema/type never silently disappears. Persist only recognized structurally valid commands; keep any rejected client candidate in that tab and preserve acknowledged server data. Imports retain rejected raw material in their authorized quarantine/plan owner. Required-but-unfinished editorial content may be saved as a draft with diagnostics, while invalid scope/executable payloads cannot be stored through ordinary commands. Publication adds completeness, media readiness and current compatibility gates.

<a id="web-h-operational-records-and-invariants"></a>

## Operational records and invariants

<a id="web-h-source-binding"></a>

### Source binding

Fields: immutable binding ID, Tenant, environment, presentation project/Site scope; provider; immutable repository identity; installation connection reference; approved package path; tracked integration ref as a discovery preference; state; binding generation; creator; server timestamps; current authorization/rights profile reference. Store no raw credential on the binding.

An active source binding belongs to one exact Tenant within this managed profile. This is an isolation boundary, not a one-repository-per-Tenant count limit. Repository/project/Site relationships are explicitly recorded at the connection qualification gate; no cross-Tenant branch partition is admitted. Multiple authorized Sites in the same Tenant may independently admit exact versions. No cross-Tenant branch partition as isolation. Enforce one active source binding per presentation project/environment. A source rename changes display labels, not identity. Transfer suspends source-dependent work pending fresh verification. Archive disallows new tracking but can permit explicit retained-capture use according to policy; repository deletion never deletes CMS content.

<a id="web-h-source-capture"></a>

### Source capture

Immutable capture ID, binding ID/generation, provider repository identity, exact commit/tree/object-format, approved path, bounded archive digest, lockfile digest, manifest digest, fetch evidence and custody reference. Credential-bearing fetching ends before scripts run. Binding display names and commit author emails are not authorization. A capture retains exact provenance even after repository replacement.

<a id="web-h-build-attempt-and-artifact-admission"></a>

### Build attempt and artifact admission

A request identity names capture, requested build profile, toolchain digest and independent policy version. Attempts have separate identities under that request so retry/rebuild history remains truthful. Artifact identity is a digest plus immutable bytes/manifest, not `latest.zip`. Existing package admission stores the independent evidence, maintainer, supported contract versions, permitted capabilities, settings schema, asset/license references, expiry/requalification rules and revocation. Build success and admission are separate facts.

<a id="web-h-candidate-and-active-generation"></a>

### Candidate and active generation

Reuse existing candidate/generation owners. Candidate inputs include exact selected content revisions, placement/navigation/reuse dependencies, media evidence, package artifact, settings/brand version, catalog/compiler cohort, Site/locale and safety observations. Active heads are separate small records changed by D1/D10 CAS. No new `site.activeTheme` pointer competing with those heads.

<a id="web-h-receipts-and-dispatch"></a>

### Receipts and dispatch

Each mutation uses a product receipt and effect identity scoped to actor/service purpose, Tenant/environment, operation and resource. Store the canonical request fingerprint, committed revision/result reference, operation state and safe error cause. The same key with a different fingerprint is a conflict. Replay after authorization loss must not disclose a prior result unless current receipt-read policy permits it. Required state/receipt/outbox writes share one physical database transaction.

<a id="web-h-database-safety"></a>

## Database safety

Use non-null scope fields, same-scope composite foreign keys, typed statuses/check constraints, UTC timestamps, lossless provider identifier types and partial uniqueness for active bindings. Do not use nullable Tenant/Site values as broad wildcards. A global code-owned public catalog is a separate resource class, not a null-Tenant customer record.

Make scope, creation attribution and completed evidence immutable under ordinary updates. Enforce legal transitions in owner operations and constraints/triggers where they can be safely expressed. Append correction/revocation events; do not rewrite admission provenance. A delete cannot cascade into retained generations, content, rights evidence or audit. Artifact storage IDs are not download permissions.

RLS must enforce both existing-row `USING` and new-row `WITH CHECK` semantics for exposed operational tables. Test direct SQL/API, views, functions, inherited grants and service-role pathways. Private Payload tables are inaccessible to browser roles or protected through the exact approved adapter policy. Security-definer functions have fixed search paths, minimal EXECUTE grants and no caller-selected bypass context. RLS is enforcement of Phase 12 policy, not a second policy vocabulary. (E32; R09.)

Indexes must support binding lookup by provider identity and current scope, active binding uniqueness, due work by state/not-before, stable receipt lookup and bounded build/candidate history. Keyset order uses stable tie-breakers; no fetch-all-then-filter by Tenant. Do not expose source code, secret parameters or message bodies in indexes/logs by default.

<a id="web-h-single-physical-transaction-requirement"></a>

## Single physical transaction requirement

For an Editorial save, authorization/lease/revision proof, Payload-backed content, source revision advancement and receipt must commit or roll back together. For an operation needing a post-commit job, its dispatch intent belongs in that same commit. Passing the same Payload `req` carries the documented transaction identity (E02), but a separate Supabase HTTP/RPC request is NOT thereby part of that transaction.

Implement a qualified private adapter whose transaction callback can perform all required writes on one physical PostgreSQL transaction. The exact adapter APIs and transaction/connection behavior must be demonstrated under the admitted Payload cohort at Q02. Do not invent cross-service atomicity, compensate acknowledged lost content later, disable transactions, or claim success before awaited work commits. If a qualified single boundary is unavailable, the affected write capability cannot ship; resolving that boundary is an implementation task, not a runtime fallback.

<a id="web-h-command-envelope"></a>

## Command envelope

```typescript
type MutationRequest<T> = {
  requestId: string;
  expectedRevision: string;
  leaseGeneration?: string; // required by admitted editorial mutations
  input: T;
};
type MutationReceipt = {
  receiptId: string;
  outcome: "committed" | "no-op" | "accepted";
  acknowledgedRevision?: string;
  canonicalDigest?: string;
  operationId?: string;
};
```

Tenant, environment, actor, author, capabilities, approval authority and safety ceiling come from trusted server context. Route/resource selectors request scope; the server verifies them. Incoming actor/tenant/bypass fields are rejected, not ignored ambiguously. Mutations are POST/PATCH through the owner’s documented route; GET never starts a build or publication. Session cookies require the existing CSRF/origin protections. Proposed JSON endpoints stay thin adapters, not app-local business logic.

<a id="web-h-operation-inventory"></a>

## Operation inventory

| Operation (proposed)                   | Inputs in addition to exact resource selector            | Authoritative checks/effect                                                      |
| -------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `GetEditorProjection`                  | Requested resource and exact locale                      | Current read capability; minimal content/control schema; no full grant inventory |
| `AcquireEditorLease`                   | Editing-session ID and expected source revision          | Current edit capability; one exact lease or read-only response                   |
| `RenewEditorLease`                     | Session, lease generation                                | Owner/session/generation/activity proof; no content mutation                     |
| `TakeOverEditorLease`                  | Expected owner/generation/revision; explicit action      | Distinct capability; checkpoint and atomic fence transfer                        |
| `SaveEditorial`                        | Candidate document, expected revision, lease, request ID | Structural/profile/reference checks, one content+receipt commit                  |
| `RestoreEditorialDraft`                | Chosen readable history revision; expected current/lease | Current compatibility; checkpoint; new private successor                         |
| `SaveAppearanceDraft`                  | Exact appearance axis and finite settings                | Phase 24/D9 permission and schema; never Page implicit write                     |
| `GetImpactProjection`                  | Node/reuse/package/settings version                      | Authorized bounded usage with completeness state; not authority                  |
| `PreparePreview`                       | Exact acknowledged input selection                       | Current preview rights; D25 complete private candidate                           |
| `GetPreviewStatus`                     | Candidate ID                                             | Current scoped rights; no bearer-ID shortcut                                     |
| `PublishEditorial`                     | Exact candidate/selection and expected target head       | Existing D1 + applicable policy; receipt and convergence intent                  |
| `SchedulePublication`                  | D13 exact target/action/time/zone/offset                 | Existing appointment owner; immutable selected authorization                     |
| `CancelAppointment`                    | Appointment generation/revision                          | Fenced cancellation; no undo of already committed publication                    |
| `BeginSourceConnection`                | Requested Site/project/provider                          | Asym integration-management capability; bounded state token                      |
| `CompleteSourceConnection`             | Provider callback code/state                             | Verify callback and provider relationship; exact binding commit                  |
| `SelectSourceRevision`                 | Verified binding/ref or exact source selector            | Resolve to immutable capture; fresh binding proof; no code execution in request  |
| `RequestQualification`                 | Capture, build profile                                   | Authorized request; quota; product work/receipt admission                        |
| `CancelQualification`                  | Request/attempt and expected generation                  | Fence future commits; terminate external work best-effort                        |
| `AdmitPresentation`                    | Exact evidence/artifact/policy, maintainer               | Independent platform qualification; no Tenant self-certification                 |
| `PrepareDesignActivation`              | Admitted artifact, exact settings/cohort selection       | Existing D10/D25 all-locale candidate preparation                                |
| `ActivateDesign`                       | Exact activation manifest and expected heads             | D10 all-or-none transaction; no content or money mutation                        |
| `DisconnectSource`                     | Binding generation, explicit action                      | Current management grant; increment fence; preserve admitted safe artifacts      |
| `PrepareSourceReplacement`             | New verified binding and candidate profile               | Prepare before atomic switch; history retained                                   |
| `PrepareMigration` / `CommitMigration` | Exact schema transform/input manifest                    | Owner-qualified no-write plan then fresh authorized private successors           |
| `GetOperationReceipt`                  | Opaque receipt/request identity                          | Current read authority; resolve unknown outcome without rerunning effect         |

The route and input schema derive from these operations during implementation. This package does not publish a generic arbitrary-operation endpoint or universal JSON-patch writer. Media, links, forms, schedules and Site setup reuse current owner commands, rather than new aliases with weaker checks.

<a id="web-h-error-contract-and-user-recovery"></a>

## Error contract and user recovery

Typed causes: `AUTH_REQUIRED`, `NOT_AVAILABLE`, `FORBIDDEN`, `STALE_REVISION`, `LEASE_LOST`, `INVALID_STRUCTURE`, `CONTENT_INCOMPLETE`, `INCOMPATIBLE_PROFILE`, `REFERENCE_NOT_READY`, `SOURCE_UNAVAILABLE`, `BINDING_CHANGED`, `BUDGET_EXCEEDED`, `QUALIFICATION_FAILED`, `CANDIDATE_STALE`, `COHORT_CHANGED`, `OUTCOME_UNKNOWN`, `RETRYABLE_DEPENDENCY`.

Return only safe field/node paths and permitted recovery action identifiers. Do not reveal another Tenant's resource existence or source names. A stale input generally maps to 409, structural validation to 422, unauthorized access to the established 401/403/existence-safe 404 contract, accepted asynchronous work to 202, resource limits to 429/413 as applicable. Semantic receipt state—not HTTP status alone—determines whether a command committed.

Unknown outcomes pause successor writes. Retry an identical request with the same idempotency key and bounded backoff or read its receipt; never generate a new key because the spinner lasted too long. Client cancellation is not proof that server work was canceled.

<a id="web-h-event-envelope"></a>

## Event envelope

```json
{
  "schemaVersion": 1,
  "tenantId": "opaque-tenant-id",
  "workflow": "web-studio.presentation.qualify",
  "recordRef": { "type": "presentation-build-request", "id": "opaque-id" },
  "dispatchRequestId": "opaque-dispatch-id",
  "routing": {
    "environment": "qualified-environment",
    "siteId": "opaque-site-id"
  }
}
```

Adapt field names to the existing envelope schema; do not create a parallel event bus. Identifiers are resolved under server scope. No HTML, composition content, prompts, source archives, credentials, signed URLs, full profiles, financial data or broad CRM records in events. Worker claims/fences and product receipts enforce effects beyond provider dedupe windows. Event time is not business effective time or authorization. (R10; E23.)

---
