# Phase 1 — Source-of-Truth Ownership Matrix

> **Program:** SiteStacker Parity · **Phase:** 1 · **Status:** Ruled (founder
> ruling, Phase 9 grill session 2026-07-06) · **Base:** `develop`
> **Kind:** Governance artifact, not a build phase. This document is the
> standalone Phase 1 deliverable that the
> [`phase-map.md`](./phase-map.md) tracked as an open question.
> **Keystone decision:**
> [`ADR-0001`](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
> — Asym Postgres owns all CRM truth; Twenty CRM is retired.
> **Naming note:** this file is **not** related to the tombstoned
> [`phase-01-crm-operating-foundation.md`](./phase-01-crm-operating-foundation.md),
> which carried old roadmap numbering and was superseded by Phase 8.

Every later phase writes records somewhere. Before more write paths land,
this matrix fixes — per record type — **which system owns the truth, who may
write it, who wins a conflict, and how a divergence is repaired**. If any
document disagrees with this matrix, this matrix (and ADR-0001 behind it)
wins, and the disagreement is a bug to fix, not a fork to preserve.

## The one-sentence ruling

**Asym Postgres is the system of record for all operational truth. External
systems execute, store bytes, move money, send messages, or publish content —
they never own operational truth — and Twenty CRM is retired as a product
dependency entirely (ADR-0001, 2026-07-06).**

## Ownership matrix

| Record type                                                                             | System of record                                                                                                           | Write path                                                                                                                                         | Conflict winner                                                                                              | Repair path                                                                                                                                                                      |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth users, sessions, credentials                                                       | Supabase Auth                                                                                                              | Supabase Auth flows (magic link, password, claim per Phase 4)                                                                                      | Supabase Auth                                                                                                | Supabase admin APIs; Phase 4 claim/bind audit                                                                                                                                    |
| Profiles, tenant memberships, roles                                                     | Asym Postgres (`profiles`, `authz.memberships` — the authz authority)                                                      | `packages/api` identity services                                                                                                                   | Asym                                                                                                         | Phase 4 identity services + audit spine                                                                                                                                          |
| CRM person spine (persons anchor, party entities)                                       | Asym Postgres (Phase 4 inert anchor → Phase 7 populated party spine)                                                       | `packages/api` (Phase 7 party services)                                                                                                            | Asym                                                                                                         | Phase 4 merge (`merge_operations`, reversible)                                                                                                                                   |
| Donors (legal donor identity)                                                           | Asym Postgres (`donors`; `donations.donor_id` = sole hard credit)                                                          | `packages/api` donor/identity services                                                                                                             | Asym                                                                                                         | Phase 4 non-destructive merge; frozen receipt snapshots never re-resolve                                                                                                         |
| Missionaries                                                                            | Asym Postgres (`missionaries`)                                                                                             | `packages/api` missionary services                                                                                                                 | Asym                                                                                                         | Standard service-layer correction + audit                                                                                                                                        |
| Households, organizations, churches (parties)                                           | Asym Postgres (Phase 7: `households`, org profiles, `org_contacts`)                                                        | `packages/api` (Phase 7)                                                                                                                           | Asym                                                                                                         | Phase 4 merge contract extended to party children                                                                                                                                |
| Relationship graph (typed edges between records)                                        | Asym Postgres (Phase 9 net-new)                                                                                            | `packages/api` CRM services (Phase 9)                                                                                                              | Asym                                                                                                         | Phase 9 relationship management + audit                                                                                                                                          |
| CRM notes                                                                               | Asym Postgres (Phase 9 net-new; withdrawn from the Twenty path)                                                            | `packages/api` CRM services (Phase 9)                                                                                                              | Asym                                                                                                         | Ordinary row edits + audit; no provider reconcile                                                                                                                                |
| CRM tasks                                                                               | Asym Postgres (`mission_control_tasks`, `missionary_tasks`)                                                                | Existing task services                                                                                                                             | Asym                                                                                                         | Existing task flows                                                                                                                                                              |
| CRM activity timeline                                                                   | Asym Postgres (Phase 9 net-new; composes source-truth events)                                                              | Emitting services write facts; timeline composes                                                                                                   | Underlying source of each fact                                                                               | Recompose from sources                                                                                                                                                           |
| Duplicate candidates & merge state                                                      | Asym Postgres (`crm_merge_candidates`, `merge_operations`)                                                                 | Phase 4 dedupe scan + merge workbench                                                                                                              | Asym; merges never auto-run                                                                                  | Reversible un-merge (Phase 4)                                                                                                                                                    |
| Money: donations, refunds, payouts                                                      | Asym Postgres ledger; **Stripe = payment executor only**                                                                   | Donate paths + contribution operations (`packages/api`)                                                                                            | Asym always                                                                                                  | Adjustment ledger (`contribution_adjustments`), never in-place edits                                                                                                             |
| Automatic recurring intent and schedules                                                | Asym Postgres (Phase 16 recurring group/cohort/line, schedule epochs, occurrences and commands)                            | Phase 16 services own intent and scoped mutations; Stripe executes authorized leg/item bindings, generates ordinary renewals, and returns evidence | Asym intent and append-only command/epoch history; provider events prove execution, never intent             | Reconcile provider-generated ordinary renewals and scoped mutation/recovery commands to exact bindings; quarantine unknown/control-loss state; formal proof-gated cutover        |
| Fixed-total pledges and fulfillment expectations                                        | Asym Postgres (Phase 16 fixed pledge, plan versions, expectations, unscheduled balance lines and fulfillment applications) | Phase 16 pledge and fulfillment services; Phase 13/15 remain the only money writers                                                                | Asym pledge versions and conserved fulfillment applications                                                  | Append correction/release/restore or exact inverse application; never mutate posted money or infer ownership from payment identity                                               |
| Receipt & statement facts                                                               | Asym Postgres (Phase 7 immutable versioned facts)                                                                          | Phase 7 receipt/statement engine                                                                                                                   | Asym; renderers never author truth                                                                           | Version supersede/void, never mutation                                                                                                                                           |
| Generated-document definitions, requests, artifacts, current heads and records evidence | Asym Postgres metadata plus private object storage for exact bytes (Phase 18)                                              | The single Phase 18 Generated Document service; renderers and storage are subordinate executors only                                               | Asym purpose/facts/publication/current-head records plus the validated artifact digest and object generation | Source-authorized immutable correction/replacement, exact-byte recovery, or purpose-owned verified disposition; never rerender history or treat a provider URL/file as authority |
| Communication history                                                                   | Asym Postgres (Phase 6 `communication_events`); Resend/Mailchimp = providers                                               | The single Phase 6 `sendEmail` seam                                                                                                                | Asym                                                                                                         | Phase 6 delivery-event reconcile                                                                                                                                                 |
| Public content, pages, publishing state                                                 | Payload CMS                                                                                                                | Web Studio / CMS flows                                                                                                                             | CMS for content; **CRM for operational identity**                                                            | CMS versioning/publish state                                                                                                                                                     |
| Files                                                                                   | Storage provider holds **bytes**; Asym owns metadata/permissions (Phase 29)                                                | Future file-manager services                                                                                                                       | Asym for metadata, always                                                                                    | Re-link/reissue from Asym metadata                                                                                                                                               |
| Workflow / process truth                                                                | Asym Postgres; **Inngest = execution infrastructure only**                                                                 | Workflow services (Phase 34)                                                                                                                       | Asym                                                                                                         | Durable-workflow replay from Asym state                                                                                                                                          |
| ~~Twenty CRM~~                                                                          | **Retired (ADR-0001).** No surface may read or write it                                                                    | None — the write path never opens                                                                                                                  | Not applicable — no competing copy exists                                                                    | Cleanup ticket (#602) removes dormant code; no reconcile needed                                                                                                                  |

**Provider rule (generalizes the last rows):** a provider may _execute_ an
action (charge a card, deliver an email, store bytes, host a login) and Asym
links the provider object by ID (the `crm_record_links` pattern, generalized
to Stripe/Mailchimp links). A provider ID is a **link, not an identity** —
losing or re-pointing it must never change who a record _is_ or what money
_happened_. For recurring giving, the provider's account, subscription, item,
invoice, payment method, and charge identifiers are execution evidence only.
They never replace the Commitment Party, donor authorization, Asym schedule,
expected occurrence, fulfillment, or posted contribution truth.

## Evidence & the one open verification item

- Repo evidence for "production Twenty was never live": three independent
  documents (integration completion-verification; Phase-4 env audit;
  Phase-8 PRD) — cited in ADR-0001.
- **Open item (Lane 2, human check):** the 2026-05-14 follow-up evidence file
  records `TWENTY_API_URL` / `TWENTY_API_KEY` / `TWENTY_WEBHOOK_SECRET`
  configured in the Vercel production/admin project, while the same-day env
  audit found no `TWENTY_*` keys in production runtime. The cleanup ticket
  (#602) must verify and revoke these entries and record the outcome per the
  Phase 0 Built/Live/Confirmed discipline.

## What changed where (congruence pointers)

The retirement ruling touches these documents (all edits point back here and
to ADR-0001; historical evidence files receive pointers only, never
rewrites):

- **This folder:** `README.md` (Phase 8 charter blurbs), `parity-matrix.md`
  (Area 1 reframed; Areas 2–3 de-Twenty'd), `phase-map.md` (rows 1 and 8–10,
  surface-ownership table), `phase-02-…md` (CRM tenant-scope wording — the
  earlier Twenty phrasing retired), `phase-04-…md` (A2 amended; reserved
  Twenty seam removed), `phase-06-…md` (negative-direction "Twenty person"
  mentions annotated — the rule survives provider-neutrally),
  `phase-07-…md` (C4 enum-extension note re-scoped), `phase-08-…md`
  (scope-amendment banner; Twenty write-enable withdrawn; re-groom pending).
- **OpenSpec:** `openspec/changes/integrate-twenty-crm-core/**` — RETIRED
  banner; spec deltas withdrawn, never to merge; physical archive move
  deferred to the cleanup ticket (#602). No **merged** spec mentions Twenty;
  no merged-spec change is required.
- **Guides:** `docs/guides/features/twenty-crm-integration/**` and
  `docs/guides/operations/twenty-crm-cutover.md` — status banners.
- **Glossary:** root `CONTEXT.md` — provider-neutral rewrites of the Phase-8
  operating terms (CRM Write Gate et al.) pending the Phase 8 re-groom
  (#603).
- **GitHub:** issue re-scoping **applied 2026-07-06** after founder
  approval — Phase 8 epic #587 carries the ADR-0001 scope banner and
  children #588–#601 carry ADR-0001 notice comments; #599 (the withdrawn
  Notes write-enable tranche) and the old Phase 1 issues #466–#476 are
  closed as superseded; Phase 4 epic #503 carries its ADR-0001 amendment
  section; the cleanup ticket (#602) and the Phase 8 re-groom session
  (#603) are filed.

## The cleanup ticket (#602 — dormant-code removal)

Scope recorded from the 2026-07-06 code inventory. **Delete:** the Twenty
client stack (`packages/api/src/crm/client/**`, health, gateway,
`schema/twenty-object-model.ts`), webhook ingress (both `webhooks/**`
packages + `crm_webhook_events`), Twenty read-through list services
(admin `relationships`/`notes`), the projection/mirror stack
(`projections/**`, `reconciliation`, `/crm/projections` UI), mapping
transforms, and the staff-visible "Twenty CRM owns …" strings (6 in
`packages/api/src/crm/projections/contracts.ts`, 1 in
`packages/api/src/admin/crm/relationships/model.ts`, 1 mirrored type literal
in `packages/database/types/crm-relationships.ts`).
**Keep:** the Supabase-backed CRM grid/detail/reports/table-preferences,
`auth/access.ts`, `commands/log.ts` + `crm_command_logs`,
`mapping/duplicates.ts` + `normalize.ts` + `crm_merge_candidates`,
`crm_record_links` (+ its identity-mapping migration/service surface —
ADR-0001 decision 3), and the durable idempotent outbound-queue pattern
(genericized) for future provider sync. **Also:** verify/revoke the Vercel `TWENTY_*` entries; remove the dev
Twenty Cloud proof record + dev API key; forward-migration re-`COMMENT` of
`staged_gifts` / `crm_command_logs`; archive the `integrate-twenty-crm-core`
package with a link-fix sweep.

## Open items

1. **Phase 8 re-groom (#603)** — a dedicated grill session re-scopes the
   operating foundation against Asym-internal subjects (ops visibility, data
   health, alerting). Until it lands the Phase 8 PRD carries a
   scope-amendment banner and its issues carry applied ADR-0001 scope
   notices, not silent changes.
2. **Lane 2 verification** of the Vercel `TWENTY_*` discrepancy (above).
3. **Issue re-scoping** — executed 2026-07-06 after founder approval: epic
   #587 bannered, children #588–#601 commented, #599 and #466–#476 closed
   as superseded, #602/#603 filed.

## Dated Phase 17 ownership amendment (2026-07-19)

**Old statement.** The matrix assigns Communication history to Asym Postgres
through the Phase 6 `communication_events` spine and treats Resend/Mailchimp as
providers. It does not yet name Phase 17's configuration and presentation
records.

**New winner.** Asym Postgres also owns the Phase 17 executable system-message
catalog and activation generations; tenant drafts and immutable publications;
Brand Kits, Role Layouts, locale readiness, fallback policy, and Delivery Plan
versions; the tenant-owned Resend connection, Sender Profile and human-reply
destination revisions; and the separately protected, expiring Recent sent copy
detail. Code owns stable catalog meaning and lifecycle. Resend executes email
and returns signed evidence only.

**Compatibility boundary.** Phase 6 continues to own communication intent,
event, dispatch, consent snapshot, provider reconciliation, and durable
body-free history. Producer domains own eligibility, facts, recipients, timing,
and protected actions. A provider message/template/account identifier is a
link, never product identity or authority. A Recent sent copy is subordinate
support detail, never communication truth, an official artifact, or a retry
payload. All tenant-facing Phase 17 records carry `tenant_id NOT NULL`,
same-tenant composite references, and the Phase 12 access floor; provider-ingest
evidence may be service-only only behind an explicit isolation contract.

## Dated Phase 19 ownership amendment (2026-07-24)

**Existing authorities remain unchanged.** Phase 7 owns the legal-donor
Statement Subject, eligibility, facts, coverage, and correction effect. Phase 13
owns posted money; Phase 14 owns recognition; Phase 18 owns generated-document
definitions, requests, logical identity, exact artifacts, current heads, access,
and records; Phase 17/6 own communication preparation, transport, delivery
evidence, and history.

**New winner.** Asym Postgres owns Phase 19's immutable Run Preflight and
purpose-pinned Statement Run/Run Items; append-only participation and release
evidence; Recipient-Document Operations, frozen delivery snapshots and
Destination Succession; Fulfillment Plans and derived Execution Lanes; release
and control fences; physical-fulfillment attempts; completion snapshots; late
fact/supplemental obligations; and the PII-minimized Run Evidence Record. The
tenant- and actor-scoped Statement Operations service is the only Phase 19 write
path.

**Conflict and repair.** A Phase 19 record never wins a conflict against its
source authority or rewrites a released run. Rebuild disposable projections,
append participation/control/completion/recovery evidence, reconcile
indeterminate external work, and create a supplemental or source-owned
correction operation. Inngest, renderers, Resend, print providers, mail houses,
object storage, and local downloads are subordinate executors or evidence—not
statement-run authority. Every Phase 19 record is tenant/environment scoped,
uses same-scope references and RLS, and preserves independently live document,
portal, communication, paper, incident, legal, and records truth.
