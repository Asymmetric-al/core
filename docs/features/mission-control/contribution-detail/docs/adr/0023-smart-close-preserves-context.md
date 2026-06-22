# ADR-CD-023: Closing contribution detail preserves context and updates affected data

**Status:** Accepted (grill session 2026-05-29)

## Context

Contribution detail opens from either the Contributions Hub or CRM donor gift history. Staff may have filters, scroll position, row selection, CRM donor context, and per-user table preferences active when they open detail. Closing should not reset the workflow.

## Decision

Use smart close behavior:

- Remove only gift selection from URL state.
- Preserve CRM donor drawer/context when opened from CRM.
- Preserve Hub filters, search, scroll position, row selection, and table preferences.
- Patch affected row/summary data from operation result when available.
- Use targeted Query/DB invalidation for affected data when patching is insufficient.
- Restore focus to the opener row/button.
- Avoid full page/table reset unless data is stale, missing, or unsafe to patch.

## Consequences

- Openers need stable focus return targets.
- Rows need stable ids for virtualization and table state.
- Operation results should be rich enough to patch affected rows.
- Browser history behavior should feel like dismissing detail, not leaving the current workspace.

## Alternatives rejected

- **Always refetch underlying surface:** Current but can be jarring and wasteful.
- **Manual refresh only:** Risks stale row status after actions.
- **Navigate to canonical Hub:** Breaks CRM donor workflow context.
