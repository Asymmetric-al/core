# D7 — primary technical checks for newsletter control

Reviewed October 16, 2026 UTC. Research only; no hosted Supabase, production
database, real subscriber or provider send was accessed. The
[fetch manifest](technical-source-fetches.json) records twelve successful
primary-document fetches, their timestamps, hashes and temporary local paths.
The raw files are execution-workspace evidence, not promised permanent URLs.

## Supabase and PostgreSQL findings

1. **Object reachability and row authority are separate.** Current
   [Data API guidance](https://supabase.com/docs/guides/api/securing-your-api)
   distinguishes grants from RLS. New default privileges do not revoke existing
   object grants. Inspect actual grants, exposed schemas, function EXECUTE,
   service paths and roles for drafts, recipients, authorizations, renditions,
   delivery effects, audit and assets. A UI-only Send restriction is insufficient.
2. **The default-exposure change is not a migration proof.** The
   [April 28 announcement](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
   describes opt-in exposure, May 30 new-project defaults and October 30
   enforcement. D7 is reviewed before October 30. This neither establishes
   Core's actual hosted settings nor repairs already granted legacy writers.
3. **Old and proposed new rows both matter.**
   [PostgreSQL 17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)
   distinguishes `USING` from `WITH CHECK`; for applicable ALL/UPDATE policies,
   an absent CHECK can inherit USING. The simplified skill claim that omission
   necessarily permits owner reassignment is incorrect. Explicitly verify the
   effective old/new predicates, policy composition and permitted columns.
   A valid same-tenant update must still not turn a draft into an authorized
   issue, change its author or retarget an accepted recipient effect.
4. **A privileged function is not authorization by itself.** Current
   [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
   and PostgreSQL semantics require reviewing actual owner privileges,
   FORCE/BYPASSRLS, fixed safe search paths and EXECUTE grants. SECURITY DEFINER
   does not universally bypass RLS; behavior depends on that owner and table
   policy. Service roles can bypass RLS and must retain the same source checks.
   A trusted API identity must not become a caller-set actor, tenant, approval
   or role through a body field, writable metadata, or exposed context setter.
5. **Views and secondary products require their own proof.** Security-invoker
   views are available on supported PostgreSQL versions; inspect real view and
   underlying-table grants. PostgREST `db_pre_request` does not protect Storage
   or Realtime. Apply the boundary to direct REST/GraphQL, RPC, views, storage,
   workers, exports, caches and realtime payloads, not just the app route.
6. **Media paths are not secrecy.**
   [Storage guidance](https://supabase.com/docs/guides/storage/security/access-control)
   documents separate object policies and privileged service-key access.
   Replacing an object requires more than INSERT permission. A tenant folder
   or signed URL does not prove the recipient may see the draft, source image,
   poster, caption, derivative or player destination. Public assets cannot be
   made private merely by placing their URL in a private draft.
7. **Enforce stable identity structurally.**
   [PostgreSQL constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)
   support non-null source scope, tenant-aware composite references, valid
   state combinations and unique business effects. Nullable uniqueness is not
   an accidental dedupe policy. Keep immutable release identity and trusted
   attribution out of ordinary draft-update grants; historical delivery must
   not cascade-delete when an editable template or author account changes.
8. **Serialize consequential races at the source.**
   [PostgreSQL locking](https://www.postgresql.org/docs/17/explicit-locking.html)
   supports bounded ordering of Send, cancel, edit, permission/consent withdrawal
   and dispatch admission. Consistent lock order and retry-safe whole operations
   matter. Never hold a database transaction open across a provider HTTP call.
   A source transaction records authorization, evidence and durable intent;
   external acceptance is a later fact with its own recovery state.

These are required boundary properties, not an instruction to create a new
newsletter-specific security framework. Reuse P12 and the P6/P17/source command
patterns. The disposable probe in this evidence directory tests bounded engine
mechanics; it cannot qualify Supabase JWT handling, Data API, actual Core RLS,
Storage, Realtime or provider behavior.

## Provider facts that cannot become product authority

- Current [Resend idempotency documentation](https://resend.com/docs/dashboard/emails/idempotency-keys)
  describes a **24-hour** provider key window. It is not permanent business
  deduplication. A lost response cannot justify a new issue/recipient effect or
  a fresh key; after that window, an unresolved effect needs provider-supported
  reconciliation or a visible unresolved outcome, not blind resend.
- The same documentation distinguishes changed-payload and concurrent-request
  conflicts. Retry the same accepted meaning only. A payload conflict is not
  permission to change the key and send again.
- Current [Resend scheduling documentation](https://resend.com/docs/dashboard/emails/schedule-email)
  describes scheduling up to **30 days** ahead and batch scheduling. Those are
  provider capabilities, not Asym's schedule horizon or a reason to move P6
  due work into the provider. The owner review identifies older P17 prose that
  incorrectly says batch scheduling is unsupported; correct that rationale
  while preserving Core-owned scheduling and dispatch-time narrowing.
- Provider cancellation is not recall. Source cancellation and actual
  submission need a defined ordering point, per-recipient outcomes and honest
  handling of accepted or ambiguous work. Newsletter or Page Off states cannot
  retroactively erase an email or recover a downloaded print file.

The [content/delivery owner review](content-delivery-owners.md) additionally
checks provider rate limits, team-wide suppression and account topology.
No documented account maximum is a measured Core capacity claim. No new
provider, package, scheduler or storage dependency was installed.

## Changelog relevance and limits

The current [Supabase changelog](https://supabase.com/changelog.md) was scanned
before this review. In addition to the exposure change above:

- The [PostgreSQL 15.19/17.11 notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
  identifies conditional extension/index/cipher upgrade work. The fixture uses
  pinned PostgreSQL 17.11; this does not establish the deployed database version
  or that Core uses an affected extension or encrypted datum.
- The [TLS cipher notice](https://supabase.com/changelog/cbc-tls-ciphers-deprecated)
  announces November 10, 2026 retirement of an old TLS 1.2 cipher subset.
  Actual client compatibility belongs in release qualification. It is not
  evidence that current missionary devices fail or a reason for a new stack.

No provider throughput, retention duration, audience cap, schedule horizon or
completion-time claim was invented from these notices. Such limits must be
explicit, enforced and evidenced for the actual native capability before its
activation; a green synthetic database fixture does not supply those proofs.
