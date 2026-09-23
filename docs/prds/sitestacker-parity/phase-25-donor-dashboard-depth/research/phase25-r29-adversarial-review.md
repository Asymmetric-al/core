> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 9 September 2026:** Conrad accepted Q29 A1–A5/J01–J18/V01–V14/C01–C22 and all reviewed Maia/source defaults, including separate DAF awareness and IRA/QCD acknowledgment journeys, zero unrelated UI,20-root gift-date continuation and24-hour elapsed preparation monitoring. Earlier proposed/unanswered wording is historical. T01–T22 remain required release proof; this ratification does not certify implementation or personal tax eligibility.

# Q29 — Received DAF grants and distinct IRA gift records

**Disposition: Accept with required amendments.** The selected quiet, read-only DAF view is retained. QCDs require a distinct source and acknowledgment path. This completed grooming review proposes A1–A5, J01–J18, V01–V14 and C01–C22 for ratification; it does not certify implementation. Q01–Q28 remain ratified. Research checkpoint: 9 September 2026.

## The consequential correction

A DAF grant is a sponsor's gift, with separately admitted recognition for its advisor. The advisor does not obtain another charitable deduction when the sponsor makes that grant. Any deduction associated with contributing to the DAF depends on the donor's circumstances and sponsor documentation; the portal must not claim that the donor already took one. [Fidelity Charitable grant guidance](https://www.fidelitycharitable.org/giving-account-guide/recommending-a-grant.html).

A QCD is different. It is an IRA distribution to charity, not DAF soft credit. The donor still needs a charitable acknowledgment, although the amount excluded from income cannot also receive a charitable deduction. Core must preserve the IRA owner and custodian's different roles and cannot determine the person's final tax treatment from a gift record alone. [IRS Publication 590-B, QCD section](https://www.irs.gov/publications/p590b).

Therefore, **DAF grants get a separate awareness view; IRA gifts remain in their authorized personal gift history and receive their own qualified acknowledgment path.** No combined “DAF/QCD,” “soft credits,” “non-deductible gifts” or “other giving” bucket is created.

The evidence appendix identifies current repository facts, unimplemented source contracts, primary sources and limits. Passing catalog tests is not proof of QCD intake, financial qualification, SQL authorization or a working donor portal. [Evidence and verification](phase25-r29-evidence.md).

## Corrected decision to record

### A1 — A narrow received-DAF read with explicit exposure authority

Phase 25 SHALL expose a conditional, private, read-only view of actual received DAF grants with sufficiently disclosed, unambiguous source attribution and independent current viewer permission. Consume P14's `getPartyCreditActivity` through a P3/P12 donor-safe projection, limited to explicitly admitted DAF-advisor relationships. Do not query all sponsor gifts or turn general household recognition into personal DAF attribution.

This is an explicit new private-read purpose under P14 J.4. Reconcile P14 story111/J.3 and P19's overview-only wording to permit this narrow portal read. Q08's **Support overview — Not a tax document** stays a separate optional artifact purpose: Off still creates no overview work or ordinary overview UI. Neither feature grants the other's permissions. No new tenant presentation builder or donor setup question is required.

The source, not the browser, admits identity, record existence, sponsor label, exact receiving organization, dates, amount, safe destination and detail/document links. Recognition does not confer account access; a household relationship, matching email, co-advisor label, fund name or amount/date guess is insufficient. Omit anonymous, ambiguous and restricted records without disclosing hidden counts or names. No relevant admitted records means no ordinary DAF-specific navigation, card, badge, prompt, filter option, skeleton or reserved space. An explicitly requested route may present a safe generic unavailable/loading/error state; failed retrieval is not evidence of no records.

### A2 — DAF awareness without another personal receipt or misleading amount

Use the donor-facing title **Donor-advised fund grants**. The normal page explanation is visible above the first record:

> **For your information — not a tax receipt**
>
> These grants do not create another charitable deduction and are not included in your personal tax receipts or year-end contribution statement from us. Use your DAF provider for tax records of contributions to your fund.

Repeat the heading and first sentence on a directly opened grant detail so a deep link needs no prior context. The exclusion describes document coverage when issued; it does not promise that a particular annual document exists. In the existing Receipts & statements area, show a small contextual explanation/link only for a donor with admitted DAF records relevant to the selected period. A separately enabled Support overview may list recognition, clearly labeled non-tax. It is not the personal contribution statement referred to in this copy.

Supplementary **About these grants** explains: “Recommending a grant does not create another charitable deduction. Any deduction for a contribution to your fund depends on your circumstances.” Do not say “You already received a deduction.” Do not require a checkbox, dismissible consent, acknowledgment of understanding or a special inbox visit. Displaying the explanation proves presentation, not comprehension.

The tax explanation above is the reviewed U.S. product meaning. Bind it to the receiving issuer's qualified jurisdiction; another supported jurisdiction needs its approved variant. Donor address, interface locale, payment currency and sponsor brand do not select tax policy. Keep ordinary UI translation separate from protected source-owned document wording.

Keep DAF recognition out of personal legal-giving History/CSV, Q23's personal monetary measure and the advisor's ordinary official contribution acknowledgments. The real sponsor contribution remains in its source ledger and separately authorized sponsor context. Do not delete or suppress the organization's receipt evaluation for the actual legal donor.

A full **Grant received** amount may appear only when the exact complete source grant amount is independently permitted. P14 `recognized_minor` can be scoped, capped or duplicated across different advisors; it is not a substitute for the sponsor's whole grant. Default to omitting list dollars when only a partial recognized amount is available. Detail may show **Amount attributed to your support** only when the source certifies that exact meaning and grants it; a short explanation must make clear that it may differ from the full grant. No inferred remainder, hidden-line total or co-advisor information. No DAF aggregate, chart, tax total or converted-currency total is introduced.

### A3 — QCDs use source-qualified IRA gift and acknowledgment semantics

Treat QCD as a specific U.S. IRA distribution/document case, orthogonal to the payment tender and legal donor. P7/P13 SHALL resolve the actual IRA owner or source-proved inherited-IRA beneficiary as contributor, separately from the transmitting custodian. Do not substitute the deceased owner, estate, bank or another household member. ADR0003's matching/workplace payer-of-record rule does not make every IRA custodian the donor. Do not identify a DAF or QCD from a financial institution's brand, check drawer, donor age, free-text note or an optional tax-form code.

Complete a typed P7/P13 source contract that distinguishes: the received contribution and original currency; owner identity and custody provenance; the recorded IRA/QCD intent and its evidence reference; source-established recipient-organization and goods/services facts; unresolved or contradictory facts; current case/purpose admission; and any successor correction. Fit these into the existing intake, ledger, case and evidence owners rather than inventing a donor-owned QCD table, tax calculator or generic deductible boolean. Recorded intent and organization-side facts do not certify age, annual multi-IRA limits, income exclusion, IRA basis, later tax filing or eligibility in the donor's personal circumstances.

The minimal source result SHALL be one of: **unresolved**, with a closed source reason and current revision; **admitted QCD acknowledgment case**, with an exact approved source-facts reference; or **independently admitted other supported case**, with its own exact facts. Closed unresolved reasons cover identity unresolved, custody unproved, intent unproved, issuer/case unsupported and contradictory facts. Bind every result to original contribution, Tenant, issuer, contributor and current intent/evidence revision; money remains in the ledger rather than copied into mutable case metadata. Case admission and document renderer/issuance readiness are separate results. Only authorized source commands may resolve or supersede a case. New, withdrawn or corrected evidence invalidates/supersedes dependent facts and eligibility without changing received money merely to fit a document. Persisted source relationships need same-Tenant/issuer/contribution constraints and discriminated valid-state checks; caller-supplied actor, owner or case authority is rejected.

Ordinary delivery by the donor of a custodian check payable to the charity does not alone invalidate a direct transfer. Conversely, a personal check funded by a withdrawal is not automatically a QCD. Treat these as custody-evidence distinctions at source intake. A DAF recipient does not become an eligible direct-QCD destination by changing a label. Partial, excess, disputed and unqualified cases follow P7's typed case/correction owner; the portal neither calculates a deductible remainder nor converts the whole distribution to ordinary deductible giving.

An evidenced failed or withdrawn QCD intention may lead to a P7-authorized ordinary-case successor when the actual facts permit. That requires the proper source classification and related document correction; it is not an automatic fallback for a dark or unresolved QCD purpose. Preserve the distinction between correcting a source case and determining the donor's final personal deduction.

For a source-admitted case with evidenced QCD intent, the existing personal gift row is labeled **IRA gift**, with **Intended as a qualified charitable distribution (QCD)** in detail. Source-case admission qualifies organization-side facts and permitted acknowledgment, not the donor's final tax result. The visible contextual explanation reads:

> This gift has its own acknowledgment, separate from your regular year-end contribution statement. Any amount excluded from income as a QCD cannot also be claimed as a charitable deduction.

**About this IRA gift** explains that the organization records received facts and the donor determines their tax treatment with their tax preparer. This is supplementary information, not a compulsory tax interview. A source-recorded IRA transfer whose QCD case is not yet admitted says **IRA gift** without a qualified badge or deductible claim. Show “We're checking the acknowledgment details” only if the source exposes a real active review; otherwise use “Acknowledgment unavailable” with existing organization help. Do not invent progress.

Use the existing `us.qcd.acknowledgment@1` official-document purpose and its exact issuer, recipient, source facts, protected wording, corrections, qualification and access rules. Its catalog already exists and starts dark. Complete its source and qualification gates before activation; do not ship a substitute informational PDF or an ordinary tax receipt to bypass them. Where already-issued legitimate history is admitted, preserve source-governed historical access independently of new issuance availability.

The current `donor-portal/receipts.ts` endpoint builds a generic Donation Receipt text file from a donor snapshot without this purpose resolver. It is a predecessor, not the canonical acknowledgment path. Reconcile or retire that route for the reached cases before activation, including direct URL access; hiding its button is insufficient. A DAF advisor cannot acquire a sponsor receipt there, and a QCD/dark/unknown case cannot obtain a misleading generic fallback. Existing Q08/Phase 18 document convergence remains the permanent owner path.

QCD acknowledgments remain available through **Receipts & statements**, grouped as **IRA gift acknowledgments** within the applicable existing period/issuer context. Show the group only for admitted relevant records/documents. A QCD-only donor sees useful QCD records without a fake empty ordinary annual statement. Do not put QCDs in the DAF view or optional recognition Support overview. Do not silently create an annual QCD bundle or a new statement purpose; expose the actual purpose-qualified acknowledgment artifacts.

Source-admitted personal monetary IRA gifts remain eligible for Q23's informational giving measure under its unchanged legal-donor, posting, currency, date and correction rules. **Giving amount is not deductible amount.** Ordinary annual US acknowledgment item sets exclude the QCD case. Where a selected-period donor has both kinds, Receipts & statements explains “IRA gifts have separate acknowledgments, so these documents may show different totals from your giving summary.” No institution-wide or donor-wide tax determination is inferred. This clarification changes document routing, not money conservation or the meaning of the existing Home measure.

### A4 — One authoritative source, coherent reads and safe corrections

DAF source grants, recognition revisions, current effective money and permission must agree before a row claims received facts or an amount. Received means source-admitted receipt, not irreversible bank settlement; preserve any source-required provisional/return qualification without adding a new waiting period. Use one bounded coherent source snapshot or an exact version-checked owner read, then enforce current egress permission. Do not mix a newly corrected amount with stale attribution or promote a lagging projection into write authority. A scoped updating result is acceptable only when source currentness is genuinely unresolved; unaffected personal history and documents stay usable. Reading never creates a P14 external-reference freeze or a new donor-awareness fact.

Retain original grant/distribution identity through correction. Group by the source's immutable root, never sponsor/name/date/amount similarity. A returned grant, zero-effective outcome, wrong attribution, merged identity and newly restricted record are different events. Preserve truthful financial history where current access permits; remove access when the source revokes it without explaining another person's identity. A rights correction never deletes the actual gift or rewrites frozen documents in place. Source-owned successor/correction and incident paths repair inappropriate earlier documents.

Existing P13/P14 constraints and mutation boundaries remain binding: same-Tenant composite relationships; one true legal donor per header; line-to-header integrity; exact integer minor amounts and currency; active credit identity and header-XOR-line scope; append-only source correction; privileged mutation locks and atomic audit/outbox publication. QCD classification is a typed source case, not a new tender and not an editable donor field. Source classification/recipient/issuer/date/money corrections must invalidate every affected projection and document eligibility together.

Donors gain no INSERT/UPDATE/DELETE/EXECUTE authority over grants, credits, QCD case facts or document qualification. Existing authorized writers must validate both old scope and new row state, including Tenant, owner, role, source linkage and case transitions. Policy `USING` admission alone is insufficient to assess reassignment safety: explicitly verify effective `WITH CHECK`, column grants, trigger/function behavior and every privileged path. Preserve P12 field/purpose authorization in addition to coarse RLS. New read views use appropriate invoker semantics or inaccessible private schemas; no PUBLIC execution grant or server-role bypass may silently expose raw records.

Use the existing governed application/API/database boundaries and scoped TanStack cache conventions. Cache keys and invalidation include Tenant, current human/represented context where applicable, exact admitted subject, source versions, purpose and period. Cancel/clear sensitive cached results on logout, tenant/context change and revocation; reauthorize server requests, including downloads. No durable browser persistence, public CDN cache, background full-roster sync or unrelated Realtime feed is added. A cached row is never permission to fetch an artifact.

### A5 — Small Maia presentation and proportionate release safeguards

Use shared `base-maia`, Base UI and the repository's semantic Zinc-oriented tokens. The DAF destination is a conditional secondary link from Giving history, composed alongside Q28's Employer matches without a new permanent main-sidebar module. Keep personal gifts primary. One page contains the short explanation and a stable compact list; a normal detail route preserves return position. No universal recognition dashboard, badges demanding attention, counters, progress bars or upsell.

Proposed initial DAF page size: **20 source roots**, descending authoritative effective gift date plus immutable source-root tie-breaker, with accessible **Load more**. This is received-grant history, so chronological source gift dates fit better than Q28's pipeline creation order. Label a gift date as Gift date; label it Received on only if the source separately proves that meaning. Never substitute import time, donor-browser time or a sponsor's processing date. Use a source-basis-bound continuation; if a date correction invalidates it, replace/reload the affected list coherently with a concise update announcement and preserved focus, rather than mixing pages or silently skipping a root. Records without an admitted date follow dated records in immutable root order, sharing the same bounded continuation and a neutral Date unavailable label; a withheld date must not influence their visible ordering. They are not discarded or assigned today's date. Include admitted corrected history without a current-year-only default that hides older grants. Do not introduce arbitrary aging or retention limits. No exact total-count query is required. For large records, bounded detail continuation preserves full permitted meaning.

Use a semantic list for this small destination. If an actual grid is later warranted, ReUI is the reference for its visual/filtering patterns within shared Maia. No license bypass, new library stack or version upgrade is authorized by this choice. QCDs reuse existing History and Receipts & statements; there is no QCD-specific primary navigation or empty section for non-QCD donors.

Activate only after the reached P14/P7/P13/P12/P18/P19 source and exposure amendments are recorded and the relevant acceptance families below pass. DAF read activation and QCD document qualification are independent. Disabling a new read does not mutate grants, send messages or erase documents. Disabling new issuance must preserve authorized historical artifacts under existing document policy. Q14 G01 remains unresolved and independent. The planned experience is feasible; currently missing source and journey proof remains required work, not a waived risk.

## Mapped donor journey

The following examples are synthetic acceptance scenarios, not observed donor feedback.

<!-- prettier-ignore -->
| ID | Donor situation | Required outcome |
| --- | --- | --- |
| J01 | Maria has only normal card/bank gifts. | Existing Home, History and documents contain no DAF/QCD label, link, filter, empty tile or targeted explanation. |
| J02 | An admitted received DAF grant becomes relevant. | The secondary DAF link appears from the shared giving area; no new task, notification or sign-in step. |
| J03 | Maria opens the DAF list for the first time. | Full term in the heading; visible for-records/year-end explanation precedes amounts. No prior financial vocabulary is required. |
| J04 | A full grant amount and sponsor are permitted. | Row says Grant received, with original currency/amount and actual source date; it never says Your tax-deductible gift. |
| J05 | Only scoped/capped recognition is admitted. | No full-grant amount is inferred. List may omit money; detail uses clearly qualified attributed-amount wording only when independently supported. |
| J06 | Maria follows a direct grant link. | Detail supplies its own context and short statement exclusion; back navigation restores the list and focus. |
| J07 | She checks her year-end documents. | Her personal contribution statement omits sponsor grants. Relevant DAF explanation links back; optional non-tax Support overview remains independently governed. |
| J08 | She has a sponsor recommendation but Core has no receipt record. | No fabricated pending grant or zero proof; sponsor processing is outside this view. Existing help remains available without a grant-claiming form. |
| J09 | Attribution is household-only, co-advised, anonymous or ambiguous. | Only exact source-approved subject and viewer rights admit facts; no personal recommendation claim from membership or a guessed match. |
| J10 | A received grant is partially returned or corrected. | Current safe outcome and historical received context remain intelligible; no stale celebration, negative personal donation or silent history loss. |
| J11 | Data fails, lags or access is revoked while open. | Scoped truthful failure/updating/unavailable state; no false empty result, stale sensitive cache, sibling-record leak or portal-wide failure. |
| J12 | Daniel's identified direct IRA gift is source-admitted with QCD intent. | One existing personal History row labeled IRA gift, with evidenced intended-QCD detail, independent of the DAF destination. |
| J13 | Daniel opens IRA gift detail. | Plain QCD expansion and separate-acknowledgment explanation; no final tax-qualification or double-deduction promise. |
| J14 | Daniel needs documentation. | One clear View acknowledgment action when qualified artifact is available; correct issuer/recipient/case/correction, with authorized download. |
| J15 | QCD facts or document qualification are unavailable. | Preserve admitted received gift truth; show accurate acknowledgment availability/help. No ordinary receipt fallback, fake preparation status or UI-generated PDF. |
| J16 | Daniel has USD500 ordinary gifts and USD1,000 admitted monetary IRA/QCD gifts. | Informational personal giving can be USD1,500 under Q23. Ordinary annual items cover USD500; separate QCD acknowledgment records USD1,000. The document area explains the differing coverage; none is labeled his personal deduction. |
| J17 | Donor has QCD-only, DAF-only, both, or older corrected records. | Only relevant paths/groups appear. No need for a direct legal gift to reach an authorized DAF record; no current-year zero implies new donor. |
| J18 | Staff corrects a mistaken donor, method or case after document issue. | Existing source repair creates legitimate successors/containment, restores correct rights and preserves audit evidence; donor receives only the existing purpose-governed communication, never a new automatic broadcast from this read. |

## Reviewed presentation defaults

<!-- prettier-ignore -->
| ID | Required presentation |
| --- | --- |
| V01 | Shared exact Maia components and tokens; normal body contrast and comfortable spacing, no app-local theme fork. |
| V02 | No combined DAF/QCD tab. A quiet DAF secondary link; IRA gifts reuse personal History and documents. |
| V03 | Always-visible concise DAF year-end explanation above the list and on direct detail. No tooltip-only tax meaning or required acknowledgment click. |
| V04 | Plain language: Donor-advised fund grants; IRA gift; acknowledgment. Keep soft credit, recognition fold and purpose IDs out of donor copy. |
| V05 | Twenty DAF roots per page with Load more; no count badge, infinite scroll, dashboard total or progress meter. This is a reviewed product default, not measured optimality. |
| V06 | One row has a clear status/type line and date/sponsor supporting line. Permitted full amount has a nearby meaning label. Text wraps; no fixed two-line clipping of critical meaning. |
| V07 | Detail uses a small labeled facts list. Safe sponsor, source date and independently admitted amount come before supplementary explanation. No raw account IDs, staff notes or sponsor-letter attachments. |
| V08 | QCD detail offers the existing qualified acknowledgment action; document unavailable and not yet prepared are not synonyms. |
| V09 | Group actual IRA acknowledgments under the existing issuer/period document context only when relevant. A document title always identifies QCD/IRA purpose. |
| V10 | Tax meaning and status are text, not color or icon alone. No alarming red treatment for an ordinary DAF or QCD record. |
| V11 | Keyboard and screen-reader semantics, descriptive links, visible focus, no focus jumps on refresh; status updates announced politely when appropriate. |
| V12 | At 320 CSS pixels and 200% text zoom, important copy and actions remain available without two-dimensional scrolling; 44 CSS-pixel touch-target design default, no animation required. |
| V13 | Source-owned dates/currencies/issuer names, locale formatting and safe translated product copy. Legal wording/locales use the qualified document pack; no browser-generated tax-year assumptions. |
| V14 | Support zero-artifact ordinary states and safe explicitly requested route states. Loading/error never pretends zero; no empty DAF/QCD group to educate uninterested donors. |

## Independent category review

Severity is consequence if the concern occurs. Likelihood is a qualitative engineering assessment of a naïve implementation, not a measured incident rate. Evidence references R/E are defined in the companion appendix. Each required statement below is normative proposed language, with A/J/V providing its implementation context.

### C01 — Problem validity, necessity, and alternatives

**Material concern: Yes. Severity: Moderate. Likelihood: Medium.** A second financial-looking history could add confusion where acknowledgments already suffice; no Asym demand study proves benefit. Q29 research and Givebutter's staff-only soft-credit precedent challenge a universal-best-practice claim (E6). **Effect:** retain A but narrow it to the recipient-record job; B remains the strongest simpler alternative. **Required language:** “The DAF read SHALL answer only what the organization has recorded for an admitted grant; it SHALL NOT introduce a general recognition dashboard or pending sponsor tracker.” A1/A5 define the permanent boundary. **Proof:** T01/T17/T22, including first-time comprehension without staff explanation.

### C02 — Brittleness

**Material concern: Yes. Severity: High. Likelihood: High.** Inferring DAF/QCD from Fidelity-like names, tender, age or a 1099-R code misclassifies gifts; one institution can occupy different roles. R3/R5 and E2/E4 establish separate cases and optional code Y. **Effect:** changes the source contract. **Required language:** “The source SHALL supply typed custody, attribution and case evidence; unknown or contradictory evidence SHALL NOT be converted to a DAF/QCD classification by display heuristics.” A3 is the permanent fix. **Proof:** T03/T09/T10/T11 with identical provider brands and conflicting metadata.

### C03 — Technical debt

**Material concern: Yes. Severity: High. Likelihood: High.** A portal grant table, copied balance, deductible flag or second document renderer would compete with P13/P14/P18 and diverge after corrections. R1/R2/R4/R5 demonstrate owners already exist. **Effect:** narrows implementation. **Required language:** “Use the sole source credit read and existing document-purpose catalog; no portal-owned financial authority, tax calculator or duplicate artifact family.” A1/A3/A4 are permanent. **Proof:** T04/T12/T19 plus owner-boundary review; no package installation is needed for this decision.

### C04 — Edge cases

**Material concern: Yes. Severity: High. Likelihood: Medium.** Household/co-advisor grants, zero-effective returns, unidentified IRA owners, donor-delivered custodian checks, split eligibility, wrong attribution and older records defeat a simple happy path. R2/R3/E3 support these as realistic counterexamples. **Effect:** changes eligibility and journey, not selected scope. **Required language:** “Different source cases SHALL retain distinct outcomes; delivery person, shared identity and tax intent SHALL NOT substitute for ownership, received facts or final qualification.” A2–A4/J05/J09/J10/J15–J18 fix this. **Proof:** T03/T06/T09/T11/T15.

### C05 — Footguns

**Material concern: Yes. Severity: High. Likelihood: High.** An ordinary receipt shortcut, broad official-tax label or recognized amount shown as full grant invites a second deduction or wrong document expectation. R4/R5 forbid the QCD/ordinary crossover; scoped recognition exists in R2. **Effect:** materially amends A. **Required language:** “No DAF personal-receipt CTA; no QCD ordinary-receipt fallback; no recognized amount labeled Grant amount without whole-source authority.” A2/A3 and V03/V07 are permanent. **Proof:** T04/T07/T12/T22.

### C06 — Tenant safety

**Material concern: Yes. Severity: Critical. Likelihood: Medium.** Shared sponsor names, cached counts or issuer-mixed joins can reveal another organization's grants or documents. R2/R6 require exact Tenant and actor scope. **Effect:** constrains every read and cache. **Required language:** “Every existence result, root, field, artifact and cache entry SHALL bind current Tenant/viewer/subject; a shared sponsor or identity provider is never cross-Tenant authority.” A1/A4 fix it structurally. **Proof:** T02/T14/T18 using same names/IDs in adversarial tenants and represented contexts.

### C07 — Database, RLS, and authorization safety

**Material concern: Yes. Severity: Critical. Likelihood: Medium.** A role-only SELECT, definer view, raw RPC or writer that permits row reassignment can bypass the UI completely. No target DAF projection SQL was found; catalog tests do not certify this boundary. R2/R6/E7/E8 establish the risk. **Effect:** makes source/DB qualification a release gate. **Required language:** “Verify explicit grants, RLS USING/effective WITH CHECK, composite Tenant/line/header keys, active credit uniqueness, source locks and immutable audit; deny donor mutations and raw privileged execution. Reassignment must validate OLD and NEW context.” A4 fixes the whole access path. **Proof:** T02/T05/T13/T14 with actual DB roles, including service paths, storage and revoked rights.

### C08 — Overengineering

**Material concern: Yes. Severity: Moderate. Likelihood: Medium.** Building sponsor sync, tax-limit calculators, acknowledgments of comprehension, grids for a handful of records or a new QCD subsection for everyone adds cost and noise. The chosen job requires none (R1/E1/E6). **Effect:** narrows the solution. **Required language:** “Reuse existing intake, documents and history; no sponsor connector, new notification family, tax interview, arbitrary expiry or universal module.” A5/V02/V05/V14 implement the simplest permanent path. **Proof:** T01/T16/T17/T19 and scope review.

### C09 — UX/UI and user friction

**Material concern: Yes. Severity: High. Likelihood: High.** Donors may confuse a grant with their own deductible gift, expect it on an annual statement or overlook a QCD acknowledgment. Jargon, tooltips and colored-only labels magnify it. E1–E3/E9 support separate meaning and readable context; no donor study has yet proved comprehension. **Effect:** changes information hierarchy and copy. **Required language:** “Expose the short document/tax meaning before amounts/actions, keep DAF and IRA journeys distinct, and render no irrelevant DAF/QCD artifacts.” A2/A3/J01–J18/V01–V14 are exact treatment. **Proof:** T01/T07/T12/T17/T22 across mobile, assistive technology and unfamiliar donors.

### C10 — Source of truth, ownership, and domain invariants

**Material concern: Yes. Severity: High. Likelihood: High.** Sponsor payer, advisor, IRA owner, custodian and document recipient could become one overloaded donor field; multiple soft credits could multiply money. R1–R5 contradict this. **Effect:** changes domain execution. **Required language:** “P13 owns legal money, P14 owns recognition, P7 owns case/recipient eligibility, P18/P19 own artifacts/fulfillment. QCD is not DAF recognition; the read has no write authority.” A1–A4 retain one legal donor, exact source roots and original currency. **Proof:** T03/T04/T08/T09/T12.

### C11 — Hidden coupling

**Material concern: Yes. Severity: High. Likelihood: Medium.** Using Support-overview Off as the new read gate, or official_tax as deductible, silently changes settled purpose boundaries; one failed special view may break all History. R4/R5/R7 show those shortcuts are wrong. **Effect:** requires explicit exposure reconciliation and independent failure handling. **Required language:** “DAF view, optional recognition artifact, QCD acknowledgment and ordinary contribution statement SHALL have independent source-qualified purpose/availability; no feature toggles or totals leak across them.” A1/A3/A5 fix it. **Proof:** T07/T12/T16/T20 with every activation combination.

### C12 — Failure modes

**Material concern: Yes. Severity: High. Likelihood: Medium.** Lost source events, artifact-generation failures and network errors can look like missing gifts, trigger an ordinary receipt fallback or leave a stale amount. R2/R4/R5 require authoritative correction and truthful availability. **Effect:** adds explicit degraded states. **Required language:** “A failed or incoherent read SHALL preserve safe unaffected surfaces; no empty-zero substitution, invented preparation status, source mutation or alternative receipt.” A3/A4/J11/J15 are permanent. **Proof:** T06/T12/T16/T18 with commit-before-outbox-delivery and lost-response simulations.

### C13 — Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes. Severity: High. Likelihood: Medium.** A correction racing a page/download or replayed import can duplicate grants, move dates or expose wrong attribution. R2/R3 require source revisions rather than read-time guesses. **Effect:** adds coherent root/version and replay requirements. **Required language:** “Reads SHALL use a coherent source basis and current egress rights; duplicate delivery converges on the original business identity; case/date/recipient corrections use source successors, never GET mutation or in-place document rewrite.” A4 governs. **Proof:** T05/T06/T13/T15/T18 including old/new code and out-of-order events.

### C14 — Data integrity risks

**Material concern: Yes. Severity: High. Likelihood: Medium.** Name-based merges, capped-credit sums and QCD classification used to zero ledger money produce inconsistent records and reports. R2/R3/R5 separate those facts. **Effect:** clarifies money versus document treatment. **Required language:** “Document inclusion SHALL NOT change contribution money. Never merge grant roots by descriptive fields, relabel a visible subset as a total, or derive deductible amounts in the portal.” A2–A4 fix it. **Proof:** T04/T08/T11/T15 with partial recognition and returned distributions.

### C15 — Security and privacy risks

**Material concern: Yes. Severity: Critical. Likelihood: Medium.** Sponsor letters, check images, fund names, advisor identities or ministry destinations can expose banking and sensitive affiliation data. Anonymous donor claims and stale downloads worsen it. R2/R6/E1/E5 require minimization. **Effect:** narrows fields and attachments. **Required language:** “Admit only explicit safe fields; no account numbers, raw sponsor/custodian documents or donor-claim search; rights apply to links, counts, exports, logs and backups as well as rows.” A1/A4/V07 are permanent. **Proof:** T02/T03/T14/T18 and source records-schedule review; no new indefinite raw-evidence retention.

### C16 — Scalability and performance risks

**Material concern: Yes. Severity: Moderate. Likelihood: Medium.** Full sponsor scans, client folds, per-row permission calls or unbounded signed URLs degrade with large institutions even if most donors have few records. R2/R6 support bounded source reads. **Effect:** adds measurable query/paging requirements. **Required language:** “DAF list SHALL page 20 canonical roots with stable continuation and set-based authorization; no full sponsor roster or exact count is required. Index current Tenant/credited-party/role and root ordering according to measured plans.” A5 and M4 define targets, not achieved results. **Proof:** T19/T20 on the declared shaped workload.

### C17 — Operational burden

**Material concern: Yes. Severity: High. Likelihood: Medium.** Requiring manual deductible overrides/check uploads or correcting the donor view separately from the ledger makes tax season fragile. LGL's manual override is a useful caution, not the permanent Core design (E3). **Effect:** changes source workflow safeguards. **Required language:** “Classify and correct once through the existing source intake/case owner; automatically converge dependent reads/documents. Route unresolved evidence into existing staff work, not a new donor task or SQL-repair ritual.” A3/A4 fix it. **Proof:** T09/T11/T15/T21 and staff recovery exercise.

### C18 — Observability and auditability gaps

**Material concern: Yes. Severity: High. Likelihood: Medium.** A visible explanation can be mistaken for proof of understanding; raw financial payloads in telemetry can leak data while failing to identify the cause of a wrong document. R6/R8 distinguish evidence and access. **Effect:** requires separate technical and durable records. **Required language:** “Record source actor/case/correction provenance durably; technical signals use minimized correlation IDs and purpose/version, not PII. Rendering or reading SHALL NOT create an understood/tax-advice-accepted fact.” A4/M1–M5 fix it. **Proof:** T18/T21/T22.

### C19 — Dependency and integration risks

**Material concern: Yes. Severity: High. Likelihood: Medium.** Treating optional Code Y or vendor statuses as qualification, borrowing a vendor's soft-credit visibility policy, or rendering new emails through a shortcut creates brittle authority. E1/E3/E4/E6 and R4 establish the boundaries. **Effect:** constrains reuse. **Required language:** “No DAF account or tax-form integration is required; existing document delivery remains P17/Email Studio/Resend-owned. Provider acceptance/open events prove neither reading nor tax treatment.” A3/A5 fix it; official pack rules own future legal updates. **Proof:** T10/T12/T16/T21.

### C20 — Migration, rollout, and upgrade risks

**Material concern: Yes. Severity: High. Likelihood: Medium.** Old clients may render QCD as an ordinary receipt or backfills may classify every custodian check and reissue documents. R4/R5 include dark qualification, while current target intake is absent. **Effect:** mandates staged exposure and preservation. **Required language:** “Deploy source/case/deny-set support before consumers; unknown cases fail closed for document issuance. Backfills need trusted evidence and stable identity, create no sends, and preserve source history. Activation and kill switches separate reads from new issuance and historical access.” A5 is permanent. **Proof:** T15/T16/T20 including rollback after source writes.

### C21 — Testability, traceability, and proof

**Material concern: Yes. Severity: High. Likelihood: High.** Catalog presence or passing unit tests could be presented as full QCD support, and new UI terms could contradict older ADR/spec/ticket language. R5 tests prove only catalog behavior; source and donor seams are missing. **Effect:** separates design acceptance from release readiness. **Required language:** “Trace A/J/V/C to exact owner amendments, OpenSpec/design/tasks/issues and T01–T22 at authorized publication; no capability is activated on documentation or unit-catalog proof alone.” The sequence below is required. **Proof:** T20–T22 and the recorded evidence distinctions.

### C22 — Other development hazards

**Material concern: No additional material concern found.** Checked inherited-country assumptions, retention drift, universal UI leakage, staff/missionary role bleed, future vendor lock-in and Q14 G01. Relevant concerns are already resolved or gated above; a new expiry, owner, surface or framework would add no protection. **Effect:** no further scope expansion. **Required language:** “Do not import US QCD behavior into another jurisdiction or relax independently unresolved Auth/source gates. Preserve existing jurisdiction and records owners.” **Proof:** T01/T02/T10/T16; unknown jurisdiction/purpose remains unsupported rather than guessed.

## Target acceptance and release proof

These are future outcome tests. Existing execution this review: **46 passed tests in two document-purpose files**, with zero failures. They verify catalog/availability behavior only. No target donor SQL/browser/QCD intake test or real donor study has been run.

<!-- prettier-ignore -->
| ID | Required independent evidence |
| --- | --- |
| T01 | Ordinary DAF/QCD-free donor has zero special DOM/navigation/filter/skeleton artifacts; each relevant combination adds only its own path. |
| T02 | Cross-Tenant, other donor, household-only, represented organization, missionary/staff and anonymous-session allow/deny matrix at API/DB/storage boundaries. |
| T03 | Full/fund-name-only/anonymous, co-advisor, household, unresolved and late attribution; no inference or personal-claim copy without exact facts and access. |
| T04 | Full USD1,000 grant versus capped USD200 credit, hidden lines, multiple advisors and several currencies; no false whole-grant label or mixed sum. |
| T05 | Source composite FKs, nullable-line uniqueness/scope, immutable credit correction, locks and forbidden OLD→NEW mutations; donor DML/EXECUTE denial. |
| T06 | Concurrent receipt/correction/read, lagging recognition and lost events; coherent result or safe updating, no GET repair and no obsolete identity leak. |
| T07 | DAF grant excluded from personal legal History/CSV/Home and ordinary advisor statements; optional Support overview remains separate and Off is preserved. |
| T08 | Ordinary USD500 plus personal monetary IRA USD1,000 yields Q23 USD1,500 only under its existing admission; document populations remain USD500 ordinary and USD1,000 QCD, never deductible total. |
| T09 | Same brand acting as sponsor, IRA custodian or ordinary payer; custodian check delivered by owner, personal withdrawal/check, inherited-IRA beneficiary, missing owner and contradictory source evidence. |
| T10 | No inferred eligibility from age, provider, geography or Code Y; unknown jurisdiction and special split-interest destination do not enter the ordinary direct-QCD case. |
| T11 | Partial/excess/withdrawn QCD intent and later case correction; no client tax calculation or automatic ordinary fallback. A properly evidenced P7-authorized ordinary-case successor and related document correction remain possible; received money is preserved. |
| T12 | Correct source/issuer/recipient/qualified QCD artifact; protected wording/forbidden facts, unavailable and corrected states; no ordinary annual case contamination or raw-file fallback. |
| T13 | Duplicate imports/events/concurrent staff correction converge by durable source identity; no duplicate gift, credit, acknowledgment or delivery. |
| T14 | Logout, tenant switch, subject change and revocation with cached list/detail/download: current egress denial, no public cache/persisted sensitive browser data. |
| T15 | Evidence-based backfill and wrong-identity correction preserve audit/source roots, zero-effective history and valid artifacts; no mass sends or silent reattribution. |
| T16 | DAF read disabled, Support overview Off, QCD issuance dark/revoked and historical artifact available combinations behave independently and truthfully. |
| T17 | Keyboard/screen reader, 320px, 200% text zoom, long translated labels and low bandwidth; key meaning before action and polite failure announcements. |
| T18 | Redacted logging and metrics, stale deep link, missing receipt record and source revision mismatch; no sensitive identifiers/raw evidence in client or telemetry. |
| T19 | 20/21-root boundary, stable Load more under late arrivals/corrections, no duplicate or skipped continuation within its declared snapshot; bounded detail and set-based plan. |
| T20 | Release uses source owners before consumers, unknown new cases on old readers, qualified pack versions, independent kill controls, safe roll-forward and rollback after writes. |
| T21 | Staff can trace a wrong grant/case to source actor and correct via supported workflow; document correction and existing delivery paths converge without direct DB repair. |
| T22 | Formative comprehension with at least six representative participants unfamiliar with this UI: explain DAF year-end exclusion, locate QCD acknowledgment, distinguish giving from deductible totals. Zero observed critical misconception is the release criterion; any critical error requires revision/retest. This small study is a design gate, not a statistical proof. |

## Ruthless synthesis and execution order

1. **Before recording the corrected answer:** accept the DAF/QCD distinction, exact visible explanations, zero-artifact rule, amount qualification and P14/P19 exposure reconciliation. These are resolved in A1–A5; they are not choices left for a developer to improvise. The selected direction remains A, with these required amendments awaiting ratification.
2. **Capture in source/spec/design:** carry the narrow DAF read into P14/P12/P25, clarify P19's document-only restriction without changing Off, and complete P7/P13's IRA owner/custodian/case contract. Bind QCD acknowledgment routing to existing P18 purpose; reconcile Q08/Q20/Q23 cross-surface coverage explicitly. At later authorized publication, update reached existing tickets rather than implement stale wording. No new tax calculator or ledger.
3. **Require implementation safeguards before activation:** source schema/locks/evidence and immutable corrections first; field/subject authorization and coherent bounded read next; QCD purpose/source qualification and document population separation; then shared Maia views and recovery. Complete the relevant T01–T22 outcomes and source-native DB/renderer qualification. Current QCD catalog tests do not waive any of this.
4. **Release and recovery:** activate the DAF consumer only after its own proof. Activate new QCD acknowledgment issuance only after its independent US purpose/source gates. Keep ordinary history and already-admitted historical document access operating through their owners. Roll back a consumer by disabling exposure, never by deleting money, erasing attribution or retracting history without source authority.
5. **Monitor only after prevention and proof:** use the following existing operational roles; these are proposed initial detection defaults, not measured service levels. No correctness or privacy invariant is delegated to monitoring.

<!-- prettier-ignore -->
| ID | Signal and threshold | Owner | Required response |
| --- | --- | --- | --- |
| M1 | Any confirmed cross-person/Tenant leak or wrong donor/issuer/ordinary-versus-QCD document, threshold one. | Security incident owner with P7/P12 owner. | Contain the affected read/issuance, preserve minimized incident evidence, correct source/access/artifacts through existing incident and successor workflows; requalify before reopening. |
| M2 | An authoritative source correction remains unreflected in a relevant donor projection for over five minutes after commit. | P14/P13 data-health owner. | Suppress incoherent facts, inspect/replay the existing outbox consumer by source operation identity, verify convergence; no new receipt/send as a repair. |
| M3 | A source-admitted QCD preparation operation in an active qualified purpose remains unprepared for over 24 elapsed hours after authoritative admission without a source hold. | Tenant finance/document operations owner. | Investigate source/renderer/queue, use existing fulfillment recovery and truthful availability; do not issue an ordinary acknowledgment substitute. Holds are separately visible to staff; reading the portal creates no preparation operation. |
| M4 | DAF list or detail p95 server response exceeds 500ms, or unexpected errors exceed 1%, for two consecutive 15-minute windows with at least 100 requests per endpoint/window. | Core API on-call. | Inspect scoped query/PDP/cache plans and capacity; mitigate/roll back consumer. Insufficient samples are unknown, not green. Qualification load: tenant 1m source contributions, subject 10k admitted roots, page20, 50 concurrent requests; latency target is not yet achieved proof. |
| M5 | One confirmed donor misconception that these DAF grants yield a new deduction or that QCD needs no acknowledgment, reported in usability/support feedback. | Donor experience product owner with P7 content owner. | Inspect exact presented copy/context, correct/retest the confusing path promptly; pause affected new rollout when the cause is systemic. No raw gift amounts, names or tax forms in aggregate telemetry. |

M3's 24-hour default is an internal initial investigation threshold, not a promised donor deadline or IRS deadline. It uses elapsed server time and requires no new calendar subsystem. Existing source retention, holds, correction and incident policies govern all records; no arbitrary seven-day/thirty-day deletion regime is imported from prior unrelated decisions.

The final path is a modest DAF awareness view plus correctly classified IRA history and acknowledgment access. The design is explicit and testable. Implementation, document qualification and donor comprehension remain evidence to earn before release, rather than claims made by this review.
