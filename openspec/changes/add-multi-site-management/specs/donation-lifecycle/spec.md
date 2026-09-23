# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Presentment Currency Is Qualified Before Donor Choice And Payment

An editable gift intent MUST contain one explicit presentment currency before
amount entry. Before amount entry, donor-visible currencies MUST equal Site
policy intersected with current Payments offering-envelope qualification for the
exact Tenant, environment, Site financial route, Legal Entity, Settlement
Account Binding, connected account, currency, gift mode, and any already-
selected cadence or rail. Amount- and payment-method-specific eligibility MUST
be re-evaluated as those facts become known. Setup qualification MUST be read-
only and MUST NOT create a Stripe customer, intent, setup intent, subscription,
charge, mandate, or setting. Checkout MUST re-prove the exact cart, amount,
cadence, method, limits, binding/account, provider contract/config generation,
and currency immediately before its first provider effect.

For an empty intent, a qualified country-level suggestion MAY be used, but an
explicit donor choice MUST win. Locale, browser language, URL, profile, cookie,
provider global support, or location MUST NOT authorize currency. One cart MUST
use one currency, and accepted contribution/recurring truth MUST freeze it.

#### Scenario: A donor overrides a local suggestion

- GIVEN CAD is suggested and both CAD and USD are currently qualified
- WHEN the donor explicitly chooses USD before entering amount
- THEN the editable gift intent uses USD and all displayed money is labelled USD
- AND later location or locale changes do not replace the donor's choice

#### Scenario: Checkout proof no longer matches setup proof

- WHEN the exact account, binding, mode, method, limit, or currency evidence
  changes before provider creation
- THEN checkout rejects or requires a current qualified alternative
- AND it creates no provider object or partial accepted gift

#### Scenario: A later amount or method is ineligible

- GIVEN a currency was initially offered from current route/mode qualification
- WHEN the donor's exact amount or payment method cannot qualify
- THEN the source intent remains editable and no provider effect occurs
- AND the donor receives one accessible correction or qualified alternative

### Requirement: Pre-Acceptance Currency And Schedule Transitions Preserve Purpose And Clear Dependencies

A donor MAY change currency or exact enabled schedule only while the affected
gift intent remains editable and external outcome is known. A pristine
unanswered change MAY be immediate. Material input MUST require an accessible
consequence-specific confirmation and a server-revalidated, idempotent compare-
and-set successor.

A currency successor MUST preserve the exact target-valid schedule identity and
revalidated currency-independent purpose/unaffected intent while clearing all
money, fee, payment, authorization, and provider meaning. A schedule successor
MUST preserve the exact cart currency and revalidated schedule-independent
purpose/unaffected intent while clearing the source schedule and smallest
complete affected money/payment dependency closure. If the preserved axis is
incompatible, the command MUST write nothing and explain the conflict; it MUST
NOT silently clear or substitute that axis. Target amount MUST be unanswered
and target suggestions MUST remain unselected. Neither operation may perform
FX, rounding/digit carry, preset-position mapping, destination substitution,
proration, or accepted gift/recurring mutation.

#### Scenario: A donor changes currency after entering amount

- WHEN the donor confirms the exact current consequences
- THEN purpose remains and the affected money/payment closure clears atomically
- AND the target amount is unanswered with no old provider attempt able to
  submit

#### Scenario: A donor changes frequency for one line

- WHEN one editable line changes to another exact enabled schedule
- THEN its purpose and unrelated lines remain
- AND its amount and smallest complete schedule/payment dependency closure
  clear before a fresh target schedule is derived

#### Scenario: The gift is already accepted

- WHEN a caller attempts this transition after contribution or recurring
  acceptance
- THEN the command rejects with no mutation
- AND later change, correction, or supersession remains with its owning domain
