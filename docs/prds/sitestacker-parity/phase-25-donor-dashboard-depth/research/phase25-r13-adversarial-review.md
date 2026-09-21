> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Explicitly founder-ratified, 7 September 2026.** Conrad accepted A1–A4, J01–J12, C01–C22 and all reviewed presentation defaults. Historical proposal/review wording below is preserved; those corrected requirements are now accepted. Target implementation and release qualification remain required.

# Question 13 — Quieter recurring receipt emails: corrected decision and adversarial review

7 September 2026. **Disposition: Accept with required amendments.** Conrad selected A. The corrected execution below is proposed for ratification; it is grooming evidence, not a formal specification, implementation authorization, or proof of a deployed feature. Q01–Q12 remain ratified.

## Decision in plain language

Let donors stop eligible routine receipt emails for ongoing recurring gifts while keeping their giving and access to properly issued receipts intact. The IRS rules reviewed do not require a separate email after every installment. They do require appropriate records and, for qualifying gifts, timely written acknowledgment. A usable donor-selected electronic document route is compatible with that direction; an inaccessible file or generic payment confirmation is insufficient.

The practical recommendation is one clearly explained setting for the donor's current and future eligible recurring gifts to the same issuing organization. Preserve first/new-commitment confirmations and independently required notices. Keep existing annual-statement rules. Do not add a digest, legal-waiver checkbox, email-read surveillance, per-ministry preference matrix, or additional notification merely to confirm a routine preference edit.

### Material amendments for founder ratification

- **A1 — Explicit receipt-policy amendment and electronic-document route.** Phase7 may decide that a later routine receipt email is not requested, before admitting an email occurrence. Its correct acknowledgment facts and Phase18 document availability continue. Phase17 cannot disable a message already admitted as required. The positive initial qualification is ordinary U.S. monetary recurring giving with the required acknowledgment and a usable, recoverable, donor-selected portal route. Other jurisdictions and special document classes require their existing owner qualification; they are not inferred from U.S. rules.
- **A2 — One setting for current and future giving in an exact receipt scope.** One logical preference per Tenant, exact legal issuer, receipt-owning legal-donor Party and narrow routine-recurring-receipt-email purpose. The common case looks like “Receipt emails from Global.” It covers current and future eligible recurring gifts within that scope, without per-plan or per-ministry overrides. It does not affect another Tenant, issuer or legal donor merely because the same person manages them.
- **A3 — Explicit choice, defaults and continuity.** With no proven choice, preserve existing source-governed delivery. Do not infer Off from marketing opt-out, bounce, the prototype switch or arbitrary legacy frequency text. Ordinary edits, pause/resume and a properly completed contact change preserve the same scope's choice. A genuinely different legal issuer or legal donor does not inherit it. Initial/new-commitment notices retain their independent rules, even where later receipts follow an existing Off preference.
- **A4 — Honest prospective effect.** A completed Off change affects source decisions made afterward. Already-admitted messages can still arrive under their existing lifecycle. On affects future decisions and never sends a backlog. A source decision that no routine email was requested is durable evidence, not a fabricated sent, suppressed-at-provider, read or legal-receipt event.

These amendments keep the selected A direction. A2 and A3 resolve scope/default questions that were expressly open in the question brief. They are not disguised as minor UX hardening. Stable labels, safe return links, truthful save feedback, protected caches and no hidden financial side effects are safeguards preserving that direction.

## Adversarial check

### What could go wrong with this answer?

The switch could stop documents instead of email, suppress a required disclosure, affect another donor's records, or claim success while the database or provider disagrees. A donor could need an acknowledgment before an annual statement exists. These are concrete correctness and trust risks; none requires a complicated donor-facing legal flow.

### What hidden assumptions are we making?

We have no measured distribution of donor email fatigue or a comparative usability study. One setting is a product judgment. “Recurring,” “transactional” and “ministry” do not by themselves prove that an email is optional or a gift is fully deductible. A saved preference, an available document and a delivered email are different facts.

### How does this affect the whole product?

Phase7 retains acknowledgment facts and delivery applicability, Phase18 retains artifacts/access, Phase19 retains annual statements, and Phases3/6/17 retain their preference, consent and messaging boundaries. Staff can understand an authorized delivery decision without a new repair dashboard. Missionaries do not receive donors' private tax/email preferences. Giving, accounting, public content and newsletters remain separate.

### How does this affect the end-user experience?

The donor gets one understandable choice, no mandatory wizard, and direct access to documents. They see the exact organization and whose giving is affected. A clear save result survives refresh; a timeout does not masquerade as failure or success. Required exceptions are explained when relevant, without a wall of warnings.

### Does this follow modern best practices?

The channel-versus-record distinction has strong donor and subscription-product precedents. Stable switch semantics, accessible status feedback and current source state are durable patterns. Vendor behavior is not an IRS ruling, and documentation does not prove this exact donor journey is usable or implemented.

### Does this fit Asym’s existing repo and product direction?

Yes, through an explicit narrow source-policy amendment. It fits ADR-0001, the legal-donor/document boundaries and Q07/Q08/Q11. The current screen and legacy frequency field do not supply the proposed behavior. A new portal writer that bypasses the owner would conflict with the repo's architecture.

### Should we adjust the recommendation?

Keep A with A1–A4 and J01–J12/C01–C22 below. The strongest alternative for scope is a separate preference per recurring arrangement: it permits selective emails but adds repeated controls and inheritance rules. The recommended single disclosed issuer/donor scope better serves the requested quiet, low-maintenance experience. Do not infer that a ministry filter or a shared email establishes that scope.

## IRS findings: cover the actual requirements

**Verified legal facts:** electronic acknowledgments are permitted, and a consolidated acknowledgment can cover multiple gifts. **Inference:** an expressly selected, authenticated portal with qualifying downloadable documents is a reasonable electronic-delivery design. The sources do not expressly certify Asym's portal or deem an unvisited file legally received. No reviewed rule requires open pixels or a mandatory read/download checkbox. [IRS Publication1771, page4](https://www.irs.gov/pub/irs-pdf/p1771.pdf).

<!-- prettier-ignore -->
| Rule | Practical consequence |
|---|---|
| Monetary contributions need suitable donor records; $250 or more also requires a contemporaneous written acknowledgment. | Preserve acknowledgment content, including organization, amount and applicable goods/services facts. A card receipt or history total is not automatically sufficient. [IRS acknowledgment guidance](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments), [Treasury monetary-record rule](https://www.irs.gov/irb/2018-33_IRB). |
| The $250 threshold concerns actual separate contributions, not an annual sum or UI allocation rows. | Twelve separate $100 gifts do not become one $1,200 contribution for this test. A single $300 gift split between ministries is not split into smaller contributions by the display. [IRS Publication526](https://www.irs.gov/publications/p526). |
| The donor must obtain the acknowledgment by the earlier of filing or the return due date, including extensions. January31 is typical practice, not a universal statutory mailing deadline. | Make already-issued individual documents available promptly; do not force early filers to wait for an annual run. Never promise a universal January31 statement. [IRS Publication526](https://www.irs.gov/publications/p526). |
| A quid-pro-quo payment over $75 can impose a separate charity disclosure duty. | Quieting cannot cancel an outstanding disclosure. Source-proved disclosure furnished with the particular solicitation can avoid needless repetition. The test uses total payment, not merely the deductible portion. [IRS quid-pro-quo guidance](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-quid-pro-quo-contributions). |

Do not impose an “under $250 only” opt-out limit: that threshold does not prohibit electronic documents. Do not assume a ministry's tangible benefits are intangible religious benefits. Noncash/special tax forms, DAF-advisor acknowledgments and Canadian issuance plans remain their owners' distinct classes. First-installment/one-time email exclusions are Asym's selected scope and provider-policy boundaries, not an IRS first-versus-later rule.

For donors, a short document-help sentence is sufficient: **“Download and keep the acknowledgments you need before filing your tax return.”** Keep this near document help, not as a threatening modal or legal waiver before switching emails off. A donor need not provide a filing date or prove they have read every document.

Phase7 already requires a dated production review by qualified finance/tax counsel, covering jurisdiction, document content, disclosure and timing. Include the amended U.S. electronic-delivery policy in that existing review. This is one existing release qualification, not per-donor approval or an invitation to build another compliance engine. [Phase7, line396](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-07-receipt-statement-compliance-and-donor-credit.md#L396).

## Patterns and current evidence

<!-- prettier-ignore -->
| Pattern | Classification | What to keep or reject |
|---|---|---|
| Distinct receipt facts, document access, delivery choice and execution evidence | **Durable pattern** | One owner per fact; no preference may alter money, legal donor or historical documents. |
| Existing exact Maia/Base UI and semantic tokens | **Durable pattern** | Compose shared components and test their actual semantics; do not fork the design system. |
| Fundraise Up later-installment opt-out with continuing portal receipts | **Useful precedent** | Borrow email/document separation; its per-plan scope, annual summaries and upsells are not adopted. |
| Church Center Giving receipt preferences and Apple renewal-receipt setting | **Useful precedent** | Channel controls can coexist with enduring records. Neither supplies Asym's tax policy or authority. |
| Current persisted legacy receipt frequency | **Temporary bridge** | Existing data may remain readable during migration, but it cannot express the new typed issuer/Party/purpose semantics. |
| Local receipt/monthly-statement toggles and simulated save | **Implementation accident** | They establish neither donor intent nor actual delivery behavior. |
| Marketing opt-out used as a universal financial-email prohibition | **Conflict with first principles** | It conflates different purposes and conflicts with the normal sender's current gate. |

Current official precedents: [Fundraise Up](https://fundraiseup.com/docs/emails-settings/), [Church Center](https://help.planningcenter.com/en/141287-view-notifications-and-update-preferences.html), [Apple subscriptions/purchase history](https://support.apple.com/guide/iphone/see-your-purchases-and-subscriptions-iph4e3e7324f/ios). Givebutter separately documents that marketing unsubscribe does not stop transactional receipts; that distinction is useful, not proof every service email is legally mandatory. [Givebutter](https://help.givebutter.com/en/articles/5497894-how-unsubscribed-contacts-are-handled).

## Mapped donor journey — J01–J12

<!-- prettier-ignore -->
| ID | Donor situation | Corrected execution |
|---|---|---|
| **J01** | Find the setting | A quiet link from Receipts & statements or recurring-gift detail opens the same preference destination. Routine email footer: **Manage recurring receipt emails**. Normal GET never changes anything; preserve the safe destination through sign-in. |
| **J02** | Know whose receipts | Resolve the verified Tenant/issuer and receipt-owning legal donor. Personal giving opens directly. In a separately authorized represented context, clearly name that context; a shared mailbox, giving authority or document-read grant alone is insufficient to edit this preference. |
| **J03** | See the current choice | Read the authoritative value and current eligibility. Use a small loading state. Distinguish no prior instruction from a failed read, blocked policy and saved Off. Do not flash a guessed switch value. |
| **J04** | Understand the effect | Explain current and future recurring gifts to this issuer, continuing documents and giving, and separately governed first/required notices. Show only material applicable exceptions. No compulsory tax questionnaire. |
| **J05** | Turn routine emails off | One stable labeled switch sends an explicit desired value through the owner with the observed revision and operation identity. Show Saving, keep the page usable, and prevent conflicting same-control submissions until reconciled. No modal for an ordinary reversible choice. |
| **J06** | Receive a reliable result | After commit, show **Saved. Routine recurring receipt emails are off.** Add **Emails already queued may still arrive** where relevant. Preserve focus; persist feedback rather than relying on a fleeting toast. |
| **J07** | Network drops or another device changes it | A definite rejection retains the saved value and explains recovery. Unknown outcome shows **We couldn't confirm the change** and reconciles the same operation. A stale revision refreshes the current choice instead of silently overwriting it. The owner must reconcile or fence unresolved prior work and restore a current-revision edit when reachable; an unknown prior On cannot indefinitely block a fresh authorized Off. No blind new command or hidden offline queue. |
| **J08** | Next installment succeeds | P7 evaluates the exact occurrence and preference. A qualifying routine email is not admitted; acknowledgment facts/artifacts continue under their own rules. Required notices retain their source lifecycle. Saving never charges, retries, changes authorization or cancels giving. |
| **J09** | Edit, pause, resume or add recurring giving | Preserve Off in the same issuer/donor scope. New/restarted giving's initial confirmations remain separate. Re-evaluate resulting source facts and required notices; increasing an amount or changing a rail never weakens content or disclosure rules. |
| **J10** | Need proof before an annual statement is ready | Open/download/print the available current acknowledgment through Q08. Show truthful annual readiness. No requirement to turn emails on, regenerate history or wait for a future annual run. Existing account/document help handles access failures. |
| **J11** | Turn emails on or change an address | On affects future source decisions only; no backlog, test receipt or payment retry. Higher contact/suppression restrictions may still block sending and have separate actionable explanations. Q11 governs verified contact changes; the preference does not silently reset or readdress prepared mail. |
| **J12** | Return later, switch contexts or lose access | Reload the exact current scope across devices. Fence stale cache/response data on Tenant/issuer/Party/session changes. Preserve truthful preference evidence on access loss; use existing safe recovery/source repair, not forced email to an unverified address. |

### Reviewed presentation defaults

One neutral shared Maia Card with a real heading and a stable-label Switch is sufficient. Use the existing Field/description/status primitives. Example for a qualified personal context:

> **Receipt emails**
>
> **Email routine recurring receipts** — On / Off
>
> For your current and future recurring gifts to Global.
>
> Your giving continues as scheduled. Issued receipts remain in **Receipts & statements**. First-gift confirmations and required notices are separate.
>
> **View receipts & statements**

The actual organization and context come from authorized projections. Do not expose internal issuer IDs, Party terminology, purpose registries, tax rules or provider configuration. Do not claim all optional or required emails always arrive. If only some methods/notices can be quieted, explain the meaningful exception before the change; when none qualify, explain why without a decorative dead switch.

The checked-in system is exact `base-maia` with Base UI and Zinc-oriented semantic CSS variables. Fresh read-only shadcn info/docs found the existing Card, Field, Switch, Spinner and feedback components. Use their supported installed APIs. A stable label and checked state must be exposed to assistive technology; Space toggles the control, and Saving/Saved/error feedback is announced without focus theft. Essential text wraps on mobile, preserves Core's44px targets and works at320 CSS pixels,200% text and400% zoom; supported RTL/mixed-direction content and reduced motion require actual proof. No new palette, app-local fork, table, nested scrolling or animated celebration is needed. [Switch semantics](https://www.w3.org/WAI/ARIA/apg/patterns/switch/), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [shadcn Base Switch](https://ui.shadcn.com/docs/components/base/switch).

An ordinary preference edit creates no new donor email, staff alert, missionary notification or Home task. Its inline outcome and authorized durable change history are sufficient. Genuine security or document-repair needs remain separately source-owned.

## Source, database and concurrency design requirements

This is a reviewed boundary proposal, not invented DDL or a second CRM. The implementation must reuse the existing preference/consent owner's mutation and history conventions, with a narrow typed extension where needed. Phase7 owns the receipt purpose, per-occurrence applicability and pre-admission result. Phase6 records actual send-time consent and execution evidence. Phase17 owns its admitted message lifecycle. There is **one logical preference**, not synchronized P7/P6/browser copies.

### Minimal state and structural protection

- Exactly one current logical value per **Tenant × legal issuer × receipt-owning legal-donor Party × routine receipt-email purpose**. Bind these existing source identities, not an email, login, Stripe Customer, payment authorizer, plan label or ministry. The issuer dimension prevents accidental inheritance after a genuinely different legal issuer takes over; it introduces no new issuer picker or multi-issuer product.
- Use closed values for ordinary email delivery preference versus quiet routine email, an increasing revision, trusted effective/recorded timestamps, authenticated actor attribution and existing provenance. Absence means no proven quiet instruction; a read error never means absence. A saved choice is separate from current policy eligibility and actual delivery.
- Required subject/issuer/purpose/revision fields are non-null; defaults do not manufacture quieting, actors or authorization. Unique scope keys and same-Tenant composite foreign keys prevent duplicates and cross-Tenant links. Bind the issuer to its owning Tenant. Freeze scope fields; an allowed value update cannot move the row into another Party, issuer or purpose. Use restrictive deletion for historical references and the existing identity/retention lifecycle, not cascades that erase intent or receipt history.
- The preference contains no amount, currency total, receipt snapshot or provider credential. Existing source integer minor units and currency rules remain untouched. No nullable wildcard recipient/issuer or caller-chosen message classification is permitted.
- Derive actor and Tenant from authenticated server context; resolve requested subject/issuer against exact receipt-preference authority. Document reading, household membership and financial authorization are not automatic write grants. For service-role operations, check this same boundary explicitly; service role is an execution credential, not user permission.
- Direct browser writes must not bypass the owner. Use explicit least-privilege grants; if a role can mutate through PostgreSQL policies, both `USING` and `WITH CHECK` must preserve scope/permission, with scope immutability checked independently. Force RLS where required by Core. Harden any security-definer function with a fixed safe search path, narrowly granted execution and trusted attribution. Views, RPCs and storage routes cannot widen the same rights.
- Index the unique scope lookup and exact occurrence/admission lookup. Use bounded authorized lists and per-scope locking/order, not global locks or a scan through every plan/document whenever a toggle changes. Actual PostgreSQL plans and production-shaped cardinalities must be measured; no invented scale limit is asserted here.

### Atomic choice and email admission

The preference command writes its desired value, revision, durable command result and required change audit atomically. Reusing the same operation identity returns the same result; a different desired value with that identity is rejected. A second tab using an old revision cannot silently overwrite a newer decision. A same-value deliberate request may return the unchanged current value without a duplicate business transition.

Pending feedback must not become a permanently disabled control after a lost response. The existing owner reconciles or fences prior work, then exposes a current-revision edit. A late result cannot overwrite the newer accepted value. During a genuine connection outage, report the inability to confirm/save honestly rather than pretending a local Off has been accepted.

Preference writes and P7's routine-email admission decision must have a single durable ordering for the exact scope, including the initially absent-row case. The implementation can use the established PostgreSQL aggregate/locking conventions; it must prove the result rather than rely on the UI or an eventually consistent cache.

<!-- prettier-ignore -->
| Ordered outcome | Meaning |
|---|---|
| Off commits before the source decision, and the exact occurrence qualifies | Record that the routine email was not requested. Preserve the receipt/document effect. Do not emit a required email occurrence or fake a Phase6 provider suppression. |
| Required email admission commits before Off | Preserve the admitted message and its normal current safety/dispatch rules. The later switch does not recall or rewrite it. Donor copy permits already-queued emails to arrive. |
| On follows a completed quiet decision | Do not replay that old source effect. New eligible occurrences use the new preference. |
| Policy/contact/provider readiness is unknown | Do not interpret uncertainty as either donor consent or a completed delivery duty. Hold/repair through the existing owner with a truthful outcome; required document issuance is independently preserved. |

Bind the admission result to exact source occurrence/facts revision, receipt meaning, issuer, legal donor, purpose and applicable policy/preference revision. Do not deduplicate by one HTTP request alone or by visible gift amount/date. Corrections are new source-owned meanings with separate rules, never a replay of the routine quieting decision.

Persist no separate shadow send queue or legal-read ledger. If a required secondary event is needed, use Core's established durable dispatch/outbox seam; a lost cache-invalidation event must not undo the accepted preference or change source admission. One immutable audit records who changed the preference; actual access/send/provider facts retain their own histories.

### Whole-gift and required-message boundaries

A source-owned receipt remains whole. A single artifact that includes a protected first/required meaning cannot be partially suppressed by line or rebuilt to fit the switch. The owning delivery policy decides whether that whole notice must remain. Fund allocations and sibling gifts are not new receipt boundaries.

Preserve source-required financial/authorization/network notices, including exact applicable recurring-rail rules. Successful ACH initiation is not final received money; no receipt is fabricated for pending, failed, returned or imported/nonreceiptable history. New/restarted confirmations and source-owned correction/refund/reversal messages are evaluated independently. Do not infer their requiredness from raw Stripe status.

Stripe is an execution dependency, not the official donor-record owner. Latest docs were consulted through the Stripe CLI; current Core pins remain Stripe22.2.0 and API2026-05-27.dahlia. The API's `receipt_email` can trigger live receipt email regardless of Dashboard settings, and Connect charge patterns affect which account's automatic-email settings apply. A complete repository TS/TSX search found no active `receipt_email` usage, so this is a qualification hazard rather than a located active bug. Prove the exact integration/account/mode and automatic-email behavior before promising that the selected routine copies stop. Do not change a Tenant-wide provider setting casually to implement one donor's choice. [Stripe PaymentIntent receipt-email parameter](https://docs.stripe.com/api/payment_intents/create#create_payment_intent-receipt_email), [Stripe receipts](https://docs.stripe.com/receipts).

The ordinary receipt-footer management link is authenticated portal navigation, not a new anonymous unsubscribe service. GET is read-only and contains no sensitive recipient/receipt facts. Q07's actual marketing/topic RFC8058 token-authenticated POST remains unchanged and must not be replaced with a login page. Required transactional messages must not acquire fundraising content to blur this classification. [RFC8058](https://www.rfc-editor.org/rfc/rfc8058.html), [Gmail sender guidelines](https://support.google.com/a/answer/81126?hl=en).

## Category-by-category review — C01–C22

Every category below has an explicit material-concern verdict. Severity is potential impact; likelihood is a qualitative judgment under an inadequately guarded implementation, not a measured incident rate. The corrected requirements are normative proposed execution language, awaiting ratification. Evidence references resolve to the legal, source and test sections of this review.

### C01 — Problem validity, necessity and alternatives

**Material concern: No invalidation of the problem was found.** Donors reasonably may want fewer repeated emails while keeping records; the founder selected that outcome and official products provide comparable controls. Actual frequency of this need remains unmeasured. Per-plan control offers selectivity, while no new control preserves routine emailed confirmations with less implementation work. Neither justifies silently replacing the selected direction. **Severity/likelihood: not applicable to a rejected premise.**

**Exact requirement:** “Provide the narrow receipt-email choice as an optional self-service capability, with one disclosed issuer/legal-donor scope. Validate donor comprehension of its effect; make no retention or tax-outcome guarantee.” This preserves A and makes its scope testable. No new capability is necessary merely to imitate a provider.

### C02 — Brittleness

**Material concern: Yes.** An `is_recurring` flag, assumed first-versus-later ordering or cached method type can misclassify imported, restarted, amended or multi-line giving. The wrong notice may disappear. **Severity: High. Likelihood: plausible**, because the current portal model is not a complete P16/P7 source projection. **Evidence:** P16 distinguishes commitment/occurrence/authorization meaning; P7 owns receipt facts and the manifest admits only source-qualified messages. This **narrows eligibility**, not the selected user need.

**Prevention/exact requirement:** “Evaluate each routine-email decision using the exact current source occurrence, issuer policy, receipt-owning subject and applicable rail/notice rules. Unknown lineage or policy is not ordinary eligibility. Use existing owner repair, preserve documents and never infer requiredness from a browser flag.” Test restarted and delayed events with the same visible gift label.

### C03 — Technical debt

**Material concern: Yes.** Keeping the old timer-driven switch, free-text frequency field and a new real command creates contradictory save behavior and future dual ownership. **Severity: Moderate. Likelihood: high if legacy paths survive**, because those paths are present today. **Evidence:** donor settings local state, arbitrary `receiptEmailFrequency` PATCH and mismatched receipt sender/correction policy; see current-code evidence below. This **changes adoption requirements**.

**Prevention/exact requirement:** “Cut the receipt preference over to one typed owner read/write path. Retire or explicitly adapt obsolete controls and writer semantics at the same activation boundary. Preserve necessary legacy evidence, but no legacy field, local boolean or route-level send fallback may override the accepted choice.” A broad refactor of unrelated profile settings is unnecessary.

### C04 — Edge cases

**Material concern: Yes.** Early filing, annual documents not ready, a larger next gift, changed issuer, split funds, joint/represented giving or an inaccessible account can defeat the donor's expectations. **Severity: High for document access or wrong scope; otherwise Moderate. Likelihood: plausible**, with split/multi-site/represented cases explicitly supported by Core. **Evidence:** IRS timing/actual-contribution rules and P7/P18/P19/Q04/Q05/Q08/Q11. This **narrows execution and adds recovery requirements**.

**Prevention/exact requirement:** “Keep valid issued acknowledgments retrievable before annual release; preserve exact source contribution and legal-donor boundaries. Same-scope ordinary changes retain the preference; different issuer/legal donor does not inherit it. Annual/source/import exceptions remain truthful and use existing document/access help.” Prove the scenarios in J09–J12 without manufacturing receipt versions.

### C05 — Footguns

**Material concern: Yes.** A control labeled “Receipts,” an inverted toggle, a GET unsubscribe or deleting a preference row can accidentally stop documents, change the wrong state or restore email by default. **Severity: Moderate to High. Likelihood: plausible**, given the existing mock names and generic PATCH model. This **changes labels and mutation constraints**.

**Prevention/exact requirement:** “Use a stable label explicitly about routine receipt emails; submit the desired value. Reading and GET navigation never mutate. Do not expose delete-to-default or reset-all as a shortcut. Preference edits cannot issue, resend, refund, retry, cancel, subscribe to marketing or alter another purpose.” Document and giving links retain ordinary independent behavior.

### C06 — Tenant safety

**Material concern: Yes.** An email/profile-keyed choice or cache can affect another Tenant, issuer or legal donor using the same human contact. **Severity: High. Likelihood: plausible** in multi-role/representative sessions. **Evidence:** ADR-0001, P7 legal-donor identity, P16:750 and P24's unified host do not collapse legal scopes. This **requires A2's exact identity boundary**.

**Prevention/exact requirement:** “Persist, authorize, cache and audit by the exact Tenant/issuer/receipt-owning-Party/purpose scope; derive it from trusted context. Fence in-flight responses and private caches on context/session changes. Same-Tenant composite references and negative cross-Tenant/issuer/Party tests are mandatory.” Shared deployment, Site, login or payment method is not a grant.

### C07 — Database, RLS and authorization safety

**Material concern: Yes.** Service-role writes, permissive grants or a mutable scope field can bypass correct-looking client checks. A valid update could transform an allowed row into another donor's preference. **Severity: High. Likelihood: plausible**; current portal writes already use privileged persistence, and target authority is not implemented. **Evidence:** Core API/database boundaries and [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html). This **requires the structural protections above**.

**Prevention/exact requirement:** “Prove non-null immutable scope, unique current value, closed values, composite relationships, restrictive history deletion, exact grants, current authority and trusted actor attribution through the actual PostgreSQL owner command. Test both existing-row access and resulting-row checks, security-definer/service-role paths, revoked access, views/RPCs and direct DML.” A missing explicit `WITH CHECK` may inherit `USING`; inspect effective policies rather than assuming omission always removes protection. Tests must demonstrate the authorized action cannot move its scope.

### C08 — Overengineering

**Material concern: No remaining material concern in the bounded recommendation.** A per-plan override hierarchy, filing-date collector, legal-read ledger, monthly digest or new notification framework would add complexity without being necessary to the chosen need. These alternatives were checked and excluded. **Severity/likelihood: not applicable once excluded.** This **preserves A while constraining scope**.

**Exact requirement:** “Use one narrowly scoped logical preference and the existing command/audit, source-admission, document and messaging boundaries. No per-ministry overrides, new annual delivery product, custom tax engine, read surveillance or provider-wide donor toggle is included.” Extra physical tables must be justified by the actual owner schema, not by speculative reuse.

### C09 — UX/UI and user friction

**Material concern: Yes.** Vague scope, a guessed switch, buried receipts or saved-looking network failure undermines trust. Long legal warnings would make a low-risk preference feel dangerous. **Severity: Moderate; High if records become inaccessible. Likelihood: common without careful states.** **Evidence:** current simulated save and official switch/status guidance. This **changes the mapped journey and presentation defaults**.

**Prevention/exact requirement:** “Use the reviewed Maia composition and J01–J12: visible current/future scope, one ordinary switch, authoritative inline result, stable focus and direct document access. Loading, definite failure, stale revision and unknown commit have distinct honest recovery. Preserve mobile wrapping, target size, localization and assistive-technology semantics.” Usability proof must test what donors think changed, not merely whether the switch animates.

### C10 — Source of truth, ownership and domain invariants

**Material concern: Yes.** A duplicate preference store or a portal-written receipt status makes read models into authority and misrepresents tax/delivery facts. **Severity: High. Likelihood: plausible** if the screen is wired directly to legacy donor fields. **Evidence:** ADR-0001/P7/P18/P19, the P17 manifest and accepted Q07. This **requires A1/A4 and a single owner**.

**Prevention/exact requirement:** “Keep one source-owned preference; P7 evaluates applicability and records no-request evidence, P18 supplies exact artifacts, P19 owns annual operations, and P6/P17 retain actual messaging evidence. Quieting never changes money, hard/soft credit, tax date, legal donor, receipt contents or current document lineage.” A projection may display these facts but cannot author them.

### C11 — Hidden coupling

**Material concern: Yes.** Coupling the setting to marketing consent, login email, a Site or recurring-plan ID can reset it or suppress unrelated messages during ordinary changes. **Severity: Moderate to High. Likelihood: plausible**, given Q11 shared-identity/contact distinctions and current broad fields. This **requires explicit continuity rules**.

**Prevention/exact requirement:** “The preference follows its stable legal-donor/issuer/purpose scope through permitted contact, host and ordinary giving changes. It neither changes marketing/Ministry Update choices nor adopts a new issuer/Party by email matching. Initial/new-commitment and mandatory change notices are independently evaluated.” A canonical identity merge must preserve evidence and resolve conflicting choices through the existing identity/preference boundary before that scope resumes routine admission; no last-timestamp or shared-email guess.

### C12 — Failure modes

**Material concern: Yes.** A commit can succeed before the response is lost; an audit write or secondary invalidation can fail after the value changes; a provider may accept a send without returning success. **Severity: Moderate to High. Likelihood: plausible**, as ordinary distributed-system failures. **Evidence:** existing owner command/dispatch boundaries, not a newly observed production incident. This **changes durable results and recovery**.

**Prevention/exact requirement:** “Commit the preference and its required change evidence atomically, return a durable result, and reconcile an unknown outcome using the same immutable operation. Do not blindly retry under a new identity, restore an old value after an ambiguous timeout, or infer delivery from HTTP success. Reconcile or fence unresolved prior work and restore a current-revision edit; an unknown On must not indefinitely block a fresh authorized Off. Provider ambiguity remains with the existing admitted message.” Cache refresh failure cannot reverse the business result.

### C13 — Lifecycle, temporal correctness, concurrency and idempotency

**Material concern: Yes.** Concurrent Off/admission, opposite tab saves, an absent-row race or repeated artifact-ready events can send an unwanted receipt or replay old quiet decisions when On returns. **Severity: Moderate to High. Likelihood: ordinary concurrency/retry exposure.** **Evidence:** the protected P17 admission boundary and PostgreSQL row-lock behavior. This **requires A4's ordering and terminal source result**.

**Prevention/exact requirement:** “Serialize the source decision with preference and authority revisions, including missing current rows, using one fixed owner lock order or equivalent proven transaction mechanism. Retain the exact source result across retries. Off-before-decision quiets eligible routine mail; admission-before-Off preserves admitted work; later On never reopens a terminal quieted occurrence.” Browser timestamps and transport-only deduplication do not prove these outcomes.

### C14 — Data integrity risks

**Material concern: Yes.** Broad legacy values, merge conflicts, partial adoption or permissive deletion can manufacture a preference or erase why it changed. **Severity: Moderate to High. Likelihood: plausible during cutover**, supported by the arbitrary legacy field and new scope mismatch. This **changes data adoption and integrity rules**.

**Prevention/exact requirement:** “Migrate only proven semantically equivalent instructions with exact subject/issuer/purpose and provenance. Preserve unknown legacy evidence without treating it as a new decision. Prevent duplicate current scope, immutable-field transformation and deletion that resurrects mail. A certified identity merge must preserve both inputs; unresolved conflicting routine choices hold that scope's routine admission for owner reconciliation rather than silently choosing On.” Required notices/documents remain independently governed during that hold.

### C15 — Security and privacy risks

**Material concern: Yes.** Forwarded links, cached represented data, logs or receipt titles can expose donor finances or restricted workers. Provider links or tokens can leak through analytics. **Severity: High. Likelihood: plausible** for real shared devices and email forwarding. **Evidence:** P3/P10/P12 protected projections and P18 artifact access. This **narrows presentation and diagnostics**.

**Prevention/exact requirement:** “Use safe branded navigation and current access reproof; no GET mutation, private data in URLs, raw tokens, session replay of financial screens, email-open tracking or shared public cache. Return only authorized issuer/subject descriptions. Minimize audit/log payloads and apply existing retention/access policies. Preference authority neither grants document access nor exposes its history to missionaries.” Test direct links and storage access after revocation.

### C16 — Scalability and performance risks

**Material concern: Yes, as a design hazard; no measured current regression found.** Per-plan fan-out on every save or external provider reads for every receipt could make one small preference expensive. **Severity: Moderate. Likelihood: low with the indexed single-scope design, plausible with fan-out.** **Evidence:** proposed data access and existing source-boundary rules. This **constrains implementation, not product scope**.

**Prevention/exact requirement:** “Use an indexed local scope lookup and bounded owner reads; evaluate each receipt at its normal admission point. Saving does not scan/rewrite all gifts or receipts. Prove query plans, lock duration and retained client data against declared production-shaped fixtures, including a donor with many plans.” Set release SLOs from the actual owner baseline; no unsupported 'unlimited' or numerical latency claim is made here.

### C17 — Operational burden

**Material concern: Yes.** Unsupported donor controls or unknown delivery choices can turn into manual database repairs and repeated staff inquiries. Conversely, alerting staff for every Off change creates avoidable work. **Severity: Moderate. Likelihood: plausible** if source evidence/help is omitted. This **requires bounded operational integration**.

**Prevention/exact requirement:** “Authorized staff can inspect the exact preference and source delivery reason through existing receipt/communication operations. Use existing document/access repair and escalation paths for actual failures. Routine save/quiet results create no staff task, email or missionary notification. Correction must use the owner command, never direct database repair.” No new Phase26 support product is built to support this choice.

### C18 — Observability and auditability gaps

**Material concern: Yes.** A missing email could be a chosen quiet result, failed source, policy block or provider problem; generic suppressed/sent flags hide the difference. **Severity: Moderate to High. Likelihood: high if histories are conflated.** **Evidence:** #555's send-seam scope versus pre-admission P7 and current distinct logs. This **requires A4 and truthful diagnosis**.

**Prevention/exact requirement:** “Record who changed the scoped preference and its resulting revision; record the exact receipt admission policy/preference decision separately from actual dispatch/provider outcomes. Correlate using safe owner IDs and policy versions. Do not create a Phase6 suppression event where no email was requested, or label document availability/download as legal receipt or reading.” Monitoring signals below use these facts rather than inbox guesses.

### C19 — Dependency and integration risks

**Material concern: Yes.** Stripe automatic receipts, API `receipt_email`, subscription notices or another active sender could continue routine copies after Asym claims Off; disabling account-wide mail could affect other donors. **Severity: Moderate to High. Likelihood: unknown for actual Tenants; documented configuration risk.** **Evidence:** fresh Stripe CLI docs, pinned22.2.0/API2026-05-27, no active `receipt_email` assignment found. This **requires exact provider qualification before activation**.

**Prevention/exact requirement:** “Census all routine receipt-producing adapters/settings for the exact account/charge/mode/rail path and prove the stated donor effect. Preserve independently mandatory notices and current safety. No donor mutation alters global provider configuration. Do not upgrade Stripe, introduce Billing/Tax, or adopt a hosted portal merely to implement this preference.” An unverified lane must not promise effective quieting.

### C20 — Migration, rollout and upgrade risks

**Material concern: Yes.** Mixed versions may retain the old sender or overwrite new values; rolling back to the mock/legacy field can resend receipts after an accepted Off. **Severity: High for trust and unauthorized exposure. Likelihood: plausible** during rollout. **Evidence:** legacy surface/API and source policy change. This **requires an explicit activation boundary**.

**Prevention/exact requirement:** “Ship compatible typed storage/readers and owner evidence before exposing the setting; make every routine producer honor the source decision before activation. Test N/N−1 behavior and reject incompatible writers. A kill switch stops new preference edits or contains the faulty routine admission lane while retaining accepted choices, required notices and documents. Roll forward with preserved evidence; never roll back to a legacy sending bypass or replay old receipts.”

### C21 — Testability, traceability and proof

**Material concern: Yes.** A passing switch test or current mocked sender tests could be mistaken for tax, authorization, database or real provider correctness. **Severity: High if used as a release claim. Likelihood: plausible**, given existing prototype completeness. **Evidence:**33 passing existing tests use mocked persistence/provider boundaries; no Q13 target exists yet. This **requires explicit target proof and terminology**.

**Prevention/exact requirement:** “Trace A1–A4/J01–J12/C01–C22 into the later authorized owner amendments, glossary, OpenSpec, nonduplicate tickets and release evidence. Require actual PostgreSQL grant/authorization/concurrency proof, provider contract/configuration proof and accessible donor end-to-end document journeys. Report each proof layer separately; no mock or source assertion certifies the absent target.” Proposed table/API names must not masquerade as installed contracts.

### C22 — Other development hazards

**Material concern: Yes.** Quieting could become an annual-only document workaround, an 'IRS compliant' marketing promise, hidden financial side effect or a copied dated network-limit claim. **Severity: High for misleading compliance/financial behavior; otherwise Moderate. Likelihood: avoidable but plausible** from the roadmap shorthand and generic integrations. This **constrains scope and release claims**.

**Prevention/exact requirement:** “Preserve current source-owned giving/documents, contemporaneous access and qualified disclosures. Do not claim IRS approval, guaranteed deduction, universal January31 delivery, a tax-free ministry exception or provider behavior not verified. No charge/retry/cancellation, annual regeneration, newsletter enrollment or financial tax collection follows a preference change.” Qualify only the real supported lane and communicate its limits plainly.

## Actual source findings and verification performed

Current local and remote develop matched **7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd**. The active Phase24 branch remains `codex/phase-24-multi-site-management-spec` at `ab1a1703a725be454376990a7fe68aef2e048026`, PR1558 Open; it supplies intended context rather than deployed proof. Prior source checkpoints and Q01–Q12 ratifications remain in the grooming notebook.

<!-- prettier-ignore -->
| Evidence | What it establishes | Limit |
|---|---|---|
| `apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:448–518,618–623` | Receipt/monthly switches use local defaults and timer-based save feedback. | They are not working receipt-delivery policy. |
| `packages/database/hooks/donor-portal.ts:43–63,94–107,152–178`; `packages/api/src/donor-portal/settings-patch.ts:3–18,72–73` | A real portal settings API persists a free-text receipt frequency. | No located sender consumer in the inspected search; not the exact issuer/Party/purpose command. |
| `packages/api/src/giving/receipts.ts:329–355`; `packages/api/src/email/consent.ts:178–232` | Normal transactional receipt sending bypasses marketing-specific `do_not_email`, while do-not-contact/hard suppressions still apply. | Actual delivery/source-document qualification remains separate. |
| `packages/api/src/admin/contribution-operations/receipt-delivery.ts:89–117` | Correction email-option evaluation can block on `doNotEmail`. | A real discrepancy to reconcile with its owning correction policy, not proof universal financial opt-out is correct. |
| P17 executable manifest:383–405 | P7 first establishes eligible required email; P17 cannot disable the admitted required step. | Q13 needs explicit upstream refinement, not a UI exception. |
| P7:58–66,107–141,234–258,396; P16:329–375,746–750; P19:593–637 | Issuer/Party, cash/cumulative plan, required notice and statement boundaries. | Merged/ratified intent is not complete implementation or legal approval of this change. |
| **33 existing native Vitest tests passed,0 failed**, in three files | Real existing consent and correction-option helpers and receipt sender execute against test fixtures, preserving the observed distinction and current behaviors. | Database/provider boundaries are mocked. No new Q13 command, SQL concurrency, artifact journey, real email or live capability was tested. |
| Fresh read-only shadcn info/docs | Exact base-maia/Base UI and existing components are available. | No donor browser, visual usability study or accessibility conformance claim. |

Executed command: `bunx vitest run tests/unit/packages/api/email/consent.test.ts tests/unit/packages/api/admin/contribution-receipt-delivery.test.ts tests/unit/packages/api/giving-receipts-send.test.ts --maxWorkers=2 --reporter=json --outputFile=<local evidence file>`. Existing test environment clears the Supabase service-role secret and uses test boundaries; no provider send was performed. The structured report is preserved in the proof bundle.

Fresh issue-body inspection reconfirmed **#566, #555, #875 and #938 Open**. PR502 is merged; stale issue text saying otherwise must not be followed. #566's older statement-run/gapless-number/never-expiring-link language must be reconciled against later P18/P19 contracts. #938 already owns the everyday U.S. acknowledgment tracer, with predecessors #921/#923/#924/#937 plus P7#566/P13#690. Prior Q13 notes preserve #557/#680/#876/#887/#890 and P19#981–983/#1017/#1023/#1024 body/dependency evidence. No issue or GitHub relationship was changed.

## Target acceptance proof — required before release

These are falsifiable required outcomes, not tests claimed to have run here.

<!-- prettier-ignore -->
| ID | Required evidence |
|---|---|
| **T01** | A real ordinary qualified U.S. recurring case: accept Off, process the next source-confirmed eligible success, produce the correct P7/P18 record and accessible document, record no routine email request, and observe zero routine provider request for that exact source effect. |
| **T02** | One-time, first/new/restarted and independently required correction/authorization/network notices retain their source behavior. A source-proved fulfilled QPQ disclosure is distinguished from an outstanding one; no preference can erase the latter. |
| **T03** | Boundary fixtures cover separate $249.99/$250 monetary gifts, actual source splits, benefit-bearing payments around the applicable $75 test, changed amounts and early filing before annual readiness. Rules remain source-owned, original currencies preserved, no UI-derived tax determination. |
| **T04** | Actual PostgreSQL owner commands prove own scope, represented manage versus read-only, unauthenticated, other Tenant/issuer/Party, spoofed actor, stale authority, immutable scope, null/invalid values, duplicate keys and restrictive deletion. Include effective grants, views, RLS, privileged functions and storage reproof. |
| **T05** | Real concurrent transactions prove Off/admission order, two opposite saves, first absent-row creation, authority revocation, duplicate source-ready events, re-On versus old quiet retry and policy/issuer changes. One explainable committed result; no duplicate or rewritten effect. |
| **T06** | Lost save response, definite rejection, failed secondary invalidation and provider ambiguity recover the same operation. Reconciliation/fencing restores a current-revision edit; a late prior On cannot overwrite or indefinitely block a fresh authorized Off. On produces no backlog. Read-only GET, page load and retries cause no financial or document-creation side effect. |
| **T07** | Exact installed Stripe adapter/account/mode/rail contract and configuration evidence cover automatic receipts, API-triggered receipts, subscription/invoice mail and mandatory notices. Test-mode execution is labeled as such; it does not prove live-only automatic email was sent or disabled. |
| **T08** | Actual current acknowledgment download/print and safe account/document recovery work from Q08; annual-unavailable, corrected/superseded, imported/nonreceiptable and Canadian cumulative cases remain truthful. No silent reissue or manufactured record. |
| **T09** | Donor E2E follows J01–J12 on mobile and desktop with slow/offline/timeout/stale states, safe footer sign-in return, current/future scope, same/different issuer and represented context. Assert domain effects alongside visible UI. |
| **T10** | Keyboard/Space, screen-reader name/checked state and status announcements, focus preservation,44px Core targets,320px reflow,200% text/400% zoom, long/international names, supported locale/RTL and reduced motion pass in the actual composition. Axe alone is insufficient. |
| **T11** | Cross-device stale responses, private cache disposal, forwarded links and revoked artifact access cannot expose or alter another context. No sensitive IDs/tokens leak through URLs, logs, analytics or notification previews. |
| **T12** | Migration fixtures include absent/blank/monthly/unknown values, `do_not_email`, hard suppressions and only genuinely equivalent proven legacy preferences. N/N−1 deployment and containment preserve accepted choices/history without a second writer or backlog. |
| **T13** | A declared production-shaped workload verifies indexed scope reads, absence of plan/document fan-out, bounded memory, lock behavior and the owner's adopted latency/error budgets. Test results state cardinalities and environment; do not substitute 'fast' or 'scalable.' |
| **T14** | A small observed donor task study confirms participants understand giving continues, documents remain, current/future scope and required exceptions. Any critical misunderstanding about cancellation, record loss or whose giving changes blocks release until corrected/retested. Do not claim statistical superiority from that study. |

## Synthesis: what to do and in what order

**Before recording corrected execution as ratified:** present A1–A4 and the mapped journey to Conrad. Keep A selected and the revised requirements pending until accepted. The legal question is sufficiently researched to recommend the positive ordinary U.S. lane; no undisclosed legal waiver or blanket per-installment email mandate is needed.

**Capture in the later authorized source contracts/spec/design:** amend P7's prospective delivery eligibility and source evidence; add the exact preference scope to the existing owner; clarify the upstream condition in the P17 receipt profile without weakening its admitted required step; preserve P18/P19 document rules and P16 mandatory notice meaning. Reflect A2/A3 in identity/context presentation and migration contracts. Canonical ADR/glossary/OpenSpec changes occur only in the subsequently authorized stage; the current local glossary records proposed terms distinctly.

**Required implementation sequence:**

1. Establish the qualified source/document/provider positive lane and existing dated finance/tax review. Reconcile older ticket/runtime contradictions against that authority.
2. Add the smallest typed storage/command/evidence extension through the existing owner. Prove real authorization, scope, absent-row concurrency and admission ordering before exposing a donor control.
3. Complete all routine producers and provider configuration qualification. Preserve source-required messages, current artifacts, annual operations and recovery.
4. Replace the receipt UI's simulated path with the single qualified reader/writer and the reviewed Maia journey. Remove incompatible legacy writers/assumptions; do not broaden unrelated settings work.
5. Run T01–T14 and activate only the qualified lane. Containment preserves accepted preferences and documents; restore service through roll-forward correction rather than legacy resend behavior.

**Monitor only after required proof passes:** reuse existing diagnostics and repair ownership. These are proposed trigger definitions, not current production measurements or new observability products.

<!-- prettier-ignore -->
| Signal | Threshold | Owner | Response |
|---|---|---|---|
| Routine provider request matching a terminal source quiet decision | One confirmed occurrence, excluding separately admitted earlier messages | Receipt/communications engineering | Contain the affected routine admission path; reconcile exact source/provider evidence; preserve required notices and document access; correct and regression-test before reactivation. |
| Preference or document result crosses authorized Tenant/issuer/Party scope | One confirmed occurrence | Identity/security and receipt engineering | Contain affected reads/writes immediately through existing incident handling, revoke affected access/cache exposure where appropriate and repair with exact audit evidence. |
| Qualified current acknowledgment is unavailable through every supported donor retrieval path | One confirmed affected source artifact beyond its owner's promised availability state | Document operations/engineering | Open the existing source-document repair path, restore safe access or existing authorized copy fulfillment; do not recreate financial facts or send to unverified contacts. |
| UI reports Saved but authoritative scope/revision disagrees after reconciliation | One confirmed mismatch | Donor portal/preference owner | Contain the faulty mutation/presentation path, preserve durable results, repair idempotent status reconciliation and retest cross-device cases. |

Normal quiet choices, untracked reading, lack of email opens, temporary loading and expected already-admitted emails are not incidents. Performance budgets must be adopted from measured owner baselines before release; an undefined 'monitor performance' item is not a substitute for T13.

## Decision record and remaining proof boundary

**Selected:** A — allow donors to quiet eligible routine recurring receipt emails.

**Proposed corrected record:** “A donor with current exact receipt-delivery preference authority may choose one issuer/legal-donor-scoped routine recurring email preference for current and future eligible giving. P7 evaluates it before email admission; receipt facts, timely usable electronic documents and independently required notices remain intact. The source records no-request decisions durably, admitted messages retain their lifecycle, and turning email back on never replays old decisions. The interface uses the reviewed Maia journey and truthful save/recovery states. Adopt A1–A4, J01–J12 and C01–C22 with the stated source amendments, activation proof and reviewed presentation defaults.”

**Not yet ratified:** that corrected execution record. **Not claimed:** target PostgreSQL authorization/concurrency, actual provider configuration, live receipt delivery, accessible target E2E, qualified counsel review of the amended implementation or measured donor outcomes. These are precisely named implementation/release proofs, not unresolved product alternatives or permission to label the current prototype complete.

The full Phase25 grooming remains in progress. This review does not authorize a PRD, formal specification, issues, runtime code, environment changes, GitHub changes or live-provider actions. The historical Q10–Q12 proof bundles and the five pre-existing setup files are preserved.
