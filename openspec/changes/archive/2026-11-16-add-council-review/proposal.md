# Add opt-in council reviews

## Why

Core has single-reviewer skills but no canonical route for a requested review
by multiple models. The imported council workflow needs Core's authorization
and stopping rules because each round can launch separate provider tasks.

## What Changes

- Route explicit council requests to a reviewed, pinned import of tstack's
  council skill. Honor an explicitly requested member list.
- Bound review rounds and keep delegates read-only. Gate fixes and further
  rounds on the current request's authorization.
- Report unavailable providers and actual review coverage. Allow a labeled
  native-only review for an unspecified default when cross-provider access
  is unavailable.

## Impact

The change adds agent instructions, source provenance, generated skill
mirrors, and their checks. It adds no provider integration or credentials
and changes no product runtime.
