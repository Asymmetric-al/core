# Phase 23 D26 Resend and email-routing primary-source research

**Status:** Supporting research for the founder-ratified Phase 23 D26
B-prime-R. This document does not independently expand the exact authority or
authorize implementation, schema work, dependency adoption, issue publication,
deployment, or production change.

**Date:** 2026-08-23

## Executive conclusion

The proposed B-prime direction is sound only with one amendment: a public form
must never treat email as submission truth or use Payload/Resend configuration
as a second workflow engine.

The durable design is:

1. Payload may author the **released presentation definition**: purpose,
   bounded fields, labels, help text, confirmation presentation, safe Page
   relationship, and Page placement.
2. One Asym server command resolves the exact D1-released form from the public
   host, path, Site, locale, and release generation. The browser cannot supply
   Tenant, destination, template, sender, or recipient authority.
3. That command atomically records one replay-safe **Form Intake Occurrence**
   and the complete bounded set of independently recoverable destination
   intents before any destination can run. The coordination record is not a
   second Support Hub conversation, application, subscription, Party, or
   communication history.
4. Each substantive destination is invoked through a typed command owned by
   that domain: Support Hub owns an inquiry conversation; Phase 34/37 owns an
   application or engagement; Phase 32 owns newsletter subscription intent.
   Email is an independently observable delivery projection, not a substitute
   for any of those records.
5. External email goes through the accepted Phase 17/6 message contract and
   communication seam. The form producer supplies typed, purpose-qualified
   facts and an occurrence identity; it never supplies a template id, HTML,
   subject, From, Reply-To, Resend key, arbitrary recipient list, or provider
   headers.
6. A tenant can select a named notification destination containing one verified
   shared mailbox or a bounded set of verified recipients. Multiple people get
   independent recipient intents; Asym does not expose their addresses in one
   `To`/`Cc` list or collapse their outcomes into one send.
7. Email Studio remains the authoring surface. A form chooses the bounded
   message purpose in plain language; the Phase 17 binding surface selects and
   activates the exact Email Studio publication. At submission, Phase 17/6
   resolves and pins the current immutable publication, sender profile,
   recipient-authority version, and prepared bytes.
8. Resend is transport only. The current Core adapter already sends Asym-rendered
   HTML/text and requires an idempotency key. Resend-hosted Templates should not
   become production authority because a provider template id/alias points at
   whichever version is currently published in Resend.

This design supports the requested combinations without dual authority:

- Support Hub only;
- email only, for explicitly qualified low-sensitivity purposes;
- Support Hub plus staff email notification;
- future Mobilize application intake plus one or more staff email notifications;
- a submitter acknowledgment in addition to any qualified primary destination.

The phrase **email only** does not mean fire-and-forget. Asym still durably
retains the minimal intake occurrence and delivery outcome under the purpose's
retention policy so a provider outage cannot silently lose the response.

## Research scope and method

This review inspected the current Phase 23 worktree at commit
`8c53dc40a92306c3a2cbd71da030d71b1f9a1411` and compared:

- Core's Email Studio CRUD, immutable-version intent, test-send path, Resend
  adapter, sender settings, consent gate, and webhook reducer;
- current Support Hub inbound-email routing and its Supabase adapter;
- the current Mobilize UI and data source;
- Payload configuration and installed dependencies;
- the accepted Phase 6, Phase 17, Phase 26, Phase 32, Phase 34, and Phase 37
  ownership boundaries;
- current official Payload Form Builder documentation; and
- current official Resend sending, Templates, idempotency, batches, limits,
  webhooks, and receiving documentation.

No runtime code, migration, package, test, decision log, ADR, or configuration
was changed for this research.

## Current Core evidence

### No production public-form ingress exists

`apps/admin/payload.config.ts` currently registers CMS Users, Tenants, Pages,
Page Templates, missionary/project Pages, Navigation, Missionary Profiles,
Ministry Updates, and Media. It registers neither a Forms collection nor a
Form Submissions collection. Neither `package.json` nor `bun.lock` includes
`@payloadcms/plugin-form-builder`.

A repository search across `apps`, `packages`, and `supabase` found no generic
public form definition, public form submission table, or `SubmitPublicForm`
command. The only event-screen comment named "Form Builder" is unrelated to
public website forms.

This is useful: D26 can define one clean ingress contract instead of preserving
an accidental second authority.

### Payload Form Builder is a possible editor primitive, not the authority

Payload's current [Form Builder documentation](https://payloadcms.com/docs/plugins/form-builder)
says the plugin can dynamically define forms, store all submissions in its own
database collection, send personalized emails to multiple recipients, redirect
after submission, accept upload fields, and even invoke a payment handler. It
also lets a project replace or extend the generated Forms and Form Submissions
collections.

Those are capabilities, not safe defaults for Asym. D26 must structurally
disable or bypass the plugin's:

- Form Submissions business authority;
- direct email generation and sending;
- payment field and payment handler;
- unrestricted upload field;
- arbitrary redirect target;
- recipient values derived from submitted fields; and
- hooks that write directly to Support Hub, Mobilize, CRM, consent, or workflow
  tables.

If the plugin is adopted after qualification, use its field/admin composition
as an adapter to the D26 provider-neutral Form Definition contract. The public
frontend and submission endpoint remain Asym-owned.

### Email Studio is provider-neutral today, but not yet production publication authority

`docs/guides/features/email-studio.md` correctly describes Email Studio as a
provider-neutral React Email authoring system backed by
`email_templates` and `email_template_versions`; Resend remains delivery.
`packages/api/src/email/template-store.ts` provides:

- `listEmailTemplates(tenantId)` and `readEmailTemplate(tenantId, templateId)`;
- `createEmailTemplate(...)`, `updateEmailTemplate(...)`, and
  `restoreEmailTemplateVersion(...)`;
- `createTemplateVersion(...)`; and
- the narrow historical
  `syncContributionCorrectionTemplateBinding(...)` adapter.

The current store is not safe as a D26 production binding authority:

- `email_templates.is_active` means the row is listed, not that one stable
  product message is Live and safe.
- `updateEmailTemplate(...)` reads the current integer version, updates the
  mutable head, then inserts a version row in separate calls. It has no
  expected-version compare-and-set and no encompassing transaction. Two
  concurrent writers can both compute version N+1; one can update the head
  after the other while its version insert conflicts, leaving head bytes and
  the stored N+1 version out of agreement.
- Create/update/restore then synchronize the correction binding in another
  separate operation. A failure can leave head, version, and binding partially
  advanced.
- The API treats version rows as immutable, but the migration does not enforce
  database-level update immutability.
- `email_template_system_bindings` is correction-specific migration history,
  not a general contract registry or activation generation.

The accepted Phase 17 PRD names the permanent fix. Its current-direction
contract says existing template/version/binding/`is_active` rows do not prove
stable meaning, recipient authority, complete facts, immutable publication,
safe locale behavior, sender readiness, or recovery. It requires a code-owned
message catalog, immutable publications, generated activation bindings, and
one Phase 6 communication seam. It explicitly states that the producer never
supplies template id, HTML, subject, locale fallback, From, Reply-To, Resend
key, provider headers, recipient query, or resolver-owned recipient facts.

Therefore D26 should create the exact public-form producer meanings needed by
its qualified purposes, but it should not create another template binding or
send service.

### Current test-send is useful QA, not the product send path

`packages/api/src/email/template-test-send.ts` proves several useful seams:

- `sendTemplateTestEmail(...)` renders allowed merge tags through
  `renderTemplateForRecipient(...)`;
- it resolves the tenant Resend connection and sender settings;
- it evaluates consent/suppression through `evaluateEmailConsent(...)`;
- it calls the shared `sendEmail(...)` adapter with inline HTML/text; and
- it records template/version references when possible.

It is deliberately unsuitable for public-form notifications:

- it validates the provider connection synchronously for each test;
- its idempotency key contains a random UUID because every test is a new test;
- it accepts one caller-entered test recipient;
- it performs the provider send before inserting `email_send_logs`; and
- it explicitly tolerates "sent but audit log unavailable."

A form response needs the inverse boundary: persist the exact occurrence and
all destination intents first, then let Phase 6 prepare and cross the provider
boundary with permanent application idempotency and truthful unknown-outcome
handling.

### The Resend adapter supports the recommended transport shape

`packages/email/resend.ts` defines `SendEmailOptions` with one or more
recipients, verified sender/reply fields, subject, HTML/text, tags, and a
required idempotency key. `sendEmail(...)`:

- validates nonempty idempotency and the provider's 256-character bound;
- validates recipient count;
- sends Asym-provided HTML/text rather than a provider template id;
- uses the Resend SDK idempotency option; and
- normalizes retryable provider failures.

That is the correct low-level adapter direction. D26 should not add a direct
`template` option or call it from a public request. Phase 17/6 should hand it
the exact prepared message.

The adapter's array recipient support must also not be mistaken for product
fan-out. One call with several addresses exposes the addresses to one another
and yields one request-level result. A notification group needs one independent
communication intent per person, or one intentional shared-mailbox alias as a
single recipient. A provider batch may later optimize transport underneath
those independent intents.

### Current consent is donor-oriented and cannot classify staff routing by itself

`packages/api/src/email/consent.ts` exposes fail-closed
`evaluateEmailConsent(...)`. It correctly distinguishes marketing from
transactional messages and applies `do_not_contact`, hard bounce, spam, manual
suppression, `do_not_email`, and unsubscribe according to that classification.

D26 must not let a form editor set the coarse `messageType`. The code-owned
purpose/message contract decides whether a submitter acknowledgment is a
transactional response to the requested interaction, whether newsletter
interest requires Phase 32 consent/double-opt-in, and which suppressions apply.

Internal staff notification recipients are a different recipient-authority
class from donors. They need an exact tenant-owned notification destination,
verified address or account relationship, capability, active membership, and
safe content class. Donor lookup should not be used to authorize an internal
staff notification merely because the address happens to match a donor row.

### Support Hub's current ingress is specifically an inbound-email adapter

`packages/api/src/admin/support-hub/inbound-router.ts` exposes
`inboundEmailEnvelopeSchema` and `routeInboundToSupportHub(...)`. It accepts a
verified Resend inbound-email identity, resolves a Support Hub inbox from the
email recipients, and calls
`routeInboundEmailToSupabaseSupportHub(...)` in
`packages/api/src/admin/support-hub/adapter/supabase.ts`.

That adapter requires Resend email ids and email headers, performs email
threading, creates or finds a conversation, and inserts an inbound email
message. `packages/api/src/workflows/adapters/inbound-email.ts` retrieves the
body from Resend, recovers a prior message by `inbound_email_id`, and bridges
the provider row to the Support Hub row.

A website form is not an inbound email. D26 must not fabricate a Resend id,
sender header, subject thread, or recipient address to reuse this adapter. That
would couple form semantics to one provider and could merge an unrelated form
response into an email thread by sender/subject fallback.

The permanent seam is a new Phase 26-owned typed command such as
`CreateSupportConversationFromProductIntake`. It should accept:

- exact Tenant/Site/public-form intake scope from a trusted server caller;
- a code-owned intake purpose;
- a selected Support Hub inbox binding that is legal for that purpose;
- normalized submitter/contact presentation;
- sanitized structured message parts;
- the immutable source occurrence id; and
- no provider email identity or raw routing headers.

Its database uniqueness must make `(tenant, source kind, source occurrence)`
one conversation/message outcome under concurrency. The current
`support_messages(tenant_id, inbound_email_id)` index is non-unique, and the
email workflow's recovery lookup is not sufficient as the D26 concurrency
contract.

### Mobilize exists visually, but not as a production application command

`apps/admin/app/(app)/mobilize/page-client.tsx` reads
`useMobilizeCandidates()`. The corresponding
`packages/database/collections/admin-workspace.ts` collection returns a cloned
`MOBILIZE_CANDIDATES_SEED` array. `MobilizeAddCandidateSheet` renders inputs and
a **Create Profile** button but has no submit handler or mutation.

The roadmap places application definitions/runs in Phase 34 and mobilization
opportunities/applications in Phase 37. D26 may reserve a typed
`mobilize.application_intake` destination and show it only when a qualified
Phase 34/37 adapter reports Ready. It must not write to the seed collection,
invent an application table, or call the visual sheet.

Once the domain adapter exists, the application is the authoritative outcome.
Optional email notifications are projections of the same intake occurrence;
their failure never rolls back, duplicates, or changes the application.

### Existing webhook handling is not yet the final monotonic outcome spine

`packages/api/src/email/webhooks/resend.ts` verifies signatures, tenant-scopes
outbound events through send logs, persists `email_events`, deduplicates on a
derived provider-event id, creates suppressions, updates send logs, and uses a
durable workflow handoff for received mail. These are useful primitives.

The current reducer has gaps that D26 must not depend on directly:

- `email.failed` has no send-log status mapping.
- `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.opened`, and
  `email.clicked` all write `sent`; bounced/complained/suppressed write
  `bounced`. Because Resend does not guarantee delivery order, a late `sent`
  event can overwrite a prior bounce.
- deduplication persists an event id extracted from payload data or a synthetic
  content digest, not the documented `svix-id` delivery identifier.
- the single mutable `email_send_logs.status` cannot express provider accepted,
  delivered, delayed, failed, bounced, complained, suppressed, and
  indeterminate as independently evidenced facts.

The Phase 6/17 monotonic event/evidence reducer is the required D26 dependency
for production outbound form messages. The current webhook route remains an
adapter to migrate, not a new D26-owned reducer.

## Current official Resend findings

### Sending and provider Templates

The current [Send Email API](https://resend.com/docs/api-reference/emails/send-email)
accepts either inline `html`/`text`/`react` or a published provider `template`
id/alias plus variables; these content modes are mutually exclusive. Payload
`from`, `subject`, and `reply_to` can override provider-template defaults. The
same reference allows at most 50 addresses on one email and documents an
optional `Idempotency-Key` of at most 256 characters that expires after 24
hours.

Resend's [Templates introduction](https://resend.com/docs/dashboard/templates/introduction)
documents a maximum of 20 variables. Templates begin as drafts and must be
published before sending. Changes to a published Template are saved as a new
draft; publishing again changes what future sends using that Template receive.
The [Version History guide](https://resend.com/docs/dashboard/templates/version-history)
confirms that the currently published version keeps serving until the next
publish and that a revert creates a new draft.

**Consequence:** a Resend template id/alias is a mutable provider pointer, not
an exact Asym Email Studio publication identity. Binding a released public form
directly to it would introduce dual authoring, dual publishing, hidden provider
drift, a 20-variable ceiling, and a provider-console change outside D1/Phase 17
audit. Core should continue rendering the exact Asym publication and send the
sealed HTML/text through the existing inline adapter.

### Idempotency is a transport aid, not permanent product deduplication

Resend's current [Idempotency Keys guide](https://resend.com/docs/dashboard/emails/idempotency-keys)
says idempotency is optional, supported by `POST /emails` and
`POST /emails/batch`, and retained for 24 hours. An identical retry within that
window returns the same response without sending again.

**Consequence:** the provider key must be derived from one exact frozen
provider envelope, but Asym needs a permanent occurrence/member slot and
request digest. A browser retry, delayed worker, repair after 24 hours, or
ambiguous provider timeout cannot rely on Resend's cache. An accepted or
indeterminate send must never get a replacement key simply because 24 hours
elapsed.

### Batches are an optimization under independent intents

Resend's [Batch Sending guide](https://resend.com/docs/dashboard/emails/batch-sending)
allows up to 100 emails in one request. Each email is processed independently,
but the request is rejected if any member is invalid; attachments are not
supported.

**Consequence:** D26 should always create independent recipient intents first.
Phase 6 may batch a validated, same-scope set only as a transport optimization
with an exact member map and safe fallback. A batch must not define the
notification group, hide a missing member, share one outcome, or make one bad
address erase the product meaning of the others.

### Webhooks are signed, at-least-once, and unordered

Resend's [webhook guide](https://resend.com/docs/webhooks/introduction) says
delivery is at least once, rare duplicates are possible, `svix-id` should be
stored for deduplication, and event order is not guaranteed. It recommends the
payload `created_at` for ordering when order matters. Successful and failed
events may be replayed manually.

The [retry guide](https://resend.com/docs/webhooks/retries-and-replays)
documents immediate, 5-second, 5-minute, 30-minute, 2-hour, 5-hour, 10-hour,
and additional 10-hour attempts. The current
[event catalog](https://resend.com/docs/webhooks/event-types) distinguishes
`email.sent` (API success/attempt to deliver), `email.delivered` (recipient
server accepted), delayed, failed, bounced, complained, and suppressed.

**Consequence:** store signed append-only evidence, deduplicate deliveries,
reduce monotonically, and keep provider acceptance separate from delivery.
The visitor's success page may say **We received your response** after Asym's
durable intake commit; it must not say the staff email was delivered.

### Limits require queueing and operational visibility

Resend's current [Usage Limits guide](https://resend.com/docs/api-reference/rate-limit)
documents API rate-limit, daily/monthly email-quota, and marketing-contact-quota
headers. Its default API limit is 10 requests per second per team across that
team's API keys; rate and quota failures return 429-class outcomes.

**Consequence:** a form request must not synchronously fan out N provider calls.
Phase 6 owns bounded claims, tenant fairness, backoff, quota/readiness states,
and repair. D26 operations should show a route-specific **Email notification
needs attention** state without blocking successful Support Hub or Mobilize
outcomes.

### Receiving email is not a substitute for form ingress

Resend's [Receiving Email guide](https://resend.com/docs/dashboard/receiving/introduction)
says the webhook contains metadata only; body, headers, and attachments are
retrieved from the receiving APIs. Resend stores received emails even while a
webhook endpoint is down and retries/replays the notification.

That validates Core's current provider-fetch workflow. It does not justify
converting public forms to synthetic inbound email. The form already starts in
Asym and should enter through the typed Asym command without an unnecessary
provider round trip.

## Recommended provider-neutral D26 contract

### 1. Code-owned purpose catalog

One small code-owned `PublicFormPurposeCatalog` should define, per purpose and
version:

- stable purpose key and human label;
- owning domain;
- allowed field semantics, field kinds, cardinality, validation, and maximums;
- allowed custom-question envelope, if any;
- sensitivity/classification and fields forbidden from email;
- retention and deletion owner;
- consent requirements;
- allowed primary destination plans;
- optional secondary notification/acknowledgment roles;
- Party-match posture;
- abuse limits;
- attachment posture; and
- typed message/fact-adapter bindings.

Launch-purpose examples and boundaries:

| Purpose                       | Qualified primary outcome                        | Optional email                                    | Explicit boundary                                                      |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------------------- |
| Contact / general inquiry     | Support Hub, or qualified email-only intake      | Staff notice; submitter acknowledgment            | No automatic Party creation                                            |
| Prayer request                | Purpose-qualified Support Hub/private team route | Minimal staff alert; acknowledgment if safe       | No confidential-care claim; sensitive body stays out of ordinary email |
| Simple resource request       | Support Hub or qualified email-only intake       | Staff notice; acknowledgment                      | No file entitlement or fulfillment truth                               |
| Newsletter interest           | Phase 32 subscription intent when available      | Double-opt-in/acknowledgment owned by Phase 32/17 | Checkbox is not subscription proof                                     |
| Missionary/application intake | Phase 34/37 command when Ready                   | Staff notification; applicant acknowledgment      | Not a generic Phase 23 form submission                                 |

Donations, donor-account changes, expense submissions, confidential member
care, payments, event registration, unrestricted uploads, and arbitrary
workflow forms remain with their accepted owners.

Tenants may customize within the selected purpose:

- enable/disable catalog fields where policy allows;
- change labels, help text, option labels, field order, and optionality within
  semantic constraints;
- add a small bounded set of non-sensitive additional questions where the
  purpose permits them;
- choose one permitted destination plan;
- select a named inbox or named notification destination;
- enable the permitted submitter acknowledgment;
- choose confirmation copy or a safe same-Site confirmation Page; and
- choose Page placement and presentation variant.

They may not invent a new purpose, sensitivity, owner, database command,
recipient resolver, template merge field, sender, dynamic email destination,
webhook URL, payment action, or external redirect inside Web Studio.

### 2. Exact released definition and operational bindings

Separate two types of change deliberately:

- **Release-bound topology:** purpose, field schema, primary destination kinds,
  optional notification roles, confirmation behavior, and Page placement are
  part of the exact D1-released Form Definition revision.
- **Operational owner configuration:** current Support Hub assignment, active
  recipient-group membership, Phase 17 publication, sender/reply profile,
  suppression, and destination health remain versioned with their owning
  products. They are freshly resolved and pinned for each intake occurrence.

This prevents an offboarded staff member from continuing to receive form
content until a Site republish, while preventing a content editor from silently
changing an application into a Support Hub inquiry without a D1 release.

### 3. Public request contract

The public request should contain only:

- an opaque released-form token or path-local anti-confusion token;
- one client request token used for browser replay;
- answers keyed by stable released field ids;
- locale and ordinary browser form mechanics; and
- abuse-control evidence.

The server derives Tenant, environment, Site, locale lineage, canonical Page,
active D1 generation, exact Form Definition revision, purpose, route plan,
recipient roles, message meanings, and retention. Caller-supplied versions of
those fields are ignored or rejected.

The request command must:

1. resolve and authorize the exact public released definition;
2. apply body/field/cardinality limits and server validation;
3. apply honeypot, rate, duplicate, and risk-adaptive bot controls;
4. canonicalize answers and compute a versioned request digest;
5. lock a permanent Tenant/Site/form/client-token occurrence slot;
6. return the prior receipt only when the digest is identical, and hard-conflict
   on token reuse with different answers;
7. atomically persist the minimized/encrypted intake payload, exact source and
   policy versions, and the complete destination-intent set;
8. write `released_at` last so no child can run from a partial set; and
9. return success only after the durable intake commit.

The client token is not the provider key. Each destination and communication
member receives a separately derived permanent semantic slot.

### 4. Destination intent and outcome contract

The minimum durable data shape is one occurrence plus bounded destination
children, not a generic workflow engine:

```text
FormIntakeOccurrence
  exact scope + released form/purpose/route versions
  permanent client-token slot + immutable request digest
  minimized protected payload reference + retention deadline
  expected destination count/digest + released_at

FormDestinationIntent
  same-scope parent + gap-free ordinal
  typed owner/destination kind + exact binding version
  pending | accepted | completed | skipped | needs_attention | indeterminate
  opaque owner result reference + body-free failure/repair code
```

Each adapter is idempotent on the source occurrence and returns an opaque,
same-scope result reference. Destination workers reload current authority and
the exact stored source version before invoking it. They never inspect another
Tenant by bare record id.

Overall status is derived:

- **Received** — the occurrence and all intended destinations are durable;
- **Routing** — at least one destination is still working;
- **Completed** — every required destination has an accepted terminal outcome;
- **Needs attention** — one required route has a definite repair condition;
- **Outcome unknown** — an external boundary may have accepted work and must be
  reconciled, never blindly repeated.

External email delivery states stay in Phase 6; D26 stores only the linked
destination result. Support Hub/application states stay with those domains.

### 5. Destination adapters

#### Support Hub

The form route selects a same-Tenant named inbox binding permitted by the
purpose. The Phase 26 command creates one conversation/message from the exact
intake occurrence and returns their ids. Assignment rules and agent/team
membership remain current Support Hub truth.

#### Staff email notification

The form route selects one same-Tenant **Notification Destination**:

- **Shared mailbox** — one verified monitored address, one recipient intent;
- **Notification group** — a bounded set of active, verified recipient
  authorities, one independent intent per person.

Do not place multiple personal addresses in `To` or `Cc`. Group membership is
versioned and audited. Staff-account addresses can derive verification from
the active account/contact authority; non-account addresses require explicit
mailbox verification and are visibly marked external. High-sensitivity purpose
profiles may forbid external destinations entirely.

The email is informational. It links to the authenticated authoritative record
when one exists and includes only contract-approved safe summary facts. Raw
form fields are not automatically merge tags, provider metadata, tags, or log
attributes.

For an email-only qualified purpose, the notification may include the bounded
safe response fields because no Support Hub/application record exists. The
intake occurrence remains recoverable until the required email outcome and
purpose retention rules permit disposal.

#### Submitter acknowledgment

This is a separate recipient role and message contract. The recipient is the
validated answer to the one semantic email field; no arbitrary field can be
selected as a recipient. The message confirms receipt without promising staff
review, acceptance, application approval, prayer confidentiality, fulfillment,
or delivery time. It uses a monitored Reply-To only when the contract and
Support Hub route permit replies.

#### Mobilize/application

This destination is absent or labelled **Not available yet** until Phase 34/37
provides a production, tenant-safe, idempotent command. When available, that
command owns applicant identity review, workflow/application record, stage,
files, references, consent, and retention. D26 supplies only the exact
purpose-qualified intake projection and source occurrence.

An application may also generate independent staff notifications. An email
failure never changes the accepted application. A successful email never
proves an application exists.

#### Future domains

New destinations enter only through code-reviewed catalog entries and typed
owner commands. No arbitrary URL, SQL table, Payload hook, Zapier-like action,
or tenant-authored script is accepted in D26. Phase 31 may later expose governed
connectors without changing this contract.

### 6. Email Studio and Phase 17/6 handoff

For each email-capable purpose, D26 should define exact producer events and
recipient roles before minting stable Phase 17 keys. At minimum, distinguish:

- internal response notification; and
- submitter receipt acknowledgment.

A single generic "email this form" contract is unsafe because contact,
newsletter, prayer, resource, and application fields have different facts,
sensitivity, consent, retention, and promises.

The staff experience may show an **Email message** selector inside form setup,
but its write is a Phase 17 binding operation, not a template id stored in the
public form or submitted by the producer. The control should list only
compatible published Email Studio messages for the exact contract and show:

- message name and audience;
- Published / Draft / Needs setup;
- active publication time;
- sender and Reply-To profile;
- required fact coverage; and
- **Preview message** / **Manage in Email Studio** actions.

The producer event then calls
`compileAndReleaseCommunicationPlanOccurrence(...)` once with the complete
bounded recipient set. Phase 6 privately creates independent recipient intents
all-before-any, re-proves recipient and suppression, pins the publication and
sender, prepares exact bytes, calls `sendEmail(...)`, and owns delivery history
and provider evidence.

## Recommended staff UX

### Form setup

Use one calm, linear setup workspace rather than exposing routing internals:

1. **Purpose** — "What is this form for?" Each option explains what record or
   team owns the response and which sensitive uses are excluded.
2. **Questions** — purpose-provided starter fields with inline validation,
   stable labels, reorder controls, and a bounded **Add question** menu.
3. **Where responses go** — destination cards showing an outcome sentence:
   - **Support Hub · General inquiries** — "Creates a new conversation for the
     General inquiries team."
   - **Mobilize · Applications** — "Creates an applicant in Mobilize."
   - **Email only · Website questions** — "Sends each response to this verified
     mailbox. No Support Hub conversation is created."
4. **Also notify** — optional named notification destination with an exact
   recipient count and privacy-safe summary. The primary domain remains clear.
5. **Reply to the visitor** — optional compatible Email Studio acknowledgment,
   never mixed with newsletter consent.
6. **After submission** — inline confirmation or a same-Site Page selected by
   relationship; no arbitrary URL field.
7. **Review** — one plain-language route summary and readiness checklist before
   D1 release.

Do not present a graph builder for this bounded fan-out. Purpose-specific cards
and one optional notification layer cover the requested cases with far less
misconfiguration risk.

### Readiness and change UX

Every dependency shows one of three states:

- **Ready** — destination and message can accept new responses;
- **Needs setup** — the form may be saved but cannot be released;
- **Unavailable** — the owning product/feature is not installed or qualified.

The review sentence should be concrete, for example:

> Each response creates a Mobilize applicant. Asym also sends separate staff
> notifications to 3 verified members of Recruiting notifications and sends a
> receipt acknowledgment to the applicant. If an email is delayed, the
> application remains safely recorded.

Changing destination topology creates a new Form Definition revision and needs
D1 release. Changing who is in a selected notification group, Support Hub team
assignment, or the active Email Studio publication uses that owner's versioned
settings and applies to future submissions without republishing the Site. The
form detail shows both facts so there is no hidden behavior.

### Testing

- Public Preview is side-effect-dark under D25: no intake, Support Hub record,
  application, email, analytics conversion, or workflow is created.
- **Test routing** uses synthetic, visibly non-production values and validates
  dependencies without creating business records or sending external mail.
- **Send test to me** is an explicit Email Studio/Phase 17 test operation to the
  authorized actor, not a simulated public submission.
- After release, a private staff-only test submission may be supported only if
  every created outcome is marked test and excluded from ordinary work. It is
  not needed for launch if route validation and Email Studio test-send provide
  sufficient proof.

### Response and operations UX

The visitor sees a stable success state only after durable acceptance:

> Thanks — we received your response.

They get an explicit safe retry state if the intake commit did not occur. A
lost browser response can replay the same client token and receive the same
receipt.

Staff see aggregate health on the Form detail:

- responses received;
- routing/current backlog;
- oldest pending age;
- destinations needing attention;
- recent exact route change; and
- one cause-owned action such as **Reconnect email**, **Choose an active
  notification destination**, or **Open failed routes**.

Healthy forms remain quiet. Raw answers, email addresses, prayer text,
application facts, recipient names, and provider payloads never become metrics
labels or ordinary logs.

## Adversarial findings specific to routing and Resend

| Concern                      | What could go wrong / why it matters                                                                        | Severity | Likelihood without fix | Permanent prevention                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| Dual template authority      | A Resend Template is republished outside Asym, so the same released form sends unreviewed content.          | High     | Medium                 | Asym immutable publication; inline sealed bytes; Resend transport only.                                    |
| Payload send bypass          | Plugin hooks send email or store submissions before Asym domain/consent/idempotency gates.                  | Critical | High if enabled        | Disable plugin email/payment/submission authority; one server ingress and Phase 17/6 send seam.            |
| Partial fan-out              | Support record is created, then process crashes before email/application intent is recorded, or vice versa. | High     | High                   | One transaction records parent plus complete destination set and releases children last.                   |
| Duplicate submission         | Browser retry or worker replay creates duplicate conversations/applications/emails.                         | High     | High                   | Permanent client-token slot, immutable digest comparison, and per-destination semantic uniqueness.         |
| Template head/version race   | Concurrent Email Studio updates leave mutable head and version row inconsistent.                            | High     | Medium                 | Transactional expected-version CAS and separate immutable Phase 17 publication/activation authority.       |
| Multi-recipient privacy leak | Personal addresses are visible in `To`/`Cc`; one result hides per-person failures.                          | High     | Medium                 | Named verified destination; one recipient intent/message per person, or one deliberate shared alias.       |
| Support Hub adapter misuse   | Synthetic email headers merge a form into the wrong thread and couple ingress to Resend.                    | High     | Medium                 | New typed product-intake command with source-occurrence uniqueness; no provider headers.                   |
| Mobilize false integration   | A form appears to create applicants but writes only to a seed/demo UI or an invented side table.            | Critical | High                   | Keep destination unavailable until Phase 34/37 production command is qualified.                            |
| Consent misclassification    | Editor labels a marketing enrollment as transactional or a staff notice as donor mail.                      | High     | Medium                 | Purpose-owned message/recipient policy; no editor-controlled `messageType`.                                |
| Webhook reorder/regression   | A late `sent` event overwrites a bounce or `email.failed` remains invisible.                                | High     | High                   | Append signed evidence and a versioned monotonic Phase 6 reducer; preserve distinct facts.                 |
| Provider idempotency expiry  | Repair after 24 hours sends a duplicate or changes the key after unknown acceptance.                        | Critical | Medium                 | Permanent Asym identity; frozen envelope key; accepted/indeterminate never replaced.                       |
| Email-only loss              | Provider outage loses the sole operational copy of a response.                                              | Critical | Medium                 | Durable protected intake occurrence, queued delivery, bounded retention, visible repair.                   |
| Raw-field template expansion | Sensitive answers enter email, logs, provider tags, or an unauthorized recipient.                           | Critical | Medium                 | Contract-approved typed facts; safe summaries/links; field-level email exclusion; no dynamic merge fields. |
| Destination typo/offboarding | A typo or departed worker receives private responses indefinitely.                                          | High     | Medium                 | Verified/versioned notification destinations, active membership reproof, audit, immediate revocation.      |
| Spam/denial of service       | Bots create conversations, applications, email cost, and staff noise.                                       | High     | High                   | Server limits, honeypot, duplicate controls, progressive challenge, bounded fan-out, abuse quarantine.     |
| Overengineering              | A generic workflow canvas, arbitrary webhooks, and branching language duplicate Phase 34.                   | High     | Medium                 | Small purpose catalog, finite destination-plan catalog, typed adapters, one optional notify layer.         |

## Required implementation and test proof

Before any D26 form is Live, tests must prove:

1. wrong host, Tenant, environment, Site, locale, Page, generation, form,
   purpose, route, field, or release token fails without enumeration;
2. anonymous clients cannot insert directly into Payload/Supabase submission,
   Support Hub, application, communication, or email tables;
3. database grants, RLS/service boundaries, same-scope composite foreign keys,
   and worker reloads prevent cross-Tenant ids from succeeding;
4. identical client-token replay returns the same receipt, changed-payload reuse
   conflicts, and concurrency creates one occurrence and one complete child set;
5. crash before/after parent, each child, release, claim, owner command,
   communication compilation, provider crossing, response persistence, and
   browser response never loses or duplicates an outcome;
6. Support Hub creates exactly one source-linked conversation/message and never
   uses email subject/header fallback for form intake;
7. Mobilize is impossible until its feature/adapter is Ready; once qualified,
   application acceptance and email notification outcomes remain independent;
8. one and many recipient groups resolve only current verified members, send
   independent messages, hide addresses from one another, and preserve exact
   group/version evidence;
9. draft/unpublished/incompatible Email Studio content, sender drift,
   disconnected Resend, missing Reply-To, missing required facts, and unsafe
   locale fail closed without arbitrary fallback;
10. provider idempotency fixtures cover same-key replay, payload conflict,
    concurrent request, expiry, rate/quota response, timeout, malformed success,
    accepted, definitely rejected, and indeterminate outcomes;
11. webhook fixtures cover signature failure, duplicate `svix-id`, manual replay,
    every adopted event type, out-of-order sent/delivered/delayed/failed/bounce/
    complaint/suppression, and monotonic reduction;
12. email-only intake remains recoverable across provider outage and is purged
    only after its exact purpose/outcome/retention rule permits it;
13. Support Hub or application success remains intact when every optional email
    fails; email success never fabricates the domain record;
14. arbitrary addresses, dynamic recipient answers, arbitrary URLs, payment,
    uploads, scripts, SQL, provider template ids, headers, From, and Reply-To are
    rejected from form definitions and submissions;
15. preview, bots, prefetchers, link scanners, double clicks, slow/offline
    networks, suspended mobile tabs, and browser back/refresh create no
    unintended side effects;
16. screen-reader, keyboard, touch, 320-CSS-pixel, 400-percent zoom,
    forced-colors, RTL/CJK/long-label, error-summary, focus, and status-
    announcement tests cover both public form completion and staff setup;
17. rate, queue, oldest-pending, partial destination failure, unknown provider
    outcome, webhook lag, and destination/configuration drift are observable
    without response content in logs or metrics; and
18. N/N-1 deployments and rollback preserve exact stored occurrences,
    destination adapters, publication versions, and provider evidence without
    enabling the Payload/plugin direct path.

## Recommended delivery order

1. Ratify the D26 purpose/owner/destination catalog and the release-bound versus
   operational-binding split.
2. Define the provider-neutral Form Definition, Form Intake Occurrence,
   destination-intent, idempotency, retention, and public-command contracts.
3. Qualify Payload Form Builder only as a bounded authoring adapter, or build the
   smaller native field editor if removing its conflicting behaviors is more
   complex than the value it adds.
4. Add the Phase 26 product-intake command and email-only durable route; do not
   reuse inbound-email routing.
5. Add exact Phase 17 public-form message contracts, recipient authorities,
   activation bindings, and the Phase 6 handoff; close the current
   template/publication and webhook monotonicity gaps before Live email.
6. Build the quiet destination-card UX, readiness validation, safe preview,
   route summary, notification-destination management, and cause-owned health.
7. Ship contact/general inquiry and similarly qualified low-sensitivity
   purposes first. Add prayer/resource/newsletter only after their exact
   sensitivity, consent, retention, and owner proofs pass.
8. Expose Mobilize/application only after Phase 34/37 provides and proves the
   typed production adapter. Its absence does not block the bounded Phase 23
   launch.

## Final disposition

Use **B-prime-R: Purpose-bounded Public Form Definitions with domain-owned
submissions and one atomic, provider-neutral destination plan**.

The requested flexibility comes from a small catalog of useful form purposes,
bounded field customization, explicit destination cards, named one-or-many
notification destinations, and compatible Email Studio messages. Safety and
maintainability come from one released definition, one durable intake
occurrence, independent typed destinations, exact Phase 17/6 communication,
and Resend as transport only.

Do not adopt provider-hosted Templates, Payload's direct send/submission/payment
behavior, synthetic inbound email, arbitrary address/URL routing, or a generic
workflow canvas. Those features would make the system look flexible while
creating the exact dual authority, silent loss, privacy exposure, and future
migration debt D26 is meant to prevent.
