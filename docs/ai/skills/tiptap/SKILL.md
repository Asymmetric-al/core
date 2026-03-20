---
name: tiptap
description: Tiptap rich text editor for React and Next.js. Use when building or modifying rich text editors, @tiptap extensions, StarterKit, collaboration, comments, Content AI, import/export, or Pro extensions in this monorepo.
metadata:
  owner: "skills-steward"
  last_updated: 2026-03-20
  status: "active"
  upstream:
    url: "https://tiptap.dev/docs/resources/agent-skill"
    repo: "ueberdosis/tiptap"
    path: "skills/tiptap/SKILL.md"
    license: "MIT"
license: MIT
---

# Tiptap — Agent skill

Guidance for coding agents working with the **Tiptap** rich text stack in this repository.

## When to apply

Use this skill when:

- Editing or extending the shared rich text editor under `packages/ui/components/shadcn/rich-text-editor/`
- Adding or upgrading `@tiptap/*` packages
- Integrating Tiptap with **Next.js App Router** (SSR, client boundaries, hydration)
- Implementing collaboration, comments, tracked changes, conversion, Content AI, or Pro features

Do **not** use this skill when:

- The task is unrelated to rich text (e.g. plain `<textarea>` or a different editor)
- You only need general React patterns (use `react-component-dev`) or App Router structure (use `nextjs-app-router`)

## This monorepo

- **Shared editor implementation:** `packages/ui/components/shadcn/rich-text-editor/` (`editor.tsx`, `extensions.ts`, `toolbar.tsx`)
- **Primary dependencies:** `packages/ui/package.json` (`@tiptap/react`, `@tiptap/starter-kit`, extensions)
- **Consumers:** Apps import via `@asym/ui` (deep imports); do not duplicate editor primitives inside `apps/*`
- **Version alignment:** Every package under `@tiptap/*` in a given workspace should use the **same semver line**. The root `package.json` may also list `@tiptap/*` for app-level usage—keep versions consistent with `packages/ui` when you touch either

## CLIs (Skills ecosystem + Tiptap)

This repo standardizes on **Bun** (`bun`, `bunx`). Prefer `bunx` for one-off CLIs; `npx` remains valid for the open **Skills** package manager.

| Purpose | Command |
| -------- | -------- |
| Install / refresh the **upstream** Tiptap agent skill in another workspace | `npx skills add ueberdosis/tiptap` |
| **Tiptap project CLI** (init, add UI pieces, cloud login) | `bunx @tiptap/cli@latest` (or `npx @tiptap/cli@latest`) |

When running Tiptap CLI against this monorepo, set the working directory to the package that owns the editor (**`packages/ui`**) unless the CLI docs require the app root.

After changing **this** canonical skill under `docs/ai/skills/tiptap/`, run:

```bash
bun run skills:sync
```

Then commit updates under `.cursor/skills/` and `.agents/skills/` so CI (`bun run skills:verify`) stays green.

## Best practices

### General

- Target **Tiptap 3** and follow the official installation guides when adding new surface area
- Align **all** `@tiptap/*` versions in the workspace you modify
- **Pro extensions** and private registry setup: see Tiptap docs (`pro-extensions` guide)

### Next.js and React

- For SSR / App Router, set **`immediatelyRender: false`** on `useEditor` (already done in `editor.tsx`; preserve when refactoring)
- Prefer the **React** APIs documented in Tiptap (`useEditor`, `EditorContent`, extensions)

### Reference repositories (optional, for deep searches)

If you need to grep upstream source or docs locally, clone (or update) into a **git-ignored** folder such as `.reference/` (see repo `.gitignore`):

- https://github.com/ueberdosis/tiptap
- https://github.com/ueberdosis/tiptap-docs

Do not commit these clones.

## Feature map (read upstream docs)

When implementing these capabilities, open the matching section in **tiptap-docs** (local clone or https://tiptap.dev/docs):

- Real-time collaboration → `collaboration/`
- Comments → `comments/`
- Tracked changes → `tracked-changes/`
- Import / export (DOCX, PDF, Markdown, etc.) → `conversion/`
- Content AI (toolkit, insert content, proofreader, server AI) → `content-ai/`
- Version history / snapshot / compare → `collaboration/documents/`
- Pages (print layout) → `pages/`

## Workflow

1. Open `packages/ui/components/shadcn/rich-text-editor/*` and trace how `extensions` and the toolbar map to the document schema
2. For new behavior, check Tiptap docs for the correct extension or command API
3. Add dependencies in `packages/ui` (and align root `@tiptap/*` if those packages are also used at root)
4. Keep `immediatelyRender: false` for Next.js client editors
5. Run scoped checks: `bunx turbo run lint --filter=@asym/ui` and `bunx turbo run typecheck --filter=@asym/ui`

## Checklist

- [ ] Changes live in `packages/ui` unless an app-only integration is explicitly required
- [ ] All `@tiptap/*` versions aligned in touched workspaces
- [ ] Next.js editor options safe for SSR (`immediatelyRender: false` where applicable)
- [ ] Toolbar/commands and schema stay consistent (no orphaned marks/nodes)
- [ ] Lint and typecheck pass for `@asym/ui`

## References

- `references/upstream.md` — attribution and refresh instructions
- Official agent skill page: https://tiptap.dev/docs/resources/agent-skill

## Common mistakes

- Omitting `immediatelyRender: false` and breaking hydration in the App Router
- Mixing mismatched `@tiptap/*` versions across packages
- Duplicating editor code in `apps/*` instead of extending `@asym/ui`
