# Issue #2067 — acceptance checklist (reviewer / CI, not fully automated)

Spec: [rev 2 comment](https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306182453) (approved by Blake, 2026-10-20 7:01 PM PT), plus [Scope's addendum](https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306190263) pinning the allowlist path to `docs/ops/document-cutover/allowlist.json`, plus [spec addendum 2](https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306634165) (Samson's engineering rulings, 2026-10-20 7:40 PM PT: allowlist schema, digest rule, schema version from the migrations table, loopback is `non_production`, names/messages).

The automated acceptance tests in this directory cover DC1–DC12. The items below are checked on the implementation PR.

## Dependency on #2066

- [ ] The #2066 acceptance suite (`tests/unit/acceptance/issue-2066/`) and its minimal test seam are on the PR's base. This suite drives the command through that seam.
- [ ] #2066's `#2067 verify-env-mismatch` case is flipped from `it.fails` to `it` and passes (DC8). That flip is the only edit allowed to #2066's acceptance files.

## DC13 — runners and credentials

- [ ] `bun run test:unit` and `bun run typecheck` pass locally and in CI, including every file in this directory and in `tests/unit/acceptance/issue-2066/`.
- [ ] No test uses production credentials or real donor data. Every key, password and connection string in these tests is an obviously fake value built at runtime. Every Supabase client is the fake from `fake-supabase.ts` and every `pg` client is the fake from `fake-postgres.ts`, except the missing-URL subprocess in `credentials.acceptance.test.ts` (unroutable loopback port) and the opt-in real-stack test below.

## Spec items not enforced by code (check on the PR)

- [ ] `.gitignore` no longer carries the old local proof-store entry, and nothing under `docs/ops/document-cutover/proofs/` is ignored (the ignore part is automated).
- [ ] The committed `docs/ops/document-cutover/allowlist.json` has exactly `{ "owners": [{ "id", "role" }], "nonProductionProjects": [ ... ] }` (no other keys; automated by `readAllowlist()`). Per [addendum 3](https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306730671), `nonProductionProjects` entries are unique, non-empty plain strings, and the command's loader rejects objects, empty strings and duplicates (automated in `allowlist-schema.acceptance.test.ts`, which mocks `node:fs` and never writes an allowlist file).
- [ ] The command reads the allowlist through `node:fs` during each run, not through a static JSON import or a value cached at import time; `allowlist-schema.acceptance.test.ts` relies on this.
- [ ] Addendum 3 item 2: proof field names other than `digest`, `recordedBy` and `proofPath` follow these tests (`proofId`, `recordedAt`, `outcome`, `evidence[]`, `environment.*`). The positive DC11 case no longer depends on the committed list: addendum 4 m4 runs it against a populated scripted allowlist in `allowlist-schema.acceptance.test.ts`.
- [ ] The PR does not check Blake's approving review through the GitHub API (that is #961), adds no bypass flag or policy engine, and leaves AC1/AC4/AC5/AC6/AC10 semantics unchanged.
- [ ] Process rule (not enforced by `--verify`): the proof PR is approved and merged within 24h of `recordedAt`.
- [ ] Enabling "require code owner review" is a separate repo-settings change for Blake. It is not part of this PR.

## Addendum 4 — restricted database role and private functions

[Addendum 4](https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307) (Blake approved, 2026-10-20 10:31 PM PT; engineering ruling by Samson) replaces `DOCUMENT_CUTOVER_SUPABASE_READ_KEY` with `DOCUMENT_CUTOVER_DATABASE_URL`, a `pg` connection as `document_cutover_reader` that calls only `document_cutover.*` functions.

Automated:

| Criterion                            | Tests                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 restricted role works              | `reader-connection` criterion 1 (control: exit 0 + one clean proof; every route; only identity/function/control queries); `detectors` DC5/DC6/DC7/DC10 through the same `fakeDb` seeding; integration "gate run as document_cutover_reader"                                                                                                                                                        |
| 2 no direct reads                    | `reader-connection` criterion 2 (no Supabase client at all, no direct `SELECT`, identical without the read key)                                                                                                                                                                                                                                                                                    |
| 3 privileged connections rejected    | `reader-connection` criterion 3 (user is not the reader: postgres / service_role / authenticator / supabase_admin / pooler `postgres.<ref>`; rolsuper; rolbypassrls; direct and inherited membership in postgres / service_role / authenticator); `credentials` (missing URL with only the service-role key, with only the old read key, and as a real subprocess); integration "admin connection" |
| 4 no exposure, no secret             | `migration-lockdown` criterion 4 (config.toml schemas exactly `public`, `graphql_public`; repo-wide scan for a reader password)                                                                                                                                                                                                                                                                    |
| 5 migration locked down              | `migration-lockdown` criterion 5 (static SQL); integration (owner, SECURITY DEFINER, proconfig, ACLs, 42501 for anon / authenticated / service_role, default privileges via rolled-back probe objects, reader grants)                                                                                                                                                                              |
| 6 RLS can't give a false clean proof | `reader-connection` criterion 6 (each census / function returning zero rows and no error stops the gate, no proof); integration forced-RLS full count                                                                                                                                                                                                                                              |
| 7 (m1) deadline                      | `reader-connection` criterion 7 (hung schema-version / user / table call ends in a timeout blocker within 30 s of fake time, no proof)                                                                                                                                                                                                                                                             |
| 8 (m2) role in library               | `owner-role-library` (control + wrong role rejected by `recordDocumentCutoverApproval`)                                                                                                                                                                                                                                                                                                            |
| 9 (m3) output contained              | `output-containment` (`--out .`, `""`, `../x`, absolute, sibling; `--verify` outside proofs/)                                                                                                                                                                                                                                                                                                      |
| 10 tests                             | fakes model committed exposure (`fake-supabase.ts`: PGRST106 for unexposed schemas, 403 for `auth.admin`, RLS-empty table reads; `fake-postgres.ts`: 42501 for direct reads and for anon / authenticated / service_role); m4 overwrite with different bytes (`proof-output` DC1); m4 populated `nonProductionProjects` (`allowlist-schema` DC11, replaces the skipped case in `authorization`)     |

Run the real-stack test (skipped without the env var):

```sh
supabase start   # or any disposable Postgres with every migration applied
DOCUMENT_CUTOVER_IT_ADMIN_DATABASE_URL=postgresql://postgres:<local-db-password>@127.0.0.1:54322/postgres \
  bun x vitest run tests/unit/acceptance/issue-2067/reader-role.integration.acceptance.test.ts
```

It needs `psql` on PATH (or `PSQL_BIN`) and an admin role that can `ALTER ROLE document_cutover_reader`, `SET ROLE anon / authenticated / service_role`, and owns `public.pdf_templates`. It sets a random test-only password, logs in as the reader over TCP, and restores `NOLOGIN PASSWORD NULL` afterwards. Its row-level-security check runs inside a rolled-back transaction.

Check on the PR:

- [ ] CI Integration runs the real-stack test with `DOCUMENT_CUTOVER_IT_ADMIN_DATABASE_URL` set. The addendum says "`supabase start` in CI Integration"; today `.github/workflows/ci-integration.yml` runs a plain `postgres:15` service with `scripts/sql/supabase-compat-bootstrap.sql`, which creates no `authenticator` role and no `supabase_migrations` schema. Either CI switches to `supabase start` or the bootstrap gains both.
- [ ] The PR body states the three-step deploy prerequisite (apply the migration; `ALTER ROLE document_cutover_reader WITH LOGIN PASSWORD '<generated>'` in the SQL editor; store the pooler connection string as `DOCUMENT_CUTOVER_DATABASE_URL`) and removes the old read-key prerequisite.
- [ ] `pg` is the driver (the tests mock the `pg` module's `Client` / `Pool`), and the gate builds it only from `DOCUMENT_CUTOVER_DATABASE_URL` (no `PG*` env fallback).
- [ ] The gate's identity queries and `document_cutover` function names use the forms documented in `fake-postgres.ts`, or Scope has ruled otherwise and the fake is updated to match by Acceptance.
- [ ] The migration creates the cluster-wide role idempotently (for example in a `DO` block), so `supabase db reset` works twice.
