# Council record: Core quality-toolchain migration plan

**Note (2026-11-20).** Plan v10, where this record's first nine sections end, has been replaced by the leaner plan v11. Section 10 records how. Sections 1 to 9 are kept as written.

This is the record of the council that reviewed the migration plan between 18 and 19 November 2026. It lists who reviewed, what they scored, what they found, and how each finding was answered. The plan it ends in is plan v10, the design document of this change.

## 1. What the council was

The owner asked for the plan to be reviewed by three independent models before any implementation, and set these rules:

- **Three reviewers per round,** each from a different provider: Claude Code (Claude Opus 5.5), Codex (GPT 6.2 Astra) and Cursor (Gemini 4 Carbon, later Gemini 4 Neon).
- **Round 1** was an independent investigation of the research handoff and the repository, without scores.
- **Rounds 2 to 10** were scored reviews of a frozen plan. Each reviewer read the whole plan, the owner's assignment, the research handoff and the evidence, and could run read-only checks against the repository and the candidate tools.
- **A fixed rubric** of eight dimensions, each scored 0 to 10: intent and completeness; evidence and repository fit; technical coherence; behavior and integrity; implementability; verification quality; simplicity and maintenance; operational reliability.
- **The pass rule:** the unrounded mean of all 24 scores is at least 9.2, and no reviewer reports a hard gate. A hard gate is an unresolved material correctness or safety defect, missing mandatory scope, an unsupported critical compatibility assumption, or a critical path that cannot be executed.
- **Independence:** every review was a fresh agent that saw only the brief and the frozen inputs. Briefs never contained earlier scores. Reviewers worked read-only, each in its own worktree.
- **The coordinator** (Claude Code in the owner's thread) wrote each plan version, ran the qualification experiments recorded as evidence E1 to E76 (E70 to E76 after round 10), and accepted or rejected each finding with a reason. It did not score.

## 2. Who reviewed, and what the owner directed

| Round             | Plan reviewed        | Claude Code model, effort | Cursor model, effort  | Codex model, effort |
| ----------------- | -------------------- | ------------------------- | --------------------- | ------------------- |
| 1 (investigation) | the research handoff | Claude Opus 5.5, xhigh    | Gemini 4 Carbon, high | GPT 6.2 Astra, max  |
| 2                 | v1                   | Claude Opus 5.5, xhigh    | Gemini 4 Carbon, high | GPT 6.2 Astra, max  |
| 3                 | v2                   | Claude Opus 5.5, xhigh    | Gemini 4 Carbon, high | GPT 6.2 Astra, max  |
| 4                 | v3                   | Claude Opus 5.5, xhigh    | Gemini 4 Carbon, high | GPT 6.2 Astra, max  |
| 5                 | v4                   | Claude Opus 5.5, xhigh    | Gemini 4 Carbon, high | GPT 6.2 Astra, max  |
| 6                 | v5                   | Claude Opus 5.5, xhigh    | Gemini 4 Carbon, high | GPT 6.2 Astra, max  |
| 7                 | v6                   | Claude Opus 5.5, xhigh    | Gemini 4 Carbon, high | GPT 6.2 Astra, max  |
| 8                 | v7                   | Claude Opus 5.5, xhigh    | Gemini 4 Neon, xhigh  | GPT 6.2 Astra, max  |
| 9                 | v8                   | Claude Opus 5.5, xhigh    | Gemini 4 Neon, xhigh  | GPT 6.2 Astra, max  |
| 10                | v9                   | Claude Opus 5.5, xhigh    | Gemini 4 Neon, xhigh  | GPT 6.2 Astra, max  |

Gemini 4 Carbon offers no effort above high. Each Claude review ran on a Claude Code subscription other than the coordinator's, and the subscription changed from round to round.

**Owner instructions during the council:**

- **Effort floor** (set before the round 1 reviews ran): no reviewer runs at low effort. Codex Astra runs at max, Claude at high or xhigh, and Gemini at the highest effort its model offers.
- **Subscriptions:** when one subscription cannot continue, the work moves to another available Claude Code or Codex subscription.
- **Model change** (after round 7): the Cursor reviewer changes from Gemini 4 Carbon to the newly released Gemini 4 Neon, at xhigh. This was the owner's choice of model, not a response to a review; the round 7 Carbon review stands as recorded.
- **Model mix for other delegated work** (during round 8): implementation, qualification and audit agents use a mix of GPT 6.2 Astra at xhigh, Gemini 4 Neon at xhigh and Claude Opus.
- **Provider of the Gemini seat** (19 November, after the final check): the Gemini 4 Neon seat moves from Cursor to Antigravity, at xhigh. Cursor had refused the model during the audit. A one-line probe confirmed that Antigravity runs Gemini 4 Neon at that level. No council review ran on Antigravity; this applies to implementation and later reviews.
- **React Doctor** (ruling of 18 November, reported by the round 10 Claude reviewer): the React Doctor ledger is never rebound or requalified in any branch. Plan v10 withdraws the two tasks that would have done so.
- **Last round** (during round 10): round 10 is the final round. The plan is ratified after it, complete, using all the evidence from every round.

**Interruptions, all recovered:**

- Two Claude subscriptions hit their weekly limits at the start of a review, in rounds 2 and 9. Each produced no output and no score, and a fresh reviewer on another subscription reviewed the same frozen plan.
- During round 10 the coordinator's own subscription hit a usage limit. That stopped the coordinator, the round 10 Codex review, and an eleven-agent audit, none of which had reported. After the limit reset, the Codex review and the audit were run again from the start against the same frozen inputs. The Claude and Gemini round 10 reviews had already finished and were not affected.

## 3. Scores by round

Each reviewer scored eight dimensions from 0 to 10. A round passes only if the unrounded mean of its 24 scores is at least 9.2 and no reviewer reports a hard gate.

| Round | Plan | Claude mean (hard gates) | Gemini mean (hard gates) | Codex mean (hard gates) | Mean of 24 | Result     |
| ----- | ---- | -----------------------: | -----------------------: | ----------------------: | ---------: | ---------- |
| 2     | v1   |                7.875 (2) |               8.4125 (4) |              7.7375 (7) |     8.0083 | not passed |
| 3     | v2   |                 8.55 (0) |                9.025 (2) |              8.4875 (4) |     8.6875 | not passed |
| 4     | v3   |                 8.65 (0) |                 8.65 (2) |               8.025 (4) |     8.4417 | not passed |
| 5     | v4   |                8.925 (0) |                8.475 (5) |              8.3625 (7) |     8.5875 | not passed |
| 6     | v5   |               8.9625 (0) |                  8.9 (4) |                8.45 (6) |     8.7708 | not passed |
| 7     | v6   |                8.925 (0) |                  8.8 (4) |                8.25 (6) |     8.6583 | not passed |
| 8     | v7   |                  8.9 (0) |               8.5625 (4) |              8.0875 (5) |     8.5167 | not passed |
| 9     | v8   |                  8.8 (0) |                  8.5 (3) |              8.3375 (4) |     8.5458 | not passed |
| 10    | v9   |               8.7125 (0) |                 8.55 (4) |               8.625 (3) |     8.6292 | not passed |

No round passed. Claude reported no hard gate from round 3 onward; Gemini and Codex reported between two and seven in every round.

### 3.1 Scores by dimension

**Round 2** — plan v1 (50,229 bytes, SHA-256 `c408f65aba79627b1f9f0648d73aaecf29b74b5d7c4301ada413e71735e60f73`). Claude Opus 5.5, xhigh; Gemini 4 Carbon, high; GPT 6.2 Astra, max.

| Dimension                   | Claude | Gemini |  Codex |
| --------------------------- | -----: | -----: | -----: |
| Intent and completeness     |    8.2 |    8.9 |    8.5 |
| Evidence and repository fit |    7.8 |    8.4 |      9 |
| Technical coherence         |    7.9 |    8.1 |    7.1 |
| Behavior and integrity      |    6.6 |    8.3 |    7.8 |
| Implementability            |      8 |    7.8 |    6.7 |
| Verification quality        |    7.5 |    8.8 |    7.7 |
| Simplicity and maintenance  |    8.6 |    9.1 |    8.3 |
| Operational reliability     |    8.4 |    7.9 |    6.8 |
| **Mean**                    |  7.875 | 8.4125 | 7.7375 |

The first Claude attempt hit its subscription's weekly limit and produced nothing; a fresh reviewer on another subscription replaced it.

**Round 3** — plan v2 (62,391 bytes, SHA-256 `46cd8f477bea0022225acfa9937975de9d74b76a9300fa55ef30b3ae0ddd2e1b`). Claude Opus 5.5, xhigh; Gemini 4 Carbon, high; GPT 6.2 Astra, max.

| Dimension                   | Claude | Gemini |  Codex |
| --------------------------- | -----: | -----: | -----: |
| Intent and completeness     |    8.7 |    9.4 |    9.2 |
| Evidence and repository fit |    8.4 |    8.9 |    9.3 |
| Technical coherence         |    8.5 |    8.6 |    7.9 |
| Behavior and integrity      |    7.9 |    9.4 |    8.4 |
| Implementability            |    8.6 |    8.4 |      8 |
| Verification quality        |    8.5 |    9.3 |    8.5 |
| Simplicity and maintenance  |    8.8 |    9.5 |    8.6 |
| Operational reliability     |      9 |    8.7 |      8 |
| **Mean**                    |   8.55 |  9.025 | 8.4875 |

**Round 4** — plan v3 (59,348 bytes, SHA-256 `b4f7b93fb82105ca0317728ff90ffc57f8424011da972a9eb9c9de830f9dee6b`). Claude Opus 5.5, xhigh; Gemini 4 Carbon, high; GPT 6.2 Astra, max.

| Dimension                   | Claude | Gemini | Codex |
| --------------------------- | -----: | -----: | ----: |
| Intent and completeness     |      9 |    9.2 |   9.1 |
| Evidence and repository fit |    8.7 |    8.4 |     9 |
| Technical coherence         |    8.6 |    8.3 |   7.1 |
| Behavior and integrity      |    8.3 |    8.9 |   8.3 |
| Implementability            |    8.6 |      8 |   7.1 |
| Verification quality        |    8.7 |    9.1 |   8.2 |
| Simplicity and maintenance  |    8.6 |    9.2 |     8 |
| Operational reliability     |    8.7 |    8.1 |   7.4 |
| **Mean**                    |   8.65 |   8.65 | 8.025 |

**Round 5** — plan v4 (83,596 bytes, SHA-256 `3e5270df18ad66caed834ffbcd086a735630a67b8cc6350f316829e329a6f776`). Claude Opus 5.5, xhigh; Gemini 4 Carbon, high; GPT 6.2 Astra, max.

| Dimension                   | Claude | Gemini |  Codex |
| --------------------------- | -----: | -----: | -----: |
| Intent and completeness     |    9.2 |      9 |    8.9 |
| Evidence and repository fit |      9 |    7.9 |      9 |
| Technical coherence         |      9 |    8.2 |    7.8 |
| Behavior and integrity      |    8.6 |    8.8 |    8.7 |
| Implementability            |      9 |      8 |    7.8 |
| Verification quality        |    8.7 |    8.9 |    8.6 |
| Simplicity and maintenance  |    8.9 |      9 |    8.5 |
| Operational reliability     |      9 |      8 |    7.6 |
| **Mean**                    |  8.925 |  8.475 | 8.3625 |

**Round 6** — plan v5 (79,270 bytes, SHA-256 `1344bdefa93c5c8fdc2a0d8c73240918e1be072c7849f3df761413d8e28a9b4f`). Claude Opus 5.5, xhigh; Gemini 4 Carbon, high; GPT 6.2 Astra, max.

| Dimension                   | Claude | Gemini | Codex |
| --------------------------- | -----: | -----: | ----: |
| Intent and completeness     |    9.1 |    9.3 |   9.1 |
| Evidence and repository fit |      9 |    8.6 |   9.1 |
| Technical coherence         |    9.1 |    8.6 |   8.1 |
| Behavior and integrity      |    8.7 |    9.2 |   8.6 |
| Implementability            |    9.1 |    8.8 |     8 |
| Verification quality        |    8.8 |      9 |   8.4 |
| Simplicity and maintenance  |    8.9 |    9.2 |   8.5 |
| Operational reliability     |      9 |    8.5 |   7.8 |
| **Mean**                    | 8.9625 |    8.9 |  8.45 |

**Round 7** — plan v6 (84,971 bytes, SHA-256 `4d67d4afc86551fcf3f6de4662ad8bb5f4b9edd6d678885eb373f6b2768cf10d`). Claude Opus 5.5, xhigh; Gemini 4 Carbon, high; GPT 6.2 Astra, max.

| Dimension                   | Claude | Gemini | Codex |
| --------------------------- | -----: | -----: | ----: |
| Intent and completeness     |    9.1 |    9.3 |   8.9 |
| Evidence and repository fit |      9 |    8.9 |   9.1 |
| Technical coherence         |    9.1 |    8.6 |   7.9 |
| Behavior and integrity      |    8.6 |    8.5 |   7.9 |
| Implementability            |      9 |    8.7 |   7.8 |
| Verification quality        |    8.9 |    9.1 |   8.1 |
| Simplicity and maintenance  |    8.7 |      9 |   8.4 |
| Operational reliability     |      9 |    8.3 |   7.9 |
| **Mean**                    |  8.925 |    8.8 |  8.25 |

**Round 8** — plan v7 (107,978 bytes, SHA-256 `4a7ee31b65949fef0f6fd97242881718ca9b58c942b1511f576c18376893708f`). Claude Opus 5.5, xhigh; Gemini 4 Neon, xhigh; GPT 6.2 Astra, max.

| Dimension                   | Claude | Gemini |  Codex |
| --------------------------- | -----: | -----: | -----: |
| Intent and completeness     |    9.2 |    8.8 |      9 |
| Evidence and repository fit |    8.9 |    8.9 |    9.1 |
| Technical coherence         |      9 |    8.6 |    7.9 |
| Behavior and integrity      |    8.7 |    9.1 |    8.2 |
| Implementability            |      9 |    8.2 |    7.2 |
| Verification quality        |    8.9 |    8.8 |      8 |
| Simplicity and maintenance  |    8.6 |    8.5 |    7.8 |
| Operational reliability     |    8.9 |    7.6 |    7.5 |
| **Mean**                    |    8.9 | 8.5625 | 8.0875 |

From this round the owner replaced Gemini 4 Carbon with the newly released Gemini 4 Neon.

**Round 9** — plan v8 (120,648 bytes, SHA-256 `a48d5a4aa0579d229911af1ba5b87f64ed0098e02208e0e17961c2aef0f3a0ab`). Claude Opus 5.5, xhigh; Gemini 4 Neon, xhigh; GPT 6.2 Astra, max.

| Dimension                   | Claude | Gemini |  Codex |
| --------------------------- | -----: | -----: | -----: |
| Intent and completeness     |      9 |      9 |    9.2 |
| Evidence and repository fit |    8.9 |    8.6 |    9.1 |
| Technical coherence         |    8.9 |    8.4 |    8.1 |
| Behavior and integrity      |    8.5 |      9 |    7.9 |
| Implementability            |    8.8 |    8.1 |    7.6 |
| Verification quality        |    8.9 |    8.6 |    8.4 |
| Simplicity and maintenance  |    8.4 |    8.6 |    8.6 |
| Operational reliability     |      9 |    7.7 |    7.8 |
| **Mean**                    |    8.8 |    8.5 | 8.3375 |

The first Claude attempt hit its subscription's weekly limit and produced nothing; a fresh reviewer on another subscription replaced it. That reviewer stated a mean of 8.8125, but its eight scores sum to 70.4, a mean of 8.8; this record uses the eight scores.

**Round 10** — plan v9 (134,150 bytes, SHA-256 `b4f6732cd2e63af17d9d5dec69f67f01bd3135e27c91aa0dba1906b1f7e5c916`). Claude Opus 5.5, xhigh; Gemini 4 Neon, xhigh; GPT 6.2 Astra, max.

| Dimension                   | Claude | Gemini | Codex |
| --------------------------- | -----: | -----: | ----: |
| Intent and completeness     |      9 |    9.4 |   9.1 |
| Evidence and repository fit |    8.7 |    8.4 |   9.3 |
| Technical coherence         |    8.8 |    8.5 |   8.5 |
| Behavior and integrity      |    8.5 |    8.7 |   8.3 |
| Implementability            |    8.6 |    8.3 |   8.1 |
| Verification quality        |    8.8 |    8.3 |   8.9 |
| Simplicity and maintenance  |    8.3 |    8.9 |   8.8 |
| Operational reliability     |      9 |    7.9 |     8 |
| **Mean**                    | 8.7125 |   8.55 | 8.625 |

The first Codex run was stopped with the coordinator when the coordinator's subscription hit a usage limit, before it reported. A fresh Codex reviewer then reviewed the same frozen plan v9 with the same brief.

## 4. What each round found and how the next plan answered it

Each plan version opened with a table that maps the previous round's findings to their resolutions. Those tables are reproduced here unchanged, oldest first. Reviewer tags: A is Claude, C is Codex, G is Gemini. A later version sometimes replaced an earlier mechanism with a simpler one; section 0 of the next version says so.

### 4.1 Plan v2, answering round 2

<!-- prettier-ignore -->
| Finding (reviewer) | Resolution in v2 |
|---|---|
| M1 contained behavior-changing "safe" fixes and was blame-ignored (A-F1 HG; C-9) | M1 = `require-readable-spacing` + Oxfmt only (the only blame-ignored commit). Every other autofix rule gets its own commit (M2-*), gated by the 7.1 compiler, unit and acceptance tests, never blame-ignored. Rules whose autofix changes runtime or assignability semantics are policy decisions (D6), not mechanical work. E27 showed even "type-only" fixes broke 108 compile sites. §8.3 |
| React hook/compiler rules dropped for `.ts` hooks (A-F2, G-F4, C-5 HG) | React preset split: hook + React Compiler rules on all JS/TS in React-bearing scopes; JSX/a11y rules on `*.{tsx,jsx}`. Positive sentinels for a `.ts` hook-order violation and missing dependency. D7 |
| Commit sequence blocked by incumbent pre-commit (Prettier reverts Oxfmt; Shadscan stale `package.json`) (G-F1, C-2 HG) | New CT-0 single-writer handoff **before** M1: Oxfmt becomes the only formatter in `format`, `format:check`, lint-staged; ledger rebinds ride in the same commit. Proven with a real, non-bypassed commit (E32). Contract: every migration commit passes the hooks in force at that commit. §8.1 |
| Named test/tool configs invisible to TSRS (G-F2, C-3 HG; A-F9) | Directory-rooted `tsconfig.json` files per alias owner (E28: without them TSRS silently runs tests non-strict). Coverage derived from blocking programs' `--listFilesOnly`. TSRS alias sentinel. §5.4 |
| Windows launcher, identity, rollback (G-F3, C-1 HG) | Platform resolution (`tsrs-lint.exe` + `.bunx` target on win32; realpath of the symlink on POSIX); identity chain (shim target → package version → native `--version`) plus process observation; scrub every override first; installed-package check for tsgolint; rollback = reviewed revert + frozen install + identity/parity. D4 |
| Query bridge `-c` resolved from workspace cwd (G-F7, C-6 HG) | `tooling/quality/lint-query.mjs` passes an absolute root-anchored config path, ignores generated output, `--no-inline-config`; proven from a workspace cwd (E30); acceptance runs the real Turbo task in an app and a package. §4.4 |
| Worker cap does not cap backend; no whole-workflow measurement (C-7 HG) | Runner sets `RAYON_NUM_THREADS` and `--threads` together (E31: halves backend peak, identical output); new PF-1 complete-workflow measurement with budgets; parity on a nonzero corpus. §7.4 |
| Generated route and generator coverage (C-4 HG) | Honest current-coverage statement; builds from clean generated state with recorded program membership; Console validator negative; GEN-1 deterministic generator acceptance. §5.2 |
| `no-await-in-loop` left on, sizing excluded it (A-F3, G-F9) | Off under principle A (deliberate sequencing in batch processing, migrations, transactional publication). D6 |
| Anti-evasion gaps: predicates, `void`, `@ts-expect-error`, `Boolean()`, tautologies, native disables, shoehorn (A-F4) | New guards and per-slice exception ledger with ceilings; `ignoreVoid:false`; `ban-ts-comment` ratchet; trivial-predicate rule; no shoehorn. D5, §8.5 |
| P4 shim allowlist incomplete; Vitest resolution not governed (A-F5, G-F9) | Classified alias inventory (2 shims, 9 instance pins); governed P4 addition; whole Vitest resolution config snapshot reviewed by `verify:quality`; repair recipes per mock class. §4.1, §4.7 |
| Test-integrity proof underspecified (A-F6) | Test-ID diff, coverage non-decrease on touched modules, recorded fault patch per redesigned file, independent semantic review per slice; broader pilots. §8.5 |
| E25 sizing used inert overrides (A-F7) | Re-measured with config at repo root (E26, E27); in-scope positive sentinels for Vitest/Next/React-in-`.ts`. §2, VR-4 |
| D6 gaps: barrels, tag-over-role, `react/todo`, strict-boolean claim, nullish (A-F8) | `oxc/no-barrel-file` off (B), `prefer-tag-over-role` off (A), `react/todo` off (annotation mode), accurate strict-boolean statement plus stricter `allowNumber:false` override for money/count modules, `prefer-nullish-coalescing` `ignorePrimitives`. D6 |
| Adaptations re-enabled by preset overrides (E26) | Adaptations applied in the final override layer; a composition test asserts every adaptation is effective. D6 |
| Oxfmt touches TOML, dated evidence, verbatim/minified skill files; skills sync order (G-F5) | `.prettierignore` additions before M1; protected-bytes check; exact skills sequence. D8, §6.2 |
| Hook adapter cwd, nested config, suppression file (G-F6, C-9) | Adapter refuses non-root cwd, prepends local `.bin`, verifies local binaries, refuses if a nested config or suppression file exists. D11 |
| Workspace lint scripts, root aliases, contract tests, CI steps (G-F7) | Specified (§7.1–7.2), including `local-gates.contract.test.ts`, `validate:full`, scoped AGENTS commands, workspace `turbo.json` extends. |
| `shadcn-diff` has no refresh mode and does not run in CI (G-F8) | Add a coordinator-owned `--refresh` mode reusing its own exports; run locally with network; removed the "or run in CI" fallback. D9 |
| Factory Console boundary globs (G-F9) | Restriction scopes cover `apps/*/{app,src/app,components,src/components,features,src/features}`. §4.3 |
| Slice ownership gaps; routing test coupling; VS Code keys (G-F10) | Slice map generated from `git ls-files` with 100% assignment check; WF-5 includes the routing test, `moai-library-shadcn` reference and mirrors; valid VS Code keys. §10, D11 |
| Capability multiset; Principal assertion; TS-1 ownership (C-8) | Exact multiset (two native TS2741, one changed); Principal rejects unexpected diagnostics; TS-1 owns native alias, 16 pins, lockfile and 7.1 repairs. §5.2 |
| W-UI overlaps RS-ui; suppression single writer (C-9) | W-UI runs after CT-1 and after RS slices are integrated; only the coordinator writes the suppression file. §8.4 |
| Directive format; custom rule scope; JS-rename incentive; Zod money pins; patch dead code (A-F10) | `-- P2: SAFETY: …`; `vitest/no-restricted-vi-methods` + smaller custom rule; no new authored JS in TS trees; money behavior pins; dead code removed from the patch. |

### 4.2 Plan v3, answering round 3

#### 0a. Round-3 findings → resolution

<!-- prettier-ignore -->
| Finding (reviewer) | Resolution in v3 |
|---|---|
| Batch gates deadlock: CT-0 breaks `format-gate.contract.test.ts`; Phase 27/28/29 `traceability.json` and the skill audit change under Oxfmt; slices cannot commit lowered Shadcn counts past ESLint "suppressions left"; CT-1 breaks five contract tests (G-F1 HG) | Work is organised into **batches** with a green-gate contract (§8.1). CT-0 becomes an atomic handoff batch: Oxfmt, all formatter consumers ported, projections regenerated, skills re-attested, `format-gate.contract.test.ts` updated, and the staged hook moved from incumbent ESLint to an **Oxlint transition gate** that carries the Shadcn budget as native suppressions (E35: subset prune is safe, so a slice prunes only its own files). Every task that changes a contract updates its tests in the same batch, from a generated contract-test inventory (CTI). §8 |
| Test programs fail to resolve under Bun's isolated store; Base UI fixture cross-app `@/` (G-F2 HG); Vitest resolves `@/` per importer (C-1 HG) | Test `paths` are **generated** from `vitest.config.mts` aliases (single source; parity verified); owner partitions map only their owner's `@/` and owner aliases (`@payload-config`); a multi-owner partition maps no `@/`, so any reachable `@/` is a compile error; the three `@/` imports in `apps/missionary/app/_providers/missionary-layout-shell.tsx` become relative (behavior-neutral; E34); central tests may not import `@/` directly and owner partitions may not import other apps' sources (lint); zero TS2307 in all new programs before INV; typed-rule and Vitest agreement sentinels. §5.4 |
| M2 compiler gate incomplete or red; TS-2 unplaced (C-2 HG; A-F6) | TS-2 (programs resolving) precedes M1/M2; each M2 batch must add no new diagnostic to any program versus a coordinator-owned pre-batch snapshot (green programs fully blocking); typed M2 rules touch only files inside a discovered program; Vitest test IDs identical before/after M1 and each M2; GEN-1 placed. §8.3 |
| Unattended writers apply manual-only fixes (C-3 HG) | One **fix-allowlist** config (generated from rule metadata + review, E36) is the only thing staging, `bun run fix` and the agent hook may write with (Ultracite passthrough `-c`, E33); a full report pass follows; staging/hook controls prove a manual-only violation is reported and bytes stay unchanged; committed M1 diff recomputed. D10, D11 |
| Backend rollback cannot install tsgolint (C-4 HG) | Forward fallback change recipe (FB-1) instead of a revert. D4 |
| Override precedence; React `.ts` rule set incomplete (G-F5, A-F4) | Four-layer order (presets → framework/plugin → global adaptations → narrow scoped overrides last); React rules for non-JSX files derived programmatically (all React-preset rules minus JSX-element, react-perf and jsx-a11y rules); composition test asserts effective settings per layer with sample files. D6, D7 |
| Rules whose usual repair changes semantics (A-F1) | PL-3 classifies every rule with findings (metadata + review): behavior-neutral / behavior-changing / test-first, carried in slice packets; `prefer-number-coercion` off (A); `prefer-number-properties` (isNaN), `no-unnecessary-type-conversion`, `require-array-sort-compare`, `prefer-spread`, `prefer-response-static-json`, `prefer-template` are test-first/manual. §4.2 |
| Money `allowNumber:false` scope misses real directories (A-F2) | Scope generated from a money-module inventory (importers of `@asym/api/money` + donate/donations/giving/public-giving/stripe/admin contribution*/donor-portal/refund/receipt paths + app giving UI); per-directory sentinels; composition test asserts every inventory file matches. D6-E |
| Generic-predicate laundering (A-F3) | Repair order: parse at ingress first; removal allowed with type evidence from a validated source; `core/no-generic-primitive-predicate` bans predicates asserting a primitive keyword, `object` or `Function` outside one owner module; each predicate in a slice has a negative test per claimed property. D5, §4.1 |
| Mock-redesign recipes for Supabase clients; seam constraints (A-F5) | Supabase recipe (transport `fetch` injection asserting tenant filters, or integration tier); seams per call/request only, no module-level setters in server code, no test hooks exported from production, `verify:service-role-clients` unchanged; seam commit first (old tests green), test rewrite second; fault patches remove the protected tenant/auth/money property. §4.7, §8.5 |
| Vendored ReUI data-grid (A-F7) | Classified **vendored** (class V, its README contract): format-only changes allowed, lint rules except design-system/restricted-import contracts excluded for the exact 10 files, ADR-3 and exhaustive-deps exceptions preserved. D6 |
| Import-boundary tiers (A-F8) | Three tiers mapped explicitly with `src/` equivalents; fixtures for permitted server pages and `lib/` coverage. §4.3 |
| Classes for every disable incl. native and legacy `eslint-disable` (A-F9) | Closed classes extended (N1 framework contract, V vendored); every disable in either syntax needs rule + class + reason; legacy directives re-justified or removed by the owning slice; ceiling rule. D5 |
| Validation/Map/flatMap behavior changes (A-F10) | Tolerant ingress schemas tested against recorded real payloads; failure behavior preserved; `Map` only off JSON/DB/RSC/cache boundaries; `flatMap` only without index use. §4.2 |
| ES2023 Intl lib decision (A-F11) | Shared configs add `"ES2023.Intl"` (type-only; runtime already passes decimal strings); `no-array-sort` reason updated (ES2023 Array lib not adopted). D6, §5.2 |
| JS typed policy contradiction (C, G-F3) | All 61 type-aware rules (metadata) and TS-syntax-only rules off in `*.{js,mjs,cjs,jsx}`; JS is lint-context-only; Bun types isolated to the installer's own nested program. D6-F, §5.4 |
| `globalDependencies` busts caches; build policy; Vercel triggers (G-F4) | No new global dependencies; `lint:query` declares its own `inputs`; `ci-build-policy` contract preserved (strict builds run explicitly in TS-1/VR-7/VR-12); Vercel/preview trigger helpers and stale `eslint.config.mjs` entries updated with tests; root `tsconfig.json` classified as tooling-only. §7 |
| Windows lint-staged chunking × incumbent ESLint+health; agent-hook stdin (G-F6) | Staged hook runs only fast Oxlint/Oxfmt from CT-0 (health is not a staged step); hook adapter pipes the buffered payload to the child. D10, D11 |
| Memory meter; integer threads; PF-1 timing; TC-5 cases (C) | Live process-tree sampling (sum of current working sets per tick; Linux cgroup peak); integer thread budget; PF-1 rehearsal before CT-1; TC-5 case list. §7.4 |
| Generated code proof details (C) | Forced uncached builds; Admin compiled with generated Payload types present; currency generator fixed input/expected bytes; docs executable fixtures classified. §5.2 |
| Smaller items (A-F12, G) | Sentinels for the five Oxlint-hosted Query rules; eleven Vitest pins; a sentinel per adaptation (generated); coverage: a missing module counts as 0%; new-JS guard on all owned scopes + rejection of TS→JS renames; reasons for `allowNullable*`; `require-mock-type-parameters` under principle C; Playwright `--list` diff for e2e slices; `skill-inventory-audit` expectedNames in WF-5. |

#### 0b. Round-2 resolutions retained

M1 = spacing + Oxfmt only (blame-ignored), per-rule gated M2 batches; React hook
rules on `.ts`; single-writer formatter handoff before mechanical work;
directory-rooted programs (E28); per-platform TSRS binding and identity chain
(E29); root-anchored Query bridge config (E30); `RAYON_NUM_THREADS` cap (E31);
GEN-1; `no-await-in-loop` off; anti-evasion guards; P4 governance; slice
test-integrity proof; `.prettierignore` additions; hook refusals; workspace
scripts and CI steps; `shadcn-diff --refresh`; slice map; capability multiset;
W-UI after CT-1.

### 4.3 Plan v4, answering round 4

#### 0a. Round-4 findings → resolution

<!-- prettier-ignore -->
| Finding (reviewer) | Resolution in v4 |
|---|---|
| Staged/narrow `--fix` prunes the live Shadcn ledger (any `--fix` loads `cwd/oxlint-suppressions.json` in prune mode); path-scoped calls exit 1 on all-ignored input; `--no-stash` keeps hide-partially-staged (C HG1, G F1 HG) | **No lint writer in the commit path.** The staged hook formats and reports only (E42: a check without `--fix` never writes the ledger). Every fixer (`bun run fix`, M1, M2, agent hook) runs through `tooling/quality/fix.mts`, which spawns Oxlint from a private temporary cwd with absolute config and targets (E37). The ledger is written only by `lint:prune` (owned files, producing policy, decrease-only, E35). Every path-scoped Oxlint call passes `--no-error-on-unmatched-pattern --disable-nested-config`; report calls add `--deny-warnings`. The incumbent `--no-stash --no-hide-partially-staged` flags stay. D10, D12 |
| Hook-applied fixes break M1 reproduction and one-rule M2 batches (C HG2) | The commit hook applies no lint fixes. Its Oxfmt step is idempotent on M1/M2 output, because both end at the Oxfmt fixed point. The coordinator is the only writer in A7–A8; no slice runs and the agent hook is inactive until WF-2. The fix allowlist is an upper bound; each M2 batch uses one rule. A hooked-commit rehearsal on M1-touched and M2-reverted files is part of VR-9. §8.3 |
| Test-program resolution: runtime pins ≠ declaration types; a Donor test outside the Donor partition; in-partition cross-owner files; `sync-test-paths` misses `vitest.pin-workspace-packages.mts`; root devDependencies would expose GraphQL 16/17 and TanStack identity; e2e lacks Node types (C HG3, G F2 HG) | Rebuilt on E40/E41. Ownership is the transitive `@/` closure: zero files need two owners, and two files sit outside their owner's directory. Programs are directory-rooted, plus one for `tests/unit/acceptance/issue-2364` (Donor). Workspace-only packages, and workspace packages not linked at the root, get exact-specifier `paths` to the declaration file that the declaring workspace's own compiler resolves. That gives real types and one identity (E41), with **no root devDependencies** (rejected). A generated check asserts ownership against the program mapping and asserts that each Vitest pin and its type path share one package root. Each mapped package gets a valid/invalid sentinel. The "imports another app" lint ban is dropped (wrong rule, E40); the direct-`@/` ban in central tests stays. `tests/e2e` adds Node types. §5.4 |
| Batch contract demands green typecheck while admitting red programs (C HG4, A F10) | Program registry with **blocking** and **ratchet** modes. A ratchet program is compared on a line-shift-proof key multiset (program, file, code, normalized message) and on program membership. Updates are decrease-only and limited to owned files. A program that reaches zero flips to blocking in the same commit, and every remaining ratchet program flips at the named cutover **CT-T** (in C2). §5.5, §8.1 |
| TC-5 after the first typed fix (C) | TC-5 moves to **A6b**: corpus frozen at the A6 commit, before any typed fix (the first is the M2 `no-unnecessary-type-assertion` batch); fix patches are compared. §8.2 |
| FB-1 not a replacement; `tsgolint --version` unsupported; compiler rollback as a revert (C) | FB-1 is one replacement transaction (remove `tsrs`, add tsgolint, regenerate the lock, flip the exclusion check). Identity comes from the platform package version, the lockfile integrity, the recorded binary digest, the observed child process and sentinels. The compiler rollback is a narrow forward change that keeps fixtures, `ES2023.Intl` and repairs, and RB-1 dry-runs it in A2. D4, §11 |
| Oxfmt preset enables `sortImports`/`sortTailwindcss`; there is no `extends`; `**/*.generated.*` is ignored; GEN-1 legs can hit cache (C, G F3) | `oxfmt.config.mts` spreads the preset and sets both to `false`, with sentinels (E44). The shared ignores are kept: generated and vendored dist files are not formatted (E43), so the currency generator formats its own output (GEN-1b). The GEN-1 compile legs call the native compiler directly (no Turbo); legs that need unavailable services run in CI. D8, §5.2 |
| Fix-allowlist derivation is wrong four ways: spacing missing, suggestion-only fixes inert, scoping lost, no fixed point (A F2, G F3) | The fix policy is **derived from `layers.mts` by filtering severities**, so it inherits ignores, overrides, V-class and JS carve-outs. It keeps untyped rules whose metadata fix kind is `fixable_fix`/`conditional_fix`, intersected with the reviewed list, plus `anti-slop/require-readable-spacing` explicitly. Vitest rules apply only inside Vitest globs. Suggestion-kind and typed rules run only as M2 batches (`--fix-suggestions` / typed). `fix.mts` loops to a bounded fixed point. A subset composition test covers every sample scope. D10 |
| Skill, editor and plain `--fix` bypass the allowlist (A F1) | Direct `oxlint --fix` and `ultracite fix` are documented as unsupported in Core. The canonical Ultracite skill and the AGENTS route say `bun run fix`. `.vscode/settings.json` sets `source.fixAll.oxc: "never"`. Negative controls show `prefer-template` and `prefer-spread` sites unchanged under every documented writer. D11 |
| `non-nullable-type-assertion-style` conflicts with `no-non-null-assertion`; type-import style (G F3, A F11) | `non-nullable-type-assertion-style` off (conflict; its 62 sites are repaired by real narrowing). Type imports keep the preset (`prefer-top-level`, Core's majority, E38). That M2 batch must keep each file's emitted runtime imports identical (checked), and both rules stay out of the unattended allowlist. D6, §8.3 |
| One predicate owner in `@asym/lib` creates dependency cycles; the rule hits union narrowing; owners launder `typeof` (A F3) | One registered owner module **per workspace** (E43 graph). The rule fires only for predicates whose parameter is `unknown`/`any`/`{}`/`object`/an unconstrained type parameter. Primitive-keyword guards are banned even in owners. Owners export structural guards only, and slice ledgers count their call sites. D5 |
| SAFETY comments sit outside the exception contract (A F4) | Every `SAFETY:` marker needs a class tag (`P2`/`P3`) and covers exactly one assertion. Markers are counted in the ledger and ceiling, and boilerplate and duplicate reasons are rejected. `typescript/no-unnecessary-type-parameters` is on. D5 |
| Supabase recipe not executable under the seam rules; `vitest` alias evasion (A F5) | Global transport recipe: `vi.stubGlobal("fetch", recorder)` (supabase-js resolves `fetch` at call time) asserts PostgREST URLs and bodies, including tenant filters, with no production change. Client or transport parameters on tenant/auth-scoped functions are forbidden. 121 sites. The Supabase pilot runs first. `import { vitest }` evasion is in the fixtures. §4.7 |
| Money scope misses real money code; coverage check is circular (A F6) | The inventory comes from money identifiers and columns, with reviewed exclusions, not from paths. Each area has a sentinel. The `$0` gift defect (`detail-drawer.tsx:496`) gets a test-first fix. D6-E |
| ReUI miscounted; "all off" weakens today's checks (A F7, G F6) | 9 files imported from `reuiDataGridFiles`. The parity rules stay on (today's `exhaustive-deps` exception kept); only new-policy rules are off; the README procedure is updated. D6-V |
| Object-construction repairs can reorder hashed keys; `Map` in query keys (A F8) | GH-1: inventory hash/fingerprint/query-key sites and add golden-hash tests before Phase B. `Map`/`Set` are banned in query keys and in values that are hashed or stringified. §4.2 |
| No sanctioned fire-and-forget form; silent catches (A F9) | One owner, `runDetached(promise, context)`, in `@asym/lib/monitoring` (reports to Sentry). Layers below `lib` must await or return. Core rule `core/no-silent-catch`; ledger counts. D5 |
| `--affected` ignores task inputs; `lint` cached; `lint:ui` dropped (G F4) | CI and `check:changed` run the full bridge when `tooling/quality/**` (or another root lint input) changes, otherwise `--affected`. `lint` and `lint:query` are `cache:false`. `lint:ui` is kept. §7 |
| Agent hook: non-JS/ignored/moved files exit 2; stdout leak; relative command fails in subdirectory sessions (G F5) | Root-anchored bootstrap (`$CLAUDE_PROJECT_DIR`; `git rev-parse --show-toplevel` with Codex `commandWindows`, E43). The adapter filters post-move, existing, repo-contained JS/TS paths (empty → exit 0) and calls `fix.mts` directly. Ultracite's `fix --hook` runner is dropped. Child output is captured and stdout stays empty. D11 |
| Ledger tools unplaced; duplicate motion imports; C1 gate vague; `packages/**` tier; CTI scope (G F6) | SR-1 (`shadscan-rebind`) and SD-1 (`shadcn-diff --refresh`) are first in A1, with named checkpoints. CT-0 merges the two duplicate `@asym/lib/motion` imports. C1 gate spelled out. A packages tier is added and Console is added to the cross-app patterns. CTI covers all tracked non-archive files. §4.3, §8 |
| Skill audit record; JSX-element exclusions (G F7) | WF-5 seeds the schema-1 `ultracite` record before hashing. `layers.mts` gets the exact `JSX_ELEMENT_RULES` constant. D7, §10 |
| Smaller (A F11) | Money cast becomes a single `` as `${number}` `` (P2). M2 runs the Playwright `--list` diff. PL-3 records anti-slop #65/#66/#71 and PR #61 dispositions. New tooling is `.mts` (E44). |

#### 0b. Earlier resolutions retained

These carry over from v2/v3:

- Batches with a green-gate contract and a contract-test inventory (CTI).
- M1 = spacing + Oxfmt only (blame-ignored); per-rule gated M2 batches.
- Single-writer formatter handoff at CT-0 (E32).
- Directory-rooted programs (E28); per-platform TSRS binding and identity chain (E29); root-anchored Query bridge config (E30); `RAYON_NUM_THREADS` cap (E31).
- Four-layer composition with an effective-setting test; React hook rules on `.ts`; `no-await-in-loop` off; repair classification (PL-3).
- Closed exception classes for both directive syntaxes; anti-evasion rules; P4 governance; seam constraints; slice test-integrity proof.
- `.prettierignore` additions and protected-bytes test; tooling-only classification of `tooling/quality/**`.
- `ES2023.Intl`; JS typed-off; memory meter and PF-1; GEN-1; Shadcn retired by W-UI after CT-1.

### 4.4 Plan v5, answering round 5

#### 0a. Round-5 findings → resolution

<!-- prettier-ignore -->
| Finding (reviewer) | Resolution in v5 |
|---|---|
| `-c` configs under `tooling/quality/` make root-relative overrides and ignores inert; `extends` does not carry `env`/`ignorePatterns` (C HG1, G F1 HG) | Every Oxlint entry config lives at the **repository root**: `oxlint.config.mts` (full policy), `oxlint.transition.config.mts` (A5–C2), `oxlint.fix.config.mts` (policy chosen by `CORE_FIX_POLICY`, set only by `fix.mts`; it throws otherwise, E47). Each spreads `env` and `ignorePatterns` explicitly, as Ultracite documents. `tooling/quality/` holds fragments only. `lint.mts` refuses a `-c` path outside the root. Each command's actual entry config is exercised on scoped fixtures with a positive and a clean case. D2, VR-4 |
| Staged report reads the working-tree ledger; Oxfmt rewrites the ledger (C HG2) | `staged-guard.mts` refuses a commit when the ledger or ratchet file differs between index and working tree, so the report reads exactly the staged ledger. `oxlint-suppressions.json` is excluded from Oxfmt. Real-hook cases: unstaged prune, staged prune, formatter run on the ledger. D10 |
| `@payload-config` reaches six CMS tests; unexported database subpath; relative `react-dom/client`; non-portable generated paths; wrong positive control (C HG3, G F5 HG) | Alias needs are tracked by (specifier, target) for `@/` and every exact alias (E45). The two imports are repaired in TS-2. Paths are emitted POSIX-relative through `<declaring workspace>/node_modules/<pkg>/…`, with realpath identity asserted. Sentinels assert an exact diagnostic multiset with corrected positive controls. §5.4 |
| Pruner bound to a policy retired at CT-1; `lint:ui` loses its six-workspace default and `--raw`; CI ledger check needs a per-revision comparison (C HG4) | `prune.mts` uses the policy in force (transition, then full). `lint:ui` keeps its six-workspace default and a read-only `--raw` view. In CI, `verify:quality` compares the ledger with the merge base: no (file, rule) count may rise. D12 |
| M1 replay cannot reproduce proof rebinds; two type-import rules in one batch (C HG5) | Two comparisons: replayed source blobs, then the proof generators run against the replay versus the committed records. Each type-import rule gets its own batch. §8.3 |
| Gates before their prerequisites: Oxfmt not installed for A4; whole-repo `format:check` at A5; `.mjs` adapter (C HG6) | Oxfmt is pinned (inactive) in A1. CT-0 includes the initial whole-repo Oxfmt normalization, with proof refreshes and pin amendments. The adapter becomes `scripts/lib/format-source.mts`; the scripts program covers `scripts/**/*.{ts,mts}`. §8.2 |
| Strict-build wrapper drops `--force` (C HG7) | `ci-build.mjs` gains a `--force` passthrough to both Turbo calls (unit tests assert the arguments). The run summary records a cache miss for every build task. §5.2 |
| Hash pins: `shadcn-diff` has five hash sets (two networked); React Doctor ledger; acceptance byte pins and workflow fingerprints (G F2 HG) | D9 covers five record families. SD-1 is split into `--refresh-local` and a reviewed, networked `--refresh-diffs`. React Doctor is ungated and already 182/254 stale on develop (E48); RDL-1 keeps every record that was valid at base valid, and RDX-1 checks raw findings for regressions. AP-1 scans content pins and amends them per Core's convention (E48) with an executed reproduction proof; checks are never deleted. |
| `@shadcn/lint` unresolvable from root; ESLint retirement split between CT-0 and CT-1 (G F3 HG) | Root devDependency with the patch moved (TC-1/TC-6). **All** general ESLint machinery and its coupled contract tests retire together in CT-0; CT-1 only flips Oxlint to the full policy, deletes the transition config, and runs CT-T. §8.2 |
| Claude hook breaks in PowerShell and session worktrees; relative patch paths (G F4 HG) | Claude exec form with `${CLAUDE_PROJECT_DIR}`. The adapter reads `payload.cwd`, resolves the active checkout with `git -C <cwd> rev-parse --show-toplevel`, and re-dispatches to that checkout's adapter. Relative paths resolve against `payload.cwd`. D11 |
| CI events and tooling-only classification (G F6) | Full scope whenever `github.event_name != 'pull_request'` or the base SHA is absent. Test, script and root lint configs are tooling-only in the three CI helpers. §7.2 |
| FB-1 launcher chain; `importMap.js` header; dead patch helpers (G F7) | Corrected launcher chain. The generated `importMap.js` is a root lint ignore, and its producer drops the ESLint header. TC-2 strips the two dead helpers. |
| `no-silent-catch` hits synchronous fallbacks (A F1) | Scoped to promise rejection handlers whose result is discarded; synchronous `catch` stays under `no-empty`. Fixtures for allowed and banned forms. D5 |
| Supabase recipe: env read at import, privilege unasserted, not fail-closed (A F2) | Env set before import. The recorder asserts `apikey`/`Authorization` privilege. A deny-all `fetch` in unit setup, with `unstubGlobals`. Client privilege is added to the fault patches. §4.7 |
| SAFETY enumeration vs. rule attachment; grammar clash (A F3) | The rule's native `markers` option takes the tagged forms. A single combined directive covers narrowing casts. Markers are enumerated by regex, and `core/one-assertion-per-safety-marker` limits each marker to one assertion. D5 |
| Predicate rule blind to unannotated or aliased parameters; non-workspace owners (A F4) | Predicate parameters must be annotated; same-file aliases are resolved and imported aliases treated as unknown. Owners are registered for `tests/`, `scripts/` and `tooling/quality/`. D5 |
| Mock-evasion gaps; `no-restricted-vi-methods` described backwards (A F5) | The core rule covers all files and bans non-call value use of `vi`/`vitest`. Explicit deny list. D5 |
| Runners accept writer flags (A F6) | `lint.mts` exits 2 on `--fix*`, `--suppress-all` and `--prune-suppressions`. Design-system-lint docs are updated in CT-0. D3 |
| Golden tests start after parsing (A F7) | Golden tests start from raw input (extra and permuted keys) through the parser to the hash. Zod stripping and transforms are in the key-order rule. The Resend dedupe id is named; 16 files. §4.2 |
| Repair list misses large behavior-changing rules (A F8) | Added: `no-non-null-assertion` (repairs keep the failure), `prefer-type-error`, `prefer-query-selector`, `prefer-structured-clone`, `switch-exhaustiveness-check`, `prefer-dom-node-text-content`. §4.2 |
| `runDetached` doesn't reach every workspace (A F9) | Per-workspace registry with hook and script patterns. D5 |
| Coverage criterion gameable (A F10) | Coverage-ignore comments come under the directive contract; `test.coverage` goes into the resolution snapshot. D5 |
| Ratchet misses equal-count replacement; poison program; TSRS banner; FB-1 order; RB-1 at the end; WF-7 sessions (C, important) | A site comparison is added for M2 and slices, with a negative control. The capability poison program is harness-verified, not a registry program. The version banner is parsed by component. FB-1 edits both declarations before one lock regeneration and keys digests by platform. RB-1 is repeated at C5. WF-7 observes native and T3 sessions separately. §5.5, D4, §8 |
| Smaller (A F11) | `no-unnecessary-type-parameters` is already in the preset, so it is not an addition. The money inventory also scans formatter calls and Stripe amount fields. |

#### 0b. Retained from earlier rounds

The design that the earlier rounds reviewed is kept:

- staging that formats and reports only, never fixes;
- private-cwd fixing (E37) and owned-file pruning (E35, E42);
- the derived fix policy;
- transitive test ownership (E40) and owner-resolved declaration paths (E41), with no root devDependencies for tests;
- blocking/ratchet program modes;
- TC-5 before typed fixes; FB-1 as a replacement transaction; RB-1;
- explicit Oxfmt sorting off (E44);
- per-workspace predicate owners; the SAFETY governance; `runDetached`;
- identifier-derived money scope; golden hashes; ReUI with parity rules;
- the Turbo trigger; the packages tier; SR-1/SD-1;
- plus the earlier batches, CTI, M1/M2, directory-rooted programs, the TSRS binding, the root-anchored Query bridge, `RAYON_NUM_THREADS`, JS typed-off, `ES2023.Intl`, PF-1 and GEN-1.

### 4.5 Plan v6, answering round 6

#### 0a. Round-6 findings → resolution

<!-- prettier-ignore -->
| Finding (reviewer) | Resolution in v6 |
|---|---|
| Config-level unused-directive reporting makes untyped runs fail on `SAFETY: P3` directives (G F1 HG) | The root configs never set `typeAware` or `reportUnusedDisableDirectives`. Only typed runs (`lint:ox`, `lint:new`) pass `--type-aware --report-unused-disable-directives-severity=error`. Untyped runs pass neither. A VR-4/VR-9 control covers both cases. D3 |
| Tracked-only filter drops new files (G F2 HG, A F6, C) | Explicit paths are accepted whether tracked or untracked: existing regular files under the root realpath that are not ignored (`git check-ignore` plus `coreRepoIgnores`). `git ls-files` is used only to enumerate batches. Ignored paths are reported on stderr. VR-10 adds untracked `Write`/`Add File` cases. D10 |
| M1 replay vs pin-bearing files; network records (C HG1) | M1 reproduction gets a defined intermediate chain: mechanical replay → a reviewed exact amendment list → local record generators → network records reproduced from the recorded registry responses → tree equality. A negative control edits an unrelated assertion. §8.3 |
| Windows argument limit; typed fix inactive without `--type-aware` (C HG2) | Explicit path lists are chunked deterministically by encoded command length (≤ 24,000 characters on Windows); replay uses the same chunking. Whole-scope runs pass directory roots. The typed M2 batch passes `--type-aware`. It must first produce a nonempty patch at a known site (`packages/api/src/admin/comments/comment.ts:21,88`) before the cwd comparison. D10, §8.3 |
| No substantive amendment procedure for registry-owned UI files (C HG3) | SD-1 gains `--amend`. It records the upstream and local diff change, updates `reason`/`proofs`, and requires linked behavior or rendered evidence before the diff and preview hashes are refreshed. Phase B and W-UI use it. The mechanical procedure stays for CT-0, M1 and M2. D9 |
| Site key collides on same-declaration swaps (C HG4) | Sites are matched through the source diff. A diagnostic in an unchanged region must match a diagnostic at the mapped range. A diagnostic inside an edited hunk counts as new: it fails M2 and needs review in a slice. There is a branch-swap control, and Phase B units are explicit. §5.5 |
| CT-0 ledger bootstrap; check activation schedule; prune file list (C HG5) | `ledger-bootstrap.json` compares the native ledger with the incumbent ESLint ledger at the frozen base, plus reviewed parity differences. Later revisions compare with their predecessor. Retirement is recorded, so reintroduction fails. An activation table schedules each `verify:quality` check by batch. `prune.mts` passes the validated file list. Tests cover creation, reduction, regrowth, retirement and reintroduction. D12, §7.1 |
| Linux backend identity (C HG6) | The expected executable is resolved through each pinned launcher's own platform logic (TSRS appends the libc suffix). Canonical paths are compared, with an Ubuntu observed-child control in CI. D4 |
| Strict builds: no Turbo on win32; `--summarize`; stale `.tsbuildinfo` (G F3 HG, C) | Per-platform qualification. Ubuntu (CI or WSL) is authoritative: `ci-build.mjs` forwards `--force --summarize`, and every build task must show a cache miss. Win32 deletes `**/*.tsbuildinfo`, `apps/*/.next` and `packages/*/dist`, then runs the direct builds with recorded logs. Unit tests cover both branches. §5.2 |
| Non-hex acceptance pins (`git show` merge-base equality, `BASE_CI_BYTES`); acceptance not in A5/A7 gates (G F4 HG) | AP-1 now inventories hex literals, workflow fingerprints, git-history equality assertions and byte-length/slice constants in `tests/**` and `scripts/**`. Named amendments cover `issue-2364:187` and `issue-2221` `BASE_CI_BYTES`. `test:acceptance` is in every batch gate. D9 |
| `vi.spyOn(namespace)` allowed again (A F1) | `core/no-module-mock-evasion` reports `vi.spyOn(x, …)` when `x` is a namespace import, a default module import or a `require`/`import()` result. Type positions are exempt. The deny-listed `vi` methods are banned in all files. D5 |
| Deny-all `fetch` fails open under `unstubGlobals` (A F2) | The deny-all is installed with `Object.defineProperty` in setup, so unstubbing restores it, and is re-asserted in a setup `beforeEach`. Recorders go only in `beforeEach` or a test body. The 18 module-level and `beforeAll` stubs migrate. VR-13 adds a non-first-test assertion and a zero-connection listener. §4.7 |
| Server-side Stripe has no recipe (A F3) | Loopback recipe. `createStripeClient` honours a validated, test-only `STRIPE_API_BASE_URL` (loopback HTTP only, refused unless `NODE_ENV=test`) through stripe-node's `host`/`port`/`protocol`. A loopback recorder asserts the secret key, `Stripe-Account` and `Idempotency-Key`. A wrong-tenant fault patch is added, and unit tests deny non-loopback `net` connections. §4.7 |
| Comment-only `catch` around `await` (A F4) | `core/no-silent-catch` also covers `try` blocks that await, when the catch is empty, comment-only or returns a literal. The new class **R** (recovery boundary, with a fallback-path test) applies and is counted. D5 |
| Rebinds outside M1 without reproduction proof or record (A F5) | Mechanical rebinds require transform-reproduction proof. A semantic rebind requires a per-entry note. `verify:quality` rejects any hash change without one or the other. AP-1 also scans `scripts/**`. D9 |
| Imported-alias predicates flagged (A F7) | The syntactic rule covers keyword and same-file cases. Imported aliases are resolved by a typed check in `verify:quality` (classic checker). There is an allowed control for imported discriminated unions. D5 |
| Money scope can shrink; rule unnamed (A F8) | Named: `typescript/strict-boolean-expressions` `allowNumber:false`. `money-scope.json` cannot lose files against the merge base without a reviewed exclusion. D6 |
| `.mts` programs; `ES2023.Intl` overridden by child `lib` arrays; `tests/tsconfig.json` excludes (G F5) | `.mts` programs set `allowImportingTsExtensions`, `noEmit` and include `**/*.mts`. `ES2023.Intl` goes into all five presets and the three local overrides. `tests/tsconfig.json` excludes the child programs (generated). Test programs use `allowJs:true, checkJs:false` for imported `.mjs` helpers (C). §5.2, §5.4 |
| RDL-1 misses `endLine`/`fingerprint`; fixed findings (G F6) | RDL-1 rewrites every identity field. A base-valid record whose diagnostic a verified repair eliminated is pruned, with evidence. D9 |
| SD-1 path roots; rebind ordering; local generated ignores (G F7) | SD-1 normalizes repo-relative inputs across all four path roots, including split components and owners. Rebinds are the last step of every batch. `coreRepoIgnores` adds local generated paths. D2, D9 |
| Cursor imports `.claude/settings.json` hooks; concurrency; `GIT_*`; Codex worktree guard; lint-staged glob (G F8) | One shell-form command works in PowerShell and bash (E49). The adapter accepts `file_path ?? path`. A per-checkout lock and `repositoryGitEnvironment` are added; Codex gets a file-exists guard. lint-staged uses `"*"` with `--disable-nested-config`. D10, D11 |
| `skill-inventory-audit` expectedNames; `integrate-design-system-lint` tasks (G F9) | WF-5 updates both. OS-1 and C5 reconcile tasks 5.4–5.10. §10 |
| Negative sentinels via `@ts-expect-error`; staged policy inputs; RB-1 at C5; zero-finding rules (C) | Sentinels are compiled unsuppressed with an exact (file, line, code) list. `staged-guard` also refuses unstaged policy inputs. RB-1 at C5 passes the registry and proof checks. Each zero-finding anti-slop rule has a sentinel. §5.4, D10, §11 |
| Minor (A F9) | `object-shorthand` `ignoreConstructors:true`. Encoding-rule pre-check. Integration-tier moves update `ci-integration.yml`. `mock-data` in the detached registry. Count of `?.`/`??` introduced at former `!` sites. |

#### 0b. Retained from earlier rounds

These carry over from earlier rounds:

- **Configs:** root entry configs (E47); `.mts` configs; explicit Oxfmt sorting off.
- **Staging and fixing:**
  - format-and-report staging;
  - private-cwd fixing (E37) and owned-file prune (E35, E42);
  - the derived fix policy.
- **TypeScript programs:**
  - transitive test ownership with (specifier, target) alias needs (E40, E45);
  - owner-resolved portable declaration paths (E41);
  - blocking/ratchet program modes;
  - TC-5 before typed fixes; FB-1 as a replacement transaction; RB-1.
- **Records and cutovers:** five hash-bound record families; one ESLint retirement in CT-0.
- **Mocks and integrity:**
  - the global-transport Supabase recipe, with privilege recording;
  - SAFETY `markers`;
  - per-scope predicate and detached-work owners;
  - golden hashes from raw input;
  - ReUI with the parity rules.
- **CI and checks:** event-aware CI; the CTI.
- **Mechanical batches:** M1/M2.
- **Backend and resources:** TSRS binding; root-anchored Query bridge; `RAYON_NUM_THREADS`.
- **Remaining:** JS typed-off; PF-1; GEN-1.

### 4.6 Plan v7, answering round 7

#### 0a. Round-7 findings → resolution

<!-- prettier-ignore -->
| Finding (reviewer) | Resolution in v7 |
|---|---|
| Stripe test endpoint guard lives only in env validation, which `SKIP_ENV_VALIDATION` skips; the env snapshot also freezes per-test ports; Core never sends `Stripe-Account` (A F1, C HG1, G F4 HG) | `createStripeClient` validates `process.env.STRIPE_API_BASE_URL` **at call time**, independent of env validation: `NODE_ENV === "test"`, not a protected deployment, `http:`, host `127.0.0.1`/`localhost`, explicit port, path `/`, no credentials, query or hash; anything else throws. `@asym/env` adds an unconditional top-level refusal outside `NODE_ENV=test`. The recorder asserts the tenant's own key, Core's pinned API version, `Idempotency-Key` and the **absence** of `Stripe-Account`, through the real resolver with two synthetic tenants. §4.7 (E51) |
| `oxlint --prune-suppressions <file>` also drops entries of unnamed deleted paths; a merge-base predecessor allows 2→1→2 (C HG2) | `prune.mts` snapshots the ledger, refuses missing out-of-packet paths before running, restores the original bytes on any out-of-scope change, and holds the per-checkout writer lock. Deletions and renames go through `lint:prune --owner coordinator --removed`. CI checks **every commit in the range against its parent**, with a 2→1→2 control. D10, D12 (E54) |
| Brace `include` finds no inputs; Next `validator.ts` is outside the app programs; ratchet members include `node_modules` (C HG3) | Two literal patterns (`**/*.ts`, `**/*.mts`); TS18003 and configuration errors are fatal. Product apps add `.next/types/**/*.ts` and run pinned `next typegen` before `tsc`; validator membership is asserted. Ratchet members are repo-relative authored files only. Factory Console has its own strict build. §5.2, §5.4, §5.5 (E52, E55) |
| M1 replay omits React Doctor rebinds and suppression reduction (C HG4) | The batch and its replay run one shared ordered record pipeline (`record-steps.mts`): prune, SR-1, SD-1 local, RDL-1, AP-1 proofs, then SD-1 `--replay` of the recorded registry responses. A surviving hash-bound React Doctor record is a positive control. The blame-ignore entry lands in a follow-up commit. §8.3 |
| The combined `SAFETY: P3` directive is "unused" under the typed transition entry; legacy unclassed directives vs the A3 contract (C HG5) | Unused-directive errors run only against the full policy, which owns every rule: `lint:new` during A5–C2 and `lint:ox` from CT-1. A valid P3 fixture passes both typed entries; an unused full-policy directive fails. The 267 base directives (E56) seed a shrink-only `legacy-directives.json`, retired at C2. D3, D5 |
| Windows Codex wrapper turns exit 2 into 1 (C HG6, G F5 HG) | `exit $LASTEXITCODE`, `Test-Path -LiteralPath`, and exit 0 when git or the adapter is absent. VR-10 runs the **registered** command strings. D11 (E53) |
| Cursor runs the `.claude/settings.json` command with argument `claude`, so a Cursor-only `path` fallback never applies (G F5 HG) | One path rule for every non-`apply_patch` payload: `file_path ?? filePath ?? path`. VR-10 sends a Cursor `{ path }` payload through the exact registered `claude` command. D11 |
| Oxlint does not read `.prettierignore`: skill mirrors, upstream-pinned skill code and founder assets are exposed to batch fixes (G F1 HG) | `coreRepoIgnores` adds `.agents/**`, `.claude/**`, `.cursor/**`, `docs/**` (except the owned `docs/prds/**/tools/*.mjs`), `.next-docs/**` and `tests/fixtures/skills/**`. `.oss-scanner/smoke.mjs` and the PRD tools are owned. A negative control proves batch fix and root `oxlint` leave the protected trees byte-identical. D2 |
| Rebind notes allowed only in Phase B/W-UI; CT-0 mixes semantic edits into a blame-ignored commit (G F2 HG) | Notes are allowed in **any** non-mechanical batch; workflow pins use put-back proofs. CT-0 splits into **CT-0a** (semantic cutover) and **CT-0b** (pure normalization); only CT-0b is blame-ignored. RB-1 covers all six Shadscan-cited manifests. D9, §8.2 |
| Untyped config-entry selection unspecified for A5–C2 (G F3 HG) | A per-command table: the staged report and `check:changed` use the **active gate entry**; `lint:fast`, the agent hook and explicit-path `fix` report the full policy; batch `fix` skips its report and relies on the post-batch whole-repo gate. D3 |
| Network block: refusals swallowed by product catches; uncounted replacement forms; loopback-wide socket allowance; env leaks (A F2) | Each refused attempt is recorded, and a setup `afterEach` fails the test unless it was declared (`expectDeniedNetwork()`). The inventory covers `stubGlobal`, `spyOn(globalThis, "fetch")` and direct assignment. Sockets allow only registered recorder ports. Core sets `unstubGlobals` and `unstubEnvs`. §4.7 |
| `await p.catch(() => null)` evades class R (A F3) | `core/no-silent-catch` judges the handler in any position; reporting handlers and typed failure results are exempt. try→`.catch` rewrites are counted. D5 |
| No tenant/auth inventory (A F4) | **TA-1**: a content-derived, no-shrink inventory. Edits to an inventoried function carry a fault patch and its failing output. §4.2, §8.5 |
| No objective test-loss rule (A F5) | Removed or renamed test IDs map to a successor or a reviewed deletion note; per-file negative-assertion counts may not fall without a note; coverage is per-file branch coverage. §8.5 |
| The ceiling mixes SAFETY markers with exceptions (A F6) | Disables and class R share a 2% budget; SAFETY markers are governed by their content contract and a per-slice list. `core/no-cast-helper` catches cast-hiding helpers. D5 |
| Exception classes promise tests without links (A F7) | P3, R and T1 carry `[test: <file>#<name>]`, resolved against `vitest list --json`. D5 |
| `typeof x === "function"` updater checks have no allowed repair (A F8) | Named repairs: TanStack `functionalUpdate` through the Table owner, an owned `isUpdaterFunction`, or N1. `core/no-trivial-type-predicate` is specified with fixtures. D5 |
| Money workarounds only counted; the `$0` fix changes the UI (A F9) | A typed check rejects `Boolean()`/`!!` on number or bigint in money-scope files. The `detail-drawer.tsx:496` repair preserves today's output exactly; showing `$0` becomes a product follow-up. D6 |
| TanStack evaluation is one sentence; React Compiler gap rules (A F10) | §4.4 has a row per library with lint coverage, suites and a slice gate. `react-hooks/config` and `react-hooks/gating` join the PL-0 gap list. |
| Provenance edge cases (A F11) | The two verbatim skill assets are named; skill-audit hashes fall under proof-or-note; CT-0a carries notes for proof-cited files. D8, D9 |
| `runDetached` does not exist (A F12) | **RD-2** creates it with a contract and tests before any conversion. D5 |
| The Query bridge does not reach central tests (C) | `lint:query` adds a central-test invocation over the TS-2 programs, with imported-void and typed-wrapper fixtures. §4.4 |
| Agent-hook re-dispatch, stale lock, duplicate Cursor hooks (G F6) | Absent target script → exit 0; captured stdin passed on; lock under `git -C <activeRoot>` with PID/age recovery and a bounded wait; `verify:quality` rejects an overlapping `.cursor/hooks.json`. D11 |
| `lint-staged` glob; `GIT_INDEX_FILE`; untracked and `package.json` policy inputs (G F7) | Key `*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`; `staged-guard` keeps the hook's inherited Git environment and guards root `package.json` and untracked `tooling/quality/**`. D10 |
| Strict-build flags unscoped; four invocations; `eve-runtime` `lib` (G F8) | `--force --summarize` only with `--strict`, checked across all four invocations; `packages/eve-runtime` gets `lib: ["ES2022", "ES2023.Intl"]`. §5.2 |
| `ci-integration.yml` is step-pinned; CI helper `tooling/` prefix (G F9) | One coordinator-owned globbed integration step, added once in W-MOCK-SB with a reviewed amendment; carve-outs precede the `tooling/` prefix check. §4.7, §7.2 |
| importMap header, missing-formatter behavior, `tsrs` subpath (G F10) | The postprocessor strips the legacy header; `refresh-upstream-skills` fails closed without Oxfmt (with a test seam for temp roots); `getExePath.js` is resolved from `tsrs/package.json`. §5.2, §6, D4 |
| Coordinator: M1 step 4 needs an offline replay input | SD-1 `--refresh-diffs --record <file>` and `--replay <file>`. D9 |

#### 0b. Retained from earlier rounds

These carry over unchanged in substance:

- **Configs:** root entry configs (E47); `.mts` configs; explicit Oxfmt sorting off; the typed/untyped flag split (R6).
- **Staging and fixing:** format-and-report staging; private-cwd fixing (E37); owned-file prune (E35, E42); the derived fix policy; chunking by command length (R6).
- **TypeScript programs:** transitive test ownership with (specifier, target) alias needs (E40, E45); owner-resolved portable declaration paths (E41); blocking/ratchet modes with diff-mapped site comparison (R6); `ES2023.Intl`; TC-5 before typed fixes; FB-1 as a replacement transaction; RB-1.
- **Records and cutovers:** five hash-bound record families; SD-1 `--amend`; AP-1's four pin kinds; one ESLint retirement.
- **Mocks and integrity:** the deny-all via `defineProperty` (E50); the Supabase recipe with privilege recording; SAFETY `markers`; `vi.spyOn` binding checks; class R; predicate and detached owners; golden hashes from raw input; money no-shrink; ReUI with the parity rules.
- **CI, backend and resources:** event-aware CI; the CTI; TSRS launcher-logic identity on Windows and Ubuntu; the root-anchored Query bridge; `RAYON_NUM_THREADS`; JS typed-off; PF-1; GEN-1.

### 4.7 Plan v8, answering round 8

#### 0a. Simplifications (‡)

Most hard gates in rounds 5–8 sat in bespoke procedure. v8 removes five mechanisms rather than patching them again:

| Removed                                                                                                                    | Replaced by                                                                                                                                                    | Why                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| A native Oxlint suppression ledger (bootstrap, `prune.mts`, snapshot/restore, writer lock, stale-report ordering, renames) | The **incumbent ESLint UI bridge** keeps the six shadcn rules and its existing, tested ledger until W-UI; Oxlint never carries shadcn debt (D12, E60)          | Oxlint's prune semantics (E54), gate ordering and lock-eviction defects (C R7–R8) cannot occur          |
| Whole-tree replay of mechanical batches (records, registry recordings, amendment manifests)                                | **`verify-mechanical`**: source replay over the declared path set, a closed set of derived files with field-level diffs, and the records' own verifiers (§8.3) | The replay could not reproduce its own inputs (C R8); `--record`/`--replay` are no longer needed (G R8) |
| Diff-mapped diagnostic site comparison                                                                                     | Mechanical batches skip files with compile diagnostics; a healthy-run rule; per-file non-increase for slices (§5.5)                                            | Removes key-collision and mapping edge cases; the ratchet stays count-based                             |
| Shell-specific hook wrappers and exit-code feedback                                                                        | **One Node launcher** for every harness and shell, with **JSON feedback on stdout and exit 0** (D11, E59)                                                      | PowerShell exit squashing, inherited `GIT_DIR` and Cursor's `claude` argument stop mattering            |
| Global `unstubGlobals`/`unstubEnvs`                                                                                        | Per-test re-installation of the network deny-all; only `fetch` replacements migrate (§4.7)                                                                     | Non-network stubs keep their current lifetimes (A/C R8)                                                 |

#### 0b. Round-8 findings → resolution

<!-- prettier-ignore -->
| Finding (reviewer) | Resolution in v8 |
|---|---|
| CT-0a cannot pass whole-repo `format:check` (C HG1, G F3 HG) | CT-0a commit checks: touched files pass Oxfmt, and `--list-different` equals the reviewed CT-0b inventory. The full gate runs at A5's end; nothing is pushed inside a batch. §8.1, §8.2 |
| Git blob-id acceptance pins (A F1, C HG2) | AP-1 kind (e): path-bound digests, including git blob ids. The `issue-2258` pins are amended in CT-0b with proofs; semantic edits to `UNEDITED` authz tests are TA-1 edits. D9, §8.5 (E57) |
| Compiler health; Principal/Projection programs (C HG3) | A healthy-run rule (including locationless TS2688); both existing programs are registered and verified in typed lint and the compiler. §5.4, §5.5 |
| Ledger order, live-lock eviction, renames (C HG4) | The native ledger is gone (0a). UI-bridge ledger: existing writer, per-commit no-growth, clear before rename. The lock only breaks dead PIDs. D10, D12 |
| Replay inputs and outputs; skills family (C HG5, G F3) | `verify-mechanical` (0a); skill sync and audit hashes come first in the derived-record order. §8.3 |
| Shared command loses exit 2 under PowerShell; Cursor JSON channel; outer `git` call (G F1 HG) | Node launcher plus JSON feedback (0a). D11 (E59) |
| Socket guard breaks real-stack suites; the integration directory is not collected (G F2 HG) | Integration tier by file name: guards skipped per file and cross-checked with `ci-integration.yml`; network tests run by one glob step with a canary. §4.7 |
| Central Query bridge unwired and at OOM risk; public commands inconsistent (G F4 HG, C 7) | A root `lint:query` dispatcher: workspace tasks plus one process per central program (at most two at once), used by `lint`, CI and `check:changed`. `check:changed` uses the gate entry. D3, §4.4, §7.1 |
| `next typegen` unexecuted; cache outputs; validator negative (A F10, G F5, C 6) | Executed on all four apps without service variables: zero drift, validator clean on 7.1-beta (E58). Outputs and inputs declared; the negative uses an incompatible authored route; a warm-cache restore test. §5.2, §7.3 |
| Vitest unstub side effects; Supabase step 1; stub counts (A F3, C 8) | No global unstub change; env stubbed per test; a generated inventory (E57). §4.7 |
| Per-property fault patches (A F2) | Recorded call-shape properties; one patch per (file, property), failing on an assertion. §8.5 |
| Behavior-changing rules (A F4) | `no-array-reverse` under principle A; prescribed repairs for eleven more rules; `isNonZero`; a code-unit comparator; a typed check on number→null rewrites. D6, §4.2 |
| Silent-catch allowlist (A F5) | Non-silent only if the handler rethrows, calls a registered reporter or returns a registered failure constructor. D5 |
| Child processes; declared refusals (A F6) | A spawn helper with a cleaned env and the deny-all preload; an inventory; `expectDeniedNetwork` counted, no catch-alls; a file-level `afterAll`. §4.7 |
| TA-1 membership; RLS clients; `apikey` (A F7) | Membership is base ∪ head; every Supabase client constructor site; a user→admin swap patch; `apikey` assertions. §4.2, §4.7 |
| Stripe wording, empty-key branch, env refusal test, protected deployment at call time (A F8, G F9) | §4.7 |
| Cast helpers; re-exported namespace spies (A F9) | D5 |
| CI range plumbing (G F6) | An event-aware resolver. §7.2 |
| Lock order, `maxBuffer`, untracked configs (G F8) | `fix.mts` owns the lock; `git ls-files -z` is streamed; `staged-guard` rejects untracked discoverable configs. D10 |
| OpenSpec archive, factory pack, generated currency file (G F3) | `.prettierignore` gains the archive; the pack waits for its release slice; the currency file is un-ignored. D8 |

#### 0c. Retained from earlier rounds

Unchanged in substance: the toolchain cohort and TSRS binding/identity (D1, D4); root entry configs and the per-command entry table (D2, D3); protected and mirrored-tree ignores; anti-slop policy, exception classes, test links, legacy directives and SAFETY markers (D5); money, TA-1 and golden-hash protections; five hash-bound record families with proof-or-note rebinds (D9); the CT-0a/CT-0b split; the Stripe construction guard; program ownership, generated paths and the count-based ratchet (§5.4); per-platform strict builds; event-aware CI; PF-1; FB-1; RB-1; GEN-1.

### 4.8 Plan v9, answering round 9

v9 keeps every v8 simplification (all three round-9 reviewers endorsed them): the incumbent ESLint UI bridge instead of an Oxlint ledger, `verify-mechanical` instead of whole-tree replay, count-based ratchets instead of site mapping, the Node hook launcher with JSON feedback, and no global unstub change. The round-9 findings sit at the boundaries between mechanisms; each is resolved below, and the two engine-boundary questions are settled by executed evidence (E61, E62).

#### 0a. Round-9 findings → resolution

<!-- prettier-ignore -->
| Finding (reviewer) | Resolution in v9 |
|---|---|
| A file name grants network authority; tier files still run in `test:unit`; integration children need service access (C HG1, G F3 HG, A F1) | **Authority comes from the job, not the name.** A coordinator-owned `integration-tier.json` lists each tier file, its gating variable and the service variables its children may receive. `vitest.config.mts` excludes registry files unless `CORE_TEST_TIER=integration` (set once at job level in `ci-integration.yml`); the guards stay on unless that variable is set **and** the file is registered. Same-filename-under-both-entrypoints and collected-ID-union controls. §4.7 |
| `verify-mechanical` rejects dual-role files and legitimate derived outputs (C HG2, G F2 HG, A F7d) | An ordered comparison: base → replayed transform → proved derived edits (pin literals checked against the replayed intermediate, record fields, add-only amendment files, evidenced React Doctor deletions, UI-ledger decreases) → head. M2 replay includes its M1 pass over the post-revert set. All skill-sync outputs are registered; step 4 cites the RDL-1 verifier. Controls use the real `issue-2258` harness. §8.3 |
| The UI bridge cannot run as specified (G F1 HG); directive ownership between engines (C HG3, A F7c) | **One non-discoverable `tooling/eslint-config/bridge.config.mjs`** (E61: exact ledger parity, no unknown-rule errors) loaded by `--config`; all `eslint.config.mjs` files deleted. Oxlint roots set `respectEslintDisableDirectives: false` (E62); shadcn directives belong to the bridge until W-UI, every other directive becomes `oxlint-*` at CT-0a. The bridge reports unused directives except in vendored ReUI. D12 |
| App typecheck cache identity; dev types; optional Payload types; PR selection (C HG4, G F7) | The four app typecheck tasks are **uncached** and run on every CI event over a canonical `tsconfig.typecheck.json` (no `.next/dev/types`); Payload-present/absent stays GEN-1a's two states. §5.2, §7.2, §7.3 |
| UI-ledger transaction order; slice prune handoff; tracked bridge config; rollback (C 5) | Raw report vs ledger (decreases only) → owner prune (slices prune their owned paths) → stage source and ledger together → exact gate. Staged policy inputs include the bridge config and design-system files. Rollback restores a zero-debt bridge and moves the six rules off Oxlint together. D12, D10, §11 |
| What the ratchet guarantees (C 6) | M2: zero diagnostics before and after per touched file. M1/CT-0b: whitespace-only replay, ratchet unchanged. Outside a slice: no new key or higher count; a same-key move inside one file is not detected (documented). §5.5 |
| Strict-build coverage by task (C 7) | Expected and observed task IDs per platform; the win32 shared list gains `@asym/eve-runtime` and `@asym/mock-data`. §5.2 |
| `lint-staged` win32 chunking repeats `health.mjs` dozens of times (G F4) | One staged runner, `tooling/quality/pre-commit.mts`, replaces `lint-staged`. D10 |
| `lint:query` child programs, memory, PR mapping, `lint:<app>` scripts (G F5) | Child-directory ignores, an A6 heap/time measurement with a split rule, graph-verified Query-free exclusions, a defined `lint-query-scope.mts`, and workspace `lint` scripts that run Oxlint and the bridge. D3 |
| Launcher cwd, stdout purity, per-harness JSON (G F6) | No `cwd` override; child stdio captured; a top-level catch emits refusal JSON with exit 0; short `reason`, diagnostics once, capped; Codex uses `additionalContext` without `block`; Cursor `{}` when clean. D11 |
| Vercel triggers, `issue-2201` pin, `verify:eslint` wording (G F7) | `tooling/eslint-config/**` is tooling-only until W-UI; `CI_PRINTS` joins the CT-0a pins; `verify:eslint` is reduced to the bridge until W-UI everywhere. §7, §8.2 |
| Behavior-changing rules unlisted; PL-3 criteria lost (A F2) | An objective PL-3 rule, PL-0..PL-5 defined, and fourteen more rules with prescribed forms. §4.2, §10 |
| NaN and sort repairs not exact (A F3) | `isNonZero` (NaN-safe) everywhere a numeric truthiness test is replaced, including the `$0` site; a typed check on `!== 0`/`!= null` rewrites; the order-preserving comparator compares string forms. D6, §4.2 |
| `SAFETY: P3` as an uncapped narrowing channel (A F4) | Markers carry the assertion's real class (P2 third-party typing; P3 only for a decoder with a test link); production I/O narrowing is parsed or test-linked; per-slice markers vs removed casts get review. D5 |
| Child processes lose parent-registered ports; bash children (A F5) | The spawn helper forwards `CORE_TEST_LOOPBACK_PORTS` and keeps loopback URLs; non-Node children rely on the cleaned environment, stated explicitly. §4.7 |
| Payload access layer outside TA-1 (A F6) | Added, with a Payload local-API fault-patch recipe. §4.2 |
| supabase-js wording; env import path; fault-patch scope (A F7) | Corrected; `@asym/env/target-env`; every recorded call-shape assertion is a property, identified by id in the failing message. §2, §4.7, §8.5 |

#### 0b. Retained from earlier rounds

Unchanged in substance: the toolchain cohort and TSRS binding/identity (D1, D4); root entry configs and the per-command entry table (D2, D3); protected and mirrored-tree ignores; anti-slop policy, exception classes, test links and legacy directives (D5); money, TA-1 and golden-hash protections; five hash-bound record families with proof-or-note rebinds (D9); the CT-0a/CT-0b split with CT-0a commit checks; the Stripe construction guard; program ownership, healthy runs and the count-based ratchet (§5.4–§5.5); per-platform strict builds; event-aware CI with the commit-range resolver; PF-1; FB-1; RB-1; GEN-1; and the v8 simplifications listed above.

### 4.9 Plan v10, answering round 10

Round 10 reviewed v9. Its reviewers again endorsed the v8 simplifications and found defects at execution scale and at the edges of the repository: Windows command-line limits, test collection on the real tree, a dependency contradiction at the cutover, a control that Vitest cannot run, guards that judged by a denylist, and owner-directed work in flight that v9 did not follow. v10 resolves every finding. E63–E67 and E74 qualify components or reproduce failures. The full Windows rehearsal (VR-9), the three integration-selection legs (VR-13) and the real pin-plus-provenance acceptance/rejection pair (VR-8) are implementation gates, not completed runs. Several fixes remove machinery: the React Doctor rebind tools, the test spawn helper and its lint rule, three ESLint plugins, and most hand-written fault patches.

#### 0a. Round-10 findings → resolution

<!-- prettier-ignore -->
| Finding (reviewer) | Resolution in v10 |
|---|---|
| The UI bridge imports three ESLint plugins that the cutover removes (G F3, hard gate) | The bridge imports no retired plugin. After CT-0a's conversion only three upstream comments in the vendored ReUI files name a retired rule, and an inline no-op stub resolves them. Executed: gated exit 0 with zero messages, raw exactly 1,703, a stale directive fails (E63). `eslint-config-next` leaves the bridge manifest. D1, D12 |
| CT-0a's directive conversion breaks the bridge on the checkout file: an inline configuration comment re-enables `react-hooks/refs` (A F1) | CT-0a inventories and removes ESLint inline configuration comments. The one that exists becomes a `react/refs` override for that file in the transition entry; Oxlint reports the same site and a seeded control proves the protection (E64). `verify:quality` rejects such comments afterwards. D5, D12, §8.2 |
| `pre-commit.mts`, `lint.mjs` and `git add` fail with `ENAMETOOLONG` on Windows at commit scale; staged non-source files warn (G F1, hard gate) | One chunker for every runner; `lint.mjs` chunks after a single health run, takes `--paths-file`, filters by extension and bridge ignores, and passes `--no-warn-ignored`; Git receives path lists through its batch forms, never as arguments (the staged runner never runs `git add`, C 2 below). D3, D10, D12, VR-9 |
| Whole-repo `vitest list --json` fails at base and hides `skipIf` IDs (G F2, hard gate) | A1 repairs the two files with no collectable suite. Link checks list only the referenced files, filters first. Test IDs come from one tool, per entrypoint and platform; file parity uses `--filesOnly`; compare gated IDs in their owning jobs; an approved tier move may change the entrypoint, not the union. Whole-repo collection health is a CI step. D5, §4.7, §7.2, §8.5 (TID-1), E67 |
| The direct-selection denial control cannot run under `test.exclude`; the spawn rule collides with frozen acceptance suites; ephemeral child variables (G F4, hard gate) and children started by code under test (A F4) | A three-leg control; `configDefaults.exclude` is spread. **No spawn helper and no spawn rule:** the preload reaches inheriting Node and Bun descendants, including children of code under test; their refusals join the per-test record. No acceptance suite is edited. E66 passed eight preload fixture cases, one of which demonstrates the replacement-environment limit; it separately tested external HTTP through git and curl. E67 reproduces collection denial. The guard also wraps `node:child_process`, so a child given a replaced environment is covered as well (E75). W-MOCK-SB must prove the remaining network and three-leg controls in VR-13, including caller-supplied ephemeral integration variables. The two `stripe-live` suites get an explicit integration selection and a test-mode credential gate. The guards stay on in the integration tier, limited to registered hosts. §4.7, VR-13 |
| ESLint accepts ledger keys for deleted files and a prune drops unrelated dead keys (G F5) | `lint.mjs` fails on a key whose file is gone, and a path-limited prune may change only keys under its paths. Reproduced (E65). D12, VR-9 |
| `verify-mechanical` has no `node_modules`, no defined path set, and compares structural JSON edits byte for byte (G F6) | Identical lockfile required; a scratch worktree with its own frozen install, reused; replay through the writer's own enumeration with a recorded revert list; derived JSON written through the format adapter before comparison. §8.3 |
| App typecheck flags and Turbo config; zero-commit CI range; a missing bridge trigger; lint-job time; Windows and WSL share a hostname (G F7) | `-p tsconfig.typecheck.json` with `incremental: false`, declared as root package tasks; base equal to head resolves to `HEAD^..HEAD`; `tooling/typescript-config/**` triggers the full bridge; one health run, scoped typed checks and a measured split rule; the lock records its platform. §5.2, §7.1, §7.2, D3, D10 |
| Agent-hook contradictions, unstated matchers, static-import failure before the handler (G F8) | Wording aligned; matchers stated; the entry is plain JavaScript that loads the implementation dynamically inside its handler. D11, VR-10 |
| Owner-directed quality work in flight is not followed, and RDL-1 rebinds a ledger the owner ruled must never be rebound (A F2) | New D13: follow develop at every batch, never maintain what another change is deleting, one owner per shared surface. **RDL-1 and RDX-1 are withdrawn**; SR-1 and the pin amendments are conditional; hook and workflow owners are named. D9, D13, E69 |
| The money and nullable-number rewrite guard is a denylist; `> 0` and bigint escape it (A F3) | An allowlist keyed on the base numeric-truthiness findings: `isNonZero`, `isNonZeroBigInt`, direct `x !== 0n` on a non-nullable bigint, or an owned money predicate on the same operand; otherwise record and test the behavior change using the applicable zero, negative, missing and (number only) `NaN` cases. D6, §4.2, VR-13 |
| Test-double casts have no honest class (A F5) | Class P4 covers doubles in registered doubles owners, whose doubles throw on an unprovided member; `as never` is rejected elsewhere in tests. D5 |
| Exception test links prove existence, not relevance (A F6) | Static relevance on every run, executed relevance (coverage of the marked code by its own named test) at slice acceptance and in CI. D5, VR-13 |
| A slice can weaken tenant, auth and money tests without touching product code (A F7) | One fault-patch library built at A3; select on base or head test reachability and require each protecting test, not just one per function, to detect the fault on its recorded assertion. §8.5 (FP-1) |
| The Payload fault-patch recipe needs Postgres in the unit tier (A F8) | Patches run against the direct access-function tests, with a static wiring check on every collection's `access` block. §4.2 |
| `no-cast-helper` misses `T[]`, `Promise<T>` and overload helpers; "test-first" is labelled by rule, so it covers type-only edits (A F9) | The rule reports assertions that reference the function's own type parameter and the overload form. Behavior relevance is decided per edit by emitted output. D5, §4.2 |
| `no-silent-catch` scope and notifier owners; `runDetached` signature; workflow ownership in W-MOCK-SB; legacy-directive conversion proof; branch-coverage wording; about 945 per-property patches; guards off in the integration tier (A F10) | Scope stated and sized by a handler inventory, with reporters, notifiers and failure values registered; `runDetached` takes a promise or a function; W-MOCK-SB-CI is a coordinator commit; the legacy list keeps base text and the conversion is recomputed; covered-branch counts cannot fall and new branches must be covered; patches for the high-risk classes and a reviewed mapping for the rest; guards stay on. D5, §4.7, §8.5 |
| The Windows pre-commit cannot pass the UI file list in one ESLint call (C 1, hard gate; the same failure as G F1) | Resolved with G F1: one health run, then bounded ESLint chunks from a paths file. Two controls are added: an error that occurs only in the last chunk fails the run, and an empty UI set exits 0 without linting every workspace. D10, D12, VR-9 |
| Pre-commit can stage an edit the author never selected: it formats working-tree files and stages them, and a write between the guard and the staging is swept in (C 2, hard gate) | The staged runner formats the **staged bytes** and writes the result to the index itself; it never runs `git add`. A working-tree file that changed while the hook ran is left alone and named. E74 covers an edit before the comparison; VR-9 also checks an edit immediately before index publication. D10, VR-9 |
| A mechanical pin amendment needs a provenance comment that the blob comparison rejects (C 3, hard gate) | `verify-mechanical` applies the exact old-text and new-text pair of the amendment record; the pair may change the pin literal and one adjacent comment line, nothing else. §8.3 |
| The ratchet is required for CT-0b before it exists, and §8.5 promised site-level detection the count ratchet does not give (C 4) | CT-0b is accepted by source replay and the programs that already block; the ratchet applies from A6. Slice acceptance states the real guarantee, with a control for the undetected same-key move. §5.5, §8.5 |
| The public app typecheck has no literal command, and a clean tree cannot prove isolation from dev-generated types (C 5) | `tsc --noEmit -p tsconfig.typecheck.json` (as for G F7); the isolation control runs with a poisoned dev-types file present in every app. §5.2, VR-6 |
| An owned-path ESLint prune can publish an unowned ledger deletion (C 6) | The owned-key check of G F5; unrelated dead keys are removed only by the coordinator's full-scope prune. D12 |
| Editors cannot find the bridge config, and the bridge's retirement has no single revertible point (C 7) | ESLint is off in editors from CT-0a, when the editor settings land with the formatter; the bridge is reached through `lint:ui`, `check:changed` and the staged hook. W-UI is split: W-UI-a ends on a green zero-debt bridge, and W-UI-b is the engine switch as one revertible commit. D11, D12, §11 |

#### 0b. Retained from earlier rounds

Unchanged in substance: the toolchain cohort and TSRS binding and identity (D1, D4); root entry configs and the per-command entry table (D2, D3); protected and mirrored-tree ignores; the anti-slop policy and exception classes (D5); the money scope, TA-1 and golden-hash protections; proof-or-note rebinds (D9); the CT-0a/CT-0b split; the single UI-bridge config and directive ownership between the engines (D12); job-scoped network authority (§4.7); the ordered `verify-mechanical`; uncached app typechecks; the Stripe construction guard; program ownership, healthy runs and the count-based ratchet (§5.4–§5.5); per-platform strict builds; event-aware CI with the commit-range resolver; PF-1; FB-1; RB-1; GEN-1; and the v8 simplifications (the incumbent ESLint UI bridge instead of an Oxlint ledger, `verify-mechanical` instead of whole-tree replay, count-based ratchets, the Node hook launcher with JSON feedback, no global unstub change). Resolutions of rounds 2 to 9 are in the council record.

#### 0c. Changes made at ratification

After round 10 the coordinator made five kinds of change that no reviewer scored. The council record gives each one with its source.

- **Two arbiter rulings.** The owner's standing instruction is that a choice which would otherwise go to him is ruled on by a fresh, independent agent, from the evidence and the coordinator's recommendation. The first ruling settled how this change follows the quality pull requests open on develop: batch A1 starts now, batch A5 is held for up to two working days if that stack is still open, and each shared file has one owner (D13). The second settled a conflict with the edit-hook requirements that pull request #2726 brings: the hook changes layout only, never blocks an edit, and stops within its time budget (D11).
- **A nothing-lost audit.** Eleven independent readers compared the draft with plan versions 1 to 9, the evidence, the owner's assignment, the research handoff and the reviews of rounds 1 to 9. They reported 253 items that successive compressions had dropped or weakened. Each was accepted, accepted in a changed form, found already present, or rejected with a reason. The largest restorations are the task glossary of §10 (with the rule that a lint crash exits 2 and never passes), the version verifier's contract (§5.2), the contract of each formatter consumer (§6), the per-library TanStack protections (§4.4), the Playwright scope (§4.5), the backend-parity and performance procedures (§7.4), and the design-system suites that W-UI must port (D12).
- **New evidence, E70 to E76:** the quality pull requests opened on 19 November, the socket guard's coverage, Oxlint's native suppression file, the formatting of this change's own documents, the staged-bytes prototype, a guard that reaches a child whose environment was replaced, and port-qualified proxy exemptions.
- **Editor settings** land at the cutover instead of at the end (D11).
- **A final consistency check.** Five independent readers looked for the defects that a merge of about 200 edits leaves behind: unresolved round-10 findings, contradictions between sections, companion documents that disagreed with the plan, false repository facts, and assignment clauses with no mapping. Each finding was fixed; the council record lists them. Among the fixes: the first batches can now be executed as written, the staged runner never writes a working-tree file, and the numeric-truthiness check works per finding instead of per file.

## 5. Round 10 and the ratification

Round 10 reviewed plan v9. Its mean over 24 scores was 8.6292, below the 9.2 threshold, and two reviewers reported hard gates: Gemini four, Codex three. Under the pass rule it did not pass, like every round before it.

During round 10 the owner directed that it be the last round, and that the completed plan be ratified after it, with nothing left out and all the evidence from every round used. The coordinator then did the following, in this order.

1. **Resolved every round-10 finding.** Section 4.9 above lists each finding of the three reviewers with its resolution in plan v10. Each hard gate was first reproduced, and its fix was prototyped or qualified. That evidence shows the fix is feasible; the controls that prove each fix in the repository are tasks of the plan, not completed runs:
   - the UI bridge runs with none of the ESLint plugins the cutover removes (E63);
   - the checkout page's ref protection carries over to Oxlint at the same site (E64);
   - ESLint's ledger accepts keys for deleted files and a prune drops them, so the plan adds its own checks (E65);
   - a guard preloaded into Node and Bun children refuses the network in child processes, which replaced a spawn helper that could not reach frozen acceptance suites (E66); wrapping `node:child_process` extends it to a child whose environment was replaced (E75);
   - whole-repository test listing fails on the base tree for two known files, which batch A1 repairs (E67);
   - a pre-commit hook that formats the staged bytes cannot stage an edit the author did not select (E74).
2. **Took two choices to an independent arbiter** (section 6), as the owner's standing instruction requires for choices that would otherwise go to him.
3. **Ran a nothing-lost audit** (section 7). Ten rounds of rewriting had compressed the plan many times, and the owner asked that nothing be left out.
4. **Ran a final consistency check** of the plan and its companion documents (section 8).

**Plan v10 was not scored by the council.** It is ratified on the owner's instruction of 19 November 2026, not under the pass rule. The checks in steps 2 to 4 are not council scores and are not presented as such.

**What round 10's reviewers agreed on.** All three again endorsed the simplifications made in plan v8: the existing ESLint ledger as a temporary bridge for the six shadcn rules, `verify-mechanical` in place of whole-tree replay, count-based ratchets, and one Node hook launcher. Codex found no compiler-compatibility hard gate and no reason to replace TSRS, abandon TypeScript 7.1 beta, or move the classic API consumers off 6.0.3. Each reviewer described its hard gates as localized, with a known fix, and not requiring a redesign.

**A standing dissent.** In round 1 Codex preferred TSRS fast mode. The plan keeps reference mode and records the measurements beside the decision (D4).

## 6. Arbiter rulings

The owner's instruction of 17 November 2026: when a question would otherwise go to him, the coordinator makes a recommendation, and a fresh agent takes the evidence and the recommendation and makes the final decision. Two such rulings were made on 19 November, each by a fresh Claude Opus 5.5 agent at xhigh that worked read-only.

**Ruling 1: work in flight on develop.** Five owner-directed quality changes were open as stacked pull requests on the files this migration edits (E69, E70). The arbiter ruled:

- **Edit hooks.** Only one edit hook is ever registered per harness. If pull request #2726's hook is on develop when this change reaches its hook task, that task replaces its registrations with this plan's launcher, carries its test cases over, and retires its script.
- **Workflow files.** Issue #2711 owns the structure of the CI jobs. This change edits the workflow files only in coordinator commits, on develop's current structure, and steps it adds to the unit-test job run once, outside the test shard matrix.
- **Start.** Batch A1 starts now. The cutover batch (A5) is held for up to two working days if the stack is still open when it begins, and then proceeds.

The coordinator made one factual correction: the Shadscan rebind tool is built in the first batch that needs it, because the first dependency commit is rejected without it while that ledger exists (E21, E32).

**Ruling 2: the edit hook.** Pull request #2726 brings requirements that an edit hook must not apply a lint fix that can remove, move or rewrite code, and must never block. Plan v9's hook applied a wider fix list and blocked in Claude Code. The arbiter ruled:

- The hook changes layout only: the blank-line fix and the formatter. It never blocks an edit. It names each file it rewrote and each tool that could not run, and it stops within a 100-second budget.
- Cursor's channel is decided by observing which one delivers the report, not assumed.
- The pre-commit hook stays format-and-report. It names, for each file with findings, how many the fix command applies.
- When #2726's requirements become durable specifications, this change adds a delta that modifies them for the new tools.

## 7. The nothing-lost audit

Eleven independent readers each compared the working plan with one body of earlier material and reported anything that had been dropped or weakened and that no later version had deliberately removed.

| Unit          | What it read              | Reader                 | Findings |
| ------------- | ------------------------- | ---------------------- | -------: |
| evidence      | the evidence record       | Claude Opus 5.5, xhigh |       14 |
| lost:v1       | plan v1                   | GPT 6.2 Astra, xhigh   |       37 |
| lost:v2-v3    | plans v2 and v3           | Claude Opus 5.5, xhigh |       28 |
| lost:v4-v5    | plans v4 and v5           | GPT 6.2 Astra, xhigh   |       40 |
| lost:v6-v7    | plans v6 and v7           | Claude Opus 5.5, xhigh |        6 |
| lost:v8-v9    | plans v8 and v9           | Claude Opus 5.5, xhigh |       12 |
| assignment    | the owner's assignment    | Claude Opus 5.5, xhigh |       25 |
| handoff       | the research handoff      | GPT 6.2 Astra, xhigh   |       40 |
| reviews:r1    | the three round-1 reports | Claude Opus 5.5, xhigh |       16 |
| reviews:r2-r5 | twelve scored reviews     | GPT 6.2 Astra, xhigh   |       31 |
| reviews:r6-r9 | twelve scored reviews     | Claude Opus 5.5, xhigh |        4 |
| **Total**     |                           |                        |  **253** |

**Verdicts.** 144 accepted as suggested, 87 accepted in a corrected form, 22 already present in the current plan, none rejected outright. Parts of a few findings were declined inside their rows, each with its reason.

**How it was run.** The first attempt, eleven agents on the coordinator's own subscription, was cut off by a usage limit before any reported. It was run again as independent delegates on other subscriptions. Four units were assigned to Gemini 4 Neon through Cursor; Cursor refused that model at both xhigh and high although it still listed it, so those units went to Claude Code and Codex. No other model was substituted on Cursor.

**How findings became edits.** The coordinator folded the first four units directly. The remaining 186 findings were assigned to seven plan areas; one drafting agent per area checked each finding against the current plan and drafted the smallest edit; the coordinator reviewed every edit before applying it. The last unit's 31 findings were adjudicated by the coordinator after those edits were in.

**What the audit restored.** The largest items:

- the definition of every task ID, including the rule that a lint crash or setup failure exits 2 and never reads as findings or as a pass;
- the version verifier's full contract, and exact compile-failure diagnostics per compiler family;
- a specific contract for each formatter consumer;
- the per-library TanStack protections, with the test suites that provide them;
- the Playwright scope, with a clean case beside each failing one;
- the backend-parity and performance procedures;
- the twelve design-system test suites that the final UI step must port before it deletes the workspace they import;
- the concrete path scope of each import tier.

The tables below give every finding with its verdict and where its edit landed. Edit-file names such as "v10-8a" identify the coordinator's working edit sets.

### evidence (Claude Opus xhigh) — 14 findings, 2 material; all accepted

<!-- prettier-ignore -->
| ID | Sev | Decision | Where |
|---|---|---|---|
| EV-01 | material | Accepted: a Shadscan-cited file is rebound in the commit that changes it while the hook step exists (E21, E32) | D9 rebind integrity, §8.1 — v10-8a |
| EV-02 | material | Accepted: emit-diff and the emitted-import check use each file's resolved compiler options (`verbatimModuleSyntax`, E38); control added | §4.2, §8.3, VR-13 — v10-8a |
| EV-03 | minor | Accepted: `OXLINT_TSGOLINT_PATH` named (E12) | D4 — v10-8a |
| EV-04 | minor | Accepted: directory-rooted `tsconfig.json` discovery rule stated (E28) | §5.4 — v10-8a |
| EV-05 | minor | Accepted: every Oxfmt run uses the root as working directory; adapter test | D8 — v10-8a |
| EV-06 | minor | Accepted: layer 3 is an override block after preset blocks (E26) | D6 — v10-8a |
| EV-07 | minor | Accepted: Codex patch text is in `tool_input.command` (E43) | D11 — v10-8a |
| EV-08 | minor | Accepted: `args[0][0]` socket-guard pitfall (E66) and control | §4.7, VR-13 — v10-8a |
| EV-09 | minor | Accepted: W-UI follows the existing design-system fix guide (E16) | D12 — v10-8a |
| EV-10 | minor | Accepted: OS-1 names every related active change, incl. `complete-repository-modernization` (E2) | §10 OS-1 — with the D13 edits (v10-8d) |
| EV-11 | minor | Accepted: six UI workspaces run `lint.mjs`, not every workspace | §2 — v10-8a |
| EV-12 | minor | Accepted: TSRS row cites E7 and E12 correctly; patch parity attributed to Codex round 1 and TC-5 | §2 — v10-8a |
| EV-13 | minor | Accepted: formatting row cites E10 and E8 correctly; the count of twelve is replaced by the §6 list | §2 — v10-8a; guide, proposal and tasks wording to follow |
| EV-14 | minor | Accepted: evidence classes corrected in the §9 closing line | §9 — v10-8a |

### lost:v8-v9 (Claude Opus xhigh, rerun) — 12 findings, 2 material; all accepted (one in a changed form)

<!-- prettier-ignore -->
| ID | Sev | Decision | Where |
|---|---|---|---|
| V89-01 | material | Accepted: the directive contract and the 4.1 row accept P4, only in doubles owners; control added | D5, §4.1, VR-13 — v10-8b |
| V89-02 | material | Accepted: a running hook entry never exits with empty output; re-dispatch to a worktree without the hook writes `{}` | D11, VR-10 — v10-8b |
| V89-03 | minor | Accepted through the arbiter rulings: the registered string is the generated launcher in either case | D11, D13 — v10-8d |
| V89-04 | minor | Accepted: every Shadscan obligation is conditional on the ledger existing | D9, §5.2 RB-1 — v10-8b; VR-7, VR-8, CT-0a wording — v10-8d |
| V89-05 | minor | Accepted: chunked children are spawned with `shell: false`; VR-9 asserts it | D3, VR-9 — v10-8b |
| V89-06 | minor | Accepted: `scratch.mts` takes a commit; fault patches run at the commit under test | §8.3, §8.5 — v10-8b |
| V89-07 | minor | Accepted: control for the `tooling/typescript-config/**` trigger | VR-6, §7.3 — v10-8b |
| V89-08 | minor | Accepted: VR-6 covers a base equal to the head | VR-6 — v10-8b |
| V89-09 | minor | Accepted: registry-against-workflow negative control restored | VR-13 — v10-8b |
| V89-10 | minor | Changed: the repository is public, so the handoff and the assignment are NOT copied in; the plan says so and identifies the handoff by digest. Owner may ask for it to be added | header — v10-8b |
| V89-11 | minor | Accepted: "step 5" is step 4 | §8.3 — v10-8b |
| V89-12 | minor | Accepted: activation rows ordered by batch (script); FM-1 in A1 and W-MOCK-SB-CI in B rows | §7.1 — done; §8.2 — v10-8d |
| (dropped ×3) | wording | Fixed anyway: "v8 uses/registers" phrasing; the tier service-variable examples from v9 restored | §2, §4.7 — v10-8b |

### Arbiter rulings and E70 (not audit findings)

- Arbiter 1 (arbiter-ruling.md): Q1 accept with change; Q2 #2711 owns workflow structure; Q3 start A1 now, hold A5 up to two
  working days. One factual adjustment by the coordinator: the arbiter wrote "SR-1 is not built in A1", but TC-1 edits the root
  manifest in A1 and the hook rejects that commit without its rebind while the ledger exists (E21, E32). D13 therefore says SR-1 is
  built in the first batch that needs it, which is A1 only if PR #2725 is still open when A1 reaches TC-1.
- Arbiter 2 (arbiter2-ruling.md): hook writes layout only (policy m1), never blocks, reports every outcome, 100 s budget,
  quiet `{}` without dependencies; Cursor channel by WF-7 observation; pre-commit stays format-and-report and names `bun run fix`;
  MODIFIED delta once the requirements are durable in openspec/specs.
- Applied in v10-8d and v10-8e: D11 rewritten, D13 rewritten (rows for PR #2725, enforce-jsx-a11y-lint, PR #2726 twice, PR #2727;
  start and hold point; owners), D10 staged-report line, §2 work-in-flight row, §7.1 C4 row, §7.2 unit-job steps outside the shard
  matrix, §8.2 A1/A5/B rows, §10 SR-1/WF-2/OS-1 rows, VR-10 cases, §13 and §14 additions, plan header owner line.

### lost:v6-v7 (Claude Opus xhigh) — 6 findings, 3 material; all accepted (one in a changed form)

| ID     | Sev            | Decision                                                                                                                                                                                                                                                                                                  | Where                                                    |
| ------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| V67-01 | material       | Accepted: at W-UI the `@shadcn/lint` patch moves to `tooling/quality/patches/` with the `patchedDependencies` entry repointed, or both are removed for 0.2.5; frozen install before the bridge directory is deleted. Repository fact confirmed (root `package.json:283`)                                  | D1, D12 W-UI step 2 — v10-8g; guide C3, tasks 10.5       |
| V67-02 | material       | Changed: no second hook on `tls`. E71 shows one wrapper on `net.Socket.prototype.connect` sees `net`, `tls`, `http`, `https` and built-in `fetch`. The plan now states that and names both local Supabase ports; VR-13 gains the 54322 listener and in-process `tls.connect` and `https.request` controls | §4.7, VR-13 — v10-8g                                     |
| V67-03 | material       | Accepted: `quality:health` is defined (`tooling/quality/health.mts`, port of `health.mjs`, same probes); the six rules are scoped to the six UI workspaces in the full entry; TC-6 qualifies the probe mechanism                                                                                          | D12 W-UI step 2, TC-6 row — v10-8g; guide C3, tasks 10.5 |
| V67-04 | minor → raised | Accepted and strengthened: E72 shows Oxlint 1.94.0 writes `oxlint-suppressions.json` and then honors it with no notice. Its presence is now a permanent failure in `lint.mts`, `staged-guard.mts` and `verify:quality` (A1 onward)                                                                        | D3, D10, §7.1 A1 row — v10-8g; spec scenario added       |
| V67-05 | minor          | Accepted: REC-1 and PRUNE-1 listed as withdrawn. A scripted scan of every plan version found no other missing task ID                                                                                                                                                                                     | §10 Withdrawn — v10-8g                                   |
| V67-06 | minor          | Accepted: the three `verify:eslint` callers are named at CT-0a and removed at W-UI (confirmed: `package.json:160`, `ci-preflight.mjs:89`, `ci.yml:175`)                                                                                                                                                   | §8.2 CT-0a step 2, D12 W-UI step 3 — v10-8g              |

### reviews:r6-r9 (Claude Opus xhigh) — 4 findings, 1 material; 3 accepted, 1 already fixed

| ID      | Sev      | Decision                                                                                                                                                                                                                                                                                   | Where                                                                          |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| R6R9-01 | material | Accepted: a named format scope (D8), wider than the lint scope. CT-0b is `bun run format`, not a `fix.mts` run; the `oxfmt` replay runs the same command; D2 and VR-8 no longer contradict CT-0b                                                                                           | D2, D8, §8.2 CT-0b, §8.3 Writer and step 1, VR-8 — v10-8g; guide A5, tasks 6.7 |
| R6R9-02 | minor    | Accepted: every tool that lists or searches all tracked files streams or sets a 64 MiB buffer                                                                                                                                                                                              | D3 — v10-8g                                                                    |
| R6R9-03 | minor    | Accepted in a corrected form: the dead `$TURBO_ROOT$/eslint.config.mjs` input is removed from `tooling/eslint-config/turbo.json` at CT-0a; no replacement is needed because the file's `tooling/eslint-config/*.{mjs,json}` input already covers the bridge config (confirmed in the file) | §8.2 CT-0a step 2 — v10-8g                                                     |
| R6R9-04 | minor    | Already fixed: the audited snapshot predates v10-8b, which added `shell: false` for every chunked child and its VR-9 assertion (V89-05)                                                                                                                                                    | D3, VR-9                                                                       |

New evidence from this adjudication: E71 (socket hook coverage), E72 (Oxlint suppression file is honored silently).

### Batch 3: the six remaining audit units, adjudicated by plan area

The findings of the units assignment (ASG), lost:v1 (V1), reviews:r1 (R1), lost:v2-v3 (V23), lost:v4-v5 (V45) and handoff (H), 186 in all,
were assigned to seven plan areas by each finding's stated home. One drafting agent per area checked each finding against the current plan,
gave a verdict and drafted the edit; the coordinator reviewed every edit before applying it. Verdicts: already-present (the current plan
states it), accepted, accepted-changed (the gap is real and the suggested text was corrected), rejected.

Coordinator changes to the drafted edits: the fixed cap of eight implementation agents was removed (the delivery area had ruled for a cap of
four typed lints or typechecks instead); the sentence that a lint crash never reads as findings or as a pass was kept; the editor settings
(WF-6) moved from C4 to CT-0a and the `.vscode/tasks.json` task was dropped, with the gap for the two Query bridge rules stated instead;
one policy-rules edit was re-anchored because policy-tests had edited the same line. Cross-area proposals were applied by the coordinator.

#### tsrs-toolchain (GPT 6.2 Astra xhigh) — 30 findings

<!-- prettier-ignore -->
| IDs | Severity | Verdict | Decision in one or two sentences, with what you checked | Where the edit lands |
|---|---|---|---|---|
| ASG-01 | material | accepted-changed | D4 already binds the launcher and sets reference mode. E12 supports a memory advantage for reference on its apps-plus-packages workload, not a universal ranking; the edit retains the fast-mode dissent. | D4 Mode |
| ASG-07, V23-18, V45-39 | material / minor / minor (in ID order) | accepted | The raw-writer ban does not cover setup: the inspected 8.3.0 typed initializer adds tsgolint and older tool ranges. D1 rules out both setup commands without implying that the upgrade command was executed. | D1; §11 Cohort upgrades; WF-5 proposal |
| V1-32 | material | accepted | D1 pins the tools but did not specify a dedicated manual cohort upgrade; TC-1 said only that the format stays unchanged. The checked-in Bun lock has `lockfileVersion: 1`. | D1; TC-1; §11 Cohort upgrades |
| H-32 | material | accepted-changed | D2 rejects nested configs but did not test a competing discoverable Biome provider. Scope rejection to owned provider roots and any inspection of generated setup to scratch; no scaffolder run is required. | D1; D2 Guards; WF-5 proposal |
| ASG-10 | material | accepted-changed | The §2 counts and message differences already match E7/E12; what was missing was a repeatable coverage, reliability and cost comparison. Count checked files even when clean, distinguish backend peak from PF-1, and use pinned release metadata for tsgolint because FB-1 has no version banner. | D4 Mode; §7.4 TC-5; guide A6b; task 7.3 |
| V1-10, V23-22, V45-11, H-28 | material / minor / material / material (in ID order) | accepted | Compared v1 and v4/v5 with §7.4: the existing list does not freeze a nonzero commit or define which differences fail. Require the order, worker and semantic-reporting matrix, seeded controls, exact diagnostic keys, explained wording and compiler-version differences, and real safe-fix patch comparisons. | §7.4 TC-5; guide A6b; task 7.3 |
| ASG-12 | material | accepted-changed | Checked the root manifest and Bun lock: Prettier is direct today and also occurs through legitimate dependencies. Test removal of direct declarations and Core formatter callers, not the spelling in the lock or a requirement to retain those transitive packages. | D1 Retired; proposal Impact; §12.9 proposal |
| ASG-19 | minor | accepted-changed | D4, FB-1 and the guide already rehearse the pinned replacement; assignment §5B also requires a decision and honest handoff for an actual blocker. Apply the same rule to RB-1, recording any upstream report without making a third-party response a gate. | §11 Backend; FB-1; guide failure table |
| V23-27 | minor | already-present | D4 already says: “Then set `OXLINT_TSGOLINT_PATH`, the variable through which Oxlint finds its typed backend, to the absolute `tsrs-lint` launcher resolved above (never to the `tsrs` binary itself, E12), and set `TSRS_FAST=0`.” | No edit; D4 Environment |
| V1-09 | material | accepted-changed | D4 already binds the launcher and checks the observed child, but identity alone does not prove a typed rule ran. Require a typed-only finding and clean control, reject actual competing installs or shims rather than optional-peer lock text (v2 D4), and align the spec’s inherited-selector scenario with the scrub. | VR-2; typed-backend spec scenarios |
| V45-28 | material | accepted | E29 supplies the exact three native-banner fields. Parsing without comparing the pins would accept a plausible wrong commit, so VR-2 needs a wrong-field control. | D4 Identity; VR-2; typed-backend spec |
| V1-13 | material | accepted-changed | E18 and E22 distinguish valid aliases that used to crash from unsafe ones that must report the intended rule. Test both affected rules in the existing 15-case contract without treating unrelated diagnostics as failures or prescribing a new test path. | VR-1 |
| V1-24, V23-09, V45-36 | material | accepted | D4 already caps each process, but v1–v4 also assigned the flag and limited simultaneous typed runs. Apply the flag to every implementation agent and keep both Phase B caps under coordinator control. | D4 Resources; guide §2 |
| V1-30, H-30 | material | accepted | D3 handles chunked paths but did not preserve native JSON fields or test a later-chunk finding and failure precedence. The incumbent UI runner supports report files; inventory callers by engine rather than forwarding ESLint flags to Oxlint or removing supported flags from the bridges. | D3 Writer flags; TC-3; guide CT-0a |
| R1-14 | minor | accepted | The root manifest, `.node-version` and CI distinguish the supported Node/Bun runtime from the round-1 Node 24.22.1 qualification. Record the actual versions for TC-4, strict builds and final acceptance. | §§1–2 |
| V23-08 | material | accepted-changed | The v2/v3 measurement protocol survives the change of batch order, but A5 measures the CI lint job, not the full PF-1 workflow. Keep that timing separate from the A9 baseline, C1 rehearsal and C5 confirmation. | §7.4 PF-1; PF-1 glossary; guide A9 and verification table; task 10.2; §8.2 proposal |
| V45-10, H-29 | material | accepted | Checked v4/v5 and the handoff: paired cold/warm runs need matched inputs, cache hits excluded, real workflow costs and live-tree peaks. Rehearse before CT-1, retain the wall and memory limits for full lint, and reduce concurrency rather than coverage. | §7.4 PF-1; PF-1 glossary; guide A9 and verification table; task 10.2; §8.2 proposal |
| V45-17 | material | accepted | The D3 table distinguishes typed and unused-directive flags but omitted the common path-report flags. Test untyped and typed argument lists, an all-ignored clean path list, and a real warning. | D3 Entry and flags |
| V45-24, H-12 | material | accepted | E30 separates workspace output ignores from central child-directory ignores; E13 shows that the ESLint service caught all five invalid Query cases while the Oxlint plugin alone caught only one. Keep the public-dispatch and clean controls as conditions for retiring the Query bridge, independently of W-UI. | D3 lint:query; proposal Zero debt; VR-5 proposal |
| H-36 | material | accepted | The handoff identifies the bundled revision and pre-patch SHA-256; TC-2 recorded neither provenance nor license retention. Qualify upgrades against the dependency, preset and license diffs, including formatter, shadcn and harness controls when affected. | TC-2; §11 Cohort upgrades |

#### compiler-programs (Claude Opus 5.5 xhigh) — 27 findings

27 findings: 17 accepted, 10 accepted-changed, 0 already-present, 0 rejected. No cross-area proposal.
Edit files (in `plan-v10-edits\batch3\`): `compiler-programs-plan.txt` (23 edits), `compiler-programs-guide.txt` (5),
`compiler-programs-tasks.txt` (2), `compiler-programs-proposal.txt` (1). Each self-test printed `applied N edits`.

<!-- prettier-ignore -->
| IDs | Severity | Verdict | Decision in one or two sentences, with what you checked | Where the edit lands |
|---|---|---|---|---|
| ASG-18, V1-02, R1-01, V23-12, V45-03, H-21 | material (ASG-18 minor) | accepted-changed | The plan said only "the verifier, using an exact pre-release pattern". `scripts/verify/typescript-toolchain.mjs` (regex `^\d+\.\d+\.\d+$`, skips a workspace with no pin; already checks installed = declared, parser and API realpath, `lib/tsserver.js`, the `.bunx` shim) and its test (four drift negatives plus the shim cases) were read; the edit names the file, keeps every current check, adds the literal alias, the 16-workspace roster, physical resolution from every classic consumer (26 files at `e6a5ce81a`, all under `scripts/`, `tests/` or the root) and the new negatives, and VR-7 runs `tsc --version` through every launcher from a frozen install on Windows and Ubuntu and compiles the Base UI fixture through `@typescript/native/lib/tsc.js` (the `test:e2e:base-ui` path; E11 says 7.1-beta keeps it). Changed: no "21 platform packages" count (not checkable here; the per-launcher run proves the two binaries); H-21's smoke run of the five scripts is dropped, because classic 6.0.3 does not change and resolution is what TS-1 can break; V23-12's VR-5 parser clause is not needed, because the verifier already checks the parser's version and realpath and runs in `verify:workspace-contract` on CI. | §5.2 TS-1, §5.3, VR-7, §10 TS-1; guide A2; tasks 3.1 |
| V1-07, V1-08, R1-02, V45-12 | material | accepted | "Per-family capability multisets; Principal checked exactly" had no oracle. Read `compile-fail.test.ts` (substitutes a raw `path.join()` result into a module specifier; the negative regex matches only TS2322), `tests/fixtures/capability-registry` (classic tags TS2345 at `authenticated-context.ts:7`, TS2741 at `grant-subjects.ts:11`), `tests/unit/auth/capabilities/fixtures.test.ts` (classic API only) and Codex's round-1 table (native 7.0.2 and 7.1-beta report TS2741 at `resolve(auth)`). The edit gives the family table, exact multisets, forward-slash specifiers and an all-codes comparison. | §5.2 TS-1, VR-7, §10 TS-1; guide A2 step 1 and traps; tasks 3.1 |
| V1-01, V45-05 | material | accepted | RB-1 said what it keeps, not what it restores. §11 now states the one-commit reset of the 16 pins, the root alias `npm:typescript@7.0.2` (repo `package.json:237`), `bun.lock` and the verifier's expected versions, with typecheck required; §5.2 and VR-7 point at it. The family table already covers 7.0.2 (TS2741 on both native versions). | §11 compiler, §5.2 RB-1, VR-7; guide A2 step 4 and failure table |
| V1-33, V23-25 | material | accepted | The two Admin repairs were unnamed. Confirmed `mention-suggestion.ts` imports `Mention` from `@asym/ui/...rich-text-editor`, `support-store.ts:49` is the collection registry, and `apps/admin/package.json` has no `@tanstack/db`; the edit names both type forms (C R1) and forbids a new Admin `@tanstack/db` import. | §5.2 TS-1 |
| V1-36, V23-16, V45-38 | minor | accepted | TS-1 named only the rulebook, and WF-5 does not list these two documents. `docs/guides/typescript-6-readiness.md` describes the "stable native" compiler and `tooling/typescript-config/README.md` gives `lib` guidance, so both go stale at TS-1; the edit adds them to TS-1 with the content to state. | §5.2 TS-1 guidance bullet, §10 TS-1; guide A2; tasks 3.1; proposal Docs and skills |
| H-34 | material | accepted-changed | The document half is merged into the row above. Rejected half: a recorded disposition of DOM, distributive-conditional and Factory Console `esnext` risks, and a TS6-syntax caution. E11 compiled all 16 workspaces on 7.1-beta (only Admin's five TS2883, now repaired) and E58 the app validators, so any inference change surfaces as a diagnostic in a blocking program; TS-1 changes no runtime target (only adds `ES2023.Intl` to `lib`); syntax the classic parser cannot read would fail `lint:query` and the typed `verify:quality` checks. | as above |
| R1-06, V23-26 | material / minor | accepted | The root row had no `types` or `lib`. Confirmed 11 root files (six Playwright configs, five Vitest configs and helpers) and `toSorted` at `vitest.pin-workspace-packages.mts:59`; Codex round 1 measured three errors with the ES2022 library. The row now gives `types: ["node"]`, an ES2023 `lib` and the file set including the root Oxlint and Oxfmt entries. Target ES2022 is left out: `lib` is explicit and the program does not emit. | §5.4 root row, VR-11; guide A6 |
| V1-18 | material | accepted-changed | The Base UI fixture program was listed without its browser side. Confirmed the fixture has twelve `*main.tsx` entries loaded by its HTML pages and its `tsconfig.json` `include` lists four. Changed: the old "69 sources" count is replaced by the checkable entry rule, and VR-11 asserts it. | §5.4 directory-programs row, VR-11, §10 TS-2; guide A6 |
| V45-01 | material | accepted | The generator's failure rules and the bare-specifier resolution were lost. The edit adds a Failures bullet (two targets, a missing mapping, a test in no program) and the `ts.resolveModuleName`-from-every-declaring-workspace rule with one declaration realpath (E40, E41). | §5.4 `sync-test-programs.mts`, VR-11 |
| V45-21 | material | accepted | Confirmed `donor-pages.acceptance.test.tsx:130` pins Donor's `@/lib/mock-data` spelling, the Base UI fixture hand-maps `nuqs/adapters/react` (E40), and the only Bun-using TypeScript file under `scripts/` is `scripts/shadcn/add-shadcnuikit.ts`. The issue-2364 row maps Donor's `@/` and keeps those imports, `nuqs` is covered by the generated bare-specifier rule, the root gets Node types, and Bun types are confined to `scripts/shadcn/tsconfig.json`. | §5.4 rows and generated paths |
| V45-13 | material | accepted-changed | The current Discovery rule (a strict-only finding per program) does not show that typed lint follows an alias. Added a second pair per alias program (unawaited alias-imported promise fails `no-floating-promises`, awaited passes) and E41's `QueryClient` identity and `setPlatform("invalid-control")` controls to the sentinel list. Changed: the controls join the unsuppressed exact (file, line, code) list that round 6 adopted, not `@ts-expect-error` cases. | §5.4 sentinels and acceptance, VR-11 |
| V45-32 | material | accepted | The count-based ratchet kept "downward only and limited to the owner" but lost the explicit-file updater. The edit restores `typecheck:ratchet --update --owner <id> <files>` (named files only, downward, owned files per §8.4) and retires it with the file at CT-T; VR-11 refuses an update outside the owner or upward. | §5.5, VR-11, §10 TS-2 and CT-T; guide A6; tasks 10.4 |
| V23-15 | minor | accepted | v5 had "a second run is unchanged" and "reported unverified"; v6 dropped both with no section-0 entry. GEN-1a now reports a leg that runs nowhere as unverified, and GEN-1b's fixed-input test requires expected bytes and an unchanged second run. | §5.2 GEN-1a and GEN-1b, §10 GEN-1a; guide A2 step 4 |
| V45-19 | material | accepted-changed | Expected bytes and the second run are restored with V23-15. Changed: "regenerate the committed file from its recorded input" is dropped, because `scripts/generate-currency-foundation-types.mjs` reads Supabase CLI output passed as an argument and no such input is recorded in the repository; the committed file stays format-checked (D8, VR-8 already say so). | §5.2 GEN-1b |

#### policy-rules (GPT 6.2 Astra xhigh) — 35 findings

<!-- prettier-ignore -->
| IDs | Severity | Verdict | Decision in one or two sentences, with what you checked | Where the edit lands |
|---|---|---|---|---|
| ASG-16 | minor | accepted-changed | Assignment §5A asks about value and conflicts, not just whether a framework is present. The pinned presets confirm Playwright supplies only the fixture allowance; PL-1 records a reason for every optional preset and JS-plugin bundle, including adapted or deferred choices. | D6 layer 2; §10 PL-1; tasks PL-1; §13 cross-note |
| V1-06, V23-07, V45-02 | material | accepted-changed | The existing import composer warns that the last setting replaces inherited bans; the register page, app library and three independent scripts confirm the needed controls. Limit the health exception to its documented server probe in either layout, and require enforcement of dynamic imports without assuming the native rule covers them. | §4.3; VR-3; tasks PL-2 |
| V1-12 | material | accepted | D5 classified new disables but did not reject a rule-less one with a valid class and reason. Preserve exact legacy text and test both directive syntaxes. | D5 directive contract; VR-13; exception spec |
| V23-04 | material | accepted-changed | Require explicit rule names and a nonempty reason even on file-wide disables, and test both missing fields. Apply the new check to authored additions, not verbatim legacy conversions or unchanged vendored directives under D5. | D5 directive contract; VR-13; exception spec |
| V23-05, V45-20 | material | accepted | D5 limited locations without saying which TS directive could be used; §5.4 already forbids all suppressions in the resolution sentinels. Test the two unconditional bans and the description and location required for an expected error. | D5 guard 4; VR-13 |
| V1-19, R1-03, V45-22 | material | accepted | The donor-portal and email aliases both name `Record<string, unknown>` as JSON; D5 already assigns structural guards per workspace. Keep open aliases at ingress and test a rejected internal use as well as an allowed parse input. | §4.1 no-unsafe-dictionary-type |
| V1-20, V45-09, H-16 | material | accepted | The donate route parses `ensureJsonBody` with a separate schema; the shared handlers distinguish JSON syntax errors from schema errors. Pin that distinction through a real caller, retain tolerated recorded values and throw/fallback outcomes, and decode fetch responses with a schema. | §4.1 no-unknown-returns; §4.2 Schemas |
| V1-21, H-24 | material | accepted | The capability suite passes untrusted inputs through `Reflect.apply` and forwards the proxy receiver with `Reflect.get`. Keep both observable contracts and the authorization regression test; the zero-count reduce rule still needs an ownership limit before replacing copying with mutation. | §4.1 reflection and zero-finding rules |
| R1-04 | material | accepted-changed | The capability suite needs a forged caller and receiver-sensitive forwarding, not mandatory reflection or an automatic P3 for every utility. Allow an equivalent typed repair only with the same behavior; D5 restricts P3 to tested reflective validation. | §4.1 reflection |
| R1-05, H-06 | material | accepted | Projection validation checks runtime values even when its public types look trusted; `snapshot` inspects descriptors, rejects cycles and freezes the copy. Preserve defensive calls and distinguish disallowed prototypes from the explicitly permitted root case. | §4.1 no-known-value-widening; §4.2 Projection validation |
| R1-12 | minor | accepted-changed | The pinned React preset already sets `react/no-danger` to error. The only `dangerouslySetInnerHTML` mention found in apps and packages excludes that prop from `SafeHtml`; do not create a blanket or renderer exception for a sink that is not there. | D7 React |
| R1-16 | minor | accepted | The §4.1 row and GH-1 cover presence and order, but neither prevents a truthy status check from becoming an undefined-only check. Preserve the original predicate, including its empty-string case. | §4.1 no-conditional-empty-object-spread |
| V45-23, H-15 | material | accepted | The v10 shorthand “without index” does not protect filtered indices, skipped holes or the order of callback effects. Keep the two passes if a fused callback would change any of them. | §4.1 no-array-filter-map |
| V23-14, V45-26 | V23-14: minor; V45-26: material | accepted | The current §4.2 already specifies default sorting, but the other named rules lost their concrete tests for coercion, UTF-16, headers, DOM behavior and error class. Apply those checks to emitted changes and correct I/O types before removing conversions. | §4.2 Coercion, conversion and ordering; Behavior-changing rewrites |
| V1-35 | material | accepted | Compared D7 against the four app manifests and the handoff: scoping Next rules by path does not set `settings.next.rootDir`. Set the four roots relative to repository root and check a Next violation in each. | D7 Next; VR-4 |
| V23-24 | minor | accepted-changed | The handoff found that the native internal-link heuristic did not reproduce route-tree analysis. Set all four resolved app roots, but do not treat that setting as proof of link parity. | D7 Next; VR-4 |
| V23-13 | material | accepted-changed | The pinned React preset contains the hooks, dependency and globals rules; D6 intentionally adapts other React rules later. Compare the framework layer before those adaptations, then exercise full-policy `.ts` hooks in both app and package paths without changing D3’s other entries. | VR-4; tasks PL-2 |
| V45-04 | material | accepted | D6’s no-shrink rule and numeric-truthiness checks do not catch a missed file at first generation or a bad config glob. Restore the content signals and check every inventory member’s effective setting separately from the cross-area sentinels. | D6 Money scope; VR-4 |
| V45-35 | material | accepted | D5 and the runbook counted calls but did not compare new registered-guard calls to removed `typeof` sites within each slice. Use the two counts and negative tests for review, not an equality quota. | D5 Predicates; guide Phase B; §8.5 cross-note |
| H-05 | material | accepted-changed | `formatMoney` takes safe integer minor units, not a decimal-string argument; it constructs the exact string for `Intl` internally. The maximum safe USD cent input distinguishes the current `.91` output from `.90` after number coercion. | §4.1 no-chained-type-assertions; VR-13 Money |
| H-07 | material | accepted | The provider and its retry tests distinguish direct status, nested status, PostgREST codes and causes from retryable errors. Section 8.5 already requires a patch per redesigned retry property; the patch must fail the retry assertion. | §4.2 Query retries; VR-13 Fault-patch library |
| H-14 | material | accepted | D5’s existing guard handles Vitest bindings, not the Bun module-mock substitute identified in the handoff. Limit the additional binding check to authored Vitest suites; ordinary Bun scripts need no new subprocess rule. | D5 Mocks; VR-13 Mock evasion |
| H-33 | material | accepted | The profile component derives its callable from the library `render` prop and uses `state.pressed`; the chart passes owned rounded-bar renderers to Recharts’ `shape` prop. Protect inference and geometry without renaming external keys or exempting every shape name. | §4.1 no-shape-in-symbol-names; §4.2 Render-prop types |
| H-13 | material | accepted | D7 scoped Next by app but did not distinguish a deliberate document reload from a client transition. The handoff’s native-rule inspection supports retaining a boundary anchor with a reason and a navigation test. | D7 Next; VR-4 |

#### policy-tests (GPT 6.2 Astra xhigh) — 22 findings

<!-- prettier-ignore -->
| IDs | Severity | Verdict | Decision in one or two sentences, with what you checked | Where the edit lands |
|---|---|---|---|---|
| V1-04, V23-06, V45-08 | material | accepted | The §4.7 inventory lists two shims and eleven pins, but does not fail drift or require a reason, a named boundary and a direct test for a new shim. Checked v2–v5 §4.7 and the resolution and coverage settings in `vitest.config.mts`. | §4.7; VR-13 Mock evasion; tasks 4.6 |
| R1-10 | minor | accepted-changed | Allowlist replacements, not all resolutions: `vitest.per-importer-alias.mts` and `vitest.pin-workspace-packages.mts` legitimately resolve product imports to real source. The §4.7 Next and optional MapLibre recipes still need reviewed targets before use; they are not preapproved shims. | §4.7; VR-13 Mock evasion; tasks 4.6 |
| V1-11, V45-15 | material | accepted | D3 selects workspaces and VR-5 exercises central programs, but neither proves the five typed cases through both an app and a package. E13 identifies the cases; E30 confirms classic TS 6.0.3 resolution from a workspace, not an end-to-end Turbo run. | §4.4 Bridge rules; VR-5 |
| V1-17, H-25 | material | accepted | Checked all three Playwright configurations, the imported Base UI fixture and handoff §8.3. D7 and PL-2 do not fully specify the positive file scope, post-map empty-parameter override, four behavioral pairs or common-method clean control. | §4.5 |
| V23-03 | material | accepted-changed | Keep v2/v3’s rule order and blocking warnings, but qualify actual test/spec files rather than every file under the three directories. The gate checks warning exit, not a historical count of recommended warnings. | §4.5 |
| V1-22 | material | accepted | The §4.4 table delegates suite selection to PL-0; v1 §4.4 made the named owning suites mandatory. Confirmed the runtime identity, foundation, CRM domain-order, query-once and offline tests exist. | §4.4 Query and DB rows |
| V1-23 | material | accepted | The handoff and v1 §4.4 assign the eight findings to the two dependency rules; enabling the rules is not a review of cache semantics. Re-inventory at the slice base and record each disposition. | §4.4 Oxlint rules; guide Phase B step 2 |
| H-09 | material | accepted-changed | Checked the six owners named by the handoff against the CRM ordering test and the actual fetch inputs. The two infinite-grid refresh callbacks have three whole-result dependencies, not three callbacks; test the proposed `refetch` dependencies rather than prescribing them. | §4.4 Oxlint rules; guide Phase B step 2 |
| R1-11, V23-21 | minor | accepted | The round-1 Query review and v2/v3 §4.4 call for manual decisions on the same eight dependency findings. Check fetch inputs and invalidation rather than adding a function or an options bag; retain the GH-1 key goldens. | §4.4 Oxlint rules; guide Phase B step 2 |
| V45-33 | material | accepted-changed | The handoff distinguishes eight dependency findings from 96 historical `prefer-query-options` findings; v4/v5’s adjacent sentences do not put the eight under the deferred rule. Record dispositions for the eight without enabling the optional rule. | §4.4 Oxlint rules |
| H-04 | material | accepted | `packages/database/providers/query-client.ts` creates a client on the server and reuses one in the browser. The generic Query row omits a two-request isolation control, browser rerender stability, pagination and optimistic updates. | §4.4 Query row |
| H-08 | material | accepted-changed | The frozen-install identity test checks DB and QueryClient runtimes, and the adapter suite checks rollback. `query-once-helper` rejects unsafe ordering before I/O but delegates unsupported filters; preserve upstream results and errors rather than requiring blanket rejection. | §4.4 DB row |
| H-22 | material | accepted-changed | Checked the product app compiler configs, shared `useTable` adapter and virtualizer owners. Keep the named config, pilot and keyboard tests, but also exercise row resizing, scrolling and focus: config/source checks alone cannot prove remeasurement. | §4.4 Table and Virtual rows |
| H-23 | material | accepted | Checked `tanstack-form-accessibility` for pending submit and accessible label/error relationships. Require separate compile-time inference and owning form tests for async behavior and focus rather than treating a passing a11y suite as evidence for all three. | §4.4 Form row |
| R1-09 | material | accepted-changed | Round 1 identified a missing Payload repair class; the checkout has 18 literal deep-path mock calls in 17 test files, not 16 sites. Omit the stale count and require an Admin CMS adapter or equivalent E2E pilot, never a replacement alias. | §4.7 Other recipes; existing W-MOCK pilots row applies |
| V23-23 | minor | accepted | The current seam rule says only which commit comes first; v3 §4.7 requires the unchanged behavior tests to pass before rewriting them. | §4.7 Seam rules |
| V45-25 | material | accepted | Checked v4 §4.7 and the current W-MOCK-SB setup order. Separate production seams from assertion rewrites without separating the network guard from its required fetch-lifetime migration and controls. | §4.7 Seam rules |

#### formatting (GPT 6.2 Astra xhigh) — 23 findings

<!-- prettier-ignore -->
| IDs | Severity | Verdict | Decision in one or two sentences, with what you checked | Where the edit lands |
| --- | --- | --- | --- | --- |
| ASG-06, V23-11 | material | accepted-changed | D8 still enables `sortPackageJson` for trusted content, so managed CLI overrides are necessary. The adapter uses fixed API options and a trusted virtual filename, not CLI discovery flags; both managed paths must ignore source-local configs. | D8; VR-8; guide A4; tasks FM-1/FM-2; formatting spec |
| V1-03, H-01 | material | accepted | Compared v1 D8 and handoff §9.1 with the current D8: naming the two profiles does not prove identical managed bytes or prevent source-local Tailwind code from running. Require an unsorted managed package fixture and inert config markers. | D8; VR-8; tasks FM-1/FM-2; formatting spec |
| H-17 | material | accepted | Handoff §9.1 and its supplemental probes distinguish unsupported names from malformed supported input. FM-2 must exercise the pinned basenames and trusted virtual names for raw storage, and check formatter errors before writing. | D8; VR-8; task FM-2 |
| ASG-05, R1-07, V23-10 | material | accepted-changed | Assignment §5D and v2 §6.1 require owner-specific contracts, not a symlink or publication harness for every pure renderer. The actual Python producers use local stdin formatting; preserve that route with D8 flags and keep A4 qualification separate from CT-0a publication. | D8–D9; §6; VR-8; guide A4/A5; tasks FM-2/FM-3; formatting spec |
| V1-14 | material | accepted-changed | The compatibility module deliberately skips the raw plan template; the refresh script owns its fence normalizer. Preserve that order without moving the normalizer, and keep reviewed adapted hashes separate from raw provenance. | §6; VR-8; guide A4 |
| V45-18, H-19 | material | accepted | Compared v4 D8/§6.1 and the compatibility and refresh scripts: root formatting must use the managed policy on in-scope managed output, and a raw template fixture must reach the expected repaired Markdown and stay byte-identical on rerun. | D8; §6; VR-8 |
| H-02 | material | accepted | The chart safety overlay defines six replacements; the preview manifest names two templates and a helper. Check exact matches, drift and mixed-source rejection, reviewed normalized bytes and a clean rerun before changing any adapted attestation. | §6; guide A4; VR-8 |
| V1-15, H-03 | material | accepted | The audit updater checks every selected file list and byte before its atomic rename, and the refresh has staged rollback and symlink tests. The missing-formatter case alone does not prove that rejected inputs or a failed transaction leave published bytes and audit records unchanged. | §6; VR-8; guide A4; task FM-3 |
| V1-28, V45-30 | material | accepted | Checked both Python entrypoints, the three phase renderers and their root scripts: `verify:program-roadmap` checks both Python outputs, while the phase renderers support `--write`. Run the owner checks at cutover and leave Phase 25 and the protected roadmap source untouched. | §6; VR-8; guide A5; formatting spec |
| V1-29, H-20 | material | accepted | The root ignore file deliberately reincludes the UI SDK provenance file and excludes the one-entry-per-line ledgers; the OpenSpec renderer emits paired range markers. Exercise the real inclusion against an excluded sibling as well as inline syntax, ranges and noncontiguous numbering. | D8; VR-8; task FM-1; formatting scenario |
| H-18 | material | accepted | The Payload postprocessor loops over both candidate locations, fails if neither exists, and adds JSDoc export typing. GEN-1b needs fixtures for each location, both together and neither; its existing header-removal decision stands. | §6; §10 GEN-1b (covered by VR-7) |
| V45-31 | material | accepted | Compared v4 WF-5 with the schema-1 audit entries and updater: the updater requires one existing canonical record and updates only installed hashes for named skills. Seed the reviewed provenance before sync and limit this update to `--skill ultracite`. | D9 family 4; task WF-5 |
| V45-14 | material | already-present | “Each uses the emitted-import check: the ordered runtime specifiers of the `ts.transpileModule` output, under each file's resolved compiler options (§4.2), must be identical.” This covers runtime module specifiers of imports and re-exports; §4.2 names `verbatimModuleSyntax: true` and VR-13 exercises the non-default-options case (EV-02). | Existing §4.2, §8.3 and VR-13; no edit |
| V45-16 | material | accepted | V5 A7 required identical test IDs. Current §8.3 enforces them for M2 only; require parent/head equality for M1 using TID-1 per entrypoint on the same platform, with gated IDs compared in the integration job. | §8.3; §10 M1; guide A7; task M1; §8.2 cross-area note |
| V45-37 | minor | accepted | V4 and v5 explicitly excluded rule rewrites from blame-ignore; the general follow-up instruction in §8.3 could now include them. Limit entries to pure CT-0b and standalone M1. | §8.3; guide A7/A8 |

#### staging-hooks-ui (Claude Opus 5.5 xhigh) — 28 findings

28 findings: 1 already-present, 3 accepted, 24 accepted-changed, 0 rejected (parts of four findings are declined
inside their rows). Edit files: `plan-v10-edits\batch3\staging-hooks-ui-{plan,guide,tasks,spec,proposal}.txt`.
Cross-area proposals: `batch3\staging-hooks-ui-cross.md`.

<!-- prettier-ignore -->
| IDs | Severity | Verdict | Decision in one or two sentences, with what you checked | Where the edit lands |
|---|---|---|---|---|
| ASG-02, V23-01, V1-05, V45-27, R1-08, H-10, H-11, H-38 | material (H-38 minor) | accepted-changed | The plan already defines `quality:health` as the port of `health.mjs` with its probes, including `p-8` on `Button` naming `icon-xs` (D12 W-UI step 2). The real gap is that nothing carries the existing regression suites across the engine change: `tests/unit/scripts/design-system-*.test.ts` (12 files) already hold every control the auditors asked for, including broken theme or primitive discovery and a weakened rule (`design-system-health.test.ts:225-261`), a foreign component with a familiar name and Base UI namespace provenance (`design-system-resolution.test.ts:272,478`), scoped exceptions with adjacent non-exempt cases (`design-system-exceptions.test.ts`), the fix-guide link with a file-exists check (`design-system-messages.test.ts:61-68`, guide path at `design-system.mjs:11`), and the operational-warning failure (`design-system-command.test.ts:108`). Those suites import `tooling/eslint-config`, which W-UI deletes. Changes to the suggested text: W-UI ports the suites and their negative controls instead of the plan restating each probe, and the probes use a unique `mkdtemp` directory. "Force a fresh final run" is declined because lint has no result cache (D3). A separate final command table is declined because §7.1 already marks `lint:ui` and `verify:eslint` as ending at W-UI. | D12 W-UI step 2 (`quality:health` and a new "design-system suites" bullet); §7.1 rows `quality:health` and `lint:ox`/`lint:new`; §10.3 W-UI; tasks 10.5; guide C3; VR-4 and TC-6 in the cross-area note |
| ASG-21 | minor | already-present | §2: "the six UI workspaces (`apps/{admin,donor,missionary,factory-console}`, `packages/{ui,missionary}`) run `tooling/eslint-config/lint.mjs`". D12 W-UI: "The six rules are active in the full entry only for the six UI workspaces". This matches `design-system.mjs:14-22`. Factory Console enforcement from the root is a case in `design-system-lint.test.ts:101`, which the merged edit above now carries over. | none; the VR-4 Console sentinel is in the cross-area note |
| ASG-11 | material | accepted-changed | Real gap: `check:changed` linted only changed UI files, and `lint.mjs` skips non-lintable files, so a removed theme token in `packages/ui/styles/globals.css` reported nothing. Today's cached Turbo `lint` inputs catch that change (`tooling/eslint-config/turbo.json`: `packages/ui/**`, `packages/missionary/**`, `tooling/eslint-config/*`, the patch), but the plan makes lint uncached. CI is unaffected, because `lint:ui` and `lint:ox` run whole scopes there. Changes to the suggested text: a policy-input change also widens the untyped report, and the suggested health run in the staged runner is declined, because pre-commit reports only staged files and the health probes cannot see a token that an unchanged file uses. | §7.1 `check:changed` row; VR-6 |
| ASG-08, V1-34, R1-15, H-27, V23-19 | material (R1-15, V23-19 minor) | accepted-changed | D11 named settings without files or values, and WF-6 had no verification. Checked: `.vscode/` is not tracked and not ignored, and `.gitignore:67` ignores only `.cursor/settings.json`. Root `typescript` 6.0.3 ships `lib/tsserver.js`; the workspace 7.0.2 package has no tsserver. Changes to the suggested text: WF-6 runs at C4, after W-UI deleted the bridge, so the suggested `eslint.options.overrideConfigFile` pointing at `bridge.config.mjs` would name a deleted file; editors set `"eslint.enable": false` instead. The two Query rules reach the editor through a `lint:query` task. Untyped editor lint was already stated in D3's table ("agent hook, editors \| full \| full \| no \| no"). `[mdx]` is covered by "each language Oxfmt formats". V23-19's `env.MCP_TIMEOUT` half is closed in the next row. | D11 Editors; §10.3 WF-6; tasks 10.11; guide C4; proposal Impact |
| V1-31, R1-13 | material (R1-13 minor) | accepted-changed | Real gap: D11 names the registration files but does not require their other content to be kept. Checked: `.claude/settings.json` holds `$schema` and `env.MCP_TIMEOUT: "120000"`; `.codex/config.toml` holds MCP servers and a generated "BEGIN Samson native role configuration" block (line 23); `.codex/hooks.json` does not exist at base (E1). Change to the suggested text: "`.codex/config.toml` untouched" became "its MCP servers, roles and generated block unchanged", so that a setting WF-7 finds Codex needs to load project hooks is not ruled out. A `.cursor/hooks.json` that WF-7 selects is covered too. | D11 Registration and observation (new bullet); VR-10 Safety; §10.3 WF-2; guide C4 |
| H-26 | material | accepted-changed | Real gap: WF-7 did not record the trust or permission state, and nothing forbade relaxing it to make a hook load. Added: each observation records the profile, project trust and permission mode as normally used, and nothing is relaxed. The suggested Antigravity end-to-end run is declined: Antigravity is documented as explicit-command only, and an explicit command's output reaches the agent that ran it. The "retain MCP and role settings" part is closed in the row above. | D11 WF-7 bullet; VR-10 WF-7; §10.3 WF-7; tasks 10.12; guide C4 |
| ASG-23 | minor | accepted-changed | The 100-second ceiling is settled (arbiter ruling 2, D11 "Time budget"), and the hook is untyped and runs only the `m1` policy. Measurement was missing: WF-7 now records the hook's wall time, and the VR-9 rehearsal and a typical commit record the pre-commit runner's time with PF-1. A new budget set at WF-2 from those measurements is declined, because it would reopen the settled 100-second budget. | D11 WF-7 bullet; VR-9 Staged runner; VR-10 WF-7; §10.3 WF-7; PF-1 line in the cross-area note |
| V45-34 | material | accepted-changed | Real gap: D11 makes a missing tool quiet but did not forbid a global binary from `PATH`, which could lint with another version and policy. Change to the suggested text: under arbiter ruling 2 a checkout without dependencies gets `{}`, not refusal JSON, so the control expects `{}`. | D11 feedback contract; VR-10 Safety; §10.3 WF-2 |
| V1-16 | material | accepted-changed | Real gap: VR-9 only checked that a partial stage was rejected. It now requires the refusal before anything is written, the path named, and unchanged index and working-tree bytes, plus an unsupported-only stage. The suggested report-only case is already covered: VR-9 "`prefer-template` and `prefer-spread` sites stay unchanged under the hook", and the spec scenario "the hook leaves the file's code as the author staged it". | D10 step 1; VR-9 Hook outcomes; spec (pre-commit scenario) |
| H-31 | material | accepted-changed | Real gap: D10 skipped a nonexistent explicit path and exited 0 on an empty result, so a misspelled target reported success. Now a nonexistent path exits 2 before any write; `bun run fix` with no paths exits 2 and never falls back to batch mode; the agent hook drops paths that no longer exist, so a deleted file never becomes an error. The same rule for `lint.mts` (TC-3) is in the cross-area note. | D10 Targets; D11 Paths; VR-9 Writer controls; §10.1 FIX-1; spec (fix requirement and new scenario) |
| V45-07, V45-29 | material | accepted | Confirmed: E36 shows fix-kind metadata comes from `oxlint --rules --format=json` (native rules). The anti-slop rules run as a JS plugin (E23 measures "the anti-slop JS plugin"), so a metadata filter drops `require-readable-spacing` (plan v4 listed it explicitly for that reason). A subset-only test would not notice. The "Vitest pair" was undefined; v4 and v5 §8.3 name `vitest/consistent-test-it` and `vitest/padding-around-test-blocks`. The §8.3 M2 bullet resolves through the D10 definition, and "one rule per batch" already makes them two batches. | D10 `fix` policy and composition test |
| V1-27 | material | accepted-changed | W-UI and §8.5 asked only for "screenshots", with no baseline and no order. Now: `packages/ui` first, then consumers; paired Playwright captures before the first repair and after the last under the same viewport, theme and data; the a11y suite; each visible difference reviewed. Change to the suggested text: "preserve semantic tokens" became "differences reviewed", because the fix guide sends a new color to a purpose-named token in `globals.css`; Base UI behavior is held by the ported resolution suite (first row). | D12 W-UI step 1; §10.3 W-UI; tasks 10.5; guide C3; §8.5 in the cross-area note |
| V23-20 | minor | accepted-changed | Checked: `lint:admin` and the other per-app scripts are `turbo run lint --filter=<pkg>` (`package.json:39-42`), and D3 keeps `lint:query` as its own Turbo task, so `lint:<app>` would skip the Query rules. Added a §7.1 row: `turbo run lint lint:query --filter=<app>`. `validate:full` needs no edit: it runs `bun run lint` (`package.json:160`), which includes `verify:quality`, and the plan already names it at CT-0a step 2 and W-UI step 3. | §7.1 `lint:<app>` row |
| V45-40 | minor | accepted | Checked: root `turbo.json` has no `globalDependencies`. Plan v4 rejected them, and no later version reversed that. A global input would invalidate every cached package typecheck on each policy edit. Explicit inputs, the uncached lint task and the §7.1 selection rules already cover policy changes. §7.3 and §13 are outside this area. | cross-area note (§7.3 or §13 Rejected) |
| H-35 | material | accepted-changed | Mostly already enforced: `tests/unit/docs/agent-instruction-routing.test.ts:18-19,191-202` checks 16,384 bytes, 200 lines and the `<!-- BEGIN:nextjs-agent-rules -->` block at offset 0, and root `CLAUDE.md` is exactly `@AGENTS.md`. WF-5 said only "byte budget", while CT-0a step 4 updates that very test. WF-5 now names the test and its limits so the update cannot loosen them. | §10.3 WF-5 |

**Coordinator decisions:**

1. D11 now sets `"eslint.enable": false`, because WF-6 runs at C4 after W-UI. If the owner wants editor settings during the bridge period, WF-6 must move before CT-0a and point ESLint at `bridge.config.mjs`.
2. `.vscode/tasks.json` (the `lint:query` task) is a new tracked file. Drop it if editor Query feedback is judged unnecessary; H-27 then becomes a rejection.
3. Whether Codex needs a `.codex/config.toml` setting to load project hooks is left to WF-7 to observe. The plan only protects the file's MCP servers, roles and generated block.

#### delivery-process (Claude Opus 5.5 xhigh) — 21 findings

21 findings: 1 already-present, 3 accepted, 17 accepted-changed, 0 rejected. Edit files are in
`batch3\` (`delivery-process-plan.txt`, `-guide.txt`, `-tasks.txt`). No spec or proposal edit:
none of these findings changes a durable toolchain requirement.

<!-- prettier-ignore -->
| IDs | Severity | Verdict | Decision in one or two sentences, with what you checked | Where the edit lands |
|---|---|---|---|---|
| ASG-03 | material | accepted-changed | The plan named no model or effort for implementation and review delegates, and C5 asked for "the independent final review" in the singular; only guide §1 had the mix. The suggested text set Astra at max, which is the council setting, not the implementation setting (settled decision 6). I used the settled mix and refusal rule, and required at least two final reviewers on different providers, as assignment §9 asks for "independent reviewers". | plan §8.4 (Delegates), §10.3 Close-out; guide §6 C5; tasks 10.16 |
| ASG-04 | material | accepted-changed | D4 defines `CORE_LINT_PARALLEL=1`, but no rule said when it applies or how many heavy checks may run at once. I dropped the fixed cap of 8 delegates and the PF-1 change (PF-1 is in §7.4, outside this area, and its budget is per run). I kept a cap of four typed lints or typechecks, which matches the cpus/4 thread rule and the four default checkers (E4, read). | plan §8.4 (Concurrency); guide §2 rule 9 |
| ASG-09, H-39 | material | accepted-changed | VR-12 had no cache rule, no recording rule, no integration tier and no `verify:openspec-deltas`. Checked in the repository: `ci.yml:47` sets `TURBO_TOKEN`; `ci-integration.yml` runs `cms:qualify` in `migrate` (lines 124–127) and ends in `integration-gate`; `ci.yml` ends in `ci-gate`; both run on pull requests and dispatch only, so the CI leg is "on the pull request, or dispatched on the branch". The integration tier is reached through that CI job, which has the services. From H-39 I kept the reviewed-commit identity and the local, remote-CI and unrun distinction. I rejected its throughput pilots: the plan never treats finding counts or lint time as evidence of quality (§1, §12, VR-13), and A9 already sizes slices. | plan §9 VR-12; guide §6 C5, §9; tasks 10.15 |
| ASG-13 | material | accepted-changed | Deferred to the coordinator's requirement map (settled decision 7). No edit written. | — |
| ASG-14 | material | accepted | Neither the plan nor the guide said that the review comes before the affected batch continues, or when the full score reopens. Guide §8 had only "record, update, focused review". I shortened the suggestion. | plan §8.1 (Plan amendments); guide §8 last row |
| ASG-15 | material | accepted-changed | The six statuses and the rule that a delegate's report is not verification were in guide §1 (Tracker) and in the `tasks.md` preamble ("checked only when its verification has been run on the integrated tree"). The plan's §10 preamble said only "status and evidence". I added one sentence there. | plan §10 preamble |
| ASG-17 | minor | accepted-changed | The [U] class has been missing since v5. I added it to Conventions and relabelled §14's harness-feedback claim (documented upstream, not yet observed) as [U]. I left D4's E4 fast-mode statement alone: D4 is outside this area, and it already fixes the mode as "reference", with TC-5 comparing the modes. | plan header Conventions; §14 |
| ASG-20, V1-25 | minor; material | accepted-changed | The plan required disjoint paths, but not separate worktrees or a common base, and packets did not carry the plan version, base commit, dependencies or commands. The "one branch, one pull request" half of V1-25 is already in D13 (see V23-28). I wrote "the base commit its packet names", not "the A9 commit": the W-MOCK seam commits land after A9, and slices that use them must start from them. | plan §8.4 (Slices), §10.1 INV; guide §1 |
| ASG-22 | minor | accepted-changed | §12 covered only what is already listed in `retired.json`. The suggestion listed `m1` for deletion, but the agent hook runs the `m1` policy permanently (D11). `rebind-notes/` and `amendments/` also stay, because the rebind-integrity check activated at A1 keeps using them (§7.1). So the edit states the rule: delete and list, or keep with a stated role. It gives one true example and requires the RS-PACK entry to be reported as unfinished if the pack has not shipped. | plan §12 item 9; guide §9; tasks 10.17 |
| ASG-24 | minor | accepted-changed | Close-out pointed at "the assignment's section 10", which the public repository does not contain (header). Guide §9 lacked efforts, substitutions, the native, T3 and editor workflow, unfinished goals and fallbacks. I put a paraphrased list in Close-out and named the versions through D1 instead of repeating them. §15's row is left for the coordinator's map. | plan §10.3 Close-out; guide §6, §9; tasks 10.17 |
| ASG-25 | minor | accepted-changed | The header already identifies the handoff by date and SHA-256. I confirmed that the attachment hashes to exactly that digest (`1ba77b0e…2c20`). Added the C5 re-check. I named no file, because the handoff is identified by digest and no local path may appear. | plan §10.3 Close-out; guide §6 C5; tasks 10.17 |
| V1-26 | material | accepted-changed | The seams-first order stands (§8.2 B row). However, "representative" is undefined, and nothing stopped a slice from using an unpiloted recipe; guide §5 even runs pilots and slices in parallel. I added the precondition to §8.5, the guide and `tasks.md` 9.4. The named pilot cases belong in the W-MOCK pilots row, which another area owns, so they are a cross-area proposal. | plan §8.5 (Mock redesign); guide §5; tasks 9.4; cross-area |
| V1-37 | minor | accepted | §8.2 ended at "reported as skipped", and guide rule 8 said only "wait". Added the retry, and the rule that neither the offline refresh nor a skipped attempt counts as network proof. | plan §8.2 checkpoints; guide §2 rule 8 |
| V23-02, V45-06 | material | accepted-changed | The transition gate had no completeness criterion. Checked in `tooling/eslint-config`: at `error` are `restrictedImports()`, `import-x/no-duplicates`, TS-ESLint `flat/recommended`, `react-hooks/rules-of-hooks` and `exhaustive-deps`, and `eslint-config-next/core-web-vitals`. At `warn` are `import-x/order`, `unused-imports/*`, `no-unused-vars`, `consistent-type-imports` and `no-explicit-any`. No lint command passes `--max-warnings`. I corrected the scope: no `tooling/*` workspace has a `lint` script, so the incumbent scope is the 16 workspaces' lint targets. I dropped the `--deny-warnings` rationale. PL-0's inventory duty goes to that row's owner as a cross-area proposal. | plan §8.2 Transition gate; cross-area (PL-0) |
| V23-17 | minor | accepted-changed | The package rename is a handoff recommendation (handoff lines 13, 939, 943) with no disposition; it now has one under §13 Changed. The environment-only fallback is already covered by §13 Rejected ("co-installed tsgolint") and D4 ("FB-1 (a replacement transaction…)"). `globalDependencies` came from plan v1 and v2, not the handoff, and v3 rejected it; one §13 Rejected line keeps it out. I did not add the §7.3 line, which is outside this area; the rejection is enough. | plan §13 Changed, Rejected |
| V23-28 | minor | already-present | D13, row for #2711: "This change reaches develop only through its close-out pull request (C5), so #2711's structure is always on develop first." | — |
| H-37 | minor | accepted | The handoff's preset table (lines 574–578) gives dispositions for Router/Start, the React Doctor/GitHub/SonarJS bundle, TSDoc, gdp-ts and other presets; the plan had none. Added them to §13 Rejected and Deferred. React Doctor rule promotion stays deferred to its own change, as §13 already says. | plan §13 Rejected, Deferred |
| H-40 | minor | accepted-changed | Issue #54 was absent from the plan. Added a [U] risk in §14, measured by M1 and PF-1 and tied to the hook's 100-second budget, since the hook runs the same fix. The PL-3 disposition list (§4.1 and the PL-3 row) belongs to another area, so it is a cross-area proposal. | plan §14; cross-area (PL-3) |

### reviews:r2-r5 (GPT 6.2 Astra xhigh) — 31 findings, 27 material; adjudicated by the coordinator after batch 3

<!-- prettier-ignore -->
| ID | Sev | Verdict | Decision | Where |
|---|---|---|---|---|
| R25-01 | material | accepted | `verify:service-role-clients` passes unchanged and the allowlist is never widened for a mock redesign | §4.7 Supabase recipe |
| R25-02 | material | already-present | The capability fixtures are exact per compiler family (batch 3, compiler-programs) | §5.2 |
| R25-03 | material | already-present | PF-1 compares develop and the candidate on the real workflow, with a C1 rehearsal before CT-1 (batch 3, tsrs-toolchain) | §7.4, §8.2 |
| R25-04 | material | already-present | RB-1 states what it returns to 7.0.2 and what it keeps (batch 3, compiler-programs) | §11 |
| R25-05 | material | already-present | D4 names `OXLINT_TSGOLINT_PATH` (EV-03) | D4 |
| R25-06 | material | already-present | The tiers have concrete path scopes and the named controls (batch 3, policy-rules) | §4.3, VR-3 |
| R25-07 | material | already-present | The Query bridge config ignores build output, coverage and generated Payload types, with a control (batch 3, tsrs-toolchain) | D3, VR-5 |
| R25-08 | material | already-present | The typed pair depends on an alias-imported function (batch 3, compiler-programs) | §5.4 |
| R25-09 | material | already-present | A non-JSX `.ts` hook must fire `rules-of-hooks` and `exhaustive-deps` (batch 3, policy-rules) | VR-4 |
| R25-10 | material | accepted | PL-0 maps every incumbent `error` rule with its scope to a replacement, the bridge, a verifier, or a reasoned gap or retirement | PL-0 row, §8.2 |
| R25-11 | material | already-present | TC-5's cases and its definition of parity are stated (batch 3, tsrs-toolchain) | §7.4 |
| R25-12 | material | already-present | Generators: expected bytes and an unchanged second run (batch 3, compiler-programs and formatting) | §5.2, GEN-1b |
| R25-13 | material | already-present | The two Vitest fix rules are named (batch 3, staging-hooks-ui) | D10 |
| R25-14 | material | already-present | M1 requires identical test IDs (batch 3, formatting) | §8.2 A7, §8.3 |
| R25-15 | material | accepted-changed | P4 shim admission was already restored by policy-tests; `next/font/local` is recorded as a compile-only candidate | §4.7 |
| R25-16 | material | accepted-changed | `core/no-trivial-type-predicate` also reports a body that never reads its parameter; slice ledgers list each new predicate with its negative test | D5, §8.5 |
| R25-17 | material | accepted | Numeric and nullable variants were restored by policy-rules; `Map`/`Set` also stay out of values passed from a Server Component to a client component | §4.2 |
| R25-18 | material | accepted | The slice map is checked against `git ls-files`: one owner per tracked file, files without findings included | INV row |
| R25-19 | material | already-present | Every path-scoped report passes the three flags, tested independently (batch 3, tsrs-toolchain) | D3 |
| R25-20 | material | accepted | Oxfmt takes the paths in the format scope; lint and the report take only JS/TS-family paths in the lint scope | D10 step 4 |
| R25-21 | material | accepted | The one incumbent exception for the nine vendored files, `react-hooks/exhaustive-deps`, carries over and reaches no adjacent file (checked in the root ESLint config) | D6 V |
| R25-22 | material | accepted | Tests reach Zod through generated paths; the script and tooling guard owners are hand-written | D5 guard 2 |
| R25-23 | material | already-present | Only a described `@ts-expect-error` in allowlisted negative-type tests (batch 3, policy-rules) | D5 |
| R25-24 | material | accepted | Banner pins were restored by tsrs-toolchain; the FB-1 digest is looked up by the exact `<os>-<arch>` package | D4 |
| R25-25 | material | already-present | Only CT-0b and the standalone M1 commit are blame-ignored (batch 3, formatting) | §8.3 |
| R25-26 | material | accepted | No Turbo `globalDependencies` (delivery-process); VR-6 gains the control that a bridge-policy change leaves an unrelated cached typecheck valid | §13, §7.3 |
| R25-27 | material | accepted | Fixtures for `.call`, a bound mock method and a template-literal member access | VR-13 |
| R25-28 | minor | already-present | `validate:full` is one of the three named `verify:eslint` callers (V67-06) | D12 step 3 |
| R25-29 | minor | already-present | The schema-1 `ultracite` record is seeded in `docs/ai/skill-source-audit.json` before sync (batch 3, formatting) | D9 |
| R25-30 | minor | accepted | CT-0a names the two files with duplicate motion imports (both exist) | §8.2 CT-0a step 5 |
| R25-31 | minor | accepted-changed | The reasons for the two nullable options are stated; the `no-array-sort` reason is already in principle A | D6 E |

Verdicts: 11 accepted, 17 already-present, 3 accepted-changed.

### Totals

Eleven audit units reported 253 findings (179 marked material by their auditors). Every finding has a row above.

## 8. The final consistency check

By the time the audit was folded in, the plan had taken about 200 edits from eight authors in a few hours. Before freezing it, five independent readers each hunted one kind of defect in the candidate. This was a defect hunt, not a scored review, and it reopened none of the settled decisions.

| Unit                   | What it checked                                                                                          | Reader                 | Blocking |  Minor |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------- | -------: | -----: |
| Round-10 coverage      | every finding and sub-item of the three round-10 reviews, against its decision, its task and its control | GPT 6.2 Astra, xhigh   |       17 |      1 |
| Internal consistency   | cross-references, contradictions between sections, stale text, the order of work                         | GPT 6.2 Astra, xhigh   |       28 |      2 |
| Companions and hygiene | the guide, the task list, the spec delta, the proposal, and the eight assembled files                    | Claude Opus 5.5, xhigh |       13 |     17 |
| Repository facts       | every named file, script and setting at the base commit; batches A1 to A5 walked as the implementer      | Claude Opus 5.5, xhigh |        6 |     11 |
| Requirement map        | 389 clauses of the owner's assignment                                                                    | GPT 6.2 Astra, xhigh   |        7 |      4 |
| **Total**              |                                                                                                          |                        |   **71** | **35** |

Every finding was accepted. The fixes that changed what an implementer would build:

- **The first batches can be executed as written.** `verify:quality` gets its own task (VQ-1). A first Oxlint root config lands in A1, because the backend identity check needs one. The Ubuntu identity check runs in WSL at A1 and becomes a CI step at the cutover. The mechanical-batch verifier is built in stages, each with the writer it replays. The Shadscan rebind list is taken from the ledger, which cites 145 files, not seven.
- **The staged runner never writes a working-tree file.** The candidate refreshed the working file after formatting, and conceded that an editor saving at that instant could lose its save. It now publishes only the index.
- **The network guard covers a child whose environment was replaced.** The candidate claimed every descendant was guarded while its own evidence showed one case that was not. The guard module now wraps `node:child_process` (E75). Proxy exemptions are limited to registered ports (E76).
- **The numeric-truthiness check works per finding,** so a wrong repair cannot be offset by a correct helper call elsewhere in the file.
- **A test link is credited only with coverage from the test it names,** and a fault patch must keep failing in every test that protects its function, not just one.
- **Integration suites are bound to the job that runs them,** and the two live Stripe suites are selected explicitly, so that excluding them from the unit run cannot silently drop them.
- **W-UI-b is the coordinator's commit,** because it edits files only the coordinator may write.
- **The record says what the evidence shows.** The candidate said each hard gate had "executed evidence". What exists is a reproduction of each failure and a prototype or qualification of each fix; the controls that prove a fix in the repository are tasks of the plan.

Where the coordinator did not take a reviewer's proposed fix, it took a simpler one that closes the same defect:

- For the edit hook re-sorting a manifest that an agent is still editing, the hook's formatter runs with all sorting off, instead of a preview step that proves each change is layout-only.
- For test-link coverage, the exact per-test measurement applies to links that a slice or a commit range touches; untouched links keep a cheaper per-file re-check.

One leak was found and removed: an evidence entry named a private note file and a conversation title.

**These fixes were not read again by an independent reviewer.** The coordinator applied them and checked them mechanically: every edit applied to the text it targeted, and the assembled change passes strict OpenSpec validation, the delta check, the formatter and the documentation tests. The first implementation batch re-checks every repository fact at its own base.

## 9. Decisions left for the owner

None of these blocks batch A1.

- **Accessibility lint.** Pull request #2725 carries an unratified OpenSpec change, `enforce-jsx-a11y-lint`, that would add accessibility rules to the ESLint configuration with a new debt baseline. This plan retires that configuration and carries the native `jsx-a11y` rules in Oxlint. Until the owner rules, the plan treats the Oxlint rules as the home of accessibility lint (D13, section 14 of the design).
- **The owner's documents.** The research handoff and the assignment are not copied into this public repository. The plan identifies the handoff by its digest. The owner may add them.
- **The live Stripe suites.** They run only with a test-mode credential that the owner authorizes for CI. Without one, each run is recorded as not having taken place.
- **A product follow-up.** Showing a `$0` gift amount where the interface shows nothing today is a product change; the plan keeps today's output and files the question as a follow-up.

## 10. The simplification review and plan v11 (19 to 20 November)

Sections 1 to 9 above are kept as written. They record the council on plans v1 to v10. This section records what
happened next. Plan v10 is no longer the design of this change; it remains in the change's git history.

**What prompted it.** After ratifying plan v10, the owner said it might be over-engineered or needlessly complex and
asked for a review. The record supported the concern before any reviewer read a line: the plan had grown from 50 KB
to 277 KB, the mean score had not moved since round 3, every round had rewarded finding a gap, and the last
doubling, from v9 to v10, came from an audit that restored 253 items and was never scored.

**Who reviewed, and what they were asked.** Nobody was asked for gaps. Three reviewers were each asked only what
could be removed without losing something the assignment requires. A fourth was asked the opposite. A fifth ruled
on scope.

<!-- prettier-ignore -->
| Role | Asked to | Model, effort | Result |
|---|---|---|---|
| Lean plan | write the smallest plan from the assignment alone, then compare it with v10 | GPT 6.2 Astra, xhigh | about half the mechanisms and 25 to 35% of the effort removable |
| Inventory | list every mechanism v10 creates and mark it temporary or permanent | Claude Opus 5.5, xhigh | 300 mechanisms, 106 added by the council; cut or defer 69, simplify 77 |
| End state | describe what a maintainer inherits, the fit with the owner's other open changes, and scope | Gemini 4 Neon, xhigh, on Antigravity | of 32 groups keep 2, simplify 14, cut 12, defer 4 |
| Skeptic | show that each of 17 proposed decisions does harm or breaks a clause of the assignment | Claude Opus 5.5, xhigh | none refuted; a condition on twelve |
| Arbiter | rule on three questions of scope | GPT 6.2 Astra, xhigh | below |

The coordinator (Claude Fable 5.2) wrote the proposed decisions and plan v11. It did not rule on the scope questions.

**Interruptions, all recovered.** One Claude subscription reached its weekly limit and stopped the inventory review
before it wrote anything; it was run again on another subscription with the same brief. The arbiter's first run
returned an acknowledgement and no ruling; it was run again with the same brief.

**The skeptic's conditions,** all adopted in plan v11:

- the pre-commit hook becomes a read-only check, because with Core's current flags it commits lines the author did
  not stage (measured; evidence E79);
- the lint gate is one uncached run from the root, because pull-request CI selects and caches lint by workspace;
- a rule the repository enforces today is never switched off, and each one is shown to fail through Oxlint before
  ESLint is retired;
- the pending list has an owner, cannot grow, and an entry leaves it only with a seeded violation that fails;
- a mechanical commit is replayed once by its reviewer, because the formatting commit refreshes pins that exist to
  show security tests were not edited;
- the one backend comparison is run while there are still findings to compare;
- unused-directive errors come from the command line on the typed run, after the pending list is empty;
- the proof that TSRS runs goes through every entry point that runs typed lint, and the launcher clears inherited
  backend variables;
- typecheck stays cached, with one demonstration that it reruns after four kinds of change;
- the config smoke test also checks that every tracked source file is linted or ignored with a reason;
- the requirement map, the per-rule policy, the list of accepted, rejected and deferred recommendations and the
  score history stay, and the evidence and council records are only appended to;
- test names, and the Playwright list for changed specs, are compared before and after on one platform.

**The arbiter's ruling** (design L6, L9, L10):

1. The full policy on product code; profiles for tests and scripts, with an exemption only where its reason would
   hold in a new, clean file. Module mocking is enforced in this change. The coordinator had recommended deferring
   it and was overruled.
2. Root configuration, scripts and tooling are compiled now. Central tests get strict lint-only programs with
   controls; compiling them is the named follow-up "Central test compiler coverage".
3. The six shadcn rules stay on the ESLint bridge. The legacy repair and the ledger's retirement stay with
   `integrate-design-system-lint`.

**The owner's instruction:** "update the plan and proceed."

**What plan v11 is.** A design of about 56 KB in place of 277 KB; section 11 of the design lists each removal and
what stands in its place. It keeps the tools and versions, the crash patch, TSRS, the compiler upgrade, the
Prettier-compatible formatter, the formatter consumers, the Query bridge, the per-rule policy and a zero-debt end
state. Plan v11 was not scored by the council, and no claim is made that it would pass the assignment's rule.

**What this record does not establish.** The reviewers' estimates of removable effort are judgments, not
measurements, and they differ by a factor of two. The skeptic ran small experiments, not the gates. The conditions
it attached are written into the plan and are checked only when the tasks that carry them are done.

**Decisions left for the owner** (replacing the list in section 9): the unratified `enforce-jsx-a11y-lint` proposal,
which targets the ESLint configuration this change retires; whether the research handoff and the assignment are
added to this public repository; and the product follow-up on showing a `$0` gift amount. The live Stripe suites of
section 9 no longer arise: plan v11 adds no such suites.
