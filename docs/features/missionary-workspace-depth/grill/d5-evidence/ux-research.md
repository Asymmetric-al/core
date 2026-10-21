# D5 — Permission-aware shared-contact correction UX

Research date: **2026-10-16 UTC**. This note supports the founder's selected
direction: missionaries can make eligible shared-contact corrections directly;
the organization configures permissible actions and fields; the UI must be
simple, clear, beautiful and faithful to actual rights. This is research, not a
formal specification, grant, implementation or tenant-settings change. No
authenticated vendor product, Core browser flow or representative user study was
tested. No application, root review or session file was edited.

## Recommendation and selected boundary

Use the existing permission settings and the existing contact detail/editor.
Administrators configure the bounded capability through the qualified permission
owner. Missionaries see a short **Edit contact details → Save contact details**
flow for fields they can currently correct. Explain the shared effect before
Save, show readable noneditable values honestly, and distinguish denied access
from permissions still loading or a service failure. Do not add a routine
approval queue, a parallel contact store or an app-local permission switch.

D5 selects the capability and tenant configurability. It does not grant every
missionary every contact field, make sharing equivalent to editing, or allow an
administrator to bypass source restrictions. Phone, email, postal address,
ordinary display name, login identity, legal name, consent and billing are not
interchangeable. Present only source-qualified operations. A phone correction is
the clean initial example; qualification of additional fields is substantive
owner work, not a reason to expose apparently functional unsupported controls.

The precise labels, grouping, dialog/page placement and focus behavior below are
recommendations to test. They are not additional founder policy decisions.

The subsequent [owner-permission review](owner-permissions.md) and
[contact-consequence review](contact-consequences.md) confirm this separation.
When email or mailing correction is qualified, its exact existing proof,
verification disposition and downstream safety rules still apply. A required
source action must be explained truthfully; it is neither a generic contact
approval workflow nor a ceremony to add to an unrelated phone correction.

## Repository evidence and local compatibility

The [Q5 decision brief](../phase28-q5-correction-research.md) identified the real
choice as adding a bounded missionary correction purpose, not re-asking whether
an already authorized contact edit needs staff approval. The brief's pre-answer
status is historical; the founder has now selected A with tenant configuration.

| Local owner/evidence                                                                                                                                                                           | Relevant consequence                                                                                                                                                                                                                                   | Limit                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [P9 A17 and B17](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md)                                                                                            | Contact edits use capability checks, validation and atomic source/evidence writes. B17 qualifies exact-person ordinary Name/Phone, revision checks and lost-response recovery.                                                                         | B17 is not the missing grant to edit another person's represented Party, email/account identity, consent or billing. P9 A7 still identifies `donors.email` as a claiming/consent key.                |
| [P12, especially the effective-access formula, field gates and permission testing](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md)                         | Multiple grant paths compose through one resolver and a subtracting floor. Edit implies view. Field/purpose scope and current authority govern; permission testing/view-as is read-only. Administration authority is distinct from exercise authority. | A group checkbox, role name, historical authorship, sharing action or frontend route is not the effective decision. Tenant settings do not bypass the floor or create a new per-grant deny model.    |
| [ADR-0211](../../../../adr/0211-distinct-human-approval-for-projection-widening.md)                                                                                                            | Existing classification and distinct-human governance apply to projection-policy widening; narrowing/neutral changes have their own immediate path.                                                                                                    | This is policy change control, not approval for every ordinary permitted contact-value edit. Do not remove existing policy governance in the name of a simple UI, or add it to routine contact Save. |
| [D2 correction boundary](../phase28-d2-adversarial-review.md) and [D4 state separation](../phase28-d4-adversarial-review.md)                                                                   | Contact availability, preparation status, private history and editing remain independent.                                                                                                                                                              | D5 must not publish notes, restore archived preparation, trigger outreach or invent a generic Unshare operation.                                                                                     |
| [Shared UI contract](../../../../../packages/ui/AGENTS.md), [frontend rules](../../../../ai/rules/frontend.md), [accessibility checklist](../../../../ai/skills/accessibility-review/SKILL.md) | Preserve exact base-maia, Base UI, semantic Zinc-family tokens and shared component ownership. Test real keyboard, phone, error and focus states.                                                                                                      | No new UI library, theme, permissions design system or custom ARIA replica is warranted. Presence of primitives does not prove the full journey.                                                     |

**Installed-version fact:** [package manifest](../../../../../packages/ui/package.json)
and [lockfile](../../../../../bun.lock) pin `@base-ui/react` **1.9.0**, but the
current workspace's `packages/ui/node_modules/@base-ui/react` resolves to an
installed **1.8.0** package. Its package metadata and bundled
`docs/react/handbook/forms.md`, `docs/react/components/button.md`, input/form
documentation were inspected. Current public Base UI documentation displays
1.9.0. This mismatch was reported, not repaired; do not claim runtime validation
against 1.9.0 or silently install dependencies during this research.

Two concrete composition concerns deserve later proof:

- Both installed Forms guidance and current public guidance say server errors
  associated with a field clear when its value changes. A permission denial is
  not ordinary format validation. Typing must not remove the enduring authority
  state or make Save appear newly permitted.
- Installed Button guidance recommends retaining focus during a loading state
  with `focusableWhenDisabled`. The current
  [shared Button wrapper](../../../../../packages/ui/components/shadcn/button-component.tsx)
  forces this property to `false` for a disabled submit button. Passing the prop
  alone therefore cannot implement that documented pattern through this wrapper.
  This is a specific interaction qualification gap, not a browser-reproduced
  defect or authorization to change a shared primitive here.

The [shared Input](../../../../../packages/ui/components/shadcn/input.tsx)
delegates to Base UI, and [Field composition](../../../../../packages/ui/components/shadcn/field.tsx)
provides labels, descriptions and errors plus the Base UI field primitive. Use
these existing composition paths and the repository's form conventions; do not
copy the external examples' colours, spacing or component stacks.

## Current primary comparisons

All URLs were consulted on **2026-10-16**, including evidence reused from the
immediately preceding Q5 research. Dates below distinguish publisher revisions
from relative labels and undated live guidance. Public documentation describes
behavior; it does not prove enforcement or usability in a tested vendor account.

| ID / primary source                                                                                                                                                   | Date and documented behavior                                                                                                                                                                                                                    | Useful lesson / limit                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1 — [Virtuous user permissions](https://support.virtuous.org/hc/en-us/articles/360050985731-How-Do-I-Manage-User-Permissions)                                        | Updated **2025-11-24**, full guide read. Contacts Write permits ordinary contact editing. Note permissions are separate; email-list Subscribe and Unsubscribe are separately permissioned.                                                      | Strong nonprofit evidence for direct editing under rights and independent communication actions. Broad assumed contact reads, administrator powers and bundled creation rights are vendor choices, not Asym defaults.                                                                         |
| C2 — [Bloomerang redesigned profiles](https://help.bloomerang.com/en/articles/17568641-redesigned-constituent-profiles-what-s-new)                                    | Current guide displays a relative update of over three weeks; staged rollout. Contact phone/email editing is grouped, while Communication Preferences has its own Edit. Existing viewing/editing permissions are preserved.                     | Supports small section-level editing without an all-record wizard. Rollout documentation and product assertions are not observed adoption or measured ease. Earlier primary URL redirected during this session.                                                                               |
| C3 — [Bloomerang user permissions](https://help.bloomerang.com/en/articles/17568278-user-permissions)                                                                 | Current redirect displays **Updated this week**. Earlier official body distinguishes constituent view from the permission to add/edit/delete; the newly retrieved introduction documents configurable user permissions.                         | Corroborates separate edit authority. Direct re-opening of the new URL was intermittently unavailable, so no claim of exhaustive verification of its latest full matrix. Do not adopt its broad default grants or older-mobile behavior.                                                      |
| C4 — [Bloomerang communication restrictions](https://help.bloomerang.com/en/articles/17568671-change-communication-restrictions-and-email-interests-for-constituents) | Current full guide, **Updated this week**; earlier version displayed **2026-09-03**. Preference/restriction updates use their own section and reason; constituents are encouraged to manage preferences.                                        | Correction is not an unsubscribe/subscribe action. Its reason requirement belongs to that operation, not every phone correction. No household propagation or marketing-policy rule is imported.                                                                                               |
| C5 — [Salesforce: what determines field access](https://help.salesforce.com/s/articleView?id=platform.customize_fieldaccess.htm&language=en_US&type=5)                | Current full primary body; precise revision undated. Field security determines visibility/editability across records, lists, reports and search. Layout and several additional permissions also affect presentation/access.                     | A visually hidden or read-only field is not sufficient authorization. Inspect resolved access across entry points. Salesforce's override permissions and universally required-field behavior are not Asym's floor semantics.                                                                  |
| C6 — [Salesforce user access summary](https://help.salesforce.com/s/articleView?id=sf.users_access_summary.htm&language=en_US&type=5)                                 | Current primary body; revision undated. Consolidates assigned permissions and explains which profile/set/group grants a permission through Access Granted By. Warns some updates need refresh.                                                  | Useful precedent for an authorized explanation of effective rights and multiple grant paths. Its summary is not promised to contain every source of access or to update instantly. Do not label a stale configured checkbox as current effective permission.                                  |
| C7 — [Power Platform column-level security](https://learn.microsoft.com/en-us/power-platform/admin/field-level-security)                                              | Updated **2026-09-21**, full primary guide. Separates Read, Update and Create at column level; profiles assign users/teams; organization-wide rules apply to data-access requests. Documents client refresh needs and administrator exceptions. | Supports action/field separation and testing the actual affected user. Do not import global administrator bypass, per-record field sharing, masking defaults or refresh-only enforcement into Asym.                                                                                           |
| C8 — [Strapi 5 RBAC](https://docs.strapi.io/cms/features/rbac)                                                                                                        | Current full primary guide; precise revision undated. Existing Settings/Roles editor organizes actions by content type, with field-level detail and a Save action. Its top-level selection defaults to all actions/fields.                      | Good precedent for grouped settings with progressive field detail. Its default-all behavior is a counterexample for a bounded correction setting; do not silently grant creation/deletion/publication through one friendly switch. Strapi administrator roles are not Asym missionary rights. |
| C9 — [Contentful: hide field when editing](https://www.contentful.com/help/fields/hide-field-when-editing/)                                                           | Current full primary body; precise revision undated. Hiding an editor field leaves its content in API output; users can show/edit it unless role rules restrict access.                                                                         | Particularly clear CMS evidence that layout hiding and actual rights differ. Asym must not send forbidden values to a browser merely because a field is hidden. Contentful deny-rule semantics are not imported.                                                                              |
| C10 — [Dynamics Customer Insights consent](https://learn.microsoft.com/en-us/dynamics365/customer-insights/journeys/real-time-marketing-email-text-consent)           | Updated **2026-10-13**, full body read during Q5. Consent is destination-based and purpose-sensitive; evaluated immediately before sending, with separate consent history.                                                                      | A corrected destination is not automatically an opt-in, verification or send permission. The product's purpose defaults and enforcement modes are not legal advice or Asym policy.                                                                                                            |

Confidence is high in the quoted primary meanings for C1/C4–C10; C2 is a
documented rollout, and C3 has the stated retrieval limit. The recommendation to
avoid a routine approval queue follows the selected product direction and P9's
native editing contract. The compared ordinary edit flows corroborate it; absence
of a review step in one guide is not proof that a vendor has no review features.

## Primary interaction, forms and accessibility evidence

The standards subagent reviewed the WAI/Base UI/GOV.UK sources below; this lane
also inspected the installed Base UI docs and the email/error-prevention pages.
Previous D1/D4 primary research was reused for stable form and mobile principles.

| ID / source                                                                                                                   | Date / version                                                                                            | Supported claim and limit                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| U1 — [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)                                                                      | Recommendation **2023-06-06**.                                                                            | Read-only and disabled are different states; read-only permits appropriate operation/navigation without editing, disabled is inoperable, and aria-hidden concerns accessibility-tree exposure. None enforces application authorization. Prefer native semantics/established primitives.                                                                      |
| U2 — [Base UI Forms](https://base-ui.com/react/handbook/forms)                                                                | Public site **1.9.0**, installed docs **1.8.0**; no page date displayed.                                  | Associated labels/descriptions, validation and named server errors support readable forms. Server field errors clear on value change. Permission, source-state and unresolved-save problems need a separate persistent state, not just an error that editing clears.                                                                                         |
| U3 — [Base UI Button](https://base-ui.com/react/components/button)                                                            | Public site **1.9.0**; relevant installed **1.8.0** guidance also inspected.                              | Documents focusable disabled behavior and a loading-state focus pattern. Exact Core wrapper behavior differs as recorded above. This API is a tool for a tested interaction, not a mandate to expose every forbidden action as a disabled button.                                                                                                            |
| U4 — [GOV.UK Button](https://design-system.service.gov.uk/components/button/)                                                 | Current guidance; latest displayed component revision **July 2026 / v6.4.0**, not the date of every rule. | Use action labels; disabled buttons can confuse users and should be avoided without supporting research. This does not mean a prohibited action should remain executable. Explain temporary unavailability and distinguish it from permanent lack of permission.                                                                                             |
| U5 — [W3C error prevention, SC 3.3.4](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html) | Understanding updated **2025-09-16**, explaining WCAG AA.                                                 | Explicitly says the criterion is not intended to require confirmation for each Save or simple record edit. It supports proportionate checking/correction; it does not waive owner-required approval for a separate policy-widening operation.                                                                                                                |
| U6 — [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                                  | Updated **2026-05-11**.                                                                                   | Material async status/results must be available to assistive technology without gratuitous focus movement. A disappearing toast is inadequate as the only explanation of an unresolved save/permission problem.                                                                                                                                              |
| U7 — [GOV.UK phone numbers](https://design-system.service.gov.uk/patterns/phone-numbers/)                                     | Current official guidance reused from D1; exact publisher revision unconfirmed.                           | Accept familiar international formatting, punctuation and country codes; use a phone-appropriate input. Does not make a phone mandatory or establish ownership, SMS consent or a universal country assumption.                                                                                                                                               |
| U8 — [GOV.UK email addresses](https://design-system.service.gov.uk/patterns/email-addresses/)                                 | Current primary body read; exact revision undated.                                                        | Allow paste, use an email-appropriate keyboard, turn off spellcheck, explain use, and let people review/correct. A possible provider-name typo should not force replacement. Repeated email entry needs user-research justification. Its self-entry autofill and confirmation-loop advice must not be copied blindly to third-party CRM editing.             |
| U9 — [GOV.UK addresses](https://design-system.service.gov.uk/patterns/addresses/)                                             | Current official guidance; exact revision unconfirmed.                                                    | A UK address lookup needs manual entry for international, missing or incorrect addresses. Supports an escape from lookup, not adding lookup or mandatory UK/US fields to a source that does not need them.                                                                                                                                                   |
| U10 — [W3C personal names around the world](https://www.w3.org/International/questions/qa-personal-names)                     | Primary internationalization guidance reused from D1; exact revision not established in this pass.        | Supports single names, scripts, punctuation and original casing without compulsory Western splitting. It does not authorize changing legal/public/account identity through ordinary contact correction.                                                                                                                                                      |
| U11 — [WCAG 2.2](https://www.w3.org/TR/WCAG22/)                                                                               | Recommendation **2024-12-12**.                                                                            | Relevant criteria cover labels, errors/suggestions, keyboard, focus, reflow and status. SC 1.3.5 concerns information about the user; autofilling the missionary's own details into another person's contact form is not a required or correct interpretation. AA target size is 24×24 CSS pixels or qualifying exceptions, not Core's phone comfort target. |

These sources support distinctions and testable principles. They do not establish
an observed missionary preference, an optimal number of controls, a fixed dialog
width or a completion-time target. Core's
[touch guidance](../../../../ai/skills/emil-design-engineering/touch-accessibility.md)
sets a 44-pixel touch-target minimum; use shared tokens and spacing rather than
shrinking controls to the WCAG threshold.

## Strongest alternative and smallest build

The strongest alternative is staff-owned correction through an existing
authorized editor, with no new missionary capability. It centralizes correction
but adds coordination and can leave stale information. The founder selected
direct missionary correction instead. That does not justify adding suggestion
inboxes, review assignments, notification broadcasts or automatic routing when
someone lacks permission.

The strongest **no-new-interface** option is to reuse an existing qualified
contact editor and permission settings, projecting only the missionary's allowed
fields/actions. If those exact owners and current-rights projections already
exist, expose and compose them. If they do not, a visual reuse is insufficient:
qualify the missing source/capability rather than inventing a shadow permission
table or a local copy of the contact. This research did not establish that the
complete D5 editor/settings path already exists.

Avoid a new “Missionaries can edit contacts” global toggle whose friendly label
conceals fields, record scope, inherited grants or source restrictions. The
simple product is the established permission editor focused on this bounded
purpose, plus a normal edit/save flow. The policy can be precise without showing
technical capability identifiers or a permissions matrix to the missionary.

## Minimal administrator journey

Use existing organization permission settings and qualified group/assignment
mechanisms. The title below is illustrative; no new route, custom role type or
separate settings store is selected. Only a currently authorized administrator
may configure the action, and that authority does not by itself reveal contact
values or allow the administrator to perform the correction.

| Moment                         | Recommended presentation                                                                                                                                                                               | Guardrail and truthful result                                                                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Find the setting               | Existing settings area, a focused **Contact corrections** section within the appropriate permission configuration. Identify the current organization and configured group/assignment.                  | No per-contact ACL or global role-name shortcut. Do not create a new “missionary” authorization role from a display classification.                                                                                      |
| Understand the capability      | **Edit shared contact details** with concise help: **Allow eligible contact corrections within this group's permitted workspace.**                                                                     | The actual source scope must be concrete and explainable. Do not describe “all contacts” if only a bounded workspace slice is eligible.                                                                                  |
| Choose eligible actions/fields | Use the existing registered action/field controls; expose qualified fields, with details expandable if useful. The clean example is ordinary phone correction.                                         | Update, Clear, Create, Delete, sharing, private-note reading and consent are not one switch. Only group operations that the exact owner treats as the same capability. No default-all grant through selecting a heading. |
| Understand restrictions        | Show configured rights separately from effective restrictions when they differ. Example: **Configured; limited by current access rules.** Offer the existing authorized explanation/test access route. | Do not show a hidden person's values in a preview. P12's read-only permission testing and administrative ceiling still govern. Do not invent a read/write impersonation mode.                                            |
| Save configuration             | Use the existing permission owner's action and direction classification. Clearly distinguish a saved grant change from a pending policy-widening review.                                               | A pending change is not active. Preserve applicable ADR-0211 governance; no promise that every settings change is immediately effective, and no new approval on ordinary contact Save.                                   |
| Verify the result              | Existing effective-access view/test, scoped to an authorized person/context when available. Explain other surviving grant paths if an unchecked setting did not remove effective access.               | “Removed from this group” is not “this person can no longer edit” unless the resolver proves that result. Do not invent a second deny overlay to make the checkbox look definitive.                                      |

A concise change summary can state the actual action/fields/scope being changed
within the existing settings save surface. Do not require another wizard for a
small grant edit. Conversely, do not hide an actual widening review behind a
generic **Saved** toast. Exact field catalogues, grant combination and policy
classification belong to P12/P3/P11 and the source owner.

## Minimal missionary journey

The view has one clear identity/context heading, one readable Contact details
section, an Edit action when available, and an ordinary Save/Cancel editor. Use
existing Maia hierarchy and spacing, not a separate permissions-themed surface.
Do not make the missionary discover rights by attempting a save that the system
already knows it cannot accept.

| Moment                        | Recommended copy/control                                                                                                                                   | Behavior                                                                                                                                                                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| View contact                  | **Contact details** with readable source-qualified facts. **Edit contact details** appears when at least one applicable correction is currently permitted. | View permission is not edit permission. No edit affordance based merely on sharing, authorship, assignment or a role label.                                                                                                                                  |
| Open editor                   | Contact's permitted display identity remains visible; ordinary editable fields have labels. Readable noneditable values remain readable when useful.       | Load current authority and source revision. Do not prefill protected fields, substitute empty strings for denied data, or make a blank form appear editable while authorization is unknown.                                                                  |
| Understand effect before Save | **Changes update the contact details available to your organization's staff.**                                                                             | Use only for fields actually belonging to that shared source; other-source edits need their own truthful description. It does not promise every staff member sees every field or imply that private notes are included.                                      |
| Correct the phone             | Existing **Phone number** field, with the recorded value and permitted clear behavior.                                                                     | Preserve usable human formatting; no new compulsory email, address, ministry or identity verification. Do not round-trip unrelated read-only fields as edits.                                                                                                |
| Save                          | **Save contact details**; **Cancel**. During a current request, **Saving…** with an accessible pending state.                                              | One deliberate source command, no routine confirmation or reason essay. Prevent repeated submission without losing focus or obscuring why the control is temporarily unavailable.                                                                            |
| Accepted                      | **Contact details updated.** Return to the same useful contact detail or update it in place.                                                               | Show accepted source values when permitted. Do not claim page refresh failure means the save failed. No unrelated sharing, send, opt-in, task completion or restoration of archived preparation; exact field-owner safety effects retain their own outcomes. |
| Value error                   | Specific inline error associated with the affected field; established error-summary/focus pattern where needed.                                            | Preserve permitted input, explain how to correct it. No colour-only error, generic “invalid” without guidance, or focus shift on every keystroke.                                                                                                            |
| Concurrent correction         | **Contact details changed while you were editing. Review the latest details before saving.**                                                               | Preserve currently authorized input and show only permitted current differences. Reconcile deliberately; no overwrite-anyway shortcut, auto-merge, silent partial Save or forced re-entry of unaffected fields.                                              |
| Save outcome unknown          | **Couldn't confirm whether your changes were saved.** Existing safe **Check again**/recovery path.                                                         | “Checking…” only while a request is actually in progress. Recover the same intended operation before blindly submitting a new one or claiming rollback.                                                                                                      |
| Close with unsaved edits      | Existing unsaved-change protection where applicable.                                                                                                       | An unsaved-draft warning is distinct from mandatory confirmation of every ordinary Save. No new draft persistence or offline private-data cache is selected.                                                                                                 |

Do not attach a mandatory “I understand this affects staff” checkbox. The shared
effect belongs directly in the editor near the fields/actions, before Save, not
only in a success toast or a help page. This is an ordinary authorized correction
with clear consequences, not another D2 sharing ceremony.

## Exact permission and availability states

These states must remain semantically distinct even if the implementation uses
fewer visual components. Hidden, blank, read-only, disabled, loading and failed
are not interchangeable. The presentation below is a recommendation, subordinate
to the current source's disclosure rules.

| Actual state                                | Recommended surface                                                                                                                                                                                                                 | Avoid                                                                                                                                                                        |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| View and correction permitted               | Readable value; editable input only in edit mode; normal Save for the selected permitted changes.                                                                                                                                   | A per-field permission selector, repeated disclosure modal, or fake approval request.                                                                                        |
| View permitted; correction not permitted    | Plain readable value or a semantically read-only control when useful. Contextual **You can view these details, but can't edit them.** if the restriction needs explanation.                                                         | Disabled-looking text that appears unreadable, an enabled pencil, a Save button that will predictably reject, or an unqualified “Request access” workflow.                   |
| No permission to view the value/source      | Use the owner's permitted omission or generic unavailable projection. Do not fetch the forbidden value to the browser.                                                                                                              | Hidden DOM values, aria-hidden as security, “Not provided,” asterisks revealing forbidden existence/length, or an error explaining a protected reason.                       |
| Authority still loading/checking            | Stable loading/checking state; no affirmative Edit/Save claim yet.                                                                                                                                                                  | Flashing editable controls, treating unknown as denied forever, or clearing values because a permission response has not arrived.                                            |
| Permission service/source load failed       | **Couldn't check editing access. Try again.** or the appropriate existing source-unavailable message. Retain only currently permitted content.                                                                                      | “You don't have permission” without a decision, an empty successful form, or enabling writes because the check failed.                                                       |
| Known temporarily unavailable operation     | Clearly explain the temporary condition and appropriate existing recovery. A disabled control can be justified with accessible explanation.                                                                                         | A permanently grey unexplained button, a tooltip as the only explanation, or implying an unsupported operation will become ready after waiting.                              |
| Pending Save                                | Communicate that submission is in progress, prevent duplicate intent, retain useful focus/context.                                                                                                                                  | Treating pending as saved, silently navigating away, or removing the focused submit control without logical recovery.                                                        |
| Edit revoked while view remains             | Persistent form-level **Your editing access changed. These changes weren't saved.** only if rejection/nonacceptance is known. Keep visible input only as currently permitted, clearly unsaved, and remove the ability to commit it. | Presenting this as a phone-format error, clearing the denial on typing, silently saving the still-permitted subset, or claiming failure when acceptance is actually unknown. |
| Read revoked during editing/result recovery | Stop revealing the now-forbidden content through fields, errors, previews, toasts and recovery. Use the source's neutral unavailable state.                                                                                         | A universal “never lose the draft” promise, cached private values, or displaying the submitted/current value as part of the denial.                                          |
| Mixed allowed fields                        | Offer only qualified edits; keep other permitted facts in the read context if helpful. Revalidate all selected changes together on Save.                                                                                            | Submitting hidden/unloaded fields, omission as Clear, silent dropping of a denied selected change, or unrelated fields becoming required.                                    |

No universal rule requires every unavailable action to be either hidden or
disabled. Prefer an uncluttered detail with no misleading Edit for a known lack
of edit rights, plus concise explanation when the user needs it. Temporarily
unavailable controls are different. The owner decides what information may be
disclosed; UI research decides how to communicate that allowed information well.

## Field-specific care without a larger form

- **Phone:** use the source's optional/clearable ordinary contact field. Accept
  international punctuation, leading plus and extensions; do not use a numeric
  quantity input. A dialable normalized form needs adequate region evidence.
  Do not invent verification, SMS opt-in, an account-phone change or a mandatory
  country selector to perform a simple correction.
- **Email:** expose correction only when the exact shared email owner and side
  effects are qualified. Use an appropriate keyboard, paste and spellcheck
  behavior. Do not automatically “fix” an unusual provider domain, require the
  address twice without evidence, or send verification as a hidden side effect.
  Current contact address, claim evidence, login credential, delivery suppression
  and destination/purpose consent remain distinct.
- **Postal address:** use the qualified address source and its actual purpose.
  If lookup exists, keep manual entry for international/missing/incorrect
  addresses. Do not require US state/ZIP or a full address merely to save a phone
  change. Postal correctness is not permission to replace billing, legal,
  receipting or published addresses owned elsewhere.
- **Name:** when the owner permits ordinary contact/display-name correction,
  preserve the unsplit Unicode value, punctuation and casing. No forced surname,
  transliteration or inferred legal identity. Name correction does not merge two
  people or grant a claim.
- **Primary/preferred and consent:** preserve the existing meaning of a contact
  method's type/preference. Changing a number, its display or a primary flag must
  not silently become new consent or clear a suppression. Do not add these
  controls to the ordinary editor without their own qualified authority.

The form edits another person's record. Test browser autofill explicitly; do
not copy self-profile `autocomplete` examples that insert the missionary's own
phone, email or address. Do not promise that a particular attribute disables
all browser/password-manager autofill. Correct labels, source context and
pre-save review still matter.

For clearing, make the selected effect understandable and use the source's
explicit Clear semantics. A visible allowed field intentionally cleared by the
user is different from an omitted, unloaded, denied or failed field. Exact
Clear capability/validation and history remain the owner contract; this note
does not add a generic delete-contact-method right.

The contact-consequence owner also distinguishes current details from already
accepted recipients, prepared messages and issued documents. Do not claim that
Save updates or recalls those historical effects. A material mailing replacement
can withdraw a superseded destination's future use under its exact source;
relevant stale work may need an owner disposition. These are qualified source
safety consequences, not a reason to require a phone editor to review all pending
communications. A later refresh or downstream review failure must not falsely
reverse an already accepted contact save.

## Adversarial concerns

Severity describes conditional harm; likelihood is a reasoned design assessment,
not measured incidence or a finding against a running D5 implementation.

| ID / concern                                                                                | Severity / likelihood                                                                         | Required UX outcome and evidence                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1 — One broad settings switch grants more than its label suggests.                         | **High / plausible** if update, create/delete, scope and field eligibility are bundled.       | Show the exact configured operation/scope/fields through existing settings; no default-all expansion. P12; C7/C8 counterexamples.                                                                    |
| R2 — Configured permission is mistaken for effective permission.                            | **High / plausible** with multiple grants and floors.                                         | Explain configured versus current effective result; removing one path is not a universal revoke. Existing authorized access testing, not a shadow ACL. P12; C5–C7.                                   |
| R3 — An attractive edit control or hidden input substitutes for authorization.              | **High / plausible** when UI-only gating is reused.                                           | Current rights govern data returned and source acceptance; every reached editor path matches. C5/C9; local owner contracts.                                                                          |
| R4 — Readability falsely implies edit rights; unknown looks denied or allowed.              | **Medium to High / plausible** in generic field forms.                                        | Distinct permission/loading/failure/read-only states; no known-impossible Save. U1/U4 and the state table.                                                                                           |
| R5 — Editing publishes private history or changes the wrong source.                         | **High / plausible** if a whole-record payload includes preparation, notes or account fields. | Visible shared effect and exact eligible fields; no private-history publication, contact clone, archive transition or account-side effect. D1–D4/P9/P12.                                             |
| R6 — Contact correction clears suppression or implies consent.                              | **High / plausible**, especially email changes.                                               | Separate destination correction, verification and preference commands; preserve source restrictions. C1/C4/C10.                                                                                      |
| R7 — Permission changes midform; a field error clears and Save looks valid again.           | **High / plausible** with generic validation state.                                           | Persistent authority state independent of format errors, current revalidation and accurate unsaved/unknown outcomes. U2; installed Forms behavior.                                                   |
| R8 — Protecting a draft leaks content after read access ends.                               | **High / plausible** if draft preservation is unconditional.                                  | Preserve only currently authorized input; clear or stop projecting forbidden values under the source contract, including feedback/recovery. P12. No automatic offline draft product.                 |
| R9 — Stale Save overwrites a staff/donor correction or applies a permitted subset silently. | **High / plausible** under concurrent editing.                                                | Explicit current-difference review where allowed; one selected-change outcome, no automatic overwrite/partial success. P9 B17 mechanism; exact D5 source qualification required.                     |
| R10 — Timeout is reported as failure and retries duplicate or overwrite.                    | **Medium to High / plausible** on phone networks.                                             | Distinguish accepted, rejected and uncertain; same-operation recovery and no false refresh rollback. P9; proposed journey.                                                                           |
| R11 — Save pending state strands keyboard focus.                                            | **Medium / concrete composition concern; impact untested.**                                   | Test the shared disabled-submit behavior; do not assume the Base UI loading example works through the current wrapper. U3 and local wrapper evidence.                                                |
| R12 — International formatting/autofill corrupts useful details.                            | **Medium to High / plausible** with Western forms or self-profile reuse.                      | Source-appropriate phone/email/address/name input, no mandatory unrelated fields, third-party autofill tests. U7–U11.                                                                                |
| R13 — Simplicity is used to erase settings governance, or approval spreads to every Save.   | **High for disclosure / plausible** if policy changes and value edits are conflated.          | Existing policy classifier/governance remains; ordinary permitted correction stays direct. ADR-0211; U5.                                                                                             |
| R14 — Settings preview becomes impersonation or reveals values the admin cannot read.       | **High / plausible** if “see what they see” is implemented as full identity swap.             | P12's qualified view-only testing/trace, current admin ceiling, no test writes or raw private data preview. P12; C6 is only a comparison.                                                            |
| R15 — Extensive permission explanations overwhelm the actual correction.                    | **Medium / plausible** if internal capability machinery is surfaced everywhere.               | Short shared-effect line, normal fields/actions, contextual exceptions. Technical grant explanations belong in authorized settings, not the missionary form. Validate comprehension with real users. |

## Phone, keyboard and visual recommendation

Use one column for the short editor on narrow screens, visible labels, readable
permitted identity and a concise shared-effect line. Keep Save and Cancel
reachable above/around the on-screen keyboard according to the existing layout;
do not cover the focused field with a sticky footer or toast. Long names,
international addresses, error text and translated labels must wrap. A wide
permissions matrix is not a suitable missionary editing surface.

Use ordinary button styling; not every shared correction needs a warning colour.
Read-only information should remain readable, not dimmed below normal content
contrast. A disabled control's visual treatment must not be the sole explanation
of permission or availability. Do not rely on hover tooltips, colour, icons,
swipe, or tiny pencil targets. Preserve Core's 44-pixel phone targets, semantic
tokens and reduced-motion baseline.

Labels, hints and errors need programmatic association. Announce Save status
without stealing focus; use the established intentional error-focus pattern
after a failed submission. If a permission update removes the focused control,
move focus to a logical surviving heading/message/action rather than the body.
The exact target depends on whether the editor remains readable and is a design
choice to test. Do not force a fixed dialog, toast duration or focus algorithm
through this research note.

## Proposed verification and user tests

No tests or interviews below were executed. Actual source, API, permission and
browser qualification is separate from the research. Representative users must
understand the real shared effect; a screenshot or synthetic database probe does
not establish usability or accessibility.

| Scenario                                                                                                  | Observable outcome to prove                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Administrator configures phone correction for an eligible group/context.                                  | They can state the affected scope/field/action before saving; no hidden create/delete/consent grant. Existing settings are used, and saved versus pending policy status is accurate.                                                    |
| Same person receives rights through two grant paths; one is removed.                                      | Configured change and effective result are distinguishable. Existing test/access explanation shows the surviving permitted path without exposing contact values or inventing a deny.                                                    |
| A floor/source restriction prevents a configured edit; admin has management but no record-read authority. | Effective limitation is understandable; no private record preview, impersonation write or floor bypass.                                                                                                                                 |
| Missionary can read but not edit; another can edit only phone.                                            | No false pencil/Save affordance. Both can understand permitted facts; mixed rights do not hide readable data unnecessarily or expose forbidden values.                                                                                  |
| Permission request loads slowly, fails, then recovers.                                                    | No editable flash, false denial, empty-data claim or permanent locked appearance; a clear current recovery path.                                                                                                                        |
| Missionary corrects a phone number on a phone.                                                            | They know which person and shared source will change, save once without needless confirmation, and can distinguish Save from communication/consent. No unrelated field completion.                                                      |
| Editor is open when edit permission is revoked; another case revokes read.                                | Known nonacceptance versus uncertainty is truthful. Typing does not clear authority denial. Remaining-readable drafts are handled safely; forbidden values disappear from all surfaces.                                                 |
| Staff/donor changes the same field, another field or source state while the form is open.                 | Current intended changes are reconciled deliberately; no stale overwrite, silent partial Save, wrong identity or unrelated clear.                                                                                                       |
| Save accepts but the response/refresh fails; duplicate submission or late response arrives.               | Same-operation recovery, no duplicated effects, no false rollback, and no old response replacing newer UI state.                                                                                                                        |
| International contact fixtures and browser autofill.                                                      | Single/non-Latin names, leading plus/extensions, long unusual emails, international/lookup-missing addresses and RTL remain correct. The missionary's own autofill does not silently replace the contact's details.                     |
| Keyboard/screen reader/zoom with valid and invalid submissions.                                           | Useful labels/errors/status, correct focus during pending/revoked states, no hidden focus target, meaningful restoration on close and no clipped or obscured controls. Include 320 CSS-pixel reflow where applicable and enlarged text. |
| Email/phone correction with existing opt-out/suppression/claim/verification evidence.                     | Only the qualified contact correction occurs; current destination/purpose restrictions remain correct; no automatic verification, message, consent reset or account identity change.                                                    |
| Same contact from Active and Archived preparation; multiple authorized surfaces.                          | Editing the contact does not reactivate preparation, publish private history or alter another worker's context. Read/edit affordances match current rights on every reached surface.                                                    |

Ask neutral questions such as “Who will see this updated number?” and “What can
you change here?” before teaching the labels. Include administrators and
missionaries with different CRM familiarity, plus assistive-technology users.
Measure misunderstanding, wrong-record edits, recovery and completion; do not
invent participant counts, preference statistics or universal time budgets.

## Remaining qualification

The selected behavior is direct, tenant-configured correction. Exact fields,
record eligibility, administration ceiling, policy-change classification,
current-rights projection, source transaction, conflict recovery and reached
legacy writers need owner reconciliation and implementation proof. Resolve the
installed dependency mismatch before version-specific browser evidence. No new
retention, notification, access-request or routine approval workflow is inferred
from these open engineering obligations.

Structural checks apply to this research artifact. The applicable
[testing rules](../../../../ai/rules/testing.md) distinguish documentation-only
verification from implementation tests; no artificial UI test was added and no
accessibility conformance claim is made.
