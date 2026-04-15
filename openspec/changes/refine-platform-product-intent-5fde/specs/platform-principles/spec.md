# Delta for Platform Principles And Decision Criteria

## REMOVED Requirements

### Requirement: Multi-Tenant Safety First

This requirement is removed and replaced by **Safety And Permission Correctness
Over Convenience** so the merged spec states the platform's decision order
plainly: tenant safety first, financial and operational truth second, and
convenience third.

#### Scenario: A reader looks for the old safety heading

- GIVEN a contributor expects the old “Multi-Tenant Safety First” heading
- WHEN they search this spec after the change merges
- THEN they follow **Safety And Permission Correctness Over Convenience**
- AND they treat it as the authoritative rule for conflicts between safety and
  convenience

### Requirement: Respect User Time And Context

This requirement is removed and replaced by **Administrative Foundation With
Surface-Appropriate Simplicity** and **System Behavior Over Repeated Manual Glue
Work** so the merged spec gives clearer product judgment about simplicity
without weakening operational depth.

#### Scenario: A reader looks for the old time-and-context heading

- GIVEN a contributor expects the old “Respect User Time And Context” heading
- WHEN they search this spec after the change merges
- THEN they use the new requirements for how to balance depth, focus, and manual
  work
- AND they do not reduce this principle to generic UI simplification

### Requirement: Honest UX Around Money And Identity

This requirement is removed and replaced by **Operational Truth And Money
Integrity** and **Donor Trust Through Honest States And Clear Handoffs** so the
merged spec separates durable money truth from the experience of seeing that
truth clearly.

#### Scenario: A reader looks for the old money-and-identity heading

- GIVEN a contributor expects the old “Honest UX Around Money And Identity”
  heading
- WHEN they search this spec after the change merges
- THEN they use **Operational Truth And Money Integrity** for truth correctness
- AND they use **Donor Trust Through Honest States And Clear Handoffs** for how
  that truth must be exposed to users

### Requirement: Shared Behavior Lives In Shared Packages

This requirement is removed because package placement is not the durable product
judgment layer for this spec. The surviving concern appears as **Shared
Language, Shared Behavior, And Cross-Surface Coherence** without binding the
principle to a specific implementation tactic.

#### Scenario: A reader looks for the old shared-packages heading

- GIVEN a contributor expects the old “Shared Behavior Lives In Shared Packages”
  heading
- WHEN they search this spec after the change merges
- THEN they follow **Shared Language, Shared Behavior, And Cross-Surface
  Coherence**
- AND they treat platform consistency as the product principle, not a package
  rule

### Requirement: Accessibility And Performance Are Part Of UX

This requirement is removed and replaced by **Clarity, Accessibility, And
Perceived Speed Over Decorative Richness** and **Product-Level Definition Of
Done** so the merged spec states more directly what to choose when polish
conflicts with clarity or speed.

#### Scenario: A reader looks for the old accessibility-and-performance heading

- GIVEN a contributor expects the old “Accessibility And Performance Are Part Of
  UX” heading
- WHEN they search this spec after the change merges
- THEN they use the new requirements for interaction tradeoffs and product-level
  completeness
- AND they treat clarity and perceived speed as first-class product decisions

### Requirement: Durable Docs Stay Aligned

This requirement is removed because documentation synchronization is a workflow
concern owned elsewhere in OpenSpec and repo instructions, not the durable
product judgment layer for this spec.

#### Scenario: A reader looks for the old docs-alignment heading

- GIVEN a contributor expects the old “Durable Docs Stay Aligned” heading
- WHEN they search this spec after the change merges
- THEN they use OpenSpec workflow guidance and repo instructions for doc-sync
  expectations
- AND they keep this spec focused on product judgment rather than workflow

## ADDED Requirements

### Requirement: Safety And Permission Correctness Over Convenience

When safety, trust, and convenience conflict, the platform MUST prioritize
tenant safety first, financial and operational truth second, and convenience
third.

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

### Requirement: Operational Truth And Money Integrity

The platform MUST preserve financial and operational truth across gifts,
designations, recurring state, refunds, receipts, statements, donor linkage,
fund ownership, missionary visibility, and administrative visibility.

When a change helps one user group but weakens the accuracy, clarity, or
unambiguity of money flow, the platform SHALL protect money integrity first.

When CRM and CMS appear to disagree, an agent MUST treat CRM as the operational
truth and CMS as the public content truth unless a more specific spec
explicitly overrides that behavior.

#### Scenario: A change would help one user group but weaken money truth

- GIVEN a proposed change would make a workflow easier for one audience
- WHEN it would also make donations, designations, refunds, recurring state, or
  receipt behavior less accurate or less unambiguous
- THEN the agent rejects the convenience or redesigns it so operational truth
  stays correct
- AND they do not ship a path that leaves money state open to interpretation

#### Scenario: CRM and CMS appear to disagree

- GIVEN a feature touches both operational records and public-facing content
- WHEN an agent sees tension between CRM-shaped truth and CMS-shaped truth
- THEN they treat CRM as the operational truth and CMS as the public content
  truth by default
- AND they require a more specific OpenSpec override before reversing that
  judgment

### Requirement: Administrative Foundation With Surface-Appropriate Simplicity

Admin and operational truth are foundational to the platform. The system MUST
support the organization's operational strength first, because downstream donor
and missionary experiences depend on that foundation being reliable and
complete.

When admin power, donor clarity, and missionary simplicity are in tension, the
platform SHALL favor them in that order by default while still strongly
protecting donor clarity and keeping missionary experiences focused.

The platform MUST simplify donor and missionary experiences without turning them
into staff surfaces and without weakening the administrative depth the
organization depends on.

#### Scenario: A feature would give admins more power but make downstream surfaces too deep

- GIVEN a proposed capability benefits staff operations
- WHEN exposing the same depth in donor or missionary experiences would make
  those surfaces feel staff-like, confusing, or overloaded
- THEN the agent keeps the operational depth in the admin layer
- AND they expose only the focused downstream behavior needed by the donor or
  missionary experience

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
surfaces without a clear reason documented in product intent.

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
