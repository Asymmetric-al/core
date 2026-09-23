# D18 independent data, CRM, authorization and ownership review

**Independent review input:** The [final D18 decision](phase26-d18-adversarial-review.md), [UX](phase26-d18-library-ux.md) and [data contract](phase26-d18-data-contract.md) govern adopted amendments. Candidate publication, format, lifetime and other alternatives below are preserved review history, not competing final requirements. In particular, My Save is nonpublication authoring; Internal notes have separate drafts and no email preparation; new table/blockquote authoring is excluded. Full D18 amendments remain proposed pending ratification.

Date: 11 September 2026. Reviewer: d18_data_crm. Decision under review: B — My replies plus a curated shared library. **Disposition: Accept with required amendments.** This independently reviewed proposal preserves D1–D17 and does not certify implementation.

## Review boundary and evidence

Execution directory verified as `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`. Inspected current source at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`, root/API/database/Supabase AGENTS, backend/data-access rules, merged platform boundaries, ADR0030 canonical message document, P17 Saved Sections and publication, D4, D9, D16, D17, Q18 evidence/scope review, canned routes/schema/adapter/form/composer/collections/query keys. Skills applied: grill-with-docs/domain-modeling and Supabase/Postgres best practices for the scoped inspection.

These are read-only source observations and conceptual scenario reviews. No application modules, database/RLS queries, provider operations, environment files, migrations, production requests or rendered UI were executed. Current source shapes do not prove deployed behavior or an exploitable incident.

### Exact source anchors

All paths are relative to the verified Core worktree; immutable links use the revision above.

| Ref | Source                                                                                                                                                              | Observed fact                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | `supabase/migrations/20260515025814_support_hub_core_modules.sql:384–402`                                                                                           | Canned row has nullable owner_agent_id, text/html bodies, tenant composite key and owner FK with ON DELETE CASCADE. Shortcut unique expression uses coalesce(owner_agent_id, '**workspace**').                                                             |
| S2  | same migration `:524–571`                                                                                                                                           | Canned table enters generic staff SELECT/INSERT/UPDATE/DELETE grants and tenant/staff RLS. Both UPDATE USING and WITH CHECK exist, but neither checks personal ownership or shared publishing.                                                             |
| S3  | `packages/api/src/admin/support-hub/adapter/supabase.ts:73–86,143–155,173–183,1008–1028`                                                                            | Service/admin client plus explicit tenant filter; list returns tenant canned rows, upsert accepts input.ownerAgentId, mutable bodies and id, DELETE is direct.                                                                                             |
| S4  | `packages/api/src/admin/support-hub/schemas.ts:127–134`; canned routes `apps/admin/app/api/admin/support/canned-responses/route.ts:11–30` and `[id]/route.ts:12–35` | Schema allows caller nullable ownerAgentId; routes use generic Support access and pass body through to save, ignoring available authenticated user context for ownership.                                                                                  |
| S5  | `packages/api/src/admin/support-hub/route-helpers.ts:31–86`                                                                                                         | Generic staff/admin/super_admin gate; helper resolves Support agent by id or email. The latter is not a sound new personal-library ownership proof.                                                                                                        |
| S6  | same migration `:42–63`                                                                                                                                             | Agent optional profile/user references can be null; per-tenant email unique but user_id has a nonunique index. Agent identity is not interchangeable with the authenticated tenant membership.                                                             |
| S7  | `apps/admin/features/support-hub/components/settings/canned-responses/CannedResponseForm.tsx:43–57`                                                                 | New form defaults owner to null and treats a body beginning with < as HTML; current authoring UI is not the ADR0030 canonical structured source.                                                                                                           |
| S8  | `apps/admin/features/support-hub/lib/merge-variables.ts:20–32,44–54,63–83`                                                                                          | Feature-local helper resolves strings from donor snapshot/name/email and supplied agent; unknown token remains; null becomes empty; no output-context escaping inside this function. This is distinct from the shared Email Studio helper discussed in D4. |
| S9  | `.../composer/extensions/canned-suggestion.ts:53–66`; `ConversationComposer.tsx:140–144`                                                                            | Slash picker uses first eight local title/shortcut matches and substituted HTML; macro callback replaces entire composer document. Downstream whole-document safety was not runtime-tested here.                                                           |
| S10 | `packages/database/query-keys.ts:47–57`; `packages/database/collections/support-hub.ts:2244–2258`                                                                   | Canned query key lacks explicit tenant/principal scope. Collection uses module-local fixture rows/writers. Neither demonstrates new personal-scope cache isolation.                                                                                        |
| S11 | `packages/api/src/admin/support-hub/mutations/run-macro.ts:102–105`                                                                                                 | Server runner explicitly skips send_canned_response: canned insertion is composer-controlled and does not auto-send. Do not incorrectly claim it currently sends these messages.                                                                           |
| S12 | `docs/adr/0030-canonical-message-document-and-presentation-dependencies.md:18–41`; P17 `:810–845,930–934`                                                           | Canonical structured document, pinned publication dependencies, copy-on-insert Saved Sections, optimistic revisions and proportional publication review. P17 does not already specify personal Support saved items.                                        |
| S13 | D4 R04–R08; D9; D16 R03/R10/R12; D17 R13–R21                                                                                                                        | Library rights separate from compose/send; exact audience facts and no Party inference; known source copies obey restrictions/expiry; source histories and independent owner records stay separate.                                                        |

Search for support_canned_responses in migrations found its creation/rollback, not a later owner-specific RLS replacement. This is source-search evidence, not a live-schema assertion. Search for Saved Section implementation names did not establish a qualified deployed P17 asset implementation; ownership is governing intent that must be completed.

### Primary technical sources checked this turn

- [PostgreSQL 17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html): policies and grants differ; owners/BYPASSRLS and referential checks need explicit attention; multiple permissive policies combine rather than replacing old broad access. Adopt least-privilege checks at the authoritative server command and appropriate database boundary.
- [PostgreSQL 17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html): composite keys/foreign keys and uniqueness can enforce tenant-aware identity and cardinality. Do not make cross-row authorization a CHECK constraint or rely on a sentinel as business scope.
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): service access, auth context and policy configuration require separate proof. An admin client means tenant filters alone cannot implement D18's per-user and per-capability policy.

No external vendor internals, ministry-specific prevalence, ideal library size or performance measurements are inferred.

## Findings and exact permanent requirements

Likelihood is qualitative engineering judgment conditional on naively extending the current implementation, not measured incident frequency. Each concern retains B but narrows or changes its required contract.

### F1 — Tenant-wide canned CRUD cannot become personal/shared authorization

**Material concern: Yes. Severity: High. Likelihood: High if current paths are reused.** S2–S5 show generic staff authorization plus caller-controlled owner. Another staff member could read/change personal wording or create shared content merely by nulling owner; assigning another person's id could impersonate custody. Tenant separation alone does not prevent within-tenant exposure or publication.

**Required language:** “Personal scope is a first-class tenant-owned authoring scope bound to the authenticated tenant membership, derived on the server. Callers do not choose tenant, owner, author, approval or audit actor. Shared content is separately authorized for read/use, contribution, maintenance, publication and safety restriction. Scope and custody changes use explicit authorized commands; a generic update cannot promote a personal row or reassign it.”

Personal save requires active membership and personal-library capability; no permission to read arbitrary team transcripts follows. Current ownerAgentId cannot simply be relabelled.

### F2 — Permission removal, staff departure and governance are undefined

**Material concern: Yes. Severity: High. Likelihood: Medium.** S1/S6 allow actor disappearance and cascaded loss. “My replies” could misleadingly imply secret property, portability, deletion on departure or that personal author controls shared guidance forever.

**Required language:** “My replies means saved wording for this member's use in the current tenant. It is not cross-tenant private storage. Other ordinary staff and shared maintainers cannot browse personal bodies. Explicit tenant records/security custodians may inspect, restrict, retain or dispose through the existing audited governance boundary. Offboarding immediately ends the departed member's access and picker eligibility; it does not publish, delete or reassign personal content by cascade. Shared wording survives creator departure under current shared stewardship. Approved recovery creates a separately reviewed candidate with provenance; it never imports the departed person's author identity or grants their permissions. Rejoining or matching email does not silently revive old personal access.”

Reuse existing governance and departure tooling, not a new employee-surveillance console.

### F3 — Nullable ownership and shortcut sentinels create invalid states

**Material concern: Yes. Severity: Medium. Likelihood: Medium.** S1's nullable owner conflates shared/unowned; magic '**workspace**' can collide with unrestricted text IDs. Short-code collisions across personal/shared scopes are valid but could choose an unintended reply.

**Required language:** “Use an explicit personal/shared scope discriminator with valid owner cardinality: personal requires one same-tenant principal custody reference; shared has no personal owner. Enforce same-tenant foreign keys for item/revision/principal/assets and one current head per scope/item. Never repurpose missing/removed owner as shared. Optional shortcuts are search aliases, never identity or auto-expansion commands. Duplicate titles/aliases yield labelled authorized choices, never precedence-based silent insertion; no global uniqueness check leaks the existence of another person's private item.”

Do not freeze a particular table name. Nonblank and bounded fields, enums, timestamps, schema versions, finite content/asset limits and deliberate retention/deletion behavior must be schema/command enforced. No money field or precision is introduced.

### F4 — Dual text/HTML and path interpolation create a second content authority

**Material concern: Yes. Severity: High. Likelihood: High.** S7–S9 contradict intended ADR0030 if retained as production authority. Unknown tokens/literal HTML and arbitrary string substitution are not typed disclosure controls.

**Required language:** “A saved reply is a narrowly qualified P17 Saved Section authoring asset. One canonical structured document and locale/direction own its content. Shared compiler derives safe deterministic HTML and plain text. Raw HTML/text pairs, custom expressions, property paths, executable substitutions, provider templates and app-local interpolation are not alternate authorities. Legacy items convert into reviewable drafts or stay unavailable/read-only with explicit incompatibility.”

Literal brace text is allowed as plain text; unresolved typed nodes block insertion/preparation with exact guidance. Do not blanket-ban braces or invent a custom template language.

### F5 — Generic requester and agent variables can address or disclose to the wrong person

**Material concern: Yes. Severity: High. Likelihood: Medium.** S8 resolves “donor” from externalContact snapshot and “agent” from supplied assignee-like value. D9 peer links have no main Party. A representative, shared email, forwarding or transfer could substitute the wrong identity or confidential record.

**Required language:** “Saved reply variables are semantic, closed and owner-qualified. Acting author, support coordinator, requester/message participant, admitted recipient and related CRM Party are distinct. Resolve from exact current authorized draft context; never first related Party, owner/assignee substitution, email match, current CRM email as historical recipient, or caller samples. Authoring previews are synthetic. Real data exists only in the authorized draft/preparation. A field shown to staff is not automatically disclosed to all To/Cc recipients.”

Ordinary greeting may use a qualified recipient display name with explicit optional fallback; no first-name split required. Unknown/ambiguous Party never forces CRM creation.

### F6 — Save from conversation can evade D16/D17

**Material concern: Yes. Severity: High. Likelihood: High without special treatment.** D16/D17 require actual copied source payloads to remain restricted, including snippets/subjects/files. “Personal” is not a retention exception.

**Required language:** “Fresh reusable authoring starts from generic or synthetic content. Any Save as reply shortcut copies only explicit eligible selected wording into a private authoring candidate and declares provenance. It strips actual recipients, signatures/source headers, resolved CRM values, actual protected links and source attachments; typed placeholders and independently governed library assets are substituted only through qualified transformation. Source-bound retained content remains subject to source restrictions until genuine generalization is established. A confirmation checkbox alone cannot declassify a source copy. Discovering copied sensitive content invokes the owning correction path across known saved revisions and governed derivatives. Do not promise automatic detection of every pasted secret.”

Safe generalization is a real authoring review, not per-message AI classification. No exact-content-wide infinite graph required; track known source-derived copies and typed assets. Ordinary reusable generic wording has its authoring asset's own purpose and governed retention/final disposition, not conversation inactivity as its only lifetime. This does not impose a universal fixed expiry on useful active generic instructions.

### F7 — “Full featured” must not mean every template type becomes ordinary Support wording

**Material concern: Yes. Severity: High. Likelihood: Medium.** D4 R05 forbids importing system/receipt/protected-action/campaign templates merely because they render. Disclaimers, financial claims or auth prompts could bypass the owning semantics.

**Required language:** “Qualify ordinary response wording, instructions, short phrases and internal-note scaffolds as authoring purposes inside the same structured owner model. Purpose/mode compatibility is explicit. Internal-note content never enters an external reply through mode switching or picker reuse. Automated acknowledgement, protected action, official artifact/receipt, campaign send, outcome confirmation and signature/presentation remain their existing owners; offer owner navigation or insertion of a qualified result when applicable, not a freeform substitute. A saved reply cannot perform work/CRM/money actions.”

Shared publication reuses P17's proportional review floor and actual meaning checks. Do not grant every Support writer system_messages publication permissions. Personal wording remains human composition input, never a loophole to publish protected system meaning.

### F8 — Shared publication, suggestions and personal forks need exact provenance

**Material concern: Yes. Severity: Medium. Likelihood: High in routine editing.** Last-write-wins S3 can overwrite collaborators; “Share” moving a personal row would surprise author and readers.

**Required language:** “Saving a personal item creates a validated immutable revision behind its personal current head. Offer for sharing creates a same-tenant reviewed candidate pinned to exact source revision and contribution author; it does not expose later personal edits. A qualified shared maintainer can revise then publish under the appropriate floor. Rejection/withdrawal retains truthful state and does not delete the personal item. Concurrent save/publish uses expected head, clear compare/reload/copy recovery and idempotent command receipts; no last-write-wins. Ordinary authorized shared edits may self-publish where P17 allows.”

Derived personal copies preserve safe lineage but are independent. Shared updates do not silently overwrite forks, drafts or mail. No bespoke multi-stage approval engine needed.

### F9 — Retire, revoke, restore and delete must remain distinct

**Material concern: Yes. Severity: High. Likelihood: Medium.** D4 R07 explicitly permits unchanged pinned drafts after a new revision. Direct DELETE S3 cannot preserve this distinction.

**Required language:** “Retire removes an item from future ordinary discovery/new insertion; it does not rewrite already inserted drafts or sent mail. Current qualified new-preparation rules decide use of an already pinned retired revision. Safety restriction/revocation blocks affected new use and unsafe preparation/dispatch through D4/P6/P17/D16. Restore produces a new checked revision/decision, never deletes the intervening evidence or restores disposed bytes. Permanent disposal follows authoring/source retention and preservation rules; no UI retire label implies physical erasure.”

Retirement must not unexpectedly revive an older unsafe revision as fallback. Existing prepared/accepted/unknown provider sends reconcile under exact envelope; a new template revision does not recall or replace them. Current source restriction wins over restored/forked content.

### F10 — Shared assets can leak source documents or lose independent files

**Material concern: Yes. Severity: High. Likelihood: Medium.** D4 attachments and ADR0030 govern qualified assets; a copied storage URL is not a managed asset reference.

**Required language:** “Reusable images and ordinary documents reference exact same-tenant authorized asset versions with type/size/content-safety, permitted audience, accessibility metadata, usage provenance and current revocation. Private note files, recipient-specific downloads, signed URLs, receipts and protected links are not reusable library attachments. Each insertion creates the correct logical draft occurrence; shared physical bytes remain independently owned. Retiring a library item or deleting a personal owner cannot cascade-delete other drafts or official records. Revalidate at insertion/preparation and guard downloads; obsolete public URLs cannot bypass safety fences.”

Optional files need clear display in preview, no hidden signature duplication/tracking pixel. No external fetching of arbitrary URLs; governed publication URL eligibility only.

### F11 — Search, favorites, previews and caches become authorization surfaces

**Material concern: Yes. Severity: High. Likelihood: Medium.** S3 allRows loads bodies; S9 first eight and S10 global-shaped keys cannot establish complete scoped search. Personal title/shortcut/count can itself leak.

**Required language:** “Authorize before result shaping, facets, counts and pagination. Search only permitted eligible items; load bodies lazily where practical and preserve full authorized search beyond quick suggestions. Tenant/principal/current authorization and purpose/locale scope must be represented in shared cache identity or proven equivalent request isolation. Tenant switch, logout, revocation and offboarding invalidate active results, previews, recent/favorites and selection tokens; deep links reauthorize. Picker visibility is not authorization.”

Favorites are tenant-member preference on exact item, not copied body. Analytics minimum is qualified revision use/admission events, not entire personalized drafts or a staff surveillance score. No performance figures claimed without data.

### F12 — CRM history can become noisy or acquire false communication evidence

**Material concern: Yes. Severity: Medium. Likelihood: Medium.** D9 source-owned discovery and P6 actual occurrence distinguish authoring from interaction.

**Required language:** “Create/edit/save/share/publish/preview/insert/favorite/retire of reusable wording produces authoring evidence only, not CRM Activity, correspondence, new Party, last contact, conversation outcome or giving action. D4's actually admitted message and P6 outcome supply the existing communication history; revision provenance is internal explanation on that occurrence, not a second communication. CRM record links and permissions remain independent. Reviewers see synthetic wording without live donor/care context.”

Template wording such as “your refund is complete” cannot establish financial truth. Runtime protected fact claims require exact owner proof or require staff to use the qualified owning action/result.

### F13 — Raw audit/revisions can retain personal content forever

**Material concern: Yes. Severity: High. Likelihood: Medium.** A history log or immutable version table can become a shadow transcript even when the visible item was deleted.

**Required language:** “Classify canonical authoring content, draft revisions, contributions, compiled previews, assets, indexes, use evidence and security/audit evidence separately. Every class has an owning purpose, permissible fields, access, declared retention/final disposition and correction/restore behavior before activation. Active generic wording may have a continuing authoring purpose; abandoned drafts and superseded or deleted content do not obtain permanent payload retention by default. Immutable means attributable and non-rewritten ordinary history, not permanent readable payload. Durable audit is body-free with safe typed references; do not store old/new HTML, samples, resolved donor fields or protected URLs in logs.”

Known dependent payload cleanup must survive failed projection/outbox delivery and report actual state. External sent copies cannot be recalled.

### F14 — Mixed-version migration can recreate insecure library paths

**Material concern: Yes. Severity: High. Likelihood: Medium.** S1–S11 show both current direct/API/fixture paths and mutable representations. Existing saved entries lack provable governance and recipient-safe origin.

**Required language:** “Before activating personal/shared scope, inventory actual legacy rows and consumers, migrate or quarantine unsafe/unknown rows into non-sendable drafts, preserve origin without inventing approvals, and fence old direct-table/client/API/macro writers. Unknown owner is unclassified legacy, never silently shared. Replace generic policies/grants rather than adding restrictive-looking permissive policies alongside them. Additive schema/read compatibility precedes writer cutover. Rollback disables new authoring/publication safely and preserves already admitted mail/evidence; it never restores broad personal reads or old safety-ignoring writers.”

No migration sends mail. Current server canned macro skip is preserved until any actual separately authorized future macro behavior is designed.

### F15 — Unnecessary policy/approval complexity can make B worse than A

**Material concern: Yes. Severity: Medium. Likelihood: Medium.** A personal/shared model already solves the actual ownership difference. Unlimited sharing matrices, contextual scripts, subfolders/approval tiers, per-author classifiers and cross-tenant synchronization are speculative.

**Required language:** “One qualified owner, two clear library scopes, shared stewardship, explicit contribution and source-safe copy semantics form the initial complete capability. Reuse existing eligible-context filters, metadata organization and proportional review. More scopes/rules/inheritance/automation require demonstrated need. A tenant need not manage every ordinary wording edit through a second person or tag every phrase to save it.”

## Lifecycle and authorization matrix

| Object/action                | Authoritative owner                                        | Required boundary                                                                              |
| ---------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Personal item/head/revisions | Email Studio authoring owner, tenant and principal custody | Personal author capability and exact custody; audited exceptional records/security access only |
| Shared item/head/revisions   | Email Studio authoring owner, tenant stewardship           | Eligible read/use separate from author/publish; exact review floor                             |
| Contribution candidate       | Same owner, immutable submitted source revision            | Contributor sees own candidate; current maintainer review grants no transcript/CRM access      |
| Favorite/recent marker       | Shared preference capability for tenant member             | Exact current eligible target; no copied personalized body                                     |
| Inserted draft               | Support D4 authored draft with safe revision provenance    | Current conversation/compose authority; no live fanout                                         |
| Prepared/send material       | P17 qualified preparation/P6 transport                     | Exact reviewed audience, source, versions and current fences; no rerender on retry             |
| CRM/funding/Party fields     | Actual CRM/giving owner                                    | Exact authorized reads/disclosures; no source mutations by library                             |
| Safety/restriction/retention | Actual authoring/source/records owners                     | No copied-source laundering, truthful disposal/custody, body-free evidence                     |

## Required outcome proofs

These are future acceptance criteria, not tests executed here.

1. Same-tenant nonowner cannot list/count/preview/export/edit another personal item, including direct IDs, old caches and shortcut conflicts; explicit audited custodian path is separately tested.
2. Caller cannot supply another owner/null to promote personal content, impersonate actor, cross tenant/principal boundaries or use email equality as custody.
3. Owner removal/disabling does not cascade-delete shared content or make personal content shared; rehire/new account with same email cannot recover old custody silently.
4. Shared maintainer without private conversation/CRM permission can review synthetic candidate but cannot see donor context.
5. Two concurrent personal saves and two shared publishes preserve heads; lost response reconciles same effect; withdraw/review races do not leak later personal edits.
6. Same shortcut/title across My/Shared and locales yields correct labelled authorized candidates; no silent personal/shared priority, global collision oracle or alias-to-identity coupling.
7. Existing draft survives ordinary library revision/retirement according to D4, while safety revoke, expired source, asset denial and permission revocation stop their corresponding new uses; Undo never restores revoked payload.
8. Fresh synthetic authoring accepts literal braces but blocks unknown typed fields/raw HTML/executable paths; Thai/RTL, long names, missing optional greeting and ambiguous audience remain understandable.
9. Runtime author differs from coordinator; first related Party is not selected; multiple recipients get common authorized body; no per-person secret enters group email.
10. Save as reply generalizes known source data, strips files/protected URLs and cannot retain an expired/redacted source through revisions, contribution previews, caches or restores.
11. One shared library asset used by two drafts survives item retirement without unauthorized public URL access; revoked item cannot be resurrected from browser HTML.
12. Library actions do not write CRM Activity/last-contact, mutate Party/giving/workflow, duplicate a P6 communication, or reset D17 clocks.
13. Permission/scope/site/mode/locale switch clears incompatible selection and stale results without discarding unrelated draft work; omitted first-eight result remains discoverable through full search.
14. Current direct CRUD, fixture collection, imports and macro insertion are fenced; mixed versions cannot restore ownerless shared reads or bypass canonical renderer.
15. Retention and restoration prove disposal of actual governed payloads, safe minimal receipts and absence of raw source in technical logs.
16. Complete same-tenant authorization indexes/constraints, USING/WITH CHECK/grants/view/RPC/service paths and attachment download policies are tested against positive, negative and race cases.
17. Measured library/revision/asset sizes and per-tenant query/workload budgets establish practical boundaries; no vendor arbitrary cap substitutes for production-shaped evidence.

## Prioritized synthesis

Before recording D18's corrected answer, settle first-class tenant-personal custody, proportional curated publication, canonical Saved Section semantics, source-derived content treatment and retire/revoke distinction. These determine the safe product, not optional implementation polish.

Capture exact owner seams and authorized lifecycle in the grooming record. At implementation, qualify P17 authoring/preparation and P12 membership/capabilities, then additive schema and database guards, then source-safe authoring/search/insertion, contribution/shared publication, offboarding and restriction propagation. Fence legacy paths before activation. Prove actual compiler, auth, migration, caches, CRM and D4/P6 end-to-end outcomes.

Monitor only residual measurable effects: failed revocation propagation (any post-revoke eligible read/use triggers security containment); unsuccessful source-copy cleanup (any deadline breach or missing owner blocks claimed completion and opens owner repair); repeated shared-edit conflict (owner measures rate against published capacity/UX budget, fixes concurrency UX rather than allowing last-write-wins); abandoned contributions/stale forks (named shared maintainers review current backlog through existing authoring work). Product correctness and privacy fences are release gates, not monitor-only risks.

## Source hashes

Machine-readable structural evidence (not behavioral tests):

```json
{
  "sourceRevision": "7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd",
  "mode": "read-only source inspection; no module, database, RLS, provider or browser execution",
  "observations": [
    {
      "id": "S01",
      "source": "packages/api/src/admin/support-hub/adapter/supabase.ts",
      "line": 1010,
      "fact": "canned list calls allRows without personal owner filter",
      "structurallyVerified": true
    },
    {
      "id": "S02",
      "source": "packages/api/src/admin/support-hub/adapter/supabase.ts",
      "line": 1017,
      "fact": "save assigns owner_agent_id from input.ownerAgentId",
      "structurallyVerified": true
    },
    {
      "id": "S03",
      "source": "supabase/migrations/20260515025814_support_hub_core_modules.sql",
      "line": 398,
      "fact": "canned personal owner FK uses ON DELETE CASCADE",
      "structurallyVerified": true
    },
    {
      "id": "S04",
      "source": "supabase/migrations/20260515025814_support_hub_core_modules.sql",
      "line": 565,
      "fact": "generic update USING and WITH CHECK use tenant staff predicate without personal/shared capability",
      "structurallyVerified": true
    },
    {
      "id": "S05",
      "source": "apps/admin/features/support-hub/lib/merge-variables.ts",
      "line": 53,
      "fact": "feature-local interpolation returns String(value) and does not escape in this helper",
      "structurallyVerified": true
    },
    {
      "id": "S06",
      "source": "packages/database/query-keys.ts",
      "line": 57,
      "fact": "canned query key has no explicit tenant or principal component",
      "structurallyVerified": true
    },
    {
      "id": "S07",
      "source": "packages/api/src/admin/support-hub/mutations/run-macro.ts",
      "line": 102,
      "fact": "server canned macro action is skipped rather than auto-sent",
      "structurallyVerified": true
    }
  ]
}
```

- migration: 3bb6e52b57672d9ce1247b6f4495f0783f557caa92e7cc5c1047e17c1a346c16
- adapter: 17666d3087ce4e86c7386874bdf42d4ef491b6e35fa53384fa77bdd32e7b6cb6
- route-helpers: 4f3e6b124a2cf8b318cc5a4a188d0115029dda6245d0801f96b39ddfa647bde1
- schemas: 4ba1d5051b6b8da43eaafe2023ffb8ef3d65916d057d3e8cc5113a58c30a245a
- local merge-variables: 9831e7e5c18cbc0354954389dab485713bf333033b1bc983c99df46e727ee3bf
- query-keys: 87d4f1ddbc72053ebefda6146b2505ea7e06822baeedc9a17903ba6d5a571fea

Memory used solely for grill convention: MEMORY.md:431. Current source and ratified documents were verified directly.
