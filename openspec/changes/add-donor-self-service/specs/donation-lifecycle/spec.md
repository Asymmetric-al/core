# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Donors Self-Manage Recurring Gifts

The donor portal MUST let a donor pause, resume, cancel, and change the amount
of their own recurring gifts. Each action MUST execute server-side against the
Stripe subscription, with the pledge record updated from provider-confirmed
state, and the portal MUST show an honest in-flight state until confirmation
arrives.

Self-service actions MUST be tenant-scoped and donor-owned only, and MUST NOT
bypass the subscription lifecycle with manual charge loops.

#### Scenario: A donor cancels a recurring gift

- WHEN a donor cancels their recurring gift in the portal
- THEN the server cancels the Stripe subscription
- AND the pledge becomes cancelled from provider-confirmed state
- AND staff views reflect the same truth without manual re-entry

#### Scenario: A donor changes their recurring amount

- WHEN a donor submits a new recurring amount
- THEN the server updates the subscription and shows a pending state until
  Stripe confirms
- AND the portal never displays the new amount as active before confirmation

### Requirement: Donors Manage Payment Methods Through Stripe

The donor portal MUST let a donor add, remove, and set a default payment
method through Stripe-managed flows. Raw card or bank credentials MUST never
reach Asym servers, and removing a method in use by an active recurring gift
MUST require choosing a replacement first.

#### Scenario: A donor replaces the card behind an active recurring gift

- WHEN a donor removes a payment method attached to an active pledge
- THEN the portal requires selecting or adding a replacement method first
- AND the subscription continues without a silent payment failure

### Requirement: Donors Receive Annual Giving Statements

The platform MUST generate annual giving statements whose deductible lines and
totals cover only settled, receiptable hard-credit gifts tied to the authorized
donor or household subject. When the canonical source context contains approved
indirect soft-credit, DAF, or matched-gift lines supplied by the owning domain,
the statement MUST render those lines only in a clearly labeled indirect
section, and those lines MUST NOT enter the deductible total. Pending or
in-flight gifts (for example unsettled ACH or not-yet-collected recurring
installments) MUST NOT appear in deductible or indirect lines or totals in the
donor artifact until settled; the owning domain MUST retain their excluded/audit
record with its approved reason code. Still-unknown-donor gifts MUST NOT appear
in a donor artifact unless the owning domain later matches them. When such a
candidate is evaluated for a statement run, the owning domain MUST retain its
exclusion/audit record with a #579/source-domain-approved reason code. Statement
language MUST be finance/legal reviewed before production use.

Giving MUST produce the frozen, versioned statement context from canonical
donation/correction truth, including the deductible hard-credit partition, the
approved indirect partition, audit-only exclusion references and their
source-domain-approved reason codes, raw structured values, and frozen official
display strings with locale/formatting version metadata. The document-production
capability MUST resolve the assigned immutable template and private artifact,
bind those frozen strings and supplied classifications, never render audit-only
exclusions, and avoid recalculating, reclassifying, or reformatting official
facts. The donor BFF MUST authorize the recipient, expose only the current
eligible artifact, and record delivery/download. A later correction, refund, or
donor relink MUST supersede or void stale output per policy while preserving
correction and artifact lineage.

#### Scenario: A donor downloads last year's statement

- WHEN a donor requests a statement for a completed year
- THEN its deductible lines and totals include exactly the settled, receiptable
  hard-credit gifts for the authorized donor/household subject and year
- AND any approved indirect lines supplied by the owning domain appear only in
  a labeled indirect section and remain excluded from the deductible total
- AND the portal does not present a superseded or void statement as current
- AND the delivery or download is recorded
