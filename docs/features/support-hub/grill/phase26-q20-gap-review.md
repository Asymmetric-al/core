# Q20 independent gap and option review

**Historical Q20 material.** On 12 September 2026 the founder selected A and fully ratified the [complete D20 review and every adopted amendment](phase26-d20-adversarial-review.md). Unanswered/pending wording below records the question stage only.

**Historical question-stage record.** On 12 September 2026 the founder selected A. The [complete D20 review](phase26-d20-adversarial-review.md) records proposed amendments pending ratification; prior unanswered/recommendation statements below describe the earlier question stage.

Checked 12 September 2026. Research and grooming only. D1-D19 are ratified by the latest founder message; the inspected log still had the immediately preceding D19 proposed status and the root is updating it. Core source inspected read-only at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` in `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`; cwd was verified. No implementation, migration, provider operation, GitHub mutation or live messages.

## Recommendation

The strongest genuinely unresolved next decision is **how staff should retain useful recurring Support work lists beyond the standard views**. Recommend **A - Personal views plus curated shared views**.

This is a product choice about personal efficiency and consistent team organization. It does not reopen whether search is complete and authorized, create another workflow/status engine, or ask the founder to choose database mechanics. D3 already requires complete discoverability and independent recovery awareness; D14 settles reply-target meanings and reporting; D15 settles Following. A saved work view is simply reusable criteria over the same current authorized conversations.

The root should present one decision, not bundle this with full-text search scope, labels, bulk actions, reports, configurable automations, or CRM segmentation. The answer's later adversarial review can flesh out the necessary query, privacy, sharing and lifecycle consequences.

## Concrete founder-facing framing

Staff can already open the standard views and search or filter their work. Some useful combinations recur: for example, a donor-care team checks **Waiting on our side in Donor care**, while a staff member frequently checks a narrower slice of their own assigned work. A saved view remembers those criteria and shows the current matches whenever it is opened. It does not move the conversations or change who is responsible.

The question is: **How should staff save and share these recurring ways of looking at Support work?**

| Option                                        | Meaning                                                                                                                                                 | Principal tradeoff                                                                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A - Personal views plus curated shared views  | Staff save their own useful filters. Authorized maintainers provide shared views for the relevant team/inbox audience. Standard views remain available. | Individual speed plus common team organization; requires clear personal/shared ownership and a restrained picker. Recommended.                          |
| B - Curated shared views only                 | Authorized maintainers provide the reusable views. Everyone may still search/filter temporarily.                                                        | Stronger consistency and less personal configuration, but individuals must rebuild uncommon filters or ask a maintainer. Strongest simpler alternative. |
| C - Standard views and temporary filters only | Ship the settled standard views, search and filters, with no custom saved work views.                                                                   | Lowest maintenance and smallest interface; repeated work needs repeated filtering and the team cannot retain a common custom slice.                     |

These are alternative launch choices, not three tenant modes to implement. A does not mean everyone can change shared views, nor that every view appears in every sidebar.

## Why this question is next

The session's coverage checklist explicitly leaves search/saved views unresolved. All prior decisions were checked for overlap:

- D3 establishes statuses, due follow-up and complete unfinished-work discovery; it does not settle personal/shared view authoring.
- D6-D8 settle assignment and coverage, not how a worker retains a useful list.
- D14 establishes internal reply-target timing and measurement, not saved views. Do not ask the founder again whether overdue facts exist or whether business hours apply.
- D15 establishes Following and its special original-scoped predicates; saved views cannot quietly follow conversations or broaden that predicate.
- D18 chooses personal/shared reusable wording in Email Studio. Work views are a different Support-owned fact. Reusing familiar My/Shared wording may help, but importing its content publication/revision engine would be needless coupling.
- D19 establishes held-intake review and separate recovery. An ordinary saved conversation view must not become an alternate intake-review queue, reveal held content, or hide required intake attention.

Other coverage candidates were considered. Exact Resend intake qualification is primarily discoverable technical proof and should not become a founder question. Legacy consolidation follows governing single-owner requirements. General search completeness is already mandatory. Phone/chat/AI/CSAT would expand scope before the existing staff surface is coherent. More labels or consequential macros introduce new product vocabulary before the recurring work-navigation model is settled. Participant/move questions remain real but are narrower and would require pinning an actual unresolved choice against D1-D12; the view ownership decision is clearly open now.

## Current Core evidence and its limits

These are current repository observations, not proof of deployed behavior.

1. `docs/prds/sitestacker-parity/roadmap.md:2895` locates Phase26 in the broader product and lists saved views in existing Support scaffolding. The source also reserves configurable trigger/condition/action vocabulary to Phase34. A read-only view must not acquire rule side effects.
2. `supabase/migrations/20260515025814_support_hub_core_modules.sql:345` defines `support_saved_views`, composite tenant/id identity, `owner_agent_id`, personal/workspace scope and a JSON filter. Lines356-365 allow the owner FK to cascade on agent deletion, constrain only the scope vocabulary/JSON object shape, and derive name uniqueness from owner/slug. This is existing scaffolding, not a ratified privacy or offboarding contract.
3. `packages/api/src/admin/support-hub/adapter/supabase.ts:1030` lists saved views with `allRows`; lines143-155 apply tenant scope but no personal owner predicate in that helper. Save copies caller-supplied owner/scope/filter at1034-1044. The migration's staff policies at551-571 are tenant staff checks rather than per-view ownership checks. No later migration referencing this table was found in the targeted search. These source facts require qualification before any UI promises Just me; they do not prove a live exploit or current production grants.
4. `apps/admin/features/support-hub/components/views/SaveViewDialog.tsx:48` defaults to personal, while a newly created item passes a null owner at70 and exposes Whole workspace at133-138. This illustrates a contract mismatch to resolve, not a model to freeze into the spec.
5. `apps/admin/features/support-hub/components/views/SavedViewsBar.tsx:17` expressly describes listing every personal/workspace view. The render maps the entire returned collection into a wrapping chip bar. The proposed UI should avoid multiplying permanent chips as teams grow. No rendered browser or mobile evaluation was performed here.
6. `packages/api/src/admin/support-hub/adapter/supabase.ts:671` queries some filters, limits to2,000 at689-690, then applies text and label filters at707-723. Text currently covers subject/name/email, not message bodies. Correctness before pagination is already required by D1/D3; it is not an optional saved-view feature or evidence that all future queries are implemented.
7. `apps/admin/features/support-hub/components/tabs/ViewTabs.tsx:32` defines existing standard tabs. Their current seed names/status meanings must yield to ratified D3/D14/D15 semantics, rather than reopening those decisions for local code consistency.

## Primary comparisons checked today

### Front

[Views](https://help.front.com/en/articles/2243), edited7 August2026, documents private and shared criteria over shared inboxes. Shared maintenance requires a specific permission; personal sidebar inclusion can be changed independently. It also documents limits and permission changes that can make a shared view unavailable. The article says the feature is on all current plans.

[Sidebar customization](https://help.front.com/en/articles/2232), edited8 June2026, documents personal pin/hide choices that do not change colleagues' sidebars.

**Adopt:** optional personal focus plus governed shared definitions and a small personally useful navigation set. **Tradeoff:** users need an understandable distinction between the shared definition and their own shortcut. **Do not import:** Front workspace model, numeric limits, forced sidebar pushes, color/emoji taxonomy or its specific access-loss behavior as Asym requirements. Those are vendor choices, not architecture proof or measured Asym needs.

### Zendesk Support

[Creating views](https://support.zendesk.com/hc/en-us/articles/4408888828570-Creating-views-to-build-customized-lists-of-tickets), edited1 September2026, documents standard, personal and shared views, qualified shared authors, conditions and preview. It distinguishes current work views from historical reporting and says archived tickets are excluded. Enterprise custom-role permissions affect authoring. The documentation's current sidebar limits differ from older references.

**Adopt:** previewable understandable criteria and separation between personal view authoring and shared maintenance. **Tradeoff:** a general condition builder can become harder to understand than the work itself. **Do not import:** arbitrary nested boolean builders, vendor view limits, archived-ticket exclusion, or view statistics as a replacement for D14 reporting. Asym's current source restriction/expiry and permission predicates govern every result.

No nonprofit usability study or measured team demand was found in this bounded gap-selection pass. Examples are explicitly illustrative. The founder's request for clear effortless recurring work and the existing scoped capability support A; vendor availability alone does not prove necessity.

## Boundaries to carry into the later selected-answer review

- **A definition is not access.** Definition audience, predicate-field visibility and each current result's actual source permission must be independently honored. Names/criteria can contain personal data too. Shared audiences do not grant CRM or conversation access.
- **A list is not a second work owner.** No assignment, follow, automatic send, SLA policy, status, retention or business action follows from appearing in a view. Selecting a view creates no CRM interaction.
- **Save actual intent.** Use explicit current actor versus named person semantics; avoid freezing the creator under a misleading Me label. Do not save transient selected rows, cursor, open draft or hidden background filters as view authority.
- **No silent shared edit.** Temporarily changing filters while viewing a shared definition must not rewrite the team definition. Save personal copy and explicitly update shared definition should be distinct available actions under current capabilities.
- **Navigation stays quiet.** Preserve reliable built-ins and a searchable views picker; personally pin useful views, not every shared definition. Show active filters and one clear return/reset action. Current design must fit existing shared Core components; no custom theme or graph UI.
- **Broken is not empty.** Deleted or unavailable filter targets, revoked rights and stale definitions cannot silently broaden a query or pretend that no work exists. Show only authorized explanation and safe correction.
- **Current truth beats snapshots.** Store criteria and presentation preferences, not copies of conversations, CRM facts or message bodies. Re-evaluate current permissions and D16/D17 restrictions for matches, counts and snippets. No extra search engine or CRM synchronization is implied.
- **Shared continuity.** Shared definitions should have accountable qualified maintenance independent of one employee's continued presence; personal material must not auto-publish on departure. Exact schema/cascade remediation belongs in the later design/proof, not a founder implementation question.
- **Complete results remain mandatory.** Counts, ordering and pagination use the same authorized predicate before limits. Saved view is not a historical report or an export permission. Query capacity and accessibility require later real proof.
- **Email Studio seam:** viewing/saving/sharing work views does not invoke Email Studio, preparation, P6 or Resend. Opening a conversation and deliberately drafting/sending returns to the already ratified D4/D18 seam. Do not borrow Email Studio publication just because both use My/Shared labels.

## Independent disposition

**Accept A as the recommended Q20 option to present, not as a founder answer.** It is a real unresolved product tradeoff with a credible shared-only alternative. Keep the question to ownership and availability of recurring work views. Preserve all D1-D19 guarantees and perform the full adversarial review only after the founder chooses. No Q20 ADR or glossary term is accepted by this report.
