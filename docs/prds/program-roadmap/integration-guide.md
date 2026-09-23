# Program integration guide

Adopted and reconciled 2026-09-22. Read with the exact owner contracts and effective Studio packages.

This part makes the complete roadmap and the two detailed Studio proposals usable together. **It preserves the source specifications rather than silently rewriting them.** The phase assignments below come from the complete roadmap. The narrowly identified qualification checks come from the dated research refresh. A proposed interface, policy, limit, or source binding remains a proposal until its owning contract is accepted and its implementation is proved.

The original specification packages use local decision numbers, work-package numbers, and source-reference labels. Read them within their own part: Workflow Studio `D11` is not Web Studio `D11`; `WS-19` is not Phase 19; `HA-1.3` is an implementation package, not an allocated ADR. The roadmap's 45 phase numbers and stable slugs remain unchanged.

<a id="ig-01"></a>

### IG-01 — One workflow engine, separately accountable business products

**Effective allocation: the complete roadmap's Workflow recipe register and work-package allocation.** The original Workflow Studio proposal describes the entire workflow program together; it does not move all its business domains into Phase 34.

| Delivery owner                                        | Complete responsibility                                                                                                                                                                      | Recipes | Full specification and examples                                                                                             |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------: | --------------------------------------------------------------------------------------------------------------------------- |
| [Phase 34](../sitestacker-parity/roadmap.md#phase-34) | Shared authoring, typed language/compiler, execution, tasks/forms, limited participant primitives, operations, simulation, publication, amendments, and qualified common/source coordination |      57 | [Workflow Studio specification](../workflow-studio/README.md); generic blueprints such as BP-01, BP-10, BP-11, BP-14, BP-16 |
| [Phase 41](../sitestacker-parity/roadmap.md#phase-41) | Application identity, accepted application/reference evidence, screening/decision interfaces, conditions, agreements, preparation, readiness, and receiving handoff                          |      12 | MOB-01–MOB-12; BP-04/BP-05; application/reference form bindings                                                             |
| [Phase 35](../sitestacker-parity/roadmap.md#phase-35) | Source-certified contribution, recognition, and recurring-support stewardship                                                                                                                |      15 | DON-01–DON-13 plus MPD-01/MPD-06                                                                                            |
| [Phase 37](../sitestacker-parity/roadmap.md#phase-37) | Registration/capacity, trip readiness, and post-event coordination                                                                                                                           |       3 | GEN-10–GEN-12; BP-12                                                                                                        |
| [Phase 38](../sitestacker-parity/roadmap.md#phase-38) | Sealed care coordination and sensitive handoff                                                                                                                                               |       9 | CARE-01–CARE-08 plus GEN-18; BP-09                                                                                          |
| Combined evidence                                     | All required source, shared, and individual pack evidence                                                                                                                                    |      96 | FULL is an evidence rollup, not a prerequisite of CORE                                                                      |

A recipe's owner is not proof that every service it names already exists. Bind each trigger, fact, task, evidence request, communication, and action to an exact current source operation. A missing source keeps its affected capability incomplete; it must not be replaced by a mock, an arbitrary table write, or a locally invented financial/clinical approval.

The original blueprint labels remain intact. BP-04/BP-05 require the Phase 41 application domain; they cannot serve as the only proof that Phase 34 works. The roadmap requires real non-mobilization intake/shared-task and private-document/review tracers for CORE. Mobilization follows CORE as a prioritized delivery lane, not because 41 numerically follows 40.

<a id="ig-02"></a>

### IG-02 — Automation authority is current, scoped, and owner-bound

The proposal's tenant automation grant must use the existing Phase 12 non-human identity contract. It is **not** a second authorization engine, an ownerless tenant service role, or a snapshot of the publisher's former permissions. The NHI's allowed actions remain bounded by its own grants and the accountable human owner's **current** resolved capabilities. A departed or revoked owner cannot continue authorizing future work merely because a template is still published. This constraint is explicit in the repository's principal-foundation ticket. [NR-CORE-03](source-research.md#nr-core-03)

Keep publisher, initiator, operator, responsible assignee, independent reviewer, participant, and executor distinct. Transferring a template or assigning a task does not grant source-record access. Current source eligibility, privacy, consent, Legal Entity scope, and irreversible-effect boundaries must still be checked when work actually executes.

A named, source-owned organizational authorization can have a different lifecycle from a Studio NHI. That exception must come from its exact source contract; do not generalize it into a bypass for all scheduled work. See [IG-06](#ig-06).

<a id="ig-03"></a>

### IG-03 — Acceptance checkpoints prevent hidden dependency cycles

The source backlog's `WS-26` lists every pack because it is the **whole-program acceptance rollup**. Retain those requirements, but deliver and close their evidence under CORE, MOBILIZATION, GIVING, EVENTS, and CARE as the roadmap specifies. Do not make CORE import, initialize, test, or complete all downstream modules before it can ship.

Shared packages `WS-01`, `WS-03`, `WS-11`, `WS-12`, `WS-15`, and `WS-17` have common Phase 34 work plus explicit Phase 41 bindings. `WS-18` separates development work in Phase 34 from giving work in Phase 35. `WS-21` separates common content/documents from Phase 37 event integration. `WS-19` belongs to Phase 41; `WS-23` belongs to Phase 38. Their complete original descriptions and tests remain present.

The same distinction applies to the advanced Web Studio packages. Shared visual/standard-renderer proof must not wait for every custom-source test. WEB-VISUAL closes only after a genuinely usable visual product; WEB-SOURCE closes the conventional source/developer path; WEB-HYBRID proves actual redesign followed by independent staff editing. Whole Phase 42 completion requires all three. A limited pilot is not completion of a missing lane.

SMS-CHANNEL, SMS-CONVERSATIONS, and SMS-OUTREACH together complete Phase 43. ID-SIGNIN, ID-DIRECTORY, and ID-OPERATIONS together complete Phase 44. Phase 31's connection foundation does not wait for either consumer. Phase 32 email does not wait for SMS. Preserve these boundaries in imports, fixtures, start-up registration, dependency graphs, and release checklists, not only prose.

<a id="ig-04"></a>

### IG-04 — Participant journeys, forms, and accepted evidence

Phase 34 supplies common private form/session/submission and limited-task mechanisms. Phase 41 supplies the application-specific business records, accepted answer/evidence meaning, requirements, decisions, and My Journey experience. The roadmap and proposal place participant mode inside the existing product surfaces; neither creates an automatic donor/missionary membership or a new unrestricted anonymous principal.

The exact participant admission and session shape must be bound to the accepted Phase 4/12 contract. If the predecessor principal model cannot express the required private task purpose, record and adopt the necessary compatible successor before implementing it. Do not widen a public-only anonymous principal and call it limited access.

A shared form control does not imply a shared business ledger. Public launch forms keep the Phase 23 occurrence and one Primary Outcome. Private application forms retain source-owned accepted submissions. A clean uploaded file is not accepted evidence; a submitted questionnaire is not an authorized decision; a completed course task is not necessarily certified training.

Preserve the form owner's explicit hidden-answer rules. The general proposal permits source-defined retention; FORM-03 specifically excludes nonapplicable hidden answers from its accepted submission and effects while leaving retention of earlier drafts/history to its owner. Neither policy permits hidden stale data to become an unreviewed decision fact. Conditional visibility never supplies access control.

<a id="ig-05"></a>

### IG-05 — Workflow Studio and native Web Studio automation are different

Workflow Studio coordinates approved cross-product work. Advanced Web Studio performs its required native editing, source-delivery, preview, publication, safety, and recovery behavior. Both reuse the shared execution substrate where appropriate, but they do not share an executable business language or transfer source authority.

All twelve `AU01–AU12` behaviors remain required native Web Studio behavior. AU01 autosave and AU02 acknowledged preview refresh are editor/request behavior, not new Inngest functions. Source capture, isolated build supervision, publication appointments, convergence, containment, and retention use their actual source owners and existing dispatch/claim contracts.

Turning off optional workflow enrollment must not disable saving, scheduled publication, safety withdrawal, or ordinary CMS recovery. Turning off advanced web development must not break already-qualified native CMS operation. An optional COM recipe can request an exact-revision review or source-approved action; it cannot replace the public-generation owner, make an arbitrary Git commit live, or silently introduce universal two-person review for routine content.

<a id="ig-06"></a>

### IG-06 — Preserve each source's clocks and authorization lifetime

The original workflow defaults for debounce, preflight expiry, task links, reminders, retry budgets, date-only expiry, and daylight-saving interpretation are proposed defaults for eligible Studio-owned behavior. They do not become universal platform policy.

| Clock or authorization                    | Effective owner rule                                                                                                                                                   |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Optional Studio relative reminder         | Use the accepted source/tenant profile; pause only clocks explicitly marked pauseable; coalesce missed reminders                                                       |
| CMS publication appointment               | Preserve D13 exact revision, civil time, named zone, explicit ambiguous-time interpretation, resolved not-before instant, and generation-fenced change/cancel behavior |
| Support response target                   | Support Hub owns business calendars, target occurrence, and satisfaction                                                                                               |
| Giving recovery and fixed-pledge reminder | Recurring/pledge owners retain their bounded eligibility, opt-in, timing, and stopping conditions                                                                      |
| Report delivery                           | Report Studio owns the exact definition, recipient projection, schedule, and failure handling                                                                          |
| SMS quiet hours and expiry                | Phase 43's qualified route/market/purpose policy applies; a telephone prefix is not current recipient time-zone proof                                                  |
| Directory deactivation                    | Phase 12's source revocation is immediate under its accepted contract; optional tasks or campaigns cannot delay it                                                     |

A valid CMS organization-owned appointment can survive routine initiator departure where D13 explicitly allows it. A Studio NHI loses authority when its accountable human owner no longer has the required capability. Preserve both rules, including when Phase 44 deactivation propagates. Neither a blanket cancel-all-jobs policy nor blanket indefinite service authority is correct.

The generic workflow proposal's DST default is not a substitute for an explicit CMS appointment choice. The MPD-06 recipe's generic timing language also does not authorize a second recurring-payment reminder program: its exact recurring source policy and Phase 35 boundary remain controlling.

<a id="ig-07"></a>

### IG-07 — Shared effects do not create shared business authority

Core's merged orchestration contract keeps durable coordination separate from product and provider facts and requires shared dispatch and product work claims. [NR-CORE-02](source-research.md#nr-core-02) Implement permanent semantic identities at the **effect-owning domain**, across native callers, optional workflows, retries, and publication changes. A workflow-local deduplication row alone cannot prevent duplicate native/workflow acknowledgments.

Keep arbitrary payment corrections, provider replay, financial approval, broad role grants, direct table writes, and raw HTTP/SQL/script nodes out of the general action catalog. The source owner decides whether a narrowly approved command can be automated or only coordinated. A template cannot grant itself the ability to approve a claim, certify screening, alter a receipt, or dispose of held records.

Provider acceptance, final delivery, human reading, evidence acceptance, and business completion remain distinct. Preserve uncertain results without manufacturing failure or success. Cancellation that wins before source admission prevents new work; cancellation after irreversible provider admission cannot recall the external effect.

<a id="ig-08"></a>

### IG-08 — Advanced Web Studio successor planning is adopted; qualification remains open

Phase 42 is the roadmap owner for the hybrid authoring product. Its complete source proposal contributes the visual/code-first/mixed journeys, finite composition grammar, presentation SDK, isolated source builds, qualification, and staff handoff. The explicit `HA-A1–HA-A4` scoped successor planning contracts are adopted in the [hybrid decisions](../web-studio-hybrid/decisions.md) and affected Phase 23/24 bodies. These local identifiers are **not new Core ADR numbers**; actual implementation, owner binding and qualification remain open.

The phase assignment is settled in the supplied roadmap; exact new schemas, capability keys, deployment arrangements, and protocol details still follow the normal PRD/OpenSpec/owner process. Existing Phase 23 D1/D9/D10/D12/D13/D25 responsibilities and Phase 24 Site/locale/brand responsibilities remain intact. Phase 42 adds compatible consumers and deliberate successors, not a replacement CMS or a Payload-based CRM.

Keep original flat `asym.page-composition/1` documents valid. Adopt bounded `/2` layout only through the explicit ordinary-Page profile, without retroactive wrapping, truncation, automatic migration, or expansion of Article into a freeform designer. A genuinely incompatible predecessor requirement is an explicit decision gate, not permission to modify frozen Phase 1–26 scope silently.

<a id="ig-09"></a>

### IG-09 — One content document, one truthful save, one exact review

Puck is an adapter over canonical content, not a second database. A code developer supplies compatible renderers and bounded settings, not another Git-authored copy of live CMS content. Stable instance IDs survive edits and movement; copying into a new lineage produces new IDs. Page content, placement, navigation, shared resources, and Site-wide appearance retain their separate authorized operations.

The accepted source revision, current lease/authority proof, content write, receipt, and required outbox intent must share the qualified physical Postgres transaction. Payload documents a request transaction context, but this does not establish atomicity with a separate Supabase HTTP/RPC request or qualify an untested major/version cohort. [NR-06](source-research.md#nr-06)

Local visual feedback can be immediate; Saved requires the exact server acknowledgment. Unknown save outcome stops successor saves until the original receipt is recovered. Review selects exact acknowledged inputs. Later private edits remain outside the candidate; they neither silently replace it nor automatically invalidate it solely because they exist. Current safety, rights, compatibility, required cohort, and expected-head checks still apply.

Keep three previews distinct: disposable developer fixtures; current visual working feedback; and an exact authorized review candidate. A source build, admission, runtime deployment, Site activation, and delivery convergence are different events. New source deployment does not publish a Site; ordinary content editing does not require rebuilding source.

<a id="ig-10"></a>

### IG-10 — Qualify the real visual adapter and all editing paths

The original Puck `0.23.0` and Inngest `4.5.1` mentions are dated source-package candidates or inspected pins, not new production-version certifications. Resolve the actual repository lockfile, installed documentation, supported engine cohort, licensing, and browser evidence at implementation. Preserve the accepted Payload major-line direction without claiming that unrelated public-version documentation proves it.

The current Puck slot documentation warns that render-function `allow`/`disallow` restrictions are not respected by outline dragging and recommends field-level restrictions. The integrated requirement is to derive controls from the same grammar and independently validate every edit and save, including outline movement, copy/paste, duplication, restore, and direct commands. Do not rely on a visual drag constraint as server authorization. [NR-04](source-research.md#nr-04)

Puck's documented viewport is a same-origin iframe for viewport/style behavior. The whole admitted composer requires the separately qualified origin boundary specified by Asym; its internal viewport is not that security boundary. [NR-05](source-research.md#nr-05) Origin isolation reduces privileged-shell exposure but does not prove an admitted renderer's edit intent came from the human.

React Flow supplies useful keyboard and screen-reader primitives. The complete guided/canvas/outline experience, custom nodes, inspectors, validation focus, and participant tasks still need their own testing. [NR-07](source-research.md#nr-07) Node position and camera state remain presentation. Moving a diagram must not create a new business occurrence.

<a id="ig-11"></a>

### IG-11 — Repository placement is a boundary, not a fabricated inventory

The rechecked repository instructions identify the existing admin, donor, and missionary apps and shared workspace packages. Business database operations belong in `packages/api`; app API routes remain thin. Auth/session helpers remain shared; browser-visible data uses approved `packages/database` collections and hooks; reusable controls belong in `packages/ui` using the exact Core design language. [NR-CORE-01](source-research.md#nr-core-01)

Preserve the specific admin-local Payload adapter exception and inject it at the application composition root. Shared packages must not import the admin runtime. Proposed names such as a Studio subtree or public presentation SDK remain placement proposals until reconciled with the actual exports and owners. A separate composer origin is a deployment boundary, not automatic authorization for a fourth product app.

A source envelope, provider webhook, human command, and browser projection may share infrastructure but have different trust boundaries. Derive authority from verified server context. A legitimate selector requests scope; it does not authorize that scope. Reject unsupported actor/bypass fields, validate permitted selectors, and do not globally reinterpret every source DTO as accepting or ignoring the same keys.

Source traces must include commands, exact source versions, test results, retained-data migration, recovery, and ownership. A found file or existing UI is evidence of code, not proof that the full target phase is implemented. A blocked ticket remains a planning artifact unless implementation and live evidence establish otherwise.

<a id="ig-12"></a>

### IG-12 — Keep source-project policy and future ideas explicit

The hybrid proposal requires one repository to belong to one Tenant; that is an isolation boundary, not a one-repository-per-Tenant count limit. The repository/project/Site cardinality is an implementation profile to qualify, not a discovered commercial limit. The roadmap allows the implementation team to settle the exact repository/project/Site relationship while retaining tenant isolation, verified repository control, immutable captures, independent Site activation, and historical provenance.

Ministry-controlled source must remain usable with a conventional clone, lockfile, local preview, tests, and supported SDK. Staff must retain independent control of admitted content and layouts after a redesign. Developer replacement/disconnection does not delete editorial work or safe retained renderer artifacts.

The recovered source-direction document is retained in full as idea provenance. It does not automatically expand Phase 42 into hosted IDE/OpenCode/BYOK, a customer server-code runtime, independently hosted frontends, or a plugin marketplace. Those remain explicit future product decisions. Similarly, ongoing deployment/personnel ownership, a full LMS, and commercial tenant provisioning are not added by this Markdown conversion.

<a id="integration-qualification-cases"></a>

### Focused integration qualification cases

These cases make existing obligations testable at the seams highlighted by this compilation. **They are specified here, not executed product tests, and do not replace any original scenario or release gate.**

| ID       | Required proof                                                                                                                                                                          | Owner                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| IG-AT-01 | With Phase 41, giving/event/care packs, and Phase 42 unavailable, CORE still qualifies its real common tracers; full-program acceptance remains visibly incomplete                      | Phase 34 and program delivery |
| IG-AT-02 | Remove the NHI owner's required capability after publication and before source admission; no future affected effect executes or gains authority through republishing                    | Phase 12 / 34                 |
| IG-AT-03 | Submit a completion before wait registration, after registration, and with a lost wake; the source recheck/reconciliation finds the actual outcome without timeout approval             | Phase 34                      |
| IG-AT-04 | Replay a business event beyond the provider deduplication window and across native/Studio callers; one semantic effect survives without blind retry of uncertainty                      | Effect owner / Phase 34       |
| IG-AT-05 | Overload optional workflows while an accepted source event, SMS withdrawal, and directory deactivation arrive; no accepted critical work is discarded by a skip-style limit             | Platform / Phases 34, 43, 44  |
| IG-AT-06 | If event batching is adopted, verify tenant-homogeneous grouping and the exact supported concurrency/cancellation/idempotency configuration; no first-event key mis-scopes later events | Shared executor owner         |
| IG-AT-07 | Try each illegal Page placement through canvas drag, outline drag, non-drag move, copy/paste, duplication, restoration, and direct save; every path follows the same canonical grammar  | Phase 42 / Q03                |
| IG-AT-08 | A composer with a same-origin internal viewport still has no privileged-shell origin access; forged bridge messages cannot save, publish, connect source, or fetch private data         | Phase 42 / Q03                |
| IG-AT-09 | Inject rollback after content write and before receipt/outbox, then lose the response after a real commit; no partial acknowledged save or fresh-key replay occurs                      | Editorial owner / Q02         |
| IG-AT-10 | An approved custom redesign hardcodes a supported field; binding qualification rejects it. After repair, staff change that field and layout without source edits                        | Phase 42 / WEB-HYBRID         |
| IG-AT-11 | Complete source-approved offboarding: Studio owner-bound work stops; an otherwise valid D13 organizational appointment retains only its specifically authorized behavior                | Phases 12, 34, 42, 44         |
| IG-AT-12 | Restore/import a reference blueprint with symbolic bindings: it remains disabled and unresolved until the exact owner, scope, version, permission, and evidence checks pass             | Phase 34 / source owners      |

<a id="remaining-implementation-decisions"></a>

### Decisions that remain with implementation and source owners

The complete phase chapters and detailed proposals contain their own open-decision inventories. At dispatch, create an accountable register for each unresolved exact source binding, participant assurance profile, provider/market, dependency cohort, physical transaction adapter, independent build boundary, clock policy, rights/retention class, and workload limit. Record the chosen contract/version, permitted data, failure behavior, responsible owner, test evidence, and requalification trigger.

The newly recovered JSON and tests do not settle those choices. Blueprint aliases and example IDs are intentionally inert. Passing a structural validator cannot certify a source adapter, prove current access, approve a sender, admit a presentation package, or establish production capacity. Keep these decisions visible instead of substituting implementation guesses for missing owner approval.

---
