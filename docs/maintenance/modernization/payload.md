# Public Payload v4 checkpoint

Tracking: [AL-1965](https://github.com/Asymmetric-al/core/issues/1965).
Status: local migration, restore, authenticated browser and clean-install checks
pass. Full repository and deployed release qualification remain open. Production
execution is outside this delivery.

The complete eight-package cohort is pinned to official `4.0.0-beta.3`, including
`@payloadcms/transformer-sharp`. The internal release overrides are removed.
The transformer resolves Sharp 0.35.5 through the existing native-security floor;
its current upstream 0.35.4 selection fails that floor. Payload's required,
maintained GraphQL 16.14.2 stays inside the CMS boundary and is rechecked against
the product's separate GraphQL 17 runtime. These are owned compatibility
requirements, not indefinite version holds.

The admin adapter uses public `RootProviders`, `getRootLayoutData` and
`createPayloadRequest`. All collection-specific versions are preserved with
explicit `authorship: false`; the new shared instruction feature stays disabled
because it has no Core tenant-governed product contract. Core's custom Supabase
cookie strategy remains the authentication boundary. Old internal Payload JWTs
require reissue; no legacy-token bypass is added.

Media transforms move from collection `imageSizes` to root transformers and
internal `variants`. Both public serializers preserve their allowlisted DTO and
exclude internal original/storage metadata. The actual Sharp transformer is
tested for the existing formats, dimensions, focal crop, animated GIF timing,
malformed/unsupported input rejection and original-byte preservation. The
semantic CSS bridge uses existing Core tokens and retains exact Base UI Maia.

The three owned rich-text field definitions retain their open custom/legacy node
envelope through the supported `jsonSchema` transform. This affects generated
types and MCP write validation; tests cover input/output schemas and existing
document metadata. Credential-free import-map generation retains the Blob client
handler through declarative admin dependencies, with storage disabled when its
provider token is absent.

The committed CLI runner parses the installed public CLI before target checks,
without initializing Payload or loading application config. Only migration,
generation, help and info commands are allowed. New CRUD, job and arbitrary-run
commands do not inherit migration credentials.

The two ordered migrations use the official predefined `sizes` rename, then add
nullable media metadata and rename one overlong versioned impact-stat table in
place. Existing records, sequences, relationships and object identities are
preserved. The metadata down migration locks media before its compatibility
guard, preventing a concurrent writer from creating a lossy rollback race.

The isolated PostgreSQL 17.11 rehearsal compared all 266 tables, with 265 business
tables and 1,576 business rows unchanged after normalization of the intentional
schema rename. The migration tracker accounts for the two new records. Both
serializers produced identical public contracts before and after migration.
The actual runner passed migration, guarded concurrent refusal, ordinary down
and reapplication. A migrated backup restored to a second database with all
266 tables and 1,579 rows identical. Five existing media files retained their
hashes. These are synthetic local fixture results, not hosted/provider or
production qualification.

The latest focused CMS and preview-delivery cohort passes 43 files and 355 cases;
individual earlier cohorts remain recorded with their source hashes. A compiler
regression also checks public string block references without implicit generated
augmentation; the generated file stays intact. The four actual SDK JWT cases verify signed legacy/wrong-version denial, a valid current
token and the disabled-local-strategy boundary. Generated types remain present
during typechecking. All three applications build against the owned local Auth
service with bypass disabled. The real-session browser probe verifies password
sign-in, refresh, sign-out, CMS mounting, upload/variants/original bytes, foreign
tenant and non-staff denial, keyboard and reduced motion. All eight selected
existing CMS browser cases pass without skips, including native autosave and
seeded editor/template/preview flows. Mission Control retains its forced-light
contract under either system preference; a temporary CSS token fixture checks
the dark mapping without enabling product dark mode. The [qualification record](payload-qualification.json)
freezes versions, source and evidence as qualification proceeds. The frozen
installation has no lock drift; import map/types regenerate identically twice,
and all 15 typecheck tasks pass with the generated types present and caches
bypassed. Complete gates, all three deployed previews, independent final review
and merge readback remain required before this checkpoint closes.

The [operations runbook](../../guides/development/web-studio-runbook.md)
contains migration order, write pause, backup/restore and rollback boundaries.
The [skill provenance](payload-skill-provenance.json) records consolidation of the
duplicate Payload skills and retirement of generic v3 examples; current Core
adapters preserve access, tenant, document, UI and migration ownership.

Source: [official versioned v4 migration guide](https://github.com/payloadcms/payload/blob/v4.0.0-beta.3/docs/migration-guide/v4.mdx).

### Public static media access correction

PR #2185 review found two retired `sizes.*.filename` filters in the follow-up static-file access check. They now use `variants.thumbnail.filename` and `variants.card.filename`, retaining the original filename alternative, tenant checks and exact-name restriction. The existing regression failed before the fix (1 failed, 18 passed) and all 19 cases pass afterward. Independent review found no additional active legacy media member paths. Anonymous HTTP thumbnail/card bytes and dimensions now pass without permitting metadata access. Current-head hosted release qualification remains open.

### Hosted migration roles and certificate verification

Hosted migration approval can name an explicit `CMS_HOSTED_MIGRATION_ROLE`;
without it the guard requires `postgres`. A custom role must be a plain role
name, and the exact direct or session-pooler username must match that role and
the explicitly approved project. Routing overrides remain forbidden. The owned
qualification branch uses a new expiring role with no superuser, role-creation,
database-creation or RLS-bypass privileges. Its partial business bootstrap is
not evidence of a complete development database restore.

The existing product pool now accepts server-only `PAYLOAD_DATABASE_SSL_CA`
with exactly one `sslmode=verify-full`. It requires certificate verification,
rejects conflicting URI TLS options and removes the validated URI mode before
node-postgres parsing can overwrite the CA object. Read-only connections to
the isolated PostgreSQL 17.11 branch passed under Node 24.22.1 and Bun 1.4.3.
The CLI uses a trusted local root through `sslrootcert` instead. All 540 focused
cases, strict React Doctor and existing Shadscan floors pass; independent review
approved the six implementation/test/configuration paths. The actual committed
runner and hosted CMS migration remain separate qualification steps.

Legacy no-CA behavior is temporarily retained while environments are converted.
Retiring encrypted-but-unverified TLS remains an open cutover and final-security
item; these probes do not close it or constitute an advisory exception.

### Isolated hosted runner and preview binding

Commit `b6317ff1493e748f58c479a0a0d2054adfe69151` passed normal full pre-push
verification. Its committed runner then applied the initial migration and both
public-beta migrations to the owned PostgreSQL 17.11 branch: 94 CMS tables,
three migration records, no retired size columns, and all 21 existing public
table row counts unchanged. Status reports all migrations applied; a repeated
migration is a no-op. The CMS-only backup restored into a separate owned local
database with all 94 table row counts unchanged. This bootstrap has three
migration rows and is separate from the earlier representative-data rehearsal.
The branch's parent business-history replay stopped at a missing `authz` schema;
that operational finding remains open and this fixture does not qualify a
complete hosted business restore.

The preview helper now requires the PR API's head branch when pulling preview
settings. The workflow still checks out the exact selected SHA, verifies it, and
binds that commit to the validated branch before the CLI runs. A real temporary
Git fixture proves the SHA is preserved and a mismatched SHA stops before branch
mutation. Twenty focused helper/workflow cases pass. Three new branch-only admin
preview Secrets configure the expiring isolated fixture; existing shared and
production credentials are unchanged. Hosted CMS HTTP checks and final-current-
head release gates remain required.

### Independent template document identities

Repeated creation from one template exposed copied persisted block IDs. New
pages now deep-clone the layout and let Payload generate new block and nested
FAQ/impact-stat row IDs. Relationship IDs, rich-text/custom-node IDs, reviewed
content, source templates, tenant checks and template links are preserved.
The endpoint regression fails against the previous source and passes after the
fix. The strict real-session browser suite creates two distinct pages from the
same template and passes all eight cases with no skips, retries or flaky results.
Its shell locator requires one visible native shell because Next Cache Components
can retain hidden Activity route views. All three compiled product builds and
2,234 tracked product inputs were verified before the locator-only rerun.

Preview delivery keeps raw CLI output private. Failed commands report bounded
process status and fixed signal, spawn-error and category labels so diagnosis
can continue without disclosing environment values. Five regressions verify
that raw output and arbitrary error/signal strings stay withheld. These labels
are diagnostic hints; a killed process alone does not establish a memory cause.

### Bounded preview failure categories

The published diagnostic head passed normal full pre-push verification, but its
admin QA build exited with status 1 and no matching category. It remains
unqualified. Ten additional fixed categories cover URL, network, TLS, memory,
compiler, module, prerender, framework and installation markers without emitting
raw child text. Every wildcard is bounded to 200 same-line characters. Review
caught one unbounded installation marker; its regression fails before the fix
and passes afterward. All 37 focused helper/workflow cases pass, and independent
review approves the corrected source, including large near-match checks.

A separate hosted Git build reported memory exhaustion and exit 137. The QA
status-1 failure is a distinct observation; diagnostic labels do not establish
a shared cause. Current-head previews and cutover remain required.

### Hosted preview delivery with provider-owned Secrets

The current CLI prebuilt path fails because Preview Secrets are returned as
placeholders. The public database configuration correctly rejects that placeholder
URL. Explicit QA now requests hosted Git-source builds for the approved PR branch
and exact SHA, verifies complete provider identity and Preview target, and waits
for READY. Application credentials stay with Vercel. Admin's verified hosted
8 GiB exhaustion is handled with a larger machine for that preview alone;
shared project settings and automatic deployment gates are unchanged.

Ignore decisions use the last successful project-and-branch deployment SHA,
including product changes before a documentation-only head. Missing, invalid,
unavailable or non-ancestor history requires building. Real Git regressions
fail before the fix. The focused delivery/workflow cohort passes 66 cases,
including first-poll failure, ownership recovery and bounded cancellation.
A failed ownership or cleanup readback remains an explicit unqualified result.
The earlier prebuilt helper is pending retirement after actual hosted-path
qualification; its diagnostic evidence remains historical. This local result is
not a deployed-preview or release completion claim.
