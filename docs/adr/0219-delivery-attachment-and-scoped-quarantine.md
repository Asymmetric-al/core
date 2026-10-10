# ADR-0219: Delivery attaches through exact scoped identity and quarantine

**Status:** Accepted (Phase 6 F3; October 8, 2026 owner reconciliation).

Accepted target intent for [AL-551](https://github.com/Asymmetric-al/core/issues/551),
not implementation, provider qualification or activation evidence.

## Context

Signed provider evidence can arrive twice, out of order or before its acceptance response. Recipient email is neither identity nor trustworthy correlation.

## Decision

Choose **attach-not-create + monotonic reducer + quarantine**. Before provider I/O, allocate the permanent internal message identity. Acceptance binds its provider id through the unique `{scope_kind, scope_owner_id, connection_revision, provider_email_id}` index. Verify the opaque webhook route/signature against one exact connection revision first; that fixes scope before attachment. Every member, attempt, outcome and history join preserves that scope and revision. Tags, addresses and provider payload metadata cannot select an owner or recipient.

Delivery evidence attaches to an existing exact communication/preparation identity and never fabricates history, CRM or donation truth. Keep dispatch, provider submission, mail-server delivery, reputation, advisory engagement and evidence health as independent axes, alongside separately authoritative consent/contact and provider-suppression facts. Retain duplicate and out-of-order evidence without regressing a terminal axis; advance only owner-permitted non-conflicting transitions. Contradictory terminal delivery facts (for example, delivered versus bounced or failed in either arrival order) quarantine and open one deterministic repair case instead of overwriting or discarding either fact. A complaint updates the separate reputation axis; it may establish delivered from pending/delayed as the Phase 17 owner permits, but never overwrites a conflicting terminal delivery fact. Gate suppression remains a distinct pre-send fact, and opens/clicks remain advisory engagement. Unresolved, ambiguous or crossed evidence is safely quarantined with minimized evidence, not dropped; later proved correlation may attach it. Unknown provider acceptance reconciles sealed request/attempt evidence, never address search or blind retry.

## Trade-offs and rejected alternatives

- **Address-based attachment:** rejected because shared, changed and attacker-controlled addresses do not prove authority or scope.
- **Webhook-created communication:** rejected because provider evidence cannot invent a happened interaction.
- **Last-arrival-wins or total-precedence status, discarded conflicting evidence or dropped unresolved evidence:** rejected because independent facts must survive duplicates/reordering, terminal conflicts require deterministic repair and missing correlation can be repaired.

The chosen pattern costs explicit typed references and qualification evidence;
it preserves one owner for each fact instead of hiding authority in transport.

## Consequences

Future ingestion and reconciliation fixtures must cover replay, out-of-order evidence, contradictory terminal facts in either arrival order with one repair case, separate complaint/reputation transitions, lost acceptance, wrong connection/scope and later attachment. Legacy email_events is a bounded migration/adapter input, not a second history.

## Related contracts and grounding

- [Phase 6 owner PRD, including dated amendments](../prds/sitestacker-parity/phase-06-shared-communication-event-model.md)
- [Phase 3 projection, consent and export owner](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Phase 17 catalog/preparation/provider owner](../prds/sitestacker-parity/phase-17-system-messages-template-management.md)
- [Existing outbound-communications delta](../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [Program README](../prds/sitestacker-parity/README.md) and [parity matrix](../prds/sitestacker-parity/parity-matrix.md)
- [Build pattern and complete owner/prerequisite links](../prds/sitestacker-parity/phase-06-communication-views-build-pattern.md)
- [ADR registry](registry.md)
- Primary grounding: [Resend webhook introduction](https://resend.com/docs/webhooks/introduction) and [signature verification](https://resend.com/docs/webhooks/verify-webhooks-requests). These sources support the pattern; the owner contract determines Core's accepted scope.
