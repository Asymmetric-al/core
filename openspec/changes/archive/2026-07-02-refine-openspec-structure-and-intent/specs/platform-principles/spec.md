# Delta for Platform Principles And Decision Criteria

## MODIFIED Requirements

### Requirement: Safety And Permission Correctness Over Convenience

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

#### Scenario: A shortcut would make development faster but weaken safety

- GIVEN an implementation shortcut would avoid stricter permission checks,
  weaken role isolation, or blur who is allowed to see or do something
- WHEN an agent compares that shortcut with a safer path
- THEN the agent chooses the safer path even if it is slower to implement
- AND they treat convenience as subordinate to tenant safety and permission
  correctness

#### Scenario: Two specs appear to give different priority orderings

- GIVEN two requirements seem to rank safety, money truth, donor experience, or
  convenience differently
- WHEN an agent must resolve the conflict
- THEN they apply this canonical ladder as the tie-breaker
- AND they propose an OpenSpec update for the spec whose wording caused the
  apparent conflict
