# Support Hub — Admin guide

The Support Hub admin surface lives under `/support/settings/*` and `/support/reports/*`. This guide walks the admin UI, the contracts each surface posts to, and the Phase 8 backend story for each.

## Sub-navigation

`/support/reports/*` and `/support/settings/*` share the same workspace shell. The sub-nav strip is two rows:

1. Section pills: **Inbox** / **Reports** / **Settings** (links back to `/support`, `/support/reports/overview`, `/support/settings/inbox`).
2. Sub-section tabs for the active section. The settings tab list collapses into a `<Select>` on mobile.

## Reports

### Surfaces

| Path                        | What it shows                               | Key controls                                |
| --------------------------- | ------------------------------------------- | ------------------------------------------- |
| `/support/reports/overview` | Volume + open + first response + resolution | Date range, group-by, business hours, scope |
| `/support/reports/agents`   | Conversations per agent                     | Filters above + agent-mix bar               |
| `/support/reports/teams`    | Conversations per team                      | Filters above + team-mix bar                |
| `/support/reports/labels`   | Conversations per label                     | Filters above + label-mix bar               |
| `/support/reports/inbox`    | Inbound + outbound message volume           | Filters locked to inbox scope               |

### Filters

- **Date range** — `from` / `to` (ISO date inputs).
- **Group by** — day / week / month.
- **Business hours only** — when on, only timestamps inside the configured business-hours window count.
- **Scope** — all / inbox / agent / team / label, plus the matching id picker.
- **Reset** — restores the last-30-days, day grouping, business-hours-off defaults.

Every filter writes to the URL so reports are shareable + deep-linkable. The export menu builds CSV / JSON in-browser via `Blob` + `URL.createObjectURL` — no network round trip.

### Phase 8 server-side story

Today the report aggregator (`apps/admin/features/support-hub/lib/report-aggregations.ts`) runs in the browser against TanStack DB collections. Phase 8 introduces `/api/admin/support/reports` server-side aggregation when conversation volumes outgrow the in-browser pass. The route handler already exists — it returns the raw conversation + message data so the existing aggregator stays the single source of truth.

## Settings

| Path                                 | Surface                                                                                                                         | Posts to                                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `/support/settings/inbox`            | Inbox identity, default sender / signature / SLA / business hours, round-robin toggle, auto-resolve, contact sidecar visibility | `PATCH /api/admin/support/inbox-settings`                                                           |
| `/support/settings/collaborators`    | Read-only agent list + teams CRUD                                                                                               | `GET /api/admin/support/agents`, `POST` / `PATCH` / `DELETE /api/admin/support/teams[/:id]`         |
| `/support/settings/assignment`       | Round-robin toggle + fallback agent placeholder                                                                                 | Re-uses inbox-settings PATCH                                                                        |
| `/support/settings/business-hours`   | Weekly schedule editor + holidays                                                                                               | `POST` / `PATCH` / `DELETE /api/admin/support/business-hours[/:id]`                                 |
| `/support/settings/sla`              | SLA policies CRUD + default promotion                                                                                           | `POST` / `PATCH` / `DELETE /api/admin/support/sla-policies[/:id]`; default flip via `?default=true` |
| `/support/settings/signatures`       | Workspace + agent-owned signatures                                                                                              | `POST` / `PATCH` / `DELETE /api/admin/support/signatures[/:id]`; default flip via `?default=true`   |
| `/support/settings/labels`           | Label library                                                                                                                   | `POST` / `PATCH` / `DELETE /api/admin/support/labels[/:id]`                                         |
| `/support/settings/macros`           | Macro library + typed action editor                                                                                             | `POST` / `PATCH` / `DELETE /api/admin/support/macros[/:id]`                                         |
| `/support/settings/canned-responses` | Reusable reply templates with merge variables                                                                                   | `POST` / `PATCH` / `DELETE /api/admin/support/canned-responses[/:id]`                               |
| `/support/settings/saved-views`      | List + delete; creation lives on the inbox toolbar                                                                              | `DELETE /api/admin/support/saved-views/:id`                                                         |
| `/support/settings/automations`      | Typed event → condition → action rules with dry-run                                                                             | `POST` / `PATCH` / `DELETE /api/admin/support/automation-rules[/:id]`; toggle via `?toggle=true`    |
| `/support/settings/notifications`    | Per-agent email + in-app channel toggles                                                                                        | `PATCH /api/admin/support/notification-preferences`                                                 |

Every endpoint returns the saved row so the UI can echo it back without an extra `GET`. Sonner toasts surface on the success path; the inbox-wide failure banner picks up donor-visible mutations.

## Automations

A rule is a typed `(trigger, conditions[], actions[])` triple. Conditions are ANDed; actions are dispatched in order through the same shape the macro runner uses.

### Triggers

- `conversation_created`
- `message_received`
- `status_changed`
- `label_added`
- `past_due_reached`

### Conditions

- `inbox_is`, `label_includes`, `from_domain_equals`
- `assignee_is_present` (boolean)
- `is_overdue`, `is_escalated` (boolean)
- `subject_contains`, `body_contains`

### Actions

- `assign_agent`, `assign_team`
- `add_label`
- `set_priority`, `set_status`
- `snooze` (hours)
- `mark_escalated`
- `run_macro`

`mark_escalated` and `run_macro` will only run server-side once Phase 8 wires the inbound runtime — the dry-run preview surfaces the intent so admins can author rules today.

### Dry run

Every rule form mounts a `<AutomationDryRunPreview>` block that picks a sample conversation from the live collection and runs the rule via the pure `evaluateSupportAutomationRule` function. Reasons + planned actions render inline; nothing is dispatched. Use it to validate every rule before saving.

### Phase 8 runtime

Phase 8 wires `evaluateSupportAutomationRule` into the Resend `email.received` webhook (`packages/api/src/email/webhooks/resend.ts`) via `routeInboundToSupportHub` — the planned actions go straight into the existing macro runner so the dispatch path is identical to the dry-run preview.

## Provider secrets

| Variable                   | Phase              | Notes                                                       |
| -------------------------- | ------------------ | ----------------------------------------------------------- |
| `RESEND_API_KEY`           | Already configured | Used by the Phase 5 outbound flow + Phase 8 inbound webhook |
| `RESEND_INBOUND_DOMAIN`    | Phase 8            | Configured at `tenant_email_settings` per tenant            |
| `SUPPORT_HUB_USE_SUPABASE` | Phase 8            | Optional override flag during the supabase swap             |

## Adapter swap (Phase 8)

The single point of swap is `packages/api/src/admin/support-hub/adapter/index.ts`:

```ts
// Phase 7
export { inMemorySupportHubAdapter as supportHubAdapter } from "./in-memory";

// Phase 8
export { supabaseSupportHubAdapter as supportHubAdapter } from "./supabase";
```

The `SupportHubAdapter` interface in `adapter/types.ts` is the contract the Supabase implementation must satisfy. Every reads + mutations function delegates to `supportHubAdapter.*` — when the export flips, every route handler + every Phase 7-built unit test continues to pass against the real database.

## Failure recovery

Mutations that touch donor-visible state (send-reply, save-draft, add-note) report into `useSupportFailureRecovery` so the failure banner at the top of the inbox can surface a Retry. The banner is `aria-live="assertive"` so screen readers announce it without losing focus context.

Conversation-level mutations (assign / set-status / toggle-label / snooze) keep the existing optimistic + invalidate path; their failures fall back to the cache invalidation in `useInvalidateSupportCaches`, which re-fetches the source of truth so the UI snaps back to a consistent state.

Macro runner failures are surfaced via the per-action outcome list returned from `runSupportMacro`. The first failed step appears in a sonner toast; subsequent actions still run unless `stopOnError: true` was passed.
