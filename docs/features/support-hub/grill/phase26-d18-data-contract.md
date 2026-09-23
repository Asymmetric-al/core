# Saved-reply ownership, data and CRM contract

**D18 and this complete data contract are fully founder-ratified, 11 September 2026.** This companion to [D18](phase26-d18-adversarial-review.md) defines logical ownership and invariants. Physical tables and API names remain the implementing owner's design; current columns do not establish correct access behavior.

The [Email Studio integration record](phase26-d18-email-studio-integration.md) makes the shared capability seam and its proof obligations explicit.

## Authoritative facts

| Fact/object                                                 | Owner                                                                        | Invariant                                                                                                                                           |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Personal item and immutable authored revisions              | Email Studio authoring, scoped to tenant and one tenant-membership custodian | My ordinary use is author-specific, not global-account portability or confidential-from-all-administrators storage. Save is not Shared publication. |
| Shared item, usable language revisions and audience         | Same Email Studio owner, tenant stewardship                                  | Shared does not depend on creator employment. Current audience restricts old revisions, links and future use.                                       |
| Reply/Internal note purpose                                 | Qualified reusable-content contract                                          | One purpose per item; internal-only provenance never becomes external by mode switch or Undo.                                                       |
| Typed fields                                                | Actual qualified context/domain owner                                        | Values require exact current source and disclosure authority. No first Party/recipient/assignee heuristic.                                          |
| Fill-in field and one-use answer                            | Shared authoring definition; current draft owns inserted answer              | Fresh occurrence per insertion; answers never write CRM, reusable source or another draft.                                                          |
| Language variants                                           | Same authoring owner with shared locale validation                           | Exact independently authored revisions; no live translation or hidden fallback.                                                                     |
| Contribution                                                | Email Studio immutable offered candidate                                     | Deliberate reviewed snapshot and destination asset scope, not a live link to all personal material.                                                 |
| File/image                                                  | Qualified asset owner and explicit authoring/destination occurrence          | Personal-to-Shared offers establish valid destination custody; safety dependencies survive copies. No personal hotlink.                             |
| Favorites/recent selection/category preference              | Existing tenant-member preference capability                                 | References confer no access and retain no body or unauthorized title. Categories do not decide permissions.                                         |
| Inserted unsent material                                    | Current Reply/Internal note draft                                            | Draft retention/source constraints apply; insertion is not a D17 admitted-original event.                                                           |
| Admitted Support reply/note                                 | Support original and work domain                                             | D17 content retention begins under its actual admission/purpose contract. Library edits never reset it.                                             |
| Prepared external reply                                     | P17 preparation                                                              | Exact reviewed content and dependencies; no rerender on library edits/retries. Internal notes do not enter this class.                              |
| Dispatch and actual communication/Recent evidence           | P6 and actual qualified history/copy owner                                   | Tenant Resend envelope, truthful outcome, stricter copy limits and deduplicated communication.                                                      |
| Party/relationship, giving, official document, care context | Their actual CRM/financial/document/care owners                              | Library operations perform no mutation, grant no access and prove no business completion.                                                           |
| Safety, custody, disposal and restore evidence              | Actual source/records owners using existing contracts                        | Minimum justified evidence with current restrictions, truthful cleanup and no shadow body archive.                                                  |

## Required constraints and mutation boundaries

Use tenant-aware keys/FKs across item, revision, locale, asset occurrence, contribution, preference and provenance relationships. Personal scope requires one tenant-membership custodian; Shared has tenant stewardship rather than a personal owner. Actor, tenant, custody and accepted time derive from trusted authenticated context. Enforce consistent scope/state/purpose/locale combinations and immutable accepted revisions. One current usable head exists per item/locale under its owner lifecycle. Titles and aliases are not primary keys; collision never exposes a hidden item or changes which item was selected.

No generic update may turn a personal row Shared by nulling owner, assign another custodian, rewrite published evidence or replace tenant/source identity. Shared promotion creates a destination candidate with exact disclosure checks, including files. Scope widening validates all exposed variants/assets; narrowing governs all retained revisions and deep links immediately according to the current authorization revision. Personal Save, Shared Publish, Offer, Withdraw, Archive, Restore and custody are distinct authorized effects even if they reuse infrastructure.

Use expected revisions and immutable operation input for concurrent edits and lost responses. Same operation/input reconciles its receipt; different input conflicts. Contribution withdrawal cannot retroactively delete a published Shared item. Source effect, safe audit and required owned-attention obligation commit together or use the existing transactional outbox. Ordinary library edits do not modify inserted drafts; ordinary Archive stops new insertion, while current safety restrictions and permissions govern future preparation/dispatch according to D4/P17/P6.

RLS USING and WITH CHECK, table/column grants, views/functions/RPCs, storage and privileged service paths must enforce the same boundary. Multiple permissive policies combine with OR; adding a nominally restrictive policy alongside broad staff access is insufficient. Current authorization precedes query membership, counts, search, exports and caches. A user with all-tenant administrative execution cannot use that service privilege as a substitute for personal/shared application policy. Opaque source IDs and cached data are not capabilities.

Control deletes explicitly. No staff/agent-parent cascade deletes shared content, message history, unresolved contributions, source restrictions or required provenance. Archived and restricted content cannot be restored by old writers, migration or backup replay. The source owner can dispose governed payload while retaining only justified safe evidence; immutability does not mean permanent readable content.

## Data classes and retention

| Class                                                          | Retention/correction rule                                                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Active generic reusable wording                                | Continues only under its actual authoring purpose and owner policy; no arbitrary universal numeric expiry. |
| Abandoned drafts, superseded source, declined/withdrawn offers | Actual authoring retention and disposal; no indefinite readable versions by default.                       |
| Known case-derived text, files, URLs or rendered values        | Inherited source authority/correction applies; they cannot be laundered into generic library content.      |
| Unsent insertion and fill-in answers                           | Qualified draft lifetime, current author/source rights; no new admitted-message retention clock.           |
| Admitted messages and notes                                    | D17's actual original-content policy; note mode never becomes an email artifact.                           |
| P17 prepared material and P6/qualified Recent copy             | Independent tighter limits, immutable preparation and actual safety/reconciliation fences.                 |
| Compiled previews/search indexes/exports                       | Derived, permission-aware, revocable and disposed through the owner's current-source contract.             |
| Audit/operation/provenance/usage/preference facts              | Minimum allowed fields, named owner/purpose/horizon; no filled answers or before/after case HTML in logs.  |
| Backups/restore/replay controls                                | Actual owner lifecycle and barriers preventing resurrection before any ordinary serving resumes.           |

Every deployed class must have actual owner-approved horizons, scope and final disposition before activation. This is not a global indefinite metadata exception or a numerical retention policy for every Asym domain. D16/D17 remain ratified and unchanged.

## CRM journeys to prove

1. **Unknown requester:** staff inserts neutral shared wording, fills a one-use clarification field and sends through D1/D4 without creating a Party or storing the answer in CRM.
2. **Several related records:** a conversation concerns a person and an organization. The library cannot choose the first record. Any actual field resolution identifies the authorized source and common audience; ordinary neutral copy remains possible.
3. **Receipt request:** Support uses general instructions. The actual receipt correction/delivery follows its owner validation, approval and current artifact rules. The Support message does not manufacture a successful correction or duplicate official records.
4. **CRM-to-Support navigation:** the same permitted composer and draft uses the same library. Opening the asset editor reveals synthetic/generalized content, not the real recipient data used in that draft.
5. **Staff-only note:** note wording is inserted, filled and added through the note boundary. Switching to Reply cannot carry internal provenance into external mail. No P6 email preparation or Resend action occurs.
6. **Departure:** Shared remains usable under tenant stewardship, including independently valid assets. Personal ordinary use ends; same-email reinvitation does not confer old custody. Authorized records administration is separate and audited.

Saving, publishing or inserting produces no CRM communication, last-contact date, gift/refund state or task completion. The actual admitted send produces only its qualified P6 evidence. This is coherent context reuse, not data synchronization between a new help desk and another CRM.

## Current-source gaps and implementation qualification

The present saved-response schema has nullable owner and a cascade from Support agent; the adapter lists tenant rows and accepts caller owner input. Raw mutable body fields, local variable substitution and query keys are not the selected private/shared contract. Conversely, the current server canned-response macro explicitly skips sending; this review does not claim it auto-sends. [Structural source evidence](phase26-d18-source-evidence.json) and the [research record](phase26-d18-evidence.md) give exact paths and qualifications.

Qualify one P17 authoring extension, current tenant/member authorization, source-safe assets and fields; then protected data mutations, complete search, UX, independent Shared contributions and custody. Convert legacy content into nonpublishing drafts only when authority is known; fence old CRUD/macro paths first. Native portability reuses the existing owner package and validates destination authority. Prove D18 P01–P50, including both policy race orders, real grants/RLS, restore, mobile/a11y and production-shaped capacity. No schema, database or runtime mutation is claimed by this contract.
