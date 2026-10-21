# D37 — an optional, organization-authored starting guide

Research and review: **October 18, 2026**. Repository baseline
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`, including the current research tree.
**Disposition: Accept with required amendments.** Q37 A is selected. The founder
also explicitly confirmed: **“Keep it optional; tenants can offer, edit or disable
it.”** On **October 18, 2026 Asia/Bangkok**, the founder explicitly ratified
the corrected decision and all required amendments, including C01–C16/P01–P24.
The [ratification record](#explicit-ratification) preserves their exact wording.
D36 remains ratified; D12's detailed amendments retain their separate status.

This is the finished research/design answer for this decision, under the
[Phase 28 research boundary](phase28-founder-brief.md:21). It does not claim a
working feature, user-tested prototype, formal OpenSpec amendment or release.
No application, schema, live tenant or external communication was changed.

## Decision in plain language

Build a small **Getting started** guide within the missionary workspace's
Resources area. Let the organization edit its advice, order, approved resources
and links to existing work. Make it easy to find, easy to ignore and easy to
revisit. Keep normal work available throughout.

The value is connecting useful advice to the next ordinary action. A course,
progress tracker, second task list or prescribed fundraising method would add
the wrong kind of complexity. The founder has explicitly ruled out required
completion. Tenants control the offered content and its availability; they do
not control an option to make this guide compulsory.

## What the research establishes

The [missionary methods and products research](d37-evidence/missionary-methods-and-products.md)
examines The God Ask, Stewardship Ambassadors/Partnership Development School,
other support-raising guidance and specialist products. The
[coaching/campaign/UX research](d37-evidence/coaching-campaigns-and-ux.md)
compares coaching software and GoFundMe. The [contextual-help and accessibility
research](d37-evidence/root-ux-research.md) supplies independent interaction
principles. Each evidence note identifies exact primary sources and limits.

| Evidence                                                                                                               | Useful lesson                                                                                                           | Deliberate boundary                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The God Ask: Shadrach's public author material                                                                         | Preparation, a clear invitation and relationships are useful content themes.                                            | The full book/course was not reviewed or licensed. Do not reproduce its curriculum or make its theology, script or ask technique a platform rule.                                 |
| Stewardship Ambassadors' Partnership Development School: public About/syllabus                                         | Its method gives follow-up a distinct role and does not seek the financial decision during the initial appointment.     | This differs from other methods. Its specific scripts, follow-up timing or HubSpot setup are not universal Core requirements. No quota is inferred or adopted.                    |
| Scott Morton's Funding Your Ministry and Henri Nouwen's A Spirituality of Fundraising, as verified in the methods note | Support development includes ongoing relationships and stewardship, beyond setting up software or launching a campaign. | Publisher/author descriptions are evidence of themes, not comparative efficacy, full-text access or a norm for all ministries.                                                    |
| MPDX and TntConnect help                                                                                               | Help can be reachable during ordinary work, with a short selection of useful starting topics.                           | Dated documentation is not an authenticated current UI test. Existing CRM data and tasks remain authoritative.                                                                    |
| Sola                                                                                                                   | Public product material offers training and help.                                                                       | Its organization onboarding describes vendor rollout/integration. Neither that page nor marketing proves tenant-editable in-app guidance or measured improvement.                 |
| GoFundMe and coaching products                                                                                         | Previewing, clear next actions and advice close to the work are useful.                                                 | Campaign conversion tools, AI coaching, optional SMS, assigned worksheets, timed courses and completion reports are separate products/permissions. None is needed to deliver D37. |
| NN/g contextual-help research                                                                                          | Dismissible help must also be easy to find again.                                                                       | No first-login takeover, forced tour or disappearing-only entry point. This is cross-product evidence, not a Core user study.                                                     |
| GOV.UK task-list guidance                                                                                              | Completion-state patterns solve long transactions.                                                                      | A voluntary guide is not such a transaction. Ordered suggestions do not justify Completed/Incomplete badges.                                                                      |

**Evidence classification.** Repository facts establish owners, permitted
surfaces and inspected code. Public primary sources establish documented methods
or vendor behavior, with dated limitations. The design below is a product judgment
informed by those facts and the founder's explicit choice. The scenario of Maya
needing a useful first step is illustrative. No interviews, fundraising lift,
conversion gain, ideal step count or ministry-wide preference have been measured.
The design does not require those invented claims to be coherent.

**Strongest alternative.** B—an excellent library resource plus contextual help—
is cheaper and already useful. A is justified by the chosen need for a connected
native path that can open the relevant workspace directly. Its maintenance cost
is acceptable only if it remains one short guide and uses existing resources and
actions. If a tenant only wants a document, it can leave the guide disabled and
offer the document through Resources. There is no migration or feature penalty.

## The missionary journey

### Find it without interrupting work

When a qualified guide is offered, **Resources → Getting started** is its stable
home. The existing Help menu may link to that same destination, not a duplicate
guide. A quiet Home invitation says **“Find a useful next step”**, identifies the
organization and offers **Open guide** and **Hide from Home**. It does not replace
tasks, financial information or the normal dashboard, appear as a modal, or carry
an urgent badge. Only offered, currently permitted content can generate this
invitation.

Hiding the invitation saves only a narrow personal presentation preference for
that user and tenant. It does not imply completion or refusal, and is not exposed
as staff/coach progress. The Resources entry remains. Ordinary guide updates and
disable/re-offer do not reset the preference. **Show on Home** within the guide
can reverse it. No automatic beginner/experienced classification is needed.

### Read and act in any order

The guide has a clear title, organization name, short introduction and an ordered
list of suggestions. The permanent introduction explains: **“Choose what helps
you today. You can use these suggestions in any order and return whenever you
need them.”** Organization advice follows, without being allowed to hide or
contradict the optional nature of this feature.

Each suggestion has an action-oriented heading, a short explanation and, where
useful, one approved resource and one existing workspace entry. Advice-only steps
are valid: reflection, prayer or preparing for an offline conversation need not
produce a CRM record. Keep all short suggestions visible; longer teaching belongs
in the linked resource. Do not hide the entire guide inside nested accordions or
force one-screen-at-a-time navigation.

When both destinations are present, give the workspace action clear prominence
and use an ordinary descriptive resource link beside it; avoid two competing
primary buttons or making the whole step a nested clickable card.

Visually, use the existing PageHeader, readable text column and shared list/item
patterns, with generous Maia spacing and a restrained hierarchy. A clear heading
and a short paragraph do more work than decorative illustrations. Keep the main
surface calm: semantic muted secondary text, visible focus, ordinary links and
one dominant action per item; no rainbow cards or large decorative progress
meter. On a phone, content and links stack naturally. In staff editing, a preview
may sit beside the form on wide screens and open as a normal labeled preview on
small screens. Use the existing type, radius, spacing and color tokens throughout.

Resource links identify their useful title, format/language and file size when
known. Workspace links use honest verbs such as **Open contacts**, **Open tasks**
or **Prepare an update**. Opening a link navigates; creating, sharing, sending,
importing, subscribing or changing a record requires the destination's own
ordinary deliberate action and validation. A guide never preselects recipients,
opens private records by guessed identifiers or manufactures an activity.

The guide has no progress bar, completion checkbox, streak, mandatory order,
training deadline or coach score. A resource click does not mean it was read;
opening Tasks does not mean follow-up happened. Existing work can be recorded
once in its normal owner. Returning through Back preserves normal page position
where supported; returning later opens the current offered guide without a new
personal “course session.”

### A concrete low-fidelity content layout

```text
Resources / Getting started

Build your support team                         [Organization name]
Choose what helps you today. Use these suggestions in any order.

Clarify your plan
Review your organization's guidance and prepare a simple explanation
of the work and support you are inviting people to join.
[Read our support-raising guide · PDF · English · size if known]

Prepare for a conversation
Choose a relevant next conversation and prepare using your
organization's approach.
[Conversation preparation]     [Open contacts]

Keep your next step clear
After a conversation, record what actually happened and choose
any follow-up that is useful.
[Open tasks]

[Browse all resources]
```

This is original illustrative copy and structure, not a reproduced curriculum,
approved tenant content, live screenshot or assertion that those resources and
actions are already qualified. Link labels resolve from permitted catalog entries.

### Useful original starting material for staff to adapt

Offer **Start with an example** alongside **Start blank**. Neither creates a live
guide. The example is short, original and fully editable; no named commercial
method is installed or endorsed by default. Suggested content themes are:

| Suggested heading                       | Helpful advice                                                                                                                 | Optional approved destination                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Understand your organization's approach | Read the guidance relevant to your context, including spiritual preparation where your organization provides it.               | Organization-approved orientation or support-raising resource.                                                    |
| Clarify your plan and story             | Prepare a concise explanation of the work and review how the organization handles support needs and giving.                    | Approved planning resource or a separately qualified existing planning entry.                                     |
| Consider your relationships             | Think about people with whom a conversation is appropriate; use information and referrals you are permitted to use.            | Existing contact/preparation entry. No scraping, address-book upload or wealth scoring.                           |
| Prepare for a conversation              | Choose how to invite someone into a conversation and use the organization's approach to presenting the need and invitation.    | Approved conversation resource and relevant existing workspace entry. No universal ask amount or required script. |
| Follow through thoughtfully             | Record the actual outcome and any next step in the ordinary workspace. Respect the person's response and contact preferences.  | Existing Tasks/interaction entry. No task or message is created by reading.                                       |
| Keep partners informed                  | Share appropriate updates and gratitude through permitted channels, with the person's consent and the organization's guidance. | Existing update-preparation entry or stewardship resource; no newsletter subscription or send.                    |

These six themes are an editorial example, **not a fixed step count, a prescribed
sequence or a tenant quota**. Staff can remove, replace, reorder or combine them,
including offering only one useful suggestion. Organizations using other methods
can replace all example text. Experienced missionaries can use an individual
topic without being placed in a beginner program. Actual supported content-size
limits belong to the qualified implementation profile; the editor must show them
before input is lost, not silently truncate material.

### Unavailable, disabled and changing states

| Situation                                             | Maya's experience                                                                                      | Required behavior                                                                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| No guide has been offered                             | Ordinary Home, Resources and work remain useful.                                                       | No empty Getting started navigation item or setup nag.                                                                                      |
| Maya ignores or hides it                              | Work continues unchanged; she can find the offered guide in Resources.                                 | No reminder, compulsory acknowledgment, scoring or staff signal.                                                                            |
| A linked feature is disabled or permission is missing | Only current eligible destinations are offered. Independently safe advice can remain.                  | Do not show a dead action, hidden-resource title or a misleading request-access path.                                                       |
| A resource was withdrawn after the page loaded        | Opening it produces the resource owner's safe unavailable response.                                    | Recheck current authority; no old signed URL, cached title/body or replacement file becomes authority.                                      |
| A guide is disabled while open                        | On the next authorized refresh/navigation it is unavailable; ordinary work remains.                    | No new protected delivery; already delivered bytes cannot be recalled. Existing tasks/resources retain independent rules.                   |
| Staff publish a revision                              | The next load shows a coherent current version. An open page is not rearranged beneath keyboard focus. | No progress reset, completion migration, renewed invitation or automatic action. Current destination checks still apply.                    |
| Slow network or lost connection                       | Text-first loading and honest Retry; no success claim for an unconfirmed action.                       | No offline mutation queue, mandatory video, third-party embed, tracking pixel or background resource download.                              |
| Language or international text differs                | Explicit content language, readable long titles, correct Unicode/RTL/reflow and locale formatting.     | No automatic translation of sensitive content or assumption that English/name formats fit everyone. Existing locale owners govern fallback. |

## The staff journey and tenant controls

Place **Starting guide** beside organization resource management in the authorized
staff context. Do not make Maya an administrator or put a second Mission Control
inside her workspace. The configuration has one purpose: maintain and offer the
organization's guide.

1. **Prepare.** Start blank or copy the original example into a private draft.
   Edit the title/introduction and suggested steps. Each step has a heading,
   short plain-text explanation, optional approved-resource picker and optional
   supported-workspace-entry picker. No raw HTML, arbitrary internal URL or
   executable command fields. Reuse existing external-link resource handling
   rather than building a second URL catalog. Remove a step from the draft
   without deleting its resource or source work.
2. **Arrange.** Move up/down controls work with keyboard and touch; drag reorder
   may supplement them. Field errors sit beside the input and in a focusable
   summary where useful. Show unsaved/saved state honestly. **Save draft** never
   changes the offered version.
3. **Preview.** Use the actual guide renderer in a labeled preview, including a
   narrow-screen view and safe unavailable examples. Preview is not a permission
   impersonation tool. Staff's own access cannot prove every missionary can open
   a resource. Show target-audience incompatibility privately to a curator who
   may inspect it; do not broaden publication to make a link work.
4. **Offer.** **Publish guide** deliberately offers the reviewed first release.
   Explain the audience and that it stays optional. It needs at least one
   nonempty, audience-safe suggestion; no minimum number of links. No separate
   enable toggle is required on top of publication. Publication revalidates
   content, current rights, destination eligibility rules and expected revision.
5. **Maintain.** An available guide shows **Available**, current published
   revision/time and separate draft changes. **Publish changes** replaces the
   current release atomically. Failed validation leaves the old version available
   only while that old version remains independently eligible. A conflict keeps
   the author's unsaved work in the current editor and explains what changed;
   it does not silently overwrite another editor.
6. **Disable or re-offer.** **Disable guide** is always reachable for an authorized
   curator, even with invalid draft edits. It immediately stops new guide
   delivery/discovery under current checks and preserves the draft/publication
   record according to its retention rules. Explain that ordinary resources and
   work remain available under their own rules. Editing while Disabled cannot
   re-enable it. **Offer guide** deliberately revalidates and offers a reviewed
   release; no stale background save or retry can defeat Disable. Its preview
   identifies the exact saved draft to be offered, or the retained release when
   there are no draft changes. It never silently falls back from an invalid
   draft to a different version. A version picker is not needed for ordinary use.

Use one availability meaning—**Not offered**, **Available**, **Disabled**—plus a
clearly separate draft indicator. These are understandable UI labels, not a new
general-purpose workflow framework. Starting with no offered guide is the safe
default. No guide is auto-published for existing tenants. Do not introduce
per-missionary exceptions, mandatory mode, timed delivery, department curricula,
approval chains, custom scoring or multiple parallel guides without a separate
demonstrated need and decision.

An author can make a mistake without needing a new permission model: preserve a
recoverable draft, separate publication and current availability, and use a
reviewed earlier version as a new draft if the existing owner supports it. No
“restore” operation can silently re-offer withdrawn/unauthorized content.

## Fit with Core: current, intended and permanent path

Detailed citations are in [repository governance](d37-evidence/repository-governance.md)
and [publication/access safety](d37-evidence/publication-and-access-safety.md).

| Area                      | Current evidence                                                                                                      | Intended boundary and permanent path                                                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missionary surface        | Inspected header exposes Help/About; navigation and resource searches do not establish a complete native guide.       | P28 owns the bounded starting-guide meaning. Use Resources/Help in the missionary surface; authorized curation stays in staff context.                                                        |
| Resource publication      | D12 selected a curated library; its detailed amendments are not separately ratified.                                  | Reuse compatible source-owned publication/catalog primitives after qualification. A storage bucket or public CMS draft system is not internal-publication authority.                          |
| Files and links           | P29 owns byte custody/retrieval/disposition, with P10 safety and P12 authorization.                                   | The guide references approved resource identity; the resource owner resolves the currently approved content. No duplicate files, byte store, consent store or guide-owned attachment history. |
| Ordinary work             | P9/P27 and other domain owners govern contacts, tasks, actions, stage guidance and consequences.                      | A registered destination opens existing work. It never applies a stage, imports contacts, creates a task, changes financial truth or sends.                                                   |
| Permissions               | ADR0209/current scoped resolution and ADR0211 govern genuine projection expansion. Current code is not qualification. | Qualify exact guide curation/publication/read fields and audience. Do not turn a broad staff role, resource visibility or guide link into a new grant.                                        |
| Settings/publication code | Static inspection identified a default-tenant settings path and public CMS assumptions unsuitable for blind reuse.    | Reuse sound primitives, fix/qualify the actual native command seam before activation; do not copy hard-coded tenant or public audience behavior.                                              |
| Design system             | Shared configuration is Base UI/base-maia with Zinc semantic tokens.                                                  | Reuse existing page shell, list, form, button, dialog and feedback patterns. External products inform interaction, not a replacement visual style.                                            |

Core keeps one authority for each fact: the guide owner for offered guide content,
revision and availability; resource owner for publication and target identity;
P29 for bytes; P12/P10 for current scoped permissions/safety; each destination
domain for its work; an existing qualified preference seam for Home visibility.
There is no authoritative “missionary guide progress” fact in this decision.

The actual schema must enforce one current release per declared tenant guide
scope, coherent version/step references, same-tenant relationships, valid optional
destination variants, protected attribution and revision fields, and bounded
Unicode text. Required identities cannot default to a sample tenant; optional
destinations may be absent. Restrict deletion that would break retained publication
history or independent resources; use the source's disposition rules rather than
an indiscriminate cascade. Index scoped current-release/destination lookups and
qualify actual grants, views, functions/RPCs and privileged paths. Money precision
and contribution tables are unaffected. No table layout or new general schema
framework is prescribed by this review.

Guide text must be independently safe for its approved audience. Known
source-dependent fields use the shared resolver's declared conditions; suppress
the entire affected step when safe separation is not established, with no hidden
count or numbered gap. This is not an ad hoc per-value provenance engine or a
promise that software can recognize arbitrary private text manually pasted by
an author. Authorized content review remains necessary; the editor must neither
auto-copy private records nor offer dynamic personal-data interpolation.

## Exact corrected decision to record

> **A — Optional organization starting guide.** An organization may offer one
> short, editable guide of suggested steps inside its missionary workspace.
> Authorized staff can prepare, preview, publish, change or disable it. The guide
> is not offered until deliberately published. Maya can use any suggestion, skip
> the guide and return through Resources whenever it is offered and currently
> permitted. A dismissible Home invitation links to the same guide.
>
> Suggestions may contain audience-safe advice, approved resources and links to
> existing permitted workspace entries. Content and order are customizable;
> completion is always optional. Links perform navigation only. Ordinary work,
> resource access, financial facts, communications, coaching and contact rights
> keep their existing authorities and are never granted or changed by the guide.
>
> Draft changes remain separate from the offered revision. Publishing, disabling
> and re-offering are deliberate, authorized and protected against stale edits
> and retries. Current resource and access rules apply at display and use.
> Disabling removes the guide without undoing independent work or deleting its
> source resources. No course engine, completion tracking, automatic tasks,
> compulsory sequence, behavioral score or staff/coach progress reporting is
> introduced.

## Required amendments

These are explicitly ratified requirements for later owner/spec reconciliation,
not edits to governing OpenSpec in this research session.

- **C01 — Optionality:** The guide MUST remain optional for every missionary.
  No organization setting, text, step state or guide availability may gate
  ordinary authorized work or require completion/acknowledgment.
- **C02 — Bounded customization:** Authorized staff MAY edit one organization's
  guide title, introduction, suggested-step content/order and permitted
  destinations; offer/disable it; and start blank or from original editable
  examples. No method, number of steps, script, quota or fundraising outcome is
  compulsory. Publication requires at least one nonempty audience-safe suggestion.
- **C03 — Discovery:** An offered guide MUST have a stable Resources entry.
  Home/Help links MUST resolve to that same current guide. Home dismissal MUST
  affect only the current user's tenant-scoped presentation preference, remain
  reversible and survive routine revisions/re-offer without becoming a progress
  or staff/coach reporting signal.
- **C04 — Content and rights:** Staff MUST approve guide text for its exact
  audience and have rights to linked or reused material. Publication MUST NOT
  copy restricted record context, commercial curricula or source metadata into
  an independently broader guide. A linked resource retains its own publication,
  audience, classification and disposition rules. Reject known restricted
  source-bound content through declared source conditions and require authorized
  content review; do not claim to detect all manually pasted sensitive text or
  introduce an automatic semantic classifier.
- **C05 — Destinations:** A step MAY contain advice without a link, at most one
  approved resource reference and at most one registered existing workspace entry.
  Destination selection MUST NOT accept arbitrary internal routes, record IDs,
  script/HTML, mutation payloads or guide-owned external-link catalogs. Browsing,
  preview, prefetch and opening MUST NOT execute source mutations or communicate.
- **C06 — Current reads:** Authorize guide and resource metadata before
  enumeration/count/serialization/preview/retrieval. Reauthorize destinations at
  use. Denied/withdrawn targets and dependent unsafe wording MUST be withheld;
  independently safe advice and other eligible suggestions MAY remain. No hidden
  titles, URLs, bytes, identifiers, counts or numbered gaps may leak through
  unavailable states. Apply declared shared-resolver conditions to known
  dependencies; withhold the whole affected step when safe separation is not
  established. Do not infer field safety through ad hoc text analysis. Recheck
  relevant current authority after waits and at the final governed response-
  release boundary; reject known-obsolete responses after user/tenant/context
  changes or Disable. These rules cannot recall bytes already lawfully released.
- **C07 — Publication:** Save draft MUST NOT change availability or publication.
  Publish/Publish changes MUST atomically validate and accept an entire reviewed
  revision under current capability and expected base revision. Readers MUST
  receive a coherent permitted release, not partial draft/old/new combinations.
- **C08 — Disable/re-offer:** Disable MUST stop new guide discovery and delivery
  under current access checks without deleting independent resources or work.
  It MUST remain operable despite invalid unsaved drafts. A stale save, publish,
  restore or retry MUST NOT re-offer a disabled guide. Re-offering requires a
  fresh authorized deliberate command and current source qualification.
- **C09 — Trusted mutation:** Tenant, actor, authorship and audit attribution MUST
  derive from trusted context. Scope and immutable identities MUST be enforced
  server-side and through tenant-aware relationships, grants and RLS; caller
  updates MUST NOT move a row to a forbidden tenant, owner, audience or state.
- **C10 — Evidence/recovery:** Accepted publication/availability effects MUST
  retain minimal durable source-owned revision, actor and outcome evidence.
  Duplicate delivery/lost-response recovery MUST resolve the accepted effect
  without a second publication or renewed availability. Audit failure MUST NOT
  leave an unaudited accepted effect. Current state and prior command outcome
  MUST remain distinguishable. Recovery MUST preserve the accepted effect while
  disclosing its outcome/current state only under the requester's current read
  authority; it grants no renewed availability or access. No generic CRM command
  journal is added.
- **C11 — No inferred outcomes:** Opening, hiding, following or returning to the
  guide MUST NOT become reading/completion credit, a task, interaction, gift,
  send, subscription, coaching assignment, consent, monitoring or automated
  reminder. Existing independent source actions retain their own evidence.
- **C12 — Presentation:** Use Core's exact shared Base UI/base-maia system,
  semantic tokens, ordinary accessible page hierarchy and text-first layout.
  Keep essential suggestions visible without a forced wizard. Reorder MUST
  work without dragging and with keyboard; status/errors MUST not rely on color,
  hover or toasts alone. Preserve Core touch targets, reflow and reduced motion.
- **C13 — Privacy and retention:** Apply existing classified-source retention,
  disposition, logs/export/backup and cache rules to guide drafts/releases and
  preferences. Do not add guide-specific behavioral browsing/progress tracking;
  preserve separately required minimized source/security access audit. Do not add private content
  to analytics, external URLs, logs or public CMS exports. Disable is not deletion;
  later restoration MUST honor subsequent withdrawal/erasure and current rights.
- **C14 — Performance/dependencies:** Guide reading MUST use bounded current
  content and batched scoped destination resolution, not per-step full histories
  or cross-tenant scans. Establish enforced request/content limits and measured
  mobile/network budgets before activation. No third-party onboarding, AI,
  course, URL-unfurl, tracking or video dependency is required.
- **C15 — Safe adoption:** Existing tenants MUST begin without an offered guide;
  seeding examples is draft-only. Capability qualification and backward-compatible
  schema/API/read/write behavior MUST precede activation. Old clients and jobs
  MUST NOT publish/enable through weaker paths. Rollback/kill controls MUST
  preserve accepted source history and current denial.
- **C16 — Traceability:** Reconcile these exact meanings through the accepted
  P28 owner and any affected P12/resource projections at `/to-prd`; carry them
  into implementation tasks/tests/release evidence at the authorized stages.
  D37 MUST NOT silently ratify D12 amendments, add an LMS, reopen settled
  optionality or claim implementation/qualification from documentation.

## Adversarial category review

Likelihood is a qualitative design-risk judgment **if the stated prevention is
omitted**, not an observed incident rate. Severity describes plausible impact.
Each row explicitly identifies material concern, evidence/reasoning, effect on
A and the permanent requirement. Shared causes are consolidated into C01–C16
without skipping independent categories.

| Category                                                     | Material concern, consequence and evidence                                                                                                                                                                                                                                                       | Severity / likelihood; effect on A                                           | Permanent prevention and exact requirement                                                                                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity and alternatives                 | **Yes.** A second portal could add maintenance without helping someone choose a next step. D12 already permits a useful written guide; no Core study proves native superiority.                                                                                                                  | Medium / plausible; narrows A.                                               | Keep the connected native path small; preserve B through Resources and Disabled. C01–C03, C14.                                                                             |
| Brittleness                                                  | **Yes.** Guide instructions or links can outlive permission, resource, feature or route changes, creating broken or unsafe next steps. Repository ownership is independent.                                                                                                                      | High / likely over time; changes implementation boundary.                    | Source references and registered entries, current checks and partial safe rendering; no frozen URL/byte authority. C04–C06.                                                |
| Technical debt                                               | **Yes.** Copying public CMS/configuration code or making a second task/resource store creates dual authority; inspected code does not prove private-guide qualification.                                                                                                                         | High / plausible; narrows architecture.                                      | Bounded P28 owner reuses qualified primitives, with resource/source authority retained. C05, C07–C10, C16.                                                                 |
| Edge cases                                                   | **Yes.** No configured guide, one advice-only step, changed language, unavailable resource, disabled feature or experienced user can produce empty/dead/confusing UX. These are direct consequences of optional publication.                                                                     | Medium / likely; specifies A.                                                | Journey state table, audience-safe advice, no compulsory links or beginner category, accessible fallback. C01–C06, C12.                                                    |
| Footguns                                                     | **Yes.** Save may publish, Disable may delete independent work, or a destination click may execute a task/send. Those would violate the selected intention.                                                                                                                                      | High / plausible; requires amendment.                                        | Explicit draft/publication/availability actions and navigation-only destinations. C05, C07–C08, C11.                                                                       |
| Tenant safety                                                | **Yes.** A default-tenant setting, wrong cache key or broad resource picker could expose another organization's text or draft. Current static settings hazard is documented in the safety note.                                                                                                  | Critical / plausible absent controls; blocks unsafe reuse.                   | Trusted tenant, scoped reads/relations/cache/preference keys and actual tenant-negative proof. C06, C09, C13.                                                              |
| Database, RLS and authorization                              | **Yes.** Read access could imply curation, and an allowed UPDATE could switch tenant/author/audience or bypass publication. Schema/grants are not yet implemented/qualified.                                                                                                                     | Critical / plausible; adds mandatory implementation safeguards.              | Deny-by-default grants; inspect both USING and WITH CHECK; tenant-aware FKs, immutable attribution, expected-revision/atomic publication, privileged-path parity. C07–C10. |
| Overengineering                                              | **Yes.** Importing courses, automatic action generation, progress records, workflow builders or per-user curricula would overwhelm the chosen small job. Vendor capabilities are not a requirement.                                                                                              | Medium / likely if scope is not bounded; narrows A.                          | One guide, fixed supported destinations, no progress/mandatory mode; reuse resources. C01–C05, C11, C14.                                                                   |
| UX/UI and user friction                                      | **Yes.** A forced tour, hidden-only help, endless accordion or drag-only editor frustrates users. NN/g/W3C and Core rules directly support the alternatives.                                                                                                                                     | Medium / likely; changes presentation.                                       | Stable return path, dismissible invitation, short visible advice, plain controls, keyboard/touch, long-text/RTL/low-bandwidth checks. C03, C12.                            |
| Source of truth, ownership and invariants                    | **Yes.** A guide could become authority for resource publication or work completion. D12/P29/P12/P27 boundaries prohibit that inference.                                                                                                                                                         | High / plausible; narrows A.                                                 | Guide owns offered advice only; external source owners retain facts/rights, no progress entity. C04–C11, C16.                                                              |
| Hidden coupling                                              | **Yes.** Step numbers could become progress keys; help could depend on optional AI/coaching/communications or a removed feature.                                                                                                                                                                 | Medium / plausible; narrows design.                                          | No saved ordinal progress, navigation-only registered entries, optional resources independently qualified. C05–C06, C11, C14.                                              |
| Failure modes                                                | **Yes.** Publish succeeds but response is lost; old version is withdrawn; draft save fails. False success or blind retry could expose wrong content.                                                                                                                                             | High / plausible; requires recovery semantics.                               | Resolve accepted outcome/current state, preserve unsaved editor text while authorized, reject stale commands, fail closed for protected data. C06–C10.                     |
| Lifecycle, temporal correctness, concurrency and idempotency | **Yes.** Publish racing Disable or two editors can undo an intentional withdrawal or combine revisions. Retrying an old accepted Publish must not re-enable.                                                                                                                                     | High / plausible under normal concurrency; requires amendment.               | Current expected revision for whole guide/availability, atomic acceptance, effect-bound recovery and fresh re-offer. C07–C10.                                              |
| Data integrity                                               | **Yes.** Copied links, draft fragments, lost edits or replaced resource identities could misrepresent approved advice.                                                                                                                                                                           | High / plausible; changes mutation design.                                   | Coherent revisions, stable source references, conflict feedback, no silent substitution or truncation. C04–C10, C14.                                                       |
| Security and privacy                                         | **Yes.** Safe links do not make copied private text safe; logs/previews/exports or broad publication could expose supporter/ministry context.                                                                                                                                                    | Critical / plausible; narrows content and audience.                          | Qualify guide text and destination metadata independently, current field-level access, minimization/retention, no public publication shortcut. C04, C06, C09, C13.         |
| Scalability and performance                                  | **Yes.** Unbounded steps/media or N+1 authorization/full-history joins make a small guide slow, especially in field conditions. No measured Core capacity exists for this feature.                                                                                                               | Medium / plausible; requires bounded qualification, no invented scale claim. | Enforced content/request limits, batched reads, text-first rendering and production-shaped mobile tests. C12, C14.                                                         |
| Operational burden                                           | **Yes.** Broken or stale resources and ambiguous editor ownership can leave staff with a maintenance chore.                                                                                                                                                                                      | Medium / likely over time; narrows workflow.                                 | One maintained guide, existing resource management, actionable curator errors, Disable reachable, no recurring developer repair. C02, C06–C08.                             |
| Observability and auditability                               | **Yes.** Technical logs alone cannot prove who offered or withdrew a version; tracking every reader would create an unnecessary surveillance feature.                                                                                                                                            | High / plausible; separates required evidence from analytics.                | Minimal durable author/publication history and technical failure signals, no missionary progress. C10–C11, C13.                                                            |
| Dependency and integration                                   | **Yes.** A course vendor, changed external resource or copied paid material could make native help unavailable or unlicensed.                                                                                                                                                                    | Medium / plausible; narrows dependencies.                                    | Original editable example, approved resource links, no vendor account/API prerequisite, source-owned external link rules. C04–C05, C14.                                    |
| Migration, rollout and upgrade                               | **Yes.** Auto-published samples, old clients or restored backups could expose content without deliberate offer or bypass Disable.                                                                                                                                                                | High / plausible; requires activation safeguards.                            | Draft-only examples/default not offered, additive compatibility, revoke-aware restore and kill path. C08, C13, C15.                                                        |
| Testability, traceability and proof                          | **Yes.** “Beautiful” or “fully functional” alone is not falsifiable; selected advice could be mistaken for shipped behavior or ratified D12 changes.                                                                                                                                             | High / likely without precise status; requires proof boundaries.             | C01–C16 and P01–P24 below, exact research/status/source trail, real future runtime evidence. C16.                                                                          |
| Other development hazards                                    | **No additional material concern beyond those above.** Reviewed coercive methods, copyright, donor/public surfaces, money, localization, retention and restoration. The guide has no new money/send/consent semantics; commercial-method rights and unsafe doctrine-as-gate are already covered. | No separate finding; A remains valid with amendments.                        | Preserve C01, C04–C05, C11–C16; do not add speculative controls to address an unobserved new hazard.                                                                       |

## Required proof and acceptance criteria

These are falsifiable future acceptance criteria, not tests claimed to have run.
Static documentation checks are recorded separately below.

- **P01:** With no offered guide, Maya can use ordinary authorized workspace
  actions and Resources without a guide gate, empty guide tab or setup nag.
- **P02:** Publishing one advice-only suggestion offers a usable guide; a blank
  or wholly unsafe guide cannot publish. Neither operation creates a task.
- **P03:** From Home/Resources/Help, permitted entry points resolve to the same
  offered revision. Hide from Home leaves Resources usable; re-offer does not
  reset the preference; another tenant/user is unaffected.
- **P04:** Maya can open the last suggestion first, leave, do ordinary work and
  return without completion, sequence or required-acknowledgment state.
- **P05:** Opening, previewing and prefetching every supported destination
  creates zero contacts/tasks/sends/subscriptions/financial effects/coach grants.
- **P06:** Existing destination actions retain their own normal permissions,
  validation, deliberate acceptance and actual outcome evidence.
- **P07:** Two tenants with similar names/IDs cannot enumerate/read/edit each
  other's guide, draft, publication history, resource picker or preference.
- **P08:** A missionary without current guide-curation authority, unrelated staff
  member and revoked curator cannot save,
  publish, disable, re-offer or change attribution through any API/RPC/direct path.
  A person separately authorized to curate may act in that qualified organization
  context; missionary identity alone neither grants nor removes that capability.
- **P09:** An otherwise allowed update cannot move tenant/owner/audience/author
  or attach an out-of-scope source. Database USING/WITH CHECK, grants, functions,
  views, storage and service-role paths preserve that result.
- **P10:** Save draft leaves the offered revision unchanged; invalid Publish
  leaves only the independently eligible prior release available.
- **P11:** Concurrent editors cannot silently overwrite. Reorder/replacement
  publishes a single coherent revision; drafts never appear to Maya.
- **P12:** Publish racing Disable has one serialized result. A stale publish/save
  and replay of a previously accepted command cannot re-offer after Disable.
- **P13:** Lost Publish/Disable responses recover the original effect and current
  state only under current disclosure authority, without duplicate publication,
  guessed success or granting new access.
- **P14:** Revocation/withdrawal between listing, preview and target open denies
  protected titles/body/bytes/IDs; safe unrelated suggestions remain usable.
  Include waits and final governed release, and discard known-obsolete responses
  after same-user tenant/context changes or Disable. Do not assert recall of
  already delivered content.
- **P15:** A known restricted source-bound title/context fixture cannot pass
  broader audience publication or subsequent current read. Authorized review
  checks authored text; this test does not certify detection of arbitrary manual
  paste. A genuinely permitted generic paragraph can
  survive independent resource withdrawal without recreating source details.
- **P16:** Draft-only seeding, feature disable and rollback do not delete normal
  resources/tasks, auto-publish content or restore erased/withdrawn sources.
- **P17:** Malicious markup, script schemes, arbitrary internal URLs, caller-
  supplied action payloads and oversized input are rejected/escaped at the
  authoritative boundary; errors preserve valid editor work without truncation.
- **P18:** Keyboard and touch users can add/edit/reorder/remove/preview/publish
  and disable without dragging. Focus and status announcements remain usable
  after reordering, validation, conflict and unavailable-content changes.
- **P19:** Phone width, 200% text zoom/320 CSS-pixel reflow, long international
  text, RTL where supported, contrast, reduced motion and Core touch targets pass
  appropriate automated and manual checks. No hover-only instruction or video
  is necessary to finish the journey.
- **P20:** Slow-network and interrupted-save tests show honest pending/error/
  accepted feedback, Retry and no unintended effects or persistent private
  offline draft/browser cache. Navigation meets the existing app contract.
- **P21:** Production-shaped tests at the enforced maximum guide size show bounded
  scoped/batched reads, no per-step full-history query and the measured profile's
  mobile/render/latency budgets. Record actual limits, units and evidence before
  activation; a document cannot certify performance.
- **P22:** Curator publication history records actor, revision, availability
  transition and durable result. Logs/analytics/exports contain no new missionary
  progress or private resource/record content; restore respects later disposition.
- **P23:** Representative missionaries can find a relevant suggestion, skip it,
  reach ordinary work and return; staff can edit/publish/disable and explain
  draft versus offered content. Record observed failures and fix misleading
  optionality/access/publication before release, without claiming a user study
  from this research. Include novice and experienced, mobile and assistive-tech
  perspectives without permanent product classifications.
- **P24:** The accepted decision, glossary, owner amendments, generated
  projections, design, tasks, implementation tests and release evidence agree.
  Selected/reviewed/ratified/implemented/qualified/activated remain distinct.

## Ruthless synthesis and order of work

**Resolved before recording this answer:** the founder explicitly settled
optionality; the named methods were identified and compared; the real simpler
alternative was evaluated; Core owners/design-system conflicts were checked;
the solution excludes a course, automatic work and copied commercial curriculum.
This answer records A plus review amendments, not a claim of completed software.

**Capture in the later owner/spec/design stage:** the exact decision, C01–C16,
journeys, one-guide publication/availability semantics, current destination rules,
original editable example and P01–P24. Reconcile bounded P28 publication and
P12/resource fields with governing ADR0209/0211 only where actual audience
expansion requires it. D12's reviewed amendments must retain explicit status;
do not smuggle their ratification through this guide. No new generic CMS, storage
or workflow service is necessary.

**Implementation order and dependencies:** first qualify tenant-scoped guide
publication and existing resource/action sources; then staff editing/preview and
atomic offer/disable/recovery; then the shared missionary renderer and discoverable
entry points; then permission-race, migration, accessibility, field-network and
user-journey qualification. Source boundaries precede a polished UI because
unauthorized content cannot be repaired by hiding a button. No special AI,
coaching, email, course or third-party integration is a dependency.

**Required implementation safeguards, not monitor-only risks:** tenant isolation,
trusted attribution, safe publication, current resource access, no hidden effects,
optional ordinary work, lossless conflict/error recovery and accessible controls.
Failure of any relevant P criterion blocks activation of that path. Actual
schema, SQL constraints/grants, producer qualification and performance limits
belong to the implementation evidence; they are not asserted by current code.

**Residual monitoring after qualification:** thresholds below are ratified
design triggers, not measured baselines. Named roles must be assigned to
real owners before activation. Do not collect individual reading/progress to
measure usefulness.

| Signal                                                                                     | Threshold                                                                          | Owner                                                               | Response                                                                                                                                                            |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verified tenant/audience leak or unintended source effect from guide navigation            | Any one confirmed event                                                            | Core security owner + affected domain owner                         | Disable the affected guide path, contain the issue, investigate source/audit evidence, require the failing acceptance case before reactivation.                     |
| Lost accepted publication, stale command re-offer or unaudited availability effect         | Any one verified invariant breach                                                  | P28 guide engineering owner                                         | Stop affected mutations, recover from source history without deleting independent work, fix/retest concurrency and replay.                                          |
| Referenced resource/entry becomes unavailable                                              | Any detected withdrawn/invalid destination                                         | Tenant's authorized guide curator; platform owner if resolver fault | Withhold unsafe target immediately, surface one actionable maintenance notice in existing management, update/remove it; no missionary nag or automatic replacement. |
| Repeated inability to understand optionality, return path or draft/publication distinction | The same failure observed in two independent usability sessions or support reports | P28 product/design owner                                            | Review wording/placement and test a targeted correction; do not add completion tracking or mandatory walkthroughs.                                                  |

The exact referral-duration scope still open after D36 is unrelated to D37 and
remains recorded in the session. The original answer review posed no Q38; these
amendments are now ratified. Required future engineering proof is named rather than claimed;
no extra founder choices are needed to deliver this bounded design.

## Evidence and verification

- [Repository governance and source map](d37-evidence/repository-governance.md).
- [Primary missionary methods and products](d37-evidence/missionary-methods-and-products.md).
- [Coaching, campaign and UX comparison](d37-evidence/coaching-campaigns-and-ux.md).
- [Publication, data and access safety](d37-evidence/publication-and-access-safety.md).
- [Journey counterexamples](d37-evidence/journey-counterexamples.md).
- [Root contextual-help/accessibility research](d37-evidence/root-ux-research.md).
- [Original unanswered Q37](d37-evidence/q37-before-answer.txt) and
  [all twenty D36 evidence hashes](d37-evidence/prior-evidence-sha256.json).

Documentation verification and independent cross-review are recorded in
[review verification](d37-evidence/review-verification.json) and
[cross-review resolution](d37-evidence/cross-review-resolution.md). No prior
model/probe/verifier is executed. No artificial behavioral model is needed for
this documentation change. Future UI, database and concurrency acceptance
criteria are not represented as tests already passed.

## Explicit ratification

On **October 18, 2026 Asia/Bangkok**, the founder instructed: **“Ratify this
decision and amendment. Then continue with this phase 28 grill-with-docs session.”**
The complete [corrected D37 decision](#exact-corrected-decision-to-record),
C01–C16/P01–P24 and required design amendments are explicitly ratified. The exact
decision and clause wording is unchanged. This includes always-optional use,
tenant offer/edit/disable, the bounded guide and original adaptable examples,
current resource/action authority, deliberate publication and safe recovery.
It establishes intended behavior, not implementation or release qualification.

The [pre-ratification review](d37-evidence/d37-before-ratification.txt),
[answered Q37](d37-evidence/q37-before-ratification.txt) and all twelve original
D37 evidence files are preserved in the
[ratification evidence manifest](d37-evidence/ratification-evidence-sha256.json).
The [new verification](d37-evidence/ratification-verification.json) checks wording,
status, references and preservation without executing any prior model, probe or
verifier. No formal owner/PRD/ADR/OpenSpec, application/schema, live data,
external communication or GitHub state changes. D12's detailed amendments and
D36's unresolved initial-referral period scope retain their separate status.
