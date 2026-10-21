# platform-principles normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-8b6afaacb2f5eb889ed5"></a>

## Safety And Permission Correctness Over Convenience

<!-- BEGIN CONTRACT {"id":"8b6afaacb2f5eb889ed5","name":"Safety And Permission Correctness Over Convenience"} -->

When priorities conflict, the platform MUST apply one canonical priority
ladder: tenant safety and permission correctness first; financial and
operational truth second, with donation-flow integrity as its sharpest product
instance; donor-facing clarity and trust third; and convenience last.

This ladder SHALL be the single canonical ordering for the platform. Other
specs MUST defer to it rather than restating a competing order of their own.

Permission correctness MUST be treated as non-negotiable. The platform SHALL
not take a faster path that makes data exposure, action authority, or role
visibility ambiguous just because that shortcut is technically simpler or easier
to ship.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-73df5470eb4a82a7423e"></a>

## Operational Truth And Money Integrity

<!-- BEGIN CONTRACT {"id":"73df5470eb4a82a7423e","name":"Operational Truth And Money Integrity"} -->

The platform MUST preserve financial and operational truth across gifts,
designations, recurring state, refunds, receipts, statements, donor linkage,
fund ownership, missionary visibility, and administrative visibility.

When a change helps one user group but weakens the accuracy, clarity, or
unambiguity of money flow, the platform SHALL protect money integrity first.

This requirement MUST govern product judgment about truthful money behavior. It
does not replace the structural source-of-truth ownership rules, which belong in
`platform-boundaries`.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ac1c0c1f13e002605c3e"></a>

## Administrative Foundation With Surface-Appropriate Simplicity

<!-- BEGIN CONTRACT {"id":"ac1c0c1f13e002605c3e","name":"Administrative Foundation With Surface-Appropriate Simplicity"} -->

Admin and operational truth are foundational to the platform. The system MUST
support the organization's operational strength first, because downstream donor
and missionary experiences depend on that foundation being reliable and
complete.

Within a safe, permitted, and operationally truthful path, the platform SHALL
preserve the administrative foundation the organization depends on, protect
donor clarity strongly, and keep missionary experiences focused rather than
expansive.

This default MUST NOT override safety, permission correctness, money integrity,
or donor-trust obligations.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-47b3120d0359f1804537"></a>

## Shared Language, Shared Behavior, And Cross-Surface Coherence

<!-- BEGIN CONTRACT {"id":"47b3120d0359f1804537","name":"Shared Language, Shared Behavior, And Cross-Surface Coherence"} -->

Shared language and shared behavior across the platform MUST matter as much as
local optimization. The same concept SHALL not behave differently in different
surfaces without a clear reason documented in product intent or surface intent.

The platform MUST optimize for performance and reliability without allowing
separate surfaces to drift into inconsistent vocabulary, inconsistent state
handling, or incompatible mental models for the same underlying concept.

The biggest judgment failure for an AI agent is making the platform too siloed,
too inconsistent, too clever locally, or too disconnected across surfaces.
Everything MUST work together as one cohesive, high-trust platform.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
