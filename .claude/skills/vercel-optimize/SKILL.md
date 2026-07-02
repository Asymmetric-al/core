---
name: vercel-optimize
description: "Use for Vercel cost and performance optimization on deployed projects, especially Next.js, SvelteKit, Nuxt, and limited Astro apps. Collect Vercel metrics, usage, project config, and code scan results first; investigate only metric-backed candidates; produce ranked recommendations grounded in verified files and version-aware Vercel/framework docs. Trigger for Vercel bill reduction, slow or expensive routes, caching opportunities, Function Invocations, Build Minutes, Fast Data Transfer, Core Web Vitals, Bot Management, Fluid compute, or cost breakdown requests."
metadata:
  version: "1.1.0"
---

# Vercel Optimize

Run an observability-first Vercel optimization audit. Do not inspect source files until `signals.json` exists and a deterministic gate points to a route, file, or project setting.

Core doctrine: read [references/doctrine.md](references/doctrine.md) if any rule is unclear.

- Metrics first. Recommendations start from Vercel production signals, not repo-wide grep.
- Deterministic gates. `scripts/gate-investigations.mjs` decides what deserves investigation.
- Candidate-bound scope. Read only files named by a candidate or a route-local import chain.
- Version-aware citations. Use only `references/docs-library.json`; invalid or version-mismatched citations are stripped.
- Customer copy. Read [references/voice.md](references/voice.md) before writing report text or chat output.

## Prerequisites

- Vercel CLI v53+ with `vercel metrics`, `vercel usage`, `vercel contract`, and `vercel api`.
- Authenticated CLI session: `vercel login`.
- Linked app directory: `vercel link`. `VERCEL_PROJECT_ID` can help resolve project config, but `vercel metrics` still requires directory linkage.
- Node.js 20+.
- Observability Plus for route-level metric-backed recommendations.

Never put auth tokens in shell commands. Do not type `VERCEL_TOKEN=...`, `--token ...`, or `Authorization: Bearer ...` into commands that may be echoed in chat.

## Framework Support

The preflight reads `package.json` and sets expectations before metric fan-out.

| Framework | Status | Notes |
|---|---|---|
| Next.js App Router | supported | strongest route mapping, scanners, playbooks, citations |
| Next.js Pages Router | supported | scoped to Pages Router idioms when detected |
| SvelteKit | supported | route mapping for `src/routes` files and SvelteKit scanner |
| Nuxt | supported | route mapping plus generic/platform checks; fewer framework-specific recs |
| Astro | limited | route mapping plus generic checks; fewer framework-specific recs |
| Hono / Remix / unknown | blocked by default | continue only if the user accepts a limited platform/code-only audit |

If unsupported, stop and ask before scanning or gating:

```text
This project uses <framework>. Vercel Optimize supports metric-backed code recommendations for Next.js, SvelteKit, and Nuxt. Astro support is limited. For <framework>, I can still run a limited platform/scanner audit, but route-level Vercel metrics may not map back to source files.

Do you want me to continue with the limited audit, or stop here?
```

If the user continues, rerun collection with `--continue-unsupported-framework`.

## Run Directory

Use a fresh run directory for every audit. Do not reuse briefs, sub-agent outputs, or reports across runs.

```bash
RUN_DIR="$(mktemp -d -t vercel-optimize-XXXXXX)"
```

## Pipeline

### 1. Collect, scan, and merge signals

Run from the linked app directory or pass `--cwd` where a script supports it. Keep stdout JSON separate from stderr logs. Do not combine streams.

```bash
node scripts/collect-signals.mjs [projectId] > "$RUN_DIR/vercel-signals.json" 2> "$RUN_DIR/collect.stderr"
node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' "$RUN_DIR/vercel-signals.json"

node scripts/scan-codebase.mjs <repo-root> > "$RUN_DIR/codebase.json"
node scripts/merge-signals.mjs "$RUN_DIR/vercel-signals.json" "$RUN_DIR/codebase.json" --out "$RUN_DIR/signals.json"
```

Collection details, schemas, metric IDs, and degradation behavior live in [references/data-collection.md](references/data-collection.md). The metric registry is [lib/queries.mjs](lib/queries.mjs); keep all queries on the shared 14-day window.

### 1.1 Stop on blockers

Check blockers before gating:

```bash
jq '{frameworkSupportBlocker, observabilityPlus, observabilityPlusUsable, observabilityPlusBlocker, observabilityPlusBlockerDetail}' "$RUN_DIR/signals.json"
```

Required actions:

- `frameworkSupportBlocker === "unsupported_framework"`: use the unsupported-framework prompt above.
- `observabilityPlusBlocker === null`: continue.
- `no_traffic`: tell the user route metrics are sparse; continue only if they accept limited output.
- `payment_required` or `no_oplus_probe`: render [references/observability-plus.md](references/observability-plus.md) verbatim and ask.
- `project_disabled`: tell the user to enable Observability Plus for the project or accept a limited audit.
- `daily_quota_exceeded`: stop and tell the user the Observability query quota is exhausted; retry after the next UTC midnight reset, or ask whether to continue with a limited code-only audit.
- `not_linked`: link the app directory, then rerun Step 1. If app path and project are known:

```bash
vercel link --yes --project <project-name-or-id> --cwd <app-dir>
# add --team <team-id-or-slug> when known
```

- `forbidden` or `project_not_found`: fix auth/team scope. Do not pitch Observability Plus.
- `all_failed_other`: show the raw error code and ask whether to continue in limited code-only mode.

Do not silently fall back to code-only mode. If the user accepts a limited audit, rerun collection with:

```bash
node scripts/collect-signals.mjs [projectId] --continue-without-observability > "$RUN_DIR/vercel-signals.json" 2> "$RUN_DIR/collect.stderr"
```

Then scan and merge again.

### 2. Gate candidates

```bash
node scripts/gate-investigations.mjs "$RUN_DIR/signals.json" > "$RUN_DIR/gate.json"
```

Output shape:

- `toLaunch`: code-scope candidates to investigate.
- `platform`: project/account-scope recommendations.
- `gated`: skipped, covered, or disqualified candidates that must still appear in the report.
- `budget`: candidate budget and selection mode.

Default budget is 6 code-scope candidates with a diversity guardrail. To expand:

```bash
node scripts/gate-investigations.mjs "$RUN_DIR/signals.json" --max-candidates 12 > "$RUN_DIR/gate.json"
node scripts/gate-investigations.mjs "$RUN_DIR/signals.json" --max-candidates all > "$RUN_DIR/gate.json"
```

Generated candidate docs: [references/candidates.md](references/candidates.md).

### 2.1 Ask about audit scope when needed

Before deep-dive, run:

```bash
node scripts/budget-summary.mjs "$RUN_DIR/gate.json" --format json > "$RUN_DIR/budget-summary.json"
```

If `shouldAsk` is false, continue.

If `shouldAsk` is true:

1. Print `exactChatMessage.body` exactly as returned. Do not summarize, truncate, reorder, or rewrite it.
2. Then ask `questionText` using `questionPayload` when the host supports structured questions.
3. If the user chooses a different number, rerun the gate with `--max-candidates <choice>`.

Never put the long preview inside the question field. The preview and the question are separate surfaces.

### 2.2 Deep-dive and reconcile

```bash
node scripts/deep-dive.mjs "$RUN_DIR/signals.json" "$RUN_DIR/gate.json" --cwd <project-dir> > "$RUN_DIR/investigation-evidence.json"

node scripts/reconcile-candidates.mjs "$RUN_DIR/investigation-evidence.json" \
  --gate "$RUN_DIR/gate.json" \
  --out "$RUN_DIR/reconciled-investigation.json"
```

`--cwd` must be the linked project directory so `vercel metrics` resolves the right project/team.

Reconciliation deterministically converts disproven candidates into observations before any source investigation:

- `metric_mismatch`
- `error_storm`
- `deployment_regression`
- `scanner_only_no_metric`

### 2.3 Generate briefs and investigate

List the work:

```bash
node scripts/prepare-investigation-brief.mjs "$RUN_DIR/signals.json" "$RUN_DIR/reconciled-investigation.json" --list > "$RUN_DIR/briefs-manifest.json"
```

Generate one brief for every entry in `briefs-manifest.json.briefs`. The `group` can be `toLaunch` or `platform`; do not generate only `toLaunch` briefs.

```bash
mkdir -p "$RUN_DIR/briefs" "$RUN_DIR/sub-agent-outputs"
node scripts/prepare-investigation-brief.mjs "$RUN_DIR/signals.json" "$RUN_DIR/reconciled-investigation.json" \
  --group <brief.group> --index <brief.index> --out "$RUN_DIR/briefs/<brief.group>-<brief.index>.md"
```

Use `briefs-manifest.json.briefs[].label` for visible worker names, for example `Low cache-hit route on /docs/llm-digest/[...slug]`, not `toLaunch-7`.

Fan-out rule:

- 1-2 briefs: investigate inline.
- 3+ briefs: spawn one sub-agent per brief when the host supports it.
- Hosts without sub-agents: run inline serially.

Sub-agent contract:

- The brief is the whole prompt.
- Read only files listed in the brief, plus route-local imports when needed.
- Emit one JSON recommendation or one JSON no-change finding using [references/recommendations.md](references/recommendations.md).
- Do not cite URLs outside the provided citation subset.
- Do not recommend framework features unavailable in the detected version.

If a sub-agent reaches for repo-wide grep, the candidate is malformed; drop or abstain rather than widening scope.

### 2.4 Collect outputs

Save each raw investigation result in `$RUN_DIR/sub-agent-outputs/`, then collect:

```bash
node scripts/collect-sub-agent-outputs.mjs \
  --manifest "$RUN_DIR/briefs-manifest.json" \
  --out "$RUN_DIR/recommendations.json" \
  "$RUN_DIR/sub-agent-outputs/"
```

The collector extracts JSON, prepends pre-resolved records, enforces manifest order, and fails on missing, duplicate, unknown, or mismatched `candidateRef` values.

### 3. Verify recommendations

```bash
node scripts/verify-and-regen.mjs "$RUN_DIR/recommendations.json" \
  --signals "$RUN_DIR/signals.json" \
  --repo-root <project-dir> \
  --out "$RUN_DIR/verify.json"
```

This script extracts claims, verifies files/citations/version fit, grades quality, applies sanitizers, emits `verifiedRecommendations`, `withheldRecommendations`, `renderableRecommendations`, and creates `regenPlan` for failed or unsafe recommendations.

Recommendation schema, writing rules, sanitizer order, and grading rules: [references/recommendations.md](references/recommendations.md). Verification rules: [references/verification.md](references/verification.md).

For each `regenPlan` entry, rerun the same brief with a `Previous attempt failed these checks` section listing `topFailures`. Keep the regenerated output only if verification improves without gutting citations.

### 4. Render report and final message

```bash
node scripts/render-report.mjs "$RUN_DIR/verify.json" "$RUN_DIR/gate.json" "$RUN_DIR/signals.json" \
  --project <name> \
  --out "$RUN_DIR/report.md" \
  --message-out "$RUN_DIR/final-message.json"
```

Use `--debug-out "$RUN_DIR/debug.json"` only when developing the skill. Customer Markdown and chat output must not expose `passRate`, `quality`, sanitizer trails, raw sub-agent names, or other implementation fields.

After rendering, print `final-message.json.body` verbatim and stop. Do not add highlights, debug notes, raw counts, sub-agent summaries, or extra explanation. Render-time dedupe, platform caps, and hard-safety drops can change the customer-visible count, so never summarize from raw `verify.json`.

Report structure and impact framing: [references/scoring.md](references/scoring.md).

## Recommendation Rules

Every recommendation must:

- Trace to a launched candidate, platform candidate, pre-resolved observation, or verified traffic-independent scanner finding.
- Include observed metric evidence from `signals.json` or `evidence.deepDive`.
- Cite verified files with line numbers when code is involved.
- Include at least one allowed citation that applies to the detected framework/version.
- Use precise observed performance numbers.
- Use cost magnitude phrases only; never customer-facing `$N` savings.
- Name a specific cache policy when recommending caching.
- Keep unsafe responses dynamic unless evidence proves they are safe to cache: auth-sensitive paths, errors, fallback responses, missing content, invalid requests, geolocation/device-varying output, and unversioned dynamic URLs.

Never recommend "verify X is on" for facts already present in `signals.project`, including Fluid compute status, memory tier, regions, in-function concurrency, and timeout.

## Scanner Rules

Scanner findings are supplementary. Drop findings annotated `COLD-PATH` or `NO-ROUTE-MAPPING` unless the scanner declares `metadata.trafficIndependent === true`.

Traffic-independent examples: middleware matcher, source maps, React Compiler config, build settings. Route-local cache or data-fetch patterns need route-level traffic evidence.

Scanner docs: [references/scanner-patterns.md](references/scanner-patterns.md).

## Final Customer Terms

Use:

- `recommendations ready`
- `observations from investigation`
- `investigated, no change recommended`
- `not investigated in this run`

Avoid:

- `sub-agent`
- `abstention`
- `passRate`
- `quality score`
- `gate`
- `LLM`

## Failure Copy

Use these messages without adding sales copy or process detail.

**No traffic in the last 14 days:**

> This project has no meaningful traffic in the last 14 days, so route-level metrics are sparse. I can still check traffic-independent scanner findings and project settings, but I cannot rank route fixes until traffic accumulates.

**Route-level metrics unavailable:**

> Use the verbatim choice template in [references/observability-plus.md](references/observability-plus.md). Do not silently fall back to code-only mode; present the two-path choice: enable Observability Plus and rerun the metric-backed audit, or accept a limited code-only run.

**Project is not linked:**

> This worktree is not linked to a Vercel project. Run `vercel link --yes --project <project-name-or-id> --cwd <app-dir>` and rerun the audit. If the team is known, add `--team <team-id-or-slug>`.

**Most route-to-file mappings failed:**

> The route inventory matched fewer than half of the routes we saw in observability. This is common in monorepos with custom routing. I've surfaced what I can match; the rest appear in the "Not investigated in this run" section.
