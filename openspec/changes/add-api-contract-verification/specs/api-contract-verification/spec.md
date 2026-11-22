# Spec Delta

## Purpose

Verify on a disposable migrated database, in CI, that application reads match
the schema as the Supabase Data API serves it and that the Data API never
returns one tenant's rows to another tenant or to an anonymous caller, and
report exactly which tables each run proved that on.

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

- **GIVEN** the declared row cap is N and one tenant holds N + 1 rows in a table
- **WHEN** the check reads those rows through the Data API
- **THEN** exactly N rows come back while the exact count reports N + 1, and the check fails if the served cap differs from the declared one

#### Scenario: The migrate step reads an earlier commit

- **GIVEN** the migrate chain's field-policy census reads a pinned base commit with `git show`
- **WHEN** the workflow checks out a pull request
- **THEN** its checkout holds full history, as the `migrate` job's does

### Requirement: The harness touches only the disposable stack it started

The harness MUST use the shared loopback URL check, require an explicit login
and database name, refuse routing and password query parameters, and bind the
served API to loopback. It MUST verify a `disposable` marker before seeding or
writing PostgREST setup SQL. The marker read and both writes MUST use the
same target, discard ambient PostgreSQL routing settings, and keep passwords
out of process arguments.

#### Scenario: A query parameter overrides the database target

- **GIVEN** a PostgreSQL URL whose hostname is loopback and whose query overrides the host, port, database, or login
- **WHEN** the harness seeds or prepares the database
- **THEN** it refuses before connecting

#### Scenario: A database is shared or its marker cannot be read

- **GIVEN** a loopback database with no readable `disposable` marker
- **WHEN** the harness seeds or prepares it
- **THEN** it refuses before running any write SQL

### Requirement: The harness removes only the Docker resources it created

The harness SHALL record each container and network it creates by the id
Docker returns, and MUST NOT replace or remove one whose name no longer
resolves to that id. Teardown SHALL consider only recorded names under its
configured prefix, and the default state file SHALL be specific to the
checkout.

#### Scenario: A container with the harness's name belongs to someone else

- **GIVEN** a container or network with the harness's name exists whose id the run's state file does not record, either because the name is absent or because it is recorded with another id
- **WHEN** the harness starts its stack
- **THEN** it refuses and leaves that container or network untouched

#### Scenario: Teardown meets a name it did not create

- **GIVEN** the state file records a name outside the configured prefix, a name without an id, or a name now held by a resource with another id
- **WHEN** the harness tears down its stack
- **THEN** it leaves that resource untouched and reports it, and removes its own resources by id

#### Scenario: Two checkouts use the default settings

- **GIVEN** two worktrees of the repository run the harness without a state-file override
- **WHEN** each starts or stops its stack
- **THEN** each reads and writes its own state file

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

### Requirement: A known select defect excuses only its own select

A failing select listed as a known product defect SHALL be reported instead of
failing the check only when its entry names text specific to that select, the
PostgREST error code, and a stable fragment of the PostgREST message the
defect produces. An entry that matches more than one failing select, or no
failing select, MUST fail the check.

#### Scenario: A second select fails in a file with a known defect

- **GIVEN** a known-defect entry names one select of a file and table
- **WHEN** a different select of the same file and table fails with the same error code
- **THEN** the check fails and names the second select

#### Scenario: The excused select fails for another reason

- **GIVEN** a known-defect entry for a select
- **WHEN** that select fails with another error code, or with a message that lacks the entry's fragment
- **THEN** the check fails and names the failure

#### Scenario: A known defect is fixed

- **GIVEN** a known-defect entry whose select no longer fails
- **WHEN** the check runs
- **THEN** it fails and asks for the entry to be deleted

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

For every exposed table with a tenant column, the check SHALL read as a
signed-in user of each of two tenants, with tokens it mints per run, and MUST
fail when a row of another tenant comes back that no ruling makes public. Only
a refusal of that table for lack of privilege counts as no rows; any other
error MUST fail the check, and column privileges left on a refused table MUST
still be probed.

#### Scenario: A policy admits another tenant's rows

- **GIVEN** a policy on a tenant table the caller can read admits rows of any tenant to signed-in users
- **WHEN** the check reads that table as a user of the other tenant
- **THEN** it fails and names the table, the number of rows and a sample of the leaked rows' tenants

#### Scenario: A table grants only some columns to signed-in users

- **GIVEN** a tenant table grants signed-in users only some columns, including its primary key, and a policy admits rows of any tenant
- **WHEN** the check reads that table as a user of the other tenant
- **THEN** it reads the primary key, resolves the rows' tenants and fails naming the table

#### Scenario: A permission error is not the table's

- **GIVEN** a policy raises a permission error on a function or another table
- **WHEN** the check reads the table
- **THEN** it fails with that error instead of counting the table as refused

### Requirement: The isolation sweep shows what it proved

Before it treats empty results as evidence, the check MUST prove that each
token reaches the database as its user and with its tenant claim: the caller
reads its own profile and a row of its tenant in a table whose only read policy
is the tenant claim. It MUST require evidence, a table the caller can read that
holds rows it must not read, on the core tenant tables in both directions, and
SHALL list each run's evidenced, unevidenced and refused tables by name.

#### Scenario: Tokens do not reach the database as the user

- **GIVEN** a minted token whose subject is not the user it claims to be
- **WHEN** the check verifies the caller before the isolation sweep
- **THEN** the verification fails, because the user's own profile is not visible

#### Scenario: A token's tenant claim does not reach the database

- **GIVEN** a minted token with the user's subject and another tenant's claim, or with no tenant claim
- **WHEN** the check verifies the caller before the isolation sweep
- **THEN** the verification fails, because no row of the user's tenant is visible in a table gated by the tenant claim

#### Scenario: A core table holds no row to leak

- **GIVEN** a core tenant table that the caller cannot read, or that holds no row of another tenant
- **WHEN** the check sweeps as that caller
- **THEN** it fails and names the table as not evidenced

### Requirement: Anonymous callers read no tenant rows outside ruled public reads

The check SHALL read every tenant table through the Data API without a user
token and MUST fail when a row comes back that no owner ruling makes publicly
readable. The ruled public reads SHALL be listed in one place, each with the
rows its ruling makes public (as a row condition the database owner
evaluates) and the ruling or document that allows it. A row of a ruled table
that its ruling does not make public MUST fail the check when an anonymous
caller or a user of another tenant reads it.

#### Scenario: An anonymous read of a tenant table returns rows

- **GIVEN** a tenant table is not on the ruled public-read list
- **WHEN** the check reads it anonymously and rows come back
- **THEN** it fails and names the table and the number of rows returned

#### Scenario: An unpublished row of a ruled table becomes readable

- **GIVEN** a policy change lets anonymous callers or other tenants read draft posts or unpublished locations
- **WHEN** the check reads those tables
- **THEN** it fails and names the table and the rows outside the ruling

### Requirement: The check is advisory and safe for forks

The check SHALL run as its own workflow on pull requests and on the default
branch, MUST NOT be a required status check until the owner promotes it, MUST
hold read-only repository permissions, MUST pin every action and image by
digest, and MUST NOT use repository secrets.

#### Scenario: A pull request from a fork

- **WHEN** the workflow runs for a pull request from a fork
- **THEN** it runs with no repository secrets and read-only permissions

### Requirement: The pull-request trigger covers the inputs the check derives

The workflow's pull-request trigger SHALL cover every repository file the
check derives as an input: the files its steps run and what they import, spawn
or read by a literal path, transitively; its tests and their imports; its
Vitest configuration chain; and the workspace packages the swept code depends
on. A derived input outside the trigger MUST fail the check's own tests. Paths
built at run time are not derived.

#### Scenario: A pull request changes a package the reads import

- **GIVEN** a pull request changes a workspace package that `packages/api` depends on, or the Vitest configuration the tests load
- **WHEN** pull-request workflows are selected
- **THEN** the API contract workflow runs

#### Scenario: A pull request changes a file the migrate step loads

- **GIVEN** a pull request changes only a script or file that the migrate step imports, spawns or reads by a literal path
- **WHEN** pull-request workflows are selected
- **THEN** the API contract workflow runs

### Requirement: The check's pure rules run in the required unit run

The check's tests that need no stack (harness safety, refusal classification,
paging, known-defect matching, the trigger's inputs and the checkout) SHALL run
in the repository's required unit run as well as in the API contract job, so a
regression in those rules fails a required check whether or not the advisory
job ran.

#### Scenario: A pure rule of the check regresses

- **GIVEN** a change breaks a rule that one of the check's pure tests covers
- **WHEN** the required unit run executes
- **THEN** it fails, whether or not the API contract workflow ran on that pull request
