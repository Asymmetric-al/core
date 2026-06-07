# 10: Inbound routing review and saved route management

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## What to build

Add tenant-owned inbound routing review for emails that do not match a known
Support Hub route or match multiple safe candidate routes, plus saved route
management for tenant admins.

## Acceptance criteria

- [ ] Known Support Hub inbox addresses, aliases, thread replies, and approved
      tenant-domain defaults route automatically after body retrieval.
- [ ] New sender, unusual subject, or attachment presence alone does not require
      manual review.
- [ ] Unknown or ambiguous safe routes hold for lightweight tenant-owned routing
      review.
- [ ] Any authenticated support agent in the owning tenant can save a reviewed
      route and immediately continue routing the same email.
- [ ] Exact recipient or alias is the default saved route scope.
- [ ] Tenant-domain default requires explicit staff choice, extra confirmation,
      and audit of the confirmation result.
- [ ] Tenant admins can view, edit, disable, and delete active saved routes
      without deleting historical audit.
- [ ] Tests cover automatic route, review route, save-and-continue, domain
      default confirmation, route deletion, and pending email resume.

## Blocked by

- .scratch/inngest-durable-workflow-executor/issues/09-resend-body-attachments-support-routing.md
