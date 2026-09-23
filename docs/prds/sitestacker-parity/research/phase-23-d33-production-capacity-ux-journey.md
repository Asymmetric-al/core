# Phase 23 D33 — Production Capacity UX and Service-Journey Contract

**Status:** Complete UX/service-journey contract supporting the founder-ratified
exact Phase 23 D33 C-prime-R decision. It explains the decision without
independently expanding the ratified authority or authorizing implementation.  
**Date:** 2026-08-24  
**Scope:** User experience for one versioned, provider-neutral Production
Capacity Profile qualified for Vercel  
**Product boundary:** Web Studio, D1 release preparation and activation, public
Sites, package qualification, support, and operations

## Executive decision

Capacity is an **operational product contract**, not a tenant quota product.
Ordinary staff, missionaries, donors, and public visitors should not have to
understand Vercel Functions, regions, cache hits, data transfer, database pools,
queue depth, provider spend, or the Production Capacity Profile itself.

The recommended experience has three layers:

1. **Normal work remains quiet.** Web Studio keeps the familiar Page, Preview,
   and release journeys. The public Site renders ordinary useful HTML without a
   capacity badge, performance score, loader ceremony, or provider branding.
2. **A delayed or failed task explains product truth where the task lives.** It
   states what is happening, whether the command was durably accepted, what is
   still safely live or saved, and what the user should do next. It does not
   expose infrastructure or invite duplicate retries.
3. **Capacity and cost evidence remain operator-only.** Authorized support and
   operators receive the active profile version, exact affected surface,
   saturation or cost dimension, visitor impact, protective action, and
   recovery proof. D31 translates only material user-facing exceptions into
   quiet product language; D30 governs rare deep diagnostics.

The system must absorb ordinary scale through bounded work, caching, fair
queuing, and safe degradation. It must not ask a ministry to delete Pages,
remove languages, reduce imagery, or simplify its brand merely because the
platform is under-provisioned. A genuinely unsupported workload is handled as
an explicit support and capacity-planning case, never as a shameful score,
surprise bill, or repeated inline warning.

## Inherited authority and UX constraints

D33 must preserve the following ratified decisions:

- **D1:** one exact Public Site Generation is the only ordinary public release
  truth. Failed candidate preparation leaves the current generation serving.
  Cache, CDN, search, crawler, and public visibility are separately observable
  facts.
- **D9:** custom Presentation Packages may be visually distinctive, but their
  exact versions must meet accessibility, responsive, no-JavaScript, security,
  Core Web Vitals, and resource budgets. Package defects belong to Asym or the
  named maintainer, not the editor.
- **D17:** public search is a derived projection with adverse-first admission
  proof. Search lag and rebuilds use the settled quiet status vocabulary and
  do not become a generic capacity dashboard.
- **D25:** Page Preview and immutable whole-Site Preview Candidates remain
  private, exact, complete-or-unavailable, and side-effect-dark. Capacity may
  delay candidate preparation but cannot introduce a mutable staging Site,
  partial preview, or provider deployment as a second release head.
- **D27:** public media uses immutable qualified renditions, direct bounded
  delivery, truthful weak-network upload progress, and exact adverse expiry.
  D33 cannot turn media capacity into mutable URLs, duplicate transforms, or a
  public-on-upload shortcut.
- **D30:** Supabase Auth and Phase 12 remain staff authority. Provider
  diagnostics are incident-bound and read-only; provider access never becomes
  an ordinary staff fallback.
- **D31:** Content Health is the quiet exception-first staff explanation.
  Source-owned typed commands own recovery, and stale evidence can never show a
  false green state.
- **D32:** Web Studio and generated output remain accessible by construction.
  Performance pressure cannot weaken accessibility invariants or convert
  tenant editorial choices into scores, blockers, or blame.

## Primary UX evidence applied

The contract applies the following current guidance:

- Good public Core Web Vitals are assessed at the 75th percentile, with LCP at
  or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below
  0.1. These are user-experience floors, not dashboard decoration. Vercel Speed
  Insights uses real-user data and supports P75 plus higher percentiles, device,
  environment, route, and geography breakdowns. Field evidence must therefore
  be segmented and privacy-reviewed rather than collapsed into one score.
- WCAG 2.2 requires programmatically determinable status messages without
  stealing focus. Capacity progress and recovery changes use a restrained
  `role="status"` pattern; urgent alerts are reserved for genuinely urgent
  changes, not ordinary queue movement.
- Resilient services should have more than on/off states, preserve minimal or
  read-only functions when safe, queue work when a dependency is down, and tell
  users plainly about actual downtime. Progressive enhancement keeps essential
  content and navigation useful when JavaScript, a CDN, or a network fails.
- Service-wide notification banners should be sparse. A message directly
  related to the current task belongs beside that task; a single neutral banner
  is reserved for a material service-wide condition.

These principles support quiet product truth. They do not authorize a Vercel
score in tenant UI, exact savings claims, or provider-specific public copy.

## People and their actual goals

| Person                          | Primary goal                                                        | Capacity information they need                                                                                  | Capacity information they do not need                                              |
| ------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Occasional tenant editor        | Open, change, save, and preview one Page without losing work        | Whether the exact change is saved; whether Preview is current; one recovery action                              | Provider, queue, pool, cost, region, cache, or other tenants                       |
| Site admin or releaser          | Review and release a coherent Site change with confidence           | Exact release state, current-live continuity, affected scope, expected next check, verified outcome             | Vercel deployment aliases, ISR internals, function duration, billing SKUs          |
| Missionary or ministry leader   | See and share the correct public Page, often from mobile            | Useful content, normal links, correct locale, truthful temporary unavailability                                 | The CMS, generation identifiers, capacity profile, provider incident details       |
| Donor or public visitor         | Find a cause, understand it, and complete a safe action quickly     | Stable content, responsive controls, an explicit outcome for giving/forms                                       | Staff status, cost pressure, retries, background work, tenant rankings             |
| Support teammate                | Explain impact and collect a safe receipt without guessing          | Product state, last verified outcome, active organization/Site, correlation receipt, next owner                 | Raw private content, credentials, unrestricted provider console                    |
| Operator                        | Protect public truth, safety work, fairness, performance, and spend | Profile version, evidence freshness, saturation/cost unit, affected surface, current protection, recovery proof | Unbounded content labels in metrics or an all-tenant write console                 |
| Package developer or maintainer | Make a bespoke package pass its certified experience budgets        | Exact artifact/version, route fixture, device/network cohort, failed budget, evidence, fallback result          | Tenant operational records, donor data, production secrets, mutable runtime access |

## Information architecture

### Tenant staff

D33 adds **no tenant-facing Capacity workspace**, score, quota page, provider
settings screen, or billing dashboard.

Capacity appears only through existing product surfaces:

- the document state area for save/autosave acknowledgement;
- **Preview page** and **Prepare site preview** for preview preparation;
- the Site release workspace for release preparation, activation, and
  verification;
- a compact D31 Health Status on an affected Page, Site, media item, schedule,
  or search profile; and
- the D31 **Content health** workspace only after an exception becomes
  actionable, materially delayed, incomplete, or platform-owned.

There is never a permanent green capacity badge. A healthy Site is quiet.

### Public visitors

There is no capacity chrome on a healthy public Site. Server-rendered content,
normal links, native scrolling, stable image dimensions, and the exact active
D1 generation remain the experience. If one optional component is unavailable,
the explanation stays inside that component. A full service interruption uses
one small, branded, provider-neutral unavailable page rather than a blank
screen, endless spinner, fake loading animation, or raw platform error.

### Support and operations

An operator-only **Production capacity** surface may exist under the Asym
operations product, never under ordinary Web Studio navigation. Its default is
exception-first and contains:

1. active provider-neutral profile version and qualification attachment;
2. public experience by device and route family, with field-evidence freshness;
3. Web Studio and D1 operation latency, error, and outcome-unknown counts;
4. oldest durable-work age and fairness/dead-letter exceptions by product
   family;
5. database connection, lock, slow-query, and growth evidence;
6. Vercel-qualified compute, request, transfer, cache, image, build, telemetry,
   and spend dimensions using current provider vocabulary;
7. active protective posture and what remains intentionally available; and
8. recovery verification and the last known-good evidence package.

The surface must not become a generic provider console, arbitrary query tool,
or D31 replacement. Deep provider inspection follows D30 only after product
evidence cannot answer an open incident.

### Package certification

Package developers receive an artifact-bound certification report outside
ordinary Page editing. It compares the exact package version against the
active Production Capacity Profile using representative actual-content
fixtures, device/network cohorts, no-JavaScript output, reduced motion, and
fallback behavior. Tenant staff see only compatible admitted choices. They do
not see bundle diagnostics or fix source code.

## One source-derived status model

The UI must derive status from authoritative receipts and current evidence;
the browser timer alone never decides that an operation succeeded or failed.

| Product fact                                                           | Staff-facing state                           | Required explanation                                                                  | Permitted action                                                                          |
| ---------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Local input has not reached the server                                 | **Unsaved changes**                          | “These changes are only in this browser.”                                             | **Save now** if the owning editor permits it                                              |
| Server is processing a save                                            | **Saving**                                   | Keep the last acknowledged revision visible                                           | None; editing may continue only under D12 rules                                           |
| The notice threshold is crossed but no failure is known                | **Saving is taking longer than usual**       | “Your last saved version is safe.”                                                    | **Check connection** only when the browser is actually offline                            |
| Exact save acknowledgement exists                                      | **Saved at _time_**                          | Absolute local time and zone in details                                               | None                                                                                      |
| Outcome is unknown                                                     | **We could not confirm the save**            | Name the last acknowledged revision and that reconciliation is running                | No blind retry; offer the D12 recovery path after current-state readback                  |
| Release intent is durably accepted but not started                     | **Waiting to prepare**                       | “Your live site is unchanged.” Show submitted time                                    | **View details**; cancel only if the release owner has a proven pre-effect cancel command |
| Release preparation is active                                          | **Preparing release**                        | Show bounded stage in product language, not attempt count                             | Leave page safely; return through the receipt                                             |
| Preparation exceeds its product budget                                 | **Release is taking longer than usual**      | State current live continuity and the next automatic check                            | **View content health** only when D31 has admitted an issue                               |
| Exact D1 activation receipt exists but external convergence is pending | **Released · verifying public update**       | Distinguish released from visible everywhere                                          | **View live site** only for currently admitted public routes                              |
| Public convergence is verified                                         | **Public update verified**                   | Exact verification time                                                               | None                                                                                      |
| Preparation fails before D1 activation                                 | **New release could not be prepared**        | “Your live site is unchanged.” Name the cause owner                                   | Source-specific action or **View content health**                                         |
| Platform cannot accept new release work                                | **New releases are temporarily unavailable** | “You can keep editing. Your live site is unchanged.”                                  | None except safe support details; do not invite repeated clicks                           |
| A safe prior state is selected for forward recovery                    | **Preparing recovery release**               | Name the exact public state being used as input; never call this destructive rollback | View progress; activation still requires D1 proof                                         |
| Evidence required for a favorable claim is stale                       | **Health check incomplete**                  | Name the unchecked surface in product language                                        | D31-owned safe next step                                                                  |

### Status transition rules

1. The operation-specific Production Capacity Profile owns numeric notice,
   lateness, and breach thresholds. The UI vocabulary above is stable across
   profile versions; numbers never drift independently in components.
2. A button shows immediate pressed/busy feedback, but routine autosaves and
   queue ticks do not generate a toast or screen-reader announcement.
3. **Waiting to prepare** means a durable command receipt exists. A client-side
   request in flight is not queued work.
4. **Released** requires the D1 activation receipt. Worker completion, cache
   invalidation, a 200 response from a provider, or a toast is insufficient.
5. **Verified** requires the owning product readback. It never means every
   browser, crawler, external cache, or previously downloaded copy has changed.
6. **Retry** is not a generic action. A retry appears only as a named,
   cause-owned, idempotent command after current-state readback proves it is
   safe. Unknown outcomes reconcile first.
7. Only one material status message is announced for a transition. Progress
   percentages or attempt changes are not repeatedly announced.
8. Async status never steals focus. Focus moves only after user navigation or
   into a user-opened dialog, then returns to the invoking control.

## Journey 1 — Ordinary tenant editor

### Healthy path

1. The editor enters Web Studio through the existing D30 Supabase-authenticated
   shell. The header names organization, Site, environment, Page, and locale.
2. Navigation and the Page heading render before secondary panels. There is no
   Capacity card, Vercel badge, or green performance score.
3. Local controls respond immediately. Save state stays beside the document
   state, not in transient toasts.
4. **Saved at _time_** appears only after the exact D12 acknowledgement.
5. **Preview page** uses the last acknowledged exact revision. The editor is
   never shown a newer browser-only state as if it were saved.
6. The editor can leave after a durable background receipt exists; returning
   resolves current state from the server rather than a stale browser timer.

### Cold start or temporarily slow response

- Preserve the Studio shell, Page heading, scope, and last safe document state.
  Do not replace the entire screen with a pulsing skeleton.
- Use stable text—**Opening page**, then **This is taking longer than usual**
  after the profile's notice threshold—without revealing cold starts, regions,
  or function instances.
- If the Page can be read but a secondary history, media, or Preview panel is
  late, keep editing available and mark only that panel.
- Never shorten or bypass authorization, exact-version reads, or D32 checks to
  make the spinner disappear.

### Weak or interrupted connection

- The editor sees **Connection lost. Your last saved version is safe.** The
  exact last acknowledged time remains visible.
- The product does not claim full offline editing. D12's bounded recovery owns
  any unsaved browser work.
- Reconnection performs current-state and authority readback before enabling a
  new save. It does not replay stale mutations automatically.
- An upload or background preparation continues only if its server receipt says
  it continues. A local progress bar is not evidence.

### Overload or provider impairment

- Editing stays available when the authoritative save path is healthy even if
  Preview or release preparation is deferred.
- If saving cannot be accepted, show one persistent inline state before the
  editor leaves: **We cannot save new changes right now. Your last saved version
  is safe.** Use D12 recovery for unsaved work.
- If only new Preview/release work is unavailable, do not cover the editor with
  a global error. Disable only the affected action and say exactly what remains
  safe.
- Do not say “your Site is too large,” “too many users,” “quota exceeded,”
  “Vercel limit,” or “upgrade your plan.”

## Journey 2 — Site admin and releaser

### Prepare and release

1. The release workspace names exact Site, locale, included saved changes, and
   current public generation in ordinary product terms.
2. **Prepare release** performs admission before expensive work. The first
   durable response is either a receipt or a clear no-effect failure.
3. Accepted work may become **Waiting to prepare**. The admin can navigate away;
   the receipt remains URL-addressable and current after reload or another tab.
4. **Preparing release** shows product stages such as **Checking content**,
   **Preparing pages and media**, and **Activating public update** only when
   those distinctions help. It never exposes function invocations, cache tags,
   database locks, or queue attempts.
5. D1 either activates the exact complete successor or keeps the current
   generation. A partial Site never appears public.
6. The success path distinguishes **Released**, **Verifying public update**, and
   **Public update verified**.

### Backlog and scheduled work

- Accepted work shows submitted time, the next automatic check, and whether the
  scheduled public time is still achievable. “Soon” is not a deadline.
- Routine queue movement remains contextual and does not badge global
  navigation.
- When the lateness promise is crossed, the same issue enters D31 as **Being
  handled automatically** or **Needs platform attention**. It does not acquire
  a generic Retry button.
- Adverse withdrawal, safety containment, and current public truth receive
  priority over favorable publication. The UI may say **Safety update in
  progress** without exposing protected reasons to unauthorized staff.

### Failed preparation

The first sentence must state the consequence:

> **New release could not be prepared. Your live site is unchanged.**

Then show:

- the exact Site and locale;
- the saved input revision or candidate receipt;
- whether any staff correction is possible;
- who acts next—**Your team**, **Automatic recovery**, or **Asym**;
- the next automatic check or verified time; and
- one source-owned action such as **Open Page**, **Review media**, or **View
  content health**.

Provider errors, raw logs, billing, and stack traces remain under D30-governed
operations detail.

### Recovery from a bad or regressed release

The product does not offer a destructive **Roll back** button that mutates
history. It offers **Prepare recovery release**, explains the last proven public
generation being selected as input, re-proves current authority and adverse
facts, and activates a newly validated D1 successor. A provider deployment
rollback and a content recovery release are distinct operator workflows and
must never share one ambiguous control.

## Journey 3 — Donor, missionary, and public visitor

### Healthy and cold-cache visits

- Render meaningful server HTML, heading, primary content, Navigation, and
  ordinary links without waiting for nonessential JavaScript.
- Reserve image dimensions and use D27-qualified responsive renditions so cold
  caches do not produce layout shifts or duplicate transformation work.
- Show no loading screen solely to create a branded effect. D9 animation and
  presentation remain expressive but cannot hide content, hijack scroll, delay
  giving, or ignore reduced motion.
- A missionary sharing a public profile and a donor opening it receive the same
  canonical current D1 generation for that Site and locale.

### Mobile and constrained networks

- Essential content and actions remain in semantic source order at 320 CSS
  pixels and high zoom. Visual effects, autoplay media, and optional scripts
  do not gate reading or navigation.
- Native links preserve open-in-new-tab, copy, Back/Forward, and no-JavaScript
  use. Search and lists retain D16's link-native windows rather than requiring
  an endless client feed.
- Image and font choices remain bounded by the package and media profiles.
- Status or retry controls have Core's 44-by-44-pixel touch target floor,
  visible focus, non-color text, and no pointer-only gesture.

### Optional component degradation

If a safe secondary source such as a dynamic list, search, or an external
embed is temporarily unavailable, keep the Page shell and authoritative static
content. The component says, for example:

> **Updates are temporarily unavailable. The rest of this page is still
> available.**

Offer **Try again** only for a safe idempotent read. Do not auto-retry in a loop,
shift the layout repeatedly, or replace missing content with another Site,
locale, Tenant, or stale favorable source.

### Giving and form actions

- Public content capacity cannot assert a payment, form, subscription, or
  notification outcome. The owning app or domain supplies the authoritative
  result.
- If giving cannot start, say **Giving is temporarily unavailable. No gift has
  been submitted.** A configured source-authoritative alternative contact may
  appear; an improvised email address may not.
- If an outcome is unknown after submission, do not invite an immediate second
  gift or duplicate form submission. Reconcile through the owning receipt and
  explain the last confirmed state.
- Cost protection may defer previews, rebuilds, and favorable background work;
  it must not silently disable an admitted public giving path or claim success.

### Full public-runtime incident

When the active public generation cannot be served at all, use one compact,
tenant-branded, provider-neutral unavailable page that states:

> **This site is temporarily unavailable. We are working to restore it.**

It includes a stable status/support destination only if that destination is
outside the same failure blast radius and authorized for public use. It never
prints Vercel, a deployment identifier, a stack trace, an incident secret, or a
countdown the product cannot guarantee. Repeated automatic refresh is
forbidden.

## Journey 4 — Support and operator

### Support starts from product evidence

1. Staff copy a D30-safe support receipt containing organization, Site,
   product route, action, local absolute time and zone, last acknowledged state,
   outcome class, and correlation identifier—never content, credentials, or a
   signed URL.
2. Support opens the exact D31 issue or source receipt and determines public
   impact, next owner, and evidence freshness.
3. If the product evidence is sufficient, support explains the product state
   without opening a provider console.
4. If it is insufficient and an incident is open, an authorized operator uses
   D30's bounded read-only Engine Diagnostics Session.
5. Any correction returns through a typed, current-state-fenced product command.

### Operator capacity triage

The operator-only view answers, in order:

1. **What user journey is affected?** Public read, giving handoff, Web Studio
   read/save, Preview, release, search, media, schedule, or telemetry.
2. **What current truth is protected?** Active D1 generation, last acknowledged
   edit, adverse containment, accepted durable work, or no-effect rejection.
3. **Is the evidence fresh?** Field sample time, load-test profile, database
   readback, queue watermark, and provider usage window.
4. **Which bounded resource is pressured?** Compute, requests, transfer, cache,
   image transformation, build, telemetry, database, or durable work.
5. **Is one Tenant being harmed or harming fairness?** Use authorized bounded
   operational scope; never expose comparative tenant rankings to staff.
6. **Which protective posture is active?** Normal, smoothing favorable work,
   deferring optional work, protecting live service, or recovery.
7. **What proves recovery?** Product readback and sustained budget compliance,
   not a provider alert clearing.

### Cost anomaly journey

1. An operator alert states the provider-neutral unit that changed and the
   Vercel billing dimension that implements it, the observation window, current
   profile baseline, evidence quality, and user impact. It does not invent a
   dollar saving or blame a Tenant.
2. Protection order is explicit:
   - preserve current safe public generations and adverse/safety work;
   - preserve authoritative giving/form outcome paths;
   - fair-queue favorable publication and convergence work;
   - defer optional Preview rebuilds, broad reconciliations, and nonessential
     evidence work within their settled contracts; and
   - reduce optional telemetry only through its approved sampling policy, never
     by deleting required evidence.
3. Pausing the production project or applying a hard provider spend action is
   not an automatic response to a budget notification. Such an action could
   take every tenant Site offline and therefore requires an independently
   authorized incident policy and explicit consequence review.
4. Ordinary staff see only any real product impact—such as **New site previews
   may take longer while Asym handles a platform issue**—not the bill, provider
   SKU, another tenant's usage, or an instruction to simplify content.
5. Recovery requires both provider usage stabilization and product-level public,
   editorial, queue, and database proof across a sustained window.

### Provider incident journey

- Classify whether the incident affects public delivery, new compute, builds,
  cache control, telemetry, or the provider console. Do not assume a single
  “Vercel down” state.
- Preserve cached or previously prepared public truth only while current D1 and
  adverse admission still allow it.
- Stop admitting work that cannot receive a durable product receipt. Never tell
  staff it is queued when only a browser request exists.
- Route material impact through D31 in product language. Use the independent
  service-status channel for broad public communication; D31 does not become a
  public status page.
- After provider recovery, reconcile unknown outcomes before retries, verify
  exact active generations, drain work fairly, and watch for a cold-cache or
  retry surge before declaring recovery.

## Journey 5 — Custom package developer or maintainer

### Before admission

1. The developer submits one immutable D9 package artifact with its manifest,
   dependency and provenance evidence, target Site, and supported semantic
   catalog/profile versions.
2. The certification harness tests representative actual content at minimum,
   typical, and measured-maximum D33 cohorts; mobile and desktop; constrained
   networks and lower-end devices; warm and cold caches; no JavaScript; reduced
   motion; long locales/RTL; empty/minimum/maximum content; and dependency
   failure.
3. The report identifies exact artifact, route family, fixture digest,
   device/network, metric and percentile, expected budget, observed result,
   regression baseline, and safe fallback.
4. A failed package is not admitted. The report says **Package update needs
   performance fixes** and points to the exact failing evidence. It does not
   silently lower the profile, drop accessibility checks, or ask tenant editors
   to reduce content.

### After admission

- D1 pins the exact package version; a new build or provider deployment never
  changes public presentation by itself.
- If field evidence later shows a regression, D31 presents a **Technical issue**
  owned by Asym or the maintainer. Editors see that content is saved and the
  current public generation remains protected.
- Recovery uses a certified successor or previously proven package input in a
  newly validated D1 generation. Runtime `latest`, silent package substitution,
  or per-request fallback to generic styling is forbidden.
- Cost evidence may identify a package's bytes, requests, transforms, or compute
  as a contributor, but staff-facing language remains about the affected
  experience. Provider or source diagnostics stay with the maintainer and
  operator.

## Failure and recovery matrix

| Condition                        | Public visitor                            | Ordinary editor                       | Site admin/releaser                     | Support/operator                        | Package developer                 |
| -------------------------------- | ----------------------------------------- | ------------------------------------- | --------------------------------------- | --------------------------------------- | --------------------------------- |
| Healthy                          | No status chrome                          | Normal save/Preview copy              | Normal release receipt                  | Quiet; evidence retained                | Current certification visible     |
| Cold cache/start                 | Useful HTML and stable layout             | Shell and last safe state remain      | Longer preparation only if measured     | Observe cold/warm split                 | Must pass cold fixture            |
| Noisy-neighbor burst             | Same admitted public truth                | No comparative tenant message         | Work may wait fairly                    | See fairness and saturation evidence    | No access                         |
| Background backlog within budget | No impact                                 | Routine work stays quiet              | **Waiting to prepare**                  | Monitor oldest age                      | No access                         |
| Backlog breaches promise         | Local degradation only if real            | Contextual D31 status                 | **Taking longer**; live unchanged       | D31 + operator exception                | Only if package-caused            |
| Database pressure                | Last safe public truth where possible     | No false save                         | No false queue/release                  | Protect connections; reconcile          | No access                         |
| Cost anomaly                     | No cost messaging                         | No quota warning                      | Only real product impact                | Unit-cost alert and governed protection | Exact artifact evidence if causal |
| Vercel partial incident          | Degrade only affected component           | Preserve available edit path          | Stop unsafe admission                   | Classify affected product surface       | Certification/build may pause     |
| Full public incident             | Branded unavailable page                  | Product may be unavailable            | Status outside blast radius             | Incident/runbook/D30                    | No production access              |
| Unknown command outcome          | No duplicate consequence                  | Last acknowledged state               | **We are checking what happened**       | Reconcile exact receipt                 | No blind resubmit                 |
| Bad content release              | Current safety rules still apply          | Content remains editable              | **Prepare recovery release**            | Verify D1 successor                     | Fix only if package-caused        |
| Package regression               | Current proven generation/fallback policy | **Technical issue**; not editor blame | Activation blocked or recovery prepared | D31/D30 evidence                        | Exact failing budget and fixture  |
| Recovery complete                | Ordinary Site                             | Current authoritative state           | **Public update verified**              | Sustained proof before closure          | New qualified artifact if needed  |

## Copy contract

### Lead with consequence and certainty

Preferred:

- **Your last saved version is safe.**
- **Your live site is unchanged.**
- **This release is waiting to prepare.**
- **We could not confirm whether the update finished. We are checking now.**
- **Search is updating. Some new content may be missing.**
- **New site previews are temporarily unavailable. You can keep editing.**
- **This site is temporarily unavailable. We are working to restore it.**

Forbidden:

- “Function timed out.”
- “Cold start.”
- “ISR revalidation failed.”
- “Cache miss storm.”
- “DB pool exhausted.”
- “Inngest queue depth exceeded.”
- “Vercel spend limit reached.”
- “Your tenant is too large.”
- “Try again” after an unknown consequential outcome.
- “Published” when only saved, queued, built, dispatched, or accepted.

### Time and progress

- Show local absolute date, time, and zone for submitted, acknowledged,
  scheduled, last verified, next check, and deadline facts. Relative time may
  supplement it.
- Use a percentage only when the denominator is stable and measured. Otherwise
  show a named stage and elapsed/last-verified time.
- Do not show place-in-queue, other tenants' activity, or a precise completion
  estimate unless the product can keep that promise.
- A progress indicator never restarts visually because a worker retried. The
  staff-facing operation remains one intent and one receipt.

### Responsibility

Every exception names exactly one next owner:

- **Your team** when an authorized content correction is required;
- **Automatic recovery** when the system is actively handling it; or
- **Asym** when platform or package work is required.

Do not tell an unauthorized user to ask vaguely for “an admin.” Name the kind of
authorized action or route through D30's access explanation.

## Responsive, accessible, and calm behavior

1. All journeys work by keyboard, screen reader, touch, pointer, 320-CSS-pixel
   reflow, 200–400% zoom, forced colors/high contrast, reduced motion, RTL/CJK,
   long translations, slow networks, tab suspension, reload, and Back/Forward.
2. Use native landmarks, headings, links, buttons, lists, progress elements,
   and Base UI behavior primitives before ARIA.
3. Dynamic non-urgent changes use one bounded polite status announcement.
   Urgent alerts are limited to conditions that truly require interruption,
   never slow background work or cost.
4. Focus remains on the user's task. A background transition does not move
   focus to a banner, toast, or progress region.
5. Keep scope, last safe state, and primary action before optional details at
   every breakpoint. Desktop rails have equivalent mobile navigation.
6. Never require hover, drag, color, motion, a tooltip, a wide table, or a
   pointer gesture to understand status or recover.
7. Respect reduced motion without replacing useful state. Static progress text
   and exact timestamps remain available.
8. Loading placeholders reserve final geometry; they do not pulse indefinitely,
   conceal the Page heading, or create layout shift.
9. Service-wide banners are singular and neutral. Task-specific problems remain
   in the task. Validation errors remain at fields and in an error summary,
   never inside a capacity banner.
10. Messages persist until no longer relevant or intentionally dismissed where
    dismissal is safe. Critical outcome and recovery messages do not auto-hide.

## No-policing and no-noise rules

- Do not rank tenants, Sites, editors, packages, or Pages by performance in
  tenant-facing UI.
- Do not translate capacity budgets into a content-quality score or D32
  compliance grade.
- Do not tell a ministry to remove content, languages, imagery, or branded
  expression when batching, caching, fair queuing, or platform capacity is the
  correct solution.
- Do not send routine healthy, retry, cache, build, or cost notifications to
  staff.
- Do not make a tenant acknowledge provider spend, attest to traffic estimates,
  or choose infrastructure settings before ordinary release.
- Do not expose a per-tenant Vercel project, deployment, region, cache, image,
  or function control panel.
- Do not let optional cost optimization weaken D1 truth, Phase 10 safety, D30
  authorization, D32 accessibility, giving/form outcome integrity, or current
  adverse containment.
- Do not hide a genuine advertised hard product bound. If a design-partner
  workload exceeds the active measured profile, Asym opens an explicit
  capacity-planning case, states the currently supported path, and either
  qualifies a larger successor profile or gives a truthful product limitation.
  It does not surprise the user at Publish.

## Measurement and usability proof

### Public experience

- Gate field LCP, INP, and CLS at P75 by device using the D33 floors; retain P95
  and P99 for diagnosis rather than replacing the product gate.
- Segment representative route families, package versions, locale/layout
  classes, cache state, and meaningful network/device cohorts without logging
  private content or unbounded URLs.
- Pair Vercel field evidence with production-mode lab tests, cold/warm paths,
  no-JavaScript checks, reduced motion, and slow-network journeys.
- Verify the complete donor journey, not only a homepage score: arrive, orient,
  find a cause, open a missionary/project Page, follow Give, and receive the
  authoritative outcome.

### Staff experience

For Page open, save/autosave, Preview, Site preview, release, schedule, search,
media, import, and recovery, measure:

- time to first usable shell and primary action;
- acknowledged outcome time and tail latency;
- abandonment and duplicate-action rate;
- correct comprehension of saved versus released versus verified;
- successful recovery after weak network, tab suspension, and unknown outcome;
- accessibility errors and assistive-technology completion; and
- whether the status message identifies consequence, owner, and next action.

### Required moderated tasks

Representative nonprofit communications staff, occasional editors,
translators, ministry leaders, missionaries, support teammates, operators, and
disabled users must complete at least these scenarios:

1. Save on a slow connection and identify the last safe version without a
   duplicate save.
2. Leave and return to a queued release without believing it is public.
3. Explain what **Released · verifying public update** means.
4. Handle a failed release and correctly state that the live Site is unchanged.
5. Recover from an unknown outcome without repeating a consequential action.
6. Open and use the public Site on a constrained mobile network without waiting
   for decorative JavaScript.
7. Complete or safely stop a giving/form journey during partial degradation.
8. Use Content Health to identify whether the ministry, automatic recovery, or
   Asym acts next.
9. Use support details without revealing content or provider credentials.
10. Diagnose a cost anomaly and preserve the safe public experience without
    pausing production reflexively.
11. Read a package certification failure and locate the exact artifact,
    fixture, and budget to fix.
12. Complete every journey by keyboard, screen reader, touch, reflow, zoom,
    forced colors, and reduced motion.

Launch-blocking comprehension criteria include zero participants believing
that **Waiting to prepare** means public, that **Restore** or recovery rewrites
history, that an unknown giving outcome should be submitted again, or that a
platform capacity incident is the tenant's fault. Any ambiguous copy is fixed
in the product, not assigned to training debt.

## Exact service acceptance rules

The D33 UX contract passes only when:

1. every profiled operation has numeric notice, lateness, breach, and evidence-
   freshness thresholds bound to the same profile version;
2. every UI state can be derived from one authoritative source receipt or an
   explicit incomplete-evidence state;
3. normal editor and public journeys contain no capacity, provider, spend, or
   quota noise;
4. overload preserves current public truth, adverse priority, exact saved state,
   and tenant fairness;
5. no UI claims queued, released, verified, paid, submitted, or recovered from
   a weaker fact;
6. every delayed, blocked, failed, or unknown state explains consequence,
   certainty, next owner, last safe state, and one safe action;
7. Vercel-specific evidence remains in the qualification attachment and
   operator view while public/staff semantics remain provider-neutral;
8. D31 receives material product exceptions, never raw provider noise or
   tenant editorial debt;
9. D30 is the only path from product evidence to rare provider diagnostics,
   and diagnostics cannot mutate;
10. package performance defects are blocked or owned by Asym/maintainer, never
    pushed onto editors;
11. cost protection cannot automatically pause production Sites without a
    separately authorized incident rule and consequence review;
12. full accessibility, responsive, slow-network, outcome-unknown, provider-
    incident, cost-anomaly, and recovery journeys pass; and
13. field and lab evidence is privacy-safe, sampled intentionally, and fresh
    enough to support every favorable claim.

## Deliberate non-goals

D33 does not create:

- a tenant billing or infrastructure product;
- per-tenant Vercel projects or settings;
- a performance score, SEO score, accessibility score, or content score;
- tenant-editable capacity limits, cache policy, regions, concurrency, or
  sampling;
- a second status, incident, audit, workflow, retry, or publication system;
- a universal automatic rollback or provider pause button;
- an offline-first editor, collaborative presence, or new D12 recovery store;
- a public D31 dashboard or provider-branded error page;
- arbitrary package self-certification or tenant source-code access; or
- unsupported numeric promises inferred from Vercel, Payload, Postgres, or
  Inngest defaults.

## Recommended D33 UX clauses

The exact C-prime-R formulation should incorporate these product clauses:

1. The Production Capacity Profile is operator-owned, versioned, and invisible
   during healthy ordinary staff and public work.
2. Provider-specific Vercel qualification is an implementation attachment, not
   tenant vocabulary or product authority.
3. Every user-visible async state distinguishes local, durably accepted,
   processing, released, externally converging, verified, failed, and outcome-
   unknown facts.
4. Public and staff UI always name the last safe state and never invite blind
   consequential retry.
5. D31 alone centralizes material capacity exceptions in product language; D30
   alone opens deep diagnostics.
6. Public resilience preserves useful server HTML, native navigation, the
   active D1 generation, responsive D27 media, and source-owned giving/form
   outcomes.
7. Capacity protection is tenant-fair and prioritizes adverse containment,
   current public truth, authoritative outcomes, and acknowledged work before
   favorable optional activity.
8. Cost anomalies are operator concerns. Staff see only real product impact;
   no provider bill, quota, tenant ranking, or content-policing message appears.
9. A hard provider spend action cannot automatically take production Sites
   offline without independent authorization and consequence review.
10. Package budgets are certification gates owned by Asym or the maintainer,
    not editor chores or brand-homogenization rules.
11. Accessibility, reduced motion, constrained-network use, no-JavaScript public
    output, and truthful status announcements remain capacity proof gates.
12. Representative nonprofit users must prove comprehension and recovery,
    including zero confusion that queued means public or that an unknown
    consequential outcome should be repeated.

## Sources

- [web.dev — How the Core Web Vitals thresholds were defined](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [Vercel — Speed Insights overview](https://vercel.com/docs/speed-insights)
- [Vercel — Speed Insights metrics and percentiles](https://vercel.com/docs/speed-insights/metrics)
- [Vercel — Speed Insights configuration and sampling](https://vercel.com/docs/speed-insights/package)
- [Vercel — Speed Insights privacy and collected dimensions](https://vercel.com/docs/speed-insights/privacy-policy)
- [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C — Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)
- [GOV.UK Service Manual — Uptime and availability](https://www.gov.uk/service-manual/technology/uptime-and-availability-keeping-your-service-online)
- [GOV.UK Service Manual — Test your service's performance](https://www.gov.uk/service-manual/technology/test-your-services-performance/)
- [GOV.UK Service Manual — Progressive enhancement](https://www.gov.uk/service-manual/technology/using-progressive-enhancement)
- [GOV.UK Design System — Notification banner](https://design-system.service.gov.uk/components/notification-banner/)
- [ADR-0145 — Page-local composition and Public Site Generations](../../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0153 — Certified Site-bound Presentation Packages](../../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [ADR-0161 — Derived Public Site Search Projection](../../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [ADR-0169 — Immutable whole-Site Preview Candidates](../../../adr/0169-immutable-whole-site-preview-candidates-over-sealed-site-plan-inputs.md)
- [ADR-0171 — Tenant-wide Public Media Catalog](../../../adr/0171-tenant-wide-public-media-catalog-and-immutable-custody.md)
- [ADR-0174 — Single staff access authority and diagnostics](../../../adr/0174-single-staff-access-authority-and-governed-engine-diagnostics.md)
- [ADR-0175 — Exception-first Content Health](../../../adr/0175-derived-exception-first-content-health-and-cause-owned-recovery.md)
- [ADR-0176 — Tenant-autonomous Accessibility Assistance](../../../adr/0176-tenant-autonomous-accessibility-assistance-and-source-owned-release-invariants.md)
- [D33 Production Capacity Envelope decision brief](./phase-23-d33-production-capacity-envelope-decision-brief.md)

This research document supports the ratified D33 UX contract but does not
independently expand it or authorize implementation, schema/RLS, migrations,
provider settings, telemetry activation, Vercel plan or spend changes,
deployment, issue/spec publication, D1 activation, release, commit, or push.
