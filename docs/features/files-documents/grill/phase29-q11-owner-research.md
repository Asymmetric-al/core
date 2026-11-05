# Phase 29 Q11 — unfinished-access clock model: owner research

Research only, 2026-10-20. No Q11 option selected. Q10 A and its complete amendment package are ratified; this note does not amend or reopen that decision. No canonical document, runtime, specification, issue or provider was changed.

Repository: `/home/conrad/code/core`, Ubuntu-24.04, user `conrad`. Reverified HEAD: `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Root `AGENTS.md` and the current Q10 ADR/review were reread. Exact local owner sources outrank older summaries. Local grooming ratification is accepted intent, not proof of completed owner/OpenSpec integration or runtime qualification.

## Recommendation and the single next decision

Ask **how the ordinary unfinished-stage clock starts**, now that Q10 settled its scope:

> For a new ordinary private document request, should the source fix the unfinished access end when it first makes that access available, or give the recipient a finite window to enter and then a finite work period from their first qualified entry?

Recommend **A — Fix the unfinished end when access is issued**. The source establishes one finite end at its authoritative initial admission of access availability for the intended recipient and purpose. It is predictable for recipients, reviewers and support and avoids a second unused/entered timing condition. This selects when the end is established, **not its duration, formula, a staff date picker, or a number of days measured from issuance**.

The strongest fair alternative is **B — Finite time to enter, then a finite work period**. The source prospectively declares a finite latest-entry deadline and the finite work-period rule. A first qualified entry before that deadline starts the work period once, under genuine independent source caps. This protects a useful work period for a recipient who enters later; it requires two clearly scoped timing conditions and an atomic first-entry effect.

An arbitrary outer unfinished cap that truncates B's work period is **not required by Q10** and should not be smuggled into the alternative merely to simplify it. A genuine independent purpose/security/overall cap can still shorten the work period or completed stage. Both alternatives are finite, retain Q10's separation of unfinished and completed access, and leave numerical policy unresolved.

| Option                                                        | Product benefit                                                                                               | Honest cost                                                                                                                                                 | Not selected by this option                                                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| A: source fixes unfinished end at initial access issuance     | One established end; straightforward planning and expiry behavior                                             | Delivery delay or late discovery uses some of the unfinished period; duration/cohort qualification must make that workable                                  | Fixed number of days, calendar convention, calculation from due date, date-edit/extension powers, delivery guarantees |
| B: finite entry window, then a finite first-entry work period | A late but timely first entrant gets the chosen work period unless an actual independent restriction clips it | Must distinguish latest-entry from work-end, qualify first-entry races, and handle completion before entry; a longer maximum original lifecycle is possible | Particular entry/work durations, resets on re-entry, automatic extensions, a new overall cap, endless unused requests |

A recommendation here is product judgment about simplicity, not an external best-practice consensus or measured optimal ministry policy. No duration is inferred from the existing suggested Workflow token expiry.

## Source evidence

All repository paths below are relative to `/home/conrad/code/core`; cited line ranges were read in this research or its immediately preceding source pass.

| Source                                                                                                       | Grounding for Q11                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/features/files-documents/docs/adr/0010-finite-unfinished-and-completed-request-stages.md:3–7,18–38`    | Q10 is ratified; initial anchor/duration remain unselected. Unfinished end is stage-scoped, existing/unknown overall ends cannot be relabeled, and eligible durable fulfillment must occur before the applicable exclusive unfinished end. |
| Same ADR, `:40–57`                                                                                           | Coherent source ordering/recovery, qualified time after waits, delayed original transition, no accidental credential extension or required online browser.                                                                                 |
| Same ADR, `:59–70,79–84`                                                                                     | Review can outlast recipient access; support does not imply extension. Qualification remains required; selected mocked tests do not prove native stage behavior.                                                                           |
| `docs/features/files-documents/grill/phase29-q10-adversarial-review.md:204–242`                              | `F < U` plus actual eligibility, Q07 end, bounded initial policy, preservation of actual limit scope, and source occurrence/linearization proof including transactions crossing an end.                                                    |
| Same review, `:443–446`                                                                                      | C01 prospective scope, C02 finite applicable initial end with no initial anchor selected, C03 exact fulfillment, C04 preserve declared limit scope and genuine cross-stage shortening.                                                     |
| Same review, `:453,460,698,708,719`                                                                          | Browser not required for fulfillment; delivery does not control transition; legitimate non-file/manual/waived outcomes do not acquire an invented file-count requirement; entry credentials retain their own expiry.                       |
| `docs/features/files-documents/docs/adr/0001-confirmed-recipient-private-document-requests.md:25–56`         | Invitation alone insufficient; current request/mailbox/purpose-specific proof or expressly qualified reuse; no new membership; every protected operation has current source checks; source processing is separate from browser session.    |
| `docs/adr/0025-producer-owned-protected-actions.md:28–50,74–92`                                              | Producer owns issuance, authority, expiry and completion. P17 is presentation. GET/HEAD/scanners inert; deliberate exchange and producer assurance/current checks; technical sessions cannot extend action authority.                      |
| `docs/features/files-documents/docs/adr/0007-fixed-completed-request-access-end.md:22–40,49–59`              | Completed end derives from original fulfillment, not first visit or processing; true shortening persists; proof/session/retention and recipient access are separate.                                                                       |
| `docs/features/files-documents/docs/adr/0008-source-authorized-fresh-completed-access.md:19–39,71–76`        | Fresh read-only access requires original completed admission, does not reopen intake, cannot bypass genuine ended limits; its timing/repetition policies remain separate activation gates.                                                 |
| `docs/features/files-documents/docs/adr/0009-requested-by-targets-and-authorized-late-intake.md:18–36,38–64` | Requested-by target alone grants/ends nothing. Actual finite authority and hard intake limits govern. Receipt/target evidence, review and access remain distinct. No target timer invents closure or renewal.                              |
| `docs/prds/workflow-studio/01-product-and-experience.md:65–77`                                               | Limited task-purpose admission, scanner-safe exchange, current evidence/submission access and uploaded-versus-accepted distinction. Fourteen days is a suggested token/product default, not the selected native ordinary-request clock.    |
| `docs/prds/workflow-studio/12-owner-bindings-and-decisions.md:68–85`                                         | WS-Q02 native P4/P12 participant admission and WS-Q08 clock/default qualification remain exact owner gates. A planning declaration does not prove closure.                                                                                 |

## Why the stronger B does not reverse Q10

Q10-C02 requires a **finite applicable unfinished end**, not a frozen numerical end measured from issuance for every possible initial policy. Q10 expressly left the initial anchor open. C04 preserves a limit's declared scope and genuine adverse shortening; it does not outlaw a prospectively declared, timely conditional initial-access policy.

For explanation only, let:

- `L` be the exclusive latest-entry deadline declared at source issuance.
- `T` be the first qualified entry's authoritative occurrence.
- `D` be a finite work interval whose value and calendar semantics remain unselected.
- `U` be the applicable work end once qualified entry has occurred.

Before entry, `L` supplies the finite applicable unfinished boundary. Entry is permitted only under the actual current policy and eligibility with `T < L`; passing the time comparison alone grants nothing. A timely admitted entry resolves the work end once from the predeclared rule, subject to genuine independent caps. Conceptually `U <= T + D`; this is explanatory, not a schema or timestamp-function decision.

`L` has not been removed or relaxed after expiry. Its explicitly declared function was to admit timely first entry, not terminate an already valid work interval. At or after `L` with no timely admitted entry or eligible fulfillment, later access cannot start a work period. This differs from retroactively relabeling an existing general `expires_at`, reviving an actually ended admission, or clearing a genuine restriction to recover a longer end.

Because both the entry window and work interval are finite, the original policy is bounded without imposing `L` as a cap on the later work period. A mathematical upper bound is not itself an independently authorizing overall source limit. Q10's valid completed transition remains governed by the applicable unfinished end at actual fulfillment and Q07, not by a dormant-state deadline that no longer applies.

B does introduce meaningful conditional timing mechanics to be adversarially reviewed if selected. It is an allowed choice within Q10's reserved initial-clock decision, **not already adopted behavior**. If its actual implementation cannot prove that scope and order, it is not qualified.

## First entry and source issuance must have exact meanings

**For A**, issuance is the source act that actually admits initial recipient access availability for the exact request, purpose and recipient revision. Draft creation, task creation, preparing/queuing an invitation, provider acceptance, delivery, email open and resend are not interchangeable authorities. The source outcome must be durably attributable and recoverable; this note does not select a universal SQL commit timestamp.

**For B**, first qualified entry must complete Q01's applicable proof and source eligibility requirements. It can use explicitly compatible current request-specific proof; it need not force another mailbox ceremony. A broad signed-in session, matching email string or verified-email flag is insufficient.

Do not start B's work period from scanner GET/HEAD, link expansion, generic landing/preflight, failed confirmation, staff viewing, first upload, first preview, or each subsequent login. A successful source-bound admission must record the first-entry effect once and distinguish committed, rejected and unknown outcomes. The final source-specific command/linearization point remains owner qualification, not an invented second permission engine.

No extra “start timer” confirmation is selected. Existing deliberate protected entry plus the qualifying source effect may supply the boundary if correctly adopted and proved. Both source scope and technical credential expiry remain current; the choice does not extend invitation, proof, session, worker or signed-URL lifetimes.

## Completion before first entry is a mandatory boundary case

Q10 does not require an online browser or a file-count predicate. A legitimate source outcome can therefore fulfill a request before the intended recipient first enters.

Under B, the owner must evaluate that actual fulfillment against the then-applicable finite pre-entry boundary and all historical recipient/source predicates. An eligible timely fulfillment can transition directly to Q07's completed stage. The first subsequent recipient entry is then qualified entry into completed read-only access; it cannot start an unfinished work interval or move the original completion anchor.

If historical eligibility cannot be established, do not manufacture a completed admission merely because an invitation once existed. Source completion may remain valid independently. Actual fulfillment after expired pre-entry/unfinished authority cannot create an ordinary completed recipient grant. Delayed processing can recover an originally proved timely effect under Q10; processing time cannot become eligibility.

This is a necessary compatibility condition for B, not a separate founder decision to add an alternative completion route. Exact native eligibility mapping remains an owner activation gate.

## Constraints and likely mistakes to prevent in the question

1. **Do not reopen Q10.** Neither ordinary clock in Q11 becomes an overall completed-reading cap merely because its value was set earlier. Genuine independent caps retain their original scopes and can constrain either stage.
2. **Do not preselect A's formula.** “End fixed at issuance” does not automatically mean “a fixed number of days from issuance.” A later explicit computation can consider permitted source context. Due-relative calculation is not a mutually exclusive third anchor model.
3. **Do not offer unbounded B.** Finite latest-entry eligibility and finite work policy are necessary. A person who never enters cannot leave indefinite conditional authority.
4. **Do not hide B's extra timing conditions.** Explain its benefit and cost in plain language. The first-entry effect must be durable, race-safe and recoverable, not inferred retrospectively from logs.
5. **Do not call a genuine capped interval guaranteed.** Current independent purpose/security restrictions can leave less usable time. B's ordinary latest-entry deadline alone should not be misrepresented as that independent cap.
6. **Keep Q09 requested target independent.** Target changes, reminders, overdue labels and receipt/review delay cannot silently change the access end. Undated requests remain finite without fabricated due dates; past/distant dates require later calculation qualification.
7. **Keep Q03 correction limits.** Access time never reopens an accepted/frozen item, revives a superseded candidate or restarts on every correction.
8. **Do not promise recovery powers.** A long staff review can outlast active recipient access. Actual later source fulfillment is still permitted without recipient admission; Q08 is not an active-intake extension or rescue for a request with no original completed admission.
9. **Keep communication separate.** Failed/delayed delivery, resend, email open, contact revision and proof refresh do not independently reset an established source period. Whether/how replacement recipients receive a new admission requires actual source policy, not same-email inference.
10. **Do not borrow defaults.** Workflow's suggested 14-day token expiry, P18 credential/session examples and Q07's 720-hour completed rule do not choose Q11 values.
11. **Preserve truth at boundaries.** At the applicable exclusive end, later actual source eligibility cannot be backdated. Delayed recovery of a proved committed timely effect differs from a fresh grant; genuine later revocation remains.
12. **Retention is not access.** Ending either unfinished condition neither deletes received evidence nor stops independently admitted hygiene, review, retention or source processing.

## Sequencing and remaining unknowns

This is the strongest next single question because initial access has no fully selected finite clock, and Q10's usable completed transition depends on an applicable finite unfinished boundary. The fresh-access clock in Q08 can follow after this ordinary lifecycle is usable.

After Q11, choose and adversarially qualify the relevant numerical policy and source calculation: A's finite end computation, or B's finite latest-entry rule plus work interval. Depending on the founder's choice, those can be framed as one coherent default profile rather than assuming an incidental number now. Do not collapse staff override authority, active extension/recovery, contact replacement, reminders or Q08 repeat/fresh timing into that choice.

Still unresolved here:

- Exact native source/P4/P12 contract/version and allowed actions before/after qualified proof.
- A's actual issuance effect mapping, or B's first-entry event and initial conditional eligibility semantics.
- Duration values, elapsed/calendar convention where relevant, date-only timezone behavior and useful cohort evidence.
- Applicable independent source caps and any genuinely separate hard intake cutoff.
- Deliberate staff edit/extension or active-expiry recovery authority; no such power is created by this note.
- Q08 fresh timing, unused-admission policy, repetition/overlap and exact lifecycle/type mapping.
- Native runtime, SQL/RLS, race, provider/browser/assistive-technology and recovery proof.

No external research was needed for this bounded owner-contract check, and no outside service's defaults are treated as authority. No tests were run. The current evidence supports asking the clock-model question; it does not establish implementation readiness or ratify either answer.
