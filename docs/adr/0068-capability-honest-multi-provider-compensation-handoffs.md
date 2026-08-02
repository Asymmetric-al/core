# Capability-honest multi-provider compensation handoffs

**Status:** Accepted (founder ruling, Phase 21 grill session — D7)

Phase 21 launches with a portfolio of fully built **Compensation Handoff
Adapters**, where fully built means complete support for each adapter's exact
certified capability rather than fictional parity behind provider logos. The
launch portfolio includes exact provider- and region-pinned Gusto Employee
Payroll Draft, ADP Workforce Now Pay Data Input, separately certified Xero
Payroll Australia and New Zealand draft-input adapters, and
capability-complete QuickBooks Workforce and Xero Payroll UK
readback-and-artifact adapters where no equivalent safe per-run write exists.
The Phase 21 multi-provider launch is incomplete until at least two distinct
direct-write adapters hold current production authorization and pass an exact
production-shaped canary and certification. Artifact/readback continuity may
remain usable, but it is not the ratified D7 launch. Code-complete,
sandbox-only, or vendor-review-pending work does not satisfy that gate.

Every authorized Compensation Funding Decision still produces one immutable,
content-addressed, PII-minimized **Compensation Handoff Package**. The artifact
always exists for evidence and continuity, but the package selects exactly one
executable delivery lane. Artifact fulfillment and provider draft input cannot
both execute for the same covered work. A separately certified Phase 20 source
handoff remains the only accounting route; a payroll connection is not an
Accounting Destination Connection, and Phase 21 cannot create QBO/Xero
accounting truth.

One immutable prospective **Compensation Draft Delivery Profile Version**
binds the exact Tenant, Legal Entity, provider organization, provider product,
country, environment, external provider participant/payee reference, currency,
pay cycle, component-role mapping, and certified operation. This reference is a
provider-domain target identity, not a Support Assignment Participant
Membership, and is never inferred from participation; implementations use a
domain-qualified identifier such as `external_provider_participant_id` or
`external_provider_payee_id`. Exact provider identity and capability are
re-proved at activation and release. A later connection, mapping, scope, or
destination change creates a successor version and never retargets an existing
package or operation.

Staff receive provider-native preflight and preview before an explicit release.
The preview shows the Asym decision, exact provider target, existing provider
value when readable, proposed change, replacement-versus-add behavior, and
what Asym will not do. Provider-specific destructive or state-changing
preparation is disclosed before it happens. Unsupported semantic roles block;
they are never coerced into an adjacent earning, time, bill, template, or
accounting object.

Each mutation becomes an immutable **Provider Draft Operation** with
destination serialization, current concurrency or version evidence, exact
request/response identity, readback when the provider exposes it, drift
detection, and per-provider-target/component coverage. Covered units have only
three recovery dispositions: `confirmed_updated`, `proven_not_updated`, or
`outcome_unknown`. Only `proven_not_updated` residuals may enter an append-only
successor operation. `outcome_unknown` work remains quarantined for
inspect-before-retry or staff confirmation; it cannot be blindly retried or
switched to another lane. Provider and operation kill switches, tenant-fair
backpressure, authorization quarantine, certification expiry, and
artifact-always continuity bound failures without rewriting prior evidence.

Provider acceptance proves only the exact accepted input. The tenant's
external HR/legal authority and its configured provider records remain
authoritative for worker/payee classification and compensation entitlement;
payroll/AP providers remain authoritative for calculation, approval,
submission, posting, payroll/AP completion, and payment. QuickBooks Workforce
and Xero Payroll UK are
launch-complete through honest readback and artifact workflows unless and until
an equivalent per-run write is separately proved and prospectively certified.
Gusto contractor payment initiation, QBO accounting bills, Xero accounting
bills, payroll submission, payment initiation, destructive overwrite, blind
retry, dual delivery, and adjacent-object substitution remain outside this
decision.

The staff experience is one quiet provider-specific flow with literal actions
such as **Update Gusto payroll draft**, **Create ADP pay-data batch**, **Update
Xero AU/NZ draft payslips**, or **Prepare package for QuickBooks Payroll**.
Missionaries see only provider-neutral stages such as **Planned**, **With
payroll**, **Processing**, **Payment confirmed**, or **Needs attention**. No
surface calls a draft accepted, payroll completed, or money paid without the
separately authoritative evidence.

## Phase 21 D15 reimbursement-handoff clarification

D15 may reuse the technical provider-operation kernel established here:
destination serialization, idempotency, concurrency/version proof, exact
readback, drift detection, backpressure, kill switches, ambiguity quarantine,
and proved-residual-only recovery. It does not reuse a Compensation Handoff
Package, Compensation Draft Delivery Profile Version, Provider Draft Operation,
compensation coverage, status, or source meaning as reimbursement truth.

Reimbursement uses its own Package, Delivery Profile, Execution Claim, Handoff
Coverage, Handoff Attestation, and Handoff Operation. If compensation and
reimbursement touch the same provider draft, their source packages and coverage
remain separate while the exact provider-destination concurrency fence is
shared. Provider acceptance proves only the corresponding pre-execution input;
it creates neither compensation nor reimbursement payment truth.

QBO and Xero Accounting objects remain Phase 20-only and are not payroll or AP
draft substitutes. External execution ownership and Phase 20 D17 posting ownership are
independent, and neither package assigns the posting owner of a future atomic
payment occurrence.
