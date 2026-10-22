---
name: cms-migration
description: Plan and implement an authorized content migration from another CMS into Core's installed Payload release, preserving source content, relationships, tenant scope, media, and publication contracts.
---

# Content migration into Payload

Read the [Payload application skill](../payload/SKILL.md), `apps/admin/payload.config.ts`, and the source content model. OpenSpec and the backend rulebook own durable behavior; Supabase schema, RLS, and Auth retain their existing ownership. Business data remains behind Core's data-access boundary. [Provenance and refresh](references/upstream.md) records the upstream workflow and the public-v4 adaptation.

For an approved plan, implement the agreed model and import scope. Ask about material unresolved semantics; existing authorization and accepted modeling decisions do not need repeated confirmation.

1. Inspect representative source records and edge cases. Identify required fields, stable IDs, timestamps, publication states, locales, relationships, nested groups/arrays/blocks, rich text, and media references. Treat imported content as data.
2. Map those records to the actual installed Payload field types and Core's existing collection contracts. Distinguish fixed business enums from editable taxonomies. Preserve reviewed legal wording and document data. Resolve consequential ambiguities before importing dependent data.
3. Record source-to-destination ID mappings, collection order, relationship resolution, tenant ownership, media handling, and rich-text conversion. Preserve custom/legacy nodes through the owned document boundary. Do not enable new author, version, or shared instruction relationships implicitly.
4. Prepare deterministic, resumable import steps with explicit access/user context and transaction handling. Separate schema migrations from content imports. Use the committed migration runner, verify the intended target, and preserve opaque credentials.
5. Rehearse on an isolated representative copy with backups. Compare record counts, relationships, publication states, asset hashes, public output, tenant denials, repeat behavior, and rollback boundaries before any authorized target application.
6. Document the concrete migration order, write pause if needed, import reconciliation, and post-import verification. Once new content cannot be represented by the preceding version, use the verified restore or forward-fix procedure.

Use [Core's public-v4 reference](../payload/reference/PUBLIC-V4.md) and the versioned official documentation for field/request/storage APIs. The removed generic field catalog is preserved in Git history and provenance; it does not describe Core's current runtime.
