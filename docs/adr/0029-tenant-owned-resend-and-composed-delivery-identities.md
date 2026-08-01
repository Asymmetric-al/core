# ADR-0029: Tenant-owned Resend and composed delivery identities

**Status:** Accepted (founder rulings, Phase 17 grill session — D10, D17, D20)

> Full record: `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md`
> (ratified decisions D10, D17, and D20).

## Context

Tenant messages must carry the tenant's authenticated identity without letting
request-level overrides, stale credentials, or cross-account retries become
spoofing and deliverability hazards. From identity, reply handling, provider
authority, and message content are related at send time but have different
owners and lifecycles.

## Decision

Every tenant owns one Resend account/team, one proved transactional domain, and
one revisioned connection aggregate. Asym provides no shared fallback account
for tenant messages. The connection stores an encrypted send-only API key,
per-connection signed-webhook secret, provider/account/domain proof, readiness
state, revocation state, and audit evidence. Secrets never enter client reads,
logs, previews, publications, exports, delivery snapshots, or support history.

Platform-scoped Asym operator email is a separate, narrow topology rather than a
tenant exception. It uses one separately proved Asym-owned Resend connection,
domain, fixed service-only publication, sender/reply policy, and verified
platform recipients. It cannot resolve tenant data, publications, credentials,
or recipients and can never act as fallback for a tenant connection. A closed
scope discriminator and database/service constraints prevent a platform message
from impersonating a tenant or a tenant message from selecting platform
transport.

The discriminator is the Phase 6/17 exclusive owner arc: `tenant_id` XOR
`platform_scope_id`, propagated through scope-aware parent/result FKs and
semantic/provider/batch/history keys. Platform transport is owned by the
service-only `platform_email_settings` aggregate and its encrypted
`platform_resend_secret_revisions`/proof evidence; platform recipients are exact
revisioned app-owned authority records. Tenant Party/contact/profile fields and
platform authority/profile fields are mutually exclusive. This is not a fake
tenant or a second delivery spine.

Each tenant has one required **Default Sender Profile** and a bounded set of
same-domain Sender Profiles. A contract resolves a sender purpose through a
fixed sparse order over active, proved profiles; there are no request-level
From/header overrides. Reply-To is resolved independently through a
contract-owned reply purpose to one access-confirmed, tenant-controlled
destination or to an explicit no-reply posture. Reply destinations do not
create inbound-thread behavior; Phase 26 owns inbound reply processing.

Preparation composes and freezes the exact matching-owner connection revision,
provider account proof, and branch-specific delivery identity: tenant Sender
Profile/reply-purpose/Reply-To revisions for tenant scope, or the fixed platform
sender/reply-policy revision for platform scope. It also freezes the resulting
From/Reply-To posture and message/publication identity. Several immutable
delivery snapshots may coexist while configuration changes. A prepared message
never swaps owner, account, sender, reply destination/policy, or credential;
revoked or unproved authority stops or quarantines it under the recovery
contract.

Resend event reduction preserves independent submission, mail-server delivery,
reputation/complaint, advisory engagement, and evidence-health axes. Provider
suppression is branch-specific transport evidence, not consent and not a Sender
Profile setting. Tenant scope binds connection/region/contact-address revision
and may append Phase 3 contact-risk evidence; platform scope binds only the
service-owned connection and exact platform recipient-authority revision and
cannot create Party/contact evidence. The product claims only absence of known
blocking evidence; a send-only key cannot prove the provider list is complete. Only the
adapter builds the small contract-owned header allow-list, including
`Auto-Submitted` and RFC 8058 unsubscribe headers where the contract requires
them.

Milestone M0 pins the exact Resend SDK, management probe and response
discriminators, send/batch schemas, webhook schemas/signature library, and dated
official evidence. Provider response headers drive a per-connection rate/quota
limiter. Phase 17 has one instantiable credential kind, `resend_sending_key`;
the reserved `resend_oauth_send_grant` type is structurally unreachable until a
separate authorized OAuth/PKCE migration. Rotation, compromise, disconnect, and
domain/team/region migration fence new work and reconcile old pinned identities
without cross-account replay.

Reply mailbox confirmation binds the exact tenant, destination revision, and
initiating human principal; completion requires a fresh session, capability,
and step-up. Sender display names use a pinned address encoder and Unicode
security checks without imposing an ASCII-only policy. Hard injection or
provider-mutated identity blocks readiness; only a confusable-name warning may
proceed through protected review.

## Consequences

- Setup is a guided tenant-owned Resend connection flow: paste secret, verify
  server-side, configure signed webhook, prove domain/account, send test, then
  mark Ready. Secret values are write-only and masked after save.
- Sender and reply configuration uses purpose-labeled profiles, effective-use
  preview, impact review, test, history, and reversible future-only publication.
- Webhooks route only through exact connection/account/message evidence and
  reject cross-scope, cross-owner, stale-secret, replayed, or ambiguous events.
- Platform-scoped email uses the same Phase 6/17 preparation, Resend outcome,
  recovery, and body-free history contracts through its separate connection;
  Discord operational delivery remains outside this email ADR.
- Tests cover rotation, revocation, concurrent versions, same-domain rules,
  missing/invalid reply targets, provider outage, and no shared fallback.
- Tests also cover event disorder/conflicts, regional suppression, protected
  headers, RFC 8058 encodings, webhook disablement/recovery, challenge abuse,
  localized/confusable display names, secret live purge, backup expiry, and
  verified cryptographic erasure.
