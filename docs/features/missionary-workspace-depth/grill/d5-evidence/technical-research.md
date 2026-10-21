# D5 technical research — tenant-controlled contact correction

Research date: October 16, 2026 (Asia/Bangkok). No Core schema, application,
hosted Supabase project or live record was changed. The Supabase and PostgreSQL
skills were read; primary documentation resolves their simplified statements.
Exact retrieval timestamps, HTTP status and hashes are in
[technical-source-fetches.json](technical-source-fetches.json).

## Primary mechanics checked

| Source                                                                                                                                                                              | Verified behavior                                                                                                                                                                                                                | Consequence for D5                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Supabase column privileges](https://supabase.com/docs/guides/database/postgres/column-level-security) and [PostgreSQL 17 GRANT](https://www.postgresql.org/docs/17/sql-grant.html) | RLS controls rows, not an arbitrary per-actor field allowlist. A table-wide privilege survives revoking a privilege on one column. Restricted column access also affects wildcard queries.                                       | Row permission alone cannot authorize a full form payload. Do not implement tenant settings by changing the shared `authenticated` role's column grants for each tenant. Use the existing exact source/field capability boundary and suitable database privileges; inspect every bypass path. |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)                                                                                               | Grants and RLS are distinct; user metadata is user-editable; JWT authorization claims can remain stale until refresh; privileged service access can bypass RLS.                                                                  | Derive actor/tenant from trusted current context, resolve present policy, and qualify server/admin-client paths. A settings UI, old token or cached field list is not write authority.                                                                                                        |
| [PostgreSQL 17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)                                                                                             | USING controls existing rows; WITH CHECK controls the proposed row. For applicable UPDATE/ALL policies, omitted WITH CHECK inherits USING. Permissive policies combine with OR.                                                  | Check both old and new state and all effective policies; a narrow new policy does not neutralize an existing broad permissive path. Do not falsely report every omitted WITH CHECK as a vulnerability. Row checks still do not select which otherwise-permitted fields may change.            |
| [Supabase functions](https://supabase.com/docs/guides/database/functions) and [PostgreSQL RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)                             | Invoker/definer behavior depends on the actual execution role, owner, grants and bypass attributes. Function execution privileges and search path require separate inspection. Constraint checks can reveal protected existence. | Do not solve missing rights with a public privileged RPC. A service/definer command needs exact authoritative admission and safe result handling. Do not expose hidden email/person matches through raw database errors.                                                                      |
| [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)                                                                                                     | Exposed schemas, object grants and RLS are different controls. A PostgREST `db_pre_request` hook does not apply to Realtime, Storage or other product paths.                                                                     | Browser/REST/RPC/GraphQL/server/worker/storage/derivative reachability needs a bounded inventory; one request middleware is not cross-product enforcement. Do not change overall API architecture merely for this feature.                                                                    |
| [PostgreSQL 17 isolation](https://www.postgresql.org/docs/17/transaction-iso.html) and [RLS concurrency discussion](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)        | Read Committed statement snapshots and mutable authorization subqueries can leave a precheck stale; an updater may wait then re-evaluate the target.                                                                             | Contact acceptance must order relevant authority/source changes together. A read-then-unconditional-write is insufficient. Use the owners' established transaction/revision/revocation protocol, not a new global lock or an application-only permission check.                               |

The skill's general UPDATE/view/definer warnings are useful investigation leads,
not exact conclusions. Omitted checks can inherit, filtered/RETURNING updates
need their applicable SELECT authority, and privilege bypass depends on actual
owners/roles. The primary PostgreSQL semantics govern these distinctions.

## Changelog review and applicability

The current [Supabase changelog](https://supabase.com/changelog) was fetched and
its breaking changes checked before relying on platform behavior.

- [Data API exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically):
  the page describes explicit opt-in grants for newly created tables, with the
  change applying to existing projects on October 30, 2026. Its explanatory text
  says existing tables retain existing grants. Do not infer a secure default or
  silently grant broad writes when a new table is unavailable. Qualify actual
  project exposure and migration grants; D5 does not need a new public table.
- [PostgreSQL 15.19/17.11 minor release](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes):
  specific extension/operator compatibility work is documented. The synthetic
  probe uses pinned PostgreSQL 17.11; this does not inspect hosted versions,
  extension indexes or qualify a production upgrade. D5 introduces no new
  extension dependency.
- [TLS configuration deprecation](https://supabase.com/changelog/cbc-tls-ciphers-deprecated):
  the October 12 notice identifies November 10, 2026 at the earliest for removal
  of specific old TLS configurations. Qualify supported field devices in the
  ordinary network/browser test matrix. No claim about Core's affected population
  or an exemption from transport security follows.

Other reviewed entries about .NET, self-hosted migration, platform OAuth and
GraphQL discovery do not select a D5 dependency or prove Core's deployed setup.

## Smallest sound source contract

1. **One authority.** Tenant settings edit the existing P12 capability/grant and
   P3/P11 field-policy model through its qualified management commands. A focused
   settings surface may present that model; a separate `can_edit_contacts` truth,
   user-metadata flag, per-tenant SQL role or application-only switch may not.
   Built-in field-policy tenant overrides are currently dormant and require
   exact owner qualification; changing a global baseline is not tenant control.
2. **Exact subject.** Bind every policy operation and correction to the trusted
   actor, active Tenant assignment/hat, source contact, purpose and allowed
   fields. Tenant/source keys and policy references must preserve that binding.
   Current permissions to administer a grant are separate from exercising it.
3. **A selected-field patch.** Submit only deliberate changes to fields shown as
   editable, preserving the difference between omitted, explicit Clear and a
   new value. The server validates the entire submitted field set and payload;
   an unauthorized field is not accepted merely because its value is unchanged.
   Reject malformed/unknown/protected fields according to the exact command
   contract; do not silently apply an allowed subset and report full success.
4. **One authoritative acceptance.** Recheck current field/source authority and
   relevant source revision at commit. Record required minimized audit/activity
   and durable operation evidence atomically with the accepted correction.
   No affected source, invalid second field or required evidence failure means
   no accepted mutation. A true no-op must not manufacture an interaction or
   changed-value history; use the source's truthful no-op outcome.
5. **Safe competition and recovery.** Different editors cannot silently replace
   each other's newer data. Relevant permission revocation and correction share
   an ordered acceptance boundary. Already accepted work stays historical truth
   after a later revoke. An old retry recovers its prior outcome under current
   access, not a new overwrite; changed request meaning cannot reuse that intent.
6. **Exact freshness.** Old authority evidence, including A→B→A policy changes,
   must not be trusted solely because the visible setting looks the same. Fresh
   requalification may still allow the same deliberate intent when all required
   rights remain valid. Do not turn an unrelated role change into a universal
   denial or impose a new confirmation for every policy revision.
7. **Correct consequences.** Apply only the edited source field/purpose's
   contract. Phone correction cannot reset unrelated email proof or postal use.
   Ordinary name correction cannot rewrite legal/issued/public identity. Email
   and mailing correction must use their exact owners; no consent, verification,
   subscription, send or identity merge follows from a generic form value.
   A mandatory source acceptance/withdrawal fence cannot be deferred to eventual
   work. Only independently asynchronous post-acceptance effects use the owner's
   durable recovery; separately required proof/security notices retain their
   qualified pending/accepted meaning, without a new generic notification.
8. **Projection, not permission.** The editor's current capabilities and values
   come from the same resolved context as the command, with current source
   admission at Save. Lists, caches, search, history, recovered results and logs
   must not become broader readers. Preserve a rejected draft only while its
   continued display is allowed; revoked read access clears affected client data.

## Database and performance boundaries

Require non-null exact tenant/source/actor attribution where the source model
requires it, tenant-aware foreign keys, registry-backed immutable field keys,
valid current state/defaults and safe delete behavior. Keep permission/audit
history under its owner; contact editing does not authorize DELETE, caller-set
actor/owner/tenant, writable audit, or cascading loss of required evidence.
No new money datatype or financial arithmetic is introduced.

Static database column privileges can constrain an exposed role's maximum
surface; they are not a substitute for tenant/user/field decisions. The future
effective grants/RLS/views/functions must be tested together with every reached
privileged writer. Do not reopen direct browser writes to make legacy editors
pass, and do not build a bespoke permission engine to avoid P12 qualification.

Reuse P12's bounded resolver rather than doing one remote authorization call per
field or full-roster policy recomputation on each keypress. Its governing R6
logical bound is at most one governance-row SELECT plus one ledger UPDATE per
governed read; this is a contract to honor, not a measured D5 result. Index exact
tenant/assignment/field/source lookups and inspect actual query plans at
representative scale. No D5 latency or tenant-size budget has been measured.

## Evidence limits

The [D5 probe](postgres-probe/README.md) passed 25/25 outcomes on PostgreSQL
17.11, including three controlled two-session races with observed lock waits.
Container/anonymous-volume cleanup was verified. It supplies selected real
PostgreSQL mechanics under an illustrative effective-authority snapshot. It does not
implement P12's additive grants/floor/hat resolver or the final source schema.
It cannot qualify actual Core Auth/Data API/GraphQL/RLS/Storage, policy-management
approval, field owners, caches, a browser journey, production scale or operator
recovery. Earlier D1–D4 probes retain their own bounded evidence rather than
becoming a blanket certificate for this new capability.
