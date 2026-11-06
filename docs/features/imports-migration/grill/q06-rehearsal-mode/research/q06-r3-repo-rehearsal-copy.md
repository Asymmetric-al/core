# Q6 r3 — What a safe rehearsal copy would need (repository evidence)

Read-only, 2026-11-02. Baseline `develop` `629cb71dc`; Phase 29 read at PR #2430 head `1483a349`; #944 read with `gh` (open). This extends `q06-r1`. I re-checked r1's anchors and they all hold: `tenant-client.ts:64-66`, `send.ts:211`, `schema.sql:13-27`, `roadmap.md:161`, `:4365`, `CONTEXT.md:5075` and `environments.md:41`.

Labels:

- **impl:** implemented.
- **rat:** ratified (founder or accepted ADR).
- **pub:** published (a PRD, ticket or roadmap).
- **prop:** proposed.
- **der:** derived, meaning my own inference.

## 1. Outward-effect doors

### 1a. Live code (impl)

| Door                                 | Where                                                                                                                                                                                                                                                                                                                         | Tenant gate today                                                                                                                                                                  | Copy hazard                                                                                                                                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resend email using the tenant's key  | `packages/email/resend/send.ts:211` `sendEmail`. It holds the **only** `resend.emails.send` call (`:253`). Callers: `giving/receipts.ts:358`, `contribution-operations/notifications/send.ts:622`, `approval-notification-email.ts:239`, `email/test-send.ts`, `template-test-send.ts`, `eve/notifications/delivery.ts`       | The tenant must have connected Resend settings (`receipts.ts:316-327`, which otherwise returns 409)                                                                                | Without settings, a copy fails closed. Staff can connect a key in the copy at any time. Cloned `tenant_email_settings` would send from the ministry's real domain to real donors.                          |
| Payload email using the platform key | `apps/admin/src/cms/payload-runtime-integrations.ts:20-33` (`RESEND_API_KEY`)                                                                                                                                                                                                                                                 | None                                                                                                                                                                               | A second email door outside `sendEmail`.                                                                                                                                                                   |
| Supabase Auth email                  | `packages/ui/components/auth/RegisterScreen.tsx:75` `signUp`. Configured project-wide (`supabase/config.toml:196-203`); the custom auth hook is commented out (`:261`)                                                                                                                                                        | Project-wide only                                                                                                                                                                  | Cannot be gated per tenant without an Auth hook.                                                                                                                                                           |
| Stripe                               | Every money path goes through `resolveTenantStripe` (`stripe/tenant-client.ts:36`). Callers: `donate/index.ts:51,:273`, `donate/outbox.ts:32`, `donations/index.ts:115`, `donor-portal/billing.ts:24`, `admin/contributions/replay.ts:51`, `tenant-stripe-key.ts:17`, `donation-saga-recovery.ts:39`, `stripe/webhooks.ts:72` | It falls back to the platform env key (`:59-66`). Production Stripe is **live-mode** (`docs/ops/environments.md:15`). Any tenant row gets a USD lane (`money/settlement.ts:13-23`) | With no key copied, charges and refunds land on **Asym's live account**. With the key copied, they land on the **ministry's live account**. Webhooks verify with the platform key (`webhooks.ts:426-438`). |
| Public CMS                           | `resolveTenantFromRequest` (`apps/admin/src/cms/public/resolve-tenant.ts:128`) resolves by `primaryDomain`, then by subdomain = slug (`:155`). It uses `findTenantBySlug` (`:89-104`), which **ignores `isActive`**                                                                                                           | None                                                                                                                                                                               | A copy's Payload tenant is publicly served at `<slug>.<host>` wherever DNS routes to it (DNS not verified).                                                                                                |
| Inngest                              | 7 functions, including 3 crons (`workflows/serve.ts:21-32`), on one platform app (`inngest/client.ts:12-14`)                                                                                                                                                                                                                  | None. The scans read every tenant unfiltered (`workflows/adapters/donations.ts:91-97`)                                                                                             | They act on any outbox rows a copy has.                                                                                                                                                                    |
| Hard-coded tenant                    | `packages/api/src/admin/org-settings.ts:9,:25,:69` reads and **writes** tenant `…0001` for any admin                                                                                                                                                                                                                          | Wrong tenant                                                                                                                                                                       | A copy admin would change another tenant's setting.                                                                                                                                                        |

Two smaller doors: Eve's Discord webhook (`eve/notifications/delivery.ts:279`) and Eve's model calls through `vercel_ai_gateway` (`packages/eve-runtime/src/governance-boundary.ts:29`), which send data to the model provider.

**Not found in code (grep):** SMS, push, calendar, Mailchimp (a UI label only, `apps/missionary/app/settings/page-client.tsx:252`), QBO/Xero, outbound webhooks, Phase 4 invitation or claim code (tables only, `20261025090000`), database-level HTTP (`pg_net`, `pg_cron`) and Stripe subscriptions (`phase-13…:1718`).

### 1b. Doors in owner contracts (pub or rat; not implemented)

- **P6 sends.** P6 already names one email seam: "`sendEmail` … is the sole email delivery point … A hard-blocking CI import-lint forbids provider-SDK sends outside the seam" (`phase-06-shared-communication-event-model.md:138`, pub). `dispatchCommunicationIntent` re-proves "matching-owner profile send-readiness" before dispatch (`:273`). No such lint exists in code.
- **P13 money.**
  - "One Connect wrapper that REQUIRES the exact account and mode" (`phase-13…:1570`). Tenants drop secret keys and add `stripe_account_id` (`:1892`).
  - A Settlement Account Binding is "one Tenant, one Legal Entity, one exact processor merchant account in one environment" (CONTEXT glossary).
  - No text forbids a second Tenant binding the same `acct_`.
  - Q1 clause 4 opens checkout only after a verified binding exists (rat).
- **P4 portal access.** Staff invite legacy donors to log in (story 18, `phase-04…:92`).
- **P16 recurring.** Formal cutover needs a donor-completed step (Q1 clause 8). "Test tenants/canaries exercise full flows" (`:2566`).
- **P19 statements.** "Test mode uses synthetic data and can never become live work" (`roadmap.md:1231`, Phase 19 D1–D18 rat). A real-data run in a copy is therefore neither test mode nor live work.
- **P20 accounting.** A provider grant is held per Tenant and Legal Entity (`phase-20…decision-log.md:184`). P21 field-account statements send through P6/P17.
- **P24 Sites.**
  - A new Site starts as private setup with no host, provider or money effect (`phase-24-multi-site-management.md:79`).
  - Custom hostnames are "unique platform-wide", and custom public roles are "production-only" (D72-R2, `phase-24-d72…:452-455`).
  - An issued giving address is "globally unique across Core … not scoped by environment, Tenant, or Site" and permanently reserved (D10-R7, `phase-24-d10…:211-216`). A copy that issues one would reserve it forever.
- **Other owners:** P31 signed webhooks (`roadmap.md:4450`); P34 "Historical imports remain outward-effect-dark" (`:4772`); P43/44 SMS dark until activated (`:4381`); P40 "every AI egress routes through this resolver" (`phase-12…:13`).
- **P30 itself.**
  - Historic data stays outward-effect-dark (`roadmap.md:4365`).
  - The g5 "four P30 deliverables" (`r10-gap-g5.md:222`, prop; `decision-log.md:348` "partially resolved") are: frozen disposition, batch-origin identity, P30 emitting no outward events, and history coverage. All four are **per row or batch**.
  - Batch-origin suppression is ratified only for content (ADR-0173 clause 21).
  - No suppression seam exists in code (decision-log §8).
  - **Gap (der):** staff click-through actions in a copy are not import-origin, so per-row darkness does not cover them. A copy needs darkness across the whole tenant.

### 1c. Tax documents and the #944 serial allocator

- **Imports issue nothing.** Imported gifts are Recorded outside Asym, which gives them no receipt plan (Q4 clause 2, rat).
- **Click-through can.** A gift staff enter in the copy is "first recorded in Asym" (Q4 clause 1), so it becomes issuable if the copy has an active issuer.
- **#944's key (pub).** The ticket says the owner is "the full CRA registration account … not a tenant label". Yet its allocator is "keyed by tenant/environment/full CRA registration-account identity".
- **Effect on a copy (der):** a copy sharing the Legal Entity would **not consume** the real counter. If the copy's issuer were activated, it would start a **second lifetime `R-` series for the same CRA registration**. That means duplicate serials and broken nonreuse.
- **Why this is safe today.** The Canadian pack is "structurally absent until one exact issuer passes … gates" (`phase-18…:122`). Plan facts do not exist for an issuer that never activated (`phase-07…:307`). A copy is safe only if issuer activation is **never cloned and never allowed**.
- **No uniqueness across tenants.** Nothing stops two Tenants holding the same Legal Entity registration. A Legal Entity sits "beneath a Tenant" (`CONTEXT.md:6780`).
- **US acknowledgments.** References are opaque, so nothing is consumed (`phase-07…:217`). A copy-issued acknowledgment would still be a real-looking tax document.

### 1d. Is there a single chokepoint?

- **P12 data egress.** P12's closed `EgressDoor` union (`:1645`) covers only **data-disclosure** transports (REST, CSV, realtime, AI streams, telemetry and similar). None of them sends, charges, publishes or calls a webhook.
- **Where a check could hook in.** The tenant is branded into `EffectiveAccess<TenantId>` from one Tenant Authorization Context (`:1553`), and purpose is bound to each surface (`:1654`). A tenant-class attribute could deny effect purposes there (der). But effect seams belong to separate owners: P6 dispatch, the P13 wrapper, P24 host admission, P31 delivery, the P20 grant and P18 activation.
- **Live code already has narrow seams:** one Resend call, one Stripe resolver, one workflow dispatcher with an envelope guard (`workflows/dispatch.ts`, `envelope-guard.ts`) and one public tenant resolver.
- **Answer:** there is no single outward-effect door. A tenant-class predicate would have to be honoured in about 10 seams.

## 2. Tenant model

- **`tenants` table** (`supabase/schema.sql:13-27`; `20250101000000_init_schema.sql:14-24`; `20260214090000_foundation_1_schema.sql:82-86`): no class, status or lifecycle column; plaintext `stripe_secret_key` and `stripe_webhook_secret`; `slug UNIQUE`.
- **152 foreign keys reference `tenants`** (as created; I found no later changes):
  - 125 `CASCADE`;
  - 3 `SET NULL`;
  - 23 NO ACTION, including `profiles`, `donors`, `donations`, `funds`, `audit_logs`, the `donor_merge_*` tables, `eve_audit_events`, `field_policies` and `persons`.
- **Unique across tenants (collision risks):**
  - `tenants.slug`.
  - **`campaigns.slug` is globally `UNIQUE`** (`foundation_1:21`, `:665-666`), so cloned campaigns would collide.
  - `stripe_raw_events.stripe_event_id` (`20260512190000…:39`).
  - `email_inbound_messages.resend_email_id` (`20260402090000…:153`).
  - In Payload `tenants`: `slug` is unique, plus `primaryDomain` (`collections/tenants.ts:33-41`).
  - In Payload `cms-users`: `email` and `supabaseUserId` are each unique, and each user has **one `tenantId`** (`cms-users.ts:30-46`). A staff member can therefore be a CMS user in only one tenant.
  - P24 hostnames and giving addresses (§1b).
- **Scoped per tenant:** `donors (tenant_id, email_normalized)` and `(tenant_id, profile_id)`; email suppressions (`…:143-144`).
- **Shared surfaces a copy would touch:** `auth.users` (email unique); `profiles` (one per user, one `tenant_id`); global `field_policies` rows (NULL `tenant_id`); the one Inngest app; Vercel Blob media under a prefix that is not tenant-scoped (`payload-runtime-integrations.ts:6,:44-48`); Sentry and platform logs.

## 3. Configuration cloning

- **No owner defines a tenant clone, configuration snapshot or tenant template.** I grepped for "clone", "configuration copy" and "tenant template" across PRDs and CONTEXT and found only unrelated hits.
- **Content precedent.** The nearest precedent is ADR-0173's content portability into private drafts.
- **What the copy needs before data lands (der):** Legal Entities (identity only); funds, designations and campaigns (watch the `campaigns.slug` collision); the P11 catalog with **identical** `field_key` and `value_key`, so practice-run mappings still apply; P10 classification (`country_risk` is tenant-owned, `phase-10…:139`), on which the Q5 alias floor depends; P3 field-policy overrides; P12 roles and groups, but not memberships; Sites only as private setup.
- **Never copy (der):** Settlement Account Bindings, `acct_` identifiers and Stripe keys; `tenant_email_settings`; host bindings and giving addresses; P20 provider grants; P18 issuer activation and serial state; P31 endpoints; Operator grants; donor and missionary logins (`profiles` links).

## 4. Tenant destruction

- **No delete command exists.** `DELETE FROM tenants` fails on the 23 NO ACTION tables. `supabase/seed.sql:40-51` deletes **all** tenants (r1).
- **Owner rules forbid cascade erasure,** so destroying a copy needs a ratified exception for its class (der):
  - Tenant lifecycle "cannot cascade-delete direct, basis, terminal, audit, or receipt history" (D40-AC104, `phase-24-d40…:1077`; D41-AC018 `phase-24-d41…:645`).
  - Tenant deletion "cannot silently erase legally/audit-relevant history" (`phase-24-d31…:777-779`); P26 allows "not an unrestricted cascade shortcut" (`phase-26-support-hub-requirements-b.md:2437`).
  - P7 forbids `DELETE` on dating facts (`:306`) and receipts (`:217`); #944 serial events are append-only; Q1 clause 10 says committed rows "are never deleted".
- **Offboarding** is defined only as the P21 D26 records export (`roadmap.md:2522-2528`).
- **Bytes.** A deletion must use the qualified provider mechanism, and backups follow their actual semantics (AC29-D13-05, `custody-and-integration.md:196`; AC29-D12-05 `:182`). Each deletion must name exact, finite targets, never a broad prefix (Q63-C04, `records-policies.md:117`).
- **ADR-0179 (rat):** "'non-production' does not prove that every shared database row or object is disposable, nor does it justify an unguarded reset" (`:18-19`).
- **Backups and telemetry.** The only documented check restores into disposable targets (`docs/ops/scale-observability-reliability.md:78-92`); **no hosted PITR or backup retention period is documented.** P6 purges erased data "from backups on the retention cycle" (`:176`). Copies in Sentry, Vercel logs and Inngest run state persist; P12 telemetry scrubbing (`:1649`, pub) is not built.

## 5. Identity and access

- **One tenant per login (impl).** `profiles.tenant_id` sets the tenant (`packages/auth/context.ts:297-302`); the JWT carries one `app_metadata.tenant_id` (`20260226113000_authz_memberships_foundation.sql:130-141`); Payload uses the same (`supabase-strategy.ts:396-402`). `authz.memberships` can hold several tenants (`:45-66`), but nothing chooses among them and no tenant switcher exists (grep).
- **Phase 12 target (pub, not built).** A person "may have several Tenant assignments but acts within exactly one at a time" (`CONTEXT.md:2878-2886`).
- **Consequence (der).** Staff would need either a second login with a different email, or to move their only identity's tenant. Moving it carries every session, including real-tenant work, into the copy. The Payload user cannot follow either way. Wrong-tenant work is therefore a structural risk, and the `org-settings.ts` hard-coding writes across tenants even when switching is done correctly.
- **Asym help access (Q5).** It is the O26 grant for one tenant and one Switch (`decision-log.md:298`). A copy would need its own ministry approval, and Q5 clause 6 forbids Asym holding a membership. #2281's defaults conflict with this (`:336`).
- **Q5 restricted-data floor.** The clause 4 floor needs P10 classification in the copy **before** any import.
- **Precedent against confusion.** Phase 24 requires a "Persistent private status" so a private Site is not mistaken for live (`phase-24…decision-log.md:542`).

## 6. Scheduled work across all tenants

- **Crons.** `dispatch-recovery-scan` (every 5 minutes, `:14`), `donation-saga-recovery-scan` (every 2, `:77`) and `stripe-event-recovery-scan` (every 2, `stripe-event-processing.ts:153`) all scan every tenant. If a copy has saga or outbox rows, they would run Stripe recovery for it using the fallback key.
- **Concurrency.** Limits are keyed per tenant (`donation-saga-recovery.ts:27`). #2087's `IMPORT_TENANT_CONCURRENCY = 1` is also per tenant. Copy commits would therefore run in parallel with real-tenant work on the same database (der; load and latency risk).
- **No platform billing or usage metering exists** (billing is excluded, `roadmap.md:161`). Eve monitors scan GitHub, not tenants. Q5 clause 8's content-free telemetry would count a copy's Switch unless it is labelled.
- **Future jobs.** Every all-tenant job would need to exclude the copy's class: P19 runs, P34 schedules, P16 reminders, P20 sync and P29 retention jobs.

## 7. Repository rules relevant to sandboxes

- **The rule the brief cites.** `CONTEXT.md:5075` lists "sandbox success as production proof" as an Avoid term for the Field Accounts Go-Live Readiness Manifest (P21 D27, rat).
- **Similar Avoid terms.** "sandbox success as live proof, test charge" (`:610-611`) and "sandbox means launched" (`:6550`).
- **Roadmap:** "Synthetic, sandbox, and production-shadow evidence stay distinct" (`roadmap.md:2546`); P19 test mode is synthetic-only (`:1231`).
- **Environments.** Preview: "never use production data" (`environments.md:41`). Production: "real donors, real money" with live-mode Stripe (`:11-17`).
- **Q2 clause 6 (rat).** "Non-production environments never hold real exports" (`decision-log.md:62`).
- **Test and canary tenants are synthetic:** P16 (`:2566`) and P24's "synthetic non-production Tenants" (`phase-24-d40…:1202`, prop).
- **Duplicates of restricted data:** "no second file store" (`docs/prds/program-roadmap/owner-constraints.md:170`); P10 keeps Asym's duties "for copies that remain in its custody" (`:576`); P12 residency keeps restricted data out of out-of-region replicas (`:1655`). **No rule forbids a governed second tenant copy.**
- **Acceptance gate C23** requires "zero unintended send, enrollment, payment or public effect" (`decision-log.md:231`).

## 8. Erasure and suppression during a rehearsal

- **Bindings are per tenant.** Source Record Bindings are keyed by Tenant and environment and "block re-creation after erasure" (`imports-migration/CONTEXT.md:72`). A copy has its own bindings. An erasure recorded in the real tenant mid-rehearsal therefore would **not** stop the copy re-creating that person from the earlier export (der).
- **Suppressions are per tenant too** (`…:143-144`). A do-not-contact recorded in the real tenant does not reach the copy.
- **Q1 clause 12** routes post-boundary requests only to legacy systems.
- **Erasure reaches copies within each owner's own scope:** P6 A15 anonymizes and purges backups on the retention cycle; P10 (`:576`, `:629`) covers copies; P29 disposal covers copies and backups.
- **No owner routes erasure or do-not-contact to a rehearsal copy.** This confirms r1's gap 11.

---

## Minimum safe design for a rehearsal copy (der)

The principle: **deny by construction where credentials resolve.** Do not rely on checks inside each feature.

1. **Class fixed at birth.** The copy carries one immutable fact recording its rehearsal class, its source tenant and a hard expiry. It can never become an operating tenant (the Shopify development-store pattern, r2).
2. **One outward-effect permit, enforced where credentials resolve.** Every effect needs a credential, so a rehearsal-class copy resolves none and fails closed:
   - Delete the platform-key fallback (`tenant-client.ts:64-66`) and the USD lane that any tenant gets (`settlement.ts:23`).
   - `sendEmail`, the Payload adapter, a Supabase Auth hook, Discord, the AI gateway and the workflow dispatcher all consult the same predicate.
   - Add an architecture test that provider SDKs are imported only in those seams. Precedents are P6 A2's import lint and P12's `never`-switch.
   - Each unbuilt owner seam takes the permit as a required input: P6 dispatch, the P13 Connect wrapper, P24 host admission, P31 delivery, the P20 grant, P18 issuer activation, P4 invite and claim, P16 cutover and P34 enrollment. That is one owner requirement each.
   - Optionally, a sending allowlist could permit system email to the copy's own staff only (the Salesforce "System email only" pattern, r2).
3. **Copy configuration from an allowlist.** Copy the §3 list. Never copy credentials, public identities (hosts, addresses, slugs) or issuer or serial state.
4. **Separate identity.**
   - Give the copy a distinct host and login, or build the P12 Active Tenant Assignment selector.
   - Show a persistent "Practice copy — nothing here is real or sent" status.
   - Remove the hard-coded tenant in `org-settings.ts`.
   - Make the Payload resolver honour the copy's class.
   - Give the copy its own O26 grant.
5. **Destruction contract.** Purge the copy's whole scope for this class only: rows (including append-only and audit tables), P29 bytes, Blob and Storage objects, and Inngest state. Record deletion evidence with a stated backup expiry. Exclude the class from every all-tenant job. This needs a ratified exception to D40-AC104, D41-AC018, D31 and Q1 clause 10 that applies to this class only.
6. **Privacy coupling.** While a copy exists, any erasure, do-not-contact or new restriction in the source tenant either blocks the copy's re-import of that person or ends the copy. The copy also falls under the Q2 clause 5(a) agreement (retention, backups, deletion).

**The strongest single chokepoint is a dedicated, disposable Approved rehearsal environment** that holds no live credentials:

- **Why it closes doors:** P24 custom roles are already production-only (D72-R2). The environment isolates `auth.users`, Payload users, slugs and crons, and destruction means deleting the project.
- **What it costs:** amending Q2 clause 6's last sentence; read-back approval of each environment; P29 custody qualified there; cross-environment configuration transfer; a guard refusing live keys; unknown provider backup-deletion semantics.

## Hard blockers

1. **Live Stripe effects.** The platform live-key fallback (`tenant-client.ts:64-66`) plus a USD lane for any tenant (`settlement.ts:23`) send copy charges and refunds to Asym's live account.
2. **Email doors outside any tenant gate.** Supabase Auth and Payload email use project or platform credentials. Staff can connect a real Resend key inside a copy.
3. **Public exposure.** `resolve-tenant.ts:89-104,:155` ignores `isActive`, so a copy's CMS pages are reachable on a platform subdomain.
4. **Cross-tenant writes.** `org-settings.ts:25,:69` writes the hard-coded tenant `…0001`.
5. **One tenant per identity.** This holds for `profiles`, the JWT and Payload `cms-users`. No switcher exists, and Payload cannot follow a staff member into a second tenant.
6. **No provisioning, class, clone or destruction exists.** Provisioning is explicitly out of programme scope (`roadmap.md:161`), and the no-cascade and append-only owner rules (§4) block destruction.
7. **Serial duplication.** #944 keys the allocator per tenant, so an activated issuer in a copy would start a duplicate CRA serial series. No uniqueness on Legal Entity registration exists across tenants.
8. **Permanent global reservations.** `campaigns.slug` is globally unique, and P24 D10-R7 makes giving addresses permanent and global.
9. **Privacy does not reach the copy.** Bindings and suppressions are per tenant, and no rule routes erasure or do-not-contact to a copy.
10. **Ratified text conflicts.** Q1 clause 3 forbids target-owner writes during practice runs; Q2 clause 5(b) says "its own Asym Tenant" and clause 6 bans real exports outside production. Using a copy as evidence collides with `CONTEXT.md:5075` and `roadmap.md:2546`.
11. **No Approved environment exists today.** Production data status (D13) and the hosted public-read hazard (D24/O20) are unresolved.
