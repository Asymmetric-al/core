# Q39 — Final independent scope and source review

**Current final disposition: Pass after F-Q39-01 clarification.** Initial evidence and the wording finding remain below; final actual-file hashes and closure are at the end.

**15 September 2026. Initial disposition: one narrow wording correction; all other scope checks pass.** Reviewed the actual formatted question, gap/research records, D38 full ratification and fresh source manifest. D1–D38 remain fully ratified; Q39 remains unanswered. This is documentary/source/citation verification, not runtime or user-study evidence.

## Initial actual-file evidence

| File                                  | SHA-256 at initial review                                          |
| ------------------------------------- | ------------------------------------------------------------------ |
| `phase26-q39-conversation-reading.md` | `e42690a6bedd7c33e69297d3c600e8da6f980b8021b23696ffb2003495e794cb` |
| `phase26-d38-full-ratification.md`    | `e10c49c3f12e4dda5d52aeb239017a81ad322c372a0a23c044bb2009651ea309` |
| `phase26-q39-gap-review.md`           | `7a53eab16bb3bd432f692a25f662a71102f887996f6ea997434acb538e51ffc7` |
| `phase26-q39-ux-research.md`          | `8e95708844626f17282a6a3e0b2d4aa964b734a48cdd2c16400344b8a656788c` |

The initial question and full-ratification mirrors in the verified WSL worktree matched their output hashes byte-for-byte. The actual feature ADR directory ends at0038; no0039 was found.

The root's15September source manifest records local/remote develop at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`, five unchanged OPEN PR heads, and four pinned current source files. Independently reran SHA-256 on all four in WSL; all matched:

- Support migration: `3bb6e52b57672d9ce1247b6f4495f0783f557caa92e7cc5c1047e17c1a346c16`.
- Supabase adapter: `17666d3087ce4e86c7386874bdf42d4ef491b6e35fa53384fa77bdd32e7b6cb6`.
- Table cells: `79144715aef5554e1b5a1c9af7885f70d6410e389bfa7649f299cbae1574c8ea`.
- Board card: `c2edef809d2dc1a7eef7f10f164b39af51ecc9be499e65f676847ee87102f652`.

The source claims remain narrow and correct: conversation-level nonnegative unread_count, direct row mapping, inbound increment and UI dots; no qualified viewer-specific read command found in the stated app/API scope. This is not evidence of a chosen shared-team policy or a running read lifecycle.

## F-Q39-01 — Shared cue does not guarantee anonymity

**Low severity at this question stage; context-dependent privacy misunderstanding if copied into a selected policy.** The root's self-check raised and this independent review confirms that “anonymous cue/anonymous aggregate” is too strong. B exposes the fact that at least one authorized person qualified as viewing activity. In a small team or predictable sequence, people may infer who, even without names, timestamps or a roster. No missing permissions or deployed leak is alleged.

**Required exact correction:** describe B as a shared cue **without naming readers**, and explicitly distinguish nondisplay of identity from guaranteed anonymity. Preserve D34's ban on displayed passive-reader rosters/statistics, current source/audience qualification and all existing options. This does not change the product choice, add a roster, or make B automatically unacceptable. Main question, gap/research and current session wording should agree. The gap reviewer corrected its own four anonymous references; the research and main owners are aligning theirs.

## Independent scope checks

| Check                            | Result                                                                                                                                                                                                                                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Genuine unresolved decision      | **Pass.** D1-R09/D3 separate read state from work without choosing whose ordinary reading it represents. D15 is notification engagement; D33 presentation/D34 composition do not choose ordinary cue ownership.                                                                                                 |
| Prior ratification               | **Pass.** D38 master fully accepts the Note package while leaving Q39 unselected. It preserves all source/probe/runtime limits. No new draft/editor or D35 posted-note policy is reopened.                                                                                                                      |
| Three genuine alternatives       | **Pass.** A personal state, B shared initial-look state and C omitted ordinary cue have concrete distinct implications for Ava/Ben. B's triage benefit and C's lower state burden are presented fairly.                                                                                                         |
| One recommendation               | **Pass.** A is a reasoned personal-orientation judgment, not vendor consensus or adopted policy. All three are alternatives, not a settings hierarchy.                                                                                                                                                          |
| No premature technical selection | **Pass.** Source eligibility, new-access/history baseline, read trigger/manual reset, concurrency, retention/schema/indices and exact UI remain for selected-answer review. No blanket all-history unread, timer, count/filter or new preference is selected.                                                   |
| Viewing versus comprehension     | **Pass.** The question expressly excludes proof of understanding, full-history/attachment review, requester receipt or completion. Background fetch, prefetch, hidden pane or CRM profile open are not viewing evidence.                                                                                        |
| Work and send-review authority   | **Pass.** No read cue clears Open work/assignee/reminder/reply target, accepts owner results, or bypasses D1/D2/D4/D10 current source/audience/send review. C keeps those guards.                                                                                                                               |
| P17/D15/P6                       | **Pass.** Ordinary conversation reading is not notification-group engagement; no broad automatic read/archive, Follow change, retention reset, prepared email/template publication or delivery correction.                                                                                                      |
| Privacy and D34                  | **Pass subject to F-Q39-01.** A self-only; B no displayed readers, timestamps, counts or roster. Narrower viewer cannot attest to hidden broader material. Source changes cannot leak activity through a boolean/count. Shared state does reveal an initial-view fact, so anonymity language must be corrected. |
| CRM/source continuity            | **Pass.** Same current-authorized Support source and reading meaning through CRM; no second state authority, Party-derived permission, Activity/last-contact mutation or provider mailbox sync.                                                                                                                 |
| Current-source inference         | **Pass.** Existing global counter is treated as incomplete scaffold, not a founder-approved shared rule. Scope of absent reader command is stated. Current source hashes match recorded evidence.                                                                                                               |
| Stage and proof                  | **Pass.** Q39 unanswered, no term/ADR0039/schema/formal spec/ticket/implementation; no authenticated vendor test or Asym staff-study claim.                                                                                                                                                                     |

## Primary citation verification

Reopened the four primary URLs cited in the actual question on15September2026. The comparisons are supported with their stated limits:

- [Front](https://help.front.com/en/articles/2164), page lines12/15/32–44, confirms July23,2026 and personal read/unread separate from its archive recommendation. Its bulk, counter and timing controls are not imported.
- [HubSpot](https://knowledge.hubspot.com/help-desk/manage-tickets-in-help-desk), lines58–61 and157–166, confirms July20,2026, Service Hub Professional/Enterprise and user-specific bold unread clearing. It is the general Help Desk page, not the separate composer beta.
- [Zoho Desk](https://help.zoho.com/portal/en/kb/desk/ticket-management/actions-in-tickets/articles/user-actions-in-the-ticket-detail-page), lines106–118, explicitly describes user-specific action and no ticket-owner notification. No unsupported edition/date or backend ownership is inferred.
- [Quo](https://support.quo.com/core-concepts/inboxes/conversation-status), lines213–218, explicitly connects unread with activity no team member has viewed and shared status changes. The question correctly rejects importing its work/reminder/priority coupling and does not claim its status model matches Asym.

No primary-source factual correction was needed. No additional vendor architecture or universal best-practice claim is established by this verification.

## Initial conclusion

After the narrow nondisplay-versus-anonymity clarification, the actual A/B/C question is ready. No new scope or technical policy is required to present it. Final current-file hashes and Pass will be appended after the coordinated wording update; earlier hashes and finding remain historical evidence.

## Final actual-file verification — Pass

**15 September 2026. Current disposition: Pass. F-Q39-01 is resolved.** Re-read the corrected actual question row B and boundary5, the gap review and UX research. They describe shared state without naming readers, acknowledge that it reveals an authorized qualifying view, and explicitly reject an anonymity guarantee where small-team context can identify the reader. No reader roster, new permission or extra policy was added. The correction record preserves the finding as F01.

| Final reviewed file                                 | SHA-256                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `phase26-q39-conversation-reading.md`               | `77a63de0286b1e06ebcd00338c7c0ac1827f7a8d1a79831835a755897bf1e605` |
| `phase26-q39-gap-review.md`                         | `523e84d98c58c4923a627d650b0a9513c07ad04c0510a2926db2ac2d1b399b60` |
| `phase26-q39-ux-research.md`                        | `eb49e5a93d6724e2b406decebb0f8e1bd29eca68e4623d13559911df09c06f7a` |
| `phase26-d38-full-ratification.md`                  | `e10c49c3f12e4dda5d52aeb239017a81ad322c372a0a23c044bb2009651ea309` |
| `phase26-d38-ratification-q39-source-evidence.json` | `21f3eeb4f382b417f3b00e76b7b3c032377596295e772043387749419289c724` |

The final question's WSL mirror matches `77a63de0286b1e06ebcd00338c7c0ac1827f7a8d1a79831835a755897bf1e605`. Final copying of companion research/review mirrors belongs to the root's completion validation; no stale companion mirror is represented as current in this Pass.

All twelve scope checks and four verified primary comparisons remain satisfied. D38 full ratification is unchanged. A personal cue is the single recommendation; A/B/C remain meaningful alternatives and no read trigger, history baseline, manual-reset behavior, timing/schema or answer is selected. D1–D38 remain fully ratified and **Q39 remains unanswered**. No additional material finding remains.
