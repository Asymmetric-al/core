# Multi-Site Management

## ADDED Requirements

### Requirement: Site Is Stable Presentation And Attribution Context

A Site MUST be one stable, behavior-neutral child of exactly one Tenant.

Every clause in `openspec/contracts/multi-site-management.md#contract-99532f8e7e00f136ecc1` MUST apply without exception.

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

Exactly one current Default Site MUST exist per Tenant and environment.

Every clause in `openspec/contracts/multi-site-management.md#contract-dae2755d20bca29081ad` MUST apply without exception.

#### Scenario: An unknown host reaches Core

- WHEN a request uses an unknown, malformed, disabled, or transferred host
- THEN Core applies the owner-defined fail-closed response
- AND it does not resolve the Tenant's Default Site

#### Scenario: Two staff users change the default concurrently

- WHEN two valid changes race from the same expected head
- THEN exactly one successor becomes current
- AND the loser receives a stale-review result without moving any existing fact

### Requirement: Site Activation Is Explicit And Capability-Specific

First favorable Site activation MUST require one complete private production- faithful preview and one explicit Go live command.

Every clause in `openspec/contracts/multi-site-management.md#contract-d94d69ffdfd288a92985` MUST apply without exception.

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

The product MUST expose separate consequence-labelled commands for Take website offline and Pause new gifts from this Site.

Every clause in `openspec/contracts/multi-site-management.md#contract-7a0ddd5cfd46846f6550` MUST apply without exception.

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

Site retirement MUST be a terminal transition for one exact Tenant, environment, and Site.

Every clause in `openspec/contracts/multi-site-management.md#contract-8cff7fcd08005bed1c07` MUST apply without exception.

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

An old retired-Site address that still reaches Core MUST return the same neutral platform `404` as an unknown/privacy-ineligible address unless its route owner has recorded a current exact same-Tenant/environment/locale/audience/safety/ visitor-task/subject/purpose successor.

Every clause in `openspec/contracts/multi-site-management.md#contract-176db9c009b526900d01` MUST apply without exception.

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

The standard Giving address MUST be `{Site Locale Public Base}/give/{staff- chosen-slug}`. `/give/` MUST be code-owned and reserved.

Every clause in `openspec/contracts/multi-site-management.md#contract-e15f395dcfacfa2e810c` MUST apply without exception.

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

After a Preferred Giving Address changes, Giving MUST record only the preference occurrence.

Every clause in `openspec/contracts/multi-site-management.md#contract-d3f19a7a414a469f13eb` MUST apply without exception.

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

A Site Locale MUST be stable Site-owned public presentation identity expressed as one canonical BCP 47 locale under a versioned standards profile.

Every clause in `openspec/contracts/multi-site-management.md#contract-b757096cde3e1d88651b` MUST apply without exception.

#### Scenario: A French Canadian route is requested by an English browser

- WHEN a browser requests `/lang/fr-ca/...` with English preferences or cookies
- THEN Core resolves only the exact `fr-CA` Site Locale generation
- AND it never substitutes English, the default locale, or a sibling Site

#### Scenario: A malformed locale segment is requested

- WHEN the segment is unknown, malformed, ambiguous, or unallocated
- THEN Core returns the privacy-safe adverse owner response
- AND no browser/default/country/currency rule chooses another locale

### Requirement: Site Root Entry Uses One Deterministic Default-Locale Redirect

The locale-neutral Site Root Entry MUST NOT be a Page, Giving address, fallback resolver, or financial identity.

Every clause in `openspec/contracts/multi-site-management.md#contract-91fd14b419054cb8f228` MUST apply without exception.

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

After first Site activation, staff MAY save at most one Active Default Site Locale Plan naming an existing same-Site Site Locale.

Every clause in `openspec/contracts/multi-site-management.md#contract-94d79d00c7ab1c01b221` MUST apply without exception.

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

Each Tenant MUST have exactly one current complete Tenant Donor Account Brand for its authenticated donor experience.

Every clause in `openspec/contracts/multi-site-management.md#contract-566265669770b70dc275` MUST apply without exception.

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

Applicable Site setup/readiness views MUST show one compact Phase 17-derived Messages summary for the exact Site capabilities and Site Locales.

Every clause in `openspec/contracts/multi-site-management.md#contract-679139a6e2dd61291ec7` MUST apply without exception.

#### Scenario: Provider evidence is unavailable

- WHEN Phase 17 cannot supply a current complete result
- THEN the Site view shows Status unavailable rather than stale Ready or Tenant
  setup failure
- AND no public activation or message mutation derives from the display

### Requirement: Site Locale Publication Uses A Small Critical Contract

Core MUST maintain a small, well-defined, code-owned, versioned Site Locale Publication Contract.

Every clause in `openspec/contracts/multi-site-management.md#contract-d1a429a178ee24bf67a6` MUST apply without exception.

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

Every target revision MUST be Translated with exactly one compatible explicit Translation Basis, Independently authored with no Basis, or Legacy source unclassified.

Every clause in `openspec/contracts/multi-site-management.md#contract-067719d10aea765ad58c` MUST apply without exception.

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

Every publicly activated nonretired Site MUST retain exactly one current Primary Site Domain, including while serving is suspended.

Every clause in `openspec/contracts/multi-site-management.md#contract-5c3903dd1022b0b28f7a` MUST apply without exception.

#### Scenario: A redirect domain receives a Giving request

- WHEN the old domain receives an issued Giving or checkout route
- THEN the Giving/route owner applies its exact current direct/adverse behavior
- AND the domain role does not redirect it to the new Primary

#### Scenario: A Site is suspended

- WHEN website serving is suspended
- THEN its one Primary role and historical origin remain recorded
- AND favorable content remains denied until authorized recovery

### Requirement: Primary Domain Replacement Requires Explicit Former-Domain Choice

Replacing a Primary Site Domain MUST require one initially unselected website- only choice: Redirect eligible website visits or Stop website use on the old domain.

Every clause in `openspec/contracts/multi-site-management.md#contract-93fc7ed2abdd0fd55715` MUST apply without exception.

#### Scenario: Staff makes a new domain Primary

- WHEN staff selects one former-domain choice and confirms Make new.example
  primary from current heads
- THEN the new Primary and compatible generation cohort advance atomically
- AND the old domain has exactly the selected website role without changing
  Giving, auth, callbacks, APIs, DNS, or Vercel ownership

### Requirement: Domain Disconnection Requires Complete Owner Clearance

Authorized Tenant staff MUST be able to disconnect one exact custom hostname only after the complete current finite owner manifest proves no positive Core hosting dependency.

Every clause in `openspec/contracts/multi-site-management.md#contract-3d422dbf58851d31de83` MUST apply without exception.

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

Every clause in `openspec/contracts/multi-site-management.md#contract-07cc8b1849d5633c11b9` MUST apply without exception.

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

A still-connected hostname MUST move between Sites in the same Tenant through one prepared successor, never mutable reassignment or disconnect/reclaim.

Every clause in `openspec/contracts/multi-site-management.md#contract-fbb8aca8c85821654da1` MUST apply without exception.

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

One exact collision between different Site-owned ordinary General Pages MAY be resolved only by a Page-owner qualification after proof of same Tenant/ environment, exact locale, route kind, public audience, Publication Reach, safety, current release, and protected-owner exclusion.

Every clause in `openspec/contracts/multi-site-management.md#contract-a829aacaa6a102c37439` MUST apply without exception.

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

When staff declare that a candidate changes Page purpose, it MUST NOT publish through the source Page identity.

Every clause in `openspec/contracts/multi-site-management.md#contract-876e36e787b8e6c6d053` MUST apply without exception.

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

Site policy MUST own only a versioned default and enabled presentment-currency ceiling.

Every clause in `openspec/contracts/multi-site-management.md#contract-68d877fb0f30fca4d7e4` MUST apply without exception.

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

A donor MAY change currency or exact Phase 16 schedule only while the affected gift intent remains editable and no external result is unresolved.

Every clause in `openspec/contracts/multi-site-management.md#contract-eb24e1afb9a42f44aaf1` MUST apply without exception.

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

Operational Postgres MUST own one immutable versioned Suggested Amount Set per exact Tenant, Site, ISO presentment currency, and one-time or exact enabled recurring cadence.

Every clause in `openspec/contracts/multi-site-management.md#contract-faf1066cd01843f5545c` MUST apply without exception.

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

Every authoritative Phase 24 command MUST derive Tenant, environment, Site, locale, actor, owner, role/capability/effect, and audit attribution from trusted server context.

Every clause in `openspec/contracts/multi-site-management.md#contract-f791e2b5b6499fcd2627` MUST apply without exception.

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

Vercel, DNS, Stripe, Payload, cache, and other provider/network calls MUST occur outside authoritative database locks and MUST use exact-resource idempotent owner adapters with discriminated proved-present, proved-absent, pending, rate-limited, contradictory, and unknown results.

Every clause in `openspec/contracts/multi-site-management.md#contract-e3347eff1ceb520a4f6b` MUST apply without exception.

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

Every favorable public response MUST resolve a trusted host to one exact Tenant/environment/Site/domain generation and read one complete immutable Site Locale Public Generation through the published-content boundary.

Every clause in `openspec/contracts/multi-site-management.md#contract-b6fbe540cbcf14f33d65` MUST apply without exception.

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

Phase 24 staff surfaces MUST use persistent Tenant/Site context, quiet healthy summaries, exception-first blockers, owner language, and at most one authorized next action.

Every clause in `openspec/contracts/multi-site-management.md#contract-15e69a9deae36ef18d20` MUST apply without exception.

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

Readers, constraints, negative occupancy, durable receipts, and adverse fences MUST deploy before new writers or favorable cohort activation.

Every clause in `openspec/contracts/multi-site-management.md#contract-7d09ff023b59ef4ef50a` MUST apply without exception.

#### Scenario: An old application writes after the schema transition

- WHEN a mixed-version writer lacks the new structural command contract
- THEN the write is rejected without partial compatibility state
- AND compatible readers continue serving the last safe authoritative facts

#### Scenario: A post-public rollback is requested

- WHEN new immutable claims or public generations already exist
- THEN rollout disables new commands and preserves all history/adverse fences
- AND recovery proceeds forward without releasing identities or re-enabling old
  writers
