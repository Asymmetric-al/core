# Phase 23 D29 Content Portability Staff UX Benchmark

**Status:** Complete supporting UX contract for the founder-ratified Phase 23
D29 B-prime-R decision. It defines a measurable nonprofit-staff experience
without independently expanding the ratified authority or authorizing
implementation.

**Date:** 2026-08-24

**Ratified:** 2026-08-24

## Experience objective

A staff member who does not know Payload, database terminology, or migration
theory must be able to:

- export exactly the intended content without changing the Site;
- understand whether the file is for spreadsheet review or semantic transfer;
- start or request a legacy-CMS migration with clear source instructions;
- choose the correct Site and locales without guesswork;
- understand every mapping, omission, blocker, and public consequence;
- confidently approve only the creation of named private drafts;
- leave and return during long processing;
- recover from partial work without duplicating or publishing anything; and
- know the exact next action at every state.

The product must be calm. Safety comes from clear scope, typed commands, sealed
plans, and recoverability—not legalistic warnings, repeated confirmation
dialogs, or unexplained disabled controls.

## Users and real nonprofit contexts

### Communications coordinator

Maintains Pages and Articles across one or more languages, may work part-time,
and wants to review content in a spreadsheet or help move a legacy website. The
coordinator understands ministry language and Page intent, not source database
fields.

### Small-organization administrator

May hold both preparation and commit capabilities because there is no dedicated
migration team. Needs expert protection without an enterprise approval
ceremony.

### Migration specialist or privileged administrator

Qualifies source exports, resolves structural mappings, commits a sealed plan,
and diagnoses partial runs. Needs technical detail on demand without leaking
provider internals into the ordinary path.

### Multilingual editor

Must see exact source and destination locales, missing translations, and
locale-specific issues. Another language's text must never appear as if it was
successfully imported.

### Media or safeguarding reviewer

Needs a compact list of people/location/rights-sensitive media and the Pages
blocked from later release. Migration success must not imply media approval.

### Ministry leader or content owner

May lack import authority but should be able to request a migration, answer
content questions, review exclusions, and inspect the resulting private drafts.

## Five-answer screen invariant

Every Content portability screen must answer, in ordinary language:

1. **Where am I working?** Exact organization/Tenant, environment, Site,
   domain, and locale scope.
2. **What is included or affected?** Item types, counts, versions, drafts,
   media, exclusions, and planned changes.
3. **Has anything changed yet?** No changes, private drafts exist, or exact
   verified partial outcome.
4. **What is happening now?** Named factual phase and truthful progress.
5. **What should I do next?** One primary next action and any bounded
   alternatives.

If the screen cannot answer all five, it is not shippable.

## Information architecture

Use the existing Web Studio Mission Control shell:

```text
Web Studio
└── Settings
    └── Content portability
        ├── Export content
        ├── Move content into Asym
        └── Recent activity
```

Do not add raw **Imports** or **Exports** Payload collections to the sidebar.
Do not bury the surface under developer settings or call it **Data tools**.

### Landing page

The page starts with one short description:

> Create authorized copies of your content or prepare content from another CMS
> as private drafts. Exporting never changes your Site, and importing never
> publishes anything.

Two equal task cards follow:

#### Export content

> Create a copy of content you are allowed to view. Exporting does not change
> your Site.

Primary action: **Create export**

#### Move content into Asym

For staff with preparation capability:

> Check and prepare content from another CMS as private drafts. Nothing becomes
> public until it is reviewed and released separately.

Primary action: **Start migration**

For staff without that capability:

> Imports are prepared with an authorized migration specialist because they
> can create many drafts at once. You can follow every step and review the
> result.

Primary action: **Request a migration**

Do not show a disabled **Import** button with a lock icon and no explanation.

### Recent activity

Use a responsive table on wide screens and labelled cards on narrow screens.
Every entry shows:

- task and human-readable source/purpose;
- exact Site and locale scope;
- requested/owned by;
- status in plain language;
- exact last-updated civil time and timezone;
- count summary where meaningful; and
- **Next step**, such as **Review 12 mappings**, **Download by 2 Sep**, **Resume
  after fixing media access**, or **Review imported drafts**.

Filters: **Needs me**, **In progress**, **Ready**, **Completed**, and **All**.
Do not make users decode a provider job ID or infer action from color.

## Governed export journey

### Export step 1 — Choose the purpose

Page title: **Export content**

Intro:

> Create a copy of content you are allowed to view. Exporting does not change
> your Site.

Offer two large radio cards with the consequence before the format:

#### Review in a spreadsheet

> A readable CSV for review or analysis. It cannot be imported back into Asym.

Supporting detail: standard safe fields, one row per content item/locale,
formula-safe encoding, and an included field guide.

#### Archive or move content

> A versioned Asym Content Package for archival or a qualified migration. It is
> not a complete website or account backup. Compatibility is checked at the
> destination.

Do not ask **CSV or JSON?** before purpose. Format is implementation detail
after the user understands the outcome.

### Export step 2 — Select exact scope

Keep one sticky, non-obscuring scope summary near the heading:

> **Hope Global Missions · Main website · English (US)**

Controls appear only when applicable:

- content types;
- current selection, current filters, or whole eligible collection;
- exact locale selection;
- **Published content only — recommended**; and
- **Include private drafts**, shown only with the separate capability.

The UI names saved filters but does not imply that a saved Library View is an
authorization boundary. The server later computes the authorized set.

Draft disclosure:

> Private drafts may contain unfinished or sensitive work. Only people with
> draft-export permission can create or download this export.

This is informative, not threatening.

Media disclosure:

> This export includes stable media references and a media-status report.
> Media files are included only when a separate authorized media-export option
> is available. Private evidence, temporary links, and provider credentials
> are never included.

### Export step 3 — Review exact impact

Heading: **Review export**

Example summary:

> **This export will contain**
>
> - 186 content items
> - 2 locales
> - 172 published items
> - 14 private drafts
> - 3 unavailable media references, listed in the report
>
> Content is captured from the exact authorized versions available when you
> create the export.

Show exclusions before the primary action, including unsupported or restricted
families. For a spreadsheet, repeat **Review only — cannot be imported**. For a
package, show package/schema version and **Compatibility will be checked at the
destination**.

Primary action: **Create export**

Do not say **Download** yet; no artifact exists.

### Export preparing

Navigate to a persistent run-detail page:

> **Preparing your export**
>
> We captured 186 exact content versions. You can leave this page; preparation
> will continue.

Show factual stages and counts, not an animation that implies certainty:

1. Checking authorized scope
2. Capturing exact versions
3. Creating the file
4. Verifying the file

If numeric progress is unavailable, use an indeterminate indicator and the
stage label. Never invent **72%** or **about two minutes**.

### Export ready

> **Your export is ready**
>
> 186 content items were included. Exporting did not change your Site.

Primary action:

- **Download review spreadsheet**, or
- **Download content package**.

Show:

- exact Site/locales and scope;
- created time and timezone;
- item/draft/exclusion/media counts;
- field-policy and package/schema versions as a friendly **Technical details**
  disclosure;
- digest verification outcome;
- **Review only — cannot be imported** or destination-compatibility statement;
- exact expiry time; and
- who can currently download.

The download action rechecks authorization. The screen never displays a
long-lived raw storage URL.

### Export expiry, revocation, and failure

Expired:

> **This download expired**
>
> Create a new export from the same saved settings to capture current
> authorized content.

Action: **Create updated export**

Access changed:

> **Your access changed**
>
> This file is no longer available to your account. The Site was not changed.

Action: **Return to Content portability**; privileged staff may see **Request
access review** through the existing support path.

Failed before artifact creation:

> **We could not prepare this export**
>
> No Site content changed. The captured versions are still recorded, and you
> can retry after resolving the problem.

Provide a stable support/reference ID and an actionable retry. Never expose a
provider stack trace.

## Migration request journey for non-privileged staff

The request form is intentionally short:

1. source CMS/site or **Other/unsure**;
2. public source URL for orientation only, never as authorization;
3. desired destination Site;
4. approximate content types/languages;
5. desired owner/contact; and
6. optional approved sample upload through the same private intake seam.

Copy:

> Nothing will be imported from this request. An authorized migration
> specialist will confirm the source and next steps with you.

The requester can follow status:

- **Request received**
- **Source information needed**
- **Qualification in progress**
- **Ready to prepare**
- **Not currently supported — next steps available**

Do not promise a date or automatic migration before qualification.

## Complete privileged migration journey

The staff-facing name is **Move content into Asym**. Technical surfaces may use
**Content Portability Run**, **adapter**, **semantic check**, and **Import Plan**
inside a collapsed operator disclosure.

The workflow is a saved full page with five steps. It is never a modal, because
mapping and repair can span sessions and devices.

### Step 1 of 5 — Source

Heading: **Where is your content coming from?**

#### Source selector

Show only certified source/version families as **Ready**. Each card names:

- source CMS;
- supported export/version range;
- what is normally carried;
- known exclusions; and
- **View source instructions**.

Always include:

#### Other CMS or custom site

> If your system is not listed, upload an approved sample or request a
> migration review. We will qualify its structure before anything changes.

This is a real route, not a dead-end **Contact support** message.

#### Source-specific checklist

Before upload, explain:

- where to create the source export;
- accepted artifact type and maximum size;
- whether source drafts/revisions are included;
- whether media bytes or only links are present;
- which source features are not carried;
- how to preserve a source backup;
- how to record the source snapshot/cutoff date; and
- whether a dedicated connected-source authorization flow is available.

Never ask users to paste CMS credentials, cookies, API keys, or signed media
links into notes.

#### Upload

Use a native **Choose files** action and optional drag-and-drop. Show filename,
size, source type, resumable transfer progress, pause/resume where supported,
and a remove/replace action before admission. The drop zone cannot be the only
path.

During admission:

> **Checking `hope-wordpress.xml`**
>
> We are verifying the file and preparing a content summary. Nothing has
> changed in Asym.

Failure copy names the fix:

- unsupported export version;
- file appears incomplete;
- encrypted/password-protected archive;
- file type does not match its contents;
- expanded archive exceeds the safe limit;
- active or unsafe content detected; or
- network transfer interrupted, with **Resume upload**.

Do not say only **Invalid file**.

### Step 2 of 5 — Destination

Heading: **Where should these private drafts go?**

Show only server-authorized destinations. The user confirms:

- organization/Tenant when their account legitimately spans more than one;
- environment where relevant;
- Site and primary domain;
- exact source-to-destination locale mappings;
- eligible ordinary family destinations; and
- explicit specialized-family handoffs or exclusions.

Persistent scope panel on this and every later step:

> **Destination:** Hope Global Missions · Main website · English (US)
>
> **Live impact:** None. This migration can create private drafts only.

Domain is orientation, not a selectable source of authority.

Mission-specific dispositions appear before mapping:

- Missionary profiles, Projects/Campaigns, and Ministry Updates use their
  qualified owner-domain migration contracts;
- source authors may be preserved as attribution but do not become users;
- giving/payment widgets, trackers, custom scripts, and unsupported embeds do
  not execute;
- source forms do not become active Asym Forms;
- source schedules are non-executable evidence only; and
- people/location/rights-sensitive media needs D27 review before release.

Example:

> **12 source authors found**
>
> Their names can be preserved as attribution. No Asym user accounts will be
> created.

### Step 3 of 5 — Match content

Heading: **Match your old content to Asym**

The default view shows unresolved work, not hundreds of obvious matches.

Summary:

> 163 fields matched · 12 need review · 4 will be left out

Filters:

- **Required**
- **Suggested**
- **Unmapped**
- **Excluded**
- **All**

Each mapping row/card contains:

- source label and stable technical key in secondary text;
- representative source values with sensitive values masked as policy
  requires;
- destination semantic meaning, not raw database field;
- status and confidence source;
- explicit **Use this match**, **Choose another**, or **Exclude with reason**;
  and
- consequence/help text.

Exact adapter-known mappings are **Matched** and collapsed. Deterministic aliases
may be **Suggested**. Heuristic or AI assistance is always labelled:

> **Suggested — review required**

It never commits a mapping. No title, slug, path, display label, or fuzzy
similarity is an update identity.

Primary action when unresolved work remains: **Review 12 matches**

When resolved: **Check the import**

Mapping is form/combobox based with a responsive table/list. Dragging may be an
optional accelerator but never a requirement.

### Step 4 of 5 — Check and resolve

Heading: **Check the import**

Helper text:

> We are checking content, paths, links, relationships, media, locales, and
> compatibility. No content is changed during this check.

During the semantic no-write check, show factual phases and allow the user to
leave. When complete, use four issue classes only:

#### Must fix before creating drafts

The plan cannot commit. Example:

> **Path already in use**
>
> `/about` belongs to “About us.” Choose a different draft path. The existing
> Page will not be changed.

#### Needs review before release

Private drafts may be created, but a later D1 candidate remains blocked or
needs a human decision. Example:

> **Media review required**
>
> Seven images contain people or location information and require rights or
> safeguarding review. Their Pages will remain blocked from release.

#### Will not be imported

Known omission with consequence. Example:

> **Unsupported embedded content**
>
> Three source forms and two scripts cannot be carried over. Replace them with
> Asym Forms or approved embeds before release.

#### Information

Non-blocking facts such as preserved attribution or generated destination
defaults.

Every issue provides:

- stable plain-language title;
- consequence;
- affected content/locale/field/reference;
- direct **Fix** or **Review item** action;
- whether bulk resolution is safe;
- source/destination evidence in a disclosure; and
- inclusion in a formula-safe downloadable issue report.

Large sets support search, filters, sort, and safe bulk resolution. Bulk action
shows its exact rule and count; it never applies across incompatible issue
types.

#### Specific required examples

Destination family:

> **Destination family required**
>
> Choose where the source type “Campaigns” belongs before continuing.

Old-site link:

> **Old-site link needs a decision**
>
> Map it to an imported Page, keep the external URL, or leave it unresolved.

Missing relationship:

> **Related Page was not found**
>
> “Training overview” links to source item `983`, which is not in this source
> snapshot. Add the missing item, choose another target, or keep a named
> unresolved-link blocker.

Locale gap:

> **Spanish content is missing**
>
> This Page has English content only. No English text will be copied into the
> Spanish draft.

Duplicate possibility:

> **Possible existing Page**
>
> This source item resembles “Our story,” but it has no exact Asym identity.
> The safe plan creates a new private Page. Review the two items after import.

### Step 5 of 5 — Review the immutable plan

Heading: **Import plan ready for review**

The first line is always:

> **No content has changed.**

Show exact destination, source snapshot/cutoff, adapter/profile versions,
package/artifact digest summary, and plan expiry/staleness conditions.

Example impact:

> - 186 Pages and Articles will be created as private drafts
> - 0 live Pages will be changed
> - 141 media items are ready for destination intake
> - 7 media items need review
> - 3 references are missing
> - 4 fields will be omitted
> - 12 proposed paths differ from the old Site
> - 0 redirects will be activated
> - 0 schedules will be activated
> - 0 items will be published

Show exact authorized updates as **new private revisions**, never **overwrite**.
List all omissions and unresolved release work. A collapsed technical section
contains plan/adapter/contract versions and digest, not provider logs.

One acknowledgement is enough:

> I reviewed the destination, exclusions, and unresolved items.

Primary action names the consequence:

> **Create 186 private drafts**

If a native Asym package has exact authorized identities and the plan includes
private successor revisions, name both consequences instead:

> **Create 170 Pages and add 16 private revisions**

Do not add a second generic confirmation dialog after this deliberate review.
A dialog is reserved for a genuinely new consequence, such as current access
or destination state changing between review and action.

#### Stale plan

> **This plan needs to be checked again**
>
> The destination, permission, or content rules changed after the import was
> checked. No drafts were created from this outdated plan.

Action: **Check import again**

Preserve prior mappings and resolutions when still compatible; explain exactly
what changed.

## Background execution experience

The browser is not the worker. After commit, navigate to persistent run detail
and state:

> You can leave this page. The migration will continue, and you can return from
> Content portability.

Show only truthful phases:

1. Checking the approved plan
2. Preparing destination media
3. Creating private drafts
4. Connecting relationships and links
5. Verifying results

Use exact counts when known:

> 83 of 186 content items created and verified as private drafts

Use an indeterminate indicator for phases without a reliable denominator. A
polite status region announces phase changes and major count milestones, not
every row.

### Interruption actions

Before the first target write:

- **Cancel import**
- explanation: **No drafts will be created.**

After durable writes begin:

- **Stop after the current safe batch**
- explanation: **Already verified private drafts will remain. We will show the
  exact result and available reversal actions. Nothing will be published.**

Do not show a fake **Cancel** action that cannot undo committed writes.

## Completion and recovery states

### Complete, no outstanding review

> **186 private drafts created and verified**
>
> Nothing was published. Review the drafts before adding them to a Site
> release.

Actions:

- **Review imported drafts**
- **View results**

### Complete with release review

> **186 private drafts created**
>
> 9 items need review before release. Nothing was published.

Actions:

- **Review imported drafts**
- **View 9 issues**
- **Download results**

Do not label this **Completed with warnings** or **Ready to publish**.

### Stopped before any writes

> **The import stopped before creating drafts**
>
> Nothing changed in Asym. Fix the source issue and check the import again.

### Partial, known outcome

> **Import paused — action needed**
>
> 83 private drafts were created and verified. The remaining 103 were not
> created. Nothing was published.

Actions:

- **View the problem**
- **Resume from the verified checkpoint**
- **Prepare a reversal**

### Unknown acknowledgement

> **Verifying what completed**
>
> We lost the response after a write. Do not start another import. We are
> reconciling the exact run before allowing another action.

Disable competing commit/resume actions while reconciliation owns the run, but
keep results and support reference available.

### Permission revoked during work

For the affected user:

> **Your access changed**
>
> The import stopped before the next change. An authorized person can review
> the exact result. Nothing was published.

Do not erase the run or continue on stale user authority. Operator/system
authorization must be separately established if policy allows continuation.

### Reversal

The action is **Prepare reversal**, never **Undo import**.

Intro:

> We will show exactly which private changes can be reversed and which items
> need review. Nothing changes until you approve the reversal plan.

The plan groups:

- can move to governed Trash;
- can receive a private restoring revision;
- edited since import;
- now referenced;
- scheduled or included in a candidate;
- released/public and therefore never auto-reversed; and
- requires owner-domain correction.

Final action names exact reversible counts. Reversal progress and partial
outcomes use the same durable state/receipt standard as import.

## Derived state model

Do not mirror one provider enum. Staff labels derive from immutable facts:
source admitted, plan current/stale, writes none/partial/complete, verification
status, blockers, and current authorization.

### Export labels

| Staff label       | Meaning                                                 | Primary next step     |
| ----------------- | ------------------------------------------------------- | --------------------- |
| Setting up        | Editable; no snapshot                                   | Continue setup        |
| Checking scope    | Authorization/counts being checked                      | Wait or resolve issue |
| Queued            | Immutable snapshot sealed                               | None; may leave       |
| Preparing         | Artifact rendering/verification                         | None; may leave       |
| Ready to download | Verified artifact; current authorization still required | Download              |
| Expired           | Artifact unavailable                                    | Create updated export |
| Access changed    | Artifact withheld                                       | Return/request review |
| Could not prepare | No Site mutation                                        | View problem/retry    |
| Cancelled         | Stopped before artifact                                 | Start again if needed |

### Import labels

| Staff label                    | Meaning                                 | Primary next step       |
| ------------------------------ | --------------------------------------- | ----------------------- |
| Setting up import              | No writes                               | Continue setup          |
| Checking source                | Admission/parsing only                  | Wait or fix source      |
| Needs your review              | Mappings/issues unresolved; no writes   | Review named count      |
| Blocked                        | Mandatory problems; no writes           | Fix blockers            |
| Ready to create drafts         | Current sealed plan; no commit blockers | Review plan             |
| Plan needs to be checked again | Plan stale; no writes from it           | Check again             |
| Queued                         | Commit admitted; writes not started     | May leave               |
| Creating private drafts        | Writes may exist                        | Follow factual progress |
| Verifying results              | Reconciling receipts and target state   | Wait; no duplicate run  |
| Paused — action needed         | Known partial disposition               | Repair/resume/reversal  |
| Completed — review needed      | Verified drafts plus release work       | Review issues/drafts    |
| Completed                      | Verified private result                 | Review drafts           |
| Stopped before changes         | Zero target writes                      | Fix/check again         |
| Preparing reversal             | No reversal mutation yet                | Review plan             |
| Reversing private changes      | Reversal writes may exist               | Follow progress         |
| Reversed                       | Verified bounded reversal               | Review remaining items  |

## Responsive UI specification

### Wide screens

- persistent page heading and compact scope panel;
- step navigation in a left or top rail using existing Studio layout tokens;
- main form column with a bounded contextual summary column;
- mapping and issue surfaces use `DataTableResponsive` conventions;
- sticky primary action may be used only if it never obscures errors or zoomed
  content; and
- technical details remain collapsible and copyable.

### Narrow screens and 400% zoom

- single-column content order: heading, exact scope, status/impact, fields,
  issues, summary, actions;
- tables become labelled cards or stacked key/value rows without horizontal
  page scrolling;
- mapping shows source, sample, destination, status, and action in that order;
- fixed/sticky regions do not consume most of the viewport;
- primary and secondary actions remain at least the shared minimum target size;
  and
- progress and errors remain visible as text, not truncated chips.

### Motion

Use subtle shared transitions only for state continuity. Progress does not
simulate speed. Respect reduced motion. A completed stage may change icon/text
without celebratory animation; migrations are consequential work, not a game.

## Accessibility contract

1. The five-step tracker is an ordered list inside
   `nav aria-label="Import progress"`; the current step has
   `aria-current="step"`. Page title and H1 include **Step N of 5**.
2. Completed steps are links only when returning will preserve state. Disabled
   future steps are plain text, not unreachable fake links.
3. Overall scope and **private drafts only** instruction is visible and
   programmatically associated on every step.
4. Upload uses native file input semantics. Drag-and-drop is optional. File
   type/size instructions are exposed before selection.
5. Mapping controls have persistent labels; accessible names include the source
   field; descriptions expose representative values and consequences.
6. No required action is drag-only, color-only, icon-only, hover-only, or
   pointer-only.
7. A persistent, focusable error summary links to each affected control/item.
   Field errors use `aria-invalid` and `aria-describedby`. Moving focus to the
   summary happens only after deliberate submission, not during typing.
8. **Must fix**, **Needs review**, **Will not be imported**, and **Information**
   are always text. Color/icon are supplementary.
9. Known progress uses native `<progress>` or an equivalently named progressbar
   with useful `aria-valuetext`, such as **83 of 186 items verified**. Unknown
   progress has no fabricated numeric value.
10. One polite live/status region announces phase changes and major milestones;
    per-row updates do not create screen-reader chatter. The processing region
    uses an appropriate busy state.
11. Completion, failure, stale plan, permission change, and partial result live
    in the page heading/body. They never exist only in a toast, email, or color.
12. Dialogs use the Core Base UI contract, contain focus, identify consequence,
    start on the heading or least-destructive action, and return focus
    logically. The review page itself replaces a redundant confirmation dialog.
13. All tasks work by keyboard, screen reader, touch, narrow viewport, 400%
    zoom/reflow, high contrast, and reduced motion.
14. Artifact expiry shows exact date, time, timezone, and consequence. No task
    has a form-completion timeout; reauthentication preserves saved setup and
    returns the user to the same safe state.

## Edge-state UX matrix

| Situation                            | User-facing disposition                                                         | Prohibited behavior                            |
| ------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------- |
| Wrong Site or locale selected        | Exact scope on every step; server eligibility; plan freezes and commit rechecks | Hidden tenant default or file-supplied target  |
| Source CMS not listed                | Other CMS/custom Site qualification request                                     | Pretend a generic CSV can preserve all content |
| Source export version changed        | Pause with exact supported versions and source instructions                     | Best-effort production parsing                 |
| Same artifact submitted twice        | Link to prior run and exact state                                               | Create duplicate drafts silently               |
| Source changed after snapshot        | Name cutoff; require a new checked delta run                                    | Blend moving source into current plan          |
| Destination changed after check      | Mark plan stale and preserve compatible setup                                   | Commit outdated assumptions                    |
| Possible duplicate without stable ID | Create-new safe default and review information                                  | Title/slug/fuzzy upsert                        |
| Browser closes                       | Persist run; return through recent activity                                     | Cancel server work or lose status              |
| Network fails during upload          | Resume same artifact identity                                                   | Duplicate upload/run                           |
| Network fails after write            | Verifying what completed                                                        | Encourage another import                       |
| Locale write fails                   | Exact locale incomplete/paused                                                  | Count base locale as whole-item success        |
| Media cannot be fetched              | Explicit blocked/excluded media and affected Pages                              | Treat broken external URL as qualified asset   |
| Rights/safeguarding unclear          | Needs review before release; D27 block                                          | Hide the image or silently publish it          |
| Script/form/payment widget found     | Will not be imported; replacement path                                          | Execute or activate it                         |
| Source author unknown                | Preserve attribution or explicit mapping                                        | Auto-create/invite user                        |
| Existing active editor               | Pause item or use visible audited checkpoint                                    | Overwrite unacknowledged work                  |
| Capability revoked                   | Stop before next mutation/download                                              | Continue on cached UI authority                |
| Run partially completes              | Exact verified/not-created counts; resume/reversal                              | Green completed-with-warnings badge            |
| User requests cancel after writes    | Stop after current safe batch                                                   | Promise rollback                               |
| Export expires                       | Recreate from current authorized state                                          | Revive old bearer link                         |
| File is malicious/oversized          | Actionable admission failure; no parsing/mutation                               | Generic 500 or partial processing              |

## User research and launch proof

Moderated testing must include at least:

- nonprofit communications staff who did not design the system;
- a small-organization administrator with combined responsibilities;
- a multilingual editor;
- a migration specialist;
- a media/safeguarding reviewer; and
- keyboard and screen-reader participants.

Participants must complete without coaching:

1. export only published English Articles for spreadsheet review;
2. explain why that CSV cannot be imported;
3. include drafts and correctly identify who can download the artifact;
4. start a certified WordPress/content-platform migration into the correct Site
   and locale;
5. identify what happens to source authors, scripts, forms, schedules, and
   media;
6. find and resolve a path collision;
7. review a suggested mapping and distinguish it from an exact match;
8. state whether anything is live after **Create private drafts**;
9. leave processing, return from recent activity, and find the next action;
10. explain a partial paused state and choose resume versus reversal; and
11. complete equivalent upload, mapping, issue, review, and result tasks by
    keyboard and screen reader.

### Launch acceptance thresholds

- every participant identifies the correct Site/locale before commit;
- every participant correctly states that import creates no live content;
- every participant distinguishes the review CSV from a portable package;
- no participant interprets a suggested mapping as already accepted;
- no blocker, exclusion, partial result, or expiry is conveyed only by color,
  toast, or email;
- all core tasks complete at narrow viewport and 400% zoom without loss of
  information or action;
- upload/mapping/check/plan/result are keyboard and screen-reader operable;
- measured time to find the first blocker and the next action meets an agreed
  usability baseline established with representative staff;
- support/escalation reasons are instrumented by safe codes, not content; and
- ordinary screens contain no raw Payload/provider mutation terminology.

### Operational UX proof

Exercise these scenarios end to end:

- maximum supported file and decompressed archive;
- weak/interrupted network with resumable upload;
- stale plan caused by content, catalog, and permission changes;
- wrong-tenant object/key attempts;
- duplicate artifact and duplicate commit;
- path and stable-identity race;
- active editor collision;
- lost response before and after a write;
- provider retry and process restart;
- locale follow-up failure;
- partial relationship closure;
- permission revocation;
- stop-after-safe-batch;
- reversal blocked by edit/reference/candidate/release; and
- artifact expiry/orphan cleanup.

## UX synthesis

The exceptional experience is not a giant importer. It is a small number of
well-explained, truthful transitions:

1. purpose before format;
2. exact scope before data;
3. visible mapping only where judgment is required;
4. no-write check before consequence;
5. immutable impact before privileged commit;
6. private drafts only;
7. durable factual progress;
8. exact partial outcomes and safe recovery; and
9. later Preview/release as a separate decision.

That structure gives sophisticated ministries control while remaining usable
for occasional staff and avoids both plugin-shaped technical debt and
overengineered enterprise ceremony.
