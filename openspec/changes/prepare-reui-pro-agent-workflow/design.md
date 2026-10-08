# ReUI Pro agent workflow design

## Ownership

`docs/ai/skills/reui` remains canonical. The existing sync tool publishes its
complete tree to `.agents/skills`, `.cursor/skills`, and `.claude/skills`.
ReUI's shared download replaces the removed agent-specific registry installers.
The refresh command stages files for local review and reconciliation without
executing upstream installation code or modifying MCP settings.

## Authentication and compatibility

The existing `REUI_LICENSE_KEY` runtime secret authenticates both headless MCP
and premium shadcn registry requests. Client configurations reference the
variable using each client's supported syntax and send `X-Reui-Style: base-maia`.
The MCP credential selects the Pro catalog; the style selects Base UI APIs.
OAuth remains an alternative for local clients when no headless secret is used.

`packages/ui/components.json` already contains the authenticated ReUI registry.
All CLI additions target `packages/ui`; apps import through `@asym/ui`. Agents
inspect installed source and manifests before adapting current upstream APIs.
Existing `DataTableResponsive`, Maia tokens, Lucide icons, and data boundaries
retain ownership. Pro blocks can be composed for new work; existing surfaces
are not migrated by this setup.

## Documentation and verification

The skill routes discovery through live MCP and `https://reui.io/llms.txt`.
Documentation pages expose Markdown at their URL plus `.md`; agents read the
matching Base UI page and the actual installed implementation before writing.
The focused verifier checks offline configuration and mirrored skill readiness.
Its explicit live mode checks authenticated protocol negotiation, required
tools, Base UI API retrieval, Pro discovery, and a premium registry payload.
Errors fail visibly and never print credentials or downloaded component source.

## Validation and recovery

Meaningful fixture tests cover transport parsing, authentication, configuration
drift, missing credentials, and safe staged refresh failure paths. Existing
skill synchronization, instruction-quality checks, shadcn guards, and OpenSpec
validation remain applicable. The final verification record distinguishes
direct MCP protocol evidence from client tool registration, which takes a
client reload. There are no app, API, database, provider, or route changes.
