# Phase 23 D31 — Content Health Adversarial Review

- **Status:** Complete hardening review supporting the founder-ratified Phase
  23 D31 C-prime-R decision. It does not independently expand the ratified
  authority.
- **Review subject:** one quiet, derived, exception-first **Content Health**
  workspace with contextual status and cause-owned typed recovery
- **Review date:** 2026-08-24
- **Ratified:** 2026-08-24
- **Authority:** research and adversarial review only. This document does not
  authorize implementation, schema, RLS, migrations, provider adoption,
  publication, or production operations.

## Executive judgment

Option C-prime is the correct product direction only after hardening. A single
Content Health workspace can give occasional nonprofit communications staff a
calm, intelligible place to answer “Is the public site okay, does anyone need
me, and what should I do?” It can also remove the present temptation to expose
Payload Jobs, Inngest runs, database rows, or raw provider errors to staff.

The dangerous version of C-prime is a universal status table that copies every
provider state, stores every retry, guesses that “job succeeded” means the
visitor outcome is healthy, and offers a generic Retry button. That design
would become a second authority, leak Tenant and protected-content facts, flap
under concurrency, and turn ministry staff into infrastructure operators.

The defensible version is narrower:

1. Content Health is a **rebuildable, privacy-minimal read model** over
   source-owned facts and durable owner receipts. It cannot publish, withdraw,
   repair, resolve, or reinterpret source truth.
2. Each source owner emits a versioned, code-owned health signal with exact
   scope, subject, desired outcome, observed outcome, impact, freshness, cause,
   and recovery ownership. Missing or stale evidence is **Health check
   incomplete**, never healthy.
3. One stable issue represents one exact cause affecting one exact subject and
   consequence. Newer fenced facts win; duplicates correlate; flapping and
   supersession are explicit.
4. Staff see four bounded work views: **Needs your action**, **Being handled
   automatically**, **Needs platform attention**, and **Recently resolved**.
   Healthy facts remain quiet.
5. Each issue answers, in plain language: what happened, what visitors can
   experience, what is already happening, who owns the next step, when the
   evidence was last checked, and the single next useful action.
6. Any repair leaves the projection and invokes one separately authorized,
   typed, idempotent owner command with exact scope, expected version/current
   state, bounded blast radius, audit, receipt lookup, and postcondition proof.
   There is no generic replay, raw SQL, arbitrary provider action, or
   diagnostics-as-repair path.

With those protections, all 17 review categories have material concerns, but
none requires abandoning C-prime. The permanent fixes are compatible with the
settled Phase 23 architecture and remove ambiguity rather than adding a general
operations platform.

## Scope and settled constraints checked

This review preserves the following ratified boundaries:

- [D1](../../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
  keeps immutable Public Site Generations and one serving-head CAS as ordinary
  publication authority. Activation, cache convergence, search convergence,
  and visitor visibility are distinct facts.
- [D13](../../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
  owns exact-revision appointments, due-work receipts, overdue reconciliation,
  and cause-owned schedule exceptions.
- [D17](../../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
  owns search convergence, adverse-first containment, deletion proof, lag,
  rebuild, and dead-letter facts. It already requires a quiet, actionable
  health presentation.
- [D21](../../../adr/0165-asym-owned-reference-aware-recoverable-trash.md)
  owns recoverable lifecycle, removal debt, restore, purge eligibility, and
  its exact typed commands.
- [D25](../../../adr/0169-immutable-whole-site-preview-candidates-over-sealed-site-plan-inputs.md)
  owns immutable candidate Preview and its preparation/expiry/validation
  facts.
- [D26](../../../adr/0170-purpose-bounded-public-form-definitions-and-domain-owned-routing.md)
  keeps submission outcomes and routing with destination owners rather than
  the CMS.
- [D27](../../../adr/0171-tenant-wide-public-media-catalog-and-immutable-custody.md)
  owns media qualification, processing, renditions, takedown, and custody
  recovery.
- [D28](../../../adr/0172-versioned-site-search-sharing-profile-and-d1-compiler-ownership.md)
  keeps metadata, sitemap, robots, social artifacts, and their convergence
  behind the D1 compiler and cause-owned recovery.
- [D29](../../../adr/0173-governed-content-portability-and-private-draft-imports.md)
  owns import/export plans, per-item receipts, partial-state recovery, and
  migration mismatch.
- [D30](../../../adr/0174-single-staff-access-authority-and-governed-engine-diagnostics.md)
  makes Supabase Auth plus Phase 12 the only staff authority, separates staff
  product evidence from rare read-only Engine Diagnostics, and reserves every
  mutation for a typed Asym Repair command.

The current repository also matters. Web Studio already has a shared
[`StudioLayout`](../../../../apps/admin/src/cms-ui/web-studio/shell/studio-layout.tsx),
navigation rail, breadcrumbs, compact page shells, badges, filter bars, empty
states, and native collection list/detail workspaces. Those are the visual and
interaction primitives D31 should extend. Current transitional state copy in
[`editor-state.ts`](../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/editor-state.ts)
still exposes “Payload” and infers public availability from provider status;
that is evidence of a seam to replace, not product vocabulary to preserve.
The existing
[`WorkflowSummariesTable`](../../../../apps/admin/features/mission-control/components/WorkflowSummariesTable.tsx)
exposes attempts, error codes, run states, and product-area machinery; it may
inform operator diagnostics but is not an acceptable staff Content Health
surface. The current
[`notification-policy.ts`](../../../../packages/api/src/workflows/notification-policy.ts)
correctly keeps routine retry visible rather than urgent, but its tenant
override knobs and blanket dead-letter urgency must not be copied mechanically
into D31 without impact and actionability proof.

## Primary evidence used

- Google SRE distinguishes user-visible symptoms from underlying causes,
  recommends simple summary dashboards, and says humans should be interrupted
  only by urgent, actionable conditions; subcritical facts belong in tickets
  or dashboards. See [Monitoring Distributed
  Systems](https://sre.google/sre-book/monitoring-distributed-systems/),
  [Practical Alerting](https://sre.google/sre-book/practical-alerting/), and
  [Introduction — Monitoring](https://sre.google/sre-book/introduction/).
- WordPress separates attention-worthy **Status** from granular technical
  **Info**, and groups status findings as critical, recommended, and passed.
  That is useful evidence for progressive disclosure, although D31 should not
  copy WordPress's infrastructure-heavy checks. See [WordPress Site
  Health](https://wordpress.org/documentation/article/site-health-screen/).
- Contentful presents scheduled work both contextually on the entry and in a
  central list, separates scheduled/completed/failed states, and deep-links a
  failed action back to the editor. See [Scheduled content
  page](https://www.contentful.com/help/scheduled-publishing/scheduled-content-page/)
  and [View scheduled
  actions](https://www.contentful.com/help/scheduled-publishing/viewing-scheduled-actions/).
- Payload Jobs exposes queue/run/cancel operations, retry/error state, logs,
  and job status, but Local API job operations bypass access by default unless
  `overrideAccess: false`; unspecified job access also permits authenticated
  users. Those are provider/operator facts, not safe product authority. See
  [Payload Jobs](https://payloadcms.com/docs/jobs-queue/jobs).
- Inngest provides run/step traces, failure rate, throughput, backlog, retries,
  and bulk Replay. Replay can target time ranges and even runs previously
  marked succeeded, confirming that it is an operator incident tool rather
  than a safe staff repair primitive. See [Inngest Observability and
  Metrics](https://www.inngest.com/docs/platform/monitor/observability-metrics),
  [Traces](https://www.inngest.com/docs/platform/monitor/traces), and [Function
  Replay](https://www.inngest.com/docs/platform/replay).
- Supabase requires both grants and RLS policies for exposed tables; privileged
  service roles bypass RLS; and views are security-definer by default unless
  deliberately made `security_invoker` or kept unexposed. See [Supabase Row
  Level
  Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
  and [View security](https://supabase.com/docs/guides/database/tables#view-security).
- W3C distinguishes polite status messages from urgent alerts, warns that
  frequent interruptions impair users with visual and cognitive disabilities,
  and advises against alerts that disappear automatically. See the [ARIA Alert
  pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) and [ARIA22 status
  technique](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22).

## Ruthless adversarial review

### 1. Brittleness

**Material concern: Yes.**

#### Concern A — a universal status mapping can manufacture false health

- **What could go wrong:** D31 could normalize Payload `completed`, Inngest
  `succeeded`, a dispatched outbox row, a cache invalidation acknowledgement,
  and a visible public result into one `healthy` state even though they prove
  different things. A new source, provider version, or missing adapter field
  could silently fall through to green.
- **Why it matters:** Staff would stop investigating while a Page is absent
  from search, a stale route still serves, media is not qualified, or an
  adverse deletion has not been proved. False green is worse than an explicit
  unknown.
- **Severity:** Critical.
- **Likelihood:** High without an explicit contract.
- **Evidence/reasoning:** D1 and D17 deliberately separate prepared,
  activated, cached, indexed, query-visible, contained, and physically absent
  facts. Payload and Inngest expose engine execution states, not the public
  postcondition. The current `editor-state.ts` already equates Payload
  `published` with availability to public readers.
- **Permanent fix:** Define a code-owned, versioned **Health Signal Contract**
  per source owner. Require exact scope, subject/version, desired and observed
  disposition, visitor/staff impact, evidence timestamp/freshness policy,
  cause code, owner, and permitted recovery command. Unknown code, missing
  evidence, expired evidence, or incompatible contract renders **Health check
  incomplete** and can never default to healthy.

#### Concern B — delayed and out-of-order signals can reopen or close the wrong issue

- **What could go wrong:** A late retry, duplicate event, delayed provider
  callback, or old reconciliation result could resolve a newer issue, reopen a
  superseded issue, or replace a current adverse condition with stale success.
- **Why it matters:** Distributed CMS consequences routinely converge at
  different times. Incorrect last-write-wins behavior can hide an active
  visitor problem or create endless issue flapping.
- **Severity:** Critical.
- **Likelihood:** Medium–High.
- **Evidence/reasoning:** D13, D17, D27, and D29 all require generation/version
  fencing, idempotency, reconciliation, and newest-state victory because
  delivery and acknowledgement can be duplicated or reordered.
- **Permanent fix:** Give every issue a stable semantic identity plus source
  generation/version fence. Project only a signal that proves it is current
  for the owner record. Record reopen/supersede transitions explicitly,
  coalesce repeated observations, apply hysteresis only to non-safety
  presentation, and require current postcondition proof before resolution.

### 2. Technical debt

**Material concern: Yes.**

#### Concern A — domain-by-domain status code and UI duplication will drift

- **What could go wrong:** Search, schedules, media, forms, redirects, Preview,
  Trash, and imports could each invent badges, severity rules, timestamps,
  retry copy, and notification behavior. Adding a source would require changes
  across the dashboard, Page editor, notifications, support, and reports.
- **Why it matters:** The same fact would appear under different names and
  severities; staff would learn product-specific exceptions, and fixes would
  become expensive and inconsistent.
- **Severity:** High.
- **Likelihood:** High.
- **Evidence/reasoning:** Ratified decisions already use overlapping but not
  identical vocabularies such as `Needs attention`, `Removal needs attention`,
  `Some content may be missing`, `dead-lettered`, and `Review required`.
  Current Core status labels are also duplicated across editor and workflow
  components.
- **Permanent fix:** Create one small code-owned catalog that maps owner signal
  versions to bounded presentation classes while preserving owner-specific
  cause and recovery. Centralize shared card/status/a11y components and DTOs;
  require each owner to register contract, copy, freshness, impact,
  correlation, and typed action through conformance tests. Do not centralize
  business state machines.

#### Concern B — copying provider models into product records creates permanent coupling

- **What could go wrong:** Persisting Payload job schemas, Inngest run IDs and
  statuses, raw error messages, or provider retry counts as D31's business
  model would make every provider upgrade a product migration and expose
  infrastructure jargon to staff.
- **Why it matters:** Payload Jobs is not the only executor, Inngest retention
  is not the permanent audit ledger, and provider schemas can change. The
  product would become difficult to migrate or test independently.
- **Severity:** High.
- **Likelihood:** High if existing operational components are reused directly.
- **Evidence/reasoning:** D30 makes provider APIs and Engine Diagnostics
  private implementation seams. Inngest exposes per-step attempts and raw
  event detail; Payload exposes jobs/logs and access defaults unsuitable for
  ordinary staff.
- **Permanent fix:** Store only provider-neutral source receipt references,
  bounded safe evidence, and optional opaque correlation. Translate through
  exact-pin adapters. Provider traces remain in D30 operator diagnostics;
  staff receive Asym vocabulary and owner-confirmed outcomes.

### 3. Edge cases

**Material concern: Yes.**

#### Concern A — the underlying content can change while recovery is queued or running

- **What could go wrong:** Staff may click **Repair search** for revision 7
  while another editor publishes revision 8, trashes the Page, changes its
  route, disables the locale, or activates a safety restriction. A blind retry
  could resurrect stale content or undo a valid adverse transition.
- **Why it matters:** These are ordinary concurrent workflows, not exotic
  failures. A recovery button that replays historical input can violate D1,
  D2/D3, D10, D12, D17, or D21 authority.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** D13 rejects mutable `latest` and stale scheduled
  events; D17 requires workers to reload current desired state; D29 refuses to
  overwrite concurrent destination edits.
- **Permanent fix:** Every recovery command binds stable identity, exact scope,
  expected owner generation/revision, issue generation, desired consequence,
  idempotency key, and current authorization. At execution, reload current
  source truth and either perform the still-valid bounded repair, record
  already-satisfied no-op, or return a plain conflict with the owner action.

#### Concern B — one Page can be healthy in one consequence and unhealthy in another

- **What could go wrong:** A Page can be live by direct URL, absent from
  search, stale in sitemap metadata, present in one locale, excluded from
  navigation, processing a social image, and scheduled for a later unpublish.
  A single Page-level red/green badge could overstate or obscure impact.
- **Why it matters:** Staff need to know what visitors can actually experience
  and whether they must act; a generic “Page unhealthy” message causes panic,
  while generic green hides partial failure.
- **Severity:** High.
- **Likelihood:** High.
- **Evidence/reasoning:** D1, D17, D28, and D13 explicitly separate these
  consequences. Contentful also surfaces scheduled action state both on the
  entry and in a central operational list rather than replacing entry state.
- **Permanent fix:** Correlate issues by subject but preserve typed consequence
  lines and impact. The contextual Page summary may say **Page is live; search
  is updating** or **Page is live; it may be missing from search**. Never
  calculate a universal Page-health score. Group shared root causes without
  erasing consequence-specific proof.

### 4. Footguns

**Material concern: Yes.**

#### Concern A — a generic Retry or Replay control can repeat harmful work

- **What could go wrong:** A broad Retry could republish an obsolete revision,
  resend form email, repeat media transformations, clear the wrong cache,
  replay successful Inngest runs, or launch a full-site rebuild for one stale
  projection.
- **Why it matters:** The action looks safe and familiar, but the blast radius
  and idempotency semantics differ by owner. Inngest Replay can intentionally
  target previously succeeded runs, proving it is not a staff-safe semantic
  repair.
- **Severity:** Critical.
- **Likelihood:** Medium–High if provider controls are surfaced.
- **Evidence/reasoning:** D13, D17, D27, D29, and D30 all reserve repair to
  exact product commands with current proof. Payload and Inngest expose broad
  operational controls designed for technical operators.
- **Permanent fix:** No generic retry/replay registry entry. Each visible CTA
  names its consequence—such as **Check search again**, **Review broken link**,
  or **Open scheduled publication**—and invokes one allowlisted owner command
  or owner surface. Consequential repairs show scope and impact, reauthorize at
  commit, fence versions, bound work, and issue a durable receipt.

#### Concern B — acknowledge, snooze, dismiss, and resolve can be confused

- **What could go wrong:** A staff member could dismiss or indefinitely snooze
  a real public problem and make it disappear for colleagues; the system could
  interpret acknowledgment as technical resolution; a resolved issue could
  remain visually alarming because personal state was not cleared.
- **Why it matters:** Presentation state is not operational truth. Conflating
  them creates hidden debt, weak accountability, and a false sense of safety.
- **Severity:** High.
- **Likelihood:** High in exception-management UIs.
- **Evidence/reasoning:** Google SRE separates actionable alerts/tickets from
  dashboard information; D17 and D21 require source proof before health turns
  favorable.
- **Permanent fix:** Resolution is derived only from current owner evidence.
  Acknowledgment records “seen” without changing severity or owner. If D31
  includes snooze, keep it personal, bounded, visible, automatically expiring,
  and unavailable for safety, privacy, cross-scope, or direct visitor-impact
  emergencies. Shared dismissal and manual “mark resolved” are excluded.

### 5. Tenant safety

**Material concern: Yes.**

#### Concern A — aggregate counts and issue detail can leak another Tenant or Site

- **What could go wrong:** A global count, timing difference, saved filter,
  correlation URL, related-record join, or issue detail could reveal that
  another Tenant has a Page, missionary, private route, media asset, failed
  form, or migration in progress. A stale browser cache could retain prior
  Site results after context switching.
- **Why it matters:** Even titles and existence can be sensitive for missions
  organizations. Health is unusually cross-domain and therefore an attractive
  accidental aggregation channel.
- **Severity:** Critical.
- **Likelihood:** Medium–High without structural isolation.
- **Evidence/reasoning:** D30 requires every request/tab/cache/query to bind an
  exact active context and neutralizes non-disclosable resources. Supabase
  warns that grants and policies are separate and that views can bypass RLS by
  default.
- **Permanent fix:** Derive exact Tenant × environment × Site × locale/subject
  scope server-side; enforce composite scope integrity, least-privilege grants,
  RLS on exposed projections, `security_invoker` views or unexposed schemas,
  and matching indexes. Counts, filters, recent items, URLs, cache keys,
  Realtime updates, exports, and correlation lookups use the same context.
  Context switch clears prior-scope state. Test forged IDs and existence/timing
  side channels.

#### Concern B — privileged recovery can bypass source authorization and scope

- **What could go wrong:** A repair handler could accept a browser-supplied
  Tenant/Site ID, call Payload Local API with its default override, use a
  service-role database client, or replay an Inngest event without proving the
  current Phase 12 capability and source floor.
- **Why it matters:** A cross-Tenant mutation is more serious than a leaked
  card. D31's cross-domain position makes an overly generic repair port a
  universal bypass.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Payload job operations bypass access by default;
  Supabase service role bypasses RLS; D30 explicitly prohibits ad hoc actor
  Local API and requires separate actor and service-command ports.
- **Permanent fix:** D31 stores no executable provider instruction. A staff
  action submits only issue identity and intended typed command; the server
  re-derives current context, resolves the owner target, proves exact
  capability and safety floors, calls D30's actor/service port with mandatory
  predicates and `overrideAccess: false` for actor work, and reauthorizes at
  commit. Negative cross-scope tests cover every action.

### 6. Overengineering

**Material concern: Yes.**

#### Concern A — Content Health can expand into a second workflow/incident system

- **What could go wrong:** Assignment queues, custom severities, tenant-defined
  SLAs, approval chains, arbitrary rules, comments, tickets, on-call schedules,
  automation builders, and configurable repair recipes could accumulate around
  the workspace.
- **Why it matters:** Phase 34 owns configurable workflows; Phase 12 owns
  permissions; support and engineering incident products already have their
  own purposes. A duplicate engine would be expensive and confusing for small
  ministry teams.
- **Severity:** High.
- **Likelihood:** Medium–High because exception lists invite task features.
- **Evidence/reasoning:** The Phase 23 charter explicitly excludes a general
  workflow engine. Google SRE's model uses dashboards/tickets/alerts with clear
  responsibility rather than making monitoring the work system itself.
- **Permanent fix:** Launch with four code-owned views, bounded filters, one
  issue detail, one owner category, and owner-deep-links/typed actions. No
  tenant rule DSL, assignment engine, custom severity matrix, comments, or
  arbitrary automation. Future workflow integration may reference an issue ID
  without transferring health authority.

#### Concern B — mirroring every retry and trace will burden the database and UI

- **What could go wrong:** Writing one row per heartbeat, retry, provider span,
  cache key, result URL, or health poll would create high-volume tables,
  retention jobs, costly indexes, noisy histories, and an unreadable activity
  feed.
- **Why it matters:** The proposal asks for clarity, not a home-grown APM. It
  would duplicate Inngest/Payload/telemetry capabilities and make health itself
  a scaling risk.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Inngest already retains per-step traces, attempts,
  backlog, and throughput. D29 deliberately keeps verbose artifacts outside
  product receipts. Google SRE recommends aggregate signal with drill-down,
  not per-component alerting.
- **Permanent fix:** Keep one compact current issue projection plus bounded
  semantic lifecycle events/receipt references. Owner ledgers retain durable
  business proof; observability stores retain technical traces; D30 governs
  rare operator drill-down. Set explicit cardinality, history, query, and
  rebuild budgets before launch.

### 7. UX/UI and user friction

**Material concern: Yes.**

#### Concern A — a conventional health dashboard can overwhelm occasional staff

- **What could go wrong:** A grid of green checks, queue states, attempt counts,
  error codes, charts, provider names, and dozens of severities would make a
  communications coordinator believe they must monitor infrastructure. Empty
  and healthy states could still demand attention through badges and email.
- **Why it matters:** Ministry staff often use Web Studio intermittently and
  under campaign pressure. Confusion delays visitor-impacting corrections and
  causes alert fatigue or avoidance.
- **Severity:** High.
- **Likelihood:** High if the existing workflow summary or WordPress technical
  Info model is copied.
- **Evidence/reasoning:** Google SRE recommends low-noise, actionable alerts and
  simple dashboards. W3C warns that frequent alert interruptions impair
  usability. Current Core's workflow table exposes attempts/error codes, while
  the shared Web Studio shell offers a calmer product foundation.
- **Permanent fix:** Make the workspace exception-first. The landing state
  opens on **Needs your action**, shows a quiet “No action needed” empty state,
  and keeps **Being handled automatically**, **Needs platform attention**, and
  **Recently resolved** secondary. Use persistent text plus icon—not color
  alone—plain consequence copy, relative plus exact time, bounded filters, and
  no health score. Routine retries do not produce nav badges or notifications.

#### Concern B — an issue can be visible but still fail to tell the user what to do

- **What could go wrong:** “Search failed,” “Job dead,” or “Reference invalid”
  may not explain whether the Page is live, whether visitors are affected,
  whether automation is still working, who owns repair, or whether the staff
  member has permission. Multiple buttons can send users to the wrong surface.
- **Why it matters:** Visibility without a clear next action transfers
  diagnosis burden to nontechnical staff and increases support requests.
- **Severity:** High.
- **Likelihood:** High.
- **Evidence/reasoning:** Contentful's failed schedule links directly to the
  entry where it can be fixed. D30 requires denial states to name safe context,
  outcome, and one next action. D29 requires each screen to answer scope,
  change, current activity, and next action.
- **Permanent fix:** Every card/detail answers six questions: **what happened**,
  **visitor/staff impact**, **what is happening now**, **who owns it**, **last
  checked**, and **one next action**. Use contextual entry from the affected
  Page plus the same central issue identity. Deep-link to the exact field,
  schedule, route, media, import item, access request, or support receipt.
  When the actor cannot repair, say who is handling it and offer no dead-end
  button. Prove journeys with real ministry staff, keyboard-only, screen-reader,
  mobile, zoom/reflow, localization, and low-confidence users.

### 8. Hidden coupling

**Material concern: Yes.**

#### Concern A — the projection can accidentally become the recovery or resolution authority

- **What could go wrong:** Editing an issue row could change a Page's status,
  cancel a schedule, clear a dead letter, resolve a reference, or mark a public
  consequence healthy without the source owner changing.
- **Why it matters:** D31 would become a second state machine spanning every
  CMS domain. Owners could no longer evolve independently, and audit would no
  longer explain what actually changed.
- **Severity:** Critical.
- **Likelihood:** Medium if issue actions mutate projection rows directly.
- **Evidence/reasoning:** Every relevant ADR retains domain authority and
  requires source-owned repair. D30 prohibits diagnostic mutation and routes
  defects back to typed Asym commands.
- **Permanent fix:** Make health rows write-protected from product actors.
  Owners publish facts/receipts; one projector derives presentation; commands
  return to owners; owners emit resulting proof. A projection rebuild from
  authoritative sources and receipts must reproduce the same open issues.

#### Concern B — presentation semantics can couple to engine-specific run states

- **What could go wrong:** UI code may switch directly on Payload `hasError`,
  Inngest `failed`, HTTP status, or database column names. A provider upgrade or
  executor replacement would silently change staff severity and action copy.
- **Why it matters:** Technical execution state and product consequence are not
  equivalent, and staff UI should not churn with provider vocabulary.
- **Severity:** High.
- **Likelihood:** High without an adapter boundary.
- **Evidence/reasoning:** Payload and Inngest publish different state machines;
  D30 makes both implementation seams. The existing editor-state helper shows
  how provider terms can escape into product copy.
- **Permanent fix:** Owner adapters translate exact provider evidence into a
  versioned semantic signal before D31 sees it. D31 presentation uses bounded
  classes and owner-provided cause/action descriptors only. Exact-pin adapter
  tests and retained readers precede provider upgrades.

### 9. Failure modes

**Material concern: Yes.**

#### Concern A — the health system itself can fail or become stale while showing green

- **What could go wrong:** Projector lag, a stopped reconciler, database
  outage, missing source heartbeat, failed subscription, schema mismatch, or
  partial rebuild could leave old healthy rows indefinitely visible.
- **Why it matters:** A health product that cannot disclose its own evidence
  gap creates misplaced confidence and makes incidents harder to diagnose.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** D17 distinguishes reconciliation age and current
  admission proof from prior index state. Google SRE recommends both black-box
  symptom and white-box pipeline evidence.
- **Permanent fix:** Every owner contract has an explicit evidence freshness
  policy. D31 exposes last-checked and coverage generation, runs independent
  projection/reconciliation heartbeats and synthetic public-outcome checks,
  and renders **Health check incomplete** when evidence is missing, stale, or
  incompatible. A failed rebuild leaves the prior projection readable but
  visibly stale; it never refreshes timestamps without new proof.

#### Concern B — repair can commit despite a lost response or fail after partial work

- **What could go wrong:** The browser times out after a repair commits, staff
  click again, dispatch fails after source commit, a provider accepts work but
  acknowledgement is lost, or a multi-step repair completes only some
  consequences. The UI may show failure after success or success before proof.
- **Why it matters:** Repeated publication, messages, rebuilds, and destructive
  operations are harmful; ambiguous outcomes destroy trust.
- **Severity:** Critical.
- **Likelihood:** Medium–High in distributed work.
- **Evidence/reasoning:** D13, D17, D27, and D29 explicitly handle duplicate
  delivery, lost acknowledgements, partial states, receipts, and
  reconciliation.
- **Permanent fix:** Owner commands use semantic idempotency, durable
  commit/outbox receipts, generation-fenced claims, bounded retry, postcondition
  verification, and receipt lookup after unknown acknowledgement. D31 displays
  **Checking the result** rather than false failure/success and correlates the
  eventual proof into the same issue.

### 10. Data integrity risks

**Material concern: Yes.**

#### Concern A — duplicate and fragmented issues can corrupt the work picture

- **What could go wrong:** One root cause may create an issue per retry, worker,
  locale, cache layer, or observation; conversely, unrelated problems may be
  merged by Page ID. Counts will not reconcile, notifications will storm, and
  staff may repair only one fragment.
- **Why it matters:** The workspace's primary value is a trustworthy current
  work set. Duplicate or over-merged issues make it unusable and obscure blast
  radius.
- **Severity:** High.
- **Likelihood:** High without identity rules.
- **Evidence/reasoning:** Google SRE recommends deduplication and aggregation;
  Phase 23 owners use stable identities, exact scope, versions, and control
  totals rather than event-count truth.
- **Permanent fix:** Define a canonical issue key from exact Tenant,
  environment, Site, owner, subject, consequence, cause family, and relevant
  generation. Maintain observation correlation separately. Uniqueness,
  supersession, split/merge rules, and deterministic rebuild tests must prove
  one current issue per semantic problem without hiding distinct impacts.

#### Concern B — projection, owner receipts, and audit history can diverge

- **What could go wrong:** Source commit succeeds without signal dispatch,
  projection writes without lifecycle audit, a rebuild drops unresolved rows,
  a resolver marks an issue closed before all required evidence arrives, or a
  purge removes the source reference needed to explain history.
- **Why it matters:** Staff history, support evidence, and current state would
  disagree. Manual database correction would become routine.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** D1 and later ADRs require transactional outbox/ledger
  seams, immutable receipts, checkpoints, anomaly guards, and retained minimal
  evidence precisely because distributed projections can diverge.
- **Permanent fix:** Source owner commits authoritative change plus durable
  convergence intent/receipt atomically where possible. Projection consumption
  is idempotent and checkpointed. Resolution requires a declared proof set.
  Rebuild uses expected-versus-actual counts, safe empty-source handling, mass
  closure anomaly guards, and a shadow generation before head switch. Retain
  minimal tombstone/correlation evidence under owner retention policy.

### 11. Security and privacy risks

**Material concern: Yes.**

#### Concern A — issue content and diagnostics can expose protected information

- **What could go wrong:** Cards, search, filters, exports, logs, screenshots,
  support receipts, or metrics could contain private routes, draft titles,
  missionary identity/location, form values, media URLs, raw search phrases,
  error stack traces, provider payloads, or actor email addresses.
- **Why it matters:** Missions organizations may hold safety-sensitive people
  and location data. An operational screen can bypass the careful projections
  used by ordinary content surfaces.
- **Severity:** Critical.
- **Likelihood:** Medium–High without minimization.
- **Evidence/reasoning:** D17 prohibits raw query/content/high-cardinality
  telemetry; D27 protects restricted media and custody facts; D30 requires
  minimum-necessary diagnostic disclosure.
- **Permanent fix:** Define a safe Health Issue DTO per signal version with
  allowlisted copy, opaque identifiers, content-independent cause codes, and
  current source-authorization projection. Do not store raw provider errors or
  bodies. Redact telemetry, restrict export, recheck access on every detail and
  correlation lookup, and use existence-safe errors. Sensitive detail remains
  in D30 diagnostics under incident-bound access.

#### Concern B — recovery endpoints can become privilege-escalation and replay surfaces

- **What could go wrong:** CSRF, copied URLs, stale sessions, guessed issue IDs,
  manipulated command names, repeated requests, or changed permissions could
  invoke a stronger action than the user can perform in the owner surface.
- **Why it matters:** D31 centralizes visibility across high-impact operations,
  including publish, unpublish, purge, cache, media, and migration.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** D30 separates read, Preview, release, export, purge,
  diagnostics, and repair capabilities and requires commit-time
  reauthorization. UI visibility is never enforcement.
- **Permanent fix:** Use same-origin/CSRF protection, non-guessable but
  non-authoritative issue IDs, an allowlisted server-side issue-to-command
  resolver, exact semantic capabilities, safety floors, fresh scope/epoch,
  expected versions, rate/abuse controls, audit, idempotency, and commit-time
  reauthorization. A copied link grants nothing and denial does not leak target
  existence.

### 12. Scalability and performance risks

**Material concern: Yes.**

#### Concern A — live cross-domain health joins can create N+1 and provider fan-out

- **What could go wrong:** Opening Content Health could query every Page,
  locale, route, navigation item, search row, cache key, schedule, media
  rendition, form route, and import item, or poll Payload/Inngest/provider APIs
  per card.
- **Why it matters:** It may work for a demo Site but fail for large migrations,
  many locales, campaign bursts, or many Tenants. The health screen itself
  could overload authoritative stores during an incident.
- **Severity:** High.
- **Likelihood:** High if implemented as a live aggregation query.
- **Evidence/reasoning:** D17 requires bounded set-based proof and no per-result
  remote call; D29 bounds per-item receipts and large artifacts; Inngest
  provides separate backlog/throughput observability.
- **Permanent fix:** Read a compact derived projection only. Index exact scope,
  work view, impact class, owner, subject, opened/updated time, and stable key;
  use keyset pagination and bounded facet counts. Owners update incrementally
  and reconciliation batches by scope. No UI request lists provider objects,
  computes complete reference graphs, or fetches raw traces.

#### Concern B — retry storms, rebuilds, and high-cardinality telemetry can amplify incidents

- **What could go wrong:** A provider outage or schema bug could open thousands
  of issues, send a notification per item, launch concurrent repairs, attach
  Tenant/Site/Page IDs to broad metrics, and exhaust Inngest/account/database
  capacity.
- **Why it matters:** The response to an incident could increase cost and delay
  recovery for every Tenant.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Google SRE warns against single-component alert noise;
  Inngest exposes backlog and flow-control effects; D17 uses source-specific
  rebuilds, mass-deletion guards, and low-cardinality metrics.
- **Permanent fix:** Correlate common causes, notify once per actionable scope,
  apply Tenant-keyed fairness, concurrency/rate limits, exponential retry with
  jitter, circuit breaking, bounded repair/rebuild budgets, and bulk-safe owner
  commands. Metrics aggregate by code/owner/environment; authorized records
  hold exact scope. Capacity tests prove worst-case fan-out and recovery time.

### 13. Operational burden

**Material concern: Yes.**

#### Concern A — an ungoverned signal catalog will become tribal knowledge

- **What could go wrong:** Cause codes can become undocumented, owner teams can
  disappear, actions can deep-link to deleted routes, freshness thresholds can
  drift, and retired signal versions can remain open forever.
- **Why it matters:** Staff copy and recovery quality will decay even if the
  projector remains technically available. Developers will need manual SQL or
  bespoke scripts to interpret old issues.
- **Severity:** High.
- **Likelihood:** High over time.
- **Evidence/reasoning:** D30 requires registered privileged operations and
  exact-pin qualification; D29 requires versioned adapters and retained
  readers. The same governance is necessary for health contracts.
- **Permanent fix:** A reviewed code-owned registry declares signal schema
  version, owner, presentation copy, impact, freshness, proof, action/deep-link,
  privacy class, deprecation path, and conformance fixtures. CI rejects unknown
  signals/actions and missing owners. Ownership and runbook links are reviewed
  during every domain/provider upgrade.

#### Concern B — staff can be turned into queue babysitters

- **What could go wrong:** Routine retries, temporary lag, background rebuilds,
  and platform-only incidents could remain in the primary work list, prompting
  staff to click, contact support, or continually refresh.
- **Why it matters:** Small ministries cannot staff a CMS operations team.
  Requiring attention for self-healing conditions defeats the product.
- **Severity:** High.
- **Likelihood:** High if all failed attempts become issues.
- **Evidence/reasoning:** Google SRE says software should interpret monitoring
  and notify humans only when they need to act. D17 explicitly keeps healthy
  Sites and routine convergence quiet.
- **Permanent fix:** Automatic retry/reconciliation remains in **Being handled
  automatically** without nav badge or push notification. Escalate to **Needs
  your action** only when a named staff action can improve the outcome, and to
  **Needs platform attention** when staff cannot. Show ownership, expected
  next check—not a promise of completion—and automatically move proved
  recoveries to bounded recent history.

### 14. Observability gaps

**Material concern: Yes.**

#### Concern A — D31 can be blind to gaps in its own source coverage

- **What could go wrong:** A new content type or workflow may never register a
  signal; one locale or Site may stop producing evidence; a projection consumer
  may lag while its own heartbeat remains healthy. No issue would appear
  because the absent signal is itself invisible.
- **Why it matters:** “No issues” would mean “nothing observed,” not “proved
  healthy.” This is a classic monitoring blind spot.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Google SRE recommends complementary black-box and
  white-box monitoring. D17 requires expected-versus-actual proof,
  reconciliation age, and synthetic public checks.
- **Permanent fix:** Register expected signal coverage by owner/scope/version;
  compare expected versus observed watermarks; monitor projector lag, oldest
  unconsumed intent, reconciliation age, contract rejection, and coverage
  gaps; run bounded synthetic visitor checks for critical public outcomes.
  Missing coverage becomes **Health check incomplete** and pages platform
  operations when safety/cross-scope proof is affected.

#### Concern B — staff evidence may not correlate to support and engine evidence

- **What could go wrong:** A card can say “Needs platform attention” without a
  usable correlation receipt; support may search provider logs manually; a
  repair receipt may not link back to the issue; duplicate causes may be
  investigated separately.
- **Why it matters:** Recovery becomes slow and dependent on tribal knowledge,
  while staff repeatedly explain the same problem.
- **Severity:** High.
- **Likelihood:** Medium–High.
- **Evidence/reasoning:** Inngest provides detailed run traces, but D30 rightly
  hides them from staff and begins support with privacy-safe product receipts.
  The missing seam is safe end-to-end correlation.
- **Permanent fix:** Carry an opaque correlation chain from source intent and
  owner receipt through projection observation, issue, typed recovery command,
  postcondition proof, audit, and optional provider trace. Staff can copy a
  minimized support receipt; authorized operators resolve it through D30.
  Metrics never use exact Tenant/content identifiers as broad labels.

### 15. Dependency and integration risks

**Material concern: Yes.**

#### Concern A — Payload/Inngest execution state can be mistaken for product outcome

- **What could go wrong:** Payload `hasError: false`, Inngest `succeeded`, or a
  completed step may resolve an issue even when the public route, search
  deletion, cache, email destination, or rendition is not verifiably correct.
  Conversely, a provider run may fail after the owner outcome is already
  satisfied.
- **Why it matters:** Provider dashboards optimize execution diagnosis, not
  Asym's semantic authority. Coupling them creates both false positives and
  false negatives.
- **Severity:** Critical.
- **Likelihood:** High if provider webhooks/statuses feed D31 directly.
- **Evidence/reasoning:** Payload documents job error/run state; Inngest
  documents per-step status and replay. D1/D17 explicitly distinguish executor
  completion from visitor-visible consequence.
- **Permanent fix:** Provider evidence enters only through the owning adapter.
  Owner commands write permanent semantic receipts and verify product
  postconditions. D31 projects those facts; provider state can explain
  **Being handled automatically** or support diagnostics but cannot alone mark
  semantic resolution.

#### Concern B — provider API, retention, quota, and cost changes can erase evidence or stall recovery

- **What could go wrong:** A Payload upgrade can alter access/default/status
  behavior; Inngest retention can expire run detail; pricing/concurrency can
  delay processing; webhook schemas can change; Replay behavior can target a
  broader cohort than intended.
- **Why it matters:** Product recovery cannot depend on a vendor dashboard or
  transient retained run as its durable truth.
- **Severity:** High.
- **Likelihood:** Medium over the product lifetime.
- **Evidence/reasoning:** D30 mandates exact-pin provider contract tests; D13
  and D29 keep product records/receipts authoritative and treat Inngest as a
  bounded executor only.
- **Permanent fix:** Pin and qualify adapters, version event/response contracts,
  retain product-owned idempotency and receipts, test N/N+1 workers and lost
  provider history, budget concurrency/usage, alert on provider backlog/quota,
  and maintain a reconciler that can recover from owner records without
  provider Replay. Provider replacement must not change staff semantics.

### 16. Migration and upgrade risks

**Material concern: Yes.**

#### Concern A — signal taxonomy evolution can make history and current issues unreadable

- **What could go wrong:** Renamed causes, changed severity, new proof
  requirements, split owners, or revised privacy policy can leave existing
  issues orphaned or reinterpret historical events under new rules.
- **Why it matters:** Staff may see impossible actions, support may lose audit
  continuity, and a rebuild may silently change resolved/open counts.
- **Severity:** High.
- **Likelihood:** High as Phase 23 domains mature.
- **Evidence/reasoning:** Every settled Phase 23 projection/profile contract is
  versioned and requires retained readers or explicit migration. D31 spans all
  of them and therefore has at least the same upgrade obligation.
- **Permanent fix:** Version signal schemas, cause catalog, presentation
  mapping, and proof policy independently. Retain readers for active/history
  windows, make transformations explicit and auditable, use shadow rebuilds
  with count/digest comparison, and never reinterpret historical owner
  receipts in place.

#### Concern B — cutting over from current provider/raw states can create false or duplicate issues

- **What could go wrong:** Existing Payload statuses, workflow summaries,
  search lag records, Trash debt, schedules, and imports may be backfilled with
  incomplete scope or obsolete errors. Dual readers can show two issues or
  union old and new authority. Rollback might reopen raw provider UI.
- **Why it matters:** A health launch during tenant CMS onboarding could be
  noisier and less trustworthy than the system it replaces.
- **Severity:** High.
- **Likelihood:** Medium–High.
- **Evidence/reasoning:** D29 treats migration as a checked, exact-scope plan;
  D30 requires cutover to remove rather than union legacy authority and
  forbids fallback to raw Payload UI.
- **Permanent fix:** Inventory legacy facts by owner; build source-specific,
  no-write backfill adapters; quarantine ambiguous scope; compare in shadow;
  reconcile unique keys and control totals; review representative issue copy;
  activate one Tenant/Site cohort only after proof; and retain a rollback that
  selects the prior Asym projection while never restoring provider authority.

### 17. Other development hazards

**Material concern: Yes.**

#### Concern A — concurrent repair, manual work, and adverse transitions can race

- **What could go wrong:** A repair can race with publish/unpublish, route move,
  locale disablement, safety withdrawal, Trash/restore, schedule execution,
  media replacement, import commit, or another repair. UI disablement may hide
  but cannot prevent the race.
- **Why it matters:** A stale favorable operation can undo adverse safety or
  produce contradictory receipts and duplicate work.
- **Severity:** Critical.
- **Likelihood:** Medium–High.
- **Evidence/reasoning:** D1 uses CAS; D12 uses expected revisions/active-editor
  control; D13/D17/D21/D29 enumerate the same race families.
- **Permanent fix:** Commands use database-enforced uniqueness where
  applicable, expected source/issue generations, short claims/advisory locks,
  CAS, current safety and authorization reproof, idempotency, and newest-state
  victory. Test every owner transition against repair, duplicate click, stale
  tab, and delayed event.

#### Concern B — weak test/ownership/rollback discipline can ship an impressive but unsafe shell

- **What could go wrong:** Snapshot tests may prove cards render while cross-
  Tenant reads, stale green, duplicate repair, inaccessible updates, mobile
  dead ends, provider fallback, or high-volume incident behavior remain
  untested. A feature flag rollback could expose stock Payload UI or lose issue
  evidence.
- **Why it matters:** D31's risk lies in end-to-end semantics and exceptional
  paths, not visual components alone.
- **Severity:** Critical.
- **Likelihood:** Medium without explicit gates.
- **Evidence/reasoning:** D30 requires principal/context/action matrices,
  direct-route tests, accessibility and representative-human proof. W3C notes
  that illustrative ARIA patterns still require assistive-technology testing.
- **Permanent fix:** Make the acceptance obligations below release-blocking;
  assign one product and one platform owner; ship by Tenant/Site cohort behind
  a safe product-surface flag; preserve source operation if the projection is
  unavailable; and make rollback select the prior Asym view/contract without
  changing authority or exposing raw provider controls.

## Ruthless synthesis — the best path forward

### Must be fixed in the D31 contract before ratification

1. **Name authority precisely.** D31 owns only the Content Health projection,
   staff presentation, correlation, and action routing. Each domain owns its
   state, proof, repair, and resolution. D1 remains publication authority;
   D30 remains access/diagnostic/repair enforcement.
2. **Define the signal and issue models.** Require versioned source signal
   contracts, exact scope/version/freshness, stable semantic issue identity,
   newest-state fencing, deduplication, supersession, evidence completeness,
   and deterministic rebuild. **Health check incomplete** must be a first-class
   honest state.
3. **Freeze the bounded UX vocabulary and information architecture.** One
   `Content health` destination, four views, quiet healthy state, contextual
   status on the affected item, six-answer issue cards, one useful next action,
   no provider jargon, no health score, and no routine retry noise.
4. **Register typed recovery.** Every action must resolve server-side to one
   owner command or exact owner deep-link. Ban generic retry/replay, raw SQL,
   provider mutations, manual mark-resolved, and projection-row mutation.
5. **Make Tenant/privacy safety structural.** Exact server-derived context,
   composite integrity, least grants, RLS/security-invoker boundaries, current
   Phase 12 authorization, minimized DTOs, safe correlation, and cross-scope
   negative tests apply to lists, counts, detail, history, filters, exports,
   updates, and actions.
6. **Specify truthful failure and recovery.** Source receipts, outbox,
   idempotency, expected versions, unknown acknowledgement, postcondition
   verification, reconciliation, stale evidence, partial outcomes, and
   projection failure must have explicit UI and operational behavior.
7. **Bound the product.** No workflow engine, task assignment system, tenant
   alert DSL, arbitrary repair recipe, APM clone, custom SLA matrix, raw
   provider browser, or per-retry database history.

### Must be proved before implementation can ship

1. **Projection qualification:** deterministic golden fixtures for every launch
   owner/cause/version; unknown and stale contract rejection; stable-key
   uniqueness; duplicate/out-of-order/supersession/flapping tests; shadow
   rebuild, count/digest, mass-closure guard, prior-head continuity, and
   coverage-gap detection.
2. **Authority and recovery qualification:** actor/service-port enforcement,
   semantic capability matrix, source/current-version reproof, safety
   withdrawal race, idempotency beyond provider dedupe, lost acknowledgement,
   already-satisfied no-op, partial failure, dead-letter/reconciliation, audit
   receipt, and mutation denial under D30 diagnostics.
3. **Tenant and privacy qualification:** every principal × Tenant × Site ×
   locale × issue × action combination; forged IDs; wrong-context caches;
   Realtime and saved-filter isolation; view/RLS/grant behavior; service-role
   containment; existence/timing leaks; redaction; and protected-domain floors.
4. **Performance and cost qualification:** indexed plans, keyset pagination,
   bounded facet counts, no N+1/provider reads, large migration/media/search
   cohorts, common-cause storms, Tenant fairness, backpressure, notification
   coalescing, retry/rebuild budget, projection lag, and recovery-time targets.
5. **Accessible human qualification:** moderated tasks with nonprofit
   communications staff, ministry administrators, multilingual editors,
   support, and platform operators. Include first use, healthy/no-action,
   automatic recovery, staff repair, no-permission handoff, platform-owned
   incident, stale evidence, duplicate/lost acknowledgement, resolved history,
   and CMS-migration mismatch. Prove keyboard operation, meaningful focus,
   text-plus-icon status, polite/assertive announcement discipline, 320 px and
   400% reflow, touch targets, zoom, screen readers, reduced motion,
   localization/RTL/CJK, weak networks, browser Back/Forward, and session/context
   change.
6. **Provider and rollout qualification:** exact-pin Payload/Inngest adapters,
   N/N+1 signal/event readers, retained product receipts after provider history
   expires, provider outage/quota/cost behavior, shadow comparison, cohort
   activation, safe Asym-only rollback, and no raw-provider fallback.

### Staff journey acceptance obligations

| Journey                     | Required observable outcome                                                                                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First visit / healthy Site  | No wall of green checks and no implied monitoring chore. The page says no action is needed, identifies exact organization/Site/environment, and explains in one sentence what will appear here.                              |
| Contextual Page status      | The Page shows one calm sentence such as **Page is live. Search is updating automatically.** It links to the same issue only when detail is useful.                                                                          |
| Needs staff action          | The issue names the affected item, visitor consequence, last checked time, current automation, owner, and one exact action. The action opens the correct field/owner surface and preserves a return path.                    |
| Being handled automatically | No urgent badge or email. Staff can see what is being retried and the next check, but cannot launch duplicate work. Escalation happens only after a versioned deadline/condition.                                            |
| Needs platform attention    | Staff are told that no action is required from them, what visitors may experience, and that the platform team has the issue. A privacy-safe support receipt is available without provider logs.                              |
| Health check incomplete     | Unknown or stale evidence is not green. Copy says what could not be verified, whether the last public generation remains serving, who owns verification, and when it will be checked again.                                  |
| Repair                      | Scope, consequence, and command are clear before action. Double click, stale tab, lost response, permission change, and current-state change produce one safe receipt/outcome, never duplicate semantic work.                |
| Acknowledge/snooze          | Presentation choice never changes source severity or resolution, never hides the issue from colleagues, expires automatically, and is unavailable for protected urgent conditions.                                           |
| Resolution/reopen           | Only current owner evidence resolves the issue. **Recently resolved** shows what proved recovery and when. A newer recurrence reopens/supersedes predictably without erasing history.                                        |
| CMS migration onboarding    | D29 import mismatches appear with source-neutral plain language and deep-link to the exact import plan/item. The workspace does not ask staff to understand legacy provider IDs or falsely claim imported drafts are public. |
| Wrong access / wrong Site   | No cross-scope existence is disclosed. The screen distinguishes session, permission, unavailable verification, and neutral not-available states and never suggests retrying a real denial.                                   |

### Address soon as part of rollout, not by broadening D31

- Establish a small editorial process for reviewing cause copy and owner
  deep-links with communications staff before each new signal version.
- Define bounded, impact-led notification routing through the existing product
  notification system; keep retry and informational state in-product.
- Add safe analytics for time-to-owner-proof, repeated causes, reopen rate,
  stale-evidence duration, false-positive feedback, action completion, support
  escalation, and issue volume—without content or high-cardinality Tenant IDs.
- Build CMS-onboarding guidance around the D29 source adapter and D31 issue
  vocabulary, not provider-specific training.

### Monitor with explicit evidence thresholds

- **Need for assignment/comments/workflow:** monitor unresolved staff-action
  volume and multi-person handoff failures. If evidence later proves a need,
  integrate with Phase 34 rather than growing a D31 task engine.
- **Need for tenant-configurable alert rules:** monitor false-positive and
  response-time data. Do not add a tenant DSL unless bounded presets cannot
  meet demonstrated needs.
- **Need for another observability vendor or dedicated health store:** monitor
  projection/query latency, retention, scale, and diagnostic time. PostgreSQL
  projection plus existing telemetry remains the launch default until measured
  limits are exceeded.
- **Need for bulk staff repair:** monitor repeated same-cause incidents. Prefer
  one owner-level cause repair with bounded scope over selecting many issue
  rows.

## Final recommendation

Proceed with **C-prime-R**, but only with the seven contract fixes and the full
qualification gates above. The correct product is not “a dashboard of jobs.”
It is a quiet, trustworthy explanation and routing layer over exact
source-owned outcomes:

- healthy stays quiet;
- transient recovery stays visible but non-interruptive;
- staff see only issues they can understand or act on;
- platform-owned issues do not become staff chores;
- stale or missing evidence is honest;
- recovery is typed, scoped, idempotent, and owner-controlled;
- resolution requires current postcondition proof; and
- Payload, Inngest, Supabase internals, raw SQL, and provider Replay remain out
  of ordinary staff UX.

This is sufficient to make D31 exceptionally clear without creating a second
CMS authority, workflow engine, or observability platform.
