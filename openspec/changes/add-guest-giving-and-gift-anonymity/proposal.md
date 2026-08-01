# Add Guest Giving And Gift Anonymity

## Why

Donors must be able to give online without first creating or signing into an
account. They must also be able to choose, per gift, whether their identity is
hidden from missionary and public views while finance retains the legal-donor
truth required for stewardship, compliance, and audit.

This change must join the canonical phase-owned architecture rather than create
another gift, receipt, identity, or staff-entry system. Online acceptance uses
the Phase 4 Party and account-claim boundary plus the Phase 13 contribution
ledger. Every staff-entered offline gift, including quick entry of one gift,
uses the Phase 15 gift-entry-batch gateway. Official documents and messages
then follow the Phase 7 → Phase 18 → Phase 17 → Phase 6 owner chain.

## What Changes

- Add guest-first online checkout. The public client supplies identity and
  contact inputs but never a Party identifier. At accepted contribution time,
  the server uses the tenant-scoped Phase 4 resolution boundary to find or
  create the canonical Party and reserve optional, verified account claiming
  without revealing whether the Party already existed.
- Replace raw payment credential fields and simulated success with
  Stripe-hosted collection. PAN, CVC, and bank credentials never reach Asym,
  and success derives only from server-confirmed provider and contribution
  state.
- Persist accepted online gift truth only through Phase 13
  `contribution_headers`, allocation lines, and postings. Freeze the exact
  `legal_donor_party_id`, source identity/contact evidence, tenant, Legal
  Entity, Settlement Account Binding, currency, allocation, and per-gift
  visibility choices at that boundary.
- Add per-gift anonymity preferences for missionary and public audiences.
  Finance and authorized administrators retain full identity. Every
  role-scoped projection and outbound use enforces the preference server-side,
  and privileged changes are audited.
- Route every staff-entered offline gift through Phase 15
  `gift_entry_batches`. Quick entry is a one-row batch with simplified UI.
  Known-donor rows resolve a Party and freeze source evidence; intentional
  `unknown_offline` rows keep `legal_donor_party_id` null and never fabricate a
  Party, name, email, address, or receipt outcome.
- Preserve owner boundaries after acceptance: Phase 7 derives and versions
  official receipt facts, Phase 18 creates the canonical artifact, Phase 17
  prepares governed message content, and Phase 6 resolves consent/contact,
  dispatches, and records the communication outcome. Portal access and
  delivery use the stored exact artifact bytes and never rerender a live gift,
  Party profile, or receipt snapshot.

## Superseded Legacy Evidence

The earlier draft treated a legacy flat gift row as the target, stored mutable
receipt identity/outcome fields beside money, and proposed a standalone
staff-offline endpoint. Those are historical implementation observations only
and are deleted from the forward design. This change MUST NOT:

- extend or dual-write `public.donations`;
- persist `donor_id`, `receipt_status`, `receipt_name`, `receipt_email`, or
  `receipt_address` as the new contribution contract;
- create a synthetic anonymous or system donor;
- expose a parallel `POST /api/contributions/offline` writer; or
- render or dispatch an official receipt directly from checkout or offline
  entry.

## Impact

- Affected specs: `donation-lifecycle`, `contribution-operations`
- Primary owners consumed: Phase 4 identity/account claiming, Phase 13
  contribution ledger, Phase 15 offline gift entry, Phase 7 receipt facts,
  Phase 18 document production, Phase 17 governed message content, and Phase 6
  communication dispatch/history
- Affected product surfaces: public checkout, donor account-claim invitation,
  donor and missionary projections, Mission Control quick entry and batch
  entry, contribution detail, and governed receipt communication
- **BREAKING**: the guest checkout contract returns canonical contribution and
  provider state without revealing Party-match information; all staff offline
  writes converge on the Phase 15 commit service.
