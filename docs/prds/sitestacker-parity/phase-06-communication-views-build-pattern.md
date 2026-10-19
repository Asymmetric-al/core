# Phase 6 — Future donor and missionary communication views

This is the A13 build recipe for the **first build** of Mission Control's existing
**communications** capability. It extends the existing outbound-communications
contract; it creates no second history or portal product. The missionary workspace
is already a communication surface in the [platform surface contract](../../../openspec/specs/platform-surfaces/spec.md).
Server-only `packages/api` owns communication services and projection/resolver
rules under the [data-access boundary](../../guides/architecture/data-access-boundary.md).

## Evidence and implementation trigger

As of the October 9, 2026 readback, [#560 projection contracts/resolver/tests](https://github.com/Asymmetric-al/core/issues/560),
[#561 staff Activity slice](https://github.com/Asymmetric-al/core/issues/561) and
[#562 donor/missionary read paths](https://github.com/Asymmetric-al/core/issues/562)
are **open**. Their logic/tests and the staff assembly are planned obligations;
this document does not claim that they exist, shipped or passed. The July A13
“ship and are tested now” / “service functions exist” phrasing describes intended
Phase 6 sequencing and is superseded as an implementation claim.

**Implement in the donor-portal / missionary-workspace phase**, after exact
producer-slice implementation and allowed/denied evidence are demonstrated.
[Phase 25 donor dashboard](phase-25-donor-dashboard-depth/README.md) is a consumer
of the governing source domains; the [program roadmap](roadmap.md) routes later
workspace and integration work. No donor/missionary UI ships in AL-551.

## Assembly recipe to implement when the slices land

1. Authenticate the requester server-side. Resolve their active Tenant, role,
   current ownership/assignments and linked identities through Phase 4 and the
   Phase 3 choke point. A shared email, relationship, merged donor shell or
   supporter link grants no permission. Re-prove current source-record access;
   revoked, stale, ambiguous or cross-tenant bindings fail closed.
2. Ask the shared resolver for the matching allowlisted timeline:
   `communication_timeline_staff`, `communication_timeline_donor` or
   `communication_timeline_missionary`. Tenant portal readers never select
   platform history. The donor path returns only admitted communications to the
   same current Party; missionary access is limited to currently assigned
   supporters with explicit source admission. Transitional donor/missionary
   IDs resolve to that same Party, not an independent recipient authority.
3. In the planned #561 staff slice, assemble safe communication items alongside
   existing gift history and `donor_activities` in the CRM person's Activity
   timeline, with the **Communication** filter. Future portal slices replicate
   that assembly pattern over their matching projection; they neither read
   provider tables directly nor rebuild classification or consent rules locally.
   Identity unions deduplicate the one event for a multi-hat Party.
4. Render bounded safe catalog metadata/title, purpose/kind, occurred time,
   channel and normalized outcome; staff receive a rendered consent summary.
   An in-product item says `available` and never invents delivered/read status.
   Reference navigation rechecks source access on use. Personalized subjects,
   bodies, transport addresses, raw consent JSON, raw identifiers, tracking URLs
   and provider payloads are excluded. Donor/missionary views additionally omit
   care, staff-only/internal, other-party and unauthorized source data;
   missionary views omit donor-private financial material. Official-document
   access remains with its own current authorization service.
5. When #560/#561/#562 land, verify allowed same-Party/current-supporter cases and
   denials for another Party/supporter, crossed Tenant, revoked assignment,
   no visibility classification, staff-only care, raw payload/consent/ids,
   donor-private money and platform history. Prove deduplication, safe normalized
   outcomes and Communication filtering with actual producer fixtures; qualify
   accessible loading/empty/error states in the staff slice. Future portals
   repeat role-specific allowed/denied and accessibility checks before release.

## Recipient, provider and payload boundaries

All execution/history references preserve exclusive tenant/platform ownership
and the applicable exact connection revision. The closed branches are canonical
same-tenant Party/contact with exact revision; explicitly contract-permitted
same-tenant no-Party authority kind/id/revision with no durable address; or exact
service-only platform authority. No address, tag or provider payload selects
identity or owner. Platform v1 permits only exact `eve_platform_owner` authority;
the current no-Live-key generation stays non-dispatchable. Account-bootstrap
mail needs its own future admitted branch, not a fake Party or Tenant.

Delivery attaches to an existing exact scoped internal/provider identity, never
creates history, advances monotonically and quarantines unresolved evidence.
Support Hub/member care permanently retain typed payload truth and atomically
emit canonical references; support outbound is deduplicated and care staff-only.
Legacy email logs/events instead require proved bounded migration/adapters,
consumer/FK census and legacy writer fencing into one history. The old blanket
“adapt, not migrate” cannot preserve competing delivery authorities.

## Prerequisites and reserved extension points

- [Consent PR #502](https://github.com/Asymmetric-al/core/pull/502) **merged July 8, 2026**; its historical helper does not qualify current-authority consent/projection/preparation integration. The current Phase 3 gate and actual send-time snapshot remain required before dependent delivery activates.
- [Branded auth-email hook issue #511](https://github.com/Asymmetric-al/core/issues/511) is **open**; auth-email capture depends on qualified native hook/provider integration through the sole seam. This is an issue, not a PR or a proven activated hook.
- Newsletter/Mailchimp contact export and inbound suppression landing are reserved under the [parity matrix](parity-matrix.md) and [Phase 6 out-of-scope contract](phase-06-shared-communication-event-model.md#out-of-scope-reserved-seams--documented-not-built). Mailchimp is an integration seam, never an executable channel; future export must consult current `isExportEligible`, consent, suppression and governed export policy.
- SMS/push and future bulk/newsletter fan-out require their separately ratified program owners and qualification; [Phase 17 forward seams](phase-17-system-messages-template-management.md#forward-seams) and the [program index](../program-roadmap/README.md) route that work. Inngest reconciliation does not activate bulk transport or authorize another provider.
- Phase 17 owns content/catalog/compiler/resolution and qualified Resend connections. Phase 6 owns recipient intent, consent evaluation capture, dispatch, outcomes/recovery and history. This recipe grants neither owner a parallel source of business truth.

## Owning contracts and decisions

- [Program README](README.md), [parity matrix](parity-matrix.md), [Phase 6 A/F and dated amendments](phase-06-shared-communication-event-model.md), [existing OpenSpec delta](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md) and [document authority](../../ai/document-authority.md).
- [Phase 3 projection/consent/export](phase-03-minimum-permission-role-scoped-projection-foundation.md), [Phase 4 identity/claiming](phase-04-identity-account-claiming-foundation.md), [Phase 7 Party/contact and official facts](phase-07-receipt-statement-compliance-and-donor-credit.md), [Phase 17 authoring/provider](phase-17-system-messages-template-management.md).
- [Financial owner Phase 13](phase-13-campaign-designation-contribution-ledger-giving-cart.md), [Phase 18 official documents/retention](phase-18-receipt-pdf-template-system.md), [Phase 19 statement coordination](phase-19-year-end-statement-operations.md), [Support Hub payload owner](../../features/support-hub/README.md).
- [Phase 6 ADR identity mapping F1–F7](../../adr/registry.md#accepted-phase-6-foundation-records--al-551): seven new records 0217–0223.
- Supporting Phase 17 decisions: [canonical message document](../../adr/0030-canonical-message-document-and-presentation-dependencies.md), [immutable preparation/recovery](../../adr/0032-immutable-prepared-message-and-whole-message-recovery.md), [tenant Resend identity](../../adr/0029-tenant-owned-resend-and-composed-delivery-identities.md), [purpose-owned records/verified disposal](../../adr/0038-purpose-owned-records-schedules-and-verified-disposal.md); [ADR-0206 whole posted-financial-row immutability](../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md).

Official financial/document snapshots remain immutable under their separate
owners. History retention labels do not extend raw/prepared/Recent-copy ceilings.
Redaction/retention is a GDPR/CPRA design baseline, not legal qualification;
no erasure jobs, portal UI, schema, provider activation or downstream tickets
#552–#565 are implemented by this publication.
