# Phase 28 D25 — optional organization-provided check-in questions

Research date: **October 17, 2026, UTC**. Repository HEAD:
9cada8f3d8ab59db391d3fd20df77fcadeb09813.
**Disposition: Accept with required amendments.**
**Status: Corrected decision and required amendments explicitly ratified on
October 17, 2026, UTC.**

This is the completed research and decision review for [Q25](phase28-q25-check-in-prompts-research.md),
under the [founder brief](phase28-founder-brief.md). It is not a formal PRD, ADR,
OpenSpec, implementation ticket or release qualification. D24 remains ratified.
No Q26 was posed during the initial review. Subsequent ratification and
continuation are recorded below. No application, schema, dependency, provider,
live configuration or external contact changed.

## Exact corrected decision to record

> **A — Optional organization-provided questions for voluntary check-ins.**
> Authorized staff may maintain one short, ordered set of reusable written
> questions for their organization. Maya can answer any that help, leave others
> blank, and add her own context. She can always write a plain check-in, including
> when no questions are configured. There are no required answers, completion
> scores, deadlines or automatic submissions.
>
> Questions are guidance, not permission to read responses. Maintaining them
> grants no access to Maya's drafts or shared check-ins. Each check-in belongs to
> its exact organization, missionary and ministry/workspace context. Sharing
> activity counts, accepting an invitation or creating a draft does not share
> written content.
>
> Maya's draft stays unshared. **Review sharing** shows the exact content and
> named eligible recipients in their coaching context. **Share check-in** is the
> separate deliberate disclosure. Jordan sees only the currently authorized,
> shared version, read-only. Unanswered questions and private draft edits are not
> included. No new coach or later check-in is automatically included.
>
> Changes to organization questions affect new check-ins, not the wording attached
> to existing answers or drafts. Editing a shared check-in creates private draft
> changes; **Update shared check-in** deliberately replaces its shared version
> for the reviewed audience. **Stop sharing** remains independently available.
> Current permissions, coaching scope, expiry and retention remain binding;
> stopping access cannot recall information already seen.

The ratified initial profile is **zero to five plain-text questions**, with three
suggested as a starting point, not automatically installed. One set, ordinary
text fields and existing coaching access are sufficient. No template marketplace,
branching questionnaire, required-field switch, ratings, AI analysis, coach
comments, automatic tasks, reminders or general form engine is introduced.
These are bounded product judgments, not competitor benchmarks. Explicit
corrections and audience replacement are required amendments to make deliberate
sharing dependable. The subsequent ratification accepts these amendments for
this exact scope; it does not authorize every possible narrative-history policy.

## Evidence, authority and alternatives

| Evidence class           | Finding and practical limit                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Selected intent          | A selects optional organization questions, skipped answers, personal context, deliberate sharing and a working no-question path. [Brief §10](phase28-founder-brief.md:225) and [D8-C11](phase28-d8-adversarial-review.md:506) already require voluntary qualitative coaching. D24 numeric continuation does not authorize narratives.                                                                                                                      |
| Repository authority     | P28 owns the intended native missionary coaching job; P3/P10/P12 own access/projection; P9 owns genuine tasks/interactions. [Owner review](d25-evidence/owner-boundaries.md) traces exact authorities, including later Workflow Studio consumers.                                                                                                                                                                                                          |
| Existing future contract | [MPD-04](../../../prds/workflow-studio/07-core-workflow-catalog.md:2783) already contemplates configurable questions in a disabled Phase 34 automation recipe. Its feedback/reminder language does not grant native coach writes or make P28 depend on the recipe. [FORM-04](../../../prds/program-roadmap/source-2026-09-22/assets/ws/form-blueprints/FORM-04.json:5) is a reference blueprint, not a current producer or authority to require an answer. |
| Current implementation   | The [fresh bounded census](d25-evidence/current-check-in-source.md) found a staff Member Care “Log Check-in” operation, not this coaching feature. Reference form contracts remain unqualified. Existing text/UI/projection plumbing does not prove native draft, publication or coach authorization. No deployed database/provider was inspected.                                                                                                         |
| Comparable products      | MPDX documents organization questions and read-only coaching. CoachAccountable documents saved-but-unsubmitted worksheets and stable assigned wording after template changes. These are relevant precedents, not Core user research or authority to copy compulsory reporting. [Dated primary register](d25-evidence/check-in-ux.md).                                                                                                                      |
| UX evidence              | Current W3C guidance supports explicit labels, accessible feedback and recoverable errors; GOV.UK supports reviewing information and returning directly to change it. Adapting these to a compact voluntary composer is a design judgment.                                                                                                                                                                                                                 |
| Assumptions              | A short set helps preparation, one organization set meets initial needs, and plain text suffices. These need qualification with real missionaries/staff/coaches. No interview, usability study or authenticated competitor test occurred.                                                                                                                                                                                                                  |
| Executed proof           | Source inspection and **17 finite counterexamples** support the review. They are not passing Core tests, actual concurrency tests or production privacy/performance proof. [Probe limits](d25-evidence/check-in-lifecycle-counterexamples.md); [review verification](d25-evidence/review-verification.json).                                                                                                                                               |

**Strongest alternative:** freeform-only check-ins avoid staff setup and prompt
versioning. They remain a complete native workflow. A earns its extra scope by
offering reusable guidance without making it a gate. The plain path remains
first class. A general forms/workflow platform introduces assignments, integration
dependencies and source-binding complexity unnecessary for this job. Reuse small
shared UI and source contracts; do not require the whole future platform.

**Resolved conflicts:** FORM-04's illustrative required next action does not
override optional native answers. MPDX's agency-specific compulsory practices do
not override D8. A GOV.UK author review may show omitted optional answers; it does
not require showing skipped questions to a coach. Core's recipient preview shows
only content actually shared. P12 owns fine authorization; tenant RLS or a new
coach role enum cannot replace its current purpose-bound decision.

## The complete user journey

### Staff: a small settings page

The planned native coaching settings gain **Check-in questions** with this explanation:
**“Offer a few questions to help missionaries prepare. Every answer is optional.
Managing these questions does not give you access to responses.”**

Show ordered plain-text questions, **Add question**, keyboard-accessible **Move
up / Move down**, **Remove**, and one **Save questions** action. A missionary
preview uses examples, never real private answers. Show last saved time and
authorized editor. No required toggles, answer types, scores or response dashboard.
Saving an empty set is valid: **“No organization questions. Missionaries can
still write a check-in.”** Removing a question explains that existing check-ins
keep their original wording. An error preserves edits; a concurrent staff save
requires review rather than silently overwriting.

Illustrative starters, not an installed questionnaire or a claim about every
ministry: “What went well?”, “What would you like help thinking through?” and
“What would you like to focus on next?” Staff can write their own language.
Guidance discourages requesting supporter identities, private care/history or
restricted locations. This is fundraising coaching, not member-care intake.
The settings capability is checked independently from response access.

### Maya: write naturally, then choose disclosure

Use **Coaching → Check-ins** in the existing organization/ministry context.
The empty state says **“Write a check-in when it would help your next
conversation.”** Primary action: **Write check-in**. No overdue badge, missing
weekly slots or completion percentage.

Use a calm single-column page, readable text, stable labels and ordinary text
areas with shared base-maia / Base UI / @asym/ui components and semantic tokens.
Mobile follows the same sequence without a cramped dialog or wide table.
Show **“Draft — not shared with coaches”** and **“Answer any questions that help,
or write your own update.”** An immediate **Write without questions** choice
hides unanswered guidance. Nonempty answers stay visible until deliberately
cleared; hiding prompts must not silently discard or later disclose hidden text.

Each prompt is visibly **optional**. **Your own context (optional)** works with
or without prompts. A title, period, coach, target or next action is not required
to save writing. Use the created date for the list label; Maya can describe a
period in her words. Numeric period selection stays in the separately shared
activity summary. Blank fields are valid. Sharing entirely empty/whitespace
content says **“Add an answer or some context before sharing.”**

Autosave is private and acknowledged by the server: **Saving…**, **Draft saved**,
or **Not saved — try again**. Do not interrupt typing or announce each keystroke.
Preserve permitted in-memory text on recoverable errors. Do not promise offline
saving or persist bodies to browser storage without an existing qualified policy.
Session expiry pauses persistence/disclosure and follows the protected sign-in
recovery path. Explicit sign-out/user/tenant changes clear protected content and
pending work. Saved drafts can be resumed.

**Review sharing** shows the actual recipient view, named eligible coaches,
organization, ministry and access duration. The current coaching context can be
shown as intended recipient, but nothing is shared until confirmation. No unrelated
coach is preselected. Preview contains nonempty answers with exact question
wording and personal context, not the skipped questions.
**“Only this version will be shared. Later edits stay private until you share them.”**
**Change** returns directly to the text without losing it. **Share check-in**
commits once. Success: **“Shared with Jordan”**, with **View shared check-in**,
**Edit** and **Manage sharing**.

Without an eligible coach, writing still works: **“You can write now and choose
an eligible coach when you are ready to share.”** After acknowledged persistence,
show **“Saved as a draft.”** The existing invitation path remains separate.
Accepting a pending invitation does not silently acquire any draft or earlier
check-in. Share implies no email/calendar operation.

### Jordan: useful read-only context

Inside the selected coaching context, **Check-ins** lists currently shared entries
by date, author and **Updated** where appropriate. For many missionaries/projects,
use the D8-defined context navigation and bounded metadata lists, not a cross-person
feed of body snippets. Open one entry to read its question headings, answers,
personal context and shared/updated time. No draft/skipped-answer counts, raw-record
links, edit control or reply box.

**“No check-ins shared”** describes available evidence, not failure to report.
Unavailable/revoked access is distinct from a known empty result and must not
reveal a protected denial reason. Author identity is part of the admitted coaching
context; that does not automatically permit donor names within narrative text.

### Edits, withdrawal and return

Staff changes apply to the next new check-in. Existing drafts may say
**“You started with an earlier question set. Your answers are unchanged.”**
Continue that draft; no forced re-answering or migration wizard. Ordinary prompt
retirement does not erase accepted history. A genuine safety restriction uses the
source permission boundary, not template deletion disguised as revocation.

**Edit** creates private changes while the last shared version remains visible:
**“Draft changes — Jordan still sees the shared version.”**
**Update shared check-in** reviews the replacement content and all recipients.
One check-in has one current shared version; different wording for different
audiences uses separate check-ins, not hidden branches. Recipient removal and
**Stop sharing** work independently of draft validity and never publish draft
text. Stop confirms current access removal, not recall of screenshots or memory.
Sharing again requires a fresh reviewed action; an old retry cannot revive it.

## Exact requirements and design amendments

The SHALL language below is ready for later specification promotion. It does not
assert that the structures, commands or policies already exist.

### D25-C01 — Native optional scope

P28 SHALL provide optional native authored coaching check-ins with optional
organization questions. No configured questions SHALL leave plain entry, draft
save, review and deliberate sharing fully usable. Each answer and personal
context SHALL be optional. Empty publication SHALL be rejected without requiring
a particular answer. No cadence, missed-report penalty, score or auto-enrollment.

### D25-C02 — Bounded question administration

One organization-wide ordered set SHALL contain zero to five plain-text
questions. Only currently authorized staff may maintain it. No per-project
override engine, branching, required flag, rating, signature, attachment or
custom field type is introduced. Each published prompt requires non-whitespace
wording; saving zero prompts remains valid and answers remain optional.
Configuration and response access SHALL be
separate capabilities. New organizations start with no questions. One settings
save SHALL atomically publish a version for new check-ins with trusted attribution.

### D25-C03 — Stable question meaning

Questions SHALL have stable source identity and versions with exact wording/order.
A draft SHALL capture the version actually presented when its editor starts,
including when staff change questions before the first save; answers bind to that exact
identity/version, never array position, mutable label or latest-template join.
Edit, reorder and retirement SHALL not rewrite, reassign or erase drafts/accepted
answers. Replacing a question with a different meaning creates a new identity.
No automatic copying into another check-in or rebinding to a changed/replacement
question version. Editing the same check-in preserves its captured prompt meanings
and permitted existing text.

### D25-C04 — Authored source and private drafts

P28 SHALL own native questions/check-ins, working text, accepted revisions and
publication evidence in Asym Postgres. Drafts SHALL be unshared with coaches and
prompt administrators; independently authorized source/legal functions retain
their exact existing powers, not a new general staff reader. UI SHALL disclose
truthful draft scope and not promise absolute secrecy. No artificial supporter
Party or P9 interaction SHALL store this reflection. No previous private history
SHALL populate an answer automatically.

### D25-C05 — Deliberate exact disclosure

The source command SHALL accept the exact reviewed draft version, validated
organization/subject, eligible coaching episode recipients and expected
publication/audience version. Tenant, actor, author and ownership derive from
trusted context/canonical references. UI recipient IDs are selections to validate,
never grants. Share/Update requires at least one explicitly reviewed recipient.
Every selected recipient SHALL be eligible at commit. Removing the final recipient
uses Stop, not publication of a new accepted version to nobody. Changed text,
audience or authority requires refreshed review while preserving the draft, not
silent publication to a different subset. New coaches, later entries, numeric
sharing and invite acceptance SHALL not add written content. Show access duration.

### D25-C06 — One shared version and deliberate corrections

A check-in SHALL have at most one current accepted shared version and one explicit
recipient set. Private edits SHALL not move its shared pointer. Publication SHALL
atomically commit accepted content, audience changes, required durable audit and
idempotent outcome. Update SHALL review all retained recipients, additions and
removals. Prior accepted revisions preserve historical identity under qualified
retention, not a general coach revision archive. Different audience-specific
wording requires a separate check-in. No per-answer ACL or collaborative editor.

### D25-C07 — Current access, withdrawal and no revival

Reads, lists, previews and publications SHALL intersect current tenant assignment,
subject authority, organization permission, exact episode/module, source
eligibility and expiry/revocation. Stop, recipient removal and policy restriction
SHALL fence future releases independently of draft validation. Stale save/preview,
retry, expired invite or restored settings SHALL not reopen access. Turning Off
the applicable coaching/narrative-sharing permission fences existing/pending
disclosure only within its affected scope; On requires fresh deliberate inclusion
under D8. An external-coach restriction does not revoke internal coaches.
Emptying or retiring the optional question set alone neither withdraws existing
shares nor disables plain writing. A replacement coach does not inherit narrative history. Retention is
not access. Already released content cannot be recalled; enforce rights at the
defined read/commit boundary without promising retroactive erasure of an already
authorized in-flight response.

### D25-C08 — No unowned secondary effects

Sharing SHALL not send mail, subscribe recipients, change activity totals, complete
a target, create a task, alter gifts or record a donor interaction. Text may record
Maya’s account of an agreed next action; it is not independent proof of coach assent
or an operational task/commitment. Future deliberate
task actions use P9; future notifications use P17/P6 and separately admitted
content. Disabled MPD-04/FORM-04 may later bind to this source after exact
qualification; neither is a prerequisite or permission to add reminders/feedback.

### D25-C09 — Reliable drafts and concurrency

Saves SHALL use expected revision and stable operation identity; out-of-order
autosaves cannot overwrite newer text. Multi-tab/device conflicts preserve current
writing and offer understandable recovery without silent merge. Acknowledge only
durable saves. Share SHALL wait for or atomically accept the exact reviewed draft,
never an older saved body. Resolve lost responses from a durable operation receipt
under current rights before a new effect. Cancelling review before publication has no sharing effect. Once a commit
succeeds, cancellation cannot undo it; use current-authorized Stop instead.
Replaying a receipt SHALL not republish
or reveal now-forbidden text. New request keys cannot defeat withdrawal fences
or create duplicate acceptance of the same reviewed check-in publication
transition. Separate deliberate check-ins may contain identical text; body hashes
are not global business-effect identity.

### D25-C10 — Tenant-consistent persistence

Records SHALL have non-null tenant and exact subject/author references.
Composite tenant-aware foreign keys, or equivalent qualified source boundaries
for globally owned identities, SHALL prevent cross-tenant prompt/answer/revision/
recipient relationships. Enforce one current set per tenant, unique prompt and
ordered position per set version, at most one answer per captured question within
each check-in content revision, one shared head per check-in and unique current
recipient per episode/check-in. Each answer binds to the exact offered question
version in that check-in’s captured set; different check-ins may independently
answer the same reusable prompt version. Freeform
has zero prompt answers, not a fabricated prompt. Null recipients mean no share,
never everyone. Generic client updates cannot reparent tenant/subject/author,
manufacture accepted state or change audit attribution. Immutable scope changes
need a new properly authorized record.

### D25-C11 — Database and authorization enforcement

P12's canonical current PDP SHALL provide fine access/source projection; tenant
RLS is coarse defense, not a duplicate permissions engine. Inspect least grants
and effective RLS for exposed tables/views/functions. Prefer private source
tables behind qualified commands; raw browser SELECT on bodies is not a coaching
shortcut. Verify SELECT, INSERT, old-row USING/new-row WITH CHECK on UPDATE,
DELETE, permissive-policy combinations and every privileged path. Omitted
WITH CHECK can inherit USING; omission alone is not proof of bypass. Definer
behavior depends on effective owner; FORCE RLS does not bind superusers/BYPASSRLS.
Any justified privileged function requires the same current source decision,
fixed search path and restricted execution. Test effective migration results,
not only policy text. [ADR0211](../../../adr/0211-distinct-human-approval-for-projection-widening.md:16)
SHALL govern actual projection-policy widening. Ordinary authorized question
edits, draft edits and Share under qualified policy require no supervisory
approval; content maintenance cannot bypass policy change control.

### D25-C12 — Minimum narrative disclosure

Render question/answer plain text safely with line breaks. No HTML execution,
embedded assets, remote previews, automatic URL fetch, attachment or new storage
service. Register/classify this field family through P3/P10/P12 before admission.
Prompt administration, coach identity and fresh authoring do not authorize
protected supporter, care, restricted-location or private-history disclosure.
D8-C11 covers copied, quoted and summarized content. Author guidance/review SHALL
explain eligibility without claiming a text scanner proves it. Unqualified
purposes stay unavailable; no universal DLP or AI classifier substitutes for source
authorization.

### D25-C13 — Surfaces, caches and exports

Coach lists/search SHALL return admitted metadata; bodies load only on authorized
detail. No private drafts, snippets or skipped-answer counts through search,
pagination, notifications, telemetry, aria labels or response shape. Cache keys/
fences include relevant tenant, actor/hat, subject, episode, publication and
permission versions. UUIDs, hidden components and TTL are not authorization.
Narrative responses use private no-store behavior; clear protected caches on
context loss. No public URL, bulk coach export, cross-tenant index or downloadable
report is added. Governed access/deletion operations remain with source owners.

### D25-C14 — Accessible international UX

Use existing shared UI, visible optional labels, keyboard reorder, logical focus/
headings and field-associated errors. Announce save/failure/share outcomes without
stealing focus. Entry/review SHALL reflow at an equivalent 320 CSS-pixel width for non-excepted
vertical content and support 200% text resizing, with
long international names, RTL and non-Latin input. Dates follow context locale/
time zone, exposing only source-qualified safe calendar/time-zone labels where
needed; an IANA city label SHALL not leak a protected location. Durable events use UTC.
UI localization follows P24. Authored wording preserves its language/version;
no translation provider or automatic answer translation is introduced.

### D25-C15 — Bounded input and queries

Ratified initial limits: five questions, each up to 500 Unicode scalar values;
each answer and freeform field up to 4,000; encoded request at most 256 KiB.
Client/server SHALL count consistently, visibly near limits, test emoji/combining
marks/IME, and never silently truncate. These are conservative product judgments,
not proven optimal limits. A later narrower profile cannot make accepted text
unreadable. Ratified metadata pages default to 25 and cap at 100; authorize before
returning rows/totals. Index tenant/subject/publication ordering and active-recipient
lookup. No full-tenant body downloads or N+1 permission/recipient lookup loops.
Actual launch sizes, concurrency, query plans and latency/error budgets require
measured qualification; no production capacity claim is made here.

### D25-C16 — Lifecycle and retention

Question versions/accepted content SHALL preserve historical meaning; correction
creates a new version. Working drafts mutate only through versioned source
commands. Working, shared, private changes, withdrawn and disposed are distinct
concepts, not necessarily one overloaded enum. Withdrawal, retention and deletion
are separate actions. Removing questions cannot cascade-delete answers; removing
accounts cannot silently destroy required audit or reassign authors. Retention,
disposal/anonymization, legal holds and backups SHALL have qualified source policy
and documented durations before release, including abandoned drafts. No default
forever retention or invented legal period.

### D25-C17 — Operational evidence and recovery

Durable history SHALL identify question changes, authored/accepted revisions,
publication/audience changes, restrictions and outcomes with trusted actor/context/
time. Logs use bounded IDs, reasons and timings, not bodies, sensitive prompt text
or request payloads. Source receipts/reconciliation SHALL recover ambiguous
outcomes without SQL repair or fabricated success. Support requires its own
current authority; prompt administrators cannot read drafts to troubleshoot.
Withdrawal status SHALL describe its committed effect truthfully.

### D25-C18 — Rollout and traceability

Disable activation until source, P12 field/purpose, current reads/mutations,
privacy/retention, recovery, accessibility and capacity proof pass. Deploy additive
compatible structures/readers before writers; reject unsupported versions safely.
Never backfill shared entries from private notes/forms/drafts or infer recipients
from numeric grants. Rollback may stop new authoring/publication and fence reads,
but must preserve lawful history and operational restriction/withdrawal paths.
Re-enabling a kill switch is not a permission grant. Later /to-prd SHALL map
C01–C18 and P01–P24 to requirements/design/tasks; /to-issues creates tickets only
when explicitly requested.

## Adversarial findings

Severity and likelihood are qualitative judgments for an unamended implementation,
not observed incident rates. Each exact clause referenced below is part of the
required permanent fix. All findings preserve A while narrowing unsafe readings
or completing its missing behavior.

### F01 — Guidance becomes compulsory reporting

**Failure/why it matters:** required answers, assignments or missed-report badges
turn preparation into compliance and discourage useful writing.
**Severity:** high product/UX. **Likelihood:** high if copied from an agency
workflow. **Evidence:** founder §10, D8-C11 and the FORM-04/MPD-04 conflict.
**Effect on A:** narrows its interpretation.
**Permanent fix/exact change:** C01–C02/C08; P01–P02/P15. Skipping questions is
valid, freeform always works, and no score/task/submission is inferred.

### F02 — Question changes corrupt answer meaning

**Failure/why:** live-template joins or position-based answers relabel old text
after reorder/edit/removal, damaging trust and historical integrity.
**Severity:** high. **Likelihood:** medium-high without explicit identity.
**Evidence:** ordinary editing counterexamples and CoachAccountable's assigned
template semantics. **Effect:** adds required version boundaries.
**Fix/exact change:** C03/C06/C10/C16; P03–P04/P17. Captured wording is authored
evidence, not a parallel CRM or general event-sourcing system.

### F03 — Reuse creates wrong owners and unnecessary dependencies

**Failure/why:** storing reflections as donor interactions or requiring a general
forms/workflow engine creates hidden actions and expensive coupling.
**Severity:** medium-high. **Likelihood:** medium given nearby reference artifacts.
**Evidence:** owner review separates native P28, genuine P9 work and unresolved
MPD-04 bindings. **Effect:** narrows architecture.
**Fix/exact change:** C02/C04/C08/C18; P15/P24. Reuse shared UI and source authority,
not unrelated storage, forms or orchestration.

### F04 — Prompt management becomes response access

**Failure/why:** broad staff roles, template ownership, numeric grants or another
ministry assignment expose drafts/narratives to an unintended reader.
**Severity:** critical privacy. **Likelihood:** medium for a naive role-only path.
**Evidence:** D8/P12 and source census; existing wrappers/resolver do not qualify
this purpose. **Effect:** narrows authority.
**Fix/exact change:** C04–C07/C10–C13; P05–P08/P18. Keep configuration, source
ownership and current recipient access independent; no role enum shortcut.

### F05 — Autosave publishes or Share uses stale content

**Failure/why:** a coach sees an unfinished correction, or Maya shares a stale
saved body/hidden answer instead of the preview she reviewed.
**Severity:** high disclosure/trust. **Likelihood:** medium-high without private
working/accepted versions. **Evidence:** deliberate narrative contract and
finite publication counterexamples. **Effect:** requires lifecycle completion.
**Fix/exact change:** C04–C06/C09; P06/P09/P12/P14. Exact preview, separate
Share/Update, truthful save state and one shared version.

### F06 — Stale update restores a removed recipient

**Failure/why:** body-only checks ignore an audience change; stale Share or a new
request key reopens access after Stop, expiry or policy Off.
**Severity:** critical. **Likelihood:** medium under realistic retries/multiple tabs.
**Evidence:** independent database/lifecycle analysis; transaction atomicity alone
does not define correct business preconditions. **Effect:** completes current
access. **Fix/exact change:** C05–C07/C09–C11; P08–P11. Check content AND
audience/authority state; receipt replay cannot repeat the effect.

### F07 — Database paths bypass the source decision

**Failure/why:** broad grants, permissive policies, views or service roles expose
raw drafts or permit reparenting/accepted-state spoofing.
**Severity:** critical. **Likelihood:** medium until effective-role proof exists.
**Evidence:** fresh Supabase/Postgres primary documentation and coarse-RLS/fine-PDP
contract; no hosted effective grants tested. **Effect:** requires implementation
safeguards, not a claim of a deployed exploit.
**Fix/exact change:** C10–C13; P05/P07/P18/P20. Tenant-consistent references,
immutable trusted fields and qualified commands; test actual privileges.

### F08 — Fresh prose launders protected data or executes markup

**Failure/why:** prompts solicit confidential material, private history is pasted,
or text/links execute or cause remote requests. Fresh authoring is not proof of
eligibility. **Severity:** high. **Likelihood:** medium.
**Evidence:** D8-C11/C12 and narrative/rendering boundary.
**Effect:** narrows eligible content without introducing blanket AI monitoring.
**Fix/exact change:** C12–C13/C17; P13/P18/P21. Plain text, no fetch/embed, clear
guidance and qualified source purpose; never call free text anonymous.

### F09 — Unreliable drafts and inaccessible recovery lose work

**Failure/why:** weak connectivity, session expiry, composed input or multiple
devices lose text while the UI says Saved or gives unusable recovery.
**Severity:** high usability. **Likelihood:** high if recovery is an afterthought.
**Evidence:** W3C feedback guidance and realistic field conditions; not measured
Core failures. **Effect:** strengthens usability.
**Fix/exact change:** C09/C14–C15; P09/P12/P19. Durable acknowledgement,
accessible recovery and preserved permitted writing; no unfounded offline promise.

### F10 — Coach dashboards expose private choices or create surveillance

**Failure/why:** body feeds, skipped counts, overdue flags or bulk exports expose
context and equate absent evidence with performance.
**Severity:** high. **Likelihood:** medium with generic dashboard reuse.
**Evidence:** founder voluntary contract and D24's exact-context precedent.
**Effect:** narrows presentation.
**Fix/exact change:** C01/C07/C13–C14; P02/P08/P16/P21. Context-bound lists,
read-only detail and truthful empty/error states; no score or inference of effort.

### F11 — Retention destroys history or preserves excessive private text

**Failure/why:** prompt/user deletion cascades answers, drafts persist indefinitely,
or Stop falsely promises deletion/recall.
**Severity:** high. **Likelihood:** medium without source policy.
**Evidence:** D8-C13 and unresolved native source/retention qualification;
FORM-04 does not supply approved durations. **Effect:** adds lifecycle and a
release gate. **Fix/exact change:** C07/C16–C18; P10/P17/P22. Qualify durations,
holds and backups; preserve historical meaning without continuing reader access.
No invented legal retention period.

### F12 — Unbounded payloads and permission queries degrade service

**Failure/why:** full-body portfolio downloads, unlimited text and N+1 permission
checks consume bandwidth/memory/database work for larger coaching portfolios.
**Severity:** medium. **Likelihood:** medium with growth.
**Evidence:** query/data-shape reasoning, not a measured capacity result.
**Effect:** adds bounded implementation criteria.
**Fix/exact change:** C13/C15; P16/P23. Small inputs, metadata pagination,
appropriate indexes and representative measured plans/load qualification.

### F13 — Missing business receipts make safe recovery impossible

**Failure/why:** lost Share responses duplicate effects; support must inspect
private bodies or repair SQL; logs themselves expose narrative content.
**Severity:** high. **Likelihood:** medium.
**Evidence:** partial-success analysis, not observed production incidents.
**Effect:** completes reliability.
**Fix/exact change:** C06/C09/C17; P11/P20/P21. Atomic evidence/receipt,
bounded diagnostics and current-authority recovery, independent of notifications.

### F14 — Rollout or inflated proof claims activate unsafe behavior

**Failure/why:** old readers/new writers disagree, historical imports disclose
private notes, or a doc/probe pass is mistaken for qualified runtime.
**Severity:** high. **Likelihood:** medium without explicit gates.
**Evidence:** fresh static census, unresolved owner bindings and actual review
scope. **Effect:** adds delivery safeguards.
**Fix/exact change:** C18 and P01–P24. Additive rollout, safe rollback, no historical
auto-sharing, actual runtime qualification and traceability before activation.

## Every requested category evaluated independently

Each material row maps to the findings above containing its failure, consequence,
severity, likelihood, evidence, effect and exact fix. Covered means required by
the corrected decision, not implemented.

| Category                                                  | Material concern?                              | Independent conclusion and exact coverage                                                                                                                                                                     |
| --------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, alternatives                 | **Yes**                                        | Reusable guidance has a credible job; compulsory forms/setup would defeat A. Freeform-only is the strongest alternative. F01/F03; C01–C02/C08.                                                                |
| Brittleness                                               | **Yes**                                        | Live wording, stale preview and unstable context break on normal changes. F02/F05/F06; C03/C05–C09.                                                                                                           |
| Technical debt                                            | **Yes**                                        | Wrong domain storage, generic form engines and duplicate permission logic create poor abstractions. F03/F07; C04/C08/C11/C18.                                                                                 |
| Edge cases                                                | **Yes**                                        | No prompts, all skipped, pending invites, retired wording, correction and session loss need defined outcomes. F01/F02/F05/F09; C01/C03/C05/C09/C14–C16.                                                       |
| Footguns                                                  | **Yes**                                        | Save-as-share, implicit recipients, misleading Stop and staff previewing real answers are easy harmful actions. F04–F06/F11; C02/C04–C07/C16.                                                                 |
| Tenant safety                                             | **Yes**                                        | Portfolios, same-user context switches and forged references can mix data. F04/F07/F10; C05/C07/C10–C13.                                                                                                      |
| Database, RLS, authorization                              | **Yes**                                        | Tenant isolation alone cannot protect draft/publication purposes; all grants, old/new-row policies and privileged paths need proof. F06/F07; C10–C11. No monetary fields or precision changes are introduced. |
| Overengineering                                           | **Yes**                                        | Full forms, per-answer ACLs, per-coach branches, recurring automation and AI screening are unnecessary. F01/F03/F05; C02/C06/C08/C12.                                                                         |
| UX/UI and friction                                        | **Yes**                                        | Setup dead ends, unclear saves, cramped dialogs, compulsory labels and poor recovery undermine use. F01/F05/F09/F10; C01/C09/C14–C15; complete journey above.                                                 |
| Source of truth, ownership, invariants                    | **Yes**                                        | Latest template is not historical meaning; narrative is not task/activity truth. F02/F03/F05; C03–C04/C06/C08/C10/C16.                                                                                        |
| Hidden coupling                                           | **Yes**                                        | Numeric grants, later automation, prompt administration and tasks need independence. F03/F04/F10; C02/C05/C08/C13.                                                                                            |
| Failure modes                                             | **Yes**                                        | Partial/ambiguous save and Share must recover without duplicate disclosure. F05/F09/F13; C06/C09/C17.                                                                                                         |
| Lifecycle, temporal correctness, concurrency, idempotency | **Yes**                                        | Wording changes, private corrections, removal/expiry and retry need separate versioned preconditions. F02/F05/F06/F11; C03/C05–C09/C16.                                                                       |
| Data integrity                                            | **Yes**                                        | Position-based answers, duplicate publication, forged parentage and cascades corrupt history. F02/F06/F07/F11; C03/C06/C09–C10/C16.                                                                           |
| Security/privacy                                          | **Yes**                                        | Narrative inference, protected history, markup and caches need source qualification. F04/F07/F08/F10/F11; C07/C11–C13/C16–C17.                                                                                |
| Scalability/performance                                   | **Yes**                                        | Unbounded text/full-body loads/N+1 checks need limits and measured proof. F12; C13/C15. No unverified capacity assertion.                                                                                     |
| Operational burden                                        | **Yes**                                        | Recovery cannot depend on raw-text access or SQL repair. Staff need normal question maintenance. F02/F09/F11/F13; C02–C03/C09/C16–C17.                                                                        |
| Observability/auditability                                | **Yes**                                        | Logs do not establish what was shared; body logging creates new exposure. F13; C06/C09/C17.                                                                                                                   |
| Dependency/integration                                    | **No additional material external dependency** | Checked auth/database/shared UI and later form/workflow references. Native plain text needs no provider API, webhook, package or outbound channel. Existing coupling is addressed by F03/F07, C08/C11/C18.    |
| Migration/rollout/upgrade                                 | **Yes**                                        | Mixed versions, historical import and restored settings may publish or erase content. F11/F14; C16/C18.                                                                                                       |
| Testability/traceability/proof                            | **Yes**                                        | Primary docs and synthetic cases cannot prove runtime behavior. F14; C18 and P01–P24.                                                                                                                         |
| Other development hazards                                 | **Yes**                                        | Absolute privacy promises, hidden revision history, retention guesses and coach-write creep remain hazards. F04/F08/F11/F14; C04/C06/C12/C16/C18.                                                             |

## Required proof obligations

These are future outcome-based acceptance criteria, not tests already passed.

| ID  | Falsifiable result                                                                                                                                                                                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 | Zero questions permits writing/save/review/Share. With five questions, one answer or freeform alone succeeds; wholly empty Share does not.                                                                                                                                                                 |
| P02 | Creating/skipping/abandoning check-ins creates no report debt, score, reminder, activity count or disclosure.                                                                                                                                                                                              |
| P03 | Edit/reorder/remove/replace prompts after an editor starts, including before first autosave: presented answer association/wording stays exact; new draft gets current questions. Two check-ins from two missionaries may independently answer the same reusable prompt version.                            |
| P04 | Concurrent staff saves yield one current version and recoverable conflict preserving unsaved work.                                                                                                                                                                                                         |
| P05 | Coach, unrelated missionary, prompt-only staff, wrong tenant/hat and anonymous callers cannot read drafts or alter/share another subject through any admitted path.                                                                                                                                        |
| P06 | Autosave after Share changes only the private working version; Jordan sees accepted text until reviewed Update.                                                                                                                                                                                            |
| P07 | Forged tenant/author/subject/question/recipient/accepted-state/audit inputs cannot create wrong-context relationships or elevate access on INSERT/UPDATE.                                                                                                                                                  |
| P08 | Same user across tenants/projects/episodes sees only current context, including totals, caches, previews and accessibility metadata.                                                                                                                                                                       |
| P09 | Delayed autosave A after B, multi-tab edits and unsaved text at Share cannot silently lose B or publish A; recovery preserves permitted writing.                                                                                                                                                           |
| P10 | Stop/removal winning before stale Update/retry prevents resurrection. Invalid draft cannot block Stop. Applicable policy Off/expiry fences affected reads; On does not revive access. Emptying questions alone leaves sharing/plain entry intact; external-only Off leaves internal coaches unchanged.     |
| P11 | Duplicate Share, lost successful response and retry with same/new key for the same reviewed transition produce one exact business effect with durable current-authority recovery. Two deliberately distinct check-ins with identical text remain valid.                                                    |
| P12 | Review→Change→Review preserves exact text/recipients. Hidden nonempty answers never appear unexpectedly. Any recipient losing eligibility before commit causes recoverable atomic rejection. Zero-recipient publication is rejected; removing the final recipient uses Stop without publishing draft text. |
| P13 | HTML/script/dangerous URLs, bidi, composed input and Unicode remain safe text; no remote fetch or rendering/error leakage.                                                                                                                                                                                 |
| P14 | Correction shares to the reviewed full audience. Superseded content is not an ungranted archive. New coach/later entry needs explicit Share.                                                                                                                                                               |
| P15 | Answers create no donor interaction/task, goal progress, gift, consent, message or automation; future task actions retain owner authority.                                                                                                                                                                 |
| P16 | Many coaching contexts use bounded metadata pages/exact detail; no body snippets, rankings, skipped counts or unauthorized totals.                                                                                                                                                                         |
| P17 | Prompt/account removal, retention, legal hold, disposal and backup recovery preserve required evidence without restoring access/reassigning authors.                                                                                                                                                       |
| P18 | Effective grants/policies/views/functions/service paths match source/P12. Test SELECT, old/new UPDATE rows and permissive combinations, not just syntax. Actual policy widening follows ADR0211; ordinary authorized content/share operations need no supervisory approval.                                |
| P19 | Keyboard/screen-reader, 320 CSS-pixel reflow, 200% text resize, safe time-zone labels, RTL/IME, long names and lossy network users can write/review/share/stop with correct focus/outcomes.                                                                                                                |
| P20 | Publication/audit/receipt failure is atomic or recoverable through proved source protocol; diagnosis needs no bodies or SQL repair.                                                                                                                                                                        |
| P21 | Logs, telemetry, search, responses, caches, export/error paths contain no inadmissible narratives/recipients. Restrictions fence subsequent releases.                                                                                                                                                      |
| P22 | Approved retention durations and draft/disclosure copy match actual native policy; no provider/blueprint default is silently inherited.                                                                                                                                                                    |
| P23 | Test 0/5/6 prompts, exact/over text/byte limits, pagination boundaries and largest launch cohorts; publish query plans, budgets and measured load results.                                                                                                                                                 |
| P24 | Mixed-version rollout, kill switch and rollback retain lawful evidence/restriction paths. No backfill becomes sharing. Trace every C/P to owners and release proof.                                                                                                                                        |

## Synthesis and delivery order

1. **Ratified decision:** the founder explicitly accepted A and C01–C18/P01–P24,
   including optionality, native ownership, stable wording, private drafts and
   deliberate exact publication, on October 17, 2026 UTC. This ratifies intended
   behavior and future obligations, not implementation. D24 is unchanged.
2. **In the later spec/design:** define the one P28 source/private/accepted
   version model; register P12 field/purpose and exact capabilities; qualify
   narrative eligibility/retention and bounded profile. Promote the journey
   with P01–P24. Tasks/communications and future Studio bindings keep their
   owners. No /to-prd or /to-issues transition occurred.
3. **Before activation:** prove tenant references/current PDP/effective database
   access, content-and-audience races, recovery, safe surfaces, retention,
   accessibility and staged rollout. These are release gates, not monitored
   exceptions. Qualify the full prototype with actual missionaries, staff and
   multi-context coaches on representative mobile/accessibility journeys.
   Record observations and fixes; no invented feedback. Any critical disclosure
   or unrecoverable text loss blocks launch.
4. **After gates pass:** use existing rollout controls for a bounded tenant pilot.
   Measure residual signals below without bodies. Expand only within measured
   service budgets. Native plain check-ins need not wait for optional vendors
   or workflows.

| Monitored residual      | Signal and threshold                                                                                                               | Named owner and response                                                                                                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persistence correctness | Any confirmed acknowledged draft lost, duplicate accepted publication or wrong recipient: **one incident**.                        | **Missionary Workspace engineering owner** pauses affected writes/disclosure, preserves metadata, runs source recovery and regression qualification before resuming.                                                                           |
| Access correctness      | Any confirmed cross-tenant, private-draft or revoked-recipient release: **one incident**.                                          | **Identity/Permissions security owner** immediately fences affected feature/cohort and runs incident response; monitoring does not replace P12 proof.                                                                                          |
| Routine availability    | Technical draft-save/Share failures exceed **1% of at least 100 attempts within 15 minutes**; exclude expected denials/validation. | **Missionary Workspace on-call** investigates dependencies/latency/receipt state, narrows rollout and supplies truthful recovery status. Low-volume correctness incidents use the above thresholds. Ratified policy, not observed performance. |
| Sharing comprehension   | Any pilot participant believes autosave shared text or cannot identify recipients after review.                                    | **Missionary Workspace product/design owner** blocks expansion, fixes interaction/copy and repeats the affected task through authorized research.                                                                                              |
| Profile fit             | An organization cannot express its useful optional guidance within five prompts and requests an exception.                         | **Coaching product owner** reviews real task evidence, improves wording/freeform first, and changes the bounded profile only through normal design review if justified; no automatic form-builder expansion.                                   |

Actual retention durations, deployed permissions and measured capacity are
implementation qualification obligations with source owners, not assumptions or
permission to launch an incomplete service. The product decision is complete
without falsely claiming unbuilt implementation proofs exist.

## Sources and verification record

- [Primary UX sources and dates](d25-evidence/check-in-ux.md).
- [Governing owner reconciliation](d25-evidence/owner-boundaries.md).
- [Question/content semantics](d25-evidence/check-in-semantics.md).
- [Database/current authority review](d25-evidence/database-check-in-boundaries.md).
- [Fresh bounded source census](d25-evidence/current-check-in-source.md).
- [Lifecycle counterexamples](d25-evidence/check-in-lifecycle-counterexamples.md).
- [Cross-review reconciliation](d25-evidence/cross-review-reconciliation.md).
- [Preserved prior evidence](d25-evidence/prior-evidence-sha256.json) and
  [structural verification](d25-evidence/review-verification.json).

Additional freshly read primary pages on October 17, 2026:
[GOV.UK Check answers](https://design-system.service.gov.uk/patterns/check-answers/),
[W3C User Notification](https://www.w3.org/WAI/tutorials/forms/notifications/),
[W3C Form Instructions](https://www.w3.org/WAI/tutorials/forms/instructions/), and
[MPDX Reports](https://help.mpdx.org/article/1253-mpdx-quick-reference-guide-reports).
MPDX Reports was updated July 8, 2024; fresh retrieval is not fresh publication.
Current design guidance is not a Core user study. Retrieval provenance and
bounded derivations are retained with the evidence.

**Final disposition: Accept with required amendments.** Record the corrected
decision above. Keep the experience small and voluntary, with dependable question
meaning, draft privacy and deliberate sharing.

## Subsequent explicit ratification

On October 17, 2026 UTC, the founder instructed: **“Ratify this decision and
amendment. Then continue with this phase 28 grill-with-docs session.”**

This ratifies the corrected D25 decision, C01–C18, the bounded initial profile,
P01–P24 as future proof obligations, and the resolved safeguards documented here.
Question administration remains separate from response access; captured wording,
private drafts, exact Share/Update and independent Stop are settled design
requirements. Retention/source/P12/runtime/user qualification remains required
before activation. No source service, schema or deployment is claimed complete.

The original verifier/result are preserved as initial-review artifacts. Fifteen
initial D25 evidence artifacts are pinned in
[ratification-evidence-sha256.json](d25-evidence/ratification-evidence-sha256.json).
Their original proposed-status wording is historical evidence, superseded for
current decision status by this explicit ratification. No finite counterexample
or earlier PostgreSQL experiment was rerun for ratification.

The session continues with [Q26: selected next-step status in coaching](phase28-q26-coaching-next-step-summary-research.md),
a researched but unanswered product question after this decision;
no formal specification, issue publication or implementation transition follows.
