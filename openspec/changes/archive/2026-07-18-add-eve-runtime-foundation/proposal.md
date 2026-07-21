# Proposal: Eve standalone runtime foundation

## Why

Issue #425 is the first implementation slice that can prove the repository
hosts the installed Eve framework without coupling Eve's Node/dependency
surface to the admin, donor, or missionary applications. It must also prove
framework discovery, compilation, and a real HTTP-session eval without
hardcoding or enabling a production model.

The preceding governance (#418), model-policy (#421), and approval/budget
(#423) slices remain authoritative. This foundation consumes their typed
decisions but does not duplicate their state, widen Eve's authority, or turn on
the release switch.

## What changes

- Add `packages/eve-runtime`, an isolated Node.js 24+ workspace package using
  installed Eve 0.25.1.
- Record the installed framework guides read before coding and the exact API,
  durability, security, harness, and eval facts used.
- Add a disabled-by-default verification agent with a deterministic fixture
  model, no live provider, and every authority-bearing default tool disabled.
- Add `eve info`, `eve build`, typecheck, lint, and a strict zero-provider-cost
  smoke eval.
- Add a typed fail-closed activation boundary that accepts only persisted
  governance, #421 model-policy resolution, and #423 approval/budget results.
- Add unit coverage for app isolation, disabled capabilities, and activation
  refusal/allow behavior.
- Promote EVE-DESIGN-0007 to canonical ADR-0026.

## What does not change

- No Next.js app imports the runtime and the runtime imports no app. #428 owns
  the first admin mount and compatibility proof.
- No live model/provider client, custom channel, connection, schedule,
  subagent, custom tool, sandbox, deployment, or autonomous action is added.
- #426 still owns admin route auth and session ownership; #429 owns the
  engineering sandbox worker.
- Eve/Workflow owns session durability. Supabase remains authoritative for
  governance, audit, approval, memory, model policy, budgets, release,
  kill-switch, and retention data.

## Verification

- `bun run --cwd packages/eve-runtime info`
- `bun run --cwd packages/eve-runtime build`
- `bun run --cwd packages/eve-runtime eval`
- `bun run --cwd packages/eve-runtime typecheck`
- `bunx vitest run tests/unit/eve-runtime-foundation.test.ts`
- `bunx @fission-ai/openspec@latest validate add-eve-runtime-foundation --strict`
- Repository CI gates
