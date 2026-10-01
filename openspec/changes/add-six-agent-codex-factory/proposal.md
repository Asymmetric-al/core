# Change: Six-agent Codex Cloud issue delivery

## Why

Blake requested a smaller factory in his personal Codex Cloud subscription that
delivers GitHub issues through merge into `develop`. Independent Ezra proof,
Micaiah/Luke adversarial review and Agabus adjudication remain distinct.

## What Changes

- Add six named role definitions and a scoped, discoverable factory workflow.
- Record source/contract/test/review binding in immutable stage artifacts and
  reject stale identity, omitted review, wrong target and changed protected tests.
- Prepare pinned, frozen-lockfile cloud dependencies without production secrets.
- Preserve live GitHub branch protection and human merge authority.
- Report actual cloud capability rather than treating configuration as activation.

## Capabilities

- `agent-instruction-system`: optional six-agent workflow and capability honesty.

## Non-goals

No product runtime, database, deployment, account entitlement, secret policy,
GitHub branch protection or paused VM-factory admission change. No autonomous
background scheduler is implied by a cloud environment template.

## Rollback

Stop starting new factory tasks; retain evidence; remove or revert this optional
configuration and republish the environment only after review. Existing task
snapshots and the separately paused factory remain independent.
