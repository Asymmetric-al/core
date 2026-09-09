> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 8 September 2026:** Conrad accepted Q24 A1–A4/J01–J18/V01–V14/C01–C22, including current-fund scope, preservation of older financial records and three/two Maia preview defaults. Earlier proposed/unanswered wording below is historical. T01–T18 remain required target proof; ratification does not certify implementation or measured donor UX.

# Question 24 — Evidence, source checkpoints and proof limits

8 September 2026. Companion to the [complete adversarial review](phase25-r24-adversarial-review.md). The final review supersedes interim research proposals, including the discarded historical-overview mode. Final scope is one current configured D7 binding, independent of new-giving eligibility; older financial records retain their original authorized routes.

## Source checkpoints

<!-- prettier-ignore -->
| Source | Checked revision |
| --- | --- |
| Core develop/research worktree HEAD | `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` |
| Active Phase 22 public ministry pages | `70c50e8c97556c43be5543332fb0993b468b90ab` |
| Active Phase 23 Web Studio/CMS | `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6` |
| Active Phase 24 multisite | `ab1a1703a725be454376990a7fe68aef2e048026` |

Source was inspected in the existing isolated WSL grooming worktree. The research checks current branch refs through read-only GitHub API, verifies the five pre-existing setup changes and reverse-applicability of their saved patch, and hashes eleven earlier immutable review/proof bundles. No new canonical source, ADR/OpenSpec, dependency manifest, GitHub or provider mutation was made. The Supabase CLI's generated tracked version-check cache was restored exactly to HEAD after its read-only help run; it was clean at the start of this turn.

## Governing intent and exact source evidence

Paths in this table are repository-relative; P22 files use its active revision above. Active intended contracts are not proof they shipped.

<!-- prettier-ignore -->
| Source/lines | Verified meaning or current gap |
| --- | --- |
| `AGENTS.md`; `apps/donor/AGENTS.md`; `packages/ui/AGENTS.md`; `openspec/project.md:6–13` | Shared API/UI boundaries, current-versus-intended distinction, exact Maia and proportional source/document verification. |
| `openspec/specs/platform-principles/spec.md:16–34,86–119`; `platform-boundaries/spec.md:48–99,141–178,313–324` | Tenant/permission and money truth before convenience; focused donor surface; CRM operational authority separate from CMS public presentation. |
| `docs/guides/architecture/data-access-boundary.md:7–20,39–55,73–85` | Business data in packages/api; approved browser collections/hooks; no app-local table access or retired CRM vendor revival. |
| P22 PRD `phase-22-public-ministry-pages.md:427–436,495–503,590–605` | Exact D7 Designation, D3 source/purpose Feed Binding, typed immutable Page subject; public runtime is a separate boundary. |
| Active `openspec/changes/add-public-ministry-pages/specs/public-ministry-pages/spec.md:297–344` | D7 successor changes prospectively; old release and destination remain immutable. No all-ministry-history financial population is established. |
| P22 decision log `:386–399,1182–1196,1211–1220` | Existing source association/version ownership; sole current configuration head. A private descriptor is an explicit narrow proposed owner extension, not another head. |
| `docs/adr/0128-canonical-ministry-update-audience-release-projections.md:29–65,75–90` | Independent audience versions, current access and communication; no inferred Update placement/entitlement from author/subject/Designation/giving. |
| P9 PRD `phase-09-full-crm-depth-relationship-graph.md:360–379,568–598` | Giving-derived relationship is permission-qualified; operational ministry identity is not audience permission. |
| P12 PRD `phase-12-full-role-permission-configuration.md:168–184,223,259,286` | Sole fine-grained PDP and coarse trusted-Tenant RLS. Do not introduce a competing role/capability-in-RLS engine. |
| P16 PRD `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1385–1408` | Genuine groups have no cached total/universal status/subscription/method; stable lines have versioned terms. Intended group indexes are not actual query-plan proof. |
| `packages/api/src/donor-portal/model.ts:236–299,366–396,413–429` | Fund-first/General fund fallback; default active/monthly; paused excluded from old active count; subscription grouping belongs to wallet display, not P16 group identity. |
| `packages/api/src/donor-portal/service.ts:55–105,138–158,166–242` | Raw fund/missionary identity joins, first-array normalization, one donor/profile prerequisite, capped gifts 250/pledges 100 and bundled preferences. No target association/group proof. |
| `packages/api/src/missionaries/index.ts:13–37` | Current admin-client tenant query reads broad missionary/profile fields; not a purpose/safety-qualified overview identity projection. |
| `packages/api/src/posts/index.ts:35–72,85–137` | Current cached admin read filters tenant/status/missionary, offset and created_at. Draft guards exist; inspected published path lacks target supporter release/purpose/safety/Hide admission. |
| `packages/database/hooks/donor-feed-posts.ts:45–107` | Missionary filter, insufficient context key, no consumed AbortSignal, successful missing posts becomes empty array. |
| `packages/database/hooks/donor-portal.ts:109–170` | Shared portal key, generic error conversion and unconditional whole-snapshot replacement after PATCH. It cannot certify current multi-context composition. |
| `packages/api/src/reads/donor-history.ts:56–172`; `packages/database/collections/donor-history.ts:126–177` | Separate cached reader differs from actual route-backed History collection. Do not add a third reduced reader or treat name similarity as the adopted Q10 contract. |
| `apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client.tsx:53–107,144–159` | Raw status/next-charge and generic billing-portal Manage are incomplete predecessor UI, not Q22's qualified line/group journey. |
| `packages/auth/client-session.ts:64–82,139–182` | Useful existing user-switch/signout cleanup and profile-response guard; does not prove every same-human represented/source/permission transition. |
| `packages/database/providers/query-client.ts:73–106` | Current stale 60s, GC 5min, focus-off and generic-error interaction. These are observed defaults, not permission/currentness guarantees. |
| `supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:81–90,125–151,166–209,250–265` | Existing SELECT grants, broad predicates, public/published and identity/super-admin policies, preference grant revocations. Inspect real target adoption; these legacy migrations are not sole-PDP proof. |
| `packages/ui/components/shadcn/card.tsx:31`, `item.tsx:125–143`, `empty.tsx:61`; shared PageShell; `packages/ui/styles/globals.css:20`; `apps/donor/app/layout.tsx:158` | Div-based title components, two-line ItemDescription clamp and visually large compact PageShell can mislead composition. Actual donor font variables are Inter/Geist Mono/Syne; preset metadata alone does not prove Figtree rendering. |

Current [issue #1304](https://github.com/Asymmetric-al/core/issues/1304) was read as OPEN for the P22 supporter-release owner, with its existing source dependencies. No issue was created or changed. The private association extension, exact current-fund matching and target overview remain required work; existing source absence is not a claim about a hosted tenant or every branch.

## Actual tests run

Existing login-shell harness, isolated source worktree:

```text
bunx vitest run tests/unit/packages/database/donor-feed-posts.test.ts tests/unit/packages/api/posts/queries.test.ts tests/unit/packages/api/reads/donor-history.test.ts --maxWorkers=2 --reporter=default --reporter=json --outputFile.json=<work>/current-source-tests.json
```

**Result: 3 files passed, 31 tests passed, 0 failed.** The raw reporter counts nested suites separately; do not confuse its 13 suites with 13 files.

- 21 donor-feed mapper/fetch tests.
- 7 separate cached-History reader tests.
- 3 reaction-query tests.

The first non-login WSL attempt could not find bunx and stopped before testing. The existing login-shell invocation succeeded without a dependency installation. These are mocked/pure predecessor seams, not integration proof of the proposed descriptor, P12/P22 permissions, actual migrated RLS or UI.

Notably, successful missing-post payload → empty array is passing predecessor behavior the target must replace with typed validation. A green result does not certify a correct donor state. Reaction tests do not authorize adding engagement widgets.

## Six executed current-model probes

The actual exported `buildDonorPortalSnapshot` pure model ran with synthetic, non-personal fixtures. The probe file and raw JSON are bundled.

<!-- prettier-ignore -->
| Probe | Actual result | Interpretation |
| --- | --- | --- |
| Fund and missionary supplied | Fund is selected for both donation and pledge display. | A display preference is not a content association or unique Page relationship. |
| Two equal names with different IDs | IDs remain distinct. | Positive existing behavior; do not merge by display name. |
| No fund/missionary association | General fund with null ID. | Unsafe as a source-certified overview fallback. |
| Missing recurring terms | Monthly/active, active count 1, no next date. | Target must not manufacture intent/state. |
| Paused arrangement | Row retained, active count 0. | Q22 Current membership is broader than this counter. |
| Two rows share a subscription | Two recurring rows remain; wallet groups method display by subscription. | Provider ID is not proof of a P16 arrangement group. |

The fixtures exercise the exported TypeScript shape. They are **not proof that each combination exists or is valid in PostgreSQL**, and not evidence of a production incident. No target resolver, provider or money mutation was exercised.

## CLI and documentation evidence

- Read-only shadcn info/docs from shared UI confirmed `base-maia`, Base UI, Zinc, CSS variables/shared aliases and ReUI registry; Base Card/Item/Empty/Breadcrumb docs were inspected. No add/init/preset command ran. Installed APIs and semantic markup remain authoritative over newer upstream examples.
- Global `supabase` was absent from this WSL shell. Core's declared wrapper ran `bun run supabase -- --version` and `bun run supabase -- db --help`, using its pinned fallback **2.76.12**. It reported an available newer **2.117.0**, which was not installed as a repository upgrade. This runtime differs from earlier same-day CLI evidence on another surface; neither is silently substituted for the other.
- The pinned CLI help has no `db query`/`db advisors` subcommands. No fabricated command, hosted SQL, raw status/config or secret output was attempted. The CLI's generated update-check cache was restored; user setup work remains unchanged.
- The current Supabase changelog Markdown was fetched through ordinary HTTP after the web reader rejected its Markdown content type. It was scanned for relevant breaking changes. Platform-log API, extension DDL and Realtime schema changes do not require a new integration or schema operation for this read-only overview.
- Current TanStack query-key Markdown was fetched directly after the web reader failed. Query key scoping, cancellation limits and private/browser cache behavior inform safeguards; they do not provide Core authorization by themselves.

Primary references are cited at the corresponding claims in the main review: nonprofit/customer patterns, shadcn/Base UI composition, W3C accessibility, Supabase/PostgreSQL security, TanStack cancellation and Web Vitals. No measured Asym improvement or observed donor workflow is inferred from vendor marketing.

## Independent review and final reconciliation

Three lanes examined ownership/DB, donor journey/shared UI, and financial/source/proof behavior. Final owner and data reviews confirmed:

1. One current configured D7 scope, independent of new-giving eligibility; no historical overview/union or silent retargeting.
2. Older financial records retain exact routes and original meaning.
3. Effective recurring terms are distinct from future proposals, accepted pending activation and rejected drafts.
4. An ended matching line can remain Ended inside a source-defined Current group; hidden siblings supply no visible facts.
5. P12 coarse Tenant RLS and sole fine-grained PDP remain intact, with no raw-table bypass.
6. Existing tests/probes are accurately limited; target proof is not claimed.

Intermediate peer notes are included for traceability. The final review is the corrected synthesis when their initial suggestions differ. No further material contradiction remained in the final owner/data passes.

## What has not been proved

No target UI was rendered, no authenticated donor journey observed, no donor interview performed, and no target schema/RLS, concurrency, database-plan, browser/assistive-tech, load or provider test ran. T01–T18 in the main review specify the actual implementation/release proof. The review is complete as a grooming product; it does not label implementation or perfect usability as already achieved. Q14 G01 remains unresolved in the wider session.
