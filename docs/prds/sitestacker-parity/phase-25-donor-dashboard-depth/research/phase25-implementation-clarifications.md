> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Phase 25 — Final implementation consistency audit

**Scope accepted; audit completed with required implementation clarifications.** Q01–Q29 are ratified and Q30 confirms the assembled donor scope. No new donor feature family is needed. The audit found concrete ambiguities at the joins between decisions and predecessor code. The corrective contract below makes those joins explicit. **The expanded social-authentication architecture is not implementation-ready: G01 remains unresolved after fresh upstream research.** Other named source, provider and release qualifications remain prerequisites, not waived risks.

Use this register with the [decision index](phase25-decision-index.md), [evidence appendix](phase25-final-audit-evidence.md) and [ratification notebook](../decision-log.md). This is the final grooming clarification record, not a published PRD/OpenSpec, code change or authorization grant. Required owner amendments must be incorporated explicitly at the authorized canonical-spec stage; existing source does not acquire new permissions from this document.

## What builders must read as authority

Current founder ratification determines the intended Phase25 direction. Later specific reviewed clarifications apply to the exact subject they change; they do not replace every older rule with a newer global default. The current source/ADRs/OpenSpec still identify operational owners and what exists today. A proposed owner amendment must be reconciled explicitly before its new consumer activates. Current code is not presumed correct, and a research citation or green predecessor test is not implementation proof.

The notebook's dated ratification supersedes historical “proposed,” “unanswered” and “awaiting ratification” language retained in earlier review bodies. Historical ZIPs remain immutable evidence. Read current status from this entry point and the notebook. Use globally qualified identifiers such as **P25.Q29.A03**; a bare C07 or V03 is ambiguous across 29 reviews. The index normalizes local numbering only for cross-reference, without rewriting any requirement.

## Required clarification register

### F01 — Decision history and repeated requirement IDs are easy to misread

**Finding — Moderate, confirmed document ambiguity.** Historical choices, review amendments, ratification notices and repeated A/J/V/C identifiers coexist. A builder could implement an early alternative or treat a later 20-row default as a global replacement. The machine index found 30 decision entries and 1,479 distinct question-qualified definition aliases; they are navigation anchors, not 1,479 independently verified requirements.

**Corrected contract:** Every implementation/design/test reference must include its question and local identifier. The active index plus dated notebook determines status. Preserve historical alternatives as evidence, not open options. The matrices below settle cross-question meaning; unresolved owner amendments stay labeled as amendments. No proof checkbox becomes passed because its product decision was ratified.

**Closure evidence:** structural checks for all 30 entries, source links, acceptance notices, unique qualified aliases and preserved historical bundles. No new architectural ADR is needed merely for this indexing convention.

### F02 — A donor role or financial donor row is not the portal's universal admission rule

**Finding — High/Critical, current predecessor mismatch.** The current proxy/layout and snapshot expect donor/superadmin roles and a donor row. Q01/Q04/Q19/Q29 also admit exact reader, representative-only and document-specific contexts. A blanket relaxation would expose data; retaining the old gate would exclude legitimate users or encourage fake financial records. Auth context code also contains role/profile fallbacks and a membership lookup that conflicts with the configured exposed schemas. [E2](phase25-final-audit-evidence.md)

**Corrected contract:** Resolve the verified Tenant/host and the appropriate existing P12 Tenant Authorization Context. Authenticated humans use a validated Active Tenant Assignment. Exact source/record grants then constrain the permitted resource, subject and purpose within that qualified context. A document-only or guest handoff follows its already-owned P4/P18/P19 admission contract; it creates no generic alternate context or broader list right. A financial subject, personal contact subject, notification recipient and public reader are not interchangeable. Missing or failed membership resolution cannot become a profile-role or demo-Tenant fallback. Do not expose the entire authz schema or call an auth.uid-bound membership function with unrelated service-role authority.

Neutral entry remains personal-first; a valid targeted or active represented task retains its exact context. Personal Profile, Updates and personal preferences do not silently switch to the represented legal donor. A record-only document grant does not grant list access. A legitimate CRM person/contact may be created only through its own authorized identity flow; no manufactured gift/donor claim is permitted to satisfy an old snapshot.

**Closure evidence:** page, API, direct Data API/RPC/Storage and async-result tests for ordinary, representative-only, multi-role, multi-Tenant, document-only, revoked and lookup-error cases. Adopt P12 once; retire reached compatibility fallbacks.

### F03 — The existing `/pledges` route means recurring giving

**Finding — High, confirmed route/terminology collision.** `DonorSubNav` labels `/donor-dashboard/pledges` as Recurring Giving, and that page maps recurring records to a legacy pledge view. Q26's visible **Pledges** now means fixed-total campaign commitments. Reusing the URL would retarget old emails/bookmarks and could open the wrong kind of record. [E3](phase25-final-audit-evidence.md)

**Corrected contract:** Canonical **Recurring giving** uses `/donor-dashboard/recurring`. The existing `/donor-dashboard/pledges` becomes only a compatibility redirect into recurring giving. Fixed-total **Pledges** uses `/donor-dashboard/campaign-commitments`. Add the canonical recurring route first, update internal links, and preserve the narrow read-only GET/HEAD compatibility route. Validate recognized legacy target/view parameters and reauthorize the actual destination; never interpret legacy recurring IDs as campaign commitment IDs. Invalid/unavailable targets reach safe recurring context, not another donor or the fixed-pledge list. No other broad route renaming is implied.

**Closure evidence:** saved links, auth returns, personal/represented scope, query allowlist, same-looking IDs, restricted records and Back/focus tests. Source terms remain Recurring arrangement versus Fixed-total pledge even where an old component or path still contains “pledge.”

### F04 — Personal Name/Phone needs one owner and all writers must converge

**Finding — High, verified source-control-flow defects and incomplete intended contract.** The donor settings path splits names and mirrors profile/donor values through separate writes. The generic profile endpoint places phone in both profile and missionary updates, writes the profile, then can reject a donor with 403. GraphQL and its atomic RPC expose another field/audit contract. Read fallbacks can make a successful clear look undone. Q27 explicitly did not settle legal/full-name editing. [E4](phase25-final-audit-evidence.md)

**Required P9 execution amendment:** Provide one exact-Tenant, proved-person **ordinary personal-contact Name** and optional **Phone** contract through the owning subtype/contact service and P12 field/purpose capability. This is an explicit source extension/adoption, not an assertion that a canonical `persons` field already exists or that a generic PATCH grants authority. Name is one unsplit Unicode value for this contact/display purpose. Do not infer given/family names, require a surname, reorder international names or overwrite independent structured/legal names. The owning service alone controls any intended Party label write-through; Party receives no new inline contact fields.

Phone preserves meaningful human input and extensions. A normalized dialing form is derived only when region evidence supports it; a display locale or mailing country is not automatic dialing authority. Phone is clearable, not login/MFA enrollment, SMS consent, verification or a channel preference. Input bounds and normalization come from one typed source/client field contract, not independent UI masks or silent truncation.

Changing these fields does not mutate Auth identity, another Tenant, a represented Party, provider billing data, issued legal/addressee facts or released missionary/public identity. Future document and public uses follow their separate source/consent/projection rules. The editor can explain the distinction and route an actual document correction through its existing owner. No forced profile completion or phone-verification ceremony is added.

**Atomicity and adoption:** Validate every selected field and permission before writing. One P9 transaction commits the accepted fields, revision and required audit/activity. Use expected revisions and narrow change-record correlation for lost-response reconciliation; do not create a provider journal or the reserved generic CRM command-log system. Return the committed result independently of the subsequent whole-page fetch. Audit/activity records carry minimized field IDs/revisions and actual actor/purpose, not raw copied contact payloads. Reconcile donor PATCH, generic profile PATCH, GraphQL/RPC and all fallback/collection readers; hiding one editor is insufficient.

**Closure evidence:** invalid second field writes nothing; source audit failure rolls back; a saved value remains reported saved after refresh failure; stale/ABA and duplicate request handling; mononyms/non-Latin names; phone clear/extensions; donor+missionary identity; every alternate writer and direct attempted bypass. The static 403-after-write finding is not presented as an observed production incident.

### F05 — Wallet Remove needs a complete operation and return journey

**Finding — High, missing cross-decision execution detail.** Q03 protects replacement and Q16 protects Add/preference, but neither alone fully specifies Remove admission, unknown outcomes and the return from replacement. The roadmap and P16 require actual removal, not just a safe-looking button. [E5](phase25-final-audit-evidence.md)

**Required execution contract:** On Remove, resolve the exact Tenant/account/mode/Commitment-Party/customer/method binding and inventory all owner-required dependencies under the shared removal/new-use fence. Include active/accepted uses and unresolved setup/payment/control work that still requires the method. A stale browser count cannot authorize detach. Hidden dependencies may block removal without revealing their identities.

If in use, offer the already-governed Replace journey. Its completion returns to a **fresh explicit Remove review**; replacement never silently detaches the old method. All relevant live dependencies must be resolved, including unselected or restricted uses. Historical evidence-only references and a new-gift preference pointer alone are not permanent in-use blockers; preserve historical evidence and apply only the exact Q16 preference cleanup after removal proof. The donor may finish replacement and keep the old method. An expired review or changed authority triggers re-review, not repeated payment setup.

For an admissible removal, durably accept the exact command before provider effect. Prevent new conflicting use while it is pending/unknown. A lost response retains the same operation identity and fence until provider/control reconciliation establishes the actual result. Only proved no provider effect permits the owner to report that removal did not occur and, if current safety permits, release the temporary fence. An error response alone is not no-effect proof. Unknown says removal is being checked, not Removed. Retry/reentry reconciles that operation, never generates a fresh detach blindly.

After exact removal proof, clear only still-matching new-gift preferences/pending preference references through their owner, protected against a newer choice. Do not promote another default or change recurring instructions. If cleanup fails after detach, report the confirmed removal plus remaining source cleanup accurately and retry that secondary effect; never repeat detach as the cleanup repair. No catch-up charge, collection retry or cancellation is implied.

**Required older-contract supersession:** `openspec/changes/add-donor-self-service/specs/donation-lifecycle/spec.md:141` still says set-default through Stripe-managed flows. At canonical adoption, replace that meaning explicitly: **Preferred for new gifts** is Q16's Asym-owned current human/giving-context preference for new checkout. It is not Stripe Customer billing default, a recurring binding, mandate, retry/fallback permission or payment instruction. Replace the active-cohort-only removal example with the all-relevant-live-dependency test above. Qualified hosted collection/authentication does not delegate Core command or result authority to Billing Portal. Reconcile reached callers and acceptance examples together.

**Closure evidence:** simultaneous new checkout/use and Remove; restricted dependency; replacement with one failed/unselected use; unknown provider success; reload; expired review; preference changed during detach; post-detach cleanup failure. Reuse P16 command/control infrastructure and the provider's qualified semantics.

### F06 — Annual-summary History must not lose its scope when exported

**Finding — High, cross-question omission.** Q20 exports applied History filters and an original Gift amount. Q23 later adds a precise annual-summary descriptor using current effective monetary giving including fee cover. Copying only visible filter chips can broaden the download or change its meaning. [E6](phase25-final-audit-evidence.md)

**Required P3/History clarification:** Download from a Q23-targeted History view captures the complete source-qualified context: legal subject, admitted issuer/currency partitions, each resolved civil-date range, existing measure identity/version and applied narrowing predicates. Preserve that descriptor through review/admission/extraction, with current authorization and Q20's immutable request semantics. Unsupported/expired/denied context requires review; it cannot silently fall back to all history.

The fixed annual-view export census includes a source-projected **Current giving amount**, explicitly described as **including fee cover, after refunds and returns**, per admitted root. This is Q23's existing measure, not a second money calculation. Keep the original **Gift amount** unchanged and add no total row, column wizard or client sum. Generic History exports retain their Q20 base census. A permitted scope edit produces a newly qualified filtered descriptor; it does not retain an inaccurate “all year” claim. Blank/unavailable amount is not zero.

**Closure evidence:** USD100 gift plus USD3 fee cover exports Gift amount 100 and Current giving amount 103 in the qualified annual view; source refund/correction changes only its appropriate effective value. Prove multi-issuer different civil ranges, QCD inclusion in informational personal money, DAF exclusion, period edits, hidden fields, extraction-time corrections and exact frozen bytes on retry.

### F07 — Giving, recognition and document amounts must remain separate everywhere

**Finding — High, established distinctions vulnerable to generic reuse.** “Amount,” “receipt,” “giving” and “pledge” are overloaded in predecessor models. No single total or status may cover these meanings. Q29 also reaches a generic text receipt endpoint outside the canonical purpose resolver. [E6](phase25-final-audit-evidence.md), [E7](phase25-final-audit-evidence.md)

**Corrected contract:** Use the money/document matrix below and preserve original currency/exponent, exact subject and source date. Neither a DAF credit nor employer match is the advisor/employee's personal money. An IRA/QCD gift is a personal source contribution when properly resolved, with QCD intent, organization-side case admission and personal tax treatment kept separate. Its acknowledgment is distinct from ordinary annual items. No informational total is presented as a deduction.

Converge the direct generic donor-receipt URL as well as buttons. Unknown/dark QCD, DAF advisor, unsupported purpose or revoked rights cannot receive an ordinary text/PDF fallback. Lawful source-authorized case changes and corrected artifact successors remain possible; disabling new issuance does not erase legitimate historical access. Reading never issues or repairs a gift/credit/document.

**Closure evidence:** mixed direct/DAF/QCD/match donor, partial attribution, corrections, all direct URLs, source dark/qualified combinations and current versus frozen document versions. Existing catalog code is only part of this proof.

### F08 — Newsletter request, Updates preference and receipt quieting are three different effects

**Finding — High, likely integration error.** A generic settings page or “subscribe” label could turn Q25's request into enrollment or make marketing opt-out suppress mandatory transactional messages. Q07/Q13/Q21/Q25 deliberately chose distinct owners. [E8](phase25-final-audit-evidence.md)

**Corrected contract:** Show in my Updates changes only personal reading preference. Email me about new posts changes the exact qualified topic/contact delivery preference. Eligible routine recurring-receipt quieting affects only its admitted receipt family under source policy. Newsletter request delivers one governed request to the missionary; it does not subscribe, verify mailbox ownership, follow a ministry, create a donor claim or manage an external list. “Sent”/“received” describe their exact source/provider fact, never human reading or external subscription.

All direct writers and legacy generic preference fields must adopt the owner-specific commands, currentness and withdrawal fences. No shared Save, recipient, revision or global do-not-email flag substitutes for these separate scopes. A fresh permitted Off must be able to stop future effects despite an earlier unknown On under the ratified owner policy. Preserve the distinct cutoff: Q07 post-email Off fences dispatch admission, while Q13 routine-receipt Off fences the prospective P7 decision before occurrence admission. Already admitted receipt work follows its own required policy; these are not one generic unsubscribe cutoff. No automatic offline reapplication or queued opt-in under a changed context.

**Closure evidence:** represented giving while editing personal preferences; hidden source; pending/unknown On followed by Off; unsubscribed transactional notices; newsletter unverified destination; duplicate handoff and external non-enrollment. Existing Email Studio/P6/Resend own dispatch; the portal adds no sender or inbox.

### F09 — Zero artifacts means known irrelevance, not hiding failures

**Finding — High, apparently conflicting UX rules without a state matrix.** Ordinary DAF/QCD/pledge absence must be invisible, but an explicitly requested relevant route cannot show a fake empty success when retrieval fails. Permission must also prevent counts/placeholders from revealing hidden records. [E9](phase25-final-audit-evidence.md)

**Corrected contract:** Compose ordinary conditional UI only from a source-admitted relevance result. Known no admitted records yields no module, link, filter choice, badge, placeholder or reserved gap. Unknown relevance never creates a fabricated zero or a special-module hint; the independently safe surrounding page can load normally. A known permitted destination that fails displays a scoped retry/error; a direct denied/missing target gets the safe owner-qualified unavailable outcome. Never use a generic spinner indefinitely to conceal a known failure.

Special records with zero current amount or only permitted historical corrections are not necessarily “none.” A revoked record does not remain visible because the user once saw it. No hidden-row count, reason, sort value, sensitive alias or last-known cached card bypasses current permission. Home's current-action admission is not the notification unread rule; neither creates a task or severity merely because a row exists.

**Closure evidence:** none versus unknown versus error versus revoked, known relevant route, zero-effective history and no financial donor record; SSR/hydration and stale-client cases must agree.

### F10 — Counts, ordering and clocks are intentionally local

**Finding — Moderate/High, confirmed integration ambiguity rather than conflicting decisions.** Several reviews use three previews, two lines, 20-row continuation, 24 hours or 30 days. Their objects and start events differ. Applying one shared constant changes donor behavior or custody. [E10](phase25-final-audit-evidence.md)

**Corrected contract:** Use the presentation and clock matrices below. A display preview is not a query cap; readable material facts may escape ordinary preview limits. A retention ceiling, admission expiry, worker lease, provider verification deadline and internal investigation threshold are not interchangeable. Each has its exact source owner, start event, cancellation/earlier-stop policy and hold behavior. Reload, resend, retry, reauthentication and archive restore never restart a clock unless the owning contract explicitly defines a new legitimate operation.

**Adopt complete-process accessibility:** the current mobile subnav hides its text without supplying accessible names. Give every navigation/control an accessible name at every breakpoint, with actual current-location semantics, headings and required hit areas. Q01 requires visible **Ministry Updates** text on phone and desktop; an aria-label-only repair is insufficient. Critical labels remain visually understandable, and material amounts/consequences wrap rather than inherit a two-line component clamp. Existing feed share success must wait for clipboard completion, use an authorized current URL, and recover honestly on failure. Only source-proved exhaustion permits an end-of-currently-available-results message; it never proves the donor has read or is caught up. These are reached predecessor defects, not new feature requirements.

**Closure evidence:** fixed-clock boundary tests at one unit before/at/after every expiry, source changes during an accepted operation, same-looking durations with different starts, undated/corrected ordering and snapshot/current continuation semantics.

### F11 — The requested latest TanStack stack is not the installed stack

**Finding — High, verified dependency/adoption mismatch.** The worktree still installs Table `9.0.0-beta.9` and DB `0.6.4`; current registry latest is Table `9.2.4` and DB `0.8.7`. The root override pins DB `0.6.4`. Supabase Labs adapter `0.0.1` declares DB `^0.6.0`, while current Query DB Collection `1.2.12` declares DB `0.8.7`. These ranges do not prove a coherent new stack. [E11](phase25-final-audit-evidence.md)

**Corrected contract:** At implementation, qualify and lock one then-current compatible stable set across shared packages, adapter/core versions, overrides and lockfile. No floating runtime `latest`, beta examples pasted into stable APIs or forced override treated as compatibility proof. Preserve shared Maia/Base UI; ReUI is the reference for real grids, not a mandate to add a grid or licensed code to every list.

For protected Phase25 collection readers, use the canonical API/source envelope through the already-established Query-backed TanStack DB collection pattern. Single-object reads and mutations retain their qualified Query/owner-command paths; these roles do not require every library on every screen. Table owns view state, Query owns the request/cache lifecycle, DB owns the admitted client collection, Store owns transient presentation state, and Virtual owns rendering. None owns authorization, financial folds, complete server filtering or a second fetch of the same result. Source pagination/filtering/sorting and safe field selection happen before delivery. Configure bounded/on-demand loading; do not copy a full-table eager/progressive-sync example for a sensitive donor dataset.

Do not force the incompatible Labs adapter into these protected readers. Keep direct-table consumers behind their own approved boundary and qualify their migration separately. Prove the actual collection version, contextual disposal, stale-response fencing, zero duplicate DB runtimes, server predicate/cursor propagation and no private browser persistence. The dependency table is dated evidence, not a package-upgrade test or a license/compatibility guarantee.

### F12 — Public FAQ and help copy promise behavior the contracts do not

**Finding — High for donor trust, confirmed predecessor copy.** The FAQ advertises moderated portal messaging, statements in History by January31, automatic emailing to an address on file and unqualified money-allocation policies. These are not established by Phase25's current owners. [E12](phase25-final-audit-evidence.md)

**Corrected contract:** Reconcile all reached public/help/email/onboarding instructions with actual activated capability and current source policy. Generic document copy should say available documents are in **Receipts & statements**, with the organization's verified help channel for missing/incorrect records. Do not promise a universal date, automatic delivery, external newsletter enrollment, portal messaging or particular net-to-field/surplus policy. Financial/policy claims need the tenant's approved P23/P24 public-content authority and controlling operational facts. The public FAQ is not a requirement to build those features.

Existing contextual help, document-copy fulfillment and fixed-pledge disputes remain their finite owner flows. Public/private content composition remains explicit: P22 public empty Updates collapses, while Q19 private Home may retain its one neutral Updates empty region. P23 published HTML/RSC stays independent of viewer cookies/auth; private Q25 prefills and operation receipt state belong in the private path. Qualify P23 D26's existing idempotent no-JS public submission boundary; never put viewer-specific tokens in shared cached markup or add a mandatory account/inbox step.

A donor My messages inbox is a P26 scope decision; public tribute walls, P36 campaign management, P33 FX comparisons and P38 privacy case management are not silently imported. Existing privacy/help duties remain.

**Closure evidence:** copy/capability census across public FAQ, sign-in, help, dashboard, notifications, email links and empty/error states; test tenants with disabled/dark/unavailable capabilities and no unsupported promise.

### F13 — G01 is still an unresolved native Auth integration contract

**Finding — Critical conditional architectural blocker, not an observed live exploit.** Fresh public release/source research used Supabase Auth `v2.196.0` (18 August2026), not only Q14's earlier snapshot. Current docs retain automatic email linking. The inspected BeforeUserCreated hook does not govern the existing-account LinkAccount branch. PKCE linkage can commit before code exchange. The experimental linking-domain mechanism remains experimental and changes native account semantics; no supported selective hosted control was established in the public Management API. [E13](phase25-final-audit-evidence.md)

**Required resolution:** Before enabling an affected social route, the P4/shared Auth owner must qualify an officially supported control in the exact target deployment that prevents a new email-matching provider assertion from gaining an existing principal's authenticator/native credential access before the ratified current-account/possession policy is satisfied. Prove native authorize, ID-token, manual-link, exchange, refresh and credential-management paths; distinguish sign-in with an already-bound stable provider subject from adding a new identity.

A Core callback, hidden button, post-link P12 check, generic token hook, profile/RLS rule or manually initiated UI alone is not demonstrated native protection. Do not silently use experimental isolation, create an Auth fork/broker, drop a requested provider or call email-only support completion of Q14. The public evidence does not prove that no supported arrangement can exist; it proves the required target contract remains unestablished.

The concrete owner inquiry is: **which supported target-deployment control requires deliberate current-account proof before adding an email-matching OAuth identity, preserves already-bound-subject sign-in, and prevents every direct native bypass?** Evidence must name its supported API/configuration, trustworthy inputs, transaction point, endpoint coverage and recovery/link/unlink behavior. No external message was sent. If no supported native solution can satisfy it, a separate explicit architecture or release-scope decision is required. This audit does not make that choice.

### F14 — Source qualification, provider qualification and UI proof need separate release gates

**Finding — High, recurring readiness ambiguity.** Existing catalog entries, synthetic examples, source tests, provider metadata and ratification have been used in different reviews. They establish different things. P22–P24 branch contracts are active authority for their intended work, not automatically merged runtime. [E14](phase25-final-audit-evidence.md)

**Corrected contract:** Maintain the gate ledger below with exact dependency, evidence, owner and affected consumer. An unqualified social/provider/QCD lane blocks that lane; it does not justify fake UI, duplicate source infrastructure or silent scope reduction. Independent safe work can proceed. Whole Phase25 completion requires all accepted scope or an explicitly changed scope, not a majority of passing tests.

At authorized canonical publication, reconcile reached ADR/OpenSpec/source-design/task and existing-issue wording before declaring build-ready tickets. Do not implement old ticket text simply because it exists. No task should depend on an unqualified read/command without naming the source producer and acceptance evidence. No speculative generic engine is required to join the finite reviewed flows.

## Financial actions and outcomes

<!-- prettier-ignore -->
| Action/context | Permitted business effect | Result and recovery boundary |
| --- | --- | --- |
| Q16 standalone Add | Save/verify a credential for the separately disclosed setup purpose; optionally accept bounded new-gift preference intent | No payment, recurring authority, binding or billing-default change. Saved, ready and preference-applied are independent facts. Verification may validly finish after optional preference expiry. |
| Q03 Replace | Exact selected eligible recurring bindings/authorizations, group-specific independent results under one final reviewed intent | No automatic charge/retry/resume/restart/remove/default. A same-object metadata edit has potentially wider scope and cannot pretend deselection isolates it. Successful children remain successful during residual/unknown work. |
| Separate Remove | Only the precisely admitted credential removal and exact matching preference cleanup | The source admission fence and provider proof, not an unused UI count, decide completion. No catch-up, replacement rollback or automatic alternate preference. |
| Q09 ordinary recurring edit | Source-defined prospective changes to exact accepted lines | Ordinary Save is noncharging. An explicitly chosen, qualified Today occurrence is a separately named financial effect requiring exact review/authorization; one review may contain it. Unaccepted preparation is not an arrangement. |
| Q15 start again after fully canceled | Fresh recurring checkout and authorization, historical amount/frequency as editable suggestions only | Exactly one initial attempt per disclosed compatible new cohort after final authorization, even if continuing schedule starts later. Preserve separate real charges; no former mandate, debt, old retry or implicit earlier end/default. |
| Undo a still-active cancel-at-period-end | Only the separately qualified continuing source action, if supported | Not Q15's fully-canceled fresh restart. No old authorization resurrection from a raw Stripe canceled/active flag. |
| Q18 Pause | Current or future accepted pause interval over exact owner-qualified accepted lines | Preserve intent/control/payment axes. Initial ACH already in flight is independent; pending_activation can retain a future pause. Pause accepted now may close old recovery before its future start; copy must not say nothing changes until then. |
| Q18 Resume | Qualified continuing intent on unchanged source grid | No initial payment, re-anchor, proration or catch-up. A still-eligible original Today slot may be named/reviewed in the same action and collected only by its sole ordinary executor; expired/missed/submitted/unknown slots cannot be reopened. |
| Q06 optional repair follow-up | Only the exact failed scheduled occurrence whose original recovery window and source eligibility remain open, after the full original repair task is complete | No offer for terminal Missed, expired, paid or closed recovery, or after generic Wallet maintenance. Setup, provider return or partial replacement is not full repair. The offer starts a fresh exact owner review; it is not an automatic payment. |
| Q26 Request change/dispute | Nonexecuting immutable request; the explicit independently qualified dispute also enters protective authority review | Request received is committed receiving work, not terms changed or payments stopped. Fixed pledge authority, recurring authority and money remain separate. |

**One final financial-state statement:** UI actions that do not initiate a payment must not say **No charge today** when an independently authorized ordinary scheduled or already submitted payment can still occur. State the action's actual effect and separately show the source-qualified relevant payment facts. Likewise, an immediate successful checkout submission/ACH start is not received money. A calm success presentation may affirm the accepted instruction while retaining truthful Processing/verification/control qualification.

Q15's old known in-flight payment is not a universal blocker to fresh giving when the old future executor is definitively fenced and independent new authority is proved. Conversely, unknown old executor stop cannot be treated as safe. Q18's passed final horizon ends future intent across live intent axes while preserving cancellation/supersession precedence and remaining payment/control warnings. Q22 then derives Current/Past from complete authorized membership: terminal intent with a relevant unresolved stop/payment can remain Current without becoming ongoing; an unread receipt notice or new successor alone never revives it.

## Money and document meanings

<!-- prettier-ignore -->
| Meaning | Source and allowed use | Never substitute |
| --- | --- | --- |
| Original Gift amount | Q10/Q20 original supported non-fee-cover gift value, explicit currency; its filter and base CSV keep that meaning. | Net after refunds, fee-cover-inclusive total, deductible amount or matched allocation. |
| Requested amount | Independently admitted pre-posting request fact. | Received/posted/settled money. |
| Current giving amount | Q23 effective posted monetary source measure for the current authorized personal or represented legal donor, fee cover included, finalized effects applied, original currency/issuer/calendar cohort. | Available ministry balance, irreversible settlement, current-year cash flow or tax deduction. |
| Matched allocation | Exact permitted allocation explaining why a root matches a fund filter. | Full root amount or a hidden sibling. |
| DAF attributed amount | P14 scoped/capped recognition; whole-grant amount needs its own complete-source permission. | Advisor personal money, sponsor receipt or full grant amount by renaming. |
| Employer match received | P14/P13 actual match facts under own-employee projection and receiving-issuer/currency admission. | Employee's personal gift, employer approval, predicted match or completion on first installment. |
| IRA/QCD gift | Properly resolved owner/beneficiary's monetary gift; intent, case admission and tax outcome are separate. | DAF soft credit, custodian legal giving by brand, another deduction or certified RMD result. |
| Ordinary annual contribution document | P7/P18/P19 exact admitted document population/purpose. | Personal Home total; QCD distribution fields and DAF advisor credit are excluded under current contracts. |
| QCD acknowledgment | Exact qualified `us.qcd.acknowledgment@1` with original distribution/correction facts and protected meaning. | Ordinary receipt fallback, tax eligibility calculator or absence of all official documentation. |
| Support overview | Separate optional non-tax recognition artifact; Off means no work/UI for that artifact. | Official document, new DAF private-read permission or a general household account. |

## Route, subject and visibility contract

Logical destinations without a new exact path below retain their established source route; the audit does not authorize a broad URL redesign.

<!-- prettier-ignore -->
| Destination | Subject and composition rule |
| --- | --- |
| Home | Current permitted personal/represented giving context as appropriate; each section independently owns its read. Welcome is not proof of no gifts or new-donor classification. |
| Ministry Updates | Current human reader and authorized source; represented giving does not retarget readership or consent. Public direct content remains public when its owner allows it. |
| Giving history | Exact legal-giving subject/issuer scope. Neutral All available; targeted annual/filter descriptors preserved and reauthorized. |
| Recurring giving | `/donor-dashboard/recurring`; exact arrangement/line/group command scope. Legacy `/pledges` redirects only here. |
| Fixed-total Pledges | `/donor-dashboard/campaign-commitments`; conditional source-admitted commitments/history, no artifact for none. |
| Wallet | Exact source/provider/customer/mode binding and per-method dependencies; saved preference is not a recurring instruction. |
| Receipts & statements | Exact source-granted recipient/document context. Individual record grant may not authorize a broader list. |
| Employer matches | Current person's exact admitted employee-matching view, with independent field/issuer/currency rights; conditional Giving history link. |
| Donor-advised fund grants | Exact source-qualified attribution subject and current viewer; conditional Giving history link, independently scoped amounts. |
| IRA gift acknowledgment | Existing personal History/detail and Receipts & statements; no DAF/QCD shared navigation or irrelevant tax explanation. |
| Profile/contact | Exact current personal-contact owner; Auth credential and legal/public/represented effects remain independent. |
| Preferences/Notifications | Each current personal reader/recipient/contact/topic or exact receipt scope remains explicit; no generic donor-Party selector. |
| Newsletter request/help/dispute | The finite qualified occurrence or source record and its actual owner; no new conversation inbox or cross-scope actor. |

## Presentation and ordering defaults

<!-- prettier-ignore -->
| Surface | Ratified default and interpretation |
| --- | --- |
| Home current action | Q12: three ordinary rows with bounded More in the same section; material current meaning cannot be hidden by a preview limit. |
| Home Updates / welcome | Q19: three previews, source-authorized and independently available. No zero amount or failed query labels someone a new donor. |
| Focused ministry | Q24: three/two reviewed previews under the exact configured current fund scope; older financial records survive content/association changes. |
| Recurring arrangements | Q22: Current/Past and stable immutable group-creation order; up to two ordinary admitted lines per group with material-fact escape and all-line access. |
| Notifications | Q17: All first; desktop five-group Popover, phone full center with 20-group continuation and explicit Load more. More current actions require the source-qualified complete count/path; Home needs no such total. Keep the finite three-family/13-key catalog, source event truth, unread state and current action relevance separate; no Home/Updates mirrors. |
| Full Updates | Q02/Q07: All first, exact single-ministry filter if selected, source audience/Hide/order before explicit Load more. No invented fixed batch number or local-list caught-up claim. |
| Home giving | Q23: three complete issuer/currency rows for each issuer's current calendar period, existing current-giving measure and exact targeted History. No skipped unavailable partition, mixed-period misleading heading or cross-currency total. |
| Preferences | Q21: one calm overview; direct controls for one exact scope, complete qualitative summaries plus Manage for many. No numeric counts, arbitrary ministry preview or global Save. |
| Receipts & statements | Q08/Q29: Annual statements first, then Individual receipts, relevant IRA acknowledgments in their admitted context; older access remains direct. No global current-year filter or newly frozen universal batch size. |
| Fixed pledges | Q26: 20 records in immutable creation order with source continuation; a small all-admitted list, without an unnecessary Current/Past chooser. |
| Personal History | Q10: all available source-qualified history and continuous bounded loading, no numbered pagination; source filters/sort apply before paging. |
| Employer matches | Q28: 20 canonical roots, stable source creation order suitable for recorded pipeline facts; received amount is independently proved. |
| DAF grants | Q29: 20 roots in effective gift-date order plus stable ID; undated safe tail, correction-aware source continuation. Gift date is not automatically Received on. |
| All surfaces | Shared base-maia/Base UI/Zinc semantics; ReUI as reference for actual grids; no universal grid, chart, exact count or copied staff density. Critical labels/actions wrap and remain accessible. |

## Clock and custody matrix

These are existing reviewed meanings, not one platform TTL. Exact stronger source/provider limits and owner-specific holds still apply; a hold cannot revive expired public access or authority.

<!-- prettier-ignore -->
| Clock | Start and exact effect |
| --- | --- |
| P16 command preview/authorization challenge | 15 minutes from issuance, invalidated earlier by changed relevant terms/revision/authority; shorter applicable provider/owner limit wins. |
| P16 worker lease | Two-minute operational ownership lease with heartbeat, never beyond the command/financial window; expiry is not proof that a financial effect failed or permission to issue a new effect. |
| Financial journal/semantic result | Source life plus its governed audit tail; not the provider's temporary request-key cache. P16 retains the relevant record seven years after the later arrangement end or last related financial activity under its own policy. |
| Q16 optional pending preference | 24 hours from accepted Add/preference intent; supported microdeposit extension up to ten elapsed days from that same instant only when classified before the initial deadline. Expiry affects conditional preference application, not valid method verification or saving. |
| Q20 export review envelope | Ten minutes from envelope issuance; expiry blocks new admission and does not erase already accepted work. |
| Q20 export preparation | Separate ten elapsed minutes from durable acceptance, including queue time. No late Ready or silent truncation; retry retains the original deadline. |
| Q20 export bytes | 24 elapsed hours from first atomic Ready. Failed/incomplete preparation payload is removed no later than 24 elapsed hours from acceptance. Canceled/invalidated access is denied immediately and payload promptly queued for deletion. Refresh/download never restarts Ready time. |
| Q20 minimized export correlation | 30 days from acceptance; private rows/filters/manifests follow short payload custody and cannot be reconstructed from minimized history. |
| Q25 request utility | Seven elapsed days from durable acceptance bounds first email handoff/preparation/attempt and first local notice availability. Normal dispatch is immediate; sealing before the deadline does not permit first send after it. Earlier owner stops win; retry/seal/notice recovery never renews the window. |
| Q25 Core request detail | 30 days from acceptance; prepared P6 primary material has its independent purge bound, including at most24 hours after an earlier governing stop. |
| Q26 arbitrary request text | At most90 elapsed days from acceptance absent an exact applicable hold; normalized source instruction/result/journal follows its own retention. |
| Q27 retired address | Leaves current editor immediately and narrow live raw storage within24 elapsed hours of retirement; exact legal holds/earlier erasure remain. |
| Q27 minimized postal change evidence | 365 elapsed days after the change event. Still-needed live guards/reference-needed withdrawal evidence retain their separate active purpose and enter that bounded disposal class after the terminal purpose/no-reference event. No raw address or reversible fingerprint in those guards. This is not a name/phone or financial retention policy. |
| Q17 informational unread | Ends at earliest admitted read/archive/correction/supersession or 30 elapsed days from availability; restore does not mark a person as having read or reopen ended unread eligibility. |
| Q17 Information history | 90 elapsed days from availability, shortened by current access and stricter source lifetime, including Q25 body/detail expiry. UI enforces expiry even if physical purge is delayed; this is not permission to retain all raw content for 90 days. |
| Q17 source-actionable history | Current source need while access holds; source end is recorded once, followed by non-unread history for 90 days under current access/stricter source limits. Read does not end the need; refresh does not reset source-end time. |
| Q29 QCD preparation investigation | Internal alert at24 elapsed hours from admission of a real qualified preparation operation without a hold. No donor/IRS deadline and no operation created by a read. |

Do not reuse any of these clocks for a different object merely because it is also called a request, receipt, preference, session or history. Existing detailed source clauses control exact cancellation, purge retry, legal hold and terminal audit treatment.

## Implementation and qualification ledger

<!-- prettier-ignore -->
| Gate | Owner and necessary evidence | Affected work |
| --- | --- | --- |
| G01 native social linking | P4/shared Auth; supported exact native pre-link/credential guarantee and direct endpoint tests. Still unresolved after fresh research. | Affected Google/Apple/Facebook activation; email-only is not completion of requested social scope. |
| Provider application readiness | Platform identity owner; exact Apple eligibility/relay capacity/rotation/lifecycle and ordinary public Facebook/Google callback/login proof. | Each provider independently; no dead buttons or inferred production readiness. |
| Identity and projection source | P3/P4/P9/P10/P12; current assignment/subject/field/purpose, legitimate nonfinancial contexts, all reached writers/readers and actual SQL guards. | Every protected surface and F04 personal-contact amendment. |
| Financial and recognition source | P13/P14; real canonical ledger/folds/corrections and named read interfaces, exact currency/date/grant grain. | History/Home/export, matches and DAF. |
| Recurring/wallet command authority | P16 and provider adapter; exact target account/mode/rail/binding proof, removal fence, journals, unknown-result reconciliation. Q06's optional repair follow-up activates only for a positively proved repair profile that preserves the original eligible occurrence; candidate examples are not capability proof. | Change/repair/skip/pause/resume/cancel/restart and Wallet Remove. |
| Document case and production | P7/P13/P18/P19; case facts including QCD, exact recipient/issuer, protected renderer/artifact and direct-route convergence. | Official/current documents and governed outbound copies. |
| Communication/request source | P6/P17 plus respective topic/request owner; suppression/admission, recipient/purpose, idempotency and custody. | Auth messages, preferences, receipt quieting, newsletter handoff and finite requests. |
| Public/content/host adoption | P22/P23/P24 current branch contracts, exact verified host and approved safe content projections. | Branded entry, ministry context, newsletter source, public FAQ/help claims. |
| Package and adapter adoption | Shared database/UI/auth owners; one compatible locked release set, approved source-backed collections and disposal/performance proof. | Reached TanStack/data/UI integration; no forced incompatible adapter. |
| Whole-journey acceptance | Phase25 owner with relevant domain owners; real API/SQL/provider/browser/renderer/accessibility/comprehension, mixed-version and failure recovery proof. | Release completion of the accepted scope. |

## Required final cross-journey test scenarios

1. Exact represented recurring link → sign-in → correct subject → replacement → partial/unknown result → safe return → fresh Remove review. No old method detach, default promotion or charge by implication.
2. Personal Name/Phone save → API response lost or refresh fails → same-operation reconciliation; clear does not resurrect a fallback value; another tab's newer update and unrelated legal/public facts remain intact.
3. Q23 annual summary → targeted History → changed narrowing filter → Download → frozen qualified CSV. Original and current-giving columns remain distinct across fee cover, refunds, currencies and issuer-local date boundaries.
4. Direct gift, employer match, DAF grant and IRA/QCD gift together → correct Home/History/contextual explanations and distinct current documents, including the old receipt URL and dark/corrected cases.
5. Receipt quieting, Updates hide/email choice and external newsletter request in the same account → only their own effects, including unknown opt-in followed by withdrawal, delayed dispatch and body expiry.
6. No rare records versus source failure, late imported history, zero-effective corrections and revoked access → correct zero-artifact composition and explicit-route failures without hidden counts or stale cache.
7. Old recurring `/pledges` bookmark through authentication → canonical recurring destination; same-looking campaign commitment identifier must never be substituted.
8. Native social endpoints exercised before Core callback admission → required G01 guarantee. A page-only browser success is insufficient.
9. All surfaces at mobile width, text zoom, keyboard and screen reader; source refresh/back navigation preserves meaningful location and current state without forcing another unnecessary confirmation.
10. Mixed-version deployment and rollback after a real accepted operation/document → no resurrected generic writer, raw export, old receipt fallback, restarted clock or silent loss of historical access.

These join the existing per-question tests; they do not replace them or assert they have run. This final audit adds no new runtime tests designed merely to mirror a proposed implementation.

## Final outcome

The donor scope remains coherent. The recommended permanent clarification set closes document-reading ambiguity, route/name collisions, personal-contact effects, Wallet Remove, annual export scope, rare-record composition, clock/default confusion, dependency adoption and misleading copy. Required source amendments are explicit and traceable.

**One native authentication contract remains genuinely unresolved; the rest of the gate ledger identifies required owner implementation and qualification evidence.** No new donor feature or arbitrary safety ceremony is proposed. The final audit is complete, while a whole-phase implementation-ready or release-ready claim would still be false. At the authorized specification stage, carry these exact corrections and gates into the owning contracts and implementation tasks rather than asking builders to reconstruct them from the conversation.
