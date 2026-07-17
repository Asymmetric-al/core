# Proposal: Eve audit tracer bullet

**Prepared by WNG partner fleet for Eve / Asymmetric.**

> **Partner DRAFT for GitHub issue #419 ("Eve: Audit tracer bullet").** Staged in the Gitea `proposals`
> repo; NOT a change to `Asymmetric-al/core`, and enters that repo only through Asymmetric's OpenSpec
> workflow after operator/maintainer sign-off. **Blocked by #418** (`add-eve-governance-kernel-release-switch`,
> plan slice 2) and subordinate to **#417** (`openspec/specs/eve-autonomous-operations/spec.md`) — it does not
> restate those contracts, it adds the audit-record shape they assume. Every grounded claim carries a
> `[VERIFIED-REPO: path]` citation read from `Asymmetric-al/core` at commit `d14a2434` on 2026-07-02.

## Why

The implementation plan makes slice 3 the **audit tracer bullet**: it must prove that "one safe Eve-like
action can create a rich audit record and redacted debug package metadata," with acceptance that the audit
record captures actor, initiator, identity mode, policy, action, target, result, model role placeholder, and
evidence summary; that an admin can inspect audit history and a high-quality decision summary; and that
**redaction rules are represented in tests**. It is typed AFK, blocked by slice 2 (#418), and covers user
stories 5, 6, 7, 8, 32, 33, 34. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

The parent PRD states the underlying stories: rich audit records for every meaningful Eve action so an
owner can reconstruct "who or what initiated the action, which tool or subagent ran, which model role was
used, what policy applied, what evidence was used, and what changed" (US-32); admin actions audited under
the admin identity (US-6); background jobs under a service identity with initiator metadata (US-7); GitHub
actions through a bot recording the accountable human or trigger (US-8); redacted replay and debug packages
"so that failures can be investigated without storing unsafe raw data" (US-33); and high-quality decision
summaries "instead of raw model reasoning … without exposing hidden reasoning or sensitive internals"
(US-34). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md] Without
a durable audit-record contract, later autonomous slices would each invent their own record shape and the
auditability guarantee the whole platform rests on would be unverifiable.

## What Changes

- Add a new OpenSpec capability `eve-audit-tracer` (spec delta in `specs/eve-audit-tracer/spec.md`) stating:
  every meaningful Eve action **produces a rich audit record** with the required fields (actor, initiator,
  identity mode, policy, action, target, result, model-role placeholder, evidence summary) sufficient to
  reconstruct who/what initiated it, which tool or subagent ran, which model role, which policy, what
  evidence, and what changed; **accountability identity** is recorded from verified context (admin identity
  for admin actions, service identity + initiator metadata for background jobs, bot + accountable human/
  trigger for GitHub actions) and never from prompt or tool input; a **redacted replay/debug package**
  carries metadata only and **never stores unsafe raw data** (no PII, payments, secrets, one-time codes, or
  raw model reasoning), with redaction rules represented in tests; an admin can inspect **audit history and a
  high-quality decision summary** instead of raw model reasoning; and the tracer proves the record path
  end-to-end for **one safe Eve-like action** while granting **no new authority**.
- Record the decision under provisional Eve design label **EVE-DESIGN-0003** in this change's `design.md`, building on ADR-0018 (#417) and EVE-DESIGN-0002
  (#418).

## What Does Not Change

- This change adds **no live autonomy** and **no retention machinery**. It defines the audit-record and
  redacted-package **shape** and proves one record path; the **retention, expiry, category overrides, and
  incident/legal holds** for audit records and replay/debug artifacts are **#424's scope** (slice 8,
  "Retention and Replay Artifact Tracer Bullet"), not this change. #419 defines the record; #424 governs its
  lifetime and storage. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- The governance kernel's persisted state and consult/abort gate remain **#418's scope**; #419 only adds the
  audit record that governance-gated actions emit, written to the same app-owned governance store, and does
  not re-specify the release switch or emergency-off state. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- Identity, tenant isolation, protected-area limits, and the layered source-of-truth order remain **#417's
  contract**; #419 records the identity mode already resolved there, it does not define identity resolution.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- `AGENTS.md`, `openspec/project.md`, `openspec/specs/**`, `docs/ai/*`, and existing CI gates remain
  authoritative and unchanged; this change is subordinate to them. [VERIFIED-REPO: AGENTS.md]
  [VERIFIED-REPO: openspec/project.md]
- No Supabase schema, admin UI, or runtime code lands here — those implement this spec in later PRs.

## Expected Outcome

- A validated OpenSpec change
  (`bunx @fission-ai/openspec@latest validate add-eve-audit-tracer-bullet --strict`) that makes the rich
  audit record, the redacted replay/debug package, and the decision-summary contract durable, spec-level
  requirements every later Eve slice inherits. [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Provisional Eve design decision `EVE-DESIGN-0003` for the audit tracer bullet, traceable from ADR-0018 (#417) and EVE-DESIGN-0002 (#418).
- A clear boundary: #419 owns the audit-record **shape**, redacted-package **metadata**, and decision
  summary; #418 owns the governance **state/gate**; #424 owns audit/artifact **retention and holds**.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
