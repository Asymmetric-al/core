# Phase 24 D10 — Issued Giving Address Reservation Adversarial Review

> **Status:** Completed `/grill-with-docs` decision evidence for D10. This is
> not a Phase 24 PRD, OpenSpec change, implementation plan, migration
> authorization, or ticket specification.
>
> **Founder choice:** Permanently reserve the old Giving path. A successor must
> create and distribute a new Giving URL.
>
> **Review date:** 2026-08-26
>
> **Later D12 clarification:** Address route/presentation availability and
> new-gift admission are separate. D7, Designation, or financial admission may
> disable the CTA/checkout without hiding an otherwise eligible page or
> changing the address lifecycle.

## Final disposition

**Accept with required amendments.**

Permanent non-reuse is the safest answer for donor intent, attribution, and
financial interpretation. The original wording is directionally right but is
not precise enough to implement. A bare path such as `/give/well` has no safe
meaning without its admitted host, environment, normalization rules, route
owner, and history. Creating a tombstone only when a Site retires is also too
late: a missed alias or a concurrent publish could escape the reservation.

The permanent rule begins when Core first issues the public address. From that
moment, the exact Core-controlled address is permanently bound to its original
Giving-owned public-entry meaning. It may keep serving that same meaning while
all current Site, host, route, safety, and presentation checks pass. New-gift
admission remains independently owner-gated at its CTA/checkout boundary and
never remaps the address. The address can never be transferred or repurposed.
Site retirement makes every such address terminally unavailable and D9's
neutral `404` applies forever whenever the address routes through Core. A
successor must issue a different address.

This is a deliberate Core product invariant, not a claim that every nonprofit
platform permanently tombstones donation paths. Current provider evidence does
show that gift URLs and printed QR codes can persist indefinitely and carry
designation, amount, cadence, language, or campaign intent. No evidence gives
those external copies a trustworthy expiration date.

In plain language:

- Core protects the complete public address, not the word `give` everywhere;
- the same path on a genuinely different host remains a different address;
- query strings and fragments never make an old path reusable;
- staff can rename a private draft without consuming an address, but issuance
  permanently consumes it;
- an old Giving address cannot later serve Giving or ordinary content;
- there is no support, administrator, timer, or “same fund” override; and
- prior gifts and recurring commitments continue under their own owners.

## Evidence labels

- **Repository fact** — accepted ADR, OpenSpec requirement, PRD, glossary, or
  founder-ratified Phase 24 decision.
- **Current behavior** — code or schema on `develop`; it is migration evidence,
  not permanent product authority.
- **Proposed evidence** — open, unmerged Phase 22/23 work; informative but not
  governing.
- **External fact** — current primary standards, provider, security, privacy,
  or accessibility documentation.
- **Product judgment** — a deliberate Core choice inferred from the evidence.
- **Assumption** — a claim that still requires direct user or production proof.

## Corrected D10 decision — normative language

These clauses replace the draft D10 wording and MUST flow into the Phase 24
PRD, OpenSpec requirements, design, implementation tickets, tests, and release
evidence.

### D10-R1 — An issued address never acquires a different meaning

An **Issued Giving Address** is the exact Core-controlled public address Core
has successfully exposed for one immutable Giving-owned public-entry identity,
one Tenant, one originating environment, one Site, and one immutable Site
attribution context. From first public issuance, the address MUST NOT be
released, transferred, reassigned, or rebound, and it MUST NOT be redirected or
repointed to a different Site, Tenant, Giving entry, Designation, route purpose,
or public meaning.

The address MAY continue serving only the same immutable Giving entry while
every current Site, host, route, safety, and presentation check succeeds. D7,
Designation, and financial admission independently gate the new-gift CTA/
checkout and may render their unavailable notice without changing the address
lifecycle. If the immutable meaning needs a different address, Core issues a
new address; it never reinterprets the old one.

### D10-R2 — Address identity is exact and shared with the public resolver

The enforcement key is the canonical public origin and normalized path under
the exact versioned canonicalizer used by the trusted public resolver. The
origin includes scheme, normalized host, and effective port. The originating
environment remains immutable provenance but MUST NOT make the same externally
visible origin-and-path reusable in another environment. Every admitted
equivalent—such as an HTTP-to-HTTPS entry, host alias, locale route,
trailing-slash form, case/encoding equivalent, short link, deep link, or QR
target—MUST have an explicit allocation that resolves to the same safety
result.

Query strings, parameter order, browser fragments, cookies, bodies, headers,
and client state are not part of the reusable identity. `?amount=100`,
`?fund=well`, an empty query, and a fragment are all requests to the same
reserved host-and-path slot. Ambiguous IDNA, percent-encoding, slash, Unicode,
or control-character input is rejected before route selection; no second
Giving-specific normalizer may disagree with the public resolver.

The same normalized path on a genuinely different admitted origin is a
different address and remains independently eligible. The same external origin
and path is never made different merely by a deployment/environment label. A
bare slug is never globally reserved.

### D10-R3 — Issuance is the durable boundary

A private candidate or preview MAY be edited or discarded without consuming an
address. Private preview uses a distinct expiring non-public preview address;
it never exposes the candidate public URL. Copying, exporting, emitting to CMS
or email, creating a QR code, or otherwise exposing the shareable public URL
MUST first invoke the reviewed issuance command. Before that command returns
the address, Core MUST atomically record its allocation and immutable owner
meaning.

Public request logs, crawler traffic, analytics, arbitrary caller flags,
substring matching, and merely typing a candidate do not create authority.

The Giving route owner MUST maintain a finite, versioned manifest of every
issued canonical address and admitted alias. Retirement reads that manifest at
one proved revision; it does not attempt an unbounded discovery scan.

### D10-R4 — Lifecycle and valid transitions are explicit

The meaningful states are:

1. **candidate** — private and unallocated;
2. **issued/current** — permanently allocated to its original meaning while the
   exact route and eligible Site/Giving presentation may render;
3. **issued/unavailable** — temporarily unavailable because a reversible route,
   host, Site-presentation, or safety owner cannot currently serve that address;
   it may resume only for the exact original meaning; and
4. **issued/terminal** — permanently unavailable after Site retirement or an
   equally terminal source-owner disposition.

Allowed transitions are candidate to issued/current, issued/current to
issued/unavailable and back for the same meaning, and either issued state to
issued/terminal. Terminal has no outgoing transition. Changing the original
Tenant, Site, Giving identity, Designation binding, route purpose, or canonical
address is never an update; it requires a new allocation. Backdating cannot
alter the order.

A D7, Designation, Stripe, settlement, currency, bank, or other new-gift
admission failure alone does not change an otherwise presentation-eligible
address from issued/current. The page remains available with D7's owner-provided
**New online gifts are temporarily unavailable here** notice and no enabled new-
gift CTA/checkout.

### D10-R5 — Site retirement permanently tombstones Giving addresses

Committing Site retirement MUST atomically seal the lifecycle revision and
make every Issued Giving Address and admitted alias in that Site's proved
manifest terminal. A terminal address MUST remain unavailable to every future
Site, Tenant, environment, Giving entry, Designation, and ordinary route
purpose whenever the origin routes through Core.

Every request to that address receives D9's uniform privacy-safe `404` and may
create no redirect, rewrite, fallback, content, checkout, provider,
contribution, commitment, ledger, receipt, or attribution effect. A successor
Site MUST issue a newly available Giving address.

### D10-R6 — Loaded pages and mutation endpoints cannot bypass the address

The adverse address route/presentation checks run before CMS lookup, Default-
Site selection, middleware rewrite, cache selection, and content rendering.
D7, Designation, and source-owned financial checks run at their owning CTA,
checkout-admission, provider, and mutation boundaries; their failure disables
new Giving without suppressing otherwise eligible Site presentation. `GET`,
`HEAD`, prefetch, RSC/data, embed, QR/short-link, form submission, Site-addressed
callback/return, and Site-addressed API families cannot bypass an unavailable
or terminal address or derive a new admission from it. Shared signed provider
callbacks and independently authorized Donor Portal routes are not Issued
Giving Addresses; their owners still MUST reject any attempt to create a new
Site-public admission from a terminal address. Verified provider webhooks and
reconciliation for already-admitted durable business identities MAY append
their truthful owner-authorized outcomes through separate provider-owned
endpoints; they do not request the retired public address and never create a
new admission.

As later clarified by D12-R8/R9, checkout/payment owns two typed routes created
only after durable admission and distinct from the Issued Giving Address: an
exact-frozen-target provider handoff after session proof and a read-only,
nonredirectable result reader. Guest result transport applies the security
floor from
[ADR-0025: Producer-owned protected actions](../../adr/0025-producer-owned-protected-actions.md)
and
[ADR-0037: Scanner-resistant exact-artifact access](../../adr/0037-scanner-safe-exact-artifact-access.md):
existing purpose session or inert selector + independent 256-bit fragment
verifier + deliberate same-origin exchange, never a bearer-GET URL. It requires
the separate D12/Phase 13 anonymous-operation authority unless the exact Party/
contact is proved. Neither route can use the terminal address as successor/
fallback, start or repeat a gift, or reinterpret Site/Giving/financial meaning.

A browser that loaded a checkout before retirement MUST NOT start a new public
gift after the terminal fence. The final server command revalidates the exact
immutable Giving entry, issued-address generation, current host and route
heads, Site lifecycle, D7 admission, and all source-owned financial facts.
Untrusted query/body values never restore or select an address meaning.

### D10-R7 — Host rebinding and global tenant safety

An address allocation is globally unique across Core for its exact external
origin and normalized path; uniqueness is not scoped by environment, Tenant,
or Site. If a custom domain leaves Core, Core makes no claim about responses
while DNS or hosting points elsewhere. If the same origin later returns through
a freshly proved binding—even in another environment or for another Tenant—the
permanent allocation applies again before any new route is admitted.

A current verified host generation remains required to serve anything. The
historical allocation neither proves present domain ownership nor transfers a
Site. Cross-tenant availability responses MUST reveal only “available” or
“unavailable,” never the prior Tenant, Site, ministry, Designation, dates,
reason, actor, or usage.

**D75 clarification:** after D74 final release, every Tenant may use the ordinary
Add domain flow. A Core-owned seven-day exact-host DNS-control challenge is
consumed atomically with a new private binding generation and the global current
host claim; unproved attempts reserve nothing and old bindings are never
retargeted. The new binding receives no former positive meaning, but this D10
allocation is checked before CMS, static redirects, cache, Default Site, or any
new route owner. An unavailable path reveals no former owner or reason.

### D10-R8 — Giving and financial ownership remain independent

Giving owns the immutable public-entry identity, route-purpose classification,
Designation binding, admission, and final financial validation. Site supplies
presentation and attribution context only. D10 MUST NOT make Site or its
address own or select Legal Entity, Stripe account, Settlement Account Binding,
bank, settlement, accounting identity, money balance, or receipt identity.

Amount, cadence, currency, Source Code, return path, and similar link values
remain untrusted suggestions or attribution inputs that their source owners
revalidate and freeze separately for each admitted gift; they are not the
address's immutable Site attribution context. The address record stores no
Stripe secret or financial balance. Retirement and address terminality MUST
NOT cancel, transfer, rewrite, or reinterpret an existing contribution,
recurring commitment, installment, refund, dispute, receipt, statement, ledger
entry, or Donor Portal route.

### D10-R9 — One source of truth; no parallel redirect registry

The shared operational route/address authority in Asym Postgres owns the exact
allocation, canonical key, immutable history, current head, and terminal
disposition. Giving owns the public-entry meaning and supplies its finite route
manifest. The host/domain owner owns current verified binding generations.
Site Lifecycle supplies the retirement cause. The public runtime enforces the
joined current decision.

CMS, Payload, Next.js configuration, Vercel, DNS, Stripe, caches, analytics,
search, UI state, and request logs are presentation, execution, or evidence
only. None may allocate, clear, repoint, or override an Issued Giving Address.
D10 MUST extend the eventual shared typed public-route namespace; it MUST NOT
create a second Giving-only tombstone or redirect engine.

Phase 5's plain query parameters MAY remain untrusted transport suggestions,
but they MUST NOT define durable Giving-address identity. CMS/Web Studio MAY
author and display a link; it MUST NOT allocate, reassign, release, or redirect
an Issued Giving Address. These D10 requirements supersede conflicting Phase 5
A8/A12 ownership or generic-shareable-`/checkout` interpretations when the
contracts are reconciled.

Phase 13's issued `/s/<token>` address MAY remain current only for the identical
Giving public-entry meaning or become unavailable. Its destination MUST NOT be
“fixed” by repointing it to another Site, Designation, donor task, or stable
`source_code_id`. Source Code label, lifecycle, and reporting behavior remain
under the Source Code owner. A changed destination or stable source-code
identity receives a new token and QR. This D10 rule supersedes the conflicting
dynamic-destination interpretation when Phase 13 is reconciled.

### D10-R10 — Database invariants make invalid states unrepresentable

The permanent design MUST use append-only allocation/version facts and one
compare-and-set current head. It MUST structurally enforce:

- one globally unique canonical collision identity for each external origin
  and path across Core, with the originating environment retained only as
  provenance;
- immutable original Tenant, Site, Giving-entry, route-kind, canonicalizer
  version, privacy-minimized collision key/fingerprint, and first-issued facts;
- no head whose owner or purpose differs from its historical allocation;
- same-scope composite foreign keys for Site, host generation, Giving entry,
  command, receipt, audit, and outbox;
- `ON DELETE RESTRICT` for enforcement and history relationships;
- terminal monotonicity and at most one current head; and
- equality-leading indexes for request lookup, occupancy, current heads, and
  bounded owner manifests.

Privacy-sensitive display metadata MAY be redacted or disposed under its
source owner's schedule while the minimum non-enumerating collision identity
and required business evidence remain. Human-readable host/path display data
is separately purpose-owned unless an accepted retention contract proves it is
required business evidence. Canonicalizer upgrades require dual-version
collision proof and a quarantined backfill before activation.

### D10-R11 — RLS and authorization do not trust the caller

Anonymous and authenticated Data API roles MUST have no direct mutation grant
on address allocation, history, heads, receipts, audit, or outbox. Applicable
tables use `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`, with
`SELECT`/`DELETE` policies using `USING`, `INSERT` policies using `WITH CHECK`,
and `UPDATE` policies using both, plus immutable-scope enforcement.
Append-only allocations, history, receipts, audit, and outbox expose no direct
`UPDATE`/`DELETE` grant or policy.

Only one server-owned command may allocate or terminalize an address. It
derives Tenant, environment, Site, Giving entry, actor, capability, assignment,
assurance, host/route heads, and command meaning from trusted current context,
never caller-supplied authority fields. Service-role, table-owner, worker,
import, and support paths repeat every invariant. Any `SECURITY DEFINER`
function uses schema-qualified objects, a pinned empty `search_path`, least
privilege, and poison tests. An update cannot move an allowed row into a
forbidden scope.

Authorized same-Tenant staff may inspect their own clean issued-address
history. Cross-Tenant and insufficiently authorized callers receive the same
non-enumerating result.

### D10-R12 — Commands are atomic, concurrent, and semantically idempotent

Allocation or retirement commits the allocation/head, lifecycle or route
revision, durable audit, receipt, and outbox in one short transaction with no
network call while locks are held. It compare-and-sets the exact expected Site,
host, route, Giving-entry, and manifest heads. Concurrent publish, rename,
host-rebind, retirement, and successor activation produce one winner; every
loser reloads current state and cannot infer availability.

Semantic idempotency binds the exact canonical candidate, expected heads, Site,
Giving entry, actor authority, and command meaning. Same key and same meaning
return the original durable receipt. Reusing a key with changed meaning
conflicts. If allocation commits but the response or QR generation is lost, a
retry returns the same address and regenerates only the derived artifact; it
does not consume a second address.

### D10-R13 — Uncertainty fails safely and remains diagnosable

If host, route, address, lifecycle, safety, or Giving authority is unavailable,
timed out, corrupt, divergent, or outcome-unknown, new address activation and
new checkout admission MUST fail closed. Public requests receive D9's neutral
no-store `503` with `Retry-After` when known, not “available,” a redirect, a
guessed `404`, or cached content.

A confirmed terminal address receives D9's neutral `404`. Provider, DNS, CDN,
QR, email, export, and cache failures never weaken the local tombstone. Durable
effects retry from the outbox; ambiguous provider success is reconciled by
readback under ADR-0015. The kill switch disables new positive allocations and
admissions while preserving existing allocations, terminal facts, and adverse
public responses.

### D10-R14 — Permanent enforcement does not mean permanent personal data

The allocation retains only the minimum canonical collision identity,
immutable owner identifiers, state, revision, command/receipt references, and
proof needed to enforce non-reuse and audit the business decision. It MUST NOT
retain raw queries, fragments, donor data, amounts, card/payment details,
secrets, unrestricted request logs, copied Page content, or unnecessary
missionary/campaign names.

Authorized display metadata, link-placement evidence, analytics, and names
remain separately owned, purpose-limited, access-controlled, and subject to
documented retention, hold, correction, redaction, anonymization, export, and
verified-disposal rules. Public errors, logs, traces, alerts, and metrics are
non-enumerating and use bounded dimensions.

### D10-R15 — Staff see the consequence before issuance and retirement

Before first public issuance, the full-address review MUST say in equivalent,
comprehension-tested language:

> **Make this Giving address public?**
>
> Once public, this exact address is permanently tied to this Giving entry and
> cannot be edited or reused for another Site or Giving purpose. Review the
> donor preview before publishing. A later change requires a new address.
>
> If this Site is retired, the address will stay unavailable to future Core
> Sites. While this domain routes through Core, visitors will see Page not
> found. If DNS or hosting moves elsewhere, Core cannot control what it shows.

A generic or root address receives an additional plain blast-radius warning.
The final action is **Make Giving address public**; **Back** receives initial
focus. A private candidate remains editable until this command succeeds. The
review shows the exact full URL, Site, owner-approved public Giving label,
locale, and donor preview, with **Preview as donor** available before the final
action.

A root candidate uses this additional copy:

> **This permanently uses the domain's home page**
>
> Once public, this home-page address stays tied to this Giving entry. Changing
> the Giving URL or retiring the Site later leaves the home page unavailable to
> any different Core page or gift. Use a more specific Giving address unless
> you intend that permanent result.

Later domain activation MUST perform the same privacy-safe root occupancy
check. An unauthorized or different-Tenant actor sees only **This domain can't
be used for a Core website. Use another domain.** It never reveals the prior
use.

The D8 review at **Site settings → Lifecycle** MUST also include a
consequence-first section:

> **Giving links that will stay unavailable**
>
> 4 Giving links used by this Site will stay unavailable to future Core Sites.
> While their domains route through Core, visitors will see Page not found. A
> future Site must use new Giving links. Existing recurring gifts are not
> changed.
>
> Core can list links it issued, but it cannot find every printed card,
> screenshot, old email, or link on another website. If DNS or hosting moves
> elsewhere, Core cannot control what those addresses show.

The authorized view shows a complete count at one manifest revision, grouped by
domain, locale, status, public interval, Core-managed placement evidence, and
whether the URL is Core- or provider-controlled. Clean full URLs appear only
under the current need-to-know display capability and retention basis;
safety-restricted or disposed display metadata uses its source-owned redacted
label and opaque reference without reconstruction. Query values and donor data
are omitted; the UI explains that all query variants are covered. Each Core
address says **Will be reserved permanently in Core**.

Actions are **Download link list**, **Review places to update**, and **Copy
link-replacement checklist**. The checklist names website buttons, CMS blocks,
email templates, social profiles, ads, short links, QR codes, and printed
materials. It labels discovered placements **Known in Core** and never claims
to have found off-platform copies. There is no per-link confirmation checkbox,
typed-name ritual, override, redirect, release, or false “all links updated”
attestation.

If the authoritative manifest is stale, truncated, or unknown, the review says
**Giving link history needs review — retirement cannot finish yet**, disables
the final command, and links to one cause-owned repair. A spinner, zero count,
or staff guess is not completeness evidence.

### D10-R16 — Creating the successor URL is guided recovery, not a dead end

The new Giving setup shows the full origin and path, clearly labels which parts
staff may edit, and performs fast advisory availability checking followed by
one authoritative recheck on the final command. The typed value remains in the
field when blocked. Same-Tenant staff with history permission see:

> **This Giving URL can't be used**
>
> It was used before and is permanently protected in Core so an old bookmark
> or QR code cannot start a different gift. Choose a new Giving address.

Cross-Tenant or unauthorized staff see only:

> **This Giving URL isn't available. Choose another.**

Core offers two or three currently available, human-readable full-URL
suggestions derived only from owner-approved public-safe successor fields,
never missionary/member-care/internal/restricted names. If public safety is
unknown, suggestions use a neutral label and explain why. Selecting one fills
the field and preview; it does not publish automatically. The final existing
publish/review step remains explicit. After successful issuance, a persistent
receipt provides **Copy Giving link**, **Download QR code**, **Test as a
donor**, and **Review places to update**.

The form uses semantic labels, linked inline error and error summary, visible
focus, `aria-invalid`/`aria-describedby`, first-error focus, polite `aria-live`
availability status, keyboard operation, preserved input, and server errors
that point to the next action. It qualifies at 320 CSS pixels, 200%/400% zoom,
forced colors, RTL, long Unicode/IDN addresses, localized `Intl` dates, no
JavaScript where practical, and low bandwidth. Color and toast are never the
only state signal.

### D10-R17 — Public, donor, and missionary surfaces stay simple

The old public address uses only D9's tiny platform-neutral **Page not found**
response. It offers no successor, search, homepage, donation choice, Portal
link, branding, reason, or automatic navigation. It never reveals that a
Tenant, Site, missionary, campaign, fund, or Giving relationship existed.

The Donor Portal continues to show authorized existing gifts and recurring
commitments through its independent routes. It does not advertise or reconstruct
the retired public address. Missionary surfaces may show only authorized
replacement-work status; they cannot allocate, override, repoint, or infer
restricted history.

### D10-R18 — Cleanup, operations, performance, and observability are bounded

Safety is automatic; staff are not required to prove removal of every external
copy. Core MAY show authorized aggregate request counts for an old address to
help prioritize cleanup, but never raw queries, donor identity, IP address, or
cross-Tenant detail. **Old web addresses** shows **Reserved permanently in Core
— while this domain routes through Core, old visitors see Page not found.
Create and share a new Giving URL.**

Public lookup is an indexed exact-key/current-head operation; it performs no
history scan, graph traversal, provider call, or text match. Staff lists use
keyset pagination and bounded owner manifests. Phase 24 MUST declare and test
supported counts for addresses, aliases, locales, hosts, concurrent commands,
and effect backlog before release. Authorized human issuance uses declared
per-Site and per-host rate/capacity limits and anomaly detection so a mistaken
or compromised tenant cannot irreversibly consume a namespace. Business audit/
receipts are distinct from technical logs/traces, and every command/effect
carries safe scope, causation, correlation, revision, attempt, and outcome.

### D10-R19 — Migration and rollout are adverse-first and forward-only

Implementation is blocked until Phase 5/13 and the open Phase 22/23 route
contracts are reconciled into one accepted typed route/address authority.
Rollout then MUST:

1. define the immutable Giving public-entry identity and owner-produced route
   manifest;
2. expand allocation/history/head/RLS/grant/audit/receipt/outbox structures;
3. inventory current `/give`, `/donate`, `/checkout`, short/QR links, locale and
   host aliases, embeds, CMS/email outputs, and provider-owned links;
4. backfill only addresses proved publicly issued from authoritative
   configuration, version, publication, export, or artifact evidence;
5. quarantine ambiguous legacy collisions and block conflicting activation;
   raw traffic alone never proves issuance;
6. deploy and prove every public and mutation reader/fence before enabling any
   new allocation or terminal writer;
7. make every Site/domain activation test all required public routes—especially
   `/`—against adverse allocations and block with generic guidance when any
   required route is reserved;
8. remove host-blind/static redirects and mutable short-link repointing;
9. shadow-probe canonical forms, tenants, hosts, methods, caches, regions, and
   stale checkouts, then enable bounded cohorts; and
10. roll forward after any permanent allocation. Rollback may stop new positive
    commands but MUST NOT release a slot or disable terminal enforcement.

Old adverse-blind code cannot coexist after allocation or retirement writers
are enabled. An ambiguous legacy host remains blocked from conflicting Giving
activation until its owner evidence is reconciled; Core never guesses that a
missing historical row means the address is free.

### D10-R20 — Deliberate non-goals

D10 does not add a generic URL-tombstone DSL, wildcard or regex reservation,
Internet crawler, request-log-derived authority, task per stale link, automatic
replacement, public choice page, whole-domain blacklist, time-limited release,
support/admin override, “same fund” exception, mutable QR destination,
provider-owned URL authority, bulk/scheduled/autonomous issuance, generic
workflow engine, or new financial identity. The precise successor URL shape
remains the next founder decision.

## Best staff UX/UI path

The experience is one guided path through a permanent safety rule:

```text
Retire Site
  → Review Giving links that will stay unavailable
  → Download list and replacement checklist
  → Retire and receive a durable receipt
  → Create successor Giving URL
  → If unavailable, understand why and choose a safe suggestion
  → Preview as donor, publish deliberately, copy link, download QR
```

The system does not ask staff to understand tombstones, canonicalization,
HTTP status codes, route generations, or RLS. It tells them the consequence,
what Core protects automatically, what Core cannot discover, and the next
useful action.

### Concrete tenant and donor experience

Hope Missions retires a Site that used:

```text
https://give.hope.org/give/well?amount=100
```

The review says:

> **2 Giving links will stay unavailable**
>
> While this domain routes through Core, old visitors will see Page not found.
> Existing recurring gifts are not changed. Download the list to update website
> buttons, emails, and QR codes.

Later, staff enter `/give/well` for the successor. Core preserves the field and
says:

> **This Giving URL can't be used**
>
> It was used before and is protected so an old QR code can't start a different
> gift. Choose a new address.

Core offers `https://give.hope.org/support/clean-water-2027` and two other
available choices. Staff select one, preview the donor experience, publish it,
copy the new link, and download a new QR code. While the domain routes through
Core, a donor scanning an old card sees the neutral D9 **Page not found**
response. Core transfers neither
the `$100` suggestion nor the Well Project, Site, currency, Source Code, or
payment-provider meaning. Existing recurring gifts continue unchanged.

## Adversarial category review

The founder's safety goal survives every category. Each material concern below
is a defect in an unqualified “reserve the path” implementation, not a reason
to permit reuse. The exact D10 clauses are the required corrections.

### 1. Problem validity, necessity, and alternatives

**Material concern exists in the unamended answer.**

| What could go wrong and why it matters                                                                                                                   | Severity / likelihood  | Evidence and reasoning                                                                                                                                                                                              | Effect on the answer                          | Permanent correction and exact language                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| D9 blocks redirects but a successor publishes the identical host and path directly. An old QR then starts a different gift without any visible redirect. | Critical / Medium-High | **Repository fact:** D9 deliberately leaves direct address reuse for D10. **External fact:** Stripe says Payment Link QR codes do not expire; Blackbaud documents gift URLs carrying designation and amount intent. | Confirms the root decision.                   | **D10-R1** and **D10-R5**: first issuance permanently binds the address; retirement makes it terminal and the successor must use a new one. |
| A time-limited hold releases the path after an arbitrary year, although printed cards, saved messages, and bookmarks have no proved expiration.          | Critical / Medium      | **External fact:** Google migration timing is search guidance, not evidence that financial-intent links disappear. Stripe QR codes may persist.                                                                     | Rejects the strongest flexible alternative.   | **D10-R4–R5** make terminal non-reuse timeless inside Core. No timer or inactivity rule releases it.                                        |
| A neutral choice page appears helpful but confirms a relationship, prolongs stale links, and asks the donor to reinterpret a gift.                       | High / Medium          | **Repository fact:** D9 chose non-enumerating absence and forbids moving Giving intent.                                                                                                                             | Rejects option 2.                             | **D10-R17** retains D9's neutral `404` with no successor or Giving choice.                                                                  |
| “Reserve `/give`” is interpreted across every domain, burning unrelated URLs and creating a global blacklist.                                            | High / High            | **External fact:** RFC 9110 associates URI meaning with its origin; the same path on another origin is a different resource namespace.                                                                              | Narrows, but does not invalidate, the choice. | **D10-R2** reserves the exact external origin and normalized path across Core; a different origin remains independently eligible.           |

The strongest plausible alternative is a time-limited reservation followed by
an explicit donor restart page. It is easier for staff, but it cannot prove an
old financial-intent link has expired and conflicts with D9's privacy decision.
Permanent exact-address non-reuse is the simpler safe invariant.

### 2. Brittleness

**Material concern exists.**

| What could go wrong and why it matters                                                                                      | Severity / likelihood  | Evidence and reasoning                                                                                                                                                                    | Effect on the answer                                      | Permanent correction and exact language                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Case, slash, locale, IDNA, port, encoding, HTTP, host alias, short-link, or QR variants bypass a string-equality tombstone. | Critical / High        | **Repository fact:** public routing spans hosts, aliases, locales, and route families. **External fact:** URI normalization has component-specific rules; ad hoc canonicalizers disagree. | Changes the identity definition.                          | **D10-R2** uses the trusted public resolver's versioned canonicalizer and explicitly allocates every admitted router-equivalent form. Ambiguous input rejects. |
| Retirement discovers links by scanning current CMS or traffic and misses an old exported address.                           | Critical / Medium-High | **Product judgment:** absence from current configuration or logs cannot prove a public URL was never issued.                                                                              | Changes when the invariant begins.                        | **D10-R3** records the allocation before first exposure and maintains a finite source-owner manifest. Retirement consumes that manifest, not analytics.        |
| A host leaves Core and later returns under another tenant, bypassing tenant-scoped history.                                 | Critical / Medium      | **Repository fact:** D8/D9 require fresh domain proof and clean binding generations.                                                                                                      | Makes address occupancy global for the exact origin/path. | **D10-R7** reapplies the allocation whenever the origin returns through Core without treating history as current domain proof.                                 |

### 3. Technical debt

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                       | Severity / likelihood  | Evidence and reasoning                                                                                                                                                                                   | Effect on the answer                                 | Permanent correction and exact language                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Giving builds a private tombstone table while Phase 22/23, Next.js, CMS, and Vercel maintain separate route truth. Drift makes a supposedly blocked address routable.        | Critical / High        | **Current behavior:** host-blind redirects exist in `apps/donor/next.config.ts`; no operational Site/address schema exists. **Proposed evidence:** Phase 22/23 already proposes a typed route authority. | Changes the architecture; does not weaken non-reuse. | **D10-R9** requires one shared typed operational route/address authority and forbids a second Giving redirect engine.                                                                                         |
| The permanent shareable link remains generic `/checkout?...`, so retiring one gift meaning burns `/checkout` for the entire host and financial identity stays query-coupled. | High / High            | **Current behavior:** `checkout-designations.ts` and the donor checkout read fund, worker, amount, and frequency from query parameters.                                                                  | Requires a future-safe shareable seam.               | **D10-R2**, **D10-R6**, and **D10-R19** require path-distinct issued Giving identity plus server revalidation; generic checkout may remain an internal implementation route, not the durable public identity. |
| A mutable `/s/<token>` is called “fixable” and silently repointed after printing.                                                                                            | Critical / Medium-High | **Repository fact:** Phase 13 D14b proposes dynamic short links, but source-code history is separate from destination identity.                                                                          | Narrows Phase 13.                                    | **D10-R1** and **D10-R4** permit an issued token only for the same immutable meaning or `404`; a different meaning requires a new token and QR.                                                               |

### 4. Edge cases

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                               | Severity / likelihood | Evidence and reasoning                                                                                                                                                                  | Effect on the answer                       | Permanent correction and exact language                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A root Giving route, generic `/give`, locale alias, alternate host, embedded form, short link, or already-open checkout behaves differently from the canonical page. | Critical / High       | **Repository/current fact:** current route families include static redirects, checkout queries, and proposed short links; Blackbaud documents embedded forms surviving form retirement. | Broadens enforcement to every effect path. | **D10-R2**, **D10-R5**, and **D10-R6** cover explicit aliases, request families, stale pages, and final mutation admission.                                                                                 |
| A domain is sold, expires, leaves Core, or returns; stale browser/CDN/service-worker state persists.                                                                 | Critical / Medium     | **Repository fact:** historical binding never proves present ownership and cache tags do not isolate.                                                                                   | Clarifies the control boundary.            | **D10-R7** limits the guarantee to requests through Core and reapplies history after fresh binding; **D10-R13** keeps adverse state ahead of cache.                                                         |
| A canonicalizer upgrade makes two old spellings collide or one old address appear new.                                                                               | Critical / Low-Medium | **External fact:** Unicode/IDNA and percent-encoding rules evolve and implementations differ.                                                                                           | Adds an upgrade contract.                  | **D10-R10** requires dual-version collision proof, quarantined backfill, and no favorable default on ambiguity.                                                                                             |
| A Giving address is renamed before retirement.                                                                                                                       | High / Medium         | **Product judgment:** staff need corrections without repointing donor intent.                                                                                                           | Defines rename behavior.                   | Under **D10-R4**, a new name creates a new allocation. The old address may continue only as an alias to the exact same immutable entry while active, or become unavailable; retirement makes both terminal. |

### 5. Footguns

**Material concern exists.**

| What could go wrong and why it matters                                                                                               | Severity / likelihood  | Evidence and reasoning                                                                                                                               | Effect on the answer                         | Permanent correction and exact language                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A support/admin override, direct SQL update, import, automation, or “same fund” checkbox releases the address.                       | Critical / Medium-High | **Repository fact:** platform permissions reject ambient support authority; Site and Designation do not prove Legal Entity or donor-intent sameness. | Removes every release path.                  | **D10-R1**, **D10-R11**, and **D10-R20** make reassignment unrepresentable and forbid an override.                                                             |
| The setup form auto-picks and publishes a suggestion after a conflict. Staff may distribute an unintended or culturally awkward URL. | High / Medium          | **Current UX guidance:** destructive/permanent outcomes need explicit review, specific actions, preserved input, and understandable errors.          | Changes the recovery UX.                     | **D10-R16** offers selectable live-checked suggestions but never auto-publishes; full preview and the ordinary final review remain explicit.                   |
| Staff check “all links updated” even though Core cannot inspect paper, screenshots, or third-party sites.                            | Medium / High          | **Product judgment:** a ceremonial attestation creates false confidence and support blame.                                                           | Removes a misleading control.                | **D10-R15** labels known Core placements, provides a checklist/export, and explicitly forbids unverifiable completion claims.                                  |
| A compromised tenant mass-publishes paths to poison a future domain namespace.                                                       | Critical / Low-Medium  | **Security inference:** permanent allocation is a scarce irreversible resource; ordinary rate abuse becomes durable denial of use.                   | Adds admission controls without an override. | **D10-R3**, **D10-R11**, and **D10-R18** require authorized human issuance, declared caps/anomaly detection, and no bulk, scheduled, or autonomous claim path. |

### 6. Tenant safety

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                           | Severity / likelihood | Evidence and reasoning                                                                                                        | Effect on the answer               | Permanent correction and exact language                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| A tenant-scoped uniqueness constraint allows Tenant B to reuse Tenant A's old address after custom-domain transfer.              | Critical / Medium     | **Repository fact:** ADR-0028 requires structural public isolation; current domain ownership can change.                      | Changes uniqueness scope.          | **D10-R7** uses global occupancy for the exact external origin/path across environments while retaining tenant-scoped owner metadata.   |
| Availability errors reveal the former tenant, missionary, campaign, dates, or reason to a new domain owner.                      | Critical / Medium     | **Repository fact:** D9 requires non-enumerating public absence; sensitive missionary relationships may create physical risk. | Narrows staff-visible detail.      | **D10-R7**, **D10-R11**, and **D10-R14** expose only generic unavailable cross-tenant; exact history is authorized and same-scope only. |
| Cache keys omit environment, host generation, Site, or route head and serve another tenant's content before the tombstone check. | Critical / Medium     | **Repository fact:** ADR-0030 says invalidation tags do not isolate cache entries.                                            | Adds a public runtime requirement. | **D10-R6**, **D10-R7**, and **D10-R13** place exact current scope and adverse state before cache selection.                             |

### 7. Database, RLS, and authorization safety

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                      | Severity / likelihood  | Evidence and reasoning                                                                                                                                       | Effect on the answer                 | Permanent correction and exact language                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A mutable scope column, tenant-local key, cascade delete, or two current heads permits reassignment or erases the proof needed to block it. | Critical / Medium-High | **External fact:** PostgreSQL constraints are the durable place for uniqueness, referential integrity, and transaction ordering.                             | Requires structural data invariants. | **D10-R10** specifies append-only versions, one CAS head, global canonical-key uniqueness, same-scope FKs, `ON DELETE RESTRICT`, terminal monotonicity, and equality-leading indexes.            |
| A policy has only `USING`, so an allowed update moves a row into another Tenant/Site; table owners or service role bypass RLS.              | Critical / Medium      | **External fact:** PostgreSQL/Supabase separate row visibility from insert/update checks, and privileged roles can bypass ordinary RLS.                      | Adds full privileged-path proof.     | **D10-R11** requires grants, `FORCE RLS`, operation-appropriate `USING`/`WITH CHECK`, no direct mutation of append-only rows, immutable scope, and invariant repetition for service/owner paths. |
| Caller fields choose Tenant, actor, Site, Giving entry, approval, or historical owner.                                                      | Critical / Medium-High | **Repository fact:** trusted server context and current capabilities are platform invariants.                                                                | Changes the command boundary.        | **D10-R11** derives all authority/scope from trusted context and accepts only non-authoritative candidate input.                                                                                 |
| Permanent raw path retention exposes a sensitive missionary or project name forever.                                                        | High / Medium          | **Repository fact:** ADR-0038 says purpose-owned retention, not blanket immortality. **External fact:** ICO storage limitation requires only justified data. | Narrows retained data.               | **D10-R10** and **D10-R14** separate minimum collision enforcement from redactable display metadata and forbid queries/donor data.                                                               |

### 8. Overengineering

**Material concern exists.**

| What could go wrong and why it matters                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                      | Effect on the answer           | Permanent correction and exact language                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| The team builds a generic URL reservation language with wildcards, priorities, schedules, releases, crawl discovery, and exception workflows. | High / High           | **Product judgment:** D10 needs one exact invariant, not a general routing product. More expressive states create more unsafe combinations. | Narrows implementation scope.  | **D10-R9** adds one typed Giving allocation to the shared route authority; **D10-R20** explicitly excludes the generic engine and release workflow. |
| Core tries to discover every external copy or creates one task for every stale request.                                                       | Medium / High         | **External fact:** printed QR codes and off-platform links are not enumerable by Core.                                                      | Keeps operations proportional. | **D10-R15** and **D10-R18** provide an honest checklist, aggregate signals, and cause-owned exceptions only.                                        |
| The spec freezes a cryptographic hash/HMAC format or a final URL slug shape before route design is reconciled.                                | Medium / Medium       | **Product judgment:** the invariant requires a privacy-minimized exact collision key, not one implementation.                               | Defers unnecessary detail.     | **D10-R10** specifies properties and canonicalizer migration; **D10-R20** leaves successor URL shape for D11.                                       |

### 9. UX/UI and user friction

**Material concern exists and is release-blocking for staff rollout.**

| What could go wrong and why it matters                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                      | Effect on the answer                                    | Permanent correction and exact language                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Staff learn about permanent loss only after retirement or receive a bare “slug taken” error with no reason or recovery.       | High / High           | **External fact:** WCAG error-identification and error-suggestion guidance requires clear text and known correction.                        | Adds consequence-first review and guided recovery.      | **D10-R15–R16** require a pre-issuance warning, count/list before retirement, plain explanation, preserved input, and 2–3 safe suggestions.                                                                              |
| Technical terms such as tombstone, canonical path, `404`, or route generation make staff unsure whether recurring gifts stop. | High / High           | **Product judgment:** the user task is replacing links, not managing routing internals.                                                     | Changes user-facing language.                           | **D10-R15** uses “Giving links that will stay unavailable,” says old visitors see Page not found, and explicitly says recurring gifts are unchanged.                                                                     |
| An async availability check flickers, loses input, is color/toast-only, or passes advisory validation but races on submit.    | High / Medium-High    | **Current Vercel interface guidance/WCAG:** controls need labels, inline errors, visible focus, status announcements, and server authority. | Adds accessible behavior and final recheck.             | **D10-R16** specifies preserved input, linked error semantics, `aria-live`, mobile/zoom/RTL/IDN/low-bandwidth behavior, and authoritative submit-time CAS.                                                               |
| A full URL list leaks restricted names or raw gift parameters, while hiding all detail makes cleanup impossible.              | Critical / Medium     | **Repository fact:** staff authority and sensitive-worker visibility differ; Source Code/amount query values are separate facts.            | Requires an authorized, clean inventory.                | **D10-R14–R15 as clarified by D12:** show full clean base addresses only with current need-to-know/retention authority, otherwise safe/redacted labels; omit query/donor data and preserve hidden collision enforcement. |
| Suggestions optimize prettiness but produce confusing, inaccessible, culturally unsafe, or already-taken addresses.           | Medium / Medium       | **Assumption:** no direct Core usability study yet proves the suggested interaction.                                                        | Does not weaken the invariant; blocks GA qualification. | **D10-R16** requires human-readable, live-checked, selectable suggestions and full preview; the proof matrix requires representative staff comprehension testing.                                                        |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                                                  | Severity / likelihood | Evidence and reasoning                                                                                                                          | Effect on the answer                 | Permanent correction and exact language                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site, CMS, Giving, route tables, and providers each claim ownership of the address or its financial meaning. A repair in one system silently disagrees with the others. | Critical / High       | **Repository fact:** platform boundaries separate operational, CMS, public, and financial authority; ADR-0044 separates legal/payment identity. | Defines a single ownership matrix.   | **D10-R8–R9** give route allocation to shared operational authority, Giving meaning/admission to Giving, host proof to Domain, retirement cause to Site Lifecycle, and execution only to providers/CMS. |
| A read model, export, analytics row, Stripe Payment Link, QR record, or cache entry becomes write authority.                                                            | Critical / Medium     | **Repository fact:** business truth and projections/evidence are distinct.                                                                      | Adds an explicit negative invariant. | **D10-R3**, **D10-R9**, and **D10-R12** allow allocation only through one transactional source-owner command.                                                                                           |
| “Same designation” is treated as the same donor promise even if Site presentation, legal disclosure, currency, source, or provider context differs.                     | Critical / Medium     | **Repository fact:** Site, Designation, Source Code, Entry Method, Legal Entity, and Settlement Account Binding are separate axes/owners.       | Rejects financial-equivalence reuse. | **D10-R1** permanently binds original public meaning; **D10-R8** keeps every financial fact under its source owner and forbids a same-fund exception.                                                   |

The invariants are therefore: one allocation per exact address key; one
original meaning per allocation; no owner/purpose mutation; terminal never
reopens; current serving requires every owner to admit; and historical money
and attribution never move merely because an address changes state.

### 11. Hidden coupling

**Material concern exists.**

| What could go wrong and why it matters                                                                                                         | Severity / likelihood  | Evidence and reasoning                                                                              | Effect on the answer                                      | Permanent correction and exact language                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public address identity is coupled to query-controlled amount, worker, fund, cadence, Source Code, or generic checkout implementation details. | Critical / High        | **Current behavior:** the current checkout builder/page use query parameters as the shareable seam. | Requires an architectural seam before D10 implementation. | **D10-R2**, **D10-R6**, and **D10-R19** require a path-distinct immutable Giving entry and source-owned revalidation of all query/body suggestions.                     |
| Site retirement directly deactivates Stripe links, cancels recurring gifts, or owns provider reconciliation.                                   | Critical / Medium      | **Repository fact:** D1/D7/D8 and ADR-0044 keep Site separate from financial/provider identity.     | Explicitly narrows retirement effects.                    | **D10-R8** makes terminal address state a public admission effect only; contributions, commitments, Legal Entity, settlement, and providers remain independently owned. |
| Route safety depends on Next.js middleware order or one Vercel configuration rather than the platform boundary.                                | Critical / Medium-High | **Current behavior:** static `/give` and `/donate` redirects bypass future Site/Giving authority.   | Requires removal/reconciliation.                          | **D10-R6**, **D10-R9**, and **D10-R19** enforce before framework/provider effects and remove adverse-blind rules before cutover.                                        |

### 12. Failure modes

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                             | Severity / likelihood | Evidence and reasoning                                                                                                                        | Effect on the answer                                | Permanent correction and exact language                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The allocation authority is down and the router treats the path as free, falls through to CMS, or serves a cached successor page.                  | Critical / Medium     | **Repository fact:** ADR-0028 and D9 require fail-closed public resolution; unknown is not absent.                                            | Adds an explicit outage result.                     | **D10-R13** blocks positive activation/admission and returns neutral no-store `503`; any favorable fallback is forbidden.                                                      |
| Retirement commits while an alias manifest is incomplete, so one old QR still works.                                                               | Critical / Medium     | **Repository fact:** D8 treats stale, truncated, or unknown dependency evidence as a blocker.                                                 | Adds a retirement precondition.                     | **D10-R3**, **D10-R5**, and **D10-R15** require one proved manifest revision; unknown shows a cause-owned blocker, never a false zero.                                         |
| The address claim commits but the response, QR, export, or email effect fails. A blind retry consumes another URL or produces inconsistent assets. | High / Medium-High    | **Repository fact:** durable receipts/outbox and ADR-0015 provider-unknown handling are accepted patterns.                                    | Separates authoritative write from derived effects. | **D10-R12–R13** return the original receipt on semantic replay and regenerate derived artifacts idempotently.                                                                  |
| A provider-hosted form or Payment Link remains active after the Core Site address is safe. Staff think “retired” stopped all Giving.               | Critical / Medium     | **External fact:** Blackbaud says embedded forms can remain usable after form retirement; Stripe deactivation/reactivation is provider-owned. | Clarifies independent containment.                  | **D10-R8**, **D10-R9**, and **D10-R15** distinguish Core-controlled versus provider-controlled links and route provider work to Giving without weakening the Core reservation. |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                                                                | Severity / likelihood  | Evidence and reasoning                                                                                                | Effect on the answer                    | Permanent correction and exact language                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A claim is created only at retirement and races with a publish, rename, host rebind, D7 resume, or successor activation. Two individually valid operations jointly reuse the address. | Critical / High        | **Repository fact:** D7/D8 use current-head fencing and semantic idempotency for favorable/adverse transitions.       | Moves claim creation to first issuance. | **D10-R3**, **D10-R4**, and **D10-R12** define the state machine, shared expected heads, one CAS winner, and current-state review for losers.                                                                                       |
| A late job, backdated import, reordered event, or stale browser applies an earlier favorable state after terminality.                                                                 | Critical / Medium-High | **Repository fact:** server effective order and monotonic terminal facts outrank caller timestamps.                   | Adds temporal monotonicity.             | **D10-R4**, **D10-R6**, and **D10-R10** prohibit outgoing terminal transitions and revalidate current heads at the final effect boundary.                                                                                           |
| An idempotency key is tied only to one HTTP request, so the same business action creates multiple claims or a changed action reuses a receipt.                                        | High / Medium          | **Repository fact:** Core's durable-effect idempotency binds semantic meaning, not transport.                         | Changes replay semantics.               | **D10-R12** binds canonical address, Site, Giving entry, expected heads, actor authority, and command meaning; changed meaning conflicts.                                                                                           |
| A reversible D7/new-gift pause is mistaken for address unavailability or terminal retirement, hiding the otherwise eligible page.                                                     | High / High            | **Repository fact:** D7 pause is reversible, keeps the website online, and is independent of address/Site retirement. | Separates page and new-gift state.      | **D10-R4/R6 as clarified by D12:** the address stays current and renders the owner-provided unavailable CTA notice; only a route/presentation owner uses unavailable-to-current, and only a terminal owner removes the return path. |

### 14. Data integrity risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                              | Severity / likelihood | Evidence and reasoning                                                                                                                | Effect on the answer                       | Permanent correction and exact language                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Equivalent spellings receive duplicate rows or different results; missing aliases create false availability.                                                        | Critical / High       | **External fact:** URI/IDNA/encoding behavior is nuanced; double decoding and component confusion are common sources of routing bugs. | Requires one conformance contract.         | **D10-R2** and **D10-R10** use the resolver canonicalizer/version, explicit aliases, global uniqueness, and collision-quarantine upgrades.                               |
| Migration invents a historical claim from `isActive=false`, a 404 log, a crawler hit, or a current redirect. Legitimate future addresses become permanently locked. | High / Medium-High    | **Current behavior:** Core lacks operational Site/address history; current flags cannot prove past public Giving issuance.            | Narrows backfill evidence.                 | **D10-R3** and **D10-R19** allow only authoritative publication/configuration/export/artifact proof; ambiguity is reversible quarantine, not a fabricated terminal fact. |
| Display metadata is redacted and accidentally deletes the collision key, or privacy enforcement retains the entire raw URL forever.                                 | High / Medium         | **Repository fact:** ADR-0038 requires purpose-specific records and disposal without erasing required integrity evidence.             | Separates enforcement and display records. | **D10-R10** and **D10-R14** preserve minimum matchability/provenance while allowing owner-controlled display redaction/disposal.                                         |
| A correction overwrites old allocation history and makes audit or reconciliation unable to explain what happened.                                                   | High / Medium         | **Repository fact:** durable business history is append-only and corrections are forward facts.                                       | Forbids in-place repair.                   | **D10-R10**, **D10-R12**, and **D10-R13** require append-only versions, durable receipts, and forward correction only.                                                   |

### 15. Security and privacy risks

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                                             | Severity / likelihood  | Evidence and reasoning                                                                                                                                                    | Effect on the answer                | Permanent correction and exact language                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Paths, queries, exports, metrics, or errors expose missionary names, religious affiliation, location, campaign, amount, Source Code, donor token, or prior Tenant. | Critical / Medium-High | **Repository fact:** restricted missionary information may be safety-sensitive. **External fact:** OWASP logging guidance recommends excluding or masking sensitive data. | Narrows storage, UI, and telemetry. | **D10-R7**, **D10-R14**, and **D10-R18** retain minimum match identity, omit raw query/donor data, use authorized clean display, and expose bounded opaque telemetry. |
| The candidate-availability endpoint becomes a cross-tenant history oracle.                                                                                         | Critical / Medium      | **Repository fact:** ADR-0028 requires non-enumerating cross-tenant negatives.                                                                                            | Changes API/UI results.             | **D10-R7** and **D10-R11** allow only available/unavailable/invalid/try-again outside exact authorized scope, with no prior-owner facts and abuse controls.           |
| A branded or explanatory old-link page confirms that a sensitive ministry existed.                                                                                 | Critical / Medium      | **Repository fact:** D9 chose a uniform platform-neutral `404`.                                                                                                           | Confirms the public UX.             | **D10-R5** and **D10-R17** require the D9 envelope with no branding, reason, successor, provider, or tracking.                                                        |
| Spreadsheet exports execute formulas or IDN/bidirectional display tricks mislead staff replacing links.                                                            | High / Low-Medium      | **Security inference:** URLs are untrusted display/export data even when Core issued them.                                                                                | Adds safe rendering/export tests.   | **D10-R14–R16** require sanitized/formula-neutralized exports, safe IDN display, direction isolation, semantic labels, and no raw secrets.                            |

### 16. Scalability and performance risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                  | Severity / likelihood | Evidence and reasoning                                                                                                         | Effect on the answer                           | Permanent correction and exact language                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Permanent allocations grow forever and the public router scans event history, aliases, or every Tenant on each request. | High / Medium-High    | **Database reasoning:** permanent history can be large, but exact current-key lookup remains bounded with the correct indexes. | Changes the read model.                        | **D10-R10** and **D10-R18** require one indexed exact current-head lookup and keep history/list traversal off the request path.                                        |
| Retirement synchronously scans every historical Page, email, QR, provider, and analytics row while holding a lock.      | High / High           | **Repository fact:** D8 requires bounded owner summaries and short transactions.                                               | Uses a pre-maintained manifest.                | **D10-R3**, **D10-R12**, and **D10-R18** use a finite versioned manifest, keyset pagination, and outbox effects with no network under lock.                            |
| A hostile or accidental bulk publisher consumes huge address namespaces and creates unbounded manifests.                | Critical / Low-Medium | **Security/product reasoning:** permanent claims are irreversible and therefore require explicit capacity/abuse controls.      | Adds declared limits without enabling release. | **D10-R18** requires authorized issuance caps, anomaly signals, fair tenant scheduling, and production-shaped maximums; **D10-R20** excludes bulk/autonomous issuance. |

No unsupported claim that the design is “scalable” is accepted. Before release,
the PRD must declare measured maximum addresses and aliases per Site/host/Tenant,
concurrent allocation/retirement commands, request QPS, effect backlog, and
added p95/p99 lookup latency. Missing numbers block rollout.

### 17. Operational burden

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                              | Severity / likelihood | Evidence and reasoning                                                                         | Effect on the answer                | Permanent correction and exact language                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant staff keep spreadsheets, inspect provider dashboards, ask support for SQL, or manually test every old link because Core has no durable inventory or receipt. | High / High           | **Repository fact:** platform principles reject manual glue as the normal operating path.      | Adds one existing-surface workflow. | **D10-R15–R18** provide the authorized inventory, export, replacement checklist, persistent receipt, aggregate observation, and cause-owned repair.   |
| Core creates a support ticket for every old-link request or claims it can find every printed/off-platform copy.                                                     | Medium / High         | **Product judgment:** neither task explosion nor false completeness helps small ministries.    | Narrows automation.                 | **D10-R15**, **D10-R18**, and **D10-R20** aggregate signals and keep external replacement an honest staff responsibility; safety itself is automatic. |
| Staff replace the URL but forget the QR, email, website button, ad, or shortener.                                                                                   | High / High           | **External fact:** nonprofit platforms distribute URLs across QR and embedded/linked surfaces. | Adds guided cleanup.                | **D10-R15–R16** expose known Core placements and actions to copy link, download QR, test as donor, and review a concrete checklist.                   |

### 18. Observability and auditability gaps

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                         | Severity / likelihood | Evidence and reasoning                                                                                            | Effect on the answer                    | Permanent correction and exact language                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A `404` log or toast cannot prove which authorized command allocated/terminalized an address, which revisions were checked, or whether every effect converged. | High / High           | **Repository fact:** technical telemetry is not durable business history.                                         | Adds receipts and provenance.           | **D10-R10**, **D10-R12**, and **D10-R18** require append-only command/receipt/audit/outbox records with actor, scope, causation, revisions, attempts, and outcomes. |
| Metrics use raw URLs/Tenant IDs as labels and leak data or exhaust cardinality.                                                                                | High / Medium         | **External fact:** security logging should minimize sensitive content; cardinality must be bounded operationally. | Narrows monitoring shape.               | **D10-R14** and **D10-R18** allow opaque bounded cohorts and authorized aggregate counts only; raw queries/donor data are forbidden.                                |
| Drift between edge projection and authority remains invisible until a donor starts the wrong checkout.                                                         | Critical / Medium     | **Repository fact:** cache/provider effects can be delayed or missed.                                             | Adds active probes and hard thresholds. | **D10-R13**, the proof matrix, and the named monitors require cross-region adverse probes, divergence timing, and P0 containment on any favorable effect.           |

### 19. Dependency and integration risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                      | Severity / likelihood  | Evidence and reasoning                                                                                                            | Effect on the answer                                      | Permanent correction and exact language                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Next.js, Vercel, CDN, CMS, DNS, external shorteners, embedded forms, or Stripe act before/independently of the Core reservation.            | Critical / Medium-High | **Current behavior:** static redirects exist today. **External fact:** provider links and DNS have independent lifecycle/control. | Defines the enforcement boundary and migration inventory. | **D10-R6**, **D10-R9**, and **D10-R19** put the guard before Core route effects, remove bypasses, and visibly classify external/provider URLs as separately owned. |
| A provider outage or ambiguous deactivation result is treated as proof that an old Core address is safe or an external Giving link stopped. | Critical / Medium      | **Repository fact:** ADR-0015 requires readback/reconciliation for unknown provider outcomes.                                     | Keeps provider state subordinate.                         | **D10-R13** preserves the local tombstone regardless and routes provider uncertainty to Giving reconciliation without a favorable assumption.                      |
| Stripe can reactivate a Payment Link, so staff assume Core's permanent rule can or should reactivate too.                                   | High / Medium          | **External fact:** Stripe Payment Links are provider-owned objects that can be deactivated/reactivated.                           | Clarifies non-equivalence.                                | **D10-R7–R9** limit the Core invariant to Core-controlled public addresses; provider lifecycle never overrides or defines it.                                      |

### 20. Migration, rollout, and upgrade risks

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                                                                            | Severity / likelihood | Evidence and reasoning                                                                                                               | Effect on the answer                                   | Permanent correction and exact language                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current `siteId = null`, Tenant-only host resolution, query-controlled checkout, and static redirects are treated as an implementation foundation. Historical Site/address ownership is invented. | Critical / High       | **Current behavior:** no operational Site/Giving-address authority exists in `supabase/schema.sql`; current runtime is transitional. | Blocks implementation on current seam.                 | **D10-R19** requires accepted prerequisites, authoritative inventory, proved-only backfill, and explicit quarantine for ambiguity.                    |
| New terminal writers deploy while old readers still ignore them, or rollback restores an adverse-blind binary.                                                                                    | Critical / High       | **Repository fact:** permanent adverse facts require readers before writers and forward-only recovery.                               | Defines rollout and rollback.                          | **D10-R13** and **D10-R19** deploy/read-probe all route and mutation cohorts first; writer kill switches never disable existing claims or tombstones. |
| Phase 24 freezes route authority that conflicts with still-open Phase 22/23 PRs or Phase 13's mutable link wording.                                                                               | High / High           | **Live GitHub/repository fact:** PRs #1323 and #1340 remain open and review-blocked; their route ADRs are proposed, not governing.   | Blocks implementation-ready status, not recording D10. | **D10-R9** and **D10-R19** require one explicit predecessor reconciliation before PRD/OpenSpec/design/tickets.                                        |
| A canonicalizer or framework upgrade silently changes equivalence and frees an old spelling.                                                                                                      | Critical / Low-Medium | **External fact:** routing libraries and IDNA/URL behavior can change across versions.                                               | Adds mixed-version upgrade proof.                      | **D10-R10** and **D10-R19** require dual evaluation, collision backfill, adverse compatibility, and no coverage shrink.                               |

### 21. Testability, traceability, and proof

**Material concern exists in the draft; the corrected D10 is falsifiable.**

| What could go wrong and why it matters                                                                                                                                             | Severity / likelihood | Evidence and reasoning                                                                                                | Effect on the answer                                               | Permanent correction and exact language                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A happy-path slug test passes while aliases, cross-tenant reuse, RLS, stale checkout, provider effects, caches, migration, accessibility, and staff comprehension remain unproved. | Critical / High       | **Repository fact:** Core requires public-seam, negative, authorization, concurrency, and production-shaped evidence. | Adds the full proof matrix.                                        | Every artifact and release must trace to **D10-R1–R20** and pass the matrix below; implementation details alone are insufficient.                                        |
| Terminology drifts among old path, retired URL, slug lock, redirect, archive, and Giving link.                                                                                     | High / High           | **Repository fact:** `CONTEXT.md` is the ubiquitous-language authority.                                               | Requires immediate glossary/log update.                            | Record **Issued Giving Address** and use the exact D10 lifecycle terms; never call it a reusable slug or redirect.                                                       |
| UX is approved from a mockup without representative ministry staff completing the replacement task.                                                                                | High / Medium         | **Assumption:** no current user research proves comprehension of the count/export/suggestion workflow.                | Does not reopen the safety invariant; blocks general availability. | Pre-GA evidence must show representative staff can identify what changes, what stays unchanged, create/test a new URL, and name off-platform cleanup without assistance. |

### 22. Other development hazards

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                  | Severity / likelihood | Evidence and reasoning                                                                          | Effect on the answer                             | Permanent correction and exact language                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Issuing a Giving address at `/` later prevents that exact origin from hosting any Core homepage. Staff discover the blast radius only after retirement. | High / Low-Medium     | **Product judgment:** root is one exact path but has unusually broad user impact.               | Adds pre-issuance and domain-preflight warnings. | **D10-R2**, **D10-R15**, and **D10-R19** require full-address consequence review and a privacy-safe root-collision check before public/domain activation. No former-owner detail is shown. |
| D9 says a fresh host binding wins and is misread to erase D10's platform-wide adverse allocation.                                                       | Critical / Medium     | **Repository fact:** D9-R2 predates the D10 direct-reuse choice.                                | Requires an explicit reconciliation.             | D9-R2 is amended: a fresh binding inherits no prior Site content or positive routing, but it remains subordinate to Issued Giving Address reservations under **D10-R7**.                   |
| An ADR or tickets are published now against unresolved predecessor authority and become expensive technical debt.                                       | High / High           | **Live GitHub fact:** predecessor PRs remain unmerged; Phase 24 is still a grill session.       | Keeps D10 recorded but not implementation-ready. | Preserve this decision/evidence now; create one reconciled ADR/PRD/OpenSpec package only through `/to-prd`, then tickets through `/to-issues`.                                             |
| “Permanent” is misread as “retain every byte forever” or “Core controls external DNS forever.”                                                          | Critical / Medium     | **Repository fact:** ADR-0038 and D8 limit retention; D9 limits Core to requests reaching Core. | Narrows the word permanent.                      | **D10-R7** and **D10-R14** make the invariant permanent while minimizing data and stating the external control boundary.                                                                   |

## Current behavior, intended behavior, and permanent path

### Current behavior is not a D10 foundation

- [`packages/api/src/cms/public/context.ts`](../../../packages/api/src/cms/public/context.ts)
  declares the nullable `siteId` seam, while
  [`apps/admin/src/cms/public/resolve-tenant.ts`](../../../apps/admin/src/cms/public/resolve-tenant.ts)
  currently assigns `siteId: null`; the runtime cannot identify the exact Site
  whose Giving address it would reserve.
- [`apps/admin/src/cms/public/resolve-tenant.ts`](../../../apps/admin/src/cms/public/resolve-tenant.ts)
  resolves host to a mutable CMS Tenant without an operational Site, host
  generation, route head, or address allocation.
- [`packages/lib/payments/checkout-designations.ts`](../../../packages/lib/payments/checkout-designations.ts)
  builds generic `/checkout` links whose worker/fund/amount/frequency meaning
  lives in caller-visible query parameters.
- [`apps/donor/app/(public)/(solid)/checkout/page.tsx`](<../../../apps/donor/app/(public)/(solid)/checkout/page.tsx>)
  reads those query values directly as the current presentation seam.
- [`apps/donor/next.config.ts`](../../../apps/donor/next.config.ts) permanently
  redirects `/give` and `/donate` to `/workers` before any future Site/Giving
  address authority.
- `supabase/schema.sql` has no operational Site, Giving-entry, or issued-address
  source of truth. No current flag can be safely repurposed as historical proof.
- Phase 13's founder-ratified forward `/s/<token>` contract is described as
  dynamic/fixable. D10 amends that destination behavior: an issued token may
  retain only the identical Giving public-entry meaning or become unavailable;
  it cannot be repointed.

These are verified current gaps, not evidence that D10 should preserve a weak
design. They make implementation premature until the accepted route and Site
authorities exist.

### Intended permanent path

The permanent path is one operational typed route/address authority, one
Giving-owned immutable public-entry identity, one versioned canonicalizer,
one first-issuance command, and one terminal adverse fact. Public and mutation
boundaries consult it before any favorable effect. CMS/provider/caches consume
the result but never define it.

Open PRs #1323 and #1340 contain useful proposed Phase 22/23 route decisions but
remain unmerged and review-blocked as of this review. D10 must be reconciled
with whichever predecessor contract becomes accepted; it must not silently
adopt proposed ADR numbering or create conflicting implementation tickets.

## Whole-product impact

| Product area                  | Required outcome                                                                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mission Control**           | Staff see the permanent consequence before first issuance and retirement, receive a complete authorized old-link inventory, and get a guided new-link workflow with no override. |
| **Public Website**            | Exact adverse address state is checked before CMS, route, fallback, redirect, and cache. Old addresses return D9's neutral response.                                             |
| **Giving**                    | Giving owns immutable entry meaning and admission; it issues a new identity for changed donor meaning and revalidates every financial input.                                     |
| **Donor Portal**              | Existing gifts and recurring commitments remain independently visible and manageable; no retired public history is exposed.                                                      |
| **Missionary Workspace**      | Authorized people may see replacement-work status but cannot allocate/repoint addresses or infer restricted predecessor detail.                                                  |
| **Web Studio / CMS**          | Editors place only issued current links; CMS cannot mint, repoint, clear, or reinterpret an address. Known placements feed the staff checklist.                                  |
| **Permissions**               | Dedicated current capabilities and exact scope protect issuance, history inspection, retirement, and replacement; role names and support status grant nothing.                   |
| **Reporting / audit**         | Durable allocation and terminal receipts prove business history; privacy-safe aggregates help link cleanup without becoming route authority.                                     |
| **Finance / accounting**      | No contribution, commitment, receipt, Legal Entity, Stripe account, settlement, bank, currency balance, or ledger identity changes.                                              |
| **Integrations / operations** | Provider-owned URLs and DNS are visibly separate. Effects reconcile idempotently; external uncertainty never releases the Core address.                                          |

## Required proof matrix

Future acceptance evidence MUST verify outcomes at public seams and durable
business boundaries, not merely a database Boolean or UI mockup.

### Address identity and lifecycle

- A private candidate can be edited/discarded and consumes no address.
- First public issuance atomically creates one immutable allocation, head,
  audit, receipt, and outbox before copy/export/QR/public exposure.
- The same semantic retry returns that receipt; changed meaning conflicts.
- Current/unavailable/current transitions work only for the exact original
  meaning; terminal has no outgoing transition.
- A renamed entry receives a new address. Its prior address either remains an
  alias to the same meaning or becomes unavailable, never a different meaning.
- Site retirement terminalizes every proved manifest address/alias in the same
  transaction ordering; truncated/stale/unknown manifest proof blocks.
- A successor Site cannot use any terminal address for Giving or ordinary
  content and can issue a different currently available address.

### Canonicalization and route families

- Prove origin components, default/effective ports, DNS case/trailing dot,
  IDNA Unicode/ASCII forms, HTTP upgrade, host aliases, locale prefixes,
  trailing slash, path case policy, percent case, encoded unreserved and slash,
  dot segments, double encoding, control/NUL input, Unicode normalization, and
  malformed input against one conformance corpus at edge, app, and database.
- Query absence/order/duplication, amount/fund/cadence/Source Code values, and
  browser fragments cannot create a free variant or carry intent.
- Root, generic `/give`, ordinary-looking route, short/QR/deep link, embed,
  form, checkout, confirmation, Site-addressed browser return, RSC/data/
  prefetch, Site-addressed API, media, sitemap/robots, and future Giving-owner
  classifications obey the adverse check before favorable behavior. Separately
  addressed verified provider callbacks may reconcile only already-admitted
  business identities and cannot derive a new admission from the address.
- The same path on a genuinely different origin remains eligible. The same
  external origin/path cannot bypass history by changing Core environment.
- Core-owned handles and admitted aliases retain their exact reservation; an
  external/provider URL is accurately reported as outside this address owner.

### Tenant, authorization, database, and privacy

- Same Tenant/different Site, different Tenant, fresh domain-binding
  generation, domain leave-and-return, and cross-environment tests prove exact
  global occupancy and no positive authority inheritance.
- Cross-tenant/unauthorized candidate checks, errors, timing classes, caches,
  exports, and logs reveal no prior owner, Site, ministry, Designation, date,
  count, reason, or actor.
- Exercise global uniqueness, terminal/check constraints, same-scope composite
  FKs, `ON DELETE RESTRICT`, immutable scope, at-most-one head, canonicalizer
  versions, equality indexes, and redactable display metadata.
- Prove revoked direct grants, `USING` and `WITH CHECK`, `FORCE RLS`, views,
  RPCs, table owner, service role, workers, imports, and any
  `SECURITY DEFINER` path with cross-Tenant and caller-field poison tests.
- Stale/revoked assignment, inadequate assurance, support/impersonation,
  assistant/automation, bulk/scheduled command, caller actor/owner/approval,
  and rate-limit abuse allocate nothing.
- Logs, traces, metrics, alerts, audit, and exports contain no raw query,
  fragment, donor/payment secret, or unauthorized sensitive name; exports are
  formula-neutralized and URLs use safe bidirectional/IDN presentation.

### Concurrency, failure, cache, and integrations

- Race issuance with rename, duplicate candidate, Site retirement, host
  rebind, route publish, successor activation, canonicalizer migration, and two
  Tenants claiming the same returning origin. One address-owner CAS order wins;
  losers review current state. D7 pause/resume commutes independently, and
  checkout admission rechecks both address and D7/financial heads.
- A checkout loaded before retirement cannot create a new admission/provider
  effect afterward; existing admitted work reconciles only under D7's owner.
- Authority timeout/corruption/divergence returns no-store `503`; a proved
  terminal address returns the uniform D9 `404`; no cache or fallback converts
  uncertainty into a favorable result.
- Warm/cold and multi-region edge/app/CDN/browser/service-worker tests prove
  adverse precedence over static redirects, middleware, rewrites, CMS,
  catch-alls, provider handoff, and stale positive cache.
- Lost command/QR/export responses, duplicate/out-of-order outbox work,
  provider timeout/ambiguous success, and worker crash converge from durable
  receipts without releasing or reallocating the address.
- DNS departure is described honestly; when the origin returns through Core,
  its allocation is enforced before any new content or Giving activation.

### Financial and historical non-effects

- Address issuance, pause, terminality, migration, and replacement change no
  existing contribution, recurring commitment, occurrence, refund, dispute,
  receipt, statement, ledger entry, or historical Site/Source Code/Designation
  attribution.
- No address supplies Legal Entity, Stripe account, Settlement Account Binding,
  settlement, bank, accounting, amount, currency, cadence, or donor identity.
- An old URL carrying `$100`, monthly cadence, fund, missionary, campaign,
  locale, Source Code, success/cancel, or return values creates zero redirect,
  checkout, provider, contribution, commitment, ledger, or attribution effect.

### Migration, accessibility, usability, and capacity

- Proved historical issuance backfills a claim; missing/current-only/traffic
  evidence does not. Ambiguity becomes an explicit reversible quarantine that
  blocks conflicting activation without fabricating history.
- Old-code/new-schema and new-code/old-schema qualification proves no writer is
  enabled before every reader is adverse-aware. Rollback after a claim never
  disables enforcement.
- Remove and negatively test current `/give` and `/donate` static bypasses and
  mutable short-link repointing.
- Keyboard, screen reader, visible focus, error summary/inline association,
  polite status, 320 CSS-pixel reflow, 200%/400% zoom, forced colors, RTL,
  long Unicode/IDN, localized time, no-JS/low-bandwidth, server race, and
  no-color/toast-only tests pass.
- Before general availability, representative small and large ministry staff
  MUST complete retirement impact review and successor-link creation without
  assistance, correctly explain that old links stay unavailable and recurring
  gifts remain unchanged, and identify that external materials still require
  replacement. Any recurring dangerous misconception blocks GA.
- Declare and qualify production maximum address/alias/host/locale counts,
  concurrent commands, request QPS, added p95/p99 guard latency, effect backlog,
  manifest page size, and abuse caps. Unknown capacity is not a pass.

## Named monitors and mandatory response

| Signal                                               | Threshold                                                                                                                                                                                                    | Owner                              | Required response                                                                                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `terminal_giving_address_favorable_effect_total`     | Any favorable content/redirect/rewrite/new admission, or any provider/contribution/commitment/receipt/ledger/attribution effect causally admitted from an `issued/terminal` address after its terminal fence | Giving + Public Runtime on-call    | Declare money-integrity P0; contain the exact host/address, disable the offending positive writer, preserve evidence, reconcile every downstream effect, and prove zero recurrence. |
| `reserved_giving_address_reassignment_total`         | Any successful allocation or public activation whose key has a different historical owner/meaning                                                                                                            | Route Authority + Security on-call | Declare P0; quarantine the route generation, stop allocation/activation, preserve both histories, and roll forward to a new address. Never release the old slot.                    |
| `giving_address_canonicalization_disagreement_total` | Any edge/app/database disagreement                                                                                                                                                                           | Public Runtime + Security on-call  | Declare P0; quarantine the affected equivalence cohort, return `503`, halt canonicalizer rollout, dual-evaluate, and repair forward.                                                |
| `giving_address_registry_divergence_age_seconds`     | Warning over 5 seconds; P0 over D7's hard 30-second containment ceiling                                                                                                                                      | Public Runtime owner               | Fail affected requests closed, stop new positive activations, rebuild/reconcile the projection, and prove exact cross-region agreement.                                             |
| `giving_address_cross_tenant_disclosure_total`       | Any prior-owner detail exposed to an unauthorized actor, response, cache, log, metric, or export                                                                                                             | Security + Privacy on-call         | Declare P0; contain the surface/store, revoke unsafe access, execute incident/privacy response, and add a poison fixture before reopening.                                          |
| `giving_address_authority_failure_rate`              | Above 0.1% for 5 minutes, or any favorable fallback at any rate                                                                                                                                              | Public Runtime owner               | Page P1 for safe `503`; favorable fallback is P0. Stop new activations, restore/read-reconcile authority, and preserve adverse results.                                             |
| `giving_address_manifest_coverage_gap_total`         | Any retiring Site with proved issued Giving history absent from its manifest/quarantine                                                                                                                      | Site Lifecycle + Giving owner      | Block retirement completion, rebuild the source-owner manifest, and never treat missing evidence as zero/free.                                                                      |
| `giving_address_admission_anomaly_total`             | Above the declared per-Site/per-host issuance cap or any attempted bulk/autonomous claim                                                                                                                     | Giving Security owner              | Block the command/cohort, require current human review, investigate compromise/namespace poisoning, and create no claims.                                                           |
| `blocked_giving_url_setup_completion_rate`           | Below 80% within 24 hours after at least 20 blocked attempts, measured over 30 days                                                                                                                          | Giving Product/UX owner            | Review support/usability evidence and improve copy, suggestions, and preview; never weaken the permanent reservation.                                                               |
| `retired_giving_address_requests`                    | More than 100 authorized aggregate requests/day for 7 consecutive days on one Tenant address                                                                                                                 | Tenant Site Operations owner       | Surface a prioritized replacement reminder and current-link tools; never redirect or expose individual visitors.                                                                    |
| `known_core_giving_link_replacement_age_seconds`     | Any known Core-managed placement unresolved 30 days after retirement                                                                                                                                         | Tenant Site Operations owner       | Keep a persistent cause-owned task, show exact authorized placement guidance, and leave the old address safely unavailable.                                                         |

## Ruthless synthesis — strongest permanent path

### Resolved before recording D10

1. “Path” means one versioned public origin + normalized path and its admitted
   router-equivalent aliases, never a bare global slug. Environment is
   provenance, not a way to make the identical external address reusable.
2. The permanent claim begins before first public exposure, not during
   retirement or first observed click.
3. An address is permanently bound to one immutable Giving public-entry
   meaning. Pause may resume that meaning; changed meaning always gets a new
   address.
4. Site retirement makes every proved address terminal. A successor uses a new
   URL; old requests receive D9's neutral `404` and create zero effect.
5. A fresh host binding clears old positive Site authority but cannot erase a
   platform-wide adverse Giving-address allocation.
6. Exact occupancy is global across Tenants for that address while owner detail
   remains scoped and non-enumerating.
7. Site/address identity remains independent of Legal Entity, Stripe,
   settlement, bank, accounting, money, and existing recurring commitments.
8. Staff see the consequence before issuance and retirement, receive honest
   link cleanup tools, and recover from conflicts through accessible suggestions
   and a deliberate new-link workflow.
9. Permanent enforcement retains minimum evidence, not every path label, query,
   donor fact, or log forever.

### Required before the Phase 24 PRD can be implementation-ready

1. Merge or explicitly supersede/reconcile Phase 22/23 route authority and
   reconcile Phase 5/13 shareable checkout/short-link language.
2. Define the immutable Giving public-entry identity and owner-maintained route
   manifest without assigning financial ownership to Site.
3. Declare one canonicalizer/equivalence contract and one shared typed
   address-allocation authority.
4. Translate D10-R1–R20, the proof matrix, UX copy, failure semantics, privacy,
   limits, and monitors into OpenSpec requirements and design.
5. Qualify the staff interaction with representative ministry users. This may
   improve wording and suggestions but cannot weaken the invariant.

### Required implementation order

1. Expand append-only allocation/history/head/audit/receipt/outbox data,
   constraints, grants, RLS, and privileged command boundaries.
2. Inventory current route/checkout/short-link/embed/host/provider surfaces;
   backfill proved issuance and quarantine ambiguity.
3. Deploy and shadow the adverse read/final-mutation guard in every route,
   method, cache, region, and worker before any new claim writer.
4. Remove static/provider/CMS bypass authority and prove cross-version safety.
5. Enable private availability/pre-issuance UX and first-issuance claims for a
   bounded cohort.
6. Enable D8 retirement terminalization and successor-link UX for a bounded
   cohort only after manifest, concurrency, accessibility, capacity, and
   production probes pass.
7. Roll forward only. A kill switch disables new positive commands but never
   releases an issued address or disables an adverse read.

### Monitored, never deferred

Only the named operational signals above are placed in monitor. Each has an
owner, threshold, and mandatory response. Unmerged predecessor authority,
unknown manifests, missing capacity numbers, unproved privileged paths, or
unsafe staff comprehension are prerequisites—not monitor-only risks.

## Research synthesis

### Governing repository evidence

- [`CONTEXT.md`](../../../CONTEXT.md) defines Site as presentation and
  attribution only, Giving as independently admitted, and Site as unable to
  own/select Legal Entity, Stripe, settlement, bank, or accounting identity.
- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
  prioritize tenant/permission safety and money/operational truth over
  convenience.
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
  separate operational, CMS, public, Giving, and provider ownership.
- [ADR-0015](../../adr/0015-provider-control-loss-quarantine-and-proof-gated-recovery.md)
  requires ambiguous provider outcomes to remain unknown until readback/
  reconciliation.
- [ADR-0028](../../adr/0028-defense-in-depth-public-isolation.md) requires a
  typed fail-closed public choke point and structural tenant isolation.
- [ADR-0030](../../adr/0030-function-level-tagged-caching-publish-signal.md)
  says cache tags invalidate but do not isolate entries.
- [ADR-0038](../../adr/0038-purpose-owned-records-schedules-and-verified-disposal.md)
  separates integrity evidence from unlimited content/personal-data retention.
- [ADR-0044](../../adr/0044-canonical-legal-entity-financial-boundary.md)
  prevents Site from becoming legal/payment/settlement authority.
- [D7](./phase-24-d7-site-serving-and-giving-admission-adversarial-review.md),
  [D8](./phase-24-d8-site-retirement-adversarial-review.md), and
  [D9](./phase-24-d9-retired-address-disposition-adversarial-review.md) already
  establish independent Giving admission, terminal Site retirement, fresh host
  proof, uniform public absence, and zero Giving redirect/effect.

### Current external primary evidence

- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) defines origin/URI
  semantics and supports scoping meaning to the complete origin and target
  rather than treating a bare path as universal.
- [Stripe Payment Link sharing](https://docs.stripe.com/payment-links/share)
  says Payment Link QR codes do not expire, and deactivated links show an
  inactive/expiration result. The
  [Payment Link API](https://docs.stripe.com/api/payment-link) and
  [update API](https://docs.stripe.com/api/payment-link/update) demonstrate
  that provider objects remain Stripe-owned and may be deactivated/reactivated;
  they are not Core address authority.
- [Blackbaud QR guidance](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/ogf-publish-qr-code.html)
  and
  [donation-link parameters](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/tcs/content/en-ca/content/donfm-link-parameters-eh.html)
  show gift URLs/QR codes used in external material and parameters that can
  encode designation, appeal, amount, recurring amount, or language.
- [Blackbaud Giving-form management](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/education/k12/full-help/content/sws-manage-giving-forms.html)
  warns that retiring a form does not stop submissions while it remains
  embedded. That is direct evidence for a structural admission fence rather
  than a UI-only state.
- [Givebutter URL guidance](https://help.givebutter.com/en/articles/2267413-how-to-customize-a-campaign-url)
  says changing a campaign URL breaks old shared links and recommends a
  distinct acronym/year when a URL is unavailable.
  [Givebutter campaign lifecycle](https://help.givebutter.com/en/articles/1772204-how-to-close-or-unlist-a-campaign)
  and
  [Donorbox campaign lifecycle](https://donorbox.zendesk.com/hc/en-us/articles/360020293232-How-do-I-delete-or-deactivate-a-donation-form-or-campaign)
  preserve payment-bearing campaign/form history instead of treating it as a
  freely disposable draft.
- [Google URL-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
  recommends real not-found behavior when no replacement exists and warns
  against irrelevant redirects. Its migration windows are not proof that
  donor bookmarks or printed QR codes expire.
- [OWASP logging guidance](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
  supports excluding or sanitizing tokens, personal data, and other sensitive
  values from logs.
- [ICO storage-limitation guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/)
  requires justified retention and periodic review; D10 therefore preserves a
  minimum collision fact, not unlimited raw URL/query/content history.
- WCAG's [error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html),
  [error suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html),
  [financial-data error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html),
  and [status message](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)
  guidance supports explicit consequence review, textual linked errors,
  suggested recovery, confirmation, and programmatic async status.
- The current
  [Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)
  likewise call for semantic controls, specific action labels, inline errors,
  first-error focus, visible focus, responsive reflow, and polite live status.

The research supports persistent external links, financial-intent sensitivity,
fail-closed enforcement, privacy minimization, and accessible guided recovery.
It does **not** prove that permanent donation-path reservation is a universal
industry convention. Permanent non-reuse is Core's product judgment because it
is the only option here that makes the already accepted “never move donor
intent” invariant true without guessing an expiration.

## ADR and documentation status

`Issued Giving Address` is now defined in `CONTEXT.md`, D9-R2 is explicitly
qualified by platform-wide adverse reservations, and this review plus the
Phase 24 decision log preserve the founder ruling and proof obligations.

D10 is hard to reverse, externally observable, financially consequential, and
surprising without context, so it is an ADR candidate. Creating the accepted
ADR now would collide with unresolved Phase 22/23 route authority and numbering.
The eventual `/to-prd` package MUST reconcile the predecessors and produce one
coherent glossary, ADR, PRD, OpenSpec, design, and proof chain before `/to-issues`.
That blocks implementation-ready status, not recording D10.

## Resolved assumptions and next dependency

No unresolved technical fact blocks recording D10. Direct user research has
not yet proved the exact staff wording or suggestion interaction; that is an
explicit pre-GA qualification and may refine presentation only. It cannot make
an issued address reusable.

D10 deliberately does not freeze the successor URL format. Permanent non-reuse
makes that format consequential: Core should avoid burning a generic
`/checkout` route while still giving donors a clear, trustworthy address. The
next founder decision is the balance among readable labels, stable opaque
identity, privacy, and staff control in a newly issued Giving URL.

### Later D13 placement-convergence clarification — 2026-08-27

D13 selected one permission-filtered preview, private authorized preparation,
and source-owner routing. D10's known-placement/checklist language is advisory
inventory only: it never supplies edit, review, publish, send, task, or
completion authority.

Automatic preparation requires a typed same-scope **Core-managed Giving
placement** structurally tied to the exact Giving entry. Raw/literal URL matches
remain manual evidence. For reference-backed Page/Navigation output, preference
change does not rewrite authored content; the source may prepare one complete
Site-locale publication candidate that reuses the stable Giving reference and
pins the exact address generation. Communications remains unavailable until
the exact source family has its own accepted authoring/version/freeze/send
contract.

**Persistent cause-owned task** in this report means the source owner's
accepted attention/review seam. Current generic Mission Control tasks are not
D13 authority. No task, comment, acknowledgement, checklist, or closure can
authorize or resolve source truth, and placement work never blocks address
Stop.

## D76 reconciliation (2026-08-30)

A same-Tenant Site Domain cutover never clears, transfers, reissues or
reinterprets an Issued Giving Address. The exact origin/path reservation remains
stronger than the destination website role and runs before target content,
redirect, cache or checkout. Unless the Giving owner independently proves an
identical compatible source contract, the old address becomes/remains
unavailable and permanently reserved; it never becomes destination Giving
meaning.

## D77 reconciliation (2026-08-31)

ADR-0198 keeps every Issued Giving Address in the critical owner lane and out of
the ordinary manifest comparator. The Giving owner supplies one complete current
direct/unavailable/successor/block result; missing, hidden, stale, contradictory,
or unknown evidence blocks D76 even when the Domain Manager cannot see route
detail. No same path, target Page, ordinary successor, redirect, wildcard,
query/body/cookie carry, provider rule, staff acknowledgement, or AI result may
weaken the permanent reservation or create a gift/checkout effect.
