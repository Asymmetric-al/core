Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-reference-guide"></a>

# Reference checks

The original reference suite below applies to the immutable research asset layout, with Python 3 and `jsonschema` installed. Run it from `docs/prds/program-roadmap/source-2026-09-22/assets/web/`; it proves structural examples only. The operative package check is `node docs/prds/web-studio-hybrid/tools/verify-package.mjs`:

```bash
python -m unittest discover -s tests -v
```

The suite checks structural examples and an in-memory model of selected save/candidate semantics. It does not execute Core, Payload, Supabase, PostgreSQL, Puck, GitHub callbacks, a browser or any production service. It is not the Core implementation and must not be deployed as the product API.

Semantic content and custom setting values deliberately remain owner-decoded. The reference catalog version 1/type set is an illustration for structural fixtures, not a claim that every current Core collection maps one-to-one to these IDs. Use the exact accepted catalog when implementing the TypeScript adapter and full real-stack tests.

A passing fixture with qualification status `candidate` is not an admitted artifact. Example source IDs, digests and rights references are invented and labeled fixtures.

---
