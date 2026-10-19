# D17 — visible starting choices: practice and defaulting risks

Research appendix, **2026-10-10 UTC**. Founder choice A is selected for review:
show a proven sole eligible list selected; with several choices, use an eligible
optional organization-set usual list, otherwise ask. Existing valid intent takes
precedence. This review does not ratify a final widget, configuration schema,
saved-list correction or product implementation. No users were contacted and no
product runtime or usability study was performed.

## Judgment and strongest alternative

**A is a reasonable convenience with a real error risk.** It avoids repeatedly
choosing a usual process, but a selected value can pass unnoticed and become an
inappropriate lasting record. Visibility and editability reduce that risk; they
do not prove that a person considered the choice or that the list fits the work.

The church/missionary overlap from D16 remains relevant. A church supporting a
missionary could plausibly fit either illustrative list name. Preselecting
“Missionary support” is an organizational starting preference, not evidence that
the system assessed that church's relationship. The example is a design probe,
not an observed agency workflow or a final preset.

**B's strongest case:** when work regularly uses different processes, requiring
an explicit choice prevents a preset answer from disguising an unresolved
decision. It also removes the usual-list configuration dependency. Its cost is
another choice on each unresolved start with several options, even when the same
answer usually fits. No measured time saving or error difference is established.

Selected A already permits an organization to leave its usual list unset, giving
explicit choice in those circumstances. That is a useful limit on configuration,
not grounds to create personal, team, Party-type or screen-specific defaults.

## Fresh primary evidence

All linked pages were opened on **2026-10-10**. “Undated” means no identified
publication/update date on the retrieved page. These are official design or
product documents, not an empirical study of Asym users. Their authority and
scope differ; no vendor's full behavior is adopted.

| Source and edition/date                                                                                                                                                                                                                 | Published fact                                                                                                                                                                                                        | D17 implication and limit                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GOV.UK Select](https://design-system.service.gov.uk/components/select/) and [Radios](https://design-system.service.gov.uk/components/radios/), **undated**, public-service design guidance                                             | Select guidance distinguishes settings, where defaults may be appropriate, from questions, where preselection may influence answers. Radio guidance warns of missed questions and wrong answers when preselected.     | Strong counterpressure to treating preselection as harmless. This is published design guidance, not a measured Asym effect size or a universal prohibition on internal workflow defaults. Core's component system is unchanged. |
| [Salesforce Set Record Type Preferences](https://help.salesforce.com/s/articleView?id=xcloud.user_recordtype.htm&language=en_US&type=5), **undated**, explicitly **Salesforce Classic**, listed Professional through Developer editions | A personal setting can insert the default and omit the type prompt. The guide advises leaving it off when a user works with both business and person accounts because that preference cannot distinguish those cases. | Concrete precedent for friction reduction and a mixed-work exception. Personal preferences, account-type rules and hidden prompt suppression are not selected for Core.                                                         |
| [Salesforce NPSP Required Configuration](https://help.salesforce.com/s/articleView?id=sfdo.npsp_required_config.htm&language=en_US&type=5), **undated**, Nonprofit Success Pack                                                         | Its donation-record-type example makes a type available to profiles and optionally their default within a system of distinct opportunity processes.                                                                   | Nonprofit CRM precedent for configured starting choices. It does not justify a universal Donation default, role-based assignment, financial semantics or treating an ongoing partnership as an opportunity.                     |
| [MPDX Manage Multiple Accounts](https://help.mpdx.org/article/1367-manage-multiple-accounts), updated **2024-06-25**, web help                                                                                                          | Its personal Default Account determines the account shown at login; the guide also explains switching and differences between personal and account settings.                                                          | Missions precedent for a starting context, not proof that a new partnership should inherit that account's process. A navigation default and a saved cultivation choice have different consequences.                             |
| [Shopify Product details page](https://help.shopify.com/en/manual/products/details/product-details-page), **undated**, current merchant help                                                                                            | Product details visibly show the assigned theme template, with a default product template and other live-theme choices in the menu.                                                                                   | Useful ecommerce/CMS comparison for a visible starting configuration with alternatives. Presentation templates are not relationship assessments, donor consent or giving rules.                                                 |
| [Shopify Templates](https://help.shopify.com/en/manual/online-store/themes/theme-structure/templates), **undated**, current online-store help                                                                                           | Previewing another template does not assign it; assignment is a separate admin action. Deleting an assigned template makes affected resources display the default.                                                    | The preview/assignment distinction is useful. The deletion fallback is a counterexample **not** to copy: D15 retains saved list bindings and does not replace them with a current default.                                      |

GOV.UK's concern is treated as authoritative design advice within its stated
context, not an invented controlled experiment. No participant count, effect size,
mission-agency preference or claim of universally better UX follows from these
sources. No financial allocation default, donation-form preselection or marketing
consent default was used as equivalent evidence.

## Material concerns and precise clauses

Severity concerns potential consequence; likelihood is qualitative judgment.
These clauses preserve selected A and inherited D4/D13–D16 rather than add gates.

### P01 — “usual” is mistaken for “correct for this partnership”

**High severity; plausible.** The default may receive undeserved authority,
especially with overlapping process names. This follows from the design guidance;
its actual frequency in missionary work is unknown.

**Clause:** “A prefilled list is a visible starting choice, not an assessment of
the partnership's suitability. Staff can understand its purpose and choose another
eligible list before starting. Do not present the default as recommended for this
partnership merely because it is the organization's usual list.”

**Proof:** present an illustrative church-support case where the usual list is
not the participant's intended process. They can notice, explain and change the
selection without configuration authority, a justification field or a second
approval. Concise ‘Organization's usual list’ copy can explain its origin; no
required acknowledgement or permanent warning banner is implied.

### P02 — optional convenience becomes mandatory setup or a rules engine

**Medium severity; plausible.** Implementers might require a default to finish
setup, install a donation preset by convention, or add exceptions for each team.
Salesforce's mixed-account warning makes the legitimate no-default case concrete,
without prescribing Core's policy.

**Clause:** “The organization may set, replace or leave unset its one usual choice
in the actual governed catalog/source scope. No usual choice is required. Do not
derive it from personal history, role, Party type, ministry, surface, list order,
usage popularity or AI inference.”

**Proof:** multiple eligible lists with no usual choice require selection;
setting or clearing the usual choice affects only unresolved future initial
choices. Ordinary staff can still use lists without editing configuration. No new
per-role or per-team exception setting, separate enablement wizard or forced
default is introduced. Exact physical configuration ownership remains qualified
through the existing source boundary.

### P03 — a visible field conceals a different accepted value

**High severity; plausible.** An administrator may change the default while a
form is open; delayed data may overwrite a staff choice; group retries may use
the latest preference instead of the reviewed intent. Vendor default features
do not establish safe behavior for these cases.

**Clause:** “Starting work accepts the actual visible established list intent,
subject to current source validation. A later default change cannot silently
replace an established draft, submitted member choice or saved binding. Prefilling
and previewing do not themselves admit work.”

**Proof:** load list A as usual, choose B, then change the organization's default
while the form remains open. B remains the intended selection. A reviewed group's
members retain their reviewed choices through execution/retry. If acceptance is
uncertain, reconcile the original result rather than create a different effort.
No repeated confirmation is required when nothing material changed.

### P04 — “sole option” or fallback is inferred from incomplete information

**High severity; plausible.** One search result is not one eligible list. A
withdrawn or hidden default might also trigger an arbitrary replacement. A sole
eligible list is a configuration fact, not proof that the process suits the work.

**Clause:** “Select the sole option only from a complete authorized eligible
choice set. Use a usual choice only while eligible and permitted; otherwise
apply the proven sole-option, explicit-choice or zero-choice outcome. Do not
substitute a first result, hidden value or remembered retired default.”

**Proof:** test a filtered result, partial page, failed read, withdrawn default,
permission change and valid zero-choice state. Preserve useful input and explain
the permitted next step without exposing hidden names. A sole valid list remains
visible; it never starts work automatically or prevents staff from declining to
start work whose process does not fit.

### P05 — convenience spills into stage, history or donor meaning

**High severity; plausible.** A list default might also prefill its first stage,
rewrite saved work on retirement, or imply a fundraising intent for prayer-only
partners. The Shopify fallback illustrates why superficially similar defaults
cannot be imported wholesale.

**Clause:** “A list prefill chooses no stage, participation, giving, consent,
outreach or task outcome. It changes no existing partnership. An unsaved change
of list follows D16's visible handling of an incompatible proposed stage; saved
work retains its binding and history under D15.”

**Proof:** start a prayer-only effort with the visible usual list and no assessed
stage; no financial/contact fact appears. Change an unsaved list after proposing
a stage and resolve that mismatch visibly. Changing or withdrawing the usual
list does not alter already admitted efforts or relabel their stage history.

## Qualification limits and usability tasks

Use actual agency staff and authorized missionaries before product qualification.
Compare an unchanged usual case, an exceptional process, multiple choices without
a default and a sole-option case. Ask participants what will be saved, why that
list is selected, how to change it, and whether any stage or donor agreement has
already been recorded. Include the overlapping church/missionary example, mobile
use and a reviewed group. These are proposed tasks, not reported findings.

Observe overlooked defaults, unnecessary selection work and misunderstanding of
scope; do not invent success thresholds or assume one click measures intuitive
use. Existing saved-choice correction remains a separate necessary decision.
Neither the default nor easy draft editing authorizes switching a saved list,
clearing history or deleting/recreating a mistaken ordinary partnership.
