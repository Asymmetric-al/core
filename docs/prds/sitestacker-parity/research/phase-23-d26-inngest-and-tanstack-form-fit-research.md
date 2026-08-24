# Phase 23 D26 research — Inngest and TanStack Form fit

**Status:** Complete supporting research for the founder-ratified B-prime-R.
The exact authority is in the
[D26 decision brief](./phase-23-d26-public-form-definitions-and-routing-decision-brief.md),
and this research does not independently expand it.

**Date:** 2026-08-23

## Question

Would Core's existing Inngest and TanStack Form capabilities materially improve
D26 Public Form Definitions, or would they add cost, coupling, and a second
source of truth?

## Direct verdict

**Use both, but for different bounded jobs. Neither becomes authority.**

| Capability                                  | D26 verdict                                                      | Bounded job                                                                                                                  | Must never own                                                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Inngest 4.5.1                               | Yes — reuse the existing shared runtime                          | Execute already-committed destination intents outside the public request; retry and expose infrastructure traces             | Submission acceptance, route policy, recipient selection, consent, domain records, email truth, or durable idempotency |
| TanStack Form 1.28.6                        | Yes — use Core's shared adapter for the staff definition builder | Browser-local interaction for repeatable questions, nested options, cross-field rules, delivery setup, and publish readiness | Released definition, server validation, persistence, routing, autosave, consent, or workflow state                     |
| TanStack Form in the public visitor runtime | Not as a required launch dependency                              | A later progressive enhancement only if a complex purpose proves it improves UX without losing native behavior               | The semantic HTML form, no-JavaScript submission, exact-revision validation, or the public POST boundary               |

This is reuse, not a new platform or dependency decision. Core already pins both
libraries and already has the correct high-level boundaries. D26 needs one
important hardening: the accepted submission, all destination intents, and all
corresponding workflow-dispatch rows must commit in **one PostgreSQL
transaction**. Calling the current dispatch helper only after the occurrence is
stored would leave an unrecoverable crash gap.

## Repository evidence

### Inngest is already Core's shared durable executor

- [`packages/api/package.json`](../../../../packages/api/package.json) pins
  `inngest` 4.5.1.
- The canonical
  [workflow-orchestration specification](../../../../openspec/specs/workflow-orchestration/spec.md)
  makes product records, provider records, tenant authorization, work claims,
  and the product-owned dispatch ledger authoritative. Inngest is the executor,
  not truth.
- [`events.ts`](../../../../packages/api/src/workflows/events.ts) defines a
  tenant-scoped, versioned, identifier-only event envelope and rejects broad or
  sensitive payload classes.
- [`ledger.ts`](../../../../packages/api/src/workflows/ledger.ts) creates or
  reuses a durable dispatch request, sends its event, and records the handoff
  result.
- [`recovery.ts`](../../../../packages/api/src/workflows/recovery.ts) repairs
  pending or failed handoffs from that shared ledger; it does not decide
  business outcomes.
- [`dispatch-recovery-scan.ts`](../../../../packages/api/src/workflows/functions/dispatch-recovery-scan.ts)
  already supplies one bounded global recovery scan. D26 needs no per-Tenant or
  per-form scheduler.
- [`serve.ts`](../../../../packages/api/src/workflows/serve.ts) registers the
  shared functions behind the existing admin endpoint.

### The existing helper does not make a separately created D26 occurrence atomic

`requestWorkflowDispatch()` creates or reuses the ledger row and then attempts
the handoff. If D26 first commits its occurrence and intents and then calls that
helper, a process crash between those operations leaves committed work with no
ledger row for the recovery scan to discover.

D26 therefore needs a server-only transaction/RPC that inserts all three kinds
of product record together:

1. one immutable `FormSubmissionOccurrence`;
2. its complete released set of `FormDestinationIntent` records; and
3. one pending `workflow_dispatch_requests` row for each independently
   executable destination intent.

After commit, the request path may best-effort dispatch those existing ledger
rows. A failure is safe: the shared recovery scan can find them. As defense in
depth, an integrity scan may report committed pending destination intents that
some historical bug left without a ledger row, but that scan must not replace
the atomic transaction.

### TanStack Form is already Core's complex-form standard

- [`apps/admin/package.json`](../../../../apps/admin/package.json) and
  [`packages/ui/package.json`](../../../../packages/ui/package.json) pin
  `@tanstack/react-form` 1.28.6.
- The [frontend rulebook](../../../ai/rules/frontend.md) chooses TanStack Form
  plus Zod for complex forms with several fields, arrays, reusable sections,
  cross-field or asynchronous validation, and modal/drawer workflows. It keeps
  simple or server-only forms native.
- [`tanstack-form.tsx`](../../../../packages/ui/components/primitives/tanstack-form.tsx)
  supplies `useAsymForm`, composed field hooks, and a single shared extension
  seam.
- The
  [Web Studio living specification](../../../guides/architecture/web-studio-living-spec.md)
  already names TanStack Form plus Zod for template and wizard screens.

Some current Web Studio flows still import raw `useForm`. D26 should use the
shared `useAsymForm` adapter instead of adding another wrapper or repeating
field/error plumbing.

The required official TanStack workflow was also checked. The current Intent
inventory exposes no TanStack Form skill, so the official TanStack CLI and the
versioned Form documentation were used directly.

## Permanent execution boundary

```text
anonymous browser
      |
      | POST values + release identity + idempotency token
      v
Asym server boundary
      |
      | derive Tenant/Site/current D1 generation
      | compile and validate the exact released definition
      | enforce abuse, byte, consent, and purpose rules
      v
one PostgreSQL transaction
      |
      +-- immutable FormSubmissionOccurrence
      +-- bounded FormDestinationIntent records
      +-- pending workflow_dispatch_requests rows
      |
      +---- commit ----> browser may receive "Received"
                           |
                           | never waits for Hub/email/Mobilize
                           v
             best-effort handoff + shared recovery scan
                           |
                           v
                   shared Inngest runtime
                           |
                           | identifier-only event
                           | fenced product work claim
                           v
                 one typed owner command per intent
```

### Inngest's exact job

Use one run for each independently recoverable logical destination intent, with
a minimal stable step set. A successful ordinary run should usually need one
durable owner-command step. Never create a step per form field or per email
recipient. Phase 6/17 owns recipient-level communication planning, transport,
and evidence.

The workflow event carries only:

- Tenant id;
- workflow name and envelope version;
- destination-intent id as the durable subject;
- dispatch-request id; and
- bounded non-personal routing/audit context when strictly needed.

It carries no answers, names, email addresses, recipient lists, rendered
messages, consent text, uploads, tokens, or secrets.

The worker must reload the intent under the event's Tenant, re-prove subject and
route compatibility, acquire a fenced product work claim, call one typed owner
command, and record the owner result on product-owned state. An already-complete
intent returns its stored result rather than repeating the effect.

Two shared-runtime seams need small permanent hardening before D26 Live traffic:

- [`dispatch.ts`](../../../../packages/api/src/workflows/dispatch.ts) currently
  captures arbitrary thrown `error.message`, and the ledger can persist it.
  Normalize failures to bounded safe codes and redacted operator detail before
  storage; do not let SDK/network text leak answer or connection data.
- [`summaries.ts`](../../../../packages/api/src/workflows/summaries.ts) needs a
  product-owned outcome loader for D26 destination intents. An Inngest handoff
  receipt means only “queued”; Form health must distinguish owner processing,
  completion, retry, terminal failure, and adverse provider evidence.

An idempotent failure handler may record the safe terminal code after workflow
retries exhaust, but staff recovery remains a product command. Staff never need
the Inngest dashboard to understand or repair a submission.

### Failure and idempotency

Inngest's event id prevents duplicate execution for only 24 hours. It is useful
defense in depth, not D26's permanent idempotency authority.
[Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)

Permanent protection is layered:

- a unique submission key under Tenant × released form × client token ×
  normalized request identity;
- a unique destination-intent slot per occurrence and semantic outcome;
- a unique namespaced dispatch-ledger key;
- a fenced product work claim for concurrent attempts;
- a typed owner command with domain-owned uniqueness; and
- provider idempotency/reconciliation where an external effect has an unknown
  outcome.

This closes the important crash points:

| Failure                                              | Permanent behavior                                                                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Database transaction fails                           | No occurrence, intent, or dispatch row exists; the visitor receives a safe retryable failure.                           |
| Commit succeeds, immediate Inngest handoff fails     | The visitor's receipt remains valid; the shared recovery scan dispatches the pending ledger row.                        |
| Inngest accepts the event, ledger status write fails | Near-term event dedupe reduces duplicate dispatch; product claims and owner idempotency remain correct beyond 24 hours. |
| Owner effect commits, function response is lost      | Retry loads the already-complete owner result; an indeterminate provider effect reconciles before resend.               |
| Inngest is disabled or quota-exhausted               | Product records remain valid and visible; manual/shared recovery resumes from the ledger without visitor resubmission.  |

### Multi-Tenant flow control without loss

Use Tenant-keyed concurrency to prevent one ministry from consuming shared
capacity and provider-aware queued throttling where an owner requires a start
rate. Inngest documents that concurrency limits active steps, throttling queues
excess starts, and rate limiting skips excess runs.
[Concurrency](https://www.inngest.com/docs/guides/concurrency),
[throttling](https://www.inngest.com/docs/guides/throttling),
[rate limiting](https://www.inngest.com/docs/guides/rate-limiting)

Therefore D26 must not use lossy `rateLimit`, debounce, or event batching for
accepted submissions. Abuse controls belong before acceptance; accepted work
must remain queued and recoverable.

### Cost discipline

Inngest currently bills an execution for the function run and each executed
step. A function with one `step.run()` therefore uses two executions on its
successful path. [Inngest pricing](https://www.inngest.com/pricing)

D26's cost controls are:

- reuse the shared client, serve endpoint, ledger, and recovery scan;
- add no D26-specific cron, per-Tenant app, per-Tenant scheduler, realtime
  progress stream, long wait, debounce, or ordinary batching lane;
- one run per logical destination intent, not per answer or recipient;
- keep the successful step count minimal and stable;
- cap destination and notification fan-out in the purpose profile; and
- load-test executions per accepted submission, recovery throughput, queue age,
  retry amplification, and the account-wide monthly budget before activation.

If continuously active in production, the currently registered recovery
schedules create a meaningful fixed execution baseline. At their configured
frequencies and present successful step counts:

| Registered scan                                                                                                              | Cadence         | Successful executions per run | Approximate 30-day executions |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------: | ----------------------------: |
| [`dispatch-recovery-scan.ts`](../../../../packages/api/src/workflows/functions/dispatch-recovery-scan.ts)                    | Every 5 minutes |                             2 |                        17,280 |
| [`donation-saga-recovery.ts`](../../../../packages/api/src/workflows/functions/donation-saga-recovery.ts)                    | Every 2 minutes |                             2 |                        43,200 |
| [`stripe-event-processing.ts`](../../../../packages/api/src/workflows/functions/stripe-event-processing.ts) recovery trigger | Every 2 minutes |                             3 |                        64,800 |
| **Existing scheduled baseline**                                                                                              |                 |                               |                   **125,280** |

Current public pricing lists 50,000 included Hobby executions and 1,000,000
included Pro executions. D26 must therefore be budgeted against the shared
account—not sold as “free because it is only one more function”—and it must not
add another polling schedule.

## Permanent interaction boundary

### Staff definition builder: use TanStack Form

The five-step builder is exactly the complex-form case Core assigns to TanStack
Form: reorderable typed questions, nested options, destination configuration,
cross-field purpose rules, confirmation copy, and publish readiness.

Use `createAsymFormHook()` only to register small D26-specific components such
as a question editor and destination picker. TanStack state is a temporary edit
buffer; the durable source remains the versioned, code-validated definition
revision.

TanStack documents reusable composition, arrays, Standard Schema validation,
and dynamic validation. Use dynamic validation sparingly: first-submit
validation followed by on-change/on-blur correction is calmer than showing
errors while staff first type.
[Composition](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition),
[arrays](https://tanstack.com/form/latest/docs/framework/react/guides/arrays),
[validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation),
[dynamic validation](https://tanstack.com/form/latest/docs/framework/react/guides/dynamic-validation)

The builder must:

- reveal configuration progressively under **Purpose**, **Questions**,
  **Delivery**, **Confirmation**, and **Review & publish**;
- validate locally for fast feedback while keeping the release command
  authoritative;
- preserve completed steps and focus the first actionable error after failed
  review;
- identify errors by stable semantic field/destination id, never mutable labels
  or array positions; and
- use narrow subscriptions so editing one question does not rerender the entire
  builder.

### Public visitor runtime: native-first

D26 should render the exact released definition as semantic native `form`,
`label`, `input`, `select`, `textarea`, `fieldset`, and `legend` elements and
submit to one thin server boundary. Basic HTML constraints, correct
`autocomplete` and `inputmode`, browser autofill, mobile keyboards, and a
no-JavaScript path should work without TanStack Form.

A small client enhancement may improve inline feedback and pending state. A
later complex purpose may qualify for the shared TanStack adapter only after it
proves no loss of native submission, accessibility, exact-release behavior, or
performance. D26 does not make that library part of the foundational public
contract.

This is the safer boundary because runtime tenant field keys do not retain all
of TanStack's compile-time `DeepKeys<TFormData>` advantage, and the server must
independently compile and validate the exact persisted release anyway. Adding
`@tanstack/react-form-nextjs` would introduce another package and Server Action
contract without eliminating D26's trusted-scope, abuse, idempotency, or atomic
transaction requirements.
[TanStack Form with Next.js](https://tanstack.com/form/latest/docs/framework/react/guides/ssr)

For public forms:

- client validation is progressive assistance, never acceptance or security;
- submit remains keyboard reachable and discoverable so an invalid attempt can
  reveal the complete accessible error summary;
- server errors preserve values, focus the linked summary, and appear beside
  stable field ids;
- a changed release never silently remaps answers;
- browser history, URLs, analytics, logs, and local storage contain no answers;
  D26 adds no hidden autosave; and
- slow networks and ambiguous responses use the durable idempotency token to
  look up the acceptance receipt instead of creating a second submission.

### One canonical definition compiler

Avoid client/server validation drift with one code-owned compiler boundary:

- the persisted definition is a closed discriminated union of allowed field
  types and bounded configuration;
- each `fieldKey` is immutable and separate from its editable label;
- `compileSubmissionSchema(exactRevision)` builds the canonical validator;
- the staff builder validates definition structure;
- the public client may reuse pure validation for helpful feedback; and
- the server always reloads and recompiles the exact released revision, rejects
  unknown/tampered fields, performs canonical transforms, and derives Tenant,
  route, recipients, and message contract from trusted release state.

TanStack Form explicitly states that Standard Schema validation does not
preserve transformed output values. Canonical normalization must therefore stay
server-owned.
[Submission handling](https://tanstack.com/form/latest/docs/framework/react/guides/submission-handling)

No tenant-authored JavaScript, executable validators, arbitrary regular
expressions, arbitrary webhooks, or client-selected routes enter this compiler.

### Existing shared-adapter prefactor

The shared adapter is the right seam, but it is not yet D26-ready:

- `AsymFieldShell` renders a sibling `FieldLabel` without `htmlFor`, so its
  generated control id is not programmatically associated with the visible
  label;
- controls reference generated description/error ids, but `FieldDescription`
  and `FieldError` are not currently given those ids;
- `AsymSubmitButton` uses native `disabled` when `canSubmit` is false, which can
  remove error discovery from the keyboard path; and
- no focused tests for the shared TanStack form adapter were found.

Fix these once in the shared primitive and prove label/control association,
description/error references, error announcement, error-summary focus, and a
keyboard-reachable submit action before D26's staff builder depends on it. This
small prefactor prevents every complex form from inventing its own workaround.

## Adversarial delta across every review category

| Category                    | Material concern | Severity / likelihood before controls | Evidence-led permanent prevention                                                                                                                                                            |
| --------------------------- | ---------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                 | Yes              | High / Possible                       | Atomically create occurrence, intents, and ledger rows; key draft interaction to exact revision identity; persist stable product ids, not library paths or run ids.                          |
| Technical debt              | Yes              | High / Likely                         | Reuse the shared ledger, recovery scan, Inngest client, and `useAsymForm`; add only a closed definition compiler and destination adapters.                                                   |
| Edge cases                  | Yes              | High / Likely                         | Cover double submit, stale tabs, process death at every transaction/handoff point, replay after 24 hours, release changes, and ambiguous owner outcomes.                                     |
| Footguns                    | Yes              | High / Possible                       | No browser dispatch, PII events, client-authoritative validation, lossy flow control, direct Resend calls, or dashboard replay as a business command.                                        |
| Tenant safety               | Yes              | Critical / Possible                   | Derive Tenant from trusted host/generation, structurally scope every row and lookup, reload the intent under Tenant, and use Tenant-keyed concurrency plus denial tests.                     |
| Overengineering             | Yes              | Medium / Likely                       | No per-Tenant Inngest app or cron, workflow graph, generic JSON engine, required public TanStack runtime, extra Next.js form adapter, or step/field/recipient fan-out.                       |
| UX/UI friction              | Yes              | High / Likely                         | Acknowledge after durable receipt, not downstream delivery; use semantic native public fields, preserved values, error summary/focus, clear pending state, and a discoverable submit action. |
| Hidden coupling             | Yes              | High / Possible                       | Domain identity uses release, occurrence, destination-intent, and dispatch-request ids; Inngest and TanStack remain replaceable adapters behind product ports.                               |
| Failure modes               | Yes              | Critical / Possible                   | Atomic outbox, shared recovery, fenced claims, owner idempotency, bounded retries, reconciliation before repeating unknown external effects, and product-owned dead-letter state.            |
| Data integrity              | Yes              | Critical / Possible                   | Database uniqueness, immutable route/publication pins, compare-and-set transitions, append-only attempts, and exact replay of an already-complete owner command.                             |
| Security/privacy            | Yes              | Critical / Likely                     | Identifier-only events, server validation, no sensitive browser persistence or telemetry, bounded safe error codes, and server-only service credentials.                                     |
| Scalability/performance     | Yes              | High / Likely                         | Abuse controls before acceptance, bounded fan-out, narrow builder subscriptions, Tenant-keyed concurrency, queued throttling, recovery-capacity and execution-budget tests.                  |
| Operational burden          | Yes              | High / Possible                       | One shared scanner and product Form health; staff never need the Inngest console, while engineers may follow a redacted correlation link.                                                    |
| Observability gaps          | Yes              | High / Likely                         | Distinguish receipt, handoff, claim, owner outcome, provider outcome, attempts, next retry, and terminal cause; alert on pending age and dead letters.                                       |
| Dependency/integration risk | Yes              | Medium / Possible                     | Exact pins, thin adapters, contract tests, safe manual recovery, and account-wide capacity/cost budgets prevent either vendor from becoming a hard authority.                                |
| Migration/upgrade risk      | Yes              | Medium / Possible                     | Version envelopes and definitions; preserve stable function, step, field, and product ids; use additive database changes and replay old releases in upgrade tests.                           |
| Other development hazards   | Yes              | Critical / Possible                   | Prove mixed deployments, lease expiry, concurrent retries, crash points, disabled/quota-exhausted Inngest, server/client schema disagreement, and rollback paths.                            |

## Required proof before Live activation

1. Occurrence, complete destination-intent set, and dispatch rows commit or roll
   back together.
2. A crash immediately after commit is recovered without visitor resubmission.
3. Duplicate HTTP requests, events, retries, manual repair, and replay after 24
   hours produce one business effect.
4. Inngest disabled, unavailable, or quota-exhausted leaves accepted work safe,
   visible, and recoverable.
5. Cross-Tenant event and subject mismatches cannot read or mutate records.
6. The event validator rejects answers, addresses, bodies, rendered HTML,
   recipients, consent text, tokens, uploads, and secrets.
7. Provider-success/database-timeout ambiguity reconciles without duplicate
   delivery.
8. The definition compiler rejects every unsupported field/configuration and
   the server rejects client-bypassed or tampered input.
9. Shared primitive tests prove label/control association, description and error
   references, error announcement, error-summary focus, and keyboard-reachable
   submission.
10. A no-JavaScript visitor flow plus keyboard, screen-reader, zoom/reflow,
    forced-colors, RTL, autofill, slow-network, and preserved-value tests pass.
11. Production-shaped load proves executions per submission, account-wide cost,
    provider and Tenant fairness, recovery drain time, queue-age alerts, and
    bounded fan-out.

## Ratified amendment incorporated into B-prime-R

The founder-ratified authority incorporates three evidence-required changes:

1. Clause 9 adds workflow-dispatch rows to the same acceptance transaction.
2. Clause 21 binds D26 to the existing shared Inngest runtime only after
   commit, with identifier-only events, product idempotency/claims, lossless
   Tenant-aware flow control, shared recovery, and Phase 6/17-owned email work.
3. Clause 22 selects the shared `useAsymForm` adapter for the staff
   definition builder after its focused accessibility prefactor, while keeping
   the public form semantic-native and server-authoritative at launch.

These amendments close real failure and maintenance risks without adding a
second workflow system, form engine, dependency, scheduler, or database
authority.

## Primary sources checked 2026-08-23

- [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- [Inngest concurrency](https://www.inngest.com/docs/guides/concurrency)
- [Inngest throttling](https://www.inngest.com/docs/guides/throttling)
- [Inngest rate limiting](https://www.inngest.com/docs/guides/rate-limiting)
- [Inngest usage limits](https://www.inngest.com/docs/usage-limits/inngest)
- [Inngest pricing](https://www.inngest.com/pricing)
- [TanStack Form validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation)
- [TanStack Form submission handling](https://tanstack.com/form/latest/docs/framework/react/guides/submission-handling)
- [TanStack Form arrays](https://tanstack.com/form/latest/docs/framework/react/guides/arrays)
- [TanStack Form composition](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition)
- [TanStack Form dynamic validation](https://tanstack.com/form/latest/docs/framework/react/guides/dynamic-validation)
- [TanStack Form with Next.js](https://tanstack.com/form/latest/docs/framework/react/guides/ssr)

Repository search used the checked-out worktree because the available Nia index
returned stale dependency and architecture claims that conflict with current
package pins, source files, and merged OpenSpec. Local source and the current
official documentation above were treated as authority.
