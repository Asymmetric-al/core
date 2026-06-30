# Statement Studio Handoff

Generated: 2026-06-13 Asia/Bangkok

## Triggers

Use this handoff when a fresh agent is picking up Statement Studio planning or
implementation work from PR #367 and needs the current repo, PR, issue, and
verification state without rereading the full conversation.

## Workflow Steps

1. Open PR [#367](https://github.com/Asymmetric-al/core/pull/367).
2. Read parent issue
   [#310](https://github.com/Asymmetric-al/core/issues/310).
3. Read this directory's `README.md`, `prd.md`, `issues.md`, and
   `phase-0-audit-brief.md`.
4. Start implementation from issue
   [#312](https://github.com/Asymmetric-al/core/issues/312) unless the user
   gives a newer explicit priority.
5. Follow the issue dependency graph in `issues.md` and #310.
6. Use the suggested skills below before touching their domains.

## Current State

- Repository: `Asymmetric-al/core`
- Planning PR: [#367 - Document Statement Studio rebuild plan](https://github.com/Asymmetric-al/core/pull/367) (docs-only; verify mergeability and required CI on GitHub before merge)
- Parent planning issue:
  [#310 - AL-310: PRD - Statement Studio rebuild and implementation backlog](https://github.com/Asymmetric-al/core/issues/310)
- Canonical implementation issues: `#312` through `#364` (even numbers),
  mapping to `SS-00` through `SS-26`
- Temporary duplicate issues from automated publishing were closed with comments
  pointing to the canonical issue.
- Rebase PR #367 onto latest `develop` and confirm `gh pr checks --required`
  before treating docs as merge-ready.

## Source Artifacts

Read these in order:

1. `README.md`
2. `prd.md`
3. `issues.md`
4. `phase-0-audit-brief.md`
5. `product-plan.md`
6. `data-model.md`
7. `variables.md`
8. `starter-template-catalog.md`
9. `ux-ia.md`
10. `integration-map.md`
11. `rendering-artifacts-retention.md`
12. `legacy-pdf-studio-removal.md`
13. `testing-fixtures.md`

## Critical Decisions Already Captured

- Product name: Statement Studio.
- New implementation must not be built on Unlayer.
- New implementation must not be an email editor pretending to generate PDFs.
- Persisted templates use an Asym-owned JSON schema compiled through pdfx and
  React PDF where appropriate.
- Production renders resolve server-side from tenant-scoped DTOs.
- Generated PDFs are private, tenant-aware artifacts exposed through authorized
  access paths, not direct cross-dashboard table reads.
- Tenant admins can customize templates, variables, defaults, assignments,
  retention, and capabilities within platform safety floors.
- UI must use shared `@asym/ui` components and Maia/Zinc design tokens.
- Database, RLS, Storage, Auth, migration, seed, query, and Supabase client work
  must load the repo Supabase skill and use Supabase CLI verification.

## Recommended Next Work

Start with
[#312 - SS-00 Phase 0 Statement Studio audit and first-slice confirmation](https://github.com/Asymmetric-al/core/issues/312).

The Phase 0 audit should confirm:

- Current legacy PDF Studio and Unlayer dependencies.
- Current donor receipt and annual statement behavior.
- Current data owner boundaries for donor, missionary, events, finance,
  reports, care, legal, tasks, and CMS.
- Current Supabase/RLS/Storage posture and risks.
- What should be reused, replaced, retired, or deleted.
- Whether `donor.statement.annual_giving` remains the best first production
  slice.

After #312, follow the dependency graph in #310 or `issues.md`. Do not start by
editing legacy Unlayer UI unless the Phase 0 audit explicitly identifies a safe
removal or migration step.

## Suggested Skills

- `repo-entry`: orientation and repo instruction routing.
- `supabase`: required for any Supabase database, Auth, Storage, Realtime, Edge
  Functions, CLI, RLS, or migration work.
- `supabase-postgres-best-practices`: schema, query, index, policy, RLS, or
  migration performance work.
- `vercel-react-best-practices`: React and Next.js implementation quality.
- `nextjs-app-router` or the repo's relevant Next.js skill: App Router,
  rendering, routing, and data-fetching work.
- `frontend-design` or repo frontend rules: Statement Studio UX/UI work using
  shared design tokens.
- `to-issues`: only if future PRD changes need new vertical-slice issues.
- `handoff`: use again when pausing after implementation progress.

## Verification Expectations

For documentation-only changes:

- Run focused Prettier checks on touched docs.
- Confirm each new workflow doc includes `## Triggers`, `## Workflow Steps`, and
  `## Checklist`.
- Keep links to GitHub issues current.

For implementation changes:

- Read installed Next.js docs before Next.js coding.
- Use the Supabase skill and Supabase CLI before database/Supabase work.
- Add focused tests for tenant safety, variable resolution, assignments,
  rendering, artifact access, and UI smoke paths based on the slice.
- Let GitHub Actions settle and inspect failures directly.

## Security and privacy notes

This handoff intentionally contains no secrets, tokens, credentials, donor
personal data, missionary personal data, or tenant private records. Keep future
handoffs at the same level: reference artifacts and public GitHub issue numbers
instead of copying sensitive runtime data.

## Checklist

- [ ] Start from #312 before implementation unless the user explicitly redirects.
- [ ] Read the PRD and issue map before editing code.
- [ ] Use the Supabase skill and CLI for Supabase work.
- [ ] Use shared design tokens for UI work.
- [ ] Keep every Statement Studio slice tenant-safe and tenant-aware.
- [ ] Update the handoff if meaningful implementation progress changes the next
      agent's starting point.
