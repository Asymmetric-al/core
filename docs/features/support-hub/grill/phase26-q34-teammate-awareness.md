# Q34 — Advisory live teammate awareness

**Unanswered — 13 September 2026.** D1–D33 and every adopted amendment are fully founder-ratified. This is the next single researched choice, not a new decision, formal spec or implementation.

## The next question

**Before anyone sends or posts an update, what live indication should staff see that a teammate is working in the same Support conversation?**

For example, Maya and Daniel open the same donor-care exchange and independently start preparing an answer. Existing D1/D4 protection stops stale sending after a relevant committed update. This question concerns an earlier coordination cue, while both drafts remain private. The example illustrates a possible shared-queue overlap; it does not claim measured frequency or invent a ministry workflow.

| Option                                                  | What staff experience                                                                                                                                                   | Strongest advantage                                                                                    | Real tradeoff                                                                                                                                                                    |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Show when a teammate is composing — recommended** | A quiet cue in the current conversation indicates that another authorized teammate is composing a reply or internal note. It shows no draft content or passive viewers. | Helps avoid duplicated preparation with a small, relevant signal and less passive-activity disclosure. | It cannot reveal that someone is merely reading/researching; delayed or missing cues remain possible.                                                                            |
| **B — Show viewers and composers**                      | Current-conversation cues distinguish authorized teammates viewing from those composing. No draft contents or historical read tracking.                                 | Earlier coordination while colleagues investigate, before they begin writing.                          | Adds passive-activity disclosure and more visual state; an open page does not prove attention. It needs an explicit narrow clarification of D15's no-read-surveillance boundary. |
| **C — No live activity cues**                           | Rely on existing assignment, notes/mentions, committed updates and required collision protection.                                                                       | Smallest surface, no new transient activity disclosure or presence-state maintenance.                  | People can duplicate research/drafting effort before a committed update triggers the existing protection.                                                                        |

These are alternative scopes, not three tenant settings to build. **Every option retains mandatory current-source/version collision protection.** C is not permission to send competing stale replies; A/B do not make presence the safety mechanism. The choice is limited to the current qualified conversation reader, not a global staff roster, inbox-wide surveillance view or customer-facing typing indicator.

## Single best recommendation

**A — Composing-only awareness.** The strongest useful early signal is that someone has begun preparing a contribution. It addresses duplicated effort while avoiding routine display of everyone who merely opens the conversation. B is a legitimate broader coordination option, and C is a serious simpler alternative when assignment already prevents most overlap. No Asym study establishes that passive viewing visibility or a full presence product is necessary.

Help Scout explicitly separates viewing/composing indicators from the rule that stops a reply after an unseen update. That distinction fits Asym's already-ratified private-draft and send-admission boundaries. Adopt the coordination idea, not its full UI, notification reply actions or ability to disable protection through support. [Help Scout collision documentation](https://docs.helpscout.com/article/99-prevent-duplicate-replies-with-collision-detection).

Zendesk documents presence problems when a connection drops, a screen becomes inactive or staff use multiple devices. These are concrete reasons to keep the cue advisory and to treat unavailable state honestly, rather than deriving assignment or send permission from it. [Zendesk presence troubleshooting](https://support.zendesk.com/hc/en-us/articles/4408825035674-Troubleshooting-agent-collision-in-Play-mode).

## Recommended A journey to qualify after selection

1. **Open the existing authorized conversation**, from Support or its qualified CRM entry. Keep assignment, source context, draft and return navigation. Opening/reading alone does not publish composing activity or create Follow membership.
2. **Begin composing a reply or note.** Other currently authorized staff in the same qualified context may receive a small text-led cue such as **Maya is composing**. Publish no text, keystrokes, recipients, attachment names or unpublished note material. Work-profile identity disclosure must itself be qualified.
3. **Read the cue without interruption.** Use existing Base UI/Maia composition near the composer context. It does not move Send, steal focus, animate a constant distraction or force a dialog. No new theme, list-density setting or replacement shell is needed.
4. **Coordinate deliberately.** Staff may continue their own allowed work or use existing notes/assignment mechanisms. The cue is not a reservation, automatic claim, shared editor, draft takeover or instruction that someone else will handle the request.
5. **Send through the same required guard.** Relevant committed updates still require review; the exact current-authorized send boundary remains authoritative. A quiet or missing cue is never permission to bypass it.
6. **Leave, pause or reconnect.** The chosen answer must qualify temporary activity meaning, expiry, deduplication across the same person's tabs, current source authorization and honest unavailable state. An abandoned tab cannot remain a permanent claim. A presence outage must not disable otherwise-qualified reading/composing/send review or claim that nobody is working.

B adds current viewing awareness to this journey, not proof that someone read the text. C omits the live cue while retaining normal committed-update and collision behaviour. No heartbeat interval, transport product, database table, activity timeout, roster cap, new preference or specific presence-state algorithm is selected merely to pose the product choice.

## Non-negotiable boundaries

- **Private drafts:** D2/D4 ownership remains. No draft preview, co-editing, private-note body, recipient list or takeover. Front's composing cues are bundled with shared drafts; Asym does not copy that coupling.
- **Source and tenant safety:** authorize publishing, receiving and displayed identity against current tenant/principal/source context. Access to one merged constituent, an email match or CRM link does not disclose activity on an inaccessible source. Realtime subscription is not permanent authorization.
- **D15 privacy:** no historical who-read list, read receipts, last-seen/duration reports, follower roster, staff monitoring or leaderboard. A deliberately selected B would expressly allow only narrowly qualified current-view coordination while preserving those exclusions; research does not pretend this clarification is already accepted.
- **Work remains explicit:** presence changes no assignment, Receive new assignments preference, absence coverage, Follow subscription, status, reminder, service clock or business completion. Reading alone is not responsibility or diligence evidence.
- **Email Studio:** a cue creates no P17 preparation, signature/template/delimiter change, P6 send, email/push/sound notification or communication event. TipTap remains private authoring; a cue is not shared document collaboration.
- **CRM continuity:** same permitted Support reader, current source and return path, with no copied Activity/person/task, broader Party/financial/care access or new roster.
- **Truthful degradation:** cues can be missing/stale. Remove expired claims and distinguish unavailable awareness from a verified assertion that no one is present. Existing source/collision safety continues independently.

The ratified collision requirement is still an implementation obligation: inspected current send payload/schema does not yet establish its reviewed-version field. C is therefore not described as already complete in today's scaffold. Existing generic database subscriptions likewise do not prove a qualified presence capability. [Independent scope review](phase26-q34-scope-review.md).

## Evidence and next step

The [evidence record](phase26-q34-evidence.md), [independent scope review](phase26-q34-scope-review.md), [UX research](phase26-q34-ux-research.md) and [final question review](phase26-q34-final-review.md) document the current source, strongest primary comparisons, reported friction and limits. The [ratification/question validation](d33-ratification-q34-validation.json) preserves D33 and confirms Q34 is unanswered.

After selection, the full adversarial review must resolve precise current activity/identity scope, privacy, multi-tab and disconnected states, expiry/revocation, UI/accessibility, failure handling, performance and falsifiable proof. Those technical outcomes are not presumed from a vendor feature or a realtime library. No actual presence service, production mailbox, runtime test, new ADR0034, formal spec, ticket or external mutation is created here.
