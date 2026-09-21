> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 8 September 2026:** Conrad accepted Q24 A1–A4/J01–J18/V01–V14/C01–C22, including current-fund scope, preservation of older financial records and three/two Maia preview defaults. Earlier proposed/unanswered wording below is historical. T01–T18 remain required target proof; ratification does not certify implementation or measured donor UX.

> **Current status, 8 September 2026:** Conrad selected A — One compact ministry overview. The [completed adversarial review](phase25-r24-adversarial-review.md) proposes corrected execution for ratification. The unanswered wording below is historical pre-answer research. Final execution uses one current configured fund scope, not a historical overview mode.

# Question 24 — Focusing on one ministry

8 September 2026. **Question 23 is fully ratified**, including A1–A4, J01–J16, V01–V12 and C01–C22, its monetary definition, issuer-based calendar periods, three-row Maia default and narrow US credit-card dating clarification. **Question 24 is unanswered.** This brief continues Phase 25 Grill with Docs; it does not authorize implementation or formal publication.

## The one decision

When an account holder deliberately wants to focus on one missionary's ministry or project, should the donor portal offer **one compact overview connecting available ministry updates and the person's related giving**, or **clear links directly between the existing filtered Updates and giving screens**?

This is a choice about presenting a ministry context. Q02 already settled the normal combined Updates reader; Q10 settled ministry filtering in History. Neither requires another overview. Conversely, the roadmap's per-missionary/project impact view does not mandate a new page, metric or reporting application. Both options can provide a coherent ministry context.

## A concrete example

Illustrative Maria gives USD50 monthly to River Community. She is separately authorized to read its published Updates. She comes to catch up on its latest news and check her recurring gift. The example assumes an ordinary current arrangement and a verified association between the financial designation and published content; it is not observed donor research or a new permission rule.

<!-- prettier-ignore -->
| | **A — One compact ministry overview. Recommended.** | **B — Direct links between existing screens.** |
| --- | --- | --- |
| Maria's experience | She deliberately opens River Community's overview. A short **Ministry Updates** section and a separate **Your giving** section provide relevant context together. **Read update**, **View giving history** and **Manage recurring gift** open the existing exact journeys. | She opens River Community's filtered Updates or giving screen directly. Clearly labeled links connect that screen to the ministry's other available reading or financial context. No extra combined overview is introduced. |
| Strongest benefit | Helps someone thinking about a ministry see its news and their related giving without first translating that thought into separate product sections. | Fewer distinct screens; especially efficient when the donor already knows whether they want to read, check History or manage a gift. |
| Real tradeoff | Adds a small composed destination and its maintenance. It needs reliable source associations and independently authorized sections; it can become redundant if allowed to grow. | Someone wanting the wider picture moves between screens. The exact ministry context must carry through clearly so they do not have to search or select it again. |
| Direct task visits | Existing exact post, gift, receipt, recurring-management and filtered History links remain direct. The overview is optional. | Same direct task access. |
| Scope | A restrained summary using existing reading and financial capabilities. | Connected existing capabilities without a combined summary. |

B is a complete and credible alternative. It does not mean generic links, lost filters or a deliberately cumbersome donor journey.

## Best recommendation

**Choose A — One compact ministry overview**, entered deliberately and kept small. Ministry connection is an explicit product goal, and a person may naturally think “River Community” before thinking “History” or “Updates.” An overview gives that thought a useful destination while retaining direct task routes.

The proposed presentation is a safe, recognizable ministry heading with **Ministry Updates** and **Your giving** as distinct, readable sections. A current recurring gift can supply a concise, source-qualified amount/frequency/status and a clear management link; History and full reading remain their established destinations. This does not require a new total, chart, full transaction grid, copied feed or large hero. It also does not imply another top-level My Ministries directory, compulsory chooser, universal Ministry entity or configurable page builder.

Use the shared **shadcn/Base UI `base-maia`** components and semantic tokens. Keep the ordinary reading order clear on mobile, use visible descriptive links rather than unexplained icons, and retain accessible focus and return behavior. ReUI continues to inform actual grids, particularly the full History destination; a compact overview does not need a grid merely to satisfy a library preference. Exact counts, responsive composition and exception copy belong in the selected-answer review, not another round of microquestions.

The strongest reason to prefer B is restraint: donors with a specific task can reach it immediately using capabilities already required. A should preserve that strength by never inserting itself into an existing task link. Its additional value is context for exploratory visits, not a mandatory extra step.

**This recommendation is product judgment.** No Asym study proves A improves satisfaction, retention or task completion. The sources below establish relevant current patterns and tradeoffs, not a universal winner.

## Current primary evidence

<!-- prettier-ignore -->
| Source checked on 8 September 2026 | Verified pattern | Appropriate use and limits |
| --- | --- | --- |
| [Planning Center My Giving redesign](https://www.planningcenter.com/changelog/giving/improved-refreshed-my-giving-experience-in-church-center), 3 November 2025 | A concise overview connects giving information to recurring/payment management; History includes a fund filter. | Supports summary-to-detail navigation and B's useful filtered destination. It does not establish a combined per-fund content page. Vendor statements that the redesign is easier are not independent comparative evidence. |
| [GlobalGiving project reports](https://support.globalgiving.org/hc/en-us/articles/360026176532-Who-sees-my-reports), current undated guide | Approved reports appear in their project context for supporters and prospective supporters. | Supports the real value of project-specific reporting. Its public audience and automatic email rules do not transfer to Core's independent audience, Hide and email controls. |
| [Fundraise Up portal configuration](https://fundraiseup.com/docs/donor-portal-configuration/) and [donor experience](https://fundraiseup.com/docs/donor-portal-experience/), current undated guides | Donation history can identify designations; recurring details retain their transaction history. | Supports recognizable purpose within actual records and precise detail links. It is not evidence of a combined ministry overview. Core does not adopt designation-hiding defaults, vendor cancellation hurdles, account-currency reporting or automatic association policies. |
| [Patreon member navigation](https://support.patreon.com/hc/en-gb/articles/19501240539405-Navigate-the-Patreon-app-as-a-member), updated 9 July 2026 | Combined reading and creator-focused pages coexist; the focused page also links to the person's membership management. | A comparable content-and-financial-context pattern for A. Do not import paid content access, discovery ranking, shops, chats or the provider's Block action that cancels future payments. Donating, hiding Updates and canceling a gift remain separate in Core. |
| [World Vision support center](https://www.worldvision.org/sponsor-a-child/support-center), current undated guide | Provides distinct account destinations for giving history, commitments and sponsorship connection; annual receipts remain within a documented giving journey. | Supports keeping task destinations clear. It does not prove a combined per-ministry screen, and child-sponsorship communication or call-to-cancel rules are not Asym requirements. |

Root verified these current pages directly. The broader peer research also inspected Givebutter's campaign-update pattern; it supplies no additional authority for public access, milestone posts or donor enrollment. No recommendation depends on an inaccessible World Vision app page or search-only evidence.

## Repository facts and why this remains open

Source checkpoint: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Active Phase 22 documentation checkpoint: `70c50e8c97556c43be5543332fb0993b468b90ab`. Three independent owner/product/UX passes reviewed the remaining frontier and prior decisions.

- **Roadmap:** `docs/prds/sitestacker-parity/roadmap.md:2871–2874` includes a per-missionary/project impact view, currency-partitioned totals and governed CSV. It does not prescribe this composition. Money is giving, not proof of attributable ministry outcomes.
- **Q02/Q10:** normal combined Updates and full History with optional ministry/Fund filters are settled. This question does not reopen either default.
- **Q07/Q21:** publishing-source Show and Email preferences have independent scope and saves. A person, author, Page and designation are not interchangeable publishing-source identities.
- **Q19/Q22/Q23:** Home welcome/financial orientation and recurring Current/Past management remain settled. This focused context is optional; it does not replace Home, create another financial command or redefine the annual Home measure.
- **P22 binding:** `docs/prds/sitestacker-parity/phase-22-public-ministry-pages.md:43–47,427–436,495–500,590–595` establishes qualified Page subjects, one exact giving Designation per released Page and a separately owned versioned Page Feed Binding. One Page→one Designation does **not** establish a unique inverse Designation→Page or publishing source.
- **P22 audience:** `docs/adr/0128-canonical-ministry-update-audience-release-projections.md:29–65,75–90` keeps independent audience releases and current access. It forbids including an Update merely because author, subject, project or designation seems related.
- **Current implementation:** inspected donor routes contain Home, feed, History, pledges, wallet and settings; no donor ministry-detail route was found. Public worker/CMS routes are separate. Existing fixtures, feed filters and capped financial snapshots are predecessor behavior, not proof of a complete safe ministry context.
- **Existing owner work:** current [P22-23, issue #1304](https://github.com/Asymmetric-al/core/issues/1304), remains open for independently released supporter Update projections. Its content-access owner must be reused; it does not authorize donor financial access or settle Q24.

The notebook's ministry/impact-context coverage item remains open. That makes this a substantive product choice, not a decision invented from a missing test or an arbitrary visual detail. It does not prove every other Phase 25 implementation dependency is ready.

## Boundaries shared by both options

1. **Verify the connection.** Crossing from a financial designation to ministry content requires an explicit owner-qualified association and safe label. Never match names, choose the first Page for a fund, infer from an author or create a shadow mapping registry. More than one valid association is not resolved silently. Exact routes/association contracts must be completed in the selected execution review.
2. **Keep reading and giving access independent.** Financial context follows the admitted personal or represented legal donor; content follows the current human reader and its own source rules. No shared email, donation, recurring arrangement or combined page creates audience permission. A reader can have Updates without giving, and a donor can retain legitimate historical money records without current ministry content access.
3. **Honor sensitive identity and current availability.** Source-approved aliases, media and labels remain separate from money access. Missing content does not erase independently permitted financial records; missing financial data does not block authorized reading. Do not fill absent information with zero, fictional updates or restricted biography/location data.
4. **Reuse financial truth.** No new per-ministry sum is selected. A USD100 gift split USD40 to this ministry and USD60 elsewhere is not USD100 given to this ministry. Whole-gift details, matched allocations, fees, later effects, issuer/currency and current authorization retain their owner-defined meanings. Q23's whole-contribution measure cannot simply be relabeled for a ministry.
5. **Use actual reporting without invented impact.** Show released Updates as reporting. Do not translate gifts into lives changed, progress scores, budgets, support health, donor ranks, private Field Account balances or predictions. A donor overview is not another reporting system.
6. **Preserve preferences.** Opening this context does not unhide a source, opt into email, follow a ministry or request an externally sent newsletter. Ordinary previews continue to honor Hide. Q07's exact-post exception does not automatically permit a new hidden-source feed; execution must reconcile that case explicitly.
7. **Keep direct journeys direct.** Exact post, receipt, gift and recurring-management links keep their intended destinations and return behavior. No compulsory overview detour. Cross-links retain only valid current context; unavailable or ambiguous mapping must not silently redirect to a different ministry.
8. **Keep the public and private surfaces properly owned.** No private giving data enters public CMS/publishing output or a shared public cache. The focused donor experience may reuse safe source projections; it does not duplicate the ministry Page or establish a new publishing owner. A shared private URL grants no rights and resolves each opener's own context.
9. **Bound the composition.** Use existing source projections and read/management paths with independent truthful section states. No fetch-all, second Updates engine, new account balance, persistent ministry enrollment, generic dashboard framework or new dependency migration is authorized by this presentation choice.

## What happens after the answer

Map and pressure-test the selected journey, including entry/return, non-donor readers, multiple funds/Pages, grouped recurring arrangements, split gifts, restricted or withdrawn identity/content, hidden Updates, incomplete imports, independent errors and current authorization. Resolve exact labels and Maia presentation, owner associations and falsifiable acceptance criteria as one coherent review. Do not turn card counts, spacing or routine implementation choices into an endless questionnaire.

Then bring the corrected execution back for explicit ratification. No `/to-prd`, `/to-issues`, canonical ADR/OpenSpec/source edit, dependency upgrade or provider/GitHub mutation follows automatically. **Q14 G01 remains an unresolved native contract.** No new donor interview, target runtime/SQL/browser test, performance measurement or financial action was performed or claimed for this next-question research.

Question 23's ratification is recorded in the [grooming notebook](../decision-log.md); its historical review bundle remains unchanged.

**Founder decision pending: how should someone focus on one ministry inside the donor portal?**
