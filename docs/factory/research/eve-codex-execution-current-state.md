# Eve and Codex execution, identity, and quota: current state

**Research date:** 2026-08-12  
**Wayfinder ticket:** [#1240 — Verify the current Eve and Codex execution, identity, and quota model](https://github.com/Asymmetric-al/core/issues/1240)  
**Status:** Decision support only. This report does not activate Eve, choose a commercial plan, or authorize autonomous effects.

## Executive finding

- Core pins `eve@0.25.1`; current upstream is `eve@0.33.3`. The gap includes a breaking client/session API migration, changed approval and turn-handling semantics, a workflow event-log corruption fix, and a GitHub channel option-reply fix. The source brief's `0.29.3` baseline is therefore not a safe implementation target.
- Core's Eve package is deliberately verification-only today. Its sample agent uses a deterministic mock model, and its governance boundary makes no provider call. The merged OpenSpec explicitly forbids a live provider path or autonomous production effect at this stage.
- Eve and Codex are separate execution layers. Eve supplies durable agent sessions, workflows, streams, and sandbox integration. Codex supplies a coding-agent harness through the CLI, SDK, MCP server, and the experimental App Server. No native Eve-to-Codex adapter was found in the pinned or current Eve package exports or in the reviewed official guides.
- For unattended Codex, the officially supported starting points are `codex exec` and the Codex SDK. The App Server is useful for a rich client integration, but its command and remote WebSocket transport remain experimental; the SDK is the documented choice for automation, jobs, and CI.
- Authentication and billing are not one interchangeable pool. ChatGPT sign-in and Business/Enterprise Codex access tokens consume workspace entitlements; API keys consume API project usage. API project service accounts are the clearest nonhuman identity for an API-billed fleet. Codex access tokens remain tied to a human user and ChatGPT workspace.
- OpenAI documents usage windows and possible additional limits for ChatGPT-plan Codex usage, and organization/project/model-specific rate limits for API usage. It does not publish a fixed maximum number of concurrent local Codex runs. The factory must therefore impose its own admission control and treat observed throttles as capacity signals, not assume unlimited parallelism.

## Repository reality

| Question                                         | Evidence                                                                                                                                                                                  | Current answer                                                                                                                                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which Eve version is part of Core?               | [`packages/eve-runtime/package.json`](../../../packages/eve-runtime/package.json) and [`bun.lock`](../../../bun.lock)                                                                     | Exact pin: `eve@0.25.1`.                                                                                                                                                                          |
| Does the package currently call a live model?    | [`packages/eve-runtime/agent/agent.ts`](../../../packages/eve-runtime/agent/agent.ts)                                                                                                     | No. The verification agent imports Eve's deterministic `mockModel`.                                                                                                                               |
| Does the governance boundary call a provider?    | [`packages/eve-runtime/src/governance-boundary.ts`](../../../packages/eve-runtime/src/governance-boundary.ts)                                                                             | No. It validates release, policy, route, token, rate, and budget conditions and returns a decision.                                                                                               |
| Is live Eve execution authorized?                | [`openspec/specs/eve-runtime-foundation/spec.md`](../../../openspec/specs/eve-runtime-foundation/spec.md) and [`packages/eve-runtime/AGENTS.md`](../../../packages/eve-runtime/AGENTS.md) | No. The foundation is isolated and disabled by default; it must not add a live provider path, deployment, or autonomous effect.                                                                   |
| Does Core pin a Codex CLI or SDK?                | Repo-scoped searches of package manifests, lockfiles, and Codex configuration                                                                                                             | No package dependency or runtime integration for `@openai/codex` or `@openai/codex-sdk` was found.                                                                                                |
| What Codex CLI was present on the research host? | Read-only `codex --version` and the [`@openai/codex` npm latest record](https://registry.npmjs.org/@openai%2fcodex/latest)                                                                | `codex-cli 0.144.1`, installed outside the repo and therefore not reproducible from Core. The npm latest tag was `0.147.0` on the research date. No login or private account state was inspected. |

The absence finding above is evidence-bounded: it means the reviewed Core repository and published Eve artifacts do not expose a native adapter. It is not a claim that no private or future integration can exist.

## Eve: repo pin versus current upstream

The installed `eve@0.25.1` documentation is the correct API source for the code that Core can execute now. The current-upstream comparison used the exact [published `eve@0.33.3` npm artifact](https://registry.npmjs.org/eve/-/eve-0.33.3.tgz), its [official release](https://github.com/vercel/eve/releases/tag/eve%400.33.3), and the [official Eve changelog](https://github.com/vercel/eve/blob/main/packages/eve/CHANGELOG.md).

| Dimension                       | Repo-pinned `0.25.1`                                                                                                              | Current upstream `0.33.3`                                                                                                      | Factory consequence                                                                                                         |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Product status                  | Preview; APIs and behavior may change before GA.                                                                                  | Still preview in the published package documentation.                                                                          | Pin exact versions and test migrations; do not design around an implied stable ABI.                                         |
| Session/client API              | Continuation-token-era APIs.                                                                                                      | `0.31.0` replaces continuation tokens with ID-addressed session and turn handles and is explicitly breaking.                   | A direct jump requires migration work, not just a lockfile update.                                                          |
| Incoming messages during a turn | Older channel behavior.                                                                                                           | `0.33.0` defaults channel messages to `turnPolicy: "steer"`.                                                                   | Role-runner semantics must specify whether messages steer, queue, or interrupt work.                                        |
| Approval response               | Older response semantics.                                                                                                         | `0.32.0` changes approval denial from `deny` to `cancel`.                                                                      | Approval adapters and audit vocabulary need version-specific tests.                                                         |
| Workflow durability             | Durable step/checkpoint model.                                                                                                    | `0.33.2` updates Workflow Core with event-log corruption fixes.                                                                | The fix is relevant to long-lived factory runs; validate it before relying on durable recovery.                             |
| GitHub option replies           | Older GitHub channel behavior.                                                                                                    | `0.33.3` keeps comment text separate from channel metadata so option replies can resume pending input requests.                | Include pending-input resumption in channel-adapter compatibility tests.                                                    |
| Self-hosting                    | Supported as a Node/Nitro service using local workflow state or a custom workflow world.                                          | Same general self-hosted model; the custom workflow-world configuration remains experimental.                                  | A self-hosted control plane is possible, but persistence and workflow-world choices need an explicit support-risk decision. |
| Trust boundary                  | App runtime is trusted and may hold provider/tool secrets; the per-agent sandbox is isolated and receives no process environment. | Same documented security model. Connection credentials are brokered and step-scoped rather than made durable in sandbox state. | Keep credentials out of worktrees, sandbox images, transcripts, and checkpoints.                                            |
| Model route                     | Vercel AI Gateway or direct provider credentials.                                                                                 | Same documented provider routes.                                                                                               | An Eve OpenAI model call is a model API call; it is not automatically a Codex coding-agent run.                             |

Both reviewed versions advise one active turn per session even though separate sessions can execute independently. Eve does not provide a durable FIFO queue per session. A factory scheduler still owns mutual exclusion, leasing, retry policy, and idempotency for side effects.

## Codex execution surfaces

OpenAI's current official documentation distinguishes the following surfaces.

| Surface                                                             | Supported use                                                                                                                   | Maturity and boundary                                                                                                                                          | Factory fit                                                                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`codex exec`](https://learn.chatgpt.com/docs/non-interactive-mode) | Noninteractive pipeline steps, scheduled jobs, pre-merge checks, and machine-readable JSONL or schema-constrained output.       | Supported unattended CLI path. It reuses saved CLI authentication unless an API key is injected for that invocation. Read-only is the default sandbox.         | Strong first-pilot worker surface when the scheduler can supervise a process and persist events.                                |
| [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk)               | Programmatic creation, continuation, and resumption of local Codex threads from TypeScript or Python.                           | Documented choice for automation, internal tools, jobs, and CI. The Python package includes a pinned CLI runtime; TypeScript is server-side Node.              | Strong first-pilot embedded worker surface. Pin the SDK separately from Eve.                                                    |
| [`codex mcp-server`](https://learn.chatgpt.com/docs/mcp-server)     | Exposes Codex as an MCP tool so a wider orchestrator, including an Agents SDK application, can invoke and continue coding work. | Supported specialist-agent composition surface. The outer orchestrator still owns policy and durability.                                                       | Useful when Codex is one role among non-Codex tools or agents.                                                                  |
| [Codex App Server](https://learn.chatgpt.com/docs/app-server)       | Rich clients needing authentication, thread history, approvals, and streamed events over JSONL.                                 | The command/API and remote WebSocket transport are experimental and not documented as a production automation substrate. OpenAI points jobs and CI to the SDK. | Prototype only unless a later official support statement changes the status.                                                    |
| Direct OpenAI Responses/API call                                    | Model inference under an API project identity.                                                                                  | Stable provider API surface, with project/model rate limits.                                                                                                   | Not equivalent to the Codex harness. Re-creating Codex behavior from raw model calls is a separate product and security design. |

Local CLI discovery on the research host also exposed `exec`, `mcp-server`, `app-server`, and experimental cloud/remote commands. Those local command flags are useful compatibility evidence, but official documentation—not a developer's unpinned binary—is the product-support authority.

## Identity and commercial model

The [Codex authentication guide](https://learn.chatgpt.com/docs/auth) explicitly separates ChatGPT subscription access from usage-based API access.

| Identity lane                                                                                              | Ownership and billing                                                                                                                                                                   | Appropriate unattended use                                                                                                                                       | Isolation implications                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ChatGPT interactive sign-in                                                                                | A human ChatGPT account and workspace; local and cloud Codex usage draws from the applicable ChatGPT plan.                                                                              | Interactive workstation use. Saved ChatGPT authentication in a trusted runner is documented as an advanced CI option, not the default automation recommendation. | Cache is stored in the OS keychain or `~/.codex/auth.json`, depending on configuration. The latter must be treated as a password. Do not clone it into images or unrelated workers. |
| [Codex access token](https://learn.chatgpt.com/docs/enterprise/access-tokens)                              | A Codex-scoped ChatGPT workspace credential, currently documented for ChatGPT Business and Enterprise. It remains tied to the creating user and workspace; it is not a service account. | Trusted local `codex exec`, scripts, and App Server automation where workspace entitlement and human accountability are intended.                                | Store in a secret manager, set expiration, rotate/revoke, and avoid sharing one user identity across unrelated teams or roles.                                                      |
| API key                                                                                                    | An OpenAI API organization/project; usage is billed at API rates and follows API project policies.                                                                                      | The documented default for programmatic CLI workflows and CI. `CODEX_API_KEY` can scope a key to one `codex exec` invocation.                                    | Use project-scoped keys from a secret manager. Do not place them in code, worktrees, golden images, or a job-level environment that executes untrusted repository code.             |
| [API project service account](https://developers.openai.com/api/docs/guides/terraform/service-accounts)    | A nonhuman identity owned by one API project, with a project-scoped key and least-privilege permissions.                                                                                | Best-documented identity for an API-billed autonomous worker or broker.                                                                                          | Create distinct identities where ownership or blast radius differs; rotate and revoke without affecting personal accounts.                                                          |
| [Workload identity federation](https://developers.openai.com/api/docs/guides/workload-identity-federation) | A trusted workload exchanges OIDC or X.509 identity for a short-lived OpenAI token mapped to a project service account.                                                                 | Promising for avoiding long-lived API keys on supported infrastructure.                                                                                          | Direct compatibility of the short-lived token with the current Codex CLI and both SDKs was not established by the reviewed Codex docs; prototype before selecting it.               |
| App Server client transport bearer                                                                         | Authenticates a client to an App Server transport.                                                                                                                                      | Protects the App Server RPC boundary.                                                                                                                            | It is separate from the OpenAI credential App Server uses to run Codex. Do not treat transport authentication as provider authorization.                                            |

**Inference:** An API service account is the cleanest documented autonomous-fleet identity when API billing is acceptable. A Business/Enterprise Codex access token is appropriate when the organization deliberately wants ChatGPT-workspace entitlement and user accountability. Neither justifies duplicating one person's long-lived credential across elastic VMs.

No private ASYM account, workspace, entitlement, credential, usage balance, or quota was inspected for this report.

## Quota, concurrency, metering, and throttling

### ChatGPT-plan Codex

The [Codex pricing guide](https://learn.chatgpt.com/docs/pricing) says local and cloud Codex work share a rolling five-hour usage window under ChatGPT plans, with additional weekly limits potentially applying. Consumption depends on model, context, reasoning, tools, and caching rather than a fixed cost per prompt. Current personal/workspace usage is visible through the Codex dashboard or `/status`; this research deliberately did not inspect it.

When an entitlement limit is reached, OpenAI may allow the current turn to finish subject to fair-use controls. Eligible users can purchase credits, and a user can switch local work to API-key billing at standard API rates.

The reviewed official authentication, pricing, noninteractive, and SDK pages do **not** state a fixed maximum number of concurrent local Codex processes. This is a bounded negative finding, not evidence of unlimited concurrency. Subscription terms, workspace policy, fair-use enforcement, and transient capacity can all constrain an apparently parallel fleet.

### API-billed Codex

The [API rate-limit guide](https://developers.openai.com/api/docs/guides/rate-limits) documents limits at organization and project level, with model-specific or shared model-family buckets. Relevant measurements can include requests and tokens per minute/day and approved monthly usage. Response headers expose remaining capacity and reset timing; throttled clients should honor `Retry-After` and use bounded exponential backoff with jitter. Billing/quota errors must not be retried as though they were transient overload.

[Project limits](https://developers.openai.com/api/docs/guides/terraform/rate-limits-and-spend) can cap project RPM/TPM. Spend alerts are notifications, not hard budget enforcement, so the factory's own budget authority must fail closed before dispatch.

### Scheduler requirements

The following are planning inferences from the documented limits, not OpenAI product guarantees:

- Admission control should be keyed by commercial identity, API project, model/rate-limit bucket, and worker capacity—not merely by VM count.
- A dispatcher should reserve a lease before starting a turn and release it on a terminal event, timeout, or reconciled worker loss.
- It should ingest response headers, `Retry-After`, quota/billing failures, and ChatGPT entitlement failures as structured capacity signals.
- Backoff must be bounded and jittered; repeated quota or billing failure should open a circuit rather than create a retry storm.
- A conservative per-identity concurrency cap should be configuration, not a hard-coded claim about OpenAI's undocumented ceiling.
- Token and cost budgets need pre-dispatch estimates and post-run reconciliation. Provider spend alerts alone cannot enforce a hard stop.

## Credential isolation requirements

These requirements combine the [Codex noninteractive guidance](https://learn.chatgpt.com/docs/non-interactive-mode), [OpenAI production guidance](https://developers.openai.com/api/docs/guides/production-best-practices), and Eve's documented trusted-runtime/sandbox boundary:

1. Golden images, worktrees, sandboxes, session state, logs, and artifacts remain credential-free.
2. Interactive persistent workstations use the OS credential store where available. A file-backed `auth.json` is a secret and is never copied into another worker or committed.
3. Automation obtains a narrowly scoped credential at dispatch time from a secret manager or identity broker and removes it when the process exits.
4. An API identity is scoped to one project and purpose. Separate staging and production projects and identities so rate, spend, and revocation boundaries do not overlap.
5. A credential is injected only into the trusted Eve/worker process that needs it. The per-agent sandbox receives neither provider keys nor the trusted process environment.
6. `CODEX_API_KEY` is preferable to a broad job environment for one `codex exec` run, especially when repository code may execute.
7. An App Server transport bearer and its upstream OpenAI credential are stored, rotated, authorized, and audited as different secrets.
8. Secret values, private identifiers, live quotas, and provider responses containing them are redacted before durable events or telemetry are written.

## Planning consequences, not implementation decisions

1. Replace the source brief's `eve@0.29.3` assumption with an explicit choice: remain on Core's verified `0.25.1` temporarily or perform a tested migration to current upstream. Do not silently target an intermediate stale version.
2. Pin Eve and the chosen Codex surface independently. A factory release record should identify both versions and their compatibility test results.
3. Design an explicit Eve-to-Codex worker adapter if Eve owns durable orchestration. The adapter must translate sessions, turns, approvals, cancellation, streams, sandbox policy, and terminal outcomes; a model string is insufficient.
4. Start a production-minded pilot with `codex exec` or the Codex SDK. Keep the App Server behind a prototype flag until OpenAI documents the required interface as supported for that use.
5. Choose the pilot's identity lane before provisioning workers: API project service account/API billing, or deliberately accountable Business/Enterprise workspace access. Do not base the fleet on a copied personal `auth.json`.
6. Put a deterministic quota broker in front of all worker starts. Its conservative limits remain configurable and can be raised only from observed data or a documented commercial commitment.
7. Preserve Core's existing release, policy, budget, and rate-limit gates. Eve durability and Codex execution do not replace the governance authority.

## Source-plan assertions reopened by evidence

| Earlier planning assertion                                                    | Current evidence                                                                                                                                                                       | Required correction                                                                                             |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Eve baseline is `0.29.3`.                                                     | Core pins `0.25.1`; npm current is `0.33.3`, with breaking changes after both.                                                                                                         | Record both the executable repo pin and current upstream; make migration a named work item.                     |
| Persistent VMs can simply reuse personal subscription authentication.         | Saved ChatGPT auth is account/workspace-bound; API keys are the default automation recommendation; Codex access tokens and API service accounts now provide distinct identity choices. | Select an accountable identity model and isolate each worker's credential. No cloned personal credential fleet. |
| App Server can be the production automation substrate.                        | Official App Server guidance calls the interface/remote transport experimental and sends jobs/CI to the SDK.                                                                           | Use `exec` or SDK for the first production-minded path; treat App Server as a prototype.                        |
| A stable numeric concurrency allowance can be planned from subscription tier. | Public docs describe usage windows and API rate buckets but no fixed concurrent local-run ceiling.                                                                                     | Treat concurrency as configurable admission policy backed by observation or contract, not a public constant.    |
| Eve can directly execute Codex roles because both are agent runtimes.         | Eve documents generic models, workflows, tools, and sandboxes; Codex documents its own CLI/SDK/MCP/App Server harness. No native adapter was found.                                    | Specify and test the bridge, or choose one layer as the control plane.                                          |

## Unresolved facts and required prototypes

- **Private commercial state:** Which ChatGPT plan/workspace, API projects, models, and Codex access-token features ASYM actually has. Owner: an authorized account administrator; report only a capability decision, never credential or quota values.
- **Contractual fleet posture:** Whether OpenAI approves the intended count and duty cycle of concurrent subscription-backed workers under the applicable contract and fair-use policy. Owner: procurement/account team with OpenAI.
- **Observed capacity:** Real RPM/TPM/latency/throttle behavior for the selected model and identity. Owner: a rate-limited, non-production load prototype with no private quota details committed.
- **Federated Codex authentication:** Whether a workload-identity-federated short-lived API token is accepted end-to-end by the chosen Codex CLI/SDK version. Owner: credential-broker spike on a disposable project.
- **Eve migration:** Exact code and durable-session migration work from `0.25.1` to `0.33.3` or later. Owner: isolated branch with upstream changelog-driven compatibility tests.
- **Eve/Codex bridge semantics:** Cancellation, steering, approval, sandbox, resume, and idempotency mapping. Owner: adapter contract test before any long-running pilot.
- **Control-plane ownership:** Whether Eve owns durable orchestration with Codex as a worker, or the factory control plane owns durability and invokes Codex directly. Owner: architecture decision after the bridge prototype.
- **Platform validation:** Windows worker/service-account and sandbox behavior remains a separate execution-environment test; no platform-specific conclusion is implied here.

## Primary sources

### Repository and installed-version evidence

- [`packages/eve-runtime/package.json`](../../../packages/eve-runtime/package.json)
- [`packages/eve-runtime/agent/agent.ts`](../../../packages/eve-runtime/agent/agent.ts)
- [`packages/eve-runtime/src/governance-boundary.ts`](../../../packages/eve-runtime/src/governance-boundary.ts)
- [`packages/eve-runtime/AGENTS.md`](../../../packages/eve-runtime/AGENTS.md)
- [`openspec/specs/eve-runtime-foundation/spec.md`](../../../openspec/specs/eve-runtime-foundation/spec.md)

### Eve upstream

- [Exact `eve@0.33.3` published artifact](https://registry.npmjs.org/eve/-/eve-0.33.3.tgz)
- [Eve `0.33.3` release](https://github.com/vercel/eve/releases/tag/eve%400.33.3)
- [Official Eve changelog](https://github.com/vercel/eve/blob/main/packages/eve/CHANGELOG.md)

### OpenAI Codex and API

- [Codex authentication](https://learn.chatgpt.com/docs/auth)
- [Codex access tokens](https://learn.chatgpt.com/docs/enterprise/access-tokens)
- [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk)
- [Codex noninteractive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
- [Codex App Server](https://learn.chatgpt.com/docs/app-server)
- [Codex MCP server](https://learn.chatgpt.com/docs/mcp-server)
- [Codex pricing and usage](https://learn.chatgpt.com/docs/pricing)
- [OpenAI API rate limits](https://developers.openai.com/api/docs/guides/rate-limits)
- [OpenAI API production practices](https://developers.openai.com/api/docs/guides/production-best-practices)
- [OpenAI project service accounts](https://developers.openai.com/api/docs/guides/terraform/service-accounts)
- [OpenAI workload identity federation](https://developers.openai.com/api/docs/guides/workload-identity-federation)
- [OpenAI project rate and spend controls](https://developers.openai.com/api/docs/guides/terraform/rate-limits-and-spend)
