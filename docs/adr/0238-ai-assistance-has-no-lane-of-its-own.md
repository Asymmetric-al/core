# ADR-0238: An AI assistant has no lane of its own; it acts on the token and tenant of the person it serves

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

The accepted platform intent bounds an AI assistant by the authority of the user
who initiates it, and makes its effects wait for that person's approval
(`platform-boundaries`, "AI Assistant Authority Is Bounded By The Initiating
User"; `platform-product-intent`). The assistant runtime is disabled by default
today, and it has service-key call sites and SQL functions that read
`profiles.tenant_id`, which this plan removes.

## Decision

1. **No assistant lane.** An assistant reads and acts on the token and the active
   tenant and assignment of the person it serves, through the same policies and
   the same command functions as that person.
2. **A prepared effect waits for that person's approval** before the command is
   called, and the effect is attributed to that person. The database sees only
   that person's command.
3. **The assistant's platform gates move to the operator list** (ADR-0228); its
   service-key call sites and `profiles.tenant_id` readers are classified and
   moved in WP4b.

## Consequences

- The database cannot see that a prepared effect waited for approval; that
  remains enforced by the application only (ADR-0227).
- The first release builds this authority lane and no assistant feature, and does
  not switch the runtime on (council record C.8, reservation 11).

## Source

- [Plan, section 5.3](../audits/core-crm-cms-database-target-architecture.md#53-what-enforces-the-boundary-by-caller)
  and [section 5.4](../audits/core-crm-cms-database-target-architecture.md#54-policies-and-commands)
  ("AI assistance has no lane of its own"), principle PR14 in
  [section 2](../audits/core-crm-cms-database-target-architecture.md#2-product-and-architectural-principles)
- Work package WP4b
- Related: [ADR-0224](0224-caller-token-server-lanes-and-sql-commands.md),
  [ADR-0228](0228-platform-operators-and-support-grants.md)
