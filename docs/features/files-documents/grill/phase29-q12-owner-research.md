# Phase 29 Q12 — standard unfinished-access period: owner research

Research date: **2026-10-21, Asia/Bangkok**. Research only; no Q12 answer is selected. Parent reports Conrad's explicit ratification of Q11 A and its complete amendments on this date and is recording that ratification. The first source read still showed the prior selected/reviewed status; that in-progress recording lag is not an unresolved founder decision. Q01–Q11 are treated as ratified intent, not implemented or qualified behavior.

Canonical checkout: `/home/conrad/code/core`, Ubuntu-24.04, user `conrad`. HEAD reverified as `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. This note is the only written artifact. No tests, provider calls, canonical changes or publication were performed.

## Recommended next decision

Choose **one complete standard initial profile** for the new ordinary Private Document Request, rather than separately asking whether to use a duration, then hours versus dates, then a number.

Suggested question:

> For a new ordinary private document request, how long should unfinished access normally remain available from the source's original issuance: up to 30, 60 or 90 elapsed days?

Each option is one complete profile: an exact elapsed interval from Q11's original authoritative source occurrence, resolved once at issuance, subject to genuine earlier limits and current permission. “Day” means 24 elapsed hours, not a calendar month, local end-of-day or working day. This interpretation belongs in the question rather than being silently chosen during implementation.

**Recommendation: 60 elapsed days (1,440 hours).** This is an explicit product judgment that balances more opportunity for delivery, recipient work and source review against keeping unfinished authority bounded. It is not an empirically proven optimum, a security standard, a legal period, or a claim that ministries generally need 60 days.

Thirty days is a credible tighter alternative. Ninety days is a credible longer alternative. There is no owner constraint forcing 30 or 60; selecting the middle option should be justified by the chosen journey and tradeoff, not merely because it is the middle number.

| Option                                | Complete ordinary profile                                                                                                                    | Practical tradeoff                                                                                                                                                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — 60 elapsed days (recommended)** | Resolve the nominal unfinished end at original source issuance plus 1,440 elapsed hours, under the preserved applicable source restrictions. | Gives more room than 30 days for delivery, work and review without choosing a three-month unfinished opportunity. Current access can remain available longer than under 30 days, so the eventual cohort must justify the interval. |
| **B — 30 elapsed days**               | Original issuance plus 720 elapsed hours under the same safeguards.                                                                          | Tighter potential unfinished lifecycle; delivery delay, late discovery and reviewer delay consume a larger share of the opportunity. It is not inherently unsafe or unusable, but may fit fewer ordinary workflows.                |
| **C — 90 elapsed days**               | Original issuance plus 2,160 elapsed hours under the same safeguards.                                                                        | More room for longer collection/review work. Leaves the unfinished opportunity available longer where no other restriction ends it; should be an intentional preference, not assumed necessary.                                    |

There is no new first-entry substage, activity reset, renewal or discretionary date editor in any option. Present the selected value as the **standard ordinary profile**, not an editable default with an unspecified maximum. Do not imply that staff can select another number per request merely because a UI calls it a default.

## Why this is the next useful single choice

Q10 settled **what the initial limit governs**: the unfinished stage, not a universal ceiling on completed reading. Q11 settled **when the original end is established**: the source's original access-admission effect, not delivery, first visit or credential replacement. The initial numerical/calculation profile remains expressly unselected. A complete elapsed-time profile closes that product gap without repeating either decision.

The choice legitimately bundles the number and its exact calculation convention: a bare “60 days” would otherwise hide a material calendar decision. These are components of one temporal policy, not unrelated authority choices. Date editing, extension, reminders and Q08 fresh-access terms remain separate.

The recommendation gives weight to facts already chosen about the journey: the fixed original period includes time before first entry and source review; receipt alone does not cause fulfillment; review after expiry does not automatically grant completed reading; and no extension capability is assumed. Longer initial opportunity can reduce reliance on a later unselected recovery power. This is a causal design argument, not measured evidence that such delays will occur at a particular rate.

My initial bounded recommendation considered 30 days to prioritize the shorter possible unfinished lifecycle. On comparison of the complete 30/60/90 profiles, I prefer 60 for the ordinary collection-and-review journey under the current no-assumed-extension constraints. Thirty remains a fair answer; no source fact was discovered that makes it wrong.

## Exact owner evidence

All repository paths are relative to `/home/conrad/code/core`.

| Source read                                                                                                 | What it settles or leaves open                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/features/files-documents/docs/adr/0011-fixed-unfinished-deadline-at-source-issuance.md:18–36`         | Source admission fixes the original finite end and its provenance; count, calculation and a staff date editor were not selected. Same-intent retry recovers first-admission outputs.                                                                                |
| Same ADR `:38–74`                                                                                           | Current source/P12 authority, genuine restrictions, causal fulfillment, independent delivery/proof outcomes and real qualification remain. No deadline editor, active recovery or fresh timing power follows.                                                       |
| `docs/features/files-documents/docs/adr/0010-finite-unfinished-and-completed-request-stages.md:18–38,53–70` | Initial end is unfinished-only; exact timely eligible fulfillment transitions to Q07 under independent caps; real later fulfillment does not revive authority. Review may outlast access and needs owned help, not an assumed extension.                            |
| `docs/features/files-documents/docs/adr/0007-fixed-completed-request-access-end.md:22–40,49–66`             | Completed end is at most fulfillment plus 720 elapsed hours, with its own historical/current rules and genuine earlier caps. It is not a guaranteed interval or an initial-request default.                                                                         |
| `docs/features/files-documents/docs/adr/0008-source-authorized-fresh-completed-access.md:19–39,71–76`       | Fresh completed reading requires a prior ordinary admission and its exact new authority; no reopening of intake. Its timing/repetition settings remain unresolved.                                                                                                  |
| `docs/features/files-documents/docs/adr/0009-requested-by-targets-and-authorized-late-intake.md:18–43`      | Requested-by target alone neither grants nor ends access. Actual source limits and finite authority apply. Timely receipt awaiting review is not recipient overdue.                                                                                                 |
| `docs/features/files-documents/CONTEXT.md:89–99`                                                            | Document Request Due Date and Unfinished Request Access Deadline are distinct established concepts.                                                                                                                                                                 |
| `docs/prds/workflow-studio/01-product-and-experience.md:65–77`                                              | Fourteen-day expiry is a suggested limited-task token/product default with reauthorization language; it is not a selected native Q12 rule. Protected use remains purpose-specific and current.                                                                      |
| `docs/prds/workflow-studio/03-runtime-and-recovery.md:55–75`                                                | Timers do not imply approval; exact source rules govern late acceptance. Eligible Studio clock/calendar defaults are scoped, fixed expiry continues through pause, and compensation is a separately authorized source operation.                                    |
| `docs/prds/workflow-studio/12-owner-bindings-and-decisions.md:68–85`                                        | WS-Q02 participant admission and WS-Q08 timing/default qualification are exact owner gates, not filled by a generic default.                                                                                                                                        |
| `docs/prds/workflow-studio/contracts/requirements.json:196–210,306,388–392`                                 | Prospective bindings, source-owned time interpretation, common native document/review qualification and compatible P4/P12 private admission remain required. Generated OpenSpec inherits these sources; no separate default is invented.                            |
| `docs/adr/0037-scanner-safe-exact-artifact-access.md:83–88`                                                 | Phase18's fourteen-day guest grant and thirty-minute document session are specialized defaults. They do not select ordinary request access or offer tenants a generic TTL policy builder.                                                                           |
| `docs/prds/sitestacker-parity/roadmap.md:4229–4303`                                                         | Phase29's current scope retains distinct custody/business meaning, source-specific access, independent retention and actual release proof. It supplies no universal initial request period.                                                                         |
| `docs/prds/program-roadmap/owner-constraints.md:154–225`                                                    | Preserve generated-document, expense evidence, collaboration and records-package purpose/access/retention boundaries. A new ordinary profile cannot overwrite their narrower or different clocks.                                                                   |
| User Phase29 attachment, `Pasted text.txt:219–231`                                                          | Requested complete bounded request/review journey, responsible reviewer, exact revision, authority/expiry/recovery and native use without an installed configurable workflow. It specifies no number. Later Q01–Q11 refine its originally proposed access behavior. |

Q01–Q06 remain binding: exact confirmed recipient/current proof, purposeful custody rather than a drive, current-own-file preview/original/history, correction fencing and source-owned fulfillment. Q12 changes none of those rights; its numerical result is only one input to current source authorization.

## Boundaries the question must make explicit

### A standard source profile, not a menu of staff override powers

The selected value applies prospectively to the **new ordinary source profile being defined**. Existing specialized contracts retain their own meaning, assurance, timing and source rules. This does not mean every private document anywhere receives the chosen duration.

“Default” must not silently mean a user-editable field with no maximum, tenant-wide arbitrary TTLs, per-request date discretion or a new policy builder. A different later profile or deliberate authority change requires its own qualified source terms; Q12 does not grant the power to create it.

The actual source issuer, scope, recipient revision and approved terms still govern. Do not expose the nominal date to an unqualified recipient merely to explain the period.

### Earlier limits retain their exact action and stage scope

The chosen interval is **up to** the selected elapsed period while the request remains unfinished. Genuine earlier limits that govern that access can shorten it; actual revocation can end it sooner. Preserve original resolved terms and genuine later narrowing. Removing a cap, changing policy or clearing a temporary failure must not regenerate a later original end.

Do not indiscriminately take the minimum of every date on the source record. A requested-by target is not an access cap. A hard upload cutoff may govern submission without ending otherwise admitted reading. A true overall/purpose/security limit can affect both stages. Each retains its declared action/stage/purpose scope.

The ordinary unfinished deadline does not become a completed cap merely because its value was set first. Q10 remains unchanged.

### A longer unfinished allowance is not a longer completed allowance

Eligible early fulfillment immediately uses Q06/Q07's completed read-only rules. For example, if a request completes soon after issuance, a 60-day unfinished profile does not guarantee the recipient 60 days of total access. Its original completed end is governed by the actual fulfillment plus at most 720 elapsed hours and true independent caps.

For explanatory bounds only, if `I` is original issuance, `T` the selected finite unfinished interval and `F < I + T` an eligible fulfillment, then `E <= F + 720h < I + T + 720h`, before independent restrictions. Thus the standard 30/60/90 profiles permit original two-stage lifecycles shorter than 60/90/120 elapsed days respectively where no earlier cap applies.

Those sums are **not new universal overall caps**, a guarantee, retained-copy lifetimes or bounds on separately authorized Q08 fresh access. They describe the existing conditional relationship; do not present them as extra selected product controls.

### Long, missing or changed requested-by targets

An undated request can still use the standard finite issuance profile. No due date needs to be invented. A target beyond the prospective access end exposes a mismatch that authorized staff must understand; do not silently move the end, force the target to fit, or promise work can still be submitted then.

Q12 should not quietly choose a new universal “reject every target after access end” rule or a mutable `due date + grace` algorithm. Actual source admission and cohort qualification must make the promised request workable. The owned source can disclose the conflict and prevent unsupported claims under its existing command contract; no target-edit or extension power is implied.

If the ordinary cohort cannot support the real intended work without longer access, that is a reason to revisit the chosen product profile explicitly or retain the affected lane as unqualified, not a license to clone requests, change SQL dates, assume Q08 or call a broken journey complete.

### Expiry and recovery remain as already decided

Delivery failure, absence, sign-in trouble, source review, a paused workflow, resends, correction and return visits consume time; they do not restart the fixed source end. First receipt is not fulfillment. An actual source completion after unfinished authority ended can remain a valid business outcome without recipient read admission.

Qualified reconstruction of an earlier committed eligible effect keeps original time. Actual late issuance/completion cannot become timely by using a historical business date, provider timestamp or processing time. Q08 requires its own prior-admission conditions and cannot be promised as active-request recovery.

No document deletion, retention schedule, completed-review result, reminder cadence, forced download or personal storage entitlement follows from the number.

## Why not use other options for this question?

- **Fourteen days:** an existing suggested Workflow value and specialized Phase18 guest-grant example make it familiar, not adopted for native request issuance. It can be a future founder preference, but making it the automatic low option risks presenting inherited authority that does not exist. Thirty is a more useful tighter comparator for this complete collection/review question without claiming fourteen is inherently unusable.
- **Requested-by plus a buffer:** a coherent different formula could be designed, but it adds absent/past/distant-target cases, source/date provenance and authority implications. It is not a necessary fallback or an already-admitted extension. The simple elapsed profile is the recommended permanent ordinary rule.
- **Staff chooses an absolute date each time:** this bundles a new administrative power, UI control and policy limits with the duration choice. Q11 left that power unselected. Do not offer it casually as if a number in a form is only presentation.
- **Keep it source-defined without an ordinary profile:** specialized owners already retain their rules. Repeating that fact would leave the ordinary native feature without the complete finite policy Q10/Q11 require.
- **Choose a duration experimentally in production later:** qualification can assess a founder-selected policy, but cannot substitute an unselected number or activate indefinite access. Any rollout must have declared finite terms from the start.

These alternatives are considered rather than asserted impossible. The single next question should keep the fixed ordinary elapsed profile easy to compare.

## Evidence limits and follow-through

No local source, external standard or current usage study establishes that 30, 60 or 90 days is empirically optimal. The owner research is sufficient to present a numerical founder choice as product judgment. It is not sufficient to claim the resulting workflow is qualified.

After selection, perform the standing adversarial review of the exact profile: calculation and boundary precision, applicable cap scope, same-intent recovery, source review outlasting access, long-due mismatch, current proof, localized display, privacy-safe entry, migration and cohort usefulness. Preserve Q11's original source identity and end outputs. The profile should then be ratified with its required amendments before its later owner/OpenSpec integration.

The next unresolved authority branch after that profile can address active-expiry recovery or other outstanding lifecycle capability; it must not be smuggled into Q12 as a convenient workaround. Fresh completed-access timing/repetition under Q08 also remains a distinct future choice. Parent owns the question and all canonical ratification records.
