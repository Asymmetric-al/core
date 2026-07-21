# Delta for Contribution Operations

## ADDED Requirements

### Requirement: Offline Contributions Support Known And Unknown Donors

Mission Control MUST let authorized staff enter offline gifts through the
Contribution Hub in two explicit modes. For known donors, staff attach or
create the donor record, the receipt identity is snapshotted on the
contribution at entry time so later profile edits do not rewrite historical
receipts, staff may mark the gift anonymous to missionary/public views, and
receipt eligibility is recorded. For truly unknown donors, staff use an
intentional unknown-donor mode where `donor_id` stays null, the gift is marked
not receiptable unless donor information is later provided, and no fake donor
data is ever entered.

Both modes MUST run through the Contribution Operations Core contracts:
permission checks, entry audit (who entered the gift), designation
validation, and batch/deposit references for reconciliation.

#### Scenario: Staff enters a check from a known donor who wants anonymity

- WHEN staff records an offline check and attaches the donor record
- THEN the gift stores per-gift anonymity flags for missionary/public views
- AND finance and admin views retain full donor identity for receipts and
  reconciliation

#### Scenario: Staff enters anonymous offering-box cash

- WHEN staff selects the unknown-donor offline mode
- THEN the contribution records amount, date, method, designation, and batch
  reference with a null donor record
- AND Phase 7 derives reason-carrying `not_receiptable` eligibility from the
  source-owned unknown-donor fact
- AND the contribution stores no duplicate receipt, render, artifact, access,
  or delivery status
- AND no fake donor name or email is required or accepted
