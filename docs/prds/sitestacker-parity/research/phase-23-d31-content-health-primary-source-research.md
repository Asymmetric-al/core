# Phase 23 D31 Content Health primary-source research

- **Status:** Complete supporting evidence for the founder-ratified Phase 23
  D31 C-prime-R decision. It qualifies the product boundary, current provider
  capabilities, repository seams, staff journeys, failure model, and permanent
  controls without independently expanding the ratified authority or
  authorizing implementation.
- **Research date:** 2026-08-24.
- **Ratified:** 2026-08-24.
- **Candidate under review:** **C-prime — One quiet, derived,
  exception-first Content Health workspace with contextual status and
  cause-owned typed recovery.**
- **Authority:** Supporting research only. The founder-ratified decision brief,
  decision log, and ADR-0175 own the D31 authority. This document does not
  independently alter it or authorize implementation, schema changes,
  migrations, provider adoption, issue publication, deployment, or production
  changes.
- **Scope:** Staff-facing Content Health, its derived state and evidence model,
  contextual and workspace UX, cause ownership, typed recovery, provider
  diagnostics, tenant safety, observability, accessibility, performance,
  rebuilds, and implementation proof.
- **Inherited authority:** Phase 23 D1-D30 and every source-owning phase remain
  authoritative. D31 may interpret their bounded evidence. It may not become a
  second publication workflow, task system, job engine, queue, scheduler,
  permission model, content authority, or generic repair console.

## Executive conclusion

The selected direction is sound only after one important hardening:
**Content Health must be a derived incident interpretation, not a roll-up of
provider job statuses.** A failed Payload job, an Inngest retry, a Supabase log
entry, a stale cache receipt, and a search-index mismatch can all be evidence,
but none alone tells staff what visitors are experiencing, who can correct the
cause, whether an automatic retry is still useful, or whether the condition is
already obsolete.

The best permanent design is one bounded, rebuildable Content Health projection
that consumes versioned signals from source-owning capabilities. It groups
repeated observations into a stable issue episode, derives impact and urgency,
identifies one current cause owner, and exposes only a typed action registered
by that owner. The source owner reloads current authoritative state and decides
whether the command still applies. The health projection never performs a
generic provider replay, direct SQL update, unscoped cache clear, or arbitrary
workflow retry.

Healthy content should remain quiet. Ordinary automatic work should appear
contextually as **Updating automatically**, without creating a central issue.
The central Content Health workspace should be exception-first and contain four
plain-language views:

1. **Needs your action** — a staff member with the required capability can
   correct the source or invoke the safe typed recovery.
2. **Being handled automatically** — only automatic work that is unusually
   slow, relevant to a visible exception, or opened from contextual status;
   routine successful work does not fill a queue.
3. **Needs platform attention** — staff cannot repair it; Asym operations owns
   it, with an honest impact statement and no fake action.
4. **Recently resolved** — a bounded, time-limited confirmation trail that
   supports trust and diagnosis without becoming a permanent activity feed.

The staff-facing states should be a small stable vocabulary, not a mirror of
every engine state:

- **Healthy** — all required evidence is sufficiently fresh and the relevant
  end-to-end condition is proven.
- **Updating automatically** — desired state is known, bounded convergence is
  progressing, and no staff action is useful yet.
- **Needs your action** — current authoritative state proves a staff-fixable
  cause and the viewer is allowed to act.
- **Needs platform attention** — the visitor-impacting or safety condition
  requires an operator or engineering owner.
- **Health check incomplete** — evidence is missing, stale, contradictory, or
  unavailable; absence of evidence is never reported as healthy.
- **Resolved** — the owning condition is proven clear and required convergence
  receipts are current; this is an issue lifecycle state, not a permanent
  content status.

This follows the strongest shared pattern across Google SRE guidance,
WordPress Site Health, Contentful scheduled-content failure handling, Payload
jobs, Inngest observability, Supabase security, WCAG, and OpenTelemetry:
separate user-facing symptoms from engine diagnostics, keep normal operations
quiet, make exceptions actionable, protect diagnostics, and preserve one
authoritative recovery path.

## Research method and confidence

This review used:

- current official documentation from Payload, Inngest, Supabase, Google SRE,
  W3C/WAI, WordPress, Contentful, Contentstack, Drupal, Sanity, Prometheus, and
  OpenTelemetry;
- the exact package pins and existing workflow/recovery/UI seams in the Core
  repository;
- the founder-ratified Phase 23 D1, D13, D17, D21, D25-D30 contracts;
- primary-source architecture and operational evidence rather than product
  marketing comparisons.

Official hosted documentation can change independently of Core. Payload is
pinned in Core to `4.0.0-internal.1f9ae9a`, while the checked-in
`vendor/payload-upstream` snapshot identifies itself as Payload `3.77.0`.
Consequently, official Payload documentation and the vendored snapshot establish
the design risk and likely API shape, but they are **not exact-pin proof** for
the internal Payload 4 build. Exact-pin source inspection or executable
contract tests remain mandatory before implementation.

## 1. What modern operational-health guidance actually supports

### 1.1 Google SRE: alert on user symptoms and only when action is useful

Google's
[Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
distinguishes black-box monitoring of user-visible behavior from white-box
monitoring of internal mechanisms. It recommends that pages be based on urgent,
actionable, user-visible symptoms; less urgent conditions belong in tickets or
dashboards. Google's
[Practical Alerting](https://sre.google/sre-book/practical-alerting/)
also describes aggregation, deduplication, inhibition, and duration thresholds
to avoid flapping and alert storms. The
[Incident Management Guide](https://sre.google/resources/practices-and-processes/incident-management-guide/)
repeats that alerts should describe symptoms and be actionable.

Evidence-based D31 consequences:

- A provider failure count is not severity. Severity must derive from current
  public impact, safety/privacy impact, time sensitivity, breadth, and whether a
  useful response exists.
- Repeated retries for the same cause must collapse into one issue episode.
- Routine retries and short convergence windows should remain quiet.
- A failed background step whose desired outcome is already achieved is stale
  evidence, not an active issue.
- The central workspace should show exceptions and bounded recent resolution,
  not every completed operation.
- Only platform-urgent conditions should page operations. Staff dashboards are
  not pager feeds.

### 1.2 WordPress and Drupal: separate actionable status from technical facts

The official
[WordPress Site Health Screen](https://wordpress.org/documentation/article/site-health-screen/)
separates a **Status** tab, grouped into critical and recommended improvements,
from an **Info** tab containing detailed technical facts for support and
diagnosis. WordPress's
[Site Health overview](https://wordpress.org/documentation/site-health/)
emphasizes either a healthy message or a list of recommended actions. Drupal's
[status report guidance](https://www.drupal.org/docs/user_guide/en/prevent-status.html)
similarly combines a concise site overview with installation problems useful
to support.

What to adopt:

- a quiet overview;
- plain-language problem, impact, owner, and next step;
- deeper technical evidence behind an authorized disclosure rather than in the
  main row;
- direct navigation to the source context where staff can fix the cause.

What not to copy:

- a gamified health score;
- a long list of passed checks;
- one global red/amber/green number that hides uncertainty or mixes unrelated
  severity;
- technical environment data exposed to every staff role.

A score creates false precision: one broken donation route cannot be averaged
away by twenty passed image checks. D31 should report distinct impact-bearing
exceptions, not a percentage.

### 1.3 Contentful, Contentstack, and Sanity: useful execution states are not a

staff health model

Contentful's
[scheduled-content page](https://www.contentful.com/help/scheduled-publishing/scheduled-content-page/)
separates scheduled, completed, and failed activity. A failed schedule can
deep-link to the entry editor. Contentful revalidates at execution time, so an
entry changed after scheduling may fail later. Its
[content operations FAQ](https://www.contentful.com/help/faq/content-operations/)
describes automatic retry for some failures and owner notification when staff
action is needed.

Contentstack's
[bulk task queue](https://www.contentstack.com/docs/administration/organization-bulk-task-queue)
uses waiting, queued, in progress, partially completed, failed, and completed
states. Sanity's current
[Content Releases API](https://www.sanity.io/docs/apis-and-sdks/content-releases-api)
likewise exposes detailed release lifecycle states, while its older
[Scheduling API](https://www.sanity.io/docs/http-reference/scheduling) is
deprecated—useful evidence that provider operation models can change.

The enduring product lesson is not to copy those state machines. D31 should
translate them:

- `queued`, `waiting`, `running`, and bounded retry usually mean **Updating
  automatically**;
- `failed` can mean **Needs your action**, **Needs platform attention**,
  **Health check incomplete**, or no issue at all, depending on current source
  truth and impact;
- `completed` does not prove public success unless the expected public outcome
  and downstream convergence are verified;
- `partially completed` must identify which exact subjects remain affected and
  must not imply the entire site is broken.

Provider terminology may appear in operator evidence, not as the staff-facing
contract.

## 2. Payload CMS evidence and D31 boundaries

### 2.1 What Payload jobs prove

Payload's official
[Jobs Queue documentation](https://payloadcms.com/docs/jobs-queue/jobs)
documents a `payload-jobs` collection and operational fields such as
`completedAt`, `hasError`, `totalTried`, `processing`, task status, and logs.
Its [Queues documentation](https://payloadcms.com/docs/jobs-queue/queues)
describes queue selection and the operational need to inspect stuck
`processing` jobs and failures. The Jobs collection is hidden by default but
can be exposed for administration.

These fields can prove facts about Payload's executor:

- a known job record exists;
- a worker claimed or processed it;
- a task reported an error;
- Payload intends to retry or has exhausted its configured attempts;
- a log exists for operator diagnosis.

They do **not** prove:

- that D1 accepted or activated the intended Site Plan generation;
- that a scheduled exact revision was still current when execution occurred;
- that the public route serves the expected bytes;
- that cache, redirects, search, media, or external delivery converged;
- that a staff member can or should retry the operation;
- that tenant, Site, environment, locale, and audience scope are correct;
- that the issue is still active.

Therefore a Payload job row may be a white-box evidence reference but cannot be
the D31 issue, status authority, repair authority, or ordinary staff UI.

### 2.2 Payload access-control footgun

The same official Jobs documentation states that Local API job operations
bypass access control by default unless `overrideAccess: false` is passed. If
no custom jobs access is configured, the documented default permits any
authenticated user. This aligns with D30's already-ratified safe Local API
boundary: actor-shaped calls use `overrideAccess: false`, while separately
registered service commands have a narrow non-actor authority.

D31 implications:

- never connect a staff repair button directly to Payload Local API job
  mutation;
- never expose the hidden Jobs collection as the Content Health workspace;
- reauthorize every repair through the current Asym principal, tenant, Site,
  environment, capability, and subject fences;
- keep operator diagnostic access read-only and separately governed under D30;
- contract-test the exact Payload pin because Core's internal Payload 4 build
  may differ from hosted docs and the vendored 3.77 snapshot.

### 2.3 Cancellation and replay are not semantic recovery

Payload documents that cancelling a job does not interrupt a task already in
progress; that task completes and subsequent tasks are stopped. A UI that says
“Cancel” without explaining this boundary would create false confidence. D31
should not offer generic cancellation at launch. A cause owner may register a
specific command such as **Cancel scheduled publication** only when its own
authoritative appointment model can make the requested intent true and fence a
late executor event.

## 3. Inngest evidence and D31 boundaries

### 3.1 What Inngest observability is good for

Inngest's current
[Observability Metrics documentation](https://www.inngest.com/docs/platform/monitor/observability-metrics)
describes function failure rates, throughput, step throughput, backlogs, event
logs, and traces. Its
[Traces documentation](https://www.inngest.com/docs/platform/monitor/traces)
shows queued/start/end timing, retries, step input/output, and queue delay.
These are strong operator signals for:

- provider backlog and delay;
- failing functions or steps;
- correlated run investigation;
- retry and capacity behavior;
- differentiating dispatch, queue delay, execution, and downstream failure.

They are not safe ordinary-staff content status. Run payloads, step inputs,
errors, and correlation data can contain identifiers or sensitive content, and
provider retention/display policy is not D31 authorization.

### 3.2 Replay and rerun are dangerous generic repair buttons

Inngest's [Replay documentation](https://www.inngest.com/docs/platform/replay)
supports replaying ranges of runs after a production defect is fixed. Its
[Rerun Function Runs documentation](https://www.inngest.com/docs/platform/manage/rerun-function-runs)
allows rerunning from the beginning or from a selected step and explicitly
warns that downstream side effects can be repeated. The
[Error Handling guide](https://www.inngest.com/docs/guides/error-handling)
explains automatic retry, persisted step state, failure handlers, and the need
for idempotency.

Permanent conclusion:

- “Replay run” and “Rerun step” are D30-governed operator diagnostics/tools,
  not D31 staff actions.
- A D31 action must express domain intent—such as **Retry publishing this exact
  revision**, **Rebuild this route**, **Reindex this Page**, or **Restore this
  reference**—and be implemented by the cause owner.
- The owner must reload current truth, reject stale expected versions, claim
  work idempotently, and issue a receipt. It may choose Inngest as an executor
  behind the port; the command contract must not expose that choice.
- An automatic retry still in its bounded window remains quiet unless the
  public impact or deadline requires staff visibility.

### 3.3 Flow control is an implementation control, not a health state

Inngest's [Concurrency guide](https://www.inngest.com/docs/guides/concurrency)
states that concurrency limits active executing steps rather than whole runs
and supports keyed concurrency. D31 implementers should use bounded keyed
concurrency where appropriate to prevent one tenant or Site from monopolizing
recovery capacity. Yet “waiting because of concurrency” should not be exposed
as a staff explanation unless it materially breaches the promised service
window. Staff care that the update is progressing or late, not which provider
primitive delayed it.

Core currently has no adopted Inngest runtime package in the inspected package
manifests. Existing Inngest skills and MCP wiring are agent/integration tooling,
not proof of product runtime adoption. D31 must preserve the provider-neutral
port and must not introduce Inngest merely to build this workspace.

## 4. Supabase and Postgres evidence

### 4.1 RLS is necessary but not sufficient

Supabase's current
[Row Level Security guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
requires RLS on exposed tables and explains that table grants and RLS policies
are separate controls. It also notes that views can bypass underlying RLS unless
configured appropriately—Postgres 15+ supports `security_invoker = true`—and
that service-role or secret-key clients bypass RLS. Supabase's
[API security guide](https://supabase.com/docs/guides/api/securing-your-api)
and [secure-data guide](https://supabase.com/docs/guides/database/secure-data)
reinforce schema exposure, grant, and policy boundaries.

D31 requirements:

- health rows exposed to a staff data path must carry immutable tenant scope
  and, where applicable, Site, environment, locale, audience, and subject scope;
- browser clients must never select service ledgers, provider logs, internal
  error payloads, repair claims, or unrestricted evidence tables;
- an exposed projection must use explicit grants and RLS; a view must preserve
  invoker security or live behind a server-side product port;
- every command reauthorizes server-side; the visibility of an issue never
  grants permission to repair it;
- service-role writers use separately controlled ports and cannot rely on RLS
  for safety;
- cross-tenant denial tests must cover list, count, detail, deep link, export,
  notifications, live updates, repair, and evidence disclosure.

### 4.2 Supabase health tools are operator evidence, not staff truth

Supabase's
[Database Advisors](https://supabase.com/docs/guides/database/database-advisors)
can identify missing indexes, disabled or weak RLS, security-definer views,
sensitive columns exposed to APIs, and insecure queue exposure. Supabase's
[Postgres connection logging](https://supabase.com/docs/guides/platform/postgres-connection-logging)
supports database diagnosis. These tools help operators validate D31's storage
and access implementation; their warnings and logs must not be surfaced as
ordinary Content Health issues.

A database connection spike, advisor warning, or SQL error may explain an
incident but cannot authoritatively determine a Page's health. D31 must correlate
authorized product receipts and public-outcome probes without exposing raw SQL,
connection strings, policies, or protected identifiers.

### 4.3 Existing Core workflow persistence is a reusable execution seam, not a

new health authority

Core already contains a product-owned workflow dispatch ledger and active work
claims:

- `supabase/migrations/20260611134500_workflow_dispatch_ledger.sql` stores a
  service-role-only handoff ledger with tenant/idempotency uniqueness and
  recovery indexes. Its own contract says it is not business-outcome authority.
- `supabase/migrations/20260611181000_workflow_work_claims.sql` enforces one
  active claim per tenant/subject and keeps functions inaccessible to public,
  anonymous, and authenticated browser roles.
- `packages/api/src/workflows/recovery.ts` claims and retries bounded handoff
  work while leaving product records authoritative.
- `packages/api/src/workflows/summaries.ts` derives product summaries without
  selecting raw Inngest logs.

D31 should reuse these seams when an owning recovery command needs durable
dispatch. It must not create a second retry ledger, dead-letter model, or
generic queue. The health projection may reference a dispatch/effect receipt,
but resolution belongs to the source condition, not to the handoff row.

## 5. Observability, privacy, and cardinality

Prometheus's
[metric naming and label guidance](https://prometheus.io/docs/practices/naming/)
warns that every unique label combination creates a time series and discourages
unbounded high-cardinality labels such as user identifiers and email addresses.
OpenTelemetry's
[Handling sensitive data guidance](https://opentelemetry.io/docs/security/handling-sensitive-data/)
recommends data minimization, avoiding unnecessary PII, and applying filtering,
redaction, or deletion. OpenTelemetry's 2026
[cardinality limits discussion](https://opentelemetry.io/blog/2026/cardinality-limits-in-opentelemetry/)
and [Metrics SDK specification](https://opentelemetry.io/docs/specs/otel/metrics/sdk/)
explain bounded cardinality and overflow behavior.

D31 observability should therefore split two products:

1. **Authorized exact records** may include tenant/Site/subject/cause identity,
   evidence references, and correlation IDs under product access control.
2. **Metrics** use bounded dimensions such as signal family, cause class,
   owner capability, environment class, severity class, and outcome. They must
   not use tenant IDs, Site IDs, Page IDs, emails, paths, slugs, search phrases,
   form values, donor identities, or arbitrary provider error strings as labels.

Logs and traces should carry opaque correlation references, not rich content,
unless a separately governed redacted diagnostic store requires it. Staff
evidence should explain **what happened and what to do**, while provider error
codes, stack traces, SQL, and payload fragments remain operator-only.

## 6. Accessibility evidence and required interaction behavior

WCAG 2.2
[Success Criterion 4.1.3, Status Messages](https://www.w3.org/TR/WCAG22/#status-messages)
requires status messages to be programmatically determinable without receiving
focus. WAI's
[ARIA22 technique](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22)
describes `role="status"` as a polite live region. The
[ARIA alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)
reserves `role="alert"` for brief important messages, warns against frequent
interruptions, and advises against automatically disappearing alerts.
[Consistent Identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification)
and [Consistent Help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help)
require repeated functions and help mechanisms to remain consistent.

Concrete D31 requirements:

- use the same status label, icon meaning, cause name, and action name in the
  Page editor, schedule view, search settings, media library, form settings,
  preview, and central workspace;
- announce background changes such as “Update completed” with a polite status
  region, without moving focus;
- use an alert only when an action the user just attempted failed or a new
  urgent condition must be noticed immediately;
- do not auto-dismiss critical errors; preserve them until acknowledged by the
  user or superseded by proven recovery;
- after an action, keep focus stable, show progress next to the initiating
  control, prevent accidental duplicate submission, and provide a meaningful
  result;
- make issue cards/rows keyboard navigable with genuine links and buttons, not
  clickable containers;
- preserve table/list meaning at 400% zoom and narrow mobile widths without
  horizontal dependence for primary action;
- meet the repository's 44-by-44-pixel minimum target guidance for pointer
  actions;
- never rely on color alone; status requires text and, where useful, a
  non-color visual cue;
- support reduced motion and avoid celebratory or pulsing motion in operational
  status;
- test screen-reader announcements, keyboard order, focus after filtering,
  empty states, stale-state refresh, and permission changes.

## 7. Core repository evidence and settled boundaries

### 7.1 D1 remains the publication and public-generation authority

D1 owns Page-local composition, Site Plan release, and compilation of one
coherent public generation. A cache receipt, search-provider status, worker
completion, or health row cannot activate, roll back, or redefine that
generation. D31 may report a D1-owned condition and invoke a D1-registered
typed command, but only D1 can decide whether the exact candidate is current
and whether release or recovery is valid.

### 7.2 D13 owns scheduled publication appointments

D13 binds scheduled operations to an exact revision and executes them through
D1. Product appointment records and D1 receipts are authoritative; delayed
delivery and retries are execution. A stale event must no-op. D31 can group an
overdue or failed exact-revision appointment into one issue and deep-link to the
schedule/editor. It must not reschedule or republish by mutating a job row.

### 7.3 D17 owns public-search convergence

D17 explicitly distinguishes dispatch acceptance, worker completion, provider
acceptance, query visibility, containment, physical absence, and reconciliation.
Its staff vocabulary—search up to date, updating, safety update in progress,
some content may be missing, search needs attention, rebuilding—must remain
source truth. D31 should consume a versioned D17 health signal and reuse its
cause-owned repair. It must not infer search health from a queue or copy D17's
retry ledger.

### 7.4 D21 owns Trash restoration and purge

D21's reference-aware Trash owns restore and purge semantics. D31 may report a
failed cleanup, blocked purge, or broken reference caused by trashed content;
it cannot restore/purge independently. A **Restore content** action must call
D21's registered command and show reference consequences before confirmation.

### 7.5 D25 owns whole-Site preview candidates

D25 requires an exact, immutable whole-Site candidate without live fallback or
cross-tenant leakage. D31 may report candidate build or expiry conditions but
must never silently fall back to live content, use preview as a health probe
that weakens isolation, or imply a failed preview changes production.

### 7.6 D26-D29 own forms, media, search/sharing, and portability

- D26 owns form definition, submission routing, delivery receipts, and bounded
  retries. D31 must not become a second inbox or route editor.
- D27 owns the tenant-wide media catalog, immutable bytes/renditions, processing,
  qualification, and recovery. D31 consumes typed media signals and actions.
- D28 owns generated search/sharing metadata and D1 compiler ownership. D31 may
  report invalid/missing results but not compile metadata independently.
- D29 owns governed exports and staged imports. D31 may surface import validation
  or application failures with a deep link; it cannot edit staged data, bypass
  approval, or turn imports into generic background jobs.

### 7.7 D30 owns staff authorization and engine diagnostics

D30 establishes one Asym staff access authority: Supabase Auth identity plus the
Phase 12 permission brain. Payload's principal link is non-authoritative. It
also requires product-owned staff UI, operator-only read-only engine
diagnostics, typed Asym repair commands, redacted observability, and no ordinary
raw Payload access.

D31 must honor this separation:

- **ordinary staff plane:** plain-language symptom, impact, source context,
  owner, safe action, progress, and outcome;
- **operator diagnostic plane:** provider job/run/log references, redacted error
  details, queue delay, evidence freshness, correlation, and implementation
  controls;
- **repair plane:** one registered typed command per cause family, reauthorized
  and audited by Asym.

### 7.8 Existing UI and API seams

The current Web Studio shell in
`apps/admin/src/cms-ui/web-studio/shell/studio-nav-rail.tsx` supplies shared
navigation, buttons, tooltips, collection links, and collapse behavior.
`studio-layout.tsx` supplies the surrounding shell. D31 should integrate there
as one quiet **Content Health** destination, not as a new application shell.

`NativeCollectionListView.tsx` demonstrates current shared `PageShell`, filter,
empty-state, and table patterns, but its transitional link to a stock Payload
list view is not a D31 precedent because D30 forbids raw Payload as ordinary
staff authority.

`apps/admin/features/mission-control/components/WorkflowSummariesTable.tsx`
and `packages/api/src/workflows/summaries.ts` provide a useful product-owned
summary seam, yet the current table exposes workflow names, subject IDs,
attempts, and error codes. Those are operator-oriented details. D31 should not
rename this table and call it Content Health; it needs symptom/cause/owner
translation and source-owned evidence.

The legacy `mission_control_tasks` surface is finance-oriented and has its own
statuses and urgency. D31 should not create a task automatically for every
issue or make task completion resolve health. If future human assignment is
needed, a separately owned task may reference a health issue, while the issue
resolves only when authoritative evidence clears.

## Launch signal-family coverage required

The Phase 23 prompt names concrete operational conditions. They should not be
implemented as arbitrary rules configured in D31. Each must have a source owner,
a bounded cause catalog, a source-defined resolution predicate, and at most one
useful typed action. The following matrix is the minimum coverage contract to
prove or explicitly exclude at launch:

| Condition                                                  | Authoritative owner and evidence                                                                                      | Ordinary staff interpretation                                                                                         | Permitted cause-owned recovery                                                                                                    | Resolution proof                                                                                                    |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Failed Page/Site publication                               | D1 candidate, exact input/version fences, activation receipt, and public-generation probe                             | Latest Site update is not live; last confirmed generation remains live when true                                      | Retry the exact still-current D1 operation, or open the blocking source validation                                                | Exact current generation is activated and required public proof succeeds                                            |
| Overdue scheduled publish                                  | D13 appointment, canonical instant, exact revision, dispatch/effect receipt, D1 receipt                               | Scheduled update is late; show whether automatic retry is active and what visitors see                                | Retry the still-current appointment or open the source validation; never replay a provider run                                    | D13 terminal appointment plus D1 exact-generation proof, or an authoritative cancellation/supersession              |
| Failed/overdue unpublish                                   | Source publication intent, D13 when scheduled, D1 adverse operation, public absence/continuity proof                  | Content expected to be removed may still be reachable; safety urgency must be explicit                                | Re-run the exact current removal intent through its owner; escalate immediately when containment is unproven                      | Source is nonpublic, D1 generation reflects it, and required route/search/cache containment proves absence          |
| Stale public cache                                         | D1/public delivery owner desired generation, invalidation receipt, and bounded public probe                           | Some visitors may still see the previous confirmed version                                                            | Revalidate the exact affected tags/paths/generation through the delivery owner                                                    | Probe/receipt proves expected generation for the bounded scope; a provider API success alone is insufficient        |
| Failed redirect activation                                 | D2-D3 route/continuity owner and D1 compiled route table/generation                                                   | An old or moved link may not reach its intended Page                                                                  | Rebuild/activate the exact current route plan through D1, after collision validation                                              | Active generation contains the expected redirect and a bounded resolver probe returns the intended safe destination |
| Broken Page or navigation reference                        | D1/D4-D5 source graph, target eligibility/current public head, and compiled navigation proof                          | A link or menu item has no valid public destination                                                                   | Open the owning Page/navigation editor or invoke a typed source repair only when the owner can present an unambiguous safe choice | Source reference points to an eligible current target and the compiled active generation contains it                |
| Public-search lag, failed reindex, or deletion uncertainty | D17 convergence target, containment proof, index receipt, query visibility/absence, and reconciliation                | Search is updating, may omit content, or may expose withdrawn content; distinguish these explicitly                   | Reindex/remove the exact current D17 target or start its bounded rebuild through D17                                              | D17's current target and containment/query/absence proof meet the source-defined condition                          |
| Media processing or qualification failure                  | D27 immutable byte/rendition custody, processing receipt, policy/qualification result, and current references         | An image/video is still processing, cannot be used publicly, or has a fixable metadata/policy issue                   | Retry the exact rendition pipeline, replace the asset, or open required qualification fields through D27                          | Expected rendition exists, integrity/policy checks pass, and the referenced public use is qualified                 |
| Orphaned Page                                              | D1 Page graph, Site/locale lineage, parent/route eligibility, and active Site Plan membership                         | A Page is saved but cannot be reached or released in the current Site structure                                       | Open Page placement/path context; offer a source-owned attach/move command only after collision and permission proof              | Page has one valid Site/locale lineage and participates in the expected candidate/active graph                      |
| Invalid Site or locale relationship                        | D1 Site Plan and D22 exact locale lineages/profile                                                                    | Content is attached to a Site/locale configuration that can no longer publish coherently                              | Open locale/Site configuration or move/copy through the owning typed flow; never silently fall back fields/locales                | Exact lineage and profile validate, with no silent field fallback, and the D1 candidate compiles                    |
| Preview candidate failure or expiry                        | D25 immutable candidate manifest, build receipt, token/access scope, and expiry                                       | Preview is unavailable or out of date; production is unchanged                                                        | Rebuild a new exact candidate through D25; never mutate or extend an immutable candidate silently                                 | New candidate is sealed, accessible only to its exact authorized scope, and renders the expected manifest           |
| Public form route/template/delivery problem                | D26 form definition, domain-owned route, template/version, submission/outbox receipts, and delivery/provider evidence | New submissions may be accepted but delayed, or a route is not ready; never reveal submission content in health       | Open route/template configuration, reconcile one bounded receipt, or invoke D26's idempotent delivery action                      | Definition validates and the domain-owned submission/outbox state reaches its authoritative terminal condition      |
| Import validation/application mismatch                     | D29 staged import manifest, mapping/validation results, approval, apply receipts, and source records                  | Onboarding is blocked or partially applied; group errors by corrective cause rather than row spam                     | Return to mapping/staging, download bounded errors, or retry exact safe application step through D29                              | Current staged version validates and approved application/reconciliation proves intended source records             |
| Schema/migration or certified package mismatch             | Owning migration/package registry, exact schema/package version, compatibility proof, and deployment receipt          | The Site cannot safely compile or an operator action is required; ordinary staff should not be told to run migrations | No ordinary staff mutation; platform owner diagnoses and runs governed migration/package remediation                              | Expected/actual versions match and owner health checks plus D1 candidate proof succeed                              |

This is deliberately not an extensible administrator-authored rule builder.
Adding a new signal family is a product contract change with an owner, tests,
copy, permissions, resolution proof, and runbook. That constraint prevents
silent technical debt while still allowing additive source families later.

## 8. Evidence-to-decision matrix

| Evidence                                     | What it supports                                                             | What it does not support                                                | D31 decision consequence                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Google SRE symptom/actionable alert guidance | Quiet normal state, deduplication, user-impact priority, duration thresholds | A universal severity formula or CMS-specific workflow                   | Derive severity from impact and actionability; do not alert on every engine failure      |
| WordPress Site Health Status/Info split      | Actionable overview separate from diagnostics                                | Health scores, long passed-check lists, unrestricted system information | One exception-first workspace plus governed evidence detail; no score                    |
| Contentful scheduled-content failure UX      | Deep-link failed scheduled work to editable source; revalidate at execution  | Making provider schedule history publication truth                      | D13 source record and D1 receipt remain authority; D31 gives cause-owned action          |
| Contentstack/Sanity execution state machines | Detailed operational state can help diagnosis                                | Exposing every state to ordinary staff                                  | Translate engine states into the small D31 vocabulary                                    |
| Payload jobs fields and logs                 | Executor attempt/error evidence                                              | Public outcome, current source validity, tenant-safe repair authority   | Payload is a witness; exact-pin adapter and tests required                               |
| Payload Local API default override behavior  | Concrete authorization footgun                                               | Permission to use raw jobs UI                                           | Staff repair only through D30 Asym command port; `overrideAccess: false` for actor calls |
| Inngest metrics and traces                   | Queue/run/operator diagnosis                                                 | Staff status or content authority                                       | Provider details stay in operator diagnostics                                            |
| Inngest replay/rerun warnings                | Generic replay can duplicate downstream effects                              | Safe domain recovery                                                    | No generic replay button; commands are typed, fenced, idempotent, and source-owned       |
| Inngest keyed concurrency                    | Tenant-fair bounded work execution                                           | A staff-facing status taxonomy                                          | Use behind the port when adopted; report lateness/impact, not provider mechanics         |
| Supabase RLS/grant/view guidance             | Multi-tenant data-plane controls                                             | Safety for service-role code or authorization by visibility             | Explicit RLS/grants plus server reauthorization and adversarial cross-tenant tests       |
| Supabase Advisors/logging                    | Operator validation and diagnosis                                            | Product health authority                                                | Do not expose raw DB diagnostics to ordinary staff                                       |
| Prometheus/OpenTelemetry guidance            | Bounded metrics and redacted traces                                          | Exact tenant incident records as metric labels                          | Exact identity stays in authorized records; metrics use bounded dimensions               |
| WCAG status/alert guidance                   | Polite updates, stable focus, persistent important errors                    | Visual design alone                                                     | Consistent accessible contextual status and action feedback are release gates            |
| D1/D13/D17/D21/D25-D30                       | Exact source ownership and product boundaries                                | A generic D31 repair engine                                             | D31 derives, groups, routes, and displays; source capabilities decide and repair         |
| Existing workflow ledger/claims              | Reusable durable handoff and concurrency seams                               | A second business outcome or issue authority                            | Reuse through owner commands; do not duplicate retry infrastructure                      |

## 9. Required health-signal contract

Every participating capability should publish or expose a versioned, bounded
health signal through an Asym-owned adapter. D31 must not scrape UI text or
reverse-engineer provider states. A signal should minimally define:

- schema version;
- source capability and registered cause code;
- immutable tenant, environment, Site, subject type, and subject identity;
- locale/audience/generation/revision fences when applicable;
- desired outcome and expected-by deadline;
- current observed outcome and observation time;
- evidence freshness deadline;
- impact class and affected surface, expressed in a bounded enum;
- current owner class: automatic, staff capability, platform operations, or
  unknown;
- whether a safe typed command is registered, plus command kind—not a provider
  URL or arbitrary handler name;
- redacted correlation/evidence references;
- source-observed resolution condition;
- classification version so a projector rebuild can reinterpret older evidence.

Signals are observations, not mutable tickets. The projection can be rebuilt
from current owner truth and retained receipts. A signal with an unknown schema,
owner, scope, or freshness must produce **Health check incomplete**, not
**Healthy**.

### Stable issue identity and deduplication

Repeated observations should identify one issue episode using a bounded key
similar to:

`tenant × environment × Site × subject-kind × subject-id × cause-code × cause-generation`

The exact storage design remains an implementation decision, but it must prove:

- five automatic retries do not create five staff issues;
- the same causal failure affecting cache and search does not create unrelated
  duplicate instructions when one source correction resolves both;
- independent causes on the same Page remain separate when they need different
  owners or actions;
- after proven resolution, a materially new recurrence creates a new episode
  rather than silently reopening history;
- stale or out-of-order evidence cannot resurrect a resolved issue;
- one tenant's signal can never deduplicate with another tenant's signal.

### Resolution semantics

An issue resolves only when the owner-defined condition is false and all
required safety/public convergence proofs are current. Examples:

- a worker completion does not resolve publication health until D1's exact
  generation receipt and required public probe succeed;
- provider deletion acceptance does not resolve search removal until D17's
  containment and exact-key absence proof meet its contract;
- a media task completion does not resolve qualification until D27 validates
  the expected rendition and policy;
- clicking **Retry** never resolves an issue; it moves to **Updating
  automatically** and waits for proof;
- acknowledging, snoozing, hiding, or assigning an issue never resolves the
  source condition.

## 10. Cause-owned typed recovery contract

Every staff-invokable recovery must be registered by the capability that owns
the cause. D31 supplies presentation and command routing only. A complete
command contract must include:

1. **Stable command kind and version.** No dynamic function name, SQL fragment,
   provider run ID, or arbitrary URL from stored data.
2. **Authorized subject.** Exact tenant, environment, Site, locale/audience,
   subject kind/ID, and expected authoritative revision/generation.
3. **Current actor.** Supabase Auth identity and current Phase 12 capability,
   reloaded at execution; issue visibility is not authorization.
4. **Fresh-state reload.** The owner loads current source truth before deciding
   whether the command still applies.
5. **Compare-and-set fence.** A stale expected version yields a safe “This has
   changed; review the latest state” result rather than applying to newer work.
6. **Idempotency key and active work claim.** Repeated clicks, retries, browser
   refreshes, and provider redelivery cannot duplicate effects.
7. **Bounded scope.** No “repair everything” launch action. Batch repair, if
   ever introduced, requires separate impact preview, cap, and authorization.
8. **Consequence description.** Destructive, externally visible, or expensive
   actions explain affected content and reversibility before confirmation.
9. **Transactional or compensating behavior.** Partial failure must be visible
   and recoverable; a provider call cannot masquerade as an atomic product
   change.
10. **Durable receipt.** Record who requested it, authorized scope, expected
    version, command kind/version, idempotency key, acceptance, effect status,
    redacted correlation, and terminal outcome.
11. **Recheck condition.** The owner states what evidence proves recovery and
    by when; D31 does not guess from executor completion.
12. **Typed results.** At minimum: accepted, already satisfied, already in
    progress, stale target, permission lost, blocked by current validation,
    temporarily unavailable, and failed with platform ownership.

No ordinary D31 path may:

- execute direct SQL;
- mutate a Payload job or Inngest run;
- clear an entire tenant/site cache without an exact owner command;
- bypass D1 generation activation;
- retry a form submission by resending raw submitted content from the browser;
- restore or purge Trash outside D21;
- repair a cross-reference by choosing a silent fallback;
- expose service-role credentials or provider secrets;
- accept arbitrary cause codes or handler names from a client.

## 11. Staff journey implications from the evidence

This is primary-source research, not a final D31 interaction specification, but
the evidence requires the following complete paths.

### Healthy path

The Web Studio overview and relevant source screen show a small **Healthy**
status with the last completed check in secondary detail. The central workspace
has an honest empty state: “No content needs attention.” It does not show dozens
of passed checks or completed jobs.

### Routine automatic-convergence path

Immediately after publication or a source change, contextual status says
**Updating automatically** and explains the expected outcome in user language,
for example “Publishing the latest Site update.” A central issue is not created
unless the operation becomes unusually slow, affects a time-critical outcome,
or is opened explicitly from context. Polite status updates announce completion.

### Staff-action path

The issue starts with impact: “The About page is not in navigation because its
saved menu link no longer points to a published Page.” It then shows:

- affected Site/environment and source, with normal links;
- what visitors experience;
- why staff action is useful;
- the one recommended source-owned action;
- secondary “View source” and governed evidence disclosure;
- exact progress and post-action verification.

If the viewer lacks capability, the action is not presented as disabled mystery
UI. The product states who can act or routes them to the appropriate internal
owner without revealing protected membership.

### Automatic-recovery-late path

The issue says the product is retrying, when the next meaningful check occurs,
and what visitors may experience. No fake **Retry now** appears while an
equivalent work claim is active. If the deadline is breached, ownership changes
according to the source contract rather than creating a duplicate issue.

### Platform-attention path

Staff see a plain statement such as “Publishing is delayed. Asym support has
been notified; no change to your content is needed.” The product preserves the
last known safe public state when the source contract permits it, does not show
raw stack traces, and offers a stable support/reference code. Operators receive
the governed D30 diagnostic link and correlation.

### Health-check-incomplete path

When observations are stale or a probe is unavailable, the UI says what is and
is not known. It must not turn green, claim visitor impact without evidence, or
invite repeated repair attempts. If the authoritative public state remains safe,
say so precisely: “The live Site is still serving the last confirmed release;
the latest health check is delayed.”

### Recently-resolved path

The resolved view shows cause, resolution, actor/system owner, completion time,
and the source link for a bounded retention window. It should support undo only
when the source owner offers a real reversible command; “Undo” cannot mean
replaying an earlier provider run.

### Onboarding/import path

During D29 onboarding from another CMS, the same vocabulary applies to staged
validation and application. Staff see grouped, source-actionable exceptions,
not one issue per malformed row or asset. Downloadable error reports can serve
bulk correction, while Content Health highlights blockers to the Site release.
An imported warning cannot silently downgrade release safety.

## 12. Failure model D31 must handle

The implementation must explicitly test at least these conditions:

- event emitted but dispatch ledger write fails;
- ledger write succeeds but provider dispatch fails;
- duplicate or out-of-order delivery;
- old retry arrives after a newer generation is active;
- worker succeeds but receipt write fails;
- provider accepts an effect but query/public verification fails;
- health projector is delayed or unavailable;
- source is deleted, restored, moved, or changes tenant/Site eligibility while
  a health issue is open;
- locale or public audience is removed;
- actor loses permission between opening an issue and invoking recovery;
- two actors invoke the same command simultaneously;
- same cause recurs after resolution;
- one causal incident emits many downstream symptoms;
- different causes affect the same Page simultaneously;
- source adapter upgrades cause code or signal schema;
- an exact provider pin changes jobs/access semantics;
- evidence retention expires before resolution;
- cache/search/media/form downstreams disagree;
- metrics/traces are unavailable while product truth remains valid;
- tenant identifier is forged in a URL, request body, live subscription, or
  repair command;
- Content Health itself shows stale data after a repair;
- high-volume import or release produces thousands of related observations;
- a malicious provider error contains HTML, secrets, PII, or an enormous
  payload;
- daylight-saving/time-zone behavior makes a schedule look overdue while D13's
  canonical instant remains correct;
- one platform outage affects many tenants, requiring fan-in without hiding
  each tenant's authorized impact.

The safe default is containment and honest uncertainty: preserve the last known
safe public generation where applicable, reject stale commands, avoid duplicate
effects, and classify incomplete evidence explicitly.

## 13. Implementation-proof obligations

D31 is not complete when a dashboard renders. The following proofs are release
requirements.

### 13.1 Authority and contract proof

- An ownership registry maps every signal family and cause code to one source
  capability, signal schema version, resolution predicate, and optional typed
  command.
- Unknown/unregistered causes fail closed into governed platform diagnosis; no
  arbitrary handler is invoked.
- Contract tests prove D1, D13, D17, D21, and D25-D30 records remain authority.
- Executor completion alone cannot resolve source health in tests.
- A projector rebuild from authoritative sources/receipts produces equivalent
  current issues without rewriting source truth.

### 13.2 Exact-provider proof

- Execute access and Local API tests against
  `payload@4.0.0-internal.1f9ae9a`, not only hosted docs or the vendored Payload
  3.77 source.
- Prove ordinary principals cannot list, read, mutate, retry, cancel, or expose
  Payload Jobs through direct or indirect paths.
- If Inngest is adopted by a source owner, pin and test the exact SDK/runtime;
  prove D31 remains functional through the provider-neutral port and that
  rerun/replay is not staff-accessible.
- Test provider error/redaction adapters against malformed, oversized, and
  sensitive error content.

### 13.3 Tenant and permission proof

- Positive and negative tests for every role/capability and object scope.
- Cross-tenant tests for list, search, count, facet, detail, direct URL,
  notification, real-time update, CSV/export, evidence, and repair.
- Service-role code requires an independently established tenant/Site scope and
  cannot accept client-supplied scope as authority.
- Actor-shaped Payload calls set `overrideAccess: false`.
- A permission change between render and action is enforced at execution.
- Logs, traces, analytics, support references, and metrics do not leak content,
  form values, donor data, path names, or protected actor identity.

### 13.4 Idempotency, concurrency, and recovery proof

- Duplicate click, double submit, network retry, provider redelivery, and two
  simultaneous actors produce one intended effect.
- Expected-version and generation fences reject stale work.
- Active claims expire/recover safely without allowing an old worker to win.
- Fault injection covers every boundary before and after external side effects.
- The command receipt and source condition reconcile after process death.
- Rebuild/reconciliation can repair projection drift without triggering source
  effects.
- Automatic retry has a bounded policy and transitions to the correct owner
  without an alert storm.

### 13.5 Data integrity and migration proof

- Database constraints enforce tenant/scope fields, cause/schema versions,
  issue-episode uniqueness, and valid state transitions where storage is used.
- Retention and purge preserve required audit receipts while removing sensitive
  diagnostic payloads on policy.
- Classification/schema upgrades are versioned and rebuildable.
- Deployment supports expand/backfill/verify/switch/contract sequencing; old
  and new projectors can coexist safely during rollout.
- Rollback leaves source truth untouched and can restore the prior projection
  reader.
- Mass-resolution and mass-creation anomaly guards prevent a faulty adapter
  deployment from silently hiding or flooding issues.

### 13.6 Performance and scale proof

- Central queries are index-backed by tenant, environment, Site, lifecycle,
  owner class, severity, and recency as actually filtered.
- Contextual status is batched or precomputed; no per-block, per-link, or
  per-provider N+1 health calls.
- A Site release or import with many observations is cause-grouped and processed
  with bounded work; one tenant cannot starve others.
- Load tests cover issue floods, projector rebuild, concurrent staff filters,
  and resolution fan-out.
- Metrics use bounded attributes and cardinality budgets; exact identities stay
  in authorized records.
- Recently resolved retention is bounded and archived/purged without degrading
  active workspace queries.

### 13.7 UX and accessibility proof

- Task-based moderated tests include nonprofit staff who publish infrequently,
  communications staff, Site administrators, translators, and support/platform
  operators.
- Users can answer in seconds: What is wrong? Who is affected? Is the live Site
  safe? Is the product already handling it? What should I do? What happens
  next?
- Usability tests cover healthy, auto-retrying, staff-action, platform-action,
  unknown-evidence, permission-loss, stale-target, and recently-resolved paths.
- Keyboard, screen-reader, 400% zoom, narrow viewport, touch-target, contrast,
  reduced-motion, status-announcement, and focus-preservation tests pass.
- The same labels/actions behave consistently in contextual and central views.
- Error copy is user language, not provider status, code, stack trace, or
  developer jargon.
- No action disappears without an explanation when permission/current state
  changes.

### 13.8 Observability and operational proof

- Operators can correlate an issue with source receipt, dispatch, worker,
  provider, public probe, and projection update without exposing those details
  to ordinary staff.
- Dashboards show signal ingestion age, projection lag, oldest unresolved by
  class, recurrence, auto-recovery success/latency, stale evidence, repair
  outcomes, and adapter/schema-version distribution.
- Alerts are symptom-based, duration-gated, deduplicated, and routed to the
  owner. Cross-tenant platform incidents fan in for operations while preserving
  authorized per-tenant staff status.
- Synthetic probes validate the public outcome for critical flows without
  reading restricted or draft data.
- Runbooks cover projector outage, bad adapter release, provider outage,
  cross-tenant suspicion, mass false-positive creation, and failed repair.

## 14. Provider non-authority conclusions

These conclusions should be explicit in any ratified D31 formulation:

1. **Payload is not Content Health authority.** Its job records, logs, and admin
   UI are diagnostic evidence about one executor.
2. **Inngest is not Content Health or repair authority.** Its runs, traces,
   replay, retries, and flow control are implementation mechanisms behind
   source-owned ports.
3. **Supabase platform health and Postgres logs are not content status.**
   Supabase provides storage, access, and operator evidence; authoritative
   product records and D1/source receipts determine meaning.
4. **Cache, search, media, email, and external providers do not define source
   truth.** They produce separately named convergence evidence.
5. **The D31 projection is also not source authority.** It can be rebuilt, and
   deleting or acknowledging an issue never changes the underlying condition.
6. **D30 remains diagnostics authority.** Raw engine diagnostics are
   operator-only and read-only; D31 surfaces only redacted, useful explanations.
7. **Source capabilities own recovery.** D31 registers and routes typed commands;
   it never offers generic replay, arbitrary SQL, or provider mutation.

## 15. Ruthless adversarial findings by category

This section records the primary-source-backed risks the final D31 adversarial
review must resolve. Severity describes impact if realized; likelihood assumes
an unhardened implementation.

### Brittleness — material concern: yes

- **Could go wrong:** A direct mapping from provider states to staff statuses
  breaks when Payload/Inngest changes state semantics, a run succeeds but public
  convergence fails, or an old retry arrives after newer content.
- **Why it matters:** Staff receive false green status or useless instructions.
- **Severity:** High.
- **Likelihood:** High without a source-owned signal contract.
- **Evidence:** Provider state machines describe execution, while Google SRE
  separates internals from user-visible symptoms; Core D13/D17 already separate
  delivery, effect, and public proof.
- **Permanent prevention:** Versioned owner adapters, evidence freshness,
  generation/revision fences, honest unknown state, and exact-pin tests.

### Technical debt — material concern: yes

- **Could go wrong:** D31 duplicates workflow summaries, retry/dead-letter
  storage, task assignment, provider logs, and each domain's repair logic.
- **Why it matters:** Two statuses and recovery paths drift, making incidents
  harder and migrations expensive.
- **Severity:** High.
- **Likelihood:** Medium-high because current workflow/task seams are tempting
  shortcuts.
- **Evidence:** Existing Core ledger explicitly disclaims business authority;
  D17 and D30 prohibit duplicate workflow/diagnostic authorities.
- **Permanent prevention:** One derived projection, shared handoff/claim seams,
  a cause-owner registry, no second queue/task engine, and source-owned commands.

### Edge cases — material concern: yes

- **Could go wrong:** Duplicate/out-of-order events, restored/deleted sources,
  locale removal, permission loss, partial downstream convergence, recurrence,
  or stale evidence can produce phantom or missing issues.
- **Why it matters:** Staff may repeat side effects, expose stale content, or
  believe a serious problem is resolved.
- **Severity:** High.
- **Likelihood:** Medium; every case is realistic in asynchronous CMS work.
- **Permanent prevention:** Stable issue episodes, current-state reload,
  compare-and-set fences, explicit unknown, owner-defined resolution, and the
  failure matrix in this document.

### Footguns — material concern: yes

- **Could go wrong:** Generic **Retry**, **Replay**, **Cancel**, **Clear cache**,
  or **Resolve** buttons duplicate effects or suppress a condition without
  fixing it. Payload Local API can bypass access by default.
- **Why it matters:** Staff can unintentionally republish, resend, or mutate the
  wrong scope.
- **Severity:** Critical for cross-scope/public effects; otherwise high.
- **Likelihood:** Medium-high in a generic operations console.
- **Permanent prevention:** No generic actions; typed owner commands, explicit
  consequence, exact scope/version, idempotency, and D30 reauthorization.

### Tenant safety — material concern: yes

- **Could go wrong:** Projection queries, counts, deep links, real-time updates,
  diagnostics, or service-role repairs leak or affect another tenant/Site.
- **Why it matters:** It is a privacy and authorization boundary violation.
- **Severity:** Critical.
- **Likelihood:** Medium without adversarial multi-path tests.
- **Evidence:** Supabase documents separate grants/RLS and service-role bypass;
  D30 requires one Asym authority and deny-by-default entry points.
- **Permanent prevention:** Immutable scope, grants plus RLS/server ports,
  service-role provenance, command reauthorization, and comprehensive negative
  tests.

### Overengineering — material concern: yes

- **Could go wrong:** A general event bus, rules engine, case-management system,
  health score, arbitrary plugin framework, or bespoke incident-management
  product overwhelms Phase 23.
- **Why it matters:** It creates more operational burden than it removes.
- **Severity:** Medium-high.
- **Likelihood:** High given the number of contributing domains.
- **Permanent prevention:** Small fixed staff vocabulary, versioned typed owner
  adapters, four bounded views, no assignment/SLA/rules engine, and only proven
  source families at launch.

### UX/UI and user friction — material concern: yes

- **Could go wrong:** Staff see engine jargon, too many alerts, ambiguous green
  status, disabled mystery actions, lost context, or no indication whether the
  live Site is safe.
- **Why it matters:** Infrequent nonprofit CMS users may ignore warnings or make
  harmful repeated attempts.
- **Severity:** High.
- **Likelihood:** High if an operator console is repurposed.
- **Evidence:** WordPress separates status from info; Contentful deep-links to
  source; Google SRE suppresses non-actionable noise; WCAG requires accessible
  status communication.
- **Permanent prevention:** Impact-first copy, context link, owner/next step,
  quiet healthy/automatic states, consistent labels, accessible feedback, and
  moderated usability proof.

### Hidden coupling — material concern: yes

- **Could go wrong:** D31 imports provider enums, database table shapes, route
  internals, or domain-specific repair code.
- **Why it matters:** Provider/domain upgrades require central rewrites and may
  alter staff semantics unexpectedly.
- **Severity:** High.
- **Likelihood:** Medium-high.
- **Permanent prevention:** Versioned provider/source adapters and public owner
  contracts; no table scraping or provider-enum UI.

### Failure modes — material concern: yes

- **Could go wrong:** The health system itself fails, hides issues, floods staff,
  resolves early, or cannot distinguish source failure from observation failure.
- **Why it matters:** A health workspace that lies is worse than none.
- **Severity:** Critical for false-safe status; high otherwise.
- **Likelihood:** Medium.
- **Permanent prevention:** `Health check incomplete`, freshness deadlines,
  mass-change anomaly guards, projector monitoring/rebuild, and last-safe-state
  language.

### Data integrity risks — material concern: yes

- **Could go wrong:** Duplicate episodes, stale resurrection, wrong resolution,
  orphaned evidence, or partial command receipts corrupt the operational record.
- **Why it matters:** Recovery becomes non-repeatable and audit claims become
  unreliable.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent prevention:** Database constraints, stable identity/generation,
  append-only receipts, idempotency, reconciliation, and source-owned
  resolution predicates.

### Security and privacy risks — material concern: yes

- **Could go wrong:** Stack traces, provider payloads, form values, actor data,
  protected paths, or service credentials appear in UI/logs/traces/metrics.
- **Why it matters:** Content Health spans some of the product's most sensitive
  systems and can become a data-exfiltration hub.
- **Severity:** Critical.
- **Likelihood:** Medium without minimization/redaction.
- **Permanent prevention:** Allowlisted evidence DTOs, operator-only diagnostics,
  output encoding, size caps, secret/PII filtering, bounded metric labels, and
  retention controls.

### Scalability and performance risks — material concern: yes

- **Could go wrong:** Per-object probes, high-cardinality metrics, N+1 context
  status, event floods, or unbounded resolved history degrade the admin app and
  database.
- **Why it matters:** Large imports/releases or a platform incident create the
  worst load exactly when staff need clarity.
- **Severity:** High.
- **Likelihood:** Medium-high without aggregation/indexing.
- **Permanent prevention:** Rebuildable projection, indexed queries, cause
  grouping, bounded retention/concurrency, batched context reads, and metrics
  cardinality budgets.

### Operational burden — material concern: yes

- **Could go wrong:** Every new source needs bespoke central UI, operators must
  manually resolve rows, or staff ask support to interpret provider errors.
- **Why it matters:** D31 becomes permanent tribal knowledge.
- **Severity:** High.
- **Likelihood:** High without an ownership contract.
- **Permanent prevention:** Owner registration checklist, standard signal/action
  contract, runbooks, automated reconciliation, and plain-language source copy.

### Observability gaps — material concern: yes

- **Could go wrong:** Teams cannot trace issue → source → dispatch → provider →
  public outcome → projection, or cannot tell a projector outage from healthy
  content.
- **Why it matters:** Diagnosis and recovery are slow; false status persists.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent prevention:** Redacted correlation, freshness/lag metrics,
  source/outcome receipts, synthetic probes, and projector-specific alerts.

### Dependency and integration risks — material concern: yes

- **Could go wrong:** Payload internal builds, Inngest behavior, Supabase view
  security, provider retention, or CMS APIs change.
- **Why it matters:** Staff semantics or access can drift with an upgrade.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent prevention:** Provider-neutral ports, exact-version contract
  tests, upgrade gates, adapter versions, and no provider data model in the UI.

### Migration and upgrade risks — material concern: yes

- **Could go wrong:** A new cause schema reclassifies or hides active issues;
  backfill floods notifications; rollback cannot read newer rows.
- **Why it matters:** Operational continuity is lost during the very changes
  intended to improve it.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent prevention:** Expand/backfill/verify/switch/contract rollout,
  dual-readable schema windows, rebuildable projection, notification suppression
  during verified backfill, and mass-change guards.

### Other development hazards — material concern: yes

- **Could go wrong:** Race conditions, unsafe defaults, XSS in provider errors,
  inadequate failure tests, unclear ownership, or deployment order creates a
  false-safe or destructive result.
- **Why it matters:** These hazards cut across every health source.
- **Severity:** Critical to high.
- **Likelihood:** Medium.
- **Permanent prevention:** Typed allowlists, output encoding, invariants,
  concurrency/fault tests, explicit ownership, reversible rollout, and deny-by-
  default command registration.

## 16. Recommended implementation order if D31 is later ratified

This is sequencing evidence, not implementation authorization.

### Must be established before any workspace UI

1. Freeze the staff vocabulary, issue lifecycle, impact/severity derivation,
   freshness rules, and non-authority boundaries.
2. Define the versioned owner signal and typed command contracts.
3. Register the first bounded source families with D1/D13/D17/D21/D25-D30
   owners; reject unknown sources.
4. Implement tenant/scope/access and receipt invariants with negative tests.
5. Prove projector rebuild, deduplication, stale-event fencing, and owner-defined
   resolution.
6. Prove exact Payload pin behavior and keep provider diagnostics behind D30.

### Then build the smallest complete staff experience

7. Add contextual status to the source-owned surfaces using one shared status
   vocabulary/component contract.
8. Add the four-view Content Health workspace in the existing Web Studio shell.
9. Wire one narrow end-to-end typed recovery per proven cause family, including
   progress, receipt, recheck, and stale/permission outcomes.
10. Add accessible notifications and bounded recently-resolved history.

### Then prove operation and scale

11. Add privacy-safe metrics, correlation, runbooks, and symptom-based alerts.
12. Run failure injection, cross-tenant, performance, accessibility, and
    moderated nonprofit-staff usability tests.
13. Roll out by complete tested source family, while the workspace itself
    clearly marks unsupported/unknown evidence rather than claiming global
    health.

## 17. Final primary-source judgment

**C-prime remains the best option, provided its “derived” and “cause-owned”
words are enforced as architecture rather than branding.** The modern pattern
is not a prettier job dashboard. It is a quiet, impact-first interpretation
layer over independently authoritative product capabilities, with operator
diagnostics separated from staff action and with recovery expressed as
versioned domain intent.

The permanent constraints are:

- no health score;
- no provider-state UI contract;
- no generic retry/replay/cancel/clear/resolve controls;
- no second queue, retry ledger, task system, permission model, or content
  authority;
- no green status when evidence is stale or missing;
- no repair without current authority, exact scope/version, idempotency,
  receipt, and owner-defined recheck;
- no raw engine diagnostics for ordinary staff;
- no tenant identifiers or sensitive content in unbounded metrics;
- no release without exact-pin provider tests, adversarial tenant tests,
  failure injection, accessibility checks, and real nonprofit-staff usability
  proof.

Under those constraints, D31 can be exceptional without becoming large: one
quiet shared vocabulary, one derived projection, one owner registry, one typed
command seam, four bounded views, and source-specific truth where it belongs.

## Primary sources

### Reliability and incident UX

- Google SRE,
  [Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- Google SRE,
  [Practical Alerting](https://sre.google/sre-book/practical-alerting/)
- Google,
  [Incident Management Guide](https://sre.google/resources/practices-and-processes/incident-management-guide/)
- WordPress,
  [Site Health Screen](https://wordpress.org/documentation/article/site-health-screen/)
- WordPress, [Site Health](https://wordpress.org/documentation/site-health/)
- Drupal,
  [Checking Site Status](https://www.drupal.org/docs/user_guide/en/prevent-status.html)

### CMS operations

- Payload,
  [Jobs Queue: Jobs](https://payloadcms.com/docs/jobs-queue/jobs)
- Payload,
  [Jobs Queue: Queues](https://payloadcms.com/docs/jobs-queue/queues)
- Contentful,
  [Scheduled content page](https://www.contentful.com/help/scheduled-publishing/scheduled-content-page/)
- Contentful,
  [Content operations FAQ](https://www.contentful.com/help/faq/content-operations/)
- Contentstack,
  [Organization bulk task queue](https://www.contentstack.com/docs/administration/organization-bulk-task-queue)
- Sanity,
  [Content Releases API](https://www.sanity.io/docs/apis-and-sdks/content-releases-api)
- Sanity,
  [Scheduling API, deprecated](https://www.sanity.io/docs/http-reference/scheduling)

### Durable execution

- Inngest,
  [Observability metrics](https://www.inngest.com/docs/platform/monitor/observability-metrics)
- Inngest, [Traces](https://www.inngest.com/docs/platform/monitor/traces)
- Inngest, [Replay](https://www.inngest.com/docs/platform/replay)
- Inngest,
  [Rerun function runs](https://www.inngest.com/docs/platform/manage/rerun-function-runs)
- Inngest,
  [Error handling](https://www.inngest.com/docs/guides/error-handling)
- Inngest,
  [Concurrency](https://www.inngest.com/docs/guides/concurrency)

### Database and tenant safety

- Supabase,
  [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Supabase,
  [Securing your API](https://supabase.com/docs/guides/api/securing-your-api)
- Supabase,
  [Secure your data](https://supabase.com/docs/guides/database/secure-data)
- Supabase,
  [Database Advisors](https://supabase.com/docs/guides/database/database-advisors)
- Supabase,
  [Postgres connection logging](https://supabase.com/docs/guides/platform/postgres-connection-logging)

### Accessibility

- W3C,
  [WCAG 2.2 Success Criterion 4.1.3: Status Messages](https://www.w3.org/TR/WCAG22/#status-messages)
- W3C WAI,
  [ARIA22: role=status](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22)
- W3C WAI,
  [ARIA Alert Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)
- W3C WAI,
  [Understanding Consistent Identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification)
- W3C WAI,
  [Understanding Consistent Help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help)

### Observability and privacy

- Prometheus,
  [Metric and label naming](https://prometheus.io/docs/practices/naming/)
- OpenTelemetry,
  [Handling sensitive data](https://opentelemetry.io/docs/security/handling-sensitive-data/)
- OpenTelemetry,
  [Cardinality limits in OpenTelemetry](https://opentelemetry.io/blog/2026/cardinality-limits-in-opentelemetry/)
- OpenTelemetry,
  [Metrics SDK specification](https://opentelemetry.io/docs/specs/otel/metrics/sdk/)
