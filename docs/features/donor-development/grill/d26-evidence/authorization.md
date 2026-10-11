# D26 — Shared partnership history: authorization, privacy and autonomy

Research-only review of selected A and the founder's missionary-autonomy qualification. **Recommend Accept A with an explicit, narrow P9/P27/P28 owner reconciliation.** New eligible partnership updates may have a clear shared audience without requiring staff status, compulsory logging or supervisory approval. Sharing is neither a permission grant nor permission to expose older private content. This appendix proposes no general ACL/team engine, personal-notebook product or additional per-update approval ceremony.

## Evidence and limits

Reviewed Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3` and primary PostgreSQL/Supabase documentation on 2026-10-10 UTC. Grades describe consequences and plausible implementation mistakes, not confirmed deployed vulnerabilities. No live grants, credentials, policies, data or deployment were inspected.

- [Q26:33–77](../phase27-q26-shared-partnership-updates.md:33) defines new eligible routine context, current authorization, a visible audience and separate private content. It was originally prepared before the founder's answer and now records the selected A and completed review. [Q26:81–96](../phase27-q26-shared-partnership-updates.md:81) explicitly identifies the unresolved owner conflict and limits the current-code evidence.
- [P9:898–911](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:898) excludes Party notes/activity from missionary projections. [D2:774–797](../phase27-d2-adversarial-review.md:774) preserved that exclusion and proposed, but did not ratify, a narrowly qualified development-interaction exception. [Owner constraints:129](../../../../prds/program-roadmap/owner-constraints.md:129) requires a permission-scoped interaction log; it does not authorize one universally readable payload.
- [P3:273,284–291,308](../../../../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md:273), [P10:100–104](../../../../prds/sitestacker-parity/phase-10-sensitive-data-safety.md:100), [P12:1619–1646](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619) and [P12:2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) govern classification, current source/field/history authority, sensitive identities, every egress and independent grants. These are governing intent, not proof of delivery.
- **Current native notes:** [migration:5–26,39–79](../../../../../supabase/migrations/20260818000000_crm_notes.sql:5) creates Tenant-keyed, append-only `standard`/`restricted` notes; enables/forces RLS, grants authenticated/service-role SELECT/INSERT and uses staff-membership/role policies. [Service:190–243](../../../../../packages/api/src/admin/crm/notes/service.ts:190) returns a Tenant/idempotency-key match or inserts note body, linked text and server-provided author. This is not an exact partnership/audience/history contract; `standard` is not missionary visibility.
- **Current missionary activity:** [donor mutation:120–145](../../../../../packages/api/src/missionary-portal/donor.ts:120) checks [Tenant+donor+missionary profile:278–292](../../../../../packages/api/src/missionary-portal/service.ts:278), then writes `donor_activities`. That command does not explicitly bind a D26 audience, partnership projection or recording actor. [Donor read:388–430](../../../../../packages/api/src/missionary-portal/donors.ts:388) removes notes/activity for anonymous donors but returns them for the nonanonymous slice. Existing role/profile checks are not proof of the current P12 contract. No delivered D26 shared-history path was established by these bounded reads.

## A26-01 — Resolve the blanket exclusion without opening general CRM notes

**Critical; likely if shared is implemented as a visibility rename.** Neither `standard` nor an interaction-looking title can override P9. The material product amendment is the exact qualified exception; remaining safeguards below inherit existing owners.

**Proposed owner clause:** “P9's exclusion of general Party notes/activity from Missionary Workspace remains. P27/P28 may expose a separately registered, source-owned development-interaction projection of newly authored, sharing-eligible partnership context to its currently authorized staff and missionary readers. The contract defines the exact source, permitted fields, audience, actions and history scope through P3/P10/P12. It references the same encounter without exposing general CRM timelines, existing private/imported history, restricted finance, care, Support-private content or any independently denied source. A source reference or derived summary cannot widen its source. Without that qualification and current grant, no shared projection is available.”

Apply existing P3 policy-widening governance when qualifying the projection. Do not turn an ordinary authorized update under that policy into a new maker-checker event. Distinct purpose-specific bodies may reference the same encounter; do not require duplicate call records or a universal encounter service.

**Acceptance:** new eligible shared update versus identically titled old CRM note, private note, imported activity and Support-private entry. The latter remain absent from shared bodies, snippets, counts and search. Classification absence/unknown value fails closed, including mapper defaults; [current note mapping:23–49](../../../../../packages/api/src/admin/crm/notes/model.ts:23) is not a suitable shared-classification rule.

## A26-02 — Missionary autonomy and current authority are compatible

**High; plausible.** A shared view can become de facto surveillance if staff status, logging quotas or managerial sign-off are made prerequisites. Conversely, treating voluntary contribution as unrestricted access would breach P12.

**Clause:** “D26 introduces no compulsory missionary interaction reporting, staff-role requirement, supervisory approval or automatic staff visibility into everything a missionary records. An authorized missionary may voluntarily contribute eligible partnership context through the shared composer. Staff and missionary contributions remain subject to the same applicable source, privacy and security floors. Exact current acting context determines authority; combining a person's staff and missionary hats, household/team membership or responsibility assignment grants nothing.”

This does not decide employment policy or waive separately governing source obligations. [ADR0136:102–124](../../../../adr/0136-organization-owned-ministry-assignments-and-separated-support-access.md:102) separates supporter access and responsibility, requires individual accounts and preserves attribution on revocation. No new “collaborator” role or blanket church/ministry access is implied.

**Acceptance:** permitted missionary contributor without staff role; staff without access to that ministry; one person switching active assignments; spouse/team lead without a grant. No forced staff conversion, union of hats or shared credentials.

## A26-03 — A clear audience is not a fixed roster or a retrospective grant

**Critical; plausible during reassignment.** A name preview can misleadingly promise that only today's people will ever read an entry. New responsibility can also be mistaken for permission to read every previous note.

**Clause:** “Before saving, identify the exact partnership and the governed shared audience in plain language. Names, when shown, are a current authorized preview, not an immutable recipient roster. Every later reader must independently satisfy the current source/field/history grant. Joining, replacing an owner, leaving, merging a Party or switching roles does not itself grant historical access or reclassify private content. Unavailable or indeterminate audience authority never falls back to a wider audience.”

Do not invent a universal prospective-only history cutoff either: qualified history scope decides which eligible past shared entries a newly authorized reader may read. A material change to the selected source/audience contract during composition must not silently broaden the saved intent; revalidate and obtain an intelligible new selection when necessary. Routine membership changes within the already disclosed governed audience do not require reconfirming every contributor's old entry.

**Acceptance:** new collaborator with narrow versus broader expressly authorized history; revoked former lead; old deep link; Party merge; audience contract changed before submit; context changed while a save is pending. Return only the result currently authorized for the caller, even when the write was previously accepted.

## A26-04 — Sensitive subjects and private context do not become routine by association

**Critical; plausible.** A prayer request may contain care facts, a hosting note an endangered worker's location, or an introduction a protected third party. Readable partnership identity does not make all related content readable.

**Clause:** “Classify the actual source and fields, including third-party identity, anonymity, alias and location precision. Apply protected-person and purpose floors before query results or aggregates. The shared interaction must not copy, summarize or infer independently denied care, Support-private, finance, private-note or restricted-identity content. Linking to a partnership, appeal or encounter, detaching a parent or changing an owner never declassifies it.”

[P12:1619–1623](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619) expressly governs strictest-parent sensitivity, protected existence and aliases. Do not promise automatic detection of sensitive prose; the source qualification must define eligible inputs and a safe place for excluded context. “Private” must truthfully describe its governed audience, not promise author-only secrecy for every note type. Sharing existing private content requires the independently authorized disclosure/reclassification action; D26 does not authorize it through ordinary editing.

**Acceptance:** protected worker alias versus legal identity; precise hosting location; anonymous supporter; care-bearing prayer request; two differently classified bodies referring to one encounter. Shared history cannot reveal the excluded body through a badge, hidden-entry count or last-contact score.

## A26-05 — Attribution survives handoff; correction does not create a permanent plaintext archive

**High; plausible.** Recording on someone's behalf, departed authors and corrections can conflate author, participant and current owner.

**Clause:** “Bind the recording principal and applicable authorization context on the server. Keep factual participants, reported occurrence time, recording time and current responsibility distinct. A selected participant or owner cannot impersonate the recorder. Reassignment never transfers authorship. Corrections preserve the qualified source's provenance while current disclosure and lawful retention govern historical content and displayed identities.”

Preserve structural attribution as permitted without requiring a departed person's legal name everywhere; render an authorized name/alias or unavailable identity. Corrected sensitive text must not remain readable merely because it is an old revision or audit payload. Source-owned retention/erasure, classification and lawful holds still apply. [P10:104](../../../../prds/sitestacker-parity/phase-10-sensitive-data-safety.md:104) requires scrubbing controlled copies while acknowledging that already delivered exports/emails cannot be recalled. History does not mean retain every plaintext body forever.

**Acceptance:** forged author; retrospective encounter; on-behalf recording; author departure; alias change; correction removing precise location; erasure with allowed structural evidence. No attribution transfer, newly exposed revision or false claim that past external copies were recalled.

## A26-06 — Logs, tasks, AI and caches are additional readers

**Critical; likely if adjacent note infrastructure is reused unchanged.** [Native note service:256–268](../../../../../packages/api/src/admin/crm/notes/service.ts:256) copies body/title into command logging. [Logger:46–85](../../../../../packages/api/src/crm/commands/log.ts:46) scrubs credential-like keys, not prose, location or third-party names. This is a concrete reuse incompatibility, not evidence of a deployed D26 leak.

**Clause:** “Use minimized, classified source references and permitted outcome metadata for logs and derived work. Every feed, task/notification preview, deep link, search, export, AI prompt/summary, cache and history read must project under its actual current reader and purpose. Hidden content must not influence visible counts, scores or briefs. Membership, creator identity or a notification preference never substitutes for source access.”

[ADR0183:57–69](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:57) and [AI boundary:238–260](../../../../../openspec/specs/platform-boundaries/spec.md:238) supply these inherited limits. Sharing alone proves no meaningful contact, sends no supporter communication and completes no task. [Current note hook:143–154](../../../../../packages/database/hooks/admin-crm-notes.ts:143) keys by search/sort and retains previous data; D26 must qualify context/epoch isolation rather than assuming that pattern handles role switches. Suppress stale responses and clear inaccessible cached content after context/revocation changes.

**Acceptance:** private event plus shared summary/count; old notification after revocation; AI with only shared authority; query cache after hat/Tenant switch; note containing sensitive location passed to logging. No body in telemetry or unsupported broader preview.

## A26-07 — Protect both row states and every reachable command path

**Critical; plausible.** Source/audience reassignment can change an initially permitted row into a forbidden one; an idempotent retry can disclose a result no longer readable.

**Clause:** “Derive the principal and exact current context server-side; validate complete Tenant/source/Party/ministry references and applicable Legal Entity scope, author, permitted inputs, old record and proposed resulting state. Do not invent a Legal Entity owner for Tenant-wide Party identity. Bind a command receipt to its exact source, actor/context, action and intent; retry cannot repurpose it or confer read authority. Apply current authorization to normal, replay, repair, import and privileged paths, with the owner transaction enforcing its expected source/policy state and atomic required history.”

The implementation must define the commit ordering against concurrent revocation/reclassification: an accepted earlier action remains historical fact, while subsequent access is denied. A later stale callback never restores old permissions/content. Foreign-key/uniqueness or retry failures must not reveal hidden records or return their stored bodies; use the existing uniform denied/not-found contract, not raw constraint details.

[PostgreSQL 17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html) distinguishes old-row `USING` from proposed-row `WITH CHECK`; omitted `WITH CHECK` for UPDATE/ALL inherits `USING`. Omission alone is not a vulnerability. [PostgreSQL row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) documents permissive-policy OR, restrictive AND, owner/FORCE and BYPASSRLS distinctions, independent grants, referential-integrity oracles and cross-table policy races. [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security) likewise requires inspecting actual roles and effective policies. A view/definer is not automatically a bypass in every configuration.

P12/ADR0136 require the qualified source's raw browser grants revoked, coarse forced Tenant RLS, safe private functions/views and application authorization for service paths. The adjacent notes migration's authenticated grants cannot establish compliance. Before release, test actual grants, effective policies, functions/views, Data API and service paths—not an owner-only SQL fixture.

**Acceptance:** allowed old row→forbidden Tenant/source/audience; owner/actor spoof; mixed permitted/forbidden fields; concurrent revocation; same-intent and mismatched-intent retries; replay after access loss; hidden-reference conflict. Denied commands leave no partial source/history/notification effect.

## A26-08 — Restore must preserve current exclusion, not revive old sharing

**High; plausible during recovery.** An older backup or reindex may contain private plaintext, expired grants or superseded classifications.

**Clause:** “Before restored sources, indexes, queues or caches serve users or dispatch work, reconcile current authorization, source qualification, classification, retention/disposal and consumed-effect fences. Hold affected paths unavailable if those fences cannot be recovered. Restore never turns old private/imported content into eligible shared history or replays a notification under an old recipient grant.”

This inherits [D7:240–255](../phase27-d7-adversarial-review.md:240) and current P12; it does not require a new recovery platform. Prove restore after revocation, private-note disposal, alias/location restriction and an already delivered notification. A backup integrity check alone is insufficient.

**Validation limit:** document and source review only. These acceptance cases are release gates for the eventual qualified source; no production D26 authorization, concurrency, privacy or restore behavior is certified here.
