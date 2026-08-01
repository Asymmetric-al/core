# Phase 20 Accounting Exception Operations Research Evidence

**Research date:** 2026-07-26
**Decision status:** ratified as Phase 20 D13 on 2026-07-26

## Executive conclusion

Phase 20 needs one bounded accounting-exception operating surface, but it must
not become a ticketing product, a second workflow engine, or a new source of
financial truth.

The strongest option is:

> **Option C-prime — cause-owned Accounting Exception Cases through one quiet
> exception-first workspace, with source-authoritative conditions, durable
> append-only case episodes, shared Mission Control follow-up, evidence-gated
> clearing and recurrence, safe homogeneous bulk actions, and exact blocking
> isolation.**

This option preserves the authorities established by D1–D12:

- source domains continue to own economic facts and corrections;
- D4–D8 continue to own accounting meaning, mapping, and provider-native
  carrier plans;
- D9, D10, and D11 continue to own settlement, bank-match, and correction
  truth;
- D12 continues to own when otherwise eligible work may reach the Accounting
  Release fence;
- Delivery Operations and provider readback continue to own delivery evidence;
  and
- QBO or Xero remains authoritative for the tenant's books.

An exception is therefore not a user-editable financial record. It is a
cause-coded, current statement that one existing authority needs attention,
plus a durable, append-only record of how staff routed and handled that
attention.

The key design rule is:

> **Staff may control attention; they may not control whether an unresolved
> authoritative condition is true.**

Assignment, comments, due dates, and “Remind me later” belong to a linked shared
Mission Control task. They do not grant authorization, change source or provider
state, release blocked work, pause a provider worker, or constitute resolution.
An exception clears only when its own contract observes the required evidence.
If the condition returns, a new linked case episode opens without rewriting the
earlier history.

## Research method and limits

The review used:

- the complete Phase 20 D1–D12 decision log and associated ADR vocabulary;
- current official QuickBooks Online, Xero, and Stripe documentation;
- first-party product documentation from Ramp, Brex, Modern Treasury,
  Blackbaud, and Virtuous;
- current W3C WCAG 2.2 and ARIA Authoring Practices guidance; and
- the repository's shared Mission Control task contract, current task schema,
  task service, workflow recovery boundaries, and tenant-isolation posture; and
- adversarial analysis against Phase 20's tenant, legal-entity, accounting,
  provider, and evidence boundaries.

Comparable products demonstrate useful interaction patterns, but none owns
Asym's domain contract. In particular, their generic “mark synced,” “ignore,”
or editable expected-amount actions are not safe evidence that Asym should
copy.

## Current primary-source findings

### QuickBooks Online

QuickBooks Online requires operation-level handling rather than one batch-level
exception:

- QBO strongly recommends a stable `requestid` for every write, update, or
  delete. Retrying without that identity can create duplicates.
- Batch responses contain an outcome or fault for each `bId`; a successful
  transport response does not mean every operation succeeded.
- QBO distinguishes validation, authentication, authorization, system,
  inactive-reference, duplicate, and stale-object failures. These causes need
  different owners and recovery actions.
- Error `5010` requires the latest object and `SyncToken`. QBO recommends
  reading before an update when webhooks or Change Data Capture are not
  keeping the local view current.
- Change Data Capture has a bounded look-back and result limit, so missed
  windows or incomplete pagination must themselves become observable
  operational conditions rather than silently losing drift.
- Provider-side deletion or inactivation can invalidate a previously valid
  mapping without changing the Accounting Release that used the former
  version.

Implications:

- “Retry batch” is unsafe.
- A known validation failure, an authentication failure, a stale object, a
  provider outage, and `Outcome unknown` cannot share one generic retry action.
- Accepted operations stay accepted; only proven-failed or proven-missing work
  may resume.
- Revalidation or exact-object readback, not a staff status toggle, clears the
  exception.

Sources:

- [QBO request IDs and field definitions](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-field-definitions)
- [QBO batch operations](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/batch)
- [QBO API error codes](https://developer.intuit.com/app/developer/qbo/docs/develop/troubleshooting/error-codes)
- [QBO common errors and recovery](https://developer.intuit.com/app/developer/qbo/docs/develop/troubleshooting/handling-common-errors)
- [QBO Change Data Capture](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/change-data-capture)
- [QBO limits and throttles](https://developer.intuit.com/app/developer/qbo/docs/learn/limits-and-throttles)

### Xero

Xero also requires element-level and provider-aware handling:

- With `summarizeErrors=false`, supported requests can return HTTP `200` while
  individual elements contain validation errors. Every returned element must
  be inspected.
- HTTP `400`, `401`, `403`, `429`, `500`, and `503` represent materially
  different recovery classes. An organization can be temporarily offline even
  while the broader API remains available.
- Xero tells clients to make it easy to reauthorize after `401`, honor
  `Retry-After`, and queue work within organization-scoped concurrency,
  minute, and daily limits.
- Xero caches a mutating request's result for the documented idempotency
  interval. Reusing the key with different request content is invalid, and
  repeating after expiry can execute as a new request.
- When repeated idempotent attempts return an internal error, Xero recommends a
  GET to determine whether the resource exists before trying a new key.
- Xero webhook delivery can enter retry and disabled states. Consumer
  integrations must be idempotent and replayable, and cannot treat webhooks as
  an infallible record.

Implications:

- A top-level `200` cannot clear a multi-element exception group.
- `Outcome unknown`, authorization loss, validation, throttling, and
  organization-offline conditions need separate next actions.
- Webhook health, polling/readback, and provider-record drift remain visible
  even after an earlier operation was accepted.

Sources:

- [Xero Accounting API response codes](https://developer.xero.com/documentation/api/accounting/responsecodes)
- [Xero idempotent requests](https://developer.xero.com/documentation/guides/idempotent-requests/idempotency/)
- [Xero rate limits](https://developer.xero.com/documentation/best-practices/api-call-efficiencies/rate-limits)
- [Xero webhooks](https://developer.xero.com/documentation/guides/webhooks/overview/)
- [Xero token and tenant integrity](https://developer.xero.com/documentation/best-practices/data-integrity/managing-tokens)

### Stripe settlement and payout evidence

Stripe's current behavior reinforces the need for condition recurrence and
separate authorities:

- `payout.paid` means the payout is expected to be available at its
  destination. Stripe documents that a payout can initially appear paid and
  later become failed.
- A payout failure has a typed failure code and creates a failure balance
  transaction. In relevant Connect configurations it can also disable the
  affected external account, preventing later payouts until corrected.
- Exact automatic-payout composition is queryable after
  `payout.reconciliation_completed`. Manual and Instant payouts do not provide
  the same transaction-to-payout attribution.
- Stripe recommends Balance Transactions as the base reporting record and
  recommends `reporting_category`, not only `type`, for financial
  classification.
- Balance Transaction lists are paginated; a settlement calculation that does
  not consume every page is incomplete.
- Stripe webhooks may be duplicated and should be processed asynchronously and
  idempotently.

Implications:

- A previously cleared condition can legitimately recur when a later provider
  fact arrives.
- “Paid,” settlement composition, Bank Match, and Accounting Release delivery
  must remain separate states.
- One root provider condition can affect many payouts. Staff should see a
  single grouped next action without losing item-level impact and evidence.

Sources:

- [Stripe Payout object](https://docs.stripe.com/api/payouts/object)
- [Stripe payout reconciliation](https://docs.stripe.com/payouts/reconciliation)
- [Stripe reporting and reconciliation](https://docs.stripe.com/plan-integration/get-started/reporting-reconciliation)
- [Stripe Balance Transaction types](https://docs.stripe.com/reports/balance-transaction-types)
- [Stripe reporting categories](https://docs.stripe.com/reports/reporting-categories)
- [Stripe webhook best practices](https://docs.stripe.com/webhooks)
- [Stripe Connect payout failures](https://docs.stripe.com/connect/marketplace/tasks/payout)

## Comparable product findings

### Useful patterns

#### Ramp

Ramp makes provider-sync failures separately visible from payment state, links
an error to troubleshooting guidance, supports filters for sync errors, and
retries after the underlying condition is fixed. Its error banner can be
dismissed until new errors occur, reducing repeated noise.

Useful lessons:

- do not conflate source payment success with accounting-sync success;
- group staff work around the next repair action;
- keep an always-available filtered exception view even when a banner is
  dismissed; and
- preserve exact history and provider links in progressive disclosure.

Sources:

- [Ramp Bill Pay accounting and sync errors](https://support.ramp.com/bill-pay-accounting)
- [Ramp accounting workflow](https://support.ramp.com/overview-of-ramp-accounting)
- [Ramp authentication-error recovery](https://support.ramp.com/quickbooks-online-sync-error-application-authentication-failed)

#### Brex

Brex uses a prepare, review, and export flow, preserves export history, exposes
failed batch details, and warns that returning exported work to preparation
does not remove the already-created ERP entry. It also distinguishes
integration permissions from ordinary transaction access.

Useful lessons:

- historical delivery attempts and current work deserve separate views;
- reopening attention must not imply that a provider record was reversed; and
- permissions must be product capabilities, not button visibility.

Sources:

- [Brex Accounting page and export history](https://www.brex.com/support/brex-dashboard-accounting-page)
- [Brex bill sync and error handling](https://www.brex.com/support/syncing-bill-pay)

#### Modern Treasury

Modern Treasury presents unresolved reconciliation as side-by-side evidence
and supports one-to-many and many-to-one allocation. It sends reconciliation
events after completion.

Useful lessons:

- show the exact evidence and remaining difference;
- permit bounded many-to-many review where the domain requires it; and
- use deterministic evidence rather than generic “close case” controls.

Source:

- [Modern Treasury manual reconciliation](https://docs.moderntreasury.com/payments/docs/exception-handling-manual-reconciliation)

#### Virtuous

Virtuous separates imported rows into “Match Needed,” “Update Needed,” and
“Ready for Import.” Clear work stays in the ready lane while uncertain work
gets manual review, and bulk operations can continue without preventing staff
from reviewing other categories.

Useful lessons:

- separate clean work from uncertain work;
- group by staff action instead of raw error codes; and
- preserve row-level validation while allowing safe bulk handling.

Source:

- [Virtuous Match Needed, Update Needed, and Ready for Import](https://support.virtuous.org/hc/en-us/articles/6164198344205-Match-Needed-Update-Needed-Ready-for-Import)

### Patterns not to copy

- Ramp's **Mark as synced** can remove work from its queue when staff handled it
  elsewhere. In Asym, an equivalent action must be called
  **Record handled in QuickBooks/Xero**, must be permitted by the exact
  exception contract, and must preserve reason and readback or attestation
  evidence. It cannot manufacture provider acceptance or reconciliation.
- Brex's irreversible **Ignore** changes a bill to out-of-sync. Asym should not
  provide a generic ignore or dismiss-as-resolved action. Staff may defer
  attention, but the condition remains truthful and inspectable.
- Brex can send exported transactions back to preparation while warning that
  ERP entries remain. Asym should not expose generic resubmit after reopening;
  D2's duplicate-safety and read-before-retry rules continue to govern.
- Modern Treasury permits editing an Expected Payment amount during manual
  reconciliation. D10 prohibits a Bank Match action from rewriting
  source-owned Expected Bank Arrival truth.
- Blackbaud batch validation can block approval until every batch exception is
  cleared. That is appropriate for one atomic gift batch but not for Phase
  20's independent Accounting Release units. One exception must not stop
  unrelated clean releases.

Sources:

- [Ramp marking transactions as synced](https://support.ramp.com/marking-transactions-as-synced)
- [Brex bill sync error handling](https://www.brex.com/support/syncing-bill-pay)
- [Modern Treasury manual reconciliation](https://docs.moderntreasury.com/payments/docs/exception-handling-manual-reconciliation)
- [Blackbaud fix batch exceptions](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-ca/content/bb-gift-batch-fix-exceptions.html)

## Three genuine product options

### Option A — Source-owned inline exceptions only

Every authority displays and resolves its own exceptions on the source,
settlement, Bank Match, release, or provider-operation detail page. The Ready
for Accounting workspace shows only aggregate links to those locations.

**Advantages**

- smallest new domain surface;
- exception truth stays close to its owner;
- no new assignment or grouping model; and
- little risk of a generic ticketing system.

**Disadvantages**

- finance staff must hunt through several products and pages;
- no reliable owner, age, or “what needs me now” view;
- repeated provider-wide failures appear as hundreds of separate rows;
- snoozing and bulk action become inconsistent or duplicated by context; and
- January or month-end operations do not scale for a small finance team.

**Assessment:** architecturally pure but operationally inadequate.

### Option B — Full finance exception case management

Every exception becomes a persistent case with status, priority, owner,
watchers, comments, due date, SLA, tags, custom routing, approval chains,
escalation rules, and configurable automation.

**Advantages**

- maximum flexibility;
- familiar enterprise work-management model;
- rich team coordination and reporting; and
- easy to extend into customer support or general operations.

**Disadvantages**

- duplicates the source and provider state machines;
- invites staff to close a case without resolving the authoritative condition;
- creates a second workflow/rules engine;
- requires notifications, comments, search, teams, SLAs, audit, and migration
  infrastructure far beyond Phase 20;
- increases training and administrative burden for small missions
  organizations; and
- makes ordinary accounting work feel bureaucratic.

**Assessment:** powerful but over-engineered, brittle, and outside Phase 20.

### Option C-prime — Cause-owned exception cases in one bounded workspace

Product-owned exception contracts detect current conditions from D1–D12
authorities. A durable Accounting Exception Case records evidence,
revalidation, clearing, and recurrence without becoming financial truth. When
human follow-up is required, the case links to the repository's shared Mission
Control task model for assignment, comments, due dates, and reminders. A quiet
workspace derives groups by cause and next safe action.

**Advantages**

- one fast operating surface for finance staff;
- exact authority and blocking scope remain visible;
- owner and follow-up controls reuse the shared staff-work model instead of
  creating another workflow system;
- provider-wide or mapping-wide root causes can be grouped without losing
  affected-item evidence;
- safe bulk recovery is possible;
- clean work continues; and
- append-only history supports audit and support.

**Disadvantages**

- requires careful separation between condition truth and handling metadata;
- group membership changes as current evidence changes;
- each exception contract needs explicit cause, owner, impact, resolution
  proof, and permitted actions; and
- revalidation and recurrence need concurrency-safe implementation.

**Assessment:** best balance of operational usability, safety, and bounded
scope. **Recommended.**

## Recommended C-prime domain

The following terms are proposed for the grooming decision. They are not
canonical until ratified.

### Accounting Exception Contract

A closed, product-owned definition for one cause. It declares:

- stable cause code and schema version;
- source authority that determines whether the condition exists;
- plain-language title and explanation;
- affected subject type;
- exact block radius;
- severity and whether immediate containment is required;
- default responsible role;
- permitted repair and evidence actions;
- revalidation procedure;
- evidence required to clear;
- whether staff-recorded external handling is allowed;
- whether attention may be deferred and for how long;
- escalation and notification policy; and
- PII-safe display fields.

This is a small catalog in product code or versioned configuration. It is not a
tenant-authored rules language.

### Accounting Exception Condition

The current, source-authoritative determination that one exact root-cause scope
is in a contract-defined exceptional condition. A scope can reference one
subject or an immutable affected-item manifest. For example, one inactive QBO
account creates one mapping-scoped condition affecting every candidate that
uses that target; it does not create one independent root cause per candidate.

It freezes or references:

- Tenant and Legal Entity;
- Accounting Destination, provider organization, environment, connection, and
  delivery lane when applicable;
- exception-contract version and cause;
- authoritative subject type and identity;
- source/provider versions or observation digest;
- exact impact and block radius;
- affected count and per-currency amount;
- first and most recent observation;
- one safe next action; and
- evidence correlation identifiers.

The condition does not contain a user-editable `resolved` boolean.

### Accounting Exception Case

The durable, append-only operational history for one uninterrupted occurrence
of an Accounting Exception Condition. At most one episode may be open for the
same stable exception key.

A case episode records:

- opened and last-observed time;
- staff and system actions;
- exact revalidation results;
- evidence references;
- cleared time and clearing authority; and
- predecessor or successor episode when the condition recurs; and
- the identity of a linked Mission Control task when human follow-up is
  required.

The case is an operational wrapper, not a source fact, accounting release,
provider record, reconciliation verdict, or generic task. Its deterministic
active key includes Tenant, Legal Entity, owning authority, contract version,
cause, root-cause scope, and the destination, environment, lane, and currency
dimensions that the contract actually requires. Recurrence after authoritative
clear creates a linked successor case rather than reopening or overwriting the
old episode.

### Exception Cluster

A disposable UI projection that groups currently open cases only when they
share:

- Tenant and Legal Entity;
- destination, provider, and environment where applicable;
- exception cause and contract version;
- block-radius kind;
- next safe action; and
- compatible action preconditions.

Clusters may show an affected count and amounts separated by currency. A
cluster is never persisted as the authority, never hides its members, and
never permits an action that is unsafe for any selected member.

### Exception Operation Evidence

The append-only evidence of one observation, task-link request, revalidation,
typed recovery action, external-handling record, clearing, recurrence, or bulk
operation. It includes actor, authorization scope, time, stable idempotency key,
selected-item digest, per-item result, reason, and evidence links. Assignment,
comments, reminders, and due dates remain in the linked Mission Control task
history; the accounting case stores only the durable link and any
accounting-relevant outcome evidence.

This requires a domain transaction that persists the case transition and its
append-only event together. A task-materialization intent may be delivered
through an outbox, but it must be idempotent and reconcilable. The repository's
current fail-soft generic audit logger and non-atomic task creation sequence are
not sufficient accounting evidence. No general-purpose event-sourcing framework
is required.

## Detection and cause ownership

Detection must happen at the authority that can prove the condition, including:

| Cause family                      | Detection authority          | Typical block radius                   | Typical next action          |
| --------------------------------- | ---------------------------- | -------------------------------------- | ---------------------------- |
| Missing or stale source fact      | Source contract / D4 fence   | Exact candidate or source set          | Review source                |
| Incomplete source coverage        | D4 Source Coverage Manifest  | Exact release candidate                | Review coverage              |
| Missing or inactive mapping       | D6 mapping validation        | Work using that target                 | Fix mapping                  |
| Carrier Plan capability drift     | D7/D8 capability proof       | Affected recipe or destination lane    | Review plan                  |
| Period not permitted              | D11 policy/provider context  | Exact proposed correction              | Review period                |
| Provider authorization loss       | D3 destination authorization | Exact direct-delivery destination lane | Reconnect same organization  |
| Known provider validation failure | Delivery Operation           | Exact failed operation and dependants  | Fix cause, then retry failed |
| Outcome unknown                   | Delivery Operation           | Exact operation and unsafe dependants  | Check provider outcome       |
| Provider object drift or deletion | Readback / reconciliation    | Exact operation or release             | Review exact provider record |
| Settlement evidence incomplete    | D9 settlement evidence       | Exact payout/account window            | Retry evidence sync          |
| Bank evidence ambiguous           | D10 Bank Match               | Exact allocations under review         | Review bank evidence         |
| Accountant direction required     | D11 correction contract      | Exact correction candidate             | Record accountant direction  |

Ordinary waits are not exceptions:

- a payout still inside its normal provider processing window;
- a D12 scheduled review that has not reached its time;
- a provider operation queued within its healthy service objective;
- a bank arrival still inside its expected date window; or
- a clean release awaiting a staff-controlled cadence.

They become exceptions only when their product-owned threshold or contradiction
is reached.

Suspected tenant-data exposure, credential compromise, or other security
incidents are not routine accounting exceptions. They trigger the platform's
security and containment process. The finance workspace may show a
PII-minimized “Connection paused; Asym is investigating” condition without
exposing incident details.

## Lifecycle and recurrence

The recommended lifecycle is evidence-driven:

1. A product authority observes a cause and derives the stable exception key.
2. The system opens one Accounting Exception Case episode or appends a new
   observation to the current episode.
3. If human follow-up is required, the system idempotently links one shared
   Mission Control task to the case. Staff may assign follow-up, ask to be
   reminded later, comment, inspect evidence, or perform one
   contract-permitted action.
4. The owning authority revalidates after any material action or new provider
   evidence.
5. If the condition no longer exists and required proof is present, the system
   clears the case episode and records the evidence.
6. If the same condition returns after clearing, a new linked case episode
   opens. Earlier resolution history is never rewritten.

There is no generic **Mark resolved** or **Ignore** action. Completing,
dismissing, or suppressing a linked task never clears, hides, or changes the
Accounting Exception Condition. A task completion requests fresh
cause-specific revalidation; the case clears only when the owning authority
proves the condition is gone.

When an exception contract permits staff to resolve work in QBO or Xero:

- the action is named **Record handled in QuickBooks** or
  **Record handled in Xero**;
- it states what Asym will and will not infer;
- it requires a reason and the contract-required reference, provider link,
  attachment, or attestation;
- provider readback is used when available;
- it does not claim that the Accounting Release was delivered through Asym;
  and
- contradictions reopen attention rather than silently overwriting the prior
  record.

“Reopen” means one of:

- the authoritative condition recurred;
- later evidence contradicted the recorded resolution; or
- an authorized staff member contested a staff-recorded external handling
  outcome with a reason.

It never means blindly resubmitting provider work, mutating an Accounting
Release, or reopening an accounting period.

## Shared Mission Control follow-up without a second case-management system

The repository already requires one shared Mission Control task model for staff
follow-up. Phase 20 therefore does not create exception-specific assignment,
comments, reminders, or due-date tables. Instead:

- one Accounting Exception Case links to zero or one active Mission Control task;
- a task is created only when human judgment or action is actually required;
- one systemic or root-cause-scoped condition produces at most one follow-up
  task, not one task per affected operation;
- Mission Control owns queue, assignee, comments, due date, reminders, and
  staff-follow-up status;
- Phase 20 owns cause, impact, block radius, affected authorities, evidence,
  revalidation, clear, and recurrence;
- assignment does not grant access or provider authority;
- only a member who already has the required Tenant, Legal Entity, destination,
  and finance scope may be assigned; and
- completing, dismissing, or suppressing a task cannot remove an unresolved case
  from Accounting > Needs attention.

If an assignee loses access or leaves the tenant, the item returns to
**Unassigned** and produces one grouped notification to the configured finance
owner. Historical assignment evidence remains.

The owner is responsible for follow-up, not accounting truth. Another authorized
staff member may still perform an allowed repair. Automatic transient recovery
and platform incidents do not create staff tasks unless a contract determines
that tenant action is now required.

The current shared-task implementation must be hardened before Phase 20 relies
on it:

- task creation, links, initial event, and the task-materialization idempotency
  key must be atomic or outbox-backed and safely replayable;
- the contribution-specific task adapter and closed type unions must be
  generalized rather than forked;
- queue, task, link, comment, reminder, event, assignee, and linked accounting
  records must be protected by composite tenant-scoped constraints plus
  server-side Tenant, Legal Entity, destination, and role reauthorization;
- concurrent assignment and status changes need a revision/CAS guard and a
  reliable `updated_at` transition;
- required accounting evidence must fail closed if its domain event cannot be
  persisted; and
- the mutable `mission_control_attention_items` table and seed-backed `/tasks`
  UI remain projections or prototypes, never accounting authority.

## “Remind me later,” not hidden snoozing

The user-facing action should be **Remind me later**, implemented through the
linked shared Mission Control task.

It:

- defers routine reminders and moves the item from the immediate-action group
  to a clearly labeled **Later** group;
- preserves the open condition, block, age, totals, audit, and searchable
  presence;
- records actor, reason, deadline, timezone, task revision, and linked case
  version;
- returns the item when the deadline expires;
- returns it early if impact increases, new authoritative evidence arrives,
  the cause changes, the destination disconnects, or the condition recurs; and
- never pauses provider execution or releases blocked work.

The Exception Contract bounds whether and how long attention may be deferred.
Outcome-unknown operations, suspected security issues, cross-tenant risks, and
other immediate-containment causes cannot be hidden. For ordinary finance
exceptions, the UI may offer next business day, one week, or an accessible
custom date within the contract's maximum.

The workspace always exposes a **Later** count and filter. Deferral is not
resolution and is not excluded from operational age metrics.

## Safe bulk handling

Bulk actions are valuable but only when every selected case supports the
same action under the same preconditions.

Normative controls:

- selections cannot cross Tenant, Legal Entity, destination, environment,
  delivery lane, or incompatible currencies;
- a group action displays exact item count, per-currency amount, block radius,
  and what will continue;
- hidden-page or all-filtered selection is explicit and uses a frozen selection
  digest;
- the server reauthorizes and revalidates every item;
- newly matching items are never silently added after staff review;
- stale or incompatible items are excluded with an exact reason;
- partial success is allowed and reported per item;
- every item retains its own audit evidence linked to one bulk-operation ID;
  and
- retry targets only proven-failed operations.

Permitted examples:

- assign several homogeneous linked tasks to one authorized owner;
- set the same bounded reminder for selected linked tasks;
- revalidate affected work after one mapping or connection repair;
- retry several operations that are each conclusively failed and individually
  retryable; or
- schedule readback checks for several outcome-unknown operations.

Forbidden examples:

- bulk mark resolved;
- bulk retry outcome-unknown writes;
- bulk change posting period across incompatible correction causes;
- bulk record provider handling without the required item evidence;
- bulk clear mapping errors by assigning a generic fallback;
- bulk combine mixed currencies into one financial amount; or
- bulk resubmit a whole release because one operation failed.

## Exact blocking isolation

Every Accounting Exception Contract declares its narrowest safe block radius:

- exact source occurrence;
- release candidate;
- Accounting Release;
- Delivery Operation and dependent operations;
- mapping target and only work that uses it;
- Carrier Plan recipe;
- settlement account/currency/evidence interval;
- Accounting Destination direct-delivery lane; or
- Legal Entity only where a true entity-wide invariant is broken.

A destination authorization loss can stop that destination's direct lane. It
does not stop artifact access, another destination, another tenant, or
source-domain processing.

A missing mapping blocks only candidates requiring that mapping. A payout
classification exception blocks only the affected settlement evidence. An
outcome-unknown operation blocks only actions that could duplicate or
contradict that operation.

The workspace must always state:

- **What stopped**
- **What continues**
- **Why**
- **Who can act**
- **Next safe action**

## Recommended staff UX

### One doorway

Accounting exceptions remain inside D12's **Ready for Accounting** workspace.
The Release Horizon adds one quiet **Needs attention** count; it does not link
staff to a separate ticket product. Linked Mission Control ownership, reminders,
comments, and due dates appear inline in the case drawer and in the shared task
views where appropriate.

The default order is:

1. **New or changed**
2. **Unassigned**
3. **Assigned to me**
4. **Assigned to others**
5. **Later**
6. **Recently cleared**, collapsed

Within the current view, groups are ordered by product-owned severity, block
radius, oldest observation, then amount. Tenants may sort and filter; they do
not configure a priority formula.

### Exception cluster row

Each cluster answers, without opening the drawer:

- plain-language cause;
- exact next safe action;
- shared Mission Control assignee or queue;
- affected count;
- amounts separated by currency;
- oldest and most recent observation;
- Legal Entity and destination;
- what is blocked; and
- what continues.

Example:

> **Reconnect QuickBooks access**
> 18 releases are waiting for Hope Missions. No new releases will be sent to
> this QuickBooks company until access is restored. Stripe settlement evidence
> and accounting artifacts continue normally.
> Owner: Unassigned · Oldest: 2 hours
> **Reconnect the same company** · Assign to me · Remind me later

Provider codes and sanitized provider text appear under **Technical details**,
not as the primary heading.

### Detail drawer

One details drawer shows:

1. **What happened**
2. **What is affected**
3. **What is still working**
4. **Recommended action**
5. **Evidence**
6. **History**

The evidence section deep-links to the authoritative source, Accounting
Release, Delivery Operation, exact QBO/Xero object, settlement, Bank Match, or
correction surface. It does not duplicate editable source fields.

### Filters and navigation

Required filters are:

- next action;
- shared Mission Control assignee or queue;
- cause family;
- Legal Entity;
- Accounting Destination;
- age;
- block radius; and
- Later / cleared visibility.

Search supports Accounting Release reference, processor payout reference,
provider record reference, and PII-safe source identifier. Custom saved-view,
tag, and board builders are outside this decision.

### Notifications

Notifications are grouped and exception-only:

- newly assigned work;
- a new material or destination-wide exception;
- an exception that returned after clearing;
- a reminder becoming due;
- an unresolved condition exceeding a product-owned service threshold; or
- an assignee losing access.

Healthy processing, repeated observations of an unchanged condition, every
individual member of one root-cause cluster, and successful automatic clearing
do not produce notification storms. Tenants may choose a daily finance digest.

## Accessibility contract

Current W3C guidance requires more than colored status chips:

- Errors are identified and described in text, with a useful correction
  suggestion when one is known.
- Status changes that matter are programmatically available without moving
  focus.
- Native HTML tables are preferred for non-spreadsheet tabular information.
  An ARIA grid is used only if the product intentionally implements its full
  composite keyboard model.
- Selection checkboxes, row actions, filter controls, and bulk bars are fully
  keyboard operable.
- Status, severity, ownership, and deferral are never communicated by color
  alone.
- Drawer or dialog focus follows WAI-ARIA patterns and returns to the invoking
  row or a logical successor after the row disappears.
- A bulk-action result moves or announces focus to an error summary linked to
  each excluded or failed row.
- “Remind me later” uses an accessible date input, explicit timezone, and
  textual next-reminder summary.
- Large lists preserve total-count and row-position semantics under pagination
  or virtualization.
- Content reflows at 200% zoom, narrow views use readable cards without hiding
  evidence, and targets meet WCAG 2.2 minimum sizing.
- Routine background refresh is quiet; material new, cleared, or failed
  results use a restrained status announcement.

Sources:

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)
- [Understanding status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages)
- [Understanding use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)
- [WAI-ARIA table pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/)
- [WAI-ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## Edge-case catalog

The production design must define and test at least these cases:

1. duplicate provider webhook detects the same condition twice;
2. two workers open the same stable exception key concurrently;
3. a provider-wide OAuth loss affects thousands of operations;
4. one invalid mapping affects thousands of candidate lines;
5. a mapping is repaired while staff are reviewing the affected cluster;
6. a QBO batch has accepted and failed `bId` members;
7. a Xero request returns HTTP `200` with failed elements;
8. a provider times out after committing a write;
9. a known failure becomes `Outcome unknown` because lookup also fails;
10. a payout reports paid and later reports failed;
11. automatic payout composition is not yet queryable;
12. a manual or Instant payout has no exact Stripe component attribution;
13. a condition clears while a bulk retry is being confirmed;
14. a condition recurs seconds after clearing;
15. later readback contradicts staff-recorded provider handling;
16. staff contest an external-handling record;
17. two users assign the same episode simultaneously;
18. an assignee loses membership or Legal Entity access;
19. an assignee is deactivated while work is deferred;
20. a deferred condition becomes materially worse;
21. a reminder falls in a daylight-saving gap or repeated local hour;
22. staff and system both revalidate at reminder expiry;
23. a bulk selection spans hidden pages;
24. new matching exceptions appear after staff review;
25. a bulk action contains one stale or unauthorized item;
26. a group contains multiple currencies;
27. one source subject has two independent causes;
28. a source correction supersedes an exception while provider delivery is
    still in flight;
29. a destination is reconnected to the same provider organization;
30. staff select a different QBO realm or Xero organization during recovery;
31. a provider record is edited, voided, or deleted after readback;
32. webhook delivery is disabled and later replays old events;
33. QBO CDC exceeds its result limit or look-back window;
34. provider error text contains donor, staff, or bank information;
35. direct-delivery and staff-mediated releases are both present in the
    workspace;
36. an artifact was downloaded but staff never imported it;
37. one destination is throttled while other tenants have clean work;
38. a support user requires temporary evidence access;
39. an exception's contract version changes while its episode is open;
40. a cause is retired or split into more precise causes;
41. an item is cleared but retained evidence reaches its disposal date;
42. a suspected cross-tenant routing error occurs; and
43. a security containment action disables a connector before the finance
    workspace refreshes.

## Adversarial risk matrix

| Category                        | Concern? | What could go wrong                                                                                                                     | Why it matters                                                         | Severity | Likelihood     | Permanent control                                                                                                                                    |
| ------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                     | Yes      | One generic status or retry assumes every provider, authority, and cause behaves alike.                                                 | Recovery works only for ideal failures and can duplicate or hide work. | Critical | High           | Versioned cause contracts, authority-owned detection, exact block radius, and contract-specific revalidation.                                        |
| Technical debt                  | Yes      | Phase 20 either builds a second task system or embeds accounting evidence in mutable shared tasks and attention rows.                   | Semantics drift and maintenance cost multiplies.                       | High     | High           | One Phase 20 case/event seam plus a typed, idempotent link to the existing shared Mission Control follow-up model.                                   |
| Edge cases                      | Yes      | Conditions race, recur, change group, cross timezones, lose assignees, or contain partial provider outcomes.                            | Staff see stale truth or unsafe actions.                               | Critical | High           | Stable keys, one-active-case constraint, CAS, fresh revalidation, task-link reconciliation, and the full edge fixture catalog.                       |
| Footguns                        | Yes      | Ignore, mark resolved, bulk retry, or hidden all-page selection creates false closure or duplicates.                                    | Financial evidence and provider books can diverge.                     | Critical | Medium–High    | No generic closure, exact action previews, frozen selection digests, safe homogeneous actions, and per-item results.                                 |
| Tenant safety                   | Yes      | Case-to-task links, queues, assignees, comments, search, or worker recovery cross tenant/entity/destination boundaries.                 | Financial and donor data can leak or post to the wrong books.          | Critical | Low–Medium     | Composite tenant-scoped parent/child FKs, FORCE RLS where applicable, server-derived scope, action reauthorization, and negative isolation tests.    |
| Over-engineering                | Yes      | Phase 20 creates new comments, tasks, tags, priorities, SLAs, approvals, or configurable workflow instead of reusing the shared seam.   | Phase 20 becomes a ticket platform and small tenants face bureaucracy. | High     | High           | Fixed cause catalog, bounded case states/actions, derived clusters, and only the existing Mission Control assignment/follow-up capabilities.         |
| UX/UI friction                  | Yes      | Raw provider codes, noisy rows, many dashboards, and repeated confirmation obscure the next action.                                     | Bookkeepers lose time and confidence during close.                     | High     | High           | Action-first clusters, plain language, progressive evidence, one doorway, and one consequential confirmation.                                        |
| Hidden coupling                 | Yes      | Task completion, dismissal, workflow retry state, or attention-row mutation is mistaken for source/provider/accounting resolution.      | Closing follow-up silently changes financial meaning.                  | Critical | Medium         | Cases derive from D1–D12 authorities; tasks own only human follow-up; every closure requests cause-specific proof revalidation.                      |
| Failure modes                   | Yes      | Worker crash, webhook loss, provider outage, timeout-after-write, partial response, or partial task creation leaves inconsistent state. | Recovery can stall, duplicate tasks, or resubmit accepted work.        | Critical | High           | Durable idempotency, transactional case event, outbox-backed task intent, read-before-retry, and operation-granular recovery.                        |
| Data integrity                  | Yes      | Duplicate cases/tasks, stale clusters, missing evidence, or overwritten resolution history.                                             | Audit cannot explain what was affected or why it cleared.              | Critical | Medium         | Deterministic active key, one active case, unique case-task association, append-only events, recurrence lineage, and CAS.                            |
| Security and privacy            | Yes      | Raw provider errors, source narratives, assignee search, exports, or support access expose sensitive data.                              | Accounting evidence can contain donor, bank, or staff information.     | Critical | Medium         | PII-safe summaries, exact evidence stored once behind purpose-scoped access, redaction, retention, and support audit.                                |
| Scalability and performance     | Yes      | One provider outage creates hundreds of thousands of rows and notifications.                                                            | Workspace and workers become unusable during seasonal volume.          | High     | High           | Root-cause scopes, derived clusters, server pagination, tenant-fair queues, deduplicated notifications, and bounded refresh.                         |
| Operational burden              | Yes      | Staff must continually classify, prioritize, and manually close routine transient conditions.                                           | The product creates more finance work than it saves.                   | High     | Medium–High    | Normal waits excluded, automatic evidence clearing, default owner, exception-only notices, and no routine approvals.                                 |
| Observability gaps              | Yes      | Deferred, unassigned, task-materialization-failed, outcome-unknown, or recurring work disappears from attention.                        | Material issues age silently.                                          | High     | Medium         | Open/later/unassigned/unlinked counts, oldest age, recurrence, blocked amounts by currency, outbox reconciliation, and threshold alerts.             |
| Dependency and integration risk | Yes      | Provider codes, response shapes, limits, and webhook behavior change.                                                                   | Cause mapping and recovery actions become wrong.                       | High     | High over time | Provider-adapter normalization, raw evidence preservation, capability versions, contract tests, and unknown-cause fallback.                          |
| Migration and upgrade risk      | Yes      | A cause code is renamed, split, or retired and open history no longer resolves.                                                         | Historical audit or active work is orphaned.                           | High     | Medium         | Versioned contracts, immutable historical labels, explicit supersession, and open-episode migration tests.                                           |
| Other development hazards       | Yes      | Deployment version skew, non-atomic task creation, bulk partial success, lost evidence/outbox, or inconsistent retention.               | Staff receive false outcomes and evidence is incomplete.               | Critical | Medium         | Compatible workers, transactional case event/outbox, idempotent task materialization, per-item bulk keys, canaries, rollback, and failure injection. |

## Observability and operational measures

Staff-visible measures:

- new, unassigned, assigned-to-me, Later, and reopened counts;
- affected count and amount separated by currency;
- oldest open and oldest unsnoozed age;
- exact block radius;
- last authoritative observation;
- next reminder or revalidation; and
- last safe action and result.

Operational measures:

- exception-open and clear rates by contract version;
- recurrence and false-clear rate;
- time to authoritative clear;
- time to first staff attention where required;
- age of outcome-unknown operations;
- provider and destination cluster size;
- revalidation latency and failure rate;
- bulk action partial-failure rate;
- deferred conditions that returned early;
- notification deduplication rate;
- assignee-orphan count;
- unknown provider cause-code count;
- tenant-fair queue age; and
- audit-evidence handoff failures.

Metrics must not combine currencies into one amount or treat assignment as
resolution.

## Production release gates

No C-prime exception operations should reach production without:

- every D4–D12 cause family mapped to a versioned contract or an explicit
  safe unknown-cause contract;
- duplicate detection, concurrent open, clear/recur, and contract-supersession
  tests;
- one-active-case and append-only-history property tests;
- atomic case-transition/evidence tests and task-outbox failure/replay tests;
- exactly-one linked active task tests, including duplicate materialization and
  partial task/link/event failure;
- shared-task completion, dismissal, suppression, and reminder tests proving
  none can clear or hide an unresolved Accounting Exception Case;
- composite Tenant/Legal Entity/destination task-link isolation, RLS,
  service-role negative, and assignment-scope-loss tests;
- exact block-radius tests proving unrelated clean releases continue;
- QBO item-level batch, inactive reference, stale object, closed period,
  authentication, authorization, rate limit, timeout-after-write, CDC gap,
  deletion, and drift fixtures;
- Xero partial element inside HTTP `200`, validation, lock date, permission,
  authentication, organization offline, rate limit, expired idempotency,
  timeout-after-write, webhook replay/disable, deletion, and drift fixtures;
- Stripe paid-then-failed, payout failure, disabled external account,
  reconciliation-completed, incomplete pagination, manual/Instant payout,
  duplicate webhook, and classification fixtures;
- assignment, access loss, default-owner, unassigned, concurrent reassignment,
  and permission-negative tests;
- reminder deadline, timezone, DST, early return, maximum deferral, critical
  no-deferral, and notification-deduplication tests;
- homogeneous and mixed bulk selection, frozen selection, stale item,
  unauthorized item, partial success, per-item audit, and double-submit tests;
- direct/staff-mediated lane, artifact-not-imported, provider-handled,
  contradictory readback, and recurrence tests;
- wrong Tenant, Legal Entity, destination, provider organization, environment,
  connection, release, mapping, cause, subject, assignee, and evidence negative
  tests;
- provider error redaction, PII-safe indexing, support access, evidence
  retention/disposal, and audit export tests;
- large root-cause cluster, many-fund mapping failure, seasonal volume,
  pagination/virtualization, noisy-neighbor, and destination-circuit tests;
- native-table or fully compliant grid semantics, keyboard selection, focus
  restoration, error summary, status announcement, color independence, 200%
  zoom, responsive, and target-size tests; and
- production-shaped usability tests with one-person finance teams,
  bookkeepers, many-fund missions organizations, tenant finance admins, and
  external accountants.

## Explicit non-goals

- No new accounting-specific task, comment, reminder, watcher, subtask, tag,
  SLA, or workflow system. Human follow-up reuses the bounded shared Mission
  Control task model.
- No tenant-authored exception rules, priorities, routing language, or
  automation graph.
- No generic accounting-condition `Ignore`, `Dismiss`, `Mark synced`,
  `Mark reconciled`, or `Mark resolved`. Dismissing or suppressing a linked
  task affects follow-up only; the unresolved case remains visible.
- No assignment as permission, approval, or accounting authority.
- No reminder as pause, resolution, or concealment from totals and audit.
- No bulk retry of unknown provider outcomes.
- No one exception blocking unrelated clean Accounting Releases.
- No editable source, provider, settlement, Bank Match, or correction truth in
  the exception drawer.
- No automatic provider failover, destination change, lane change, accounting
  period change, or suspense mapping.
- No mutation or deletion of an Accounting Release or prior exception history.
- No claim that Asym is the tenant's general ledger, period-close system, bank
  reconciliation system, incident-management system, or accounting-advice
  authority.

## Ratified founder decision

Phase 20 D13 adopts **Option C-prime-amended-and-hardened (C-prime-R) —
source-authoritative,
cause-owned Accounting Exception Cases through the quiet Ready for Accounting
workspace, with versioned cause contracts, exact blocking isolation,
append-only case episodes, evidence-gated clearing and linked recurrence,
homogeneous revalidated bulk actions, and idempotent shared Mission Control
follow-up that owns human assignment, comments, due dates, and reminders but
never financial truth.**
