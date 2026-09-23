# Support labels: staff, maintainer and reporting journeys

Fully founder-ratified D21 UX, 12 September 2026, accompanying [R01–R24](phase26-d21-adversarial-review.md). The founder selected optional curated labels; the full amendments are ratified. This document specifies outcomes to implement and test, not an implemented or usability-tested screen.

## Everyday use

Staff open the existing conversation Details area. Show a plain **Labels** heading, selected label names and an **Add label** control. For zero labels, use neutral **No labels**. The optional help text is **“Labels help your team organize conversations. They’re optional.”** Keep it in contextual help/first-use explanation, not repeated below every label.

The selector presents searchable eligible active labels and their current selected state. Search readable names; a brief description can explain the distinction between similar terms. Selected values stay visible or separately discoverable while filtering. Opening the selector or moving focus does not change anything. Selecting a term submits explicit Add; unselecting submits explicit Remove. Do not put live management buttons inside listbox options. If the shared component uses a checkbox popup instead, its actual semantics and keyboard behavior must be tested together.

Keep the selector open for multiple deliberate choices. Show pending state for the affected item; do not disable the conversation's Reply or valid Resolve just because labeling is unavailable. A committed outcome updates the chip quietly. Failure remains beside the affected control with a meaningful retry. An uncertain response is **Checking change…**, reconciled under the same intent before allowing a contradictory retry; do not announce a guessed failure or success. Navigation away preserves the draft and does not replay the action later under another tenant.

Use text and semantic selected state, not only colored dots or a decorative check. Overflow uses **Show all labels**, without a fixed permanent label-count domain limit. Small chip X controls are not the only removal path: **Remove [name]** is available through the selector with keyboard and touch. Long names wrap or reveal their complete accessible text; no hover-only information. Ordinary Add/Remove needs no confirmation modal.

An active label can be reapplied to correct an accidental removal. If already archived, it must be restored by a qualified maintainer before new application; an Undo toast cannot bypass retirement. Removing an archived label is allowed when the source/actor remains eligible. Existing archived selections show a quiet **Archived** qualifier, remain searchable in the current-selected area and can be removed; they are absent from new unselected choices. Staff can inspect where a merged conversation's label comes from through a progressive history/details affordance when needed, not a mandatory origin diagram on every chip.

## Distinct states and exact messages

| State                                 | User-facing treatment                                                                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading catalog                       | **Loading labels…** Keep independently loaded existing chips visible with correct freshness. Do not show an empty successful catalog.                 |
| Successful empty catalog              | **No labels yet. You can continue without one.** Qualified maintainers also see **Create label** or **Manage labels**.                                |
| Successful search with no matches     | **No matching labels. Try another name.** No implicit create, suggestion of hidden labels or red error.                                               |
| Catalog read failure                  | **Labels couldn’t load. Retry.** Preserve known existing state; do not substitute No labels.                                                          |
| Read-only source                      | Show currently allowed values; no mutation control. Explain lack of edit authority without disclosing hidden memberships.                             |
| Archived during Add                   | **This label was archived. Choose another label or continue without one.** Preserve other selections.                                                 |
| Concurrent membership/topology change | **Labels changed while you were working. Review the current labels and try again.** Never silently remove newly merged contributors.                  |
| Uncertain result                      | **Checking change…** Resolve the original receipt/current state, then give a precise outcome.                                                         |
| Permission revoked                    | Remove forbidden details and actions immediately; show ordinary source-unavailable treatment. Do not leave a stale chip/name visible for convenience. |
| Unknown/incomplete membership         | **Label information unavailable** or the qualified partial-source treatment. Do not fabricate a precise hidden-label count or No labels.              |

Current source protection governs whether even a generic unavailable marker may be shown. Catalog-management permission alone never grants access to usage counts or restricted conversations. Healthy label edits are not new customer messages or follower notifications.

## Catalog maintenance

Reuse one management experience across the existing Support settings route and any contextual entry. The dialog and page must compose the same model/form rather than keep separate lifecycle implementations. The title is **Labels**; description: **“Create and maintain the labels your team uses to organize Support conversations.”** Replace donor-only copy, since staff, missionaries, organizations and other legitimate requesters also use Support.

The manager has **Active** and **Archived** sections, search, and a clear **New label** action for qualified maintainers. Each row shows its name and optional meaning. Edit is a named action; Archive/Restore lives in the row's appropriate action menu. Do not put a destructive trash icon beside every ordinary selection or offer all-tenant usage counts by default. Optional usage/details are source-authorized and must identify limited scope, not assert zero when only part is visible.

New/Edit uses a short single-column form:

1. **Name**, required and visibly validated.
2. **Meaning**, optional: “When should your team use this label?”
3. A quiet optional appearance choice using existing semantic tones, neutral by default. Show a compact preview; do not add an icon/color design studio.
4. **Create label** or **Save changes**, plus Cancel.

Explain once near the fields: **“Use general topics. Don’t include names, contact details or confidential information.”** Names remain readable Unicode text; no slug field or transliteration requirement. The technical 80/140 scalar-value bounds and corresponding byte limits are consistent across UI/server/storage. System copy localizes; tenant-authored vocabulary does not automatically translate or create duplicate language identities. No Enter/Tab/IME composition event creates a catalog entry inadvertently. Preserve drafts during save failures and announce the specific field/conflict error without raw server details.

For a name collision, show **A label with this name already exists** and the eligible existing entry. If archived, offer its authorized Restore path. Never interpret rename-to-existing-name as merge. Current optimistic form state is not durable success, and editing an entry after another maintainer saved must preserve both drafts and require review of the current version.

Clarify rename effects: **“This updates the wording wherever this label is shown. For a different meaning, create a new label.”** No algorithm claims to detect semantic repurposing. When duplicate meanings exist, maintainers clarify which term to use and archive an obsolete term; old memberships and saved references retain their distinct identity. No general label-merging wizard is introduced.

## Archive, Restore and privacy correction

Archive uses the exact chosen entry and a compact effect explanation: **“Stop offering [name] for new use. Existing labels and saved filters remain.”** One deliberate Archive action is enough; no typed phrase, required essay or repeated warnings. Do not require a usage scan exposing private view names merely to archive, because archive preserves references. A brief Undo can supplement the persistent Archived section.

Archived rows show **Restore**. It restores future availability of that identity after current permission/revision/privacy checks. It does not put a removed label back on conversations or change shared audience. A concurrent state change produces a current-state explanation; old success notices cannot visually resurrect a retired entry.

Privacy removal is separate from ordinary catalog hygiene. A qualified records/privacy path can restrict or correct mistakenly sensitive metadata; a usual handler can report it through established operations. No new Support erasure wizard, broad scrub control, permanent secret-label archive or compliance claim. Current source redaction/expiry also governs descriptions, archived values, audit names and generated exports where applicable.

## CRM and merged conversations

Inside a CRM record's authorized Support conversation, the section is clearly **conversation Labels**. Apply/Remove acts on that source and preserves the record anchor and return context. It never edits the Party's tags or interprets a matching email as identity. If the staff member lacks Support mutation authority, the CRM surface cannot grant it. If they lack CRM detail access, labeling a Support conversation still works without a CRM identity lookup.

For a merged conversation, show each effective eligible label once. If two original sources supplied it, a deliberate Remove acts on the exact contributors; inspect origin details only when needed. A topology change while the action is pending requires refresh, rather than quietly changing which records will be affected. Undoing a conversation merge reflects current memberships on each resulting side and never restores removed historical snapshots. Related conversations remain independent.

Label actions preserve the composer, recipients, internal-note purpose, assignee, work status, reply targets and retention clocks. Actual Reply/Note still uses its existing source admission, Email Studio and P6/Resend behavior where applicable. No template or Send button appears in label management.

## Reporting without false certainty

The existing Support labels report becomes **Current labels**, with the explanatory basis **“Current conversations originally started in [period]. Inboxes: currently handled in [scope]. Labels as of [time].”** The current report timezone is visible. This is not “labels applied this month,” a resolved-topic census or new-request inflow. Current merge/Undo and deliberate corrections can change its result. The [data contract](phase26-d21-data-contract.md) fixes the exact population ordering and unknown-start behavior.

Show a compact total/labelled/unlabelled summary, followed by readable horizontal bars and an accessible table. Include **No labels** as an honest population category; retired-but-still-applied labels retain their Archived qualifier. Say **“A conversation can have more than one label. Percentages may add to more than 100%.”** Each percentage divides by the same declared total, not only classified work. N=0 means no population, not 0% performance. Unknown metadata is explicitly incomplete/unavailable, never improved coverage.

Click a label row to open the matching report-context conversation list through the shared list/query capability, preserving the exact earliest-original-component-start/current-inbox/label predicate and return context. Do not translate that date condition into ordinary root createdAt filtering. D21 adds no Save this cohort as a My/Shared view action. A later live drilldown shows its new As of instant and any changed result; it does not pretend to freeze the earlier chart. Broader Open in Support is explicit navigation. If a required reference has become unavailable, explain it without broadening to All. Exports preserve the exact source/field authorization, semantic basis, current version and population; no broad raw-data browser download is a substitute for governed export.

## Accessibility and responsive proof

Preserve Core's exact base-maia/Base UI primitives and semantic CSS-variable tokens. Reuse compact variants instead of app-local color/spacing scales. Navigation focus and selected state are distinct. Listbox options do not contain nested interactive management controls; use the actual qualified shared component pattern. Test keyboard search, selection/removal, Escape, focus return, IME composition, descriptions, archived selections and recoverable failures with assistive technology. [W3C listbox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/).

Interactive targets meet WCAG2.2's 24×24 CSS-pixel minimum or documented exceptions, with larger touch affordances where practical. Verify narrow mobile viewports, 200%/400% zoom and reflow, virtual keyboards, long/RTL/non-Latin names, high contrast, reduced motion and slow/reconnecting networks. Colors alone never convey selection or archival, and announcements do not interrupt on every keystroke. [Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).

Representative staff must demonstrate finding a label, handling a no-match, resolving without labels, recognizing conversation versus CRM tags, correcting membership, and understanding report overlap. Maintainers must demonstrate rename versus new meaning and Archive versus Remove. No time-to-complete, beauty, satisfaction or accessibility compliance result is claimed before those tests. The [independent UX research](phase26-d21-ux-research.md) preserves the evidence and tradeoffs behind this design.

## Ratification and Email Studio clarification

The founder fully ratified all D21 amendments, definitions, UX/data/evidence, independent corrections and required proof on 12 September 2026. The [Email Studio integration addendum](phase26-d21-email-studio-integration.md) documents the accepted configuration/source/authoring/preparation/delivery/CRM seam without a new product choice or implementation claim. Historical proposed/pending/no-Q22 statements above are superseded as to acceptance and advancement only. [Ratification and Q22 validation](d21-ratification-q22-validation.json) preserves historical evidence separately.
