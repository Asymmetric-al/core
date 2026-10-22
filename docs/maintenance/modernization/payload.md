# Public Payload v4 checkpoint

Tracking: [AL-1965](https://github.com/Asymmetric-al/core/issues/1965).
Status: implemented locally; full repository, browser and release qualification
remain open. Production execution is outside this delivery.

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

All 50 selected existing/focused CMS files and 516 cases pass. Four additional
actual SDK JWT cases verify signed legacy/wrong-version denial, a valid current
token and the disabled-local-strategy boundary. Generated types remain present
during typechecking. All three applications build against the owned local Auth
service with bypass disabled. The real-session browser probe verifies password
sign-in, refresh, sign-out, CMS mounting, upload/variants/original bytes, foreign
tenant and non-staff denial, keyboard and reduced motion. All eight selected
existing CMS browser cases pass without skips, including native autosave and
seeded editor/template/preview flows. Mission Control retains its forced-light
contract under either system preference; a temporary CSS token fixture checks
the dark mapping without enabling product dark mode. The [qualification record](payload-qualification.json)
freezes versions, source and evidence as qualification proceeds. Clean combined
installation, complete gates, all three deployed previews, independent final
review and merge readback remain
required before this checkpoint closes.

The [operations runbook](../../guides/development/web-studio-runbook.md)
contains migration order, write pause, backup/restore and rollback boundaries.
The [skill provenance](payload-skill-provenance.json) records consolidation of the
duplicate Payload skills and retirement of generic v3 examples; current Core
adapters preserve access, tenant, document, UI and migration ownership.

Source: [official versioned v4 migration guide](https://github.com/payloadcms/payload/blob/v4.0.0-beta.3/docs/migration-guide/v4.mdx).
