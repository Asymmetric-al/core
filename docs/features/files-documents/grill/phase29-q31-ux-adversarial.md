# Phase 29 Q31 — UX and comparative adversarial review

**Recommended disposition: Accept with required amendments.** Conrad selected
Q31 A, default-On optional participant email with staff control. The selected
answer is authority; the amendment package is not yet ratified. Q01–Q30 and
twenty-two definitions remain intact. This note was researched 2026-10-22,
Asia/Bangkok, and changes no runtime, provider, canonical owner or private data.

## Judgment and strongest counterargument

A can support an intermittent participant who leaves after asking a question.
A small return cue can make the subsequent answer discoverable without requiring
staff to remember a separate communication. That is a reasoned product judgment,
not an observed Asym response-time or completion benefit.

The strongest counterargument is B, default Off with deliberate staff opt-in.
[GOV.UK's checkbox guidance](https://design-system.service.gov.uk/components/checkboxes/)
explicitly discourages preselection because users may overlook a question or
submit the wrong answer. It also recognizes a checkbox as suitable for toggling
one option. The guidance is direct counterevidence to A, not a standard endorsing
default-On email and not proof that A is a WCAG violation. A needs a visible,
understandable consequence and actual comprehension evidence. A prechecked box
hidden below the composer is insufficient. B retains the same delivery costs
while reducing inadvertent notices; its tradeoff is staff forgetting a useful
cue. C, native replies with a capable existing contact route, remains viable
where that operating model works. The selected A does not make either alternative
inherently poor design.

No actual ministry traffic, response rate, accessibility usability, mailbox
behavior or participant preference was measured. Native release qualification
must examine acknowledgments and already-contacted cases as well as useful
answers, rather than only demonstrate the success case that favors A.

## Fresh primary evidence

All pages below were reopened in this review on 2026-10-22. Dates are dates shown
by the page, not a claim that the product was tested on that date. Public help
documents establish documented behavior, not all configurations or user benefit.

| Source                                                                                                                                                                                                                                                                            | Documented behavior and bounded consequence                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GOV.UK Checkboxes](https://design-system.service.gov.uk/components/checkboxes/), no update date relied on                                                                                                                                                                        | Preselection is discouraged because it can be missed or produce an unintended answer. The selected A must therefore be visibly consequential and tested. Reuse Core components; do not import GOV.UK styling or imply universal applicability.                                                                    |
| [FileInvite client-message controls](https://help.fileinvite.com/edit-your-email-sms-messages-to-clients), no update date shown                                                                                                                                                   | Lists Message Reply Received and permits client Email/SMS notification controls and template preview. Does not establish a per-reply checkbox or its initial state. This is the non-`/articles/` edition; do not combine it with newer edition-specific portal behavior as one tested product.                    |
| [Submittable submitter notifications](https://submittable.help/en/articles/4926006-what-notifications-should-i-expect-to-receive-from-submittable-as-a-submitter), December 29, 2023                                                                                              | Organization replies are ordinary notification events; submitters can disable ordinary email and are advised to check platform activity. Supports awareness alongside an email-off path. Its account-level preference is not Core's staff choice or authority for a new preference center.                        |
| [Content Snare Publish & Send](https://contentsnare.com/help/knowledge-base/step-5-publish-send/), September 23, 2024                                                                                                                                                             | Separates no automatic reminders from no client messages; the latter leaves communication, including the request link, to the sender. A preview makes configured communications visible. This supports explicit controls and C's operational responsibility, not every-reply automatic mail.                      |
| [Content Snare FAQ](https://contentsnare.com/help/knowledge-base/reminders-faq/), September 23, 2025                                                                                                                                                                              | No-client-email needs manual follow-through; spam and hard-bounce suppression are distinct delivery issues. Do not equate a posted reply or queued notice with receipt. Core must use its own protected contact/recovery path rather than copy a URL indiscriminately.                                            |
| [W3C Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)                                                                                                                                                                             | Optional inputs also need labels/instructions. The visible label and appropriate programmatic association are separate obligations. A checkbox must explain the email consequence rather than merely say Notify.                                                                                                  |
| [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) and [Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)                                                                                         | Important result/error updates need text and appropriate programmatic presentation without unnecessary focus disruption. Provide understandable native-post and notice outcomes, not color-only icons or a disappearing success toast. Not every background provider event deserves an interruptive announcement. |
| [W3C Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)                                                                                                                                                                                           | Avoid requiring information again in the same process unless an applicable exception holds. The criterion does not require cross-session storage. Preserve permitted draft/choice during recovery without inventing an offline sensitive draft cache or preserving revoked content.                               |
| [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), and [Focus Not Obscured Minimum](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | Qualify actual 320-CSS-pixel reflow, applicable target size/spacing and non-obscured keyboard controls. Test the composed composer, choice, status and return route; an accessible primitive alone is insufficient. Respect each criterion's actual exceptions rather than asserting an unconditional pixel rule. |
| [W3C Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)                                                                                                                                                                                       | Timed interactions require applicable conformance analysis. A security label alone does not establish an exemption. Neither its exceptions nor examples create a new document-access grace period, material-retention number or automatic clock extension.                                                        |

The W3C Understanding pages are informative explanations of their linked success
criteria. They do not certify this composed interface. Earlier Content Snare
Schedules text describes an initial-only no-reminders option, while Publish &
Send mentions initial/rejected-field notifications. Rely only on the supported
separation from all-message Off, not an exact cross-guide event list. Broader
Submittable body delivery and email-reply ingestion need their own contracts;
they do not justify adding either to this minimal cue.

## Material findings and amendments

Severity is impact if the safeguard is omitted; likelihood is qualitative
exposure, not an observed rate. All are amendable within A's intended scope.
U/UP identifiers are this independent review's trace keys for consolidation.

| Finding                                                                                                                                                           | Severity / likelihood                                            | Exact necessary amendment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Proof            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| UX01 — An overlooked preselected checkbox sends an unexpected external cue. A hidden destination or generic Notify label disguises the consequence.               | High / plausible, directly supported by checkbox counterguidance | **U01:** Initialize a visible eligible per-reply choice On only for a genuinely new reply. Explain recipient, channel, minimal content and effect beside the existing deliberate action. Missing/legacy/ambiguous input is not On. Keep staff Off through validation/recovery; do not reset it on rerender, refresh or an asynchronous eligibility response. A known eligibility loss cannot silently change the reviewed action.                                                                                                                        | UP01, UP02, UP12 |
| UX02 — Native sharing is mistaken for email transmission, or a late failure makes staff post the answer twice.                                                    | High / likely without distinct states                            | **U02:** Preserve one native reply and exact notice intent. Clearly distinguish not requested, requested but blocked, preparing/queued, submitted/accepted, delivered when proved, failed and uncertain. Show a concise meaningful summary in the source and supported details where needed; do not expose a giant technical state menu. Recover the original effect, never a new reply to retry mail. Neither a click nor delivery means read, understood, resolved or fulfilled.                                                                       | UP03, UP04       |
| UX03 — A selected Share+email action silently degrades to reply-only when destination or eligibility changes.                                                     | High / plausible                                                 | **U03:** Before authoritative admission, material known recipient/destination/eligibility change or unproved required combined-intent admission requires an inline explanation and deliberate lawful reply-only recovery where supported. Do not add a routine confirmation modal. Delay with a valid authorized durable path may proceed. After source commit preserve success, original On intent and recoverable original-boundary handoff; blocked/failed/unknown is not staff Off. Unknown proof is not zero or permission to use today's settings. | UP02, UP03, UP05 |
| UX04 — Minimal-looking mail leaks a missionary relationship, sensitive label or quoted answer through subject, preview, sender, link, template variables or logs. | Critical / plausible                                             | **U04:** Source-approved minimal notice excludes reply bodies/excerpts, filenames, evidence, private notes, sensitive request/item labels and attachments in all carrier surfaces. Authorize even neutral organization/relationship cues. Keep protected action material confined to its actual approved carrier; body-free history/telemetry and authorized Recent-copy/disposition rules remain. Tenant template flexibility cannot enable forbidden variables or grant evidence access.                                                               | UP06, UP07       |
| UX05 — Reply notice invites an unavailable action after access ends, or the email itself is treated as renewed access.                                            | High / plausible                                                 | **U05:** Recheck actual recipient, current sharing/access, useful action and applicable suppression after waits at preparation/submission/use boundaries. Expired/closed/revoked/restricted context cannot promise a readable reply. Suppress inapplicable mail; an independently qualified useful help variant is not automatic. Preserve in-flight truth and the current truthful protected-entry/help outcome. No clock reset, reopened work or completed-message archive.                                                                            | UP05, UP08       |
| UX06 — Staff bypass a wrong/missing/suppressed contact with a freeform address or disclose sensitive account facts in an error.                                   | Critical / plausible                                             | **U06:** Show only an authorized source-derived destination summary. Wrong contact uses the existing source/identity correction route with its actual permission; no inline arbitrary To/CC or bypass. Explain missing/blocked mail safely without revealing another person's contact or sensitive suppression reason. Correction or re-enabling does not replay historical mail or retarget an old occurrence. Native work remains usable.                                                                                                              | UP02, UP06, UP09 |
| UX07 — Tenant control looks flexible but is hard-coded, creates a new settings system, or falsely promises that Off recalls email.                                | High / plausible                                                 | **U07:** Use the existing bounded System Messages/Delivery Plan surface, actual scope, permitted content/locale/sender/reply controls and whole-plan publication. Show the exact audience and email step; administration does not grant private content access. Separate tenant enablement, per-reply choice and recipient/source/delivery restrictions. Explicitly state the selected Q31 pending-work Off rule and prospective On behavior; no revival of old work or recall claim. No invented channels/subscribers.                                  | UP07, UP09, UP10 |
| UX08 — Participant assumes notification-email replies are ingested; delivery creates a second conversation or unsafe manual workaround.                           | High / plausible                                                 | **U08:** Make the native request the place to read/respond. No email-reply ingestion, automatic Support conversation or body-copy fallback follows. Where mail replies are not supported, the approved notice must say so and offer its existing protected route/help. Safe provider reply-address configuration must agree with that copy. Do not fabricate a no-reply or monitored-mailbox claim without the actual contract.                                                                                                                          | UP06, UP08, UP11 |
| UX09 — Mobile or assistive technology hides the checkbox, changes focus, loses the choice, or accidentally sends during text composition.                         | High / likely without composed proof                             | **U09:** Use existing shared Base UI/base-maia controls, visible labels, programmatic state/association and understandable persistent status. Preserve Q30 multiline/IME behavior, focus/reading position and permitted input on recoverable failure. Qualify keyboard, screen reader, touch, zoom/reflow, target spacing, focus visibility, RTL/non-Latin/long names and translated text. No mandatory third pane, new account form or private offline cache.                                                                                           | UP04, UP12, UP13 |
| UX10 — Repeated acknowledgments flood mail; an automatic suppression/digest grows into a hidden product policy.                                                   | Medium–High / plausible                                          | **U10:** Keep the deliberate per-reply Off and real bounded tenant control. Do not infer unreadness/presence, debounce multiple replies, merge messages, add reminders or re-notify because evidence changes. Distinct genuine replies retain distinct source meaning; retries do not. Measure undesirable notice volume before adding another policy; transport batching is not product coalescing.                                                                                                                                                     | UP01, UP03, UP14 |
| UX11 — Email Off or delivery failure makes native clarification invisible or becomes a completion gate.                                                           | High / plausible                                                 | **U11:** Preserve Q30 native shared context, source work and capable help/recovery independently. Q31 mail is supplementary awareness, not review evidence, fulfillment, permission, human acknowledgment or a required notification/read predicate. Keep incoming staff clarification notices unselected.                                                                                                                                                                                                                                               | UP08, UP11, UP14 |
| UX12 — A polished happy-path screenshot or a vendor's marketing outcome substitutes for actual user qualification.                                                | High / likely without explicit gates                             | **U12:** Require representative participant/staff/admin composed journeys, actual role/locale/device and failure coverage, measured finite operational budgets and supported repair. State actual results and limitations; no inferred ministry usage, SLA, read rate or universal default-On best practice. Failure signals trigger scoped repair, not a new contact channel or changed access rule.                                                                                                                                                    | UP01–UP14        |

## Useful interaction and copy

Recommended starting copy for usability testing, not a frozen new design system:

- Composer heading: **Reply to the request recipient**. Label the text area
  **Reply** and make the item context and outward audience clear.
- Keep one established source action, such as **Share reply**. Immediately beside
  it, show the eligible selected checkbox **Email the request recipient about
  this reply**. The choice must be reachable and understood before acting; a
  generic Send button with the checkbox out of view is inadequate.
- Short helper: **The email links to the request. It does not include your reply.**
  Show **To: [authorized destination summary]** only under current disclosure
  authority. Do not require an additional preview/confirmation on every reply.
- When staff turn it Off: **The reply will be available in the request; no email
  will be requested.** Do not imply permanent future access.
- Known mail unavailability: **Email is unavailable for this reply. You can still
  share the reply in the request.** A deliberate source-permitted reply-only
  action remains available after the cause is understood. Give a safe specific
  reason when authorized; never invite an address override.
- After commit: **Reply shared. Email notice queued.** Use that second sentence
  only if queued is true. Otherwise use **No email requested**, **Email notice
  blocked**, **Email could not be sent**, or **Email status is being checked**
  according to the evidence. Do not show **Email sent** at enqueue or **Failed**
  when the provider outcome is unknown.

If the source's established action uses different tested vocabulary, preserve
consistency while meeting the same meaning. Dynamically changing the button can
also work if tested, but must not imply that clicking guarantees email delivery
or disrupt accessible names/focus. No second compulsory choice, extra approval
or routine confirmation is required to compensate for a poorly explained
default. Staff internal-note and outward-reply composers remain distinct.

Illustrative notice copy, subject to the exact source's permitted identity and
protected-action contract: **There is a reply in your document request. Open the
request to view it.** Use a descriptive action such as **Open request**. This
text is lawful only while the source qualifies that promise. It is not a generic
post-expiry help variant. Do not copy sensitive details into the email to make
an expired notice useful. Any unsupported email-reply behavior must be explained
using the actual contract, for example **Please reply in the request** when true.

## Complete practical journeys

Names below are illustrative; none represents observed ministry behavior.

| Journey                                                                      | Required observable experience                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| J01 — Nora asks before her first upload and leaves                           | Elena can share an eligible answer with an optional return cue; no fake file or review event is needed.                                                                                                                                                |
| J02 — Nora is already speaking to Elena                                      | Elena turns off this reply's cue without losing the answer or creating a second workflow. The choice survives validation.                                                                                                                              |
| J03 — Brief acknowledgment or rapid exchange                                 | A visible Off remains useful; no inferred online/read suppression, mandatory delay or automatic digest.                                                                                                                                                |
| J04 — Default not understood                                                 | Representative staff can explain who sees the native reply, who is emailed and what is omitted before acting. If they cannot, repair the interaction; do not claim default-On qualification.                                                           |
| J05 — Tenant administrator disables the step                                 | Staff see the effective unavailable state. No checked box overrides it. Admin sees the exact event/audience and correct pending/in-flight policy, without private message access.                                                                      |
| J06 — Authorized administrator edits a permitted template or locale          | Preview uses approved facts; forbidden reply/file/sensitive placeholders remain unavailable. Other event meanings and native reply truth are unchanged.                                                                                                |
| J07 — Recipient preference, suppression or missing contact blocks email      | Native lawful work remains; authorized staff see a truthful safe reason and the actual permitted repair/help route. No synthetic account or freeform recipient fallback.                                                                               |
| J08 — Email address is wrong or changes while composing                      | Staff use source-owned contact correction. A material destination change cannot silently receive the already-reviewed intent; old occurrence does not gain a new target.                                                                               |
| J09 — Staff turns Off and then changes text or retries                       | The reviewed Off remains Off. A rerender, locale change or delayed eligibility response does not reset it. A separate new reply gets its own eligible initial choice.                                                                                  |
| J10 — Native post succeeds but refresh times out                             | Recover the same reply and notice status. Do not reopen a blank composer as if nothing happened or ask for another send.                                                                                                                               |
| J11 — Email is delayed, failed or uncertain after success                    | Native reply stays shared. Staff can inspect or use supported repair without reposting text; unsure provider outcome is not safely resendable.                                                                                                         |
| J12 — Source access expires or request completes before dispatch             | No false readable-answer promise and no automatic fresh-access grant. Admitted staff handling remains owned; only independently qualified help can be offered.                                                                                         |
| J13 — Access ends after mail is in flight, before click                      | Email history remains truthful; the protected entry gives current limited access/help. No recall promise, old conversation exposure or clock extension.                                                                                                |
| J14 — Nora returns while email is Off                                        | The currently authorized shared answer is available; no extra inbox, bell, unread gate or mail dependence.                                                                                                                                             |
| J15 — Sensitive missionary/care context                                      | Authorized participants see only the source-permitted exchange. Email subject/preview/body/sender/links and ordinary diagnostics expose no prohibited context; even neutral relationship cues need authority.                                          |
| J16 — New recipient, changed purpose, revoked staff or shared-device context | Stale drafts, destination summaries and response payloads are fenced; no previous-recipient history, leaked private draft or permission inherited from mail possession.                                                                                |
| J17 — Narrow/mobile/zoom/screen-reader/keyboard/IME/RTL                      | Read the answer, understand checkbox state, act deliberately and discover both outcomes. No clipped names, hidden action, focus trap, Enter/IME accidental send or color-only error.                                                                   |
| J18 — Low bandwidth, intermittent network or reauthentication                | Keep permitted draft/choice/focus; distinguish no receipt from unknown receipt. No automatic reconnect-send or unsafe cross-session/offline private storage.                                                                                           |
| J19 — Email images blocked, plain-text client or long localized text         | Sender/action remain understandable, sensitive meaning is not hidden in previews, links are descriptive and supported rendering remains usable. The notice must not require a tracking image, attachment or remote font to understand the next action. |
| J20 — Staff/admin lacks unrelated permission                                 | Reply, contact correction, delivery repair and tenant configuration remain distinct actions. Explain only allowed next steps; no configuration role gains evidence access.                                                                             |

## Falsifiable proof matrix

These are future native qualification requirements, not checks performed here.

| Proof | Observable pass condition                                                                                                                                                                                                                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UP01  | Representative staff identify selected/Off cue, recipient, channel and omitted content in normal, already-contacted, acknowledgment and sensitive cases without coaching. Record actual comprehension and task outcomes; no invented universal success percentage.                                                                                      |
| UP02  | Default On only on fresh genuinely eligible reply; explicit Off survives edit/validation/locale/refresh/retry and delayed responses. Legacy/missing/ambiguous input, unavailable tenant/contact and current destination changes never silently become On or another recipient.                                                                          |
| UP03  | Double tap, repeated click, lost response, original Off, native success plus mail failure and provider uncertainty recover one native occurrence and original notice intent. Distinct genuine equal-text replies remain distinct; no automatic historical catch-up after settings change.                                                               |
| UP04  | Screen reader and visual users can find durable post/notice outcome, understand requested-but-blocked versus Off, and recover without duplicate posting. Programmatic announcements do not repeatedly interrupt typing or seize focus for every transport event.                                                                                        |
| UP05  | Both orders of tenant disablement/current eligibility loss, recipient change, closure and expiry around source admission and provider submission preserve the actual chosen intent, permitted native result, original-boundary handoff and current useful-action check.                                                                                 |
| UP06  | Negative content fixtures containing private names/locations, care details, filenames, quotes, URLs and attachments remain absent from notice subject/preview/body/link labels/metadata and ordinary logs/history. Authorized destination display is scoped. Qualified protected material is tested in its actual carrier rather than stripped blindly. |
| UP07  | A tenant administrator can inspect and modify only qualified notice settings using existing surfaces, see effective state, and preview safe content without reading private replies. Per-reply staff cannot override tenant settings; sender/locale/reply behavior matches the qualified contract.                                                      |
| UP08  | Expired/closed/revoked/current-recipient-changed notice before dispatch is stopped or uses only a separately qualified useful variant. After in-flight mail, a current doorway denies unavailable text and offers the real authorized help path. Native email-Off return works while current access permits it.                                         |
| UP09  | Missing, wrong, bounced or preference-restricted contact yields safe distinct handling; permitted correction route works without arbitrary To/CC, synthetic identity or suppression override. Later repair does not retarget/revive old occurrences.                                                                                                    |
| UP10  | Tenant Off publication and subsequent On show accurate prospective and pending/in-flight effects. No old reply receives mail because configuration, template, roster or provider state changed. Actual exact Off semantics come from the ratified Q31 owner amendment.                                                                                  |
| UP11  | Replying to the notice does not silently create native clarification/Support intake. Native source work persists with all email outcomes, and mail/read/click never accepts evidence or gates Q22 completion. Copy and real configured reply route agree.                                                                                               |
| UP12  | Actual desktop and mobile/320-CSS-pixel reflow, text zoom, touch/target-spacing, keyboard/AT/focus, non-Latin/RTL/long names, IME and localized copy preserve comprehensible choice/action/outcome and source-context return. Test the complete interaction, not only isolated UI primitives.                                                           |
| UP13  | Slow/offline/timeout/re-authentication/known loss-of-scope fixtures preserve only permitted input and actual state; distinguish no receipt from uncertain receipt. No automatic resend, cross-audience draft transfer or unsafe persistence. Applicable timing and redundant-entry requirements are analyzed without changing source clocks.            |
| UP14  | Pilot and operation measure actual source visibility, unwanted/repeated mail reports, missed-awareness reports, comprehension and supported repair under declared finite workload budgets. Do not use open/click/dwell as proof of understanding, log private bodies or invent an SLA.                                                                  |

## Proportionate follow-through

The permanent fix is one trustworthy source action, a visible eligible optional
cue, minimal source-authorized mail, honest independent outcomes and a capable
existing repair route. It is not a new notification center, personal preference
platform, chat product, routing designer, global mail retry button, read tracking,
automatic reminder/digest or full Workflow Studio requirement.

Before activation bind accountable owners for unwanted-notice reports, wrong-
audience/sensitive-content disclosure, inaccessible controls, source-success/mail-
status mismatch, stuck handoffs and misleading expired links. A confirmed wrong
audience or protected-content disclosure requires scoped stop and correction;
operational monitoring cannot replace preventive authorization. Performance and
response budgets must be measured and named; this note invents no cap or SLA.

Reviewed the selected Q31 question and retained Q30/Q26/Q27 boundaries from the
current canonical records and prior owner research. This is a scoped UX and
evidence review, not a new whole-repository audit. No browser/AT/intended-user,
runtime, SQL/RLS, provider submission or race test was executed. No actual mail
or private-data access occurred. Only this note was written. Full consolidated
review remains to be checked when supplied by the coordinator.

## Independent consolidated-review closure — 2026-10-22

Read the complete `work/phase29-q31-adversarial-review.md`, all sections and
tables, and `work/phase29-q31-decision.md`. **No substantive UX, missing-journey,
evidence-precision or option-fairness finding remains.** The full selected-answer
review is suitable to present for ratification of its required amendments; this
is not native implementation or release approval.

The consolidated C01–C12/P01–P24 cover this note's U01–U12/UP01–UP14. In
particular, eligible fresh default-On and retained deliberate Off are explicit;
known pre-admission changes require honest inline recovery; source success and
original notice intent survive later mail failure; safe content includes all
carrier surfaces; native conversation remains independent. The administrator,
contact-error, sensitive-context, expired-before-dispatch, expired-before-click,
native email-Off, shared-device, low-bandwidth, keyboard/AT/IME/reflow and
plain-text/images-blocked mail journeys remain covered after consolidation into
eighteen journeys. The source action has a visible adjacent consequence without
a mandatory second approval or new settings platform.

GOV.UK preselection counterevidence and B's advantage are stated fairly. The
report makes no empirical claim that A is universally superior, that recipients
read email, or that any ministry usage was observed. Severity is conditional
impact and likelihood is qualitative rather than a claimed incident rate. The
copy/actual Reply-To requirement avoids both invented email ingestion and an
unverified claim about whether a mailbox is monitored.

Freshly opened the report's exact [FileInvite portal-messaging guide](https://help.fileinvite.com/messaging-in-the-client-portal)
in the non-`/articles/` knowledge base. It documents native message views and
email awareness when messages are sent, supporting the report's limited claim.
The report retains the edition/default caveat and does not import its audience,
body-copy or automatic-every-message behavior as Core policy.

A deterministic text extraction confirmed the ADR's selected-decision body
matches the report's exact corrected decision, including explicit enablement
of the optional email step in the qualified default. The rest of the ADR
incorporates the full clauses/proof and preserves awaiting-ratification status,
unchanged twenty-two definitions and the later publication/implementation stages.
This text agreement is a documentation check only. No runtime, provider,
SQL/RLS, browser/AT or intended-user verification occurred during closure.
