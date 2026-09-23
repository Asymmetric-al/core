# D38 — New Internal notes: write, leave, resume and post

**Current ratification — 15 September 2026:** The founder fully ratifies D38 A and all amendments, additions, adjustments, changes, updates and incorporated corrections. D1–D38 and all amendments are fully ratified. The [full ratification](phase26-d38-full-ratification.md) incorporates this entire record and supporting prose. Earlier proposed/pending/intent-only and no-Q39 wording below is historical, not a repeat approval gate. Original evidence and unexecuted-runtime limits remain unchanged.

**14 September 2026. A selected; detailed amendments proposed.** The founder chose automatic private Note drafts in My drafts. **Disposition: Accept with required amendments.** D1–D37 remain ratified; no Q39 advances. This is the finished proposed UX contract for grooming, not a rendered product or a claim that staff usability/runtime tests passed. [Research and evidence](phase26-d38-ux-research.md) explain the choices.

## The simple experience

Maya writes an internal note in a Support conversation. Before she is ready to share it, another request interrupts her. Her writing saves quietly. Later, **My drafts → Internal note → continue → Add note** brings her back to the same work. No save ritual, separate notebook, reconstruction of a CRM record or extra publication screen is needed.

The private draft and the posted note are different facts. The draft is her unfinished work. **Add note** deliberately publishes the currently reviewed content to authorized internal readers. Saving, mentioning someone in the draft or switching modes does not perform that publication or notify anyone.

The strongest alternative is explicit Save note draft; it gives deliberate retention control but creates a recurring step and a different habit from accepted Reply autosave. Local-only notes keep less durable content but cannot offer this return journey. A is selected. This blueprint makes A dependable without adding the unchosen modes as settings.

## UX01 — One existing destination, with clear kinds

Keep **My drafts** in D37's existing Support navigation, visible when empty and without a count, urgency badge or forced landing page. Update its helper to:

> Your private reply and note drafts across accessible inboxes.

Keep the same title search, Inbox filter, Refresh and Load more. Extend each row with a readable **Reply** or **Internal note** label. When both kinds exist for the same conversation, show two independently identified rows, each with its own accepted meaningful-save time and exact activation target. Repeated conversation titles are valid; the kind resolves their purpose without inventing private draft titles or using body snippets.

```text
My drafts
Your private reply and note drafts across accessible inboxes.

[Search conversation titles…]   [Inbox: All accessible inboxes] [Refresh]

Account question                                      Donor care
Internal note · Saved 4 minutes ago                         [More]

Account question                                      Donor care
Reply · Saved 12 minutes ago                                [More]

[Load more]
```

This fixture is illustrative. All title/inbox/source metadata must come from currently permitted projections. The kind marker describes the draft's purpose, not its audience authority. There are no note-body previews, mention names, file thumbnails, rich-text row editors, extra Note tab, new kind filter, avatar crowd or new reminders. One row remains one exact draft; merge grouping does not collapse different original sources or purposes.

Retain D37's actual 20-row initial page, maximum 50 per request, stable ordering and current title-search semantics. Those are query/page bounds, not a total draft cap. No recent-only cutoff. Adding a Note kind must not reset a user's current search/filter/scroll or make background autosaves reorder rows under a pointer.

## UX02 — Enter Internal note without creating phantom work

The existing Reply/Internal note control stays text-labelled and purpose-specific. Selecting **Internal note**, focusing it, moving the caret, opening formatting controls or restoring an empty baseline creates no durable draft. First meaningful permitted author work—text, supported formatting/content insertion, a qualified file selection or a deliberate note reference—creates the new private Note draft. Tiptap update events caused by hydration/selection/editability are not evidence of author work.

The ordinary composer shows:

```text
Internal note
Private until you select Add note.

[Existing qualified formatting / insertion controls]
[Write the note…                                      ]

[File state when relevant]
Saved                                      [Add note] [More]
```

Explain the qualified internal audience through the existing note-mode help, for example **Added notes are visible to staff with access to this conversation.** Do not claim all tenant staff can see them, describe a private draft as already shared, or hide the difference behind color. Technical privacy/security custody remains governed without adding implementation jargon to the composer.

The note has no To/Cc/Bcc, From, external signature, email footer, Reply-all preference or outbound email preview. D24 reply-and-work shortcuts and their staged actions never enter Note mode. Existing qualified Saved notes/mention/file tools keep their current Note purpose; this feature adds no new content family or automatic source import.

## UX03 — Quiet saving reuses the accepted contract

Reuse D37's accepted shared draft coordinator semantics for the Note purpose: after 750ms quiet, with a checkpoint attempt within five seconds of eligible continued editing, subject to foreground/online/authorized/schema-valid/non-IME conditions and no unresolved prior operation. These are scheduling targets, not guarantees that a five-second-old keystroke is saved. Keep one unresolved write per draft controller and coalesce newer work; do not create a new autosave engine or configurable timer.

**Saved** means the complete newest eligible Note candidate is acknowledged, including actual source/kind, typed mentions, source dependencies and file-selection state. A body-only save cannot describe the complete note as Saved. An older acknowledgment may establish a checkpoint but cannot erase later typing, move its caret or mark that later candidate Saved.

Keep one small status region: **Saving**, **Saved**, **Not saved**, **Checking save**, or an actionable failure. Ordinary successful checkpoints do not produce toasts, notification entries, timeline events or focus movement. **Save now** and **Retry save** reuse the existing deliberate-checkpoint/recovery path; no separate primary Save note draft button is needed for the selected automatic policy.

An incomplete but structurally safe note may be saved. No recipient, signature, complete email fill-in or external provider readiness is required. Unknown/unsafe nodes, forbidden source content or invalid protected metadata are not harmless incompleteness. Preserve the qualified original and show the existing safe repair state rather than silently stripping the document.

## UX04 — Files and mentions have truthful pending state

File selection may create meaningful draft work before a note has prose. Persist qualified occurrence identity and display Uploading, Ready, Failed or another truthful owner state. Never imply that a saved manifest can reconstruct a lost browser File. A restored note may keep its acknowledged text while an unavailable attachment requires re-selection or deliberate removal. No automatic removal of required content or retry of an expired source is hidden behind a successful text save.

A selected @mention is private draft content until actual Add note admission. Saving, restoring and re-rendering the token must not notify, follow, add recipients or confer source access. Changed staff eligibility is rechecked at posting and shown with a precise repair choice under the existing note/mention rules; do not silently notify a replacement person inferred from a matching name or address. Plain unselected @text remains ordinary text.

Draft completeness and publication eligibility differ. **Add note permits a meaningful canonical body or at least one ready, clean, currently authorized selected attachment.** Do not require dummy “see attached” prose. Zero meaningful body and zero ready files cannot post. A selected pending/failed/unqualified attachment blocks publication until it is ready or deliberately removed; existing body text does not authorize silently dropping that file. Incomplete and file-only unfinished drafts still save privately. D23's purpose profile and D32's current file custody/readiness remain mandatory.

## UX05 — Switch purpose without converting content

Reply and Note are separate candidates, persisted identities and Undo histories. A mode switch retains the first candidate under its own identity before activating the other; it never moves text, recipients, files, D36 quotes or D24 staged actions into the other purpose. The same shared editor can render the selected candidate without retaining a collection of hidden mounted editors.

A normal switch that preserves both qualified controllers/work states adds no confirmation. If an identity transition would destroy unsaved text, pending local attachment bytes or an unresolved result, use the single existing navigation guard rather than losing work or stacking dialogs. Complete IME input before taking the relevant checkpoint; don't treat raw keydown or compositionend alone as the final canonical document.

Returning to a known conversation honors the user's explicit mode action and restores that purpose's own saved work. It does not choose a mode by inspecting whether the latest timeline item happens to be a note. My drafts activation explicitly selects the exact stored Note or Reply; no ambiguous generic Open draft action can pick one by last-updated time.

## UX06 — Leave and resume without needless interruption

CRM context that leaves the composer mounted preserves it. When leaving would unmount it, perform D37's qualified save/flush and continue normally on confirmed success. Saved Note work needs no Are you sure dialog. Keep accepted content/context across devices; do not promise an identical cursor coordinate or crash-proof last keystrokes.

Use D37's one focused guard for an actual problem. Known failed save offers Retry/Stay or **Leave without saving these changes**. Unknown save offers an honest Stay/Leave path with **The earlier save may still finish; your latest unacknowledged changes may be lost** and retains the original scoped operation handle. Do not trap staff indefinitely in a failed status check or claim leaving canceled an accepted save.

An unfinished attachment shares that guard when leaving would destroy local bytes. Preserve the existing qualified transfer where possible, wait, or offer **Leave without this unfinished attachment**. Keep acknowledged text and honest file state. While the Reply controller and its permitted working state remain safely retained, an unrelated Reply save need not block resuming a safe Note. If navigation would destroy either purpose's dirty work or local files, include every affected purpose in the same save/leave guard, including the inactive one. A successful Note save never marks the Reply saved.

Select an **Internal note** row to authorize and load the exact candidate, source and Note schema before mounting a writable editor. No intermediate editor, default Reply flash or blank editor followed by replacement. Loading or access failure is not an empty new note. On desktop, focus the resumed editing context after deliberate activation; on mobile, show conversation/source and internal mode before user-directed keyboard focus. Returning to My drafts restores same-session list context where available.

## UX07 — Known source changes get targeted review

Ordinary status, assignment and same-source metadata changes do not erase a draft. A Note on Resolved work remains discoverable while its actual draft/source authority permits; opening it does not reopen the conversation. Assignment never transfers another worker's private note.

If a source merge/unmerge or other material change affects the note's actual destination or current internal audience, keep permitted work and explain that specific change before Add note. Follow D10's general-note continuing-origin rule and any already-qualified explicit source action. Do not use a private draft anchor as silent publication authority, invent a new source chooser for every note, or attach by typed names. The reviewed publication destination must be visible and exact.

When only permission to post has changed but current private read/custody remains valid, allow the eligible private candidate to be inspected and keep posting unavailable with truthful explanation. If read/source/privacy authority is lost, withhold or clear affected bodies, Undo and forbidden metadata immediately; do not expose a stale disabled row as a count/existence leak. Retain independently safe authored work only when the existing owner can prove that separation. Do not offer Copy as a bypass for forbidden content.

## UX08 — Add note is the deliberate publication boundary

**Add note** acts on the exact current reviewed Note bundle, owner, source destination and revision. It preserves existing note admission/content rules together with the explicit file-only clarification in UX04. No extra generic confirmation is needed for an ordinary unchanged valid note. Current source/audience/mention/file problems require focused review or repair; they are not hidden auto-corrections.

While actual publication admission is pending, identify **Adding note** or **Checking whether your note was added** and prevent a competing new publication/discard of that same candidate. Keep permitted content visible; the separate Reply can remain intact and usable under its own state. HTTP cancellation or leaving the view is not proof of non-admission.

Confirmed publication consumes only that exact Note draft generation and shows one posted note at its actual source/history position. Remove its active My drafts row; leave any separate Reply row and D24 plan unchanged. Avoid optimistic duplicate note bubbles. A later callback for the consumed Note cannot clear a newly created Note or resurrect the old one. Preserve existing post-action navigation rather than forcing a detour back to My drafts.

**Note added** means the actual internal note was admitted. It does not mean a colleague read it, a notification email was delivered, a response target was satisfied, or a giving/care/CRM action completed. Existing D15 optional following and independently qualified direct attention follow the actual published event. Retry/reconciliation cannot mint a second publication or repeat notifications as new source events.

## UX09 — Discard affects only the identified draft

Use the existing More → **Discard draft** action from the row or composer. One concise confirmation identifies both kind and conversation, for example:

> Discard this internal-note draft?
>
> This discards your unfinished note and its selected attachments. The conversation and your reply draft remain.
>
> Keep draft / Discard draft

The file statement means only eligible draft-owned occurrences are released; independently owned source files are not deleted. Where a release cannot occur immediately under current custody, the UI must not imply physical disposal already completed. No typed phrase, mandatory reason, bulk discard, hidden trash or expiring recovery promise is added.

Confirm uses the reviewed version. A newer save in another tab requires renewed review rather than deleting unseen work. Unknown discard stays an original-operation recovery state; it cannot coexist with an unsafe fresh same-slot creation. Discard cannot cancel a possibly admitted Add note. Once the actual result is known, return focus to the remaining row, next eligible row or My drafts heading predictably.

Clearing the entire content of an existing saved Note is a normal candidate update, not implicit Discard. Retain the stable draft until deliberate terminal action and show **No note content yet** where it explains the row. Merely opening a fresh empty Note still creates nothing. This follows D37's prevention of phantom drafts and silent loss without a new cleanup timer.

## UX10 — Editing a posted note stays different

D35's **Edit note → Save changes / Cancel → Edited / View history** remains local, deliberate and out of My drafts. Do not rename its Save changes to Add note, autosave revisions, create a persistent correction draft, add new mentions/files through that correction flow or notify on routine edits. If a posted-note edit and a new Note draft exist in one reader, their separate states and actions remain unambiguous; canceling one cannot discard the other.

## State copy and recovery

| State                                                | Clear response                                                                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No saved work of either kind                         | **No drafts yet. Replies and internal notes you start in a conversation appear here after saving.** Return to Support conversations; no setup wizard.  |
| One purpose missing                                  | Simply omit that nonexistent row. No empty Note/Reply section, disabled placeholder or count is needed.                                                |
| Filter has no results                                | Explain the current title/inbox scope and offer Clear search or All accessible inboxes. Do not claim no private work exists elsewhere.                 |
| New meaningful work awaiting acknowledgment          | **Saving** or **Not saved**, bound to this Note; no false Saved from the other purpose.                                                                |
| Text checkpoint acknowledged, attachment still local | Truthful text/draft status plus **Attachment uploading/not saved**; use the combined leave guard when needed.                                          |
| Save failure                                         | **Couldn't save this note draft.** Preserve safe work and offer Retry save.                                                                            |
| Unknown save                                         | **Checking save** / **Save status unknown**, original-operation recovery and an honest leave path.                                                     |
| Different tab changed it                             | **This note draft changed elsewhere.** Preserve allowed local work; deliberately review/reapply or load current saved content without blind overwrite. |
| Source destination changed                           | **Review where this note will be added**, with the exact permitted current consequence. No silent rehome.                                              |
| Missing current read authority                       | Qualified unavailable state; no forbidden title, body, file name, mention or Copy escape.                                                              |
| Publication rejected before admission                | Preserve the active draft and explain the actionable current cause.                                                                                    |
| Publication uncertain                                | **Checking whether your note was added.** Do not present another fresh Add note or ordinary disposable draft until original admission is settled.      |
| Publication confirmed                                | **Note added.** One source note; exact draft consumed; other purpose unchanged.                                                                        |

Microcopy is proposed language, not a promise that unavailable owner information can always be displayed. Localize copy and dates; do not infer relationships from a person's name, translated title or email.

## Exact acceptance additions for consolidation

| ID          | Independently testable outcome                                                                                                                                                                                                                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D38-UX-AC01 | Opening/focusing/restoring a fresh blank Note creates no draft. A meaningful eligible Note edit creates one private candidate without any note, mention, follow, CRM or provider effect.                                                                                                                         |
| D38-UX-AC02 | One conversation with an eligible Reply and Note produces two distinct kind-labelled rows. Activating either opens its exact purpose, content and source without exposing the other worker's draft.                                                                                                              |
| D38-UX-AC03 | My drafts retains D37's title-only search, Inbox filter, page limits, stable ordering and no body previews/counts; Note rows do not appear in ordinary public/shared search as draft bodies.                                                                                                                     |
| D38-UX-AC04 | The composer exposes Internal note, its private-until-Add-note meaning and a distinct Add note action on keyboard, pointer, touch and assistive technology paths. No email audience/signature/D24 plan appears.                                                                                                  |
| D38-UX-AC05 | Delayed acknowledgments do not overwrite later typing, change purpose, move the caret or claim latest Saved. Selection/hydration/editability events do not create or reorder drafts.                                                                                                                             |
| D38-UX-AC06 | Reply→Note→Reply, posting/discarding either purpose and rapid A/B conversation switching preserve the other exact candidate, plan, files and purpose-specific Undo without cross-source content.                                                                                                                 |
| D38-UX-AC07 | Routine successful navigation saves quietly. Failure, unknown result and local attachment loss use one truthful guard with usable Stay/Leave recovery; none traps the user or claims cancellation.                                                                                                               |
| D38-UX-AC08 | Source merge/unmerge, changed access and changed Note posting eligibility requalify the actual destination and permitted content without silent rehome, forbidden disabled metadata or synthetic identity.                                                                                                       |
| D38-UX-AC09 | Add note publishes exactly once and consumes only the reviewed Note generation. An unknown result recovers the original operation; an old save cannot resurrect a posted/discarded note or clear newer work.                                                                                                     |
| D38-UX-AC10 | Draft @mentions are inert; admitted actual publication uses existing current mention/follow rules. Note added never claims notification delivery or business completion.                                                                                                                                         |
| D38-UX-AC11 | Discard identifies kind/source, protects newer concurrent versions, affects only permitted draft-owned occurrences and preserves a separate Reply and existing conversation.                                                                                                                                     |
| D38-UX-AC12 | An acknowledged empty saved Note remains until explicit terminal action. File-only unfinished work is saved; a ready/clean/authorized file alone permits Add note without dummy prose. Empty/no-file content cannot post; any pending selected file blocks publication until ready or deliberately removed.      |
| D38-UX-AC13 | Opening from authorized CRM and returning preserves the same Note identity and source permission without duplicate body, activity, Party or independent editor.                                                                                                                                                  |
| D38-UX-AC14 | D35 posted-note corrections remain deliberately saved local edits and never enter My drafts or trigger new-note publication/attention.                                                                                                                                                                           |
| D38-UX-AC15 | Keyboard/AT, IME, long international text/names, Thai/RTL, mobile virtual keyboard, reduced motion and D37's 320 CSS-pixel reflow/200% text resize/400% zoom-equivalent scenarios keep the entire save/resume/post/discard journey usable.                                                                       |
| D38-UX-AC16 | Real intended-staff tasks prove participants can distinguish private saved versus posted internal content, find the correct kind, recover a failed save and finish without copying into a separate app. Record observed friction; do not replace these tasks with a visual snapshot or invented usability score. |

## Visual and technical discipline

Use shared Base UI/base-maia, existing semantic tokens, readable normal body text, restrained metadata and clear focus. Reuse menus/dialogs and existing active editor; no app-local theme, color-only audience cue, animated save celebration or Tiptap history/comments/collaboration service. A list refresh does not mount note editors or prefetch private bodies. Dark mode, touch and reduced motion retain the same hierarchy.

Important status is available to assistive technology without moving focus or narrating each keystroke. Actual controls have names and appropriate roles; don't wrap a separate More action inside a row link. A dismissed menu restores focus; a consumed/discarded row chooses a predictable next target. An accessible input label is not replaced by placeholder text. These outcomes require runtime verification, as explained by [W3C status guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

Support owns private Note persistence, exact source purpose, Save and Add note admission. P17's shared editor/schema and qualified reusable wording retain their role; saving/restoring a note does not prepare email or publish a template. A separately admitted post-derived attention email follows its existing P17 purpose and P6 transport. External Reply preparation, immutable sent material and P6 reconciliation remain unchanged. No notebook, second CRM, provider draft sync, new financial action, internal-email channel or general workflow is introduced.

The consolidated D38 requirements, data/editor review and proof plan must bind these UX outcomes to actual owner constraints. The selected A is accepted at intent level; detailed amendments remain proposed. No runtime, authenticated vendor visual trial or staff-task pass is claimed here, and no Q39 is opened.

## Full founder ratification — 15 September 2026

This entire record is accepted through [D38 full ratification](phase26-d38-full-ratification.md), reconciled by final R01–R26 and F01–F03. All 23 category outcomes, C01–C15, L01–L16, full UX and 16 UX acceptance additions, worked traces, P01–P30 and O01–O05 are incorporated with every supporting qualification. Support owns private Note drafts and actual admission; P17-governed shared authoring does not prepare email for Note save/post; separately authorized post-derived communication retains its P17/P6 owners. CRM uses the same authorized source. All 30 actual runtime groups remain required and unexecuted. Q39 is a separate question and is not answered by this acceptance.
