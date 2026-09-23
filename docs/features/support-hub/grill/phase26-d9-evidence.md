# Phase 26 D9 — Evidence, contradictions and proof limits

11 September 2026, Asia/Bangkok. Supports the [full D9 review](phase26-d9-adversarial-review.md) and [CRM/Support UX blueprint](phase26-d9-crm-ux-blueprint.md). Founder selected C; the complete amendment package is fully founder-ratified, 11 September 2026, including every adopted amendment, addition, adjustment, change and update. D1–D8 are fully ratified and unchanged. This evidence does not establish production readiness or authorize implementation/publication.

## Evidence method and current baseline

Read current source, relevant migrations, owner PRDs, governing ADR/OpenSpec and D1–D8 before choosing a CRM presentation. Three independent reviews challenged database/owner boundaries, lifecycle/concurrency, and vendor/CRM UX. Actual pure-source execution tested two current CRM assumptions. Product decisions and future acceptance tests are explicitly distinguished from execution results.

Refreshed live source and PR state before D9 product research: worktree HEAD and develop both `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; PR1335 open at `e1c86e1a30f479363960eeb35500112665e16bb3`; PR1336 open at `3b2827ffcf184bf767664018efedda317c7da03c`; PR1564 open at `0624ca3841ea98e618fed0e2c490d24c0ef1d9c1`. An open planning PR is not merged runtime behavior. No branch, PR, provider or credential was changed.

Repository links below pin that exact HEAD. Paths/line anchors are evidence locations, not claims that every intended owner foundation is implemented. Governing founder direction outranks contradictory stale text; current code identifies compatibility and implementation work, not permission to preserve a weak design.

## Repository evidence register

### S01 — Ratified session and Party meaning

D1 already requires ordinary email service without a CRM link, observed sender endpoints, qualified explicit owner references, no auto-created Party or email-as-authority, canonical Support payloads and shared communication dedupe. D2/D4 separate audience/preparation from context; D3–D8 own work and assignment. D9 cannot silently reopen these decisions.

Core's Party is a person, household or organization, with owner-defined subtypes and stored versus derived relationships. A missionary/donor profile or authenticated staff user is not an alternative canonical customer table. [Core vocabulary](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/CONTEXT.md#L720), [D1 review](phase26-d1-adversarial-review.md), [D2 review](phase26-d2-adversarial-review.md), [D4 review](phase26-d4-adversarial-review.md), [D8 review](phase26-d8-adversarial-review.md).

**Consequence:** optional conversation relevance is a narrow separate fact. It grants no recipients, representation, consent, CRM relationships, staff ownership or owner-action authority.

### S02 — Phase 9 owner model, record shell, timeline and merges

The Phase 9 PRD defines Party relationships/provenance, merge/unmerge re-point and dedupe responsibilities, eight live record tabs, and a Communications capability socket. Its CRM staff-owner primary rule concerns staff ownership, not which Party a Support conversation is about. It requires shared full-page/drawer navigation and qualified search, a read-composed timeline rather than persisted `crm_record_timeline_items`, a common Party gate and one timeline SQL union with P6 Communication. Member-care remains structurally excluded. [Relationships and merge](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md#L315), [record shell](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md#L398), [shared UI and read-composed history](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md#L515), [B5–B9 contracts](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md#L595).

**Consequence:** Overview preview plus the existing Communications view, one canonical Support detail, and source-owned Activity. Link/remove evidence belongs to qualified association audit, not a new ordinary Activity marker. Register typed associations with owner merge/replay; do not reconstruct them from current email. Ordinary CRM CRUD/provider-log rules do not license provider command logs for this operation or reuse of the donation-specific idempotency header.

### S03 — Phase 6 source custody, recipient copies and immutable relations

Phase 6 keeps Support payloads in Support, supplies a shared emit seam with source-effect dedupe, and preserves recipient-copy event cardinality and typed references. Later privacy amendments constrain durable raw email/subject material. Approved intent/event relation sets are immutable; a mutable list of related Parties cannot be substituted into them. [A4–A6 source and relations](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md#L135), [privacy amendments](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md#L170), [immutable intent relations](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md#L223).

**Consequence:** actual Communication events may be grouped for display only with proven source lineage and preserved member outcomes. Add/Remove cannot emit an email event, copy raw thread material, change a prepared send or retarget historical correspondence. Attribution corrections need owner revision/provenance without replacement events or modified actual delivery evidence.

### S04 — Current purpose/resource authorization and owning boundaries

Phase 12's intended authorization uses current tenant, person, purpose and entity scope through one policy decision point. Read projections, search, counts and exports require the same policy; assignment or linking is not delegation. Platform boundaries keep business ownership and shared operational tasks with their actual domains. [P12 current authorization](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md#L168), [P12 egress/scope](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md#L214), [platform tenant boundary](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/platform-boundaries/spec.md#L223).

**Consequence:** both owners authorize context mutation and every projected item/field. Raw association/control/audit IDs are not browser-readable under merely tenant-wide RLS. Current NHI/service/RPC paths need explicit safe grants and policy, not a second coarse role implementation.

### S05 — Current Support links are weakly typed scaffolding

Collections expose older contact/donor/gift/contribution/missionary/person/church reference slots. The core migration stores `contact_ref` JSONB; the adapter casts it and currently creates inbound conversations with null context. Those are not a tenant-aware conversation→Party relation model. [Collection references](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/collections/support-hub.ts#L165), [conversation table](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L198), [raw mapping](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L452), [inbound creation](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L1421).

**Consequence:** use non-null canonical endpoints, tenant-aware foreign keys, active uniqueness and protected command/audit control; migrate only verified mappings. Do not extend JSON strings into a universal link store.

### S06 — Current list shape cannot prove complete reverse lookup

The Support adapter hydrates snapshots and uses an application request cap of 2,000. Checked-in local Supabase configuration has Data API `max_rows = 1000`; that is not verification of a deployed provider limit. Missing display hydration is not missing canonical ownership or association. [Snapshot reads](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L143), [application cap](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L689), [local cap](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/config.toml#L18).

**Consequence:** complete indexed qualified set queries, union/dedupe before pagination, stable cursors and production-shaped proof. Do not search the browser's loaded list for CRM conversations.

### S07 — Current sidecar links are not full cross-surface journeys

The contact sidecar renders existing reference fields; CRM link helpers form filter URLs and do not use all stored fields consistently. Current tests prove helper outputs, not Party access, actual destination selection or draft-preserving return. [Sidecar](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/ConversationContactSidecar.tsx#L18), [CRM links](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/ConversationCrmLinks.tsx#L29), [helper tests](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/tests/unit/apps/admin/features/support-hub/contact-sidecar.test.tsx#L5).

**Consequence:** require shared canonical routes/detail, current owner permission and an actual end-to-end return journey. A working URL string is insufficient proof.

### S08 — CRM today is donor-oriented; support means financial support

The current detail route has a coarse role gate; service reads donor gifts/activities in capped sets. Its timeline composes those items, while `support` means financial amounts and commitments rather than conversations. [Current route gate](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/crm/detail/index.ts#L22), [financial support helper](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/crm/detail/service.ts#L144), [capped data](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/crm/detail/service.ts#L244), [timeline composition](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/crm/detail/service.ts#L434).

**Consequence:** qualify Phase 9 Party/read contracts, add an explicitly named Support conversations projection, and retain financial meaning. Do not label current donor activities as the implemented P6 timeline.

### S09 — Audit/grants and CRM notes need actual boundary proof

The Support migration has tenant policies for mutations plus broad authenticated CRUD/service-role grants and legacy audit foreign-key/delete behavior. CRM notes use string linked-record references and coarse roles; their service inserts note and command log separately. These source facts are risks if copied into the new contract, not a demonstrated deployed exploit. [Support audit and RLS](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L476), [CRM notes migration](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260818000000_crm_notes.sql#L5), [note write path](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/crm/notes/service.ts#L175).

**Consequence:** context is not a copied CRM note. Protect actor/endpoints and old/new-row state, commit outcome/history/intent atomically, deny raw browser reads and test both authorized and forbidden transformations. No destructive cascade may erase required owner evidence.

### S10 — Two executed current-source observations

[The preserved result JSON](phase26-d9-source-probe.json) records source hashes and synthetic input/output. It executes current pure code under Bun with `--no-env-file`, not a self-authored D9 model.

1. `buildCrmGridRow` maps `lastTouchAt` directly from donor `updated_at`. Changing only that metadata timestamp changes the displayed metric from `2026-09-01T10:00:00.000Z` to `2026-09-11T09:00:00.000Z`, without any communication. It is not proof of actual contact. [Mapper](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/crm/model.ts#L41).
2. The exact extracted private financial support helper, supplied a synthetic 7,500-cent gift, returns giving totals by fund/missionary, commitment counts and last gift. It produces no Support Hub count or work status. The extraction checks excluded runtime/network/environment dependencies before evaluating it.

Full-file SHA256 values: model `f69658a2eeebfaa65411d9b29afe18631edec997942105420d4dc7f3ce60ec65`; detail service `488887537732e4383b9176e1034fdc53e6bd20f294cee97f1ab90e24595e6810`. Exact helper-block SHA256 `6bbd57121dd35c4b93d7b77ed775750636a49ac369f427d3203b57eb25498365`.

These are two source observations, not tests of production data, Auth, RLS, database constraints, migrations, provider delivery, P6 integration or actual staff usability. No environment values were loaded and no app/bootstrap/provider/network/DB operation was performed.

### S11 — Architecture conflict, legacy modules and implementation gates

Accepted ADR0001 assigns CRM truth to Asym Postgres and retires Twenty. `openspec/project.md` recognizes the governing retirement; stale `crm-core` paragraphs still describe Twenty/dedicated-datastore patterns. The older parallel `support_contacts` schema also contains shadow contact fields. Scoped searches of current migrations/API/database did not establish a deployed `communication_events`/relations implementation; absence in that inspected source scope is not a live database inventory. [Accepted ADR](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md#L3), [stale CRM spec](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/crm-core/spec.md#L5), [project ruling](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/project.md#L6), [legacy contacts](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260501001500_support_hub_foundation.sql#L3), [workflow product truth](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/workflow-orchestration/spec.md#L13).

**Resolution:** use the already-ratified shared Asym ownership. Record the contradiction now; correct formal OpenSpec during its later authorized stage. Do not reintroduce internal synchronization, preserve a shadow CRM, assume open PRs are runtime, or implement a second workflow platform. Shared durable dispatch carries identifiers; owner records remain truth.

## External evidence: pattern, tradeoff and Asym fit

Sources were checked 11 September 2026. Update dates below are publisher metadata when available; undated documents remain undated. Product availability/edition claims are limited to the applicable articles. No licensed vendor workspace or private architecture was tested.

### E01 — HubSpot: associations and actual email history are different

Service Hub Professional/Enterprise Help Desk documents associated records and association history. Its activity-association documentation distinguishes Help Desk/inbox email contacts from associations inherited by some other CRM email entry points. This variability is exactly why linking should not silently redistribute communication history. Record associations allow multiple records; primary-company behavior is a specific vendor concept, not a generic requirement for a Support Party. Documents: Help Desk updated 20 July 2026, activity associations 10 July 2026, record associations 16 July 2026. [Help Desk](https://knowledge.hubspot.com/help-desk/manage-tickets-in-help-desk), [activity associations](https://knowledge.hubspot.com/records/associate-activities-with-records), [record associations](https://knowledge.hubspot.com/records/associate-records).

**Adopt:** explicit links, provenance and useful record navigation. **Reject:** cross-entry-point activity inheritance or a hidden primary-company rule. Asym already owns shared Parties and source events; extra inherited history would corrupt its distinction between relevance and correspondence.

### E02 — Zendesk: related-record discovery has useful but bounded semantics

Relationship-field documentation describes related users/organizations and tickets; archived tickets are excluded from those lists. Its related-object article (4 June 2026) describes preview/context behavior that differs between standard and custom objects. Availability depends on the relevant feature/plan; this is not evidence that all editions share the same UI. [Relationship fields](https://support.zendesk.com/hc/en-us/articles/10689134053658-Understanding-relationship-fields), [related-object interaction](https://support.zendesk.com/hc/en-us/articles/6097369527322-Interacting-with-related-object-records-in-tickets).

**Adopt:** reversible navigation from related context. **Simplify/reject:** an arbitrary lookup-field product, enterprise customization and silent historical omission. Asym's All view follows its source retention/visibility, not a competitor's archived-ticket omission.

### E03 — Help Scout: changing customer is consequential, not a context edit

Change Customer documentation (1 August 2025) changes the conversation's customer/reply context, with broader profile-email reassociation behavior. Its merging documentation (18 June 2025) also describes discovering earlier conversations. These are distinct operations, not interchangeable shortcuts. [Change customer](https://docs.helpscout.com/article/437-change-customer), [conversation discovery/merge](https://docs.helpscout.com/article/31-merging-conversations).

**Adopt:** efficient earlier-conversation inspection. **Reject:** using a customer-change or conversation-merge action for related context. Asym's exact recipients, historical source attribution and optional relevance must remain independent; no new merge policy is settled by D9.

### E04 — Intercom and Kustomer: customer/participant context does not prove Asym authority

Intercom documents conversation-company context and distinguishes it from participant-derived company membership; its FAQs contain differing generations of guidance, so they do not establish one universal automatic rule. [Inbox FAQs](https://www.intercom.com/help/en/articles/8838656-inbox-faqs), [conversation FAQs](https://www.intercom.com/help/en/articles/8838326-conversations-faqs).

Kustomer's official conversation documentation/index distinguishes conversation/timeline and multi-party email topics. Direct English body access was limited; localized official material/index evidence does not justify claims about its internal storage, authorization or every edition. [Official conversation documentation](https://help.kustomer.com/en_us/categories/work-with-conversations-HJCoEHDqle), [official multi-party email documentation](https://help.kustomer.com/pt_br/multi-party-email-conversations-Hyz_fQhEle).

**Adopt:** visually distinguish the source conversation and participant/context concepts. **Reject:** importing a single customer/company primary timeline or automatic company assignment into Asym. Neither vendor proves that relationship membership conveys permission or that a conversation's full history should appear on every related Party.

### E05 — Zoho Desk plus CRM: good continuity, wrong synchronization model for Asym

Zoho documents Desk tickets within CRM related lists and actions under configured integration/user permissions. The article is current but undated, and the connected-product setup matters. [Desk/CRM integration](https://help.zoho.com/portal/en/kb/crm/integrations/zoho/zoho-desk/articles/zoho-desk-crm-integration).

**Adopt:** discover and act on permitted support work from CRM while preserving support permissions. **Reject:** copying its two-product synchronization into two surfaces of Asym. Asym needs current authorized projections over shared owners, not duplicate contacts, reconciliation loops or provider-linked CRM mappings.

### E06 — Nonprofit products: retain actual interaction semantics

Bloomerang documents constituent interactions with dates/channel/purpose and transaction associations. Its imported-email history (10 December 2025) groups threads for viewing while retaining individual email access and has its own household display semantics. This establishes UI behavior, not storage architecture or an Asym household fan-out rule. [Interactions](https://help.bloomerang.com/en/articles/12632737-view-add-edit-and-delete-interactions), [email history](https://help.bloomerang.com/en/articles/12632631-upload-non-bloomerang-emails-to-constituents).

Neon CRM Activities (15 March 2025) distinguish multiple associated accounts, staff assignment and internal notes. [Activities](https://support.neonone.com/hc/en-us/articles/4407398284685-Activities).

**Adopt:** accurate interaction dates and distinct staff/record roles, with inspectable grouping when actual source lineage permits. **Reject:** importing BCC logging, household propagation, moves management or a new generic activity/workflow system. Support context does not manufacture an interaction, giving touch or fundraising outcome.

### E07 — Proven accessibility principles and Asym-specific product judgments

W3C status-message guidance supports programmatically announced outcomes without gratuitous focus changes; target-size guidance supports usable pointer targets. These constrain the picker, More, Undo and return flow. [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Overview's three-row preview, existing Communications placement, default Unfinished filter, no ordinary Activity context marker, and compact peer group are **product judgments**, chosen to fit Core and reduce extra concepts. They remain subject to actual accessibility and representative staff-task proof. No study establishes these exact labels/layouts as universally best.

### F01 — Reported association-picker friction, not measured prevalence

A HubSpot community post by JoelV on 4 June 2026 reports friction identifying the appropriate person in a broad association picker after a company-ticket association. The accompanying response does not verify universal current behavior. [Reported picker experience](https://community.hubspot.com/t/contact-picker-for-associations/150012).

**Use:** test similar-name disambiguation and useful permission-filtered suggestions without trapping staff in a guessed relationship subset. **Do not infer:** all vendors have the problem, most ministries need a particular workflow, or a primary Party would fix it. The review's moderated-task threshold is an initial product check, not customer research already performed.

## Technical primary references

**T01 — Database integrity and concurrency.** PostgreSQL constraints support non-null/unique/composite foreign-key integrity; a cross-table dynamic authorization condition cannot safely be substituted into an ordinary row CHECK. RLS governs visible existing rows and permitted new row states, with important owner/bypass semantics. [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), [row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html). The current documentation resolved to PostgreSQL 18; this is not a claim about the deployed Core server version. D9's current generation, atomic evidence and retry semantics are design conclusions requiring real transactional tests.

**T02 — Supabase exposure and policy.** Supabase documents enabling RLS for exposed tables, policy behavior and privileged access. Tenant policies alone do not prove joint Support/Party authorization, immutable audit identity or safe view/RPC/service-role access. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). Require least privilege and current owner-qualified projections rather than letting the browser enumerate raw association IDs.

## Independent challenge and reconciled answer

The independent reviews supplied data/owner findings, lifecycle counterexamples and vendor/UX alternatives. The root synthesis adopted these consequential corrections:

- Removed a plausible link-time ordinary Activity marker: existing Overview/Communications provides discovery and qualified audit provides association evidence. Context-only linking creates no ordinary Activity entry.
- Explicitly denied raw browser association/control/audit reads as well as writes; tenant-only RLS would leak hidden linkage even if the UI hid the cards.
- Required visibility → event dedupe → proven source grouping → group pagination, stable source time/lineage cursors and complete permitted member outcomes across event pages.
- Added owner attribution revision retraction/remap: current views change without rewriting actual email facts or creating replacement events, and stale projectors cannot restore a removed basis.
- Limited Undo to the original operation's actual delta. Mixed existing/new Add cannot later remove pre-existing links; Undo Remove is a fresh currently permitted generation, not resurrection of an old interval.
- Changed the Overview action from View all to View conversations and made the unfinished empty state explicit, so a filtered destination does not falsely promise all resolved history.
- Preserved financial support terminology, source-only last-contact semantics and the existing Party record shell. No additional CRM tab or parallel composer is needed.

These corrections and the complete amendment package are now explicitly founder-ratified on 11 September 2026. Working independent reports are intermediate evidence; the final D9 review/blueprint resolves their alternatives.

## What is complete and what is not proven

Complete: current repository/owner/PR comparison, primary external research with access/date limits, all 23 requested categories, 22 exact requirement groups, 32 acceptance/proof groups, precise corrected decision, CRM/Support journey and two actual-source observations. The local record includes fully ratified ADR0009/glossary and session continuity; final structural validation checks source anchors, IDs, mirrors, formatting and prior-decision preservation.

Unexecuted: real Party/P6/P12/Support implementation, database/RLS/RPC authorization and concurrency, provider/email integration, production query plans/limits, migrations/rollback, actual browser/assistive-technology journeys and representative ministry staff usability. These are explicit activation gates, not reasons to leave the decision undefined or to substitute monitoring for prevention. No code, formal specification, tickets, GitHub state, production accounts, DNS, credentials or real messages were changed.
