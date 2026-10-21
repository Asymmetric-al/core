# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Presentment Currency Is Qualified Before Donor Choice And Payment

An editable gift intent MUST contain one explicit presentment currency before amount entry.

Every clause in `openspec/contracts/donation-lifecycle.md#contract-662821c993c7fa6bbb07` MUST apply without exception.

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

A donor MAY change currency or exact enabled schedule only while the affected gift intent remains editable and external outcome is known.

Every clause in `openspec/contracts/donation-lifecycle.md#contract-ca38ddec28defdac778c` MUST apply without exception.

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
