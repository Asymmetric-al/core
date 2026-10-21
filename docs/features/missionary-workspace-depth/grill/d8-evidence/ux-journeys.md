# D8 — invited external coaching: UX research and proposed journeys

Research-only, 2026-10-16. Repository baseline: `9cada8f3d8ab59db391d3fd20df77fcadeb09813`. Only this note was written; no UI, API, database, GitHub or invitation/send changes. Proposed screens and acceptance scenarios below have **not** been implemented or run. Primary public documentation was read today. Current behavior, product intent and proposed interaction details are separated.

**Selected boundary:** an organization may permit missionaries to invite outside coaches. A coach accepts under their own identity and receives separately authorized read-only coaching access. Eligible internal staff may also be invited; staff status is not coaching authority. A useful multi-person/project experience fits within Core's existing shell and design system. It does not require a new application, message inbox, shared login, missionary impersonation or general CRM access.

## Evidence and limits

| Evidence                                                                                                             | What it supports                                                                                                                                                                                                               | What it does not establish                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:227`                                        | Invitation/acceptance, exact modules, duration, history, revocation and recovery must be explicit; coach is not automatically staff.                                                                                           | The D8 eligibility choice does not settle the exact modules, historical interval, duration or collaborative writing powers.                                                                              |
| Founder brief `:229`, `:231`, `:233`                                                                                 | Separately chosen targets/trends/check-ins/next actions; source redaction; no default donor finances/private notes/care/Field Accounts; optional coaching must not become compulsory reporting or rankings.                    | No universal activity target, inference from missing logs, or claim that initials with exact amounts are anonymous.                                                                                      |
| `packages/ui/components.json:3`, `:11` and `packages/ui/AGENTS.md`                                                   | Exact `base-maia`, Base UI primitives, Zinc-derived semantic variables and shared UI ownership.                                                                                                                                | This review introduces no new component library, theme or app-local primitive. No shadcn generation was performed.                                                                                       |
| `apps/missionary/app/_providers/missionary-layout-shell.tsx:32`                                                      | Current mounted shell passes `role="missionary"`; it hosts shared header/sidebar navigation. `components/app-header.tsx:34` provides a sticky header and `:48` a Base UI dropdown; `app-sidebar.tsx:59` shows tenant identity. | It is not a coach/organization/active-capability switcher. Sidebar user text is placeholder (`:104`); do not reuse it as trusted identity display.                                                       |
| `apps/missionary/components/navigation-items.ts:14`, `:31`; `apps/missionary/app/access.ts:3`                        | Current navigation is donor/missionary/admin-shaped; app admission is missionary/admin/staff/super-admin.                                                                                                                      | No coach-only admission or coach navigation is implemented here. Adding “Coach” to a label or pretending the user is missionary would not supply bounded source access.                                  |
| `packages/auth/context.ts:281`; `packages/auth/client-session.ts:64`                                                 | Current context derives tenant from the profile and loads its memberships; client query cleanup keys on signout/user-ID change.                                                                                                | Same-user organization/capability changes and coaching revocation are not qualified by those existing mechanisms. UX context switching needs actual owner-supported authorization/cache isolation.       |
| `packages/ui/components/page-header.tsx:33`, `:38`; `components/shadcn/data-table/data-table-responsive-types.ts:23` | Shared responsive headers, table/card layouts, search/filter/pagination hooks, optional row actions, loading and empty slots are available. Mobile card rendering is supported at `:76`.                                       | Component availability is not source filtering, safe export, pagination correctness or accessibility proof. Do not enable generic bulk actions/export by default.                                        |
| `apps/missionary/app/feed/feed-support-ui.tsx:36`, `:65`, `:92`; `app/no-access/switch-account-button.tsx:22`        | Existing patterns distinguish loading, empty and error with status/alert semantics, labelled retry, pending action and account-switch feedback.                                                                                | The current generic “No access” page (`no-access/page.tsx:29`) does not explain expired invitation versus unavailable coaching versus wrong context. Adapt the shared pattern to source-qualified state. |

Primary comparison evidence, read today:

- [MPDX: For Those Being Coached](https://help.mpdx.org/article/511-for-those-being-coached), dated August 17, 2020, documents invitation by email, acceptance before access, a read-only view and removal by the coached person. It is a useful interaction precedent; its Cru-specific obligations are not Core requirements.
- [MPDX: For MPD Coaches, Team Leads and Supervisors](https://help.mpdx.org/article/510-for-mpd-coaches), dated October 28, 2020, documents the coach's own account, a Coaching area containing multiple people, detail navigation and self-removal. It also shows historical/activity views. Its initials-plus-amount detail and effort thresholds are **not** adopted: they do not qualify Core privacy or appropriate coaching judgments.
- [MPDX Settings reference](https://help.mpdx.org/article/1368-mpdx-quick-reference-guide-settings), dated June 25, 2024, distinguishes coaching access from full account sharing. This supports naming the invitation “coaching access,” not “share account.” None of these pages proves current external-organization eligibility enforcement or actual Core implementation.
- [WCAG 2.2 Reflow, SC 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): preserve information/actions at 320 CSS pixels and equivalent zoom; necessary tables have a limited exception, not a page-wide excuse. [Target Size, SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): minimum 24×24 CSS pixels or the defined exceptions; prefer comfortable larger primary actions on phones.
- [Accessible Authentication, SC 3.3.8](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html): support password managers/paste and an accessible path through authentication. [Focus Not Obscured, SC 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html): sticky headers/footers must not wholly hide the focused control. [Status Messages, SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): status updates must be available to assistive technology without gratuitous focus movement. These Understanding pages are explanatory guidance, not a conformance certificate.
- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) supports meaningful initial focus, keyboard containment, Escape/visible close and logical focus return for the short invitation/end-access dialogs. Reuse Core's Base UI primitive rather than reconstructing this behavior.

## Capability taxonomy: clear boundaries before adding controls

| Capability                                                                                | D8 treatment                                                                                                                              | UI consequence                                                                                                                                                           |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Read an authorized coaching summary/detail                                                | Selected read-only direction; exact source projection still needs qualification.                                                          | One Coaching home and one detail page, showing only approved modules and dates. No inherited donor roster or editable missionary workspace.                              |
| Browse several separately granted people/projects                                         | Proposed necessary navigation; each person/project remains its own qualified scope.                                                       | Search and a list within the active organization. A project grant does not include all associated missionaries; a missionary grant does not include all their projects.  |
| Review trends, chosen targets, qualitative check-ins and next actions                     | The brief requests these capabilities to resolve; specific fields/history are not settled by external-coach eligibility.                  | Render only adopted read projections. Show missing/incomplete information honestly. Do not silently add every module to the invitation.                                  |
| Coach writes a comment, check-in, suggested next action, edits a target or assigns a task | **Collaborative authoring, not read-only. Unresolved and not granted by D8.** Even a suggestion creates a durable assertion and audience. | No Reply/Comment/Assign/Edit controls in the baseline coach view. If later selected, qualify each command/source/audience independently; do not turn on generic editing. |
| Accept/decline invitation; coach ends own access                                          | Access-lifecycle actions under identity/permission owners, not writing the missionary's work.                                             | Brief explicit actions with durable state and replay-safe recovery. Own profile/account management remains separate.                                                     |
| Export/print/compare across people or organizations                                       | Additional disclosure, aggregation and persistence; not inherent to viewing.                                                              | No automatic CSV/PDF/bulk compare controls. Each must be separately approved and privacy-qualified if required later.                                                    |
| Remind, email, invite someone else, expand scope, act as missionary                       | Not granted by read-only coaching.                                                                                                        | No new inbox, automation, outreach or delegation side effect. Do not make absence of these actions an upsell or a reason to ask for staff access.                        |

This taxonomy preserves a full useful reading experience without silently converting coaching into surveillance or collaboration. Exact modules, source-qualified historical period and duration remain product/source decisions; the sketches use placeholders where those decisions belong.

## Proposed information architecture

Use one **Coaching** destination in the existing Core shell when the account has an applicable invitation or access. Inside an active organization, show authorized people/projects with search and optional simple type filtering. Detail navigation remains within that organization and coach context. Show the signed-in person's own name/account separately from the person being viewed.

One workspace menu can combine authorized organization and context choices: **“Hope Mission · Coaching”**. If the same person independently has Mission Control or their own missionary workspace, those appear as distinct authorized destinations. Choosing one changes the trusted context and clears/reloads protected projections; it does not union permissions or impersonate the selected missionary. Do not add an organization name before qualification or preserve a previous organization's data beneath a new header. Exact route placement and owner context-switch implementation are not chosen here.

### 1. Missionary manages coaching access

Use Settings → Coaching with one primary action and a compact list, not a permissions matrix.

```text
Coaching                                      [Invite a coach]
Choose who can view your approved coaching information.

Jordan Lee                    Active · View only
Shared: [approved scope summary]              [View access]

jordan@example.org            Waiting for acceptance
Invitation created [date]                    [View invitation]
```

“View access” explains the exact source-approved information, historical coverage, start/end conditions and identity. It includes **End access**. “View invitation” includes its real status and **Cancel invitation**; resend appears only if supported by the existing invitation owner and is never automatic. A status of invitation created does not claim delivery, acceptance or a grant. Pending and active rows need not coexist for the same exact invitation; the example demonstrates the two state variants.

If organization policy disallows an outside invitation: **“Your organization isn't allowing outside coach invitations.”** Explain any currently available internal-coach path without inventing an approval request or implying that all existing access was revoked. If eligibility cannot be checked: **“We couldn't check coaching availability. Try again.”** Preserve the entered email; do not claim the policy is disabled.

### 2. Invite a coach

```text
Invite a coach
They'll use their own Core account to view the information below.
They can't edit your work.

Coach's email
[name@example.org                                           ]

Information shared
[exact approved modules and subject scope]
History: [source-qualified period]
Access: [source-qualified duration/end condition]

You can end coaching access in Settings.
                              [Cancel]  [Send invitation]
```

Email is an invitation destination, not a global people search or proof of identity. Do not show an account-exists result. Render approved scope plainly; expand supporting detail when needed rather than forcing the missionary to configure every permission. No default donor names, contact details, amounts, private notes or care records. Use the restricted missionary alias where required, including email subject/preview. Invitation dispatch uses the adopted owner, not a new application inbox.

During submission: **“Creating invitation…”**. After durable acceptance: **“Invitation created. Waiting for acceptance.”** Show email-dispatch status separately only when known. If the response is lost: **“We couldn't confirm the invitation. Check its status before sending again.”** A recoverable **Check status** action resolves the original operation; repeating Send must not create a second grant or uncontrolled email. These are proposed source-dependent states, not existing handler behavior.

### 3. Coach accepts under their own account

The authenticated, intended recipient sees:

```text
Coaching invitation
[approved inviter label] invited you to coach [approved scope label].
Organization: Hope Mission
Signed in as: Jordan Lee · jordan@example.org   [Use another account]

You can view: [approved scope summary]
History: [source-qualified period]
This access lets you view information, not change it.

                              [Decline]  [Accept invitation]
```

Before authentication/recipient qualification, show only the safe invitation shell and **Sign in to continue**, with account creation available through the existing identity flow when permitted. Do not display the private scope or invitee address to anyone holding an unqualified token. Avoid retyping information already verified by the owner, while preserving any required assurance step. Password-manager/autofill/paste and accessible recovery remain available.

Wrong account: **“This invitation can't be accepted with this account.”** Action: **Use another account**. Expired/cancelled/invalid link where a more precise distinction would leak information: **“This invitation is no longer available. Ask the person who invited you for a new invitation.”** Already accepted by the currently qualified principal: **“You already accepted this invitation.”** Action: **Open Coaching** only if current access still permits it. A reused or forwarded link never substitutes the current visitor for the intended principal. Account recovery/changed email does not silently bind another person.

### 4. Coach home: several people and projects

Illustrative labels only; displayed names/aliases and scope types must be source-approved.

```text
Hope Mission · Coaching ▾                          Jordan Lee ▾

Coaching
People and projects shared with you.                      [Refresh]
[Search shared people or projects                        ]

Maya Chen                 Missionary · View only
[permitted brief summary]       Information updated [date]
[Open coaching view]

Riverside School          Project · View only
[permitted brief summary]       Information updated [date]
[Open coaching view]

[Load more]
```

Use a compact table on wider screens and the existing responsive card pattern on phones. A visible link/button identifies each row; opening a detail must not depend on a clickable unlabeled container or hover. Search operates only over currently qualified scope labels, with bounded pagination and no hidden record counts. Retain list filter/position when returning within the same valid context. Keep one organization active: an organization switcher can list authorized destinations, but do not build a cross-tenant aggregate scorecard. No donor initials, commitment rows, ranks, red/green effort judgments or “inactive missionary” inference.

Empty: **“No coaching views are available in this organization.”** Supporting text: **“Accepted invitations with current access appear here.”** This avoids claiming no records exist. Filter-empty: **“No shared views match your search.”** Action: **Clear search**. Partial load failure: retain only still-authorized successfully loaded content with **“Some information couldn't be loaded”** and a targeted retry; never replace unknown figures with zero or pretend the visible first page is everyone.

### 5. Coaching detail: understand scope before interpreting progress

```text
Hope Mission · Coaching ▾                          Jordan Lee ▾
[Back to Coaching]

Maya Chen                                             View only
Coaching information shared with you                   [View access]
Showing [qualified period]                 Updated [source time]

Overview | [other approved modules only]

[approved progress summary, with units and source/currentness]
[approved chosen targets and comparable trend, if granted]
[approved check-ins / next actions as read-only records, if granted]
```

The screen header always says whose information is open. The signed-in identity stays Jordan; never show “Logged in as Maya.” Keep the organization and coach-view indicator visible on phones even if the shell's general title would normally hide below `sm` (`app-header.tsx:41`). Show no empty tab that advertises hidden private modules. A small scope summary can describe the current allowed view without disclosing whether inaccessible records exist.

Date navigation is bounded to the actual grant and source history. A current grant does not automatically expose all past snapshots or previous coaching conversations. **“No recorded activity in this period”** describes the record, not effort; use **“Information is incomplete for this period”** when that is what the source establishes. **“Not included in this coaching view”** may describe a known approved scope boundary, but must not disclose a hidden count or record. Financial/other summaries show their defined measure, currency and currentness only if approved; never substitute current funding, committed support and recorded gifts for one another.

### 6. End access, leave coaching and interrupted reads

Missionary confirmation:

```text
End Jordan's coaching access?
Jordan will no longer be able to open this coaching view in Core.
This does not delete your records.
                              [Keep access]  [End access]
```

Coach action is **Leave coaching**, with **“You'll no longer be able to open this coaching view. A new invitation is needed to return.”** Do not call either action “Delete coach.” Confirm source completion before changing an active grant to ended. On unknown result use **“We couldn't confirm whether access ended.”** with **Check status**; do not restore an apparently failed grant automatically. A new invitation must never silently revive old scope/history.

For an already qualified visitor whose access has ended: replace the view with **“Coaching access has ended.”** and **Back to Coaching**. Do not leave stale detail cards, chart tooltips or search suggestions visible after known revocation. For an unqualified guessed URL, use a neutral **“This coaching view isn't available.”** rather than naming the subject or reason. Browser history/back navigation must requalify the view. Ending Core access cannot recall what someone previously saw or legitimately copied; avoid impossible deletion promises.

When current access cannot be verified, show **“We couldn't confirm access. Reconnect to continue.”** Do not claim “Access ended” from a timeout or use an offline snapshot as authority. Any allowed stale display requires an explicit source policy and a visible timestamp; it is not a general offline mode. Unrelated, separately authorized views remain usable when only one grant ends.

## Phone, bandwidth and accessibility requirements

Lead with text and a short scope summary. Load one bounded list page, then the selected detail; fetch charts/long history only as needed. Avoid auto-playing media, unnecessary maps, polling every card, huge recipient-like grids or automatically downloading all coaching records. A labelled Refresh and Load more give predictable behavior on unreliable connections. Stable skeletons must not flash fabricated numbers; retries target the affected request and preserve safe navigation context.

At 320 CSS pixels/400% zoom, organization/context, subject, view-only state, invitation controls, date interval and end-access actions remain discoverable without page-wide horizontal scrolling. Long names/emails wrap; destructive access actions are separated from normal navigation. Preserve Core semantic tokens and reduced-motion behavior. Do not depend on color alone for pending/active/ended, chart change or errors. Every chart needs a concise equivalent textual summary and, if appropriate and authorized, a data table. Aggregate drill-down must not disclose suppressed identities through small cohorts or comparisons.

Keyboard users can open/close the workspace menu, search, open a named scope, change an allowed date range and leave/end access. Dialogs have meaningful initial focus, labelled controls, Escape/visible close and logical focus return; focus is not lost when a row disappears. Loading/saved/retry/access-change messages use appropriate status or alert semantics without announcing every decorative update. A sticky header/phone footer must not obscure the focused action. Invitation acceptance never requires a pointer-only challenge or blocks password-manager/paste assistance. These are proposed checks, not an assertion that shared primitives automatically make the composed journey conformant.

## Proposed positive and negative acceptance scenarios — not run

| Scenario                            | Positive result to prove                                                                                                                         | Negative result to exclude                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Outside coach permitted             | Missionary reviews exact scope, creates one invitation; intended coach signs in as self and deliberately accepts; current authorized view opens. | Email match alone, invitation creation/delivery, forwarded link or staff label grants access.                                            |
| Organization denies/unavailable     | Clear policy or retry explanation, preserved email; no false success.                                                                            | Hidden button is the only control; request creates access anyway; outage is represented as policy denial.                                |
| Two organizations, several subjects | Own identity stays constant; org/context is explicit; list/detail/history include only each currently granted scope.                             | Same-user switch shows previous tenant's data, merged rights or all projects/missionaries associated with one grant.                     |
| Coach also staff/missionary         | Independently authorized contexts are distinguishable; switching deliberately reloads correct source projections.                                | Coach view inherits staff CRM, edit, finance, private note or impersonation powers.                                                      |
| History/incomplete data             | Date range stays within source/grant, comparable metrics retain units/currentness; unavailable or missing data has honest text.                  | Pre-grant or ended-grant snapshots leak; no logs become zero effort, ranking or compulsory reporting.                                    |
| Read-only capability                | Coach can read allowed targets/trends/check-ins/actions without changing the underlying work.                                                    | Comments, task completion, target editing, reminder sends, exports or bulk comparisons appear through generic table widgets.             |
| Revocation/leave during load        | Source-confirmed end removes detail/search/cache-derived content and leaves a neutral navigable state; other grants survive.                     | Late response, browser Back, open second tab or reconnect restores revoked data; failed status recovery re-grants access.                |
| Invitation resend/replay            | Lost response recovers the same invitation; expired/cancelled/replayed links are safe and understandable.                                        | Retry creates repeated invitations/sends or binds a different account; return URL changes the intended tenant.                           |
| Phone/assistive tech                | 320px/zoom, keyboard and screen reader can complete invite/accept/browse/end flows with focus and status feedback.                               | Identity/scope disappears on mobile, text truncates essential labels, icon-only actions are unnamed, focus sits behind sticky chrome.    |
| Slow/offline connection             | Bounded data, clear pending/unknown/retry, no synthetic metrics; access uncertainty fails closed as specified.                                   | Endless skeleton falsely implies progress; cached private snapshots are served as current authority; UI claims “ended” on network error. |

Release qualification still needs the adopted identity/invitation/permission source contracts, exact projection/redaction tests, actual role/tenant checks, browser/accessibility testing and representative missionary/coach feedback. No external vendor documentation establishes Core's safety, no data were fetched from a real coaching account, and no demand study or measured UX/performance result is claimed. The next design dependencies are the exact readable modules, history/duration semantics and whether any separately authorized collaborative authorship is wanted; eligibility alone must not decide them.
