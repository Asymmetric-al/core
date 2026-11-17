## Why

The accepted `platform-boundaries` requirement "Mission Control Tasks Are The
Shared Staff Work Model" still lists "CRM post failures" as a live category of
staff follow-up work. External CRM posting was retired with Twenty CRM
(ADR-0001; `crm-core` and `contribution-operations` already say no retired
posting, repost or synchronization action is queued). The shipped product
already leaves those failures out of Needs Attention, so the requirement
describes work nobody can do.

## What Changes

- Remove "CRM post failures" from the follow-up categories named by the
  requirement.
- State the behavior that replaced it: issue kinds left by a retired
  integration are not listed in Needs Attention as follow-up work, and their
  records stay in place as history.
- No code, schema, route or data change. The behavior is already implemented
  and tested; this change reconciles the accepted requirement with it.

## Non-goals

- Deleting or migrating existing `crm_post_failed` task or attention records.
- Removing the historical CRM posting status shown on a gift.
- Changing any other follow-up category, the shared task model, or automation
  rules.
- Restoring any Twenty client, sync, repost or cutover path.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `platform-boundaries`: the requirement "Mission Control Tasks Are The Shared
  Staff Work Model" drops the retired CRM posting category and states how
  retired issue kinds are treated.

## Impact

- `openspec/specs/platform-boundaries/spec.md` when this change is archived.
- No application, package, API, job, provider or database impact.
- Evidence of current behavior:
  `packages/api/src/admin/mission-control-tasks/read-model.ts`
  (`RETIRED_NEEDS_ATTENTION_ISSUE_TYPES`, `withoutRetiredNeedsAttention`),
  `packages/api/src/admin/mission-control-tasks/store.ts`
  (`listContributionNeedsAttention` excludes retired kinds in the query), and
  the tests in
  `tests/unit/packages/api/admin/mission-control-needs-attention.test.ts` and
  `tests/unit/apps/admin/app/contributions-page.test.tsx`.

## Rollback

Revert this change before archive, or restore the previous requirement text
with a new change after archive. Nothing else depends on it.
