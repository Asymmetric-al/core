# D37 — Evidence register and verification limits

**Current ratification — 14 September 2026:** The founder has fully ratified D37 A and all amendments, additions, adjustments, changes, updates and final corrections. D1–D37 and all amendments are fully ratified. The [complete ratification](phase26-d37-full-ratification.md) incorporates this record in full, including all supporting prose. Earlier proposed/pending/intent-only and no-Q38 wording below is historical and creates no repeat approval gate. Evidence and unexecuted runtime-proof limits remain unchanged.

Research date **14 September 2026**. This register distinguishes accepted Core intent, actual source/library behavior, current primary documentation, product judgments and unexecuted runtime proof. The founder selected A; detailed D37 amendments remain proposed. D1–D36 remain fully ratified.

## Current repository and governing decisions

Verified WSL directory `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`, local HEAD and remote develop `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Fresh read-only PR checks returned1335/1336/1340/1558/1564 OPEN at their previously recorded exact heads; the [current source manifest](phase26-d37-source-evidence.json) captures them alongside source hashes and line bounds. No branch/PR/commit/provider/database state was changed.

Read root AGENTS, OpenSpec index and relevant frontend/backend/accessibility/testing instructions; canonical grill-with-docs/grilling/domain-modeling and Tiptap guidance; actual UI configuration; platform CRM/data boundaries and canonical-message/preparation ADRs. The independent data reviewer additionally read API/auth/Supabase scoped instructions and actual schema/grants/reads. The Tiptap reviewer refreshed existing reference repositories and inspected the installed dependency closure. Explicit user Tiptap skill and canonical repository overlays were reconciled without upgrading packages.

[Data contract](phase26-d37-data-contract.md) contains14source/authority pins and C01–C14; [Tiptap contract](phase26-d37-tiptap-contract.md) contains T01–T14 and exact source/version references. Key evidence:

- **ADR0001:** Asym PostgreSQL owns CRM truth; no Twenty/provider synchronization or shadow identity is introduced.
- **ADR0030/0032:** one canonical structured message/server compiler; complete immutable preparation and exact submission recovery. A browser editor value is not delivery authority.
- **D2/D4/D23/D24:** exact private draft restoration, audience/target/provenance, staged work, schema and normal Send admission. The new view does not reopen those decisions.
- **D10:** original message source affinity survives merges. The immutable private draft origin/slot and current selected reply source are separate; a B-targeted reply remains B-affine even if writing began in merged A.
- **D16/D17/D36:** current source restrictions and retained dependencies apply; draft edits do not renew native content retention; independently authored/received evidence and possibly sent material keep their own owners.
- **D20/D22:** saved views store criteria, private draft bodies are not ordinary search/index sources. The final finder uses title search plus a separate inbox filter, not a private content corpus.
- **D35:** posted-note editing is local working state. My drafts does not invent persistent note-edit snapshots or coauthor access.

Accepted local grill files are uncommitted decision sources, not falsely represented as Git HEAD content. Active OpenSpec proposals describe planned direction without proving it shipped. No formal D37 OpenSpec/PRD, issues or runtime implementation is created in this turn.

## Current source findings

The current save path serializes Reply and calls sendReply(mode:draft), then resets local editor state. Conversation changes also reset Reply/Note fields. The adapter inserts a fresh outbound support_messages row with isPrivate:false and caller-selected author, and inserts attachments separately. Broad authenticated staff message grants/reads do not provide private draft ownership. These are scoped source facts, not a claim that every row is actually exposed in an uninspected production deployment.

Support conversation/message/agent identities are TEXT while tenant/profile/auth/membership endpoints are UUID. Agent lookup can guess by email; profile-tenant versus JWT current-tenant derivation must be reconciled through the existing shared acting-scope contract. A private view must not paper over these identity/authorization differences with a frontend filter.

The shared editor already uses SSR-safe initialization and suppresses update emission on programmatic content restoration. It still needs the draft owner's current-version guards before replacement. Current Ctrl/Cmd+Enter handling lacks the needed composition/defaultPrevented protection. These source gaps affect a complete save/resume journey and are implementation prerequisites, not proof that a new UI alone is sufficient.

## Actual installed-library observations

[Tiptap source evidence](phase26-d37-tiptap-source-evidence.json) records installed core/react3.22.3, manifest ^3.22.3, mixed3.23.1 lock peers and read-only npm latest core3.31.3. The refreshed reference main package says3.30.3, demonstrating that repository main, installed code and registry release are different evidence. No automatic latest upgrade follows. The shared dependency closure must be aligned and qualified during implementation.

The [eight-case installed-library probe](phase26-d37-tiptap-probe.json) uses synthetic JSDOM/Tiptap3.22.3 data:

1. Selection alone emits no content update.
2. Default setContent emits an update.
3. Explicit emitUpdate:false suppresses that event but still replaces the document.
4. It therefore does not protect unsaved content from a stale replacement.
5. setEditable can emit an update without changing the document.
6. Strict schema handling can normalize away unknown attributes.
7. Unknown nodes can be rejected by strict checking.
8. A contentError listener alone can still allow stripped initialization.

All eight observations passed. They justify semantic dirty checks, current-generation hydration gates and pre-parser canonical validation. They are primitive counterexamples/characterizations, not real browser/IME, application save, RLS, provider or D37 end-to-end proof. The32actual release groups remain unexecuted.

## Primary technical documentation

| Source                                                                                                                                                                                                                                                                                                                                                 | Supported mechanism and limited application                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Tiptap persistence](https://tiptap.dev/docs/editor/core-concepts/persistence),3.x, accessed14Sep2026                                                                                                                                                                                                                                                  | Structured JSON can persist an editor document. The app still owns transactions, actor/privacy, source dependencies and save acknowledgment; basic examples do not supply those contracts.                                                                               |
| [Tiptap performance](https://tiptap.dev/docs/guides/performance),3.x, accessed14Sep2026                                                                                                                                                                                                                                                                | Isolate the editor and use narrow state subscriptions. Do not mount an editor for every list row or rerender typing because the sidebar refreshed. Descriptive claims about defaults must be checked against installed code.                                             |
| [Tiptap setContent](https://tiptap.dev/docs/editor/api/commands/content/set-content) and [schema](https://tiptap.dev/docs/editor/core-concepts/schema),3.x                                                                                                                                                                                             | Replacement/update options and schema behavior support the integration plan; successful parsing/update suppression is not concurrency or data-integrity proof.                                                                                                           |
| [Tiptap Next.js](https://tiptap.dev/docs/editor/getting-started/install/nextjs),3.x                                                                                                                                                                                                                                                                    | SSR integration supplies editor initialization guidance; Core's existing immediatelyRender:false is preserved.                                                                                                                                                           |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [column privileges](https://supabase.com/docs/guides/database/postgres/column-level-security), [functions](https://supabase.com/docs/guides/database/functions), [Storage](https://supabase.com/docs/guides/storage/security/access-control), accessed14Sep2026 | Grants and effective row/column/function/storage policies are separate. Missing explicit WITH CHECK may inherit USING; actual predicates and old permissive paths, not syntax alone, determine safety. Privileged roles require explicit equivalent owner/source checks. |
| [Supabase changelog](https://supabase.com/changelog), accessed14Sep2026                                                                                                                                                                                                                                                                                | Current exposure/grant and schema/version changes justify version-aware qualification; D37 adds no custom Realtime schema objects or provider dependency.                                                                                                                |
| [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                                                                                                                                                                             | Save/error/result status needs accessible perception without routine focus interruption. Layout and authoring require actual keyboard/AT/reflow proof; an attractive static row is not conformance.                                                                      |

## Product research and interpretation

The [full current UX research](phase26-d37-ux-research.md) verifies and qualifies HubSpot, Missive, Help Scout, Front, Zoho Desk, Freshdesk, Zendesk and Intercom. Kustomer search snippets could not be fully verified and are not used as positive draft-finder evidence. No nonprofit-specific draft interaction is assumed from marketing or from an unrelated donor-management workflow.

The strongest direct comparison is [HubSpot's updated private Drafts view](https://knowledge.hubspot.com/help-desk/use-the-updated-reply-editor-in-help-desk), updated21August2026, beta for Service Hub Professional/Enterprise. It supports private interruption/return alongside CRM context. Asym does not adopt automatic recipient additions, contact-creation behavior or its unverified backend architecture.

[Help Scout's default folders](https://docs.helpscout.com/article/1429-about-default-folder-views-in-help-scout) exclude Closed drafts and use an Active-conversation badge count; Asym deliberately keeps eligible drafts independent of work status and starts without a badge. [Missive's filters](https://missiveapp.com/docs/core-features/search-and-filter) are the strongest smaller navigation alternative. [Front's shared draft model](https://help.front.com/en/articles/2216) has different collaboration assumptions; its automatic sharing is rejected for Asym's accepted private drafts.

Zoho's documented two-minute save and Freshdesk's roughly30second save/24hour disposal are vendor behaviors, not adopted policy. Asym's750msquiet/5secondeligible-attempt targets,20default/50maximum list pages, no-count entry and one Discard confirmation are explicit proposed product/engineering judgments. The targets do not promise network persistence, a new retention period or a measured productivity gain.

One qualified Intercom community side-conversation report illustrates interruption-loss friction; the research clearly distinguishes that from ordinary Inbox behavior and population evidence. No controlled Asym staff study was run. Attempts to inspect official images through Chrome failed because browser request-header policy could not load. No pixel inspection, authenticated vendor walkthrough or rendered Asym UI is claimed. These limits do not prevent a finished researched design; actual visual/AT/task qualification remains mandatory before activation.

## Evidence finish line

The decision contains28clauses, explicit23-category findings and a permanent dependency-ordered path. [Proof/operations](phase26-d37-proof-and-operations.md) defines32actual release groups and five monitored controls with named signals/thresholds/owner roles/responses. [Final validation](phase26-d37-validation.json) records only executed source/document preservation, consistency, IDs, links and mirrors. Independent reviews record their actual-file closure separately. The accepted A is recorded; no detailed amendment is silently ratified, and no Q38 is opened.

## Full founder ratification — 14 September 2026

This entire record is accepted as part of [D37 full ratification](phase26-d37-full-ratification.md), reconciled by final D37-R01–R28 and F01–F06. All 23 category outcomes, C01–C14, T01–T14, P01–P32, O01–O05, full journeys, source/authorization/data/editor/CRM/Email Studio seams, limits and qualification obligations are incorporated. The 32 runtime groups remain required and unexecuted; prior source/library/document checks remain limited evidence. Q38 is a separate prospective decision and is not answered here.
