# Q18 reusable Support wording: vendor evidence and decision advice

**Independent research input:** The [final Q18 comparison](phase26-q18-reusable-reply-library.md) and [reconciled evidence](phase26-q18-evidence.md) govern any differences in candidate wording. Q18 is unanswered; no new decision is accepted. In particular, C still requires deliberate publication and does not automatically expose unpublished drafts.

Research date: 11 September 2026. Scope: authorship, ordinary use, sharing, shared-library curation and offboarding. Primary help-center documents were opened live. This is research input for an unanswered grill question, not an accepted decision or implementation authority. D4's Email Studio ownership, copy-on-insert, safe typed fields and absence of hidden workflow effects remain settled.

## Recommendation and strongest alternative

**Recommend B: personal saved replies plus a curated shared library**, provided both are tenant-scoped reusable wording owned through the existing Email Studio capability. Personal means available for this staff member's ordinary use in this tenant; it must not imply personal property, cross-tenant portability, immunity from tenant governance or unrestricted access to saved donor information. Curated means an authorized maintainer deliberately makes shared wording available; it need not mean a second reviewer, mandatory request queue or large publication workflow.

A, curated shared replies only, is the strongest alternative: fewer asset states, less duplication and easier consistency. It may suit a small standardized team and is reasonable if shared maintainers can keep up. The cost is that staff-specific phrases must be retyped or kept in external notes, or every small reuse request burdens a maintainer. That risk is a product inference, not a measured Asym workflow fact.

C, an openly editable shared library for authorized staff without personal replies, gives the fastest spread of team improvements. It also exposes colleagues to draft wording, accidental edits/deletion, irrelevant additions and contradictory duplicates. A narrow maintainers group makes C resemble A; this difference must be explicit in the question so the alternatives are real.

B is not inherently superior because vendors offer it. The reason to prefer it is to separate an individual's low-impact reusable writing from changes presented as current team guidance, using one established asset owner. Avoid adding new content classes, a second CRM, arbitrary per-person sharing, approval routing, nested folder hierarchies, automatic AI promotion or ongoing synchronization of personal copies.

## Verified vendor behavior

### Zendesk: explicit personal versus shared authority

The May 1, 2026 creation guide says personal macros are used/modified by their creator but visible and clonable by administrators. Admins and permitted custom-role agents can create shared macros; admins may modify shared macros regardless of creator. Creation occurs in Admin Center > Workspaces > Agent tools > Macros, with an Available for choice of all agents, groups or the creator. Group availability is documented for Suite Growth+ or Support Professional+. The 5,000 shared-macro cap is a vendor limit, not an Asym recommendation. Zendesk macros can also change ticket fields and perform actions; that scope conflicts with D4 and must not be imported.

[Creating macros](https://support.zendesk.com/hc/en-us/articles/4408844187034-Creating-macros-for-repetitive-ticket-responses-and-actions)

Zendesk's management guide separates active/inactive state from permanent deletion. An administrator can clone a staff personal macro into a shared macro. Personal actions and shared management have different permissions. This supports explicit scope and maintained shared identity, but does not prove a particular approval process or version architecture. The documentation even warns that deactivation can fail if a macro references unavailable action values: an example of why retirement should not depend on a retired asset still being usable.

[Organizing and managing macros](https://support.zendesk.com/hc/en-us/articles/4408884166554-Organizing-and-managing-your-macros)

### Front: smooth creation, but availability differs from authorization

The August 7, 2026 template guide offers personal and shared message templates. In the composer, New from draft opens a small form for name, scope, optional folder and editable wording. Shared templates can be scoped to inboxes, and template use follows the selected From channel. However, staff with template-create/edit authority can see all shared templates in workspace settings, including templates for inboxes they cannot access. This is an explicit scope distinction, not proof of an access-control defect. Asym should clearly separate contextual picker relevance from the actual right to read an asset, and avoid treating an inbox filter as a security boundary. Front's documented subject replacement is incompatible with D4's unchanged subject rule.

[Understanding message templates and folders](https://help.front.com/en/articles/2230)

The September 1, 2026 **new** permissions guide separately lists shared template Create/edit and Delete permissions, with an example of delegating these to team leads. Teammate groups are on all plans; custom permissions require Enterprise or legacy Scale. A separately surfaced legacy-role guide must not be treated as the only current permission model.

[Teammate groups, new permissions](https://help.front.com/en/articles/4645696)

### Help Scout: strongest practical comparator for C

The September 3, 2026 email saved-reply guide allows every user to create a reply from the conversation editor using Insert or slash, Saved Reply > Save this reply, then name/edit/save. Owners/admins manage existing replies by default and may grant management to Users. Replies are managed under a particular inbox; copying to another inbox is a distinct action. Search and naming organize the library. This demonstrates that create, maintain and use can be distinct permissions without a personal layer. The guide does not document a mandatory publication review or personal saved-reply collection; that is not proof of permanent feature absence. It also warns that a hosted file link will be the same link every recipient receives.

[Create and manage saved replies](https://docs.helpscout.com/article/18-create-saved-replies-for-fast-answers)

### Intercom: valuable explicit failure patterns

The current guide, labelled updated over a week ago when accessed, offers Everyone, specific teams and Myself only. It says team-scoped availability is on the Expert plan for Advanced tier customers; keep that wording qualified rather than mapping it to another pricing generation. Editors may see/edit team-scoped shared macros regardless of team use. Personal-use permission revocation can hide personal management while old macros may remain usable. Only the creator can delete personal macros; removing a teammate or certain seat changes permanently deletes them. These are documented offboarding hazards to avoid, not desirable defaults. The guide also says authorized content exports may include other staff personal macros despite their absence from ordinary Inbox/settings views, illustrating why the word private needs precision. The macro feature includes workflow actions, which remain outside D4. Its suggested empty-team workaround for pausing an asset should not be adopted; explicit retirement is cleaner.

[Creating and managing macros](https://www.intercom.com/help/en/articles/6433193-creating-and-managing-macros)

### Zoho Desk: direct sharing with creator-bound maintenance

The current snippets guide has a Share Snippet profile permission. Agents create from the reply editor, supply name/content, toggle sharing and select agents. My Snippets and Shared Snippets distinguish created items from received ones. Only the creator edits/deletes shared snippets; deletion removes them for other users too. Preview exposes creator and last-modified information. These support useful plain labels and compact preview, while showing how creator-only maintenance can become an offboarding dependency. No creator departure behavior was verified, so do not infer deletion or reassignment. The page's edition badge did not yield an unambiguous textual edition in this lookup; an older localized article is not sufficient proof of the current plan. Its exact-name/case-sensitive shortcut and space-free naming are vendor constraints to avoid reproducing.

[Creating and using snippets in ticket responses](https://help.zoho.com/portal/en/kb/desk/ticket-management/ticket-replies/articles/creating-and-using-snippets-in-ticket-responses)

### HubSpot: CRM continuity is useful, but snippets and templates differ

The June 2, 2026 snippets guide documents reuse on contact, company, deal, ticket and custom-object records, and in email, chat and notes. It allows users with Sales access to edit/delete snippets. The mobile keyboard exposes only owned snippets and has a different limit; therefore a desktop library alone is not proof of cross-surface parity. Snippets use folders/search and a shortcut or picker. This supports one reusable asset across authorized surfaces but does not justify making Support depend on a second CRM or adopting HubSpot's Sales-access role. Some personalization behavior is already consciously rejected by D4.

[Create and use snippets](https://knowledge.hubspot.com/conversations/use-snippets)

The February 2, 2026 message-template guide separately documents shared/private templates, created from CRM > Message Templates > New template > From scratch. It describes one-to-one correspondence, not bulk marketing templates. Its separate asset-access guide lists template limits by users/teams for Sales/Service Hub Professional and Enterprise and retains Super Admin access. Do not transpose those restrictions onto snippets or interpret Private as invisibility from every administrator.

[Message templates](https://knowledge.hubspot.com/templates/create-and-send-templates), [Asset access](https://knowledge.hubspot.com/account-security/limit-access-to-your-hubspot-assets)

## User feedback: useful friction signals, not current capability proof

A HubSpot-hosted Ideas thread contains user reports from 2020 onward about unrelated team snippets cluttering search and concern about accidental shared edits/deletion. These are credible first-person friction reports, but an old Ideas thread cannot establish the present permission contract, prevalence, causal productivity gains or a universal requirement. Its useful lesson is to keep the usable library relevant and make maintenance authority explicit.

[HubSpot Ideas discussion](https://community.hubspot.com/t/enable-snippets-to-be-made-private-or-shared-with-team/21559)

A Zendesk-hosted request asks for easier admin personal-macro removal through the UI. The concern is consistent with the official distinction between creator maintenance and administrator visibility, but it remains user feedback, not evidence that no supported API or another edition can perform an operation.

[Zendesk administration feedback](https://community.zendesk.com/ideas/allow-admins-ability-to-manage-delete-personal-or-individual-macros-in-the-user-interface-2261)

No Asym staff usability study, ministry frequency measurement or quantitative A/B outcome was found or assumed. Vendor behavior is evidence of tradeoffs, not proof of superiority.

## Proposed Asym strategy, subject to Q18 answer and owner qualification

1. **One picker, two understandable scopes.** Within D4's existing Use template action, show relevant eligible shared replies and My replies. A small scope label and preview prevent personal wording from masquerading as current team guidance. Keep keyboard search and a visible touch/click entry point equivalent. Reuse the shared design system rather than introducing a new visual language.
2. **Fast personal save with explicit sanitization.** A save action must show the exact selected reusable wording in an editable form. It must not silently harvest a thread, raw recipients, attachments, resolved donor values, private notes or quoted history. Prefer composing reusable wording or preserving approved typed placeholders. Personal reuse is not a D16/D17 retention escape hatch. A generic warning alone is not authorization for copying restricted context.
3. **Separate rights, not a new hierarchy of job titles.** Ordinary staff may use permitted shared wording and manage their own tenant-scoped wording if permitted. A tenant may grant shared maintenance to suitable people without conferring inbox, CRM, giving or broad platform administration. Keep read/use, personal maintenance, shared maintenance/publish and safety retirement conceptually distinct; use existing capability mechanisms rather than freezing permission identifiers now.
4. **Deliberate shared release.** A curator can create/edit a shared draft and explicitly publish the current reviewed revision through the qualified Email Studio capability. No mandatory second person, general approval queue, notification campaign or automatic publish-from-personal. If offering personal wording for reuse is included, it becomes an explicit independent shared draft, with current authorization and purpose checks; it does not grant the curator access to the conversation that inspired it.
5. **Shared stewardship outlives attribution.** Shared replies are tenant assets with creator/editor attribution, not records owned forever by their first author. Staff departure never silently deletes or publishes shared content. Personal content loses ordinary use when its tenant membership/permission ends; tenant custody, disposition and any explicitly authorized recovery remain governed. Avoid both automatic team promotion and permanent uncontrolled retention.
6. **Retire cleanly.** Use an explicit inactive/retired state for future selection, independent of whether its body still compiles. Recheck scope/permission/active version at fetch/insert. Already inserted draft text remains D4-reviewed content with provenance; retirement must not silently rewrite drafts or send history. A content-safety incident uses the existing safety/review fences rather than pretending an insertion can be recalled from a sent email.
7. **Do not synchronize copies.** Editing personal or shared wording affects its next eligible insert, not historical messages or unrelated copies. An explicit offer/copy may retain provenance, but it must not create shadow ownership or a dependency that edits the source. Prefer shared reuse to encouraging a personal fork of every official reply.
8. **Avoid speculative machinery.** Clear titles, search, scope, current revision and maintained shared availability address this question. No mandated complex folder taxonomy, translation workflow, AI-generated suggestions, usage scoreboard, arbitrary item cap or recurring review cadence is evidenced here. Existing Email Studio capability and retention rules must be inspected before adding states or permissions.

## Bounded checks the later answer review must cover

- Personal asset from tenant A is absent/inaccessible in tenant B even when the same authenticated person belongs to both; no tenant-free personal library.
- Shared maintenance grants no read access to the source conversation or CRM record; selector availability is not authorization.
- Permission removal stops new use, including stale clients, imports, API retrieval, caches and previews; unknown response reconciliation does not replay a different asset mutation.
- Concurrent shared edits preserve deliberate publication and prevent lost updates; deletion/retirement does not cascade through admitted messages, provenance or official owner records.
- Offboarding keeps shared wording usable under current tenant authority, and makes personal disposition explicit without public promotion.
- Saving patient/member-care/donor-specific values does not create a hidden archive in Email Studio; approved asset content and known derivatives obey owning retention/redaction boundaries.
- My/shared labels, narrow editor access, search, previews and empty/error/loading states remain accessible on mobile and with keyboard/screen reader; no permission-only toast while a hidden stale body remains readable.
- Assets unavailable or library down do not prevent a qualified plain D4 reply; no direct Resend fallback or unqualified template execution.

## Research limits

No vendor accounts were logged into, messages sent, API mutations executed, or runtime architecture inferred. Official instructions document user-visible behavior; exact native application appearance and actual enterprise permission configurations were not interactively tested. Dates above are source-displayed dates where available, otherwise explicitly qualified. Numeric vendor limits are not proposed Asym limits. Repository inspection was limited to the ratified D4 ADR and blueprint; the parent review owns broader Email Studio/Phase 17 authority reconciliation.
