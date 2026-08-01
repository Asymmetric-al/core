# Tenant-controlled, policy-bounded Accounting Release cadence

**Status:** Accepted (founder ruling, Phase 20 grill session — D12)

Phase 20 exposes one quiet **Ready for Accounting** workspace governed by a
prospective, immutable **Accounting Release Cadence Policy Version**. The
policy is scoped to one Tenant, Legal Entity, Accounting Destination,
delivery lane, and product-owned Accounting Posting Intent family. It lets an
authorized tenant choose among three goal-based modes: release eligible
routine work automatically, prepare it on a bounded schedule for staff review,
or wait for staff to release it. Timing and review are tenant choices;
readiness, accounting treatment, source coverage, period policy, destination
identity, provider capability, and immutable-release rules are not.

A **Release Candidate** is only a derived, recomputable projection. Every
manual, scheduled, or automatic trigger enters the same release service and
must revalidate exact source versions, policies, mappings, Carrier Plans,
destination authorization, period treatment, and exceptions at one atomic
**Accounting Release fence**. Only that fence may create an immutable
Accounting Release. Revalidation may remove changed work from a reviewed set
but may never silently add newly eligible work to it. A bulk action is an
operational convenience rather than a provider transaction: changed or
blocked units return to review while unrelated reviewed and eligible units may
proceed, with exact results disclosed.

Creating a release never means that QuickBooks Online or Xero accepted it.
Direct delivery remains operation-granular, provider-rate-aware, idempotent,
read-before-retry, and exactly read back under the D2, D7, D8, and D11
contracts. Staff-mediated delivery may automatically prepare its immutable
artifact but cannot mark an external import complete. Provider failure never
silently changes the release's mutually exclusive delivery lane.

**Pause upcoming releases** affects only future release fences in the selected
scope; already frozen releases and in-flight provider operations continue.
**Release now** may advance eligible work but cannot bypass any gate, provider
backpressure, or tenant-fair scheduling. Pause, resume, schedules, and manual
release converge through one transactional fence with deterministic release
identities and durable, PII-minimized execution evidence.

The ordinary experience is one action-first **Release Horizon** showing what
needs staff, what will happen automatically and when, what is blocked and why,
and what recently released. Status text preserves readiness, release,
provider-delivery, readback, drift, and reconciliation as separate truths.
Configuration uses bounded schedule presets with an explicit IANA timezone and
visible next occurrence, not arbitrary cron expressions, tenant-authored
rules, approval-chain builders, or a second accounting workflow engine.
