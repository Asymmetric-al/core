# Platform Product Intent

## Purpose

Capture durable **why** for Asymmetric.al core: who the software serves, what
outcomes matter, and how we know the platform is succeeding over time. This
spec complements `AGENTS.md` (routing) and `docs/guides/architecture/*`
(structure and patterns).

## Requirements

### Requirement: Mission And Scope

Asymmetric.al MUST exist as an all-in-one platform for Christian missions
organizations at any scale. It SHALL bring together the core ministry
operations and engagement tools those organizations need in one connected
system, including fundraising, donor experience, missionary experience,
operational records, public content, communications, documents, reporting, and
automation.

The primary tenant is a missions sending organization whose missionaries raise
personal support: sending agencies, church-planting networks, and
denominational boards at any scale within that operating model. Churches and
other ministries are in scope when they operate a sending program. An
individual missionary is a user inside a tenant, never a standalone tenant.

The platform MUST exist to replace fragmented, clunky, manual operational
tooling with one connected system that reduces friction, reduces tool sprawl,
reduces manual glue work, and keeps important tasks clear and easy to complete.

The product MUST be purpose-built for the support-raising operating model of
Christian missions sending organizations. It MUST NOT be treated as generic
nonprofit software with faith language added on top.

The deepest ministry outcome is not merely saving time. The platform SHALL
remove friction so people can stay focused on ministry: fewer clicks, clear
next steps, and intuitive task completion matter because lower friction
improves donor follow-through, missionary support, ministry capacity, and focus
on the Gospel rather than on the tool itself.

#### Scenario: An agent needs the north star without a product brief

- GIVEN an agent must plan or implement work without a separate product document
- WHEN they read this requirement for orientation
- THEN they treat Asymmetric.al as one connected ministry operations platform
  for Christian missions sending organizations
- AND they reject approaches that optimize a narrow feature at the cost of
  whole-ministry flow, manual glue, or tool sprawl

#### Scenario: A request assumes a customer outside the sending-org model

- GIVEN a request assumes a standalone individual missionary tenant, a generic
  nonprofit customer, or a product identity outside the support-raising
  operating model
- WHEN an agent evaluates whether to build toward that assumption
- THEN they treat it as out of scope unless leadership explicitly changes
  product truth in OpenSpec
- AND they design for organizations as tenants with missionaries as users
  inside them

#### Scenario: A tactical choice would ship faster but increase friction or glue

- GIVEN a shortcut could land sooner by pushing work onto staff, donors, or
  missionaries outside the product
- WHEN the agent evaluates that shortcut
- THEN they favor durable flow inside the connected platform over speed that
  increases friction, fragmentation, or manual glue work
- AND they document the user-visible cost if a shortcut is unavoidable

### Requirement: Long-Horizon Success

Over time, success MUST be recognizable first in ministry outcomes:
missionaries reach and sustain full support, and each tenant runs its whole
operation confidently in one connected system.

Strong donor retention, low friction, user joy, platform coherence,
operational completeness, trust, fewer disconnected tools, and clearer
support-raising and administrative workflows SHALL be treated as contributing
signals beneath those outcomes, not as the outcomes themselves.

Success MUST NOT be defined only by shipping volume or raw feature count when
those measures would mask fragmentation, weak operations, or eroded donor
confidence.

#### Scenario: A tactical choice would ship faster but sacrifice trust or clarity

- GIVEN a faster path would blur financial clarity, confuse roles, or hide the
  state of important ministry work from the people who rely on it
- WHEN the agent weighs speed against long-horizon success
- THEN they protect trust, operational completeness, and clarity first
- AND they only accept short-term speed with an explicit, time-bounded recovery
  plan that does not silently become permanent glue

#### Scenario: Success metrics would reward fragmentation

- GIVEN a team celebrates shipped tickets or UI count while donors, staff, or
  missionaries still bounce between disconnected concepts or duplicate entry
- WHEN an agent interprets “success” for prioritization
- THEN they prioritize platform coherence, fewer disconnected tools, and
  operational completeness over raw throughput
- AND they treat strong donor retention and low friction as signals that matter
  as much as launch cadence

#### Scenario: Two improvements compete for priority

- GIVEN one option polishes an already-working experience and another directly
  helps missionaries reach or sustain full support
- WHEN an agent weighs them with comparable cost and risk
- THEN they favor the option that advances the ministry outcome
- AND they treat input metrics like retention or engagement as supporting
  evidence rather than the goal itself

### Requirement: Unified Platform Span

The platform SHALL unify four major areas at a high level as one ministry
system rather than four unrelated products:

- Mission Control / admin
- the public tenant website
- the donor experience
- the missionary workspace

Work inside the core repo MUST keep those areas aligned as one coherent
platform span. Agents MUST NOT treat any major area as an optional add-on that
can drift independently without an explicit product decision.

#### Scenario: A change would improve one surface while weakening platform coherence

- GIVEN a change improves one of the four major areas
- WHEN it would silently redefine the others as out of scope, duplicate their
  job, or fork vocabulary and mental models across areas
- THEN the agent redesigns or rescopes so the four areas still read as one
  ministry platform
- AND they document cross-area impact before implementation proceeds

### Requirement: Audience Service And Tradeoff Priority

The platform MUST serve the ministry as a whole, including organizational
staff, missionaries, donors, and public visitors.

When tradeoffs are ambiguous, agents MUST apply the canonical priority ladder
defined in `platform-principles`. Within a safe and permitted path, the
sharpest product instance of that ladder is donation-flow integrity: a donor
must be able to give with confidence through the tenant website, and gifts must
remain accurate, clearly designated, clearly reflected across the platform, and
followed by the right donor-facing confirmation and record trail. Accuracy,
trust, and financial clarity MUST take priority over any one group's
convenience.

#### Scenario: A feature request helps one audience but risks donation trust

- GIVEN a feature request primarily benefits staff, missionaries, or internal
  workflows
- WHEN it could weaken donor-visible clarity, create ambiguous designation,
  distort gift state, or make giving feel less safe or less understandable
- THEN the agent rejects the approach or redesigns it so donation integrity
  stays intact
- AND they treat donation-flow trust as non-negotiable unless leadership
  explicitly changes product truth in OpenSpec

#### Scenario: A feature request helps one audience but risks ministry-wide clarity

- GIVEN a feature request benefits one role
- WHEN it would hide or fragment information the ministry as a whole needs to
  stay aligned on support, relationships, or outcomes
- THEN the agent favors ministry-wide clarity over narrow convenience
- AND they ensure the change still fits the unified platform span

### Requirement: Administrative Foundation

The platform MUST be built on a strong staff and operational foundation. If the
administrative foundation is weak, donor/public and missionary experiences will
also be weak.

Agents MUST NOT starve staff operational completeness to chase surface-only
wins.

#### Scenario: A shortcut would weaken the administrative foundation

- GIVEN a shortcut would ship donor- or missionary-facing polish faster
- WHEN it would leave staff without a clear operational home for the same data,
  tasks, or controls—or would push operational burden back into spreadsheets or
  side channels
- THEN the agent rejects the shortcut or pairs surface work with the minimum
  operational backbone needed so the ministry can run honestly in one system
- AND they treat operational completeness as a prerequisite for trustworthy
  downstream experiences

### Requirement: Operational And Content Sources Of Truth

At the product level, the platform MUST keep operational truth and public
content truth distinct, aligned, and non-competing.

The CRM names the platform's operational truth for ministry operations and
relationships. The CMS names the platform's public and content truth for
outward-facing presentation and story. These truths MUST reinforce one coherent
platform rather than compete with one another.

#### Scenario: A proposal would blur the operational and content truths

- GIVEN a proposal treats public content as a substitute for operational truth,
  or treats operational records as the public content truth by default
- WHEN that would make staff, missionaries, or donors unsure which truth the
  platform depends on
- THEN the agent stops and reframes the work so operational and public truths
  remain distinct and aligned
- AND they consult `platform-boundaries` for the structural ownership rules
  rather than inventing them inside this spec

### Requirement: Non-Goals And Scope Discipline

The core repo MUST NOT become a catchall for unrelated products, generic SaaS
experiments, disconnected side tools, unrelated church software, unrelated
nonprofit products, or standalone microsites detached from the
mission-organization operating model.

Agents MUST guard against the dominant failure mode: treating this like generic
SaaS and solving problems with disconnected features, workaround logic scattered
across the codebase, one-off fixes, or local optimization that damages platform
coherence.

#### Scenario: A request would pull the repo toward unrelated products or experiments

- GIVEN a request would add or expand a product that does not serve the unified
  ministry operating model in this repo
- WHEN it would introduce a parallel product identity, unrelated user model, or
  long-lived detour from missions-organization operations
- THEN the agent rejects the request or routes it outside this core repo
- AND they do not merge scope creep simply because implementation is easy

#### Scenario: An agent defaults to generic SaaS thinking under ambiguity

- GIVEN implementation details are underspecified
- WHEN a generic SaaS pattern would add a disconnected module, duplicate a
  concept already owned elsewhere, or optimize a single screen without a
  ministry-wide story
- THEN the agent chooses the path that preserves one coherent ministry platform
- AND they favor fewer disconnected tools and clearer end-to-end flows over
  clever one-offs

### Requirement: AI Assistance Is A Core Product Direction

AI assistance SHALL be a core differentiator of the platform, woven through
staff, donor, missionary, and public experiences wherever it reduces ministry
friction: drafting, suggesting, summarizing, routing, and preparing work so
people stay focused on ministry rather than on the tool.

AI ambition MUST stay inside the platform's trust boundaries. Any AI-initiated
effect that sends donor-facing communication, moves or records money, or mutates
operational truth MUST pass an explicit human approval gate before it takes
effect. AI-initiated publication of public content MUST respect the tenant's
configured publication and moderation boundary (see `platform-boundaries`),
requiring human approval wherever the tenant requires review rather than
overriding a tenant that has chosen automatic publishing. AI output MUST NOT
silently mutate operational truth, and AI behavior SHALL remain subject to the
canonical priority ladder, honest-state rules, and tenant moderation boundaries.

AI assistants that help staff, missionaries, or donors act within the
authority of the human they serve and are bounded by role and tenant scope, as
defined in `platform-boundaries`. They are not a separate permission tier.

#### Scenario: An AI feature could act without human review

- GIVEN an AI-assisted flow could autonomously complete a donor-facing send, a
  money effect, or an operational record mutation
- WHEN an agent designs that flow
- THEN the AI contribution stops at a clearly-labeled draft, suggestion, or
  prepared action awaiting explicit human approval
- AND the approved effect is attributed and auditable like any staff action
- AND AI-initiated publication follows the tenant's configured publication
  boundary rather than a blanket gate

#### Scenario: A roadmap choice weighs AI investment against parity features

- GIVEN two directions of comparable cost, one adding AI assistance that
  reduces ministry friction and one adding conventional feature parity
- WHEN an agent evaluates alignment with product direction
- THEN they treat AI assistance as core product direction rather than an
  optional experiment
- AND they still reject AI work that would weaken trust, honesty of states, or
  tenant safety
