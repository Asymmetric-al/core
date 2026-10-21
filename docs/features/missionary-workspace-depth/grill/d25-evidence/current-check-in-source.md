# D25 — current check-in source and reuse evidence

Research date: **October 17, 2026, Asia/Bangkok**. Research only. The founder has
selected **A: optional organization-provided questions**, as conveyed in the
current task. This note does not ratify the review's proposed safeguards or claim
implementation. Only this evidence file was changed.

The bounded census found an actual **staff Member Care activity** called
“Check-in”, an existing feed composer with draft UI and a disabled create route,
and shared accessible form controls. It did **not** find a native missionary
qualitative check-in/question-template/draft/disclosure service in the searched
runtime paths. FORM-04 is explicitly an inert, unqualified reference. Reuse UI,
authenticated source context and carefully qualified mutation patterns; do not
reuse care records, feed audiences or a blueprint as the response owner.

## 1. Scope, commands and proof limits

Read root and scoped instructions for missionary, admin, API, database, auth,
Supabase and UI. The already-read local Supabase/auth skills apply. Read the
[OpenSpec authority index](/workspace/core/openspec/project.md:6) and the relevant
active Workflow Studio projection. This is not a schema change and did not
require applying/resetting a database.

Fresh searches, from /workspace/core:

```sh
rg -n -i 'check.?in|questionnaire|coaching|form.?template|template.?form' apps/missionary packages/missionary packages/api/src packages/database apps/admin/features apps/admin/app --glob '!**/node_modules/**'
rg -n 'form.?submission|form.?definition|form.?version|form.?response|form.?field|questionnaire|coaching_checkin|coaching.check|check_in' packages/api/src packages/database supabase/migrations apps/missionary apps/admin --glob '!**/node_modules/**'
rg -n 'FORM-04|support-raising\.checkin\.submit|support-raising\.form-retention|coaching_checkin' apps packages supabase/migrations --glob '!**/node_modules/**'
rg --files apps packages | rg '/(forms|form-builder|questionnaire|coaching|check-ins?)/'
rg -n 'member_care_(activities|private_notes)' supabase/migrations --glob '!20261005050728_field_policy_foundation.sql'
rg -n 'draft|template|form' apps/missionary/app apps/missionary/features packages/missionary --glob '*.{ts,tsx}'
rg --files tests | rg '(member-care|tanstack-form|coaching|check.?in|template-store|email-template)'
rg -n 'atomic_update_post_with_audit' supabase/migrations
```

The first two scans were also repeated with rg --stats to bound coverage:
**1,261 files / 74 matches** and **1,428 files / 19 matches**, respectively, in
this checkout at inspection. The exact contract scan and named runtime-directory
scan returned no matches. Broader discovery output was sometimes truncated; the
material hits cited below were reopened with numbered, bounded reads. These
commands do not prove absence under unrelated names, dynamic SQL, excluded
directories, hosted deployments or another branch. The code-only contract result
is narrower than “there are no forms anywhere”.

No real database, effective-role catalog, migration replay, browser, storage,
provider, network mutation or user interview was used. No application tests were
run. Existing tests were read, not passed; the prior Sentry/Vitest precollection
blocker was not rerun. Any proposed proofs below remain unexecuted.

## 2. Accepted intent and inert examples

- [Founder brief](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:229)
  separately calls for activity targets, trends, qualitative check-ins and agreed
  next actions, adapted to organizations, culture and part-time contexts.
  [Roadmap owner constraints](/workspace/core/docs/prds/program-roadmap/owner-constraints.md:118)
  require deliberate, voluntary coaching; missing shared records do not establish
  performance. The [supplied P28 roadmap](/workspace/core/docs/prds/program-roadmap/source-2026-09-22/supplied-roadmap.md:914)
  is intent, not an executable producer.
- [D8 C09](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d8-adversarial-review.md:487)
  keeps coaches read-only. [D8 C11](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d8-adversarial-review.md:506)
  makes narratives audience-declared, forbids laundering private CRM/care history
  through them, and keeps agreed next steps from duplicating task truth.
- [Q25 A's exact scope](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q25-check-in-prompts-research.md:19)
  is a short reusable set of optional written questions, skippable with freeform
  context and a useful no-template path. Its historical awaiting-answer header
  was still present when inspected; the current founder answer selects A.
  [Q25 disclosure boundary](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q25-check-in-prompts-research.md:98)
  does not select standing publication of future written responses or inherited
  history. D24's ongoing numeric scope cannot supply those rights.
- [FORM-04](/workspace/core/docs/prds/workflow-studio/form-blueprints/FORM-04.json:5)
  says reference_blueprint, defaultEnabled false, with proposed submission and
  retention contracts. Its [required next-action example](/workspace/core/docs/prds/workflow-studio/form-blueprints/FORM-04.json:44)
  is not authority to require an answer in D25. Its
  [submissionRules](/workspace/core/docs/prds/workflow-studio/form-blueprints/FORM-04.json:59)
  describe validation, immutable snapshots, CSRF and idempotency; they do not
  implement those checks.
- The [submission binding](/workspace/core/docs/prds/workflow-studio/contracts/source-contract-register.json:3350),
  [retention binding](/workspace/core/docs/prds/workflow-studio/contracts/source-contract-register.json:3358)
  and [field mapping](/workspace/core/docs/prds/workflow-studio/contracts/source-contract-register.json:3366)
  each have qualified false, effectiveSourceContract null and no qualification
  evidence. [Blueprint guidance](/workspace/core/docs/prds/workflow-studio/08-blueprints-and-binding-contracts.md:46)
  explicitly calls capability names proposed labels, describes four inert forms,
  and distinguishes field visibility from authorization.
- [Workflow Studio tasks](/workspace/core/openspec/changes/add-workflow-studio-program-contracts/tasks.md:3)
  explicitly describe specified future work with every box open. Its
  [form requirement](/workspace/core/openspec/changes/add-workflow-studio-program-contracts/specs/workflow-studio/spec.md:141)
  is a source-owner/common-mechanism contract, not proof that a general form
  builder or a P28 response service has shipped. D25 need not depend on that
  later builder or create a competing response owner.

## 3. What the reached runtime code actually does

### 3.1 “Log Check-in” is Member Care, with a different writer and audience

The mounted [PersonnelProfile callback](/workspace/core/apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:739)
calls useLogCareActivity with type Check-in and the stock text **“Quick wellness
check-in logged from profile header.”** The [hook](/workspace/core/packages/database/hooks/member-care.ts:281)
POSTs /api/admin/member-care/activity. The [route](/workspace/core/apps/admin/app/api/admin/member-care/activity/route.ts:11)
authenticates, validates and passes trusted tenant/user IDs to the canonical API.
This is executable source, not just a mock button, though no hosted execution was
tested. It is not a missionary answering questions.

The [role gate](/workspace/core/packages/api/src/admin/member-care/route-helpers.ts:18)
permits staff/admin/super_admin. The [input schema](/workspace/core/packages/api/src/admin/member-care/mutations.ts:19)
contains personnelId, an activity type and required content; there is no question
set/version, answer IDs, draft status, audience selection, expected revision or
idempotency key. [logCareActivity](/workspace/core/packages/api/src/admin/member-care/mutations.ts:280)
checks missionary tenant ownership, records an actor-name snapshot and inserts
the description into member_care_activities with occurred_at = server now.
[Private-note creation](/workspace/core/packages/api/src/admin/member-care/mutations.ts:213)
uses a separate table and author identity; “private” is not a coach grant.

The [detail route](/workspace/core/apps/admin/app/api/admin/member-care/directory/[id]/route.ts:11)
uses the same staff gate. [Activity reads](/workspace/core/packages/api/src/reads/member-care.ts:392)
select descriptions, author IDs and snapshots, tenant-filter, optionally filter
the missionary, and cap at 500. [Private-note reads](/workspace/core/packages/api/src/reads/member-care.ts:476)
filter to the author unless the trusted actor is a super-admin; the
[detail response](/workspace/core/packages/api/src/reads/member-care.ts:635)
combines these with personnel, care goals and requirements. This bundle is not a
coach-safe response projection. A person who maintains D25 prompts must not
thereby gain this care audience or any check-in response audience.

The [foundation migration](/workspace/core/supabase/migrations/20260414180338_member_care_foundation.sql:67)
defines care activities with tenant/missionary/author/content/time fields, no D25
template or accepted-answer model, tenant/missionary delete cascades and author
delete restriction. The [private-note table](/workspace/core/supabase/migrations/20260414180338_member_care_foundation.sql:126)
has similar lifecycle coupling. [Its grant/policy text](/workspace/core/supabase/migrations/20260414180338_member_care_foundation.sql:157)
enables RLS, revokes anon, grants authenticated CRUD and service-role access,
allows staff/super-admin activity reads, and binds ordinary activity inserts to
the caller's author ID. [Private-note policy text](/workspace/core/supabase/migrations/20260414180338_member_care_foundation.sql:335)
has author/super-admin rules. These are existing care contracts, not prospective
coach grants. The bounded table-name migration scan found this foundation plus
field-policy metadata; generic later grants, helper redefinitions and deployed
catalog state were not fully replayed. **No effective-permission or vulnerability
claim follows from this limited inspection.**

The API uses [getAdminClient](/workspace/core/packages/database/supabase/admin.ts:22),
which constructs a service-role client. Thus copying only a care RLS predicate
does not supply missing authorization on a new privileged check-in endpoint.
Trustworthy current tenant/actor resolution is reusable; this route's broad staff
gate and source schema are not the D25 capability contract.

### 3.2 Feed drafts are a partial writing pattern, not a check-in implementation

The missionary [posts route](/workspace/core/apps/missionary/app/api/posts/route.ts:1)
re-exports the API. [GET](/workspace/core/packages/api/src/posts/index.ts:85)
authenticates before the cached read; nonpublished reads require a permitted role
and replace client-supplied author identity with the current profile. This is a
useful example of server-enforced author-private draft reads. The
[cached query](/workspace/core/packages/api/src/posts/index.ts:35)
keys by tenant, status, pagination and effective author; it is not a check-in
disclosure registry.

**New-post creation is explicitly disabled**:
[POST returns 403 Read-only demo](/workspace/core/packages/api/src/posts/index.ts:143).
The [composer enablement](/workspace/core/apps/missionary/app/feed/worker-feed-page-client.tsx:928)
only tests saving/uploading/content, not that create-route capability. A visible
Save Draft action therefore does not establish a working new-draft write path.

The [feed save handler](/workspace/core/apps/missionary/app/feed/use-worker-feed-page-view.ts:311)
POSTs or PATCHes full content/type/visibility/status/media, updates local lists
and “Draft saved” only after a successful response, and clears composer content
after success. Its [30-second draft timer](/workspace/core/apps/missionary/app/feed/use-worker-feed-page-view.ts:383)
calls that same clearing handler. Existing drafts can be edited and there is a
mounted [PATCH re-export](/workspace/core/apps/missionary/app/api/posts/[postId]/route.ts:1);
do not describe the whole feed as nonfunctional. Nevertheless this timer/reset
behavior is unsafe to adopt as a calm, continuously editable check-in autosave.
The [Save Draft UI](/workspace/core/apps/missionary/app/feed/worker-feed-page-client.tsx:851)
has pending protection, but its visible label and
[saved time](/workspace/core/apps/missionary/app/feed/worker-feed-page-client.tsx:772)
are hidden on small viewports. New check-in save/disclosure state should remain
understandable on phones.

[Post editing](/workspace/core/packages/api/src/posts/post.ts:50)
checks authenticated missionary/tenant/author before invoking an atomic update and
audit RPC. [That SQL function](/workspace/core/supabase/migrations/20260223170000_atomic_rpc_and_donation_saga.sql:465)
updates by ID and tenant with no expected revision, then inserts p_updates into
audit details. Transactional update-plus-audit is useful evidence of an existing
pattern, not a ready-made check-in command: it lacks D25 current audience and
revision semantics and would copy answer content into generic audit details.
Any check-in evidence must follow its own retention and allowed diagnostic/audit
projection; do not copy private response bodies merely because this helper does.

The feed's [public/partners/private picker](/workspace/core/apps/missionary/app/feed/worker-feed-page-client.tsx:815)
is the wrong audience model for an exact coach disclosure. D25 must not be a post
type added to that picker or a donor-following permission expansion.

### 3.3 Versioned email templates do not solve question/answer versioning

[Email template creation](/workspace/core/packages/api/src/email/template-store.ts:412)
inserts a template, then a version, then synchronizes contribution-correction
bindings. [Update](/workspace/core/packages/api/src/email/template-store.ts:438)
first reads the current version, then updates by tenant/ID to current.version + 1,
then inserts a version separately. No expected-version predicate is present in
that update. [Delete](/workspace/core/packages/api/src/email/template-store.ts:472)
soft-deactivates and changes source-specific bindings. These functions are email
domain operations with side effects, not generic question-template CRUD.

The useful concept is stable, versioned content and retirement without rewriting
prior meaning. D25 still needs an owner-approved atomic version/current-head
contract and pinned question identity/text for drafts and shared responses. A
template edit or removal must not relabel an older answer, blank a live draft or
delete retained check-ins. This is a prospective reuse hazard, not a claim that
present check-ins lose data.

### 3.4 Auth and cache components are useful but do not supply D25 grants

[getAuthContext](/workspace/core/packages/auth/context.ts:249)
validates the user and resolves that caller's profile under their own RLS, then
[loads active tenant memberships](/workspace/core/packages/auth/context.ts:305)
through the caller-bound RPC, failing closed on its error. The
[missionary operation wrapper](/workspace/core/packages/api/src/missionary-portal/route-helpers.ts:14)
enforces a missionary role before supplying privileged database access. These
are appropriate seams to extend through existing P12/source permission contracts,
not permission to trust browser-supplied tenant, author, subject or recipient IDs.
No freshly discovered D25 template-maintainer, author/share or coach-read
capability/endpoint was qualified by this census.

[Member Care query keys](/workspace/core/packages/database/query-keys.ts:28)
are global dashboard/detail prefixes; the [detail hook](/workspace/core/packages/database/hooks/member-care.ts:183)
adds only personnelId. [Mutations invalidate](/workspace/core/packages/database/hooks/member-care.ts:111)
the matching dashboard/detail keys and the API
[revalidates server tags](/workspace/core/packages/api/src/shared/cache-tags.ts:134).
Server [dashboard caching](/workspace/core/packages/api/src/reads/member-care.ts:601)
is tenant-keyed, whereas the actor-sensitive detail function is not itself marked
use cache. Do not incorrectly describe all private detail reads as a globally
cached server result.

[Client auth cleanup](/workspace/core/packages/auth/client-session.ts:64)
already clears query state on sign-out/user change and
[rejects stale async auth loads](/workspace/core/packages/auth/client-session.ts:139).
That does not qualify same-user tenant/hat/grant changes for D25. The
[query defaults](/workspace/core/packages/database/providers/query-client.ts:81)
use 60-second staleness, five-minute collection, no window-focus refetch and no
automatic mutation retry. Those timers are not revocation fences. D25 needs
current authorization at every draft/template/share/read operation and scoped
client state that rejects stale results after context or audience changes.

### 3.5 Reusable controls and inspected tests

[Shared UI configuration](/workspace/core/packages/ui/components.json:3)
is exact base-maia, Zinc semantic variables. The
[manifest](/workspace/core/packages/ui/package.json:68)
declares Base UI 1.9.0, TanStack React Form 1.33.5 and existing React Query; these
are manifest facts, not a new installed-version or build qualification.
No dependency or general form-builder proposal is needed for this small flow.

[useAsymFieldMeta](/workspace/core/packages/ui/components/primitives/tanstack-form.tsx:142)
provides stable control/description/error links;
[TextareaField](/workspace/core/packages/ui/components/primitives/tanstack-form.tsx:415)
binds labels, aria-invalid, aria-errormessage, controlled values and change/blur;
[SubmitButton](/workspace/core/packages/ui/components/primitives/tanstack-form.tsx:640)
supplies pending/disabled state. These are reusable controls, not autosave,
revision conflict handling or authorization. The
[native textarea primitive](/workspace/core/packages/ui/components/shadcn/textarea.tsx:5)
already supports ordinary multiline writing without an editor download.

The [form accessibility tests](/workspace/core/tests/unit/packages/ui/tanstack-form-accessibility.test.tsx:90)
assert pending duplicate-submit suppression, labels, descriptions and validation
relationships. [Care route-helper tests](/workspace/core/tests/unit/packages/api/admin/member-care/route-helpers.test.ts:36)
mock authentication and check 401/403/context/schema failures.
[Care mutation tests](/workspace/core/tests/unit/packages/api/admin/member-care/mutations.test.ts:129)
mock database calls and check type mapping/cache-tag invalidation. These are
useful seams, not database-role, concurrency or D25 disclosure proofs. No D25
positive or negative test was discovered in the bounded test-name census.

## 4. Material prospective concerns and exact candidate requirements

Every row is conditional on building/reusing a D25 path. Severity describes the
consequence of that mistake; likelihood is a reuse risk, not a measured deployed
incident. The eight dimensions cover source/architecture, authority/security,
privacy, integrity, UX/accessibility, performance/cache, lifecycle/compatibility,
and reliability/verification. They are not eight newly proved vulnerabilities.

| ID / dimension                                  | Concrete evidence and condition                                                                                                                               | Impact / severity / likelihood                                                                                                                         | Candidate requirement and proof                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1 — Source ownership / architecture            | Sections 2 and 3.1: inert FORM-04 or a care activity is treated as the check-in owner.                                                                        | Wrong meaning, writer and compulsory care cadence; high if adopted; plausible naming collision.                                                        | **R1:** P28 owns native qualitative check-in meaning; bind shared form mechanisms through their owner without a second response ledger. Never turn FORM-04's required next action into required D25 answers or an automatic task. **P1/P2.**                                                                                                                                                                                |
| S2 — Authority / security                       | Section 3.1's staff-role gate/service-role client is reused for question editing and response access.                                                         | Cross-purpose or cross-subject disclosure/write; high if adopted; plausible shortcut.                                                                  | **R2:** Resolve current actor/tenant/subject on the server; separately authorize question maintenance, own draft/write/share and exact response reads. A maintainer gains no response audience. Reject extra/mixed-purpose fields and unsupported source IDs; current role alone is insufficient. **P3/P4.**                                                                                                                |
| S3 — Privacy / disclosure                       | Section 3.2's feed picker, audit-body copy or D24 numeric share is used for new narratives.                                                                   | Broader narrative access and retained copies; high if adopted; plausible adjacent-feature reuse.                                                       | **R3:** Save draft has no disclosure effect. Sharing/releasing a response uses separately qualified exact audience and content revision; no standing future-text permission from numeric sharing. No care/CRM text import, hidden answer fields, generic feed audience or body-bearing ordinary diagnostics. **P5/P6.**                                                                                                     |
| S4 — Data integrity / concurrency               | Sections 3.2–3.3: updates by ID/tenant without expected revision; template/version writes are separate.                                                       | Lost text or an old answer displayed under a new question; high under concurrent editing; expected in multi-tab/editing use.                           | **R4:** Preserve stable question IDs and the question version/text actually answered. Draft save, template publication and disclosure each use owner-qualified expected revision and durable operation identity where retries can repeat effects; atomic source/audit acceptance cannot be inferred from UI success. Conflicts retain the user's text and require an explicit resolution, never blind overwrite. **P7/P8.** |
| S5 — UX / accessibility                         | Sections 3.2 and 3.5: disabled create route behind a visible action, autosave resets editor, mobile save labels hidden.                                       | Lost orientation, repeated entry, false confidence or compulsory-feeling reporting; medium, likely if copied wholesale.                                | **R5:** Small optional text form using shared controls, truthful capability/empty/error/pending states, visible mobile save/audience status, preservation through errors and accessible correction. No score, missed-check-in badge, forced cadence or mandatory next-action field. **P1/P9/P10.**                                                                                                                          |
| S6 — Performance / cache                        | Section 3.4: global client key prefixes and time-based caching do not encode a new response grant. Section 3.1 capped broad care bundle.                      | Stale narrative retained in a switched context; excess private payload and misleading history completeness; high for disclosure, conditional on reuse. | **R6:** Fetch bounded purpose-specific template/draft/response projections, not a care/personnel bundle. Scope caches and late-response guards by current tenant/actor/hat/subject and applicable source/authorization revision; revocation fences precede data release. History pagination/coverage must be explicit. **P4/P11.**                                                                                          |
| S7 — Lifecycle / compatibility                  | Sections 3.1 and 3.3: care delete cascades and email soft-deactivation/binding effects have unrelated meaning.                                                | Wrong retention or destruction/relabeling of prior answers; high if migrated directly; foreseeable integration hazard.                                 | **R7:** Keep pre-existing care/feed records in their own source and audience. Retiring/reordering/editing questions changes prospective availability, not old answer meaning or retained response access. Adopt exact response/draft retention and lawful deletion through the owner; no guessed universal time-to-live. **P8/P12.**                                                                                        |
| S8 — Reliability / observability / verification | Section 3.1 fresh inserts have no command identity; section 3.2 returns a final result after separate reads and may fail after commit; cited tests use mocks. | Duplicate responses or unsure save/share falsely reported as failure/success; medium to high depending effect; plausible on mobile networks.           | **R8:** Return durable source receipt and canonical revision; distinguish failed, pending/unknown and confirmed saved/shared. An uncertain write retries the same qualified operation, not a new submission. Safe audit/telemetry references support recovery without answer bodies. Prove actual command, RLS/grants, race and browser behavior before claiming the feature works. **P7/P10/P12.**                         |

## 5. Small complete journey to qualify

This is a **candidate UX**, not a new founder decision about exact fields,
template count, disclosure history or standing narrative sharing.

1. **Authorized organization maintenance:** a small “Check-in questions” section
   shows current optional questions with Add question, Edit, Move up/down and
   Remove, followed by a readable preview and Save changes. Keyboard controls
   cannot depend on drag-and-drop. Copy: “Questions are optional. People can skip
   them or write their own context.” Do not add responses, compliance totals or
   an implied response-reader role to this screen.
2. **Maya starts or resumes:** “Check-in” / “Write what would help your next
   conversation.” Show the organization's short questions with “Optional”, plus
   “Anything else you'd like to add? (optional)”. No configured questions is a
   valid freeform form. Failed question retrieval is a recoverable error, not
   falsely “Your organization has no questions”; keep already-entered text and
   any intact freeform capability available when independently authorized.
3. **Draft:** explicit “Save draft” is sufficient as the minimal qualified
   interaction. Show “Draft saved” only on the durable receipt and “Changes not
   saved” after further edits. No invented autosave promise. Preserve the editor
   through Save/error/conflict and warn before discarding dirty text. A template
   change elsewhere must not mutate this draft's question labels or answers.
4. **Review deliberate sharing:** separate “Review sharing” from Save. Show the
   actual content and separately qualified named audience, plus “Saving a draft
   does not share it.” Use “Share with Jordan” only when that exact one-recipient
   disclosure is currently authorized and chosen. Do not derive a recipient or
   historical entitlement from organization template ownership or numeric scope.
   Whether future narratives can be shared on a standing basis remains outside
   A's selection; this sketch proposes no automatic publication.
5. **Read and recover:** receipt-linked “Shared with …” identifies the accepted
   revision; Jordan gets a read-only source projection. A concurrent edit or
   revoked share cannot be smoothed over by a success toast. Unsupported,
   not-shared, unavailable and empty states differ without exposing another
   response's existence. Template retirement retains old question meaning.
   Corrections/removal of a disclosed response must follow the later qualified
   content/audience/history rules, not silently alter an old accepted snapshot.

Keep this in the existing native coaching workspace. No new app, survey builder,
inbox, notification program, signatures, computed answers, AI assistance,
attachment subsystem or care-assessment model follows from optional questions.
Use a normal readable page for the short form, with visible labels, status text,
line breaks and keyboard access; avoid making a multi-step wizard mandatory.
Do not silently persist private drafts into browser local storage to claim
offline recovery. Low-bandwidth recovery needs a qualified secure draft source
and honest pending/offline state, not an unbounded offline disclosure queue.

## 6. Meaningful qualification outcomes — proposed, not run

- **P1:** All offered questions can be skipped; freeform works with no template.
  No “missed”, zero-performance inference, required next-action error or automatic
  source task results from absence. Existing required operational work is unaffected.
- **P2:** An existing care Check-in activity, a feed draft and FORM-04 fixture
  cannot be presented, counted or migrated as a native missionary response merely
  because names match. No care cadence is inherited.
- **P3:** A permitted template maintainer can edit questions but cannot enumerate
  responses, response counts, authors, draft existence or answer text. An author
  cannot edit the organization's questions or another missionary's draft.
- **P4:** Wrong tenant/hat/subject, stale permission, fabricated recipient, removed
  membership and a late response after context switch fail without data release.
  Real role/table/RPC grants and privileged API checks are both tested.
- **P5:** Save and reload a draft while coach/numeric sharing is active: the coach
  receives no text or existence metadata; later writing does not auto-publish.
- **P6:** Sharing review and committed response use the same selected revision
  and currently qualified audience. A changed revision or withdrawn audience
  requires refreshed review. Hidden answers and private imported care/CRM text
  have no alternate release path; ordinary logs/audit/analytics contain no bodies.
- **P7:** Simultaneous draft saves/template saves and timeout-after-commit retries
  cannot overwrite unseen changes, duplicate acceptance or report a false final
  state. Verify actual source transactions, not only disabled buttons/mocks.
- **P8:** Edit, reorder and retire a question while an old draft and shared answer
  exist: labels/answer associations and accepted meaning remain pinned. Opening
  a new check-in may use the new version without rewriting old work.
- **P9:** Keyboard and screen-reader users can maintain order, identify every
  optional answer, review audience and reach correction errors. On a phone with
  long localized text/zoom, save state and recipient text remain visible and
  controls remain reachable without relying on hover, drag or icons alone.
- **P10:** Question loading failure, save denial, lost network and uncertain
  acceptance preserve typed text and show honest recovery. No simulated success,
  forced blank reset, automatic later disclosure or uncontrolled fresh retry.
- **P11:** Large question/history populations use bounded source projections and
  explicit pagination/coverage; reading a check-in never downloads the care
  dashboard/private-note bundle. Expired/revoked cache entries and in-flight
  results do not remain a readable alternate path.
- **P12:** Retire template, end coach access, remove membership and exercise
  owner-approved retention/deletion: each operation has its distinct effect.
  Recovery receipts and audit references do not duplicate bodies or bypass a
  current response read check. Provenance/authorization tests use the actual
  source endpoint and schema before activation.

## 7. Verification performed and unresolved limits

Performed: fresh bounded static searches; reached route/hook/mutation/read/SQL
and fixture inspection; existing-test source reads; formatting and local link
existence/line-bound checks on this note. Structural checks establish that the
evidence is navigable, not that proposed behavior runs.

Unqualified: D25 owner command/schema/capability binding; effective grants and
RLS under real roles; atomic save/share/template revision behavior; retention
and existing-record migration inventory; browser/mobile/accessibility behavior;
cache revocation and late-response races; throughput/load; source receipt-based
recovery. No current API or deployed check-in defect was invented to fill those
gaps. Same-day [D24 coaching source evidence](/workspace/core/docs/features/missionary-workspace-depth/grill/d24-evidence/current-coaching-source.md)
remains useful adjacent context but is not substituted for the fresh D25 census.
