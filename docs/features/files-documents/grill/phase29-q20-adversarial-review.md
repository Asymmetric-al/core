# Phase 29 Q20 — Default-on fresh-access email with staff control

**Disposition: Accept with required amendments.**

**Status:** Conrad selected Q20 A and ratified its complete required amendment
package on 2026-10-21, Asia/Bangkok. Q01–Q20 are ratified grooming intent.
This review preserves the exact corrected decision and proof obligations.
Q21's answer is not inferred. This is grooming documentation, not implementation,
activation or formal owner/OpenSpec publication.

Keep the product change small: one visible **Notify recipient by email** choice
in the existing fresh-access review. Start it selected for a genuinely new,
eligible review; let staff turn it off. Make the recipient and final consequence
clear. Preserve that choice on validation and retry. Show the grant result and
this notice's actual result separately. The remainder of this review specifies
how existing source, authorization and communication owners support that simple
experience without granting the checkbox authority it does not have.

## Evidence, authority and limits

The source/owner pass, runtime pass and UX pass are preserved in
[owner review](phase29-q20-owner-adversarial.md),
[runtime review](phase29-q20-runtime-adversarial.md) and
[UX review](phase29-q20-ux-adversarial.md). The
[historical question](phase29-q20-question.md) preserves practical alternatives.
The original Q20 [owner research](phase29-q20-owner-research.md),
[runtime research](phase29-q20-runtime-research.md) and
[comparative research](phase29-q20-comparative-research.md) remain dated evidence.

| Evidence class                | What is established, and what is not                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository authority          | `docs/ai/document-authority.md:10–35` and `openspec/project.md:6–19` require owner/successor reconciliation. Generated OpenSpec projections are not independent authoring sources. P29 owns custody and the native journey; source owners own meaning/access; P4/P12 own identity/permission; P17 owns message contracts/presentation; P6 owns communication execution/history. |
| Ratified grooming intent      | Q01's closed document-request recipient/no-Party amendment and protected doorway, and Q08–Q19's exact fresh-access eligibility, fixed clocks, read-only completion and sequential periods. These are accepted decisions, not evidence that the native schema or dispatch path exists. All seventeen glossary terms remain unchanged.                                            |
| Current local source          | HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Adjacent receipt/approval notification and email helpers exist. The native Q20 source-to-dispatch contract has not been qualified. Existing code is not assumed correct or equivalent.                                                                                                                                         |
| Current remote owner evidence | Live develop was freshly checked at `800213405e2c51e07180e86ee8322355e0fdb4eb`, unchanged from the preceding review. Relevant newer owner text was reviewed read-only. Local and live snapshots remain distinct; no pull occurred.                                                                                                                                              |
| External evidence             | Primary product documentation supports an integrated send/skip choice. GOV.UK provides real counterevidence against preselected checkboxes. Accessibility standards describe interaction requirements, not the best default for Asym. Resend's deduplication window does not prove permanent business deduplication.                                                            |
| Product judgment              | Default-on favors including a useful handoff while the fixed access period runs. Default-off reduces unnoticed outward messages. Neither tradeoff has been measured with intended Asym staff. A remains the founder's selected, bounded product judgment.                                                                                                                       |
| Unresolved qualification      | Exact native source profiles, recipient/suppression classification, prepared-material and Recent-copy posture, effective database/RLS/privileged paths, provider recovery, composed browser/AT behavior and intended-user comprehension require implementation/release proof. None is represented as passed here.                                                               |

The source review includes the original founder brief's private request/review/
share journey, exact-version integrity, privacy of filenames and notices, and
P6/P17 reuse without installing all of Workflow Studio first. Plausible examples
such as staff already helping a recipient are scenarios, not observed ministry
workflows or established demand. No private records or credentials were read.

### Governing contracts and explicit successor scope

- `docs/adr/0025-producer-owned-protected-actions.md:21–50,74–110,125–131`
  keeps issuance, purpose, recipient, credential, expiry and revocation with the
  producer. The qualified doorway remains scanner-safe; credential replacement
  requires a new communication/prepared identity where authorized, not edited
  sealed bytes or a new access clock.
- `docs/adr/0026-contract-bounded-delivery-plans.md:17–61` separates source
  conditions from tenant Delivery Plans and releases the exact P6 child set
  atomically, including a valid zero-member result. Its D44/D45 default-Off
  staff-review email at lines 63–115 is a different purpose. Q20 cannot override
  that plan, preference or required in-product member.
- `docs/adr/0027-one-notification-presentation-and-engagement-model.md:18–37,50–55`
  separates attention/read projections from source and delivery truth.
- `docs/adr/0032-immutable-prepared-message-and-whole-message-recovery.md:19–113`
  requires permanent semantic identity/material comparison, immutable prepared
  bytes, exact submission recovery and bounded handling of indeterminate I/O.
- `docs/adr/0037-scanner-safe-exact-artifact-access.md` preserves inert GET/HEAD,
  deliberate protected use, current exact authorization and no secret logging.
- P17 `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md:1131–1168`
  requires code-owned meaning, requiredness, finite recipient resolver, fact
  wall, channels/plan, sender/reply, recovery and proof. Its census's deferred
  file/form/reference request binding is not a Live native Q20 contract.
- P17 lines 2312–2320 and ADR-0032 lines 61–74 explicitly forbid future document
  contracts from accidentally inheriting existing financial-email or optional
  staff-email material classes. The optional external-recipient notice needs
  an explicitly reviewed compatible closed class, utility boundary and Recent
  sent copy posture before becoming Live. Q20 selects no new retention number.
- P6 `docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md:472–479,527–563`
  preserves the closed recipient arc, body-free durable no-Party reference,
  short-lived protected transport material, exact provider correlation and
  producer-owned recovery. An address is neither identity nor tenant authority.

Ratified Q20 narrowly resolves the following reservation, with later authorized
publication required for canonical cross-owner integration: the
ordinary fresh-access notice reservation in **Q08-C10/P01/P20; Q13-C19/C24;
Q14-P16; Q15-P16; Q16-C06; Q17-C06; Q18-C06/P13; Q19-C06/P13**. It retains their
separation of issuance, use, proof and notification. Earlier records remain
historical provenance. This does not select reminders, initial invitations,
automatic grants, other channels or arbitrary resends. Q01 identity adoption
is not reopened; Phase28's newsletter-only exception cannot supply this purpose.
Exact shared source/P4/P12/P17/P6 adoption precedes the native consumer; full
Phase34 or Phase41 delivery is not a new prerequisite.

### Current behavior that must not be copied uncritically

The adjacent approval code inserts deduplicated notification rows and attempts
email only for newly returned keys (`approval-notifications.ts:279–315,532–589`).
That pattern alone does not demonstrate recovery after a row commits but mail
handoff fails. Profile-based staff email lookup is not the Q01 recipient arc.
The low-level Resend sender validates keys but its boolean/error response does
not itself implement durable provider uncertainty. The current webhook verifies
signatures, yet adjacent metadata/tag tenant resolution, raw event/click URL
storage and updates that can map later engagement back to `sent` are reuse
hazards. A signed event still needs exact durable account/environment/attempt
correlation, safe fact extraction and an order-safe reducer. These are source
findings in adjacent paths, not a demonstrated exploit in an implemented Q20
feature. See the runtime review for exact paths, line evidence and limitations.

## Practical alternatives and research conclusion

| Option                                            | Practical advantage                                                                                                                        | Practical cost                                                                                                    | Judgment                                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **A — Initially selected, staff can turn it off** | Includes the handoff in one deliberate source approval, reducing the possibility that a wanted notice is forgotten while access time runs. | Preselection can be overlooked and produce unwanted outward mail. Its consequence must be conspicuous and tested. | **Accept with required amendments**, preserving the founder's choice and current authority. |
| **B — Same review, initially unselected**         | The actor explicitly opts into email; avoids a default outward message when unnoticed. Needs no separate send screen.                      | A wanted notice can be omitted; the access clock still starts at issuance.                                        | Strongest alternative. There is no Asym outcome evidence proving it worse.                  |

Google Drive documents a sharing flow in which staff can uncheck notification.
This supports an integrated choice, without importing Drive's audience or
resharing model. Content Snare exposes publication/message choices, Digify
documents with-email and without-email mobile handoffs, and Submittable's form
editing flow makes the combined action explicit. None establishes Asym's best
default or permits reopening completed work.
([Google Drive](https://support.google.com/drive/answer/2494822?co=GENIE.Platform%3Ddesktop&hl=en),
[Content Snare](https://contentsnare.com/help/knowledge-base/step-5-publish-send/),
[Digify](https://help.digify.com/en/articles/1137411-sending-files-with-document-security-on-your-mobile),
[Submittable](https://submittable.help/en/articles/2829680-how-can-i-allow-a-submitter-to-edit-an-additional-form))

The material counterargument is explicit: GOV.UK advises against preselecting
checkbox options because users may miss the choice or submit the wrong answer.
That is applicable usability evidence, not a WCAG prohibition or a governing
Core default. Resolve the tension openly: A is a contextual product judgment
for a visible consequence in a deliberate staff action. Show who receives the
notice and make the final action say whether email is included; test whether
staff actually understand it. Do not pretend a label proves comprehension,
force a toggle-off/on ritual, or add routine confirmation screens.
([GOV.UK checkboxes](https://design-system.service.gov.uk/components/checkboxes/))

Use a labeled, keyboard-operable shared checkbox; checking it alone must not
dispatch anything or unexpectedly navigate. The final visible action and
accessible name must agree. Results/errors persist in context and are announced
appropriately without unnecessary focus movement. This preserves useful review
and confirmation purposes in the current flow, not a new wizard.
([WAI checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/),
[WCAG On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html),
[Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html),
[Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))

Resend stores idempotency keys for 24 hours. Core must keep the durable business
identity and recovery rules beyond that provider window. It must not start a
new keyed send merely because a response was lost or the window elapsed. No
exactly-once physical delivery claim follows.
([Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys))

## Whole-product adversarial check

### What could go wrong with this answer?

An overlooked check, restored default or stale recipient could cause unwanted
mail. A committed grant could be presented as failed when only email failed;
retry could then duplicate the grant or notice. A queued unfinished notice could
arrive after fulfillment with misleading upload instructions. Protected facts
could leak through subject lines, previews, callbacks or logs. These failures
require precise existing owner boundaries, not more staff ceremony.

### What hidden assumptions are we making?

That staff usually want the handoff, can notice the default and can resolve a
safe intended recipient; none has been measured here. That the shared seam
will support the new source is intended architecture, not current runtime proof.
The exact optional recipient material class is not supplied by an access TTL.
These assumptions become explicit source qualification and intended-user tests.

### How does this affect the whole product?

One source review condition is added for native fresh unfinished and completed-
read access. It does not edit tenant Delivery Plans, donor preferences, staff
attention defaults, CMS publishing, public access or financial state. Current
file/version/completion and retention owners remain authoritative. No new
general notification or renewal system is justified.

### How does this affect the end-user experience?

Staff see a clear recipient, optional notice and meaningful final action, then
the real outcome. Recipients get minimal approved content and the existing
accessible doorway. Existing legitimate proof remains; no forced account,
reupload, arbitrary email composer, date editor or additional routine approval.
Low-bandwidth recovery preserves choices and shows uncertainty honestly.

### Does this follow modern best practices?

It uses documented integrated choices, meaningful review, accessible controls,
immutable operations and honest asynchronous outcomes. The default itself is
not universal best practice: GOV.UK's contrary guidance and B remain explicit.
Current evidence supports qualifying A, not claiming it is empirically optimal.

### Does this fit Asym's existing repo and product direction?

Yes, if implemented as a source-owned optional condition with P17/P6 execution,
the already-ratified Q01 identity path and exact protected-action owners. It
conflicts if used to bypass Delivery Plans, reuse a newsletter/financial/staff
purpose or inherit an incompatible prepared-material class. C02/C07/C08 resolve
those conflicts through narrow owner adoption rather than a new framework.

### Should we adjust the recommendation?

Keep A, with the eight clauses below. Make the default visible, preserve the
choice, keep source and message outcomes separate, and qualify current dispatch
and material privacy. Do not add reminders, new channels, global preferences,
resend policy or another deadline decision.

## Ratified corrected decision

> For ordinary native fresh unfinished and fresh completed-read access,
> including their ratified subsequent periods, include one visible optional
> recipient-email choice in the existing meaningful staff review. In each
> genuinely new review, initialize it selected only when the exact source,
> actor, intended recipient, Live message contract, effective Delivery Plan
> and channel path permit the notice. Staff may turn it off. Show the permitted
> recipient/destination and whether approval grants access with this notice or
> grants only; preserve the reviewed choice through validation and recovery.
>
> The approval records the exact grant and its notification choice coherently
> with the existing durable source/P17/P6 handoff. Replays recover the original
> effect and choice. A grant-only replay cannot add email; an already-authorized
> selected notice may recover through its original qualified occurrence without
> another grant. Delivery is separate: known grant success survives downstream
> notice failure or uncertainty, and no message may claim an uncommitted grant.
>
> Current source, recipient, privacy, plan, sender and protected-action checks
> still govern preparation, submission and use. Freeze the authorized meaning
> and recover immutable messages only as their owners permit. No silent
> retargeting, stale unfinished invitation after fulfillment, blind resend,
> deadline reset, authority widening or guarantee of delivery follows. Keep
> grant and notification outcomes clear in the existing context and offer only
> qualified recovery. All Q20-C01–C08 and Q20-P01–P18 obligations below apply.

## Exact required amendments

These clauses are the complete incremental contract. They inherit settled
source/identity/communication safeguards rather than introducing parallel
owners. “Must” and “must not” are normative. C references below mean Q20-C.

| ID                                              | Exact required language                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Q20-C01 — Scope and retained choice             | Apply this optional email choice only to the ordinary native fresh unfinished and fresh completed-read source actions, first or subsequent periods. Keep their purposes distinct. For each genuinely new, known-eligible review initialize the visible choice selected; preserve the actual choice through validation, back navigation and safe draft recovery. Default initialization is not server authorization. Require an explicit valid reviewed choice under the command contract; missing, null, legacy or conflicting values must not default to true. A selected control need not be manually toggled to authorize its visible consequence at deliberate approval. Exclude original invitations, identity messages, reminders, review/fulfillment notices, bulk, other channels, staff alerts and specialist mandatory notices.                                                                                                                                                                                                                                                                                                                                                                                            |
| Q20-C02 — Authority and eligibility             | Treat the choice as a source occurrence condition, never as a per-grant Delivery Plan override, recipient preference, message classification or access permission. Derive tenant/environment, actor, grant/source, intended recipient/address revision, permission and audit attribution from trusted context and qualified owner relationships. The exact Live contract, effective bounded plan, audience, recipient eligibility/suppression, sender/reply and source/action checks must permit the notice. Known unavailable/unknown paths must be explained safely; staff can deliberately choose an otherwise-lawful grant-only path. Do not silently downgrade a confirmed combined intent before admission if material eligibility/destination changes. A provider delay with a valid durable authorized path is distinct from missing authority. After known source commitment preserve that result and report the actual notice state. Q01's closed recipient amendment and specialist narrowing/mandatory rules remain binding.                                                                                                                                                                                             |
| Q20-C03 — Durable effect and exact replay       | Preserve the committed grant, explicit reviewed choice and required communication handoff/recovery evidence coherently at the existing authoritative boundary before claiming the combined operation accepted. No notice can describe an uncommitted grant; a crash between source write and secondary processing must be recoverable from durable exact source evidence. Providers run outside database locks. Recover matching committed work before evaluating new admission. A replay with false must not add a notice after plan/default/readiness changes; changed true/false or other material under a committed identity conflicts. Recovery may complete the already-authorized true notice under its original meaning. P6 exact-set release includes valid zero-member results; unknown compilation is not a valid omission. No replay may append an omitted member. Use permanent source/purpose/recipient communication identity and material equality; do not mistake a transport request key for the business effect.                                                                                                                                                                                                  |
| Q20-C04 — Current source and immutable recovery | Keep all access clocks anchored to their ratified source issuance, with earlier limits; selection, queueing, delivery, opening and credential repair never reset them. Recheck exact source/grant/recipient/contact revision, plan/suppression, sender/reply/connection and protected-action applicability at the governing preparation/submission/use boundaries. A queued unfinished notice after fulfillment needs an exact qualified source/contract applicability or variant; otherwise do not dispatch it. Never rewrite a sealed unfinished notice into completed-read mail. Expired/revoked/no-longer-applicable work cannot advertise current access merely because it was selected earlier. Material changes use only authorized immutable recovery. A new credential, where allowed by ADR-0025, has its required new communication/prepared identity and recovery lineage without a new grant or clock. Old credentials do not resolve authority by finding the newest period.                                                                                                                                                                                                                                           |
| Q20-C05 — Provider truth and safe evidence      | Reuse P6/ADR-0032's sealed payload, exact envelope, account/environment identity, bounded same-key recovery and reconciliation rules. The provider's 24-hour deduplication window is not Core's business-history TTL or permission to replay with a new key. Possible submission remains indeterminate until exact evidence resolves it; no blind resend, changed envelope, physical exactly-once promise or guaranteed recall. Authenticate callbacks and correlate them against the durable exact provider account/connection/environment/message/attempt; payload tags, address and signed metadata alone are not tenant authority. Duplicate/out-of-order events must not rewind delivery truth or confuse engagement with receipt/reading. Retain only approved body-free evidence; never raw protected URLs, credential verifiers, secret-bearing click payloads or private document facts in logs/history/queues.                                                                                                                                                                                                                                                                                                             |
| Q20-C06 — One clear, accessible interaction     | Reuse the existing source review and supported shared controls. Show the permitted recipient/destination and selected consequence in ordinary readable content, with a final action whose visible and accessible names accurately distinguish grant-plus-email from grant-only. Checkbox changes alone have no grant/send/navigation effect. Preserve state/focus, keyboard/touch/reflow, approved locale/direction and actual localized end with time-zone context; avoid countdown-only or transient-only results. Show the grant and this notice's real status separately: For a staff-off choice, report this access notice was not requested, not that every independent email was suppressed. For selected notices, preserve requested intent and report the actual blocked/suppressed/non-applicable/unknown outcome; a zero-child result does not rewrite the choice. Queued/accepted is not delivered/read; possible submission is not definitely not sent. Explain safe next action in context. Use only the approved minimal subject/preview/body/action; no arbitrary recipient/composer/attachment, new account, routine second confirmation, manual-toggle ritual, new queue/dashboard or direct storage URL fallback. |
| Q20-C07 — Data, privacy and bounded operation   | Enforce the tenant/environment/source/recipient relationship and permanent effect identity through qualified database keys, constraints and one authoritative mutation boundary. Ordinary roles cannot rewrite attribution, scope, choice, release membership or frozen message facts; inspect SELECT/INSERT/UPDATE/DELETE grants, RLS USING and WITH CHECK, RPC/view/storage and service-role paths, not only UI checks. No broadening by allowed updates, cross-tenant references or unchecked privileged lookup. Preserve immutable history and lawful retention/erasure; access expiry is not deletion and a hold is not access. Qualify the optional external-recipient prepared-material/utility class and Recent-copy posture explicitly; neither existing staff/financial classes nor Q14/Q18's 30-day access period may be inherited accidentally. Use bounded indexed source/intent lookup, paginated authorized history and existing per-tenant dispatch limits; no request-time historical scans, new mail queue, scheduler or dual truth.                                                                                                                                                                               |
| Q20-C08 — Publication, rollout and proof        | At authorized publication reconcile the exact listed Q08–Q19 notice reservations and current source/P4/P12/P17/P6 authors, then regenerate declared projections and link future design/tasks/tickets/tests/release evidence. Keep Q01 identity intent and all other ratified limits; do not copy unrelated purpose keys or require whole Phase34/41. Before Live activation qualify the exact contract/profile, finite material/utility posture, current authorization and all P01–P18 outcomes. Mixed-version/legacy data must never infer true, regenerate historical notices, revive credentials or replay provider-unknown work; restore preserves restrictions, immutable identities and original clocks. Provide a narrowly scoped dispatch stop and roll-forward recovery that preserve committed grants/history. Establish workload/queue/reconciliation budgets with the existing owner before activation, not invented numbers here. Treat GOV.UK's preselection counterevidence and actual staff comprehension as release evidence, not solved by source review. No new resend/automatic renewal/notification framework follows.                                                                                          |

## Ownership, data invariants and lifecycle

Source grant records own access purpose, scope, recipient and issuance/end.
The validated per-operation notification choice is a source fact. The source
owns notice business meaning, occurrence, recipient authority and applicability.
P17 owns its code-owned message contract/capability envelope, fact wall, plan
envelope and prepared presentation;
P6 owns permanent communication identities, exact release and execution truth.
The provider owns evidence of its acceptance/delivery, not source permission or
human awareness. UI badges, sent-copy projections and logs own no mutations.
The current qualified recipient/source path owns file use. File versions,
review outcome, completion, retention and financial facts are not rewritten by
notification success. No new money field, rounding or conservation rule is
introduced; existing financial records remain outside this mutation.

| State or boundary                                 | Required behavior and forbidden transition                                                                                                                                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. New review                                     | Derive current eligibility; initialize selected only for known eligible notice. No grant or email exists merely because a view loads or a checkbox changes.                                                                                         |
| 2. Edited or unavailable review                   | Preserve explicit off/on. Safely explain unavailable/unknown authority. Material changes require current review, not silent replacement of a combined action. A deliberately lawful grant-only action remains possible.                             |
| 3. Not admitted or admission unknown              | Confirmed no-admission means no grant/no notice. Lost response is not that proof. Recover exact durable state before allowing a new operation; leaving the page cannot promise cancellation after commitment.                                       |
| 4. Grant committed, notice off                    | Preserve original grant and not-requested fact. Replay cannot append mail, even after plan/readiness/default changes. Independent required/security messages are unaffected.                                                                        |
| 5. Grant committed, notice selected               | Required durable source/notice evidence permits exact recovery, including incomplete handoff. A failed worker must not require regranting. An accepted combined result cannot conceal missing durable recovery evidence.                            |
| 6. Unprepared or prepared, definitely unsubmitted | Follow exact P17 resolver/sealed-payload rules and current narrowing. Valid omitted child is final for that occurrence. Suppressed/ended/fulfilled context cannot be changed into another purpose. Only qualified recovery is available.            |
| 7. Submission may have begun                      | Preserve exact frozen envelope; bounded identical same-key calls only where ADR-0032 permits. Otherwise reconcile. Unknown stays unknown, including after purge; no rekey, split, rerender or recall promise.                                       |
| 8. Provider evidence or terminal no-send          | Correlate exact source-independent delivery evidence; append/reduce without out-of-order regression. Accepted/delivered/engagement differ. Apply existing terminal material erasure. Grant and current use remain separately evaluated.             |
| 9. Later change, return or restore                | Apply current proof/source restrictions, original end and historical disclosure. New eligible staff-approved grant is a distinct review; old replay retains old choice/result. Restore cannot revive old authority or treat unknown work as unsent. |

Concurrency must preserve both inherited source admission/nonoverlap and P6
intent uniqueness across two staff, two keys, retries and absent-row races.
The exact transaction layout is an implementation choice; atomic source truth
and recoverable required handoff are outcomes to prove. Timing uses existing
server/source instant semantics; local formatting, DST, midnight, delivery delay
and backdated display do not alter the issued end. No new calendar arithmetic,
notification-driven completion or universal transaction/retention timer is added.

## User journeys and recovery

| Journey                                                            | Expected experience and edge cases                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Fresh eligible unfinished or completed-read grant               | Staff sees existing scope/end/recipient review, checked optional notice and a clear combined action. Each source's correct work/read meaning remains. After admission show the grant plus actual queued/requested state, not “recipient notified.” Applies equally to ratified later periods.                                                                                                                                                           |
| 2. Staff wants grant-only                                          | Uncheck once; preserve through validation, back/forward and supported recovery. Final action grants only. Result says this access notification was not requested. No extra essay, confirmation or forced account; source-mandated requirements remain.                                                                                                                                                                                                  |
| 3. Missing permission, readiness or uncertain availability         | Explain only safely disclosable facts in normal content, not a tooltip. No checked-disabled promise. Staff may deliberately choose a valid grant-only route. An outage with authorized durable queueing is distinct from missing permission; no arbitrary sender/address/channel fallback.                                                                                                                                                              |
| 4. Recipient/address/source changes mid-review                     | Revalidate material terms through existing review. Do not retarget recipient or send sealed bytes to a replacement address. Shared email text is not identity. Keep names/addresses/locales as owner data; do not impose new Western-name or postal-address requirements.                                                                                                                                                                               |
| 5. Double-click, two staff or lost response                        | Recover exact original effect and notice choice; duplicate UI disabling is convenience, not integrity. A conflicting choice under committed identity cannot mutate it. If true was committed but handoff incomplete, recover it; if false, no later default may add it.                                                                                                                                                                                 |
| 6. Grant succeeds, email fails or is uncertain                     | Show the known grant and actual end. Distinguish definite no-send from uncertain provider acceptance. Provide only the qualified next action/owner; do not regrant, extend, clone request, blind resend or claim nothing happened. Staff returning later can recover safe status in context.                                                                                                                                                            |
| 7. Fulfillment, expiry or revocation while queued; late delivery   | Prevent stale pre-dispatch instructions under current applicability. Do not convert sealed unfinished content into completed content. Already accepted mail may arrive late and cannot be recalled; doorway enforces current proof/use. No thirty days from receipt and no automatic compensation grant.                                                                                                                                                |
| 8. Mobile, low bandwidth, keyboard/AT and forwarded/scanned notice | Choice, recipient and final consequence remain understandable at narrow width/zoom and in supported languages. Preserve input/focus on slow/lost responses; announce persistent results correctly. Minimal subject/preview protects sensitive ministries. GET/HEAD/scanners do not redeem; forwarded/wrong/unqualified entry does not reveal private existence/history. Use existing accessible proof with supported paste/autofill; no new enrollment. |

## Category-by-category adversarial review

Severity describes impact if the safeguard is absent, not a live incident.
Likelihood is qualitative design plausibility; it is not measured prevalence.
Inherited concerns are explicitly qualified. Each row states the effect on A
and exact prevention clauses/proof below; those cross-references supply the
normative language without duplicating it twenty-two times.

| #   | Category and material concern                                               | What/why, severity/likelihood, evidence or reasoning                                                                                                                                                                                                                                                                 | Effect, permanent prevention and exact requirement/proof                                                                                                                                                                                       |
| --- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity and alternatives — **Yes, evidence limitation** | Forgetting a wanted handoff and sending an unwanted one are both plausible; no observed Asym frequency. **Medium / uncertain.** Integrated product patterns support a choice; GOV.UK strengthens B. A is not proved uniquely best.                                                                                   | **Narrows** the claim to a product judgment. Keep one integrated choice, strong B and comprehension qualification; no-build/manual contact does not establish a safe governed handoff. **C01/C06/C08; P01/P17.**                               |
| 2   | Brittleness — **Yes**                                                       | Defaults reapplied on rerender, absent booleans or readiness recovery can reverse staff intent; network/identity assumptions change. **High / plausible**, based on ordinary form/retry boundaries and current unknown native seam.                                                                                  | **Amends** A to explicit retained per-operation choice and current eligibility, not a global default read at dispatch. **C01–C04; P02/P03/P06/P07.**                                                                                           |
| 3   | Technical debt — **Yes, reuse risk**                                        | Copying best-effort staff mail, profile email lookup or generic event keys creates a second weak authority/recovery path. **High / plausible**; adjacent approval/send code does not prove durable handoff or Q01 identity.                                                                                          | **Narrows** implementation to existing qualified owner seams; no parallel framework or accidental class reuse. **C02/C03/C07/C08; P08/P16/P18.**                                                                                               |
| 4   | Edge cases — **Yes**                                                        | Fulfilled before dispatch, mail after expiry, shared mailbox, changed address, stale tab, disabled sender, wrong recipient or bounced notice can mislead or disclose. **High / plausible**; clocks/source transitions and asynchronous delivery make these realistic.                                                | **Amends** applicability, distinct outcomes and exact recovery; preserve completed view and original end. **C02/C04–C06; P07/P09–P12/P15.**                                                                                                    |
| 5   | Footguns — **Yes**                                                          | An unnoticed checked control, hidden off state or broad “resend” can mail externally or repeat an unknown submission. **High / plausible**, with direct GOV.UK preselection caution and provider uncertainty.                                                                                                        | **Amends** conspicuous recipient/action, retained off, no implicit fallback/rekey/unsend promise. **C01/C05/C06; P02/P10/P17.**                                                                                                                |
| 6   | Tenant safety — **Yes, inherited qualification gate**                       | Cross-tenant recipient/sender/queue/cache/provider correlation can disclose sensitive documents. **Critical / plausible if unmapped**; signed metadata is not durable tenant ownership, per P6 arc and current adjacent webhook.                                                                                     | **Narrows** A to exact same-owner/environment relationships and callback correlation, current disclosure and bounded projections. **C02/C05/C07; P04/P05/P11/P12.**                                                                            |
| 7   | Database, RLS and authorization — **Yes, not runtime-proven**               | Permitted update can rewrite choice/owner/recipient or append children; service role/view/RPC/storage can bypass app checks. **Critical / plausible**; native SQL/grants/RLS not qualified. No evidence of a deployed Q20 flaw is claimed.                                                                           | **Requires** composite relationships, explicit null/default semantics, immutable command fields, current trusted attribution, grants plus USING/WITH CHECK and privileged path proof. No unchecked broad UPDATE. **C02/C03/C07; P04–P06/P18.** |
| 8   | Overengineering — **Yes, scope risk**                                       | New notification engine, composer, preference page, reminder calendar or routine extra approval would turn one choice into a product branch. **Medium / plausible**, given many adjacent communication capabilities.                                                                                                 | **Narrows** to one existing review/control and existing source/P17/P6 recovery. No new queue or whole Phase34/41 prerequisite. **C01/C06–C08; P01/P16/P17.**                                                                                   |
| 9   | UX/UI and user friction — **Yes**                                           | Hidden consequence, “success” that implies delivery, tiny/unsupported control or slow-network resets reduce confidence and can cause unwanted sends. **High / plausible**; primary accessibility guidance and eight modeled journeys.                                                                                | **Amends** visible recipient/action, state retention, separate truthful outcome, accessible persistent status/localized actual end. No extra name/address/account requirement. **C01/C02/C06; P02/P03/P15/P17.**                               |
| 10  | Source of truth, ownership and invariants — **Yes**                         | Checkbox, plan, projection, provider event or email link can be mistaken for access/identity authority. **Critical / plausible**; ADR0025/26/27/32 explicitly separate these facts.                                                                                                                                  | **Narrows** control to source condition; source business meaning/grant/choice, P17 contract/presentation, P6 execution and provider evidence retain single owners. **C02–C05/C07; P04/P06/P08/P11.**                                           |
| 11  | Hidden coupling — **Yes**                                                   | Email availability may block legitimate grant-only work; email failure may undo access; grant change may silently mutate sealed mail. **High / plausible**, especially with synchronous adjacent sending.                                                                                                            | **Amends** known pre-admission review versus post-commit recovery, immutable message boundary and no Delivery Plan edits. Exact durability is required, delivery success is separate. **C02–C04; P03/P07–P10.**                                |
| 12  | Failure modes — **Yes**                                                     | Crash after source write, lost provider response or failed callback can strand handoff or prompt duplicate grant/send. **High / plausible**; distributed boundary and adjacent first-insert-only dispatch.                                                                                                           | **Requires** durable exact source choice/recovery and separately reported unknown state; no blind compensating regrant. **C03/C05/C06; P06–P11.**                                                                                              |
| 13  | Lifecycle, temporal correctness, concurrency and idempotency — **Yes**      | Two staff/keys, late callbacks, default changes or credential replacement can create duplicate effects, stale instructions or a new clock. **High / plausible**; ratified sequential periods plus immutable P6 identities.                                                                                           | **Amends** nine boundary distinctions, exact replay/material equality, current dispatch and inherited atomic admission/nonoverlap. **C03–C05; P06–P11/P15/P18.**                                                                               |
| 14  | Data integrity — **Yes**                                                    | Partial child release, inferred true backfill, webhook regression or UI shadow state misstates what was approved/sent. **High / plausible**, P6 exact-set contract and observed adjacent reducers.                                                                                                                   | **Requires** authoritative choice, exact release including proven zero-member result, append/reduce evidence safely and no historical mail generation. **C03/C05/C07/C08; P06/P08/P11/P18.**                                                   |
| 15  | Security and privacy — **Yes**                                              | Subject/lock-screen/file facts, bearer links, raw click URLs, sent copies/backups or wrong-tenant callbacks expose sensitive ministry information. **Critical / plausible**; protected-action/field-wall/retention owners and adjacent payload storage.                                                              | **Narrows** presentation and stored evidence; qualify material class/erasure and current protected entry; no attachment/provider URL fallback or secret logging. **C02/C04/C05/C07; P04/P11–P13/P18.**                                         |
| 16  | Scalability and performance — **Yes, qualification needed**                 | A default-on source increases volume; unbounded history scans, repair fanout or provider calls under locks degrade shared tenants. **Medium–high / unknown volume**, no production-shaped Q20 measurements.                                                                                                          | **Requires** indexed bounded identity lookups, existing dispatch limits/fairness and measured agreed budgets before activation. Thirty-day access is not workload sizing. **C03/C07/C08; P14/P16.**                                            |
| 17  | Operational burden — **Yes**                                                | Staff may repair mail with extra grants, copied links or direct DB edits; repeated per-recipient alerts create noise. **High / plausible** when outcomes/recovery are opaque.                                                                                                                                        | **Amends** same-context truthful status and existing typed root-cause recovery, no new alert dashboard or generic resend. **C05/C06/C08; P10/P14/P16/P18.**                                                                                    |
| 18  | Observability and auditability — **Yes**                                    | “Sent” lacks actor/choice/source meaning; transport logs may falsely substitute for business history or leak secrets. **High / plausible**; distinct source, communication and engagement contracts.                                                                                                                 | **Requires** durable safe approved choice/occurrence attribution and exact execution evidence; technical traces remain diagnostic. Safe existing support view/controls below. **C03/C05–C07; P06/P11/P12/P16.**                                |
| 19  | Dependency and integration — **Yes**                                        | Provider timeout/dedupe expiry, sender/account drift, duplicate or contradictory callback makes retry unsafe. **High / plausible**; Resend 24-hour window and ADR0032 exact recovery.                                                                                                                                | **Narrows** to qualified provider contract/account with exact envelope/current fences and reconciliation; no vendor fallback by inference. **C02/C04/C05; P07/P09–P11/P16.**                                                                   |
| 20  | Migration, rollout and upgrade — **Yes**                                    | Old clients/schema or restored queues may infer true, send historical notices or revive already submitted/expired work. **High / plausible**, new command meaning and durable history outlive deployments.                                                                                                           | **Requires** capability-gated activation, no guessed backfill, mixed-version/restore proof, dispatch stop and roll-forward preserving grants/unknown evidence. **C07/C08; P13/P16/P18.**                                                       |
| 21  | Testability, traceability and proof — **Yes**                               | “Notify by default” can pass a checkbox test while authorization/recovery fails; drift among reviews/ADRs/spec/tickets hides gaps. **High / plausible**, source census defers native binding.                                                                                                                        | **Requires** exact successor mapping and P01–P18 outcomes across source/database/provider/browser/user layers; record tests not yet executed honestly. **C08; all P groups.**                                                                  |
| 22  | Other development hazards — **No additional independent concern found**     | Checked financial precision, public/CMS surface mutation, new dependency need and invented ministry workflow assumptions. None is introduced by this bounded choice; legal/mandatory classification, rollback, privacy and workload hazards are already explicitly covered above. This is not a global safety claim. | **Does not change** A beyond inherited controls. Preserve scope and reject accidental extra features; **C01/C07/C08; P01/P16/P18** verify the boundary.                                                                                        |

## Falsifiable acceptance and proof

P references are future required outcomes, not tests reported as run. Use the
real native source/role/database/provider seam and composed supported UI where
each outcome requires it; mocks or helpers alone cannot close the corresponding
release gate. Avoid tests that merely assert the checkbox's implementation.

| ID                                                  | Required positive, negative or boundary outcome                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q20-P01 — Scope and alternatives                    | Both first/later fresh unfinished and completed-read reviews offer the permitted integrated choice; their correct source actions remain distinct. Initial invitation, reminder, fulfillment notice, bulk, other channels and mandatory notices are unaffected. B remains a documented alternative, not a second user workflow to build.                                                                                                                                                            |
| Q20-P02 — Choice preservation                       | Known-eligible new review starts selected; staff can uncheck without ceremony. Validation, back navigation, rerender and supported slow-response recovery retain the choice. Missing/null/malformed/legacy field cannot become true. Committed false→true and true→false under the same identity conflict rather than mutate.                                                                                                                                                                      |
| Q20-P03 — Availability and review changes           | Unknown/unavailable authority never shows a promise of email. A lawful deliberate grant-only action works independently. Material destination/eligibility change before admission gets current review; no silent downgrade. A valid durable queued path during transport delay is not mislabeled unauthorized. Post-commit failure preserves the known grant.                                                                                                                                      |
| Q20-P04 — Roles, identity and tenant isolation      | Authorized source/notice actor works; issuer without notice authority, cross-tenant/environment ids, stale role, forged actor/recipient/address/classification and wrong no-Party purpose fail. Existing Q01 proof remains; no fake Party or use of newsletter authority. Test equivalent primary/direct RPC/storage/privileged paths.                                                                                                                                                             |
| Q20-P05 — Database mutation boundaries              | Validate native PK/FK tenant-aware relationships, unique effect identities, non-null/explicit choice semantics, valid immutable states, allowed deletes/retention and supporting indexes. Exercise role grants and RLS USING/WITH CHECK for old/new row states: permitted row cannot become forbidden tenant/source/recipient/choice/release. Views/RPC/security-definer/service paths preserve those same fences.                                                                                 |
| Q20-P06 — Source concurrency and replay             | Two staff, different transport keys, double-click, missing row and lost source reply converge on inherited valid source admission/nonoverlap and exactly one durable deliberate effect. Matching committed replay returns original choice/result under current disclosure. A stale command cannot use a later grant or newer default to add mail.                                                                                                                                                  |
| Q20-P07 — Crash and handoff recovery                | Fault before admission proves no effect; fault after source write but before secondary completion recovers exact durable selected choice/occurrence. False never creates email. True incomplete handoff can complete without regranting. No combined acceptance is claimed without durable required evidence; provider I/O is outside locks.                                                                                                                                                       |
| Q20-P08 — Plan and permanent intent                 | Exact occurrence replay preserves the compiled child set, including proven valid zero-member release. Unknown compilation remains recoverable/failed, not silently omitted. Changed plan/readiness/condition cannot append an omitted child. Changed semantic/material payload conflicts; separately authorized credential recovery has distinct required identity and lineage without duplicate source grant.                                                                                     |
| Q20-P09 — Currentness and transition races          | Test revocation, source/scope/recipient/address/suppression/sender/plan change and unfinished fulfillment before preparation, after preparation and before submission in both orders. No stale upload promise or silent retarget/rerender. Late provider acceptance cannot undo a source change; current doorway still enforces source authority.                                                                                                                                                  |
| Q20-P10 — Provider uncertainty                      | Inject known nonsubmission, successful submit with lost reply, allowed exact retry, key conflict, deadline/window exhaustion and contradictory mapping. Apply existing ADR0032 bounded recovery; no new-key retry, forced new occurrence or claim of physical exactly-once delivery. Unknown does not become definitely unsent.                                                                                                                                                                    |
| Q20-P11 — Callback authenticity and reduction       | Actual adapter contract tests verify signed raw callback handling, exact account/environment/connection/message/attempt correlation, duplicates, out-of-order sent/delivery/bounce/engagement and contradiction. Tags/address alone cannot select tenant. Late engagement cannot rewind delivery or prove human reading. Unsafe raw payloads do not enter history.                                                                                                                                 |
| Q20-P12 — Disclosure and protected doorway          | Inspect approved subject/preview/text/HTML/action and logs/queues/traces/support/history/export/Recent-copy surfaces. No unapproved private filenames/reasons/attachment/provider URL/secret. GET/HEAD/scanner and forwarded/wrong recipient requests cannot redeem or reveal protected existence/history. Every actual file representation rechecks current authority.                                                                                                                            |
| Q20-P13 — Material retention and restore            | Exact optional external-recipient class/utility/Recent-copy posture is approved and finite before Live. Wrong staff/financial/access-TTL inheritance fails validation. Acceptance/terminal stop/expiry removes adapter/decrypt authority and applies existing purge rules. Backup/restore cannot revive purged/expired credentials, unknown submission or sealed material beyond its original authority.                                                                                           |
| Q20-P14 — Workload and fair recovery                | Use representative admitted native workloads, including a large tenant and provider outage, against recorded existing-owner queue-age/reconciliation/query budgets and limits. Verify indexed bounded lookups, paginated authorized history, bounded retry/fanout and per-tenant fairness. No unbounded request-time history scan or provider I/O in source locks. Record actual measurements before claiming performance.                                                                         |
| Q20-P15 — Temporal and status truth                 | Test exact issued end before/at/after boundary, DST/local timezone formatting, delayed mail/opening and subsequent periods. Source end never resets. Grant-only, queued, definite no-send, possible submission and exact provider evidence remain distinguishable; staff-off alone means not requested, while selected but suppressed/non-applicable/zero-child outcomes retain the original requested choice. No blanket “all emails suppressed,” delivered/read or undo promise.                 |
| Q20-P16 — Owner adoption and recovery operation     | Trace exact selected successor clauses into current authors/declared projections, contract registry, design/tasks and eventual authorized tickets/release evidence. Qualify native seam without whole future workflow product. Exercise safe typed support recovery and narrow dispatch stop while preserving granted access/history; no direct DB repair or arbitrary provider fallback.                                                                                                          |
| Q20-P17 — Browser, accessibility and intended users | In supported keyboard/AT/touch/reflow/zoom/locales/low-bandwidth flows, staff can perceive recipient, checked state, final action and outcome; visible/accessible names agree and persistent statuses are conveyed. Verify source/proof usability without new account/reupload. Observe intended staff predict checked/unchecked/unavailable consequences; any material unnoticed-send or choice-loss finding blocks qualification pending product/design correction. No success rate is invented. |
| Q20-P18 — Mixed versions and migration              | Old/new clients, schema compatibility and partial rollout cannot infer notification true, backfill old notices, mutate approved fields or release unqualified contracts. Replays after upgrade/restore retain original intent/material; provider-unknown history never becomes an unsent backlog. Roll-forward/dispatch stop preserve grants and restrictions; after provider submission rollback cannot promise recall.                                                                           |

## Synthesis and execution order

1. **Ratified decision:** Conrad adopted this exact notice cohort, retained
   strong B and preselection counterevidence, and resolved source condition
   versus Delivery Plan, original-choice replay versus true recovery, unfinished
   fulfillment and incompatible material-class inheritance through this complete
   amendment package. These resolutions are recorded as ratified grooming intent.
2. **At authorized spec/design publication:** reconcile the exact predecessor
   reservations and owner contracts. Define native source meaning/recipient
   mapping, minimal facts, eligibility, currentness, prepared-material/utility/
   Recent-copy posture and the permanent intent/recovery seam. These define what
   the control can truthfully promise. Do not select arbitrary TTLs or registry
   keys in the founder interview. Update generated projections from authors.
3. **Implementation safeguards:** enforce source admission and trusted immutable
   choice first; prove coherent handoff and P6 exact release; then prepare and
   dispatch under current P17/source fences with exact provider recovery and
   safe callback correlation. Reuse bounded existing infrastructure. Build the
   single visible control and same-context outcome around those facts, preserving
   input and accessible behavior. No grant waits for successful mail delivery.
4. **Before activation:** complete the outcome-specific P01–P18 evidence at its
   real layer, including roles/RLS/races, provider uncertainty, material erasure,
   mixed versions/restore, browser/AT and intended-user comprehension. Establish
   existing-owner workload/queue/reconciliation budgets and exact material class.
   Missing proof is a release gate, not an unexplained “monitor later” item.
5. **After activation:** use only the following owned residual controls. They
   detect operational regression after qualification; they cannot replace it.
   No new dashboard, arbitrary alert cadence, renewal cap or survey subsystem
   is selected. Genuine material user evidence can justify revisiting A.

## Residual operational controls

The named owners are existing functional owners, not invented staff assignments.
Numeric service budgets must be approved and recorded by those owners before
activation; no unsourced latency/SLA number is introduced. Zero-tolerance
integrity signals below have exact event thresholds.

| Signal                                                                                                                                  | Threshold                                                                                          | Owner                                                                 | Response                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Notice sent despite recorded off, wrong recipient/tenant, unauthorized scope or secret/private-field leak                               | Any confirmed occurrence                                                                           | Native document-request owner with P12/security and P6 incident owner | Stop the affected notice path, contain disclosure, preserve safe evidence/source grants, correct the owner boundary and require targeted regression proof before resuming.                        |
| Duplicate semantic intent, missing durable selected handoff, altered choice/material or replay appended omitted child                   | Any confirmed invariant violation                                                                  | Native source owner with P6 owner                                     | Quarantine affected recovery, reconcile exact source/intent truth, never regrant or blind resend; repair through governed operations and prove crash/race regression.                             |
| Indeterminate provider submission not reconciled, callback mapping contradiction or out-of-order truth regression                       | Any contradiction/regression; otherwise age exceeds the exact owner-approved reconciliation budget | P6 dispatch/provider integration owner                                | Preserve unknown evidence and frozen identity, pause affected adapter path where needed, reconcile exact attempt; no new-key replay after expiry.                                                 |
| Qualified queue age, dispatch saturation, per-tenant fairness or bounded-query budget exceeded                                          | Breach of the workload/queue/query budget recorded before activation                               | P6 operations owner with native source owner                          | Use existing throttling/incident repair, assess exact backlog eligibility, stop stale work, preserve grants and communicate actual notice status.                                                 |
| Material survives its qualified terminal/retention purge boundary or restore revives authority                                          | Any confirmed boundary violation                                                                   | P17 material/privacy owner with storage/platform owner                | Revoke decrypt/adapter authority, contain/purge under existing policy, correct restore/purge path and requalify; preserve body-free audit evidence.                                               |
| Staff reports or observed supported-user testing shows an unnoticed outward send, lost choice or inaccessible meaningful action/outcome | Any reproducible material finding                                                                  | Phase29 product/design and accessibility owner                        | Correct the integrated interaction and retest affected journeys; reconsider A versus B explicitly if the default remains misleading, without silently changing policy or adding blanket ceremony. |

## Recording and proof statement

This completed review contains all 22 requested categories, eight exact clauses,
18 falsifiable proof groups, eight journeys, nine lifecycle distinctions and
six operational controls. The compact feature ADR references this full package.
The record keeps Q01–Q20 ratified; **Q21 is unselected**.
All seventeen glossary terms remain unchanged.

No new product runtime suite, SQL/RLS execution, provider fault injection,
browser/AT or representative-user test was performed. Verification here is
current source/owner/primary-document review, concrete counterexample analysis,
independent owner/runtime/UX review and deterministic documentation checks.
Public product docs are not live authenticated product tests. The native seam
and the exact optional-recipient material posture remain explicit activation
gates. No inaccessible web result is used as evidence.

No product code, schema, provider, permission, secret, live message, commit or
PR was changed by this review. Existing user edits are preserved. Formal owner/
OpenSpec publication remains `/to-prd`; tickets remain `/to-issues`. Those
boundaries do not block recording this finished ratified grooming decision.

## Founder ratification — 2026-10-21

Conrad instructed: “Yes, ratify Q20 A with the required amendments. Record it
and move to the next question in this Phase 29 grill-with-docs session, with
the research, practical options, and your recommendation.”

This adopts the complete corrected decision, Q20-C01–C08, Q20-P01–P18,
eight journeys, nine lifecycle distinctions, six operational controls and
exact predecessor mapping without substantive change. No native implementation,
SQL/RLS/race/provider/browser/AT/user qualification or formal publication is
inferred. Q21 remains a separate unselected decision.
