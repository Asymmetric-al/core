# D35 — A simple note-editing journey

**Current status — full ratification, 14 September 2026:** D35 A and every amendment, addition, adjustment, change and final correction in this complete package are fully founder-ratified. This includes all 26 clauses, 23 categories, two glossary definitions, 40 required release groups and six controls. D1–D35 including D29-X01 remain fully ratified. Earlier proposed/pending/no-Q36 language below is historical. The [full ratification](phase26-d35-full-ratification.md) is incorporated in full; actual runtime proof remains required and unexecuted.

**14 September 2026. A selected; detailed amendments proposed.** The [26-clause decision](phase26-d35-adversarial-review.md) governs this blueprint. D1–D34 remain fully ratified. This is a complete design, not a rendered or participant-tested interface.

## The ordinary experience

Maya notices that her posted internal note says Tuesday when she meant Thursday. She opens that note's actions, chooses **Edit note**, fixes the word and selects **Save changes**. The note stays exactly where it was, with its original author/time and a quiet **Edited** link. There is no additional confirmation, required explanation, timer or notification to the donor. This illustrative correction is distinct from a donor later changing their plans, which belongs in a new note.

```text
Maya Chen   Internal note                  Original posting time   ⋯

The donor requested a callback Thursday.

Edited · [View history]
```

While editing, keep the same header and location:

```text
Maya Chen   Editing internal note          Original posting time

[Existing compact formatting controls]
[Editable note text                                      ]

Existing files                 (only when files exist)
[Current permitted file name]   [Open / Preview]

Earlier versions remain in history while available.
[Save changes] [Cancel]
```

Use the existing Base UI/base-maia components, Maia/Zinc semantic tokens, Internal note editor and safe static renderer. Keep readable body typography, clear hierarchy, modest borders and stable spacing. Existing shell tokens—not the current component's hardcoded amber styling—control the appearance. Do not add an elaborate toolbar, large history cards, extra navigation rail, animation around every save or a second design system.

## Enter, correct and save

1. **Find the action.** The note has an accessible actions menu on pointer, keyboard and touch. Eligible authors see **Edit note**; other readers may see **View history** when available. Neither author matching nor authority is inferred from the visible name. Do not advertise a disabled Edit action to everyone merely to explain permission architecture.
2. **Start editing in place.** Keep the Internal note identity explicit. Load and validate the current permitted canonical body before writable initialization. Focus the editor predictably; avoid selecting/replacing the entire note automatically. The separate Reply/Note draft and its selected recipients remain untouched.
3. **Make an ordinary correction.** Text, supported formatting and ordinary links work as expected. Paste and keyboard editing follow the qualified note profile. Normal paragraph/select-all deletion may remove existing mention tokens or inline pictures, without adding new mention targets or sending anything. No hidden protected-token rule should make a normal correction fail only at Save.
4. **Keep files understandable.** The original source's currently permitted files stay in a read-only **Existing files** section. There are no Add, Remove or Replace file controls in this correction flow. When relevant, explain: **Removing an image from the text does not remove the file from this note or its history.** Existing preview opens through D32 and restores the draft/position on return. Use a fresh ordinary note for new supporting files or notifying a teammate.
5. **Save deliberately.** **Save changes** shows an in-place saving state. Disable repeat submission while its outcome is unresolved. Confirm only the authoritative result. On success, restore the readable note, update Edited/history and return focus without moving the timeline. A brief polite status can announce **Changes saved**; it is not the only evidence of success.
6. **Handle no change quietly.** Save can be disabled when the client knows nothing changed, but the server still checks canonical equality. A true no-op creates no revision, Edited time, notification or activity. Cancel simply exits an unchanged edit.

This is a correction editor, not a new message composer. It has no Reply/Note audience switch, sender field, signature insertion, new notifying-mention picker, file upload or Save-and-send option. Plain @name text remains ordinary text. The client must not reuse the current creation composer's insertion-time activity callback.

## Cancel and leave without surprises

**Cancel** before submission discards only this private edit and restores the current permitted note. A dirty navigation or move to another note uses one small **Keep editing / Discard changes** guard; this is appropriate for leaving, not an extra step on every Save. Escape dismisses the innermost menu/history overlay and returns focus; it must not silently erase a dirty editor.

There is one active posted-note editor in a reader. A second request to edit first resolves the existing local candidate. No persistent multi-note draft manager or server autosave is created. Ordinary list refresh does not replace the candidate. Browser/OS tab eviction cannot be promised recoverable.

After Save has been submitted, Cancel cannot claim to undo it. A person may close the view, but returning reconciles that original operation. A lost response shows **Checking whether your changes were saved**, not **Save failed** or a fresh-send invitation. The [data contract](phase26-d35-data-contract.md) gives the exact unknown/retry path.

## Read history without a document-management interface

Select **Edited** or **View history** to open one read-only shared disclosure. Its title identifies **Note history** and the original note/author where currently permitted. Show the selected version's complete safe body; mark **Current** and **Original** when their facts are available. Earlier versions have their own edit time/attribution. Keep the original posting time distinct from later edits.

Show up to20 permitted metadata entries at a time and load one body on selection. More history uses ordinary **Load more** with a stable cursor; no giant body list or eager total count. New edits do not reshuffle what the user is reading: explain that a newer version is available and let them refresh deliberately. Return to the note at the same position.

History does not offer Restore, comparison markup, export, branch, revision comments, mention replay or attachment re-acquisition. It uses the safe static renderer, not an editor mounted for every version. A person can read permitted earlier text; a new correction must still start from the current note and current authority. Do not promise that Original or every earlier body is retained forever.

If an earlier representation is expired/restricted, show an appropriate body-free state only when the user may know that history fact. Never expose hidden version counts, timestamps, filenames or actors through gaps. Current text redaction cannot safely locate the same sensitive words in all old versions; affected older bodies remain restricted unless the source owner qualifies a safe representation. History is not a **View original** escape from privacy controls.

## Conflict: keep the person's work and require deliberate review

Two sessions belonging to Maya may edit the same note. If another save wins first, the second cannot overwrite it silently. Display **This note changed** with two clear labels: **Currently saved note** and **Your unsaved changes**. Only show currently permitted content.

The author reviews the current note and deliberately starts a correction from that current base, reapplying the intended change. Their old local text can remain available for this review while permitted. There is no **Overwrite anyway**, automatic rebase, automatic merge or generic diff platform. The server still checks the new base when saving. Repeating the old request cannot create another revision.

If the conflict is actually redaction, expiry, lost permission, tenant/account switch or an incompatible original-source change, withhold/clear forbidden content. Do not preserve an unsafe candidate merely because an ordinary concurrency error would preserve it. Explain the resulting state plainly—**This note is no longer available to edit**—without revealing a hidden source or actor.

## Support and CRM continuity

The same note can be reached from Support or through the CRM's canonical Support reader. Edit and history apply the same current Support source permissions in both places. The successful current version is shared because it is one source, not because two copies synchronize.

Keep the CRM record/list, Support reader selection and return route. If a Party/relationship is merged, unlinked or becomes restricted, requalify the note's actual original source. Viewing a merged conversation or a CRM record does not grant every constituent's history. Authoring a note about a refund/contact update does not perform the action; its owning domain still authorizes and records it.

D22 ordinary search/Find follows the current permitted version. It must not return a removed phrase from an older revision as if it were current, nor silently add all revision bodies to its corpus. D33 Compact/Full preferences do not edit or restore content.

## Awareness and attention remain separate

An explicitly qualified use of D34 may show the existing neutral composing cue during deliberate note editing. It uses the edited note's actual original source and real edit authority, even within a merged reader. No history-viewing cue, note/reply-mode disclosure, draft text, cursor or lock is added. Moving back to Reply stops/rebinds that context while preserving the other private draft. D34 failure does not block Edit or Save.

Routine edits do not send a new follower alert, @mention or donor email. If a correction needs someone's attention, use the existing deliberate staff-attention/new-note path. Already delivered messages cannot be recalled. P17/P6 retain immutable preparation/delivery evidence and their current adverse source fences; exact changes may suppress unsafe outstanding source-dependent material without falsely erasing valid historical delivery facts.

## Legacy and maintenance

An old note may lack provable human authorship or a losslessly editable canonical body. Explain **Editing isn't available for this older note** where the note itself is visible, and preserve ordinary new-note clarification and authorized privacy controls. Do not invent a historical author from today's matching email or label generated activity as human because it shares the note endpoint.

Activation qualifies the actual author/source model, parser/editor cohort, history/custody and all writers first. Maintainers use existing owner migration/repair tools; users are not asked to understand SQL, profiles or deployment versions. A history retrieval outage does not erase the note. An unknown Save result is reconciled from its original operation, not repaired by manually recreating the note.

## Accessibility, mobile and proof of quality

Use accessible names and selected/expanded/busy states from shared primitives; no hover-only timestamp or color-only Edited badge. Keep DOM and visual order coherent. Preserve the existing shell's focus management and reduced-motion behavior. Opening/closing history, saving, errors and inner menus each have deliberate focus return; do not announce every typing/render change.

Test actual editing, validation, conflict, unknown outcome, history and return at200% text resizing and320CSS-pixel reflow/400% zoom, including long translated labels/names and RTL. Test keyboard/screen readers, contrast, author-created sticky focus obstruction,24CSS-pixel targets or actual WCAG exceptions and44CSS-pixel standalone-primary touch targets. A mobile virtual keyboard must leave text and reachable Save/Cancel usable; history should use the existing responsive full-width disclosure rather than nested desktop overlays.

The [primary UX research](phase26-d35-ux-research.md) documents actual helpdesk alternatives and their limitations. The [proof ledger](phase26-d35-proof-and-operations.md) requires moderated author/reader/CRM/maintenance journeys and actual browser/AT outcomes. No number of polished drawings, source hashes or synthetic model assertions proves that users enjoy the result. Those observable task outcomes remain release requirements.

## Full founder ratification — 14 September 2026

The founder explicitly ratifies **A — Edit your own note, with visible history** and every amendment, addition, adjustment, change, update and final correction in this document and the complete [D35 ratification record](phase26-d35-full-ratification.md). The entire D35-R01–R26, all 23 category outcomes/consequences, two glossary definitions, full UX/data/editor/CRM/privacy/retention/recovery/migration contracts, P01–P40/O01–O06 and final independent corrections are accepted. The original substantive text and evidence remain preserved; earlier pending language creates no repeat approval gate.

Acceptance includes the simple Edit/Save changes/Cancel/history journey; trustworthy original human authorship; conditional current-source/head saves and immutable operation binding even for No changes; minimal same-operation navigation recovery; natural removal of existing reference appearances with unchanged actual files; whole affected older-representation restriction when redaction correspondence is unsafe; original D17 deadlines; qualified canonical editor/profile and legacy migration; current-head search and canonical permission-aware CRM access. All stated page/load/latency/operating bounds and 40 actual release proof groups are accepted, not claimed executed.

**Email Studio and owner roles are fully ratified.** Support owns notes/revisions. D23's shared schema/editor/rendering does not transfer that ownership. Routine edits create no note publication, follower/direct-mention/donor email, P17 preparation or P6 resend. D15 optional following and separately qualified direct-attention producers remain distinct; independently authorized new notes/attention keep their normal effects. P17 owns immutable message preparation and P6 actual delivery/reconciliation. Current unsafe source-dependent material is fenced without rewriting delivered facts or deleting still-valid body-free history. D29 confirmation and outgoing signatures/wording are unchanged. Explicit D34 reuse retains exact original-source/edit-authority binding and neutral metadata-only/no-lock behavior; its control traffic is not a note publication.

All final corrections, 24 finite model assertions/four naive counterexamples and original source/validation evidence retain their documented meanings. **D1–D35 and all adopted amendments are fully ratified.** The session may continue with one researched unanswered Q36; no formal spec, implementation tickets, product/schema/provider/GitHub/DNS/inbox changes or real messages are authorized by this recording.
