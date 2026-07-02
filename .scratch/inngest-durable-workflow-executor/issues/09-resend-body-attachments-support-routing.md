# 09: Resend body retrieval, attachment status, and Support Hub routing

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## GitHub issue

#294

## What to build

Use durable workflow steps to retrieve received-email body content and
attachment metadata, complete the inbound email record, and route ready messages
to Support Hub only after body retrieval succeeds.

## Acceptance criteria

- [ ] Support Hub routing requires received-email body content and never creates
      empty support messages from placeholder metadata alone.
- [ ] Attachment retrieval does not block Support Hub routing after the body is
      available.
- [ ] Support Hub shows attachment status as pending, retrying, failed, or
      available without exposing provider internals.
- [ ] Body and attachment retries run through product authorization, work claims,
      and workflow dispatch.
- [ ] Staff UI never calls Resend directly and never receives API keys, signed
      URLs, raw provider payloads, or attachment bytes as retry inputs.
- [ ] Tests cover body success, body exhaustion, attachment pending,
      attachment retry reuse, and duplicate routing prevention.

## Blocked by

- .scratch/inngest-durable-workflow-executor/issues/08-resend-inbound-handoff-and-placeholder.md
