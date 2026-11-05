# Phase 29 Q12 A — 60-day ordinary profile: owner adversarial review

2026-10-21, Asia/Bangkok. **Conrad selected up to 60 elapsed days, exactly 1,440 hours, from original source issuance. The proposed amendment package is not yet ratified.** Q01–Q11 remain ratified. This note supports the root synthesis and is not a formal owner specification, runtime change or release qualification.

Reverified `/home/conrad/code/core` in Ubuntu-24.04 at HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Read current relevant ADR clauses, Workflow source requirements/generated boundary and P12 limits. No canonical edits, tests, provider actions or new permissions. Only this note is written.

## 1. Disposition and the actual product tradeoff

**Accept A with required amendments.** The selection completes the ordinary initial calculation left open by Q11. It does not add a duration menu, absolute-date editor, extension power, overall 90-day cap, retention period or renewal mechanism.

The strongest alternative remains 30 elapsed days: a tighter possible unfinished lifecycle, with less allowance for delivery/discovery, recipient work and source review. Sixty is a product judgment favoring more initial opportunity; no measured Asym timing study proves that it is sufficient or necessary. Ninety provides still more opportunity but also longer possible unfinished use. No option is established by a legal rule, provider TTL, security standard or a superficial matching number in another product.

The most important new consequence of choosing 60 is that **early completion can move the actual final read end earlier than the former unfinished date**. Under the uncapped ordinary example, fulfillment at day 10 changes the stage to reading until at most day 40, even though unfinished access would otherwise have ended at day 60. This follows Q07/Q10; it must be explained honestly rather than “fixed” with an unselected `max(old unfinished end, fulfillment + 30 days)`.

Severity below describes the plausible impact of implementing an omission. Likelihood is qualitative engineering plausibility, not an observed production frequency. This review claims no native Q12 vulnerability or passing implementation proof.

## 2. Evidence and exact preserved owners

Paths are relative to `/home/conrad/code/core`.

| Source read                                                                                                           | Q12 consequence                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/features/files-documents/docs/adr/0011-fixed-unfinished-deadline-at-source-issuance.md:3–8,19–37`               | Q11 is now ratified. Source admission establishes original end; count/calculation were left open. Original issuance time/end are recovered outputs, not regenerated retry inputs.                                                         |
| Same ADR `:39–75`                                                                                                     | Exact source/P12 identity, current checks, qualified time/order, proof/delivery distinction, genuine shortening, causal fulfillment and qualification remain. No editing/renewal power.                                                   |
| `docs/features/files-documents/docs/adr/0010-finite-unfinished-and-completed-request-stages.md:18–51,53–70`           | Unfinished scope, strict eligible source fulfillment before its applicable end, independent overall caps, delayed historical recovery and no recipient regrant from actual late completion.                                               |
| `docs/features/files-documents/docs/adr/0007-fixed-completed-request-access-end.md:22–47,49–66`                       | Completed reading is at most fulfillment plus 720 elapsed hours. Original/historical/current authority, genuine narrowing and temporary recovery remain distinct; earlier caps can leave little/no reading.                               |
| `docs/features/files-documents/docs/adr/0009-requested-by-targets-and-authorized-late-intake.md:18–51,53–64`          | Requested target, hard intake limits and finite access are different. Target-only unknowns do not invent timing; unknown actual authority still denies. Timely receipt awaiting review is not recipient overdue.                          |
| `docs/features/files-documents/docs/adr/0003-recipient-corrections-and-exact-review-lineage.md:18–33,44–54`           | Source finalization/admission and predecessor fence determine corrections; upload-start time does not reserve authority. Correction grants no deadline extension.                                                                         |
| `docs/features/files-documents/docs/adr/0006-bounded-completed-request-access.md:30–57`                               | Business read-only still permits qualified technical preparation. Source processing/retention can continue after recipient expiry; no universal private metadata fallback.                                                                |
| `docs/features/files-documents/docs/adr/0008-source-authorized-fresh-completed-access.md:19–39,71–76`                 | Fresh read admission requires original completed admission and exact current authority; its time/repetition settings remain separate. It is not active-intake recovery.                                                                   |
| `docs/prds/workflow-studio/01-product-and-experience.md:65–81`                                                        | The current text discusses named task-purpose token/session admission and a suggested fourteen-day expiry with reauthorization. It does not unambiguously establish the ordinary Q12 source clock. Upload and acceptance remain separate. |
| `docs/prds/workflow-studio/03-runtime-and-recovery.md:45–75`                                                          | Stable source identities, source-checked waits, no clock approval, exact calendar scope, fixed expiry through pause and source-authorized compensation.                                                                                   |
| `docs/prds/workflow-studio/contracts/requirements.json:144–161,194–211`                                               | Private external task admission and participant projection require P4/P12 qualification; prospective binding and exact source clock semantics remain.                                                                                     |
| `openspec/changes/add-workflow-studio-program-contracts/specs/workflow-studio/spec.md:1–21`                           | Generated from the canonical requirements source; Studio consumes registered source-authorized operations. It is not a second authoring authority for the interval.                                                                       |
| `docs/adr/0037-scanner-safe-exact-artifact-access.md:55–88`                                                           | Protected purpose/currentness and specialized short grant/session defaults remain owner-specific. The 14-day official-document example is not permission to set every token to 60 days.                                                   |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1542–1548,1585–1587,1643–1655,1670–1672` | Sole capability PDP, coarse RLS, current epochs, egress/stream checks, exact purpose, grant dependencies/mutation fence, R6 governance budget and its documented safety exceptions.                                                       |
| `docs/prds/sitestacker-parity/roadmap.md:4229–4303`; `docs/prds/program-roadmap/owner-constraints.md:154–225`         | Phase29 source-specific access and separate generated/expense/package/retention meaning. A standard ordinary period does not replace all private custody consumers' clocks.                                                               |

Q01's request-specific confirmation/native no-membership successor, Q02's purposeful custody, Q04's independently qualified originals and Q05's minimized current-scope history remain unchanged. A number never substitutes for any of those permissions. This review focuses on consequences of 1,440 hours; it does not reopen their decisions.

## 3. Material findings and exact amendment proposals

### O01 — The selected number needs an exact ordinary-profile boundary

**High impact; plausible.** A constant named `DEFAULT_DOCUMENT_EXPIRY_DAYS` can be imported by specialized purposes, existing requests, tenant configuration, credentials or storage cleanup. “Up to” can also be mistaken for authority for any sender to choose any shorter number.

**Evidence:** Q11 ADR:19–28,39–43,72–75; roadmap:4255–4267; retained owner constraints:180–225.

**Required clause:** “For newly admitted instances of the expressly qualified ordinary Private Document Request profile, the nominal unfinished end SHALL be the original qualified source issuance occurrence plus exactly 1,440 elapsed hours. ‘Up to’ preserves genuine applicable earlier restrictions; it SHALL NOT create a sender/tenant duration menu, a minimum guarantee, a universal maximum for specialized sources or a deadline-edit/extension capability.”

**Proof:** ordinary eligible source, specialized receipt/expense/care/package source, unknown profile, an existing different-policy admission, generic staff request with a supplied number, and an attempted source reassignment. Only the qualified ordinary profile receives this calculation. Legitimate independently authorized source procedures retain their own contracts.

### O02 — Do not take the minimum of every date

**High impact; highly plausible if one `expires_at` is reused.** A hard upload cutoff can be earlier than the period in which reading/review remains allowed. Collapsing it into the whole unfinished deadline wrongly denies readback and Q10 eligibility. Ignoring it because “the request has 60 days” permits forbidden late intake.

**Evidence:** Q09 ADR:18–22,31–43; Q03 ADR:44–49; Q10 ADR:18–38; Q07 ADR:56–59.

**Required clause:** “Resolve earlier limits by their source-declared action, stage and purpose scope. Only limits governing unfinished recipient access may narrow that access end. A submission-only cutoff SHALL stop its affected intake without by itself ending separately permitted reading, source review or normal fulfillment eligibility. A requested-by target is neither limit. Genuine overall/purpose/security limits retain their cross-stage effect.”

**Proof:** a synthetic source whose intake stops at day 20 but current reading/review remains allowed through the unfinished end; admitted day-19 evidence accepted after day 20; new upload at/after the intake cutoff denied; distinct overall access cap; due target earlier/later. Prove the actual source allows each consequence, not merely numerical comparison.

### O03 — Early completion can shorten the date shown to users

**Medium/high impact; highly plausible UX and implementation footgun.** With a 60-day pending period and 30-day completed period, an early normal fulfillment can yield a final date earlier than the pending date. An implementation may incorrectly preserve the later pending end to avoid surprising users, or describe completion as an extension.

**Evidence:** Q10 ADR:25–38; Q07 ADR:22–34; Q11 ADR:58–70.

**Required clause:** “Eligible normal fulfillment SHALL switch to the existing completed policy from its actual source occurrence. The completed end may precede or follow the formerly displayed unfinished end. Do not preserve the later date through `max`, wait until unfinished expiry, call every transition an extension or delay genuine completion to retain authority. Show the actual new mode/end with the already-declared conditional explanation.”

**Proof:** fulfillment at elapsed days 0/10/30/59, with valid historical source eligibility and independent caps; lawful atomic issuance/fulfillment; offline recipient returning after completion. Original end history remains true, while current permission uses the actual stage.

### O04 — Exact elapsed arithmetic is a policy boundary

**High impact at authorization edges; plausible.** “Sixty days” implemented as two calendar months, 60 local days, holiday-aware workdays or local end-of-day can differ from 1,440 hours. Rounding a display and reimporting it can widen or shorten authority.

**Evidence:** Q12 selected profile; Q11 ADR:25–37,45–49; Workflow runtime:63–67.

**Required clause:** “The new ordinary calculation SHALL add exactly 1,440 elapsed hours to the qualified original source occurrence at authoritative precision. Calendar/month/business-day or end-of-local-date arithmetic SHALL NOT substitute. Localized display is a projection of the preserved instant. Later locale, timezone or calendar changes SHALL NOT recalculate it.”

This does not select a clock API, schema or physical-commit timestamp. Source order/time qualification from Q11 still applies after waits. An arithmetic helper is not an authorization decision.

**Proof:** issuance across both DST directions, month/year/leap-date changes, non-hour timezone offsets, precision/equality around the exclusive end, invalid/nonfinite values and a wait crossing an actual restriction boundary. Display must agree with the same source instant.

### O05 — A requested target after access expiry is not automatically a new denial rule

**Medium/high impact; plausible.** The mismatch can be ignored and yield a misleading submission promise, or “fixed” by an automatic target edit, access extension or unconditional issuance rejection. None was selected.

**Evidence:** Q09 ADR:18–29,38–56; Q11 ADR:25–30,66–75; corrected Q12 question's requested-target wording.

**Required clause:** “Surface a later requested-by target as a possible timing mismatch to the authorized source before issuance. It SHALL NOT be represented as permission to submit after the relevant access/intake end. This profile does not alone impose universal rejection because a target is later, make a target mandatory, silently change either value or grant an extension. Actual source preconditions and cohort usefulness still apply.”

The 1,440-hour rule does not depend on a target value. Where the actual source independently permits issuance, a target-only absence/outage cannot become a guessed expiry or a new target dependency. Unknown required authority/cap evidence still fails closed.

**Proof:** absent/past/late/changed target; target-only outage with separately established source authority; genuinely required source timing precondition unavailable. Preserve truthful unknowns and original target/receipt evidence.

### O06 — The new profile cannot enlarge existing admitted rights on replay or rollout

**High impact; highly plausible.** A current-policy join can upgrade an older 14/30-day end to 60 days. A failed response retry after publication can recompute from a newer time or make the new duration part of a new semantic key.

**Evidence:** Q11 ADR:25–37; Q07 ADR:29–40; Workflow runtime:45–51; requirements.json:194–211.

**Required clause:** “Apply the selected profile prospectively at the qualified original source admission. Resolve an existing semantic effect before applying today's profile. Preserve its original occurrence, admitted result, policy interpretation and limit provenance. Same-intent replay SHALL NOT extend, conflict solely because an output is recomputed, or create a new effect through changed transport/policy namespaces. Existing narrower/specialized/unknown admissions SHALL NOT be relabeled or automatically enlarged.”

Before a first admission, the source's current approved terms and material preconditions still govern; a draft estimate is not an already-issued grant. Do not silently mutate approved intent to adopt a wider profile.

**Proof:** old-profile committed admission, lost response spanning new publication, draft prepared under older terms, changed material intent, expired transport key, restore before later shortening and N/N-1 worker overlap.

### O07 — Resolve the Workflow fourteen-day wording explicitly

**High impact; plausible integration ambiguity.** Workflow 01:67 discusses a task-purpose token/session, while :69 says suggested standard expiry of 14 days, renewable through reauthorization. Its exact layer is not proof that 60 is forbidden, or that 14 can simply be called a technical token lifetime. Phase18's official-document defaults are a separate purpose.

**Evidence:** Workflow product:65–69; owner gates:68–85; runtime:63–67; ADR0037:83–88; generated OpenSpec header/source authority.

**Required clause:** “The exact consuming owner binding SHALL map its source-access, entry-credential and session lifetimes explicitly. If the existing 14-day rule governs a shorter technical credential/session, preserve it and qualify lawful re-entry under still-valid original source authority. If that owner binding uses it as ordinary request source expiry, amend the exact ordinary-profile owner clause at authorized publication. Do not silently relabel existing limits, change specialized purposes, retroactively lengthen admissions or import its reauthorization wording as a Q12 renewal power.”

This is required compatible integration of the selected profile, not an additional unanswered founder decision. Actual owner-specific caps are preserved until the exact adoption is authorized and qualified. Update canonical authoring sources and their declared generated projections together; do not hand-edit a generated view into an independent authority.

**Proof:** explicit binding for the ordinary source, a shorter valid technical credential, an actually shorter source permission, existing specialized official access and unresolved legacy semantics. The affected lane remains unqualified if its mapping/re-entry cannot support the advertised profile.

### O08 — Sixty source days must not become sixty-day technical bearer authority

**High impact; plausible.** Longer source access creates more opportunities for expired links/sessions to be encountered. A convenience implementation might make cookies, verification links, signed URLs or cached decisions valid for the whole 60-day period.

**Evidence:** Q11 ADR:51–56; Q06 ADR:35–52; ADR0037:55–88; P12:1586–1587,1645–1654.

**Required clause:** “The ordinary source interval SHALL NOT set credential, proof, session, worker lease, storage URL, cache or stream lifetime. Each retains its qualified owner limit and current permission checks. Re-entry/replacement can restore use only under the same still-valid source authority; it cannot restart the 1,440 hours or bypass genuine ended access. Unknown proof/authority denies protected use without falsely claiming source expiry.”

**Proof:** a recipient returns near day 60 with expired proof/link, a replaced credential and a changed mailbox/contact revision; an unexpired technical token after source revocation; long stream/HEAD/range/resume/replay across the actual end. No unrequested bulk download or private attachment fallback.

### O09 — Submission and review near day 60 keep exact separate outcomes

**High impact; highly plausible.** A receipt on day 59 can be confused with completion, or staff may prematurely accept to preserve recipient reading. A “started before expiry” grace may be added, or failed review after expiry may delete/undo the submission.

**Evidence:** Q03 ADR:18–33; Q09 ADR:31–51; Q10 ADR:25–51,59–64; Q06 ADR:30–45.

**Required clause:** “The selected interval supplies no upload-start grace, automatic acceptance, deemed completion or review-time pause. Durable receipt/correction, hygiene, exact source acceptance and normal fulfillment retain their separate authoritative effects. Current operation-specific limits govern finalization/admission. Previously admitted work may continue under independent source authority after recipient access ends, without granting later recipient admission or resetting either clock.”

**Proof:** before/equal/after applicable finalization cutoff; correction versus review; fully received but unscanned file; real source fulfillment exactly at/after unfinished expiry; earlier lawful fulfillment observed later; unknown commit. Honor Q10's qualified linearization/commit contract rather than using an early transaction timestamp or physical commit shorthand.

### O10 — The derived “before 90 days” bound is explanation, not a new control

**Medium/high impact; plausible.** A display/chart can introduce a stored overall 90-day expiry, use it as fallback when fulfillment is missing, or make it the duration for Q08 fresh access.

**Evidence:** Q10 ADR:18–38; Q07 ADR:22–40; Q08 ADR:19–39,71–76.

**Required clause:** “For this original ordinary profile, the mathematical relationship `E <= F + 720h` with eligible `F < U <= I + 1,440h` implies `E < I + 2,160h`. This SHALL NOT create a separate authority, universal overall cap, retention rule, fallback admission or Q08 timing value. Exact source fulfillment and all current eligibility remain required; a date inequality alone authorizes nothing.”

**Proof:** early/late eligible completion, missing original admission, actual late fulfillment, delayed observation after old `U`, restrictive true cap and independent fresh read access. No “complete by day 90” permission appears.

### O11 — Sixty days must not become sixty days of retained/current content or immutable permission

**High impact; plausible.** A period may be treated as a storage promise, frozen audience snapshot or blanket original-download right. Source withdrawal, changed recipient revision, correction or disposal can make particular actions unavailable sooner.

**Evidence:** Q02 ADR:29–66; Q04 ADR:19–46; Q05 ADR:19–50; Q07 ADR:29–34,42–59; P12:1586–1587,1645–1654.

**Required clause:** “Current exact recipient/source/action/representation permission and file eligibility SHALL govern throughout the interval. Keep genuine scope-specific shortening history; clearing its cause cannot restore a longer ended authority. Temporary rendition/proof recovery remains possible within unchanged valid authority. The selected duration neither sets retention/deletion nor promises content availability, prior-version access, source-review acceptance or recall of delivered copies.”

**Proof:** correction predecessor, independent shared-byte use, revoked recipient, current-source restriction, reversible preview outage, genuinely shortened grant whose cause later clears, source disposal under its own rules, retained held evidence after access expiry. No universal file-lifetime or permanent-ratchet policy is introduced.

### O12 — Longer opportunity increases the importance of proven useful support and bounded operation

**Medium/high impact; plausible, not measured.** A fixed long-lived request can still fail through mail filtering, late discovery or slow review. A larger number can hide an unqualified entry/recovery path or normalize manual cloning/SQL dates. It also permits more outstanding authority and expiry/recovery work.

**Evidence:** Q11 ADR:51–75; Q10 ADR:59–70; P12:1548,1646–1650,1670–1672.

**Required clause:** “Activate the selected profile only for cohorts whose ordinary entry, recipient/reviewer and accountable help journeys pass qualification under their actual controlling limits. Do not assume extension/Q08 rescue, force downloads or implement reminders as part of the number. Measure bounded outstanding-request, query, expiry/recovery and egress workloads while preserving P12's current-check, mutation-fence, R6 and tiered safety contracts.”

This selects no new benchmark, scheduler, global lock, aggregate metric product or per-request governance form. Retain existing owner-required fences; avoid a new worldwide issuance/expiry lock. R6 is the existing governed-read governance budget, with documented carve-outs and safety precedence, not a limit on every business query or issuance write.

**Proof:** late delivery/first visit, weak-network recovery, source review outlasting access, earlier caps leaving little useful time, credential recovery, partial preview/history failures, accessible localized dates and large/uneven tenant loads. Report sample and coverage limits; longer time is not proof of usability.

## 4. Proposed corrected decision

For new instances of the explicitly qualified ordinary Private Document Request profile, establish the nominal unfinished end at the original authoritative source access issuance plus exactly **1,440 elapsed hours**. Resolve and preserve its actual original consequence under genuine earlier limits that apply to that access, with their declared action/stage/purpose scope and provenance. No calendar-month, business-day, local end-of-day or requested-target arithmetic substitutes. The result is recovered unchanged for the same semantic source effect.

“Up to” preserves true narrower limits and current permission; it does not permit arbitrary sender configuration, promise a minimum interval, replace specialized source policies or grant extension/renewal power. A hard intake-only cutoff affects intake; a requested-by target grants no access. Surface timing mismatches without inventing universal target-based rejection or silently editing dates.

Preserve Q10's transition on exact eligible normal fulfillment and Q07's completed maximum from that occurrence. Early completion may move the final read end earlier than the old pending date; late completion may move it later. Neither `max` nor a synthetic 90-day overall deadline may replace those rules. Actual late fulfillment cannot revive expired authority; proved timely effects can be recovered with original terms under current checks.

The source interval does not set credential/session/URL/cache/worker lifetimes or document retention. Explicitly reconcile the consuming Workflow 14-day wording at its actual owner layer, preserve specialized rights, and import no renewal capability. Apply the new profile prospectively through canonical owner integration and compatible rollout. Qualify exact source/P12 permission, all private doors, time/race/recovery, truthful recipient/reviewer/help journeys and useful real cohorts before activation. No implementation or qualification is implied by selection or later ratification.

## 5. Complete journey and proof matrix

| Journey                                                    | Required Q12 behavior and evidence                                                                                                                                                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff prepares an ordinary request                         | Show fixed standard rule and known genuine controlling terms in the existing source context. No arbitrary duration field. Authorized recipient/purpose inputs remain source intent; issuer/context/times remain source-derived. |
| Staff previews then issues                                 | Estimate is not a committed end. Current qualified source occurrence resolves 1,440 elapsed hours once under applicable limits. Material preconditions are checked; no extra timer ceremony.                                    |
| Response is lost or deployment occurs                      | Recover the same source identity/output before applying new defaults. Different approved intent cannot silently reuse it; new transport keys do not renew.                                                                      |
| Invitation is delayed or filtered                          | Original time continues. Show safe delivery/unknown outcomes; no claims of recipient notification/reading or guaranteed time after delivery. No automated compensating extension.                                               |
| Recipient first enters late                                | Current Q01 proof and source authority first. Show actual end, not “you have 60 days.” Expired technical proof may use qualified re-entry; source expiry cannot.                                                                |
| Target is absent, past or later than access                | No fabricated target or permission. Surface possible mismatch to the source; no automatic new target-based rejection or date move. Source-specific mandatory preconditions still apply.                                         |
| Recipient uploads or corrects near a cutoff                | Apply the exact intake/current evidence boundary. No start-time grace; finalization/receipt and source acceptance remain separate. Preserve server-confirmed work and unknown-outcome recovery.                                 |
| Source intake cutoff arrives while reading remains allowed | Disable affected intake only. Permitted current-file reading and independent source review remain under their exact authority; do not expire the whole request by shorthand.                                                    |
| Recipient waits while staff reviews                        | Received/Awaiting review, actual next actor and relevant end remain truthful. Timely receipt is not overdue simply because review is pending. No premature completion for clock manipulation.                                   |
| Source fulfills early                                      | Switch to completed read-only under Q07, even if final date is earlier than the old unfinished date. Explain current mode/end calmly; no “extended” claim or max-date fallback.                                                 |
| Source fulfills near expiry                                | Exact source occurrence/order and historical eligibility decide. Prior valid transition survives stale expiry workers and later observation; actual later completion creates no ordinary recipient admission.                   |
| A restriction or identity/host revision changes            | Apply exact source scope, continuing dependency and qualified doorway. Genuine narrowing persists; no same-email retarget or 60-day token override.                                                                             |
| A preview/history component fails                          | Preserve independently authorized actions and receipt truth. Current permission uncertainty fails closed; outage is not fabricated expiry or empty history.                                                                     |
| The unfinished end arrives                                 | Deny affected new recipient operations at the exact exclusive instant without sweep dependence. Keep source processing/retention separate. No private metadata fallback or promised Q08 recovery.                               |
| User seeks help or new work                                | Accountable source support inspects only its permitted evidence. No implicit extension, cloned renewal, historical bytes or email attachment. New source actions need their own authority.                                      |
| Migration, old worker or restore runs                      | Preserve admitted original terms and later adverse state. Do not rebase old policy on the new 60-day choice or infer absent evidence from emails/tasks.                                                                         |

Boundary proof should include exact-before/equal/after the authoritative instants and independently restrictive caps; current and revoked roles; SQL/RPC/service/storage paths; all relevant metadata/original/preview/history/replay/stream paths; and actual browser/assistive-technology handling. No adjacent arithmetic or mocked test alone proves that bundle.

## 6. Twenty-two-category review map

| Category                                   | Q12-specific issue and resolution                                                                                                                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity/alternatives           | Sixty is selected product judgment; thirty remains the strongest tighter alternative. Qualification, not a number, proves usefulness. O12.                                                                           |
| 2. Brittleness                             | Avoid calendar-month/day helpers, mutable due fields, current-default joins and token TTL reuse. O02/O04/O06/O08.                                                                                                    |
| 3. Technical debt                          | Adopt one exact profile through the existing source owner; do not scatter per-app constants or make a second expiry authority. O01/O06/O07.                                                                          |
| 4. Edge cases                              | Early completion shortens displayed final date; a submission cutoff need not end reads; late delivery leaves little time. O02/O03/O05/O09.                                                                           |
| 5. Footguns                                | “Up to” is not an arbitrary picker, 60 is not a cookie TTL, and resend/copy is not a new period. O01/O06/O08.                                                                                                        |
| 6. Tenant safety                           | Cohort/purpose binding, recipient revision and server-owned policy selection must survive the longer period and all recovery. O01/O06/O08/O11.                                                                       |
| 7. Database/RLS/authorization              | No generic endpoint may set date/profile/issuer fields; source capability/sole PDP and owner mutation fence remain. Exact UTC arithmetic is not permission. O01/O04/O06/O12.                                         |
| 8. Overengineering                         | No date-policy builder, first-entry engine, 90-day control, extra confirmation or new scheduler follows. O01/O03/O10.                                                                                                |
| 9. UX/UI/friction                          | Actual stage/end and Requested by distinct; don't imply sixty days after visit or universal extension on completion. O03/O05/O09/O12.                                                                                |
| 10. Source truth/domain invariants         | Layer-specific limits, source fulfillment, credential authority and retention retain separate owners. O02/O07/O10/O11.                                                                                               |
| 11. Hidden coupling                        | Avoid coupling access to calendar settings, due edits, delivery, current policy, credential replacement or scan lifetime. O04/O06/O08.                                                                               |
| 12. Failure modes                          | Unknown outcome, lost wake, delayed delivery and partial outages preserve original facts/end and safe current use. O06/O08/O09/O12.                                                                                  |
| 13. Lifecycle/time/concurrency/idempotency | Exact source I and immutable result, operation-specific cutoffs, causal F, exclusive boundaries, delayed recovery and no resetting. O02–O10.                                                                         |
| 14. Data integrity                         | Preserve admitted profile provenance, receipt/target/correction lineage and genuine adverse history; no old-policy enlargement. O05/O06/O09/O11.                                                                     |
| 15. Security/privacy                       | Longer possible source opportunity never grants broad bytes, stale snapshots, public links, private timing disclosure or long-lived bearer credentials. O08/O11.                                                     |
| 16. Scalability/performance                | More outstanding work must be bounded and measured; preserve R6's scope, source fences and expiry without sweeps/global serialization. O12.                                                                          |
| 17. Operational burden                     | Long review or technical failure can still defeat the period. Owned support and actual cohort evidence must exist; no SQL/cloning workaround. O09/O12.                                                               |
| 18. Observability/audit                    | Explain nominal versus actual scoped end, policy version and original result with safe evidence. A generic Expired state must not hide which action ended. O02/O06/O11.                                              |
| 19. Dependency/integration                 | Workflow's 14-day ambiguity requires exact layer mapping/owner amendment; specialized Phase18 remains unchanged; re-entry must support long-lived source rights. O07/O08.                                            |
| 20. Migration/rollout/upgrades             | The 60-day choice is prospective, not an enlargement batch or restore default; old/new workers preserve original terms/adverse state. O06/O07.                                                                       |
| 21. Testability/trace/proof                | Numerically exact cases plus live source roles, races, all doors and end-user journeys. Formula checks cannot close owner/runtime gates. Sections 2/5.                                                               |
| 22. Other hazards                          | No independent money, legal/compliance, storage retention, offline copy or notification capability is required by this number. Preserve their owners rather than claiming a 60-day rule certifies them. O01/O11/O12. |

## 7. Recording, unresolved scope and honest limits

Q12 A is selected; the exact owner-language and proof safeguards here await the root's synthesis and founder ratification. Preserve Q01–Q11. When later integrating, amend the exact canonical owner/profile clauses and regenerate declared OpenSpec projections; do not globally replace every “14 days” or authorize new source behavior through a generated view.

Still separate: active-expiry recovery, deadline editing/extension capability, Q08 fresh-access timing and repeat/overlap settings, notifications/reminders, deliberately new source profiles and actual release qualification. The selected number supplies neither a staff override mechanism nor permission to call an incompatible cohort ready.

This read-only owner pass did not run arithmetic/runtime tests, query production, or re-audit every specialized purpose end to end. It freshly checked the cited ordinary/Workflow/P12 scope and preserves specialized owners. Current implementation, exact elapsed-arithmetic adapters and external UX/platform evidence are independently reviewed by sibling agents. No passing native behavior is inferred from their existence or from these source documents.
