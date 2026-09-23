# Phase 4 — Identity & Account-Claiming Foundation

**Contract revision:** 2026-09-16. Ratified Phase 25
[identity rules](./phase-25-donor-dashboard-depth/contracts/identity.md)
are incorporated in the implementation, testing and acceptance sections below;
implementation and qualification remain separately unproved.

> **Program:** SiteStacker Parity · **Phase:** 4 · **Status:** Groomed (grill-with-docs, 2026-07-04) · **Base:** `develop`
> **Predecessors:** Phase 2 (Site, Locale & Currency) · Phase 3 (Minimum Permission & Role-Scoped Projection)
> **Charter / matrix:** `docs/prds/sitestacker-parity/README.md`, `parity-matrix.md`

> **Canonical receipt-pipeline amendment (2026-07-27; Phase 7 / Phase 18
> congruency).** Phase 4 owns mutable identity claiming, dedupe, and merge—not
> receipt facts. Once Phase 7 exists, an issued receipt's legal donor resolves
> only from the immutable frozen facts in canonical `contribution_receipts`;
> Phase 4 may display that identity as read-only merge evidence but never
> changes it. Phase 4 creates no receipt-fact row and never writes, extends, or
> dual-writes the legacy `contribution_receipt_snapshots`,
> `gift_receipt_records`, or live-render paths. Before Phase 7 lands, receipt
> issuance that needs canonical frozen facts remains blocked rather than
> manufacturing an interim authority.

Modern SiteStacker parity for **how one real person shows up across the product** — as a login, a CRM person, a donor, a missionary, a provider identity — **without collapsing those into one object and without ever crossing a tenant boundary.** This is a foundation phase: it builds the genuinely-missing piece (donor **account claiming** and the **unclaimed-donor lifecycle**), formalizes the identity seam that already exists in the repo, adds safe donor **deduplication/merge**, hardens tenant isolation, and **reserves** (does not build) the full identity-management system so it can drop in later without a rewrite.

---

## Problem Statement

**Historical repository baseline (2026-07-04).** The following observations
record the original grooming investigation, not a current deployment claim.
The normative implementation and acceptance sections contain later ratified
amendments.

A single supporter already appears in the product in several forms — a login account, an operational donor record, a missionary, a Stripe customer — and today the links between them are **implicit**. Three concrete gaps block everything downstream (deeper donor portal, receipts, legacy-data import, missionary workspace, reports):

1. **There is no way for a supporter to "claim" their record.** Donors imported from legacy data or captured from offline gifts exist as `donors` rows with no login (`profile_id IS NULL` is already legal), but nothing safely binds one to a login. There is no claim flow, no legacy invitation, no verification, no guest-claim-later — anywhere in the codebase.
2. **Guest giving cannot safely recognize a returning supporter.** When someone gives online with the same email a staff member recorded offline, the system should quietly attribute the gift to the same person — but the _convenient_ version of that (pre-filling their name, offering their saved card, saying "welcome back") is an account-takeover and PII-leak vector, and the same class of bug Phase 3 already found in this repo.
3. **Identity work risks crossing tenants.** The platform is multi-tenant (each missions organization is a tenant). Without deliberate rules, a merge, a dedupe scan, a claim, or a shared login could leak one ministry's supporter data into another's — violating the platform's non-negotiable tenant-isolation boundary.

If we deepen donor/missionary features before this foundation exists, every module invents its own implicit identity rules, we accumulate duplicate people, and a wrong link hands one person another's giving history. The recon for this phase confirmed the identity _model_ is largely already present (auth → profile → donor/missionary, `authz.memberships`, `crm_record_links`, `crm_merge_candidates`); what is missing is the **claiming lifecycle, safe merge, and the tenant-safety hardening** that let the rest of the product trust identity.

## Solution

A **tenant-safe identity foundation centered on account claiming**, built from the supporter's point of view so it feels effortless while doing all the safety work in the backend. Six moving parts:

1. **The unclaimed-donor lifecycle.** A supporter is a first-class, permanent record whether or not they ever log in. Staff can record an offline gift with an email; that creates/updates an **unclaimed donor** (contact email stored **unverified**, no login). Contact capture creates neither a login nor a claim. An independently authenticated principal may exist without a financial donor record; only the separately admitted claim flow binds that principal to the intended donor.

2. **Invisible online attribution.** When a guest gives online with an email that matches an existing donor, the gift is attributed to that same donor — **no duplicate, revealing nothing, enumeration-safe, constant-time.** The supporter feels nothing; the history quietly unifies behind the scenes.

3. **Optional claiming with separate proof and access.** Email-first entry offers a safe link and secondary code redeeming the same issuance once; setting a password remains post-authentication. Phase 4 admits a claim only through fresh purpose-bound possession and current claim/link policy. Its accepted historical claim proof remains separate from mutable contact-email verification. Giving history and saved methods additionally require current Phase 12 context, subject, purpose and source admission; a verified mailbox or donor-row match alone grants no access. Staff may issue branded, expiring, revocable and audited legacy invitations without granting access on issuance or acceptance.

4. **Safe deduplication & non-destructive merge.** Staff can merge duplicate donors from a **self-healing dedupe queue** or directly from CRM search. Merges are **non-destructive** (reversible, replayable), let the admin compose a field-by-field **golden record**, repair only source-approved mutable CRM/Party references while preserving frozen financial and document history, and never auto-run.

5. **Strict tenant isolation ("Path 2").** Complete data isolation: separate donor records, memberships, and claims per tenant; **no cross-tenant linking, merge, single-view, or dedupe**; a shared login credential authorizes nothing on its own. Every identity surface is **per-tenant branded** so each ministry feels wholly separate.

6. **Minimal staff visibility.** A read-only view of a person's linked records and a claim/merge review queue in Mission Control — enough for staff to understand the connections, not a full identity-management product.

The foundation separates native authentication, exact claim/possession proof, current contact verification and current authorization. Google, Apple and Facebook are the selected optional donor-entry methods, each blocked until its native identity-admission and provider gates pass. Passkeys and staff SSO remain reserved; no provider email flag, shared mailbox or new native attachment substitutes for Phase 4 claim policy.

---

## User Stories

### Donor — offline capture & guest giving

1. As **finance staff**, I want to record an offline gift with the donor's email, so that the person exists in the CRM and can be contacted without me creating a login for them.
2. As a **donor who gave offline**, I want my email kept with my record, so that when I later give online it recognizes me without my having to set anything up.
3. As a **first-time online donor**, I want to give as a guest without creating an account, so that nothing blocks my gift.
4. As a **returning donor giving online with the same email**, I want my new gift attributed to my existing record automatically, so that my giving history stays unified and I'm not turned into a duplicate.
5. As a **donor**, I want the giving form to reveal nothing about whether my email is already on file, so that no one can probe the system to learn who gives.
6. As the **organization**, I want the giving form to behave identically (and in constant time) for known and unknown emails, so that neither the response nor its timing leaks whether someone is a donor.
7. As a **donor whose email is already on file**, I want the form to never pre-fill my name or offer my saved card to an unauthenticated session, so that a stranger typing my email cannot obtain my identity or payment method.

### Donor — claiming & login

8. As a **donor**, I want to set up online access whenever I choose, so that account creation is optional and never forced.
9. As a **donor**, I want one sign-in email containing a safe link and secondary code that redeem the same issuance once, so that I can complete email-first entry without creating or remembering a password.
10. As a **donor**, I want the option to set a password after I've proven I own my email, so that I can use a password if I prefer.
11. As a **donor**, I want giving history and saved methods to require my established claim or exact source grant plus current context and purpose authorization, so that a verified email alone never reveals financial data and a contact-email change never erases my established claim.
12. As a **donor who received a thank-you/receipt**, I want a clear, optional "set up access" link, so that claiming is easy but never pushy.
13. As a **donor who supports two ministries on the platform**, I want each to feel like its own organization, so that I never sense I'm using one shared system.
14. As a **donor who already has a login at one ministry**, I want setting up access at another ministry to just work without being told I "already have an account," so that neither my experience nor my cross-tenant existence is exposed.

### Donor — receipts, consent, privacy

15. As a **donor**, I want my receipt to reflect who legally gave on the date of the gift, so that my tax record is accurate even if records are later merged.
16. As a **donor who asked not to be emailed**, I want that preference preserved when I give again or when my record is merged, so that I'm never accidentally re-subscribed.
17. As a **donor**, I want my identity masked on missionary- and public-facing surfaces per anonymity/consent, while finance retains it for receipts and audit (Phase-3 rule), so that my privacy choices hold.

### Staff / finance — invitations

18. As **finance staff**, I want to invite a specific legacy donor to set up online access, so that I can onboard supporters after a data import.
19. As **finance staff**, I want invitations to come from the ministry (branded), so that donors trust and open them.
20. As **finance staff**, I want invitations to expire, be single-use, and be revocable, so that stale or mistaken invites can't be exploited.
21. As **the organization**, I want invitations never sent to suppressed/do-not-email addresses, so that we stay compliant.

### Staff — deduplication & merge

22. As **finance staff**, I want a queue of suspected duplicate donors, so that I can clean up the database over time.
23. As **finance staff**, I want a scheduled self-healing scan to surface new duplicates automatically, so that duplicates don't accumulate.
24. As **finance staff**, I want to merge two records I find while searching the CRM, so that I can act the moment I spot a duplicate.
25. As **finance staff**, I want to choose which record survives and pick, field by field, which values to keep, so that the merged record is the best of both.
26. As **finance staff**, I want to see gift counts and totals on each record while merging, so that I choose the right surviving record with the facts in front of me.
27. As **finance staff**, I want merges to repair only source-approved mutable CRM/Party references to the surviving canonical identity while preserving frozen contribution/legal-donor, receipt, statement, accounting and original commitment-owner facts and provenance, so that no history is orphaned and identity repair is never mistaken for an owner transfer. _(Amended 2026-07-13, Phase 16 A11/D14.)_
28. As **finance staff**, I want a merge to be reversible, so that an honest mistake isn't permanent.
29. As **finance staff**, I want an explicit, warned option to delete a merged-away empty record, so that I can keep the database clean when I'm certain — without ever risking giving history.
30. As **the system**, I want a merge to never run automatically and never span two tenants, so that two different people (or two ministries' records) are never silently combined.

### Missionary

31. As a **missionary**, I want my supporter relationships to remain intact through claiming and merges, so that my supporter list stays correct.
32. As a **missionary who is also a donor**, I want my workspace access and my donor self-service to stay separate contexts, so that neither leaks into the other.

### Admin / organization / compliance

33. As a **tenant admin**, I want complete assurance that no supporter data crosses to another tenant, so that our donors' data is isolated.
34. As a **tenant admin**, I want every identity surface — auth emails, login, claim, portal — to carry our branding, so that our donors experience our ministry, not a platform.
35. As a **tenant admin**, I want a read-only view of a person's linked login/donor/provider records and any claim/merge in review, so that staff can understand the connections.
36. As the **organization**, I want every claim, binding, invitation, attribution, and merge audited, so that access-granting actions are traceable.
37. As the **organization**, I want a supporter who supports two of our ministries to be represented cleanly (one login, two isolated records), so that we never have to choose between good UX and isolation.

### Developer / system (guardrails)

38. As a **developer**, I want all identity business logic in `packages/api` with thin app routes, so that the security boundary is not in the UI.
39. As a **developer**, I want every service-role database path routed through one tenant-guard wrapper, so that a missing `tenant_id` predicate can't silently cross tenants where RLS is bypassed.
40. As a **developer**, I want a permanent cross-tenant negative-test CI tier, so that isolation is proven continuously rather than assumed.
41. As a **developer**, I want a claim to set `profile_id` only inside a verified-possession transaction, so that no one can bind a login to a donor they don't control.
42. As a **future developer**, I want a typed person anchor already reserved, so that introducing the full constituent spine later is a populate-and-validate, not a re-point-everything migration.
43. As a **UI developer**, I want all Phase-4 screens to use the existing shadcn `base-maia` / zinc design tokens, so that the new surfaces are instantly consistent with the rest of the product.

---

## Implementation Decisions

### A. Architecture rulings (the settled decisions)

- **A1 — Scope: Option A, scaffolded to Option C.** Build account claiming + the unclaimed-donor lifecycle + safe merge + minimal visibility + isolation hardening. Formalize the existing seam (`authz.memberships`, `crm_record_links`, `crm_merge_candidates`). **Reserve** the full identity system. The original July 4 investigation estimated roughly 60% overlap with existing primitives; that historical estimate is not current feature coverage or acceptance proof. Verify each required source/migration before implementation.
- **A2 — Claim binding and target Party spine remain distinct.** The original
  baseline used `donors.profile_id` and `authz.memberships`; neither physical
  reference alone proves the current claim, contact verification or permission.
  Section B's claim command owns the accepted principal-to-Party/donor binding,
  separate historical proof and audited source consequences; Phase 12 owns
  current access. Asym Postgres owns CRM identity under ADR-0001. The inert
  `persons` anchor and nullable `person_id` FKs on missionaries/profiles were
  Phase 4 migration targets, **not a shipped-state claim**. Phase 7/9 govern the
  populated shared-PK Party spine; Phase 9 C1 replaces the proposed
  donor `person_id` with `donors.party_id`. Prove the actual schema and migration
  state before building consumers; this PRD does not certify those tables or
  foreign keys as installed.

- **A3 — Unclaimed donor is a permanent first-class state.** `donors.profile_id` NULLABLE stays legal forever; no code assumes a donor has a login. Phase 13 freezes the gift-time legal donor on the contribution header and represents guest/anonymous treatment explicitly; a _known but publicly-anonymous_ donor is never modeled as accidental absence of identity.
- **A4 — Offline-capture → invisible attribution → optional claim.** Staff capture stores an **unverified contact email** on the donor and creates no login. Online guest gifts **attribute** to a matching donor with the six safety rules (below). Claiming is optional, verified, and never forced.
- **A5 — Six safety rules (non-negotiable).** (1) Recognize but never reveal; (2) enumeration-safe form; (3) fresh purpose-bound proof is required for initial claim while current Phase 12 context/subject/purpose admission gates sensitive access; (4) saved-method access also proves the exact owner/customer/account/mode and saving or collection authority, never only an email-verification flag; (5) never force login to give; (6) a single clean match may attribute under the existing source rules, but ambiguity goes to staff review and attribution never establishes claim, native identity attachment or access.
- **A6 — Email-first entry; qualified claim proof.** A safe link and secondary
  code redeem one exact mailbox/purpose/request issuance once. Phase 4 binds
  only the intended same-Tenant claimant under current possession and claim
  policy. A clean unclaimed record requires fresh possession; an established
  claim cannot be overwritten or selected by matching a newly verified email.
  Native sign-in, contact verification and claim history are distinct. A
  password or provider assertion alone is not proof of current inbox possession.
  Set-password remains post-authentication; sign-in is enumeration-safe and
  does not reveal another Tenant's existence. Link/code and native OAuth
  callbacks retain their distinct qualified protocols (IC03); emailed scanner
  GET/HEAD requests establish no session or claim.
- **A7 — Tenancy: Path 2 (complete data isolation).** Single Supabase project; the shared credential authorizes nothing. Separate donor record, membership, and claim per tenant; **no cross-tenant linking, merge, single-view, or dedupe**; every access carries `tenant_id`. Physical per-tenant auth (separate projects) is reserved for future compliance.
- **A8 — Experiential separation is mandatory.** Every identity surface is per-tenant branded. For auth email, Phase 4/Supabase Auth is only the producer and purpose authority: its **Send Email Hook emits a typed auth-purpose request → Phase 17 resolves immutable prepared content and the bounded sender profile → Phase 6 creates the sole communication event, schedules/dispatches, and records provider outcome/history → Resend transports the message**. Phase 4 never renders or sends directly. Login/claim UI stays on the tenant's own domain with `base-maia`/zinc tokens; **no cross-tenant surface** appears in the donor portal. This is an acceptance criterion _and_ a test (unbranded chrome = failing build).
  **Phase 24 D57 amendment (2026-08-30):** “the tenant's own domain” means
  exactly one current verified Tenant Donor Portal Host per Tenant and
  environment, not a Site host or arbitrary alias. Sign-in, registration,
  claim, verification, recovery, protected Tenant action, portal, and sign-out
  remain on that Tenant-controlled host with no donor-visible Asym branding or
  `asymmetric.al` fallback. The host is presentation/routing only: every action
  still re-proves the exact Tenant relationship and authorization server-side.
  Required legal, merchant, processor, payment, security, and accessibility
  disclosures remain truthful and are not co-branding.
  **Phase 24 D58 amendment (2026-08-30):** every identity and account surface
  on that host uses the one current Tenant Donor Account Brand. The Default
  Site, entry Site, last gift, locale, referrer, query, cookie, and return
  destination never reskin authentication, recovery, navigation, errors, or
  support presentation. A currently valid same-Tenant entry Site may appear as
  restrained secondary context and a validated return action; direct, email,
  recovery, and bookmarked entry remain complete without it. Brand is bounded
  presentation and never selects Tenant, membership, authorization, Legal
  Entity, merchant, issuer, payment, support, or Site truth.
- **A9 — Merge is non-destructive, reversible, replayable, never automatic.** Admin picks the surviving record and composes a field-by-field golden record; eligible **mutable CRM references** re-point (`donor_feed_preferences`, `crm_record_links`, invitations, and current canonical Party references only where the source domain permits identity repair); frozen contribution, legal-donor, receipt, statement, accounting, and commitment-owner facts never re-point. Consent merges to the **most-restrictive**; a `merged_into_donor_id` tombstone plus a **replayable `merge_operations`** record make un-merge real; an **opt-in, completeness-gated** hard-delete may remove the empty shell without ever touching money history. Dedupe scan is on-demand + scheduled self-healing, **within-tenant only**. The re-point child list is expected to grow in later phases only for source-domain-approved mutable projections such as Party relationships and engagement rows; Phase 7 `contribution_receipts` and its frozen legal-donor facts are explicitly excluded. _(Amended 2026-07-06, Phase 9 C1: the re-point list additionally gains `parties`, `crm_relationships`, and the party-keyed engagement tables.)_ _(Amended 2026-07-13, Phase 16 A11/D14: only a governed, same-tenant merge of duplicate records proven to represent the same real-world Party may re-point a commitment's current canonical Party ID, while the commitment retains its immutable original Commitment Party snapshot and merge provenance. That identity repair is not an owner transfer. A genuine owner change supersedes the old commitment and creates a successor under fresh Party intent and collection authority; neither path may cross tenants.)_
- **A10 — Selected social scope with an unresolved native gate.** Google,
  Apple and Facebook are required optional donor-entry scope, each visible only
  when independently qualified and offered. Before a new email-matching
  provider identity can attach an authenticator or obtain usable native
  credentials for an existing principal, shared Auth must prove an officially
  supported native control enforcing current-account/possession policy across
  authorize, ID-token, manual-link, exchange, refresh and credential management.
  **G01 is unresolved; affected social activation remains blocked.** Verified
  email, provider metadata, a creation hook, hidden/manual-link-only UI,
  post-link application checks and coarse RLS do not prove that guarantee.
  Signing in by an already-bound stable provider subject is distinct from
  attaching a new identity by email; changed, absent and Apple relay emails
  follow IC04–IC05 without fabricated addresses or forced new accounts. No
  broker/fork or email-only scope reduction is approved. Passkeys and staff
  SAML SSO remain reserved. Supabase Auth remains the native principal/session
  owner; Phase 4 retains claim and possession policy.

### B. Deep modules (`packages/api/src/identity`)

Each is a deep module — a simple, testable interface hiding real complexity — with thin app routes calling in.

- **`tenant-guard`** — the mandatory wrapper for every service-role DB path (donate, guest-attribution, find-or-create, resolver, merge, Inngest). Requires an explicit tenant, binds a per-request tenant context to the DB session, and runs as a non-owner / non-`BYPASSRLS` role so `FORCE` RLS still applies. A CI grep gate fails any bare service-role client constructed outside it.
  - Shape (from grill): `withTenant(tenantId, (db) => …)` — resolves tenant from the same source of truth as RLS, `SET LOCAL app.current_tenant`, fails closed on disagreement.
- **`claiming`** — guest attribution + the verified-possession bind.
  - `attributeGuestGift({ tenantId, email, gift })` → find-or-create donor by normalized `(tenant, email)`; **reveals nothing**; defers dedupe to async so the response is constant-shape/constant-time.
  - `bindClaim({ tenantId, donorId, possessionProof })` → atomically records
    the admitted principal/profile-to-Party/donor binding, accepted exact
    historical proof, source-approved membership consequence and audit. Fresh
    single-use proof is necessary but cannot replace a different established
    claim or bypass current owner policy. Current contact-email revision and
    verification are separate facts: changing or clearing them neither inherits
    an old verified flag nor erases accepted claim evidence. Attribution and
    admin actions cannot call this seam without the required proof; later
    protected reads still re-prove Phase 12 authorization.
- **`invitations`** — `issue / redeem / revoke` legacy invitations; lifetime/single-use/revocation are our table's state (Supabase link/OTP tokens hard-cap at 24h, so a fresh short-lived Supabase link is minted at redemption). The invitation domain supplies purpose and variables; Phase 17 prepares branded content/sender identity and Phase 6 alone evaluates the communication policy, dispatches, and records history.
- **`merge`** — `previewMerge / executeMerge / unmerge / purgeShell`; executes inside the tenant guard; asserts `survivor.tenant_id === loser.tenant_id`; re-points only source-approved mutable CRM children; writes the replayable `merge_operations` record; and treats Phase 7 receipt/statement facts plus every immutable financial snapshot as read-only evidence. `purgeShell` is opt-in and gated on a completeness check proving no authoritative source still requires the shell. For Phase 16 commitments, merge may repair only a proven same-real-world canonical Party reference while preserving the immutable original owner snapshot and provenance; a real owner transfer uses supersession plus fresh authority, never merge.
- **`dedupe`** — `scan({ tenantId })` (on-demand + scheduled self-healing via Inngest, within-tenant matcher, exact-email=high / fuzzy=low) → populates `crm_merge_candidates`; never auto-merges.
- **Auth-email producer adapter** — the Send Email Hook handler resolves the tenant/site from trusted request/redirect context, validates the auth purpose and bounded variables, and submits that request to the Phase 17 prepared-message contract. Phase 17 returns immutable prepared content plus sender identity; the adapter hands it to Phase 6's sole communication seam. Only Phase 6 creates the communication event, dispatches through Resend, and records outcome/history.

### C. Phase-3 plug-in (no parallel systems)

- The **reveal-gate** uses the existing Phase 12 PDP and Phase 3 projection
  boundary. Authenticate the human through a validated Active Tenant Assignment,
  then independently admit the exact personal/represented source subject and
  purpose. No donor row, `email_verified_at`, profile role, household membership
  or demo Tenant is an authorization fallback. Record-only/document grants do
  not grant broader history, wallet or list access. Established claim proof
  remains valid evidence independently of a later contact-email change, while
  every read re-proves current source and authorization state. Guest attribution
  stays within the existing donate source and grants no portal access.
- **Export/consent governance** and the **audit spine** (identifiers-only) are reused from Phase 3 — identity events are new event types on the existing spine, not a new audit table.

### D. Data model

**Net-new tables (2):**

- `account_claim_requests` — a donor- or exception-initiated claim awaiting resolution/review. `tenant_id NOT NULL`, `donor_id` nullable, email, requester, status (`pending | verified | approved | denied | expired`), match type + confidence, reason, resolver, timestamps. RLS: staff + own-requester.
- `legacy_account_invitations` — staff invite bound to a donor: `tenant_id NOT NULL`, `donor_id`, email, inviter, Supabase link reference, status (`sent | accepted | expired | revoked`), `expires_at` (7-day default), `revoked_at`. Single-use, revocable, consent-gated. Bulk reserved.

**Net-new columns:**

- `donors.email_verified_at` is historical/current contact-verification
  evidence only when tied to the exact current contact-email revision. It is
  not the durable claim record or the portal reveal gate. The adopted claim
  binding and accepted historical proof persist separately from mutable contact
  revisions; migrations classify known proof provenance and leave ambiguous
  records unresolved rather than backfilling claim from equal emails or current
  Auth verification.
- `donors.merged_into_donor_id` (nullable, composite tenant FK) — merge tombstone.
- **No receipt-fact column or interim snapshot.** Phase 4 reserves the
  integration contract only: when Phase 7 issues a receipt,
  `contribution_receipts` freezes the exact legal-donor and Legal Entity facts
  and becomes the sole authority. Phase 4 merge/redaction may change mutable
  CRM projections but cannot update those facts or create a pre-Phase-7
  substitute.
- **Inert reserved:** empty `persons` (`id`, `tenant_id`, `created_at`) + nullable `person_id` FK on missionaries/profiles — not populated or read in Phase 4. _(Amended 2026-07-06, Phase 9 C1: the `person_id`-on-donors reservation is superseded — `donors` never receives `person_id`; `donors.party_id` is created in its place.)_
- **Replayable:** a `merge_operations` record (survivor, loser, per-child re-pointed FKs, golden-record choices, pre-merge consent).

**Reuse:** `authz.memberships` (roles/multi-hat); `crm_record_links` (provider links — Stripe now, Mailchimp later; the second Stripe customer from a merge lands here); `crm_merge_candidates` (dedupe/review, extended to reference two same-tenant Asym donor ids); Phase 6 consent/suppression and communication-event contracts; Phase 17 prepared-message/content/sender contracts (existing Email Studio tables are implementation evidence, not Phase 4 authority); the Phase-3 audit spine.

**Reserved seam (entity-link types):** the `crm_link_entity_type` DB enum and its TS mirror `CrmIdentityConceptId` reservation remains for **generalized provider links only** (re-scoped 2026-07-06, ADR-0001): `household` / `organization` / `daf_sponsor` (and `person` / `gift_credit`) entity-link types are added only if/when a provider link actually needs them (see Phase 7 C4); Phase 4 ships only the current entity-link set (baseline: `supabase/migrations/20260508000413_crm_identity_mapping.sql` and `packages/api/src/crm/identity/concepts.ts`).

**Keys & isolation (build-verified):** `unique(tenant_id, profile_id)` (**not** `unique(profile_id)`); a partial unique on `lower(email) WHERE merged_into_donor_id IS NULL AND email IS NOT NULL` ("one unclaimed donor per email per tenant"); one canonical **email-normalization** function used identically at find-or-create, claim, and dedupe (store raw + normalized); **composite `(tenant_id, id)` PKs and FKs** across the spine (FK checks bypass RLS, so composite tenant FKs make cross-tenant references structurally impossible); every tenant-scoped table `ENABLE` **and** `FORCE` RLS; `profile.tenant_id` **quarantined as non-authoritative** (home/UI hint only — the current Phase 12 Tenant Authorization Context supplies the one trusted Tenant; membership-backed humans require one validated assignment, while public/NHI/operator variants retain their exact source context).

### E. Contracts / wiring

- **Supabase Auth:** reuse qualified `signInWithOtp` link/code entry,
  `admin.inviteUserByEmail`/`generateLink` and matching verification for fresh
  invitation redemption, and `updateUser` for authorized credential changes.
  These API names are integration inputs, not proof of claim safety. Native
  email-matching identity attachment is blocked behind A10/G01 until the exact
  supported admission control passes direct-endpoint proof. The Send Email Hook
  is the authenticated producer adapter, not a parallel sender.
- **Phase 17 → Phase 6 → Resend:** Phase 17 prepares the immutable,
  tenant-branded auth message and sender/reply resolution; Phase 6 alone
  dispatches and records communication history; Resend transports. The hook
  carries only a server-issued opaque context handle in `redirectTo`. Server-side
  lookup re-proves tenant, site, recipient, action, and template before
  rendering; no URL field selects authority.
- **Inngest:** scheduled self-healing dedupe scan (the shipped recovery-scan / donation-saga-recovery Inngest pattern).
- **UI:** all Phase-4 screens use the shadcn **`base-maia`** style + **zinc** tokens defined in `packages/ui/styles/globals.css` (re-exported by `theme.css`), consumed via `@asym/ui`, built on **Base UI** primitives and `DataTableResponsive`. No ad-hoc colors; if a token is unclear, look it up in `packages/ui/styles/globals.css`.

### F. ADRs (to author with the docs ticket)

1. **Profiles-as-anchor + reserved typed person spine** (defer the populated spine; reserve the inert typed anchor rather than a polymorphic identity-links table).
2. **Path-2 tenant isolation** — data-layer isolation with a shared credential that authorizes nothing, chosen over physical per-tenant auth, given Supabase's single-project global-unique email.
3. **Guest attribution never grants identity or access.** Enumeration-safe attribution, fresh exact claim proof, stable historical binding and current authorization are independent; native email-matching attachment must satisfy the unresolved A10/G01 gate rather than relying on a provider verified-email guarantee.
4. **Non-destructive, replayable merge** (tombstone + `merge_operations`) chosen over the industry-standard irreversible merge.

### G. Merge-UX & receipt-integrity amendment (Phase-8 grill, 2026-07-06)

Added during the Phase-8 (CRM Operating Foundation) grill, which confirmed **Phase 4 — not Phase 8 — owns the donor merge/dedupe workbench**, and surfaced a receipt-integrity hazard to close here. Enriches **#514** (Merge UI) and strengthens **#507 / #512 / #506 / #516**.

**G1 — The Merge UI is a duplicate-triage workbench (enriches #514).** Researched against modern nonprofit CRMs (Salesforce Nonprofit Cloud/NPSP, Blackbaud RE NXT Data Health, Bloomerang, Neon, DonorPerfect, Virtuous) and general merge/diff/undo/a11y best practice:

- **Queue:** confidence **tiers** (High / Possible / Low — never a false-precision numeric score), with the match **reason** as chips ("matched on email + last name"); default staff into the high-confidence lane; sort by confidence **and value-at-risk** (records carrying gifts/large history); "you're all caught up" empty state; skeleton loading (not spinners).
- **Compare sheet:** records as columns, fields as rows, **frozen label column + sticky headers**; **default to "show only differing fields"** (agreeing fields collapsed, expandable); **per-field survivor radio + an editable result cell**; a **master radio** in each column header pre-selected to the most-complete record; multi-value fields **combine** (emails/phones) rather than discard; a live **"resulting record" preview**; **red-strikethrough-lost / green-kept** diff **paired with a non-color "Removed/Kept" cue** (WCAG 1.4.1); a loud callout when the surviving record changes downstream associations; default **2 records, hard cap 3**.
- **Actions — three-way, not binary:** **Merge**, **Not a duplicate** (durable suppression — the pair never resurfaces), and **Defer / Unsure**; role-gated + audited.
- **Reversibility (beats every incumbent — 5 of 6 have no undo):** merge is **execute-then-undo** — archive-not-delete the loser (the existing `merge_operations` tombstone), keep lineage, show a time-boxed **"Merged — Undo"** toast + a durable **Unmerge** for a ~30-day window + full before/after Merge History. **No "type-to-confirm"/irreversible modal.**
- **Accessibility:** ARIA `grid` (roving-tabindex arrow navigation), focus-trapped merge dialog with focus-return, `aria-live` selection announcements, 24px targets, WCAG-2.2 focus-not-obscured under sticky headers; keyboard-driven merge / not-dup / defer / next.
- **Queue hygiene:** durable "not a duplicate" suppression + defer/aging expiry so pending candidates don't accumulate into an ignored backlog.

**G2 — Receipt integrity through merge (strengthens #507 / #512 / #506 / #516; current owner synchronization 2026-09-23).** A donor merge may repair source-approved mutable CRM/Party references under A9, but an already-issued receipt MUST NOT silently re-attach to the surviving current identity. The accepted July 27 canonical receipt-pipeline amendment and Phase 13/7/18 owner contracts replace the original July 6 legacy-table mechanism:

- The receipt **resolves its legal donor from frozen Phase 13/7 source facts,
  never from live mutable Party/donor links.** A later identity merge may change
  current CRM projections but cannot change the receipt's legal donor, Legal
  Entity/issuer, facts version, document identity, or exact issued artifact.
- The shipped `contribution_receipt_snapshots` table and migration are prototype-removal evidence only. **Do not extend, read, import, backfill, or preserve that runtime.** Phase 7's immutable `contribution_receipts` facts record freezes the party-aware legal-donor identity from its first authoritative write; Phase 18 D17 removes the prototype schema/runtime before any official receipt path activates. There is no interim authority, overlap, compatibility view, or dual truth (Phase 9 C1, amended 2026-07-25).
- **Canonical owner enforcement (#506 / #507):** the Phase 13/7 source constraints and write boundaries prevent identity repair from changing frozen contribution/legal-donor, receipt or statement facts, and Phase 18 preserves exact issued artifacts. Test direct and privileged mutation attempts plus merge/issuance races through those exact owners. Phase 4 creates no legacy `donations` guard, snapshot lookup, interim receipt writer or duplicate issuance transaction; before canonical source qualification the dependent official path remains unavailable. Preserve the original indexed, fail-closed, privilege-safe enforcement intent when qualifying the owning implementation, without reviving retired table names or runtime.
- **Permanent negative test (#516):** a merge / re-point never changes the donor an already-issued receipt resolves to.

**G3 — Phase-8 relationship.** The July 7 re-groom (#603) is complete and
[Phase 8](./phase-08-crm-operating-foundation.md) now owns the Asym-internal
operations/data-health view. It consumes the existing merge-candidate count and
links to Phase 4's merge workbench without rebuilding it. Its build-now
observability/escalation core has **no hard Phase 4 prerequisite**; it adopts
this tenant-isolation posture and uses only proved available source readers.
Phase 6 gates the emailed-alert/consent seam, and Phase 9 gates Party-graph
health and the reserved re-projection heal. The original Phase 4 hard dependency
belonged to the withdrawn Twenty write gate and no longer governs Phase 8.
Provider reference repair remains source-owned; Twenty is retired.

---

## Testing Decisions

Good tests here assert **external behavior and safety invariants**, not implementation details — especially because RLS failures are _silent_ (0 rows, no error), so isolation must be asserted with `is_empty()`-style checks, not error expectations.

- **Claim/contact/native-admission proof:** established claim survives a
  contact-email change or Clear; fresh possession cannot overwrite another
  claim; same-address/new-revision and reused link/code proofs fail closed;
  represented and record-only access stays purpose-bounded. A10/G01 uses the
  exact supported nonproduction native endpoints, including attachment before
  exchange and credential access, rather than a callback mock or provider flag.
- **Unit (deep modules):** guest-gift find-or-create attribution (single match attributes, ambiguous → candidate, no duplicate); **enumeration-safety** (identical response _and_ latency envelope for known-existing vs absent email); **verified-possession bind** including the **reject-unverified-bind takeover regression**; invitation lifetime / single-use / revocation; merge re-point + tombstone + **un-merge replay**; consent-most-restrictive on **both** attribution and merge; email-normalization equivalence across call sites.
- **Cross-tenant negative-test tier (permanent CI gate):** RLS `is_empty()` tests (tenant B invisible to tenant A); **service-path** tests that call the real donate/attribution/resolver/merge functions with tenant-A context and assert they cannot touch tenant-B rows despite RLS bypass; a dedupe test asserting no candidate pair ever spans tenants; the enumeration latency test. Every new tenant-scoped table or service-role path must add its own isolation test.
- **Structural assertions:** a CI check (via `pg_class`/`pg_policies`) that every public tenant table has `relrowsecurity` **and** `relforcerowsecurity` with ≥1 policy; the tenant-guard grep gate; and an auth-email contract test proving the producer request resolves tenant-branded Phase 17 content/sender identity and exactly one Phase 6 communication event/history chain (default/unbranded content or direct Phase 4→Resend dispatch fails).
- **Prior art:** Phase-3 resolver/projection golden-snapshot tests; the shipped recovery-scan (donation-saga-recovery) Inngest pattern (for the dedupe scan); existing `packages/api` service unit tests.

---

## Out of Scope (reserved seams — documented, not built)

- The **populated** Party/constituent spine and cross-role dedupe — only the
  inert typed identity/claim anchor is the initial Phase 4 migration target,
  not a claim of installed schema. Phase 7 owns the populated base Party
  and Statement Subject required for official facts; Phase 9 deepens the Party
  and relationship graph; Phase 13 freezes the accepted contribution's legal
  donor source evidence. Every later owner inherits Phase 4's composite tenant
  keys, FORCE RLS, tenant-guard wrapper, and cross-tenant negative-test tier.
- `contact_points` (multiple emails/phones per person); a `verification_method` enum (so a future SSO can't silently unlock saved cards).
- Phase 14 `contribution_credits` (**soft credit**; synonym
  `gift_attributions` rejected), tribute, matching, and DAF operations. Phase
  13 owns the contribution header and frozen legal donor source evidence;
  Phase 7 consumes that evidence for official receipt/statement facts. Credit
  rows are `is_receiptable = FALSE`, never enter a money total, and never mint
  a receipt. Phase 14 defines acknowledgment/notification purpose facts, Phase
  17 governs content/variables, Phase 18 owns print/PDF artifacts, and Phase 6
  owns dispatch/history under the three-document wall.
- **Households** as a separate _party_ entity (never an account that absorbs people); **church/organization** records; **applicant** + applicant→missionary conversion; **reference** contacts.
- A **GDPR redaction seam** distinct from delete (erase PII while retaining the immutable receipt ledger); **anonymity-as-explicit-flag** on a known donor.
- **Bulk invitations**, **passkeys**, staff **SAML SSO**, Mailchimp provider links and physical per-Tenant Auth remain reserved. Google/Apple/Facebook donor entry, its exact provider readiness and Apple relay/collision handling are selected scope under A10 and IC04–IC05, with affected activation blocked by G01; they are not reserved alternatives or proof of implementation.
- Full identity-management UI, merge-suggestion automation, and per-tenant-configurable matching rules.

---

## Further Notes

- **Historical Phase 4 research grounding (2026-07-04; not current qualification).** The model was pressure-tested against current multi-tenant-isolation, nonprofit-CRM, progressive-identity, and schema-evolution practice, and against the **official Supabase Auth docs**. Validated as modern: the auth→profile→membership→donor spine (role is a property of `(user, tenant)` membership), Path-2 pool-with-a-silo-seam, the permanent unclaimed-donor state, the prove-possession-before-reveal ordering (mirrors Stripe Link), owning enumeration-safety at the form layer, and non-destructive merge (exceeds Raiser's Edge, which has no undo). The original research recorded `signInWithOtp`, invitations, `updateUser`, the Send Email Hook and provider email-linking behavior. Its inference that verified-email automatic linking establishes takeover safety is withdrawn: A10/G01 requires the later direct native-admission proof. Original passkey/SSO availability observations are dated provider evidence, not current qualification or scope expansion.
- **Compliance anchors.** PCI SAQ-A (store no cardholder data; Stripe holds the customer/PM); AFP Donor Bill of Rights + CAN-SPAM/GDPR (consent preserved through attribution and merge; anonymity/redaction reserved as explicit states); IRS receipt integrity (frozen legal-donor snapshot).
- **Related security work (soft dependency, not a blocker).** Two in-flight P0 patches — CSV formula-injection across exporters and a fail-closed email-consent gate before Resend — are adjacent; Phase 4's consent-on-attribution rule reuses the email-consent gate if it has landed. Track as related, not blocking.
- **Enumeration defense-in-depth (reserved hardening).** Constant-time, constant-shape attribution is necessary but not sufficient: per-email / per-IP **rate limiting** + CAPTCHA-on-abuse on the guest-attribution and claim-initiation endpoints is reserved as a fast-follow (Supabase's throttles protect only its own auth endpoints, not our forms), and the rate-limit-timing behavior must be verified before promising "no signal."
- **Honest build-verify items carried into tickets.** Confirm `donors` uniqueness is `(tenant_id, profile_id)`; confirm `profile.tenant_id` `NOT NULL` and quarantine it from authz; confirm `crm_merge_candidates` can reference two Asym donor ids; confirm `generateLink` and the Send Email Hook payload can resolve only a server-issued opaque handle whose server-side record re-proves tenant/site/recipient/template—never encode authoritative tenant/site ids in `redirectTo`.

---

## Evidence & Acceptance

**Acceptance criteria (Phase 4 is "done" when):**

- [ ] An unclaimed donor can exist with an email and no login; staff can record an offline gift with an email that creates/updates one.
- [ ] A guest online gift with a matching email attributes to the same donor — no duplicate, reveals nothing, enumeration-safe, constant-time; the form behaves identically for known vs unknown emails.
- [ ] Email link/code redeem the same exact issuance once; the admitted claim binding and historical possession proof commit atomically with audit and remain separate from mutable contact verification. Neither a new email match nor clearing/changing contact proof overwrites or erases an established claim.
- [ ] History, saved methods and represented/record-only views require current
      Phase 12 context and exact source/subject/purpose admission. Failed
      membership resolution, a verified-email flag, donor row or profile role
      grants no fallback access; document-only grants cannot enumerate history.
- [ ] Google/Apple/Facebook donor entry is exposed only after A10/G01 and each
      provider's readiness proof pass across native endpoints, replay, collision,
      already-bound subject and changed/absent/relay-email cases. Unresolved G01
      remains blocked; email-only delivery is not completion of social scope.
- [ ] Staff can invite a legacy donor; invitations are branded, expiring, single-use, revocable, and audited. The invitation supplies purpose/variables, Phase 17 pins prepared content/sender identity, and Phase 6 alone applies communication policy, dispatches through Resend, and records history.
- [ ] Staff can merge donors from a dedupe queue and from CRM search; merge is field-by-field golden-record, re-points every eligible child, preserves immutable commitment-owner snapshots/provenance, is reversible/replayable, and offers an opt-in completeness-gated shell delete; merges never transfer a genuine commitment owner, auto-run, or span tenants.
- [ ] A scheduled self-healing dedupe scan surfaces within-tenant candidates without auto-merging.
- [ ] **Cross-tenant negative tests are green**; every tenant table has `FORCE` RLS + a policy; the tenant-guard and branding CI gates pass.
- [ ] Every identity surface (auth emails, login, claim, protected Tenant
      action, recovery, portal, and sign-out) is Tenant-brand-native on the one
      current Tenant Donor Portal Host; no cross-tenant or donor-visible Asym
      surface appears, and branding/host never substitutes for authorization.
- [ ] Direct, email, recovery, bookmarked, and every same-Tenant Site entry
      render the same Tenant Donor Account Brand. Changing the Default Site,
      retiring an entry Site, viewing another Site's authorized history, or
      losing a decorative brand asset cannot change the account identity,
      authorize data, or expose Asym/another Tenant; verified Site context may
      remain only as secondary attribution or a safe return action.
- [ ] The inert typed `persons` anchor + `person_id` FKs (on missionaries/profiles; `donors` receives `party_id` instead — Phase 9 C1, 2026-07-06) exist; Phase 4 creates no receipt-fact row, and merge leaves Phase 7 frozen legal-donor/issuer facts unchanged.
- [ ] All claim/attribution/invitation/merge events are audited (identifiers-only) with tenant and a stable actor id.

**Evidence file** (Phase-2/3 style, authored at completion): migrations applied; the full test suite incl. the negative-test tier passing; route/API checks; screenshots of the claim flow and the merge UI; the isolation-gate CI output; known gaps; and an explicit list of what Phase 4 intentionally did **not** build (the reserved seams).

---

## Tracking Issues (epic + children; created via `/to-issues`)

Mirrors the Phase-2/3 structure. Foundation tickets first (`status:todo`); the rest `status:blocked` until their blockers land.

- **Epic — Phase 4: Identity & Account-Claiming Foundation**
- **T1** — Docs: PRD, OpenSpec/glossary (CONTEXT.md) terms, and the 4 ADRs.
- **T2** — Isolation-hardening foundation: tenant-guard wrapper, `ENABLE`+`FORCE` RLS, composite `(tenant_id, id)` FKs, and the CI assertions/grep gate. _(foundation)_
- **T3** — Data-model migrations: the 2 tables, identity columns, inert `persons` anchor, unique keys, and the canonical email-normalizer; no receipt snapshot or legacy receipt writer. _(foundation)_ _(Amended 2026-07-06, Phase 9 C1: the person_id-on-donors reservation is superseded — `donors` never receives `person_id`; `donors.party_id` is created in its place; `person_id` on missionaries/profiles unchanged.)_
- **T4** — Unclaimed-donor lifecycle + guest attribution (extend the donate path; enumeration-safe, constant-time).
- **T5** — Claim service (magic-link-first; verified-possession bind; reveal-gate via the Phase-3 resolver).
- **T6** — Legacy invitations (issue/redeem/revoke; producer-owned purpose/variables routed through Phase 17 preparation and the sole Phase 6 communication seam).
- **T7** — Merge execution (golden record, re-point, tombstone, `merge_operations`, un-merge, opt-in purge).
- **T8** — Dedupe scan (on-demand + self-healing Inngest; within-tenant matcher → `crm_merge_candidates`).
- **T9** — Merge UI (dedupe queue + CRM-search multi-select → one compare sheet; `base-maia`/zinc, Base UI, `DataTableResponsive`).
- **T10** — Minimal Mission Control identity/claim visibility (linked records + claim/merge review queue, read-only).
- **T11** — Branded auth emails (Supabase/Phase 4 auth-purpose producer → Phase 17 immutable prepared content and sender profile → Phase 6 sole communication event/dispatch/history → Resend transport).
- **T12** — Cross-tenant negative-test CI tier + FORCE-RLS assertion + branding test.
- **T13** — Phase 4 evidence file.

## Dated Phase 17 protected-action and transport amendment (2026-07-19)

**Old statement.** Phase 4 describes the Supabase Send Email Hook as resolving
tenant context from request/`redirectTo`, injecting an action link, and sending
through a per-tenant Email Studio/Resend path.

**New winner.** Phase 4 remains the sole owner of invitation/claim purpose,
tenant and intended Party binding, issuance identity, credential creation,
expiry, replacement, revocation, redemption, current-state authorization,
postcondition, and completion audit. Phase 17 renders only a typed protected
action descriptor in an immutable publication. The original invitation email
uses a scanner-safe Asym handoff; after the recipient deliberately selects
**Accept invitation**, Phase 4 re-proves the invitation and creates/exchanges
the fresh short-lived Supabase proof needed for redemption.

The producer command is `BeginLegacyInvitationRedemption`. It binds the exact
tenant, invitation id/revision, invited email and Party/donor, fixed allow-listed
site origin, opaque handle, expected pending state, and one idempotency key. A
deliberate POST CAS-reserves one attempt only after current expiry, revocation,
use, tenant and email proof. Phase 4 then uses the pinned server-only Supabase
Admin invite-link generation and matching `verifyOtp` exchange. Any short-lived
returned bearer hash is envelope-encrypted producer crash-recovery material,
never Phase 17 history/template/browser/log data. Exact retry resumes one proof;
possible success becomes `redemption_indeterminate` and is reconciled before any
successor proof can be issued. Final Party/account bind is idempotent.

**Compatibility boundary.** `redirectTo` may carry an opaque context reference
but never selects tenant, site, recipient, template, sender, or authority. The
server reloads and re-proves those facts. An editable merge tag can never be the
credential/action URL. Tenant identity/system email uses that tenant's D10
Ready Resend connection. Initial Asym customer-account bootstrap is a distinct
platform sender, purpose, audience, and contract—not a fallback for tenant
mail. Historical invitation evidence remains truthful and is not rewritten.

## Dated Phase 21 D19 principal and Support Workspace invitation amendment (2026-08-01)

Phase 4 remains authoritative for proving possession and binding one login
principal to the intended same-Tenant Party. Phase 21 Support Assignment
Participant Membership remains a separate Party relationship, and Phase 12
remains authoritative for request-time Support Workspace access. A person may
participate without a login; a verified principal may receive bounded access
without participation where the organization explicitly authorizes it.

A D19 Support Workspace invitation binds the exact Tenant, intended Party and
recipient proof, Support Assignment, reviewed Phase 12 grant intent, purpose,
expiry, version, and idempotency identity. As superseded by Phase 22 D19,
acceptance establishes only the intended verified Principal binding after
current identity proof. Reviewed access intent must then enter the owning grant
command and pass current Phase 12 authorization/revocation reproof. A pending,
failed, expired, mismatched, revoked, or indeterminate invitation
grants nothing and creates no participation, claimant/reviewer/payee authority,
notification preference, or financial effect.

Every spouse or teammate retains a distinct Party and principal. Party merge
never treats a relationship or shared email as proof of one login, unions
Support Workspace grants, silently retargets participant history, or rewrites
Field Account evidence. Identity repair and access reconciliation are explicit,
append-only-audited owner-domain actions.

## Dated Phase 21 D24 helper-identity and invitation amendment (2026-08-02)

Phase 4 owns identity proof and the separate D24 invitation lifecycle; Phase
21 owns the prospective Expense Collaboration Assignment Version; and Phase 12
alone decides current access. A D24 invitation binds one exact Tenant, Legal
Entity, intended helper Party and recipient proof, claimant Party, Expense
Program, one stable Expense Claim, bounded item/split/purpose/evidence scope,
proposed Assignment Version,
expiry, revision, and idempotency identity. It is authority-free: issuing,
delivering, opening, or accepting it cannot create Tenant membership, a Phase
12 grant, claimant consent, evidence access, submission power, or any financial
authority.

Redemption uses the existing scanner-safe, deliberate POST and CAS pattern.
The server re-proves current invitation state, intended identity, principal
binding, organization policy, and Assignment eligibility before recording an
acceptance. New and existing accounts converge on the same proof; account
creation, email possession, mutable user metadata, redirect parameters, a
relationship, or an old session never authorizes D24. Pending, expired,
revoked, forwarded, mismatched, replayed, and indeterminate invitations grant
nothing and reveal no account or claim existence.

Helpers always act as their own principals; D24 provides no impersonation,
account switching, or shared credential. Claimant, helper, preparer, submitter,
confirmer or attestor, reviewer, approver, beneficiary/payee, and actual actor principal remain
separately attributed. Party merge, principal replacement, claimant or helper
departure, and email change preserve immutable history and require explicit
deny-first access reconciliation; they never transfer or resurrect an
Assignment automatically.

## Dated Phase 21 D25 expense-resolution identity amendment (2026-08-02)

D25 preserves the D24 own-principal and deny-first identity rules. Account
deletion, stale or revoked credentials, failed message delivery, silence,
manager assertion, spouse/team/helper relationship, Party merge, principal
relink, or lifecycle change never proves claimant unavailability, authors a
claimant response, or grants successor authority. A Resolution Occurrence
records the actual actor and source proof; identity ambiguity quarantines only
the affected positive action until Phase 4 and the owning lifecycle source
establish current identity. Historical actor and claimant provenance never
retargets or collapses.

## Dated Phase 22 D19 Ministry Assignment identity and invitation amendment (2026-08-06)

Every spouse, teammate, leader, coach, staff member, contributor, and support
viewer retains one separately proved Party and login Principal. Ministry
Assignment membership, marriage/household/team relationship, public display,
Page contribution, Phase 21 Support Assignment membership or binding, email
possession, invitation delivery, and prior access never prove identity or grant
another person's session. Shared spouse/team credentials and impersonation are
forbidden.

One D19 **People & access** operation may create an exact recipient invitation
intent alongside separately selected local source-owner facts, but the invitation
remains expiring, single-use, revocable, and authority-free. This later Phase 22
rule supersedes the older invitation shorthand that acceptance may itself
establish reviewed Support Workspace access. Acceptance proves only the intended
verified Principal binding; each selected contributor, Support Workspace,
responsibility, or notification consequence still requires its owning command
and final Phase 12 authorization/revocation reproof. Pending,
failed, expired, forwarded, mismatched, replayed, or revoked invitations grant
nothing and do not roll back unrelated valid association evidence.

Party merge/split, principal relink, email change, spouse separation, departure,
death/incapacity, and account recovery preserve historical actors and trigger
explicit deny-first owner-domain reconciliation. They never union or transfer
Ministry Assignment membership, Display Participant status, Contributor
Assignment, Support Binding, Phase 21 participation, Support Workspace access,
history floor, responsibility, or notification preference.
