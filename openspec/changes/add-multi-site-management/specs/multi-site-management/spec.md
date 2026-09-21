# Multi-Site Management

## ADDED Requirements

### Requirement: Site Is Stable Presentation And Attribution Context

A Site MUST be one stable, behavior-neutral child of exactly one Tenant. It
MUST own public presentation and attribution context, while its human-readable
purpose and setup-preset provenance remain descriptive and behavior-inert.
Site settings MUST NOT select or redefine Legal Entity, Settlement Account
Binding, Stripe account, settlement, payout, bank, receipt issuer, ledger, or
accounting authority.

Adding a Site MUST create private setup only. It MUST NOT activate a host,
public generation, cache, Giving route, provider object, or money effect. An
optional copy MUST select one exact acknowledged Page or Article revision and
create one independent private target with fresh identity and no synchronization
or inherited authority.

#### Scenario: Staff creates a regional Site

- WHEN authorized staff creates a regional Site with descriptive purpose
- THEN one stable private Site and setup workspace exist
- AND no public, provider, cache, Giving, or financial effect exists
- AND changing the purpose later changes no behavior or historical attribution

#### Scenario: Staff copies one source Page

- GIVEN one authorized exact source revision is eligible
- WHEN staff invokes Copy a Page or Article
- THEN Core creates one independent private target atomically
- AND it does not copy publication, Navigation, schedule, permission, Giving,
  provider, or money authority

### Requirement: Default Site Is Staff Convenience Only

Exactly one current Default Site MUST exist per Tenant and environment. Tenant
setup MUST create the first Default Site, and staff surfaces MAY preselect it
for safe new private work. Production host resolution, public reads, checkout,
callbacks, caches, and historical records MUST require an exact Site and MUST
NOT fall back to the Default Site.

Changing the Default Site MUST be prospective, audited, compare-and-set, and
MUST NOT move or rewrite existing Site, content, domain, contribution,
recurring, Legal Entity, settlement, or historical facts. The current Default
Site MUST NOT retire until another valid default commits.

#### Scenario: An unknown host reaches Core

- WHEN a request uses an unknown, malformed, disabled, or transferred host
- THEN Core applies the owner-defined fail-closed response
- AND it does not resolve the Tenant's Default Site

#### Scenario: Two staff users change the default concurrently

- WHEN two valid changes race from the same expected head
- THEN exactly one successor becomes current
- AND the loser receives a stale-review result without moving any existing fact

### Requirement: Site Activation Is Explicit And Capability-Specific

First favorable Site activation MUST require one complete private production-
faithful preview and one explicit Go live command. The command MUST reauthorize
the actor and atomically prove the exact Tenant/environment/Site, one canonical
owner-proved and admitted host, one default public locale, compatible complete
presentation, one immutable public generation, and no current safety blocker.
Provider verification alone MUST NOT activate a Site.

Giving, messaging, Redirect Site Domains, and additional locales MUST retain
independent readiness and activation. An unavailable optional capability MUST
be absent or honestly unavailable, never broken in public UI.

#### Scenario: Core website is ready but Giving is not

- GIVEN the exact core website contract is current and Giving is unavailable
- WHEN authorized staff reviews and invokes Go live
- THEN the website activates as one immutable generation
- AND no Giving capability or provider payment effect activates

#### Scenario: Activation evidence becomes stale

- WHEN a pinned host, locale, presentation, safety, actor, or expected-head fact
  changes before commit
- THEN activation changes nothing
- AND private work and the prior public state remain intact for review

### Requirement: Website And Public-Giving Containment Are Independent

The product MUST expose separate consequence-labelled commands for Take website
offline and Pause new gifts from this Site. Website suspension MUST deny every
Site-owned public egress while preserving staff access, identity, configuration,
domains, drafts, generations, and history.

Site-public Giving pause MUST apply exactly to new admissions for the current
Tenant/environment/Site with `entry_method=public_checkout`. A monotonic
committed admission revision MUST separate pre-admitted from later work. The
command MUST NOT pause sibling Sites, portal/API/staff/import paths, accepted
gifts, or existing recurring commitments.

#### Scenario: A Site-public gift races with pause

- WHEN a checkout admission and Site-public Giving pause race
- THEN the committed admission revision classifies the gift as pre-admitted or
  rejected before any durable/provider money effect
- AND the operation is neither duplicated nor silently reclassified

#### Scenario: Staff takes only the website offline

- WHEN authorized staff confirms Take website offline with a reason
- THEN public website serving converges to the safe adverse response
- AND Site-public Giving policy and existing recurring truth remain unchanged

### Requirement: Site Retirement Is Terminal And History-Preserving

Site retirement MUST be a terminal transition for one exact Tenant,
environment, and Site. Commit MUST re-prove that the website is observably
offline, Site-public Giving is paused or never enabled, a different current
Default Site exists, actor authority is current, and the impact digest has not
changed. It MUST atomically fence favorable serving, publication, Giving
admission, host/locale/currency activation, and ordinary favorable changes.

Retirement MUST NOT delete, move, cancel, or rewrite prior gifts, recurring
commitments, receipts, accounting, messages, Source Codes, Pages, publications,
audit, or attribution. Site identity and Core public handle MUST never be
reused. A never-public Site MUST use the same terminal contract with Discard
setup wording.

#### Scenario: Staff retires a fully contained Site

- WHEN every current precondition passes and staff confirms permanent retirement
- THEN the Site can never reactivate or regain favorable operations
- AND retained owner records continue their valid correction, reconciliation,
  retention, and disposal lifecycles

#### Scenario: A precondition changes during review

- WHEN the default, serving, Giving, authority, or impact evidence changes
  before commit
- THEN retirement changes nothing
- AND the UI requires Review changes

### Requirement: Retired And Giving Addresses Preserve Exact Meaning

An old retired-Site address that still reaches Core MUST return the same neutral
platform `404` as an unknown/privacy-ineligible address unless its route owner
has recorded a current exact same-Tenant/environment/locale/audience/safety/
visitor-task/subject/purpose successor. Giving-intent routes MUST NOT redirect.
Unavailable route authority MUST return the neutral no-store `503` rather than
guessing.

An Issued Giving Address MUST permanently bind one canonical external origin,
normalized path and admitted equivalent forms to one Tenant, originating
environment provenance, Site, exact Site Locale, and immutable Giving-entry
meaning. Retirement, host rebinding, staff, support, AI, import, provider, or
timer MUST NOT release, repoint, or reuse it.

#### Scenario: A retired Giving URL is requested

- WHEN a request reaches an Issued Giving Address whose Site is retired
- THEN it returns the neutral real 404
- AND it creates no redirect, fallback, checkout, provider, contribution,
  commitment, receipt, ledger, or attribution effect

#### Scenario: A proved ordinary successor exists

- GIVEN the route owner has a current exact qualified ordinary-content successor
- WHEN clean navigation-safe GET or HEAD reaches the old address
- THEN the route owner may return its one direct final outcome
- AND query, body, cookie, fragment, Giving, auth, or payment state is not carried

### Requirement: Giving Address Issuance Is Readable Atomic And Non-Reusable

The standard Giving address MUST be `{Site Locale Public Base}/give/{staff-
chosen-slug}`. `/give/` MUST be code-owned and reserved. Staff MUST edit only
the final readable segment while Core shows the complete normalized URL and
never silently appends a suffix, date, ID, translation, or random token.

Draft, autosave, preview, suggestion, and advisory availability MUST consume no
address. One explicit issue/publish command MUST reauthorize and atomically
claim every canonical equivalent, bind immutable meaning, update the exact-
locale Preferred for sharing head, and record receipt/audit/outbox. Exact replay
MUST return the original result.

An older eligible address MUST continue serving its own meaning directly after
a replacement becomes preferred. Stop this address MUST be a separate,
capability-gated terminal command and MUST NOT redirect, change gifts/recurring
commitments, or release the allocation.

#### Scenario: Two actors issue the same candidate concurrently

- WHEN both commands reach the authoritative allocation boundary
- THEN one constraint-enforced command wins
- AND the other preserves its exact input and receives a privacy-safe collision
  result without a partial address

#### Scenario: Staff replaces a sharing address

- WHEN B is issued for the exact same eligible Giving-entry meaning
- THEN B becomes Preferred for sharing
- AND A remains Other address · Page opens through A's own allocation
- AND A never redirects or resolves through B

### Requirement: Core-Managed Giving Placement Convergence Is Source-Owned

After a Preferred Giving Address changes, Giving MUST record only the preference
occurrence. Prepare authorized updates MAY create private work only through each
registered source owner's typed command after current actor, Tenant,
environment, Site, locale, Giving entry, source/version, placement, capability,
authorization epoch, lifecycle, and expected heads are rechecked. Page,
Navigation, Communications, and other owners MUST retain publication, approval,
send, schedule, and repair authority.

Only a stable typed Core-managed Giving placement reference MAY authorize
preparation. Raw URL equality, rich-text/HTML/JSON search, analytics, provider
results, similarity, title, Page, Designation, or Preferred status MUST NOT.
Frozen, approved, scheduled, sent, downloaded, printed, external, unsupported,
and otherwise immutable output MUST remain unchanged and truthfully classified.
Cross-owner preparation MUST be itemized, resumable, non-atomic, privacy-
filtered, and receipt-backed; it MUST NOT overwrite active human work or select
an approver.

#### Scenario: Staff prepares authorized Page placement updates

- WHEN an authorized stable Page/Navigation placement still pins the old
  preferred address and the exact source heads remain current
- THEN its source owner may create one private dependency-only candidate
- AND nothing becomes public until that owner's ordinary release commits

#### Scenario: A frozen newsletter contains the old address

- WHEN the placement is approved, scheduled, sent, external, or its source
  contract is unavailable
- THEN Core does not rewrite or rebase it
- AND staff see Not changed by Core or the exact source-owned next action without
  a hidden count or invented approver

### Requirement: Site Locale Public Identity Is Exact And Explicit

A Site Locale MUST be stable Site-owned public presentation identity expressed
as one canonical BCP 47 locale under a versioned standards profile. Materially
different language, script, or region values MUST remain distinct and MUST NOT
be inferred from country, currency, browser, provider, traffic, or Tenant data.

Every favorable locale-bearing public route MUST use the trusted verified Site
origin, optional permanent shared-host Site handle, fixed `/lang/`, immutable
lowercase exact-locale segment, and owner-relative path. Direct explicit routes
MUST NOT negotiate, redirect, alias, or render another Site Locale.

#### Scenario: A French Canadian route is requested by an English browser

- WHEN a browser requests `/lang/fr-ca/...` with English preferences or cookies
- THEN Core resolves only the exact `fr-CA` Site Locale generation
- AND it never substitutes English, the default locale, or a sibling Site

#### Scenario: A malformed locale segment is requested

- WHEN the segment is unknown, malformed, ambiguous, or unallocated
- THEN Core returns the privacy-safe adverse owner response
- AND no browser/default/country/currency rule chooses another locale

### Requirement: Site Root Entry Uses One Deterministic Default-Locale Redirect

The locale-neutral Site Root Entry MUST NOT be a Page, Giving address, fallback
resolver, or financial identity. Public GET and HEAD MUST return one server-side
`307 Temporary Redirect` to the same Site's exact current ready Default Site
Locale homepage; HEAD MUST have no body. OPTIONS MUST return a bodyless no-store
capability response with `Allow: GET, HEAD, OPTIONS`. Other known unsupported
methods MUST return no-store `405` with that Allow value; unimplemented methods
MAY return no-store `501` and MUST NOT redirect.

The target MUST be server-compiled, one-hop, same-Site, explicit-locale, and
final. Browser language, IP, cookie, profile, currency, provider, and traffic
MUST NOT influence it. Unknown parameters MUST be dropped and source-fragment
inheritance MUST be prevented.

#### Scenario: The Default Site Locale changes

- WHEN a fresh reviewed expected-head activation commits a new default
- THEN subsequent root navigation points to the new exact homepage
- AND every explicit Page/Giving URL and frozen QR/message/document remains
  unchanged

#### Scenario: A POST reaches the Site root

- WHEN the public root receives POST with a body or query
- THEN Core does not redirect it to a locale homepage
- AND it returns the method owner's safe nonredirect response

### Requirement: Default Site Locale Plan Is Private Undated Intent

After first Site activation, staff MAY save at most one Active Default Site
Locale Plan naming an existing same-Site Site Locale. The Plan MUST be private
workflow intent only and MUST NOT change public/default/root/content/Navigation/
route/generation/cache/Giving/currency/provider/money truth. Readiness MUST be a
fresh permission-filtered projection from source owners.

The Plan MUST have no target, launch, due, expiry, or schedule date; no priority,
urgency, timer, reminder, countdown, SLA, or automatic activation. Event and
receipt times remain historical evidence only. Valid terminal outcomes MUST be
Cancelled, Superseded, Activated, Satisfied elsewhere, or No longer applicable.
D16 fresh review MUST remain the only Plan-originated default change.

#### Scenario: Staff saves an unready future default

- WHEN staff saves a Plan for French (Canada)
- THEN the current Default Site Locale and public root remain unchanged
- AND staff sees current blockers and one source-owned next action without a
  launch date or overdue state

#### Scenario: The final blocker clears

- WHEN source-owned evidence becomes ready
- THEN the Plan projection becomes Ready to review
- AND no timer, task, provider, worker, or cache activates the locale

### Requirement: Tenant Account And Site Brands Remain Separate

Each Tenant MUST have exactly one current complete Tenant Donor Account Brand
for its authenticated donor experience. The authenticated Donor Portal for a
Tenant/environment MUST remain unavailable until exactly one current verified
Tenant Donor Portal Host is active for that environment and the current Tenant
brand is complete. Neither host nor brand establishes authorization, and
neither is required for unrelated Tenant or Site work. There MUST be no donor-
visible Asym/platform-host fallback.

Portal-host activation MUST prove ownership, DNS, TLS, platform binding, exact
callback/recovery/sign-out registration, host-only secure session behavior,
Tenant branding, legal/support destinations, and production-shaped auth
recovery. Replacement MUST prove a successor before expected-head cutover.
Host loss MUST never redirect credentials or donors to Asym, another Tenant, a
Site homepage, or a provider; separately governed support and recurring-
cancellation access MUST remain available.

Each Site MUST own complete immutable Site Brand Versions for website and
public-Giving presentation. A Site MAY remain private without a published
version, but first public activation and every favorable public generation MUST
pin exactly one current qualified complete Site Brand Version. Starting from
compatible account-brand inputs MUST create one independent draft, never
inheritance. Site Brand MUST NOT own content, Navigation, account, message,
legal, merchant, payment, or authorization truth.

#### Scenario: A donor enters the portal from two Sites

- WHEN the donor follows validated account actions from Site A and Site B
- THEN both journeys use the same Tenant portal host and Account Brand
- AND entry Site appears only as safe secondary context

#### Scenario: A Site logo fails

- WHEN an optional qualified rendition cannot render
- THEN the public surface uses trusted same-Site text without another Tenant,
  Site, or platform brand
- AND required or cross-scope corruption blocks the release

#### Scenario: Public activation has no qualified complete Site Brand

- WHEN the Site Brand is absent, incomplete, stale, or belongs to another Site
- THEN Go live or successor publication changes no favorable generation
- AND the current public generation, if any, remains unchanged

### Requirement: Site Message Readiness Is A Read-Only Owner Projection

Applicable Site setup/readiness views MUST show one compact Phase 17-derived
Messages summary for the exact Site capabilities and Site Locales. It MUST
preserve Ready, Uses compatible fallback, and Needs attention and MAY present
Checking or Status unavailable. It MUST group permitted exceptions, expose at
most one authorized Phase 17 action, and avoid raw provider/private-message
detail.

The Site surface MUST NOT store message settings/readiness, poll providers,
repair messages, create a task/workflow, or make core website activation depend
on this projection unless an exact capability owner explicitly requires and
re-proves it.

#### Scenario: Provider evidence is unavailable

- WHEN Phase 17 cannot supply a current complete result
- THEN the Site view shows Status unavailable rather than stale Ready or Tenant
  setup failure
- AND no public activation or message mutation derives from the display

### Requirement: Site Locale Publication Uses A Small Critical Contract

Core MUST maintain a small, well-defined, code-owned, versioned Site Locale
Publication Contract. Version 1 MUST contain exactly the critical families for
trusted route/Site/host/locale/generation identity; exact-locale homepage/frame/
Brand/Navigation/language control and invoked support/privacy/legal links;
known-Site adverse pages; complete exact-locale presentation direction/script/
font/bidi/responsive/accessibility; and canonical/alternate/sitemap/robots/
serializer/generation/cache closure. A new universal dependency MUST classify
itself in the same change or fail CI. Tenants MUST NOT add, waive, score, or
percentage-weight members.

Site Locale preparation and preview MUST remain private. The first default
locale MUST activate inside D6 Go live; each later locale MUST use one explicit
locale-named Publish command. Ordinary untranslated content MUST not block and
MUST remain absent from Navigation/search/sitemap/alternate output. Only a
typed authorized same-resource relation MAY offer an explicit other-language
link.

Whole-locale withdrawal MUST be a separate explicit `sites.publish_locales`
lifecycle command. It MUST be blocked while the locale is current default or
has unresolved source-owned public dependencies, preserve route/generation/
history identity, remove favorable discovery without redirect or substitute
locale, and establish the adverse admission fence before advancing the adverse
head. Restoration MUST be a separately authorized successor that re-proves the
current head and every affected source owner; Core MUST never restore admission
automatically after an ambiguous or failed transition.

#### Scenario: French critical path is complete but stories are missing

- WHEN staff previews and explicitly publishes French (Canada)
- THEN one exact immutable French generation becomes favorable
- AND untranslated ordinary stories remain absent rather than rendered in
  another language

#### Scenario: Critical evidence becomes unknown during publish

- WHEN any required member is missing, stale, contradictory, or unauthorized
- THEN publish changes no favorable head
- AND the prior generation or private state remains safe with owner-specific
  recovery

#### Scenario: Staff withdraws the current Default Site Locale

- WHEN the locale remains the current default or a required public dependency
  is unresolved
- THEN whole-locale withdrawal is blocked without changing admission or heads
- AND staff receive the applicable D16 or source-owner action

#### Scenario: Withdrawal fence succeeds but head outcome is unknown

- WHEN adverse admission is acknowledged and the head transition is ambiguous
- THEN the locale remains adverse and the same command needs attention
- AND only explicit reauthorized all-source proof may restore favorable admission

### Requirement: Translation Freshness And Copy Are Source-Governed

Every target revision MUST be Translated with exactly one compatible explicit
Translation Basis, Independently authored with no Basis, or Legacy source
unclassified. Only a changed current authoritative translation input MAY derive
Out of date. Ordinary drift MUST keep reviewed target content public. Only a
registered source-owned safety path may alter prior translation-dependent
public use: a source successor MUST require an initially unselected Keep
reviewed translations public / Make affected translations unavailable
disposition, while an existing explicit adverse-only revocation command MAY
immediately request the same typed, server-derived, fence-first adverse closure.
Neither path creates a central safety classifier or translation workflow.

Suggested translation sources MUST be an optional partial same-Site authoring
order only. Copy MUST offer at most exact qualified Latest saved draft and
Current published version heads. Latest saved draft MUST mean the exact current
server-acknowledged D12 Working Revision. Current published version MUST mean
the exact immutable source revision pinned by D1's current authorized public
generation. Unsaved, debounced, in-flight, outcome-unknown, conflicted,
superseded autosave, schedule, release, restored-history, prior-publication,
provider-latest, and arbitrary-version records MUST NOT be candidates. Equal
compatible copy input MUST collapse to the public row only when that public
head independently qualifies; an unknown or unqualified public head MUST NOT
hide a qualified private sibling. Each head MUST pass exact-revision, purpose-
specific Copy Qualification that exhaustively treats every input. Unknown,
lossy, unclassified, silently omitted, or zero-effect input MUST be unavailable.

Only qualified heads MUST appear in an unselected Source version RadioGroup.
One semantic Unavailable source versions list MUST immediately follow it for
authorized unavailable/unknown heads; nondisclosable heads MUST disappear. With
zero qualified heads, Start blank draft MUST be the direct primary action.

#### Scenario: A qualified private draft is copied

- WHEN an authorized translator selects the exact Latest saved draft
- THEN one immutable source checkpoint and one independent private target with
  explicit Basis are created atomically
- AND first publication remains blocked until the Basis matches or is reviewed
  against the authoritative current source publication

#### Scenario: A head has source issues but is copy-safe

- WHEN Copy Qualification succeeds and source-owned findings exist
- THEN the head remains selectable with truthful non-gating Details/Suggestions
- AND the new target is independently validated after creation

#### Scenario: No source head qualifies

- WHEN every authorized head is unavailable or unknown
- THEN no RadioGroup or disabled Create action is rendered
- AND Start blank draft is the primary action without revealing hidden heads

### Requirement: Domain Roles Establish One Canonical Website Origin

Every publicly activated nonretired Site MUST retain exactly one current
Primary Site Domain, including while serving is suspended. Only it MAY serve
favorable website content and supply new canonical/internal/alternate/sitemap/
social/feed/share origins. A Site MAY have zero or more explicit Redirect Site
Domains, but they MUST NOT serve duplicate content or become another origin.

After stronger source-owned route dispatch, Redirect Site Domains MAY redirect
only route-owner-qualified clean GET/HEAD website navigation one hop to the
current Primary destination. Giving, checkout, protected/auth/callback/API/
control and other source-owned routes MUST retain their own behavior. Vercel
whole-domain redirects, serving aliases, chains, wildcard fallback, and implicit
apex/`www` activation MUST NOT implement this contract.

#### Scenario: A redirect domain receives a Giving request

- WHEN the old domain receives an issued Giving or checkout route
- THEN the Giving/route owner applies its exact current direct/adverse behavior
- AND the domain role does not redirect it to the new Primary

#### Scenario: A Site is suspended

- WHEN website serving is suspended
- THEN its one Primary role and historical origin remain recorded
- AND favorable content remains denied until authorized recovery

### Requirement: Primary Domain Replacement Requires Explicit Former-Domain Choice

Replacing a Primary Site Domain MUST require one initially unselected website-
only choice: Redirect eligible website visits or Stop website use on the old
domain. The review MUST show current/new origins, route-owner outcomes, existing
redirect/loop effects, and explicitly incomplete advisory placements. The
command MUST compile exact compatible public-locale origin successors and
atomically advance Domain and public-generation heads.

Redirect-eligible stable website routes MAY use owner-approved `308`; the
mutable Site Root Entry MUST use its `307`. Responses MUST be one-hop, no-store,
no-referrer, query-allowlisted, and fragment-safe. Stop MUST remove only the
website role and MUST NOT detach provider hosting or change another source-owned
route.

#### Scenario: Staff makes a new domain Primary

- WHEN staff selects one former-domain choice and confirms Make new.example
  primary from current heads
- THEN the new Primary and compatible generation cohort advance atomically
- AND the old domain has exactly the selected website role without changing
  Giving, auth, callbacks, APIs, DNS, or Vercel ownership

### Requirement: Domain Disconnection Requires Complete Owner Clearance

Authorized Tenant staff MUST be able to disconnect one exact custom hostname
only after the complete current finite owner manifest proves no positive Core
hosting dependency. Historical facts and permanent adverse reservations MUST
survive without falsely counting as current hosting.

One transaction MUST establish a monotonic Disconnecting barrier. Every public
admission cohort MUST acknowledge adverse state before a sealed worker removes
only the exact Core-controlled provider routing outside the transaction.
Authenticated provider absence MUST be required before a final transaction ends
the Site binding and global occupancy claim. Ambiguity MUST retain the fence and
claim and show Disconnection needs attention.

#### Scenario: Vercel removal response is lost

- WHEN the provider may have removed the exact association but Core loses the
  response
- THEN the hostname remains fenced and claimed
- AND reconciliation checks authenticated provider state before final release

#### Scenario: A hidden owner still depends on the host

- WHEN the complete owner manifest contains positive, pending, contradictory,
  or undisclosable blocking evidence
- THEN disconnection is unavailable without revealing hidden resource detail
- AND no provider or claim effect occurs

### Requirement: Fresh Domain Claim Uses Current Exact-Host Proof

After final disconnection/release, every authorized Tenant MAY use Add domain.
Core MUST issue a server-generated 256-bit, seven-day, exact-host, one-use TXT
challenge with Type/Name/Value, expiry, last checked, bounded automatic checks,
and Check again. An unproved attempt MUST be private, nonexclusive, provider-
dark, and reserve nothing.

Immediately after trusted DNS observation, one reauthorized transaction MUST
consume the challenge, prove final release/no current claim, acquire the sole
platform-wide hostname claim, create a fresh private binding generation, and
record receipt/audit/outbox. Old positive meaning MUST not follow; permanent
adverse reservations MUST remain. Vercel preparation MUST begin only after the
claim.

#### Scenario: Two valid challenges prove at the same time

- WHEN two Tenants present current valid DNS proof for the same hostname
- THEN exactly one global claim transaction wins
- AND the loser receives a non-enumerating unavailable outcome

#### Scenario: Verification succeeds

- WHEN proof consumption and private binding commit
- THEN staff see Domain verified · Not public
- AND provider assignment, TLS, DNS routing, Site readiness, and public role
  remain separately incomplete until their owners prove them

### Requirement: Same-Tenant Domain Move Is Prepared And Route-Reviewed

A still-connected hostname MUST move between Sites in the same Tenant through
one prepared successor, never mutable reassignment or disconnect/reclaim. Both
Sites' manage and activate capabilities MUST be current. Destination role MUST
start unselected; a source Primary MUST have another eligible Primary.

Before the adverse Moving barrier, one immutable Domain Move Route Review MUST
compare complete source/destination effective-host manifests using a distinct
small, versioned, code-owned Domain Critical Owner-Family Registry. A family is
critical when wrong routing could accept/reinterpret money or another protected
durable effect; authenticate, authorize, establish trusted origin, or complete
a callback; invoke an API, form, provider control/result, or protected action;
choose Domain/root/locale-root/canonical-origin/public admission authority; or
bypass safety, privacy, cache/admission, or route reservation. Every registry
entry MUST pin a stable family key, contract version, precedence, evidence-head
reader, finite result vocabulary, privacy projection, and tests. The registry
MAY share typed adapter infrastructure with the Site Locale Publication
Contract but MUST NOT share membership or authority. Deterministic comparison
MUST classify source-only, target-only, exact collision, current owner-qualified
successor, redirect/history conflict, or unknown. Missing, stale,
contradictory, hidden-blocking, or unknown critical evidence MUST stop the move.

Source-only ordinary routes MUST compile durable real-not-found effects for the
target binding; different-Page exact collisions MUST remain blocked until the
Page owner qualifies a successor or changes the destination path. One command
MUST establish/read back adverse Moving state and atomically advance source,
target, Domain, public, and global current-host heads without releasing the
claim. It MUST perform no DNS/TLS/registrar/email/Vercel-project/content/Giving/
money migration.

#### Scenario: A route manifest has an unknown critical owner

- WHEN the comparison cannot prove the complete required owner result
- THEN the move remains blocked and the current Site stays authoritative
- AND staff receive the owner-specific review action without a guessed route

#### Scenario: The prepared move commits

- WHEN all heads and both-Site authorities remain current after adverse fencing
- THEN the target obtains the selected role and the source loses the host role
  atomically
- AND visitors may observe a bounded neutral gap but never two favorable Sites

### Requirement: Ordinary Page Successor Requires Explicit Purpose Continuity

One exact collision between different Site-owned ordinary General Pages MAY be
resolved only by a Page-owner qualification after proof of same Tenant/
environment, exact locale, route kind, public audience, Publication Reach,
safety, current release, and protected-owner exclusion. An authorized human
MUST compare the fixed pair and make one initially unselected choice about the
same public subject, substantive purpose, and intended visitor task.

The relation MUST be immutable, directional, path-specific, non-symmetric,
non-transitive, and bound to exact evidence while storing stable Page identity,
not URL or similarity. After move activation it MUST pin one sparse Page
Purpose Continuity Version. Only a changed effective meaning-bearing dependency
digest MUST add an unselected keep-purpose/change-purpose choice to the existing
Page Publish review. Runtime MUST NOT perform purpose lookup.

Ordinary Page Successor Qualification MUST record only an immutable prepared
relation and receipt. It MUST create no redirect, route, public generation,
content, Page, Domain, Vercel, or donor effect. Only the owning domain-move/
publication transaction MAY consume the exact relation after rechecking every
pinned source/target head; drift MUST require fresh review.

#### Scenario: Routine delivery rebuild leaves meaning unchanged

- WHEN the effective meaning-bearing digest is unchanged
- THEN no purpose-continuity prompt or new version is created
- AND publication uses the existing owner contract

#### Scenario: Staff confirms the Page still serves the same purpose

- WHEN a changed meaning-bearing candidate is reviewed as preserving purpose
- THEN one successor release may continue every applicable current qualified
  historical address under the same continuity version
- AND every other Page/publication requirement remains independently enforced

### Requirement: Material Page Purpose Change Creates One New Private Page

When staff declare that a candidate changes Page purpose, it MUST NOT publish
through the source Page identity. One contextual Move saved changes to new Page
draft command MUST seal the exact acknowledged candidate and finite transfer
manifest, show old/new title, Parent Page or Top level, full address, transfer/
repair/exclusion/source-clean outcomes, and create exactly one fresh private
same-Site/locale General Page or no authoritative effect.

One atomic D80–D84 transaction MUST record protected source Editorial/Placement
checkpoints, append clean source successors only for changed Page-owned axes,
fence old leases, and resolve target placement. It MAY adopt the exact source
Draft-only Path Claim only after complete positive proof that no canonical
equivalent was ever public/protected/reserved/owned elsewhere. If source cleanup
changes derived private descendant paths, it MUST re-derive the complete
qualified closure while preserving child identity, parent, authored segment,
sibling order, content, History, Navigation, permission, schedule, references,
and public facts. Sibling position MUST preserve positively proved explicit
boundary provenance or a positively recorded append-last default; unknown/stale
provenance MUST return to ordinary placement review.

The source public release, current/historical routes, continuity, Navigation,
schedule, search/cache, donor result, provider state, and money MUST remain
unchanged. Exact replay MUST return the original target/receipt; changed input
MUST conflict.

#### Scenario: A fully qualified material-purpose handoff succeeds

- WHEN all source, path, descendant, placement, lease, authority, and expected-
  head evidence remains current
- THEN one private target and protected source cleanup commit atomically
- AND nothing publishes or changes the live source Page/Navigation/donor result

#### Scenario: One descendant is incompatible

- WHEN any sealed closure member is stale, inaccessible, protected, unknown, or
  lacks one exhaustive qualified outcome
- THEN the entire handoff changes nothing
- AND staff receive the exact ordinary Page-owner action instead of a partial
  subtree rewrite

### Requirement: Presentment Currency Is Qualified And Donor-Controlled

Site policy MUST own only a versioned default and enabled presentment-currency
ceiling. Effective donor availability MUST be the intersection with current
Payments-owned offering-envelope qualification for the exact Tenant,
environment, Site financial route, Legal Entity, Settlement Account Binding,
connected account, currency, gift mode, canonical Money profile, provider
contract/config generation, expiry, and any already-selected cadence or rail.
Amount- and payment-method-specific eligibility MUST be evaluated as those facts
become known.

Adding a currency MUST automatically run one read-only qualification for each
current live route/mode cohort and MUST create no provider customer, intent,
setup intent, subscription, charge, mandate, test payment, or setting. Save MUST
require at least one qualified route, a valid default for dependent entries,
and unchanged policy/evidence fingerprints. Checkout MUST separately re-prove
the exact actual cart, amount, cadence, payment method, limits, binding/account,
provider contract/config generation, and currency immediately before its first
provider effect.

For an empty gift intent, resolution MUST be existing explicit choice, eligible
country-level suggestion, qualified Site default, then explicit choice among
remaining qualified currencies. Donor choice MUST win and one cart MUST use one
currency. Locale, browser language, URL, profile, cookie, Site default without
qualification, provider global support, or location MUST NOT authorize currency.

#### Scenario: CAD is qualified only for one-time gifts

- WHEN staff checks CAD for a Site that lacks recurring qualification
- THEN the UI shows Ready for one-time gifts and Recurring needs setup
- AND Save cannot make CAD available for the unqualified recurring mode

#### Scenario: A donor's location is ambiguous

- WHEN the donor has no explicit currency and the hint is missing/ambiguous
- THEN the qualified Site default is used if available
- AND otherwise the donor explicitly chooses a currently qualified currency or
  Giving fails closed when none exist

#### Scenario: Qualification drifts after setup

- WHEN exact provider/account/mode evidence becomes stale or contradictory
- THEN only the affected new donor option is withheld
- AND selected intent and every accepted gift, agreement, receipt, refund,
  ledger, settlement, and accounting fact remain unchanged

#### Scenario: Exact amount or payment method becomes ineligible

- GIVEN the currency was offered from current route/mode qualification
- WHEN the later exact amount or selected payment method cannot qualify
- THEN the source gift intent remains editable and no provider object is created
- AND the donor receives one accessible correction or currently qualified
  alternative without a hidden currency change

### Requirement: Currency And Schedule Changes Preserve Purpose And Clear Dependencies

A donor MAY change currency or exact Phase 16 schedule only while the affected
gift intent remains editable and no external result is unresolved. A pristine
unanswered transition MAY apply immediately. Once amount, fee, derived total,
payment input/selection, authorization, provider session/secret/attempt, source
schedule detail, or other dependent meaning exists, the complete source intent
MUST remain authoritative until one accessible consequence-specific
confirmation and server-revalidated compare-and-set command succeed.

A currency transition MUST preserve the exact target-valid schedule identity
and other revalidated currency-independent purpose, destination/order,
attribution, contact, tribute, anonymity, comments, consent, form intent, and
unaffected lines while clearing all monetary, fee, payment, authorization, and
provider meaning. A schedule transition MUST preserve the exact cart currency
and revalidated schedule-independent purpose and unaffected intent while
clearing the source schedule and smallest complete affected amount, allocation,
fee, total/claim, payment, mandate, authorization, grouping/cohort, execution-
plan, client-secret, and provider-attempt closure. If the preserved axis is
incompatible with the target, the command MUST write nothing and explain the
incompatibility. Neither transition may silently clear or substitute the other
axis. Target amount MUST be unanswered and target suggestions MUST be
unselected. Neither operation may perform FX, rounding/digit carry, preset-
position mapping, destination substitution, provider proration, or accepted
gift/agreement mutation.

#### Scenario: A donor changes CAD to USD after entering money

- WHEN the donor confirms Change currency to USD from current proof
- THEN the same revalidated purposes remain and all CAD money/payment meaning
  clears atomically
- AND the UI announces Currency changed to USD, focuses the first amount, and
  shows unselected USD choices

#### Scenario: Target proof becomes stale

- WHEN currency/schedule/account/route/capability evidence changes before commit
- THEN the complete source cart remains unchanged
- AND no provider object or partial successor is created

#### Scenario: A donor changes one line's cadence

- WHEN one editable line changes cadence and shares derived payment grouping
- THEN that purpose and unrelated line intent remain
- AND Core rebuilds only the smallest complete affected grouping/execution
  closure with a fresh Phase 16 schedule

### Requirement: Suggested Amounts Are Native Presentation Not Money Authority

Operational Postgres MUST own one immutable versioned Suggested Amount Set per
exact Tenant, Site, ISO presentment currency, and one-time or exact enabled
recurring cadence. A set MUST contain zero to six unique positive checked minor-
unit amounts in ascending order and MUST select none automatically. Ordinary
open Giving MUST retain custom amount.

Staff MUST edit one currency/cadence in context with the shared donor preview
and save through expected revision. Core MUST NOT copy digits between currency
or cadence sets. Set changes MUST apply prospectively to new pristine views and
MUST NOT rewrite selected carts, accepted gifts, agreements, receipts, refunds,
ledger, or accounting history.

Deliberately disabling a currency or cadence MUST retire the corresponding
Suggested Amount Set from public use while preserving every version and
historical reference. Re-enablement MUST remain custom-only until authorized
staff explicitly save a successor reaffirming former or new native values under
current currency, cadence, Money, and qualification policy. A transient
Payments qualification pause MUST preserve the reviewed set but MUST NOT let it
bypass qualification.

#### Scenario: A qualified currency has no suggested amounts

- WHEN the current set is missing or intentionally empty
- THEN the donor receives a clean custom-only amount flow
- AND no setup error or automatic amount is shown

#### Scenario: Staff saves duplicate or invalid values

- WHEN a set contains a duplicate, nonpositive, over-limit, wrong-exponent, or
  seventh value
- THEN the command rejects before creating a successor
- AND the prior set and staff input remain available for correction

### Requirement: Commands Enforce Tenant Scope Concurrency And Idempotency

Every authoritative Phase 24 command MUST derive Tenant, environment, Site,
locale, actor, owner, role/capability/effect, and audit attribution from trusted
server context. It MUST reload current authoritative heads, use deterministic
lock order, compare-and-set expected revisions, enforce structural constraints,
record one immutable business receipt and security-audit reference, and commit
the complete business effect atomically. When asynchronous cache, generation,
provider, or other secondary work is required, the same transaction MUST also
record one deduplicated outbox item. A command with no secondary effect MUST
NOT create placeholder outbox work. Exact semantic replay MUST return the
original receipt; reuse with changed meaning MUST conflict.

Operational tables MUST use full structural scope, same-scope composite foreign
keys, required non-null identity, unique/check constraints, restrictive deletes,
and append-only history. Browser roles MUST receive no direct authoritative
DML. RLS MUST provide matching structural `USING` and `WITH CHECK`; views and
security-definer functions MUST be hardened. Service/worker/Payload/import/
support paths that bypass RLS MUST invoke the same command rules and MUST NOT
accept caller-selected scope or attribution.

Current environment isolation MUST remain structural at the Supabase project/
database boundary and trusted command/cache/audit context, not a partially
persisted child discriminator. Before any shared multi-environment database is
introduced, Site and every dependent unique key and foreign key MUST gain one
non-null environment discriminator in a single governed migration.

#### Scenario: A permitted row update attempts to change Site scope

- WHEN any browser or privileged path tries to move an otherwise permitted row
  to another Tenant/Site/locale/owner
- THEN structural constraints and the common command boundary reject it
- AND no audit attribution or dependent row is written in the forbidden scope

#### Scenario: The response is lost after commit

- WHEN the client retries the exact semantic command
- THEN the existing durable receipt and effect are returned
- AND no second version, provider work item, or public/money effect is created

### Requirement: Providers Are Evidence And Side Effects Not Product Authority

Vercel, DNS, Stripe, Payload, cache, and other provider/network calls MUST occur
outside authoritative database locks and MUST use exact-resource idempotent
owner adapters with discriminated proved-present, proved-absent, pending,
rate-limited, contradictory, and unknown results. Provider-specific status or
success MUST NOT independently advance product lifecycle, public head, domain
role/claim, currency policy, accepted money, or authorization.

Rate limits and retry timing MUST use current qualified provider documentation
and response headers, with bounded coalescing/backoff. No provider or
qualification call MAY run in the public request path. Destructive/subtractive
effects MUST establish an adverse product fence first; ambiguous outcomes MUST
retain that fence and reconcile authenticated provider state before retry or
release.

#### Scenario: Vercel returns 429 during a domain operation

- WHEN the exact operation is rate-limited
- THEN Core retains its safe current claim/barrier, honors current retry
  evidence, and exposes a receipt-backed pending outcome
- AND it does not release, duplicate, or infer success from provider status

#### Scenario: Stripe setup qualification succeeds

- WHEN the side-effect-free adapter proves the exact current route/mode
- THEN Payments may issue qualification evidence
- AND no provider object, Site currency policy, accepted gift, settlement, or
  accounting fact is created by that proof

### Requirement: Public Reads Use Complete Immutable Generations

Every favorable public response MUST resolve a trusted host to one exact
Tenant/environment/Site/domain generation and read one complete immutable Site
Locale Public Generation through the published-content boundary. The generation
MUST pin exact host/base, locale, Brand Version, shell, Navigation, route/content
references, metadata/search inputs, dependency generations, cache identity, and
renderer. Public reads MUST NOT use mutable latest CMS state, provider status,
Default Site fallback, or runtime purpose lookup.

Cache identity MUST include Tenant, environment, Site, trusted host, stable
locale, public-base generation, owner/resource/audience, public generation, and
renderer. Tags MAY invalidate but MUST NOT isolate. Private, preview, unknown,
withdrawn, adverse, and authorization-sensitive responses MUST be no-store.

#### Scenario: A cache entry belongs to another generation

- WHEN host, locale, Brand, route, dependency, or generation identity differs
- THEN the cached value is ineligible
- AND Core reads the exact current admitted generation or fails closed

#### Scenario: Compact edge admission is exhausted

- WHEN the bounded edge projection cannot prove current favorable admission
- THEN it denies before streaming rather than scanning Postgres or broadly
  allowing
- AND the authoritative runtime recheck remains required

### Requirement: Staff Donor And Public UX Is Accessible Honest And Recoverable

Phase 24 staff surfaces MUST use persistent Tenant/Site context, quiet healthy
summaries, exception-first blockers, owner language, and at most one authorized
next action. Public/destructive actions MUST use consequence-labelled buttons,
not toggles, and MUST show exact changed/unchanged outcomes. Applying,
Publishing, Moving, Disconnecting, and Confirming outcomes MUST survive reload
and remain visible until authoritative readback; a toast MUST NOT be the only
result.

All staff, donor, and public journeys MUST meet WCAG 2.2 AA, be operable by
keyboard/screen reader/touch at 320 CSS pixels and 400% zoom, support forced
colors/reduced motion, use correct native language labels/`lang`/`dir`/bidi,
handle CJK and IDNs, show explicit time zones, and recover safely on weak
networks. Negative responses, counts, statuses, caches, logs, and support views
MUST NOT disclose foreign Tenant, unpublished/restricted locale, restricted
ministry/location, donor, owner, or financial facts.

#### Scenario: A destructive review opens

- WHEN an authorized user reaches the confirmation
- THEN the safe cancel/keep action has initial focus and consequences are
  available to assistive technology
- AND confirmation remains explicit rather than executing on toggle change

#### Scenario: A response is lost on a weak connection

- WHEN the operation may have committed
- THEN reload/readback presents the durable outcome or Confirming state
- AND retry cannot duplicate the business effect

### Requirement: Rollout And Operations Fail Closed

Readers, constraints, negative occupancy, durable receipts, and adverse fences
MUST deploy before new writers or favorable cohort activation. Migration MUST
inventory and evidence-classify Sites, hosts, routes, locale fields, CMS heads,
Money readers/rows, callbacks, caches, provider bindings, and historical claims.
Unknown or ambiguous history MUST quarantine and MUST NOT be inferred from
default, title, URL text, traffic, country, currency, provider, or majority use.

Mixed-version deployments MUST retain compatible successor readers and reject
unsupported writes. After new public/provider facts exist, rollback MUST disable
new commands, retain immutable history/claims/receipts/adverse state, and repair
forward rather than restore predecessor writers.

Operations MUST correlate PII-minimal technical attempts, immutable business
receipts, security audit, outbox, provider evidence, generation acknowledgement,
and user-visible outcome. Release MUST prove: Site-suspension p99 acknowledgement
within five seconds and zero required favorable route after thirty seconds;
host-admission p99 within 15 ms at qualified load; Copy-source p95 within 300 ms
at the supported maximum catalog; root-navigation p75 LCP within 2.5 seconds;
and zero mixed-generation, money mismatch, cross-Tenant, or double-favorable-
host outcome.

#### Scenario: An old application writes after the schema transition

- WHEN a mixed-version writer lacks the new structural command contract
- THEN the write is rejected without partial compatibility state
- AND compatible readers continue serving the last safe authoritative facts

#### Scenario: A post-public rollback is requested

- WHEN new immutable claims or public generations already exist
- THEN rollout disables new commands and preserves all history/adverse fences
- AND recovery proceeds forward without releasing identities or re-enabling old
  writers
