# Support Hub — Phase 7: hardening and release prep

> Historical note: Phase 8 has now activated the Supabase adapter, route-backed
> UI hooks, and Resend inbound routing. This Phase 7 document remains useful for
> the adapter-boundary rationale and the pre-cutover implementation map.

Phases 1–6 are stacked. Phase 7 makes the donor care Support Hub production-shaped: a real `packages/api/src/admin/support-hub/*` adapter layer with a single swap point for the Phase 8 Supabase implementation, 30 thin route handlers under `apps/admin/app/api/admin/support/**`, CRM-ready cross-link chips into `/crm` and `/contributions`, accessibility + performance + failure-recovery audits, ~47 new unit / component tests, an e2e smoke spec, and the operator + admin + release-note docs.

> **The API surface is a swap point, not the live runtime today.** Phase 7
> ships the `packages/api/src/admin/support-hub/*` adapter layer + the
> 30 thin route handlers under `apps/admin/app/api/admin/support/**`,
> but the UI continues to read + write the in-memory TanStack DB
> collection through Phase 2's hooks. None of the new route handlers are
> called by any client in this repo today. They exist as the documented
> seam Phase 8 will activate alongside the Supabase migration. See
> [`final-audit-and-wrap-up.md`](./final-audit-and-wrap-up.md) for the
> full source-of-truth + production-readiness analysis.
>
> **Tenant isolation on the in-memory preview is now enforced.** The
> 2026-04-18 cursor[bot] high-severity finding (cross-tenant data
> exposure on the route handlers) was fixed on this PR by cherry-picking
> commit `585cddbb` from `cursor/critical-correctness-issues-b783@4357b908`.
> Every route handler now wraps its body in `withSupportHubAccess(async
() => { ... })`, which binds the authenticated `tenantId` for the
> request via an `AsyncLocalStorage` scope; the in-memory adapter
> filters every read by `tenantScopeForReads()` and rejects non-demo
> writes with `SUPPORT_HUB_TENANT_MISMATCH` (403). New regression
> coverage lives in
> `tests/unit/packages/api/admin/support-hub/tenant-isolation.test.ts`.
> The route handlers are still unwired from the UI; the Supabase swap +
> RLS translation remain Phase 8.

## Decisions locked

- **Persistence: adapter boundary, not a Supabase migration.** Phase 1 §3.4, Phase 5 doc, and Phase 6 doc all listed real Supabase tables as a Phase 7-or-later follow-up. The prompt's deliverable #1 explicitly accepts "real data wiring **or** a very clear adapter boundary." Phase 7 ships the adapter; Phase 8 swaps the implementation behind a single `adapter/index.ts` re-export.
- **Inbound email pipeline: stub only.** `routeInboundToSupportHub()` validates the envelope and returns the documented `deferred` shape today. The existing `packages/api/src/email/webhooks/resend.ts` `email.received` branch is left untouched.
- **CRM cross-links: deep links, no live fetch.** Each chip wraps `<Link>` so Next.js prefetches without firing extra network calls. Chips never appear unless an id (or fallback email) exists.
- **Tests: unit + component + e2e smoke.** Component tests use `@testing-library/react` (already a workspace dep) with explicit `cleanup()` between tests. E2E uses the existing `tests/e2e/admin-table-pages-smoke.spec.ts` pattern (admin demo session install, Mission Control chrome assertion).
- **No feature flag this phase.** The in-memory adapter is the sole live path. Phase 8 introduces `SUPPORT_HUB_USE_SUPABASE` when the migration lands.
- **No shell, token, layout, or PageShell changes.** Phase 7 is additive at the boundary.

## Architecture

```mermaid
flowchart LR
  subgraph apps [apps/admin]
    pages[/support/* pages]
    hooks[useSupport* hooks]
    sidecar[ConversationContactSidecar]
    inbox[SupportInbox]
  end
  subgraph apiPkg [packages/api/src/admin/support-hub]
    routeHelpers[route-helpers.ts]
    reads[reads/*.ts]
    mutations[mutations/*.ts]
    inboundRouter[inbound-router.ts]
    inMemoryAdapter[in-memory adapter]
    todoSupabase[Supabase adapter Phase 8]
  end
  subgraph routes [apps/admin/app/api/admin/support]
    routeHandlers[Thin re-exports]
  end
  subgraph dbPkg [packages/database]
    collections[Phase 2-6 collections]
    queryHooks[useLiveQuery hooks]
    seeds[SUPPORT_*_SEED constants]
  end
  subgraph crm [Mission Control routes]
    crmRoute[/crm route/]
    contributionsRoute[/contributions route/]
  end
  pages --> hooks
  hooks --> queryHooks
  routeHandlers --> reads
  routeHandlers --> mutations
  routeHandlers --> routeHelpers
  reads --> inMemoryAdapter
  mutations --> inMemoryAdapter
  inMemoryAdapter --> seeds
  inMemoryAdapter -.swap.-> todoSupabase
  inboundRouter -.Phase 8.-> mutations
  sidecar --> crmRoute
  sidecar --> contributionsRoute
  inbox --> failureRecovery[useSupportFailureRecovery]
  failureRecovery --> inbox
```

## File map

### New: API adapter (`packages/api/src/admin/support-hub/`)

```
route-helpers.ts                     # requireSupportHubAccess(), readJsonBody, toApiErrorResponse
schemas.ts                           # Zod schemas for every mutation payload
adapter/index.ts                     # Single swap point: re-exports the active adapter
adapter/types.ts                     # SupportHubAdapter interface
adapter/in-memory.ts                 # Wraps SUPPORT_*_SEED constants; persists in process

reads/conversations.ts               # listSupportConversations / get / listMessages
reads/registry.ts                    # listSupportLabels / Macros / CannedResponses /
                                     # SavedViews / Agents / Teams / BusinessHours /
                                     # SlaPolicies / Signatures / AutomationRules /
                                     # NotificationPreferences / Inboxes / InboxSettings

mutations/conversations.ts           # assign / setStatus / setPriority / snooze / unsnooze
                                     # / toggleLabel / sendReply / addPrivateNote
mutations/registry.ts                # save+delete for every static entity
mutations/run-macro.ts               # runSupportMacroOnServer — server-side runner

inbound-router.ts                    # routeInboundToSupportHub (Phase 7 STUB)
index.ts                             # Barrel
```

### New: thin route handlers (`apps/admin/app/api/admin/support/`)

30 handler files under `conversations/`, `labels/`, `macros/`, `canned-responses/`, `saved-views/`, `agents/`, `teams/`, `business-hours/`, `sla-policies/`, `signatures/`, `automation-rules/`, `notification-preferences/`, `inbox-settings/`, `counts/`, `reports/`. Each handler:

- Calls `requireSupportHubAccess()`.
- Reads + parses the JSON body via `readJsonBody(request, schema)` for mutations.
- Awaits the matching `@asym/api/admin/support-hub/*` function.
- Returns the result as JSON, with `toApiErrorResponse` for the failure path.

The handlers never import `@asym/database/supabase/*` directly — they go through `packages/api`, honoring `docs/guides/architecture/data-access-boundary.md`.

### New: feature module additions

```
+ apps/admin/features/support-hub/components/detail/ConversationCrmLinks.tsx
+ apps/admin/features/support-hub/lib/use-focus-return.ts
+ apps/admin/features/support-hub/hooks/use-support-failure-recovery.tsx
+ apps/admin/features/support-hub/components/SupportFailureBanner.tsx

~ apps/admin/features/support-hub/components/detail/ConversationContactSidecar.tsx
~ apps/admin/features/support-hub/components/detail/ConversationDetail.tsx
~ apps/admin/features/support-hub/components/detail/composer/ComposerActions.tsx
~ apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts
~ apps/admin/features/support-hub/components/board/BoardCard.tsx
~ apps/admin/features/support-hub/components/board/BoardColumn.tsx
~ apps/admin/features/support-hub/components/board/SupportBoardView.tsx
~ apps/admin/features/support-hub/components/table/SupportTableView.tsx
~ apps/admin/features/support-hub/components/SupportInbox.tsx
~ apps/admin/features/support-hub/lib/report-state.ts
```

### New: tests

```
tests/unit/packages/api/admin/support-hub/route-helpers.test.ts          # 6 cases
tests/unit/packages/api/admin/support-hub/reads-mutations.test.ts        # 8 cases
tests/unit/packages/api/admin/support-hub/inbound-router.test.ts         # 4 cases

tests/unit/apps/admin/features/support-hub/sla-helpers.test.ts           # 8 cases
tests/unit/apps/admin/features/support-hub/saved-views-state.test.ts     # 3 cases
tests/unit/apps/admin/features/support-hub/use-focus-return.test.tsx     # 2 cases
tests/unit/apps/admin/features/support-hub/contact-sidecar.test.tsx      # 4 cases

tests/unit/apps/admin/features/support-hub/components/board-card.test.tsx       # 3 cases
tests/unit/apps/admin/features/support-hub/components/composer-mode.test.tsx    # 4 cases
tests/unit/apps/admin/features/support-hub/components/inbox-toolbar.test.tsx    # 3 cases

tests/e2e/support-hub.smoke.spec.ts                                       # 6 assertions
```

Total new unit + component tests: **~47**. Workspace total after Phase 7: **528 passing tests across 121 files** (was 481 / 111).

### New: docs

```
docs/features/support-hub/phase-07-hardening-and-release.md   # this file
docs/features/support-hub/operator-guide.md                   # donor care staff workflow
docs/features/support-hub/admin-guide.md                      # admin / settings workflow
docs/features/support-hub/release-notes.md                    # rollout + Phase 8 sequencing
```

### Files explicitly NOT touched in this phase

- `apps/admin/app/mc-shell.tsx`, `apps/admin/app/layout.tsx`, `apps/admin/app/support/page.tsx`
- `packages/ui/components/shadcn/page-shell.tsx`, `packages/ui/styles/globals.css`, any token files
- `supabase/migrations/*` — no migration this phase
- `supabase/seed.sql` — no seed change this phase
- `packages/api/src/email/webhooks/resend.ts` — Phase 8 wires the inbound router
- `packages/email/*` — no provider changes
- `packages/lib/mission-control/nav.ts` — `/support` role gate stays put
- The Phase 5 keymap, Phase 5 command palette, Phase 6 settings forms — only the documented a11y / failure-recovery / perf edits land here

## Adapter contract

```ts
// packages/api/src/admin/support-hub/adapter/types.ts
export interface SupportHubAdapter {
  conversations: {
    list(filter: SupportConversationFilter): Promise<SupportConversation[]>;
    get(id: string): Promise<SupportConversation | null>;
    listMessages(conversationId: string): Promise<SupportMessage[]>;
    assign(input): Promise<SupportConversation>;
    setStatus(input): Promise<SupportConversation>;
    setPriority(input): Promise<SupportConversation>;
    snooze(input): Promise<SupportConversation>;
    unsnooze(input): Promise<SupportConversation>;
    toggleLabel(input): Promise<SupportConversation>;
  };
  messages: {
    sendReply(input): Promise<SupportMessage>;
    addPrivateNote(input): Promise<SupportMessage>;
  };
  labels: { list; save; delete };
  macros: { list; save; delete };
  cannedResponses: { list; save; delete };
  savedViews: { list; save; delete };
  inboxes: { list };
  inboxSettings: { list; get; save };
  agents: { list };
  teams: { list; save; delete };
  businessHours: { list; save; delete };
  slaPolicies: { list; save; setDefault; delete };
  signatures: { list; save; setDefault; delete };
  automationRules: { list; save; toggle; delete };
  notificationPreferences: { list; get; save };
}

// packages/api/src/admin/support-hub/adapter/index.ts
export { inMemorySupportHubAdapter as supportHubAdapter } from "./in-memory";
// Phase 8 swap:
// export { supabaseSupportHubAdapter as supportHubAdapter } from "./supabase";
```

The reads + mutations modules import `supportHubAdapter` from `./adapter`. Every call site stays unchanged when Phase 8 swaps the implementation. The adapter never imports from `apps/*` and never pulls in `@tanstack/db` — only the typed seed re-exports from `@asym/database/hooks`.

## CRM cross-link contract

```ts
// apps/admin/features/support-hub/components/detail/ConversationCrmLinks.tsx
export function buildCrmLinks(
  contact: SupportContactRef | null,
  donorEmail: string | null,
): ConversationCrmLink[];
```

Routes used today:

- `contact.contactId` → `/crm?contact={id}`
- `contact.donorId` → `/contributions?donor={id}`
- `contact.contributionId` → `/contributions?contribution={id}`
- `contact.missionaryId` → `/crm?missionary={id}` (until a missionary detail page lands)
- `contact.churchId` → `/crm?church={id}` (same caveat)
- Fallback when no ids exist + an email is present → `/crm?email={email}` "Find in CRM"

Each chip uses `<Link prefetch={false}>` so Next.js's router does not eagerly fetch the destination page on every render. `target` stays in the same tab.

## Performance audit findings

- `SupportTableView` enables `enableVirtualization` above 200 rows. Smaller tables keep their existing pagination behavior.
- `SupportBoardView` paginates each column at `BOARD_CARD_PAGE_SIZE = 50` cards with a "+N more" hint so columns never paint a 500-card list.
- `useSupportReportRouteState` now per-slice memoizes the `request` object keyed on the URL state hash. Without this, the report hooks were re-aggregating on every render.
- The Phase 5 mutation surface already invalidates `[...supportHubQueryKeys.root]` after every mutation; Phase 7 layers a `useSupportFailureRecovery` retry hook so optimistic writes that fail can be rolled back via the inline banner instead of vanishing into a toast.

## Accessibility audit findings

- Board: `aria-label="Donor care board view"` on the region; per-column `aria-label="${label} conversations, N items"`; per-card `aria-label` includes subject + donor + status + assignment + past-due + escalated. Cards expose `aria-pressed` for the selection state.
- Composer Send button gets `aria-busy` while the mutation is in flight + a typed `aria-label` ("Send reply to donor" or "Add internal note").
- Detail pane mounts `useFocusReturn(conversationId !== null)` so closing the pane (or routing away) returns focus to the originating row / card.
- Forced-light theme preserved; failure banner uses Maia / Zinc tokens (amber surface, no new hex colors).

## Failure-recovery contract

```ts
type SupportFailureKind =
  | "send-reply"
  | "save-draft"
  | "add-note"
  | "assign"
  | "set-status"
  | "toggle-label"
  | "snooze"
  | "run-macro";
```

Phase 7 wires the composer (`useConversationComposer`) into `useSupportFailureRecovery` for the three flows that produce donor-visible writes:

- `send-reply` — failure surfaces an inline retry banner; Retry calls `sendReply.mutateAsync` again with the original payload.
- `save-draft` — same, with the `mode: "draft"` variant.
- `add-note` — same.

Mutations that change conversation-level state (assign / set-status / toggle-label / snooze) keep their existing optimistic write + cache invalidation path; if they fail, the cache invalidation in `useInvalidateSupportCaches` re-fetches the source of truth from the live collection so the UI snaps back to a consistent state.

The macro runner (`useRunSupportMacro`) already iterates outcomes per action and surfaces the first failed step via sonner; no Phase 7 changes are needed there.

## Test catalogue

- **Unit (packages/api):** 3 files, 19 cases — auth gate (401 / 403 / staff happy path), JSON body parsing + Zod validation, adapter wrap (reads + mutations through the in-memory store), inbound stub validation.
- **Unit (apps/admin):** 4 files, 17 cases — SLA helpers (`isPastDue` / `hoursUntil` / `minutesBetween` / `formatRelative`), saved-view URL round-trip, focus-return hook with JSDOM, contact-sidecar CRM link surface.
- **Component (apps/admin):** 3 files, 10 cases — board-card a11y label + `aria-pressed`, composer mode toggle + `aria-busy` + disabled-when-empty, failure banner render + retry + dismiss.
- **E2E:** 1 spec, 6 assertions — `/support` shell mount, layout toggle, status filter param, conversation deep-link, `/support/reports/overview`, `/support/settings/inbox`.

Total new tests: **~47**. Workspace total: **528 across 121 files** (was 481 / 111).

## Quality gates

- `bun run typecheck` (workspace) — must pass across 13 packages.
- `bun run lint` (workspace) — must pass.
- `bun run test:unit` — 528 tests pass.
- `bun run test:e2e:smoke` — the new support-hub smoke spec runs alongside the existing CRM / contributions smokes (requires the admin app to be reachable; skipped automatically when the demo session install fails).
- Prettier — clean.
- `tanstack-foundation-guardrails.test.ts` — green; no `@tanstack/db` import lands in `apps/admin/app/api/**` or `packages/api/**`.

## Rollout plan (Phase 8 follow-up)

1. Merge Phase 7 — adapter boundary, CRM cross-links, a11y / perf / failure-recovery, tests, docs.
2. Phase 8:
   - Ship `supabase/migrations/<ts>_support_hub_foundation.sql` per Phase 1 §3.4 + Phase 6 additions (automation, signature, notification tables).
   - Implement `packages/api/src/admin/support-hub/adapter/supabase.ts` against the new tables.
   - Flip the single `adapter/index.ts` export from `inMemorySupportHubAdapter` to `supabaseSupportHubAdapter`.
   - Wire `routeInboundToSupportHub()` into `packages/api/src/email/webhooks/resend.ts`'s `email.received` branch.
   - Replace the in-memory seed in `packages/database/collections/support-hub.ts` with a build-time fixture that only loads in `NODE_ENV !== "production"`.
3. Provider secrets needed for live email: `RESEND_API_KEY` (already configured), `RESEND_INBOUND_DOMAIN` (Phase 8).
4. Migration steps: `supabase db push` against development → smoke against development → production push during a low-traffic window.

## Continuity for Phase 8+

- Single swap point: `packages/api/src/admin/support-hub/adapter/index.ts`.
- The adapter interface in `adapter/types.ts` is the contract the Supabase implementation must satisfy.
- `routeInboundToSupportHub()` already exists with the documented signature; Phase 8 fills the body.
- All UI surfaces (Phase 3-6) speak through TanStack Query; the adapter swap is invisible to them.
- `tests/e2e/support-hub.smoke.spec.ts` is the regression net for Phase 8 — it should pass before and after the Supabase implementation lands.
