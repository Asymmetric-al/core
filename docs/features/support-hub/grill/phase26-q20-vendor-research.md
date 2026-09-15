# Phase 26 Q20 — Independent research: personal and shared saved views

**Historical Q20 material.** On 12 September 2026 the founder selected A and fully ratified the [complete D20 review and every adopted amendment](phase26-d20-adversarial-review.md). Unanswered/pending wording below records the question stage only.

**Historical question-stage record.** On 12 September 2026 the founder selected A. The [complete D20 review](phase26-d20-adversarial-review.md) records proposed amendments pending ratification; prior unanswered/recommendation statements below describe the earlier question stage.

Research checked 12 September 2026. This is question-stage evidence and product judgment, not a founder answer, formal specification, implementation or usability-test result. It does not reopen D18 saved replies, D19 intake review or D15 following. The live session's coverage checklist identifies search/saved views as unresolved.

## Recommendation and strongest alternatives

**Recommend A — My views plus curated shared views.** Staff can save a useful authorized filter for their own repeated work. Qualified shared-view managers maintain the small team-visible collection. Personal pinning controls each person's navigation. An authorized manager may create a shared view directly; this does not require every view to pass through a proposal queue. Reuse existing Core role/team capabilities rather than create another office or approval engine.

An example grounded in accepted capabilities, rather than an invented ministry process: a worker repeatedly checks conversations assigned to them whose internal reply target is overdue. They save that filtered list as a personal view. A lead provides a shared view of unassigned Open work in the inbox they supervise. Neither operation moves a conversation, assigns its work, changes a target, follows it, sends a message or grants access.

The real choice is **who may make reusable navigation available to colleagues**, not whether accurate search, built-in work views or access checks exist:

| Option                                    | Operating model                                                                                                                  | Strong reason to choose it                                                                                                                | Cost or tradeoff                                                                                                                                                                                  |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — My views plus curated shared views    | People save their own filters; qualified managers create and maintain shared views for an appropriate audience.                  | Individual efficiency and stable team navigation can coexist without a shared catalog full of experiments.                                | Someone must maintain the shared collection. Avoid requiring central approval for harmless personal work.                                                                                         |
| B — Shared views only                     | Qualified managers maintain the reusable view collection; everyone retains ordinary temporary filtering and built-in work views. | Most consistent vocabulary and navigation, particularly for a small operation with nearly identical duties.                               | Personal recurring needs require rebuilding filters or asking a manager; workarounds can emerge outside the product.                                                                              |
| C — Built-in views plus temporary filters | Retain the required built-in work views and complete authorized filtering/search, but do not add custom saved definitions.       | Smallest product and administrative surface; a strong choice if built-ins cover recurring duties and exceptional searches are infrequent. | People must rebuild recurring custom filters; the product cannot give a team a named reusable custom worklist. This cost needs validation rather than assuming every worker needs personal views. |

These select the extent and governance of reusable configuration, not three search implementations. Do not describe C as no filters or B as no search. A should permit appropriately delegated shared-view management rather than tenant-admin-only management. No documentation proves which option is empirically best for Asym; A is a product judgment supported by the recurring separation of personal customization and controlled shared configuration. The strongest no-build challenge is C: if required system views cover the real recurring work, custom saved views add maintenance with little benefit. The example above establishes a plausible repeated-filter need, not measured Asym demand.

A broader alternative would let every qualified team member self-publish shared views. It can reduce manager dependence, but can also produce overlapping definitions and unclear stewardship. That is an authorization/default refinement inside reusable views rather than a fourth question at this stage. Do not call it inherently unsafe: record access must remain independently checked in every model.

## Primary product evidence and adoption judgment

### Zendesk: personal use and authorized shared definitions

Zendesk's current creation article was indexed as edited 1 September 2026. Agents ordinarily create personal views; admins and custom-role agents with permission can also create shared views for all agents or specified groups. Creation supports a description, All/Any conditions, Preview, columns and sorting. A current-user condition enables one shared definition to personalize results. Enterprise custom-role configuration affects available view permissions and some displayed limits. The documented condition inventory and view limits are vendor-specific, not Asym requirements. [Creating views](https://support.zendesk.com/hc/en-us/articles/4408888828570-Creating-views-to-build-customized-lists-of-tickets).

**Adopt:** personal/shared distinction, meaningful title and optional explanatory description, preview before saving shared changes, explicit current-viewer semantics. **Simplify:** no visual rule builder or enterprise folder hierarchy solely for this decision. **Reject as implicit assumptions:** Zendesk's statuses, archive exclusions and numeric limits cannot define Asym's ratified lifecycle or completeness contract. A view should state its scope instead of silently omitting retained history.

Zendesk separately documents editing, deactivation/reactivation and permanent deletion. Shared links still apply the view's normal availability permissions. [Managing views](https://support.zendesk.com/hc/en-us/articles/4408832792986-Managing-your-views).

**Adopt:** distinguish a reusable definition from a shareable link; a link is never an access grant. **Product judgment:** removing a personal pin must not delete a shared definition; an archived shared definition should not destroy any conversation. Exact archival/recovery behavior belongs in the eventual answer review.

### Front: private freedom, shared authority and sidebar placement

Front's Views article, edited 7 August 2026, describes private views without a special prerequisite and shared creation under its Shared inboxes create/edit/delete permission, held by workspace admins by default. Definitions filter shared inboxes, tags, assignees and selected other fields. Shared-view changes apply to all eligible users. Choosing teammate sidebars pushes the view into those sidebars; other people with the relevant inbox access can still add it. Adding an inbox a previous user cannot access can remove their access to the view. Front currently says it cannot show which teammates received or actively pinned a view, and cannot use teammate groups in its sharing/assignee fields. It lists the feature on all latest plans. [Front Views](https://help.front.com/en/articles/2243).

**Adopt:** personal and shared definitions, a browsable catalog separate from personal pinning, discoverable filters. **Do not copy:** bundling shared-view permission with inbox creation/deletion or treating pushed navigation as the access policy. **Asym implication:** clearly name the permitted audience, keep personal pins separate and use existing team references where qualified. The Front access-change example is evidence to explicitly design stale/shared scope behavior, not proof that Asym should adopt all-or-nothing access.

### HubSpot Service Hub: views and CRM filtering preserve ticket access

The canonical help article was updated **19 August 2026**; cached query-parameter/search versions still show December 2025 and must not be treated as current. Service Hub Professional/Enterprise supports custom views with a Service Seat and Custom views permission; the article gives distinct Private, Team(s) and Everyone audiences, a dynamic owner filter and filtering on tickets or associated companies/contacts. It expressly says a user only sees tickets they can access. Space views require Enterprise. [Organize teams and views](https://knowledge.hubspot.com/help-desk/organize-teams-and-views-in-help-desk).

**Adopt:** make definition audience and resulting-record authorization separate; explain current-user filters in ordinary language. **Do not import:** HubSpot's company/contact identity model, sales access rules, subscription gates or associated-record filter freedom. For Asym, a restricted CRM field must not become inferable through a filter, result count, facet or sort. One Support view cannot become a CRM data copy or a cross-domain read authority.

The separate customization article, updated 19 December 2025, documents private custom-view editing only by its creator, privileged view/homepage management, and non-deletable built-in views. Only views shared with Everyone can become the documented homepage. [Customize views](https://knowledge.hubspot.com/help-desk/customize-views-in-the-left-sidebar-of-help-desk).

**Adopt selectively:** retain dependable built-in navigation and distinguish default workspace configuration from personal preferences. **Avoid:** automatically replacing people's working context every time a shared view is published. Core's existing navigation and settings patterns should determine the mechanism.

### Intercom: live filters do not move conversations

Intercom's custom-views article is dated 18 February 2026. It defines views as conversations matching current filters, requires Can manage views for creation, says other teammates can see a newly created view and explicitly states views do **not** reassign conversations. It supports duplication and search/pin management. Personal custom folders organize a user's sidebar. The article warns that complex views can hit rate limits and that sidebar ordering is browser-local. It also notes an unsupported old ticket-state filter and disallows company-attribute filters. [Custom views and folders](https://www.intercom.com/help/en/articles/6588834-organize-your-inbox-with-custom-views-and-folders).

**Adopt:** a view is a changing query over actual work, not another responsible inbox. Make temporary filters, saved definitions and pins distinguishable. **Do not copy:** browser-local persistence as an effortless cross-device experience or silent invalidation of saved filters after schema changes. Do not promise constant real-time evaluation at arbitrary complexity.

Intercom's current permissions page, fetched 12 September 2026 and labelled updated yesterday, says Can manage views controls creation/editing while users without it can view existing inbox views. Its conversation-access model ties some access to assignment. [Teammate permissions](https://www.intercom.com/help/en/articles/176-teammate-permissions-how-to-control-workspace-access).

**Relevant distinction:** reusable-view configuration can be authorized separately from opening an existing view. **Reject:** copying assignment-derived access into Core, which already requires source-qualified conversation and CRM access. Plan availability was not established for this precise permission; do not assert all-plan availability.

### Kustomer: reusable search, discoverability and explicit data scope

Kustomer's May 2026 create/edit article gives Searches-permitted users and admins access, primary/secondary sorting, and explicit null semantics: “not equal” excludes unset values unless unset is included separately. It also documents a two-year last-update limitation for conversation/message/custom-object searches. [Create and edit searches](https://help.kustomer.com/create-a-new-search-SyX3HX3DI).

Its June 2026 settings article exposes per-search columns and team/user visibility overrides. Badge updates have documented limits for complex queries and collapsed folders. [Individual search settings](https://help.kustomer.com/en_us/individual-search-settings-H1CT6Dsqkl).

**Adopt:** saved query semantics must be precise and inspectable; result rows, sort and counts require a single coherent definition. **Reject:** silent historical cutoffs or a badge that appears exact when its update coverage differs. Do not transpose Kustomer's cross-object query breadth into Phase 26. Official excerpts were retrievable through search indexing; direct article opens returned empty parsed bodies. Exact edition availability is unverified.

Kustomer's official 2026 release notes acknowledge that removing a saved-search filter group appeared successful but reverted later; the fix is dated 24 August 2026. September 1 entries also describe saved-search navigation/persistence and explicit rejection of unsupported aggregation options. These are documented historical failures/fixes, not claims that the product still fails. [2026 release notes](https://help.kustomer.com/en_us/categories/2026-release-notes-BygKsnW9g).

**Implication:** the eventual proof must save, navigate away, reopen and independently check the complete filter definition; reject unsupported conditions rather than quietly dropping them. This is stronger evidence of a realistic failure pattern than an invented scale anecdote.

### Zoho Desk: curated starting points, department scope and lifecycle caveat

Zoho Desk documents built-in ticket views and department-specific custom lists under Custom View and Module permissions. Its creation flow names the view, sets criteria and visibility, and saves it. The same article documents automatic archiving/deletion for unused custom views. Its current text also says all-department custom views require activation on request. The article is undated; precise plan availability was not established. [Ticket views](https://help.zoho.com/portal/en/kb/desk/ticket-management/views-and-filters/articles/ticket-views-custom-list-archived-views).

**Adopt selectively:** useful starting views reduce first-run configuration and scoped views reduce clutter. **Reject as an automatic Asym default:** deleting a team's saved definition because it was not opened recently can remove a seasonal or incident workflow. Operational telemetry may identify an unused view for an authorized decision without deleting it implicitly.

## Candidate end-to-end Asym experience

These are researched recommendations for shaping Q20, not pre-ratified D20 requirements.

1. **Start with actual work.** Built-in views for accepted work and attention remain available. Open an existing view or filter the authorized conversation list. The active responsible-inbox scope is visible.
2. **See the meaning.** A compact filter summary explains status, assignee, inbox, target or time conditions. “Assigned to me” resolves against the current viewer. Do not encode the creator's identity silently into a reusable “My” view.
3. **Save without leaving work.** Save view asks for a name and defaults to Only me. Save current criteria and intended ordering; do not save selected row IDs as a hidden snapshot or copy conversation bodies.
4. **Know when experimenting.** Temporary changes display a quiet Modified state with Reset, Save changes when authorized, and Save as new. Merely filtering a shared view never changes colleagues' definition.
5. **Share deliberately.** Qualified managers select an allowed audience and see the definition being made available. Visibility of the name and filter values must be authorized too. No copied CRM sensitive values merely because the viewer sees some matching conversations.
6. **Keep navigation personal.** Pin/unpin works independently of permission and shared definition editing. A small built-in set plus searchable My/Shared catalog avoids an endlessly expanding sidebar. Cross-device preferences should use Core's shared preference capability if appropriate, not a new Support-only preference system.
7. **Open a result and return.** Opening a conversation, its permitted CRM context and Back preserve list scope and working position when safe. Current access is rechecked. Search state should not expose sensitive literals in external links/logs.
8. **Show trustworthy change.** Results are current eligible matches at a known evaluation point; a visible refresh state is preferable to an unexplained zero or falsely exact count. Lists should not jump during active selection or typing. Server paging/search must cover the authorized domain, not filter a capped client snapshot.
9. **Handle disappearance honestly.** A moved/resolved/restricted conversation may stop matching. A disabled, archived or no-longer-accessible view needs a safe explanation and route back to built-in work; do not broaden filters silently to recover.
10. **Retire the definition only.** Unpin, archive/delete view, unfollow conversation and change inbox are different actions. A former employee's private definitions do not become a public catalog automatically. Shared definitions need durable team stewardship instead of a departing account being their sole operational owner.

## Architecture and product boundaries to preserve

- A saved view is read configuration; it is not an inbox, assignment, follower subscription, snapshot, group conversation, queue-ownership source, automation, analytics cohort, email audience or permission grant.
- Dynamic query results and historical reports answer different questions. D14's historical clocks/credit cannot be reconstructed from a current saved view. Counts must say what they count and must not overclaim a partial page.
- Personal/shared view ownership belongs to the qualified existing Core view/query capability if it exists and is sound. Do not infer that Email Studio owns all “saved” things merely because D18 replies use its Saved Sections.
- **Email Studio seam:** no authoring, template publishing, preparation, dispatch or Resend activity occurs when saving/opening/pinning/sharing a view. A later actual reply still uses the ratified D4/D18/P17/P6 path. A view is not permission to send to its current result set.
- **CRM seam:** store typed references/qualified predicates, not duplicated names, financial data or support-side CRM ownership. Filtering and facets can disclose information even when rows are hidden; source permission must cover the predicate, its values, count and result projection.
- **D19 seam:** ordinary saved conversation views must not replace the qualified held-input review surface. A count of held work and its safe destination/reason metadata retain D19's source-specific rights.
- Current row/filter correctness is a prerequisite under every offered option. Choosing A cannot justify shipping a polished saved UI on incomplete client-side results.
- Publishing/editing a shared view may deserve simple current-version conflict handling and durable actor attribution, but not Email Studio's content publication workflow or a new mandatory reviewer queue.
- Complex boolean logic, arbitrary cross-domain expressions, natural-language AI query generation, recursive folders, bulk workflow macros and automatic periodic email reports are not implied by this question. Only adopt them for a demonstrated need and through the actual owning domain.

## Evidence limitations and cautions

- No vendor production account, private edition configuration, browser interaction or Asym user test was performed. Product behavior statements above come from official current documentation or clearly marked official indexed excerpts.
- No prevalence or time-savings percentage is established. Public feature availability alone does not prove the most usable Asym workflow.
- Kustomer indexed versions disagree on automatic refresh: one says six seconds; another states automatic updates were deprecated for new customers in March 2025. No exact Kustomer refresh guarantee is asserted or adopted. Aggregated release-note pages mix years; only explicitly dated 2026 entries on/before 12 September 2026 informed this research.
- HubSpot query-parameter/cache article dates differ from the canonical direct page. Use the canonical August 19, 2026 article for current help-desk view behavior.
- No vendor limits for number of views, sidebar pins, fields, conditions, refresh periods, automatic retirement or search history are proposed as Asym numbers.
- This research supports asking a concrete governance question now. The answer's later full adversarial review must settle precise scope, lifecycle, permissions, data/query reuse, concurrency, accessibility and production-shaped proof against current Core sources.
