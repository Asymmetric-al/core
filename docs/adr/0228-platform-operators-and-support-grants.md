# ADR-0228: Platform operators, the one script that lists them, and support grants as their own request context

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).
The limits on a support grant (read-only, no care records, 15 minutes with a
60-minute ceiling) are the plan section 15.1 default taken under the
implementation record (D-06), not a fresh owner ruling.

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

A `super_admin` profile role and the `is_super_admin()` branch on 151 policies in
the development database let a platform role see every tenant's data, and
Payload carries an unscoped role of its own (audit NA-07). No second factor is
enrolled in either hosted project, and TOTP is switched off in the repository's
Auth configuration (B06, NX-09). The accepted identity-and-access contract bounds
an operator by an audited, purpose-bound, time-boxed tenant grant and forbids
manufacturing a member assignment for every principal; the Phase 12 PRD lists the
operator tenant grant as a context of its own.

## Decision

1. **An operator list replaces `super_admin`.** `authz.platform_operators` has
   row security forced and no privilege for signed-in or anonymous users. Being
   on it lets a person run platform commands and grants no tenant data access by
   itself. Every `is_super_admin()` policy branch is removed, and the assistant
   runtime's platform gates move to the list.
2. **The list has one writer: an idempotent script** that the release job's
   owner runs to add or remove an operator. It writes an `audit_logs` row with no
   tenant, naming the acting person and a reason, and refuses to remove the last
   operator. There is no platform command, wrapper or screen for managing
   operators.
3. **Operators must have a second factor.** WP2c switches TOTP on and builds the
   enrolment and challenge screens. Every platform command checks the operator
   list and the session's MFA assurance level inside the function, through one
   shared check.
4. **A support grant is a record of its own, never a membership.**
   `authz.support_grants` holds the operator, the tenant, the reason, who granted
   it, `expires_at` and `ended_at`. The grant command is a platform command with
   MFA. It requires a reason and caps the duration; the tenant's administrators
   see live grants on a screen. A grant is over when it expires or the same
   command ends it early. Each grant is a new record, so earlier ones stay as
   history.
5. **A grant is its own request context.** The assignment header names the grant.
   `authz.current_tenant_id()` and one staff-read helper admit it only when the
   request selects it, it is unexpired and unended, and the caller is still on the
   operator list. It never combines with a membership the same person holds in
   that tenant. The resolver returns it as an operator-grant context, and the
   registry gives that context one read-only bundle (proposed:
   `admin.dashboard.access` and `admin.reports.view`).
6. **A grant reads and never writes.** No insert, update or delete policy calls
   the staff-read helper, which the catalog gate asserts; the staff check and the
   general membership check are not edited and refuse a grant; and no governed
   command admits one. Care records and a restricted worker's identity are outside
   it in the first release.
7. **A compromised login is locked, not deleted.** An operator bans it through
   the Auth admin module from the operator area, with a reason and an
   `audit_logs` row with no tenant.

## Consequences

- WP2c prepares the read policies (the staff-read helper equals the staff check
  for now) and WP10 adds the grant and its request context.
- A tenant left without an administrator is repaired by a platform command that
  issues an administrator invitation with a reason.
- ADR-0174's Engine Diagnostics Session is deferred; the support grant is the
  first release's only operator access to tenant data (ADR-0174 amendment of
  2026-11-17).

## Source

- [Plan, section 5.4](../audits/core-crm-cms-database-target-architecture.md#54-policies-and-commands)
  and [section 5.5](../audits/core-crm-cms-database-target-architecture.md#55-revocation-sensitive-data-and-operators)
- Work packages WP2c and WP10
- Related: [ADR-0174](0174-single-staff-access-authority-and-governed-engine-diagnostics.md),
  [ADR-0224](0224-caller-token-server-lanes-and-sql-commands.md),
  [ADR-0227](0227-one-policy-pattern-and-the-carried-tenant.md)
