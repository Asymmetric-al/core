# Design (ADR-0020): Eve Audit Tracer Bullet

> **Canonical decision:** Accepted as ADR-0020 by the #419 implementation PR.

> This `design.md` records **ADR-0020**, the audit-record + redacted-package decision required by issue
> #419. It builds on **ADR-0018** (#417, `openspec/specs/eve-autonomous-operations/spec.md`) and **ADR-0019** (#418,
> `add-eve-governance-kernel-release-switch`) and does not restate them — it defines the rich audit-record
> shape, the redacted replay/debug package metadata, and the decision-summary contract that those slices
> assume. Its canonical ADR body lives in `docs/adr/0020-eve-audit-tracer.md`. Every grounded claim carries a
> `[VERIFIED-REPO: path]` citation read from `Asymmetric-al/core` at commit `d14a2434` on 2026-07-02.
> [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Status

Accepted for #419. Supersedes nothing. Builds on #418 (plan slice 2); subordinate to
ADR-0018 (#417) and ADR-0019 (#418). Subordinate to OpenSpec and `AGENTS.md`. [VERIFIED-REPO: AGENTS.md]
[VERIFIED-REPO: openspec/project.md]

## Context

The implementation plan makes slice 3 the audit tracer bullet: it proves "one safe Eve-like action can
create a rich audit record and redacted debug package metadata," with acceptance that the record captures
actor, initiator, identity mode, policy, action, target, result, model role placeholder, and evidence
summary; that an admin can inspect audit history and a high-quality decision summary; and that redaction
rules are represented in tests. It is typed AFK, blocked by slice 2 (#418), and covers user stories 5, 6, 7,
8, 32, 33, 34. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

The PRD's stories this slice serves: rich audit records for every meaningful action, letting an owner
reconstruct who/what initiated it, which tool or subagent ran, which model role, which policy, what evidence,
and what changed (US-32); admin actions audited under the admin identity (US-6); background jobs under a
service identity with initiator metadata (US-7); GitHub actions through a bot recording the accountable human
or trigger (US-8); product actions inheriting the admin's tenant/role/permissions (US-5); redacted replay and
debug packages so failures can be investigated "without storing unsafe raw data" (US-33); and high-quality
decision summaries "instead of raw model reasoning … without exposing hidden reasoning or sensitive
internals" (US-34). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

The `platform-boundaries` spec already requires that sensitive operations stay behind server-side boundaries
and that "payment data, secrets, and trust-sensitive internals MUST never leak" into layers that do not need
them; the audit record and debug package inherit that boundary and add a redaction contract on top of it —
they never relax it. [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

## Decision

1. **A single durable audit-record shape for every meaningful action.** Rather than let each later slice
   invent its own record, #419 pins one spec-level record: actor, initiator, identity mode, policy, action,
   target, result, model-role placeholder, and evidence summary — sufficient to reconstruct who/what
   initiated the action, which tool or subagent ran, which model role and policy applied, what evidence was
   used, and what changed. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
2. **Accountable identity comes from verified context, never from the model.** Admin actions are recorded
   under the admin's identity (US-6), background jobs under a service identity with initiator metadata
   (US-7), and GitHub actions under the bot actor plus the accountable human or trigger (US-8). The recorded
   identity mode matches the identity the #417 auth boundary resolved and is not selectable by prompt or tool
   input — the same non-bypass rule ADR-0019 applies to the release switch.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
3. **Redaction by construction: metadata in, unsafe raw data out.** The replay/debug package carries redacted
   metadata and an evidence summary only and never stores payment data, secrets, one-time codes, tenant PII,
   or raw model reasoning; redaction rules are represented in tests (plan acceptance). This is the audit
   surface's expression of the platform-boundaries "never leak" rule and of the partner fleet's data
   boundary. [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
4. **Decision summaries, not raw reasoning.** Admins inspect audit history and a high-quality decision
   summary explaining why Eve acted, without exposing hidden model reasoning or sensitive internals (US-34);
   the summary is a redacted, decision-relevant artifact, not a transcript.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
5. **Record-only, no new authority.** Producing an audit record or debug package never initiates, authorizes,
   or widens an autonomous action; audit writes go to the app-owned governance store the #418 kernel already
   governs, and #417/#418 gates still apply unchanged. The change adds no live autonomous surface.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
   [VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

## Boundary with adjacent slices

- **#417 (ADR-0018, foundation):** owns identity resolution, tenant isolation, protected areas, and the
  governance data model at spec level. #419 records the identity mode it resolves; it does not define
  identity resolution. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- **#418 (ADR-0019, governance kernel):** owns the release-switch/emergency-off state and the consult/abort
  gate, persisting run summaries and policy status. #419 adds the per-action audit record that gated actions
  emit into that same app-owned store. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **#419 (this change):** owns the rich audit-record shape, the redacted replay/debug package metadata, and
  the audit-history + decision-summary inspection contract, proven for one safe Eve-like action.
- **#424 (retention and replay artifact tracer bullet, plan slice 8):** owns retention (180-day default),
  category overrides, incident/legal holds, and storage of large artifact content for the audit records and
  replay/debug artifacts #419 defines. #419 defines the record; #424 governs its lifetime.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Verification contract

- OpenSpec validates: `bunx @fission-ai/openspec@latest validate add-eve-audit-tracer-bullet --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The tracer-bullet acceptance — one safe Eve-like action produces a rich audit record + redacted debug
  package metadata, with redaction rules represented in tests — is the slice-specific check and lands with
  the implementing PR, not this spec/ADR. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Consequences

- Positive: one durable audit-record shape every later Eve slice reuses; auditability becomes a testable
  contract rather than a per-feature afterthought; redaction is specified before any data is stored, so no
  unsafe raw data is ever written.
- Cost: front-loaded spec/ADR effort and a mandatory audit write on every meaningful action.
- Risk if skipped: each slice invents its own record and redaction, the "reconstruct who/what/why" guarantee
  (US-32) becomes unverifiable, and unsafe raw data risks leaking into debug artifacts — the exact failure
  US-33 and platform-boundaries forbid. [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

## Alternatives considered

- **Free-form per-slice audit logs.** Rejected: the plan requires a specific field set (actor, initiator,
  identity mode, policy, action, target, result, model-role placeholder, evidence summary) and cross-slice
  reconstruction; free-form logs cannot guarantee it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **Store raw context and redact at read time.** Rejected: US-33 and platform-boundaries require that unsafe
  raw data is never stored; redact-on-read would persist secrets/PII at rest.
  [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]
- **Expose raw model reasoning as the audit trail.** Rejected: US-34 requires a high-quality decision summary
  "instead of raw model reasoning … without exposing hidden reasoning or sensitive internals."
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- **Fold retention/holds into #419.** Rejected: retention, expiry, and incident/legal holds are #424's scope;
  merging them would overload this slice and blur the shape-vs-lifetime boundary.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Out of scope (this change)

Retention/expiry/holds machinery (#424), large replay artifact storage, and any live autonomous behavior.
The implementation includes the narrow schema, tracer, safe inspection event, and admin history surface
needed to prove the accepted audit contract.
