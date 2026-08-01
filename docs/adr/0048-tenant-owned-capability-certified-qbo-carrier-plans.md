# ADR-0048: Tenant-owned, capability-certified QBO Carrier Plans

**Status:** Accepted (founder ruling, Phase 20 grill session — D7)

> Working record:
> `docs/prds/sitestacker-parity/phase-20-accounting-exports-reconciliation-decision-log.md`

## Context

Missions organizations do not organize QuickBooks Online uniformly. Intuit
supports several dimensions with materially different meanings and limits:
Accounts and subaccounts affect the general ledger; Products and Services route
supported sales lines to accounts; Classes can segment supported income and
expense activity; Locations are transaction-wide business-unit dimensions; and
Customers and Projects support summary-counterparty or project-profitability
use cases. Subscription, preference, object-state, transaction-position,
capacity, and API scope determine which choices are available.

Class-led reporting is a strong nonprofit default, but it cannot be mandatory.
Some tenants reserve Classes for functional expense reporting, use genuine
account or subaccount structures, use Items for revenue purposes, use
Customer-linked Projects for missionary or grant profitability, or intentionally
retain exact designation detail in Asym while posting summarized accounting
activity to QBO. A fixed Class-only model would reject valid existing books.

Unlimited tenant field assignment would be equally unsafe. An arbitrary rules
engine could duplicate accounting meaning across fields, hide blank
fallthrough, misuse transaction-wide carriers, create provider-object
explosions, or produce outputs that are balanced but wrongly classified and
difficult to explain.

## Decision

For each QBO Accounting Destination, Asym uses one immutable, prospective,
tenant-owned **QBO Carrier Plan**. The plan defines the supported carrier kinds,
certified D5 posting-recipe positions, role-collision rules, visibility, and
capability proof. D6 owns each exact semantic-role or
Reporting-Target-to-provider-object binding instance; the QBO Carrier Plan
validates and pins or digests the compatible D6 binding set. The plan consumes
D4 Canonical Accounting Effects and D6 Accounting Reporting Targets; it cannot
establish accounting policy, source identity, donor restriction, amount,
currency, accounting date, or recognition.

The ordinary setup recommends compatible whole-plan defaults. Class-led,
account/subaccount-led, Item-led revenue, selective Customer/Project-led,
Location-led, combined, and Asym-detail/QBO-summary arrangements may be used
when the connected company can represent them correctly. `Advanced accounting
setup` exposes one fixed semantic-role matrix, not formulas, arbitrary
predicates, ranked precedence, wildcard rules, raw payloads, or a generic
provider DSL.

A tenant may keep an unconventional but technically supported arrangement.
Asym warns about high cardinality, fragmented or partial reporting, privacy
exposure, transaction partitioning, bank-matching consequences, and approaching
capacity, then permits one authorized finance actor to confirm the choice.
Asym blocks only objective failures: imbalance or effect inequivalence,
incomplete or duplicate source coverage, unsupported carrier position, a
single-valued field collision, invalid provider references, capability or
capacity impossibility, Tenant/Legal Entity/destination/realm/currency
violation, prohibited data exposure, or silent material detail loss.

Every plan records its destination, realm, environment, currency, detected
subscription and preferences, stable provider object identifiers, expected
object properties, certified recipes and positions, privacy posture, QBO
Reporting Visibility, compiler and provider-contract versions, effective date,
actor, activation evidence, and a time-bounded **QBO Capability Certificate**.
Exactly one plan version is active prospectively for its scope. Historical
Accounting Releases remain pinned; correction and reconciliation preserve their
original carrier semantics.

Class, Account, Item, Location, Customer, Project, and Asym-only representations
are not interchangeable. One primary carrier is selected for each semantic role
at each certified recipe position. Separate roles may use separate dimensions,
and a role may use different supported carriers across operation families only
when the plan truthfully discloses the resulting full, revenue-only,
expense-only, transaction-wide, project-specific, split, or Asym-only reporting
coverage. Mixed-target work must use a supported line carrier, a complete and
disjoint deterministic partition, or stop before delivery.

Activation and every release preflight certify current capabilities and
provider references. Rename refreshes current display metadata only. Archive,
type or account-routing change, hierarchy change, preference change, plan
downgrade, permission loss, currency mismatch, or scope loss creates
`Attention needed` and blocks only affected future work. Asym never modifies
provider preferences, restructures the chart, creates objects, substitutes a
carrier, falls back to Journal Entry, or changes delivery lanes silently.

Direct execution is operation-granular, idempotent, ambiguity-safe, and
evidence-always. Stable provider request identifiers, deterministic references,
lookup-before-retry, complete/disjoint partition evidence, exact object
readback, and drift-aware reconciliation are required. HTTP success alone is
not proof of provider effect, and direct-delivery failure does not silently
become artifact import.

The staff experience is one recommendation-first, exception-first
**Accounting → Posting profile → QuickBooks setup** workspace. It identifies
the connected company and active plan, asks how the tenant already tracks
funds, reveals only the required semantic roles, provides server-searchable
provider selectors, shows QBO Reporting Visibility and affected monetary
exposure, renders a production-shaped unsent QBO preview, and offers one prospective
`Review and activate` action. Healthy plans remain quiet. Tenant policy may
require a second approver, but dual control and recurring release approval are
not platform defaults.

## Consequences

- Tenant freedom is preserved inside genuine QBO semantics and the tenant's
  accountant-confirmed D4 policy; Asym does not prescribe one chart or fund
  method.
- Common setups remain short and guided while unusual existing books remain
  supportable through a bounded advanced surface.
- Reporting coverage is explicit. A tenant cannot mistake revenue-only,
  transaction-wide, split, or Asym-only detail for full QBO fund reporting.
- Provider capability and drift affect future representation without mutating
  source facts, accounting meaning, mapping history, or released evidence.
- QBO-specific carriers remain downstream and non-portable. A new realm or
  provider requires destination-owned rebinding and proof.
- The platform does not provide arbitrary carrier rules, blank fallthrough,
  silent defaults, per-release overrides, raw payload editing, donor contact
  synchronization, automatic QBO restructuring, or stop-the-world recovery.
