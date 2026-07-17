# Platform Architecture Decision Records

`docs/adr/` is the canonical, repository-wide ADR series. Canonical ADRs use the
next available four-digit number when the record is accepted; numbers are not
reserved in advance.

An OpenSpec `design.md` may describe a proposed decision while a change is
active, but it is not a canonical platform ADR merely because its heading uses
a design label. Cross-change labels such as `EVE-DESIGN-0002` are namespaced
planning references only; they do not reserve a canonical ADR number. When an
active design is promoted into this directory, the implementing PR must:

1. allocate the next available canonical number;
2. mark the accepted record and preserve its source issue/change links;
3. update references to the provisional label; and
4. avoid renumbering existing canonical ADRs.

Feature-scoped ADRs may remain in their documented feature directories when
their authority is intentionally local. Platform-wide decisions belong here.
