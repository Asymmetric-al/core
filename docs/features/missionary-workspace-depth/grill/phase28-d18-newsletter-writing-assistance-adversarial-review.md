# D18 — Optional newsletter writing help: decision and adversarial review

Research and decision-review date: October 16, 2026 UTC.
Repository baseline: `9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

**Disposition: Accept with required amendments.** The founder selected A and
specified tenant-selected API keys and limits, missionary choice, restrained
voice-preserving suggestions and excellent simple UX. The corrected decision
and required amendments below were explicitly ratified on October 16, 2026
(Asia/Bangkok), following the completed review.
This is the completed research review for this answer, not implementation,
provider certification, a formal OpenSpec change or release approval.

## Exact corrected decision to record

> Include optional, source-bounded newsletter writing help. The organization
> enables a dedicated newsletter-writing purpose in the existing tenant AI
> settings, selects its own qualified provider connection/model and sets spending
> and usage limits. It starts off. Missionaries choose whether to use it and may
> turn writing help off for themselves; ordinary newsletter work remains complete without AI.
>
> Maya selects eligible saved newsletter prose and deliberately chooses **Fix
> spelling & grammar, Rephrase, Simplify, Shorten, Lengthen, or Make more
> compelling**. The helper uses only that disclosed selection and necessary
> code-owned instructions. It preserves the supplied meaning, language,
> perspective and voice; it does not invent facts, stories, outcomes, quotations,
> urgency or promises. It has no access to recipient profiles, private prospect
> work, care records, other messages or writing history for this purpose.
>
> Maya compares the original with one suggestion, then chooses **Use suggestion**,
> **Discard**, or deliberately requests another. Use performs an ordinary
> authorized draft edit after checking that the source is still current. It never
> chooses recipients, publishes or sends. Sending remains a separate deliberate
> decision under the existing newsletter contract.
>
> Tenant credentials stay server-side in the shared AI foundation. Every request
> is bound to the exact tenant, actor, source, purpose, credential and qualified
> model; admission reserves bounded estimated usage atomically. There is no
> silent provider, account, model or purpose fallback. Failure, disabled access,
> insufficient budget or unavailable assistance leaves manual editing available.
> Unknown provider outcomes are not blindly replayed, and stale suggestions never
> overwrite newer work. Short-lived private suggestion bodies and body-free
> evidence follow the explicit lifecycle below.

This accepts A's useful job and narrows its authority. It does not introduce a
chatbot, voice-profile database, automated fact-checker, mailbox access, bulk
personalization or a second AI settings service. It does not make AI mandatory
for Epistle parity. The strongest alternative—complete manual editing and
ordinary spelling tools—remains available and is sufficient when this optional
feature is off. Copying text into an external AI app is a possible user behavior,
not a safe substitute for this governed in-product path or an authorized fallback.

## Evidence and confidence

The review uses six independent workstreams, current primary documentation,
source inspection and bounded local counterexamples. See:

- [Owner boundaries and required amendments](d18-evidence/owner-boundaries.md).
- [Current source and editor/UX implications](d18-evidence/current-source-and-ux.md).
- [Writing-assistance UX research](d18-evidence/writing-ux-research.md).
- [Voice, content integrity and structural counterexamples](d18-evidence/voice-and-content-integrity.md).
- [Provider keys, privacy and budgets](d18-evidence/provider-keys-and-budgets.md).
- [Database lifecycle and actual PostgreSQL evidence](d18-evidence/database-lifecycle.md).
- [Original Q18 research](phase28-q18-newsletter-writing-assistance-research.md).
- [Independent cross-review resolutions](d18-evidence/cross-review-resolution.md).

**Repository facts:** [ADR-0099](../../../adr/0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md:37)
already owns tenant provider connections, revisioned secrets, purpose bindings,
minimum egress, invocation evidence, budget/rate controls and separate authorities.
[P21 D10](../../../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md:3345)
places these in Settings → AI features. [ADR-0133](../../../adr/0133-source-bounded-public-page-writing-assistance.md:31)
already governs a separate Public Page Writing Assistant; its Page binding and
translation rider do not authorize newsletters. [D7](phase28-d7-adversarial-review.md)
keeps native newsletter authoring, preparation and dispatch distinct.
[P40](../../../prds/sitestacker-parity/roadmap.md:5217) supplies coordinated suggestion
contracts, not a requirement to deliver its entire staff workbench first.

**Current behavior:** the missionary Email Studio advertises AI content but is a
Coming Soon surface. The inspected Eve API is platform-scope/Gateway oriented;
its root agent uses a mock model and its specialist selection is gated. SQL
permitting tenant-shaped records does not establish a qualified tenant newsletter
path. A shared React Email/Tiptap editor exists, but its inspected neutral handle
lacks the exact saved-selection/digest/conditional-apply contract required here.
The existing [template writer](../../../../packages/api/src/email/template-store.ts:438)
also reads then updates without an expected-version predicate and inserts history
separately; it does not qualify as the atomic newsletter apply/history boundary.
Installed editor 1.5.3 differs from manifest/export metadata 1.7.12; this is a
local qualification concern, not evidence that every deployed editor is broken.
The [source evidence](d18-evidence/current-source-and-ux.md) records exact paths.

**External facts:** current Docs/Word/Notion documentation supports contextual
selection, review and explicit replacement. Mailchimp and HubSpot document email
writing assistance and review. Some Gmail/CRM products use wider email, file or
CRM context; that conflicts with this purpose's boundaries and is not adopted.
Epistle's AI training material does not prove a shipped embedded assistant.
AFP/ECFA truthfulness guidance and Bond contributor guidance inform faithful
communication; they do not determine Core's permission model or establish a
universal ministry workflow. Detailed URLs, dates and access limits are in the
linked evidence notes.

**Product judgments:** the six actions, one-result interaction, initial Off,
private 24-hour candidate lifetime and the operational thresholds below are
explicit recommendations. They are not measured missionary preferences or
vendor-mandated limits. They require the owner and release proof described here.

**Unknowns:** no actual AI model output, paid-provider call, hosted Supabase,
production editor, real-user usability study, provider contract or production
capacity was tested. These are precise activation gates, not an excuse to leave
the product decision vague. No model/provider is selected merely by this review.

## The small user journey

### Organization settings

Reuse **Settings → AI features → Newsletter writing help**. One purpose panel
shows Off/On, current qualified provider/model/region, what text is sent, provider
data-use posture, billing owner, finite estimated-spend allowance, per-user daily
request allowance and current usage/health. Advanced operational ceilings stay in
the shared foundation rather than appearing in the editor. Existing connections
are selectable; adding or rotating a key uses the existing write-only credential
flow. Show safe connection identity and status, never the secret again.

Activation requires a valid qualified binding and explicit finite allowances;
there is no blank-means-unlimited default. Administrators can lower limits,
pause use, rotate/revoke credentials and inspect minimized usage. Lowering a
limit below already used/reserved usage stops new admissions; it does not erase
charges, cancel completed work or reset the budget. Changing provider/model
shows the changed data destination and requires the ordinary binding activation.

### Missionary editor

1. Maya writes normally. When available, **Writing help** is a quiet editor action
   with an accessible AI label. No assistant interrupts typing or scores prose.
   A personal **Use AI writing help** preference can turn it off for her. Off
   hides the tools, prevents her new requests and current candidate use, and ends
   their private-body availability. It grants no permissions, does not affect
   collaborators or ordinary editing, and does not erase incurred/uncertain usage.
2. She selects a passage and chooses one of the six actions. The ordinary source
   save first captures that exact visible selection; if save is pending, failed or
   conflicted, explain this and do not send an older saved version. With no selection,
   guide her to select prose; never silently send the whole issue. Selecting
   multiple contiguous eligible prose paragraphs is supported when the qualified
   semantic editor port can preserve their boundaries and protected structure.
3. Before first use, show concise persistent information: **“AI writing help uses
   the selected text with [provider], chosen by your organization. Review every
   suggestion before using it.”** A **Text being used** disclosure exposes the
   exact source. Provider/data-use changes refresh this information. There is no
   generic confirmation dialog on every ordinary request.
4. Show **Creating suggestion…** with Cancel. Keep the original editable. Announce
   completion accessibly; partial streamed text is never applicable. One complete
   validated candidate appears beside the original, or in readable stacked views
   on a phone. Optional change highlighting supplements the complete wording.
5. **Use suggestion** performs the exact conditional draft edit. **Discard** leaves
   the draft unchanged. **Try another** is a new deliberate generation and may
   consume another request. Keep ordinary editor Undo/history; no special rollback
   product or send authorization is created.

One line at review is enough: **“Check that the facts, meaning and voice are still
yours.”** Never show “verified,” a voice-match percentage, fundraising conversion
score or “ready to send.” Keep required links/footers and recipient-personalization
controls outside this helper.

| Action                 | What Maya should expect                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Fix spelling & grammar | Correct errors with minimal wording changes; ambiguous names, quotations or meaning are not guessed.                                     |
| Rephrase               | Say the same thing another way, keeping perspective, facts and strength of claims.                                                       |
| Simplify               | Clearer words and sentences without removing material qualifications or ministry meaning.                                                |
| Shorten                | Remove repetition while retaining the key message and necessary qualifications; no fixed percentage promise.                             |
| Lengthen               | Explain ideas already supplied; if details are insufficient, invite Maya to add them to the draft first.                                 |
| Make more compelling   | Improve opening, flow and expression of the existing purpose; do not invent an ask, urgency, matching gift, impact or spiritual promise. |

No tone questionnaire, general prompt box, brand-memory setup or per-action
permission matrix is needed initially. Same-language editing preserves the source
language/spelling profile; unsupported or ambiguous mixed-language selections
have a clear manual path. Translation is a separately governed capability.

### Truthful states and recovery

| Situation                                                   | UI and actual behavior                                                                                                                                                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tenant Off or personal writing-help Off                     | No misleading active tool or promotional empty panel. A discoverable preference/settings explanation is sufficient; manual editor is intact.                                                                                                           |
| Current user cannot edit this draft                         | Ordinary view-only UI; no Use action or implied ability to bypass source permissions.                                                                                                                                                                  |
| Source is not eligible                                      | Explain that this selection cannot use writing help; offer eligible prose selection/manual editing without revealing hidden classifications or records.                                                                                                |
| Draft changes during generation                             | Original work stays. Mark result stale; request a new suggestion from current text. No silent rebasing or wrong-paragraph text search.                                                                                                                 |
| Budget exhausted / reconnect required / service unavailable | Plain actionable status, no repeated futile button. Tenant administrator sees technical/account detail; Maya sees when retry is possible or that staff must restore availability.                                                                      |
| Timeout after possible provider acceptance                  | “No suggestion was received. Writing help has not changed your draft. The request may still count toward usage.” Do not replay it automatically. A clearly new request may proceed under fresh authority/budget; prior uncertain usage stays reserved. |
| Save response lost after Use                                | “Checking whether your change was saved…” Recover the original command receipt. Do not encourage another apply while its outcome is unresolved.                                                                                                        |
| Cancel after dispatch                                       | Stop waiting and prevent that result from becoming applicable. Explain that usage may still count; do not claim provider cancellation or zero billing.                                                                                                 |
| No useful change / insufficient detail                      | Say so honestly; leave the draft alone. Do not force a rewrite to look successful.                                                                                                                                                                     |
| Disabled or revoked while panel is open                     | Clear inaccessible candidate text from the active UI, deny subsequent reads/Use and explain the current state. Already accepted ordinary draft text remains governed by its source owner.                                                              |

Use Core's existing base-maia/Base UI and semantic tokens, restrained styling and
familiar editor controls. Meet WCAG 2.2 AA, keyboard selection/action/return-focus,
non-color change cues, screen-reader status, visible unobscured focus, reflow and
bidirectional text. Small screens must not require a drag-only text-selection or
side-by-side horizontal scroll workflow. No extra donor or public-page step is
introduced. There is no background/offline AI replay when connectivity returns.

## Exact requirements to carry into the developing specification

**C01 — Purpose and optionality.** The system SHALL register one qualified
newsletter-writing purpose in the shared tenant AI foundation. It SHALL start Off
and require tenant activation; missionary invocation SHALL always be deliberate.
A personal Off preference SHALL hide the tools and deny that user's new
requests and current candidate read/Use; it SHALL not affect collaborators,
accepted draft text or usage obligations. Re-enabling SHALL not revive candidates
invalidated by Off.
Manual writing, templates, permitted content reuse and deliberate sending SHALL
remain complete without AI. No platform-key fallback or blanket missionary AI role.

**C02 — Existing authorities.** P28's newsletter source owner SHALL own the draft
and conditional edit. P17 owns the applicable preparation/rendering seam, P6
transport, P12 current permissions, P3/P10 classification/egress and P21 D10 the
shared connection/binding/usage foundation. The Page assistant and personal-mail
sources SHALL NOT be reused as newsletter permission. Each owner extension must
be reconciled before activation; no entire P40 workbench dependency is introduced.

**C03 — Exact minimum source.** Invocation SHALL bind a saved source revision,
semantic target identity/range and digest, action, language profile and disclosed
eligible selected prose. The server SHALL construct the source package, not trust
a caller-supplied tenant/source classification or extra prompt context. Only
necessary code-owned instructions accompany the selection. No retrieval/injection of donor,
financial, care, private-prospect or other independently governed source records,
recipient roster/resolved merge data, attachments, mailbox, previous newsletters
or known prohibited provenance. Eligible authored prose remains subject to C04;
ordinary personal details or amounts are not automatically forbidden merely by
topic. No browsing, retrieval or learned voice profile.

**C04 — Classification is not a detector promise.** Whole-field/source policy and
current P10 identity/egress restrictions SHALL qualify the prose source. Unpublished
draft storage alone does not make prose ineligible. Selecting or pasting text SHALL
NOT declassify known prohibited material or its protected provenance. Unknown or
ineligible source paths fail closed. No keyword moderation or general PII-scrubbing
engine is introduced contrary to P10. No claim is made that arbitrary free text
can be certified harmless by an automated scan; explain the disclosed external
processing and evaluate residual author-entry risk without collecting extra data.

**C05 — Six bounded actions.** The six action meanings above SHALL be code-owned,
same-language contracts. Preserve meaning, author perspective, source language/spelling, certainty and
culturally/religiously significant terminology; permit wording changes required
by the selected action. Do not fabricate or strengthen claims,
quotes, Scripture, outcomes, commitments, locations, financial promises or urgency.
Lengthen SHALL use supplied ideas or return an honest no-change explanation.
Compelling SHALL improve expression of the existing intent without coercive or
invented persuasion. Source assertions remain authored, not AI-verified facts.

**C06 — Protected editor structure.** The source adapter SHALL keep required
footer/identity/unsubscribe components, personalization tokens, media, fixed
facts/quote blocks and link destinations outside generative authority. Preserve
identity, order and multiplicity where meaningful. Reject crossing unsupported
protected boundaries with useful selection guidance. Candidate text SHALL NOT
be interpreted as executable HTML, new links or personalization directives.
Use a qualified neutral semantic port; no raw DOM offsets or matching text alone.

**C07 — Review and explicit acceptance.** One complete candidate SHALL be shown
with the original and full accessible wording before deliberate Use. Original
source remains unchanged by generation, preview, failure or discard. No default
accept, auto-rewrite, multi-candidate fan-out, autonomous send/publish, audience
change or hidden transfer of facts to another owner. Ordinary source undo/history
applies to accepted edits. Undo that changes saved content SHALL use the ordinary
source-authorized conditional edit against the current revision/target and preserve
intervening work, never blindly restore an earlier whole document. It remains
available after AI is off when ordinary edit authority remains; transmitted
content is not recalled by Undo.

**C08 — Current authorization and source concurrency.** Admission, dispatch,
candidate read and Use SHALL recheck applicable current tenant membership,
capabilities, enabled purpose, binding/credential lifecycle and source eligibility.
Use SHALL execute one owner-authorized compare-and-set against the bound saved
revision/target, with durable command identity and at most one ordinary successor for an
effective accepted change. No-change results return an honest no-change outcome
without forcing a duplicate revision.
Stale targets or policy races SHALL reject safely. Replaying an accepted command
returns its permitted receipt, not another revision; current denial never exposes
an old body. No silent auto-rebase. A user may continue editing during generation.

**C09 — Tenant keys and certified binding.** Tenant-owned connection credentials
SHALL use existing write-only, encrypted, revisioned server custody. Exact provider
account, credential revision, certified model/region, data-use posture,
prompt/schema version and purpose SHALL be pinned before dispatch. No arbitrary
endpoint/model strings or fallback to a platform key/provider/model/region. Keys
SHALL NOT appear in browsers, logs, job envelopes, exports or support artifacts.
Synthetic connection tests use no newsletter data and disclose any billable test.

**C10 — Budget meaning and controls.** Settings SHALL show billing ownership,
budget currency/period, finite Asym estimated-spend allowance and finite per-user
daily request allowance. Certified input/output/total-billable-token bounds,
request-rate and tenant/user concurrency ceilings SHALL also be enforced. The
shared account identity is stable across credential rotation, re-enable and
binding changes. The estimate is for Asym-admitted use, not a provider-invoice,
tax, exchange-rate or external-key-use guarantee. Provider caps are supplementary.
No flat claim that all provider budgets are soft or perfectly hard is permitted.

**C11 — Atomic reservation and settlement.** Before possible external dispatch,
reserve a conservative certified maximum estimate against every applicable
configured tenant/account/purpose budget envelope and claim the unique invocation in one short atomic admission boundary.
Use integer/fixed-precision sub-cent units with explicit currency; prevent negative
values, overflow and mismatched price units. Include all billable token categories
such as reasoning where applicable. Unknown pricing or unbounded exposure SHALL block new dispatch for that
profile until cost qualification is restored. No network call inside a database transaction/lock. Settle
known usage idempotently; never double-charge the local ledger or release a possibly
billed reservation merely because the UI timed out, worker lease expired or
calendar period changed. This is operating usage, not a Field Account finance fact.

**C12 — Outcomes, retry and cancellation.** Invocation SHALL distinguish admitted,
not dispatched, dispatched/outcome unknown, completed usable/no-change/rejected,
definitively failed and cancelled applicability. Only proven pre-dispatch failure
or authoritative billing evidence can safely release the corresponding exposure.
Provider-specific reliable idempotency/lookup may reconcile ambiguity; otherwise
no blind replay or silent fallback. A separate explicit new generation may be
admitted with fresh identity, current source and remaining budget. Late older
results cannot replace the chosen candidate or draft. Cancel removes applicability,
not an external billing guarantee. Apply ambiguity uses the original source receipt.

**C13 — Precise small resource profile.** Initial admitted selection SHALL contain
at most 8,000 Unicode scalar values (at most 32,000 bytes in valid UTF-8).
Candidate prose SHALL contain at most 16,000 scalar values (at most 64,000 UTF-8 bytes). These are
conservative initial product ceilings, not measured capacity or an obligation to
expand text twofold. Count before dispatch and after output; reject oversize,
truncated or structurally invalid candidates rather than silently trim. Separately
certify total provider token limits including instructions/encoding overhead and
billable hidden tokens; a character count is not a token/cost estimate. At most one
locally active/applicable generation per tenant, actor and purpose is admitted. An unknown
older outcome may free that local interaction slot, but remains uncertain external
work and retains its cost reservation and applicable outstanding-work capacity.
A new request still satisfies all shared certified capacity and budget ceilings;
freeing the visible slot never asserts that remote work stopped. UI counters need appear only near a limit.

**C14 — Private candidate lifecycle.** Candidate bodies SHALL be private to the invoking actor under current source authority, encrypted
and unavailable after 24 hours from generation completion, or earlier Use,
Discard, supersession, source invalidation, personal assistance withdrawal or
applicable revocation. This is D18's explicit recommended lifetime, aligned with
but not inherited from Page assistance. Primary body copies SHALL be purged within
one hour after inaccessibility; failed purge remains inaccessible and alerts.
Transient copied input SHALL be bounded separately: retain only while an admitted
request can still execute, for at most one hour from admission, and remove it
earlier on completed dispatch/no-longer-applicable work where recovery does not
require it. An unknown outcome is not permission to keep input bodies; retained
identifiers/digests/usage evidence support reconciliation without replay. The
original draft follows its own source retention. Both body types have the same
one-hour primary-purge deadline after their access window ends.
Body-free immutable invocation/disposition and minimal usage evidence follow their
own retention owner. Accepted wording is ordinary draft history, not an expiring
candidate. Input expiry SHALL block late pre-dispatch execution and reconstruction
of that invocation's source package; a newly authorized generation is a distinct
operation with current source and limits. No permanent rejected-suggestion library, full prompt logs or AI body
analytics. Restore must enforce expiry/revocation before serving any candidate.

**C15 — Provider privacy and capability qualification.** Before activation the
exact provider account/model/region SHALL qualify data retention, training use,
subprocessors, residency and endpoint storage settings against tenant policy.
No-training and `store=false` SHALL NOT be described as zero retention. Keys can
be valid while the feature is unqualified. No retrieval, tools, links fetched
from input, arbitrary code or provider memory. Selected text is untrusted data,
not instructions that can change sources, credentials, limits or authority.

**C16 — Database grants and immutable scope.** Tenant-owned source, invocation,
candidate and usage relationships SHALL be tenant-aware through composite keys
or equivalent enforced constraints; actor/purpose/credential/source bindings
cannot be reassigned by ordinary updates. Server derives actor and authority;
caller IDs are only untrusted selectors validated inside that scope. Explicit
non-null scope, valid-state checks, unique invocation/apply identities and
nonnegative reservation constraints SHALL make forbidden states unrepresentable
where practical. Deletes SHALL not cascade away accepted draft history, settled
usage or audit evidence; body removal and evidence retention are separate operations.

**C17 — RLS and privileged paths.** Use least grants and enabled/forced coarse
tenant RLS under P12's sole resolver; review old-row USING and new-row WITH CHECK
for that tenant boundary separately. Fine-grained actor, source, purpose, field,
current-capability and current-clock expiry checks belong in qualified source
commands and enforcement points consuming the P12 decision, not a second SQL
permission resolver. Direct browser/raw reads of candidate bodies and privileged
rows SHALL be denied; authorized server projections preserve that full boundary. General tenant membership/admin AI settings rights do not grant candidate
bodies. Revoke direct writes to authority/ledger/attribution fields; use bounded
owner commands. Exposed views/RPCs/storage/realtime/service-role jobs SHALL preserve
the same effective boundary, with restricted function EXECUTE, qualified names,
fixed search paths and minimal privileged roles. An invoker view may be appropriate;
FORCE RLS does not restrain a BYPASSRLS role. No public signed body URLs or broad
service-role route that trusts a browser tenant ID. Constraint errors must not
reveal another tenant's records.

**C18 — Truthful accessible UI.** Implement the state and journey tables above
using existing shared Core design patterns. Keyboard, touch, screen reader, zoom,
RTL/mixed script, low bandwidth and narrow-screen comparison SHALL work. No
inactive promotional AI controls that imply availability; no invisible permissions
inferred from UI alone. Explain source/provider use, voice/meaning review and
unknown outcomes concisely at the relevant step; never make manual work contingent
on AI setup or a consent modal.

**C19 — Performance and isolation.** Reads and reservations SHALL use bounded,
indexed tenant/purpose/actor/state paths; paginate usage/history, avoid N+1 source
reads and do not scan all tenants or load all candidate bodies for dashboards.
Queue fairness and per-tenant capacity prevent one tenant monopolizing workers.
Certified numeric concurrency/rate/token ceilings, budgets, workload and measured
latency SHALL accompany release evidence. No automatic polling/retries that create
provider cost. Manual typing/saving SHALL not wait for the AI service.

**C20 — Business and security evidence.** Retain immutable minimized evidence of
request actor/source/action/binding, admission/reservation, dispatch/outcome,
usage settlement, rejection, explicit use/discard and owner command result.
Record event time and server observation time where different. Keep technical
logs body/key-free; operational traces do not replace durable command receipts or
security audit. AI administrators inspect appropriate usage/status, not prose by
default. Error reporting and voluntary quality feedback SHALL not upload body text
without an eligible deliberate disclosure. No feedback-driven training by default.

**C21 — Safe rollout and compatibility.** Ship disabled; qualify the shared
foundation and newsletter adapter before tenant opt-in. Old clients SHALL not
bypass new purpose/source gates; additive schema and registered contract versions
must support mixed deployments. No backfill invokes AI or sends existing drafts.
Pause stops new dispatch and candidate use under the defined lifecycle while
preserving ordinary accepted drafts, accounting evidence and manual work. Drain
or reconcile in-flight requests; do not roll back by dropping their evidence.
Provider/model/prompt/editor upgrades require affected-profile requalification.

**C22 — Evaluation, not confidence theater.** Certify every enabled action ×
language × model/prompt profile with independently reviewed representative and
adversarial newsletter examples. Include facts, qualifiers/negation, author voice,
religious/cultural meaning, quotes/Scripture, amounts/currencies/periods, anonymized
places and malicious instructions. Any critical fabricated claim, prohibited
egress, protected-node mutation or unauthorized effect in the release suite blocks
activation. Report all cases, failures and review method. Human review remains
necessary but does not substitute for a competent tested model; number/name scans,
high similarity and acceptance rate do not prove meaning or voice preservation.

**C23 — Recovery and monitored risk.** Implement the named owner/signal/threshold/
response register below. Security/authorization/integrity/retention failures are
release blockers, not “monitor later.” Current privacy gates must still work when
workers, cleanup, provider or analytics are unavailable. Staff recovery uses bounded
commands and evidence, not routine SQL editing or release of unknown charges.

**C24 — Traceability and authority.** Carry this decision, glossary meaning,
owner amendments, C01–C24 and P01–P30 into the appropriate formal artifacts only
at `/to-prd`, then implementation tickets at `/to-issues`. Preserve decision,
review, ratification, implementation and activation as distinct statuses. No
existing Page or Eve implementation is declared qualified by resemblance; no new
dependency or actual provider transfer is authorized by this interview answer.

## Adversarial findings

Severity and likelihood are qualitative judgments **before the required safeguards**,
not incident statistics. Critical means potential cross-tenant/secret or prohibited
safety disclosure; High means material privacy, integrity or financial exposure;
Medium means significant usability/maintenance harm. Plausible means a realistic
path exists, not that it has been observed in production. All findings amend A;
none establishes that the current repository is deployed unsafely.

| Finding                                        | What could go wrong and why it matters                                                                                                                                | Severity / likelihood                                                  | Evidence and decision effect                                                                                                                       | Permanent prevention and exact change                                                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| F01 Wrong scope or duplicate platform          | Reuse the Page binding, mount admin Eve, or create another vault/settings system; the wrong authority handles newsletter text and permanent duplication follows.      | High / likely if reused by appearance                                  | ADR0099/0133 and current source diverge from a completed tenant newsletter path. Changes architecture/dependencies, not the user choice.           | One dedicated purpose on D10, bounded newsletter port; C01–02,09,24; P01–03,29.                                                                  |
| F02 Excess context and false declassification  | Whole issue, CRM, care or old letters are attached for better style; sensitive people or ministry details leave the boundary. A text detector falsely assures safety. | Critical for prohibited context / plausible                            | P10 explicitly rejects a general scrubber; competitors sometimes use wider context. Narrows admissible sources.                                    | Exact shown classified source, no broad retrieval/detector promise; C03–04,15; P04–06,23.                                                        |
| F03 Fluent but changed meaning                 | Grammar/rephrase drops “not,” lengthening invents a scene, or compelling adds urgency/impact; authentic communication becomes misleading.                             | High / plausible                                                       | ADR0133, AFP/ECFA/NIST research and local semantic counterexamples. Narrows action meanings and quality claims.                                    | Six precise actions, source/voice preservation, full review and profile evaluation; C05,07,22; P07–09,27.                                        |
| F04 Wrong edit or damaged structure            | Repeated text/Unicode offsets target the wrong paragraph; HTML, links, merge tokens or required footer change; newer edits are lost.                                  | High / plausible                                                       | Current neutral editor port gap, source/version drift and 16 structural counterexamples. Changes editor acceptance contract.                       | Semantic identity, protected nodes, saved revision CAS and owner command; C06–08; P10–13,28.                                                     |
| F05 Stale or forged authority                  | Browser tenant/actor/role fields, stale JWT claims, permissive policy composition, a view or service key bypass current permission; an allowed update moves scope.    | Critical / plausible                                                   | Supabase/PostgreSQL privilege semantics and governing P12. Adds enforcement across every reached path.                                             | Trusted context, tenant-aware FKs, immutable scope, least grants and old/new-row tests; C08,16–17; P14–18.                                       |
| F06 Keys, privacy or fallback drift            | A new model/region or platform key silently processes text, logs expose keys or a “no training” claim is mistaken for no retention.                                   | Critical for secrets; High for privacy / plausible                     | D10 bindings and current provider retention/capability differences. Narrows usable accounts/models.                                                | Exact certified connection revision, no fallback, encrypted keys, qualified data-use; C09,15,20–21; P19,23,29.                                   |
| F07 Spend overshoot and false caps             | Concurrent requests exceed allowance; costs in cents/tokens are misread; model rotation resets budget; hidden reasoning cost is omitted. Provider billing disagrees.  | High / plausible                                                       | Current provider caps differ and can lag; atomicity required for shared allowance. Changes “set limits” into a precise bounded contract.           | Stable purpose account, fixed-precision estimate, reserve before dispatch, certified token bound; C10–11,13,19; P20–22.                          |
| F08 Unknown outcomes become repeats            | Lost response or worker crash triggers duplicate provider work/cost or another draft edit. Cancel is falsely called unbilled; late text replaces a new result.        | High / plausible in remote systems                                     | ADR0099 ambiguity rules; no distributed transaction with provider. Defines retry/cancellation rather than promising exactly-once external billing. | Durable invocation/dispatch evidence, retained reservation, explicit new generation, receipt-based apply; C08,11–12; P12,21–22,24.               |
| F09 Candidate retention becomes shadow history | Suggestions, prompts, traces, exports or restored backups retain private text indefinitely or expose it to AI administrators/coaches.                                 | High / plausible                                                       | D10/P22 separate candidate bodies and evidence; draft ownership differs from AI operations. Adds explicit D18 retention.                           | Private expiring body, early removal, no body analytics, restore fence, provider qualification; C14–17,20–21; P18,23,25.                         |
| F10 Optionality and misleading affordances     | Missionary sees blocked tools, loses selection, cannot dismiss, is confused about Apply versus Send, or cannot use mobile/assistive technology.                       | Medium; High for unintended effects / likely without deliberate design | HAX/WCAG and Docs/Word/Notion patterns; current Coming Soon UI is not a journey. Changes UX acceptance.                                            | Quiet six-action menu, correct state table, clear compare/Use, manual fallback, shared components; C01,07,18; P01,26–28.                         |
| F11 Operational noise and unfairness           | Every keystroke triggers AI, one tenant saturates workers, long bodies or retries exhaust budget; staff repair ledgers by hand.                                       | Medium–High / plausible                                                | Queue/provider limits and shared-budget contention. Requires bounds but not an AI platform rewrite.                                                | Explicit request, bounded payload, one actor generation, tenant fairness, no N+1/body dashboards, recovery receipts; C10–13,19–20,23; P20–24,30. |
| F12 False evidence or uncontrolled upgrade     | Placeholder code, synthetic probes or vendor marketing are presented as parity/model qualification; new model/editor breaks source meaning or safety.                 | High / likely if evidence types blur                                   | Current implementation gaps and package mismatch; no live model/user tests. Changes release claim and sequence.                                    | Source-specific certification, versioned contracts, disabled rollout, exact traceability; C02,21–24; P27–30.                                     |
| F13 Invisible failures and wrong repair        | Technical logs omit durable outcomes; source save succeeds but acknowledgment fails; budget/provider discrepancy is hidden or body text leaks into debugging.         | High / plausible                                                       | Separate external generation, source mutation and usage accounting. Adds evidence and recovery discipline.                                         | Minimized invocation/source receipts and independent settlement reconciliation; C08,11–12,20,23; P12,21,24,30.                                   |
| F14 Speculative features dominate the job      | Voice cloning, RAG, generalized chat, style scoring, donor persuasion, new queues/vaults or custom prompt builders turn a small aid into a fragile platform.          | Medium / plausible                                                     | Existing D10 controls and six actions already meet the selected job. Narrows build scope.                                                          | Reuse shared services; explicit exclusions, no unnecessary dependencies or all-P40 wait; C01–06,19,24; P01–06,29.                                |

### Every requested category evaluated independently

The coarse tenant RLS boundary follows P12; external advice to duplicate the
whole permission model in RLS is explicitly rejected. Fine-grained enforcement
still applies to every reached read/write through the sole resolver and source
commands. The relevant [P12 authorization spine](../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1540)
is authoritative, not a generic Supabase sample.

A repeated finding is intentionally cross-referenced instead of creating a second
contradictory fix. Each finding above supplies failure, impact, severity,
likelihood, evidence, effect and exact permanent clauses.

| Category                                                     | Material concern? | What was checked; findings and exact implications                                                                                                                                                                                                      |
| ------------------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 01 Problem validity, necessity, alternatives                 | Yes               | User-requested selected-text editing is real product intent, not measured demand. Manual editing is strongest simpler alternative and remains complete. Avoid general assistant/whole-P40 scope; F01,F14; C01–05.                                      |
| 02 Brittleness                                               | Yes               | Selection offsets, language assumptions, provider versions, pricing and stale source state; F03–04,F06–08; C03,05–13,21–22.                                                                                                                            |
| 03 Technical debt                                            | Yes               | Duplicate AI settings/vault, reuse of platform-only Eve, editor bypass, retained prompt history and unversioned profiles; F01,F09,F12,F14; C02,09,14,21,24.                                                                                            |
| 04 Edge cases                                                | Yes               | Empty/long/emoji/RTL/mixed-language selections, repeated paragraphs, no-change output, revoked permission, disconnected network and late results; F03–04,F08,F10; C05–08,12–14,18.                                                                     |
| 05 Footguns                                                  | Yes               | Whole-issue fallback, default acceptance, mistaken Send, pasted secrets, provider fallback, rotation reset and “unlimited” empty fields; F02,F06–08,F10; C01,03–04,07,09–12,18.                                                                        |
| 06 Tenant safety                                             | Yes               | Tenant/source/key/cache/usage identity, same actor in multiple organizations, jobs and view/service paths; F05–07,F09; C08–11,14,16–17,19–20.                                                                                                          |
| 07 Database, RLS, authorization safety                       | Yes               | PK/FK scope, nullability, immutable actor/purpose, transitions, USING/WITH CHECK, grants, RPC/view/storage/realtime and BYPASSRLS; F04–05,F07–09; C08,11–17. No gifts or money ledger mutation is admitted.                                            |
| 08 Overengineering                                           | Yes               | Extra chat/RAG/personality engine, custom prompt builder, duplicate financial ledger and full workbench dependency; F01,F14; C01–06,11,24.                                                                                                             |
| 09 UX/UI and friction                                        | Yes               | Discovery, first-use disclosure, six actions, compare/discard/undo, truthful limits/errors, keyboard/mobile/RTL/low bandwidth and no donor friction; F03,F08,F10; C05,07,12,18,22.                                                                     |
| 10 Source of truth, ownership, invariants                    | Yes               | Source draft versus private candidate versus usage/provider evidence; suggestion never becomes fact/send authority; F01,F03–09; C02–17,20.                                                                                                             |
| 11 Hidden coupling                                           | Yes               | Newsletter helper incorrectly waits for P40, depends on admin Eve, inherits Page translation or finance data, or ties manual save to provider; F01,F06,F14; C01–03,09,11,19.                                                                           |
| 12 Failure modes                                             | Yes               | Pre/post-dispatch failure, lost apply response, unavailable provider, purge failure and worker crash; F08–09,F13; C08,11–14,20,23.                                                                                                                     |
| 13 Lifecycle, temporal correctness, concurrency, idempotency | Yes               | Admission races, current authority, stable budget period, exact source version, cancel/late result, duplicate apply and expiry; F04–09; C08–14,16–17.                                                                                                  |
| 14 Data integrity                                            | Yes               | Meaning drift, wrong target, protected-node alteration, duplicate draft successor and usage double settlement; F03–04,F07–08; C05–08,11–12,16.                                                                                                         |
| 15 Security and privacy                                      | Yes               | External text transfer, secrets, prompt injection, restricted provenance, candidate custody, logs/backups/export and account data terms; F02,F05–06,F09; C03–04,09,14–17,20–21.                                                                        |
| 16 Scalability and performance                               | Yes               | Shared budget lock contention, token/resource bounds, worker fairness, indexed access and stale metrics; F07,F11; C10–13,19. Numeric profile is a proposed ceiling, not load proof.                                                                    |
| 17 Operational burden                                        | Yes               | Reconnects, unknown-cost holds, stale UI, failed cleanup and unsafe manual repair; F08–09,F11,F13; C09–14,20,23.                                                                                                                                       |
| 18 Observability and auditability                            | Yes               | Durable actor/source/use receipts versus technical traces, privacy-minimized diagnostics and provider/accounting discrepancies; F07–09,F13; C11–12,14,20,23.                                                                                           |
| 19 Dependency and integration risks                          | Yes               | Supported-provider/model data-use, spend limits, pricing and API drift; editor version divergence and no new vendor by inference; F01,F06–08,F12; C09–15,21–22,24.                                                                                     |
| 20 Migration, rollout and upgrades                           | Yes               | Mixed clients/contracts, no backfill invocation, kill switch, in-flight evidence, accepted-draft durability and restored expiry; F06,F09,F12; C14,21–24.                                                                                               |
| 21 Testability, traceability and proof                       | Yes               | “Voice preserved” cannot be certified by similarity; source/probe/runtime distinctions and owner-to-release links; F03–04,F12; C22–24 and P01–P30.                                                                                                     |
| 22 Other development hazards                                 | Yes               | Rights/lifecycle falsely inferred from ratification, a universally safe free-text detector, stale future prices, and shared UI forks; F02,F10,F12,F14; C04,10–11,18,21–24. No additional finance, public release, coach or contact mutation is needed. |

## Data ownership, invariants and Supabase design consequences

These are logical constraints, not final table names or migration code.

| Authoritative fact                                  | Owner and invariant                                                                                                                                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Current newsletter draft/revision and accepted edit | P28 source command with P17 editor/preparation seam; only explicit authorized Use can apply AI wording through an ordinary draft successor. Manual edits retain their own source commands. Candidate is never canonical draft. |
| Eligibility and actor powers                        | P3/P10/P12 current policy and source authority; settings, ownership, coach membership or same-tenant membership alone do not grant all operations.                                                                             |
| Provider identity/credential/purpose binding        | Shared D10 foundation; immutable exact revision at invocation. Rotation is prospective; explicit revocation blocks applicable future effects.                                                                                  |
| Reserved/settled estimated use                      | Shared stable tenant-purpose usage account, fixed unit/currency/period; never inferred from a UI success message or provider daily dashboard alone.                                                                            |
| Provider acceptance/usage/billing                   | Provider owns external observation; Asym stores minimized evidence and reconciles disagreements. Provider outcome is not a draft edit.                                                                                         |
| Candidate text                                      | Short-lived private derivative; no independent publication, financial, contact or dispatch authority. Accepted source wording follows ordinary source history/retention.                                                       |
| Send authorization and actual delivery              | Ratified D7/P6, completely separate from generation and Use. No AI transition emits a send job.                                                                                                                                |

Database admission must serialize competing reservations against the same stable
budget, and lock/revalidate relevant policy epochs in a consistent order where
needed. A provider call cannot be made transactionally atomic with PostgreSQL;
record dispatch admission before possible egress and preserve uncertainty after
a crash. Current revocation prevents new dispatch after its committed boundary;
it cannot undo bytes already sent. Worker fences do not imply a provider honors
fencing tokens. Never advertise exactly-once provider billing.

An explicit monthly budget uses a disclosed calendar/zone and immutable period
identity. Prefer the shared foundation's certified period policy; the initial
newsletter profile uses UTC calendar months and UTC daily request windows, with
local reset time displayed. Pending old-period reservations stay in that period;
a new month does not erase unresolved liability. Do not mix currencies or convert
provider invoices silently. Reconciliation records corrections with provenance,
not a rewrite of historical evidence.

RLS is defense in depth with privileges and trusted commands. PostgreSQL may
inherit USING for WITH CHECK when omitted; omission is not automatically a hole.
Conversely permissive policies combine with OR, referential checks can reveal
existence, and service/table-owner privileges can bypass expected row filters.
Review the actual role, grants and call path. Expiry must be evaluated at read/Use,
not only by a cleanup cron or an immutable CHECK involving the current time.
This review requires direct REST/RPC/view/storage/job negative tests, not only
successful application calls.

## Falsifiable acceptance and release evidence

**P01.** Tenant Off, personal writing-help Off and fully enabled states all permit the
same complete manual draft/save/preview/send job; AI controls truthfully match
current authority. Turning AI on does not send existing text.

**P02.** A Page binding, admin Eve session, coach role or another newsletter's
permission cannot invoke/read/apply this purpose. Supported newsletter source
rights can, without granting general AI administration.

**P03.** Tenant settings use its selected connection; invalid/unqualified/missing
binding blocks egress. No fallback key/model/account/region occurs.

**P04.** Captured egress equals the disclosed selected source plus necessary
code-owned instructions, including when other draft paragraphs or private data
exist. Recipient tokens are never resolved for this request.

**P05.** Known prohibited source/provenance, restricted identity and unknown
source paths are rejected before egress. An eligible unpublished draft can be
used without public release; no invented scanner claims arbitrary prose safe.

**P06.** Adversarial prompt text, fake tool markup or embedded URL cannot invoke
tools, fetch content, change scope/budget or add source context.

**P07.** Each action passes independent claim-level review with material facts,
negation, conditionality, culture/religion, quotes and amounts preserved. Test
insufficient-source Lengthen and already-concise Shorten no-change outcomes.

**P08.** Voice review by competent representative authors is reported per enabled
language/action. No generic English score qualifies RTL, other languages or
mixed-language behavior. Unsupported profiles remain unavailable without losing
manual editing.

**P09.** Compelling improves existing intent without adding unsupported
fundraising asks, guilt, guarantees, deadlines, matching gifts or outcomes.

**P10.** Protected links/tokens/footer/media/quote nodes retain identity and
multiplicity; model markup remains inert text. Unsafe cross-node selections have
clear guidance instead of silently widening the source.

**P11.** Repeated identical text, emoji combining sequences, RTL and reordered
blocks cannot redirect application. Current source changes reject stale Use.

**P12.** Duplicate Use and lost-success response for an effective change produce
one draft successor and
recoverable original receipt. Current revocation prevents body disclosure even
when a historical receipt exists.

**P13.** Actual concurrent source edit versus Use and revoke versus Use are
serialized correctly; no permitted update transforms tenant/actor/purpose/source
identity into a forbidden state. Concurrent edit/revoke versus saved Undo and a
lost Undo acknowledgment preserve intervening work and the original command result.

**P14.** Two tenants sharing a user/email/provider vendor remain isolated across
candidate IDs, cache keys, traces, usage, service workers and storage paths.

**P15.** Anonymous, unauthorized authenticated, same-tenant different-author,
revoked-member and cross-tenant direct table/RPC/view/storage calls deny the
corresponding private read/write. Test actual USING/WITH CHECK and policy ORs.

**P16.** Forged actor/tenant/credential/source/status/cost/approval fields cannot
be accepted; composite relationships and check/unique constraints reject invalid
scope/state. Error messages do not disclose foreign records.

**P17.** Service-role dispatch and cleanup enforce exact scoped commands; definer
functions have limited EXECUTE and safe name resolution. No browser credential
or public candidate storage route exists.

**P18.** Expired/revoked candidate denies reads/Use without cleanup running;
clock-boundary, cache invalidation and restore-to-serve checks preserve denial.
Settings administration alone does not grant prose access.

**P19.** Rotation pins old in-flight identity without silent substitution; explicit
revocation blocks future dispatch/read/apply as applicable. Account/region/model
changes refresh required disclosures and require qualification.

**P20.** Concurrent admission at the final available budget admits only allowed
cost/request/concurrency effects. Zero/negative/overflow/unit/currency errors,
limit lowering, re-enable and rotation cannot reset or expand allowance.

**P21.** Known completion settles once; timeout/crash after possible dispatch
retains bounded exposure. Pre-dispatch failure can release once. Retry of the
same invocation never creates another uncontrolled provider attempt.

**P22.** An explicit new generation after unknown outcome is separately admitted
within remaining allowance and applicable outstanding-work capacity. The old
local result is no longer applicable even though remote completion/accounting
is uncertain; late output cannot replace the new candidate. Period rollover
retains old uncertain exposure. Cancel does not promise a refund.

**P23.** Browser/network/log/job/export/trace inspection shows no keys or undisclosed
source/body retention. Exact provider endpoint/account retention and regional
terms are qualified; no-training/store flag is not falsely called zero retention.

**P24.** Worker crash, provider rate limit/outage, lost response, settlement failure
and recovery preserve manual draft work and durable truthful outcomes. No outbound
message or publication occurs in any generation/apply branch.

**P25.** Use/discard/supersession/revoke/expiry removes candidate access promptly;
primary purge within one hour is evidenced for candidate and transient input
bodies. Input expires at most one hour after admission (earlier when no longer
needed), blocks late dispatch/reconstruction, and does not persist for unknown
outcomes. No read/retry/late response renews either deadline. Accepted draft
history is retained under its source policy. Backup recovery cannot resurrect
accessible old bodies.

**P26.** Source at exactly 8,000 scalars and candidate at exactly
16,000 obey inclusive limits; one additional scalar rejects without hidden
truncation. Invalid Unicode/encoding is rejected rather than silently replaced;
valid four-byte scalars exercise the 32,000/64,000-byte maximums. Provider-token overhead/hidden-token limits are independently tested.

**P27.** Release evaluation has zero observed critical fabricated claims,
prohibited egress, protected-node changes or unauthorized effects in the declared
suite. Report sample composition, reviewer method and failures; this is not a
claim of zero possible production error.

**P28.** Actual browser/user tests cover keyboard, screen reader, 200–400% zoom,
narrow viewport, touch selection, focus return, non-color comparison, RTL and
poor connectivity. Users distinguish selection, suggestion, saved draft and Send;
report observed success and confusion, not just a screenshot or automated scan.

**P29.** Mixed old/new clients and source/prompt/model/editor contracts fail safely;
activation is gated, no migration calls AI, kill switch preserves manual work,
and downgrade cannot expose candidates or replay dispatch. Qualify the actual
installed editor version and any required semantic port before activation.

**P30.** Measured production-shaped tenant workload establishes indexed access,
queue fairness, rate/concurrency ceilings and latency without slowing manual save.
Usage reconciliation and all monitor signals can be exercised by bounded faults.
No unmeasured “fast/scalable” or provider-invoice guarantee is claimed.

## Ordered synthesis and owner handoff

1. **Before recording the amended answer:** resolve the scope as six selected-text
   actions, existing tenant keys/settings, no broader context, no automatic use/send,
   clear cost semantics and current source acceptance. This document resolves those
   decision questions. The founder subsequently explicitly ratified the corrected
   decision and required amendments; the ratification record below preserves that
   distinction from the earlier A selection.
2. **Capture at `/to-prd`:** P28/P17 newsletter source/semantic editor seam and
   action/journey requirements; D10 exact purpose, account/budget/resource/retention
   profile; P3/P10/P12 eligibility and authority; D7/P6 unchanged send separation;
   P29 custody if used. Amend corresponding owner PRDs/ADR/OpenSpec deliberately.
   Do not claim ADR0133's Page binding already authorizes this. Add requirements,
   scenarios and design/task references for C01–C24/P01–P30 together.
3. **Implement shared safeguards first:** qualify the existing D10 foundation
   against actual code, then trusted source extraction/current authority, private
   candidate storage, atomic admission/settlement and durable conditional source
   edits. Certify a supported tenant provider/model profile. No new vendor or
   dependency is presumed; dependencies are chosen only through normal review.
4. **Implement the complete small journey:** six actions, exact source disclosure,
   original/candidate review and truthful states using the existing editor/design
   system. Qualify the actual editor port and source-version lifecycle. Bind this
   to manual authoring without coupling saving or sending to AI availability.
5. **Prove before activation:** direct negative authorization tests, real concurrency,
   provider failure/accounting tests, retention/restore/mixed-version checks,
   action/language model evaluation and author/accessibility/phone testing. The
   local research probes are supporting evidence, not substitutes. `/to-issues`
   tickets must link exact requirements and proof IDs; release evidence links back
   to those IDs, binding/model/prompt/editor versions and qualification dates.
6. **Roll out disabled, then deliberate tenant enablement:** expose only qualified
   profiles, enforce limits and monitor bounded residual operational/quality risk.
   Failures disable the affected AI profile, not ordinary newsletter work.

### Residual monitoring register

Thresholds below are initial operational judgments, not observed incident rates.
Owners are accountable repository domains/operational roles; assign named staff
when release ownership is created. None replaces a required prevention gate.

| Signal                                                                                               | Threshold                                                                                          | Owner                                | Response                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized source/body/key disclosure or cross-tenant access                                       | Any confirmed occurrence                                                                           | Security/P12 with shared AI owner    | Disable affected egress/read path, contain credentials/data, investigate, add regression and requalify before enablement.                                     |
| Confirmed invented material claim, altered protected meaning or wrong-target Use                     | Any confirmed occurrence                                                                           | P28 content owner + AI purpose owner | Disable affected action/language/model profile, preserve minimized evidence, correct/evaluate before restoring.                                               |
| Candidate or transient-input primary-body purge overdue                                              | Any candidate/input body still present one hour after its access deadline or earlier revocation    | Custody/platform operations          | Keep access denied, alert and repair cleanup; verify disposal and restore fences.                                                                             |
| Unknown provider outcome/reservation age                                                             | Any unresolved exposure older than 30 minutes                                                      | Shared AI operations                 | Reconcile available provider evidence; keep conservative hold until justified settlement. Explain capacity impact; never blindly resend or release liability. |
| Settled estimate exceeds admitted reservation, budget invariant breach, or unexplained unit mismatch | Any occurrence                                                                                     | Shared AI usage owner                | Pause affected pricing/model profile, reconcile append-only evidence, repair estimate/ceiling and requalify.                                                  |
| Provider errors or completed latency regression                                                      | At least 20 requests in 15 minutes and >5% terminal provider errors, or p95 completion >15 seconds | Shared AI operations                 | Inspect rate/account/model health; pause degraded profile if needed, show truthful availability, preserve manual editor.                                      |
| Repeated author voice dissatisfaction                                                                | Three deliberate reports for one action/language/model profile in seven days                       | P28 product/content owner            | Review consented/minimized examples, improve or disable affected profile; no automatic draft collection or voice profiling.                                   |

## Actual proof, limits and document verification

The [content probe](d18-evidence/prose-probe/results.json) passed 16/16 synthetic
counterexamples: numerical/name preservation, similarity, offsets and text digests
cannot alone prove faithful meaning or correct structural application. It made
zero model calls. The [database evidence](d18-evidence/database-lifecycle.md)
records **35/35 outcomes in isolated PostgreSQL 17.11, including eight actual
two-session lock races**. Limit lowering below already held exposure remains an untested production case;
the fixture's held-at-most-ceiling CHECK is not a final schema recommendation.
The changed fixture explicitly rejects NULL intent/
digest/revision arguments after static review found a weakness in its first
34-case version; the initial run is preserved. Both containers and volumes were
removed and cleanup verified. The fixture tests synthetic reservation units,
not actual prices, usage settlement, cryptographic erasure or complete egress.
Neither is a Core implementation, hosted Supabase qualification, encryption or
restore test, paid-provider cost test, model-quality test or user study.

The final [review verification](d18-evidence/review-verification.json) checks local
references, required category/requirement/proof structure, decision-status
consistency and unchanged founder-brief provenance. No formal owner/ADR/OpenSpec,
application, schema, dependency, ticket, live provider or external communication
was changed. The review disposition remains **Accept with required amendments**; the founder
has now explicitly ratified the corrected decision and those amendments.

## Subsequent explicit ratification

On October 16, 2026 (Asia/Bangkok), the founder instructed: “Ratify this decision
and amendment. Then continue with this phase 28 grill-with-docs session.”

This ratifies the corrected D18 decision, C01–C24 and P01–P30 as future acceptance
obligations, including the six-action profile, tenant and personal optionality,
exact selected prose, existing tenant AI controls, conditional Use/Undo,
conservative usage admission and unknown-outcome recovery. The initial
8,000/16,000-scalar bounds, distinct input/candidate lifetimes, purge deadline,
UTC allowance periods and named monitoring thresholds are now ratified design
direction, not measured capacity or completed runtime qualification.

The original 35/35 PostgreSQL outcomes with eight actual races, 16/16 prose
counterexamples, source hashes and cleanup evidence remain unchanged. The
[initial review verification](d18-evidence/review-verification-initial.json)
preserves the pre-ratification snapshot; the current verification records the
new decision status. This changes no provider/model selection, live key or
setting, application/schema/dependency, formal owner/ADR/OpenSpec, ticket or
external communication. Continue with a separately researched product choice;
ratification is not implementation or activation.
