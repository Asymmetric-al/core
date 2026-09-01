# Phase 24 D75 — Fresh-proof clean-start domain claim adversarial review

**Date:** 2026-08-30  
**Founder answer reviewed:** Option 1 — fresh-proof clean-start self-service for
every Tenant, conditioned on excellent Tenant/staff UX and consistency with
Core's product and repository.  
**Final disposition:** **Accept with required amendments.**  
**Recorded decision:**
[ADR-0196](../../adr/0196-fresh-proof-clean-start-site-domain-claims.md)

## Executive verdict

The selected direction is the strongest permanent rule. Current Shopify and
Vercel flows let a new store/team prove current DNS control without requiring
access to the former store/team. That supports self-service, prevents former-
Tenant hostage power, and avoids a support queue that cannot improve on complete
current technical proof.

The informal answer needs seven amendments:

1. **Fresh proof means current DNS control, not legal ownership.** Core always
   issues its own exact-scope challenge; a provider `verified` flag is not Core
   Tenant authorization.
2. **Entering a hostname reserves nothing.** An unproved attempt is private,
   expiring, nonexclusive, nonpublic, and causes no provider mutation.
3. **Proof and claim are one race-safe boundary.** After server-observed DNS
   proof, one transaction consumes the one-use challenge, acquires the global
   current claim, creates a new private binding generation, and records the
   receipt/outbox—or does nothing.
4. **Clean start means no Core authority is inherited.** It cannot promise that
   browsers, search, DNS, archives, or external caches forgot the hostname.
5. **History is append-only and adverse reservations survive.** Core never
   retargets an old binding row; D10 exact-origin/path protections still run
   before new favorable routes.
6. **Hosting and publication remain later gates.** Provider attachment, provider
   verification, TLS, DNS routing, Site readiness, and Primary/Redirect
   activation are separate from D75 proof.
7. **Staff use the ordinary Add domain setup.** “Fresh claim” and “clean start”
   are specification terms; the interface says **Verify domain control** and
   **Domain verified · Not public**.

This is not overengineering. D75 adds one short-lived verification-attempt
facet to D72's Domain authority, one DNS lookup, and one command. It reuses
`sites.manage_domains`, Site → Domains, Base Maia components, D74 global claim
release, and the provider outbox. It adds no reconnect product, approval queue,
former-owner notice, legal-ownership service, provider dashboard, HTTP verifier,
transfer workflow, or new public resolver.

## Current behavior, intended behavior, and permanent path

| Layer             | Verified current/repository state                                                                                                               | D75 intended behavior                                                                                          | Permanent path                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Host resolution   | Current `resolveTenantFromRequest` queries one nullable nonunique Payload Tenant `primaryDomain` with `overrideAccess: true` and slug fallback. | Unknown/unproved/private candidates never select Tenant/Site/content; only D72 current binding generations do. | Trusted hosting adapter and operational Domain projection before Payload/cache.                     |
| Site/domain model | `PublicRequestContext.siteId` is `null`; no global hostname identity, attempt, claim, binding generation, or provider adapter exists.           | One proof attempt may become a new private binding/claim, never an old-row reassignment.                       | Relational global identity, scope-private attempts, immutable binding intervals, one current claim. |
| Address history   | D8–D10 document fresh binding, clean positive state, and permanent adverse Giving-address reservations; no runtime implements them.             | New positive state is empty; historical reservations remain globally enforceable.                              | D10 origin/path occupancy before every new route owner.                                             |
| Authorization     | D72 registers `sites.manage_domains`; current runtime has no D75 command/RLS/grants.                                                            | Current authorized Site-domain manager starts/resumes proof and atomically claims after success.               | Privileged server command plus full grant/RLS/owner/service-path parity.                            |
| Vercel            | Core has no product Domains API integration; Vercel team ownership, project assignment, verification, TLS, and DNS are separate.                | Core proof first; private claim second; provider attachment/readback afterward.                                | Sealed outbox adapter, no force/move, current limits/backoff/readback.                              |
| Staff UX          | No Site → Domains product is shipped; shared Base Maia inputs/cards/buttons/status primitives exist.                                            | One Add domain flow with copyable DNS record, resumable checks, truthful private success.                      | Route-addressable record detail; desktop Sheet only with evidence; mobile full viewport.            |
| Formal authority  | D72–D75 are not in the active OpenSpec delta; Phase 23 PR #1340 remains unmerged.                                                               | D75 is accepted intended documentation, not current capability.                                                | Reconcile Phase 23 and consolidate Phase 24 OpenSpec before tickets/runtime.                        |

Current repository evidence:

- [`resolve-tenant.ts`](../../../apps/admin/src/cms/public/resolve-tenant.ts)
- [`tenants.ts`](../../../apps/admin/src/cms/collections/tenants.ts)
- [`context.ts`](../../../packages/api/src/cms/public/context.ts)
- [`permissions.ts`](../../../packages/auth/permissions.ts)
- [`metadata.ts`](../../../packages/lib/seo/metadata.ts)
- [`apps/donor/next.config.ts`](../../../apps/donor/next.config.ts)
- [`packages/ui/components.json`](../../../packages/ui/components.json)
- [Mission Control admin UX standards](../../ai/ADMIN-UX-STANDARDS.md)

After a fresh fetch, branch HEAD and `origin/develop` both resolved to
`7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Phase 23 PR #1340 remained
`OPEN/BLOCKED` at `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`.

## Verified current external evidence

| Source                                                                                                                                                                            | Verified current practice                                                                                                                                                            | D75 use                                                                                                   | Boundary retained                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Shopify cross-store domain verification](https://help.shopify.com/en/manual/domains/add-a-domain/connecting-domains/verify-domain-ownership)                                     | A target store can verify a third-party domain through automatic provider authorization or a unique TXT record without accessing the original store; verification may take 48 hours. | Strong comparable evidence for former-owner-free self-service and resumable DNS UX.                       | D75 is narrower: it cannot displace a current Core claim until separately decided. |
| [Vercel domain claiming](https://vercel.com/docs/domains/working-with-domains/claim-domain-ownership)                                                                             | A new team can use a `_vercel` TXT challenge to claim a domain without source-team access.                                                                                           | Supports fresh proof over historical approval.                                                            | Vercel proof cannot choose a Core Tenant.                                          |
| [Vercel domain ownership/assignment](https://vercel.com/docs/domains/working-with-domains)                                                                                        | Team/account domain ownership and project assignment are distinct; another team may use project-level TXT verification.                                                              | Requires separate Core claim and provider states.                                                         | Provider facts remain evidence/execution.                                          |
| [Vercel project verification](https://vercel.com/docs/rest-api/reference/endpoints/projects/verify-project-domain)                                                                | `verified=false` blocks alias use until the provider challenge completes.                                                                                                            | Provider verification is a later readiness gate.                                                          | It never substitutes for Core proof.                                               |
| [Vercel CLI](https://vercel.com/docs/cli/domains)                                                                                                                                 | `--force` removes a domain from an existing project.                                                                                                                                 | Makes force unreachable.                                                                                  | D75 applies only after D74 release.                                                |
| [Vercel webhooks](https://vercel.com/docs/webhooks/webhooks-api)                                                                                                                  | Undelivered events retry for up to 24 hours and are then discarded.                                                                                                                  | Signed events accelerate, but readback completes, provider work.                                          | Webhook silence is no proof.                                                       |
| [Cloudflare hostname validation](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/hostname-validation/)                              | Ownership validation, certificate validation, and traffic cutover are distinct; several SaaS providers may hold active objects simultaneously.                                       | Confirms six separate D75/D72 states.                                                                     | DNS traffic and provider objects do not create public Core meaning.                |
| [RFC 8555](https://www.rfc-editor.org/rfc/rfc8555.html)                                                                                                                           | DNS challenge tokens are random, unique, at least 128 bits, server-selected, and protected against reuse of old responses.                                                           | Supports a 256-bit single-use exact-scope token and server observation.                                   | Seven-day validity is Core judgment, not an RFC claim.                             |
| [OWASP takeover prevention](https://cheatsheetseries.owasp.org/cheatsheets/Subdomain_Takeover_Prevention_Cheat_Sheet.html)                                                        | Dangling CNAME/provider resources enable takeover; wildcard DNS and decommissioning order need explicit controls.                                                                    | Requires no provider mutation before proof, fail-closed private setup, exact hosts, and drift monitoring. | Core does not manage Tenant DNS.                                                   |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) | Grants plus RLS matter; `USING` and `WITH CHECK` constrain old/new rows; service/owner paths can bypass policies and policy-dependent reads can race.                                | Requires structural command invariants and privileged-path/concurrency proof.                             | Browser roles never own global claim mutation.                                     |
| [W3C status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages) and [GOV.UK text input](https://design-system.service.gov.uk/components/text-input/)           | Async results need programmatic status; text fields need visible labels/instructions and preserved specific errors.                                                                  | Supports one labelled domain field, durable status, and polite announcements.                             | Base Maia/Base UI remains the visual/primitive authority.                          |
| [W3C Clear Site Data](https://www.w3.org/TR/clear-site-data/)                                                                                                                     | Clearing requires a network response, has service-worker limitations, and cookie clearing may affect a registrable domain.                                                           | Prevents a false client-cleanup guarantee.                                                                | Generation isolation is primary.                                                   |

## Facts, judgments, assumptions, and unresolved unknowns

### Verified facts

- Current Core cannot perform D75: it lacks D72/D74 identities, claims,
  provider absence, binding generations, owner reservations, and commands.
- D8/D9 already require fresh proof and no positive inheritance; D10 requires
  old exact-origin/path reservations to reapply under another Tenant.
- A shared Vercel team/project can report a domain verified without identifying
  the authorized Core Tenant.
- DNS/provider/TLS/public activation cannot be one database transaction.
- Existing browsers and external systems can preserve origin state/history that
  Core cannot erase.

### Product judgments

- Every Tenant receives the same post-D74 self-service rule; no former-Tenant
  approval or routine platform review.
- Core proof uses DNS TXT only for D75; an old HTTP-serving path is not current
  DNS-control proof.
- Seven calendar days balances documented 48-hour propagation with ministry
  staff/external administrator availability. It is one launch constant, not a
  Tenant setting or provider claim.
- Unproved attempts reserve nothing; atomic proof-to-claim uniqueness chooses a
  winner.
- Staff language remains **Add domain**, **Verify domain control**, and **Not
  public**; architecture terms stay in specs/audits.
- `sites.manage_domains` is sufficient; another capability would add access-
  configuration debt without a distinct human effect.

### Assumptions requiring representative evidence

- Ministry staff can successfully copy one TXT record and understand that
  verification does not publish the Site. This is plausible, not measured.
- Seven days is long enough for normal external DNS administration without
  producing excessive stale attempts; production evidence may justify changing
  the platform profile prospectively.
- The complete global hostname and D10 reservation lookups remain bounded at the
  supported catalog size; exact limits are not yet qualified.

### Resolved and unresolved decisions outside D75

- ADR-0197/D76 now governs a direct same-Tenant Site-to-Site cutover while the
  hostname retains a current binding; D75 still avoids disconnect-plus-add.
- A later question must decide a newly proved external controller confronting a
  current different-Tenant claim; D75 never force-displaces it.
- Root-scope service workers/offline authority on reusable public custom hosts
  remain unsupported at launch and require a separate accepted lifecycle.

## Ruthless category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.** **What could go wrong:** former-Tenant approval or
support review can indefinitely block a legitimate new controller; unrestricted
self-service can let typing become squatting. **Why it matters:** domains are
external property whose controllers legitimately change, but public identity is
high consequence. **Severity: High. Likelihood: Medium-high.
Evidence/reasoning:** Shopify and Vercel both support fresh proof without former-
account access. **Decision effect:** validates Option 1 only after proof and
atomic claim. **Permanent fix:** D75-R1–R6, R18; AC1–AC12, AC37–AC40.

### 2. Brittleness

**Material concern: Yes.** **What could go wrong:** “verified” Boolean, DNS
lookup now/claim later, mutable old binding, or provider-first sequence can race,
restore stale scope, or select two winners. **Why it matters:** wrong-Tenant
public identity is catastrophic. **Severity: Critical. Likelihood: High.
Evidence/reasoning:** DNS is external and provider verification lacks Core
Tenant meaning. **Decision effect:** requires one proof-to-claim transaction and
immutable generations. **Permanent fix:** D75-R4–R7, R11, R16; AC7–AC18,
AC25–AC28.

### 3. Technical debt

**Material concern: Yes.** **What could go wrong:** a reconnect table, provider-
specific proof model, separate ownership service, second resolver, or new
capability can duplicate D72/D74. **Why it matters:** every later domain state
would need synchronization. **Severity: High. Likelihood: High.
Evidence/reasoning:** D72 already owns Domain identity and `sites.manage_domains`.
**Decision effect:** adds only a verification-attempt facet. **Permanent fix:**
reuse one Domain command/projection/outbox/UI. **Exact spec language:** D75-R1–R2,
R6–R12, R17–R18; AC1–AC4, AC11–AC20, AC25–AC40.

### 4. Edge cases

**Material concern: Yes.** **What could go wrong:** exact subdomain delegation,
apex/`www`, IDNs, public suffixes, wildcard records, several TXT values, slow
propagation, token expiry, two valid claimants, same-Site retry, D74 still
pending, former provider ownership, old cookies/service workers, or D10 paths
can invalidate a happy path. **Why it matters:** these are ordinary domain-
lifecycle conditions. **Severity: Critical. Likelihood: High.
Evidence/reasoning:** current provider docs expose separate proof/assignment/TLS
states and up to 48-hour propagation. **Decision effect:** exact-host proof,
seven-day resume, one winner, and clean-start tests. **Permanent fix:**
D75-R1–R10, R12–R17; AC1–AC40.

### 5. Footguns

**Material concern: Yes.** **What could go wrong:** typing reserves a domain,
Vercel `--force`, CNAME/HTTP proof, copied provider IDs, old token replay,
automatic `www`, old-row Tenant update, or automatic publication can seize or
expose a hostname. **Why it matters:** each is easy to implement and hard to
repair. **Severity: Critical. Likelihood: High. Evidence/reasoning:** Vercel
documents force removal; RFC 8555 explicitly treats old challenge reuse as a
threat. **Decision effect:** forbids each shortcut. **Permanent fix:** D75-R1–R10,
R16, R18; AC1–AC24, AC37–AC40.

### 6. Tenant safety

**Material concern: Yes.** **What could go wrong:** global availability, prior
history, timing, provider state, or a challenge can reveal or mutate another
Tenant; one current hostname can bind twice. **Why it matters:** sensitive
ministry identities and content could cross scopes. **Severity: Critical.
Likelihood: Medium-high. Evidence/reasoning:** current `primaryDomain` is
nonunique/Tenant-only; D72 requires platform-wide uniqueness. **Decision effect:**
non-enumerating attempts and private global claim authority. **Permanent fix:**
D75-R2, R6–R8, R11, R14, R16–R18; AC1–AC4, AC11–AC18, AC25–AC28, AC37–AC40.

### 7. Database, RLS, and authorization safety

**Material concern: Yes.** **What could go wrong:** UPDATE can retarget an old
binding, a caller can mark proof accepted, or service/table-owner/view paths can
bypass RLS and claim globally. **Why it matters:** UI checks do not protect the
domain invariant. **Severity: Critical. Likelihood: High. Evidence/reasoning:**
Supabase documents grants plus policies and `BYPASSRLS`; PostgreSQL documents
policy-dependent concurrency hazards. **Decision effect:** makes constraints,
command-only writes, and privileged poison tests release blockers. **Permanent
fix:** D75-R6–R8, R11, R16–R18; AC11–AC18, AC25–AC28, AC37–AC40.

### 8. Overengineering

**Material concern: Yes.** **What could go wrong:** legal ownership checks,
WHOIS/registrar integrations, former-owner notifications, human approval,
several proof methods, a wizard, or a configurable challenge policy can make
ordinary setup brittle. **Why it matters:** small ministries often rely on an
external volunteer/admin and need one clear record. **Severity: Medium.
Likelihood: High. Evidence/reasoning:** unique DNS TXT proof is widely used and
sufficient for current technical control. **Decision effect:** one fixed launch
method/profile and ordinary Add domain UI. **Permanent fix:** D75-R4, R12–R13,
R18; AC5–AC10, AC29–AC36, AC39–AC40.

### 9. UX/UI and user friction

**Material concern: Yes.** **What could go wrong:** ownership/legal jargon,
vanishing modals, raw DNS/provider errors, hidden expiry, fake progress,
truncated values, or a provider dashboard can strand staff. **Why it matters:**
DNS work is unfamiliar and asynchronous. **Severity: High. Likelihood: High.
Evidence/reasoning:** Shopify/Vercel use copyable TXT steps; WCAG requires named
inputs and programmatic status. **Decision effect:** route-addressable setup,
one record, copy actions, last checked/expiry, leave/resume, and plain states.
**Permanent fix:** D75-R3–R5, R12–R14; AC5–AC10, AC29–AC36.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.** **What could go wrong:** DNS/provider becomes legal or
Core ownership authority, historical binding becomes current, or a read model
writes the claim. **Why it matters:** dual ownership creates circular sync and
wrong-Tenant routing. **Severity: Critical. Likelihood: High.
Evidence/reasoning:** D72 assigns operational identity/role to Core Domain
authority; provider/DNS are evidence. **Decision effect:** separates attempt,
proof, claim, provider, readiness, and role. **Permanent fix:** D75-R1–R10,
R16–R18; AC1–AC24, AC37–AC40.

### 11. Hidden coupling

**Material concern: Yes.** **What could go wrong:** claim could import content,
Giving meaning, Donor Portal/auth host, analytics, cookies, locale/currency,
provider objects, or former permissions. **Why it matters:** these owners have
independent privacy and lifecycle rules. **Severity: Critical. Likelihood:
Medium-high. Evidence/reasoning:** D1 and D8–D15 separate Site presentation,
financial/address, and identity authorities. **Decision effect:** clean positive
state with only global adverse reservations. **Permanent fix:** D75-R7–R10,
R15, R18; AC13–AC24, AC27–AC28, AC37–AC40.

### 12. Failure modes

**Material concern: Yes.** **What could go wrong:** DNS succeeds but claim loses,
claim commits but provider fails, verification times out, final response is
lost, or old events arrive after rotation. **Why it matters:** staff may retry
into duplicate/conflicting effects or mistake private for public. **Severity:
Critical. Likelihood: High. Evidence/reasoning:** DNS/provider are external and
Vercel webhooks are not durable completion. **Decision effect:** durable attempt,
semantic retry, one atomic winner, and truthful provider/readiness states.
**Permanent fix:** D75-R4–R6, R9–R10, R13, R16–R17; AC7–AC20, AC29–AC36.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.** **What could go wrong:** two Tenants prove the same
TXT, a challenge is replaced while a lookup is in flight, D74 finalization races
claim, or same request creates several attempts/jobs. **Why it matters:** only
one current binding can exist. **Severity: Critical. Likelihood: High.
Evidence/reasoning:** external proof cannot lock Postgres. **Decision effect:**
defines attempt/rotation/expiry/consumption and one claim CAS. **Permanent fix:**
D75-R2, R4–R6, R11, R16; AC1–AC18, AC25–AC28.

Valid lifecycle:

```text
verification_pending → proof_observed → claimed_private → provider_preparing
verification_pending → expired | cancelled | replaced
proof_observed + lost claim race → unavailable
claimed_private → D72 readiness states → later explicit public activation
```

Proof observation is not a durable standalone terminal state. It is consumed in
the claim transaction or the attempt remains unclaimed/invalid.

### 14. Data integrity risks

**Material concern: Yes.** **What could go wrong:** old rows are reassigned,
challenge outcome is mutable, provider IDs are reused, history is deleted, or
D10 reservations are lost. **Why it matters:** public/financial history becomes
false and protected paths can gain new meaning. **Severity: Critical.
Likelihood: Medium-high. Evidence/reasoning:** D8–D10 require immutable binding
history and global adverse allocation. **Decision effect:** new rows/generations
only, restrictive deletion, and reservation precedence. **Permanent fix:**
D75-R6–R9, R11, R16–R18; AC11–AC28, AC37–AC40.

### 15. Security and privacy risks

**Material concern: Yes.** **What could go wrong:** history/timing/errors leak a
sensitive former ministry; challenge values encode identifiers; stale cookies,
sessions, caches, or service workers influence the new Site. **Why it matters:**
cross-Tenant disclosure can be physical/pastoral harm. **Severity: Critical.
Likelihood: Medium-high. Evidence/reasoning:** same-origin browser state can
survive ownership change and public DNS is observable. **Decision effect:**
opaque tokens, non-enumeration, generation isolation, no root service worker,
and truthful external limits. **Permanent fix:** D75-R4, R7–R8, R11, R14–R18;
AC7–AC10, AC13–AC16, AC21–AC28, AC35–AC40.

### 16. Scalability and performance risks

**Material concern: Yes.** **What could go wrong:** typing arbitrary domains
creates provider calls, DNS polling storms, global history scans, N+1
reservations, or one Tenant starves onboarding. **Why it matters:** verification
is cheap to abuse and providers are rate-limited. **Severity: High. Likelihood:
Medium-high. Evidence/reasoning:** Vercel exposes endpoint-specific limits; no
current product capacity is proved. **Decision effect:** no preproof provider
call, bounded coalesced DNS checks, indexed global current/adverse lookups, fair
queued provider work. **Permanent fix:** D75-R2, R5–R6, R9, R13, R17–R18;
AC1–AC4, AC7–AC20, AC29–AC40.

### 17. Operational burden

**Material concern: Yes.** **What could go wrong:** support becomes the DNS
operator, expired attempts require DB repair, raw provider conflicts leak, or
staff repeatedly poll. **Why it matters:** ordinary onboarding must not require
platform tribal knowledge. **Severity: High. Likelihood: Medium-high.
Evidence/reasoning:** the normal proof can be fully mechanical. **Decision
effect:** self-service regeneration/resume and exception-only support.
**Permanent fix:** D75-R12–R14, R16–R18; AC29–AC40.

### 18. Observability and auditability gaps

**Material concern: Yes.** **What could go wrong:** logs/toasts cannot prove
which challenge/scope/DNS answer won, whether it was consumed, or why provider
work began. **Why it matters:** safe replay and incident response need durable
business evidence distinct from telemetry. **Severity: High. Likelihood: High.
Evidence/reasoning:** repository patterns require receipts/outbox and provider
readback. **Decision effect:** minimized immutable proof/claim receipt and twelve
named signals. **Permanent fix:** D75-R4–R6, R9, R16–R17; AC7–AC20, AC25–AC28,
AC36–AC40.

### 19. Dependency and integration risks

**Material concern: Yes.** **What could go wrong:** Vercel changes verification,
limits, DNS instructions, event delivery, or project/account semantics;
Cloudflare/CDN/DNS evidence disagrees. **Why it matters:** provider drift cannot
create Core Tenant authority. **Severity: Critical. Likelihood: Medium-high.
Evidence/reasoning:** current providers explicitly separate states and Vercel
webhooks may be discarded. **Decision effect:** Core-owned proof and subordinate
adapter. **Permanent fix:** D75-R4–R5, R9–R10, R16–R18; AC7–AC10, AC17–AC20,
AC36–AC40.

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.** **What could go wrong:** current `primaryDomain`,
provider verification, DNS, traffic, or historical rows are inferred as fresh
proof; mixed old readers accept private candidates. **Why it matters:** migration
can create claims no current human proved. **Severity: Critical. Likelihood:
High. Evidence/reasoning:** current resolver is Tenant-only and active OpenSpec
lacks D72–D75. **Decision effect:** no proof/claim backfill and reader-first
rollout. **Permanent fix:** D75-R17–R18; AC37–AC40.

### 21. Testability, traceability, and proof

**Material concern: Yes.** **What could go wrong:** a unit test around TXT match
passes while concurrency, RLS, provider ordering, cache/cookies, privacy,
accessibility, and mixed versions fail. **Why it matters:** D75's promise spans
database, DNS, provider, public runtime, and staff UI. **Severity: Critical.
Likelihood: High. Evidence/reasoning:** Core requires public-seam/negative/
production-shaped proof. **Decision effect:** 40 falsifiable criteria and full
artifact trace. **Permanent fix:** D75-R18 and proof matrix below. **Exact spec
language:** AC1–AC40.

### 22. Other development hazards

**Material concern: Yes.** **What could go wrong:** “ownership,” “reconnect,”
“transfer,” or “clean browser” language overpromises; same-Tenant movement or
contested cross-Tenant control is silently pulled into D75. **Why it matters:**
terminology can authorize unsafe behavior and expand scope. **Severity: High.
Likelihood: High. Evidence/reasoning:** provider/store practices include force/
automatic transfers that D75 deliberately does not. **Decision effect:** precise
glossary, staff terms, and D76 boundary. **Permanent fix:** D75-R1, R7, R10,
R12, R15, R18; AC1–AC6, AC13–AC24, AC29–AC40.

## Exact normative requirements

### D75-R1 — Post-D74 exact-host eligibility

D75 success MUST apply only to one exact Tenant-controlled custom hostname whose
former current Core claim and provider association are conclusively released
under D74. It MUST NOT displace a current, public, private, disconnecting,
pending, contested, or ambiguous claim; act on Core-owned/platform/provider/
wildcard/preview/Donor-Portal hosts; or infer apex/`www`/parent/child/sibling
authority. Starting an attempt MAY remain non-enumerating before eligibility is
disclosed, but claim commit MUST prove D74 finality.

### D75-R2 — Unproved attempts reserve nothing

An authorized `sites.manage_domains` human MAY create/resume one private current
verification attempt per exact Tenant/environment/Site/hostname. An attempt MUST
create no global occupancy, provider object/call, binding, public role, DNS
change, or former-owner notification. Other scopes may have independent attempts
without visibility. Same-scope duplicate input resumes the current attempt;
**Start new verification** invalidates its challenge first.

### D75-R3 — Canonical safe hostname input

The input MUST accept an exact hostname or common HTTPS URL paste, preserve the
entered value on error, extract and visibly confirm the hostname, and use D72's
versioned canonical ASCII identity/safe Unicode display. Protocol/path/query are
not claimed. IP, credentials, ports, wildcard, public-suffix-only, platform/
provider, reserved/local, invalid IDNA, and unsafe inputs MUST fail specifically.
Apex/`www` suggestions never create or prove another host.

### D75-R4 — Core-owned fresh DNS challenge

Core MUST generate an opaque server-side 256-bit DNS TXT challenge bound to one
immutable attempt ID, canonical host, Tenant/environment/Site, generation, and
purpose. It MUST contain no scope/history/provider identity, remain valid for
seven calendar days with exact expiry shown, and become forever invalid after
success, expiry, cancellation, replacement, or any meaning change. Rotation
uses a new value. Staff may remove a successfully consumed Core TXT record.

### D75-R5 — Trusted proof observation

Only a current server-side trusted DNS observation of the exact TXT name/value
MAY prove technical control. Caller claims, screenshots, email, registrar text,
certificates, provider flags, traffic, CNAME, Search Console, old proof, and HTTP
responses MUST NOT. DNSSEC validates when present; unsigned zones remain
eligible. Missing, stale, split, malformed, resolver-failed, or contradictory
evidence remains **Waiting for DNS** or **We couldn't check this domain**, not
proved/unavailable.

### D75-R6 — Atomic proof consumption and private claim

Immediately after D75-R5, one short stable-order transaction MUST reauthorize,
lock/reload exact identity/attempt/scope, prove unexpired/unconsumed challenge and
D74-final/no-current-claim, append minimized proof, consume the challenge,
create a new private binding generation and platform-wide claim, write receipt/
audit/outbox, and commit all-or-nothing. Proof MUST NOT be stored as accepted for
later claim. A unique current-claim constraint chooses one concurrent winner;
losers receive only the non-enumerating unavailable result.

### D75-R7 — New binding; no positive inheritance

D75 MUST insert a new binding generation/interval and MUST NOT update/retarget/
restore a former binding. It inherits no former content, brand, navigation,
locale/currency, release/public role, redirect, provider object, permission,
staff, analytics, integration, task, donor/Party/Giving/auth/callback/protected
meaning, favorable cache, cookie/session, service worker, or operational state.

### D75-R8 — Persistent history and adverse reservations

Canonical hostname identity, former binding intervals, minimum audit/
attribution, and every D9–D15 adverse reservation MUST remain. D10 exact-origin/
path reservations run before every new route and cannot be erased, transferred,
or disclosed. A path conflict says only **This address isn't available on this
domain** to an authorized new claimant.

### D75-R9 — Provider work after local claim

Provider attachment MAY begin only from D75-R6's sealed outbox after private
claim commit. The adapter derives exact provider scope/host server-side, never
uses force/move/account delete/transfer or former objects, stays outside DB
locks, honors current rate headers/backoff, verifies signed events, and requires
authenticated readback/reconciliation. Provider failure never releases,
publishes, or silently reassigns the Core claim.

### D75-R10 — Six separate readiness gates

Core control proof, current global claim, provider assignment/verification,
TLS/certificate readiness, DNS traffic routing, and explicit D6/D66/D72 Site/
role activation MUST remain distinct. D75 success is only **Domain verified ·
Not public**. It creates no Primary/Redirect role, content, redirect, Giving
address, canonical origin, donor-visible response, or DNS mutation.

### D75-R11 — Database, RLS, authorization, and privileged parity

Composite same-scope FKs, current/partial unique checks, challenge-consumption
constraints, restrictive deletion, immutable history/proof, indexed global
claim/adverse lookups, minimum grants, forced RLS, and correct `USING`/
`WITH CHECK` MUST enforce D75-R1–R10. Browser/Data API roles cannot query global
history/availability or mutate proof/claim/provider/binding. Every view/RPC/
function/trigger/table-owner/secret/service/worker/Payload/support/import/repair/
AI path MUST pass the same command, scope, non-enumeration, and poison tests.

### D75-R12 — One ordinary Add domain experience

Site → Domains MUST retain one **Add domain** action and exact Site context.
**Add a domain to {Site}** MUST be route-addressable and resumable, using one
current-step Base Maia record detail rather than wizard, AlertDialog, provider
dashboard, legal-ownership/reconnect workflow, or app-local UI system. Desktop
Sheet use is evidence-owned; mobile is full viewport.

### D75-R13 — Clear asynchronous verification states

The visible setup MUST show the exact TXT `Type`, `Name`, `Value`, separate
accessible Copy actions, absolute expiry/timezone, last checked/timezone,
automatic bounded checking, one coalesced **Check again**, and DNS-admin help.
Plain states MUST include **Verify domain**, **Waiting for DNS**, **Checking
DNS**, **Verification expired · Start new verification**, **We couldn't check
this domain · Try again**, **Domain isn't available for setup**, and **Domain
verified · Not public**. Staff can leave/resume; no repeated polling announcement,
fake percentage, raw provider error, or toast-only outcome.

### D75-R14 — Privacy-safe results and retention

Before proof, never-used, historical, occupied, pending, and unknown foreign
states MUST be indistinguishable in disclosed identity/detail. After proof,
Core may disclose only the new setup's facts and source-owned generic
unavailability, never former Tenant/Site/ministry/actor/route/date/use/provider.
Tokens contain no identifiers; logs/traces/support/export/audit minimize scope.
Raw challenge material expires/redacts under policy while digest/outcome/receipt
survive. No former-Tenant notification is sent.

### D75-R15 — Client/cache clean-start truth

Every trusted session/cookie/context and application/CDN cache key MUST bind the
new Tenant/Site/binding generation; former state is rejected. Old redirects/
aliases/assets MUST be absent or generation-incompatible before public
activation. Launch public custom Site hosts MUST NOT register a root-scope
service worker. Core MUST NOT promise to erase browser/DNS/search/archive/
certificate/external history or rely on `Clear-Site-Data` as isolation.

### D75-R16 — Lifecycle, concurrency, and idempotency

Attempt create/resume/replace/expire/cancel, DNS observation, claim, D74 release,
provider work, candidate discard, route activation, and duplicate delivery MUST
have one documented ordering and expected heads. Same semantic key/meaning
returns the same attempt/claim; changed meaning conflicts. Late/expired/replaced
proof cannot succeed. Provider ambiguity keeps the private claim and truthful
Needs attention state; it never reuses the proof or creates a second effect.

### D75-R17 — Scale, operations, migration, and rollout

DNS checks MUST be coalesced, bounded, Tenant-fair, and rate-aware; provider work
starts only after claim and uses fair queues/current limits. Current claim/D10
lookups MUST be exact and indexed, never global history scans. No current
`primaryDomain`, DNS/provider fact, traffic, or historical binding is backfilled
as D75 proof. Platform-global claim/adverse authority and negative readers land
before writers; attempts/provider inventory shadow safely; writers enable by
cohort with roll-forward reconciliation and a new-request kill switch.

### D75-R18 — Traceability, proof, and explicit non-goals

The founder answer, glossary, ADRs, D8–D10/D72–D75, Phase 2/5/12, living spec,
roadmap, consolidated OpenSpec, design, tickets, code, tests, migration, and
release evidence MUST use identical terms/states/invariants. D75 adds no legal
ownership/WHOIS/registrar product, former-owner approval/veto/notice, support
queue, provider-first add, force/move, automatic transfer/publication, current-
claim displacement, same-Tenant move, HTTP/screenshot proof, configurable proof
policy, bulk claim, new capability/resolver, or root service worker.

## Acceptance criteria and proof matrix

### Attempt eligibility, input, and challenge

- **AC1:** Any authorized Tenant may start the ordinary private Add domain flow;
  no former history or approval is disclosed/required.
- **AC2:** Typing or starting verification creates no global reservation,
  provider mutation, binding, public role, DNS change, or notification.
- **AC3:** Same Site/host resumes the attempt; other scopes remain invisible and
  cannot read/count/time each other's attempts.
- **AC4:** D74-pending/current/private/public/ambiguous claims cannot be acquired
  by D75; attempt start still reveals no foreign identity.
- **AC5:** Hostname and common HTTPS URL paste normalize to one visibly confirmed
  exact host; protocol/path/query never enter claim meaning.
- **AC6:** Invalid/reserved/IP/port/credential/wildcard/public-suffix/provider/
  IDNA inputs fail specifically while safe Unicode/ASCII identity remains exact.
- **AC7:** The server generates a 256-bit opaque exact-scope TXT challenge with
  no Tenant/Site/history/provider identifiers.
- **AC8:** Exact seven-day expiry/timezone appears; success/expiry/cancel/
  replacement/scope change permanently invalidates the token and rotation uses
  a fresh value.
- **AC9:** Only trusted current server DNS observation can pass; screenshots,
  caller claims, HTTP/CNAME/traffic/certificate/provider/old records cannot.
- **AC10:** Slow/missing/split/DNSSEC/resolver/contradictory cases produce the
  correct waiting/unknown result without false field blame or proof.

### Atomic claim, history, and provider/public separation

- **AC11:** One transaction reauthorizes and locks exact identity/attempt/scope,
  rechecks D74/no claim, consumes proof, creates private binding/claim, and writes
  receipt/audit/outbox all-or-nothing.
- **AC12:** Two concurrent valid proofs have one constraint-enforced winner; the
  loser gets only the generic unavailable result and no partial provider work.
- **AC13:** Same-key/same-meaning retry returns the original attempt/claim;
  changed scope/host/generation/purpose conflicts.
- **AC14:** No former binding row changes Tenant/Site; a new immutable interval/
  generation is created and former history remains inaccessible/unchanged.
- **AC15:** New binding contains no former positive content/configuration/role/
  route/permission/provider/integration/donor/auth/analytics state.
- **AC16:** Every D9–D15 reservation survives and precedes new route admission;
  conflict copy reveals no former owner/reason.
- **AC17:** Provider add/verify work cannot run before claim commit and uses only
  sealed server scope; force/move/account delete/transfer paths are unreachable.
- **AC18:** Provider success/lost response/timeout/`429`/`5xx`/`403`/duplicate/
  delayed/missing event cases reconcile through readback under one work identity.
- **AC19:** Core proof, claim, provider verification/assignment, TLS, DNS routing,
  and public activation expose six distinct states and cannot imply each other.
- **AC20:** D75 success remains private and donor-invisible; Primary/Redirect,
  content, canonical origin, redirects, Giving, and DNS await explicit owners.

### Client isolation, authorization, privacy, and UX

- **AC21:** Former session/cookie/context cannot authorize/read the new binding;
  every trusted artifact validates exact Tenant/Site/binding generation.
- **AC22:** Cache keys/readbacks/invalidation prove no old Tenant content,
  redirect, asset, or provider alias becomes a favorable new-binding response.
- **AC23:** No root-scope service worker is registered on launch custom Site
  hosts; hostile old worker/storage/cache cases cannot change server authority.
- **AC24:** Copy/activation language truthfully distinguishes Core noninheritance
  from external browser/search/DNS/archive/history that Core cannot erase.
- **AC25:** Direct DML and grant/RLS/view/RPC/function/trigger/table-owner/secret/
  service/worker/Payload/import/repair/support/AI paths fail all unauthorized,
  cross-scope, proofless, replay, retarget, premature provider/public poison tests.
- **AC26:** `USING`/`WITH CHECK`, composite FKs, current unique/check constraints,
  restrictive deletes, immutable rows, and supporting indexes are inspected and
  exercised under races.
- **AC27:** Availability/history/timing/cache/error/log/export/support/telemetry
  stays non-enumerating across never-seen, historical, occupied, and unknown
  foreign states.
- **AC28:** Challenge/evidence retention is minimal; credentials never appear;
  former Tenant is never notified or given approval/veto authority.
- **AC29:** Add domain has visible Site context, one labelled field/instruction,
  preserves input, visibly confirms extracted host, and never uses legal-
  ownership/reconnect/transfer jargon.
- **AC30:** TXT Type/Name/Value, accessible copy controls, copied status, expiry,
  last checked, Check again, and DNS-admin help are complete and accurate.
- **AC31:** Waiting/checking/expired/unknown/unavailable/verified/private and later
  provider/readiness states remain plain, durable, resumable, and noncontradictory.
- **AC32:** Staff may leave/refresh/resume without duplicate jobs, local optimistic
  authority, spinner lock-in, repeated live announcements, or lost values.
- **AC33:** If Vercel needs distinct proof, one second titled provider step appears
  with its own record/retention rule and no raw account/provider IDs.
- **AC34:** Same-Site duplicate resumes; current same-Tenant binding and contested
  different-Tenant control remain separate future decisions, never hidden force.
- **AC35:** IDN/bidi, 320px, 400% zoom, keyboard, screen reader, touch, forced
  colors, reduced motion, long localization, RTL, weak network, session expiry,
  and copy-status tests pass using Base Maia/Zinc semantics.
- **AC36:** Maximum qualified attempts/DNS/provider cohorts meet declared DB,
  queue, DNS, provider, UI, and reconciliation budgets without N+1/global scans.

### Migration, traceability, and release proof

- **AC37:** Migration invents no attempt/proof from `primaryDomain`, provider/
  DNS/TLS/traffic/history; ambiguous state is quarantined and readers/adverse
  constraints deploy before writers.
- **AC38:** Mixed-version, delayed DNS/provider event, rollback/roll-forward,
  feature flag, kill switch, outage, challenge rotation, and claimant-race drills
  preserve claim/history/privacy/reservation invariants.
- **AC39:** Representative ministry staff complete first-time and resumed setup,
  distinguish verify/private/hosting/public states, and understand DNS control
  versus ownership at the accepted evidence threshold.
- **AC40:** Consolidated Phase 24 OpenSpec validates strictly and D75 is not
  claimed shipped until D8–D10/D72–D75, R1–R18, AC1–AC40, twelve monitors, and
  production-shaped provider/security/accessibility evidence pass.

## Required monitors

| Signal                                                   | Threshold                                                                                          | Owner                        | Required response                                                                                                                                             |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site_domain_claim_without_fresh_proof_total`            | Any                                                                                                | Security + Domain Platform   | P0; fence/release the illegal private claim safely, stop claim/provider writers, preserve evidence, inspect bypass path.                                      |
| `site_domain_claim_expired_or_replayed_challenge_total`  | Any accepted expired/consumed/replaced/wrong-scope token                                           | Security                     | Stop verification claims, revoke affected attempts, investigate replay/source, rotate signing/randomness dependencies, prove negative paths.                  |
| `site_domain_current_claim_duplicate_total`              | Any canonical hostname with more than one current claim                                            | Security + Database          | P0; globally fence hostname, disable claim/public writers, preserve both histories, resolve through authoritative forward repair.                             |
| `site_domain_provider_attach_before_claim_total`         | Any                                                                                                | Domain Operations + Security | Stop provider worker, remove/reconcile unauthorized provider object after fencing, repair outbox ordering, assess squatting/conflict.                         |
| `site_domain_provider_force_or_move_total`               | Any D75-path force/move/account-transfer call                                                      | Security + Domain Operations | P0; stop adapter, preserve provider/activity evidence, fence affected hosts, reconcile manually through accepted commands only.                               |
| `site_domain_prior_positive_inheritance_total`           | Any former content/config/role/permission/provider/integration/donor/auth state in a new binding   | Security + owning domain     | P0; fence new binding, halt D75 rollout, remove inherited projection forward, assess cross-Tenant disclosure.                                                 |
| `reserved_giving_address_reuse_after_domain_claim_total` | Any                                                                                                | Giving + Security            | P0; disable route publication/admission, restore D10 reservation, preserve attempted claim/checkout evidence, investigate every bypass path.                  |
| `site_domain_claim_cross_tenant_disclosure_total`        | Any former/foreign Tenant/Site/route/date/provider identity or avoidable state/timing leak         | Security + Privacy           | Restrict affected projection/log/support surface, normalize outcomes, assess sensitive-ministry exposure, block rollout.                                      |
| `site_domain_old_generation_auth_accept_total`           | Any former cookie/session/context accepted under new binding                                       | Auth + Security              | P0; fence host/auth path, revoke generation cohort, inspect cookie/session keys and scope, notify per incident policy.                                        |
| `site_domain_new_binding_stale_cache_response_total`     | Any former-Tenant favorable content/redirect/asset response                                        | Public Runtime + Security    | P0; fence host, purge exact cohort, inspect generation key/admission/provider alias, assess public disclosure.                                                |
| `site_domain_verification_p95_seconds`                   | p95 above the evidence-qualified DNS-check SLO for 15 minutes or oldest runnable check above SLO   | Domain Operations            | Preserve Waiting state, stop cohort expansion, inspect resolver/queue/limits, rebalance fair work; qualify numeric SLO before launch.                         |
| `site_domain_verification_attempt_burst_total`           | More than 10 distinct hosts by one principal in 10 minutes or more than 50 by one Tenant in 1 hour | Security + Domain Operations | Rate-shape only the abusive principal/scope, investigate automation/credential misuse, preserve legitimate bulk onboarding queue, never create provider work. |

## Ruthless synthesis

### Must be resolved before recording

Resolved here: proof semantics, seven-day one-use Core challenge, no reservation
before proof, atomic proof-to-claim, new immutable binding, global adverse
reservation precedence, provider/public separation, ordinary Add domain UX,
non-enumeration, client-state truth, capability reuse, and D76 boundary. The
founder answer is recorded only in the corrected form below.

### Must be captured in specification and design

1. D75-R1–R18, AC1–AC40, the twelve monitors, and inherited D8–D10/D72–D74.
2. Logical attempt/challenge/current-claim/new-binding/receipt/outbox constraints,
   global authority topology, RLS/grants/privileged parity, retention, and lock
   order.
3. Exact DNS verifier profile, challenge record naming, DNSSEC/current-answer/
   contradiction handling, fair checks, rate shaping, seven-day rotation, and
   outage runbooks.
4. Provider adapter sequence, optional second provider challenge, readback,
   signed events, current limit/backoff behavior, and no-force proof.
5. Base Maia route-addressable Add domain detail, input tolerance, copy/status/
   time/IDN/accessibility/mobile/weak-network behavior, and representative
   ministry-staff usability evidence.
6. Cache/session/cookie/generation isolation, no root service worker, D10
   precedence, hostile-client tests, and truthful external-history copy.

### Required implementation order

1. Reconcile accepted Site/D8–D10/D72–D75 and Phase 23 public-generation
   authority; consolidate the Phase 24 OpenSpec.
2. Land canonical global hostname identity, D10 reservations, current claim,
   immutable binding intervals, attempts/challenges, structural constraints,
   grants/RLS, and negative readers with D75 writers disabled.
3. Prove every runtime rejects unproved/private/wrong-generation hosts and old
   cookie/session/cache/client authority before Payload or favorable routes.
4. Implement/shadow the server DNS verifier, rotation/expiry, fair checks,
   privacy outcomes, and maximum catalog/race tests without provider mutation.
5. Implement atomic proof-to-claim plus provider outbox/readback; prove DB/RLS/
   privileged/concurrency/provider/mixed-version/roll-forward behavior.
6. Build and usability-test Add domain; enable one bounded production cohort
   behind a new-attempt kill switch while committed private/provider operations
   continue truthful reconciliation.

### Monitor only

Only the twelve named signals and explicitly external browser/search/DNS history
observations qualify as residual monitoring. Proofless/replayed claims, duplicate
occupancy, provider-before-claim/force, positive inheritance, D10 reuse,
cross-Tenant disclosure, old-generation auth, or stale favorable cache are
incidents—not accepted residual risk.

## Exact corrected decision

> After D74 has conclusively disconnected one exact Tenant-controlled custom
> hostname and ended its former current claim, every Tenant may use the ordinary
> Site → Domains **Add domain** flow. Core always requires a new seven-day,
> server-generated, 256-bit, single-use exact-host DNS TXT challenge. This proves
> current DNS control—not legal ownership. An unproved attempt remains private,
> nonexclusive, nonpublic, provider-dark, and reserves nothing.
>
> Immediately after trusted server DNS observation, one reauthorized short
> transaction consumes the challenge, proves D74 final/no current claim,
> acquires the one platform-wide hostname claim, inserts a new private binding
> generation, and records receipt/audit/provider outbox—or changes nothing. Two
> valid claimants have one constraint-enforced winner; every losing/foreign
> outcome remains non-enumerating. Old binding rows are never retargeted.
>
> The new candidate inherits no prior positive Site, content, brand, locale,
> route, provider, permission, integration, donor, auth, analytics, cache,
> cookie/session, or service-worker authority. Canonical host identity, immutable
> history, and every D9–D15 adverse reservation remain; D10 protected paths run
> before new routes. “Clean start” does not claim to erase external browser,
> DNS, search, archive, certificate, or Internet history.
>
> Only after local claim may a sealed worker prepare Vercel hosting without
> force/move. Core proof, provider verification/assignment, TLS, DNS routing,
> Site readiness, and explicit Primary/Redirect activation remain separate.
> D75 success is **Domain verified · Not public**. Same-Tenant live movement and
> contested current different-Tenant claims remain separately governed.

## D76 reconciliation (2026-08-30)

ADR-0197 now governs same-Tenant live movement. It never releases/reacquires the
current global claim or retargets a D75 proof/binding. Ordinary movement
revalidates current control without a new TXT challenge; loss, conflict, missing
provenance or provider verification regression may require one fresh move-bound
challenge while the source remains authoritative. Destination public meaning,
source replacement, owner routes and adverse cutover remain D76/D6/D73-owned.
