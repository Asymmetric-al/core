# D7 — complete native newsletters with missionary control

**Disposition: Accept with required amendments.** Retain a deliberate missionary
decision for every newsletter. Deliver the complete native newsletter workflow
against an explicit Epistle comparison, with excellent integrated UX. Record
automatic future digest sending as an intentional difference required by A;
do not implement B silently or claim literal feature-for-feature equivalence.

Reviewed October 16, 2026 UTC against repository baseline
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. This is a completed decision review and
research record, not a formal specification, implementation, or release claim.
The founder selected A and added full understandable control, exceptional UX and
Epistle parity. On October 16, 2026 UTC, the founder subsequently instructed:
“Ratify this decision and amendment.” The corrected D7 decision and its required
amendments, including C01–C22 and P01–P32 acceptance obligations, are explicitly
ratified. `/to-prd` and `/to-issues` remain separate transitions. This ratification
does not ratify D6 or establish implementation or runtime qualification.

## Exact corrected decision to record

> **D7 — Complete native newsletters, deliberately authorized one issue at a time.**
> A currently authorized missionary prepares a newsletter, understands its
> content, sender, permitted recipients and timing, and deliberately authorizes
> that issue to send now or at one chosen future time. Saving a draft, publishing
> a Ministry Update, receiving signup, choosing a template, approving content or
> generating a suggestion does not itself authorize a newsletter send.
>
> Make the complete job work inside Asym: recoverable drafts and version history;
> useful branded presentation; eligible story, image and video reuse; appropriate
> personalization; accurate desktop/mobile previews and qualified test sends;
> clear recipient selection and exclusions; deliberate Send and one-off Schedule;
> useful cancellation and repair; recipient preferences and unsubscribe; qualified
> replies and existing permitted responses; print preparation; and honest results.
> These are connected workflows, not a collection of placeholder buttons.
>
> Meet or exceed the documented Epistle newsletter jobs through Asym's native
> owners and acceptance evidence. Maintain a dated capability ledger showing
> what is documented, required, implemented and proved. The deliberate decision
> for each issue is an explicit product difference from Epistle's standing
> automatic digest delivery. No recurring authority to compose and send future
> issues follows from the parity requirement. Preparation assistance can produce
> a draft; it cannot authorize sending it. Do not import Epistle's whole MPD/CRM
> product, speculative vendor features, or additional dependencies as shorthand
> for newsletter parity.
>
> Missionary control operates within the organization's current permissions,
> content/safety rules and each recipient's choices. Show the actions the person
> can actually take and explain consequential restrictions plainly. Preserve
> distinct meanings for draft saving, content publication, newsletter sending,
> public signup visibility, subscription, protected reading and physical mail.
> No new staff role, broad CMS grant, subscriber CRM access or approval hierarchy
> is implied.
>
> Authorization binds the exact issue content, sender, reply purpose, recipient
> ceiling and timing. Later recipients do not join it automatically. Current
> withdrawals and restrictions can narrow unstarted work. Edits cannot silently
> replace authorized content. Cancellation stops work that is still stoppable;
> accepted or uncertain external work is not recalled, rekeyed or called unsent.
> Retries recover the same business effect and preserve truthful partial results.
>
> P28 owns the native newsletter job and its qualified issue/recipient source;
> P17 owns approved preparation, rendering and sender/reply contracts; P6 owns
> recipient-specific intent, current eligibility verdicts, dispatch and outcomes;
> P22/P23 retain Ministry Update, public Page and media release authority; P12
> retains access authority. Complete the explicit native preparation, video and
> reply amendments needed for this workflow. Reuse the existing communication
> spine, design system and source boundaries instead of creating a parallel
> newsletter system. Required native work must not depend on optional external
> sync, AI, SMS or a new inbox.

**What is selected:** A; understandable missionary control; exceptional UI/UX;
a fully functional, integrated newsletter capability benchmarked against Epistle.
**What this review resolves:** the specific A choice governs automatic sending;
parity is a complete, evidence-based newsletter benchmark with that declared
difference. The workflow above is the recommended concrete scope interpretation.
**What is not proved:** implemented parity, production safety, user satisfaction,
performance, authenticated Epistle behavior or qualification of missing owners.
“At or beyond” is an acceptance obligation, not a current product claim.

## Evidence and present behavior

| Evidence                                                                                                               | Verified finding and limits                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Epistle parity ledger](d7-evidence/epistle-parity.md)                                                                 | Current primary vendor descriptions and comparable products; documented capabilities separated from marketing, inaccessible demonstrations and unknown mechanics. No real Epistle account or user study. |
| [Product/owner synthesis](d7-evidence/product-owner-synthesis.md)                                                      | Complete newsletter job, specific A versus broad parity, exact owner gaps and strongest alternatives. Governing intent is not implementation.                                                            |
| [Content/delivery owners](d7-evidence/content-delivery-owners.md)                                                      | Native preparation/catalog, reply purpose, scheduled source intent, current fences, tests, provider recovery and suppression topology need exact qualification.                                          |
| [Current runtime](d7-evidence/current-runtime.md)                                                                      | Missionary Email Studio is Coming Soon. Real admin template/test sending and some post editing exist, with concrete reuse hazards. No deployed exploit is claimed.                                       |
| [UX journeys](d7-evidence/ux-journeys.md)                                                                              | Current primary newsletter, form and accessibility evidence plus coherent missionary/reader journeys. Proposed design; no browser/user-test conformance claim.                                           |
| [Technical research](d7-evidence/technical-research.md)                                                                | Twelve fresh primary fetches covering Supabase, PostgreSQL and provider semantics; actual grants/roles/hosted state remain unproved.                                                                     |
| [Database lifecycle](d7-evidence/database-lifecycle.md) and [probe](d7-evidence/postgres-probe/README.md)              | PostgreSQL 17.11: 41/41 bounded synthetic outcomes, six observed two-session lock waits, cleanup verified. No Core, Supabase, provider or human-intent qualification.                                    |
| [Q7 research](phase28-q7-newsletter-sending-research.md) and [historical context](phase28-legacy-dashboard-context.md) | Preserve the original choice and the old document's limited authority. The new parity rider is current user direction; the old stack remains historical.                                                 |

Important current facts: the missionary Email Studio placeholder is not an editor
or sender; a post type named Newsletter is not a newsletter issue. Existing
admin test sends have no native per-issue authorization source. Template/version
writes are separate calls without expected-revision protection. Some draft media
flows are simulated, and dormant browser campaign hooks use unscoped localStorage.
Current P22 accepts still images and excludes video; this is a real owner gap
against documented Epistle video updates. P17's current reply-purpose and
system-template contracts do not establish the required native newsletter seam.

Two provider facts require explicit documentation repair: current Resend docs
support batch scheduling despite older P17 wording; Core-owned scheduling still
remains the sound governing policy. Current team-wide rate/suppression behavior
must be reconciled with the actual tenant connection topology rather than older
per-connection/region assumptions. A provider's 24-hour idempotency window does
not supply permanent business deduplication.

Evidence classes are explicit: **repository fact** establishes intended rules;
**source fact** establishes inspected code; **primary external documentation**
establishes published behavior; **inference/product judgment** supports the
recommended design. No real missionary or supporter was contacted. The existing
offline unit suites could not reach collection because Bun tooling is absent
and the installed Sentry package cannot satisfy the Vitest configuration;
**zero Core unit tests ran**. No dependency or configuration was changed to
conceal that limitation.

## Parity and the simplest complete product

The strongest competing model is optional automatic digests: less repeated work
and reader-selected frequency. It is valid, but the founder chose control over
each issue. Automatically preparing a draft can reduce effort without changing
that choice. Keeping external newsletter tools, a copy/export workaround, or
only a text box and Send button would leave the new native parity requirement
unfinished. The permanent path is one complete native workflow using the
existing owners, with explicit amendments at the missing seams.

| Capability/job                                                                             | D7 disposition                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Write, save, recover, restore and reuse branded content                                    | Required complete native journey. Restore creates current draft work, never rewrites sent history.                                                                                                  |
| Reuse selected eligible Ministry Updates and media                                         | Required proposed preparation aid with source provenance and independent newsletter audience qualification. No live synchronization into authorized issues.                                         |
| Pictures, captions and useful video updates                                                | Include. P22/P23/P17 need a bounded video amendment and safe email representation/player behavior. A document listing video is not proof of hosting, transcoding or embedded playback requirements. |
| Subject, safe personalization, sender/reply-to, mobile preview, actual test                | Include through qualified native preparation; tests do not become production sends or private-data exfiltration.                                                                                    |
| Select recipients, understand exclusions, preferences and unsubscribe                      | Include through native purpose owners. No “all donors” consent inference, second address book or new frequency control that cannot be honored.                                                      |
| Each issue sent now or at one chosen time; cancellation and repair                         | Include. One-off scheduled execution is the already authorized issue, not an automatic future newsletter.                                                                                           |
| Reply and supported likes/prayers/comments                                                 | Include qualified reply routing and current P22 responses where the reader actually has authority. A newsletter subscription alone grants no protected reader/response right.                       |
| Print/export useful newsletter and mailing work                                            | Include as required by the current brief and documented comparison, with separate print/recipient authority. No promise that download means printed, mailed or delivered.                           |
| Delivery history and useful feedback                                                       | Include honest recipient outcomes and permitted diagnostics. Opens/clicks do not prove reading, relationship strength or missionary performance.                                                    |
| Automatic assembly and dispatch of future issues at reader-selected cadence                | Explicit intentional difference under A. Do not expose a fake cadence selector or claim literal Epistle equivalence.                                                                                |
| Audio, arbitrary attachments, vendor-specific integrations, native app, full MPD/CRM suite | Not imported merely by the word parity. Unknown newsletter features require evidence; independently selected Core work keeps its existing scope.                                                    |

The ledger is fixed to dated evidence, not a moving promise to implement every
future competitor release. Any newly verified material newsletter capability
is reconciled explicitly against the required job and owner; it cannot silently
vanish or become a new dependency. Responsive web, safe recipient controls and
clear send/cancel outcomes are required regardless of a competitor's weakness.

## Concern register

Severity describes possible harm; likelihood is conditional engineering judgment,
not an incident rate. Every concern gives its effect on the answer and exact
prevention clauses/proofs below. Concerns are consolidated to avoid counting
one defect repeatedly as independent problems.

### D7-R01 — parity silently reverses the selected sending model

- **What/why:** Literal parity imports automatic digests, unclear recurring
  authority or the competitor's entire product; a small editor can also be
  falsely advertised as complete parity.
- **Severity:** High. **Likelihood:** High without a fixed capability ledger.
- **Evidence:** Q7 A; Epistle's documented automatic cadence; current parity
  rider; P28 brief explicitly separates reuse, digests and cadence.
- **Answer impact:** Changes the wording, preserves A and makes the parity
  obligation precise. It does not authorize standing automatic sends.
- **Permanent fix and exact change:** C01/C22; P01/P30. Require the dated
  newsletter-job ledger, explicit automatic-digest difference and real proof.

### D7-R02 — existing templates or test sends become a shadow newsletter service

- **What/why:** Reusing an admin route or system-message catalog bypasses native
  source authority, consent, preparation and durable delivery evidence.
- **Severity:** Critical. **Likelihood:** High if current scaffolding is promoted.
- **Evidence:** Coming Soon missionary page; real admin test route; P17 personal
  newsletter exclusion and missing native purpose; P6 exact prepared-source seam.
- **Answer impact:** Requires coordinated owner extensions; does not reduce scope.
- **Permanent fix and exact change:** C02/C08/C09/C13; P02/P09/P29. One qualified
  native source and P17/P6 path, with old/direct paths fenced.

### D7-R03 — “full control” becomes broad permission or a misleading interface

- **What/why:** A role label grants Send, another tenant/hat supplies privileges,
  or UI exposes actions that the actual source denies; staff approval can be
  mistaken for missionary send authorization.
- **Severity:** Critical for access; High for UX. **Likelihood:** Medium–High.
- **Evidence:** P12 source capabilities and one active context; current coarse
  admin/missionary checks; D5 truthful effective-permission requirements.
- **Answer impact:** Narrows control to current legitimate authority while keeping
  its consequences understandable; no new blanket grant or routine approval flow.
- **Permanent fix and exact change:** C03/C09/C16; P03/P04/P20. Derive actions and
  trusted actor/scope from the same current source boundary; preserve exact Send.

### D7-R04 — edits, restores or reused stories change an authorized issue

- **What/why:** A newer template/post/media revision is sent under an old review,
  a concurrent save loses work, or draft recovery rewrites what was sent.
- **Severity:** High, potentially Critical for protected content.
- **Likelihood:** High under concurrent editing and delayed sending.
- **Evidence:** Separate template/version writes; no expected-version predicate;
  P22 immutable releases and P17 prepared meanings; current draft/media hazards.
- **Answer impact:** Requires versioned draft/reuse and immutable authorized meaning.
- **Permanent fix and exact change:** C04/C06/C09/C11; P05/P06/P11/P17.
  Preserve source provenance, detect conflicts and require new authorization
  for changed content or widened audience; never resolve by last-writer-wins.

### D7-R05 — a nominal recipient list is neither consent nor a stable audience

- **What/why:** Gifts, tags, shared CRM facts or similar email addresses become
  subscription; a live filter adds new recipients after authorization or mixes
  personalized details for a shared mailbox.
- **Severity:** Critical. **Likelihood:** High if generic donor filters are reused.
- **Evidence:** D6 bounded membership; P3/P6 eligibility; P25 fixed meaning;
  current negative-only consent gate and raw recipient arrays.
- **Answer impact:** Requires exact positive eligibility and a frozen ceiling.
- **Permanent fix and exact change:** C07/C09/C12; P07/P08/P12/P16. Select through
  source authority, dedupe deliveries under an explicit safe destination rule
  without merging identities, and apply current adverse narrowing at dispatch.

### D7-R06 — duplicate clicks or a lost response create duplicate newsletters

- **What/why:** Transport request IDs, random provider keys or post-send logging
  let two requests create two effects; a timeout prompts the missionary to Send
  again with no indication that the original may already have started.
- **Severity:** High. **Likelihood:** High on mobile networks and ordinary retries.
- **Evidence:** Real admin test-send random key/provider-before-audit; P6 recovery;
  provider 24-hour key window; synthetic D7 duplicate/atomicity outcomes.
- **Answer impact:** Requires durable business-effect identity, not extra user steps.
- **Permanent fix and exact change:** C09/C10/C13/C16; P10/P13/P14/P20. Commit
  authorization/evidence/durable intent atomically; reconcile the original effect.

### D7-R07 — Schedule, edit and cancel promise powers the system does not have

- **What/why:** DST shifts timing, stale edits resurrect cancelled work, overdue
  issues send long after relevance, or a cancel button claims to recall mail.
- **Severity:** High. **Likelihood:** Medium–High for queued/partial delivery.
- **Evidence:** P6/P17 deadline and submission fences; current provider scheduling
  capabilities are not source authority; six synthetic ordering waits.
- **Answer impact:** Adds precise one-off scheduling and truthful recovery.
- **Permanent fix and exact change:** C11/C12/C13; P15–P19. Store a resolved
  instant with disclosed zone, require bounded issue validity, stop definitely
  unsubmitted effects and preserve accepted/uncertain facts. No catch-up surprise.

### D7-R08 — media parity leaks drafts or is silently omitted

- **What/why:** Public asset URLs expose private drafts; a poster, caption or
  player reveals protected information; a feature called video does not work
  in email; P22's image-only rule is ignored or used to drop parity.
- **Severity:** Critical for disclosure. **Likelihood:** Medium–High if reused as-is.
- **Evidence:** P22 D9 exclusions, documented Epistle video, current public assets
  and simulated upload; Supabase object access is separate from tenant paths.
- **Answer impact:** Requires an explicit bounded media extension, not a new vendor.
- **Permanent fix and exact change:** C05/C06/C15; P06/P21/P22. Qualify actual
  upload/embed/player/rendition behavior and all derivatives; preserve private
  intake, publication and email disclosure boundaries.

### D7-R09 — database, service or secondary surfaces bypass tenant/source scope

- **What/why:** A cross-tenant relationship, mutable approval field, broad function
  grant, view, worker or object path bypasses the ordinary authorized command.
- **Severity:** Critical. **Likelihood:** Medium, conditional on actual grants/path.
- **Evidence:** P12; current privileged API/RPC patterns; primary Supabase grants,
  RLS, Storage and PostgREST-only pre-request limitations; synthetic role tests.
- **Answer impact:** Requires comprehensive enforcement without a second ACL system.
- **Permanent fix and exact change:** C03/C14/C21; P03/P04/P23/P29. Non-null
  tenant-aware keys, old/new-row checks, restricted field grants, trusted context
  and exact alternate-path tests; service-role access is not authorization.

### D7-R10 — replies, web views and engagement acquire unintended authority

- **What/why:** Reply-To exposes a private mailbox or routes to the wrong team;
  a newsletter link grants protected reading; responses enter Support/CRM/care
  history or a new inbox without authority.
- **Severity:** Critical for sensitive ministry. **Likelihood:** Medium.
- **Evidence:** P17 reply-purpose gap; current inbound Support routing; P22
  exact reading/response audiences; P27 voluntary source-history boundary.
- **Answer impact:** Requires real qualified replies and response paths, not their removal.
- **Permanent fix and exact change:** C15/C19; P22/P24/P25. Approved reply purpose
  and confirmed destination; independent reading/response checks and no automatic
  identity merge, public archive, new inbox or personal-exchange record.

### D7-R11 — attractive UI hides uncertain outcomes or loses the missionary's work

- **What/why:** Autosave clears the draft, test success is confused with Send,
  disabled actions have no explanation, a late response restores revoked data,
  or mobile/keyboard users cannot finish the journey.
- **Severity:** High. **Likelihood:** High if current demo/feed flows are copied.
- **Evidence:** Runtime autosave/media and test-send copy; primary UX/accessibility
  research; Core Base UI/base-maia requirements. No actual user testing yet.
- **Answer impact:** Converts “exceptional UX” into testable behaviors, not more settings.
- **Permanent fix and exact change:** C04/C08/C16; P05/P09/P20/P26. One coherent
  issue journey, truthful saved/current states, safe recovery and accessible controls.

### D7-R12 — newsletters create duplicate noise, false follow-up or unsafe print

- **What/why:** Content overlap silently suppresses existing notices or produces
  unexplained repeated mail; send/open becomes a personal conversation; labels
  leak addresses or a download is marked mailed.
- **Severity:** High. **Likelihood:** Medium–High without purpose distinctions.
- **Evidence:** P25 independent preferences; P6 effect identity; P27 D26; existing
  required native print work and external-copy limits.
- **Answer impact:** Requires explicit integration semantics, not a new workflow engine.
- **Permanent fix and exact change:** C17/C18/C19; P25/P27/P28. Preserve independent
  purposes, disclose overlap, prohibit fabricated history, and separate print effects.

### D7-R13 — provider topology and outdated assumptions defeat isolation/recovery

- **What/why:** Tenants sharing provider team limits starve each other or encounter
  unexpected suppression; a stale API limitation drives duplicate infrastructure;
  changed payload or expired provider idempotency causes repeated delivery.
- **Severity:** High, potentially Critical for cross-scope disclosure.
- **Likelihood:** Medium–High when actual account topology differs from prose.
- **Evidence:** Fresh Resend team scope, scheduling and idempotency documentation;
  older P17 batch/region assumptions and D6 findings.
- **Answer impact:** Requires narrow adapter/contract corrections; retains native owners.
- **Permanent fix and exact change:** C13/C20/C21; P14/P16/P29/P31. Qualify the
  actual team/account mapping, fair admission, suppression and supported recovery.

### D7-R14 — rollout or rollback revives old authority and repeats historical sends

- **What/why:** Legacy queues/direct endpoints remain writable, old newsletter
  posts are treated as sent issues, or restore reactivates consent or scheduled
  mail after a newer cancellation.
- **Severity:** Critical. **Likelihood:** Medium during mixed-version deployment.
- **Evidence:** Existing placeholder, post, template/test, queue and browser models;
  D6 no request-to-consent conversion; source-history and retained-custody rules.
- **Answer impact:** Requires migration and activation sequencing, not instant enablement.
- **Permanent fix and exact change:** C21/C22; P29/P30. Census retained data, preserve
  provenance, fence old writers, reconcile replay and roll forward after new writes.

### D7-R15 — the system cannot explain or safely retain what happened

- **What/why:** Missing audit obscures who authorized a send; raw content/recipient
  logs leak private data; deletes erase useful delivery evidence or retain all
  draft/media data forever.
- **Severity:** High. **Likelihood:** Medium–High with ad hoc logs and cascades.
- **Evidence:** Existing best-effort test audit and raw post audit; P6 body-free
  durable history versus source-owned content; template FK deletion behavior.
- **Answer impact:** Requires separated business/security/technical evidence and custody.
- **Permanent fix and exact change:** C09/C15/C20/C21; P13/P24/P32. Minimize logs,
  retain exact lawful source evidence, qualify purge/backup/restore and expose useful
  permitted outcomes. No new indefinite archive or guessed legal retention period.

### D7-R16 — a small-demo architecture fails on real audience/media volume

- **What/why:** Unbounded full-body lists, one huge fanout transaction, repeated
  policy lookups, synchronous provider retry or one tenant's burst exhausts the system.
- **Severity:** High. **Likelihood:** High as histories/audiences grow.
- **Evidence:** Unpaginated full template reads and inline retry; provider team
  rate scope; no production-shaped native load qualification.
- **Answer impact:** Requires bounded source preparation and measured admission, not new infrastructure by default.
- **Permanent fix and exact change:** C07/C09/C20; P07/P31. Seal bounded audience
  preparation, paginate summaries, index source/tenant/queue access and qualify actual
  budgets. A 41-case fixture is not a throughput benchmark.

### D7-R17 — good prose, vendor claims or synthetic tests are mistaken for delivery

- **What/why:** The feature is called done despite missing owner amendments,
  inaccessible media/replies, blocked tests or no representative user proof.
- **Severity:** High. **Likelihood:** High without explicit traceability gates.
- **Evidence:** Real Coming Soon screen, missing native contracts, unexecuted Core
  suites, vendor documentation limits and research-only fixture.
- **Answer impact:** Requires outcome proof and honest status; the review may be complete
  while implementation is still absent.
- **Permanent fix and exact change:** C01/C22; P01/P26/P30/P31. Map each requirement
  through owners, future formal artifacts, code and exact release evidence; qualify
  real two-tenant and phone/email/print journeys before claiming parity.

## Individual category review

Every requested category was considered independently. “Yes” means a material
concern exists in the selected direction, its missing qualification or reuse of
current code; it does not claim a deployed incident. Each reference supplies
severity, likelihood, evidence, answer impact, permanent prevention and exact text.

| Category                                                      | Material concern?                                | Individual finding and required treatment                                                                                                                                                                                                                        |
| ------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, and alternatives                 | Yes — R01/R02                                    | A solves deliberate issue control; the parity rider requires the whole newsletter job. Automatic digest and external/no-build alternatives were compared. Bound parity instead of importing a whole competitor or freezing editor internals.                     |
| Brittleness                                                   | Yes — R04/R05/R13                                | Mutable content, live recipient filters and assumed provider topology break under routine changes. Bind source versions, current exclusions and actual adapter facts.                                                                                            |
| Technical debt                                                | Yes — R02/R04/R14                                | Promoting test sends, browser campaigns or separate template-version writes creates a second service and painful migration. Extend current owners and fence legacy writers.                                                                                      |
| Edge cases                                                    | Yes — R05/R07/R08/R10                            | Shared mailboxes, no eligible recipients, destination changes, protected video, delayed mail, DST and subscriber-without-reader access need explicit outcomes. P07–P24 cover them.                                                                               |
| Footguns                                                      | Yes — R03/R06/R07/R11                            | Publish-as-send, arbitrary test targets, false Save/Cancel, new retry keys and transactional reclassification enable accidental harm. Separate actions and protect the authoritative command.                                                                    |
| Tenant safety                                                 | Yes — R03/R09/R13                                | Tenant/hat mixing, public assets, provider-team scope and unscoped draft keys can leak or interfere. Enforce scope across all objects, jobs and derivative surfaces.                                                                                             |
| Database, RLS, and authorization safety                       | Yes — R06/R09/R14                                | Verify keys, nullability, constraints, actual grants/RLS, old/new state, functions/views/storage and service paths. Trusted source attribution and atomic effects cannot be caller-writable.                                                                     |
| Overengineering                                               | Yes — R01/R02/R12                                | Literal vendor cloning, a second inbox/CRM/sender, generic approval graph or cadence registry adds complexity without serving A. Use the complete bounded native job.                                                                                            |
| UX/UI and user friction                                       | Yes — R03/R07/R11                                | False affordances and uncertain outcomes destroy control. Require clear composition/review, contextual explanations, recoverable mobile editing and meaningful accessible outcomes.                                                                              |
| Source of truth, ownership, and domain invariants             | Yes — R02/R04/R05/R10                            | Issue, content release, membership, dispatch and relationship history are distinct authorities. Enforce immutable authorized meaning and one source effect.                                                                                                      |
| Hidden coupling                                               | Yes — R05/R08/R12/R13                            | Signup, Page publication, notification settings, provider suppression and print can otherwise change unrelated behavior. Use explicit purpose boundaries and declared dependencies.                                                                              |
| Failure modes                                                 | Yes — R06/R07/R13/R15                            | Lost response, partial fanout, failed audit, provider unknown and worker outage require durable evidence, safe retries and cause-specific repair. No false global success or resend-all.                                                                         |
| Lifecycle, temporal correctness, concurrency, and idempotency | Yes — R04/R06/R07                                | Exact issue/revision authorization, schedule validity, send/cancel/revoke ordering and immutable external outcomes are required. Probe supports only bounded mechanics.                                                                                          |
| Data integrity risks                                          | Yes — R04/R05/R06/R14                            | Lost attachments, mismatched versions, duplicate destinations/effects and replayed legacy records corrupt meaning. Source constraints and accepted-effect recovery preserve it.                                                                                  |
| Security and privacy risks                                    | Yes — R05/R08/R09/R10/R15                        | Drafts, preview/test, subjects, media, replies, roster exports, logs and retained artifacts all disclose data. Apply exact permission, purpose and custody throughout.                                                                                           |
| Scalability and performance risks                             | Yes — R13/R16                                    | Current list/retry patterns and shared provider quotas are not production-shaped native capacity. Require bounded work, fair admission and measured contractual budgets.                                                                                         |
| Operational burden                                            | Yes — R02/R07/R13/R15                            | Unsupported reply routes, stale schedules and unknown sends must not require database repair or routine developer intervention. Expose owner-specific recovery and suppress unsafe retries.                                                                      |
| Observability and auditability gaps                           | Yes — R06/R11/R15                                | Technical logs cannot establish exact authorization, recipient status or historical content. Preserve durable source history and permitted, truthful UI evidence.                                                                                                |
| Dependency and integration risks                              | Yes — R02/R08/R13                                | Missing native preparation/video/reply producers and stale provider assumptions are real dependencies. Qualify exact seams without adding optional sync/AI/inbox prerequisites.                                                                                  |
| Migration, rollout, and upgrade risks                         | Yes — R09/R14                                    | Existing grants, old clients/queues, retained posts and provider changes require additive deployment, writer fencing and safe restore; rollback cannot erase accepted effects.                                                                                   |
| Testability, traceability, and proof                          | Yes — R01/R17                                    | “Parity,” “full control” and “amazing UX” alone are unfalsifiable. C01–C22 and P01–P32 make outcome and release evidence explicit.                                                                                                                               |
| Other development hazards                                     | No additional independent material concern found | Checked money mutation, new financial authority, arbitrary vendor expansion, destructive rollback, dependence on AI/SMS/sync and compulsory coaching. D7 adds no money mutation; identified overlaps are already covered above. No extra subsystem is justified. |

## Exact requirements and acceptance amendments

These are the explicitly ratified requirements for the developing D7 decision.
They must be reconciled into owning formal sources at the authorized specification
transition, not treated as already edited owner contracts.

**D7-C01 — Controlled parity.** The product SHALL provide the complete required
native newsletter jobs in the dated parity ledger. Each entry SHALL identify its
evidence, user outcome, owning contract, implementation status and acceptance proof.
The ledger SHALL explicitly distinguish deliberate per-issue authorization from
Epistle's automatic future digests. No literal parity claim, new dependency or
scope expansion follows solely from a vendor name or an unverified feature.

**D7-C02 — One native source and communication spine.** P28 SHALL own qualified
newsletter issue work and recipient-purpose facts under existing consent rules.
P17 SHALL supply the native authored-content/preparation/sender/reply extension;
P6 SHALL consume exact source eligibility and own recipient intent, dispatch and
outcomes. P22/P23 publication/media and P12 access remain independent. No system
message key, direct provider call, second subscriber master or parallel send queue
may substitute for the missing native producer. Native completion SHALL remain
independent of optional sync, workflows, AI and SMS.

**D7-C03 — Effective control.** View, edit, test, authorize Send, schedule, stop,
export and settings administration SHALL use exact current source capabilities
in the selected tenant and active context. The server SHALL derive tenant, actor,
role/assignment, purpose and audit attribution from trusted context. Read,
authorship, relationship, Page participation or staff approval alone SHALL NOT
grant Send. Current organization content approval and the missionary's exact-issue
send authorization SHALL remain distinct; no timeout approves either.

**D7-C04 — Recoverable drafts.** Draft saves/restores SHALL preserve content,
subject, attachments and authorized metadata atomically with expected-revision
protection. Server acknowledgment alone permits Saved. Concurrent changes SHALL
produce an understandable recovery choice, not silent overwrite. Restoring creates
current draft work and never changes an authorized/sent issue. No unscoped browser
storage or unqualified private offline replica may become the source. Read
revocation clears protected client state and rejects late responses.

**D7-C05 — Real, bounded media parity.** The owner amendment SHALL support the
documented picture/video newsletter job with actual qualified intake or typed
embedding, safe presentation and appropriate email/print fallback. Specify what
is supported rather than promising arbitrary formats, audio, attachments or
transcoding. Validate original, metadata, captions, alt text, posters, derivatives,
player/link destinations and access; email clients need a useful authorized
representation without assumed embedded video playback. Private draft media
SHALL NOT become public because its URL is convenient. No new media vendor is
implied by this requirement.

**D7-C06 — Deliberate content reuse.** Reused Updates/templates/media SHALL retain
exact source revision/provenance and pass newsletter-specific content and audience
qualification. Protected content SHALL NOT be automatically transformed into public
or broadly emailable material. Newsletter edits create authored issue content,
not an upstream Update edit or synchronization rule. Public publication and web
archive exposure SHALL require their own admission; Send SHALL NOT publish them.

**D7-C07 — Exact recipients.** Preparation SHALL resolve positive newsletter
eligibility, selected scope and disclosure before counts, search, previews and
exports. It SHALL seal an exact authorized recipient ceiling with a digest and
truthful address/destination-based counts. It SHALL handle shared mailboxes and
personalization without identity merge or revealing another person's facts.
Hidden identities and exclusion reasons remain protected. Zero eligible recipients
SHALL disable Send with the permitted repair; unknown eligibility SHALL NOT look
like zero. New signups or changed live filters SHALL NOT expand an accepted issue.

**D7-C08 — Preview and test are distinct.** A no-send preview SHALL show actual
issue structure and safe sample personalization on desktop and mobile, including
sender, subject, reply destination, links and footer. A real test SHALL be clearly
labelled, use exact current draft-disclosure authority and a qualified reviewer
destination, and disclose that it sends real mail. Tests SHALL NOT expose live
recipient data to arbitrary addresses, create subscriber sends, or prove final
audience delivery. Production unsubscribe, protected-view and response actions in
test copies SHALL be inert; tests SHALL create no Party/business communication or
engagement history. Test evidence SHALL identify the actually tested content.

**D7-C09 — Exact atomic authorization.** Final review SHALL summarize actual
content, sender/reply purpose, exact audience/exclusions, and immediate or one-off
timing. The command SHALL accept only the current reviewed issue/preparation and
required content approval. Authoritative authorization, required business/security
evidence and durable release/fanout intent SHALL commit atomically. Fanout may
expand in bounded durable batches from the sealed manifest; it SHALL NOT rerun a
live audience query or require a huge synchronous recipient/provider transaction.

**D7-C10 — Business-effect idempotency.** Two clicks, devices, job deliveries or
transport request keys for the same accepted issue SHALL create one authorized
release and at most one intended effect per qualified recipient/destination and
channel. An old success receipt reports the accepted historical operation, not
current permission or status. Deliberately sending another issue, correction or
resend requires a separately reviewed source occurrence, never a new transport
key to escape deduplication.

**D7-C11 — One-off scheduling and editing.** Schedule SHALL authorize only this
issue, exact ceiling and disclosed resolved instant/time zone. Ambiguous or
nonexistent local times need a clear resolution. Before activation the source
contract SHALL define an enforced schedule horizon and absolute last-useful-send
deadline; provider limits and unrelated system-message TTLs SHALL NOT supply them.
Edit/reschedule/stop SHALL be source-versioned operations. Definitely unsubmitted
work may return to editable preparation through the owner transition; revised
content/audience/timing requires the appropriate deliberate authorization. A
cancelled or expired occurrence SHALL NOT revive after restore, retry or restart.

**D7-C12 — Current dispatch narrowing.** Before the actual source-defined
submission boundary, dispatch SHALL re-prove required sender, actor/source,
recipient consent, destination, content/safety and validity fences. Current
restrictions may reduce the fixed audience; they SHALL NOT silently retarget a
changed address, substitute content/locale/prior issue or add new recipients.
Page signup Off is not a global send stop; newsletter-purpose closure and relevant
withdrawal are separate fences. No recipient may override another person's choice.
The actual human-newsletter rendition SHALL include the qualified visible HTML
and plain-text unsubscribe path and required RFC 8058 List-Unsubscribe and
List-Unsubscribe-Post headers with the required DKIM coverage. Verify the actual
delivered message and exact-purpose source withdrawal, not merely a template.
One-click withdrawal needs no login/cookie or additional confirmation; GET and
prefetch have no withdrawal effect. Carry forward qualified D6 replay semantics
without turning one newsletter withdrawal into a broader provider/global opt-out.

**D7-C13 — Honest external recovery.** Cancellation SHALL stop all and only
effects still provably stoppable under P6/P17. Internal preparation or a queue
lease alone SHALL NOT be called irreversible provider submission. Once submission
may have begun, preserve accepted/unknown evidence and do not promise recall.
No provider call occurs inside the source transaction. Supported same-effect
provider retries use identical meaning and stable identity within actual provider
guarantees. For a permitted bounded indeterminate retry, preserve the exact sealed
endpoint, UTF-8 bytes, recipient order, headers, account/credential and provider
key required by P17; equivalent rerendered meaning is insufficient. Outside that
guarantee, reconcile or retain visible uncertainty. A new attempt/key is permitted
only after sufficient proved definite rejection and current source-contract
authorization, preserving the same business effect. Never blindly retry accepted
or unknown recipients, rekey them, or classify newsletters as transactional to
escape controls. Signed provider events are idempotent; out-of-order or conflicting
events add qualified evidence rather than blindly overwriting outcome state.

**D7-C14 — Structural database enforcement.** Source rows SHALL have non-null
scope and identifiers, tenant-aware foreign keys, valid-state checks, exact
uniqueness and indexes supporting actual predicates. Immutable release, actor,
approval and audit fields SHALL be unavailable to ordinary updates. Verify both
old-row and new-row authorization, effective grants and policy composition,
SELECT/UPDATE behavior, views, RPC/function ownership/search paths/EXECUTE,
Storage/Realtime, service workers and direct REST/GraphQL. Table ownership or
service credentials do not supply the source action authority. Deletion/restore
SHALL preserve required historical effect identity without granting current access.

**D7-C15 — Disclosure and custody.** Apply exact purpose/current access to subjects,
preheaders, body/text alternatives, personalization, media, previews, online views,
replies, exports, logs and generated documents. P6 body-free history SHALL reference
source-owned authorized content rather than duplicate bodies into logs. Define
owner-approved retention/purge for drafts, renditions, recipient snapshots,
authorization and delivery evidence, plus lawful exceptions, backups and restore
before activation. No unlimited retention or guessed legal duration is authorized.

**D7-C16 — Clear integrated UI.** Use Core's shared Base UI/base-maia/Zinc language.
Provide one coherent Draft → Review → Send/Schedule journey with visible saved
state, contextual help and truthful permission/readiness states. Ordinary saves
need no repeated confirmation. Show required review when applicable; never show a
working-looking send control while checking authority. Preserve authorized edits,
focus and reading position through recoverable failures. Status text SHALL
distinguish scheduled, sending, provider-accepted, delivered, failed, excluded,
cancelled and unresolved according to evidence. Provide keyboard/AT operation,
320 CSS-pixel reflow, meaningful labels/status, sufficient contrast and touch
targets; 44-pixel design guidance is not a misstatement of WCAG's 24-pixel AA
minimum-with-exceptions. International names, addresses, locale and time zones
retain meaning. A memory-only unsaved draft is not advertised as safely saved.

**D7-C17 — Independent reader choices and overlap.** Native newsletter choices
SHALL remain distinct from Show in my Updates, post-email notices, Page visibility
and protected reading. Do not display automatic cadence unsupported by A, merge
approved issues behind the missionary's back, or silently suppress a separately
authorized purpose based solely on content overlap. Where the same selected Update
has a source-known post-notice effect, review SHALL explain that the newsletter is
an additional communication; provide a simple content-selection correction.
Unknown earlier delivery SHALL remain unknown. Purpose-owned coordination may be
added only through an explicit contract, not a generic “already emailed” flag.

**D7-C18 — Useful physical work.** P28's qualified print/export source, with P3/P12
access and applicable P29 custody or the exact artifact owner, SHALL own native
newsletter physical-work authorization and evidence; this is not general P17 print
ownership or a blanket dependency on an entire later phase. Native print rendition,
exact recipient lists and mailing labels SHALL use qualified content, current postal authority,
international addresses, approved salutations and safe household rules. Email
subscription alone SHALL NOT grant postal data or physical consent. Screen/export,
download, printed, mailed and delivered SHALL remain distinct; do not include
personalized unsubscribe secrets or unrelated roster data in reusable print
templates. Files already downloaded cannot be recalled by a later setting change.

**D7-C19 — Real replies without new authority.** Establish one qualified native
newsletter reply purpose and confirmed destination through P17/P6 and its actual
receiver. Use approved safe sender/reply labels; never derive a private missionary
address or route every reply to Support Hub by convenience. Email receipt is not
automatically a CRM interaction, consent change, coach-visible event or another
inbox. P22 likes/prayers/comments use only current exact reader/response authority.
Subscriber-only users SHALL receive truthful permitted paths, not broken protected
links or implicit broad reader access. Opens/clicks remain limited diagnostics.

**D7-C20 — Bounded operation and useful evidence.** Use summary projections,
bounded search/pagination, indexed tenant/source/due predicates, constrained
preparation/fanout and the established durable worker infrastructure. Before
activation record exact audience/content/media/schedule/retry/queue budgets and
production-shaped measurements for the declared supported workload. Enforce actual
provider team/account limits with tenant-fair admission; no provider limit is a
Core throughput promise. Separate business history, security attribution and
technical traces; minimize content/PII and expose source-specific repair.

**D7-C21 — Additive rollout and safe rollback.** Inventory retained drafts,
templates, posts, requests, recipients, queues and provider evidence. Do not infer
past consent or sends from labels or import ambiguous records as confirmed.
Deploy constraints/commands/readiness before UI activation, fence legacy writers
and old clients, and qualify mixed-version behavior. A kill switch stops new
authorizations and provably unsubmitted work without deleting evidence or
rewriting accepted/unknown delivery. After new writes, prefer compatible roll
forward; restore must reapply newer revocations/cancellations and prevent replay.

**D7-C22 — Proof and traceability.** Each selected job/claused outcome SHALL map
from this answer and glossary through its owning amendment, formal requirements,
design/tasks, future tickets, implementation/tests and exact release evidence.
Keep Proposed, Ratified, Implemented, Qualified and Activated distinct. A
placeholder, passing mock, synthetic probe, vendor feature or attractive screenshot
SHALL NOT satisfy the complete-job gate. Resolve material contradictions in their
actual owner sources, not only with a banner or research note.

## UX and lifecycle that make control understandable

The ordinary missionary flow should read like the work:

```text
Newsletters
Drafts | Scheduled | History                         New newsletter

Draft
Subject · Content · Approved sender · Replies go to
Saved / Saving / Unsaved changes / Could not save
Preview · Optional test                              Review newsletter

Review newsletter
Content preview · Selected recipients · Exclusions
Send now / Choose one date, time and named time zone
Existing required approval/readiness shown here
Back to draft                                       Send / Schedule

Result
Send accepted / Scheduled for <time, zone>
View progress, individual permitted outcomes and available repair
Stop remaining work, when it is still stoppable
```

The labels are recommended copy, not a claim of final user-tested wording.
Recipient counts must say what they count; an address is not necessarily a person.
Print appears as a useful related action only when chosen and authorized, not a
mandatory email step. Author-only draft controls must not appear as public Page
features. Do not expose queue leases, revision hashes or provider API choices.

Existing organization review should show an actionable cause, such as
“Content approval is needed before you can send.” Save remains available where
permitted. An approver can approve content without generating mail; the missionary
still makes the exact issue's Send/Schedule decision. An unavailable service is
not labelled “You do not have permission.” A revoked Send grant prevents new
authorization; a revoked Read grant also removes protected data. Unrelated
permission revisions need not cancel valid work when current exact authority
still proves it is allowed.

Lost response copy should direct recovery, not another send: **“We're checking
whether your send was accepted.”** Reconcile the same source occurrence. A source
accepted issue with a failed status refresh stays accepted. If some recipients
crossed the submission boundary, show the actual split and **“Stop remaining”**;
never promise that Cancel retracts those messages. A “Delivered” result describes
provider-reported delivery, not that someone read the newsletter.

For readers, the named newsletter should say that issues arrive when the
missionary sends them. Use the D6 qualified signup/confirmation journey without
forcing a gift or account. Preferences and unsubscribe identify this purpose;
existing post notices remain separate. Email text remains useful with images off,
links are descriptive, and video has an accessible email-safe representation.
Reply and online-view links resolve through actual qualified destinations and
current authority. No supposedly private subject, preview, filename or poster
should reveal material the body is forbidden to disclose.

State is not one mutable “sent” flag:

| Source state/action                            | Meaning and valid next step                                                                                                                                                             |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Draft / recovered draft                        | Editable under current authority; preview/test/review possible; no send authorized. Delete only through draft custody rules.                                                            |
| Ready for final review                         | Exact content is qualified; review audience/sender/timing. Any material change invalidates that review.                                                                                 |
| Send/Schedule accepted                         | Exact issue authorization and required durable intent exist. It does not prove compiler release, provider acceptance or delivery.                                                       |
| Waiting / prepared / due                       | Shared execution processes the authorized issue within its validity window; rechecks may narrow or stop. No provider call before the required complete P6 preparation/release contract. |
| Definitely unsubmitted                         | Stop/edit follows source ordering. Editing ends old unsent authorization before a new issue decision; no resurrection by stale jobs.                                                    |
| Submission may have begun / accepted / unknown | Preserve exact effect and actual evidence. Reconcile or supported retry, never recall by UI fiction or replacement effect. A generic internal claim is not this boundary.               |
| Partial / completed with outcomes              | Show recipient-specific accepted/delivered/excluded/failed/unknown meanings; repair only the exact permitted unsatisfied effect. No resend-all shortcut.                                |
| Cancelled / expired                            | Terminal for that authorization. Return to preparation or create another deliberate issue where permitted; old retries remain inert.                                                    |
| Correction / intentional resend                | New reviewed occurrence with provenance; no edit of delivered history, no automatic correction email.                                                                                   |

The conservation rule is simple: every selected recipient effect belongs to one
authorized issue and has one current qualified disposition with retained evidence.
Transport events may add knowledge but do not duplicate the effect. Preparation
can be bounded/chunked, while P6's complete-plan admission must precede any send;
partial preparation must never turn into a partially reviewed audience.

## Falsifiable proof and acceptance scenarios

These are required outcomes, not a claim they have all run. **Only the separately
reported synthetic PostgreSQL checks executed.** Tests must cover the actual
source/UI/API/worker chain, with real roles and declared provider/browser fixtures
as appropriate. Match each case to C01–C22 and the concern it prevents.

| Proof                                | Required observable result                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D7-P01 — explicit choice and parity  | Saving, publishing an Update, subscribing and accepting content approval create no newsletter send. Every required parity row has real evidence or is clearly not yet qualified; automatic future digests are an explicit difference.                                                                                                                                                |
| D7-P02 — native owner path           | Complete a native newsletter with optional sync, AI and SMS disabled. Test/admin/provider helpers cannot replace the qualified source command.                                                                                                                                                                                                                                       |
| D7-P03 — authority matrix            | Across two tenants, multiple hats and two same-capability missionaries, own permitted work succeeds; unauthorized issue/recipient/media/view/test/export/send actions disclose nothing and create no effect.                                                                                                                                                                         |
| D7-P04 — protected mutations         | Direct table/RPC/view/REST/GraphQL/Storage/service paths cannot forge tenant, author, approval, release state or audit; permitted old row cannot mutate into a forbidden new state.                                                                                                                                                                                                  |
| D7-P05 — draft recovery              | Phone connection loss, navigation, session renewal, duplicate save and reopen preserve permitted content/attachments and honest Saved state; revoked Read removes state and late payloads.                                                                                                                                                                                           |
| D7-P06 — revisions and reuse         | Two editors, template restore, upstream story edit and media replacement never alter an authorized issue; stale review fails clearly and no private variant is selected automatically.                                                                                                                                                                                               |
| D7-P07 — recipients and scale        | Exact eligible destination count, bounded search and sealed audience survive source changes and pagination; hidden identities do not leak through exclusions, counts or timing.                                                                                                                                                                                                      |
| D7-P08 — shared identities           | Shared mailbox/household, duplicate selection, multiple purposes, international names and personalization produce the intended private delivery without person merge or another recipient's data.                                                                                                                                                                                    |
| D7-P09 — preview/test                | Preview sends nothing; a real test reaches only the authorized reviewer with permitted synthetic personalization and exact tested revision. Arbitrary recipient and protected draft disclosure fail; production unsubscribe/response/protected actions are inert, with no Party communication/engagement history.                                                                    |
| D7-P10 — double authorization        | Simultaneous clicks/devices and different transport keys for the same reviewed issue create one release and one intended recipient effect each.                                                                                                                                                                                                                                      |
| D7-P11 — stale review                | Content, audience or relevant approval changes between review and Send reject stale authorization; unchanged unrelated permission revision does not manufacture denial.                                                                                                                                                                                                              |
| D7-P12 — later membership            | A later signup never enters an already accepted issue. Current withdrawal removes matching unsubmitted work; address changes do not retarget frozen mail.                                                                                                                                                                                                                            |
| D7-P13 — atomic failure              | Failure before required authorization/audit/intent commit leaves none accepted; failure after commit preserves the accepted effect and recoverable result without false rollback.                                                                                                                                                                                                    |
| D7-P14 — provider ambiguity          | Lost provider response, webhook before response, duplicate/out-of-order webhook, 409 payload conflict and retry after provider key expiry cause no blind replacement send or false delivery. Permitted indeterminate retries preserve exact sealed bytes/endpoint/order/headers/account/credential/key; a contract-permitted new attempt follows only proved definite rejection.     |
| D7-P15 — timing                      | One-off future time, DST gap/fold, changed display zone, expired utility window and worker downtime retain the selected instant and honest outcome; overdue invalid work never catches up automatically.                                                                                                                                                                             |
| D7-P16 — current narrowing           | Withdrawal, source closure, safety restriction, lost relevant authority or provider suppression wins before submission when ordered first; reopening does not revive the old terminal occurrence. A delivered native canary proves visible HTML/text unsubscribe, DKIM-covered RFC8058 headers and exact-purpose withdrawal without GET/login/cookie or broader unsubscribe effects. |
| D7-P17 — edit/stop race              | Edit/reschedule/stop versus actual submission has one source-defined order. Definitely unsubmitted work stops; accepted/unknown work remains evidenced. A lease alone does not make cancellation impossible.                                                                                                                                                                         |
| D7-P18 — partial stop                | Mixed waiting, accepted, failed and unknown recipients remain distinct. Stop remaining work does not erase or repeat crossed effects and reports the actual split.                                                                                                                                                                                                                   |
| D7-P19 — intentional correction      | A corrected or deliberately resent issue requires a new explicit review and source occurrence; old success receipts and stale jobs cannot authorize it.                                                                                                                                                                                                                              |
| D7-P20 — truthful feedback           | Saved, accepted, scheduled, sending, delivered, unavailable, read-only and unknown states match source facts. Failed refresh cannot turn accepted Send into a fresh-send prompt.                                                                                                                                                                                                     |
| D7-P21 — real media journey          | Picture/caption/video creation or admitted embed, mobile preview, approved rendition and real email-client/link playback work; unsafe media/derivatives are blocked without fallback disclosure.                                                                                                                                                                                     |
| D7-P22 — protected reading           | Forwarded email/link, expired link, revoked reader and subscriber-only user never gain protected content through title, poster, text, asset optimizer, online view or response endpoint.                                                                                                                                                                                             |
| D7-P23 — secondary surfaces          | Cross-tenant caches, realtime payloads, logs, service functions, media derivatives, exports and background jobs preserve the same boundary; hosted grants/policies are actually inspected.                                                                                                                                                                                           |
| D7-P24 — reply and custody           | The displayed reply route reaches the intended authorized destination without exposing a private mailbox or Support history; deletion/retention/backup restore preserves required effect evidence and restrictions.                                                                                                                                                                  |
| D7-P25 — response/history            | Newsletter delivery/open/reply-link click creates no personal encounter, donor score, coaching enrollment or shared private note. Real P22 responses use their current audience and source identity.                                                                                                                                                                                 |
| D7-P26 — usability/accessibility     | Representative missionaries and readers complete draft/recovery/review/send/stop and subscribe/withdraw/read/reply tasks on phone/desktop with keyboard/AT. Any safety-critical misunderstanding of audience, Save/Publish/Send/Test/Cancel blocks release; visual and interaction evidence uses Core's design language.                                                             |
| D7-P27 — preference overlap          | All valid Show/post-email/native-newsletter combinations work independently. Known overlap is explained; no hidden generic dedupe, fake frequency selector or unsubscribe side effect.                                                                                                                                                                                               |
| D7-P28 — print                       | Exact physical selection, international address/salutation/household handling, missing-address repair and labels/rendition work without exposing email-only recipient data or claiming mailed/delivered from export.                                                                                                                                                                 |
| D7-P29 — migration/upgrade           | Old clients, queues, browser drafts, template/post labels, existing grants and provider updates cannot bypass the new source. Mixed-version and restore tests preserve accepted effects, newer revocations and terminal cancellation.                                                                                                                                                |
| D7-P30 — traceability and claim      | Answer → glossary → actual owner amendments → OpenSpec/design/tasks/tickets → implementation/tests → release evidence is consistent. Proposed and implemented are not conflated; full jobs, not screenshots, satisfy parity.                                                                                                                                                         |
| D7-P31 — production-shaped operation | Test declared largest supported audience/history/media and concurrent-tenant profile, provider outage/rate limiting and bounded recovery. Measure and enforce published budgets; no full-body list fetch, unbounded transaction or tenant starvation.                                                                                                                                |
| D7-P32 — audit and repair            | Authorized staff can establish exact actor/issue/recipient effect/outcome and perform permitted repair without raw body/token logs, direct database edits or invented certainty. Purge/restore retains required denial/replay protections.                                                                                                                                           |

The fixture currently proves 41 expected synthetic outcomes, including successful
own work by two same-capability actors, rejected cross-scope/forged/stale actions,
atomic failure, stable effects, and six observed database lock waits. It does not
simulate network exactly-once delivery or prove actual human intent, P6 sealed-plan
behavior, provider keys, inbox delivery, browser accessibility or load capacity.
The retained README, SQL, Python, roles, hashes and cleanup make that distinction
auditable. The final run strengthened same-tenant actor isolation with an allowed
own-issue control; the earlier 40-case run is not the final count.

## Adversarial check

### What could go wrong with this answer?

“Full control” can become a broad permission, and “parity” can silently authorize
automatic digests. Current demo/test components can look convincing while lacking
native authority, recovery, media and replies. R01–R17 address these concrete risks.

### What hidden assumptions are we making?

That manual issue review is worth its effort is the founder's selected product
judgment. That the proposed integrated workflow is easy enough is untested. Vendor
documentation establishes neither exact Epistle mechanics nor Core performance.
Actual provider topology, native producer qualification, bounded policy profiles
and representative-user proof remain explicit release gates, not guessed facts.

### How does this affect the whole product?

The change needs a bounded P28/P17/P6 preparation path, P22/P23 video and reuse
amendments, P17 reply purpose and exact P12 capabilities. Donor preferences,
public-page publication, CRM identity, finance, Support and coaching keep their
owners; none acquires authority from newsletter activity.

### How does this affect the end-user experience?

The missionary gets one useful Draft/Review/Send-or-Schedule workflow, recoverable
work and truthful results. Readers get clear purpose, real preference/withdrawal
and response paths. The experience must be demonstrated on phones and assistive
technology; extra controls or beautiful mock screens are not proof.

### Does this follow modern best practices?

Current Ghost, Kit, Mailchimp, Epistle, W3C, Supabase/PostgreSQL and provider
documentation support the proposed jobs and technical distinctions. Their
different default audiences, live recipient expansion, tracking and automation
are not imported against Core's contracts. Specific primary evidence and its
limits are retained in the linked notes.

### Does this fit Asym’s existing repo and product direction?

Yes as an explicit owner extension. It follows native independence, deliberate
control, shared UI and one source/communication spine. Current code is not assumed
correct: the placeholder, version-write hazards, test-send path, media gap, reply
gap and stale provider statements require correction through their owners.

### Should we adjust the recommendation?

Yes: accept A with the corrected decision and C01–C22. Treat parity as a complete
tested newsletter job with the explicit automatic-digest difference. Preserve
rich media, replies, print and recovery as real required work; do not shrink the
answer to a manual email MVP or reintroduce B under a different label.

## Ordered synthesis and release discipline

**Resolved before recording this review:** A governs each issue's send decision;
the broad parity rider does not override it. Full control respects organization
and recipient authority. The product scope is the complete native newsletter job,
not the competitor's whole product. Existing post-email preferences remain
independent. These resolutions are in the corrected wording, not left as another
founder engineering questionnaire. The founder explicitly ratified the corrected
decision and its required amendments on October 16, 2026 UTC. Other decisions
retain their separately recorded statuses.

**Capture in the specification/design, in dependency order:**

1. Establish the dated parity/requirement ledger and exact source-owner amendments:
   P28 issue/membership, P17 authored preparation/test/reply/media handling, P6
   complete-plan admission/dispatch, P22/P23 content/video, P12 authority and the qualified P28 print/export source with applicable custody.
   Correct the stale provider clauses in their source documents at `/to-prd`.
2. Specify the simple complete missionary/reader journeys and exact state/copy
   contract together with those owners. Preserve signup, publish, send, reading,
   preference, reply, print and relationship-history meanings. Resolve the actual
   supported video mechanism without adding a speculative media platform.
3. Define versioned issue/content/audience identity, source lifecycle, concurrency,
   stop/recovery and retained history. Complete finite schedule/utility/custody,
   audience/media/queue limits from actual owner and workload evidence before
   activation. Those numeric details are engineering qualification, not guessed
   founder preferences or imported vendor defaults.
4. Map C01–C22 and P01–P32 into formal owners, design/tasks and eventual tickets
   under the explicit session transitions. Keep all unmet required jobs visible;
   capability-specific gaps do not justify a substitute source or removing scope.

**Implementation safeguards required before activation:** first enforce source
commands, grants/constraints, immutable authorization and durable recovery; then
qualify content/recipient preparation, media/reply/print adapters and dispatch;
then wire truthful UI to those actual results. Census retained data and fence old
writers before enabling cohorts. Run actual two-tenant role/API/storage tests,
concurrency/failure and migration/restore cases, real declared provider/inbox
fixtures, mobile/accessibility task journeys and production-shaped load. Fix the
toolchain qualification gap before reporting Core test success. Enabling a feature
flag does not qualify any missing producer. Do not expose working-looking controls
for incomplete jobs or claim complete parity from a partially enabled cohort.

**Rollout:** enable only the complete qualified newsletter cohort and its required
owner capabilities. Stop new authorizations or affected unsubmitted effects on a
failed invariant; preserve known external facts and repair through the owner.
Already accepted new-source data requires compatible roll forward or a proved
rollback, never schema rollback that erases effect identities or revives old sends.

**Monitor only residual operational variation after those gates pass:**

| Signal                                                                                                             | Threshold                                       | Accountable owner                                                                                              | Required response                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Send without exact valid authorization, cross-tenant disclosure, forged history, or forbidden recipient submission | One confirmed occurrence                        | P6 delivery on-call with P12/security owner                                                                    | Stop affected new/unsubmitted work, contain disclosure, preserve evidence, repair the source boundary and requalify before reopening.                                                      |
| Duplicate external delivery for one source effect                                                                  | One confirmed unintended duplicate              | P6 delivery on-call                                                                                            | Suspend the affected retry/adapter path, reconcile provider/source evidence, repair dedupe and prove replay safety.                                                                        |
| Unknown effect is selected for a replacement/fresh-key send                                                        | One attempted unsafe transition                 | P6 delivery owner                                                                                              | Reject it, surface the unresolved original, investigate recovery policy; no blind resend.                                                                                                  |
| Protected asset/reply/print destination exposes data outside its authorized audience                               | One confirmed disclosure                        | P22/P23 media, P17 reply, or qualified P28 print/export owner with P3/P12 and applicable custody/privacy owner | Contain the exact derivative/path, stop affected future egress, assess irreversible copies and requalify.                                                                                  |
| A missionary misreads Save/Publish/Test/Send/Cancel or the actual audience in a reproducible task                  | One reproduced safety-critical misunderstanding | Missionary UX owner with the relevant source owner                                                             | Correct copy/control/state and repeat the affected journey before further rollout.                                                                                                         |
| Queue/media/recipient operation exceeds its activated profile's enforced budget or tenant fairness bound           | One measured breach of that published limit     | P6 operations plus owning API/media service                                                                    | Bound or pause affected admission, preserve accepted work, diagnose capacity/provider cause and restore only within qualified limits. Exact numeric profile is an activation prerequisite. |
| Parity row loses its passing evidence after a dependency/owner change                                              | One invalidated required row                    | Phase 28 product/QA owner                                                                                      | Withdraw the affected completeness claim, repair and rerun that job; do not silently delete the requirement.                                                                               |

No security, consent, source-ownership, missing media/reply capability, retention
policy or testability gap is relegated to monitoring. Those are prerequisites.
The permanent result is a complete native newsletter product whose controls mean
what they say, with one deliberate missionary decision for every issue.
