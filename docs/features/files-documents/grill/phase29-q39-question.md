# Phase 29 Q39 — Reusable ordinary request item templates

**Status:** Historical researched question prepared 2026-10-23, Asia/Bangkok.
Conrad selected Q39 A and fully ratified every required amendment and the exact
new Document Request Template glossary term on2026-10-23. Q01–Q39 and25 terms
are ratified grooming intent; the prior24 definitions are unchanged. Earlier
preparation/review entries below are dated history. No implementation,
activation or formal owner/OpenSpec publication follows.

## Historical question and alternatives

**Should authorized staff be able to save reusable ordinary request item lists
and instructions, then use them to start a new editable request draft?**

The choice is optional reuse of ordinary request definitions. It is not a new
form builder, a live link between requests, an automated send, or permission to
copy an earlier recipient's documents and decisions.

| Option                                                              | Practical behavior                                                                                                                                                                                                                                                                                      | Main tradeoff                                                                                                                                                                                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A — Allow reusable item templates for new drafts (recommended).** | Authorized staff save and maintain a named, source-compatible set of ordinary item definitions/instructions. In the existing new-request flow, staff may choose a template, review the copied items and adapt that independent draft before ordinary issuance. Starting from scratch remains available. | Avoids repeated setup when the same request pattern recurs and supports more consistent wording. Adds a small template lifecycle, permissions and stale-content safeguards; it must not become a generic template/workflow platform. |
| **B — Keep requests individually authored.**                        | Staff compose each ordinary request through its existing contextual authoring flow, using current source defaults where available. No tenant-maintained item-template catalog is added.                                                                                                                 | Fewer objects and maintenance duties; suitable when requests differ or repeat infrequently. Repeated items must be reconstructed or manually copied with review, which can waste time and allow wording to drift.                    |

**Recommend A as an optional convenience within the ordinary request source.**
Reusing item definitions is a narrower capability than duplicating a whole
request or building another workflow engine. Staff can still tailor every draft
and use B's ad-hoc path. The value depends on actual recurring work; this session
has not measured recurrence, time savings or ministry demand. Those benefits
are plausible product judgments, not verified user research.

Q38 remains intact: no general document-body search is added, and efficient
template use is not a claim of zero infrastructure cost. No provider, new
search service or paid dependency is selected by this question.

## Concrete example and user journey

Illustrative example, not an observed ministry workflow: Elena regularly
creates an ordinary request containing two source-admitted items, **Project
summary** and **Equipment list**, with the same basic instructions.

Under A she saves that reusable item set, selects it when starting another
request, and adjusts the copied Equipment list instructions for the new case.
The template and earlier requests retain their own wording. The new request's
actual source/recipient, relevant reviewer responsibility, dates/access and
notification choices come from its current authorized context and normal
issuance flow. Valid current defaults may prefill those fields; staff should
not retype information the source already knows.

Under B she constructs those items each time. That is reasonable if the work
rarely repeats; there is no template catalog to maintain. When it does recur,
the repeated setup and manual text copying are real costs.

With either option, an external recipient sees the ordinary request experience.
Choosing or saving a template sends no message, grants no access and requests
no documents. Later template edits do not update that recipient's issued
request; actual changes still use Q36/Q37 or another qualified source command.

## Current primary research and strongest alternative

Official documentation retrieved 2026-10-23 supplies comparable patterns,
not authenticated vendor tests or evidence that Asym staff have identical needs.

- [TaxDome's client-request template guide](https://help.taxdome.com/article/1703-client-requests-basic-create-apply-templates)
  supports creating templates and applying them to new requests, with edits
  affecting subsequent requests rather than existing ones. Removing a template
  leaves requests already created from it intact. The same guide warns that
  applying a template can overwrite entered draft data. Core should preserve
  deliberate review and avoid silent input loss; vendor overwrite behavior and
  permission roles are not imported.
- [TaxDome's client-request overview](https://help.taxdome.com/article/1597-client-requests-overview)
  supports ad-hoc authoring without templates and recommends templates when
  similar questions recur. This is a credible B alternative, not a claim that
  every request needs a template. Its account, login, automatic-completion and
  bulk-send rules are different product decisions and do not alter Core.
- [Content Snare's first-request guide](https://contentsnare.com/help/knowledge-base/getting-started/)
  demonstrates choosing a template, customizing a request without changing the
  original template, and previewing before sending. This supports independent
  drafts and normal deliberate issuance. Its preset reminders and access rules
  are not adopted.
- [Content Snare's template FAQ](https://contentsnare.com/help/knowledge-base/templates-faq/)
  demonstrates template authoring/copying and warns that test-prefilled content
  can become client-visible. For Core, reusable definitions must be separated
  from recipient-specific answers, evidence and sensitive example values.

The [comparative research](phase29-q39-comparative-research.md) retains source
dates, product/edition limits, further comparisons and complete journeys. The
evidence favors an optional starter for repeated work, not mandatory templates,
automatic propagation, bulk issuance or a new platform. There is no measured
Asym benefit or cost estimate to claim.

## Governing boundaries and why the question is open

The [owner research](phase29-q39-owner-research.md) and
[runtime research](phase29-q39-runtime-research.md) retain exact contracts and
current-code evidence. The following constrain either option:

1. **Ordinary source-owned content only.** The ordinary request source owns the
   reusable definitions and the draft/issuance boundary; P29 custody does not
   acquire that authority. Reuse only item names, instructions and other
   source-admitted definition fields compatible with the new request. This is
   not generic arbitrary JSON, executable rules, specialist evidence policy or
   a schema designer. Templates may not bypass actual source restrictions.
2. **Copy definitions, not completed work or authority.** A new draft gets its
   own item identities and no copied evidence, submission, acceptance, review
   history, participant assertion, old grant or communication occurrence. The
   current source/recipient/purpose and Q24/Q25 review responsibility, clocks
   and actual delivery choices remain separately qualified. Fresh resolution
   can reuse current trusted defaults; it does not imply extra approval or
   repeated manual entry.
3. **Independent drafts and issued requests.** Applying an available permitted
   template copies a known definition basis. Editing a request does not edit
   the template; editing or retiring a template does not silently rewrite or
   delete already copied drafts or issued requests. Current source restrictions
   still apply at later use/issuance. A previously copied draft does not need a
   perpetually active template, but its own content and authority must qualify.
4. **Template visibility is not request authority.** Use, maintain and share
   reusable definitions only under their actual tenant/source rights. A template
   name, description and instruction text can be sensitive. Saving from a draft
   must deliberately identify reusable fields and make the sharing scope clear;
   do not automatically carry people, case-specific facts or example answers
   into a reusable catalog. No classifier can guarantee removal of private prose.
5. **No silent overwrite or stale substitution.** Show the selected item set
   and preserve existing draft input. A template that materially changes or is
   retired before application requires an honest current outcome; do not quietly
   apply a different latest version. Retries cannot duplicate draft items or
   issue a request. Copy provenance must distinguish the chosen template basis
   from the source's eventual published request instructions, without creating
   another general versioning platform.
6. **Keep publication where it belongs.** A template is a non-executable starter.
   Creating, editing, selecting or copying it does not issue work, publish a
   workflow, resolve review coverage, grant access, set a new clock or schedule
   a notification. After issuance, Q33/Q34/Q36/Q37 and actual source contracts
   govern changes. Template editing is not a bypass or bulk amendment command.
7. **Respect adjacent owners.** P17 email templates, Payload page templates and
   P34 workflow/form publications are separate objects and permissions. Their
   mechanics may be reused only where compatible; they do not prove native
   request-item templates exist. GEN-06 remains disabled pending exact owner
   qualification. A neither activates it nor makes the whole future Studio a
   prerequisite.
8. **Scope the interface proportionately.** Use the existing request authoring
   flow with optional Choose template/Start from scratch, a reviewable item list
   and current defaults. No required marketplace, tenant schema designer,
   conditional-logic engine, automatic template subscription, extra approval
   stage or recurring template-review bureaucracy follows. A has genuine
   permission/content-maintenance work; B has genuine repeated-authoring work.

Q36 excludes using a template to rewrite existing requests and Q37 qualifies
deliberate issued-item instruction revisions; neither chooses this optional
new-draft starter. Q28 already excludes automatic evidence matching, and P23
Media already has its own duplicate/reuse rule. Those were rejected as the next
generic question to avoid reopening settled behavior. Search/folders and P28
resource curation are already required/settled; provider choice is engineering
qualification. Added/revised-request awareness remains an explicit unresolved
communication frontier, without borrowing another notice's purpose.

## Journeys and acceptance direction

These are design boundaries for the subsequent selected-answer review, not a
claim of an adopted Q39 contract or native qualification.

| Journey                                                 | Required outcome if A is chosen                                                                                                                       |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff creates a one-off request                         | Start from scratch remains quick; no template setup or compulsory catalog visit.                                                                      |
| Staff repeats an ordinary item set                      | Preview/select a permitted compatible template and adapt an independent draft using current source defaults.                                          |
| Staff has already typed draft content                   | Keep that input; any deliberate replacement is reviewable and recoverable. No vendor-style silent overwrite.                                          |
| Staff saves reusable definitions                        | Explicit reusable-field scope, safe name/description and visible sharing; no evidence, recipient answers, case history or old access settings copied. |
| A template is edited or retired                         | Future use reflects actual availability/current basis; existing copies remain independent and current source rules still qualify issuance.            |
| Staff uses stale template selection or loses permission | Refresh/deny safely, preserving lawful draft work; do not disclose forbidden template text or silently substitute new content.                        |
| Two staff edit/apply or the connection drops            | Coherent chosen basis, stable copy/retry identity and truthful result; no duplicate items, partial unnoticed apply or accidental send.                |
| Reviewer works a request made from a template           | Q21/Q24/Q25 acceptance/responsibility remains actual and current; template authorship grants no review power.                                         |
| Donor, missionary or external recipient                 | Same source-qualified request experience, no template choice/account requirement or extra participation step.                                         |
| Keyboard/AT/mobile/IME/RTL/low bandwidth                | Accessible named controls, readable long/localized text, stable focus/input, clear loading/retry and no drag-only editing requirement.                |
| Tenant administrator/source maintainer                  | Maintain eligible reusable content without a second permission engine or mandatory new approval process. Other tenants/sources remain isolated.       |
| Specialist or automated workflow caller                 | No unqualified item type, form schema, executable recipe, source action or automatic issuance is admitted by a template.                              |

Proof should verify independent copied content, no propagation, no copied
authority/evidence, current source validation, cross-tenant/template disclosure,
safe apply/edit/retire races, replay after lost response and composed staff/
recipient journeys. A save/copy unit test alone does not establish those outcomes.
No speculative numeric throughput, benefit percentage or cost neutrality is
asserted; native design must qualify finite supported workload and content limits.

## Current implementation and evidence limits

Fresh local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; reviewed
live develop remains `4e31ff33fc63063dafd8678298e74ce0c2eee894`. No new live
delta from the Q38 review was observed. Local and live remain distinct; no pull
or deployed-state claim follows. The runtime note identifies existing CMS draft
copying and email-template helpers as adjacent patterns, with different rights
and lifecycle, not native request-template proof.

Q38's exact decision and full amendment tables are preserved, with all24 glossary
definitions byte-unchanged. This turn performs documentation/research and
read-only repository/primary-source verification only: no implementation,
private rows/files, provider mutation, real messages, native SQL/RLS/load/race/
browser/AT tests or user study. No new account billing claim is made.

## Historical preparation scope and snapshot

Independent full-question checks are closed. Owner, runtime and UX reviewers
read the complete question and found no unresolved material gaps. Their notes
retain source/runtime distinctions and complete journey coverage. Deterministic
checks verify Q38 exact adoption, glossary/file preservation, links and
formatting; they do not qualify native behavior. Conrad chooses A or B; that answer receives its own full adversarial
review. No Q39 answer, ADR or glossary term is inferred. Formal owner/OpenSpec
publication `/to-prd`; tickets `/to-issues` remain later authorized stages.

## Historical founder answer and review — before ratification, 2026-10-23

Conrad selected **A — Allow reusable item templates for new drafts**. The
[full review](phase29-q39-adversarial-review.md) gives **Accept with required
amendments**. The [feature ADR](../docs/adr/0039-reusable-ordinary-request-templates.md)
records the exact twelve-paragraph corrected decision. Q39-C01–C12/P01–P30,
all22 categories,18 lifecycle distinctions,24 journeys,8 measurement rows and7
operating controls form the complete reviewed package. All24 current glossary
definitions and Q01–Q38 remain unchanged. The proposed twenty-fifth term,
**Document Request Template**, is recorded in the review/ADR and awaits full
amendment ratification before insertion in CONTEXT.md.

Allow optional ordinary source-owned reusable item definitions/instructions
into independent never-issued drafts; preserve Start from scratch and valid
current instance defaults. The actual source/P12 powers separately govern
template visibility/use/maintenance, draft work and issuance. P29 custody and
adjacent CMS/email/PDF/workflow objects supply no portable authority. GEN-06
remains disabled and the whole Studio is not a prerequisite. No form builder,
marketplace, generic merge engine, automatic issuance or notification is added.

Copy only explicit admitted definition fields, never prior recipient/source
record, answers/evidence, acceptance/reviews, grants/proof, actual responsibility,
clocks or communication plans. Show reusable prose and actual sharing scope:
field allowlists cannot remove private case facts inside legitimate instructions.
One deliberate Save creates a coherent validated nonempty saved revision;
working autosave must not expose half-edited shared content. No extra Publish
ceremony, second approver or recurring review bureaucracy is required.

New Apply binds the exact reviewed usable saved revision/current availability
basis and expected never-issued draft basis under current source authority.
Edit/retire/restriction-first yields honest conflict/refresh; copy-first creates
independent content. Re-enabling after retirement establishes a current basis
and cannot automatically revive stopped/uncommitted old applications. Preserve
typed draft input/instance choices; no implicit append, overwrite, latest-version
substitution, invalid-item drop or name-based deduplication. Any offered deliberate
replacement is reviewable, coherent and recoverable; a generic merge system is
not required.

Persist complete copied definitions/fresh item identities/origin/history/result
coherently. Reconcile a matching committed operation before new-use eligibility
under current result disclosure, even after template retirement or draft edit/
issuance. Never reapply over later work, create duplicates, rewind availability
or use a new key as unknown-outcome repair. Independent copies survive routine
catalog changes/author departure; current applicable privacy/source restrictions
still govern. Retirement is not deletion, cancellation, recall or immunity from
lawful disposition. Supported current correction/privacy paths avoid routine SQL.

Actual issuance validates the current draft and existing source/recipient/
Q24/Q25/access/communication predicates. Inert preparation does not need issuance
readiness or recipient presence. Issuance/apply races have one source order;
issued changes retain Q33/Q34/Q36/Q37 and source-required constraints. Template
editing changes no existing request requirement, evidence, acceptance or clock.
Current allowed future definition defaults are not prohibited. Q38 metadata-only
general search remains unchanged; no body corpus or free-operation claim is added.

Require effective tenant-aware relationships, typed content/identity/time,
trusted attribution, non-retargetable rows, grants/RLS USING/WITH CHECK and all
read/write/privileged/Local API paths. Current code illustrates reuse risks:
email mutable update/history/binding are separate and duplication activates;
CMS req propagation alone does not prove Local API collection access. These are
bounded implementation observations, not alleged deployed Q39 vulnerabilities.

Use a scoped optional chooser, visible item preview/sharing and ordinary editing
with truthful Saved template/Draft prepared/Request issued outcomes. Preserve
lawful input/focus through errors and slow networks; support keyboard plus a
non-drag single-pointer reordering alternative, AT/mobile/reflow/IME/RTL/Unicode
and safe content rendering. Recipients/reviewers get the normal request journey,
without extra template/account/approval steps. Establish finite native workload,
latency, recovery/retention and resource budgets, safe rollout/restore and actual
composed proof before activation. No unmeasured saving or price guarantee.

Independent whole-report/ADR owner/runtime/UX reviews are closed with complete
proof/journey crosswalks and reconciled precision findings. Current primary
comparisons include TaxDome, Content Snare and FileInvite; overwrite, prefilled
private content, autosave and destructive deletion are counterevidence, not Core
defaults. No Asym staff study or authenticated vendor-account test is claimed.
Fresh local3d85897/live4e31ff33 remain distinct and unchanged since the question.
No implementation, hosted SQL/private content, provider mutation or native
RLS/race/load/restore/browser/AT test occurred. Documentary preservation/parity/
links/formatting qualify this record only.

Q39 A is selected and fully reviewed. The full amendment package and proposed
glossary term await ratification; Q40 is not asked. Formal owner/OpenSpec
publication /to-prd and tickets /to-issues remain later authorized stages.

## Full ratification — 2026-10-23

Conrad explicitly instructed on2026-10-23: “Yes, fully ratify Q39 A with all
required amendments, including the new glossary term. Record it and move to
the next question in this Phase 29 grill-with-docs session, with research,
practical options, and your recommendation.” The exact twelve-paragraph
corrected decision, C01–C12/P01–P30, all22 categories,18 lifecycle distinctions,
24 journeys,8 measurement rows and7 operating controls are adopted without
substantive change. The exact Document Request Template definition is added;
all24 prior glossary definitions remain byte-preserved. Q01–Q39 and25 terms
are fully ratified grooming intent.

Preserve optional ordinary source-owned definitions, deliberate coherent Save,
explicit content/sharing review, exact reviewed revision/availability and target
draft basis, complete independent copies, committed-effect reconciliation before
new eligibility, current source/privacy rights and ordinary issuance. Retiring
then making a template available cannot revive stopped/uncommitted application;
matching committed copies still reconcile first. No copied evidence/authority,
silent overwrite/append, live propagation, new notification, workflow engine or
general body-search scope follows. Current valid defaults and fast ad-hoc work
remain; actual native qualification is separate from this adoption.

The review's source/runtime/primary-research snapshots remain dated evidence;
Q40 research records current freshness. No Q40 answer is inferred. Formal
canonical owner/OpenSpec publication remains /to-prd; tickets remain /to-issues.
