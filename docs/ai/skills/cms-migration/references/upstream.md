---
source_name: payloadcms/skills (cms-migration workflow; Core public-v4 adapter)
source_url: https://github.com/payloadcms/skills
reviewed_commit: 832d5bc4258ae784f08cb7f03a3a674d6b2fa5f1
last_reviewed: 2026-10-22
---

# CMS migration skill provenance

The reviewed upstream workflow is `skills/cms-migration/`. Core retains source analysis, explicit field/relationship decisions, collection ordering, media/rich-text handling, and preservation checks, with its existing domain and authorization boundaries. The obsolete copied field catalog is replaced by the installed declarations and [Core's public-v4 reference](../../payload/reference/PUBLIC-V4.md).

Canonical source is `docs/ai/skills/cms-migration/`, sharing the installed upstream identity. The sync script fully owns that runtime directory. Previous copies and hashes are recorded in `docs/maintenance/modernization/payload-skill-provenance.json` and Git history.

Refresh the official upstream commit and versioned Payload API sources, reconcile this Core adapter without losing accepted modeling decisions, and run `bun run skills:sync` and `bun run skills:verify`. Use the existing authorized migration scope; a refreshed skill does not authorize new live imports.
