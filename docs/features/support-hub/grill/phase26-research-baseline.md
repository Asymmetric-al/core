# Phase 26 Support Hub research baseline

Historical baseline before the first founder answer. D1 subsequently accepted
email continuation with required amendments. The current decision and completed
23-category review are in `phase26-grill-log.md` and
`phase26-d1-adversarial-review.md`; their conclusions supersede the provisional
recommendation below.

Support Hub should turn an incoming request into dependable staff work: someone
owns the reply, colleagues can coordinate safely, and both unresolved work and
delivery failures remain visible. Existing Core code provides substantial
foundations, but does not establish that this complete experience works today.

This is exploratory grooming evidence checked on 10 September 2026. It is not a
PRD, implementation specification, release assessment, or newly ratified product
policy. The companion decision log tracks unresolved coverage and founder
answers. No provider spike, production-mail test, database concurrency test, or
end-to-end communication journey was executed for this baseline.

## The first unresolved product choice

Imagine Sarah asks her missions organization about a receipt. Staff need one
conversation they can assign, discuss privately, and answer. Sarah must be able
to continue receiving help by email without opening a portal account. The
additional scope choice is whether Phase 26 also includes an optional
**My messages** screen where authenticated, authorized requesters can read their
conversation history and reply. Email remains available to donors, missionaries,
church representatives, and people without portal accounts.

Phase 25 did not promise that new inbox. Its current published planning revision
explicitly excludes My messages/Support Hub expansion while retaining qualified
source-owned document and help operations. It also excludes unsupported prototype
portal-messaging promises. This makes portal conversation access a real Phase 26
decision, rather than an inherited requirement to silently remove or duplicate.
The exclusion does not itself justify deferral: Phase 26 must define its complete
required outcome rather than quietly adopt a smaller MVP.
[1](https://github.com/Asymmetric-al/core/blob/0624ca3841ea98e618fed0e2c490d24c0ef1d9c1/docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth.md#L299)

| Phase 26 scope choice                                                         | Requester experience                                                                                                                                 | Product consequences                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email continuation, with the shared staff workspace and qualified help intake | Sarah emails or uses an authorized help entry point; staff answer and she continues by email. There is no new portal conversation archive.           | Complete intake, assignment, collision prevention, truthful delivery, quarantine, recovery, and email participation are still required. Requesters depend more on their email history.                                                        |
| Email plus authenticated My messages                                          | Sarah can also sign in, find her authorized conversations, see requester-safe status, and reply there. The staff work remains the same conversation. | Adds convenient centralized history and a controlled place to view permitted content. Requires explicit per-requester read/reply rights, attachment access, corrected links, historical visibility, revocation, and email/portal consistency. |

**Provisional recommendation, awaiting an answer:** complete the email-and-staff
experience, including required qualified website/portal help intake. Make My
messages part of Phase 26 if centralized requester history is a required outcome;
otherwise defer that additional surface explicitly. This recommendation follows
the stated shared-staff-inbox purpose and the value of a complete email path,
not evidence that small missions organizations do not need a portal. No requester
usage research has established that tradeoff. It cannot justify deferring the
core safety and follow-through promises or sending confidential material through
ordinary mail. Qualified intake duties are obligations, not claims that they
already work in the checked-out implementation.

The strongest counterargument is that frequent requesters benefit from seeing
their open requests and replies in one place, and selected content can remain
behind authenticated access. If that outcome is necessary for Phase 26, it should
be included and fully groomed. Email remains available in either choice; My
messages would be an authorized view and reply surface over the same conversation,
not another inbox database. Future history access would still need explicit
authorization and could not expose old messages automatically. Whether to use
notification-only email for particular
permitted content is a separate decision, not bundled into portal approval.

Help Scout's current Customer Portal demonstrates that distinction: authenticated
history has its own visibility and reply controls, with separately configurable
email behavior. Its company-wide visibility options are vendor policy, not an
Asym default. Chatwoot likewise distinguishes matching a contact from proving
the visitor's identity. Neither a shared church email nor a household relationship
should silently unlock another person's history.
[2](https://docs.helpscout.com/article/1777-set-up-and-manage-customer-portal)
[3](https://www.chatwoot.com/hc/user-guide/articles/1782283175-understanding-contact-identity-and-identity-validation-in-chatwoot)

## Inherited contracts to preserve

**Operational truth stays with its owner.** ADR-0001 and the Phase 1 ownership
matrix establish Asym Postgres as the owner of Asym CRM and operational facts.
Support conversations can refer to a gift, person, document, or financial request;
they cannot establish that a refund, cancellation, correction, or payment happened.
The existing identity/capability boundaries still apply to every action and read.
[4](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)

**One communication history, bounded payload ownership.** Phase 6 owns canonical
communication events and delivery integration. Support keeps conversation payloads
and contributes a reference event in the same transaction; a support reply crossing
both its message hook and the send seam must appear exactly once. Phase 17 owns
governed outbound preparation, sender/reply identity, and safe content. Phase 6
owns dispatch and delivery evidence. A queued support row cannot replace these
contracts. Issues #554 and #559 remain open and blocked, so the contract is not
proof the integration is implemented.
[5](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md)
[6](https://github.com/Asymmetric-al/core/issues/559)

**Incoming mail already has settled recovery language.** The root glossary defines
durable webhook acceptance separately from completion, a metadata-only pending
inbound record, body retrieval before Support-message readiness, independently
recoverable attachments, tenant routing review, and exact-address route defaults.
An unknown tenant cannot be guessed. Existing inbox moves preserve the original
routing evidence, require a reason, retain status/labels/snooze, and keep an assignee
only if they can access the destination. Bulk moves permit visible partial success
and retry only failed items. These are valuable inherited decisions; they do not
authorize general staff access to confidential care.
[7](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/CONTEXT.md#L385)

**Public forms keep one outcome owner.** Phase 23's founder-ratified, unmerged
D26 contract owns the form occurrence and its released plan. The Primary Outcome
can be a qualified Support handoff or a governed email destination. Support needs
an idempotent intake command; it must not create another form ledger or require
the visitor to wait for all asynchronous inbox processing. Issue #1385 explicitly
awaits the Phase 26 intake contract.
[8](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0170-purpose-bounded-public-form-definitions-and-domain-owned-routing.md)
[9](https://github.com/Asymmetric-al/core/issues/1385)

**Not every reply or request is Support work.** Phase 25's finite newsletter request
uses Phase 23's email Primary Outcome and an independent missionary Information
child; it explicitly creates no support conversation or completion tracker.
Ordinary donor notifications likewise do not silently acquire support messages.
Phase 24 keeps website, authenticated portal, and messaging identities distinct.
Mail receiving setup is not implied by owning a website domain or authenticating
an outbound sender.
[10](https://github.com/Asymmetric-al/core/blob/0624ca3841ea98e618fed0e2c490d24c0ef1d9c1/docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/experience.md#L127)

**Future domains remain separate.** Phase 10/38 controls govern confidential care.
Phase 29 owns the relevant file/records capabilities. The current roadmap directs
Phase 26 to qualify Resend inbound first; alternative receiving providers are
contingencies if a mandatory capability cannot be met, not a multi-provider launch
framework. Phase 34 remains the sole configurable automation vocabulary; Phase 26
may not turn its existing automation rows into a competing builder/engine.
[11](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md#L2895)

## What current implementation actually establishes

The clean grill worktree and the live `develop` head both resolved to
`7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Source and test definitions were
inspected at that revision. Historical module documents called Phase 2 through
Phase 8 describe Support Hub's own implementation history, not the numbered
SiteStacker roadmap phases.

| Finding                                                                                                               | Classification and implication                                                                                                                                                                         | Exact source evidence at the baseline revision                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nineteen Support Hub tables, an active Supabase adapter, API calls, and admin workspace exist                         | **Useful precedent:** retain intentional foundations, but schema breadth does not prove a complete product.                                                                                            | `supabase/migrations/20260515025814_support_hub_core_modules.sql`; `packages/api/src/admin/support-hub/adapter/index.ts:9`; `apps/admin/features/support-hub/hooks/use-support-conversations.ts:36` |
| Provider metadata is preserved, durable work retrieves content, and body readiness precedes routing                   | **Durable pattern:** separate acceptance, retrieval, and domain processing across recoverable boundaries.                                                                                              | `packages/api/src/email/webhooks/resend.ts:791`; `packages/api/src/workflows/functions/inbound-email-processing.ts:41`; `packages/api/src/workflows/adapters/inbound-email.ts:374`                  |
| Lost bridge links can be repaired; authorized retries use existing work claims and dispatch ledger                    | **Durable pattern:** preserve source identity and recovery without inventing another work owner. Full concurrency still needs proof.                                                                   | `packages/api/src/workflows/adapters/inbound-email.ts:325`, `:429`, `:526`                                                                                                                          |
| Tenant-bound routing review exists                                                                                    | **Useful precedent:** destination uncertainty has a visible path. It is not the complete spam/abuse quarantine contract.                                                                               | `packages/api/src/workflows/adapters/inbound-routing.ts:67`, `:205`, `:261`                                                                                                                         |
| `sendReply` inserts a queued row and updates conversation state; UI then says Reply sent and clears the draft         | **Conflict with first principles:** persistence is being presented as dispatch. No downstream support delivery worker was found in the inspected source.                                               | `packages/api/src/admin/support-hub/adapter/supabase.ts:904`; `apps/admin/features/support-hub/hooks/use-conversation-composer.ts:199`                                                              |
| Send input has no expected conversation version or semantic idempotency key                                           | **Implementation accident:** current endpoint shape does not establish collision blocking or safe retries.                                                                                             | `packages/api/src/admin/support-hub/schemas.ts:80`; adapter send path above                                                                                                                         |
| Notes use a separate API and private/type flags but share direction/delivery fields without a cross-field prohibition | **Useful precedent with a safety gap:** separate note intent is valuable; structural non-deliverability needs qualification before a real sender exists. This is not a demonstrated current note leak. | `adapter/supabase.ts:941`; foundation SQL `:286`                                                                                                                                                    |
| Message and attachments are inserted separately; counters are updated from a prior snapshot                           | **Implementation accident:** partial success and concurrent increments require transactional or explicitly recoverable semantics.                                                                      | `adapter/supabase.ts:588`, `:632`                                                                                                                                                                   |
| Inbox/status/assignee SQL filters exist, but text/labels follow a 2,000-row limit; UI also filters locally            | **Conflict with first principles:** an older matching request can be absent from search. Permission/filter/count/pagination completeness must be specified together.                                   | `adapter/supabase.ts:671`; `hooks/use-support-conversations.ts:36`                                                                                                                                  |
| Message-reference SQL lookup falls back to exact sender plus normalized subject                                       | **Implementation accident:** similar subjects are not reliable conversation identity or permission. No opaque reply-token implementation was found in this path.                                       | `adapter/supabase.ts:1371`, `:1446`                                                                                                                                                                 |
| Status fields and snooze mutations exist; automatic wakeup was not found in the searched paths                        | **Useful precedent:** keep useful state concepts, but do not claim timer or reply-race behavior works.                                                                                                 | foundation SQL `:244`; `adapter/supabase.ts:643`, `:854`                                                                                                                                            |
| Round-robin selection is client-calculated; local automation evaluation is a preview                                  | **Temporary bridge:** do not promote this into authoritative concurrent assignment or a second configurable workflow engine.                                                                           | `hooks/use-support-mutations.ts:459`; `lib/automation-engine.ts:49`                                                                                                                                 |
| New inbound conversations use a null CRM contact reference; local macro interpolation is separate from Phase 17       | **Temporary bridge:** staff navigation/interpolation does not prove Party matching, timeline emission, or governed variable safety.                                                                    | `adapter/supabase.ts:1421`; `components/detail/ConversationCrmLinks.tsx:67`; `lib/merge-variables.ts:20`                                                                                            |
| Legacy `support_tickets` remains separately persisted with fixed queues                                               | **Temporary bridge requiring disposition:** choose a single authoritative future write path with an evidence-based migration or retirement. Do not assume there are no historical records.             | `packages/api/src/admin/support/service.ts:146`, `:207`; `packages/api/src/admin/support/tickets.ts:22`                                                                                             |

Paths abbreviated in the table refer to the preceding Support Hub API or admin
feature directory. Source links for the main paths:
[adapter](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts),
[composer](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/hooks/use-conversation-composer.ts),
[inbound adapter](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-email.ts).

The two hardening plans are **not wholly unexecuted**. Plan 002's SQL
inbox/status/assignee filters, message paging, attachment chunking, and header
lookup are represented in current source and query-shape tests. Its remaining
search/label cap problem is narrower than the original plan. Plan 003's A–F
hardening is also reflected in source, including header preservation, bridge-write
checks, action-required routing review, move-retry handling, dispatch-before-status
retry sequencing, and tenant-scoped attachment lookup. Its contributions-status
item G was outside this focused audit. Neither plan should be rerun wholesale.

Existing unit tests cover useful adapter and inbound failure seams. The actual
E2E smoke file tests navigation/layout and can accept a missing conversation on a
deep link; it does not prove receiving or sending mail. Tests were read, not rerun.
The initial implementation claims therefore stop at source evidence.
[12](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/tests/e2e/support-hub.smoke.spec.ts)

## Current external practices

These are documented workflows and protocol requirements, not claims about
unobserved vendor internals or automatic Asym design decisions.

| Evidence                                                                                                         | What it contributes                                                                | What remains an Asym decision or proof obligation                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Help Scout stops stale replies after an unseen customer reply or another staff reply/note                        | A useful model for preserving a draft while requiring review of new information    | Atomic send checks, concurrent requests, revocation, and ambiguous dispatch still require Asym tests. [13](https://docs.helpscout.com/article/99-prevent-duplicate-replies-with-collision-detection)                                                                                                 |
| Front's current ticketing mode has Open, Waiting, Resolved; snooze adds a timer                                  | The older lightweight-versus-full vendor contrast is stale                         | Decide who owes the next action before selecting labels, business-time measurements, and reopening rules. [14](https://help.front.com/en/articles/1300288)                                                                                                                                           |
| Zendesk distinguishes waiting on a requester from waiting on a third party, and distinguishes solved from closed | A useful comparison for handoffs and follow-through                                | Its six-state lifecycle and follow-up-ticket behavior are not mandatory for a small missions team. [15](https://support.zendesk.com/hc/en-us/articles/8263915942938-About-the-ticket-lifecycle-and-ticket-statuses)                                                                                  |
| Salesforce leaves the Contact link blank when exact sender email matches multiple contacts or none               | Serviceable unknown/ambiguous senders need not become invented CRM identities      | A unique match still does not prove the human's identity or financial authority. [16](https://help.salesforce.com/s/articleView?id=000006526&language=en_US&type=1)                                                                                                                                  |
| CiviCRM records email activities on contact history; its inbound processor may create unmatched contacts         | Activity integration is useful precedent                                           | Automatic contact creation conflicts with the supplied no-junk-Party requirement and should not be copied. [17](https://docs.civicrm.org/user/en/latest/email/what-you-need-to-know/) [18](https://docs.civicrm.org/sysadmin/en/latest/setup/civimail/inbound/)                                      |
| Resend separates received-email notifications from content retrieval                                             | Acceptance, body readiness, and attachment custody must be distinct facts          | Qualify body/header replay, endpoint/account retention, retrieval failure, and attachment recovery. [19](https://resend.com/docs/dashboard/receiving/get-email-content)                                                                                                                              |
| Resend attachment download URLs expire and can be refreshed through its API                                      | Temporary provider URLs are retrieval tools, not durable attachment ownership      | Prove expired/missing downloads, safe storage, authorization, and records policy. [20](https://resend.com/docs/dashboard/receiving/attachments)                                                                                                                                                      |
| Resend documents verified webhooks, retries/replay, forwarding, and receiving subdomains                         | Reuse the current provider first, without casually changing root-domain MX records | Confirm actual configured trust and receiving behavior in an authorized isolated spike. [21](https://resend.com/docs/webhooks/verify-webhooks-requests) [22](https://resend.com/docs/webhooks/retries-and-replays) [23](https://resend.com/docs/dashboard/receiving/custom-domains)                  |
| Postmark delivers inbound attachment bytes in its webhook payload; its recovery/archive behavior differs         | Contingency research must examine custody, not just successful parsing             | Later attachment retrieval/replay needs precise qualification; its security and retries are not interchangeable with Resend. [24](https://postmarkapp.com/developer/user-guide/inbound/parse-an-email) [25](https://postmarkapp.com/developer/webhooks/webhooks-overview)                            |
| SendGrid Inbound Parse now documents signatures and OAuth; its retry queue is bounded                            | Older claims that it cannot authenticate signed Parse requests are stale           | Qualify raw multipart verification and recovery deadlines; do not assume a permanent retrievable mailbox. [26](https://www.twilio.com/docs/sendgrid/for-developers/parsing-email/securing-your-parse-webhooks) [27](https://www.twilio.com/docs/sendgrid/for-developers/parsing-email/inbound-email) |

RFC 5322 message identifiers and reply references describe message relationships;
they do not authorize disclosure. RFC 3834 addresses automatic-response loops and
the Auto-Submitted header; it does not choose Asym's numeric limits. Zendesk's
suspension budgets are benchmarks to evaluate,
not defaults to inherit. OWASP's file-upload and XSS guidance applies because a
verified provider can still deliver malicious bodies and attachments.
[28](https://www.rfc-editor.org/rfc/rfc5322.html#section-3.6.4)
[29](https://www.rfc-editor.org/rfc/rfc3834.html)
[30](https://support.zendesk.com/hc/en-us/articles/4408836366362-About-mail-loops-and-Zendesk-email)
[31](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
[32](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

## Live predecessor snapshot

All listed PRs target `develop`. Open PRs reported base
`7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. This snapshot records source provenance;
it does not establish implementation, successful release, or live user behavior.

| PR                                                       | State                                | Source branch                                | Exact head                                 |
| -------------------------------------------------------- | ------------------------------------ | -------------------------------------------- | ------------------------------------------ |
| [#465](https://github.com/Asymmetric-al/core/pull/465)   | Merged, 15 July 2026                 | `docs/sitestacker-parity-phase-0`            | `9a44396d6c6b57f12ebb7144ed9c99f0fa73d85a` |
| [#872](https://github.com/Asymmetric-al/core/pull/872)   | Merged, 27 July 2026                 | `codex/docs-sitestacker-phase-17`            | `b886c2eb2fe4c98cc8723a232d860138c86b10c2` |
| [#1323](https://github.com/Asymmetric-al/core/pull/1323) | Open; review required, blocked       | `codex/phase-22-public-ministry-pages-grill` | `70c50e8c97556c43be5543332fb0993b468b90ab` |
| [#1340](https://github.com/Asymmetric-al/core/pull/1340) | Open; review required, blocked       | `codex/phase-23-web-studio-cms-spec`         | `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6` |
| [#1558](https://github.com/Asymmetric-al/core/pull/1558) | Open draft; review required, blocked | `codex/phase-24-multi-site-management-spec`  | `ab1a1703a725be454376990a7fe68aef2e048026` |
| [#1564](https://github.com/Asymmetric-al/core/pull/1564) | Open; review required, blocked       | `docs/AL-1563-phase-25-donor-dashboard-spec` | `0624ca3841ea98e618fed0e2c490d24c0ef1d9c1` |

The open planning PRs carry documented founder decisions but remain unmerged.
Even merged planning documents do not prove their intended behavior has shipped.
Issue [#1563](https://github.com/Asymmetric-al/core/issues/1563) is an open Phase 25
implementation specification; its ready label does not settle release readiness.

| Requested issue                                                                                                                                                              | Current state and relevance                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#294](https://github.com/Asymmetric-al/core/issues/294), [#296](https://github.com/Asymmetric-al/core/issues/296), [#297](https://github.com/Asymmetric-al/core/issues/297) | Closed as completed; inbound readiness and audited single/bulk moves. Closure provenance points to merged [PR #305](https://github.com/Asymmetric-al/core/pull/305), head `863dfc8c877f269af326140a48e43eebf49227dd`. Stale blocked labels do not override closure evidence. |
| [#554](https://github.com/Asymmetric-al/core/issues/554)                                                                                                                     | Open, blocked; communication seam capture, depends on #553. Reconcile later Phase 17 amendments before using the old ticket literally.                                                                                                                                       |
| [#559](https://github.com/Asymmetric-al/core/issues/559)                                                                                                                     | Open, blocked; atomic Support/member-care emit hooks and exactly-one outbound event, depends on #554.                                                                                                                                                                        |
| [#1384](https://github.com/Asymmetric-al/core/issues/1384)                                                                                                                   | Open, blocked; Phase 23 email Primary Outcome. Named predecessors include #1383, #555, #563, #897, #903.                                                                                                                                                                     |
| [#1385](https://github.com/Asymmetric-al/core/issues/1385)                                                                                                                   | Open, blocked; Phase 23 Support Primary Outcome, depends on #1384 and the Phase 26 intake contract.                                                                                                                                                                          |

The immediate supporting issues were also checked: #553 was open/todo; #555,
#556, #560, #563, #897, #903, and #1383 were open/blocked. Full successor discovery,
the complete Phase 22 contract, all later amendments, and every implementation PR
remain decision-led follow-up work. Nothing in this baseline claims a complete
backlog audit or implementation readiness.

## Sources and evidence limits

Numbered inline references above link to the exact supporting source. Repository
citations are private Core source at pinned commits; PR/issue status was read live
on 10 September 2026. The program charter, phase map, parity matrix, ownership
matrix, CONTEXT/CONTEXT-MAP, ADR-0001, relevant OpenSpec intent, current source,
test definitions, and predecessor contracts supplied local context.

External publishers are Help Scout [2,13], Chatwoot [3], Front [14], Zendesk
[15,30], Salesforce [16], CiviCRM [17,18], Resend [19–23], Postmark [24,25],
Twilio SendGrid [26,27], the RFC Editor [28,29], and OWASP [31,32]. All were
accessed on 10 September 2026. Help Scout's portal page states an update on
8 September 2026; collision detection on 23 April 2025; Front ticket statuses
on 22 April 2026; Chatwoot identity on 24 June 2026. Undated/changing provider
pages need fresh checks when the corresponding decision is reached.

No live mail content, credentials, customer records, production provider behavior,
or configured retention settings were inspected. Official documentation cannot
prove Asym's transactionality, authorization, concurrency, delivery, or operational
recovery. Those remain explicit acceptance-evidence obligations in the grill log.
