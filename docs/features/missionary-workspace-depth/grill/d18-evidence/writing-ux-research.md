# D18 optional newsletter writing assistance — primary UX evidence

Research date: **2026-10-16 UTC**. The founder selected optional newsletter
writing help, with tenant-selected AI API credentials and limits, optional use
by both tenant and missionary, restrained voice-preserving suggestions, and
spelling/grammar, selected rephrasing, more compelling wording, simplification,
lengthening and shortening. This note recommends a bounded experience; it does
not ratify the engineering contract or demonstrate shipped capability.

No provider calls, credentials, real newsletter text, authenticated vendor
accounts, live sends, application changes or new dependencies were used. Public
help pages establish **documented behavior**, not observed authenticated behavior,
measured quality, accessibility conformance or missionary research findings.
Undated pages below were read on the research date; crawl dates are not product
release dates. Training, marketing, beta and platform limits are distinguished.

## Practical recommendation

Put a quiet **Writing help** action in the existing newsletter editor. The author
selects eligible text, chooses one of the six requested transformations, reviews
one suggestion against the original and chooses **Use suggestion** or **Discard**.
The manual editor remains complete. Accepting wording changes only the ordinary
draft; it does not choose recipients, approve an issue, schedule or send it.

Use quick actions first. They express the requested scope with less prompting
work and less ambiguity than an empty chat box. A bounded **Describe a change**
option under **More**, if separately qualified for the same exact source, can
cover precise refinements. It is not necessary to satisfy the six selected
actions, and it must not become an agent, retrieval interface, factual research
tool or tenant-authored system-prompt editor.

Preserving voice is an instruction and a quality bar, **not a guarantee that a
model cannot change meaning**. The eligible selected prose provides the style
reference. Do not require missionaries to train a voice profile, upload old
letters, connect an inbox or choose a model before receiving useful help.

## Core constraints and existing owners

The [Q18 frontier](../phase28-q18-newsletter-writing-assistance-research.md)
distinguishes this newsletter target from already accepted Public Page assistance.
[ADR-0133](../../../../adr/0133-source-bounded-public-page-writing-assistance.md)
provides an important existing pattern: source-bounded suggestions, comparison,
explicit application, current authority and a complete manual path. Its Page
action catalog, translation scope, lifetime and publication rules are **not
automatically newsletter policy**.

[ADR-0099](../../../../adr/0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
already owns the purpose-routed tenant AI foundation: provider connections,
credentials, model/region qualification, egress, invocation evidence, budget,
revocation and manual fallback. Reuse its **Settings → AI features** pattern;
do not add a newsletter key store, missionary model marketplace or second usage
ledger. Possessing a key does not authorize an actor or classify content as safe.

The [founder brief](../phase28-founder-brief.md) prohibits private/care context,
invented stories/commitments and autonomous supporter contact. D7 retains human
per-issue sending authority. Selecting text does not declassify it; newsletter
text, private prospect notes, donor histories, imports and D15 email bodies are
different sources. Current permission, exact source eligibility and target
revision still require owner enforcement at request and application.

The repository's [UI contract](../../../../../packages/ui/AGENTS.md) and
[component configuration](../../../../../packages/ui/components.json) require
exact base-maia/Base UI, Zinc semantic tokens and shared components. The
[accessibility-review skill](../../../../ai/skills/accessibility-review/SKILL.md)
was read to frame the verification plan. It calls for manual keyboard/focus
checks alongside automated checks; no UI conformance test was performed here.

## Primary comparator ledger

**D** means official documented procedure; **M** means a product claim;
**T** means training advice. All were read on 2026-10-16. No vendor is proposed as
a dependency, and vendor availability/limits are not Asym entitlements.

| ID                              | Primary source / stated date                                                                                                                                | Documented pattern                                                                                                                                                                                                                                        | Useful lesson and exact limit                                                                                                                                                                                                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W01 — Google Docs               | D: [Improve and polish writing](https://support.google.com/a/users/answer/14512929?hl=en), undated                                                          | Select content, request a rewrite, review/refine, then insert below or replace the original.                                                                                                                                                              | Strong support for contextual work and an explicit acceptance boundary. It does not establish a semantic-diff guarantee or proof that every rewrite preserves meaning.                                                                                                                                   |
| W02 — Gmail desktop             | D: [Draft emails with Gemini](https://support.google.com/mail/answer/13955415?co=GENIE.Platform%3DDesktop&hl=en), undated                                   | Help me write offers draft refinement and undo/redo between drafts. **Current documentation says it proactively uses details from other emails and Drive files** for personalization.                                                                     | Use the review/recovery pattern, not the context expansion. The selected-source claim would be false if Core silently copied this retrieval behavior. Eligible plans/languages apply.                                                                                                                    |
| W03 — Gmail phone               | D: [Android Help me write](https://support.google.com/mail/answer/13955415?co=GENIE.Platform%3DAndroid&hl=en), undated                                      | Refine offers Polish, Formalize, Elaborate and Shorten; author reviews and taps Replace. New drafting has a separate Insert action.                                                                                                                       | Shows small action menus can work on a phone. It does not prove Asym selection preservation, screen-reader behavior or review usability. Gmail's draft-wide refinements do not authorize silently widening an Asym selection.                                                                            |
| W04 — Microsoft Word            | D: [Edit content and rewrite](https://support.microsoft.com/en-us/word/copilot/edit-rewrite-content), undated                                               | Select text, invoke Copilot through a mini toolbar/document control, request Auto Rewrite or describe a change, review, then replace or insert below.                                                                                                     | Supports selection plus optional instruction. Formatting, images and broader document operations listed on the page are outside the selected newsletter text job.                                                                                                                                        |
| W05 — Word accessibility        | D: [Use Copilot in Word with a screen reader](https://support.microsoft.com/en-gb/accessibility/copilot/use-copilot-in-word-with-a-screen-reader), undated  | Documents keyboard text selection, invocation, reading generated suggestions, navigation to Replace/Insert, and regeneration. Drafting also has Stop/Discard controls.                                                                                    | Strong concrete comparator for a complete non-pointer path. Desktop Word shortcuts and usually-three suggestions are product details, not Core requirements or evidence that three alternatives improve usability.                                                                                       |
| W06 — Grammarly on-demand help  | D/M: [Introducing generative AI assistance](https://support.grammarly.com/hc/en-us/articles/14528857014285-Introducing-generative-AI-assistance), undated   | Selected text exposes a contextual icon/sidebar and rewrite options; users can supply an instruction. Authenticity/productivity wording is a vendor claim.                                                                                                | Supports on-demand editing. Do not equate an attractive suggestion or vendor agency claim with measured correctness, author satisfaction or preserved missionary voice.                                                                                                                                  |
| W07 — Grammarly voice           | D/M: [View and customize your voice profile](https://support.grammarly.com/hc/en-us/articles/23153676821773-View-and-customize-your-voice-profile), undated | A voice profile is continuously derived from writing, with separate message/document profiles; the author can adjust elements and invoke a voice rewrite. Listed voice surfaces are Windows, Mac and Chrome, with eligible paid plans.                    | Demonstrates that voice can be made visible and correctable. **Do not adopt continuous history collection** merely to promise a personal voice. No general mobile voice-parity claim is established by this page.                                                                                        |
| W08 — Notion                    | D: [Notion AI for notes and docs](https://www.notion.com/help/guides/notion-ai-for-docs), undated                                                           | Highlight text, choose Edit with AI, request grammar/length/tone changes, then accept, discard or try again. The same guide also describes workspace-wide Agent behavior.                                                                                 | The inline flow is a useful comparator. Workspace searches, connected tools, open-ended agents and new-page generation are separate capabilities, not prerequisites for a small writing aid.                                                                                                             |
| W09 — Mailchimp                 | D/beta: [Use Write with AI](https://mailchimp.com/help/write-with-ai/), undated                                                                             | Existing text exposes editing actions for length, tone, spelling/grammar and custom instructions; generated suggestions are reviewed before addition. The page still labels access **beta**, Standard-or-higher, and limited primary-address geographies. | Closest email-builder comparator for the requested action catalog. Do not claim universal availability, proven fundraising effectiveness or copy its unrestricted creative prompt. Its rules and product packaging do not become Core policy.                                                            |
| W10 — HubSpot                   | D: [Generate and refine content with AI](https://knowledge.hubspot.com/website-pages/generate-content-with-breeze), updated **2026-09-10**                  | Highlight text, choose Rewrite/Expand/Shorten/tone or another request, review in a panel and Replace. Content language and AI access/data settings are explicit.                                                                                          | Supports quick actions with optional refinement and current availability controls. Its documented CRM/conversation/files access switches and broader content generation must not be imported into Core's minimal newsletter egress scope. Numeric vendor request limits are not Core limits.             |
| W11 — Apple phone writing tools | D: [Writing Tools on iPhone](https://support.apple.com/guide/iphone/writing-tools-write-improve-summarize-iph6f08da1d2/ios), undated current guide          | Selected text can be proofread/rewritten or receive a described change; the guide describes returning to the original for generated composition. Current page also links a distinct Siri AI beta.                                                         | Useful evidence for phone-native contextual assistance and recovery. Do not conflate Writing Tools, Siri beta and the ChatGPT extension, or assert all-device/language availability. No new operating-system integration is needed for Core.                                                             |
| W12 — Epistle / missionary use  | T: [MPD and AI workshop](https://www.epistle.org/srlc/workshop/), no reliable visible article date                                                          | Teaches using writing examples for voice, asks for newsletter improvements before rewriting, and includes a prompt explicitly telling AI not to invent facts. Other exercises use personal/donor background.                                              | Establishes a real published missionary writing-help use case, not measured user need or a shipped in-editor assistant. Family/location/donor-context examples are **not approved Core inputs**. No imported theological template, fundraising-pressure tactic or full voice-file workflow is warranted. |

The strongest transferable pattern is **select → request → review → accept or
discard**, documented across W01/W04/W08/W10. Review does not imply that every
vendor implements an inline redline or safe concurrent editing. Those must be
designed and proved for Core. No authenticated editor, mobile app, beta feature
or provider quality was exercised in this research.

## Six quick actions, with restrained meanings

Names are proposed UI copy; the founder selected these capabilities, not these
exact labels. Every action operates only on the displayed eligible source.

| Action                     | Intended change                                                                                                 | What the suggestion must not silently do                                                                                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fix spelling & grammar** | Correct errors with the smallest necessary changes. Preserve dialect and intentional wording where supported.   | Rewrite the voice, Americanize all spelling, alter names/ministry terms, paraphrase quotations or strengthen a factual assertion. Uncertain terminology should remain for the author to review.                             |
| **Rephrase**               | Offer another way to express the same meaning for the selected passage.                                         | Add new events, participant details, theology, numbers, quotations or new calls to action.                                                                                                                                  |
| **Make more compelling**   | Improve clarity, concrete expression and engagement using existing assertions; retain the author's style.       | Exaggerate impact, manufacture emotional testimony or urgency, add guilt/pressure, invent needs/results/promises, or optimize against a donor profile. This action is not a fundraising-effectiveness guarantee.            |
| **Simplify**               | Reduce unnecessary complexity while preserving intended meaning and qualifications.                             | Remove negation, caveats or uncertainty; replace a theological/cultural term with a materially different claim; treat simpler English as universally more correct.                                                          |
| **Lengthen**               | Make the existing idea easier to follow through fuller phrasing or explanation already supported by the source. | Invent scenes, dialogue, examples, metrics or events merely to reach a target length. If there is insufficient material, return an honest no-useful-expansion result or invite the author to add facts in the manual draft. |
| **Shorten**                | Condense while keeping the main meaning and important qualifications.                                           | Drop safety-sensitive context, change attribution, remove a necessary caveat, or alter quoted/linked content. A shorter draft is not necessarily more accurate.                                                             |

Not every potential meaning change can be caught deterministically. Protect
known semantic objects such as links, merge fields and structural tokens; assess
names, numbers, negation, quotations, Scripture, culturally specific terms and
uncertainty in representative human evaluation. The UI must say **Suggestion**,
not **Verified**, **Correct**, or **Improved** as a factual certification.

## Recommended minimal journeys

| Actor / situation                      | Experience                                                                                                                                                                                               | Important boundary                                                                                                                                                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorized tenant administrator        | Configure the existing newsletter-writing AI purpose in shared AI settings: enabled state, qualified provider/model/region, write-only key handling, actual limits/usage and readiness.                  | Reuse the shared control plane. No prompt builder, new key store, model marketplace or six separate role switches. Provider configured, purpose ready and a particular actor authorized are different states.                                       |
| Missionary chooses whether to use help | A discoverable preference controls optional writing help when the tenant permits it. An enabled feature remains quiet until requested.                                                                   | Tenant enablement is not background scanning. Personal choice does not override tenant restrictions or unlock prohibited source content. No repeated consent wizard for every eligible sentence.                                                    |
| Author edits a selected passage        | Invoke Writing help through an ordinary keyboard-reachable editor control or contextual selection action; choose an action. Show the exact source passage and actual data-use explanation before egress. | Opening the action menu must not lose or broaden the selection. Do not use a hover-only icon or make a precise pointer selection the only route; an explicit whole-block target may serve the keyboard/phone path if owner-qualified.               |
| Suggestion is ready                    | Show **Original** and **Suggestion**, with **Use suggestion**, **Discard**, and a secondary explicit **Try another** only when permitted.                                                                | One initial result is sufficient. Do not spend extra budget generating three variants automatically or apply text as it streams. Comparison is original text versus exact proposed text, not an AI-written claim that it kept everything important. |
| Author accepts                         | Apply to the exact still-current semantic target as one ordinary draft edit; return focus/caret sensibly and expose normal editor Undo/revision recovery.                                                | No new approval queue or second composer. Save uncertainty must be resolved from the existing operation; a lost response is not a reason for another application.                                                                                   |
| Author declines or help is unavailable | Dismiss the suggestion and continue manual writing with the original intact.                                                                                                                             | Discard/Stop can prevent local use without proving a provider never received or billed for a request. Do not describe cancellation as erasing remote data.                                                                                          |
| Newsletter is sent later               | Continue D7's ordinary review and per-issue send journey.                                                                                                                                                | Accepting a suggestion never counts as issue approval, recipient authorization, scheduling, delivery or a public post.                                                                                                                              |

For a paragraph, both original and suggestion can be immediately readable.
On a phone, stack the two labeled regions; avoid narrow side-by-side columns.
An accessible **Show changes** option can aid review if a reliable comparison is
available. Do not require an elaborate track-changes application, force the
author to accept every punctuation change, or hide the original behind a
fleeting animation. Inline differences cannot rely on red/green alone.

Keep default authoring guidance short: **“Review the wording before using it.”**
Provide progressive detail about names, numbers, quotations and meaning rather
than a wall of repeated warnings. No claim of legal/privacy safety follows from
BYOK. Source disclosure must name the actual configured provider and actual
eligible inputs; do not display “Only selected text is sent” if additional
context, instructions or metadata are in fact transmitted.

## State and copy precision

These are proposed examples conditional on verified state, not implementation
strings to copy without the owning contract.

| State                                        | Useful copy / control                                                                                                                                                                              | Avoid                                                                                                                                                                        |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nothing eligible selected                    | **“Select the text you'd like help with.”** Offer an explicit current-block route only if supported.                                                                                               | Quietly sending the entire newsletter or silently switching the task.                                                                                                        |
| Personal feature off                         | Keep ordinary editing clean; expose the opt-in in an appropriate preference.                                                                                                                       | Inert AI controls everywhere or pressure to enable AI to finish a newsletter.                                                                                                |
| Tenant disabled / not available              | **“Writing help isn't available for this organization.”** Manual editing continues; a settings link appears only for authorized admins.                                                            | Displaying secret configuration, provider credentials, or a universal enable action.                                                                                         |
| Generating                                   | **“Preparing a suggestion…”** Keep the source unchanged; offer stop/dismiss where the real lifecycle supports it.                                                                                  | Token-by-token assertive announcements, blocking the whole editor, or automatic regeneration on a slow response.                                                             |
| No useful change                             | **“No changes suggested.”** Keep the original; optionally choose another action.                                                                                                                   | Presenting identical text as a major improvement or generating variants indefinitely.                                                                                        |
| Ready                                        | **Original / Suggestion**; **Use suggestion / Discard**.                                                                                                                                           | **Publish**, **Send**, **Verified**, or automatic replacement.                                                                                                               |
| Source changed while waiting                 | **“This text changed. Request a new suggestion for the current version.”**                                                                                                                         | Applying to stale offsets, relocating into a similar paragraph, or overwriting newer work.                                                                                   |
| Generation failed, known no application      | **“Writing help couldn't finish. Your draft hasn't changed.”**                                                                                                                                     | Using that reassurance for an uncertain application/save operation.                                                                                                          |
| Generation outcome unknown, no result lookup | **“We couldn't confirm the result. Your draft hasn't changed. A new request may incur another charge.”** Offer an explicit **Request a new suggestion** only under fresh authorization and budget. | Automatically replaying the unknown request, releasing its unresolved budget reservation as though it cost nothing, silently switching providers, or applying a late result. |
| Apply outcome unknown                        | **“We're checking whether your change was saved.”** Resolve the same operation before enabling repeat application.                                                                                 | Claiming unchanged/failed, issuing a fresh apply or telling the author to regenerate.                                                                                        |
| Limit reached                                | **“Writing help has reached your organization's limit. You can keep editing.”** Add a reset time only if authoritative.                                                                            | Guessing cost/reset time, switching provider/key/model silently, or blocking manual Save.                                                                                    |
| Applied                                      | **“Suggestion applied.”** Normal undo/revision recovery remains available when actually supported.                                                                                                 | A toast as the only recovery path or Undo that rewinds unrelated later edits.                                                                                                |

Do not conflate preview generation, acceptance, draft save and sent issue truth.
An explicit new generation after an unknown generation is a distinct operation,
not a retry that proves the first did not run. Retain the old unknown invocation
and its unresolved reservation according to the shared budget contract. A late
response must not overwrite the new comparison or apply itself. This allowance
does not permit a second application while an earlier application is uncertain.
Current tenant/personal revocation and source eligibility govern whether an
in-flight or ready result may still be shown or applied. Exact lifecycle handling
belongs to the owning contract, not to UI button labels alone.

## Accessibility and phone evidence

| ID  | Primary guidance, read 2026-10-16                                                                                    | Exact implication and limitation                                                                                                                                                                                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 | [WAI-ARIA toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)                                        | If implementing a toolbar, use its keyboard/focus convention: one toolbar tab stop and arrow-key navigation between controls. Native/shared buttons or a menu may be simpler. APG is implementation guidance, not proof of WCAG conformance. Do not invent a conflicting editor shortcut. |
| A02 | [WCAG 2.2 SC 4.1.3 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                | Qualifying waiting/ready/error status messages need programmatic exposure without moving focus. The entire suggestion is content, not a requirement to announce every generated word. Avoid chatty/assertive feedback for routine generation.                                             |
| A03 | [SC 1.4.1 use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                               | Added/removed wording or warnings cannot be communicated only by color. Labels and accessible comparison structure must remain understandable without the color coding.                                                                                                                   |
| A04 | [SC 2.4.11 focus not obscured, minimum](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | Author-created overlays must not entirely hide the focused component. Full visibility is the preferable design target, but it is stronger than this AA criterion. Test a phone keyboard and sticky controls; do not claim the criterion universally mandates no partial overlap.          |
| A05 | [SC 2.5.8 target size, minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                | AA minimum is 24 CSS pixels with specified exceptions/spacing alternatives. Core's shared touch guidance aims for larger useful targets; do not misstate a universal 44-pixel WCAG AA rule.                                                                                               |

Acceptance testing must preserve selection when focus leaves the editor, expose
action names and disabled/busy states, allow reading original and suggestion in
logical order, dismiss cleanly, and restore a useful insertion point. Keyboard
and assistive-technology paths must not depend on hovering, dragging a highlight
handle precisely, or recognizing a sparkle icon. Long prose, zoom, IME input,
RTL/mixed-language text, punctuation and multiline selections need actual tests.
An English-only test or browser automation pass cannot establish all-language
editing quality or complete accessibility.

## Material concerns — eight dimensions per concern

Each concern supplies failure, importance, severity, likelihood, evidence,
effect on the selected answer, permanent prevention and an exact proposed
clause. Likelihood is a judgment about an unamended implementation, not an
observed incident rate. Proofs are future verification requirements.

### UX01 — Helpful prose changes facts, theology or the author's voice

**Failure:** Rewrite/compelling/lengthen adds claims or changes uncertainty.
**Importance:** A fluent newsletter can misrepresent people, ministry events or
the author's meaning. **Severity:** High. **Likelihood:** Plausible for generative
rewriting; higher for unconstrained creative expansion. **Evidence:** W09/W12
offer broad creative uses; ADR-0133 explicitly identifies meaning drift.
**Effect on A:** Preserve A with narrower transformation semantics, not a promise
of automatic fidelity. **Permanent fix:** source-bounded actions, protected
semantic objects, original comparison and representative human evaluation.
**Exact clause WUX01:** **Every action preserves the supported source assertions;
lengthening or compelling wording cannot manufacture facts, quotes, outcomes,
urgency, commitments or donor pressure.**
**Proof:** seeded changed negations/numbers/quotes, dialect and ministry terms,
plus a human review of engaging-but-unexaggerated output for each qualified model.

### UX02 — Voice assistance silently expands the data source

**Failure:** The helper scans old letters, inboxes, donor records or private
notes to imitate the author. **Importance:** The visible selection no longer
describes what leaves Core. **Severity:** Critical for prohibited disclosure.
**Likelihood:** Plausible if current vendor patterns are copied. **Evidence:**
W02's proactive email/Drive use, W07's continuous profile, W12's personal context.
**Effect on A:** Requires exact newsletter-only source qualification.
**Permanent fix:** minimum-data source/egress manifest, truthful disclosure and
no hidden retrieval. **Exact clause WUX02:** **Voice preservation uses only the
exact authorized eligible source; selection never grants access to other content
or declassifies prohibited text.** **Proof:** network payload assertions and
denial fixtures for private/care text, imported files and unrelated drafts.

### UX03 — Acceptance overwrites newer or unintended text

**Failure:** Selection disappears when the menu opens, the author edits while
generation runs, or a stale response applies at old offsets. **Importance:**
Useful writing is lost or changed outside the requested passage. **Severity:**
High. **Likelihood:** Plausible in rich-text/phone/concurrent editing.
**Evidence:** W01/W04 require selected-target replacement; ADR-0133 requires exact
semantic targeting and current revision. **Effect on A:** A needs a qualified
request/apply seam, not merely a styled button. **Permanent fix:** preserve the
explicit source target and compare current source at apply; never guess a new
target. **Exact clause WUX03:** **Use suggestion can create only one ordinary
draft edit at the exact authorized current target; a changed target requires a
new request.** **Proof:** selection blur, IME, paragraph reorder and concurrent
edit races; no off-target mutation.

### UX04 — “Use” becomes send or the original becomes unrecoverable

**Failure:** Acceptance silently approves/sends an issue or replaces text without
usable recovery. **Importance:** Authoring intent is narrower than outward action.
**Severity:** High. **Likelihood:** Plausible if composer and send flows are fused.
**Evidence:** W01/W04/W08 distinguish review/acceptance; D7 separates per-issue
send. **Effect on A:** Preserve the existing manual draft/send lifecycle.
**Permanent fix:** separate source operations and ordinary editor undo/revisions.
**Exact clause WUX04:** **Suggestion acceptance changes draft wording only;
sending, recipients, scheduling and publication remain separate deliberate
source-authorized actions.** **Proof:** accept, discard and undo produce no send,
recipient mutation or approval; recovery does not erase unrelated later edits.

### UX05 — Optional help becomes pressure, clutter or a workflow requirement

**Failure:** An intrusive assistant rewrites automatically, nags when disabled,
demands voice setup or blocks editing until AI configuration succeeds.
**Importance:** The feature undermines the author's control and the manual path.
**Severity:** Moderate; High where publication becomes blocked. **Likelihood:**
Likely with a broad assistant-first design. **Evidence:** W06–W10 combine narrow
editing with much broader products; founder explicitly requests restraint.
**Effect on A:** Prefer a quiet contextual aid. **Permanent fix:** independent
tenant/personal availability, on-demand actions and a complete manual editor.
**Exact clause WUX05:** **Neither tenant enablement nor typing triggers AI;
manual authoring, saving and deliberate sending remain complete without it.**
**Proof:** tenant off, personal off, no key, invalid key, exhausted budget and
provider outage all leave normal newsletter work usable.

### UX06 — Cost, retry and cancellation copy is misleading

**Failure:** Regeneration fires automatically, a timeout creates duplicate work,
Stop promises no charge, or an unknown apply is reported as unchanged.
**Importance:** Users lose trust, budget or source accuracy. **Severity:** High.
**Likelihood:** Plausible with generic retry/streaming UI. **Evidence:** ADR-0099
owns invocation/budget/ambiguity; W03/W05 demonstrate distinct review actions.
**Effect on A:** One explicit request and honest states remain simple.
**Permanent fix:** same-operation resolution, current gates and source-qualified
usage facts. **Exact clause WUX06:** **Retry, regeneration, application and stop
retain distinct identities and meanings; unknown acceptance is resolved before
another application, and local cancellation never claims provider erasure or
zero cost. A user may explicitly start a distinct generation after an unknown
generation under fresh budget and current gates, with possible-prior-charge
notice and the old unresolved invocation retained; no automatic replay or late
overwrite is permitted.** **Proof:** request/apply response loss, double click, limit crossing,
revoked key and late provider result without hidden fallback or repeated apply.

### UX07 — Phone or assistive technology cannot review the change

**Failure:** Hover-only actions, lost selection, color-only diff, obscured focus
or continuous announcements make the helper unusable. **Importance:** The author
cannot understand or control a potentially consequential edit. **Severity:** High
for exclusion. **Likelihood:** Likely without explicit interaction testing.
**Evidence:** W03/W05/W11 and A01–A05. **Effect on A:** Requires a complete
alternative to pointer-only selection, not removal of assistance.
**Permanent fix:** shared primitives, logical comparison, readable phone layout,
focus restoration and bounded status feedback. **Exact clause WUX07:** **Every
request, review, use, discard and recovery action works by keyboard and supported
assistive technology, and the exact compared text remains readable without
hover, color-only meaning or side-by-side phone compression.** **Proof:** manual
phone/screen-reader/keyboard tasks plus targeted automated checks.

### UX08 — A vendor pattern is mistaken for certification or new scope

**Failure:** Beta marketing becomes a parity claim; source-specific assistance
turns into broad retrieval, translation, model selection or a second settings app.
**Importance:** Work expands without solving the selected job or preserving its
owners. **Severity:** High for disclosure/scope conflict, Moderate for needless
complexity. **Likelihood:** Plausible with indiscriminate feature copying.
**Evidence:** W02/W07/W09/W10/W11 limits and separate ADR-0133 Page purpose.
**Effect on A:** A remains useful as six source-bounded transformations.
**Permanent fix:** reuse the shared purpose foundation, qualify this target and
document tested languages/models and limitations. **Exact clause WUX08:**
**Public vendor documentation establishes comparator behavior only; newsletter
assistance ships only for its qualified source/action/provider/language profile,
without importing unrelated permissions, retrieval, translation or dependencies.**
**Proof:** purpose-isolation tests, unsupported-language/model states and a review
that all six requested actions work without another product or configuration flow.

## Proposed task-based checks and limits of this research

These are suggested future evaluations, **not interviews or tests conducted**:

1. On a phone, select a paragraph, shorten it, compare the original, use it and
   undo it. Observe whether selection, reading order and recovery are understood.
2. With a keyboard and screen reader, choose grammar correction, read the
   suggestion and discard it; confirm no text changed and focus is useful.
3. Give a fluent but intentionally wrong suggestion containing a changed number,
   attribution or negation. Evaluate whether comparison makes the error detectable;
   do not infer accuracy from acceptance rate or writing speed alone.
4. Ask for more compelling wording of a modest factual update. Review whether
   it preserves the author's voice, dignity, uncertainty and absence of pressure.
5. Request lengthening from a very short passage with no additional facts.
   Verify that absence of material produces an honest outcome, not invented detail.
6. Edit while a request runs, switch tenant/draft, revoke availability, exhaust a
   limit and interrupt apply. Verify accurate stale/unknown/revoked states and a
   complete manual path without provider or source fallback.

Evaluate with synthetic or explicitly authorized eligible examples, including
non-Western names, dialect, mixed script, quotations, links and representative
missionary prose. Translation and new language coverage require their own
qualification; a vendor's language list is insufficient. Do not promise a
universal quality score, success percentage, fundraising improvement or fixed
latency from these sources.

The strongest simpler alternative is the complete manual D7 editor with ordinary
editing/recovery and no generative helper. It removes egress, cost and meaning-
drift risks but does not deliver the newly selected assistance. The bounded
six-action approach is the recommended implementation direction. The strongest
broader alternative—a persistent chat panel with workspace context and learned
voice—is less appropriate because it adds source ambiguity and configuration
without being necessary for this job.

Remaining evidence: actual qualified models/languages and data-use contracts,
current source classification/semantic editor port, invocation/apply/recovery
behavior, budget truth, phone and assistive-technology results, and representative
human quality evaluation. This note neither supplies those proofs nor claims a
production feature exists.
