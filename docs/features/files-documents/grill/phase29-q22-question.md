# Phase 29 Q22 — completing the whole request

**Status:** Historical researched question prepared 2026-10-21, Asia/Bangkok.
Conrad selected A and ratified its complete required amendments on 2026-10-21:
complete when all source requirements are satisfied, preserving excellent UX/UI,
staff/tenant flexibility and no overengineering. Q01–Q22 are ratified grooming
intent. No implementation or activation follows.

## Historical question and alternatives

**Once every current source requirement is satisfied, should an ordinary native
request complete without another staff action, or should staff separately
choose Complete request?**

| Option                                                                    | Practical behavior                                                                                                                                                                                               | Benefit                                                                                                                                                      | Cost and consequence                                                                                                                                                                                                             |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Complete when all source requirements are satisfied (recommended)** | The requesting source records fulfillment when its full current completion rule is met, without a separate routine final staff click. Q21 staff acceptance and all other required source conditions still apply. | Removes a duplicate completion step and avoids leaving finished work open because somebody forgot the last click.                                            | The consequence of satisfying the final condition must be clear. It closes ordinary intake/correction and applies existing completed-access rules when eligible. It needs exact source truth, not a client-side count.           |
| **B — Require a final staff Complete request action**                     | Even after the other conditions are satisfied, the request remains unfinished until an authorized staff member deliberately completes it through the source command, which rechecks current conditions.          | Provides a distinct final checkpoint and explicit control of the whole-request handoff. Useful when that final judgment is real work beyond item acceptance. | Adds an action and another possible waiting state. Staff can leave already-reviewed work open; a delay can outlast participant access. The button cannot bypass missing requirements or use an earlier inferred completion time. |

**Recommend A for the ordinary native profile.** Staff already perform the
substantive evidence acceptance under Q21. When every actual source condition
has been satisfied, a routine final checkoff adds little by itself. This is a
product judgment about this bounded flow, not a claim that automatic completion
is universally better or empirically faster for Asym.

B is a credible alternative where final whole-request reconciliation or a
controlled handoff is itself a meaningful decision. That work needs a clear
source-owned meaning; “Complete” cannot act as an override for unknown or
unsatisfied conditions. Existing specialist final approvals remain theirs
under either answer. Q22 does not introduce a tenant mode editor or general
workflow configuration to offer both policies automatically.

## Practical example and clear UX

**Illustrative scenario, not observed ministry practice:** a coordinator requests
two required items. Staff accepts the first. The request still needs the second.
Staff then accepts the second, and no other current source condition remains.

- With **A**, that qualified source progression can fulfill the request. Staff
  should see the completion consequence before the final meaningful action and
  the actual request result afterward. A label such as **Accept item and complete
  request** can help where that exact consequence is currently proved; it is
  an illustrative copy intent, not a new hard-coded button contract.
- With **B**, the accepted items remain accepted and the request can show
  **Ready to complete**, but an authorized final Complete action is still
  necessary. It must not look like missing recipient work or silently change
  earlier acceptance.

Neither option promises completion from a stale screen. Current authority,
requiredness, applicable evidence, pending correction and real aggregate
dependencies must be checked by the source. If the evidence or conditions change,
explain the actual outcome instead of quietly completing different work. Keep
one truthful result: an accepted item can remain accepted while fulfillment is
blocked or unresolved. Do not make a recipient reupload or a reviewer repeat
acceptance to fix a task-panel or communication failure.

The same context should explain the consequences of completion: ordinary
submission/correction ends, and the already-selected bounded read-only completed
view applies only when its source-access conditions permit. Display the actual
end; no new access period, reminder or completion email is selected. Keeping a request unfinished under B does not reopen an already-accepted item
for ordinary correction. Remaining optional or pending work follows its actual
source closure rules; this question selects no new admission or remediation
policy. A final staff click is not a legitimate tool for backdating fulfillment
or silently prolonging access. Already-committed completion cannot be undone by closing a
dialog or resetting a task status.

## Current research and strongest counterevidence

Primary documentation was checked on 2026-10-21. Comparators illustrate
different purposes and products, not Core permissions or tested Asym outcomes.

| Official source                                                                                                                                                                                                     | Verified behavior                                                                                                                                 | Useful lesson and limit                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Content Snare request overview](https://contentsnare.com/help/knowledge-base/requests-overview/), updated 2025-10-06, and [Zapier guide](https://contentsnare.com/help/knowledge-base/zapier/), updated 2024-09-23 | Separates submitted/approved fields from a request manually marked complete.                                                                      | Strong direct evidence for B's separate wrap-up action. It does not establish that Core needs that extra step or may copy its post-completion access rules.                                                                  |
| [FileInvite reviewing documents](https://help.fileinvite.com/articles/reviewing-documents), current undated guide with a knowledge-base routing notice                                                              | Its documented Invite surface offers Mark as Complete after documents are received and accepted.                                                  | Another concrete B example. This is not a claim about every FileInvite edition/default; no download/archive/revision policy is imported.                                                                                     |
| [SurveyMonkey Apply Simple Review](https://help.surveymonkey.com/en/apply/build/simple-review/), current undated guide                                                                                              | Stage automation supports moving an application when all reviewers/teams have completed reviews; these automations have active/inactive controls. | Demonstrates progression following completed substantive review without a separate move action. Review-stage movement is not automatic application acceptance or Core request fulfillment; no automation builder is adopted. |
| [Contentstack task completion](https://www.contentstack.com/docs/headless-cms/mark-a-task-as-complete), updated 2026-09-08                                                                                          | Tasks complete through the action they represent. A publishing task still requires publishing after approval when publishing is its actual work.  | Completion should follow the real domain action, not a disconnected status checkbox. Distinct required work must remain distinct; no CMS publication rule is generalized.                                                    |
| [Foundant follow-up logic](https://support.foundant.com/hc/en-us/articles/4411213334935-Follow-Up-Submission-Logic), updated 2025-12-15                                                                             | Sequential follow-ups distinguish submission and administrator completion.                                                                        | Relevant nonprofit counterevidence favoring an explicit administrative checkpoint in that product. It does not mandate a duplicate Core review or choose Core's completion timing.                                           |

The [comparative research](phase29-q22-comparative-research.md) contains the
full primary-source treatment and UX consequences. Direct document-collection
comparators genuinely support B; they are not dismissed as obsolete. A's
recommendation rests on avoiding a second routine action after all real work in
this ordinary source is done. If a distinct final review is needed, it must be
represented as actual source work rather than silently removed.

No evidence here measures Asym completion delays, staffing patterns, forgotten
clicks or user preference. No quantitative usability benefit is claimed.
The selected policy must later be tested for whether staff understand the last
action's consequence and participants understand completed versus awaiting-staff
work. Both policies need clear, accessible, persistent outcomes and safe retry.

## Governing contracts and current reality

The [owner research](phase29-q22-owner-research.md) and
[runtime research](phase29-q22-runtime-research.md) preserve exact evidence.

- Q21-C01/C05/C08 and ADR-0021 expressly left this choice open: staff acceptance
  is necessary for ordinary file-evidence satisfaction, not sufficient to
  replace other conditions or decide the final completion affordance.
- Q06 defines fulfillment as an exact durable source outcome. Q03's correction
  fence and Q10's current evidence/recipient/adverse-state rules still govern.
  Upload, scan, preview, generic task status or a client-side “all accepted”
  calculation cannot manufacture fulfillment.
- “All requirements” means the source's actual current required conditions,
  including valid existing non-file/waived outcomes where authorized. It is not
  a file-count rule. Unknown/incomplete queries, unproved applicability and an
  empty result are not proof that no work remains. Drafts, withdrawn/canceled
  requests and missing definitions do not become fulfilled by vacuous truth.
- Preserve distinct item acceptance, present satisfaction and request fulfillment.
  At the required source boundary, exact revisions, current authority and real
  dependencies decide one coherent durable result. Existing source commands,
  P12, P9 and P6/P17 retain their responsibilities; no second completion writer
  in a task projection, workflow rule or storage callback is introduced.
- Preserve the original actual fulfillment occurrence and its time on replay.
  A delayed consumer can recover a previously committed timely outcome only
  from its durable evidence. A later complete-looking snapshot cannot backdate
  fulfillment to a guessed final acceptance or refresh time. If completion
  occurs after participant access expires, source work can finish without
  reviving participant access under Q06–Q19.
- Whole-request completion and any mandatory source follow-up must be coherent
  and recoverable. Notification or task refresh failure cannot erase completion,
  while an unknown commit cannot be called success. Q20 remains fresh-access
  email only; no new completion notice, auto-renewal or reopening policy follows.
- Current generic task APIs/client callbacks set completion timestamps without
  native evidence semantics. The financial approval outcome helper projects
  task completion after a source decision, but its repeated timestamp writes
  are not immutable native fulfillment evidence. The runtime note distinguishes
  this adjacent static-source hazard from an implemented document-request bug.

Under A, declare the ordinary source's automatic fulfillment policy explicitly
and qualify the complete source rule, historical occurrence and recovery seam.
Under B, declare the additional deliberate final source action and its current
authority. Item acceptance authority is not an independent right to complete
arbitrary requests; A needs its explicitly qualified automatic source consequence. Neither branch may infer new waiver/override, substitute visible
file counts, or weaken already-ratified source and access restrictions. Do not
freeze SQL layout, timers, routing or new infrastructure in this founder choice.

## Coverage and recording boundaries

Q01–Q21 are now ratified. Q22 addresses whole-request completion, following
Q21's item acceptance. Reviewer responsibility, actionable negative-review
outcomes, authorized remediation and broader file organization/libraries/
formats/public custody/disposition remain separate source-grounded grooming
work. This question does not pretend the entire Phase29 scope is complete.

At preparation no Q22 answer, ADR-0022 or new glossary term was recorded.
The subsequent selection/review and one fulfillment definition are recorded
below; all eighteen prior definitions and previous ratified decisions are
preserved. Formal owner/OpenSpec publication remains `/to-prd`; tickets remain
`/to-issues`; no implementation follows.

Local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Live develop
advanced from `800213405e2c51e07180e86ee8322355e0fdb4eb` to
`5cf4855dc322eafcccfeca0dd528695ae72832d9` through PR2172. The owner pass
inventoried 299 unique changed filenames over three pages, found no
apps/packages/supabase changes, and inspected relevant authority/owner/projection
semantics. The new content-addressed contract guidance preserves full referenced
owner sections; the relevant Workflow clauses do not settle Q22 or conflict
with Q21. This is not a semantic audit of all 299 files. No pull, private-data
read, provider action or new runtime test occurred. Native
fulfillment, actual roles/RLS/races and composed browser/AT/user behavior remain
unqualified; documentation and adjacent tests are not release evidence.

## Historical founder answer and review — before ratification, 2026-10-21

Conrad selected **A — Complete when all source requirements are satisfied**,
requesting excellent UX/UI, flexibility for staff/tenants and no overengineering.
The [completed review](phase29-q22-adversarial-review.md) recommends **Accept with
required amendments**. The exact corrected decision, Q22-C01–C08, Q22-P01–P18,
ten journeys, ten lifecycle distinctions, six controls and one glossary definition
await ratification. The [feature ADR](../docs/adr/0022-source-owned-request-fulfillment.md)
records selected/reviewed status. Q23 has not been asked.

The ordinary native source fulfills when its complete current qualified rule
is met, without a separate routine finish click. Q21 staff acceptance remains;
genuine final obligations and existing authorized source alternatives/requirement
changes remain. No generic hold/waive/reopen power or tenant mode builder follows.
Complete authoritative facts, exact current authority and every relevant change
path govern. Concurrent final updates cannot lose progression or prematurely
close work. Coherently preserve one durable effect, actual source occurrence F,
attribution, required history/follow-up and inherited access eligibility.

Source-certified nonblocking optional work does not delay completion; durable
receipts/history cannot disappear or become accepted by closure. Required
corrections and real aggregate dependencies retain Q03 ordering. Transfer alone
is not admission. Unknown outcomes need source recovery, not repeated human
review, false success or backdating. Q06–Q19 access and current restrictions
remain; late source completion cannot revive expired participant authority.

Keep one meaningful action in the existing review context, explain its possible
consequence and show actual item/request results. Preserve authorized context,
discard stale cross-user/tenant/request/purpose responses, and keep independently
known results/actions usable during ancillary preview/history failures. Unknown
required authority remains closed. No new completion message, access grant,
routine confirmation or full Workflow Studio dependency is selected.

Document Request Fulfillment is the single added definition; prior eighteen
terms remain unchanged. Independent owner/runtime/UX reviews and the complete
22-category synthesis establish the proposed contract, not runtime qualification.
Native source/role/RLS/race/restore/workload/browser/AT/user proof is still required.
No new runtime tests, private-data/provider action or implementation occurred.

Fresh live develop is `dfaa201242c6ad468bf2d343aa18e8f223f67c5c`; the owner pass
inventoried all 40 PR2175 paths from 5cf4855 and read the relevant modernization
contracts. No relevant product completion-owner change was found; framework/
tooling dependencies did change. Local remains 3d85897 without pull. The prior
preparation snapshot above is historical evidence, not a conflicting current claim.

## Ratification — 2026-10-21

Conrad subsequently ratified Q22 A and its complete required amendments:
corrected decision, Q22-C01–C08, Q22-P01–P18, ten journeys, ten lifecycle
distinctions, six controls and Document Request Fulfillment. The C06/P14
browser-context/partial-failure extensions are included. Earlier selection/
review text is dated provenance; the ADR and full review now record adoption.
Q23's answer, native qualification/implementation and formal publication are
not inferred. All nineteen glossary definitions remain unchanged.
