# ADR-0225: One database role per runtime, and one migration owner per schema

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

Payload connects today with a privileged database role and can push schema
changes. Application runtimes can hold the `postgres` connection string, and
`PAYLOAD_DATABASE_URI` falls back to `SUPABASE_DB_URL`. Two writers of one schema,
and a runtime that can change schema, are how the hosted databases drifted from
source (audit D02, D03, NA-04). One database is kept on purpose: a separate CMS
database would give up the single recovery point that content and operational
rows share (plan section 11.1).

## Decision

1. **One database, one migration owner per schema.**

   | Schema                        | Owner role                 | Changed by              | Reachable through the Data API                 |
   | ----------------------------- | -------------------------- | ----------------------- | ---------------------------------------------- |
   | `public`                      | `postgres`                 | Supabase SQL migrations | Yes, with RLS forced on every tenant table     |
   | `authz`                       | `postgres`                 | Supabase SQL migrations | No; through definer functions                  |
   | `tenant_guard` (command)      | non-login, non-bypass role | Supabase SQL migrations | Through listed wrappers only                   |
   | `cms`                         | `cms_owner`                | Payload migrations only | No; usage revoked from `anon`, `authenticated` |
   | `platform`                    | `postgres`                 | Supabase SQL migrations | Only through `public` wrappers                 |
   | `private`                     | `postgres`                 | Supabase SQL migrations | No; through definer functions                  |
   | `auth`, `storage`, `realtime` | Supabase                   | Supabase                | As Supabase defines                            |

2. **One role per runtime.** Browser collections and server handlers acting for
   a person use `authenticated` or `anon` on the caller's token. Tenant commands
   run as the guard role. Platform commands are `postgres`-owned definer
   functions in `platform`. Jobs, webhooks, public gift intake and publish
   fulfilment use `service_role` only to call system-entry commands. The
   platform lane uses `service_role` directly, from a frozen allowlist that only
   shrinks. Payload's runtime connects as `cms_runtime`, which may read and
   write rows in `cms`, cannot change schema, reaches nothing outside `cms` and
   has a connection limit. Payload's migrations run as `cms_owner`, from the
   release job only, with no right outside `cms`. Core migrations run as
   `postgres`, from the release job only.
3. **No application runtime holds `postgres` or the migration connection
   string.** `PAYLOAD_DATABASE_URI` becomes mandatory and the fallback to
   `SUPABASE_DB_URL` is deleted.
4. **Three independent stops prevent a second schema writer:** schema push is
   hard-coded off unless the database host is loopback; `cms_runtime` cannot
   create or alter anything; and the CLI wrapper keeps refusing to migrate over a
   schema-push marker.
5. **The command schema keeps the name and owner role `tenant_guard`**, so the
   catalog gate's exemption for that owner still applies. The catalog gate's
   schema list gains `platform`.

## Consequences

- Payload is confined to `cms`. Row isolation inside `cms` stays in Payload's
  access functions, through one factory and two ports; that is the stated
  application-enforced exception (ADR-0227).
- The release job sets the two CMS role passwords from its secrets after the role
  migration, and the restore runbook resets them, because a migration cannot
  hold them and daily backups do not keep custom role passwords.
- Existing gates move with the design: the catalog gate, the service-key gate,
  the field-policy census and the frozen acceptance suites each change in the
  package that replaces their seam (plan section 7.1).
- Custom login roles through the pooler and Payload start-up as `cms_runtime`
  are WP1 platform proofs (plan section 15.2).

## Source

- [Plan, section 7.1](../audits/core-crm-cms-database-target-architecture.md#71-who-owns-what),
  [section 7.2](../audits/core-crm-cms-database-target-architecture.md#72-database-roles-by-runtime)
  and [section 7.3](../audits/core-crm-cms-database-target-architecture.md#73-preventing-a-second-schema-writer)
- Work package WP1 (slices WP1.1 and WP1.2 in the implementation record)
- Related: [ADR-0224](0224-caller-token-server-lanes-and-sql-commands.md),
  [ADR-0226](0226-one-release-job-environment-marker-and-repair-not-reset.md),
  [ADR-0178](0178-payload-v4-major-line-commitment-and-release-bound-production-admission.md)
