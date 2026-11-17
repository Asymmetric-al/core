# ADR-0226: One release job per environment, an environment marker, and repair rather than reset

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

The hosted databases have drifted from source, one carries a schema-push marker,
and production deploys through Vercel's Git integration outside any workflow, so
an application can deploy before its migrations (audit D02, D03, NR-42). The
hosted seed script decides whether it may run by comparing URLs (NA-03). The
plan's decision 6 (section 11.2) is to take a census, then rebuild from source.

## Decision

1. **One release job per environment, in fixed order:** Supabase migrations;
   Payload migrations; catalog gates (tenant-table RLS, grants, cross-schema name
   collisions, and a schema fingerprint compared with CI's fresh replay); write
   the expected migration heads; deploy the applications. The job is the only
   holder of migration credentials.
2. **Production deploys through the job.** The job stages a production-target
   deployment of each application without assigning the production domains,
   checks its health route against the migration heads, and promotes it without
   a rebuild. Vercel's Git deployment of production is switched off in the same
   change.
3. **Health checks gate promotion.** Each application compares the heads it was
   built against with the expected heads, read through one read-only function,
   and blocks promotion when the database is behind. A database that is ahead
   passes, so an application can be rolled back after a migration. Every
   migration is therefore safe for the release already running: expand first,
   contract in a later release.
4. **Previews with migrations use one `preview` project** that carries the
   `disposable` marker. Its rebuild, the deployment that uses it and its smoke run
   are one job in a repository-wide concurrency group with no cancellation. It
   never touches development.
5. **A one-row environment marker** records whether a database is `disposable`,
   `shared` or `production`. The migration creates it as `disposable`. It changes
   only through a manually dispatched step of the release job, on the owner's
   approval, and only forward. A database with no marker counts as not
   disposable. Seed and reset scripts read the marker and refuse anything but
   `disposable`.
6. **Reset only where the marker says `disposable`; elsewhere, repair.** Repair
   means forward migrations through the release job with both ledgers matching
   source. Before any approved reset, each item the owner marked as kept has an
   export, a byte inventory of its files, a restoration mapping and
   reconciliation criteria; without a tested way to bring it back, the reset does
   not run. Resetting an environment is not tenant offboarding.
7. **The first rebuild of each hosted database is a named one-off step of the
   job** that takes the census sign-off as its input, because neither hosted
   database has a marker today.

## Consequences

- Development is rebuilt from source only after the owner signs off the census
  (implementation record, D-01). Its marker stays `disposable` until the WP9
  journey passes, then becomes `shared`. A new or rebuilt production database is
  set to `production` only at the end of WP11, which waits for the owner (D-02).
- Until WP11, the deployments the job promotes use the development database.
- Until WP6 replaces the prototype, the name-collision gate carries one recorded
  exception for `cms.tenants`.
- The council's reservations stand: the plan does not yet say what migrates
  development once production has its own database, names no runner for
  scheduled work, and gives the job no step that registers job functions once
  Git deployment is off (council record C.8, reservation 7). Each is for the
  package that meets it to settle.

## Source

- [Plan, section 7.4](../audits/core-crm-cms-database-target-architecture.md#74-one-release-job-per-environment)
  and [section 7.5](../audits/core-crm-cms-database-target-architecture.md#75-environment-marker-and-reset-policy)
- Work package WP1 (slices WP1.1, WP1.3, WP1.5 and WP1.7) and WP11
- Related: [ADR-0179](0179-census-gated-clean-target-and-one-authority-pre-production-replacement.md),
  [ADR-0225](0225-database-roles-per-runtime.md)
