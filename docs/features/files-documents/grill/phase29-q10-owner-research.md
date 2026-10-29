# Phase29 Q10 — the initial finite request-access policy

Bounded owner research, 2026-10-20. Conrad has explicitly ratified Q09 and its full amendment package; the parent is recording it unchanged. Q01–Q09 are settled grooming intent. No Q10 policy, numerical period, anchor, extension right, notification or implementation is selected by this note.

Core HEAD reverified as `3d85897ebf1515008ef5c676b1c58a15422fb9ab`, `/home/conrad/code/core`, Ubuntu-24.04 as conrad. Read-only research; no product/provider/credential/test/GitHub changes. The first canonical Q09 read still showed the preceding pending-ratification status while the parent was updating it; the latest founder ratification governs.

## Recommendation: decide the initial deadline's scope before its anchor

The first draft compared a fixed end established at issuance with a bounded first-qualified-entry period. That is a real later choice, but treating both as one overall ceiling silently fixed another unresolved policy: **whether the initial deadline also caps access after timely normal fulfillment**. The corrected Q10 question should settle that scope first.

Recommend asking:

> **If an ordinary request is normally fulfilled while the recipient's initial access is still valid, should access move into Q07's completed read-only period, or should the same original overall end continue to cap that readback?**

Explain that both options require a finite initial deadline. Neither permits completion after expiry to revive access, and every independent binding source-purpose/privacy/security end continues to apply.

| Option                                                                                          | Concrete behavior                                                                                                                                                                                                                                                                                                                 | Benefit and cost                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Finite unfinished-stage deadline, then Q07 on eligible timely fulfillment (recommended)** | Before issuance, the source expressly declares that the initial deadline governs recipient access while the request is unfinished. Exact normal fulfillment before that deadline, while current source eligibility holds, transitions to Q07's read-only maximum of 720 elapsed hours subject to independent binding hard limits. | Preserves a useful bounded follow-up purpose even when valid review finishes near the initial deadline. Requires an explicit, correctly ordered source transition and truthful communication of the current stage's end; it is not an extension button or generic renewal. |
| **B — One original overall ceiling**                                                            | The original finite access end continues to bind unfinished and completed access. Eligible fulfillment still applies Q07, but readback ends at the earlier of that same original ceiling, Q07's completion maximum and other binding limits.                                                                                      | One absolute overall limit and less possible total exposure. Completion near the end can leave very little readback; staff review can consume the same period the recipient would use to return.                                                                           |

Recommend A for the new ordinary native profile. Collection and completed follow-up have different bounded purposes already selected by Q06/Q07. Defining their relationship explicitly is more coherent than incidentally consuming almost all follow-up time during valid source review. This is product judgment, not measured proof of ministry review times or an optimal initial count.

B is a legitimate stricter policy where one original overall ceiling is desired. It is not already required by Q07: Q07 preserves ends that **actually bind the completed authority**, but did not choose the still-unselected initial deadline's stage scope.

This recommendation is for the **question and option**, not adoption of A. Neither option is selected by this note.

## How A could fit Q07 without relabeling an existing cap

A would be a substantive **prospective** source policy. From original admission, it would declare the initial deadline's unfinished-stage scope and the exact eligible fulfillment transition. It does not take an existing overall expiry and later call it advisory.

At fulfillment, the source must prove that the unfinished-stage deadline has not been reached, the exact Q06 outcome is admitted and all relevant recipient/source eligibility holds. Only then can the already-declared Q07 transition occur. Q07 still clips readback to every applicable independent overall purpose/privacy/security limit. Its original maximum, anchor, immutable resolution, current checks and no-incidental-renewal rules remain.

Once initial authority actually ends while the request remains unfinished, later staff completion cannot use A to revive it. Source work may still finish independently. Q08 cannot automatically repair a request that never acquired an ordinary completed-view admission, because Q08 requires that original scope.

This uses one source policy and the existing PDP. It requires no new grant taxonomy, role, permission engine, alternate login or fourth app. It also cannot let a source toggle complete/open/complete to restart a period: normal fulfillment and later remediation retain Q06's exact immutable meaning.

Even A does not promise a full 30 days or solve arbitrarily slow review. A true independent hard cap can shorten readback, and review that finishes after the unfinished-stage deadline is still too late for automatic transition. The initial finite policy and realistic cohort qualification remain necessary.

## Illustrative consequences

| Case                                                                                          | A — prospective stage deadline                                                                                              | B — original overall ceiling                                                     |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Exact fulfillment occurs shortly before the initial deadline; no earlier independent hard cap | Apply Q07 from fulfillment. The initial unfinished-stage deadline does not silently become a completed-view cap.            | Q07 is clipped by the original end, so only the remaining interval is available. |
| Fulfillment occurs after initial authority actually ended                                     | Preserve the source result; do not create completed recipient access.                                                       | Same no-revival result.                                                          |
| An independent hard purpose/privacy/security end is earlier than Q07's maximum                | That limit still wins; no complete-period guarantee.                                                                        | That limit and the original overall ceiling still win.                           |
| Source requests new work after an accepted fulfillment                                        | No ordinary reopening or another clock. The exact source remediation/new-work policy is required.                           | Same.                                                                            |
| Recipient has an expired browser session but valid source eligibility at fulfillment          | No open browser required for the qualified transition. Later Q01 entry and current source checks still govern reads.        | Same, within the original overall ceiling.                                       |
| Requested target passes                                                                       | Q09 permits otherwise-authorized late intake while unfinished authority remains valid. It does not move the stage deadline. | Same, within the overall ceiling.                                                |
| The original policy/expiry meaning is unknown or legacy                                       | Do not assume stage scope or convert it. Preserve its actual binding obligations and reconcile through the owner.           | Do not infer or fabricate an end from current time either.                       |

## Deferred anchor and calculation choices

After Q10's scope answer, research and choose how the relevant initial finite end is established. These are **not current Q10 alternatives**:

- **Fixed end established at source issuance.** A concrete finite end is determined at the authoritative source act making initial request access available. This need not imply a fixed duration measured from that act; its calculation method remains a separate choice.
- **First-qualified-entry period within a finite outer end.** The first successfully qualified recipient entry determines a usable period clipped by an already fixed finite limit. This needs exact unused-admission, concurrent-entry and completion-before-entry behavior. Email opening, scanner GET and background jobs are not qualified entry.
- **Requested-target-relative or staff-selected calculations.** Either can be a method of establishing a fixed end, not a mutually exclusive third clock model. Both require actual source authority and explicit bounds; neither is selected.

Use source issuance precisely: the source admits request access for the exact recipient and purpose. Draft creation, first queued job, credential refresh, message preparation, provider acceptance, email arrival/open tracking and generic Task creation are not automatic substitutes.

A due-relative computation would need explicit treatment of no date, distant date, past date, date-only interpretation and later target edits. A null target cannot mean forever, and moving Requested by cannot silently extend authority. Do not hide these rules in `max(current end, due date + buffer)` or make staff type a fake target.

The selected finite policy must make actual ordinary work possible. If a requested target lies beyond the real access end, show that earlier end and resolve or explicitly qualify the useful outcome; do not silently lengthen access or promise submission until the later target. No numerical period or editable date range is selected here.

## Recommended sequencing

1. Ask Q10: finite unfinished-stage deadline followed by eligible Q07 transition, or one original overall ceiling.
2. Adversarially review the answer, including exact fulfillment-versus-expiry ordering, all current hard caps, legacy semantics and truthful display.
3. Choose the initial end's establishment/anchor and numerical or bounded calculation policy, including no-date/long-request/unused cases.
4. Separately resolve any active-request extension/recovery and Q08 fresh-read timing/repetition. Do not use Q08 to reopen collection or fabricate a missing original completed admission.

Do not copy Workflow's suggested 14 days, P18's guest/session values or Q07's completed-view count into the initial policy. No source here proves a universal safe and usable initial duration.

## Exact governing evidence

Paths are relative to `/home/conrad/code/core`.

| Source / inspected lines                                                                                                                                                             | What it settles                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/features/files-documents/docs/adr/0001-confirmed-recipient-private-document-requests.md:25–56`                                                                                 | Invitation alone does not grant protected details/actions; exact source-authorized confirmation and qualified proof reuse; every protected operation rechecks current authority; expiry fences new participant work without erasing received evidence. |
| `docs/features/files-documents/docs/adr/0003-recipient-corrections-and-exact-review-lineage.md:9–33,44–51`                                                                           | Pending correction needs current source-open exact item and durable admission; no implicit deadline extension; browser start is not receipt.                                                                                                           |
| `docs/features/files-documents/docs/adr/0006-bounded-completed-request-access.md:22–55`                                                                                              | Finite current recipient policy and end are prerequisites; independent source work may complete after recipient access ends; completion/proof/session/worker/retention are separate.                                                                   |
| `docs/features/files-documents/docs/adr/0007-fixed-completed-request-access-end.md:22–39,54–64`                                                                                      | Actual binding earlier ends cap the completion-based maximum; original and later genuinely shortened ends remain; no revival by processing, login or policy relaxation.                                                                                |
| `docs/features/files-documents/grill/phase29-q07-question.md:107–139`                                                                                                                | One prospective source policy; no new grant taxonomy; preserve binding earlier limits and reject relabeling existing expiry as advisory. This is question provenance, not authority to invent an unfinished-stage exception.                           |
| `docs/features/files-documents/docs/adr/0008-source-authorized-fresh-completed-access.md:19–39,71–76`                                                                                | Fresh readback requires original completed-view admission and eligible ordinary expiry; stays read-only; finite timing/unused/repeat/overlap policies still unresolved.                                                                                |
| `docs/features/files-documents/docs/adr/0009-requested-by-targets-and-authorized-late-intake.md:3–8,18–29,38–64`                                                                     | Q09's full package is ratified. Requested target alone neither closes intake nor extends access; date edits preserve history; finite active access remains an activation gate.                                                                         |
| `docs/prds/workflow-studio/01-product-and-experience.md:65–77`                                                                                                                       | Expiring revocable task-purpose session; suggested 14-day expiry renewable through reauthorization is not a legal rule or this native default; every evidence fetch/submission rechecks source authority.                                              |
| `docs/prds/workflow-studio/12-owner-bindings-and-decisions.md:68–85`                                                                                                                 | Exact source/session/capability/default rules and proof must be qualified before activation. Missing bindings do not become universal defaults.                                                                                                        |
| `docs/prds/workflow-studio/03-runtime-and-recovery.md:55–67`                                                                                                                         | Exact source wait/currentness and accepted source time; elapsed/local/business meanings; source clocks win; fixed expiry does not pause with operational work.                                                                                         |
| `docs/prds/workflow-studio/contracts/requirements.json:144–161,204–211`; generated OpenSpec `openspec/changes/add-workflow-studio-program-contracts/specs/workflow-studio/spec.md:1` | Finite source-purpose external access, participant-safe context and source clock ownership. Canonical requirements own generated behavior; no initial access anchor/count is selected here.                                                            |
| `docs/adr/0025-producer-owned-protected-actions.md:28–50,74–92`                                                                                                                      | Producer owns issuance, expiry and current action checks; message preparation and delivery do not own grant lifetime; scanner GET/HEAD and proof/session mechanics remain independent.                                                                 |
| `docs/adr/0037-scanner-safe-exact-artifact-access.md:32–35,55–88`                                                                                                                    | Official document, access grant and session are separate; P18-specific 14-day/30-minute defaults do not supply the new request policy.                                                                                                                 |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1584–1587,1643–1655`                                                                                    | Current exact context/epoch/purpose, expiry-bounded authority and every egress, including long-stream expiry. A signed token or stored row is not continuing permission by itself.                                                                     |
| `docs/adr/0038-purpose-owned-records-schedules-and-verified-disposal.md:20–55`                                                                                                       | Retention, use, access, hold and disposal remain independent. Finite access does not delete preserved evidence or authorize another use.                                                                                                               |

The older Q07 owner research discussed possible prospective stage-specific schedules. It was research, not ratification of A. Equally, the current owner clauses do not already choose B's overall scope for the still-unselected initial deadline. The new Q10 choice must be explicit and prospective.

## Invariants common to all candidates

- One exact source policy and sole PDP; no extra role/context, membership, parallel grant engine or public-access fallback.
- Finite unused/active authority where applicable. No missing/null target, absent first visit or failed email yields forever.
- Current stronger purpose/privacy/security/custody restrictions can deny earlier. No grace through retry, browser activity or temporary provider lifetime.
- Stable semantic issuance and first-qualified-entry effect, if chosen; parallel tabs, proof retries, replay and transport-key changes cannot restart or duplicate a period.
- Preserve original requested target and true authority meanings; label Requested by and Access ends separately.
- Access expiry is not source fulfillment, rejection, cancellation, deletion or the expiration of independently authorized staff processing.
- Recipient-facing dates use the actual controlling bound; a maximum is not an uninterrupted-service guarantee.
- Migration cannot convert an existing fixed end into an advisory mode deadline, adopt a new initial period from current time or revive expired authority.
- Extensions, active-request recovery, reminders and additional communication remain separately authorized policy choices.

## Remaining decisions and proof

A scope answer is not a complete activation contract. Initial end computation/anchor and period, meaningful no-date/distant-target behavior, unused admission, active-request extension/recovery and exact source/P4/P12 mapping remain to be resolved. Any first-entry policy later chosen also needs its finite outer bound and exact activation semantics.

Q10's proof must distinguish a prospectively declared stage boundary from an existing overall cap, and demonstrate fulfillment before/at/after initial expiry, competing restriction, source completion without recipient admission, no repeated fulfillment restart, and current proof at subsequent reads. Later timing qualification additionally covers issuance versus draft/message time, first qualified entry versus scanner/failed proof, no-entry expiry, first-entry races, precision, delayed delivery/replay, requested-target edits and long/no dates.

No source or external evidence in this bounded review establishes a universal best count. The parent may add current comparator/UX research, but should not present their session/token/share defaults as the native source policy.

## Conclusion

Prefer asking **scope before anchor**: A, a prospectively defined finite unfinished-stage deadline with an eligible timely transition to Q07 under independent hard caps; versus B, one original overall ceiling that also limits completed readback. Recommend A, but do not treat it as ratified or quietly apply it to existing ends. Issuance/first-entry models and numerical/calculation policies are deferred, not stacked into this choice.

No option or numeric lifetime is selected by this research.
