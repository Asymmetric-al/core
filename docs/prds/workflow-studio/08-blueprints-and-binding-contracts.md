# 9. Reference definitions and implementation binding contracts

The package includes **16 structured reference definitions** under `blueprints/`, a dialect JSON Schema, a machine-readable recipe catalog, and a source-contract register. These are build specifications and fixtures, not already installed tenant automations. All definitions are disabled, use synthetic semantic bindings instead of real tenant records, and reject historical enrollment by default.

Blueprints deliberately exercise the same DSL across simple automations and human processes. BP-04 spans application submission, parallel references/interviews/screening, decision routes, conditional requirements, and BP-05's post-acceptance agreements, training, operational setup, final readiness, and receiving handoff. “Onboarded” is not “deployed.” BP-06 coordinates expense evidence without approving claims. BP-09 keeps care metadata within a sealed purpose. BP-10 routes a Support Hub conversation without creating a separate inbox.

## Blueprint index

| Definition | Recipe  | What it proves in the eventual implementation                          |
| ---------- | ------- | ---------------------------------------------------------------------- |
| BP-01      | GEN-01  | Initial inquiry and accountable response                               |
| BP-02      | DON-01  | First-gift coordinated stewardship                                     |
| BP-03      | ADM-01  | Staff onboarding with source-owned access                              |
| BP-04      | MOB-02  | Application through fully completed onboarding                         |
| BP-05      | MOB-08  | Post-acceptance onboarding through handoff                             |
| BP-06      | FIN-08  | Expense-evidence follow-up without approval authority                  |
| BP-07      | MPD-04  | Coaching check-in with redacted views                                  |
| BP-08      | COM-01  | Ministry Update review and publication                                 |
| BP-09      | CARE-01 | Sealed member-care intake                                              |
| BP-10      | GEN-13  | Support conversation routing and response                              |
| BP-11      | GEN-06  | Private document request and review                                    |
| BP-12      | GEN-10  | Registration and source-owned capacity                                 |
| BP-13      | DON-10  | Recurring occurrence service follow-up                                 |
| BP-14      | ADM-06  | Permitted custom-record review                                         |
| BP-15      | DON-03  | Explicit currency/minor-unit threshold with tenant-reviewed parameters |
| BP-16      | GEN-09  | Durable wait on source-accepted renewal evidence                       |

## Binding completion checklist

For every contract in `contracts/source-contract-register.json`, the owning domain must provide a real versioned adapter, runtime and compile-time input/output schemas, source permission checks, allowed audience projection, event mapping, exact success/decline/unknown outcome meaning, permanent effect identity where applicable, source conflict/cancellation behavior, privacy-safe diagnostic result, and no-side-effect simulation fixture.

The current artifacts intentionally do not pretend these symbolic names already exist in Core. The target code must adapt existing services first. A newly invented `expenses.approve` implementation is not an acceptable substitute for the source-owned follow-up contract. A missing certified private-byte service cannot be replaced with a public upload bucket. A source event must be emitted from the authoritative accepted command, not inferred from an arbitrary table update.

A bound subflow invokes a separate child engagement at an exact published version and returns a source-approved outcome to its parent. Its terminal node ends only the child engagement. Parent and child record linked scope, causation, cancellation, and completion. No child gets more data or capabilities than the intersection of its own grant and the parent's permitted delegation. Reusing an already-completed child requires exact source/evidence equivalence; a new invocation cannot silently count an unrelated old completion.

## Reference fixture limits

The blueprints omit real message bodies and sensitive values by design. Tenant setup resolves the safe source publications, permitted forms, exact role qualifiers/fallbacks, calendar policy, and scope. Structural schema validation does not verify deployed source availability, tenant permissions, provider behavior, database races, or production performance. The included verification report lists only the checks actually executed while assembling this package.

## Reference semantics requiring source qualification

BP-12 keeps a waitlisted registration active and waiting until the event owner records a final disposition. Capacity reservation, offer, participant acceptance, offer expiry and cancellation are native event-domain operations. Studio neither allocates seats from a count nor treats an elapsed deadline as approval. Source uncertainty keeps the wait open; named final non-admission outcomes use a separate branch. A held unknown disposition requires review, not silent restart.

BP-04's declined/withdrawn/deferred routes terminate with the exact process disposition. A later return uses the held-disposition/reapplication contract in the language specification. Source completion can also withdraw/cancel a run globally, including while it is waiting in a subflow; cancellation must fence pending work and reconcile already-started effects.

Required capability names are proposed readiness labels, not existing feature flags or permission grants. The register includes triggers as well as facts/actions and keeps every purpose for reused contracts; a contract certified for ordinary inquiry use is not thereby certified for care use.

## Form reference fixtures

Four inert form examples (`form-blueprints/FORM-01.json` through `FORM-04.json`) exercise inquiry capture, application, confidential reference, and coaching check-in. These are starting field sets, not a prescribed theological screening instrument or complete personnel/clinical questionnaire. Tenants bind permitted fields, wording and requirements through the source owner. No health or counseling question is placed in an ordinary application fixture.

The form schema defines versioned pages, field types, source-command mappings, conditional visibility, partial save, and immutable accepted submission snapshots. It is not a second CRM schema. In FORM-03, a private reply-email question appears only when the reference requests confidential follow-up. Its visible required status is enforced server-side; hidden values are excluded from accepted submissions and effects, with source-retention rules controlling any existing drafts/history. False, missing, and stale facts remain distinguishable.

Mappings are proposed owner-command and field contracts, never raw SQL paths. Displayed field classification can only be raised by tenant configuration; the source floor wins. Render and submission authorization is rechecked for every field. Version-dependent accepted answers do not change when a draft form is edited. Conditional visibility is not an access control. Form endpoints require purpose-bound access, rate limits, anti-CSRF where cookies apply, and semantic duplicate-submission checks. Private file requests use the separate evidence service rather than embedding file bytes here.
