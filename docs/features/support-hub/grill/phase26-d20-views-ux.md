# My views and Shared views: the complete experience

Fully founder-ratified D20 design, 12 September 2026, accompanying the [corrected decision](phase26-d20-adversarial-review.md). This is a complete interaction contract, not an implemented or usability-tested screen. Use Core's existing base-maia/Base UI primitives, shared responsive list/table components and semantic tokens. The experience belongs in Support's existing conversation workspace and reuses the platform named-view capability.

The user needs to distinguish **the saved view**, **their current temporary filters**, and **their personal shortcut**. Put those distinctions beside the relevant controls; do not teach the database model in product copy.

## Discover and open

Keep the required standard queues in their established location. A persistent **Views** control in the conversation-list header opens a searchable picker. It is visible even when there are no saved views or pins. Pinned shortcuts can appear in the existing navigation, but the picker remains the complete discovery path. Do not add every Shared view to every person's sidebar.

The picker groups eligible entries as **Pinned**, **My views** and **Shared**, with a name and brief optional description/audience. A pin is a reference, not a duplicate entry in the underlying catalog. Show only authorized names, descriptions and search matches. A broad Shared audience does not make private filter values visible. Users without maintainership can open eligible Shared views, modify temporary filters and save My copies.

First-use text: **“Save filters you use often. My views are for your use; Shared views are maintained for a team.”** The standard queues remain usable without saving anything. The UI never calls a personal view a private inbox.

Select a view deliberately by stable identity. Within the full Support workspace its visible saved inbox/filter scope replaces the previous query, including old search text. A view does not silently inherit the previously open Donor care inbox. If it uses **All accessible inboxes**, show that exact dynamic scope. If it specifies selected inboxes, show those currently authorized references and do not silently omit an inaccessible required one.

```text
Support Hub

[Views ▾]  Donor care follow-up                 My view   [Pin]

Inbox: Donor care   Status: Waiting on our side   Assigned to: Me
Sort: Oldest activity first

[Current authorized conversation list]
```

This is information hierarchy, not a rendered mockup. Illustrative example: Alex saves the three filters above to return to a recurring working slice. Sam can maintain a broader Shared Donor care follow-up view. These are plausible examples to test, not claimed observed ministry workflows.

## Save from the work already on screen

**Save view** is available beside the ordinary filters when there is a useful query to save, and from the Views menu. Do not make the user reconstruct the same criteria in another settings page.

| Control             | Behavior                                                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                | Required bounded label. Suggest a neutral combination of work/inbox criteria when safe; do not derive a title from a message body, individual recipient or raw search text. |
| Save to             | **My views** by default. **Shared** is available only with qualified maintenance authority.                                                                                 |
| Description         | Optional brief purpose, useful when a shared list's meaning is not obvious.                                                                                                 |
| Criteria summary    | Complete current inbox scope, status, assignee, label operator, Following/reply facts and included search. Expand details without hiding material scope.                    |
| Include search text | Shown only when search text exists, checked initially, with the exact stored text visible. Unchecking updates the definition and preview before saving.                     |
| Sort and columns    | Qualified default settings captured explicitly. Current selected rows, cursor, open conversation, scroll and reply draft are excluded.                                      |

For My, show **Save view**. For Shared, show **Save shared view**, with an explicit eligible audience and statement that criteria/name/search text are visible to that audience. Shared creation is a direct qualified save, not an Email Studio publication or a second approval workflow. Sharing a My definition creates a reviewed independent Shared copy; it does not expose the rest of My views or the source conversation.

Save is valid even when there are no matching conversations, if the definition itself is valid. A query service failure is not zero matches. If a preview is unavailable, present the error and permit only behavior justified by the complete schema/authorization contract—never claim results were verified. Missing required scope/reference validation blocks the save.

After durable success, make the saved ID active and pin it for the creator. Do not pin it for the Shared audience or change startup defaults. If the separate preference write fails, show **“View saved. Couldn’t pin it.”** and **Pin view** retries only the preference against the saved identity/current lifecycle. It must not create another view.

## Apply ordinary filters with precise meaning

Use the existing familiar filter bar, progressively exposing additional supported facets. Stored definitions retain the shared nested typed schema; users do not need a visual programming canvas.

| Filter          | Clear meaning                                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inbox           | **All accessible inboxes** or explicitly chosen existing inboxes. Selected values mean any of those inboxes.                                                                             |
| Status          | Exact ratified Open/Waiting for requester/Waiting on our side/Resolved choices, with clear **All unfinished** where the source supports it.                                              |
| Assigned to     | Any, **Me**, **Unassigned**, or named authorized people. Me means the person opening the view; a named Alex remains Alex for everyone.                                                   |
| Labels          | **Any selected** or **All selected** with the operator visible; **No labels** is explicit. No hidden disagreement between preview and actual results.                                    |
| Following       | Uses the viewer's D15 original-scoped follows. The standard Following experience initially includes all statuses and Latest followed update; an explicit saved override remains visible. |
| Reply attention | D14 **Overdue replies**, **Reply timing needs confirmation**, and **Reply due** sorting keep their exact independent meanings. No Due soon threshold is introduced.                      |
| Search          | Saves only qualified current conversation search. Clearly advertise the supported searched fields; no attachment/body/CRM query promise beyond the actual qualified catalog.             |

Between different facets, require all chosen conditions. Within ordinary selected-value facets, match any selected value; labels have the explicit Any/All option. Empty, missing, unauthorized and genuinely unset values are not interchangeable. Do not provide arbitrary CRM/financial/member-care predicates merely because a generic builder can render a field.

Facet choices come from the authorized catalog or a declared contextual option query, not the loaded result rows. Selecting label A must not make label B impossible to add to an Any query. Optional per-option counts can be omitted; their population must not masquerade as the result count.

## Modify without editing for colleagues

While a Shared view is open, ordinary filter changes create a local working query. Mark the name **Modified**, keep the full effective filters visible, and expose:

- **Reset to saved view**: reload the current eligible saved definition.
- **Save as My view**: save the reviewed working query as a separate personal identity.
- **Save changes**: only for the actual My owner or Shared maintainer, with the exact definition ID/revision and visible change summary.

Do not silently save when a menu closes or an input loses focus. A changed Shared revision offers **View updated · Reload saved settings**; it must not overwrite an active unsaved query or message draft. The current source/privacy rules still take effect immediately—preserving edits is not permission to keep forbidden content visible.

**Rename** loads and changes the chosen view's own metadata only. Renaming B while A is on screen must not save A's filters into B. Two views with identical criteria can have different names/audiences; the active identity is never inferred from whichever equal definition is listed first.

## Pin, personalize and return

Pin/unpin/reorder are personal tenant-scoped preferences that persist across devices through the shared owner. An unpin affects neither the Shared definition nor colleagues. A personal layout/column choice affects the viewer's display, not the team's saved criteria. Explicit personal sort overrides remain visible because order affects work discovery.

Pinning and ordering never change Support's startup route. Phase9's CRM kind-route default contract stays unchanged; this Support adaptation is deliberate. No extra homepage setting or board mode is added.

Keep Back/Forward/reload behavior, current view ID and validated query state coherent. Saved-view links contain a stable reference and require normal current access. **Copy saved view link** clearly refers to the saved definition. A link to modified current filters must explicitly represent those filters under the shared state/authorization contract; it cannot falsely point to an unchanged definition. Sensitive search literals use qualified protected state, not a raw address/body fragment in the URL. An unavailable/expired reference yields a clear unavailable result, not an unfiltered list.

## Maintain and correct

**Manage views** uses the same My/Shared organization, with authorized name, purpose/audience, maintainer, status and relevant modification information. It is not a new tenant administration console. Ordinary curators do not see everyone's My content. Use current capability-scoped delegated maintenance rather than requiring every change to go through a tenant administrator.

For a conflicting save, retain safe unsaved edits and show that another person changed the view. Let the user load the current revision, deliberately reapply changes, or save a My copy. Do not silently merge different criteria or retry a changed payload under the old command identity.

**Archive view** removes active availability/pins and preserves a defined correction path. Shared archive confirms that it affects the audience's access to that saved definition, not any conversations. **Archived views → Restore** is persistent while the definition remains under its actual owner retention. Restore revalidates the current criteria/audience and returns to the catalog unpinned, including for the original creator. Delayed old pin/reorder requests cannot bring back pre-archive pins. An open conversation and its safe draft remain available through their own authorization, with the archived view context stated honestly.

Where retained revisions support correction, **Restore previous settings** previews the difference and creates a current qualified successor. It cannot restore revoked access or expired sensitive values. Do not silently archive/delete an infrequently used seasonal list; an authorized maintainer decides whether it is still useful.

Shared custody survives author departure. If no eligible maintainer remains, the qualified configuration owner gets one actionable maintenance exception. My definitions do not auto-publish or pass to a new person using the same email. Normal records/configuration ownership handles their retained lifecycle.

## Honest live results and failures

| Situation                                    | Required presentation                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Valid query with no matches                  | **No conversations match these filters**; allow adjustment/reset. It does not say all Support work is complete.                             |
| Missing/deleted/forbidden required criterion | **View needs attention** or a permission-safe unavailable state; repair controls only for qualified users. Never omit that filter silently. |
| Query timeout/outage                         | **Couldn’t load this view** with qualified retry and explicit standard-queue navigation. No false zero.                                     |
| Result changed while reading/acting          | Keep selected stable conversation/draft. Quiet **Results changed · Refresh** where needed; no shifting action target.                       |
| Saved definition updated elsewhere           | Current revision notice; safe unsaved working query preserved until deliberate reload/save.                                                 |
| Definition archived or access revoked        | Saved context unavailable; no broader automatic query under the same title. Source content access follows current authority.                |
| Incomplete/capped/estimated count            | State exact units and freshness or omit the optional count. “25 shown” is not “25 total.”                                                   |

Loading, failure, empty and no-access states must be distinct. Required standard queue counts can remain separate from the current custom query only when their scope is clear. No custom view becomes a completeness guarantee, SLA report, intake-review substitute or bulk-send audience.

## CRM and Email Studio continuity

The CRM record's Support history keeps its D9 record anchor and source permissions. Do not silently replace that panel with all tenant conversations when a saved view is opened. **Open in Support Hub** explicitly enters the full workspace and preserves an authorized return path; its selected saved view then uses the displayed scope. A return reauthorizes the record. The shared capability is reused behind both surfaces without building another My/Shared store inside each CRM record.

A view does not create related records, requester identity, assignment, last-contact dates or giving/care actions. Email Studio retains D18 reusable wording and actual message preparation; views use the platform named-view owner instead. No Save/Open/Pin/Share/Rename/Archive/Restore creates a template publication, P6 communication, Resend send or follow subscription.

## Accessibility and real-user proof

Use the shared combobox/dialog/list/table semantics with persistent names, visible focus, non-color status and polite result announcements. Enter chooses a view or saves the appropriate short dialog; it cannot leak into the underlying reply composer. Escape cancels an uncommitted picker/dialog without changing the prior view. A short form returns focus logically; editing an archived list cannot drop focus onto an unrelated destructive control.

Support keyboard-only creation, temporary filtering, reset, rename, share, archive and restore. Use semantic table and aria-sort rather than an editable grid when cells are not editable. Under virtualization preserve stable identity and focus/scroll access. At narrow widths use the existing responsive component/full sheet, accessible 44px touch controls and no hover-only instructions. Test long labels, IME, international names, right-to-left text, 200%/400% reflow, browser history, slow networks and cross-device preferences.

Representative staff and maintainers must demonstrate they understand My versus Shared, pin versus definition, current viewer versus named person, modified versus saved state, view scope and the absence of permission/assignment effects. Record observed errors and fix them before release. The [evidence register](phase26-d20-evidence.md) distinguishes documented patterns from this unexecuted Asym usability proof.

## Ratification and Email Studio clarification

The founder fully ratified all D20 amendments, definitions, UX/data/evidence, independent corrections and required proof on 12 September 2026. The [Email Studio integration addendum](phase26-d20-email-studio-integration.md) restates the accepted configuration/authoring/local attention/delivery/CRM seam without a new product choice or implementation claim. Historical proposed/pending/no-Q21 statements above are superseded as to acceptance and advancement only. [Ratification and Q21 validation](d20-ratification-q21-validation.json) preserves the historical evidence separately.
