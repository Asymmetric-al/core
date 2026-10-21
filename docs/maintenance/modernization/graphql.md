# Product GraphQL checkpoint

Tracking: [AL-1965](https://github.com/Asymmetric-al/core/issues/1965).
Status: implemented; full qualification, previews and merge remain pending.
The [qualification record](graphql-qualification.json) freezes the selected
releases, provenance and actual test boundaries.

`@asym/graphql` owns GraphQL 17.0.2 and Yoga 5.24.6. Its public API remains a
handler factory returning GET, POST and OPTIONS handlers. SDL, resolvers and
schema instances stay inside the workspace. Duplicate root GraphQL and Yoga
declarations are removed; consumers continue through the workspace boundary.

Payload's current upstream requires GraphQL 16. The CMS dependency graph retains
16.14.2, the latest maintained 16 release, under Core CMS ownership. Physical
runtime tests verify that Yoga resolves the product's 17 runtime, CMS resolves
16, both validate their own schemas and neither accepts the other's schema
objects. The public Payload v4 migration must requalify this compatibility
dependency; it is not a permanent version hold or a reason to force a shared
GraphQL major with an override.

Eighteen HTTP cases passed before and after the upgrade using actual Yoga and
GraphQL execution and the existing authorization rules. They cover anonymous and
privileged denial before database transport, tenant-filtered reads, integer
coercion, exact money/currency and idempotency inputs, replay response stability,
omitted versus null updates, GET mutation rejection and the existing unavailable
response. Two physical-runtime cases and sixteen existing adapter tests bring the
current focused run to 36 passing tests. Auth context resolution and Supabase
transport are mocked in these tests; hosted Auth, RLS and payment-provider
behavior require their separate qualification evidence.

The initial incremental install encountered the existing PDF file-link repair
boundary. The normal frozen retry passed without lock drift. A separate fresh
checkout then installed all 1,946 packages with the frozen lockfile, no lock
drift, no environment file and no materialized opaque vendored database. All 36
focused contract tests passed there. PDF artifacts and their installation
repairs remain owned by the PDF provenance checkpoint.

This checkpoint changes no database schema or public route. Revert the complete
checkpoint's manifests, lockfile and owned evidence together if qualification
fails, then rerun affected gates. All three app builds, repository checks,
independent review, current-head CI and CMS/product preview checks remain
required. No production operation was executed.

Sources: [versioned GraphQL 17 migration guide](https://github.com/graphql/graphql-js/blob/v17.0.2/website/pages/upgrade-guides/v16-v17.mdx),
[Yoga 5.24.6 release](https://github.com/graphql-hive/graphql-yoga/releases/tag/graphql-yoga%405.24.6)
and exact npm metadata in the qualification record.
