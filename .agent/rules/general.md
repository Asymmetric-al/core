---
trigger: always_on
---

# Asymmetric.al General Rules

## Project Identity
- **Project Name**: Asymmetric.al
- **Issue Key Convention**: `AL-###`

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Library**: React 19
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (Client Libraries)
- **Package Manager**: bun

## Workflow
1.  **Issue**: Every change starts with a GitHub issue (`AL-###`).
2.  **Branch**: Create a branch from the issue (e.g., `feature/AL-123-description` or `fix/AL-123-bug`).
3.  **Implementation**: precise changes, `bun run dev` to test.
4.  **PR**: Open a PR referencing the issue. Ensure all CI checks pass.

## Issue Labels
Every issue must have exactly one label from each of the following categories:

1.  **Complexity**:
    - `complexity:simple`
    - `complexity:easy`
    - `complexity:medium`
    - `complexity:hard`
2.  **Status**:
    - `status:todo`
    - `status:blocked`
    - `status:needs-review`
    - `status:ready`
3.  **Type**:
    - `type:bug`
    - `type:feature`
    - `type:chore`
    - `type:refactor`
    - `type:docs`

**Rule**: Assignments must be mutually exclusive within categories (e.g., an issue cannot be both `simple` and `hard`).

## Repo Rules & CI
- **Main Branch**: `main` is protected. No direct pushes.
- **CI Gates**:
    - Lint: `bun run lint`
    - Typecheck: `bun run typecheck`
- **Build**: Must pass `bun run build` before merging.

## File Hygiene
- **Scope**: Keep changes minimal and localized to the task.
- **PR Size**: Prefer small, atomic PRs over massive changes.
- **Generated Files**: Do not manually edit generated files (e.g., lockfiles, build artifacts) unless necessary.

## Documentation
- **No Unnecessary Docs**: Do not create or update `.md` files (summaries, plans) unless explicitly asked by the user.
- **Maintain**: Keep `README.md` and `CONTRIBUTING.md` accurate if you modify build steps.
