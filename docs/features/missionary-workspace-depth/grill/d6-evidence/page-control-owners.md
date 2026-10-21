# D6 — public-page signup control: owner and product evidence

Research-only, October 16, 2026 UTC, against baseline
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. The founder selected direct native
newsletter signup and missionary control over whether the option is shown on
the public giving/profile page. This note proposes bounded amendments; it does
not amend owners, ratify an unchosen detail, implement or activate a capability.
No application, live data, provider, permission or GitHub state changed.

## Finding and smallest useful interpretation

**Accept with required amendments.** A missionary who has current authority for
the exact ministry Page should be able to choose whether its qualified native
newsletter signup is offered. Keep that control in the existing page experience,
with one understandable effect and truthful saved/pending/live status.

The user selected control of a public signup entry. They did not select public
page ownership, publication-policy administration, a subscriber database, a
general form builder, subscriber-list access, automatic enrollment, a global
newsletter kill switch, or changes to already accepted subscriber preferences.
The choice can be implemented by extending existing owners; no new publication,
permissions, form, settings or delivery engine is justified.

**Strongest simpler alternative:** retain the complete native newsletter and
its separately qualified recipient process while leaving the public request-only
handoff unchanged. That avoids the new signup producer but leaves the human
handoff the founder explicitly chose to remove. Within the chosen direction,
one existing-editor control is simpler than a new newsletter-settings surface,
per-person collaborator controls, a generic form editor or site-wide wizard.

## Sources actually inspected and their authority

All paths below are relative to `/workspace/core`. These are accepted owner
intent and active planning contracts, not evidence of deployed behavior.

| Source and exact inspected sections                                                                                                                                                                           | Classification and relevant constraint                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/prds/sitestacker-parity/phase-22-public-ministry-pages.md:328–416`, D1–D5                                                                                                                               | Source owner. Exact host/Tenant/Legal Entity/Site/Page/locale release scope; explicit current contributor assignment; requested/release-time/current reach; immutable candidate and existing review/release path.                                  |
| Same P22 PRD `:595–646`, D17–D20                                                                                                                                                                              | Source owner. Missionary Page subject is the P9 Ministry Assignment; contributors, participants, display, support and notifications are separate; closed semantic catalog currently excludes generic forms.                                        |
| Same P22 PRD `:650–739`, D21–D26                                                                                                                                                                              | Source owner. Complete adoption; current permission-filtered workspace; derived settings; attributed staff edits; bounded recovery and candidate-bound attestation.                                                                                |
| Same P22 PRD `:508–518`, D12; P12 PRD `:2677–2704`                                                                                                                                                            | Precedent only for this decision. Exact response-source narrowing may be immediate while reopening uses D4/D5. This does not itself authorize newsletter-entry closure or reopening.                                                               |
| `openspec/changes/add-public-ministry-pages/specs/identity-and-access/spec.md:5–149`                                                                                                                          | Active owner delta: exact server scope; independent grants; revocation; settings, editing, review and release powers distinct.                                                                                                                     |
| `openspec/changes/add-public-ministry-pages/specs/public-ministry-pages/spec.md`, D1/D2/D4/D5/D17/D18/D19/D20/D23 requirement locations `:5`, `:41`, `:165`, `:249`, `:910`, `:939`, `:989`, `:1024`, `:1251` | Matching active owner requirement inventory. Relevant behavior was read in the P22 PRD and identity delta above; requirement locations are reconciliation targets, not a claim of a second full-document read.                                     |
| `docs/adr/0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md`, Context/Decision/D19 precision/Consequences                                                                              | Accepted decision. One bounded contributor experience; no implicit subject/spouse/team rights or direct live-CMS mutation.                                                                                                                         |
| `docs/adr/0140-derived-public-page-setup-and-settings.md:30–90`, plus Decision on private summaries and consequence separation                                                                                | Accepted decision. No parallel settings blob. Distinguish chosen/default/fallback/Off/unavailable; owner command, current proof, CAS and authoritative readback.                                                                                   |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2775–2811`, `:2918–2946`                                                                                                         | Source owner. Exact subject, convergence, operations and staff-editing capabilities; contributor status cannot grant unrelated powers.                                                                                                             |
| `openspec/changes/add-web-studio-cms/specs/web-studio-cms/spec.md:927–962`, D24; `:1018–1099`, D26                                                                                                            | Active owner delta. One public audience; private interaction separate. Purpose-bounded native public forms; exactly one certified Primary Outcome; atomic acceptance; no browser routing authority.                                                |
| `docs/adr/0170-purpose-bounded-public-form-definitions-and-domain-owned-routing.md`, Decision, especially clauses 1–4, 9–16, 19–22; lines `105–124`                                                           | Accepted form owner. Definition/Route Plan publication, current effect reproof, bounded native public submission, no CMS inbox. Its older P32-only subscription sentence requires scoped reconciliation with the later P28 independence amendment. |
| `docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/experience.md:159–187`, EX11–EX12; EX16 `:221–227`                                                                                     | Accepted request-only purpose. Externally managed newsletter handoff; no subscription/identity/CRM inference; source-qualified Page action; current proof; frozen accepted work; activation gates.                                                 |
| `docs/prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md:69`, `:107`, `:200`, `:903–914`                                                                                | Source floor. One subtract-only projection/consent seam; current serving evaluates owners and adverse denial before asynchronous convergence; no persisted duplicate authority.                                                                    |
| `docs/prds/sitestacker-parity/phase-10-sensitive-data-safety.md:38–47`, `:140–152`, `:169–180`                                                                                                                | Source safety floor. Public aliases and one firewall; hard objections remain subtractive; metadata/URLs/telemetry are egress too. Granular consent absence must not be turned into an invented P22 checklist.                                      |
| `docs/prds/program-roadmap/owner-constraints.md:88–92`; `delivery-contract.md:212`, `:255`                                                                                                                    | Later scoped program amendment. P28 owns independently usable native newsletters; P32 external sync is not a prerequisite; P17/P6 remain shared lower owners.                                                                                      |
| `docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:193–219`; Q6 research and current founder instruction                                                                                | Requested scope and selected product direction. Native signup requires an explicit owner amendment; existing request occurrences remain request-only.                                                                                              |

The source register intentionally separates scope locations from fully inspected
sections. No deployed page, runtime command, RLS policy, public form, provider
send, representative-user journey or retained-data census was tested here.

## Corrected decision candidate

> **D6 page control.** On an exact ministry Page qualified for Asym's native
> newsletter, an appropriately authorized missionary can choose whether that
> Page offers direct signup to the named newsletter through the existing Page
> experience. Resolve the action from current explicit Page/purpose authority;
> missionary status, subject display, household/team membership, authorship or
> financial access alone grants no control. The owner amendment must include a
> usable positive path for the intended missionary, not merely deny everyone.
>
> Keep one source-owned choice and show separately whether it is saved,
> awaiting the existing publication process, currently offered, or unavailable.
> Enabling it does not publish a Page, override publication review or safety,
> establish newsletter readiness, enroll anyone, or grant subscriber access.
> Introduce the native placement through the current typed Page/form catalogs
> and qualified publication route rather than direct live-CMS mutation.
>
> Turning this Page entry off stops new signup intake through that entry and
> removes its controlled public offer. It does not unsubscribe existing readers,
> remove withdrawal/preference access, disable lawful native newsletter work,
> unpublish the Page, change giving, delete accepted evidence, or switch to the
> external request-only doorway. Accepted work and pending address proof follow
> their exact current source contracts; hiding the entry alone is not a blanket
> instruction to cancel or complete them.
>
> External newsletters retain their qualified request-only journey where used.
> Native Off, dependency failure and unknown configuration never select that
> other purpose as a fallback. Existing requests retain their original meaning,
> recipients, clocks and recovery; neither migration nor a toggle converts them
> into consent. Every new signup still needs its separately qualified consent,
> address-admission, withdrawal, safety and delivery contracts.

### Proposed implementation discipline, explicitly not already inherited

1. **Use the existing Page editor.** One plainly labelled control such as
   `Show newsletter signup on this page`, brief consequence copy and the existing
   owner action. Avoid a new settings destination or a second approval inbox.
   Wording is illustrative, not a required route or UI component.
2. **Off should narrow promptly.** Recommend a source-owned stop for new Page
   intake, checked before public presentation and submission acceptance, while
   its publication representation converges through existing owners. A stale
   tab cannot accept a new signup after that stop has won. This is an explicit
   proposed P22/P23/P12 extension, not a claim that current contributor rights
   already include it. It must not become a shadow visibility or consent engine.
3. **On uses admitted publication and current readiness.** Recommend the
   existing review/release posture for new public exposure. One action may enter
   that existing path; no extra bespoke approval is needed. A saved On is not
   falsely shown as live. The owner must qualify the exact placement/binding
   through the P22 specialized Page release and P23 form contract, without
   transplanting the ordinary Site Generation as a second Page release head.
4. **Do not invent a global initial choice.** Before a new native entry has an
   explicit compatible choice and admission, it is not publicly offered.
   Distinguish that safe absence from a missionary's saved Off or a dependency
   outage. Do not seed On from an existing public Page, gift history, native
   sender connection, previous request button or generic missionary role.
   Existing independently valid external request lanes remain unchanged.
5. **Keep Page and newsletter scope visible.** The control affects the named
   Page entry. It does not silently change another Page, Site, ministry,
   newsletter, purpose or coauthor's personal settings. Qualify locale mappings
   under existing release contracts; do not add per-locale user switches, bulk
   republishing or a new site-wide switch merely to implement this choice.

The immediate Off recommendation is not a product-scope question to send back
to the founder by default: it realizes the selected Off outcome. Its exact
owner admission and the positive enabling path are mandatory engineering and
owner-contract qualification. If owners cannot provide this semantics, report
the concrete conflict rather than silently shipping an optimistic toggle.

## Material concern register

Likelihood is a qualitative engineering judgment **without the proposed
controls**, not a measured failure rate. Each concern identifies answer impact,
permanent fix and an exact proposed clause for the root review to map to its
22-category assessment.

### PC-R1 — a missionary or coauthor label becomes a general grant

- **What/why:** Treating every missionary, displayed spouse or Ministry Assignment
  participant as able to change the Page or read its subscribers would cross
  independent P12/P22 ownership and expose another ministry's data.
- **Severity:** Critical. **Likelihood:** Medium; the ordinary language “my page”
  hides organization-owned subject and multi-person collaboration.
- **Evidence:** P22 D1 `349–354`, D17/D19 `595–623`; ADR0118; active identity delta
  `5–77`, `99–113`.
- **Answer impact:** Keep missionary control, narrow it to the intended exact
  Page/purpose; do not deny the feature merely because the capability is new.
- **Permanent fix:** Extend existing explicit Page authority for this bounded
  semantic action, preserving independent publishing, source setup and
  subscriber-access grants. Reprove current authority on every command.
- **Exact clause:** “The newsletter-entry control is available only under current
  exact Page/purpose authority; it grants no subscriber, CRM, finance, public
  reach, source-configuration or publication-policy authority.”

### PC-R2 — a saved switch silently publishes or survives a stale candidate

- **What/why:** A convenient live boolean could bypass the selected review posture,
  overwrite concurrent coauthor work or re-enable exposure after Off/revocation.
- **Severity:** High. **Likelihood:** High if modeled as an app preference.
- **Evidence:** P22 D2/D4/D5 `355–416`; ADR0140 `75–90`; identity delta `23–28`,
  `64–68`; P23 D26 release semantics in ADR0170 clause11.
- **Answer impact:** Preserve simple control; change its acceptance semantics,
  not the founder's choice. No new review graph.
- **Permanent fix:** Existing immutable source revision, expected-head/CAS,
  idempotent outcome recovery, current admission and truthful state. Off fencing
  and new enabling share the same authoritative source lineage; stale queued
  release cannot restore an earlier choice.
- **Exact clause:** “A saved choice is not public activation. New exposure uses
  the current qualified Page/form release path; every acceptance and release
  re-proves the current entry generation and authority. Stale work cannot undo
  a later Off, safety restriction or valid source change.”

### PC-R3 — Off destroys or changes independent newsletter obligations

- **What/why:** A control labelled visibility could be wired to global newsletter
  disable, mass unsubscribe, deletion, Page unpublication or loss of withdrawal.
- **Severity:** High. **Likelihood:** Medium; “newsletter enabled” is ambiguous.
- **Evidence:** P22 independent state meanings `343–345`, D8 `442–448`; P25 EX12
  `185–187` separates current effects from frozen work; P3 current consent owner.
- **Answer impact:** Off affects new intake through this Page entry only.
- **Permanent fix:** Exact purpose scope and no implicit side effects on
  subscriptions, history, native sends, page reach or giving. Pending native
  proof must be classified by its own accepted-source semantics.
- **Exact clause:** “Off closes this Page's new signup entry; it does not change
  existing subscription/withdrawal facts, unsubscribe access, accepted evidence,
  giving, page reach or independently authorized native communication.”

### PC-R4 — adding a form creates a parallel product authority

- **What/why:** A new arbitrary block, Payload form-submission collection, local
  subscriber table or page-toggle route could evade closed page semantics,
  atomic owner acceptance and the single communication seam.
- **Severity:** High. **Likelihood:** High if implementation starts from a UI toggle.
- **Evidence:** P22 D20 `624–646`; P23 D26 `1018–1060`; ADR0170 clauses1–4,9–11,
  19–22; ADR0140 source-owned settings.
- **Answer impact:** Requires narrow coordinated owner extensions before build;
  does not justify a general form builder or a new platform subsystem.
- **Permanent fix:** One certified native-newsletter purpose and Page placement;
  existing intake and source adapter; exactly one operational subscription owner;
  existing settings projection and delivery owners.
- **Exact clause:** “Extend only the certified native-newsletter purpose,
  placement and owner adapter. Page content/configuration cannot store consent,
  subscriber truth, provider routing or a second form/publication authority.”

### PC-R5 — native and external modes silently reinterpret the same doorway

- **What/why:** Native Off/unavailability could show Request instead, or existing
  requests could become subscriptions after changing a setting. Both change
  visitor intent and accepted source evidence.
- **Severity:** High. **Likelihood:** High in a fallback-oriented UI.
- **Evidence:** P25 EX11 `161–171`, EX12 `175–187`; founder brief `205–211`;
  program native independence at delivery-contract `212`, `255`.
- **Answer impact:** Retain distinct purposes and no historical conversion; one
  understandable current doorway rather than mandatory competing buttons.
- **Permanent fix:** Exact Page/purpose binding and prospective qualified
  transition. Preserve accepted operation identity and original recovery.
- **Exact clause:** “Native signup, external newsletter request and Off are not
  fallback aliases. A mode change never reinterprets, retargets, resubmits or
  extends accepted prior work, and a hidden/unavailable native entry does not
  silently activate a request-only journey.”

### PC-R6 — a useful control lies when source proof is missing

- **What/why:** Optimistic On/Off or one “enabled” badge conflates chosen state,
  published placement, provider readiness and temporary failure; retry may
  duplicate the choice or overwrite a coauthor's change.
- **Severity:** High. **Likelihood:** High without explicit state semantics.
- **Evidence:** P22 `343–345`, D23 `692–702`; ADR0140 `40–53`, `75–90`; P12
  D18 status `2793–2811`.
- **Answer impact:** Keep one control with calm source-derived status; no status
  dashboard or mandatory configuration tour.
- **Permanent fix:** Authoritative readback, bounded source-owned recovery,
  unchanged choice on unknown outcome, current permitted state/error reason.
- **Exact clause:** “Show the saved choice separately from its current public
  effect. Unknown, unavailable, pending review and saved Off remain distinct;
  reconcile uncertain saves before retry and do not overwrite a newer choice.”

### PC-R7 — defaults and migration enroll public Pages without intent

- **What/why:** Copying an old request flag, template default, provider connection
  or page-public status into native On changes public behavior and may convert
  old contact data into consent without deliberate adoption.
- **Severity:** High. **Likelihood:** Medium.
- **Evidence:** P22 D2 prospective defaults `368–373`, D21 `650–668`; ADR0140
  `47–53`; P25 EX16; founder brief expressly requires an owner amendment.
- **Answer impact:** No automatic native-page activation or historic enrollment.
- **Permanent fix:** Retained entry/purpose/configuration census, explicit scoped
  migration dispositions, compatibility/readiness proof, existing external path
  preserved, new native action only after explicit eligible enablement.
- **Exact clause:** “Migration preserves existing purpose and user-choice
  evidence. An old public page/request button, contact, gift or sender connection
  cannot seed native signup On or subscription consent; missing native choice
  remains unoffered and is not represented as an explicit user Off.”

### PC-R8 — public entry or metadata leaks restricted or cross-scope identity

- **What/why:** Forms, confirmation routes and errors can expose a legal name,
  private ministry association or subscriber status even when page body is safe.
  A browser-supplied Page/newsletter ID can choose another scope.
- **Severity:** Critical. **Likelihood:** Medium.
- **Evidence:** P10 `38–47`, `140–152`, `169–180`; P22 `338–342`, D18 `601–613`;
  P3 `903–914`; P25 EX11 `165–167`; P23 D24 `927–962`.
- **Answer impact:** No new public identity, protected-reader or subscriber-list
  exposure accompanies signup.
- **Permanent fix:** Resolve trusted host/current Page/purpose server-side;
  current safety before caches and acceptance; public-safe source labels;
  private no-store submitted state; apply the same fences to all entry routes.
- **Exact clause:** “The entry, its metadata and every acceptance/recovery route
  resolve the exact current Page/newsletter purpose and permitted public
  identity. Public artifacts remain audience-invariant; submitted answers and
  private eligibility results never enter public content, URLs or caches.”

### PC-R9 — page controls become an unnecessary settings and operations product

- **What/why:** Independent user/locale/site toggles, a forced CMS visit, a new
  five-step missionary builder or per-toggle approval chain would make a simple
  visibility choice hard to understand and maintain.
- **Severity:** Medium. **Likelihood:** Medium.
- **Evidence:** ADR0118 bounded workspace; P22 D23 `692–702`; ADR0140 finite
  descriptor/one owner action; P23 D26's complex staff builder is not a mandate
  to expose that builder to missionaries.
- **Answer impact:** Retain simple missionary control and source depth behind it.
- **Permanent fix:** Reuse the existing Page affordance and qualified fixed
  purpose; one action, only meaningful current status, existing cause-owned
  repair for unavailable dependencies. Measure comprehension before adding UI.
- **Exact clause:** “Provide the bounded signup control in the existing Page
  experience. Do not expose generic form routing, provider setup, per-locale
  switches, a new approval inbox or a separate settings authority to make this
  ordinary choice.”

## Exact amendments and qualification boundaries

| Owner                                                             | Required scoped reconciliation before activation                                                                                                                                                                                                     |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P22 D1/D20, active public-page and identity deltas                | Add one native signup semantic placement and bounded missionary control through explicit current Page authority. Existing catalog does not authorize generic forms.                                                                                  |
| P22 D2/D4/D5/D18, P23 D26                                         | Map the specialized Page release to the exact certified form/route purpose, current entry choice and proposed immediate Off fence; one publication authority, no second release head or direct live write.                                           |
| P12/P3                                                            | Register precise action/field/source scope and public-safe projection; include positive intended-missionary use and negative spouse/team/generic-role/other-Page cases. No subscriber rights inferred.                                               |
| P10                                                               | Apply current alias/objection/containment across the Page offer, form, private result and every communication/URL/metadata derivative. No new granular-consent checklist by inference.                                                               |
| P25 EX11–EX13/EX16 and corresponding active donor-dashboard delta | Preserve the external request lane; add explicitly distinct native flow and states only through the authorized amendment. Do not inherit request-only no-confirmation rules as a native address-proof decision.                                      |
| P23 ADR0170 clause13 and native newsletter owner                  | Reconcile the older P32-only subscription wording with P28's later independent-native contract. Identify one actual native subscription/consent owner and adapter; do not add P32 as a blanket prerequisite or invent a page-local subscriber table. |
| P17/P6 and applicable P4                                          | Other D6 owner research must qualify address admission, intent/confirmation semantics, messages, withdrawal, suppression, expiry, dedupe and delivery. The page control does not settle these.                                                       |

Mandatory proof before activating this specific capability:

- Authorized missionary changes the exact assigned Page entry and sees a truthful
  effective result; another Page/Tenant/subject and an unassigned displayed person
  cannot. Valid coauthors use independent identities; races have one durable
  source result. Contributor revocation blocks future commands/queued actor
  effects; it does not invent a global Page-unpublish rule.
- New On follows the existing review posture and cannot publish while its source
  capability is unqualified. Page-public state and native sender readiness alone
  cannot enable signup. Off blocks new acceptance from an already open form or
  direct endpoint; stale On/release cannot undo it. Exact accepted-before-Off
  versus pending-proof semantics must be provided by the native source owner.
- Existing subscriber withdrawal remains usable; lawful sends and giving remain
  independent. Off never converts to external Request. Existing external request
  operations keep their original source identity, recipients, clocks and purpose.
- Unknown save outcome, source outage, cached presentation, repeated click,
  locale/current-release change and safety narrowing have truthful recovery.
  Native no-JavaScript, mobile, keyboard/AT, error preservation and protected
  identity/metadata cases must pass through the actual integrated application.
- Retained Pages, roles, configurations, forms and accepted requests have an
  explicit migration disposition; no guessed native On or imported consent.

These are release gates, not assertions of current success. The smallest
relevant automated owner/concurrency tests and actual browser journey should
prove them; reproducing the decision in a synthetic model alone is insufficient.
No numeric performance or comprehension threshold is invented here. Use existing
qualified service budgets and representative task-success evidence; monitor
repeated saved-versus-live misunderstanding, Off-withdrawal confusion, duplicate
entry symptoms and persistent unavailable causes with the existing owners.

## Remaining choices versus engineering work

**Selected:** direct native signup, missionary choice whether its Page offers
it, simple clear UX. **Inherited:** current explicit scope; sole publication,
public forms, consent and delivery owners; source safety; historical request
meaning. **Recommended amendment, not previously selected detail:** immediate
scoped Off narrowing; On through existing release/readiness; one in-editor
control and no automatic migration enablement. **Not settled here:** exact
native address-proof/admission policy, newsletter purpose/consent/withdrawal
schema, or a numeric retention period. Page-control implementation details do
not justify another founder question absent a concrete owner conflict.
