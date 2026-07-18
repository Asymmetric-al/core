<!-- Partner DRAFT for GitHub issue #429. Task list for the `add-eve-sandbox-engineering-worker` OpenSpec
change; enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off. Acceptance and
scope grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md] and
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the sandbox-engineering-worker OpenSpec contract

- [ ] 1.1 Add the `eve-sandbox-engineering-worker` capability via this change's spec delta
      (`specs/eve-sandbox-engineering-worker/spec.md`), building on #420 (kill-switch), #423 (approval/budget),
      and #425 (runtime foundation) without restating them
- [ ] 1.2 State the seven requirements as spec: writable repo checkout; allow-all networking only with strong
      containment; no mounted secrets/env/service-role/production dumps; egress and command audit; sensitive-file
      scanning and protected-file detection that can pause runs; sandbox-networking kill switch and emergency
      stop; subordination and no new authority
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-sandbox-engineering-worker --strict`

## 2. Record the provisional Eve design decision EVE-DESIGN-0011 (sandbox engineering worker)

- [ ] 2.1 Author the decision under provisional Eve design label EVE-DESIGN-0011 in this change's `design.md`, traceable from ADR-0021 (#420), EVE-DESIGN-0005 (#423), and
      EVE-DESIGN-0007 (#425)
- [ ] 2.2 At implementation time, promote the accepted decision into `docs/adr/` using the next available canonical number, then update all references.
- [ ] 2.3 Cross-link the resulting canonical ADR from the parent PRD and issue #429

## 3. Writable checkout and containment

- [ ] 3.1 Specify the sandbox as a writable repo checkout (inspect/edit/test/commit/push) that is the contained
      environment the #425 runtime runs in, not the runtime package itself
- [ ] 3.2 Specify that allow-all networking is permitted only with the full compensating-control set active, and
      that the sandbox is provisioned with no mounted secrets, no env files, no service-role keys, and no
      production data dumps

## 4. Audit, scanning, and kill switch

- [ ] 4.1 Specify that egress and commands are audited where available, emitted in #419's audit-record shape
- [ ] 4.2 Specify that a sensitive-file scanner and protected-file detection (against #417's protected-area set)
      can pause risky runs before they proceed
- [ ] 4.3 Specify that the sandbox honors #420's `disable sandbox networking` switch and an emergency stop, and
      reads that persisted switch state rather than any prompt/model/tool claim

## 5. Boundary and subordination

- [ ] 5.1 Draw the boundary: #420 owns kill-switch state; #419 owns the audit shape; #423 owns approval/budget;
      #421 owns model policy; #425 owns the runtime; #430/#431 own GitHub/PR actions; #429 owns the contained
      sandbox those compose in
- [ ] 5.2 State that the sandbox resolves models through #421 via the #425 runtime (never hardcoded), spends
      under #423 budgets, stays disabled by default while the release switch is off, and never bypasses #417
      protected-area/approval limits or #418 emergency-off precedence

## 6. Acceptance checks (AFK)

- [ ] 6.1 Maintainer review of the containment model (no mounted secrets/env/service-role/prod dumps), the
      egress/command audit, the pause-on-sensitive/protected-file behavior, and the networking kill switch
- [ ] 6.2 Confirm the sandbox resolves models only through #421 via #425 so any partner GPU gateway stays a
      proposed, non-default, revocable fallback, and that no donor PII/payments/secrets can enter the sandbox
      (charter data-boundary law)
- [ ] 6.3 Confirm no sandbox provisioning code, egress proxy, scanner, kill-switch enforcement, or Supabase
      schema is included in this change
- [ ] 6.4 Confirm the change is subordinate to #420/#423/#425, OpenSpec, `AGENTS.md`, `docs/ai/*`, and existing
      CI gates, and that the release switch stays off
- [ ] 6.5 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
