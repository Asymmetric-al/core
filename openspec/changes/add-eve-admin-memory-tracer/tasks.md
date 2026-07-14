## 1. Spec

- [ ] 1.1 Author the capability spec (`specs/eve-admin-memory/spec.md`) with MUST/SHALL + GIVEN/WHEN/THEN scenarios
- [ ] 1.2 Validate: `bunx @fission-ai/openspec@latest validate add-eve-admin-memory-tracer --strict`

## 2. Gates

- [ ] 2.1 `eve-judge --change` PASS; `cite-verify` clean; `qa-gates.sh --change` machine gates (0/1/3) PASS

## 3. Memory model (spec-level; implemented in a later PR)

- [ ] 3.1 Private-admin scope with preferences / project-context / decision categories; memory is advisory, never authoritative
- [ ] 3.2 Hard exclusion set at write time (secrets, credentials, payments, donor/customer PII, private keys, one-time codes, sensitive tenant facts) — applies on auto-save too
- [ ] 3.3 Auto-save of allowed memory emits an audit event (event shape owned by #419)
- [ ] 3.4 Full admin control: view, search, edit, delete, disable, category, scope, change history; disable stops auto-save without deleting
- [ ] 3.5 Future tenant operational memory is schema-ready but disabled; memory access enforces user+tenant ownership; memory retention controlled separately

## 4. Boundary check

- [ ] 4.1 No overlap with #418 (release/emergency state), #419 (audit event shape), #424 (run-log retention); tenant operational memory out of scope

## 5. Review

- [ ] 5.1 Human sign-off (code owner) before any PR to `core:develop`; ships disabled behind #418 release switch
