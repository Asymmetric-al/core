# Phase 23 D32 Accessibility Assistance Adversarial Review

**Status:** Complete adversarial hardening supporting the founder-ratified exact
Phase 23 D32 C-prime-R decision. This review explains the decision without
independently expanding the ratified authority or authorizing implementation.

**Date:** 2026-08-24

**Ratified:** 2026-08-24

## Executive judgment

C-prime is the correct direction only after removing any implication that Asym
grades, certifies, or polices a Tenant's editorial judgment.

The hardened boundary is:

> **Asym guarantees the accessibility of what Asym generates and operates;
> Asym helps Tenants make informed content choices without claiming to approve,
> certify, or police those choices.**

This preserves the D9 platform floor, D11 typed Rich Text and Video contracts,
D27 placement semantics, and D1 exact-release authority. D32 adds no broader
compliance gate.

Primary evidence:

- [W3C ATAG 2.0](https://www.w3.org/WAI/AU/ATAG20/) assigns responsibility for
  automatically generated output to the authoring tool while distinguishing
  author-caused content choices. It requires integrated checking, location,
  decision help, and repair assistance without requiring every finding to block
  publication.
- [W3C evaluation-tool
  guidance](https://www.w3.org/WAI/test-evaluate/tools/selecting/) states that
  automated tools cannot determine accessibility, require human judgment, and
  may return misleading results.
- [Webflow's Audit
  panel](https://help.webflow.com/hc/en-us/articles/33961313088531-Intro-to-the-Audit-panel)
  demonstrates contextual location and repair but acknowledges blind spots for
  CMS-bound and component content.
- [Sanity validation](https://www.sanity.io/docs/studio/validation)
  distinguishes errors from warnings and documents that API writes can bypass
  Studio validation.
- [Payload Fields](https://payloadcms.com/docs/fields/overview) and [Payload
  React Hooks](https://payloadcms.com/docs/admin/react-hooks) support contextual
  assistance but do not replace exact-candidate server validation.

## 1. Brittleness

**Material concern: Yes. Severity: High. Likelihood: Medium–High.**

- **What could go wrong:** checks tied to one Payload field path, Lexical node,
  Page template, locale, or package DOM can disappear or misidentify content as
  composition, reuse, dynamic lists, and custom packages evolve.
- **Why it matters:** staff may receive false reassurance or be sent to a field
  that no longer owns the problem.
- **Evidence:** Webflow explicitly misses CMS-bound and component imagery. Core
  already has Page-local, reusable, dynamic, localized, and package-owned
  composition paths.
- **Permanent prevention:** use stable semantic source identities and one small,
  versioned diagnostic catalog. Cheap field hints may be adapter-specific, but
  D1 derives the final result from the exact compiled candidate. Advisory
  assistance fails open; already-mandatory platform proof fails only the exact
  candidate closed.

## 2. Technical debt

**Material concern: Yes. Severity: High. Likelihood: High.**

- **What could go wrong:** Payload validation, editor hints, D1, D9 package
  certification, D31, imports, and tests could each implement slightly
  different rules and language.
- **Why it matters:** the same content would pass one surface and fail another,
  while every provider upgrade multiplies maintenance.
- **Evidence:** Sanity's client-only validation shows the danger of treating
  editor validation as server authority. Core intentionally keeps Payload's
  native document form rather than a parallel editor.
- **Permanent prevention:** one typed finding contract and pure semantic rule
  implementations, with thin Payload, compiler, package, and UI adapters. Do
  not add parallel form state, a second checker database, duplicated WCAG
  mappings, or a tenant rules DSL.

## 3. Edge cases

**Material concern: Yes. Severity: High. Likelihood: High.**

- **What could go wrong:** decorative, informative, functional, linked,
  complex, and image-of-text media; reused content; locale-specific meaning;
  package headings; scheduled releases; dynamic results; and third-party embeds
  make naive yes/no rules wrong.
- **Why it matters:** false positives create fatigue, while false negatives can
  hide a real visitor barrier.
- **Evidence:** ATAG requires author decision help for semi-automated checks.
  D27 already places media meaning on each use rather than on the byte.
- **Permanent prevention:** preserve source ownership and exact placement/
  locale semantics, provide plain decision help, keep contextual quality
  advisory, and re-evaluate the exact scheduled candidate at execution.

## 4. Footguns

**Material concern: Yes. Severity: High. Likelihood: High.**

- **What could go wrong:** universal non-empty alt validation encourages
  filenames, `image`, or AI filler; a bulk dismissal hides future issues;
  client-only success is bypassed; `Publish anyway` copy pressures staff into a
  false legal choice.
- **Why it matters:** the UI would reward meaningless data and undermine trust.
- **Evidence:** Core's current Media collection universally requires `alt`,
  while D27 correctly moves meaning to placement. ATAG forbids generic automated
  alternative repair and requires accept/edit/reject.
- **Permanent prevention:** ask for purpose rather than a non-empty string; do
  not silently insert AI text; prohibit global mute/dismiss-all; keep the normal
  Publish action enabled for suggestions; let D1 derive exact final facts.

## 5. Tenant safety

**Material concern: Yes. Severity: Critical. Likelihood: Medium.**

- **What could go wrong:** counts, descriptions, preview links, remembered
  decisions, or package findings could reveal another Tenant, Site, locale, or
  private candidate.
- **Why it matters:** even a title or count can expose a ministry, worker,
  location, or unpublished campaign.
- **Evidence:** Core is multi-Tenant and Payload's privileged APIs cannot be
  treated as an isolation boundary.
- **Permanent prevention:** derive Tenant/environment/Site scope server-side;
  bind every result to exact source and candidate identity; apply adverse-first
  authorization; use non-enumerating errors and opaque telemetry; require
  negative cross-Tenant tests on UI, API, cache, Preview, and direct routes.

## 6. Overengineering

**Material concern: Yes. Severity: High. Likelihood: High.**

- **What could go wrong:** D32 could become a compliance product with a policy
  engine, tenant WCAG profiles, reviewer roles, waiver workflow, issue table,
  crawler, score, and notification program.
- **Why it matters:** it creates administration and technical debt without
  improving real visitor outcomes.
- **Evidence:** the actual seam is contextual help plus existing D1/D9/D11/D27
  closure. W3C says tools assist rather than determine accessibility.
- **Permanent prevention:** ship one fixed code-owned catalog, derived findings,
  and compact exact-candidate evidence. Prohibit scores, policy matrices,
  custom rules, crawlers, approval workflows, and generalized waivers.

## 7. UX/UI and user friction

**Material concern: Yes. Severity: High. Likelihood: High.**

- **What could go wrong:** persistent red badges, per-keystroke checks, modals,
  jargon, repeated unchanged prompts, and extra publish confirmations teach
  occasional ministry staff to ignore or fear the product.
- **Why it matters:** the system would reduce completion and still fail to prove
  accessibility.
- **Evidence:** ATAG recommends integration into the normal look and feel and
  recognizes quiet prompts. Webflow's small contextual panel and direct target
  action are more usable than a broad audit wall.
- **Permanent prevention:** accessible defaults, context-local copy, progressive
  disclosure, one Page action, no global badge, no toast, no score, no extra
  publish step, revision-scoped continuity, and representative nonprofit-staff
  usability testing.

## 8. Hidden coupling

**Material concern: Yes. Severity: High. Likelihood: Medium–High.**

- **What could go wrong:** product meaning may couple to Payload error objects,
  Lexical JSON, axe rule IDs, one renderer's markup, or a package implementation.
- **Why it matters:** provider and package upgrades could silently change
  release behavior or invalidate historical decisions.
- **Evidence:** Core runs an internal Payload 4 pin and already treats D1
  projections and provider adapters as separate concerns.
- **Permanent prevention:** stable Asym semantic rule IDs, source identities,
  owner classes, and versioned results. Translate provider output at adapters;
  never store raw checker/provider state as product authority.

## 9. Failure modes

**Material concern: Yes. Severity: High. Likelihood: Medium.**

- **What could go wrong:** a checker can time out, crash, become stale, disagree
  with Preview, return a false positive, or lose its response after D1 commits.
- **Why it matters:** staff may not know whether publication occurred, or a
  remote tool could unexpectedly stop a ministry launch.
- **Evidence:** W3C explicitly warns that automated results can be inaccurate.
- **Permanent prevention:** keep mandatory rules local to the compiler; disclose
  unavailable advisory assistance and fail it open; bind final mandatory proof
  to D1's exact result; preserve the current public generation; show the actual
  source owner and immutable receipt after ambiguous outcomes.

## 10. Data integrity risks

**Material concern: Yes. Severity: High. Likelihood: Medium.**

- **What could go wrong:** `Keep as written` could survive a relevant edit,
  locale change, asset replacement, or new rule meaning—or an implementation
  could over-invalidate it after an unrelated package or compiler upgrade.
- **Why it matters:** a later editor would unknowingly inherit a decision made
  about different content.
- **Evidence:** D1, D22, D27, and package activation already depend on exact
  revisions and immutable identities.
- **Permanent prevention:** derive findings and bind continuity to the
  rule-declared semantic inputs, locale, and check-meaning version. Include
  package or compiler identity only when that rule depends on it, invalidate
  only on relevant change, and store no mutable `resolved` issue truth or
  permanent waiver.

## 11. Security and privacy risks

**Material concern: Yes. Severity: Critical. Likelihood: Medium.**

- **What could go wrong:** an external scanner or AI provider may receive
  private candidates; logs may retain sensitive text or images; hostile custom
  content can attack checker/render paths.
- **Why it matters:** Preview can contain unpublished, restricted, or personally
  sensitive ministry information.
- **Evidence:** D9 and D25 deliberately constrain package execution and private
  Preview. Accessibility assistance does not justify a new data recipient.
- **Permanent prevention:** prefer in-process rules; do not send private
  candidates to third-party scanners or models by default; sanitize and bound
  inputs; make AI suggestions separately qualified and reviewable; keep logs,
  metrics, and traces opaque and content-free.

## 12. Scalability and performance risks

**Material concern: Yes. Severity: High. Likelihood: Medium–High.**

- **What could go wrong:** scanning every Page, locale, reusable dependency,
  dynamic result, and package on every keystroke makes Studio sluggish and D1
  expensive.
- **Why it matters:** latency turns guidance into friction and can increase
  provider cost or starve release/recovery work.
- **Evidence:** Payload notes that Admin validation runs on each change and
  expensive checks must be deferred. Whole-candidate correctness is necessary,
  but per-keystroke whole-Site work is not.
- **Permanent prevention:** cheap incremental local hints after settled edits;
  one bounded D1 candidate pass; digest reuse; query/work limits; measured
  concurrency and production-shaped budgets; no request-time crawl or remote
  scanning dependency.

## 13. Operational burden

**Material concern: Yes. Severity: Medium–High. Likelihood: Medium.**

- **What could go wrong:** staff and support could spend time interpreting
  false positives, rule changes, package ownership, Tenant exceptions, and
  historical waiver records.
- **Why it matters:** small ministry teams cannot babysit a compliance queue,
  and Asym should not need specialists for every content update.
- **Evidence:** automated results are incomplete and contextual; D31 already
  owns real operational exceptions.
- **Permanent prevention:** a named platform rule owner; small catalog; plain
  cause-owner routing; no tenant configuration; no mandatory review queue;
  aggregate false-positive review; D31 only for verified regressions.

## 14. Observability gaps

**Material concern: Yes. Severity: High. Likelihood: Medium.**

- **What could go wrong:** Asym may not notice that checks are slow, broken,
  noisy, frequently kept as written, or unusable by disabled authors.
- **Why it matters:** green automated tests can coexist with a frustrating or
  inaccessible authoring journey.
- **Evidence:** current CMS tests prove shell visibility, not focus, keyboard,
  zoom, reflow, screen-reader behavior, or issue repair; Web Studio is absent
  from the general axe suite.
- **Permanent prevention:** content-free aggregate checker latency/failure,
  locate/repair success, repeat finding, and false-positive signals; committed
  behavioral tests; manual assistive-technology passes; moderated disabled-user
  studies. Never rank Tenants or staff.

## 15. Dependency and integration risks

**Material concern: Yes. Severity: High. Likelihood: Medium.**

- **What could go wrong:** Payload hooks, an internal v4 build, browser APIs,
  axe rules, package renderers, or an AI/scanner provider can change results or
  bypass behavior.
- **Why it matters:** a dependency upgrade could silently expand blocking or
  leak private content.
- **Evidence:** Payload's public docs are not proof of Core's exact internal
  build; Sanity and Webflow both disclose validation coverage gaps.
- **Permanent prevention:** exact-pin adapter and upgrade qualification; stable
  product semantics; provider kill switch; manual verification; no external
  provider on the release-critical path; Payload/axe remain mechanisms, not
  authority.

## 16. Migration and upgrade risks

**Material concern: Yes. Severity: High. Likelihood: High.**

- **What could go wrong:** imported legacy sites can generate thousands of
  suggestions; old packages may lack new evidence; rule upgrades can resurrect
  every historical item.
- **Why it matters:** onboarding from another CMS could become practically
  impossible and create a misleading mountain of `debt`.
- **Evidence:** D29 stages varied legacy content privately, and comparable CMS
  checkers have incomplete or changing rule coverage.
- **Permanent prevention:** group imported suggestions by root cause and source;
  keep them non-blocking unless a prior source invariant applies; baseline
  unchanged fingerprints; phase rule-version activation; require package
  compatibility evidence; never create one durable issue row per finding.

## 17. Other development hazards

**Material concern: Yes. Severity: Critical. Likelihood: Medium.**

- **What could go wrong:** content can change after checking; a schedule can
  become stale; checker and compiler versions can skew; a concurrent editor can
  overwrite a review; a repair can publish unexpectedly.
- **Why it matters:** the wrong content or package could activate despite a
  seemingly valid result.
- **Evidence:** D1 and D12 already use exact revisions, one active editor, and
  expected-head activation because these races are realistic.
- **Permanent prevention:** bind mandatory proof to D1's exact candidate and
  compiler/rule/package digests; recheck scheduled execution; use expected-head
  CAS; reject stale editor writes; make every correction an explicit successor;
  preserve the last live generation.

## Ruthless synthesis

### Must be fixed in the D32 contract now

1. State the non-policing responsibility boundary explicitly.
2. Replace a broad `accessibility blocker` category with three typed classes:
   `Details to finish`, `Suggestion`, and `Technical issue`.
3. Preserve D9, D11, D27, security, privacy, and D1 gates exactly; D32 may not
   silently create new subjective blockers.
4. Keep Save, autosave, recovery, undo, and Preview available.
5. Let suggestions publish without attestation, justification, waiver, or an
   extra modal.
6. Prohibit scores, compliance claims, Tenant rankings, legal copy, and generic
   approval workflows.
7. Make D1 authoritative across UI, API, import, schedule, dynamic, reusable,
   and package paths.
8. Keep findings derived and exact-fingerprint continuity bounded; create no
   issue database or mutable compliance truth.
9. Route platform/package problems to their owner and editorial choices to the
   Tenant.
10. Keep accepted editorial suggestions out of D31.

### Must be proved before activation

1. Disabled authors complete create, edit, Preview, review, Publish, and
   recovery journeys without coaching.
2. Keyboard, focus, screen-reader, touch, 320-pixel reflow, 400% zoom, forced
   colors, and reduced motion cover Web Studio itself.
3. UI, REST, GraphQL, Local API, import, schedule, reusable, dynamic, locale,
   and package paths yield consistent typed results.
4. Occasional nonprofit staff distinguish a suggestion, incomplete structured
   detail, and platform-owned defect without help.
5. Healthy Pages receive no interruption and unchanged suggestions do not
   repeatedly interrupt later releases.
6. Checker failure, stale candidates, package defects, and false positives
   preserve the current live Site and show the correct owner.

### Address soon without broadening D32

- improve rule copy or suppression granularity only from observed staff
  confusion;
- qualify optional AI suggestions separately if they materially reduce effort;
- add new semantic checks only through the owning domain contract and measured
  evidence; and
- improve package and component prevention so fewer staff findings exist.

### Monitor without policing

- time to locate and repair;
- repeated finding and false-positive rate;
- `Keep as written` rate by rule family;
- checker latency and availability;
- technical issue owner and recovery time; and
- moderated task completion and comprehension.

Never create Tenant accessibility rankings, staff-performance reports,
compliance leaderboards, rendered-content telemetry, or legal-risk scores.

## Final recommendation

Adopt the amended C-prime-R formulation in the D32 decision brief. It is the
only option that simultaneously preserves Tenant creative authority, makes the
accessible path easy, keeps Asym accountable for its own machinery, avoids
false automated certainty, and fits D1/D9/D11/D27/D31 without adding a second
workflow or release authority.
