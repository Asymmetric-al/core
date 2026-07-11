<!-- Partner DRAFT for GitHub issue #425. Task list for the `add-eve-runtime-foundation` OpenSpec change;
enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off. Acceptance and scope
grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md] and
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the runtime-foundation OpenSpec contract

- [ ] 1.1 Add the `eve-runtime-foundation` capability via this change's spec delta
      (`specs/eve-runtime-foundation/spec.md`), building on #417 (foundation), #421 (model policy), and #423
      (approval/budget) without restating them
- [ ] 1.2 State the six requirements as spec: isolated dedicated workspace package; docs-read-before-coding;
      local verification (`eve info`/`eve build`/minimal eval) with release switch off; self-owned
      session/workflow durability; model resolution via #421 and spend under #423; layered source-of-truth and
      no new authority
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-runtime-foundation --strict`

## 2. Record ADR-0007 (runtime foundation)

- [ ] 2.1 Author ADR-0007 in this change's `design.md`, traceable from ADR-0001 (#417), ADR-0005 (#423), and
      ADR-0006 (#421)
- [ ] 2.2 Land the ADR at the repo's chosen ADR location (confirm convention with maintainers, same as ADR-0001)
- [ ] 2.3 Cross-link ADR-0007 from the parent PRD and issue #425

## 3. Package isolation and docs-first

- [ ] 3.1 Specify the runtime as a dedicated workspace package with an isolated Node/dependency footprint,
      importing no app runtime code and imported by no app until the #428 admin mount is proven
- [ ] 3.2 Specify that the installed Eve (Vercel) framework docs are read and summarized after the package is
      added, before runtime coding, and that runtime coding never depends on memory of upstream APIs

## 4. Local verification, durability, and model/budget wiring

- [ ] 4.1 Specify `eve info` (health + read-docs report), `eve build`, and a minimal eval that pass locally
      while the release switch is off and the package is disabled by default
- [ ] 4.2 Specify that Eve sessions and workflow durability are runtime/host-owned while governance state stays
      Supabase-owned app data (boundary vs #418)
- [ ] 4.3 Specify that the runtime resolves every model through the #421 shared policy (never hardcoded) and
      spends under #423 hard budgets/rate limits

## 5. Boundary and subordination

- [ ] 5.1 Draw the boundary: #417 owns the autonomy contract; #421 owns model policy; #423 owns approval/budget;
      #418 owns governance state; #426 owns session-ownership auth; #428 owns the admin mount; #429 owns the
      sandbox; #425 owns the isolated runtime package those compose with
- [ ] 5.2 State that the runtime follows the layered source-of-truth order, keeps AGENTS/OpenSpec above memory
      and provider plugins, reads only persisted app-owned governance state, and never bypasses #417
      protected-area/approval limits or #418 emergency-off precedence

## 6. Acceptance checks (AFK)

- [ ] 6.1 Maintainer review of the isolation model, the docs-first rule, the local-verification contract, and
      the no-new-authority boundary
- [ ] 6.2 Confirm the runtime resolves models only through #421 policy so any partner GPU gateway stays a
      proposed, non-default, revocable fallback (charter data-boundary / model-policy posture)
- [ ] 6.3 Confirm no Eve runtime code, `eve` CLI implementation, eval harness, Next.js admin mount, sandbox, or
      Supabase schema is included in this change
- [ ] 6.4 Confirm the change is subordinate to #417/#421/#423, OpenSpec, `AGENTS.md`, `docs/ai/*`, and existing
      CI gates, and that the release switch stays off
- [ ] 6.5 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
