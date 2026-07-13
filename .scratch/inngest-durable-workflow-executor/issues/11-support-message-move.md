# 11: Explicit audited Support Hub message move

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## GitHub issue

#296

## What to build

Add the explicit audited action for moving an already routed Support Hub message
or conversation to another tenant-owned inbox without rewriting the original
route decision.

## Acceptance criteria

- [ ] Any authenticated support agent in the owning tenant can move a message or
      conversation only between tenant-owned source and destination inboxes.
- [ ] The move requires a short free-text reason with light validation.
- [ ] Move audit records actor, tenant, message or conversation identity,
      original inbox, destination inbox, reason, retained metadata, and
      timestamp.
- [ ] The original inbox gets a quiet moved-to marker without a duplicate
      replyable message.
- [ ] The destination inbox shows the moved message normally with a quiet
      moved-from marker.
- [ ] Labels, priority, status, and snooze timing are retained by default.
- [ ] Assignee is retained only when the assignee can access the destination
      inbox; otherwise the message becomes unassigned.
- [ ] Resolved moves require quiet confirmation.
- [ ] Tests cover tenant checks, reason validation, audit append, markers,
      assignee handling, status retention, snooze retention, and resolved
      confirmation.

## Blocked by

- .scratch/inngest-durable-workflow-executor/issues/04-work-claims-and-recovery-scan.md
