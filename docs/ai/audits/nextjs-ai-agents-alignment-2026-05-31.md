# Next.js AI-agent setup alignment audit (2026-05-31)

**Official guide:** [How to set up your Next.js project for AI coding agents](https://nextjs.org/docs/app/guides/ai-agents)  
**Repo:** Asymmetric-al/core (give-hope monorepo)  
**Auditor:** Agent session (plan: Next.js AGENTS audit)

## Summary

The repo **already met** the official Next.js 16.2+ requirements before this pass. This audit **preserved all existing** [`AGENTS.md`](../../../AGENTS.md) content and applied **small additive clarifications** only inside or beside the Next.js-managed markers.

| Criterion                             | Result                                                                |
| ------------------------------------- | --------------------------------------------------------------------- |
| Root `AGENTS.md` with managed markers | Pass (pre-existing)                                                   |
| Managed block → bundled docs path     | Pass (pre-existing; wording synced)                                   |
| `next` ≥ v16.2.0-canary.37            | Pass — **16.2.6**                                                     |
| Root `CLAUDE.md` → `@AGENTS.md`       | Pass (unchanged)                                                      |
| No removal of project-specific rules  | Pass                                                                  |
| Bundled docs when deps installed      | Pass — `node_modules/next/dist/docs/` (5 top-level dirs + `index.md`) |
| Sandbox fallback                      | Pass — committed `.next-docs/` + `NEXT-AGENTS-MD` index               |

**Done when:** All criteria **met**.

---

## Installed Next.js version

| Source                                                      | Version            |
| ----------------------------------------------------------- | ------------------ |
| Root [`package.json`](../../../package.json)                | `16.2.6`           |
| Apps (`@asym/admin`, `@asym/donor`, `@asym/missionary-app`) | `16.2.6` (aligned) |

**Guidance path applied:** **Primary** — `node_modules/next/dist/docs/` (official for v16.2.0-canary.37+).  
**Fallback** — `.next-docs/` at repo root (committed; used when `node_modules` absent).

Verification on 2026-05-31 (Windows, repo root):

- `node_modules/next/package.json` → version `16.2.6`
- `node_modules/next/dist/docs/` exists with `01-app/`, `02-pages/`, `03-architecture/`, `04-community/`, `index.md`

---

## Alignment matrix (official vs repo)

### Required by official guide (16.2+)

| Requirement                                                             | Repo state                                                  |
| ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| Root `AGENTS.md`                                                        | Present — extensive project routing beyond official minimum |
| `<!-- BEGIN:nextjs-agent-rules -->` … `<!-- END:nextjs-agent-rules -->` | Present **once** at file top (lines 1–7)                    |
| Instruction to read bundled docs before Next.js work                    | Present                                                     |
| `CLAUDE.md` with `@AGENTS.md`                                           | Present — only `@AGENTS.md`                                 |
| Bundled docs in `next` package                                          | Present when `bun install` has run                          |

### Repo extensions (intentional; do not remove)

| Item                                                             | Location                                                                      | Purpose                                             |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------- |
| Source-of-truth order (OpenSpec, skills, Nia, MCP)               | `AGENTS.md` § Agent compatibility / routing                                   | Monorepo policy                                     |
| Next.js docs source of truth (nearest app → root → `.next-docs`) | `AGENTS.md` § Next.js docs source of truth                                    | Monorepo + sandboxes                                |
| Compressed docs index                                            | `AGENTS.md` `NEXT-AGENTS-MD-START` … `END`                                    | Codemod-style lookup; `root: ./.next-docs`          |
| Next.js devtools MCP                                             | `AGENTS.md`, [`.mcp.json`](../../../.mcp.json)                                | [MCP guide](https://nextjs.org/docs/app/guides/mcp) |
| Copilot shim                                                     | [`.github/copilot-instructions.md`](../../../.github/copilot-instructions.md) | Points to root `AGENTS.md`                          |
| OpenSpec contract                                                | `openspec/specs/agent-instruction-system/spec.md`                             | Preserves both marker regions                       |

### Not present (not required)

- Root `agent.md` / `agents.md` / `AGENT.md` — none at repo root (correct)

---

## Changes made in this audit

### 1. [`AGENTS.md`](../../../AGENTS.md)

**Inside `<!-- BEGIN:nextjs-agent-rules -->` … `<!-- END:nextjs-agent-rules -->` only:**

- Punctuation aligned with official copy (“outdated — the docs”).
- Added one sentence pointing to https://nextjs.org/docs/llms.txt and noting the bundled tree mirrors the site.

**Under § Agent compatibility (additive bullet):**

- Clarified precedence: `node_modules/next/dist/docs/` over `.next-docs/` / compressed index when installed.

**Not changed:**

- Entire body of project-specific instructions (lines 9–536+).
- `NEXT-AGENTS-MD` compressed block (line 537) — **not** regenerated.
- `CLAUDE.md` — unchanged.

### 2. This audit document

- Created [`docs/ai/audits/nextjs-ai-agents-alignment-2026-05-31.md`](nextjs-ai-agents-alignment-2026-05-31.md).

---

## Revert log

| File                                                      | How to revert                                                                                                                                                                            |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                                               | `git checkout -- AGENTS.md` or manually restore managed block to: single sentence without `llms.txt`; remove the new “Agent compatibility” bullet about `node_modules` vs `.next-docs/`. |
| `docs/ai/audits/nextjs-ai-agents-alignment-2026-05-31.md` | `git rm docs/ai/audits/nextjs-ai-agents-alignment-2026-05-31.md` or delete the file.                                                                                                     |

Pre-change managed block (for reference):

```md
# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated. The docs are the source of truth.
```

---

## Validation

| Check                                             | Result                                                               |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| Managed markers exactly once at top               | Pass                                                                 |
| All sections before/after managed block preserved | Pass (manual read)                                                   |
| `CLAUDE.md` = `@AGENTS.md` only                   | Pass                                                                 |
| `next` version 16.2.6                             | Pass (`node -e require('./node_modules/next/package.json').version`) |
| Bundled docs directory exists                     | Pass                                                                 |
| Automated markdown lint                           | Not run — markdown-only; no repo script scoped to `AGENTS.md` only   |

**Recommended manual checks for future agents:**

1. Read lines 1–7 of `AGENTS.md` first.
2. For app work, prefer `apps/<app>/node_modules/next/dist/docs/` then root `node_modules/next/dist/docs/`.
3. If `node_modules` missing, use `.next-docs/` per § Next.js docs source of truth.

---

## Risks and follow-ups (out of scope)

| Topic                                                          | Recommendation                                                                   |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Full `bunx @next/codemod@canary agents-md` on root `AGENTS.md` | **Do not** without merge strategy — can overwrite custom content outside markers |
| `.next-docs/` freshness vs 16.2.6                              | Spot-check periodically; regenerate only if drift proven (large diff)            |
| `modernize-agent-instructions` OpenSpec change                 | Separate effort — Nia/Copilot/cursor.md layers; does not block this audit        |
| Root `node_modules` absent in CI/sandbox                       | Rely on committed `.next-docs/` (already documented)                             |

---

## Related docs

- [AGENTS.md](../../../AGENTS.md)
- [CLAUDE.md](../../../CLAUDE.md)
- [docs/AI_AGENT_PLAYBOOK.md](../../AI_AGENT_PLAYBOOK.md)
- [openspec/specs/agent-instruction-system/spec.md](../../../openspec/specs/agent-instruction-system/spec.md)
