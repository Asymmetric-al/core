# Phase 26 Q2 — Default reply recipients

**Status: Historical question preparation, superseded by the founder’s B answer and D2 review.** Sources checked on
10 September 2026. The sender-only recommendation below is historical, not current
direction. D2 selects Reply all with a personal staff default and per-email override;
all D2 review amendments are now founder-ratified. See [D2](phase26-d2-adversarial-review.md).
D1 and its R1-R15 safeguards remain accepted in full.

## The decision

When an incoming support email includes other people, should the staff composer
start with a reply to its sender or with a reply to its visible group?

Illustrative example: Sarah asks the tenant's support team a question and copies
James, a church administrator. This is a scenario for comparing behavior, not a
claim about measured Asym ministry workflows. Staff can answer Sarah alone or
Sarah and James together. Both choices must support ordinary group correspondence.

| Option                         | Ordinary behavior                                                                                                                                          | Benefit                                                                                  | Cost                                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| A — Reply to sender by default | Reply addresses the sender of the particular incoming message being answered; a visible one-click Reply all stages that message's permitted visible group. | Broader sharing is deliberate and the ordinary direct reply remains simple.              | Staff can forget to include intentionally copied people; Reply all and current recipients must be prominent. |
| B — Reply all by default       | The composer stages the visible group on the particular message; staff can choose Reply to sender.                                                         | Fewer omissions in group exchanges and fewer clicks when group correspondence is common. | The initial audience is broader; staff must notice which people will receive the answer.                     |

**Recommendation: A, as a product judgment.** It puts the extra group-selection
action on staff, not the donor, while retaining effortless normal email. Make
Reply and Reply all easy to discover, show actual addresses, and avoid a separate
confirmation modal for unchanged ordinary replies. This is not a claim that all
help desks prefer sender-only or that donor preference has been statistically
measured. B is the strongest plausible alternative, especially for frequent
multi-person correspondence.

A remembered per-conversation default is possible, but adds hidden mode state.
A one-requester-only product is a different capability decision, not a comparable
default, and is not offered as a weak third option.

## Boundaries held constant

- Reply targets the message being answered, not automatically the original
  requester. Actual endpoint handling respects the governing mail contract;
  this question does not prescribe blindly trusting a From or Reply-To header.
- If Sarah later writes only to support, neither option restores James from an
  older message. The exact outgoing recipients remain visible in the composer.
- New or changed recipients receive only explicitly reviewed, permitted content.
  Joining the exchange does not send them accumulated history, internal notes,
  or inaccessible CRM/financial material.
- CRM associations, team assignments and internal mentions cannot add external
  recipients. A copied address does not establish verified identity or authority.
- BCC, own inbox/forwarding addresses, duplicates, invalid routes and new external
  senders need the applicable admission/anti-loop checks; Reply all is not a raw
  union of every address seen in the thread.
- Staff review happens in the composer, with the D1 send-time guard for changed
  content, recipients, authorization and relevant unseen updates. No forced
  donor portal or routine second confirmation is introduced.
- Current-message audience selection does not settle staff inbox permissions,
  third-party admission, BCC policy, protected-action authority, quoted-history
  policy or the precise provider envelope. Those retain D1 safeguards and need
  their own detailed treatment.

## Current Core evidence

Live develop remained `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; Phase 25 PR #1564
remained open at `0624ca3841ea98e618fed0e2c490d24c0ef1d9c1`.

The D1 ADR explicitly leaves participant/CC policy unresolved. The current
Support adapter queues replies to `conversation.externalContactEmail`, with
empty CC/BCC; the reply API accepts no recipient selection. Inbound records do
retain To/CC/BCC. This is current implementation, not a settled single-requester
product policy or proof of completed delivery.

Exact baseline paths:

- `packages/api/src/admin/support-hub/adapter/supabase.ts:904-933,1293-1304,1344-1352`
- `packages/api/src/admin/support-hub/adapter/types.ts:91-106`
- `packages/api/src/admin/support-hub/schemas.ts:80-85`
- `apps/admin/features/support-hub/types/participant.ts:10`
- `openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md:84-87,927-938,1040-1046`

The last source preserves recipient-specific execution/history. It does not
itself decide the user-visible MIME To/CC arrangement. Do not incorrectly use
per-recipient evidence to prohibit ordinary visible CC. The final transport must
be qualified through Phase 17/6 after the product audience semantics are settled.

## Research and strongest contrary evidence

**Front** distinguishes Reply to the sender of a selected message from Reply all
to that message's recipients. Desktop/web show both when appropriate; mobile can
have a preference. This supports clear, message-scoped actions, not a claim that
Front universally defaults to sender-only. Relevant article edited 30 September
2025; no plan limit stated for this section.
[Front reply controls](https://help.front.com/t/m224vg/how-to-reply-to-forward-and-resend-an-email)

**Help Scout** explicitly documents Reply All as its default in the
notification-reply command workflow, with `@nocc` to remove copied recipients.
This is strong contrary evidence: group continuation can be a sensible default.
It does not determine Asym's choice or establish every Help Scout UI variant.
Article updated 25 August 2025.
[Help Scout notification replies](https://docs.helpscout.com/article/67-respond-to-email-notifications-to-take-action-in-help-scout)

**Zendesk** warns that making a CC participant's sender-only response public can
expose content they did not intend for the requester. Its ticket-wide CC rules
also distinguish external recipients from internal followers. Preserve the
audience boundary, but do not convert an external person's email into a
staff-authored internal note merely to mimic its taxonomy. Article edited
1 July 2026.
[Zendesk CC suppression](https://support.zendesk.com/hc/en-us/articles/4408843347866-Understanding-suppression-of-CCs-email-notifications)

**Zoho Desk** distinguishes removing someone from CC from removing their separate
help-center access. That reinforces D1's separation of email recipients and
record-access authority; Asym does not need the same portal/contact model.
[Zoho conversation actions](https://help.zoho.com/portal/en/kb/desk/ticket-management/actions-in-tickets/articles/actions-in-ticket-conversation)

**Intercom documentation limitation:** the External senders section of its
threading article says an unfamiliar sender is not automatically added as a
participant, while an old/new comparison row on the same page says they are.
The group-conversations guide also describes separate participant actions.
This is inconsistent documentation, not verified account behavior. Use it to
identify a test case; do not cite it as conclusive automatic-admission semantics.
D1's prohibition on silent recipient widening is an Asym requirement regardless.
[Intercom threading](https://www.intercom.com/help/en/articles/7996715-email-threading)
[Intercom group participants](https://www.intercom.com/help/en/articles/6435588-manage-group-conversations-in-the-inbox)

## Proof to require after the answer

Test direct and group replies; an incoming message that removes a previous CC;
a legitimate new author; copied/forged thread references; new or hidden recipients;
changed Reply-To; own-address loops; and history disclosure to a newcomer. Verify
keyboard/mobile recipient visibility, unchanged-send simplicity, current recipient
snapshots through retries, and collision handling when the audience changes.

No new runtime or vendor experiment was performed for this question. The default
recommendation follows the ratified privacy and low-friction objectives, current
source gaps, primary documentation, and independent scope review. It remains a
recommendation until the founder answers.
