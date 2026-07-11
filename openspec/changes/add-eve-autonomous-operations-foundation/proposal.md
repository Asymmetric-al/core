# Proposal: Establish the Eve autonomous operations foundation (spec + ADR)

**Prepared by WNG partner fleet for Eve / Asymmetric.**

> **Partner DRAFT for GitHub issue #417 ("Eve: Spec and ADR foundation").** Prepared by the WNG
> partner fleet for Asymmetric review. This is a proposal staged in the Gitea `proposals` repo; it
> is NOT a change to `Asymmetric-al/core` and MUST enter that repo only through Asymmetric's own
> OpenSpec workflow after operator/maintainer sign-off. Every grounded claim carries a
> `[VERIFIED-REPO: path]` citation read from `Asymmetric-al/core` at commit `25ca4a2` on 2026-07-02.

## Why

The repo needs a durable, spec-level contract for Eve as an autonomous operations layer _before_
any runtime code exists. The parent PRD is explicit that PR 1 is spec-first: it "must define the
OpenSpec change, initial autonomy ADR, governance data model at spec level, rollout order, feature
flags, and verification contract before runtime implementation proceeds," and that "no runtime code
should outrun this." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md] [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

Eve introduces real risk: it can review, initiate, coordinate, remember, notify, and act, but it
"must not silently weaken tenant isolation, product intent, money integrity, permission
correctness, auditability, or production safety." A durable OpenSpec contract + ADR is the control
that keeps that autonomy legible and bounded. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

Issue #417 is the first implementation slice, blocked by nothing, and is typed HITL (human-in-the-loop).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## What Changes

- Add a new OpenSpec capability spec `eve-autonomous-operations` that states the durable contract
  for Eve: its layered source-of-truth authority, spec-first product path, identity/accountability,
  protected-area and production-write limits, the governance data model at spec level, and the
  requirement that autonomy be recorded in an ADR before runtime code. (See the spec delta in
  `specs/eve-autonomous-operations/spec.md`.)
- Record the initial autonomy ADR in this change's `design.md` (ADR-0001), covering the autonomy
  model, auto-merge policy, production-write policy, and governance guardrails, so future
  contributors understand why an AI agent may initiate work, operate PRs, auto-merge under strict
  policy, and write operational records. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- Document the rollout order (governance-first, 8 phases), feature-flag posture (release switch off
  by default), and the verification contract in `design.md` and `tasks.md`.

## What Does Not Change

- No Eve runtime code, no Supabase schema, no admin UI, no GitHub automation, and no model-policy
  implementation land in this change — those are later slices (#418–#437). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- OpenSpec, `AGENTS.md`, nested `AGENTS.md`, `docs/ai/*` rulebooks, canonical skills, repo-owned MCP
  config, and existing CI gates remain authoritative and unchanged; this change is subordinate to
  them. [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]
- The repo's hand-maintained instruction files are not regenerated (`openspec update` is not run
  casually here). [VERIFIED-REPO: docs/ai/rules/openspec.md] [VERIFIED-REPO: openspec/config.yaml]
- This change does not approve autonomous money movement, refunds, donor/customer identity changes,
  tenant-ownership changes, auth/security changes, secret rotation, RLS changes, migrations, or
  destructive production data changes; it does not make Eve memory a source of truth; it does not
  enable anonymous Eve access. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

## Expected Outcome

- A validated OpenSpec change (`bunx @fission-ai/openspec@latest validate add-eve-autonomous-operations-foundation --strict`)
  that captures Eve's durable autonomy contract at the spec level. [VERIFIED-REPO: docs/ai/rules/openspec.md]
- An initial autonomy ADR of record, so later slices (#418 governance kernel through #437 release
  switch) build on a stated contract rather than re-deriving it.
- A documented, governance-first rollout and verification contract that keeps Eve disabled by
  default until governance, auth, audit, evals, protected-area policy, kill switches, and rollback
  paths are verified. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md] [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
