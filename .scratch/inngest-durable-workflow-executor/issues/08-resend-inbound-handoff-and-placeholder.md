# 08: Resend inbound handoff and placeholder workflow

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## What to build

Move the first verified and tenant-resolved Resend inbound email handoff into
the shared workflow dispatch path while keeping signature verification, raw
request handling, tenant resolution, and durable email event storage in the
product webhook boundary.

## Acceptance criteria

- [ ] Resend webhook signatures are verified before event storage or workflow
      dispatch.
- [ ] Verified and exactly tenant-resolved inbound events create or update a
      minimal inbound email placeholder before workflow dispatch.
- [ ] Placeholders exclude body text, rendered HTML, attachment bytes, signed
      attachment URLs, and Support Hub rows.
- [ ] Verified tenant-safe stored events can return success even if immediate
      Inngest dispatch fails.
- [ ] Unresolved or ambiguous tenant cases fail closed and do not dispatch
      tenant workflow work.
- [ ] Tests cover duplicate webhook replay, dispatch failure after storage,
      tenant ambiguity, and placeholder shape.

## Blocked by

- .scratch/inngest-durable-workflow-executor/issues/04-work-claims-and-recovery-scan.md
