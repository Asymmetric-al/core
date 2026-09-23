# D29 refreshed journey — contact first, optional guidance

**Current ratification —14September2026:** The founder fully ratifies D29 A, the renewed review, **D29-X01**, all final corrections and **X-P01–X-P03**, together with all original30clauses/44proof groups/6controls. D1–D34 and every amendment remain ratified; Q35 remains unanswered. Earlier proposed/pending/if-adopted wording below is historical. The [complete new ratification](phase26-d29-x01-full-ratification.md) is incorporated in full; actual runtime proof remains required and unexecuted.

**14 September 2026.** This explains the already-ratified D29 A. The only newly proposed requirement is accessibility-proof amendment **D29-X01** in the [review](phase26-d29-refresh-adversarial-review.md). D1–D34 remain ratified; Q35 remains unanswered. This is a researched design, not a rendered or usability-tested implementation.

## The experience to build

Opening Help or Contact takes a person directly to **Contact [tenant public name]**. They see who will receive the message, a short form, and the tenant's actual published contact methods. They can send without reading anything else. Relevant guides are available for people who prefer information, with no suggestion that they ought to try harder before asking for help.

The first screen should feel calm: a familiar Asym/app or tenant-public shell, one clear heading, short explanatory copy, a readable form, and generous space around the primary action. Use existing components and tokens. Authenticated app UI uses the approved **Base UI / base-maia** implementation and Maia/Zinc styling. Public Web Studio presentation retains its qualified tenant/theme owner; this decision does not override its theme authority or create another component library.

Illustrative composition, not a frozen breakpoint or pixel specification:

```text
Contact [tenant public name]
Send our team a message.

Email for our reply *               Prefer email?
[                            ]      [published email address]
                                    [Copy email]
How can we help? *
[                            ]      Phone, when actually offered
[                            ]      [published number and hours]
[                            ]
                                    Helpful guides
Name (optional)                     [Relevant guide title ↗]
[                            ]      [Relevant guide title ↗]

[Send message]
```

On a wide screen, direct methods and optional guides may occupy a restrained secondary column. On a narrow screen, the reading order is heading → form → direct methods → guides. The directly reachable form remains the primary path; direct methods are plainly labelled rather than buried in footer navigation. No hero image, fixed chat bubble, introductory animation, welcome tour, large card grid or tab chooser is needed. Existing shell navigation remains consistent. The precise responsive layout is qualified against X01 rather than exposed as tenant configuration.

## Content and controls

| Element              | Required behavior and purpose                                                                                                                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading              | **Contact [tenant public name]** identifies the recipient. Use the current qualified public identity, never a guessed organization name or private staff address.                                                                                                          |
| Intro                | A brief invitation such as **Send our team a message.** Avoid invented availability, response deadlines, staffing or service guarantees.                                                                                                                                   |
| Reply email          | Visible label **Email for our reply**; required. Support the exact qualified P6 mailbox/parser profile. Do not silently correct aliases or claim that a typed address verifies identity.                                                                                   |
| Message              | Visible label **How can we help?**; required plain-text multiline control. No editor toolbar or upload prerequisite. Place concise privacy guidance beside the field only where it helps avoid sensitive credentials/payment information; do not insert a compliance wall. |
| Name                 | One optional unsplit **Name** field. No first/last-name split, required surname or forced Western ordering. Optional is explicit.                                                                                                                                          |
| Limits               | Preserve R04: 10,000 Unicode scalar message, 200 scalar optional name, newline normalization, and the separate 256 KiB raw-request ceiling. Explain an exceeded field limit beside that field; do not use a UTF-16-only HTML maxlength as the authority.                   |
| Primary action       | **Send message**. Clear pending feedback; no layout jump, timed toast-only success or repeated-submit affordance during an unresolved attempt.                                                                                                                             |
| Direct email         | Show the complete selectable published address with a normal mailto link. Copy is a helpful enhancement with brief accessible confirmation. Failure to copy leaves the address available. No private-context mailto body.                                                  |
| Phone                | Show only an actual deliberately published channel. Use international format and accurate named-zone hours if the tenant provides them. Do not imply a staffed live line or callback service.                                                                              |
| Guidance             | Zero to three ordered, relevant Listed public Page references, using current source titles and eligible destinations. No empty placeholder section when there are none. No automated recommendations, popularity feed or copied article body.                              |
| Guide link           | Plain labelled link; disclose **opens in a new tab** accessibly, with no opener/referrer. The external-link icon supplements a meaningful title. No article-reading modal or nested knowledge browser.                                                                     |
| Optional app context | One readable, removable summary of context currently authorized to be included. Never display an opaque record ID as if it explains the request.                                                                                                                           |

Only reply email and message are required. There is no required subject, topic, department, donor ID, account, phone, address, marketing consent, screenshot or attachment. Existing contextual-help and content capabilities elsewhere remain available; this contact profile is intentionally bounded.

## Journey 1 — a guest wants to contact the tenant

1. The person selects **Contact [tenant]** from the relevant public surface. The ordinary full page and native form are immediately usable. A slow or unavailable optional guide cannot delay a separately qualified contact form.
2. They enter their reply email and message; name is optional. Field labels remain visible after input. Browser autofill is user-supplied convenience, never trusted proof or a CRM update.
3. They select **Send message**. The same authority validates both native and enhanced submission. On field errors, keep permitted text, show a concise error summary linked to each affected field, and move focus deliberately once. Avoid premature errors while someone is still entering an address.
4. The server admits one durable Contact occurrence and Support responsibility before returning **Your message has been received.** This is a persistent page/state with a meaningful heading, not a disappearing toast. It does not claim that email was delivered, staff read it, a refund was processed or the issue was solved.
5. Successful submission clears the app-managed draft. A new message requires a deliberate new intent; browser refresh or a duplicated request retrieves the same privacy-safe outcome rather than creating another request.

No guide interaction or optional confirmation email is required for this successful journey. For someone preferring their own mail client, the published email is always an ordinary alternative. Selecting email/phone opens the relevant client where supported; it does not create a Support record or prove that a message/call occurred. If a client is unavailable, the selectable address/number and the form remain understandable alternatives.

## Journey 2 — a person wants information first

1. The person opens the same Contact page and notices a relevant **Helpful guides** link. The form and direct methods are already available.
2. They open that selected guide in its labelled new tab. The source owner renders its current public Page; Support does not copy or embed the article.
3. They return to the original tab. Under ordinary browser navigation, their draft and place remain. Opening a guide never sends, clears or reroutes the form. This is not a promise to recover a tab discarded by the browser/OS, and it introduces no localStorage or offline queue.
4. If the guide answered the question, they simply stop. Asym does not create a request, claim a resolution, update CRM last-contact, ask for ticket feedback or count a deflection from the click alone.
5. If they still want help, they submit normally. There is no **Not helpful** gate, forced search, bot handoff or second set of intake fields.

A removed, unlisted, internal, Shared-by-link, wrong-locale or unqualified guide is omitted. Do not silently replace it with another article or language. Zero guides is a complete product state. A source-wide/host/form failure is different: only a separately qualified contact route may remain available; a guide-only fallback rule cannot authorize stale or guessed contact facts.

## Journey 3 — a signed-in donor, missionary or staff requester

These roles are possible users, not evidence that every ministry runs the same workflow.

1. **Contact [tenant]** appears consistently within the app-owned Help entry. An existing app panel may enhance the full-page form where qualified; a stable full-page route remains usable. Do not force a new panel system.
2. Prefill only the actual requester's currently authorized self data, visibly and editably. Do not substitute a related person's or represented organization's mailbox. Show a relevant authorized context summary only when available, with **Remove**.
3. The requester edits their reply address or removes context without navigating to CRM. Those actions change this submission only; they neither update contact records nor prove control of an identity or organization.
4. Recheck context and authority at admission. If only context becomes unavailable, remove forbidden source context/prefill and preserve only permitted visitor-authored text for deliberate requalification or **contact without account details**. Never silently downgrade and send.
5. A real logout, tenant or account switch clears the entire managed draft/prefill/context. Never carry it to another person or tenant. Receipt and private context are not public-cacheable content.
6. The same truthful receipt and independently qualified Support handoff apply. No additional proof of identity is demanded merely to ask an ordinary question; the owning domain may require it before a consequential action or disclosure.

## Journey 4 — staff continue through Support and CRM

1. Authorized staff see the native **form-origin** requester message in Support, with the actual submitted response endpoint and permitted origin/context. It must not look like fabricated incoming email or a private staff note.
2. If a CRM relationship is authorized and established, **Communications → Support** and the appropriate limited CRM Overview surface show/access the same canonical Support source. Preserve list position, context and a return route when moving between surfaces. Do not copy the conversation into a second editable Activity.
3. If identity is absent or ambiguous, staff can still care for the request within their authority. A matching email, shared mailbox, forwarded message or record association does not prove identity, representation or unrestricted CRM access.
4. A first human email reply uses the qualified form-response recipient basis and real outgoing lineage. A real compatible acknowledgement thread may be continued; otherwise this is the first outgoing email. Do not synthesize incoming headers to satisfy an email-shaped adapter.
5. CRM, giving, receipts, refunds, recurring gifts, contact changes and member-care actions retain their owning permissions, validation, approval and audit history. Support may navigate to or initiate an authorized owner workflow, then reflect its actual result. Closing the request does not assert that the requested business action succeeded.
6. Existing Support reply/internal-note distinctions and recipient/attachment checks remain in force. D34 composing cues are staff-only advisory state; nothing in this public contact entry exposes a teammate's composition to the requester.

## Journey 5 — interruption and recovery

| Situation                                         | User-visible result                                                 | Required behavior behind it                                                                                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Definite validation rejection                     | Specific field correction, text preserved where permitted           | No accepted primary exists; correct input before a new valid attempt.                                                                                                    |
| Lost/ambiguous submission response                | **Checking whether your message was received**                      | Reconcile the same durable intent; no blind rekey, duplicate request or alternate-email fallback.                                                                        |
| Accepted but conversation materialization delayed | Persistent **Received**                                             | Accepted work is discoverable to its authorized recovery owner and materializes once from original admission/route evidence. A queue notification alone is insufficient. |
| Optional confirmation delayed/failed              | Browser receipt remains valid                                       | Separate child outcome; do not say email was sent or ask the requester to resubmit.                                                                                      |
| JavaScript unavailable                            | Native form and full-page error/receipt                             | Same source, validation, idempotency and acceptance authority; no permissive shadow endpoint.                                                                            |
| Optional guide absent/unavailable                 | Contact remains, guide omitted                                      | Only where the required contact closure is independently qualified.                                                                                                      |
| Whole required source/route unsafe                | Clear unavailable state; actual qualified alternatives if available | No stale identity/route fallback and no success claim.                                                                                                                   |
| Rate/backpressure control applies                 | Understandable retry/recovery and retained permitted text           | Bound parsing and tenant-fair work; accessible risk-based protection, no blanket puzzle or infinite spinner.                                                             |

No offline **will send later** promise. Retrying must be tied to the actual durable result. The existing original proof groups include no-JavaScript, request races, source changes and privacy revocation; these are required implementation outcomes.

## Journey 6 — tenant maintenance without another studio

The tenant gets one **Requester help** entry showing the actual public/app placements, currently published contact methods, destination/readiness and optional guide selections. It is an inventory and navigation surface over real owners, not another content/template database.

1. Select the exact Help placement and see its current owner/source/release state.
2. Configure or repair contact identity/methods and the certified Contact-purpose Support route using their real Web Studio/app/Support owner actions. Display **Not ready** honestly where a required dependency is unqualified.
3. Select zero to three eligible public guides; show their current title, destination and order. Selection changes are distinct from editing or withdrawing the source Page. Provide keyboard reorder controls, not drag-only interaction.
4. Preview with synthetic content and exercise a no-write routing check. Preview must not create a form occurrence, send mail, mint requester links or write CRM history.
5. Publish/activate through the actual owner. Public and app releases have separate acknowledgements/readiness; no misleading single badge claims a distributed atomic release.
6. Enable or disable the single optional **Visitor Acknowledgement** through the existing Contact form / Route Plan **Confirmation** owner in P23; it starts Off and requires its qualified web-Contact profile. Use **Edit in Email Studio** for compatible wording, presentation and Live publication. Publishing a template alone never enables the child. Browser receipt remains independent. There is no duplicate template editor or second confirmation switch.
7. Repair withdrawn guides or a changed contact method through the owning release path. Removing the last guide is ordinary and safe. Already accepted requests retain their exact original route and recovery responsibility. A departing maintainer is replaced through qualified ownership; staff never need SQL to change public copy.

## Why these patterns fit

[Help Scout's Ask First](https://docs.helpscout.com/article/1296-work-with-beacon-modes) documents a direct contact-first alternative; its self-service gate demonstrates the deliberate tradeoff this decision rejects. [Freshdesk's widget](https://support.freshdesk.com/support/solutions/articles/239273-set-up-your-help-widget) can hide the form until search or article feedback, making its default/deflection choices unsuitable to copy blindly. [Intercom's configuration](https://www.intercom.com/help/en/articles/6612589-set-up-and-customize-the-messenger) similarly requires checking the final interaction of contact and search settings.

The useful common pattern is optional relevant information beside an explicit way to reach people. The [NN/g contact study](https://www.nngroup.com/articles/contact-us-pages/) supports discoverable direct details but is older B2B qualitative research, not evidence for mandatory phone/chat staffing in ministries. [Zoho's advanced form](https://help.zoho.com/portal/en/kb/desk/support-channels/web-form/articles/creating-feedback-widget-and-advanced-web-form) requires fields inappropriate for this minimal purpose. Reuse established rendering/form/communication capabilities; do not import a vendor's entire widget or customer model.

## Qualification of clarity and visual quality

Beauty here means careful typography, hierarchy, alignment, spacing and states in the approved theme, with no decorative competition around the task. Meaning must not depend on color, hover or animation. Honor reduced motion; feedback should be calm and purposeful. Long names, addresses and translated labels wrap without concealing actions. All labels and errors are localizable; times use the relevant declared zone rather than a guessed local offset.

Add X01's separate **200% text resize**, **320 CSS-pixel reflow/400% zoom**, focus-obstruction, target-size and virtual-keyboard journey proof. Test actual initial/error/receipt screens and named browser/assistive-technology combinations, not only a narrow screenshot. See [exact supplemental proof](phase26-d29-refresh-proof-and-seams.md).

The existing moderated journey proof P44 must observe people choosing contact immediately, optionally reading and returning, correcting errors, changing self-prefill, handling context-only loss, coping without phone/JavaScript, and maintaining the last guide. These remain **unexecuted release tests**. This research does not prove a perfect interface, measure tenant satisfaction or authorize publishing untested screens.

## Full renewed-review ratification —14September2026

The founder explicitly accepts **all amendments, additions, adjustments, changes and updates** in this document and the entire [D29 renewed review and X01 ratification](phase26-d29-x01-full-ratification.md). This incorporates the original D29-R01–R30, both23-category reviews, four unchanged glossary definitions, all source/data/CRM/UX/maintenance/privacy/recovery/rollout contracts, all final independent corrections, P01–P44/O01–O06, and the exact accepted X01/X-P01–X-P03. There are **47 required release proof groups** by addition; original identifiers and prior evidence are preserved. No X01 approval gate remains.

**Email Studio seam is accepted in full:** P23's Contact Form/Route Plan Confirmation setting alone enables the zero-or-one optional acknowledgement, initially Off. P17 Email Studio governs its compatible web-Contact wording, presentation, Live publication and immutable preparation; publishing wording never enables the child. P6 owns actual send/retry/reconciliation. Browser Received requires durable primary Support acceptance independently of optional mail. Preserve15minute utility/common24hour courtesy, full before/after-submission human precedence for the **same current request and exact confirmation recipient**, Off-only Recent sent copy and synthetic Template used preview. Native form provenance, qualified first reply and canonical permission-aware CRM access remain mandatory.

The new accessibility qualification preserves200% text resizing and adds320CSS-pixel reflow/400% zoom from1280CSS pixels, exact WCAG2.4.11 focus and2.5.8 target-size/exception proof,44-pixel standalone-primary touch targets as a product goal, and separate mobile-keyboard journeys. See the [full exact accepted text and consequences](phase26-d29-x01-full-ratification.md). These are release obligations, not performed browser/AT/runtime tests. **D1–D34 remain fully ratified; Q35 is unanswered.** No new term, ADR number, formal spec/ticket, product or external mutation is authorized by recording this acceptance.
