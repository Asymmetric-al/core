# Phase 24 D45 — Optional Initial Coordinator Email

**Decision date:** 2026-08-29  
**Founder direction:** Option 1 — required D44 Tasks Hub and staff in-product
attention may receive an immediate external email supplement when the Tenant
enables it and the recipient preference allows it; the effective Tenant default
is off.  
**Scope:** Initial coordinator email only: Phase 17/6 contract integration,
Tenant and recipient controls, content, recipient/contact resolution, email
delivery, UX, privacy, RLS, concurrency, extensibility, operations, and proof.
D46 owns only the reminder decision; digest and escalation require later
separate decisions.  
**Method:** `/grill-with-docs`, Core ADR/OpenSpec/current-code review,
first-party IAM/service-management/Resend/accessibility research, and the
required 22-category adversarial pass.  
**Verification note:** Broad formatting, local-link, skill-parity, strict
OpenSpec, lint, typecheck, unit, build, and `git diff --check` verification
remains deferred until the Grill ends. Only focused structural/count checks are
performed here.

## Final disposition

**Accept with required amendments.**

Optional email is a current, proven supplement for assigned access-governance
work, and a default-off Tenant choice is proportionate because D44 already
guarantees durable Tasks Hub responsibility, required Notification Center
attention, and the complete source lane. It is not required for correctness or
continuity.

The unqualified answer would become brittle or dangerous if D45 directly
called Resend, looked up `profiles.email`, copied request detail, reused task or
notification identity, retroactively emailed existing requests, treated
provider acceptance as human awareness, or introduced a generic channel/rule
engine. Option 1 is accepted only with these amendments:

- register one fixed optional `staff_email` Delivery
  Step in the two D44 Phase 17 contracts; do not create D45-local queue,
  preference, template, recipient, send-history, or provider tables;
- preserve the required `in_product` step and ADR-0183 task regardless of every
  Tenant, recipient, contact, provider, content, or worker email outcome;
- make the Tenant Delivery Plan default `email_disabled`; an actor with current
  `system_messages.plan.manage` may enable it only after a fresh Phase 17
  readiness/impact review, not through D44 coordinator authority;
- use a narrowing recipient preference `inherit | disabled`: absence/`inherit`
  follows the Tenant plan, while `disabled` suppresses email; a recipient can
  never enable what the Tenant disabled or change in-product/task behavior;
- admit only the exact current D44 recipient generation, then resolve the
  current same-Tenant Phase 17 Party/role/surface and purpose-valid verified
  staff email contact revision; D45 cannot add, substitute, or fall back to a
  profile address, original grantor, admin, group alias, or arbitrary address;
- evaluate in the fixed order contract → Tenant plan → recipient preference →
  current D44/source/auth/privacy → contact/suppression → email connection/
  sender/reply readiness; unknown email eligibility fails closed for email but
  never blocks required task/in-product release;
- make plan activation and personal preference changes future-only: they send
  no email for an already-created item or existing request merely because a
  switch changed;
- produce one email for a new per-request D44 occurrence and at most one grouped
  email for one `access_request_responsibility_updated_v1` occurrence; never
  fan a backlog summary into one email per historical child request;
- define **immediate** as claimable after durable plan release with no
  Tenant-configurable schedule, not synchronous, guaranteed, urgent, or an SLA;
- use a minimal code-governed safe fact wall and authenticated typed link to
  People & access; no holder name, capability, reason, group/provenance,
  authority proof, peer identity, due date, inline Keep/Remove, reply command,
  attachment, arbitrary URL, or tracking pixel;
- compile one complete bounded plan occurrence with separately keyed
  recipient/channel children; product identities and Phase 6 claims own replay,
  while Resend's 24-hour idempotency is defense in depth only;
- keep provider submission, mail-server delivery, bounce, complaint, and
  indeterminate evidence separate from in-product read, task engagement,
  request outcome, and human awareness; never infer one from another;
- suppress an unstarted email when D43/D44 source/recipient authority or the
  current recipient preference is no longer valid; an already provider-accepted
  message is honestly non-retractable and may arrive after source state changed;
- use only the Tenant's proved Phase 17/6 Resend connection, `staff_operations`
  sender purpose, and `staff_operations_help` reply-purpose posture; there is no
  Asym/shared/cross-Tenant fallback or caller-selected From/Reply-To;
- keep addresses and rendered bodies in encrypted, bounded prepared-delivery
  material only; durable history remains body/address-free and open/click
  tracking remains disabled;
- use the existing code-owned Delivery Plan/channel registry as the extension
  seam for future push, Slack, Teams, Google Chat, or other channels, but add no
  placeholder rows, arbitrary `channel` values, universal webhook adapter,
  provider-neutral lowest-common-denominator API, or Tenant rule builder;
- require every future channel to earn its own recipient-destination authority,
  connection/auth scopes, consent/preference, content renderer, idempotency,
  callback/outcome, privacy/retention, rate/abuse, UX, migration, and shutdown
  contract before it can narrow the same D44 generation; and
- allow Inngest only as an optional identifier-only Phase 6 executor/reconciler,
  never as email eligibility, message identity, content, recipient, retry truth,
  or human-wait authority.

These amendments complete Option 1 without replacing it.

## Exact corrected decision

> D45 adds the optional code-owned Delivery Step
> `staff_email` to the fixed Delivery Plans for
> `holder_access_review_requested_v1` and
> `access_request_responsibility_updated_v1`. The existing `in_product` step
> remains required under D44, and the ADR-0183 task remains a separate
> source-work projection. Email is a sibling Phase 6 communication intent, not
> a mirror row, task, notification read state, request, approval, or authority.
> One published `profile.access_governance_attention@1` family-plan selection
> governs both exact `staff_email` slots atomically. Mixed per-key On/Off is
> invalid, and On publishes only when both exact contract, publication, and
> readiness dependency sets are compatible. Each stable message key still has
> its own semantic occurrence, rendering, identity, outcome, and repair evidence.
>
> D45 creates no local email table, queue, recipient list, preference store,
> template builder, send log, provider event store, retry engine, scheduler, or
> workflow. It reuses Phase 17's code-owned catalog/publication/Delivery Plan,
> Phase 6's complete plan-occurrence compiler and recipient-specific intent/
> delivery/history spine, ADR-0029's Tenant-owned Resend connection/sender/reply
> identities, and the current Phase 3/12/17 recipient/privacy boundaries.
>
> For each Tenant, the effective D45 Delivery Plan choice is exactly
> `email_disabled | email_enabled`. Missing, legacy, unknown, or unproved policy
> resolves to `email_disabled`. This is the meaning of **default off**. Only a
> current same-Tenant actor using `system_messages.plan.manage` may publish a
> successor. Access-request coordinator status, D44 route-management authority,
> `permissions.manage_grants`, task assignment, notification receipt, Owner/
> Admin label, support, service role, or original-grantor history grants no plan
> management authority.
>
> Plan management lives in the canonical Phase 17 **System Messages → Messages
> → Access review requested → Delivery** surface. The existing **People &
> access → Access requests** surface
> may show a compact read-only **Coordinator email: Off / On / Needs email
> setup** summary and a typed **Manage email delivery** link only when the viewer
> independently holds the needed Phase 17 read/manage purpose. It creates no
> second setting or D45 page. The D44 coordinator Sheet states only:
> **Coordinators always receive a task and Notification Center alert. Optional
> email is managed in System messages.**
>
> The canonical settings card is **Access request coordinator email**. It shows:
>
> ```text
> In product                                      Always on
>
> Email coordinators when access requests need attention
> Optional. Email supplements Tasks and Notification Center. Coordinators
> can turn this email off in their personal notification preferences.
> Email settings never change Tasks Hub work or Access requests.
>
> ○ Off
> ● On
> ```
>
> It says **Turning this on applies only to new coordinator attention. It will
> not email people about existing requests.** It does not offer channel order,
> delay, quiet hours, recipient list, arbitrary event, custom rule, condition,
> template, webhook, reminder, escalation, or test-send control. D46 decides
> reminder posture separately; digest and escalation remain later decisions.
>
> Enabling requires the exact D45 contract/generation to be Live, a complete
> published safe email variant, current Tenant Resend connection/profile/domain/
> webhook/tracking proof in Phase 17 `Ready`, and current compatible
> `staff_operations` sender plus `staff_operations_help` reply-purpose posture.
> If readiness is absent, the radio cannot be saved as On and the card says
> **Email needs setup** with a typed link to the existing authorized repair/
> connection surface. It never asks for or displays an API key, From address,
> Reply-To address, or provider secret in Access requests settings.
>
> Before publication, the server produces a fresh permission-safe impact over
> the current D44 policy head and Phase 17 readiness heads. It reports the
> effective plan choice, exact transport/readiness result, **Personal settings
> may narrow delivery**, and **0 existing requests will be emailed**. It shows
> no selected/eligible/preference-disabled/unavailable person count: with D44's
> one-to-three-person cohort, even aggregate differences could identify an
> individual's private choice or contact state. It exposes no address,
> preference owner, contact body, request, capability, protected source fact,
> provider secret, or person/request matrix. Any stale, partial, timeout,
> contradictory, corrupt, or indeterminate required plan/readiness proof writes
> no plan revision.
>
> A recipient's D45 personal choice uses the closed
> `preference.access_request_responsibility_email@1` key and is exactly
> `inherit | disabled` for the exact Tenant, Active Tenant Assignment, Party,
> registered staff role/surface, contract family, and email channel. Absence
> resolves to `inherit`. `inherit` follows the Tenant plan;
> `disabled` narrows it. There is no recipient `force_on`, address override,
> alternate address, channel order, schedule, or rule. A preference grants no
> D44 membership, request visibility, task, notification, email address, or
> decision authority.
>
> Under **Settings → Notifications → Access request responsibility**, the recipient sees
> the read-only **Effective email** result and one stable personal choice:
> **Follow my organization's setting** (`inherit`, default) or **Off for me**
> (`disabled`). This is a labelled radio group, not a switch whose apparent
> value changes when the Tenant plan changes. Helper text says **You will still
> receive a task and an in-product notification if you turn email off.** When
> the Tenant plan is Off, Effective email says **Off — your organization has
> access-request email off** while the stored personal choice remains explicit
> for a later Tenant re-enable. Preference updates are self-only,
> server-derived, expected-version CAS writes with a local draft, Cancel,
> **Save changes**, persistent status, and no retrospective email.
>
> Route managers and other coordinators cannot inspect or override an
> individual's preference. An authorized plan manager sees transport/readiness
> and the statement that personal settings may narrow delivery, never cohort
> preference/contact counts. Support,
> service roles, analytics, AI, exports, and provider dashboards do not become
> preference editors.
>
> One email candidate starts only from an exact current D44 admitted recipient
> generation. The server maps that exact assignment through D44's trusted
> current same-Tenant Party/role/surface identity and then through the registered
> `staff_operations` recipient adapter to one current purpose-valid verified
> staff email contact revision. Missing, ambiguous, unverified, hidden,
> incompatible, suppressed, stale, cross-Tenant, or wrong-role contact evidence
> produces no email child. D45 never falls back to `profiles.email`, login
> email, a different contact, role/group address, original grantor, manager,
> admin, requester, another Tenant, or caller-provided address.
>
> Email eligibility is evaluated in this fixed narrowing order:
>
> 1. the exact D44 contract/generation declares the optional Live email step;
> 2. the exact current Tenant Delivery Plan selects `email_enabled`;
> 3. the exact recipient preference is not `disabled`;
> 4. the D43 occurrence and D44 recipient generation remain current and the
>    recipient still passes exact authorization/privacy/source checks;
> 5. the current verified email contact revision and Phase 3 suppression/
>    communication floor permit this operational message; and
> 6. the matching Tenant connection, sender/reply identities, publication, and
>    channel are completely Ready.
>
> A later layer may only narrow. A complete `eligible` result creates the email
> child. A proved-ineligible result omits it with a safe typed reason. Any
> optional-email indeterminacy fails closed to no email and emits repair/
> telemetry, but the complete plan still releases its required in-product child
> and D44 task remains independent. Unknown never becomes enabled, a fallback
> recipient, or a reason to suppress required in-product attention.
>
> **Immediate** means the eligible email child becomes claimable after the
> complete bounded plan occurrence is durably released. It means no custom
> delay or schedule. It does not mean synchronous with D43/D44, guaranteed
> latency, urgent priority, delivery, human awareness, or an SLA. D43 request
> creation, D44 task, required in-product attention, source lane, and holder
> status never wait for email preparation, provider submission, or outcome.
>
> Enabling the Tenant plan, changing `disabled` to `inherit`, connecting Resend,
> repairing a sender, or restoring a contact applies only to future meaningful
> D44 attention occurrences. It does not synthesize an email sibling for an
> existing item, replay historical requests, scan the source lane, or create a
> wall of delayed mail. A later new D43 request or new D44 differential
> responsibility-application generation may produce a new candidate normally.
>
> A new `holder_access_review_requested_v1` occurrence may produce exactly one
> D45 email per exact recipient generation. A D44 backlog adoption may produce
> exactly one grouped email for the matching
> `access_request_responsibility_updated_v1` recipient/responsibility-
> application generation, containing the same immutable initial count as the
> in-product occurrence. It never creates one email per admitted child request.
> Continuing and removed recipients receive no email from a route re-evaluation.
>
> The complete plan compiler owns one permanent parent occurrence identity and
> separately keyed `in_product` and optional `email` child occurrence slots.
> The email semantic identity includes exact scope/environment, D44 source
> occurrence or responsibility-application generation, recipient generation,
> contract/binding/plan/step versions, contact authority revision, and producer
> fence. Same identity/same complete immutable input returns the prior child;
> changed recipient, plan, contact, content, sender, or relation under an
> occupied identity hard-conflicts. A legitimate successor uses a new source-
> authorized generation, never a retry-generated token.
>
> Phase 6 product uniqueness, expected heads, complete parent/member digest,
> claims, dispatch linearization, send log, and provider-evidence reconciliation
> own replay safety. Resend's provider idempotency key is derived from the frozen
> exact provider envelope and is defense in depth for its documented 24-hour
> window; it never aliases the product intent or makes a send safe after that
> window. A possible provider acceptance becomes **Delivery outcome unknown**
> and must reconcile; D45 never blind-sends a replacement.
>
> The inherited safe per-request email uses:
>
> - subject: **Access review needs attention**;
> - preheader: **Sign in to see current status and available actions.**;
> - body: **An access review was assigned to you. Sign in to see current status
>   and available actions. This email does not grant permission and does not
>   mean access has changed.**;
> - one action: **Review access request**; and
> - footer: **This email was prepared because your organization enabled access
>   request email, you were assigned as an Access request coordinator, and your
>   personal setting followed the organization's choice. Manage notification
>   preferences.**
>
> The grouped variant uses subject **Access review responsibilities
> updated**, body **You were assigned {count} existing access requests. Sign in
> to see current status and available actions. This email does not grant
> permission or change anyone's access.**, and
> one **View access requests** action. `{count}` is the immutable safe grouped
> count and is required in the grouped body, never the subject or preheader; it
> never expands to a subject/capability/request list.
>
> The per-request render fact set is empty. The grouped fact wall contains only
> the required immutable safe count; authenticated destination and preference-
> help codes are server-owned action dependencies, while Tenant branding comes
> only from the governed From/layout/Brand Kit—not subject interpolation. It forbids holder/requester
> name, email, capability, direct/group source, D40 reason, D43 explanation or
> outcome, group/provenance, reviewer authority, other coordinators, due date,
> urgency, SLA, provider jargon, raw ID, arbitrary URL, attachment, calendar
> event, reply command, inline Keep/Remove, one-click decision, or tracking
> pixel. Forwarding the email reveals no protected request fact and grants no
> product access.
>
> The button resolves a code-owned HTTPS Mission Control destination; no caller,
> Tenant content, email variable, `return_to`, Host/forwarded host, or provider
> link chooses it. Opening or prefetching is an inert authenticated GET. The
> destination re-proves active Tenant, current D44 responsibility/source-lane
> authorization, D43 request/current source, and D42 field purpose. It may show
> current terminal/no-longer-authorized state; the email never promises that
> the request is still pending. Keep/Remove remains a deliberate Phase 12
> command in People & access with its existing safeguards.
>
> Email uses Phase 17's **Service message** role layout, Tenant Brand Kit,
> current localized publication/fallback rules, semantic HTML and complete
> plain text. The D45 contract fixes the fact/action wall. Tenant content may
> vary only through the existing Phase 17 publication capabilities explicitly
> admitted by this contract; it cannot add facts, recipient variables, arbitrary
> links, scripts, pixels, hidden meaning, or extra actions. D45 creates no local
> subject/body fields or direct HTML interpolation.
>
> The sender/reply/header adapter uses only the exact matching Tenant Resend
> connection, `staff_operations` Sender Profile purpose, and the required
> `staff_operations_help` Reply-To purpose. Missing or unready Reply-To proof
> makes the optional email ineligible; there is no D45 no-reply branch. The
> adapter emits the protected header allowlist and `Auto-Submitted` posture;
> caller headers are rejected. The email is an optional operational/transactional
> message, not marketing. D45 adds no marketing list, campaign, or recipient-
> supplied unsubscribe token. The in-product preference action remains the
> direct control. Open/click tracking is disabled and provider open/click drift
> never creates notification read, task engagement, source action, or human-
> awareness evidence.
>
> Before dispatching, Phase 6 re-proves the exact producer fence/source,
> recipient generation/current authority, current `disabled` preference,
> contact ownership/suppression, connection/sender/reply readiness, and prepared
> identity. Source resolution, coordinator removal, assignment/authorization
> loss, recipient disable, contact invalidation, suppression, or connection
> protection before dispatch suppresses the unstarted intent. A Tenant Delivery
> Plan edit is future-only under ADR-0026; an already released email may still
> proceed unless a live safety/recipient/source fence stops it, and the UI says
> **Changes affect new alerts; email already being sent may still arrive.**
>
> After provider acceptance, no configuration or source change can truthfully
> recall the email. It may arrive after the request resolves; its safe copy and
> authenticated current-state destination remain truthful. Provider
> `delivered` means accepted by the recipient mail server, not opened, read,
> understood, or acted on. Bounce, complaint, suppression, delay, failure, and
> indeterminate outcomes update only Phase 6/17 delivery evidence and authorized
> operational health. They never create another email automatically, change the
> recipient preference, task, notification engagement, request, grant, or D44
> responsibility.
>
> Prepared destination/body bytes are encrypted and bounded by
> `prepared.optional_staff_7d@1`, always shortened by source/recipient/privacy/
> erasure/safety stops. Durable intents, events, audit, task, notification,
> delivery history, logs, metrics, analytics, exports, backups, and AI contain
> no email address, rendered body, request detail, provider raw payload, IP,
> user-agent, or personalized subject. Authorized recent-copy handling, if any,
> follows Phase 17's separate tenant-only reveal/purge policy and is not a D45
> source or ordinary export.
>
> D45 plan/preference/intent/history relations preserve exact Tenant scope,
> composite same-Tenant Party/contact/assignment/plan relations, immutable
> versions, restrictive deletion, and product uniqueness. Browser base writes
> remain revoked; purpose-built reads/commands use application checks plus
> `ENABLE`/`FORCE RLS`, correct `USING` and `WITH CHECK`, pinned `search_path`,
> explicit grants, and owner/service/`BYPASSRLS`/worker/support parity. Caller-
> controlled Tenant, actor, recipient, email, contact, preference owner, plan,
> contract, step, sender, reply, locale, body, status, timestamp, or provider ID
> is never authoritative.
>
> Future channels reuse only the code-owned **Delivery Step** contract shape and
> D44 recipient-generation reference. Every channel has a closed registered key
> and its own exact destination authority, connection/credentials/scopes,
> consent and narrowing preference, readiness/suppression, safe presentation,
> submission identity, provider callback/outcome, rate/abuse controls,
> retention/privacy, UX, migration, observability, and shutdown proof. An
> adapter may narrow the D44 set but never add recipients or reinterpret D43.
> Push, SMS, Slack, Teams, Google Chat, WhatsApp, Discord, arbitrary webhook,
> and unknown channels remain structurally non-executable until separate
> governing decisions make exact steps Live. No placeholder configuration rows
> or generic channel matrix is created by D45.
>
> Inngest may optionally claim/reconcile identifier-only Phase 6 work after
> product commit. Its event carries only schema version, exact scope routing,
> plan/intention IDs, dispatch request ID, and safe adapter kind. It never
> carries recipient address/body/request facts, chooses a channel/recipient,
> waits for a human, infers awareness, or owns idempotency, source, preference,
> delivery outcome, retry safety, or provider truth.

## Evidence classification and modern-practice resolution

### Verified repository facts

- ADR-0026 already defines fixed, named, versioned required/optional Delivery
  Steps and prohibits a Tenant-authored workflow graph. D45 is one optional
  named step, not a new rules engine.
- ADR-0027 separates source-owned relevance, in-product presentation,
  engagement, and external delivery. D44 already registers the two required
  in-product occurrences and explicitly leaves immediate email to D45.
- ADR-0029 and Phase 6/17 own Tenant Resend connection, sender/reply identities,
  complete plan compilation, recipient-specific intents, provider attempts,
  webhook evidence, and body-free history.
- Phase 17's intended evaluation order is contract → Tenant configuration →
  recipient preference → current access/privacy/source. Optional staff email
  uses `prepared.optional_staff_7d@1`; tracking is disabled.
- Phase 17's catalog/Delivery Plan/communication intent/in-product center are
  **forward contracts**, not shipped runtime. The current Resend connection,
  templates, send logs, and webhook reducer are real primitives they will
  extend.
- Current contribution approval notifications already default email off unless
  both Tenant and recipient settings allow it, but their mutable domain tables,
  profile/role recipient resolver, synchronous direct content, SLA/reminder/
  escalation, and provider-key reuse are migration inputs—not D45 authority.
- The legacy `notification_queue` has conflicting schema/migration RLS posture
  and no proved transport worker; it cannot be revived for D45.

### Verified current external evidence

- Microsoft Entra lets administrators independently enable reviewer email and
  reminders; its reviewer email links back to the authorized access-review
  portal. This supports a separate initial-email decision and a later reminder
  decision. Entra commonly defaults reviewer email on; Core explicitly does
  not import that default because D44 already provides required task and
  in-product attention, the founder selected default off, and Core's privacy/
  noise trade-off differs from a periodic enterprise campaign.
  [Create an Entra access review](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
- Okta sends access-request updates through email, Slack, or Teams according to
  notification settings and distinguishes request/task state from delivery.
  This supports separate channel adapters and preferences, not a universal
  cross-channel payload or provider-owned source.
  [Okta access-request notifications](https://help.okta.com/en-us/content/topics/identity-governance/notifications.htm)
- Jira lets users independently choose in-product and email notifications while
  administrator notification configuration remains an upper bound. This
  supports Tenant policy plus a narrowing recipient preference.
  [Jira personal notification settings](https://support.atlassian.com/jira-service-management-cloud/docs/manage-your-jira-personal-settings/)
- Resend documents idempotency only for email/batch requests and only within a
  24-hour window. Product identity and reconciliation therefore must remain in
  Core. [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys)
- Resend's delivered webhook means delivery to the recipient's mail server; it
  does not prove human read or action. [Resend webhook event types](https://resend.com/docs/webhooks/event-types)
- Resend sends through a domain the customer owns, aligning with Core's
  Tenant-owned verified-domain rule. [Resend domains](https://resend.com/docs/dashboard/domains/introduction)
- WCAG 2.2's names, focus, errors, status messages, reflow, contrast, and target
  requirements apply to settings and linked web UI; semantic, complete HTML and
  plain-text email avoids image-only or inaccessible action meaning.
  [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Product judgments and unresolved empirical facts

- **Product judgment:** Tenant-level default off plus recipient narrowing gives
  ministries a clear opt-in without requiring every coordinator to configure
  two switches before email works.
- **Product judgment:** recipient `inherit` is the default; it permits a
  deliberately enabled Tenant plan, while `disabled` is a durable personal
  opt-out. Recipient preference can narrow but never broaden.
- **Product judgment:** activation is future-only and backlog adoption remains
  one grouped email, preventing surprise floods.
- **Product judgment:** email includes no holder/capability detail because the
  authenticated product already supplies it after current authorization.
- **Unknown:** how many Tenants will enable email, which coordinators will opt
  out, whether email improves time-to-review, and whether staff perceive task,
  bell, and email as redundant.
- **Unknown:** which future channels ministries actually need. Their existence
  in comparable products is not evidence that Core should implement them now.
- **Evidence needed:** pilot enablement/opt-out/delivery/bounce/complaint rates,
  time-to-first-authorized-detail comparison, comprehension testing, duplicate-
  feeling research, connection-readiness failures, and representative ministry
  interviews. Measurements may inform later versions but cannot silently widen
  D45.

## Current behavior, intended behavior, and permanent path

| Area                      | Current repository behavior                                               | Prior intended contract                                                    | D45 permanent path                                                                        |
| ------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Initial coordinator email | No shipped D45 contract/runtime.                                          | D44 requires task + Phase 17 in-product and reserves email for D45.        | One optional fixed email step for the two D44 occurrences.                                |
| Email planning            | Contribution approval code plans domain rows and direct synchronous mail. | ADR-0026/Phase 6/17 complete bounded plans and recipient channel children. | Compile required in-product plus optional email through one product plan occurrence.      |
| Recipient                 | Current approval code queries `profiles.email` by profile IDs.            | D44 assignment → Party/role/surface; Phase 3/6/17 contact authority.       | Exact D44 recipient narrowed to one verified purpose-valid contact revision; no fallback. |
| Preferences               | Current contribution preferences are domain-specific.                     | Phase 17 contract → Tenant → recipient → current safety.                   | Tenant disabled/enabled plan plus self-only inherit/disabled preference.                  |
| Content                   | Current approval helper builds direct strings with finance fields.        | Phase 17 catalog/publication/fact wall/Brand Kit/layout.                   | Minimal access-governance publication with typed product link and no protected detail.    |
| Delivery                  | Real Resend connection/send logs/webhook reducer exist.                   | ADR-0029/Phase 6 provider identities and evidence.                         | One frozen optional staff intent; no blind retry or source coupling.                      |
| Other channels            | No D45 push/Slack/Teams/Google Chat adapter.                              | Additional channels only when explicitly adopted.                          | Reuse fixed-step contract shape later; no generic engine or placeholder config now.       |

## Domain model, ownership, and invariants

### Canonical terms

- **Initial coordinator email:** one optional external email sibling of a D44
  initial personal-attention occurrence. It is delivery, not the request or
  notification itself.
- **D45 email step:** the fixed code-owned `staff_email` Delivery Step in
  `profile.access_governance_attention@1` under
  `plan.required_in_product_optional_email@1`.
- **Tenant D45 plan choice:** future-occurrence choice `email_disabled |
email_enabled`, default disabled.
- **Coordinator email preference:** the self-owned
  `preference.access_request_responsibility_email@1` with `inherit | disabled`
  for the exact Tenant, Active Tenant Assignment, Party, registered role/
  surface, contract family, and email channel.
- **Email child:** one recipient-specific Phase 6 intent under a released
  complete plan occurrence.

### Ownership matrix

| Fact                                | Authority                                                 | Derived consumers                        | Never authoritative                          |
| ----------------------------------- | --------------------------------------------------------- | ---------------------------------------- | -------------------------------------------- |
| Request state/actionability/outcome | D43 Phase 12 request aggregate                            | task, in-product, email source fence     | email/provider/open/click                    |
| Personal responsibility recipients  | D44 recipient generation                                  | task, Phase 17/6 plan compiler           | email address, plan, provider                |
| Required in-product item/engagement | Phase 17/ADR-0027                                         | staff bell/center                        | email delivery/read, task, source            |
| Tenant email choice                 | Phase 17 Delivery Plan revision                           | future plan compilation                  | D44 coordinator settings/task                |
| Recipient email choice              | Phase 17 preference version                               | future eligibility + send-time narrowing | plan enablement, authority, contact          |
| Recipient/contact authority         | D44 mapping + Phase 3/6/17 registered adapter             | email intent/preparation                 | `profiles.email`, caller/provider address    |
| Email content/publication           | Phase 17 contract/publication                             | prepared email                           | producer/task/notification prose             |
| Email intent/history                | Phase 6                                                   | operational/history views                | request, task, in-product engagement         |
| Sender/reply/connection             | ADR-0029/Phase 17 owner                                   | preparation/dispatch                     | D45 caller, fallback account                 |
| Provider outcome                    | Resend signed evidence reduced by Phase 6                 | delivery health                          | human read/action or source outcome          |
| Execution/retry                     | Phase 6 claims/dispatch ledger; optional Inngest executor | telemetry/reconciliation                 | identity, preference, source, provider truth |

### Invariants

1. Required D44 task and in-product attention never depend on email.
2. Email is absent unless contract, Tenant, recipient, source/auth/privacy,
   contact/suppression, and connection/content readiness all allow it.
3. Every layer can narrow only; no layer adds a D44 recipient.
4. Tenant default is off; recipient preference cannot override Tenant off.
5. Enabling or changing preference never emails existing items/requests.
6. One new request yields at most one email per recipient generation.
7. One responsibility-update occurrence yields at most one grouped email per
   recipient/application generation and never one per child request.
8. Immediate means claimable after durable release, not synchronous/guaranteed.
9. Email identity is not task, in-product item, preference, or provider identity.
10. Product uniqueness/claims own idempotency; provider dedupe is secondary.
11. Email address/body exists only in encrypted bounded preparation.
12. Durable history and telemetry are body/address/request-detail free.
13. Email contains no protected source detail or product mutation action.
14. Link opening/prefetching changes no source, task, notification, or preference.
15. Current source/recipient/preference/suppression can stop unstarted email.
16. Provider-accepted email is non-retractable and may arrive after source change.
17. Provider delivered/open/click never proves read, awareness, or action.
18. Tenant connection/sender/reply never crosses scope or silently falls back.
19. Future channels need separately Live fixed steps and channel-specific proof.
20. D45 adds no reminder, digest, escalation, arbitrary rule, or workflow.

### Smallest durable persistence

D45 introduces no standalone persistence aggregate. It specializes existing
Phase 17/6 records:

1. **Delivery Plan revision** — same Tenant/environment, exact contract/fixed
   step choice, predecessor/current head, future-effective instant, trusted
   actor/time, readiness/impact digest, and semantic receipt. One current head;
   default/unknown is disabled.
2. **Recipient channel preference version** — exact Tenant, Active Tenant
   Assignment, Party, registered role/surface,
   `preference.access_request_responsibility_email@1`, contract family, `email`,
   `inherit | disabled`, predecessor, self actor/time, and expected-version
   receipt. It stores no address or coordinator authority.
3. **Communication plan occurrence** — exact D44 producer occurrence/fence,
   plan/binding versions, complete child count/digest, permanent parent identity,
   and release evidence, including deterministic zero-email membership.
4. **Recipient/channel intent** — exact same-scope recipient authority,
   contact-revision reference, contract/step/publication/plan identities,
   producer fence, semantic/immutable-command hashes, claim/result revision,
   and body-free result references.
5. **Prepared delivery and provider evidence** — encrypted bounded recipient/
   rendered bytes and frozen delivery identity; separately durable body-free
   send/attempt/signed-webhook/outcome evidence.

Every relation has exact scope/environment and composite same-scope foreign
keys. Immutable business identities do not update. Current heads and one child
per permanent slot use unique/partial-unique constraints; restrictive deletion
preserves security evidence. No D45 table points back from request/task/item to
an email status as authority.

## State, temporal, concurrency, and idempotency model

### Closed states/results

| Object                  | States/results                                                    | Valid transitions                              | Forbidden meaning                                       |
| ----------------------- | ----------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| Tenant D45 plan         | `email_disabled`, `email_enabled`                                 | expected-head future-only successor            | per-request override, unknown-as-on, rule graph         |
| Recipient preference    | `inherit`, `disabled`                                             | self-only expected-version successor           | force-on, alternate address, channel order              |
| Eligibility             | `eligible`, `proved_ineligible(reason)`, `indeterminate(reason)`  | recompute for a new occurrence/send-time fence | fallback, recipient widening, required-item suppression |
| Phase 6 intent/delivery | existing immutable intent/claim/dispatch/provider evidence states | Phase 6 commands/reducer only                  | email-specific source/task/read status                  |
| D43/D44/Phase 17        | their existing states                                             | their owner commands only                      | email/provider mutation                                 |

### Evaluation and delivery sequence

1. D43/D44 commits its authoritative occurrence/recipient generation and
   identifier-only projection intent.
2. The generated Phase 17 registry loads the exact Live contracts, Tenant plan,
   recipient preference, current D44/source/auth/privacy, contact/suppression,
   publication, and connection/sender/reply readiness.
3. The complete plan compiler deterministically releases the required
   `in_product` child and, only if completely eligible, one optional `email`
   child. Optional email indeterminacy omits email but cannot omit in-product.
4. Phase 17 creates the required local item without a provider call.
5. Phase 6 claims the email child, prepares/freeze recipient/content/delivery
   identity, then re-proves live safety and linearizes dispatch.
6. Resend submission uses a provider-envelope idempotency key. Timeout or
   possible acceptance becomes indeterminate and reconciles before retry.
7. Signed webhook evidence reduces provider state independently; no event
   changes D43/D44/task/in-product engagement.

### Race outcomes

| Race                                                  | Required result                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| Tenant enables email while an old request/item exists | no retrospective email; next meaningful occurrence uses new plan         |
| Tenant plan save races new occurrence                 | pinned plan head/cutover selects exactly off or on                       |
| recipient disables before plan compilation            | no email child; required in-product remains                              |
| recipient disables after release but before dispatch  | unstarted email suppresses; no replacement                               |
| recipient re-enables later                            | future occurrences only; old suppressed intent stays terminal            |
| source resolves before dispatch                       | email suppresses; task/in-product follow source independently            |
| source resolves after provider acceptance             | email may arrive; link shows current safe state; no recall claim         |
| coordinator loses eligibility before dispatch         | email suppresses and personal presentation ends under D44                |
| verified contact changes before dispatch              | old contact intent suppresses; no same-occurrence reroute to new address |
| connection/sender becomes unready                     | unstarted intent suppresses/pauses per Phase 17; no fallback account     |
| response lost after plan release                      | same product identity returns same parent/children                       |
| provider timeout/24h dedupe expiry                    | reconcile same frozen send; never blind replacement                      |
| duplicate/out-of-order webhook                        | signature/dedupe/monotonic reducer preserves one evidence history        |
| task or in-product read occurs first                  | email eligibility is unchanged; engagement does not cancel delivery      |

## UX/UI contract

### Tenant Delivery Plan summary

```text
Access request coordinator email

In product                                      Always on
Email                                                   Off

Email is optional and applies only to new coordinator attention.
It never changes Tasks Hub work, access, or request decisions.   [Change]
```

### Email settings Sheet

```text
Access request coordinator email

Coordinators always receive a task and Notification Center alert.
Email is an optional additional alert.

○ Off
  Do not send coordinator email.

● On
  Send email for new coordinator attention when the recipient has not
  turned it off and email is ready.

Turning this on applies only to new coordinator attention. It will not
email people about existing requests.

Email readiness                              Ready
Personal settings may narrow delivery
Existing requests that will be emailed           0 requests

[Cancel]                                      [Review and save]
```

Readiness is **Ready**, **Needs email setup**, **Needs tenant action**,
**Paused for protection**, **Provider unavailable**, or **Outcome
indeterminate** from Phase 17—not a D45 Boolean. No selected/eligible/
preference-disabled/unavailable recipient count is shown because a one-to-three
cohort would make private preference/contact state identifiable. Zero existing
requests, loading, no-access, stale, and indeterminate remain distinct. A stale review preserves the choice, announces
**Review the updated impact**, and writes nothing.

### Recipient preference

```text
People & access

Effective email                                                On

My choice
● Follow my organization's setting
○ Off for me

You will still receive a task and an in-product notification if you choose
Off for me.

[Cancel]                                      [Save changes]
```

When Tenant email is off:

```text
Effective email                                               Off
Your organization has access-request email off.

My choice
● Follow my organization's setting
○ Off for me
```

The preference page never shows or edits the delivery address, Tenant sender,
provider, coordinator roster, other people's preferences, source request, or
email history. It keeps changes in a local draft, disables **Save changes**
while unchanged or pending, supports **Cancel**, and uses persistent
receipt-backed save/error/ambiguous-response status rather than autosave or a
toast alone.

### Email rendering

Per request:

```text
[Hope Ministries]

Access review needs attention

An access review was assigned to you. Sign in to see current status and
available actions. This email does not grant permission and does not mean access
has changed.

[Review access request]

This email was prepared because your organization enabled access request email,
you were assigned as an Access request coordinator, and your personal setting
followed the organization's choice.
[Manage notification preferences]
```

Grouped responsibility update:

```text
[Hope Ministries]

Access review responsibilities updated

You were assigned 3 existing access requests. Sign in to see current status and
available actions. This email does not grant permission or change anyone's
access.

[View access requests]

This email was prepared because your organization enabled access request email,
updated its Access request coordinators, and your personal setting followed the
organization's choice.
[Manage notification preferences]
```

No protected preview appears in the subject, preheader, body, alt text, URL,
analytics, provider metadata, or plain text. The responsive HTML and plain text
have equivalent meaning/action. The Tenant identity, purpose, and preference
reason reduce phishing ambiguity without exposing the source.

### Accessibility and field conditions

- Reuse shared Base Maia/Base UI Card, RadioGroup/Switch, Sheet, Button, Alert,
  status, Skeleton, and responsive list primitives; no D45 component library or
  app-local setting fork.
- Use semantic headings, labels, descriptions, values, buttons, links, error
  summaries, and polite status announcements. State never relies on color,
  icon, hover, toast, or provider jargon.
- Preserve keyboard operation, visible unobscured focus, Escape/return focus,
  44-by-44 important targets, 320-CSS-pixel/400% reflow, forced colors, text
  spacing, contrast, zoom, mobile safe areas, and virtual keyboards.
- Email uses semantic reading order, live text rather than image-only meaning,
  descriptive links, sufficient contrast, supported text scaling, useful alt
  text only for meaningful imagery, and complete plain text.
- Support localized strings/plurals, long Tenant names, Unicode/CJK/RTL/bidi,
  locale fallback truth, and low-bandwidth clients with remote images blocked.
  Meaning/action remains without images, CSS, or tracking.

## Normative requirements

1. **D45-R1 — Optional sibling only.** D45 adds one optional initial email
   Delivery Step to the two D44 contracts; task/in-product/source remain required/independent.
2. **D45-R2 — Existing communication owners.** Phase 17 owns contract/content/
   plan; Phase 6 owns intent/delivery/history; D45 creates no parallel spine.
3. **D45-R3 — Default-off Tenant policy.** Missing/unknown/unproved policy is
   `email_disabled`; only `system_messages.plan.manage` publishes On.
4. **D45-R4 — Narrowing personal preference.** Exact self preference is
   `inherit | disabled`; it never overrides Tenant off or grants anything.
5. **D45-R5 — Exact D44 recipients.** D45 begins from and may only narrow the
   current D44 generation; requester and noncoordinator inclusion is impossible.
6. **D45-R6 — Verified contact authority.** One current same-Tenant purpose-
   valid verified staff contact revision is required; no profile/address fallback.
7. **D45-R7 — Fixed evaluation order.** Contract → Tenant → recipient → current
   source/auth/privacy → contact/suppression → channel readiness, all narrowing.
8. **D45-R8 — Required attention survives.** Optional-email zero/unknown/failure
   never blocks or changes task, in-product, source lane, request, or grant.
9. **D45-R9 — Asymmetric settings lifecycle.** Tenant On, `disabled→inherit`,
   or readiness/contact repair applies only to source occurrences committed
   after the new effective head and never backfills; Tenant Off,
   `inherit→disabled`, or another current safety loss suppresses any not-yet-
   provider-submitted child at fire-time reproof.
10. **D45-R10 — Bounded fanout.** One per-request email or one grouped update
    email per exact recipient plus responsibility-application generation; never
    one per backlog child.
11. **D45-R11 — Immediate without SLA.** Email is claimable after durable
    release with no schedule, guarantee, urgency, or synchronous dependency.
12. **D45-R12 — Complete plan compilation.** Required and optional channel
    children have independent permanent identities under one complete parent.
13. **D45-R13 — Product idempotency.** Product uniqueness/claims/reconciliation
    own replay; provider 24-hour idempotency is secondary.
14. **D45-R14 — Safe content wall.** Per-request render facts are empty;
    grouped render facts contain only the required immutable initial safe count.
    Tenant branding/action destinations come from governed dependencies, and no
    protected request/grant/recipient content or mutation action is admitted.
15. **D45-R15 — Typed inert link.** Email opens authenticated People & access;
    GET/prefetch/link possession grants nothing and current checks decide detail/action.
16. **D45-R16 — Tenant-owned delivery identity.** Exact Ready Tenant Resend,
    sender/reply purposes, publication, and header/tracking posture; no fallback.
17. **D45-R17 — Live pre-dispatch fences.** Source/recipient/preference/contact/
    suppression/readiness can stop unstarted email; accepted mail is non-retractable.
18. **D45-R18 — Independent outcome axes.** Provider states never become
    notification read, task engagement, awareness, source outcome, or retry authority.
19. **D45-R19 — Data minimization.** Address/body stay encrypted and bounded;
    durable history, events, logs, analytics, exports, and AI remain body/address-free.
20. **D45-R20 — Accessible coherent UX.** Canonical plan and self-preference
    settings plus safe accessible HTML/text clearly explain additive email.
21. **D45-R21 — Tenant/RLS safety.** Composite same-Tenant relations,
    server-derived attribution, revoked base writes, forced RLS, and privileged parity apply.
22. **D45-R22 — Closed future channel seam.** Future channels reuse fixed
    Delivery Step shape only after channel-specific governing proof; no placeholders/rule engine.
23. **D45-R23 — No cross-channel coupling.** Every channel has independent
    destination, preference, readiness, intent, outcome, retry, retention, and kill switch.
24. **D45-R24 — No reminder scope creep.** D45 creates no reminder, digest,
    escalation, due date, SLA, schedule, or repeated email. D46 decides only
    reminder posture; digest and escalation require later decisions.
25. **D45-R25 — Provider-safe recovery.** Possible acceptance stays
    indeterminate until reconciled; no blind resend, changed payload retry, or provider-log truth.
26. **D45-R26 — Operational transparency.** Safe readiness/delivery health is
    visible to authorized owners without exposing recipients/content or implying awareness.
27. **D45-R27 — Optional executor.** Inngest carries identifiers only and owns
    no recipient/content/preference/source/idempotency/provider outcome.
28. **D45-R28 — Additive rollout/rollback.** Manifest/readiness/deny/shadow
    first, default off/canary, no backfill, email-only kill, roll-forward evidence.
29. **D45-R29 — Humane measurement.** Aggregate delivery/product signals only;
    no coordinator surveillance, pressure, read/open scoring, or HR use.
30. **D45-R30 — Evidence-bound version.** Any new fact, recipient posture,
    default, channel, reminder, or broader customization requires a versioned decision and proof.

## Ruthless 22-category adversarial review

Severity and likelihood describe the concern before the corrected safeguards.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

| What could go wrong                                                                                                                                           | Why it matters                                                                 | Severity / likelihood | Evidence or reasoning                                                                                                       | Decision effect              | Permanent fix                                                                                                       | Exact requirement / acceptance language                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Core could add email although task, Notification Center, and source lane already solve the workflow, creating redundant noise and delivery burden.            | Ministries may pay operational/privacy cost without improving review response. | Medium / Medium       | Entra commonly emails reviewers, while Jira/Okta allow channel preferences; no evidence proves all Core Tenants need email. | Narrows rather than rejects. | Make email default-off, optional, future-only, preference-narrowed, and measure value; required in-product remains. | **D45-R1, R3–R4, R8–R9, R29–R30; D45-AC001–020, AC116–120:** email MUST be supplementary and optional. |
| The strongest no-build alternative is task + Notification Center only. It has lower risk but may miss coordinators who do not open Mission Control regularly. | Reach versus noise is a real product trade-off.                                | Medium / Medium       | Microsoft and Okta use email for access-work attention; founder explicitly selected optional email.                         | Confirms the bounded choice. | One initial external email step, not a general delivery system.                                                     | **D45-R1–R3, R24; D45-AC001–010, AC111–120.**                                                          |

### 2. Brittleness

**Material concern: Yes.**

| What could go wrong                                                                                                                                                           | Why it matters                                                                | Severity / likelihood                                    | Evidence or reasoning                                                                                                                         | Decision effect                           | Permanent fix                                                                                                            | Exact requirement / acceptance language                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| A direct `profiles.email` lookup, copied D44 roster, mutable From/Reply-To, or provider ID works only until contact, assignment, Tenant, role, connection, or sender changes. | Email can go to the wrong person/Tenant or drift from current responsibility. | Critical / High if copied from current contribution code | Current approval email queries profiles; Phase 17/6 forward contracts use exact Party/contact/profile authority and frozen delivery identity. | Changes the recipient and delivery model. | Start from D44, resolve exact verified contact revision, pin plan/content/sender, re-prove live fences, never fall back. | **D45-R5–R7, R12, R16–R17, R21; D45-AC031–050, AC071–080.** |

### 3. Technical debt

**Material concern: Yes.**

| What could go wrong                                                                                                                          | Why it matters                                                                 | Severity / likelihood        | Evidence or reasoning                                                        | Decision effect              | Permanent fix                                                                 | Exact requirement / acceptance language                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| D45-local preferences, queue, templates, send log, retry loop, or generic adapter duplicate Phase 17/6 and make later channels incompatible. | Every new source/channel grows another lifecycle, migration, and support path. | High / High if feature-local | ADR-0026/0029 and Phase 6/17 already own bounded steps and delivery history. | Changes implementation only. | Specialize existing registry/plan/intent/history; no local persistence spine. | **D45-R2, R12–R13, R19, R22–R23, R27; D45-AC001–010, AC041–050, AC091–100.** |

### 4. Edge cases

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                                 | Why it matters                                                                       | Severity / likelihood    | Evidence or reasoning                                                                            | Decision effect                                     | Permanent fix                                                                                                                   | Exact requirement / acceptance language      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Enablement races occurrence creation; preference/contact/source changes before dispatch; grouped backlog is large; provider possibly accepted; email arrives after resolution; recipient has multiple hats/Tenants. | Duplicate, stale, misaddressed, or misleading email can result from ordinary timing. | High / High in aggregate | Phase 6 already models fences/indeterminate provider outcomes; D44 has differential generations. | Requires explicit race table and semantic identity. | Future-only cutover, current narrowing checks, one grouped child, no reroute, indeterminate reconciliation, current-state link. | **D45-R5–R13, R17–R18, R25; D45-AC041–080.** |

### 5. Footguns

**Material concern: Yes.**

| What could go wrong                                                                                                                                                          | Why it matters                                                                                                         | Severity / likelihood  | Evidence or reasoning                                                                                 | Decision effect           | Permanent fix                                                                                                                  | Exact requirement / acceptance language                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| “Immediate,” an email button, delivery checkmark, default-on toggle, arbitrary address/From, test send, or one-click Keep/Remove can imply urgency, awareness, or authority. | Staff may misconfigure privacy-sensitive delivery or make consequential access decisions from forwarded/scanned email. | Critical / Medium-high | Email scanners/prefetchers are common; Phase 17 protects product actions and separates provider axes. | Narrows wording/controls. | Exact helper copy, no email decision action, typed authenticated link, provider-state language, server rejection of overrides. | **D45-R3, R11, R14–R18, R20; D45-AC021–030, AC051–070.** |

### 6. Tenant safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                 | Why it matters                                                            | Severity / likelihood                     | Evidence or reasoning                                                                                | Decision effect                          | Permanent fix                                                                                                                 | Exact requirement / acceptance language                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Plan, preference, recipient, contact, content, connection, provider event, cache, or worker may cross Tenant/scope, especially for multi-hat staff. | Email is externally irreversible and can expose governance relationships. | Critical / Medium absent defense in depth | Identity/platform boundaries require application checks and RLS; ADR-0029 prohibits shared fallback. | Changes every relation and adapter seam. | Exact scope tuple, composite FKs, trusted mapping, Tenant-owned connection, scoped keys/claims, poison tests, uniform errors. | **D45-R5–R7, R16, R21; D45-AC031–040, AC081–090, AC111–120.** |

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                 | Why it matters                                                                    | Severity / likelihood    | Evidence or reasoning                                                                                        | Decision effect                               | Permanent fix                                                                                                                                        | Exact requirement / acceptance language              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Caller-controlled actor/recipient/address/plan/status, bare FKs, missing `WITH CHECK`, owner bypass, browser writes, mutable semantic columns, or cascade delete can forge sends or erase evidence. | An allowed update can transform a permitted row into forbidden external delivery. | Critical / High if naïve | PostgreSQL RLS owners/service roles need parity; Phase 17 forward schema requires immutable same-scope arcs. | Makes structural/database controls normative. | Server-derived commands, composite keys, checks/uniques, append-only versions, revoke raw writes, FORCE RLS, hardened functions, restrictive delete. | **D45-R12–R13, R19, R21; D45-AC031–050, AC081–090.** |

### 8. Overengineering

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                               | Why it matters                                                                  | Severity / likelihood                     | Evidence or reasoning                                                                                                          | Decision effect        | Permanent fix                                                                                             | Exact requirement / acceptance language         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Generic rules, arbitrary channels/webhooks, schedules, conditions, templates, fallbacks, retries, reminders, digests, escalation, or provider-neutral abstraction solve speculative future needs. | It duplicates Phase 34 and hides channel-specific privacy/security differences. | High / High if “extensible” means generic | ADR-0026 explicitly permits fixed named steps and rejects workflow graphs; future channels have different authority/readiness. | Narrows extensibility. | One email step now; closed registry and separate governing proof for each later channel; no placeholders. | **D45-R22–R24, R30; D45-AC091–100, AC116–120.** |

### 9. UX/UI and user friction

**Material concern: Yes.**

| What could go wrong                                                                                                                                                              | Why it matters                                                             | Severity / likelihood        | Evidence or reasoning                                                                                     | Decision effect                   | Permanent fix                                                                                                                                        | Exact requirement / acceptance language           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Email is configured in the coordinator picker, requires two opt-ins, claims coverage, hides readiness, retroactively sends backlog, or duplicates task/bell without explanation. | Administrators misunderstand ownership and recipients face surprise/noise. | High / High without exact IA | Phase 17 plan management has separate capability; Jira demonstrates admin bounds plus personal narrowing. | Changes IA and default semantics. | Canonical System messages card, read-only contextual link, Tenant off by default, personal inherit/disable, future-only impact, exact additive copy. | **D45-R3–R4, R9, R20; D45-AC011–030, AC101–110.** |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

| What could go wrong                                                                                                                                                      | Why it matters                                                                          | Severity / likelihood                      | Evidence or reasoning                      | Decision effect       | Permanent fix                                                                                                                          | Exact requirement / acceptance language                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Request, D44 generation, in-product item, email intent, provider delivery, preference, task, and Inngest can each appear to own recipient/actionability/read/completion. | Circular synchronization can decide access or suppress required work based on delivery. | Critical / High without explicit ownership | ADR-0027/0183/Phase 6 separate these axes. | Changes architecture. | D43 source, D44 recipients, Phase17 plan/content/item, Phase6 delivery, provider evidence, task engagement, and executor stay one-way. | **D45-R1–R2, R5, R8, R12, R18; D45-AC001–010, AC061–080.** |

### 11. Hidden coupling

**Material concern: Yes.**

| What could go wrong                                                                                                                                                         | Why it matters                                                                   | Severity / likelihood | Evidence or reasoning                                                       | Decision effect               | Permanent fix                                                                                                                               | Exact requirement / acceptance language                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| D45 could depend on contribution approval tables, D44 task rows, the bell demo, profile email, Email Studio local binding, Resend availability, or a future Slack identity. | Unrelated migrations or outages break governance and cross-domain meaning leaks. | High / Medium         | Current code is explicitly migration input; intended catalog is code-owned. | Narrows allowed dependencies. | Generated exact contract/binding, D44 generation reference, Phase6/17 owner APIs, replaceable provider executor; no convention-based reuse. | **D45-R2, R5–R8, R16, R22–R23, R27; D45-AC001–010, AC091–100.** |

### 12. Failure modes

**Material concern: Yes.**

| What could go wrong                                                                                                                                | Why it matters                                                        | Severity / likelihood | Evidence or reasoning                                               | Decision effect             | Permanent fix                                                                                                                                         | Exact requirement / acceptance language                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Optional evaluation, rendering, outbox, worker, provider, webhook, or response fails before/after possible acceptance; one sibling succeeds alone. | Required attention could be blocked or duplicate external email sent. | High / Medium         | Email boundaries are at-least-once/ambiguous; Resend dedupe is 24h. | Defines fail-safe behavior. | Required child releases independently; durable product identities/claims, source-lane fallback, indeterminate state, reconciliation, no blind resend. | **D45-R8, R12–R13, R17–R18, R25–R27; D45-AC041–080, AC111–120.** |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                    | Why it matters                                                               | Severity / likelihood  | Evidence or reasoning                                                                                | Decision effect                              | Permanent fix                                                                                                                                        | Exact requirement / acceptance language             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Settings backfill old items; two plan saves race; preference changes race claim; contact changes reroute; provider timeout passes dedupe window; grouped and child identities collide. | Users get duplicate, stale, or surprise mail and evidence cannot explain it. | Critical / Medium-high | ADR-0026 uses pinned future-only plans; Phase 6 requires permanent slots and dispatch linearization. | Requires exact identity/cutover/state rules. | Expected heads, future-only plan, immutable parent/member tokens, current suppression, no contact reroute, envelope idempotency plus reconciliation. | **D45-R9–R13, R17, R25; D45-AC041–050, AC071–080.** |

### 14. Data integrity risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                             | Why it matters                                                              | Severity / likelihood | Evidence or reasoning                                                                      | Decision effect               | Permanent fix                                                                                                                                     | Exact requirement / acceptance language                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Duplicate plan heads/preferences/intents, incomplete child set, changed payload under same key, stale contact, mismatched provider event, or deleted evidence corrupts history. | Retry/repair can send twice or associate delivery with the wrong recipient. | Critical / Medium     | Phase 6 complete-set and signed-webhook model exists specifically to prevent these states. | Adds structural conservation. | Unique heads/slots, complete parent digest/release last, immutable hashes, same-scope provider correlation, restrictive deletion, reconciliation. | **D45-R12–R13, R19, R21, R25; D45-AC031–050, AC061–090.** |

### 15. Security and privacy risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                | Why it matters                                                             | Severity / likelihood | Evidence or reasoning                                                                                         | Decision effect                | Permanent fix                                                                                                                                       | Exact requirement / acceptance language              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Subject/body/URL/provider metadata can expose holder, capability, role, location, care, personnel, or security facts; forwarded mail or link scanners can trigger action; tracking profiles staff. | External email is hard to retract and may leave Tenant-controlled systems. | Critical / Medium     | D43 text is protected; Phase17 disables tracking and uses typed authenticated links; DPA notes tracking data. | Narrows content and transport. | Minimal fact wall, inert link, no email action/token, tracking off, encrypted bounded body/address, body-free history, current auth at destination. | **D45-R14–R19, R21, R29; D45-AC051–060, AC081–090.** |

### 16. Scalability and performance risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                        | Why it matters                                     | Severity / likelihood | Evidence or reasoning                                                                     | Decision effect               | Permanent fix                                                                                                                                        | Exact requirement / acceptance language                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Backlog enablement sends N emails, plan compile loops synchronously, preference/contact reads become N+1, provider rate limits, or large content/history burdens requests. | Source commits slow/fail and staff receive storms. | High / Medium         | D44 bounds recipients but not request count; Resend rate/idempotency are provider limits. | Changes fanout and execution. | Future-only activation, grouped update, set-based complete compile, async claims/batches within Phase6, bounded content/retention, measured budgets. | **D45-R9–R13, R19, R26–R27; D45-AC041–050, AC101–110.** |

### 17. Operational burden

**Material concern: Yes.**

| What could go wrong                                                                                                                                                      | Why it matters                                                                | Severity / likelihood | Evidence or reasoning                                                                    | Decision effect             | Permanent fix                                                                                                                                       | Exact requirement / acceptance language                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Tenants enable email without Ready connection; bounces/complaints/suppressions accumulate; direct DB retry becomes normal; support cannot explain why no email was sent. | Small ministries face hidden setup/repair and staff wrongly assume awareness. | High / Medium         | ADR-0029 has explicit readiness/repair states; optional in-product is reliable fallback. | Adds readiness UX/runbooks. | Block enable until Ready, safe aggregate health, body-free reason codes, deterministic replay/reconcile, independent kill switch, no manual resend. | **D45-R16–R18, R25–R28; D45-AC021–030, AC061–070, AC101–120.** |

### 18. Observability and auditability gaps

**Material concern: Yes.**

| What could go wrong                                                                                                                                 | Why it matters                                                        | Severity / likelihood          | Evidence or reasoning                                            | Decision effect                  | Permanent fix                                                                                                     | Exact requirement / acceptance language                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| “Sent/notified/read” conflates plan eligibility, intent, provider acceptance, mail-server delivery, open/click, in-product read, and source action. | Incidents and staff reports become misleading; retries may be unsafe. | High / High without typed axes | Resend documents distinct events; ADR-0027 separates engagement. | Requires typed evidence/wording. | Separate plan/intent/attempt/provider/item/task/source audit, causal IDs, exact status copy, no open/click truth. | **D45-R13, R18, R25–R26, R29; D45-AC061–090, AC111–120.** |

### 19. Dependency and integration risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                         | Why it matters                                                    | Severity / likelihood | Evidence or reasoning                                                                           | Decision effect           | Permanent fix                                                                                                                                               | Exact requirement / acceptance language                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Resend outage/rate/schema/webhook change, DNS/domain drift, email client scanning, future channel API scopes, or Inngest outage becomes source truth or required attention. | External vendor behavior can strand or corrupt access governance. | High / Medium         | Workflow OpenSpec and ADR-0029 keep provider/executor subordinate; in-product remains required. | Narrows integration role. | Tenant-owned pinned connection, generated adapters, signed events, readiness, product ledger/claims, source-safe fallback, provider replacement/kill tests. | **D45-R8, R13, R16–R18, R22–R27; D45-AC061–100, AC111–120.** |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                       | Why it matters                                                  | Severity / likelihood                  | Evidence or reasoning                                          | Decision effect                                        | Permanent fix                                                                                                                                                  | Exact requirement / acceptance language                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Migration copies contribution preferences/profile recipients, enables by default, emails existing items, dual-writes old/new send history, or old code misreads new plan. | Surprise external mail and duplicate delivery are irreversible. | Critical / High without staged cutover | Current implementation and intended Phase17 differ materially. | Requires no-inference/default-off/future-only rollout. | Readers/deny/manifest first, shadow compile no-send, explicit Tenant enable, no historical backfill, one writer, email-only kill, roll-forward pinned intents. | **D45-R3, R9, R12–R13, R28; D45-AC001–020, AC111–120.** |

### 21. Testability, traceability, and proof

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                    | Why it matters                                                    | Severity / likelihood | Evidence or reasoning                                                                          | Decision effect                 | Permanent fix                                                                                                                                 | Exact requirement / acceptance language           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Tests assert a send call but miss tenant isolation, preference, source race, optional-indeterminate, scanner, grouped fanout, provider timeout, body leak, accessibility, or rollback. | Code can appear green while externally leaking or double-sending. | Critical / High       | Core requires public-seam and production-shaped proof; provider success alone is insufficient. | Adds falsifiable trace anchors. | Carry D45-R/AC IDs through ADR/OpenSpec/design/tickets/tests/release; cover positive/negative/boundary/race/migration/a11y/provider fixtures. | **D45-R1–R30 and D45-AC001–AC120 are normative.** |

### 22. Other development hazards

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                    | Why it matters                                                                       | Severity / likelihood | Evidence or reasoning                                                                                                     | Decision effect                        | Permanent fix                                                                                                                           | Exact requirement / acceptance language                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Open/click/read metrics score coordinators; “future-proof” adapter admits arbitrary webhooks; support force-sends; optional email is relabeled marketing; reply creates unowned inbox. | Surveillance, data exfiltration, compliance drift, and unsupported workflows result. | High / Medium         | No founder evidence authorizes performance management/generic channels; Phase17 excludes inbound mail and tracking truth. | Adds humane/no-scope-creep boundaries. | Aggregate health only, tracking off, no force-send, fixed channel registry, transactional classification, Phase26 owns inbound replies. | **D45-R14–R16, R22–R24, R29–R30; D45-AC051–060, AC091–100, AC116–120.** |

## Acceptance criteria

### Decision, scope, ownership, and current reality

- **D45-AC001:** Both `holder_access_review_requested_v1` and
  `access_request_responsibility_updated_v1` declare exactly one optional fixed
  `staff_email` Delivery Step in their generated Live contract. One published
  `profile.access_governance_attention@1` family-plan selection governs both
  slots atomically; mixed per-key On/Off is invalid, and On requires compatible
  dependencies for both while their semantic occurrences remain separate.
- **D45-AC002:** The D44 `in_product` step remains required and the ADR-0183
  task remains separate regardless of email plan/preference/readiness/outcome.
- **D45-AC003:** D43 alone owns request state/actionability/outcome and D44 alone
  owns personal responsibility recipients; D45 mutates neither.
- **D45-AC004:** Phase 17 owns email contract, fact wall, publication, layout,
  plan, sender/reply resolution, and readiness; D45 creates no local copies.
- **D45-AC005:** Phase 6 owns plan occurrence, intent, claim, dispatch, provider
  attempt/evidence/outcome, reconciliation, and body-free history.
- **D45-AC006:** Task assignment, notification item/read/archive, email intent/
  delivery, provider open/click, and D43 decision are distinct axes with no
  backward ownership.
- **D45-AC007:** Current contribution approval notification/preference/profile-
  email/direct-content/SLA code is explicitly rejected as D45 schema,
  recipient, lifecycle, or delivery authority.
- **D45-AC008:** The legacy `notification_queue`, current bell demo, task rows,
  Email Studio binding row, provider template, or send log cannot authorize a
  D45 occurrence.
- **D45-AC009:** D45 creates no reminder, digest, escalation, due date, SLA,
  schedule, repeated email, holder/requester outcome email, SMS, push, Slack,
  Teams, Google Chat, Discord, webhook, or generic channel behavior.
- **D45-AC010:** An unknown/Reserved/Retired contract, generation, binding,
  plan, step, recipient adapter, publication, or channel rejects email before
  intent creation while required attention remains recoverable.

### Tenant plan, recipient preference, and settings semantics

- **D45-AC011:** Missing, legacy, null, unknown, or unproved D45 Tenant plan
  resolves to `email_disabled` and creates zero email children.
- **D45-AC012:** The only Tenant choices are `email_disabled` and
  `email_enabled`; there is no per-request override, custom schedule, channel
  order, fallback, condition, or rule.
- **D45-AC013:** Plan read/publish requires current same-Tenant
  `system_messages.plan.manage` and trusted actor context; D44 coordinator/
  route/grant-management/task authority does not substitute.
- **D45-AC014:** Enabling requires Live contract/publication and Phase 17 Ready
  connection/domain/webhook/tracking/sender/reply evidence; absent readiness
  blocks On with a typed repair action.
- **D45-AC015:** The fresh impact reports the effective plan choice, exact
  transport/readiness result, **Personal settings may narrow delivery**, and
  **0 existing requests will be emailed**. It shows no selected/eligible/
  preference-disabled/unavailable recipient count, address, or person/request
  matrix from which a one-to-three-person cohort's private state could be inferred.
- **D45-AC016:** Stale policy, D44, authorization, contact, publication,
  connection, sender/reply, or impact head—or any incomplete/indeterminate
  required readiness—writes no plan revision.
- **D45-AC017:** A successful expected-head plan save appends one immutable
  future-effective revision, audit, semantic receipt, and safe impact digest;
  an identical save is a no-op/replay.
- **D45-AC018:** Personal preference uses the closed
  `preference.access_request_responsibility_email@1` key and its identity is
  exact Tenant, Active Tenant Assignment, Party, registered staff role/surface,
  D45 contract family, and email channel; it stores no address, D44
  responsibility generation, or authority snapshot.
- **D45-AC019:** Preference is exactly `inherit | disabled`; absence is
  `inherit`, `disabled` narrows Tenant On, and no value can broaden Tenant Off.
- **D45-AC020:** Self-only expected-version preference mutation derives actor/
  scope server-side, creates no historical email, and cannot be performed by a
  route manager, peer, support, AI, import, worker, or provider.

### Tenant and recipient UX

- **D45-AC021:** Canonical Tenant editing lives at **System Messages → Messages
  → Access review requested → Delivery** under **Access request coordinator
  email**, not inside the D44 picker or a new top-level page.
- **D45-AC022:** People & access may display one read-only Off/On/Needs email
  setup summary and typed Manage link only to an independently authorized
  viewer; it stores no duplicate state.
- **D45-AC023:** The settings card renders only required in-product and optional
  email delivery rows. Tasks Hub appears only in helper copy—**Email settings
  never change Tasks Hub work or Access requests**—because it is work, not a
  channel. The card never calls email required, primary, or confirmation that a
  human was notified.
- **D45-AC024:** The editor exposes only Off/On, exact readiness, aggregate
  impact, future-only/no-backfill consequence, and Review and save; no address,
  secret, From/Reply-To, test send, custom content, reminder, or recipient picker.
- **D45-AC025:** **Immediate** is explained as sent after durable release with
  no promised time; changing Off/On says messages already being sent may still arrive.
- **D45-AC026:** Under **Settings → Notifications → Access request
  responsibility**, the
  recipient sees read-only **Effective email** plus one stable labelled choice:
  **Follow my organization's setting** (`inherit`) or **Off for me**
  (`disabled`), and the copy says task/in-product remain either way.
- **D45-AC027:** Tenant On plus `inherit` yields Effective email On;
  `disabled` yields Off; Tenant Off yields Effective email Off without changing
  the stored choice. No switch changes apparent value merely because the plan changes.
- **D45-AC028:** Personal preference uses a local draft with **Cancel** and
  **Save changes** (disabled while unchanged or pending), never autosave;
  success/error is persistent and programmatically announced, and a lost
  response reconciles expected version before retry.
- **D45-AC029:** Plan managers see transport/readiness and **Personal settings
  may narrow delivery**, never cohort counts, which person opted out, their
  email address, contact history, failure reason, or provider evidence unless
  separately authorized by another exact purpose.
- **D45-AC030:** Every label, count, loading/zero/no-access/stale/indeterminate/
  error/success/readiness state is plain-language, localized, non-color-only,
  and consistent across Access requests, System messages, and My settings.

### Recipient, contact, Tenant, RLS, and privileged boundaries

- **D45-AC031:** Every email candidate starts from an exact current D44 admitted
  recipient generation; D45 never enumerates people, roles, tasks, groups, or
  addresses to add recipients.
- **D45-AC032:** The D43 requester exclusion already present in D44 remains;
  requester, original grantor, Owner/Admin, auditor, manager, group alias, and
  all-grant-manager fallback never receive D45 solely from those facts.
- **D45-AC033:** The exact D44 Active Tenant Assignment maps through trusted
  current same-Tenant Party/role/surface identity; absent/ambiguous/multi-hat/
  cross-Tenant mapping produces no email and no existence leak.
- **D45-AC034:** The registered `staff_operations` recipient adapter resolves
  exactly one current purpose-valid verified same-Tenant email contact revision.
- **D45-AC035:** Missing, ambiguous, unverified, stale, hidden, incompatible,
  suppressed, or wrong-purpose contact produces no email child and cannot fall
  back to profile/login/alternate/group/provider/caller address.
- **D45-AC036:** The caller supplies no authoritative Tenant, actor, recipient,
  Party, contact, address, preference owner, contract, plan, step, sender,
  reply, content, locale, timestamp, status, or provider ID.
- **D45-AC037:** All D45/Phase 17/6 relations carry exact scope/environment and
  composite same-Tenant/same-scope foreign keys; poison IDs from another Tenant
  reject even when each individual ID exists.
- **D45-AC038:** Browser roles have no base-table writes; authorized commands
  enforce application checks plus `ENABLE`/`FORCE RLS`, grants, `USING`, and
  `WITH CHECK` so an allowed update cannot retarget scope/recipient/contact/plan.
- **D45-AC039:** Hardened functions pin `search_path`, schema-qualify objects,
  derive attribution, validate expected heads, and expose execute only to the
  intended server boundary.
- **D45-AC040:** Owner, service-role, `BYPASSRLS`, worker, support, import,
  repair, and Inngest paths enforce identical scope/recipient/contact/content/
  preference restrictions and uniform non-enumerating failures.

### Eligibility, complete plan compilation, and product identity

- **D45-AC041:** Eligibility evaluates in the exact order contract → Tenant
  plan → recipient preference → current D43/D44/auth/privacy → contact/
  suppression → connection/sender/reply/publication/channel readiness.
- **D45-AC042:** Every later layer only narrows; no preference, address,
  connection, provider event, task, or notification can add a D44 recipient or
  enable a Tenant-disabled step.
- **D45-AC043:** Complete eligible proof creates one optional email child with
  the exact recipient/contact/contract/plan/step/source identities.
- **D45-AC044:** Complete proved-ineligible email records one safe typed omission
  result and creates no email child, while required in-product still releases.
- **D45-AC045:** Optional email timeout/error/unknown becomes an indeterminate
  email omission/repair signal, never Tenant On, fallback, or a reason to omit
  required in-product/task/source truth.
- **D45-AC046:** The compiler inserts/locks one permanent parent, canonically
  orders independent children, verifies count/digest/every immutable hash, and
  writes released last; committed unreleased is alerted and unclaimable.
- **D45-AC047:** A new request yields at most one email child per exact
  Tenant/request occurrence/D44 recipient generation/D45 step version.
- **D45-AC048:** A responsibility update yields at most one grouped email child
  per Tenant/recipient/responsibility-application generation/D45 step and never
  one per sealed child request.
- **D45-AC049:** Identical parent/member replay returns the prior released
  outcome, including valid zero-email membership, without duplicate event/send.
- **D45-AC050:** Reusing an occupied parent/member identity with changed plan,
  recipient, contact, content, sender, source, ordering, count, relation, or
  immutable input hard-conflicts; legitimate successors use new source-owned identity.

### Content, destination, sender, headers, and email safety

- **D45-AC051:** Per-request subject is **Access review needs attention**,
  preheader is **Sign in to see current status and available actions.**,
  stale-safe body is **An access review
  was assigned to you. Sign in to see current status and available actions.
  This email does not grant permission and does not mean access has changed.**,
  and the only primary action is **Review access request**.
- **D45-AC052:** Grouped subject is **Access review responsibilities updated**,
  preheader is **Sign in to see current status and available actions.**,
  body is **You were assigned {count} existing access requests. Sign in to see
  current status and available actions. This email does not grant permission or
  change anyone's access.** using exactly
  the immutable initial safe count, the count never appears in subject/
  preheader, and the action is **View access requests**.
- **D45-AC053:** Per-request render facts are empty; grouped render facts contain
  only the required immutable initial count. Tenant branding and typed action/
  preference destinations come only from governed From/layout/action
  dependencies, never mutable subject/body facts.
- **D45-AC054:** Subject/preheader/body/plain text/HTML/alt text/URL/provider
  metadata contain no holder/requester name/email, capability, group, source,
  reason, explanation, outcome, provenance, authority, peer, due date, raw ID,
  or provider detail.
- **D45-AC055:** Email contains no inline Keep/Remove/Approve/Deny, one-click
  product decision, form, attachment, calendar event, reply command, mention,
  arbitrary URL, or capability-bearing token.
- **D45-AC056:** Action and preference links resolve from closed server-owned
  destination codes at the canonical HTTPS origin; Tenant content, request
  headers, Host/forwarded host, `return_to`, variables, and provider cannot choose them.
- **D45-AC057:** Email-client preview, link scanner, prefetch, `GET`, `HEAD`,
  forwarded link, or opening changes no D43/D44/task/item/preference/session/
  access state and never performs a consequential command.
- **D45-AC058:** Destination requires authentication, active Tenant, current
  D44/source-lane authorization, current D43 source, and D42 field purpose; it
  safely shows terminal/no-longer-authorized without leaking prior detail.
- **D45-AC059:** Rendering uses the Phase 17 Service message layout, exact
  Tenant Brand Kit, locale/publication/fallback rules, fixed fact/action wall,
  semantic HTML, and equivalent plain text; D45 has no raw local content fields.
- **D45-AC060:** Open/click tracking, pixels, remote tracking resources, hidden
  action meaning, scripts, caller headers, and arbitrary From/Reply-To reject;
  provider open/click drift is telemetry only and never engagement truth.

### Delivery readiness, execution, provider evidence, and failure

- **D45-AC061:** Preparation resolves only the exact matching Tenant Ready
  Resend connection, proved domain/profile, `staff_operations` sender, and
  `staff_operations_help` reply posture; no shared/platform/other-Tenant fallback exists.
- **D45-AC062:** Access requests settings never read/display/write Resend key,
  webhook secret, From/Reply-To address, domain proof, or raw provider evidence;
  typed links route authorized owners to existing Phase 17 repair.
- **D45-AC063:** Eligible email becomes claimable only after complete plan
  release and is neither synchronous with source commit nor assigned an
  unproved latency/delivery/awareness SLA.
- **D45-AC064:** Before dispatch Phase 6 re-proves source fence, D44 generation,
  current recipient authorization, current disabled preference, contact/
  suppression, connection/sender/reply/publication readiness, and exact prepared identity.
- **D45-AC065:** Source terminality or D44 responsibility/assignment/
  authorization loss before dispatch suppresses the unstarted email without
  altering source/task/item or creating a replacement.
- **D45-AC066:** Recipient `disabled` before dispatch suppresses the unstarted
  email; later `inherit` affects future occurrences only and cannot resurrect it.
- **D45-AC067:** Contact change/invalidation/suppression before dispatch stops
  the old contact intent; D45 never reroutes the same occurrence to a new address.
- **D45-AC068:** Connection/domain/sender/reply protection or unavailability
  before dispatch stops/pauses exactly that email under Phase 17 evidence; no
  fallback sender/account/provider or direct API path is used.
- **D45-AC069:** Once provider submission is accepted, no plan/preference/source
  edit claims recall; a late email remains safely worded and its destination
  re-proves current state.
- **D45-AC070:** `submitted`, mail-server `delivered`, delayed, bounced,
  complained, failed, suppressed, and indeterminate are truthful independent
  provider axes and never mean inbox placement, opened, read, understood, or acted.

### Concurrency, provider idempotency, webhook ordering, and engagement separation

- **D45-AC071:** Provider idempotency key derives from the frozen exact provider
  envelope and cannot be task ID, item ID, request ID alone, recipient email,
  preference ID, or Inngest run ID.
- **D45-AC072:** Resend's documented 24-hour idempotency window is defense in
  depth only; product permanent slot/claim/send log remains authoritative before
  and after the window.
- **D45-AC073:** Network timeout or possible acceptance records **Delivery
  outcome unknown**, retains one frozen identity, reconciles provider/product
  evidence, and never blind-sends a replacement.
- **D45-AC074:** Signed webhook processing verifies exact Tenant connection/
  secret/account/message identity, deduplicates event IDs, and reduces duplicate/
  out-of-order/conflicting events monotonically without cross-Tenant scanning.
- **D45-AC075:** Reading/archiving the in-product item does not cancel, create,
  deliver, or mark the email; email delivery/open/click does not read/archive the item.
- **D45-AC076:** Opening/completing/reassigning the task does not create or mark
  email; email evidence does not alter task engagement/completion.
- **D45-AC077:** Plan enable racing a new source occurrence pins exactly the old
  disabled or new enabled plan head by trusted cutover; no split/duplicate child set.
- **D45-AC078:** Tenant Off before provider submission suppresses/unclaims the
  existing not-yet-submitted `staff_email` child under the same identity;
  provider-submitted mail is non-retractable and the UI truthfully warns it may
  arrive. Widening remains source-occurrence-future-only.
- **D45-AC079:** Preference/contact/source/recipient changes racing claim/
  dispatch are linearized before `dispatching`; changes after dispatch treat
  mail as in flight and never claim prevention or recall.
- **D45-AC080:** Tenant enable, recipient re-enable, connection repair, sender
  repair, contact restoration, migration, or reconciliation creates no email
  for an already-created item/request; only a new source-owned occurrence can.

### Privacy, minimization, retention, audit, and export

- **D45-AC081:** Recipient email and rendered HTML/text exist only in encrypted
  prepared-delivery material bound with exact scope/preparation/contact/policy
  associated data and never in a general table or browser response.
- **D45-AC082:** Optional staff prepared bytes use
  `prepared.optional_staff_7d@1`, shortened by source/recipient/privacy/
  erasure/safety stops; expiry cannot be extended by retry, provider delay, or settings.
- **D45-AC083:** Durable plan/intents/events/send logs/history retain body-free,
  address-free, low-cardinality identities/outcomes and no personalized subject.
- **D45-AC084:** Workflow events, logs, traces, errors, metrics, analytics, BI,
  search, caches, task/item rows, exports, documents, AI prompts/embeddings, and
  support records contain no address, body, request detail, raw provider
  payload, IP, user agent, or tracking link.
- **D45-AC085:** Provider raw events are minimized/quarantined under Phase 6/17
  exact retention and never exposed as ordinary Tenant history or recipient evidence.
- **D45-AC086:** D45 uses the manifest's Off-only Recent sent-copy policy and
  exposes no rendered Recent copy. Any future reveal requires a separately
  versioned contract/decision and still cannot become request/task/item/source
  truth or ordinary export.
- **D45-AC087:** Coordinator preference is private self state; plan managers see
  only contract/transport readiness plus **Personal settings may narrow
  delivery**, never selected/eligible/preference/contact cohort counts; they
  cannot identify/override opt-outs, and no peer sees another's preference or
  delivery engagement.
- **D45-AC088:** Business audit records trusted plan/preference actor, head,
  safe diff/digest, time, result, and correlation separately from delivery
  telemetry and never records secret/body/address.
- **D45-AC089:** Retention, legal hold, residency, anonymization, Party merge/
  relink, assignment end, Tenant transfer, backup expiry, and cryptographic
  erasure preserve body/address minimization and do not retarget preference/history.
- **D45-AC090:** Email addresses, content, provider event detail, preferences,
  open/click, and recipient delivery history are absent from ordinary data,
  task, access-governance, AI, analytics, and portability exports.

### Future-channel extensibility without a generic engine

- **D45-AC091:** Executable channels come only from a closed generated
  contract/Delivery Step/channel registry; Tenant input cannot create an
  arbitrary channel string, provider, webhook, audience, event, or rule.
- **D45-AC092:** D45 activates only email; push, SMS, Slack, Teams, Google Chat,
  WhatsApp, Discord, arbitrary webhook, and unknown channel requests reject
  before configuration/intent/provider records exist.
- **D45-AC093:** No placeholder channel preference, destination, credential,
  readiness, template, plan, provider, callback, or UI row is created for a
  future channel.
- **D45-AC094:** Every future channel must separately prove exact recipient-
  destination identity, Tenant/provider connection and least-privilege scopes,
  consent/narrowing preference, readiness/suppression, content/action safety,
  idempotency/callback/outcome, rate/abuse, retention/privacy, accessible UX,
  migration/rollback, monitoring, support, and kill switch.
- **D45-AC095:** A future adapter consumes the exact D44 recipient generation
  and may only narrow; it cannot add a person, infer a channel identity from
  email, reuse a group alias, or reinterpret D43/D44 source meaning. The new
  channel normally extends the same stable message key through a reviewed
  contract generation plus named step/profile/adapter; it mints no new source
  occurrence or stable key unless business meaning changes.
- **D45-AC096:** Channel preferences are separately keyed/versioned and one
  channel's opt-out/read/delivery/connection state never changes another
  channel, task, in-product engagement, request, or recipient generation.
- **D45-AC097:** Each channel has an independent permanent child identity,
  prepared payload, claim, outcome/reconciliation, retention, observability,
  and kill switch under the shared complete plan occurrence.
- **D45-AC098:** Tasks Hub is never modeled as a communication channel or
  Delivery Step, and Notification Center `in_product` remains local-only with no
  provider submission or email outcome.
- **D45-AC099:** Future channel failures cannot cause email fallback/cross-send,
  email failure cannot invoke another channel, and no priority/fallback chain
  exists without a separately governed fixed plan option.
- **D45-AC100:** Reminders, digests, escalation, schedules, recurrence, quiet
  hours, and due dates are separate occurrence/timing decisions; D45's initial
  email step cannot be repurposed or replayed as one.

### Accessibility, localization, performance, operations, and recovery

- **D45-AC101:** Tenant and recipient settings reuse shared Base Maia/Base UI
  primitives, semantic tokens, existing plan/preference components, and no
  app-local UI kit, Radix fork, hard-coded palette, or decorative motion system.
- **D45-AC102:** Keyboard-only and screen-reader users can understand readiness,
  change Off/On or personal preference, review impact, save/cancel, recover
  stale state, and return focus with visible unobscured focus and 44px targets.
- **D45-AC103:** Settings reflow at 320 CSS pixels/400% zoom without two-
  dimensional scroll or clipped controls and support forced colors, text
  spacing, contrast, reduced motion, magnification, mobile safe areas, and
  virtual keyboards.
- **D45-AC104:** HTML email has semantic reading order, headings/paragraphs,
  descriptive action text, non-color-only meaning, useful/empty alt treatment,
  sufficient contrast, scalable text, and equivalent complete plain text.
- **D45-AC105:** Tenant/recipient locale resolution, long names, Unicode/CJK/
  combining marks/RTL/bidi isolation, localized counts, fallback disclosure,
  and missing translation follow Phase 17 complete-publication rules without
  mixing variants.
- **D45-AC106:** Blocking remote images/CSS/tracking still leaves Tenant
  identity, meaning, action, preference explanation, and safe current-state path
  usable in major supported mail clients/mobile webviews.
- **D45-AC107:** Plan impact and recipient eligibility are set-based/bounded;
  source transaction writes one identifier-only intent and never loops over
  Resend calls or waits for rendering/provider response.
- **D45-AC108:** Preparation/content/address sizes, recipient count, provider
  batches, claims, rate/concurrency, retention, and queries use Phase 6/17
  explicit bounds and production-shaped budgets, not vague “scalable” claims.
- **D45-AC109:** Authorized UI distinguishes Off, Ready, Needs setup/action,
  Paused, Provider unavailable, Outcome indeterminate, suppressed, submitted,
  mail-server delivered, bounced, complained, and failed without recipient
  disclosure or awareness claims.
- **D45-AC110:** Deterministic product replay/reconciliation and runbooks repair
  plan/intents/provider evidence; normal operation never requires direct DB
  edits, copying addresses, force-send, resetting preference, or replaying D43.

### Migration, rollout, rollback, testability, and traceability

- **D45-AC111:** Migration initializes every Tenant as `email_disabled`, infers
  no recipient preference/plan from contribution settings, role/profile/task/
  notification/email rows, and sends no historical/backfill email.
- **D45-AC112:** Rollout order is contracts/bindings/fact wall/publication,
  schema/constraints/RLS/deny, recipient/contact/readiness, plan/preference UX,
  shadow complete compiler, provider adapter/evidence, default-off canary, then
  deliberate Tenant enablement.
- **D45-AC113:** Shadow mode creates no provider intent/send/item engagement and
  compares expected eligible/omitted/indeterminate counts/content hashes without
  addresses or protected source detail.
- **D45-AC114:** A Tenant can enable D45 only after explicit impact and Ready
  proof; pilot/canary evidence confirms zero duplicate/backfill/cross-Tenant/
  protected-content email before expansion.
- **D45-AC115:** Email-only kill switch stops new D45 compilation/dispatch while
  preserving D43/D44/task/in-product, plan/preference/history, in-flight
  provider reconciliation, and future roll-forward.
- **D45-AC116:** Rollback never deletes audit/evidence, marks in-product/task
  read, changes preference/source, resends indeterminate mail, recalls accepted
  mail, or enables a fallback; re-enable processes only current product-owned work.
- **D45-AC117:** Inngest/workflow envelopes contain identifiers/schema/scope/
  dispatch references only; body/address/preference/source facts/secrets reject,
  and provider/run dedupe cannot replace product claims.
- **D45-AC118:** Positive, negative, boundary, cross-Tenant/RLS/privileged,
  source/recipient/contact/preference race, complete-set/crash, provider timeout/
  webhook disorder, migration/rollback, accessibility/localization/mail-client,
  privacy-egress, and production-shaped load tests prove user/domain outcomes.
- **D45-AC119:** D45-R1–R30 and D45-AC001–AC120 trace through glossary, ADRs,
  Phase 6/12/17, OpenSpec, design, tasks, GitHub tickets, implementation, tests,
  provider evidence, and release artifacts with no contradictory keys, defaults,
  states, facts, channels, or owners.
- **D45-AC120:** Release evidence includes every named monitor below and proves
  the product remains correct/operable with email disabled, recipient opted out,
  contact missing, Resend unavailable/replaced, webhook delayed, and Inngest off.

## Named monitors

Thresholds are initial release/pilot bounds to calibrate, not universal claims.
Provider-account thresholds are release-pinned and reverified from official
provider documentation at build and release; the current Resend bounds used
here are 4% bounce and 0.08% spam/complaint. Connection-wide reputation is
authoritative for protection because sibling messages share it; D45-specific
rates remain diagnostic and always include numerator/denominator.
No monitor may add a recipient/channel, override preference, force-send, retry
blindly, infer awareness, create reminders, or change a request/task/item/grant.

| Signal                                                          | Threshold                                                                                                                                                                                      | Owner                                           | Required response                                                                                                                                                                                              |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_request_email_cross_tenant_edge_total`                  | Any plan/preference/recipient/contact/intent/connection/provider edge crosses scope                                                                                                            | Security + Communications                       | Disable D45 compilation/dispatch for affected scope, preserve evidence, assess disclosure, repair composite constraints/mapping, and re-prove before enable.                                                   |
| `access_request_email_non_d44_recipient_total`                  | Any email candidate not in the exact current D44 generation                                                                                                                                    | Security + IAM + Communications                 | Stop D45, suppress unstarted intent, inspect accepted mail/exposure, repair generated resolver, and reconcile without changing D44.                                                                            |
| `access_request_email_requester_recipient_total`                | Any D43 requester receives their own coordinator email                                                                                                                                         | IAM + Communications                            | Suppress/remove future candidate, inspect D44/D45 identity mapping, assess disclosure, and preserve source-lane authority unchanged.                                                                           |
| `access_request_email_tenant_off_send_total`                    | Any child/send created while the pinned Tenant plan is disabled/unknown                                                                                                                        | Communications + Data Integrity                 | Stop dispatch, inspect plan cutover/identity, repair compiler, and ensure no retrospective replay.                                                                                                             |
| `access_request_email_preference_override_total`                | Any send created/dispatched despite current exact recipient `disabled` before dispatch                                                                                                         | Privacy + Communications                        | Stop unstarted mail, inspect accepted messages, repair current preference fence, and preserve personal choice.                                                                                                 |
| `access_request_email_address_fallback_total`                   | Any profile/login/alternate/group/caller/provider address used instead of exact registered contact revision                                                                                    | Security + Identity + Communications            | Disable adapter, inspect recipients, purge derived address copies where lawful, repair contact resolver, and re-prove isolation.                                                                               |
| `access_request_email_shared_sender_fallback_total`             | Any Asym/platform/other-Tenant/provider fallback account, sender, or Reply-To used                                                                                                             | Security + Email Platform                       | Stop dispatch, rotate/contain if needed, inspect spoof/cross-scope exposure, and restore exact Tenant connection only.                                                                                         |
| `access_request_email_not_ready_release_total`                  | Any email child released without complete Live contract/publication/connection/sender/reply/tracking readiness                                                                                 | Email Platform + Communications                 | Pause D45 for Tenant, suppress unstarted intents, repair readiness gate, and show truthful Needs setup/action.                                                                                                 |
| `access_request_email_optional_failure_blocked_required_total`  | Any email zero/unknown/failure prevents D44 task or required in-product item                                                                                                                   | Access Product + Communications                 | Restore required projection immediately, disable coupling, repair complete-plan omission semantics, and reconcile source occurrence.                                                                           |
| `access_request_email_retroactive_total`                        | Any email caused solely by plan enable, preference re-enable, contact/connection/sender repair, migration, or historical scan                                                                  | Communications + Privacy                        | Stop projector, suppress queued retroactive mail, inspect sends, repair future-only fence, and never mark old items emailed.                                                                                   |
| `access_request_email_backlog_child_fanout_total`               | More than one grouped email per recipient/responsibility-application generation or any per-child email from backlog adoption                                                                   | Communications + Access Product                 | Pause grouped adapter, suppress excess unstarted mail, inspect accepted duplicates, repair occurrence identity/complete set.                                                                                   |
| `access_request_email_duplicate_product_intent_total`           | More than one current product email child/event/send log for one permanent recipient/channel slot                                                                                              | Data Integrity + Communications                 | Fence dispatch, select no provider-log winner, reconcile exact slot/claims, repair uniqueness, and preserve audit.                                                                                             |
| `access_request_email_changed_payload_replay_total`             | Any occupied identity accepts changed plan/recipient/contact/content/sender/relation input                                                                                                     | Security + Data Integrity                       | Stop compiler, quarantine conflict, inspect prior sends, repair immutable hash comparison, and require a source-owned successor.                                                                               |
| `access_request_email_provider_dedupe_as_truth_total`           | Any product retry safety depends only on Resend's 24-hour key/window                                                                                                                           | Email Platform + Data Integrity                 | Stop retries, restore product slot/claim/send-log authority, reconcile provider outcome, and add beyond-24h tests.                                                                                             |
| `access_request_email_blind_resend_total`                       | Any replacement send while prior provider acceptance is possible/indeterminate                                                                                                                 | Email Platform + Security                       | Halt dispatch, preserve frozen evidence, reconcile provider/product, investigate duplicates, and require incident review before resumption.                                                                    |
| `access_request_email_source_or_recipient_stale_dispatch_total` | Any dispatch after source terminality or current D44 responsibility/authorization loss proved before linearization                                                                             | IAM + Communications                            | Stop claim path, inspect delivered disclosure, repair pre-dispatch fence ordering, and reconcile personal projections.                                                                                         |
| `access_request_email_protected_content_egress_total`           | Any forbidden D43/D40/grant/person/capability/provenance fact in subject/body/URL/metadata/log/export/AI                                                                                       | Privacy + Security                              | Disable publication/adapter, suppress unstarted mail, assess accepted-message incident, remove derived copies where lawful, and repair fact wall.                                                              |
| `access_request_email_action_in_message_total`                  | Any inline Keep/Remove/Approve/Deny/form/action token or arbitrary destination                                                                                                                 | Security + Access Product                       | Retire/block publication generation, stop dispatch, inspect scans/actions, repair fixed destination/fact wall, and re-prove inert-open tests.                                                                  |
| `access_request_email_tracking_enabled_total`                   | Any open/click pixel/link rewriting or provider tracking enabled for the contract                                                                                                              | Privacy + Email Platform                        | Pause sending, disable tracking/domain drift, assess collected data, purge where lawful, and revalidate Ready.                                                                                                 |
| `access_request_email_address_or_body_durable_egress_total`     | Any address/rendered body/personalized subject enters durable history, event, workflow, log, search, analytics, export, backup beyond governed encrypted preparation/recent copy               | Privacy + Data Platform                         | Disable writer/consumer, quarantine/purge copies under policy, assess exposure, and repair closed storage allowlist.                                                                                           |
| `access_request_email_delivery_as_engagement_total`             | Any provider state changes in-product read/archive, task engagement/completion, D43 outcome, or human-awareness claim                                                                          | Access Product + Notifications + Communications | Stop consumer, restore independent state from owners, correct misleading UI/audit, and add negative projection tests.                                                                                          |
| `access_request_email_webhook_scope_or_order_error_total`       | Any unsigned/wrong-connection/cross-Tenant event accepted or monotonic outcome regressed                                                                                                       | Security + Email Platform                       | Reject/quarantine event, pause affected reduction, rotate/repair webhook if needed, reconcile signed provider evidence, and inspect scope.                                                                     |
| `access_request_email_ready_outbox_oldest_age`                  | Greater than 10 minutes for 15 consecutive minutes                                                                                                                                             | Platform SRE + Communications                   | Inspect dispatch ledger/claims/executor/provider, enable product replay/reconcile, retain required in-product, and avoid source replay.                                                                        |
| `access_request_email_dispatch_failure_rate`                    | Greater than 2% over 15 minutes with at least 100 eligible intents                                                                                                                             | Platform SRE + Email Platform                   | Pause Tenant expansion/affected adapter, inspect readiness/provider/schema, preserve source attention, and reconcile after repair.                                                                             |
| `access_request_email_indeterminate_oldest_age`                 | Any provider-indeterminate attempt older than 30 minutes, or any beyond prepared-material deadline                                                                                             | Email Platform + SRE                            | Investigate provider evidence/reconciliation, keep no-resend fence, purge bytes at deadline, and surface safe operator status.                                                                                 |
| `tenant_email_connection_bounce_rate`                           | At or above the release-pinned provider-account threshold (currently 4%), or any provider restriction, whichever occurs first; D45 diagnostic rate is also recorded with numerator/denominator | Tenant Email Owner + Email Platform             | Pause affected optional email, inspect connection-wide contact/domain/list quality and D45 contribution, honor suppression, repair without changing preferences/source, and re-prove provider readiness.       |
| `tenant_email_connection_spam_rate`                             | At or above the release-pinned provider-account threshold (currently 0.08%), any provider restriction, or any D45 complaint at low volume, whichever occurs first                              | Tenant Email Owner + Privacy + Email Platform   | Pause affected D45 sending/contact, preserve complaint evidence, inspect content/recipient authorization and sibling-message reputation, honor suppression, and re-prove provider readiness before resumption. |
| `access_request_email_plan_enable_without_zero_backfill_total`  | Any enable impact does not prove exactly 0 existing requests emailed                                                                                                                           | Communications + Access Product                 | Block save, refresh complete impact, repair future-only compiler, and do not provide an override.                                                                                                              |
| `access_request_email_future_channel_materialized_total`        | Any unapproved push/SMS/Slack/Teams/Google Chat/webhook placeholder, config, intent, or provider call                                                                                          | Architecture + Security                         | Remove/disable dormant execution/config, preserve evidence, and require a separate ADR/OpenSpec/proof package before reconsideration.                                                                          |
| `access_request_email_settings_comprehension_rate`              | Below 90% correct in moderated testing for additive email, default, preference, future-only effect, readiness, and delivery-not-awareness                                                      | UX Research + Communications                    | Keep Tenant enablement Reserved, revise IA/copy/states, and retest representative ministries/mobile/assistive-tech users.                                                                                      |
| `access_request_email_duplicate_attention_confusion_rate`       | Above 10% of at least 30 pilot interviews report believing task/item/email are different requests or that email proves awareness                                                               | UX Research + Access Product                    | Improve correlation/copy and preference explanation without merging state or removing required in-product; retest.                                                                                             |
| `access_request_email_accessibility_failure_total`              | Any settings or supported email-client fixture fails names/focus/keyboard/target/reflow/contrast/text alternative/reading order/plain-text equivalence                                         | Accessibility + UI/Email Platform               | Block D45 release, repair shared UI/publication/layout, and rerun manual plus automated proof.                                                                                                                 |
| `access_request_email_individual_scoring_total`                 | Any coordinator open/click/read/speed/delivery/rank/workload/performance metric exposed or exported                                                                                            | Privacy + Product Governance                    | Disable/report removal, purge derived data where lawful, audit use, and restore aggregate product-health-only telemetry.                                                                                       |

## Migration, rollout, rollback, and repair

### Rollout order

1. Reconcile D45 into glossary, ADR-0026/0027/0029, Phase 6/12/17, the
   outbound-communications OpenSpec delta, and D44 before implementation.
2. Register both exact contract variants and the one optional email step,
   generated binding, safe fact wall, typed destinations, sender/reply purposes,
   retention class, and default-disabled Delivery Plan.
3. Add/verify plan/preference/intent same-scope constraints, forced RLS, browser
   revocation, hardened commands, product uniqueness/claims, and every deny
   boundary before an executable writer.
4. Publish and accessibility-test inherited system email variants, plain text,
   localization/fallback, tracking-disabled headers, and inert authenticated links.
5. Implement exact D44→Party/role/surface→verified contact narrowing and
   connection/sender/reply readiness with zero profile/address fallback.
6. Ship the canonical System messages settings, contextual read-only link, and
   self preference; keep every Tenant disabled and provider dispatch off.
7. Shadow complete plan compilation and compare parent/child counts/digests,
   eligible/omitted/indeterminate outcomes, and content hashes with no address,
   prepared bytes, provider intent, or send.
8. Enable Phase 6 preparation/dispatch/webhook/reconciliation for internal
   synthetic fixtures, then a small deliberate Tenant canary after Ready proof.
9. Expand only after named safety, duplication, privacy, deliverability,
   comprehension, accessibility, and no-backfill monitors stay within bounds.
10. Keep every later channel and D46 reminder behavior non-executable until its
    own decision/proof; run broad deferred repository verification at Grill end.

### Migration rules

- Every Tenant starts `email_disabled`; no current contribution setting,
  approver preference, role, profile, task, notification, email address,
  connection, or provider history infers D45 On.
- No existing D43/D44 request/item/task is emailed at migration or enablement.
- Current contribution notification/email tables remain source-domain migration
  inputs until their own Phase 17 adaptation; D45 never dual-writes them.
- The legacy `notification_queue` is not revived. Unknown contract/plan/channel
  versions create no email.

### Rollback and kill switches

- A D45-specific kill switch stops new email-plan child release/claim/dispatch
  without disabling task, in-product, source lane, D43/D44, plan/preference
  history, or provider reconciliation for already in-flight mail.
- Rollback never deletes audit/evidence, marks task/item read, changes recipient
  preference, rewinds plan/source heads, recalls accepted email, blind-resends
  indeterminate work, or uses another account/provider/channel.
- Prepared bytes still purge on their original deadline. Provider events for
  accepted mail continue reducing safely after new dispatch is stopped.
- Roll forward from immutable product plan/intent/send/provider heads and
  claims; never reconstruct eligibility from provider logs or email addresses.

### Repair

- Recompute plan eligibility only for a new source-owned occurrence; repair does
  not backfill already-created items.
- Reconcile one existing intent/send identity from product/provider evidence;
  no changed-address/content/sender replacement under the same occurrence.
- Repair connection/sender/reply/contact/preference through their owning
  surfaces, not D45 direct edits or support impersonation.
- If delivery and source disagree, source remains authoritative and email
  history stays delivery evidence only; safe product links show current state.

## Ruthless synthesis

### Resolved before D45 is recorded

1. Default-off applies at the Tenant plan; recipient `inherit` follows a
   deliberate Tenant enable and `disabled` is a durable self opt-out.
2. Plan management and personal preference are separate capabilities/surfaces;
   D44 coordinator management cannot silently control email.
3. Activation is future-only and backlog adoption produces one grouped email,
   preventing surprise floods.
4. D45 reuses the complete Phase 17/6 plan/intent/history seam and rejects the
   current profile/direct-email implementation as authority.
5. Minimal safe content and an inert authenticated link make forwarding/scanning
   non-authorizing and avoid protected source leakage.
6. Product idempotency survives Resend's 24-hour window and ambiguous outcomes.
7. Required task/in-product attention remains correct through every email
   zero/unknown/failure.
8. Extensibility is a closed fixed-step registry plus channel-specific proof,
   not a generic channel/rule engine.
9. D46 is narrowed to reminder posture; digest and escalation remain later
   decisions, and D45 is initial email only.

### Requirements to carry into specification and design

- Exact keys/step/default/preference enum/evaluation order/fact wall/content/
  destinations/sender/reply/retention and product/provider identity.
- Future-only plan/preference semantics, grouped fanout, current pre-dispatch
  fences, accepted-email non-retractability, and independent outcome axes.
- Same-scope schema/RLS/privileged-path constraints, complete plan compiler,
  encrypted preparation, body-free history, tracking-disabled proof, and future-
  channel admission boundary.
- The 30 requirements, 120 ACs, named monitors, rollout, rollback, repair, and
  production-shaped proof matrix.

### Implementation safeguards

1. Required in-product and source truth ship/prove before optional email.
2. Compile the complete bounded parent/children; never call Resend from producer
   or settings code.
3. Derive every recipient/contact/content/sender field server-side from pinned owners.
4. Fail optional unknown closed without blocking required attention.
5. Linearize product dispatch, reconcile indeterminate provider outcomes, and
   prohibit blind resend/contact reroute.
6. Keep addresses/bodies encrypted/short-lived and all secondary systems body-free.
7. Keep later channels/reminders structurally rejected until separately governed.

### Risks permitted only under named monitoring

- Whether optional email improves response: pending-age/time-to-detail and
  enablement signals; Access Product + UX Research; improve/delete email, never
  make it authoritative.
- Whether recipients perceive duplication: duplicate-attention confusion;
  UX/Access/Communications; improve correlation/copy/preferences without
  merging engagement.
- Whether contact/provider health is acceptable: bounce/complaint/failure/
  indeterminate signals; Tenant Email Owner + Email Platform; pause/repair exact
  channel without widening/fallback.
- Whether future channels are needed: only user research/support evidence;
  Product Architecture; initiate a new versioned decision, never dormant code.

## Exact final D45 decision to record

> D45 adds one optional fixed `staff_email` Delivery
> Step to both D44 Phase 17 occurrences. Every Tenant defaults Off. A current
> `system_messages.plan.manage` actor may enable it only after complete Ready/
> impact proof. Each exact recipient has a self-owned
> `preference.access_request_responsibility_email@1` preference with
> `inherit | disabled`: inherit follows Tenant On, disabled suppresses email, and neither
> can change required task/in-product attention or D44 authority.
>
> Each candidate starts from the exact current D44 recipient generation and one
> verified purpose-valid same-Tenant staff email contact revision. Contract,
> Tenant, preference, current source/auth/privacy, contact/suppression, and
> connection/content/sender/reply readiness all narrow eligibility; zero or
> unknown email never blocks required attention and never falls back.
>
> Settings and preference changes are future-only. A new request can create one
> safe email per recipient generation; a responsibility update can create one
> grouped email per recipient/application generation, never one per backlog
> child. Email uses minimal Tenant/kind/count facts, a typed authenticated People
> & access link, no protected detail or decision action, Tenant-owned Resend,
> tracking disabled, encrypted bounded preparation, and body/address-free
> history.
>
> Phase 6 product identities/claims/reconciliation own replay. Provider delivery
> is not read/awareness/action, accepted email is non-retractable, and possible
> acceptance never permits blind resend. Email, in-product, task, request, and
> grant remain independent.
>
> Future push, Slack, Teams, Google Chat, SMS, or other channels may reuse only
> the fixed Delivery Step contract shape after separate channel-specific proof;
> a channel normally extends the same stable D44 message meaning through a
> reviewed contract generation plus named channel step/profile/adapter and does
> not mint a new source occurrence or stable key unless business meaning changes.
> D45 creates no generic rule/channel engine or placeholder integration. D46
> separately decides reminders; digests and escalation remain later decisions.

## D46 — Should a still-pending access review receive an automatic reminder?

Hope Mission enables D45 email. Ana receives the initial task, required in-app
item, and—because she has not turned that personal email off—one email on
Monday. The request is still pending the next Monday. D43 currently has no due
date, SLA, expiry, urgency transition, or evidence-backed expectation for how
quickly a ministry must decide. D46 decides whether Core should create a second
source-owned timed occurrence anyway.

A reminder can help a coordinator who missed the initial attention, but an
arbitrary timer can nag volunteers, imply a deadline that does not exist, create
duplicate channel noise, and become an accidental workflow/escalation engine.
All options keep the source lane, Tasks Hub, required in-product item, and D45
initial-email policy unchanged. A reminder, if adopted, would be a distinct
source occurrence with fresh recipient/source proof—not a resend or a timer
inside Phase 17.

### Option 1 — no automatic reminder in v1 — recommended

Create no timed reminder until the governing access-request source defines a
real due date, expiry, risk transition, or validated ministry cadence. Pending
work remains continuously visible in **Access requests**, Tasks Hub, and the
source-actionable Notification Center item; staff may follow up deliberately.

**UX/impact:** no invented urgency, duplicate unread items, arbitrary calendar
math, or reminder configuration. The cost is that a coordinator who overlooks
all durable surfaces receives no second nudge.

### Option 2 — one fixed product-wide reminder after seven calendar days

For every still-current request, create one reminder occurrence seven calendar
days after initial admission. It re-proves the exact source and recipient and
never repeats or escalates automatically.

**UX/impact:** predictable and simple, but seven days is an unsupported product
number, ignores weekends/time zones/ministry rhythms, and visually implies a
service expectation Core has not established.

### Option 3 — one Tenant-selected reminder from bounded choices

Let an authorized Tenant select Off, 3 days, 7 days, or 14 days in the exact
contract-bounded plan. At most one reminder occurs while the source remains
pending; changing the choice is future-only.

**UX/impact:** adapts to different ministries, but adds configuration, temporal
semantics, impact review, scheduling/repair states, and choice complexity before
Core has evidence that any cadence is useful.

### Recommendation and exact question

**My recommendation is Option 1 — no automatic reminder in v1.** Current
official access-governance and CMS examples tie reminders to a real review
duration, expiry, or due date. D43 has none. The durable lane/task/in-product
item plus optional initial email provide recovery without inventing urgency;
Core can add a reminder when a source-owned temporal fact makes it truthful.

Which D46 policy should Core record: **Option 1 — no automatic reminder in v1
until a source-owned temporal requirement exists**, **Option 2 — one fixed
seven-day reminder**, or **Option 3 — one Tenant-selected reminder from Off,
3, 7, or 14 days**? You may amend any option.
