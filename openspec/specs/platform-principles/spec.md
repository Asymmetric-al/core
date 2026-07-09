# Platform Principles And Decision Criteria

## Purpose

Provide durable **decision criteria** for product-facing and cross-cutting
engineering choices. This spec is the “when in doubt” layer for intent.

Day-to-day tooling, lint rules, and stack-specific procedures remain in
`AGENTS.md`, `docs/ai/rules/*`, and canonical skills under `docs/ai/skills/*`.

## Requirements

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

### Requirement: Operational Truth And Money Integrity

The platform MUST preserve financial and operational truth across gifts,
designations, recurring state, refunds, receipts, statements, donor linkage,
fund ownership, missionary visibility, and administrative visibility.

When a change helps one user group but weakens the accuracy, clarity, or
unambiguity of money flow, the platform SHALL protect money integrity first.

This requirement MUST govern product judgment about truthful money behavior. It
does not replace the structural source-of-truth ownership rules, which belong in
`platform-boundaries`.

#### Scenario: A change would help one user group but weaken money truth

- GIVEN a proposed change would make a workflow easier for one audience
- WHEN it would also make donations, designations, refunds, recurring state, or
  receipt behavior less accurate or less unambiguous
- THEN the agent rejects the convenience or redesigns it so operational truth
  stays correct
- AND they do not ship a path that leaves money state open to interpretation

### Requirement: Administrative Foundation With Surface-Appropriate Simplicity

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

#### Scenario: A feature would give admins more power but make downstream surfaces too deep

- GIVEN a proposed capability benefits staff operations
- WHEN exposing the same depth in donor or missionary experiences would make
  those surfaces feel staff-like, confusing, or overloaded
- THEN the agent keeps the operational depth in the staff layer
- AND they expose only the focused downstream behavior needed by the donor or
  missionary experience

#### Scenario: A misread of admin-first judgment would weaken donor clarity

- GIVEN an agent is tempted to mirror staff complexity in a donor-facing or
  missionary-facing path for the sake of parity
- WHEN that parity would make the narrower experience harder to understand
- THEN they protect donor clarity and missionary focus instead of copying staff
  depth
- AND they do not treat this requirement as permission to make every surface
  equally powerful

### Requirement: Donor Trust Through Honest States And Clear Handoffs

Donor trust MUST be protected through honest and prompt money states, obvious
immediate failure states when known, clear identity and permission handling,
and very clear handoffs between steps and surfaces.

The platform SHALL not soften, hide, or cosmetically blur real payment or
identity state when doing so would make the experience feel safer than it
actually is.

#### Scenario: A payment or identity flow might hide the real state

- GIVEN a flow could conceal a failure, delay, permission issue, or incomplete
  payment state behind reassuring language or vague UI
- WHEN an agent decides how to present that state
- THEN they show the real state clearly, with the next action or handoff made
  explicit
- AND they do not mask uncertainty in ways that would weaken donor trust

### Requirement: System Behavior Over Repeated Manual Glue Work

The platform MUST prefer turning repeated manual work into clear system
behavior whenever doing so improves trust, consistency, and cross-surface
clarity without weakening safety.

The platform SHALL reduce clicks, reduce manual glue work, and make the next
action easy to find and easy to complete. An agent MUST not accept repeated
human reconciliation as the normal answer when a durable system behavior is the
better product direction.

#### Scenario: A repeated manual action could be absorbed into system behavior

- GIVEN staff, donors, or missionaries repeatedly perform the same corrective,
  linking, or follow-up action by hand
- WHEN the platform could absorb that repetition into a durable and safe system
  behavior
- THEN the agent favors the system behavior over continued human glue work
- AND they use manual repetition only when safety or explicit review truly
  requires it

### Requirement: Clarity, Accessibility, And Perceived Speed Over Decorative Richness

The platform MUST favor clarity, accessibility, and perceived speed when visual
richness conflicts with any of them.

User joy and ease matter, but decorative richness SHALL remain subordinate to
clarity, accessibility, and perceived speed.

The next action SHALL be easy to find and easy to complete. A richer
interaction MUST not be preferred if it makes the product slower, harder to
understand, less accessible, or less obviously actionable.

#### Scenario: A rich interaction would reduce clarity or speed

- GIVEN a visually attractive interaction would add motion, density, or visual
  complexity
- WHEN that interaction would slow the product down, reduce accessibility, or
  make the next action less obvious
- THEN the agent chooses the clearer, faster, and more accessible direction
- AND they treat decorative richness as subordinate to usable product flow

### Requirement: Shared Language, Shared Behavior, And Cross-Surface Coherence

Shared language and shared behavior across the platform MUST matter as much as
local optimization. The same concept SHALL not behave differently in different
surfaces without a clear reason documented in product intent or surface intent.

The platform MUST optimize for performance and reliability without allowing
separate surfaces to drift into inconsistent vocabulary, inconsistent state
handling, or incompatible mental models for the same underlying concept.

The biggest judgment failure for an AI agent is making the platform too siloed,
too inconsistent, too clever locally, or too disconnected across surfaces.
Everything MUST work together as one cohesive, high-trust platform.

#### Scenario: The same concept appears across more than one surface

- GIVEN the same concept appears in multiple surfaces
- WHEN an agent considers using different names, state rules, or behaviors for
  local optimization
- THEN they preserve shared language and shared behavior unless there is a
  clear, product-valid reason not to
- AND they bias toward one coherent platform rather than many locally optimized
  experiences

### Requirement: Product-Level Definition Of Done

A feature MUST NOT be considered done merely because it is technically
functional. At the product level, it is not done if it still feels clunky,
confusing, fragile, inconsistent across surfaces, unclear in error states, or
untrustworthy in money or identity flows.

A feature SHALL be treated as incomplete when it works in isolation but still
feels fragmented, unlike the rest of the platform, or too dependent on user
guesswork to complete confidently.

#### Scenario: A feature technically works but still feels fragmented

- GIVEN a feature passes technical checks and can be used end to end
- WHEN it still feels unlike the rest of the platform, fragile in error states,
  confusing in money or identity behavior, or inconsistent across surfaces
- THEN the agent treats it as product-incomplete rather than finished
- AND they continue refining until the experience is trustworthy, coherent, and
  usable as part of one platform
