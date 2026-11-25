# Design: Upgrade UI SDK (`0.1.0-beta.17`) and OpenSpec (`2.2.0`)

## Context & Release Targets

Verified live from npm registry metadata and official Git repositories on
2026-11-25:

- **Vercel UI SDK (`vercel-labs/ui`):**
  - Previous pins: `@ui-sdk/core@0.1.0-beta.2`, `@ui-sdk/react@0.1.0-beta.2`
    (commit `8ff6bcf7100d48230a3fab8c72475d99316cc58a`).
  - Target pins: `@ui-sdk/core@0.1.0-beta.17`, `@ui-sdk/react@0.1.0-beta.17`
    (tags `@ui-sdk/core@0.1.0-beta.17` and `@ui-sdk/react@0.1.0-beta.17`,
    commit `d850982bd8aed202e07009825c3d9daf643fa24e`, 2026-11-24).
  - Peer requirements: `react >=19`, `react-dom >=19`,
    `@types/react >=19.2.10` — satisfied by Core's `react@19.3.1` and
    `@types/react@19.3.0`.
- **OpenSpec (`Fission-AI/OpenSpec`):**
  - Previous pin: `@fission-ai/openspec@2.1.0`
    (tag `v2.1.0`, commit `8bd4b3557b5bf1d231cd2f165b28f24e2d90a2a0`).
  - Target pin: `@fission-ai/openspec@2.2.0`
    (tags `v2.2.0` and `@fission-ai/openspec@2.2.0`,
    commit `f1cd852f4edce22b8df9548a4df889172ca8ff25`, 2026-11-24).
  - Engine requirement: `node >=22.20.0` — satisfied by Core's
    `node >=24.22.3 <25`.

## Affected Packages, Apps, and Systems

- **Shared UI (`packages/ui`):** `package.json`, `components/primitives/{agent-bridge,rating,shortcut,shortcut-help,sortable-list}.tsx`, `styles/globals.css` (layer order verified unchanged).
- **Consuming apps (`apps/admin`, `apps/donor`, `apps/missionary`):**
  - `apps/admin`: `app/mc-shell.tsx`, `app/css-layer-order.css`, `features/support-hub/components/settings/macros/MacroActionEditor.tsx`, `features/support-hub/components/command/use-inbox-shortcuts.ts`, `src/cms-ui/web-studio/collections/shared/list-workspace/grid-view-menu.tsx`, and studio save-shortcut consumers.
  - `apps/donor`, `apps/missionary`: dashboard shell shortcuts and `ShortcutHelp` mounts.
  - None of `apps/*` declare or import `@ui-sdk/*`; all continue to consume `@asym/ui` wrappers exclusively.
- **Root tooling & agent instructions:**
  - `package.json`, `bun.lock`, `skills-lock.json`
  - `scripts/refresh-upstream-skills.mjs`
  - `scripts/verify/openspec-delta-compatibility.mjs` and `scripts/lib/openspec-contracts.mjs` (verified compatible with OpenSpec 2.2.0 internal ESM exports)
  - `docs/ai/skills/ui-sdk/**`, `docs/ai/skills/openspec/**`, `docs/ai/skills/openspec-*/**`
  - Generated mirrors under `.agents/skills/**`, `.claude/skills/**`, `.cursor/skills/**`
  - `docs/ai/rules/openspec.md`, `docs/ai/rules/agent-skill-routing.md`, `openspec/project.md`
  - `docs/ai/skill-source-audit.json`, `docs/ai/skills-maintenance-log.md`
  - Unit & Playwright suites covering UI SDK wrappers, pattern conformance, OpenSpec pin/refresh/delta compatibility, and skill inventory.

## Migration Decisions

### 1. UI SDK (`0.1.0-beta.2` → `0.1.0-beta.17`)

- **Cancelled `setValue` in `agent.act`:** Starting in `0.1.0-beta.17`, when a
  consumer cancels a `set*` action (such as `Rating`'s `setValue`), UI SDK's
  `agent.act` reports failure (`ok: false`, error noting the value did not
  change) rather than silently succeeding with empty changes, while keeping the
  original control value intact. Update `agent-bridge.test.tsx` to verify that
  the control keeps its value, no change is applied, and the bridge surfaces
  the refusal honestly.
- **Out-of-bounds numeric refusal & strict step validation:** `0.1.0-beta.17`
  refuses numeric `setValue` outside `[min, max]` and rejects malformed step
  shapes (extra keys or non-array `args`) up front. Add targeted unit coverage
  to lock these invariants on Core's `AgentBridge` + `Rating` + `SortableList`.
- **`checkPattern` hidden-input fix:** `0.1.0-beta.6` fixed `checkPattern` to
  ignore `aria-hidden` native inputs. Re-verify `radio-group` and `rating` in
  `tests/e2e/ui-sdk-pattern-conformance.spec.ts` in Chromium; if `checkPattern`
  now passes cleanly on them, promote them to zero-problem assertions while
  preserving keyboard verification and checking whether `MODAL_DIALOG_DEVIATION`
  still matches exact `checkPattern(dialog, "dialog")` output.
- **Held-key protection in `shortcut.tsx`:** Although `0.1.0-beta.8` added an
  optional `repeat` flag to `useSdkShortcut`, UI SDK still ignores
  `event.repeat` without calling `preventDefault()` when `repeat` is falsy.
  Keep Core's `takeHeldKey` guard so held shortcuts (such as `Cmd+S`) never
  leak to the browser.
- **UI SDK skill refresh:** Follow `docs/ai/skills/ui-sdk/references/upstream.md`:
  verify `packages/ui/node_modules/@ui-sdk/core/skills/ui-sdk/` matches commit
  `d850982bd8aed202e07009825c3d9daf643fa24e`, compute `skills-lock.json`
  `computedHash` using `npx --yes skills@1.5.7 add <scratch>/packages/core --skill ui-sdk --agent codex --copy -y`
  in an isolated scratch directory, preserve Core's description, Core note,
  marked overlay (updated to `d850982` / `0.1.0-beta.17`), scanner comments,
  and Apache-2.0 change notices.

### 2. OpenSpec (`2.1.0` → `2.2.0`)

- **Managed cohort refresh:** Update `scripts/refresh-upstream-skills.mjs` to
  fetch tag `v2.2.0`, include `"openspec"` in `openspecSkillNames` (with
  `LICENSE` copied to `references/LICENSE.md` and existing Core overlays
  preserved on refresh), and reconcile `openspec/SKILL.md` plus its three
  `references/*.md` files (`answers.md`, `where-things-stand.md`,
  `without-skills.md`) inside `ensureOpenSpecRepositoryScope`:
  - Replace bare `openspec` CLI invocations with `bun run openspec --` where
    actionable, remove Store routing (`--store`, `openspec store list`) and
    replace the `## Stores` section with an explicit Core no-Stores policy,
    remove recommendations to run `openspec init`, `openspec config profile`,
    `openspec update`, or custom schemas against Core, enforce resuming
    existing changes without recreating them, and enforce Core's
    merge-before-archive policy.
  - Keep fail-closed guards in `ensureOpenSpecRepositoryScope` scanning both
    `SKILL.md` and `references/*.md` so prohibited upstream recommendations
    cannot leak on future refreshes.
- **Preserve Core boundaries:** Do not import the five rejected workflow skills,
  do not enable Stores or custom schemas, keep `skillsScope: project`, keep
  `openspec/project.md` as Core's index, and never run `openspec update` or
  `openspec init` against the live checkout.
- **Internal parser compatibility:** Confirmed in an isolated scratch smoke
  checkout that `@fission-ai/openspec@2.2.0` retains `findSpecUpdates` and
  `buildUpdatedSpec` in `dist/core/specs-apply.js` and
  `extractRequirementsSection` / `parseDeltaSpec` in
  `dist/core/parsers/requirement-blocks.js`. Verify
  `scripts/verify/openspec-delta-compatibility.mjs` and its unit tests directly
  after updating the pin.

## Security, Data, & Architectural Boundaries

- No database migrations, RLS changes, secret changes, or API boundary changes.
- `AgentBridge` remains deny-by-default, lazy-loaded, mounted once per document
  with SDK controls, and scoped only to explicit allowlisted labels/actions.
- `@ui-sdk/*` remains confined to `packages/ui`; apps never import it directly;
  `@ui-sdk/core/web.css` remains unused; `@layer ui-sdk;` stays first.
- Product-runtime Eve remains strictly read-only for OpenSpec.

## Validation & Rollback

- **Validation:** Isolated scratch verification of OpenSpec 2.2.0, frozen-lockfile
  clean-install check, `openspec:version`, `openspec:validate`,
  `openspec:audit-archive`, `verify:openspec-deltas`, `skills:verify`,
  `verify:comments`, `verify:workspace-contract`, `verify:bun-lock-drift`,
  `tests/unit/docs`, `tests/unit/scripts/openspec-*`, `tests/unit/packages/ui`,
  isolated Playwright UI SDK specs (and real-apps spec where runnable),
  `bun run check`, affected builds, and `bun run ci:preflight`.
- **Rollback:** Revert the PR merge commit (restoring `package.json`,
  `packages/ui/package.json`, `bun.lock`, `skills-lock.json`, canonical skills,
  mirrors, refresh script, docs, and tests in one atomic revert) and run
  `bun install --frozen-lockfile`.
