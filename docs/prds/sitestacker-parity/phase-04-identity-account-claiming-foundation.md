# Phase 4 — Identity & Account-Claiming Foundation

> **Program:** SiteStacker Parity · **Phase:** 4 · **Status:** Groomed (grill-with-docs, 2026-07-04) · **Base:** `develop`
> **Predecessors:** Phase 2 (Site, Locale & Currency) · Phase 3 (Minimum Permission & Role-Scoped Projection)
> **Charter / matrix:** `docs/prds/sitestacker-parity/README.md`, `parity-matrix.md`

Modern SiteStacker parity for **how one real person shows up across the product** — as a login, a CRM person, a donor, a missionary, a provider identity — **without collapsing those into one object and without ever crossing a tenant boundary.** This is a foundation phase: it builds the genuinely-missing piece (donor **account claiming** and the **unclaimed-donor lifecycle**), formalizes the identity seam that already exists in the repo, adds safe donor **deduplication/merge**, hardens tenant isolation, and **reserves** (does not build) the full identity-management system so it can drop in later without a rewrite.

---

## Problem Statement

A single supporter already appears in the product in several forms — a login account, an operational donor record, a missionary, a Stripe customer — and today the links between them are **implicit**. Three concrete gaps block everything downstream (deeper donor portal, receipts, legacy-data import, missionary workspace, reports):

1. **There is no way for a supporter to "claim" their record.** Donors imported from legacy data or captured from offline gifts exist as `donors` rows with no login (`profile_id IS NULL` is already legal), but nothing safely binds one to a login. There is no claim flow, no legacy invitation, no verification, no guest-claim-later — anywhere in the codebase.
2. **Guest giving cannot safely recognize a returning supporter.** When someone gives online with the same email a staff member recorded offline, the system should quietly attribute the gift to the same person — but the _convenient_ version of that (pre-filling their name, offering their saved card, saying "welcome back") is an account-takeover and PII-leak vector, and the same class of bug Phase 3 already found in this repo.
3. **Identity work risks crossing tenants.** The platform is multi-tenant (each missions organization is a tenant). Without deliberate rules, a merge, a dedupe scan, a claim, or a shared login could leak one ministry's supporter data into another's — violating the platform's non-negotiable tenant-isolation boundary.

If we deepen donor/missionary features before this foundation exists, every module invents its own implicit identity rules, we accumulate duplicate people, and a wrong link hands one person another's giving history. The recon for this phase confirmed the identity _model_ is largely already present (auth → profile → donor/missionary, `authz.memberships`, `crm_record_links`, `crm_merge_candidates`); what is missing is the **claiming lifecycle, safe merge, and the tenant-safety hardening** that let the rest of the product trust identity.

## Solution

A **tenant-safe identity foundation centered on account claiming**, built from the supporter's point of view so it feels effortless while doing all the safety work in the backend. Six moving parts:

1. **The unclaimed-donor lifecycle.** A supporter is a first-class, permanent record whether or not they ever log in. Staff can record an offline gift with an email; that creates/updates an **unclaimed donor** (contact email stored **unverified**, no login). No login is created until the supporter claims.

2. **Invisible online attribution.** When a guest gives online with an email that matches an existing donor, the gift is attributed to that same donor — **no duplicate, revealing nothing, enumeration-safe, constant-time.** The supporter feels nothing; the history quietly unifies behind the scenes.

3. **Optional, verified claiming.** A supporter can turn their record into a login whenever they choose — **magic-link first** (or set a password _after_ authenticating). Proving they control the email is the single gate that binds the login to their donor record and reveals giving history and saved payment methods. Staff can also **invite** legacy donors (branded, expiring, revocable, audited).

4. **Safe deduplication & non-destructive merge.** Staff can merge duplicate donors from a **self-healing dedupe queue** or directly from CRM search. Merges are **non-destructive** (reversible, replayable), let the admin compose a field-by-field **golden record**, re-point all history, and never auto-run.

5. **Strict tenant isolation ("Path 2").** Complete data isolation: separate donor records, memberships, and claims per tenant; **no cross-tenant linking, merge, single-view, or dedupe**; a shared login credential authorizes nothing on its own. Every identity surface is **per-tenant branded** so each ministry feels wholly separate.

6. **Minimal staff visibility.** A read-only view of a person's linked records and a claim/merge review queue in Mission Control — enough for staff to understand the connections, not a full identity-management product.

Underneath, the foundation is **method-agnostic** (it binds on proven email possession regardless of how it was proven) and **reserves** the seams — a typed person spine, provider links, households, soft credits, applicant/reference/church, social/passkey/SSO — so the full Option-C identity system installs later without re-pointing everything.

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
9. As a **donor**, I want to log in with a magic link, so that I don't have to create or remember a password.
10. As a **donor**, I want the option to set a password after I've proven I own my email, so that I can use a password if I prefer.
11. As a **donor**, I want my giving history and saved payment methods to appear only after I've proven I control my email, so that my financial data is protected.
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
27. As **finance staff**, I want merges to re-point all gifts, pledges, and links to the surviving record, so that no history is orphaned.
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

- **A1 — Scope: Option A, scaffolded to Option C.** Build account claiming + the unclaimed-donor lifecycle + safe merge + minimal visibility + isolation hardening. Formalize the existing seam (`authz.memberships`, `crm_record_links`, `crm_merge_candidates`). **Reserve** the full identity system. Recon confirmed ~60% of the originally-proposed model already exists.
- **A2 — Anchor: profiles-as-anchor now; typed person spine reserved.** The claim binding is `donors.profile_id` (existing FK, authoritative) + a donor `authz.memberships` row + an audit event. "CRM person" is **Asym-owned operational truth** over donors/missionaries — today via the donor/missionary records themselves, later via the Phase-7-populated `persons` spine (the earlier Twenty-projection clause is retired — [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)); money-truth stays in Asym. A minimal **inert typed `persons` anchor** + nullable `person_id` FKs are shipped now (not populated/read; on missionaries/profiles only — `donors` receives `party_id` instead, per Phase 9 C1, amended 2026-07-06) so the Option-C spine is a cheap future retrofit.
- **A3 — Unclaimed donor is a permanent first-class state.** `donors.profile_id` NULLABLE stays legal forever; no code assumes a donor has a login. Anonymous gift stays `donations.donor_id IS NULL`; a _known but publicly-anonymous_ donor is a reserved explicit flag, never modeled as absence of data.
- **A4 — Offline-capture → invisible attribution → optional claim.** Staff capture stores an **unverified contact email** on the donor and creates no login. Online guest gifts **attribute** to a matching donor with the six safety rules (below). Claiming is optional, verified, and never forced.
- **A5 — Six safety rules (non-negotiable).** (1) Recognize but never reveal; (2) enumeration-safe form; (3) email-verification state gates all sensitive access; (4) saved payment methods verified-only; (5) never force login; (6) single clean match attributes silently, anything ambiguous → staff review (reuse `crm_merge_candidates`), never a silent guess.
- **A6 — Claiming is method-agnostic; magic-link-first.** The claim gate binds on **proven email possession**, regardless of how proven (magic link, password, and — reserved — Google/Apple/passkey). **Magic-link/OTP is the hard-rule entry**; set-password is a post-authentication step only (a signup entry path collides on Supabase's global-unique email and leaks cross-tenant existence).
- **A7 — Tenancy: Path 2 (complete data isolation).** Single Supabase project; the shared credential authorizes nothing. Separate donor record, membership, and claim per tenant; **no cross-tenant linking, merge, single-view, or dedupe**; every access carries `tenant_id`. Physical per-tenant auth (separate projects) is reserved for future compliance.
- **A8 — Experiential separation is mandatory.** Every identity surface is per-tenant branded: auth emails via the **Supabase Send Email Hook → Email Studio template → Resend**; login/claim UI on the tenant's own domain with `base-maia`/zinc tokens; **no cross-tenant surface** in the donor portal. This is an acceptance criterion _and_ a test (unbranded chrome = failing build).
- **A9 — Merge is non-destructive, reversible, replayable, never automatic.** Admin picks the surviving record and composes a field-by-field golden record; all children re-point (donations, pledges, `donor_feed_preferences`, `crm_record_links`, invitations); consent merges to the **most-restrictive**; a `merged_into_donor_id` tombstone plus a **replayable `merge_operations`** record make un-merge real; an **opt-in, completeness-gated** hard-delete may remove the empty shell without ever touching money history. Dedupe scan is on-demand + scheduled self-healing, **within-tenant only**. The re-point child list is expected to grow in later phases to cover Phase-7 party/soft-credit rows (e.g. `gift_credits`, `household_members`). _(Amended 2026-07-06, Phase 9 C1: the re-point list additionally gains `parties`, `crm_relationships`, and the party-keyed engagement tables.)_
- **A10 — Auth methods reserved, not built.** Social (Google/Apple) and passkeys are reserved as **per-tenant-optional** fast-follows (they reinforce one global identity via verified-email auto-linking, so they change UX, not isolation; passkeys are a _post-claim_ upgrade). SAML SSO is reserved for a future **staff** auth phase. The consent-screen branding limitation is why magic-link stays the branded default.

### B. Deep modules (`packages/api/src/identity`)

Each is a deep module — a simple, testable interface hiding real complexity — with thin app routes calling in.

- **`tenant-guard`** — the mandatory wrapper for every service-role DB path (donate, guest-attribution, find-or-create, resolver, merge, Inngest). Requires an explicit tenant, binds a per-request tenant context to the DB session, and runs as a non-owner / non-`BYPASSRLS` role so `FORCE` RLS still applies. A CI grep gate fails any bare service-role client constructed outside it.
  - Shape (from grill): `withTenant(tenantId, (db) => …)` — resolves tenant from the same source of truth as RLS, `SET LOCAL app.current_tenant`, fails closed on disagreement.
- **`claiming`** — guest attribution + the verified-possession bind.
  - `attributeGuestGift({ tenantId, email, gift })` → find-or-create donor by normalized `(tenant, email)`; **reveals nothing**; defers dedupe to async so the response is constant-shape/constant-time.
  - `bindClaim({ tenantId, donorId, possessionProof })` → sets `donors.profile_id`, `email_verified_at`, and the donor membership **in one transaction**, only with a fresh single-use proof for the _same normalized email_; audits the transition. Never called from the attribution path or an admin action without proof.
- **`invitations`** — `issue / redeem / revoke` legacy invitations; lifetime/single-use/revocation are our table's state (Supabase link/OTP tokens hard-cap at 24h, so a fresh short-lived Supabase link is minted at redemption); branded via the Email Studio path; consent-gated.
- **`merge`** — `previewMerge / executeMerge / unmerge / purgeShell`; executes inside the tenant guard; asserts `survivor.tenant_id === loser.tenant_id`; re-points children; writes the replayable `merge_operations` record; `purgeShell` is opt-in and gated on a completeness check.
- **`dedupe`** — `scan({ tenantId })` (on-demand + scheduled self-healing via Inngest, within-tenant matcher, exact-email=high / fuzzy=low) → populates `crm_merge_candidates`; never auto-merges.
- **Branded-auth-email** — the Send Email Hook handler that resolves the tenant from the request/redirect context and renders that tenant's Email Studio template via Resend.

### C. Phase-3 plug-in (no parallel systems)

- The **reveal-gate** is a Phase-3 resolver row-scope/ownership check: history and saved cards are visible only when `email_verified_at` is set and the requester owns the row. Guest attribution **extends** the existing donate path (find-or-create donor + Stripe customer), not a rewrite.
- **Export/consent governance** and the **audit spine** (identifiers-only) are reused from Phase 3 — identity events are new event types on the existing spine, not a new audit table.

### D. Data model

**Net-new tables (2):**

- `account_claim_requests` — a donor- or exception-initiated claim awaiting resolution/review. `tenant_id NOT NULL`, `donor_id` nullable, email, requester, status (`pending | verified | approved | denied | expired`), match type + confidence, reason, resolver, timestamps. RLS: staff + own-requester.
- `legacy_account_invitations` — staff invite bound to a donor: `tenant_id NOT NULL`, `donor_id`, email, inviter, Supabase link reference, status (`sent | accepted | expired | revoked`), `expires_at` (7-day default), `revoked_at`. Single-use, revocable, consent-gated. Bulk reserved.

**Net-new columns:**

- `donors.email_verified_at` (nullable) — null = unverified contact email; set **only** by the possession path.
- `donors.merged_into_donor_id` (nullable, composite tenant FK) — merge tombstone.
- A **frozen receipted legal-donor snapshot** (name + address + donor-id-at-issue) on the receipt/donation record at issuance — immutable; merge/redaction touch only the mutable CRM projection. This snapshot is reserved as **party-aware**: the fields **Phase 7** populates freeze `donor_id` + `party_kind` (+ `org_type` for org-kind legal donors; amended from `party_type` 2026-07-06, Phase 9 C2) + `legal_name`/name + address-of-record + (for org/DAF/foundation legal donors) EIN + (when a household is the legal giving unit) household-member-ids. The snapshot stores a **frozen copy of the resolved `party_kind`/`org_type` at issuance** — a frozen copy, never live dual truth (Phase 9 C2). Phase 4 ships only the reservation and the person subset; Phase 7 **extends** the snapshot columns for org/DAF/household legal donors, so appending those columns does not break the immutable-snapshot contract.
- **Inert reserved:** empty `persons` (`id`, `tenant_id`, `created_at`) + nullable `person_id` FK on missionaries/profiles — not populated or read in Phase 4. _(Amended 2026-07-06, Phase 9 C1: the `person_id`-on-donors reservation is superseded — `donors` never receives `person_id`; `donors.party_id` is created in its place.)_
- **Replayable:** a `merge_operations` record (survivor, loser, per-child re-pointed FKs, golden-record choices, pre-merge consent).

**Reuse:** `authz.memberships` (roles/multi-hat); `crm_record_links` (provider links — Stripe now, Mailchimp later; the second Stripe customer from a merge lands here); `crm_merge_candidates` (dedupe/review, extended to reference two same-tenant Asym donor ids); consent (`do_not_email` / `do_not_contact` / `email_suppressions`); Email Studio `email_templates`; the Phase-3 audit spine.

**Reserved seam (entity-link types):** the `crm_link_entity_type` DB enum and its TS mirror `CrmIdentityConceptId` reservation remains for **generalized provider links only** (re-scoped 2026-07-06, ADR-0001): `household` / `organization` / `daf_sponsor` (and `person` / `gift_credit`) entity-link types are added only if/when a provider link actually needs them (see Phase 7 C4); Phase 4 ships only the current entity-link set (baseline: `supabase/migrations/20260508000413_crm_identity_mapping.sql` and `packages/api/src/crm/identity/concepts.ts`).

**Keys & isolation (build-verified):** `unique(tenant_id, profile_id)` (**not** `unique(profile_id)`); a partial unique on `lower(email) WHERE merged_into_donor_id IS NULL AND email IS NOT NULL` ("one unclaimed donor per email per tenant"); one canonical **email-normalization** function used identically at find-or-create, claim, and dedupe (store raw + normalized); **composite `(tenant_id, id)` PKs and FKs** across the spine (FK checks bypass RLS, so composite tenant FKs make cross-tenant references structurally impossible); every tenant-scoped table `ENABLE` **and** `FORCE` RLS; `profile.tenant_id` **quarantined as non-authoritative** (home/UI hint only — all authorization sources from `authz.memberships.tenant_id`).

### E. Contracts / wiring

- **Supabase Auth:** `signInWithOtp` (magic-link entry), `admin.inviteUserByEmail`/`generateLink` (invites; fresh link at redemption), `updateUser` (post-auth password), automatic identity linking (verified-email-only — reinforces the takeover-safety rule). Send Email Hook for branded delivery.
- **Email Studio → Resend:** per-tenant branded auth-email templates; the hook carries tenant/site in `redirectTo` so it can resolve branding.
- **Inngest:** scheduled self-healing dedupe scan (the shipped recovery-scan / donation-saga-recovery Inngest pattern).
- **UI:** all Phase-4 screens use the shadcn **`base-maia`** style + **zinc** tokens defined in `packages/ui/styles/globals.css` (re-exported by `theme.css`), consumed via `@asym/ui`, built on **Base UI** primitives and `DataTableResponsive`. No ad-hoc colors; if a token is unclear, look it up in `packages/ui/styles/globals.css`.

### F. ADRs (to author with the docs ticket)

1. **Profiles-as-anchor + reserved typed person spine** (defer the populated spine; reserve the inert typed anchor rather than a polymorphic identity-links table).
2. **Path-2 tenant isolation** — data-layer isolation with a shared credential that authorizes nothing, chosen over physical per-tenant auth, given Supabase's single-project global-unique email.
3. **Guest-gift attribution = recognize-but-never-reveal + enumeration-safe + verified-possession claim binding** (account-takeover safety, since Supabase's verified-email guarantee covers only its own identity linking, not our `profile_id` write).
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

**G2 — Receipt integrity through merge (strengthens #507 / #512 / #506 / #516).** Because a donor merge re-points `donations.donor_id` (A9), an already-issued receipt MUST NOT silently re-attach to the surviving donor:

- The receipt **resolves its legal donor from the frozen snapshot (#507), never from live `donations.donor_id`.** The snapshot embeds `donor-id-at-issue` + legal name + address-of-record (already #507's intent) and is the receipt's source of donor truth.
- **Reconcile with the shipped `contribution_receipt_snapshots`** (migration `20260611140000_contribution_receipt_delivery.sql`), whose `content` currently stores only `{effective, designationLines}` — **extend it to embed the frozen donor identity** so it actually satisfies #507. This extension is the **interim** frozen-donor record — it ships with Phase 4 and satisfies #507 pre-Phase-7; Phase 7's `contribution_receipts` embeds the final party-aware snapshot at issuance under the **same frozen-copy contract**, so there is no dual truth (Phase 9 C1, 2026-07-06).
- **Guard trigger (#506):** a `BEFORE UPDATE OF donor_id` trigger on `donations` that RAISEs when a frozen receipt/statement snapshot exists for the donation (short-circuit `IS DISTINCT FROM`, security-definer with locked `search_path` so RLS cannot hide a snapshot, explicit `ERRCODE`, indexed lookup) — defense-in-depth so no merge/re-point path can corrupt an issued receipt.
- **Permanent negative test (#516):** a merge / re-point never changes the donor an already-issued receipt resolves to.

**G3 — Phase-8 relationship.** Phase 8 (CRM Operating Foundation) **consumes** this merge and builds **no separate workbench** — record-link repointing now concerns the generalized provider links (Stripe now, Mailchimp later), not Twenty, and Phase 8's own scope is being re-groomed under [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md) (re-groom pending). Its read-only `/crm/operations` windowpane shows the duplicate _count_ and links here. Phase 8 hard-depends on this Phase-4 merge + isolation foundation.

---

## Testing Decisions

Good tests here assert **external behavior and safety invariants**, not implementation details — especially because RLS failures are _silent_ (0 rows, no error), so isolation must be asserted with `is_empty()`-style checks, not error expectations.

- **Unit (deep modules):** guest-gift find-or-create attribution (single match attributes, ambiguous → candidate, no duplicate); **enumeration-safety** (identical response _and_ latency envelope for known-existing vs absent email); **verified-possession bind** including the **reject-unverified-bind takeover regression**; invitation lifetime / single-use / revocation; merge re-point + tombstone + **un-merge replay**; consent-most-restrictive on **both** attribution and merge; email-normalization equivalence across call sites.
- **Cross-tenant negative-test tier (permanent CI gate):** RLS `is_empty()` tests (tenant B invisible to tenant A); **service-path** tests that call the real donate/attribution/resolver/merge functions with tenant-A context and assert they cannot touch tenant-B rows despite RLS bypass; a dedupe test asserting no candidate pair ever spans tenants; the enumeration latency test. Every new tenant-scoped table or service-role path must add its own isolation test.
- **Structural assertions:** a CI check (via `pg_class`/`pg_policies`) that every public tenant table has `relrowsecurity` **and** `relforcerowsecurity` with ≥1 policy; the tenant-guard grep gate; a **branding test** (an auth email or identity screen rendered with default/unbranded chrome fails).
- **Prior art:** Phase-3 resolver/projection golden-snapshot tests; the shipped recovery-scan (donation-saga-recovery) Inngest pattern (for the dedupe scan); existing `packages/api` service unit tests.

---

## Out of Scope (reserved seams — documented, not built)

- The **populated** person/constituent spine and cross-entity (donor+missionary) dedupe — only the inert typed anchor ships now. The populated persons/constituent spine and the party/credit model are delivered by **Phase 7**, which **fulfills** these Phase-4 reservations; Phase 7 **hard-depends** on the Phase-4 isolation-hardening foundation (composite `(tenant_id, id)` keys, `ENABLE`+`FORCE` RLS, the tenant-guard wrapper, the cross-tenant negative-test CI tier) shipping first, so it **inherits, never bypasses,** these isolation gates.
- `contact_points` (multiple emails/phones per person); a `verification_method` enum (so a future SSO can't silently unlock saved cards).
- `gift_credits` (**soft credit**; synonym `gift_attributions` rejected — Phase 7 D) / tribute / matching / DAF — with `donations.donor_id` documented as the **legal donor (hard credit)** invariant, kept separate from the person spine (the mistake that forced Salesforce's NPSP→Nonprofit-Cloud re-platform). Reserved **hard invariant** for when the `gift_credits` ledger is built (**Phase 7**): soft rows carry `is_receiptable = FALSE`, never enter a money total, and never mint a receipt; acknowledgment and notification documents are structurally forbidden from deductibility merge-fields (the three-document wall: **tax receipt / acknowledgment / notification**).
- **Households** as a separate _party_ entity (never an account that absorbs people); **church/organization** records; **applicant** + applicant→missionary conversion; **reference** contacts.
- A **GDPR redaction seam** distinct from delete (erase PII while retaining the immutable receipt ledger); **anonymity-as-explicit-flag** on a known donor.
- **Bulk** invitations; **social login (Google/Apple)**, **passkeys**, and **SAML SSO** wiring — including a **per-tenant enabled-auth-methods config** and **Apple "Hide My Email" relay-identity handling** (a relay address won't match a donor's contact email, so it is treated as unmatched and never mis-attributed); **Mailchimp** provider links; **physical per-tenant auth** (separate Supabase projects).
- Full identity-management UI, merge-suggestion automation, and per-tenant-configurable matching rules.

---

## Further Notes

- **Best-practice grounding (verified this session).** The model was pressure-tested against current multi-tenant-isolation, nonprofit-CRM, progressive-identity, and schema-evolution practice, and against the **official Supabase Auth docs**. Validated as modern: the auth→profile→membership→donor spine (role is a property of `(user, tenant)` membership), Path-2 pool-with-a-silo-seam, the permanent unclaimed-donor state, the prove-possession-before-reveal ordering (mirrors Stripe Link), owning enumeration-safety at the form layer, and non-destructive merge (exceeds Raiser's Edge, which has no undo). Supabase confirmed: `signInWithOtp` + `shouldCreateUser`, `admin.inviteUserByEmail`/`generateLink`, `updateUser`, verified-email-only automatic identity linking, and the Send Email Hook; native passkeys are **beta** (2026-05-28) and a _post-session_ enrollment; SAML SSO is Pro+ and staff-oriented.
- **Compliance anchors.** PCI SAQ-A (store no cardholder data; Stripe holds the customer/PM); AFP Donor Bill of Rights + CAN-SPAM/GDPR (consent preserved through attribution and merge; anonymity/redaction reserved as explicit states); IRS receipt integrity (frozen legal-donor snapshot).
- **Related security work (soft dependency, not a blocker).** Two in-flight P0 patches — CSV formula-injection across exporters and a fail-closed email-consent gate before Resend — are adjacent; Phase 4's consent-on-attribution rule reuses the email-consent gate if it has landed. Track as related, not blocking.
- **Enumeration defense-in-depth (reserved hardening).** Constant-time, constant-shape attribution is necessary but not sufficient: per-email / per-IP **rate limiting** + CAPTCHA-on-abuse on the guest-attribution and claim-initiation endpoints is reserved as a fast-follow (Supabase's throttles protect only its own auth endpoints, not our forms), and the rate-limit-timing behavior must be verified before promising "no signal."
- **Honest build-verify items carried into tickets.** Confirm `donors` uniqueness is `(tenant_id, profile_id)`; confirm `profile.tenant_id` `NOT NULL` and quarantine it from authz; confirm `crm_merge_candidates` can reference two Asym donor ids; confirm `generateLink` and the Send Email Hook payload can resolve tenant (encode tenant/site in `redirectTo`).

---

## Evidence & Acceptance

**Acceptance criteria (Phase 4 is "done" when):**

- [ ] An unclaimed donor can exist with an email and no login; staff can record an offline gift with an email that creates/updates one.
- [ ] A guest online gift with a matching email attributes to the same donor — no duplicate, reveals nothing, enumeration-safe, constant-time; the form behaves identically for known vs unknown emails.
- [ ] A donor can claim via magic-link (or set-password post-auth); the login binds to the donor record **only** inside a verified-possession transaction; `email_verified_at` is set in the same transaction; the binding is audited.
- [ ] Giving history and saved payment methods are hidden until email possession is verified.
- [ ] Staff can invite a legacy donor; invitations are branded, expiring, single-use, revocable, consent-gated, and audited.
- [ ] Staff can merge donors from a dedupe queue and from CRM search; merge is field-by-field golden-record, re-points all children, is reversible/replayable, and offers an opt-in completeness-gated shell delete; merges never auto-run and never span tenants.
- [ ] A scheduled self-healing dedupe scan surfaces within-tenant candidates without auto-merging.
- [ ] **Cross-tenant negative tests are green**; every tenant table has `FORCE` RLS + a policy; the tenant-guard and branding CI gates pass.
- [ ] Every identity surface (auth emails, login, claim, portal) is tenant-branded on the `base-maia`/zinc tokens; no cross-tenant surface appears in the donor portal.
- [ ] The inert typed `persons` anchor + `person_id` FKs (on missionaries/profiles; `donors` receives `party_id` instead — Phase 9 C1, 2026-07-06) exist; the receipted legal-donor snapshot is frozen at issuance.
- [ ] All claim/attribution/invitation/merge events are audited (identifiers-only) with tenant and a stable actor id.

**Evidence file** (Phase-2/3 style, authored at completion): migrations applied; the full test suite incl. the negative-test tier passing; route/API checks; screenshots of the claim flow and the merge UI; the isolation-gate CI output; known gaps; and an explicit list of what Phase 4 intentionally did **not** build (the reserved seams).

---

## Tracking Issues (epic + children; created via `/to-issues`)

Mirrors the Phase-2/3 structure. Foundation tickets first (`status:todo`); the rest `status:blocked` until their blockers land.

- **Epic — Phase 4: Identity & Account-Claiming Foundation**
- **T1** — Docs: PRD, OpenSpec/glossary (CONTEXT.md) terms, and the 4 ADRs.
- **T2** — Isolation-hardening foundation: tenant-guard wrapper, `ENABLE`+`FORCE` RLS, composite `(tenant_id, id)` FKs, and the CI assertions/grep gate. _(foundation)_
- **T3** — Data-model migrations: the 2 tables, columns, inert `persons` anchor, receipt snapshot, unique keys, and the canonical email-normalizer. _(foundation)_ _(Amended 2026-07-06, Phase 9 C1: the person_id-on-donors reservation is superseded — `donors` never receives `person_id`; `donors.party_id` is created in its place; `person_id` on missionaries/profiles unchanged.)_
- **T4** — Unclaimed-donor lifecycle + guest attribution (extend the donate path; enumeration-safe, constant-time).
- **T5** — Claim service (magic-link-first; verified-possession bind; reveal-gate via the Phase-3 resolver).
- **T6** — Legacy invitations (issue/redeem/revoke; branded via Email Studio + Resend; consent-gated).
- **T7** — Merge execution (golden record, re-point, tombstone, `merge_operations`, un-merge, opt-in purge).
- **T8** — Dedupe scan (on-demand + self-healing Inngest; within-tenant matcher → `crm_merge_candidates`).
- **T9** — Merge UI (dedupe queue + CRM-search multi-select → one compare sheet; `base-maia`/zinc, Base UI, `DataTableResponsive`).
- **T10** — Minimal Mission Control identity/claim visibility (linked records + claim/merge review queue, read-only).
- **T11** — Branded auth emails (Send Email Hook → per-tenant Email Studio template resolution → Resend).
- **T12** — Cross-tenant negative-test CI tier + FORCE-RLS assertion + branding test.
- **T13** — Phase 4 evidence file.
