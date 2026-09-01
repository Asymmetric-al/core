# Phase 24 D30 — required Request changes explanation primary research

Date: 2026-08-28  
Status: research evidence for the Phase 24 Grill session  
Founder answer: **One required concise explanation; optional source anchor**  
Scope: the D25 source-owned external-review **Request changes** result only

This research does not implement the feature, amend OpenSpec, change an ADR,
create a schema, or activate a notification key. Its research-only acceptance
outcomes use the **D30-RA** namespace so they cannot be mistaken for canonical
implementation acceptance criteria.

## Research question

Is it current, proven practice to require one concise explanation when an
external reviewer selects **Request changes**? If Core adopts that rule, what
content, source-anchor, interaction, privacy, authorization, lifecycle,
retention, localization, accessibility, migration, failure, and operational
boundaries make the experience genuinely useful without accidentally creating
a comments, tasks, checklist, issue-tracking, or rich-text product?

## Evidence labels

- **Repository fact** — directly supported by current Core source, accepted
  ADRs, governing OpenSpec, the glossary, or a completed Phase 24 decision.
- **Verified external fact** — directly supported by a current official
  product, standards, security, database, or accessibility source.
- **Reasonable inference** — a bounded conclusion supported by facts, with the
  inferential step made explicit.
- **Product judgment** — the recommended Core choice; not claimed as a
  universal industry or ministry fact.
- **Assumption** — plausible but unproved with representative nonprofit Website
  staff or production-shaped Core data.
- **Unresolved unknown** — evidence cannot currently settle it; it must remain
  visible until research, implementation design, or policy ownership resolves
  it.

## Executive finding

**Disposition: Accept with required amendments.**

The founder answer is the strongest permanent direction. A terminal
**Request changes** result should not be allowed to return work without any
actionable context. Current first-party evidence supports that judgment:

- GitHub's current REST API makes the review body required when the event is
  **REQUEST_CHANGES**, and lets a review contain location-bound comments.
- HubSpot's current quote-approval flow tells an approver to enter the requested
  changes before rejecting, while its approval message remains optional.
- Contentful models one required string body for a workflow-version comment and
  bounds it to 512 bytes.
- GitLab publishes review comments with a request-changes outcome but makes the
  final review summary optional.
- Microsoft Power Automate permits optional comments in its approvals center.

The evidence therefore establishes a **modern, credible pattern**, not a
universal rule. Requiring an explanation is a Core product judgment justified
by the semantics of this exact outcome: the reviewer is not merely declining;
they are telling staff that the exact candidate is not acceptable and must be
changed. The strongest alternative—optional feedback—is acceptable for generic
approvals but materially weaker for a result whose only useful meaning is
“repair this work.”

The bare answer still needs these amendments:

1. The explanation is one **private, bounded, source-owned plain-text value**,
   not a comment, thread, task, document, message, or notification body.
2. The visible label is **What needs to change?** The helper says **Describe the
   smallest clear correction. A sentence or two is usually enough.**
3. The server accepts 1–1,000 Unicode code points after canonical normalization
   and trimming. One thousand is a balanced v1 ceiling: it leaves room for
   several short international-language corrections while preserving the
   founder's explicit “concise” requirement. It is a product judgment, not a
   claimed external standard.
4. Core accepts all ordinary international scripts, punctuation, emoji, and
   line breaks. It does not impose English words, categories, templates,
   sentiment checks, or a word-count minimum.
5. The explanation is plain text only. No Markdown rendering, HTML, rich text,
   attachments, mentions, links-as-actions, suggested edits, or embedded media
   exist in D30.
6. The optional source anchor is exactly zero or one opaque, source-owned key
   from the immutable external-review projection for that exact candidate. It
   is never a URL, CSS/XPath selector, DOM position, mutable array index, copied
   source body, or authority.
7. Sources that cannot expose a stable safe anchor simply omit **Add a
   location**. The explanation remains sufficient and the submit path remains
   available.
8. One protected server command atomically commits the result, explanation,
   optional anchor, terminal external-review transition, immutable attribution,
   and semantic idempotency receipt against current heads. There is no valid
   **Request changes** result without its valid explanation.
9. Submitted feedback is immutable in ordinary product UX. A separately
   governed privacy/security redaction overlays presentation without rewriting
   the review result, actor, protected keyed fingerprint, or redaction history.
10. The body is never placed in email, a notification preview, URL, log, trace,
    analytics property, metric label, cache key, search index, support
    screenshot, or public/donor/missionary/Giving surface.
11. Staff chrome localizes; the reviewer-authored explanation does not machine
    translate by default. Core preserves its language and direction and renders
    it with automatic paragraph direction.
12. The interaction is one calm consequence-led step using Core's shared
    Base Maia/Base UI primitives. It is an in-flow review panel at every
    breakpoint so the exact candidate remains scrollable and available for
    reference and location selection; narrow screens stack the same panel
    immediately after the action. A modal Dialog or Sheet is not the default
    because making the candidate inert harms the task. No surface adds a second
    confirmation after the reviewer supplies valid feedback and deliberately
    activates the final button.

## Is the choice modern best practice?

### What the sources prove

| Primary source                                                                                                                         | Verified fact                                                                                                                              | Relevance to D30                                                                                                          | What it does not prove                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [GitHub REST pull-request reviews](https://docs.github.com/en/rest/pulls/reviews?apiVersion=2026-03-10)                                | A review body is required when the event is REQUEST_CHANGES or COMMENT; location-bound review comments have their own required body        | A consequential request-changes result can structurally require explanatory feedback and support optional context anchors | GitHub code-review Markdown, threads, suggestions, line coordinates, or editability fit Core Website review |
| [GitHub review quickstart](https://docs.github.com/en/pull-requests/get-started/reviewing-pull-requests-quickstart)                    | Reviewers add a summary, choose a decision, and may leave line-specific comments/suggestions                                               | Feedback plus an explicit result is an established review interaction                                                     | A general summary or multiple comments are necessary for Core                                               |
| [HubSpot quote approvals](https://knowledge.hubspot.com/quotes/manage-quote-approvals)                                                 | **Request changes** requires entering requested changes in a text box; approval has an optional message; the creator can edit and resubmit | Product copy can distinguish required corrective feedback from optional positive context                                  | Quote approval, task creation, revenue permissions, or HubSpot's exact modal should not be copied           |
| [Contentful workflow comments API](https://www.contentful.com/developers/docs/references/content-management-api/workflow-comments/)    | A workflow comment has one required string body, is tied to a workflow version, allows only one per version, and is bounded to 512 bytes   | A single version-bound feedback value is a viable simpler alternative to a thread                                         | 512 bytes is appropriate or equitable for Core's multilingual text                                          |
| [GitLab merge-request reviews](https://docs.gitlab.com/user/project/merge_requests/reviews/)                                           | A submitted review publishes its comments; request changes blocks until addressed; the final summary is optional                           | Context can live in specific feedback even when an overall summary is optional                                            | Bare **Request changes** with no feedback is desirable for Core                                             |
| [Power Automate approval responses](https://learn.microsoft.com/en-us/power-automate/approve-reject-requests)                          | Approval-center comments are optional, and approval/rejection can occur across several clients and languages                               | Optional comments are a credible strongest alternative for generic approvals                                              | Generic approval ergonomics satisfy a “tell staff what to repair” outcome                                   |
| [Blackbaud Grantmaking overview](https://webfiles-sc1.blackbaud.com/files/resources/downloads/bb_grantmaking_onesheet_final%20new.pdf) | Nonprofit grant review products collect reviews and organize feedback from internal and external subject-matter experts                    | External review plus private feedback is genuinely comparable in nonprofit software                                       | Ministries universally need D30, or Blackbaud's grant model should define Website review                    |

### Product conclusion

**Verified external fact:** modern products use both required and optional
feedback. There is no universal industry rule.

**Reasonable inference:** when the result itself means “the work must change,” a
required explanation is more semantically complete than an optional note.
GitHub's API and HubSpot's request-changes flow directly demonstrate that
pattern, while GitLab and Power Automate demonstrate why Core must not falsely
label it universal.

**Product judgment:** Core should require the smallest useful explanation and
keep every richer collaboration feature out. This is more proportionate than
an optional note and much less burdensome than a structured checklist.

**Assumption:** representative ministry staff will understand **What needs to
change?** and will ordinarily complete it in one or two sentences. Moderated
testing must verify this before the key becomes Live.

## Current behavior, accepted intent, and permanent path

### Current repository behavior

**Repository fact:** there is no runtime Phase 24 Website review result,
external-review feedback model, stable source-anchor adapter, D30 form,
notification contract, or D30 schema under the current apps, packages, or
Supabase migrations.

The current repository is not a safe implicit implementation:

- [packages/auth/permissions.ts](../../../packages/auth/permissions.ts) gives
  every staff subrole the same four broad MVP capabilities. It cannot express
  candidate-scoped external authority, exact source-feedback visibility, or a
  privacy-redaction boundary.
- The active [Sitestacker outbound-communications
  delta](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
  permits one candidate-scoped reviewer who sees synthetic evidence, but it
  does not yet define **Request changes** explanation content, anchor identity,
  atomicity, retention, redaction, authorization, or UX.
- Existing CMS textarea fields and unrelated Mission Control notes are local
  implementation examples, not D30 authority or precedent.
- The contribution-detail docs separately require rejection reasons for
  correction approvals. That supports consistent product language, but it is a
  different finance domain and cannot own or silently define D30.

### Accepted intent before D30

- [ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
  limits one external human to one exact candidate and a minimized projection.
  The candidate source owns the review result and public effect; Phase 17 owns
  communication, not the result.
- D25 permits structured non-public feedback and **Request changes** but creates
  no comment system, generic guest workspace, source edit authority, export, or
  unrelated navigation.
- D25 makes candidate mutation supersede the old path, makes the final command
  current-state and compare-and-swap guarded, and retains body-free durable
  invitation/audit evidence.
- [ADR-0182](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
  and D27/D28 keep **Request changes** distinct from decline and expiry.
  Request changes does not open the D28 reassignment episode or use the D29
  follow-up route.
- [ADR-0025](../../adr/0025-producer-owned-protected-actions.md) keeps protected
  operations server-owned, scanner-resistant, no-store, and out of logs and
  analytics.
- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
  keeps source truth, notification presentation, personal engagement, and
  business completion separate.
- [ADR-0029](../../adr/0029-reference-not-copy-cms-operational.md) prohibits a
  read model or CMS copy from becoming operational authority.
- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
  prioritize permission correctness, operational truth, clear next actions,
  accessibility, perceived speed, and cross-surface coherence.

### Best permanent path

Add one typed **Request changes feedback** payload to the source-owned
candidate-review result aggregate. Use a single plain-text value and an optional
source-owned anchor reference. Commit the result only through a protected
packages/api command with current grant, candidate, projection, policy,
authorization, participant, source-head, and review-head proof.

Do not add:

- a generic comment or annotation table;
- a reply, thread, resolved/unresolved, mention, reaction, or assignment state;
- an attachment, file upload, voice note, rich-text/Markdown editor, or link
  unfurl;
- a category, severity, checklist, assignee, due date, reminder, escalation, or
  workflow rule;
- an AI rewrite, summary, classification, moderation decision, or translation;
- editable feedback after the result commits;
- automatic carry-forward of feedback or anchor to a successor candidate;
- an email or notification copy of the explanation; or
- a public, donor, missionary, Giving, financial, or CMS-public projection.

## Exact corrected D30 contract

### D30-R1 — Request changes is a source-owned terminal review result

**Request changes** means the exact external reviewer has completed their
decision for the exact immutable candidate and determined that the candidate
must change. It ends that external review path. It is not decline, expiry,
reassignment, cancellation, approval, publication, source editing, or a
temporary draft status.

The consequence-owning source—not D25, D29, Phase 17, the browser, or an
external provider—owns the valid transition and successor-candidate rule.

### D30-R2 — one explanation is structurally required

A successful **Request changes** result contains exactly one explanation value.
After Unicode normalization and removal of leading/trailing whitespace, the
value must contain at least one non-whitespace Unicode scalar value.

Core does not attempt to prove that the text is polite, grammatically complete,
factually correct, written in a particular language, or semantically
“actionable.” A one-character value can be poor feedback, but arbitrary
minimum-word rules, English-only checks, sentiment scoring, or pattern
heuristics would reject legitimate international input without guaranteeing
quality. Human accountability, attribution, UX guidance, and monitoring are the
proportionate controls.

Whitespace-only, zero-width-only, invalid Unicode, or unsupported-control-only
payloads reject with no result transition.

### D30-R3 — plain text, not rich collaboration content

The explanation is plain Unicode text with ordinary line breaks. Core stores no
HTML or compiled rich-text form and renders the value as data with
context-appropriate output encoding.

D30 does not interpret:

- HTML;
- Markdown;
- URLs as clickable actions;
- emoji shortcodes;
- mentions;
- issue keys;
- commands;
- embedded content; or
- suggested edits.

Text that resembles markup remains literal text. This follows OWASP's guidance
to treat free-form Unicode as untrusted, validate/normalize it, and use
context-aware output encoding rather than trying to denylist dangerous strings.

### D30-R4 — bounded but internationally fair length

The recommended v1 bound is **1–1,000 Unicode code points after NFC
normalization and trimming**.

- The UI says **A sentence or two is usually enough**.
- One thousand is the hard safety ceiling, not the target or a quality score.
- Word counts are rejected because words are not consistently segmented across
  languages.
- UTF-8 byte counts are rejected as the user-facing rule because the same
  visible amount of text consumes different bytes across scripts.
- UTF-16 code-unit counts are rejected because they expose an implementation
  detail and treat some characters inconsistently.
- The server and client use one versioned canonical scalar-count algorithm.
- Valid Unicode plus the 1,000-code-point ceiling already implies at most 4,000
  UTF-8 bytes for the explanation. Normal platform request-size limits remain
  defense in depth, but D30 adds no competing user-facing or database byte rule
  that could reject an otherwise valid international explanation.
- Core never truncates, splits, or silently rewrites an over-limit answer.

This number is a Core product judgment. Contentful proves that strict bounded
workflow feedback is viable, but its 512-byte limit does not prove Core's
number; Blackbaud's 2,000-character rejection context similarly does not prove
that a Website-review explanation should be that long. One thousand balances
Core's 500-character bounded-review precedents with multilingual and multi-issue
headroom while keeping the field readily scannable. GOV.UK's Design System says
character counting should have a genuine content or technical reason and should
let people type over the limit and edit down rather than silently blocking
input. D30 has such reasons: bounded protected requests, privacy, presentation,
and staff reading cost. The limit-pressure monitor requires a versioned increase
if legitimate original-language explanations are constrained.

### D30-R5 — normalization preserves international meaning

The canonical input pipeline:

1. decodes valid Unicode;
2. normalizes CRLF/CR line endings to LF;
3. applies NFC normalization;
4. trims leading and trailing Unicode whitespace;
5. rejects NUL, invalid scalar sequences, Unicode noncharacters, and disallowed
   transport control characters while preserving ordinary scripts,
   punctuation, combining marks, joiners required by writing systems, emoji,
   and line breaks;
6. counts scalar values; and
7. hashes and stores exactly the accepted normalized text.

Core does not case-fold, transliterate, spell-check on the server, translate,
remove accents, collapse internal whitespace, or rewrite punctuation.

### D30-R6 — one optional source anchor

The result may contain **zero or one** source anchor. One anchor helps a
reviewer point to the most relevant visible location without turning D30 into
an annotation collection. Multiple issues remain expressible in the one
explanation, with the most useful location selected or no anchor at all.

The anchor is optional because:

- some sources have no stable section identity;
- some problems concern the whole candidate;
- a reviewer must never be forced to manufacture a location; and
- anchor failure must not erase a valid explanation.

### D30-R7 — anchor identity is exact, opaque, and candidate-bound

A valid anchor is a source-owned opaque key declared in the exact immutable
external-review projection. It is bound to:

- Tenant;
- environment;
- Site;
- source type and adapter version;
- exact candidate and review epoch;
- exact projection version/digest; and
- one safe anchor key in that projection.

It is not a URL, slug, path, XPath, CSS selector, DOM id, array index, editor
cursor, translated label, copied content body, database id supplied directly by
the caller, or mutable reference to the successor candidate.

### D30-R8 — the source adapter owns anchor semantics

Each consequence-owning source may expose a bounded anchor manifest as part of
its minimized review projection. Each entry contains an opaque key, safe
user-facing label, semantic kind, and candidate/projection binding.

The D30 layer can validate and present that manifest but cannot invent,
translate into authority, resolve against live CMS state, or copy source
content. A source without a safe stable manifest omits the **Add a location**
affordance. “No anchor support” is not an error and never blocks the result.

If the retained projection can no longer render an old label, history shows
**Original location no longer available**. The explanation remains intact.
Core never guesses a successor location or redirects the anchor to apparently
similar content.

### D30-R9 — adding an anchor is contextual and reversible before submit

The review projection may offer a secondary **Add this location** action on a
visible anchorable section. Activating it selects that one anchor and exposes
the safe label in the Request changes form. The reviewer can replace or remove
it before submitting.

Adding or removing an anchor:

- changes no candidate/source data;
- saves no comment or draft server-side;
- grants no access;
- does not mark review complete;
- does not affect the explanation; and
- does not create more than one selected location.

### D30-R10 — one consequence-led action panel

Selecting **Request changes** opens one shared Base Maia/Base UI action panel.
On roomy screens it appears inline beside or after the review projection; on
narrow screens it stacks immediately after the review action. At every
breakpoint the reviewer can scroll back to inspect the candidate and select a
source location without dismissing or losing the draft. It is a labelled
complementary/form region, not a modal, Sheet, floating popover, or unrelated
settings drawer. Opening it does not immediately commit the result.

The panel contains:

1. visible title **Request changes**;
2. consequence copy naming that this review ends and a changed candidate needs
   fresh review;
3. visible required textarea label **What needs to change?**;
4. concise helper and privacy guidance;
5. optional selected-location row or **Add a location** affordance when the
   source supports it;
6. secondary **Keep reviewing**;
7. final **Request changes**; and
8. persistent validation/submission state.

There is no second “Are you sure?” dialog. The consequence text, required
answer, and deliberate final button form one understandable confirmation.

### D30-R11 — exact reviewer-facing copy

Recommended default copy:

```text
Request changes

This ends your review of this version. Authorized Hope Ministries staff can
view your private explanation with the returned candidate. The current Website
and Giving stay unchanged; a changed candidate needs fresh review.

What needs to change? (required)
Describe the smallest clear correction. A sentence or two is usually enough.

[The Contact us link opens the English page.                         ]

Location (optional)
Contact us link · French (Canada)                         [Remove]

Include only what staff need to fix this candidate. Do not include passwords,
payment or donor details, or private personal or ministry-location information.

[Keep reviewing]                                      [Request changes]
```

“Private” means visible only through authorized Core review/source surfaces; it
does not promise visibility to one named person. If comprehension testing shows
that **private** creates a false one-to-one expectation, use **Visible only to
authorized Hope Ministries staff**.

### D30-R12 — no destructive draft loss during ordinary errors

While the panel remains open, a validation, stale-state, lost-response, offline,
rate-limit, or transient server error preserves the explanation and anchor in
memory. The UI never clears them merely because submission failed.

Core does not persist the private draft in localStorage, IndexedDB, analytics,
or a generic form-recovery service. It warns before a navigation that would
discard a nonempty draft. Reauthentication should preserve the same-tab in-
memory draft when technically possible; if a full reload is unavoidable, the
UI must warn before leaving rather than claim the draft is saved.

No autosave request, collaboration cursor, or server draft record is required
for a normally one- or two-sentence answer.

### D30-R13 — terminal feedback is immutable in ordinary UX

Before submit, the reviewer can edit freely. After the protected source command
commits, ordinary users cannot edit or delete the explanation or anchor.

This preserves the exact evidence on which staff received a terminal review
result. GitHub permits updating submitted review text in some contexts, but
that does not prove mutable historical review evidence is right for Core's
source-owned terminal result.

If a reviewer made a harmless typo, the staff member can still understand the
original. A material correction requires a new, separately attributable source
history event or a fresh review path—not silent rewriting.

### D30-R14 — privacy/security redaction is an overlay, not an edit

External input can contain secrets, personal information, harassment, or unsafe
ministry/location details despite guidance. A separately authorized
privacy/security command may make the body unavailable to ordinary presentation.

That command:

- requires current trusted Tenant/environment/source scope and a closed
  redaction reason;
- creates an immutable redaction event with server-derived actor and time;
- preserves the review outcome, a protected versioned keyed content
  fingerprint, causal references, and fact that an explanation was submitted;
- replaces ordinary presentation with **Feedback removed for privacy or safety**;
- never republishes the text in the audit event, logs, notifications, or
  exports; and
- applies the separately governed body-erasure/cryptographic-destruction policy.

This narrow repair seam is not a general comment-moderation system.

### D30-R15 — original language is authoritative

The accepted normalized explanation is authoritative. Core may localize labels,
instructions, errors, dates, locale names, and system status, but does not
machine-translate or silently rewrite reviewer text.

The input and rendered explanation use automatic direction per paragraph.
W3C Internationalization documents **dir=auto** as useful when the direction of
runtime text is unknown and specifically describes per-paragraph direction in
textareas. System labels and the explanation remain visually and semantically
separate so bidirectional control cannot make actor, status, or action meaning
ambiguous.

Any future translation is a separately authorized derived presentation with
visible **Translated** labeling, original-text access, provider/privacy review,
and no write authority. It is outside D30.

### D30-R16 — one atomic source command

One protected server command validates and commits:

- exact candidate-scoped review authorization context;
- stable reviewer Party/human binding;
- current Tenant/environment/Site/source/candidate/review epoch;
- current immutable projection and optional anchor manifest;
- current D23/D24 independence and participant lineage;
- current D25/D26/D27 admissibility and grant state;
- explanation canonicalization, count, content class, and protected keyed
  fingerprint;
- exact expected source/review/grant heads;
- terminal **request_changes** outcome;
- explanation payload reference;
- optional anchor reference;
- server-derived actor and timestamp;
- source transition/successor obligation;
- semantic idempotency receipt; and
- body-free security/business audit.

The transaction releases no outcome without its explanation and releases no
explanation without its exact result. External delivery, notification, and
future successor work occur after the authoritative commit.

### D30-R17 — semantic idempotency and concurrency

The idempotency identity binds the durable business effect, not one HTTP
attempt. Its canonical meaning includes the exact scope, candidate, review
epoch, grant/context, normalized explanation's versioned keyed fingerprint,
optional anchor key, outcome, and expected heads.

- Same key and same canonical meaning returns the one original receipt.
- Same key with changed explanation, anchor, outcome, or scope rejects.
- A lost response is reconciled from authoritative local state.
- Concurrent approve, decline, request-changes, revoke, expiry, supersession,
  or policy change has one compare-and-swap winner.
- A losing Request changes attempt creates no orphan feedback, duplicate audit,
  notification, or successor state.
- If another result won, the reviewer sees the truthful terminal outcome
  without Core replaying their explanation against another candidate.

### D30-R18 — source of truth remains singular

The source-owned review-result aggregate owns the authoritative outcome,
feedback reference and protected keyed fingerprint, optional anchor binding,
actor, review epoch, and source transition.

The content-bearing explanation payload is a purpose-limited subordinate record
whose lifecycle supports retention/redaction without rewriting the source
result. The source projection owns anchor meaning. Phase 17 items, emails,
activity cards, summaries, caches, analytics, and exports are derived views and
never write authority.

The physical table split remains design work. The durable invariants do not:

1. one exact review epoch has at most one terminal result;
2. every Request changes result has exactly one valid explanation payload;
3. non-Request-changes results have no D30 explanation or anchor;
4. one result has zero or one valid exact-candidate anchor;
5. feedback cannot move across Tenant, environment, Site, source, candidate,
   review epoch, grant, or actor;
6. ordinary users cannot update committed feedback;
7. redaction cannot change the outcome or attribution; and
8. derived presentation cannot become source truth.

### D30-R19 — database, RLS, and authorization boundary

The browser receives no direct insert, update, or delete grant for review
results or feedback. The packages/api command derives Tenant, environment,
Site, source, candidate, review epoch, actor, grant/context, anchor manifest,
outcome, timestamps, and audit attribution from trusted server context.

Exposed read relations:

- use least grants;
- enable and force RLS;
- use operation-correct **USING** and **WITH CHECK** rules;
- use same-scope composite keys/foreign keys where relationally possible;
- use security-invoker views or revoke browser access;
- prevent an allowed update from moving any scope or ownership field; and
- treat names, emails, explanations, safe anchor labels, and identities as
  separately authorized presentation, not ambient Tenant data.

PostgreSQL documents that table owners normally bypass RLS unless force RLS is
used and that **USING** governs existing rows while **WITH CHECK** governs new
row values. Supabase documents that grants and policies are separate, views can
bypass underlying RLS by default, and service/secret roles bypass RLS. Every
service-role, security-definer, owner, worker, support, repair, import, export,
view, RPC, cache, realtime, backup, and migration path therefore needs the same
scope and purpose proof.

### D30-R20 — minimum recipient visibility

The explanation may be read only by:

- the exact external reviewer within the immediate successful terminal receipt,
  subject to D25 terminal-session rules;
- current authorized Tenant staff who may see that exact source candidate or
  retained review history and whose surface purpose needs the feedback; and
- separately authorized privacy/security repair personnel under audited
  purpose.

Route membership, notification receipt, D29 coordination, broad staff status,
Site existence, reviewer contact visibility, support impersonation, or prior
access never independently grants feedback visibility.

The body is excluded from list rows and notification previews. Authorized staff
open the exact source detail to read it.

### D30-R21 — retention, audit, export, and deletion

The explanation follows the consequence-owning source's candidate-review
feedback retention class. It never receives a longer period merely because a
notification, communication, export, or analytics system copied it.

- Durable body-free audit retains opaque scope/actor/result keys, a protected
  keyed non-enumerable fingerprint only when required, anchor presence/type,
  closed reason/state codes, timestamps, and causal references. A raw or
  unsalted content hash is forbidden.
- Logs, traces, metrics, analytics, error reports, screenshots, and support
  diagnostics retain no body.
- Notifications and emails deep-link to the authorized source; they do not
  include the body.
- Generic Tenant, Website, CRM, donor, or CMS exports omit the body.
- A separately authorized source-history export may include it only under the
  same row/column permission, purpose warning, audit, and retention controls.
- Tenant deletion, legal erasure, identity pseudonymization, and privacy
  redaction can erase or cryptographically destroy the body while retaining
  minimum non-reassignable integrity evidence.
- Backups obey the platform's backup-retention and delayed-erasure evidence
  contract rather than promising immediate physical disappearance.

The exact number of retention days is not proven by D30 sources and should not
be invented here. Before implementation, the source owner and privacy owner
must name the existing or new review-feedback retention class. The D30
invariant is same-or-shorter than source review history, never indefinite
because it is convenient.

### D30-R22 — no comments, tasks, or workflow expansion

One explanation and one optional anchor do not create:

- replies or threads;
- comment resolution or reopening;
- mentions, reactions, followers, watchers, or subscriptions;
- assignments, tasks, queues, due dates, reminders, escalations, or SLAs;
- categories, severity, checklists, templates, custom fields, or Tenant form
  builders;
- multiple annotations;
- suggested edits or source mutations;
- reviewer/staff chat;
- attachments or media;
- email conversations;
- AI rewriting, translation, moderation, or summary; or
- a generic approval/workflow framework.

If real production evidence later proves one of those necessary, it requires a
separate founder decision, authority model, data/retention/privacy design, and
acceptance proof.

### D30-R23 — no public, Giving, finance, or identity effect

The explanation, anchor, validation, result receipt, history, redaction, and
derived presentation:

- publish no content;
- change no public route, locale, default, domain, slug, redirect, or
  discoverability;
- never redirect Giving intent;
- create no donor, contribution, payment, receipt, statement, Legal Entity,
  Stripe, settlement, bank, currency, ledger, payout, tax, or accounting
  effect;
- grant no membership, role, capability, invitation, or reusable external
  identity; and
- expose no donor, missionary, member-care, security, precise restricted
  location, or financial data.

The source may create a private successor-candidate obligation under its own
contract. That is the only operational consequence D30 accompanies.

## Complete UX/UI journey

### Journey A — external reviewer requests a simple change

1. Eli is already on the exact no-store D25 review surface and can compare the
   immutable candidate safely.
2. The action bar presents the source-owned favorable action, **Request
   changes**, and **Decline** as distinct meanings.
3. Eli activates **Request changes**.
4. A responsive Base Maia panel opens in flow. Focus moves to its visible title
   or textarea without trapping the reviewer away from the candidate. On narrow
   screens the same panel stacks after the action and leaves the candidate
   scrollable.
5. Eli sees the consequence before typing: this ends his review of the version,
   authorized Hope staff can view the private explanation with the returned
   candidate, the current Website and Giving remain unchanged, and a changed
   candidate needs fresh review.
6. The textarea is visibly labeled **What needs to change? (required)**.
   Placeholder text does not carry instructions.
7. Eli writes: “The Contact us link opens the English page.”
8. If he previously selected **Add this location** on the Contact row, the form
   shows **Contact us link · French (Canada)**. He may remove it.
9. The final button becomes available when local syntax checks pass. Server
   authority is still re-proved on submit.
10. Eli activates **Request changes** once.
11. The source command commits one result and returns one terminal receipt.
12. The success surface says **Changes requested**, **Your feedback was recorded
    for Hope Ministries**, and **Your access to this version has ended. No
    Website or Giving change was made.** It may repeat the safe explanation/
    location for immediate confirmation but does not imply that Maria has read
    it, a message was delivered, or a new candidate already exists.

### Journey B — no source anchor is supported

1. Eli reviews a whole-site consequence that has no stable section key.
2. The Request changes panel contains no disabled, empty, or mysterious
   location control.
3. Eli gives the explanation and submits normally.
4. Staff receive the same complete result; no anchor absence warning appears.

### Journey C — several issues exist

1. Eli finds a bad Contact link and an untranslated footer.
2. He writes both corrections in the one explanation, preferably with short
   lines.
3. He may choose the most useful single location or no location.
4. Core does not force two submissions, create multiple comments, or imply that
   the anchor covers every sentence.

### Journey D — Maria receives the returned work

1. Maria reaches the exact source-owned candidate detail through a separately
   authorized source surface or future D31 personal attention path.
2. The status card says **Changes requested**, names the safe reviewer identity
   only when she may see it, and shows the immutable submitted time.
3. The private explanation is the primary content:

   > The Contact us link opens the English page.

4. The optional location appears as a secondary contextual row:
   **Location: Contact us link · French (Canada)**.
5. **View original candidate** opens the retained exact review projection only
   if Maria still has current access. It never resolves against unrelated Live
   content.
6. The source-owned next action—not D30—lets an authorized person create or
   continue a changed successor candidate.
7. The explanation never becomes a checklist Maria must manually “resolve.”

### Journey E — stale candidate or concurrent result

1. Eli types the explanation while another source event supersedes the
   candidate or ends the review.
2. Submit loses the expected-head compare-and-swap.
3. Core preserves the draft in the open panel and says:

   **This review has already changed**

   > Your feedback was not submitted. Review the current outcome before taking
   > another action.

4. The UI exposes the authoritative outcome. It does not attach Eli's text to
   a successor candidate or create an orphan note.

### Journey F — lost response

1. The server commits but the response is lost.
2. The button shows a bounded pending state and prevents a second changed
   command.
3. Retrying with the same key and meaning returns the original receipt.
4. If reconciliation is temporarily unavailable, the panel keeps the draft and
   says **We could not confirm whether your request was submitted**.
5. Core queries the exact receipt before permitting any re-keyed attempt.

### Journey G — unsafe feedback

1. An external reviewer includes a credential or private ministry location.
2. Authorized staff do not copy it into a comment, task, or email.
3. A separately authorized privacy/security actor invokes the narrow redaction
   command.
4. Ordinary history now says **Feedback removed for privacy or safety** with no
   body, while immutable outcome/protected-fingerprint/redaction evidence
   remains.

## Interaction layout and copy

### Review action bar

```text
[Complete review]   [Request changes]   [Decline]
```

The actions remain distinct. **Decline** does not require a reason under D25
because it means the person will not perform the review. **Request changes**
requires an explanation because it asserts the candidate needs repair.

### Desktop and roomy-tablet inline panel

- A calm bounded inline panel uses shared Card/form/layout primitives and
  semantic tokens; it is not a modal, popover, or unrelated settings drawer.
- The exact review projection remains visible and operable so the reviewer can
  verify wording and add or replace the one source location while composing.
- The panel has a visible heading and programmatic region/form name. Focus moves
  to the heading or textarea without trapping Tab navigation.
- Title and consequence remain visible without scrolling for ordinary copy.
- Textarea starts at approximately five text rows and grows within the viewport.
- Actions remain visible but never cover the textarea or error text.
- Closing returns focus to the invoking **Request changes** action when still
  present.

### Narrow-screen in-flow panel

- One-column flow, full available width, safe-area padding, and no horizontal
  task scrolling.
- On-screen keyboard does not hide the label, error, count, or final action.
- Important controls meet Core's 44-by-44 CSS-pixel target.
- The action footer may stay reachable but must not obscure explanation text or
  the selected location.
- Long localized button labels wrap or use the established stacked-action
  composition rather than truncating decisive meaning.

### Character count

- Static helper always communicates the 1,000-character ceiling when
  JavaScript is unavailable.
- A dynamic remaining count appears near the 80% threshold, not as constant
  visual pressure for a one-sentence answer.
- Screen-reader announcements are polite and occur after a pause, not every
  keystroke.
- People may type/paste over the limit and edit down; Core does not silently
  stop or truncate input.
- The final error says **Shorten your explanation to 1,000 characters or
  fewer** and is programmatically associated with the textarea.

### Validation copy

| Condition                            | Copy                                                             | Behavior                                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Empty/whitespace                     | **Explain what needs to change**                                 | keep text and anchor; focus textarea                                                                              |
| Over limit                           | **Shorten your explanation to 1,000 characters or fewer**        | show remaining/over count; no truncation                                                                          |
| Unsupported text controls            | **Remove unsupported control characters**                        | preserve visible input and identify the field; never echo raw unsafe bytes                                        |
| Stale candidate/result               | **This review has already changed**                              | commit nothing; show authoritative current result                                                                 |
| Anchor no longer valid before submit | **That location is no longer available**                         | keep explanation; remove stale anchor only after explicit reviewer acknowledgement or let reviewer choose another |
| Offline                              | **You are offline. Your response has not been submitted.**       | preserve in-memory draft; retry when online                                                                       |
| Definite server rejection            | **We could not submit your request** plus safe reason and repair | preserve draft                                                                                                    |
| Ambiguous timeout                    | **We could not confirm whether your request was submitted**      | reconcile exact receipt before another effect                                                                     |
| Success                              | **Changes requested**                                            | show one receipt; no delivery/read claim                                                                          |

## Accessibility, localization, mobile, and low-bandwidth requirements

### Accessibility

Current W3C guidance supports these requirements:

- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/) says forms
  should ask only what is required, use explicit labels/instructions, validate
  input, and report success/errors.
- [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
  says errors should be concise, clear, associated with controls, and explain
  how to repair the input.
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
  requires a logical sequence; the stacked in-flow panel remains in page order
  and never applies a modal focus trap.
- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
  requires non-excepted content to work at 320 CSS pixels without two-
  dimensional scrolling; its guidance specifically discusses review/comment
  interfaces.
- [WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  informs Core's larger 44-pixel important-target rule.

The D30 form therefore requires:

- visible semantic label; required state in text and programmatic semantics;
- helper, privacy hint, count, and error associated with the textarea;
- error summary only if more than one error exists; otherwise immediate
  field-level text is sufficient;
- no placeholder-only instructions;
- no color/icon/position/motion-only state;
- keyboard access to explanation, location selection/removal, cancel, and
  submit;
- predictable focus, focus return, and no focus theft by counts/status;
- one status announcement per meaningful state;
- forced-colors support, sufficient contrast, visible focus, reduced motion;
- 200% text spacing and 400% zoom without clipping;
- screen-reader output that distinguishes system labels from untrusted
  explanation text; and
- accessible source-anchor labels that do not depend on a visual highlight.

### Internationalization

- Staff and reviewer chrome use the exact explicit locale from prior Phase 24
  decisions.
- Reviewer text is not assumed to match the candidate or staff UI language.
- Textarea and rendered paragraphs use automatic direction; surrounding actor,
  locale, status, and action labels use semantic isolation.
- Long German/Finnish labels, CJK, Arabic/Hebrew, combining marks, emoji, and
  mixed-script content must not break counts, wrapping, focus, or protected
  fingerprint parity.
- The scalar-value ceiling and client/server canonicalization are consistent
  across locales.
- Pluralized count copy uses locale-aware message formatting.
- A “sentence or two” is guidance, not a validator; languages without western
  sentence punctuation remain valid.
- There is no flag-as-language UI.

### Low bandwidth

- The minimized candidate projection is already loaded before feedback.
- Opening the form needs no new directory, taxonomy, editor, or provider call.
- Anchor options come from the bounded signed projection manifest.
- Typing creates no network chatter.
- Submission is one bounded request; post-commit secondary effects do not hold
  the source transaction open.
- Loading and retry states use text and CSS, not required media.
- A transient failure preserves the in-memory draft and reuses one semantic key.

## Source-of-truth and conceptual data boundary

### Ownership matrix

| Fact                                     | Authority                                                         | Persisted meaning                                                                                                 | Must not become authority                                           |
| ---------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Candidate content and current head       | consequence-owning source                                         | exact immutable candidate/revision/digest                                                                         | D30 body, anchor label, reviewer browser, notification              |
| Review admissibility and terminal result | consequence-owning source                                         | exact outcome and source transition                                                                               | D25 UI, Phase 17 item, email/provider                               |
| External human and grant                 | Phase 4, Phase 12, CRM/Party under ADR-0181                       | intended human, accepted grant/context, assurance, expiry/revocation                                              | saved contact, email address text, feedback actor field from caller |
| Explanation                              | source-owned review-result aggregate with purpose-limited payload | accepted normalized plain text plus a protected versioned keyed fingerprint only when required                    | notification preview, cache, analytics, task/comment                |
| Anchor identity and display              | source projection adapter                                         | exact candidate/projection-bound opaque key and safe label                                                        | live DOM, URL, mutable index, successor mapping                     |
| Result attribution                       | trusted auth/source command                                       | stable actor, grant/context, source time                                                                          | browser-supplied actor/name/email/time                              |
| Successor correction obligation          | consequence-owning source                                         | current source state after Request changes                                                                        | explanation text, D29 route, activity card                          |
| Presentation                             | exact authorized source read model                                | derived status, explanation, safe anchor, redaction state                                                         | write boundary or independent retention owner                       |
| Notification/attention                   | Phase 17 over producer state                                      | body-free role-safe pointer/status                                                                                | review result, task, delivery proof, permission                     |
| Security/business audit                  | audit owner                                                       | body-free immutable causality and protected keyed fingerprints only when required; never raw/unsalted body hashes | readable feedback archive                                           |
| Redaction                                | privacy/security policy owner                                     | immutable overlay and body disposition                                                                            | outcome edit or actor rewrite                                       |

### Conceptual aggregate

Physical names are intentionally not frozen in a Grill research file. A safe
logical aggregate needs:

- one immutable candidate-review result identity;
- exact Tenant, environment, Site, source, candidate, review epoch, projection,
  grant/context, actor, and expected-head references;
- one closed outcome enum;
- exactly one explanation reference and protected keyed fingerprint when
  outcome is
  **request_changes**;
- zero or one source-anchor key plus exact manifest/projection binding;
- normalized-content version and canonicalization algorithm version;
- immutable source and server timestamps;
- one semantic command/idempotency identity and receipt;
- one terminal source-transition reference;
- an optional current redaction projection backed by append-only redaction
  events; and
- no copied candidate content, display identity, email address, notification
  body, task id as authority, or public URL.

### Database invariants

The schema/design must make these states impossible or reject them atomically:

1. two terminal results for one exact review epoch;
2. **request_changes** with no explanation;
3. **request_changes** with an empty, over-limit, invalid, or unversioned
   explanation;
4. explanation or anchor on approve, decline, expiry, revoke, cancellation, or
   another outcome;
5. more than one anchor;
6. anchor from another Tenant, environment, Site, source, candidate, review
   epoch, projection, or adapter generation;
7. actor, scope, timestamp, or grant supplied by the caller;
8. mutable ordinary updates to committed result/body/anchor;
9. body copied into body-free audit or presentation tables;
10. delete cascade that erases required source-result integrity;
11. redaction that changes result, actor, source head, or protected-fingerprint
    history;
12. reused semantic key with different meaning;
13. cross-scope relationship accepted because UUIDs happen to exist; or
14. a read model, CMS row, task, cache, search document, or notification
    becoming the write source.

### Authorization matrix

| Actor/context                                  | Read candidate                                                                    | Submit Request changes                                                              | Read submitted explanation                                          | Redact body                                         | Edit source                  |
| ---------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------- |
| Exact active D25 reviewer with current grant   | exact minimized projection only                                                   | yes, after every current proof                                                      | immediate own terminal receipt only under terminal-session contract | no                                                  | no                           |
| Same external human, different candidate/grant | only that other grant's projection                                                | only for that other exact review                                                    | no cross-review access                                              | no                                                  | no                           |
| Saved reviewer contact                         | no                                                                                | no                                                                                  | no                                                                  | no                                                  | no                           |
| D21 Website reviewer                           | only independently authorized candidate                                           | only under an exact external grant, which ordinary route membership does not create | only if source-history read authority independently permits         | no                                                  | source-specific only         |
| D29 Review coordinator                         | only independently authorized candidate                                           | no external authority from route                                                    | only if source/history authority independently permits              | no                                                  | source-specific only         |
| Current authorized source staff                | source contract                                                                   | no external-reviewer command                                                        | yes when current source/history purpose permits                     | no, unless separately granted                       | exact source capability only |
| Privacy/security repair actor                  | minimum incident projection                                                       | no                                                                                  | only as purpose-limited repair requires                             | yes, closed audited command                         | no                           |
| Support/operator                               | none by default                                                                   | no                                                                                  | no body by default                                                  | only through separately governed break-glass repair | no                           |
| Donor/missionary/public visitor                | public truth only                                                                 | no                                                                                  | no                                                                  | no                                                  | no                           |
| Browser anon/authenticated direct table client | no business write                                                                 | no                                                                                  | only an explicitly safe read model, if any                          | no                                                  | no                           |
| Service/secret role                            | technically bypasses RLS; application policy still requires exact command context | never ambient                                                                       | never ambient                                                       | never ambient                                       | never ambient                |

## Failure modes and recovery

| Failure                                    | Safe result                                 | Reviewer experience                                                        | Operator evidence/recovery            |
| ------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------- |
| Empty explanation                          | no write                                    | field error; draft retained                                                | validation reason count only          |
| Very long paste                            | no write                                    | over-limit count; edit down                                                | length bucket, never body             |
| Invalid Unicode/control payload            | no write                                    | clear field error                                                          | closed validation code                |
| Forged anchor                              | no write; no existence oracle               | generic location-invalid error                                             | scope-safe security event             |
| Anchor became stale but candidate remains  | no write                                    | keep explanation; choose/remove location                                   | adapter/version mismatch              |
| Candidate superseded                       | no write                                    | authoritative terminal/stale state                                         | CAS receipt/conflict                  |
| Grant expired/revoked                      | no write                                    | privacy-safe access-ended state                                            | exact reason in restricted audit      |
| Permission/policy changed                  | no write                                    | current lawful options only                                                | policy/authorization epoch mismatch   |
| Concurrent approval won                    | no D30 body/source result                   | show approved/current outcome                                              | one winner receipt                    |
| Concurrent Request changes same payload    | one result                                  | original success receipt                                                   | semantic idempotency hit              |
| Same key, changed text                     | reject changed meaning                      | preserve current draft; tell user result already submitted or key conflict | idempotency misuse audit              |
| Commit succeeds, response lost             | one result                                  | reconcile receipt; no duplicate                                            | authoritative receipt lookup          |
| Result commits, notification fails         | result remains true                         | success does not claim delivery                                            | Phase 6/17 retry/reconciliation       |
| Redaction requested during read            | source result unchanged                     | next read shows redaction marker                                           | append-only redaction receipt         |
| Backup still holds erased body             | query path remains redacted                 | no body visible                                                            | backup-aware delayed erasure evidence |
| Translation provider unavailable           | irrelevant; no provider is used             | original remains readable                                                  | none                                  |
| Anchor adapter unavailable on history read | explanation remains; safe unavailable label | no broken action                                                           | adapter health signal                 |
| Browser reload with unsaved draft          | no server claim                             | warn before deliberate navigation where possible                           | no server state                       |
| Offline submit                             | no write                                    | persistent offline message; draft retained in memory                       | no false error incident               |
| Rate limit                                 | no write                                    | safe retry-after; draft retained                                           | rate-limit counter without body       |
| Malicious markup                           | literal encoded text                        | no execution or auto-link                                                  | security test/log code only           |
| Huge tenant history                        | paginated metadata/body-on-detail           | responsive exact detail                                                    | indexed scope/result/time query       |

## Edge-case analysis

### Explanation content

- **Only punctuation:** technically valid after nonblank validation. Do not add
  a fragile semantic rule; monitor low-information feedback and improve helper
  copy or governance if it is a real problem.
- **Only emoji:** same treatment. Emoji can be meaningful; automated rejection
  would not guarantee quality.
- **Whitespace plus zero-width characters:** reject when no visible/semantic
  scalar remains after canonical validation, without rejecting joiners inside
  legitimate writing-system sequences.
- **Mixed scripts/RTL:** accept; render paragraph direction automatically and
  isolate it from actor/status labels.
- **Code, JSON, or URLs:** display literally. No syntax execution, unfurl, or
  clickification.
- **A credential or donor detail:** do not copy it downstream; permit narrow
  redaction and incident handling.
- **Profanity/harassment:** preserve attributable evidence until policy action;
  do not let an unproved multilingual toxicity model become an authorization
  gate.
- **Several corrections:** allow concise lines in one body; no forced taxonomy
  or multiple comments.
- **No clear repair:** a human may still give poor feedback. Required presence
  is a completeness invariant, not a truth guarantee.
- **Very long language expansion:** balanced 1,000-code-point ceiling and canary
  monitor; never use a 512-byte precedent as a multilingual rule.

### Anchor behavior

- **Whole-candidate concern:** no anchor.
- **One issue spans several sections:** select the most useful single location
  or none; explain the relationship in text.
- **Source supports no stable node:** omit affordance.
- **Source label itself contains protected content:** adapter must not expose it;
  use a safe semantic label or offer no anchor.
- **Two visually identical labels:** each opaque key remains exact; UI adds
  enough safe hierarchy, such as **Footer · Contact us**, without exposing a
  raw id.
- **Locale changes while reviewing:** exact candidate/locale binding wins; no
  automatic anchor retarget.
- **Successor reorganizes content:** old history remains bound to old projection;
  do not infer a new target.
- **Retained body purged before anchor metadata:** explanation presentation
  follows body retention; body-free audit retains only anchor presence/type,
  not a copied label.
- **Forged cross-Tenant opaque key:** generic rejection, no enumeration.
- **Anchor manifest exceeds source bound:** entire projection/admissibility is
  indeterminate or anchor affordance is safely omitted per source contract;
  never truncate into misleading availability.

### Lifecycle and people

- **Reviewer identity later merges:** immutable stable actor reference follows
  canonical Party merge policy without reassigning authorship.
- **Reviewer requests account erasure:** display identity may pseudonymize;
  outcome integrity and minimum non-reassignable evidence remain.
- **Staff recipient loses access:** explanation disappears from their read
  model immediately; no cached preview remains.
- **Reviewer wants to retract the result:** ordinary edit/delete is unavailable;
  the source may later expose a distinct audited correction/review path.
- **Staff disagrees with feedback:** the source workflow handles a changed
  candidate or terminal disposition; D30 adds no argument thread.
- **Request changes is clicked accidentally:** the one consequence-led panel
  and required explanation prevent an immediate accidental commit; no redundant
  second dialog is needed.
- **Browser back/forward/prefetch/scanner:** GET/HEAD and navigation have no
  business effect; only deliberate protected POST can commit.
- **Review expires while form is open:** submit fails current proof; text is not
  attached elsewhere.
- **Source adapter version upgrades:** old result remains bound to its old
  projection/adapter generation; compatible readers or safe unavailable labels
  preserve history.

## Security and privacy analysis

### Threats

1. Cross-Tenant explanation or anchor disclosure.
2. Caller-forged actor, scope, candidate, or anchor.
3. Stored XSS or unsafe auto-linked URL.
4. Prompt/command injection into an AI or automation that consumes feedback.
5. Sensitive text copied into logs, telemetry, email, notification, search,
   cache, support tool, export, or screenshot.
6. Service-role/RPC/view bypass of ordinary RLS.
7. Update that moves a permitted row into another scope.
8. Denial of service through huge Unicode, pathological combining sequences,
   regex backtracking, or unbounded anchor manifests.
9. Reuse of a valid explanation against a new candidate.
10. Silent feedback mutation or deletion that falsifies history.
11. Bidi/spoofed text visually obscuring system actor/status/action meaning.
12. Malicious or abusive external feedback.

### Permanent controls

- plain text and context-aware output encoding;
- no Markdown/HTML rendering or auto-linking;
- canonical Unicode normalization and explicit size/control bounds;
- no regex-heavy semantic validator;
- system/user-content visual separation and bidirectional isolation;
- exact server-derived scope, actor, authorization context, and current heads;
- candidate/projection-bound opaque anchor manifest;
- one transaction and semantic idempotency;
- append-only result and body-free audit;
- purpose-bound content row and narrow redaction;
- no body outside exact authorized detail;
- least grants, enable+force RLS, USING/WITH CHECK, security-invoker/revoked
  views, fixed search path, and privileged-path parity;
- request/anchor collection bounds and indexed metadata;
- no AI, translation, external moderation, or workflow dependency; and
- negative cross-scope, malicious-text, Unicode, and service-role tests.

Primary security evidence:

- [OWASP Input Validation Cheat
  Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
  recommends min/max string lengths, normalization, free-form Unicode handling,
  and allowlisting rather than denylist-only defenses.
- [OWASP Cross-Site Scripting Prevention Cheat
  Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
  says untrusted text should be output-encoded for its rendering context and
  warns about framework escape hatches.
- [OWASP Logging Cheat
  Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
  requires excluding sensitive personal data and other inappropriate content
  from logs.
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  documents default-deny behavior under enabled RLS, owner/BYPASSRLS behavior,
  force RLS, and distinct existing/new-row policy checks.
- [Supabase RLS
  guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
  documents the combined grants/policies model, service-role bypass, view risk,
  and allow/deny testing.

## Scalability and performance

The D30 workload is naturally bounded:

- one result per review epoch;
- one explanation up to 1,000 code points;
- zero or one anchor;
- one protected write transaction;
- no full-text indexing;
- no comment collection, reply graph, mention fan-out, attachment storage, AI,
  provider, or collaboration stream;
- body fetched only on exact authorized detail;
- history paginated by Tenant/Site/source/candidate/result time; and
- body-free list, metric, audit, notification, and search surfaces.

Indexes should cover exact composite scope/result lookup and source-history
pagination, not the explanation body. Any future feedback search is a separate
privacy, authorization, retention, relevance, and indexing decision.

The protected source transaction performs only current local authorization,
validation, CAS, result/body/anchor writes, receipt, and audit. It does not
wait for notification, email, analytics, translation, moderation, search
indexing, or source rendering.

Quantitative product limits proposed here are falsifiable:

- 1,000 Unicode code points after normalization;
- exactly zero or one anchor;
- one result per exact review epoch;
- one semantic command receipt;
- one bounded projection anchor manifest under the source adapter's explicit
  size/byte contract;
- body absent from list/notification/log/search; and
- the launch latency and error thresholds in the monitor table below.

## Strongest alternatives

### Alternative A — optional note

**Strength:** minimum reviewer effort; matches generic approval tools such as
Power Automate and GitLab's optional overall summary.

**Failure:** Core can commit “this candidate must change” without any reason.
Staff must rediscover the issue or contact the external reviewer outside Core.
That makes the source result semantically incomplete and undermines the
privacy-focused candidate-scoped experience.

**Disposition:** reject for D30. This remains the strongest plausible
alternative, and its existence is why Core must call the required explanation
a product judgment rather than universal practice.

### Alternative B — required structured checklist

**Strength:** consistent categories, analytics, reporting, and potentially
faster triage for mature repetitive programs.

**Failure:** no evidence establishes a stable cross-source taxonomy. It adds
fields, source schemas, localization, conditional validation, accessibility,
configuration, migration, reporting, and long-term governance. It can also
force reviewers to misclassify unique issues.

**Disposition:** reject for v1. Reconsider only after production evidence shows
repeated categories whose structured value exceeds their burden.

### Alternative C — multiple anchored comments

**Strength:** precise field/section feedback; familiar to code-review and
document-editing users.

**Failure:** creates collections, replies/resolution, ordering, orphaned
locations, notification noise, retention, moderation, synchronization, and
successor-mapping pressure. It duplicates a comments product.

**Disposition:** reject. One body plus zero-or-one anchor delivers most of the
clarity at a fraction of the product and technical cost.

### Alternative D — explanation only, no anchor

**Strength:** simplest model and widest source compatibility.

**Failure:** forces reviewers to restate a location already visible and can
make repeated/translated sections ambiguous.

**Disposition:** credible fallback but weaker permanent UX. Keep the anchor
optional and source-capability-gated, so unsupported sources retain this
simple path without penalizing capable ones.

### Alternative E — editable submitted feedback

**Strength:** easy typo correction.

**Failure:** a terminal result's evidence can change after staff acted; caches,
notifications, audits, and exports can disagree; concurrency and abuse repair
become harder.

**Disposition:** reject ordinary editability. Use pre-submit editing and a
narrow audited privacy/security redaction path.

### Alternative F — AI-assisted rewrite or summary

**Strength:** might improve tone or brevity.

**Failure:** introduces external disclosure, language bias, hallucination,
meaning drift, latency, availability, consent, audit, and accessibility burden
for one short sentence.

**Disposition:** reject. No AI dependency belongs in D30.

## Research acceptance outcomes

These **D30-RA** outcomes are evidence for later OpenSpec, design, tickets,
implementation, tests, and release proof. They deliberately do not claim
current runtime behavior or reserve the canonical D30-AC namespace.

### Meaning and scope

1. **D30-RA001 — Exact outcome.** D30 applies only to an external
   **Request changes** result for one exact candidate review epoch.
2. **D30-RA002 — Terminal path.** A committed result ends that exact external
   review path.
3. **D30-RA003 — Distinct from decline.** Decline remains reason-optional under
   D25 and does not borrow D30.
4. **D30-RA004 — Distinct from expiry.** Expiry creates no reviewer-authored
   explanation.
5. **D30-RA005 — Distinct from D28.** Request changes never masquerades as
   decline/expiry reassignment and never opens D28/D29 by itself.
6. **D30-RA006 — Source owned.** The consequence-owning source owns result,
   transition, and successor obligation.
7. **D30-RA007 — One explanation.** Every successful Request changes result has
   exactly one explanation payload.
8. **D30-RA008 — No bare result.** Blank or invalid explanation writes no
   result, feedback, anchor, receipt, item, or source transition.
9. **D30-RA009 — No other outcome body.** Approve, decline, expire, revoke,
   replace, cancel, and supersede carry no D30 explanation/anchor.
10. **D30-RA010 — No authority.** Explanation/anchor presence grants no
    membership, visibility, review, editing, publication, or route authority.

### Input and content

11. **D30-RA011 — Visible label.** The field label is **What needs to change?**
    and visibly states required.
12. **D30-RA012 — Minimal helper.** Helper recommends the smallest clear
    correction and says a sentence or two is usually enough.
13. **D30-RA013 — Nonblank.** Normalized content contains at least one valid
    non-whitespace scalar.
14. **D30-RA014 — Whitespace rejection.** Whitespace/control-only input commits
    nothing and produces an associated field error.
15. **D30-RA015 — Plain text.** Markup-like input is rendered literally with
    context-aware encoding.
16. **D30-RA016 — No Markdown.** D30 has no Markdown compilation, preview, or
    rendered link.
17. **D30-RA017 — No HTML.** HTML is never accepted or rendered as markup.
18. **D30-RA018 — No auto-link.** URL-like text is not converted into an
    actionable link.
19. **D30-RA019 — Unicode accepted.** Ordinary international scripts,
    punctuation, emoji, combining marks, and line breaks remain valid.
20. **D30-RA020 — Normalization versioned.** NFC/newline/trim validation uses
    one versioned canonical algorithm in all writers.
21. **D30-RA021 — Scalar count.** Accepted normalized text contains at most
    1,000 Unicode code points.
22. **D30-RA022 — No competing byte rule.** The code-point ceiling bounds the
    valid UTF-8 body; normal platform request limits may fail oversized
    envelopes, but D30 does not impose a second script-dependent body limit or
    silently truncate.
23. **D30-RA023 — No word minimum.** No English-centric word/sentence/category
    validator blocks submission.
24. **D30-RA024 — No semantic automation.** Sentiment, toxicity, actionability,
    grammar, and truth are not automated authorization gates.
25. **D30-RA025 — Protected semantic fingerprint.** The stored normalized body
    and semantic idempotency meaning share one versioned keyed non-enumerable
    fingerprint; a raw or unsalted content hash is forbidden and the
    fingerprint never enters telemetry.

### Optional anchor

26. **D30-RA026 — Cardinality.** A result has zero or one anchor, never more.
27. **D30-RA027 — Optional.** Anchor absence never blocks a valid explanation.
28. **D30-RA028 — Source capability.** Unsupported sources omit the affordance
    rather than showing a broken or disabled promise.
29. **D30-RA029 — Manifest only.** Reviewer may select only a bounded key from
    the exact signed/minimized projection manifest.
30. **D30-RA030 — Opaque identity.** Anchor is not URL, path, CSS/XPath, DOM id,
    index, label, or copied body.
31. **D30-RA031 — Exact scope.** Tenant/environment/Site/source/candidate/review/
    projection/adapter mismatches reject atomically.
32. **D30-RA032 — No enumeration.** Forged anchors return privacy-safe generic
    failure without confirming another location.
33. **D30-RA033 — Safe label.** Source owns one safe, localized user-facing
    label or offers no anchor.
34. **D30-RA034 — Contextual selection.** **Add this location** is available
    only beside currently visible anchorable evidence.
35. **D30-RA035 — Replace/remove.** Reviewer can replace or remove the anchor
    before submit without changing candidate or explanation.
36. **D30-RA036 — No draft write.** Selecting an anchor creates no server
    comment, review result, source edit, or audit effect.
37. **D30-RA037 — No retarget.** An old anchor never maps automatically to a
    successor candidate or apparently equivalent node.
38. **D30-RA038 — Unavailable history.** If label/projection is unavailable,
    history says **Original location no longer available** and preserves the
    explanation.
39. **D30-RA039 — No authority.** Anchor never expands read/write scope or
    invokes source navigation without current proof.
40. **D30-RA040 — One issue not implied.** UI does not imply the single anchor
    is a checklist or exhaustive set of concerns.

### Reviewer and staff UX

41. **D30-RA041 — Deliberate opening.** Selecting Request changes opens the
    form; it does not immediately commit.
42. **D30-RA042 — Consequence first.** The form explains terminal review and
    fresh-successor consequences before the field/action.
43. **D30-RA043 — One confirmation.** Valid explanation plus deliberate final
    button is the only confirmation step.
44. **D30-RA044 — Keep reviewing.** A clear secondary action closes the form
    without review/source effect.
45. **D30-RA045 — Draft retained.** Validation/network/stale/ambiguous failures
    do not clear in-memory explanation/anchor.
46. **D30-RA046 — No false autosave.** UI never says saved unless an
    authoritative result/draft contract exists; D30 creates no server draft.
47. **D30-RA047 — Navigation warning.** Nonempty unsaved input receives a
    warning before supported deliberate navigation loss.
48. **D30-RA048 — No local persistence.** Body is absent from localStorage,
    IndexedDB, analytics, and generic form recovery.
49. **D30-RA049 — Exact success.** Success says **Changes requested** and never
    claims staff delivery/read or successor creation.
50. **D30-RA050 — Immediate receipt.** Same response may repeat exact safe
    explanation/location for reviewer confirmation without creating a standing
    dashboard.
51. **D30-RA051 — Staff source detail.** Authorized staff read body only on the
    exact source/history detail.
52. **D30-RA052 — Body-free lists.** List rows, badges, notifications, and
    attention previews contain no body.
53. **D30-RA053 — Source next action.** Staff correction action is source-owned,
    not encoded in explanation or anchor.
54. **D30-RA054 — No resolve checkbox.** Staff do not mark explanation
    resolved; source state ends any actionable condition.
55. **D30-RA055 — Clear identity.** Reviewer identity/time appear only when the
    viewer may see them and remain separate from untrusted body text.
56. **D30-RA056 — Redaction state.** Authorized readers see a stable privacy/
    safety marker rather than blank, missing, or leaked content.
57. **D30-RA057 — No source-anchor control when absent.** Unsupported sources
    have no empty **Location** section.
58. **D30-RA058 — Several issues.** Line breaks and one body support several
    corrections without multiple submissions/comments.
59. **D30-RA059 — No placeholder dependency.** Label, helper, limit, privacy,
    and required meaning remain outside placeholder text.
60. **D30-RA060 — Base Maia.** Responsive in-flow panel, Textarea, Button,
    errors, selected location, and status compose shared @asym/ui Base
    Maia/Base UI primitives and semantic tokens.

### Lifecycle, concurrency, and idempotency

61. **D30-RA061 — Current proof.** Submit re-proves grant, identity,
    authorization, policy, source, candidate, projection, participant lineage,
    and expected heads.
62. **D30-RA062 — One transaction.** Result, feedback reference/protected keyed
    fingerprint, anchor,
    source transition, receipt, and audit commit atomically.
63. **D30-RA063 — No orphan body.** A failed/lost race cannot leave a body with
    no authoritative result.
64. **D30-RA064 — No bodyless result.** Partial writes cannot expose a Request
    changes result before its valid body.
65. **D30-RA065 — One winner.** Concurrent terminal outcomes produce exactly
    one current result.
66. **D30-RA066 — Same retry.** Same key/same meaning returns original receipt
    and creates no duplicate effect.
67. **D30-RA067 — Changed retry.** Same key/different body, anchor, scope, or
    outcome rejects.
68. **D30-RA068 — Lost response.** Authoritative receipt reconciliation occurs
    before any re-keyed retry.
69. **D30-RA069 — Supersession.** Candidate/projection mutation defeats submit
    and never carries text forward.
70. **D30-RA070 — Expiry/revocation.** Current expiry/revocation denies submit
    even when form opened earlier.
71. **D30-RA071 — Policy loss.** Current source/D26/policy loss denies without
    weakening or saving an orphan.
72. **D30-RA072 — Delivery independent.** Post-result notification failure
    never reverses or duplicates the source result.
73. **D30-RA073 — No GET effect.** GET, HEAD, prefetch, preview, scanner, and
    focus/open actions never submit.
74. **D30-RA074 — Immutable ordinary history.** No ordinary edit/delete exists
    after commit.
75. **D30-RA075 — Redaction additive.** Redaction appends evidence and changes
    authorized presentation/body lifecycle without changing outcome/actor.

### Data, authorization, privacy, and security

76. **D30-RA076 — Trusted scope.** Tenant/environment/Site/source/candidate/
    review/grant/actor/time are server-derived.
77. **D30-RA077 — Stable actor.** Feedback attribution binds canonical human/
    Party/grant, not caller name or email.
78. **D30-RA078 — Composite scope.** Relational references cannot attach
    feedback/anchor across scope by UUID alone.
79. **D30-RA079 — Unique result.** One exact review epoch has at most one
    terminal result under database/transaction constraints.
80. **D30-RA080 — Typed payload.** Request changes requires body; other outcomes
    structurally exclude it.
81. **D30-RA081 — No browser writes.** Anon/authenticated table grants cannot
    insert/update/delete result/body/redaction records directly.
82. **D30-RA082 — Enable+force RLS.** Every exposed feedback/result relation
    uses least grants plus enabled and forced RLS.
83. **D30-RA083 — USING/WITH CHECK.** Existing and resulting rows preserve
    exact scope and ownership.
84. **D30-RA084 — View safety.** Views use security invoker or are revoked/
    unexposed.
85. **D30-RA085 — Function safety.** Security-definer/RPC functions have fixed
    search path, least execute grants, trusted context, and equivalent checks.
86. **D30-RA086 — Privileged parity.** Service/secret role, owner, worker,
    support, repair, import, export, cache, realtime, and migration paths pass
    the poison matrix.
87. **D30-RA087 — Output encoding.** Body is always rendered as untrusted data
    in the exact output context.
88. **D30-RA088 — No dangerous sinks.** No innerHTML/dangerous HTML, script,
    style, URL, attribute, or command context consumes body.
89. **D30-RA089 — Body-free telemetry.** Logs, traces, metrics, analytics,
    error reporting, cache keys, and support diagnostics contain no body.
90. **D30-RA090 — Body-free delivery.** Email, SMS, push, webhooks, and
    notification previews contain no body.
91. **D30-RA091 — No generic search.** Explanation is absent from global,
    Website, CRM, CMS, donor, and support search indexes.
92. **D30-RA092 — Purpose retention.** Body retention is same-or-shorter than
    source review history and never silently indefinite.
93. **D30-RA093 — Body-free audit.** Audit retains metadata/causality and only
    a protected keyed non-enumerable fingerprint when required, never readable
    body or a raw/unsalted body hash.
94. **D30-RA094 — Pseudonymization.** Identity erasure can pseudonymize display
    without reassignment or outcome rewrite.
95. **D30-RA095 — No external dependency.** D30 needs no AI, translation,
    moderation, rich-text, file, provider, or comment service.

### Accessibility, localization, and device conditions

96. **D30-RA096 — Label/instructions.** Required state, purpose, helper, and
    privacy instruction are visible and programmatically associated.
97. **D30-RA097 — Error identification.** Errors name the problem and repair,
    remain visible, and focus/associate with the field.
98. **D30-RA098 — Status messages.** Pending, offline, ambiguous, stale, and
    success changes announce once without stealing focus.
99. **D30-RA099 — In-flow panel keyboard.** The responsive panel remains in
    logical page Tab order without a focus trap and exposes a visible
    close/cancel control before submission.
100.  **D30-RA100 — Focus return.** Cancel returns to Request changes; success
      moves to logical terminal status.
101.  **D30-RA101 — Important targets.** Actions, remove location, and anchor
      controls meet Core's 44-by-44 target rule.
102.  **D30-RA102 — Reflow.** Form and staff presentation work at 320 CSS pixels
      and 400% zoom without horizontal task scrolling.
103.  **D30-RA103 — Text spacing.** 200% spacing and long labels do not clip,
      overlap, or hide decisive content.
104.  **D30-RA104 — Forced colors.** Required/error/selection/focus/status remain
      visible without color-only meaning.
105.  **D30-RA105 — Reduced motion.** No motion is needed to understand or
      complete the result; shared reduced-motion policy applies.
106.  **D30-RA106 — Direction.** Textarea and rendered body support automatic
      per-paragraph direction and bidi isolation.
107.  **D30-RA107 — Original language.** Body remains authoritative original
      text; no machine translation or silent rewrite.
108.  **D30-RA108 — Locale-safe count.** Scalar validation and localized plural
      copy behave consistently for CJK, RTL, emoji, and combining sequences.
109.  **D30-RA109 — Mobile keyboard.** On-screen keyboard does not hide field,
      errors, count, location, or final action.
110.  **D30-RA110 — Low bandwidth.** Typing is local; one bounded submit and
      body-free secondary effects keep the path usable.

### Migration, performance, and proof

111. **D30-RA111 — No fabricated backfill.** Historical request-changes rows
     with no explanation remain labeled legacy/no explanation; Core invents no
     body, actor, or anchor.
112. **D30-RA112 — Future-only enforcement.** New contract generation requires
     explanation only after compatible writer/reader/schema activation.
113. **D30-RA113 — Additive rollout.** Dormant schema/read support lands before
     writer activation; mixed versions fail closed.
114. **D30-RA114 — Single writer.** Feature activation has one fenced writer
     and no dual write to comments/tasks/CMS/legacy review rows.
115. **D30-RA115 — Kill switch.** New Request changes writes can stop without
     deleting committed result/body/redaction/audit truth.
116. **D30-RA116 — Roll-forward repair.** Bad scope/anchor/fingerprint/body data is
     quarantined and repaired through audited new evidence, never silent
     mutation.
117. **D30-RA117 — Indexed metadata.** Exact lookup/history use bounded
     composite indexes; body is not indexed or loaded in lists.
118. **D30-RA118 — Bounded request.** Body, anchor manifest, request, and
     response sizes have explicit production-shaped limits.
119. **D30-RA119 — Short transaction.** No provider, notification, rendering,
     translation, moderation, search, or analytics call occurs under source
     locks.
120. **D30-RA120 — Performance gate.** Submit/detail latency meets named canary
     thresholds without weakening proof or exposing body.
121. **D30-RA121 — Comprehension gate.** Representative external reviewers
     distinguish Request changes from decline and understand who can read the
     explanation.
122. **D30-RA122 — Staff task-success gate.** Representative staff can identify
     what to fix and the optional location without treating it as a checklist
     or editable source.
123. **D30-RA123 — Accessibility gate.** Manual keyboard, screen-reader, zoom,
     touch, forced-color, RTL, and low-bandwidth evidence has no unresolved
     critical/serious defect before Live.
124. **D30-RA124 — Negative security proof.** Cross-scope, service-role, view,
     RPC, malicious markup, bidi, oversized Unicode, stale, and concurrent tests
     fail safely.
125. **D30-RA125 — Traceability.** Founder answer, glossary, ADR, OpenSpec,
     design, tasks, tickets, implementation, tests, monitors, rollout, and
     release evidence use one D30 meaning and limits.

## Named monitoring and response contract

These thresholds are proposed launch guards, not claimed current baselines.
Usability/performance thresholds must be confirmed or tightened through
representative research and canary evidence. Security, cross-scope, source-
truth, and public/financial boundaries are zero tolerance.

| Signal                                                | Threshold                                                                   | Owner                                     | Required response                                                                                                                                                                                                  |
| ----------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| d30_request_changes_without_valid_feedback_total      | any value                                                                   | Website Platform + Data Platform          | stop D30 writer, preserve evidence, quarantine invalid result, repair only by roll-forward source decision                                                                                                         |
| d30_cross_tenant_site_candidate_exposure_total        | any value                                                                   | Security + Data Platform                  | P0 disable affected reads/writes, purge caches, preserve incident evidence, audit grants/RLS/views/RPC/export paths                                                                                                |
| d30_unauthorized_feedback_read_total                  | any value                                                                   | Security + Identity & Access              | stop affected reader, revoke leaked projection, investigate purpose/epoch/cache paths                                                                                                                              |
| d30_body_in_log_trace_analytics_delivery_total        | any value                                                                   | Security + Observability + Communications | incident; stop sink, remove/rotate retained material where possible, inspect every propagation seam                                                                                                                |
| d30_stored_xss_or_actionable_link_total               | any value                                                                   | Security + Website Platform               | disable affected renderer, render plaintext-only, preserve evidence, inspect every sink                                                                                                                            |
| d30_cross_scope_or_forged_anchor_accept_total         | any value                                                                   | Security + Website Platform               | stop writer/adapter, quarantine result, verify composite binding and non-enumerating errors                                                                                                                        |
| d30_dual_terminal_result_total                        | any value                                                                   | Data Platform + Source owner              | stop source writer, select no winner manually, reconcile authoritative CAS evidence, roll forward                                                                                                                  |
| d30_orphan_feedback_or_bodyless_result_total          | any value                                                                   | Data Platform                             | stop writer/read projection, quarantine aggregate, repair transaction/constraints                                                                                                                                  |
| d30_idempotency_changed_meaning_reuse_accepted_total  | any value                                                                   | Website Platform + Data Platform          | stop command, preserve receipts, repair semantic hash/key enforcement                                                                                                                                              |
| d30_result_body_mutated_without_redaction_event_total | any value                                                                   | Security + Data Platform                  | incident; stop updates, restore immutable evidence, inspect grants/triggers/repair paths                                                                                                                           |
| d30_redaction_body_reexposure_total                   | any value                                                                   | Privacy + Security                        | P0 stop reader/export/cache, purge projections, verify backup/query ceilings and redaction precedence                                                                                                              |
| d30_public_giving_financial_effect_total              | any value                                                                   | Website Platform + Giving/Finance owners  | P0 stop D30 effects, preserve evidence, repair producer/source boundary                                                                                                                                            |
| d30_submit_failure_rate                               | above 2% for 30 minutes with at least 50 attempts                           | Website Platform                          | segment validation/CAS/auth/network; preserve drafts; roll back writer if systemic                                                                                                                                 |
| d30_ambiguous_submit_rate                             | above 0.5% for 60 minutes with at least 100 attempts                        | Website Platform + SRE                    | inspect receipt lookup/timeouts, keep exact reconciliation, never permit blind re-key                                                                                                                              |
| d30_submit_p95_ms                                     | above 750 ms for 60 minutes with at least 100 attempts                      | Website Platform + Data Platform          | inspect indexes/lock duration/proof calls; remove secondary work from transaction before relaxing safety                                                                                                           |
| d30_feedback_detail_p95_ms                            | above 500 ms for 60 minutes with at least 200 reads                         | Website Platform + Data Platform          | inspect exact-scope index/body fetch/redaction join; preserve authorization checks                                                                                                                                 |
| d30_over_limit_rate                                   | above 2% over 30 days with at least 100 attempts                            | Website UX Research + Product             | study legitimate original-language use through privacy-safe aggregates and consented research; raise the limit through a versioned decision if evidence supports it, never teach abbreviation or silently truncate |
| d30_low_information_feedback_rate                     | above 10% of sampled results over 30 days with at least 50 results          | Website Product + Tenant Success          | moderated study; improve helper/examples or governance; do not add speculative semantic blocking                                                                                                                   |
| d30_out_of_band_clarification_rate                    | above 10% of sampled Request changes episodes over 30 days with at least 50 | Website UX Research + Tenant Success      | study whether copy, anchor, recipient routing, or richer context—not a thread by default—is missing                                                                                                                |
| d30_anchor_invalid_on_submit_rate                     | above 2% for 7 days with at least 50 anchored attempts                      | Website Platform + Source owners          | inspect stale projection/adapter identity; improve contextual selection, never retarget silently                                                                                                                   |
| d30_request_changes_abandon_rate                      | above 15% after form open over 30 days with at least 100 opens              | Website UX Research                       | distinguish deliberate keep-reviewing from friction; test copy/length/mobile before weakening requirement                                                                                                          |
| d30_mobile_completion_success                         | below 90% in moderated or canary cohort                                     | Website UX Research + Accessibility       | block/limit rollout, fix keyboard/reflow/actions, retest representative devices                                                                                                                                    |
| d30_critical_or_serious_a11y_defects                  | any unresolved before Live; any critical in production                      | Accessibility + Website Platform          | block/disable affected surface, repair shared primitive/composition, rerun manual evidence                                                                                                                         |
| d30_privacy_or_safety_redaction_rate                  | above 1% or 3 substantiated incidents in 30 days                            | Privacy + Tenant Success                  | investigate helper/audience/abuse pattern, improve prevention and incident support without body telemetry                                                                                                          |

## Migration, rollout, upgrade, and rollback

1. Record the corrected D30 decision and canonical term in the Grill log,
   glossary, and applicable ADR before implementation.
2. Reconcile D30 into the active Sitestacker OpenSpec with the existing
   D25–D29 authority model, exact source transitions, and the later D31 staff-
   attention decision.
3. Have every participating source register:
   - Request changes admissibility and terminal transition;
   - exact successor-candidate obligation;
   - minimized staff feedback projection;
   - optional bounded anchor adapter/manifest or explicit no-anchor support;
   - review-feedback retention class; and
   - exact read/redaction/export capabilities.
4. Extend Phase 12's closed authorization context and source-command contract;
   broad current staff capabilities are not proof.
5. Add dormant additive result/feedback/redaction structures, composite
   constraints, grants, force RLS, safe views/RPCs, generated types, and
   negative SQL tests.
6. Add compatible readers before any D30 writer. Old historical request-changes
   rows remain visibly legacy/no explanation; no backfill invents text.
7. Build one packages/api writer and one receipt query under TDD. Keep all
   source/authorization/CAS work local and secondary presentation after commit.
8. Build the focused responsive in-flow panel and staff detail using shared
   Base Maia/Base UI primitives. Add no editor, comment, task, or AI dependency.
9. Prove blank/valid/over-limit/Unicode/RTL/malicious/body-leak/anchor/no-anchor/
   cross-scope/stale/concurrent/idempotent/redaction/retention/mixed-version
   outcomes.
10. Run representative nonprofit reviewer and staff comprehension/task testing,
    including mobile, assistive technology, weak network, long localized copy,
    and sensitive-data understanding.
11. Shadow validation and anchor compatibility without storing body telemetry.
    Record only length buckets, result codes, anchor presence/type, and timing.
12. Activate one fenced future-only writer for bounded canary Tenants and
    sources. Never dual-write to comments/tasks/legacy result fields.
13. Keep the notification/source key Reserved until all dependencies, tests,
    monitors, and release evidence are compatible and healthy.
14. Expand source by source. One unsupported source remains unavailable or
    explanation-only according to its explicit contract; compatibility is not
    guessed.

Rollback disables new D30 writes at the single writer fence while preserving
committed source results, purpose-bound bodies, redactions, receipts, and audit.
It never deletes or rewrites history, reopens grants, restores old external
access, or falls back to bare Request changes. If the current release cannot
write a valid explanation, the Request changes action remains unavailable while
other independently valid review actions continue.

## Test and traceability proof map

Later canonical implementation proof needs:

- **Positive:** one sentence, multiline, CJK, RTL, emoji, maximum-bound,
  supported anchor, no-anchor source, staff read, redacted read.
- **Negative:** blank, whitespace/control-only, over-limit, invalid Unicode,
  HTML/script/Markdown/URL, forged/cross-scope anchor, other-candidate grant,
  permission loss, expiry, revoke, supersession, non-request outcome body.
- **Boundary:** 0/1/999/1,000/1,001 scalar values; zero/one/two anchors;
  minimum/maximum request bytes; anchor manifest limit and limit-plus-one.
- **Authorization:** exact external grant, saved contact, D21 member, D29
  coordinator, current source staff, lost staff access, privacy redactor,
  public/donor/missionary, support/operator, service/secret role, owner,
  security-definer, view, RPC, export, cache, realtime.
- **Concurrency/idempotency:** duplicate same payload, same key/different body,
  approve-vs-request, decline-vs-request, expiry/revoke/supersede-vs-request,
  lost response before/after commit, redaction-vs-read/export.
- **Data integrity:** source/result/body/anchor atomicity, composite FKs,
  unique terminal head, immutable body, protected-fingerprint parity,
  body-free audit.
- **Privacy/security:** every log/trace/metric/analytics/notification/email/
  search/export seam, XSS contexts, auto-link prohibition, bidi isolation,
  oversized/combining input, redaction precedence, backup-aware erasure.
- **Accessibility:** label/instruction/error/status, in-flow-panel keyboard/
  focus, target size, 320px/400%, text spacing, forced colors,
  reduced motion, screen readers, mobile keyboards, RTL.
- **Migration:** old row with no body, additive schema, reader-before-writer,
  old-code/new-schema, new-code/old-schema, writer fence, rollback after data,
  source adapter version transition.
- **Production-shaped:** large Tenant history, high concurrent terminal
  decisions, slow authorization dependency, weak network, large valid Unicode,
  anchor adapter outage, canary monitors.

Every ticket/test/release artifact must trace to D30-R and canonical D30-AC
language, not merely assert that a textarea rendered.

## Assumptions and unresolved unknowns

### Assumptions requiring direct evidence

1. Most external Website-review change requests can be made actionable in one
   or two sentences.
2. **What needs to change?** is clearer than **Reason**, **Comment**, or
   **Feedback** for real ministry reviewers.
3. A 1,000-code-point ceiling is sufficiently flexible without encouraging
   essays.
4. One optional location adds enough precision without creating expectation of
   multiple annotations.
5. Privacy guidance reduces accidental sensitive-data entry without making the
   focused flow intimidating.
6. External reviewers understand “this ends your review” and do not expect to
   edit the candidate directly.
7. Staff understand that feedback is evidence/context, not a checklist or
   assignment.
8. No-email-body and source-detail-only presentation remains sufficiently
   discoverable after D31 chooses the attention recipient.

### Unresolved facts to prove before implementation is Live

1. Exact Phase 12 capability/context identifiers for submitting, reading,
   exporting, and privacy-redacting D30 feedback.
2. The source-by-source Request changes transition and successor-candidate
   contract.
3. Which sources can provide a stable safe anchor manifest and their maximum
   manifest size.
4. The existing or new named review-feedback retention class and body-erasure
   owner.
5. Representative completion, feedback length, anchor-use, clarification,
   abandonment, sensitive-entry, and language distributions.
6. Whether **private explanation** or **Visible only to authorized staff**
   creates better comprehension.
7. Whether one or more source-specific safe examples improve feedback without
   becoming templates.
8. The exact D31 recipient/attention route after Request changes.
9. Final metric baselines and canary duration.

These unknowns are not permission to weaken the invariant. They are release
proof and cross-domain owner inputs. No current evidence supports inventing a
ministry workflow, retention period, source anchor, or role.

## Ruthless synthesis

### Must be fixed before D30 is recorded

- Record **Accept with required amendments**, not the unqualified phrase
  “required concise explanation.”
- Define one required normalized plain-text body and one optional exact-
  candidate source anchor.
- Define clear consequence-led copy and one-step interaction.
- Fix the 1,000-code-point v1 ceiling, no silent truncation, and no semantic
  validator.
- Make Request changes, body, anchor, transition, receipt, attribution, and
  audit atomic/idempotent.
- Keep ordinary submitted history immutable and add narrow privacy/security
  redaction.
- State exact audience, body-free secondary surfaces, no translation, and
  source-owned retention.
- State no comments/tasks/checklists/rich text/AI/public/Giving/finance effect.

### Must be captured in PRD/OpenSpec/design before implementation

- D30-R1–R23 and canonical glossary/ADR language;
- exact source transition, successor obligation, anchor adapters, and D31
  attention contract;
- canonical normalization/count/body-byte algorithms and error copy;
- conceptual aggregate, constraints, grants, force RLS, capabilities, readers,
  redaction, retention, export, and deletion;
- every reviewer/staff/error/offline/concurrent/redaction journey;
- all 125 D30-RA outcomes translated into canonical acceptance criteria;
- monitor owners/thresholds/responses;
- source-by-source rollout, mixed-version matrix, writer fence, canary,
  rollback, and release evidence.

### Required implementation safeguards

- one packages/api protected mutation boundary;
- trusted server-derived actor/scope/context/heads;
- typed outcome/body invariant and one optional anchor;
- atomic CAS and semantic idempotency;
- purpose-bound body separate from body-free immutable audit;
- least grants, enable+force RLS, USING/WITH CHECK, safe views/functions, and
  privileged-path parity;
- plaintext rendering, no auto-link, size/Unicode bounds, bidi isolation;
- no body in logs, transport, notifications, search, cache, analytics, or
  generic exports;
- accessible shared Base Maia/Base UI composition;
- one writer and no comment/task/legacy dual write.

### Monitor rather than pre-build

- Feedback length, abandonment, low-information feedback, out-of-band
  clarification, anchor invalidity, mobile completion, latency, and ordinary
  submission errors should be monitored under the named thresholds, then guide
  proportionate copy/limit/UX changes.
- Cross-scope exposure, body leakage, unsafe rendering, forged anchor
  acceptance, dual result, orphan state, changed-meaning idempotency,
  unauthorized mutation, redaction re-exposure, or public/Giving/financial
  effect are stop conditions—not risks to tolerate while monitoring.

### Permanent order

1. Record the corrected D30 decision.
2. Decide D31's exact returned-work attention recipient.
3. Reconcile D25–D31 and every participating source into OpenSpec/ADR/glossary.
4. Name capabilities, retention class, source transitions, and anchor adapters.
5. Implement dormant data/auth/command/read/redaction contracts.
6. Build and test the reviewer/staff UX with shared Base Maia primitives.
7. Prove security, tenant isolation, concurrency, accessibility, localization,
   migration, and production-shaped outcomes.
8. Shadow, test with representative ministries, canary, monitor, then activate.

## Recommended next one-at-a-time Grill question

### D31 — Who receives actionable attention after Request changes?

#### Why this needs a founder decision

D30 now makes the feedback complete, but feedback alone does not decide who
should notice and repair the returned work. D29 applies only when an external
review declines or expires without a decision; routing **Request changes** to
Review coordinators would silently expand their responsibility. Broadcasting
to every editor would create noise and expose private feedback too broadly.

#### Hope Ministries example

Eli requests changes because the French **Contact us** link opens the English
page. Maria can update Page content, but Joel alone can update Navigation. Who
should receive personal **Needs attention** so the exact authorized work is
clear without giving either person extra permission?

#### Option 1 — source-owned correction attention — recommended

The Request changes transition creates one source-owned corrective episode for
each still-required source action. Core sends one personal item only to the
currently authorized people selected by that source's existing responsibility
contract; people see only the explanation/location and actions they may see.
Maria receives the Page correction; Joel receives Navigation if it is a
separate required source action. Reading does not claim work, and source
completion ends the exact item.

**Impact:** most truthful permissions and clearest next action; reuses the
already accepted “prepare authorized updates and route the rest to their
owners” boundary. It needs explicit deduplication when one person owns several
source actions and must avoid presenting one explanation as several separate
review results.

#### Option 2 — original candidate initiator coordinates everything

The person who began the Plan receives one item and contacts other owners.

**Impact:** one quiet recipient and simple presentation, but brittle during
leave/turnover and dependent on out-of-band coordination for actions they
cannot perform.

#### Option 3 — Website Review coordinators receive it

The D29 one-to-three coordinators receive Request changes attention and choose
who repairs it.

**Impact:** a familiar configured group, but it conflates decline/expiry
next-lane coordination with source correction, may expose feedback to people
who cannot act, and creates another manual routing step.

#### Recommendation

**Recommend Option 1 — source-owned correction attention.** It keeps feedback,
authority, and next action aligned; avoids a capability broadcast or brittle
historical owner; and preserves D29's deliberately narrow meaning.

## Primary evidence index

### Core repository

- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [Sitestacker outbound-communications delta](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [ADR-0025 — producer-owned protected actions](../../adr/0025-producer-owned-protected-actions.md)
- [ADR-0027 — one notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0029 — reference-not-copy CMS↔operational](../../adr/0029-reference-not-copy-cms-operational.md)
- [ADR-0181 — source-authorized candidate-scoped external review](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [ADR-0182 — one current candidate-review responsibility lane](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
- [D25 external-review adversarial review](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
- [D27 one visible review lane](./phase-24-d27-one-visible-review-lane-adversarial-review.md)
- [D28 explicit next-lane choice](./phase-24-d28-explicit-next-lane-choice-adversarial-review.md)
- [D29 explicit review coordinators](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md)
- [Phase 24 decision log](./phase-24-multi-site-management-decision-log.md)
- [Core glossary](../../../CONTEXT.md)
- [Core frontend rules](../../ai/rules/frontend.md)
- [Shared UI contract](../../../packages/ui/AGENTS.md)
- [Core backend rules](../../ai/rules/backend.md)
- [Core data-access boundary](../../guides/architecture/data-access-boundary.md)
- [Current broad staff permissions](../../../packages/auth/permissions.ts)

### Current official comparable-product sources

- [GitHub REST API — pull-request reviews](https://docs.github.com/en/rest/pulls/reviews?apiVersion=2026-03-10)
- [GitHub pull-request review quickstart](https://docs.github.com/en/pull-requests/get-started/reviewing-pull-requests-quickstart)
- [GitHub resolving reviews](https://docs.github.com/en/pull-requests/concepts/resolving-reviews)
- [GitLab merge-request reviews](https://docs.gitlab.com/user/project/merge_requests/reviews/)
- [HubSpot quote approvals](https://knowledge.hubspot.com/quotes/manage-quote-approvals)
- [HubSpot content approvals](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
- [Contentful workflow comments API](https://www.contentful.com/developers/docs/references/content-management-api/workflow-comments/)
- [Microsoft Power Automate approval responses](https://learn.microsoft.com/en-us/power-automate/approve-reject-requests)
- [Microsoft SharePoint document approval](https://learn.microsoft.com/en-us/sharepoint/dev/business-apps/power-automate/guidance/require-doc-approval)
- [Blackbaud Grantmaking review overview](https://webfiles-sc1.blackbaud.com/files/resources/downloads/bb_grantmaking_onesheet_final%20new.pdf)

### Current official security, database, UX, and accessibility sources

- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP Cross-Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [PostgreSQL current row-security documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL current constraints documentation](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Supabase row-level security guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API security guidance](https://supabase.com/docs/guides/api/securing-your-api)
- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [WAI form user notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG 2.2 Reflow understanding](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG 2.2 Target Size understanding](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [W3C Internationalization — structural markup and RTL text](https://www.w3.org/International/questions/qa-html-dir)
- [GOV.UK Design System character count](https://design-system.service.gov.uk/components/character-count/)

## Evidence limits

1. Comparable products show viable patterns; they do not prove ministry demand,
   Core terminology, or exact staff behavior.
2. GitHub/GitLab code review is richer and more technical than Website content
   review. Only the feedback/result/anchor boundary is comparable.
3. HubSpot quote approval is a CRM/revenue workflow, not nonprofit Website
   governance. Its required requested-changes text supports the interaction,
   not Core's authority/data model.
4. Contentful's 512-byte bound proves bounded single-version feedback exists,
   not that a byte-based or 512-unit limit is fair for Core.
5. Blackbaud proves nonprofit external review and feedback are real product
   patterns, not that missions ministries use this exact Website workflow.
6. W3C/WCAG/APG define accessibility outcomes and patterns, not Core's visual
   composition or business rule.
7. OWASP/PostgreSQL/Supabase provide security/database mechanics, not product
   demand or correct retention days.
8. The 1,000-code-point maximum, one-anchor limit, exact copy, no post-submit edit,
   and source-owned correction attention recommendation are explicit Core
   product judgments pending representative evidence.
