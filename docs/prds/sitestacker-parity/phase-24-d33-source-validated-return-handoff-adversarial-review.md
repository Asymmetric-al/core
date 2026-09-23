# Phase 24 D33 — Source-Validated Return and Handoff

**Status:** Founder choice pressure-tested and recorded as Reserved  
**Decision:** How a current recipient may stop owning source-backed work without
making Tasks Hub an assignment authority  
**Review date:** 2026-08-28  
**Scope:** D31 Website correction work and the reusable cross-domain
responsibility-transition contract for source-backed Tasks Hub projections

## Final disposition

**Accept Option 1 with required amendments.**

Source-validated return or handoff is the best permanent model, but the bare
answer conflates two materially different outcomes and could still create an
ownerless black hole:

- a **named handoff** replaces exact current responsibility with one source-
  proved successor; and
- a **return** names no successor, preserves any other current responsible
  recipients, and moves the exact action to source-owned **Needs assignment**
  only when nobody remains.

Opening the action, searching, loading candidates, selecting a person, closing
the panel, losing connectivity, or receiving an incomplete/indeterminate
eligibility result changes nothing. Only one deliberate, expected-head source
command may append the successor responsibility generation. Unknown is never
zero, a return is never completion, and neither operation grants access.

## Exact corrected decision

> Every source-backed task that permits responsibility change SHALL expose the
> secondary action **This needs someone else** from its current task detail. It
> SHALL open one responsive Base Maia handoff surface, not an inline generic
> assignee field or nested sequence of modal dialogs.
>
> The source contract SHALL separately admit two closed operations for one or
> more exact Source-action scopes:
>
> 1. **Hand off to a named person.** The source returns only destinations the
>    current actor may lawfully discover and that are currently eligible to
>    receive and perform every selected scope. After an impact preview and one
>    explicit confirmation, the source appends a complete successor
>    responsibility generation. Removed recipients end **Reassigned**;
>    unchanged recipients keep their existing engagement; newly admitted
>    recipients receive one fresh assignment and unread state. No target
>    acceptance step, task copy, or engagement transfer is implied.
> 2. **Return without naming a successor.** The source appends a complete
>    successor generation, preserves every other still-current responsible
>    recipient, and ends the returning recipient's selected scopes as
>    **Returned**. If no responsible recipient remains, the source enters
>    **Needs assignment** and presents **Returned for reassignment**. The work
>    stays required and visible on its exact authorized source recovery surface.
>    It guesses no person, group, coordinator, administrator, queue, or fallback.
>
> A complete proved-zero target result may still permit deliberate return.
> Partial, stale, contradictory, timed-out, over-limit, or indeterminate target
> proof SHALL NOT be described as zero and SHALL NOT itself mutate
> responsibility. Return remains available during candidate-list failure only
> when the source can independently re-prove the return command, current
> recovery surface, actor, scopes, and expected heads; otherwise the flow fails
> without mutation and offers retry or the current source path.
>
> Assignment possession grants neither the right to hand off nor the right to
> receive work. At commit, the authoritative Website operational source SHALL
> derive the actor from trusted server context and re-prove Tenant,
> environment, Site, source-work identity, action scopes, current responsibility,
> initiator operation, target Party and role, target visibility and action
> capability, independence/policy constraints, identity and authorization
> epochs, contract version, and every expected head. Tasks Hub, Payload,
> notifications, browser state, workflow providers, comments, and AI are never
> writers of responsibility.
>
> The command SHALL be a short Asym/Postgres transaction that appends immutable
> source responsibility and audit evidence plus an identifier-only projection
> intent. Same semantic key and canonical meaning returns the existing receipt;
> the same key with a changed target, scopes, or operation rejects. No provider
> call occurs under the transaction lock.
>
> Handoff carries source context by reference. D33 assumes no generic free-text
> field; D34 separately decides whether a bounded structured reason or optional
> source-owned note is justified. Regardless, D33 creates no copied feedback,
> due date, reminder, email, acceptance workflow, out-of-office automation, AI
> ranking, workload score, bulk reassignment, or Tenant-authored routing DSL.

## Evidence labels

- **Verified repository fact:** current Core source, accepted ADR, glossary, or
  governing OpenSpec read on 2026-08-28.
- **Verified external fact:** current first-party documentation linked here.
- **Reasonable inference:** follows from verified evidence but is not itself a
  repository requirement.
- **Product judgment:** the recommended Core choice where evidence does not
  prove one universal answer.
- **Assumption:** requires representative ministry staff or production-shaped
  evidence before Live.
- **Unresolved unknown:** routed into the one D34 question rather than guessed.

## Current behavior, intended behavior, and permanent path

| Area                           | Current behavior                                                                                                                                                                             | D33 intended behavior                                                                                                    | Best permanent path                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Admin `/tasks` prototype       | Browser mutates `assigned_to`, display name, avatar, and timestamp from an unfiltered staff list.                                                                                            | Treat as visual prototype only; it cannot handle source-backed work.                                                     | Policy-aware Tasks Hub renders source actions and calls a privileged source command.          |
| `mission_control_tasks`        | One nullable `assignee_profile_id` references `profiles`; it lacks environment/Site/source-action grain, responsibility generations, target eligibility, receipt, and cross-table Tenant FK. | Do not retrofit handoff as an `UPDATE assignee_profile_id`.                                                              | Append source routing generations and project them into shared task assignment/history.       |
| Contribution assignment policy | `actor_only`, `queue_only`, or `actor_and_queue` chooses an actor/Finance queue at task creation.                                                                                            | Never reuse as Website fallback or eligibility.                                                                          | Every producer registers its own finite source-responsibility contract.                       |
| D19/D21/D31                    | Immutable differential handoff already ends removed responsibility, preserves continuing engagement, creates fresh new engagement, and distinguishes zero from unknown.                      | Generalize that proven kernel to source-backed task action scopes.                                                       | One platform transition vocabulary with source-specific resolvers and authority.              |
| D27–D29                        | Candidate-review lane has explicit next-lane CAS and a narrowly scoped Review-coordinator route.                                                                                             | Reuse transition mechanics, not that route or its members.                                                               | Route purpose, source action, and recovery ownership remain separate facts.                   |
| D32                            | Responsibility change appears as **Reassigned**, but no no-successor return reason exists.                                                                                                   | Add **Returned**; use **Returned for reassignment** and **Needs assignment** only when no responsible recipient remains. | Typed source outcome drives truthful task history and recovery views.                         |
| Payload/CMS                    | CMS owns public content and publishing state, not operational staff responsibility.                                                                                                          | Never store or resolve task assignees in Payload.                                                                        | Website operational workflow in Asym Postgres owns responsibility; CMS remains content truth. |
| Inngest                        | Governing OpenSpec makes it an optional executor, never product truth.                                                                                                                       | Use only after the source transaction for short projection/reconciliation.                                               | Product outbox, claims, uniqueness, current reads, and receipts remain authoritative.         |

## Modern-practice review

There is no universal reassignment behavior to copy. The transferable practice
is to separate who may initiate assignment, who may be assigned, what record
owns the work, and what happens after the transition.

- [Atlassian Jira permissions](https://support.atlassian.com/jira-cloud-administration/docs/use-manage-sprints-permission-for-advanced-cases/)
  distinguish **Assign work items** from **Assignable user**. Core needs the
  stronger source-specific equivalent: initiator authority and destination
  eligibility are separate, current proofs.
- [Salesforce Flow Approval reassignment](https://help.salesforce.com/s/articleView?id=platform.automate_automated_approvals_manage_reassign_work_item.htm&language=en_US&type=5)
  is limited to still-assigned work, authorized administrators, and a selected
  user/group/queue. Salesforce also documents that a new actor without record
  sharing access cannot receive an approval work item. Core preserves that
  state/access discipline without importing administrator-only UX.
- [Contentful Entry Tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
  permit creators/admins to reassign active tasks, but explicitly warn that the
  API does not verify that the assignee can read the entry. That is a known
  footgun Core must permanently prevent rather than reproduce.
- [Asana task guidance](https://help.asana.com/s/article/assign-tasks-to-teammates?language=en_US)
  encourages clear single responsibility and allows assignees to reassign work
  when they are not the right person. It is useful UX evidence, but Asana's task
  is the authority; Core's source-backed projection is not.
- [HubSpot shared queues](https://knowledge.hubspot.com/tasks/use-task-queues)
  make pooled work easy to distribute. That is the strongest low-effort
  alternative, but a generic queue would violate D31's explicit responsibility,
  privacy, and no-guessed-fallback decisions.
- [Blackbaud CRM task/role guidance](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/crm/us/40/Content/ADMSystemRolesAssignTasks.html)
  says navigational task access is not secured like the underlying feature.
  This supports Core's invariant that presentation/assignment never grants
  source capability.
- [WAI's combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
  supplies the current keyboard/focus contract for a bounded searchable
  destination picker. [WCAG 2.2 error-prevention guidance](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data)
  supports review/confirmation for consequential data changes; D33 uses one
  impact-previewed commit rather than a raw inline assignment edit.

**Product judgment:** immediate source-authoritative reassignment after one
deliberate confirmation is the lowest-friction safe default for already-
authorized internal staff. An acceptance workflow is warranted for external
access grants such as D25, not for every internal responsibility transition.
The new recipient can use the same source-validated return/handoff path if the
assignment is still wrong.

## Best staff UX/UI

### Placement and information architecture

- The active source-backed task keeps **Open Website work** as its primary
  action.
- **This needs someone else** is a visible secondary action in the task detail's
  responsibility section. It is not buried in an overflow menu, represented by
  an editable avatar, or shown on public/donor surfaces.
- An independently authorized manager changes responsibility from the Website
  source surface. Viewing another person's task never grants manager handoff.
- The interaction uses existing Base Maia Card, Button, Avatar, Command,
  Dialog/Sheet, status, and semantic token vocabulary. Desktop may use a
  focused dialog or sheet; narrow screens use a full-width sheet/drawer with
  the same reading and focus order.

### Named-handoff journey

```text
Who should take this work?

Page correction
hope.org · French (Canada)

Choose someone who can currently view and edit this Page.
[ Search eligible people ]

○ Amélie Laurent
  Translator · French (Canada) Page

○ Joel Mensah
  Website editor · French (Canada) Page

I don't know who should take this
```

After selection, the same surface—not another modal—shows the consequence:

```text
Hand off Page correction to Amélie?

Amélie can currently open and perform this work.
She will receive one fresh task. You will no longer be responsible for this
Page correction. Other work assigned to you will not change.

This does not publish the website or change Giving.

[Hand off to Amélie]  [Back]
```

If Amélie already has the shared task—or is already responsible for the selected
scope—the preview says that her existing responsibility remains, Maria will be
removed, and no duplicate task or unread pulse is created. If Maria is moving
only one scope from a multi-action task, the preview names what Maria keeps.

### Return journey

Selecting **I don't know who should take this** changes the source action:

```text
Return Page correction?

You will no longer be responsible for this Page correction. No new person is
selected. Any other current responsible people will remain. If nobody remains,
the work will appear as Needs assignment in Website > Changes requested.

No email or recurring reminder will be sent.

[Return this work]  [Keep assigned to me]
```

The text must describe the exact recovery surface proved by the current source
contract. It never promises a coordinator, queue, or personal task that the
source has not proved.

### Success and history

- Named successor: **Handed off to Amélie. You are no longer responsible for
  Page correction.**
- Other responsible people remain: **Returned. Amélie remains responsible.**
- Nobody remains: **Returned for reassignment. This work still needs an owner.**
- The old recipient sees non-unread Recent history while still authorized;
  target/source actor identity appears only when independently permitted.
- The new recipient gets one fresh in-product unread state if they are newly
  admitted. No email, push, digest, reminder, target date, or sound is created
  by default.
- If other scopes remain, the task stays open with those scopes. If none remain,
  it leaves **My tasks** and focus moves to the next logical row or the stable
  list heading with one polite status announcement.
- There is no optimistic disappearance and no generic toast **Undo**. A later
  correction is another current source transition, never history deletion.

### Candidate presentation

- Candidates are exact current Party+role destinations, not profile rows or
  free-form email addresses.
- Show the authorized display name plus the smallest existing staff-directory
  disambiguator needed for duplicate names, such as role/team/Site. Do not
  expose ineligible people or why they were excluded.
- Preserve international display-name order, diacritics, Unicode search, RTL,
  long names, no-avatar operation, keyboard exploration, escape-without-change,
  and screen-reader name/state/description.
- Do not rank by AI, inferred skill, workload, popularity, recent activity,
  availability, hierarchy, or prior handoffs. A source-owned explicit grouping
  may be shown only when its meaning is already governed.
- Fetch the bounded safe candidate projection only when the handoff surface
  opens. Candidate caches are actor/Tenant/environment/source/action/head-
  partitioned and never substitute for commit-time proof.

### Empty, error, and conflict states

| State                                | Required UX                                                                                                                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Complete proved-zero destinations    | **No eligible people are available right now.** Offer deliberate return only if the source can prove its recovery path; otherwise keep responsibility and show the authorized source/settings route. |
| Indeterminate/timeout/partial result | **We couldn't verify who can take this work. Nothing changed.** Offer Retry and current source path; do not label it zero.                                                                           |
| Selected target becomes ineligible   | Keep task unchanged; say **Amélie can no longer receive this work** and refresh the permitted list without exposing why.                                                                             |
| Work completed while panel open      | Close without handoff; show the authoritative source outcome.                                                                                                                                        |
| Another handoff wins                 | Show the current responsible destination and no generic retry that could overwrite it.                                                                                                               |
| Lost response after commit           | Look up the semantic receipt before enabling retry; render the proved current result.                                                                                                                |
| Offline                              | Preserve no authoritative change; show offline text and Retry when connected. Never queue a blind handoff in browser storage.                                                                        |
| Authorization loss                   | Remove protected detail and action immediately; do not call it return, reassignment, or completion.                                                                                                  |

## Domain ownership and invariants

| Fact                              | Authoritative owner                                                             | Projection                | Never authority                                 |
| --------------------------------- | ------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------- |
| correction work/actionability/end | consequence-owning Website operational source                                   | source/task status        | task row, notification, timer, Inngest          |
| current responsibility and head   | source responsibility contract in Asym Postgres                                 | task assignment/history   | mutable `assignee_profile_id`, Payload, browser |
| initiator operation authority     | Phase 12 PDP plus source policy                                                 | action availability       | task possession, role label, prior success      |
| destination eligibility           | source resolver intersected with current Phase 12 access/action/identity/policy | safe candidate projection | Tenant directory, cached staff list, AI         |
| public content/publishing         | CMS/Website source under existing boundary                                      | preview/public reads      | responsibility transition                       |
| personal engagement               | exact recipient+role Tasks Hub/ADR-0027 owner                                   | unread/recent             | source responsibility or another recipient      |
| transition audit                  | source immutable receipt with trusted actor and heads                           | safe task activity        | log, toast, Inngest run, caller timestamp       |
| projection/retry                  | Core outbox/dispatch ledger; optional executor                                  | technical status          | responsibility, authorization, handoff outcome  |

Required invariants:

1. One Source-action scope has at most one current released responsibility head.
2. Every handoff/return is scoped to exactly one Tenant and environment plus
   one source-work identity, action-scope set, and current generation.
3. Task assignment and source authorization remain independent in both
   directions.
4. A handoff target must be currently discoverable to the actor and eligible to
   receive and perform every selected scope; eligibility is re-proved at commit.
5. A return proves only deliberate responsibility release and a valid recovery
   surface; it preserves other current recipients and does not prove zero
   eligible humans.
6. Proved zero, Needs assignment, and indeterminate are three different states.
7. Named handoff and return append immutable successor responsibility history;
   neither updates an assignee in place.
8. Continuing recipients retain engagement; removed recipients end truthfully;
   newly admitted recipients receive fresh engagement; no engagement transfers.
9. Handoff and return change no source content, review result, publication,
   Giving, finance, membership, capability, due date, or completion truth.
10. A later return/handoff never revives or rewrites a predecessor assignment.
11. Same-key/same-meaning retries return one receipt; changed meaning rejects.
12. Current source action completion or terminality prevents a stale handoff.
13. Actor, target, reason, time, Tenant, role, and source heads come from trusted
    server/source context, not caller-supplied audit fields.
14. A recipient may move only source-action scopes admitted by the current
    source contract and current operation authorization.
15. Candidate-list possession, URL parameters, a task ID, profile ID, cache,
    import, support tool, service role, worker, or AI cannot bypass the command.
16. Every source-backed producer reuses this vocabulary but owns its own
    eligibility, action, recovery, retention, and privacy policy.

## Conceptual data, RLS, and authorization contract

This is a logical contract, not permission to freeze final table names before
Tasks Hub design reconciles the current task stores.

| Record                            | Required meaning                                                                                                                                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| source responsibility head        | Same-scope pointer to the current immutable generation; expected-head CAS; no caller update.                                                                                                                                          |
| responsibility generation         | Append-only complete named-recipient or Needs-assignment outcome with source/policy/authorization heads and server time.                                                                                                              |
| responsibility member             | Same-scope stable Party+role, exact action subset, membership reason, generation, and immutable resolution evidence.                                                                                                                  |
| responsibility transition receipt | Semantic command key; handoff/return kind; predecessor/successor heads; selected scope digest; trusted initiator; optional named destination; preserved-recipient digest; optional Needs-assignment outcome; source causal reference. |
| task assignment projection        | Reference to the source generation/member with source-derived active/end reason; no mutable assignee authority.                                                                                                                       |
| projection intent/claim           | Identifier-only, schema-versioned, retryable outbox/ledger work with durable product uniqueness.                                                                                                                                      |

Database and authorization safeguards:

- Tenant and environment participate in every primary/foreign/unique relation
  or equality is proved inside one hardened transaction; standalone UUIDs are
  insufficient.
- One partial unique constraint or equivalent enforces one current source head;
  one active task assignment per exact source-work+Party+role+surface grain is
  enforced structurally.
- Source/generation/scope/policy/recipient/role/transition-kind/actor fields are
  immutable. Deletes use restrictive/governed lifecycle behavior; audit is
  append-only.
- Direct table grants do not permit browser reassignment. The command is a
  guarded server operation in the source-owning package.
- `USING` proves the actor may see and transition the existing current scope;
  `WITH CHECK` and command logic prove the resulting successor remains same-
  Tenant/environment/source and uses admitted target/state values.
- `ENABLE` plus `FORCE ROW LEVEL SECURITY`, least grants, definer-function
  hardening, pinned `search_path`, and service-role/owner/worker/support/import/
  AI parity are required where the eventual design uses those seams.
- Actor/author/audit time comes from authenticated server/database context.
  Caller-supplied `actor_id`, Tenant, role, `created_at`, eligibility result,
  reason, or target metadata is ignored/rejected.
- Candidate queries return only the safe current projection the actor may
  enumerate. Search terms, hidden candidates, explanations, and result counts
  do not enter logs, analytics, AI, exports, or shared caches.

## Lifecycle, concurrency, idempotency, and failure matrix

| Event/race                                                 | Authoritative result                                                            | Projection/UX consequence                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| panel opens/searches/selects/closes                        | no write                                                                        | task and unread unchanged                                                                                         |
| valid named handoff commits                                | successor generation with named target                                          | old Reassigned; new fresh assignment unless already continuing                                                    |
| valid return commits and others remain                     | complete successor preserves others                                             | old Returned; continuing assignments/engagement unchanged                                                         |
| valid return commits and nobody remains                    | successor Needs assignment generation                                           | old Returned for reassignment; source recovery remains visible                                                    |
| source action ends before handoff                          | source end wins                                                                 | no successor; show Completed/No longer required                                                                   |
| handoff wins before independently authorized source action | new responsibility head wins; action authorization remains separately evaluated | later legal source action may end new recipient as Completed elsewhere                                            |
| two different handoffs race                                | one expected-head commit wins                                                   | loser displays current responsibility; no overwrite prompt                                                        |
| duplicate same handoff                                     | same receipt                                                                    | one generation, one target item                                                                                   |
| same key reused for different target/scopes                | conflict                                                                        | no write; caller must issue a new semantic command                                                                |
| target loses eligibility after list                        | commit rejects                                                                  | refresh candidates; no partial history                                                                            |
| target loses access after commit                           | source responsibility/access reconciliation applies                             | protected target presentation removed; source exposes Needs assignment or declared route outcome without guessing |
| target already continuing recipient                        | successor membership remains one                                                | no duplicate task/unread; added scope appears if authorized                                                       |
| returning recipient keeps other scopes                     | only selected scopes move                                                       | their task remains with explicit retained work                                                                    |
| projection dispatch fails after source commit              | source successor remains truth                                                  | source/current-read ceiling suppresses stale row; ledger retries                                                  |
| response lost after commit                                 | receipt lookup proves result                                                    | retry disabled until lookup; no duplicate generation                                                              |
| indeterminate candidate resolver                           | no responsibility mutation                                                      | error text, Retry/source path; no zero/fallback                                                                   |
| source/DB unavailable                                      | no commit                                                                       | truthful failure; no browser/offline queued command                                                               |
| late old projection event                                  | current generation rejects regression                                           | no old assignment revival or unread pulse                                                                         |
| later legitimate transfer back                             | fresh successor command                                                         | new history; predecessor never reopened                                                                           |

## Inngest boundary

Inngest may be useful for short body-free successor task/notification
materialization and reconciliation after the source commits. It is not useful
for the human handoff decision itself.

Required sequence:

1. The synchronous source command commits the responsibility generation,
   receipt, and identifier-only outbox/dispatch intent.
2. A short worker, optionally Inngest, claims that durable product work.
3. It reloads the current source/task heads and applies a monotonic idempotent
   projection guarded by product uniqueness.
4. Recovery scans repair undispatched/dead-lettered work from product records.

D33 forbids a long-running wait for target acceptance, workflow-provider target
selection, event-payload authorization, provider-run history as audit, provider
dedupe as permanent idempotency, or cancellation/retry as responsibility truth.

## Normative D33 rules

### D33-R1 — Operational source owns responsibility

The registered operational source owns current responsibility, eligibility,
transition heads, receipts, and recovery state. Tasks Hub may initiate and
project the transition but cannot edit responsibility itself; Payload owns
content/publication facts, not staff responsibility.

### D33-R2 — Named handoff and return are distinct

A named handoff requires exactly one admitted current destination and yields a
successor responsibility generation. A return names no successor and preserves
all other current recipients; it yields **Needs assignment** and records
**Returned for reassignment** only when nobody remains, rather than claiming a
named reassignment.

### D33-R3 — Transition grain is exact source-action scope

The source moves only the actor-selected, still-active Source-action scopes it
can prove. It never silently moves the whole task, sibling action, recipient,
episode, candidate, Site, or future recurrence.

### D33-R4 — Initiator authority and destination eligibility are separate

The ability to return or hand off current work is a source operation distinct
from the ability to receive and perform it. Current responsibility, capability,
directory visibility, manager status, or task possession alone satisfies
neither side.

### D33-R5 — Commit re-proves every current fact

The source command derives the actor and scope from trusted context and re-
proves the current source/action heads, initiator operation, destination
Party+role eligibility, visibility, capability, identity, independence,
policy, governance, and authorization epochs at commit.

### D33-R6 — Browsing is non-mutating

Opening, loading, searching, paging, selecting, deselecting, backing out,
closing, disconnecting, or timing out writes no responsibility, engagement,
task, notification, or audit-success fact.

### D33-R7 — Zero, Needs assignment, and unknown never collapse

Proved-zero eligible destinations, an explicit Needs-assignment source state,
and partial/indeterminate resolver failure remain separate typed results. None
creates an implicit person, group, queue, administrator, coordinator, return,
or fallback.

### D33-R8 — Successor generations are complete and immutable

One winning transition appends the complete successor responsibility set and
ended predecessor memberships all-before-any. It never patches a mutable
recipient array or leaves omitted members semantically ambiguous.

### D33-R9 — Differential engagement is conserved

Unchanged recipients retain the same assignment/engagement lineage; removed
recipients end with a typed source reason; new recipients alone receive fresh
assignment and unread identities. No read, archive, list position, or personal
organization transfers.

### D33-R10 — Returned work remains discoverable

Every source contract admitting return defines the exact current authorized
source recovery surface before return activates. Any continuing recipients
remain responsible; when none remain, Needs assignment survives task
projection, notification, Inngest, and candidate-search failure and never ages
out or completes itself.

### D33-R11 — Assignment grants no access

Selection and successor membership create no Tenant assignment, role,
capability, Site/source/content visibility, Page/Navigation edit authority,
review independence, publication, Giving, finance, or external-review access.

### D33-R12 — Candidate projection is purpose-minimized

The picker returns only currently enumerable eligible Party+role destinations
and the smallest lawful disambiguators. It exposes no ineligible roster,
exclusion reason, workload, protected source content, email, hidden capability,
other task, or cross-Tenant identity.

### D33-R13 — One consequence-led responsive surface

**This needs someone else** is a visible secondary action. One Base Maia
responsive subview supplies scope, eligible destination selection or explicit
return, exact impact, Back/Cancel, and one final source command; there is no raw
inline assignee edit or nested confirmation maze.

### D33-R14 — Context follows by reference

D33 stores no generic free-text handoff explanation, comment, feedback copy,
attachment, mention, due date, reminder, or email before D34. Any later reason
or source-specific evidence requires a ratified purpose, minimum,
authorization, retention, privacy, and UX contract.

### D33-R15 — History tells the exact outcome

Named successor, no-successor return, source completion, inapplicability,
access loss, projection delivery, and technical execution remain separately
labelled facts. Target/actor identity is displayed only under current purpose
authorization.

### D33-R16 — Product idempotency binds canonical meaning

The source assigns a durable semantic command identity covering operation,
predecessor head, selected scope digest, destination/recovery outcome, and
contract version. Same identity and meaning returns one receipt; changed
meaning hard-conflicts beyond any provider dedupe window.

### D33-R17 — Expected heads decide races

One documented source lock order and expected-head CAS decides handoff, return,
source completion, source cancellation, manager reassignment, access/policy
change, and concurrent successor selection. Losers display current truth and
write no substitute transition.

### D33-R18 — Protected detail remains reference-only

Task, transition, event, outbox, notification, search, analytics, AI, export,
cache, trace, and workflow payloads carry only versioned safe identifiers/codes.
Protected explanation, anchor, content, member-care, donor, finance, or
personal-circumstance detail stays with its owning source and retention class.

### D33-R19 — Database scope is structural

Composite Tenant/environment/source relations, immutable heads/members/receipts,
one-current/one-active uniqueness, restrictive deletion, least grants, forced
RLS where applicable, operation-correct `USING`/`WITH CHECK`, and trusted actor
derivation make invalid cross-scope/result combinations impossible.

### D33-R20 — Every privileged seam has policy parity

Browser, API, Server Action, RPC, service role, owner, definer, worker, support,
repair, import, export, Realtime, cache, AI, and old-client paths all deny
generic reassignment and repeat current source/authorization scope checks.

### D33-R21 — Inngest is optional projection execution

The source transaction commits the responsibility receipt and durable outbox
intent. Inngest may execute short identifier-only materialization or
reconciliation, but never enumerates candidates, waits for a human, accepts a
handoff, owns state, or supplies permanent idempotency/audit.

### D33-R22 — Candidate reads and projections are production-bounded

Candidate lookup is lazy, cursor-paged, cancellable, indexed, Tenant-fair, and
free of per-row source/body calls. Resolution is complete within a declared
source ceiling; overflow/partial results release nothing and never truncate.

### D33-R23 — Migration denies old writers first

Policy-aware readers, source-current ceilings, generic mutation denial, and
same-scope constraints deploy before any source-backed handoff writer. No
historical transition is inferred from mutable assignees, task events, comments,
profiles, notifications, content edits, worker runs, or timestamps.

### D33-R24 — No generic bulk, automation, or routing intelligence

D33 adds no bulk reassignment, automatic leave detection, timer, escalation,
round robin, workload routing, team queue, watcher, acceptance workflow,
delegation chain, AI recommendation, or Tenant-authored rules language. A
future source-specific mass transition requires its own impact and proof.

### D33-R25 — Accessibility and low-friction proof block Live

Keyboard, screen reader, focus, text/error/status semantics, 320px and 400%
reflow, 44 CSS-pixel important controls, forced colors, reduced motion,
Unicode/CJK/RTL, duplicate names, no avatar, mobile safe areas, offline/weak
network, and representative staff comprehension/task-success evidence are
release gates.

### D33-R26 — Cross-domain reuse preserves source meaning

Website, Mobilize, finance, Support, and later producers may reuse the
transition vocabulary only through an admitted source contract. They do not
share recipient routes, protected facts, retention, action authority, or a
generic assignment service that flattens their domain meanings.

## Full adversarial review by required category

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes — staff need an escape from wrong responsibility, but
the wrong solution makes Tasks Hub a second source.**

| What could go wrong                                                                                                                             | Why it matters                                                                                                                | Severity | Likelihood | Evidence label/reasoning                                                                                                                                                                                                      | Effect on answer                                                          | Permanent fix                                                                                        | Exact rule/spec language                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------: | ---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Core could retain administrator-only correction, add a generic task assignee picker, or build a queue instead of solving source responsibility. | The first increases ministry delay and side-channel work; the others create dual truth, guessed recipients, and privacy risk. |     High |       High | **Repository fact:** D31 projects source responsibility; Mission Control must reduce manual glue. **External fact:** Asana supports assignee self-reassignment while Jira separates assigner and assignable-user permissions. | Accepts Option 1 but requires source ownership and two explicit outcomes. | Use one source-validated action with named handoff and no-successor return; retain source discovery. | **D33-R1–R4:** “Responsibility changes only through the source; Tasks Hub presents but never owns the transition.” |

### 2. Brittleness

**Material concern: Yes — a person shown as eligible can become ineligible
before commit, and one task may contain several action scopes.**

| What could go wrong                                                                                                                       | Why it matters                                                                             | Severity |  Likelihood | Evidence label/reasoning                                                                                                                                                                 | Effect on answer                                          | Permanent fix                                                                                                      | Exact rule/spec language                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------: | ----------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| A stale picker assigns a person after access/policy/source change, or silently transfers Page and Navigation when only Page was intended. | Wrong staff see work, the right work is stranded, and histories cannot explain what moved. | Critical | Medium-high | **Repository fact:** D31 has typed action subsets and current authorization heads. **External fact:** Salesforce rejects approval reassignment when the destination lacks record access. | Narrows handoff to selected scopes and commit-time proof. | Bind the command to exact scope digest, predecessor/source heads, destination Party+role, and current eligibility. | **D33-R3, R5, R17:** “Displayed eligibility is advisory; the source re-proves every selected scope and destination at the winning CAS.” |

### 3. Technical debt

**Material concern: Yes — current task models invite source-name conditionals
and mutable-assignee patches.**

| What could go wrong                                                                                                        | Why it matters                                                                                                                      | Severity | Likelihood | Evidence label/reasoning                                                                                                | Effect on answer                                              | Permanent fix                                                                                                                     | Exact rule/spec language                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------: | ---------: | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Developers reuse `assignee_profile_id`, browser staff lists, `source_module` checks, or app-local dialogs for each domain. | Every surface develops different eligibility, history, race, and privacy behavior; later Mobilize work becomes expensive to repair. |     High |       High | **Current source:** task schema/UI have generic mutable assignees; **OpenSpec:** repeated business logic must converge. | Changes the architecture, not the selected product direction. | One versioned source transition contract and shared policy-aware Base Maia composition; source-specific resolvers stay behind it. | **D33-R1, R8, R13, R26:** “No producer implements responsibility through task-field mutation or source-name UI branching.” |

### 4. Edge cases

**Material concern: Yes — zero, unknown, co-responsibility, partial scopes,
duplicate names, return, and recurrence all differ.**

| What could go wrong                                                                                                                                                                              | Why it matters                                                                 | Severity |     Likelihood | Evidence label/reasoning                                                                                             | Effect on answer                                                       | Permanent fix                                                                                                                 | Exact rule/spec language                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | -------: | -------------: | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Empty search is treated as zero; selecting an existing co-recipient duplicates their item; returning ends unrelated scopes; duplicate-name users are confused; later transfer revives old state. | Staff lose work, see duplicates, or hand private work to the wrong human/role. |     High | High aggregate | **Repository fact:** D19/D21/D31 already distinguish complete-zero/indeterminate and immutable differential handoff. | Requires an explicit state/outcome matrix and action-specific preview. | Typed resolver union; role-qualified identity; differential generation; source successor identities; action-specific preview. | **D33-R2–R3, R7–R10, R15:** “Every edge outcome has one typed source meaning and never borrows another outcome's label or lifecycle.” |

### 5. Footguns

**Material concern: Yes — reassignment can be triggered outside the visible
handoff panel.**

| What could go wrong                                                                                                                                                  | Why it matters                                                              | Severity |                   Likelihood | Evidence label/reasoning                                                                                             | Effect on answer                                               | Permanent fix                                                                                                               | Exact rule/spec language                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------: | ---------------------------: | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Inline avatar edits, bulk menus, drag/drop, keyboard shortcuts, imports, APIs, AI, support tools, old clients, or an empty candidate response mutate responsibility. | Hiding one UI control leaves a complete integrity and authorization bypass. | Critical | High unless centrally denied | **Current source:** admin task drawer directly edits assignee; broad service-role grants bypass browser constraints. | Strengthens server-only source command and deny-first rollout. | Operation registry and database constraints reject generic task reassignment at every seam before any D33 writer activates. | **D33-R6–R7, R20, R23–R24:** “No task mutation or resolver result is a responsibility transition.” |

### 6. Tenant safety

**Material concern: Yes — candidate enumeration and successor links can cross
Tenant, environment, Site, or role boundaries.**

| What could go wrong                                                                                                                                      | Why it matters                                                                                      | Severity |                         Likelihood | Evidence label/reasoning                                                                                              | Effect on answer                                           | Permanent fix                                                                                                                                           | Exact rule/spec language                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------: | ---------------------------------: | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A forged profile UUID, shared cache, ambiguous Party/profile match, support path, or worker attaches another Tenant's person or exposes that they exist. | It leaks ministry/staff data and silently moves required work out of the organization that owns it. | Critical | Medium without structural controls | **OpenSpec fact:** Tenant isolation is structural. **Current source:** standalone profile FK is not Tenant-composite. | Requires composite scope and purpose-filtered enumeration. | Same-Tenant/environment composite relations, stable Party+role identity, partitioned/no-store projections, current auth, and hostile cross-scope tests. | **D33-R5, R12, R18–R20:** “Every candidate, transition, projection, cache, and privileged path proves identical Tenant/environment/source scope.” |

### 7. Database, RLS, and authorization safety

**Material concern: Yes — an allowed update could move a permitted row into a
forbidden recipient/scope state.**

| What could go wrong                                                                                                                                  | Why it matters                                                                                          | Severity |                              Likelihood | Evidence label/reasoning                                                                                                                                                        | Effect on answer                                                    | Permanent fix                                                                                                                                         | Exact rule/spec language                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------: | --------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Caller controls Tenant, actor, role, action set, target, reason, timestamp, policy, or resulting assignment; service/owner/definer paths bypass RLS. | A seemingly authorized user or worker can manufacture responsibility and audit evidence or cross scope. | Critical | High if current task update is extended | **Repository fact:** current task tables have broad service-role grants and no policies; **PostgreSQL reasoning:** `USING` and `WITH CHECK` protect different mutation aspects. | Adds a hardened single mutation boundary and structural invariants. | Append-only generations/receipts, immutable columns, exact grants, forced RLS, trusted context, expected-head source command, privileged-path parity. | **D33-R5, R8, R16–R20:** “Callers submit intent only; server/source context derives every authority and audit fact, and both existing and resulting scopes are constrained.” |

### 8. Overengineering

**Material concern: Yes — flexibility could grow into delegation, availability,
queue, acceptance, and routing-rule products.**

| What could go wrong                                                                                                                                                     | Why it matters                                                                                              | Severity |  Likelihood | Evidence label/reasoning                                                                                   | Effect on answer          | Permanent fix                                                                                                        | Exact rule/spec language                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------: | ----------: | ---------------------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| D33 adds acceptance, watchers, claims, leases, shifts, due dates, out-of-office inference, round robin, skills/workload ranking, arbitrary groups, or tenant workflows. | The simple recovery path becomes a speculative workflow engine, delays delivery, and obscures source rules. |     High | Medium-high | **Repository fact:** Phase 34 owns broader workflow direction; D31 rejects a Tenant-authored workflow DSL. | Narrows D33 deliberately. | Ship direct named person handoff and explicit return only; future source-specific mechanisms require separate proof. | **D33-R14, R21, R24, R26:** “D33 SHALL NOT create a generic delegation, queue, acceptance, automation, or routing-intelligence system.” |

### 9. UX/UI and user friction

**Material concern: Yes — safety can become a nested-modal, admin-heavy, or
opaque experience that staff avoid.**

| What could go wrong                                                                                                                                                                                         | Why it matters                                                                                                                                 | Severity |                             Likelihood | Evidence label/reasoning                                                                                                                                                                          | Effect on answer                                                | Permanent fix                                                                                                                                                                            | Exact rule/spec language                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------: | -------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The escape is hidden; the picker lists everyone; multiple scopes are unclear; two confirmations repeat; mobile focus breaks; success only appears in a toast; return promises an owner that does not exist. | Staff keep wrong tasks, message colleagues outside Core, or make mistaken transfers; small ministries bear disproportionate coordination cost. |     High | High without the specified composition | **Product judgment:** the path must be easier than side-channel coordination. **Repo:** Base Maia Sheet/task detail patterns. **W3C:** accessible combobox and clear input/error/status behavior. | Accepts Option 1 only with one visible consequence-led surface. | Visible **This needs someone else**, exact scope/context, filtered candidate search, explicit return, one confirmation, persistent result, focus preservation, comprehensive state copy. | **D33-R13, R15, R25:** “A staff member can understand and complete a lawful handoff or return in one responsive surface without interpreting task/source internals.” |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes — ‘source’ could be misread as Payload or the task row
instead of the operational Website workflow.**

| What could go wrong                                                                                                                 | Why it matters                                                                                             | Severity |                         Likelihood | Evidence label/reasoning                                                                                                                                     | Effect on answer                            | Permanent fix                                                                                                                                             | Exact rule/spec language                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------: | ---------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Payload gains operational assignees, Tasks Hub becomes responsibility truth, or a projection receipt is treated as Website success. | CRM/CMS ownership splits, audit/reporting drift, and source correction can disagree with the visible task. | Critical | High without an explicit owner map | **OpenSpec:** CRM owns operational workflows/permissions; CMS owns public content/publishing. **ADRs 0181/0183:** source owns actionability and consequence. | Clarifies the meaning of source validation. | Website operational source in Asym Postgres owns responsibility head/transition; Payload supplies only its content facts; task references source receipt. | **D33-R1, R11, R15, R21:** “Neither CMS/task/executor state writes or certifies operational responsibility.” |

### 11. Hidden coupling

**Material concern: Yes — Tasks Hub could import every domain API or provider
schema to populate and commit the picker.**

| What could go wrong                                                                                                   | Why it matters                                                                                                               | Severity |  Likelihood | Evidence label/reasoning                                                                                         | Effect on answer                    | Permanent fix                                                                                                                                   | Exact rule/spec language                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------: | ----------: | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Generic task UI calls Payload Local API, Page/Navigation internals, Mobilize tables, or provider identities directly. | Domain upgrades break task UX; a platform component gains privileged operational knowledge and becomes hard to replace/test. |     High | Medium-high | **Platform boundaries:** shared behavior converges but sources retain authority; Payload runtime stays isolated. | Rejects direct generic integration. | One typed source options/read/transition adapter returning safe destination projections and exact receipts; source packages own implementation. | **D33-R1, R12, R18, R26:** “Tasks Hub composes a source contract and never imports provider/domain truth as a generic assignee model.” |

### 12. Failure modes

**Material concern: Yes — source success, projection success, response
delivery, and target notification can fail independently.**

| What could go wrong                                                                                                                                                       | Why it matters                                                                                    | Severity | Likelihood | Evidence label/reasoning                                                                                                  | Effect on answer                                                                    | Permanent fix                                                                                                                                                | Exact rule/spec language                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------: | ---------: | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Source commits but response/task projection fails; task changes but source did not; retry duplicates; candidate service is unavailable; return loses recovery visibility. | Maria or Amélie may both act, neither may discover work, or staff may repeat a committed command. | Critical |     Medium | **Workflow OpenSpec:** product ledger/claims recover handoff failure; **D31/D32:** source current state wins projections. | Requires synchronous receipt plus asynchronous convergence and truthful failure UX. | Atomic source+outbox, receipt lookup before retry, current-source read ceiling, monotonic projection, dead-letter/reconciliation, permanent source recovery. | **D33-R6–R10, R16–R17, R21:** “Every partial failure preserves one source truth and has a body-free idempotent roll-forward path.” |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes — completion, two handoffs, return, manager action,
access change, and delayed events can race.**

| What could go wrong                                                                                                                                                | Why it matters                                                                        | Severity |  Likelihood | Evidence label/reasoning                                                                                     | Effect on answer                                     | Permanent fix                                                                                                                                                       | Exact rule/spec language                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | -------: | ----------: | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Two valid actions jointly create two current owners, stale handoff overwrites completed work, old projections revive, or retries with a new target reuse identity. | Current responsibility, unread counts, source action, and audit become contradictory. | Critical | Medium-high | **Repository precedent:** D25–D32 use expected-head CAS, semantic receipts, immutable successor generations. | Strengthens source command and lifecycle precedence. | One lock order/current head, canonical semantic identity, same-meaning replay, changed-meaning conflict, monotonic reducers, new generation for every reverse move. | **D33-R8–R9, R16–R17:** “Every race converges to one source head; no losing command, delayed event, or retry regresses it.” |

### 14. Data integrity risks

**Material concern: Yes — mutable assignee fields cannot preserve partial
scope, reason, predecessor, or continuing-recipient history.**

| What could go wrong                                                                                                                                                          | Why it matters                                                                      | Severity |                    Likelihood | Evidence label/reasoning                                                                                                                       | Effect on answer                      | Permanent fix                                                                                                                                          | Exact rule/spec language                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------: | ----------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Updating one profile ID erases who returned what, duplicates target assignments, resets co-recipient unread, moves unrelated scopes, or labels no-successor work Reassigned. | Repair and reporting become unreliable and staff cannot reconstruct responsibility. | Critical | High if current schema reused | **Current source:** task table has one nullable assignee and untyped JSON events. **D31:** responsibility is generation/member/action-grained. | Requires additive relational lineage. | Complete immutable generations/members, typed transition receipt/result, action-scope membership, one-current/active uniqueness, no inferred backfill. | **D33-R2–R3, R8–R9, R15, R23:** “The data model SHALL represent the exact transition rather than infer it from before/after assignee values.” |

### 15. Security and privacy risks

**Material concern: Yes — a people picker and handoff context can expose staff,
feedback, ministry, donor, or personal-circumstance data.**

| What could go wrong                                                                                                                                                                                  | Why it matters                                                                            | Severity |            Likelihood | Evidence label/reasoning                                                                                                | Effect on answer                                   | Permanent fix                                                                                                                                           | Exact rule/spec language                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------: | --------------------: | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search enumerates hidden/ineligible people or exclusion reasons; handoff copies D30 text, emails, leave/health reasons, source bodies, donor/member-care facts, or names into events/logs/AI/export. | Sensitive information spreads beyond source purpose and outlives authorization/retention. | Critical | Medium over lifecycle | **D30/D31:** protected feedback is reference-only. **Contentful caution:** assignee APIs can omit target-access checks. | Narrows candidate facts and rejects generic notes. | Purpose-filtered safe projection, no ineligible enumeration, identifier-only transport, source detail reload, sink tests, purpose retention/quarantine. | **D33-R12, R14, R18–R20:** “Candidate and transition surfaces SHALL reveal/store only minimum source-approved facts under current purpose authorization.” |

### 16. Scalability and performance risks

**Material concern: Yes — eligibility search can become an N+1 authorization
scan or truncate large Tenants unsafely.**

| What could go wrong                                                                                                                                                     | Why it matters                                                                | Severity | Likelihood | Evidence label/reasoning                                                                                                                         | Effect on answer                                                                    | Permanent fix                                                                                                                                              | Exact rule/spec language                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------: | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Opening every row prefetches directories; each candidate calls sources; offset pages drift; large tenants starve small ones; overflow is truncated and called complete. | Picker becomes slow/unreliable and unsafe shortcuts admit or hide candidates. |     High |     Medium | **D31:** complete bounded routing, cursor pagination, 50 outer execution ceiling; **product judgment:** candidate UX bounds need pilot evidence. | Adds lazy bounded query and measurable budgets without inventing a universal count. | Indexed set-based eligibility, cursor paging, cancellation, actor/source partitioning, no row prefetch, all-or-none result semantics, tenant-fair workers. | **D33-R12, R22, R25:** “Candidate discovery SHALL be production-bounded without truncation, N+1 source/body access, or authorization shortcuts.” |

### 17. Operational burden

**Material concern: Yes — returned work, stale projections, and failed handoffs
could require direct SQL or support impersonation.**

| What could go wrong                                                                                                                                                               | Why it matters                                                                           | Severity |                          Likelihood | Evidence label/reasoning                                                                                                            | Effect on answer                                   | Permanent fix                                                                                                                                                      | Exact rule/spec language                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------: | ----------------------------------: | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Nobody can find Needs assignment, operators inspect private bodies or edit assignees, failed projection requires developer repair, or departure triggers one-by-one unsafe edits. | Small ministries depend on support and work remains stranded; privacy/audit are damaged. |     High | Medium-high without recovery design | **Repository fact:** source discovery and workflow reconciliation are durable patterns; current task model invites manual mutation. | Makes source recovery and runbooks a precondition. | Permanent permission-filtered Needs-assignment view, owner-only safe source commands, body-free diagnostics, idempotent replay, no direct completion/assignee SQL. | **D33-R10, R18, R20–R24:** “Every returned/drift state SHALL remain discoverable and repairable through audited source-derived roll-forward.” |

### 18. Observability and auditability gaps

**Material concern: Yes — ‘handoff succeeded’ can ambiguously mean source,
task projection, notification, or worker success.**

| What could go wrong                                                                                                                                          | Why it matters                                                                                           | Severity |              Likelihood | Evidence label/reasoning                                                                  | Effect on answer                                  | Permanent fix                                                                                                                                              | Exact rule/spec language                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | -------: | ----------------------: | ----------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| UI/metrics say Amélie received work from a task update or Inngest success; audit lacks predecessor/target/scope/head; access loss is logged as reassignment. | Staff trust false delivery, incident diagnosis fails, and performance reports punish people incorrectly. |     High | High without vocabulary | **ADR facts:** source, projection, engagement, delivery, and executor state are distinct. | Adds three evidence planes and typed result copy. | Source transition receipt; body-free task projection audit; technical telemetry with causal IDs; delivery wording only after its own proof; no HR scoring. | **D33-R15–R18, R21:** “Only the source receipt proves responsibility; projection and execution outcomes are named separately.” |

### 19. Dependency and integration risks

**Material concern: Yes — Payload, directory, authorization, Realtime, or
Inngest outages and schema changes can be mistaken for responsibility truth.**

| What could go wrong                                                                                                                                                                                 | Why it matters                                                                        | Severity | Likelihood | Evidence label/reasoning                                                                                                                          | Effect on answer                           | Permanent fix                                                                                                                                                         | Exact rule/spec language                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------: | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Provider/event identity becomes the key; Payload outage blocks operational audit; Inngest replay duplicates a successor; directory schema change admits profiles; missing event leaves stale tasks. | Vendor/runtime replacement becomes dangerous and work can be misassigned or orphaned. |     High |     Medium | **OpenSpec:** orchestrator not truth; CMS/CRM separated. **Inngest:** transport idempotency is defense-in-depth, not permanent business identity. | Keeps integrations behind owned contracts. | Operational source records/receipts, stable Party+role references, identifier-only outbox, product claims/uniqueness, current reproof, replaceable executor/adapters. | **D33-R1, R16–R22, R26:** “No external schema, event, cache, or run may define, authorize, or certify a responsibility transition.” |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes — old clients and three incompatible task systems can
write or misread new responsibility semantics.**

| What could go wrong                                                                                                                                                                                          | Why it matters                                                                        | Severity |              Likelihood | Evidence label/reasoning                                                                                   | Effect on answer                                               | Permanent fix                                                                                                                                                       | Exact rule/spec language                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | -------: | ----------------------: | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New policy rows coexist with old mutable assignee UI/API; migration infers handoffs from last profile/timestamp; dual writes diverge; rollback deletes successor history; unknown source version fails open. | False assignments and privacy/history defects survive deployment and future upgrades. | Critical | High without sequencing | **Current repo:** prototype task collection, contribution task table/service, and missionary tasks differ. | Requires additive one-writer rollout and no inferred backfill. | Denial/readers first; unknown-version fail closed; shadow eligibility; canary one Website contract; writer fence; source-surface kill switch; roll-forward history. | **D33-R20, R23:** “Old writers cannot touch source-backed responsibility before D33 data exists, and rollback never rewrites a committed source transition.” |

### 21. Testability, traceability, and proof

**Material concern: Yes — a happy-path picker test cannot prove authorization,
scope conservation, races, migration, accessibility, or source ownership.**

| What could go wrong                                                                                                                                                                                  | Why it matters                                                                   | Severity | Likelihood | Evidence label/reasoning                                                                                             | Effect on answer                                | Permanent fix                                                                                                                                                     | Exact rule/spec language                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------: | ---------: | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Tests mock a staff list and assert displayed names while API/RPC/worker/old-client paths accept forbidden targets; multi-scope or response-loss races duplicate history; keyboard/mobile flows fail. | The feature appears complete while it remains unsafe and unusable in production. |     High |       High | **Repository rule:** test public seams and trace OpenSpec; **W3C:** semantic interaction/focus/error proof required. | Adds falsifiable criteria and release evidence. | Acceptance portfolio below covering positive/negative/boundary/auth/RLS/privacy/concurrency/failure/migration/a11y/performance/comprehension with stable D33 IDs. | “Every D33 rule SHALL trace decision→glossary→ADR→OpenSpec→design→ticket→implementation→test→release evidence without semantic drift.” |

### 22. Other development hazards

**Material concern: Yes — handoff can become an access, publication,
performance-management, or generic AI-routing mechanism.**

| What could go wrong                                                                                                                                                                                                                                      | Why it matters                                                                                                 | Severity |       Likelihood | Evidence label/reasoning                                                                                               | Effect on answer                                        | Permanent fix                                                                                                                                                              | Exact rule/spec language                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------: | ---------------: | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Selection grants access; changing responsibility publishes content or changes Giving; return counts against staff; AI chooses people; bulk departure tooling moves sensitive work without per-source proof; acceptance creates duplicate responsibility. | Cross-domain harm, chilling staff behavior, and ministry distrust result despite a locally convenient feature. | Critical | Medium aggregate | **Platform principles/boundaries:** permission and operational truth outrank convenience; AI has human authority only. | Adds absolute non-effects and humane usage constraints. | No source/public/money/permission effect, no task-derived staff KPI, no autonomous target choice, no generic bulk/acceptance, exact source authorization for every action. | **D33-R11, R14, R20, R24–R26:** “D33 responsibility transitions SHALL create no independent access, content, publication, Giving, finance, HR, AI, or workflow effect.” |

## Acceptance criteria

### Decision, ownership, and vocabulary

1. **D33-AC001 — Selected direction.** D33 records Option 1 with the named-
   handoff/no-successor-return precision amendments and no generic task
   reassignment authority.
2. **D33-AC002 — Source owner.** One registered operational source owns current
   responsibility, target eligibility, transition, receipt, and recovery.
3. **D33-AC003 — Tasks boundary.** Tasks Hub can resolve choices, preview, and
   invoke the typed source command but cannot update a source-backed assignee.
4. **D33-AC004 — CMS boundary.** Payload/CMS content and publication state never
   stores or becomes operational staff-responsibility truth.
5. **D33-AC005 — Hand-off meaning.** **Handed off** requires one committed named
   successor generation.
6. **D33-AC006 — Return meaning.** **Returned** names no successor and preserves
   every other current responsible recipient.
7. **D33-AC007 — Needs-assignment meaning.** **Needs assignment** occurs only
   when required work remains and no current responsible recipient remains.
8. **D33-AC008 — Zero distinction.** Proved-zero eligible candidates does not
   equal Needs assignment, resolver failure, completion, or return.
9. **D33-AC009 — Unknown distinction.** Partial, stale, timeout, contradiction,
   overflow, and dependency error never become zero or a successful transition.
10. **D33-AC010 — Cross-domain boundary.** Another producer reuses D33 only
    after registering its own source/action/eligibility/recovery contract.

### Entry point and staff journey

11. **D33-AC011 — Primary action preserved.** **Open Website work** remains the
    primary task action.
12. **D33-AC012 — Visible recovery action.** **This needs someone else** appears
    as a text-labelled secondary task-detail action when currently admitted.
13. **D33-AC013 — No overflow trap.** The only recovery path is not hidden in an
    icon, avatar, context menu, hover, swipe, drag, or keyboard shortcut.
14. **D33-AC014 — One surface.** Scope selection, path choice, person selection,
    consequences, Cancel/Back, and submit occur in one responsive Base Maia
    subview without nested confirmation dialogs.
15. **D33-AC015 — Exact context.** The panel names safe source, Site, locale, and
    selected action scopes without parsing task text or copying protected body.
16. **D33-AC016 — Two paths.** The user explicitly chooses named handoff or
    return; no default selection writes or pre-commits either outcome.
17. **D33-AC017 — Single-scope efficiency.** When exactly one movable scope
    exists, the UI does not add a redundant scope-selection step.
18. **D33-AC018 — Multi-scope clarity.** When several scopes may move, every
    selected and retained scope is explicit in the preview; unselected scopes
    never move.
19. **D33-AC019 — Combined-scope eligibility.** A named target can receive a
    selected set only when currently eligible for every scope; otherwise the UI
    explains that scopes must be moved separately.
20. **D33-AC020 — Consequence-led action.** The final button says **Hand off to
    [name]**, **Return this work**, or the source-localized exact equivalent.
21. **D33-AC021 — No completion confusion.** The panel states that correction
    remains open and that the transition does not mark the work done.
22. **D33-AC022 — No access confusion.** The panel states that choosing a person
    grants no new access.
23. **D33-AC023 — No public-effect confusion.** Website publication and Giving
    non-effects are visible before commit.
24. **D33-AC024 — Cancel safety.** Back, close, Escape, browser navigation, or
    cancel performs no mutation and restores logical focus/state.
25. **D33-AC025 — Persistent result.** Success/conflict/error is visible in the
    panel/current detail and history; a toast is never the sole evidence.

### Candidate discovery and identity

26. **D33-AC026 — Purpose-limited candidates.** The endpoint returns only people
    the actor may enumerate for the exact current source/scopes.
27. **D33-AC027 — Stable identity.** Every selectable destination is one stable
    same-Tenant Party+role reference, not email/display name/bare profile.
28. **D33-AC028 — Active identity.** Inactive/deleted/unresolved identities are
    not offered and cannot commit.
29. **D33-AC029 — Current Tenant assignment.** A target without the required
    current Active Tenant Assignment is not offered and cannot commit.
30. **D33-AC030 — Site/source visibility.** A target without exact current
    Site/source visibility is not offered and cannot commit.
31. **D33-AC031 — Action capability.** A target unable to perform every selected
    action is not offered and cannot commit.
32. **D33-AC032 — Source restrictions.** Independence, separation, assurance,
    policy, classification, and source exclusions are enforced independently.
33. **D33-AC033 — Initiator excluded.** The actor cannot select themselves as a
    no-op destination for their current assignment edge.
34. **D33-AC034 — Existing co-recipient consolidation.** An already responsible
    target may be selected only when the source admits consolidation; preview
    says they remain responsible and receive no duplicate task/unread.
35. **D33-AC035 — Duplicate names.** Lawful directory disambiguators make two
    identical display names unambiguous without exposing unnecessary PII.
36. **D33-AC036 — No arbitrary destination.** Email, pasted IDs, URLs, free text,
    teams, queues, roles, saved external reviewers, and cross-Tenant people are
    rejected as D33 person destinations.
37. **D33-AC037 — Neutral ordering.** Candidates use a deterministic explainable
    order and no AI/workload/popularity/availability/skill ranking absent a
    separately governed source fact.
38. **D33-AC038 — Server search.** Large eligible sets use indexed server-side
    search and cursor paging; the client never downloads the Tenant directory.
39. **D33-AC039 — Enumeration resistance.** Counts, timing, cursors, cached
    responses, errors, and guesses reveal no hidden/cross-purpose person.
40. **D33-AC040 — Query/commit separation.** A displayed option never becomes
    authority; submit re-proves current eligibility.
41. **D33-AC041 — Candidate stale.** Target eligibility loss between query and
    commit rejects with no mutation and refreshes safe choices.
42. **D33-AC042 — Choice-set scope.** Any opaque choice set is bound to actor,
    Tenant/environment, source/action scopes, contract, and expected heads and
    cannot be replayed elsewhere.
43. **D33-AC043 — Search privacy.** Search strings, hidden candidate names, and
    denial reasons do not enter logs, analytics, exports, AI, or shared caches.
44. **D33-AC044 — International identity.** Unicode, diacritics, bidi names,
    non-Western name order, long names, duplicate names, and no-avatar display
    retain accurate accessible identity.
45. **D33-AC045 — No candidate authority widening.** A route label, role name,
    capability, prior task, or profile presence alone cannot admit a target.

### Handoff, return, and engagement conservation

46. **D33-AC046 — Named handoff atomic.** One successful command ends selected
    predecessor memberships, appends one complete successor generation and
    receipt, and records projection intent atomically.
47. **D33-AC047 — Return atomic.** One successful return ends selected actor
    memberships, appends the complete successor responsibility generation and
    receipt, and records projection intent atomically.
48. **D33-AC048 — Continuing recipients.** Every unchanged recipient/action
    membership remains current with identical engagement lineage.
49. **D33-AC049 — New successor.** A genuinely new named successor receives one
    compatible assignment projection and one fresh personal unread state.
50. **D33-AC050 — Existing successor.** An existing compatible task/assignment
    receives no duplicate row, actor history merge, or unread reset.
51. **D33-AC051 — Removed predecessor.** Removed scopes end **Reassigned** for a
    named handoff and **Returned** for a no-successor return.
52. **D33-AC052 — Returned with others.** When other responsible people remain,
    the UI names that fact and does not show Needs assignment.
53. **D33-AC053 — Returned with none.** When nobody remains, the UI shows
    **Returned for reassignment** and source **Needs assignment**.
54. **D33-AC054 — Recovery discoverability.** Needs-assignment work is visible
    on the exact authorized Website recovery view even when no personal task or
    notification exists.
55. **D33-AC055 — Recovery route separation.** A separately registered source-
    recovery attention resolver may notify coordinators but cannot silently
    make them correction owners; D29 route members are never reused by name.
56. **D33-AC056 — No guessed fallback.** Return/zero/unknown never chooses an
    admin, creator, editor, coordinator, Finance queue, all staff, service
    account, or first candidate.
57. **D33-AC057 — Personal engagement isolation.** Read, unread, list position,
    collapse, archive, and permitted organization never transfer between
    predecessor, continuing, and successor people/roles.
58. **D33-AC058 — Recipient keeps scopes.** If the actor retains other scopes,
    their task stays active and says exactly what remains.
59. **D33-AC059 — Recipient loses final scope.** If no scope remains, the task
    leaves My tasks only after the source receipt/current-state read proves it.
60. **D33-AC060 — No default channels.** Handoff/return creates no email, SMS,
    push, digest, reminder, due date, target date, countdown, sound, or recurring
    notification by default.

### Database, RLS, and authorization proof

61. **D33-AC061 — Trusted actor.** Actor, Party, role, Tenant, environment, and
    server time derive from authenticated server/database context.
62. **D33-AC062 — Trusted source scope.** Source work, action scopes, current
    assignment and heads derive from server lookup, not caller audit fields.
63. **D33-AC063 — Initiator operation.** Current recipient handoff/return and
    manager reassignment are separately named source operations and tested
    independently.
64. **D33-AC064 — Assignment not operation.** Possessing or viewing a task does
    not authorize return/handoff.
65. **D33-AC065 — Management not action.** A manager who may change
    responsibility does not thereby gain permission to perform the correction.
66. **D33-AC066 — Composite scope.** Every source/head/generation/member/task/
    receipt relation structurally preserves Tenant and environment equality.
67. **D33-AC067 — One current head.** Database uniqueness or equivalent CAS
    permits at most one current responsibility generation per exact grain.
68. **D33-AC068 — One active assignment.** At most one equivalent active
    source-backed assignment exists per source work+Party+role+surface.
69. **D33-AC069 — Result combination constraints.** Named handoff requires one
    named target; return forbids a named target; Needs assignment requires zero
    current responsibility; invalid combinations cannot commit.
70. **D33-AC070 — Immutable lineage.** Predecessor, successor, scopes, target,
    kind, actor, heads, receipt, and source causal reference cannot be updated.
71. **D33-AC071 — Restrictive deletion.** Task/profile deletion cannot erase or
    cascade responsibility/source audit; governed identity retention applies.
72. **D33-AC072 — No direct grants.** Browser-authenticated roles cannot insert,
    update, or delete source responsibility/generation/receipt authority.
73. **D33-AC073 — RLS existing row.** `USING` or equivalent proves the actor may
    see/transition the existing current scoped state.
74. **D33-AC074 — RLS resulting row.** `WITH CHECK` plus source-command
    constraints prevent moving allowed work into a forbidden Tenant/source/
    recipient/policy/result.
75. **D33-AC075 — Privileged parity.** Service-role, owner, definer, RPC, worker,
    support, repair, import, export, AI, cache, Realtime, and old-client poison
    tests enforce the same boundary.

### Concurrency, failure, and idempotency proof

76. **D33-AC076 — Source end race.** Source completion before handoff wins and
    creates no successor responsibility.
77. **D33-AC077 — Handoff-before-action race.** If handoff wins, later source
    action independently rechecks current action authorization and cannot rely
    on predecessor task state.
78. **D33-AC078 — Two-target race.** Two different target commits produce one
    winner and one current-state response, never overwrite/merge.
79. **D33-AC079 — Return/manager race.** Return and manager assignment produce
    one complete winning generation.
80. **D33-AC080 — Actor revocation.** Actor authority loss at list, detail,
    preview, and commit removes/denies protected transition without fabricated
    history.
81. **D33-AC081 — Target revocation.** Target loss at query/commit rejects;
    target loss after commit follows a new source recovery transition without
    predecessor resurrection.
82. **D33-AC082 — Same-meaning retry.** Duplicate click, API retry, worker replay,
    and manual recovery return the original canonical receipt/effect.
83. **D33-AC083 — Changed-meaning conflict.** Same semantic key with changed
    scopes, target, operation, predecessor, or contract hard-conflicts.
84. **D33-AC084 — Lost response.** A lost success response is reconciled by
    product receipt lookup before any retry is enabled.
85. **D33-AC085 — Source commit/projection failure.** Source transition remains
    authoritative; stale predecessor action is suppressed; durable ledger
    retries projection.
86. **D33-AC086 — Projection-before-notification.** Independent task/unread
    materialization cannot create duplicate task or misleading delivery claim.
87. **D33-AC087 — Late predecessor event.** Old create/update/unread events cannot
    revive ended responsibility or engagement.
88. **D33-AC088 — Resolver failure.** Candidate timeout/partial/error writes no
    transition; separately proved return may remain available without relying
    on the failed result.
89. **D33-AC089 — Source outage.** Source/DB unavailable yields no browser/offline
    queued mutation and exposes current safe retry/source recovery.
90. **D33-AC090 — Inngest outage.** Synchronous source command and product audit
    remain truthful with dispatch disabled; ledger/manual recovery resumes
    projection without new source effects.

### Privacy, audit, and absolute non-effects

91. **D33-AC091 — Body-free storage.** Transition/task/event/outbox/log/cache/
    metric/search/AI/export contains no D30 explanation, anchor body, CMS body,
    donor, finance, member-care, health/leave, or hidden eligibility detail.
92. **D33-AC092 — Safe target identity.** Target/actor identity displays only
    under current purpose authorization; otherwise history uses a safe typed
    result.
93. **D33-AC093 — Success evidence.** Only the source receipt proves
    responsibility change; task projection and Inngest success are separately
    labelled technical/projection facts.
94. **D33-AC094 — Delivery evidence.** UI does not claim the successor received a
    task/notification/email until that separate delivery/presentation fact is
    authoritative.
95. **D33-AC095 — No generic note yet.** D33 collects no generic free text or
    structured reason before D34 defines purpose, minimum, privacy, retention,
    and UX.
96. **D33-AC096 — No access effect.** Handoff/return changes no membership,
    capability, source visibility, edit, review, invitation, external grant, or
    assurance fact.
97. **D33-AC097 — No content/public effect.** Handoff/return changes no content,
    candidate, review decision, publication, activation, public URL, or Live
    Website fact.
98. **D33-AC098 — No Giving/finance effect.** Handoff/return changes no Giving,
    designation, donor intent, contribution, settlement, receipt, ledger,
    accounting, bank, currency, or money fact.
99. **D33-AC099 — No AI/HR inference.** The transition does not autonomously
    choose a person or become workload, productivity, absence, performance, or
    disciplinary evidence.
100.  **D33-AC100 — No workflow inflation.** D33 creates no generic acceptance,
      claim, lease, delegation, watcher, team queue, timer, SLA, escalation,
      round-robin, skill/capacity, or Tenant-rule engine.

### Accessibility, performance, migration, and traceability

101. **D33-AC101 — Accessible picker.** Combobox/list/dialog semantics, names,
     descriptions, required/selected state, arrows, Enter, Escape, and focus
     follow shared Base UI/WAI behavior.
102. **D33-AC102 — Status/focus.** Loading, refresh, error, conflict, success,
     source end, and authorization loss receive concise text and at most one
     polite announcement without stealing focus.
103. **D33-AC103 — Reflow/touch.** 320px, 400% zoom, mobile safe areas, keyboard,
     touch, 44 CSS-pixel important targets, forced colors, and no hover-only
     interaction pass release evidence.
104. **D33-AC104 — Localization.** Long Unicode/CJK/RTL names/copy, bidi
     isolation, locale-safe collation/search, and non-Western names retain
     meaning without truncation-dependent identity.
105. **D33-AC105 — Weak network.** Slow/interrupted/offline states preserve
     selected local input only, never cached authority or optimistic success,
     and reconcile current receipt before retry.
106. **D33-AC106 — Bounded query.** Production-shaped candidate search uses
     indexed set-based authorization, cursor paging, cancellation, no N+1 body/
     source calls, and declared p50/p95/p99/query/bytes evidence.
107. **D33-AC107 — Tenant fairness.** Large/noisy Tenant candidate and projection
     load cannot starve another Tenant; no safety scope is weakened for speed.
108. **D33-AC108 — Denial-first migration.** Policy-aware readers, source ceiling,
     generic assignment denial, and constraints deploy before the first D33
     source writer/task action.
109. **D33-AC109 — No inferred backfill.** Existing assignee, queue, comment,
     task event, author, notification, content edit, worker, or timestamp never
     becomes historical D33 transition evidence.
110. **D33-AC110 — Mixed-version safety.** Old writers reject source-backed
     reassignment; new readers treat missing/unknown D33 contract as source-link
     only; unknown transition/source version fails closed.
111. **D33-AC111 — Shadow proof.** Eligibility/transition compilation runs in
     body-free shadow mode and compares with source responsibility before UI
     activation.
112. **D33-AC112 — Canary proof.** One Website action family and bounded cohort
     pass auth/privacy/race/a11y/performance/comprehension/operations evidence
     before expansion.
113. **D33-AC113 — One writer.** Runtime never dual-writes source generations,
     current task assignee, prototype task collection, missionary tasks, or CMS
     assignment.
114. **D33-AC114 — Kill switch.** Disabling Tasks Hub initiation leaves source
     recovery and committed responsibility history usable; rollback rolls
     projections forward and never deletes/reverses source receipts.
115. **D33-AC115 — Production shapes.** Tests cover 0/1/2/50 routed recipients,
     large candidate sets, multi-action/co-responsible scopes, duplicate names,
     multi-Site/Tenant/role, pagination, source outage, and revocation bursts.
116. **D33-AC116 — Representative comprehension.** At least 90% of representative
     tested staff correctly predict current owner, remaining work, source state,
     target access, public/Giving non-effects, and zero/unknown difference.
117. **D33-AC117 — Representative task success.** At least 90% complete eligible
     named handoff and return scenarios on mobile/desktop; a material role/
     device/locale gap blocks expansion.
118. **D33-AC118 — Monitor readiness.** Every named D33 signal has instrumented
     units, threshold, owner, runbook, and tested stop/repair response before
     Live.
119. **D33-AC119 — Traceability.** D33 terms, rules, states, copy, owners, numbers,
     and non-effects trace decision→glossary→ADR→OpenSpec→design→ticket→code→
     test→release evidence by D33-AC ID.
120. **D33-AC120 — Reserved gate.** D33 remains Reserved until later OpenSpec,
     design, schema, authorization, implementation, migration, security,
     accessibility, production-shaped, canary, monitor, and release evidence
     implement this same contract.

## Named monitors and required responses

These are initial canary release contracts, not claims about current traffic or
universal industry values. Zero-tolerance safety thresholds remain zero;
experience/performance thresholds must be re-baselined from recorded evidence
without silently deleting the signal.

| Signal                                                 | Initial threshold                                                                                                         | Owner                                         | Required response                                                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `source_handoff_false_success_total`                   | Any source receipt/UI success without the exact authoritative transition                                                  | Website source owner + Data Platform          | Stop writer cohort, preserve evidence, disable D33 command, reconcile from source audit, open incident.                           |
| `source_handoff_cross_tenant_total`                    | Any cross-Tenant/environment candidate read, link, transition, cache, or projection                                       | Security Incident Commander + Data Platform   | Stop-ship/incident, revoke path, contain disclosure/work loss, inspect every affected scope and privileged seam.                  |
| `source_handoff_ineligible_success_total`              | Any committed named successor failing commit-time eligibility                                                             | Website source owner + Identity/Authorization | Fence writer, inspect policy/head/authorization race, adjudicate source, repair only from authoritative receipts.                 |
| `source_handoff_wrong_scope_total`                     | Any unselected scope or unrelated recipient changed                                                                       | Website source owner + Security               | Stop affected adapter, restore truthful projection from source, inspect all same-contract transitions, add regression.            |
| `source_handoff_duplicate_successor_total`             | Any duplicate successor generation/effect for one semantic command                                                        | Data Platform                                 | Fence writer/replay, retain evidence, reconcile duplicates append-only, repair unique key/claim.                                  |
| `source_handoff_stale_head_success_total`              | Any stale assignment/source/policy/authorization head accepted                                                            | Website source owner + Data Platform          | Disable command, inspect CAS/lock order, repair affected histories from source evidence.                                          |
| `source_return_false_reassigned_total`                 | Any no-named-successor return displayed/audited as named reassignment                                                     | Tasks Product + Product UX                    | Correct typed reason/projection, audit affected reports/staff, block expansion until comprehension proof passes.                  |
| `source_return_continuing_recipient_loss_total`        | Any unchanged responsible recipient removed/reset by another person's return                                              | Website source owner + Tasks Platform         | Fence adapter, restore continuing membership/engagement from predecessor/successor receipts, add co-responsibility race proof.    |
| `source_return_routing_gap_age_seconds`                | Any critical Website scope above 4h or standard scope above inherited D31 pilot threshold of 24h                          | Tenant Website owner + Website Operations     | Inspect source recovery/discoverability/eligibility, use only authorized source assignment/recovery, never guess or add reminder. |
| `source_return_no_discovery_total`                     | Any Needs-assignment work invisible to every independently authorized source recovery surface                             | Website source owner + Security               | Stop return path, restore permission-filtered source discovery, reconcile affected scopes, review disclosure/availability.        |
| `source_handoff_projection_lag_seconds`                | p95 above 60s for 15m or any above 300s                                                                                   | Tasks Platform + Workflow Operations          | Apply current-source ceiling, recover ledger/worker, reconcile receipts, pause cohort expansion if sustained.                     |
| `source_handoff_stale_predecessor_actionable_total`    | Any ended predecessor served actionable after current source read                                                         | Tasks Platform + Authorization                | Disable affected cache/reader, suppress row, repair head reproof/invalidation, inspect attempted actions.                         |
| `source_handoff_missing_successor_task_total`          | Any newly admitted eligible successor lacks task projection after 300s                                                    | Tasks Platform + Workflow Operations          | Reconcile receipt/intent, inspect uniqueness/dispatch, preserve source responsibility and source discovery.                       |
| `source_handoff_duplicate_successor_task_total`        | Any equivalent duplicate active task row                                                                                  | Tasks Platform + Data Platform                | Suppress duplicate, preserve rows as evidence, fix active uniqueness/materializer; never alter source history.                    |
| `source_handoff_engagement_reset_total`                | Any continuing recipient unread/engagement reset or predecessor engagement transferred                                    | Notifications owner + Tasks Platform          | Correct engagement projection from immutable lineage, inspect counts, add sibling-recipient poison proof.                         |
| `source_handoff_candidate_resolver_error_rate`         | Above 1% for 15m with at least 20 attempts, excluding complete business zero                                              | Website Platform                              | Disable direct picker cohort if necessary, preserve independently safe return/source path, inspect adapter/index/auth dependency. |
| `source_handoff_command_error_rate`                    | Above 1% for 15m with at least 20 eligible attempts, excluding expected stale/ineligible rejection                        | Website Platform + SRE                        | Inspect source/DB/auth health, hold expansion, preserve current responsibility, repair before re-enable.                          |
| `source_handoff_conflict_rate`                         | Above 5% for 30m with at least 20 attempts                                                                                | Product UX + Website source owner             | Inspect stale UI/prefetch/concurrency; improve refresh/preview without weakening CAS.                                             |
| `source_handoff_churn_per_occurrence`                  | More than 3 responsibility transitions in 24h for one occurrence                                                          | Website Operations + Product Research         | Review authorized history/routing comprehension; correct source setup if needed; do not auto-lock or score staff.                 |
| `source_handoff_candidate_enumeration_violation_total` | Any hidden/cross-purpose candidate existence or detail disclosed                                                          | Security + Privacy                            | Incident review, stop resolver/cache, normalize safe denial, trace viewers/egress, add adversarial enumeration fixture.           |
| `source_handoff_protected_payload_total`               | Any prohibited name roster/source body/feedback/PII in event, log, trace, metric, cache key, search, AI, export, or email | Security + Privacy + sink owner               | Stop/quarantine sink, remove governed copies where possible, investigate propagation and retention, add negative fixture.         |
| `source_handoff_privileged_bypass_total`               | Any service/owner/definer/worker/support/import/AI path commits without equivalent product authorization                  | Security + Data Platform                      | Disable path, audit every privileged caller/transition, repair authorization and affected projections before re-enable.           |
| `source_handoff_candidate_latency_ms`                  | p95 above provisional 500ms for 15m with at least 100 eligible reads                                                      | Website Platform + Database                   | Inspect plans/indexes/paging/cache partition; optimize without truncation, stale eligibility, or broader scope.                   |
| `source_handoff_mobile_success_rate`                   | Below 90% eligible canary attempts or more than 5 points below desktop                                                    | Product UX + Web Platform                     | Investigate reflow, picker, focus, latency, copy and safe-area behavior; block expansion until repaired/retested.                 |
| `source_handoff_staff_comprehension_rate`              | Below 90% correctly predict owner, remaining source work, target access, and public/Giving non-effects                    | Product Research + Website Product            | Revise hierarchy/copy and repeat representative protocol before expansion; do not add training as the first fix.                  |
| `source_handoff_keyboard_completion_rate`              | Below 95% in moderated keyboard-only proof or any blocking defect                                                         | Accessibility owner + Web Platform            | Stop release, repair combobox/focus/status/Back behavior, independently retest.                                                   |
| `source_handoff_screen_reader_critical_total`          | Any blocker in scope, choice, consequence, result, or focus flow                                                          | Accessibility owner + Tasks Product           | Stop-ship affected surface, repair shared composition, rerun multiple assistive-technology evidence.                              |
| `source_handoff_low_bandwidth_abandonment_gap_points`  | More than 10 points above the normal source-task action in the canary slow-network cohort                                 | Product UX + Web Platform                     | Reduce request/assets, improve progressive/error state, preserve current proof; block expansion if unresolved.                    |
| `source_handoff_dead_letter_age_seconds`               | Any D33 projection dead letter unresolved above 15m                                                                       | Workflow Operations + Tasks Platform          | Assign owner, reload source receipt, replay same product claim, expose protected operational degradation under Tenant policy.     |
| `source_handoff_manual_db_repair_total`                | Any direct mutation not generated from an immutable source receipt/audited correction command                             | Data Platform + Security                      | Stop ad hoc repair, preserve incident evidence, restore through source-derived roll-forward, build missing safe repair command.   |

## Ruthless synthesis

### Resolve before recording — resolved in this decision

1. Separate named handoff from no-successor return.
2. Preserve exact selected action scope and every unchanged recipient.
3. Use Needs assignment only when no responsible recipient remains.
4. Treat zero, Needs assignment, and indeterminate as different states.
5. Make the Website operational source—not Tasks Hub or Payload—the writer.
6. Require current initiator authority and destination eligibility at commit.
7. Make the entire picker non-mutating until one consequence-led source command.
8. Preserve differential engagement and truthful source-derived history.
9. Require permanent source discoverability before return can activate.
10. Keep Inngest, email, AI, queues, acceptance, bulk movement, and workflow DSLs
    outside the source-authoritative transition.

### Capture in OpenSpec and design before implementation

1. Add a platform-boundary requirement for source-owned responsibility
   transitions initiated from shared Tasks Hub.
2. Define the closed source adapter operations for choices, preview, named
   handoff, return, current result, and receipt lookup.
3. Define exact action-scope selection/combination and current eligibility for
   each Website adapter; unsupported combinations link to the source.
4. Define immutable responsibility generation/member/transition/receipt and
   task projection relationships with Tenant/environment structural scope.
5. Define Needs-assignment source discovery and any separately registered
   recovery-attention route without reusing D29 by convention.
6. Define trusted actor/target attribution, current PDP/source heads, RLS/
   grants/privileged parity, lock order, idempotency, failure precedence,
   reconciliation, retention, redaction, and repair.
7. Specify the Base Maia responsive flow, every state/copy/focus behavior,
   international identity, accessibility, mobile, and low-bandwidth evidence.
8. Trace D33-AC001–AC120 through design, tickets, code, tests, rollout, and
   release evidence.

### Required implementation safeguards

1. Land generic assignment denial and policy-aware readers before D33 writers.
2. Preserve one source writer; never dual-write current task/CMS/prototype stores.
3. Shadow source eligibility and scope compilation before exposing the action.
4. Commit source generation, immutable receipt, and outbox intent atomically.
5. Re-prove the candidate and actor at commit; never trust list/cache/client.
6. Materialize through product claims/uniqueness; optional Inngest remains
   replaceable and body-free.
7. Use current-source read ceilings so projection lag never leaves the
   predecessor actionable.
8. Ship source Needs-assignment discovery and safe roll-forward repair before
   admitting return.
9. Canary one Website action family, then expand source by source only after the
   complete authorization/privacy/race/a11y/performance evidence passes.
10. Rollback disables initiation and rolls projections forward from receipts;
    it never rewrites accepted source responsibility history.

### Risks eligible only for monitoring

Only invariant breaks, asynchronous lag, production capacity, and user-
experience outcomes enter monitoring. The table above gives every monitored
signal a threshold, owner, and mandatory response. Authorization, Tenant scope,
source ownership, action conservation, result combinations, idempotency, and
privacy are prevention requirements with zero-tolerance monitors—not risks Core
may knowingly accept.

## Assumptions and evidence limits

- **Assumption:** ordinary recipient-initiated handoff is useful often enough
  to justify a visible secondary action. Representative nonprofit/ministry
  task-shadowing must validate this before expansion.
- **Assumption:** direct internal successor assignment is less burdensome than
  acceptance. The selected D33 option already commits an immediate source
  successor; representative testing must still measure surprise and return
  churn.
- **Assumption:** source-approved candidate lists are generally small enough for
  a searchable single-select composition. Do not freeze page size or ranking
  from this assumption.
- **Verified repository fact:** current task UI/schema cannot satisfy D33; D33
  remains Reserved and docs-only.
- **Verified external fact:** current products make reassignment familiar but
  differ materially in access, ownership, queue, and initiator rules.
- **Product judgment:** Core should borrow interaction familiarity while using
  stricter source authority, no access grant, exact scopes, immutable lineage,
  and honest no-owner recovery.
- **Unresolved unknown:** whether handoff/return should collect a structured
  reason or note. That is the one D34 question below.

## Required documentation reconciliation

- Amend ADR-0183 through D33 with source-owned named handoff/no-successor return,
  exact-scope differential generations, and typed **Returned** / **Needs
  assignment** outcomes.
- Amend ADR-0181 with Website operational-source responsibility transition and
  protected-feedback reference-only behavior.
- Preserve ADR-0182 as the specialized candidate-review lane precedent; never
  reuse its D29 Review-coordinator route for correction work by convention.
- Add **Source responsibility transition** and **Needs assignment** to
  `CONTEXT.md`, and amend **Source-backed task** to reject assignee authority.
- Add a subsequent-D33 note to D31 and D32 research/review artifacts so return
  does not appear as a named reassignment or universal Needs-assignment outcome.
- Extend the Phase 34 roadmap note: a future Mobilize task may expose only its
  exact source-owned responsibility command, not generic Tasks Hub assignment.
- Reserve OpenSpec/schema/runtime/ticket activation for the later `/to-spec`
  and implementation workflow; this Grill records product truth only.

## Exact decision to record

> D33 accepts **Source-validated return or handoff**. A source-backed task may
> show **This needs someone else** as a visible secondary action. One responsive
> source-led panel lets the current recipient select exact movable Source-action
> scopes and either name one currently eligible person or return without naming
> one.
>
> Opening/searching/selecting is non-mutating. One expected-head source command
> derives the actor, re-proves initiator authority, target eligibility, scopes,
> current source/policy/authorization heads, and atomically appends the complete
> successor responsibility generation, immutable receipt, and identifier-only
> projection intent.
>
> A named handoff ends the selected predecessor memberships as **Reassigned**
> and keeps/adds the named successor without duplicate assignment or unread. A
> return ends the actor as **Returned**, preserves every other current
> responsible recipient, and uses **Returned for reassignment** plus source
> **Needs assignment** only when nobody remains. It never guesses a fallback.
>
> Assignment grants no access. Tasks Hub, Payload, notifications, browser state,
> task fields, comments, AI, and Inngest do not own or certify responsibility.
> Continuing recipients retain engagement; new recipients alone receive fresh
> engagement; source detail remains reference-only. No email, reminder, target
> date, acceptance workflow, bulk reassignment, public/Giving/finance effect, or
> generic delegation/routing DSL is created.
>
> Proved zero, Needs assignment, and indeterminate remain separate. Resolver
> uncertainty never mutates. Returned work remains on a current authorized
> source recovery surface, and every partial failure converges from the source
> receipt through product-owned idempotency and optional short Inngest
> projection/reconciliation.

## D34 — What context should staff provide when returning or handing off work?

### Why this needs a decision

The source already records the actor, exact action scopes, current state, and a
named successor when one exists. Requiring prose for every ordinary handoff
adds friction and invites sensitive explanations about health, leave,
performance, or conflict. But a return that leaves work in **Needs assignment**
may be much easier to triage if recovery staff know whether the task reached the
wrong person, needs a different role, or cannot currently be taken.

### Hope Ministries example

Maria can hand the French Page correction directly to Amélie with all relevant
Website context still attached by source reference. No explanation may be
needed. If Maria instead returns it with nobody remaining, should Core require
or invite context for the person who later assigns it?

### Option 1 — context only when it changes recovery — recommended

- Named eligible successor: no required reason or note.
- Return that leaves another responsible person: no required reason.
- Return that creates **Needs assignment**: require one short code-owned reason
  choice such as **Not the right person**, **Needs a different role**, **Cannot
  take this work**, or **Another reason**.
- No generic free-text note is collected; source context remains reference-only.
  A later source-specific note would require separate evidence and governance.

**Staff experience:** the common handoff stays one decisive interaction;
recovery receives enough structured meaning to triage without demanding
personal prose or creating a comment system.

**Impact:** lowest routine effort, useful recovery data, bounded localization/
analytics, and lower privacy/retention risk than free text.

### Option 2 — require context for every transition

Every named handoff and return requires one structured reason, with an optional
concise private note.

**Staff experience:** uniform and auditable, but obvious handoffs gain a
mandatory step and staff may choose meaningless reasons or disclose personal
details merely to proceed.

**Impact:** more reporting consistency at the cost of friction, privacy, copy,
retention, moderation, and weak-quality data.

### Option 3 — collect no user-provided context

Every transition relies only on source scopes, predecessor, destination,
trusted actor, heads, and timestamps.

**Staff experience:** fastest and most private, but ownerless returns offer no
structured clue for recovery and repeated misrouting is harder to understand.

**Impact:** simplest data model, weakest recovery triage.

### Recommendation and exact question

**My recommendation is Option 1 — context only when it changes recovery.** It
keeps named handoff as low-effort as modern work tools while asking for bounded
meaning only when the transition creates an actual source responsibility gap.

Do you choose **Option 1 — context only when it changes recovery**, **Option 2
— context for every transition**, or **Option 3 — no user-provided context**?
You may amend any option.

## Subsequent D34 resolution

D34 accepts conditional context with a narrower permanent contract. Named
handoff and a return that leaves another responsible recipient collect no
context. Only a recipient-initiated return whose authoritative post-state
creates **Needs assignment** requires one unselected, code-owned **Return
recovery context**: `responsibility_mismatch` (**This work belongs with someone
else**), `cannot_take_current_work` (**I can't take this work**), or `other`
(**Something else**). No prose, note, default, Tenant customization, or copied
D30 feedback exists.

The context is a self-reported recovery hint only. It participates in the
source receipt's canonical meaning but never changes authorization, eligibility,
routing, scope, priority, time, notification, completion, publication, Giving,
finance, HR, member care, or person analytics. The operational source owns and
retains it; Tasks Hub references rather than copies or interprets it. See
[`phase-24-d34-conditional-return-recovery-context-adversarial-review.md`](./phase-24-d34-conditional-return-recovery-context-adversarial-review.md).

## Subsequent D35 resolution

D35 makes one permission-filtered Website **Needs assignment lane** the
complete source-owned recovery surface and permits an optional Tenant-only
policy naming one to three Website work-recovery coordinators. The route is
distinct from D21/D29, grants no access, and releases personal source-backed
task assignments only to the complete currently qualified subset. There is no
Site override, broadcast, fallback, shared unread, generic task completion,
claim, email, reminder, or target date. The first D33 expected-head source
assignment/end receipt alone ends applicable lane and coordinator projections.
See [`phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md`](./phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md).
