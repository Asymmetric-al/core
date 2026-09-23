# Platform Architecture Decision Records

`docs/adr/` is the canonical, repository-wide ADR series. Canonical ADRs use the
next available four-digit number when the record is accepted; numbers are not
reserved in advance.

An OpenSpec `design.md` may describe a proposed decision while a change is
active, but it is not a canonical platform ADR merely because its heading uses
a design label. Cross-change labels such as `EVE-DESIGN-####` are namespaced
planning references only; they do not reserve a canonical ADR number. When an
active design is promoted into this directory, the implementing PR must:

1. allocate the next available canonical number;
2. mark the accepted record and preserve its source issue/change links;
3. update references to the provisional label; and
4. avoid renumbering existing canonical ADRs.

Feature-scoped ADRs may remain in their documented feature directories when
their authority is intentionally local. Platform-wide decisions belong here.

## Existing identity collisions and current references

The [ADR identity registry](registry.md) disambiguates existing numeric collisions
and records inspected pending-PR collisions. Existing accepted filenames and
numbers remain historical identifiers; use the **complete linked filename and
subject**, not a bare number, to select a record. Matching numbers do not imply
supersession, common ownership or permission to merge unrelated decisions.

For a new accepted platform record, check both this directory and the registry's
pending-PR section before selecting the next unused number. Proposed work keeps
its change-qualified label until promotion; a pending PR number is not a reserved
slot. Resolve any discovered collision explicitly and update the registry and
references together. Do not silently renumber accepted records or copy a different
PR's decision merely to make a numeric reference resolve.

The [document authority guide](../ai/document-authority.md) determines which
intent is accepted, proposed, historical or implemented. This identity registry
only identifies records; it cannot promote an active change or prove runtime work.
