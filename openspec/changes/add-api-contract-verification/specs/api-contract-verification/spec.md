# Spec Delta

## Purpose

Verify on a disposable migrated database, in CI, that application reads match
the schema as the Supabase Data API serves it and that the Data API never
returns one tenant's rows to another tenant or to an anonymous caller.

## ADDED Requirements

### Requirement: The check serves the migrated database the way the Data API does

The API contract check SHALL build its database the way the `migrate` job does
(compat bootstrap, every forward migration, the demo seed) and SHALL serve it
through PostgREST with the exposed schemas and row cap that
`supabase/config.toml` declares. Its setup MUST NOT change any migration, seed,
policy or grant that the product ships.

#### Scenario: A read names a schema the Data API does not expose

- **GIVEN** application code queries a schema missing from the declared exposed schemas
- **WHEN** the check executes that query
- **THEN** the check fails and names the schema and the query's source location

#### Scenario: A read spans more rows than the row cap

- **GIVEN** the declared row cap is 1,000
- **WHEN** the check issues a read that matches more rows
- **THEN** PostgREST returns at most the declared cap, as the hosted Data API does

### Requirement: Every resolvable application select runs against the migrated schema

The check SHALL execute every `.select(...)` in `packages/api/src` whose table
and select string can be resolved from the source without running it. A select
that names a column, relationship embed or table the migrated schema lacks MUST
fail the check with its source file and line, table, select string and the Data
API's error. Selects it cannot resolve SHALL be listed, not silently dropped.

#### Scenario: A select names a column no migration creates

- **GIVEN** a select string includes a column that no migration creates
- **WHEN** the check runs
- **THEN** it fails and reports the file and line, the table, the select string and the missing column

#### Scenario: A select embeds a relationship that does not exist

- **GIVEN** a select string embeds a related table through a foreign key that does not exist
- **WHEN** the check runs
- **THEN** it fails and reports the relationship that could not be found

#### Scenario: A select cannot be resolved statically

- **GIVEN** a select string is built at run time
- **WHEN** the check inventories the selects
- **THEN** it reports that select as unresolved with its location and does not count it as verified

### Requirement: Application read paths return only their own tenant's rows

The check SHALL run real application read functions with a real Data API
client against a database holding at least two tenants. It MUST assert on the
rows returned, not only on the absence of errors, and MUST fail when any
returned row belongs to a tenant other than the one requested.

#### Scenario: A portal read for one tenant's missionary

- **GIVEN** two tenants each have a missionary with tasks and donors
- **WHEN** the portal read runs for the first tenant's missionary
- **THEN** it returns that tenant's rows and no row of the second tenant

### Requirement: Signed-in users read no other tenant's rows through the Data API

For every table in the exposed schemas that carries a tenant column, the check
SHALL read as a signed-in user of each tenant, using tokens it mints for that
run, and MUST fail when a row of another tenant is returned. A read refused for
lack of privilege counts as no rows. The check MUST prove that its tokens reach
the database as the intended user before it treats empty results as evidence.

#### Scenario: A policy admits another tenant's rows

- **GIVEN** a policy on a tenant table admits rows of any tenant to signed-in users
- **WHEN** the check reads that table as a user of the other tenant
- **THEN** it fails and names the table, the caller's tenant and the leaked rows' tenant

#### Scenario: Tokens do not reach the database as the user

- **GIVEN** a minted token is not resolved to its user by the database
- **WHEN** the check verifies the caller before the isolation sweep
- **THEN** it fails instead of reporting empty reads as isolation

### Requirement: Anonymous callers read no tenant rows outside ruled public reads

The check SHALL read every tenant table through the Data API without a user
token and MUST fail when rows come back from a table that no owner ruling makes
publicly readable. The ruled public reads SHALL be listed in one place, each
with the ruling or document that allows it.

#### Scenario: An anonymous read of a tenant table returns rows

- **GIVEN** a tenant table is not on the ruled public-read list
- **WHEN** the check reads it anonymously and rows come back
- **THEN** it fails and names the table and the number of rows returned

### Requirement: The check is advisory and safe for forks

The check SHALL run as its own workflow on pull requests and on the default
branch, MUST NOT be a required status check until the owner promotes it, MUST
hold read-only repository permissions, MUST pin every action and image by
digest, and MUST NOT use repository secrets.

#### Scenario: A pull request from a fork

- **WHEN** the workflow runs for a pull request from a fork
- **THEN** it runs with no repository secrets and read-only permissions
