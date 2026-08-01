# ADR-0030: Contain Eve engineering work in a governed sandbox

**Status:** Accepted

**Date:** 2026-07-17

**Issue:** #429

**Builds on:** ADR-0018, ADR-0019, ADR-0020, ADR-0021, ADR-0022,
ADR-0024, and ADR-0026

## Context

Eve needs a writable engineering checkout and general network access to inspect,
edit, test, commit, and eventually push repository work. A model-driven shell
with open egress is also the program's highest-risk exfiltration surface. The
runtime therefore needs structural containment and app-owned authorization,
not instructions that merely ask an agent to avoid sensitive material.

## Decision

The isolated Eve 0.25.1 runtime owns one disposable sandbox per durable
session. It uses Eve's availability-aware backend: hosted Vercel Sandbox on
Vercel, then a local container or VM, with the dependency-free interpreter as
the last fallback. The workspace is writable and isolated from the application
runtime. No authored workspace files, environment values, provider secrets,
service-role keys, or production dumps are mounted into it.

Every backend starts with `deny-all` network policy. The trusted app runtime
may change it to `allow-all` only after reading persisted governance state and
confirming the master release switch, policy readiness, emergency state, active
run switch, all-automation switch, and sandbox-networking switch. Missing or
unreadable governance denies networking. The check repeats before each shell
command so a changed kill switch takes effect without trusting model or tool
input.

The built-in read, search, shell, and file capabilities target the sandbox.
Shell and writes are wrapped by Core policy. Environment files, credential
material, service-role keys, workspace escapes, and production dumps are
denied. Repository-protected paths require Eve's durable user-approval pause.
The protected categories follow ADR-0018: identity and permissions, money,
secrets, migrations and RLS, deployment, data boundaries, workflows, agent
instructions, Eve runtime configuration, packages, and dependencies.

Commands, potential command egress, file writes, and network-policy changes
emit ADR-0020 audit records from the trusted runtime. Raw commands are not
persisted; their SHA-256 fingerprints and bounded finding identifiers provide
correlation without copying possible secret text into audit storage. If the
start audit cannot be recorded, the effect fails closed.

The sandbox adds no provider credential or production-data access. Model
routing and budgets remain owned by ADR-0022 and ADR-0024. GitHub identity,
review, push authentication, and PR actions remain later slices. The master
release switch remains off.

## Consequences

- Engineering filesystem and shell effects are isolated from the application
  runtime and inherit Eve's per-session durability.
- Allow-all networking is possible only after app-owned governance authorizes
  it; the default and every failure mode are deny-all.
- Sensitive material is rejected before a write or command, while protected
  repository work parks for explicit human approval.
- An unaudited command or write does not begin. Post-effect audit failure pauses
  subsequent work but cannot retroactively undo a sandbox-only mutation.
- Private-repository checkout and push remain unavailable until the separately
  governed GitHub slices add firewall-brokered credentials.

## Verification

- Guardrail unit tests cover safe files, sensitive paths and content,
  protected-area approval, command egress classification, command
  fingerprinting, release gating, emergency-off, and the networking kill
  switch.
- Authored-tool tests prove protected operations request durable approval and
  forbidden sensitive material is denied.
- `eve info` and `eve build` prove the installed Eve runtime discovers and
  compiles the sandbox and wrapped tools.
- OpenSpec strict validation and the repository CI preflight remain required.
