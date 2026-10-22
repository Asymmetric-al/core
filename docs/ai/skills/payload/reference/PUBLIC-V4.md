# Core public Payload v4 compatibility

This reference follows Core's installed public `4.0.0-beta.3` cohort. Recheck it when changing that cohort. The [versioned migration guide](https://github.com/payloadcms/payload/blob/v4.0.0-beta.3/docs/migration-guide/v4.mdx), installed declarations, and actual Core integration take precedence over generic v3 examples.

## Requests, access, and relationships

- Create a request with public `createPayloadRequest`; `createLocalReq` was removed. Pass the verified authenticated user and preserve `req` through nested operations and hooks.
- Local API access is enforced by default (`overrideAccess: false`). Explicitly set `true` only for an owned trusted operation whose input and tenant scope are already governed. Supplying a user does not authorize privileged access.
- Default relationship depth is 1. Use explicit depth where the response contract needs it; `depth: 0` returns relationship IDs. The authenticated preview intentionally uses depth 2.
- Collection defaults changed. Preserve Core's explicit versions and `authorship: false` settings rather than adding unreviewed history or author relationships.
- Core's tenant access functions and published-content resolver remain authoritative. A serializer formats already-authorized content; it does not authorize a tenant.

Inspect `apps/admin/src/cms/access`, `auth/supabase-strategy.ts`, `public/published-content-reader.ts`, and `create-from-template-endpoint.ts`. Tests cover explicit access, inherited authenticated request context, anonymous denial, and tenant filters.

## Admin integration and design system

Core's `(payload)/layout.tsx` embeds public `RootProviders` using `getRootLayoutData` from `@payloadcms/ui/layouts/Root/getRootLayoutData` inside the existing Mission Control document shell. Keep the staff gate before Payload initialization. The provider owns its portal and progress UI; do not add a second document shell or duplicate these elements.

`apps/admin/src/styles/payloadStyles.css` bridges Payload's semantic component variables to Core's existing semantic tokens. Preserve Base UI, exact `base-maia`, keyboard/focus behavior, light/dark semantics, and reduced motion. Old theme/elevation ramps are retired.

## Uploads and storage

The Payload cohort includes `@payloadcms/transformer-sharp`. Configure upload transformation at root `upload.transformers`; media variants belong in the transformer's per-collection `variants` configuration. Collection `imageSizes` and root `sharp` are removed.

Core retains thumbnail 320×320 and card 960×540, allowed MIME types, focal cropping, animated GIF behavior, and original file bytes. Stored media uses `variants`; the two public serializers preserve their existing allowlisted URL DTO. Do not expose `original`, storage prefixes, object keys, or other internal metadata.

Storage uses root adapters. Keep Blob disabled when its token is absent. Declarative `admin.dependencies` retains the Blob client upload handler during credential-free import-map generation; a fake provider token is unnecessary. Native dependency floors are independently verified for the actual transformer and other consumers.

Migrate existing `sizes` through the official data-preserving predefined migration before the metadata migration. Inspect custom-field collisions and additional metadata columns first. Core's second migration renames the one overlong versioned impact-stat items table in place and preserves the seven other table identities.

## Lexical documents and generated types

The public release generates the configured editor's node union. Core's existing content permits custom and legacy nodes. Its three owned rich-text field definitions apply `coreRichTextDocumentSchema` through the supported field `jsonSchema` transform to preserve that document envelope and open node metadata. The shared body block covers template, standard, giving, and project layouts.

That transform affects generated types **and MCP write validation**. Keep it aligned with `CmsRichTextDocument` and test both input and output schemas. Preserve document/node metadata and required root fields. Do not invent a type-generation-disable editor option, widen every collection, delete generated types to hide errors, or add broad type assertions.

Use public typed editor helpers when they preserve the intended content. Core's empty template fallback clones the existing default document exactly, preserving its format and avoiding shared mutable state.

## Authentication

Core's sole auth collection disables the local strategy and verifies Supabase cookie sessions through its custom strategy. Those sessions do not require reauthentication solely because of Payload's token change. Preserve verified tenant/session mapping and the normal sign-in, refresh, and logout boundaries.

Old internal Payload JWTs lack the protected `authVersion` header and public v4 rejects them. Reissue those tokens if used; do not add a legacy-token bypass. Upstream refresh can emit a new Payload JWT after custom authentication, but it cannot independently authenticate while Core's local strategy remains disabled. CMS Bearer-only authentication remains unsupported by the custom strategy. A `/me` response can be HTTP 200 with `user: null`; check the user, not only the status.

## Migration and rollback

Use `scripts/cms/run-payload-command.mjs`, which parses the installed CLI's global options before applying the target guard. Its allowed commands cover migrations, generation, help, and info. New upstream CRUD, job, and arbitrary-script commands do not inherit migration credentials through this runner.

The public-v4 down migration locks media before checking for new metadata. After uploads or storage metadata have been written, it refuses lossful rollback. Follow the runbook's verified backup/restore or forward-fix boundary. A short write pause does not replace the committed guard. Production execution is a separate authorized release step.
