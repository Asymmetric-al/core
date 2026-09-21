# Phase 24 D30 — required Request changes explanation adversarial review

Date: 2026-08-28  
Founder answer: **One required concise explanation; optional source anchor**  
Disposition: **Accept with required amendments**  
Scope: D25 external-review **Request changes** result; D19–D29 authority and
responsibility decisions remain fixed

Companion evidence:

- [D25 candidate-scoped external reviewer adversarial review](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
- [D25 primary research](./phase-24-d25-candidate-scoped-external-reviewer-primary-research.md)
- [D27 one visible review lane](./phase-24-d27-one-visible-review-lane-adversarial-review.md)
- [D28 explicit next-lane choice](./phase-24-d28-explicit-next-lane-choice-adversarial-review.md)
- [D29 Website review follow-up route](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md)
- [ADR-0181 — source-authorized candidate-scoped external review](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [ADR-0182 — one current candidate-review responsibility lane](../../adr/0182-one-current-candidate-review-responsibility-lane.md)

## Executive verdict

The founder chose the smallest dependable feedback contract. A terminal
**Request changes** result without an explanation is fast for the reviewer but
can be useless to the staff member who must repair the candidate. A checklist,
thread, attachment, assignee, mention, suggested-edit, or source-specific form
would add speculative structure and create a second collaboration product.

The decision is therefore accepted only with precise boundaries. Core requires
one private, plain-text answer to **What needs to change?** for the exact
candidate and exact review result. The reviewer may reference at most one
source-certified section that was visible in the review. The explanation is
not a comment, conversation, task, approval reason taxonomy, instruction to an
AI, public annotation, or permission-bearing record. It cannot itself edit the
candidate, identify an assignee, mark work complete, or approve a successor.

The corrected contract uses a balanced safety ceiling of **1,000 Unicode code
points**, not an arbitrary tiny field. The interface lets people type or paste
past that ceiling, tells them exactly how far over they are, and preserves the
draft while they shorten it; it never silently truncates. This numeric ceiling
is a Core product judgment to bound storage, rendering, abuse, and staff
reading cost while leaving room for several short related corrections and
international text. It is not asserted as a universal industry optimum. Pilot
data must determine whether it is too low or unnecessarily high.

The optional source anchor is a stable, source-issued identifier from the exact
immutable review projection—not selected text, a DOM path, CSS selector,
localized label, array index, URL, or caller-authored identifier. An anchor
adds context but never replaces the required explanation. If it cannot later
resolve, Core keeps the explanation and truthfully says that the original
location is unavailable; it never guesses another location.

The source-owned command commits the terminal review result, canonicalized
explanation body, optional verified anchor, immutable receipt, lane transition,
and authorization-context end as one fenced business effect. A lost response
retries the same semantic command. A concurrent approval, decline, takeover,
cancellation, candidate supersession, policy loss, or another terminal result
produces one winner and no orphan feedback.

For reviewers, the experience is one calm Base Maia **inline decision panel**
inside the review page, so evidence remains available while they explain the
correction.
For staff, the result appears on the existing source-owned candidate repair
surface as **Changes requested**, followed by the explanation and optional
**Related section**. It is referenced—not copied—into successor lineage. There
is no **Mark addressed**, reply box, thread, notification body, email body, or
manual feedback status. The source transition and fresh review of a successor
remain authoritative.

## Is this current modern best practice?

**Yes, with the amendments in this report.** Current official product guidance
shows a strong, convergent pattern: negative or change-requesting decisions
carry explanatory feedback that tells the author what to address.

- GitHub's current review flow asks for a summary comment and defines
  **Request changes** as feedback the author must address. It also supports
  optional line-specific context. That supports explanation plus optional
  contextual anchoring, but GitHub's full conversation/suggestion model is
  intentionally broader than Core needs.
- HubSpot's current Website/content approval flow sends reviewers to
  **Request changes** and add comments; its mobile flow explicitly asks for
  comments detailing the changes that need to be made. Its deal approval flow
  similarly pairs **Request changes** with a comment for the owner.
- Microsoft Fabric's current approval guidance says to add a comment describing
  the suggested change so the author understands the required modification.
- Blackbaud Grantmaking's current nonprofit workflow asks reviewers to complete
  required feedback fields and, when an application is rejected, records a
  reason plus internal comments with a 2,000-character limit while advising
  concise, objective decision context. This is relevant sector precedent for a
  bounded explanation, but its grant-declination taxonomy and correspondence
  controls do not belong in D30 Website review.
- Oracle and Salesforce document approval configurations where a negative,
  pushback, or rejection outcome requires an explanation. These prove that a
  required reason is an established governance pattern, not that Core should
  import their generic workflow engines.
- Contentful supports field-level contextual feedback. That supports an
  optional source anchor's usefulness, while its mentions and conversations
  demonstrate the complexity Core avoids by keeping D30 single-result and
  non-conversational.
- W3C form guidance says to ask only what is required, visibly identify
  required fields, provide instructions, validate on the server, preserve
  understandable focus order, and expose errors/status in text.
- GOV.UK's current character-count guidance advises generous limits, allowing
  overtyping so users can edit down, and specific accessible errors rather than
  silent `maxlength` truncation.
- OWASP requires server-side bounds, contextual output encoding, controlled
  state transitions, and exclusion of sensitive bodies from logs.

The pattern is not universal. GitLab permits an optional final review summary,
and Microsoft Power Automate permits approval/rejection comments to be optional
in its general approval center. Those are the strongest evidence for the
optional-note alternative. Core rejects that alternative only for this exact
D25 external `changes_requested` result: the reviewer is asserting that repair
is required and loses access when the result commits, so a bare result is
semantically incomplete. D30 does not turn optional notes into a platform-wide
anti-pattern or silently change another source's contract.

No primary source proves that **1,000 characters**, **one anchor**, or Core's
exact copy is universally optimal. Those are proportionate product judgments
that fit D25's focused review, the immutable-candidate model, the Base Maia
system, and Core's refusal to build a generic workflow/comments product.

### Why 1,000 Unicode code points—not 500 or 2,000

| Ceiling | Benefit                                                                                                                           | Material cost                                                                                                                                                                                    | D30 conclusion                                                                         |
| ------: | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
|     500 | Strong visual cue toward brevity; smallest body                                                                                   | Too easy to constrain multilingual explanations or several related corrections and may drive abbreviations or out-of-band contact                                                                | Reject as an unproved narrow limit                                                     |
|   1,000 | Roughly 150–200 English words, with enough room for several short points and international text while remaining quickly scannable | Still requires wrapping, counting, and product monitoring                                                                                                                                        | **Choose for D30 v1** and monitor actual limit pressure                                |
|   2,000 | Generous and inexpensive to store; Blackbaud uses the same numeric ceiling in a different nonprofit rejection context             | Allows roughly a mini-specification, increases staff scanning and sensitive-paste exposure, and weakens the founder's explicit “concise” requirement without evidence that 1,000 is insufficient | Reject as the default; raise through a versioned decision if real evidence requires it |

The UI says **Up to 1,000 characters**, but it does not visually invite an
essay: the textarea starts at five lines and the count remains quiet until 80
percent. The server and database use **Unicode code points** consistently. They
do not use UTF-8 bytes, JavaScript UTF-16 code units, locale-dependent words, or
grapheme clusters as competing limits. If legitimate reviewers hit the limit,
Core studies the original-language examples under privacy-safe research and
raises it through a versioned decision rather than teaching abbreviation,
encouraging attachments, or pushing work into external email.

## Evidence labels, confidence, assumptions, and unknowns

- **Repository fact:** D25 gives one nonmember one candidate-scoped, read-only,
  no-store review projection and only a small source-certified action surface.
- **Repository fact:** D25 already makes **Request changes** terminal for that
  exact external review; a corrected successor needs fresh review authority.
- **Repository fact:** D27/ADR-0182 permit one current responsibility lane and
  require one current-fact compare-and-swap winner.
- **Repository fact:** D28 decline/expiry recovery is separate. A valid D30
  result must never masquerade as a D28 reassignment episode.
- **Repository fact:** current Core runtime contains no Phase 24 external-review
  feedback schema, endpoint, source-anchor manifest, or Live D30 UI.
- **Repository fact:** `packages/auth/permissions.ts` currently exposes only
  four broad MVP staff capabilities and explicitly gives every staff subrole
  the same set. Those broad roles are not safe D30 read/write authority.
- **Repository fact:** `packages/ui/components.json` is `base-maia`, uses Base
  UI, zinc semantic tokens, CSS variables, and the shared UI package. D30 may
  not introduce another component system or app-local primitive.
- **Verified external fact:** current comparable approval products commonly
  pair change/rejection outcomes with actionable explanatory feedback.
- **Verified external fact:** contextual anchoring can reduce ambiguity, but
  comments, mentions, assignments, and threads are separate capabilities.
- **Product judgment:** one required plain-text explanation, zero or one
  certified anchor, and a 1,000-code-point ceiling are the best lean Core v1.
- **Assumption:** external reviewers can usually explain a Website correction
  within 1,000 code points and staff can act without a conversation thread.
  Representative nonprofit staff/reviewer research must test this.
- **Unknown:** real explanation length distribution, anchor use, abandonment,
  language mismatch, sensitive-data attempts, and how often a reviewer wants
  to correct a submitted explanation.

Confidence is **high** for requiring a private explanation, keeping the result
source-owned, making the anchor optional and stable, enforcing authorization
at read/write, and excluding comments/tasks/email. Confidence is **medium** for
the numeric ceiling, final English copy, inline-panel placement, and
source-anchor uptake until moderated, multilingual nonprofit testing.

## Current behavior, intended behavior, and best permanent path

### Current behavior

There is no merged D30 runtime. The phrase **structured, non-public feedback**
in D25 is direction, not a finished data contract. Existing Mission Control
task descriptions, ministry-update comments, generic text fields, Payload CMS
content, email replies, provider events, or audit logs are not valid D30
authorities or storage precedents. Current broad staff role checks also cannot
prove source-specific visibility.

### Intended behavior

An authenticated D25 reviewer who still holds the exact current Candidate
Review Authorization Context chooses **Request changes**. Core opens a focused
surface, requires one bounded private explanation, optionally accepts one
source-certified anchor, previews the consequence, and submits one atomic
source command. The external review ends. The candidate remains unchanged and
unpublished. Existing Live Website and Giving behavior remains unchanged. An
authorized staff member sees the explanation on the candidate repair surface;
any corrected successor requires fresh review.

### Best permanent path

Extend each source's existing D25 adapter with one versioned
`changes_requested` payload contract and one shared narrow feedback-body
primitive. Keep the source as review-result owner. Store the readable body in a
separately protected, retention-bound record referenced by an immutable,
body-free result/receipt so eventual lawful body disposal does not rewrite the
historical decision. Register source anchor kinds and validation in the source
adapter. Use a server command in `packages/api`; permit no browser table write,
generic comments table, CMS collection, workflow task, or provider dependency.

## Exact corrected decision

### D30-R1 — exact semantic purpose

**Request changes** means that the exact reviewer found at least one correction
needed before the exact candidate can satisfy review. It ends that external
review without approving, editing, publishing, cancelling, or selecting the
next reviewer or responsibility lane.

### D30-R2 — one explanation is mandatory

The command SHALL contain exactly one private explanation. After canonical
line-ending conversion and removal of surrounding Unicode whitespace, it must
contain at least one visible non-control code point. Empty, whitespace-only,
format-control-only, missing, null, or several-body input rejects and changes
nothing. Core does not impose a semantic minimum length or claim software can
prove that prose is actionable.

### D30-R3 — plain text and generous exact ceiling

The explanation is Unicode plain text with line breaks and a maximum of 1,000
Unicode code points after canonicalization. It supports natural language,
punctuation, CJK, combining marks, and emoji. It is never Markdown, HTML, rich
text, Tiptap JSON, a template, a URL field, or executable content. The UI
allows overtyping and gives an accessible count; the server independently
enforces the same definition. Input is never silently truncated.

### D30-R4 — no semantic policing

Core SHALL NOT require categories, severity, priority, assignee, due date,
checklist, issue type, locale selection, title, attachment, screenshot,
suggested edit, mention, signature, or AI classification. Helpful copy and
examples encourage specificity. Punctuation-only or very short accepted input
may be measured for product research but is not blocked by an invented minimum
or opaque quality score.

### D30-R5 — one optional source-certified anchor

The reviewer may attach zero or one anchor offered by the exact source adapter
from the exact projection they can currently see. The anchor is a stable,
opaque, versioned source identity bound to Tenant, environment, Site, source,
candidate, candidate revision, review epoch, and projection digest. A free-
form ID, label, quote, index, route, URL, DOM path, selector, screen coordinate,
or anchor from another candidate is rejected.

### D30-R6 — anchor never substitutes for prose

Choosing an anchor never satisfies the explanation requirement. Removing or
changing the anchor leaves the explanation draft intact. A source with no safe
stable anchor simply omits the optional control; it does not fabricate one or
block **Request changes**.

### D30-R7 — anchor history and failure truth

The stored anchor always identifies only the reviewed candidate projection.
When currently authorized staff follow it, Core opens that retained original
projection—not Live content or a successor location. If the original location
cannot resolve, Core shows **The original section is no longer available** and
keeps the explanation. It never retargets by lineage inference, matching
labels, or nearby text.

### D30-R8 — source ownership and reference-not-copy

The consequence-owning source owns the D30 result, body reference, anchor,
candidate lineage, repair projection, successor relation, and final command.
Notifications, route items, search indexes, reports, CMS/Payload documents,
emails, provider payloads, caches, and successor candidate fields may reference
an authorized projection but never become write authority or independent body
copies.

### D30-R9 — reviewer UI entry

The external review surface keeps its three D25 actions. Choosing **Request
changes** expands one shared Base Maia inline decision panel within the read-
only review. It does not navigate into Mission Control, open a comment sidebar,
make the evidence inert, or hide what is being reviewed. The trigger exposes
`aria-expanded` and `aria-controls`; opening it has no business side effect.

### D30-R10 — exact reviewer copy

The surface uses:

- title: **Request changes**;
- description: **Tell Hope Ministries what must be corrected. This ends your
  review of this version. The current website and Giving stay unchanged.**;
- label: **What needs to change? (required)**;
- audience: **Visible only on this review to authorized Hope Ministries staff.**;
- hint: **Be specific enough for staff to act. Do not include passwords,
  payment or donor details, or private personal or ministry-location
  information. Up to 1,000 characters.**;
- optional row: **Related section (optional)**;
- secondary action: **Keep reviewing**;
- primary action: **Request changes**.

The organization, Site, locale, candidate effect, and current/unchanged facts
come from the same D25 safe projection. Copy never promises that a person was
notified, that work was assigned, or that a correction will be published.

### D30-R11 — optional anchor interaction

An anchorable evidence section may offer **Reference this section**. The inline
panel then shows its localized safe display label with **Change** and **Remove**.
Alternatively, **Choose a section** opens a keyboard-operable list containing
only source-certified sections already visible to this reviewer. There is no
free-form search across source records, quote selection, drag target, or
multi-anchor chip collection.

### D30-R12 — exact validation and status copy

The empty error is **Describe what needs to change.** The length error is
**Shorten the explanation to 1,000 characters or fewer.** The visual counter
says **1,000 characters available**, **200 characters remaining**, or **23
characters over**, as applicable. Screen-reader announcements are throttled
and occur after a pause and at meaningful thresholds rather than every
keystroke. A stale/invalid anchor says **That section is no longer available
for this review. Remove the link or refresh the review.** Errors are persistent
text, programmatically associated, and never color/toast alone.

### D30-R13 — draft behavior and closing

The unsent explanation and anchor remain local in memory only; D30 creates no
server draft, local-storage body, cookie, analytics property, log field, or
auto-save. A failed submit leaves the draft visible. Closing an untouched
surface returns focus to **Request changes**. Closing a nonempty draft first
asks **Discard this explanation?** with **Keep writing** initially focused and
**Discard explanation** as the explicit destructive action.

### D30-R14 — submission and weak-network truth

While submitting, the action says **Requesting changes…** and duplicate clicks
cannot create another command. Core does not show success optimistically. A
definite failure says **We couldn't submit your request. Nothing changed. Your
explanation is still here. Try again.** Known offline state says **You're
offline. Reconnect to request changes.** A lost/unknown response retries the
same semantic command identity and never asks the reviewer to invent another
result.

### D30-R15 — success and stale-result copy

A committed result shows **Changes requested**, **Your feedback was recorded
for Hope Ministries**, and **Your access to this version has ended. No Website
or Giving change was made.** It does not say **Sent**, **Assigned**, **Read**,
**Published**, or **Eli was notified** without separate proof. If another
transition won, Core shows **This review has already ended. Your explanation
was not submitted.** and the actual privacy-safe current state. The losing
draft remains visible until the reviewer closes or copies it.

### D30-R16 — atomic source command

One source-owned transaction re-proves trusted Tenant, environment, Site,
source, candidate, review epoch, intended stable human, active D25 context,
D23/D24 independence, D26 posture, current D27 lane, source admission,
projection digest, assurance, expiry/revocation, body bounds, optional anchor,
and expected heads. It atomically records the `changes_requested` result,
readable-body reference, verified anchor reference, immutable command receipt,
lane/source transition, and D25-context end. Any failed proof writes none of
those effects.

### D30-R17 — concurrency and semantic idempotency

Approval/completion, decline, takeover, cancellation, policy loss, identity
loss, candidate supersession, another terminal result, and **Request changes**
compete on the same authoritative fence. One wins. Same key plus the same
canonical meaning returns the original receipt; the same key with different
body, anchor, candidate, or meaning rejects. Transport, retry, browser tab, and
provider IDs are not the durable business identity.

### D30-R18 — lifecycle and successor behavior

`reviewing → changes_requested` is terminal for that exact external review.
It never enters D28 `reassignment_needed`. The candidate remains immutable and
the current Live Site remains unchanged. A source-authorized repair command may
create a successor candidate referencing the prior result/body; the successor
must satisfy fresh participation, review, policy, lane, and invitation proof.
No previous authorization, anchor, approval, or feedback status carries
authority forward.

### D30-R19 — staff repair experience

An authorized source detail shows a calm **Changes requested** state, the
private **What needs to change** body, optional **Related section**, source-
owned candidate context, and the one lawful next source action. The body is
read-only and wraps normally. It offers no reply, mention, reaction, edit,
delete, assign, due date, **Mark addressed**, status dropdown, checklist, or
manual completion. A successor repair view references **Previous review
feedback** and says **A new review is required after changes.**

### D30-R20 — identity and disclosure are separate

The right to read the feedback body does not automatically grant the right to
see external reviewer identity/contact, other participants, route members, or
engagement. The default attribution may be **External reviewer**. The name Eli
appears only where the exact source's purpose-specific detail authorization
admits it. Notification previews and emails contain neither the explanation nor
anchor label.

### D30-R21 — input/output security and sensitive content

The server applies shared safe-text validation and rejects invalid Unicode,
NUL, disallowed transport controls, and over-limit input. It does not use
brittle secret, payment-card, word, sentiment, punctuation, markup, language,
or URL detection as a submission gate: such heuristics create false positives
without proving safety. The UI gives concise prevention guidance, while a
narrow audited privacy/security path can quarantine and dispose of sensitive
feedback after submission. Stored input remains plain data; every display uses
context-correct framework escaping, inert URLs, `dir=auto`, bidi isolation, and
no `dangerouslySetInnerHTML`. Explanation text never enters HTML, JavaScript,
CSS, SQL, templates, prompts, or link targets, and raw input is never echoed to
logs or telemetry.

### D30-R22 — conceptual relational contract

The source result is append-only and references a separately protected
readable feedback body. Both carry non-null same-scope composite identity for
Tenant, environment, Site, source kind, candidate, candidate revision, review
epoch, result, and reviewer context. Exactly one current terminal result exists
per exact review. The feedback body is non-null for `changes_requested` and
forbidden for result kinds whose contracts do not admit it. The optional anchor
foreign key must match the exact candidate/projection manifest. Database
constraints enforce cardinality, result/body compatibility, canonical length,
same-scope references, and immutable history.

### D30-R23 — authorization, grants, RLS, and privileged paths

Browser roles receive no insert/update/delete grant on D30 result, body, anchor,
receipt, or audit tables. Read projections are purpose-limited and re-prove
current source visibility. Tables use `ENABLE` and `FORCE ROW LEVEL SECURITY`,
operation-specific grants, `USING` for old-row visibility and `WITH CHECK` for
new-row scope, security-invoker views where appropriate, and hardened
security-definer functions with fixed safe `search_path` only where necessary.
Secret/service-role paths execute the same policy adapter and poison tests;
their RLS bypass is never treated as authorization.

### D30-R24 — trusted attribution and non-transformability

Tenant, environment, Site, source, candidate, context, reviewer Party/human,
actor, author, result kind, timestamps, retention class, and audit attribution
derive from trusted server state. The caller supplies only the bounded body,
one offered anchor token, expected public command nonce, and idempotency key.
No update may move a permitted row to another Tenant/Site/candidate, change its
author/result, replace its body, or transform it into an approval.

### D30-R25 — privacy, retention, export, and repair

The readable body binds at creation to the source's effective records schedule;
D30 invents no global keep-forever period or Tenant-authored retention picker.
Holds and lawful records rules govern disposal. When readable retention ends,
the body and derived readable copies become inaccessible and are disposed
through Phase 29-compatible primary/backup/restore suppression while lawful
body-free result, protected non-enumerable fingerprint/reference, actor
tombstone, receipt, and disposal evidence remain. Generic analytics,
notifications, logs, traces, search, AI, and exports
never receive the body. Exact authorized source/custody exports may include it
only while lawfully retained. A purpose-authorized privacy owner can quarantine
and disposition an accidentally sensitive body through an audited command;
support never edits SQL or silently rewrites history.

### D30-R26 — observability and audit separation

The durable business history records result identity, trusted actor, candidate,
review epoch, protected body reference and—only when required for integrity or
idempotency—a versioned keyed non-enumerable fingerprint, anchor identity,
policy/adapter versions, expected heads, outcome, and correction/disposal
events. A raw or unsalted content hash is forbidden because it could correlate
or dictionary-test short feedback after disposal. Technical telemetry is low-
cardinality and body-free. Correlation IDs connect command, transaction,
outbox, projection, and repair without logging prose, fingerprints, anchor
display labels, reviewer contact, donor/member-care facts, tokens, or raw
request bodies.

### D30-R27 — Base Maia, accessibility, localization, and resilience

D30 composes existing `@asym/ui` Base Maia Card/Collapsible or equivalent
inline-region composition, Textarea, Field, Button, and list primitives with
semantic tokens. It meets keyboard,
screen-reader, focus-return, visible-focus, 44-by-44 target, 320-CSS-pixel and
400-percent reflow, zoom, forced-colors, reduced-motion, text-spacing, mobile
safe-area, long-name, CJK, combining-mark, emoji, RTL, bidi-isolation, and
weak-network requirements. Interface copy localizes independently of candidate
and explanation language. Core never machine-translates the explanation and
calls it authoritative.

### D30-R28 — no unrelated product or authority

D30 creates no conversation, generic comment, issue, task, queue, assignment,
mention, reaction, attachment, checklist, category taxonomy, SLA, priority,
timer, due date, reminder, email, push, SMS, escalation, AI classification,
auto-fix, editor, publication, public annotation, Page/Navigation authority,
Giving, Legal Entity, Stripe, settlement, bank, currency, contribution,
receipt, ledger, or accounting effect.

### D30-R29 — versioning, rollout, and reservation

The result contract, body policy, anchor manifest, UI copy, source adapter, and
read projections are versioned. D30 remains Reserved until ADR/glossary,
OpenSpec, registry, schema/RLS, source adapters, exact permission capabilities,
migrations, old/new compatibility, accessibility, production-shaped tests,
canary, monitors, repair, retention, and release evidence prove the same
contract. No current broad role, comment table, or UI prototype activates it.

## Complete external-reviewer UX/UI contract

### Review page before the action

The D25 page remains the focused, authenticated, no-store review surface. It
shows Hope Ministries, `hope.org`, French (Canada), the exact candidate effect,
and text-first **Current**, **Proposed**, and **Unchanged** evidence. The sticky
action region remains reachable after zoom/reflow without covering content:

- **Request changes**;
- the exact favorable source action; and
- **Decline**.

Actions are buttons with visible text, not icon-only controls or a single
ambiguous **Submit review** menu. Opening **Request changes** mutates nothing.

### Request changes inline decision panel

Desktop keeps the read-only evidence in the main column and expands a Base Maia
decision Card in the existing review-action rail. Small screens insert the
full-width Card immediately after the action that opened it. It remains in
ordinary document flow, respects safe areas, and never overlays or makes the
evidence inert. Reviewers can continue to inspect evidence, use **Reference
this section**, and return to the form without closing a context-hiding modal.

The trigger exposes `aria-expanded` and `aria-controls`. On open, focus moves
to the panel heading (not the textarea, avoiding an unexpected mobile
keyboard). The next Tab reaches the required textarea. Within the panel the
order is heading, description, textarea, count/status, related-section control
when present, **Keep reviewing**, and **Request changes**. There is no focus
trap. **Keep reviewing** collapses the panel and restores focus to the trigger.
Navigating away or collapsing a nonempty draft invokes the same in-flow discard
confirmation; Escape alone does not silently discard prose.

The textarea is visibly at least five text lines, grows to a bounded height,
wraps without horizontal scrolling, and preserves line breaks. Its visible
label, required status, hint, error, and count are all programmatically
associated. There is no placeholder-as-label and no prefilled example that
could be submitted accidentally. Spellcheck may use the user's browser
preference; autocorrect never changes stored content after submit.

The character count stays quiet until 80 percent of the limit for sighted
users, while assistive technology receives the limit when entering the field.
After the threshold it updates visually; polite announcements occur after
typing pauses and at 200 remaining, 50 remaining, limit reached, and over-limit
transitions. Users may paste over 1,000 and edit down. Submission focuses the
specific error instead of dropping text.

### Related section

If Eli opened the panel from the **Contact us** evidence section, the optional
row reads:

> **Related section (optional)**  
> Contact us  
> **Change** · **Remove**

If no section is preselected, **Choose a section** opens a simple accessible
list of source-certified visible sections. Each option uses a text label and,
when necessary, a short source-owned context label; it never relies on a
thumbnail, color, DOM position, or language flag. Selecting returns focus to
the related-section row. A source with no stable anchor does not show the row.

### Submission states

| State              | User-visible truth                                                     | Available action                                 |
| ------------------ | ---------------------------------------------------------------------- | ------------------------------------------------ |
| untouched          | Required field, concise hint, no error                                 | write, choose anchor, Keep reviewing             |
| nonempty valid     | count remains quiet below threshold                                    | Request changes                                  |
| empty submit       | **Describe what needs to change.**                                     | return to field                                  |
| over limit         | exact characters over and specific error                               | edit down; draft preserved                       |
| stale anchor       | anchor error; explanation preserved                                    | remove anchor or refresh review                  |
| known offline      | **You're offline. Reconnect to request changes.**                      | edit/keep reviewing; submit after reconnect      |
| submitting         | **Requesting changes…**                                                | duplicate action disabled; cancel not fabricated |
| definite failure   | **Nothing changed. Your explanation is still here.**                   | retry same command                               |
| unknown response   | safe checking state, then same-key retry                               | never submit a new meaning automatically         |
| concurrent loser   | **This review has already ended. Your explanation was not submitted.** | inspect safe result; close                       |
| committed          | **Changes requested** and exact unchanged consequences                 | close                                            |
| authorization loss | protected review content is removed immediately                        | re-authenticate only if D25 still admits it      |

### Hope Ministries reviewer journey

Eli finds that **Contact us** opens English content. From that evidence section
he chooses **Reference this section**, then **Request changes**. The panel says
that this ends only his review and leaves the current website and Giving
unchanged. He writes:

> The Contact us link opens the English page. It should open the French
> (Canada) contact page.

The source section is already attached. Eli chooses **Request changes** once.
Core commits the result, closes that review context, and shows **Changes
requested**. It does not claim Maria received an email or that the Site changed.

### Authorized staff journey

Maria opens the existing Languages/candidate source surface and sees:

> **Changes requested**  
> The external reviewer found a correction needed for this version. The
> current website and Giving are unchanged.
>
> **What needs to change**  
> The Contact us link opens the English page. It should open the French
> (Canada) contact page.
>
> **Related section**  
> Contact us
>
> **Next step**  
> Create a corrected version. A new review is required after changes.

Only independently authorized staff see this detail. Maria cannot edit Eli's
words, mark them addressed, reply, or convert them into a task. She uses the
source's normal correction command. The successor references the prior
feedback in a read-only **Previous review feedback** section; it does not copy
the prose into an editable Page field.

### Privacy-reduced staff journey

A staff member authorized to repair the candidate but not to see external
contact identity sees **External reviewer requested changes**, the permitted
feedback body, and the exact next source action. Another staff member who can
see only a privacy-safe notification sees **Changes requested** and a link to
the source; the body and anchor label are absent. No public, donor, missionary,
Giving, or external-review-follow-up item contains the prose.

### Long text, multilingual, RTL, and low-bandwidth behavior

- A 1,950-code-point CJK explanation is accepted; word count is never used.
- Arabic or Hebrew input uses `dir=auto`, preserves logical reading order, and
  isolates Site names, locale tags, paths, counts, and reviewer attribution.
- Combining sequences and emoji are retained; the shared code-point counting
  implementation is identical in client validation, API, and database proof.
- Long unbroken paths wrap; typed URLs stay inert text.
- At 400 percent zoom and 320 CSS pixels, content remains one column, actions
  remain reachable, and no text or counter is obscured.
- On a slow connection, the draft never disappears behind a spinner and no
  optimistic terminal state appears. A timeout returns to a retryable state.
- No body is placed in local storage for offline persistence. If navigation
  would discard a nonempty draft, Core warns explicitly.

## Source of truth and conceptual data boundaries

| Fact                                 | Authoritative owner                         | Read/derived projection              | Never authoritative                        |
| ------------------------------------ | ------------------------------------------- | ------------------------------------ | ------------------------------------------ |
| exact candidate and review epoch     | consequence-owning source                   | D25 safe review projection           | URL, UI cache, email, CMS copy             |
| external review context/human/expiry | Phase 12 + D25/Phase 4                      | focused session projection           | contact row, link possession               |
| result kind and terminal transition  | consequence-owning source                   | staff status and body-free audit     | comment, notification, provider event      |
| explanation readable body            | source-owned protected feedback-body record | exact authorized repair/history view | task description, email, search, analytics |
| source anchor identity/manifest      | versioned source adapter                    | safe localized display label         | DOM path, text match, index, caller label  |
| current lane                         | source/ADR-0182                             | status display                       | reviewer UI state, provider delivery       |
| successor candidate relation         | source                                      | Previous review feedback projection  | copied editable prose                      |
| unread/read attention                | Phase 17 engagement                         | recipient item                       | source result or feedback status           |
| retention/hold/disposal              | source records class + Phase 29             | authorized availability state        | UI hide, support deletion, backup age      |
| actor/author/audit attribution       | trusted server context + CRM Party          | purpose-safe identity/tombstone      | caller-supplied user ID or email           |

### Conceptual relational shape

This is a contract, not permission to freeze exact physical names before the
design/OpenSpec pass:

1. An append-only source review-result row identifies the exact same-scope
   candidate/review epoch, terminal `changes_requested` result, trusted actor,
   authorization context, policy/adapter versions, expected heads, receipt,
   and one readable-body reference.
2. A separately protected append-only feedback-body row stores canonical plain
   text, code-point length, a versioned keyed non-enumerable fingerprint when
   required, effective records class, encryption/custody metadata, and disposal
   state. This separation permits lawful readable-body disposal without
   rewriting the result.
3. An optional anchor reference identifies one row in the immutable,
   source-versioned projection-anchor manifest and repeats the same composite
   Tenant/environment/Site/source/candidate/revision/review-epoch scope.
4. A semantic command-receipt uniqueness key binds exact context, result
   meaning, the canonical body's versioned keyed fingerprint, anchor identity,
   and idempotency key without exposing a reusable raw content hash.
5. Successor candidates reference the prior result identity; they never copy
   the body as a new write-authoritative value.
6. Privacy quarantine/disposal/correction evidence is append-only. It may end
   readable access or supersede a display projection but cannot change the
   historical terminal result.

Required database properties include non-null Tenant/environment/Site/source
scope, same-scope composite foreign keys, a unique terminal-result slot per
review epoch, `changes_requested`/body compatibility checks, canonical
code-point bounds, zero-or-one anchor cardinality, immutable result/author/body
identity, explicit delete behavior, indexes beginning with Tenant/environment
and source lookup keys, and no nullable field whose absence ambiguously means
not-required, disposed, unavailable, or authorization-denied.

## Domain invariants

1. One exact external review has at most one terminal result.
2. `changes_requested` has exactly one admitted readable-body reference at
   commit; other result kinds cannot accidentally inherit it.
3. The explanation is private plain text, not executable or public content.
4. Explanation presence is required independently of anchor presence.
5. An anchor is absent or names exactly one source-certified location in the
   exact reviewed projection.
6. An unresolved anchor never removes or retargets the explanation.
7. Only a current D25 reviewer context may submit the result.
8. Only current source-purpose authorization may read each projection.
9. Reviewer identity, body access, contact access, and source action are
   distinct permissions.
10. Result, body, anchor, receipt, candidate, and review epoch cannot cross
    Tenant, environment, Site, or source scope.
11. The terminal result, lane/context end, and body/anchor record commit
    atomically or not at all.
12. A retry cannot create another result or change already committed prose.
13. A successor candidate is distinct and needs fresh review; prior feedback
    is context, never approval or authority.
14. Existing Live Website and Giving remain unchanged by D30.
15. No read, notification, task, anchor click, staff repair, or body disposal
    rewrites the historical review outcome.
16. Readable-body retention follows one source records class and hold policy;
    audit history alone never recreates disposed prose.
17. Logs, traces, metrics, analytics, notifications, emails, and generic search
    remain body-free.
18. External text is never machine-translated, summarized, or classified as
    authoritative without a separately decided product contract.
19. Loss of authorization removes readable presentation immediately without
    deleting lawful history or exposing whether a hidden row exists.
20. Invalid, stale, ambiguous, partial, or indeterminate proof fails safely and
    never broadens access or guesses a result.

## Lifecycle, state transitions, concurrency, and repair

| Current state/event                                             | Admitted transition                   | Required result                                                  |
| --------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| active exact external review; valid body; optional valid anchor | `reviewing → changes_requested`       | atomic result/body/anchor/receipt; context and external lane end |
| action merely opened                                            | no transition                         | local empty draft only                                           |
| empty/over-limit/unsafe body                                    | no transition                         | precise field error; draft preserved                             |
| absent source-anchor support                                    | valid request without anchor          | explanation alone commits                                        |
| invalid or stale anchor                                         | no transition until removed/refreshed | body draft preserved; no guessed anchor                          |
| same semantic retry after commit                                | replay original receipt               | one result, no new body or notification                          |
| same idempotency key with changed meaning                       | reject conflict                       | original result remains                                          |
| approval/completion wins first                                  | stale Request changes                 | no feedback/result write                                         |
| Request changes wins first                                      | later approval/decline/takeover stale | no second terminal effect                                        |
| candidate superseded/cancelled first                            | stale Request changes                 | body not persisted; safe terminal truth                          |
| policy/identity/context revoked first                           | deny                                  | protected projection removed                                     |
| transaction committed; outbox delayed                           | result remains authoritative          | reconcile derived presentation by same result identity           |
| readable body later quarantined                                 | result unchanged                      | ordinary display removed; audited restricted repair state        |
| readable retention ends                                         | result unchanged                      | body disposed; body-free history and disposal evidence remain    |
| successor created                                               | new candidate/review epoch            | prior feedback referenced read-only; fresh review required       |

Repair never means editing the terminal result or running ad hoc SQL. The
source/privacy owner may reconcile a missing projection from the immutable
result, quarantine a sensitive body, restore a wrongly quarantined body if it
remains lawfully retained, or execute scheduled disposal. Each command is
capability-gated, expected-head fenced, idempotent, audited, and same-scope.
Provider delivery or notification replay cannot create or alter D30 truth.

## Full adversarial category review

Every category evaluates the founder's unamended phrase first, then records the
amendment required for the accepted permanent decision.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

- **What could go wrong:** A required field could solve an imagined reporting
  need rather than the real repair problem, while an optional note could leave
  staff unable to tell what failed. Conversely, a checklist or comment system
  could freeze speculative process into every source.
- **Why it matters:** External review already adds friction and disclosure. The
  feedback step is justified only if it makes the terminal negative result
  actionable without creating another product.
- **Severity:** High.
- **Likelihood:** High if “concise explanation” remains undefined.
- **Evidence or reasoning:** GitHub, HubSpot, Microsoft, Oracle, and Salesforce
  pair negative/change-requesting outcomes with explanatory feedback. W3C says
  forms should ask only what is required. Repository D25 needs a source-owned
  result but rejects a generic guest/workflow surface.
- **Decision effect:** Validates the founder's root choice, narrows it to one
  exact plain-text body, and rejects bare result, mandatory structure, and no-
  build alternatives.
- **Best permanent fix:** Require the minimum prose necessary for staff to act;
  make one contextual anchor optional; measure poor-quality/limit outcomes
  without an inflexible semantic gate.
- **Exact decision/spec language:** “A `changes_requested` result SHALL contain
  exactly one bounded private plain-text explanation; zero or one source-
  certified anchor MAY add context but SHALL NOT replace the explanation. D30
  SHALL create no checklist, category taxonomy, thread, task, or attachment.”

### 2. Brittleness

**Material concern: Yes.**

- **What could go wrong:** Free text may be empty after Unicode normalization,
  exceed transport/display limits, use RTL/CJK/combining marks, contain long
  paths, or rely on an anchor that disappears. DOM positions and localized
  labels will drift across renderers and successor candidates.
- **Why it matters:** A flow that works only for short English sentences and
  stable desktop markup will lose or mispoint the reason staff need to repair.
- **Severity:** High.
- **Likelihood:** Medium-High across international, evolving Website sources.
- **Evidence or reasoning:** Core explicitly supports international locales,
  mobile/low-bandwidth field conditions, and immutable candidates. Contentful
  demonstrates contextual feedback value, but its anchor model is product-
  specific; W3C requires robust semantic relationships.
- **Decision effect:** Narrows the answer to Unicode plain text, exact bounds,
  stable source identities, and graceful anchor failure.
- **Best permanent fix:** Version anchor manifests; bind anchors to exact
  projection scope; keep prose primary; use shared canonicalization/counting
  and exhaustive multilingual fixtures.
- **Exact decision/spec language:** “Anchor identity SHALL be source-issued and
  candidate/projection-bound. Missing or unresolvable anchors SHALL preserve
  the explanation and display truthful unavailability; Core SHALL NOT retarget
  through labels, text similarity, indexes, URLs, selectors, or coordinates.”

### 3. Technical debt

**Material concern: Yes.**

- **What could go wrong:** Each source could invent its own textarea schema,
  count algorithm, sanitization, comment table, history UI, or anchor encoding.
  Reusing current generic comments or tasks would couple review truth to mutable
  collaboration state.
- **Why it matters:** Duplicated adapters and locally different semantics will
  drift, create security gaps, and make later sources expensive to certify.
- **Severity:** High.
- **Likelihood:** High without a shared narrow contract.
- **Evidence or reasoning:** Repository rules require shared `@asym/ui`, Base
  Maia, `packages/api` privileged commands, producer-owned protected actions,
  and reference-not-copy boundaries. Current comment/task code has unrelated
  lifecycle and authority.
- **Decision effect:** Changes implementation shape, not product scope.
- **Best permanent fix:** One versioned source-adapter interface, safe-text
  primitive, anchor manifest contract, body storage policy, command receipt,
  and shared Base Maia composition; sources retain consequence ownership.
- **Exact decision/spec language:** “All sources SHALL implement one registered
  D30 result/body/anchor adapter contract. They SHALL NOT fork validation,
  counting, RLS, receipt, or UI semantics or persist D30 through generic
  comments, tasks, CMS documents, provider messages, or app-local components.”

### 4. Edge cases

**Material concern: Yes.**

- **What could go wrong:** Empty-after-trim text, only invisible controls,
  emoji/CJK limits, pasted over-limit prose, stale anchors, two tabs, lost
  responses, expiry while typing, candidate supersession, sensitive data,
  disposed bodies, unavailable original anchors, and reviewer identity loss can
  all produce confusing or unsafe states.
- **Why it matters:** These are realistic boundary conditions on an external,
  time-bound, multilingual, privacy-sensitive surface.
- **Severity:** High.
- **Likelihood:** Medium individually; high in aggregate.
- **Evidence or reasoning:** D25/D27 already require current context, expiry,
  revocation, immutable candidates, CAS, and no-store behavior. GOV.UK warns
  against silent length truncation; W3C requires exact error recovery.
- **Decision effect:** Adds closed input, failure, concurrency, and disposal
  states; it does not invalidate the founder choice.
- **Best permanent fix:** Implement the explicit state table in this report,
  property-test Unicode/canonicalization, preserve in-memory drafts on failure,
  and make every stale/concurrent outcome body-safe and truthful.
- **Exact decision/spec language:** “D30 SHALL specify positive, empty,
  whitespace/control-only, boundary, over-limit, unsafe-content, stale-anchor,
  expired-context, concurrent-winner, lost-response, disposed-body, RTL/CJK,
  and successor-lineage outcomes. An unclassified state SHALL fail closed.”

### 5. Footguns

**Material concern: Yes.**

- **What could go wrong:** Placeholder text could be submitted as feedback;
  `maxlength` could silently truncate a pasted correction; an anchor could be
  mistaken for sufficient feedback; a staff **Mark addressed** checkbox could
  erase the source obligation; or a reviewer could paste secrets that spread
  through emails/logs.
- **Why it matters:** These are easy, ordinary mistakes with durable privacy or
  review-integrity consequences.
- **Severity:** High.
- **Likelihood:** High without deliberate UI and storage boundaries.
- **Evidence or reasoning:** GOV.UK specifically warns that `maxlength`
  truncation can make input incomplete. OWASP requires safe input/output and
  body-free logs. Repository ADR-0027 rejects user engagement as source truth.
- **Decision effect:** Requires explicit no-placeholder/no-truncation, no body
  copying, and no manual feedback-completion control.
- **Best permanent fix:** Visible labels/hints/counts, overtype-and-edit-down,
  sensitive-content prevention, atomic source state, and consequence-led copy.
- **Exact decision/spec language:** “The UI SHALL NOT prefill feedback, silently
  truncate, accept an anchor as the body, or offer manual completion/edit/delete
  controls. Readable feedback SHALL NOT enter notification/email/log/analytics
  payloads.”

### 6. Tenant safety

**Material concern: Yes.**

- **What could go wrong:** A caller-supplied Tenant, candidate, reviewer, or
  anchor could bind feedback across organizations, and caches/realtime/search
  could expose prose or even existence to another Tenant/Site/environment.
- **Why it matters:** The body may reveal unpublished ministry strategy,
  locations, people, or operational weaknesses. A cross-Tenant leak is a
  serious incident.
- **Severity:** Critical.
- **Likelihood:** Medium without composite enforcement and hostile tests.
- **Evidence or reasoning:** Repository platform principles require strict
  Tenant/environment isolation. PostgreSQL warns that referential integrity
  and policy design can create covert channels; Supabase secret/service roles
  bypass RLS.
- **Decision effect:** Adds mandatory same-scope composite keys, authorization-
  filtered projections, cache keys, realtime filters, and bypass-path parity.
- **Best permanent fix:** Server-derived scope; composite foreign keys;
  Tenant-first indexes; default-deny/forced RLS; no generic search; poison-
  Tenant tests for every direct, view, RPC, realtime, cache, export, and repair
  path.
- **Exact decision/spec language:** “No D30 result, body, anchor, receipt,
  projection, cache, realtime event, export, or error SHALL cross Tenant,
  environment, Site, source, candidate, or review-epoch scope. Scope SHALL be
  server-derived and database-constrained.”

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

- **What could go wrong:** Nullable/weak rows could record a result without a
  body, update could move feedback into a forbidden scope, table owners or
  service roles could bypass policies, permissive policies could OR into broad
  access, and caller attribution could forge the reviewer.
- **Why it matters:** UI checks do not protect APIs, stale clients, imports,
  jobs, or privileged repair paths; an invalid row could become permanent
  review truth.
- **Severity:** Critical.
- **Likelihood:** High if implemented from current broad-role or browser-write
  patterns.
- **Evidence or reasoning:** PostgreSQL documents separate `USING` and `WITH
CHECK`, table-owner/BYPASSRLS behavior, default deny, and permissive-policy
  combination. Supabase states secret/service keys bypass RLS. Current Core
  roles are intentionally broad MVP compatibility, not D30 capabilities.
- **Decision effect:** Requires server command ownership, append-only tables,
  explicit grants, forced RLS, exact capability adapters, and immutable
  attribution.
- **Best permanent fix:** Revoke browser mutations; enforce constraints and
  operation-correct policies; harden definer functions/search path; use current
  trusted context; test both ordinary and privileged paths.
- **Exact decision/spec language:** “D30 mutations SHALL execute only through
  the source-owned server command. Tables SHALL use append-only constraints,
  `ENABLE` plus `FORCE RLS`, operation-specific grants, explicit `USING` and
  `WITH CHECK`, and privileged-path authorization parity. Caller actor/scope is
  forbidden.”

### 8. Overengineering

**Material concern: Yes.**

- **What could go wrong:** “Useful feedback” could expand into categories,
  checklists, threads, mentions, attachments, annotations, suggested edits,
  translation, AI summarization, assignments, reminders, or per-Tenant form
  builders.
- **Why it matters:** Small ministry teams would face configuration and
  training burden, while Core would own a generic collaboration engine before
  evidence proves the need.
- **Severity:** High.
- **Likelihood:** High because comparable CMS products expose those adjacent
  features.
- **Evidence or reasoning:** Contentful and GitHub show the power—and breadth—
  of comments, line feedback, mentions, suggestions, and conversations. W3C
  says ask only what the transaction needs. D25 intentionally keeps a focused
  action surface.
- **Decision effect:** Strongly narrows v1 and rejects feature borrowing beyond
  the proved repair need.
- **Best permanent fix:** One textarea, zero/one certified anchor, one atomic
  result; place all richer collaboration behind future evidence and a separate
  decision.
- **Exact decision/spec language:** “D30 v1 SHALL stop at one private plain-text
  explanation and zero or one anchor. It SHALL NOT provide comments,
  conversations, replies, mentions, attachments, categories, checklists,
  suggested edits, assignment, timers, translation, or AI processing.”

### 9. UX/UI and user friction

**Material concern: Yes.**

- **What could go wrong:** An essay-like form, vague **Comment** label, hidden
  consequence, tiny field, noisy counter, mobile keyboard/focus trap, technical
  errors, or staff feedback buried in history could make the flow frustrating
  or cause wrong decisions.
- **Why it matters:** Reviewers are purpose-limited guests and staff may be
  occasional Website users. Clarity at the negative result directly affects
  repair speed, trust, and successful completion.
- **Severity:** High.
- **Likelihood:** High if the schema rather than user journey drives design.
- **Evidence or reasoning:** HubSpot and Microsoft place change-request
  comments in the decision journey; W3C and government design systems require
  short forms, clear labels/instructions, precise errors, logical focus, and
  accessible status. Core mandates Base Maia shared components.
- **Decision effect:** Adds the exact reviewer and staff journeys, copy, states,
  responsive/focus rules, and consequence preview.
- **Best permanent fix:** One consequence-led inline decision Card that keeps
  evidence available; question-form label; optional contextual anchor;
  generous count; in-place error recovery; source-owned staff repair card; no
  extra workflow chrome.
- **Exact decision/spec language:** “The reviewer surface SHALL use the exact
  D30 copy/states and shared Base Maia primitives in this report. The staff
  source surface SHALL show read-only feedback and the lawful next source
  action without a thread, task, or manual addressed state.”

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

- **What could go wrong:** A comment row, notification, successor copy, or staff
  checkbox could become a second owner of whether changes remain required. A
  disposed body could erase the fact that the review ended, or an edited body
  could rewrite historical evidence.
- **Why it matters:** Dual ownership causes contradictory UI, unsafe public
  effects, and audit drift.
- **Severity:** Critical.
- **Likelihood:** High if generic collaboration tables are reused.
- **Evidence or reasoning:** ADR-0025 makes producers own protected actions;
  ADR-0027 separates occurrence/item/engagement; ADR-0182 makes the source own
  lane transitions. Core's reference-not-copy principle rejects shadow truth.
- **Decision effect:** Requires the ownership matrix and twenty invariants in
  this report.
- **Best permanent fix:** Source-owned append-only result; separately retained
  readable body; referenced successor projection; body-free durable history;
  no write authority in tasks/comments/notifications.
- **Exact decision/spec language:** “The source result is the sole authority for
  `changes_requested`. The body provides evidence and repair context; its read,
  anchor, projection, quarantine, or disposal state SHALL NOT alter source
  result, candidate, lane, successor review, or public state.”

### 11. Hidden coupling

**Material concern: Yes.**

- **What could go wrong:** D30 could depend on D28 follow-up routing, D21
  reviewers, notification templates, email delivery, Payload document fields,
  current DOM structure, or one source's locale model. Changing any could then
  corrupt review meaning or hide feedback.
- **Why it matters:** Phase 24 spans several independent sources and future
  upgrades. Implicit coupling makes each change risky and blocks reuse.
- **Severity:** High.
- **Likelihood:** Medium-High without typed adapters and reference-only views.
- **Evidence or reasoning:** D28 explicitly excludes Request changes from its
  decline/expiry episode. ADR-0181 separates invitation/context/source
  ownership. Repository rules reject CMS/operational dual ownership.
- **Decision effect:** Keeps D30 a source result and defines narrow adapter
  seams rather than sharing state with D28/D29 or UI markup.
- **Best permanent fix:** Version result/body/anchor interfaces; reference
  source identities; compile notification-safe projections; test adapter
  compatibility independently.
- **Exact decision/spec language:** “D30 SHALL NOT open D28, route through D29,
  depend on D21 membership, infer success from Phase 17, persist in Payload, or
  bind anchors to rendered markup. Each source implements the registered D30
  adapter against shared semantics.”

### 12. Failure modes

**Material concern: Yes.**

- **What could go wrong:** The result may commit while the body/anchor fails,
  the response may be lost, projection/outbox work may lag, the anchor adapter
  may fail, or the UI may say success before transaction truth. Retrying could
  create duplicate/conflicting results.
- **Why it matters:** Staff could receive “changes requested” without the
  reason, while the reviewer is locked out and unable to repair the loss.
- **Severity:** Critical.
- **Likelihood:** Medium in distributed production systems.
- **Evidence or reasoning:** D25/D27 require atomic source commands and
  semantic idempotency; OWASP says state transitions are server-controlled;
  repository outbox patterns separate authoritative commit from secondary
  effects.
- **Decision effect:** Adds atomic body/result/anchor commit, same-key retry,
  no optimistic success, reconciliation, and body-safe repair states.
- **Best permanent fix:** Short fenced transaction with outbox after commit;
  deterministic receipt; explicit definite/unknown/stale UI; projection
  reconciliation from immutable source result.
- **Exact decision/spec language:** “A result without its admitted body SHALL be
  impossible. The transaction commits all authoritative D30 facts or none.
  Secondary projection failure SHALL preserve source truth, expose a safe
  repair state, and replay only the same semantic result.”

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

- **What could go wrong:** Expiry, revocation, supersession, takeover, approval,
  decline, or another tab may race a long-written explanation. A later policy
  or adapter change could reinterpret an old anchor or result. A transport key
  could dedupe the wrong business meaning.
- **Why it matters:** Two individually plausible actions could jointly approve
  and reject one candidate or retain feedback for a result that never won.
- **Severity:** Critical.
- **Likelihood:** Medium, with high impact.
- **Evidence or reasoning:** ADR-0182 already specifies one candidate-lane CAS
  winner and semantic retries. D25 binds every request to current context,
  expiry, candidate, projection, policy, and human.
- **Decision effect:** Defines terminal state, exact winner, no D28 transition,
  version pinning, same-meaning replay, and fresh successor review.
- **Best permanent fix:** Expected-head transaction, durable semantic receipt,
  versioned adapter/normalization, authoritative server time, and exhaustive
  race matrices.
- **Exact decision/spec language:** “`reviewing → changes_requested` SHALL be a
  terminal, version-pinned, same-fence transition. Same semantic retries replay
  one receipt; changed meaning conflicts. A successor SHALL be a new candidate
  and review epoch with fresh authority.”

### 14. Data integrity risks

**Material concern: Yes.**

- **What could go wrong:** Duplicate results, orphan bodies, cross-candidate
  anchors, mutable authors, inconsistent character counts, copied successor
  feedback, projection drift, or deletes cascading away audit could corrupt
  history and repair context.
- **Why it matters:** Review evidence affects whether protected work can proceed
  and must remain interpretable across migrations and privacy disposal.
- **Severity:** Critical.
- **Likelihood:** Medium-High without database constraints.
- **Evidence or reasoning:** PostgreSQL supports not-null, check, unique,
  primary/foreign-key, and RLS constraints; application convention alone does
  not prevent invalid states. Core requires immutable historical truth.
- **Decision effect:** Adds conceptual relational constraints, append-only
  records, explicit delete/disposal semantics, and one counting definition.
- **Best permanent fix:** Composite same-scope keys; unique review-result slot;
  result/body compatibility checks; zero/one anchor FK; immutable receipts;
  reconciliation and restore tests.
- **Exact decision/spec language:** “Database constraints SHALL make duplicate
  terminal results, orphan/missing required bodies, cross-scope anchors,
  author/result mutation, ambiguous nulls, and cascade-erased history
  impossible. Disposal SHALL be an explicit lifecycle, not row deletion.”

### 15. Security and privacy risks

**Material concern: Yes.**

- **What could go wrong:** Stored XSS, dangerous links, log injection, secrets,
  payment data, donor/member-care information, external reviewer identity,
  unpublished content, or feedback bodies could leak through UI, logs, email,
  caches, exports, backups, search, AI, or support tools.
- **Why it matters:** Mission organizations may hold unusually sensitive people
  and location information; an external reviewer is an untrusted input source.
- **Severity:** Critical.
- **Likelihood:** High over the feature lifetime without explicit minimization.
- **Evidence or reasoning:** OWASP requires server validation, contextual
  encoding, and exclusion of sensitive data from logs. D25 projection is
  purpose-limited and explicitly excludes donor, missionary, payment,
  credential, member-care, and restricted operational facts.
- **Decision effect:** Requires plain text, safe rendering, concise prevention
  guidance, body-free telemetry/channels, separate identity permission,
  purpose-bound readable retention, and audited quarantine/disposal without a
  brittle content heuristic becoming an authorization gate.
- **Best permanent fix:** Minimize at source, reject only invalid transport/
  control/size input, store protected body, escape at every sink, disable
  autolinking/indexing, never log/copy body, and provide privacy-owner repair.
- **Exact decision/spec language:** “D30 prose is untrusted private data. It
  SHALL be server-validated, rendered only as escaped inert text, excluded from
  logs/traces/analytics/search/notifications/email/AI, separately protected at
  rest, and shown only through current purpose-specific authorization.”

### 16. Scalability and performance risks

**Material concern: Yes.**

- **What could go wrong:** Unbounded bodies, full-text indexing, copied
  notification/email payloads, anchor joins, global scans, or synchronous
  provider work could make lists, review submit, exports, and tenant isolation
  degrade at high volume.
- **Why it matters:** A small per-review inefficiency multiplies across Tenants,
  sources, locales, retries, histories, and restore/reconciliation jobs.
- **Severity:** Medium-High.
- **Likelihood:** Medium if adjacent features are imported.
- **Evidence or reasoning:** The corrected body is bounded at 1,000 code points
  and one anchor. Core source commands must keep external/provider work outside
  the transaction and indexes Tenant-first.
- **Decision effect:** Preserves the founder choice but forbids search/copy
  amplification and defines measurable budgets rather than “fast.”
- **Best permanent fix:** Bounded row size; no body in list/notification
  projections; keyed source lookups; asynchronous derived work; per-Tenant
  fairness; production-shaped load and query-plan proof.
- **Exact decision/spec language:** “D30 SHALL store at most one 1,000-code-
  point body and one anchor per result, SHALL NOT full-text index or fan out the
  body, and SHALL meet the named submit/read/projection budgets under the
  production-shaped release cohort.”

### 17. Operational burden

**Material concern: Yes.**

- **What could go wrong:** Staff might need direct database fixes for sensitive
  feedback, broken anchors, missing projections, or duplicate outcomes;
  support might require tribal knowledge of each source adapter; retention
  could become manual cleanup.
- **Why it matters:** A lean product that requires recurring developer repair
  is not actually lean and creates privacy risk.
- **Severity:** High.
- **Likelihood:** Medium-High without explicit repair/runbook ownership.
- **Evidence or reasoning:** Core requires source-owned, auditable repair and
  rejects hidden operational glue. Comparable generic comment/workflow systems
  carry substantial administration Core should not inherit.
- **Decision effect:** Adds bounded repair commands, source adapter diagnostics,
  scheduled retention/disposal, and named owner/runbooks.
- **Best permanent fix:** Reconcile from immutable result; capability-gated
  quarantine/disposal; safe adapter status; no SQL/body inspection in ordinary
  support; automate retention and monitor failures.
- **Exact decision/spec language:** “Every D30 failure SHALL have a source- or
  privacy-owned, capability-gated, idempotent repair path and runbook. Ordinary
  support SHALL NOT read bodies, edit rows, fabricate anchors, replay another
  result, or depend on direct database access.”

### 18. Observability and auditability gaps

**Material concern: Yes.**

- **What could go wrong:** Body-free logs may be too sparse to diagnose a lost
  command, while logging raw prose to improve diagnosis would itself leak
  private information. Technical success could also be mistaken for durable
  business outcome.
- **Why it matters:** Operators need to prove who requested what result and
  repair missing projections without viewing or spreading feedback content.
- **Severity:** High.
- **Likelihood:** High if audit and telemetry are not designed separately.
- **Evidence or reasoning:** OWASP logging guidance excludes sensitive data;
  Core consistently separates durable business history from logs/traces and
  uses correlation IDs and body-free evidence.
- **Decision effect:** Requires immutable business receipts plus low-cardinality
  content-free operational signals and explicit monitor thresholds.
- **Best permanent fix:** Record a protected body reference and only a versioned
  keyed non-enumerable fingerprint where integrity/idempotency requires it;
  correlate without prose or fingerprint telemetry; monitor invariant breaks, latency,
  rejection reasons, disposal, and privacy events; restrict any support read.
- **Exact decision/spec language:** “Durable D30 history SHALL prove result,
  actor, scope, versions, protected body reference/keyed fingerprint, anchor
  identity, fences, outcome, and lifecycle events. A raw or unsalted body hash
  is forbidden. Technical telemetry SHALL be body- and fingerprint-free and
  SHALL NOT be accepted as proof of the business result.”

### 19. Dependency and integration risks

**Material concern: Yes.**

- **What could go wrong:** Rich-text, comments, translation, spellcheck,
  provider messaging, search, or analytics dependencies could introduce vendor
  retention, unsafe HTML, outages, lock-in, version drift, or body disclosure.
  Source adapters could disagree on anchor semantics.
- **Why it matters:** The core decision requires no external service; adding
  one increases failure and privacy surface without user benefit.
- **Severity:** High.
- **Likelihood:** Medium if teams reuse convenient adjacent packages/providers.
- **Evidence or reasoning:** The repo already has shared Card, Collapsible,
  Textarea, Field, and Button primitives plus a server/API/database stack.
  OWASP warns that rich HTML needs
  sanitization; Contentful's broader collaboration model proves that comments
  bring mentions/email/thread behavior Core does not need.
- **Decision effect:** Rejects new runtime/vendor dependencies and requires a
  finite source-adapter contract.
- **Best permanent fix:** Use native/shared plain-text controls and Core-owned
  storage/commands; pin adapter versions; qualify every anchor kind; prohibit
  provider transmission and machine translation.
- **Exact decision/spec language:** “D30 SHALL add no rich-text, comment,
  translation, AI, messaging, search, or analytics provider. External
  dependencies SHALL NOT receive feedback bodies. Source-anchor adapters SHALL
  be finite, versioned, and release-qualified.”

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

- **What could go wrong:** New code may interpret old nulls as valid bodies,
  old code may ignore new body/anchor states, migration may infer feedback from
  comments, feature rollback may orphan new rows, or an adapter update may
  reinterpret historic anchors.
- **Why it matters:** Review history cannot be safely reconstructed or deleted
  after partial rollout, and mixed deployments are expected.
- **Severity:** High.
- **Likelihood:** Medium-High during rollout.
- **Evidence or reasoning:** No D30 runtime exists, so there is no legitimate
  feedback to backfill. Repository practice requires readers-before-writers,
  Reserved-to-Live evidence, compatible migrations, fences, and roll-forward
  after new durable data.
- **Decision effect:** Requires additive no-backfill migration, version-pinned
  anchors/results, shadow/canary, independent write/read fences, and kill
  switches that preserve history.
- **Best permanent fix:** Deploy schema and safe readers first; reject unknown
  versions; shadow synthetic adapters; pilot opt-in; roll forward repairs;
  never infer historical bodies or anchors.
- **Exact decision/spec language:** “Existing records SHALL receive no inferred
  D30 body or anchor. Writers remain fenced until all readers understand every
  admitted version/state. Rollback SHALL stop new writes/presentation without
  deleting or reinterpreting committed result/history.”

### 21. Testability, traceability, and proof

**Material concern: Yes.**

- **What could go wrong:** “Concise,” “private,” “actionable,” “accessible,”
  and “safe” could remain subjective; tests might assert a textarea exists
  while missing cross-Tenant reads, race winners, Unicode counting, body-free
  logs, anchor drift, or staff outcomes.
- **Why it matters:** Ambiguous requirements cannot prove the decision from
  founder answer through release and invite regressions.
- **Severity:** High.
- **Likelihood:** High without exact rules and outcome criteria.
- **Evidence or reasoning:** The user requires falsifiable positive, negative,
  boundary, auth, concurrency, migration, accessibility, and production-shaped
  proof plus artifact traceability. Current D30 has no implementation tests.
- **Decision effect:** Adds D30-R1–R29, one canonical D30-AC namespace, named
  monitors, release evidence, and explicit ADR/glossary disposition.
- **Best permanent fix:** Test public seams and user-visible/domain outcomes;
  include hostile Tenant/privileged path, property/race, migration, manual AT,
  browser, retention/restore, and load evidence; trace every rule.
- **Exact decision/spec language:** “D30 SHALL remain Reserved until every
  D30-R and D30-AC traces through decision log, glossary, ADR, OpenSpec,
  registry, design, tasks, tickets, implementation, tests, migration, canary,
  monitors, and release evidence with no contradictory term or state.”

### 22. Other development hazards

**Material concern: Yes.**

- **What could go wrong:** “Request changes” may be confused with decline,
  rejection, cancellation, D28 recovery, or an instruction to automatically
  change content. A reviewer could expect ongoing access or staff could assume
  the same reviewer will automatically review the successor. Deferred broad
  verification could be mistaken for release readiness.
- **Why it matters:** Terminology drift changes lifecycle/authority and creates
  false expectations for both external reviewers and ministry staff.
- **Severity:** High.
- **Likelihood:** High while later successor-routing decisions and
  implementation proof remain open.
- **Evidence or reasoning:** D25/D28 explicitly separate Request changes from
  decline/expiry; D27 requires explicit lane transitions; the current Grill is
  documentation-only and the user deferred broad gates until session end.
- **Decision effect:** Preserves separate terminal meanings, adds exact copy and
  non-effects, asks the next successor-routing decision, and keeps D30 Reserved.
- **Best permanent fix:** Canonical glossary term, ADR-0181 amendment, typed
  state/result codes, no auto-invite, and explicit release-gate status in every
  artifact.
- **Exact decision/spec language:** “`changes_requested` SHALL remain distinct
  from decline, expiry, rejection, cancellation, reassignment, and favorable
  review. It SHALL not auto-correct content, choose a successor lane/reviewer,
  or carry external access forward. D30 is not Live until all deferred release
  gates pass.”

## Acceptance criteria

These are independently falsifiable outcomes for later OpenSpec, design,
implementation, tests, and release evidence. They do not claim current runtime
support. This is the single canonical D30 acceptance namespace.

### Result meaning and applicability

1. **D30-AC001 — Exact context only.** Only the intended stable human holding
   the current exact D25 authorization context can submit Request changes for
   its bound candidate and review epoch.
2. **D30-AC002 — Terminal exact review.** A successful Request changes command
   terminates exactly that external review and makes its context inert.
3. **D30-AC003 — No approval.** Request changes creates no favorable review,
   publication, activation, or approval evidence.
4. **D30-AC004 — No edit.** Request changes does not mutate candidate, Page,
   Navigation, locale, public content, current Live Site, or Giving state.
5. **D30-AC005 — No cancellation.** Request changes does not cancel the Plan,
   source intent, candidate lineage, or independent source work.
6. **D30-AC006 — Distinct from decline.** Request changes never records or
   displays external decline, wrong-person, or unwilling-to-review meaning.
7. **D30-AC007 — Distinct from expiry.** Request changes never records an
   expiry and is not generated from clock passage.
8. **D30-AC008 — No D28 episode.** A committed Request changes result creates
   no D28 candidate-review reassignment episode or D29 follow-up item.
9. **D30-AC009 — Active review required.** Pending invitation, failed delivery,
   unaccepted link, expired/revoked context, or stale candidate cannot submit.
10. **D30-AC010 — Source admission.** A source that has not registered and
    qualified D30 cannot expose or accept Request changes.
11. **D30-AC011 — Current policy proof.** Submission re-proves D23/D24, D26,
    D27, Phase 12, identity, assurance, projection, and source facts at commit.
12. **D30-AC012 — Unknown fails safely.** Missing, partial, stale, corrupt,
    timed-out, contradictory, or unsupported applicability proof writes no
    result and broadens no access.

### Required explanation and content contract

13. **D30-AC013 — Body required.** A `changes_requested` command without an
    explanation rejects and changes no authoritative state.
14. **D30-AC014 — Null rejected.** A null explanation rejects without creating
    result, body, anchor, receipt, transition, or outbox rows.
15. **D30-AC015 — Empty rejected.** Empty text after canonicalization rejects
    with **Describe what needs to change.**
16. **D30-AC016 — Whitespace rejected.** Unicode-whitespace-only text rejects
    with the same specific field error and preserves the local draft.
17. **D30-AC017 — Invisible control rejected.** A body containing only
    disallowed/invisible control or format code points cannot satisfy presence.
18. **D30-AC018 — One visible code point.** One admitted visible non-control
    code point passes structural minimum validation; Core imposes no hidden
    semantic minimum.
19. **D30-AC019 — 999 accepted.** A valid 999-code-point explanation is
    accepted when all other facts remain current.
20. **D30-AC020 — 1,000 accepted.** A valid explanation of exactly 1,000
    Unicode code points is accepted.
21. **D30-AC021 — 1,001 blocked.** A 1,001-code-point explanation is not
    silently truncated and cannot submit until shortened.
22. **D30-AC022 — Exact length error.** Over-limit submit shows **Shorten the
    explanation to 1,000 characters or fewer** and the exact amount over.
23. **D30-AC023 — Canonical line endings.** CRLF, CR, and LF input normalize to
    one versioned LF representation before length, digest, idempotency, and
    storage calculations.
24. **D30-AC024 — Surrounding whitespace.** Versioned canonicalization removes
    only admitted surrounding Unicode whitespace; internal spacing and line
    breaks remain intact.
25. **D30-AC025 — CJK accepted.** A valid CJK body is accepted and counted by
    Unicode code points, not bytes or words.
26. **D30-AC026 — Combining and emoji.** Combining sequences and emoji remain
    readable and produce the same deterministic count/digest across client,
    API, and database proof.
27. **D30-AC027 — RTL accepted.** Arabic/Hebrew prose stores without reversal,
    renders with `dir=auto`, and isolates embedded LTR paths/names/counts.
28. **D30-AC028 — Plain-text display.** Markup-like input renders as inert text;
    it never creates HTML, formatting, images, scripts, CSS, or links.
29. **D30-AC029 — URLs inert.** A typed URL wraps and displays as text unless a
    separately safe product control deliberately handles it; D30 never
    autolinks a `javascript:`, `data:`, or caller URL.
30. **D30-AC030 — Sensitive-content prevention and repair.** The field warns
    against donor, payment, password, member-care, precise-location, and other
    sensitive information; submitted sensitive content remains contained to
    the authorized source detail and can be quarantined/disposed only through
    the audited privacy/security path without echoing it into telemetry.
31. **D30-AC031 — No brittle denylist.** Secret/payment heuristics, apostrophes,
    angle brackets, ordinary punctuation, non-Latin text, URLs, and safe path
    text are not submission gates merely because they resemble sensitive data,
    markup, or SQL.
32. **D30-AC032 — Exactly one body.** The command cannot supply several
    explanations, alternate-language bodies, body arrays, or nested comment
    objects.
33. **D30-AC033 — No structured requirements.** No category, severity,
    priority, assignee, due date, checklist, title, locale, attachment, mention,
    signature, or suggested edit is required to submit.
34. **D30-AC034 — No AI quality gate.** Submission success never depends on AI
    scoring, classification, summarization, translation, or “actionability”
    judgment.

### Optional source anchor

35. **D30-AC035 — Anchor optional.** A source supporting anchors accepts a
    valid Request changes command with no anchor.
36. **D30-AC036 — No-support source.** A source with no registered stable
    anchors omits the control but still accepts a valid explanation.
37. **D30-AC037 — Anchor not sufficient.** A valid selected anchor plus an empty
    explanation rejects and creates no result.
38. **D30-AC038 — One anchor maximum.** Zero or one anchor is accepted; two or
    more reject atomically without truncation.
39. **D30-AC039 — Offered anchor only.** The server accepts only an anchor in
    the exact versioned manifest for the current projection shown to the
    reviewer.
40. **D30-AC040 — Cross-candidate denial.** An otherwise valid anchor from
    another candidate/revision/review epoch rejects without revealing whether
    that anchor exists.
41. **D30-AC041 — Cross-scope denial.** An anchor from another Tenant,
    environment, Site, or source rejects and emits no cross-scope detail.
42. **D30-AC042 — Caller label ignored.** Caller-supplied anchor display label,
    URL, selector, quote, coordinate, or index is never stored as authority.
43. **D30-AC043 — Prefill from section.** Choosing **Reference this section**
    preselects exactly that source-certified visible anchor and mutates no
    source state.
44. **D30-AC044 — Choose list bounded.** **Choose a section** lists only current
    visible certified anchors and cannot search or enumerate other records.
45. **D30-AC045 — Remove preserves body.** Removing the optional anchor leaves
    explanation text and cursor/focus context intact.
46. **D30-AC046 — Change preserves body.** Changing the anchor leaves the body
    intact and returns focus to the related-section row.
47. **D30-AC047 — Stale anchor blocks only submit.** An anchor invalidated before
    commit blocks the command with the exact anchor error and preserves body
    draft for removal/refresh.
48. **D30-AC048 — Original identity retained.** A committed anchor continues to
    identify the reviewed immutable projection even after a successor exists.
49. **D30-AC049 — No fuzzy retarget.** Label rename, locale change, text
    similarity, list reorder, or DOM change never retargets a committed anchor.
50. **D30-AC050 — Unresolved display.** If an authorized historical view cannot
    resolve an anchor, it displays **The original section is no longer
    available** and keeps the explanation available subject to retention.

### External-reviewer UX and failure recovery

51. **D30-AC051 — Trigger is inert.** Opening Request changes creates no result,
    server draft, audit outcome, notification, or lane transition.
52. **D30-AC052 — Exact heading.** The inline region is labelled by the visible
    **Request changes** heading and includes the exact consequence description.
53. **D30-AC053 — Exact field label.** The textarea's visible and programmatic
    label is **What needs to change? (required)**.
54. **D30-AC054 — Hint attached.** Privacy, specificity, and 1,000-character
    hint text is visibly present and included in `aria-describedby`.
55. **D30-AC055 — No placeholder label.** The field does not depend on a
    placeholder for name, instructions, required status, or sample content.
56. **D30-AC056 — Overtype permitted.** Typing/pasting beyond 1,000 remains
    visible for editing and is never silently cut off.
57. **D30-AC057 — Quiet count.** Sighted character-count updates may stay
    visually quiet below the 80-percent threshold while the limit remains
    available to assistive technology.
58. **D30-AC058 — Throttled announcement.** A screen reader does not receive a
    live announcement for every keystroke and receives meaningful threshold/
    paused updates.
59. **D30-AC059 — Error focus.** Invalid submit focuses/scrolls the exact
    invalid field or anchor and exposes persistent textual guidance.
60. **D30-AC060 — Keep reviewing.** **Keep reviewing** closes an untouched
    surface, returns focus to the trigger, and changes no state.
61. **D30-AC061 — Draft discard warning.** Collapsing the panel, navigating
    away, or otherwise abandoning a nonempty draft requires the explicit
    **Discard this explanation?** decision; Escape never silently discards.
62. **D30-AC062 — Safe initial discard focus.** **Keep writing** receives initial
    focus in the discard confirmation; **Discard explanation** is explicit.
63. **D30-AC063 — In-memory draft only.** Unsubmitted explanation/anchor state
    is absent from server storage, localStorage, cookies, analytics, logs, and
    provider payloads.
64. **D30-AC064 — Known offline.** Known offline state preserves the draft,
    says **You're offline. Reconnect to request changes**, and records no
    terminal result.
65. **D30-AC065 — Definite failure.** A definite server/network failure keeps
    prose and anchor in place and says that nothing changed.
66. **D30-AC066 — Unknown response.** A timeout/lost response checks or retries
    the same semantic command identity instead of creating a new result.
67. **D30-AC067 — Duplicate click.** Rapid click, Enter, touch, and retry while
    pending produce one command effect and no duplicate body/outbox.
68. **D30-AC068 — Truthful loading.** Pending UI says **Requesting changes…**
    and never announces committed success before the authoritative receipt.

### Staff repair and successor experience

69. **D30-AC069 — Source detail location.** An authorized staff user sees
    **Changes requested** on the existing candidate/source repair surface, not
    in a generic comments, tasks, or inbox editor.
70. **D30-AC070 — Body read authorization.** Every list/detail/body request
    independently re-proves current purpose-specific source visibility.
71. **D30-AC071 — Privacy-safe list.** A list/attention preview can say
    **Changes requested** but contains no explanation or anchor display label.
72. **D30-AC072 — Read-only prose.** Staff can read and select/copy admitted
    prose but cannot edit or delete the reviewer's historical explanation.
73. **D30-AC073 — No manual addressed state.** Staff cannot mark the feedback
    addressed, complete, dismissed, snoozed, archived, or resolved through a
    feedback control.
74. **D30-AC074 — No reply/thread.** The view contains no reply box, mention,
    reaction, comment count, participant thread, or conversation lifecycle.
75. **D30-AC075 — Exact next action.** The view presents only a current source-
    authorized repair/cancel/history action and never derives authority from
    feedback possession.
76. **D30-AC076 — Unchanged consequences.** Staff copy says current Website and
    Giving remain unchanged; it does not imply automatic publication/correction.
77. **D30-AC077 — Identity separated.** A user who may read permitted feedback
    but not external contact identity sees **External reviewer**, not name or
    contact information.
78. **D30-AC078 — Named attribution authorized.** Eli's name appears only after
    current exact purpose-specific identity visibility proof.
79. **D30-AC079 — Successor reference.** A source-created successor references
    the prior result/body projection without copying prose into an editable
    successor field.
80. **D30-AC080 — Fresh successor review.** Creating or editing a successor
    never carries approval, reviewer authorization, invitation, lane, anchor
    authority, or completed-review truth forward.
81. **D30-AC081 — Previous feedback context.** An authorized successor repair
    view labels the prior body **Previous review feedback** and states that a
    new review is required after changes.
82. **D30-AC082 — Body disposal truth.** If prior readable feedback was lawfully
    disposed, the successor view shows a truthful unavailable/history state
    and never reconstructs prose from digest, log, notification, or cache.

### Authorization, privacy, data, and RLS

83. **D30-AC083 — Server-derived scope.** Tenant, environment, Site, source,
    candidate, review epoch, context, human, actor, result, and timestamps are
    derived from trusted server state, not accepted as caller truth.
84. **D30-AC084 — No browser mutation grants.** Browser roles have no direct
    insert, update, or delete grant on result, body, anchor, receipt, audit,
    quarantine, or disposal records.
85. **D30-AC085 — Forced RLS.** Every D30-readable relation has RLS enabled and
    forced, with a tested default-deny posture for roles lacking a policy.
86. **D30-AC086 — USING correctness.** `SELECT`, `UPDATE`, and `DELETE` old-row
    visibility policies, where an operation is admitted, prove current exact
    scope and purpose.
87. **D30-AC087 — WITH CHECK correctness.** `INSERT`/`UPDATE` new-row policies,
    where admitted, prevent scope, author, candidate, result, or lifecycle
    transformation.
88. **D30-AC088 — Privileged parity.** Secret/service-role, worker, support,
    migration, repair, and security-definer paths call the same policy adapter
    and fail hostile poison-scope tests despite RLS bypass ability.
89. **D30-AC089 — Hardened definer.** Any security-definer function has an
    explicit safe `search_path`, least privileges, no caller actor/scope trust,
    and direct authorization tests.
90. **D30-AC090 — Composite same scope.** Database foreign keys prevent result,
    body, anchor, candidate, context, receipt, and lifecycle rows from joining
    across Tenant/environment/Site/source/review scope.
91. **D30-AC091 — One terminal slot.** A database uniqueness constraint admits
    at most one terminal result for the exact review epoch.
92. **D30-AC092 — Result/body compatibility.** Database constraints require one
    admitted body for `changes_requested` and forbid accidental D30 bodies on
    result kinds whose versioned contract does not admit them.
93. **D30-AC093 — Anchor cardinality.** Database shape permits zero or one
    exact-manifest anchor and cannot persist an ambiguous empty/multiple set.
94. **D30-AC094 — Append-only result.** No ordinary command can update result
    kind, body identity, author, scope, candidate, anchor, or committed time.
95. **D30-AC095 — Escaped rendering.** Every authorized HTML/body view uses a
    safe text sink/framework escaping and contains no `dangerouslySetInnerHTML`
    or untrusted attribute/URL/template interpolation.
96. **D30-AC096 — Body-free logs.** Request bodies, explanation text, snippets,
    anchor display labels, external contacts, and sensitive projection fields
    are absent from application logs, traces, metrics, error reports, and
    analytics under success/failure/exception paths.
97. **D30-AC097 — Body-free channels.** Notifications, emails, push, SMS,
    webhook/provider events, and D29 items contain no explanation or anchor
    display label.
98. **D30-AC098 — No generic search.** Explanation and anchor label are absent
    from global search, browser index, command palette, AI corpus, and
    autocomplete.
99. **D30-AC099 — Current access revocation.** Losing current source/body
    authorization removes readable presentation immediately without deleting
    lawful history or leaking row existence.
100.  **D30-AC100 — Authorized export only.** Generic exports exclude readable
      bodies; an exact source/custody export includes one only after current
      authorization, retention, hold, and Tenant proof.

### Atomicity, concurrency, audit, retention, and repair

101. **D30-AC101 — Atomic authoritative effect.** Result, required body
     reference/body, optional anchor, receipt, context end, and source/lane
     transition commit in one transaction or none commits.
102. **D30-AC102 — No external work in lock.** Email, provider, translation,
     search, AI, analytics, and other network work never runs under source or
     lane transaction locks.
103. **D30-AC103 — Approval race.** Favorable completion and Request changes on
     the same expected heads yield exactly one terminal winner; the loser
     writes no orphan body.
104. **D30-AC104 — Decline race.** Decline and Request changes yield one exact
     winner and never combine “changes requested” body with decline/D28 state.
105. **D30-AC105 — Takeover race.** Internal takeover/return and Request changes
     yield one winner; a stale external command cannot act after context end.
106. **D30-AC106 — Cancellation race.** Source cancellation and Request changes
     yield one winner without reviving work or dropping the winning receipt.
107. **D30-AC107 — Supersession race.** Candidate supersession and Request
     changes yield one winner; no feedback attaches to the wrong successor.
108. **D30-AC108 — Revocation/expiry race.** Current authoritative server time
     and revocation/context fences determine one result; client time cannot
     extend access.
109. **D30-AC109 — Same-key replay.** Same idempotency key plus same canonical
     candidate/result/body/anchor meaning returns the original receipt and does
     not create a new unread item or body.
110. **D30-AC110 — Same-key conflict.** Reusing an idempotency key with changed
     body, anchor, candidate, result kind, or semantic version rejects and
     leaves the original immutable result.
111. **D30-AC111 — Outbox reconciliation.** If authoritative commit succeeds and
     a derived staff projection fails, reconciliation regenerates from the
     same result identity without a second result or body copy.
112. **D30-AC112 — Durable audit.** Audit records trusted actor, exact scope,
     candidate/review, context, result, protected body reference and only a
     versioned keyed non-enumerable fingerprint when necessary, anchor identity,
     adapter/policy versions, expected heads, receipt, outcome, and lifecycle
     events without readable prose; raw/unsalted body hashes are forbidden.
113. **D30-AC113 — Records-class binding.** Every readable body binds at creation
     to one effective source records class; neither caller nor UI chooses a TTL.
114. **D30-AC114 — Hold precedence.** A valid hold prevents disposal without
     widening who may read the body or extending external review authority.
115. **D30-AC115 — Lawful disposal.** When disposal becomes due, readable body
     and derived readable copies become inaccessible through the governed
     primary/backup/restore-suppression lifecycle while body-free history
     remains if lawful.
116. **D30-AC116 — No fingerprint reconstruction.** A disposed body cannot be
     reconstructed, correlated broadly, or approximated from fingerprints,
     audit, logs, notifications,
     analytics, search, caches, or backups outside the retention contract.
117. **D30-AC117 — Privacy quarantine.** A purpose-authorized privacy command
     can quarantine an accidentally sensitive body without changing the
     historical terminal result and records actor, reason, fence, and receipt.
118. **D30-AC118 — No direct repair.** Support and ordinary staff cannot edit
     SQL/body/result/anchor; all reconciliation, quarantine, restoration, and
     disposal use capability-gated same-scope commands.

### Accessibility, localization, performance, migration, and proof

119. **D30-AC119 — Keyboard complete.** Reviewer and authorized staff journeys
     complete with keyboard alone in logical order, including anchor selection,
     validation, discard, retry, submit, and return focus.
120. **D30-AC120 — Screen-reader complete.** Supported screen-reader/browser
     pairs announce expanded-region heading/description, required field, hint, count
     thresholds, errors, loading, success, stale state, and focus changes once
     and in meaningful order.
121. **D30-AC121 — Visible focus and contrast.** Every interactive state has
     unobscured visible focus and text/status contrast meeting current WCAG 2.2
     AA; meaning does not rely on color, icon, motion, or position alone.
122. **D30-AC122 — Touch targets.** All actions, close controls, anchor options,
     and remove/change controls provide at least 44-by-44 CSS-pixel effective
     targets without overlap.
123. **D30-AC123 — Reflow.** At 320 CSS pixels and 400-percent zoom, no
     explanation, count, error, anchor, or action is clipped/obscured and no
     two-dimensional scrolling is required for text.
124. **D30-AC124 — Text spacing/long content.** WCAG text-spacing overrides,
     long organization/Site/locale/section labels, long unbroken paths, and
     1,000-code-point bodies wrap without loss or overlapping controls.
125. **D30-AC125 — RTL/bidi.** Full RTL interface and mixed-direction body,
     names, locale tags, paths, counts, and anchor labels preserve logical
     reading/focus order with explicit isolation.
126. **D30-AC126 — Reduced motion/forced colors.** The flow remains complete in
     reduced-motion and forced-colors modes; no essential status depends on an
     animation, shadow, translucent color, or decorative icon.
127. **D30-AC127 — Mobile safe area.** Supported mobile viewports keep heading,
     field, error/count, and sticky actions reachable above virtual keyboard
     and safe-area insets without focus theft.
128. **D30-AC128 — Interface/content language separation.** UI copy localizes
     independently; the explanation stays exactly reviewer-authored and is not
     labelled as a machine-verified language or authoritative translation.
129. **D30-AC129 — Submit performance.** In the qualified production-shaped
     pilot, successful/stale D30 command p95 is at most 2,000 ms server-side and
     p99 is at most 5,000 ms, excluding user-controlled network latency, with
     zero authority caching or skipped proof.
130. **D30-AC130 — Projection performance.** Ninety-nine percent of committed
     pilot results become available on the authorized staff source projection
     within 300 seconds; lag does not change source truth or send body elsewhere.
131. **D30-AC131 — Bounded storage/read.** One result stores at most one
     1,000-code-point body and one anchor; staff lists do not load bodies, and
     source detail uses Tenant/source-keyed indexed lookup without global scan.
132. **D30-AC132 — Existing-data migration.** Existing candidates, comments,
     tasks, reviews, and notifications receive no inferred D30 result, body, or
     anchor during migration.
133. **D30-AC133 — Mixed-version safety.** Old/new readers, writers, workers,
     adapter versions, and schema combinations either interpret every admitted
     state/version correctly or fail closed before writer activation.
134. **D30-AC134 — Kill switch.** A D30 write/presentation kill switch stops new
     use while preserving committed source results, authorized repair/history,
     retention, and body-free audit; it never reopens external contexts.
135. **D30-AC135 — Full proof matrix.** Release evidence includes unit/property,
     integration, RLS/grant, privileged poison-scope, race/idempotency,
     migration/restore, manual keyboard/screen-reader/mobile/RTL/weak-network,
     security/privacy, retention/disposal, and production-shaped load tests.
136. **D30-AC136 — End-to-end trace.** Every D30-R and D30-AC traces consistently
     through founder answer, decision log, glossary, ADR, OpenSpec, registry,
     design, tasks, GitHub tickets, implementation, tests, migration, canary,
     monitors, and release evidence before D30 becomes Live.

## Named monitors and mandatory response

These are pilot/production guardrails, not claims that D30 is currently Live.
No monitor dimension, sample, trace, or alert payload may contain explanation
text, a snippet, anchor display label, reviewer contact, or other protected
body. “Any” means one confirmed event.

| Signal                                                                  |                                                                                                          Threshold | Owner                              | Required response                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------- | -----------------------------------------------------------------------------------------------------------------: | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `website_review_feedback_cross_tenant_read_total`                       |                                                                                                                any | Security                           | P0 fence D30 reads/writes, preserve body-free evidence, assess disclosure, repair scope/RLS/cache/realtime, notify affected owners under incident policy                                                                                           |
| `website_review_feedback_unauthorized_body_read_total`                  |                                                                                                                any | Security + Site Product            | P0 remove presentation, revoke/fence affected capability path, assess access, repair projection and hostile tests                                                                                                                                  |
| `website_review_feedback_privileged_policy_divergence_total`            |                                                                                                                any | Database Security                  | stop privileged worker/repair cohort, compare ordinary policy result, repair adapter/definer path, replay no body                                                                                                                                  |
| `website_review_feedback_scope_constraint_failure_total`                |                                                                                                                any | Database owner                     | stop writes, quarantine invalid rows without exposing bodies, restore same-scope integrity, investigate migration/import path                                                                                                                      |
| `website_review_feedback_orphan_result_total`                           |                                                  any result without admitted body reference or body without result | Site API + Database                | fence writes, preserve candidate state, reconcile only from authoritative transaction evidence, repair atomicity/constraints                                                                                                                       |
| `website_review_feedback_duplicate_terminal_total`                      |                                                                any exact review with more than one terminal result | Site API                           | P0 stop D30/source terminal writes, determine CAS winner, preserve evidence, repair uniqueness/idempotency and affected source projections                                                                                                         |
| `website_review_feedback_idempotency_meaning_mismatch_accepted_total`   |                                                                                                                any | Site API + Security                | fence endpoint, preserve original receipt, repair semantic-key comparison, audit all affected retries                                                                                                                                              |
| `website_review_feedback_body_in_telemetry_total`                       |                                                      any prose/snippet in logs, traces, metrics, analytics, errors | Security + Privacy                 | incident response; stop offending sink, purge where permitted, assess custody, repair redaction and regression tests                                                                                                                               |
| `website_review_feedback_body_in_channel_total`                         |                                                   any body/anchor label in email, notification, push, SMS, webhook | Privacy + Phase 17                 | disable template/adapter, contain provider/cached copies, assess disclosure, restore body-free channel contract                                                                                                                                    |
| `website_review_feedback_executable_render_total`                       |                                                                         any markup/script/link execution from body | Application Security               | P0 fence body rendering, enable safe fallback text only, assess sessions, repair escaping/sinks/CSP tests                                                                                                                                          |
| `website_review_feedback_cross_scope_anchor_total`                      |                                                                   any accepted anchor outside exact scope/manifest | Security + source owner            | fence anchor writes/navigation, assess exposed target, repair composite FK/adapter validation and poison fixtures                                                                                                                                  |
| `website_review_feedback_unresolved_anchor_rate`                        |                                              above 2% of at least 100 authorized historical anchor opens in 7 days | source owner + Site UX             | inspect retained-projection/adapter-version drift, pause new anchor kinds, keep prose available, repair original-projection rendering; never map to Live or a successor                                                                            |
| `website_review_feedback_submit_error_rate`                             |                                                       above 1% of at least 100 non-validation attempts in 24 hours | Site Platform                      | inspect CAS/context/DB/network causes, pause cohort growth, preserve in-memory retry UX, repair without weakening proof                                                                                                                            |
| `website_review_feedback_unknown_response_rate`                         |                                                                    above 0.5% of at least 200 attempts in 24 hours | Site Platform                      | inspect timeouts/receipt lookup, tune bounded checking, verify same-key replay, pause cohort growth if duplicate risk exists                                                                                                                       |
| `website_review_feedback_submit_p95_ms`                                 |                                                     above 2,000 ms for at least 100 qualified attempts in 24 hours | Site Platform                      | inspect query plan, lock time, indexes, and synchronous work; restore budget without caching authority or moving provider work into transaction                                                                                                    |
| `website_review_feedback_submit_p99_ms`                                 |                                                     above 5,000 ms for at least 200 qualified attempts in 24 hours | Site Platform                      | pause expansion, apply latency runbook, verify context-expiry races and same-key recovery                                                                                                                                                          |
| `website_review_feedback_projection_lag_seconds`                        |                                                p99 above 300 seconds for at least 20 committed results in 24 hours | source owner + Site Platform       | reconcile same result identities, inspect outbox/workers/indexes, expose safe degraded state, never create another result/body                                                                                                                     |
| `website_review_feedback_empty_submit_rate`                             |                                                                 above 15% of at least 100 opened panels in 30 days | Site UX + UX Research              | review label/instructions and moderated sessions, improve copy/focus; do not make feedback optional                                                                                                                                                |
| `website_review_feedback_over_limit_session_rate`                       |                                  above 2% of at least 100 nonempty sessions in 30 days or 5 distinct support cases | Site Product + UX Research         | inspect privacy-safe aggregate distribution and consented interviews, raise the limit through a versioned decision when legitimate original-language explanations are constrained; never teach abbreviation, silently truncate, or add attachments |
| `website_review_feedback_very_short_rate`                               |                                     more than 20% of at least 100 committed bodies below 12 code points in 30 days | Site Product + UX Research         | sample only through separately consented/moderated research, test helper copy and staff comprehension; do not auto-reject or inspect production prose casually                                                                                     |
| `website_review_feedback_sensitive_guidance_comprehension_failure_rate` | above 10% in moderated testing with at least 20 representative reviewers, or 3 distinct confusion cases in 30 days | Privacy + Site UX Research         | revise audience/minimization copy and retest; do not inspect production prose or add a brittle secret/payment heuristic gate                                                                                                                       |
| `website_review_feedback_privacy_report_total`                          |                                                                                 any credible sensitive-body report | Privacy owner                      | triage within incident policy, restrict access if warranted, use audited quarantine/disposal, assess derived copies and source projection                                                                                                          |
| `website_review_feedback_quarantine_unresolved_age_hours`               |                                                        any quarantined body without final disposition for 24 hours | Privacy owner                      | escalate case owner, maintain least-readable posture, complete restore/disposal decision and evidence                                                                                                                                              |
| `website_review_feedback_retention_overdue_total`                       |                                                       any body past effective disposal deadline without valid hold | Records + Privacy                  | stop new cohort expansion, deny ordinary readable access, execute disposition/restore-suppression runbook, repair scheduler                                                                                                                        |
| `website_review_feedback_local_persistence_total`                       |                  any body in localStorage, cookies, service-worker cache, analytics replay, crash/session recorder | Frontend Security + Privacy        | disable offending client feature, purge where possible, assess exposure, repair no-store tests                                                                                                                                                     |
| `website_review_feedback_language_mismatch_support_cases`               |                                                                                 3 distinct Tenant cases in 30 days | Site Product + UX Research         | interview affected staff/reviewers, improve reviewer selection and language expectation copy; do not silently machine-translate                                                                                                                    |
| `website_review_feedback_task_or_comment_copy_total`                    |                                                   any copied D30 body in task/comment/CMS/successor editable field | Site Architecture                  | fence copier, remove unauthorized shadow copy under retention policy, restore reference-only projection, repair ownership tests                                                                                                                    |
| `website_review_feedback_accessibility_serious_defect_total`            |                                                                      any serious/critical supported-journey defect | Accessibility owner + Site UX      | stop cohort expansion, repair shared primitive/composition, manually re-prove keyboard/screen-reader/mobile/RTL flow                                                                                                                               |
| `website_review_feedback_comprehension_success_rate`                    |                                  below 90% in a moderated pilot of at least 15 representative reviewer/staff pairs | Site Product + UX Research         | revise exact copy/panel placement/helper example, rerun study before broad rollout; do not add workflow fields by default                                                                                                                          |
| `website_review_feedback_reserved_live_without_evidence_total`          |                                                                                                                any | Release Engineering + Site Product | disable D30 immediately, preserve source history, complete missing ADR/OpenSpec/schema/test/monitor/retention evidence before re-enable                                                                                                            |

## Migration, rollout, upgrade, and rollback sequence

1. Record D30 in the decision log, add the canonical glossary term, amend
   ADR-0181, and reconcile D25/D27/D28 references. Do not change D28 decline/
   expiry recovery semantics.
2. During the dedicated specification pass, add exact OpenSpec requirements,
   registry IDs, capability IDs, result/body/anchor versions, source adapter
   interface, and body-free projection contracts. This Grill does not mutate
   OpenSpec or runtime.
3. Add the compatible append-only result/body/anchor/receipt schema,
   constraints, indexes, grants, forced RLS, definer hardening, and disposal
   lifecycle. Backfill no result, body, or anchor.
4. Deploy readers that understand admitted/disposed/quarantined/unavailable and
   unknown-version states before any writer. Old readers must fail closed.
5. Implement the source-owned command and adapter behind separate write and
   read/presentation feature fences. Prove trusted attribution, same-scope
   constraints, lock order, semantic idempotency, and every race.
6. Build the inline Base Maia decision Card and staff repair projection using
   shared components. No modal, comments sidebar, generic task, or local body
   persistence is an acceptable temporary implementation.
7. Shadow synthetic/internal commands through validation, authorization,
   transaction, and projection without creating real external results. Verify
   body-free telemetry and every external/provider boundary.
8. Qualify each source and anchor kind independently with immutable projection
   fixtures, version compatibility, unresolved-anchor behavior, and successor
   lineage proof. An unqualified source may omit anchors but cannot improvise.
9. Enable a bounded opt-in internal/synthetic cohort, then a representative
   nonprofit pilot with all monitors and privacy/repair/runbooks active.
10. Run moderated desktop/mobile/keyboard/screen-reader/RTL/weak-network tests
    with external-reviewer and staff pairs. Validate the 1,000-code-point bound,
    copy, panel placement, anchor usefulness, and no-thread mental model.
11. Expand only after security/RLS, accessibility, concurrency, retention,
    performance, and comprehension evidence meets the gates. Re-verify current
    official dependencies and standards at release.
12. A kill switch stops new D30 writes and, if necessary, readable projections
    while retaining authoritative results, source history, holds, quarantine,
    and disposal. It never reopens a context, deletes evidence, or converts a
    Request changes result to another state.
13. After durable D30 rows exist, prefer roll-forward repair. Code rollback is
    safe only if the compatibility matrix proves old code cannot misread,
    expose, or orphan new state.
14. Any later limit, multi-anchor, rich feedback, translation, thread, edit, or
    successor-routing change requires a new versioned product decision,
    migration, threat/privacy review, accessibility proof, and rollout evidence.

## Ruthless synthesis and ordered permanent path

### Must be resolved before recording D30

Resolved by the corrected decision in this report:

1. **Required** means one structurally nonempty private plain-text explanation;
   Core does not pretend to algorithmically prove prose quality.
2. **Concise** means a balanced, exact, consistently counted 1,000-code-point
   ceiling with overtype-and-edit-down, not a tiny box or silent truncation.
3. **Optional source anchor** means zero or one source-certified exact-
   projection identity; prose remains mandatory and anchor failure is truthful.
4. Request changes is a terminal source result distinct from decline, expiry,
   cancellation, rejection, favorable review, and D28 recovery.
5. The reviewer uses an inline Base Maia decision Card that keeps evidence
   available; staff read feedback on the source repair surface.
6. Result/body/anchor/context end commit atomically with one CAS winner and
   semantic idempotency.
7. Body visibility, reviewer identity, source action, notification, retention,
   and audit are separate authorizations/lifecycles.
8. D30 creates no comments, task, checklist, thread, attachment, email, AI,
   public, Giving, or financial effect.

### Requirements that must enter spec and design

1. D30-R1 through D30-R29 and D30-AC001 through D30-AC136.
2. Exact registered result kind, safe-text/canonicalization version, anchor-
   manifest contract, retention class binding, source command, receipt, audit,
   end reasons, and projection types.
3. Purpose-specific external-submit, body-read, identity-read, source-repair,
   privacy-quarantine, disposition, support, and audit capabilities.
4. Full inline reviewer panel, source staff repair card, exact copy, all state
   transitions, responsive behavior, localization, and accessibility contract.
5. Conceptual relational constraints, RLS/grants/views/functions, privileged-
   path parity, lock order, idempotency, outbox, reconciliation, quarantine,
   retention, backup, restore, and export behavior.
6. Per-source anchor qualification, historical/successor behavior, and safe
   no-anchor fallback.
7. Additive readers-before-writers migration, compatibility matrix, shadow,
   pilot, fences, kill switch, roll-forward, named monitors, and runbooks.

### Implementation safeguards that are mandatory

1. No caller-controlled actor/scope/result and no browser table mutation.
2. One atomic source transaction and one same-fence terminal winner.
3. One shared code-point/canonicalization implementation with database proof;
   no bytes/UTF-16/words/graphemes disagreement and no silent truncation.
4. Exact-manifest zero/one anchor; no DOM/text/label/URL inference.
5. Escaped inert text, concise sensitive-content prevention guidance, audited
   quarantine/disposal, no autolink/rich text, and body-free telemetry/
   channels/search/AI; no brittle content heuristic as a submission gate.
6. Composite same-scope constraints, forced RLS, explicit grants, correct
   `USING`/`WITH CHECK`, hardened definers, and privileged poison tests.
7. In-memory unsent draft with truthful offline/failure/unknown/stale states;
   same-key retry and no optimistic terminal result.
8. Append-only result/body reference, source schedule, hold, quarantine,
   disposition, restore suppression, and body-free audit.
9. Shared Base Maia inline components and complete manual accessibility proof.
10. No migration inference, comment/task reuse, or shadow body copy.

### Risks eligible only for monitoring

- **Whether 1,000 is the right ceiling:** use limit-pressure, length-
  distribution, support, and moderated evidence. Change only through a
  versioned decision; never truncate or add attachments as a workaround.
- **Whether very short prose is often unhelpful:** use privacy-safe aggregate
  length and consented research plus staff comprehension. Improve helper copy;
  do not impose an arbitrary minimum or AI score.
- **Whether one anchor is enough:** use unresolved-anchor and moderated-use
  signals. Add no second anchor without evidence that prose plus one context
  location routinely fails.
- **Whether reviewer/staff languages mismatch:** use named support/research
  signal. Improve reviewer selection/context; never silently claim machine
  translation is authoritative.
- **Whether the inline panel placement is discoverable on mobile:** use the
  comprehension and serious-accessibility signals. Adjust composition within
  Base Maia; do not retreat to a context-hiding modal merely for convenience.

## Final disposition

**Accept with required amendments.**

The exact corrected decision to record is:

> Every valid external-review **Request changes** result SHALL contain exactly
> one private Unicode plain-text explanation answering **What needs to
> change?** for the exact immutable candidate and review epoch. After versioned
> line-ending/edge-whitespace canonicalization, the explanation SHALL contain
> at least one visible non-control code point and no more than 1,000 Unicode
> code points. The reviewer MAY attach zero or one source-certified anchor from
> the exact projection they can see; the anchor never replaces prose, grants
> access, or retargets by inference. The reviewer writes in an inline Base Maia
> decision Card that keeps review evidence available and provides specific,
> accessible validation, in-memory draft preservation, truthful weak-network
> recovery, and exact unchanged consequences. One source-owned expected-head
> transaction SHALL atomically commit the terminal result, protected readable-
> body reference/body, optional verified anchor, receipt, lane/source
> transition, and context end. Same meaning retries one receipt; concurrent or
> stale losers write nothing. Authorized staff see read-only feedback on the
> source repair surface and successors reference it without copying authority;
> fresh review remains required. Explanation text SHALL remain out of public
> surfaces, notifications, email, logs, analytics, search, AI, generic exports,
> tasks, comments, CMS fields, and Giving/finance. It SHALL follow current
> purpose-specific authorization, source records retention/hold/disposal, body-
> free audit, forced RLS, and privileged-path parity. D30 creates no thread,
> checklist, assignee, due date, attachment, auto-fix, publication, or financial
> effect.

## ADR and glossary disposition

### ADR-0181

Amend ADR-0181; do not create another ADR. ADR-0181 already owns the
candidate-scoped external-review trust boundary, exact projection/action
surface, source command, context end, and fresh-successor requirement. D30
completes its previously vague “structured, non-public feedback” statement.
ADR-0182 needs only a related-decision reference if desired; its distinction
between Request changes and D28 decline/expiry remains unchanged.

The ADR-0181 amendment should say:

> A source-admitted external `changes_requested` result requires one protected,
> private Unicode plain-text explanation of at most 1,000 code points and may
> include one source-certified anchor from the exact immutable projection. The
> explanation and anchor commit atomically with the terminal source result and
> authorization-context end. They grant no authority, never open D28 recovery,
> never copy into notification/email/task/CMS/public/Giving/finance surfaces,
> and remain readable only under current source-purpose authorization and the
> bound records schedule. A corrected successor references the feedback but
> requires fresh review.

### Glossary

Add:

> **Request-changes explanation** (Phase 24 D30): The single required private,
> bounded, plain-text explanation an exact current external reviewer commits
> with a terminal `changes_requested` result so authorized staff can understand
> what must be corrected. It belongs to the exact source candidate/review,
> carries no permission or completion state, may reference one optional source-
> certified anchor, and follows purpose-specific access and readable-body
> retention while body-free decision history remains separately governed.
>
> _Avoid_: review comment thread; rejection reason taxonomy; task description;
> change-request ticket; reviewer note field; editable successor instruction;
> public annotation; email feedback body; AI correction prompt.

## D31 — Who receives private attention after Request changes?

### Why this needs the next founder decision

D30 makes the returned work understandable, but it deliberately creates no
task, assignee, email, or D29 decline/expiry follow-up. Core still needs one
truthful way to help the right staff notice the correction without broadcasting
private feedback, mistaking provenance for responsibility, or granting a new
permission. This decision is about personal attention only; the source remains
the work authority and current authorization still controls every visible
detail and action.

Hope Ministries example: Eli reports that the French **Contact us** link opens
the English page. Maria can revise Page content, while Joel alone can revise
Navigation. Neither should receive an item for an action they cannot perform,
and Eli's explanation must not be copied into several unrelated tasks. Who
should see **Needs attention** while a corrected successor is still needed?

### Option 1 — source-owned correction attention — recommended

The consequence-owning source opens one correction episode and projects a
personal item only to each current, authorized person who can perform at least
one still-required next source action. One person receives one deduplicated
item for the episode even if several permitted actions apply; the detail shows
only feedback and actions that person may see. Reading clears only unread.
One successful source correction/successor transition ends all applicable
siblings. Proved zero recipients creates nobody and guesses no fallback; the
source remains discoverable to independently authorized staff.

**End-user impact:** Maria and Joel receive relevant, permission-filtered next
actions without a new routing setting. It is the clearest fit with Core's
state-driven attention and “prepare authorized updates; route the rest to their
owners” decisions, but implementation must prevent duplicate items and partial
authorization from widening either person's view.

### Option 2 — the original candidate initiator coordinates

Only the person who started the candidate receives one correction item and
contacts any other source owners.

**End-user impact:** one quiet recipient and simple presentation, but creation
history is not continuing responsibility. Leave, role changes, or lack of
Page/Navigation authority can strand the repair or force out-of-band copying of
private feedback.

### Option 3 — Website Review coordinators coordinate

The one-to-three D29 Review coordinators receive the correction item and choose
who repairs the candidate.

**End-user impact:** reuses a visible configured group, but broadens a route
explicitly created for decline/expiry next-lane recovery, may expose feedback
to people who cannot repair it, and adds a manual routing step and overlapping
responsibility meaning.

### Recommendation and exact question

**Recommend Option 1 — source-owned correction attention.** It aligns private
context, current permission, and the next real action; avoids a third roster or
brittle historical-owner fallback; and preserves personal read state without
turning feedback into a shared task.

Do you choose **Option 1 — source-owned correction attention**, **Option 2 —
original initiator coordinates**, or **Option 3 — Review coordinators
coordinate**? You may amend any option.

## Primary evidence index

### Core repository

- [ADR-0025 — producer-owned protected actions](../../adr/0025-producer-owned-protected-actions.md)
- [ADR-0027 — one notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0029 — reference-not-copy CMS↔operational](../../adr/0029-reference-not-copy-cms-operational.md)
- [ADR-0181 — source-authorized candidate-scoped external review](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [ADR-0182 — one current candidate-review responsibility lane](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
- [D23 source-owned proportional independence](./phase-24-d23-source-owned-proportional-independence-adversarial-review.md)
- [D24 every substantive participant](./phase-24-d24-every-substantive-participant-adversarial-review.md)
- [D25 candidate-scoped external reviewer](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
- [D26 bounded Tenant external-review availability](./phase-24-d26-bounded-tenant-external-review-availability-adversarial-review.md)
- [D27 one visible review lane](./phase-24-d27-one-visible-review-lane-adversarial-review.md)
- [D28 explicit next-lane choice](./phase-24-d28-explicit-next-lane-choice-adversarial-review.md)
- [D29 Website review follow-up route](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md)
- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [Shared Base Maia contract](../../../packages/ui/AGENTS.md)
- [Frontend rules](../../ai/rules/frontend.md)

### Current official primary sources

- [GitHub REST API — pull-request reviews](https://docs.github.com/en/rest/pulls/reviews)
- [GitHub — Quickstart for reviewing pull requests](https://docs.github.com/en/pull-requests/get-started/reviewing-pull-requests-quickstart)
- [GitHub — Pull request reviews](https://docs.github.com/en/pull-requests/reference/pull-request-reviews)
- [GitHub — Resolving reviews](https://docs.github.com/en/pull-requests/concepts/resolving-reviews)
- [GitLab — Merge-request reviews](https://docs.gitlab.com/user/project/merge_requests/reviews/)
- [Microsoft Power Automate — Approve or reject requests](https://learn.microsoft.com/en-us/power-automate/approve-reject-requests)
- [HubSpot — Approve HubSpot content](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
- [HubSpot — Require approvals for deals](https://knowledge.hubspot.com/object-settings/pipeline-approvals)
- [Microsoft Fabric — Review changes in an approval workflow](https://learn.microsoft.com/en-us/fabric/iq/plan/powertable-how-to-review-approval-workflow)
- [Blackbaud Grantmaking — Reviews](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html)
- [Blackbaud Grantmaking — Reject applications](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reject-applications.html)
- [Contentful — Entry comments and field references](https://www.contentful.com/developers/docs/references/content-management-api/entry-comments/)
- [Contentful — Workflow comments API](https://www.contentful.com/developers/docs/references/content-management-api/workflow-comments/)
- [Oracle — Configure approval and rejection comments](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/fauqm/configure-approval-and-rejection-comments.html)
- [Oracle — Rejecting a request](https://docs.oracle.com/en/cloud/saas/enterprise-data-management-cloud/dmcaa/rejecting_requests_102x0bf52e6d.html)
- [Salesforce — Content approval workflow example](https://help.salesforce.com/s/articleView?id=platform.afo_workflow_example.htm&language=en_US&type=5)
- [Salesforce — Respond to a classic approval request](https://help.salesforce.com/s/articleView?id=platform.approvals_processing_approval_requests_parent.htm&language=en_US&type=5)
- [W3C — Forms tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [W3C — Validating input](https://www.w3.org/WAI/tutorials/forms/validation/)
- [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C — Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)
- [W3C — Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- [GOV.UK Design System — Character count](https://design-system.service.gov.uk/components/character-count/)
- [GOV.UK Design System — Textarea](https://design-system.service.gov.uk/components/textarea/)
- [GOV.UK Design System — Error message](https://design-system.service.gov.uk/components/error-message/)
- [OWASP — Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP — Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP — Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [OWASP — Transaction Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html)
- [PostgreSQL 18 — Row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase — Securing your data](https://supabase.com/docs/guides/database/secure-data)

## Subsequent D31 Tasks Hub reconciliation

D30 still creates no task body, comment, assignee, due date, checklist, or
workflow from its explanation or optional anchor. D31/ADR-0183 may separately
project the source-owned correction occurrence into one shared Tasks Hub, but
the source adapter derives typed work and recipients only from authoritative
structured facts. The D30 body and anchor remain source references and never
enter task title/body, comments, search, analytics, AI, exports, caches,
telemetry, or Inngest event/run history.
