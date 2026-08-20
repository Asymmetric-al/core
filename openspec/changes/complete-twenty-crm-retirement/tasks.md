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

- [x] 3.1 Delete Twenty client, routes, webhooks, projections, sync, health, and dead UI after replacements are green
- [x] 3.2 Remove `TWENTY_*` and retired `CRM_SYNC_*` env fields
- [x] 3.3 Drop or leave Twenty-only tables only after row-count evidence; forward migrations only
- [x] 3.4 Extend data-boundary verification to fail on prohibited runtime Twenty references
- [x] 3.5 Record Vercel and Twenty Cloud cleanup or the exact human blocker

  Evidence (2026-08-18, no secrets): Vercel MCP listed team `Asymmetrical`
  (`team_YrLB8jJARcRH0jnF1HPpPGTB`) and projects `admin`
  (`prj_SB9DucsrJOT0wF1v43SWMFsSNdn8`), `donor`
  (`prj_dZG3XkklLVZyqm85FW5Vvv7ph3kL`), and `missionary`
  (`prj_6tXSJKsdv2JpK70GKkg9HIg5hiYN`). MCP has no environment-variable
  list/remove tools. This environment has no authenticated Vercel CLI session.
  Twenty Cloud has no authorized API in this run. Human follow-up: remove any
  remaining `TWENTY_*` / `CRM_SYNC_*` vars from those three projects and
  revoke the development Twenty Cloud API key / unused proof workspace.

## 4. Verification

- [x] 4.1 Focused CRM unit tests pass
- [x] 4.2 Data-boundary / non-regression guard tests pass
- [x] 4.3 Applicable lint, typecheck, and CRM UI checks pass
- [ ] 4.4 Do not archive until this implementation is accepted on `develop`
