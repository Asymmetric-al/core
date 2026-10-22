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

The normal full pre-push passed all 15 product typechecks, all three app builds
and the repository gates at the initial published head: 900 test files passed,
2 existing files skipped; 7,364 tests passed, 1 expected failure and 4 existing
tests skipped. The subsequent published `02063aff` passed full pre-push with
901 test files and 7,384 passing tests; its exact-head CI and full integration/E2E
also passed. These are historical qualifications before the final data merge.

The branch now integrates merged `develop` at `a47024f8`, including the complete
reviewed Auth, tenant/fund cleanup and build-selection fixes. All 115 selected
data/GraphQL contracts pass in nine files. The application/package source, root
package and lock, Turbo and shared TypeScript inputs match the existing compiled
proofs exactly. Published `e8884ab8` passed full pre-push on this base:
901 test files passed, 2 existing files skipped; 7,397 tests passed, 1 expected
failure and 4 existing tests skipped.

Review then strengthened the unknown-input-field case with a valid idempotency
header, HTTP 400 and denial before either query or mutation transport. A controlled
schema mutation admitted the injected field: the old test still passed while the
strengthened test failed. The exact product source was restored; all 18 HTTP cases
pass on the pre-upgrade stack and all 36 focused cases pass on the upgraded stack.
This changes only test/evidence files. Final release gates, current-head CI/review
and exact-head previews must cover this final test change.

Nine compiled product HTTP cases match the previous GraphQL 16 stack in exact
status and complete public response, including production error masking and
legacy versus modern Accept-header behavior. Five additional checks exercised
the actual compiled admin CMS route: its GraphQL 16 root query executes,
production introspection stays disabled, anonymous CMS-user reads are denied,
OPTIONS remains mounted and unauthenticated Web Studio access redirects to the
shared login. The CMS probe used a temporary read-only role against the isolated
synthetic database, removed that role and verified all 266 tables and 1,577
records unchanged. These checks establish the compiled runtime boundaries;
authenticated editor and deployed-preview flows still require separate evidence.

This checkpoint changes no database schema or public route. Revert the complete
checkpoint's manifests, lockfile and owned evidence together if qualification
fails, then rerun affected gates. Requalified app builds and repository gates, the
updated-base evidence review, current-head CI, CMS/product previews and
merged-develop readback remain required. No production operation was executed.

Sources: [versioned GraphQL 17 migration guide](https://github.com/graphql/graphql-js/blob/v17.0.2/website/pages/upgrade-guides/v16-v17.mdx),
[Yoga 5.24.6 release](https://github.com/graphql-hive/graphql-yoga/releases/tag/graphql-yoga%405.24.6)
and exact npm metadata in the qualification record.
