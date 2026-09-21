# Q35 — Scope and current-source review

**13 September2026. D1–D34 fully ratified; Q35 unanswered.** Root synthesis incorporating independent scope findings from the data and UX reviewers, followed by direct current-source checks. This is not a full post-answer architecture review or an independent runtime test.

## Candidate questions checked

| Candidate                              | Evidence and disposition                                                                                                                                                                                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bulk selected-request changes          | D3-R11 already governs exact selected IDs, durable per-item outcomes, Stop/retry and no blanket Undo; D20-R14 rejects shifting all-matches targets; D21 preserves those paths. **Do not reopen.**                                                                     |
| Jump to next request after sending     | D3-R10 requires stable detail and deliberate navigation; D4-R02 forbids implicit post-send jumping. **Do not reopen.**                                                                                                                                                |
| New outward correspondence             | D12/D26 already address starting actual email for a genuine received request. General proactive outreach is a broader scope choice whose demonstrated need has not been established here. **Do not add for parity.**                                                  |
| Forwarding/third-party collaboration   | D11/D12 already govern shared work and related source conversations. A separate broad forwarding feature needs stronger demonstrated need and careful external-audience scope. **Not the strongest next question.**                                                   |
| Correcting posted human internal notes | D17 explicitly leaves ordinary edit support conditional; D16 explicitly distinguishes privacy redaction from general edit history. D15 limits notifications if edits occur without deciding edit authority. **Genuinely unresolved and the strongest next question.** |

These findings were independently raised by the data and UX reviewers. Root also searched the accepted records and inspected the current implementation below. The choice is a normal collaboration/history policy; no unsupported ministry-specific process is used to justify it.

## Actual current code

- [PrivateNote](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/timeline/PrivateNote.tsx#L27) renders current author, posted time, internal badge and rich body. It has no edit/history control in the inspected component. Its hardcoded visual details do not override governing shared UI requirements.
- [Mutation wrapper](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/mutations/conversations.ts#L78) parses addPrivateNote and delegates to the messages adapter.
- [Messages adapter contract](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/types.ts#L231) exposes sendReply and addPrivateNote, not ordinary note edit/history.
- [Supabase adapter addPrivateNote](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L941) inserts a new private note with an agent resolved from the input and bumps conversation state. This is creation behavior, not safe revision behavior. Reusing it for every edit would misrepresent publication/activity. The inspected helper alone does not prove exploitability or complete outer-route author validation.
- [Current note schema](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/schemas.ts#L58) is a creation input, not a conditional edit protocol.

No live rows/SQL/providers were queried or changed. Absence is claimed only for these inspected interfaces, not every possible integration in the monorepo. Current runtime cannot be treated as proof that either A or B is already fully implemented.

## Proposed options are meaningfully distinct

**A** allows the currently permitted original author to correct their own posted note, with visible edit attribution and governed earlier revisions. **B** allows a new linked correction while preserving ordinary original text. **C** permits A briefly, then requires B. None adds ordinary hard deletion, public conversion, another person's edit authority or an external-message rewrite. A is recommended; the alternatives remain valid product judgments for different chronology/friction priorities. No grace duration, revision schema or new permission grant is selected at question stage.

An earlier possible C involving broader delegated edits was not adopted: it would mix correction policy with a separate authority expansion. The actual question compares correction approaches under the same narrow author/source boundaries. This is a recorded narrowing of candidate analysis, not a previously selected founder decision.

## Existing boundaries that control the answer

1. D16 redaction and D17 expiry dominate every current/earlier revision, attachment, preview, search and CRM projection. Version history cannot preserve a forbidden archive, and an edit never renews the existing content deadline.
2. D15 ordinary edits correct current presentation without a new optional notice on every save. New correction notes and deliberate attention retain their actual producer/audience effects. Already-sent bytes cannot be recalled or rewritten.
3. D9/D26 require the canonical Support source in CRM. CRM-owned notes and staff-recorded request briefs retain their separate owner/correction contracts; Q35 is not a generic note platform migration.
4. P17 Email Studio and P6 retain authoring/preparation and delivery authority. Editing a Support note is not a donor email action. An independently qualified staff notice remains possible through its existing owner, especially for a genuinely new correction note.
5. Actual staff identity/current author/source permission—not email, assignee, CRM ownership or D34 presence—governs any edit. A source restriction or another device's revision must not be overwritten by a stale save.
6. Corrections to what was originally recorded differ from genuinely new events/circumstances. A must keep that distinction legible and provide deliberate attention for material changes without an automated semantic classifier or new workflow engine.

**Scope conclusion: Pass to ask Q35 with A recommended.** The complete post-selection adversarial answer must settle conditional saves, truthful history and attribution, attachment/mention changes, disclosure, notifications, legacy author evidence, retention and release proof. Those are required consequences to analyze after the founder chooses, not hidden decisions pre-recorded now.
