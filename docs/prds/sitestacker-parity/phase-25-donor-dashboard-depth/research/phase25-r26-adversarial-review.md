> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 9 September 2026:** Conrad accepted Q26 A1–A5/J01–J18/V01–V14/C01–C22, including zero ordinary artifacts for none, historical access, text-only progress, twenty-record continuation, bounded request/dispute safeguards and ninety-day encrypted text custody. Earlier proposed/unanswered wording below is historical. T01–T20 remain required target proof; ratification does not certify implementation or measured UX.

# Question 26 — Quiet, relevant-only Pledges: corrected execution

9 September 2026. Conrad selected A, a separate quiet Pledges entry, and clarified that fixed campaign commitments are uncommon: people without them must see no UI artifacts. **Disposition: Accept with required amendments.** The selected direction is preserved. The execution below is proposed for ratification; Q01–Q25 remain ratified.

## Exact corrected decision

> Make Pledges the quiet primary donor destination for the existing fixed-total Campaign commitment product. On ordinary portal entry, expose it only when the source proves that the current authorized giving context has at least one donor-admitted fixed pledge, including accessible history. For a context with none, render no pledge navigation, card, heading, badge, placeholder, empty-state promotion, search suggestion or preference group. An unproved first-load result also renders no unsolicited pledge artifact without being recorded or described as none. Explicit pledge/deep-link visits receive truthful local loading/empty/unavailable responses and safe return. Preserve Recurring giving and manual/external Other commitments; all fixed-pledge entry points resolve the same source view. Provide a small list and focused detail with source-owned promise, fulfillment, plan and safe lifecycle meaning; an ordinary Request change records a nonexecuting source request, while an explicit ownership dispute uses a separately qualified protective authority-review intake. Neither navigation nor a pledge itself authorizes collection, changes a recurring agreement, creates money or edits staff-owned terms. Compose through shared base-maia/Base UI, with bounded private source reads, exact P12 authorization, coherent currentness, durable request recovery and targeted release proof.

### A1 — Absence means zero unsolicited UI artifacts

The founder's statement that these commitments are uncommon is product context, not a measured percentage. Design the ordinary portal primarily for people without them. **Known none means structural omission**, not CSS-hidden controls, disabled navigation, an empty tile or a zero badge. There must be no Pledges label/icon, sidebar/mobile menu item, reserved spacer, pledge-specific skeleton, Home widget, empty card, tooltip, first-use tour, command-palette suggestion, notification invitation, settings/reminder group, Create your first pledge prompt or upsell for that context.

Keep the rest of the portal usable while the optional source discovery check runs. On an unproved cold/context-switched result, omit the extra entry without converting unknown into a persisted false/zero or telling the donor that no records exist. Do not show a pledge-specific error outside an attempted pledge task. Diagnose failures through existing internal source observability. Do not fetch a full pledge list, amounts, schedules, reminders or request bodies merely to decide menu presence.

The predicate is **existence of a currently donor-admitted fixed-pledge record in the exact current giving context**, not positive remaining amount, active status, latest page content, donor role, giving frequency, Stripe linkage, household membership or a loaded array. An authorized matching row proves presence; absence requires conclusive source and permission evaluation. Accessible ended/completed/superseded history and admitted authority-review records remain discoverable. Staff-only drafts, ambiguous imports, invalid/tombstoned records denied by the source and another Party's records do not qualify.

This is not a promise that a typed/bookmarked invalid URL renders nothing. An explicit request for a pledge page needs a safe local result and Back/return. Exact-resource not-found/denied responses must not disclose whether another person's pledge exists. That narrow attempted-task response is not ordinary discovery, promotion or a dashboard artifact.

Entry admission also requires a source-qualified destination or limited list projection. Access to one exact record must not silently become unrestricted list permission. A qualified direct record link remains usable under its own grant even when broader neutral navigation cannot be admitted. Existence and destination admission are source checks, not a new donor permission system.

### A2 — One fixed-pledge destination, with existing Other access reconciled

Use **Pledges** as the short navigation/page label and **Campaign commitment** on its individual record, with one brief explanation: a promise of a fixed total that does not itself authorize automatic payments. This is an explicit donor presentation refinement of P16's wording, not a domain rename.

Keep Recurring giving directly accessible and preserve Q22 Current/Past semantics. The existing #811/Q22 donor Other commitments projection remains independently available and type-aware. Its manual/external recurring records stay supported. Fixed-pledge contextual links resolve the same Pledges detail/read owner; do not create two independently maintained fixed-pledge lists or quietly discard the inherited Other projection. This placement/adoption clarification must be captured in #811's owning contract when formal publication is authorized.

Place the conditional text entry in one stable secondary position in the existing navigation, adjacent to recurring management. No new bottom-bar icon, all-donor Home card, mixed giving-commitments parent, CMS menu builder, stored user feature flag or tenant-configurable display rule. Preserve exact resource links and a donor's active context/return; don't rename or hijack the legacy `/donor-dashboard/pledges` recurring route just because its pathname sounds convenient. Existing links must continue to reach their actual product.

### A3 — A small read experience with exact financial meaning

Use one all-available, source-authorized pledge list, including history, in stable immutable creation order, newest first with a stable tie-breaker. Do not copy recurring Current/Past grouping into a different lifecycle by assumption. Proposed list default: **twenty records per source page**, an explicit accessible Load more only when the source supplies continuation, no counts, chart, global total, toolbar, search/filter panel or empty promotional section by default. Rare use does not justify an unbounded query; an unusually long list remains fully reachable.

Each summary has a safe campaign/designation label, original currency, current commitment amount, Received and applied, and only material source-qualified state/date information. One View details action opens its exact record. On the detail, place the commitment summary first; then its actual expected dates/undated meaning and permitted related gifts/recurring links; then the quiet request/reminder controls. Do not show empty modules or fetch restricted subordinate detail just to hide it afterward.

The default progress display is **text, not a percentage bar**: for example, Current commitment $1,200; Received and applied $300. Current promise, fulfillment, remaining expectation, release/end, plan and collection are different source facts. Neither `P − F` nor a generic giving sum is an authoritative remaining amount. Zero expected does not mean fully given; fulfillment above a reduced current pledge does not become a refund/credit. Avoid a chart that appears complete because an expectation was released. The source's safe outcome explanation must remain visible when needed to explain an ended/reviewed/changed record.

### A4 — Complete the small request and authority-review journeys under P16

P16 already promises a donor change-request endpoint, but the complete donor input/result and receiving-work contract is not established in current implementation. Qualify **one P16-owned immutable request occurrence** linked to the exact pledge, actor/Party authority and observed terms/plan revision. Reuse the existing journal/idempotency/audit and service-desk machinery only through a finite typed nonexecuting request kind; if a physical child record is needed, it remains within this owner, not a new inbox/workflow product. No ordinary request may be claimed as an executable financial command.

Ordinary **Request change** asks one question, What would you like to change?, in a required nonblank plain text field. Reject empty/whitespace-only input. Proposed bound: **2,000 Unicode scalar values and 8 KiB UTF-8**, validated server-side; no attachment, rich text, contact duplication, amount/date editor, staff four-operation wizard or invented legal attestation. An authenticated server supplies attribution and exact scope. A donor describes a desired change; staff must still establish current authority and execute the separate D18 command. Request received means source receipt and actionable receiving work committed, not Terms changed.

Provide a separate quiet **I don't recognize this commitment** route. It is a finite explicit authority-dispute intake, never a classification inferred from ordinary request text. For the exact pledge over which the actor has current portal/request authority and the separately qualified protective intake capability, P16 records the request and places the pledge in its existing bounded authority-review state atomically, excluding it from applicable forecast/reminder use pending owner review. Do not require proving the disputed original promise valid before accepting this concern. The deliberate fixed dispute statement needs no mandatory ordinary-change prose. It does not end/correct the pledge, grant general staff review rights, remove history, stop an independently authorized recurring agreement, reverse money or imply all payments stopped. The exact qualification of this narrow donor-origin protective transition is a required owner amendment.

The existing pledge detail shows the initiating person's permitted request result and source-backed progress. There is no new donor request inbox or automatic email/bell family. An authoritative staff disposition and any linked D18 result control completion; a message being read or a provider callback cannot approve a change. Identity disputes, ordinary changes and staff resolutions remain distinct. Scope, retention, staff receiving capability and durable reconciliation must be qualified before exposing the request action.

Add an explicit request-text custody class: **ninety elapsed days from durable acceptance**, earlier restrictive privacy/safety erasure, extension only for an exact applicable legal/dispute hold. This is a proposed purpose default, not a claim that P16 already classifies arbitrary donor text as raw provider material. Keep the body encrypted and reveal it only through its narrow current request/evidence capability. Authorized staff manually confirm and normalize only the necessary exact instruction, disposition and evidence provenance into the proper source record; no automatic text-to-financial-command parsing or seven-year copy of the entire narrative. Minimized journal/results and authoritative evidence references follow P16 S.6's existing retention. At body expiry, deny reveal and purge under the owning procedure; retain truthful unresolved status if necessary, never fabricate completion or act on guessed missing evidence.

### A5 — Source-owned presence, access, state and adoption

P3/P16 supplies a minimal typed presence/availability discriminator through the shared API boundary and existing private navigation context. It is derived, not a persisted `hasPledges`, account feature activation, new registry or client-authoritative subscription. The pledge list/detail/request and presence share the same current authorization and kind rules. An existence query may stop after a qualifying row; it need not count or load every record. Never infer absence from a capped page or search result.

P12 remains the sole fine-grained authorization decision point with coarse trusted-Tenant RLS and structural scope constraints. Current context, not caller-supplied actor/owner/proof flags, controls reads and mutations. Private response/cache keys include exact Tenant/environment, human identity, permitted personal/represented Party context and applicable source/query generation; revoke/retire protected context before late responses or navigation restoration can display it. Public Page/CDN caches never contain pledge presence or private data.

Adopt the canonical fixed-pledge owner and reconcile the Other/legacy route readers before enabling the new destination. A phase contract or a passing predecessor test is not a deployed projection. No compatibility writes to legacy donor_pledges, provider fallback, table access grant for convenience or source reconstruction from cadence/payment history. Source failure, partial coverage and an unknown result remain visible only where the donor attempted that task; they never manufacture a pledge, balance or false success.

## Evidence, alternatives and current reality

The strongest alternative is the shared giving-commitments area. Planning Center documents that grouping, while Fundraise Up documents a distinct pledge section hidden when no pledge exists. Both are current patterns. A fits Conrad's rare-use context and Core's recurring-first ADR, while keeping two products easy to recognize. Fundraise Up's section does not prove a specific sidebar design, and its pledge payment/skip/pause controls conflict with Core's non-executing pledge: those controls are excluded. [Fundraise Up](https://fundraiseup.com/docs/donor-portal-experience/#pledge-management), [Planning Center](https://help.planningcenter.com/en/140951-manage-your-giving-information.html).

**Governing source:** ADR0012 separates recurring and fixed-total aggregates and makes fixed pledges a quiet, complete secondary workflow. P16 L/M/N defines promise/plans, conserving changes/resolutions and reminder authority; Q.4 supplies donor fixed reads/change requests; R.5 specifies donor-safe Campaign commitment copy. #811/Q22 preserve donor Other commitments. Q04, Q08, Q11/Q14, Q19/Q21/Q23/Q24 continue to own their distinct contexts and outcomes. Q26 refines donor discovery and completes its narrow request/projection contract; it does not reopen their decisions.

**Current implementation:** the actual donor navigation calls a legacy `/pledges` route Recurring Giving. The portal service reads at most100 legacy donor_pledges and normalizes them as recurring gifts. Scoped current runtime/migration searches found no canonical fixed_total_pledges, fixed donor read or change-request implementation. The route name is not proof that this feature exists. Existing primitive and grant behavior must be inspected, not inherited blindly.

**Actual checks:** seven existing tests passed across two pure/mocked donor-portal files. They exercise predecessor model/auth/ownership behavior, not target pledge existence, SQL/PDP, request atomicity, accessible UI or provider behavior. Current source/docs, component configuration and three independent owner/UX/data reviews inform this document. Target proof is listed separately below. No donor study, live database inspection or financial/provider operation is claimed. Full citations and command evidence are in the [evidence record](phase25-r26-evidence.md).

## Presence and navigation state matrix

<!-- prettier-ignore -->
| Source result / user context | Ordinary portal discovery | Explicit pledge task |
| --- | --- | --- |
| Conclusive no admitted fixed record | No pledge artifact anywhere in the ordinary portal. | Exact index may explain no accessible pledges; exact resource uses non-disclosing unavailable/not-found copy and return. No upsell. |
| Current authorized qualifying record | One quiet text entry in the stable navigation position; no count or Home promotion. | Direct list/detail, admitted fields and independent actions. |
| Accessible history only | Entry remains; history does not disappear because current remaining is zero. | Truthful ended/completed/current-source history; no restart/catch-up/charge inference. |
| Unproved first load, timeout or failed existence read | Extra entry omitted without recording/claiming absence; no Pledges skeleton/error/blank slot. Other portal work continues. | Local loading/retry/error belongs to this explicitly attempted destination; no fake zero/empty. |
| Previously valid presence refresh | Retain a label only while the existing context's current authorization/read lease still permits that safe presence. Never extend it using an error or stale cache. | Revalidate source before fields/actions. No stale financial mutation. |
| Party/Tenant/user change, signout or grant loss | Retire prior-context presence/data before rendering the new context; no cross-context flash. | Current allowed result or safe denial; no permission inferred from Back, URL or cached row. |
| Last accessible record becomes invalid/unavailable | Remove optional entry when authoritative state contracts. No empty replacement tile. | Preserve local focus and explain changed availability if already on that task; no silent redirect to another pledge. |
| Donor has only manual/external recurring Other facts | Preserve that independently authorized existing journey. Do not add Pledges or fixed-promise language. | Source-specific Other detail; no kind inference. |

No page-specific placeholder is needed for cold navigation discovery. If source latency causes the real optional link to appear later, it enters its stable slot without autofocus, announcement, animation or reordering the other entries. Pending confirmation is not a reason to block the entire portal shell. This must be verified with actual mobile/keyboard/AT behavior rather than paper reasoning alone.

## Mapped journey J01–J18

<!-- prettier-ignore -->
| ID | Moment | Required outcome |
| --- | --- | --- |
| J01 | Donor has no fixed commitments | Normal Home/navigation/preferences/search show no Pledges artifact, including during cold loading. |
| J02 | First source-admitted pledge appears | A quiet entry appears in its stable position; no celebratory banner, tour, badge or automatic reminder enrollment. |
| J03 | Personal/represented context changes | Re-evaluate exact authorized presence. Another Party's records cannot leak through labels or retained content. |
| J04 | Opens Pledges | One simple bounded list of all admitted records, history included; no forced Current/Past or filters. |
| J05 | Reads a summary | Safe campaign identity, original currency, current promise, actual applied fulfillment and material state; no invented balance or payment date. |
| J06 | Opens the exact record | Campaign commitment detail explains its fixed promise and non-executing nature in plain language; unrelated portal state is preserved. |
| J07 | Reviews dates and progress | Actual civil expectation dates/undated state and current source fold; no due debt, fake late payment, monthly normalization or completion from E=0. |
| J08 | Follows a gift or recurring link | Exact independently authorized source destination and return; no fulfillment inference from matching amount/fund. |
| J09 | Wants a change | One plain request field, context retained, no staff wizard or direct term editing. |
| J10 | Submits Request change | Atomically commit request/receipt/receiving work; show Request received and explain that this submission did not itself change commitment terms or recurring gifts. Show current source-backed terms separately because another authorized operation may have changed them. No new email/bell by assumption. |
| J11 | Double-clicks or loses response | Same operation/input reconciles one request. Changed same-key input conflicts. Do not say Changed or ask for a blind new submission. |
| J12 | Organization reviews/resolves | Source-owned request disposition and linked D18 result shown separately from delivery/read state; no guessed processing completion. |
| J13 | Does not recognize the pledge | Explicit protected dispute route, clear review consequence, narrow P16 authority review, no automatic end/refund/recurring stop. |
| J14 | Checks reminders | Existing eligible own-recipient purpose state/stop only; no donor enrollment On, cadence builder or staff contact selection. Stopping contact does not change the pledge. |
| J15 | Commitment ends/is revised or fulfillment reverses | Keep authorized history; current facts update coherently. No re-sorting by mutable amount, disappearance after zero or false Fulfilled. |
| J16 | Gets a deep link or uses Back | Exact authorized destination, authentication return if needed, retained safe reading position; generic unavailable result for inaccessible records. |
| J17 | Source or permission changes mid-task | Drop unauthorized fields/actions, reject stale commands, preserve a truthful local recovery path and safe focus. Other tasks continue. |
| J18 | Rare large list, low bandwidth or mobile/AT use | Bounded continuation, no all-history download, readable text and actual keyboard/AT/zoom/RTL support; no controls for absent modules. |

## Reviewed Maia presentation defaults V01–V14

<!-- prettier-ignore -->
| ID | Proposed default |
| --- | --- |
| V01 | Shared base-maia/Base UI and semantic tokens. No app-local primitive, palette, typography or motion system. |
| V02 | Pledges is a conditional ordinary text navigation entry; no numeric/new badge, unused mobile icon slot or all-donor Home module. |
| V03 | Structural omission when none/unproved cold presence; no hidden focusable nodes, offscreen labels, skeleton tile or empty-state promotion. |
| V04 | Pledges page: modest heading and one short explanation, then a simple vertical list. No hero, chart, campaign gallery or staff grid toolbar. |
| V05 | Twenty records per request, stable newest-created order/tie-breaker, explicit Load more only with authoritative continuation. Existing bounded client data tools; no forced grid or unbounded subscription. |
| V06 | Each pledge summary is readable text with a real heading/link, safe campaign label, original currency, current promise and Received and applied. No nested interactive whole-card trap. |
| V07 | Text progress is the default. No percent/ring/bar or bright milestone treatment; actual source amounts and material explanations remain visible. |
| V08 | Detail retains Campaign commitment meaning. Expected dates are expectations, not automatic charges. No dates means no dates recorded, not overdue or missing setup. |
| V09 | Hide absent subordinate modules. Expose plan/gift/linked-recurring detail only when admitted; keep actions independent. No button to invent a pledge payment method. |
| V10 | Request change uses one short plain text field and explicit Send request. Preserve safe input across errors; show truthful durable receipt without approval/term-change animation. |
| V11 | Separate quiet I don't recognize this commitment entry; concise explanation and deliberate Send for review. No guilt, typed phrase or unrelated account/security wizard. |
| V12 | Own-recipient reminder stop is the existing purpose-qualified control. No Off card for donors with no eligible pledge/contact, unsolicited On switch or channel picker. |
| V13 | Real semantic headings, readable wrapping, currency/date localization, contrast, Core touch targets, keyboard/AT, zoom/RTL/CJK and reduced motion. Material facts must not be line-clamped away. |
| V14 | Stable navigation/focus/Back, private context cleanup and honest attempted-task error states. No claim of measured perfect UX; run the complete real journey tests. |

## State, fulfillment, requests and database contract

### Pledge truth and donor-safe projection

P16 owns the exact line/expectation fold: `P = min(F,P) + D + R + E`, with excess `X = max(F−P,0)`. P is current donor capacity; F is net authoritative fulfillment; D and R are effective donor-ended and internal-release resolutions; E is remaining expected. This is an engineering invariant, not a donor balance equation to expose. P/F can change after qualified amendments/inverses; lifecycle and authority review are separate from fulfillment. There is no new Q26 status, mutable completion flag or mathematical estimate from donation history.

Default donor content admits P and source-qualified F with original currency. An ended/reviewed/no-further-expectation explanation uses a safe owner descriptor. Do not expose internal release amounts/reasons or render staff M7 accounting/evidence fields in donor detail. Do not label P−F Amount owed/left to pay. Source-authorized excess fulfillment can be described without claiming refund or credit; a zero current amount has no percentage division. The default text-only progress avoids misleading charts and extra client math.

Every numeric summary must itself be fully admitted for its stated pledge scope. Permission to view a line, campaign label or detail link does not authorize hidden siblings, aggregate P/F or the underlying contributing people's identities. Do not sum visible lines and label that incomplete result the whole pledge. If a total or subordinate gift is not admitted, omit it and use the source's safe restricted/limited projection without hinting at hidden amounts. Multi-designation pledges remain one record; separate pledges with the same name/campaign remain distinct.

Plans are optional and can be partly undated. Never use a fabricated next charge, browser UTC conversion of a civil date, due-date urgency, missed-payment warning or monthly-normalized promise. A linked recurring arrangement has independent payment/intent/control facts and current action authority. Ending a pledge alone does not stop it. Related contribution/history/document access stays exact; no new receipt for a promise or inferred tax/recognition value.

### Request journal and receiving-work requirements

The logical request envelope carries immutable request ID/kind, exact Tenant/environment/Legal Entity/Party/pledge, trusted actor and capability, observed source revisions, bounded request text or dispute statement, accepted time, semantic input hash and durable receipt. Caller may supply desired text and an owner-issued operation reference, never tenant/owner/approval/disposition/staff-role authority. The request is evidence, not a executable D18 preview or payment instruction.

Require a finite type barrier: ordinary change request versus explicit authority dispute versus actual staff command. Requests cannot enter a financial executor claim path. Acceptance and the existing source service-desk's actionable receiving work must be atomic or durably discoverable from the committed request; a receipt must never acknowledge an ownerless message. Staff must have exact receiving/review capability, and only source-authorized staff commands/dispositions can resolve the work. The current source may use its existing journal and typed request projection; physical reuse must not weaken these meanings merely to avoid a small child record.

Own request presentation distinguishes Received, source-confirmed In review, and final Completed/Could not complete, with concise safe outcome and separately linked current pledge revision. Do not fabricate In review from elapsed time. Completed ordinary request must link a proven staff disposition; it need not imply a financial amendment if the request was an explanation. Denied/no-change/corrected/end outcomes remain explicit rather than one success checkmark. Original text/attribution is immutable; additional information is a separate deliberately submitted source occurrence rather than silently overwriting an accepted request. No public guest management endpoint or generic inbox is introduced.

Duplicate same-operation same-input requests return the same receipt; changed meaning conflicts. A new legitimate request can be made after a deliberate action; don't permanently suppress by email, pledge balance or text similarity. Staff resolution re-proves current authority and source revision; request-time scope is not a long-lived permission lease. Source-owned retention, journal/evidence references and text custody must be qualified before activation. The ordinary request never auto-enrolls reminders, creates a donor notification key or sends email through an unqualified contract.

P16's existing normalized journal/authorization-reference retention is seven years after the later of arrangement end or last related financial activity, subject to its stricter governing policy. That does not automatically license storing arbitrary request prose for seven years. The proposed ninety-day text class above is separate from the journal, and body expiry neither removes semantic dedupe nor grants a still-pending request the power to change terms. No clock pauses while a tab is hidden; no retry, staff view, read/archive or restore restarts acceptance-relative text retention.

P16's existing purpose-bound email/RFC8058 stop remains usable for an authorized service contact even if that person cannot view the pledge in the portal. It is a targeted reduction-only action with its own scope, not permission to expose Pledges navigation, another person's contact or a global settings group. Conversely, pledge visibility alone does not permit controlling another service contact's reminders. No new reminder enrollment or request-notification event is implied.

### Authorization and physical integrity

All aggregate and request relationships carry the required non-null scope, tenant-aware composite keys/FKs, immutable actor/owner identity, supported original currency and integer minor-unit constraints. A referenced Party, pledge, plan, request, fulfillment target or staff command cannot silently belong to another scope. Append-only terms/plans/applications/inverses and request receipts preserve history; no donor delete or mutable financial column is needed for navigation.

P12's sole PDP performs source-qualified admission before existence, row lists, summaries, labels and joined metadata. Coarse trusted-Tenant RLS is defense in depth. Verify actual grants, views/invoker behavior, RPC/default EXECUTE, service/owner bypass paths and Storage policy if material is stored there. The absence of a visual entry is not authorization. Reading a pledge grants no manage/fulfillment/authority-resolution or payment rights. An authenticated user, email match, household or represented relationship alone grants nothing.

For reached updates, test effective old-row USING and new-row WITH CHECK plus immutable constraints. PostgreSQL can inherit USING as WITH CHECK when omitted; the generic skill assertion that omission alone permits reassignment is not reliable. Test actual forbidden old→new scope/state mutations and privileged paths. Do not repair inaccessible legacy tables by broadening browser grants. [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

### Caching, load and private navigation

One bounded source presence result can prove existence without fetching detail. Query/list/paging/admission predicates must agree, while incomplete detail does not erase a conclusive positive presence fact. An unavailable predicate is not an empty result. No persisted feature flag, navigation count, new realtime presence topic or cross-device preference. Existing Query/DB layers consume the projection; Store, Table and Virtual are used only for their existing justified roles, not five copies of authority. ReUI informs actual grids; this sparse list does not require one.

Use indexed existence and cursor access under the same source/PDP constraints; qualify actual plans and privilege behavior with production-shaped data. Preserve existing P16 detail budgets (p95≤500ms, p99≤1.5s before provider-present work) as inherited targets, not measurements performed here. Do not add a new speculative universal query-per-second or TTL promise. Presence discovery must not block unrelated portal sections or call providers. Signed-in/server output never enters a shared public CDN/Page generation; private cache admission and authorization are rechecked on context change, restore and mutation.

## Individual adversarial category review C01–C22

Severity describes the credible effect if implemented incorrectly. Likelihood is qualitative, not a production incident rate. The solution remains A; exact required language below narrows or completes execution. Each category was checked independently.

### C01 — Problem validity, necessity, and alternatives

**Material concern: Yes. Severity: Medium. Likelihood: Likely without the founder's absence rule.** A permanent empty feature adds confusion for the common no-pledge donor. A shared parent is credible but broadens everyday navigation. Founder rare-use context, ADR0012 and vendor patterns support conditional separation. **Effect:** Preserve A and make absence explicit. **Required language:** “Render no unsolicited pledge UI when the current context has no admitted fixed-pledge record; use one quiet conditional destination for the existing product, not a promotional module or new pledge system.” **Proof:** T01/T02/T17.

### C02 — Brittleness

**Material concern: Yes. Severity: High. Likelihood: Likely if legacy fields are reused.** Active balance, cadence, provider ID, a capped page or role may misclassify pledges/presence. Current recurring normalization demonstrates the weak assumptions. **Effect:** Require A1/A5. **Required language:** “Derive presence from the canonical authorized fixed-pledge kind across admissible current/history records; distinguish positive, conclusive absent and unknown. Never classify from legacy names or loaded rows.” **Proof:** T02/T03/T04.

### C03 — Technical debt

**Material concern: Yes. Severity: High. Likelihood: Plausible.** A second pledge list/model, stored hasPledges or generic request inbox creates duplicate owners and stale navigation. #811/P16 already own the facts. **Effect:** Require one-view adoption. **Required language:** “One fixed source view serves primary/contextual entry; reconcile Other and legacy readers. Keep request evidence under P16, with an explicit nonexecuting type, no parallel subscriber/commitment/notification framework.” **Proof:** T05/T11/T20.

### C04 — Edge cases

**Material concern: Yes. Severity: High. Likelihood: Expected.** History-only, partial/unknown reads, last-record correction, source reversal, multiple Parties, no plan, zero/excess and stale links can hide records or invent meanings. These are supported source states. **Effect:** Completes journey. **Required language:** “Implement the presence matrix and J01–J18; history remains admitted by current rights, unknown is not none, invalid exact links get safe local outcomes, and plans/fulfillment retain their source meaning.” **Proof:** T01–T08/T16.

### C05 — Footguns

**Material concern: Yes. Severity: High to Critical. Likelihood: Plausible from vendor/legacy UI copying.** A Pay balance, payment-method, Pause pledge, direct Edit or Fulfilled badge can cause unauthorized collection or false status. ADR0012/P16 forbid those inferences. **Effect:** Narrows UI/actions. **Required language:** “Pledge navigation/detail cannot charge, bind a method, edit staff terms or stop recurring giving. Ordinary requests are nonexecuting; only a separately qualified explicit dispute intake may apply the narrow protective review state.” **Proof:** T07/T10/T12/T13.

### C06 — Tenant safety

**Material concern: Yes. Severity: Critical. Likelihood: Plausible if caches/existence bypass scope.** Even a menu label can expose another Party's financial relationship. Current legacy/global context seams are not target proof. **Effect:** Requires exact presence and data scope. **Required language:** “Authorize presence, labels, rows, joins, requests and caches for the server-resolved Tenant/human/Party context; retire old context before late responses render. No email/household/provider inference.” **Proof:** T01/T03/T04/T15.

### C07 — Database, RLS and authorization safety

**Material concern: Yes. Severity: Critical. Likelihood: Confirmed target gap; exploit likelihood unmeasured.** Canonical target schema/route was not found; legacy profile-based SELECT and unconstrained cross-scope links are insufficient. **Effect:** Owner-first activation. **Required language:** “Require tenant-aware references, integer money, immutable attribution and source-conserving writes; coarse Tenant RLS plus sole P12 PDP protects all reached grants/views/RPC/Storage/service paths. No raw donor financial CRUD or caller-supplied authority.” **Proof:** T03/T09/T14/T15.

### C08 — Overengineering

**Material concern: No additional material concern under the bounded solution.** Checked universal commitment models, toolbar/grid/filter demands, separate nav store, feature flags per donor, public pledge creation, generic request inbox and new notification engine. None is necessary. **Required language:** “Ship only source presence, conditional navigation, a small list/detail and the qualified existing-owner request/stop journeys; use no additional framework or tenant configuration product.” **Proof:** T01/T05/T17/T20.

### C09 — UX/UI and user friction

**Material concern: Yes. Severity: Medium to High. Likelihood: Likely without exact absence/error copy.** Empty cards, skeleton flashes, terminology drift, debt-like progress and hidden material states confuse rare users. Founder direction and primary donor guidance support the minimal approach. **Effect:** Specifies V01–V14. **Required language:** “Omit all unsolicited artifacts for none; show a quiet real entry for present. Keep Campaign commitment, original-currency text progress, one request field, honest attempted-task recovery and tested accessible navigation.” **Proof:** T01/T06/T07/T17.

### C10 — Source of truth, ownership and invariants

**Material concern: Yes. Severity: High. Likelihood: Plausible.** Promise, received money, fulfillment, internal release, expectations and recurring execution can collapse into one balance/status. P16's conserved fold proves they differ. **Effect:** Completes donor projection. **Required language:** “Use P16 promise/fulfillment/resolution/plan facts and P13 received gifts independently; no P−F balance, E=0-paid inference, client sum or conversion. Request/read state never becomes changed terms.” **Proof:** T07/T08/T10/T12.

### C11 — Hidden coupling

**Material concern: Yes. Severity: High. Likelihood: Plausible.** Campaign closure, Updates Hide, receipts, a linked recurring stop or provider outage could incorrectly hide a pledge or change its state. Source owners and prior decisions exclude these joins. **Effect:** Preserves independent workflows. **Required language:** “Presence/read availability depends on exact pledge authority, not unrelated content/history/document/provider success. Linked products navigate independently; manual/external Other remains available.” **Proof:** T04/T05/T08/T16.

### C12 — Failure modes

**Material concern: Yes. Severity: High. Likelihood: Expected for network/service failures.** Failed existence becomes no records; a request receipt commits without staff-visible work; lost response triggers duplicate requests or fake updates. **Effect:** Requires truthful states and durable intake. **Required language:** “Unknown discovery silently omits unsolicited entry without claiming none; explicit tasks show local recovery. Atomic request/receiving-work acceptance precedes receipt; same-operation reconciliation handles ambiguity.” **Proof:** T02/T06/T10/T11.

### C13 — Lifecycle, temporal correctness, concurrency and idempotency

**Material concern: Yes. Severity: High. Likelihood: Plausible.** Refund/release/amendment races or stale requests can produce false progress, repeated effects or changed owner identity. P16 D11/D18 locks, revisions and journal govern. **Effect:** Requires source-consistent reads and exact requests. **Required language:** “Use compatible source revisions/cursors and original civil dates; GET/Back never mutates. Request identity/input is immutable, disputes are explicit protective commands, and staff resolution re-proves current exact authority/revision.” **Proof:** T07/T09–T14/T16.

### C14 — Data integrity risks

**Material concern: Yes. Severity: High. Likelihood: Plausible.** Legacy migration may classify one row twice, wrongly apply gifts or delete old records after zero expected. Authoritative kind, fulfillment targets and signed inverses are existing invariants. **Effect:** Narrows adoption. **Required language:** “Classify by source evidence into one product or quarantine; preserve applications/inverses, original scope/currency and history. No dual write, mutable balance/status or cascade erasure of referenced request/evidence.” **Proof:** T07/T09/T15/T20.

### C15 — Security and privacy risks

**Material concern: Yes. Severity: High to Critical. Likelihood: Plausible.** Restricted ministry labels, pledge presence, request text or internal release/dispute notes could leak through caches, exports, logs or broad joins. **Effect:** Requires minimal projections/custody. **Required language:** “Return only admitted safe fields; no financial/personal values in public caches, URLs, analytics or permanent raw logs. Donor request/detail rights do not expose staff notes/internal releases or another actor's protected request.” **Proof:** T03/T04/T14/T15/T18.

### C16 — Scalability and performance risks

**Material concern: Yes. Severity: Medium to High. Likelihood: Plausible despite rare use.** An optional menu could load every pledge/financial table for every portal visit; one atypical large donor can defeat unbounded lists. **Effect:** Require bounded source work. **Required language:** “Use an indexed authorized existence projection, bounded20-record cursor pages and no provider/detail work for discovery. Preserve inherited P16 budgets; prove positive/negative/worst-scope query plans and context-safe retained memory.” **Proof:** T02/T03/T19.

### C17 — Operational burden

**Material concern: Yes. Severity: Medium to High. Likelihood: Plausible.** Silent requests, duplicate Other views and hidden classification failures create staff cleanup and donor support. Rare use also makes defects easy to miss. **Effect:** Require owner receiving work and targeted diagnostics. **Required language:** “Requests enter existing P16 service work with exact scope/result and accountable owner; no ad-hoc email inbox/database repair. Group projection/intake faults by source cause and preserve valid donor tasks during containment.” **Proof:** T10/T11/T20, M1–M5.

### C18 — Observability and auditability gaps

**Material concern: Yes. Severity: High. Likelihood: Plausible.** No UI for unknown can hide a broken service; broad logging compensates by leaking private text. **Effect:** Defines internal evidence. **Required language:** “Internally distinguish absent/denied/unknown/present using protected identifiers and reason codes; correlate accepted request, review/disposition and source command without raw payload. Donor-facing statuses remain source-backed.” **Proof:** T02/T10/T18/T20.

### C19 — Dependency and integration risks

**Material concern: Yes. Severity: High. Likelihood: Confirmed contract/readiness gap.** Provider pledge UI, generic Supabase policy tips or old UI primitives can be mistaken for Core authority; P16/P12/P6/P17 seams remain required. **Effect:** Explicit qualification. **Required language:** “Preserve the non-executing fixed owner and exact recipient/reminder contracts; no provider fallback, generic browser grant or new notification key. Use current installed component APIs and authoritative PostgreSQL policy semantics.” **Proof:** T05/T13/T15/T17/T20.

### C20 — Migration, rollout and upgrade risks

**Material concern: Yes. Severity: High. Likelihood: Plausible.** Repurposing the legacy recurring URL, exposing a CTA before target services or falling back to old mutable writers can misroute or corrupt giving. **Effect:** Capability-first cutover. **Required language:** “Preserve existing links; deploy source/presence/request/PDP/retention support before the entry. Reconcile Other and legacy reads once, reject unsupported versions, and disable new work safely without restoring old authority or replaying history.” **Proof:** T05/T16/T20.

### C21 — Testability, traceability and proof

**Material concern: Yes. Severity: High. Likelihood: Certain if predecessor green is overclaimed.** Seven mocked tests cannot certify an absent fixed-pledge runtime or zero artifacts across all surfaces. **Effect:** Precise target gates. **Required language:** “Trace A1–A5/J01–J18/V01–V14/C01–C22 into exact owner amendments, formal spec/design/tasks and T01–T20 release proof when authorized. Treat no-artifact assertions and complete real donor journeys as required tests, not screenshot impressions.” **Proof:** T01–T20.

### C22 — Other development hazards

**Material concern: No additional material concern beyond those addressed.** Checked accidental P2P/campaign creation, staff finance, recurring conversion, tax/receipt issuance, external newsletter and general privacy/auth systems. The selected destination requires none. **Required language:** “Do not use rare pledge navigation to add another product, dashboard builder, source status, collection mechanism or unrelated gate. Q14 G01 and future phase boundaries remain explicit.”

## Target acceptance and release proof T01–T20

These are required target tests, not claims of execution during this review.

<!-- prettier-ignore -->
| ID | Falsifiable required outcome |
| --- | --- |
| T01 | Known-none and unproved cold contexts have no pledge nav/DOM-focus/ARIA/search/card/placeholder/blank-space/settings/upsell artifact on desktop/mobile/SSR/hydration. Ordinary tasks remain usable. |
| T02 | Positive authorized EXISTS admits the entry without list fetch; conclusive absence differs from partial/error/timeout. No persisted false from unknown, no all-portal blocking and no silent operational error. |
| T03 | Presence and list/detail use the same source/PDP population across personal/represented/history/restricted/denied contexts; exact-record access never implies unrestricted list or aggregate access. Tampered scope/kind/actor flags disclose nothing. |
| T04 | Signout, same-user Party/Tenant switch, revocation, stale responses, private/shared-cache probes and Back cannot reveal prior-context presence or fields. |
| T05 | Existing recurring/Other routes remain correct, manual/external facts remain independently available, and all fixed links reach one owner/view with no duplicate independent list. |
| T06 | Direct valid/invalid/history-only/now-denied links get exact authorized content or non-disclosing local outcomes and useful return; no promotional empty page or wrong-product redirect. |
| T07 | P/F/D/R/E/X source cases: partial fulfillment, internal release, donor end, reduction below F, P=0, refund/inverse, stale/incomplete fold and mixed currencies never produce false paid/debt/credit/percentage. |
| T08 | No-plan/part-undated/civil-date/multidestinations and linked recurring/gift/receipt paths preserve exact independent semantics and field access. No next-charge fiction. |
| T09 | Real source transaction/constraint and concurrency proof: same operation once, stale revision rejected/reconciled, requests cannot enter financial executor, no cross-scope relation or protected update. |
| T10 | Accepted request has durable receiving work/receipt or no acceptance; server attribution, nonblank text, empty/whitespace rejection, bounded Unicode/text bytes and actual staff capability hold. Receipt states the submission's non-effect even if another operation changed current terms; never Terms changed from intake. |
| T11 | Double-click/lost response/retry/reload and changed same-key text yield one request or a hard conflict; independent new requests remain deliberate and staff disposition cannot be inferred from timers/read. |
| T12 | Explicit dispute checks current portal/request and narrow protective intake authority, not validity of the disputed original promise. Its deliberate statement needs no ordinary-change prose. Exact protective review effect is atomic; no NLP trigger, donor staff-role grant, end/refund/recurring stop or hidden history loss. |
| T13 | Own-recipient reminder state/stop is qualified and replay-safe; a purpose-bound email stop works without portal pledge-view rights but creates no ordinary navigation artifact. No auto-enrollment, dormant On switch, extra channel, message key or staff contact disclosure. |
| T14 | Before/at/after ninety elapsed days from acceptance, earlier restrictive erasure, exact hold/release and restored backups: enforce text deny/purge while preserving minimized source journal/result/idempotency. No unsupported seven-year raw body, restarted clock, fake completion or action from expired unverified evidence. |
| T15 | Actual grants, coarse RLS/PDP, USING/WITH CHECK, composite FKs, invoker/definer/RPC/Storage/service roles prove admitted reads and every forbidden old→new mutation. |
| T16 | Latest source transitions, last admitted record, corrected identity, campaign closure and navigation focus preserve coherent history/current authorization without automatic commands or unrelated task failure. |
| T17 | Real Maia keyboard/AT/mobile/zoom/RTL/CJK/long labels/currencies/low-bandwidth journey: donors with none notice no pledge feature; pledge users can locate, explain and request changes without confusing payments or debt. |
| T18 | Logs/traces/analytics/search/URLs and notification caches contain no unapproved presence/body/internal-note data; protected reason/operation evidence remains sufficient to diagnose a fault. |
| T19 | Positive/negative/worst-authorized-scope indexed presence/list/claim/expiry query plans and20/21+ continuation meet inherited budgets under representative tenant load; no unbounded browser history or provider discovery. |
| T20 | Mixed-version deployment, feature enable/disable, request receiving readiness, source purge, legacy-route adoption, restored backups and rollback preserve immutable operations and never expose incompatible writers or bulk-replay history. |

## Ruthless synthesis and order

**Resolved before recording:** retain A and the founder's zero-artifact rule. Define presence as source-admitted record existence, including authorized history, with unknown distinct from none. Use one primary Pledges destination and reconcile Other without removing manual/external access. Adopt Pledges/Campaign commitment presentation, text-only progress and a minimal nonexecuting request journey with explicit authority dispute. These are the corrected execution choices, not further cosmetic questions.

**Capture in the developing specification:** A1–A5, presence/state rules, J01–J18, V01–V14 and C01–C22. The narrow P16/P3/P12 source presence/list/detail and request/dispute intake contract must be explicit. Update #811/Other placement and P16 donor terminology/receiving-work/retention qualification at the formal authorized stage. No new ADR is needed for a menu label; ADR0012 continues to govern the financial separation.

**Required sequence:** qualify source membership/field/request/dispute/retention contracts; build the canonical fixed source projection and exact privileges; complete atomic request/receiving work and protective intake; reconcile old recurring/Other navigation; compose the quiet Maia list/detail; prove no-artifact/authorization/financial-state/request/accessible journeys; then enable the entry for qualified contexts. Source-owned request actions cannot ship on a mock endpoint or rely on a future invisible staff inbox.

**Implementation gates:** exact existence and source completeness, tenant/PDP boundaries, integer/conserved money, immutable revisions/idempotency, clear request/command separation, authority-review qualification, current reminder stop, bounded work, request custody, safe route cutover and complete target proof are required. Neither a lower load estimate nor a disabled UI control substitutes for those invariants.

### Post-gate monitoring

These are proposed operational thresholds, not observed frequency or donor-facing response SLAs. Assign each role to a named maintainer/on-call before release and reuse existing product observability/service work.

<!-- prettier-ignore -->
| ID | Signal / threshold | Owner | Required response |
| --- | --- | --- | --- |
| M1 | Any confirmed pledge artifact in a conclusive-none context, or missing discovery for an admitted history-only record:1. | Donor UX and P16 projection owner | Reproduce exact context, correct the predicate/composition, verify all ordinary surfaces and preserve valid direct tasks. |
| M2 | Any unauthorized presence/field/request, cross-context leak or request causing an unapproved financial action:1. | P12/security and P16 owner | Contain affected read/write path, preserve minimized evidence, repair authority/type barrier and re-prove before enabling. |
| M3 | Any accepted request missing receiving work, duplicate semantic effect, or request left untriaged for48 elapsed hours. | P16 service operations owner | Recover from the durable request, assign existing authorized work, fix intake/coverage cause. No donor resubmit or automatic approval; threshold is internal investigation only. |
| M4 | Presence unknown/error for three consecutive attempted refreshes in the same context, or target detail latency exceeds inherited P16 budget in the release/operations window. | P16/API operations owner | Inspect source/PDP/query capacity, repair or safely contain the optional feature; do not convert error to none or block unrelated donor tasks. |
| M5 | Three distinct confirmed reports within30 days confusing pledge with payment/debt/completion, or any overdue private-material purge. | Donor Product UX with P16/privacy owner | Reproduce and correct source-safe copy/projection or enforce custody cleanup; recheck comprehension/retention before broadening. No growth prompt or new default feature to compensate. |

## Completion and evidence limits

The completed decision review supplies the absence contract, whole donor journey, source/authorization/request boundaries, all22 category verdicts, exact requirement clauses, target proof and implementation order. The rare-use statement is founder context; no unsupported usage percentage, user study or perfect-UX claim is made. Seven predecessor tests passed; target SQL/PDP/concurrency/provider and rendered donor proof remain required. Q14 G01 remains unresolved and unrelated future products stay out of scope.

**Next founder action: ratify Q26 A1–A5, J01–J18, V01–V14 and C01–C22, including zero unsolicited artifacts for none, historical discovery, text-only progress, twenty-record continuation, and the qualified request/dispute journeys with bounded text and ninety-day text custody.** No Q27 question or /to-prd, /to-issues, canonical source/ADR/OpenSpec, dependency, GitHub or provider mutation is implied by this review.
