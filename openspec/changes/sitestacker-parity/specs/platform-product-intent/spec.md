# Delta for Platform Product Intent

## ADDED Requirements

### Requirement: SiteStacker Parity Is An Outcome-Parity Program

The platform MUST pursue SiteStacker parity as an outcome-parity program: it
MUST match what SiteStacker/WMTek lets a Christian missions organization
accomplish, built on the platform's own model, rather than cloning SiteStacker's
screens. Parity work MUST stay governed by the existing platform boundaries and
surface ownership — it MUST NOT bolt on disconnected modules and MUST NOT push
admin depth into donor or missionary surfaces. Each parity area MUST be
benchmarked against cited official SiteStacker documentation (or explicitly
marked not-yet-sourced) and MUST be tracked in the parity matrix with its built,
live, and confirmed status recorded separately. Per-area behavior MUST be
specified in its own change when that area is built, not defined up front. Child
sponsorship is out of scope.

#### Scenario: A parity capability is proposed

- WHEN a SiteStacker-style capability is proposed for the platform
- THEN it is scoped as the real outcome an organization must accomplish, fitted
  to an existing surface through the shared `packages/api` layer, and
  benchmarked against a cited SiteStacker doc (or marked not-yet-sourced)
- AND it does not become a bolted-on module or move admin depth into a
  role-scoped surface

#### Scenario: A parity area moves into active build

- WHEN a parity area moves from tracked to actually being built
- THEN its detailed behavior is specified in its own OpenSpec change and PRD at
  that time
- AND the parity matrix records its built, live, and confirmed status separately
