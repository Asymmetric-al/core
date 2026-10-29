# Phase 29 Q14 — thirty elapsed days from fresh issuance: adversarial review

**Disposition: Accept with required amendments.**

Conrad selected **A — Up to 30 elapsed days from fresh source issuance** and
ratified its full required amendment package on 2026-10-21 (Asia/Bangkok),
explicitly requiring excellent UX/UI without overengineering. Q01–Q14 are
ratified grooming intent. No runtime or formal specification publication follows.

The permanent design is small: the existing source action establishes one
fresh unfinished end, the existing request shows that end and the next action,
and Q13 continues to govern permission and completion. This review adds eight
focused clauses. It incorporates Q13's existing safeguards instead of creating
another authorization model, clock framework or set of duplicate requirements.

One explicit specialization is required: Q14 resolves Q13-C09's duration,
anchor, activation and unused-access reservation for this standard profile.
It specializes Q13-C19 so successful fresh source issuance resolves the end;
commit still does not prove current recipient usability, proof or delivery.
Q13-P13 does not require a first-entry activation substage, and Q13-P19's
early-completion-shortening case applies here only where actual narrower
completed restrictions produce that result. The dated Q13 record is preserved.
Its repetition/overlap reservation and the separate Q08 decisions stay open.

## Evidence and limits

Local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; live `develop`
was rechecked at `aec79916e4f8718941e1e1d6c1f4bc2bffe2361d`. The prior
three-commit/ten-file comparison and sole production-file patch concerned
document-cutover acceptance tests and a command injection/import guard seam,
not these timing or source-authority contracts. No new remote drift was found
at this check; no checkout pull was performed.

Evidence includes the current [Q14 question](phase29-q14-question.md), ratified
[Q13 review](phase29-q13-adversarial-review.md), current source and independent
[owner](phase29-q14-owner-adversarial.md),
[runtime](phase29-q14-runtime-adversarial.md) and
[UX](phase29-q14-ux-adversarial.md) passes.

| Evidence type              | What is established                                                                                                                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ratified repository intent | Q13 owns the narrow fresh capability, immutable source effect, exact issuer/recipient permission, separate write/read scopes, source completion and recovery. Q07's completed reading has its own fulfillment anchor. |
| Ratified Q14 intent        | One fixed thirty-elapsed-day unfinished profile at fresh source issuance, including unused access. The complete amendments were ratified on 2026-10-21.                                                               |
| Current code               | Adjacent auth, task, date-formatting, timestamp-validation, dispatch, cache and audit seams exist. No inspected native Q14 implementation or deployed grant qualification is established.                             |
| Verified external facts    | Fixed and first-opening access patterns both exist; elapsed-hour arithmetic differs from civil-day arithmetic; a thirty-day single Node timeout exceeds the installed runtime's maximum delay.                        |
| Product judgment           | Thirty days offers more opportunity than fourteen with one predictable end. It is not a proven ministry optimum or permission to repeat renewals.                                                                     |
| Unresolved evidence        | Actual native roles/SQL/races/provider serving and composed browser/AT/cohort usability remain required before activation. No user-study or production-demand measurements were gathered.                             |

Severity and likelihood below assess what could happen if a control is omitted.
They are qualitative engineering judgments, not observed incident rates.

### Repository reconciliation

Paths are relative to `/home/conrad/code/core`; local source lines describe the
named checkout rather than an assertion of deployment.

| Source                                                                                                                                   | Governing consequence                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`; `docs/ai/document-authority.md`; `openspec/project.md`; platform principles/boundaries specs                                | Current owner decisions govern; publication, implementation and activation remain distinct. Business logic stays in the owning shared source, UI in the established surfaces/design system.                                                               |
| Feature ADR-0013:19–83; Q13-C01–C24/P01–P32                                                                                              | Preserve source scope, exact permission, immutable effects, adverse history, old-operation separation, effective data/serving boundaries and prospective completion. Q14 resolves the previously reserved standard timing/activation/unused profile only. |
| Feature ADR-0011:19–64; ADR-0012:17–61                                                                                                   | Original issuance/result, scoped limits and elapsed-time rules are useful patterns; the original sixty-day profile is not a fresh default.                                                                                                                |
| Feature ADR-0007:22–47; ADR-0010:18–64                                                                                                   | Completed reading uses actual eligible fulfillment, exclusive boundaries, current permission and original-evidence recovery. Source completion may stand without recipient admission.                                                                     |
| `docs/prds/workflow-studio/01-product-and-experience.md:65–69`; `03-runtime-and-recovery.md:45–75`                                       | Suggested fourteen-day task credentials/expiry and source clocks require exact owner mapping. They do not authorize Q14 reset, pause, grace or a generic renewal policy.                                                                                  |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1542–1587,1643–1654,1670–1672`                              | Existing sole PDP, native context, coarse tenant RLS, current-use/audit budgets and grant administration/mutation fences still apply. A duration constant changes none of them.                                                                           |
| `packages/lib/hooks/use-locale-format.ts:20–40,80–120,137–174`; `packages/api/src/missionary-portal/task.ts:25–58`                       | Locale formatting and mutable task dates are display/task behavior, not authoritative source expiry. Date-only rendering must not replace an instant.                                                                                                     |
| `packages/api/src/generated-documents/renderer-qualification/charter.ts:240–322`                                                         | Adjacent validation preserves explicit time/precision semantics; it does not establish a native grant clock.                                                                                                                                              |
| `packages/auth/context.ts:240–338`; `packages/auth/permissions.ts:32–117`; `packages/api/src/projection/resolver.ts:7–46`                | User/caller context protections exist, but broad role compatibility and a pure projection function do not prove the full intended P12/native participant capability.                                                                                      |
| `packages/api/src/shared/cache-tags.ts:82–88`; `packages/lib/audit/logger.ts:73–84`; `packages/api/src/eve/retention/control.ts:125–152` | Previously verified best-effort cache/audit and ambiguous-cleanup reuse hazards remain covered by Q13. Do not copy them into authoritative expiry or claim new Q14 incidents.                                                                             |

### Current primary research

| Primary source                                                                                                                                                                                            | Useful lesson and explicit limit                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Digify expiry](https://help.digify.com/en/articles/749264-setting-files-to-expire)                                                                                                                       | Fixed-date and after-opening online viewing are real alternatives. Q14 chooses fixed source issuance; Digify's settings, file-view event and date editor are not imported.                                    |
| [Microsoft Entra lifecycle](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-lifecycle-policy)                                                                 | Finite assignment periods and preservation of existing approved terms are credible patterns. Approval/provisioning there is not Core's fresh source occurrence.                                               |
| [Goodstack application expiry](https://help.goodstack.org/will-my-application-expire)                                                                                                                     | Thirty days applies to specified incomplete nonprofit-verification steps. It does not prove a fresh document-access optimum or justify expiry-as-rejection.                                                   |
| [Foundant follow-up logic](https://support.foundant.com/hc/en-us/articles/4411213334935-Follow-Up-Submission-Logic)                                                                                       | Recipient submission and administrator completion differ. The chosen interval includes review time; staff work must not be mislabeled recipient lateness.                                                     |
| [GOV.UK confirmation](https://design-system.service.gov.uk/patterns/confirmation-pages/); [notification banners](https://design-system.service.gov.uk/components/notification-banner/)                    | Confirm the actual action and next step; information directly relevant to the task belongs in main content. Do not copy its UI library, sample emails/PDFs or add a confirmation page merely for this action. |
| [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html); [accessible authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html) | Meaningful state updates and accessible proof matter. No repeated countdown announcement or new account is needed; actual composed UI still needs testing.                                                    |
| [PostgreSQL 17 datetime](https://www.postgresql.org/docs/17/functions-datetime.html)                                                                                                                      | Calendar days/months differ from elapsed hours across transitions; transaction-start time is not a post-wait clock. The qualified source contract, not a convenient timestamp function, defines the effect.   |
| [Node 24.21.0 timers](https://nodejs.org/download/release/v24.21.0/docs/api/timers.html)                                                                                                                  | A delay above 2,147,483,647 milliseconds becomes 1 millisecond. Thirty days is 2,592,000,000 milliseconds; use source checks and existing durable scheduling rather than one resident timer.                  |

These are documented facts and bounded comparisons, not live competitor tests,
a market consensus or a representative ministry study. The installed skills
and prior owner reviews are reused; official technical semantics take precedence
over inaccurate shorthand. No external rule overrides Core's owner contracts.

## Adversarial check

### What could go wrong with this answer?

Thirty days could become a calendar month, start at email/first visit, restart
on retry, or be confused with completed access. The current UI could promise
thirty days remaining after late entry. Specify the one source end and show it.

### What hidden assumptions are we making?

That the fresh source admission is eligible, its occurrence/result is durable,
and the actual remaining time is useful for the supported cohort. Q13 defines
the authority prerequisites; the native implementation must still prove them.
Neither thirty nor any longer count proves usability.

### How does this affect the whole product?

It supplies a standard numeric policy to the existing fresh source command and
its request projections. It does not add a role, permission engine, new state
platform, clock service, file archive or tenant settings product.

### How does this affect the end-user experience?

Staff review once and issue; the recipient returns to the same request with
one real end and the next action. No first-entry timer, seven-day entry screen,
manual activation, extra enrollment or timer configuration is required.

### Does this follow modern best practices?

Yes as a simple, finite, source-owned rule with truthful recovery. Both clock
patterns exist externally. Fourteen days is a credible tighter alternative;
first-entry timing can preserve more working time but adds complexity and a
short unused-entry boundary. Neither proves thirty optimal.

### Does this fit Asym’s existing repo and product direction?

Yes when bound to Q13 and Core's existing shared source/Auth/P12/custody/UI
contracts. A mutable task deadline, client countdown or provider token is not
that integration. The native implementation remains to be qualified.

### Should we adjust the recommendation?

Keep A. Narrow its meaning and remove the unselected first-entry mechanics from
the prospective design. Reuse Q13 rather than restating its authorization model.

## Corrected decision to record

For each newly admitted standard Fresh Unfinished Request Access, establish
one fixed unfinished end at the qualified fresh source issuance occurrence
plus **720 elapsed hours**, preserving genuinely applicable earlier limits and
current restrictions. The source act must durably commit; a staff click,
preliminary approval, message, credential, first visit or later observation is
not a substitute. Successful issuance records the actual end and its policy/
limit provenance together. An unresolved issuance response needs reconciliation,
not a valid grant with an indefinitely pending business clock.

The same end bounds unused access. There is no enter-by substage, first-entry
working clock, pause, activity reset, resend extension or grace. Same-effect
retry recovers the original admitted result before any new calculation. The
original expired admission, receipt facts and Q13's scope/authority remain intact.

Keep unfinished access separate from Q13's completed reading: eligible normal
fulfillment during valid fresh authority stops writes and resolves only the
declared completed-read scope, at no later than fulfillment plus Q07's separate
720 elapsed hours under genuine caps. The old unfinished-only end does not cap
that view, nor is it a guaranteed minimum. Completion at/after actual unfinished
expiry cannot invent recipient eligibility; proved timely durable outcomes may
be recovered later using their original facts and current permission.

Use the existing request screen, one meaningful staff action, the actual
localized end and a clear next actor. Show prior receipts/current permitted
files without unnecessary reupload. Distinguish grant success, current proof/
usability, delivery, review and unknown outcomes. Preserve Q13 safeguards by
reference and existing Base UI/base-maia. Do not add date editors, duration
menus, first-entry activation, routine extra approvals, policy dashboards,
automatic reminders, a new timer platform or a general drive.

Adopt prospectively and qualify the actual source/data/serving and user journeys.
Repetition/overlap and Q08 fresh-read policy remain separate decisions; this
choice neither permits unlimited renewal nor selects a one-use lifetime rule.

## Minimal UX and journeys

The following are design requirements for the existing context, not a new
portal, settings screen or implementation claim. Example dates are hypothetical.

| Journey                                               | Clear behavior                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Staff reviews and grants                           | Show source-bound recipient/scope, “Up to 30 elapsed days from issuance,” and known earlier restrictions. One **Grant access to continue** action. No date picker, new scope editor or second routine confirmation. An estimate is labeled until the source records the result. |
| 2. Successful issuance                                | Persist and show the actual unfinished end. Do not show “waiting for first entry to start your period.” Delivery/proof may still be pending; do not claim a message was sent without evidence.                                                                                  |
| 3. Lost response or technical failure                 | Recover the same source act. Show **We couldn’t confirm whether access was granted** only when genuinely unknown, with the existing recovery route. Never invite a second grant as the retry mechanism.                                                                         |
| 4. Recipient enters promptly or late                  | After qualified entry, show **Access while this request is unfinished ends [date, time and zone]** in main content. A day-six arrival has at most twenty-four days remaining, not another thirty.                                                                               |
| 5. Recipient never enters, or proof fails             | The same source end continues. Repair proof/delivery under existing authority without resetting time. No separate business activation or unused-approval state is needed.                                                                                                       |
| 6. Submission/correction and staff review             | Keep Q03/Q13 exact pending actions and immutable receipt lineage. Show **Received — awaiting review** when that is true; do not blame the recipient for staff work or require already received usable material again.                                                           |
| 7. Source fulfills                                    | Apply Q13's qualified transition once, stop writes, show **Completed — read only** and the actual completed end. No extra click/download is needed to start that period; read scope does not widen.                                                                             |
| 8. Access ends, restrictions change or help is needed | End only the affected authority/actions; preserve independent source work and retention. Use the real source-owned help route and disclose only currently permitted facts. Expiry is not evidence rejection or file deletion.                                                   |

Before issuance, review may show a conditional estimate; ordinary time advancing
under unchanged approved terms does not require reconfirmation. After successful
issuance, a missing/unretrievable end is an error or observation uncertainty,
not a selected “activation pending” business state. Do not reveal sensitive
request existence merely to display a deadline on an unqualified link.

Keep Requested by separately labeled when present. Use ordinary localized
date/time/zone, accessible labels/focus/error recovery and status updates that
do not repeatedly interrupt screen readers. Preserve shared semantic tokens,
contrast, keyboard/touch and narrow/zoomed layouts. Support compatible proof
reuse, paste/autofill and low-bandwidth recovery. No new name/address fields,
fixed Western name assumptions, private browser-file persistence or guaranteed
delivery is introduced. The longer business window does not qualify short
verification/session/upload timers; assess those under their actual WCAG rules.

## Time, ownership and boundary facts

For explanation only, `G` is the qualified fresh source issuance occurrence,
`U` the admitted unfinished end, `F` eligible normal fulfillment and `E` the
completed-read end. These are not prescribed columns or a new clock service.

- Nominal `U = G + 720 hours`; 30 × 24 = 720 hours = **2,592,000 seconds**
  = **2,592,000,000 milliseconds**. This is not a calendar month, thirty civil
  days, business days, local midnight or a requested-by buffer.
- Genuine earlier whole-stage/overall limits can shorten `U`. A per-item,
  intake-only, proof/session, worker or retention boundary retains its own scope;
  do not compute one minimum of every date and close unrelated actions.
- Qualified current use requires the source's exclusive boundary and current
  predicates. A transfer started earlier is not a reserved admission. Causal
  order/current checks after waits and durable recovery remain Q13 obligations.
- With the full unclipped periods and `G <= F < U`, nominal `E = F + 720h`
  is at or after nominal `U`. Do not copy Q12's sixty-day example suggesting
  that early completion alone normally makes this thirty-day end earlier.
  Actual completed permission can still be shorter under its genuine scope/
  caps/restrictions. Never use `max(U,E)` to preserve a minimum entitlement.
- This one admission's eligible completed end is strictly before `G + 1,440h`
  (sixty elapsed days), assuming the ordinary stated boundaries. This is a
  derived explanation, not a new stored overall cap, repeat entitlement, total
  request lifetime since original issuance, or retention rule.

| Example, no earlier cap and all source predicates met                 | Expected result                                                                                                                |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Fresh issuance 21 October 2026, 12:00 UTC+07                          | Nominal unfinished end 20 November 2026, 12:00 UTC+07.                                                                         |
| First visit on fresh day 6                                            | Original end remains day 30; at most 24 days remain.                                                                           |
| No visit at all                                                       | Unfinished authority ends at the same day-30 boundary.                                                                         |
| Normal fulfillment on fresh day 5                                     | Nominal completed end day 35; exact declared read scope only.                                                                  |
| Normal fulfillment on fresh day 29                                    | Nominal completed end day 59.                                                                                                  |
| Eligible atomic issuance/fulfillment at the same qualified occurrence | Completed nominal end can equal the nominal unfinished end; actual causal/source eligibility, not timestamp equality, decides. |
| Actual fulfillment at or after `U`                                    | Independent source completion may stand; no invented recipient completed admission.                                            |
| Timely durable fulfillment observed after `U`                         | Recover original eligible completed outcome/end; no observer-time reset or stale unfinished-expiry destruction.                |
| Upload-only cutoff occurs before `U`                                  | Stop affected intake without silently ending independently authorized reading/review.                                          |

Source permission and stage are authoritative; UI dates/caches, provider URLs,
transport attempts and jobs are projections or mechanisms. Current code and
deployed state must establish implementation; the selected number does not.

## Eight exact amendments

These grooming clauses were ratified on 2026-10-21. Q13-C01–C24 and its
32 proof groups remain binding subject to the explicit Q14 specialization
above and in C08. The clauses below resolve Q14's
timing profile and simplicity requirement rather than duplicate that contract.

| ID      | Exact required language                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Q14-C01 | A newly admitted standard Fresh Unfinished Request Access MUST resolve its nominal unfinished end from the qualified fresh source issuance occurrence G plus exactly 720 elapsed hours. Successful source issuance MUST durably preserve its actual finite end and calculation/limit provenance with the source effect. Click, message, credential, first visit, mutable task date and observer time MUST NOT substitute for G.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Q14-C02 | The same end MUST bound never-entered access. This profile MUST NOT include an enter-by substage, first-entry business activation, pause, grace or activity reset. Retry MUST recover the same deliberate source effect and original outputs before any new calculation; changed output timestamps MUST NOT be treated as new material intent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Q14-C03 | “Up to” MUST preserve genuine scoped earlier limits, binding shortening and current restrictions, not create a sender/tenant duration menu. Per-action/file/credential/retention dates MUST NOT become whole-stage limits by indiscriminate minimum calculation. Missing, invalid, nonfinite or already-ended live terms MUST NOT default to a new period.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Q14-C04 | Q13's eligible completion and declared read scope MUST remain separate: actual eligible F during valid authority stops writes and can admit an end no later than F plus Q07's independent 720 elapsed hours under genuine caps. No max(U,E), stale unfinished cap, retrospective eligibility or clock reset is permitted. The derived one-admission less-than-sixty-day result MUST NOT become a new overall/retention/repetition rule.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Q14-C05 | The existing request context MUST show the actual relevant end, source status and next actor after authorization, with Requested by separate. Successful issuance has a resolved end; inability to retrieve it is uncertainty/error, not ordinary awaiting-entry activation. Use one meaningful staff review/action, truthful proof/delivery/receipt/review states, accessible localized main-content timing and safe recovery; no unnecessary reupload or new account/confirmation/download step.                                                                                                                                                                                                                                                                                                                                                                                                     |
| Q14-C06 | Reuse the Q13 source mutation/current-use and durable follow-up boundaries. Enforce supported instant/precision/range/unit semantics and qualified post-wait checks; do not use a client countdown, stale cache, a time-dependent CHECK alone, or one thirty-day resident timer as authority. Existing bounded durable wakes and owner-required fences remain allowed; no new timer service or numeric framework is required.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Q14-C07 | Adopt the standard profile prospectively through the exact source/owner binding and declared projections. Preserve existing admitted ends and specialized policies. Resolve Workflow fourteen-day wording at its actual credential/source scope, not by a global replacement. Required owner/design/test/release trace MUST distinguish selection, ratification, publication and qualification.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Q14-C08 | Q13's tenant/issuer/recipient, schema/RLS/service, immutable lineage, all-path private serving, audit, retention and rollout safeguards MUST remain binding without a parallel implementation. This profile resolves C09's timing/activation/unused reservation and specializes C19: successful source issuance resolves its end but does not establish recipient usability, proof or delivery. P13 MUST NOT require a first-entry substage; P19's shortening case MUST use actual narrower completed restrictions for this equal-duration profile. Qualify the focused and applicable inherited proofs; preserve dated Q13 records and trace this specialization. No duration editor, policy dashboard, additional state machine, reminder program or first-entry mechanism follows. Repetition/overlap and Q08 settings/eligibility remain explicitly unselected, not unlimited or one-use defaults. |

## Category-by-category adversarial review

Each row states the concern, consequence/evidence, severity/likelihood, effect
on A and exact permanent prevention. “Inherited” means a real material risk
already controlled by Q13, not a reason to design another subsystem. H/M are
high/medium qualitative estimates; critical denotes possible unauthorized
disclosure or authority corruption. Proof IDs refer to the focused groups below.

| #   | Category and material concern                                           | What could go wrong; evidence and why it matters                                                                                                                                                                         | Severity / likelihood | Effect, permanent prevention and exact spec/proof                                                                                                                                                                                                                                       |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity, alternatives — **Yes**                     | Thirty may be longer than necessary or too short for some remaining work. Q14 comparisons supply mechanisms, not measured Asym demand. Fourteen is tighter; bounded first entry protects late arrivals but adds state.   | Medium / medium       | Retain A as explicit product judgment; qualify a useful supported cohort without assuming renewal rescues poor fit. C03/C05/C08; P14/P16.                                                                                                                                               |
| 2   | Brittleness — **Yes**                                                   | Civil-day/month arithmetic, date-only formatting or client time makes “thirty days” vary. PostgreSQL datetime semantics and existing locale helpers show why display and authoritative instants differ.                  | High / medium         | Narrow to exact elapsed source arithmetic and stable output. C01/C03/C06; P01–P03.                                                                                                                                                                                                      |
| 3   | Technical debt — **Yes**                                                | A separate fresh timer calculator or copied per-app logic can drift from Q13. Current generic task/projection seams are not native fresh issuance.                                                                       | Medium / medium       | One owning calculation/result, reused by projections; no new framework. C01/C06–C08; P03/P12/P16.                                                                                                                                                                                       |
| 4   | Edge cases — **Yes**                                                    | Never-entered access, delayed proof/delivery, no usable remaining interval, intake-only stops and completion at expiry can be handled inconsistently. Q13 already separates those states.                                | High / medium         | Same unused end; source-specific limits and exact exclusive transition rules. C02–C05; P04–P09.                                                                                                                                                                                         |
| 5   | Footguns — **Yes**                                                      | “Up to thirty” can become a date picker; resend/retry may mint another thirty; successful issuance may retain a meaningless pending-activation state.                                                                    | High / high           | Resolve once, recover first, show actual outcome; exclude C's mechanism and manual editing. C01–C03/C05/C08; P03–P05/P11.                                                                                                                                                               |
| 6   | Tenant safety — **Yes, inherited**                                      | A convenient end lookup/cache keyed only by request/email can disclose another tenant's terms or apply its authority. Platform/P12 require exact context.                                                                | Critical / medium     | Keep trusted tenant/source/recipient/effect relationships and private projections through Q13. No new permission rule is needed. C06/C08; P10/P12 plus Q13-P21–P24.                                                                                                                     |
| 7   | Database, RLS, authorization — **Yes, inherited**                       | Caller-controlled dates/actor fields, mutable grant rows or service paths can turn allowed rows into longer/wider authority. Current broad role wrappers do not prove native P12.                                        | Critical / medium     | Preserve Q13's same-tenant keys/FKs, required provenance, valid null/state rules, protected historical facts, effective old/new-row policies, grants/views/functions/RPC/storage and service checks. No money/schema redesign is introduced. C01/C03/C06/C08; P10/P15 plus Q13-P21–P22. |
| 8   | Overengineering — **Yes**                                               | Retaining first-entry timers, unused invitation stages, configurable policies, extra confirmations or a new scheduler after selecting A adds unnecessary work and confusion. The user expressly rejects that complexity. | Medium / high         | One standard source rule and end; remove C-only mechanics from intended scope. Reuse Q13 by reference. C02/C05/C06/C08; P04/P11/P16.                                                                                                                                                    |
| 9   | UX/UI and friction — **Yes**                                            | “You have thirty days” misleads late entrants; source review can look like recipient delay; uncertainty can look like failure. GOV.UK/WCAG support task-local truthful feedback.                                         | High / high           | Actual end/next actor, separate Requested by, preserved received work, one action and accessible recovery. C05; P11/P13–P14.                                                                                                                                                            |
| 10  | Source of truth, ownership, invariants — **Yes**                        | Two distinct thirty-day periods can collapse into one expiry field/formula, starting completed reading at grant time or widening its scope. Q07/Q13 give different owners/events.                                        | High / medium         | G anchors unfinished U; eligible F anchors completed E; original effects and exact view membership remain. C01/C04/C08; P06–P09.                                                                                                                                                        |
| 11  | Hidden coupling — **Yes**                                               | Proof, email, browser visits, workflow pause, fourteen-day task wording or provider URLs can accidentally govern source lifetime. Q11–Q13 and Workflow explicitly separate them.                                         | High / medium         | Keep mechanisms/owners distinct; map fourteen-day wording precisely during authorized integration. C02/C06–C08; P03/P12/P16.                                                                                                                                                            |
| 12  | Failure modes — **Yes, inherited**                                      | Lost response after commit or late projection leads to a second end/grant; missing end displayed as legitimate activation wait hides an error. Q13 defines durable same-effect recovery.                                 | High / medium         | Same-effect reconciliation, immutable admitted result, separate proof/delivery and no destructive cleanup on ambiguity. C01–C02/C05/C08; P05/P09/P12.                                                                                                                                   |
| 13  | Lifecycle, time, concurrency, idempotency — **Yes**                     | Expiry, completion, revocation and delayed retries use stale checks or restart clocks. Transaction-start time does not prove current eligibility after waits.                                                            | Critical / medium     | Preserve qualified occurrence/order, exclusive boundary and Q13 fences; no transfer-start grace or observer-time clock. C01–C04/C06/C08; P05–P09.                                                                                                                                       |
| 14  | Data integrity — **Yes, inherited**                                     | Recomputing existing ends, mapping original sixty-day grants to thirty or mutating receipt history corrupts historical truth. Task-date edits are not source corrections.                                                | High / medium         | Prospective policy binding, immutable first outputs and owner-authorized repair; no guessed backfill. C01/C02/C07/C08; P03/P05/P15.                                                                                                                                                     |
| 15  | Security/privacy — **Yes, inherited**                                   | Private metadata/bytes may remain available through caches/URLs/streams after authority ends; grant expiry may wrongly delete retained evidence. Q04/Q13 prohibit both shortcuts.                                        | Critical / medium     | Apply existing every-door current authority and owner retention independently; do not change technical credential lifetimes by substituting the business period. C03/C06/C08; P10/P12/P15.                                                                                              |
| 16  | Scalability/performance — **Yes**                                       | Thirty days still exceeds Node's single-delay limit; resident timers, full-history scans or extra permission queries are unnecessary. Existing P12 R6 applies only at its specified governed-read scope.                 | High / medium         | Source end/current checks and existing bounded wakes; preserve existing scoped budgets and tenant fairness, not another scheduler/global lock. C06/C08; P02/P12/P16.                                                                                                                    |
| 17  | Operational burden — **Yes**                                            | Staff may manually edit dates, repeatedly reissue on mail failure or clone requests when timing is unclear. These workarounds contradict the selected finite source act.                                                 | Medium / medium       | Real stored result and owned help/recovery; a poor cohort fit triggers product/source correction, not hidden renewal. C02/C05/C08; P05/P11/P14.                                                                                                                                         |
| 18  | Observability/auditability — **Yes, inherited**                         | Logs may show “30 days granted” without actual end, limits, source effect or distinction from delivery. Best-effort audit is not required durable evidence.                                                              | High / medium         | Preserve Q13 source/security evidence and minimal protected correlation; display actual result, keep technical logs and recipient history separate. C01/C05/C08; P05/P10/P12.                                                                                                           |
| 19  | Dependencies/integrations — **Yes, inherited**                          | Provider dedupe/expiry, callbacks or worker execution times may masquerade as G; vendor defaults may be copied into source policy.                                                                                       | High / medium         | Current source remains authoritative, provider/custody/delivery roles remain bounded. No dependency change is required by the selected interval. C01/C02/C06/C08; P03/P12/P16.                                                                                                          |
| 20  | Migration/rollout/upgrades — **Yes**                                    | Old workers or restored rows could apply original sixty days, first-entry semantics or a later default to a fresh admitted effect. The native feature is not yet qualified.                                              | High / medium         | Exact prospective profile, compatible producers/readers/workers and adverse-state restore; no policy relabel/backfill from timestamps alone. C07/C08; P15/P16.                                                                                                                          |
| 21  | Testability/traceability/proof — **Yes**                                | An arithmetic assertion, nearby test or attractive screen can be claimed as feature readiness; repeated prose can conflict with existing Q13 obligations.                                                                | High / high           | Focused falsifiable checks plus inherited proof, one source policy and exact trace through later publication. State evidence levels honestly. C07/C08; P01–P16.                                                                                                                         |
| 22  | Other development hazards — **No additional independent concern found** | Checked money precision, new vendors/packages, broader roles, automatic messages, retention/deletion, public sharing and another file platform. The numerical profile introduces none.                                   | Not applicable        | No additional mechanism or policy is warranted. C08 keeps these excluded; P16 checks scope preservation.                                                                                                                                                                                |

### Database and temporal precision checked explicitly

Q14 introduces a policy value, not a prescribed table design. Reuse Q13's
tenant-consistent source/recipient/requirement/effect relationships, semantic
uniqueness, immutable attribution/history and safe delete behavior. Required
identity/provenance and resolved finite ends cannot become permissive nulls or
defaults. Current time is checked at use; a time-dependent database CHECK does
not keep re-evaluating itself as the clock passes.

Effective `USING` and new-row `WITH CHECK` behavior, composed policies,
column/function grants, views, storage and privileged paths all remain in the
real-role proof. An omitted ALL/UPDATE `WITH CHECK` can inherit `USING`; the
keyword's absence alone does not prove a vulnerability. Definer/owner/bypass
posture must be checked on the actual call. These existing Q13 requirements
avoid a second authorization scheme. No native SQL or deployed-role test is
claimed by this documentation review.

## Focused proof and acceptance criteria

These sixteen groups supplement, rather than replace, Q13-P01–P32. They are
required qualification outcomes, not sixteen tests asserted to have run.

| ID      | Falsifiable outcome                                                                                                                                                                                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q14-P01 | Correct 720-hour arithmetic across month/year/leap/DST boundaries; explicit instants/offsets and supported precision; calendar-month/day, seconds/milliseconds confusion and invalid/nonfinite input cannot silently pass.                                                                |
| Q14-P02 | 2,592,000,000ms exceeds the installed single Node delay maximum; expiry correctness does not depend on that timer, a running browser or timely worker. Existing durable wakes can reconcile without creating authority.                                                                   |
| Q14-P03 | G is this fresh source act, distinct from original I, old U, draft/click, delivery, proof and visit. Successful issuance records the actual end/provenance; unrelated timestamps cannot supply a fallback.                                                                                |
| Q14-P04 | Never-entered and day-six entry cases keep the same U. No first-entry/enter-by state, activation callback or device-specific working clock appears.                                                                                                                                       |
| Q14-P05 | Lost response, new transport key, resend, later defaults and retry recover identical first-admission outputs under current disclosure. No output-clock conflict, second period or original-history rewrite.                                                                               |
| Q14-P06 | Fresh F at day 5/day 29 produces nominal completed day 35/day 59 when fully eligible/unclipped. Atomic G=F can produce equal nominal ends. No confusion between the two 720-hour policies or scope expansion.                                                                             |
| Q14-P07 | Exact before/at/after U and real wait-spanning source order respect the exclusive boundary. Actual late F cannot admit a completed view; receipt/transfer start does not reserve time.                                                                                                    |
| Q14-P08 | Genuine overall/stage limits, binding shortening and per-action/item cutoffs preserve their distinct effects. No indiscriminate min, max(U,E), restored adverse end or impossible new live interval.                                                                                      |
| Q14-P09 | Timely durable F observed late recovers original E with current restrictions; stale unfinished expiry and old-operation callbacks cannot erase valid completed authority or borrow a fresh grant.                                                                                         |
| Q14-P10 | Actual roles, mutations, direct/RPC/service/storage/view paths preserve trusted identity/provenance, tenant relationships, effective old/new-row policy and every-door private use under the inherited Q13 contract.                                                                      |
| Q14-P11 | Staff needs one meaningful review/action, sees actual result and no date picker/first-entry setup. Late recipients see the real end and next actor, with Requested by separate and no unnecessary reupload.                                                                               |
| Q14-P12 | Proof/delivery/representation/cache/audit/worker failure remains distinct from authority and business outcome. Unknown issuance is reconciled; successful issuance with unreadable end is not presented as normal pending activation.                                                     |
| Q14-P13 | Shared Base UI/base-maia composed screen passes relevant keyboard/focus/labels/status/contrast/reflow/touch/proof checks; essential date/zone is readable without hover, color or countdown-only meaning.                                                                                 |
| Q14-P14 | Representative supported recipient/reviewer/support journeys, low bandwidth, delayed entry, locales/timezones and earlier caps provide useful actual opportunity and owned recovery. No assumed recipient readiness or repeat grant rescues a failed critical journey.                    |
| Q14-P15 | Prospective mapping, old/new versions, legacy missing provenance and restore preserve original admitted ends and later adverse facts. Earlier grants are not recalculated under 30 days; incompatible old code cannot serve the new path.                                                 |
| Q14-P16 | Exact Q14→ADR→source-owner/OpenSpec/design/task/issue/test/release trace includes the C09/C19/P13/P19 specialization; applicable inherited Q13 proofs and scoped budgets remain required. No unselected repeat/overlap/Q08/notification/retention policy or extra platform is introduced. |

## What was actually verified

Current owner/source review, primary documentation checks, three independent
review passes, exact quantity/boundary arithmetic and deterministic document
verification were performed. The source inspection is bounded and the local/
remote revisions are explicit.

No runtime suite, Q12 platform experiment or Q13 five-test set was rerun or
recounted. Those remain prior evidence with their original limits. A new mock
of a thirty-day constant would not qualify the missing native source command.
The thirty-day timer risk follows exact integer arithmetic and current installed
Node documentation; it is not a newly observed timed callback experiment.
No private records, credentials, provider operation or production database query
was used. Real source/SQL/RLS/concurrency/provider/browser/AT evidence remains
unestablished.

## Synthesis and sequencing

1. **Ratified decision:** Conrad adopted this exact fixed profile, the absence
   of C's entry mechanics, scoped limits, separate completion and lean UX
   contract. These eight clauses make A precise without adding a subsystem.
2. **During authorized spec/design integration:** bind this standard profile
   once in the existing source owner, reconcile exact Workflow/source references
   and generated projections, and use it in the existing shared request UI.
   Preserve Q13 as the permission/recovery contract; no duplicate policy model.
3. **Before activation:** resolve the still-separate repetition/overlap policy,
   satisfy inherited Q13 qualification and the focused proofs above, and verify
   real user journeys. These are gates, not permission to ship partial safety.
   Q08 timing/eligibility stays separate and cannot be inferred here.
4. **After activation:** use existing source/security/operations diagnostics
   with the targeted signals below. Do not build a new dashboard to satisfy this
   review. Correct underlying scope/time/UX defects through their actual owners.

## Residual operational controls

These are ratified applications of existing Q13 controls. Thresholds identify
actionable correctness failures; they are not claims about production rates.
Inherited numerical capacity/reconciliation budgets must be set and qualified
before activation, not guessed by this timing decision.

| Signal                                                                                        | Threshold                                                                 | Accountable owner                        | Response                                                                                                      |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Admitted U differs from the qualified 720-hour/scoped-limit result or changes on replay       | Any invariant violation                                                   | Native source mutation owner             | Stop the offending issue/replay path, preserve original facts, repair by source evidence and regression-test. |
| Wrong tenant/scope, post-end serving or completed scope/end mismatch                          | Any confirmed occurrence                                                  | Authorization/security and source owners | Contain affected path/cohort, preserve minimal evidence and requalify source/data/egress boundaries.          |
| Correctness depends on worker/browser/long timer or stale cache                               | Any deterministic reproduction                                            | Runtime/source owner                     | Remove that authority dependency, reconcile valid source state and qualify bounded existing recovery.         |
| UI promises thirty remaining days, waits for first-entry activation or confuses review/expiry | Any reproducible material case                                            | Product/accessibility owner              | Correct the shared state/copy, preserve work, retest late-entry and accessibility journeys.                   |
| Routine use requires date edits, duplicate requests or reissuing uncertain effects            | Any confirmed bypass or critical cohort qualification failure             | Product/source operations owner          | Contain workaround, diagnose the real need and explicitly revise source policy/UX; never silently renew.      |
| Mixed-version/restore or inherited budget/critical accessibility proof fails                  | Any failed release case; any adopted numeric operational threshold breach | Release/runtime and accessibility owners | Gate affected release/cohort, fix or roll forward with compatible behavior and repeat relevant proof.         |

## Recorded outcome

Q14 A and the full required amendment package were ratified on 2026-10-21.
**Accept with required amendments** was the review disposition. The exact
corrected decision, Q14-C01–C08, Q14-P01–P16, eight journeys and six targeted
operational controls are adopted, with Q13's safeguards and explicit
specialization retained.

No glossary term is needed for a numerical policy. All seventeen existing terms
remain unchanged. No product code, permission, provider, dependency or retention
change is made. Formal owner/OpenSpec publication awaits `/to-prd`; tickets
await `/to-issues`. Repetition/overlap, Q08 changes, reminders and Q15 remain
unselected. The visible design remains one action, one fixed unfinished end,
and clear task status in the existing request experience.

## Founder ratification — 2026-10-21

Conrad instructed: “Yes, ratify Q14 A with the required amendments. Record it
and move to the next question in this Phase 29 grill-with-docs session, with
the research, practical options, and your recommendation.”

The corrected decision, all Q14-C01–C08 and Q14-P01–P16 rows, eight journeys,
six controls and explicit Q13 specialization are ratified without substantive
change. The evidence limits remain: this is not native runtime, database,
provider, browser or intended-user qualification. Repetition/overlap, Q08
policy and Q15's answer remain unselected.
