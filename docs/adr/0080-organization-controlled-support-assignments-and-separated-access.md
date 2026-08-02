# Organization-controlled Support Assignments with separated access

**Status:** Accepted (founder ruling, Phase 21 grill session — D19)

## Context

A Field Account must survive changes in the people associated with its ministry
purpose. A person-owned model fails for couples, teams, participant-free
projects, departures, and one person serving in several ministries. A
household-owned model turns a recognition relationship into financial and
security authority. A polymorphic `owner_type + owner_id` makes those meanings
mutable and prevents exact lifecycle, access, and history guarantees.

Participation also cannot safely imply login access, claimant or approver
authority, compensation/payee identity, donor-purpose authority, notification
eligibility, or money movement. Those truths have different owners, dates,
privacy floors, revocation behavior, and recovery paths. Combining them behind
a friendly **Share account** action would make the common spouse/team workflow
easy to start but unsafe to understand, revoke, or audit.

The repository has additional concrete hazards. Phase 12's Tenant-wide
membership foundation and current role/profile-based missionary portal are not
Support-Assignment authorization. `public.support_assignments` already names a
Support Hub conversation-routing table. The current Teams and notification
screens are prototypes, and service-role access bypasses RLS. D19 therefore
needs one durable subject and one low-friction experience without adding a
second authorization system or pretending the required foundations already
exist.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one immutable,
> organization-controlled, Tenant- and Legal-Entity-scoped Support Assignment
> as the canonical Field Account subject, with one Field Account per Support
> Assignment and ISO currency; zero-to-many prospective, effective-dated,
> append-only-corrected Support Assignment Participant Memberships; and
> separately authoritative Phase 12 principal-bound Workspace Access, D10/D13
> operational responsibility, and recipient-scoped Support Workspace
> Notification Preference Versions.
> One quiet “People & access” experience may commit the explicitly selected
> local truths and outbox intent through tenant-configurable safe presets and
> one literal consequence review, while every spouse, teammate, leader, coach,
> and staff member retains a separate Party, login principal, invitation,
> access, claimant, responsibility, and preference identity. Participant-free
> projects, shared couples/teams, separate spouse assignments, several
> assignments per person, scoped leadership, mobile-complete invitation and
> recovery, deny-first revocation, life-event succession, exact per-assignment
> and ISO-currency navigation, composite Tenant/Legal-Entity scope, coarse
> forced RLS, server-only projections through the sole Phase 12 PDP, signal-only
> Realtime, append-only evidence, and production-shaped isolation, concurrency,
> performance, privacy, and accessibility proof are mandatory—without person-
> or household-owned funds, shared credentials, implicit spouse/team/leader
> access, relationship-based authorization, broad account sharing, a Phase 21
> ACL engine, assignment-aware RLS, JWT grant lists, client-trusted scope, raw
> financial `postgres_changes`, destructive merge, cascade deletion, stale
> notification eligibility, or participation-driven money movement.**

### Domain and authority

A **Support Assignment** is the immutable organization-controlled subject of an
approved field purpose. It belongs to exactly one Tenant and Legal Entity.
Exactly one Field Account may exist per `Tenant × Legal Entity × Support
Assignment × ISO currency`; D6 sibling currencies remain separate. A Support
Assignment may have zero, one, or many participant Parties, and one Party may
participate in several Support Assignments. Participant count and identity
never enter balance arithmetic.

A **Support Assignment Participant Membership** records only one Party's
association during one exact half-open interval. It is prospective,
effective-dated, source- and actor-evidenced, and append-only corrected.
Duplicate/overlapping intervals are rejected. It grants no access, operational
responsibility, notification, donor-purpose authority, ownership, or financial
effect.

Four truths remain independently authoritative:

1. Phase 21 owns participant membership.
2. Phase 12's sole Policy Decision Point owns principal-bound, request-time
   Support Workspace authorization under the current Active Tenant Assignment,
   purpose, projection, capability, Legal Entity/Support Assignment scope,
   floor, and governance epoch.
3. Existing owner domains retain operational responsibility: D10/D13 own
   expense claimant, submitter, reviewer, and approval-route truth; D4 and its
   exact external Engagement Authority source own compensation/payee identity;
   Phase 28 owns support-raising coaching and task truth; Phase 12 owns current
   capabilities. Participation supplies none.
4. Phase 21 owns the prospective Tenant-, Legal-Entity-, recipient-, Support-
   Assignment-, purpose-, event-family-, channel-, half-open-interval-scoped
   **Support Workspace Notification Preference Version**. Phase 6 owns intent,
   dispatch, provider outcome, suppression, and communication history. Delivery
   re-proves current access, purpose, preference, and contact eligibility before
   release.

One orchestration may commit explicitly selected local facts plus an outbox
intent, but their records, state machines, evidence, and recovery do not merge.
External invitation delivery cannot be atomic with local database truth. A
delivery failure preserves the local facts and creates a recoverable exception;
a pending or failed invitation grants nothing.

### D19 interpretation of earlier Phase 21 terminology

D19 narrows earlier terms without changing ratified behavior:

- D1 `worker/payee` applies only to person-specific expense, compensation,
  handoff, and payment truth. A Field Account is keyed by Tenant, Legal Entity,
  Support Assignment, and ISO currency; a participant/payee may be absent and
  never enters its arithmetic.
- D3 worker-classification and lifecycle-stage selectors are explicit,
  prospective assessment-applicability inputs. They never derive from live
  Support Assignment Participant Membership joins.
- D7 and D15 participant identifiers are external provider participant/payee
  references.
- D8's former feed participant is the Missionary Support Feed Subject: one
  exact Support Assignment, separate from the recipient and any Party
  participant.
- D11's former participant/control language means Field-Account-side and
  organization-control-side.
- D18's travel participant is the source-owned claimant Party.

### Naming and data isolation

**Support Assignment** is not Phase 12's **Active Tenant Assignment**, which is
the principal's selected Tenant membership/security context. Phase 21 uses
`support_assignment_id`; an implementation must not expose a bare
`assignment_id` whose meaning is ambiguous. Existing
`public.support_assignments` remains Support Hub routing. The Phase 21 physical
namespace is Field-Accounts-specific, such as `field_support_assignments`.

Every child relation repeats Tenant and Legal Entity keys and enforces
same-scope composite foreign keys. Native uniqueness/exclusion constraints,
scope-complete idempotency, consistent locks/CAS, and `ON DELETE RESTRICT`
protect intervals, invitations, grants, subscriptions, and preserved evidence.
Party merge and life events never union permissions or rewrite history.

Every D19 table enables and forces RLS, but RLS remains Phase 12's coarse Tenant
isolation backstop. It contains no participant-, spouse-, leader-, principal-,
capability-, purpose-, projection-, field-, or Support-Assignment-aware logic.
Raw tables and current internal projections remain browser-inaccessible. Every
user-facing route, mutation, job, export, repair, and notification invokes the
sole Phase 12 `resolveProjection` path and verifies exact target scope before
enumeration or change. Service/secret keys and `BYPASSRLS` roles repeat those
checks because RLS bypass is not user authority.

Fine-grained grants do not live in JWT arrays, `user_metadata`, cookies, URL
state, or client selectors. Realtime is private and signal-only: an opaque
resource/version notification triggers an authorized server refetch. Raw
financial, membership, access, responsibility, and preference tables never use
client-facing `postgres_changes`.

### Product experience and lifecycle

Authorized staff use one quiet **People & access** surface with separately
reviewed choices:

- **Associated with this support balance**;
- **Can use the Support Workspace** or **No workspace access**; and
- **Gets updates** or **No notifications**.

Responsibilities are shown separately when applicable. Tenant-safe presets may
preselect an ordinary combination, but compile to exact Phase 12 grants and
explicit preference versions; their labels never authorize. One literal review
states what changes and what does not across participation, access,
responsibilities, notifications, and money/history. The ordinary result says
**No balance moves. No closed history changes.** D5 alone owns financial
reallocation or succession.

Every spouse, teammate, leader, coach, and staff member retains separate Party,
principal, invitation, access, claimant, responsibility, and preference
identity. Invitations are exact-recipient, expiring, single-use, revocable, and
mobile-complete. Revocation is deny-first and invalidates the governance epoch,
server access, cache and queued-notification eligibility before disclosure.
Reactivation never revives revoked grants or preferences.

Multi-assignment navigation always identifies Support Assignment, Legal Entity
when needed, and ISO currency. No authoritative combined balance exists. Stale
or unauthorized deep links fail uniformly without revealing whether the prior
assignment exists.

Life-event changes show separate consequences and unresolved follow-up for
participation, access, responsibility, notification, and D5 financial
succession. Emergency safety removal may revoke access before a prospective
participant end and does not require the affected person to consent.

**Phase 21 D24 precision amendment (2026-08-02).** A Support Assignment
Participant Membership, spouse/household/team/manager relationship, Support
Workspace grant, notification preference, or `People & access` orchestration
never creates, scopes, retargets, or succeeds to an Expense Collaboration
Assignment. D24 uses its own exact stable-Expense-Claim assignment and
authority-free invitation versions, separately accepted by the verified helper
principal and separately authorized by Phase 12. Existing
`public.support_assignments`, Support Assignment participant rows, broad roles,
and relationship edges are not D24 migration or grant sources.

Participant or relationship succession may trigger review or deny-first
fencing under tenant policy, but it never rewrites D24 history or automatically
appoints a spouse, teammate, helper, leader, manager, household member, or
successor participant. Helper/claimant offboarding, death/incapacity, leave,
Party merge/split, principal relink, Legal Entity change, classification
change, and tenant deactivation preserve exact provenance and route unresolved
drafts to an explicitly authorized disposition; they never infer claimant,
reviewer, payee, payment, or accounting authority.

## Consequences

- Singles, couples, teams, projects, scoped leaders, participant-free purposes,
  and several assignments per person use one consistent Field Account model.
- The ordinary one-worker setup remains one short reviewed action, while
  advanced access stays in Phase 12 rather than becoming Phase 21 bureaucracy.
- The implementation needs several explicit relations instead of one broad
  account-sharing flag; that cost buys independently correct privacy,
  revocation, lifecycle, and audit behavior.
- Phase 3/4/9/10/12 identity and authorization foundations must be
  production-proved before D19 access ships. Phase 21 does not compensate for
  a missing membership/PDP runtime with client filters or a new ACL.
- The final migration chain must be proved to create safe tenant membership and
  Active Tenant Assignment onboarding through `handle_new_user()` before D19
  access ships. Seed data and signup metadata are not substitutes.
- Release proof includes database catalog/pgTAP checks, API/PDP isolation,
  concurrency races, production-cardinality query plans, authenticated spouse/
  team/project/life-event journeys, notification revocation, and WCAG 2.2 AA
  keyboard, screen-reader, focus, reflow, zoom, target-size, and mobile tests.

## Rejected alternatives

- person-, worker-, login-, household-, or team-owned Field Accounts;
- polymorphic owner references or participant-count-driven arithmetic;
- shared credentials, broad **Share account**, or implicit spouse/team/leader
  access;
- relationship-derived claimant, approver, compensation, payee, or notification
  authority;
- one mutable membership/access/preference record or destructive Party merge;
- Phase 21-local ACL/RBAC/ReBAC, assignment-aware RLS, or fine grants in JWTs;
- client-trusted Support Assignment scope or service-key-as-authorization;
- cascade deletion, rewritten history, or people changes that move money; and
- raw financial or membership `postgres_changes` streams.

## Related decisions

- [ADR-0062 — Finance-closed Field Account cycles](./0062-finance-closed-field-account-cycles.md)
- [ADR-0066 — Organization-authorized support reallocation and exit disposition](./0066-organization-authorized-support-reallocation-and-exit-disposition.md)
- [ADR-0067 — Proof-gated parallel currency Field Accounts](./0067-proof-gated-parallel-currency-field-accounts.md)
- [ADR-0071 — Claim-level expense truth and purpose-routed tenant AI](./0071-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0074 — Bounded prospective Expense Governance Profiles](./0074-bounded-prospective-expense-governance-profiles.md)
- [ADR-0078 — Reconciled Field Account opening position and operational cutover](./0078-reconciled-field-account-opening-position-and-operational-cutover.md)
- [Phase 12 role and permission configuration](../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md)
