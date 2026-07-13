# Design & ADR-0011: Eve Sandbox Engineering Worker

> This `design.md` doubles as **ADR-0011**, the sandbox-engineering-worker decision required by issue #429. It
> builds on **ADR-0004** (#420, `add-eve-kill-switch-control-path`), **ADR-0005** (#423,
> `add-eve-approval-budget-policy`), and **ADR-0007** (#425, `add-eve-runtime-foundation`), and does not
> restate them — it operationalizes the contained sandbox in which the isolated #425 runtime does writable
> engineering work, honoring #420's sandbox-networking kill switch and spending under #423's budgets, while the
> release switch stays off per #418. When accepted into `Asymmetric-al/core`, its ADR body should also be
> landed at the repo's ADR location (same convention chosen for ADR-0001). Every grounded claim carries a
> `[VERIFIED-REPO: path:line]` citation read from `Asymmetric-al/core` at commit `d14a2434` on 2026-07-04.
> [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:210]

## Status

Proposed (partner draft for #429). Supersedes nothing. Builds on ADR-0004 (#420), ADR-0005 (#423), and
ADR-0007 (#425). Subordinate to OpenSpec and `AGENTS.md`. [VERIFIED-REPO: AGENTS.md]
[VERIFIED-REPO: openspec/project.md]

## Context

The implementation plan scopes slice 13 (#429, "Sandbox Engineering Worker") as an **AFK** slice **blocked by
slices 4, 7, and 9** — the kill-switch control path (#420), the approval/budget policy (#423), and the
standalone runtime foundation (#425) — and covering user stories 55, 56, and 57.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:213]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:214] What it must prove is that
"Eve can use a writable repo checkout in sandbox with allow-all network and compensating controls," with
acceptance that the sandbox "has no mounted secrets, no env files, no service-role keys, and no production data
dumps," that "egress and commands are audited where available," that a "sensitive-file scanner and
protected-file detection can pause risky runs," and that the "sandbox networking kill switch works."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:215]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:218]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:222]

The platform constraints already fix the sandbox's shape. A platform owner wants "Eve's sandbox to have a
writable repo checkout, so that it can inspect, edit, test, commit, and push engineering work" (US-55), wants
"sandbox network access to be allow-all with strong containment" to compensate for exfiltration risk (US-56),
and wants "no secrets, no environment files, no service-role keys, no production dumps, egress and command
audit, sensitive-file scanning, protected-file detection, and emergency kill switches around the sandbox"
(US-57). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:259]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:262]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:266] The design
constraint states the sandbox "may use a writable repo checkout and allow-all network access, but only with
strong containment": no mounted secrets, no env files, no service-role keys, no production dumps, egress and
command audit, sensitive-file scanning, protected-file detection, and an emergency kill switch.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:509] The test
constraint requires sandbox tests to "verify writable checkout behavior, safe branch handling, sensitive-file
scanning, protected-file detection, no secret mounting, egress and command audit, and network kill-switch
behavior." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:570]

The kill-switch suite (#420) already enumerates "disable sandbox networking" as one of its per-domain switches,
and the switch is only meaningful if something enforces it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:184]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:97] This ADR fixes the sandbox as
that enforcement point: it consumes #420's persisted switch state, it does not define or store it.

**Partner-boundary note.** Allow-all egress from a writable checkout is the single highest-risk surface in the
program for the fleet's data boundary — donor PII, payments, secrets, one-time codes, and tenant facts must
never leave through it. This ADR therefore treats containment as **structural**: the sandbox is provisioned with
no mounted secrets/env/service-role/production data at all, so there is nothing sensitive present to exfiltrate,
and egress/commands are audited and killable. It is also where model calls originate, so the sandbox resolves
models **only through #421's policy via the #425 runtime** — never hardcoding a provider — keeping any partner
GPU gateway a proposed, non-default, revocable fallback. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]

## Decision

1. **Writable repo checkout, isolated from real infra.** The sandbox provides a writable repo checkout in which
   Eve can inspect, edit, test, commit, and push engineering work. The checkout is a disposable working copy;
   the sandbox is the contained environment the #425 runtime executes in, not the runtime package itself.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:259]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:509]
2. **Allow-all networking only with strong containment.** Network access may be allow-all, but only paired with
   the full compensating-control set; allow-all networking is never permitted without those controls active.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:262]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:509]
3. **No mounted secrets, env files, service-role keys, or production dumps.** The sandbox is provisioned with
   none of these present — the exfiltration risk of allow-all networking is compensated structurally by there
   being nothing sensitive to exfiltrate, not by trusting the agent. This is the fleet data-boundary law made a
   spec requirement. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:266]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:510]
4. **Egress and command audit via #419.** Egress and commands are audited where available, and the audit
   records use #419's record shape — the sandbox emits, it does not redefine, the audit contract.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:267]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:511]
5. **Sensitive-file scanning and protected-file detection can pause risky runs.** A sensitive-file scanner and
   protected-file detection (against #417's protected-area set) can pause a run before risky work proceeds,
   rather than only reporting after the fact. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:268]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:221]
6. **Networking kill switch and emergency stop.** The sandbox honors #420's `disable sandbox networking` switch
   and an emergency kill switch that can cut the sandbox instantly; the sandbox reads that persisted state and
   never a prompt/model/tool claim that networking is on. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:512]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:184]
7. **Subordinate; grants no new authority.** The sandbox resolves every model through #421 via the #425 runtime
   (never hardcoded), spends under #423 hard budgets/rate limits, stays disabled by default while the release
   switch is off, and never bypasses #417 protected-area/production-write/approval limits or #418 emergency-off
   precedence. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Boundary with adjacent slices

- **#417 (ADR-0001, foundation):** owns the autonomy contract and protected-area set at spec level. #429's
  protected-file detection reads that set; it does not define it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:52]
- **#419 (ADR-0003, audit):** owns the audit-record shape. #429 emits egress/command audit records in that
  shape; it does not redefine it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:99]
- **#420 (ADR-0004, kill-switch):** owns the kill-switch state and control path, including the "disable sandbox
  networking" switch. #429 honors that switch; it does not persist switch state.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:97]
- **#421 (ADR-0006, model policy):** owns named roles and Gateway-primary routing. #429 resolves models through
  that policy via the #425 runtime; it does not define routing. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:102]
- **#423 (ADR-0005, approval/budget):** owns trust-zone approval and hard budgets. Sandbox work spends under
  those budgets; it does not define them. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- **#425 (ADR-0007, runtime foundation):** owns the isolated runtime package. #429 is the contained environment
  that runtime runs in, not the runtime. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]
- **#430 (slice 14, GitHub read/review) and #431 (slice 15, PR operator):** own the GitHub identity and PR
  actions. #429 provides the contained checkout they act from; it does not perform GitHub actions.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:224]

## Verification contract

- OpenSpec validates: `bunx @fission-ai/openspec@latest validate add-eve-sandbox-engineering-worker --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The slice-specific acceptance tests — writable checkout behavior, safe branch handling, sensitive-file
  scanning, protected-file detection, no secret mounting, egress and command audit, and network kill-switch
  behavior — land with the implementing PR, not this spec/ADR. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:570]

## Consequences

- Positive: allow-all networking becomes survivable because containment is structural — nothing sensitive is
  present to leak, egress and commands are audited, risky runs pause on protected/sensitive files, and a
  networking kill switch can cut the sandbox instantly. The sandbox cannot hardcode a model provider, cannot
  spend past #423 budgets, and cannot run while the release switch is off.
- Cost: a contained sandbox environment to provision and maintain (scanner, egress audit, disposable checkout),
  and the discipline of never mounting real secrets/env/service-role/production data.
- Risk if skipped: a writable checkout with allow-all egress and no compensating controls — a direct
  exfiltration path for exactly the donor PII, payments, and secrets the fleet charter forbids from this infra.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:510]

## Alternatives considered

- **Lock networking down to an allowlist instead of allow-all.** Rejected: the constraint chooses allow-all for
  flexibility, compensated by strong containment, not a restrictive egress allowlist.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:262]
- **Mount real secrets/env/service-role keys so the sandbox can hit live services.** Rejected: the constraint
  forbids mounted secrets, env files, service-role keys, and production dumps in the sandbox.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:510]
- **Audit egress/commands after the fact only.** Rejected: sensitive-file scanning and protected-file detection
  must be able to **pause** risky runs, not merely report them. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:221]
- **Give the sandbox its own kill-switch state.** Rejected: kill-switch state is #420's; the sandbox honors the
  `disable sandbox networking` switch and reads that persisted state. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:97]
- **Enable the sandbox by default.** Rejected: the release switch must remain off until governance, auth, audit,
  evals, protected-area policy, kill switches, and rollback paths are verified.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Out of scope (this change)

Sandbox provisioning code (container/VM/checkout), the egress proxy and command-audit implementation, the
sensitive-file scanner and protected-file detector implementations, the network kill-switch enforcement code,
the kill-switch state store (#420), the audit-record store (#419), the approval/budget policy (#423), the
isolated runtime package (#425), the model-policy capability (#421), the GitHub read/review path (#430), the
autonomous PR operator (#431), any Supabase schema or Mission Control UI, and any live autonomy — all deferred
to later, separately-gated slices. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:215]
