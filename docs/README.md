# Documentation

Repository rules and routing live in the root [`AGENTS.md`](../AGENTS.md);
setup and verification commands live in the root [`README.md`](../README.md).
Accepted product and platform requirements live in
[`openspec/`](../openspec/project.md).
[Document authority](./ai/document-authority.md) explains which source wins
for product decisions, phase packages, supersession and generated files. Asym
Postgres owns CRM truth; Twenty records are retired history, not setup or
rollback instructions.

## Start here

- [Architecture overview](./guides/architecture/overview.md): apps, routes and
  data flow.
- [Data-access boundary](./guides/architecture/data-access-boundary.md): where
  business data logic and browser table access may live.
- [Developer guide](./guides/development/getting-started.md): environment
  variables, troubleshooting and everyday commands.
- [Build runbook](./guides/development/build-runbook.md): build modes, Turbo
  caching and build troubleshooting.
- [CI](./ci.md): workflows, jobs and dated branch-protection evidence.
- [Environment variable audit](./env-var-audit.md): variable inventory.

## Directories

| Directory                        | Contents                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| [`ai/`](./ai/)                   | Agent rulebooks (`ai/rules/`), canonical skills (`ai/skills/`), audits and provenance |
| [`adr/`](./adr/README.md)        | Architecture decision records                                                         |
| [`guides/`](./guides/)           | Architecture, development, feature, operations and UI guides                          |
| [`prds/`](./prds/)               | Product requirement packages and roadmaps                                             |
| [`features/`](./features/)       | Feature packages, grill notes and evidence                                            |
| [`security/`](./security/)       | Security models and policies                                                          |
| [`ops/`](./ops/)                 | Operations runbooks, deployment reports and phase evidence                            |
| [`maintenance/`](./maintenance/) | Dependency and tooling modernization records                                          |
| [`qa/`](./qa/)                   | QA evidence and audit tooling                                                         |
| [`auth/`](./auth/sign-in.md)     | Sign-in modes, demo accounts and auth hardening status                                |
| [`agents/`](./agents/domain.md)  | Issue-tracker, triage-label and domain-doc conventions used by agent skills           |
| [`vendor/`](./vendor/payload.md) | Payload source provenance and upgrade workflow                                        |

Optional personal MCP servers are listed in
[`mcp-config.example.toml`](./mcp-config.example.toml).
