# 2. Product and experience specification

## Navigation and ownership

**Mission Control → Workflow Studio** is the canonical home. Start by extending the existing Automations entry; preserve deep-link compatibility and record a route migration before renaming routes. Recommended proposed destinations are `/workflow-studio`, `/workflow-studio/templates/:id`, `/workflow-studio/runs/:id`, and scoped `/workflow-studio/settings`. These are proposed routes, not existing ones.

The library contains Templates and Runs, with contextual **Needs attention** and **My work** views. Do not create a separate global task authority: these are projections of shared tasks and source exceptions. Finance, Support Hub, Mobilization, Web Studio, and development screens link to filtered views of the same definitions. Protected source processes are displayed as source-owned integrations rather than independently editable duplicates.

## Library

Every visible row shows purpose, type, owner team, publication version, activation state, scope, next scheduled evaluation where applicable, last successful activity, and count of authorized exceptions. Counts and search results apply the same access projection as detail reads. A user must not infer sealed care work from totals, filters, exports, autocomplete, or empty-state differences.

Required actions: use starter, duplicate permitted template, create blank permitted workflow, edit draft, compare versions, simulate, publish, enable/disable enrollment, inspect runs, archive template, export a safe template package. No bulk destructive control appears in the initial library.

A starter is usable without specialist consulting: describe its outcome, prerequisites, expected recipients, suggested cadence, and whether it sends externally. Installation produces a draft with suggested parameters and unresolved bindings clearly marked. New optional definitions never send until tenant activation. Native essential product processes continue independently.

## Guided authoring

The guided sequence is **Purpose → Starts when → Scope and people → Steps → Review and test → Publish**. The editor offers only compatible actions and authorized fields. Use readable names such as “First qualifying gift to this designation,” not `contribution.v1.created` in the normal UI.

A sentence-style editor handles a single trigger/filter followed by a sequence. The visual editor handles stages, branches, parallel groups, and reusable subflows. Both operate on the same AST. Switching to simple view never discards structure: a nonrepresentable flow receives a read-only summary and an explicit “Edit visually” action.

The canvas has a searchable palette, central stage map, right-hand inspector, and persistent validation summary. Connection operations transform supported structural constructs; arbitrary cross-branch back-edges are rejected with an explanation. Layout, selection, zoom, and collapsed groups are presentation only. Moving a node cannot resend a message, reopen a task, or create a new business revision.

## Step inspector

The inspector uses consistent sections: What starts this; Responsible role; Information needed; Information recorded; Who can see it; Message or notification; Timing; Completion evidence; Exceptions. Show source-owned controls as locked with a direct link to the relevant native settings, not as disabled mysteries.

Variables use a typed field picker with source, meaning, freshness basis, permitted audience, and a synthetic sample. Never expose a generic JSON path or all CRM fields. Renaming a field preserves its ID. Deleting or changing its type shows dependent workflows and blocks unsafe publication until references are explicitly repaired.

Every condition has a readable sentence. Money conditions show ISO currency and inclusive/exclusive boundaries. Date controls show named timezone and whether “days” means elapsed days, local dates, or business days. A missing owner is not a successful assignment.

## Roles and delegation

Templates bind named responsibilities rather than hard-coded people by default: case coordinator, relationship owner, regional interviewer, finance reviewer, content editor, assigned carer, applicant. Static named people are allowed where justified, with current eligibility checks and a fallback path. No wildcard “all admins” fallback for sensitive work.

Owner resolution yields one eligible principal, a permitted team queue, or `needs_assignment`. Ambiguous same-rank matches block; they never pick the first database row. Round-robin is optional per supported contract, atomic and fair over currently eligible staff; absence of eligible staff produces the explicit queue. Assignment does not grant access. Reassignment records old/new owner, reason, actor, and pending work affected.

Publishing, enabling enrollment, operating runs, editing content, and taking source-domain actions are different capabilities. Small tenants may use one person for low-risk configuration, but non-waivable separation of duties still applies to protected review.

## Draft and publication experience

Autosave after an idle edit interval, with visible Saving/Saved/Conflict/Offline states. Default 750 ms debounce is a proposed UX setting, not a service guarantee. Server revisions and compare-and-swap prevent silent overwrite. A second editor can read; conflicting writes show a diff. The application cannot silently merge changed financial routing or recipients.

Publish requires a server-issued immutable preflight containing the draft digest, exact referenced contracts/publications, enabled scope, audience impact, warning acknowledgments, and required review. A default preflight expires after 15 minutes and is invalidated by relevant capability or authority changes. Final publication revalidates and atomically creates the immutable version. Low-risk changes can be published by an authorized publisher; protected or broad external-send changes require the independent review specified by the owning contract.

Publish is distinct from enabling new enrollment. Show the effective activation boundary and whether active runs remain pinned. No “save and immediately email everyone” shortcut.

## Run operations

The run view overlays actual state on the definition: active work, owner, waits, next due action, evidence satisfied, and blocked reason. A chronological activity view is available without opening the graph. Explain “Waiting for the church reference” rather than exposing an infrastructure step ID.

Required controls: pause/resume, stop optional future work, reassign eligible tasks, adjust permitted deadline, amend future work, compare plan revisions, retry a proven-safe failed operation, and open the source exception. Controls appear only with current authority and actionable semantics. No universal Approve, Mark paid, Skip security, or Undo reality button.

On amendment, preview newly created and canceled work, due dates, message consequences, evidence reuse, required re-review, and irreversible actions already passed. Authorization checks and revision fencing apply at final commit. All active-run structural changes carry a reason. Cosmetic layout edits do not.

## Participant surfaces

Phase 34 supplies common purpose-scoped participant tasks and journey composition within existing app surfaces. Phase 41 owns application-specific **My Journey**, accepted answers/evidence, requirements, decisions and receiving handoff. The intended applicant experience uses a distinct participant mode in the existing missionary app. This is not a fourth operational app, not publicly readable content, and not automatic missionary or donor access. Public inquiry entry can live on the tenant website; authenticated journey and private evidence do not. The included OpenSpec delta makes this boundary explicit [R5]. Exact admission and session semantics must be bound through the accepted Phase 4/12 identity contracts. Public/anonymous principals remain public-projection-only; where the predecessor cannot express the private purpose, adopt an explicit compatible successor before implementing it. Never widen public access or create implicit membership.

A participant sees next action, optional upcoming milestones, submitted items, requests for correction, coordinator contact, permitted messages, and truthful progress. Internal assessments, rejected internal branches, care data, staff routing, and technical failures are excluded server-side. Show “We are reviewing your application” rather than confidential rejection rationale. Do not disclose the existence of sealed screening requirements without source-approved wording.

Missionaries see shared support-raising tasks and their permitted evidence. Coaches see only the approved coaching projection; neither role gets the graph editor by default. Donors retain a calm self-service experience. Staff see My Work across assigned sources without duplicated tasks.

## External references and limited-access tasks

A token grants only a named task-purpose session, never general account membership. Use an opaque random secret of at least 256 bits, server-side hash, expiry, revocation and rotation, and a task/tenant/recipient binding. The link opens a neutral page; a scanner GET cannot consume a token, approve, sign, or submit. Exchange only through the protected-action primitive after an explicit user action, with rate limiting, CSRF/origin defenses, and non-enumerating errors.

A suggested standard expiry is 14 days, renewable through reauthorization. This is a product default, not a legal rule. Restricted assessments require an authenticated stronger assurance path; bearer links are not a universal care-access mechanism. Saved sessions remain purpose-limited; each submission and evidence fetch rechecks access. Never put secrets in analytics, referrer URLs, audit text, or Inngest state.

## Forms and files

Provide multi-page forms, conditional sections, repeatable groups with bounds, partial save, accessible validation, locale-aware display, and resubmission as a new immutable version. Required-field validation runs server-side on visible, applicable fields; hidden answers follow the source’s explicit retention/acceptance rule and never become unreviewed decision facts. FORM-03 excludes nonapplicable hidden answers from accepted submissions and effects; earlier draft/history retention remains owner-defined. Form definitions declare whether fields map to the current application or to a permitted permanent record update.

Only named, source-approved calculated fields ship initially. No user-authored financial formulas. Read-only derived values never become authoritative money, eligibility, health, or approval facts. Outputs from a branch are available elsewhere only through explicit typed optional/join bindings.

Uploads use private source-approved byte storage, finalization, malware status, size/type limits, and short-lived authorized retrieval. “Uploaded” is not “accepted.” Quarantined files cannot satisfy evidence. External signing and screening remain disabled until a provider and purpose contract are certified; a correctly labeled manual evidence path can ship independently where policy allows.

## Accessibility and field reality

Target WCAG 2.2 AA for the complete experience [S15]. Supply a full outline/list editing path, keyboard creation/reordering, sensible focus on validation errors, non-color status meaning, reduced-motion support, screen-reader labels, and mobile participant views. React Flow's accessible primitives are a foundation, not a compliance certificate [S10]. Test the configured components with assistive technology.

The editor is online-first. Sensitive drafts are not persisted locally by default. Participant forms may resume from server drafts; submission always requires server authority. Approved future offline work must use visible pending state and idempotent replay, and cannot include approvals, payments, publication, or access changes. On a poor connection, preserve user input in memory, communicate uncertainty, and make a duplicate submit safe.
