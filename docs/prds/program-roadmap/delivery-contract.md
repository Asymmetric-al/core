# Shared program delivery contract

Adopted 2026-09-22; planning and required future acceptance, not executed runtime evidence.

### Shared delivery requirements

<a id="roadmap-before-implementation"></a>

#### Before implementation

Read the phase's current PRD/OpenSpec and accepted owner decisions, relevant tickets and nearest `AGENTS.md`. Classify existing code as a durable pattern, useful precedent, temporary bridge, implementation accident or source conflict before reuse. A familiar route or schema is evidence, not proof that the target behavior is complete. Do not reticket or reopen Phases 1–26 to absorb later scope.

For each consuming capability, record the actual owner/command, exact subject and scope, required version, current permission, input/output meaning, classification, effect identity, failure/unknown behavior, evidence and safe recovery. Proposed module/table/API names are orientation until reconciled with the repository. No missing source is replaced by a locally invented authority or an unlabelled provider fallback.

<a id="roadmap-architecture-and-data"></a>

#### Architecture and data

**Core ownership.** Asym Postgres owns CRM and operational truth. Payload is private editorial machinery behind the authorized CMS boundary. Providers execute or store their defined effects/artifacts; they do not own Asym business meaning. Supabase Auth and the established Phase 12 capability decision point remain the identity and permission authorities.

**Repository boundaries.** Use the existing Bun/Turborepo/Next.js workspace. Shared business operations belong in `packages/api`; app routes remain thin. Preserve the approved admin-local Payload exception and inject its adapter instead of importing admin runtime into shared packages. Browser data uses approved `packages/database` collections/hooks. Shared controls belong in `packages/ui` with the exact base-maia/Base UI design language and semantic tokens.

**Client state.** TanStack Query owns authorized server projections and invalidation; Table/Virtual support lists; Store may own local interaction state; Form supports qualified form sessions. Use TanStack DB where an approved collection is needed, not as another server-command writer. React Flow and Puck hold presentation interaction state, not competing business records. Context changes clear old private projections and fence late responses.

**Mutation and execution.** Derive actor/tenant/environment and source scope from trusted context. Validate permissions and expected revisions at the consequential boundary; preserve same-scope references, database constraints and required atomic state/receipt/outbox commits. Keep remote work outside short transactions. Reuse the shared Inngest infrastructure, durable dispatch and claims. Provider concurrency is not a database lock, and provider retries are not permanent business deduplication.

**Facts and privacy.** Preserve purpose, classification, source time, completeness, Legal Entity and currency wherever meaningful. Unknown is not zero or false. Apply protection to detail rows, counts, searches, URLs, logs, files and derived conditions. Executor envelopes/step outputs must not carry private records, message bodies, code archives, signed URLs or secrets. Only the source may approve a less-sensitive projection.

<a id="roadmap-one-product-experience"></a>

#### One product experience

Give each user the task and next action appropriate to their role. Reuse navigation, record shells, saved views, grids, tasks, file controls and source error vocabulary. Required native behavior must work without a custom workflow. Responsive layouts, keyboard/screen-reader access, non-color status, single-pointer alternatives to dragging and safe poor-network interaction are baseline phase requirements—not finishing work deferred to Phase 39.

Public content uses the existing exact-public projection and publication boundary; authenticated donor, missionary and participant work stays in the owning application. Native website forms, workflow forms and application evidence have different purposes even when they reuse controls. Do not combine their storage or permission meaning for UI convenience.

<a id="roadmap-proof-rollout-and-recovery"></a>

#### Proof, rollout and recovery

Deliver narrow but complete user-visible slices with red-green-refactor at the owning seam. Use contract tests, real database tests for material isolation/transactions/races, actual source/provider qualification and browser/accessibility evidence. A mock, structural fixture, schema check or passing documentation test cannot substitute for required source behavior.

Discover the applicable repository-pinned commands at implementation. The relevant gates include OpenSpec validation, typecheck, lint, unit tests, data/public-CMS boundary verification, migration checks, real-stack/browser tests, accessibility and CI preflight. Record exact commands, versions, fixtures, results and any unresolved requirements; never label skipped required evidence as passing.

Release only proved capability profiles. Keep definition publication, tenant enablement, build availability, business acceptance and actual live confirmation distinct. Include a retained-data census, version compatibility, scoped rollout/containment, source-linked recovery and a representative user pilot. Restoration must preserve accepted effects, revocations, holds and retained history; re-enable outward effects only after reconciliation.

**Definition of done.** The intended user completes the phase's actual job through the real owners; its required scope, adverse cases, accessibility, operational limits, migration and recovery are proved; documentation and source mappings are current; and no unqualified required path is hidden behind a successful-looking placeholder.

<a id="roadmap-phase-index"></a>

### Cross-product completion

Completion is measured by connected user outcomes, not independent screens. The following checks preserve the program’s existing scope and the essential handoffs between products.

| **Outcome**                          | **Phases**                | **Completion check**                                                                                                                                                                                                                     |
| ------------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Giving and donor self-service        | 13–21, 25                 | Contribution and recognition facts feed the correct documents, statements, recurring controls, Wallet and financial projections. Historical imports do not mint receipts or restart consent.                                             |
| Donor and missionary stewardship     | 27, 28, 34, 35            | A gift or accepted relationship change produces the intended permitted follow-up once, while native tasks work without custom workflows. Goals, commitments, received gifts and finance plans remain distinct.                           |
| Mobilization and event participation | 34, 41, 37                | Common forms/tasks/access are reusable; application evidence and human decisions remain application-owned; registration/capacity remain event-owned. Plain registration and ordinary applications avoid unnecessary mutual dependencies. |
| Care and safe handoff                | 10, 29, 34, 38, 41        | Sealed care is invisible to unauthorized viewers; only the approved determination reaches an application. Crisis communication has a tested alternative.                                                                                 |
| Web authoring and code development   | 22–24, 29, 31, 42         | Standard visual content work succeeds without Git; a custom redesign passes independent admission and exact release, then staff continue editing. Native CMS is independent of optional Studio automation.                               |
| Documents and migration              | 18, 21, 29, 30            | Private source bytes, generated evidence and staging remain distinct. Imports use reviewed plans, retained provenance, exact source acceptance and safe reversal.                                                                        |
| Reporting and assistance             | 9, 30, 33, 40             | Reports and assisted answers share the same permission-aware source definitions and coverage. Suggestions are reviewed before an authorized source commit.                                                                               |
| Shared platform surfaces             | 8, 9, 12, 17, 31          | Saved views/grids, CRM tasks, audit, job health, messages and integrations are reused. SSO and view-as behavior follow their accepted identity/permission contracts.                                                                     |
| Field reality                        | 28, 34, 39, 41, 42        | Each product ships its baseline mobile/accessibility behavior. Only named field actions become offline-capable; money, approval, private evidence and CMS publication do not.                                                            |
| Public intake and communication      | 6, 17, 23, 26, 28, 31, 32 | One public form occurrence has one primary outcome; message purposes and suppression remain source-owned. Text-to-give is a qualified source-coded checkout link, not another payment channel.                                           |
| Governed SMS communication           | 6, 12, 17, 26, 31, 32, 43 | A qualified source notice, conversation, organization campaign and source-coded giving-link response preserve exact recipient permission, withdrawal, delivery uncertainty and one communication history.                                |
| Enterprise staff identity            | 4, 12, 31, 44             | Organization sign-in, safe existing-account transition, directory changes and repeat deactivation preserve current tenant-scoped authority, sensitive re-attestation, recovery and unrelated identities.                                 |
| Personal/shared dashboards           | 9, 12, 33                 | Staff compose real reports and lists while every viewer receives only current authorized source data; sharing, caching, filters and export cannot widen access.                                                                          |

<a id="phase-44-integration-proof-that-must-not-be-lost"></a>

#### Integration proof that must not be lost

**WS-INT-01 — NHI owner ceiling.** Reduce the NHI owner’s permission after publish, then deactivate the owner before a queued action fires. Both cases deny the affected action; an ordinary operator cannot revive it by republishing.

**WS-INT-02 — Public intake single occurrence.** Replay one P23 form submission while Support intake is unavailable. One accepted public occurrence and one primary intent remain; independent acknowledgement is not treated as case creation. Later source recovery creates at most one case.

**WS-INT-03 — Source generation publication.** Approve exact acknowledged candidate A, then change its required public expected head, selected-input eligibility or current authorization before an old workflow requests publication. Web Studio Operations refuses that stale request and leaves the public generation unchanged. The control case creates a later private draft B without changing A’s required proof: B stays excluded, and A may still publish under its valid exact D25/D1 owner contract. A newer private draft alone neither silently replaces nor automatically invalidates the reviewed candidate.

**WS-INT-04 — No unsafe prototype actions.** Import a draft containing stripe_replay, payment_state_correction or arbitrary status/role writes. Catalog, compiler, command and replay paths reject it; no old route is selected as fallback.

**WS-INT-05 — Semantic envelope minimization.** Put an email address or reference answer under an innocuous context key, and return it from a failed step. New Studio DTOs reject unknown context fields and transport/log/step-state tests show no raw content.

**WS-INT-06 — Native/Studio shared effect.** Native P28 and optional P35 request the same thank-you purpose concurrently, including a replay after 24 hours. One source task/effect remains; distinct intentional organization and missionary messages still work when separately authorized.

**WS-INT-07 — Source outcome after cancellation.** Cancel before source admission, then separately cancel after transport admission with a lost response. The first sends nothing; the second remains uncertain until valid source evidence is recorded, without restarting the run or dropping that evidence.

**WS-INT-08 — Application identity and amendment.** Two applications belong to one Party. Add an interview to only one and change its future form revision. The other application, prior submissions and completed sends remain unchanged; unrelated reference tokens cannot access either.

**WS-INT-09 — Participant principal qualification.** An applicant is also a donor and an external referee has a task link. Each session reads/submits only its admitted purpose. Neither link nor role switch obtains staff grants, another person’s draft or general missionary data.

**WS-INT-10 — Non-drag complete authoring.** Using keyboard and separately a single pointer without dragging, create a branch, reorder a step, edit recipient, validate and publish. Errors receive focus and semantics; actual configured node components pass manual assistive-technology review.

**WS-INT-11 — No future-phase exit cycle.** Resolve the scoped delivery graph with P41 mobilization and P35/P37/P38 pack adapters unavailable. P34 CORE can qualify using its real non-mobilization source tracers; MOBILIZATION and downstream pack/FULL evidence remain incomplete. No core import, fixture, registry startup or acceptance dependency requires those missing domain owners.

**WS-INT-12 — Care existence and trace path.** With real sealed-source fixtures, compare ordinary-admin library, counts, facets, search, audit, My Work, exports and provider-safe diagnostics before/after creating a care run. No unauthorized existence signal appears.

**WS-INT-13 — Owner vocabulary and output privacy.** A permitted workflow condition refers to a field forbidden as an outbound action payload. It may not send that field or a revealing derived boolean; the actual P10/P11/P12 catalog controls both doors.

**WS-INT-14 — Backfill and purpose-current restore.** Import historical gifts, merge a Party and restore a pre-send backup. No new welcome, recurring authorization, access grant or disposed record is recreated; source tombstones and enrollment lineage govern recovery.

**WS-INT-15 — Application source authority is not workflow state.** Complete a task or finish a run without an accepted P41 decision. The applicant remains undecided; no appointment, account access, financial setup, readiness or deployment is inferred. Then a properly authorized exact-evidence P41 decision is observable through the shared run.

**WS-INT-16 — Event integration without a phase cycle.** Run a plain registration profile with P41 unavailable; P37 preserves its own qualified capacity and registration behavior. An application-required profile refuses admission until its exact P41 source contract is qualified. A P41 application independent of an event completes without P37.

**WS-INT-17 — Clinical boundary and required evidence.** An ordinary application proceeds without clinical care. A tenant-selected plan requiring a clinical determination blocks while that exact P38/provider purpose is unqualified. A later permitted determination supplies only a safe source reference/outcome; raw notes and sealed existence are absent from ordinary staff, participant, workflow and provider diagnostics. No missing capability is treated as a waiver.

**WS-INT-18 — Old plan, new application, corrected evidence.** Publish a new workflow, withdraw one application, receive late evidence, then reapply. The new application has explicit lineage and fresh enrollment; old messages/decisions do not replay. Previously accepted evidence is reused only under a current source-qualified equivalence rule. A correction to historical completion creates linked remediation, not silent history rewrite.

**WS-INT-19 — Full mobilization handoff.** Using BP-04/BP-05 semantics, complete server-saved application, required reference categories, interviews, permitted screening, conditional decision, current agreement signatures, preparation and source-owned operational setup. Final readiness and receiving-owner acknowledgment must both be recorded; missing required evidence prevents completion. Accepted, onboarded, ready and deployed remain separately source-backed.

**HA-INT-01.** Disable/uninstall P42 while qualified P23 native CMS still saves and publishes; no missing module import or startup registration blocks it.

**HA-INT-02.** Remove Git credentials and custom build service; WEB-VISUAL still completes create/edit/media/reuse/preview/publish/schedule/recover against a standard admitted renderer.

**HA-INT-03.** Disable optional Workflow Studio enrollments and its UI; fixed native Web Studio autosave/publication/overdue recovery still operate.

**HA-INT-04.** Ordinary initiator departure leaves a valid D13 organization appointment eligible, explicit appointment invalidation blocks it, and a revoked NHI grant denies a separate Studio action.

**HA-INT-05.** Inject a failure after content write but before receipt/outbox commit; no acknowledged partial save remains. Lose a committed response and recover the original receipt exactly once.

**HA-INT-06.** Both supported same-user tabs and an isolated composer send stale revision/lease/channel messages; only current authorized scope can save and prior work is preserved.

**HA-INT-07.** A valid v1 Page and Article load/save/render unchanged with v2 available; illegal third-level, nested Hero/reuse and unknown schema are rejected without dropping acknowledged nodes.

**HA-INT-08.** A custom redesign hardcodes the registered headline: actual field-to-render tests block compatibility. Correct it, activate, and have staff change the same field successfully without Git.

**HA-INT-09.** An App callback for another installation/repository and a stale post-reconnect webhook cannot bind, build, disclose source or reactivate an old epoch.

**HA-INT-10.** A hostile postinstall tries token, cloud metadata and private-network access, poisons cache and weakens submitted tests; independent build/admission boundaries hold.

**HA-INT-11.** New code is available but not active; then one locale head drifts during design approval. Current Sites do not switch merely from deployment and all-or-none activation refuses stale input.

**HA-INT-12.** Candidate A stays A after unrelated draft B; withdrawn media blocks A. Missing candidate routes never fall through to Live or perform actual giving/form effects.

**HA-INT-13.** Source is disconnected while editorial work continues; safe retained artifacts and content survive. Incomplete artifact-use evidence blocks purge; no source database overwrites CMS content.

**HA-INT-14.** Real staff complete every admitted non-drag pointer and keyboard task after redesign at narrow/zoomed layout, recover a lost save, and distinguish Saved from Published.

<a id="phase-44-dispatch-and-release-checklist"></a>

#### Dispatch and release checklist

Before a phase is dispatched, reconcile actual owners and ticket overlap, settle its listed decisions, record required source capabilities and select independently testable slices. Before a capability is enabled, attach exact contract/database/browser/provider/user evidence, source recovery and the approved activation profile. Before claiming the whole phase complete, check every scoped feature and referenced recipe/journey—not just the final integration demonstration.

The program retains separate CORE, MOBILIZATION, GIVING, EVENTS and CARE checkpoints, plus WEB-VISUAL, WEB-SOURCE and WEB-HYBRID. FULL is the workflow-program evidence rollup. None of the downstream or combined checkpoints can be a prerequisite of its own foundation. Capability-specific gates are not permission to waive required functionality; the affected capability remains explicitly incomplete until qualified.

<a id="roadmap-source-guide"></a>

### Terminology and source guide

| **Term**                                 | **Meaning in this roadmap**                                                                                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Party                                    | Canonical CRM person, organization or household identity under the accepted Core glossary. A login, donor role and provider customer remain distinct linked concepts.              |
| Tenant / Site / locale / Legal Entity    | Different scope dimensions. A Site is not a merchant or financial owner; a locale is exact content/context, not permission to substitute another language.                         |
| Owner                                    | The domain that defines a fact, its authorized write path, conflicts and recovery—not simply the team displaying it.                                                               |
| Source capability                        | A real, versioned owner operation or projection with current authority and evidence. A symbolic name or feature flag does not prove implementation.                                |
| Projection                               | A permission- and purpose-bounded view of source facts. It is not another source of truth.                                                                                         |
| Receipt / idempotency                    | Durable evidence of an accepted operation; retry of the same semantic request returns or reconciles that result without repeating the effect.                                      |
| Expected revision / CAS                  | A change succeeds only if the relevant version still matches; concurrent or stale work is surfaced rather than silently overwritten.                                               |
| Claim / fence / epoch                    | Bounded ownership and monotonically changing generations that stop stale workers, sessions or callbacks from committing new effects.                                               |
| Workflow / application / registration    | Coordination, application decisions and event participation are separate source concepts. Completing one does not establish the others.                                            |
| Task / evidence / decision               | Work to perform, information accepted by its owner, and an authorized business determination. A checkbox cannot replace required evidence or approval.                             |
| Workflow Studio / Web Studio             | The shared process builder uses React Flow; website composition uses the qualified Puck adapter. They reuse infrastructure but do not share executable business grammars.          |
| D1 / D9 / D10 / D12 / D13 / D25          | Existing Web Studio contracts for public generations, package admission, complete-cohort design activation, acknowledged drafts, exact appointments and private review candidates. |
| Built / Live / Confirmed                 | Implemented code, actual deployment/use and verified live behavior are separate evidence claims. Planning, prototypes and structural test reports do not establish them.           |
| Outcome unknown                          | The effect may already have occurred. Reconcile original evidence before any further attempt; a timeout is not proof of non-execution.                                             |
| SMS operating profile                    | One exact provider/account/sender/market/purpose combination qualified for supported behavior. It is not worldwide channel availability or a mutable permission flag.              |
| Enterprise sign-in / SCIM                | Federated authentication and directory provisioning are separate functions. Neither creates business authority without the existing Phase 4/12 source acceptance.                  |
| Directory generation / lifecycle receipt | Scope and accepted transition identity that distinguish a repeated event from a later real deactivate/reactivate/deactivate cycle.                                                 |
| Dashboard sharing                        | Sharing configuration permits no additional underlying data. Each widget and export re-proves the current viewer or recipient’s source access.                                     |

<a id="phase-44-implementation-authority"></a>

#### Implementation authority

The Core repository is the implementation home: Asymmetric-al/core. Read root CONTEXT.md and AGENTS.md, the nearest scoped instructions, the accepted phase PRD and ticket set, and the governing OpenSpec/ADR contracts. Program discovery lives in docs/prds/sitestacker-parity/roadmap.md and phase-map.md; keep their phase architecture congruent on adoption. Current accepted source contracts control over older roadmap examples or provisional physical names.

Particularly relevant existing boundaries include ADR-0001 (Core Postgres CRM authority), the data-access-boundary guide, the shared workflow-orchestration specification and the Web Studio D1–D36 contract. Previously identified Phase 23 tickets #1350, #1365, #1366 and #1367 own immutable generation, package admission, rendering/review and complete-cohort activation. Later-phase work consumes those owners; it does not rewrite or duplicate their earlier obligations. Bind the exact accepted Phase 26 intake contract before a consuming integration is dispatched rather than guessing an interface.

<a id="phase-44-planning-sources-used-for-this-document"></a>

#### Planning sources used for this document

**Program roadmap and developer handoffs.** The supplied complete program roadmap, phase mappings, integration decisions and phase-scoped handoffs establish the retained phase architecture and later-phase scope. Their substantive obligations are integrated into the phase chapters and registers above rather than left as revision overlays.

**Workflow Studio — Full Implementation Specification.** Its product, language, runtime, security, source-binding, rollout and acceptance chapters govern the shared Studio. The Core workflow and automation catalog supplies the 96 recipes; the Implementation backlog supplies WS-01–WS-26; reference definitions supply BP-01–BP-16 and FORM-01–FORM-04. The application split and source-scoped checkpoints in this roadmap govern delivery ownership.

**Asym Web Studio — Hybrid Authoring, Workflows and Automation.** The supplied master specification and its UX/composition, workflow and automation companions provide HW-001–HW-048, WF01–WF18, AU01–AU12, HA-1.1–HA-6.4 and Q01–Q09. HA-A1–HA-A4 are adopted as the scoped Phase 42 successor planning contracts in the hybrid Web package; their implementation and qualification gates remain open. The short companions are sections of the same scope, not extra products.

**Validation reports.** The supplied reports describe structural/reference checks only. They explicitly do not establish Core runtime, database, browser, provider or production correctness. This roadmap retains that distinction; no test count in it is a claim that future product acceptance has passed.

This document consolidates the supplied planning record. It does not invent missing fixture bytes, allocate new ADR numbers or certify a provider. AL-1892 adopts and reconciles repository planning and issues; unresolved implementation decisions remain explicit. Reverify changing dependency/provider facts when an implementation depends on them; retain source-derived requirements rather than substituting generic guidance.

<a id="roadmap-extended-communication-and-enterprise-identity-integration-contracts"></a>

### Extended communication and enterprise identity — integration contracts

These contracts connect the complete Phase 43 and Phase 44 products to existing phase owners. They add no third new phase and do not reopen Phases 0–26. The current detailed predecessor contracts remain authoritative; an unavailable provider or unimplemented source keeps only its dependent capability unavailable. All previously specified workflow recipes, web journeys, implementation mappings and acceptance obligations remain required.

<a id="phase-44-source-boundary-and-delivery-map"></a>

#### Source-boundary and delivery map

| **Owner / consumer**                    | **Required connection**                                                                                 | **Independence and protected boundary**                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phases 3, 4, 9, 10 and 12               | Exact identity, phone, purpose, classification, principal, assignment and current capability            | No phone/email/group-name inference; existing privacy/safety/entity floors still win; new phases do not implement another PDP                                           |
| Phases 6 and 17 → 43                    | Governed recipient intent/history plus explicitly admitted system-message SMS steps                     | Legacy/evidence-only generations stay inert; human replies/campaigns remain outside the system-message catalog; email is not blocked by an optional SMS profile         |
| Phase 26 → 43                           | Existing conversation, internal-note, routing, collision, quarantine and retention contracts            | Two-way SMS is a channel extension built here, not a new inbox or a change to the frozen Phase 26 ticket set                                                            |
| Phase 31 minimum → 43 / 44              | Exact scoped connection, credential, rotation, authenticated ingress and recovery                       | Framework and unrelated connectors do not wait for SMS, SAML or all public API resources                                                                                |
| Phase 28 and Phase 32                   | Shared lower-level native newsletter primitives; separate missionary and organization campaign products | Phase 28 remains complete without Phase 32; external audience restrictions are not weakened by either new channel                                                       |
| Phase 32 email foundation → 43 outreach | Exact organization campaign occurrence, reviewed content/audience and source outcome correlation        | Phase 32 email remains independently complete; only its SMS adapter consumes SMS-CHANNEL, avoiding an all-channel completion cycle                                      |
| Phases 5 and 13 → 43 text-to-give       | Qualified public source-coded checkout link and current designation resolution                          | No charge, recurring authorization, receipt, identity claim or marketing permission from a text request or link scan                                                    |
| Phase 33                                | Current-viewer dashboard/report projections, communication outcomes and identity health                 | Shared configuration never shares underlying data; operational counts cannot disclose sealed or unauthorized identity/connection records                                |
| Phase 34 and domain packs               | Qualified optional message actions and live NHI human-owner authority                                   | Native channel safety/deactivation is not a tenant workflow; CORE does not wait for either new phase; new channels do not activate all recipes                          |
| Phase 41 / Phase 37                     | Optional permitted participant reminders and source-owned staff access                                  | SSO admission is not application acceptance or seat admission; phone contact does not disclose private evidence                                                         |
| Phase 38                                | Current sealed-care boundaries and qualified minimal handoffs only                                      | No ordinary SMS transmission of clinical/restricted context; enterprise administrator status cannot unseal care                                                         |
| Phase 39                                | Online identity/channel authority; cleared or fenced stale private projections                          | No offline consent enrollment, access grant, SMS dispatch or provider reconnection; cached data never overrides revocation                                              |
| Phase 40                                | Safe source-linked explanations or drafts through existing review                                       | No credentials/assertions/private messages in generic model context and no AI consent, group grant or unsupervised send                                                 |
| Phase 42 / existing Web Studio          | Shared current session/PDP and source-specific publication rules                                        | IdP control is not Git repository authority; composer leases do not survive revoked editing authority; valid organization appointments follow their own source contract |

<a id="phase-44-minimum-capability-graph"></a>

#### Minimum capability graph

The node names below are delivery checkpoints, not new services, numbered phases or feature flags. An arrow means the source capability must be proved first. Existing phase-level hard dependencies and all inherited source floors still apply. The graph prevents final acceptance for a consumer from becoming the prerequisite for its own foundation.

| **Checkpoint**      | **Immediate required capabilities for this extension**                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| P31-CONNECTION-MIN  | Qualified existing identity/permission and communication foundations; no Phase 43/44 dependency                  |
| P32-NATIVE-CAMPAIGN | Existing Phase 32 starting dependencies, exact recipient/editor/Phase 6 delivery; no SMS dependency              |
| P33-DASHBOARDS      | Existing Phase 33 semantic/report/list/projection contracts; no new identity or SMS dependency                   |
| SMS-CHANNEL         | P31-CONNECTION-MIN; exact Phase 3/4/6/9/10/12/17 phone, purpose and source-proof gates                           |
| SMS-CONVERSATIONS   | SMS-CHANNEL; qualified Phase 26 conversation/reply contract                                                      |
| SMS-OUTREACH        | SMS-CHANNEL; P32-NATIVE-CAMPAIGN for campaigns; exact Phase 5/13 public checkout for text-to-give                |
| P43-COMPLETE        | SMS-CHANNEL, SMS-CONVERSATIONS and SMS-OUTREACH with all required profile evidence                               |
| ID-SIGNIN           | P31-CONNECTION-MIN; exact Phase 4/12 binding, session, PDP and recovery substrate                                |
| ID-DIRECTORY        | ID-SIGNIN's qualified binding substrate; SCIM protocol, grant-state, source ordering and causal-revocation proof |
| ID-OPERATIONS       | ID-SIGNIN and ID-DIRECTORY; exact selected downstream source checks and production-shaped recovery evidence      |
| P44-COMPLETE        | ID-SIGNIN, ID-DIRECTORY and ID-OPERATIONS for the selected provider matrix                                       |

**A capability may be implemented earlier than a checkpoint completes.** For example, SCIM protocol work can proceed beside the sign-in UI once the common source-binding substrate is ready. No profile is live merely because its source SDK is installed, a table exists, or a configuration checkbox is visible.

<a id="phase-44-cross-product-acceptance-scenarios"></a>

#### Cross-product acceptance scenarios

**Each scenario below is specified, not executed.** It supplements, rather than replaces, the existing WS-INT and HA-INT catalogs and the cases inside Phases 32, 33, 43 and 44.

| **Scenario**                              | **Required integrated outcome**                                                                                                                                                                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EXT-INT-01 — Proof-gated successor        | Keep the preserved Phase 17/P12 foundation profile active, then separately qualify one new profile. Old paths stay unavailable; the exact new purpose works without activating unrelated reserved seams.                                        |
| EXT-INT-02 — No connector cycle           | With Phase 43/44 modules absent, the Phase 31 connection foundation and unrelated source integration still operate; text-to-give and enterprise-specific consumers remain honestly unavailable.                                                 |
| EXT-INT-03 — Newsletter independence      | With Phase 32 external sync and all SMS disabled, Phase 28 native newsletters and organization email's qualified source path remain usable; no background dependency imports the missing module.                                                |
| EXT-INT-04 — Recipient withdrawal race    | Prepare a Phase 32 SMS campaign and withdraw one phone-purpose before Phase 6 admission. That effect is suppressed once, remaining eligible work is attributable, and no email/alternate-provider fallback is inferred.                         |
| EXT-INT-05 — Requested giving link        | An unmatched phone requests a keyword. Only the explicitly qualified public response is sent; checkout still validates source context and no Party, application, marketing series or payment is created by the request.                         |
| EXT-INT-06 — IdP leaver and automation    | Deactivate the human owner of an active workflow grant. Phase 12 denies applicable access and future owner-dependent actions; phase operators see source-safe repair without automatic grant succession.                                        |
| EXT-INT-07 — Organization appointments    | Deactivate a routine initiator while a qualified Web Studio D13 organization appointment exists. Its own current source/appointment policy decides execution; explicit invalidation still blocks and no generic workflow exemption is invented. |
| EXT-INT-08 — Tenant-scoped identity       | One human has staff access in tenant A and donor/other-tenant access elsewhere. Directory deprovisioning in A cannot merge, delete or transfer those other authorities or expose their records.                                                 |
| EXT-INT-09 — Shared dashboard revocation  | Share a dashboard containing communication and identity widgets, then remove one viewer's source permission. Names, totals, cached output, drill-through and scheduled export cannot reveal the removed scope.                                  |
| EXT-INT-10 — Care boundary                | A directory administrator and SMS support agent encounter restricted material. Neither elevated labels nor a new channel disclose sealed existence; the accepted sensitive handoff remains minimal and source-controlled.                       |
| EXT-INT-11 — Restore with adverse history | Restore data from before a STOP and an IdP deactivation. New positive effects remain stopped until restriction, identity and attempt evidence is reconciled; no resend or revived access occurs.                                                |
| EXT-INT-12 — User-visible completion      | Real staff complete organizational email, a source-qualified SMS conversation/campaign, enterprise sign-in/provision/deprovision and current-viewer dashboards without learning a second CRM, message history or permission system.             |

<a id="phase-44-repository-adoption-and-dispatch"></a>

#### Repository adoption and dispatch

**Planning adoption is not implementation.** Add the approved new phase chapters and the Phase 32/33 responsibilities to the repository roadmap and mirrors only through a reviewed documentation change. Preserve the existing numbered architecture, frozen phase commitments, current accepted ADR/OpenSpec meaning and original issue identifiers. New SMS/identity successor decisions require their own approved records; do not silently edit the historical text of issues #892 or #686, reuse their closed scope as a new feature ticket, or fabricate already-created child issues.

Before dispatch, bind each package and acceptance case to the actual source symbol, schema/version, owner and relevant existing ticket. Explain which old-generation guard remains, which exact qualified successor becomes possible, and how the negative tests evolve without disappearing. No placeholder API, unqualified service-role write, profile-name grant or guessed provider behavior may satisfy this binding map. If an active repository change already owns the compatible work, extend it rather than create a competing specification.

**One audit trail for completion.** Record authored, accepted specification, ticketed, implemented, locally tested, provider-qualified, enabled and observed-live evidence separately. Current research inspected the consolidated roadmap, selected predecessor tickets/PRDs, repository instructions and auth/email code at develop commit 7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd. This is a targeted integration review, not verification of every repository file, every Phase 1–26 implementation or any production deployment. That source compilation established no product runtime, database/provider integration test, GitHub mutation or live activation. The current adoption ledger separately records actual repository and issue edits.

<a id="roadmap-communication-and-enterprise-identity-research-and-source-register"></a>
