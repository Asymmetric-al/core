# Nia MCP and source operations

## Triggers

Use this guide whenever an agent or contributor:

- searches this repo with Nia MCP
- indexes or subscribes to docs, repositories, packages, or local sources in Nia
- configures Nia MCP for Cursor, Claude Code, Codex, or another agent
- considers using local sync for private folders or notes

## Source of truth

- Repo policy: `AGENTS.md`
- Stack tags: `docs/ai/stack-registry.md`
- Local task context: `docs/ai/working-set.md`
- Nia docs index: `https://docs.trynia.ai/llms.txt`
- Nia API base and MCP remote URL: use the current values from the Nia MCP
  installation docs; this repo intentionally does not hardcode them because the
  secret scanner treats them as managed configuration.

## Concepts

### MCP server

The Nia MCP server exposes tools such as `manage_resource`, `search`,
`nia_read`, `nia_grep`, `nia_explore`, `nia_package_search_hybrid`, `tracer`,
and `nia_research`. Tool names and namespaces vary by client, so follow the
runtime tool schema shown by your agent.

Prefer the remote MCP server in user or global MCP config:

```json
{
  "mcpServers": {
    "nia": {
      "url": "<NIA_MCP_REMOTE_URL_FROM_NIA_DOCS>",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Use the local server only when remote MCP is unavailable:

```json
{
  "mcpServers": {
    "nia": {
      "command": "pipx",
      "args": ["run", "--no-cache", "nia-mcp-server"],
      "env": {
        "NIA_API_KEY": "YOUR_API_KEY",
        "NIA_API_URL": "<NIA_API_BASE_URL_FROM_NIA_DOCS>"
      }
    }
  }
}
```

Do not commit MCP configs that contain API keys.

### GitHub repository source

This repo is expected to exist in Nia as the public repository source
`Asymmetric-al/core`. GitHub repository indexing is handled by Nia's GitHub
connector.

### Local sync

Nia local sync is separate from the MCP server. Current Nia docs say the old
`nia-sync` package is deprecated; use the current Nia CLI installed through
`npx nia-wizard@latest` for local sync.

Never commit local sync outputs, caches, wheels, virtual environments, or
`~/.nia-sync/config.json`. Local sync may contain credentials or private
knowledge.

Generated local sync and scratch outputs stay untracked: `.nia-sync/`,
`.nia_sync_local/`, `~/.nia-sync/`, Python bytecode, and the local
`docs/ai/working-set.md` scratch file. The repository keeps
`docs/ai/working-set.example.md` as the committed template.

## Agent workflow

1. Check whether Nia is useful for the task.
   - Use it for repo exploration, architecture tracing, dependency docs, public
     package source, or broad technical research.
   - Skip it for tiny single-file edits where local reads already provide enough
     evidence.
2. Build a preamble for repo searches from `docs/ai/stack-registry.md` and
   local task context. `docs/ai/working-set.md` is gitignored scratch context;
   use `docs/ai/working-set.example.md` if you need to create it.

   ```text
   Repo: Asymmetric-al/core
   Goal: <one sentence>
   Area: <dir/module/file guess>
   Stack: <3-8 tags from docs/ai/stack-registry.md>
   Keywords: <5-12 exact identifiers/strings>
   Constraints: <runtime/tooling/behavior constraints>
   Evidence required: file paths + symbol names + brief explanation
   ```

3. Search repo-scoped first:
   - `manage_resource(action="list", query="Asymmetric-al/core")` to verify the
     source when needed.
   - `search(..., repositories=["Asymmetric-al/core"], search_mode="repositories")`
     for architecture and code questions.
   - `nia_read(source_type="repository", source_identifier="Asymmetric-al/core:<path>")`
     or local `ReadFile` for full files.
   - `nia_grep(source_type="repository", repository="Asymmetric-al/core", pattern="...")`
     for exact identifiers.
4. Use external Nia sources only when helpful.
   - Prefer pre-indexed or subscribed official docs over web search.
   - Use `nia_package_search_hybrid` for dependency implementation details,
     pinned to the version from the nearest manifest when possible.
   - Use `tracer` for one-off public GitHub repository questions that are not
     indexed.
   - Use `nia_research` for broader discovery, comparisons, or finding official
     docs.
5. After external lookup, run a scoped pass back inside `Asymmetric-al/core`
   before editing repo code.
6. Read top matches before editing. Do not rely on snippets alone.
7. Cite exact file paths and function/component names in findings.

## Planning and mutation safety

Treat these as read-only:

- `manage_resource(action="list" | "status")`
- `search`
- `nia_read`
- `nia_grep`
- `nia_explore`
- `nia_package_search_hybrid`
- `tracer`
- `nia_research`

Treat these as Nia workspace mutations:

- `index`
- `manage_resource(action="subscribe" | "rename" | "delete")`
- `auto_subscribe_dependencies`
- `nia_write`, `nia_rm`, `nia_mv`, `nia_mkdir`
- vault create/write/run tools
- local sync commands such as `nia add`, `nia`, `nia resync`, and `nia remove`

In read-only or planning modes, do not run mutation tools. Instead, document the
intended command or MCP action.

## Repository hygiene

Nia alignment changes must not commit local sync, cache, wheel, or scratch
artifacts. Keep API keys and local Nia workspace configuration in user or global
settings, not in the repository.

## Checklist

- [ ] Nia repo searches are scoped to `Asymmetric-al/core`
- [ ] Search queries include the required preamble
- [ ] Top matches are read before editing
- [ ] External docs/repos are justified and followed by a repo-scoped pass
- [ ] Nia workspace mutations are not run in read-only/plan mode
- [ ] API keys and local sync configs are never committed
