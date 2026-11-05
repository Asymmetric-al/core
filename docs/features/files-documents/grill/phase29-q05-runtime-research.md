# Phase29 Q05 research — earlier own submissions after correction

Read-only research, 20 October 2026. Current checkout `/home/conrad/code/core`, HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Parent reports Q04 and all amendments ratified and is updating the records; this note treats that explicit ratification as current. The ADR-0004 status still said awaiting ratification during the first source read, so that transient wording is not interpreted as a contrary founder decision.

No code/schema/dependency/provider changes or test execution. No credentials, private rows or file bytes were read. Only this research note was written. This is evidence for the next product question, not an adopted history policy or a schema/API specification.

## The next decision is real and usefully narrow

Q01–Q04 provide current source-qualified confirmation, preview, corrected submissions and original download. They deliberately do not grant earlier-version recipient access. Q03 requires preservation of the earlier received act and exact prior decisions, while Q04's read remains bound to the selected currently authorized occurrence. Therefore **whether the ordinary recipient can open earlier own submitted files after sending a correction** is genuinely unresolved.

The highest-leverage next question is readback of **exact superseded correction-lineage predecessors while the person still has current access to the same request/item**. Chronologically earlier supporting files may remain current; they are not historical merely because a newer file arrived. Decide this before post-closure continuity: the former defines the ordinary read scope; the latter defines when any such scope ends or changes. Neither requires inventing a personal file archive.

Do not ask whether the platform keeps earlier submissions. That custody/history obligation is already settled. Do not offer overwriting, deleting, restoring as current, or undoing acceptance as equivalent history choices.

## Five different things called “history”

| Meaning                      | Relevant identity                                                                                                      | Does Q05 decide it?                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Earlier received submission  | A source-admitted submission/occurrence for the same item, linked through a correction to an earlier received act      | **Yes:** ordinary recipient metadata/readback permission for their earlier own submissions, subject to current source rules   |
| Submission confirmation      | Evidence that a particular version was durably received; distinct from acceptance or safe viewing                      | Related context, but possession/preservation of a confirmation is not automatically permission to retrieve the older bytes    |
| Technical generation history | Render attempts, preview renditions, retries, scan runs, storage copies, failed transfers                              | **No:** these do not become participant submission versions or an activity feed                                               |
| Authoring history            | Staff-created PDF/email template versions, drafts/publications, restore commands                                       | **No:** a template restore is not a recipient action on immutable received evidence                                           |
| Staff/source audit history   | Review, approval, restriction, routing, correction and downstream business decisions, sometimes with protected reasons | **No:** source-approved participant status can be projected; raw audit entries or staff assessments are not recipient history |

An additional supporting file is not necessarily a correction. A same-name or same-hash file is not automatically the same source occurrence. A multi-file item can have several currently relevant members. The ordinary screen cannot determine “current” by taking the newest filename, last timestamp or highest version number.

## Accepted source evidence

| Source                      | Exact path and lines                                                                                              | What it establishes                                                                                                                                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Request-only authority      | `docs/features/files-documents/CONTEXT.md:14–31`                                                                  | Recipient authority is request-specific, not membership/file ownership. Earlier submissions and reading require separately admitted actions.                                                                                                                                           |
| Confirmation versus preview | Same glossary`:39–50`                                                                                             | Confirmation records durable receipt; preview is an exact received representation under current source permission. Neither is acceptance or a general history grant.                                                                                                                   |
| Item/correction/original    | Same glossary`:52–68`                                                                                             | An item may contain multiple supporting files; correction preserves the earlier act; original means the selected submission's bytes, not first-ever or latest.                                                                                                                         |
| Q02 reservations            | `docs/features/files-documents/docs/adr/0002-purpose-bound-files-and-submission-readback.md:47–66`                | Earlier history, original delivery and post-closure access are separate source decisions; custody/session/rendition lifetime are distinct.                                                                                                                                             |
| Q03 correction semantics    | `docs/features/files-documents/docs/adr/0003-recipient-corrections-and-exact-review-lineage.md:18–33,43–54,72–75` | Durably admitted correction fences predecessor candidacy; failed successor does not silently revive it. Earlier acts/decisions and unrelated supporting files/uses remain. Previous-version participant history is explicitly reserved.                                                |
| Q04 current original        | `docs/features/files-documents/docs/adr/0004-submitted-original-download-and-current-source-authority.md:19–46`   | Original access independently qualifies whole-file disclosure and immutable copies; reads reauthorize; admitted streams remain version-bound without historical rights. Prior-version archive and post-closure duration were not granted.                                              |
| Workflow participant intent | `docs/prds/workflow-studio/01-product-and-experience.md:57–63,71–83`                                              | A participant projection includes submitted items/correction requests, excludes internal assessments/routing/technical failures, and uses new immutable resubmissions. This does not explicitly grant all historical file bytes.                                                       |
| Workflow service contract   | `docs/prds/workflow-studio/04-data-and-api-contracts.md:82–98`                                                    | Submission service records immutable source-validated submissions; replayed results and private reads still need current permission; caches/projections remain scoped. It is intended contract, not the generic request runtime.                                                       |
| Official document history   | `docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md:234–240,250–259`                            | A logical official document has one current ordinary action; prior canceled/replaced artifacts require evidence permission. Donor is not offered all technical/history copies. This specializes official artifacts; it neither forbids nor grants native recipient submission history. |

Existing P21 expense-evidence and P26 attachment-source rules continue to govern their exact histories; a native ordinary default cannot make retained evidence public to every original uploader.

## Actual runtime: useful pieces, no discovered generic history service

A bounded current-source search across `apps/admin`, `apps/donor`, `apps/missionary`, `packages/api/src`, shared UI and `supabase/migrations` used document-request/requirement/submission-version/predecessor/history terms. It did not surface the generic native recipient request/submission-history route, occurrence chain or read model. It did surface specialized care requirements, financial corrections, template versions, Support attachment occurrences and donor receipt actions. This is scoped negative evidence, not proof that every repository identifier or deployed system was exhaustively searched.

### Support attachment occurrences

- `supabase/migrations/20260515025814_support_hub_core_modules.sql:325–343` defines attachment rows with tenant, attachment ID, message ID, filename/type/size/URL and a composite same-tenant message FK. It does not define recipient submission correction lineage.
- `packages/api/src/admin/support-hub/adapter/supabase.ts:621–640` creates a fresh attachment occurrence ID under a message. The read path loads attachment rows by tenant and the selected message IDs, then groups them by message (`763–784`). This is useful source-occurrence scoping, not a version chain based on filename.
- `apps/admin/features/support-hub/components/detail/timeline/EmailMessage.tsx:136–162` renders attachment filename chips, keyed by attachment ID. It supplies no linked prior-submission viewer/download.
- `tests/unit/apps/admin/support-attachment-identity.test.tsx:7–43` contains an existing duplicate-filename/focus fixture for unsent draft chips. Its subject is keeping the remaining control's identity/focus when another same-name draft is removed. It is not received-history authorization or correction proof. **Not run for Q05.**

### PDF generation/authoring history

- `apps/admin/app/(app)/pdf/page-client.tsx:593–599` shows **Version History** but only calls `toast.info("Version history coming soon")`. Do not describe this as an implemented history screen.
- `supabase/migrations/20260515140948_native_pdf_studio_foundation.sql:49–64` stores template versions; `66–86` stores renderer executions; `88–106` stores resulting artifacts; `108–118` stores template audit events. Their distinct identities are useful conceptual precedent. These rows are not received submissions or external recipient permissions.
- The source's generated-document/PDF package families therefore cannot be reused as a generic “file history” table without changing meaning. This note does not assess all later PDF policies or declare a current RLS defect from the original migration.

### Email template versions and restore

- `packages/api/src/email/templates.ts:322–336` has a real version-list handler behind admin context and tenant template resolution. `338–364` has a version restore handler.
- `packages/api/src/email/template-store.ts:522–535` lists template versions by tenant/template. `538–596` loads a selected version, updates editable template content to it, increments the template's version and creates a new snapshot.
- That is **authoring restore**, not permission to restore a received submission as current or to reverse source acceptance. Listing under an exact owner can be a pattern; restore semantics must not migrate into Q05.

### Contribution correction and receipt UI

- `packages/api/src/admin/contribution-operations/viewer-projection.ts:146–162` derives per-request decision affordances for a financial correction from viewer policy/profile/capabilities. This illustrates server-derived action availability, but maps specialized staff correction data; it is not a recipient-safe historical-document serializer.
- `apps/admin/app/(app)/contributions/correction-approval-panel.tsx:123–135` retains decided outcomes in local component state for that session, while filtering current pending requests. It is a useful non-disappearing-result interaction, **not durable history across sessions or an archive**.
- `apps/admin/app/(app)/contributions/operation-shell.tsx:237–246` links a generated receipt snapshot; `packages/api/src/admin/contribution-operations/receipt-pdf.ts:203–208,251–274` loads a snapshot and renders output. The prior Q04 review already establishes why this is not an exact retained original gateway.
- `apps/donor/app/(dashboard)/donor-dashboard/history/columns.tsx:175–192` links a receipt from a transaction row. `packages/api/src/donor-portal/receipts.ts:45–80` scopes a donation to donor/tenant and generates a text receipt. Giving history is not a recipient correction history and the prototype is not P18 official-version qualification.

### Staff audit and public CMS

- `packages/api/src/admin/support-hub/audit.ts:7–25,28–46` defines tenant/conversation/actor/verb/body/metadata audit rows and checks insertion errors. Persisted staff history is a distinct source concern; exposing it wholesale would leak internal reasons, actors or metadata.
- `apps/admin/src/cms/collections/media.ts:16–20` explicitly has `versions: false`. The public CMS media library does not supply the required private correction/version-history service.
- `packages/ui/components/shadcn/collapsible.tsx:3–21` already wraps Base UI Root/Trigger/Panel. A small contextual disclosure can use shared primitives if chosen; the primitive supplies no permission, pagination, source currentness or accessible complete-journey proof.

## Recommendation and honest alternative

**Recommended ordinary default: concise source-approved receipt/correction history, with file View/Download actions on the current permitted submissions only.** This answers the primary task questions—whether a correction was received and which exact files remain current—without granting ordinary retrieval of superseded content. Its historical metadata is still a deliberate participant-safe projection, not a raw audit feed or an automatic entitlement to all retained confirmations.

Keep the current relevant submission(s) prominent. Historical rows follow the exact correction lineage, showing permitted received time and correction relationship with enough safe context to distinguish the acts. Use ordinary language such as “Earlier submission — corrected on …” when true. Do not label all older files “invalid,” “rejected,” or “canceled”: age alone does not establish those business facts. Untouched supporting files can remain current and keep their currently permitted actions.

**Strong alternative: also permit read-only View/Download of those exact superseded own predecessors under current source permission and independent qualification.** The strongest task case is repeated corrections with identical filenames: a timestamp or receipt cannot establish what the predecessor actually contained. Someone who suspects they corrected the wrong scan, or needs to explain a discrepancy, can inspect that exact predecessor instead of reconstructing local files or asking staff to retrieve/send it. This provides recipient transparency over the received act, uses Q02/Q04 read mechanisms, and does not require Restore or an archive service.

Those are plausible task cases, not measured ministry demand. Current-file preview plus clear receipt/correction history already answers the ordinary confirmation/currentness job. Broader readback adds a new content permission: a predecessor may be precisely the mistakenly disclosed sensitive file that caused the correction, may contain hidden original-only material, or may become restricted later. Same uploader or continued request access cannot erase those costs. Source-authorized older-byte retrieval is defensible, but the available runtime evidence does not establish it as necessary or demonstrably superior.

The recommended default is therefore narrower ordinary content access with truthful history, while preserving a separately source-qualified older-content capability where required. Its cost is that an actual need to inspect an earlier scan can require a help/access path. Do not disguise that tradeoff or claim metadata is equivalent to exact content.

Both choices preserve immutable history, prior decisions and existing specialized-source access. The smaller option is not deletion or forgetting. The broader option is not indefinite archive access, blanket uploader ownership or Restore.

Two options are sufficient for the next founder question if both preserve source-approved receipt/correction history and explicitly differ on superseded **content** access. A vague “show history?” question is inadequate because it can mean metadata-only confirmation, raw audit, preview, original download or editable restore.

## Narrow scope to explain with the choice

1. **Still current authority, same source/item:** not all files the account has ever uploaded. No donor/organization membership is added, and identity/mailbox equality does not pool access across requests.
2. **Received submissions, not every attempt:** a failed transport, unsent local selection, aborted upload, renderer retry or regenerated preview does not become an earlier submitted version. A durably received but disallowed/quarantined file can have only the safe source-approved confirmation/status; the history choice cannot unlock its bytes.
3. **Each read is independent:** historical listing/metadata, qualified preview and whole-original download need current authorization. A collapsed section must not eagerly return unauthorized rows, counts, filenames, hashes or hidden technical generations.
4. **History never becomes review selection:** no Restore/Make current/Use this instead/Delete action is implied. If an old copy is needed as a future submission, use a later separately source-authorized action with fresh qualification, not an automatic reversal of Q03.
5. **No silent revival:** a failed or checking successor does not make the predecessor current again. A historical permitted preview is labelled historical and cannot feed a current acceptance decision accidentally.
6. **Multi-file truth:** show the exact correction relation and preserve untouched siblings; not one flat “version 1/version 2” list that implies every other file was replaced. Same bytes reused in another source retain separate source use/rights.
7. **Current safety and restriction:** an earlier file that was once downloadable can later be unavailable. Neither earlier receipt nor a saved UI route bypasses restrictions, qualification, current private serving, retention/disposal or content disclosure rules.
8. **No new duration:** Q05 does not promise earlier access after closure, acceptance, reassignment, account/session changes or source expiry. Post-closure continuity is the next separate decision; “request still open” alone is never the entire authorization predicate.
9. **No staff audit disclosure:** show source-approved status/receipt/correction facts only. Internal reviewers, protected reasons, fraud/care notes, provider attempts and raw activity logs remain independently protected.
10. **Small UI:** current files first, contextual earlier-submissions disclosure if needed, exact row selection, clear non-current status and existing View/Download semantics. No mandatory comparison editor, side-by-side diff, restore workflow, archive ZIP, bulk download or extra confirmation ritual.

## Suggested founder question

“You send a corrected scan, and Asym keeps both received submissions. While you still have access to that request, should you see a clear record of the correction with View/Download on the current files only, or also be able to open/download the exact earlier file it corrected?”

- **History, current-file actions — recommended:** clear receipt/correction facts and a narrower ordinary content scope; older copies need the source's help/access path even though evidence remains preserved.
- **Also open earlier corrected files:** easier to inspect exactly what a predecessor contained; each older file is clearly historical and still subject to current permission/safety. More superseded material remains available during that allowed scope.

Clarify before asking: no Restore, no other people's files or staff notes, no grant after closure, and no known unsafe or restricted original override. Explain that “original” remains the exact bytes of the selected historical submission if this broader access is chosen.

## Implementation implications to carry forward, not freeze now

The native source needs an exact recipient-safe historical projection distinct from its current review/evidence set and staff audit. Shared custody still supplies only exact permitted originals/renditions. Reuse Q02/Q04 serving and Q03 correction identity, not renderer/template versions or filename ordering. Current access must guard list counts/metadata as well as each open/download. Bound pagination and source-qualified history work without picking arbitrary counts in this question.

Do not freeze table names, endpoint paths, numeric version counters, storage paths or a universal history status enum during grooming. The implementation must express immutable received acts, exact corrections and source-owned eligibility; its data shape follows the authoritative domain/source integration.

No new test was necessary to establish this product branch. Later proof would need: exact recipient/item/history isolation; unauthorized count/metadata suppression; same-name and multi-file corrections; no silent predecessor revival; current versus historical review targeting; per-occurrence preview/original rules; list/read races with restriction and correction; retention/disposal and missing-copy behavior; stale tabs/routes; accessible current/history distinction and representative recipient recovery. Prior Q02–Q04 test counts are not history-feature evidence.

## Remaining evidence gaps

The generic native history schema/service/projection and UI were not found in the bounded source paths. No deployed recipient history capability, live RLS/storage roles, private byte retrieval, browser/AT interaction or representative participant demand was tested. Specialized history code demonstrates possible reuse of interaction and scoping patterns only. Parent owns final source-owner reconciliation, options and founder question; this note adopts no new permission.
