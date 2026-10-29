# Phase 29 Q15 — further approved periods after expiry: adversarial review

**Disposition: Accept with required amendments.**

Conrad selected **A — Allow further staff-approved periods after expiry** and
ratified its full required amendment package on 2026-10-21 (Asia/Bangkok),
requesting excellent UX/UI without overengineering. Q01–Q15 are ratified
grooming intent. No runtime implementation or formal publication follows.

The solution remains the existing source-owned grant action and request screen.
This review adds eight focused clauses to Q13/Q14, not another permissions,
renewal, scheduling or settings system. The real new requirements are sequential
eligibility, concurrent decisions and the distinction between a new grant and
recovery of an old one.

## Evidence, authority and limits

Local HEAD and live develop were rechecked at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab` and
`e2761135d2952426e15be7d56c1d9680aa7b8c15`. They are different snapshots.
The previously reviewed deltas concerned document-cutover test/command seams
and then five commits/four CI-workflow and acceptance files. No new drift
was found in this check; no pull occurred. Source references below describe
the named local checkout, not deployed behavior.

The [Q15 question](phase29-q15-question.md) preserves the alternatives.
Independent [owner](phase29-q15-owner-adversarial.md),
[runtime](phase29-q15-runtime-adversarial.md) and
[UX](phase29-q15-ux-adversarial.md) reviews supplement the current owner/source
and primary-document review. Their findings are engineering review, not
representative-user feedback or live competitor testing.

| Evidence class                | Established fact or explicit limit                                                                                                                                                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ratified intent               | Q13 defines the source capability, issuer/recipient/scope, immutable effect, current-use and completion safeguards. Q14 fixes each fresh period at up to 720 elapsed hours from its source issuance. Their native enforcement remains unqualified.          |
| Ratified Q15 intent           | Further individually approved periods after eligible ordinary expiry; no overlapping unfinished admission in the same lineage, automatic renewal, pre-expiry extension or standard lifetime count/day ceiling. Full amendments were ratified on 2026-10-21. |
| Current code                  | Dispatch-key uniqueness, conditional status writes, semantic refund attempts and worker claims exist. None is a qualified native repeated-document-access command or proof of nonoverlap.                                                                   |
| Primary external facts        | Products distinguish expired access from new requests and vary on reopening collection links. PostgreSQL row locks protect retrieved rows, not an empty result. Permission checks need the actual current context.                                          |
| Product judgment              | Current legitimate need is a better standard decision basis than an arbitrary one-use count. A permits a potentially long cumulative sequence; finite individual grants do not prove a finite total lifetime.                                               |
| Unresolved empirical evidence | No representative Asym demand, review-cost or usability study was gathered. Real SQL/RLS/race/provider/browser/AT/cohort qualification remains required before activation.                                                                                  |

### Governing reconciliation

Paths are relative to `/home/conrad/code/core` unless linked otherwise.

| Source                                                                                                                               | Consequence                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`; `docs/ai/document-authority.md`; `openspec/project.md`; platform principles/boundaries                                  | Latest scoped owner intent governs; publication, implementation and qualification are distinct. Safety and source truth precede convenience. Shared source behavior must not fork by app.                                           |
| Feature ADR-0002; Q01–Q07                                                                                                            | Files serve real source purposes; reading, custody, receipt, review, correction, completion and retention remain distinct. This is not an organizational drive.                                                                     |
| Feature ADR-0013:19–83; Q13-C01–C24/P01–P32                                                                                          | Exact current administration, original requirement ceiling, independent write/read scope, causal completion, effect identity, source fencing, private serving and recovery remain the contract.                                     |
| Feature ADR-0014; Q14-C01–C08/P01–P16                                                                                                | Fixed fresh source end, unused behavior, separate fulfillment-based completed reading and actual-end UX stay unchanged. Q14's Q13 specialization remains binding.                                                                   |
| `docs/prds/workflow-studio/03-runtime-and-recovery.md:13–75`                                                                         | Source completion is not silently reopened; semantic business acts differ from attempts; short source transactions and current fences precede external dispatch; deadlines are not approvals.                                       |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1542–1587,1643–1654,1670–1672`                          | Sole PDP/native participant context, coarse tenant RLS, exact administrative scope/live assignable ceiling, continuing dependencies and owner-required mutation fences apply. Governed-read R6 is not a total issuance-flow budget. |
| `packages/api/src/workflows/ledger.ts:117–175,209–247`; `20260611134500_workflow_dispatch_ledger.sql:7–37,67–73`                     | Handoff upsert/conditional recovery is useful, but a different key can create another dispatch. A dispatch ledger is not grant history or a cross-intent admission fence.                                                           |
| `packages/api/src/admin/contribution-operations/store.ts:151–241`; `correction-requests.ts:193–223,432–451`                          | Material-input matching and conditional update patterns exist. Their financial/row-level behavior is not proof of native grant sequencing.                                                                                          |
| `20260611181000_workflow_work_claims.sql:23–43,61–99`; `20260718005737_eve_model_policy_tracer.sql:7–24` under `supabase/migrations` | Worker-claim exclusivity and a mutable active permission row have different ownership/lifecycles; neither is a preserved sequence of finite document admissions.                                                                    |

This ratified successor explicitly specializes Q13-C02/P01: first fresh access
still proves original lawful admission and ordinary expiry; later access also
proves the relevant fresh predecessor's eligible expiry and current lineage.
It resolves Q13-C09/C12/P11 and Q14-C08's standard repetition/nonoverlap
reservation, including no preset count/cumulative ceiling, as ratified.
All other applicable Q13/Q14 safeguards and their qualification requirements
remain binding. Dated prior records are preserved; later authorized owner/
OpenSpec integration must replace conflicting current reservation clauses and
update declared projections. Q08's completed-read policy remains separate.

### Current primary research

| Source                                                                                                                                                                                                                                                            | Bounded lesson                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Microsoft Entra request process](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-process)                                                                                                                                           | Expired assigned access requires a new request, distinct from an approval timeout or permitted extension. It supports fresh consideration, not guaranteed approval or a universal repeat count.                                                                 |
| [Entra lifecycle policy](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-lifecycle-policy)                                                                                                                            | Continuing policy scope, optional approval and true outer limits matter; changing policy does not rewrite existing approved expiry. Its settings and notice cadence are not imported.                                                                           |
| [Dropbox requests](https://help.dropbox.com/share/create-file-request); [Tresorit requests](https://support.tresorit.com/hc/en-us/articles/360012750360-Manage-file-requests)                                                                                     | Dropbox permits reactivation; Tresorit closes links finally while retaining staff processing of received material. Both are credible comparisons with different permission semantics, not an Asym storage or retention policy.                                  |
| [Foundant follow-up logic](https://support.foundant.com/hc/en-us/articles/4411213334935-Follow-Up-Submission-Logic)                                                                                                                                               | Submission and administrator completion can differ. Repeated recipient access is not needed merely to let independently authorized staff finish review.                                                                                                         |
| [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)                                                                                                                                                     | Least privilege, deny-by-default and checks on each protected request support existing Core boundaries. They do not replace P12 with a new authorization model.                                                                                                 |
| [PostgreSQL 17 explicit locking](https://www.postgresql.org/docs/17/explicit-locking.html); [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html); [row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)                       | Row locks, structural constraints and RLS have distinct jobs. Locking an empty candidate query is not absence protection; cross-row/current-time business invariants need a sound mutation protocol. No particular schema or isolation change is selected here. |
| [GOV.UK confirmation](https://design-system.service.gov.uk/patterns/confirmation-pages/); [check answers](https://design-system.service.gov.uk/patterns/check-answers/); [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Meaningful review, truthful results/next steps and accessible status updates support the existing request context. No mandatory new page, extra confirmation or countdown follows.                                                                              |

The earlier [comparative research](phase29-q15-comparative-research.md) also
checks grant-application and CRM invitation/deadline differences. None provides
an optimal repeat number or verified ministry workflow. Existing Core decisions
win where a vendor's reopening, editable dates or retention model differs.

## Adversarial check

### What could go wrong with this answer?

Two individually valid-looking staff decisions could overlap; a stale request
could silently become a later grant; a replay could return the newest grant
instead of the original one. Fix the owning source mutation and result semantics,
not merely the button or transport key.

### What hidden assumptions are we making?

That the source can prove relevant expiry, current need and complete applicable
lineage, and that staff have the exact current authority to issue. An unfinished
flag, old original expiry or familiar email proves none of these. Actual users'
frequency of repeat need and staff burden remain unmeasured.

### How does this affect the whole product?

It permits repeat consideration within the same existing source purpose. It does
not change accepted evidence, add storage entitlement, renew credentials,
restart retention or reopen completed work. Independent staff work continues.

### How does this affect the end-user experience?

Staff use the same contextual action. Recipients return to the same permitted
work, actual end and next actor. Prior results stay truthful. No renewal hub,
counter editor, extra account or unnecessary reupload is needed.

### Does this follow modern best practices?

Explicit current authorization and durable same-effect recovery do. No-count-cap
is a selected product judgment, not an industry rule. The strongest alternative
is one fresh period only; the no-build alternative in review-only cases is to
finish independent staff work without issuing another recipient grant.

### Does this fit Asym’s existing repo and product direction?

Yes within original purpose/requirement boundaries and Q13/Q14's shared source,
P12, custody and UI contracts. Current adjacent code does not establish native
support and must not be copied wholesale into the grant path.

### Should we adjust the recommendation?

Retain A with the focused amendments below. State its cumulative tradeoff
plainly and require meaningful current consideration. Do not add a quota,
cooldown, escalation ladder or AI purpose judge to hide that tradeoff.

## Corrected decision to record

Allow a currently source-authorized staff actor to consider another Fresh
Unfinished Request Access after the relevant preceding period has ended by
eligible ordinary expiry, while the same source request remains genuinely
unfinished and continued access serves its original purpose. Preserve original
lawful admission proof, the actual predecessor/current lineage and adverse
history. Mere age, an expired original row, an unchecked unfinished flag or
technical failure is insufficient.

Every grant is a new deliberate prospective source effect, bounded by Q14's
fixed up-to-720-hour period and genuine current limits. For the same tenant,
request, intended recipient and original admission lineage, no unfinished
fresh periods overlap or stack, even when their subsets differ. This standard
policy has no preset grant-count or cumulative-day ceiling. It neither
guarantees another approval nor introduces automatic renewal, pre-expiry
extension, scheduled future grants or a mandatory waiting gap.

Use the original admitted purpose/requirement ceiling, current eligibility and
the newly reviewed action/read subset. Do not union expired scopes or make a
previous narrow grant an invented permanent global restriction. Actual binding
restrictions remain. Independent rights elsewhere are not removed. Completion
is terminal for this unfinished lane; the existing Q13/Q07 qualified completed
view is unchanged, with no gap backfill or silent Q08 expansion.

Recover an already committed matching intent on its exact original lineage
before treating an obsolete predecessor as a new-action conflict, subject to
current disclosure. A genuinely unadmitted new intent must still match the
reviewed predecessor/material state at its qualified source boundary. It
cannot silently move to an intervening grant after that grant later expires.
Concurrent decisions must have one valid serialized result, including when
no live grant row is returned. Existing source/P12 mutation boundaries and
coherent effect/audit/follow-up recovery enforce this without a new framework.

Use one meaningful **Grant access to continue** action in the existing request.
Show prior outcome, actual current terms, relevant remaining work/read purpose
and next actor. Confirm the actual operation result separately from current
recipient usability and notification. Preserve receipts and usable files; staff
review does not require another recipient grant. Use existing accessible proof,
focus/status and mobile recovery. No new form fields, duration/counter editor,
routine second approval, renewal dashboard or general drive follows.

## Ownership, invariants and database boundary

The source owns original purpose, current eligibility, actual predecessor,
material review state, source occurrences and distinct immutable admitted
outcomes. P12/Auth owns current actor/recipient context and permission; custody
owns exact bytes, scan/representation and retention. The request UI, query
cache, task status, dispatch ledger, provider notification and worker lease
are not alternate grant authorities.

The same lineage admits at most one valid unfinished fresh period at a time.
A historical end or scope cannot be rewritten into another effect. Every
repeat needs the actual lawful prior chain and current source state; expiry
must include its cause and applicable restrictions, not just a date comparison.
A real overall/purpose end coinciding with nominal day thirty still applies.
At an old exclusive end, a new qualified effect may occur without an invented
cooldown; causal validity, current checks and the source's supported precision
still govern. Neither eligibility nor effects may be backdated into a gap.

Reuse same-tenant and same-source/recipient/requirement relationships, trusted
attribution, required provenance, finite ordered instants, semantic uniqueness
and protected history. Caller-supplied IDs are selectors to resolve, not trusted
tenant/actor/predecessor/owner/approval facts. A permitted UPDATE must not move
those fields or turn an ended outcome into new authority. Required relationships
need real constraints or the owning mutation protocol, not an optional UI check.
Cross-row nonoverlap is not proved by a row CHECK or a periodically updated
active-status flag; locking only returned live rows does not cover absence.

RLS qualification must cover effective SELECT/INSERT/UPDATE/DELETE privileges,
USING and resulting-row WITH CHECK behavior, permissive/restrictive composition,
column grants, views, function execute/search-path/owner posture, storage and
privileged service/job paths. Omitted ALL/UPDATE WITH CHECK may inherit USING;
its literal omission alone is not a vulnerability. Coarse tenant RLS does not
replace exact source/P12 authority. Foreign keys, conflict responses and
constraint errors must not leak private existence across tenants/recipients.

A bounded current source relation or equivalent durable state can avoid scanning
all historical periods. It must be coherently maintained by the same owner
with admitted outcomes, not independently writable shadow authority. Preserve
required P12 fences and read/audit budgets at their specified scope; do not add
a global renewal lock. Existing retention owns disposal. No-count-cap does not
mean indefinite PII retention or permission to delete replay/lineage evidence
and treat the request as new. If required evidence is unavailable, reconcile or
close the affected action safely; do not guess an empty history.

## User journeys and exact failure distinctions

The following are required outcomes in existing surfaces, not new screens.

| Journey                                      | Expected behavior                                                                                                                                                                                                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Another period is genuinely useful        | Authorized staff review current original purpose, recipient, relevant expired outcome and permitted subset; issue once and see the actual new end. No arbitrary repeat counter or extra approval.                                                                          |
| 2. Only independent staff review remains     | Staff continue reviewing received material without renewing recipient access. If recipient readback itself has an appropriate current purpose, evaluate it explicitly; do not fabricate an upload requirement.                                                             |
| 3. A valid grant is temporarily unusable     | Display its actual terms and recover the affected proof/delivery/representation path. Do not issue another grant or label the source expired.                                                                                                                              |
| 4. Two issuers or a stale tab compete        | One valid source outcome is admitted; the other receives an authorized conflict/current-state response. Preserve their work and refresh material review only when needed. No hidden queued successor or repeated confirmation solely because time advanced.                |
| 5. Response loss or an old replay            | Reconcile the same intent. A committed old grant is a historical result with its original end, not a new thirty-day success. Show separately authorized current access distinctly; unknown lookup is not absence. Closing a dispatched dialog does not prove cancellation. |
| 6. Recipient returns and submits/corrects    | Use current Q01 proof and Q03/Q13 exact admission/correction rules. Show actual end, Requested by separately, receipts and true next actor. Preserve usable received files; old unadmitted commands cannot borrow fresh authority.                                         |
| 7. Fulfillment or adverse change races       | Follow source order/current checks. Valid completion stops writes and may admit the narrow completed view. Actual gap completion cannot gain retroactive access; timely old completion observed late prevents a false repeat. Adverse endings remain effective as scoped.  |
| 8. Another expiry, support or a long history | Further consideration is possible under the same policy, not promised. Give the existing authorized help path and concise relevant history. No automatic messages, cloned requests, date edits, general archive or forced staff-only body access.                          |

Use clear operation-specific copy: **Access granted. Unfinished access ends
[actual date, time and zone]** only for the source result. An old recovered
result can say **That earlier access period ended [date]**, where disclosure is
allowed. Do not show a green “You can continue” success for an old expired effect.
Current access is a separate authorized fact. Use **Received — awaiting review**
when true, and **We couldn’t confirm whether access was granted** for genuine
commit uncertainty. No notice should promise another approval or an email sent.

Keep timing and next actions in main content, using Base UI/base-maia and shared
semantic tokens. Qualify keyboard/focus, labels/status, contrast, touch targets,
zoom/reflow, long translations, local date/time/zone, accessible proof/paste and
low-bandwidth disconnect recovery. No new Western-name/address assumptions,
private browser-file persistence or automatic off-device document copies follow.
Existing short proof/session/upload timers still need their own accessibility
assessment; the thirty-day business period does not qualify them.

## Eight exact required amendments

These grooming clauses were ratified on 2026-10-21. They specialize only
the named repetition reservations and retain Q13/Q14's
applicable existing safeguards and proof groups by reference.

| ID      | Exact required language                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q15-C01 | The standard lane MAY admit further separately reviewed fresh periods after eligible ordinary expiry. Every period MUST retain Q14's fixed up-to-720-hour source-issued terms. No preset lifetime grant-count or cumulative-day ceiling is added; genuine source-specific limits remain binding. No automatic renewal, pre-expiry extension, future reservation or mandatory cooldown follows. Finite periods MUST NOT be represented as a finite aggregate lifetime or a right to future approval.                                                                                                                                                                                                                                |
| Q15-C02 | First fresh admission MUST retain original lawful-admission/ordinary-expiry proof. Every later one MUST also prove its relevant preceding fresh outcome, actual ending cause and current source lineage; an ancient original expiry, technical failure or incomplete history MUST NOT suffice. Current original purpose and a legitimate need for recipient access MUST exist. Source completion, adverse endings and genuine limits MUST retain their meaning and scope, including coincident nominal ends and removed adverse causes.                                                                                                                                                                                            |
| Q15-C03 | The same tenant/request/intended-recipient/original-admission lineage MUST have no overlapping valid unfinished fresh admissions, including disjoint subsets. The owning source/P12 mutation boundary MUST atomically qualify predecessor/material review state, absence of overlapping authority and current predicates after relevant waits. A stale unadmitted intent MUST NOT silently advance to an intervening predecessor; material changes require current review. Ordinary time advance alone MUST NOT cause a second confirmation. Existing qualified fences or equivalent constrained transactions MUST cover no-row and distinct-intent races; a disabled button, per-key lock, lease or sweep alone does not suffice. |
| Q15-C04 | An already committed matching deliberate intent MUST recover its exact original effect and immutable outputs under current disclosure before its old predecessor is treated as a new-action conflict. Recovery MUST NOT return the latest grant as the original result or present expired historical success as current permission. Unknown commitment/lookup MUST be reconciled, not treated as no effect. Failed delivery or post-commit error MUST NOT erase an admission. Unadmitted old commands MUST NOT borrow later authority; source effect, required audit and durable follow-up retain coherent recovery.                                                                                                               |
| Q15-C05 | Each newly reviewed scope MUST remain within original admitted purpose/requirements and current eligibility, with separate write/current-read/completed-read scope. Expired scopes MUST NOT be unioned; a prior narrow subset alone MUST NOT become an invented permanent global restriction. Binding restrictions and independent rights retain their actual scope. Q13/Q07 completion, qualified atomic admission/fulfillment and delayed recovery MUST remain unchanged; no completed-source reopening, gap backfill, acceptance reversal or Q08 expansion follows.                                                                                                                                                             |
| Q15-C06 | Use the existing request context and one meaningful Grant access to continue review/action. Show authorized prior outcome, current need/subset, actual admitted end and next actor, keeping operation result, current usability, proof and delivery distinct. Independent staff review MUST NOT require recipient regrant or unnecessary reupload. Qualify the shared accessible mobile/low-bandwidth journey and truthful recovery. No new counter/date editor, extra account, mandatory essay, routine second approval, renewal hub or automatic reminder is required.                                                                                                                                                           |
| Q15-C07 | Preserve trusted same-tenant/source/recipient/predecessor relationships, semantic uniqueness, immutable attribution/outcomes and effective old/new-row and privileged-path authorization through Q13's existing data boundary. Use bounded indexed current-state and paginated historical access; no full-lineage scan on every issue/read or second write authority. Required historical/replay evidence, source audit and later adverse facts MUST survive supported recovery/restore; retention/holds remain separately owned and MUST NOT reset on regrant. Missing proof MUST NOT default to empty/new lineage.                                                                                                               |
| Q15-C08 | Adopt prospectively with explicit trace: specialize Q13-C02/P01 for subsequent expiry and resolve Q13-C09/C12/P11 plus Q14-C08/P16's repeat-policy reservation for this standard lane. Preserve the remaining Q13/Q14 controls, source-specific policies, compatible old/new behavior and native qualification gates. Update authorized source-owner text and declared projections together; keep dated records as provenance. No quota, cooldown, scheduled approval, new framework, retention rule, duplicate-request bypass or silent Q08 decision may be introduced as an implementation default.                                                                                                                              |

## Category-by-category adversarial review

Severity is consequence if the requirement fails; likelihood is qualitative
plausibility, not an incident rate. These are prospective design/copying risks,
not claims of native production vulnerabilities. Each row supplies the evidence,
consequence, effect on A and exact permanent prevention/proof. “Inherited”
means Q13/Q14 already define that safety boundary, not a new subsystem.

| #   | Category / material concern                                             | What could go wrong, why it matters and evidence                                                                                                                                                                    | Severity / likelihood        | Effect on A; exact prevention and proof                                                                                                                                                      |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity, alternatives — **Yes**                     | Staff may issue by habit when only independent review remains, or assume no-cap is empirically optimal. No inspected cohort data proves repeat demand; Foundant and source contracts distinguish submission/review. | Medium / plausible           | Narrow issuance to useful current purpose, retain A's explicit cumulative tradeoff; one-use B and no-grant staff work remain stronger alternatives in their cases. C01/C02/C06; P01/P13/P16. |
| 2   | Brittleness — **Yes**                                                   | An expired original row or newest timestamp substitutes for relevant predecessor/current state. Prior research found mutable task status and handoff records with different meanings.                               | High / plausible             | Source-resolved lineage and ending cause; never infer from task/email/display order. C02/C03/C07; P02/P03/P09.                                                                               |
| 3   | Technical debt — **Yes**                                                | Another renewal service, per-app counter or mutable grant upsert duplicates Q13 and loses history. Existing mutable permission rows are not a repeat contract.                                                      | Medium / plausible           | One existing source command and explicit durable results; no framework or copied grant model. C04/C07/C08; P05/P14/P16.                                                                      |
| 4   | Edge cases — **Yes**                                                    | Unused periods, coincident adverse expiry, partial scope, unknown outcomes, old replay and staff-only review produce inconsistent decisions. Q13/Q14 define distinct facts.                                         | High / plausible             | Preserve their distinctions and the relevant predecessor; no fabricated expiry/count or upload requirement. C02–C06; P02/P05/P08–P13.                                                        |
| 5   | Footguns — **Yes**                                                      | Resend, an old tab, clone, changed key or a “grant again” button creates access without fresh review. Current dispatch-key uniqueness is only attempt coordination.                                                 | High / plausible             | Deliberate material intent, no stale auto-advance, same-effect recovery and one contextual action. C03/C04/C06/C08; P03–P06/P13.                                                             |
| 6   | Tenant safety — **Yes, inherited**                                      | A lineage lock/key/lookup omits tenant or recipient; one tenant blocks another or reads its results. P12/platform contracts require exact scope.                                                                    | Critical / plausible         | Trusted composite relationships, current private disclosure and correctly scoped nonoverlap; independent participants remain independent. C03/C07; P04/P10/P11/P14.                          |
| 7   | Database, RLS, authorization — **Yes, inherited with new race**         | Allowed rows can be reparented or widened; two no-row queries both insert. RLS/row locks alone do not prove cross-intent sequencing or service-role safety.                                                         | Critical / plausible         | Structural relationships and sole atomic mutation boundary, effective USING/WITH CHECK/grants/definer/storage checks with real roles. C03/C07; P04/P10/P11.                                  |
| 8   | Overengineering — **Yes**                                               | Count ceilings, cooldowns, escalating approvers, recurring jobs or purpose-scoring systems could be added to compensate for discomfort with A's explicit tradeoff.                                                  | Medium / plausible           | Keep selected no-cap policy and meaningful existing review; no invented ancillary product. C01/C06/C08; P13/P16.                                                                             |
| 9   | UX/UI and friction — **Yes**                                            | Old replay looks like a new success; staff delay looks like recipient fault; recipient repeats files or approval ceremonies. GOV.UK/WCAG and actual source distinctions support truthful outcomes.                  | High / plausible             | Operation-specific result, separately authorized current access, real next actor and existing accessible return flow. C04/C06; P05/P12/P13.                                                  |
| 10  | Source of truth, ownership, invariants — **Yes**                        | Cache, provider, worker or mutable head becomes independent authority; old grants are edited to look new. Workflow's permanent effects differ from dispatch records.                                                | High / plausible             | One source-owned current lineage plus immutable outcomes; bounded projections cannot write authority. C02–C05/C07; P03–P07/P14.                                                              |
| 11  | Hidden coupling — **Yes**                                               | Repeat count becomes storage retention, credential TTL, staff-review permission or Q08 entitlement. Those have separate owners and gates.                                                                           | High / plausible             | Keep source access, custody, proof, review and completed-read policies distinct. C01/C05/C07/C08; P08/P09/P12/P15.                                                                           |
| 12  | Failure modes — **Yes**                                                 | Commit succeeds but response/audit/follow-up is uncertain; retry creates another grant or cleanup destroys evidence. Existing Q13 requires coherent recovery.                                                       | High / plausible             | Original-effect lookup and durable outcome reconciliation; no absence inference, false cancellation or destructive ambiguous cleanup. C04/C07; P05/P06/P12/P15.                              |
| 13  | Lifecycle, time, concurrency, idempotency — **Yes**                     | Two intents race, stale intent advances after an intervening expiry, or old completion loses to a stale grant request. Per-key locks and scheduling concurrency do not cover these invariants.                      | Critical / plausible         | Relevant predecessor/material-state fence, recovery-before-new-conflict, exact exclusive boundaries and source order. C02–C05; P03–P09.                                                      |
| 14  | Data integrity — **Yes, inherited**                                     | New period rewrites old scope/end/receipt or accumulates all prior permissions; a narrow predecessor mistakenly shrinks everything forever. Q13 distinguishes original ceiling and reviewed subsets.                | High / plausible             | Immutable effects, exact newly reviewed subset, true binding restrictions and preserved original lineage. C04/C05/C07; P05/P08/P15.                                                          |
| 15  | Security and privacy — **Yes, inherited**                               | Repeated access expands exposure over time; historical counts, links or current-result recovery leak private facts. A has no aggregate cap; Q04/Q05/P12 still govern every door.                                    | High to critical / plausible | Meaningful current need and exact current scope, protected metadata/bytes/replay, independent retention and no storage entitlement. C01/C02/C05/C07; P01/P10/P11/P15.                        |
| 16  | Scalability and performance — **Yes**                                   | Long sequences cause full-chain scans, hot global locks or unbounded audit output. Finite per-period time does not bound history length.                                                                            | Medium to high / plausible   | Indexed bounded current state, paginated history, same-owner coherent summary and existing scoped capacity/query budgets. C03/C07; P14/P15.                                                  |
| 17  | Operational burden — **Yes**                                            | Repeated review becomes rubber-stamping or date/clone repair; administrators grant just to finish their own work. No observed cost data validates the flow.                                                         | Medium / plausible           | No-grant staff path, contextual need review and existing owned recovery; diagnose poor fit rather than invent quotas/automation. C02/C06/C08; P12/P13/P16.                                   |
| 18  | Observability and auditability — **Yes, inherited**                     | Logs show success without the exact intent/predecessor/end, obscuring who issued which period; recipient history exposes internal evidence. Existing audit and business history have different audiences.           | High / plausible             | Durable source/security attribution and minimal protected correlation; old and current outcomes distinct. C04/C07; P05/P11/P12/P15.                                                          |
| 19  | Dependencies and integrations — **Yes, inherited**                      | Provider dedupe expiry or delayed callbacks mint a new period; worker leases are treated as permission. Current Workflow expressly denies those authority substitutions.                                            | High / plausible             | Semantic source identities and current fences; provider/worker effects remain bounded, no new vendor dependency. C03/C04/C08; P06/P09/P12.                                                   |
| 20  | Migration, rollout and upgrades — **Yes**                               | Old code assumes one fresh period, restored data forgets later grants/adverse facts, or backfill invents eligible lineage.                                                                                          | High / plausible             | Prospective source binding, dark evidence-preserving migration and compatible readers/writers/jobs; do not rollback to a binary that misinterprets written repeats. C07/C08; P15/P16.        |
| 21  | Testability, traceability and proof — **Yes**                           | “No overlap” is asserted by a unit mock, or earlier reserved language survives as current policy. Existing helper tests do not establish native transaction behavior.                                               | High / plausible             | Explicit successor mapping, falsifiable real-role/concurrency/recovery/UI proof and honest evidence levels. C08; P01–P16.                                                                    |
| 22  | Other development hazards — **No additional independent concern found** | Checked money precision, new packages/vendors, pricing, public sharing, automatic messages and new document editing/storage roles. This repeat choice changes none of them.                                         | Not applicable               | Keep exclusions and existing owners; no extra mechanism is justified. C08; P16.                                                                                                              |

## Focused acceptance proof

These sixteen groups supplement the applicable Q13/Q14 proof. They specify
future qualification outcomes, not sixteen runtime tests claimed to have run.

| ID      | Falsifiable outcome                                                                                                                                                                                                                                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q15-P01 | A second and later genuinely needed period can be considered after eligible ordinary expiry using current exact issuer/recipient/purpose and Q14 terms. No fixed count/day cap or automatic entitlement is secretly added; independent source caps still bind.                                                                         |
| Q15-P02 | Original lawful history and relevant fresh predecessor are both established. Active, unknown, revoked, cancelled, shortened, purpose-ended, completed and coincident-cap cases cannot pass as ordinary expiry; removed adverse causes do not revive this lane.                                                                         |
| Q15-P03 | A new intent against P fails safely if an intervening admitted effect changes material lineage, even if that intervening period expires before retry. Ordinary unchanged-context time advance does not require another confirmation or auto-reserve a future grant.                                                                    |
| Q15-P04 | Real concurrent transactions with distinct intents/keys and no live-row result produce no overlapping fresh admissions. Include concurrent grant/revoke/fulfill and different reviewed subsets; unrelated tenant/recipient lineages still progress correctly.                                                                          |
| Q15-P05 | Matching committed old intent returns its original outcome/end under current disclosure after later grants exist. Its stale predecessor does not erase recovery; the newest grant is never substituted. UI distinguishes historical result from current access.                                                                        |
| Q15-P06 | Lost reply, new transport key, finite provider dedupe window, duplicate event, cancelled browser and delayed callback cannot create another effect. Proven rollback admits nothing; post-commit/delivery failure and unknown lookup are not treated as no admission.                                                                   |
| Q15-P07 | Before/at/after the old exclusive end and real lock-wait cases enforce qualified source time/order. No pre-expiry extension or positive cooldown is inferred. Actual source issuance fixes a new end once, not a client/notification/observer timestamp.                                                                               |
| Q15-P08 | New reviewed subsets stay within original ceiling/current eligibility without unioning old scopes or making a narrow previous grant a global ceiling. Accepted/frozen writes, historical bytes and unrelated/new work stay excluded; independent permitted current reading remains possible.                                           |
| Q15-P09 | Completion in either order, eligible atomic admission/fulfillment and timely completion observed late produce only Q13/Q07 outcomes. Gap completion creates no retroactive view; no later unfinished period reopens completion or broadens Q08.                                                                                        |
| Q15-P10 | Actual tenant and role tests cover old/new-row RLS, table/column/function grants, views/RPC/definer/service/job/storage paths and attempted identity/predecessor/scope/end rewriting. Constraints and authorized mutation preserve valid same-scope transitions.                                                                       |
| Q15-P11 | Cross-tenant/recipient IDs, conflict messages, counts/history/order, caches and replay leak no unauthorized existence or bytes. Preview/original/HEAD/range/resume and active delivery retain current exact permission across periods and restrictions.                                                                                |
| Q15-P12 | Authority/source lookup, proof, delivery, representation, required audit, outbox and worker failures have truthful distinct outcomes and bounded supported recovery. No permanent period from uncertainty, destructive cleanup or false completion/cancellation.                                                                       |
| Q15-P13 | Intended staff/recipient/reviewer/support journeys work in the existing context: one meaningful action, no unnecessary upload/account, actual end/next actor, accessible proof/focus/status/reflow/touch/locale and low-bandwidth recovery. Staff review alone needs no regrant.                                                       |
| Q15-P14 | Production-shaped history length, hot-lineage contention, concurrent tenants and actual pagination/query/audit limits are declared and qualified under existing budgets. No full history scan per issue/read or incidental global lock; long history does not become an access quota.                                                  |
| Q15-P15 | Mixed versions, prior-state restore, archival/disposal and missing provenance preserve current source truth/adverse facts and exact replay. Missing history cannot become fresh eligibility; new admissions do not reset retention. Incompatible old binaries cannot serve new repeated records.                                       |
| Q15-P16 | Decision/glossary/ADR and later owner/OpenSpec/design/task/issue/test/release trace consistently closes only the standard repeat reservation. No additional settings, cooldown, future approval, notification, Q08 expansion or drive behavior appears. Actual cohort need/cost is evaluated without invented demand or user feedback. |

## What was actually verified

Current owner/source and primary-document reads, three independent engineering
passes and concrete ordering/counterexample analysis informed this review.
Deterministic recording checks verify category/clause/proof coverage, preserved
earlier content, links and status. None executes a native grant transaction.

No runtime suite, production database, provider operation, browser/AT run or
representative-user study is claimed. The native repeated-admission boundary
has not been qualified. Repeating adjacent mocked tests would not prove no-row
races or real RLS/privileged behavior. Earlier Q13 tests and Q12/Q14 arithmetic
retain their original limited evidence; they are not new Q15 passes. No secrets
or private documents were inspected or transmitted.

## Synthesis and required order

1. **Ratified decision:** Conrad adopted A's real cumulative consequence,
   exact predecessor/ordinary-expiry rule, no-overlap/no-cooldown meaning,
   old-effect recovery and stale-intent boundary. The eight clauses are the
   full focused amendment package; they do not create a new subsystem.
2. **During authorized spec/design integration:** specialize the named owner
   clauses and generated projections together. Reuse the existing source/P12
   command, preserved effects, current-state relation and shared request UI.
   Choose the smallest sound schema/mutation protocol during actual design;
   do not freeze a speculative table, lock or queue implementation here.
3. **Before activation:** prove applicable Q13/Q14 safeguards and the focused
   cases above, especially real competing transactions, old replay, current
   tenant/role boundaries, restore and composed user journeys. Q15 settles
   the standard repetition policy as ratified; it does not settle Q08 or
   substitute for source-specific qualification.
4. **After activation:** use existing source/security/product diagnostics for
   the controls below. Correct poor-fit source policy or UI through the owning
   process. Do not silently add quotas, auto-renewals or a monitoring product.

## Residual operational controls

Thresholds are correctness triggers, not invented production frequencies.
The existing owner must declare numerical load/latency/recovery budgets before
activation; no arbitrary grant-count threshold is inferred from this choice.

| Signal                                                                                                           | Threshold                                                         | Accountable owner                        | Response                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Overlap, stale-intent successor or incorrect replay result                                                       | Any confirmed invariant violation                                 | Native source mutation owner             | Contain the affected command, preserve original outcomes, reconcile through source evidence and add exact regression proof. |
| Unauthorized scope/tenant/private serving or adverse-ending bypass                                               | Any confirmed occurrence                                          | Authorization/security and source owners | Contain the affected path, preserve minimal evidence and requalify source/data/egress checks.                               |
| Unknown issuance treated as no grant, or missing required durable evidence                                       | Any confirmed occurrence or breach of adopted recovery budget     | Source operations/runtime owner          | Reconcile the original operation; stop unsafe issuance/replay until evidence is reliable.                                   |
| Regrants needed merely for staff review, clone/date-edit workarounds, or old success presented as current access | Any reproducible material workflow defect                         | Product/UX and source owner              | Correct existing flow/copy and qualify affected journeys; do not introduce automatic renewal or a hidden count limit.       |
| History/query contention or reconciliation exceeds declared bounds                                               | Any adopted numeric budget breach                                 | Runtime/database owner                   | Diagnose indexed source access, bounded recovery and tenant fairness; preserve policy while repairing performance.          |
| Mixed-version/restore, critical accessibility or supported-cohort journey fails                                  | Any failed required release case or confirmed critical regression | Release and accessibility/product owners | Gate the affected release/cohort; fix or roll forward compatibly and repeat the relevant proof.                             |

## Recorded outcome

Q15 A and the full required amendment package were ratified on 2026-10-21.
**Accept with required amendments** was the review disposition. The corrected
decision, Q15-C01–C08, Q15-P01–P16, eight journeys and six operational controls
are adopted with applicable Q13/Q14 safeguards and explicit successor mapping.

All seventeen glossary terms remain unchanged; no new term is necessary.
No product code, permission, provider, dependency or retention change is made.
Formal owner/OpenSpec publication awaits `/to-prd`; tickets await `/to-issues`.
Q08 policy and Q16 remain unselected. The visible design is still one existing
action and request context, with actual terms, preserved work and a clear next step.

## Founder ratification — 2026-10-21

Conrad instructed: “Yes, ratify Q15 A with the required amendments. Record it
and move to the next question in this Phase 29 grill-with-docs session, with
the research, practical options, and your recommendation.”

This adopts the complete corrected decision, Q15-C01–C08, Q15-P01–P16,
eight journeys, six operational controls and explicit successor mapping without
substantive change. Evidence limits remain intact: no native implementation or
source/SQL/RLS/race/provider/browser/AT/user qualification follows. Q08 policy
and Q16's answer remain separate and unselected.
