# Installed Eve 0.25.1 review

This review was completed from the installed package at
`packages/eve-runtime/node_modules/eve/docs/` before the runtime source was
authored. It records the version-specific facts used by issue #425; future Eve
changes must reread the relevant installed guide rather than treating this
summary as a replacement for it.

## Sources read

- `README.md`, `introduction.mdx`, and `getting-started.mdx`
- `agent-config.md`
- `reference/project-layout.md`, `reference/typescript-api.md`, and
  `reference/cli.md`
- `concepts/context-control.md`, `concepts/default-harness.md`,
  `concepts/execution-model-and-durability.md`, `concepts/security-model.md`,
  and `concepts/sessions-runs-and-streaming.md`
- `guides/auth-and-route-protection.md`, `guides/session-context.md`,
  `guides/state.md`, `guides/hooks.md`, `guides/dynamic-capabilities.md`,
  `guides/dynamic-workflows.md`, `schedules.mdx`,
  `patterns/dynamic-scheduling.md`, `patterns/multi-tenant-auth.md`, and
  `channels/eve.mdx`
- `evals/overview.mdx`, `evals/cases.mdx`, `evals/running.mdx`,
  `evals/targets.mdx`, and `evals/assertions.mdx`

## API and runtime facts used

- Eve 0.25.1 requires Node.js 24 or newer. A manual agent install declares
  `eve`, AI SDK `ai`, and `zod` and uses a root `agent/` directory.
- Eve and AI SDK accept the repository's existing Zod 4.3.6 line. The runtime
  stays on that shared patch to avoid incompatible duplicate Zod type graphs
  across workspace packages.
- `agent/agent.ts` exports `defineAgent(...)`; identity is path-derived and the
  root agent name comes from `package.json`.
- `agent/instructions.md` is always-on identity. Authored capabilities are
  discovered from filesystem slots. Evals are siblings under `evals/`, with
  exactly one `evals/evals.config.ts`.
- `eve info` is the first discovery/diagnostic command. `eve build` compiles
  the authored surface and host output. Stable inspection artifacts are stored
  under `.eve/`.
- Eve sessions and turns are durable workflows. Local development uses the
  Workflow SDK local world and stores its data below `.eve/.workflow-data`;
  Vercel uses Vercel Workflow. That state is runtime durability, not the
  application governance store.
- Eve route auth protects session create, continue, cancel, and stream routes,
  carries the verified caller into `ctx.session.auth`, and fails closed when
  the auth walk has no match. Route auth does not supply a per-session ACL;
  applications serving multiple users or tenants must add that ownership
  check themselves.
- `eveChannel({ events })` can observe `turn.started`, whose runtime context
  includes the durable session id and current verified caller. The current
  admin binding is recorded there, while continuation, cancel, and stream
  requests check the app-owned binding during route auth.
- The default harness can expose shell, file, network, todo, question, and
  delegation tools. A same-slug `disableTool()` authored file removes a
  framework tool and fails discovery on an unknown slug.
- `mockModel` from `eve/evals` is a deterministic `LanguageModel` fixture. An
  eval uses `defineEval`, drives the live Eve HTTP surface through `t.send`, and
  can gate success, tool absence, and reply content without provider access.
- Non-catalog models such as deterministic fixtures must declare
  `modelContextWindowTokens` so Eve can compile compaction metadata without an
  AI Gateway catalog lookup.
- A live Gateway model can be supplied as a model ID, but dynamic model
  selection still requires a compiled fallback. Because #425 may not hardcode
  or activate a production model, this foundation uses only a clearly named
  deterministic fixture. The app-owned #421 resolver remains the required
  source of any future live model plan.
- `experimental_workflow({ maxSubagents })` exposes a root-only tool named
  `Workflow`. Its JavaScript runs in QuickJS with only declared subagent and
  remote-agent bridges; it has no filesystem, shell, network, environment, or
  import access. Children receive neither Workflow nor the built-in agent.
- Every Workflow child emits the normal `subagent.called` and
  `subagent.completed` events. Authored hooks run after accepted events are
  durably recorded, allowing the app boundary to stop downstream dispatch.
- `defineState` is durable per-session state available to tools and hooks; it
  never crosses into a child. Core uses it for the versioned plan ticket and
  step state, not for long-term memory or shared application data.
- Root-authored schedules live under `agent/schedules/`, use path-derived
  identity, and accept a five-field UTC cron plus exactly one of `markdown` or
  `run`. Development never fires cron automatically; the dev-only dispatch
  route executes the production schedule path on demand.
- The installed dynamic-scheduling pattern recommends one static dispatcher
  over application-owned rows with atomic leases. Delivery is at least once,
  so Core supplies stable finding and downstream idempotency keys.

## Security and ownership consequences

- App runtime code is trusted and can read secrets; the sandbox cannot read
  `process.env`. The model sees tool schemas and results, not credentials.
- Route auth fails closed unless anonymous access is explicitly authored. This
  package now authors an admin route authenticator that maps only verified
  Supabase admin sessions. Loopback-only `localDev()` remains last solely for
  the deterministic local eval; it never creates an app-owned session binding.
- Every default capability with filesystem, shell, network, question, todo, or
  delegation authority remains explicitly governed. Authored schedules and
  subagents are root-owned, off by default at the app boundary, and cannot
  derive authority from prompts or external payloads.
- The local smoke eval uses the deterministic fixture, performs no provider or
  network call, and spends zero provider budget. The typed governance boundary
  refuses live activation unless persisted governance enables release, #421
  allows a Gateway-primary policy result, and #423 allows the approval/budget
  decision.

## Commands proved by this slice

From `packages/eve-runtime`:

```bash
bun run info
bun run build
bun run eval
bun run typecheck
```

The first three invoke the installed Eve CLI. None enables or deploys Eve.
