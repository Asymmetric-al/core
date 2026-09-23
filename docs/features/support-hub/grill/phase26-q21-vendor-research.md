# Q21: Support label governance — independent primary-source research

**Historical question material.** On 12 September 2026 the founder selected A and fully ratified the [complete D21 adversarial review and every adopted amendment](phase26-d21-adversarial-review.md). Earlier unanswered wording describes the question stage only.

Checked **12 September 2026**. Research input for one unanswered founder question; no product decision, formal specification, implementation, provider configuration or external mutation is made here. D20 already qualifies label filtering but does not determine who may create labels or whether a label is mandatory for resolution. The earlier search-coverage research is preserved separately in `work/search-coverage-research.md` for a later gap; it is not Q21.

## Suggested question and meaningful choices

**How should staff label Support conversations for organization and later review?**

An illustrative example, not a claimed observed ministry workflow: Alex handles a request about an emailed receipt. A **Receipt question** label could help the team find similar conversations later. The label describes this request; it does not classify the person, establish that a receipt was issued, change access, or complete a giving action.

| Choice                                                      | What staff actually do                                                                                                                                            | Strongest benefit                                                                  | Main tradeoff                                                                                                                            |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Optional labels from a curated Support list**         | Staff search and apply existing relevant labels. Qualified maintainers create, clarify and retire the shared vocabulary. A conversation may have no labels.       | Consistent reusable meaning without adding a compulsory closing step.              | A missing useful label depends on a responsive maintainer; optional tagging cannot promise complete topic statistics.                    |
| **B — Optional labels that staff can create while working** | Staff select existing labels or deliberately create a new one from the same picker when necessary. Maintainers can still tidy the catalog later.                  | Adapts immediately when new recurring needs emerge; least dependency on a curator. | Similar labels and one-off details can fragment saved views and reports; ongoing cleanup becomes more necessary.                         |
| **C — At least one curated label before Resolve**           | Staff choose from the curated list before resolving an unlabeled conversation. The selection can be part of the closing flow, not a separate administrative trip. | More consistent labeling coverage for teams that depend on topic review.           | Adds a step to every unlabeled resolution, and a required selection alone does not prove the label is accurate or sufficiently specific. |

**Single recommendation: A.** Use the same optional, source-scoped Support label set for discovery and reporting. Separate applying existing labels from maintaining their definitions. It fits a product where Support is one surface, removes repeated catalog decisions from ordinary work, and avoids a new resolution prerequisite without evidence that complete categorical reporting is essential. B is strongest if the vocabulary changes faster than maintainers can support; C is strongest if a demonstrated operational obligation depends on reliably labeled resolved work. Neither is intrinsically poor design.

These are three operating policies, not three different label engines. None introduces a primary-topic field, security classification, tenantwide CRM tag propagation, tag-driven routing, or another workflow platform. Selection of A would still require the full subsequent adversarial review.

## Strongest primary comparisons

### 1. Front separates label application and catalog maintenance

[Teammate groups — new permissions](https://help.front.com/en/articles/4645696), edited **1 September 2026**, documents separate workspace permissions for creating/editing/nesting tags, deleting tags, archiving/restoring tags, and applying/removing tags on conversations. The article specifically suggests permitting managers to maintain tags to keep configuration orderly. Granular custom permission sets require **Enterprise or legacy Scale**; the article distinguishes the newer system from its legacy counterpart.

**Fit:** directly supports A’s separation between ordinary use and catalog stewardship. Core should use its existing authorization model and resource scope, not copy Front’s plan entitlements or private-inbox exception. A source demonstrating role granularity does not establish that every team prefers curated creation.

### 2. Front makes inline creation and archival concrete

[Understanding tags](https://help.front.com/en/articles/2100), edited **1 July 2026**, documents creating a tag from the conversation tag menu or settings, with name, description, style and access. It distinguishes private, shared and company tags. Archiving prevents future application while retaining historical conversation tags, filtering and analytics; restore is available. Nested tags introduce coupled archive/restore behavior.

**Fit:** inline creation makes B a credible fast workflow. Descriptions, searchable selection and archive-first retirement are useful candidates for A. Asym does not need private conversation labels, a three-level scope system, deep nesting, emoji configuration or tag-as-folder behavior merely because Front offers them. D20 already handles personal navigation.

### 3. Front supports compulsory tagging, but does not enforce it universally

[Required tagging](https://help.front.com/en/articles/2106), edited **6 June 2026**, **Professional and above**, lets an administrator choose shared inboxes and a curated tag set. Applicable work shows an indicator and prompts for a tag when an agent tries to move or archive/resolve. The detailed FAQ says enforcement is **not on the mobile app**, does not block other automatic archiving rules, and does not catch a brand-new outbound **Send & archive** action. Rules are not retroactive until new activity.

**Fit:** validates C as a real operational pattern. It does not prove accuracy or 100% coverage. If Asym ever makes a resolution prerequisite, the owning mutation boundary must enforce the declared policy consistently across authorized routes; a desktop popup is insufficient.

[Front’s rule library](https://help.front.com/en/articles/2114) broadly says required tagging guarantees complete appropriate tagging. That is in tension with the detailed exclusions above. Prefer the specific documented behavior; do not repeat the broad guarantee or adopt Front’s workaround of an always-false condition to disable a rule.

### 4. Intercom explicitly allows applying tags without creating them

[Teammate permissions](https://www.intercom.com/help/en/articles/176-teammate-permissions-how-to-control-workspace-access), current retrieved **12 September 2026** with dynamic article dating, says a teammate lacking **Can manage tags** cannot create tags in the Inbox or settings, but **can still tag conversations**. Exact subscription eligibility is not established by this permission page.

**Fit:** especially direct evidence for A’s everyday UX: the picker remains useful even when the user cannot create vocabulary. Maintaining taxonomy need not mean central administrators handling each application. Core still checks conversation mutation rights independently; the Intercom permission is not an Asym role definition.

### 5. Intercom’s visible conversation section supports discovery and scope clarity

[Tagging conversations](https://www.intercom.com/help/en/articles/6604447-keep-track-of-support-requests-and-bugs-by-tagging-conversations), updated “this week” at retrieval, describes a persistent **Conversation tags** sidebar section with **Add tag** and searchable existing tags. Extra tags collapse behind **See all**. It distinguishes these from person tags on the contact profile. Mobile inline creation respects **Can manage tags**. The same article documents inconsistencies in older message-part tagging and Android selected-tag display.

**Fit:** a labeled, readily discoverable section is stronger than a hover-only action. Use an accessible selected-state picker and compact overflow. Do not adopt message-level attachment of tags, copy a hard five-tag visual threshold, or infer that all mobile behavior matches the desktop section. Conversation-label scope should stay clear in CRM context.

### 6. Intercom’s lifecycle preserves useful history on archive

[Create, edit, archive, or delete tags](https://www.intercom.com/help/en/articles/3527143-create-edit-archive-or-delete-tags), English page dated **12 December 2025** (translated pages have different dates), restricts management, makes rename apply to all tagged items, and retains prior filtering/reporting when archived. Permanent deletion removes that searchability. It warns when tags are used in specified segments/audience filters and forbids creating another tag with an archived tag’s name.

**Fit:** distinguish removing a label from one conversation from retiring the catalog entry. Names are presentation over stable identity; historical reports must not silently reinterpret meaning after a repurposed rename. A single catalog can be governed without a content-publication workflow.

### 7. Zendesk demonstrates the speed and fragility of freeform tags

[Working with ticket tags](https://support.zendesk.com/hc/en-us/articles/4408835059482-Working-with-ticket-tags), current at retrieval (indexed as edited approximately May 2026), lets agents create a new tag by typing and pressing Enter, subject to custom-role tag-edit permission. Autocomplete covers a limited recent/popular subset. Its formatting rules make underscore, dash and slash variants distinct; unsupported characters can disappear on update. Tags must match exactly in relevant search and trigger use.

**Fit:** supports B’s quick authoring benefit and gives a concrete mechanism for vocabulary fragmentation. Asym should preserve readable display labels and stable IDs, show validation instead of silent disappearance, and let staff find the full eligible catalog. Do not adopt Zendesk’s character budget, 60-day suggestion rule, or slug-as-display constraint.

[Creating custom roles](https://support.zendesk.com/hc/en-us/articles/4408882153882-Creating-custom-roles-and-assigning-agents), **27 August 2026**, **Enterprise**, notes that disabling direct tag edits does not prevent setting custom fields and has a macro-at-creation exception. This is evidence to check every mutation path, not a reason to copy bypasses.

### 8. Zendesk’s field/tag coupling is a boundary to avoid

[Ticket-field lifecycle effects](https://support.zendesk.com/hc/en-us/articles/4408886624410-Understanding-how-creating-deactivating-or-deleting-ticket-fields-impacts-tickets), current at retrieval, warns that reusing a drop-down option tag can replace values on tickets including closed/archived ones and skew reporting; deleting options can null historical field values. [About-field recipe](https://support.zendesk.com/hc/en-us/articles/4409155792026-Recipe-Using-an-About-field-to-identify-common-issues) uses a required-to-solve drop-down for consistent issue reporting.

**Fit:** C is often implemented through a structured required field rather than arbitrary labels. That distinction must be explicit; this Q21 does not silently add a primary issue-type field. Asym labels must not become authority for work status, restricted classification, CRM attributes or completed business actions.

### 9. HubSpot’s ticket tags are derived indicators, not the same manual-label concept

[Create color-coded object tags](https://knowledge.hubspot.com/object-settings/color-coded-object-tags), **31 July 2026**, lists **Service Hub Starter/Professional/Enterprise**, among other subscriptions. Super Admins configure criteria-based tags for supported objects including Tickets. Starter supports all-pipeline scope; Professional/Enterprise adds particular-pipeline scope. Tags can filter saved views/reports and appear on records.

**Fit:** useful evidence for distinguishing computed badges from manual context. Do not claim HubSpot offers the same inline optional ticket-label policy. Asym already has status and reply-target facts; adding a label engine that recomputes them would duplicate authority. No contact/giving/care predicates should leak into a Support label catalog merely because HubSpot allows associated-object criteria.

## Reported friction, clearly separated from verified behavior

[Intercom Required Tagging idea](https://community.intercom.com/ideas/required-tagging-8914?fid=None&tid=8914), **20 January 2025**, records a user seeking reliable complete tagging and describing changing keywords as difficult to maintain. A reply proposes required attributes. [Earlier mandatory-tag thread](https://community.intercom.com/messenger-8/forcing-agents-to-apply-tags-before-closing-conversations-1259) includes late-2024/2025 requests and complaints about manual cleanup of automation errors.

These show genuine reported demand for C and a failure pattern in automatic keyword tagging. They are not current official proof of a required-tag feature, evidence that Asym ministries share the requirement, or reliable prevalence estimates. Search did not establish a current official Intercom mandatory-tag-before-close contract. Required attributes and community recipes must not be mislabeled as such a contract.

## Smallest useful UX direction to carry into a selected-answer review

- Put **Labels** with the conversation’s operational details; label it plainly and keep **Add label** discoverable with keyboard and touch. Existing selected values remain visible, and long lists use accessible overflow rather than an expanding row of chips.
- Search existing eligible labels by readable name and a short meaning/usage description where needed. A label describes this conversation; it is not a claim about the requester. Display text, not color alone, carries meaning.
- Under A, missing results never create a new label implicitly. Qualified maintainers have a clear Manage labels destination; other staff can use established internal collaboration to request a useful addition. Avoid adding a special submission/review workflow just for this small vocabulary.
- Under B, creating a new shared catalog entry is a deliberate action distinct from applying an existing entry. Similar-name suggestions prevent accidental duplicate creation without pretending to detect all synonyms or forcing automatic merges.
- Under C, tell staff the requirement before the final action, preserve their work if a label is missing, and return focus to a precise selector. Do not let an empty/inaccessible catalog trap completed work. Server transitions, automation, merge, mobile and bulk routes require a coherent policy if C is chosen.
- Permit multiple applicable labels and no primary designation unless the founder makes a separate future decision. Under A/B, **No labels** is an honest valid state, not an error, red badge or substitute for an unknown security classification.
- Reports using optional labels must identify their population and unlabelled portion; multiple labels overlap and their counts cannot be assumed to sum to total conversations. No allegation that adding one label means a real-world action happened.

## Core boundaries and consequences that must not be silently accepted now

Use the qualified shared Core capability where its governing contract supports Support, while preserving Support label subject/custody. Root’s repository review determines the actual reused owner; this research does not choose a new table or service. D20’s stable-label references, Any/All meaning, current authorization, invalid-target behavior and pagination contract remain intact.

Searchable labels and their definitions can disclose sensitive information. Tenant scoping, catalog visibility, apply/remove authority, no hidden-label counts, label-derived history, redaction/expiry and protected classifications require independent review. A label called **Confidential** cannot create access control. Removing that label cannot lift source restrictions. CRM links neither propagate label assignments nor grant support workers access to CRM label catalogs.

Archive is safer than broad deletion for used labels, but source disposal rules still prevail; archival cannot preserve restricted content indefinitely. Repurposing a name, delete/recreate, offboarding, concurrent apply/remove and merge/Undo require explicit stable-identity handling. Existing source duplicates and names should not be silently normalized or merged on rollout.

Email Studio owns reusable wording/presentation under the ratified seam, not labels or view predicates. Adding, renaming, applying or retiring a Support label does not publish a template, create a recipient audience, send a notification email, or invoke Resend. D18’s Saved Sections remain a separate domain meaning despite similarly curated catalogs. Consequential label-triggered automation remains Phase34’s separately qualified authority and is not authorized by this Q21.

No representative usability study, tenant-data frequency analysis, runtime authorization test, capacity benchmark or statistical claim was performed. The recommendation is an explicit product judgment, informed by current documented workflows and bounded by Core’s existing decisions.
