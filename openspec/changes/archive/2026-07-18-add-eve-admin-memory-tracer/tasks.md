## 1. Spec

- [x] 1.1 Author the capability spec (`specs/eve-admin-memory/spec.md`) with MUST/SHALL + GIVEN/WHEN/THEN scenarios
- [x] 1.2 Validate: `bunx @fission-ai/openspec@latest validate add-eve-admin-memory-tracer --strict`

## 2. Gates

- [x] 2.1 Focused tests, type checks, strict OpenSpec validation, full builds, and full unit suite pass

## 3. Memory model

- [x] 3.1 Private-admin scope with preferences / project-context / decision categories; memory is advisory, never authoritative
- [x] 3.2 Hard exclusion set at write time (secrets, credentials, payments, donor/customer PII, private keys, one-time codes, sensitive tenant facts) — applies on auto-save too
- [x] 3.3 Auto-save of allowed memory emits an audit event (event shape owned by #419)
- [x] 3.4 Full admin control: view, search, edit, delete, disable, category, scope, change history; disable stops auto-save without deleting
- [x] 3.5 Future tenant operational memory is schema-ready but disabled; memory access enforces user+tenant ownership; memory retention controlled separately

## 4. Boundary check

- [x] 4.1 No overlap with #418 (release/emergency state), #419 (audit event shape), #424 (run-log retention); tenant operational memory out of scope

## 5. Review

- [x] 5.1 Open a non-draft PR for code-owner review; ships disabled behind #418 release switch
