## ADDED Requirements

### Requirement: ReUI Agent Workflows MUST Preserve Pro Access And Shared UI Ownership

The repository SHALL maintain the complete official ReUI agent skill as a
canonical Core-adapted tree and publish it through the established skill mirror
workflow. ReUI MCP configurations SHALL authenticate through runtime credentials
using supported client syntax and SHALL select exact `base-maia` context. No
credential value SHALL be committed or printed by repository maintenance tools.

#### Scenario: An agent uses ReUI Pro

- WHEN an agent discovers or composes ReUI UI using the configured Pro license
- THEN its MCP requests authenticate and receive the plan's available blocks
- AND its component APIs and registry output use Base UI with exact `base-maia`
- AND additions belong in `packages/ui` with apps consuming `@asym/ui`
- AND existing shared primitives, tokens, data boundaries, and table ownership
  remain controlling

#### Scenario: An agent needs current ReUI documentation

- WHEN an agent implements or adapts ReUI components
- THEN it uses current MCP component APIs and documentation indexed by ReUI's
  `llms.txt`, preferring the matching Base UI Markdown pages
- AND it reconciles the documentation against installed source and manifests
- AND it honors locked results, weak matches, and plan-specific unlock fields

#### Scenario: A maintainer verifies readiness

- WHEN a maintainer runs the focused ReUI readiness command
- THEN the command checks repository skill and configuration readiness without
  writing product source or modifying client configuration
- AND explicit live verification requires a runtime credential and verifies
  authenticated MCP, Base UI APIs, Pro discovery, and premium registry access
- AND missing credentials, malformed responses, or configuration drift produce
  a failing result without exposing secrets

#### Scenario: A maintainer refreshes the ReUI skill

- WHEN a maintainer requests the focused ReUI skill refresh
- THEN the official shared skill bundle is staged for review without executing
  an upstream installer or changing canonical files, MCP settings, or mirrors
- AND unsafe file paths or filesystem entries are rejected
- AND Core overlays and provenance are retained for reconciliation
- AND reviewed canonical updates use the existing sync and verify workflow
