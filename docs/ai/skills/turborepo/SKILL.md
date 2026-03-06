---
name: turborepo
description: Configure and operate Turborepo tasks, caching, filtering, boundaries, and CI workflows for Bun-based monorepos.
metadata:
  owner: "skills-steward"
  last_updated: 2026-03-06
  status: "active"
  upstream:
    url: "https://skills.sh/vercel/turborepo/turborepo"
    repo: "vercel/turborepo"
    path: "skills/turborepo/SKILL.md"
    license: "MIT"
license: MIT
---

# Turborepo

Use this skill when changing task graphs, cache behavior, filters, or monorepo orchestration.

## When to Apply

Use this skill when:

- Editing `turbo.json` tasks/dependsOn/inputs/outputs/env
- Changing package scripts orchestrated by `turbo run ...`
- Debugging cache misses, affected runs, or CI Turbo behavior
- Creating/organizing packages in a Turborepo monorepo

Do not use this skill when:

- The task is strictly UI logic with no monorepo/task impact

## Core Rules

1. Define task scripts in package `package.json` files; root scripts should delegate with `turbo run`.
2. Declare correct task dependencies (`dependsOn`) and outputs for cacheability.
3. Prefer `--affected` or explicit filters for scoped runs.
4. Treat env/input declarations as cache correctness requirements, not optional metadata.
5. Keep workspace/package boundaries explicit and avoid cross-package internal path imports.

## Workflow

1. Identify affected tasks/packages and dependency direction.
2. Update package scripts first, then task orchestration in `turbo.json`.
3. Verify cache inputs/outputs and environment declarations.
4. Validate with scoped Turbo commands (`--filter`, `--affected`) before broad runs.
5. Confirm CI/deployment task behavior remains deterministic.

## Checklist

- [ ] Package-level scripts are the source of task behavior
- [ ] Root scripts delegate via `turbo run`
- [ ] Task `dependsOn` graph is correct for build order
- [ ] Cache `outputs` and relevant `inputs/env` are declared
- [ ] Filters/affected run patterns are documented for the change
- [ ] No boundary-breaking imports introduced

## References

- `references/upstream.md` for source mapping and attribution
