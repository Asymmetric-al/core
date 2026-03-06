---
name: ultracite
description: Apply Ultracite lint/format workflows and code standards for JS/TS projects with strict quality, accessibility, and maintainability defaults.
metadata:
  owner: "skills-steward"
  last_updated: 2026-03-06
  status: "active"
  upstream:
    url: "https://skills.sh/haydenbleasel/ultracite/ultracite"
    repo: "haydenbleasel/ultracite"
    path: "skills/ultracite/SKILL.md"
    license: "MIT"
license: MIT
---

# Ultracite

Use this skill when a task involves ultracite-managed linting, formatting, or code-style policy.

## When to Apply

Use this skill when:

- Initializing or using Ultracite (`init`, `check`, `fix`, `doctor`)
- Debugging lint/format behavior in Ultracite-enabled repos
- Applying consistent JS/TS/React coding standards
- Auditing code quality against explicit standards

Do not use this skill when:

- The project does not use Ultracite and there is no instruction to add it

## Core Rules

1. Detect the active lint stack and use Ultracite commands as the first-line workflow.
2. Prefer standards that increase correctness and maintainability (`unknown` over `any`, no unused values, explicit async handling).
3. Enforce accessibility and semantic HTML as baseline quality requirements.
4. Keep runtime/debug-only statements out of production code paths.
5. Align formatting and style decisions with shared standards for consistency.

## Workflow

1. Detect setup (`ultracite` dependency + config files).
2. Run `check` to identify issues; run `fix` where safe.
3. Use `doctor` for setup/config conflicts.
4. Apply code standards from `references/code-standards.md`.
5. Re-run checks after changes and document any intentional exceptions.

## Checklist

- [ ] Ultracite context is confirmed before applying rules
- [ ] `check` and/or `fix` workflow is used
- [ ] Accessibility/security/style standards are respected
- [ ] No debug artifacts remain in production code
- [ ] Any exceptions are explicit and justified

## References

- `references/code-standards.md` for practical standards
- `references/upstream.md` for source mapping and attribution
