# Phase29 Q07 — a finite default for completed-request access

Bounded research, 2026-10-20. Conrad has explicitly ratified Q06 and all its amendments; the parent is recording that unchanged. Q01–Q06 are settled grooming intent. This note proposes a Q07 policy question and recommendation only. No duration, anchor, renewal rule, specification, implementation, provider operation or test is adopted here.

## Recommendation: ask for one complete default policy

Recommend **up to 30 elapsed days from the authoritative normal-fulfillment instant**, for a prospective ordinary-request source policy and only where the intended recipient's source eligibility is still valid when fulfillment occurs.

This is a maximum, **not a 30-day guarantee**. Every already applicable source/purpose/privacy deadline or restriction remains controlling if earlier. Completion after source access already ended creates no new access. A shorter browser session may require Q01-qualified re-entry, but session renewal does not move the source end.

Treat duration plus anchor as one understandable default-policy choice:

> **For an ordinary request that completes while its recipient remains eligible, should completed read-only access normally last up to 30 days from completion, up to 14 days, or keep the source access-end date already declared before completion? Earlier binding limits and revocation still apply.**

| Option                                                     | Practical behavior                                                                                                                                                                         | Tradeoff                                                                                                                                                                                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Up to 30 days from normal completion (recommended)** | A new prospectively bound source policy resolves the completed-mode maximum once from the source completion event. Earlier applicable limits win.                                          | Gives a modest follow-up interval measured from when work actually finished, while keeping the request finite. More continuing exposure/serving than 14 days; no observed demand or safety threshold proves 30 is optimal.                  |
| **B — Up to 14 days from normal completion**               | The same anchor/eligibility/cap rules, with a shorter ordinary maximum.                                                                                                                    | Less ordinary post-completion availability. May be sufficient for prompt follow-up, but people returning later depend sooner on the qualified help route. It is not justified merely by P18 or P34 also mentioning 14 days.                 |
| **C — Keep the already-declared source access end**        | Completion closes ordinary writes but does not create a completion-relative read schedule. Remaining access ends at the same applicable fixed source end, subject to earlier restrictions. | Least schedule change and avoids extending a previously fixed end. Follow-up time depends on when review finishes: it can be very short, or longer than A/B. Requires that the original finite end was actually qualified and communicated. |

**Why A:** the selected completed view exists for follow-up after the organization finishes its work; a completion-relative maximum makes that purpose easier to explain than an interval already mostly consumed during review. Thirty days is a product judgment offering more room for ordinary calendar disruption than two weeks while remaining a task-specific interval. It is not a vendor consensus, legal standard, measured ministry cadence or support-service promise.

**Why not make 90 days a recommended ordinary option now:** it is technically coherent and may fit some source purposes, but it substantially lengthens ordinary availability without evidence here of quarterly retrieval needs. Ninety days is not inherently unsafe; the case for that broader default has not been established. A source-specific longer policy would need explicit qualification rather than an unexamined global choice.

The table offers three coherent policies, not independent toggles to combine. The hard-cap/eligibility invariant is common to all and not another founder vote. If the parent wants to minimize the interview further, the only meaningful simplification is to ask completion-relative maximum versus unchanged pre-existing end first, then pick the number. My primary recommendation is the complete-policy question above so the founder can decide a concrete default once.

## Resolve the Q06 tension explicitly

Q06 deliberately left the anchor/duration unresolved while forbidding incidental renewal and resurrection. A completion-relative policy can fit that decision **only as an explicit prospective source rule**, not as a convenient post-completion token refresh.

There is one source access policy. Its declared rules determine how active and completed states resolve permitted actions and their ends. This is **not** a recommendation for a second grant taxonomy, new token kind or separate permission engine.

- If the source prospectively says that normal eligible fulfillment resolves a completed-read maximum from that event, doing that once implements the declared policy. It is not sliding expiration from later activity.
- An already binding absolute expiry, purpose ceiling or restriction remains binding. Do not relabel an existing `expires_at` as a “soft active-mode date” after the fact so it can be exceeded.
- A source's ordinary pre-completion scheduling rule can differ from its declared completion rule only if that meaning is explicit in the prospectively adopted contract. Unknown legacy field semantics cannot be guessed.
- An old fixed-end request does not acquire A automatically. Adoption/backfill needs an explicit bounded owner migration decision; Q07 should default to prospectively admitted requests and preserve existing exact obligations.
- If recipient source authority was already ended, revoked, canceled or otherwise ineligible when the source completes, the completed outcome remains valid under the source's authority but no completed-read window opens.

Conceptually, for an eligible prospectively covered request:

`completed maximum = authoritative normal completion instant + selected interval`

`effective access end = earlier of that maximum and every applicable binding source/purpose end`

Live restriction/revocation may end access sooner. This notation explains semantics, not a proposed table schema. If an applicable binding cap leaves one day, the result is **one day**, and the UI must communicate that actual end—not “you have 30 days.”

## Concrete examples that expose the policy

| Case                                                                                     | A's proposed result                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valid ordinary source authority at completion; no earlier binding end                    | Completed reads can remain eligible until the one resolved 30-day maximum, subject to live permission/safety.                                                                                                  |
| Completion occurs one day before an existing binding purpose/access end                  | Access ends in one day. A does not silently overwrite the earlier end.                                                                                                                                         |
| Source access ended yesterday; staff completes today                                     | Record the completion; grant no new recipient access. Q06's independent source-work rule remains intact.                                                                                                       |
| Recipient is logged out or browser session expired, but source eligibility remains valid | The source can resolve the prospective completion maximum without requiring an open browser. The recipient must later pass Q01's qualified current entry/proof checks; the clock does not wait for that visit. |
| Completion event delivered or replayed five days late                                    | Use the authoritative completion instant, not handler/notification/first-view time. No extra five days.                                                                                                        |
| A duplicate completion callback, page open, login or download occurs                     | Keep the same bound end; no sliding extension or new grant.                                                                                                                                                    |
| Security revocation or privacy restriction occurs before the date                        | Enforce that earlier restriction across the affected representations; the visible date is not an override.                                                                                                     |
| Later source remediation/new work is created                                             | Preserve old completion/access evidence. The new work needs its own explicitly qualified scope and timing; it does not reset the old window automatically.                                                     |

## Exact policy details to make the proposal reviewable

1. **Anchor:** the immutable authoritative normal-fulfillment event/time from Q06, bound to the exact source/request/policy version and relevant recipient authority. Not last upload, review-page open, email delivery, job processing, first return or mutable `updated_at`.
2. **Interval meaning:** propose elapsed 24-hour days, not working days or a calendar month. For A, that is 30 × 24 hours from the source instant. Show the actual resulting local date/time and timezone. This avoids silently importing business calendars or end-of-month rules; it remains a proposed interpretation for the chosen policy.
3. **Boundary:** protected reads are allowed only before the effective end and while every other current authorization condition passes. At/after the end, Q06/Q04 denial and stream rules apply. A cleanup scheduler's timing is not enforcement.
4. **Eligibility at completion:** require still-valid source recipient/purpose eligibility, not an active browser session or fresh email merely because the source completed. Q01's required current proof governs subsequent protected entry/read. A known expired source grant cannot be repaired by this transition.
5. **Relevant earlier limits:** preserve actual binding source purpose, privacy/security, recipient-authority and access constraints. Do not import invitation/session TTLs as the completed-read period, nor treat a valid session as authority beyond the source end.
6. **Pin once:** the admitted policy and source completion evidence resolve the maximum once; retries and projections retain it. No `now + 30 days` on reads or reauthentication.
7. **Prospective adoption:** apply only to the exact newly admitted source cohort bound to this policy; do not expand old grants or fabricate completion evidence. Existing specialist/current owner contracts keep their own rules.
8. **Truthful display:** state the actual effective date and that earlier source restrictions may apply; do not claim a guaranteed uninterrupted 30-day service, permanent status/history or automatic renewal.

## What remains a separate decision

- Active/open-request access duration and submission due-date policy.
- Invitation/OTP/proof issuance lifetimes, browser session timeouts and proof-reuse freshness.
- Explicit renewal, extension, emergency recovery or post-expiry access requests.
- Whether any permitted new source work receives another independent policy.
- Expiry reminders, completion emails, warnings, countdowns or automatic communication.
- Cancellation, rejection, withdrawal and compromise policies beyond existing owner requirements.
- Source retention, legal/records periods, holds, disposal and preview-rendition lifetime.
- Per-tenant arbitrary TTL settings or a policy builder.

Keeping these separate does not permit activation with missing dependencies. Q06 still requires a complete finite source access contract; unresolved active eligibility or a missing applicable cap blocks the affected profile rather than producing an unlimited fallback.

## Current owner evidence

Repository paths are relative to `/home/conrad/code/core`, Ubuntu-24.04 as conrad. HEAD verified `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Relevant governing subsections were re-read; no runtime or hosted-policy behavior is certified.

| Source                                                                                                                 | Constraint on Q07                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/features/files-documents/docs/adr/0006-bounded-completed-request-access.md:19–49` and Q06 review C05/C09/C10/P09 | Finite source policy/end required; duration/anchor intentionally unresolved; no incidental renewal; source work may complete after recipient access ends without restoring that access. Explicit future anchor adoption remains open. |
| `docs/features/files-documents/docs/adr/0001-confirmed-recipient-private-document-requests.md:25–56`                   | Request/purpose/recipient proof, current protected-operation checks, distinct source/worker/session authority; expiry/revocation fences participant access.                                                                           |
| `docs/features/files-documents/docs/adr/0004-submitted-original-download-and-current-source-authority.md:19–46`        | Current exact original and all read paths, per-chunk expiry/feasible termination; no future copy recall or permanent access.                                                                                                          |
| `docs/features/files-documents/docs/adr/0005-current-files-and-participant-submission-history.md:19–50`                | Same current eligible members and minimized history; no older-byte archive or implied duration.                                                                                                                                       |
| `docs/prds/workflow-studio/01-product-and-experience.md:65–77`                                                         | Purpose-limited external task access, each evidence fetch rechecks rights; 14 days is a suggested context-specific standard, not this completed-request decision.                                                                     |
| `docs/prds/workflow-studio/03-runtime-and-recovery.md:53–67`                                                           | Exact source facts, distinct source time/decision time, no approval from clock, owner-specific timers and explicit elapsed/local/business interpretation. Do not borrow generic default semantics into another source.                |
| `docs/prds/workflow-studio/12-owner-bindings-and-decisions.md:68–85`                                                   | Exact owner contract and qualification required; WS-Q08 explicitly retains timer/session/default qualification gates. A source suggestion is not activated behavior.                                                                  |
| `docs/adr/0037-scanner-safe-exact-artifact-access.md:64–88`                                                            | Current artifact authority; immediate cancellation/security fences; P18's 14-day guest and 30-minute session values are specific to official document access, not evidence for Q07's number.                                          |
| `docs/adr/0038-purpose-owned-records-schedules-and-verified-disposal.md:20–55`                                         | Access/retention/hold/disposal independent; purpose constraints and policy changes need owned versioned transitions. Completed read duration is not a retention schedule.                                                             |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1586–1587,1643–1669`                      | Current live scope/epoch, expiry-capped inputs, metered egress, per-chunk long-stream expiry and source purpose/residency floors. No second permission brain or token-expiry substitute.                                              |

No current source chooses 30 days for this new ordinary completed-request purpose. The proposed number is explicitly founder product judgment.

## Current official documentation: limited, relevant support

- [Foundant Follow Up Submission Logic](https://support.foundant.com/hc/en-us/articles/4411213334935-Follow-Up-Submission-Logic), opened 2026-10-20, last updated 2025-12-15: describes a submitted form remaining viewable after an administrator marks it complete. This supports a completed-readback use case; it supplies no universal 14/30/90-day access period or guarantee about every original attachment.
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), opened 2026-10-20: recommends server-enforced session expiration and balances timeout choices against application purpose, sensitivity and usability. Its idle/absolute session guidance is not a completed-document access schedule. Session-ID renewal must not be confused with extending a source grant.
- [W3C Understanding SC 2.2.1](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html), opened 2026-10-20: includes a condition for limits longer than 20 hours. That is a criterion-specific accessibility exception, not a recommendation for 14/30/90 days or proof that shorter sessions and the entire flow satisfy accessibility. Preserve Q06's separate timing qualification.

These primary sources establish useful distinctions, not consensus for the proposed count. No recipient research, exposure model, support-volume study or measured ministry calendar was obtained.

## Research conclusion

Recommend the coherent **up-to-30-elapsed-days-from-normal-completion policy**, prospectively bound, with still-valid source eligibility and all earlier binding limits preserved. Present 14 days and retaining the already-declared source end as fair alternatives. Do not promise a full interval when an earlier cap controls, do not reinterpret existing end semantics, and do not use this decision to renew expired authority. The founder's answer must receive the full adversarial review before any required policy amendments are ratified.
