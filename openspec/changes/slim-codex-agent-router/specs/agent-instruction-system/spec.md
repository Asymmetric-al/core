# Delta for Agent Instruction System

## ADDED Requirements

### Requirement: Task-Specific Guidance MUST Use Progressive Disclosure

Root `AGENTS.md` MUST NOT enumerate the repository skill catalog, embed tool
manuals, or carry cloud and client-specific runbooks. It SHALL point to scoped
instructions, rulebooks, skills, configuration, and runtime evidence that load
only when the task requires them.

#### Scenario: Codex starts ordinary repository work

- WHEN Codex loads root project instructions
- THEN it receives repository identity, authority, critical invariants, routing,
  and verification guidance
- AND individual skill procedures, MCP manuals, framework catalogs, and cloud
  setup are absent from the always-on file

#### Scenario: A specialized task is requested

- WHEN a task matches a discovered skill, nested instruction file, or rulebook
- THEN Codex loads that scoped source
- AND root does not duplicate its full procedure

## MODIFIED Requirements

### Requirement: AGENTS Remains the Always-On Router

The repository SHALL keep root `AGENTS.md` as the always-on routing layer for
Codex project work. It SHALL preserve the small Next.js-managed opening block
and act as a concise constitution: repository identity, source authority,
OpenSpec routing, package boundaries, nested-instruction discovery, TDD,
version-aware documentation, critical Core invariants, progressive skill and
tool routing, Bun verification, and concise code-review rules.

Full skill catalogs, compressed framework indexes, cloud runbooks,
client-specific setup, review-bot manuals, and MCP tutorials SHALL live in
scoped files rather than root.

#### Scenario: Repo-wide routing is needed

- WHEN Codex needs to resolve source authority or choose scoped guidance
- THEN it uses root `AGENTS.md` as the primary entrypoint
- AND it reads the nearest nested `AGENTS.md` before changing a scoped area
- AND it searches installed Next.js docs or `.next-docs/` directly instead of
  relying on a compressed index embedded in root

#### Scenario: Tool-specific helper files are present

- WHEN another client or tool-specific adapter points to root `AGENTS.md`
- THEN that adapter remains thin
- AND client-specific or cloud-specific instructions stay outside the root

### Requirement: Always-On Instructions Fit Supported Client Budgets

Root `AGENTS.md` SHALL fit comfortably within Codex's default project document
budget without a client-specific limit increase. The file MUST be no larger
than 16,384 UTF-8 bytes and 200 authored lines, SHOULD target no more than
12,288 bytes, and MUST NOT contain a compressed Next.js documentation index.

#### Scenario: Root instructions are loaded

- WHEN instruction-system tests run
- THEN root contains exactly one Next.js-managed opening marker pair
- AND it contains no `NEXT-AGENTS-MD` marker
- AND every direct local path reference resolves
- AND high-frequency Core invariants remain present before any scoped loading
