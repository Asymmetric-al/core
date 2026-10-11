# D11 implementation evidence — advisory stage guidance

2026-10-10; research only against checkout
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. D11 A selects guidance and authorized
staff judgment without tenant-configured blocking fields. This note assesses
reusable source and missing acceptance boundaries; it does not describe a shipped
P27 stage command. No product, migration or real database was changed.

## Evidence boundary

Fresh bounded searches for `cultivation`, `stage.entry`, `stage.requirements` and
`development.stage` in API source, database package, admin/missionary app routes
and SQL migrations found no matching implementation. The inspected CRM board
groups the loaded donor rows' `lifecycleStatus` alphabetically and opens a record
on click; it supplies no cultivation transition command
([kanban-view.tsx:29](<../../../../../apps/admin/app/(app)/crm/kanban-view.tsx#L29>),
`:74–78`). The read model maps `donors.status` and `donors.updated_at` to
`lifecycleStatus` and `lastTouchAt`
([model.ts:41–69](../../../../../packages/api/src/admin/crm/model.ts#L41)).
That timestamp is not evidence of a human contact or accepted stage event.

The UI/accessibility/Vitest repository rules were read. This is source inspection
plus the narrow existing-control test below, not a browser, deployed-version,
database, permissions or accessibility-conformance audit. Severity describes
impact **if the named pattern is carried into D11**; likelihood is a qualitative
reuse risk, not observed production incidence. None requires reversing A.

## Findings and permanent acceptance safeguards

### I01 — Keep the stage command small; do not import unrelated form requirements

**High impact; medium likelihood.** The missionary partner editor already offers
a status select, but its enclosing schema requires a name and valid email,
submits the whole donor form, and supports hardcoded `Active/Lapsed/New/At Risk`
values ([edit-donor-form-model.ts:3–29](../../../../../apps/missionary/app/donors/edit-donor-form-model.ts#L3),
[edit-donor-dialog.tsx:223–226](../../../../../apps/missionary/app/donors/edit-donor-dialog.tsx#L223),
`:326–348`). Its API likewise accepts a complete donor update and writes
`donors.status`, not a journey stage
([donor.ts:25–56](../../../../../packages/api/src/missionary-portal/donor.ts#L25),
`:73–100`). These are concrete source behaviors, not proof that today's donor
editor violates its own contract.

**Fix language:** provide a focused journey-stage command and concise guidance.
Do not require repairing email, fundraising data, another record's fields, a
tenant questionnaire, acknowledgement checkbox or filler reason just to express
an otherwise permitted assessment. Keep mandatory source authorization,
eligibility, accountability and history checks. Do not rename donor status into
cultivation stage.

**Proof:** eligible authorized stage changes succeed without optional notes or
unrelated contact details; invalid scope/retired destination/stale version still
fail truthfully. Reopening an unchanged retired stage follows D9 rather than
being treated as a fresh blocked selection. No donation, consent, task completion
or contact event is inferred from the assessment.

### I02 — Preserve a recorded value when current choices change

**High impact; high likelihood if options are filtered naively.** Shared
`SelectCell` derives the display solely from its `options`, renders `N/A` if no
match, and its editing display falls back to the placeholder
([select-cell.tsx:34–36](../../../../../packages/ui/components/shadcn/data-table/cell-variants/select-cell.tsx#L34),
`:77–87`, `:126–133`). `SearchableSelect` similarly resolves display from `items`
or the placeholder
([searchable-select.tsx:102–106](../../../../../packages/ui/components/shadcn/searchable-select.tsx#L102)).
Neither inherently distinguishes retired, temporarily unavailable, inaccessible
or never-recorded values.

**Fix language:** render the authorized recorded stage separately from new-choice
eligibility, preserving stable identity and a clear retired label. Loading,
refresh failure and empty search must not clear or replace that value. Distinguish
“no eligible choices” from “choices could not load”; present the actual remedy
without inventing new access.

**Proof:** retire/restore/rename during an open editor, retained retired stage on
reopen, missing options during refresh and duplicate labels keep the correct
recorded identity. Unauthorized history remains withheld. Cancellation and search
produce no command; destination eligibility is rechecked when saving.

### I03 — Selection is not save confirmation

**High impact; medium likelihood.** `SelectCell` calls `onValueChange`, closes,
then calls `onEditComplete` synchronously
([select-cell.tsx:38–53](../../../../../packages/ui/components/shadcn/data-table/cell-variants/select-cell.tsx#L38)).
It does not await a source receipt. The donor dialog does await its API before
closing and disables submission while pending, a useful pattern
([edit-donor-dialog.tsx:169–192](../../../../../apps/missionary/app/donors/edit-donor-dialog.tsx#L169),
`:337–347`), but server failures are handled only by toast. Its reset effect also
resets an open form when the source-derived initial values change (`:70–81`).

**Fix language:** expose pending, accepted, failed, conflict and unknown-outcome
states around the shared control. Never label a tentative selection “saved.”
Preserve the user's draft on an ordinary failure; show durable nearby feedback
and retry/reload choices. A stale assessment needs current-state reconciliation,
not silent last-writer-wins or automatic resubmission. Design a short routine
interaction, without adding a confirmation ritual solely because guidance exists.

**Proof:** slow response, denied mutation, stale journey/catalog, network loss
after commit, dismissal and late responses cannot claim false success, erase
another draft or apply to a different journey. Optional explanation stays
optional. Keyboard focus remains useful after both success and rejection.

### I04 — Reuse command infrastructure carefully, not generic browser writes

**High impact; medium likelihood.** The exported generic table mutation hook
uses a browser Supabase client, updates the requested table filtered by one ID,
optimistically snapshots the entire list, restores that snapshot on error, then
invalidates one key
([use-data-table-mutation.ts:66–99](../../../../../packages/ui/components/shadcn/data-table/hooks/use-data-table-mutation.ts#L66),
`:127–178`). No matching consumer call was found in the inspected app/package
search; this is not a demonstrated authorization vulnerability. The helper alone
supplies neither P27 authority, version checking nor atomic stage history. A
whole-list rollback can also discard newer client state under overlapping edits.

Existing server wrappers obtain authentication and expose correlation IDs;
`requireCrmAccess` checks staff roles and tenant context
([with-operation.ts:128–165](../../../../../packages/api/src/shared/with-operation.ts#L128),
[access.ts:22–62](../../../../../packages/api/src/crm/auth/access.ts#L22)).
These are reusable plumbing, not proof of the future journey/Ministry Assignment
scope decision or permission grant.

**Fix language/proof:** use the authorized source command with expected current
version and a retained command identity; commit assessment, history and receipt
together. Test concurrent assessments, retirement versus selection, permission
revocation, forged scope, duplicate retry and denied direct writes. Reconcile
optimistic state by operation/version, or keep the authoritative value visible
while pending. Do not clone the generic hook and call it governed history.

### I05 — Correlation and a second audit write do not prove durable retry

**High impact; medium likelihood.** CRM note creation is an instructive nearby
boundary: the route passes `requestId` to its service
([notes/index.ts:52–70](../../../../../packages/api/src/admin/crm/notes/index.ts#L52));
the wrapper creates a fresh random UUID on each request
([with-operation.ts:128](../../../../../packages/api/src/shared/with-operation.ts#L128)).
The service uses that ID for dedupe, inserts the note, then separately logs the
command and throws if logging fails
([notes/service.ts:190–204](../../../../../packages/api/src/admin/crm/notes/service.ts#L190),
`:224–278`). The logger makes its own insert
([commands/log.ts:88–104](../../../../../packages/api/src/crm/commands/log.ts#L88)).
Thus this source sequence can persist a note before reporting logging failure;
it is not an atomic receipt precedent. The note UI clears on success and otherwise
shows a toast, with no retained client command identity
([detail-drawer.tsx:598–618](<../../../../../apps/admin/app/(app)/crm/detail-drawer.tsx#L598>)).
No live failure was injected here.

**Fix language/proof:** retain a stage-command key across ambiguous transport
retry, bind it to actor/scope/intent, and recover the authorized original result.
Distinguish correlation from idempotency. Inject rollback failure and lost success
response: no assessment without required history, no duplicate history or effects,
and no retry key reused to change intent. An optional comment must not become the
required proof that every assessment is legitimate.

### I06 — Freshness must cover every displayed representation

**Medium impact; high likelihood without explicit coordination.** CRM detail and
grid queries use 30-second stale windows and disable focus refetch; the grid also
retains previous data while fetching and mirrors loaded pages into a local
collection
([admin-crm-detail.ts:85–97](../../../../../packages/database/hooks/admin-crm-detail.ts#L85),
[admin-crm-infinite.ts:168–208](../../../../../packages/database/hooks/admin-crm-infinite.ts#L168)).
The note hook invalidates detail/grid/notes after success (`admin-crm-detail.ts:100–120`),
and the route invalidates server CRM tags. This is useful coordination, not
cross-client current-stage proof. Server revalidation uses `"max"` and logs errors
([cache-tags.ts:82–106](../../../../../packages/api/src/shared/cache-tags.ts#L82)).

**Fix language/proof:** apply the authorized source result to the affected journey
and refresh its detail, board/list, history and stage choices through existing
query mechanisms. Separate “saved, refreshing view” from source failure. Test
out-of-order responses, changed filters, a second tab and lost access; old cache
must not authorize writes or reinstate disallowed detail. Do not add another
client state store or invent a measured latency promise.

### I07 — Useful guidance is accessible content, not an entry gate

**Medium impact; medium likelihood.** Shared form fields already connect labels,
descriptions and errors using stable IDs; the select exposes invalid state and
associated error text
([tanstack-form.tsx:142–170](../../../../../packages/ui/components/primitives/tanstack-form.tsx#L142),
`:216–242`, `:477–560`). `FieldError` uses `role="alert"`
([field.tsx:228–239](../../../../../packages/ui/components/shadcn/field.tsx#L228)).
`SearchableSelect` accepts associated-description IDs, names and disabled options; `SelectCell`
can render per-option descriptions (`:103–119`). Gift inline actions demonstrate
visible blocked reasons and next steps
([gift-inline-action-controls.tsx:161–205](<../../../../../apps/admin/app/(app)/crm/gift-inline-action-controls.tsx#L161>));
their financial operation policy is not D11 policy.

**Fix language/proof:** use these shared primitives for concise stage meaning,
optional detail and actionable source errors. Guidance must be available by
keyboard and touch, not only a hover tooltip or color. Do not introduce “required”
styling or an acknowledgement gate. Exercise Tab/Shift-Tab, arrows, Enter, Escape,
focus return, long/localized descriptions, zoom/reflow and screen-reader saving/
error announcements in the actual future flow. Keep drag-and-drop optional if a
board is offered; it does not substitute for an operable stage control.

## Narrow evidence actually executed

[source-probe/README.md](source-probe/README.md) records **3/3 existing
SearchableSelect tests passing** with real controls in jsdom: stable-ID keyboard
selection/focus restoration; empty-search status/selection retention; disabled
choice and refreshed-label behavior. Config, raw JSON, log, exact versions and
source hashes are retained. Installed Vitest 4.1.4 differs from declared 5.0.3;
the isolated harness avoids the previously observed root Sentry config startup
failure. This is not the full repository gate or a D11 end-to-end proof. No SQL
probe was repeated and no synthetic UI was presented as a product implementation.
