# Proposal: Eve governance kernel and release switch

**Prepared by WNG partner fleet for Eve / Asymmetric.**

> **Partner DRAFT for GitHub issue #418 ("Eve: Governance kernel and release switch").** Staged in the
> Gitea `proposals` repo; NOT a change to `Asymmetric-al/core`, and enters that repo only through
> Asymmetric's OpenSpec workflow after operator/maintainer sign-off. **Builds on #417**
> (`openspec/specs/eve-autonomous-operations/spec.md`) — it does not restate that contract, it operationalizes
> the release-switch / kill-switch-state portion of it. Every grounded claim carries a
> `[VERIFIED-REPO: path]` citation read from `Asymmetric-al/core` at commit `25ca4a2` on 2026-07-02.

## Why

#417 defines the durable autonomy contract at spec level and requires that "activation MUST use a single
controlled release switch … off until governance, auth, audit, evals, protected-area policy, kill switches,
and rollback paths are verified," and that the governance data model (release-switch state, kill-switch
state, run summaries, policy status, …) be defined before implementation.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md] The next slice,
#418, makes that switch real: it lets Eve **exist while disabled and controlled** so later slices can ship
behind it. Its stated purpose is "the platform can persist and display Eve system state while Eve remains
**disabled by default**," with acceptance that the governance data model supports release-switch/kill-switch
state, run summaries, and policy status; admin can see disabled/enabled + emergency status; and **tests prove
disabled mode blocks autonomous behavior**. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## What Changes

- Add a new OpenSpec capability `eve-governance-kernel` (spec delta in `specs/eve-governance-kernel/spec.md`)
  stating: the **release switch is disabled by default**; an **emergency-off state** that forces the whole
  system to disabled / human-approval regardless of the release switch; a **governance kernel** that persists
  release-switch state, emergency/kill-switch state, run summaries, and policy status as app-owned data and
  that **every autonomous action must consult before acting**; **observability** of that state; and that the
  kernel is **subordinate to #417 and grants no new authority** — it only gates.
- Record the decision under provisional Eve design label **EVE-DESIGN-0002** in this change's `design.md`, building on ADR-0018 from #417.

## What Does Not Change

- This change adds **no live autonomy**. It defines the disabled-by-default gate and the state it reads; the
  system stays off. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- The **granular kill-switch control path** (per-domain switches for automation, active runs, GitHub actions,
  production writes, sandbox networking, dynamic workflows, model-policy changes, force-approval) is **#420's
  scope**, not this change; #418 defines only the kernel's release-switch and emergency-off **state** that
  #420 later drives. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- #417's contract, `AGENTS.md`, `openspec/project.md`, `openspec/specs/**`, `docs/ai/*`, and existing CI gates
  remain authoritative and unchanged; this change is subordinate to them. [VERIFIED-REPO: AGENTS.md]
  [VERIFIED-REPO: openspec/project.md]
- No Supabase schema, admin UI, or runtime code lands here — those implement this spec in later PRs.

## Expected Outcome

- A validated OpenSpec change (`bunx @fission-ai/openspec@latest validate add-eve-governance-kernel-release-switch --strict`)
  that makes the release switch and disabled-by-default gate a durable, spec-level contract Eve can be built
  behind. [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Provisional Eve design decision `EVE-DESIGN-0002` for the governance kernel + release switch, traceable from ADR-0018 (#417).
- A clear boundary: #418 owns the release-switch/emergency-off **state and gate**; #420 owns the granular
  kill-switch **control path**; #437 owns the final release-switch **flip** after end-to-end verification.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
