# Copilot instructions (Asymmetric-al / give-hope monorepo)

Follow root **`AGENTS.md`**. Do not duplicate it here.

- **OpenSpec:** `openspec/project.md`, `openspec/specs/**`, and active `openspec/changes/**` before non-trivial feature or behavior work. Skip OpenSpec for formatting, typos, and generated-mirror updates.
- **TDD:** substantive behavior-changing work uses `docs/ai/skills/tdd/SKILL.md` (RED → GREEN → REFACTOR). Documentation-only and generated-mirror edits do not need an artificial RED test.
- **UI:** every UI/UX change must preserve exact `base-maia` in `packages/ui`. See `packages/ui/AGENTS.md` and `docs/ai/skills/moai-library-shadcn/SKILL.md`.
- **Next.js:** read bundled docs in `node_modules/next/dist/docs/`; use committed `.next-docs/` when `node_modules` is missing.
- **Nested `AGENTS.md`:** `apps/admin`, `apps/donor`, `apps/missionary`, `packages/api`, `packages/auth`, `packages/database`, `packages/ui`, `packages/eve-runtime`, `supabase`, `scripts`.
- **Path-specific Copilot files:** `.github/instructions/*.instructions.md`.
- **shadcn/studio MCP:** `.github/instructions/shadcn-studio-mcp.instructions.md` only when using that server — it is not always-on.
