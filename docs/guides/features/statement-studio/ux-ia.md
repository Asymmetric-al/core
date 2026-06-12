# UX And IA

Statement Studio must be clean, easy to use, easy to follow, and built on the repo's shared design tokens and components.

## Triggers

Use this doc when designing or implementing Statement Studio navigation, screens, flows, editor UX, settings, assignment UX, variable UX, or generated PDF management.

## Workflow Steps

1. Load `docs/ai/rules/frontend.md`.
2. Use `@asym/ui` and existing shadcn patterns.
3. Use shared Maia/Zinc semantic tokens from `packages/ui/styles/globals.css`.
4. Avoid app-local theme primitives and hard-coded one-off visual language.
5. Design for many templates and variables without exposing code-like complexity.

## Top-Level IA

- Templates: tenant templates, drafts, published versions, and Starter Library.
- Assignments: defaults by document purpose and scope.
- Variables: built-in variables, tenant overrides, custom variables, source maps, usage impact.
- Generated PDFs: artifacts, downloads, retention, purge, and audit.
- Settings: capabilities, retention, storage limits, branding defaults.

## Core Workflows

Template workflow:

1. Choose starter or existing template.
2. Edit with PDF-native blocks.
3. Add variables from friendly grouped pickers.
4. Preview with safe sample data or authorized real data.
5. Publish immutable version.
6. Optionally assign as default.

Assignment workflow:

1. Pick document purpose.
2. Choose scope.
3. Select published template version.
4. Preview impact.
5. Validate readiness.
6. Publish or schedule assignment.

Variable workflow:

1. Browse/search variable families.
2. Review sample values, type, sensitivity, readiness, and used-by jobs.
3. Customize label/group/format/fallback.
4. Register safe custom variable or custom field.
5. Validate and test with sample data.

## UX Requirements

- Normal admins should not see SQL, JSON paths, resolver names, or schema-like setup.
- Show plain-language validation and next steps.
- Use readiness badges and "currently used for" indicators.
- Hide edge-case complexity until a decision is required.
- Make rollback an easy saved action.
- Keep publishing clear: "future donor receipts for this tenant" or "badges for this event."

## Checklist

- [ ] All UI uses shared design tokens/components.
- [ ] Starter Library is inside Templates.
- [ ] Variables has a top-level section.
- [ ] Many templates remain searchable/filterable/grouped.
- [ ] Many variables remain searchable/filterable/grouped.
- [ ] No coding-like mapping UI for normal admins.
- [ ] Sensitive/private document flows are visibly guarded.
