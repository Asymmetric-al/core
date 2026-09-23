# D30 — Independent overview data, scope and reporting review

**13 September 2026. D30 A is selected, with future configurability explicitly requested. The full D30 amendment package remains proposed; D1–D29 are ratified.**

**Disposition: Accept with required amendments.** A fixed overview can use the already-qualified work and report meanings. Its most important correction is to reject a visually global Inbox filter: current handling, current-label cohorts and historical reply/feedback attribution do not mean the same thing. The fixed screen needs body-free server projections and exact owner drilldowns, not a new metric engine or a browser aggregation of whole conversations.

## Evidence and executed source probe

[Source evidence](phase26-d30-data-source-evidence.json) pins **25 Git objects plus 15 session/probe artifacts** at Core HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. WSL cwd was verified as `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`. Current source, accepted intent and future qualification remain distinct.

The [actual-source probe](phase26-d30-source-probe.json) executed five synthetic-input observations against byte-identical extracts of the current `report-aggregations.ts`, `business-hours.ts` and `time.ts`. Bun ran with `--no-env-file` in the Windows workspace's mapped `work/` directory; no application bootstrap, database/provider client or network operation was used. The five assertions **passed as observations of legacy behavior**, not as approval of that behavior or tests of the new design:

| Observation                                                     | Actual result                                                               | Consequence                                                                                                                              |
| --------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Same historical range, one old still-open conversation          | Customer-waiting count 0; Open count 1                                      | Current waiting is filtered by created date while another current card is not. One apparent range does not define a coherent population. |
| Specific Inbox scope with empty ID                              | Returns all input rows                                                      | Invalid specific scope silently broadens. An unavailable selection must not become All.                                                  |
| Same completed reply after current inbox changes                | Historical-looking old-inbox first-response total changes 1,440 → 0 minutes | Current-home filtering cannot substitute for historical source/actor/policy attribution.                                                 |
| No completed replies versus one genuine zero-minute reply       | Both summaries return 0                                                     | A bare number does not distinguish missing sample from a real zero.                                                                      |
| Label membership exists but catalog display evidence is missing | Raw synthetic label ID appears                                              | Missing metadata cannot become an arbitrary ID label or a confidently complete category report.                                          |

No SQL, RLS, actual route, browser, service capacity or production user journey was exercised. The extraction and probe hashes are included so another reviewer can reproduce the bounded observation.

## Current source facts requiring replacement or qualification

1. [The report route, lines 16–31](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/app/api/admin/support/reports/route.ts#L16) loads all returned conversations, then message collections for each conversation, and returns raw conversations/messages. It is not a minimal aggregate response. The new overview must not depend on downloading private bodies merely to show counts.
2. [The Supabase list adapter, lines 671–723](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L671) applies a requested 2,000-row cap before local text/label filtering. [Checked-in config](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/config.toml#L18) sets Data API `max_rows=1000`, with PostgreSQL major 17 at line 34. These are distinct configured/requested limits, not proof of the deployed server's active cap. Neither is a valid complete report population.
3. [The hook, lines 88–111](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/hooks/use-support-reports.ts#L88) computes client-side against `query.data ?? []` and the current default/first business-hours record. [OverviewReport, lines 14–43](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/reports/surfaces/OverviewReport.tsx#L14) consumes numeric totals directly. Current missing/error data is therefore not qualified merely because a card has a number.
4. [Aggregation, lines 43–123 and 132–147](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/lib/report-aggregations.ts#L43) uses created-date ranges for several slices and current inbox/assignee/team/label membership. D14/D21/D28 now prescribe different exact source meanings. The current average/resolution cards are not founder-selected formulas to preserve.
5. [Report query keys, lines 47–75](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/query-keys.ts#L47) visibly omit tenant/principal and many report parameters. That omission requires checking the complete client lifecycle and replacing the key contract for the new projections; it does not alone prove deployed cross-tenant leakage. [ScopeSelect, lines 32–54](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/reports/ReportScopeSelect.tsx#L32) also chooses a first available option when the ID is missing, which cannot implement precise unavailable-scope recovery.
6. [Current Support grants/policies, lines 520–574](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L520) expose broad staff CRUD; [the route helper, lines 31–86](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/route-helpers.ts#L31) is a broad role gate. Neither proves current report/source/field authorization before aggregates.
7. [ReportExportMenu, lines 28–35](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/reports/ReportExportMenu.tsx#L28) creates a browser download from the existing series. CSV formula escaping is a useful existing defense in [report-export](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/lib/report-export.ts#L12), but neither function establishes a separate export capability, a complete source cohort or current disclosure authority. A new combined overview export is unnecessary here.

## Settled scope solution

**No global Inbox selector.** Use these two independent sections:

- **Work now:** a local **Currently handled in** selector, initially **All accessible work inboxes**, or a deliberate valid current-home selection. It affects only Work now. Selected IDs preserve their identity; missing/forbidden IDs do not silently disappear or broaden. D20 governs complete query semantics.
- **Results for a selected period:** period/timezone controls only. Default to all currently authorized report data with a persistent caption such as **Across the inboxes you can report on. Work now filters do not apply.** Each module states its own cohort. Narrower inbox/actor analysis opens the existing full report with that report's actual dimension controls.

This avoids three competing inline historical scope pickers and avoids relabelling all metrics with one misleading Inbox filter. It also avoids inventing a new universal historical-inbox dimension. D14 distinguishes original source, policy-at-start, custody-at-due and actual responder; untargeted completed waits do not have a target-policy inbox. D21 uses current responsible home. D28 preserves original invitation inbox/cohort.

“All inboxes you can report on” means each module's current report/source/field/classification admission. Historical/retired inbox references are included only where their existing owner preserves meaningful, currently permitted report access. Do not filter history through today's active inbox catalog or create new archive-access permissions. Unknown historical scope is unconfirmed/unavailable under its owner, not guessed current home or a raw ID label.

## Bounded fixed composition and exact count units

### Work now

Use three modest modules, not a health score or a collection of unrelated KPIs:

| Module                        | Exact population and unit                                                                                                                                                                                                                                                           | Navigation                                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **All unfinished**            | Distinct currently qualified continuing work components in the selected current responsible inbox scope, with D3 status Open, Waiting for requester or Waiting on our side. Includes deferred work. Show that three-state breakdown as a partition of the same complete population. | Exact current authorized conversation list; no historical date predicate.                                                              |
| **Unassigned unfinished**     | Distinct members of that unfinished population with a source-proven absence of an individual worker under D6. Waiting/deferred work stays included. Missing assignee hydration or invalid former-handler evidence is not automatically Unassigned.                                  | Existing complete D6 unfinished-Unassigned view and current handling rules; count does not grant Claim permission or bypass D8 review. |
| **Replies needing attention** | Distinct current continuing conversations with at least one currently owed response contribution admitted by D14, in the same current work-home scope. Clearly label the number as conversations. Underlying periods/contributions remain detail, not extra conversations.          | Exact D14 conversation-level predicate; detail retains every permitted underlying reply scope.                                         |

D14's [UX](phase26-d14-reply-targets-ux.md) already expressly counts inbox rows as conversations and names **Conversations with overdue replies**. Source-derived Overdue, Timing needs confirmation, Within target and No target groups may overlap when different contributions occur in one conversation; their counts must not be added. A fulfilled but unscored/uncertain historical period is not outstanding reply work. No new Due soon threshold or resolution deadline is introduced.

The three modules themselves also overlap. Do not add Unassigned or reply-attention numbers to All unfinished. Unknown required source facts may make one subset unavailable while other independently qualified modules remain useful; they are not false null/zero.

Intake, handling-review and feedback-review destinations remain separately discoverable links to their actual owners. They acquire no new combined badge, union count, inferred work status or implicit Now inbox filter. Accepted pending form intake awaiting ordinary materialization remains in its qualified D29 recovery path rather than being fabricated into a fully materialized conversation count.

### Results for a selected period

| Fixed area                          | Required existing meaning                                                                                                                                                                                                       | Compact overview treatment                                                                                                                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Reply performance — Targets due** | D14 finalized original target instances in their frozen due cohort, First/Next separate; on-time assessed / all assessed due, with unknowns, exclusions and potential unconfirmed cohort membership disclosed.                  | Preserve assessed count/denominator and clear due-cohort label. Never average inbox percentages or count candidate splits/current roots as target instances. Pending/not-yet-due handling remains D14's existing live-versus-history rule. |
| **Reply performance — Reply times** | D14 waiting periods ended by actual qualified staff reply in the selected completion cohort. Median and nearest-rank p90 with sample count; First/Next and time basis explicit.                                                 | Do not replace with averages or conversation-created cohorts. Do not pool elapsed and service-hour values without their qualified basis. One reply may end several waits; a wait is not an email or staff-effort unit.                     |
| **Request labels**                  | D21 current components whose earliest qualified original start across the whole current component falls in the period; current responsible home and current permitted label union.                                              | Show N/L/U coverage, overlap and start-date uncertainty as required. It is current categorization of that cohort, not historical topics, inflow, labels applied in the period or labels at resolution.                                     |
| **Feedback**                        | D28 distinct issued invitation effects whose submission may have begun, original inbox/cohort provenance, response fraction from that same issued cohort, currently includable rating distribution and source-complete windows. | Retain indeterminate issued effects in the denominator, small-sample/context caveats and actual response counts. No response is not satisfaction. Invitation Off does not erase retained historical results.                               |

For D28's explicit **Invitations issued in [period]** caption, use its qualified first submission-may-have-begun occurrence; do not substitute token mint, conversation completion, callback arrival or current home. If original cohort evidence is unknown, retain the owner's uncertainty instead of assigning it to a convenient date. A response preceding provider-confirmed acceptance still belongs to the actual issued denominator.

The shared period means the same visible calendar interval and report timezone converted server-side to `[from, to)` instants. It does **not** mean every area describes the same cohort. The wording under each area must disclose due, completed-wait, original-start or issued-invitation basis. No cross-area sum or percentage comparison is inferred.

## Material findings and exact proposed clauses

The likelihood assessments below concern an unamended implementation; they are not measured incident rates. Each finding changes or narrows A without rejecting the fixed overview.

### DC01 — One global filter would misstate ownership

**High / likely**, supported by D14-R24, D21's exact cohort and D28-R24 plus the moved-inbox source probe.

> “The Overview SHALL have no global Inbox filter. Work now's Currently handled in control applies only to its current-home queries. Period summaries use all currently source-authorized report data and explicitly state that scope. Opening a full report carries only compatible period/timezone and that report's declared context; the current-work Inbox selection SHALL not silently become a historical origin/policy/actor filter.”

**Proof:** Move a conversation after one reply/target/invitation, then change Now scope. Work counts change as current ownership dictates; historical summaries remain under their original owner dimensions. Labels keep D21's current-home meaning. A retired but currently permitted historical source is not removed by an active inbox picker.

### DC02 — Count identities must remain domain-specific

**High / plausible**, supported by D10 grouping, D6 completeness and D14 contribution/period rules.

> “Each displayed value SHALL name its unit and count identity. Work now counts distinct current continuing conversations; target results count qualified original target instances; durations count completed waits; label coverage counts D21 current components; feedback counts invitation effects/responses. No cross-unit sum, overlapping-group total, current-root dedupe of historical periods or inactive-source resurrection is permitted.”

**Proof:** Merge two originals with separate targets and feedback effects: one Now row may retain multiple original historical samples. Unassigned Waiting/deferred work remains visible. A conversation with both a confirmed overdue and unconfirmed contribution appears in both qualified groups without doubling the overall conversation count.

### DC03 — Summary APIs must not ship raw body collections

**Critical / plausible disclosure; High / demonstrated scale shape**, supported by the actual report route and capped adapter.

> “The Overview SHALL consume bounded server-authorized aggregate/read-model projections from packages/api, with thin app routes. It SHALL not request all conversations/messages or hydrate attachment/CRM bodies to calculate summary values. Complete authorization and semantic filtering precede aggregate/count/page limits. The 2,000-row application cap or Data API maximum SHALL not define the report population. Exact source query/rollup contracts replace client aggregation.”

**Proof:** Place matching work and periods beyond both 1,000 and 2,000 rows; complete results remain correct. Network payloads for the overview contain no message body, raw endpoint, attachment or unrelated CRM data. Plans use bounded owner queries rather than one message query per conversation.

### DC04 — Authorize before aggregate, not after drilldown

**Critical / plausible**, supported by current broad role/RLS patterns and all prior report contracts.

> “Every module SHALL apply current tenant, report/source, record/field/classification and applicable CRM-context authorization before values, labels, unknown counts, snippets or metadata are exposed. Overview access or a layout block grants no additional source rights. Explicitly denied modules disclose no denied population; transient authorization/source failure is not an empty successful result. Historical attribution never preserves revoked content access.”

**Proof:** Same viewer with different inbox/source rights, different tenant, restricted CRM context and revoked record access receives exactly the permitted projection. A forbidden original contributes neither a hidden count nor a revealing label. A service-role path proves the same owner context rather than relying on RLS bypass.

### DC05 — Unknown, zero, Off and failed are separate states

**High / likely**, supported by the empty/zero probe and current `query.data ?? []` hook.

> “Projection state SHALL distinguish loading, complete value, complete empty population, incomplete/unconfirmed, unavailable and source-policy Off/not configured. Numeric zero is displayed only when a complete qualified population proves zero. Missing label/time evidence SHALL not become a raw ID, zero duration, unlabelled membership or perfect attainment. Current Off status SHALL not suppress retained historical target or feedback results.”

**Proof:** Empty and genuine zero-duration fixtures display different sample meaning. One unknown label member prevents a false complete N/L/U percentage. Off with retained feedback shows history plus Off status; never-enabled/no-population does not show 0% satisfaction. Failure of one area leaves independently valid areas and ordinary work usable.

### DC06 — One module needs coherent evaluation, not fictional global simultaneity

**High / plausible**, supported by source-dependent clock predicates and PostgreSQL snapshot behavior.

> “Each module's values, coverage and current predicate SHALL come from a coherent source evaluation with one trusted As of time, definition version and relevant source/projection freshness evidence. Compatible Work now counts use the same qualified evaluation. A cached dataset SHALL not receive a new As of merely because the browser recalculates with its clock. Independent owner modules may have different declared freshness; the page SHALL not claim one global current snapshot unless actually qualified.”

**Proof:** Concurrent status/assignment/merge changes cannot produce an impossible unfinished partition inside one evaluation. A queued due transition still follows D14's current owed/time authority. Delayed source projection reports its actual coverage/age rather than fresh-looking render time.

Use a single statement or appropriately qualified short read snapshot where necessary; do not hold a database transaction across user browsing or require Serializable for every read by default. PostgreSQL Read Committed gives each command a new snapshot, so separately issued queries are not automatically one coherent aggregate. [PostgreSQL 17 isolation](https://www.postgresql.org/docs/17/transaction-iso.html)

### DC07 — Drilldowns preserve meaning while reauthorizing current access

**Critical / plausible disclosure; High / plausible misleading population**, supported by D20 query-state and D21 exact drilldown clauses.

> “A summary drilldown SHALL carry the exact source-owned report/work predicate, stable definition and compatible scope, not a bag of historical row IDs or a substituted Created filter. It reauthorizes current access and displays the new evaluation's As of when data changes. Equality is required for one qualified evaluation; an old count is not a capability to recover now-forbidden rows. Expired, invalid or incompatible context is unavailable or explicitly refreshed, never silently All work. D21 report context cannot become a new saved-view authoring feature.”

**Proof:** Click after merge/Undo, current scope change, source restriction, metadata correction and permission loss. The current detailed result remains truthful even if the count changed. The old card cannot expose a retired source snapshot. Back/return preserves allowed location without reapplying a stale Inbox predicate.

### DC08 — Query identity and late results must be isolated

**Critical / plausible**, supported by the current query-key registry and changing source predicates.

> “Cache/query identity SHALL include trusted tenant/principal/acting context, module/definition version, effective scope, period/timezone when applicable, and the owner's required source/authorization generations. Late results from another account/tenant/range or an obsolete scope SHALL not populate the current display. Abort is an optimization; current identity/version comparison remains authoritative. Stale display is permitted only under the existing owner's retained-read/authorization contract and is clearly not current.”

**Proof:** Switch tenant, account, Now inbox and period while earlier queries are pending; complete them out of order. No old labels/counts appear under new headings. Known access revocation removes forbidden display. Offline data never claims current due state or authorizes an offline mutation.

### DC09 — One period control cannot overwrite each cohort

**High / likely**, supported by the source probe and existing generic range implementation.

> “The period control SHALL supply explicit report-zone calendar bounds; each module applies its ratified cohort and source-time rules. Due-cohort targets, acceptance-completed waits, earliest-original-start current components and issued invitations SHALL remain visibly distinct. Changing zone/range creates a new query generation. Missing or interval-uncertain source time follows its owner exclusions/uncertain membership, never createdAt, updatedAt, callback arrival or now substitution.”

**Proof:** Half-open boundaries, daylight-saving changes, interval-straddling accepted times, a 2024 original merged into a 2026 root, and an invitation response before acceptance confirmation preserve exact sample membership and uncertainty. Old-period data is not relabelled under a new heading during loading.

### DC10 — Formula and coverage must survive compression into a card

**High / likely**, supported by D14/D21/D28 detailed requirements.

> “Overview previews SHALL use the same owning calculation and denominator as the detailed report. Required sample/unknown/exclusion/overlap meaning remains available without relying on hover alone. On-time assessed ratio is not an average of inbox ratios; reply median/p90 uses qualified waits and stated basis; label percentages retain N/L/U and overlap; feedback response fraction uses the same issued cohort including indeterminate submissions. No score for overall health, effort, donor value or satisfaction of nonresponders is created.”

**Proof:** Small/empty/unknown samples and unequal inbox sizes match full reports. A favorable completed-wait median cannot hide current unanswered work. One record may count in multiple label groups without a 100%-stacked implication. A response received while transport is indeterminate cannot cause a response fraction above 100%.

### DC11 — Keep review destinations and business actions separate

**High / plausible**, supported by D19, D8 and D28 review ownership.

> “Existing intake, handling and feedback review paths SHALL remain discoverable through their own authorization and scope. The overview creates no combined exception count, hidden Inbox carryover or new mandatory queue. Viewing, refreshing or navigating SHALL not claim work, change a status, mark reviewed, follow a conversation, emit CRM Activity, complete owner work, sample feedback or send a message.”

**Proof:** Open every summary/review link under a restrictive Now filter; each destination explains and applies its actual source scope. The operation audit shows no business mutation from reads. A late D29 accepted pending intake remains discoverable through its qualified recovery owner.

### DC12 — RLS, views and privileged reads require complete grants proof

**Critical / plausible**, supported by current migration and API-role evidence.

> “Source tables retain authoritative keys/constraints and trusted actor/tenant attribution. Derived overview reads SHALL use least-privilege queries/views/RPCs with current owner predicates. Anonymous grants and raw private report dumps remain denied. Qualify SELECT, any remaining mutation USING/WITH CHECK, invoker/definer behavior, PUBLIC EXECUTE, fixed search_path and service paths. A report repair or rebuild SHALL not become a business mutation or reparent source facts.”

**Proof:** Actual database roles verify positive and negative aggregate paths, tenant joins, revoked scope, broad inherited grants and service execution. PostgreSQL may reuse USING when WITH CHECK is omitted; syntax absence alone is not a hole. The complete effective boundary, not a generic staff role, must be tested. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [PostgreSQL policy behavior](https://www.postgresql.org/docs/17/sql-createpolicy.html)

### DC13 — Read models and query state have finite custody

**High / plausible**, supported by D16/D17/D20/D21/D28 retention and correction requirements.

> “Summaries, authorized query handles, compact lineage and cached projection data SHALL remain derived under the actual owner's finite purpose, restriction and restore rules. They are not a historical transcript warehouse or an indefinite fallback archive. Source redaction/disposal removes all affected ordinary representations; restoring a backup replays restrictions before serve. Query state contains no raw private search/body/endpoint literals in public URLs or logs and grants no source access.”

**Proof:** Expiry, redaction, holds, correction, cache refresh and restore cannot resurrect forbidden labels/ratings/source metadata. Permitted body-free historical measures remain only under their proper owner horizon, not because the overview needs a chart. No new retention setting is added solely for this screen.

### DC14 — Future configurability uses contracts, not a dormant platform

**Medium / likely overengineering risk. Changes extension strategy.** The founder requested future full configurability, but selected a fixed overview now.

> “Record future configurable composition as direction. The fixed implementation SHALL keep presentation separate from stable, source-owned block/query/metric contracts so future shared P33 composition can reuse them without changing definitions or access. Do not ship layout CRUD, empty builder controls, a custom SQL/formula language, plugin loader, shadow warehouse or second semantic registry now. Future layouts may select presentation but never grant source permissions or alter formulas.”

**Proof:** Fixed blocks can be rendered/reordered at the presentation boundary without changing query meaning. No runtime tenant-authored report schema or layout database is required for A. A source-version change is explicit, not silently interpreted by old consumers.

P33's [roadmap, lines 3572–3615](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md#L3572) owns future shared reporting semantics/composition. It is not a shipped prerequisite service. A's source-owned reports remain useful without waiting for all of P33. Scheduling/export/sharing permissions are independent; overview viewing adds no management digest or P17/P6 occurrence.

### DC15 — Migrate the data path before trusting the new presentation

**High / likely with current scaffolding. Changes rollout and proof.** Reusing raw report loads, first-row scope defaults and old numeric fallbacks behind new cards would make the design appear complete while preserving the defects.

> “Qualify exact source aggregates, response-state contracts, authorized drilldowns and key isolation before enabling the fixed overview. Retire/fence obsolete report writers/read paths for this consumer without changing source facts or the existing detailed reports' accepted meaning. Use additive read-model/index changes only where justified by measured plans. A kill switch may stop the overview without blocking ordinary Support or required source recovery. Old-reader rollback must not restore misleading formulas, permissive private dumps or disposed data.”

**Proof:** Production-shaped skew and >2,000 source records; concurrent Now updates; mixed source/query contract versions; old route query parameters; privacy restore; partial module failure. Record actual plans, latency/bytes and authorization outcomes. The five pure-source observations are not substitute release tests.

## Suggested read contract

Physical names are deliberately not frozen. The logical minimum for each owner projection is:

- trusted module/definition identity and version;
- exact effective scope with its stated current or historical basis;
- explicit period/timezone where relevant;
- typed outcome/coverage/freshness, original As of and needed source revision/watermark evidence;
- finite aggregate values with declared units, denominators and unknown/exclusion metadata;
- a qualified work/report navigation descriptor that reuses the shared query owner and carries no authority by itself.

One server request may batch compatible module reads for efficiency, but it must preserve independent failure/authorization semantics and cannot invent a global snapshot across independent owners. A complete module is not inferred from success of the HTTP envelope. Module data should be streamed/rendered independently where the existing app permits, so an unavailable feedback source does not blank Work now.

No message bodies, attachment metadata, raw email addresses, private CRM facts, arbitrary rows, full source JSON or all-record ID bags are necessary in the overview response. The exact list/detail remains the source-authorized destination. This is a small typed projection contract, not a generic report DSL.

## Verification, rollout and residual operations

First implement/qualify owner definitions and body-free projections; next exact Now/period scope and response states; next current-auth drilldowns and cache isolation; then the fixed presentation and existing source-report navigation. Measure realistic cardinalities, uneven tenant sizes, source lag and concurrency before choosing extra indexes or materialized rollups. No daily snapshot warehouse or mandatory external BI dependency is justified by A.

Suggested residual controls after correctness gates pass:

| Signal/threshold                                                                                                      | Owner                               | Response                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| One confirmed cross-tenant/forbidden aggregate or old-context result displayed                                        | Reporting/source security owner     | Disable affected projection, clear current unsafe cache, contain and prove negative cases before re-enable.                |
| One same-evaluation count/drilldown or formula/denominator reconciliation mismatch                                    | Owning Support report module        | Withdraw the misleading complete result, report unavailable/partial, repair exact query/version and recheck parity.        |
| Source freshness exceeds its registered budget or required current head cannot be proved                              | Owning source/read-model operations | Mark the affected module stale/unavailable, recover existing convergence, preserve independent modules and ordinary work.  |
| Registered latency/response-byte/query budget exceeded on the declared load fixture or sustained production threshold | Core API/reporting operations       | Inspect plans and tenant skew, constrain fan-out, repair/roll forward; never cap away records while claiming completeness. |

Budget values must be named in the implementation/release contract and attached to real measurement; these rows do not invent universal performance numbers. Critical authorization and semantic completeness are prerequisites, not monitor-only exceptions.

**Final synthesis:** keep A fixed now, with a credible future composition seam. The best permanent overview has three current-work modules and three period areas, no global Inbox filter, exact per-owner units/cohorts, no raw report body dump, independently truthful states and current-authorized drilldowns. This closes the chosen overview without reopening metrics, building another reporting platform or claiming production proof from a source probe.
