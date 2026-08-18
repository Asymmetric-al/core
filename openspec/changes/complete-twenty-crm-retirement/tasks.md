# Tasks: Complete Twenty CRM Retirement

## 1. Specification

- [x] 1.1 Record current Twenty-backed notes and relationships request paths
- [x] 1.2 Write the `crm-core` delta that makes Asym Postgres CRM truth and prohibits Twenty
- [ ] 1.3 Keep this change active until replacement, deletion, and guards have merged

## 2. Local CRM replacements (TDD)

- [x] 2.1 Failing tests for local relationship reads and tenant isolation
- [x] 2.2 Implement Asym Postgres relationship reads; remove Twenty mode/labels from that path
- [x] 2.3 Failing tests for local note create, tenant isolation, restricted visibility, read-after-write, and audit
- [x] 2.4 Implement authoritative local notes with forward migration and RLS
- [x] 2.5 Keep Mission Control notes and relationships screens working without Twenty

## 3. Twenty runtime removal

- [ ] 3.1 Delete Twenty client, routes, webhooks, projections, sync, health, and dead UI after replacements are green
- [ ] 3.2 Remove `TWENTY_*` and retired `CRM_SYNC_*` env fields
- [ ] 3.3 Drop or leave Twenty-only tables only after row-count evidence; forward migrations only
- [ ] 3.4 Extend data-boundary verification to fail on prohibited runtime Twenty references
- [ ] 3.5 Record Vercel and Twenty Cloud cleanup or the exact human blocker

## 4. Verification

- [ ] 4.1 Focused CRM unit tests pass
- [ ] 4.2 Data-boundary / non-regression guard tests pass
- [ ] 4.3 Applicable lint, typecheck, and CRM UI checks pass
- [ ] 4.4 Do not archive until this implementation is accepted on `develop`
