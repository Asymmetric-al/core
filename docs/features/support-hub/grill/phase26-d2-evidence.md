# Phase 26 D2 — Complete evidence and proof record

Checked 10 September 2026. This local research artifact supports [the synthesized D2 review](phase26-d2-adversarial-review.md). It is not a formal specification or deployment proof. Core worktree and live develop were verified at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. No production messages, database changes, secrets, DNS, GitHub mutations or runtime implementation were used to produce this record.

## Ratification status

D2 and all synthesized review amendments were explicitly founder-ratified on 10 September 2026. The original independent reports below preserve their pre-ratification wording as historical evidence. Their references to pending confirmation describe that earlier review stage; the ratified synthesized D2-R01–R12 record is current authority for this grill. No implementation or deployment proof is implied.

## Evidence interpretation and independent synthesis

The three reports below are preserved independent analyses. Their candidate clauses are proposals from their respective passes, not three competing authorities. The synthesized D2-R01–R12 clauses govern this review. In particular, final QA corrected these points:

1. A save timeout does not prove failure to commit. Distinguish definite rejection, uncertain result and revision conflict; read back before retry. Do not claim the former default is unchanged after an uncertain response.
2. Support agent keys are tenant-unique. Their user/profile linkage is nullable and the tenant/user index is nonunique; do not call the agent key itself nullable or nonunique.
3. New tenant-scoped preference storage enables RLS even when server-only grants deny browser access; service-role commands enforce self ownership.
4. Assignment/following never adds a recipient, but a staff member who is actually an admitted message participant is not excluded merely because of their role.
5. Personal defaults initialize new drafts after authoritative resolution. Existing drafts keep their audience. Manual edits use one current audience and a focused preset-change delta, not hidden per-mode recipient memories.
6. Native group transport needs an explicit P6/P17 submission/member relationship, common disclosure approved for every visible recipient, independent member authority/history and proved event attribution. This remains a required qualification, not an assumed provider capability.
7. The corrected abstract state experiment blocks send after a relevant incoming update until review. Most immutability events are deliberately no-ops. Key/digest distinctions, abstract reopen and in-memory preference examples do not prove real authorization, idempotency enforcement, persistence or synchronization.

No controlled Asym staff usability study, deployed RLS test, actual mail-client test or mixed-recipient provider experiment ran. Exact positive/negative/concurrency/migration/accessibility/provider proof is required in the main review's P01–P15 matrix before activation. The quoted claims below are bounded by these limitations.

## Root source/UI checks

In addition to the independent evidence: the current composer separates Reply and Internal note but has a static conversation-contact recipient caption, not a To/Cc editor. Current hooks store body/attachments per mode and reset on conversation changes; a save/send response is not proof of durable editable draft recovery. The personal preference must not copy the notification form's first-agent fallback, agent picker or loaded-data reset. Existing Base UI/base-maia shared dropdown/select/radio components are sufficient; no new UI library is justified. The current composer keyboard path must join the exact same audience validation and IME guard as the visible Send action. These are source observations and future requirements, not executed UI behavior.

## Independent reports

---

# Phase 26 D2 — independent preferences, database, and authorization review

Reviewed 10 September 2026. Scope: founder chooses **Reply all by default**, a personal staff default of Reply to sender, and an override for each individual email/draft. This is a read-only source and contract audit, not implementation or deployed database verification. Repository execution directory was verified as `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`; HEAD is `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Local D1 grooming records were read as accepted intent. No secrets, provider operations, migrations, or GitHub mutations occurred.

## Disposition and narrow permanent path

**Accept with required amendments.** The requested flexibility is small and useful. Separate three facts: the user's personal starting preference, the current draft's explicit audience, and the immutable admitted send audience. A default is initialization, never permission or a live subscription to a mutable setting.

Choose **personal within the current tenant, across devices**, not browser-only or account-wide across all tenants. Label the setting “Default email reply” with “For you in [tenant]”; offer just “Reply all” and “Reply to sender.” This is a product judgment consistent with Core's existing tenant-scoped personal preferences, not an existing governing decree about all UI preferences. The founder requested per-user behavior; the explicit tenant scope avoids one ministry's settings changing work in another ministry. It neither creates tenant/inbox/team override hierarchies nor allows administrators to edit another person's personal preference through this control.

Recommended persistence is one narrow typed Support preference record keyed by **(tenant_id, authenticated user_id)**, with a constrained two-value reply-default field, a concurrency revision and timestamps. Use an ordinary Core migration, canonical API command, and existing settings controls. Reuse the **pattern** of the CRM/contribution personal settings; do not store Support preferences inside CRM table-view settings, donor contact preferences, auth metadata, a team-editable agent row, or a new generic preference platform. A new small Support-owned record is justified because the existing `support_notification_preferences` has distinct team-editable notification semantics, a different identity key, and no safe self-only boundary. Avoid a broad notification-table rename/migration solely for this field.

An authenticated-user key is preferable to the current support-agent ID: `support_agents.user_id` and `profile_id` are nullable, the user index is nonunique, and current resolvers use email/string-ID matching. A staff email or assignment is not stable self-identity. The preference needs no new CRM person or support-agent mapping. A reply still requires the D1 server-resolved active Support actor and current access; saving a preference does not establish that authority.

This choice is economical: one two-value preference, one small personal settings row, the existing draft/send safety work, and no new permissions product or configuration hierarchy.

## Verified repository evidence

All locations below are repository-relative `path:line` references.

| Evidence                                                | Current source and significance                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1 — server identity contract                           | `openspec/specs/identity-and-access/spec.md:15` requires validated server-resolved identity, tenant, role, profile and memberships. `:35` requires application authorization plus RLS defense. UI hiding is insufficient.                                                                                                                                                                                                                                                                                                                                                                                       |
| E2 — current preference schema                          | `supabase/migrations/20260515025814_support_hub_core_modules.sql:426–446`: notification preferences have `(tenant_id,id)` PK, tenant-agent composite FK with cascade on agent deletion, `(tenant_id,agent_id)` unique index, notification boolean defaults. No reply default exists.                                                                                                                                                                                                                                                                                                                            |
| E3 — broad preference grants/RLS                        | Same migration `:524–573` includes notification preferences in broad authenticated SELECT/INSERT/UPDATE/DELETE and service-role ALL grants. Both UPDATE USING and WITH CHECK exist, but both check tenant/staff membership (or superadmin), not row ownership. Adding a narrower permissive policy without removing the broad one would not fix that.                                                                                                                                                                                                                                                           |
| E4 — current routes accept others' IDs                  | `apps/admin/app/api/admin/support/notification-preferences/route.ts:10–37`: GET lists all preferences, PATCH passes caller body. `packages/api/src/admin/support-hub/schemas.ts:269–277` accepts caller `agentId`. Route callback discards the resolved actor. `route-helpers.ts:31–59` validates coarse Support roles; `:66–74` binds tenant, not agent ownership.                                                                                                                                                                                                                                             |
| E5 — preference first-write race                        | `packages/api/src/admin/support-hub/adapter/supabase.ts:1257–1287`: GET scans tenant rows, finds agent, then writes existing or random ID. Generic `upsertRow` at `:173–182` arbitrates on `(tenant_id,id)`, not the separate `(tenant_id,agent_id)` uniqueness. Two initial saves may race and one fails; duplicate rows are constrained, but operation is not the intended natural-key upsert. No revision check exists.                                                                                                                                                                                      |
| E6 — unsuitable personal settings UI                    | `apps/admin/features/support-hub/components/settings/notifications/NotificationPreferencesForm.tsx:30–47` picks current agent or first agent and resets draft when loaded data changes. `:114–129` includes an agent picker. `:60–81` treats missing current record as defaults and dirty. This form currently manages agents' notification settings; it is not a self-preference form.                                                                                                                                                                                                                         |
| E7 — load state collapse risk                           | `apps/admin/features/support-hub/hooks/use-support-notification-preferences.ts:25–46` correctly exposes loading/success/error, but data becomes `[]` until success; caller must use status rather than infer “no saved preference.” The notification form does not distinguish those statuses before choosing defaults.                                                                                                                                                                                                                                                                                         |
| E8 — caches lack actor and tenant keys                  | `packages/database/query-keys.ts:47–71`: Support queries including preferences have global `admin/support/...` keys without tenant or acting user. This alone does not prove runtime leakage (cache lifecycle was not exercised), but is unsafe to reuse for per-user defaults without explicit session/tenant identity and invalidation.                                                                                                                                                                                                                                                                       |
| E9 — agent identity is not reliable preference identity | `supabase/migrations/20260515025814_support_hub_core_modules.sql:42–63` has nullable profile/user references and nonunique `(tenant_id,user_id)` index. `apps/admin/features/support-hub/lib/current-agent.ts:16–26` matches email or agent ID to UI user ID. `packages/api/src/admin/support-hub/route-helpers.ts:77–86` repeats matching server-side. `adapter/supabase.ts:222–229` drops `user_id`, `profile_id`, `is_active` from the agent projection.                                                                                                                                                     |
| E10 — inherited reply-author and audience gap           | `packages/api/src/admin/support-hub/schemas.ts:80–85` accepts caller-selected author, no source-message ID or recipients. `adapter/supabase.ts:904–939` looks up that author; constructs new headers using conversation externalContactEmail, empty CC/BCC, no In-Reply-To/References; stages new draft/queued row. `participantForAgent` at `:500–509` falls back to system if missing. This is existing D1 debt, not a working D2 implementation.                                                                                                                                                             |
| E11 — current draft model                               | `apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts:87–112`: mode-specific body/attachments in component state reset on conversation change. `:224–265`: Save draft creates a new message through send-reply API and resets local state. `supabase/migrations/20260515025814_support_hub_core_modules.sql:286–312`: messages have JSON author/body/headers, no explicit source-message FK, draft owner or revision, only JSON-object checks for author/body. Durable editable draft recovery was not demonstrated.                                                         |
| E12 — sound preference precedent, not a storage owner   | `supabase/migrations/20260611160000_crm_table_preferences.sql:1–17` defines server-owned, tenant/profile/table-keyed personalization. `:47–57` revokes anon/authenticated access and grants service-role. `packages/api/src/admin/crm/table-preferences/route.ts:169–183,211–227` derives tenant/profile from authorized actor. `service.ts:69–103` separately checks query error vs absent row. `supabase/migrations/20260526132000_contribution_operations_core.sql:15–23` similarly keys personal preferences by tenant/profile. These are feature-specific; neither is a generic Support settings registry. |
| E13 — current auth supports multi-tenant identity       | `supabase/migrations/20260226113000_authz_memberships_foundation.sql:45–66` stores active user/tenant/role memberships. `:158–201` membership helpers require active matching membership. Multiple memberships need not mean multiple preference rows per role.                                                                                                                                                                                                                                                                                                                                                 |
| E14 — installed DB generation                           | `supabase/config.toml:34` specifies Postgres major 17. PostgreSQL 17 official documentation was checked for RLS and upsert behavior.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

Targeted searches across `apps`, `packages`, `supabase`, `openspec`, and relevant `docs` found no implemented reply-all default/personal-reply-preference contract. This is scoped source evidence, not a claim about every external branch or deployed database.

## Material concerns and corrected clauses

Likelihood below is conditional on adopting the naïve implementation; no operational incident frequency is asserted.

### P1 — “Personal” can accidentally mean “another worker's”

**Severity:** High because it can quietly broaden future reply audiences; **likelihood:** high if existing notification save/UI are reused unchanged. E2–E4/E6/E9 establish the concrete paths. Any staff member can currently select another agent's preferences; tenant RLS protects tenants, not individual preference ownership. The same-tenant composite FK is good and must not be falsely reported missing.

**Effect:** narrows implementation, preserves B. **Permanent prevention / exact clause:** “The Support reply default belongs to the validated signed-in user in the active tenant. Only that user changes it through the personal preference command. The server derives tenant and user; request bodies cannot choose either, an agent, or an assignee. No fallback to first agent, email-matched agent, assignee, or system actor is permitted. Current Support access is independently checked. A preference does not grant Support access or any CRM capability.”

**Database proof:** primary key/unique `(tenant_id,user_id)`, tenant/user FKs, non-null constrained mode; own-user+tenant+current-access SELECT/INSERT/UPDATE policies if exposed, with both old-row USING and new-row WITH CHECK plus owner-key immutability. Prefer no direct authenticated mutation grants and a canonical self-only server command (as CRM preferences already do). If direct browser reads are allowed, explicitly own-scope them. Service-role bypass makes server actor checks mandatory; RLS alone cannot rescue an arbitrary-ID admin-client mutation.

### P2 — preference initialization can overwrite intent

**Severity:** High for sending to unintended copied recipients; **likelihood:** medium under late fetch, offline reconnection or settings edits during composition. E6–E8/E11 show analogous reset/default patterns. “No row,” “still loading,” “request failed,” and “unknown value from a newer client” are not the same.

**Effect:** required narrowing, preserves B. **Clause:** “A confirmed absent personal preference uses Reply all. A loading, failed, invalid or unavailable preference is not absence and must not silently initialize a wider audience. Staff may continue composing and explicitly choose Reply or Reply all for that draft while the setting is unavailable. Once the draft audience is initialized or explicitly changed, late preference responses, default edits, navigation, refetch and reconnect cannot change it. Changing the default applies only to subsequently created drafts.”

No global modal or loss of body is necessary. Display the state at the existing audience control only when unresolved. If the application uses a confirmed cached preference, it must belong to the same validated actor+tenant, and remain a visibly initialized draft snapshot, never a cross-session fallback. A saved draft always wins over initialization.

### P3 — default, draft audience, and send audience can be confused

**Severity:** High; **likelihood:** high if the server merely recalculates from latest preference when Send is clicked. E10/E11 lack the source-message/recipient input. A mode is an algorithm selection, not an immutable list of people.

**Effect:** required amendment. **Clause:** “Each draft retains the source email, effective reply mode, explicit To/CC audience and recipient revision. Per-email changes never rewrite the personal default. At admission the server validates current actor, conversation/inbox access, source and recipient policy, and atomically captures the exact reviewed recipient set and relevant content/attachment revision. Send/retry never recomputes recipients from the current preference, conversation contact, assignee or mutable CRM fields. Invalidated authority blocks sending with the draft preserved.”

Do not freeze the physical draft table design merely in this preference decision; require the domain outcome and integrate into D1's draft/send boundary. Reuse one authoritative recipient validation path at preparation/admission rather than separate client/server algorithms that drift. Mode-switching must preserve body and attachments while presenting actual recipients. Source-message changes are explicit and must not discard recipient edits silently.

### P4 — preference saves race or appear successful when lost

**Severity:** Medium (personalization; send still explicit); **likelihood:** medium with multiple tabs/devices and unreliable connections. E5 shows a concrete current first-save race. Exact-key atomic UPSERT fixes first-save uniqueness, but does not by itself prevent a stale retried write from overriding a newer choice.

**Effect:** narrow safeguard. **Clause:** “Preference changes update only the reply-default field, atomically by the user's tenant-scoped natural key. The command returns the authoritative value and revision. Stale saves cannot overwrite a newer confirmed value without a new deliberate action; the UI preserves unsaved intent and reports save failure. A settings response never mutates existing draft recipients.”

Use a small expected-revision conflict check/idempotent repeat rule, not an event-sourcing subsystem. After a lost response, read back before replaying stale intent; repeated same-value commands can return current success. A conflicting newer value refreshes the setting with clear recovery. This is not a reason for confirmation popups on normal saves.

### P5 — preferences/drafts cross tenants or users through cache and navigation

**Severity:** High; **likelihood:** conditional medium where one browser retains cache across identity or tenant switches; runtime switch behavior unproved. E8 shows unscoped keys. Existing D1 cache concern gains a specific D2 consequence: person B can receive person A's broader reply default.

**Effect:** required amendment. **Clause:** “Preference and draft query/cache/storage identities include active tenant and authenticated actor plus the appropriate draft/conversation identity. Logout, account switch, tenant switch and lost authorization clear or make the old state inaccessible. Late responses for an old context cannot apply in a new one. Revocation is checked again when dispatch is admitted; a saved default and support assignment cannot preserve revoked rights.”

Keep context identity in canonical shared data/query infrastructure; do not handcraft another feature-local Supabase client or unscoped localStorage key.

### P6 — existing drafts or old clients unexpectedly broaden their audience

**Severity:** High; **likelihood:** medium during rollout if a fallback fills missing mode with Reply all. E11 proves existing drafts may lack required source/audience review metadata, and E10 shows the old backend ignores per-email audience entirely.

**Effect:** rollout safeguard. **Clause:** “The new default applies to new qualified drafts only. Migration never reconstructs or broadens an old draft's audience from the conversation's current participants or a user's current default. Preserve any known audience; require review when source/audience evidence is insufficient. Existing queued/sent copies retain their admitted audience. Mixed-version clients that cannot preserve the explicit recipient contract cannot send through a legacy bypass.”

Use additive nullable/new columns or a new draft representation with deliberate compatibility; do not rewrite sent headers or historical authors. The kill switch stops new sends requiring unavailable recipient controls while leaving accepted-effect recovery intact. No rollback to silently sender-only backend on behalf of a Reply-all UI. Personal preference removal resets future drafts to product Reply all only when removal is intentional and successful; normal UI can simply save explicit Reply all rather than expose a confusing “inherit” state. Deactivating membership denies use regardless of a retained harmless preference. Deleting a preference must not cascade into conversation/send evidence.

### P7 — a noisy UI introduces hidden sticky state

**Severity:** Medium; **likelihood:** high if a “remember this” checkbox or confirmation is added to every reply. The user expressly requests effortless per-message variation. Existing notification form has a team-agent management model, inappropriate here (E6).

**Effect:** clarifies B. **Clause:** “Use one existing composer audience control showing Reply all or Reply and the actual audience, with a compact menu to switch for this draft. Personal settings expose one separate Default email reply field and tenant scope. Per-draft switching does not ask whether to remember the choice and never silently changes the default. Reopening the draft restores its chosen audience; starting a new draft consults the saved preference. If Reply and Reply all resolve to one external address, show a coherent one-recipient state without an unnecessary warning.”

Actual UI composition and test on Base UI/base-maia remain design proof, not claims that current browser behavior is accessible or polished.

## Required independent proof

1. **Self-only:** A changes own preference; B in same tenant cannot GET or mutate A's personal preference via body/path/query manipulation or direct table access. Another tenant cannot observe/mutate it. Attempt changing owner/tenant on an existing row fails. An admin control does not secretly act on another user.
2. **Identity:** agent recreation, reassignment, email change and shared-email matches do not transfer personal defaults; missing/ambiguous/inactive Support actor never becomes first agent/system author. Deactivated membership cannot use an otherwise valid stored preference to send.
3. **Precedence:** confirmed absent row initializes Reply all; sender-only preference initializes sender-only; per-draft override wins; change on device B affects new drafts on A after refresh, never an open/saved draft; per-message override does not write personal preference.
4. **Error states:** preference loading/failure/invalid revision never silently broadens audience; body remains usable; explicit draft choice works while settings cannot load; late response cannot overwrite explicit choice. Failed save never claims “Saved.”
5. **Concurrency:** two initial saves yield one preference row without natural-key collision; stale tab/retry cannot overwrite newer confirmed choice; unchanged duplicate save is safe. Two simultaneous sends still obey D1 send admission/collision/idempotency.
6. **Recipient snapshot:** actual source-message To/CC reviewed at draft time equals admitted delivery audience; latest personal setting/CRM email/assignee changes cannot alter a queued retry. Intentional source change is explicit and preserves body.
7. **Scope:** warm caches, in-flight queries, browser back/forward and tenant/user switches cannot restore another scope's preference or draft. Same draft on another device restores mode+audience.
8. **Migration:** old drafts with known audience preserve it; unknown source/audience requires review; existing sent/queued records unchanged; old clients cannot silently ignore explicit recipients; rollback never broadens audience or duplicates admitted delivery.
9. **UX/accessibility:** keyboard/screen reader can discover mode, view actual recipients and switch it; compact/mobile layout does not hide who receives mail; preference scope is understandable; recipient switch preserves draft body/attachments and focus. The settings choice is persisted across authenticated devices without notification-table agent-picker confusion.

These are required implementation acceptance obligations. They were not executed during this read-only grooming review. Static source and test search found no D2 feature tests; existing unrelated preference tests do not prove this behavior.

## Ordered synthesis for parent review

- **Before D2 is recorded:** resolve product semantics as Reply-all product default → tenant-scoped self preference → explicit draft override; confirm separate persisted draft/send audience and no noisy remembering UI. These preserve the founder's answer. Do not mark additional significant scope choice as separately ratified before presenting corrected language.
- **Capture in future specification/design:** self-only owner key, source-email-bound audience, loading/error distinction, fixed draft snapshot, no hidden audience changes, exact cache scope, API/data ownership, migration rules and acceptance matrix above. No formal spec/tickets are created here.
- **Required implementation before inbox activation:** D1 actor/draft/admission controls; narrow preference storage/command, correct unique key and concurrency rule, scoped cache, recipient version preservation, compatible migration, negative authorization and production-shaped race tests.
- **Operational monitoring only after invariants pass:** Product engineering owns preference load/save failures. Any failure that silently changes an initialized audience is a correctness defect and release blocker, not a tolerated metric. Support operations owns reports of an unexpected recipient; one reproducible violation triggers send-path containment and incident review. No numeric usage/performance SLO was invented. Routine preference errors are visible in UI and normal error telemetry; thresholds for paging are not needed to justify this low-impact preference feature.

## Primary technical references

- PostgreSQL 17 [row security policies](https://www.postgresql.org/docs/17/ddl-rowsecurity.html): policies apply to visible and new row states; broad permissive policies combine with OR; privileged roles bypass RLS. This supports auditing effective grants/policies, not assuming an added self policy restricts the existing broad staff policy.
- PostgreSQL 17 [INSERT / ON CONFLICT](https://www.postgresql.org/docs/17/sql-insert.html): atomic UPSERT guarantees concern the selected unique arbiter; the current notification save uses an ID arbiter different from its agent uniqueness. It does not provide stale-write protection automatically.

Version/date matters: local Supabase configuration selects Postgres 17; docs were read on 10 September 2026. No hosted database engine/version was inspected.

Memory used only for user/workflow constraints (registry lines 27–28, 418); all product/schema findings above are current source reads. No memories were changed.

---

# D2 independent recipient, draft, and delivery-state adversarial review

Checked 10 September 2026. Scope: the founder chose **Reply all by default, a personal staff preference for Reply to sender, and a per-email override**, with a quiet, effortless interface. This note supports the root review; it is not a formal specification, implementation, or evidence of founder ratification of new material amendments.

**Disposition: Accept with required amendments.** The selected default is viable. The main danger is treating a default as a continuously recomputed audience, an access grant, or a provider delivery contract. The strongest alternative remains sender-only with an obvious Reply all. It reduces accidental expansion but causes accidental omission in group correspondence. No Asym usage study establishes the frequency or cost of either error. The founder's desired group-continuation behavior establishes the product choice; safeguards must address its actual consequences.

## Evidence and authority

Execution directory verified in Ubuntu-24.04 at `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`. HEAD and GitHub develop both remained `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. The existing uncommitted D1 context, ADR, and grill files were preserved. Live open PR head checks found #1335 support collections at `e1c86e1a30f479363960eeb35500112665e16bb3`, #1336 outbound adapter at `3b2827ffcf184bf767664018efedda317c7da03c`, and predecessor #1564 at `0624ca3841ea98e618fed0e2c490d24c0ef1d9c1`; their proposed branch contents were not substituted for develop.

Read root AGENTS, canonical grill-with-docs/grilling/domain-modeling skills, the ratified D1 decision log and R1-R15 review, D1 evidence appendix, Q2 preparation, current composer/API/adapter, inbound header capture, relevant outbound OpenSpec contract, and personalization migration precedent. No runtime code, provider operation, database session, secret, or GitHub state was changed. This is source inspection and transition reasoning; no browser or provider result is claimed tested.

Repository references below use the exact develop hash:

- **C1** [Reply write](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L904): currently queues one email using `conversation.externalContactEmail`, an agent-derived From, null In-Reply-To, empty References/CC/BCC. It does not implement D2.
- **C2** [Reply schema](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/schemas.ts#L80) and [input type](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/types.ts#L91): no reply-target ID, exact audience, reviewed version, or idempotency input. Caller-selected author remains a D1 finding.
- **C3** [Composer hook](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts#L87): two local body/attachment modes; conversation change resets both at 107-112; send at 192-220 freezes a local body closure but creates another command on retry without a durable reply identity; queued response announces Reply sent. Existing mode isolation is useful, but is not recipient/draft recovery proof.
- **C4** [Composer UI](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/ConversationComposer.tsx#L112): displays a conversation contact name as recipient, no To/CC editor; notes are a separate tab, and agent mentions currently occur only in notes. Do not falsely claim current reply mentions add recipients.
- **C5** [Inbound capture](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L1293): To/CC/BCC survive into message headers at 1344-1352, but this Support routing input does not carry Reply-To. Header capture does not prove admission, accurate forwarding interpretation, or ownership.
- **C6** [Support notification preference form](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/settings/notifications/NotificationPreferencesForm.tsx#L24): agent dropdown and first-agent fallback; [adapter](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L1257) lists all tenant preference rows and selects caller-supplied agent. This is not an appropriate self-personalization contract to copy unchanged.
- **C7** [CRM preference precedent](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260611160000_crm_table_preferences.sql#L1): server-owned, tenant+profile scoped, personalization cannot override capabilities. Reuse the architectural principle; do not store Support reply behavior in CRM table settings or add a generic preference engine just for D2.
- **C8** [Sender/reply ownership](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#L804): governed independent Reply-To destination, no request-level From/Reply-To/header/account overrides, immutable prepared connection and identity. This concerns outgoing mail identity; it is distinct from interpreting incoming Reply-To as an external destination candidate.
- **C9** [Per-recipient identity](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#L1023): one intent/member authority and immutable prepared payload; [batch member rule](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#L1288): independent recipient outcomes and recovery, no shared-failure rewrite. These are checked-in proposed OpenSpec intent carried into D1, not proof the runtime implements them.

Primary external sources checked today:

- **V1 — Gmail Computer help:** users can set Reply or Reply all in Default reply behavior, while individual messages retain both actions. This demonstrates a familiar two-level model; it does not establish donor-care task success or behavior across all mobile clients. [Google Help](https://support.google.com/mail/answer/6585?co=GENIE.Platform%3DDesktop&hl=en)
- **V2 — Outlook on the web:** Mail > Compose and reply offers a personal Reply/Reply all default for the reading pane. Suitable precedent for one quiet personal setting, not a global tenant policy. [Microsoft Support](https://support.microsoft.com/en-us/outlook/reply-settings-in-outlook-on-the-web)
- **V3 — Front:** Reply all is scoped to the selected message. Configurable default is explicitly mobile-only because desktop/web display both actions. Do not cite it as evidence Front offers a universal desktop default preference. [Front Help](https://help.front.com/en/articles/2247)
- **V4 — RFC 5322 sections 3.6.2, 3.6.3, 3.6.4 and 5:** reply-address hints, visible versus blind recipient fields, parent-message threading, and BCC exposure hazards are distinct. The RFC explicitly does not prescribe every automatic reply-all UI behavior. This supports typed evidence and careful destination handling, not a claim a particular UX is standards-mandated. [RFC 5322](https://www.rfc-editor.org/rfc/rfc5322.html)
- **V5 — RFC 5321 section 2.4:** domain case-insensitivity differs from local-part semantics; preserve the local part rather than inventing universal alias equality. Do not strip dots or plus tags to identify a human or collapse unknown mailboxes. [RFC 5321](https://www.rfc-editor.org/rfc/rfc5321.html)
- **V6 — Resend Send API:** To/CC/BCC arrays are available and one response email ID is returned; idempotency is request-level and expires after 24 hours. Its To parameter states max 50, without establishing a combined To+CC+BCC product limit. Ordinary group mail transport is possible in principle; exact Core member mapping still needs qualification. [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email)
- **V7 — Resend event/retrieve docs:** delivery/bounce examples carry `email_id`, `message_id`, and a `to` array; retrieve exposes one `last_event`. The indexed delivered documentation called `to` impacted recipients; the live page returned examples without that full field explanation. Neither form alone proves mixed To/CC/BCC event behavior. Do not project one aggregate result onto all members. [Delivered](https://resend.com/docs/webhooks/emails/delivered), [Bounced](https://resend.com/docs/webhooks/emails/bounced), [Retrieve](https://resend.com/docs/api-reference/emails/retrieve-email)

## Required deterministic semantics

These clauses clarify the requested behavior without introducing another CRM, subscription list, workflow engine, or hidden team policy. Names here describe facts and need not become literal schema columns.

**S1 — One default, personal initialization, explicit draft authority.** “Reply all is the product default for a new ordinary external-email reply. Each active support staff user can persist Reply all or Reply to sender as their own default for the current tenant. A per-email choice changes only that draft. The system does not infer a preference from past sends, remember a conversation-specific mode, apply an assignee's preference, or add a tenant/inbox/role policy hierarchy. A saved preference initializes new drafts; it never rewrites an existing draft, unsent intent, or historical reply.”

**S2 — Persistence is honest and self-scoped.** “The server derives tenant and user from trusted current context. A user may alter only their own personalization; a body-supplied user/agent/tenant cannot redirect it. No cross-tenant cache or local-storage preference is an authority. A missing preference row means the documented Reply-all default; a failed or unresolved read is not evidence of a missing row. During unresolved preference loading, staff may write and explicitly select the visible reply mode, but sending requires a resolved explicit audience. Delayed reads never overwrite an already selected draft audience. Saving is acknowledged only after durable success; failure preserves the prior saved value and allows an explicit retry. Existing drafts remain usable regardless of preference-service failure.”

**S3 — Concurrent settings changes are small and predictable.** “Persist only the preference field changed. A successful response returns the canonical value and revision. Stale concurrent writes cannot silently clobber a newer acknowledged choice: use the existing optimistic version/conditional-update pattern and a concise inline reload/retry state. Do not event-source every preference click. A setting update never invalidates an otherwise safe draft or causes a send collision.” This is a proposed concurrency safeguard, not a new admin approval flow.

**S4 — The reply target is a message, not a changing conversation contact.** “A new reply targets one identified admitted external message, shown in context; ordinary composer entry selects the latest eligible external message visible at initialization. A later incoming message, Party merge, changed CRM email, reassignment, inbox move, or preference refresh cannot silently retarget the draft. Reply from a specific older message explicitly selects that message. Changing a nonempty draft's target preserves body/attachments and requires review of any changed audience or quoted context. Notes and system events are never external reply targets. A follow-up to an outgoing message, if provided, uses an explicitly reviewed external audience from that message; it must not reply to the staff sender or reconstruct an older broader audience.”

**S5 — Derive only the selected message's permitted visible audience.** “Reply to sender means the selected message's admitted external reply endpoint, using parsed, policy-qualified incoming Reply-To where applicable and From otherwise. Reply all adds eligible visible To/CC endpoints from that same message, deduplicates them, and removes proved receiving/forwarding/self-route aliases. It never includes BCC, old participants, CRM-related people, organization members, assigned staff, followers, note mentions, address-book suggestions, or addresses extracted from a quoted body. A valid Reply-To different from From is shown clearly as the actual destination; conflicting, malformed, multiple, or safety-rejected endpoint evidence needs recipient review rather than hidden substitution. A support address absent from To/CC is not by itself proof of BCC, because forwarding can have that shape.”

**S6 — Preserve email distinctions without inventing identity.** “Names are display labels. Recipient endpoint observations, CRM links, authenticated users, represented organizations, and authorization remain separate. Canonicalize transport syntax using the approved parser; preserve source spelling and provenance; do not invent local-part dot/plus alias rules or merge two CRM people because addresses appear similar. Recognized own aliases must come from the tenant's proved messaging configuration, not a broad same-domain filter, so legitimate colleague or missionary addresses are not removed.”

**S7 — Current audience is explicit; manual edits must survive intelligibly.** “Maintain one exact audience for the current draft. A clean Reply/Reply-all toggle replaces the derived audience from its pinned reply target while preserving body and attachments. If recipient edits would be discarded or previously removed recipients reintroduced, show the concrete added/removed addresses before applying that preset, with a compact inline review and undo. Do not keep hidden independent recipient snapshots per mode. After manual edits, the UI must not say Reply to sender while sending a CC, or imply an unmodified Reply-all set. The send button acts on the exact visible reviewed recipients, never recomputes them from the current preference.”

**S8 — Treat new disclosure honestly.** “Reply all continues the selected message's ordinary admitted group; it is not blanket consent to include private notes, all prior history, protected CRM facts, or protected documents. Quote only reviewed, authorized content and never the mixed conversation timeline. In positively identified blind-copy intake, default behavior must not silently reveal the privately copied Support address to the visible group: require a concise audience review before a broader reply. Do not misclassify ordinary forwarding as blind-copy evidence. A material recipient change triggers focused review, not a universal extra confirmation modal.” The blind-copy exception is a material narrowing of the general default and should be explicitly surfaced in the corrected decision, not hidden as an implementation detail.

**S9 — One send approval and durable recipient members.** “At send acceptance, one canonical command atomically binds the authenticated actor, current permissions, selected target, reviewed conversation revision, exact body/attachment revision, ordered visible To/CC audience and recipient authorities, with one durable reply identity and required audit/communication intents. The mode preference is initialization provenance, not the dispatch authority. Same-identity retries return the same result only for the same immutable approval; a changed audience/content is a new deliberate reply. Freeze prepared sender/reply/connection and payload. Revocation or classification change stops unsent affected work through the existing owner fence; it does not rewrite prior provider evidence or add replacement recipients.”

**S10 — Group transport must preserve recipient-specific truth.** “Qualify a Phase 6/17 grouped submission/member contract for ordinary visible To/CC continuation. Every admitted recipient copy has its own authority, semantic identity, evidence and history. One provider group submission must not become N submissions of the whole group; N private submissions must not masquerade as normal group-visible Reply-all. Map provider outcomes only to the affected provable member set; unknown mapping remains indeterminate. Partial failure must not resend to successful recipients, and no preference change may alter a replay envelope. If the existing owner contract cannot express the qualified mapping, amend that owner contract explicitly before egress; do not bypass it in Support.”

**S11 — Size and asynchronous safety.** “Recipient limits are checked before approval against the qualified producer/provider contract; show an actionable bounded error without truncating, silently splitting, or converting group replies into campaigns. Every changed-draft save carries its expected revision. In-flight saves, preference reads and send responses cannot clear, replace, or attach a later draft revision or another tenant's draft. A recovered legacy draft lacking a trustworthy target/audience requires visible audience selection; neither current default nor CRM email is a historical backfill oracle.”

## Material findings, severity, likelihood, consequence

Severity: High means plausible disclosure, duplicate delivery, lost draft, or false authoritative history; Medium means substantial friction or maintenance risk. Likelihood is conditional reasoning, not incident frequency.

| Finding                                           | What fails and why it matters                                                                                                     | Severity / likelihood                                                   | Evidence                                                                     | Effect on D2                                                                | Permanent prevention / exact language |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| F1 Default becomes live audience rule             | A staff preference or arriving email broadens an already written private answer after review.                                     | High; ordinary asynchronous updates if implemented naïvely              | C1-C3, D1 R6/R7                                                              | Amend, retain B                                                             | S1-S4, S9                             |
| F2 Personal preference owns somebody else's state | Agent selector, first-agent fallback, or cross-tenant cache writes another worker's default.                                      | Medium; likely if copied from current notifications UI                  | C6-C7                                                                        | Amend ownership                                                             | S2-S3                                 |
| F3 Missing state equals missing preference        | Slow/error read falls back to all after user had selected sender; eventual load changes recipients mid-compose.                   | High; expected in real mobile networks                                  | Async counterexample, C3                                                     | Amend initialization                                                        | S2 and S11                            |
| F4 Manual-edit mode ambiguity                     | Staff removes James, toggles mode and James silently returns, or sender-only label retains a manually added CC.                   | High; plausible routine editing                                         | State counterexample; V1-V3 show controls but do not document this invariant | Amend clarity                                                               | S7                                    |
| F5 Current contact replaces message audience      | A CRM merge/change or third-party reply makes externalContactEmail wrong; historical CCs return.                                  | High; normal CRM and group-message changes                              | C1,C5 and D1 identity boundary                                               | Amend target model                                                          | S4-S6                                 |
| F6 Reply-To/BCC/own alias misinterpretation       | Sender-only unexpectedly sends to a different mailbox; blind copy is exposed; broad same-domain exclusion drops legitimate users. | High; uncommon inputs but normal email constructs                       | C5,V4,V5                                                                     | Narrow qualified default only                                               | S5-S8                                 |
| F7 Group is mistaken for permission               | Ordinary reply-all copies receipts, confidential prior text or CRM details to everyone.                                           | High; conditional on protected content                                  | D1 R6/R8/R10, C8-C9                                                          | Retain B with content boundary                                              | S8-S9                                 |
| F8 Per-recipient transport mismatch               | Full audience is sent N times or copied people disappear from normal Reply-all; aggregate delivery status lies for mixed success. | High; deterministic if naïve implementation is adopted                  | C9,V6,V7                                                                     | Required owner integration amendment/qualification, not reason to discard B | S10                                   |
| F9 Replay after audience change                   | Timeout followed by new recipient/default creates another externally visible send.                                                | High; network loss/retry normal                                         | C2,C3,C9,V6                                                                  | Amend durable approval                                                      | S9-S10                                |
| F10 Irrecoverable draft or backfill inference     | Mode/target changes erase body, delayed save clears new edits, migrated draft gains guessed recipients.                           | High; current conversation reset verified; future migration conditional | C3; current persisted reply schema C2                                        | Amend recovery/rollout                                                      | S4,S7,S11                             |
| F11 Scope inflation                               | One preference becomes team/admin/inbox/AI rules or a contact-sync system.                                                        | Medium; preventable design temptation                                   | C7, D1 platform boundaries                                                   | Constrain design                                                            | S1,S6; no new engine/CRM              |
| F12 Recipient growth hidden by UI                 | Huge header sets overwhelm mobile composer, provider cap fails after staff sees success, or silent split broadens side effects.   | Medium-to-High; recipient count dependency                              | V6 only To max documented; C4 no recipients control                          | Add bounds and honest display                                               | S11                                   |

## Transition counterexamples and required proof matrix

These are falsifiable acceptance cases, not passed tests. The parent may run a paper/state-model check against them; it must not call that production verification.

| ID  | Before and action                                                                             | Required observable outcome / negative proof                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T01 | Sarah→support, CC James; no personal row                                                      | New reply has Sarah and James, own support address removed; useful one-step Send after composition.                                                           |
| T02 | Same input, personal sender default                                                           | Sarah only; Reply all changes this email only; next new draft still sender.                                                                                   |
| T03 | Open existing all-draft, save personal sender default elsewhere                               | Existing draft still same recipients; next newly initialized draft sender.                                                                                    |
| T04 | Start composing while preference fetch is slow; explicitly choose sender; all default arrives | Audience remains sender; no hidden expansion; correct saving/error state.                                                                                     |
| T05 | Preference lookup fails                                                                       | Body editing available; retry or explicit current-message audience lets staff continue; failure not silently interpreted as no preference.                    |
| T06 | Preference save fails                                                                         | Prior durable choice remains; no Saved claim; current draft unaffected; retry is self-scoped.                                                                 |
| T07 | Two tabs write different values using same version                                            | One wins; stale second update receives a clear conflict and may deliberately retry; never clobber silently.                                                   |
| T08 | All-draft Sarah+James; James writes separately only to support                                | Old draft does not silently retarget or widen; send collision surfaces relevant new message; new reply to James excludes Sarah.                               |
| T09 | Remove James manually, switch sender then all                                                 | No unexpected silent restoration; recipient diff shown when discarding edits; body/attachments preserved.                                                     |
| T10 | Sender draft manually adds James                                                              | Label/audience makes both recipients clear; no misleading sender-only state.                                                                                  |
| T11 | Click reply to older message while a nonempty draft exists                                    | Existing draft content is retained; target and recipient changes visibly reviewed; no hidden recopy of historical group.                                      |
| T12 | Switch Reply→Note→Reply                                                                       | Private note remains separate; reply audience/body restored; note cannot acquire email recipients or be submitted as reply.                                   |
| T13 | Change CRM contact email, merge Party, relink/unlink, reassign support                        | Draft audience and original message observations do not change; current CRM access is reauthorized separately.                                                |
| T14 | Sender has Reply-To different from From                                                       | Exact destination is visible; qualified ordinary alias works without account creation; ambiguous/unsafe endpoint never silently substituted.                  |
| T15 | BCC appears in stored input, or support positively known privately copied                     | BCC never added by Reply all; broad reply cannot silently reveal private participation; ordinary forwarding without such evidence is not wrongly quarantined. |
| T16 | Proved own alias and legitimate same-domain missionary both appear                            | Own routes excluded, legitimate endpoint retained subject to purpose/content permission; no domain-wide blanket removal.                                      |
| T17 | Same endpoint in To and CC; local parts differ by case/dot/plus                               | Exact duplicate delivered once with deterministic visible placement; no unproved identity/alias collapsing.                                                   |
| T18 | New CC with message containing earlier private quoted exchange                                | Reply audience does not grant the newcomer earlier content; preview shows exact permitted newly authored/quoted/attached content.                             |
| T19 | User loses permission or tenant switches with draft open                                      | No cross-tenant cache/draft exposure or send; safe draft handling follows access policy; no new actor/tenant body override.                                   |
| T20 | Two send clicks, lost response, then replay                                                   | One durable reply effect and one recipient member per admitted endpoint; original approval returned.                                                          |
| T21 | Accepted send then preference/audience/body edit                                              | Accepted intent remains frozen; later edits are another draft; old completion cannot clear new draft.                                                         |
| T22 | Group Sarah delivered, James bounced, event arrives out of order                              | Member truth differs correctly; no blanket delivered; retry only under exact permitted remaining-member contract; never resend Sarah.                         |
| T23 | One provider email ID for multiple To/CC recipients                                           | Qualification proves recipient evidence mapping and ordinary mail-client Reply-all; N provider requests containing N complete groups forbidden.               |
| T24 | Safety revocation after preparation but before external dispatch                              | Definitely unsubmitted work blocked/cancelled under owner fence; possibly submitted is reconciled; no fabricated recall.                                      |
| T25 | Recipient bound reached/exceeded, malformed header or CRLF injection                          | Boundary accepted, excess/invalid rejected before approval with retained draft; no silent truncation/split.                                                   |
| T26 | Restore old draft without audience/target fields                                              | Review required before send; never fill from newly chosen default or today's CRM record.                                                                      |
| T27 | Offline/mobile, keyboard, zoom; narrow To/CC display                                          | Staff can identify every outgoing endpoint, edit mode and recipients without losing focus/content; actual audience not concealed by counts alone before Send. |

## Ratification boundaries and implementation order

Already chosen by founder: Reply-all product default, a persistent personal sender/all choice, current-email override, a quiet clear interface. D1 already ratifies owner authorization, visible exact recipients, private-note isolation, draft retention, collision protection, immutable dispatch, per-recipient communication history and recovery. These must not be presented as new optional features.

Clarifications preserving intent: personal self-only server ownership, tenant scope, defaults initialize only new drafts, current draft wins, failed saves are honest, no auto-learning or hidden per-thread settings, deterministic manual edits, own-alias exclusion, no automatic BCC inclusion, no CRM audience expansion.

Material amendments to surface for explicit confirmation with the whole corrected decision: the known-private-copy review exception; any concrete restriction on external recipient addition beyond existing authorization; and any required amendment to Phase6/17's exact provider-submission/member model. D2 does not authorize arbitrary new recipients, outbound BCC functionality, group subscriptions, mass reply automation, new channels, or autonomous AI recipient selection. Do not silently treat these as ratified because some vendors offer them.

Permanent path: (1) Record D2 with exact initialization versus audience distinction; (2) resolve owner group-delivery mapping and preserve D1 authorization/command boundaries; (3) establish target/audience/draft and self-preference contracts with migration behavior; (4) build one clear composer control and personal preference in existing UI; (5) prove transitions, actual multi-recipient mail behavior, per-member provider outcomes, mobile/keyboard usability and failure recovery before activation. No generic rule engine, policy hierarchy, or parallel CRM is needed.

No missing safety requirement is monitor-only. After qualification, diagnostics may monitor **any** wrong-recipient effect, duplicate recipient delivery, note egress or cross-tenant preference/draft access; owner is messaging/platform on-call with security owner for disclosure; response is fence affected writer, preserve evidence, investigate and repair through explicit lineage. Preference save failures are an operational signal: any failed save remains immediately visible to its user; sustained elevated failures use the existing platform API error-budget alert and owner, rather than inventing an unsupported numeric D2 SLO.

---

# D2 vendor and UX adversarial evidence

Evidence checked 10 September 2026. This independent research supports the Phase 26 grill decision about a Reply all default, a staff member's personal default, and a one-reply override. It is not a formal specification, implementation, or a claim of tested Asym usability. No account, provider, message, DNS, or repository mutation was performed. D1 and the Q2 evidence artifact were read; Core source verification is delegated to the parallel repository review.

## Disposition and strongest alternative

**Accept with required amendments.** The requested behavior is ordinary, bounded email functionality with direct precedent in Zoho Desk and mature mail applications. It does not require a generic preferences engine, per-inbox defaults, per-conversation remembered modes, recipient intelligence, or a donor portal. The strongest alternative remains a fixed Reply to sender default with visible Reply all. That avoids an initially broader audience but adds a recurring action for group correspondence and cannot satisfy staff who reasonably prefer a different default. There is no measured Asym support-traffic mix or donor-care usability study establishing which default minimizes aggregate errors. The founder's choice settles the product preference; explicit audience review, stable drafts, and disclosure boundaries make it defensible.

The phrase **default** must mean a convenience when beginning a new reply. It is neither a sending policy nor a source of recipient authority. A staff preference cannot override safety, alter other staff's preferences, rewrite an existing draft, or automatically follow recipients across CRM relationships.

## Selected primary product evidence

All sources below are official product/help or standards documentation except the explicitly marked community report. Documentation describes supported behavior, not internal architecture or empirical usability superiority. No vendor account was exercised.

| Source, date and applicable surface                                                                                                                                                                                                                            | Verified documented behavior                                                                                                                                                                                                                   | Adopt, simplify or reject for Asym                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Zoho Desk — Ticket Default Preferences](https://help.zoho.com/portal/en/kb/desk/accessibility-and-preferences/articles/setting-up-ticket-default-preferences), undated page checked 2026-09-10; email tickets; no edition gate stated in the relevant passage | Users select Reply, Reply All or Forward as their default; changes are user-specific and do not appear for other agents. The setting is accessed through personal Preferences.                                                                 | **Adopt the two-scope distinction.** Asym needs only Reply all versus Reply to sender; do not copy arbitrary action reordering, Forward-as-default, or public-note defaults. Product benefits on the page are vendor claims, not measured outcomes.                                                                                                            |
| [Gmail — Reply to messages](https://support.google.com/mail/answer/6585?co=GENIE.Platform%3DDesktop&hl=en), live web/Computer instructions, checked 2026-09-10                                                                                                 | The General setting selects Reply or Reply all as default, changing button order; individual message actions remain documented. Reply all includes sender plus visible To/Cc.                                                                  | **Adopt recognizable wording and personal defaults.** This supports familiarity, not a claim that Gmail has the proposed Asym draft persistence or tenant semantics.                                                                                                                                                                                           |
| [Microsoft — Reply settings in Outlook on the web](https://support.microsoft.com/en-us/outlook/reply-settings-in-outlook-on-the-web), checked 2026-09-10; explicitly applies to Outlook.com and Exchange Server 2016/2019 web                                  | Mail > Compose and reply offers Reply or Reply all for the reading-pane default.                                                                                                                                                               | **Adopt personal setting separate from composing.** Do not claim these exact navigation steps cover every Outlook desktop/mobile release.                                                                                                                                                                                                                      |
| [Front — reply, forward and resend](https://help.front.com/en/articles/2247), edited 2025-09-30                                                                                                                                                                | Reply and Reply all apply to the selected message; desktop/web show both for messages with multiple recipients. A configurable reply default is documented **only for mobile**.                                                                | **Adopt message-scoped addressing and obvious actions.** Do not cite Front as a desktop personal-default precedent. A compact selector can fit Asym without copying Front's complete toolbar.                                                                                                                                                                  |
| [Help Scout — email notification commands](https://docs.helpscout.com/article/67-respond-to-email-notifications-to-take-action-in-help-scout), updated 2025-08-25                                                                                              | This particular email-notification workflow is Reply All by default; `@nocc` removes copied recipients.                                                                                                                                        | **Adopt flexibility, reject command syntax for ordinary Asym composition.** This is not proof of every Help Scout web/mobile default. Staff shouldn't memorize an email command to change audience.                                                                                                                                                            |
| [Zendesk — email clients, CCs and followers](https://support.zendesk.com/hc/en-us/articles/4408824667930-Best-practices-for-using-email-clients-with-CCs-and-followers), checked 2026-09-10; ticket notification workflow                                      | Internal followers and external CCs differ. The guidance warns that agent CCs expose their email to customers and describes requester Reply versus Reply all affecting ticket CCs.                                                             | **Adopt the distinction between internal collaboration and external recipients.** Do not map email Reply to an internal-note command or adopt hidden ticket-wide subscription semantics.                                                                                                                                                                       |
| [HubSpot — updated Help Desk composer](https://knowledge.hubspot.com/help-desk/use-the-updated-reply-editor-in-help-desk), updated 2026-08-21; **beta**, Service Hub Professional/Enterprise                                                                   | Associated records appear beside the conversation; default reply targets the most recent message with a per-message reply action. Drafts are personal. The beta also automatically adds an @mentioned contact in an email body as a recipient. | **Adopt contextual CRM navigation and durable personal drafts; reject implicit recipient addition from content mentions.** Names appearing in content or CRM are not an audience change. No claim about beta availability for every account.                                                                                                                   |
| [Freshdesk — Ticket details enhancements](https://support.freshdesk.com/support/solutions/articles/50000013902-ticket-details-enhancements), modified 2026-05-25; Unified Inbox with multichannel prerequisites                                                | The updated composer exposes To/Cc/Bcc, autosaves drafts across refresh/close, and retains quick-list context.                                                                                                                                 | **Adopt visible recipient fields and continuity.** Do not infer a particular draft schema or that those behaviors alone prove accessible implementation.                                                                                                                                                                                                       |
| [Freshdesk — remove CC](https://support.freshdesk.com/support/solutions/articles/236739-how-to-remove-cc-from-a-ticket-), modified 2023-07-21 with current Omni version warning                                                                                | The page says removed CCs do not appear in subsequent replies unless re-added by requester or staff.                                                                                                                                           | **Use as an edge-case prompt, not Asym's authority.** Asym's current draft must retain a removal across rerender/reopen. Future replies follow the actual newly targeted message; no perpetual suppression list is inferred. The older article is not proof of every current Omni behavior.                                                                    |
| [Freshdesk — perform ticket actions](https://support.freshdesk.com/support/solutions/articles/231527-perform-ticket-actions), current documentation checked 2026-09-10                                                                                         | Flexible Email Recipients enables multiple To recipients; it documents up to 50 To/Cc/Bcc recipients, and removing the requester from all fields causes the response to be threaded as a private note.                                         | **Reject recipient-driven conversion of message type.** Asym's direct reply to a CC author remains an external reply. Fifty is this vendor's limit, not an automatically suitable Asym limit.                                                                                                                                                                  |
| [Kustomer — multiparty email conversations](https://help.kustomer.com/en_us/multi-party-email-conversations-Hyz_fQhEle), official indexed help content, last update June 2025; email channel                                                                   | It distinguishes primary customer from participants; the full conversation is on the primary timeline with links from participants. It also documents deleting a participant profile removing their messages.                                  | **Adopt explicit sender/participant identity and context links; reject destructive history coupling.** Core CRM deletion must not silently rewrite support history. The direct English page did not expose text to the fetcher; the official category index and localized URL returned this English content. This is documented behavior, not a runtime check. |
| [Kustomer — March 2025 releases](https://help.kustomer.com/en_us/march-2025-releases-H1tMd8mike), March 18 release; Postmark app v1.1.18                                                                                                                       | Sender attribution was corrected to show the actual message sender, rather than the customer whose timeline contains the conversation; the release was not retroactive.                                                                        | **Adopt correct actual sender attribution; preserve historical limitations explicitly.** This is concrete evidence that timeline owner and sender differ. It is a bounded release note, not proof of current behavior for every email adapter.                                                                                                                 |
| [Intercom — start a conversation](https://www.intercom.com/help/en/articles/6433002-start-a-conversation-from-the-inbox), updated “this week” when checked 2026-09-10; Inbox users, custom From permission required                                            | The page distinguishes CC/BCC, internal mentions, company association, and metadata. Full-history inclusion can expose old exchanges to newly copied people. Fin has separate configurable reply scope and CC behavior.                        | **Adopt explicit visible audience and metadata; reject automatic historical disclosure and human-preference inheritance by automation.** Fin settings are AI/workflow settings, not proof of a per-human preference. Do not introduce AI, group portals or send-separately campaigns for D2.                                                                   |

Intercom's separate [email threading page](https://www.intercom.com/help/en/articles/7996715-email-threading) contains conflicting claims about unfamiliar senders being automatically added, already recorded in D1/Q2. This review does not resolve that inconsistency by guessing; Asym's no-silent-widening rule stands independently.

The nonprofit setting does not provide evidence that all copied people are household members, representatives, or authorized receipt recipients. D2 needs no proprietary nonprofit customer model. Those are Core Party/relationship and document/giving owner questions. Requiring the same audience controls for donors, church contacts, missionaries, and other legitimate requesters preserves ordinary email without inventing ministry workflows.

## Feedback and evidence limits

A [Zoho community request](https://help.zoho.com/portal/en/community/topic/set-reply-as-default) asks to replace the Reply all default with Reply. The retrieved page exposes no usable publication date, version, response history, sample size, or incidence data. It is a direct report of a preference/discoverability need, not evidence of an unresolved current Zoho defect: the present official preference documentation answers that need.

No controlled Asym usability study, measured support recipient distribution, accessibility browser trial, error-rate estimate, donor survey, or vendor account experiment was conducted. Terms such as effortless and seamless are requirements to prove, not evidence that the design already achieves them. Vendor instructions establish mature precedent; Asym-specific task tests establish fit. There is no basis for a quantified claim that Reply all is globally safer, that personal defaults increase productivity by a percentage, or that most ministries use group email.

## Required behavior and exact candidate decision language

**D2 wording:** “New ordinary staff email replies in Support Hub begin in Reply all mode unless the acting staff member has explicitly chosen Reply to sender as their personal default for this tenant. Either mode can be selected for one reply in the composer without changing that personal default. The default initializes a new draft only; the existing draft's target message, recipients, content and attachment choices remain stable. The active audience is plainly visible and editable, is validated by the authorized server send boundary, and does not grant CRM access or authority. Existing D1 safeguards continue to apply.”

The following clauses eliminate ambiguity without prescribing new infrastructure:

1. **Two scopes only.** “A personal preference affects that authenticated staff member's future ordinary email drafts in the active tenant. It does not affect coworkers, another tenant, donors' own email clients, internal notes, forwarding, automated acknowledgments, bulk mail, provider events, or owner-domain transactional mail. Changing a single draft's reply mode never changes the preference.” No tenant/inbox/team/per-conversation override hierarchy is required by this decision.
2. **Precedence.** “An existing draft's selected target, mode and concrete audience prevail. When creating a new draft, an explicit message action such as Reply to sender or Reply all prevails over the saved preference. When there is no explicit action, use the loaded preference; an absent preference means Reply all. A failed preference lookup is not the same as an absent preference. Preserve any draft and allow an explicit mode choice if preference loading fails; never silently broaden an audience because settings are unavailable.”
3. **No retroactive changes.** “Saving a preference applies to drafts started after the successful save. It cannot rewrite open, restored or queued replies. A later settings response cannot overwrite a draft already initialized or edited. A saved draft never recalculates recipients from the newest conversation message just because it was reopened.”
4. **Selected message.** “Each draft identifies the particular message being answered. Reply all uses only that message's admitted visible audience, after shared mail safety rules, not the union of historic participants, CRM associations or internal collaborators. Reply to sender uses the admitted response endpoint for that message. A different Reply-To address must be visible rather than disguised by the sender's display name.” Exact endpoint admission and header normalization belong to the existing governed mail contract.
5. **Custom recipient edits.** “Removing or adding recipients updates the explicit draft audience. Display a truthful Custom recipients state when it no longer matches the selected reply preset. Ordinary rerenders, new message arrivals and reopening cannot resurrect removed recipients. A deliberate selection of Reply all may rebuild the preset from the fixed target message; show its recipient changes immediately and permit undo. This is an explicit action, not a hidden default refresh.” There is no need for a perpetual per-conversation suppression list.
6. **Content and privacy.** “Changing reply mode preserves the author's draft text and attachment selections; it must not silently send them to new recipients. Widening the audience invalidates any prior send/disclosure confirmation for that draft. Never append internal notes, full historical transcripts, protected documents or CRM context solely because a new recipient is present. The receiving domain governs whether each protected item may be disclosed.”
7. **No hidden effects.** “Choosing a mode, editing recipients, opening personal preferences, or saving a preference never sends an email, changes support status, creates a CRM record, or assigns a support worker. Actual sender, addressed recipient, linked Party, represented organization and assigned staff remain distinct.”
8. **Human reply only.** “The default controls staff composition. Automation, macros, AI assistance and owner-domain transactions do not inherit a staff preference as an authority to contact copied people. A content mention, Party link or internal @mention does not add external recipients.”
9. **Normal sent experience.** “Donors reply with their normal mail client's Reply or Reply all. Asym preserves the intended selected-message audience and recognizable tenant support identity. D2 adds no requester account, portal, ticket-number requirement, or instruction to learn special recipient syntax.”

## A restrained, concrete UI

Use Core's existing component system. This is a proposed interaction contract, not an approved pixel layout or claim of implemented behavior.

The composer header has one text-labelled audience control: **Reply all ▾**, **Reply to sender ▾**, or **Custom recipients ▾**. Its menu starts with those first two reply modes and includes a separated **My reply preference…** entry. This avoids duplicate toolbars, a persistent settings gear, a separate toggle next to every email address, or a modal on every reply. The ordinary Send button continues to mean send the audience and content already shown.

Keep From and populated To/Cc recipient rows next to that control. Display real addresses, not only potentially ambiguous names. Empty optional fields may remain collapsed. Long populated lists can wrap or expand in place with a truthful total; collapsing must not make a broader audience look like a one-person reply. A staff member must be able to inspect and change every recipient without leaving the draft, using a keyboard or touch. The all/sender selector stays available when the two currently produce the same single-recipient audience, preserving consistency without inventing an error or warning.

The personal setting belongs under **My preferences → Support Hub → Default email reply**. Two choices are sufficient: **Reply all** and **Reply to sender**. Helper text: **“Applies to new replies for you in [tenant name]. You can change any reply before sending.”** Show the successfully saved value and a short inline **Saved** status. A failed save says **“Couldn't save your preference. Your previous default is unchanged.”** Never imply a success from optimistic UI alone. Opening the setting from the composer keeps or restores the draft and focus.

The reply-mode menu's selected state must be programmatically exposed. A standard menu button opens from Enter/Space, offers normal arrow navigation, closes with Escape and returns focus; it needs an accessible name and expanded state. These are established [WAI-ARIA menu-button requirements](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), not a reason to create a custom widget.

The controls must satisfy WCAG 2.2 AA keyboard/focus/name/role behavior and target size: [SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) specifies 24 by 24 CSS pixels or an applicable spacing/other exception; that is a minimum, not a recommendation to make important controls tiny. The design should use the existing comfortable touch target conventions. Announce meaningful recipient changes and save failures without moving focus unnecessarily, consistent with [SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html). A setting change must not unexpectedly navigate or submit, as explained in [SC 3.2.2](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html). Unicode names, right-to-left text around left-to-right email addresses, 320 CSS-pixel reflow, 200% text zoom, and no-hover touch controls belong in the test scenarios.

## Synthetic journey and adversarial cases

Sarah emails support and Ccs James. This is a test example, not a statement of measured ministry workflow. Maria opens the request with no saved preference. The reply begins in Reply all; Sarah and James's exact addresses are visible. Maria selects Reply to sender for a limited answer. The draft body remains and James disappears from this draft's audience. The change does not alter Maria's next default. If Maria explicitly saves Reply to sender in personal preferences, her next new draft begins that way; Elena's default remains Reply all. If Maria reopens the existing draft, its audience remains exactly as saved.

If James subsequently emails support alone, a reply to James's message cannot restore Sarah from old history. If Maria deliberately targets Sarah's earlier message, the UI identifies that target and warns/blocks for relevant unseen changes under D1; it cannot secretly switch target to James's newer message. If Maria selects Reply all after manually removing James from the current draft, that explicit reset may restore the selected message's group, with the resulting audience immediately visible and the required disclosure checks rerun.

If the draft includes an authorized receipt link meant only for Sarah, selecting Reply all cannot turn James into an authorized receipt viewer. Maria sees the owner's safe handoff or must revise the content. Switching from Reply all to an internal note does not reuse the recipient preset as a deliverable note path. A new CRM association or a merged Party never changes already addressed mail.

## Material UX concerns, prioritization and proof

| Concern                                                    | Severity / conditional likelihood                                                 | Failure and consequence                                                                                                                    | Permanent prevention and disposition effect                                                                                                                                                          |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Personal and one-reply scope are conflated                 | High disclosure risk / plausible during normal use if unspecified                 | A one-off sender reply changes tomorrow's default, or a saved preference silently widens an existing draft. Staff cannot predict audience. | Separate preference from draft, explicit precedence and no-retroactivity clauses. **Amends D2; does not reject Reply all.**                                                                          |
| Clean layout hides recipients                              | High disclosure risk / plausible with group mail and compact screens              | A name-only collapsed row makes group mail appear private.                                                                                 | Keep audience and addresses visible/inspectable in-place; truthful counts; keyboard/touch parity. **Amends presentation requirements.**                                                              |
| Reply means original requester rather than selected author | High disclosure risk / plausible in multi-person conversations                    | A private follow-up from a CC author is answered to people they omitted.                                                                   | Bind target message and admitted endpoint, expose who is being answered. **Narrows Reply all to message-scoped audience.**                                                                           |
| Preference fetch/save or draft updates race                | High disclosure risk / conditional on async implementation                        | A delayed settings response or newest message overwrites deliberate recipients.                                                            | Initialize once, retain concrete draft state, distinguish unavailable from absent settings, reject stale writes. **Requires implementation safeguards.**                                             |
| Internal collaboration changes recipients                  | High disclosure risk / easy to create if competitor behavior copied               | @mentioning a church contact or CRM owner unexpectedly emails them; a staff follower becomes CC.                                           | Recipient changes require the recipient control; separate internal notes, assignment and external recipients. **Requires explicit boundary.**                                                        |
| Too many confirmations                                     | Moderate productivity/accessibility impact / likely if all warnings become modals | Staff learn to dismiss prompts, donor care takes more steps, keyboard use worsens.                                                         | No second confirmation for unchanged ordinary reply; inline feedback for mode changes; send-time hard stop only for a material mismatch or unsafe disclosure. **Simplifies rather than expands D2.** |
| Preference hierarchy grows without a need                  | Moderate maintainability cost / avoidable                                         | Tenant/inbox/team/channel/conversation defaults conflict and support cannot explain behavior.                                              | One personal tenant-scoped default and one draft override. **Reject speculative hierarchy.**                                                                                                         |
| History accompanies new audience automatically             | High privacy impact / plausible if full transcripts are appended                  | James receives Sarah's earlier financial/care correspondence.                                                                              | No automatic full-history attachment; revalidate protected content after widening. **Carries forward D1.**                                                                                           |

Proof requirements are outcome-focused: verify initial default; per-person/per-tenant independence; explicit action precedence; single-reply override without preference mutation; current draft survives successful/failed preference update, navigation and refresh; delayed settings response cannot replace edited recipients; late incoming email cannot silently retarget; changed audience invalidates a send review; direct reply to a CC author; previously removed CC stays removed until an explicit audience reset; no contact/Party creation or access grant; and meaningful keyboard/screen-reader/mobile operation.

Run task-based usability tests with representative donor-care staff using synthetic addresses and content. The release criterion for privacy scenarios is **zero unintended-recipient sends or incorrect beliefs about recipient scope in the tested journeys**; any such failure blocks the UI until corrected and retested. This is an acceptance threshold, not a statistical population claim. For ordinary tasks, users must identify the active audience, switch it, and find/change their own default without coaching; any failure prompts a design correction and retest. No arbitrary time-to-task performance promise is justified without a baseline.

This research introduces no new operational “monitor later” loophole. Audience safety and draft correctness are required before release. Adoption and discoverability feedback may inform polish after the task tests pass, but no unvalidated safety condition is accepted as telemetry-only.

## Handoff to the main review

The critical finished decision is small: **Reply all by default; one personal preference; one explicit draft audience; no silent readdressing.** Repository/schema/transport reviews must verify the backing preference storage, current draft model, tenant scoping, send-time recipient validation, D1 collision/version checks, provider recipient-copy semantics, and same-tenant relationship constraints before claiming this is implemented. Source gaps do not invalidate the product choice, and no competitor's portal, CRM synchronization, auto-created contact, AI agent or workflow framework is necessary to fulfill it.

## Executed bounded design experiment

This program is a research model under work/, not a Core test or implementation. It imports no app modules, network, environment file or credentials. It encodes proposed rules and tests only bounded internal consistency. Counts are not a measure of production coverage. Four deliberately naïve transformations illustrate specific design failures; they do not reproduce a deployed defect.

```json
{
  "kind": "proposed-design model only",
  "implementation_tested": false,
  "initialization_cases": 18,
  "bounded_event_traces": 39216,
  "maximum_trace_length": 5,
  "event_alphabet": [
    "pref_all",
    "pref_sender",
    "pref_error",
    "new_message",
    "reopen",
    "send",
    "retry"
  ],
  "focused_checks": [
    "explicit choice beats delayed preference",
    "failure is not absence; explicit/fresh resolution can recover",
    "manual removal invariant; preset rebuilding has a real delta (no storage exercised)",
    "accepted audience survives later edits and retries",
    "ownership keys distinguish actor/tenant (not authorization proof)",
    "changed audience/content changes approval digest (not command enforcement proof)",
    "relevant incoming update requires explicit review; audience stays pinned",
    "in-memory saved preference seeds next draft only; other user value unchanged",
    "preset proposal leaves edited audience unchanged until explicit apply",
    "revision guard prevents old completion clearing newer work (abstract transition)"
  ],
  "counterexamples": [
    {
      "naive_rule": "apply every loaded default to the current composer",
      "trace": ["explicit sender", "late default all"],
      "unexpected_recipient": "james@example.invalid"
    },
    {
      "naive_rule": "derive recipients from latest message on send",
      "trace": ["draft for Sarah", "James writes privately", "send"],
      "wrong_target": "James instead of Sarah"
    },
    {
      "naive_rule": "submit the full group once for every member",
      "members": 2,
      "provider_submissions": 2,
      "copies_per_person": 2
    },
    {
      "naive_rule": "one aggregate delivered event means every member delivered",
      "observed": "Sarah delivered; James outcome unknown",
      "false_claim": "James delivered"
    }
  ],
  "limitations": "No actual UI, parser, authorization, database, provider, mail client, or production behavior exercised."
}
```

### Exact experiment source

```python
"""Bounded D2 design experiment. No application imports, network, env, or production proof."""
import copy
import hashlib
import itertools
import json
from pathlib import Path

EVENTS = ('pref_all', 'pref_sender', 'pref_error', 'new_message', 'reopen', 'send', 'retry')
PREFERENCES = ('absent', 'all', 'sender', 'loading', 'error', 'invalid')
MODES = (None, 'all', 'sender')
ALL = ('sarah@example.invalid', 'james@example.invalid')
SENDER = ALL[:1]

def initialize(pref, explicit=None):
    mode = explicit or (('all' if pref == 'absent' else pref) if pref in ('absent', 'all', 'sender') else None)
    return {'tenant': 't1', 'actor': 'u1', 'target': 'm1', 'mode': mode,
            'audience': None if mode is None else (ALL if mode == 'all' else SENDER),
            'body': 'A deliberately written answer', 'attachments': ('a1',),
            'needs_review': False, 'revision': 1, 'accepted': None}

def approval(d):
    return {k: copy.deepcopy(d[k]) for k in ('tenant', 'actor', 'target', 'audience', 'body', 'attachments')}

def transition(d, event):
    n = copy.deepcopy(d)
    if event == 'new_message' and n['accepted'] is None:
        n['needs_review'] = True
    if event == 'review':
        n['needs_review'] = False
    if event in ('send', 'retry') and n['audience'] is not None and n['accepted'] is None and not n['needs_review']:
        n['accepted'] = approval(n)
    # Unresolved drafts can be initialized by a successful preference response.
    # Once initialized, late responses never alter target/audience/body/attachments.
    if n['audience'] is None and event in ('pref_all', 'pref_sender'):
        mode = event.removeprefix('pref_')
        n['mode'], n['audience'] = mode, ALL if mode == 'all' else SENDER
    return n

checks = 0
for pref, explicit in itertools.product(PREFERENCES, MODES):
    d = initialize(pref, explicit)
    if explicit:
        assert d['mode'] == explicit
    elif pref in ('loading', 'error', 'invalid'):
        assert d['audience'] is None
    elif pref == 'absent':
        assert d['audience'] == ALL
    checks += 1

trace_count = 0
for mode in ('all', 'sender'):
    original = initialize(mode)
    for size in range(6):
        for trace in itertools.product(EVENTS, repeat=size):
            d = copy.deepcopy(original)
            for event in trace:
                was_blocked = d['needs_review'] and d['accepted'] is None
                d = transition(d, event)
                assert approval(d) == approval(original)
                if d['accepted'] is not None:
                    assert d['accepted'] == approval(original)
                if was_blocked and event in ('send', 'retry'):
                    assert d['accepted'] is None
            trace_count += 1

# Focused probes cover amendments not represented by the event alphabet.
focused = []
d = initialize('loading', 'sender')
assert transition(d, 'pref_all')['audience'] == SENDER
focused.append('explicit choice beats delayed preference')
d = initialize('error')
assert transition(d, 'send')['accepted'] is None
assert transition(d, 'pref_sender')['audience'] == SENDER
focused.append('failure is not absence; explicit/fresh resolution can recover')
d = initialize('all')
d['audience'], d['mode'] = SENDER, 'custom'
assert transition(d, 'reopen')['audience'] == SENDER
delta = {'added': sorted(set(ALL)-set(d['audience'])), 'removed': sorted(set(d['audience'])-set(ALL))}
assert delta['added'] == [ALL[1]]
focused.append('manual removal invariant; preset rebuilding has a real delta (no storage exercised)')
d = transition(initialize('all'), 'send')
accepted = copy.deepcopy(d['accepted'])
d['audience'], d['body'] = SENDER, 'Another draft'
assert transition(d, 'retry')['accepted'] == accepted
focused.append('accepted audience survives later edits and retries')
assert ('t1', 'u1') != ('t2', 'u1') and ('t1', 'u1') != ('t1', 'u2')
focused.append('ownership keys distinguish actor/tenant (not authorization proof)')
digest = lambda x: hashlib.sha256(json.dumps(x, sort_keys=True).encode()).hexdigest()
assert digest(accepted) != digest(approval(d))
focused.append('changed audience/content changes approval digest (not command enforcement proof)')

d = transition(initialize('all'), 'new_message')
assert transition(d, 'send')['accepted'] is None
assert transition(transition(d, 'review'), 'send')['accepted'] == approval(d)
focused.append('relevant incoming update requires explicit review; audience stays pinned')
preferences = {('t1', 'u1'): 'all', ('t1', 'u2'): 'all'}
open_draft = initialize(preferences[('t1', 'u1')])
preferences[('t1', 'u1')] = 'sender'
assert open_draft['audience'] == ALL
assert initialize(preferences[('t1', 'u1')])['audience'] == SENDER
assert initialize(preferences[('t1', 'u2')])['audience'] == ALL
focused.append('in-memory saved preference seeds next draft only; other user value unchanged')
d = initialize('all')
d['audience'], d['mode'] = SENDER, 'custom'
proposed = {'before': copy.deepcopy(d['audience']), 'after': ALL}
assert d['audience'] == SENDER
d['audience'], d['mode'] = proposed['after'], 'all'
assert d['audience'] == ALL and proposed['before'] == SENDER
focused.append('preset proposal leaves edited audience unchanged until explicit apply')
d = initialize('all')
saved_revision = d['revision']
d['revision'], d['body'] = 2, 'Newer unsaved work'
if saved_revision == d['revision']:
    d['body'] = ''
assert d['body'] == 'Newer unsaved work'
focused.append('revision guard prevents old completion clearing newer work (abstract transition)')

# Execute the intentionally naive transformations, so these are reproducible
# design counterexamples, not allegations about current runtime behavior.
naive = initialize('sender')
naive['audience'] = initialize('all')['audience']
assert ALL[1] in naive['audience']
naive_target = 'Sarah'
latest_message_sender = 'James'
naive_target = latest_message_sender
assert naive_target != 'Sarah'
naive_deliveries = [recipient for member in ALL for recipient in ALL]
assert naive_deliveries.count(ALL[0]) == 2
naive_status = {member: 'delivered' for member in ALL}
assert naive_status[ALL[1]] == 'delivered'

counterexamples = [
    {'naive_rule': 'apply every loaded default to the current composer',
     'trace': ['explicit sender', 'late default all'], 'unexpected_recipient': ALL[1]},
    {'naive_rule': 'derive recipients from latest message on send',
     'trace': ['draft for Sarah', 'James writes privately', 'send'], 'wrong_target': 'James instead of Sarah'},
    {'naive_rule': 'submit the full group once for every member',
     'members': 2, 'provider_submissions': 2, 'copies_per_person': 2},
    {'naive_rule': 'one aggregate delivered event means every member delivered',
     'observed': 'Sarah delivered; James outcome unknown', 'false_claim': 'James delivered'},
]
result = {'kind': 'proposed-design model only', 'implementation_tested': False,
          'initialization_cases': checks, 'bounded_event_traces': trace_count,
          'maximum_trace_length': 5, 'event_alphabet': EVENTS,
          'focused_checks': focused, 'counterexamples': counterexamples,
          'limitations': 'No actual UI, parser, authorization, database, provider, mail client, or production behavior exercised.'}
Path(__file__).with_name('d2-state-model-result.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ('counterexamples','event_alphabet')}, indent=2))

```

## Final synthesis and document verification

The database/preferences and vendor/UX reviewers independently checked the synthesized report. Their material corrections are incorporated in the final D2-R clauses: ambiguous preference saves, exact agent-linkage wording, explicit RLS enablement and legitimate staff participants. The recipient/delivery reviewer then checked R08–R10, proposed ADR 0002 and the corrected model and found no remaining material contradiction. This is review evidence, not executed runtime proof.

Final structural checks passed: all 23 requested categories appear individually, all 12 D2-R clauses and all 15 P01–P15 acceptance groups are present, and eight local documentation links resolve. The review/evidence/Q2 output snapshots match their canonical worktree copies. Changed grooming documents passed Prettier checking and git diff whitespace checking. Only local documentation changed; no product implementation, formal specification, ticket, publication or real email was created.
