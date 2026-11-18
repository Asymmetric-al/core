# ADR-0224: Human server work runs on the caller's token, and governed writes are SQL commands

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688),
tracking issue [#2671](https://github.com/Asymmetric-al/core/issues/2671)).

This records target intent. It does not say that anything is built. What exists,
and what has been verified, is recorded only in the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

Most server reads and writes run with the Supabase service key today, and tenant
isolation depends on each handler adding the right filter. The audit counted more
than 180 service-role call sites. The existing `tenant_guard.enter()` takes a
tenant argument from its caller and stops a query from spilling across tenants,
but it does not check that the person behind the request belongs to that tenant.
The council weighed three server lanes: keep the service key and wrap it with a
tenant filter; a per-request `pg` connection under row-level security; and the
caller's own token with SQL command functions. It chose the third (plan, decision
3 in section 11.2).

## Decision

1. **Server work for a signed-in person runs on that person's token.** A server
   handler, Web Studio's Core calls and an AI assistant acting for a person use
   the caller-token client. The same row-level security that protects the
   browser protects the server.
2. **Governed writes are SQL command functions.** Money, memberships, audit,
   care, consent and Support Hub audit tables have no insert, update or delete
   grant for signed-in users. A command re-checks in the database the caller's
   membership, role class and the capability the action needs, requires a reason
   where the plan says so, applies the tenant's approval policy, and commits
   every row of the operation together. Only explanations, confirmation prompts
   and routing stay in application code.
3. **Tenant commands are definer functions owned by the guard role.** The owner,
   `tenant_guard`, cannot bypass row security. A human command reads the caller
   from the session and the assignment from the request's assignment header, and
   only then sets the tenant for the transaction.
4. **Human and worker entry points are separate.** A worker command is
   executable only by the service key, takes no tenant from its caller, and is
   reached through a wrapper that derives the tenant from a stored anchor (a
   provider event's account, a gift, a publish intent, an import batch, or the
   Site or donor-portal host record for intake). The guard-owned function reads
   the anchor again under its own policy and refuses if the two disagree.
   Deferred work whose writes were not decided when the person acted stores that
   person's assignment and resolves it again before it writes.
5. **Two named system entries complete a person's or a visitor's request.** Gift
   intake from the public site derives the tenant from the Site row or the
   donor-portal host record and accepts no tenant argument (ADR-0236 adds its
   abuse controls). Publish fulfilment acts only on an intent that the
   publisher's own token recorded (ADR-0229).
6. **Commands that cross tenants live in a `platform` schema.** Provisioning,
   tenant status, support grants, an administrator invitation for a tenant that
   has none, a domain's attachment steps, closing an account and the tenant
   export are `postgres`-owned definer functions in `platform`, each checking the
   operator list and the MFA session level through one shared check (ADR-0228).
   Closing an account is the exception: its caller is the account's owner
   (ADR-0239).
7. **The service key shrinks to a frozen platform allowlist.** `withOperation`
   gives out only the caller-token client. A separate platform wrapper carries
   the service key and is the only thing the allowlist gate counts. The plan
   names two additions to the allowlist: one storage module for media, receipt
   and import bytes, and one Auth admin module.
8. **Every command function has a fixed search path, and `PUBLIC` execution is
   revoked in the transaction that creates it.** The catalog gate checks every
   definer function, including those owned by the guard role.

## Consequences

- Policies must be written for tables the server reads with the service key
  today, and governed business steps move into SQL.
- No `pg` pool and no second data stack are added to the three serverless apps.
- Under row-level security a broken read returns an empty list, not an error, so
  every handler that moves gets a two-tenant test.
- What the database does not check is stated in ADR-0227 and in the plan's
  section 5.3: row isolation inside `cms`, which Site a public gift arrived on,
  that fulfilment content is the serialized form of the versions named, and that
  an assistant's prepared effect waited for approval.
- If hosted Supabase refuses the guard role use of the `auth` schema, a command
  reads the caller from the request's claims setting instead. The WP1 platform
  proof decides which (plan section 15.2). A failed platform proof with no named
  fallback stops its package and returns to the owner. Settled on 2026-11-17;
  see the amendment below.

## Amendments

### 2026-11-17: the guard reads the caller from the request's claims settings (AL-2674)

The fallback of the last consequence applies. On Supabase's own Postgres image
`postgres`, which runs the migrations, is not a superuser and holds USAGE on
`auth` and EXECUTE on `auth.uid()` and `auth.jwt()` without the grant option,
so a grant of them to `tenant_guard` only warns and grants nothing; the local
stack would not start, and a hosted rebuild would fail the same way. So the
guard holds nothing on `auth`. `tenant_guard.caller_id()` reads the caller from
the request's claims settings with the precedence and the result of the
installed `auth.uid()`, `tenant_guard.request_claims()` returns the claims as
`auth.jwt()` does, and the guard's membership policy and the platform operator
check use them. The catalog gate fails any function in `tenant_guard` or
`platform` that names `auth`. The cost is one more place that knows how
PostgREST hands a request's claims to the database; the tests compare it with
`auth.uid()` case by case. See docs/security/tenant-guard.md, "What the guard
role holds".

## Source

- [Plan, section 5.3](../audits/core-crm-cms-database-target-architecture.md#53-what-enforces-the-boundary-by-caller),
  [section 5.4](../audits/core-crm-cms-database-target-architecture.md#54-policies-and-commands),
  [section 7.2](../audits/core-crm-cms-database-target-architecture.md#72-database-roles-by-runtime)
  and [decision 3 in section 11.3](../audits/core-crm-cms-database-target-architecture.md#113-reasoning-on-the-decisions-that-mattered-most)
- Work packages WP1 (command schema), WP4a and WP4b (server lanes), WP8 (money
  commands)
- Related: [ADR-0214](0214-path2-tenant-isolation-with-shared-native-credential.md),
  [ADR-0225](0225-database-roles-per-runtime.md),
  [ADR-0227](0227-one-policy-pattern-and-the-carried-tenant.md),
  [ADR-0238](0238-ai-assistance-has-no-lane-of-its-own.md)
