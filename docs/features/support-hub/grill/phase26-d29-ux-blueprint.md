# D29 — Contact-first requester and maintainer journeys

**Current ratification —14September2026:** The founder fully ratifies D29 A, the renewed review, **D29-X01**, all final corrections and **X-P01–X-P03**, together with all original30clauses/44proof groups/6controls. D1–D34 and every amendment remain ratified; Q35 remains unanswered. Earlier proposed/pending/if-adopted wording below is historical. The [complete new ratification](phase26-d29-x01-full-ratification.md) is incorporated in full; actual runtime proof remains required and unexecuted.

**Fully founder-ratified, 13 September 2026. D29 and every adopted amendment are accepted; D1–D29 are fully ratified.** The appended ratification governs earlier answer-stage status. This remains feature grooming, not implementation or release proof.

**Historical opening (superseded status, preserved evidence):** **A selected; complete amendments proposed, 13 September 2026.** The [R01–R30 decision](phase26-d29-adversarial-review.md) is authoritative for this grooming package. This blueprint describes the intended behavior; no rendered prototype, observed Asym usability result or implemented form is claimed.

## The experience at a glance

The entry is **Contact [tenant]**, with the form already visible. Contact is the dominant purpose; the optional guides do not compete with it. Use the actual tenant's approved public identity and existing app/public design system, not a generic chatbot avatar or a fictitious personal responder.

```text
Contact [Tenant public name]
Send the team a message.

Email for our reply   [____________________________]
Name (optional)      [____________________________]
How can we help?     [                            ]
                    [                            ]

About: [permitted context, when explicitly included]  Remove
[Send message]

Prefer email? [public tenant email] [Copy email]
[Phone number and published phone hours, only when provided]

Helpful guides (optional)
• [Relevant public guide] — opens in a new tab
• [Another deliberately selected guide]
```

This is a structural sketch, not a frozen pixel layout. Desktop can use a restrained secondary guide column if the main form stays dominant. Mobile remains one column: contact form and alternatives first, guides afterward. No floating launcher is required; where an existing app panel is appropriate, it enhances a real accessible full-page route. Do not hide contact behind a collapsed FAQ, topic picker or additional “Ask” tab.

## Guest/public journey

1. **Find Help consistently.** The tenant's established Help/Contact affordance has a stable relative position within its actual page set. It opens the qualified Contact page directly. No account, donor lookup, department choice, search or article visit is required.
2. **Choose the easiest contact route.** The form is ready. A visible selectable tenant email and ordinary mailto link offer an alternative for someone who prefers their own email client; Copy email is an enhancement, not the only access to the address. An actual published phone number can open a dialer, with readable international formatting. No call/email is said to have happened merely because a link was pressed.
3. **Write the request.** Email and a message are sufficient; name is optional and unsplit. The message label is “How can we help?” A short optional hint can ask for the information needed to understand the issue, without demanding order/donor/account IDs or screenshots. A proportionate safety hint discourages card numbers and sensitive personal details; it does not make the person complete a privacy checklist or waive rights.
4. **Read guidance only if wanted.** Up to three relevant public title links appear in their curated order. Each uses the current source title and optional safe summary. “Open guide” indicates a new tab and uses a normal anchor, preserving the form in the current tab. No inline article renderer tries to run CMS forms, donation widgets, videos or arbitrary embeds inside the contact page. The person may close the article and continue writing immediately.
5. **Send once.** Send message submits the exact released form to the server. A JS enhancement may prevent accidental repeated pressing and show progress; native semantic submission and no-JS validation/receipt must work. Do not disable submission because optional guides are loading or absent. Do not create a second contact via mailto when a request times out.
6. **Know the result.** A durable accepted outcome shows **Your message has been received**, the submitted reply address as an escaped private receipt fact if appropriate, and a safe reference when qualified. It does not claim delivery, human reading, assignment or response time. A failed pre-acceptance request preserves safe answers and says it was not received. An unknown outcome says **Checking whether your message was received** and reuses its exact receipt/replay path.

After success, clear the live draft/prefill/context from app-managed state. Do not preserve a device-based Support history, browser-local message archive or a second “Send again” prompt. A browser receipt is enough even when visitor email confirmation is Off or fails. If a separately enabled email confirmation is eligible, it says only that the request was received and uses its own governed message contract; it is not the human answer.

## Signed-in app journey and CRM context

Illustrative scenario: Sarah is in Giving history and needs help locating a statement. Her current app context may carry an owner-authorized reference to the relevant subject. It cannot copy the statement, giving amounts, processor IDs or a screenshot into public content or URLs.

Help opens the same simple form in the app's existing shell/panel, preserving where Sarah was. Her current authorized self-contact can be visibly prefilled. A person managing an organization's giving does not inherit that organization's email as the requester by default. The submitted email remains editable; changing it changes this request's proposed response endpoint, not her CRM contact information, verification, login or future account preferences.

When qualified, an **About [safe context label]** row explains the optional record context and offers Remove. The server rechecks it at Submit. If it is no longer permitted, preserve allowable visitor-authored text and offer requalification or an explicit **Send without account details** path. A form must not silently change the target record or leak its hidden identity through an error. Ordinary contact remains possible without private account context.

On deliberate sign-out, account switch or tenant switch, clear the old draft, prefill and source references. During a transient same-context validation/network failure, preserve the local form. On session expiry, explain that account details need requalification; the person may sign in or deliberately continue with ordinary visitor contact after private context/prefill authority is cleared. Do not silently submit a previously authenticated private draft as another user or as anonymous. No automatic background send or browser-storage persistence is introduced.

Once accepted, the staff side receives one genuine form-origin Support source. A current authorized worker opens it from Support Hub or CRM Communications → Support and gets the same conversation/detail, actual submitted reply endpoint and only the context they can currently read. A missing CRM match does not block care or create a new Party automatically. A link/assignment does not unlock restricted CRM/giving/care records. Public guidance remains public information; actual statement access/refund/contact changes still use their own owner flows.

## Staff continuation

The source shows **Submitted through Help form**, actual trusted admission time and the requester's own text. It is not attributed to a staff author or fabricated email headers/provider event. D3 work ownership, D6 routing and D9 current context remain normal Support behavior.

The first reply uses the submitted endpoint under current source/contactability and normal D4 audience review. No auto-CC of related Parties or reuse of a current CRM “preferred” address. If a real optional acknowledgement established a qualified thread, staff may continue it; otherwise the human reply creates the first actual outgoing thread. Later real email follows D1/D2/D25. If contactability is blocked, staff see the existing qualified recovery rather than a public confirmation falsely claiming delivery.

An actual phone conversation may be recorded through D26 when staff deliberately do so. A call-link click is not that record. Reading a guide, clicking contact, receiving an automatic confirmation and completing human support are distinct events; none silently resolves work or produces D28 feedback.

## Empty, error and unavailable states

| Situation                                             | Requester experience                                                                                   | Owner behavior                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| No selected guides                                    | Form and direct methods remain complete; omit the optional section.                                    | No filler, search expansion or setup demand on the requester.                                                  |
| One guide withdrawn, unlisted or wrong locale         | It disappears from the qualified optional list; other safe explicit selections may remain.             | Saved selection history stays; no substitute guide or scope broadening.                                        |
| Guide service unavailable                             | Contact remains usable through the qualified optional-leaf fallback.                                   | No “retry articles before contacting us” gate.                                                                 |
| Form temporarily cannot accept                        | Honest unavailable message, safe local answers retained and approved current email/phone alternatives. | Do not fabricate Received or invoke a different Primary Outcome.                                               |
| Whole tenant/host/source cannot be established safely | Generic failure/retry; no other tenant's identity, guides or address.                                  | A fallback is only used when independently qualified; no permissive stale page.                                |
| Validation error                                      | Field message plus linked error summary; answers retained and the correction explained.                | No silent remapping of stale schema/recipient or server-field authority from client input.                     |
| Submit timeout                                        | Checking/same-intent receipt recovery, with contact alternatives still visible.                        | Never silently send through another channel. Separate deliberate contact may need reviewed duplicate handling. |
| No phone offered or outside published phone hours     | Form/email remain reachable; no dead Call button or automatic callback promise.                        | Do not infer phone presence from staff online status or internal reply-target calendars.                       |
| Unsupported mailbox encoding                          | Clear field explanation under the real owner parser; preserve message and show published alternatives. | No silent transliteration/alias substitution or fabricated valid address.                                      |
| Optional confirmation email suppressed/failed         | Browser receipt remains true; no additional burden on requester.                                       | Staff can see the independent child outcome; request remains owned and recoverable.                            |

## Maintainer journey

Use one **Requester help** management entry with an inventory of actual public/app placements and their current responsible owners. Do not make the tenant understand database or provider implementation to perform routine maintenance. Show public identity, contact path, guide selection, locale, readiness and Preview; source-specific actions explain where the change belongs.

For a public Contact Page, **Edit website Help** leads to its Web Studio Page/form intent. The owner selects the narrow ordinary-inquiry purpose and exactly one certified Support handoff, publishes the contact identity/methods and chooses up to three currently eligible Listed public Pages. Reorder has keyboard/non-drag controls. Ineligible/private/shared-by-link/wrong-locale sources are not quietly offered. Removing a guide removes the offer, not the source Page. Phone/email changes use the actual public publication boundary, not staff profile or login contacts.

For app Help, **Edit app Help** changes the bounded entry mapping/presentation under the app owner and selects qualified public source references. It does not alter the anonymous CMS audience or introduce a URL/CRM-conditions rules editor. Reusing the same guide across placements reuses its source identity, not another article copy. Public release and app activation have distinct version/readiness receipts; the UI shows each honestly rather than claiming a shared transaction.

**Delivery** shows where the work goes and the actual inbox/source owner, without exposing internal destination membership publicly. Email-only P23 delivery remains an independent route choice for other purposes; this standard Support entry cannot silently switch to it. **Visitor confirmation** is Off initially; enabling it requires the compatible web-Contact profile and Live Email Studio publication. **Edit confirmation in Email Studio** preserves the current setup context. Publishing wording does not activate a form or send anything. No duplicate template editor or second automatic-confirmation switch exists.

**Preview** exercises layout and validation with synthetic data, side-effect-dark under P23. **Check routing** is no-write. Any later real test mail uses the existing explicitly authorized nonproduction/test-recipient contract; preview never sends a request or email. After publication/activation, the management page separates active form/readiness, guide availability and optional mail health. A failed guide source never becomes an instruction to disable contact.

If a maintainer leaves, the existing qualified tenant oversight route supplies an eligible replacement without granting Support/CRM/Email Studio rights by implication. Exact invalid dependencies have one responsible source action; no recurring developer or direct SQL repair is the normal maintenance process.

## Accessibility, language and visual quality

Use the existing Core/P23 typography, space, semantic contrast and component ownership. A calm form, readable contact methods and modest text links are sufficient; no giant promotional cards, decorative bot, blinking status or competing primary CTAs. Preserve visible focus and logical reading/tab order. Labels stay above fields; optional name is marked optional. Email input purpose/autocomplete assists entry without treating browser autofill as identity proof. Copy/paste is allowed. Message text is a native textarea with an accessible limit; public rich text adds no useful capability here.

Error summaries focus only after submission failure and link to invalid fields. Live progress/receipt announcements are concise and do not repeatedly steal focus. Long exact-locale labels, RTL direction, 200% zoom and narrow mobile work without horizontal form scrolling. The optional guide links explicitly describe new-tab behavior. No-JS contact remains a real form; low bandwidth is handled with bounded bytes and honest progress, not an offline queue. Actual P09/P40/P41/P44 browser/assistive-technology and requester/maintainer studies must verify this blueprint before release.

## Full founder ratification — 13 September 2026

The founder explicitly ratifies **D29 A — Contextual guides and direct contact**, including every amendment, addition, adjustment, change and update in **D29-R01–R30**; all **23 individually evaluated adversarial categories**, findings, consequences, severity/likelihood assessments and permanent fixes; the complete requester, staff, CRM and maintainer journeys; all data, Supabase/RLS, source ownership, privacy, lifecycle, migration and recovery requirements; all independent final corrections; **four glossary terms**; **P01–P44** required release proof groups; and **O01–O06** operating controls with named signals, thresholds, owners and responses. **D1–D29 and every adopted amendment are fully ratified.** Earlier proposed/pending/no-next-question language, including D29-R30's answer-stage recording status, is historical and creates no remaining ratification gate.

The complete accepted design is contact-first: the ordinary Help form is immediately available; reply email and message are required, name is optional and unsplit; the tenant publishes a monitored email and may publish an actual phone channel; up to three exact currently eligible Listed public guides remain optional. Message/name limits are 10,000/200 Unicode scalars under the documented normalization, with a 256 KiB raw request ceiling. Native/no-JS submission, accessible errors/receipt, safe draft/context preservation and explicit identity-switch clearing are accepted requirements. Guide-only failure must preserve an otherwise qualified contact path; whole-scope uncertainty never permits an unsafe fallback.

Separate public P23 and authenticated app consumers retain their own trusted scope and release boundaries while using one qualified purpose/occurrence/Support handoff. Exactly one durable primary outcome precedes Received. Accepted pending intake remains discoverable and recovers the same form-origin source once with original clocks, even after route changes. No fake inbound email, automatically verified Party, duplicate CRM Activity or hidden cross-channel fallback is permitted. CRM shows the same currently authorized canonical Support detail; relevant business actions remain owner-authorized.

**Email Studio and shared communication roles are fully ratified.** Browser Received is not email delivery and needs no template. The standard Help form's optional Visitor Acknowledgement starts Off and requires the new exact web-Contact source/recipient/P17 publication profile, not reuse of D13's receiving-email-only trigger/key. Email Studio owns governed wording, qualified Tiptap authoring, presentation and immutable prepared material. P23 owns the optional child/source request, Support owns request/work/source history, and P6 owns dispatch/outcome/reconciliation. The web confirmation's Recent sent copy is Off-only: body-free actual-state history, no permanent generated body/subject, and synthetic Template used preview only.

The accepted web confirmation has a 15-minute utility from trusted form admission and shares the tenant/mailbox 24-hour receipt courtesy domain with D13 email confirmations. Full D13-R15 human precedence applies before and after possible acknowledgement submission: a qualifying human reply ends further acknowledgement call/decrypt authority, preserves reconciliation of already-in-flight outcomes and cannot be undone by later human-send failure. First human replies use qualified form-response recipient authority and real outgoing lineage; later actual email follows normal correlation. D14 uses genuine form admission/coverage and D28 still requires actual accepted human correspondence plus every eligibility guard. Form receipt, guide use and automated email earn no human reply or completion credit.

Ratification accepts all documented safeguards and proof obligations; it does not turn 24 synthetic examples, immutable source checks or three independent document reviews into actual SQL/RLS, concurrency, provider, browser, accessibility or usability evidence. All 44 real release groups remain required and unexecuted. Original source/experiment/validation evidence is preserved. The session may now continue with one researched unresolved question; no formal specification, implementation, tickets, GitHub/provider/DNS/inbox mutation or real messages are authorized by this recording.

## Full renewed-review ratification —14September2026

The founder explicitly accepts **all amendments, additions, adjustments, changes and updates** in this document and the entire [D29 renewed review and X01 ratification](phase26-d29-x01-full-ratification.md). This incorporates the original D29-R01–R30, both23-category reviews, four unchanged glossary definitions, all source/data/CRM/UX/maintenance/privacy/recovery/rollout contracts, all final independent corrections, P01–P44/O01–O06, and the exact accepted X01/X-P01–X-P03. There are **47 required release proof groups** by addition; original identifiers and prior evidence are preserved. No X01 approval gate remains.

**Email Studio seam is accepted in full:** P23's Contact Form/Route Plan Confirmation setting alone enables the zero-or-one optional acknowledgement, initially Off. P17 Email Studio governs its compatible web-Contact wording, presentation, Live publication and immutable preparation; publishing wording never enables the child. P6 owns actual send/retry/reconciliation. Browser Received requires durable primary Support acceptance independently of optional mail. Preserve15minute utility/common24hour courtesy, full before/after-submission human precedence for the **same current request and exact confirmation recipient**, Off-only Recent sent copy and synthetic Template used preview. Native form provenance, qualified first reply and canonical permission-aware CRM access remain mandatory.

The new accessibility qualification preserves200% text resizing and adds320CSS-pixel reflow/400% zoom from1280CSS pixels, exact WCAG2.4.11 focus and2.5.8 target-size/exception proof,44-pixel standalone-primary touch targets as a product goal, and separate mobile-keyboard journeys. See the [full exact accepted text and consequences](phase26-d29-x01-full-ratification.md). These are release obligations, not performed browser/AT/runtime tests. **D1–D34 remain fully ratified; Q35 is unanswered.** No new term, ADR number, formal spec/ticket, product or external mutation is authorized by recording this acceptance.
