# Saved Support views: shared ownership, queries and lifecycle

This fully founder-ratified D20 contract, 12 September 2026, supplements [R01–R28](phase26-d20-adversarial-review.md). Logical names below do not invent physical table/API names. Core's qualified platform named-view/list/preference capability is authoritative; Support registers its subject and semantics. Existing personal gift-history RPCs and old Support scaffolding must be qualified, not assumed correct.

## Owner and fact matrix

| Fact                                                                   | Authority                                                                  | Invariant                                                                              |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Saved definition identity, schema/revision/default-baseline, lifecycle | Shared named-view owner                                                    | One durable ID; versioned meaning; no second Support store or dual writer.             |
| Support subject, fields/operators, query and source projection         | Support owner using the shared list engine                                 | Closed typed catalog; current D3/D9/D10/D14/D15/D16/D17/D19 meaning.                   |
| Personal custodian                                                     | Qualified tenant/principal/profile identity with current staff eligibility | Do not choose an arbitrary role-membership row or email match as identity.             |
| Shared definition custody/audience/maintainers                         | Tenant-scoped shared capability and actual team/permission owners          | Author attribution is not lifecycle ownership or access grant.                         |
| Personal pins/order/display preferences                                | Same platform preference owner for current tenant/principal/subject        | References, not copies; desired-state mutations; independent of Shared criteria.       |
| Working query and active ID/revision                                   | Validated route/session state over the shared definition                   | Temporary deltas do not mutate the definition or become authority.                     |
| Conversation/current root/original content                             | Support and actual source owners                                           | One qualifying continuing row; current content/source authorization before matching.   |
| Parties/relationships/financial/care data                              | CRM and actual domains                                                     | No identity copies, unrestricted predicates or implicit business writes.               |
| Message templates/preparation/communication evidence                   | Email Studio/P17/P6/Resend under existing contracts                        | Saved-view operations have no message or publication effect.                           |
| Configuration/revision/query-state/audit retention                     | Actual shared configuration/source/records owners                          | Finite normal purposes, current restrictions, restore barriers; no archive of results. |

## Shared stored shape and exact meaning

Phase9 B11 already pins a versioned definition with nested AND/OR groups of typed field/operator/value predicates, sort entries, columns and table viewType. Reuse it; register a closed Support subject and supported catalog. Support's simple UI may compile facets into that nested shape. It must not activate arbitrary operators or board mode just because the shared shape reserves them.

Where definitions are stored as deltas from defaults, bind them to the exact immutable/versioned subject-default baseline. A changed default must not silently change an old view's effective query without a view revision. The owner may materialize an equivalent exact effective definition while preserving the shared contract. Missing old schema/baseline proof yields Needs attention; schema translation may preserve semantics deterministically, but a meaning change requires an explicit reviewed successor.

Keep definition contents separate from runtime context:

| Persist in qualified definition                                                   | Keep outside the definition                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Stable subject/schema/default baseline, explicit inbox scope and typed predicates | Tenant/actor claims from URL or user payload                              |
| Explicit current-viewer references or named stable IDs                            | Email-based agent matching or creator substituted for Me                  |
| Reviewed search text and its protected owner context                              | Copied message body/result IDs/unseen ambient filters                     |
| Qualified shared default sort and columns                                         | Cursor, current selected row, scroll, current conversation or reply draft |
| My/Shared custody, audience and maintenance references                            | A pin as a copied definition or creator as permanent Shared delete owner  |
| Revision/lifecycle evidence and justified audit references                        | Entire raw before/after criteria in general telemetry                     |

Support definition labels need not be globally unique. Existing private named-view uniqueness must be adapted only for the Support subject or use a compatible subject-specific display policy; do not relax CRM constraints globally. Duplicate names must not reveal another My definition through collision errors, replace it by upsert or determine pin/URL identity. Disambiguate with scope/audience/description while preserving opaque stable IDs.

## Predicate and result contract

Let an effective query contain a qualified subject/default baseline, saved ID/revision where present, explicit working deltas, viewer context and sort. Current source authorization determines the eligible population; predicates then match only permitted fields/facts. Results, matching total, preview and page continuation use the same effective predicate. Facet options are a separately specified authorized catalog/contextual query, never derived from loaded rows; no per-option counts are required by default.

Different ordinary facets combine by AND. Selected inbox/status/named-person alternatives combine by OR. Labels explicitly choose Any selected or All selected. No labels and Unassigned are valid explicit values, not failed lookups. Empty/malformed arrays, unknown operators and missing required scope cannot silently normalize to Any. Reference renames preserve stable identity; deleted/reused names never retarget a predicate.

Example counterexamples to prove against the real implementation:

| Data/query                                             | Correct outcome                                                                                                                                                                                             |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Labels A/B; rows with A-only, B-only, both and neither | Any returns first three; All returns only both; No labels returns neither. Preview/server/count/page agree.                                                                                                 |
| Save from Donor care while Finance was previously open | Stored Donor care criterion remains; Finance does not silently intersect or substitute.                                                                                                                     |
| Me in Shared versus named Alex                         | Sam's Me is Sam; named Alex remains Alex. Neither grants access.                                                                                                                                            |
| Relevant row after 2,000 unrelated rows                | It still matches; no limit-before-filter omission.                                                                                                                                                          |
| Default status changes after a saved delta             | Old view retains its exact saved meaning through its baseline or qualified equivalent translation.                                                                                                          |
| Deleted explicit inbox; dynamic All accessible inboxes | Explicit missing scope is unavailable/Needs attention; dynamic scope deliberately reevaluates current accessible set.                                                                                       |
| Partial Follow on merged originals                     | D15 membership resolves permitted original follows then root dedupe. Other explicit current-root facets may legitimately alter results; unrelated originals do not enroll or change Latest followed update. |
| One known overdue target plus earlier uncertain target | D14 Overdue filter remains true and uncertainty remains visible; displayed single cue is not the sole query predicate.                                                                                      |

Use parameterized SQL/qualified query construction and keyset ordering with stable ID tie-break. Reuse the shipped cursor envelope rather than inventing a second paginator. Bind paging to exact query/revision/scope/sort; a changed context invalidates stale continuation. Define time-dependent predicate evaluation consistently within each result/count response; current work can change between pages, so do not claim an immutable historic cohort. Rechecking source permissions is always current, even when ordinary result ordering is held stable for interaction. A precise count query, capped/estimated result and “rows loaded” have different units and labels.

## Authoritative mutation model

| Command                    | Allowed effect and guards                                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Create My                  | Derive current qualified custodian; validate subject/criteria; atomically create ID/revision/history under stable create-command identity.   |
| Create Shared              | Require explicit scoped maintenance and audience/reference disclosure; independent tenant custody. No generic personal row visibility flip.  |
| Update criteria/audience   | Exact existing ID/expected revision; validate current meaning/access and changed audience; commit successor and required history atomically. |
| Rename                     | Change only exact selected definition's metadata; never read active route filters as replacement.                                            |
| Save My copy / Shared copy | Deliberate new identity with reviewed eligible definition; no live dependency on the copied definition.                                      |
| Pin/unpin/reorder          | Desired state under current tenant/principal and view lifecycle guard; no definition or startup default effect.                              |
| Archive                    | Guard current revision; end active availability and existing pin applicability; preserve current conversation work and allowed history.      |
| Restore                    | Revalidate current schema/criteria/audience; new lifecycle/revision; catalog availability only, no old pin resurrection.                     |
| Restore previous settings  | Preview qualified retained revision and commit a new valid successor; not a raw history rewind.                                              |

Update/rename/archive cannot create a missing definition. Same command identity with changed semantic payload conflicts. Exact retry returns the original receipt and current state separately; a prior success receipt cannot revive a later archive. Definition-save/pin partial success remains explicitly recoverable without duplicate creation.

Archive/restore requires an ABA guard: an old Pin or create-auto-Pin command must not take effect after Archive→Restore merely because the view is active again. Bind positive preference intent to the current lifecycle generation or equivalent owner receipt. Restore reactivates no prior pin, including the creator's. This can use lazy reference applicability/current guards; no mass synchronous rewrite of every user's preferences is required. A genuinely new deliberate Pin after restore is allowed.

## Authorization and database requirements

Shared-capability reuse must not require CRM read/write permission merely because current APIs live under a CRM directory. The registered Support subject resolves the actual current Support capabilities through the canonical API owner. Personal identity uses the qualified tenant/principal/profile and current staff authority, not first role row, support-agent email or caller-controlled owner field.

Enforce tenant-aware stored view/subject/custodian/audience/team/pin/reference relationships, non-null tenant, valid My/Shared ownership combinations, positive schema/revision, bounded typed definition, stable effect keys and checked lifecycle. Global identity binds through authoritative tenant membership; a foreign key does not replace current authorization. Author deletion may not cascade Shared definition loss. Server time/actor/history derive from trusted context. No new money fields are needed.

The current shared private store's RLS-enabled/revoked-browser-grants pattern is a sound starting point. Raw sensitive definition state can remain server-owned. Any exposed collection/projection must minimize fields and enforce current My/Shared audience conditions. Current broad staff `support_saved_views` policies must not remain a bypass beside the shared owner. Prove effective permissive/restrictive policy combinations, old-row USING/new-row WITH CHECK semantics and forbidden field transformations; PostgreSQL's implicit applicable check is not absence of checking. Guard SECURITY DEFINER execute/search path, service-role bypass, exports, caches, audit and restore equally.

Definition audience, predicate field-use/disclosure, metadata exposure and current conversation/CRM result access are distinct. A user may see fewer result rows while having a wholly interpretable dynamic view. They must not infer a forbidden CRM fact through a row's inclusion or a facet/count. Required explicit references that become inaccessible invalidate their executable definition for that viewer rather than silently dropping scope. A manager's historical ability to create a view is not perpetual query authority.

## URL and cache protection

Saved links use stable view identity and current access. Effective modified state must round-trip deliberately under the shared canonical serializer. Sensitive free text and private literal values must use authenticated, bounded owner-held query-state references, never raw URL/referrer/analytics/log values. Such a reference is not a bearer grant, not an implicitly Shared saved definition and not another standalone query-state platform. Default temporary state remains private to its authorized owner; deliberate Shared creation is the existing route for broader definition disclosure. Non-sensitive enum/ID deltas may be encoded only under the catalog's qualified route policy. Missing/expired/forbidden state fails as unavailable, never as match-all. This Support specialization leaves the existing CRM route contract unchanged.

Bind caches and late responses to tenant, principal/acting scope, subject, view revision/lifecycle and effective query. Existing sign-out/user-change cache clearing is useful but insufficient proof for same-user tenant switch, role loss or source reclassification. Never render an old response in a new scope. Fixture-backed collections cannot masquerade as production read authority because they share a cache key. Restore/rebuild/default fallback may not revive archived, denied or expired definition content.

## Retention, source integration and rollout

Configuration text, revisions, temporary query-state, pin preferences and minimized audit need actual owner-qualified finite lifetimes, deletion/hold rules and restore barriers before activation. General independent filters do not inherit the conversation inactivity clock; known source-derived restricted/expired values still cannot become a shadow archive. No cached result set, old snippet, current CRM identity rematch or provider fetch can revive disposed message content. Shared custody survives creator departure; My access stops without automatic sharing or same-email succession. No inactivity-based auto-delete is added.

CRM record history keeps its D9 scope until explicit Open in Support Hub. Actual conversation/root/original matching, target predicates, Following and intake/recovery remain with their owners. Views neither generate P6 events nor call Email Studio/Resend; existing actual message/business commands retain their current boundaries.

Migration registers the Support subject and typed payload additively. Preserve gift-history/other CRM callers. Inventory legacy missing owners/inboxes, ambiguous Any/All, old names/slugs/layout/defaults and source restrictions; valid deterministic translations preserve exact meaning and identity mapping, ambiguity becomes owned reconciliation. Stop conflicting legacy writes before activation and avoid permanent dual writes. Rollback preserves new identities/restrictions/tombstones; incompatible old writers stay disabled. No live schema, cache, route or provider state changes occur in this grooming record.

## Ratification and Email Studio clarification

The founder fully ratified all D20 amendments, definitions, UX/data/evidence, independent corrections and required proof on 12 September 2026. The [Email Studio integration addendum](phase26-d20-email-studio-integration.md) restates the accepted configuration/authoring/local attention/delivery/CRM seam without a new product choice or implementation claim. Historical proposed/pending/no-Q21 statements above are superseded as to acceptance and advancement only. [Ratification and Q21 validation](d20-ratification-q21-validation.json) preserves the historical evidence separately.
