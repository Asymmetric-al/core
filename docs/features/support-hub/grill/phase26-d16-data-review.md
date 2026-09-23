# D16 independent data, authorization and CRM review

Date: 2026-09-11. Read-only review of Core worktree `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`; execution directory verified on every repository tool call. Source revision supplied by root and used for references: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. This report changes no governed document or runtime. No database, environment, provider account or real message was accessed. No synthetic model test is presented as implementation proof.

Disposition: **Accept with required amendments.** Selective permanent removal can preserve useful conversation context. It must be a source-owned correction with current authorization, representation invalidation and durable disposal evidence. Adding a visual mask or a generic row update to today's Support interface would not deliver this.

## Evidence and authority

Read root AGENTS, API/database/Supabase scoped instructions, backend rules, data-access guide, OpenSpec project index, relevant platform/CRM text, P6 retention/dispatch clauses, platform ADR-0001 and ADR-0031, and D9/D10/D12/D15 feature decisions. Relevant source links below are immutable:

- [Current message mutation contract](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/types.ts#L215): lines 215–234 expose conversation operations plus `sendReply` and `addPrivateNote`; no redaction command in this inspected contract. This is a bounded observation, not proof that no other repository path mentions redaction.
- [Support message and attachment schema](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L286): lines 286–343 use tenant-aware message/conversation and attachment/message keys, but bodies/author/header metadata are broad JSON and inbound/outbound FKs reference only globally unique IDs.
- [Generic Support grants and policies](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L520): lines 520–575 include messages, attachments and audit; authenticated staff get SELECT/INSERT/UPDATE/DELETE, with tenant/staff or super-admin checks. No field immutability or specific correction capability appears there. Targeted migration search found no later Support-specific replacement of these named policies; live grants were not queried.
- [Inbound parsed bodies](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-email.ts#L120): lines 120–214 fetch and persist `parsed_text` / `parsed_html`; lines 410–427 route those bodies onward. [Support insertion](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L1331), lines 1331–1355, stores both again in `body` with the inbound reference and transport headers.
- [Inbound current hardening](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260426100000_resend_email_rls_grants.sql#L3): lines 3–24 enable RLS and deny anon/authenticated access to provider tables, including inbound parsed bodies; service-role access remains. Do not report the older migration's disabled RLS as the final current migration posture.
- [Provider webhook placeholder](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/email/webhooks/resend.ts#L791): lines 791–819 deliberately avoid body/attachment bytes but upsert metadata and raw event data, including subject and recipients. It is not a universal absence-of-PII guarantee.
- [Read mapper](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L525): lines 525–563 return body/headers and attachment filename/URL as stored. Lines 731–813 gather all conversation pages, then attachment chunks and inbound status. No correction revision is present in this mapper.
- [Email render](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/timeline/EmailMessage.tsx#L134): lines 134–149 render preferred body and filenames; lines 259–264 prefer HTML then text. [Private note renderer](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/timeline/PrivateNote.tsx#L58), lines 58–66, follows the same HTML-first rule.
- [Current client query defaults](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/lib/api-client.ts#L7): lines 7–12 set staleTime 15 seconds, gcTime five minutes, no window-focus refetch. [Message hook](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/hooks/use-support-messages.ts#L36), lines 36–62, uses API results and filters private messages in memory. This filter is not an authorization boundary. [Query keys](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/query-keys.ts#L47), lines 47–54, contain conversation IDs, no explicit tenant/principal generation; whole-provider reset behavior was not exhaustively inspected.
- [Local demonstration collection](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/collections/support-hub.ts#L2193): lines 2193–2207 clone in-memory `messageRows`. Do not characterize this collection as a proven Supabase-backed correction stream.
- [Current audit contract](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/audit.ts#L7): lines 7–25 accept arbitrary body and metadata; lines 34–45 insert rows. [Audit schema](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L476), lines 476–495, has conversation cascade deletion and broad metadata.
- [CRM authority](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md#L60): lines 60–88 establish Asym Postgres and retire Twenty. Stale `openspec/specs/crm-core` provider language is not permission to restore Twenty synchronization; root/API instructions and the explicit founder ruling settle this known contradiction.
- [Body-free P6 history](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0031-body-free-history-with-expiring-recent-copy.md#L18): lines 18–50 distinguish history from recent copies, source/current authorization, immediate expiry authority and restore restrictions. [P6 A14/A15](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md#L172) requires source minimization/irreversible erasure; its existing legal labels need applicability review, not blind amplification into a universal legal claim.

Current primary technical references (retrieved 2026-09-11):

- [PostgreSQL 17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html): RLS and SQL grants are distinct; USING protects existing rows, WITH CHECK constrains resulting rows; permissive policies combine by OR. Owners ordinarily bypass RLS, and BYPASSRLS roles do so even with FORCE. `supabase/config.toml:34` pins local major 17; no production engine version was inspected.
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control): Storage operations require suitable policies; service keys bypass them. D16 must preserve owner authorization on its privileged worker paths.
- [Supabase signed URL serving](https://supabase.com/docs/guides/storage/serving/downloads): storage signed URLs use a separate internal signing key, unaffected by Auth key rotation/revocation. Do not promise that disabling an account or rotating Auth keys revokes an already issued storage URL.
- [Supabase Smart CDN](https://supabase.com/docs/guides/storage/cdn/smart-cdn): current docs say signed response caching can outlive token expiry, object deletion invalidation may take up to 60 seconds, and browsers can retain their cached copy. This is a consequential constraint on claims of immediate attachment containment; it is not proof of which CDN plan Core currently uses.
- [Supabase Storage schema](https://supabase.com/docs/guides/storage/schema/design): storage metadata and stored object bytes are distinct; use supported Storage operations rather than deleting metadata and assuming physical disposal.

## Findings with exact proposed language

Likelihood below means likelihood if implemented with the identified omission; no incident rate or exploit in a deployed D16 feature is claimed.

### F01 — More than one persisted body exists today

**Concern:** material. A text-only update to `support_messages.body.text` leaves HTML, inbound parsed copies and possibly editor JSON readable; changing only the visible renderer is masking, not permanent removal. **Why it matters:** the same removed content can be read by APIs, fallback renderers, recovery and future features. **Severity:** high. **Likelihood:** high, directly suggested by current parallel body storage and HTML-first rendering. **Effect on answer:** narrows A to one authoritative correction boundary, without requiring a new generalized retention platform.

**Permanent fix:** make the current source revision authoritative for every representation. At least inventory HTML, text, editor JSON, inbound parsed representation, raw MIME/provider evidence if retained, subject display copies, previews and managed file derivatives. Distinguish a representation of the selected source from independently authored repetition.

**Exact requirement:** “A redaction binds the original message and current content revision. The server produces one sanitized current body and derives or invalidates every representation of that same source. A removed value SHALL NOT remain in alternate HTML, plain text, editor JSON, hidden attributes, quoted MIME alternative, preview, or original-email view. Where exact selective transformation of an alternate representation is unprovable, that representation is removed or withheld; the preview clearly discloses any larger removal before commitment.”

**Proof:** HTML-only, text-only, multipart alternatives, hidden title/alt/href values, malformed markup, inline images and old source inspection must never reveal the selected secret. An unrelated legitimate paragraph remains unless the reviewed fallback removes the whole body.

### F02 — Retrieval and webhook replay can restore removed material

**Concern:** material. Current retrieval writes by inbound ID after a provider await; it does not compare a content disposition revision. The webhook upsert can rewrite subject/recipient metadata from a delayed duplicate event. **Why:** a completed UI action is not permanent if an old worker restores old bytes. **Severity:** high. **Likelihood:** medium under retry/concurrency; source paths exist. **Effect:** adds a required shared inbound-owner guard, not a second intake mechanism.

**Permanent fix:** authoritative correction/restriction generation must fence all writes that can hydrate content. Preserve needed source/routing facts and bridge identity; do not delete the entire inbound row as the normal redaction implementation.

**Exact requirement:** “Inbound retrieval, attachment materialization, replay, imports and webhook enrichment MUST re-check the current source disposition at their final write. Data obtained before a correction cannot overwrite a later correction. A retained body-free transport identity or tombstone prevents duplicate ingestion from resurrecting a removed original; it never retains the removed payload. Old provider events may add valid delivery evidence but cannot restore disposed display metadata.”

**Proof:** pause provider fetch, commit removal, release stale fetch; stale body/file/metadata cannot reappear. Redeliver the same webhook before and after removal; no new conversation, new authority or restored bytes.

### F03 — Generic staff writes bypass the deliberate correction contract

**Concern:** material. Today's generic authenticated UPDATE/DELETE grants and tenant/staff policies are weaker than D16's explicit capability, currentness and history requirements. The old/new tenant check does not prevent replacing body, author, route, private/public mode or audit state within an allowed tenant. **Why:** otherwise a user could avoid the reviewed action, erase evidence or restore payload. **Severity:** critical for unauthorized disclosure or irreversible history tampering. **Likelihood:** medium if existing grants are reused. **Effect:** changes required implementation authority; A remains appropriate.

**Permanent fix:** source content/control mutations through one canonical API command with server-derived tenant/actor and explicit redaction capability plus exact source authorization. Deny browser DML to correction records, irreversible disposition and audit; constrain any remaining writer to its permitted fields. Service role does not waive authorization. A new restrictive policy alone cannot compensate for an unrelated permissive policy without checking effective policy composition and grants.

**Exact requirement:** “Only the qualified source-owner correction command may change published Support content or its disposition. Tenant, principal, actor and correction timestamps derive from trusted context. Requester status, assignment, following, email matching, conversation linkage and CRM ownership do not grant redaction or restricted-content access. Browser mutations cannot change original identity, tenancy, author, audience, routing, correction generation or protected audit. SQL grants, USING and WITH CHECK, views, RPC execution grants and privileged workers enforce the same outcome.”

**Proof:** direct SQL/API negative tests for staff without capability, authorized staff without source access, forged actor/tenant, cross-tenant endpoint IDs, update that transforms allowed row into forbidden state, spoofed author and changed private/public mode; privileged-worker parity tests.

### F04 — Do not freeze today's loose bridge relationships into the new design

**Concern:** material. Message/conversation and file/message relations use composite tenant FKs, but inbound/outbound references currently use only global IDs; inbound-to-support reverse bridge fields are plain text, and the inbound index is not unique. **Why:** source-copy correction needs proven exact ownership, not a trusted caller's belief about a link. **Severity:** high. **Likelihood:** medium for a new cross-domain disposal command. **Effect:** adds schema proof before activation.

**Permanent fix:** exact same-tenant/source identity constraints or a single trusted atomic owner mutation prove the bridge; avoid a generic polymorphic payload owner. Existing duplicate bridges require bounded inspection and disposition, not “first one wins” as erasure scope.

**Exact requirement:** “Every correction target and managed representation has a tenant-aware, validated original-source relation. Original source IDs are immutable. The same original cannot have contradictory live payload authorities. Corrections use permanent operation identity, current-version comparison and a monotonic content revision; an old operation may return its receipt but cannot overwrite a later revision. Foreign keys and uniqueness prove same-tenant cardinality wherever the records share the database.”

**Proof:** conflicting bridge, orphan attachment, duplicate inbound identity, simultaneous correction and replay, and update of source relation rejected; no cross-tenant deletion through a valid foreign ID.

### F05 — A filename removal or row deletion is not attachment disposal

**Concern:** material. Current file rows contain filename/type/size/URL; inspected workflow attachment listing counts provider results rather than proving durable byte ownership. **Why:** removing a chip can leave original file, inline rendering, thumbnail, OCR or reusable URL accessible. **Severity:** high. **Likelihood:** high if current metadata model is mistaken for a full storage lifecycle. **Effect:** narrows claims and requires minimal source-aware file handling.

**Permanent fix:** treat the whole selected attachment as the unit, including its managed inline appearances and derivatives. Use private owner-authorized serving with no reusable provider/CDN URL to the browser for redaction-eligible files. Reuse the shared file/storage owner where sound; if no suitable protected gateway exists, its narrow implementation is a release prerequisite, not a falsely claimed reuse. Remove physical objects through Storage APIs; do not delete storage catalog metadata directly.

**Exact requirement:** “Removing an attachment denies new authorized downloads and previews at the source gate, replaces all owned appearances with a safe marker, and schedules disposal of the owned object and registered derivatives. The marker does not retain a sensitive filename. No public URL, reusable signed URL or stale derivative can bypass the current disposition. Completion separately records controlled active-object disposal and any bounded provider/backup retention; it never claims recall of copies already downloaded or delivered.”

**Proof:** pre-issued URL, inline image, transformed thumbnail, Range request, stale browser tab, interrupted download and object purge retry; verify the configured storage/CDN behavior. Bytes already emitted before containment are an already-authorized disclosure, not retroactively recallable. The gateway must re-authorize each new range/request; do not promise revocation of previously emitted bytes.

### F06 — Client caches and stale responses need a monotonic guard

**Concern:** material. Current query defaults do not supply immediate cross-tab correction; staleTime is not an expiry/authorization barrier. Current memory data has no source correction revision in the mapper. **Why:** old fetch completion, focus return or tenant switch can paint removed material again even after a new response. **Severity:** high for exposure; medium for stale UI confusion. **Likelihood:** medium. **Effect:** adds read/presentation proof, no second realtime framework.

**Permanent fix:** current source projection returns a content revision/disposition; existing invalidation channel evicts affected payloads and derived cards. Reject older in-flight responses for the same source; clear protected content on auth/tenant changes and revalidate before reveal after reconnect. Current server check remains security authority, not client subscription delivery.

**Exact requirement:** “A client that has observed a newer source correction must never accept an older payload. Correction invalidation covers current detail, combined history, CRM cards, search snippets and transient previews. Reconnect, permission changes and tenant switches requalify the data before display. Offline clients and previously downloaded copies cannot be remotely erased; reconnect must not republish their stale contents.”

**Proof:** A fetch started before redaction finishes after the correction response, old combined-history cache, same ID in another tenant, back navigation, two tabs, offline/reconnect and revoked access. This does not claim that current query keys alone prove an exploitable tenant leak; provider reset isolation still needs verification.

### F07 — Audit can recreate the secret or be erased with the conversation

**Concern:** material. Existing audit body/metadata permit arbitrary strings, generic staff mutation grants apply, and conversation deletion cascades audit. **Why:** “what we removed” text, before/after snapshots, selected filenames or low-entropy secret hashes would keep the very payload D16 promises to remove. Mutable audit defeats accountability. **Severity:** high. **Likelihood:** high if generic audit helper is used naively. **Effect:** changes the audit payload and protection requirements.

**Permanent fix:** narrowly typed content-free correction evidence, immutable successful operation receipt and current outcome. Do not store selected plaintext, a reversible encrypted original for Undo, or a searchable secret fingerprint. Keep permitted actor/time/original ID/reason code and disposal evidence; retention remains owner governed rather than “forever by default.”

**Exact requirement:** “Correction history records who performed the authorized operation, when, original message/file identity, safe reason, source revision and disposal outcome, without removed text, filenames, before-images or reusable secret hashes. This history cannot be rewritten by routine staff mutations or incidentally cascade-deleted by conversation operations. Any lawful audit deletion/anonymization uses its own retention owner.”

**Proof:** secrets absent from audit, logs, exception messages, traces, job arguments, event payloads and exported correction records; duplicate operation one receipt; operation failure not recorded as success; later content redaction cannot erase its protected actor attribution.

### F08 — CRM integration must reference current content, not copy it

**Concern:** material. A second CRM note/history copy could preserve removed details or be silently edited beyond Support authority. **Why:** Support inclusion on a Party timeline does not grant CRM mutation permission or imply a separate authoritative content store. **Severity:** high. **Likelihood:** medium in cross-surface implementation. **Evidence:** platform ADR-0001, D9/D10 source-aware projection and current-owner retention clauses. **Effect:** narrows correction fan-out to real source-derived representations.

**Permanent fix:** D9's qualified Support row/communication reference resolves current sanitized source. Related-only links and actual P6 facts remain according to their owners. Independently authored CRM notes or required official artifacts are separate owner records; an exact source citation can become unavailable without modifying those owners' business facts.

**Exact requirement:** “A Support redaction updates the current authorized Support representation everywhere it is projected, including CRM Communications and source-linked previews. It neither merges nor edits Party identity, relationships, recipient authority, CRM owner, gifts, receipts, recurring gifts or financial evidence. P6 actual communication facts remain body-free and truthful. Independent CRM/care/giving content requires its owning domain's authorized correction; the UI does not imply it was erased by this command.”

**Proof:** authorized Support-only staff remove a private sentence without gaining CRM access; a CRM viewer sees current sanitized representation or permitted tombstone; unrelated CRM note and official receipt do not change; retained official master is distinguished from disposed Support upload/copy.

### F09 — Merge Undo and related-conversation controls must never revive content

**Concern:** material. A snapshot-based merge Undo or copied related note could restore redacted data. **Why:** D10 was ratified on original ownership and current-state Undo; redaction is not topology. **Severity:** high. **Likelihood:** medium. **Effect:** reinforces D10/D12 rather than replacing them.

**Permanent fix and exact requirement:** “Redaction binds the original source, not the currently combined root. Merge, Undo merge, moving, linking, unlinking, following or restoring a projection cannot restore disposed content, create a new readable payload authority or transfer correction capability. An ended correction cannot be undone. Independently repeated text in another original message is not silently erased by one occurrence selection; exact managed copies are corrected, and additional independent occurrences require separately reviewed scope.”

**Proof:** redact B while merged B→A, undo and remerge; B remains redacted in Support/CRM and old deep links. A's unrelated body remains. Separate quoted message remains unless included in reviewed scope; no false global-erasure success.

### F10 — Selective mapping needs precision without implementing a document editor

**Concern:** material. DOM offsets or substring matching can select the wrong repeated occurrence, split Unicode, preserve hidden hyperlink destinations or over-remove an entire message silently. **Why:** permanent harm and privacy exposure are both possible. **Severity:** high. **Likelihood:** high for a simplistic substring implementation. **Effect:** narrows A's eligible selective body representation; whole-body/file fallback is necessary.

**Permanent fix:** current, server-issued content revision plus exact supported selection descriptor; map selections to canonical sanitized document structure, handle Unicode grapheme and normalization, reject stale/ambiguous input and offer explicit larger fallback. Bound request size/selected ranges by existing admitted-content limits; choose concrete limits from production-shaped test evidence during implementation instead of inventing arbitrary product caps now.

**Exact requirement:** “Selection is evaluated against the exact reviewed current representation, never against a fresh best-guess string match. All selected occurrences are explicit. The server either produces the shown sanitized result or rejects with a refresh/review action. Unsupported document structures use a clearly reviewed whole-body removal; attachment removal is whole-file, not PDF/image pixel editing. Hidden attributes associated with removed content are removed too.”

**Proof:** identical repeated strings, emoji sequences, combining marks, bidirectional text, international names, HTML entities, text split over nodes, links whose visible label differs from destination, malformed input and changed revision between preview and confirm. No removed text persists in the selection receipt.

### F11 — Active safety and physical disposal are different completion facts

**Concern:** material. Database commit followed by failed object/provider/cache cleanup can either leak content or report premature erasure. Backups and failed job replay can restore it later. **Why:** trust and accurate compliance evidence require a real boundary. **Severity:** high. **Likelihood:** medium under normal partial failures. **Effect:** adds a narrow durable disposition with owner cleanup work; not a general workflow/DSAR platform.

**Permanent fix:** in one authoritative transaction commit sanitized source/restriction revision, protected receipt and bounded identifier-only cleanup intent. Current read/send/rehydration gates immediately reject the invalid revision. Worker performs idempotent owner-specific disposal, recording known completed/pending/failed outcomes. Backup restore loads current erasure/restriction ledger before making payload readable; no destructive rollback to old code after correction data exists.

**Exact requirement:** “The UI may report that selected content is removed from active Support use only after the authoritative source barrier commits. It reports remaining controlled disposal work honestly. Cleanup failure never reopens the source. Replay and restore reapply the current correction ledger before reads, exports or sends; restored old bytes remain unavailable until sanitized or disposed. A failure or timeout returns the durable operation identity for reconciliation rather than offering an unsafe repeat or Undo.”

**Proof:** write commits then response lost, object deletion fails, provider deletion cannot be confirmed, worker crashes between delete and receipt, old backup restored, old deployment attempts write; current active reads remain safe and replay completes without duplicate evidence or resurrection.

### F12 — Keep the solution bounded to actual owners and surface needs

**Concern:** material overengineering risk, not a need for new generic platform. A universal graph scanner, crypto-shredding framework, content-inspection AI, PDF editor, per-message legal decision engine or new CRM synchronization layer would enlarge cost and failure surface without evidence. **Severity:** medium. **Likelihood:** high if “all copies” is interpreted as every semantically similar record everywhere. **Effect:** narrows scope.

**Permanent fix and exact requirement:** “D16 includes supported message text selection, whole-message fallback, whole-attachment removal, a reviewed correction command and the enumerated source-owned representation/disposal obligations needed to make those actions truthful. It introduces no bulk global erasure search, automatic sensitive-data classifier, new CRM, generalized workflow platform or universal legal-hold product. Existing lawful retention/hold owners remain prerequisites where applicable; unsupported ownership is a contained, visible exception, not guessed deletion.”

**Proof:** implementation trace lists each actual persisted representation, owner and correction effect; no unspecified catch-all polymorphic target, unbounded tenant-wide text scan or cross-domain delete capability. Review total payload/attachment and representation fan-out using production-shaped sizes before enabling selected supported formats.

## Database contract summary

The permanent design should require, without freezing speculative table names:

1. Tenant-aware source identity and managed-representation FK/cardinality, immutable original identity, current monotonic content revision and explicit disposition.
2. Permanent unique operation identity per tenant, immutable command semantics/current-version comparison, server actor and timestamps, typed safe reason and result. No secret replay payload in the operation ledger.
3. One atomic source-content/barrier/audit/cleanup-intent mutation; per-artifact disposal status belongs to the appropriate owner and is idempotent. Destruction is not rolled back because a secondary notification fails.
4. Browser DML denied for published content/control/audit except expressly qualified narrow commands; effective grants and all permissive policies examined, not merely one new RLS predicate. Security-definer functions have fixed search_path, narrowly granted EXECUTE and re-prove current tenant/capability/source authority; direct privileged job paths do likewise.
5. No incidental cascade from conversation/Party/merge operations into required source correction evidence. Owner-authorized retention can anonymize/delete permitted evidence deliberately.
6. Indexed lookups by tenant/source/revision and pending cleanup disposition; bounded incremental workers; no full-tenant scans per redaction and no lock held during provider calls. Actual performance is unproved; no invented throughput guarantee.

## Minimal integration map

| Fact or payload                                                    | Authoritative owner                                   | D16 effect                                                                                                                 |
| ------------------------------------------------------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Original Support message/current sanitized body                    | Support                                               | Reviewed selection; current revision and safe marker                                                                       |
| Raw received provider evidence / inbound staging body              | Existing inbound/P6 provider owner                    | Correct/dispose same-source retained payload; preserve minimal route/delivery evidence; fence rehydration                  |
| Support attachment / managed previews                              | Shared file/storage owner under Support source policy | Deny active retrieval; dispose selected owned file and registered derivatives                                              |
| Actual communication happened / outcome                            | P6                                                    | Preserve permitted body-free history; no replacement communication, resolution or delivered claim                          |
| Prepared unsent material / recent sent copy                        | P17/P6 contract                                       | Invalidate unsafe unstarted material through owner; source guard at final dispatch; actual in-flight send remains truthful |
| CRM Party facts, care facts, giving records and official artifacts | Their existing domain                                 | No direct mutation; source-derived Support projection resolves sanitized current source                                    |
| Related/merged/followed relationships                              | Support D9/D10/D12/D15                                | Preserve relationship semantics; never restore removed source or create alert storm                                        |
| Logs/backups/export artifacts                                      | Their infrastructure/owner policy                     | No raw removed payload in new evidence; current correction barrier/expiry on replay and restore; bounded disposal proof    |

## Proposed proof and operational priorities

Before recording final corrected D16 language: resolve exact source scope, correction capability, honest completion text, current rendering selection semantics and owner-retention interaction. Before implementation activation: prove representation inventory, source/dispatch/retrieval fences, effective DB grants and RLS, file download barrier, disposal retries, audit minimization, CRM projection and D10 Undo continuity, stale client handling and restore/mixed-version gates.

No discovered material security/data-integrity defect should be merely monitored. After safety gates pass, useful signals are: any post-barrier permitted read of an older corrected source (threshold 1; platform/security owner disables affected reveal path and investigates); any cleanup item past its owner-approved disposal deadline (threshold 1; retention/storage owner retries/reconciles and escalates by policy); any old writer rejected for a superseded source revision (threshold 1 unexpected after rollout; Support/API owner identifies and disables obsolete writer); any body/secret in correction audit or worker payload (threshold 1; security owner restricts log access and applies owner correction). These are proposed operational obligations, not running monitors.

Unknowns deliberately retained as implementation proof gates: deployed RLS/grants, actual private attachment gateway and CDN configuration, provider purge capability/retention, actual backup policy and restore procedure, supported renderer document mapping, all production body copies and historical migrations. No universal US-law or nonprofit-retention conclusion is made by this technical review.

## Additional verification: attachment serving and actual-source helper probe

A targeted repository search of `packages/api/src` and `apps/admin/app/api` for download, signed-URL and Content-Disposition handlers found receipt/statement/report downloads and an Eve replay-artifact signed URL helper; it did not establish an existing protected Support attachment streaming gateway. [The Eve helper](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/eve/retention/control.ts#L157), lines 157–178, qualifies an Eve artifact then returns a 60-second signed URL. That is a different owner and is not proof of the revocable Support serving contract needed here. The Support timeline inspected displays attachment metadata chips, not a proved byte download path. F05's gateway is consequently a **required qualified capability**, with narrow implementation if reuse cannot satisfy the contract; it must not be described as already shipped.

**Additional exact rollout requirement:** “Before enabling D16 permanence/containment claims for legacy attachments, inventory issued public/provider/signed URL paths, remove or relocate the affected old active objects through the storage owner, verify cache invalidation under the deployed CDN policy, and fence old URL issuance. A new gateway does not revoke URLs previously issued for the old object. During any verified residual availability interval, report removal as still processing rather than claiming that controlled copies are already inaccessible. Prior downloaded/email/browser copies remain outside recall.” This is bounded activation work, not a need for recurring per-user key rotation or a new CDN.

Executed `work/d16-data-source-probe.ts` with `bun --no-env-file` from the verified repository directory. It directly imports the current shared helper module and its pure link-policy dependency; neither imports environment/runtime bootstrapping. Output `work/d16-data-source-probe.json` contains source hashes, three passing observations and limitations:

1. `parseContent` preserves an HTML string containing a synthetic value in `href`; `extractPlainText` omits that attribute from extracted visible text.
2. HTML `&amp;` remains encoded in the helper's plain-text result.
3. TipTap paragraph strings concatenate without block separators.

These are current helper behavior observations, **not tests of the proposed redaction implementation, a browser rendering proof or a discovered XSS vulnerability**. They falsify the assumption that the existing shared plain-text helper alone already provides the exact canonical selection mapping required by D16. Source: [helpers.ts lines 41–83](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/ui/components/shadcn/rich-text-editor/helpers.ts#L41). No application service, environment file, DB or provider was read or called by the probe.
