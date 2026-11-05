# Phase 29 Q11 A — owner-contract adversarial review

Research date: 2026-10-20. **Conrad selected A, fixing the ordinary unfinished-access end at source issuance. The amendments proposed here are not yet ratified.** Q01–Q10 remain ratified. This is an independent owner review for the root synthesis, not a formal specification, publication or runtime change.

Reverified `/home/conrad/code/core` HEAD in Ubuntu-24.04 as `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Read root `AGENTS.md`, `openspec/project.md`, current identity OpenSpec and its relevant active change, source/generated ownership, applicable source contracts, Q01–Q10 ADR clauses and the researched Q11 question. No tests or provider operations were run. Only this workspace note was written.

## 1. Disposition, provenance and strongest alternative

**Accept A with required amendments.** Establishing one finite unfinished end at initial source access admission is consistent with Q10 and gives a simpler ordinary lifecycle. The selection does not specify an elapsed duration from issuance, a date-calculation formula, a date editor, a staff extension power or a new overall cap.

The strongest rejected alternative remains a finite latest-entry opportunity followed by one finite work interval from timely qualified entry. It can better preserve time for a late entrant and is not inherently unbounded. A deliberately accepts that delivery delay, recipient absence and source review consume the unfinished opportunity. Whether the eventual numerical policy is useful must be demonstrated for its admitted cohort; no research here establishes an optimal number or a measured prevalence of delays.

The principal Q11 hazard is ambiguity in **issuance**. Core separately owns source access, protected credentials, message preparation, provider delivery, proof/session and source completion. Several are legitimately “issued” at different times. If a new message, credential, workflow attempt or browser session resets the source end, A has become a sliding policy despite truthful-looking UI.

Severity below is the plausible consequence **if the identified design error were implemented**. Likelihood is conditional engineering plausibility, not a production probability. No native Q11 defect, exploit, incident or qualification is claimed.

## 2. Evidence and owner boundaries

Paths below are repository-relative to `/home/conrad/code/core`.

| Evidence read                                                                                                                                                                          | Relevant contract                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/ai/document-authority.md:10–35,39–55`; `openspec/project.md:1–18`                                                                                                                | Exact owner intent and explicit supersession govern; current implementation and qualification are distinct; generated projections are not separate authoring authority.                                                                        |
| `docs/adr/0025-producer-owned-protected-actions.md:21–50,74–92,112–130`                                                                                                                | Producing domain owns authority and expiry. GET/HEAD inert. New credential requires new prepared-message identity. Exact protected exchange/current checks, host and recipient revisions remain.                                               |
| `docs/adr/0037-scanner-safe-exact-artifact-access.md:32–35,45–67,83–88,104–110`                                                                                                        | Artifact, recipient authority, grant/session and delivery are independent. Exchange is not human/identity proof. Specialized replacement/defaults remain purpose-owned, not native-request defaults.                                           |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1542–1558,1569–1587,1643–1655,1668–1672`                                                                  | Sole PDP; exact tenant/principal/purpose/context; live service ceiling; current epochs; every egress; purpose not caller-supplied; issuance administration distinct from exercise authority; exact grant dependency and one mutation boundary. |
| `openspec/specs/identity-and-access/spec.md:14–49,69–82`; `openspec/changes/fix-request-scoped-auth-context/specs/identity-and-access/spec.md:5–51`                                    | Existing session/membership-based native context, server-side scope and no admin-credential/profile-role fallback. These do not themselves implement the new no-membership participant source.                                                 |
| `docs/features/files-documents/docs/adr/0001-confirmed-recipient-private-document-requests.md:25–56,58–87`                                                                             | Request/relevant revision proof, exact compatible reuse, no enrollment; current use and independent processing; explicit P4/P12/no-Party/P17/P6 successor adoption required.                                                                   |
| `docs/features/files-documents/docs/adr/0002-purpose-bound-files-and-submission-readback.md:24–66`                                                                                     | Admitted source/purpose, no general drive, exact own-file preview, independent source use and custody/retention.                                                                                                                               |
| `docs/features/files-documents/docs/adr/0003-recipient-corrections-and-exact-review-lineage.md:18–33,44–54`                                                                            | Exact pending-member correction admission, immediate predecessor fence, no start-upload grace or clock extension, durable effect identity.                                                                                                     |
| `docs/features/files-documents/docs/adr/0004-submitted-original-download-and-current-source-authority.md:19–46`; `0005-current-files-and-participant-submission-history.md:19–50`      | Qualified exact current originals and history through current private doors; metadata and replay are protected; expired access does not create a history fallback.                                                                             |
| `docs/features/files-documents/docs/adr/0006-bounded-completed-request-access.md:22–57`                                                                                                | Source fulfillment separate from technical success; independent source work after recipient expiry; finite policy, current proof and representation; no incidental renewal.                                                                    |
| `docs/features/files-documents/docs/adr/0007-fixed-completed-request-access-end.md:22–40`                                                                                              | Original completed end and historical eligibility, current restriction, preserved narrowing, no processing-time regrant.                                                                                                                       |
| `docs/features/files-documents/docs/adr/0008-source-authorized-fresh-completed-access.md:19–50,71–76`                                                                                  | Fresh completed read is a separately governed capability requiring prior ordinary admission. Issuance authority and continuing delegation dependency must be exact. No active-request extension follows.                                       |
| `docs/features/files-documents/docs/adr/0009-requested-by-targets-and-authorized-late-intake.md:18–64`                                                                                 | Requested target does not expire/grant access. Target edits preserve prior evidence. Source hard limits and receipt/admission facts remain distinct.                                                                                           |
| `docs/features/files-documents/docs/adr/0010-finite-unfinished-and-completed-request-stages.md:18–70`; `grill/phase29-q10-adversarial-review.md:204–242,443–464`                       | Finite unfinished-stage scope, exact timely fulfillment, genuine independent caps, current order/time, recoverable durable transition and no source lifecycle resets. Initial anchor/duration was left open.                                   |
| `docs/prds/workflow-studio/03-runtime-and-recovery.md:15–51,55–75`                                                                                                                     | Source facts/outbox, prospective event generation, after-wait current source checks, permanent semantic effect identity, no provider under transaction, scoped calendar rules and fixed expiry not paused.                                     |
| `docs/prds/workflow-studio/contracts/requirements.json:144–161,204–211,388–392`; generated `openspec/changes/add-workflow-studio-program-contracts/specs/workflow-studio/spec.md:1–21` | Private participant and timer requirements; source owns effects; generated authoring source is declared. No generic fallback for missing predecessor admission.                                                                                |
| `docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md:137–152,259–262`                                                                                            | Communication fact/delivery/engagement independent; sole send seam, permanent occurrence identity versus provider envelope key, immutable replay and producer-owned fence.                                                                     |

### Integration seam, not an additional founder choice

Q01's already-ratified native participant and closed document-request-recipient successor remains necessary. Current P12's enumerated contexts and identity OpenSpec do not acquire it from a fixed deadline. Q11 adds the initial timing result to that same source/PDP admission and its exact owner integration. It does not introduce a second grant engine, anonymous exception, fifth generic context or fake Party.

The owner mapping must identify the initial issuer's source capability and P12 administrative scope/ceiling, if applicable. The recipient's eventual proof and permissions are separate. Do not require the external recipient to be online to issue the request, and do not treat the issuer's file-read/reviewer permission or a service-role credential as issuance authority. The actual source grant type determines continuing grantor dependencies; neither “issuer left, revoke everything” nor “once issued, survive every loss” is a universal rule.

## 3. Material findings and exact amendment proposals

### O01 — Source issuance must be one explicit authority effect

**High consequence; high conditional plausibility.** The ordinary word “issue” overlaps request creation, access admission, token minting and sending. Conflation can grant too early, reset authority or claim delivery that did not occur. Evidence: ADR0025:28–50; P6:137–152,259–262; Q10 ADR:18–31.

**Required clause:** “For the selected ordinary profile, initial access issuance SHALL mean the source-controlled durable act first admitting finite unfinished access for the exact tenant/environment/request/purpose/recipient authority revision. Resolve and preserve the original finite end in that effect. Draft creation, scheduling, preparation, provider submission/delivery, credential issue, proof, page visits and task projections SHALL NOT substitute for it.”

This does not require source request creation and access issuance to be different transactions if the owning operation lawfully combines them. It does require an identifiable authorization effect and its immutable outcome. Source planning may exist without issued recipient authority.

**Proof:** draft only; failed source admission; valid issuance without delivery; legitimate combined source operation; wrong tenant/purpose/recipient; zero browser visits. Only valid source admission creates the original interval.

### O02 — A fixed end is a preserved admission result, not a live formula

**High consequence; high plausibility.** Recalculating from today's duration, due date, timezone, recipient state or template makes the end slide. Labeling a freshly recomputed end “original” hides the change. Evidence: Q09 ADR:18–51; Q10 review:204–222; Workflow runtime:31–35,45–51,63–67.

**Required clause:** “Initial issuance SHALL preserve the exact original end and the source-approved policy/calculation inputs, version, temporal interpretation and limit scopes needed to explain and recover it. Subsequent reads, retries, policy/calendar/target changes, re-entry, help and delivery events SHALL NOT recompute a later original end. A chooses end establishment at issuance, not an elapsed-days formula or staff editing authority.”

Avoid freezing a merely displayed draft estimate as authority. Before the first effect, the source must validate current applicable terms and relevant expected revisions. Once the source effect is admitted, replay preserves that outcome.

**Proof:** current policy or requested-by date changes after issuance; old worker replays after deployment; date display zone changes; original outcome remains identical. A source-specific civil/date-only rule must resolve explicitly at issuance; Workflow's scoped defaults are not blanket native authority.

### O03 — Same-effect replay and credential replacement need different identities

**High consequence; high plausibility.** A new secure link legitimately creates a new prepared-message identity under ADR0025:45–50. If that is reused as the request admission identity, every “resend” can become a renewed interval. Provider dedupe expiration, a new workflow run or random retry key has the same danger. Evidence: ADR0025:45–50,112–123; Workflow runtime:45–51; P6:260–261.

**Required clause:** “One original source access-admission effect SHALL converge across concurrent issuers, retries, lost responses, worker restarts and provider/dedupe-key expiry. Bind a stable source-owned occurrence identity to immutable effect terms; incompatible reuse fails without silently choosing a winner. A new credential or prepared message gets its own required identity while retaining the unchanged source admission/end. A new transport or workflow identity SHALL NOT authorize another source admission.”

No generic one-request-per-person rule is invented. A genuinely new source-authorized request or changed authority follows its explicit source procedure; Q11 supplies no shortcut to create one merely to avoid expiry.

**Proof:** two callers issue the same source occurrence; lost commit reply; provider key expires; link replaced; hash/namespace version changes; same key with changed recipient/end; a copied task. Only the deliberate authorized source effect determines whether genuinely new work exists. Replay disclosure independently requires current permission.

### O04 — Initial timing must be finite, usable and source-qualified before admission

**High consequence; medium/high plausibility.** A missing duration can become null/infinity, an expired absolute date can be clamped to now-plus-default, or a sampled timestamp can survive a long lock wait. These turn a selected clock model into unauthorized timing. Evidence: Q10 C02/C05 and review:231–242; Q06 ADR:35–45; Workflow runtime:31–37,63–73.

**Required clause:** “Activation SHALL require a complete qualified initial calculation yielding a finite applicable end. A usable initial admission requires a positive remaining interval at its qualified authoritative occurrence, with all current issuer, recipient, purpose and independent limit checks. Missing/nonfinite/invalid terms SHALL NOT be replaced by a guessed default, infinite authority or automatic rollover. Qualify current time and relevant state after waits and the exact occurrence/commit/recovery boundary.”

This does not select a clock API or require all effects to use a physical commit timestamp. A rollback creates no successful admission; unknown commit needs reconciliation. A committed admission can expire before its response reaches the recipient; the response must reflect current access while preserving the original fact.

**Proof:** exact boundary/equality, invalid/past end, finite overflow, missing policy, concurrent shortening, lock spanning a cutoff, candidate timestamp before cutoff with late commit, rollback, unknown commit and response after expiry.

### O05 — “Fixed” must preserve genuine narrowing without inventing universal revocation

**High consequence; medium plausibility.** An immutable `U` used as permission ignores subsequent revocation; recomputing `min(current caps)` after removal can restore a longer end. Conversely, converting every temporary failure into permanent shortening breaks legitimate recovery. Evidence: Q07 ADR:29–34; Q10 C04, review:218–222; P12:1586–1587,1670–1672.

**Required clause:** “The original end is a ceiling, not authorization. Current source restrictions and genuine applicable shortening remain binding with their actual scope and provenance; removing their cause does not silently restore an ended or shortened authority. An explicitly reversible restriction or temporary representation outage may clear only under its owner contract within unchanged still-valid authority. Q11 creates no new edit or restoration power.”

An unfinished-only narrowing affects eligibility for Q10 transition while unfinished; it does not become an independent completed cap through shorthand. A genuine overall/purpose/security bound survives. Actual grant type determines continuing issuer/delegation dependency.

**Proof:** original end followed by genuine overall shortening/removal; stage-only narrowing; temporary unavailable preview then recovery; issuer departure for each admitted type; stale derived expiry after valid completed transition. Do not equate all of these cases.

### O06 — Pre-entry completion is not permission to issue access retroactively

**High consequence; medium plausibility.** Q10 permits fulfillment before any visit, but this can be misread as “send access later for an already-completed request and use the old completion.” Evidence: Q10 ADR:25–31,46–57; Q07 ADR:22–40; Q06 ADR:22–28.

**Required clause:** “Completed admission requires the exact ordinary source admission, policy and recipient eligibility to exist in the authoritative causal order at the actual fulfillment. First issuing access after an earlier fulfillment SHALL NOT backfill that missing eligibility. A valid atomic source operation may establish issuance and fulfillment in its qualified order; a delayed reconstruction may recover proved prior effects. Neither substitutes later issuance, message time or visit for historical authority.”

Do not enforce an arbitrary strict numerical `issuance timestamp < fulfillment timestamp` that rejects a lawful atomic effect at the same timestamp precision. Require causal source order and owner proof.

**Proof:** issued, unvisited request fulfilled while eligible; request completed before any admission; legitimate atomic issuance/fulfillment; delayed projection after `U`; later actual fulfillment after expiry. Source completion remains independently valid without recipient admission.

### O07 — Q09 edits and Q03 corrections cannot reset the access period

**High consequence; medium/high plausibility.** A convenient “extend due date” or “send corrected file” handler can inadvertently update the same `expires_at`. Evidence: Q09 ADR:18–51; Q03 ADR:18–33,44–51; Q10 ADR:33–38.

**Required clause:** “Requested-by targets, hard intake cutoffs, unfinished access and completed ends SHALL retain distinct source semantics. Target edits, corrections, new work, reassignment, copying or reopening SHALL NOT incidentally move the original access end or transfer authority. Exact new source effects require their independently authorized procedure; Q11 chooses none.”

This does not ban legitimate source edits or require duplicate dates. A later selected calculation may use source context at first issuance; it must not turn future target edits into access grants.

**Proof:** target edited later/earlier/removed, undated request, late permitted correction, partial multi-file acceptance, reassign/contact revision, duplicate task and reopen. Preserve exact receipt, current evidence and source authority.

### O08 — Delivery failure is a separate outcome, not a compensation clock

**Medium/high consequence; high plausibility.** A fixed deadline can pass while mail fails. Automatic reissue/clock reset or private attachment fallback hides the operational gap. Equating failure with revoked authority or business cancellation is also wrong. Evidence: P6:152,259–262; Workflow runtime:19,39–51,71–75; Q10 C18.

**Required clause:** “Source issuance, credential preparation, dispatch eligibility, provider outcome, recipient proof and current access SHALL have distinct truthful outcomes. A committed source end continues through delayed/failed/suppressed/unknown delivery unless an independently authorized source restriction changes it. Communication recovery retains P17/P6 ownership and current eligibility; it SHALL NOT automatically extend, revoke, duplicate, attach private files or impersonate a new source admission.”

The originating source may require ready host/recipient/contact/communication capability before initial issuance; that exact owner requirement still applies. Once lawful issuance has committed, later provider failure does not rewrite it. Do not hold source locks while calling providers.

**Proof:** failure before admission; failure after admission before outbox/dispatch completion; provider accepted but response lost; bounce/suppression; duplicate/out-of-order webhook; host becomes unqualified; old prepared message after shortening. Preserve original admission and exact remaining operational problem.

### O09 — Issuance remains a qualified source/P12 capability

**High consequence; medium plausibility.** A fixed-end field is easy to expose as ordinary request CRUD. Reading or reviewing files, possessing a service role, matching mailbox or copying a task does not confer authority to grant external access. Evidence: P12:1542–1545,1552–1587,1670–1672; Q01 ADR:58–87; identity OpenSpec:14–49.

**Required clause:** “Only the exact current source issuance operation, under its registered capability and applicable P12 administrative scope/ceiling, may create the admission/end. Enforce same-tenant/environment/source/request/recipient-purpose relationships and legal immutable transitions across application, SQL/RLS/RPC/definer/service, job and recovery paths. The Q01 compatible private-participant successor must be adopted before this lane activates.”

No initial permission is inferred from Q08's fresh-grant capability; the original source operation must be mapped itself. No unconditional rule about subsequent issuer role loss is invented.

**Proof:** read-only reviewer attempts issuance; staff with wrong administration scope; NHI owner ceiling changes during a wait; cross-tenant references; valid row updated to forged end/recipient; stale service worker; raw public/signed URL; demo/profile-role fallback.

### O10 — Fixed expiry must not be a sweep-dependent source outcome

**High consequence; medium/high plausibility.** An expiry worker that marks every record closed can erase a valid Q10 transition; a delayed worker can also leave expired reads open. Evidence: Q10 C07/C12/C17; Q06 ADR:35–55; Q04 ADR:25–42; Q05 ADR:24–40.

**Required clause:** “Every affected participant operation SHALL evaluate the current source stage, applicable exact end and authority without relying on an expiry sweep. Expiry projections/jobs must be fenced against source transition and relevant restriction revisions. End of unfinished recipient access does not fulfill, reject, cancel, delete or stop independently authorized source work.”

Preserve current metadata/history/full/range/conditional/resume/replay enforcement, inherited long-stream expiry and feasible revocation, and honest copy limitations. A stable end cannot excuse stale cached authority.

**Proof:** expiry job loses to timely fulfillment; stale read cache; request after exclusive end before worker runs; correction finalization crosses end; source scanning/review after browser/access expiry; stream/response replay across scope/end changes; retained shared bytes.

### O11 — UX must expose the real fixed opportunity without promising completion or recovery

**Medium consequence; high plausibility.** The eventual period must accommodate the real journey, including staff review. “You have X days” or a prominent unchanged date can hide a current cap. “Expired” can falsely describe a session problem or a lost reply. Evidence: Q10 ADR:59–70; Q06 ADR:47–55; Q09 ADR:31–36,53–56.

**Required clause:** “Authorized users SHALL receive truthful, accessible explanation of the currently applicable unfinished boundary and separate requested-by target, proof/session and delivery states. Explain Q10's conditional completed transition; receipt is not fulfillment and review delay is not recipient lateness. Preserve confirmed work and reconcile unknown outcomes. At real expiry offer owned help without an unselected extension, new grant, direct attachment or guaranteed Q08 outcome.”

Before issuance, show authorized staff the selected calculation/terms and known consequences, including an exact end when determinable; show the resolved actual end after admission. If ordinary passage of time under unchanged terms makes the final value differ from an estimate, do not add a gratuitous reconfirmation. Material source/recipient/terms changes require the governing command's renewed validation. No extra date editor, modal, countdown ceremony or general activation dashboard follows.

**Proof:** late delivery, low bandwidth, long review, expired proof but valid source, wrong account, lost reply, partial history/preview outage, keyboard/AT/reflow/localization and truthful date precision. No empirical usability claims follow from static design.

### O12 — Restore and policy migration must preserve original issuance and adverse history

**High consequence; medium plausibility.** Missing old issuance terms may be backfilled with current policy; rollback might run an older relative-expiry worker, or recreated credentials might become new admission identity. Evidence: document authority:25–35; Q10 C20/C21; Workflow runtime:25–27,45–51.

**Required clause:** “Adopt prospectively in qualified cohorts with compatible source writers, readers, expiry jobs and restore/recovery paths. Do not infer old initial admission or limit scope from email/task timestamps, synthesize new issuance from missing records, or recompute old ends from current defaults. Preserve source effect identity, original terms and genuine later restrictions through deployment, restore and derived repair; uncertain history denies the affected authority.”

Uncertainty must not erase independently valid source work or unrelated tools. No automatic “repair by extending” or global emergency fallback is selected.

**Proof:** old/new worker overlap, backfill lacking provenance, restore after revocation, old credential reappears, original message with new action key, kill-switch/rollback while valid completed authority exists. Separate source facts, derived projections and current legal authority.

## 4. Proposed corrected decision

For new ordinary Private Document Requests, the requesting source shall resolve and preserve one finite unfinished-access end at its authoritative initial access-admission effect for the exact recipient and purpose. This is a source/P12 effect, not message delivery, protected credential issuance, recipient proof, a visit, upload or a task flag. It preserves the exact original timing outcome and the policy/limit-scope provenance needed for recovery. It does not choose a duration or formula.

The effect must be durably recoverable, current and correctly scoped under the actual issuance capability and source ordering. The same source occurrence converges across concurrent commands, lost replies, retries and new technical credentials; changed incompatible terms cannot silently replay or manufacture a new interval. No nullable/infinite default, stale clock, rewritten due date, refreshed link, pause, help action or deployment establishes a later original end.

Current source permission and genuine applicable restrictions remain mandatory. Q10's unfinished-only scope and qualified timely transition to Q07 remain unchanged; a valid completed admission is not clipped by an obsolete unfinished deadline. Eligibility must exist at actual fulfillment, including completion before a first visit; later initial issuance cannot invent historical admission. Existing specialized, unknown and genuinely overall limits retain their owners and scopes.

Delivery/proof/session, receipt, hygiene, source acceptance, business completion, participant admission and retention remain separate. Fixed-end expiry governs current participant access without rewriting source facts, deleting retained evidence, restoring superseded files or stopping separately authorized source work. The current request UI and existing source/PDP/P17/P6/custody infrastructure remain the permanent path. Exact finite calculation, native owner adoption, real-role/race/provider/browser proof and useful cohort timing remain activation gates. No extension, recovery, reminder, scheduling or fresh-access timing policy is selected.

## 5. Twenty-two-category coverage

This table maps the complete requested review surface to Q11-specific consequences; it does not claim independent runtime testing for any category.

| Category                                     | Q11 consequence and controlling findings                                                                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Problem validity, necessity, alternatives | Fixed issuance makes finite task access predictable; strongest B preserves late-entry working time. The eventual period needs cohort evidence; A has a real delay cost. O01/O11.                             |
| 2. Brittleness                               | Do not anchor to mutable `sent_at`, task creation, provider state or generic callback. O01/O02/O03.                                                                                                          |
| 3. Technical debt                            | Keep one source admission with exact durable result; do not create app-local TTL checks, a second grant resolver or a replacement identity store. O03/O09/O12.                                               |
| 4. Edge cases                                | No visit, pre-entry completion, equal timestamps, response after expiry, missed send, unknown commit and invalid absolute end have explicit non-renewing behavior. O04/O06/O08.                              |
| 5. Footguns                                  | Resend, date edit, copy/reassign, retry and “fix expired” cannot become hidden extensions. O02/O03/O07.                                                                                                      |
| 6. Tenant safety                             | Exact environment/tenant/request/recipient revision and host authority must bind the effect and every recovery. O01/O09.                                                                                     |
| 7. Database/RLS/authorization                | Fixed end must not be writable through generic CRUD; current P12 issuer and legal transitions govern actual SQL/RPC/service paths. O04/O09/O10.                                                              |
| 8. Overengineering                           | No activation timer for selected A, general policy builder, extra confirmation, new UI surface or global lock. O01/O03/O11.                                                                                  |
| 9. UX/UI/friction                            | Real end, separate requested-by, timely receipt vs pending review, credible help; no unsupported full-period claim. O11.                                                                                     |
| 10. Source of truth/domain invariants        | Source admission/end owns permission; P6 delivery and credentials are different authorities; Q10 stage scope remains. O01/O05/O06/O08.                                                                       |
| 11. Hidden coupling                          | Recipient interval must not follow cookie/token TTL, provider dedupe retention, a human worker owner's lease, or current template policy. O02/O03/O09.                                                       |
| 12. Failure modes                            | Failure before effect, committed effect with lost reply, and delayed delivery need different recovery. Preserve independent work; do not compensate with new authority. O04/O08/O10.                         |
| 13. Lifecycle/time/concurrency/idempotency   | One source occurrence, current checks after waits, exact initial/end provenance, causal pre-entry completion, fenced expiry. O03–O07/O10.                                                                    |
| 14. Data integrity                           | Preserve original timing facts and correction lineage; no timestamp fabrication, current-default backfill or old-candidate revival. O02/O06/O07/O12.                                                         |
| 15. Security/privacy                         | Issue permission distinct from read, current metadata/byte checks, no raw selector/address/private policy in diagnostics, no attachment fallback. O08–O10.                                                   |
| 16. Scalability/performance                  | Indexed exact effect/current-scope lookup and bounded expiry/recovery work; no all-history scan per read, tenant-global admission lock or provider I/O under source transaction. O03/O10/O12.                |
| 17. Operational burden                       | Delivery failures consume real time. Accountable source help and qualified useful defaults must exist before activation; no guaranteed extension. O08/O11/O12.                                               |
| 18. Observability/audit                      | Durable source admission and original terms separate from minimized technical/delivery evidence; safe distinctions among rejection/unknown/committed/expired. O01/O03/O08.                                   |
| 19. Dependencies/integrations                | Q01 native successor and P12 mutation path remain explicit; P17/P6 and exact protected host/credential behavior remain owners. O03/O08/O09.                                                                  |
| 20. Migration/rollout/upgrades               | No new-current-default backfill, no generic legacy `expires_at` reclassification, no stale worker renewal, no restore resurrection. O12.                                                                     |
| 21. Testability/trace/proof                  | Deterministic source-order tests plus real roles, RLS, provider outcomes and browser/AT journeys; adjacent mocks do not certify native Q11. All findings.                                                    |
| 22. Other hazards                            | A source clock choice is not evidence of legal compliance, guaranteed delivery, recipient reading, accessible contents or deployment. A selected model still has unresolved finite calculation. O04/O11/O12. |

## 6. Minimum proof bundle before activation

The individual finding proofs above are required cases. The integrated acceptance bundle should additionally demonstrate:

1. **One legal initial effect:** exact source capability, recipient/request revision, admitted terms and usable finite end; transaction rollback produces none. A legitimate simultaneous source creation/admission does not need artificial extra ceremonies.
2. **One stable result across transport:** concurrent callers, unknown commit, new credential/message identity, resend, provider-key expiry and worker/deploy changes recover the original effect/end without disclosure outside current permission.
3. **Exact temporal source order:** current time/state after every relevant wait, cutoff equality, same-precision atomic effects, delayed consumers, genuine restriction races and separate source completion without admission.
4. **No accidental lifecycle reset:** due edits, correction, visit, return, proof refresh, pause, assignment changes, copied task, reopen and later remediation retain the selected boundaries unless a separately admitted source operation lawfully says otherwise.
5. **Distinct restrictions:** original end, actual later scope-specific shortening, true overall caps, reversible restrictions and temporary representation failures are neither merged nor inferred from a generic status.
6. **Every real door:** authorization/RLS USING and WITH CHECK, columns, views/RPC/definer/service, jobs/replay, cache, metadata/counts/history, preview/original and stream/resume/conditional paths. Unexpired source time alone grants nothing.
7. **Source custody survives recipient expiry:** previously admitted scanning/review/retention may continue through independent authority; actual later business fulfillment does not grant expired recipient reading.
8. **Communication truth and usable recovery:** before/after-commit failure, suppression, provider uncertainty, new link, host change, recipient contact revision and help all preserve their own ownership and exact original end.
9. **Prospective release:** complete finite numerical/calculation policy, compatible old/new workers and actual permitted cohorts; migration/restore cannot manufacture historical admission or erase later adverse facts.
10. **Real recipient/reviewer journey:** users understand Requested by versus unfinished access, receipt versus completion, source versus session expiry and owned help. Include late discovery, delivery failure, long review, interrupted mobile connection, localization and assistive technology. Record evidence limits.

These are proof requirements, not claims of passing tests. Performance and operational thresholds must be source-owned and measured; this note does not invent a numerical SLA.

## 7. Remaining decisions and recording boundaries

Still unselected: the initial finite calculation and values, elapsed/civil/date conventions where applicable, active extension or post-expiry recovery powers, contact/reassignment successor behavior beyond existing owner rules, notification cadence, scheduling and Q08 fresh-access timing/repetition. Some are source-specific qualification, not necessarily universal founder product settings.

The exact native issuance effect/capability and P4/P12 participant successor must be reconciled through their canonical owner sources and declared OpenSpec projections at the authorized specification stage. Generated Workflow OpenSpec is maintained through `docs/prds/workflow-studio/contracts/requirements.json`, not edited as independent authority. Existing identity OpenSpec and active change remain implementation/intent evidence for their own scope, not proof that the no-membership lane exists.

No additional glossary term is required merely for “issuance” if the existing Unfinished Request Access Deadline and Private Document Request definitions can state this exact boundary plainly. Avoid introducing a second authorization taxonomy to resolve an overloaded word.

This note did not reread every Phase18/21/26/28 specialized purpose end to end or inspect production state. The qualified conclusions concern the new ordinary Q11 lane; specialized contracts are expressly preserved. Current runtime work is being independently audited by the sibling reviewer, and this note makes no runtime success claim. Proposed amendments await the founder's ratification through the parent synthesis.
