# Tasks: Eve Email And Discord Notifications

## 1. Envelope And Policy

- [ ] 1.1 Define the typed safe envelope, allowed event classes, severity routing, and expiry.
- [ ] 1.2 Implement deterministic field redaction, URL sanitization, and deny-on-uncertainty behavior.
- [ ] 1.3 Keep unsafe raw payloads and arbitrary model/tool output outside notification records.

## 2. Destinations And Rendering

- [ ] 2.1 Resolve email only from enabled verified platform-owner configuration.
- [ ] 2.1a Enumerate each exact email occurrence meaning and source fence; then
      add only meaning-specific platform-scoped Phase 17 keys, the fixed
      platform profile, and complete proof packs in a later manifest generation.
      The current generation has zero Eve keys; generic `eve_alert` is forbidden
      and every email request fails before Phase 6 intent creation. After Live
      activation, submit only typed Phase 6 intents to an Asym-fixed publication
      and the separately proved Asym platform Resend connection.
- [ ] 2.1b Implement revisioned service-only
      `platform_owner_notification_records` with stable app-principal,
      verified-contact, permission-epoch, event-class, and enable/pause evidence;
      pass only its exact id/revision/epoch into the platform Phase 6 intent.
- [ ] 2.2 Resolve Discord only from enabled app-owned operational destinations.
- [ ] 2.3 Render minimal Discord content by default and gate each rich field independently.

## 3. Lifecycle And Controls

- [ ] 3.1 Implement stable channel-aware notification dedupe; keep Discord
      provider idempotency in Eve and email provider idempotency/reconciliation
      in Phase 6, which invokes the Phase 17 compiler/resolvers.
- [ ] 3.2 Implement one opaque Eve fence containing current #418 release/
      emergency, #420 switch, notification pause/opt-out/expiry/dedupe
      eligibility, exact source event/target identity, #426 verified service-
      identity revision, recipient-authority revision, severity band, current
      #423 budget/rate-limit decision and policy revision, selected eligible
      channel, and content-policy/redaction version. Check it before handoff/
      Discord attempts; require Phase 6 to independently re-read or verify the
      same complete fence before preparation and immediately before the
      submission fence. Missing/stale/mismatched proof fails closed only for
      definitely unsubmitted work; possibly submitted work reconciles, and Phase
      6 does not reimplement Eve policy.
- [ ] 3.3 Enforce notification pause/opt-out plus #418/#420 global state without creating a new global switch.
- [ ] 3.4 Consume #423 budget/rate limits for delivery and retry work.
- [ ] 3.5 Execute every generation/attempt as #426's verified service identity with source initiator/trigger metadata.

## 4. Audit And Visibility

- [ ] 4.1 Emit #419 records for source initiator, verified delivery actor, policy,
      redaction, dedupe, suppression, and Discord outcomes; link—not duplicate—the
      Phase 6 email intent, attempt, and provider outcome evidence.
- [ ] 4.2 Apply #424 retention/hold/expiry to safe notification records.
- [ ] 4.3 Expose safe status, failures, and pause controls through #427.

## 5. Verification

- [ ] 5.1 Test platform-owner-only email, rejection of runtime-supplied
      recipients, fixed platform publication/connection selection, and
      structural inability to use tenant data or fallback transport.
- [ ] 5.2 Test urgent Discord routing, minimal default, approved rich fields, and denied unsafe fields.
- [ ] 5.3 Test secrets, raw production/donor/payment data, raw logs, replay, and unsafe URL exclusion.
- [ ] 5.4 Test dedupe, idempotency, retries, expiry, pause, budget exhaustion, and audit.
- [ ] 5.5 Keep the release switch off and configure/send no external notification in this slice.

## 6. Scope Check

- [ ] 6.1 Confirm #436 owns notification policy and Discord delivery lifecycle,
      not global kill switches or the email provider lifecycle.
- [ ] 6.2 Confirm #425 owns runtime/event-consumer durability and email uses only
      the platform-scoped Phase 17 contract/compiler plus Phase 6 Resend boundary.
- [ ] 6.3 Confirm monitor detection and final launch remain #435/#437 scope.
