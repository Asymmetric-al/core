---
source_name: payloadcms/skills (reviewed reference; Core public-v4 adapter)
source_url: https://github.com/payloadcms/skills
reviewed_commit: 832d5bc4258ae784f08cb7f03a3a674d6b2fa5f1
last_reviewed: 2026-10-22
---

# Payload skill provenance

Core owns this version-specific adapter. The current upstream skill at the reviewed commit still describes access bypass and relationship depth 2 defaults, which differ from Core's public Payload v4 release. The copied generic manual and duplicate canonical/runtime identities were removed; their paths, hashes, reviewed source blobs, and replacement are recorded in `docs/maintenance/modernization/payload-skill-provenance.json`. Git history preserves the previous copies.

Canonical source is `docs/ai/skills/payload/`, sharing the installed upstream identity `payload`. The sync script fully owns that runtime directory so obsolete upstream references cannot survive an overlay. `skills-lock.json` records the upstream install's identity/hash; it does not replace the Core adapter's provenance or final artifact hashes.

To refresh, check the currently selected Payload release and its versioned migration guide, then compare the pinned upstream skill tree with its current official commit. Reconcile useful material into this adapter while preserving Core's OpenSpec/backend/Supabase/data/UI ownership, access and document contracts. Record source commits and hashes; do not overwrite the adapter with a generic installer result. Run `bun run skills:sync` and `bun run skills:verify`, and review the canonical/mirror diff.
