# Eve-native web UI: current state and Factory fit

**Research date:** 2026-08-12

**Wayfinder ticket:** [#1245 — Verify the current Eve-native web app UI and its fit for the Factory](https://github.com/Asymmetric-al/core/issues/1245)

**Evidence snapshot:** Official `vercel/eve` release [`eve@0.33.3`](https://github.com/vercel/eve/releases/tag/eve%400.33.3), commit [`ab9be9840b70fb1a7ae5d56f265dd6a237b733d0`](https://github.com/vercel/eve/tree/ab9be9840b70fb1a7ae5d56f265dd6a237b733d0)

**Status:** Decision support only. This report does not deploy, fork, or implement a UI.

## Executive finding

The Vercel-produced artifact that best matches “Eve-native web app UI” is not a separately named product or hosted operator console. It is the official **Web Chat** source scaffold, registered as `channel/web`, plus Eve's `useEveAgent` frontend client. The registry describes it as a built-in Next.js Web Chat channel and requires Eve `>=0.33.0`; `eve init --channel-web-nextjs` or `eve add channel/web` copies a Next.js application and UI source into the consuming project. The generated application is therefore an editable starter, not an opaque service or a versioned dashboard component. [Registry entry](https://github.com/vercel/eve/blob/eve%400.33.3/apps/docs/registry.json#L1700-L1717), [CLI reference](https://github.com/vercel/eve/blob/eve%400.33.3/docs/reference/cli.md), [template generator](https://github.com/vercel/eve/blob/eve%400.33.3/packages/eve/src/setup/scaffold/create/web-template.ts)

It is a strong **conversation surface**: streamed text and reasoning, tool input/output, attachments, connection authorization, human-input buttons, exact-turn cancellation, and visible request failures are implemented in first-party source. Eve supplies durable sessions and replayable event streams under that surface. [chat component](https://github.com/vercel/eve/blob/eve%400.33.3/apps/docs/registry/channel/web/app/_components/agent-chat.tsx), [message component](https://github.com/vercel/eve/blob/eve%400.33.3/apps/docs/registry/channel/web/app/_components/agent-message.tsx), [frontend guide](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/frontend/overview.mdx)

It is not a Factory control plane. The scaffold has no run queue, Work Contract Pack, role/cell topology, lease view, local-CI/evidence adjudication, Forgejo-to-GitHub publication state, proof/knowledge lifecycle, durable approval ledger, incident console, or recovery administration. Eve route authentication also does **not** enforce session ownership: any per-user, per-tenant, or per-session authorization must be added by the application. [auth guide](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/auth-and-route-protection.md#what-reaches-ctxsessionauth), [HTTP channel routes](https://github.com/vercel/eve/blob/eve%400.33.3/docs/channels/eve.mdx#routes)

Core cannot consume today's scaffold unchanged. Core pins `eve@0.25.1`, while the official Web Chat registry requires `>=0.33.0`, and Eve `0.31.0` introduced a breaking migration from continuation tokens to fixed ID-addressed sessions and a separate `respond()` API. The upstream scaffold is also tied to a newer frontend matrix. Adoption must follow an explicit Eve migration and compatibility test, not a source copy into the existing Mission Control runtime. [Eve changelog](https://github.com/vercel/eve/blob/eve%400.33.3/packages/eve/CHANGELOG.md), [`packages/eve-runtime/package.json`](../../../packages/eve-runtime/package.json)

**Decision-ready posture:** adopt the official Web Chat source as the starting interaction layer for a separate private **Factory Operator UI**, after the Eve-version and deployment decision. Keep Factory lifecycle, authorization, approvals, code authority, evidence, and recovery in deterministic Factory-owned services and stores. The UI may project those records and request commands; it must not invent or become their authority.

## Artifact disambiguation

The first-party repository contains several user-facing surfaces that should not be conflated.

| Artifact                           | What it is                                                                                                                                                             | Relevance                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Web Chat (`channel/web`)**       | A registry/scaffolding item that writes a Next.js app, AI Elements-derived components, an Eve HTTP channel, and `withEve()` configuration into the consumer's project. | This is the artifact the founder direction most likely identifies. It is the only official source named “Web Chat” and described as embedding a first-party web chat UI. [catalog](https://github.com/vercel/eve/blob/eve%400.33.3/packages/eve-catalog/src/index.ts), [registry](https://github.com/vercel/eve/blob/eve%400.33.3/apps/docs/registry.json#L1700-L1717) |
| **`useEveAgent`**                  | React, Vue, and Svelte state/transport hooks over the Eve HTTP channel. React is the reference implementation.                                                         | This is the reusable Eve-native client contract beneath the scaffold, not a complete operator application. [frontend overview](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/frontend/overview.mdx)                                                                                                                                                      |
| **Next.js framework fixture/demo** | A repository application used to demonstrate and test `withEve`, auth, transport, and trace rendering.                                                                 | Useful implementation evidence, but it is not the published Web Chat artifact. [framework app](https://github.com/vercel/eve/tree/eve%400.33.3/apps/frameworks/next)                                                                                                                                                                                                   |
| **Vercel Agent Runs**              | An optional Vercel Observability tab for browsing sessions and conversation traces; team enablement may require a Vercel representative.                               | Operational observability, not the source Web Chat and not a self-hosted Factory operator console. [Vercel deployment guide](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/deployment/vercel.mdx#inspect-agent-runs)                                                                                                                                     |
| **Eve development TUI**            | The terminal development and remote-agent client.                                                                                                                      | A developer surface, not the selected web workplace.                                                                                                                                                                                                                                                                                                                   |

No primary source reviewed identifies a separate Vercel product with a name such as “Eve Console” or “Eve Operator UI.” This report therefore uses the source-owned term **Eve Web Chat** and avoids turning “Eve-native web app UI” into a new product name.

## Version, package, and maturity posture

| Dimension                       | Verified current state                                                                                                                                                                                                                                                                                                                                                                                  | Factory consequence                                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eve release                     | npm `latest` and the latest GitHub release are `eve@0.33.3`; the package requires Node `>=24`. [package](https://github.com/vercel/eve/blob/eve%400.33.3/packages/eve/package.json), [release](https://github.com/vercel/eve/releases/tag/eve%400.33.3)                                                                                                                                                 | Pin an exact Eve version and qualify migrations. Do not follow `latest` in production.                                                                                                    |
| Web Chat delivery               | `channel/web` is an official registry item requiring Eve `>=0.33.0`. The installer copies source files and dependencies into the host app. [registry](https://github.com/vercel/eve/blob/eve%400.33.3/apps/docs/registry.json#L1700-L1717), [scaffold updater](https://github.com/vercel/eve/blob/eve%400.33.3/packages/eve/src/setup/scaffold/update/channels.ts)                                      | ASYM owns the resulting UI source, security review, changes, and future reconciliation with upstream. This is not an independently upgradable UI package.                                 |
| Unauthenticated template matrix | At the exact `0.33.3` tag, the source template pins Next.js `16.3.0-preview.6`, React/React DOM `19.2.6`, and TypeScript `6.0.3`. [template package constants](https://github.com/vercel/eve/blob/eve%400.33.3/packages/eve/src/setup/scaffold/create/web-template.ts)                                                                                                                                  | Treat the copied package matrix as scaffold input, not compatibility proof for Core.                                                                                                      |
| Authenticated variant matrix    | The opt-in Sign in with Vercel generator defaults Next.js to `16.3.0`, rather than the unauthenticated template's preview pin, and adds Better Auth. [web options](https://github.com/vercel/eve/blob/eve%400.33.3/packages/eve/src/setup/scaffold/update/web-options.ts), [authenticated template](https://github.com/vercel/eve/tree/eve%400.33.3/apps/docs/registry/channel/web-sign-in-with-vercel) | The two source variants already have different version assumptions. Generate and inspect the exact chosen variant before integration.                                                     |
| Core matrix                     | Core pins Eve `0.25.1`, Next.js `16.3.0-preview.9`, React/React DOM `19.2.3`, and TypeScript `6.0.3`. [`packages/eve-runtime`](../../../packages/eve-runtime/package.json), [root package](../../../package.json)                                                                                                                                                                                       | Eve is the blocking compatibility gap. Next/React differences also need a normal repo-specific integration pass.                                                                          |
| License and status              | `vercel/eve` and the `eve` package declare Apache-2.0. The repository says Eve is beta and subject to Vercel beta terms; APIs and behavior may change before GA. [license](https://github.com/vercel/eve/blob/eve%400.33.3/LICENSE), [repository README](https://github.com/vercel/eve/blob/eve%400.33.3/README.md#beta-terms)                                                                          | The source is usable under its license, but production qualification and dependency-license review remain ASYM responsibilities. Beta status argues for a pinned pilot and upgrade tests. |

The `0.33.x` line is materially recent: `0.33.0` changed channel messages to cancellation-backed steering by default, `0.33.1` added the authenticated Web Chat variant and repaired concurrent approval/message behavior, `0.33.2` updated Workflow Core for event-log corruption fixes, and `0.33.3` fixed option replies in GitHub channels. These are protocol and durability changes, not cosmetic UI releases. [changelog](https://github.com/vercel/eve/blob/eve%400.33.3/packages/eve/CHANGELOG.md)

## Architecture and deployment

The generated Next.js page is a browser client of the Eve HTTP channel. `useEveAgent()` calls same-origin `/eve/v1/*` routes; `withEve()` connects the host application to a separately built Eve service. In local development it starts Eve beside Next.js and proxies same-origin routes. On Vercel it writes service and route entries to Build Output so the Next app remains the default app while Eve routes go to the generated service. On a non-Vercel production host, the operator supplies the Eve service origin or equivalent reverse-proxy routing. [Next.js guide](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/frontend/nextjs.mdx), [framework README](https://github.com/vercel/eve/blob/eve%400.33.3/apps/frameworks/next/README.md)

Eve itself runs the durable agent loop in a trusted Node/Nitro application runtime. Workflow state and sandbox compute are separate adapters. Vercel deployment uses Vercel Workflow and Vercel Sandbox; self-hosting uses the local Workflow world by default or an experimental custom world, and the operator must mount `.eve/.workflow-data` on persistent storage. Both `/eve/` and `/.well-known/workflow/` must be routed or callbacks stall. [execution model](https://github.com/vercel/eve/blob/eve%400.33.3/docs/concepts/execution-model-and-durability.mdx), [self-hosting](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/deployment/self-hosting.md)

This topology does not require the Factory UI and agent runtime to share authority. A sound Factory composition is:

1. the private operator web app authenticates the human and renders Factory-owned records;
2. deterministic Factory APIs authorize lifecycle commands and own authoritative state;
3. Eve Web Chat reaches an Eve/Codex orchestration adapter for conversational work;
4. worker compute receives only the scoped capability needed for its leased task;
5. CI, evidence, Forgejo/GitHub handoff, and knowledge records remain outside the chat transcript.

Co-deploying Next.js and Eve is supported. Co-owning Factory policy inside React state or an Eve transcript is not implied by that support.

## Identity, authentication, and permissions

The base Web Chat scaffold is intentionally closed in production until configured. Its channel tries `vercelOidc()`, then local-development authentication, then `placeholderAuth()`, which rejects production browser traffic. The docs require replacing the placeholder with the application's own AuthFn; Vercel OIDC is optional and neither it nor local-development auth admits ordinary browser users by itself. [base channel source](https://github.com/vercel/eve/blob/eve%400.33.3/apps/docs/registry/channel/web/agent/channels/eve.ts), [HTTP channel auth](https://github.com/vercel/eve/blob/eve%400.33.3/docs/channels/eve.mdx#authentication)

The opt-in Sign in with Vercel variant adds Better Auth, an eight-hour non-refreshing encrypted-cookie session, a Vercel social provider, deployment-host allowlisting, and an Eve `AuthFn` that maps the signed-in user's stable ID, email, name, picture, and issuer to a user principal. Missing production hosts or required secrets fail during configuration. [auth source](https://github.com/vercel/eve/blob/eve%400.33.3/apps/docs/registry/channel/web-sign-in-with-vercel/lib/auth.ts), [channel source](https://github.com/vercel/eve/blob/eve%400.33.3/apps/docs/registry/channel/web-sign-in-with-vercel/agent/channels/eve.ts)

Important boundary: the variant's UI says “Team members can sign in with Vercel,” but the reviewed application source does not itself test an allowed Vercel team, project role, or Factory role before accepting the Better Auth session. More importantly, Eve explicitly states that route auth does not enforce session ownership. A different authenticated caller who learns a session ID can target its follow-up, control, and stream routes unless the application adds ownership authorization. [authenticated UI](https://github.com/vercel/eve/blob/eve%400.33.3/apps/docs/registry/channel/web-sign-in-with-vercel/app/_components/web-chat-auth.tsx), [Eve auth boundary](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/auth-and-route-protection.md#what-reaches-ctxsessionauth)

Therefore Factory production requirements are additive:

- Factory-owned identity, membership, and role mapping;
- deny-by-default authorization on every run/session read and command;
- server-side binding from an Eve session ID to a Factory run and authorized principals;
- separate permissions for observe, steer, answer a question, approve a governed action, cancel, retry, publish, and administer;
- reauthorization or dual control for high-impact decisions;
- no bearer session ID treated as an authorization capability.

Vercel Team sign-in can be one upstream identity signal. It is not, by itself, the Factory authorization model.

## Sessions, runs, realtime behavior, and durability

Eve's current protocol has a useful durable substrate:

- a session is a long-lived conversation or task;
- a turn is one message and its triggered work;
- a step is a durable checkpoint around a model call and its tool calls;
- fixed session IDs address messages, cancellation, clearing, compaction, reset, and NDJSON streams;
- completed steps replay recorded results after restart, while an interrupted step can re-run;
- each stream event carries an ID and timestamp, and clients reconnect by absolute stream index;
- `useEveAgent` projects streamed events into render-ready messages and exposes raw events, session cursor, status, `send`, `respond`, `stop`, and `reset`. [execution model](https://github.com/vercel/eve/blob/eve%400.33.3/docs/concepts/execution-model-and-durability.mdx), [sessions and streaming](https://github.com/vercel/eve/blob/eve%400.33.3/docs/concepts/sessions-runs-and-streaming.md), [frontend API](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/frontend/overview.mdx#returned-state)

The generated Web Chat does not provide a thread index or server-side history application. It keeps the current hook state in the mounted page. The frontend guide shows how an adopter may persist the event log and `{ sessionId, streamIndex }` cursor in local storage or a database, but that persistence is application code, not part of the scaffold. The source also exposes no HTTP route to enumerate sessions; its routes operate on a known session ID. [generated chat](https://github.com/vercel/eve/blob/eve%400.33.3/apps/docs/registry/channel/web/app/_components/agent-chat.tsx), [resumption guidance](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/frontend/overview.mdx#resumable-sessions), [route list](https://github.com/vercel/eve/blob/eve%400.33.3/docs/channels/eve.mdx#routes)

Durability is not exactly-once side-effect execution. A completed step does not rerun, but an interrupted step does; events already emitted by the interrupted attempt remain, and the retry emits new event IDs. Eve instructs authors to make non-idempotent effects idempotent or approval-gated. Cancellation is cooperative and does not roll back partial output or completed effects. The Factory must use its own idempotency keys, action ledger, leases, and reconciliation for real effects. [crash recovery](https://github.com/vercel/eve/blob/eve%400.33.3/docs/concepts/execution-model-and-durability.mdx#resuming-after-a-crash), [message delivery](https://github.com/vercel/eve/blob/eve%400.33.3/docs/concepts/execution-model-and-durability.mdx#message-delivery-and-steering)

## Approvals, questions, steering, and cancellation

The first-party message renderer displays dynamic tool calls, their inputs/results, and an `input.requested` prompt with option buttons. It also renders connection authorization states and links. Button responses are sent by request ID through `agent.respond()`, which is the correct structured protocol after Eve `0.31.0`. [message source](https://github.com/vercel/eve/blob/eve%400.33.3/apps/docs/registry/channel/web/app/_components/agent-message.tsx), [HITL guide](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/frontend/overview.mdx#human-in-the-loop-prompts)

The scaffold does not turn those responses into Factory approvals. An Eve tool-approval answer authorizes the pending Eve tool call under authored policy; it is not automatically a two-person approval, change-management record, release authorization, publication authorization, or proof sign-off. The Factory must create its own approval request and immutable decision record, authorize the responder, bind it to exact subject hashes and expiry, and only then let an adapter answer Eve.

Current Eve defaults ordinary channel messages during an active turn to cancellation-backed `turnPolicy: "steer"`. The generated Web Chat, however, disables submission while busy, so it does not expose an active-turn steering composer. Its Stop control observes `turn.started`, sends an exact `turnId` cancellation, and waits for the durable cancellation boundary. This is a sound cancellation primitive but not an operator pause/kill-switch policy. [chat source](https://github.com/vercel/eve/blob/eve%400.33.3/apps/docs/registry/channel/web/app/_components/agent-chat.tsx), [delivery semantics](https://github.com/vercel/eve/blob/eve%400.33.3/docs/concepts/execution-model-and-durability.mdx#message-delivery-and-steering)

One presentation gap is visible in source: the renderer displays option buttons for pending input, but it does not render a freeform response field when an Eve question permits freeform input, even though the frontend guide documents that case. Factory qualification should test every approval/question/session-limit shape rather than assume the starter covers the full protocol.

## Audit, export, retention, and recovery

Eve durably records session/workflow state and event streams needed for replay and resumption. `useEveAgent.onEvent` and custom reducers are extension seams for exporting events. Local development can retain OpenTelemetry traces, and Vercel deployments can expose Agent Runs or export telemetry to a configured backend. [security model](https://github.com/vercel/eve/blob/eve%400.33.3/docs/concepts/security-model.md#data-flow-at-a-glance), [instrumentation](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/instrumentation.md), [CLI trace retention](https://github.com/vercel/eve/blob/eve%400.33.3/docs/reference/cli.md#retention)

Those facilities are observability and runtime durability, not a reviewed Factory audit ledger. The reviewed Web Chat and HTTP route contract provide no authoritative event export job, retention policy, legal hold, deletion workflow, backup manifest, restore command, restore verification, or cross-store point-in-time recovery contract. Eve's own security guide makes retention and deletion the deployer's responsibility. The local-world self-hosting guide says to persist `.eve/.workflow-data`; it does not define a complete backup/restore procedure. [security responsibilities](https://github.com/vercel/eve/blob/eve%400.33.3/docs/concepts/security-model.md), [self-hosting persistence](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/deployment/self-hosting.md#persist-workflow-state)

Sandbox recovery is also bounded. If a persisted sandbox is no longer available, Eve may create a replacement, but files changed after the original was created are not automatically restored; important artifacts must be stored outside the sandbox. [sandbox lifecycle](https://github.com/vercel/eve/blob/eve%400.33.3/docs/sandbox.mdx)

The Factory therefore owns:

- append-only command, decision, state-transition, and external-effect records;
- exact actor, subject, policy/version, evidence digest, and outcome provenance;
- event ingestion sequence independent of Eve event timestamps;
- durable artifact/evidence storage outside worker sandboxes;
- redaction, retention, deletion, hold, export, backup, restore, and restore-drill policy;
- reconciliation between Factory state, Eve sessions, Codex workers, Git, CI, and remote services.

The Eve event stream is valuable input to that ledger. It is not the ledger itself.

## Extension seams and failure behavior

Useful official extension seams include:

- editing the copied Next.js/React source and AI Elements-derived components;
- custom `useEveAgent` reducers, initial events/session cursor, `onEvent`, `onError`, `onFinish`, request headers, and per-turn client context;
- attaching directly to child session IDs with the TypeScript client for subagent detail;
- `withEve({ agents })` and `useEveAgent({ agent })` for named agents;
- authored Eve route auth, `onMessage`, channel event handlers, hooks, and custom channels;
- self-hosted workflow-world and sandbox adapters, with the documented experimental/support caveats. [frontend guide](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/frontend/overview.mdx), [Next.js integration](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/frontend/nextjs.mdx), [HTTP customization](https://github.com/vercel/eve/blob/eve%400.33.3/docs/channels/eve.mdx#customization)

Verified failure behavior includes:

- production route auth fails closed until configured;
- the UI shows the last request or cancellation error, but has no incident workflow or retry/reconcile console;
- client stream interruption does not stop the server turn, and the client can reconnect from its cursor;
- Stop is asynchronous and must be confirmed by `turn.cancelled` then `session.waiting`;
- stale or wrong-turn cancellation is a benign no-op when guarded by `turnId`;
- unknown or terminal session follow-up returns `409 session_not_active` rather than silently creating another session;
- compaction failure preserves prior history and returns the session to waiting;
- interrupted durable steps can rerun and duplicate pre-checkpoint effects unless the adopter supplies idempotency;
- missing self-hosted workflow callback routing causes runs to stall;
- loss of non-externalized sandbox files is not repaired by workflow replay. [HTTP channel](https://github.com/vercel/eve/blob/eve%400.33.3/docs/channels/eve.mdx), [self-hosting](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/deployment/self-hosting.md), [sandbox](https://github.com/vercel/eve/blob/eve%400.33.3/docs/sandbox.mdx)

These are sensible framework behaviors. A production Factory UI still needs explicit stale-data indicators, command acknowledgements, timeouts, degraded-mode handling, operator-visible retries, reconciliation status, and a path that works when Eve is unavailable.

## Reconciliation with Core, Codex, and the private Factory boundary

The prior [Eve/Codex research](./eve-codex-execution-current-state.md) establishes that Eve and Codex are separate execution layers and that no native Eve-to-Codex adapter exists in the reviewed package surfaces. Eve Web Chat speaks the Eve HTTP session protocol only. It neither embeds the Codex harness nor translates Codex threads, approvals, cancellation, sandboxing, and terminal outcomes.

The prior [Eve stack reconciliation](./eve-stack-reconciliation.md) establishes that Core's existing Mission Control Eve integration is product-tenant code: product Supabase identity and persistence, product admin routes, and tenant-linked GitHub authority. Mounting the Factory UI into that host or pointing it at those records would violate the required private Factory boundary.

The compatible topology is therefore a separate Factory application and identity plane. An Eve/Codex adapter may project Codex execution into Eve sessions for conversation, but the deterministic Factory scheduler remains responsible for admission, role/run leases, bounded retries, idempotency, budgets, code authority, and terminal state. The UI consumes the scheduler's record and uses authenticated commands; it does not infer Factory truth from a chat message or running animation.

| Concern            | Upstream Eve/Web Chat guarantee                                                                           | Deterministic Factory responsibility                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Human conversation | Stream and render Eve messages, reasoning, tools, attachments, input requests, and authorization prompts. | Decide which content is safe to display, redact, retain, and associate with a Factory run.                                     |
| Identity           | AuthFn chain; optional Better Auth/Vercel user principal.                                                 | Factory membership, roles, session/run ownership, separation of duties, revocation, and command authorization.                 |
| Session/run        | Durable Eve session, turns, steps, stream cursor, cancel/clear/compact/reset.                             | Work Contract Pack, run state machine, cells/roles, leases, admission, capacity, retry budget, and terminal outcome.           |
| Human input        | Structured request/response and tool-approval parking.                                                    | Governed approval policy, independent approvers, exact subject binding, expiry, dual control, and immutable decision record.   |
| Realtime           | Replayable NDJSON stream and reconnect cursor.                                                            | Authoritative state projection, stale/degraded indicators, ingestion ordering, reconciliation, and operator acknowledgement.   |
| Durability         | Workflow checkpoints and replay; interrupted steps may rerun.                                             | Idempotency keys, effect journal, compensation/escalation, external artifact durability, and recovery objectives.              |
| Execution          | Eve agent runtime and sandbox boundary.                                                                   | Eve-to-Codex bridge, Codex version/auth/quota policy, worker isolation, secrets, and one-writer enforcement.                   |
| Code and CI        | No Factory-specific guarantee.                                                                            | Forgejo unpublished authority, protected local CI, evidence adjudication, exact-SHA GitHub handoff, and human merge authority. |
| Audit/recovery     | Runtime events, optional traces, deployment-specific workflow storage.                                    | Durable audit/evidence ledger, export, retention/deletion/hold, backup, restore, and proof of restore.                         |
| Knowledge          | No Company Brain/OKF lifecycle.                                                                           | Provenance, validation, Knowledge Pack, post-merge proof, publication, supersession, and rollback.                             |

## Scoped domain language

These terms keep the decision precise without changing the repository glossary in this research ticket:

- **Eve Web Chat** — the official `channel/web` source scaffold and `useEveAgent` interaction layer.
- **Factory Operator UI** — the private ASYM application through which authorized humans observe Factory records and request commands.
- **Eve session** — Eve's durable conversation/task execution container. It is not automatically a Factory run.
- **Factory run** — an admitted Work Contract instance governed by the Factory state machine, leases, evidence, and terminal outcome.
- **Eve input response** — an answer to a pending Eve tool/question/session-limit request.
- **Factory approval record** — an authorized, durable decision bound to an exact actor, subject, policy, evidence set, expiry, and outcome.

The UI may correlate an Eve session to a Factory run and may translate a valid Factory approval into an Eve input response. The two concepts must remain distinct.

## Decision options

### Recommended — adopt the source scaffold inside a separate Factory operator shell

After an explicit Eve upgrade, generate the exact authenticated Web Chat variant into a Factory-owned application, then keep its conversation components and client protocol behind a narrow adapter. Build the run list, lifecycle/evidence views, permissions, approval records, incident state, and recovery commands against Factory-owned APIs.

- Preserves first-party Eve compatibility and avoids rebuilding streaming/HITL presentation.
- Keeps the replaceable UI outside the deterministic authority boundary.
- Requires an Eve `0.25.1` to current migration and a deliberate UI source-upgrade process.

### Conservative — use only `useEveAgent`, build all Factory UI components locally

Consume the Eve client/hook after migration but do not import the copied Web Chat presentation source.

- Maximum control over design system, accessibility, information architecture, and operator semantics.
- More implementation work and greater risk of mishandling lesser-used Eve stream parts unless conformance tests are strong.

### Prototype-only — deploy the unmodified Web Chat as a private conversational pilot

Use the authenticated variant solely to qualify Eve sessions, streaming, HITL, and cancellation with non-authoritative test work.

- Fastest technical validation.
- Must not expose production credentials, publication commands, authoritative approvals, or Factory lifecycle controls.
- Does not satisfy the first production cell's operator requirements.

### Rejected — treat Web Chat as the Factory control plane

Inferring run state from transcripts, treating Eve approval buttons as release authority, relying on route auth as session ownership, or storing evidence only in Eve workflow/sandbox state would contradict the verified contracts and the private Factory boundary.

## Qualification gates before adoption

1. Select and pin an Eve release, then test the `0.25.1` to selected-version migration, including durable session compatibility.
2. Generate the exact chosen Web Chat/auth variant in an isolated branch and inspect its resolved dependency tree; do not copy from mutable `main`.
3. Prove Factory identity, role, run ownership, and per-command authorization independently of Eve route auth.
4. Specify and contract-test the Eve-to-Codex adapter for messages, events, approvals, cancellation, resumption, sandboxing, and terminal outcomes.
5. Add Factory-owned persistence for run/session correlation and projections; test reconnect, duplicate/retried events, stale cursors, and lost browser state.
6. Route every governed approval through the Factory approval ledger before answering Eve.
7. Externalize evidence and important files from worker sandboxes and test backup/restore/reconciliation.
8. Exercise failure cases: Eve unavailable, Workflow callback unavailable, browser disconnect, stale cancel, worker crash before/after an effect, auth revocation, session ID disclosure, and version rollback.
9. Validate accessibility, responsive behavior, secret/redaction handling, content safety, and the repo's Next.js instant-navigation requirements in the final host.
10. Keep an operator path to view authoritative state and stop new admissions even when the conversational Eve surface is degraded.

## Bounded unknowns

- The reviewed first-party source does not establish which Vercel account/team membership constraints the Sign in with Vercel application grants in a real configured Vercel App. Its local source contains no explicit team allowlist; verify claims and scopes in a disposable authentication pilot before relying on it.
- Vercel Agent Runs availability, retention, export, and commercial entitlement for ASYM were not inspected. They are not prerequisites for the recommended Factory-owned audit design.
- No hosted Eve deployment, Workflow store, Vercel Sandbox, Vercel App, or private identity configuration was accessed. This report describes published contracts, not ASYM's live service state.
- The exact production migration path from Core's `eve@0.25.1` to a future selected release remains separate implementation work.
- Upstream `main` moved beyond the `0.33.3` tag during research. Unreleased source was not used as a production guarantee.

## Primary sources

- [Vercel Eve repository at `eve@0.33.3`](https://github.com/vercel/eve/tree/eve%400.33.3)
- [Eve `0.33.3` release](https://github.com/vercel/eve/releases/tag/eve%400.33.3)
- [Eve changelog](https://github.com/vercel/eve/blob/eve%400.33.3/packages/eve/CHANGELOG.md)
- [Official Web Chat registry entry and source](https://github.com/vercel/eve/tree/eve%400.33.3/apps/docs/registry/channel/web)
- [Authenticated Web Chat variant](https://github.com/vercel/eve/tree/eve%400.33.3/apps/docs/registry/channel/web-sign-in-with-vercel)
- [Frontend guide](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/frontend/overview.mdx)
- [Next.js integration](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/frontend/nextjs.mdx)
- [Eve HTTP channel](https://github.com/vercel/eve/blob/eve%400.33.3/docs/channels/eve.mdx)
- [Authentication and route protection](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/auth-and-route-protection.md)
- [Sessions, runs, and streaming](https://github.com/vercel/eve/blob/eve%400.33.3/docs/concepts/sessions-runs-and-streaming.md)
- [Execution and durability](https://github.com/vercel/eve/blob/eve%400.33.3/docs/concepts/execution-model-and-durability.mdx)
- [Security model](https://github.com/vercel/eve/blob/eve%400.33.3/docs/concepts/security-model.md)
- [Vercel deployment](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/deployment/vercel.mdx)
- [Self-hosting](https://github.com/vercel/eve/blob/eve%400.33.3/docs/guides/deployment/self-hosting.md)
- [Apache-2.0 license](https://github.com/vercel/eve/blob/eve%400.33.3/LICENSE)

## Verification limits

Research used only the exact official release tag, official repository source/docs, npm release metadata, and the two existing Core research assets named by the ticket. No secondary implementation article was used. No UI was generated, deployed, forked, or executed. No tracker, product code, working set, context map, or ADR was changed.
