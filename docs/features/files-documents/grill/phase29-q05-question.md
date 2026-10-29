# Q05 — what recipients can see after a file is corrected

**Status:** Historical researched question, prepared 2026-10-20. Conrad
selected and then ratified A with the complete required amendment package on
2026-10-20. Q01–Q05 are ratified grooming intent. No formal specification,
implementation or release is implied.

## Situation and one decision

The recipient can now be confirmed for a private request, see receipt/status,
view a qualified current submission, send an eligible correction and download
its qualified unchanged original. These are ratified intentions, not completed
runtime capabilities.

Consider an illustrative case: Alex submits a scan on Monday and sends a
correction on Tuesday. Asym records both received acts, and the Monday
submission is no longer the current candidate for that corrected member.
When Alex returns, a short history can explain what arrived and when. A
separate choice is whether Alex can reopen the Monday scan itself.

**After a correction, should ordinary request recipients see current files
plus a concise submission history, or also be able to open and download the
superseded files?**

Here, **superseded files** means exact earlier submissions within the corrected
member's lineage. An older supporting file that was not corrected can still be
current. This is not a single newest-file rule for the entire request.

Assume the same recipient currently has permitted request access. This question
decides historical content scope, not how long access lasts after closure.

## Practical options

| Option                                                              | Experience                                                                                                                                                                                              | Benefit and cost                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A — Current files plus concise submission history (recommended)** | Keep eligible View and Download actions on current files. A secondary history shows source-approved received/corrected events, without ordinary preview or download of superseded files.                | Makes the current work and correction outcome clear while limiting routine historical disclosure. A person needing to inspect an old file must use a permitted source help/delivery route or an existing local copy; history metadata alone cannot show the old content. |
| **B — Also allow access to superseded files**                       | Keep current work prominent, with a secondary Earlier submissions area for exact own superseded files. Offer historical View and Download only where each action is currently authorized and qualified. | Better self-service for checking what was previously sent or explaining a discrepancy, especially with identical filenames. Adds historical disclosure and more eligibility/version states; retained files may still be unavailable under current source rules.          |

Both options include only a currently source-authorized participant projection.
Neither exposes the staff audit log, internal assessments, other recipients'
material or all files ever uploaded by that account.

Both preserve required source evidence and the wider staff File Manager's
history capability. A does not delete history or prohibit independently
qualified specialist history. B is a legitimate task-specific history, not
automatically a personal drive. Neither grants restore, undo, bulk export,
permanent access or a new retention period.

## Recommendation and strongest counterargument

Choose **A for the ordinary native request**. It gives the recipient a clear
record that the original and correction arrived and identifies which file is
now relevant, without routinely reopening material corrected away. It fits
the bounded task while preserving source evidence and current-file access.

This is a product judgment, not a universal modern-practice rule or a measured
ministry preference. No research here establishes how often Asym recipients
need an earlier file's contents.

The strongest case for B is real: repeated corrections with identical names
can make a short history insufficient. If Alex needs to check which page was
missing in Monday's scan, only its contents can answer that; a timestamp cannot.
Self-service historical reading could avoid a staff exchange. If this is a
core ordinary recipient need, B is coherent within the existing task and can
be selected without adopting a general drive.

Conversely, a superseded file might be the wrong sensitive attachment. Prior
upload or retained custody is not continuing authority to redisclose it.
Under either option, current source rules control metadata as well as content.
The recommendation weighs that broader access against the presently evidenced
task; it does not claim B is unsafe when correctly qualified.

## Research that informs the choice

Current primary guidance supports understandable history, but the term history
does not consistently mean downloadable earlier attachment bytes:

- [Foundant's GLM Applicant Tutorial](https://support.foundant.com/hc/en-us/articles/4479853059991-GLM-Applicant-Tutorial),
  updated 22 April 2026, distinguishes active/completed/historical requests and
  permits viewing submitted forms. Its historical requests and form-packet
  PDFs do not establish access to every superseded attachment within a request.
- [Odyssey's application-history guide](https://support.withodyssey.com/hc/en-us/articles/46054678987035-How-to-Edit-Application-from-the-Application-History),
  updated 30 January 2026, documents previous resubmission dates and who updated
  the application. It supports a concise change history, but does not establish
  older-file retrieval. Its program-specific attestations are not imported.
- [Submittable's Original/Current download guide](https://submittable.help/en/articles/5345124-why-do-i-see-two-download-options-for-a-submission),
  dated 8 December 2025, concerns versions of the completed form in a described
  upgrade/edit situation. Combining that with its separate individual-file
  download guide does not prove an archive of every old uploaded original.
- [GOV.UK's Details guidance](https://design-system.service.gov.uk/components/details/)
  supports keeping secondary information available without distracting from
  the main task. This favors a modest secondary history presentation, while
  keeping current status, errors and required actions visible. It does not
  mandate one particular component or collapsing every history.

These are documented product behaviors and design guidance, not an authenticated
comparator test or participant usability study. The
[comparative research](phase29-q05-comparative-research.md) records additional
primary sources and their role, edition and evidence limits.

## UX direction under either choice

Keep the current files, current checking/review status and next permitted
action prominent. Present a small **Submission history** section in the same
item rather than a File Manager detour.

Use understandable event labels such as **File received** and **Correction
received**, with permitted dates and an unambiguous current/earlier relationship.
Do not call a file accepted merely because the upload or correction arrived.
Do not bury a current error or required action in a closed history panel.

History details are a projection for this recipient: an old filename, timestamp,
actor or even an event count can be sensitive. Show only what the source permits
now. A compact history can omit the earlier filename without pretending the
source evidence was erased. It must not expose staff notes, internal restriction
reasons or parser diagnostics.

If B is chosen, older-file actions need persistent **Earlier submission**
context, exact file selection and independent preview/download qualification.
They never restore the file as current or cause an automatic download. No
comparison editor, Restore button, timeline package or new account is implied.

Maintain Core's Base UI/base-maia shared controls and semantic styling.
Readable dates/timezones, keyboard and screen-reader navigation, touch targets,
long/RTL names and limited mobile space need qualification. Current-state
updates should not repeatedly announce the entire history or steal focus.

## Repository reconciliation and boundaries to pressure-test

Local and live GitHub develop were rechecked at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab`. The
[owner research](phase29-q05-owner-research.md) and
[runtime research](phase29-q05-runtime-research.md) distinguish accepted
contracts from implemented seams.

1. Q02–Q04 deliberately reserved recipient history. Retaining exact prior
   submissions and providing useful staff history do not by themselves grant
   recipient historical content access.
2. Q03's admission-time predecessor fence and no-silent-revival rule remain.
   An earlier submission does not become current because its correction fails
   checks or someone views it. Other supporting files retain their own state.
3. B would add an explicit historical selection and action scope. It cannot
   turn a stale current-file URL into permission to read a superseded file or
   silently substitute a new one. Q04's current-read race rule remains intact.
4. A still requires an authorized history projection; a raw audit-log query is
   not sufficient. Receipt events derive from durable source outcomes, not
   local selection, an incomplete transfer or a repeated transport attempt.
5. Current principal/request/item lineage controls access. Recipient change,
   mailbox equality, Party merge or shared byte hashes cannot transfer history.
6. Access, safety, retention, holds and disposal remain independent. A does not
   purge predecessors; B does not extend retention, preserve all previews
   forever or promise already-disposed bytes.
7. P18 official documents, P21 evidence, P26 conversations and other
   specialized sources retain their own histories and permissions. Neither
   option is a platform-wide ban or grant.
8. The bounded runtime census found no qualified generic recipient historical
   file path. A PDF authoring Version History placeholder, email-template
   restore code, Support attachment chips and session-local review results are
   not proof of that capability. Neither option is implementation complete.

## Sequencing and evidence limits

This question comes before post-closure access because it determines what
continued access could include. No access window, proof-refresh schedule,
history-count limit, retention period or general tenant policy builder is
selected here.

At question preparation, no new tests were run; Q04's earlier mocked tests
were not counted as Q05 proof. No code, dependency, provider, permission, GitHub
or formal-specification change occurred, and no Q05 ADR/glossary term had yet
been created. These are dated preparation facts. Formal publication remains
gated on `/to-prd`; tickets on `/to-issues`.

## Historical founder answer and completed review — before ratification, 2026-10-20

Conrad selected **A — Current files plus concise submission history**, requesting
deep modern UX/UI research and a full adversarial review. The
[completed review](phase29-q05-adversarial-review.md) recommends
Accept with required amendments: exact corrected decision, Q05-C01–C20,
Q05-P01–P24 and eight operational controls. The
[feature ADR](../docs/adr/0005-current-files-and-participant-submission-history.md)
and Submission History glossary term record the selection; the detailed package
awaits ratification. The review adds 23 passing existing isolated seam tests,
without claiming new recipient-history implementation or real-role/browser
qualification. Q01–Q04 remain unchanged. No next question is asked here.

## Ratification — 2026-10-20

Conrad subsequently ratified A and all required amendments: the corrected
decision, Q05-C01–C20, Q05-P01–P24 and eight operational controls. The preceding
selection/review account remains dated provenance. The ADR and completed review
now record adoption. No further continuity/duration choice or runtime/publication
authority is inferred.
