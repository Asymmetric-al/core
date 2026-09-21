> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Phase 25 R02 — Opening Ministry Updates

> **Answered 7 September 2026:** Conrad selected A: start reading, with optional ministry filtering. This document preserves the pre-answer question and alternatives. The [R02 decision and full adversarial review](phase25-r02-adversarial-review.md) supersedes its pending/recommended status.

Research/question brief, 6 September 2026. **R02 is not ratified.** This is grooming evidence, not a PRD, specification, implementation plan or ticket.

## What is already settled

Conrad explicitly ratified strengthened R01: self-service first, easy/effortless/clear/quiet interaction, beautiful exact Maia/Base UI, prominent Ministry Updates, and an organization-shareable link to the reader's own authorized Updates destination. Ease removes avoidable effort and noise; necessary identity, authorization and consequential-action protection remains understandable and proportional.

The new question concerns only the first view inside Ministry Updates. It does not reopen the donor home, public/private audience, recipient permissions, representation, payment or communication consent. Phase 22 continues to own Update identity, release, ordering and projection; the relevant relationship/access owners decide which sources and history the current reader may see. A ministry filter narrows presentation and grants nothing.

## Brief adversarial check of the ratification

### What could go wrong with this answer?

An absolute promise of effortlessness could be misused to hide failures or remove necessary checks. Remove avoidable effort; show the minimum clear safe action when one is needed.

### What hidden assumptions are we making?

Fewest clicks does not always mean least effort. Labels, context, understandable consequences and recovery matter. Actual donor usability remains untested.

### How does this affect the whole product?

No owner or audience changes. Shared services do the complex work; donors receive a simple, source-truthful experience. Staff do not gain a parallel portal configuration or task system.

### How does this affect the end-user experience?

Stable navigation, relevant actions, visible Updates and recovery without lost context remain the bar. Routine success stays quiet; important failure remains understandable.

### Does this follow modern best practices?

Yes: familiar language, visible choices, progressive disclosure, minimal irrelevant information and proportional feedback. These are design principles, not measured Asym outcomes.

### Does this fit Asym’s existing repo and product direction?

Yes: exact Maia/Base UI and existing source/auth/content owners remain intact. The already-recorded implementation gaps still require future correction and real proof.

### Should we adjust the recommendation?

No further scope change. R01 is ratified with its reviewed safeguards and explicit ease/clarity/noise requirement. R02 remains a separate decision.

## Real-world decision

Illustrative scenario: Sarah is authorized to read updates from two missionaries and one project. One publishes often; another publishes occasionally. She opens the organization's Ministry Updates link during a short break. We need to decide whether she sees updates immediately, chooses a ministry, or sees a grouped overview first. This example is not a claim about measured ministry behavior.

<!-- prettier-ignore -->
| Option | What Sarah sees first | Benefit | Cost / risk |
| --- | --- | --- | --- |
| **A. Updates together, optional ministry filter — recommended** | One reading list containing her permitted updates, clearly labeled by ministry and date; a simple control focuses on one ministry. | Read immediately and catch up across ministries in one visit. No mandatory setup or selection. | Frequent posters occupy more space. Clear source labels, concise previews and filtering are important. |
| **B. Choose a ministry first** | A clear list of permitted ministries, then that ministry's updates after selection. | Focused and familiar when visiting for one known ministry. | Adds a step for every general catch-up visit and makes checking several ministries repetitive. |
| **C. Grouped ministry overview** | A compact section per permitted ministry, showing its latest available update with a route to more. | Gives a broad view without one frequent publisher filling the first screen. | The overview is a selection, not complete history; older latest updates can sit next to new ones. More grouping/continuation behavior to explain and maintain. |

All options reuse the same owner-authorized content and current safety checks. None requires missionaries to create a second post, staff to curate a new dashboard, or a new feed store. Option C is an evaluated design alternative, not a verified industry-standard ministry layout.

## Research and evidence

<!-- prettier-ignore -->
| Source, publisher and date | Observed evidence | Classification / limits |
| --- | --- | --- |
| [Find creator posts](https://support.patreon.com/hc/en-us/articles/360039998431-How-to-find-a-creator-s-posts-and-Quips), Patreon, updated 6 July 2026 | Combined reading plus direct creator access and creator-level filters. | **Useful precedent:** read across sources, then narrow. Paid membership semantics do not determine Asym rights. |
| [Network for members](https://support.patreon.com/hc/en-us/articles/45256719857293-How-Patreon-s-network-works-for-members), Patreon, updated 3 August 2026 | Separates a Memberships stream without discovery recommendations from its discovery feed; provides quick creator navigation. | **Useful precedent:** relevant existing sources can remain separate from discovery. Do not import creator/fan identity merging or a recommendation network. |
| [Getting started](https://docs.feedly.com/article/523-getting-started-with-feedly), Feedly, updated 20 October 2025 | Several sources can appear together in one reading feed. | **Useful precedent:** a combined reading place avoids compulsory source-by-source visits. Team-sharing, AI and subscription models are not adopted. |
| [Sorting](https://docs.feedly.com/article/260-how-can-i-sort-by-popularity), Feedly, updated 10 December 2025 | Distinguishes Latest/Oldest from Top Stories/Most Shared. | **Useful precedent:** predictable chronology is different from popularity selection. Phase 22 retains Asym ordering authority; exact timestamps/cursors are not decided by this question. |
| [Today composition](https://docs.feedly.com/article/530-how-are-the-articles-in-the-today-view-compiled), Feedly, updated 10 December 2025 | A limited selected digest across feeds rather than a complete list. | **Useful precedent** for a labeled overview; **Conflict with first principles if copied** as unexplained popularity/engagement-based ministry importance. No evidence establishes grouped-by-ministry as Asym's best default. |
| [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), Nielsen Norman Group, last reviewed 30 January 2024 | Familiar language, visible options, user control and restrained relevant information reduce avoidable effort. | **Durable pattern** as general design guidance; does not prove a particular layout or conversion result. The search also returned an explicit April Fools' article; that was rejected as guidance. |

All listed pages were opened on 6 September 2026. No provider account, user interaction, accessibility, or usability experiment was run. The recommendation is an inference from these precedents, R01's goal, and the repo's authority constraints.

## Repository fit and remaining details

Live develop and Phase 22 heads were rechecked unchanged at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` and `70c50e8c97556c43be5543332fb0993b468b90ab`. [ADR-0128](https://github.com/Asymmetric-al/core/blob/70c50e8c97556c43be5543332fb0993b468b90ab/docs/adr/0128-canonical-ministry-update-audience-release-projections.md) preserves source-owned audience release and current membership/safety at every egress; gifts, follows and household relationships cannot infer access. Phase 25's personal reading list is not a tenant-wide raw-post feed.

Current feed/page-client.tsx has media-type filters and local Saved state, but it invokes the feed hook without a ministry selection. It does not implement the proposed qualified filter or prove safe audience composition. Existing UI is implementation evidence only. R01's auth-return, host, mobile-label and feed-safety gaps remain recorded.

The recommended A behavior is an immediate, calm reading list with explicit source/date and an optional current ministry selection. It need not add a ranking algorithm, mandatory preferences setup, new social network, automatic notifications, unread-pressure system, or an additional ministry directory product. Exact label, responsive control, preview size, paging, return position and safe filtered URL behavior should be designed/proved after the entry decision, without changing source ownership.

Test the eventual choice with one/several/many permitted ministries, uneven publication frequency, no updates, long/localized names, keyboard/screen reader, narrow mobile view, back navigation, slow pages, unavailable sources and revoked access. Measure whether readers can catch up and find one ministry without coaching. No success percentage or reading-frequency assumption is invented here.

## Recommended question

**When a donor opens Ministry Updates, which starting experience should we adopt: A, one combined reading list with an optional ministry filter; B, choose a ministry first; or C, a grouped overview by ministry?**

Recommendation: A. It serves the generic organization-shared link and the ordinary catch-up visit immediately, while retaining deliberate ministry-focused reading without forcing it on everyone. Frequent-publisher dominance is the main honest tradeoff; start with clear filtering and source-owned order instead of adding an unproved balancing algorithm.
