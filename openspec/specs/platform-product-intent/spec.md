# Platform Product Intent

## Purpose

Capture durable **why** for Asymmetric.al core: who the software serves, what
outcomes matter, and how we know the platform is succeeding over time. This
spec complements `AGENTS.md` (routing) and `docs/guides/architecture/*`
(structure and patterns).

## Requirements

### Requirement: Mission And Scope

The platform SHALL exist to help mission-focused organizations operate
sustainably: stewarding relationships between staff, missionaries, and donors
so that ministry support is trustworthy, visible, and administratively sane.

#### Scenario: An agent asks what “success” means for the product

- WHEN reasoning about priorities or tradeoffs without a product brief
- THEN the agent treats this spec as the durable intent layer
- AND defers implementation detail to architecture docs and code

### Requirement: Primary Outcomes

The platform SHALL prioritize outcomes that matter to real users:

- **Organizations** can run fundraising and engagement operations with clear
  visibility, controlled access, and audit-friendly workflows.
- **Missionaries** can understand support, communicate impact, and manage donor
  relationships without drowning in tooling.
- **Donors** can give confidently, see impact, and self-serve account and tax
  needs.
- **Public visitors** can discover and complete giving flows aligned to the
  tenant’s brand and story.

#### Scenario: A feature competes across audiences

- WHEN a change would materially favor one audience at the expense of another
- THEN the change documents the tradeoff and aligns with the outcomes above
- AND updates this spec if the durable intent itself shifts

### Requirement: Non-Goals For This Core Repository

The core monorepo SHALL NOT be treated as the home for every adjacent concern.

#### Scenario: Scope creep is proposed

- WHEN work would embed long-lived content unrelated to org/missionary/donor
  operations (for example unrelated consumer products or generic CMS-only sites)
- THEN that work is rejected or routed to a different product boundary
- AND this spec is updated only if the organization’s definition of “core”
  genuinely expands

### Requirement: Long-Horizon Success

Over time, success SHALL be recognizable as:

- **Trust:** permissions, money, and personal data are handled predictably; the
  product does not surprise users about who can see what.
- **Coherence:** admin, missionary, donor, and public surfaces feel like one
  platform, not four disconnected products.
- **Operability:** staff can complete common workflows without fragile workarounds.
- **Sustainability:** shared packages and boundaries keep cross-cutting behavior
  consistent as the codebase grows.

#### Scenario: Tactical shortcuts conflict with long-horizon success

- WHEN a shortcut would weaken trust, coherence, operability, or sustainability
- THEN the implementation is revised or the durable intent is explicitly updated
  here and in any affected specs
