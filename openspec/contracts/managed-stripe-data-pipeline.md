# managed-stripe-data-pipeline normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-78de820abceec9e35dd1"></a>

## Verification is explicit read-only evidence

<!-- BEGIN CONTRACT {"id":"78de820abceec9e35dd1","name":"Verification is explicit read-only evidence"} -->

Verification MUST require explicit destination, source account, schema, and
selected-table expectations, use bounded read-only access, and disclose no
credentials or sensitive provider payloads. Selected managed relations MUST be
ordinary or partitioned tables. Privacy MUST remain incomplete until the operator
records a review of indirect API exposure through views/RPCs and application consumers.
The helper and operational source record MUST distinguish repository preparation,
authorization, configuration, backfill, ongoing sync, and second-source proof.
Helper success MUST be scoped to a single-source observation and explicitly leave
provider authorization, configuration, and second-source proof unverified by the helper.
A second source MUST NOT be required for a successful single-source observation.
Empty tables or old timestamps alone MUST NOT establish success or failure.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
