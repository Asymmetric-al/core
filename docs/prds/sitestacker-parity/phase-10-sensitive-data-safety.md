# Phase 10 — Sensitive-Data Classification & Restricted-Ministry Safety Foundation

> **Program:** SiteStacker Parity · **Phase:** 10 · **Status:** Groomed (grill-with-docs, 2026-07-07) · **Base:** `develop`
> **Subtitle:** _The safety rails — classification, dual identity, the publication firewall, read-audit + break-glass — before custom fields and public pages can create unclassifiable data._
> **Roadmap:** [`roadmap.md`](./roadmap.md) slot 10 (Roadmap v2). **Gates:** Phase 11 (Custom Fields) and Phase 22 (Public Missionary Pages) must not build before this lands.
> **Hard prerequisites:** **Phase 3** (`field_policies` + the subtract-only projection resolver + export governance + audit spine — this phase _extends_ it) and **Phase 9** (the party graph + record shell the classification attaches to). **Soft:** Phase 4 (identity), Phase 6 (the alert seam for break-glass).
> **Charter / roadmap / matrix:** `README.md`, `roadmap.md`, `phase-map.md`, `parity-matrix.md`. Decision log: scratchpad `phase10-safety-grill.md` (D1–D9).

> **Why this phase is different — read before scoping down.** A missions CRM is not a generic nonprofit CRM in one brutal way: **the database itself is a targeting list.** Roughly 60 countries are creative-access/restricted; a leaked real name, photo, or location for a worker there is a **physical-safety event** — surveillance, expulsion, imprisonment, or violence against the worker and local believers — not a privacy incident. And because this is a _missions_ CRM, essentially every person record reveals religious belief by mere presence (GDPR Art. 9 special-category data), with member care adding health/counseling/crisis data. Classification is **retrofit-impossible**: once notes, files, photos, and published pages accumulate unclassified, nobody hand-triages thousands of them, and the fresh-build/no-users window closes at first tenant onboarding. This phase builds the rails **before** any surface can render worker identity. "Ship now, harden later" is an unacceptable sequencing for any worker-rendering surface.

---

## Problem Statement

The platform is about to grow surfaces that render and export people — custom fields (Phase 11), public missionary pages (Phase 22), newsletters (Phase 28/32), search (Phase 40), and broader exports — but it has **no way to say which people, fields, notes, or files are sensitive, and no structural guarantee that a sensitive worker's real identity cannot reach a public surface.** Concretely:

1. **There is no person-level sensitivity.** Phase 3 classifies _fields_ (`sensitivity_category`), but nothing says "this **worker** is in a restricted country — never publish their real name, photo, or location anywhere." Publication is a per-record, cross-field property that field policy cannot express.
2. **There is no dual identity.** A worker has one name today. There is no separation between a **legal name** (internal, classified) and a **public alias/pseudonym** — the thing every creative-access agency uses. Without it, any public rendering leaks the real name.
3. **There is no publication firewall.** Even with a "don't show this" flag, a real name/photo/country can leak through secondary vectors nobody guards individually: fund names, campaign slugs, Stripe statement descriptors, receipt PDFs, OG images, sitemaps, URL slugs, search indexes, CSV exports, webhook payloads, photo EXIF/geodata. SiteStacker's answer is a per-page "Authenticate" checkbox — which makes safety depend on an admin configuring every page correctly. That is the anti-pattern.
4. **There is no read-audit or break-glass for the most sensitive data.** Phase 3 audits `care`/`security` field reads and _deferred_ break-glass to a later phase. For restricted-worker and crisis data, "who viewed this, when, from where, why" and a controlled emergency-access path are safety requirements, not nice-to-haves.
5. **The platform's own pipes leak.** Observability (Sentry, logs), support tooling, and demo seeding can expose restricted fields to Asym staff or third-party processors — undermining the Art. 9(2)(d) "no disclosure outside the body" posture the whole legal footing rests on.

Build custom fields, public pages, or search on top of this and the leak is baked in — and in this domain a leak is a physical-safety event.

## Solution

An **Asym-owned sensitive-data safety foundation** that **extends** the Phase 3 classification/projection floor with the rails a missions CRM needs, landed **before** any worker-rendering surface. It is deliberately the **foundation**, not the member-care product (that is Phase 38). Its shape:

1. **A person-level security classification** (`security_level`, a small fixed enum) on the party — orthogonal to Phase 3's field `sensitivity_category` — defaulted from a tenant-configurable, versioned **country-risk table** (seedable from an external persecution index), and driving publication. Field need-to-know and person publication **compose: strictest-applicable wins.**
2. **Dual identity on the party**: a **legal name** (security-classified) vs a public **display name / alias**, with photo, biography, generalized region, and real country as classified attributes. Public surfaces read **only** the sanitized public projection.
3. **The publication firewall as an architectural invariant** — extending the Phase-5 public choke-point and the Phase-3 confused-deputy allowlist so a restricted worker's real name/photo/country is **structurally unreachable** from every public/external egress, with each secondary-leak vector enumerated and enforced.
4. **Restricted-tier data in separate tables with their own RLS** (not masked columns), and **ABAC predicates** (security-level ceiling, team/assignment relationship, named-person grant) folded into the **one** Phase-3 subtract-only resolver — one policy vocabulary, not two.
5. **Append-only sensitive-read audit** (extended from Phase 3's `care`/`security` field reads to the restricted tier) plus the **break-glass primitive**: emergency access with mandatory justification, a real-time alert, and a post-hoc review queue — the API-level rail the Phase-38 crisis UI later sits on.
6. **Consent & publishing preferences** per person (explicit consent to publish name/photo/story; hard do-not-publish flags), wired into the **shipped** consent gate, plus **telemetry redaction** of restricted fields so the platform's own pipes do not become the leak.

Everything **reuses and extends** what already ships (Phase 3 `field_policies` + resolver + export governance + audit; the Phase-5 public projection; `member_care_foundation`; the consent gate) — it forks nothing. Steady state: a restricted worker is a first-class record staff can operate on, whose real identity is **incapable by construction** of reaching a public surface.

---

## User Stories

### Security officer / admin — classification & identity

1. As a **security officer**, I want to set a worker's security level (Standard → High-risk), so that every surface treats their data at the right sensitivity without me configuring each page.
2. As a **security officer**, I want a worker's security level to default from the risk of their country of service, so that a new restricted-country worker is protected the moment they are created, before anyone edits a field.
3. As a **security officer**, I want to maintain a worker's **legal name** separately from their **public alias**, with photo/biography/region/country classified, so that the public sees only what is safe to show.
4. As a **security officer**, I want to control which staff can see the legal-name↔alias mapping for restricted workers, so that need-to-know is enforced, not assumed.
5. As an **admin**, I want the classification vocabulary to be small and fixed (with configurable defaults), so that our policies stay testable and staff are not overwhelmed.

### The platform — the publication firewall

6. As the **platform**, I want a restricted worker's real name, photo, and country to be **structurally unreachable** from public-site queries, CMS content, donor-portal APIs, OG images, sitemaps, URL slugs, and receipt/email templates, so that a single mis-configured page cannot leak them.
7. As the **platform**, I want every secondary-leak vector — fund names, campaign slugs, Stripe descriptors, receipt PDFs, search indexes, CSV exports, webhook payloads, photo EXIF/geodata — to enforce the firewall at its egress point, so that the leak cannot escape through a side channel.
8. As the **platform**, I want field need-to-know (Phase 3) and person publication (this phase) to compose with **strictest-wins**, so that a public field on a restricted worker is still withheld.

### Staff operator — need-to-know

9. As a **staff operator**, I want to see and work with a restricted worker's operational data I am entitled to, so that mobilization and finance are not blocked — while data above my clearance is simply absent.
10. As a **care/security-team member**, I want restricted-tier records to live behind their own access, so that broad staff access does not expose them by default.

### Auditor / compliance — audit, break-glass, consent

11. As an **auditor**, I want every read/export/print of a restricted-tier record logged (who, when, from where, why), so that access to the most sensitive data is provable.
12. As a **crisis responder**, I want a controlled break-glass path — emergency access with a mandatory reason that fires a real-time alert and lands in a review queue — so that in an emergency I can act, and the access is reviewed afterward.
13. As a **compliance owner**, I want per-person publishing consent and hard do-not-publish flags honored everywhere, so that we never disclose a person's identity outside the organization without consent (GDPR Art. 9(2)(d)).
14. As a **compliance owner**, I want restricted fields redacted from platform telemetry (error tracking, logs, support tooling, demo seeds), so that our own pipes do not become the leak and third-party processors never receive restricted data.

### Missionary / worker — self-protection

15. As a **restricted-country worker**, I want to control whether my name, photo, and story are ever published, so that my safety and my local community's safety are not decided for me.
16. As a **worker**, I want photos I or my org upload to have location metadata scrubbed before they can be published, so that an image cannot betray my location.

### Founder / organization

17. As a **founder**, I want the safety rails in place before custom fields, public pages, newsletters, or search ship, so that we never have to retroactively triage unclassified sensitive data.
18. As the **organization**, I want our existing CCI-style security policy (security levels, publication rules, need-to-know) to be **enforced by the product**, not merely stored, so that the CRM is safe for restricted ministry by design.

---

## Implementation Decisions

### A. Architecture rulings

- **A1 — Extend Phase 3; one classification vocabulary, two orthogonal axes.** _(D1.)_ Phase 10 does **not** fork a parallel classification model. Field need-to-know stays Phase 3's `field_policies.sensitivity_category` (the fixed six: `public, contact, internal, financial, care, security` — the `security` category is the restricted-data field hook, `care` the member-care hook). Phase 10 adds one **orthogonal** axis — a **person-level `security_level`** governing **publication** (a per-record, cross-field property field-policy cannot express) — and wires it through the **same** subtract-only resolver. Both compose: **strictest-applicable wins.** _(ADR 1.)_
- **A2 — `security_level` is a small fixed enum, defaulted from country risk.** _(D2.)_ `security_level ∈ {standard, sensitive, restricted, high_risk}` (TEXT+CHECK, **fixed** — tenants configure the country→level _mappings_ and defaults, never invent new tiers, so RLS/egress/compliance stay testable). It defaults from a tenant-configurable, **versioned** `country_risk` table (seedable from an external persecution index such as the Open Doors World Watch List tiers; the platform owns the seed cadence; tenant override wins). `standard` is the default for the vast majority of records — the model adds no friction to ordinary people. _(ADR 2.)_
- **A3 — Dual identity on the party.** _(D3.)_ The person party carries a **legal name** (security-classified) and a public **display name / alias**; photo, biography, generalized region, and real country are classified attributes. Public surfaces read **only** the public-tier projection (alias, approved photo, generalized region). The **legal↔alias mapping** for restricted workers is gated by a `security_officer` capability / named grant (Phase 12 deepens the grant UI; Phase 10 ships the flag + a coarse gate). No new inline contact columns on the party (Phase 9 lint carries forward). _(ADR 3.)_
- **A4 — The publication firewall is an architectural invariant, not a per-page setting.** _(D4.)_ Extend the Phase-5 public choke-point (`packages/api/src/cms/public`, `public-giving/projection.ts`) and the Phase-3 confused-deputy allowlist so a restricted worker's real name/photo/country is **structurally unreachable** from public queries, Payload content, donor-portal APIs, OG images, sitemaps, URL slugs, and receipt/email templates. **Every secondary-leak vector is enumerated and enforced at its egress:** fund/campaign names and slugs (never derived from a real name for a restricted worker), Stripe statement descriptors and receipt PDFs (alias/fund-code — the exact string decided **with Phase 13/18**), search indexing (restricted tier excluded), CSV/export (Phase-3 export governance extended), webhook/API payloads (Phase-31 projection), and **photo EXIF/geodata scrubbed on upload** for worker-linked media. SiteStacker's page-level "Authenticate" checkbox is the rejected anti-pattern. _(ADR 4.)_
- **A5 — Restricted-tier data in separate tables with their own RLS; never masked columns.** _(D5.)_ Restricted attributes (legal name, real country, precise location, and the restricted-worker note/file class) live in **separate tables** with their own RLS policies — not masked columns on shared tables (view `security_invoker` and column-grant footguns make masking fragile in exactly the highest-stakes data). Which restricted domains get separate tables in Phase 10 vs. reserved for Phase 38 is fixed in §D. _(ADR 5.)_
- **A6 — RBAC + ABAC through the one resolver.** _(D5.)_ Coarse roles gate surface/module access (existing); **attribute predicates** — `security_level` ceiling, team/assignment relationship, named-person grant — are added to the **Phase-3 subtract-only resolver** as composing predicates (`effective = field_policies ∩ row_scope ∩ record_flags ∩ record_state ∩ security_scope`). One policy vocabulary; the resolver still only ever _subtracts_. _(NIST SP 800-162 ABAC.)_ _(ADR 6.)_
- **A7 — Append-only sensitive-read audit + the break-glass primitive.** _(D5.)_ Extend Phase 3's `care`/`security` field-read audit to the **restricted tier**: an append-only record of who viewed/exported/printed which restricted record, when, from where, with what justification. The audit table is **itself classified** (who is in a restricted/care context is confidential — audit-of-audit). **Break-glass** is a primitive here: emergency access requires a mandatory reason, fires a real-time alert (Sentry + the Phase-6 seam), and lands in a post-hoc **review queue**. The crisis _UI_ is Phase 38; the rail is here (Phase 3 explicitly reserved break-glass for this phase). _(ADR 7.)_
- **A8 — Consent, publishing preferences, and telemetry redaction.** _(D6.)_ Per-person **consent & publishing preferences** (explicit consent to publish name/photo/story — Art. 9 explicit-consent quality; **hard do-not-publish** flags) wired into the **shipped** consent gate (`packages/api/src/email/consent.ts`) — extend, never fork. The **Art. 9(2)(d)** "no disclosure outside the body without consent" invariant is product behavior. The platform's **own pipes count as "outside the body"**: restricted fields are **redacted from telemetry** (Sentry, logs, support tooling, demo seeds) so third-party processors never receive them. _(ADR 8.)_
- **A9 — Phase 10 builds the rails; Phase 38 builds the care product.** _(D7.)_ In scope here: classification axes, `security_level` + country risk, dual identity + the publication firewall, consent/publishing prefs, egress enforcement, read-audit + the break-glass primitive, the separate-restricted-table pattern, telemetry redaction. **Reserved to Phase 38:** the member-care case product (sealed care-note UI, provider-type + limits-of-confidentiality, duty-to-warn, crisis-ops UI + emergency-contact trees, DSAR/erasure tooling, compliance-evidence surfaces). `member_care_foundation` already ships — Phase 10 **classifies** it; Phase 38 builds on it. _(ADR 9.)_
- **A10 — Reclassification triggers a retro-scrub.** _(D8.)_ Changing a worker's `security_level` (e.g. moving to a restricted field) triggers a **retro-scrub workflow**: the publication firewall re-evaluates, and already-published/cached/sent content referencing the now-restricted identity enters a **purge queue** (public pages, CDN/cache tags, OG images, sitemaps). The reverse (restricted → open) requires an explicit consent + security-officer action. _(ADR 10.)_

### B. Deep modules

- **`classification`** — the `security_level` enum + the country-risk seed/override + `resolveSecurityLevel(party)` (person-level, defaulted from country, tenant-override) and `effectiveSensitivity(field, party)` (the strictest-wins composition of Phase-3 `sensitivity_category` and `security_level`). Pure, data-first.
- **`identity/dual` (extend the party service)** — legal-name vs alias accessors; the `security_officer`-gated legal↔alias mapping read; the classified-attribute readers (photo/biography/region/country).
- **`publicationFirewall`** — the public-projection extension: `toPublicProjection(party)` returns only public-tier fields for the party's `security_level`, structurally omitting restricted attributes; the enumerated egress guards (slug/fund/descriptor/OG/sitemap/search/export/webhook/EXIF) each call the same predicate. Extends `cms/public` + `public-giving/projection.ts`.
- **`resolver` (extend Phase 3)** — add the `security_scope` predicate (security-level ceiling + team/assignment relationship + named-person grant) to the subtract-only resolver. No new resolver; one chokepoint.
- **`sensitiveAudit` (extend Phase 3 audit)** — the append-only restricted-read log + the audit-of-audit classification; `recordSensitiveRead(actor, record, action, reason?)`.
- **`breakGlass`** — `requestBreakGlass(actor, record, justification)` → grants scoped, time-boxed access + fires the alert (Sentry + Phase-6 seam) + enqueues a review item; `reviewBreakGlass` (queue read; the resolve UI is Phase 38).
- **`consent/publishing` (extend the consent gate)** — publishing-consent + do-not-publish flags consumed by the publication firewall and the send seam.
- **`telemetryRedaction`** — the restricted-field redactor applied at the Sentry/log/support/demo-seed boundaries.

### C. Predecessor plug-ins (extend, never fork)

- **Phase 3 (hard).** `field_policies` + the subtract-only resolver + export governance + the audit spine are **extended**: the `security` category is the restricted field hook; the resolver gains the `security_scope` predicate; export governance gains the firewall predicate; the audit gains the restricted tier + break-glass. Phase 3 **explicitly reserved** break-glass and blanket read-auditing for this phase.
- **Phase 9 (hard).** Classification + dual-identity columns attach to the party graph + record shell; the record header's privacy indicator (Phase 9 D4) lights up with the real `security_level`; the member-care exclusion rule (Phase 9) is subsumed by this classification.
- **Phase 5 (extend).** The public-projection choke-point + defense-in-depth isolation are the firewall's foundation.
- **Phase 4 (soft).** Identity/merge — a merge must never widen classification (strictest of the two wins); the party carries `security_level` through a merge.
- **Phase 6 (soft).** The `sendEmail` seam is the break-glass alert channel and the do-not-publish enforcement point for outbound.
- **Phase 2 (inherited).** Tenant-scope only.
- **Phase 0 (inherited).** Built/Live/Confirmed evidence.

### D. Data model (all tenant-scoped, composite `(tenant_id, id)` keys, FORCE RLS)

**Net-new / extended:**

- **`parties` / person subtype — extend:** `security_level` (TEXT+CHECK `standard|sensitive|restricted|high_risk`, default `standard`), `display_name` (public alias), and a `security_country` reference used for the default. Legal name + real country + precise location move to a **separate restricted table** (below), not columns here.
- **`party_restricted` (separate table, own RLS)** — the restricted-attribute store: `party_id`, `legal_name`, `real_country`, `precise_location`, `real_photo_ref`, `notes` about publication. RLS: only `security_officer`/named-grant + the resolver's `security_scope`. Restricted note/file rows use this class.
- **`country_risk`** — tenant-configurable, versioned: `country_code`, `default_security_level`, `source_ref` (e.g. WWL tier + year), `version`, `effective_at`, `tenant_id` (NULL = platform seed; tenant rows override).
- **`party_publishing_consent`** — per-person: `party_id`, `publish_name`/`publish_photo`/`publish_story` (bool + consent evidence), `do_not_publish` (hard flag), consent timestamps. Consumed by the firewall + the send seam.
- **`sensitive_read_audit`** (extend Phase 3 audit posture) — append-only: `tenant_id`, `id`, `actor_profile_id`, `record_ref`, `action` (`view|export|print`), `reason`, `origin`, `at`. Itself classified (its own RLS tier).
- **`break_glass_grants`** — `tenant_id`, `id`, `actor_profile_id`, `record_ref`, `justification`, `granted_at`, `expires_at`, `reviewed_at`, `reviewed_by`, `state` (`active|expired|reviewed`).
- **`field_policies` census rows** — new restricted-tier fields + the new tables' fields registered with `sensitivity_category='security'` (or `care`) so the resolver and export governance cover them by construction.

**Reuse:** the Phase-3 `field_policies` + resolver + audit; `member_care_foundation` (classified, not rebuilt); the Phase-5 public projection; the consent gate. **Supabase RLS rules** (from Phase 3/8): `(select …)` initPlan wrap, `TO authenticated`, one policy per op with `WITH CHECK`, index non-leading policy cols, `security definer set search_path=''` authz in a private schema, named CHECKs, `NOT VALID`→`VALIDATE`, run the security advisors; **separate restricted tables in a non-exposed schema and/or Data-API-revoked.**

### E. Contracts / wiring

- **Classification API (admin):** set/read `security_level`; manage the `country_risk` table + tenant overrides; manage the legal↔alias mapping (security-officer gated); publishing-consent management.
- **The firewall predicate is one function** called at every egress (public reader, CMS serializer, giving projection, receipt/statement render, OG/sitemap, search indexer, CSV/export serializer, webhook/API projection, media upload EXIF scrub). A **CI import-lint** asserts no public/external egress bypasses it (mirrors the Phase-5 sole-entry and Phase-6 sole-seam lints).
- **Break-glass** fires through the Phase-6 seam (`crm_alert`-style, `staff_only`, no person link in the alert body) + Sentry; the grant is time-boxed and audited.
- **Reclassification** enqueues the retro-scrub via the shipped Inngest runtime (a purge job over cache tags / published refs).

### F. Architecture Decision Records

1. Extend Phase 3; two orthogonal axes (field sensitivity + person security_level), strictest-wins, one resolver.
2. `security_level` fixed enum defaulted from a versioned country-risk table; tenant configures mappings, not tiers.
3. Dual identity (legal name vs public alias) with classified attributes; the legal↔alias mapping is a gated named grant.
4. The publication firewall as an architectural invariant + the enumerated secondary-leak egress guards + the sole-entry lint.
5. Restricted data in separate tables with their own RLS; never masked columns.
6. RBAC + ABAC through the single subtract-only resolver (the `security_scope` predicate).
7. Append-only restricted-read audit (audit-of-audit classified) + the break-glass primitive (alert + review queue); crisis UI deferred.
8. Consent/publishing preferences + Art. 9(2)(d) as product behavior + telemetry redaction (the platform's own pipes are "outside the body").
9. Phase 10 rails vs Phase 38 care product — the boundary.
10. Reclassification triggers a retro-scrub/purge; open→restricted is one-way without explicit consent.

---

## Testing Decisions

A failure fails the build — leaks here are physical-safety events, and RLS/firewall refusals are silent by design (assert with `is_empty()`-style + refusal expectations).

- **Publication firewall (the headline negative tier):** for a `restricted`/`high_risk` worker, the real name/photo/country is **absent** from every public/external egress — the public reader, CMS serializer, giving projection, receipt render, OG image, sitemap, search index, CSV export, and webhook payload each get only the public projection; a fixture that adds a restricted field to any egress **fails**. A slug/fund/descriptor derived from a real name for a restricted worker is rejected.
- **Strictest-wins composition:** a `public` field on a `restricted` worker is still withheld from public surfaces.
- **Restricted-table isolation:** `party_restricted` rows are invisible without `security_scope`; a service-role path with tenant-A context cannot read tenant-B restricted rows; cross-tenant isolation extends the Phase-4 tier.
- **Read-audit + break-glass:** every restricted read/export/print writes exactly one audit row; break-glass grants time-boxed access, fires the alert, and enqueues a review item; the audit table is itself access-restricted.
- **Consent + telemetry:** a `do_not_publish` person is never published on any surface; a restricted field never appears in a captured Sentry event/log/support payload/demo seed (a fixture that leaks one fails).
- **Reclassification retro-scrub:** moving a worker to `restricted` enqueues a purge and the firewall re-evaluates; open→restricted cannot be silently reversed.
- **Structural:** the sole-entry CI lint (no public/external egress bypasses the firewall predicate); the Supabase security advisors; a `security_level` CHECK negative test.

---

## Out of Scope (reserved seams — documented, not built)

- **The member-care case product** — sealed care-note UI, provider-type + limits-of-confidentiality, duty-to-warn/mandatory-report workflows, crisis-ops UI + emergency-contact trees, DSAR/erasure tooling, compliance-evidence surfaces → **Phase 38** (builds on this foundation + `member_care_foundation`).
- **The full named-grant / permission-configuration UI** — the rich grant management is **Phase 12**; Phase 10 ships the `security_officer` flag + a coarse gate.
- **The public missionary page rendering** — **Phase 22** consumes the firewall + public projection; it does not build them.
- **Custom-field classification UI** — **Phase 11** must obey this model from field creation; Phase 10 provides the classification the custom-field catalog inherits.
- **The exact restricted-worker descriptor/receipt string** — decided **with Phase 13/18** (alias vs fund-code); Phase 10 reserves the seam + enforces "not the real name."
- **AI/search over restricted data** — restricted tier is **excluded** from indexing and any future AI context (**Phase 40** inherits the rule); Phase 10 does not build search or AI.

---

## Further Notes

### Dependency Ledger

- **Hard:** **Phase 3** (the classification/resolver/export/audit floor this phase extends — and which explicitly reserved break-glass + blanket read-audit for here) and **Phase 9** (the party graph + record shell classification attaches to).
- **Soft:** **Phase 4** (merge must not widen classification), **Phase 6** (the break-glass alert seam + do-not-publish outbound enforcement), **Phase 5** (the public choke-point the firewall extends — shipped).
- **Gates (must not build before Phase 10):** **Phase 11** (custom fields would otherwise mint unclassifiable leak paths), **Phase 22** (public pages would render identity with no firewall). Phase 28/32 (newsletters), Phase 40 (search/AI), and broader exports also inherit the firewall.
- **Graph:** `3 → 9 → 10`; Phase 10 gates 11/22. No cycle.

### Best-practice grounding (verified this grill)

Creative-access/missions-security practice (pseudonyms, no public photos/location, generalized geography, assume-intercepted comms — CCI-style security levels; MissionaryConnect "Restricted Access Nation"; Denari HQ-managed security levels); the four-tier data-classification model with handling controls (public/internal/confidential/restricted); GDPR Art. 9 + Art. 9(2)(d) nonprofit-religious-body exception and the ICO appropriate-policy-document frame; NIST SP 800-162 ABAC (subject/object/action/environment attributes) for need-to-know without role explosion; HIPAA-style read-audit + break-glass; Supabase RLS separate-tables-over-masked-columns; Open Doors World Watch List as a defensible seed for per-country defaults. Better-than-SiteStacker: SiteStacker offers only group-CRUD + "Security Tags" on notes/files and page-level Authenticate checkboxes — the person-level security level + publication firewall + read-audit are a headline differentiator.

### Fresh-build posture (D9)

No production users → build the rails correct-from-start (`NOT NULL security_level DEFAULT 'standard'`, separate restricted tables from the first migration). Seeds deliberately include restricted-tier workers + a `country_risk` table + a named-grant example + a do-not-publish person, so the firewall, break-glass, read-audit, and telemetry redaction are demonstrable from day one. No migration ceremony.

---

## Evidence & Acceptance

**Acceptance criteria (Phase 10 is "done" when):**

- [ ] `security_level` exists on the person party (fixed enum, default `standard`), defaults from a versioned tenant-configurable `country_risk` table, and composes strictest-wins with Phase-3 field `sensitivity_category` through the one resolver.
- [ ] Dual identity ships: legal name (restricted table) vs public alias; classified photo/biography/region/country; the legal↔alias mapping gated by `security_officer`.
- [ ] The publication firewall is a single predicate enforced at every public/external egress (public reader, CMS, giving projection, receipt render, OG, sitemap, search, CSV, webhook, media EXIF), proven by the negative tier; a CI lint forbids any egress that bypasses it.
- [ ] Restricted-tier data lives in separate tables with their own RLS; the ABAC `security_scope` predicate is folded into the Phase-3 subtract-only resolver; cross-tenant + clearance isolation passes.
- [ ] Sensitive reads are audited append-only (audit itself classified); break-glass grants time-boxed access with a mandatory reason, a real-time alert, and a review-queue entry.
- [ ] Publishing consent + do-not-publish are honored on every surface; restricted fields are redacted from telemetry (Sentry/logs/support/demo seeds).
- [ ] Reclassification triggers the retro-scrub/purge; open→restricted is not silently reversible.
- [ ] The permanent negative/safety tier is green (firewall, strictest-wins, isolation, audit/break-glass, consent/telemetry, retro-scrub); the Supabase advisors pass.

**Evidence file** (Phase-2..9 style, Built/Live/Confirmed): migrations applied; the full test suite incl. the safety tier passing; the firewall sole-entry lint; the advisor output; the seeded restricted-worker/break-glass/do-not-publish demonstrations; and the explicit list of what Phase 10 did **not** build (the Phase-38 care product, the Phase-12 grant UI, the Phase-22 pages).

---

## Tracking Issues (epic + children; created via `/to-issues`)

Foundation tickets first (`status:todo`); the rest `status:blocked`. Hard-blocked on Phase 3 + Phase 9. No `ready-for-agent` until dispatch.

- **Epic — Phase 10: Sensitive-Data Classification & Restricted-Ministry Safety Foundation**
- **T1** — Docs: this PRD, the 10 ADRs, CONTEXT.md glossary terms (security level, publication firewall, dual identity, break-glass, restricted tier), OpenSpec delta. _(foundation)_
- **T2** — Classification model: `security_level` on the party + the versioned `country_risk` table + `resolveSecurityLevel`/`effectiveSensitivity` (strictest-wins); `field_policies` census rows. _(foundation)_
- **T3** — Dual identity: `party_restricted` separate table + legal-name/alias + classified attributes + the `security_officer`-gated mapping.
- **T4** — The `security_scope` ABAC predicate folded into the Phase-3 subtract-only resolver.
- **T5** — The publication firewall predicate + the enumerated egress guards (public/CMS/giving/receipt/OG/sitemap/search/CSV/webhook) + media EXIF scrub + the sole-entry CI lint.
- **T6** — Sensitive-read audit (append-only, audit-of-audit classified) extending the Phase-3 audit.
- **T7** — The break-glass primitive: time-boxed grant + alert (Sentry + Phase-6 seam) + review queue.
- **T8** — Consent/publishing preferences wired into the shipped consent gate + do-not-publish enforcement.
- **T9** — Telemetry redaction of restricted fields (Sentry/logs/support/demo seeds).
- **T10** — Reclassification retro-scrub/purge workflow (Inngest).
- **T11** — Permanent negative/safety test tier + structural CI gates + the Supabase advisors.
- **T12** — Phase 10 evidence file (Built/Live/Confirmed; seeded demonstrations; the "did not build" list).
