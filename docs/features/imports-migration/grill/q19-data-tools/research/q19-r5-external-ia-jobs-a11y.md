# Q19 R5: External practice for Data Tools: information architecture, navigation, permission-aware UI, long-running jobs, accessibility, mobile, time and notifications

All sources were accessed 2026-11-03 to 2026-11-04. This file covers outside practice only and does not describe Asym code. It builds on sibling `q19-r2-external-data-tools.md` (r2), which covers where vendors put imports, migration services, history pages and the GOV.UK task-list basics. Those findings are only cross-referenced here, not repeated. Recommendations appear only in "Synthesis for Data Tools" and are labelled _(inference)_.

**Labels.**

- **VP:** standard or public-sector text, fetched (W3C, WAI, GOV.UK, USWDS, UK government design histories).
- **VV:** vendor or design-system document, fetched (help page, product doc, design-system page, NN/g article).
- **S:** secondary. This covers search-result snippets of pages the fetcher could not open, third-party blogs, community posts and issue trackers.
- **U:** unverified or not found.
- **L:** local repository evidence.

Dates are the publication or update date shown by the source. "n.d." means the page shows none.

**Gaps and blocked pages.**

- The Atlassian navigation pages and Material 3 snackbar pages rendered empty to the fetcher (**U**).
- Polaris now redirects to `shopify.dev`, and the old Polaris toast and progress-bar pages are known only from archives and snippets (**S**).
- No Salesforce Lightning Design System (SLDS), Polaris, Fluent 2 or Material 3 guidance on hiding versus disabling for permissions was found (**U**).
- No NN/g article on hub pages, on placing infrequent admin tasks, or on relative versus absolute timestamps was found (**U**).
- Whether Shopify or Salesforce support CSV import in their mobile apps could not be confirmed (**U**).

---

## 1. Navigation and information architecture

### 1.1 What products call the area

| Product                      | Label and path                                                                                                                                                                  | What else sits there                                                                                                                       | Label  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Bloomerang                   | **Data Tools** in the side navigation. Import sits under it [BL-IMP]. "In the side navigation menu, click **Data Tools**" [BL-DHH]                                              | Data Health Hub (duplicates, name formatting) or Merge Duplicates, depending on plan [BL-DHH]. Bulk Update and Bulk Delete tools [BL-COLL] | VV / S |
| HubSpot                      | **Data Management**, often under **More**. Imports sit under Data Management > Data Integration (r2 H1). Data Quality also sits under Data Management [HS-DQ]                   | Data quality: duplicates, formatting, enrichment [HS-DQ]                                                                                   | VV / S |
| Zoho CRM                     | Setup > **Data Administration** > Import > Import History [ZO-HIST]                                                                                                             | Migration and import history together [ZO-HIST]                                                                                            | VV     |
| Salesforce                   | **Setup** > Data Import Wizard. Bulk Data Load Jobs is also in Setup (r2 SF1, SF2)                                                                                              | All admin configuration                                                                                                                    | VV     |
| Pipedrive                    | Account menu > **Tools and apps** > Import data. History is an "import history" tab [PD-IMP] (updated 19 Oct 2026)                                                              | Other tools and integrations                                                                                                               | VV     |
| Raiser's Edge NXT (web view) | Planned: Import "will be located under **Data Management**, a new option that will be added to the left navigation" [BB-IMP]                                                    | Not stated                                                                                                                                 | S      |
| Neon CRM                     | **Import Manager**. Its place in the navigation is not confirmed [NE-ACAD]                                                                                                      | Duplicate Management tool is taught alongside it [NE-ACAD]                                                                                 | S      |
| Virtuous                     | **Import Tool**, low in the primary left navigation, holding Import History (r2 VI1)                                                                                            | n/a                                                                                                                                        | S      |
| Zendesk                      | Admin Center > Objects and rules > Tools > Data importer > Import history [ZD-HIST]                                                                                             | Other admin tools                                                                                                                          | VV     |
| Notion / Linear              | Inside Settings: Settings > Import with "In progress" and "Complete" tabs [NO-IMP]. Linear's is in Import/Export settings, and only workspace admins can start imports [LN-IMP] | Settings                                                                                                                                   | VV     |

**Pattern.** Two label families appear:

- **Umbrella labels:** "Data Tools", "Data Management", "Data Administration". Where these appear (Bloomerang, HubSpot, Zoho, the planned RE NXT layout), imports share the area with data-quality or duplicate tools.
- **Narrow labels:** "Import Tool", "Import data", "Import Manager". These appear where the area holds only imports.

Nonprofit CRMs with later data-quality queues use umbrella labels (Bloomerang, HubSpot) [BL-DHH][HS-DQ].

### 1.2 Labelling guidance

- **Use familiar, specific labels.** "Menus are not the place to get cute with made-up words, internal jargon, or abstract high-level categorization." Front-load key terms [NN-MENU] (Laubheimer, 7 Jun 2024).
- **Vague labels cause wrong clicks.** "When labels are nondescript, people are more likely to click the wrong link and miss information that they need". Categories need "a unique identity" so two options aren't confused [NN-CAT] (2013, reviewed 11 Oct 2024).
- **Catch-alls are weak.** NN/g names catch-all intranet labels such as "Resources" as weak information scent [NN-SCENT] (**S**). No NN/g text addressing "Tools" specifically was found (**U**).

### 1.3 Sub-navigation inside an area

| Option                    | Guidance                                                                                                                                                                                                          | Source                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Left local navigation     | Worth it when users browse several subpages in one session. "Local navigation should not be more salient than the global navigation." Vertical navigation handles depth poorly, so use breadcrumbs for deep pages | [NN-LOC] (4 Jul 2021)   |
| Side navigation           | One to three levels. "If the site has fewer than five pages, consider organizing the page without a navigational hierarchy." Avoid stacking horizontal and vertical navigation bars                               | [US-SN] (VP)            |
| Tabs                      | Keep them few, with short labels, for supplemental content. Not for critical content or content users must compare. "Mixing in-page and navigation tabs within one tab control will disorient users"              | [NN-TABS] (2 Aug 2024)  |
| URL-changing tabs or list | Primer: a NavList item "should change the URL". Use UnderlineNav when a tab changes the URL and UnderlinePanels when it doesn't, and never mix the two. Child pages need a breadcrumb back to the parent          | [PR-NAV] (VV)           |
| Horizontal sub-navigation | MoJ: "Use this component when you have a second level of navigation". Pair it with notification badges for unread items. "Do not use this component for primary level items"                                      | [MOJ-SUB] (VP)          |
| Navigation vs task list   | GOV.UK: navigation links suit services "used repeatedly" with multiple tasks. For an end-to-end journey, "avoid using navigation links" and use a task list. Navigation "is not a site map"                       | [GV-NAV] (VP, Aug 2024) |
| Hub page with cards       | No design-system guidance found (**U**). Bloomerang's Data Health Hub is a hub page reached from Data Tools [BL-DHH]. A search summary describes its "Duplicate Constituents tile" (**S**)                        | —                       |

### 1.4 Time-bound projects next to routine items, and retiring them

- **Shopify setup guide.**
  - Use it "on your homepage or a dedicated onboarding page".
  - Mark tasks complete as people finish them, and show overall progress ("0 out of 3 steps completed") [PO-SG].
  - "If your onboarding isn't essential, then make it dismissible".
  - Avoid more than five steps.
  - Let people "complete the onboarding at a later time" [PO-ONB].
  - Neither page says what happens after completion (**U**).
- **GOV.UK complete multiple tasks.** "Completed" is black text with no background, so finished work recedes and unfinished work stands out [GV-CMT].
- **Retiring a finished project.** No design-system guidance was found on retiring a project area or turning it into an archive (**U**). Migration services are handled by vendors (r2 §2).

### 1.5 Contextual shortcuts compared with a central hub

- **Definitions.**
  - **Findability:** "Users can easily find content or functionality that they assume is present."
  - **Discoverability:** "Users encounter new content or functionality that they were not aware of previously" [NN-FD] (2014, reviewed 2019).
- **Duplicates on the same page.** These hurt: "Each extra link makes your site harder to use." Duplicates are acceptable only for a few high-priority links, "with evidence that different user groups look in different places". Place them far apart; if both are visible together, there is "probably too much redundancy" [NN-DUP] (13 Mar 2016).
- **Duplicates across screens.** NN/g's article is about duplicates on one page. No NN/g guidance on a central hub plus in-context buttons on other screens was found (**U**).
- **Product practice.** HubSpot has both a hub and an **Import** button "in the top right of any object index page" (r2 H1). Canada.ca's wayfinding study found breadcrumbs used more than the global menu [CA-WAY] (**S**).

---

## 2. Permission-aware navigation and actions

_Q20 decides who sees what. This section reports only practice._

### 2.1 Hide, disable or show with an explanation

| Source                          | Advice when the user lacks permission                                                                                                                                                                                                                                                                                                            | Label |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| IBM Carbon                      | **Hide.** The hidden variation "is used when something or someone does not have permission". "The only way to enable the hidden element and have it resurfaced on the UI is to change the assigned permission." Temporarily disabled items "should never fully disappear". Read-only content stays readable by screen readers                    | VV    |
| AWS Cloudscape                  | **Disable with a stated reason** when the permission gap is known in advance: "This action is available for resource owner". Hide items "redundant on the interface" where "there is no way for users to enable it". Use read-only fields to stop changes while keeping values visible. "Don't apply disabled state to a form submission button" | VV    |
| GitHub Primer                   | **Inactive button** as "an accessible alternative to a disabled Button". "It is required to provide some kind of feedback when a user clicks". The suggested feedback is a Dialog explaining why, with a next step. Not specific to permissions                                                                                                  | VV    |
| Atlassian (Forge UI Kit)        | Avoid disabled buttons: "use validation and errors to explain what needs to be done". "Never put tooltips on disabled buttons", because they can't be reached on every device or by some assistive technology. Use helper text instead                                                                                                           | VV    |
| NN/g                            | Disabled means "the button's action is unavailable". Use `aria-disabled="true"` to keep it focusable [NN-BTN] (25 Apr 2025). The video summary says "clearly explain why the button is disabled" [NN-DISV] (**S**). No guidance on hide versus disable                                                                                           | VV/S  |
| GitLab (design issue)           | Hides most actions the user can't perform, but some show as disabled. The team recorded the need for a written rule [GL-ISS]                                                                                                                                                                                                                     | S     |
| Emarsys                         | Disable with a tooltip ("Permission Denied: Segments / Create"). Hide only elements outside the main workflow that only selected users get [EM-PERM]                                                                                                                                                                                             | S     |
| Polaris, SLDS, Fluent, Material | Not found                                                                                                                                                                                                                                                                                                                                        | U     |

### 2.2 Deep links a user can't open

- **Don't confirm that something exists.** GitHub returns 404 Not Found "instead of a `403 Forbidden` response to avoid confirming the existence of private repositories" [GH-404] (VV).
- **Two cases, two pages (UK Department for Education, 30 May 2023).**
  - With no access to the service at all, the heading is "You do not have access to this service".
  - With some access but not the permission behind a deep link, the heading is "You do not have permission to perform this action".
  - Both pages suggest whom to contact.
  - The team found nothing in the GOV.UK design system for this. Their own pages "do not make it very easy for users to find out how they get access" [DFE-NOACC] (VP).
- **Carbon empty state.** "The user does not have permission to view the data" pairs with "Suggest steps or process to request access". Avoid dead ends [CB-EMPTY] (VV).
- **GOV.UK error-page copy.**
  - No "500" or "bad request".
  - Tell people what happened to their answers ("We saved your answers. They will be available for 30 days.") [GV-PROB] (VP). That page covers service failures, not permission errors.

### 2.3 "Someone else is running it" and "you can watch but not act"

| Product                 | Pattern                                                                                                                                                     | Label  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| GitHub Actions          | "Read access to the repository is required" to view run history and logs [GH-VIEW]. "People with write permissions" can re-run workflows [GH-RERUN] (**S**) | VV / S |
| Salesforce Bulk API 2.0 | **Aborted** = cancelled "by the job creator, or by a user with the 'Manage Data Integrations' permission" [SF-BULK]                                         | S      |
| Zoho CRM                | Administrators see every user's imports. Other profiles see only their own [ZO-HIST]                                                                        | VV     |
| HubSpot                 | Only the person who ran the import, or a Super Admin, can download the original file [HS-HIST]                                                              | VV     |
| Shopify Admin API       | One bulk operation of each type per shop at a time. From API version 2026-01, "up to five bulk query operations per shop simultaneously" [SH-BULK]          | VV     |
| Supabase Storage        | Only one client can write to an upload URL at a time. The others get **409 Conflict** [SB-TUS]                                                              | VV     |
| Pipedrive               | Only global admins can revert, within 48 hours [PD-IMP]                                                                                                     | VV     |

No source was found that shows on-screen wording for "another person's import is running" (**U**).

---

## 3. Long-running and background jobs

### 3.1 Indicator choice and thresholds

| Source                | Rule                                                                                                                                                                                                                                                                                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NN/g [NN-PROG] (2014) | Indicator after about 1 s. Looped animation for 2–10 s. Percent-done for "10 or more seconds". Use rough estimates ("About 3 minutes remaining") and pad them. Step text such as "Updating address 3 of 50". Let users stop, or the design "may be hijacking control of the system"                                                                               |
| NN/g [NN-WAIT] (2021) | "Communicate percentage of work done or time remaining for any wait that exceeds 10 seconds". "Provide start time, stop time, and total time elapsed for long processes". "Don't trap users into a long wait". The completion summary should cover what happened while the user was away (results, errors, skipped items)                                         |
| Carbon [CB-LOAD]      | A loading indicator gives no sense of progress. "If a process will take more than a moment or two to complete, use a progress indicator instead". "If the process is going to take more than a few minutes, consider including a notification"                                                                                                                    |
| Carbon [CB-PBAR]      | Under 5 s, use loading. A determinate bar needs a known goal; an indeterminate bar can switch to determinate once the size is known. An error bar stays visible and helper text explains the problem. Helper text can be "42/256 items". "Label text should never change as the progress bar is loading". Uploads should show determinate progress where possible |
| Polaris [PO-PBAR]     | Progress bar for completion. Spinner for short waits. Not for whole-page loads (**S**; the Polaris React docs are archived)                                                                                                                                                                                                                                       |
| Atlassian [AT-PT]     | Progress tracker is for steps "across multiple screens", with 3 to 6 steps. It is a wizard indicator, not a job-progress bar                                                                                                                                                                                                                                      |
| Base UI [BU-PROG]     | `Progress` "Displays the status of a task that takes a long time". `value={null}` makes it indeterminate. `aria-valuetext` / `getAriaValueText` give a readable value                                                                                                                                                                                             |

### 3.2 Status words used by products

| Product                 | States                                                                                                                                                                                                                                                                                                                       | Label |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| GitHub Actions          | Values accepted by the run-list `status` filter: `queued`, `in_progress`, `completed`, `requested`, `waiting`, `pending`, plus outcomes `success`, `failure`, `cancelled`, `skipped`, `timed_out`, `action_required`, `neutral`, `stale`. "Only GitHub Actions can set a status of waiting, pending, or requested" [GH-RUNS] | VV    |
| Shopify bulk operations | `CREATED`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELED`. A failed run can still offer a `partialDataUrl`. Result URLs "expire after one week" [SH-BULK]                                                                                                                                                                      | VV    |
| Salesforce Bulk API 2.0 | Open, UploadComplete, InProgress, JobComplete, Failed, Aborted [SF-BULK]                                                                                                                                                                                                                                                     | S     |
| Vercel deployments      | QUEUED, INITIALIZING, BUILDING, READY, ERROR, CANCELED (third-party list) [VC-STATE]. Vercel's own docs page did not list them [VC-DEP]                                                                                                                                                                                      | S     |
| Notion                  | "In progress" and "Complete" tabs in Settings > Import. For ZIP imports: "If the UI says failed, check your workspace for partially imported pages before trying again" [NO-IMP]                                                                                                                                             | VV    |
| Zoho CRM                | Per-import counts for Added, Updated and Skipped. Failed imports are "clearly marked" [ZO-HIST]                                                                                                                                                                                                                              | VV    |
| Magentrix               | Completed, Failed, Cancelled, Running, Pending, plus a "partial" outcome banner on the job page [MAG]                                                                                                                                                                                                                        | S     |
| "Completed with errors" | This exact wording was not found in any fetched vendor doc (**U**). HubSpot reports partial failure as an errors table with an "error impact" count [HS-ERR]                                                                                                                                                                 | U     |

- **Plain language.** "Backend codes and internal jargon, such as 'fulfilled' or 'label created', mean nothing to the user" [NN-STAT] (Rosala, 3 Feb 2019).
- **Error statuses (GOV.UK).** "You should avoid tasks having an error status". Show errors where they occur, and keep red for errors only [GV-CMT].

### 3.3 Run pages that persist, and what people see after closing the browser

- **GitHub.** A run page shows each job's and step's status with logs, open to anyone with read access [GH-VIEW].
- **HubSpot.** After Finish, "The review import page will open and display a timeline of the import's status along with an estimated completion time" [HS-IMP].
- **Bloomerang.** "View Full Details", "Download Import File" and "Download Skipped Records" [BL-IMP].
- **Zendesk.** Each history entry records "the import date and time, the CSV file name, the status of the import, … the number of errors, and the name of the person who performed the import" [ZD-HIST].
- **NN/g status trackers.**
  - "Maintain all previous updates alongside dates".
  - "Present the latest update prominently".
  - "Where possible, state exactly what the wait time will be" [NN-STAT].
- **Not found.** No fetched source spells out what happens to a running import when the browser closes. Linear and Notion are silent on it (**U**).

### 3.4 Cancelling and stopping

- **GitHub.**
  - Cancelling re-evaluates the `if` conditions, so `if: always()` jobs keep running.
  - Steps get SIGINT, then SIGTERM after 7.5 s, then a kill.
  - "After the 5 minute cancellation timeout period" the server forces termination [GH-CREF]. Only queued or in-progress runs can be cancelled [GH-CANCEL].
- **Shopify.** `bulkOperationCancel`, and then "a `status` of `CANCELED` is returned" [SH-BULK]. Whether a CANCELING state is visible was not confirmed from the fetched page (**U**).
- **Salesforce.** Failed ingest jobs leave "remaining job data … not processed" [SF-BULK] (**S**).
- **Undo windows.**
  - Pipedrive: revert within 48 h [PD-IMP].
  - Zoho: undo within 30 days, and only added records [ZO-HIST].
  - HubSpot: "if you updated existing records via an import, you will not be able to reverse the changes by deleting" [HS-HIST].
  - Linear: imports can be deleted "for a limited time after creation" [LN-IMP].

### 3.5 Toasts and WCAG 2.2.1 and 4.1.3

| Source                        | Position                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primer [PR-TOAST]             | "Toasts pose significant accessibility concerns and are not recommended for use." Under **2.2.1**, a toast needs "a mechanism … to extend the toast UI's presence indefinitely until manually dismissed". Under **4.1.3**, toasts must announce themselves without interrupting. Primer also lists 1.3.2, 2.1.1, 1.4.4, 1.4.10, 2.4.3 and 3.2.4 risks. "Actions that take a long time to complete should utilize banners", and email or notifications should also be considered |
| Primer [PR-MSG]               | "If the user can leave the page during the action, we should utilize GitHub's notification system"                                                                                                                                                                                                                                                                                                                                                                              |
| Carbon [CB-NOTE]              | "Don't use notifications that dismiss on a timer for critical or emergency messages". Toasts with actions persist until dismissed. A notification panel lets users "access and read all notifications without cluttering the screen"                                                                                                                                                                                                                                            |
| Atlassian flags [AT-FLAG]     | "Never use auto dismiss flags for any critical warning or error messages". Use banners for "critical messaging about loss of data or functionality". Flag titles use h2                                                                                                                                                                                                                                                                                                         |
| NN/g [NN-IVN] (17 Jan 2024)   | "Passive notifications can easily be missed". Don't use toast-style messages for errors                                                                                                                                                                                                                                                                                                                                                                                         |
| Shopify App Bridge [PO-TOAST] | Toasts are for "brief, time-limited messages that don't require user acknowledgment", including non-blocking errors. The archived Polaris docs gave a 5 s default and at least 10 s when there is an action (**S**)                                                                                                                                                                                                                                                             |
| Base UI [BU-TOAST]            | 5000 ms default; `timeout: 0` turns auto-dismiss off. `priority: 'high'` is announced urgently. F6 moves into the toast region. "Screen readers do not announce any extra content rendered inside `<Toast.Root>`" except the title and description                                                                                                                                                                                                                              |
| WCAG 4.1.3 [W3-413]           | Progress uses `role=log` (ARIA23) or a live region for a progress bar (ARIA25). A busy state can be announced ("application busy")                                                                                                                                                                                                                                                                                                                                              |

---

## 4. Multi-step journeys

### 4.1 Task list and complete multiple tasks (GOV.UK; see also r2 §5.1)

- **Statuses** [GV-CMT]:
  - Completed: black text, no background.
  - Incomplete: blue tag.
  - Not yet started: only if research shows a need.
  - In progress: teal tag.
  - Cannot start yet: grey text, row not linked, with a hint saying why.
  - There is a problem: only if unavoidable.
  - Use adjectives in sentence case.
  - Ask "Have you completed this section?" and always allow going back.
- **When to use it.** Only with evidence that users can't finish in one sitting or need to choose the order. Not for a long service done in a fixed order. Offer save and resume for tasks that span sessions [GV-TL].
- **Check answers.** A check-answers page per section can help "where different users might be completing each section".
  - "Change" links return users to the summary: "They should not need to go through the rest of the transaction again".
  - "The transaction will not be complete until a user confirms".
  - The button should name its action [GV-CA].

### 4.2 One thing per page compared with dense staff screens

- **Services for government users (GOV.UK, 11 Jan 2018).**
  - "It's not appropriate to apply a one thing per page approach on all pages". Users "might need to see all of the information they've input about something in one place".
  - "It's okay to deviate occasionally, but you'll need to back up these decisions with user research".
  - "Hold internal services to the same standard" on accessibility [GV-GOVUSERS] (VP).
- **DWP.** For staff tools, the "thing" on a page can be bigger [DWP-COLL] (**S**).

### 4.3 Wizards and step indicators

| Source               | Guidance                                                                                                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NN/g [NN-WIZ] (2017) | Use when users are unfamiliar with a process they do "only rarely". Offer a faster path for repeat users. "Allow users to exit the wizard midway and save state" and "resume the process at a later time". Label steps descriptively |
| Atlassian [AT-PT]    | 3 to 6 steps. Visited steps "have clickable links". Unvisited steps are not clickable. Steps that can't be revisited show as disabled                                                                                                |
| Carbon [CB-PI]       | At least 3 steps. Not for steps "completed in any order" or when the step count changes with conditional logic. Non-interactive by default; an interactive version uses arrow keys                                                   |
| USWDS [US-STEP]      | "Complement standard back/next navigation …, not to be navigation of its own". Not for nonlinear processes. Put a heading right below it, add `aria-current`, and give hidden completion text                                        |
| GOV.UK [GV-BACK]     | The back link returns users "to the previous page they were on, in the state they last saw it". The browser back button must not break                                                                                               |
| WAI [W3-MPF]         | "Changing the title of the page to include the progress gives immediate feedback". Save the current step's data when users jump back. "If possible, don't set a time limit"                                                          |

**Resuming a colleague's draft.** No design-system pattern was found (**U**). The closest are GOV.UK's per-section check answers for different users [GV-CA] and user-declared section completion [GV-CMT].

---

## 5. Data tables for review

| Topic                | Guidance                                                                                                                                                                                                                                                                           | Source                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Four tasks           | Find records, compare, view or edit one row, take actions. "Filters need to be discoverable, quick, and powerful". Show active filters visibly. "Freeze header rows and header columns". Batch actions use checkboxes, and Select All is useful                                    | [NN-TBL] (3 Apr 2022)           |
| Table or grid        | "Authors are strongly encouraged to use a native HTML `table`". Grid is "an interactive widget" with one tab stop                                                                                                                                                                  | [APG-TBL][APG-GRID]             |
| Grid keyboard        | Arrow keys, Home/End, Ctrl+Home/End, Page Up/Down. Enter or F2 to edit and Escape to cancel. Tab moves between widgets inside the grid                                                                                                                                             | [APG-GRID]                      |
| Against grids        | "Don't use ARIA `grid` roles simply to make rows clickable", and avoid them "unless you are rebuilding Excel". Use a labelled checkbox per row, plus an optional select-all                                                                                                        | [AR-GRID] (2023, upd. Oct 2026) |
| Virtualisation       | Set `aria-rowcount` to the full total and `aria-rowindex` on each row. Ctrl+End may land on the last row in the DOM rather than the true last row [APG-GRID]. Support for `aria-rowcount` is "partial" [A11YSUP] (**S**). Impact on browser find-in-page is not documented (**U**) | VP / S                          |
| Pagination           | Don't use infinite scroll when users must "Find something specific" or "Compare items". Use pagination or Load More                                                                                                                                                                | [NN-INF] (4 Sep 2022)           |
| Carbon table         | Batch mode disables actions on single rows. Up to five toolbar actions. Pagination "always placed at the bottom". Expandable rows suit supplementary detail                                                                                                                        | [CB-TBL]                        |
| "Show only problems" | Flatfile filters "All", "Valid", "Invalid", plus "Filter by error" [FF-REV] (**S**). HubSpot shows an errors table by column with "error impact", **View rows with errors**, two downloads, and REDACTED sensitive values [HS-ERR]                                                 | S / VV                          |
| Inline editing       | Atlassian: Return saves, Escape cancels, controls sit bottom right [AT-IE] (**S**). The APG grid edit keys are above                                                                                                                                                               | S / VP                          |
| Diff (current → new) | `<ins>` and `<del>` are announced inconsistently across screen readers. Deque flags "use of del or ins is not supported by all screen readers" [WAI-IG-DEL][DEQUE-DEL] (**S**). No design-system diff pattern was found (**U**)                                                    | S                               |
| Counts announced     | The 4.1.3 example is "5 results returned", read via a status role [W3-413]                                                                                                                                                                                                         | VP                              |
| Reflow               | Data tables are exempt from 1.4.10 ("data tables (not individual cells)"), but the heading, search and pagination around them must still reflow at 320 px [W3-1410]                                                                                                                | VP                              |

---

## 6. Accessibility specifics (WCAG 2.2 AA) and cognitive accessibility

| SC                              | Requirement (W3C)                                                                                                                                                                                                                                   | Notes                                                                                                                                                                                                                                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.5.7 Dragging Movements        | "All functionality that uses a dragging movement … can be achieved by a single pointer without dragging" [W3-257]                                                                                                                                   | The Understanding page does not say whether dragging a file in from the operating system is in scope (**U**). GOV.UK's file upload always has **Choose file** and a drop zone that stays visible (Frontend 5.9.0, Mar 2025; `multiple` in 5.13.0, Oct 2025). Dragon users may need an extra click [GV-FU] |
| 3.3.1 / 3.3.3 Errors            | 3.3.1 "provides for notification of errors". 3.3.3 requires suggestions "if … suggestions for correction are known" [W3-333]                                                                                                                        | GOV.UK file errors: "The selected file must be a CSV or ODS", "… must be smaller than …", "The selected file is empty", "… could not be uploaded – try again", "… must use the template" [GV-FU]                                                                                                          |
| 3.3.4 Error Prevention          | For financial data, or data that "modify or delete user-controllable data in data storage systems", the submission must be Reversible, Checked or Confirmed [W3-334]                                                                                | Aimed at large-scale loss, not routine saves [W3-334]                                                                                                                                                                                                                                                     |
| 2.2.1 Timing Adjustable         | Turn off, adjust (×10) or extend with at least 20 s warning; exceptions for real-time, essential, or over 20 h [W3-221]                                                                                                                             | Session-limit techniques G133 and G198. Time-limited two-factor tokens may count as essential [W3-221]                                                                                                                                                                                                    |
| 3.3.7 Redundant Entry           | Information entered earlier "in the same process" must be "auto-populated, or … available for the user to select" [W3-337]                                                                                                                          | Does not apply "when a user returns after closing a session" [W3-337]                                                                                                                                                                                                                                     |
| 2.5.8 Target Size (Minimum)     | At least 24 × 24 CSS px, or the spacing exception; inline exception [W3-258]                                                                                                                                                                        | Nothing specific to tables. The essential exception mentions dense data visualisations only [W3-258]                                                                                                                                                                                                      |
| 3.3.8 Accessible Authentication | No cognitive function test unless there's an alternative, a mechanism to help, object recognition or personal content [W3-338]                                                                                                                      | Blocking password managers or paste fails. Step-up re-authentication is likely in scope (the fetcher's inference from the scope text)                                                                                                                                                                     |
| 4.1.3 Status Messages           | See §3.5 and §5 [W3-413]                                                                                                                                                                                                                            | r2 §5.6 lists failures F103 and alert overuse                                                                                                                                                                                                                                                             |
| Focus across steps              | GOV.UK error summary takes focus (r2 GV5). Put the step in the page title [W3-MPF]. The Next.js route announcer reads `document.title`, then `<h1>`, then the path, so "ensure that each page … has a unique and descriptive title" [NEXT-A11Y] (L) | —                                                                                                                                                                                                                                                                                                         |

### Cognitive accessibility (W3C COGA "Making Content Usable", Working Group Note, 29 Apr 2021) [W3-COGA]

| Pattern                                                      | What to do (quoted)                                                                                                                                                                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 4.5.9 Avoid Data Loss and "Timeouts"                         | "Avoid timeouts and let the user save their work as they go." Otherwise, tell users at the start how much time they have and whether data will be lost                                                                                                 |
| 4.6.1 Limit Interruptions                                    | "Avoid interruptions", and give an easy way to control "interruptions, reminders, and changes in content"                                                                                                                                              |
| 4.8.3 Clearly State the Results and Disadvantages of Actions | "Clearly explain the benefits, risks and consequences of each option", including "features that may be a risk to users wellbeing or finances"                                                                                                          |
| Other relevant titles                                        | 4.7.5 "Do Not Rely on Users Calculations or Memorizing Information". 4.5.2 "Let Users Go Back". 4.5.5 "Make it Easy to Undo Form Errors". 4.2.4 "Make Each Step Clear". 4.4.1 "Use Clear Words". 4.3.1 "Make it Easy to Find the Most Important Tasks" |

The Note is supplemental and not needed for conformance [W3-COGA]. No COGA text specific to nonprofit staff was found (**U**).

---

## 7. Mobile, tablet and field conditions

- **HubSpot mobile.** The import article lists device contacts, a business-card scanner and vCard QR codes. It does not mention CSV or spreadsheet import (updated 13 May 2026) [HS-MOB].
- **Salesforce mobile.** No official page was found on running the Data Import Wizard on mobile. Third-party pages call it a browser wizard reached through Setup [SF-MOB] (**S**/**U**).
- **Shopify mobile.** No official statement on CSV import in the mobile app (**U**).
- **Reflow.** Tables may scroll inside their own container; surrounding controls must still reflow [W3-1410].
- **Desktop-first heavy work.** No design-system or NN/g source states a "status on mobile, heavy work on desktop" rule (**U**). One research paper notes that "it is not feasible for a mobile app to support all the desktop workflows" [GT-SPOT] (**S**, 2018).

### Large uploads on low bandwidth

| Mechanism             | Facts                                                                                                                                                                                                     | Source    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| tus 1.0.0             | HEAD returns `Upload-Offset` and PATCH resumes from it. An optional expiration extension (`Upload-Expires`) and termination by DELETE                                                                     | [TUS]     |
| Supabase resumable    | Built on tus. Recommended for files that "may exceed 6MB". Chunks are exactly 6 MB. Upload URLs are valid for up to 24 h. One writer per URL, others get 409. `onProgress` gives bytes uploaded and total | [SB-TUS]  |
| S3 multipart          | Best practice from 100 MB. Pause and resume, quick recovery, retry only failed parts. No expiry until completed or stopped, so set a lifecycle rule to abort incomplete uploads                           | [S3-MPU]  |
| Uppy Golden Retriever | Restores selected files after a crash or closed tab (IndexedDB, LocalStorage, optional Service Worker). Files it can't restore show as "ghosts" to reselect. Data expires after 24 h by default           | [UPPY-GR] |
| Showing progress      | Carbon: uploads should show determinate values where possible [CB-PBAR]. GOV.UK failure copy: "The selected file could not be uploaded – try again" [GV-FU]                                               | VV / VP   |

---

## 8. Time zones and dates in history

| Source                 | Default                                      | When to use absolute                                                                                                                                                                                                                                      | Time zone                                                                                                 |
| ---------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Primer [PR-RT]         | Relative within 30 days (`threshold` `P30D`) | "Use precise dates when the user needs to know the exact time of past dates". "Don't use relative dates for past specific dates". Running tasks show elapsed or remaining time. Avoid micro formats ("2mo"), because VoiceOver may read "1m" as "1 meter" | `timeZoneName` prop. The example tooltip includes GMT+0000                                                |
| GitLab Pajamas [GL-DT] | **Absolute**                                 | "Users need specific dates and/or times for technical, security, or legal reasons", for example audit logs. "When using the relative format, always display the absolute time in a tooltip"                                                               | "Dates are localized to each user's browser location". Add the zone "where timezone context is important" |
| Cloudscape [CS-TS]     | Relative                                     | When "Users need a specific date and time"                                                                                                                                                                                                                | Human-readable format with a UTC offset, e.g. "(UTC±h:mm)". The `<time>` title holds the absolute value   |
| NN/g [NN-STAT]         | —                                            | Show "the date and time" for each status event, and keep earlier updates with their dates                                                                                                                                                                 | —                                                                                                         |

The **organisation's time zone or the viewer's** question has no design-system guidance (**U**). Product examples (**S**):

- A workspace time zone that overrides device time [TZ-FORM].
- Labelling the time zone on exported audit evidence [TZ-THREAT].

---

## 9. Notifications: in-app centre, email, task inbox

| Source                               | Guidance                                                                                                                                                                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NN/g [NN-STAT]                       | "Status trackers are pull; progress updates are push". Offer both. Let users choose channel and frequency. Each update should link straight to the item. Avoid duplicate alerts from two senders. Keep channels consistent    |
| NN/g [NN-IVN]                        | Action-required notifications "are often urgent and should be intrusive". Passive ones are easy to miss. Each notification should make sense on its own                                                                       |
| Carbon [CB-NOTE]                     | Toasts suit system updates; a notification panel holds history                                                                                                                                                                |
| Primer [PR-MSG][PR-TOAST]            | If users can leave, use the notification system. Consider email                                                                                                                                                               |
| Linear [LN-NOTIF][LN-INBOX]          | Email is digest or immediate. Digests are "only sent if you haven't already read the Linear inbox notification" and are grouped "based on urgency". Desktop, mobile and Slack are real time. Inbox has snooze and unsubscribe |
| GitHub [GH-NOTIF][GH-NCONF][GH-ACTN] | Web inbox, email and mobile, with "Done" triage. Read status can sync from email to the web (**S**). There is an Actions setting to notify only for failed workflows (**S**)                                                  |
| COGA [W3-COGA]                       | "Limit Interruptions"                                                                                                                                                                                                         |

No source covers removing duplicates between a task list and a notification feed in one product (**U**). Linear's rule of sending a digest only for unread items is the closest documented approach.

---

## Synthesis for Data Tools _(inference)_

This section is inference drawn from the sources above. It does not reopen Q19 option B or anticipate Q20.

1. **Label and sub-navigation.**
   - "Data Tools" has direct precedent (Bloomerang), and the umbrella family fits the later data-quality queues (Bloomerang, HubSpot).
   - Keep the sub-items concrete: Switch, Imports, Saved mappings, and later Data quality.
   - Make Imports the landing page and the most prominent item.
   - Use a small URL-changing sub-navigation (tabs that change the URL, or a short left list). A card hub has no design-system backing, and the area has fewer than five destinations [US-SN][NN-TABS][PR-NAV].
2. **The Switch as a time-bound item.**
   - While a Switch is open, show it first, as a GOV.UK-style task list with "Cannot start yet" rows and short adjective statuses [GV-CMT].
   - Once closed, demote it to a read-only record linked from Imports history, rather than deleting the entry. This keeps findability for audits without permanent clutter (no source covers retirement).
3. **Shortcuts.**
   - "Import people" and "Upload a Gift file" fit NN/g's narrow exception: different user groups start in different places.
   - Have them open the same URL-addressable flow under Data Tools, with the same label and breadcrumbs, so staff learn one place.
   - Never place two copies in one view [NN-DUP][NN-FD].
4. **Permissions (for Q20).**
   - Hide the sidebar entry only when someone has no Data Tools capability of any kind [CB-DIS].
   - Where someone can view but not act, show read-only status and a stated reason in text, not a tooltip ("Only people who can reverse imports can confirm this") [CS-DIS][AT-FBTN][PR-BTN].
   - For a cross-tenant or unknown import ID, return not-found [GH-404].
   - For same-tenant pages a user lacks rights to, show a page saying they don't have permission, with who to ask [DFE-NOACC][CB-EMPTY].
   - The ratified one-heavy-job-per-ministry lock (r1 S14) needs visible wording: who is running what, since when, and a link to that run's page.
5. **Job UX.**
   - Each import page acts as the durable run page: who started it, start time, finish time, elapsed time, live counts ("Row 3,000 of 12,000"), a rough padded estimate, and a completion summary of what happened while away [NN-PROG][NN-WAIT][HS-IMP].
   - Use plain-language statuses with no backend codes, and a distinct state for partial success, shown as a count of problem rows rather than a red overall status [NN-STAT][GV-CMT][HS-ERR].
   - "Stop" must say what happens to rows already written, and must stay separate from "Prepare reversal" [GH-CREF][HS-HIST].
   - Never use a toast as the only completion or failure signal. Use a persistent banner on the run page plus the notification channel [PR-TOAST][CB-NOTE][AT-FLAG].
   - If Base UI toasts are used for minor confirmations, keep `priority: 'low'` and put the full message in the title or description [BU-TOAST].
6. **Notifications without duplicates.**
   - The Tasks Hub item is the actionable copy for "needs someone".
   - The notification feed gets one entry per change of state, linking to the import page.
   - Email is a digest sent only if the in-app item is still unread (Linear's model). Let staff choose channels [NN-STAT][LN-NOTIF].
7. **Steps.**
   - Each import is a linear stepper (upload, map, review, import), with visited steps clickable, and the step in the page title and `<h1>` for the Next.js route announcer [AT-PT][W3-MPF][NEXT-A11Y].
   - Commit goes through a check-answers summary to meet 3.3.4 "Confirmed" for money and records [GV-CA][W3-334].
   - Dense staff screens are acceptable if backed by research [GV-GOVUSERS].
   - A colleague's draft should open at its saved step with who saved it and when (no pattern found).
8. **Review tables.**
   - Use a native `<table>` with a labelled checkbox per row, not an ARIA grid [AR-GRID][APG-TBL].
   - Provide a visible "Only rows with problems" filter [FF-REV][HS-ERR] and sticky headers [NN-TBL].
   - Prefer pagination to infinite scroll [NN-INF]. If you virtualise, set `aria-rowcount` and `aria-rowindex` [APG-GRID].
   - Announce counts through `role="status"` [W3-413].
   - Show diffs as text ("Current: … New: …"), not colour or `<ins>`/`<del>` alone [DEQUE-DEL].
9. **Accessibility guardrails.**
   - Upload: a Choose file button plus a drop zone, with GOV.UK-style file errors [GV-FU].
   - Session timeouts: warn and allow extending during long reviews, and save as you go [W3-221][W3-COGA].
   - Saved mappings meet 3.3.7 within a run [W3-337].
   - Re-authentication for reversal must allow password managers and paste [W3-338].
   - Dense rows must still meet the 24 px target size or the spacing exception [W3-258].
10. **Mobile.**
    - Treat upload, mapping and review as desktop or tablet work.
    - On phones, support following status and acting on Tasks Hub items that don't need a review table. Vendors don't offer CSV import on mobile [HS-MOB]; Salesforce and Shopify are unverified.
    - Use resumable uploads (tus or Supabase) for files over about 6 MB, with determinate progress and "resume" wording [SB-TUS][TUS][CB-PBAR].
11. **Time.**
    - In history lists, run pages and reversal deadlines (legal and financial), show absolute date and time with the time zone named [GL-DT][CS-TS].
    - Relative wording ("in 12 days", "2 hours ago") can sit beside it as visible text, never only in a tooltip [PR-RT].
    - Which zone to use (ministry or viewer) is a product decision with no external standard. Labelling the zone avoids ambiguity either way.

---

## Conflicts between sources

| Topic                          | Conflict                                                                                                                                                                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hide or disable for permission | Carbon hides [CB-DIS]. Cloudscape and Emarsys disable with a stated reason [CS-DIS][EM-PERM]. Atlassian avoids disabled buttons and never uses tooltips on them [AT-FBTN]. Primer prefers inactive buttons that respond with an explanation [PR-BTN] |
| Toasts                         | Primer: "not recommended" [PR-TOAST]. Carbon, Shopify and Base UI allow them for non-critical messages, and Shopify even for non-blocking errors [CB-NOTE][PO-TOAST][BU-TOAST]. NN/g: no passive toasts for errors [NN-IVN]                          |
| Completion notice              | NN/g suggests noticeable modal completion dialogs that don't disappear without user action [NN-WAIT]. COGA says limit interruptions [W3-COGA], and Carbon says use modals sparingly [CB-NOTE]                                                        |
| Relative or absolute default   | Primer and Cloudscape default to relative [PR-RT][CS-TS]. GitLab defaults to absolute and requires it for audit and legal records [GL-DT]                                                                                                            |
| Clickable step indicators      | Atlassian makes visited steps clickable [AT-PT]. USWDS says "not … navigation of its own" [US-STEP]. Carbon's is non-interactive by default [CB-PI]                                                                                                  |
| One thing per page             | Public GOV.UK forms start with one thing per page (r2 GV4). The same manual allows exceptions for staff tools when backed by research [GV-GOVUSERS]                                                                                                  |
| Error statuses                 | GOV.UK: "avoid tasks having an error status" [GV-CMT]. Job APIs and products expose `failure`, FAILED and ERROR as first-class states [GH-RUNS][SH-BULK][VC-STATE]                                                                                   |
| Duplicate entry points         | NN/g warns against duplicates [NN-DUP]. HubSpot runs a hub and in-context Import buttons side by side (r2 H1). NN/g's article covers one page, so this conflict may only be apparent                                                                 |
| Push and pull redundancy       | NN/g says offer both, but avoid duplicate alerts [NN-STAT]. A shared Tasks Hub plus notifications risks exactly that, and only Linear documents a way to suppress it [LN-NOTIF]                                                                      |
| Resumable upload thresholds    | Supabase from about 6 MB [SB-TUS]. S3 from 100 MB [S3-MPU]                                                                                                                                                                                           |
| Undo windows                   | Pipedrive 48 h [PD-IMP], Zoho 30 days and added records only [ZO-HIST]. HubSpot can't reverse updates [HS-HIST]                                                                                                                                      |

---

## Sources

All accessed 2026-11-03 to 2026-11-04. Each entry gives the label, then the date where shown.

**NN/g**

- [NN-DUP] https://www.nngroup.com/articles/duplicate-links/ (VV, Loranger, 13 Mar 2016)
- [NN-FD] https://www.nngroup.com/articles/navigation-ia-tests/ (VV, Cardello, 6 Jul 2014, reviewed 9 Sep 2019)
- [NN-LOC] https://www.nngroup.com/articles/local-navigation/ (VV, Laubheimer, 4 Jul 2021)
- [NN-TABS] https://www.nngroup.com/articles/tabs-used-right/ (VV, Sunwall, 2 Aug 2024)
- [NN-MENU] https://www.nngroup.com/articles/menu-design/ (VV, Laubheimer, 7 Jun 2024)
- [NN-CAT] https://www.nngroup.com/articles/category-names-suck/ (VV, Loranger and Dykes, 15 Dec 2013, reviewed 11 Oct 2024)
- [NN-SCENT] https://www.nngroup.com/articles/information-scent/ and https://www.nngroup.com/articles/fixing-bad-intranet-navigation/ (S)
- [NN-BTN] https://www.nngroup.com/articles/button-states-communicate-interaction/ (VV, Gordon, 25 Apr 2025)
- [NN-DISV] https://www.nngroup.com/videos/why-disabled-buttons-hurt-ux-and-how-to-fix-them/ (S)
- [NN-STAT] https://www.nngroup.com/articles/status-tracker-progress-update/ (VV, Rosala, 3 Feb 2019)
- [NN-WAIT] https://www.nngroup.com/articles/designing-for-waits-and-interruptions/ (VV, Kaplan, 5 Sep 2021)
- [NN-PROG] https://www.nngroup.com/articles/progress-indicators/ (VV, Sherwin, 26 Oct 2014)
- [NN-IVN] https://www.nngroup.com/articles/indicators-validations-notifications/ (VV, Flaherty; the fetcher reported 17 Jan 2024)
- [NN-WIZ] https://www.nngroup.com/articles/wizards/ (VV, Budiu, 25 Jun 2017)
- [NN-TBL] https://www.nngroup.com/articles/data-tables/ (VV, Laubheimer, 3 Apr 2022)
- [NN-INF] https://www.nngroup.com/articles/infinite-scrolling-tips/ (VV, Neusesser, 4 Sep 2022)

**Design systems**

- [CB-DIS] https://carbondesignsystem.com/patterns/disabled-states/ (VV)
- [CB-LOAD] https://carbondesignsystem.com/patterns/loading-pattern/ (VV)
- [CB-PBAR] https://carbondesignsystem.com/components/progress-bar/usage/ (VV)
- [CB-NOTE] https://carbondesignsystem.com/patterns/notification-pattern/ (VV)
- [CB-EMPTY] https://carbondesignsystem.com/patterns/empty-states-pattern/ (VV)
- [CB-TBL] https://carbondesignsystem.com/components/data-table/usage/ (VV)
- [CB-PI] https://carbondesignsystem.com/components/progress-indicator/usage/ (VV)
- [PR-NAV] https://primer.style/product/ui-patterns/navigation/ (VV)
- [PR-BTN] https://primer.style/product/components/button/guidelines/ (VV)
- [PR-MSG] https://primer.style/product/ui-patterns/notification-messaging/ (VV)
- [PR-TOAST] https://primer.style/accessibility/toasts/ (VV)
- [PR-RT] https://primer.style/product/components/relative-time/guidelines/ and https://primer.style/components/relative-time (VV)
- [AT-FLAG] https://atlassian.design/components/flag/usage (VV)
- [AT-PT] https://atlassian.design/components/progress-tracker/usage (VV)
- [AT-FBTN] https://developer.atlassian.com/platform/forge/ui-kit/components/button/ (VV)
- [AT-IE] https://atlassian.design/patterns/inline-edit (S)
- [PO-TOAST] https://shopify.dev/docs/api/app-home/apis/user-interface-and-interactions/toast-api (VV) and https://shopify.github.io/polaris-react-archive/components/internal-only/toast (S, archived)
- [PO-PBAR] https://polaris-react.shopify.com/components/feedback-indicators/progress-bar (S; Polaris React archived)
- [PO-SG] https://shopify.dev/docs/api/app-home/patterns/compositions/setup-guide (VV)
- [PO-ONB] https://shopify.dev/docs/apps/design/user-experience/onboarding (VV)
- [CS-DIS] https://cloudscape.design/patterns/general/disabled-and-read-only-states/ (VV)
- [CS-TS] https://cloudscape.design/patterns/general/timestamps/ (VV)
- [GL-DT] https://design.gitlab.com/content/date-and-time (VV)
- [GL-ISS] https://gitlab.com/gitlab-org/design.gitlab.com/issues/135 (S)
- [EM-PERM] https://designsystem.emarsys.net/patterns/permission-handling-guidelines (S)
- [US-SN] https://designsystem.digital.gov/components/side-navigation/ (VP)
- [US-STEP] https://designsystem.digital.gov/components/step-indicator/ (VP)
- [BU-TOAST] https://base-ui.com/react/components/toast (VV)
- [BU-PROG] https://base-ui.com/react/components/progress (VV)

**GOV.UK and UK government**

- [GV-TL] https://design-system.service.gov.uk/components/task-list/ (VP)
- [GV-CMT] https://design-system.service.gov.uk/patterns/complete-multiple-tasks/ (VP)
- [GV-CA] https://design-system.service.gov.uk/patterns/check-answers/ (VP)
- [GV-GOVUSERS] https://www.gov.uk/service-manual/design/services-for-government-users (VP, published 11 Jan 2018)
- [GV-FU] https://design-system.service.gov.uk/components/file-upload/ (VP; changes Mar 2025 to Jul 2026)
- [GV-NAV] https://design-system.service.gov.uk/patterns/navigate-a-service/ (VP, introduced Aug 2024)
- [GV-PROB] https://design-system.service.gov.uk/patterns/problem-with-the-service-pages/ (VP)
- [GV-BACK] https://design-system.service.gov.uk/components/back-link/ (VP)
- [MOJ-SUB] https://design-patterns.service.justice.gov.uk/components/sub-navigation/ (VP)
- [DFE-NOACC] https://design-histories.education.gov.uk/connect-families-to-support/designing-no-access (VP, 30 May 2023)
- [DWP-COLL] https://dwpdigital.blog.gov.uk/2018/03/13/eight-things-ive-learnt-from-designing-services-for-colleagues (S)
- [CA-WAY] https://blog.tbs.alpha.canada.ca/2022/12/21/wayfinding-research-project.html (S)

**W3C and WAI**

- [W3-257] https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html (VP)
- [W3-334] https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html (VP)
- [W3-221] https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html (VP)
- [W3-337] https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html (VP)
- [W3-258] https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html (VP)
- [W3-338] https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html (VP)
- [W3-333] https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html (VP)
- [W3-413] https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html (VP)
- [W3-1410] https://www.w3.org/WAI/WCAG22/Understanding/reflow.html (VP)
- [W3-COGA] https://www.w3.org/TR/coga-usable/ (VP, Working Group Note 29 Apr 2021)
- [W3-MPF] https://www.w3.org/WAI/tutorials/forms/multi-page/ (VP)
- [APG-GRID] https://www.w3.org/WAI/ARIA/apg/patterns/grid/ (VP)
- [APG-TBL] https://www.w3.org/WAI/ARIA/apg/patterns/table/ (VP)
- [AR-GRID] https://adrianroselli.com/2023/11/dont-turn-a-table-into-an-aria-grid-just-for-a-clickable-row.html (VV, 2 Nov 2023, updated 7 Oct 2026)
- [A11YSUP] https://a11ysupport.io/tech/aria/aria-rowcount_attribute (S) and https://github.com/adobe/spectrum-web-components/issues/3393 (S)
- [WAI-IG-DEL] https://lists.w3.org/Archives/Public/w3c-wai-ig/2020JanMar/0095.html (S, 2020)
- [DEQUE-DEL] https://docs.deque.com/issue-help/1.0.0/en/semantic-del-ins-plus-text/ (S)

**Products**

- [GH-404] https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api (VV)
- [GH-VIEW] https://docs.github.com/en/actions/how-tos/monitor-workflows/view-workflow-run-history (VV)
- [GH-RERUN] https://docs.github.com/en/enterprise-cloud@latest/actions/how-tos/managing-workflow-runs-and-deployments/managing-workflow-runs/re-running-workflows-and-jobs (S)
- [GH-CANCEL] https://docs.github.com/en/actions/how-tos/manage-workflow-runs/cancel-a-workflow-run (VV)
- [GH-CREF] https://docs.github.com/en/actions/reference/workflow-cancellation-reference (VV)
- [GH-RUNS] https://docs.github.com/en/rest/actions/workflow-runs (VV)
- [GH-NOTIF] https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications (VV)
- [GH-NCONF] https://docs.github.com/en/enterprise-server@3.17/subscriptions-and-notifications/get-started/configuring-notifications (S)
- [GH-ACTN] https://docs.github.com/en/enterprise-server@3.21/subscriptions-and-notifications/how-tos/managing-github-actions-notifications (S)
- [VC-DEP] https://vercel.com/docs/deployments (VV, last_updated 2026-09-03; no state list)
- [VC-STATE] https://docs.sim.ai/tools/vercel and https://directus.io/docs/guides/integrations/vercel/deployments (S)
- [SH-BULK] https://shopify.dev/docs/api/usage/bulk-operations/queries (VV)
- [SF-BULK] https://developer.salesforce.com/docs/platform/api-asynch/guide/bulk-api-2-job-states.md (S)
- [SF-MOB] https://plauti.com/guides/mastering-salesforce-data/salesforce-data-loader-data-import-wizard (S)
- [LN-IMP] https://linear.app/docs/import-issues (VV)
- [LN-INBOX] https://linear.app/docs/inbox (VV)
- [LN-NOTIF] https://linear.app/docs/notifications (VV)
- [NO-IMP] https://www.notion.com/help/import-data-into-notion (VV)
- [HS-IMP] https://knowledge.hubspot.com/import-and-export/import-objects (VV)
- [HS-HIST] https://knowledge.hubspot.com/import-and-export/view-and-analyze-previous-imports (VV)
- [HS-ERR] https://knowledge.hubspot.com/import-and-export/troubleshoot-import-errors (VV)
- [HS-MOB] https://knowledge.hubspot.com/import-and-export/import-contacts-on-the-hubspot-mobile-app (VV, updated 13 May 2026)
- [HS-DQ] https://knowledge.hubspot.com/data-management/use-data-quality-tools (S; snippet says updated 20 Jul 2026)
- [BL-IMP] https://help.bloomerang.com/en/articles/12632468-imports-work-with-the-imports-list (VV)
- [BL-DHH] https://help.bloomerang.com/en/articles/15793806 (VV, "updated over 3 weeks ago")
- [BL-COLL] https://help.bloomerang.com/en/collections/16316347-data-tools (S)
- [ZO-HIST] https://help.zoho.com/portal/en/kb/crm/data-administration/import-data/articles/view-import-history (VV)
- [PD-IMP] https://support.pipedrive.com/en/article/importing-data-into-pipedrive-with-spreadsheets (VV, updated 19 Oct 2026)
- [BB-IMP] https://community.blackbaud.com/discussion/comment/310217 (S)
- [NE-ACAD] https://academy.neonone.com/importing-your-account-data-v2 (S)
- [ZD-HIST] https://support.zendesk.com/hc/en-us/articles/5789034291738-Viewing-your-import-history (VV)
- [FF-REV] https://support.flatfile.com/articles/2093153444-reviewing-data (S)
- [MAG] https://help.magentrix.com/wikis/help/data-import-history-and-troubleshooting (S)
- [SB-TUS] https://supabase.com/docs/guides/storage/uploads/resumable-uploads (VV)
- [TUS] https://tus.io/protocols/resumable-upload (VP-like open protocol, tus 1.0.0, 2016-03-25)
- [S3-MPU] https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html (VV)
- [UPPY-GR] https://uppy.io/docs/golden-retriever/ (VV)
- [GT-SPOT] https://gnan.ece.gatech.edu/archive/spottasks_hotmobile_18.pdf (S, 2018)
- [TZ-FORM] https://help.formaloo.com/en/articles/13819700-how-to-set-a-workspace-timezone (S)
- [TZ-THREAT] https://docs.threataware.com/settings/timezone (S)

**Local**

- [NEXT-A11Y] `.next-docs/03-architecture/accessibility.mdx` lines 8–14 (L; committed Next.js docs mirror)
- r1 S14: `research/q19-r1-repo-data-tools.md` §1, one heavy job per ministry (L)
- r2 citations (H1, SF1, SF2, VI1, GV4, GV5, §2, §5) refer to `research/q19-r2-external-data-tools.md`
