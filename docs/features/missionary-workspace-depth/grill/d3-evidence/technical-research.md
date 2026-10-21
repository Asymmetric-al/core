# D3 technical research — departure is neither disclosure nor deletion

Inspected October 16, 2026 UTC. Research only; no hosted project, live account,
Storage object, provider or application state was changed. Repository baseline
remains `9cada8f3d8ab59db391d3fd20df77fcadeb09813` (PostgreSQL major 17 in
`supabase/config.toml`; this does not identify the hosted version).

The Supabase and Postgres skills were applied with primary-document checks.
The documentation search returned official User Management and Sessions pages;
exact page retrievals are recorded in
[technical-source-fetches.json](technical-source-fetches.json). The changelog
index was checked for relevant changes. Its upcoming TLS change does not change
the D3 access decision; no new managed-schema dependency is introduced. Prior
D1 corrections to simplified skill statements still apply.

## Primary findings

| Source                                                                                                                                      | Verified fact                                                                                                                                                                                         | Consequence for D3                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data#deleting-users)                                         | Deleting an Auth user does not automatically sign out an already issued JWT. Storage ownership can prevent deletion. The basic profile example uses a cascading FK.                                   | Do not use Auth deletion as instant permission revocation or generic CRM cleanup. A tutorial's cascade is not a retention policy for contacts, tasks or financial history. Storage remediation must follow actual custody/access rules rather than assigning a successor for convenience.                           |
| [Supabase Sessions](https://supabase.com/docs/guides/auth/sessions#how-to-ensure-an-access-token-jwt-cannot-be-used-after-a-user-signs-out) | A JWT carries `session_id`; sign-out removes affected session rows, but the token can otherwise remain valid until expiry. Time-box/inactivity expiry is not proactive immediate session termination. | Core must prove current principal/assignment/source authority at the existing P12 boundary. Refresh-token revocation or a short JWT lifetime alone cannot supply immediate tenant deactivation. Do not introduce a separate Phase 28 session authority or assume every action needs a new direct Auth-schema query. |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)                                                       | User metadata is user-editable; app metadata in a token can be stale. Grants and policies are separate; privileged roles can bypass RLS.                                                              | Neither a caller's role/owner field nor stale token claims may reopen preparation. Inspect all effective table grants, policies, views, functions, service commands and derivative paths. A service worker is not exempt from business authorization.                                                               |
| [Supabase Storage ownership](https://supabase.com/docs/guides/storage/security/ownership)                                                   | Object ownership by itself grants no access; policies define it. `owner_id` is current, while `owner` is deprecated.                                                                                  | Storage owner reassignment is not an approved staff handoff. Attachment retention/disposition must preserve the preparation's boundary across originals, previews, links and restore. No new attachment feature is implied by D3.                                                                                   |
| [PostgreSQL 17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)                                                        | Default FK deletion is NO ACTION. CASCADE deletes dependent rows; SET NULL still must satisfy remaining constraints. Appropriate behavior depends on domain meaning.                                  | Trace the actual dependency graph. A mixed graph may block deletion atomically rather than partially delete everything; other allowed deletions can cascade. Do not disable constraints, null authors wholesale or erase source receipts to force cleanup through.                                                  |
| [PostgreSQL 17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)                                                     | USING governs existing rows; WITH CHECK governs new row values. UPDATE/ALL without explicit WITH CHECK uses USING. Permissive policies combine with OR.                                               | A new narrow rule cannot cancel an older broad permissive grant. Prove denied row transformations: changing tenant, author, assignment, visibility or retained/active status cannot turn a permitted update into unauthorized disclosure. Column immutability and source commands supplement RLS.                   |

Supabase examples describe platform mechanics, not a missions organization's
authority, data ownership or required retention. In particular, the tutorial
profile cascade and generic storage-owner reassignment guidance must not be
imported as Core departure policy.

## Existing experimental evidence and its limits

- [D1 PostgreSQL probe](../d1-evidence/postgres-probe/README.md): 34/34 expected
  outcomes in isolated PostgreSQL 17.11, including unsafe counterexamples. The
  actual concurrent-session cases show that a stale authorization precheck can
  accept a write after revocation, while a shared source authorization fence can
  order write and revoke. This establishes the tested mechanics, not that Core
  uses them correctly.
- [D2 PostgreSQL probe](../d2-evidence/postgres-probe/README.md): 43/43 expected
  outcomes establish synthetic share/audit/optional-notice intent atomicity,
  semantic deduplication and independent notification failure. It does not prove
  the real departure race or complete recipient fanout.
- [D3 FK probe](postgres-probe/README.md): six scenarios and 18/18 assertions
  passed using exact selected table/constraint excerpts and a nonsuperuser
  deletion role in isolated PostgreSQL 17.11. It verifies unblocked cascades,
  three independent FK blockers with statement rollback, pledge SET NULL and
  retained note/log attribution. The Auth table is a UUID stub; omitted RLS,
  triggers and other graph edges are explicitly listed. The container and
  anonymous volume were removed and absence verified.

D3 adds no application schema or implementation. The focused excerpt test
does not establish real Supabase Auth, Data API, grants, Storage, client-cache
or restoration behavior. The [current runtime trace](current-runtime.md)
supplies broader static source evidence; integrated departure/recovery tests
remain required before activation.

## Minimum engineering implications

1. Use the existing source/P12 transition to end current authority. Do not infer
   permanent departure from inactivity, lack of logs, a failed sign-in, temporary
   leave or being unreachable. Those are not equivalent facts.
2. At consequential acceptance, re-prove the current actor, tenant, assignment,
   source revision and permissions in the same ordered boundary as revocation.
   A share accepted first remains accepted history; later authorized correction
   or restriction remains possible. Revocation/narrowing ordered first must
   defeat a stale share only when it removes authority required for that share;
   an unrelated revocation does not erase another valid grant path. Notification
   failure cannot reverse the accepted ordering.
3. New reads and pending effects must observe current authority. Clear affected
   in-memory views, scope caches by the exact authorization context, reject late
   responses and end subscriptions under existing owners. Do not promise to
   erase information already downloaded, printed or observed.
4. Preserve separately meaningful facts: canonical identity, suppression,
   posted contributions, commitments, accepted tasks, source attribution and
   operation receipts are not children to discard merely because a login ends.
5. Derive tenant/actor/author/lifecycle attribution from trusted context; bind
   relationships to the tenant and exact source identity. Do not turn a missing
   owner into `NULL = shared`, a guessed administrator, an ownerless global row
   or a recipient fallback. Index actual current-authority and lifecycle
   predicates; prove plans on representative retained data rather than copying
   a generic performance percentage from a skill.
6. Any future archive/disposition uses its own approved source operation,
   current access, expected revision and durable effect identity. It cannot
   share, merge, subscribe, send, change giving or replay historical work. No
   archive control, purge schedule or retention duration is selected by D3.
7. Migration/restore must reconcile current denials and suppression before
   readers/workers resume. If present authority cannot be established after a
   restore, keep the affected path unavailable rather than trusting restored
   historical grants. Rollback must not re-enable an older broad reader.

Unknowns are explicit: effective hosted grants and FKs, actual retained-data
inventory, full lifecycle consumers, exact producer contracts, retention/holds,
returning-user history eligibility and measured UX/query budgets. These require
source evidence or a genuine product decision; they are not solved by assigning
all of a former missionary's records to an administrator.
