# Phase 24 D41 — Current Direct Source with Historical Continuity Provenance

**Decision date:** 2026-08-29  
**Founder direction:** Option 1 — after every group-derived D38 path ends,
present the current source plainly as **Direct grant** in administration or
**Granted directly to you** in My Access, and retain **Added for continuity**
only in expanded provenance and durable history.  
**Scope:** Current-source versus historical-origin ownership, presentation,
privacy, caching, retention, export/reporting, and lifecycle after a D40-origin
direct source becomes the only current D38 path.  
**Method:** /grill-with-docs, repository/governing-document audit, current
primary-source research, Core UI/accessibility review, and a ruthless
22-category adversarial pass.  
**Verification note:** Per founder direction, broad formatting, local-link,
skill-parity, strict OpenSpec, lint, typecheck, unit, build, and git diff
checks remain deferred until the end of the Grill session. Only focused
structural/count checks are permitted here.

## Final disposition

**Accept with required amendments.**

Option 1 is the strongest permanent presentation. It separates current access
truth from historical creation context, keeps the ordinary experience quiet,
and preserves governance evidence without inventing a conversion state.

The phrase is incomplete unless Core also guarantees:

- **Direct grant** / **Granted directly to you** derives only from the canonical
  current direct grant and current EffectiveAccess;
- **Added for continuity** derives only from immutable D40 basis/audit;
- ending the final group path performs no write/conversion on the direct grant;
- stale/unavailable history cannot block, hide, or mislabel current access;
- a returning group reappears as a current path without changing history;
- rename/archive/delete cannot rewrite or break event-time provenance;
- operational search/export uses current source=direct, while historical-origin
  filtering is privileged audit only;
- viewer-specific history privacy remains unresolved until D42; and
- D41 adds no badge state, conversion worker, timer, notification, task,
  report score, or Inngest authority.

These amendments complete rather than replace Option 1.

## Exact corrected decision

> When the final current group-derived D38 path ends and the D40-origin direct
> grant remains current, Core presents the current source plainly as:
>
> **People & access:** **Direct grant · [current direct end condition]**  
> **My Access:** **Granted directly to you · [current direct end condition]**
>
> The ordinary capability row, holder result, authorization check, operational
> search classification, and current-access export treat it exactly like every
> other current direct D38 source.
>
> Authorized expanded **Why this person has access** in administration,
> **Why you have access** in My Access, and durable access history retain the
> D40 origin:
>
> **Added for continuity · [localized instant]**  
> \*\*This direct grant was added while access also came through [authorized
>
> > historical group summary]. The last group-derived path ended on [localized
> >
> > > > instant].\*\*
>
> Current source and historical origin are different authoritative facts.
> Current source comes from the current Phase 12 direct grant, exact Active
> Tenant Assignment, floor, delegation, expiry/recertification, and current
> EffectiveAccess at the Tenant epoch. Historical origin comes only from the
> immutable D40 overlap creation basis and append-only group/grant history.
>
> No group-end event mutates, converts, reclassifies, retags, renews, or
> reissues the direct grant. The group mutation advances the normal
> authorization epoch because one source ended; D41 presentation is derived on
> the next current read. Core stores no post-overlap Boolean, continuity
> status, conversion event, or new source kind.
>
> If group paths later return, the current source list again shows **Granted
> directly** and **Through [current group]**. Earlier continuity origin remains
> expanded history only. Return never deletes, rewrites, reopens, or promotes
> the basis.
>
> Group rename does not rewrite event-time provenance. Authorized history
> retains stable group identity and event-time label and may show a permitted
> current label as **formerly [old], now [current]**. An archived/terminal group
> is non-interactive historical text. Ordinary deletion cannot erase the
> retained basis/history.
>
> If the direct grant expires, is revoked, becomes delegation-inert, fails
> Phase 12 risk-based recertification, or is denied by assignment/floor, it is
> no longer a current effective source. It remains authorized history with its
> terminal cause. A later direct successor has its own creation provenance and
> never inherits D40 origin automatically.
>
> If history projection is stale, unavailable, rebuilding, or unsupported,
> current source truth is still read from canonical Phase 12 state. Core may
> say **Access history is temporarily unavailable. Current access is not
> affected.** It never derives authority from history, waits for Inngest, or
> displays a stale continuity badge.
>
> Current caches bind Tenant, exact Active Tenant Assignment, capability,
> governance epoch, viewer authorization class/purpose, and provenance revision
> where separate. Cross-Tenant/cross-viewer reuse is forbidden. Existing epoch
> invalidation covers group end/return; D41 adds no second invalidation system.
>
> Operational People & access search, current-holder reports, and current-
> access exports classify the source as direct. Privileged governance/audit
> surfaces may filter by D40 creation basis. Website, donor, missionary, Tasks
> Hub, ordinary staff analytics, and performance reporting receive no
> continuity-origin field.
>
> Viewer-specific access to historical group identity, label, basis, reason,
> and actors now follows D42's least-privilege purpose matrix; no viewer gains
> more history than their current projection authorizes.
>
> Dates use authoritative UTC instants and viewer-localized date/time/zone.
> History order uses authoritative sequence/head plus instant, not localized
> string order.
>
> Presentation is semantic text in an accessible disclosure; meaning never
> depends on badge, icon, color, hover, truncation, or animation. It supports
> keyboard/screen reader, 44-pixel targets, 320-pixel/400-percent reflow,
> forced colors, reduced motion, RTL/CJK/international labels, and low-
> bandwidth history failure.
>
> D41 adds no authorization mutation, direct-grant update, D37 effect, task,
> notification, unread state, email, reminder, recertification campaign,
> report score, conversion worker, or Inngest authority.

## Evidence classifications and repository facts

- **Repository fact:** Phase 12 owns current grants, EffectiveAccess, epoch,
  audit, RLS, risk-based recertification, and current explanation.
- **Repository fact:** [D39](./phase-24-d39-direct-and-governed-group-capability-assignment-adversarial-review.md)
  makes direct/group sources independent and explains every current path.
- **Repository fact:** [D40](./phase-24-d40-deliberate-continuity-direct-grant-adversarial-review.md)
  makes the created source ordinary and stores overlap basis as immutable,
  non-authoritative audit provenance.
- **Repository fact:** [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)
  records the one EffectiveAccess model and no source precedence.
- **Repository fact:** current Teams & Users is a seed-backed prototype and is
  not the permanent access read/write model.
- **Research artifact:** [D41 primary research](./phase-24-d41-current-direct-source-historical-provenance-primary-research.md)
  separates current official evidence, repository facts, inferences, product
  judgments, assumptions, and evidence gaps for this decision.
- **Verified external fact:** [Entra role assignment views](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/view-assignments)
  distinguish current direct and group-derived paths while audit logs preserve
  changes over time.
- **Verified external fact:** [Google Policy Analyzer](https://docs.cloud.google.com/policy-intelligence/docs/policy-analyzer-overview)
  reports bindings and documents best-effort freshness; recent updates may be
  absent.
- **Verified external fact:** [Salesforce User Access Summary](https://help.salesforce.com/s/articleView?id=users_access_summary.htm&language=en_US)
  consolidates permissions, exposes each permission's source through the
  row-level **Access Granted By** action, and warns assignment updates may not
  display immediately.
- **Verified external fact:** [Microsoft My Access](https://learn.microsoft.com/en-us/entra/id-governance/my-access-portal-overview)
  separates active access from request history.
- **Verified external fact:** [Google IAM policy history](https://docs.cloud.google.com/iam/docs/review-iam-policy-history)
  separates policy-change history from current Policy Analyzer relationships.
- **Verified external fact:** [GitHub repository access management](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-teams-and-people-with-access-to-your-repository)
  provides a consolidated current access overview and an on-demand action for
  the source of mixed access.
- **Verified external fact:** [AWS IAM audit guidance](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-audit-guide.html)
  requires reviewers to understand all applicable policy sources and remove
  unnecessary access.
- **Verified comparable-product fact:** [Blackbaud CRM Cloud Portal](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/backups/content/cloud-portal-control-panel-crm.html)
  separates the current user-management list from User History audit.
- **Verified accessibility fact:** [W3C's disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
  requires an operable button and programmatic expanded state; [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
  requires content to remain usable at the equivalent of 320 CSS pixels.
- **Product judgment:** current direct source is primary; historical origin is
  subordinate, discoverable governance context.
- **Reasonable inference:** because external access summaries/analyzers may lag,
  Core must never make optional D41 history an authorization or current-source
  dependency.
- **Resolved downstream:** D42 now defines the exact viewer/purpose tiers for
  historical group origin and governance reason.

## Current, intended, and permanent behavior

| Concern           | Current repository              | Intended governing behavior                     | Best permanent D41 path                                                                                 |
| ----------------- | ------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Current source    | No runtime D41.                 | D39 current direct/group provenance.            | Canonical current direct grant/EffectiveAccess says Direct grant or Granted directly to you by surface. |
| Historical origin | D40 basis not implemented.      | Immutable non-authoritative overlap basis.      | Expanded authorized Added for continuity history only.                                                  |
| Group end         | No runtime.                     | Source-aware epoch/revocation.                  | No direct-grant mutation; derive new presentation at current epoch.                                     |
| Group return      | No runtime.                     | Current sources independently resolve.          | Show direct + current group; retain origin in history.                                                  |
| Projection lag    | Seed prototype has no contract. | Current authorization is synchronous/canonical. | Current view survives optional history failure.                                                         |
| Search/export     | No D41 surface.                 | Purpose-scoped access projections.              | Operational=direct; privileged audit may filter creation origin.                                        |
| Recertification   | Phase 12 risk-based.            | One central review system.                      | Inherit Phase 12; no D41 timer/campaign.                                                                |

## Strongest plausible alternative

Show only the current **Direct grant** / **Granted directly to you** in ordinary
product surfaces and keep D40 origin solely in a specialized governance audit,
with no person-detail or My Access provenance disclosure.

This is simpler and minimizes disclosure more aggressively. It is also safer
than a prominent badge or conversion state. It is not the best permanent D41
answer because authorized staff would need to leave the person/access context
to understand why a sticky direct source exists, ordinary support could drift
toward screenshots or direct database investigation, and the subject could not
identify an unexpected continuity grant. Option 1 is superior only if D42
enforces viewer/purpose minimization and history remains optional,
non-authoritative, lazy, and independently recoverable. If those safeguards
cannot be proved, Core MUST fall back to governance-only history rather than
expose broad provenance.

## UX and UI contract

### Current summary after all group paths end

```text
Apply Website recovery settings to current work

Direct grant · Ends 15 October 2026

Why this person has access
```

The current source has no continuity/exception badge, warning color, or altered
action. Direct revoke/renew follows the ordinary D38/D39 flow.

### Expanded provenance

```text
Why this person has access

Current source
Direct grant · Ends 15 October 2026

History
Added for continuity · 29 August 2026
This direct grant was added while access also came through Website Operations.

Website Operations access ended 1 September 2026.
```

Event-time labels remain historical. A permitted rename can read:

```text
Website Operations (now Digital Ministry Operations)
```

An archived group is plain non-clickable text. There is no broken link or
placeholder ID in user-facing history.

### Group path returns

```text
Current sources
Direct grant · Ends 15 October 2026
Through Website Operations · Until removed

History
Added for continuity · 29 August 2026
```

The historical origin remains expanded only; group return does not trigger a
conversion, cleanup, new badge, or rewrite.

### History unavailable

```text
Direct grant · Ends 15 October 2026

Access history is temporarily unavailable.
Current access is not affected.
```

The UI never hides the capability, disables ordinary direct-grant actions, or
shows stale origin as current because optional history failed.

### Accessibility and interaction

- Use People & access and My Access, not the seed Team Sheet.
- Use semantic heading/current-source list/details/history chronology.
- Disclosure is labeled, keyboard operable, and screen-reader complete.
- Important controls remain at least 44-by-44 CSS pixels.
- Focus is visible/restored and loading/error/status is programmatic.
- Current source appears before history in DOM and visual order.
- 320-pixel/400-percent reflow has no horizontal access matrix.
- Forced colors/reduced motion preserve all meaning.
- Long/CJK/RTL/bidirectional names and labels wrap without identity ambiguity.
- Localized date/time/zone never determines event order.
- Low-bandwidth failure affects history only and supports safe retry.

## Domain model, source of truth, and invariants

### Ownership

| Fact                    | Authority                             | Consumers                         | Never authority                |
| ----------------------- | ------------------------------------- | --------------------------------- | ------------------------------ |
| Current direct grant    | Phase 12 grant head                   | PDP, current UI, current export   | D40 basis, history cache       |
| Current EffectiveAccess | `resolveProjection` at current epoch  | holder/action/current explanation | current-source badge/index     |
| Continuity origin       | Immutable D40 basis + audit           | expanded provenance/history       | authorization, expiry, cleanup |
| Last group-path end     | Phase 12 group/member terminal events | history renderer                  | direct grant mutation          |
| Viewer disclosure       | Phase 12 purpose/viewer policy; D42   | My Access, governance UI          | raw table grant                |
| Search/export index     | Derived purpose-scoped projection     | authorized consumers              | current authority              |

### Invariants

1. Current source=direct iff the direct path is current/effective under the
   relevant explanation contract, regardless of creation origin.
2. Added-for-continuity is true only from immutable D40 basis/history.
3. Historical origin never grants, denies, expires, recertifies, prioritizes,
   or cleans up access.
4. Ending the last group path creates no direct-grant update/conversion.
5. Existing group mutation epoch invalidates current source projections.
6. One current direct source remains one holder/capability.
7. Returning groups reappear independently.
8. Group return never changes D40 basis.
9. Group rename never rewrites event-time identity/label.
10. Archived/terminal group history remains durable and non-interactive.
11. Ordinary deletion cannot erase basis or governing history.
12. Direct terminal state removes current presentation and remains history.
13. Direct successor gets its own creation provenance.
14. Phase 12 recertification remains one source of current validity.
15. History projection may fail without changing current source/authority.
16. Stale history cannot overwrite newer current epoch state.
17. Equivalent authoritative heads render deterministically/idempotently.
18. Current cache includes Tenant/assignment/capability/epoch/viewer purpose.
19. Cross-viewer/Tenant cache sharing is forbidden.
20. Operational search source type is direct.
21. Historical-origin search is privileged audit only.
22. Current export and audit export have different purpose-scoped schemas.
23. Event ordering uses authoritative sequence plus UTC instant.
24. Localization is presentation only.
25. Reason/group history follows D42 viewer policy.
26. Raw basis/audit is never browser-readable.
27. Current list queries never scan/load history per person.
28. Expanded history is lazy, indexed, authorized, and paginated.
29. No task/notification/report score consumes D41 origin.
30. Unknown basis/history version fails history safely, never current access.

## Persistence, RLS, caches, search, and export

D41 adds no authorization/write table. It consumes current Phase 12 grant/PDP
state and immutable D40 basis/audit.

- current direct projection keys Tenant, assignment, capability, epoch, source
  state/end condition, and viewer purpose;
- historical provenance keys stable direct grant/basis/event identities,
  version, event-time group label, sequence, and UTC instant;
- no current `continuity_status`/`exception` column or conversion event exists;
- basis/history has restrictive deletion and lawful retention/anonymization;
- purpose-built current/history views/RPCs `ENABLE`/`FORCE RLS` or preserve the
  underlying forced-RLS boundary;
- browser has no raw basis/audit SELECT;
- security-definer functions pin `search_path` and prove viewer/Tenant/purpose;
- table-owner/service/`BYPASSRLS`/worker/support/export/AI paths preserve parity;
- current caches reject old epoch and cross-viewer reuse;
- history caches include provenance revision/version and never authorize;
- list/card reads use indexed current source without history N+1;
- expanded history loads separately and may degrade without hiding current;
- operational search/report indexes direct source only;
- privileged audit search may index D40 creation origin with access logging;
- current export binds authoritative snapshot epoch/instant;
- audit export includes basis/reason only for an authorized governance purpose;
- stale/partial exports fail or state exact snapshot rather than mixing epochs.

## Normative requirements

1. **D41-R1 — Plain current source.** After all group paths end, current
   effective presentation says **Direct grant** in administration or **Granted
   directly to you** in My Access.
2. **D41-R2 — Expanded historical origin.** D40 origin appears only in
   authorized expanded provenance/history.
3. **D41-R3 — Current/history separation.** Current source and creation origin
   remain type/ownership-distinct facts.
4. **D41-R4 — No conversion mutation.** Group-path end never rewrites,
   reissues, reclassifies, or retags direct grant.
5. **D41-R5 — No prominent badge.** Current summary has no continuity/
   exception status badge.
6. **D41-R6 — Canonical current truth.** Current grant/EffectiveAccess, not
   history projection, determines display.
7. **D41-R7 — Immutable origin.** D40 basis/audit alone owns creation-origin
   history.
8. **D41-R8 — Safe projection failure.** History lag/unavailability cannot
   block, hide, or misstate current source.
9. **D41-R9 — Group return.** Returned group paths reappear as current sources
   without changing origin.
10. **D41-R10 — Rename integrity.** Stable identity/event label survives group
    rename; names never authorize.
11. **D41-R11 — Archive/delete integrity.** Terminal group history remains
    durable/renderable/non-interactive.
12. **D41-R12 — Direct lifecycle truth.** Expired/revoked/inert/denied direct
    source leaves current view and remains history.
13. **D41-R13 — Successor provenance.** New direct successor receives its own
    origin and never inherits D40 basis automatically.
14. **D41-R14 — Phase 12 recertification.** Existing risk-based review owns
    recertification; D41 adds no timer/campaign.
15. **D41-R15 — Viewer authorization.** Historical detail is viewer/purpose
    scoped; D42 resolves final tiers.
16. **D41-R16 — Reason minimization.** Governance reason is absent from
    ordinary current presentation.
17. **D41-R17 — Tenant isolation.** Current/history projections/caches bind
    exact Tenant and Active Tenant Assignment.
18. **D41-R18 — Epoch/provenance cache.** Current source refreshes on existing
    governance epoch/provenance revisions.
19. **D41-R19 — Retained audit.** Basis and later group/direct events remain
    durable under retention.
20. **D41-R20 — Current search semantics.** Operational search treats source
    as direct, not continuity exception.
21. **D41-R21 — Export/report split.** Current-access and privileged audit
    exports expose different purpose-scoped fields.
22. **D41-R22 — No scoring.** Origin never feeds staff/Tenant performance,
    engagement, readiness, risk, or health scoring.
23. **D41-R23 — Temporal correctness.** Event order uses authoritative
    sequence/instant; localization is presentation.
24. **D41-R24 — Accessible disclosure.** Provenance is semantic, responsive,
    keyboard/screen-reader complete.
25. **D41-R25 — Low-bandwidth safety.** Current source remains truthful when
    history fetch fails.
26. **D41-R26 — Set-based performance.** List views do not load audit history;
    expanded history is indexed/lazy.
27. **D41-R27 — RLS/privileged parity.** Current/history projections enforce
    Tenant/viewer rules through every path.
28. **D41-R28 — No local machinery.** No conversion job, notification, task,
    timer, campaign, or Inngest authority.
29. **D41-R29 — Traceability.** Terms/outcomes align through D38–D41, ADR,
    Phase 12, OpenSpec, design, tests, and release.
30. **D41-R30 — Proof gate.** D41 and D42 are recorded; activation waits for
    complete authorization/privacy/cache/a11y/migration evidence.

## Ruthless adversarial review by category

### 1. Problem validity, necessity, and alternatives

**Material concern exists.**

| Failure / why it matters                                                                                                                                 | Severity / likelihood  | Evidence / effect                                                                              | Permanent fix                               | Exact language / AC                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Permanent continuity badge solves no current-access problem and lets history compete with current truth; hiding origin entirely harms explanation/audit. | Medium / High if naive | Entra separates current assignment path from audit history. Option 1 survives but is narrowed. | Plain current source plus expanded history. | “Current summary shows source now; expanded history shows how it originated.” AC001–020. |

### 2. Brittleness

**Material concern exists.**

| Failure / why it matters                                                | Severity / likelihood | Evidence / effect                                      | Permanent fix                                                                    | Exact language / AC                                                                |
| ----------------------------------------------------------------------- | --------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Presentation may depend on a lost/late/replayed last-group-ended event. | High / Medium         | Google/Salesforce document derived access-summary lag. | Derive from current canonical paths plus immutable history; no conversion event. | “At one epoch/heads rendering is deterministic and needs no D41 write.” AC031–040. |

### 3. Technical debt

**Material concern exists.**

| Failure / why it matters                                                                                           | Severity / likelihood | Evidence / effect                            | Permanent fix                                                  | Exact language / AC                                                               |
| ------------------------------------------------------------------------------------------------------------------ | --------------------- | -------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `continuity_status`, conversion worker, duplicated current/history columns, or D41 cache becomes shadow authority. | High / Medium         | D40 basis is deliberately non-authoritative. | One current source model plus immutable history; no new state. | “No post-overlap Boolean, source type, or conversion mutation exists.” AC003–006. |

### 4. Edge cases

**Material concern exists.**

| Failure / why it matters                                                                                                                                         | Severity / likelihood | Evidence / effect               | Permanent fix                                                                        | Exact language / AC                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Group return, several group endings, rename/archive/delete, direct expiry/revoke/recert denial, successor, suspension/rehire, Party merge can contradict labels. | High / High aggregate | Each follows D38–D40 lifecycle. | Recompute current paths; retain independent immutable events; never transfer origin. | “Every current transition derives anew; history never resurrects or moves.” AC021–030. |

### 5. Footguns

**Material concern exists.**

| Failure / why it matters                                                                                                                              | Severity / likelihood | Evidence / effect                                            | Permanent fix                                                                                                         | Exact language / AC                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Continuity exception** may imply temporary or lesser authority; automatic conversion may erase proof; stale history may falsely show current group. | High / High           | Labels drive administrator decisions despite no auth effect. | Use **Direct grant** in administration and **Granted directly to you** in My Access; origin is explicitly historical. | “No prominent badge or current exception status.” AC081–090. |

### 6. Tenant safety

**Material concern exists.**

| Failure / why it matters                                                          | Severity / likelihood | Evidence / effect                      | Permanent fix                                                                  | Exact language / AC                                                            |
| --------------------------------------------------------------------------------- | --------------------- | -------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Historical group IDs/labels/reasons can leak across Tenant hats or shared caches. | Critical / Medium     | D39/D40 exact-assignment/Tenant scope. | Validate Tenant Authorization Context; tenant/viewer cache keys; uniform deny. | “Every current/history read binds one exact Tenant and assignment.” AC041–060. |

### 7. Database, RLS, and authorization safety

**Material concern exists.**

| Failure / why it matters                                                                                     | Severity / likelihood              | Evidence / effect                      | Permanent fix                                                                                   | Exact language / AC                                                                              |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Raw basis/audit browser reads, missing FORCE RLS, owner/service bypass, or unsafe joins leak history/reason. | Critical / High if copied from MVP | PostgreSQL owner/`BYPASSRLS` behavior. | Purpose-built projections/RPCs, forced RLS, no raw grants, pinned functions, privileged parity. | “Raw history has no browser grant; every projection re-proves viewer/Tenant/purpose.” AC051–060. |

### 8. Overengineering

**Material concern exists.**

| Failure / why it matters                                                                                    | Severity / likelihood | Evidence / effect                                                | Permanent fix                                  | Exact language / AC                                                              |
| ----------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------- |
| Conversion saga, status table, notification, timer, or repair worker adds failures with no authority value. | Medium / Medium       | Current presentation is derivable from existing sources/history. | Existing epoch invalidation plus current read. | “Group end causes no D41 mutation or asynchronous dependency.” AC004, AC091–100. |

### 9. UX/UI and user friction

**Material concern exists.**

| Failure / why it matters                                                                       | Severity / likelihood | Evidence / effect                                       | Permanent fix                                                      | Exact language / AC                                                            |
| ---------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Hidden origin impairs trust; prominent origin stigmatizes/noises; history can overload mobile. | High / High           | Option 1 balances current clarity/discoverable context. | One plain current row; accessible Why disclosure; lazy chronology. | “Current source precedes expanded history in visual and DOM order.” AC081–090. |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists.**

| Failure / why it matters                                                                                         | Severity / likelihood | Evidence / effect                                    | Permanent fix                                                                           | Exact language / AC                                                             |
| ---------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Direct grant, EffectiveAccess, D40 basis, history cache, badge, index, and export may each claim classification. | Critical / High       | Current source and origin are distinct domain facts. | Phase 12 current grant/PDP owns current; D40 basis/audit owns origin; all else derives. | “History cannot write or classify current authorization.” AC001–020, AC061–070. |

### 11. Hidden coupling

**Material concern exists.**

| Failure / why it matters                                                                                    | Severity / likelihood | Evidence / effect                              | Permanent fix                                     | Exact language / AC                                                                                        |
| ----------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Group end/return, recertification, D37, Tasks Hub, reporting, or analytics may mutate/relabel direct grant. | High / Medium         | D40 prohibits automatic cleanup/work coupling. | No consumer writes; presentation-only derivation. | “Only governed direct lifecycle changes current source; no D41 consumer event does.” AC021–030, AC091–100. |

### 12. Failure modes

**Material concern exists.**

| Failure / why it matters                                                                             | Severity / likelihood | Evidence / effect                                          | Permanent fix                                                                           | Exact language / AC                                              |
| ---------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| History service fails while direct grant remains valid; UI may hide access or show stale continuity. | High / Medium         | Current authorization must not depend on optional history. | Render canonical current source first; explicit non-blocking history unavailable state. | “History failure cannot block current source/action.” AC031–040. |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists.**

| Failure / why it matters                                                                                              | Severity / likelihood | Evidence / effect                             | Permanent fix                                                                    | Exact language / AC                                                                      |
| --------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Last group end/return races reads; duplicate/out-of-order projection events cause flicker or irreversible conversion. | High / Medium         | No conversion write removes destructive race. | Deterministic render by epoch/heads; discard stale response; idempotent rebuild. | “Older epoch/history result never overwrites newer current state.” AC031–040, AC091–100. |

### 14. Data integrity risks

**Material concern exists.**

| Failure / why it matters                                                                                       | Severity / likelihood | Evidence / effect                             | Permanent fix                                                                           | Exact language / AC                                                                    |
| -------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Hard-deleted basis/group, mutable event label, copied reason, or successor inheriting origin corrupts history. | High / Medium         | D40 requires typed restrictive basis/history. | Stable identity, event-time label, restrictive retention, independent successor origin. | “Terminal successor and renamed/archived group never rewrite prior origin.” AC011–030. |

### 15. Security and privacy risks

**Material concern exists.**

| Failure / why it matters                                                                                | Severity / likelihood | Evidence / effect                                    | Permanent fix                                                        | Exact language / AC                                                                              |
| ------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Historic group membership/reason can reveal Member Care/security/staffing context; viewer needs differ. | Critical / Medium     | D40 reason is audit evidence, not recipient message. | Viewer/purpose projection; D42 tier decision; no new disclosure now. | “No viewer receives historical label/basis/reason/actors beyond D42-authorized tier.” AC041–050. |

### 16. Scalability and performance risks

**Material concern exists.**

| Failure / why it matters                                                                      | Severity / likelihood | Evidence / effect                  | Permanent fix                                            | Exact language / AC                                                       |
| --------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| Loading audit/basis for every person causes N+1/large payload; history search scans globally. | High / Medium         | Current list does not need origin. | Indexed current list; lazy authorized/paginated history. | “List/card query count is independent of history cardinality.” AC061–070. |

### 17. Operational burden

**Material concern exists.**

| Failure / why it matters                                                                            | Severity / likelihood | Evidence / effect                                      | Permanent fix                                                       | Exact language / AC                                                                              |
| --------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Permanent exception badges create cleanup/support work; hidden history makes access reviews harder. | Medium / High         | Option 1 keeps current quiet and history discoverable. | No cleanup state; ordinary current source with expanded provenance. | “No administrator maintains D41 status; history is automatic from retained evidence.” AC081–100. |

### 18. Observability and auditability gaps

**Material concern exists.**

| Failure / why it matters                                                                                      | Severity / likelihood | Evidence / effect                                               | Permanent fix                                                                                  | Exact language / AC                                                                               |
| ------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Missing origin, rewritten labels, stale current/history mismatch, or unaudited history read undermines trust. | High / Medium         | Entra/Google distinguish assignment analysis and audit history. | Monitor basis completeness/projection agreement; audit privileged history reads with coverage. | “Reconciliation reports evaluated grants/bases/events/viewer policies and mismatches.” AC091–100. |

### 19. Dependency and integration risks

**Material concern exists.**

| Failure / why it matters                                                                              | Severity / likelihood | Evidence / effect                                | Permanent fix                                                                | Exact language / AC                                                                                         |
| ----------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Search, BI export, cache, Realtime, Inngest, or IdP can lag and publish false current classification. | High / Medium         | Google documents analyzer best-effort freshness. | Canonical current read wins; integrations version/epoch and never authorize. | “Stale integration cannot label or mutate current source; export binds one snapshot.” AC031–040, AC061–070. |

### 20. Migration, rollout, and upgrade risks

**Material concern exists.**

| Failure / why it matters                                                                      | Severity / likelihood | Evidence / effect                     | Permanent fix                                                                                   | Exact language / AC                                                                         |
| --------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Old D40 basis version lacks display fields; old clients retain badge; rollback loses history. | High / Medium         | D41 spans read models, not authority. | Versioned history fallback, reader-first rollout, current truth before history, preserve basis. | “Unknown history version is safely unavailable; current source remains correct.” AC101–110. |

### 21. Testability, traceability, and proof

**Material concern exists.**

| Failure / why it matters                                                                                 | Severity / likelihood | Evidence / effect                            | Permanent fix                                                                        | Exact language / AC                                                            |
| -------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Text-only tests miss source truth, lag, viewer privacy, return/rename/export, RLS bypass, accessibility. | Critical / High       | D41 is a security-bound read-model decision. | Public-seam tests for every viewer, lifecycle, cache, export, privileged path, a11y. | “Release proves current/history outcomes, not component snapshots.” AC111–120. |

### 22. Other development hazards

**Material concern exists.**

| Failure / why it matters                                                                         | Severity / likelihood | Evidence / effect                               | Permanent fix                                                      | Exact language / AC                                                                                        |
| ------------------------------------------------------------------------------------------------ | --------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Operational “exceptions” roster, staff scoring, or permanent stigma can arise from audit origin. | High / Medium         | D38 forbids scoring; D40 basis governance-only. | Exclude origin from ordinary filters/analytics and people scoring. | “Continuity origin is governance history only and never a workforce/ministry score.” AC061–070, AC091–100. |

## Acceptance criteria

### Current source truth

- **D41-AC001:** After every group-derived D38 path ends, a current effective
  D40-origin direct grant displays **Direct grant** in administration and
  **Granted directly to you** in My Access.
- **D41-AC002:** Current summary displays the direct grant's current duration/
  end condition and no historical-origin badge.
- **D41-AC003:** No current `continuity`, `exception`, `converted`, or
  `post_overlap` source type/Boolean is stored or resolved.
- **D41-AC004:** Ending the final group path performs no direct-grant mutation,
  successor creation, reissue, conversion, or retag.
- **D41-AC005:** Current source derives from canonical direct grant state and
  current EffectiveAccess at the validated Tenant epoch.
- **D41-AC006:** D40 basis/history cannot make an expired/revoked/inert/denied
  direct grant appear current.
- **D41-AC007:** Holder count and D38 capability remain deduplicated to one
  assignment/capability.
- **D41-AC008:** Current direct revoke/renew actions are the ordinary D38/D39
  actions, not D41-specific.
- **D41-AC009:** No current D38 path presents no current source, regardless of
  retained D40 history.
- **D41-AC010:** Unknown current grant/capability/assignment/floor state fails
  closed and never falls back to historical basis.

### Historical continuity provenance

- **D41-AC011:** Authorized expanded provenance renders the immutable D40
  creation origin separately from current source.
- **D41-AC012:** History states that the direct grant was added while one or
  more group paths also existed.
- **D41-AC013:** History identifies exact event-time group source identities
  through viewer-authorized safe labels.
- **D41-AC014:** D40 warning/basis version remains historically renderable.
- **D41-AC015:** History records the terminal event/instant for the last group-
  derived path.
- **D41-AC016:** D40 origin never grants, denies, prioritizes, recertifies,
  expires, or cleans up current authority.
- **D41-AC017:** Archived/terminal group history remains available under
  retention and is non-interactive.
- **D41-AC018:** Ordinary group/assignment/user/Tenant deletion cannot cascade-
  delete retained D40/group/direct provenance.
- **D41-AC019:** Direct terminal cause/instant remains authorized history after
  it leaves current view.
- **D41-AC020:** A later direct successor has its own creation provenance and
  does not inherit D40 basis automatically.

### Group return, rename, and direct lifecycle

- **D41-AC021:** If one group path returns, administration lists both **Direct
  grant** and **Through [group]**; My Access uses equivalent safe self-copy.
- **D41-AC022:** Several group paths returning/ending in any order produce the
  complete current source list at one epoch.
- **D41-AC023:** Group return leaves D40 origin expanded history only and
  creates no badge/conversion/cleanup.
- **D41-AC024:** Group return never deletes, rewrites, reopens, or duplicates
  D40 basis/history.
- **D41-AC025:** Rename preserves stable group identity and event-time label.
- **D41-AC026:** When authorized/useful, history may state **formerly [event
  label], now [current label]** without treating labels as authority.
- **D41-AC027:** Archived/terminal group renders as non-clickable historical
  text, not broken route or raw identifier.
- **D41-AC028:** Direct expiry/revoke/delegation/recertification/floor denial
  removes it from current effective source presentation.
- **D41-AC029:** Assignment suspension/end denies current source and a
  recreated assignment inherits no direct source/history authority.
- **D41-AC030:** Party merge neither transfers, unions, discards, nor revives
  direct grant or historical origin.

### Projection lag, failure, caches, and deterministic rendering

- **D41-AC031:** History projection unavailable does not hide/block/mislabel
  canonical current **Direct grant** / **Granted directly to you**.
- **D41-AC032:** History failure displays a persistent non-blocking unavailable
  state that says current access is unaffected.
- **D41-AC033:** Stale history cannot overwrite a current source response from
  a newer governance epoch.
- **D41-AC034:** Current explanation revalidates exact assignment, capability,
  source state, floor, delegation/recertification, and epoch.
- **D41-AC035:** Current cache key includes Tenant, assignment, capability,
  governance epoch, and viewer authorization class/purpose.
- **D41-AC036:** History cache includes Tenant, viewer purpose, basis/version,
  and provenance revision and never authorizes.
- **D41-AC037:** Cross-Tenant, cross-assignment, cross-purpose, or cross-viewer
  cache reuse is rejected.
- **D41-AC038:** Group end/return epoch invalidates current source presentation
  without a D41-specific invalidation system.
- **D41-AC039:** Out-of-order current/history network response cannot replace a
  newer source/history state.
- **D41-AC040:** Rebuild/replay at identical authoritative heads renders one
  deterministic/idempotent current/history result.

### Viewer authorization, privacy, and RLS

- **D41-AC041:** Subject receives only the D42-authorized safe origin summary,
  dates, and group labels.
- **D41-AC042:** Grant managers receive only the basis/reason/actors/history
  permitted by current governance purpose.
- **D41-AC043:** Security auditors receive immutable history only through their
  current scoped audit capability/purpose.
- **D41-AC044:** Membership manager receives the current surviving direct
  source/end condition needed for removal, not D40 reason by default.
- **D41-AC045:** Ordinary staff/D38 holders receive no other person's origin,
  group history, reason, basis, or actors.
- **D41-AC046:** Wrong-Tenant/unauthorized history is uniform not-found and
  reveals no historical group existence.
- **D41-AC047:** Governance reason never appears without D42-authorized viewer
  and purpose.
- **D41-AC048:** Sensitive group label is minimized/suppressed when viewer
  policy does not admit it.
- **D41-AC049:** Privileged history read receives durable read-audit when Phase
  12 classification/policy requires it.
- **D41-AC050:** Raw basis/audit relations are inaccessible to browser roles.
- **D41-AC051:** Current/history projections and underlying relations preserve
  same-Tenant composite keys and `tenant_id NOT NULL`.
- **D41-AC052:** Required relations/views enable/force RLS or provably preserve
  the same forced-RLS source boundary.
- **D41-AC053:** Operation/view policies enforce correct `USING` and
  `WITH CHECK` and cannot move scope.
- **D41-AC054:** Security-invoker view or authorized RPC re-proves viewer,
  Tenant, assignment, purpose, and field minimization.
- **D41-AC055:** SECURITY DEFINER functions pin `search_path` and accept no
  caller-controlled viewer/Tenant/purpose attribution.
- **D41-AC056:** Owner/service-role/`BYPASSRLS` paths cannot read/render more
  history than product policy permits.
- **D41-AC057:** Worker/support/repair/import/export/cache/Realtime/AI/Inngest
  paths pass the same viewer/Tenant/privacy policy.
- **D41-AC058:** An allowed read cannot transform/relabel another Tenant's
  current/history source into the viewer's Tenant.
- **D41-AC059:** Lawful anonymization/retention preserves audit integrity while
  minimizing no-longer-required identity.
- **D41-AC060:** Poison fixtures cover wrong Tenant, assignment, viewer,
  purpose, raw relation, cache, RPC, owner, and service paths.

### Search, reporting, export, and performance

- **D41-AC061:** Operational People & access search classifies the current
  source as direct.
- **D41-AC062:** No ordinary operational filter/list/queue labels people as
  continuity exceptions.
- **D41-AC063:** Only privileged governance/audit search may filter D40
  creation origin.
- **D41-AC064:** Current-access export emits current direct source/duration and
  no continuity basis/reason.
- **D41-AC065:** Audit export emits basis/reason only for an authorized
  governance purpose.
- **D41-AC066:** Export binds one authoritative snapshot epoch/instant and
  cannot mix current/history revisions.
- **D41-AC067:** Stale/partial export fails or states its exact authoritative
  snapshot; it never silently claims currentness.
- **D41-AC068:** Search/index lag cannot authorize, mutate, or override current
  source presentation.
- **D41-AC069:** BI/analytics receives no continuity basis/reason by default.
- **D41-AC070:** Continuity origin is never used for staff/Tenant performance,
  engagement, readiness, risk, or ministry-health scoring.
- **D41-AC071:** People/current-holder list query uses indexed current source
  and performs no per-person history/basis lookup.
- **D41-AC072:** Expanded history loads only on authorized demand and is
  indexed/paginated.
- **D41-AC073:** History query count does not scale with the number of people
  visible in the parent list.
- **D41-AC074:** Current source latency remains within the established People &
  access baseline independent of history availability/cardinality.
- **D41-AC075:** History projection failure/timeout degrades history only and
  releases resources/bounded retry safely.
- **D41-AC076:** Group return/end invalidation creates no per-holder history
  rewrite/fan-out.
- **D41-AC077:** Search/report/export projections are derived asynchronously/
  idempotently and never source authority.
- **D41-AC078:** Current card/list payload excludes unused basis/event/reason
  fields.
- **D41-AC079:** History chronology returns bounded pages with stable cursor/
  ordering and no cross-Tenant scan.
- **D41-AC080:** No arbitrary history/group-label cap truncates decisive
  provenance; bounded UI offers authorized pagination/expansion.

### Temporal, localization, UX, and accessibility

- **D41-AC081:** History stores/displays authoritative group/direct event
  sequence and UTC instants.
- **D41-AC082:** Viewer sees localized date, time, and explicit zone without
  changing ordering.
- **D41-AC083:** Same-instant events use stable sequence/head tie-breaking.
- **D41-AC084:** DST change, locale calendar/format, and time-zone change do
  not reorder or misstate events.
- **D41-AC085:** RTL/bidirectional content isolates group/person labels and
  dates safely.
- **D41-AC086:** Long/CJK/international/renamed group labels wrap with identity
  unambiguous.
- **D41-AC087:** Current source appears before history in visual and DOM order.
- **D41-AC088:** **Why this person has access** / **Why you have access**
  disclosure has an accessible name, semantic expanded state, and keyboard
  operation.
- **D41-AC089:** Current source and chronology remain understandable without
  icon, color, badge, hover, animation, or truncation.
- **D41-AC090:** No prominent **Continuity exception** badge appears after all
  groups end.
- **D41-AC091:** Important disclosure/retry/action controls are at least
  44-by-44 CSS pixels with visible focus/restoration.
- **D41-AC092:** Current/history states reflow at 320 CSS pixels and 400-percent
  zoom without horizontal access matrix.
- **D41-AC093:** Forced colors and reduced motion preserve current/history/
  unavailable meaning.
- **D41-AC094:** Screen reader receives current source, then optional history
  chronology, terminal states, and noninteractive archived groups.
- **D41-AC095:** Loading/unavailable/retry status is programmatically announced
  and not toast-only.
- **D41-AC096:** Low-bandwidth history timeout preserves current source and
  offers safe bounded retry.
- **D41-AC097:** Current direct revoke/renew action remains reachable if
  history fails.
- **D41-AC098:** History disclosure preserves focus across load/error/retry/
  collapse and route navigation.
- **D41-AC099:** Group rename/archive produces no broken accessible name/link.
- **D41-AC100:** No D41 notification, unread, email, reminder, task, SLA,
  escalation, conversion worker, or recertification campaign is created.

### Migration, rollout, failure proof, and traceability

- **D41-AC101:** D41 migration performs no direct-grant, group, basis, epoch,
  authorization, or D37 mutation/backfill.
- **D41-AC102:** Existing D40 basis versions render through versioned safe
  adapters without inferred fields.
- **D41-AC103:** Unknown/unsupported history version displays history
  unavailable and preserves correct current source.
- **D41-AC104:** Reader-first rollout lands canonical current source before
  expanded provenance.
- **D41-AC105:** No old/mixed client receives a prominent continuity badge or
  treats origin as current authority.
- **D41-AC106:** History projection kill switch disables history only, never
  current source/authorization.
- **D41-AC107:** Rollback preserves direct grant, D40 basis, group/direct audit,
  epoch, recertification, receipts, and D37 history.
- **D41-AC108:** Mixed-version current/history cache keys prevent old response
  overwriting newer current source.
- **D41-AC109:** No historical group end, label, reason, actor, or origin is
  inferred when evidence is absent.
- **D41-AC110:** Reconciliation/rebuild reports evaluated Tenants, grants,
  bases, events, viewer policies, and mismatches rather than only failures.
- **D41-AC111:** D38–D41 terminology/current-history ownership is consistent
  in Grill log, glossary, ADR-0184, Phase 12, and OpenSpec.
- **D41-AC112:** Positive tests cover plain current direct, expanded origin,
  group return, rename/archive, direct terminal, and successor.
- **D41-AC113:** Negative/privacy tests cover every viewer/Tenant/purpose,
  sensitive label/reason, raw relation, cache, export, and privileged path.
- **D41-AC114:** Concurrency/idempotency tests cover end/return/out-of-order
  current/history responses and deterministic rebuild.
- **D41-AC115:** Failure tests prove history unavailable cannot block/mislabel
  current access/action.
- **D41-AC116:** Search/report/export tests prove current-direct versus
  privileged-origin field separation and snapshot binding.
- **D41-AC117:** Accessibility/manual tests cover keyboard/screen reader,
  focus, 44px, 320px/400%, forced colors, reduced motion, RTL/CJK, and low
  bandwidth.
- **D41-AC118:** Production-shaped tests prove no current-list N+1, bounded
  history paging, cache isolation, and established latency.
- **D41-AC119:** Release evidence exercises all named monitors and records each
  owner's response readiness.
- **D41-AC120:** D41/D42 are recorded; activation requires complete OpenSpec/
  design/task/test traceability and positive/negative/privacy/concurrency/
  migration/a11y/production-shaped release proof to agree.

## Named monitors

| Signal                                                       |                                                                                                            Threshold | Owner                    | Required response                                                                                                                                     |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------: | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `website_recovery_d41_current_source_mislabel_total`         |                                                                                                                  Any | IAM + Product            | Hide faulty projection, serve canonical current source, repair renderer.                                                                              |
| `website_recovery_d41_prominent_continuity_badge_total`      |                                                                                      Any released current-only state | Product Design           | Remove badge and restore expanded-history pattern.                                                                                                    |
| `website_recovery_d41_conversion_mutation_total`             |                                                                                                                  Any | IAM                      | Make conversion inert, restore original direct identity/history.                                                                                      |
| `website_recovery_d41_missing_origin_total`                  |                                                                              Any D40 basis lacking renderable origin | IAM + Data               | Repair basis/history projection and inspect retention.                                                                                                |
| `website_recovery_d41_basis_tamper_total`                    |                                                                                                                  Any | Security                 | P0 preserve evidence, stop history writer, inspect affected grants.                                                                                   |
| `website_recovery_d41_current_from_history_projection_total` |                                                                                                                  Any | Security + IAM           | Disable projection as authority; route through canonical PDP.                                                                                         |
| `website_recovery_d41_history_failure_blocked_current_total` |                                                                                                                  Any | IAM + Product            | Restore current view immediately; isolate optional history failure.                                                                                   |
| `website_recovery_d41_projection_epoch_mismatch_total`       |                                                                                                                  Any | IAM                      | Invalidate cache/projection and rebuild at current epoch.                                                                                             |
| `website_recovery_d41_group_return_source_omission_total`    |                                                                                                                  Any | IAM + Product            | Refresh source list and repair invalidation.                                                                                                          |
| `website_recovery_d41_group_end_direct_omission_total`       |                                                                                                                  Any | IAM + Product            | Restore direct display and inspect group-end projection.                                                                                              |
| `website_recovery_d41_rename_history_rewrite_total`          |                                                                                                                  Any | Compliance + IAM         | Restore event-time label/identity and repair renderer.                                                                                                |
| `website_recovery_d41_archived_group_broken_history_total`   |                                                                                                                  Any | Data + Product           | Restore retained reference/noninteractive display.                                                                                                    |
| `website_recovery_d41_cross_tenant_history_total`            |                                                                                                                  Any | Security + Database      | P0 Tenant-isolation response and access review.                                                                                                       |
| `website_recovery_d41_unauthorized_origin_read_total`        |                                                                                                                  Any | Privacy + Security       | Contain disclosure, inspect audited reads, repair viewer policy.                                                                                      |
| `website_recovery_d41_unauthorized_reason_read_total`        |                                                                                                                  Any | Privacy + Security       | Contain disclosure and repair D42 projection.                                                                                                         |
| `website_recovery_d41_raw_history_browser_grant_total`       |                                                                                                                  Any | Database Security        | Revoke grant and inspect every read.                                                                                                                  |
| `website_recovery_d41_rls_contract_drift_total`              |                                                                                                                  Any | Database Security        | Block deploy, restore FORCE/policies/grants.                                                                                                          |
| `website_recovery_d41_privileged_path_parity_failure_total`  |                                                                                                                  Any | Security                 | Disable failing RPC/worker/export until parity passes.                                                                                                |
| `website_recovery_d41_operational_exception_filter_total`    |                                                                                    Any ordinary people/report filter | Product + Privacy        | Remove filter/index field and inspect consumers.                                                                                                      |
| `website_recovery_d41_audit_export_leak_total`               |                                                                                  Any unauthorized basis/reason field | Privacy                  | Contain export and repair purpose/viewer projection.                                                                                                  |
| `website_recovery_d41_hard_deleted_provenance_total`         |                                                                                                                  Any | Compliance + Database    | Stop deletion, recover evidence, repair retention/FKs.                                                                                                |
| `website_recovery_d41_history_list_n_plus_one_total`         |                                                                          Any query count scaling with visible people | IAM + Database           | Block performance release; lazy-load/index history.                                                                                                   |
| `website_recovery_d41_history_unavailable_rate`              |                                                          Greater than 1% over 15 minutes and at least 1,000 requests | SRE + IAM                | Degrade history only, investigate projection/store, preserve current view.                                                                            |
| `website_recovery_d41_current_projection_latency`            |                  p95 greater than 2× established People & access baseline for 15 minutes and at least 1,000 requests | IAM Platform             | Inspect indexes/cache and pause rollout.                                                                                                              |
| `website_recovery_d41_accessibility_blocker_total`           |                                                                                                  Any critical defect | Product Design           | Block release pending complete proof.                                                                                                                 |
| `website_recovery_d41_notification_task_noise_total`         |                                                                                                                  Any | Product                  | Remove generated side effect and repair boundary.                                                                                                     |
| `website_recovery_d41_staff_scoring_use_total`               |                                                                                                                  Any | Privacy + Product        | Disable consumer, delete derived score where lawful, governance review.                                                                               |
| `website_recovery_d41_source_comprehension_support_rate`     | Greater than 5 D41-related support cases per 1,000 authorized disclosure opens over 30 days and at least 1,000 opens | Product Design + Support | Run usability study and revise summary/disclosure, not authority; telemetry remains aggregate and contains no person, reason, group, or basis detail. |

## Ruthless synthesis

### Must be resolved before this answer is recorded

1. Record current-direct versus historical-origin ownership explicitly.
2. State that group-end produces no D41 mutation/conversion.
3. Require canonical current source to survive history projection failure.
4. Define group return, rename/archive/delete, direct terminal, successor, and
   Phase 12 recertification presentation.
5. Separate operational search/export from privileged audit-origin queries.
6. Retain event-time group identity/label and history under restrictive
   deletion.
7. Make viewer/purpose authorization explicit and defer only the final tier
   decision to D42.
8. Prohibit badge status, scoring, notification/task, timer, and worker.

### Must be captured in specification and design

1. Current/history ownership map and deterministic renderer.
2. Safe history-unavailable/loading/retry state.
3. Epoch/viewer/provenance cache keys and stale-response rejection.
4. Rename/archived group and direct successor history.
5. Viewer-specific projections, RLS, privileged parity, retention, read-audit.
6. Current search/report/export and privileged audit-export schemas.
7. Event sequence/UTC/localization behavior.
8. Accessible disclosure/mobile/low-bandwidth contract.
9. D42 viewer tiers for label/basis/reason/actors.

### Required implementation safeguards and order

1. Reconcile D41/D42 dependency across D38–D40, ADR-0184, Phase 12, glossary,
   and OpenSpec.
2. Define canonical-current and immutable-history projection contracts.
3. Add viewer/purpose policy seam before expanded history.
4. Build current direct presentation from canonical grant/PDP/epoch.
5. Build lazy authorized provenance from D40 basis/audit.
6. Prove history failure cannot block/mislabel current.
7. Add group return/rename/archive/direct-terminal/successor behavior.
8. Add purpose-split search/export/reporting.
9. Add cache/RLS/privileged/retention/read-audit proof.
10. Add accessible disclosure and low-bandwidth states.
11. Reader-only canary; no data/authority migration.
12. Expand only with clean correctness/privacy/cache/performance/a11y signals.

### Risks that may be monitored

Only history availability/latency and user comprehension may remain product
monitor hypotheses. Every security, current-source, privacy, retention, cache,
and export condition is a release requirement, not a monitor-only risk.

## Migration, rollout, upgrade, and rollback

1. Add versioned read adapters and deny/minimize unknown history versions.
2. Deploy canonical current source reader before expanded provenance.
3. Add viewer policy and forced-RLS history projection.
4. Release expanded history behind a read-only flag.
5. Perform no grant, basis, epoch, group, assignment, or D37 backfill/mutation.
6. Test mixed old/new clients/caches and stale/out-of-order responses.
7. Canary with group end/return/rename/archive/direct terminal/recertification.
8. Verify search/export current-vs-audit separation.
9. Keep kill switch for history projection only; current source remains.
10. Rollback preserves grant, basis, audit, receipt, epoch, recertification, and
    D37 history.

## Traceability

| Artifact                 | Required D41 trace                                                          |
| ------------------------ | --------------------------------------------------------------------------- |
| Grill decision log       | Founder Option 1, corrected current/history split, D42 dependency           |
| Root glossary            | Current source, historical continuity origin, viewer-scoped provenance      |
| ADR-0184 or amendment    | No source conversion/precedence; current direct plus audit origin           |
| Phase 12                 | current grant/PDP, basis/audit, epoch/cache, recertification, RLS/retention |
| D38–D40                  | reason/duration, overlap creation basis, source-aware lifecycle/D37 fence   |
| Identity/access OpenSpec | current/history projections, viewer policy, failures, lifecycle             |
| Design/tasks/tickets     | Requirements/AC/monitors with no conversion engine                          |
| Tests/release            | Viewer/lifecycle/cache/export/a11y/scale proof                              |

## Decision to record

> **D41 — Current direct source with historical continuity provenance.** After
> all group-derived D38 paths end, a current D40-origin direct grant appears
> plainly as **Direct grant** in administration or **Granted directly to you**
> in My Access with its current end condition. Authorized
> expanded provenance/history retains **Added for continuity** and the
> event-time group origin.
>
> Current source comes only from canonical Phase 12 grant/EffectiveAccess state;
> origin comes only from immutable D40 basis/audit. Group end causes no direct-
> grant conversion, update, new status, or worker. Group return lists both
> current paths while origin remains history.
>
> History lag/unavailability cannot block or mislabel current source. Current
> caches bind Tenant/assignment/capability/epoch/viewer purpose; history is
> optional, authorized, versioned, and non-authoritative.
>
> Operational search/report/export classifies the source as direct. Privileged
> governance/audit may query creation origin. Rename/archive/delete preserves
> stable event-time provenance; direct terminal/successor lifecycle remains
> ordinary. Phase 12 risk-based recertification remains authoritative.
>
> D41 adds no badge status, conversion, authorization write, timer, campaign,
> task, notification, scoring, or Inngest authority. D42 now limits the holder
> to the safe origin/date explanation, membership review to survivor/end,
> grant governance to floor-minimized evidence, and full typed evidence to the
> separately authorized audit projection.

## Historical D42 question — resolved 2026-08-29

Founder selected tiered provenance by viewer and purpose. The exact corrected
field matrix, capability/purpose boundary, and D43 holder-correction seam are
recorded in the [D42 adversarial review](./phase-24-d42-purpose-tiered-continuity-provenance-adversarial-review.md).

### Context and example

Jordan's current My Access source says **Granted directly to you**. Expanded provenance can
explain that it was added while Jordan also belonged to Website Operations.
That context helps Jordan and administrators identify stale access, but group
names and the grant reason can reveal sensitive staffing or ministry
responsibilities.

D42 does not change current access, retention, audit, or D40/D41 lifecycle. It
decides only viewer-specific disclosure.

### Option 1 — tiered provenance — recommended

- **Subject:** safe **Added for continuity · [date]** summary, with no
  historical group label, governance reason, actor, basis, receipt, other
  member, or protected detail.
- **Grant managers/security auditors:** full typed basis, event-time/current
  labels, reason, actors, and history within current purpose/scope.
- **Membership manager during removal:** current surviving direct source and
  end condition only.
- **Everyone else:** no origin or reason.

**UX:** My Access remains transparent enough for self-correction; governance
evidence stays with authorized staff.

**Risk/control:** sensitive group/reason detail remains purpose-scoped.

### Option 2 — full origin and reason to the subject

The subject sees every historical group label and the complete governance
reason.

**UX:** maximum transparency.

**Tradeoff:** unnecessary staffing/security/ministry context may be disclosed;
the reason was defined as audit evidence, not recipient messaging.

### Option 3 — governance-only historical origin

The subject sees only current **Granted directly to you**. Grant managers/security
auditors see the full origin/reason.

**UX:** strongest privacy and simplest My Access.

**Tradeoff:** the subject cannot understand why sticky direct access exists or
flag that it is no longer needed.

### Historical recommendation and resolution

**My recommendation is Option 1 — tiered provenance.** It provides useful
self-transparency without promoting protected governance rationale into a
recipient message.

Founder selected **Option 1 — tiered provenance**, corrected and recorded in
D42. This historical option set is retained only for traceability and is not an
open question.
