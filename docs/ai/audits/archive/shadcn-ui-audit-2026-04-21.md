> **ARCHIVED (2026-06):** Historical audit from the Radix era. The UI layer
> is now Base UI only — see docs/ai/audits/base-ui-only-migration.md.

# shadcn/ui audit — 2026-04-21 (MCP + skill)

This audit follows the repo plan: **shadcn MCP** for registry wiring and catalog operations, **shadcn skill** (Critical Rules: styling, forms, composition, icons, CLI) for severity and remediation framing, plus **CLI** (`npx shadcn@latest`) as the documented companion to the MCP server for `info`, `docs`, `view`, `search`, and `add --dry-run/--diff`.

## 1. Environment and MCP

| Item                                              | Value                                                   |
| ------------------------------------------------- | ------------------------------------------------------- |
| shadcn CLI (used for MCP-equivalent registry ops) | `4.4.0` (`npx shadcn@latest --version`)                 |
| Project root for shadcn config                    | `packages/ui` (`components.json`, `shadcn info --json`) |
| Tailwind                                          | v4 (`tailwindVersion` in `info` JSON)                   |
| Style / base                                      | `base-maia`, `base: "base"`                             |
| `rsc`                                             | `false`                                                 |
| `iconLibrary`                                     | `lucide`                                                |
| Resolved UI path                                  | `packages/ui/components/shadcn`                         |

### 1.1 MCP server configuration (repo)

Per [shadcn MCP docs](https://ui.shadcn.com/docs/mcp), the server was initialized for Cursor:

- `bunx --bun shadcn@latest mcp init --client cursor` → updated **`.cursor/mcp.json`**
- **`.mcp.json`** (repo root) was updated in parallel so AGENTS.md’s “mirrored to `.cursor/mcp.json`” contract includes the same `shadcn` entry:

```json
"shadcn": {
  "command": "npx",
  "args": ["--yes", "shadcn@latest", "mcp"]
}
```

(`--yes` matches non-interactive `npx` / CLI usage elsewhere in this audit; avoids install prompts when Cursor spawns the MCP subprocess.)

**Human step:** In Cursor Settings, enable the **shadcn** MCP server (green dot). The agent session used **CLI** for all registry calls because hosted MCP tool names (`list_components`, `get_component_metadata`, …) are not exposed in this runner; behavior matches the same registries the MCP server would use (`components.json` + `@shadcn` URL pattern from `info`).

### 1.2 Tooling note (Bun vs npx)

`bunx --bun shadcn@latest search …` failed with `fast-glob` / `./providers/async` under Bun 1.3.4. **`npx --yes shadcn@latest`** was used for `search` / heavy CLI paths. Prefer **npx** for shadcn in CI until Bun compatibility is confirmed.

### 1.3 Registries (`get_project_registries` equivalent)

From `shadcn info --json` → `config.registries`:

| Namespace                               | URL pattern                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| `@shadcn`                               | `https://ui.shadcn.com/r/styles/{style}/{name}.json`                           |
| `@ss-components`                        | `https://shadcnstudio.com/r/components/{name}.json` (+ `EMAIL`, `LICENSE_KEY`) |
| `@ss-themes`                            | `https://shadcnstudio.com/r/themes/{name}.json`                                |
| `@ss-blocks`                            | `https://shadcnstudio.com/r/blocks/{name}.json`                                |
| `@efferd`                               | `https://efferd.com/r/{style}/{name}.json` (+ bearer token)                    |
| `@reactbits-starter` / `@reactbits-pro` | `pro.reactbits.dev` (+ license header)                                         |
| `@shadcnuikit`                          | `shadcnuikit.com` (+ `REGISTRY_TOKEN`)                                         |

**Skill:** Never assume a default registry for new installs; third-party blocks require explicit namespace + env.

---

## 2. Installed catalog vs filesystem

### 2.1 Canonical components (`list_components` equivalent)

`shadcn info --json` lists **62** installed names (accordion … tooltip). These map to `packages/ui/components/shadcn/*.tsx` for the core set.

### 2.2 Extended first-party surface (beyond catalog)

Glob under `packages/ui/components/shadcn/**/*.tsx` shows **140** TypeScript React files. Notable extensions not in the `components` array:

| Area                                                                  | Role                                                     |
| --------------------------------------------------------------------- | -------------------------------------------------------- |
| `data-table/**`                                                       | App-wide table, filters, virtualization, URL state       |
| `data-grid/**`                                                        | Spreadsheet-style grid                                   |
| `rich-text-editor/**`                                                 | Tiptap-based editor shell                                |
| `map.tsx`, `image-upload*.tsx`, `filter-bar.tsx`, `page-shell.tsx`, … | Product primitives living beside shadcn                  |
| `shadcn-studio/**` (under `packages/ui/components/`)                  | Studio-sourced blocks (separate folder; uses `@asym/ui`) |

**Skill / moai:** Treat `components/shadcn/*` as owned; wrappers belong outside or in clearly named product modules.

---

## 3. Consumer import map (sample)

`@asym/ui` is imported across **admin**, **donor**, **missionary**, `packages/missionary`, `packages/ui` internals, tests, etc. The dominant pattern is **deep imports**:

`import { Button } from "@asym/ui/components/shadcn/button";`

This matches the monorepo tree-shaking convention noted in prior audits.

---

## 4. MCP / upstream reference checks (metadata + demos)

Commands used:

```bash
cd packages/ui
npx --yes shadcn@latest info --json
npx --yes shadcn@latest docs button dialog field --json
npx --yes shadcn@latest view @shadcn/button
npx --yes shadcn@latest view @shadcn/chart
npx --yes shadcn@latest search @shadcn -q chart -l 3
```

### 4.1 `@shadcn/button` (`view`)

Upstream **base-maia** `button.tsx` uses **`@base-ui/react/button`**, `rounded-4xl`, **`has-data-[icon=inline-end]`** / **`has-data-[icon=inline-start]`** padding, and **`group/button`**. Docs/examples links are in registry `meta.links` (same as `docs --json` output).

### 4.2 Local `packages/ui/components/shadcn/button.tsx`

Local button uses **`radix-ui` `Slot`**, **`asChild`**, **`has-[>svg]:px-*`**, custom **`maia` / `maia-outline`** variants, **`@asym/ui/lib/utils`**, **`rounded-md`**.

**Severity: P2 (intentional fork).** Aligning to upstream would remove `asChild` and Maia variants; do not `--overwrite` without an explicit design decision.

### 4.3 Dialog + Field (`docs --json` + GitHub example URL)

`docs dialog` / `docs field` return Base docs + example URLs. Upstream **dialog-example** composes **DialogTitle**, **Field**, **FieldGroup**, **InputGroup** + **InputGroupInput** — this is the **skill** reference for forms inside dialogs.

### 4.4 Chart (`view @shadcn/chart`)

Registry chart depends on **`recharts@3.8.0`** and **`registryDependencies: ["card"]`**. Local `chart.tsx` is `"use client"` and matches the general Recharts wrapper pattern; verify **pinned `recharts` version** in `packages/ui/package.json` when upgrading.

---

## 5. Compliance pass (shadcn skill Critical Rules)

Evidence is repo-wide for TSX under `apps/`, `packages/` (excluding `vendor/` where noted).

### 5.1 Styling — `space-x-*` / `space-y-*` (skill: use `gap`)

| Scope                           | Approx. file hits (rg `space-[xy]-` in `*.tsx`)    |
| ------------------------------- | -------------------------------------------------- |
| `apps/admin`                    | High (dozens of files)                             |
| `apps/donor`                    | Many (dashboard + checkout)                        |
| `apps/missionary`               | Many                                               |
| `packages/ui/components/shadcn` | **12** files (mostly `data-table/*`, `avatar.tsx`) |

**Severity:** **P3 consistency** in apps; **P2** in shared `@asym/ui` shadcn subtree — prefer `flex flex-col gap-*` / `flex gap-*` per skill.

### 5.2 Manual `z-*` on overlays (skill: no manual z-index on overlay components)

Many hits include **`packages/ui/components/shadcn`** (`dialog`, `sheet`, `drawer`, `popover`, `select`, `dropdown-menu`, etc.) and apps. **Primitives often set z-index for stacking**; classify per file: if it duplicates Radix/Base stacking, **P3**; if it fights portaled content, **P1**.

### 5.3 Icons in `Button` — `data-icon` (skill)

- **`data-icon=`** in `*.tsx`: **0** matches repo-wide.
- Upstream base-maia button explicitly documents **`data-icon="inline-start"` / `inline-end"`** via variant classes (`view @shadcn/button`).

**Severity: P3 (wide consistency)** — adopt `data-icon` when touching buttons; optional codemod after aligning local `Button` with upstream.

### 5.4 Truncate longhand

No matches for `overflow-hidden text-ellipsis whitespace-nowrap` in TSX (good).

### 5.5 Forms — `FieldGroup` / `Field` / `InputGroup`

Apps use **`Asym*Field`** + **`useAsymForm`** (`@asym/ui/components/primitives/tanstack-form`) alongside shadcn **Field** imports in places (e.g. mission-control `LocationEditor`). **Skill:** Prefer **Field** composition + **`data-invalid` / `aria-invalid`** at control boundaries; grep spot-checks should be part of a follow-up PR per feature area.

### 5.6 Skeleton vs `animate-pulse`

Custom `animate-pulse` outside `skeleton.tsx` appears in **`rich-text-editor/toolbar.tsx`** (upload state). **Skill:** Prefer **`Skeleton`** where it represents layout loading, not transient toolbar state ( **P3** ).

---

## 6. RSC / `"use client"` (`rsc: false`)

For every `packages/ui/components/shadcn/**/*.tsx` containing `useState` / `useEffect` / `useLayoutEffect` / `useRef`, the first line was checked: **no file missing `"use client"`** (scripted scan from `packages/ui/components/shadcn`).

**Note:** `components.json` `rsc: false` does not remove the need for `"use client"` on hook-using modules; the package is in good shape on this axis.

---

## 7. Upstream drift (`add --dry-run` / `--diff`) — **do not overwrite**

Sample commands:

```bash
cd packages/ui
npx --yes shadcn@latest add button --dry-run
npx --yes shadcn@latest add button --diff
npx --yes shadcn@latest add field --diff
```

**Findings:**

1. **`button`:** Upstream → Base UI `ButtonPrimitive`; local → Radix `Slot` + `asChild` + **Maia** variants. Large intentional divergence.
2. **`field`:** `add field --diff` pulls **`label`**, **`separator`**, and related files — shows **radix-ui → native / base-ui** migrations and import alias churn (`@/lib/utils` vs `@asym/ui/lib/utils`).

**Skill:** Never `add --overwrite` without explicit approval. Plan **merge-by-file** or a dedicated “migrate to base-maia template” production.

---

## 8. Remediation backlog (prioritized)

| Priority | Item                                                            | Action                                                                                                                                                 |
| -------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1       | **Decide primitive stack for `Button` / `Label` / `Separator`** | Either stay on Radix-slot patterns and document as fork, or schedule migration to Base UI template from `@shadcn` and re-add Maia as wrapper variants. |
| P2       | **`space-y` / `space-x` in `packages/ui/components/shadcn`**    | Replace with `flex` + `gap-*` in data-table + avatar (bounded PR).                                                                                     |
| P2       | **`data-icon` adoption**                                        | After button alignment, lint or codemod icon+label buttons.                                                                                            |
| P3       | **App-level `space-y`**                                         | Gradual cleanup when touching files; not blocking.                                                                                                     |
| P3       | **shadcn CLI + Bun**                                            | Document “use `npx shadcn@latest` for search/add” in contributor docs if not already.                                                                  |
| Ops      | **Enable shadcn MCP in Cursor**                                 | Toggle server on after pulling `.cursor/mcp.json`.                                                                                                     |

---

## 9. Verification commands (replay)

```bash
cd packages/ui
npx --yes shadcn@latest info --json
npx --yes shadcn@latest docs button dialog field --json
npx --yes shadcn@latest view @shadcn/button
npx --yes shadcn@latest search @shadcn -q chart -l 5
npx --yes shadcn@latest add button --dry-run
npx --yes shadcn@latest add button --diff | head -100
```

---

## 10. References (skill + upstream)

- shadcn skill: Critical Rules (styling, forms, composition, icons, CLI).
- [shadcn MCP](https://ui.shadcn.com/docs/mcp)
- Registry item examples: `meta.links.docs` / `meta.links.examples` from `shadcn view` / `shadcn docs --json`.
