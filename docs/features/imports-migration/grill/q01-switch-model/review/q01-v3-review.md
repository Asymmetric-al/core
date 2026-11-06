# Q1 adversarial review v3: tenant safety; database, RLS and authorization safety; security and privacy

Phase 30 Imports & Migration Tools (slug `imports-migration`). Discovery review only: no spec, tickets or implementation.
Decision under review: founder answer to Q1 (2026-11-01), Option A "one planned switch per ministry", plus the four presented refinements and the founder's added request (full bring-over research, previous-processor integration, edge cases).

Reviewer: v3 (categories 1 Tenant safety, 2 Database/RLS/authorization safety, 3 Security and privacy).
Baseline: `develop` 629cb71dc (re-checked 2026-11-01). Phase 29 spec read from PR #2430 head 1483a349514c66b458da38e0ba0992efdc2e1f31 (open, unmerged).
Status: COMPLETE (2026-11-01). Sections §0-§9.

Evidence labels: verified-vendor-doc, snippet-only, third-party, repo-ratified, repo-published, repo-integrated, repo-implemented, inferred, assumption, unverified.

---

## 0. Method and scope

**Scope.** Three categories, each judged independently: (1) tenant safety, (2) database, RLS and authorization safety, (3) security and privacy. Other categories (UX, lifecycle, money ownership and so on) are left to sibling reviewers, except where they decide a finding here.

**What I read.**

- The working record: `grill/decision-log.md`, all 185 lines.
- The six Q1 research files and the verifier digest in the task. Verifier corrections override the research where they conflict.
- r06 §7, r09 §4 and r1 §3A-3C in full; the rest of the research only by targeted grep.
- Governing text: `roadmap.md:4320-4420`; `owner-constraints.md:329-450`; Phase 13 PRD :159-166, :540-546, :655-667, :728-748, :1020-1042, :2190-2200; Phase 10 PRD :95-124; `openspec/contracts/identity-and-access.md:218-220`; `docs/security/identity-email-normalization.md:55-95`; `docs/security/tenant-guard.md:1-6, :80-84, :230-240`.
- The Phase 29 spec at PR #2430 head `1483a349` (custody volume; `openspec/changes/add-files-documents/**`; contract), by grep.

**Code checked on develop 629cb71dc (repo-integrated).**

- Stripe tenant resolution, webhooks, raw-event store, refunds, recurring and the donor billing portal.
- The missionary donor projection and anonymity redaction.
- Migrations for the `donations`, `donors`, `donor_pledges`, `tenants`, `crm_record_links` and `authz` functions, plus account-claim tables.
- Issues #2295, #509, #510, #508, #512, #809, #834 and #2368 (read-only `gh`).

**External checks (2026-11-01).**

- Stripe Connect webhooks: https://docs.stripe.com/connect/webhooks (verified-vendor-doc).
- FTC CAN-SPAM compliance guide: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business (verified official guidance).
- PCI SSC tokenization supplement (2011): the PDF could not be rendered, so the claim rests on press coverage only (snippet-only).

**Not done.** No database access, app servers or browser tools. Hosted databases drift from migration files (decision-log D13), so every schema statement here describes the migration files, not production.

### 0.1 Key evidence established in this review (new or corrected)

| #   | Fact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Label                                        | Citation                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E1  | A tenant with a blank `stripe_secret_key` silently uses the **platform** key. Every keyless tenant therefore shares one Stripe account namespace.                                                                                                                                                                                                                                                                                                                                                                                           | repo-integrated                              | `packages/api/src/stripe/tenant-client.ts:59-66`                                                                                                                                                             |
| E2  | The donor portal opens a Stripe Billing Portal session for whatever `donors.stripe_customer_id` holds, using that tenant's key or the platform fallback. It does not check that the customer belongs to the tenant's account.                                                                                                                                                                                                                                                                                                               | repo-integrated                              | `packages/api/src/donor-portal/billing.ts:17-42`                                                                                                                                                             |
| E3  | Webhook tenant routing trusts `metadata.tenant_id` first, then falls back to an **unscoped** lookup of `donations.stripe_payment_intent_id`. `event.account` is stored but not used to route. Stripe documents a top-level `account` on every connected-account event.                                                                                                                                                                                                                                                                      | repo-integrated; verified-vendor-doc         | `stripe/event-store.ts:134-157`, `:242`; `stripe/refunds.ts:45-62`; `stripe/recurring.ts:87-121`; https://docs.stripe.com/connect/webhooks                                                                   |
| E4  | No unique constraint exists on `donations.stripe_payment_intent_id`, `donations.stripe_charge_id`, `donor_pledges.stripe_subscription_id` or `donors.stripe_customer_id`. The only Stripe uniqueness is `stripe_raw_events.stripe_event_id`. Lookups use `.maybeSingle()`, which errors on duplicates.                                                                                                                                                                                                                                      | repo-integrated                              | grep of `supabase/migrations/*.sql`; `20260512190000_phase_03_giving_pipeline.sql:39`                                                                                                                        |
| E5  | Admin refunds act on any completed gift that carries a Stripe charge or payment intent, through the tenant key or the platform fallback. There is no provenance guard for imported or legacy gifts.                                                                                                                                                                                                                                                                                                                                         | repo-integrated                              | `admin/contribution-operations/refunds.ts:84-214`; `tenant-stripe-key.ts:13-28`                                                                                                                              |
| E6  | `tenants.stripe_secret_key` is a plaintext `TEXT` column. It is server-only (REVOKE from authenticated), but Phase 13 ratifies "never a stored tenant key".                                                                                                                                                                                                                                                                                                                                                                                 | repo-integrated vs repo-ratified             | `20250101000000_init_schema.sql:20`; `20260625002117_canonical_tanstack_db_realtime_rls.sql:43`; P13 PRD :664-667                                                                                            |
| E7  | `donations.tenant_id` is nullable with `DEFAULT '00000000-0000-0000-0000-000000000001'`. The same-tenant donor FK is not checked when `donor_id` is NULL, and Phase 13 anonymous gifts have a NULL legal donor (C6). `donations.missionary_id` and `fund_id` have single-column FKs, and `donor_pledges` has no composite same-tenant FK.                                                                                                                                                                                                   | repo-integrated                              | `20250101000000_init_schema.sql:175-191`; `20261025100000_donations_composite_donor_fk.sql:10-13, :80-104`; grep for `FOREIGN KEY (tenant_id,`                                                               |
| E8  | The live missionary donor list is scoped by the single legacy column `donors.missionary_id`. For named donors it shows `notes`, `tags`, `birthday`, `anniversary`, `spouse` and addresses. Anonymity hides a donor unless `giving_preferences.defaultAnonymousToRecipient === false`.                                                                                                                                                                                                                                                       | repo-integrated                              | `missionary-portal/donors.ts:404-441`, `:502-507`; `missionary-portal/redaction.ts:38-46`                                                                                                                    |
| E9  | `crm_record_links` (the ratified source-binding carrier, D9) grants SELECT/INSERT/UPDATE to `authenticated` under staff-membership policies. **#2295 does not revoke that write access.** It recreates the policies as pure-tenant `tenant_id = authz.current_tenant_id()` and leaves grants and service_role unchanged. `authz.current_tenant_id()` reads the JWT `app_metadata.tenant_id`, which signup sets for any user, donors included (inferred). **This corrects decision-log D9 and O7,** which say #2295 "revokes direct access". | repo-integrated; repo-published (#2295 OPEN) | `20260508000413_crm_identity_mapping.sql:200-243`; `20261024163000_authz_definer_execute_lockdown.sql:39-41`; #2295 body "Scope"/"In"; `20260226113000_authz_memberships_foundation.sql:130-141`, `:224-226` |
| E10 | Operators "MUST remain bounded by the exact audited, purpose-bound, time-boxed tenant grant". `PlatformOperatorPrincipal` exists but has no consumer. Today's cross-tenant path is `authz.is_super_admin()` in RLS.                                                                                                                                                                                                                                                                                                                         | repo-published contract; repo-integrated     | `openspec/contracts/identity-and-access.md:218-220`; `packages/api/src/principal/types.ts:47-50`; r06 §7.6                                                                                                   |
| E11 | Every staff subrole has full Mission Control admin in MVP. No Data Tools or import capability exists.                                                                                                                                                                                                                                                                                                                                                                                                                                       | repo-integrated                              | `packages/auth/permissions.ts:36-41`; r06 §7.4, §7.8                                                                                                                                                         |
| E12 | Imported emails are never verified possession. `email_verified_at` may be set only by the verified-claim path (#509). #509's planned reveal gate rejects shared email and household as authority. #510 legacy invitations are one per call, consent-gated, with no bulk path.                                                                                                                                                                                                                                                               | repo-integrated; repo-published (OPEN)       | `docs/security/identity-email-normalization.md:66-69`; #509 body; #510 body                                                                                                                                  |
| E13 | Neither Phase 29 nor Phase 30 owner text requires detection of card numbers, bank numbers or secrets at Phase 30 intake. The rule exists only as Phase 13 intent (story 172; :743-746) and as research proposals (r3).                                                                                                                                                                                                                                                                                                                      | repo-published (absence by grep)             | PR #2430 custody volume F30 row `:368`, `:380`; P13 PRD :542-544, :743-746                                                                                                                                   |
| E14 | Background workflow events carry no actor. They use the nil-UUID system actor. `withTenant` is the required, existing isolation guard for Inngest jobs, and the service-role allowlist is frozen and shrink-only.                                                                                                                                                                                                                                                                                                                           | repo-integrated                              | `packages/api/src/workflows/events.ts:20-22`; `docs/security/tenant-guard.md:3`, `:230-240`                                                                                                                  |

**What this means for the decision.** Option A is not unsafe in itself on these three axes; a single bounded switch is easier to keep tenant-safe than B or C. The danger is in the **current integrated money and CRM prototype**. If a v1 import writes into the tables and columns that exist today (they are the only targets on develop), Option A would turn legacy identifiers into live, routable and refundable control. It would also expose staff-only data to missionaries. The concerns below are mostly guards to add to the refinements, not reasons to reopen A.

---

## 1. Tenant safety

**Material concern: YES.**

**What I checked:**

- How a tenant's Stripe client, webhook routing, refund and billing-portal paths resolve the tenant and account (E1-E5).
- Whether legacy provider IDs could cross tenants.
- How the switch unit ("one ministry") maps onto a SiteStacker installation, Sites and legacy merchant accounts (r1 §3A; P13 binding model).
- Intra-tenant role and permission widening through the live missionary projection (E8).
- Who would operate a switch, and with what cross-tenant authority (E10).

**Verdict:** Option A itself does not mix tenants. Four gaps would let it. The most serious is that legacy provider IDs become live, routable control through today's money paths. The others are an undefined switch unit, intra-tenant visibility widening through legacy columns, and an unbounded operator path if Asym staff run switches.

### v3-T1: Legacy provider IDs become live, cross-tenant-routable control

- **What could go wrong.** Phase 13, 14 and 16 owner tables do not exist on develop (decision log §8). A v1 historic-gift or catch-up writer would therefore land SiteStacker-era references in the only columns that exist: `donors.stripe_customer_id`, `donations.stripe_payment_intent_id` / `stripe_charge_id` and `donor_pledges.stripe_subscription_id`. Live code then treats them as control:
  - **(a) Billing portal.** Every keyless tenant shares the platform Stripe account (E1). A `cus_` written into tenant B's donor row resolves against that shared account. If a customer with that ID exists there, it may belong to another tenant's donor, and the donor portal opens its Billing Portal (wallet, cards, subscriptions) for tenant B's donor (E2). This happens through a mapping error, or through a crafted upload by any staff member (E11).
  - **(b) Webhooks.** Duplicate payment-intent IDs (the Contributions plus Historic Giving overlap, K19; repeated catch-ups) make `.maybeSingle()` throw in webhook routing and refund matching (E3, E4). Raw events then fail for that payment intent. Integrity is harmed, though tenants are not mixed.
  - **(c) Legacy key pasted in.** A ministry that already uses Stripe can be set up on the prototype by pasting its **legacy** secret key into `tenants.stripe_secret_key` (E6; D13 "plaintext-key path"). Asym refunds (E5) and the whole-account Billing Portal (E2) then act on the account where SiteStacker's executor still charges. Donors can detach the cards SiteStacker relies on, and staff can refund legacy charges from Asym. Phase 16 formal cutover (C9) and P13 :733-742 ("observation is not control") are bypassed.
  - **(d) Copied customers.** Stripe's PAN copy keeps customer IDs, so the same `cus_` exists on the old and new accounts (r4 verifier, verified-vendor-doc). Unscoped lookups cannot tell them apart.
- **Why it matters.** It can disclose another tenant's donor payment details, and it lets a former executor's money objects be mutated from Asym. Both are named product-safety invariants (AGENTS.md; P13 :733-742).
- **Severity:** high. **Likelihood:** medium. Columns are the path of least resistance while owner targets are absent, and D13 says production may already run the plaintext-key path.
- **Evidence:** E1-E6 (repo-integrated); https://docs.stripe.com/connect/webhooks ("Each event for a connected account contains a top-level `account` property that identifies the connected account", verified-vendor-doc, 2026-11-01); r4 G9/G14 and its edge case "A SiteStacker-era customer ID is imported into donors.stripe_customer_id".
- **Effect on answer:** narrows. Refinement 4 ("per-record lineage") must say lineage is **inert**, and Option A needs a go-live gate.
- **Best permanent fix:**
  - Legacy provider references live only in Phase 30 staging and lineage, keyed by (tenant, environment, provider, provider account, mode, object type, object ID). They are never written to any column read by webhook, refund, billing-portal, recurring or checkout code.
  - Before any migrated tenant goes live, Phase 13 and 16 must:
    - remove the platform-key fallback for tenant money paths;
    - route events by `event.account` to the Settlement Account Binding;
    - add tenant- and account-scoped uniqueness on provider references;
    - reject a tenant whose credential is a legacy account key.
- **Spec language:**
  - "Legacy processor and SiteStacker identifiers (customer, payment method, charge, payment intent, subscription, vault token, gateway transaction) are inert source evidence. Phase 30 stores them only in its staging and lineage records, keyed by tenant, environment, provider, provider account and mode. No Phase 30 run writes them to a field that Asym reads to route webhooks, issue refunds, open a billing or customer portal, charge, or resolve a tenant."
  - "A migrated tenant cannot go live while (i) any tenant money path can fall back to the platform Stripe key, (ii) webhook tenant resolution uses provider metadata or an unscoped lookup instead of `event.account` → Settlement Account Binding, or (iii) the tenant has a stored processor secret key."
  - Acceptance criterion: "Fixture: two tenants plus one copied `cus_` present on two accounts. Importing legacy references for tenant B changes no column read by `donor-portal/billing`, `stripe/webhooks`, `stripe/refunds` or `stripe/recurring`. A webhook for the old account's object mutates nothing in either tenant."
- **Bucket:** resolve_before_recording (it amends refinement 4's wording and adds a gate the founder should see).

### v3-T2: The switch unit is undefined when an installation or merchant account spans more than one organization

- **What could go wrong.** "One planned switch per ministry" assumes one ministry = one Asym tenant = one SiteStacker installation = processor accounts used only by that ministry. The research shows:
  - a SiteStacker installation has several Sites, each with its own gateways and possibly its own legal entity (r1 A2, A3);
  - CRM people are installation-wide, with a many-to-many "Person Site" relation of undocumented meaning (r1 B11);
  - the catch-up may be sourced from processor reports (r2, r3, r4).

  If one installation serves more than one organization that will be separate Asym tenants (for example an agency with affiliated ministries), an installation-wide CRM export imported into one tenant discloses the other organization's supporters (assumption). The same happens if a legacy merchant account is shared, for example by a fiscal sponsor or umbrella organization (assumption). Their processor report also carries the other organization's donors and gifts into this tenant. Splitting one installation into several tenants has no proven partition key.

- **Why it matters.** It is a cross-organization PII disclosure and a wrong-totals failure that the "per Legal Entity × currency" reconciliation cannot detect, because the foreign rows are internally consistent.
- **Severity:** high. **Likelihood:** low-medium. Whether multi-organization installations or shared merchant accounts exist among target ministries is **unverified**. A census question settles it.
- **Evidence:** r1 §3A A2/A3 and §3B B11 (vendor evidence V9-V11, V31); P13 :664-667 (binding per Tenant × Legal Entity × environment × purpose, repo-ratified); C19 (Site never selects Legal Entity); r2/r3/r4 processor-report catch-up proposals.
- **Effect on answer:** narrows (defines the unit).
- **Best permanent fix.** Define the v1 unit as exactly one Asym tenant fed by exactly one SiteStacker installation, with every legacy merchant account used for reconciliation or catch-up dedicated to that tenant's organization(s). The census asks the question. Anything else is outside v1 unless an owner-approved partition proof exists. Processor-report rows that are not attributable to the tenant's census Sites, merchant accounts and designations are rejected at intake and not retained.
- **Spec language:**
  - "A v1 switch binds exactly one Asym tenant to exactly one SiteStacker installation. Readiness records, with the ministry's attestation, whether the installation or any legacy merchant account serves any organization other than this tenant's Legal Entities. If it does, the switch is blocked for v1."
  - "Catch-up or reconciliation rows from a processor report that cannot be attributed to a census merchant account and a mapped designation of this tenant are rejected before staging. Their content is not retained, only counts and the reason."
- **Bucket:** spec_requirement.

### v3-T3: Intra-tenant visibility widening through legacy columns and lost source restrictions

- **What could go wrong.** Missionary visibility of donors is decided today by the single legacy column `donors.missionary_id`. The live projection shows `notes`, `tags`, `birthday`, `anniversary`, `spouse` and addresses to that missionary for named donors (E8). With no Party, Household or notes owner targets on develop, a v1 writer could:
  - map SiteStacker CRM notes (which include member-care, security and health content, r1 B12) or internal tags into `donors.notes` / `donors.tags`, exposing staff-only content to a missionary;
  - choose `donors.missionary_id` from Person Owner, a last designation or a relationship. That is an access-control decision hidden in a mapping, and it supports only one missionary per donor;
  - bulk-set `defaultAnonymousToRecipient=false` so that "partners show up", overriding donor anonymity (anonymity fails safe only while the key is absent, E8).

  SiteStacker's own User Group, CRM/Entity and Report-Tag restrictions are census-only (r1 C2). Anything restricted there arrives under Asym's uniform staff access (E11).

- **Why it matters.** A missionary or junior staff member could read member-care notes or the identity of an anonymous donor. Phase 10 classes these as `care` and `security` (Phase 10 PRD :95), and Phase 25/28 projection rules govern them.
- **Severity:** high. **Likelihood:** medium.
- **Evidence:** E8, E11; r1 §3B B12, §3C C2; decision log §8 (no Party targets); r6 finding 7 (live Lapsed and joined-today signals).
- **Effect on answer:** narrows.
- **Best permanent fix:**
  - Imports write only through owner commands (C1; owner-constraints :436-438). They never write visibility-bearing or free-text legacy columns.
  - Missionary visibility derives only from the Phase 25/28 projection over imported gifts and relationships, with SiteStacker anonymity mapped per gift to the owner field.
  - Sensitive families (notes, activities, files, applications, prayers, care, minors) import as restricted by default or are held until classified.
  - The plan shows a "visibility change" summary: counts of Parties newly visible to each missionary or role.
- **Spec language:**
  - "No Phase 30 run writes `donors.missionary_id`, `donors.notes`, `donors.tags`, the anonymity keys of `donors.giving_preferences`, or any successor field that grants a missionary, donor or role visibility. Visibility is derived by the owning projection."
  - "Imported notes, activities, files, applications, prayer and care records default to the most restrictive visibility the target owner offers, until a reviewer with the classification capability changes it."
  - "The no-write plan reports, per missionary and per role, how many supporters become newly visible after commit, and commit requires acknowledging it."
- **Bucket:** spec_requirement.

### v3-T4: Asym-operated switches have no bounded cross-tenant authority today

- **What could go wrong.** All published nonprofit-CRM migration practice is staff-led (r6 §2, X11-X15). Whether Asym staff, the ministry or a partner runs a switch is an open founder question (r6). If Asym staff run it, the only integrated cross-tenant mechanism is `authz.is_super_admin()` in RLS, plus service-role tools (E9, E10, E14). That access is global and standing, not "audited, purpose-bound, time-boxed" as identity-and-access.md:218 requires. Two failures follow:
  - an operator working on several ministries can stage, plan or commit against the wrong tenant;
  - one operator account can read every ministry's staged exports.
- **Why it matters.** Cross-tenant write and read during the riskiest operation of the product.
- **Severity:** high. **Likelihood:** medium (staff-assisted early switches are the likely operating model; assumption).
- **Evidence:** E9, E10, E14; r6 open founder question "Who runs a ministry switch"; #2295 (OPEN) removes `is_super_admin` from staff tables, so this path is also being retired.
- **Effect on answer:** changes. Option A must name the operator model, and an Asym-run switch has a prerequisite.
- **Best permanent fix:**
  - The founder decides who operates.
  - If Asym staff operate, each switch requires a per-tenant, time-boxed, purpose-bound operator grant (identity-and-access :218-220) with separate read-raw-rows, commit and sign-off actions.
  - The tenant is bound from server context when the session is created. It is immutable for every run, and every deferred chunk re-proves it.
  - No super-admin or service-role shortcut.
- **Spec language:**
  - "Every switch, session, plan, run and catch-up carries an immutable tenant set by the server when created, never from request input."
  - "A non-member operator may act only under an active, audited, time-boxed operator grant for that tenant and purpose. Expiry or revocation stops further chunks."
  - Acceptance criterion: "An operator with grants for tenants A and B cannot commit a plan created in A while acting in B. A super-admin profile with no grant sees zero staged rows."
- **Bucket:** spec_requirement (the operator-model choice itself is a founder question, raised in §5).

### v3-M2 (monitor, tenant safety): foreign rows in processor-report catch-ups

- **Signal:** count of catch-up or reconciliation rows rejected as "not attributable to this tenant's census merchant accounts or designations", per catch-up run.
- **Threshold:** any non-zero count in a run, or a rejected row whose payer email or name matches a Party in another Asym tenant (checked server-side, counts only).
- **Owner:** the Phase 30 switch owner (named per switch) with the ministry finance contact.
- **Response:**
  - Pause further catch-ups for that switch.
  - Re-run the merchant-account census with the ministry.
  - If the account is shared, close the tail through a partition the money owner approves, or route the remaining facts to finance exception review outside Phase 30.
- Details sit in the structured output; context is v3-T2.

---

## 2. Database, RLS and authorization safety

**Material concern: YES.**

**What I checked:**

- RLS policies and grants on the ratified lineage carrier `crm_record_links`, and what #2295 actually changes.
- Tenant nullability, defaults and same-tenant FKs on the money tables an import would touch.
- Service-role and actor handling for background runs (`withTenant`; frozen allowlist; nil-UUID system actor).
- Capability coverage for the switch's consequential actions.
- How replay and convergence keys would be scoped for refinement 1 ("exact repeat import = replay the same snapshot").
- Whether refinement 2's "never overwrites" rule can be enforced at the write boundary.

**Verdict:** The integrated schema enforces tenant correctness only partly: composite donor FK, `withTenant`, a tenant-scoped email key. The surfaces Option A leans on most are writable or under-constrained: lineage, anonymous gifts, missionary and fund references, and pledges. There is also no authorization model for freeze, commit, sign-off or catch-up. All of this is fixable in the Phase 30 spec. None of it invalidates A.

### v3-D1: The lineage carrier is client-writable, and #2295 does not fix it (corrects D9/O7)

- **What could go wrong.** Refinement 4 makes per-record lineage the backbone of replay (refinement 1), reimport convergence (`roadmap.md:4363`), catch-up matching (refinement 2) and later Option B. The ratified carrier, `crm_record_links` (D9), grants INSERT/UPDATE to `authenticated` under staff-membership policies (E9). The decision log expects #2295 to "revoke direct access" (D9, O7). It does not: #2295 rewrites the policies to pure-tenant `tenant_id = authz.current_tenant_id()` and leaves the grants alone. `current_tenant_id()` reads the JWT `app_metadata.tenant_id`. If that claim is present for donor or missionary sessions (inferred from the signup trigger), any authenticated user of the tenant could write bindings after #2295 lands.

  #2295 conditions pure-tenant conversion on a census and expects a same-tenant donor fixture to see 0 rows. That expectation is inconsistent with the pure-tenant predicate unless donors lack the claim, which is unresolved. A staff member, or another tenant user under the pure-tenant form, can then re-point a source ID to another Party. The next replay or catch-up attaches gifts or history to the wrong person, and the forged binding looks like provenance.

- **Why it matters.** Lineage is the authority that convergence and "never overwrite" rest on. If it is forgeable, money and history can be misattributed quietly, inside a tenant.
- **Severity:** high. **Likelihood:** medium (only if lineage reuses `crm_record_links` before an explicit revoke).
- **Evidence:** E9; decision-log D9 ("until #2295 (open, unintegrated) revokes direct access") and O7; #2295 body ("Each `authenticated` policy is dropped and recreated as `tenant_id IS NOT NULL AND tenant_id = (SELECT authz.current_tenant_id())`"; "`service_role` policies are unchanged").
- **Effect on answer:** narrows (refinement 4 needs a carrier rule). It also corrects the record.
- **Best permanent fix:**
  - Lineage and source-binding rows are written only by the server-side Phase 30/owner command, as a security-definer RPC or under `withTenant`. `authenticated` gets at most SELECT through the owner's projection.
  - File an explicit revoke of INSERT/UPDATE (O7 needs its own ticket; #2295 is not it).
  - Bindings are append-only with supersession, never updated in place.
- **Spec language:**
  - "Source bindings and per-record lineage are append-only. They are written only by the owning server command, and no client role holds INSERT, UPDATE or DELETE on them. Re-pointing a binding creates a superseding row with actor, reason and run identity."
  - Acceptance criterion: "As `authenticated` (staff, missionary and donor of the same tenant), INSERT and UPDATE on the binding store fail with 42501."
  - Decision-log correction: "O7: #2295 does not revoke direct DML on `crm_record_links`; it rewrites the policies to tenant-only. A separate revoke is required."
- **Bucket:** spec_requirement.

### v3-D2: Tenant correctness depends on application code for the rows Option A writes

- **What could go wrong.** A v1 import landing in today's tables runs as service role and bypasses RLS (E14; r06 §7.1). Today's schema then:
  - accepts a donation with no tenant, which lands in tenant `...0001` by default (E7);
  - accepts an anonymous historic gift (NULL legal donor, C6) in the default tenant, because the composite donor FK is skipped when `donor_id` is NULL;
  - accepts a donation pointing at another tenant's missionary or fund (single-column FKs);
  - accepts a pledge with no same-tenant donor FK.

  Option A's final import is one very large service-role write per ministry, so one bug in tenant propagation or a lookup reaches every row.

- **Why it matters.** Cross-tenant financial rows are hard to detect, and reconciliation per tenant can still balance. The positive: `withTenant` already exists and is required for jobs (`tenant-guard.md:3`).
- **Severity:** high. **Likelihood:** low-medium (low if imports use owner commands on owner tables with composite keys; medium if they reuse legacy tables).
- **Evidence:** E7, E14; Phase 29's equivalent standard, AC29-D01-04 ("composite keys/references prevent cross-Tenant or wrong-version binding"; PR #2430 custody volume :18); r06 discrepancy 4 (inferred defaults).
- **Effect on answer:** narrows.
- **Best permanent fix:**
  - Phase 30 staging, plan, run, binding and switch tables, and every owner table an import writes, have `tenant_id NOT NULL` with **no default**, plus composite same-tenant FKs for every reference.
  - Runs execute under `withTenant`, with the tenant taken from the immutable run record.
  - Legacy tables with tenant defaults are not import targets.
- **Spec language:**
  - "Every table written by a Phase 30 run, or by an owner command it invokes, has a non-null tenant without a default, and composite same-tenant references for every foreign key."
  - "Runs execute only inside `withTenant(run.tenant_id)`."
  - Acceptance criterion: "A run payload with a missing or foreign tenant, or a reference to another tenant's missionary, fund, designation or Party, is rejected by the database (23503, 23502 or 42501), not only by application validation. An anonymous (null-donor) historic gift without a tenant cannot be inserted."
- **Bucket:** spec_requirement.

### v3-D3: The switch's consequential actions have no authorization model

- **What could go wrong.** Option A adds new consequential actions:
  - declaring the freeze and boundary;
  - attesting that SiteStacker automations, forms and Mailchimp are off (refinement 3);
  - reading raw staged rows;
  - committing the final run;
  - signing off reconciliation;
  - pressing go-live;
  - reviewing and committing catch-ups.

  Today every staff subrole holds every Mission Control capability (E11), and no Data Tools capability exists (r06 §7.8). By default any staff member, including a volunteer data-entry role, can commit a whole ministry's history, sign off its money reconciliation and attest on the ministry's behalf. Deferred chunks run as the nil system actor (E14), so a committer who loses access mid-run is not re-checked unless the spec requires it (C16; identity-and-access :220).

- **Why it matters.** Unauthorized or unaccountable bulk writes of financial history. An attestation also has no identifiable, authorized attester.
- **Severity:** medium-high. **Likelihood:** high, because it is the default.
- **Evidence:** E11, E14; C16 (P12 :2249, :2327); identity-and-access.md:220 ("Deferred … work MUST … re-prove current identity … at fire time"); r6 owner gap "Phase 12: no capability defines who may commit a final run, declare the freeze, sign off reconciliation or press go-live".
- **Effect on answer:** narrows.
- **Best permanent fix:**
  - Distinct capabilities for: prepare/plan; read raw rows and error files; commit per target family (money families additionally need the money owner's capability); declare boundary; attest legacy-system state; sign off reconciliation; go-live; catch-up commit.
  - Each chunk re-proves the committer's current capability. Loss of authority pauses the run visibly (O11).
  - Whether the committer may also sign off money reconciliation is a founder question (r6). At minimum both actors are recorded.
- **Spec language:**
  - "Freeze declaration, legacy-state attestation, final-run commit, reconciliation sign-off, go-live and catch-up commit are separate capabilities. None is implied by a generic staff role."
  - "Each run chunk re-proves the committing actor's current capability for that target family. A failed re-proof pauses the run in a visible terminal-or-paused state."
  - "The attestation records the attesting person, their capability and the checklist version."
- **Bucket:** spec_requirement.

### v3-D4: Replay and convergence keys must be scoped by tenant and source installation, never global

- **What could go wrong.** Refinement 1 replays a snapshot, and reimport converges on "the same permitted target identity" (`roadmap.md:4363`). SiteStacker internal IDs are per-installation integers (r1 K4, V31), and Stripe copies keep the same `cus_` across accounts (r4 verifier). Two designs fail:
  - **Key too narrow:** a uniqueness or lookup key of (source system, source record ID), or a byte digest. A second tenant's or second installation's identical IDs, or identical bytes, would collide. The import fails and leaks existence through the error, or worse, converges onto the other tenant's target if the convergence lookup runs unscoped under service role. Unscoped lookups are an established pattern in today's money code (E3).
  - **Global byte deduplication:** forbidden anyway by Phase 29 (AC29-D04-02, "no bytes-only permanent business deduplication").
- **Why it matters.** It is a cross-tenant write or disclosure path inside the replay mechanism refinement 1 introduces.
- **Severity:** high. **Likelihood:** low.
- **Evidence:** E3; r1 K4; P29 AC29-D04-02 and AC29-D01-04 (PR #2430 custody volume :18, :58); r4 verifier (Stripe copy keeps IDs).
- **Effect on answer:** no_change to A. It is a requirement on refinements 1 and 4.
- **Best permanent fix:**
  - Every identity key is (tenant, environment, source system, source installation or provider account, mode, entity type, source ID).
  - Snapshot identity is (tenant, switch, manifest digest).
  - Convergence lookups always include the tenant and run under `withTenant`.
- **Spec language:**
  - "Source identity for replay and convergence is the tuple (tenant, environment, source system, source installation or provider account, mode, entity type, source record ID). Snapshot identity is (tenant, switch, manifest digest). No uniqueness or lookup omits the tenant or the installation/account."
  - Acceptance criterion: "Two tenants upload byte-identical files with identical source IDs. Each converges only within its own tenant, and neither sees an error naming the other."
- **Bucket:** spec_requirement.

### v3-D5: "Never overwrites supporter details" must be structural, not a run setting

- **What could go wrong.** Refinement 2 says the catch-up "never overwrites supporter details and never wins over Asym edits". If the rule is enforced as a mode flag on a general import command, two things can happen:
  - a mis-set flag, or a later profile reusing the command, lets catch-up rows update Party fields;
  - Phase 14's "re-import updates" behaviour (r4 owner gap) and owner-constraints :371-372 ("re-import updates instead of duplicating") pull the other way.

  Legacy tables have only `updated_at`, with no per-field revision for compare-and-set (`init_schema.sql:70-97`).

- **Why it matters.** It is the difference between an allowed write turning a valid row into a forbidden state, and the database making that write impossible.
- **Severity:** medium. **Likelihood:** medium.
- **Evidence:** refinement 2 text (task); `roadmap.md:4349` ("a changed target is a conflict, not permission to overwrite"); owner-constraints :371-372; r4 owner gap on Phase 14 re-import updates.
- **Effect on answer:** no_change to A. It sharpens refinement 2.
- **Best permanent fix:**
  - Catch-up runs invoke only a gift-and-money-fact append command, typed per owner, with no Party or contact update path.
  - Target writes in the final run use per-target revision compare-and-set, bound into the plan.
- **Spec language:**
  - "A catch-up run can invoke only owner commands that append money facts and supersede nothing on a Party. No command reachable from a catch-up profile accepts Party, contact, consent or relationship field changes."
  - Acceptance criterion: "A catch-up file that changes a supporter's address produces a reviewed discrepancy and zero Party writes."
- **Bucket:** implementation_safeguard.

---

## 3. Security and privacy risks

**Material concern: YES.**

**What I checked:**

- PCI exposure paths in the switch: processor files, full database packages, "unmask" routes and the attestation evidence that refinement 3 invites.
- Third-party credentials SiteStacker holds: gateway keys, per-user API keys, missionaries' Mailchimp API keys, SAML, pre-login tokens.
- Whether owner texts require detection or quarantine at Phase 30 intake (E13).
- The plaintext tenant-key path against Phase 13.
- Privacy duties while two systems of record coexist during the late tail.
- Custody and retention for practice-run snapshots, including pre-contract data (F2).
- Claim and invitation risk from imported, unverified emails (E12).
- Minimization for excluded sponsorship data and Phase 10 restricted-tier people.

**Verdict:** A has no inherent flaw here, but four gaps are material:

- the switch invites credential- and card-bearing artifacts, with no detection rule in any owner text;
- the late tail leaves a second live store of the same donors that Asym's privacy controls cannot reach;
- practice runs need real data before custody, retention and a contract basis exist;
- excluded and restricted data has no minimization rule.

### v3-S1: Credential- and card-bearing artifacts can enter Asym during the switch

- **What could go wrong.** The switch asks ministries for many exports. Several realistic artifacts carry secrets or card data:
  - a full database or WMTEK package, containing password hashes, per-user API secrets, gateway credentials, missionaries' own Mailchimp API keys, pre-login tokens and processor tokens (r1 A4, C4, C5, V33, V47, V56; r1 §7 edge case);
  - an old processor's encrypted PAN file uploaded to Asym by mistake (r3 PX);
  - an iATS-style "unmasked" export of full card numbers (r2; third-party);
  - attestation "evidence" for refinement 3. r1 asks whether it should be screenshots or a configuration export, and SiteStacker settings pages hold integration keys (r1 A4, V55).

  E13: neither the Phase 29 spec nor any Phase 30 owner text requires detecting card numbers, bank numbers or secrets at Phase 30 intake. r09's control checklist (§4.4) has no such row either.

- **Why it matters.**
  - Holding PAN expands Asym's PCI DSS scope, against ratified intent (P13 story 172 at :542-544; :743-746 "Asym never handles raw PAN, CVV/CVC, or full bank credentials").
  - Holding live third-party credentials lets Asym staff, or an attacker, charge donors on the old gateway or mail donors from a missionary's own account.
- **Severity:** critical. **Likelihood:** medium. Ministries asked to "export everything" often send everything, and an attestation-evidence request invites screenshots of settings pages (assumption grounded in r1 §5/§7).
- **Evidence:** E13; P13 :542-544, :743-746 (repo-ratified); r1 A4/C4/C5 (vendor docs V33, V47, V55, V56); r2 (iATS unmask, third-party); r3 PX (mistaken PAN upload); P29 AC29-D05-02 and AC29-D05-05 (parsers with no ambient credentials; operator quarantine routes).
- **Effect on answer:** narrows (refinement 3 must not ask for credential-bearing evidence; intake needs a rule).
- **Best permanent fix:**
  - Phase 30 intake profiles admit only listed families and columns.
  - Before parsing or staging, content detection runs for:
    - card numbers (Luhn plus brand length);
    - bank account numbers next to routing numbers;
    - password-hash and API-key formats.
  - On a hit: quarantine without parsing, preview or derivative; tell the uploader; dispose through Phase 29. Whole-database packages are refused unless a reviewed table and column allowlist is applied before Asym receives the bytes.
  - Refinement 3's attestation is a structured checklist (each item: off / not used / cannot confirm, plus the attester). Asym never requests screenshots or configuration exports of credential pages.
- **Spec language:**
  - "Phase 30 never accepts raw card numbers, CVV/CVC, full bank account numbers, password hashes, session or pre-login tokens, or API or gateway credentials. Intake runs card, bank-number and secret detection before parsing. A positive result quarantines the file without parsing or preview and starts Phase 29 disposal. The file cannot be released into staging by any override."
  - "The legacy-system attestation is a structured checklist answered per item by an identified attester. Asym does not request or store screenshots or configuration exports of integration, gateway or API settings."
  - Acceptance criterion: "A CSV containing one valid test PAN, a file containing a bcrypt hash column, and a file containing a `sk_live_`-shaped string are each quarantined, unparsed and unpreviewable. A valid CRM export with numeric IDs that fail Luhn is not."
- **Bucket:** spec_requirement.

### v3-S2: No legacy processor or SiteStacker credentials in Asym; the tail runs on exported files

- **What could go wrong.** The research makes a months-long tail likely, during which catch-ups need data from SiteStacker and from the old processors: PayPal subscriptions run by PayPal, gateway-dashboard refunds and ACH returns (r2, r3, r4, r5 K2). The operational pressure is to automate by asking the ministry for its old Stripe, PayPal or Braintree API key, or a SiteStacker API key (V33: requests act "with the authority of the user", r1 C4), and storing it.

  The prototype already stores tenant secret keys in plaintext (E6). Phase 13 forbids exactly this: "never a stored tenant key" (:664-667), "Do not use OAuth" (:661). Any read-only observation grant needs a Phase 13 amendment (r4, and the verifier's note on read-only scope).

- **Why it matters.**
  - Long-lived secrets for accounts where another executor runs give Asym read_write authority it must not have (C9).
  - A leaked key can refund, charge or read donors.
  - It reintroduces the T1 control hazards.
- **Severity:** high. **Likelihood:** medium.
- **Evidence:** E6; P13 :659-667 (repo-ratified); r1 C4 (V33); r4 open question on a "migration-only read-only observation grant"; verifier note on OAuth `read_only` scope (https://docs.stripe.com/connect/oauth-standard-accounts, verified-vendor-doc via r2 verifier).
- **Effect on answer:** narrows (it constrains where refinement 2's catch-up data comes from).
- **Best permanent fix:**
  - v1 catch-up and census inputs are files the ministry exports, under Phase 29 custody.
  - Asym never requests, stores or uses legacy processor or SiteStacker credentials.
  - Migrated tenants are bound only through the Phase 13 Settlement Account Binding.
  - A read-only observation grant, if wanted, is a Phase 13 amendment first.
- **Spec language:**
  - "During readiness, switch and tail, Asym never requests, receives, stores or uses credentials for a legacy processor account, SiteStacker, Mailchimp or another legacy integration. Catch-up and census inputs are ministry-exported files under Phase 29 custody."
  - "A migrated tenant has no value in any stored-secret field. Its money access is the Phase 13 Settlement Account Binding only."
- **Bucket:** spec_requirement.

### v3-S3: The late tail leaves a second live store that Asym's privacy controls cannot reach

- **What could go wrong.** After go-live, SiteStacker keeps running for legacy recurring gifts, receipts, decline emails, the donor dashboard and possibly the Spark pre-billing reminder (r2; r5 K1; r4). It still holds the full donor database, staff and donor logins, per-user API keys, 3-day pre-login tokens and SAML (r1 C1, C4, C5). Missionaries' own Mailchimp lists keep sending regardless of any SiteStacker setting, because the integration is a manual one-way export (verifier, 151000122392). Concretely:
  - **Privacy requests stop at Asym.** A donor who asks the ministry (now in Asym) to erase their data, stop contact or unsubscribe is honoured in Asym (C10). SiteStacker, the old processor and missionary lists keep mailing and holding the data.
  - **Catch-ups re-identify.** Catch-ups from SiteStacker or processor exports can bring erased people back (P13 :746-747; r5 E-50).
  - **Offboarding stops at Asym.** Staff removed in Asym keep SiteStacker access to the whole donor database.
  - **No deletion plan.** Nothing defines when SiteStacker data is deleted after decommission.
- **Why it matters.** Erasure and opt-out duties fall on the ministry as controller across both systems. FTC guidance requires honouring opt-outs "within 10 business days" and says "you can't contract away your legal responsibility" (verified official guidance, 2026-11-01). CAN-SPAM's reach over nonprofit solicitations is not established here (unverified). Departed-staff access is a standing exposure of donor PII.
- **Severity:** high. **Likelihood:** high, since the tail is expected to last months (r5 S9: ACH 60 days; cards 120 days plus disputes).
- **Evidence:** r5 K1/K2/E-50; r2 recurring-tail recommendations; r1 C1/C4/C5; verifier on 151000122392; P13 :746-747 (repo-ratified); C10; FTC CAN-SPAM guide https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business.
- **Effect on answer:** changes. "Asym becomes the only place for supporters" is not true for privacy duties during the tail, and the switch record must carry them.
- **Best permanent fix:**
  - **Privacy forwarding list.** Every erasure, do-not-contact, unsubscribe and suppression recorded in Asym for a migrated Party after the boundary goes on a "forward to legacy systems" list. The ministry marks each item executed in SiteStacker, the processor and connected missionary Mailchimp accounts.
  - **Catch-up honours Asym-side state.** Erasure and suppression win: catch-ups never re-create contact data for erased or suppressed Parties.
  - **Shrink SiteStacker at the boundary.** Reduce staff access to named minimum roles, revoke per-user API keys, rotate integration credentials, and disable self-registration.
  - **Decommission checklist.** It records the ministry's retention and deletion decision for SiteStacker data and any WMTEK confirmation (availability unverified).
- **Spec language:**
  - "From the boundary until tail closure, each privacy request recorded in Asym for a migrated supporter is listed on the switch record as 'pending in legacy systems' until a named ministry user marks it executed in SiteStacker, each legacy processor and each connected missionary mailing account."
  - "Catch-up runs never create or restore contact, consent or identity data for a Party that is erased, suppressed or marked do-not-contact in Asym."
  - "The boundary checklist includes reducing SiteStacker staff access to named minimum users, revoking per-user API keys and rotating integration credentials. The decommission checklist records the ministry's SiteStacker data deletion or retention decision."
- **Bucket:** spec_requirement (with monitor v3-M1).

### v3-M1 (monitor, privacy): privacy requests not yet executed in legacy systems

- **Signal:** age of the oldest open "pending in legacy systems" item on each open switch, and the count of open items.
- **Threshold:** any item open more than 10 business days. FTC's opt-out window is used as a conservative operational limit, not a legal conclusion for nonprofits.
- **Owner:** the ministry's named switch owner, with the Phase 30 switch-record owner for visibility.
- **Response:**
  - Escalate to the ministry admin and the Asym switch operator.
  - Block tail closure and decommission sign-off while items are open.
  - If a catch-up would touch an affected Party, hold that row.

### v3-S4: Practice runs need real donor data before custody, retention and a contract basis exist

- **What could go wrong.** Option A's "practice runs that change nothing" need real exports, and r5 S1 proposes several rehearsals, each with a fresh export. Each is a full copy of the donor database: names, addresses, birthdays, notes, bank holder names and routing numbers (r2), and possibly sponsored children (r1). Phase 29 custody is unmerged and unimplemented, and there is no private import storage or malware scanning on develop (C11; decision log §8). F2 asks whether Asym may hold a prospect's export before it is a customer. Without a rule, the likely failure is that practice data ends up somewhere uncontrolled:
  - developer machines;
  - preview or demo environments (D13: the demo seed defaults to the production ref; hosted databases drift);
  - shared drives or email attachments.

  Retention is undefined (F11), and whether a customer agreement or data-processing terms cover pre-contract data is unverified (no DPA found in program docs by grep).

- **Why it matters.** Multiple ungoverned copies of the most sensitive dataset the product handles, held before the controls the roadmap requires (C11; `roadmap.md:4403` census before migration).
- **Severity:** high. **Likelihood:** high in early pilots.
- **Evidence:** C11; decision log §8, F2, F11, D13; r5 S1; repo grep for DPA terms (none in program docs; unverified).
- **Effect on answer:** narrows. "Practice runs" needs a custody and retention rule, and F2 has to settle before the first practice run.
- **Best permanent fix:**
  - Real exports are held only in the production tenant through Phase 29 custody (or one designated environment with production-equivalent controls, agreed with the Phase 29 owner). They are never held in local, preview or demo environments.
  - Each snapshot carries retention: practice snapshots and their derivatives are disposed a fixed number of days after final reconciliation acceptance or switch abort (F11 sets N).
  - Until a customer agreement and processing terms exist, only synthetic or ministry-redacted data may be used.
- **Spec language:**
  - "Real SiteStacker exports are accepted only into Phase 29 custody for the target tenant, never into local, preview or demo environments."
  - "Every practice snapshot and its staging derivatives are disposed N days after the switch's reconciliation acceptance or abort. Disposal is recorded."
  - "No real export is accepted before the ministry's customer agreement and data-processing terms are in force."
- **Bucket:** spec_requirement (it depends on the F2 and F11 founder answers).

### v3-S5: Imported, unverified emails become claim and invitation targets

- **What could go wrong.** r1 asks whether a post-switch "claim your Asym account" invitation is part of the switch plan, for the recurring donors who had SiteStacker logins. Imported emails include:
  - placeholders forced by SiteStacker's email uniqueness;
  - shared couple addresses;
  - stale or recycled addresses (r1 §7; F9).

  An invitation sent to them puts the claim step in the hands of whoever controls that inbox now. Phase 4's planned design is strong: verified possession only, shared email and household are no authority, one invitation per call with a consent gate (E12). But a switch-driven bulk invitation would be a new path, and the stakes are higher for migrated records: decades of giving, addresses, and possibly vault-copied payment methods.

- **Why it matters.** It could disclose a supporter's history to the wrong person.
- **Severity:** medium. **Likelihood:** medium.
- **Evidence:** E12; `roadmap.md:4365` (no "account grant … merely because a row was imported"); r1 C1 and K22 as corrected by the verifier.
- **Effect on answer:** no_change to A. It constrains follow-on actions.
- **Best permanent fix:**
  - The switch issues no invitations or claim proofs.
  - Imported email is recorded as unverified legacy contact data with provenance.
  - Census-flagged placeholder, shared or role addresses make a Party ineligible for invitation until staff verify it.
  - Any bulk invitation is a separate Phase 4/17 design.
- **Spec language:**
  - "Imports never set email verification or claim state. The switch sends no account invitations."
  - "Parties whose imported email is flagged placeholder, shared or role-based are excluded from any later legacy invitation until a staff member records verification."
- **Bucket:** spec_requirement.

### v3-S6: Excluded and restricted-tier data has no minimization rule

- **What could go wrong.** C13 requires a visible disposition for excluded child-sponsorship records, and r1 K21 shows sponsorship money mixed into ordinary Contributions. Several things follow:
  - **Children's data is retained.** Staging and disposition records could keep children's names, photos and letters (V73), and household children (V50), indefinitely. Issue grids and error files would show them to import operators.
  - **Restricted-tier missionaries lose protection.** People in high-risk countries could be committed before classification. Phase 10 requires an alias for `restricted` and `high_risk` levels and rejects imports that set those levels without one (Phase 10 PRD :97). But a mapping that never sets a level leaves them at the country-risk default, or `standard` when country data is absent (inferred from :96).
  - **Sensitive files leak.** Applicant passports, background checks (r1 B14) and care notes can surface in error downloads.
- **Why it matters.**
  - Minors' and at-risk workers' data is the highest-harm category in the program (Phase 10).
  - A "visible exclusion" that keeps the excluded PII is the opposite of minimization.
- **Severity:** high. **Likelihood:** medium.
- **Evidence:** C13; r1 K21, V50, V73, B14; Phase 10 PRD :95-99 (A1-A3, repo-ratified); C17.
- **Effect on answer:** narrows.
- **Best permanent fix:**
  - Exclusion dispositions store counts, opaque source keys and the reason, not PII.
  - Excluded families identifiable by record type or column are dropped at parse. Otherwise they go to restricted staging that is disposed with the snapshot.
  - Phase 10 classification is a pre-commit gate for missionary and worker Parties.
  - Issue grids and error files redact restricted classes and are visible only with the raw-row capability (v3-D3).
- **Spec language:**
  - "An excluded record's disposition retains only the source key, family, reason and counts, never its personal content. Content identifiable as excluded is not persisted past parsing."
  - "No worker or missionary Party is committed until its Phase 10 security level is set by a reviewer or derived from an explicit country mapping. Restricted and high-risk Parties require an alias before commit."
  - "Error downloads and issue grids redact `care` and `security` classified values."
- **Bucket:** spec_requirement.

### v3-S7: Vault tokens and mapping files are high-value evidence

- **What could go wrong.** The inventory keeps processor references such as customer and payment-method IDs, gateway vault tokens if exported, card brand, last four and expiry (r1 §4). It also keeps the Stripe mapping file, which links legacy IDs to live methods with fingerprints (r3). A token usable to start a charge, combined with the merchant's credentials, is what the PCI SSC's 2011 tokenization guidance treats as a "high-value token" that may be in scope. That reading is snippet-only: press coverage of the supplement, which could not be rendered.
- **Why it matters.** Keeping such tokens in general staging, error files or exports widens exposure for no Phase 30 purpose. Phase 16 needs references for classification, not raw vault tokens.
- **Severity:** medium. **Likelihood:** medium.
- **Evidence:** r1 §4; r3 mapping-file edge case; PCI SSC tokenization supplement via press coverage (snippet-only; https://www.pcisecuritystandards.org/documents/Tokenization_Guidelines_Info_Supplement.pdf not rendered).
- **Effect on answer:** no_change.
- **Best permanent fix:** Keep only the references Phase 16 names. Store tokens and mapping files as restricted provider evidence, never in error downloads or exports. Dispose of them with the snapshot unless Phase 16 retains them under its own custody.
- **Spec language:** "Gateway vault tokens and processor mapping files are restricted provider evidence. They are excluded from issue grids, error downloads and exports. They are retained only if the Phase 16 owner names them as required cutover evidence."
- **Bucket:** implementation_safeguard.

---

## 4. Corrections to the working record and research

| #      | Statement corrected                                                                         | Correction                                                                                                                                                                                                                                 | Evidence                                                            |
| ------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| K-v3-1 | Decision-log D9 and O7: #2295 "revokes direct access" to `crm_record_links`.                | #2295 rewrites the `authenticated` policies to pure-tenant form and drops `is_super_admin()`. It leaves INSERT/UPDATE grants in place and does not revoke DML. O7 needs its own revoke.                                                    | #2295 body (OPEN); E9                                               |
| K-v3-2 | r4: "a tenant without its own key falls back to the platform key (tenant-client.ts:64-66)". | **Confirmed**, with one nuance. The docstring's "never borrows the platform env key" covers only a _missing tenant row_. A blank key still borrows.                                                                                        | `tenant-client.ts:14-16` vs `:64-66`                                |
| K-v3-3 | r4 G9/G14: "the pledge lookup can run unscoped".                                            | **Confirmed.** The tenant is optional, falls back to `metadata.tenant_id`, and with neither the query is unscoped. Payment-intent and charge-refund lookups are also unscoped.                                                             | `recurring.ts:87-121`; `refunds.ts:45-62`; `event-store.ts:105-157` |
| K-v3-4 | (new) The decision log does not record the anonymous-gift tenant gap.                       | Phase 13 anonymous gifts (C6: null legal donor) bypass today's composite donor FK. With a NULL or defaulted tenant they land in tenant `...0001`.                                                                                          | E7                                                                  |
| K-v3-5 | (new) Refinement 3's attestation scope.                                                     | Besides the sibling findings on receipts, Spark reminders and missionary Mailchimp lists, the attestation must not become a channel for credential-bearing evidence (v3-S1). Boundary steps should also shrink SiteStacker access (v3-S3). | v3-S1, v3-S3                                                        |

## 5. Current behaviour, intended behaviour and best permanent path (these three categories)

- **Current (repo-integrated).** The money prototype:
  - falls back to the platform Stripe key;
  - routes webhooks by provider metadata and unscoped lookups;
  - stores plaintext tenant secret keys;
  - grants missionary visibility from a single legacy `donors.missionary_id`;
  - leaves a nullable, defaulted `donations.tenant_id`;
  - lets client roles write the lineage carrier;
  - gives every staff role full admin.

  None of it was designed for migrated tenants. If Option A writes into it, the result is unsafe.

- **Intended (ratified or published).**
  - Phase 13 Settlement Account Binding with no stored keys and no OAuth.
  - Owner-command-only imports.
  - Phase 10 classification with aliasing.
  - Phase 12 capability registry and operator grants.
  - Phase 29 private custody, hostile-intake handling and quarantine.
  - Phase 4 verified claim and per-record legacy invitations.
  - "Asym never handles raw PAN".
- **Best permanent path (proposed).** Option A, unchanged in shape, with these guards recorded alongside the refinements:
  - inert, append-only, server-written lineage, keyed by tenant and installation or account;
  - a one-tenant, one-installation switch unit;
  - tenant-composite schema for every written table;
  - distinct capabilities for boundary, attestation, commit, sign-off, go-live and catch-up;
  - card and secret quarantine at intake;
  - checklist-only attestation;
  - file-only tail inputs with no legacy credentials;
  - a privacy forwarding duty and SiteStacker access shrink during the tail;
  - Phase 29 custody and retention for practice snapshots;
  - minimization for excluded and restricted data;
  - a go-live gate that retires the prototype money hazards first.

## 6. Questions for the founder (only these three categories)

1. **Who operates a switch?** The ministry's own admin, Asym staff, a partner, or a mix (r6)? If Asym staff are involved, accept that a per-tenant, time-boxed operator grant is a prerequisite (v3-T4).
2. **Switch unit.** Is the v1 unit exactly one Asym tenant fed by one SiteStacker installation, with dedicated legacy merchant accounts, and any shared installation or merchant account blocked for v1 (v3-T2)?
3. **Attestation.** Is the refinement 3 attestation a structured checklist only, with no screenshots or configuration exports of settings pages (v3-S1)?
4. **Practice data (with F2).** Is no real export accepted before the customer agreement, processing terms and Phase 29 custody exist, with synthetic or ministry-redacted data used until then (v3-S4)?
5. **Tail privacy duty.** During the tail, does the ministry accept a tracked duty to execute Asym-recorded erasure, do-not-contact and unsubscribe requests in SiteStacker, the processor and missionary Mailchimp accounts, and to shrink SiteStacker staff access at the boundary (v3-S3, v3-M1)?

## 7. Owner gaps raised (identified; not agreed)

- **Phase 13 / 16.** Before any migrated tenant goes live: retire the platform-key fallback, metadata/unscoped webhook routing and stored tenant secrets; add account-scoped provider uniqueness (v3-T1, v3-S2).
- **Phase 12 / 4 / 9.**
  - An explicit revoke of client DML on `crm_record_links` and `crm_merge_candidates` (O7, corrected; v3-D1).
  - Capabilities for the switch actions.
  - Wiring of operator grants (v3-D3, v3-T4).
- **Phase 29 with 30.** A card, bank-number and secret detection rule for the Phase 30 intake profile, with no-override quarantine (v3-S1). Retention for practice snapshots (v3-S4).
- **Phase 10.** A classification gate before committing worker and missionary Parties (v3-S6).
- **Phase 25 / 28.** Retire `donors.missionary_id` as the visibility grant for migrated tenants; derive visibility only from the owner projection (v3-T3).
- **Phase 4.** Keep switch-driven bulk invitations out of scope. Flag placeholder and shared imported emails as invitation-ineligible (v3-S5).
- **Phase 16.** Name which legacy references are required cutover evidence, so everything else can be disposed with the snapshot (v3-S7).

## 8. Could not verify (stated plainly)

- Whether production holds tenants on the plaintext-key or platform-fallback path (D13). Hosted state was not inspected.
- Whether donor and missionary JWTs carry `app_metadata.tenant_id` in practice, and therefore whether #2295's pure-tenant form would let them write `crm_record_links`. This is inferred from the signup trigger and contradicted by #2295's own donor-fixture criterion.
- Whether any SiteStacker installation, or any legacy merchant account, serves more than one organization (v3-T2 is assumption-based).
- What SiteStacker or WMTEK full-database packages actually contain, and whether raw card data was ever persisted by SiteStacker's legacy admin form (r2 says it is "not stored"; not independently verifiable).
- The exact PCI SSC wording on high-value tokens. The supplement PDF did not render, so press coverage is the only source (snippet-only).
- Whether Asym has a customer agreement or data-processing terms covering pre-contract exports (no DPA found in program docs).
- Whether CAN-SPAM applies to the ministries' fundraising email. Only the FTC's general 10-business-day rule was verified.
- Whether SiteStacker can be made read-only for staff while its scheduler, receipts and donor dashboard keep running (needed for v3-S3's access shrink).

## 9. Summary

| Category                          | Material concern | Concerns                                                                    |
| --------------------------------- | ---------------- | --------------------------------------------------------------------------- |
| 1 Tenant safety                   | **Yes**          | v3-T1 (resolve before recording), v3-T2, v3-T3, v3-T4, v3-M2 (monitor)      |
| 2 Database, RLS and authorization | **Yes**          | v3-D1, v3-D2, v3-D3, v3-D4, v3-D5                                           |
| 3 Security and privacy            | **Yes**          | v3-S1 (critical), v3-S2, v3-S3, v3-M1 (monitor), v3-S4, v3-S5, v3-S6, v3-S7 |

None of these invalidates Option A. One amends a refinement before recording: v3-T1, which makes per-record lineage inert and adds a go-live gate. One changes how the answer should be worded: v3-S3. "Asym becomes the only place for supporters" does not hold for privacy duties during the tail, and the switch record must carry them. v3-T4 makes the operator model a required founder choice.

Status: COMPLETE (2026-11-01).
