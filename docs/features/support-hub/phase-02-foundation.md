# Support Hub — Phase 2 Foundation

> Companion to [`phase-01-discovery.md`](./phase-01-discovery.md),
> [`file-map.md`](./file-map.md), and
> [`chatwoot-gray-parity-map.md`](./chatwoot-gray-parity-map.md).
>
> Phase 2 ships the typed data foundation — domain types, donor-care mock
> seeds, TanStack DB collections, TanStack Query / react-db hooks, mutation
> wrappers, derived selectors, and `nuqs`-backed route-state helpers. No
> polished UI yet; the inbox shell phase consumes these primitives unchanged.

## What landed in this phase

- **TanStack DB collections** for every Support Hub entity, mock-driven and
  validated with Zod, using the same `createCollection(queryCollectionOptions(...))`
  pattern as `packages/database/collections/admin-workspace.ts`. Lives at
  `packages/database/collections/support-hub.ts`.
- **Live-query hook layer** (`useSupport*Live`) at
  `packages/database/hooks/support-hub.ts` mirroring the
  `useCarePersonnel` / `useTasksRows` style.
- **Canonical query keys** added to
  `packages/database/query-keys.ts → supportHubQueryKeys`. Re-exported from
  the feature folder for convenience.
- **Feature folder** at `apps/admin/features/support-hub/`:
  - `types/*` — re-exports of the wire-format types from
    `@asym/database/hooks` plus app-only enrichments
    (`SupportInboxStats`, `SupportReportSeries`, `SupportInboxRouteState`).
  - `models/editor-payload.ts` — `SupportReplyPayload` contract for the
    future Tiptap composer.
  - `models/schemas.ts` — small Zod helpers used by mutation hooks
    (status / priority / macro action).
  - `lib/route-state.ts` — `nuqs`-backed `useSupportInboxState()` plus
    `parseSupportInboxRouteState()` for server callers.
  - `lib/query-keys.ts` — re-export of `supportHubQueryKeys`.
  - `lib/selectors.ts` — pure derived selectors
    (`selectMine`, `selectUnassigned`, `selectPastDue`, `selectEscalated`,
    `selectWaitingOnAgent`, `selectWaitingOnDonor`, `selectSlaAtRisk`,
    `selectByView`, `selectConversations`, `computeInboxStats`,
    `computeReportSlice`).
  - `lib/time.ts` — `isPastDue`, `hoursUntil`, `minutesBetween`,
    `formatRelative`.
  - `lib/participants.ts` — `getSupportAgentParticipant` and the
    `SUPPORT_SYSTEM_PARTICIPANT` envelope used when authoring messages.
  - `stores/support-store.ts` — single namespaced adapter exposing the
    collections plus typed Zod input schemas (`supportStore.collections.*`,
    `supportStore.inputs.*`). The future swap to `@asym/api/admin/support-hub`
    is a one-file change in this adapter.
  - `hooks/*` — read hooks
    (`useSupportConversations`, `useSupportConversation`,
    `useSupportMessages`, `useSupportInboxStats`, `useSupportLabels`,
    `useSupportMacros`, `useSupportCannedResponses`, `useSupportSavedViews`,
    `useSupportInboxes`, `useSupportInboxSettings`, `useSupportReports`,
    `useSupportAgents`, `useSupportTeams`) and mutation hooks
    (`useAssignSupportConversation`, `useSetSupportConversationStatus`,
    `useSnoozeSupportConversation`, `useUnsnoozeSupportConversation`,
    `useSetSupportConversationPriority`, `useToggleSupportLabel`,
    `useAddSupportPrivateNote`, `useSendSupportReply`, `useSaveSupportMacro`,
    `useSaveSupportCannedResponse`, `useSaveSupportSavedView`).
  - `components/`, `queries/` — placeholders (`.gitkeep` only) reserved for
    later phases.

## How the layers fit together

```
Inbox UI (later phases)
    │
    │  imports
    ▼
apps/admin/features/support-hub/hooks/* ─────► apps/admin/features/support-hub/lib/*
    │   (read + mutation)                       (selectors, route-state, time)
    │
    ▼
apps/admin/features/support-hub/stores/support-store.ts
    │   (typed Zod inputs + collection registry)
    │
    ▼
@asym/database/hooks → @asym/database/collections/support-hub.ts
                               (TanStack DB collections, mock seeds, Zod schemas)
                               │
                               ▼
                    @tanstack/db + query-db-collection
```

The dotted line in the Phase 1 architecture diagram between the feature
folder and `packages/database` is now a real, tested boundary. The
guardrail test
`tests/unit/packages/database/tanstack-foundation-guardrails.test.ts`
explicitly forbids `@tanstack/db` from being a direct dependency of
`apps/admin`, which is why all collection ownership lives in the database
package.

## Architecture deviation from Phase 1 (recorded)

Phase 1's `file-map.md` proposed creating
`packages/database/collections/support-hub.ts` and a separate set of mock
files inside `apps/admin/features/support-hub/mock/`. Implementation moved
the mock seeds **inline** into the collection file because:

- `packages/database` cannot import from any `apps/*` workspace.
- The `admin-workspace.ts` precedent already inlines its seeds.
- The collection file is the natural single place for schema + seed +
  collection so that "swap to live Supabase" is exactly one file's
  responsibility (drop the `*_SEED` arrays, swap the `queryFn` body).

The donor-care narrative content from the original `mock/` files is
preserved verbatim inside `packages/database/collections/support-hub.ts`.
The `mock/` directory in the feature folder is intentionally absent.

## Status / view contract

| Axis         | Values                                               | Stored on row | Source             |
| ------------ | ---------------------------------------------------- | ------------- | ------------------ |
| `status`     | `open`, `pending`, `snoozed`, `resolved`             | yes           | Chatwoot lifecycle |
| `view` slice | `all`, `mine`, `unassigned`, `past-due`, `escalated` | derived       | gray-ui-csm        |
| `layout`     | `board`, `table`                                     | URL only      | gray-ui-csm        |
| `priority`   | `urgent`, `high`, `normal`, `low`                    | yes           | both               |

`computeInboxStats` and `selectByView` consume the wire `status` plus a
clock to produce every view slice without ever persisting them.

## Route state contract

`useSupportInboxState()` returns
`{ state, setState, resetState }` with stable references. The state shape
is:

```ts
interface SupportInboxRouteState {
  view: "all" | "mine" | "unassigned" | "past-due" | "escalated";
  layout: "board" | "table";
  status: "open" | "pending" | "snoozed" | "resolved" | "all";
  q: string;
  labelSlugs: string[]; // comma-separated in URL
  assignee: string; // agent id, "me", or "unassigned"
  selectedConversationId: string | null;
  section: "inbox" | "settings" | "reports";
}
```

URL keys (stable on purpose for deep links): `view`, `layout`, `status`,
`q`, `label`, `assignee`, `id`, `section`.

`parseSupportInboxRouteState(searchParams)` is a server-safe pure parser
returning the same shape — useful for future server reads that want to
derive filters before rendering.

## Mutation contract

Every mutation parses its input with a Zod schema declared on
`supportStore.inputs.*`, mutates the relevant collection, awaits
`tx.isPersisted.promise`, and invalidates the
`supportHubQueryKeys.root` namespace. Optimistic flow matches the
`useLogActivity` precedent from `packages/database/hooks/admin-workspace.ts`.

```ts
import {
  useSendSupportReply,
  type SendReplyInput,
} from "@/features/support-hub";

const send = useSendSupportReply();

await send.mutateAsync({
  conversationId,
  authorAgentId,
  payload: {
    json: editor.getJSON(),
    html: editor.getHTML(),
    text: editor.getText(),
    attachments: [],
  },
});
```

The reply contract is `SupportReplyPayload`:

```ts
interface SupportAttachmentDraft {
  filename: string;
  contentType: string;
  sizeBytes: number;
  blobRef: string;
}

interface SupportReplyPayload {
  json: unknown | null; // Tiptap document JSON (null until composer wired)
  html: string;
  text: string;
  attachments: SupportAttachmentDraft[];
}
```

Composer wiring lands in a later phase; the contract is stable now.

## Donor-care mock seeds

Twelve scenarios spread across the four statuses and the five view slices
so the future inbox surface exercises every selector path on first paint:

1. Failed donation receipt
2. Recurring gift card declined
3. Account access trouble (login link expired)
4. Donor profile merge question
5. Project giving question (fund vs missionary designation)
6. Gift designation mismatch (escalated)
7. Missionary page issue
8. Event gift follow-up (gala pledge confirmation)
9. Recurring gift pause request (snoozed)
10. Tax statement question
11. Receipt name correction (resolved)
12. Apple Pay double charge (escalated)

Each conversation cross-links to existing mock IDs from
`apps/admin/lib/mock-data` (`donor-001` … `donor-008`, `miss-001`,
`don-001`, `don-002`) via `SupportContactRef` so the future side panel
renders real-looking donor cards without any extra glue.

## Quality gates run in this phase

- `bunx turbo run typecheck --filter=@asym/admin --filter=@asym/database` —
  green.
- `bunx turbo run lint --filter=@asym/admin --filter=@asym/database` —
  green.
- `bun run test:unit` — 422 tests pass (including the
  TanStack guardrail that forbids `@tanstack/db` from being a direct
  dependency of `apps/admin`).
- Prettier ran clean across all new files.

## Assumptions (please review before Phase 3)

1. The mock-driven collection pattern (precedent: care, tasks, teams) is the
   right MVP storage. Switching to live Supabase later is a one-file change
   in `packages/database/collections/support-hub.ts` (drop the in-memory
   `*_SEED` arrays, replace the `queryFn` body with a real fetch).
2. `crypto.randomUUID()` is available in browsers used by Mission Control.
   Mutation hooks fall back to `Math.random()` + `Date.now()` when it isn't.
3. The `assignee` parameter accepts `"me"` and `"unassigned"` literal
   strings as sentinel values; the resolution to a real agent id will land
   alongside the inbox shell that knows the current user. Today's mock
   seeds wire concrete agent ids only.
4. Selectors treat `lastMessageDirection === "inbound"` as "waiting on
   agent" only when the conversation is in `open` or `pending`. Snoozed and
   resolved conversations are intentionally excluded.
5. SLA "at risk" defaults to 30 minutes before the relevant due timestamp.
   Phase 3 should expose this threshold in inbox settings.

## Missing provider / backend pieces

These are the explicit holes a later phase needs to fill:

1. **Real `support_*` Supabase tables** with RLS and indexes
   (`support_conversations`, `support_messages`, `support_message_attachments`,
   `support_labels`, `support_conversation_labels`, `support_assignments`,
   `support_saved_views`, `support_macros`, `support_canned_responses`,
   `support_signatures`, `support_business_hours`, `support_sla_policies`,
   `support_audit_log`). Schema is detailed in
   `phase-01-discovery.md` §3.4.
2. **Inbound router** in `packages/api/src/email/webhooks/resend.ts`
   that converts an `email.received` event into a `support_messages` row
   and a new-or-existing `support_conversations` row, using the headers
   captured in `SupportEmailHeaders` for threading.
3. **`packages/api/src/admin/support-hub/*`** business-logic layer
   (`reads`, `mutations`, `inbound-router`, `route-helpers.ts`,
   `audit.ts`). The mutation hooks in this phase are the contract that
   layer must match.
4. **`apps/admin/app/api/admin/support/**`\*\* thin route handlers per the
   Data Access Boundary rule.
5. **Real Tiptap composer UI** that produces the `SupportReplyPayload` and
   feeds it to `useSendSupportReply`.
6. **Round-robin assignment logic** referenced by
   `SupportInboxSettings.roundRobinEnabled`.
7. **Macro runner** that sequentially executes
   `SupportMacroAction[]` against the API layer.
8. **SLA cron / business-hours evaluator** that flips
   `escalatedAt` and `firstResponseDueAt` based on policy + clock.
9. **CRM linkage matcher** that backfills
   `SupportConversation.contact.{contactId,donorId,...}` when a new
   conversation lands.

## Quick usage examples

```ts
// Read filtered conversations + drive the inbox toolbar
const { state, setState } = useSupportInboxState();
const conversations = useSupportConversations({
  filter: {
    view: state.view,
    status: state.status,
    q: state.q,
    labelSlugs: state.labelSlugs,
    assignee: state.assignee,
    agentId: currentAgentId,
  },
});

// Switch layout
setState({ layout: state.layout === "board" ? "table" : "board" });

// Compute stat-card data
const { data: stats } = useSupportInboxStats();

// Detail pane
const { data: conversation } = useSupportConversation(
  state.selectedConversationId,
);
const { data: thread } = useSupportMessages(state.selectedConversationId);

// Action menus
const setStatus = useSetSupportConversationStatus();
const toggleLabel = useToggleSupportLabel();
const snooze = useSnoozeSupportConversation();
const assign = useAssignSupportConversation();
```

## Out of scope for Phase 2 (carry forward)

- Polished UI (board / table / detail panes).
- Real Resend inbound router wiring.
- Real Tiptap composer UI.
- Macros runner, SLA cron, business-hours evaluator UI.
- Reports rendering (the `useSupportReports` data contract exists; charting
  ships in Phase 4).
