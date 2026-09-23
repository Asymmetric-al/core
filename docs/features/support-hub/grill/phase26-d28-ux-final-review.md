# D28 independent final UX review

**13 September 2026. Reviewer: independent UX/research subagent.** Read-only review of the root's actual `phase26-d28-adversarial-review.md`, R01–R32, category review, P01–P40 and O01–O06. The root's companion UX/data/Email Studio files were not present at this first pass; their links are planned artifacts, not inspected proof. No root file, product or external service was changed.

**Initial disposition: the product choice and core journeys are sound; three precise lifecycle/measurement clarifications are required before final package closure.** These do not replace A or add another feature. The source comparisons and detailed journey research are in [D28 UX research](phase26-d28-ux-research.md). This is a documentation review, not hands-on vendor testing, implemented Core behavior or executed staff/accessibility proof.

## Required clarification 1 — response denominator during unknown submission

**Severity High; likelihood plausible in the explicitly supported ambiguous-provider state.** R14/P21 permit a valid feedback response after submission may have begun, even when P6 has not confirmed provider acceptance. R24 lists the relevant states but does not yet state a response-rate formula. A developer could divide all responses by accepted-only invitations and produce an inflated rate or one above 100%.

Exact addition to R24:

> For one explicit invitation cohort, invitation response rate is responded issued invitations divided by issued invitations whose submission may have begun. Only invitations in that denominator can contribute to the numerator. Show provider accepted, indeterminate and delivery outcomes separately; a response does not convert indeterminate transport to accepted. Do not divide all submitted responses by accepted-only invitations or mix response-date arrivals with a different invitation-date denominator.

Exact P31 addition:

> A response arrives while P6 remains indeterminate: its issued invitation contributes once to both the same cohort's response numerator and submission-may-have-begun denominator, while accepted count stays unchanged. Later reconciliation cannot duplicate either contribution.

**Own research correction completed:** UX-06 now uses this formula. Its earlier accepted-only wording was incorrect. The initial research's other accepted-invitation counts describe transport states, not this ratio.

## Required clarification 2 — reopening after the draw

**Severity Medium; likelihood plausible because selection/preparation and sending are separate stages.** R05 clearly cancels a candidate before maturity and prevents a second draw. It does not explicitly state the terminal behavior when work reopens after sampling but before submission. Current source checks imply a fence, but “never reroll” alone can still be implemented as retaining a selected effect and sending it after reclose without a new quiet interval.

Exact addition to R05/R09:

> If the resolution generation becomes invalid after sampling but before submission may have begun, cancel the definitely-unsubmitted invitation for that generation. Its original opportunity remains consumed and its sampled result remains historical; later reopening/recompletion does not restore that cancelled invitation or create another opportunity. If submission may already have begun, reconcile the original effect and retain truthful history instead of claiming cancellation or recall.

Exact P05/P09 addition:

> Exercise reopen/new admitted input before due, after draw but before submission, and after possible submission, then reclose in each case. Before-draw cancellation can yield a later fresh candidate; after-draw cancellation cannot revive the selected effect or create a fresh draw; possible submission remains an existing reconciled effect.

This is the smallest consistent lifecycle for the selected one-opportunity-per-original model. It trades some feedback coverage for predictable nonrepetition and does not turn a temporary reopen into a new contact opportunity.

## Required clarification 3 — stopping invitations after the rating action ends

**Severity Medium; likelihood plausible for people who open an old invitation or decide to opt out after submitting.** R13 correctly assigns a distinct preference command to the shared owner. The complete journey must also prevent the rating action's Used state or 14-day expiry from disabling the only route to stop future invitations.

Exact addition to R13 and companion UX:

> Stop feedback invitations uses independently qualified preference authority and a clear supported route after the rating action is Used or expired. It does not require a rating, login, new email entry or reason. The final shared-owner contract explicitly qualifies that route's lifetime and recovery; it must neither inherit rating expiry accidentally nor introduce an unbounded alternate bearer protocol. The confirmation identifies this tenant and receiving mailbox scope and explains that ordinary Support communication remains governed by its existing contactability rules.

Exact P24 addition:

> Stop invitations before responding, after the response is Used, and after rating expiry; each supported route changes only the qualified feedback-purpose preference, with no GET mutation, score requirement or contact creation. A subsequently sampled invitation is suppressed, and an otherwise authorized ordinary Support reply remains independently permitted.

## What already passes

- **Selection is not made at closure.** R04–R06 distinguish a closure candidate with frozen policy/rate from the one mature eligible opportunity/draw after 24 elapsed hours. No catch-up/backfill, every-fourth-record rule, mailbox cohort or repeated draw is allowed.
- **Settings have a small clear meaning.** Off plus integer 1–100, suggested 25; fixed explained delay/gap; selected inbox scope; named policy/review authority. D19 review and D27 publication authority do not silently become policy rights.
- **Off is a sending fence.** R09 separates definitely-unsubmitted cancellation from uncertain/already-submitted reconciliation. Issued response links keep their original expiry; normal help remains available.
- **Feedback is independently optional.** R12 preserves D4/D5 human replies, D18 wording and D23 signatures. Sampling suppression cannot block a needed reply. No response, restricted/manual-only and ambiguous-recipient exclusions are explicit and not called representative coverage.
- **The public action remains the existing owner protocol.** Generic selector doorway, deliberate Continue, protected form and explicit Submit; no rating in a URL, account creation or new survey token protocol. One final logical response permits editing before Submit, returns same-payload receipt and conflicts changed-payload replay.
- **Privacy and correction are coherent.** No prior comment echo, transcript, Party proof, profile score, staff score editing or hidden favorable-only calculation. Qualified correction/redaction remains separately attributed and reaches all derived surfaces.
- **Feedback is usable through CRM.** R18/R19 preserve the canonical current Support detail, joint permissions and return/draft continuity. No duplicated CRM comment or field mutation is introduced.
- **The review loop is complete.** All responses enter a permitted review route, with Mark reviewed distinct from resolution. Low ratings/comments may be prioritized without limiting the report to favorable cases. Reviewer loss has an explicit oversight path.
- **Scope is economical.** No generic survey builder, reminders, extra channel, public archive, AI interpretation, staff league table or contact segmentation engine. Proposed 25%/24h/30d/14d values and load fixtures are judgments/test targets, not measured tenant facts.
- **Proof is honestly unexecuted.** P01–P40 cover policy, current permission, draw/endpoint races, source/merge lifecycle, scanner/Used/expiry, privacy, CRM navigation, accessibility, load and migration. “Beautiful” or “complete” does not claim browser or moderated usability verification already happened.

## Companion review and final disposition

### Completed companion pass

I subsequently read the actual completed [UX blueprint](phase26-d28-ux-blueprint.md), [data contract](phase26-d28-data-contract.md) and [Email Studio integration](phase26-d28-email-studio-integration.md), and re-read the revised main decision and proof groups.

The original three findings are substantively resolved:

1. **R24/data/P31** now define the issued-cohort response fraction including indeterminate submissions, with transport status separate. The fraction cannot exceed 100% merely because provider acceptance evidence is missing.
2. **R05/data lifecycle** now cancel a definitely-unsubmitted invitation after a post-draw reopen; the opportunity remains consumed. Candidate-before-draw and opportunity-after-draw behavior are distinct, and no selected effect revives on reclose.
3. **R13/R14/data/integration/P24** now qualify an independent P3 restriction-only preference action, proposed 90 elapsed days from its own issuance, independent of rating Used/14-day expiry or Support content deletion. The existing protected doorway is reused; no alternative credential protocol, public record access or automatic replacement email is introduced. The action's own expiry has the existing qualified contact/privacy recovery path.

Complete setup/enable/edit/Off/repair, worker completion, public doorway/form/submission/retry/correction/decline, staff review and CRM-first return journeys are covered. The canonical navigation is **Support settings → Feedback** for policy and **Support Reports → Feedback** for review/reporting, with **CRM Communications → Support** opening the same source detail. Email Studio editing preserves the draft/return point without enabling the policy; its closed response/preference pair is a new explicit prerequisite, not claimed existing generic support. Public comments are not echoed through used links, stored in notification bodies, or copied into CRM. Tests and usability remain correctly described as unexecuted release proof.

Three final precision edits were sent to the root; none adds a capability:

- Replace the UX introduction **“Ask a random sample of people about their recent support experience.”** with **“Invite feedback after a random sample of eligible completed Support conversations.”** The first wording conflicts with the actual conversation-opportunity unit and could defeat the otherwise careful percentage explanation.
- Explicitly state **“The 90-day limit applies to the preference action, not the saved opt-out. Expiring the action does not opt the mailbox back into invitations.”** in the preference contract/UX. Existing independent ownership implies this, but exact copy prevents a damaging implementation/administrator misunderstanding.
- Extend **P05** to include **post-draw reopen/new input followed by reclose cannot restore the cancelled invitation or create a new opportunity**. R05/data already require the outcome; its direct proof should be traceable without inferring it from broader cancellation tests.

**Second-pass disposition: passes substantively; final wording/proof edits above await confirmation.** No other material UX, maintenance, navigation or privacy defect was found. This is a documentation-quality conclusion, not a claim of executed browser, assistive-technology, real-mail or staff-usability validation.

### Final verification — passed

A focused re-read on 13 September confirms all three final edits are present:

- The UX opening now says **“Invite feedback after a random sample of eligible completed Support conversations.”**
- R13, UX, data and Email Studio integration explicitly distinguish the 90-day preference credential from the saved opt-out. Policy Off→On, CRM merges, key rotation and new invitations cannot clear that preference. P24 additionally proves an opt-out recorded on day 80 still suppresses invitations on day 91.
- P05 explicitly proves **post-draw → reopen → reclose** cannot resurrect stored selection, matching R05 and the data lifecycle.

**Final disposition: Pass.** No remaining material UX, navigation, maintenance or privacy-contract defect was found in this bounded independent documentation review. The original and second-pass concerns remain above as a trace of what was checked and corrected; they are resolved, not open work. All actual browser, assistive-technology, provider, concurrency and moderated-usability proof remains required and unexecuted, as the package accurately states. No runtime, formal-spec or external action was performed.
