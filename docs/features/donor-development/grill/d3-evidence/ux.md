# D3 — one ordinary ministry partnership: practice and UX adversarial review

> Research input, 2026-10-09. The [consolidated D3 review](../phase27-d3-adversarial-review.md)
> reconciles these recommendations and controls decision status. This is
> grooming evidence, not an approved schema, formal specification or proof
> of application/production qualification.

Research/grooming input, 2026-10-09. Parent reports founder selection of one ordinary supporter–ministry partnership covering prayer, financial participation and particular asks, with extra journeys only for genuinely independent continuing purposes. D1 and amended D2 remain ratified. This review does not ratify D3, choose stage names, admit new target types, create an approval process, prescribe a database schema or implement anything.

## Disposition

**Retain the direction with explicit interpretation safeguards.** The strongest reason is reduced duplicated responsibility, follow-up and history for the ordinary relationship, not the fewest possible database rows. One partnership does not mean one financial state, one task, one owner, one permission boundary or one mutually exclusive mode of participation. Additional journeys must express genuinely independent continuing cultivation, not compensate for a weak ask/task view or a team boundary.

The main product uncertainty is whether real agency scenarios can consistently distinguish an independent continuing purpose from an ask, activity, assignment or other owner's program. Do not resolve that uncertainty by adding a configurable purpose catalog or manager approval to every creation. Show real examples to staff and test the distinction. No official source establishes an exact equivalent of Core's enrollment or proves universal superiority of this model.

## Strongest alternative and no-build challenge

The strongest simpler alternative is **one ordinary journey for the same supporter and ministry, with separate asks and shared tasks, and no additional concurrent journey capability for that pair**. It could handle all ordinary examples studied: prayer participation, monthly support, a special equipment ask, annual renewal, different staff, different currencies and different response dates. It avoids an exception policy and all purpose-selection UX. This is a serious alternative, not a straw man.

Its limitation is that D1 and the user's original requirements already preserve legitimate independently managed purposes. A blanket single-journey rule would silently reverse that choice or force unrelated continuing work into custom fields. Recommend retaining the possibility while keeping admission narrow, understandable and evidence-led. The opening UI should not demand that every user design a purpose hierarchy. Nor should hypothetical flexibility drive a general-purpose engine.

A still smaller **no-enrollment** alternative—Party, assignments, saved views, tasks and asks alone—remains plausible for basic CRM, but does not express accepted continuing purpose-specific cultivation independently of Party/ask/task state. It would reopen D1 rather than solve D3. Reuse these records and keep the enrollment thin. Do not add duplicate membership, giving totals, communications, assignments or encounter stores merely because the journey exists.

**Exact bounded correction:** “The ordinary ministry partnership is the default home for its prayer and financial participation, successive asks and continuing stewardship. An additional journey is justified by independently continuing cultivation that needs its own progression, follow-through and ending—not merely another ask, task, staff team, currency, annual cycle or participation label. This rule does not introduce a configurable purpose engine or routine manager approval.”

**Falsification:** If every real candidate for another journey is adequately explained and operated as an ask, shared task, assignment or existing owner record, there is no demonstrated need for a broad secondary-journey UI. If the single ordinary journey repeatedly makes a legitimate independent purpose disappear, loses obligations or forces false stages, the boundary or presentation needs amendment. Neither result licenses violating existing owner scopes.

## Concern U1 — one relationship must not become a global financial pipeline

**Severity high; likelihood high if conventional sales-board stages are copied.**

**Evidence:** MPDX's current official help explicitly says a contact can have only one status and suggests tags when more than one applies. It mixes financial/prayer partnership status with commitment reporting; that is a documented limitation. Salesforce current nonprofit guidance puts a particular solicitation on an Opportunity; Virtuous gives a specific Gift Ask its own tasks and attributes. P9 A12 explicitly forbids cultivation stage as Party lifecycle. **Inference:** D3 should improve on the exclusive-status trap rather than reproduce it at the journey level.

**Failure scenario:** a church is an established prayer and monthly financial partner, has an annual increase request under consideration, and declines a one-time equipment ask. One global “Asked / Declined / Financial Partner” stage cannot describe that without misleading users. Declining equipment must not erase ongoing partnership, change the annual ask or rewrite commitment truth. A prayer-only partner is not waiting to be promoted to financial value.

**Answer effect:** safeguard preserving the selected single ordinary journey. Stage names and transition rules remain separate decisions. If displayed participation markers are later added, their evidence, edit rights and meaning must be decided; this review does not introduce new flags, tags or a participation catalog.

**Exact bounded correction:** “The journey's stage describes the continuing development relationship for its purpose. Each ask retains its own status, dates and next work. Prayer and financial participation may coexist; neither a gift, a declined ask nor a participation label automatically changes the journey's stage.”

**Meaningful proof:** one authorized screen can correctly explain all four facts in the scenario without duplicating journeys or changing unrelated source states. Ask the operator which item was declined and what remains active; a wrong answer is a design failure, even if the backend is technically correct.

## Concern U2 — organizational charts become fake purposes

**Severity high; likelihood high where staff and missionaries cooperate.**

**Evidence:** ratified P9 assignment model supports multiple role-qualified assignees/one primary, and D2 separates participation, responsibility and permissions. Salesforce notes and actions can refer to distinct work without cloning the constituent. **Inference:** different staff do not establish different relational purposes.

**Failure scenario:** a regional representative, missionary and church-relations officer each creates their own “partnership” because each needs a task list or cannot see the other's work. The same church receives duplicate follow-up and appears three times in organization totals. The reverse failure is prohibiting two genuinely distinct purposes because the same staff member manages both.

**Answer effect:** retain D3; responsibility and authorization must be handled through their owners, not by inventing parallel purposes. One source does not imply everyone sees everything or that all owners share one task.

**Exact bounded correction:** “Different teams or responsible people alone do not justify another journey. Distinct continuing purposes may share an owner; one purpose may involve several role-qualified people. Use authorized work views and task responsibilities rather than duplicate partnership records.”

**Meaningful proof:** two authorized workers create different legitimate tasks for the same ordinary relationship and see their own work without manufacturing a second journey or second identical outreach. A user without appropriate access receives neither automatic membership nor private context when trying to reuse work.

## Concern U3 — ‘independent purpose’ becomes jargon or paperwork

**Severity medium-high; likelihood high if implemented as a type catalog or mandatory essay.**

**Evidence:** no reviewed vendor procedural source establishes Core's independent-purpose test. This is Core product judgment. Existing user request says one meaningful decision at a time, plain language, no arbitrary workflow language or competing source owners. **Inference:** a short explanation of what continues separately is sufficient product context; no manager-approval process follows from the choice.

**Failure scenario:** workers must pick from “ordinary / ancillary / institutional / strategic / temporal” types they do not understand, request permission for every special ask, or create new free-text purpose values to get around duplicate warnings. Naming the same relationship differently must not manufacture independence.

**Answer effect:** no mandatory catalog or approval bureaucracy. Ordinary asks should remain ordinary; the second-journey path may expose a brief explanation but must not silently ratify new stage presets, object types, authority or approval rules.

**Exact bounded correction:** “Before starting another journey, explain in ordinary language what continuing relationship purpose it manages separately and what can progress or end independently. Another label or another ask is insufficient. Use existing authority to create allowed work; this choice does not add routine manager approval.”

**Meaningful proof:** staff can classify real examples without being taught database terms: special equipment ask → existing journey; another representative → responsibility; annual renewal → ask; independently continuing relationship → candidate for separate journey. Test an actual agency-supplied independent-purpose example, not one invented solely to justify architecture. If reviewers repeatedly disagree, refine the product boundary before encoding a configurable taxonomy.

## Concern U4 — duplicate prevention leaks hidden work or silently reuses it

**Severity critical for restricted work; likelihood medium.**

**Evidence:** P9 permission-bound search and P3/P10/P12 disclosure rules are inherited. Salesforce distinguishes confidential summaries from ordinary account-visible summaries. D2 granted no new sharing. **Inference:** a globally useful duplicate check is not permission to expose the existing journey, owner, supporter connections or counts.

**Failure scenario:** a user receives “Already managed by the Restricted Country team”, sees an inaccessible title in a duplicate picker, or gets silently attached to a hidden record. Conversely, a generic success message implies creation when the server refused it. Client-side filtering after duplicate enumeration already exposes hidden data.

**Answer effect:** reuse only when current authority permits the relevant record/action. An existing record cannot become a disclosure oracle. A safe unavailable outcome and existing authorized operations route are required; exact authorization/constraint strategy belongs to the engineering and permission review. Do not infer that hiding a title alone solves the oracle.

**Exact bounded correction:** “Offer existing work only when the user is authorized to see and act on it. Duplicate handling must not reveal hidden journeys or silently grant access. When work cannot be safely started or reused, report an actionable unconfirmed/unavailable result without disclosing the hidden reason, preserve permitted draft work, and use the existing authorized review route.”

**Meaningful proof:** use identical visible inputs with no hidden record, an inaccessible existing record and an accessible record; inspect server responses, result counts, errors, links, notifications and cache. The permission design must prevent unauthorized existence inference where required, not merely suppress names. Authorized reuse returns the intended source; forbidden reuse never manufactures a second record or apparent success. PostgreSQL/constraint/revocation proof is owned by other reviewers and was not run here.

## Concern U5 — one journey is misread as one action, or shared actions hide obligations

**Severity high; likelihood medium-high.**

**Evidence:** roadmap P27 requires each active enrollment to have a next shared task or owned actionable exception. MPDX Mobile prompts for next actions, but does not prove this invariant. Virtuous explicitly associates tasks with a particular ask. **Inference:** an at-a-glance next action may be singular without deleting several concurrent tasks or the independent requirements of active asks.

**Failure scenario:** the church visit is marked complete and annual-ask follow-up disappears; a low-priority prayer-letter task makes an overdue equipment response look healthy; every new ask creates another “next task” that duplicates the same intended meeting. With legitimate extra journeys, completing one shared encounter is wrongly treated as satisfying all purposes.

**Answer effect:** clarify presentation without deciding detailed task association or coverage semantics now. Shared source identity prevents duplicate effects; it does not declare distinct purposes equivalent.

**Exact bounded correction:** “Show the appropriate next action and make other due or blocked obligations discoverable. One ordinary journey may have multiple meaningful tasks and asks. Completing an action satisfies only the obligations it actually addressed; shared tasks and encounters must not silently hide unrelated follow-through.”

**Meaningful proof:** annual ask, special ask and ongoing partnership have distinct due work; one meeting legitimately addresses two matters and records the permitted encounter once; unresolved third matter stays visible. The same intended reminder is not sent twice, while two genuinely distinct permitted actions remain distinct.

## Concern U6 — donor dignity and contact restrictions are collapsed into participation labels

**Severity high; likelihood medium-high.**

**Evidence:** MPDX labels financial, special and prayer partnership, while its single status is exclusive. The user's settled scope explicitly rejects financial valuation of human worth and requires never-ask/channel-purpose restrictions. AFP ethical guidance was retrieved earlier in this session, but this fresh AFP recheck returned HTTP 403; no new AFP verification is claimed. **Inference:** one journey should preserve simultaneous participation without making prayer an entry stage to solicitation.

**Failure scenario:** a prayer partner is repeatedly prompted to become financial; a gift is interpreted as consent to all future appeals; stopping financial support marks the whole church relationship failed; a financial-only dashboard hides nonfinancial relationship care. Prayer involvement may also be sensitive religious information, so do not record or infer it unnecessarily.

**Answer effect:** preserve D3; no new person scoring, prayer ranking or inferred participation. Financial facts do not prove prayer participation, and neither participation fact establishes channel permission.

**Exact bounded correction:** “Prayer, financial and other permitted participation are not a ladder of value. Record only purposeful, source-supported relationship information; never infer prayer participation or solicitation permission from giving. Declining or ending one form of support does not by itself end every permitted aspect of the partnership.”

**Meaningful proof:** prayer-only supporter with never-ask restriction still has an honest internal next action or exception; no financial suggestion appears. Financial support stops while a permitted nonfinancial relationship continues; no silent stage downgrade, unsolicited outreach or fabricated prayer evidence occurs.

## Concern U7 — shared journey UI overstates privacy and scope

**Severity critical for disclosure; likelihood medium.**

**Evidence:** user source ownership and ratified D2 explicitly separate staff, missionary, finance and publishing. Salesforce's ability to refer one interaction summary to account and opportunity does not mean every reader sees both or inherits confidential notes. **Inference:** “same journey” is source identity, not an access group or joint authorship guarantee.

**Failure scenario:** a missionary sees staff brief information because both work on the ordinary relationship; an agency-wide purpose is folded into a ministry context; another currency or legal entity is silently combined because the UI calls everything one partnership.

**Answer effect:** ordinary same supporter/exact ministry/scope only. D3 does not merge Party identities, legal entities, financial sources or independent agency-level relationships. Currency differences alone do not create another journey, but amounts retain independent currency and period meanings.

**Exact bounded correction:** “One journey does not combine permissions or financial meanings. Use independently authorized views and source references; keep each entity, currency, commitment, gift and private interaction within its owner's rules. Other agency/church/project purposes are not forced into this ordinary ministry partnership.”

**Meaningful proof:** role-specific views show permitted actions on the same source with no duplicated encounter text; staff-private data never appear in missionary summary, search, export or notification. Same journey may reference two currency-specific asks without displaying an invalid combined total.

## Concern U8 — board-first design and poor connections obscure actual state

**Severity high; likelihood high for field work and parallel asks.**

**Evidence:** W3C 2.5.7 requires a single-pointer non-drag alternative independently of keyboard; 4.1.3 requires programmatic status messages. GOV.UK error summary guidance supports focusable summary plus linked inline errors. Current CRM board groups loaded rows by lifecycle and requires loading the table first; it is not evidence of complete cultivation state. **Inference:** start with a concise summary and asks/tasks list; a board is an optional view of a specific type of state, not the full relationship model.

**Failure scenario:** a worker drags “Smith Church” to Declined intending only one equipment ask; mobile users cannot see the other asks; stale board success survives rejected write; a reconnect silently replays creation and yields duplicates.

**Answer effect:** preserve accessible list/detail controls and honest pending/conflict outcomes. Existing shared base-maia/Base UI remains mandatory. D3 does not authorize offline consequential replay or write-through derived UI state.

**Exact bounded correction:** “Make it explicit whether the user is changing the partnership, an ask or a task. Offer clear click/tap and keyboard controls alongside any drag behavior. Distinguish pending, confirmed, rejected and unknown outcomes; safe retry resolves the same intended action and reconnect never silently creates or advances work.”

**Meaningful proof:** on a narrow touch screen and keyboard-only, change one ask while the relationship and other ask remain unchanged. After network loss following accepted save, retry shows the same source operation once. Concurrent edits produce honest conflict/recovery. A screen reader announces status/errors, focus is restored, and full authorized names/purpose are accessible without hover.

## Concern U9 — simplicity is mistaken for client-only deduplication or an overbroad database rule

**Severity high; likelihood medium.**

**Evidence:** user requires established server business commands, trusted context, appropriate constraints/concurrency, and permissions before enumeration. P9 already separates record ownership from derived views. No Supabase/database implementation is qualified by this UX review. **Inference:** a simple product rule can have a small explicit server model; it does not justify uniqueness by visible name, a browser-only check, or an arbitrary `purpose` string that makes duplicates legal.

**Failure scenario:** two creation attempts race after both see “no result”; a user changes a label to bypass a duplicate; broad permanent Party/ministry uniqueness disallows legitimate ended history or future distinct purpose; a generic JSON configuration engine adds more rules than the product needs.

**Answer effect:** preserve a thin source model with appropriate owner references; exact active uniqueness, reopening, history, purpose admission and semantic retry identities require separate decisions/engineering. Do not ask the founder to design a Supabase index.

**Exact bounded correction:** “Keep the model as small as the accepted behavior allows, with authoritative identity and server-enforced creation. D3 supplies a business boundary, not a final uniqueness key or configurable purpose schema. Resolve races and retries without relying on client search results or mutable labels.”

**Meaningful proof:** database reviewer should prove concurrent ordinary creation, authorized existing reuse, ended/reopened history and legitimate independent-purpose creation with real PostgreSQL. For UX, the same race must return a comprehensible permitted outcome without lost input, false success or hidden-record disclosure. This report does not replace Supabase owner review or imply those checks passed.

## Concern U10 — lifecycle and migration silently erase the distinction

**Severity high; likelihood medium.**

**Evidence:** D2 explicitly preserves historical meaning, person intentions and correction versus new work. MPDX status/tag workaround does not identify Core enrollment boundaries. **Inference:** collapsing existing prayer/financial records by matching names alone would fabricate a single source history; making every imported tag its own journey would fabricate obligations.

**Failure scenario:** importer turns “Prayer Partner” and “Financial Partner” tags into two active journeys, each with fresh outreach; an attempted consolidation deletes history or assumes different owner records are duplicates; a change of ministry purpose is treated as another ask under the same ordinary record.

**Answer effect:** no automatic merge, fan-out, history rewrite or effect replay follows from D3. Keep existing obligations attributable and review genuine purpose changes under D2.

**Exact bounded correction:** “D3 guides new intended work; it does not identify duplicates in retained data by name, tag or participation label. Reconciliation must preserve source history, suppression and completed effects, and imports must not manufacture journeys, next actions or outreach.”

**Meaningful proof:** retained records with overlapping labels, differing responsible staff, completed tasks and contradictory timestamps remain intelligible after an owner-approved migration exercise; no hidden record union, revived consent or duplicate reminder. Migration evidence remains a future qualification gate, not permission to implement now.

## Falsifiable staff-pilot plan for this decision

These are proposed evaluation tasks, not new product features, implementation tickets or fabricated performance targets. Use representative staff/missionaries with actual role scopes and test data, not real donor contact. Predefine the interpretation and critical-error pass rules before observing results. Record completion, mistakes, backtracking, assistance, time and actual record/task counts; do not claim a numerical productivity benefit without measurement.

| Task                                                                           | Expected interpretation                                                                       | A result that falsifies the present design                                                                       |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Church prays, gives monthly, considers annual increase, declines equipment ask | One ordinary journey; distinct participation/source facts and two independent asks            | Operator ends/downgrades entire partnership, changes wrong ask, or needs a duplicate journey to understand state |
| Regional representative and missionary need distinct legitimate work           | Same journey, role-specific responsibility/tasks under permitted views                        | Team-specific duplicate journey or broadened access is required                                                  |
| Same person proposes a genuinely independent continuing purpose                | Evaluate purpose's progression/follow-through/ending, not owner difference                    | No way to distinguish it without artificial names; or every special ask is mistaken for one                      |
| Existing ordinary journey is visible and actionable                            | Clearly reuse intended record, preserve its history and obligations                           | User cannot tell why it exists, creates duplicate, or unexpectedly joins/changes ownership                       |
| Existing work is hidden                                                        | Safe honest outcome with no unauthorized inference or access; permitted work remains possible | Title/count/owner leaks, silent join, false success or duplicate source                                          |
| Prayer-only partner refuses solicitation                                       | Respectful permitted care/internal task/exception, no financial pressure                      | Product suggests an ask, marks relationship low value or invents prayer evidence                                 |
| Disconnect after accepted creation; retry from mobile                          | One confirmed operation/source; exact target and purpose stay clear                           | Duplicate journey/task, silent replay, or no recovery from unknown outcome                                       |
| Long names and translated labels; keyboard or touch without drag               | Correct exact supporter/ministry/ask selection with usable focus/feedback                     | Truncated labels force guessing, status depends on color, or inaccessible action                                 |

A critical privacy/identity/financial/duplicate-effect error is a failure of that scenario, not something averaged away by faster completion elsewhere. If staff repeatedly cannot explain why a second journey is justified, return the admission question to grooming; do not solve comprehension by adding approvals or an ever-larger catalog. The pilot must include a credible genuine independent-purpose case supplied by an agency; without one, the broader extension remains weakly evidenced.

## Fresh source rechecks and limits

Public official pages re-fetched **2026-10-09**; local captures under `/workspace/scratch/fundraising-sources/d3-*`. Help is procedural evidence, not independently tested deployed behavior. No portfolio-performance statistics used.

| Source                                                                                                                                                                           | Current supported fact                                                                                                                                                          | Edition/source date and limit                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MPDX Status, MPD Phase](https://help.mpdx.org/article/162-mpdx-status-mpd-phase)                                                                                                | One status per contact; financial/special/prayer labels; tags suggested for overlap; monthly financial bar depends on partnership/gift-start facts                              | MPDX Web; updated 2023-09-18. Explicit limitation to avoid, not Core stage design                                                                                       |
| [MPDX Setup an Appeal](https://help.mpdx.org/article/190-set-up-appeal)                                                                                                          | Specific financial campaigns outside monthly goals; audience filtering and exclusions                                                                                           | MPDX Web; updated 2022-10-13. Does not imply each appeal is a new continuing relationship or prove permission recheck at send                                           |
| [MPDX Mobile Tasks](https://help.mpdx.org/article/500-tackle-mpdx-mobile-tasks)                                                                                                  | Task details/history, overdue-first view, prompts for next actions                                                                                                              | MPDX Mobile; updated 2021-11-29. No performance or mandatory-invariant proof                                                                                            |
| [Salesforce Work with Prospects and Donors](https://trailhead.salesforce.com/content/learn/modules/nonprofit-cloud-philanthropy-and-partnerships/work-with-prospects-and-donors) | Action plans and interaction summaries; Opportunity for particular solicitation; account/opportunity references; confidentiality distinction; commitments/transactions separate | Integrated Fundraising in Agentforce Nonprofit, formerly Nonprofit Cloud; not NPSP. Sitemap lastmod previously verified 2026-09-08. No exact Core enrollment equivalent |
| [Virtuous Create a Gift Ask](https://support.virtuous.org/hc/en-us/articles/10647492200589-How-Do-I-Create-a-Gift-Ask)                                                           | Specific solicitation, ask type/currency, recurring frequency, team members and associated tasks                                                                                | Virtuous CRM+; API content edited 2022-12-14. Does not establish Core forecast/privacy/concurrency guarantees                                                           |
| [Blackbaud Opportunities](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-opportunities.html)                                                          | One constituent per opportunity; multiple opportunities per constituent                                                                                                         | Raiser’s Edge NXT web help, undated current publication. Opportunities are not claimed to equal continuing cultivation journeys                                         |
| [W3C Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)                                                                                    | Single-pointer non-drag alternative required independently of keyboard                                                                                                          | WCAG 2.2 SC 2.5.7 AA; Understanding updated 2026-08-10. Informative guide quotes criterion                                                                              |
| [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                                                                                          | Status changes programmatically determinable without receiving focus                                                                                                            | WCAG 2.2 SC 4.1.3 AA; Understanding updated 2026-05-11. Does not define business retry semantics                                                                        |
| [GOV.UK Error Summary](https://design-system.service.gov.uk/components/error-summary/)                                                                                           | Focus summary, matching inline errors and links to correction controls                                                                                                          | Current Design System; no single page update date captured. Reuse behavior through Core controls, not its visual system                                                 |
| [AFP Donor Bill of Rights](https://afpglobal.org/donor-bill-rights)                                                                                                              | Prior session research supports dignity, intent and confidentiality                                                                                                             | Fresh request returned HTTP 403. Do not describe as reverified in this pass; Core user/owner rules independently require these safeguards                               |

Relevant repository evidence re-read: P9 A12 at `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:484`; cultivation/lifecycle/ask prohibition at :492; saved-view and board contract at :508; ratified D2 and Q3 purpose-boundary note in `docs/features/donor-development/grill/`. Current `apps/admin/app/(app)/crm/kanban-view.tsx:29` derives columns from loaded Party lifecycle, :37 requires table loading, :62 counts loaded rows. **Temporary bridge**, not durable proof of a permission-complete cultivation/ask board. Shared source models, source-linked encounters and separate asks/tasks are **durable patterns**; focused quick-task views are **useful precedents**. Exclusive prayer/financial rank, team-created fake purposes, copied private history and label-based identity are **conflicts with first principles**.

## Proposed bounded D3 wording

> Within the same exact supporter, identified ministry and organizational scope, one ordinary continuing partnership is the default. Prayer and financial participation, successive annual or special asks and continuing stewardship can coexist there without ranking people or turning participation into consent. The journey's cultivation stage is separate from each ask, task, commitment and gift state.
>
> Another concurrent journey is for a genuinely independent continuing cultivation purpose that needs its own progression, follow-through and ending. Another ask, team, representative, currency, year or label alone is insufficient; different owners are not required for legitimate independent purposes. Prefer the existing journey for ordinary work without creating a purpose catalog or routine approval bureaucracy.
>
> Reuse, creation and visibility remain independently authorized. Duplicate handling must neither reveal hidden work nor silently grant access. Shared source identity does not combine private context or financial meanings, and one next-action summary does not erase other obligations. D3 does not settle active uniqueness, ending/reopening, precise purpose admission, sharing, stage presets or migration rules.

This is proposed wording for the parent review, not a ratification statement. No tests, pilot, live deployment, network-failure experiment or Supabase/PostgreSQL proof ran in this UX research pass.
