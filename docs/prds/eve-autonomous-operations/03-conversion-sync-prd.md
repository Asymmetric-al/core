# PRD 2: Eve PRD-to-Issues Conversion Sync

Published issue: https://github.com/Asymmetric-al/core/issues/438

Parent issue sync comment:
https://github.com/Asymmetric-al/core/issues/416#issuecomment-4827811359

## Problem Statement

The Eve planning conversion produced durable local planning artifacts and a
large GitHub issue graph while the repo worktree was already very dirty. Future
AI agents need a clean, narrow handoff that explains exactly what changed in
this conversion, what was published to GitHub, and how to verify that the local
docs and issue tracker remain synchronized.

Without a conversion-specific handoff, an implementation agent could confuse
unrelated dirty worktree changes with the Eve planning artifacts, miss the
published issue dependencies, start from a stale local file, or implement from
GitHub issues that no longer match the PRD and plan.

## Solution

Create a conversion-only PRD that records the planning artifacts, GitHub issues,
sync checks, and guardrails created during the Eve PRD-to-plan-to-issues
conversion.

This PRD does not define new Eve product scope. It documents the conversion
state that must be preserved so future AI agents can safely build from the Eve
PRD and child issues.

The conversion produced three local documents:

1. The Eve Autonomous Operations Platform PRD.
2. The Eve implementation plan and published issue map.
3. This conversion sync PRD.

The conversion also published:

- Parent PRD issue: [#416](https://github.com/Asymmetric-al/core/issues/416)
- Child implementation issues:
  [#417](https://github.com/Asymmetric-al/core/issues/417) through
  [#437](https://github.com/Asymmetric-al/core/issues/437)

## User Stories

1. As a future AI implementation agent, I want one conversion handoff, so that
   I can tell which local files and GitHub issues came from the Eve planning
   conversion.

2. As a future AI implementation agent, I want the parent PRD issue to match
   the local PRD exactly, so that I do not implement from stale product scope.

3. As a future AI implementation agent, I want every child issue to reference
   the parent PRD issue, so that the implementation graph has a single source
   parent.

4. As a future AI implementation agent, I want every child issue to reference
   the local PRD and implementation plan paths, so that I can connect tracker
   work back to repo artifacts.

5. As a future AI implementation agent, I want each child issue to include its
   blockers, so that I do not start work out of dependency order.

6. As a future AI implementation agent, I want every child issue to carry the
   required repo issue labels, so that issue triage and agent routing remain
   consistent.

7. As a future AI implementation agent, I want the local implementation plan to
   include the published GitHub issue map, so that I can navigate from local
   docs to tracker items without searching manually.

8. As a maintainer, I want the conversion artifacts isolated from unrelated
   dirty worktree changes, so that review can focus only on the Eve planning
   conversion.

9. As a maintainer, I want a repeatable sync audit, so that I can check whether
   the GitHub issue graph still matches the local plan before assigning AFK
   agents.

10. As a maintainer, I want the conversion PRD to state that no product code was
    changed, so that implementation does not accidentally start before the
    spec-first PR.

11. As a maintainer, I want the conversion PRD to state that Eve implementation
    starts at issue #417, so that agents do not treat the conversion handoff as
    runtime work.

12. As a maintainer, I want the conversion PRD to capture verification results,
    so that future agents know what was checked after issue publication.

13. As a maintainer, I want the conversion PRD to call out the dirty-worktree
    constraint, so that unrelated `.claude`, `.codex`, temp, or generated-file
    changes are not swept into an Eve PR.

14. As a maintainer, I want GitHub to contain a sync note pointing back to this
    conversion handoff, so that someone starting from the issue tracker can find
    the local docs.

15. As a maintainer, I want this conversion PRD to avoid redefining Eve product
    behavior, so that product truth remains in the parent PRD and later
    OpenSpec work.

## Implementation Decisions

- The conversion's durable local artifacts are the PRD, implementation plan,
  and this conversion sync PRD.

- The parent PRD issue is #416. It contains the full body of the local Eve
  Autonomous Operations Platform PRD.

- The implementation issue range is #417 through #437.

- The implementation plan includes a published issue table that maps all 21
  slices to their GitHub issue numbers and HITL/AFK type.

- Each child issue includes:
  - parent reference to #416;
  - source PRD path;
  - source implementation plan path;
  - slice type;
  - user stories covered;
  - acceptance criteria;
  - blocker references.

- Each child issue uses repo issue taxonomy:
  - exactly one complexity label;
  - `status:todo`;
  - exactly one type label;
  - `ready-for-agent`.

- Issue #417 is the first implementation issue and is not blocked by another
  Eve issue.

- Issue #437 is the final release-switch verification issue and is blocked by
  all implementation issues #417 through #436.

- The conversion did not intentionally modify product code, schema, tests,
  runtime config, package manifests, lockfiles, generated mirrors, or existing
  dirty worktree files.

- Future implementation agents must not infer that unrelated dirty worktree
  changes belong to the Eve conversion.

- Future implementation agents should start from #417 and follow dependencies
  rather than jumping directly into runtime work.

- The parent Eve PRD remains the product source artifact until PR 1 creates the
  OpenSpec change and ADR described by #417.

## Testing Decisions

- Conversion verification is documentation and issue-tracker focused. It does
  not run product test suites because no product code is part of this
  conversion.

- Formatting verification must pass for the local Eve PRD, implementation plan,
  and conversion sync PRD.

- Parent issue verification must confirm that #416 body matches the local Eve
  PRD body.

- Child issue verification must confirm #417 through #437 exist with expected
  titles, labels, parent references, source paths, and blocker references.

- Local plan verification must confirm that the implementation plan includes
  links for #417 through #437.

- Dirty-worktree verification must inspect status and keep the conversion scope
  limited to `docs/prds/eve-autonomous-operations/` plus GitHub issue tracker
  updates.

- GitHub sync verification should use GitHub CLI or plugin-backed issue reads
  before assigning AFK work.

## Out of Scope

- This conversion PRD does not add Eve runtime code.

- This conversion PRD does not alter OpenSpec, ADRs, Supabase schema, admin UI,
  package manifests, lockfiles, CI workflows, or GitHub automation code.

- This conversion PRD does not change the scope, user stories, or technical
  decisions in the parent Eve PRD.

- This conversion PRD does not resolve unrelated dirty worktree changes.

- This conversion PRD does not stage, commit, or push local files.

- This conversion PRD does not close, reorder, or relabel any published Eve
  issues.

## Further Notes

- Verified on 2026-06-29: parent issue #416 body matched the local parent PRD
  body when read through GitHub JSON output.

- Verified on 2026-06-29: child issues #417 through #437 matched expected
  titles, labels, parent references, source paths, and blocker references.

- Verified on 2026-06-29: the local implementation plan contained the published
  issue map for #417 through #437.

- Verified on 2026-06-29: Prettier passed for the Eve PRD and implementation
  plan before this conversion PRD was added.

- Before assigning implementation work, rerun formatting on all three local
  Eve planning documents and rerun the issue sync audit.
