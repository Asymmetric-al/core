# Personal reply defaults initialize explicit draft audiences

**Status:** Explicitly founder-ratified with all amendments, changes and updates,
Phase 26 D2, 10 September 2026. This includes the Reply-all product default, personal
staff preference, per-email override, D2-R01–R12 and all proof/owner/rollout
obligations. D1 remains fully ratified.

This is an exploratory architectural decision record, not a formal specification,
implemented capability or permission to activate real inboxes.

## Decision

New ordinary human-authored Support email replies start Reply all unless the
signed-in staff member's personal default for the current tenant or an explicit
per-message action selects Reply to sender. A per-email change affects only that
draft. Personalization initializes once; the exact draft audience is an independent
fact, and the admitted send audience is immutable owner-authorized evidence.

Existing drafts retain target message, recipients, text and attachments. Preference
changes, delayed reads, new mail, CRM updates and assignments never silently change
them. Errors are distinct from a confirmed absent preference. Personal settings
are self-owned by tenant and authenticated user, not assignee, first agent or CRM
contact. One small Support setting reuses Core's self-settings pattern and shared
UI; it creates no generic settings engine or team/inbox override hierarchy.

Staff see one labelled audience control beside real To/Cc addresses and a separate
personal setting. Manual edits remain explicit; applying a preset that discards
them shows a compact recipient delta. Notes remain structurally separate. Proven
private-copy intake requires focused review before exposing that participation;
ordinary forwarding alone is not such proof. Normal unchanged group replies do
not gain a blanket confirmation modal.

## Why this tradeoff

Reply-to-sender with a visible Reply-all action remains the strongest alternative:
it reduces initial audience but may omit intentionally copied participants.
The founder chose normal group continuation and personal flexibility. A hidden
per-conversation memory or live default-to-recipient rule would make subsequent
messages unpredictable. Separating personal default, draft audience and admitted
audience preserves the chosen convenience and makes changes reviewable.

This separation is consequential because it controls private data disclosure,
historical truth and dispatch identity across Support, CRM and communication
owners. It is more than a preference-widget implementation detail.

## Explicit owner-contract reconciliation

Phase 17 remains preparation authority and Phase 6 remains dispatch/history owner.
Each recipient copy retains independent authority, semantic identity, preparation
association, evidence and communication history. Native visible group email needs
an explicit owner submission/member relationship that may share one qualified
provider email ID. The visible audience and common payload are approved disclosure
for every member. Signed events affect only provably identified member subsets;
unknown mapping stays indeterminate. No full-group send once per member, private
single-recipient substitute, aggregate delivery overclaim or Support-side bypass
is permitted. Partial recovery never resends successful/possibly successful members
without resolving ambiguity under the qualified owner contract.

Where the current per-recipient contract cannot express that relationship, it must
be explicitly amended in the authorized specification stage before egress. No
existing OpenSpec file is silently overridden or rewritten by this ratified grill
ADR; the required owner reconciliation remains explicit for the authorized
specification stage.

## Scope, evidence and status

All D1 identity, CRM/giving/document/care permissions, note isolation, disclosure,
collision, immutable approval, per-copy history and recovery invariants continue.
This decision adds no portal, external subscription model, workflow engine, AI
sender, new channel or CRM master. Runtime code is not ready merely because the
review is complete. Real authorization, concurrency, migration, accessibility,
mail-client and mixed-recipient provider proof are pre-activation requirements.

- [Complete 23-category review, exact D2-R01–R12 clauses and P01–P15 proof](../../grill/phase26-d2-adversarial-review.md)
- [Independent source, vendor and bounded model evidence](../../grill/phase26-d2-evidence.md)
- [Ratified D1](0001-email-continuation-with-owner-authorized-actions.md)

The review disposition was **Accept with required amendments**. The founder has
now ratified the complete corrected record:

> Okay I ratify this with the amendments/changes/updates you made and record it fully for this grill with docs session.

The accepted record includes D2-R01–R12, P01–P15, owner-contract reconciliation,
operational signals/thresholds/owners/responses and migration/activation safeguards.
This does not authorize implementation, formal specification, tickets, publication
or real messages.
