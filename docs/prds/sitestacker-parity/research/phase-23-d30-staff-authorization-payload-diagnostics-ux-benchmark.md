# Phase 23 D30 Staff Authorization and Payload Diagnostics UX Benchmark

**Status:** Complete supporting UX contract for the founder-ratified Phase 23
D30 C-prime-R decision. It defines a measurable staff authorization and
governed engine-diagnostics experience without independently expanding the
ratified authority, expanding Phase 12 authority, or authorizing
implementation.

**Date:** 2026-08-24

**Ratified:** 2026-08-24

## Experience objective

An ordinary ministry staff member must experience Web Studio as one coherent
part of Asym—not as a separately authenticated CMS. They must be able to:

- enter Web Studio from Mission Control or a safe deep link without a second
  login;
- always know the exact organization and Site in which they are working;
- understand what they can do and, when an action is unavailable, why and what
  to do next;
- switch among their own organizations deliberately without leaking or
  carrying state between them;
- recover safely from session expiry, changed access, and temporary
  authorization outages;
- ask an access administrator or support person for help without copying
  technical identifiers; and
- trust that support cannot silently become them or gain indefinite access.

The rare platform operator who must diagnose the underlying CMS engine must be
able to inspect one explicitly named Tenant and Site for one incident, for a
short time, with the scope and expiry impossible to miss. Ordinary staff must
never encounter Payload credentials, raw collections, provider terminology, or
an unexplained second permission model.

The experience should feel calm and direct. Security comes from server-side
authorization, exact scoping, short-lived grants, and complete receipts—not
from frightening copy or repeated confirmation dialogs.

## Users and authority boundaries

### Ordinary tenant staff member

Creates and manages content through the product-owned Web Studio. They may
belong to multiple organizations or have narrow Site/content responsibilities.
They should see only the work and actions they can legitimately use, with a
plain-language explanation when a discoverable action is unavailable.

They must never:

- sign in to Payload separately;
- choose or edit a Payload role;
- enter a Tenant ID, Site ID, capability key, or provider credential;
- access the raw Payload Admin panel, REST API, GraphQL API, or diagnostics
  lane; or
- interpret a permission denial as lost content.

### Tenant access administrator

Manages staff access using the Phase 12 product surface. They can understand
and resolve a request such as “Allow Mina to publish pages on Thailand Site”
without translating it into CMS roles. Their authority remains bounded by
their own exact Tenant assignment and delegation capabilities.

They must not receive platform-wide access, raw engine controls, or an ability
to grant capabilities they do not possess or are not permitted to delegate.

### Asym support staff

Uses product-owned support diagnostics and the Phase 12 read-only **View as**
experience to reproduce what an identified staff member can see. View-as is
visibly distinct, purpose-bound, audited, and never a path into raw Payload
administration. Support may guide a tenant access administrator or escalate a
suspected engine/authorization mismatch.

### Platform operator

May receive the separately governed **Engine diagnostics** grant for a named
incident, Tenant, Site, purpose, and short lifetime. The standard lane is
read-only. It exists to answer a technical diagnostic question, not to provide
an alternative CMS editing workflow.

### Non-interactive service principal

Background publication, projection, and repair operations use explicit
service identities and scoped commands. A service principal never appears as
a human user, never inherits a support session, and never uses the operator
diagnostics UI. Service authorization and receipts remain independently
auditable.

## Authority model the interface must represent

One authoritative Asym context travels from Mission Control to Web Studio:

```text
Supabase-authenticated person
  + exact active organization assignment
  + exact Tenant and Site
  + purpose
  + Phase 12 capabilities and safety floor
  + governance epoch and expiry
  = server-authorized Web Studio request
```

Payload may hold a non-authoritative **Payload Principal Link** keyed by the
immutable Supabase user identifier because Payload requires a user shape. That
link is
an adapter record, not another account:

- local Payload credentials and password recovery remain disabled;
- Payload roles do not independently grant authority;
- display-name or email changes do not create a new identity;
- deletion, suspension, or revocation in Asym fences the next operation even
  if a browser tab remains open;
- every browser, REST, GraphQL, local-API, hook, and background entry point
  either consumes the same verified authorization context or rejects the
  operation; and
- `overrideAccess`, `overrideLock`, `user`, and request context are never
  implicit defaults for a person-driven operation.

Payload's custom authentication and access-control hooks are useful adapters,
but they do not replace Phase 12's policy decision point. Payload documents
that custom strategies can return a Payload user and that collection/global
access functions govern both APIs and Admin Panel visibility. The permanent
design therefore uses those hooks to enforce an already resolved Asym context,
not to rebuild authorization from Payload-local roles.

## Six-answer screen invariant

Every Web Studio authorization, support, or diagnostics state must answer in
ordinary language:

1. **Who am I?** Signed-in person, or support/operator mode if active.
2. **Where am I working?** Exact organization, Site, and environment.
3. **What can I do here?** The relevant allowed action or bounded limitation.
4. **Did my access or work change?** Exact saved/unsaved and access state.
5. **Why is this safe?** Scope, read-only status, and expiry when elevated.
6. **What should I do next?** One primary action and a clear alternative.

An internal error code may accompany support details, but it never substitutes
for these answers.

## Information architecture

### Tenant staff

```text
Mission Control
├── Web Studio
│   ├── Site overview
│   ├── Pages and content
│   ├── Media and forms
│   └── Site settings
└── My access
    ├── Current organization and Site access
    ├── Pending requests
    └── Request access
```

The main shell shows an organization/Site context control, the person's account
menu, and a quiet **My access** link. It does not show a Payload logo, a CMS-user
collection, internal role names, API endpoints, or an **Engine diagnostics**
link.

### Tenant access administrator

Access requests and grants remain in the existing Phase 12 access-governance
surface. Web Studio may deep-link there with prefilled, human-readable scope,
but must not create a parallel access-management screen.

### Support and platform operations

```text
Support workspace
├── Product diagnostics
├── View as staff member (read-only)
└── Escalate engine incident
    └── Engine diagnostics request
        ├── Scope and purpose
        ├── Reauthenticate
        ├── Active read-only session
        ├── Extension or exit
        └── Incident closure receipt
```

Engine diagnostics are reachable only through the incident/support workflow,
not through navigation discovery or a memorized raw Admin URL.

## Ordinary Web Studio entry journey

### 1. Entry from Mission Control

1. The staff member selects **Web Studio**.
2. The server validates the current Supabase session, exact active assignment,
   Tenant, Site, relevant capability, safety floor, governance epoch, and
   expiry.
3. Web Studio opens at the Site overview. No second sign-in, consent screen, or
   provider redirect appears.
4. The shell names the organization and Site before the member edits anything.
5. The initial destination is derived only from a verified server response;
   client-side route visibility is not treated as authorization.

If the person has one eligible Site, enter it directly. If they have several
eligible Sites and no still-valid current choice, show a short Site chooser
with organization grouping, recent legitimate choices, domain, and locale
summary. Never guess from the first membership returned by a query.

### 2. Safe deep link

A bookmarked or shared Web Studio link may preserve only a same-origin,
allowlisted product route. After authentication, the server re-resolves current
authority before restoring it.

- If allowed in the already active organization/Site, open the exact resource.
- If allowed only under another of the person's assignments, show a deliberate
  context-change interstitial; do not switch silently.
- If the resource is absent or not visible, show the same neutral **Page not
  available** state used for a missing resource.
- If the route itself is obsolete, return to the closest safe product index and
  explain that the destination is no longer available.

Never place a privileged token, raw resource ID, support grant, or protected
state in a return URL.

### 3. Return from a normal session refresh

Supabase's current SSR guidance requires cookie-based server/client handling
and warns that responses which refresh authenticated sessions must not be
publicly cached. Web Studio must therefore refresh and validate the session on
the server, set refreshed cookies correctly, and keep authenticated responses
out of shared caches. A successful refresh returns the person to the safe
product route with the same explicit organization/Site context.

## Multi-organization and multi-Site switching

### Context control

The control reads, for example:

> Hope Missions · Thailand Site

Opening it shows only current, verified assignments, grouped by organization.
Each Site row includes its public domain or other distinguishing label. Search
appears only when the list is long enough to need it.

### Switching journey

1. The person chooses a different organization or Site.
2. If there is unsaved or unsynchronized work, Web Studio uses the D12
   recoverable-editor contract to say exactly what is saved and what is not.
   The switch never silently discards work.
3. The server verifies the selected assignment and produces a new exact
   authorization context.
4. Tenant-scoped query, mutation, cache, autosave, undo, upload, and selection
   state are cleared before the new context is rendered.
5. The person lands on the closest equivalent safe destination when that
   destination exists and is allowed; otherwise they land on the new Site
   overview.
6. The organization/Site label changes in the same navigation event. No page
   may display new chrome around old-tenant content.

The product must not auto-switch because a deep link names another Tenant. The
interstitial should say:

> **Switch to Hope Missions?**
>
> This link belongs to Hope Missions · Thailand Site. You are currently working
> in Harbor Outreach · Main Site.

Primary action: **Switch and open page**. Secondary action: **Stay in Harbor
Outreach**.

If the person no longer has the named assignment, do not reveal the
organization, Site, title, author, or existence of the target. Use the neutral
not-available state.

## Capability-aware discoverability

### Whole-area capability is absent

Hide a module from primary navigation when the person cannot use any action in
it and discovery would add noise. **My access** remains available and lists
plain-language access such as “View pages on Thailand Site.” It may offer
**Request access** if that workflow is enabled.

Do not show an empty sidebar item, a blank Payload collection, or a generic
“Forbidden” page.

### An action is relevant but unavailable

Keep a control visible but disabled only when seeing it helps the person
understand a normal workflow—for example, an editor can prepare a Page but
cannot release it. Pair it with concise inline help:

> You can prepare this page, but releasing changes requires a publisher for
> Thailand Site.

Actions are hidden when their existence is sensitive or irrelevant. Disabled
controls must be keyboard discoverable through adjacent text or an accessible
description; a hover-only tooltip is insufficient.

### Request access

The request is prefilled from the denied product action:

- person;
- organization and Site;
- plain-language requested action;
- affected product area; and
- a brief optional reason.

The interface does not expose a capability key or ask the requester to choose a
role. The tenant access administrator sees what the grant permits, its scope,
any Phase 12 duration/safety-floor rule, and whether they are authorized to
grant it. Approval never retries or submits the original content action; the
staff member returns and intentionally performs it after access is granted.

## Denial and interruption taxonomy

Different causes require different recovery, even when they share a safe
visual pattern.

| Condition                              | Staff-facing heading                           | What the product says                                                                                    | Primary action                                    |
| -------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| No Web Studio capability               | **Web Studio is not in your current access**   | Name the active organization/Site and explain that access can be requested or an administrator contacted | **Request access** or **Back to Mission Control** |
| Action not permitted                   | **You cannot do that action**                  | State what remains allowed and who can complete the step                                                 | **Request access** or **Return to page**          |
| Missing or cross-tenant resource       | **Page not available**                         | Do not distinguish missing, deleted, or unauthorized records                                             | **Go to Pages**                                   |
| Session expired                        | **Your session ended**                         | State that no new action was accepted and give truthful saved-work status                                | **Sign in again**                                 |
| Access revoked or assignment changed   | **Your access changed**                        | State that editing stopped and whether the latest draft was saved                                        | **Review my access**                              |
| Authorization service unavailable      | **We cannot verify access right now**          | State that the Site was not changed and access is not being guessed                                      | **Try again**                                     |
| Tenant/Site switch conflicts with work | **Finish or leave this edit before switching** | Name the exact saved and unsaved state                                                                   | **Stay and finish**                               |

Use neutral, specific copy. Do not blame the person, mention RLS/Payload/JWT,
say “contact your administrator” without a route, or imply that retrying can
overcome a real denial.

### HTTP and application semantics

The product may internally distinguish:

- unauthenticated/session invalid (`401`);
- authenticated but action denied (`403`);
- missing or non-disclosable resource (`404`-equivalent);
- stale edit/governance epoch/conflict (`409`); and
- authorization dependency unavailable (`503`).

The browser copy is chosen by the recovery action, not by printing a status
code. Structured codes and a correlation identifier belong under **Technical
details** for support, with no secret or protected content.

## Session expiry and reauthentication

### Advance warning

When a trustworthy expiry is known and there is time to act, display one quiet
warning before interruption:

> **Your session will end soon.** Your saved draft is safe. Stay signed in to
> keep working.

Actions: **Stay signed in** and **Sign out**. Do not announce a per-second
countdown. Announce meaningful milestones and any changed saved-work state.

### Expired while reading

Replace protected content with the session-ended state, clear it from client
stores and caches, and offer **Sign in again**. After successful authentication,
restore only the allowlisted route and recheck current organization/Site
authority.

### Expired while editing or uploading

1. Stop new autosave, upload, and mutation attempts.
2. Report the exact last server-acknowledged save time/revision.
3. Preserve only the D12-approved recoverable local state; do not preserve a
   tenant's protected draft in a cross-account or indefinite browser cache.
4. Reauthenticate using the same Supabase/Asym identity flow.
5. Re-resolve assignment, capabilities, epoch, and current revision.
6. If still authorized and conflict-free, offer a deliberate resume.
7. If access changed, keep save disabled and follow the changed-access journey.

Signing in again proves identity; it does not restore a revoked capability.

### Sensitive step-up

Use fresh reauthentication only for genuinely sensitive actions, including
starting an engine-diagnostics grant or an independently governed repair—not
for routine page editing. The authentication method must support password
managers, copy/paste, and accessible alternatives and must not impose a memory
or puzzle test.

## Access revocation while editing

The next server operation must enforce the current Phase 12 governance epoch.
Where the existing event/realtime infrastructure can provide an earlier signal,
the UI should react promptly, but realtime delivery is an optimization rather
than the security boundary.

1. Stop further saves and disable mutation controls.
2. Do not treat a queued or optimistic save as accepted.
3. State the last exact server-acknowledged revision and time.
4. Clear protected upload queues and data that the person may no longer read.
5. Show **Review my access** and **Back to Mission Control**.
6. If an administrator later restores access, re-fetch the current revision and
   use the normal conflict/recovery flow; never replay stale mutations blindly.

Recommended copy:

> **Your access changed**
>
> Editing has stopped. Changes saved at 3:14 PM are safe. The text typed after
> that time was not saved to the Site.

If local recovery is legitimately available under D12, say so and explain the
bounded resume path. If it is not, do not promise it.

## Authorization outage

Authorization must fail closed, but the experience must not look like a
permission revocation.

1. Prevent every protected mutation and avoid rendering newly requested
   protected data.
2. Preserve only already approved recoverable edit state.
3. Say that Asym cannot verify access and that no Site change was made.
4. Offer **Try again**, **Save a local recovery copy** only when D12 explicitly
   permits it, and a support route.
5. Do not tell the person to request access; their grant may be healthy.
6. Record dependency, latency, correlation, and outcome telemetry without
   protected document contents.

GOV.UK's service-unavailable guidance supports saying what happened, what
happened to the person's work, what they can do next, and how to get help. The
same factual pattern is appropriate here.

## Support handoff and product-owned View as

### Staff asks for help

From an access or error state, **Get help** creates a support handoff containing
only safe context:

- signed-in person and verified organization/Site identifiers;
- product surface and attempted action;
- stable reason and correlation codes;
- timestamp, browser/app version, and authorization service health; and
- the person's optional description.

It must not automatically attach Page body text, donor data, upload contents,
tokens, cookies, raw claims, or a screenshot. The person sees exactly what will
be sent before submission.

### Support reproduces the experience

1. Support opens the product-owned case and selects **View as staff member**.
2. The interface states the person, organization/Site, purpose, read-only
   status, and audit status.
3. Support sees only what that person is currently permitted to see. View-as
   does not borrow the staff member's session or impersonate their identity.
4. A persistent banner says, for example:

   > Viewing as Mina Reyes · Hope Missions · Thailand Site · Read-only

5. Every unavailable action remains unavailable. Product diagnostics may show
   a privileged decision explanation separately, without altering the viewed
   result.
6. **Exit view** immediately returns support to the case and ends the scoped
   view.

If product behavior and the current policy decision disagree, support records
an engine/authorization incident instead of asking the tenant to change roles
until the symptom disappears.

## Governed Engine diagnostics journey

Engine diagnostics are a rare operator tool for answering a concrete incident
question. The standard lane is read-only and must not become the unofficial way
to edit a tenant's Site.

### 1. Request

An authorized support or platform operator starts from an existing incident and
provides:

- one open incident identifier;
- exact environment, Tenant, and Site selected from verified records;
- one diagnostic purpose written in plain language;
- requested read-only diagnostic capability;
- expected duration; and
- any sensitivity or tenant-communication requirement.

The product shows what the grant permits and does not permit. It rejects freehand
Tenant IDs, wildcard Site scope, “all tenants,” and a reason such as “debugging.”
There is no tenant-facing navigation path and no shareable grant URL.

### 2. Authorize and reauthenticate

The requester must still hold the exact Phase 12 operator capability and satisfy
the current safety floor. Fresh reauthentication confirms the same Asym
identity; it never creates or unlocks a Payload-local account.

Activation completes a new supported Supabase MFA challenge/verification,
records the successful verification time server-side, and requires the resulting
current `aal2` session. An older `aal2` claim without that fresh event is not
enough.

For a standard read-only grant, policy-controlled authorization plus fresh
reauthentication is sufficient; requiring a second human for every inspection
would add ceremony without materially changing the read-only boundary. A typed
Repair command runs outside diagnostics under its own current Phase 12
capability and owner-domain preconditions. D30 provides no raw-write lane; any
proposal to create one requires a separate founder decision.

The launch default is 15 minutes, with a server-enforced 60-minute hard maximum
measured from first activation. These values live in Phase 12 policy and
testable configuration; they are not client-controlled.

### 3. Start

Before entering, show a final scope summary:

```text
Engine diagnostics
Organization: Hope Missions
Site: Thailand Site
Environment: Production
Mode: Read-only
Purpose: Investigate Page 404 after release
Expires: 2:32 PM (14 minutes)
Incident: INC-2481
```

Primary action: **Start diagnostics**. Secondary action: **Cancel**. The action
creates an auditable grant and a fresh operator-scoped server session; it does
not add a standing role to the user's profile.

### 4. Use

A persistent scope banner remains visible on every route:

> Engine diagnostics · Hope Missions · Thailand Site · Production · Read-only ·
> Expires 2:32 PM · **Exit**

The diagnostics shell:

- permits only allowlisted reads necessary for the incident;
- rejects cross-Tenant navigation, changed Site parameters, direct API probes,
  and mutation operations server-side;
- does not expose local user/password functions;
- labels provider-specific terms only inside an operator-only **Technical
  details** layer;
- records actor, grant, incident, exact scope, operation, target type/identifier,
  outcome, and time without logging protected body content unnecessarily; and
- keeps **Exit** reachable by keyboard and on narrow screens.

The countdown updates visually at useful intervals and is announced only at
meaningful thresholds. Expiry is enforced by the server; hiding or pausing the
browser timer cannot extend the grant.

### 5. Extend

There is no automatic renewal. Before expiry, **Request more time** explains the
requested increment and requires a current incident, reason, capability, and
safety-floor check. A bounded extension receives a new expiry and receipt.

An expired grant cannot be resurrected. The operator must request a new grant
and reauthenticate. This prevents a forgotten tab from silently becoming a
standing session.

### 6. Expire

At server expiry:

- all further diagnostic requests fail closed;
- in-flight read results are not treated as authority for a later operation;
- the UI replaces protected data with **Diagnostic session ended**;
- no background polling continues with the expired grant;
- **Return to incident** is the primary action; and
- expiry and attempted post-expiry use are auditable.

### 7. Exit early

**Exit** immediately revokes the grant, clears diagnostic caches and scoped
credentials, closes open streams, and returns to the incident. Browser Back,
duplicate tabs, copied URLs, and refresh must not restore access. The receipt
states who exited and when.

### 8. Repair, when inspection finds a defect

The diagnostic panel remains read-only. A repair uses an Asym-owned typed
command with:

- exact Tenant/Site/resource targets;
- preconditions and current revision;
- dry-run or before/after preview;
- current capability and fresh authorization;
- idempotency and transactional/compensating behavior;
- a bounded blast radius;
- success/failure and rollback receipts; and
- no hidden `overrideAccess` shortcut.

Unrestricted raw editing is not the permanent repair strategy. If a future
emergency raw-write lane is ever justified, it needs an independently ratified
contract with second-person approval, exact operation/resource scope, shorter
expiry, enhanced monitoring, and rollback—not an unchecked toggle inside this
decision.

### 9. Close the incident

The operator completes a structured closure containing:

- the original symptom and diagnostic question;
- scoped resources inspected;
- findings and evidence references;
- typed repair commands and before/after receipts, if any;
- validation performed in the product-owned surface;
- remaining risk or follow-up owner;
- diagnostic grant start, extensions, exit/expiry, and final revoked state; and
- a plain-language tenant-facing explanation when communication is required.

Do not paste raw protected content, access tokens, or unrestricted query output
into the incident. Closing the incident does not merely mark the session ended;
the server must confirm every associated grant is expired or revoked.

## Derived interface states

### Tenant staff session states

| State                        |                          Mutations |        Protected reads | Interface treatment                                  |
| ---------------------------- | ---------------------------------: | ---------------------: | ---------------------------------------------------- |
| Signed in and authorized     |             Allowed per capability | Allowed per capability | Normal Web Studio with exact organization/Site       |
| Reauthentication warning     | Allowed until authoritative expiry |                Allowed | Quiet warning; truthful save state                   |
| Session ended                |                                 No |           No new reads | Clear protected UI; reauthenticate                   |
| Access changed               |                  No denied actions |             Re-resolve | Stop editing; explain saved state and My access path |
| Cannot verify access         |                                 No | No new protected reads | Distinguish outage from denial; retry/support        |
| No area capability           |                                 No |                     No | Product no-access/request journey; no raw CMS        |
| Resource absent or concealed |                                 No |                     No | Neutral not-available state                          |

### Diagnostics states

| State                     |                    Entry allowed | Data/actions                                                | Primary next action                   |
| ------------------------- | -------------------------------: | ----------------------------------------------------------- | ------------------------------------- |
| Draft request             | Authorized support/operator only | Safe incident metadata                                      | Complete scope                        |
| Reauthentication required |                               No | Scope summary only                                          | Reauthenticate                        |
| Ready                     |                        Yes, once | Final exact scope                                           | Start diagnostics                     |
| Active read-only          |                              Yes | Allowlisted, scoped reads only                              | Investigate or exit                   |
| Extension requested       | Existing grant only until expiry | Existing read scope unchanged                               | Await result or exit                  |
| Expired                   |                               No | Protected data cleared                                      | Return to incident                    |
| Exited                    |                               No | Receipt only                                                | Return to incident                    |
| Denied                    |                               No | No target disclosure beyond already authorized case context | Review policy/support route           |
| Incident closed           |                               No | Closure receipt                                             | Reopen incident, not grant, if needed |

## Responsive and mobile behavior

Do not weaken authorization or hide critical state at small widths. Ordinary Web
Studio tasks and rare diagnostics must support reflow rather than assuming a
desktop viewport.

- Organization/Site scope remains visible near the top; it may wrap but cannot
  collapse into an unlabeled icon.
- The view-as or diagnostics banner enters normal document flow at high zoom so
  it never obscures focused content.
- Dense authorization and audit tables become labeled cards or horizontally
  constrained detail views without losing relationships.
- Primary and recovery actions remain visible without horizontal scrolling.
- Touch targets follow the shared Core control sizing and satisfy WCAG 2.2
  minimum target expectations.
- A managed-device requirement, if Phase 12 policy imposes one, is enforced by
  policy with clear remediation—not inferred from screen size. A narrow screen
  alone is not a security boundary.
- Session warnings, exit controls, and expiry status remain usable at 400%
  zoom, in landscape/portrait, and with software keyboards open.

## Accessibility contract

### Authentication and reauthentication

- Permit password-manager fill and copy/paste.
- Do not require users to remember, transcribe, or solve content unless a WCAG
  conforming alternative is present.
- Give every error specific text and associate it with the relevant control.
- Preserve a logical focus order and return focus to the invoking control after
  a cancelled dialog.

### State changes

- Announce successful refresh, upcoming expiry, saved-work changes, loss of
  authorization, and diagnostic start/exit through appropriate live regions.
- Use polite status announcements for non-urgent saves and warnings; use an
  assertive alert only when immediate action is required, such as editing being
  stopped.
- Do not move focus merely to announce a status. A full-page recovery state may
  focus its heading after navigation.
- Never rely on color, an icon, or a disabled button alone to communicate scope
  or denial.

### Dialogs and persistent modes

- A session-warning or diagnostic-start dialog has a programmatic name,
  concise description, logical initial focus, Escape/cancel behavior where
  safe, and visible focus.
- View-as and diagnostics banners are landmarks/status regions with a concise
  accessible name. Repeated countdown changes are not announced every second.
- **Exit view** and **Exit diagnostics** are consistently named everywhere.
- Sticky scope controls do not obscure keyboard focus, skip links, errors, or
  headings.

### Content and controls

- Use plain headings, lists, links, buttons, and form labels before custom
  interaction patterns.
- Provide at least WCAG 2.2 AA contrast, logical keyboard navigation, 400%
  reflow, focus-not-obscured behavior, and minimum target sizing.
- Technical identifiers are selectable text under a named disclosure and never
  the only description of the problem.

## Edge-state matrix

| Scenario                                                       | Required permanent behavior                                                                                                      |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| User opens a Page deep link after losing Site access           | Neutral not-available response; no title, Site, Tenant, author, or status disclosure                                             |
| User belongs to target organization but active context differs | Explicit context-change interstitial; never automatic switch                                                                     |
| User switches Tenant with an autosave pending                  | Finish the D12 acknowledgement/recovery decision before clearing tenant state                                                    |
| Two tabs use different organizations                           | Each request carries and validates exact context; one tab cannot mutate using the other's changed client state                   |
| Permission is revoked between render and Save                  | Server rejects the mutation; optimistic UI rolls back; saved-state message names last acknowledged revision                      |
| Session refresh succeeds but assignment is revoked             | Identity resumes, authorization does not; changed-access journey                                                                 |
| Authorization dependency times out                             | Fail closed as unavailable, not denied; preserve only approved recovery state                                                    |
| Old Payload Principal Link has a stale email or role           | Stable Supabase ID maps identity; stale descriptive fields grant nothing and are reconciled asynchronously                       |
| Payload Principal Link is missing                              | Controlled adapter reconciliation may create/repair it without granting authority; operation still requires current Asym context |
| Direct raw Payload Admin URL is entered by tenant staff        | Product-owned not-available/no-access response; never a Payload login form                                                       |
| Direct GraphQL or broad generated REST/auth route is requested | GraphQL is disabled; broad endpoints are not exposed. Any exact same-origin operation missing context is rejected by default     |
| API caller changes Tenant/Site parameter                       | Server rejects non-matching scope without target disclosure                                                                      |
| Support View-as user loses support capability                  | View ends immediately on next request/signal and protected state clears                                                          |
| Operator copies an active diagnostics URL                      | URL alone grants nothing; exact operator, grant, expiry, and scope are revalidated                                               |
| Operator opens a second diagnostics tab                        | Same bounded grant and countdown; exit/expiry revokes both tabs                                                                  |
| Operator attempts mutation in read-only diagnostics            | Server denies, UI explains read-only boundary, attempt is audited                                                                |
| Diagnostics expires during a read                              | Result cannot authorize a later action; UI clears protected result and returns to incident                                       |
| Extension approval arrives after expiry                        | Require a new grant and reauthentication; do not revive the old session                                                          |
| Incident closes while a grant is active                        | Closure is blocked or revokes all associated grants transactionally before completion                                            |
| Audit sink is temporarily unavailable                          | Do not start a diagnostics grant when required audit durability cannot be confirmed                                              |
| Product diagnostics work but raw engine does not               | Keep tenant product available; state that engine diagnostics are unavailable and use bounded retry/escalation                    |
| User signs out in Mission Control                              | Revoke/fence Web Studio, view-as, and diagnostics sessions according to their policy; no second logout needed                    |
| Offboarded staff member has an open Web Studio tab             | Next request fails; protected client state clears; attribution on historical revisions remains intact                            |

## Observability and support evidence

Supportability is part of the user experience. Record structured, privacy-safe
events for:

- entry outcome and denial class;
- exact authorized Tenant/Site identifiers and policy-decision correlation;
- session refresh, expiry, reauthentication, and changed epoch;
- context switch requested/completed/rejected;
- blocked mutation and last acknowledged revision;
- view-as start, target, purpose, scope, exit, and outcome;
- diagnostics request, authorization, reauth, scope, grant ID, start, extension,
  read operation class, denial, expiry, exit, and closure; and
- authorization dependency latency/health.

Never log session tokens, cookies, credential material, complete claims, Page
body content, uploaded bytes, or donor/safeguarding-sensitive data. Dashboards
must distinguish real capability denials, stale-context conflicts, session
expiry, cross-tenant probes, and authorization outages; otherwise support will
misdiagnose one as another.

Alert on repeated cross-tenant attempts, mutation attempts from read-only
diagnostics, grants exceeding policy duration, active grants without open
incidents, post-expiry use, and failed revocation. Alerting should aggregate
expected user denials so ordinary mistakes do not become an operations storm.

## Primary-source grounding

| Source                                                                                                                     | Current evidence                                                                                              | Application to D30                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [Payload custom authentication strategies](https://payloadcms.com/docs/authentication/custom-strategies)                   | Payload supports disabling the local strategy and resolving a user through custom strategies                  | Use the Payload Principal Link adapter without creating a second staff credential system             |
| [Payload access control](https://payloadcms.com/docs/access-control/overview)                                              | Access functions govern API operations and can shape Admin Panel visibility                                   | Enforce the Asym-resolved context at every Payload boundary; do not treat hidden UI as authorization |
| [Payload Admin Panel](https://payloadcms.com/docs/admin/overview)                                                          | Admin routes and access can be configured and extended                                                        | Keep raw Admin unavailable in production; permit only product routes or one governed diagnostic view |
| [Payload authentication operations](https://payloadcms.com/docs/authentication/operations)                                 | Auth collections expose account/session operations through Payload                                            | Keep them internal to the adapter and prevent a parallel tenant account lifecycle                    |
| [Supabase server-side authentication](https://supabase.com/docs/guides/auth/server-side)                                   | SSR auth uses cookie-backed clients for browser and server access                                             | Carry one Supabase session into server-validated Web Studio requests                                 |
| [Supabase advanced SSR guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)                            | Session refresh must propagate cookies correctly; authenticated refresh responses must not be publicly cached | Prevent stale/cross-user session state and preserve safe deep-link returns                           |
| [Supabase session guidance](https://supabase.com/docs/guides/auth/sessions)                                                | Sessions have explicit lifecycle, refresh, and termination behavior                                           | Design truthful expiry, reauthentication, sign-out, and offboarding states                           |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)           | Deny by default, validate authorization on every request, log, and test authorization logic                   | Reject missing/stale context and enforce cross-tenant isolation server-side                          |
| [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) | Session timeout and reauthentication require a security/usability balance                                     | Warn clearly, reauthenticate only when justified, and prevent indefinite diagnostic grants           |
| [NIST SP 800-63B session management](https://pages.nist.gov/800-63-4/sp800-63b/session/)                                   | Sessions may use overall/inactivity timeouts and permit reauthentication to continue                          | Bound ordinary and elevated sessions without repeatedly demanding credentials                        |
| [NIST SP 800-63C federation guidance](https://pages.nist.gov/800-63-4/sp800-63c.html)                                      | A relying party maintains its own session and can request fresh authentication                                | Treat an operator grant as a separate bounded authorization context over the same identity           |
| [WCAG 2.2 Accessible Authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)   | Authentication must not depend on unsupported cognitive-function tests; password managers and copy/paste help | Make sign-in and step-up usable by people with cognitive and motor disabilities                      |
| [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                               | Status must be programmatically conveyed without forcing focus                                                | Announce save, expiry, denial, and diagnostic mode changes appropriately                             |
| [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)                     | Input errors must be identified in text and described                                                         | Make access requests, reauth, and diagnostics forms actionable rather than code-driven               |
| [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                                       | Focus order must preserve meaning and operability                                                             | Keep warnings, dialogs, banners, and recovery actions predictable                                    |
| [WCAG 2.2 Consistent Identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html)           | Repeated functions need consistent identification                                                             | Use the same names for Site switching, My access, and Exit controls                                  |
| [WCAG 2.2 Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)                 | Focused controls must not be fully hidden by author-created content                                           | Prevent sticky diagnostic/scope banners from covering keyboard focus                                 |
| [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                                 | Content must remain usable without two-dimensional scrolling at equivalent narrow widths                      | Support narrow screens and high zoom without hiding scope or recovery actions                        |
| [WCAG 2.2 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                     | Pointer targets need sufficient size or spacing                                                               | Keep context, reauth, and emergency exit actions usable on touch devices                             |
| [GOV.UK page-not-found pattern](https://design-system.service.gov.uk/patterns/page-not-found-pages/)                       | Not-found copy should be concise, non-blaming, and provide a next route                                       | Use one neutral, safe state for missing and non-disclosable cross-tenant resources                   |
| [GOV.UK service-unavailable pattern](https://design-system.service.gov.uk/patterns/service-unavailable-pages/)             | Explain what happened, what happened to submitted work, alternatives, and support                             | Distinguish authorization outages from denials and report mutation outcome truthfully                |

## User research and launch proof

### Required participants

Test the complete prototype with, at minimum:

- communications staff with one organization/Site;
- staff who legitimately switch among multiple organizations and Sites;
- a part-time or low-technical-confidence ministry staff member;
- a tenant access administrator;
- an Asym support specialist;
- a platform operator who has handled a production incident;
- a keyboard-only user; and
- screen-reader users on at least one desktop and one mobile combination.

Use realistic ministry names, long Page titles, shared computers, intermittent
connectivity, expired sessions, and intentionally stale bookmarks. Do not test
only happy-path administrator accounts.

### Required task journeys

Each participant in the relevant role must demonstrate:

1. entering Web Studio from Mission Control without a second login;
2. opening an authorized deep link and identifying organization/Site;
3. handling a deep link for another authorized organization without accidental
   switching;
4. handling a neutral wrong-Tenant/not-available route;
5. understanding an absent area capability and requesting access;
6. understanding a per-action denial without believing content was lost;
7. recovering from session expiry during an edit;
8. understanding access revocation during an edit and identifying the last
   accepted save;
9. distinguishing an authorization outage from a denied capability;
10. creating and receiving a privacy-safe support handoff;
11. starting, recognizing, and exiting product-owned View as;
12. requesting, reauthenticating, starting, using, extending, expiring, and
    exiting one diagnostic grant;
13. confirming that a copied/old diagnostics URL does not restore access; and
14. closing an incident with a complete revocation and repair receipt.

### Measurable launch criteria

Do not ship the staff bridge or diagnostics lane until all of these are true:

- **100% identity continuity:** every participant enters authorized Web Studio
  without a second login or Payload credential.
- **100% scope recognition:** every critical-task participant can state the
  active organization and Site before mutating content.
- **At least 95% first-attempt task success:** ordinary staff complete entry,
  deliberate context switch, access request, and session recovery without
  facilitator help; no participant commits a wrong-Site action.
- **100% state comprehension:** participants correctly distinguish session
  expiry, permission change, missing/non-disclosable content, and authorization
  outage, and name the next action.
- **Zero provider leakage:** ordinary tenant participants see no Payload login,
  role, collection, API, or engine terminology in normal/error journeys.
- **Zero cross-tenant disclosure:** automated and adversarial tests reveal no
  target existence, title, metadata, cache, search, autosave, upload, or error
  detail across Tenant/Site boundaries.
- **Server enforcement at every seam:** browser UI, Payload Admin route,
  REST/GraphQL/local APIs, preview, hooks, uploads, and background commands pass
  deny-by-default contract tests with missing, stale, mismatched, expired, and
  revoked contexts.
- **Causal revocation:** a changed Phase 12 epoch prevents the next protected
  mutation, and the UI reports the last server-acknowledged revision accurately.
- **No mutation from standard diagnostics:** UI, direct HTTP, local API, hook,
  and replay tests cannot write under a read-only diagnostic grant.
- **Complete grant lifecycle:** start, extension, expiry, early exit, capability
  revocation, incident closure, duplicate tab, Back, refresh, and copied URL all
  produce expected revocation and audit receipts.
- **Audit completeness:** every sampled diagnostic operation is attributable to
  one immutable person, incident, grant, Tenant, Site, purpose, scope, outcome,
  and time; no sampled event contains credentials or protected content.
- **No orphan elevation:** production monitoring finds zero active diagnostic
  grants without an open incident and zero grants beyond the policy maximum.
- **Accessible critical paths:** axe has no serious/critical violations; all
  journeys pass keyboard, visible-focus, screen-reader announcement, 400%
  reflow, reduced-motion, contrast, target-size, and accessible-authentication
  checks.
- **Recoverable failure proof:** injected identity, authorization, database,
  audit-sink, network, and expiry failures fail closed, preserve only permitted
  recoverable work, and give a correct next action.
- **Support readiness:** tenant access administrators, support, and operators
  complete their relevant journeys from documented product guidance without
  undocumented console steps or tribal knowledge.

Capture qualitative confusion, time-on-task, wrong-scope near misses, abandoned
requests, repeated reauthentication, and support escalation reasons. A launch
review must close every critical/high usability or authorization finding and
assign owners for monitored lower-severity findings.

## Ruthless UX synthesis

The best permanent experience is one product identity and one capability brain,
with Payload reduced to a policy-enforcing CMS engine behind Web Studio.
Ordinary staff receive a polished product journey: exact organization/Site,
capability-aware controls, useful My access and request paths, honest saved-work
states, and safe recovery from expiry or outages. They never need to understand
the provider boundary.

Support should first use product-owned diagnostics and read-only View as because
those reproduce user behavior without increasing authority. Raw engine
inspection is justified only for a concrete incident that cannot be resolved
there. Its durable solution is a short-lived, exact-scope, read-only grant with
fresh authentication, persistent mode visibility, server-enforced expiry,
complete audit, immediate exit, and structured closure. Repairs return through
typed Asym commands rather than turning emergency access into a second editing
system.

This is less complex than maintaining two staff account systems, two role
models, or a standing super-admin escape hatch. It is also safer and easier to
operate: one revocation boundary, one support vocabulary, one set of denial
states, and one evidence chain from staff action to engine operation.
