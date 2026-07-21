# Proposal: Eve private admin memory tracer bullet

**Implementation change for GitHub issue #422.** Builds on #418 (governance
state / release switch) and #419 (audit event shape).

## Why

Eve's memory is the single feature most able to turn a helpful assistant into a **hidden data leak**, so it
needs a durable, spec-level contract before any runtime code stores a byte. The PRD is explicit that Eve
memory **starts as private admin memory** for communication preferences, project working context, and
decisions, **with strict exclusions**
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:434]; that it
**auto-saves allowed memory and emits audit events**
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:441]; that the
admin gets **full memory control** — view, search, edit, delete, disable, category, scope, and change history
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:443]; and that
the schema is **designed for future tenant-scoped operational memory that is not live** until categories,
retention, deletion, export, and audit rules are explicit
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:437]. The
implementation plan types this as slice #6, **blocked only by #418 and #419** (both already proposed), so it
is the next unblocked governance-foundation slice.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:118]

The user stories require memory to be **helpful but never authoritative**
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:116], to
**exclude secrets, credentials, payment data, donor or customer PII, private keys, one-time codes, and
sensitive tenant facts**
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:123], and to keep
tenant operational memory **disabled** until its rules are explicit
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:138]. Slice #422
makes those a spec-level contract.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:115]

## What Changes

- Add a new OpenSpec capability `eve-admin-memory` (spec delta in `specs/eve-admin-memory/spec.md`) stating:
  memory is **private-admin-scoped** and organized into **preferences, project-context, and decision**
  categories; memory is **advisory, never authoritative** over product intent or repo rules; a **hard
  exclusion set** keeps secrets/credentials/payment/PII/keys/one-time-codes/sensitive-tenant-facts out of
  memory entirely; **auto-save of allowed memory emits audit events** (event shape owned by #419); the admin
  has **full control with change history** (view/search/edit/delete/disable/category/scope); the schema is
  **future-tenant-ready but tenant operational memory stays disabled** until its rules are explicit; and
  memory access and retention **enforce user + tenant ownership** and grant **no autonomy**.
- Record the decision as an ADR in this change's `design.md`.
- Implement owner-and-tenant-bound Supabase storage, immutable versions,
  category auto-save settings, full admin CRUD/search/history controls, and
  value-free excluded-write audits under ADR-0023.

## What Does Not Change

- No runtime-context retrieval or autonomous use of memory. Automatic writes
  remain behind the disabled #418 release switch.
- Raw secrets / credentials / payments / donor or customer PII / private keys / one-time codes / sensitive
  tenant facts are **never** stored in memory — the exclusion set is a hard boundary, not a redaction pass.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:123]
- The **shape** of the audit event emitted on memory writes is #419's scope; the **release/emergency-off
  state** that gates whether memory is live is #418's. This change governs the memory **contract** only.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:118]
- **Memory retention** (history/deleted-entry policy) is controlled **separately** from run-log retention and
  is not activated here.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:310]
- **Tenant operational memory** is schema-ready only; it is not enabled by this change.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:437]
- Subordinate to OpenSpec, `AGENTS.md`, and `openspec/project.md`.
  [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Expected Outcome

- A validated OpenSpec change (`bunx @fission-ai/openspec@latest validate add-eve-admin-memory-tracer
--strict`) that makes private admin memory — categories, hard exclusions, audited auto-save, full admin
  control, and a disabled future-tenant schema — a durable, spec-level contract.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- A clear boundary: #419 defines the **shape** of the audit event a memory write emits, #418 holds the
  **enable/emergency** state, and #422 defines **what memory is, what it must exclude, and how the admin
  controls it**.
