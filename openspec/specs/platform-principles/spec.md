# Platform Principles And Decision Criteria

## Purpose

Provide durable **decision criteria** for product-facing and cross-cutting
engineering choices. This spec is the “when in doubt” layer for intent.

Day-to-day tooling, lint rules, and stack-specific procedures remain in
`AGENTS.md`, `docs/ai/rules/*`, and canonical skills under `docs/ai/skills/*`.

## Requirements

### Requirement: Multi-Tenant Safety First

The platform SHALL treat tenant isolation and permission correctness as
non-negotiable. User-visible behavior MUST NOT leak data across tenants or roles.

#### Scenario: A shortcut would skip permission checks

- WHEN implementation could skip RLS, role checks, or boundary validation for
  speed
- THEN the approach is rejected or redesigned
- AND sensitive paths are covered by tests or verification appropriate to the
  risk

### Requirement: Respect User Time And Context

The platform SHALL prefer progressive disclosure, sensible defaults, and
recoverable flows over dense configuration or one-size UI for every persona.

#### Scenario: Admin vs missionary complexity

- WHEN a workflow could live in Mission Control or the missionary app
- THEN Mission Control owns operational depth; missionary surfaces stay focused
  unless `openspec/specs/platform-surfaces/spec.md` or this spec is updated

### Requirement: Honest UX Around Money And Identity

The platform SHALL surface payment and account state clearly, avoid dark
patterns, and use plain language for errors, permissions, and compliance-related
artifacts.

#### Scenario: Payment or PII edge cases

- WHEN a flow touches Stripe, receipts, pledges, or credentials
- THEN copy and UI states reflect real outcomes (pending, failed, partial), not
  optimistic placeholders

### Requirement: Shared Behavior Lives In Shared Packages

Cross-cutting behavior that applies to more than one app SHALL live in
workspace packages (for example `@asym/ui`, `@asym/api`, `@asym/auth`) rather
than duplicated app logic, unless a documented exception applies.

#### Scenario: Two apps need the same rule

- WHEN the same business rule appears in two `apps/*` trees
- THEN the agent or author consolidates toward packages or a single module with
  clear ownership

### Requirement: Accessibility And Performance Are Part Of UX

The platform SHALL treat accessibility, perceived performance, and resilience as
product requirements, not optional polish.

#### Scenario: Shipping a visually rich feature

- WHEN adding charts, feeds, tables, or animations
- THEN keyboard, screen reader, and loading states are considered in the same
  change unless explicitly out of scope in an OpenSpec change

### Requirement: Durable Docs Stay Aligned

When durable behavior or intent changes, the author SHALL update OpenSpec and
any user-facing or agent-facing docs that restate the same contract.

#### Scenario: Product intent shifts

- WHEN this spec or sibling platform specs change
- THEN related references in `openspec/project.md` or architecture guides are
  reviewed in the same effort
