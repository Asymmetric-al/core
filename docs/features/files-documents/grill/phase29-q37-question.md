# Phase 29 Q37 — Revise an outstanding item's instructions after issuance

**Status:** Historical researched question prepared2026-10-23, Asia/Bangkok.
Conrad selected Q37 A and fully ratified every required amendment, including
the exact new glossary term, on2026-10-23. Q01–Q37 and24 definitions are
ratified grooming intent; the prior23 definitions remain unchanged. Earlier
preparation/review entries below are dated history. No implementation,
activation or formal owner/OpenSpec publication follows.

## Historical question and alternatives

**May authorized staff deliberately revise the material participant-facing
instructions for the same outstanding, unaccepted ordinary Document Request
Item after issuance, or should the issued instructions remain fixed and changed
work use an existing qualified replacement/new-request route?**

This is about changing what the same item asks the participant to provide while
the request is still eligible and unfinished. A clarification that merely explains
the unchanged requirement can already use Q30. A different document need can use
Q36. Q37 does not permit changing the intended recipient, purpose, requested
document type, requiredness or accepted/terminal history through an instructions
editor, nor editing a global template and silently changing other requests.

Q01-C08 already requires source-owned versioned successors and currentness
fences when material instructions change. Q23-C03 says review feedback must not
silently change the requirement; a real change needs its own qualified source
command/version. Those constraints do not establish a direct ordinary item
revision capability. Q36 explicitly left existing-item rewriting outside its
scope. The open product choice is this bounded source command versus keeping
issued instructions fixed—not whether to preserve history or enforce permission.

| Option                                                                                                | Everyday experience                                                                                                                                                                                                            | Benefit                                                                                                                                                                | Cost and consequence                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Allow a deliberate versioned instruction revision for the same outstanding item (recommended)** | Authorized staff use Update instructions on the existing eligible item, review the changed expectation and publish a prospective revision. Earlier submissions remain tied to the instructions under which they were received. | Corrects an omission or mistaken instruction without fragmenting the same document need across items/requests; keeps the participant's work and conversation together. | Staff and participant must understand which instructions now apply. Requires exact current source/access/review authority and safe ordering against acceptance/completion; prior evidence is neither automatically rejected nor automatically accepted under the new basis. |
| **B — Keep issued item instructions fixed**                                                           | Use Q30 for explanation that leaves the requirement unchanged. If the requirement actually changes, use independently qualified Q33/Q36 replacement or a new request where permitted.                                          | Keeps the issued expectation stable and avoids a direct same-item material revision capability.                                                                        | Can create more item/request contexts and handling. Removing the final blocker may fulfill the original before another item can be added; B does not imply an atomic Replace command or a hidden completion hold.                                                           |

**Recommend A**, narrowly for the same ordinary document need, intended recipient
and continuing purpose, while the item is outstanding and unaccepted and its
request genuinely unfinished. This is more flexible for a correctable instruction
omission, without broad live editing. Preserve B for a genuinely different need,
an ineligible/accepted/terminal source, or a source unable to qualify safe revision.
Neither route bypasses adverse restrictions or the owning domain's permissions.

## Concrete example and practical consequence

Illustrative scenario, not an observed ministry workflow: Elena requests an
equipment inventory from Nora for an ordinary handover. Nora uploads the list,
but it is not yet accepted. Elena discovers that the instructions omitted the
need to include serial numbers for that same inventory.

Under **A**, Elena deliberately updates that item's instructions. Nora can see
that the expectation changed, while her earlier file remains recorded against
the original instructions. A reviewer may determine that existing evidence
already meets the current requirement, or the source may lawfully request the
missing information through its qualified current correction route. The edit
alone does not reject Nora's file or require uploading identical evidence again.

Under **B**, the original instructions remain true and unchanged. Staff use the
actual qualified source route for the new expectation, potentially a replacement
item or separate request. If ending the old demand fulfills the request, Q36
cannot then add an item to that terminal request. Do not advertise “replace in
place” as an already-ratified compound operation.

If Elena instead needs a separate packing list, that is a new item under Q36,
not an instruction edit disguised as the same inventory. If Nora's inventory
has already been accepted, Q37's proposed ordinary revision is unavailable;
historical acceptance and capable source remediation remain separate.

## Current primary research and strongest alternative

- [Content Snare: editing sent requests](https://contentsnare.com/help/knowledge-base/editing-requests-after-sending/)
  documents live request editing and changes visible on the client's next
  opening. It also warns that deleting populated fields can delete answers.
  This supports correction flexibility, not importing destructive editing,
  unrestricted autosave publication or automatically changed time periods.
- [FileInvite: modifying a sent Invite](https://help.fileinvite.com/modifying-a-sent-invite)
  documents editing existing requests after sending. Its contact, due-date,
  reminder and resend behaviors are separate vendor capabilities, not Core
  permission or notification rules. The app and separate fileinvite.com editions
  are not conflated; no unsupported legacy/deprecation status is inferred.
- [TaxDome: client-request actions](https://help.taxdome.com/article/actions-with-client-requests)
  permits edits only before the client starts answering; viewing alone remains
  Pending. This is strong counterevidence to broad post-response editing.
  A pre-response-only compromise still needs exact in-flight/currentness rules
  and another route for later omissions; it is not proposed as a new tenant mode.
- [Submittable: changing a live Project or Form](https://submittable.help/en/articles/4925030-can-i-make-changes-to-a-live-project-or-form-after-receiving-submissions)
  warns that editing response-option wording changes its display on existing
  submissions, and removing fields removes them from existing views. This
  illustrates precisely why Core must preserve original submission meaning;
  it is not evidence that every Submittable editing path behaves identically.
- [W3C: predictable input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
  and [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  support deliberate consequential action and perceivable feedback without
  unnecessary interruption. They do not mandate a modal or prove conformance
  merely because Base UI components are used.

The [comparative research](phase29-q37-comparative-research.md) retains current
source dates, product/edition boundaries, additional context and UX implications.
The evidence does not establish universal consensus or measured Asym demand,
time savings, comprehension or reduced support burden. Recommendation A is a
bounded product judgment, with original expectation/history preservation as
its price. B's simpler stable definition is a substantive advantage.

Neither editing nor an updated-on-return cue proves that a person away from the
product has seen the change. Q37 selects no automatic instruction-change email
or reminder; existing outreach is usable only where its actual source purpose
permits it. The choice must not promise awareness, daily visits or a response SLA
that has not been established.

## Repository reconciliation and scope boundaries

The [owner research](phase29-q37-owner-research.md) and
[runtime research](phase29-q37-runtime-research.md) contain exact anchors and
consumed governing contracts. The selected-answer review must resolve the full
following implications if A is chosen; none is an already-qualified native path.

1. **Actual revision authority.** Editing participant instructions changes a
   source requirement basis. Current source/P12 authority must permit that exact
   ordinary revision. File read, reviewer assignment, task edit, generic admin
   status, existing Q23 feedback and Q36 addition powers alone do not grant it.
   Keep source definitions separate from P29 byte custody and task projections.
2. **Same item, preserved old basis.** Publish a prospective version rather than
   overwriting what was originally requested. Preserve submitted-under instruction
   revision, immutable evidence/receipts, feedback and history. The new expectation
   must be visible in the same authorized context; old feedback is neither
   automatically reinstated nor wholly resolved. Only actual superseded concerns
   cease to apply; independent substantive concerns remain.
3. **Existing evidence can remain useful.** Current qualified review may evaluate
   the same evidence against the explicit current requirement basis without
   fabricated reupload or participant affirmation. Do not fabricate an earlier
   rejection, copied acceptance, new receipt, correction or staff decision merely
   because instructions changed. Q03/Q21/Q23/Q28 retain exact evidence and actor
   rules. If something more is needed, the current source route must actually
   allow the participant or authorized staff to supply it.
4. **Current participant route and finite scope.** Q01 version/proof/scope rules
   remain; old tokens and equal email do not automatically authorize materially
   revised work. A useful revision needs a qualified original/fresh/expired route
   for required participant action, or an independently lawful staff-only route
   where no participant act is required. Preserve exact ends, earlier caps,
   adverse facts and narrowed grants. Q36's addition authority does not itself
   grant revision authority; do not borrow it silently. Normal completed reading
   requires actual timely qualified fulfillment; later completed-reading recovery
   stays within the actual fulfillment-created member/version/action/context
   ceiling and current restrictions, not the latest instructions/request definition
   or a union of historic grants.
5. **Actual source ordering.** Revision versus acceptance, correction, relevant
   Q30 text, Q33 removal and Q22/Q34 closure needs one qualified currentness order.
   Accepted/closed first denies ordinary revision. Revision first means an earlier
   prepared review cannot ignore its material new basis. Drafts never hold
   completion; there is no routine Complete action or grace window to allow edits.
   Preserve independently lawful unrelated items and work.
6. **Relevant responsibility and eligibility.** Reuse valid Q24 person/team
   coverage where it still covers the revised declared work, with Q25's relevant
   source-edit qualification rather than blanket original-issuance replay.
   Unknown required authority or unavailable required handling route leaves the
   proposed change uncommitted, without disabling unrelated lawful work.
7. **Honest timing and recovery.** Show the true instruction revision/admission
   time and remaining access; do not blame a recipient for omitting information
   before it was required, erase genuine prior lateness or reset due/access dates.
   Lost responses recover the same revision under current disclosure. Mistaken
   revisions need a lasting stage-correct source correction, not deleting history,
   silently unaccepting evidence, restoring stale grants or universal Undo.
8. **Small, accessible interaction.** Use the existing source/item context and
   a reviewable Update instructions action. Clearly distinguish current guidance
   and the submitted-under basis, with truthful known/unknown results, next actor,
   preserved permitted input/focus and mobile/AT/low-bandwidth handling. No general
   diff engine, mandatory acknowledgment, essay, second approver, new portal,
   compulsory download or account enrollment is proposed.
9. **No bundled unrelated powers.** This choice does not authorize arbitrary
   type/requiredness/recipient/purpose changes, accepted-item or terminal reopening,
   template-wide mutation, automatic email, a new reminder/default/channel or
   a generic amendment platform. Existing qualified notices keep their own actual
   triggering facts and controls; editing instructions cannot impersonate them.
10. **Prospective qualification.** Any selected capability requires exact owner
    reconciliation, native data/RLS/currentness/semantic replay/race/restore and
    composed UX proof, with canonical authoring and declared OpenSpec projections
    updated together at the authorized publication stage. Existing task CRUD and
    Workflow amendment vocabulary are constraints/reuse opportunities, not proof.

## User journeys to preserve in the selected-answer review

| Journey                                                         | Required distinction                                                                                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Omission found before any durable response                      | Deliberate prospective update if A; no autosaved demand or inferred guarantee that nobody is already working from the old instructions.                  |
| File already received, item unaccepted                          | Preserve receipt and submitted-under basis; genuine current reassessment or qualified supplementation, no automatic reject/reupload.                     |
| Existing file already contains the requested detail             | Review may accept it under the current basis if actual conditions hold; an instruction edit itself never constitutes acceptance.                         |
| Previous Changes requested feedback exists                      | Preserve its old basis; supersede only genuinely changed concerns and retain independent concerns without an endless stale-feedback loop.                |
| Participant uploading while staff edits                         | Distinguish selected/transferring from durably received; revalidate affected admission and reconcile uncertainty without guessing lost or received data. |
| Staff acceptance races revision                                 | Actual source order decides; no accepted-item rewrite or stale acceptance ignoring newly relevant instructions.                                          |
| Final source fulfillment/cancellation races revision            | Closure first denies the action; drafts/plans cannot hold the request open or silently reopen it.                                                        |
| Active original or fresh access                                 | Qualify revised instruction/action scope and proof context, preserve that period's end and narrow rights.                                                |
| Participant access expired                                      | Required participant work needs actual qualified access, not promise-only repair; independently lawful staff work creates no recipient grant.            |
| Staff can supply sufficient existing evidence                   | Q28/Q21 route may avoid participant action where allowed, without copied acceptance or forced renewal.                                                   |
| New instructions affect review coverage                         | Reuse actual valid person/team coverage or resolve the new declared need; no full-roster or routine extra-approval gate.                                 |
| Participant sees changed expectations                           | Show what applies now and the original submission basis; preserve progress and avoid retrospective blame or claims that opening proved understanding.    |
| Item accepted, no longer required, or request terminal          | Use actual qualified source remedy/new work; this proposed outstanding-item editor grants no reversal/reopening power.                                   |
| B uses Q33 then seeks Q36 addition                              | Ending the last obligation can fulfill the original. Do not promise atomic replacement, a draft hold or an Add action after closure.                     |
| Mobile, assistive technology, international text, low bandwidth | Clear labels/focus/status/currentness and localized instants, no hover/color-only meaning, duplicate revisions or private offline cache.                 |
| Different document need or changed purpose/recipient            | Use its owning qualified command; do not disguise it as instruction clarification or editing to avoid scope/identity policy.                             |

## Current implementation and evidence limits

Fresh local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; the final
reviewed live develop is `0026bcbe8b601586c29bba422675ce5889edd7b1`.
Two complete consecutive comparisons establish freshness from Q36's reviewed
`550c142e669ba4f3f4d3e0146aa2a37d9d70423a`: first to
`04febbf2f77ff3f089a68ae28e9dae9f28143a17` (9 commits/49 paths), then to
`0026bcbe8b601586c29bba422675ce5889edd7b1` (15 commits/117 paths). Each is
ahead-only with matching base/merge-base; the path counts are separate deltas,
not a claimed unique cumulative count.

Complete trees establish unchanged AGENTS/apps/packages/supabase and domain
docs/prds/adr/features. The overall docs and OpenSpec roots changed. Current
OpenSpec specs/contracts/project/config and relevant active product contracts
are unchanged; the sole changed active-change directory is repository
modernization, whose task diff marks an existing dnd-kit checkbox complete.
Changed authority/general and relevant canonical skill/UI guidance were read:
factory/Ready-label and skill-maintenance changes preserve product authority,
source boundaries, Base UI and the grooming/publication distinction. No checkbox
or tooling update is treated as native product qualification.

Freshly inspected care requirement upserts and personal task-description PATCH
mutate current fields; they do not establish native submitted-under instruction
revision, exact participant scope or ordering with source acceptance/fulfillment.
Adjacent financial retry/currentness helpers are not native qualification for
this new capability. No exhaustive runtime absence or deployed-state claim is
made. No pull occurred; prior research snapshots remain dated evidence.

No native runtime, actual-role SQL/RLS, provider, concurrency/load/restore,
browser/AT or intended-user tests ran. Public comparator documentation was read,
not exercised in authenticated accounts. No private rows, document bytes,
credentials, real messages or product/schema/provider mutations occurred.

## Historical preparation scope and snapshot

Q36's exact corrected decision,C01–C12/P01–P28,22 journeys,18 lifecycle
distinctions,8 measurement rows,6 controls and exact glossary refinement are
fully ratified without substantive change. The glossary still contains23 terms;
only Fresh Unfinished Request Access changes, preserving its Avoid line and
the other22 definitions. Current Q36 ADR/review/question/log/map/session record
adoption; independent review notes remain dated evidence.

Q37 records researched alternatives and recommendation only. No feature
ADR-0037, new glossary definition or selected answer is created. After Conrad
selects an answer, conduct its full adversarial review and exact amendment
package before full ratification. Formal owner/OpenSpec publication remains
`/to-prd`; tickets remain `/to-issues`.

Independent full-question checks are closed. Owner, runtime and UX reviewers
read all alternatives, journeys, source boundaries and evidence claims. Final
precision fixes distinguish actual fulfillment-created completed scope, real
FileInvite editions and away-from-product awareness. Owner/runtime reviewers
also classified the final live drift and preserved the question's conclusions.
This approves the researched question only; no Q37 selection is inferred.

## Historical founder answer and review — before ratification, 2026-10-23

Conrad selected **A — Allow deliberate, versioned instruction revisions**.
The [full review](phase29-q37-adversarial-review.md) recommends **Accept with
required amendments**. The [feature ADR](../docs/adr/0037-versioned-ordinary-item-instructions.md)
records the exact corrected decision. C01–C12/P01–P30,all22 categories,
24 journeys,19 lifecycle distinctions,8 measurement rows,6 operating controls
and one proposed glossary definition are the complete proposed package.

Allow a deliberate source/P12-authorized prospective instruction successor for
the same outstanding, not-currently-accepted ordinary item/document need in an
eligible issued unfinished request. Preserve type, requiredness, recipient,
purpose, technical/specialist limits and prior facts. No generic task/read/admin/
review/add-item authority or prose classifier grants this power. Currently
unaccepted does not mean never historically accepted; Q37 cannot clear acceptance
to manufacture eligibility. Drafts and exact current-material no-ops create no
instruction business revision or completion hold.

Keep three distinct bases: historical published instructions tied to actual
receipt/review, current authoritative instructions, and a later deliberate exact
current review. Preserve Q03 current candidates/predecessor fences. Revision
alone creates no bytes, receipt, correction, affirmation, acceptance, rejection
or Request changes occurrence. Q21/Q23 reassessment may use the same lawful
current evidence without identical reupload. Authoring can supersede an
instruction criterion but grants no review-resolution power or historical
decision rewrite. Qualified source rules determine applicability without an
ended criterion remaining a hidden blocker; independent concerns persist and
any required human review resolution remains its own authorized current act.

Coherently qualify actual instruction scope/route, relevant Q24/Q25 coverage,
history and durable reevaluation. Current original/fresh periods retain end/caps/
narrow rights; expired required participation needs separately authorized actual
fresh admission. Independently lawful Q28/Q21 staff work needs no renewal where
no participant act is required. A route means admitted authority and proved
capable handling, not prior acceptance or continuous technical availability.
Temporary delay preserves known publication with truthful state/owned recovery;
missing authority or a fundamentally absent route is not temporary delay.
Publication requires no recipient online presence, acknowledgment, completed
proof, rendering or mail. Protected use retains Q01 proof/current permission.

Actual relevant order governs revision versus receipt/correction, review,
Q30 context, NLR/freeze and F/C. Preserve unrelated work, source-certified
optional nonblocking semantics and full Q22 reevaluation. Fixed periods/targets
do not reset and new detail is not retrospectively late. Only actual timely F
creates its declared completed ceiling; future recovery cannot use current
definitions or historic grant unions. Narrow individual admissions are not
invented permanent global ceilings. Matching committed identity resolves under
current disclosure before new eligibility/no-op evaluation; replay never revives
an old revision/scope/concern or substitutes a newer result.

Use one reviewable Update instructions flow with current/proposed wording,
changed expectations, actual next actor, persistent true result and permitted
input/focus. No forced acknowledgment, essay, download, account, new diff engine
or routine extra approver. Retention is not historic-body access; source privacy
and safe rendering apply to all current/history/compare/export/cache paths.
Operative linked resources need qualified exact references or authoritative text;
no mutable-URL-only historical claim, crawler/archive/attachment platform or
revived deleted resource. Correct mistakes through a new eligible source act;
later accepted/NLR/frozen/terminal stages use real recorded source/privacy remedy,
not universal Undo, unaccept or a new request pretending to repair collection.

Structural/effective SQL-RLS/all privileged/private-path, concurrency/fault/replay,
bounded load, migration/restore and composed user/AT proof remain required.
Existing pending work/notices keep exact purpose/pins and their own affected
current-usefulness/action/disclosure rules; no blanket stop, fake event, sealed
rewrite, unknown-attempt rekey, recall or new revision-email purpose. Prospective
legacy baseline requires actual current authority and truthful capture; unknown
older basis remains unknown. No generic engine or whole future Studio dependency.

Propose **Document Request Item Instruction Revision** to distinguish instruction
versions from file versions and review decisions. Exact two-sentence definition
and Avoid line are in the review/ADR, pending ratification; all23 existing terms,
including Q36's Fresh Unfinished refinement, remain byte-preserved.

Independent whole-report/ADR/glossary owner, runtime and UX checks closed findings.
Fresh local3d85897/live0026bcbe remain distinct and unchanged from the final
question. Prior bounded drift evidence is dated, not whole-runtime equivalence;
generic care/task/financial helpers do not qualify native revision. No pull,
native tests, private data, real messages or product/schema/provider changes.
Documentation checks prove recording integrity only. Q37's complete amendments
and proposed term await ratification; Q38 is not asked. Formal owner/OpenSpec
publication `/to-prd`; tickets `/to-issues` remain separate stages.

## Full ratification — 2026-10-23

Conrad explicitly instructed on 2026-10-23: “Yes, fully ratify Q37 A with all
required amendments, including the new glossary term. Record it and move to
the next question in this Phase 29 grill-with-docs session, with research,
practical options, and your recommendation.” The exact corrected decision,
C01–C12/P01–P30, all22 categories,24 journeys,19 lifecycle distinctions,
8 measurement rows,6 operating controls and the exact Document Request Item
Instruction Revision definition and Avoid line are adopted without substantive
change. Prior23 glossary definitions, including Q36's refinement, are preserved.
Q01–Q37 and24 terms are ratified. The three instruction/receipt/review bases,
distinct authoring and review-resolution powers, actual capable route versus
temporary availability, fixed access periods and current disclosure fences
remain intact. Review snapshots and independent notes remain dated evidence.
No native qualification, implementation, formal publication or Q38 answer is
inferred. Publication `/to-prd` and tickets `/to-issues` remain separate stages.
