# ADR-0196: Fresh-proof clean-start Site domain claims

**Status:** Accepted with required amendments (Phase 24 D75 — 2026-08-30)

A Tenant-controlled custom hostname can legitimately change owners or return to
Core under another Tenant or Site. Historical Core use must never prove current
control or give the former Tenant a permanent veto, but a newly typed hostname
must not reserve the name, displace a current binding, or restore prior public
meaning. Core therefore permits every Tenant to use the ordinary self-service
**Add domain** flow after current control is freshly proved and D74 has fully
released the former current claim.

## Decision

Any current authorized Tenant human with `sites.manage_domains` may start a
private verification attempt for one exact custom hostname in one Tenant ×
environment × Site. A verification attempt is not a hostname reservation,
provider attachment, Site-domain binding, public role, or ownership claim.
Several scopes may attempt the same hostname without learning about each other;
the first valid proof that atomically acquires the platform-wide current claim
wins.

Core always requires its own fresh DNS-control challenge, even when Vercel or
another provider says the domain is verified. Core Tenants can share one
provider team/project, so provider verification cannot identify which Core
Tenant is authorized. Staff-facing language says **Verify domain control**, not
“prove ownership”: DNS write access proves current technical control, not legal
title or registrant identity.

The Core challenge is:

- generated server-side with 256 bits of cryptographic entropy;
- opaque and free of Tenant, Site, actor, provider, or historical identifiers;
- bound to one immutable verification-attempt ID, exact canonical ASCII
  hostname, Tenant, environment, Site, challenge generation, and purpose;
- published as one exact-host DNS TXT record and observed only by a trusted
  server-side DNS verifier;
- valid for seven calendar days, with an absolute expiry time and timezone shown
  to staff;
- permanently single-use and invalid after success, expiry, cancellation,
  replacement, or any scope/hostname/candidate change; and
- removable from DNS after Core records success. Any later provider/certificate
  validation record has its own explicitly stated retention rule.

Seven days is a Core launch product default, not a provider fact. Current
provider guidance warns that DNS propagation can take up to 48 hours; the
longer window accommodates weekends and volunteer/external DNS administrators
without turning a successful proof into a reusable credential. Expiry creates a
new challenge value; an old TXT value never becomes valid again.

Core does not accept caller assertions, screenshots, email at the domain,
registrar text, certificates, traffic, Search Console, an existing provider
`verified` flag, a CNAME already pointing to Core, or an HTTP response as D75
proof. HTTP proof is specifically insufficient for rebinding because a former
Core/provider path could answer without the new claimant controlling DNS.
DNSSEC validation strengthens evidence when the zone uses DNSSEC; lack of DNSSEC
alone does not make ordinary domains unusable.

## Atomic proof-to-claim boundary

DNS cannot participate in a database transaction. Immediately after a current
trusted DNS lookup observes the exact unexpired challenge, one short stable-
order PostgreSQL transaction must:

1. reauthorize the current human and exact Tenant/environment/Site;
2. lock/reload the immutable canonical hostname identity and attempt;
3. prove the challenge is current, unexpired, unconsumed, and bound to the
   requested exact scope;
4. prove D74 provider absence and claim release are final, with no current,
   disconnecting, pending, contested, or ambiguous Core occupancy;
5. append the minimized proof evidence and consume the challenge forever;
6. create a new private Site-domain binding generation and acquire the one
   platform-wide current hostname claim;
7. write one receipt, audit record, and deduplicated provider outbox effect; or
8. roll back every effect.

Proof is never accepted in one transaction and claimed later. A platform-wide
unique constraint and shared current-host head choose one winner when several
valid attempts race. A losing attempt reveals only **Domain isn't available for
setup** and never the winning/former Tenant, Site, actor, history, provider, or
timing. Same-scope repeat submission resumes the exact current attempt; starting
again invalidates the former challenge before issuing a new one.

Caller input supplies only the entered hostname, stable destination Site, and
semantic idempotency identity. Canonicalization, Tenant/environment, actor,
capability, challenge, timestamps, global availability, former history,
provider identity, proof observation, and audit attribution derive from trusted
server context.

## Clean-start and historical boundaries

Successful proof creates a new binding generation. Core never changes an old
binding's `tenant_id`/`site_id`, resurrects a former row, transfers a former
public role, or treats the operation as reconnect/restore/Undo. The new private
candidate inherits none of the former Tenant/Site's:

- content, Brand Version, Navigation, locale/currency configuration, release or
  public generation;
- Primary/Redirect role, redirect history, provider object, DNS/TLS status, or
  operational state;
- permission, staff, audit access, task, analytics property, source code, or
  integration;
- donor, Party, Giving purpose, checkout, authentication, callback, cookie,
  session, or other protected-route meaning; or
- favorable cache, asset, local-storage, service-worker, or client authority.

Canonical hostname identity, immutable binding intervals, minimum historical
audit/attribution, and every D9–D15 adverse address reservation survive. D10's
exact-origin/path reservations are evaluated before any new favorable route.
Unavailable paths disclose no former owner or reason.

“Clean start” means no prior Core state becomes authority. It does not mean the
Internet, browser, DNS resolver, search engine, archive, certificate log,
bookmark, or external cache forgot the hostname. Server sessions and signed
context must bind the new Tenant/Site/binding generation; former-generation
state is rejected. Application/CDN cache identity includes the binding
generation and no old cache may become a favorable hit. Public Site hosts do not
ship a root-scope service worker at launch; any future offline/PWA authority on
reusable custom hosts requires a separate lifecycle decision and proof.

`Clear-Site-Data` is not a D75 guarantee: it requires a network response, may be
intercepted by an existing service worker, has uneven client behavior, and broad
cookie clearing can affect sibling origins. It may be evaluated later as defense
in depth but cannot replace generation isolation, host-only cookies, cache
separation, or production-shaped hostile-client tests.

## Provider and public-activation boundary

Only after the local private claim commits may a sealed worker attach the exact
hostname to the pinned Vercel team/project. It never uses `--force`, provider
move, account-domain deletion/transfer, caller-selected IDs, or a former provider
object. Provider calls stay outside database transactions and use one durable
work identity, current rate-limit headers, bounded jittered backoff, signed-event
hints, authenticated readback, and reconciliation.

If Vercel requires a separate TXT challenge, the Domains setup surface shows it
as a second cause-owned step titled **Verify with the hosting provider**. Core
does not pretend its own proof satisfies a provider, nor ask staff to discover
provider IDs or dashboard state. Provider verification, project attachment,
TLS/certificate readiness, DNS traffic routing, Core Site readiness, and public
role activation remain separate truthful states.

Successful D75 claim means only **Domain verified · Not public**. It never
chooses Primary/Redirect, publishes content, changes DNS, emits a redirect,
serves another Site, creates a Giving address, or causes donor-visible behavior.
D6/D66/D72 and every route/security owner must still pass before explicit
activation.

D75 cannot displace a current, disconnecting, ambiguous, or provider-pending
Core claim. A newly proved controller confronting an existing current claim is
a separately governed contested-claim decision, not a hidden D75 force path.
Same-Tenant movement between two currently connected Sites is likewise a
separate successor operation rather than disconnect-plus-add.

ADR-0197/D76 defines that successor. The current same-Tenant occupancy remains
authoritative; ordinary movement revalidates present control but does not replay
or retarget D75 proof and does not issue a new TXT challenge merely because time
passed. Loss, conflict, missing provenance or provider verification regression
may require one fresh move-bound challenge while the source remains current.

## Database, RLS, and authorization invariants

The relational model must enforce:

- one immutable canonical hostname identity;
- any number of unproved scope-private attempts but at most one resumable
  current attempt for the same Tenant/environment/Site/hostname;
- one current challenge generation per attempt and permanent single-use;
- no global reservation/provider effect before accepted proof;
- at most one platform-wide current hostname claim;
- a successful proof, challenge consumption, new private binding, claim, receipt,
  audit, and outbox are all-or-nothing;
- former binding scope/identity/history is immutable and cannot be retargeted;
- D9–D15 adverse reservations outlive and constrain every binding; and
- private candidate creation confers no public role or route authority.

Same-scope composite FKs carry Tenant, environment, Site, hostname, attempt,
challenge generation, binding generation, and operation identity. Partial/
current unique indexes and checks enforce cardinality and valid state
combinations. Deletes are restrictive; immutable proof/history exposes no
update/delete path. Expired raw challenge material is redacted/disposed under a
declared retention schedule while the minimum digest/outcome/audit survives.

Browser/Data API roles receive no direct global availability, challenge-
acceptance, claim, provider, or binding mutation grant. Tenant-visible attempts
use minimum grants plus enabled/forced RLS and correct operation-specific
`USING`/`WITH CHECK`. The platform-wide claim authority stays private. Views,
RPCs/functions, triggers, table owners, secret/service roles, workers, Payload,
support, imports, repairs, and AI preserve the same command and scope invariants.
Security-definer functions use minimal execute grants, fully qualified objects,
and a pinned empty `search_path`.

D75 reuses `sites.manage_domains`; it adds no reconnect/claim capability or
approval role. The standard Domain Manager can start/resume an attempt and
submit the trusted claim command. DNS access, provider credentials, support
status, a former role, browser visibility, or possession of the TXT token grants
no Core capability.

## Staff and Tenant experience

The existing **Site → Domains** workspace keeps the exact Site visible and one
primary **Add domain** action. **Add a domain to {Site}** is route-addressable so
staff can leave and resume. A compact desktop record-detail Sheet is allowed
only if usability evidence supports it; mobile uses a full-viewport single-
column surface. This is one current-step setup detail, not a modal, wizard,
provider dashboard, or separate reconnect product.

The first view contains one visible **Domain name** label and short instruction:

> Enter a domain such as `www.hope.org`. This starts a private setup for Hope
> Relief Website. It will not publish the Site or copy content or settings from
> another Site.

The field accepts a hostname or a commonly pasted HTTPS URL, preserves the
entered value on error, and visibly confirms the exact extracted hostname before
starting. Protocol/path/query are never part of the claim. IP literals,
credentials, ports, wildcard input, public-suffix-only names, platform/provider
hosts, invalid IDNA, and reserved/local names fail with specific inline errors.
Adding apex or `www` may suggest the other under D72 but never creates/proves it.

The resumable verification detail says **Verify domain control** and shows:

- `Type`, `Name`, and `Value` for one exact TXT record;
- accessible, separately named Copy actions and one polite copied-status message;
- **Valid until {absolute time, timezone}**;
- **Last checked {time, timezone}**;
- automatic bounded checks plus one coalesced **Check again** action; and
- **I can't edit DNS** guidance to ask the domain's DNS administrator, never a
  screenshot, support bypass, or weaker proof.

Plain states are **Verify domain**, **Waiting for DNS**, **Checking DNS**,
**Verification expired · Start new verification**, **We couldn't check this
domain · Try again**, **Domain isn't available for setup**, **Domain verified ·
Not public**, and the inherited D72 provider/readiness states. A system or
capacity failure is not styled as a field error. Staff can leave safely; no
spinner, countdown, repeated announcement, fake percentage, raw provider error,
or notification workflow is required.

On success:

> **Domain verified · Not public**  
> `www.hoperelief.org` is connected to Hope Relief Website as a new private
> setup. Nothing from another Site was copied or restored. You can leave this
> page while secure hosting is prepared.

Same-Site duplicate input resumes the attempt. Before proof, never-used,
historically used, currently occupied, pending, and unknown cross-Tenant states
share the same non-enumerating verification start. A post-proof loser or blocked
claim says only **Domain isn't available for setup**. Authorized same-Tenant
current-binding handling and contested external-control handling remain their
separately decided workflows.

Technical DNS values use Geist Mono, left-to-right bidi isolation, safe wrapping,
and full accessible copy values without truncation. IDNs show safe Unicode and
canonical ASCII when different. Base Maia/Zinc semantic surfaces, text plus a
small semantic status indicator, visible focus, ≥44px mobile targets, 320 CSS
pixels, 400% zoom, keyboard, screen reader, forced colors, reduced motion, long
localization, RTL/bidi, weak network, refresh/resume, and session expiry are
release tests. One polite status region announces meaningful changes without
stealing focus.

## Consequences

- Legitimate new controllers receive the same fast self-service path regardless
  of former Tenant history.
- An entered hostname cannot be squatted because verification attempts reserve
  nothing and trigger no provider call.
- Cross-Tenant history remains private while global adverse address safety
  continues to apply.
- Staff may occasionally see two DNS-verification steps because Core control and
  provider control are intentionally distinct; the UI groups them in one setup.
- Seven-day challenges simplify volunteer/external-admin coordination while
  remaining one-time and scope-bound.
- Exact generation isolation protects Core truth, but Core truthfully cannot
  promise that external clients or the Internet have forgotten a reused origin.

## Rejected alternatives

- **Former-Tenant approval or support review:** creates hostage power and a
  subjective queue where fresh current proof is stronger evidence.
- **Typing reserves the hostname:** enables cross-Tenant namespace squatting.
- **Restore/reassign an old binding row:** rewrites history and leaks prior
  positive meaning.
- **Provider `verified` is sufficient:** cannot distinguish Core Tenants sharing
  a Vercel scope.
- **CNAME/traffic/HTTP proof only:** can be satisfied by dangling or former Core
  infrastructure and may route traffic before readiness.
- **Provider add before Core proof:** lets unproved callers create external
  conflicts and provider-level squatting.
- **Accept proof now and claim later:** creates a TOCTOU race with no unique
  winner.
- **Automatic public activation:** conflates control, hosting, TLS, DNS, Site
  readiness, and public meaning.
- **Automatic cross-Tenant force transfer:** D75 applies only after D74 final
  release; contested current claims require a separate safety decision.
- **Clear-Site-Data as the clean-start guarantee:** cannot reliably reach every
  client and may clear sibling-domain state.

## References

- [D75 adversarial review](../prds/sitestacker-parity/phase-24-d75-fresh-proof-clean-start-domain-claim-adversarial-review.md)
- [ADR-0193 — Primary and Redirect Site Domains](./0193-one-primary-site-domain-with-redirect-site-domains.md)
- [ADR-0195 — Owner-cleared Tenant domain disconnection](./0195-owner-cleared-tenant-domain-disconnection.md)
- [D8 — Site retirement](../prds/sitestacker-parity/phase-24-d8-site-retirement-adversarial-review.md)
- [D9 — Retired-address disposition](../prds/sitestacker-parity/phase-24-d9-retired-address-disposition-adversarial-review.md)
- [D10 — Issued Giving Address reservation](../prds/sitestacker-parity/phase-24-d10-issued-giving-address-reservation-adversarial-review.md)
- [ADR-0197 — Prepared same-Tenant Site Domain cutovers](./0197-prepared-same-tenant-site-domain-cutover.md)
- [D76 adversarial review](../prds/sitestacker-parity/phase-24-d76-prepared-same-tenant-site-domain-cutover-adversarial-review.md)
- [Shopify — Verify a domain to move it between stores](https://help.shopify.com/en/manual/domains/add-a-domain/connecting-domains/verify-domain-ownership)
- [Vercel — Claim domain ownership](https://vercel.com/docs/domains/working-with-domains/claim-domain-ownership)
- [Vercel — Domain ownership and project assignment](https://vercel.com/docs/domains/working-with-domains)
- [Vercel — Project-domain verification](https://vercel.com/docs/rest-api/reference/endpoints/projects/verify-project-domain)
- [Vercel — CLI domain force behavior](https://vercel.com/docs/cli/domains)
- [Vercel — Webhooks API](https://vercel.com/docs/webhooks/webhooks-api)
- [Cloudflare — Hostname validation](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/hostname-validation/)
- [RFC 8555 — ACME DNS challenge security](https://www.rfc-editor.org/rfc/rfc8555.html)
- [OWASP — Subdomain takeover prevention](https://cheatsheetseries.owasp.org/cheatsheets/Subdomain_Takeover_Prevention_Cheat_Sheet.html)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL — Row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [W3C — Clear Site Data](https://www.w3.org/TR/clear-site-data/)
- [W3C — Status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages)
