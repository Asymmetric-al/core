# ADR-0031: Establish Eve as an isolated, disabled-by-default runtime package

**Status:** Accepted

**Date:** 2026-07-17

**Issue:** #425

**Builds on:** ADR-0018, ADR-0019, ADR-0022, ADR-0024

## Context

The repository needs to prove the installed Eve framework can be hosted,
inspected, built, and evaluated before any Next.js mount or live autonomy is
introduced. Eve 0.25.1 has a Node.js 24+ and framework-specific dependency
surface, owns durable sessions through the Workflow SDK, and provides default
tools that would be too broad for an unactivated foundation.

The app already owns persisted governance, model-policy resolution, approvals,
and budgets. The runtime must consume those decisions without becoming a
second governance source or hardcoding a model/provider before release.

## Decision

Eve begins in `packages/eve-runtime` as a dedicated workspace package. It has
its own agent/eval layout, Node engine contract, framework dependencies, local
commands, and generated output ignores. It imports no Next.js app, and none of
the admin, donor, or missionary apps may import it until #428 proves and owns
the admin integration.

Installed Eve documentation is the framework API authority. The relevant
0.25.1 guides were read before runtime code and are summarized in the package.
Future changes must reread installed docs relevant to their surface.

The foundation is disabled by default. Its authored agent uses Eve's
deterministic fixture model only for local verification. It has no live model,
provider, channel, connection, schedule, subagent, custom tool, or sandbox.
Every framework default that can grant filesystem, shell, network, question,
todo, or delegation capability is explicitly disabled. Local `eve info`,
`eve build`, and a strict smoke eval therefore exercise the real framework and
HTTP session surface without credentials, provider spend, or production work.

The package exposes a narrow typed activation boundary for later hosts. It
accepts only app-owned persisted governance, a #421 model-policy resolution,
and a #423 approval/budget decision. It fails closed when release is disabled,
governance is blocked, policy resolution is denied/invalid, or approval/budget
does not allow work. A successful plan is Gateway-primary and carries the
resolved role, reasoning, and hard limits; direct-provider fallback actuation
is excluded from this slice.

Eve and its Workflow host own conversation/session durability. Supabase remains
authoritative for governance, audit, approval, budget, memory, model policy,
release, kill-switch, and retention data. Runtime state cannot override those
records.

## Failure behavior

Missing, stale, disabled, blocked, or malformed governance input refuses
activation. Running local verification never enables release. If the package
is accidentally started, it has only the deterministic fixture and no effect
capabilities. No prompt, model output, memory, or provider plugin can assert
that a persisted gate is clear.

## Boundary with adjacent slices

- ADR-0018 owns the autonomy and protected-area contract.
- ADR-0019 owns release and emergency precedence.
- ADR-0022 owns model-policy lifecycle and resolution.
- ADR-0024 owns approval and budget policy.
- #426 owns verified admin identity and session ownership.
- #428 owns the Next.js admin mount.
- #429 owns an engineering sandbox worker and its network policy.
- ADR-0031 owns only the isolated, off-by-default Eve runtime foundation and
  its local framework proof.

## Consequences

- Eve's Node and dependency requirements are measurable without changing the
  three applications.
- Framework API use is reviewable against the exact installed version.
- The local eval proves runtime wiring while spending no model budget.
- Live model/provider integration, auth, mounting, sandboxing, and autonomy
  remain separate reviewable changes.

## Verification

- `bun run --cwd packages/eve-runtime info`
- `bun run --cwd packages/eve-runtime build`
- `bun run --cwd packages/eve-runtime eval`
- `bun run --cwd packages/eve-runtime typecheck`
- Unit coverage for app isolation, disabled defaults, and every activation
  refusal/allow branch.
- Strict OpenSpec validation and the repository CI gates.
