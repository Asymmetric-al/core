# D1 technical primary-source research

Retrieved October 15, 2026 America/Los_Angeles (October 16 UTC). Research only;
no hosted Supabase database, configuration or live user data was accessed.
The repository declares PostgreSQL major 17 in `supabase/config.toml:34`,
`@supabase/supabase-js` 2.117.3 and `@supabase/ssr` 0.12.7 in the database
manifest. These are repository configuration, not a hosted-version inventory.

The Supabase plugin and repository Supabase/Postgres skills were read, followed
by the current official documentation. The documentation search tool was used;
direct Markdown/HTML retrieval supplied exact pages where the web tool could
not render Markdown. [Fetch metadata](technical-source-fetches.json) records
URLs, sizes and SHA-256 hashes; full vendor pages remain temporary research
inputs rather than copies in this repository.

## Verified mechanics and their implications

| Primary source actually inspected                                                                                                                                             | Finding                                                                                                                                                                                                                                                                                                                           | Consequence for this decision                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [PostgreSQL 17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)                                                                                         | Grants and RLS are separate. Ordinary enabled-RLS access defaults to deny without a matching policy; superusers and BYPASSRLS bypass policies, and owners normally bypass unless FORCE applies. Unique and FK integrity checks bypass row security.                                                                               | Do not claim a hidden row, FORCE RLS, UUID, or private schema by itself protects every path. Validate actual execution roles and stop constraint outcomes from revealing hidden matches.                                                                                |
| [PostgreSQL 17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)                                                                                       | USING governs existing rows and WITH CHECK governs proposed rows. For ALL/UPDATE, omitted WITH CHECK uses USING. Applicable permissive policies combine with OR; restrictive policies need an applicable permissive grant and add AND conditions. Filtered/RETURNING updates also require applicable SELECT permissions/policies. | Test the complete effective policy set and permitted row transformations. An omitted explicit WITH CHECK is not automatically a bypass. A broad existing policy can defeat an added narrow permissive policy. A zero-row result must not become a false Saved result.   |
| [PostgreSQL 17 CREATE VIEW](https://www.postgresql.org/docs/17/sql-createview.html) and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) | Default views use the view owner's underlying access; security_invoker views use the caller's underlying privileges/policies.                                                                                                                                                                                                     | A view created by a privileged owner may expose restricted rows. Invoker configuration does not repair an already overprivileged caller. Check view/function chains and field projections, not only table policies.                                                     |
| [PostgreSQL 17 CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html) and [Supabase functions](https://supabase.com/docs/guides/database/functions)     | SECURITY DEFINER uses the function owner's rights; bypass depends on those rights and table ownership/FORCE. Functions normally grant PUBLIC execution. Safe definer use requires a controlled search_path, qualified references, narrow execution privileges and explicit actor/target authorization.                            | Do not use a generic privileged RPC as a permission repair. A private schema and auth.uid() check alone do not establish purpose/record/field authority. Privileged commands must preserve the same D1 boundary.                                                        |
| [Supabase securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)                                                                                      | Project default grants vary and are transitioning toward opt-in exposure. Existing grants are not removed by adding policies. Exposure, schema usage, function execution and row policies are separate controls.                                                                                                                  | Inspect the project's actual grants and supported APIs at activation. Keep this sensitive command behind the canonical business service; do not reopen legacy browser write grants. Do not assume a new table is unreachable or must be broadly granted to fix a 403.   |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)                                                                                         | User metadata is user-editable; app metadata/JWT authorization can be stale until token refresh. Role authenticated is not source authorization. Indexed filters and row-invariant helper evaluation can reduce work, but policies and query plans need measurement.                                                              | Derive current tenant/actor/source authority from trusted Core context and the P12 permission owner. Never trust body actor/tenant/role values or stale membership claims. Do not copy a generic auth.uid() policy or untrusted session variable as the complete model. |
| [Supabase Realtime authorization](https://supabase.com/docs/guides/realtime/authorization)                                                                                    | Private-channel Broadcast/Presence authorization is calculated at join and cached for the connection; a new JWT updates it. Revoked users may receive messages until refresh/expiry. This is not a blanket statement about all Postgres Changes behavior.                                                                         | D1 does not need a new sensitive broadcast feed. Do not stream private payloads based only on channel admission. Reuse qualified context-scoped refresh with current source reads; any later private realtime path needs its own revocation proof.                      |
| [PostgreSQL 17 transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html)                                                                                | Read Committed gives statement snapshots; separate reads/writes do not make a multi-step invariant atomic. Serializable transactions may require whole-transaction retry.                                                                                                                                                         | Establish source revision and authorization fencing in one accepted command/transaction. Use consistent locks or an equivalently proved source mechanism; do not require SERIALIZABLE everywhere or retry external effects inside a database retry loop.                |

## Corrections to oversimplified skill advice

The skill's sentence that omitting WITH CHECK necessarily lets a user change an
owner is not generally correct. PostgreSQL's documented fallback to USING must
be considered. Explicit, reviewed result predicates are still useful, and an
overbroad predicate or column grant can permit a forbidden transformation.

Likewise, SECURITY DEFINER and default-owner views are not universally RLS
bypasses independent of owner privileges. FORCE does not restrain superusers or
BYPASSRLS. The disposable probe exercises these distinctions instead of turning
the skill wording into false findings.

The performance skill's generic speedup multipliers and examples are not Core
performance guarantees. A row-dependent helper cannot be hoisted as if it were
constant; custom session variables are not a trusted actor source if the caller
can set them. Indexes must follow actual composite predicates and query plans.

## Current changelog review

The current [Supabase changelog index](https://supabase.com/changelog.md) was
retrieved and relevant breaking changes were followed:

- [Postgres 15.19/17.11 patch](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes),
  September 25: extension/index/operator-specific upgrade actions are conditional
  on actual use. This does not establish Core's hosted patch level or require
  speculative D1 extensions. The isolated proof records its actual server version.
- [Realtime schema lockdown](https://supabase.com/changelog/realtime-schema-locked-down-against-modification),
  July 14: applications must not customize provider-owned realtime objects;
  supported policies on realtime.messages remain available. D1 needs no custom
  provider schema objects.
- [TLS cipher retirement](https://supabase.com/changelog/cbc-tls-ciphers-deprecated),
  October 12: deprecated HTTP cipher removal is planned no earlier than November 10. It is relevant to the eventual supported-device/field-browser matrix, not
  evidence that current Asym users are affected. Keep TLS verification; use
  provider evidence and representative devices rather than inventing an outage.

No schema upgrade, migration, account setting, provider channel or dependency
was changed. These are exact qualification considerations, not blanket blockers
for deciding on restricted preparation.
