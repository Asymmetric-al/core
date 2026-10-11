# Tasks

## 1. Reviewed upstream refresh

- [x] 1.1 Add a failing public-command test for an explicit Emil source directory.
- [x] 1.2 Support the reviewed source through existing transactional publication.
- [x] 1.3 Verify invalid inputs preserve canonical files and provenance.

## 2. Canonical Emil pack

- [x] 2.1 Add `animation-performance` and `break-ui` with required companion assets.
- [x] 2.2 Refresh reviewed upstream bytes and reconcile existing Core overlays.
- [x] 2.3 Preserve raw source hashes, licenses, aliases, and adapter boundaries.
- [x] 2.4 Regenerate and verify Codex, Cursor, and Claude Code mirrors.

## 3. Scoped environment guidance

- [x] 3.1 Document global discovery and reusable environment setup.
- [x] 3.2 Separate file validation from app registration and picker acceptance.
- [x] 3.3 Update contributor guidance and deterministic skill routing.

## 4. Validation and review

- [x] 4.1 Run focused refresh, inventory, provenance, and mirror checks.
- [x] 4.2 Run formatting, OpenSpec, and normal repository readiness checks.
- [x] 4.3 Review the final diff and confirm product/database files are unchanged.

Hosted picker registration is a separate environment acceptance gate. Repository
checks must not mark that gate passed without an actual registered app catalog
and successful picker invocation.
