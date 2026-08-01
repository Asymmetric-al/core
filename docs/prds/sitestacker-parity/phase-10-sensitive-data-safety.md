# Phase 10 — Sensitive-Data Classification & Restricted-Ministry Safety Foundation

> **Program:** SiteStacker Parity · **Phase:** 10 · **Status:** Groomed + founder-grilled (grill-with-docs, 2026-07-07; G1–G7 ratified) · **Base:** `develop`
> **Subtitle:** _The safety rails — classification, dual identity, the publication firewall, identity-access grants + break-glass — before custom fields and public pages can create unclassifiable data._
> **Roadmap:** [`roadmap.md`](./roadmap.md) slot 10 (Roadmap v2). **Gates:** Phase 11 (Custom Fields) and Phase 22 (Public Missionary Pages) must not build before this lands.
> **Hard prerequisites:** **Phase 3** (`field_policies` + the subtract-only projection resolver + export governance + audit spine — this phase _extends_ it) and **Phase 9** (the party graph + record shell classification attaches to). **Soft:** Phase 4 (identity/merge), Phase 5 (the public choke-point + cache invalidation the firewall/scrub reuse — a groomed Phase-5 deliverable that builds ahead of this phase), Phase 6 (the alert seam for break-glass).
> **Charter / roadmap / matrix:** `README.md`, `roadmap.md`, `phase-map.md`, `parity-matrix.md`. Decision log: scratchpad `phase10-safety-grill.md` (G1–G7 + AM1–AM18 + the adversarial pass).

> **Why this phase is different — read before scoping down.** A missions CRM is not a generic nonprofit CRM in one brutal way: **the database itself is a targeting list.** Roughly 60 countries are creative-access/restricted; a leaked real name, photo, or location for a worker there is a **physical-safety event** — surveillance, expulsion, imprisonment, or violence against the worker and local believers — not a privacy incident. And because this is a _missions_ CRM, essentially every person record reveals religious belief by mere presence (GDPR Art. 9 special-category data), with member care adding health/counseling/crisis data. Classification is **retrofit-impossible**: once notes, files, photos, and published pages accumulate unclassified, nobody hand-triages thousands of them, and the fresh-build/no-users window closes at first tenant onboarding. This phase builds the rails **before** any surface can render worker identity. "Ship now, harden later" is an unacceptable sequencing for any worker-rendering surface.

> **Founder grill (2026-07-07) — what this session changed.** A formal grill-with-docs pressure-tested the committed PRD and ratified G1–G7, then ran a four-lens adversarial pass (over-engineering / tech-debt / brittleness / safety-congruence). Net effect: a **leaner** phase (dropped a country-risk subscription engine, a trigger-word hook, and premature purge executors) that is simultaneously **safer** (data-layer alias enforcement, sole-entry firewall). Key rulings folded below: person-level `security_level` composes with Phase-3 field sensitivity through the **one** resolver (G1); a **minimal locked room** holds only publication-dangerous identity (G2); **country risk is tenant-sovereign** with an opt-in importable WWL seed and a person-always-wins override (G3); **"Security Clearance" is a capability admins toggle onto any role** (G4); **one `identity_access_grants` object** serves standing / requested / break-glass access (G5); reclassification triggers a **scrub of what we control + an honest-limitation notice** (G6).

> **Phase 18 generated-document amendment (2026-07-21).** Phase 10's
> strictest alias/withholding/publication policy applies before any generated
> document field, accessibility text, metadata, bookmark, filename, route,
> preview fixture, log, export, storage object, or role projection is produced.
> An already issued exact artifact is never silently rewritten. A current safety
> change may revoke future access or generation and require source-authorized
> correction/replacement through Phase 18 while retaining protected historical
> evidence under the applicable records contract.

---

## Problem Statement

The platform is about to grow surfaces that render and export people — custom fields (Phase 11), public missionary pages (Phase 22), newsletters (Phase 28/32), search (Phase 40), and broader exports — but it has **no way to say which people, fields, notes, or files are sensitive, and no structural guarantee that a sensitive worker's real identity cannot reach a public surface.** Concretely:

1. **There is no person-level sensitivity.** Phase 3 classifies _fields_ (`sensitivity_category`), but nothing says "this **worker** is in a restricted country — never publish their real name, photo, or location anywhere." Publication is a per-record, cross-field property that field policy cannot express.
2. **There is no dual identity.** A worker has one name today. There is no separation between a **legal name** (internal, classified) and a public **display name / alias** — the thing every creative-access agency uses. Without it, any public rendering leaks the real name.
3. **There is no publication firewall.** Even with a "don't show this" flag, a real name/photo/country can leak through secondary vectors nobody guards individually: fund names, campaign slugs, Stripe statement descriptors, receipt PDFs, OG images, sitemaps, URL slugs, search indexes, CSV exports, webhook payloads, **Support Hub replies**, future **AI/search summaries**, photo EXIF/geodata. SiteStacker's answer is a per-page "Authenticate" checkbox — which makes safety depend on an admin configuring every page correctly. That is the anti-pattern.
4. **There is no read-audit, identity-access model, or break-glass for the most sensitive data.** Phase 3 audits `care`/`security` field reads and _deferred_ break-glass to a later phase. For restricted-worker and crisis data, "who viewed this, when, from where, why," a governed way to grant one staffer access to one worker, and a controlled emergency-access path are safety requirements, not nice-to-haves.
5. **The platform's own pipes leak.** Observability (Sentry, logs), support tooling, and demo seeding can expose restricted fields to Asym staff or third-party processors — undermining the Art. 9(2)(d) "no disclosure outside the body" posture the whole legal footing rests on.

Build custom fields, public pages, or search on top of this and the leak is baked in — and in this domain a leak is a physical-safety event.

## Solution

An **Asym-owned sensitive-data safety foundation** that **extends** the Phase 3 classification/projection floor with the rails a missions CRM needs, landed **before** any worker-rendering surface. It is deliberately the **foundation**, not the member-care product (that is Phase 38). Its shape:

1. **A person-level security classification** (`security_level`, a small fixed enum) on the party — orthogonal to Phase 3's field `sensitivity_category` — defaulted from a **tenant-sovereign, versioned country-risk table** (with an opt-in importable persecution-index seed), and driving publication. Field need-to-know and person publication **compose: strictest-applicable wins** through the one resolver.
2. **Dual identity on the party**: a **legal name** (security-classified, in a separate table) vs a public **display name / alias**, with photo, biography, generalized region, and real country as classified attributes. Public surfaces read **only** the sanitized public projection. A worker at `restricted`/`high_risk` **must** have an alias — enforced at the data layer.
3. **The publication firewall as a sole-entry architectural invariant** — every public/external egress passes through the **one** public-projection function (extending the Phase-5 sole-entry choke-point), so a restricted worker's real name/photo/country is **structurally unreachable**, with each secondary-leak vector enumerated and enforced at that one door.
4. **Restricted-tier data in a separate table with its own RLS** (not masked columns), and **ABAC predicates** (security-level ceiling, team/assignment relationship, identity-access grant) folded into the **one** Phase-3 subtract-only resolver — one policy vocabulary, not two.
5. **Append-only sensitive-read audit** (extended from Phase 3's `care`/`security` field reads to the restricted tier) plus **one identity-access-grant object** serving three tempos — standing (a role capability), requested (any staff → clearance-holder approves), and **break-glass** (emergency, loud, reviewed).
6. **Consent & publishing preferences** per person (explicit consent to publish name/photo/story; hard do-not-publish flags), wired into the **in-flight** consent gate, plus **telemetry redaction** of the locked-room fields so the platform's own pipes do not become the leak.

Everything **reuses and extends** what already exists or is groomed ahead of it (Phase 3's `field_policies` + resolver + export governance + audit; the Phase-5 public projection + cache invalidation; the shipped member-care tables — `member_care_private_notes` et al.; the **in-flight** consent gate, PR #502) — it forks nothing. Steady state: a restricted worker is a first-class record staff can operate on, whose real identity is **incapable by construction** of reaching a public surface.

---

## User Stories

### Security-cleared staff — classification & identity

1. As a **security-cleared staff member**, I want to set a worker's security level (Standard → High-risk), so that every surface treats their data at the right sensitivity without me configuring each page.
2. As a **security-cleared staff member**, I want a worker's security level to _default_ from our tenant's own country-risk settings, so that a new restricted-country worker is protected the moment they are created — while our organization stays in full control of that policy.
3. As a **security-cleared staff member**, I want to maintain a worker's **legal name** separately from their **public alias**, with photo/biography/region/country classified, so that the public sees only what is safe to show.
4. As an **admin**, I want to grant "Security Clearance" to any role we choose (member care, mobilization, regional leads), so that the right people — however many we decide — can see protected identities, and I can see at a glance how many people hold it.
5. As an **admin**, I want the classification vocabulary to be small and fixed (with configurable country mappings), so that our policies stay testable and staff are not overwhelmed.

### The platform — the publication firewall

6. As the **platform**, I want a restricted worker's real name, photo, and country to be **structurally unreachable** from public-site queries, CMS content, donor-portal APIs, OG images, sitemaps, URL slugs, and receipt/email templates, because every public egress passes through one firewalled projection.
7. As the **platform**, I want every secondary-leak vector — fund names, campaign slugs, Stripe descriptors, receipt PDFs, search indexes, CSV exports, webhook payloads, Support Hub replies, future AI summaries, photo EXIF/geodata — to enforce the firewall at that single door, so that the leak cannot escape through a side channel.
8. As the **platform**, I want field need-to-know (Phase 3) and person publication (this phase) to compose with **strictest-wins**, so that a public field on a restricted worker is still withheld.

### Staff operator — need-to-know & access

9. As a **staff operator**, I want to see and work with a restricted worker's operational data I am entitled to, so that mobilization and finance are not blocked — while data above my clearance is simply absent.
10. As a **staff operator without clearance**, I want to **request** access to one specific worker's protected identity, for a fixed period or indefinitely, so that a legitimate one-off need doesn't force me into a broad role or an emergency door.
11. As a **crisis responder**, I want a **break-glass** path — emergency access with a mandatory reason that fires a real-time alert and lands in a review queue — so that when the cleared people are unreachable I can still act, and the access is reviewed afterward.

### Auditor / compliance — audit, consent

12. As an **auditor**, I want every read/export/print of a restricted-tier record logged (who, when, from where, why), and every access grant listed with its age and reason, so that access to the most sensitive data is provable.
13. As a **compliance owner**, I want per-person publishing consent and hard do-not-publish flags honored everywhere, so that we never disclose a person's identity outside the organization without consent (GDPR Art. 9(2)(d)).
14. As a **compliance owner**, I want the locked-room fields redacted from platform telemetry (error tracking, logs, support tooling, demo seeds), so that our own pipes do not become the leak and third-party processors never receive restricted data.

### Missionary / worker — self-protection

15. As a **restricted-country worker**, I want to control whether my name, photo, and story are ever published, so that my safety and my local community's safety are not decided for me.
16. As a **worker**, I want photos I or my org upload to have location metadata scrubbed before they can be published, so that an image cannot betray my location.

### Founder / organization

17. As a **founder**, I want the safety rails in place before custom fields, public pages, newsletters, or search ship, so that we never have to retroactively triage unclassified sensitive data.
18. As the **organization**, I want our existing CCI-style security policy (security levels, publication rules, need-to-know) to be **enforced by the product**, not merely stored — and to own that policy ourselves.

---

## Implementation Decisions

### A. Architecture rulings

- **A1 — Extend Phase 3; one classification vocabulary, two orthogonal axes.** _(G1.)_ Phase 10 does **not** fork a parallel classification model. Field need-to-know stays Phase 3's `field_policies.sensitivity_category` (the fixed six: `public, contact, internal, financial, care, security` — `security` is the restricted-data field hook, `care` the member-care hook). Phase 10 adds one **orthogonal** axis — a person-level **`security_level`** governing **publication** — and wires it through the **same** subtract-only resolver. Both compose: **strictest-applicable wins.** **Debt guardrails:** each check stays a small, separately-tested pure function and the resolver only _composes_ (no god-function); the `security_level` **ordering has one source of truth** (a rank used by the strictest-wins comparison), not scattered app code; strictest-wins is a lattice meet, so future axes add terms to a `min()` without coupling. _(ADR 1.)_
- **A2 — `security_level` is a small fixed enum, defaulted from tenant-sovereign country risk.** _(G2/G3.)_ `security_level ∈ {standard, sensitive, restricted, high_risk}` (TEXT+CHECK, **fixed** — tenants configure country→level _mappings_ and defaults, never invent tiers, so RLS/egress/compliance stay testable; TEXT+CHECK keeps a future 5th level a cheap `CHECK` migration). It defaults from a **tenant-owned, versioned `country_risk` table**; the platform ships an **opt-in importable seed** derived from an external persecution index (e.g. Open Doors World Watch List tiers) that a tenant can one-click load — **not** a subscription/sync engine (annual refresh = the platform republishes the seed, the tenant re-imports, the ratchet applies). **Ratchet rule:** an import may _raise_ suggested defaults but **never auto-lowers** any existing worker's level — a lowered country tier produces a review item. **Per-person always overrides** the country default: an openly-listed worker in a closed country is first-class (recorded reason). A **`security_level_source` marker** (`manual | country_default`) distinguishes "someone decided" from "nobody looked," powering the **"workers with an unreviewed security level"** data-health signal (Phase 8 catalog) that keeps the small-tenant gap _visible, never silent_. `standard` is the default for the vast majority of records. _(ADR 2.)_
- **A3 — Dual identity on the party; alias enforced at the data layer.** _(G2.)_ The person party carries a public **display name / alias**; **legal name + real country + precise location + real photo** move to a **separate restricted table** (§D). A party at `security_level ∈ {restricted, high_risk}` **must** have a `display_name` distinct from the legal name — enforced by a **constraint/trigger at the data layer**, and an API/import that sets a restricted level without an alias is **rejected** (fail-closed). The firewall **never** falls back to the legal name. Reclassification to a restricted level requires the alias first. _(ADR 3.)_
- **A4 — The publication firewall is a sole-entry architectural invariant.** _(G-firewall + ADV-B2.)_ Enforcement is **sole-entry**, mirroring Phase 5: every public/external egress goes through the **one** public-projection function (`toPublicProjection(party)`), which returns only public-tier fields for the party's `security_level` and structurally omits restricted attributes. A **CI lint guards the sole entry** (no public/external egress may bypass it) — _not_ a per-file "did you import the predicate" check a new route could evade. **Every secondary-leak vector routes through that one door:** fund/campaign names and slugs (never derived from a restricted worker's real name — enforced at fund creation, Phase 13), Stripe descriptors and receipt PDFs (alias/fund-code — exact string decided **with Phase 13/18**), search indexing (restricted tier excluded), CSV/export (Phase-3 export governance extended), webhook/API payloads (Phase-31 projection), **Support Hub replies**, **future AI/search summaries**, and **photo EXIF/geodata scrubbed on upload** for worker-linked media. SiteStacker's page-level "Authenticate" checkbox is the rejected anti-pattern. _(ADR 4.)_
- **A5 — Restricted-tier data in a separate table with its own RLS; never masked columns.** _(G2.)_ The restricted identity attributes live in **`party_restricted`** (separate table, own RLS, non-exposed schema / Data-API-revoked) — not masked columns on shared tables (view `security_invoker` and column-grant footguns make masking fragile in exactly the highest-stakes data). **Standing rule:** a new restricted table is added **only when publication of that data endangers a person**; everything else is field policy. `member_care_private_notes` keeps its own room (classified `care`); Phase 29 restricted files reuse the _pattern_, not this table. _(ADR 5.)_
- **A6 — RBAC + ABAC through the one resolver.** _(G1/G4.)_ Coarse roles gate surface/module access; **attribute predicates** — `security_level` ceiling, team/assignment relationship, an active identity-access grant — are added to the **Phase-3 subtract-only resolver** as a composing `security_scope` predicate (`effective = field_policies ∩ row_scope ∩ record_flags ∩ record_state ∩ security_scope`). One policy vocabulary; the resolver still only ever _subtracts_. **Cross-ref:** Phase-3's resolver (#493) must be built **predicate-extensible** so `security_scope` is additive, not a fork. _(NIST SP 800-162 ABAC.)_ _(ADR 6.)_
- **A7 — "Security Clearance" is a capability; access is one grant object across three tempos.** _(G4/G5.)_ **Security Clearance** is a capability (`security_clearance`) admins **toggle onto any role** (member care, mobilization, regional leads); the admin role ships with it **on but removable**; it is **separate** from care-data access (a role may hold both, but granting one never grants the other; **Phase 10 defines and ships only the `security_clearance` capability** — the care-data-access capability itself is owned by member care / Phase 38; Phase 10 only guarantees the two stay separate flags); every flip is audited and a **breadth stat** ("N people hold Security Clearance") is always visible. Access to the locked room comes through **one `identity_access_grants` object** in three tempos: **(1) standing** = the role capability; **(2) requested** = any staff member requests access to one worker → any clearance-holder approves/denies → **fixed period or indefinite**; **(3) break-glass** = instant emergency access, mandatory free-text reason, 24h self-expiry, loud alert (Sentry + the Phase-6 seam), mandatory post-review. A grant's power is **checked live at read** (a JOIN over active tenant membership + active grant), so a departed staffer's grant is inert immediately (belt-and-suspenders revoke-on-departure). Grants are the **identity room only** (never care notes). Phase 12 owns the full grant-management product (bulk/regional grants, policies, delegation, audit reports) — the grant table's subject/scope are **named so Phase 12 extends them additively**. _(ADR 7.)_
- **A8 — Consent, publishing preferences, and telemetry redaction.** _(G6-consent.)_ Per-person **consent & publishing preferences** (explicit consent to publish name/photo/story — Art. 9 explicit-consent quality; **hard do-not-publish** flags) wired into the **in-flight** consent gate (`packages/api/src/email/consent.ts` — PR #502, **not yet merged**; extend when it lands, never fork). The **Art. 9(2)(d)** "no disclosure outside the body without consent" invariant is product behavior; the platform's **own pipes count as "outside the body"** — the **locked-room fields** (a fixed allow-list: legal name, real country, precise location, real-photo refs) are **redacted from telemetry** (Sentry, logs, support tooling, demo seeds). This is a fixed allow-list at those boundaries, **not** a general PII-scrubbing engine. _(ADR 8.)_
- **A9 — Phase 10 builds the rails; Phase 38 builds the care product.** _(G-boundary.)_ In scope: the classification axes, `security_level` + tenant country-risk, dual identity + the sole-entry firewall, consent/publishing prefs, egress enforcement, read-audit + the identity-access/break-glass model, the separate-restricted-table pattern, telemetry redaction, the Settings→Security surface. **Reserved to Phase 38:** the member-care case product (sealed care-note UI, provider-type + limits-of-confidentiality, duty-to-warn, crisis-ops UI + emergency-contact trees, **the exposure report**, DSAR/erasure tooling, compliance-evidence surfaces). The member-care tables (`member_care_private_notes` + `member_care_activities`/`goals`/`requirements`) already ship — Phase 10 **classifies** them; Phase 38 builds the care product on them. _(ADR 9.)_
- **A10 — Reclassification triggers a scrub of what we control + an honest-limitation notice.** _(G6.)_ Raising a worker's `security_level` fires a **retro-scrub trigger** that **reuses Phase-5's cache invalidation** for that party's public surfaces (the firewall is the forward backstop, so the next render is alias-clean regardless) and emits a **"purge-required" event**; the per-surface purge _executors_ (public pages, search index, sitemap) are built by the phases that own those surfaces (22/40) — Phase 10 does **not** build purge for surfaces that do not exist yet. The scrub completion carries a static **honest-limitation notice**: _"Forward exposure removed. Previously sent emails, issued receipts, and past exports are **not** retracted by this action."_ The queryable **exposure report** is **Phase 38** (its sources — communication events, receipt facts, export audit — are append-only, so zero rework to defer). Issued **receipts are immutable** (never rewritten; future renders use the alias/fund-code). **Downgrades (restricted → open) are human-only** — explicit consent + a clearance-holder action — and cancel any pending grants for that worker. _(ADR 10.)_

### B. Deep modules

- **`classification`** — the `security_level` enum + its **single ordering/rank**; the tenant `country_risk` table + the opt-in importable seed + the ratchet; `resolveSecurityLevel(party)` (person-manual > tenant country-override > imported default, in one ordered function) and `effectiveSensitivity(field, party)` (strictest-wins composition of Phase-3 `sensitivity_category` and `security_level`). Pure, data-first.
- **`identity/dual` (extend the party service)** — alias vs legal-name accessors; the clearance/grant-gated legal-name read; the classified-attribute readers; the **data-layer alias-required enforcement** (A3).
- **`publicationFirewall`** — `toPublicProjection(party)` (the sole public door) + the enumerated egress guards, each calling it; the **sole-entry CI lint**; the media EXIF scrub. Extends `cms/public` + `public-giving/projection.ts`.
- **`resolver` (extend Phase 3)** — add the `security_scope` predicate (level ceiling + team/assignment + active grant) to the subtract-only resolver. No new resolver; one chokepoint.
- **`sensitiveAudit` (extend Phase 3 audit)** — the append-only restricted-read log + the audit-of-audit classification; `recordSensitiveRead(actor, record, action, reason?)`.
- **`identityAccess`** — the one `identity_access_grants` object: `requestAccess(actor, worker, duration?)`, `decideRequest(grantId, approver, allow)`, `requestBreakGlass(actor, worker, justification)` (instant, time-boxed, alerts + review item); `reviewGrant(grantId, reviewer)` (closes a break-glass review — writes `reviewed_at`/`reviewed_by`); the **checked-at-read** effectiveness join; expiry that transitions `state`→`expired` at `expires_at` (24h for break-glass); membership-bound revoke; the **`security_clearance` role-capability toggle** (audited on every flip) + the **breadth-stat** count (standing access = holding the capability).
- **`consent/publishing` (extend the consent gate)** — publishing-consent + do-not-publish flags consumed by the firewall and the send seam.
- **`telemetryRedaction`** — the fixed locked-room-field redactor applied at the Sentry/log/support/demo-seed boundaries.

### C. Predecessor plug-ins (extend, never fork)

- **Phase 3 (hard).** `field_policies` + the subtract-only resolver + export governance + the audit spine are **extended**: `security` is the restricted field hook; the resolver gains the `security_scope` predicate (**resolver #493 built predicate-extensible**); **export governance gains the firewall predicate and covers `party_restricted` — clearance-gated + sensitive-export audit** (a bulk legal-identity export is audited); the audit gains the restricted tier. Phase 3 **explicitly reserved** break-glass and blanket read-auditing for this phase.
- **Phase 9 (hard).** Classification + dual-identity columns attach to the party graph + record shell; the record header's privacy indicator (Phase 9 D4) lights up with the real `security_level`; the member-care exclusion rule is subsumed by this classification. `display_name` is **reused** from Phase 9 (not added); Phase 10 requires the Phase-9 subtype write-through to write the **alias** (never the legal name) into `display_name` for restricted-tier workers. **The Phase-9 "no new inline contact columns on `parties`" migration lint is extended (AM7):** any new party column requires a classification ruling in the migration manifest — `security_level` and `display_name` are the allowed classified additions here.
- **Phase 5 (extend).** The public-projection choke-point + defense-in-depth isolation are the firewall's foundation; Phase-5's **cache invalidation** deliverable is reused by the retro-scrub.
- **Phase 4 (soft).** Merge must never widen exposure: a merge takes the **strictest** `security_level` of the pair; the winner keeps the surviving `party_restricted` row; the **loser's identity-access grants are revoked** (access re-granted against the survivor); dedupe/merge of restricted-tier parties is **clearance-gated** (name-matching needs the legal name). `party_restricted` joins the Phase-4 A9 re-point list.
- **Phase 6 (soft).** The `sendEmail` seam is the break-glass alert channel and the do-not-publish enforcement point for outbound. Pre-Phase-6, break-glass alerts via Sentry + the in-app review queue (which is the durable capture) — acceptable for the foundation.
- **Phase 2 (inherited).** Tenant-scope only. **Phase 0 (inherited).** Built/Live/Confirmed evidence.
- **Forward requirements this phase seeds:** Phase 22 publishing must consume the firewall **and** add a publish-time **"unreviewed security level"** gate (belt-and-suspenders for G3-B's residual small-tenant risk; publishing is already explicit + consented = fail-safe). Phase 7 receipt **facts** must embed no worker identity (verified at amendment time); the fund-name rule lands at Phase 13. Phase 40 inherits the restricted-tier search/AI exclusion.

### D. Data model (all tenant-scoped, composite `(tenant_id, id)` keys, FORCE RLS)

**Net-new / extended:**

- **`parties` / person subtype — extend:** `security_level` (TEXT+CHECK `standard|sensitive|restricted|high_risk`, `NOT NULL DEFAULT 'standard'`), `security_level_source` (TEXT+CHECK `manual|country_default`), `display_name` (the public alias — **reused** from Phase 9's write-through `display_name`, not a new column), a `security_country` reference used for the default. **CHECK/trigger:** `security_level ∈ {restricted, high_risk}` ⇒ `display_name` present and distinct from the legal name (A3). Legal name + real country + precise location move to `party_restricted`.
- **`party_restricted` (separate table, own RLS, non-exposed schema)** — `party_id`, `legal_name`, `real_country`, `precise_location`, `real_photo_ref` (points into a **non-public storage bucket**, signed URLs only), publication notes. RLS: only the `security_clearance` capability / an active grant + the resolver's `security_scope`.
- **`country_risk`** — **tenant-owned**, versioned: `country_code`, `default_security_level`, `source_ref` (free-form — e.g. "WWL 2026 tier N"; **source-agnostic** for future indices), `version`, `effective_at`, `tenant_id` (NULL = the opt-in platform seed a tenant imports; tenant rows override).
- **`party_publishing_consent`** — per-person: `party_id`, `publish_name`/`publish_photo`/`publish_story` (bool + consent evidence), `do_not_publish` (hard flag), consent timestamps. Consumed by the firewall + the send seam.
- **`sensitive_read_audit`** (extend Phase 3 audit posture) — append-only: `tenant_id`, `id`, `actor_profile_id`, `record_ref`, `action` (`view|export|print`), `reason`, `origin`, `at`. Itself classified (its own RLS tier).
- **`identity_access_grants`** — the one grant object (replaces the earlier `break_glass_grants`): `tenant_id`, `id`, `actor_profile_id`, **`subject_type`** (`party` now; named so Phase 12 adds `role`/`region` additively), **`scope_ref`** (the worker), `grant_type` (`requested|break_glass`), `reason`, `granted_by_profile_id` (approver, or self for break-glass), `granted_at`, `expires_at` (**NULL = indefinite**), `reviewed_at`, `reviewed_by`, `state` (`requested|granted|denied|expired|revoked`). Effectiveness is a **read-time JOIN** with active membership; state transitions are **concurrency-guarded** (decide only when `state='requested'`).
- **`field_policies` census rows** — the new restricted-tier fields + the new tables' fields registered with `sensitivity_category='security'` (or `care`) so the resolver, export governance, and telemetry redaction cover them by construction.

**Reuse:** the Phase-3 `field_policies` + resolver + export governance + audit; the shipped member-care tables (`member_care_private_notes` et al.; classified, not rebuilt); the Phase-5 public projection + cache invalidation; the in-flight consent gate. **Supabase RLS rules** (from Phase 3/8): `(select …)` initPlan wrap, `TO authenticated`, one policy per op with `WITH CHECK`, index non-leading policy cols, `security definer set search_path=''` authz in a private schema, named CHECKs, `NOT VALID`→`VALIDATE`, run the security advisors; **`party_restricted` in a non-exposed schema and/or Data-API-revoked.**

### E. Contracts / wiring

- **Mission Control → Settings → Security** (the phase's admin surface; **scoped to clearance + country-risk + grants** — general role-capability config stays Phase 12, which later absorbs/deepens this page): role **Security Clearance** toggles with member counts + a confirm dialog ("People with this role will be able to view protected identities of restricted workers. This action is recorded."); the **breadth stat**; the tenant `country_risk` table + the **one-click "enable World Watch List-derived defaults"** import; the **request queue** + the **standing-grants list** (each grant's age + reason, one-click revoke by any clearance-holder); links to the read-audit and break-glass review queues.
- **The firewall predicate is one function** called at the single public/external egress door; the **sole-entry CI lint** asserts nothing bypasses it (mirrors the Phase-5 sole-entry and Phase-6 sole-seam lints).
- **Break-glass** fires through the Phase-6 seam (`crm_alert`-style, `staff_only`, no person link in the alert body) + Sentry; the grant is time-boxed, checked-at-read, and lands in the review queue.
- **Reclassification** fires the Phase-5 cache invalidation + a "purge-required" event via the shipped Inngest runtime; per-surface purge executors are the owning phases' (22/40).

### F. Architecture Decision Records

1. Extend Phase 3; two orthogonal axes (field sensitivity + person `security_level`), strictest-wins as a lattice meet, one resolver, one ordering source of truth.
2. `security_level` fixed enum defaulted from a **tenant-sovereign** versioned country-risk table + an opt-in importable seed (not a subscription engine); the ratchet; person-always-wins; the `security_level_source` marker + unreviewed-worker signal.
3. Dual identity (legal name in a separate table vs public alias); **alias enforced at the data layer** for restricted tiers; classified attributes.
4. The publication firewall as a **sole-entry** architectural invariant + the enumerated egress guards + the sole-entry lint.
5. Restricted data in a separate table with its own RLS; never masked columns; the "only when publication endangers" standing rule.
6. RBAC + ABAC through the single subtract-only resolver (`security_scope`); Phase-3 resolver built predicate-extensible.
7. **Security Clearance** as a role-toggled capability; **one `identity_access_grants` object** across standing/requested/break-glass; checked-at-read + membership-bound; Phase-12-extensible subject/scope.
8. Consent/publishing preferences + Art. 9(2)(d) as product behavior + telemetry redaction (a fixed locked-room allow-list; the platform's own pipes are "outside the body").
9. Phase 10 rails vs Phase 38 care product (incl. the exposure report) — the boundary.
10. Reclassification triggers a scrub of controlled surfaces (reusing Phase-5 invalidation) + an honest-limitation notice; per-surface purge deferred; a **downgrade (restricted→open) requires explicit consent + a clearance-holder action** — never silent or automatic (raising protection is the safe, ratchet-driven direction).

---

## Testing Decisions

A failure fails the build — leaks here are physical-safety events, and RLS/firewall refusals are silent by design (assert with `is_empty()`-style + refusal expectations).

- **Publication firewall (the headline negative tier):** for a `restricted`/`high_risk` worker, the real name/photo/country is **absent** from every public/external egress — the public reader, CMS serializer, giving projection, receipt render, OG image, sitemap, search index, CSV export, webhook payload, and Support-Hub reply each get only the public projection; a fixture that adds a restricted field to any egress **fails**; a **new egress route that bypasses the sole-entry door fails the CI lint**. A slug/fund/descriptor derived from a real name for a restricted worker is rejected.
- **Data-layer alias enforcement:** setting `security_level` to `restricted`/`high_risk` without a distinct `display_name` — via service **or import** — is rejected (fail-closed); the firewall never falls back to the legal name.
- **Strictest-wins composition:** a `public` field on a `restricted` worker is still withheld from public surfaces; the ordering rank has one source of truth.
- **Restricted-table isolation:** `party_restricted` rows are invisible without `security_scope`; a service-role path with tenant-A context cannot read tenant-B restricted rows; cross-tenant + clearance isolation extends the Phase-4 tier.
- **Identity access + break-glass:** a request → approve grants time-boxed (or indefinite) access; a **departed staffer's grant is inert at read**; break-glass grants instant access, fires the alert, and enqueues a review item; concurrent decisions are state-guarded; the audit table is itself access-restricted; export of `party_restricted` is clearance-gated + audited.
- **Ratchet:** re-importing a `country_risk` seed that lowers a country tier does not auto-lower any existing worker's `security_level` — it emits a review item; an import that raises a suggested default is applied, and the person-level setting always overrides the country default.
- **Consent + telemetry:** a `do_not_publish` person is never published on any surface; a locked-room field never appears in a captured Sentry event/log/support payload/demo seed (a fixture that leaks one fails).
- **Reclassification:** raising to `restricted` fires the Phase-5 invalidation + purge-required event; the firewall re-evaluates; the honest-limitation notice is present; a restricted worker **cannot be silently downgraded** (restricted→open requires explicit consent + a clearance-holder action); downgrade cancels pending grants.
- **Structural:** the sole-entry CI lint; the extended party-column migration lint; the Supabase security advisors; a `security_level` CHECK negative test.

---

## Out of Scope (reserved seams — documented, not built)

- **The member-care case product** — sealed care-note UI, provider-type + limits-of-confidentiality, duty-to-warn/mandatory-report workflows, crisis-ops UI + emergency-contact trees, **the queryable exposure report**, DSAR/erasure tooling, compliance-evidence surfaces → **Phase 38** (builds on this foundation + the shipped member-care tables; the exposure report's sources are append-only, so zero rework to defer).
- **The full grant-management / permission-configuration product** — bulk/regional grants, grant policies, delegation, audit reports, the general role-capability grid → **Phase 12**; Phase 10 ships the `security_clearance` capability toggle + the simple per-worker request/approve/break-glass flow on a Phase-12-extensible grant table.
- **The public missionary page rendering** — **Phase 22** consumes the firewall + public projection + adds the publish-time unreviewed-level gate; it does not build them.
- **Custom-field classification UI** — **Phase 11** must obey this model from field creation; Phase 10 provides the classification the custom-field catalog inherits.
- **Per-surface purge executors** (public pages, search index, sitemap) — built by **Phases 22/40** consuming Phase 10's purge-required trigger; Phase 10 reuses only Phase-5 cache invalidation.
- **The exact restricted-worker descriptor/receipt string** — decided **with Phase 13/18** (alias vs fund-code); Phase 10 reserves the seam + enforces "not the real name," with the fund-name rule at Phase 13.
- **Trigger-word content detection / AI moderation** — no phase owns it; **not even a reserved hook** (dropped as speculative). The review-verdict contract (`allowed|needs_review|blocked`) is kept for Phases 22/28.
- **AI/search over restricted data** — restricted tier is **excluded** from indexing and any future AI context (**Phase 40** inherits the rule); Phase 10 does not build search or AI.
- **A general PII-scrubbing engine** — telemetry redaction is a fixed locked-room-field allow-list, not a platform-wide PII scanner.

---

## Further Notes

### Dependency Ledger

- **Hard:** **Phase 3** (#489 — the classification/resolver/export/audit floor this phase extends; its resolver #493 built predicate-extensible; it explicitly reserved break-glass + blanket read-audit for here) and **Phase 9** (#604 — the party graph + record shell classification attaches to; its column lint extended).
- **Soft:** **Phase 4** (merge must not widen exposure; loser grants revoked; restricted dedupe clearance-gated), **Phase 5** (the public choke-point the firewall extends + the cache invalidation the scrub reuses — a groomed Phase-5 deliverable that builds ahead of this phase), **Phase 6** (the break-glass alert seam + do-not-publish outbound; pre-Phase-6 the in-app review queue is the durable capture).
- **Gates (must not build before Phase 10):** **Phase 11** (custom fields would otherwise mint unclassifiable leak paths), **Phase 22** (public pages would render identity with no firewall). Phase 28/32 (newsletters), Phase 40 (search/AI), and broader exports also inherit the firewall.
- **Graph:** `3 → 9 → 10`; Phase 10 gates 11/22. No cycle.

### Best-practice grounding (verified this grill + adversarial pass)

Creative-access/missions-security practice (pseudonyms, no public photos/location, generalized geography, assume-intercepted comms — CCI-style security levels; MissionaryConnect "Restricted Access Nation"; Denari HQ-managed security levels); the four-tier data-classification model realized as the six field categories + the person level; GDPR Art. 9 + Art. 9(2)(d) nonprofit-religious-body exception and the ICO appropriate-policy-document frame; **NIST SP 800-162 ABAC** for need-to-know without role explosion; **just-in-time / time-boxed access** (request → approve → expire → audit → revoke) as the modern pattern over broad standing access; **HIPAA-style break-glass** (instant + justified + audited + post-reviewed beats pre-approval, which fails the very emergency it exists for); Supabase RLS **separate-tables-over-masked-columns**; sole-entry enforcement + CI lint (the Phase-5/6 precedents) over per-call import checks; a security **lattice** (strictest-wins meet) that scales to N axes without coupling. Better-than-SiteStacker: SiteStacker offers only group-CRUD + "Security Tags" and page-level Authenticate checkboxes — the person-level security level + sole-entry publication firewall + identity-access/break-glass + read-audit are a headline differentiator.

### Fresh-build posture

No production users → build the rails correct-from-start (`NOT NULL security_level DEFAULT 'standard'`, `party_restricted` + the alias constraint from the first migration). Seeds deliberately include restricted-tier workers, a `country_risk` table, a role with Security Clearance, a pending access request + an active grant + a break-glass grant, and a do-not-publish person — so the firewall, grants, break-glass, read-audit, and telemetry redaction are demonstrable from day one. No migration ceremony.

---

## Evidence & Acceptance

**Acceptance criteria (Phase 10 is "done" when):**

- [ ] `security_level` exists on the person party (fixed enum, `NOT NULL DEFAULT 'standard'`, `security_level_source` marker), defaults from a tenant-owned versioned `country_risk` table (opt-in importable seed + ratchet + person-override), and composes strictest-wins with Phase-3 field `sensitivity_category` through the one resolver with a single ordering source of truth.
- [ ] Dual identity ships: legal name (in `party_restricted`) vs public alias; a **data-layer constraint** forces a distinct alias at `restricted`/`high_risk` and rejects violating imports; classified photo/biography/region/country.
- [ ] The publication firewall is a **single sole-entry function** enforced at every public/external egress (public reader, CMS, giving projection, receipt render, OG, sitemap, search, CSV, webhook, Support Hub, media EXIF), proven by the negative tier; a CI lint forbids any egress that bypasses the sole entry.
- [ ] Restricted-tier data lives in `party_restricted` with its own RLS; the ABAC `security_scope` predicate is folded into the Phase-3 subtract-only resolver; cross-tenant + clearance isolation passes; export governance covers `party_restricted` (clearance-gated + audited).
- [ ] Security Clearance is a role-toggled capability (admin default-on-removable; separate from care; breadth stat visible); the one `identity_access_grants` object serves standing/requested/break-glass; grants are checked-at-read + membership-bound; break-glass fires the alert + review-queue entry.
- [ ] Sensitive reads are audited append-only (audit itself classified); publishing consent + do-not-publish are honored on every surface; the locked-room fields are redacted from telemetry.
- [ ] Reclassification fires the Phase-5 cache invalidation + purge-required event + the honest-limitation notice; a **downgrade (restricted→open) is not silently possible** (requires explicit consent + a clearance-holder action); downgrade cancels pending grants.
- [ ] The permanent negative/safety tier is green (firewall + sole-entry lint, alias-at-data-layer, strictest-wins, isolation, grants/break-glass, consent/telemetry, reclassification); the Supabase advisors pass.

**Evidence file** (Phase-2..9 style, Built/Live/Confirmed): migrations applied; the full test suite incl. the safety tier passing; the firewall sole-entry lint; the advisor output; the seeded restricted-worker/grant/break-glass/do-not-publish demonstrations; and the explicit list of what Phase 10 did **not** build (the Phase-38 care product + exposure report, the Phase-12 grant product, the Phase-22 pages + per-surface purge executors, the dropped trigger-word detection).

---

## Tracking Issues (epic #628 + children #629–#641)

Foundation tickets first (`status:todo`); the rest `status:blocked`. Hard-blocked on Phase 3 (#489) + Phase 9 (#604). No `ready-for-agent` until dispatch. **Re-scoped 2026-07-07 at the founder grill (G1–G7 + adversarial pass).**

- **Epic #628 — Phase 10: Sensitive-Data Classification & Restricted-Ministry Safety Foundation**
- **T1 · #629** — Docs: this PRD, the 10 ADRs, CONTEXT.md glossary (security level, Security Clearance, publication firewall, dual identity, identity-access grant, break-glass, retro-scrub, country risk), OpenSpec delta. _(foundation, `status:todo`)_
- **T2 · #630** — Classification model: `security_level` + `security_level_source` on the party + the single ordering rank + the **tenant-owned versioned `country_risk`** table + the **opt-in importable WWL seed + ratchet** + `resolveSecurityLevel`/`effectiveSensitivity` (strictest-wins); `field_policies` census rows; the "unreviewed security level" data-health signal. _(foundation, `status:todo`)_
- **T3 · #631** — Dual identity: `party_restricted` separate table + legal-name/alias + the **data-layer alias-required constraint (+ import rejection)** + classified attributes + non-public photo bucket. _(EXIF scrub is owned by the firewall module → #633.)_
- **T4 · #632** — The `security_scope` ABAC predicate folded into the Phase-3 subtract-only resolver (predicate-extensible; single ordering source).
- **T5 · #633** — The **sole-entry** publication firewall function + the enumerated egress guards (public/CMS/giving/receipt/OG/sitemap/search/CSV/webhook/Support-Hub) + media EXIF + the sole-entry CI lint + the review-verdict contract.
- **T6 · #634** — Sensitive-read audit (append-only, audit-of-audit classified) extending the Phase-3 audit; export governance covers `party_restricted`.
- **T7 · #635** — **Identity access grants:** the one `identity_access_grants` object — request/approve (fixed or indefinite) + break-glass (alert + review queue) + checked-at-read + membership-bound + Phase-12-extensible subject/scope.
- **T8 · #636** — Consent/publishing preferences wired into the **in-flight** consent gate (PR #502) + do-not-publish enforcement.
- **T9 · #637** — Telemetry redaction of the locked-room fields (Sentry/logs/support/demo seeds) — fixed allow-list.
- **T10 · #638** — Reclassification: the retro-scrub trigger reusing Phase-5 cache invalidation + the purge-required event + the honest-limitation notice (per-surface purge deferred to 22/40).
- **T11 · #639** — Permanent negative/safety test tier + structural CI gates (sole-entry lint, alias-at-data-layer, extended column lint) + the Supabase advisors.
- **T12 · #640** — Phase 10 evidence file (Built/Live/Confirmed; seeded demonstrations; the "did not build" list).
- **T13 · #641** — **Mission Control → Settings → Security page:** role Security-Clearance toggles + member counts + confirm dialog + breadth stat; the `country_risk` manager + WWL one-click import; the request queue + standing-grants list; audit/break-glass review links. _(scoped to clearance+country+grants; Phase 12 absorbs/deepens)_

## Dated Phase 17 communication-safety amendment (2026-07-19)

**Old statement.** Phase 10 makes restricted identity structurally unreachable
from public/email/receipt projections and truthfully warns that an already-sent
email cannot be retracted.

**New winner.** Every Phase 17 preview, review, test, publication, prepared
message, in-product item, communication-history view, support projection,
Recent sent copy, portability package, repair case, cache, and metric consumes
the same Phase 3/10 strictest-wins projection. Restricted/high-risk messages
retain no readable Recent sent copy. If a person is later raised to a
restricted/high-risk tier, reads fail closed immediately and any still-readable
copy or derived cache receives priority, observable purge without revealing the
old projection.

That observability is restricted to a security-cleared, body-free purge ledger.
Tenant dashboards, ordinary support views, application logs, traces, analytics,
and metrics MUST remain aggregate and non-enumerating: they reveal no message or
cache existence, recipient, storage key, content, purge identifier, or prior
classification. An already-authorized ordinary surface may show only the generic
unavailable state required by the current projection, never evidence that a
specific restricted copy existed.

**Compatibility boundary.** Durable body-free Phase 6 evidence may remain under
its lawful retention class; issued Phase 18 exact artifacts remain immutable
while Phase 7 source facts and issuance/correction evidence retain their own
authority; and external email already delivered cannot be recalled.
Phase 17 must state those limitations honestly. It never routes legal identity,
real location/photo, care/security fields, protected destinations, or action
credentials through a tenant-editable node, fallback, test fixture, export,
search index, log, trace, or provider tag.
