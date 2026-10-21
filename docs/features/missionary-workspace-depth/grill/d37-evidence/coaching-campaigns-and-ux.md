# D37 — optional starting guidance: coaching, campaign and UX research

Research date: **October 18, 2026 UTC**. Repository baseline:
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`, with the current shared working tree.
The founder selected optional starting guidance and explicitly clarified that
missionaries may choose whether to use it; tenants may offer, edit or disable it.
The design below is a **recommended amendment**, not already ratified wording,
implemented behavior or permission to change formal owner contracts.

**Recommendation: accept with required amendments.** Provide one short native
guide through the existing Resources/help context. It connects approved material
to existing work without recording a learning journey or becoming a prerequisite
for ordinary work. Its value is orientation and easy return, not more tracking.

## Evidence limits and governing context

This pass directly opened current primary product documentation and UX/accessibility
guidance, and inspected the listed repository files. No authenticated vendor UI,
Core app/browser, user interview, fundraising result, database, assistive-technology
or performance test was performed. Vendor marketing claims are not forecasts for
Asym. Publication dates below differ from the retrieval date. An undated current
page does not establish when a capability shipped or whether every account has it.

| Repository evidence inspected                                                                                                                                                                               | Established fact and consequence                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Founder brief:79](../phase28-founder-brief.md:79), [237](../phase28-founder-brief.md:237)                                                                                                                  | Consider optional organization-approved starting help without separate beginner/experienced CRMs, compulsory courses or an LMS.                                                                                                                                                                                                            |
| [Q37 original choice](q37-before-answer.txt:10)                                                                                                                                                             | A adds a short native path; B already offers useful library material and contextual help. Selecting A does not select saved completion, reminders, assignment or monitoring. Its original unanswered text is historical question evidence; the founder's subsequent selection governs this note.                                           |
| [D12 decision](../phase28-d12-resource-library-decision.md:15), [C01–C03](../phase28-d12-resource-library-decision.md:105), [C07](../phase28-d12-resource-library-decision.md:160)                          | Organization-managed library is selected; its detailed amendments retain their own recorded status. Resource-purpose publication, P29 custody and P12 current access must be qualified. Opening never proves reading, comprehension or completion. D37 must explicitly adopt needed boundaries rather than silently ratify all D12 design. |
| [Missionary surface](../../../../../openspec/specs/platform-surfaces/spec.md:73)                                                                                                                            | Staff administration stays in its proper context; the missionary experience must remain useful and avoid a second Mission Control.                                                                                                                                                                                                         |
| [P27 advisory stage guidance](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:837)                                                                                           | Starting guidance must not become a second stage system, prerequisite checklist or enrollment mechanism.                                                                                                                                                                                                                                   |
| [UI instructions](../../../../../packages/ui/AGENTS.md:5), [configuration](../../../../../packages/ui/components.json:3), [frontend rules](../../../../ai/rules/frontend.md:14)                             | Exact Base UI/base-maia, Zinc semantic tokens and shared `@asym/ui` components govern; external systems supply lessons, not their component libraries or visual identity.                                                                                                                                                                  |
| [Missionary header](../../../../../apps/missionary/components/app-header.tsx:47), [About page](../../../../../apps/missionary/app/help/about/page.tsx:20)                                                   | A Help menu currently links to About/build information. This is a useful discoverability seam, not an implemented tenant guide.                                                                                                                                                                                                            |
| [Dashboard entry](../../../../../apps/missionary/app/page.tsx:1), [shared dashboard](../../../../../packages/missionary/components/dashboard-home.tsx:205)                                                  | The route composes the shared missionary dashboard. Do not fork that dashboard or replace ordinary work with an onboarding screen. This bounded inspection does not certify its financial or task projections.                                                                                                                             |
| [PageHeader](../../../../../packages/ui/components/page-header.tsx:15), [Item](../../../../../packages/ui/components/shadcn/item.tsx:11), [Empty](../../../../../packages/ui/components/shadcn/empty.tsx:5) | Shared responsive hierarchy/list/empty-state building blocks exist. Reuse and compose them; their existence alone does not prove the proposed journey accessible.                                                                                                                                                                          |
| [Accessibility review skill](../../../../ai/skills/accessibility-review/SKILL.md), [testing rules](../../../../ai/rules/testing.md:26)                                                                      | Use native semantics and current shared primitives, test actual focus/keyboard/touch behavior, and distinguish document verification from UI conformance. No UI code or primitive was changed in this pass.                                                                                                                                |

## Fresh external evidence and bounded lessons

All sources in this table were directly opened on **October 18, 2026**. Content
claims are intentionally small; none licenses copying a vendor's curriculum,
illustrations, worksheets, video or complete checklist into Asym.

| Primary source and displayed date                                                                                                                                                             | What was directly verified                                                                                                                                 | Lesson and limit for D37                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GoFundMe — Smart Fundraising Coaching](https://support.gofundme.com/hc/en-us/articles/33680613658011-Using-GoFundMe-s-Smart-Fundraising-Coaching), updated September 28, 2026                | Describes questions supporting campaign creation, preview before Launch, subsequent personalized tasks and separately optional SMS coaching.               | Review before publication and explicit optionality are useful. Its AI authoring, contact recommendations, proactive tasks/SMS and suggested amounts are outside D37; “optimized” is the vendor's claim.                                                  |
| [GoFundMe — Best Practices Checklist](https://support.gofundme.com/hc/en-gb/articles/14301733024667-GoFundMe-Best-Practices-Checklist), updated February 1, 2024                              | Offers guidance for beginning weeks as an image and downloadable 3 MB PDF.                                                                                 | Supports the strongest simpler library-only alternative. This pass verified the page/available download, not every checklist item or the PDF's accessibility; help-vote counts do not establish representative efficacy.                                 |
| [GoFundMe Pro — Create a fundraising page](https://prosupport.gofundme.com/hc/en-us/articles/37288801117339-Create-a-fundraising-page), updated February 3, 2026                              | Documents organization-controlled fundraising options, organization-supplied page content and later fundraiser editing, with related supporter help links. | Relevant organization/fundraiser division and contextual resources. Asym must not copy automatic public-page creation, goal defaults or public launch behavior into an internal guide.                                                                   |
| [CoachAccountable — Client Courses](https://www.coachaccountable.com/clientKnowledgeBase/courses), current undated KB                                                                         | Courses can release items by steps or days; progress display is configurable and completed courses remain under Past.                                      | Demonstrates the extra state a course product requires. Do not import gates, dates, progress or completed-course semantics into this guide.                                                                                                              |
| [CoachAccountable — Self-Assigned Worksheets](https://www.coachaccountable.com/clientKnowledgeBase/worksheets/selfAssigned), current undated KB                                               | Where enabled, clients choose a worksheet and Begin; they can later set due dates/reminders.                                                               | Useful distinction between offered material and a client's deliberate choice. D37 stops at voluntary help; it does not self-assign work, schedule reminders or collect answers. Screenshot filenames are not publication dates.                          |
| [Practice Better — Navigating Your Client Portal](https://help.practicebetter.io/hc/en-us/articles/360004032552-Navigating-Your-Client-Portal), updated August 24, 2026                       | Describes dashboard resources, quick actions and navigation, but explicitly warns that its navigation redesign is rolling out and screenshots can lag.     | Learn persistent resource discoverability. Do not copy dashboard curriculum/progress, healthcare data or security claims, and do not call its screenshots a verified current layout for every user.                                                      |
| [Sola — Features](https://www.trustsola.com/features), current undated marketing page                                                                                                         | Advertises written support-raising instructions, practical tips and coach videos available when needed.                                                    | Confirms the comparable help job. No evidence here establishes tenant authoring, a dismissible guide, measured fundraising improvement or a requirement to copy its planning/accountability model.                                                       |
| [Sola — Onboarding Process](https://www.trustsola.com/onboarding), current undated page                                                                                                       | Describes organization rollout, data integration, trial users and vendor support.                                                                          | This is not evidence of an in-product missionary starting guide. Its trial size and integration architecture are not D37 requirements.                                                                                                                   |
| [Salesforce — Customize the Help Menu](https://help.salesforce.com/s/articleView?id=sf.customhelp_lexhelpmenu.htm&language=en_US&type=5), current page without displayed update date          | Documents one organization help section with ordered labeled resource links, save/enable controls, and a mobile-app exclusion.                             | Supports bounded curated help and clear organization attribution. Do not import its resource limit, powerful admin roles, untranslated-label limitation or absence from mobile. The actual article body was read, not merely its large navigation index. |
| [WordPress — Revisions](https://wordpress.org/documentation/article/revisions/), updated September 28, 2026                                                                                   | Documents saved revisions and comparison; autosaves do not overwrite published content.                                                                    | Preserve the distinction between draft and visible revision. Its storage design, retention defaults and restore semantics are not Core authority or a new CMS dependency.                                                                                |
| [WordPress — Page/Post Settings](https://wordpress.org/documentation/article/page-post-settings-sidebar/), last-updated field October 24, 2024                                                | Separates draft and published states and documents editing/publication controls.                                                                           | A useful dated editorial precedent. WordPress's “Published: Visible to everyone” must not become Asym's private organization publication meaning; schedules, passwords and taxonomy are unnecessary here.                                                |
| [NN/g — Onboarding Tutorials vs. Contextual Help](https://www.nngroup.com/articles/onboarding-tutorials/), February 12, 2023                                                                  | Recommends easy dismissal and recall, help relevant to the current job and avoiding unnecessary upfront instruction.                                       | Supports an optional, revisitable guide without takeover. Its general UX research is not a Core missionary study or proof that this guide improves donations.                                                                                            |
| [GOV.UK — Task list](https://design-system.service.gov.uk/components/task-list/), current undated guidance                                                                                    | Advises evidence before using task lists for complex services and simplifying first. Its component represents actual unfinished/completed work.            | Do not reuse task-completion badges merely because the guide has an ordered list. D37 suggests options, not tracked obligations.                                                                                                                         |
| [W3C — Consistent Help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html), current explanatory guidance                                                                       | Repeated help mechanisms must retain consistent relative ordering under the criterion's conditions.                                                        | Keep help discoverable across layouts. This criterion does not itself require adding a help mechanism to every page.                                                                                                                                     |
| [W3C — Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), updated August 10, 2026                                                                      | A non-drag single-pointer alternative is required where dragging is not essential; keyboard equivalence alone is insufficient.                             | Staff reordering needs clickable/tappable Move up/down controls even if drag is also supported.                                                                                                                                                          |
| [W3C — Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) and [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), current explanatory guidance | Explain narrow-layout reflow and programmatic communication of meaningful status changes.                                                                  | Verify the actual editor/guide at 320 CSS pixels and meaningful save/error feedback without forced focus or repetitive announcements. Guidance is not a conformance result.                                                                              |

The relevant transfer is a brief, voluntary explanation connected to the product.
No source establishes a universal fundraising sequence, preferred number of
steps, required training duration or optimal completion metric for ministries.
No such number or metric should be copied from a vendor or invented here.

## Minimal information architecture

Use **Getting started** as a clearly described native guide inside the existing
**Resources** area, with a stable Help entry pointing to that same guide when
currently available. The source is singular; two entry points do not create two
copies. The guide remains reachable when Maya returns months later. Do not add a
new top-level training workspace, permanently split novice/veteran navigation,
force an account-creation tour, or block the daily queue behind a guide.

Resources plus consistent Help is the strongest minimal placement. Root's
proposed reviewed design additionally offers a quiet home invitation with
**Open guide** and **Hide**; this is a product judgment about discovery, not a
researched necessity or an inferred founder requirement. Hiding it saves only
a narrow tenant/user presentation preference, persists across content versions
and does not hide the guide's ordinary Resources entry. It must not become guide
completion, an opt-out from ordinary work or a tenant-visible engagement signal.
No repeated prompt follows a guide edit or disable/re-enable. If the invitation
is included, it needs honest save/recovery behavior like other preferences;
ordinary work and guide access never wait for it. User-supplied “optional” does
not require a second questionnaire asking whether Maya is a beginner.

Prefer a single page with a short introduction and scannable suggested items.
Each has a descriptive title and one concise explanation, with an optional
approved resource and optional supported workspace entry. A reflection/advice-only
item can be useful; support raising is not reducible to clicking CRM controls.
Where both links are present, use one clear primary entry and a secondary resource
link, not competing large call-to-action cards. At least one nonempty suggested
item is required to offer a guide; a blank guide is not a helpful configured state.
Use a real list with good heading structure, not a carousel, canvas, skill tree,
wizard or a card wall. Ordering communicates a suggested path, not locked steps.
All currently permitted items are independently usable. Avoid checkboxes,
percentages, scores, due dates, overdue badges and “Finish setup” language.

Illustrative opening copy:

> **Getting started**  
> Suggestions from [Organization] for finding your next useful step. Use what
> helps and return whenever you like. This guide is optional.

If language metadata is relevant, display it honestly. Preserve international
text and RTL rendering. Do not infer culture or ministry stage from geography,
names, giving levels or profile fields; do not promise automated translation.

## Complete staff journey

### Prepare and arrange

Authorized organization curators manage the guide alongside Resources in their
existing administration context. Reading or contributing to another feature
does not make someone a guide publisher. A missionary who separately has valid
curator authority uses that appropriate context, without role-name shortcuts.

Keep editable content focused: guide display title/introduction, suggested-item
title and short explanation. Keep the navigation label **Getting started** stable
so staff's editorial title cannot make the feature impossible to find. For an
item, optionally select one approved resource and/or one supported ordinary
workspace entry point. Do not expose arbitrary
HTML, scripts, embeds, query-string commands, private record IDs or a visual
page builder. Resource authoring/custody remains the resource owner's job; guide
editing should not create another upload store or duplicate document bodies.

Existing permitted resource links can carry approved external destinations under
their owner contract; the guide need not add a second arbitrary external-URL
field. Show external destination and ordinary navigation behavior where relevant.
No automatic fetch/embed is needed. A pointer to “Open supporters” must not carry
a private named supporter or secretly initiate a task, import or message.

An item can supply advice alone or link to a resource/action; do not
force either link, attach a deadline, require a media upload or demand a new explanation
of why the tenant wants a guide. Optional broader feature controls remain at
their source; the guide editor does not gain a permission-setting matrix.

Reorder in place with **Move up** and **Move down**, with the item name in the
accessible name. Drag may be an additional convenience, never the only route.
Keep focus on the moved item's control and announce its new position once.
Adding/removing/reordering updates the draft, not the currently available guide.
No nested curriculum or conditional branching is needed. Supported text/item
bounds must be published and enforced at implementation; “short” is an editorial
goal, not a claim of an already qualified numerical product limit.

### Preview and publish

Show saved draft state honestly: **Saving…**, **Draft saved**, or a specific
failure. Unsaved memory is not durable. A separate **Preview** shows the exact
draft presentation, including phone reflow and the intended audience summary.
Preview is not impersonation and cannot prove every future reader's destination
access. Explain: **“Each person sees only resources and actions available to them.”**
Do not copy another missionary's protected data into a preview.

On first deliberate publication use **Publish guide**, with inline consequence
**“Makes this guide available to eligible missionaries in [Organization].”**
No additional routine approver or repeated modal is needed unless an actual
governing approval rule applies. Content, order and target references must belong
to the same reviewed revision. Publish errors preserve a safe draft and identify
the actual repair. If a destination became invalid, fix/remove that affected
item rather than forcing the author to start again.

Use one clear availability meaning: **Not offered**, **Available**, or **Disabled**.
Draft changes are an editorial state beside that meaning, not another on/off
switch. These are suggested display terms, not a prescribed table enum. Do not
confront staff with Published-but-actually-Off combinations without explanation.

### Change, disable and offer again

Editing an available guide creates draft changes. **Save draft** leaves the
currently qualified published revision in place. **Publish changes** replaces
it deliberately and atomically. Concurrent editing must preserve the author's
unsaved work and offer a clear review of the newer saved revision, not silently
overwrite another curator. A raw timestamp or “last writer wins” is insufficient.
No public website or upstream resource is republished as a side effect.

**Disable guide** removes this guide's availability and its entry points, while
independently permitted Resources and ordinary workspace actions remain. Keep
this restriction operable even with invalid unsaved draft content; do not force
staff to fix copy before stopping disclosure. Appropriate retained draft and
publication history remain governed, not destroyed by disabling. An old URL
shows a safe unavailable state rather than exposing retained private content.

Suggested disabled-state copy:

> **Guide disabled**  
> Missionaries can still use their usual workspace and available resources.

While disabled, editing/saving must not silently offer the guide again. A later
explicit **Offer guide** or **Publish and offer** reviews the exact intended
current revision and current destination eligibility. Do not revive an old
failed publish intent or reset a personal hidden-invitation preference. There
is no implied email, announcement, enrollment or staff progress report.

An accepted publication can be followed by a failed status refresh. Report
**“Guide published. Current availability couldn't be refreshed.”** only with
known acceptance. If the outcome is unknown, **“We couldn't confirm whether the
guide was published. Check status.”** Recover that operation rather than issuing
another publish with a new meaning. Likewise, **“Guide disabled”** requires an
authoritative accepted result, not a local switch animation.

## Complete missionary journey

1. **Discover.** Maya finds Getting started in Resources, the stable Help
   entry or the proposed quiet home invitation. Her ordinary dashboard, contacts
   and tasks work without opening it. She may Hide the invitation while retaining
   ordinary access to the guide; no generic “setup incomplete” badge appears.
2. **Choose.** She scans the short guide and opens whichever suggestion helps.
   A descriptive link such as **Open support overview** says where she will go.
   Opening navigates to the existing owner's normal screen; actual business
   actions retain their own deliberate controls and current authority.
3. **Use and return.** Resources open only through current qualified access.
   Preserve a permitted return path and reading position where safe. Back does
   not mark a step Done. If she takes an actual action, its source records that
   action once; the guide does not duplicate it as training progress.
4. **Skip.** She can leave immediately, choose a different item or use another
   ordinary screen. No explanation, refusal reason or “Are you sure?” prompt.
5. **Return later.** She sees the current permitted published guide, not an
   obsolete personal clone. Current publication metadata can explain a genuine
   update; merely opening, formatting or loading content must not claim Reviewed.

If a published guide changes while she is reading, do not jump her focus to the
top or splice new content into her current row. A quiet **“The guide was updated.
Refresh to see the latest version.”** is appropriate when disclosure remains
permitted. A known restriction/withdrawal must instead stop controlled-client
release of affected content; ordinary stale-display friendliness is not permission
to continue exposing withdrawn material. No claim can recall bytes already seen.

Filter both destination-derived labels and authored guidance through their actual
publication/access contract before display. An item title may itself disclose a
restricted resource or location. Avoid unexplained gaps, “3 hidden steps” counts
or revealing names in disabled rows. After current authorized projection, a
simple list may use continuous presentation numbering; stored source identities
remain stable. Removing an unavailable target can leave an independently safe
advice paragraph; it cannot leave text that itself reveals the restricted
resource, person or context. If a genuinely temporary problem affects an otherwise disclosed
destination, show a bounded retry/unavailable state without inventing access.

| State                                            | Clear, proportionate behavior                                                                                                                                                                         |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No guide has been offered, or tenant disabled it | Omit its normal invitation/entry. A permitted old navigation path may say **“This guide isn't available. Back to resources.”** Do not reveal a hidden guide title or reason.                          |
| Guide fetch failed                               | **“Couldn't load the guide. Try again.”** Keep ordinary navigation available; do not pretend the organization has no guide.                                                                           |
| No usable permitted suggestions remain           | Safe empty guidance state and ordinary Resources/workspace return; no blocked-setup badge or directory of hidden items. Curators receive only their independently permitted repair information.       |
| Item lost permission after rendering             | Existing owner returns its safe unavailable outcome. Remove unsafe controlled-client detail; do not suggest bypassing the guide or asking for new access unless that real authorized workflow exists. |
| Missionary changes organization/context          | Clear old guide and destination results, resolve the new current context and reject late prior-context responses. Do not carry a hide preference across unrelated tenants.                            |
| Slow or disconnected phone                       | Text/list shell remains small; show truthful loading/retry. Do not preload all files/videos, cache protected resources as an offline library or queue consequential actions automatically.            |
| Maya already knows the subject                   | She ignores it or opens a later suggestion. There is no permanent “experienced” label, progress reset or compulsory earlier step.                                                                     |

## Content, privacy and reuse boundaries

A shared guide is for general organization-approved help, not private casework.
Do not include supporter names, actual gifts, protected locations, care examples,
tokens or copied private correspondence as tutorial illustrations. Use fabricated
generic examples expressly labeled as such, not realistic invented ministry
incidents claimed as observed. A link's visibility does not widen the target's
audience, and a safe generic action label does not authorize the underlying action.

Staff should use material the organization owns or has permission to use. Public
availability of a coaching workbook or campaign checklist does not establish
republication rights. Link to an approved external resource where suitable rather
than copying it into a tenant draft. Do not import a competitor's religious
curriculum, pressure tactics, donation predictions or suggested goal numbers.
Keep the existing content safety/rights process; no per-item legal approval queue
or new licensing platform is justified by this decision.

These original examples illustrate possible labels, not mandatory starter content,
observed workflow facts or a requirement for a bundled template catalog:

- **Understand your support overview.** Learn what expected and received support
  mean before planning the next step. Destination: the currently permitted
  overview or an approved organization explanation.
- **Prepare for a conversation.** Read your organization's suggestions, then
  choose whether to use an existing contact or task action.
- **Share an update when ready.** Find approved guidance for a ministry update;
  publication and newsletter sending remain separate deliberate source actions.

A template or example must start as a reviewable draft. No automatic installation
or publication is needed. Resources can change independently; guide text/order
publication and the referenced resource's exact qualified content/version policy
must remain explainable. A file path replacement is not authority to swap content.
Restoring old editorial content creates current draft work under current checks,
not restoration of old audience rights or a previously disabled offering.

## Visual, mobile and accessibility design

Use the existing PageHeader, semantic list/item composition and restrained
secondary metadata. One clear title, readable short introduction, generous
shared spacing and descriptive links provide visual clarity without a custom
hero, animated tour, gamification or decoration competing with daily work.
Use current semantic tokens and shared controls; no new primitive system,
app-local theme or arbitrary chart/progress treatment.

The staff editor should show a compact ordered list with an editable selected
item, or equivalent simple responsive composition. Avoid requiring a full desktop
CMS canvas. Expand only the details being edited; preserve text after recoverable
validation/network errors. Desktop/phone preview is a view of the same draft,
not a separate editable mobile version. Shared TanStack Form/Zod patterns can
serve the substantive array editor during implementation without freezing its
storage representation or inventing a new editor framework now.

Test reading order, accessible names, real heading/list semantics, keyboard
activation, focus after add/remove/reorder, and visible focus on every action.
Editor controls need associated labels/help/errors. Reorder buttons must work by
keyboard and single click/tap; drag-only plus keyboard is still insufficient for
touch users unable to drag. Avoid controls available only on hover, swipe-only
carousels, tiny remove icons and color-only publication status.

Verify 320 CSS-pixel reflow, zoom, long organization/item names, RTL and translated
labels. Do not truncate the destination's distinguishing words without an
accessible way to read them. Announce save/publication/error/reorder outcomes
without announcing every typed character or moving focus to every toast. Honor
Core's reduced-motion baseline. Text-first reading does not excuse inaccessible
linked PDFs; format/language/size and caption/transcript expectations follow the
resource profile, not a new download dependency for the whole guide.

## Strongest alternative and material concerns

**Resources-only is a strong alternative:** an organization can publish one
well-written starting resource using D12, with less curation UI and lifecycle
surface. It may be sufficient for a small resource collection. A's additional
benefit is a short, native path connecting advice to existing permitted screens;
its cost is an owned publication/editor journey and keeping those references
useful. It should not be justified by claiming B provides no help or by claiming
unmeasured fundraising benefit. The founder selected A; deliver its bounded
native value without drifting into course delivery.

Severity and likelihood below are qualitative judgments **without safeguards**,
not measured incident rates. Each recommendation narrows or completes A, not a
claim of an observed current production defect.

| Material concern                           | Severity / likelihood                             | What could go wrong and exact proposed prevention                                                                                                                                                                                                                |
| ------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Optional guide becomes required training   | High / plausible under course-pattern reuse       | Progress, blocked stages or staff expectations coerce use. **The guide SHALL NOT gate ordinary work, track completion, enroll coaching, assign tasks or supply staff performance evidence.**                                                                     |
| Unnecessary orientation burden             | Medium / likely with a forced tour                | Users must dismiss screens repeatedly before real work. **Use the existing Resources/help context, independently openable items and a stable return path; no forced takeover, fixed user categories or repeated prompts.**                                       |
| Draft/publication/Off confusion            | High / plausible                                  | Saving edits discloses unreviewed material or re-enables a disabled guide. **Save draft SHALL NOT change availability; publishing SHALL bind one exact reviewed revision; editing while disabled SHALL NOT offer the guide again.**                              |
| Disable blocked by incomplete edits        | High / plausible with one shared form submission  | Staff cannot remove harmful guidance until every field validates. **Authorized Disable SHALL remain independent of draft validation and preserve separately governed resources/work.**                                                                           |
| Guidance or links expose protected data    | High / plausible                                  | Safe-looking card labels leak a location, private resource or named supporter. **Classify/disclose guide content and references before enumeration; target access remains independently current; do not display hidden labels or counts.**                       |
| Guide action silently performs work        | High / plausible under quick-action reuse         | Opening a suggestion creates a task, sends or shares information. **Guide entries SHALL navigate to qualified existing work without causing its consequential effect; each owner retains deliberate acceptance.**                                                |
| Stale or duplicated publishing             | Medium–high / plausible                           | Two curators overwrite drafts or retries revive disabled content. **Preserve expected revision, exact intent and authoritative outcome recovery; distinguish unknown acceptance from failed projection.**                                                        |
| Course/AI/vendor dependencies expand scope | Medium / plausible                                | Helpful examples become an LMS, contact recommender, SMS channel or curriculum license. **D37 SHALL use bounded native guidance without course scheduling, automatic recommendations, imported curriculum or new provider dependency.**                          |
| Reordering and reading fail on phones      | Medium–high / plausible                           | Drag-only controls, overflow and unstable focus prevent authoring/use. **Provide single-pointer and keyboard reorder, shared responsive controls and tested focus/reflow/status behavior.**                                                                      |
| No one owns stale content                  | Medium / plausible                                | Broken references and outdated instructions accumulate. **Assign an existing organization curator responsibility and show truthful current draft/publication state; repair through ordinary editing/withdrawal, without a new periodic certification workflow.** |
| Reading becomes surveillance               | High / plausible if analytics are casually reused | Clicking/ignoring is exposed as effort or readiness. **Do not create read/skip/completion histories or coach/staff progress reports; separate any required security/custody audit from product assessment.**                                                     |

## Falsifiable journey proof required later

These are proposed acceptance outcomes, not tests executed in this research pass.

1. An eligible missionary reaches ordinary work without opening the guide, can
   read advice-only items and open any permitted link, leave without answering a
   question and later return through the same discoverable route. If the home
   invitation is included, Hide affects only that tenant/user's presentation,
   persists across versions and never removes Resources access or produces a
   staff-visible engagement record.
2. A curator adds, edits, removes and reorders suggestions on phone and keyboard,
   previews the exact draft and deliberately publishes without a separate CMS
   or routine additional approver. No draft change appears early.
3. A disabled guide stays disabled through draft saves and failed publish
   retries. Disable works while a draft has a validation error. Ordinary resource
   and workspace authority remains unchanged.
4. Published changes retain the current approved revision until an authorized
   replacement succeeds; concurrent edits preserve safe unsaved work and do not
   silently overwrite a newer revision.
5. Guide content, titles, targets, counts, preview and stale responses reveal
   nothing outside the current tenant/context/audience. A target withdrawn after
   render has a safe unavailable result without broad roster discovery.
6. Opening a guide/resource/action entry creates no task, completion, subscription,
   send, consent, coaching grant or financial effect. Any later real action uses
   its existing source boundary once.
7. Lost save/publish/disable responses recover the same authoritative result;
   known accepted effects are not reported failed merely because a refresh fails.
8. Actual assistive-technology, touch, 320-pixel reflow, zoom, RTL/long text and
   slow-network journeys pass. A PDF download is neither a mobile solution by
   itself nor evidence of reading.
9. Representative missionaries and curators can explain that the guide is
   optional, identify where to return, distinguish saved draft from available
   guidance and finish their chosen ordinary task without instructional help.
   Resolve observed harmful misunderstandings before release; no successful
   study or numeric success rate is claimed here.

No extra founder choice is necessary to deliver this proposed bounded design.
Source qualification, actual destination profiles, finite content limits and
runtime/accessibility/usability evidence remain implementation release work,
not unanswered permission to add a curriculum or tracking system.
