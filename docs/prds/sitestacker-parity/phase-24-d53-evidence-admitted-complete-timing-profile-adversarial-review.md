# Phase 24 D53 — Evidence-Qualified Complete Timing-Pair Proposals

- **Status:** Founder Option 1 adjudicated; documentation-only release contract
- **Founder direction:** Remain Off with no UI/runtime until each complete pair
  independently passes the D47 evidence gate
- **Disposition:** **Accept with required amendments**
- **Date reviewed:** 2026-08-29
- **Scope:** exact complete timing-pair evidence, repository qualification decision,
  ownership, review, privacy, validity, rejection/retirement, release gating,
  traceability, minimal future UX, authorization, RLS implications, migration,
  proof, monitoring, and D54
- **Non-scope:** no numeric pair, runtime registry, policy row, schema, migration,
  OpenSpec delta, feature flag, experiment, reminder key/content/channel,
  provider request, job, telemetry pipeline, research participant data, or UI

## Executive adjudication

Option 1 is the only safe decision. It needs one crucial clarification:
“evidence gate” is not a runtime approvals feature, database workflow, remote
configuration service, feature flag, or production experiment. It is a
versioned, reviewed, privacy-minimized repository release artifact and contract.
Its absence is a complete valid no-build outcome: Core remains reminder-free
and exposes no Off-only placeholder.

The corrected decision is:

> A complete timing profile is one exact versioned code-owned positive
> whole-second **(wait_for_seconds, useful_for_seconds)** pair governed by
> D47–D52. No pair exists merely because it is plausible, conventional,
> requested by one Tenant, present in vendor documentation, or useful for an
> experiment. Until one exact pair independently passes every D47 gate, Core
> remains Off: no profile identifier, registry constant, policy/default row,
> migration, API, job, event, message key, provider artifact, feature flag,
> disabled/Off-only UI, Coming soon copy, or production behavior is permitted.
>
> Evidence qualification requires one immutable version-controlled **D53 timing-pair
> evidence decision** reviewed through an ordinary repository PR. The artifact
> identifies one immutable **research_candidate_id**, protocol version, exact
> pair, and context—never a product profile ID/revision; links the preregistered,
> time-stamped research plan; records the target users/workflow/context,
> no-build alternatives, recruitment and exclusions, methods, exact
> preregistered success/stop criteria, aggregate results, contradictions,
> limitations, accessibility/localization/mobile/low-bandwidth proof,
> privacy/fatigue/harm findings, source-data/technical simulations, reviewer
> decisions, evidence locations/hashes, material-change invalidation triggers,
> and final qualified or not-qualified disposition. After qualification,
> ordinary releases validate the durable minimized local decision/provenance;
> they do not require live raw-evidence/vendor access. It contains no participant
> identity, raw response, recording, transcript, request detail, or secret.
>
> Access Product, UX Research, IAM, Privacy/Security, Accessibility, and
> Architecture independently review their D47 dimensions. Missing,
> stale, partial, materially contradictory, unrepresentative, inaccessible, or
> harmful evidence yields **not evidence-qualified**. One approval, average score, vendor
> analogy, founder preference, support count, request-age distribution,
> open/click rate, or operational feasibility cannot compensate for a failed
> required dimension. Rejection and no-build are valid outcomes; no beta,
> override, canary send, manual send, or production experiment substitutes.
>
> The evidence decision owns only whether the exact pair becomes an
> **evidence-qualified timing-pair proposal** eligible for later design review.
> It never activates a profile/Tenant or is read at runtime. Only a later
> explicit pre-activation decision and complete implementation/release contract
> may turn that proposal into an **activated access-review timing profile**—an
> immutable code contract with a newly assigned product profile identity/
> revision linking back to **research_candidate_id**. A Tenant may later select only such an activated
> profile through its **selected policy head**; each D43 request pins the
> profile identity/revision, both pair values, and derived temporal facts in
> its **pinned source tuple**, never a research artifact.
>
> Material change to pair values, source meaning, tested semantic/interaction
> contract, target user/cohort,
> D43/D44 workflow, channel/admission semantics, privacy/accessibility posture,
> or evidence limitations that could affect comprehension, fatigue, fairness,
> or harm invalidates reuse and requires a new reviewed
> evidence decision. Historical decisions remain append-only release evidence;
> correction, retirement, or supersession uses a successor artifact and never
> rewrites an already pinned source tuple. An ordinarily retired profile is
> absent from new offering/selection/reselection APIs, but a Tenant whose
> current selected policy head references it continues prospective D43 source
> admission until deliberate policy change; UI shows it read-only/current and
> required decoder/compatibility/history remains. D53 does
> not decide urgent safety withdrawal or current-head mutation; a later explicit
> pre-activation decision must close that path before any profile activates.
> Editorial, accessibility, and localization corrections that preserve tested
> meaning/interaction use normal content/accessibility review and create no new
> research candidate or product profile.
>
> Evidence qualification does not authorize implementation or activation. All
> remaining OpenSpec, content/channel, security, migration, performance,
> accessibility, release, and complete-Tenant rollout gates must still close.
> Production reminders cannot be used to discover whether the pair was safe or
> useful; research uses consented, privacy-reviewed discovery, prototypes,
> scenario/usability work, and no-send/synthetic operational simulations.
>
> Current UX remains unchanged. No empty Courtesy reminder card, Off-only
> control, disabled radio, waitlist, upsell, tooltip, navigation, or screen-
> reader placeholder ships. If one pair eventually earns all gates, the first
> complete UI may expose Off plus one proven cadence card in the D44/D47-
> governed future route-addressable Base Maia Access requests settings surface. The card
> represents the indivisible pair, never reveals a second usefulness control,
> and says **If Asym cannot create the reminder soon enough, it skips it instead
> of sending it late.**

This is a strong permanent no-build-by-default contract, not a promise to
eventually ship reminders.

## Problem validity and strongest alternatives

The problem is governance, not runtime scheduling: D52 deliberately selects no
number, while an arbitrary number would create noise, false deadline meaning,
and hidden reliability policy. Core needs a falsifiable way to distinguish an
evidence-supported complete pair from convention or preference.

The strongest alternative is choosing one conventional pair now and validating
it during rollout. It is simpler on paper, but production becomes the
experiment; recipients cannot meaningfully consent to reminder pressure and a
bad pair has already generated attention. Tenant-configurable pairs are worse:
they externalize an unresolved product/research problem into noisy two-
dimensional configuration and unbounded support/testing combinations.

Option 1 is accepted because absence is safe, evidence is reviewed before
runtime, and later architecture remains small. It does not freeze a numeric
threshold, sample size, statistical method, artifact file format, or research
vendor before an approved protocol chooses them.

## Evidence classification

### Verified repository facts

- [Identity and Access](../../../openspec/specs/identity-and-access/spec.md)
  requires server-derived Tenant/identity/capability and application
  authorization with RLS defense in depth.
- [Workflow Orchestration](../../../openspec/specs/workflow-orchestration/spec.md)
  keeps product claims/authorization/audit authoritative and executors
  identifier-only.
- [Platform Boundaries](../../../openspec/specs/platform-boundaries/spec.md)
  keeps permission-sensitive operations server-side and one shared task model.
- [Platform Principles](../../../openspec/specs/platform-principles/spec.md)
  prioritizes safety, clarity, accessibility, coherence, and reliability.
- [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)
  reserves exact complete candidate qualification to D53/D47 evidence.
- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
  preserves recipient-specific engagement and forbids source state from
  fabricating read/archive behavior.
- [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
  keeps task coordination distinct from notification presentation/engagement.
- D43 has no deadline/default decision and D44 already supplies the complete
  source lane, task, and required in-product attention.
- D47 explicitly requires independently approved representative research,
  root-problem/no-build comparison, preregistered criteria, comprehension,
  accessibility, privacy/fatigue/harm, source-data proof, and Off on failure.
- D48–D52 define prospective admission, one occurrence, current recipients,
  immutable **not_before**, immediate Off, and bounded **useful_until**, but no
  executable pair.
- Current D47 release audits explicitly prohibit placeholder artifacts and say
  research is a separately approved, time-bounded, privacy-reviewed study—not
  runtime telemetry.
- No D43–D53 reminder/profile runtime, schema, policy row, channel, or UI ships.

### Verified current official primary evidence

- [GOV.UK learning user needs](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs)
  says needs should come from user research rather than assumptions and should
  focus on the problem rather than a preferred solution.
- [GOV.UK planning user research](https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service)
  recommends explicit questions, relevant user groups/methods, inclusive
  recruitment, and research rounds that produce strong reliable evidence.
- [GOV.UK planning a research round](https://www.gov.uk/service-manual/user-research/plan-round-of-user-research)
  requires actionable objectives, assumptions to test, informed participant
  selection/consent, accessible prototypes, practice, and analysis planning.
- [GOV.UK simple-to-use service standard](https://www.gov.uk/service-manual/service-standard/point-4-make-the-service-simple-to-use)
  calls for simple, comprehensible services tested with actual/potential users
  across relevant devices.
- [GOV.UK informed-consent guidance](https://www.gov.uk/service-manual/user-research/getting-users-consent-for-research)
  requires understandable informed consent, purpose-limited data use, careful
  management, withdrawal handling, and deletion when no longer needed.
- [OSF registration guidance](https://help.osf.io/article/330-welcome-to-registrations)
  describes preregistration as a time-stamped read-only study plan recorded
  before data collection/analysis. Core need not use OSF, but the principle
  supports immutable protocol evidence.
- [NIST SSDF 1.1](https://csrc.nist.gov/pubs/sp/800/218/final) recommends
  archiving release files and supporting integrity/provenance data. Its
  security scope is narrower than product research, but supports retaining a
  reviewable release evidence trail.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) remains the accessibility baseline
  for research prototypes and any later complete UI.

These sources support research before implementation, representative testing,
privacy/consent, simplicity, and durable release evidence. None supplies a
timing pair or makes a research result universally valid.

### Reasonable inferences

- A repository artifact reviewed with governing docs is more durable and
  traceable than chat approval, a ticket checkbox, dashboard, or wiki page.
- Separating raw research storage from the minimized decision artifact reduces
  privacy risk without hiding the evidence basis.
- One proven card plus Off is easier to understand than independent wait and
  usefulness controls.

### Product judgments and unresolved unknowns

- The exact artifact template, repository path, schema/validator, CODEOWNERS,
  research methods, sample rationale, and criteria belong to the approved
  protocol/design; D53 freezes outcomes and minimum contents, not tooling.
- No exact pair, reminder need, content, channel, fatigue rate, or acceptable
  tradeoff is currently proved.
- Candidate-pair nomination belongs to the later approved preregistered
  research design, not D54. D54 decides local reminder presentation.
- Urgent safety withdrawal/current-head behavior remains unresolved and blocks
  every future profile activation until an explicit later decision closes it.

## Current behavior, intended behavior, and permanent path

| Area                                           | Current behavior         | D53 intended contract                                      | Permanent path                                            |
| ---------------------------------------------- | ------------------------ | ---------------------------------------------------------- | --------------------------------------------------------- |
| Pair registry                                  | None                     | Empty/Off until qualified proposal and explicit activation | Later activated code contracts plus retired compatibility |
| Evidence                                       | D47 requirements in docs | One reviewed decision per exact pair/revision              | Version-controlled release artifact                       |
| Raw research                                   | None in repo             | Approved external research store only                      | Consent/retention-controlled source material              |
| Runtime admission                              | None                     | Evidence artifact never read at runtime                    | Static release verification then product code             |
| Tenant policy                                  | None                     | No row/default/selection before complete feature           | Later immutable source policy                             |
| UI                                             | None                     | No Off-only/disabled/placeholder surface                   | Future Off + activated card(s) only after all gates       |
| Rejection/no evidence                          | Reminder-free            | Valid terminal no-build posture                            | Preserve decision/limits; no workaround                   |
| Qualification-decision withdrawal/supersession | None                     | Successor artifact; blocks future qualification/reference  | Historical evidence retained; runtime governed separately |

## Domain model, ownership, and invariants

### Canonical terms

**Complete timing profile:** One exact versioned code-owned positive
whole-second **(wait_for_seconds, useful_for_seconds)** pair plus D47–D52 meaning.

**Evidence decision artifact:** A privacy-minimized, version-controlled,
reviewed repository release record that qualifies or does not qualify exactly
one `research_candidate_id`/protocol version/pair/context. It is documentation/
release evidence, not product data.

**Evidence-qualified timing-pair proposal:** An exact pair/context whose
required dimensions pass and whose evidence decision permits later design
review only. It is not an executable/selectable profile.

**Not evidence-qualified:** Missing, failed, stale, partial, contradictory, or out-of-
scope evidence. Before activation/new selection, the only effect is no profile/
no build.

**Activated access-review timing profile:** A later immutable code contract
created only after evidence qualification and every explicit pre-activation
decision/release gate; it may be selectable by a Tenant policy.

**Retired activated profile:** A formerly activated profile removed from new
choices/API selection while retained as a read-only executable definition for
Tenants whose selected policy head still references it and for pinned source
tuple history.

### Ownership matrix

| Fact                                   | Owner                                                    | Consumers                            | Non-owners                     |
| -------------------------------------- | -------------------------------------------------------- | ------------------------------------ | ------------------------------ |
| Root problem/research protocol/results | UX Research + Access Product under D47                   | evidence reviewers                   | runtime, provider              |
| Privacy/consent/raw evidence           | approved research system + Privacy                       | authorized researchers/review        | repository artifact, analytics |
| Pair evidence qualification            | D53 repository decision + D47 review domains             | governance/design audit              | feature flag, DB, Tenant       |
| Activated profile support              | later versioned code registry after explicit activation  | policy editor/D43 source transaction | evidence artifact at runtime   |
| Tenant selection                       | later Phase 12 selected policy head                      | D43 source transaction               | research review                |
| Historical pinned facts                | D43 pinned source tuple                                  | claims/audit                         | current artifact/registry      |
| Implementation/activation              | later explicit decisions/OpenSpec/release/rollout owners | product/runtime                      | evidence qualification alone   |

### Domain invariants

1. D53 creates no current artifact except this decision document.
2. No timing-pair candidate is currently evidence-qualified and no access-
   review timing profile is activated.
3. Missing/failed/stale evidence means no new profile, choice, UI, or runtime.
4. One evidence decision addresses one exact pair/revision and declared context.
5. Both numeric values are preregistered before confirmatory collection/analysis.
6. Every D47 required dimension independently passes; no averaging/compensation.
7. Evidence qualification/proposal and runtime activation/profile are separate.
8. Raw/person-level research data never enters the repository decision.
9. Decision artifacts are versioned/history-preserving; changes use successors.
10. Later executable registry contains only activated profiles exactly derived
    from evidence-qualified proposals plus retained retired definitions.
11. Tenant selected policy head can select only activated non-retired profiles.
12. Existing D43 pinned source tuples never change when evidence/registry changes.
13. Material context/meaning/pair change requires new evidence review.
14. No production reminder/experiment substitutes for prequalification evidence.
15. No placeholder UI, schema, flag, table, job, or key exists while empty.
16. Rejection/no-build is a valid final outcome, not an operational alert.
17. Every artifact/link/review is privacy-minimized, traceable, and integrity-
    checked across ordinary and privileged repository/release paths.

## Evidence lifecycle, races, and failure

### Repository lifecycle

These are documentation/release states, not runtime rows:

1. **Absent:** no timing-pair candidate/research artifact; Core remains reminder-free.
2. **Preregistered candidate:** immutable **research_candidate_id**, protocol
   version, exact pair, and context recorded before confirmatory collection;
   still not evidence-qualified and creates no product identity/artifact.
3. **Evidence under review:** minimized result package complete; still no pair.
4. **Rejected/insufficient:** durable decision and limitations; no pair/build.
5. **Evidence-qualified proposal:** every D47 review domain/evidence dimension
   passes exact pair/context; later design may reference it but nothing activates.
6. **Ordinarily retired/superseded:** successor blocks new selection/reselection;
   a current selected head continues prospective D43 admission, remains
   read-only/current in UI, and prior tuples remain executable until deliberate
   policy change. Urgent safety withdrawal is not this state.

Forbidden transitions include absent to runtime, partial review to qualified,
result-driven retroactive criteria, one pair's evidence authorizing another,
artifact merge activating a Tenant, rejected to beta/experiment, raw data into
repo, or withdrawal rewriting history.

### Required race and failure outcomes

| Race/failure                                                                                                          | Required result                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pair changes after preregistration                                                                                    | New candidate/protocol; old evidence cannot follow                                                                                                                                   |
| Criteria change after results seen                                                                                    | Not evidence-qualified; new preregistered study required                                                                                                                             |
| One required D47 evidence dimension lacks independent approval                                                        | Not evidence-qualified                                                                                                                                                               |
| Required raw evidence unavailable during initial qualification/planned rereview, or local decision integrity mismatch | Qualification/rereview blocks; repair provenance, no fallback                                                                                                                        |
| Cohort incomplete/unrepresentative                                                                                    | Not evidence-qualified or explicitly narrower new context                                                                                                                            |
| Harm/privacy/accessibility fails despite task success                                                                 | Not evidence-qualified                                                                                                                                                               |
| Two evidence PRs claim same **research_candidate_id**/protocol version                                                | One canonical review or conflict; never two authorities                                                                                                                              |
| Qualified proposal/activated code contract differs                                                                    | Release blocked; neither silently corrected                                                                                                                                          |
| Artifact merged while other activation gate open                                                                      | No runtime/UI; qualification alone has no effect                                                                                                                                     |
| Evidence later contradicted/material context changes                                                                  | Successor retirement/review; block new selection while preserving current-head/history truth                                                                                         |
| Urgent safety evidence arises for a currently referenced profile                                                      | D53 does not choose automatic Off/current-head action; use existing incident containment only and block activation until a later explicit decision predefines the product transition |
| Withdrawal races new release                                                                                          | Release check fails closed; no new selection                                                                                                                                         |
| Existing request has pinned source tuple from an activated pair                                                       | Tuple unchanged; runtime response uses separately governed source safety                                                                                                             |
| Repository/CI unavailable                                                                                             | No new qualification/review/release change; current reminder-free/current governed state remains safe                                                                                |
| Raw data lawfully deleted or research vendor unavailable                                                              | Durable minimized local decision/provenance remains ordinary release input; no silent deactivation; planned rereview waits if source evidence is required                            |
| Reviewer account/branch compromised                                                                                   | Repository security incident; invalidate untrusted approval and re-review                                                                                                            |

## UX/UI contract

### Current

D53 adds no Courtesy reminder summary, Off card, disabled control, placeholder,
Coming soon message, waitlist, tooltip, status, docs link, navigation, flag, or
screen-reader-only promise. An empty choice set is represented by no product
surface, not an Off-only settings form.

### Research

Research uses consented prototypes/scenarios/no-send simulations outside
production. Prototype controls do not imply roadmap commitment and contain no
real protected request data. Research includes authorized administrators,
coordinators, holders/review subjects where relevant, distributed/volunteer
ministries, international locales/RTL, disabled/assistive-technology users,
mobile/low-bandwidth conditions, and deliberate-waiting/no-build cases.

### Later complete UI

Only after one exact proposal is evidence-qualified, turned by later explicit
decisions into an activated access-review timing profile, implemented through all
remaining gates, and activated for a complete compatible Tenant may the
future governed route-addressable Base Maia Access requests settings show Off
plus the activated card.
The card is one indivisible pair, displays the evidence-approved cadence label,
keeps D50 no-due/no-access copy, and includes **If Asym cannot create the
reminder soon enough, it skips it instead of sending it late.** It exposes no
independent usefulness value, custom number, advanced mode, experiment badge,
evidence score, participant count, or approval workflow.

An available **How timing works** disclosure is collapsed by default and shows
the selected exact pair in plain language—for example, **Eligible after 7
elapsed days; if it cannot be created within the next 7 days, it is skipped.**
Opening it is optional; availability and content are required. It never exposes
internal field names. Meaning-preserving editorial, accessibility, and
localization corrections follow normal review rather than requalification.

If that activated profile is later ordinarily retired while still referenced
by the Tenant's selected policy head, the future summary remains visible and
truthfully read-only/current; it is absent from new selection/reselection. The
Tenant deliberately changes policy to Off or another activated profile. D53
does not invent an automatic replacement.

## Normative requirements

- **D53-R1:** D53 adds governing documentation only and creates no executable
  or product pair/profile, registry, runtime, schema, migration, OpenSpec, flag,
  event, job, key, channel, telemetry, or UI.
- **D53-R2:** Until an exact complete pair passes D47/D53, Core remains
  reminder-free and exposes no Off-only/disabled/placeholder surface.
- **D53-R3:** One timing-pair candidate/proposal is exactly one versioned
  positive whole-second **(wait_for_seconds, useful_for_seconds)** pair; only a
  later activated access-review timing profile is executable/selectable.
- **D53-R4:** Pair values and confirmatory criteria are preregistered before
  collection/analysis; result-driven substitution creates a new study.
- **D53-R5:** Evidence qualification uses one version-controlled privacy-
  minimized repository decision for exactly one **research_candidate_id**,
  protocol version, exact pair, and context.
- **D53-R6:** The artifact records research candidate identity/pair, protocol provenance,
  scope/cohorts/methods/criteria/results/limits/contradictions, all D47
  dimensions, reviewer dispositions, integrity links, and invalidation triggers.
- **D53-R7:** Raw/person-level recordings/transcripts/responses/request details/
  contacts/secrets never enter the repository artifact.
- **D53-R8:** Research data uses approved consented purpose-limited storage,
  access, retention, withdrawal, deletion, and incident controls.
- **D53-R9:** Access Product, UX Research, IAM, Privacy/Security, Accessibility,
  and Architecture independently review their exact D47 dimensions.
- **D53-R10:** Missing/failing/stale/partial/contradictory/unrepresentative/
  inaccessible/harmful evidence is not evidence-qualified; no averaging/override.
- **D53-R11:** Vendor defaults, one Tenant/founder request, age/open/click/
  completion/support data, feasibility, or convention cannot independently pass.
- **D53-R12:** No production reminder, beta, canary send, manual send, feature
  flag, or live experiment may generate qualification evidence.
- **D53-R13:** Evidence qualification creates a proposal for later static design
  reference only and neither
  implements, activates, migrates, seeds, configures, nor messages anything.
- **D53-R14:** A later executable registry contains only explicitly activated
  access-review timing profiles derived exactly from qualified proposals plus
  retained retired definitions needed by selected policy heads/pinned tuples;
  only activated non-retired profiles appear in new choices/API selection.
- **D53-R15:** Evidence artifacts are never runtime-read authority; later code
  registry, Tenant selected policy head, and D43 pinned source tuple retain
  distinct ownership and never pin a research artifact.
- **D53-R16:** Artifact correction/retirement/supersession uses a successor.
  An ordinarily retired activated profile is absent from new offering/
  selection/reselection API, but a Tenant's current selected head continues
  prospective D43 source admission until deliberate policy change; UI and
  decoder/compatibility/history remain truthful.
- **D53-R17:** Pair/meaning/tested interaction/cohort/workflow/channel/privacy/
  accessibility/evidence-limit change that could affect comprehension, fatigue,
  fairness, or harm requires requalification; meaning-preserving editorial,
  accessibility, and localization corrections use normal review and mint no ID.
- **D53-R18:** Evidence qualification does not close content/channel/security/OpenSpec/
  migration/performance/accessibility/rollout gates; no profile activates until
  a later explicit decision governs urgent safety retirement/current-head behavior.
- **D53-R19:** Rejection/no evidence/no-build is a valid durable outcome and
  triggers no alert, fallback pair, workaround, or implementation.
- **D53-R20:** D47-domain reviewers act through repository identity/review controls;
  no application capability, Tenant role, service account, or caller field can
  evidence-qualify a candidate or activate a profile.
- **D53-R21:** Future product writes still require Phase 12 application auth,
  same-Tenant constraints, RLS **USING/WITH CHECK**, and privileged parity;
  evidence qualification grants no runtime authority.
- **D53-R22:** Repository/research/support paths minimize data and audit access,
  changes, approvals, provenance, retention, withdrawal, and incident response.
- **D53-R23:** Current UX remains absent; later UX shows only Off plus complete
  activated selectable card(s), while a retired current profile remains truthful
  read-only for affected Tenants, never as an independently selectable duration.
- **D53-R24:** Later card semantics preserve courtesy/still-waiting,
  no-due/access, and skip-instead-of-late meaning plus accessibility,
  localization, mobile, and low-bandwidth proof without literal-string coupling.
  A collapsed-by-default but available **How timing works** disclosure states
  the exact selected pair in plain language and never internal field names.
- **D53-R25:** Evidence artifacts contain no runtime SLA, deadline, urgency,
  person score, pair optimization target, or claim that qualification proves success.
- **D53-R26:** Build/release checks are bounded deterministic repository checks,
  over durable minimized local decision/provenance, not network-dependent raw-
  evidence queries, runtime queries, or a generic policy engine.
- **D53-R27:** No placeholder identifier/enum/column/API/type/fixture is added
  “for future compatibility.” Prequalification uses **research_candidate_id**;
  product profile identity/revision is assigned only by a later activation
  package linking back to the qualified candidate.
- **D53-R28:** Rollout after later implementation is additive/deny-first/
  complete-Tenant/killable and cannot use production to finish evidence.
- **D53-R29:** D53-R/AC identifiers trace through evidence, ADR/OpenSpec/design/
  tickets/code/tests/release with exact pair/context/disposition consistency.
- **D53-R30:** Candidate-pair nomination remains inside later preregistered
  research design. D54 must choose between a distinct recipient-specific
  perceptually/programmatically grouped reminder item and no new in-product
  item. ADR-0027/ADR-0183 rule out resurface/reset/task mutation.

## Ruthless adversarial review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

| What could go wrong                                                   | Why it matters                                                                         | Severity | Likelihood       | Evidence/reasoning                                                                                    | Effect on answer                      | Permanent fix                                                                           | Exact specification language                                                                                                                                  |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------- | ---------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The gate could become process theater around a reminder nobody needs. | A polished packet can validate a chosen solution instead of the ministry root problem. | High     | High without D47 | D47 requires no-build/IA/routing comparison; GOV.UK says start from researched need, not assumptions. | Narrows Option 1; does not reject it. | Make root-problem/no-build proof a mandatory independent dimension and accept no-build. | “No pair becomes an evidence-qualified proposal unless evidence proves the reminder solves a material unmet need better than no-build and IA/routing repair.” |

### 2. Brittleness

**Material concern: Yes.**

| What could go wrong                                                                        | Why it matters                                              | Severity | Likelihood                     | Evidence/reasoning                                                                      | Effect on answer                                           | Permanent fix                                                                                                          | Exact specification language                                                                                                                                       |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | -------- | ------------------------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Approval may live in chat/ticket/wiki, links may rot, or a pair may change after research. | Release cannot prove what was actually tested and approved. | Critical | High without artifact contract | Git-reviewed governing docs are durable; preregistration fixes protocol before results. | Requires versioned immutable artifact and integrity links. | One research candidate/pair/context per repository decision; value/context change requires successor and new evidence. | “Qualification requires one durable local decision for an immutable research_candidate_id, protocol version, exact pair, and context; change creates a successor.” |

### 3. Technical debt

**Material concern: Yes.**

| What could go wrong                                                                                                             | Why it matters                                                                                 | Severity | Likelihood                       | Evidence/reasoning                                                                   | Effect on answer                   | Permanent fix                                                                        | Exact specification language                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| A generic approvals service, evidence table, remote registry, or feature-flag workflow could be built for one release decision. | It creates dual truth, operations, auth/RLS, and migration burden before product value exists. | High     | High if “gate” is read literally | User explicitly requires a repo/release artifact; D47 authorizes docs-only research. | Rejects runtime gate architecture. | Ordinary PR-reviewed artifact plus bounded CI release check only after later design. | “D53 creates no runtime workflow/table/API/flag/dashboard; evidence is release documentation, never product state.” |

### 4. Edge cases

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                     | Why it matters                                                              | Severity | Likelihood        | Evidence/reasoning                                    | Effect on answer                                    | Permanent fix                                                                                                   | Exact specification language                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------- | ----------------- | ----------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Pair/criteria changes, missing domain review, conflicting studies, narrower cohort, withdrawn consent/data, artifact mismatch, or simultaneous PRs can produce ambiguous qualification. | An unsupported pair could enter code or valid evidence could be overstated. | Critical | High in aggregate | These are normal research/repository lifecycle cases. | Requires explicit states/races/fail-closed results. | One canonical exact decision, no compensating evidence, narrower scope only when explicit, successor on change. | “Any unresolved identity, integrity, scope, criterion, D47 domain, or contradiction keeps the candidate not evidence-qualified.” |

### 5. Footguns

**Material concern: Yes.**

| What could go wrong                                                                                           | Why it matters                                                                    | Severity | Likelihood | Evidence/reasoning                                   | Effect on answer               | Permanent fix                                                    | Exact specification language                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Developers may add placeholder enums/UI, seed Off, choose illustrative numbers, or treat merge as activation. | “Harmless scaffolding” becomes compatibility debt and accidental roadmap promise. | High     | High       | D47 already prohibits any artifact while unresolved. | Adds zero-artifact guardrails. | Architecture release audit and forbidden-import/schema/UI tests. | “Before activation design, prequalification uses research_candidate_id only; no product profile artifact exists and artifact merge has zero runtime effect.” |

### 6. Tenant safety

**Material concern: Yes.**

| What could go wrong                                                                                                 | Why it matters                                              | Severity | Likelihood | Evidence/reasoning                                                              | Effect on answer                                                                 | Permanent fix                                                                       | Exact specification language                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One Tenant's preference/evidence may be generalized, or research may expose another Tenant's staff/request context. | Cross-Tenant product policy and disclosure harm ministries. | Critical | Medium     | D47 requires representative market evidence; Core requires exact Tenant safety. | Requires aggregated/minimized cross-context proof without shared protected data. | No Tenant-specific qualification or raw data; later product auth remains unchanged. | “Evidence qualification is product-level and privacy-minimized; it grants no Tenant/runtime authority and contains no protected Tenant/request identity.” |

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

| What could go wrong                                                                          | Why it matters                                                                | Severity | Likelihood          | Evidence/reasoning                                                                    | Effect on answer                                         | Permanent fix                                                                                                         | Exact specification language                                                                                                  |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------- | ------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Evidence review could be modeled as a DB grant or used to bypass later application auth/RLS. | D47-domain reviewers would accidentally gain runtime policy/access authority. | Critical | Low if kept in repo | Governing auth OpenSpec separates product capabilities; evidence is not product data. | Explicitly separates repository review and runtime auth. | No D53 table/RLS now; later Phase 12 writes still derive Tenant/actor and enforce USING/WITH CHECK/privileged parity. | “Evidence qualification grants no application capability, role, policy selection, request visibility, or database privilege.” |

### 8. Overengineering

**Material concern: Yes.**

| What could go wrong                                                                                                                  | Why it matters                                                               | Severity | Likelihood | Evidence/reasoning                                                         | Effect on answer | Permanent fix                                                                             | Exact specification language                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Cryptographic signing service, research CMS, workflow states, scoring rubric engine, or universal experiment framework may be added. | Complexity exceeds the one-pair release decision and becomes permanent debt. | Medium   | Medium     | Git PR identity/history and approved research storage already cover needs. | Narrows tooling. | Minimal template, links/hashes, named reviewers, deterministic checks; no custom service. | “D53 freezes required evidence/outcomes, not a generic governance platform, database schema, signature service, or research vendor.” |

### 9. UX/UI and user friction

**Material concern: Yes.**

| What could go wrong                                                                                                       | Why it matters                                                 | Severity | Likelihood               | Evidence/reasoning                                                           | Effect on answer                  | Permanent fix                                                                      | Exact specification language                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------- | ------------------------ | ---------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Off-only/disabled cards, evidence badges, separate duration fields, or experiment labels create noise and false promises. | Administrators cannot act and may infer a feature or deadline. | High     | High without prohibition | GOV.UK favors simple tested service; D47/D52 require quiet one-selection UX. | Keeps current UX entirely absent. | Render nothing until complete feature; later Off plus activated pair card(s) only. | “No activated profile means no surface; later cards hide internal fields and provide collapsed plain-language How timing works detail.” |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

| What could go wrong                                                                                                    | Why it matters                                                                | Severity | Likelihood | Evidence/reasoning                                               | Effect on answer                    | Permanent fix                                                                                                          | Exact specification language                                                          |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Research artifact, executable registry, Tenant policy, and request package may all be treated as one mutable registry. | Edits can change history or runtime can depend on documentation availability. | Critical | Medium     | D48–D52 require immutable code/profile/policy/package ownership. | Requires four explicit authorities. | Artifact qualifies a candidate proposal; activation assigns and code supports a profile; policy selects; request pins. | “No owner writes another owner's fact and runtime never reads the evidence artifact.” |

### 11. Hidden coupling

**Material concern: Yes.**

| What could go wrong                                                                                                          | Why it matters                                                         | Severity | Likelihood | Evidence/reasoning                                                       | Effect on answer                                                     | Permanent fix                                                                               | Exact specification language                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Qualification could depend on one research vendor, tool URL, Git host feature, channel, literal copy, or current app layout. | Tool/vendor change invalidates releases or silently broadens evidence. | High     | Medium     | Methods/tools are choices; semantic/interaction context limits evidence. | Keeps artifact tool-neutral/context-scoped without literal coupling. | Stable local decision/provenance and meaning-sensitive change triggers; replaceable stores. | “Lawful source deletion/outage does not deactivate a durable local decision; required source absence blocks initial qualification/planned rereview.” |

### 12. Failure modes

**Material concern: Yes.**

| What could go wrong                                                                                                                         | Why it matters                                                                              | Severity | Likelihood | Evidence/reasoning                                                                            | Effect on answer                                                                          | Permanent fix                                                                                                                                                                                  | Exact specification language                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI/repo/research store outage, link/hash mismatch, reviewer compromise, or raw-data deletion may occur during qualification/review/release. | Teams may bypass the gate, lose auditability, or wrongly deactivate a valid local decision. | High     | Medium     | Durable local release evidence and raw source research have different retention/availability. | Requires stage-specific fail-closed behavior without network-dependent ordinary releases. | Block initial qualification/activation or an intentionally opened rereview when its required source/integrity is unavailable; ordinary releases validate the durable minimized local decision. | “Required source/integrity failure blocks initial qualification/activation or an opened rereview; lawful deletion/vendor outage never silently deactivates a governed profile, makes ordinary release network-dependent, or creates behavior.” |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

| What could go wrong                                                                                                    | Why it matters                                                           | Severity | Likelihood | Evidence/reasoning                                                                                       | Effect on answer                      | Permanent fix                                                                                   | Exact specification language                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------- | ---------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Parallel PRs, replayed reviews, post-result criterion edits, or retirement/release races can produce two dispositions. | Exact pair may be qualified/activated without a single defensible order. | Critical | Medium     | Repository merges are ordered but semantics need unique research candidate and later profile identities. | Adds canonical identity/link/recheck. | Unique research_candidate_id/protocol decision, successor ordering, activation link validation. | “One canonical qualification wins and activation links exactly once; ordinary retirement blocks new selection/reselection while current selected heads and prospective D43 admission continue until deliberate change; urgent safety withdrawal remains separate.” |

### 14. Data integrity risks

**Material concern: Yes.**

| What could go wrong                                                                                            | Why it matters                                                        | Severity | Likelihood | Evidence/reasoning                                                                     | Effect on answer                                                    | Permanent fix                                                                                      | Exact specification language                                                                                       |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Pair values, protocol hash, results, context, D47 reviews, proposal, and activated code contract may disagree. | Wrong/unresearched duration ships and traceability becomes fictional. | Critical | Medium     | Several artifacts necessarily reference the same exact pair under distinct identities. | Requires exact qualification→activation link and immutable history. | Canonical serialization/validation, research candidate/profile identity separation, zero mismatch. | “Activated profile pair must exactly equal its qualified research_candidate_id decision; mismatch blocks release.” |

### 15. Security and privacy risks

**Material concern: Yes.**

| What could go wrong                                                                                                               | Why it matters                                                     | Severity | Likelihood | Evidence/reasoning                                                                   | Effect on answer             | Permanent fix                                                                                                | Exact specification language                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------- | ---------- | ------------------------------------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Repo may contain names, recordings, transcripts, contact details, request examples, consent records, secrets, or small-cell data. | Permanent Git history magnifies participant/ministry privacy harm. | Critical | Medium     | GOV.UK requires consent/purpose-limited management/deletion; Git history is durable. | Strictly minimizes artifact. | Aggregate safe results and opaque approved-store references only; secret/PII scanning and small-cell review. | “No raw/person-level/protected/secret research material enters Git, logs, tickets, PR comments, or generated release output.” |

### 16. Scalability and performance risks

**Material concern: Yes.**

| What could go wrong                                                                                                     | Why it matters                                           | Severity | Likelihood | Evidence/reasoning                                                  | Effect on answer                                            | Permanent fix                                                                                       | Exact specification language                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Unbounded proposals/evidence files, network-dependent CI, or all-history scans may slow releases and multiply UX/tests. | Governance becomes bypassed or unstable as options grow. | Medium   | Medium     | D47 allows a small finite set; release checks can be local/indexed. | Adds bounded registry/checks and option-cardinality review. | One first activation, small set only with evidence, local manifest index, deterministic validation. | “Release validation is bounded/local/deterministic; missing budget or excessive option count blocks addition.” |

### 17. Operational burden

**Material concern: Yes.**

| What could go wrong                                                                                            | Why it matters                                | Severity | Likelihood | Evidence/reasoning                                              | Effect on answer                                           | Permanent fix                                                                                     | Exact specification language                                                                                                        |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------- | ---------- | --------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Teams may need tribal knowledge to know who approves, where evidence lives, or how withdrawal affects release. | Gate becomes slow, inconsistent, or bypassed. | High     | Medium     | D47 already names reviewer disciplines and evidence dimensions. | Requires concise template/runbook and explicit non-effect. | Named owners, required fields, review checklist, successor/withdrawal process, no runtime repair. | “One documented repository workflow covers nomination→review→disposition→release reference→withdrawal without operational service.” |

### 18. Observability and auditability gaps

**Material concern: Yes.**

| What could go wrong                                                                                                | Why it matters                                                      | Severity | Likelihood | Evidence/reasoning                                                     | Effect on answer                                                         | Permanent fix                                                                                     | Exact specification language                                                                                             |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| A release may not prove which proposal/activation commit authorized a profile, or a local decision may be invalid. | Post-release diagnosis and governance cannot reconstruct authority. | High     | Medium     | NIST supports release/provenance evidence; Core requires traceability. | Adds local release provenance, not runtime telemetry/network dependence. | Record candidate decision, activated profile identity/revision, commits, and deterministic check. | “Every release archives the durable local qualification→activation link/check; runtime emits no D53 evidence telemetry.” |

### 19. Dependency and integration risks

**Material concern: Yes.**

| What could go wrong                                                                  | Why it matters                                                  | Severity | Likelihood | Evidence/reasoning                                                                | Effect on answer             | Permanent fix                                                                                         | Exact specification language                                                                       |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| OSF/research vendor/Git/CODEOWNERS/CI behavior may be assumed as semantic authority. | Vendor outage/schema/identity change could alter qualification. | High     | Low–Medium | Official sources are methodological comparators; repo decision is Core authority. | Keeps providers replaceable. | Approved source links/hashes and Core D47-domain disposition; no provider webhook/runtime dependency. | “External tools supply evidence/provenance only; Core's merged local decision owns qualification.” |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

| What could go wrong                                                                                                                | Why it matters                                                             | Severity | Likelihood                   | Evidence/reasoning                                                | Effect on answer                                                     | Permanent fix                                                                                                                          | Exact specification language                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------- | ---------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Placeholder schema may land before evidence, or a qualified proposal may auto-activate/seed Tenants; retirement may erase history. | Unsafe rollout creates reminders/catch-up and destructive history changes. | Critical | Medium during implementation | D48 new-only, D51 Off, D52 immutable tuples govern later runtime. | Requires explicit activation and retirement/current-head separation. | No product ID now; later activation is additive/deny-first/no-backfill, and ordinary retirement preserves current selected-head truth. | “Qualification authorizes design review only; activation assigns product identity later and never defaults On, auto-selects, or mutates pinned source tuples.” |

### 21. Testability, traceability, and proof

**Material concern: Yes.**

| What could go wrong                                                                                                                                  | Why it matters                                       | Severity | Likelihood             | Evidence/reasoning                                               | Effect on answer                | Permanent fix                                                                                                            | Exact specification language                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------- | ---------------------- | ---------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Tests may assert file presence but miss changed numbers, failed dimensions, privacy leaks, stale context, runtime placeholders, and approval bypass. | Gate appears green while unsupported behavior ships. | Critical | High without portfolio | D47 has falsifiable gates; D53 adds artifact/runtime separation. | Adds 120 criteria and matrices. | Golden valid/invalid artifacts, property/mutation tests, PII scans, no-artifact scans, release subset proof, full trace. | “Tests verify decisions/outcomes and forbidden artifacts, not merely parser implementation or reviewer labels.” |

### 22. Other development hazards

**Material concern: Yes.**

| What could go wrong                                                                                                           | Why it matters                                                | Severity | Likelihood | Evidence/reasoning                                                            | Effect on answer              | Permanent fix                                                                                                     | Exact specification language                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Evidence could be gamed to maximize activation, negative results buried, or “qualified” marketed as proven universal success. | Research ethics, trust, and future product decisions degrade. | High     | Medium     | Preregistration and limitation/contradiction reporting reduce hindsight bias. | Adds anti-optimization rules. | Preserve rejected decisions/criteria/contradictions/limits; qualification remains exact/contextual/proposal-only. | “Qualification is neither activation, universal best practice, nor success claim; negative evidence cannot be suppressed.” |

## Acceptance criteria

### Current scope and safe absence

- **D53-AC001:** D53 adds governing documentation only and adds no executable
  or product profile/runtime/schema/migration/OpenSpec/flag/event/job/key/
  channel/telemetry/UI artifact.
- **D53-AC002:** Repository scan proves no D43–D53 executable reminder/profile
  artifact currently ships.
- **D53-AC003:** No activated profile is represented by no product control, not an
  Off row/card/toggle/placeholder.
- **D53-AC004:** Missing evidence produces no warning requiring runtime/operator
  remediation; reminder-free is healthy.
- **D53-AC005:** No illustrative numeric pair appears in executable code/config,
  fixture, type, migration, API, UI, or docs presented as qualified/activated.
- **D53-AC006:** D53 does not close reminder need, content, channel, security,
  migration, performance, or rollout gates.
- **D53-AC007:** Conventional-pair and Tenant-configurable alternatives are
  compared against root need, UX, safety, and maintenance.
- **D53-AC008:** Verified fact, official evidence, inference, judgment,
  assumption, and unknown are separately labeled.
- **D53-AC009:** Rejection/no-build is a permitted final disposition with no
  fallback or workaround.
- **D53-AC010:** No production activity is needed to satisfy any D53 criterion.

### Candidate identity and preregistration

- **D53-AC011:** A timing-pair candidate names one immutable
  **research_candidate_id**, protocol version, exact positive whole-second
  **wait_for_seconds/useful_for_seconds** pair, and context—no product profile ID.
- **D53-AC012:** Candidate pair/meaning/context is fixed before confirmatory
  collection/analysis through a time-stamped read-only protocol reference.
- **D53-AC013:** Protocol states root questions, no-build alternatives,
  assumptions, methods, cohorts, recruitment, analysis, criteria, and stop rules.
- **D53-AC014:** Protocol preregisters comprehension, accessibility, privacy,
  fatigue/harm, source-data, operational, and no-deadline outcomes.
- **D53-AC015:** Pair or criterion change after collection starts creates a new
  candidate/study and cannot amend the old result into qualification.
- **D53-AC016:** A **research_candidate_id**/protocol version cannot alias
  another pair or context.
- **D53-AC017:** Duplicate candidate submission returns/conflicts with the
  canonical artifact rather than creating parallel authority.
- **D53-AC018:** Exploratory discovery is clearly separated from confirmatory
  evidence and cannot itself evidence-qualify a candidate.
- **D53-AC019:** Vendor/default/founder/Tenant suggestions remain hypotheses
  until incorporated before collection into an approved protocol.
- **D53-AC020:** Research can end with no candidate/no qualification without pressure
  to nominate another number.

### Representative evidence

- **D53-AC021:** Evidence distinguishes missed attention from deliberate waiting,
  authority gaps, source inapplicability, offline work, and IA/routing defects.
- **D53-AC022:** Existing lane/task/item/initial-email and no-build remedies are
  evaluated before independent reminder need.
- **D53-AC023:** Recruitment covers intended nonprofit/missions markets and
  relevant staffed/volunteer/distributed/multi-time-zone contexts.
- **D53-AC024:** Recruitment includes mobile/low-bandwidth, international
  language/RTL, disability/assistive-technology, and support contexts.
- **D53-AC025:** Exclusions, sample rationale, limitations, nonresponse, and
  materially missing cohorts are explicit.
- **D53-AC026:** Each materially distinct cohort meets its preregistered
  comprehension criterion; aggregate success cannot hide a failed cohort.
- **D53-AC027:** Evidence tests courtesy/still-waiting and skip-instead-of-late
  under method-specific preregistered thresholds, with zero participant
  critical misreads that imply a deadline/SLA, access change, or automatic
  keep/remove/default decision.
- **D53-AC028:** Fatigue/harm covers duplicate attention, pressure, rushed access
  decisions, interruption, privacy, opt-out, and disparate temporal effects.
- **D53-AC029:** Source/technical simulations prove exact D43 episode, policy,
  pair/package, D44 generation, boundaries, outage, and no-catch-up feasibility.
- **D53-AC030:** Existing age/support/open/click/completion data is contextual
  only and cannot independently evidence-qualify a candidate.

### Evidence decision artifact

- **D53-AC031:** One repository artifact identifies exactly one
  **research_candidate_id**/protocol version/pair/context and one qualified/
  not-qualified/retired/superseded successor disposition.
- **D53-AC032:** Artifact links protocol/research sources with integrity
  identifiers and records collection/analysis/review dates.
- **D53-AC033:** Artifact records methods, recruitment, exclusions, criteria,
  aggregate results, contradictions, limitations, and uncertainty.
- **D53-AC034:** Artifact records every D47/D53 dimension as pass/fail/
  insufficient with evidence, not a single composite score.
- **D53-AC035:** Artifact records each exact D47-domain reviewer identity, dimension,
  decision, date, and unresolved conflict.
- **D53-AC036:** Artifact records tested semantic/interaction contract,
  reference content, surface/workflow/channel assumptions, and material-change
  triggers without literal-string coupling.
- **D53-AC037:** Artifact records no-build comparison and why qualification, if any,
  is proportionate.
- **D53-AC038:** Artifact contains no participant/raw/protected/secret data and
  passes PII/secret/small-cell review before merge.
- **D53-AC039:** Missing/hash-mismatched durable local decision/provenance blocks
  reference; unavailable raw evidence blocks initial qualification/planned
  rereview but lawful deletion/vendor outage never silently deactivates.
- **D53-AC040:** Artifact merge is auditable but causes zero application,
  database, provider, Tenant, event, job, flag, or UI effect.

### Independent review and disposition

- **D53-AC041:** Access Product independently approves root problem/no-build/
  product meaning and exact pair scope.
- **D53-AC042:** UX Research independently approves protocol, recruitment,
  method, analysis, criteria, and limitations.
- **D53-AC043:** IAM independently approves source/auth/Tenant boundaries and
  no unsafe access behavior.
- **D53-AC044:** Privacy/Security independently approves consent/data
  minimization/retention/withdrawal/small-cell/security/harm posture.
- **D53-AC045:** Accessibility independently approves inclusive recruitment,
  prototype/test coverage, copy, interaction, and limitations.
- **D53-AC046:** Architecture independently approves D47–D52 coherence,
  ownership, minimality, feasibility, and no hidden runtime gate.
- **D53-AC047:** Missing/negative/conditional required D47-domain review means
  not evidence-qualified;
  no role can override another dimension.
- **D53-AC048:** Material contradiction is resolved with new evidence or
  produces not evidence-qualified; it is never omitted/averaged away.
- **D53-AC049:** Final disposition is exact/contextual and never labeled
  universal best practice, guaranteed success, or Tenant mandate.
- **D53-AC050:** Rejected/insufficient decisions remain discoverable release
  evidence and cannot be silently deleted or recycled.

### Source ownership and static release reference

- **D53-AC051:** Evidence artifact alone owns whether a candidate is an
  evidence-qualified timing-pair proposal.
- **D53-AC052:** Later activation package assigns product profile identity/
  revision and executable registry alone owns activated/retired code contracts,
  each exactly linked to one qualified **research_candidate_id**.
- **D53-AC053:** Later Phase 12 selected policy head alone owns Tenant selection;
  ordinarily retired profiles disappear from new selection/reselection APIs,
  while a Tenant's current selected head remains truthful/read-only and
  continues prospective D43 admission until deliberate policy change.
- **D53-AC054:** D43 pinned source tuple owns profile identity/revision, pair
  values, and derived source facts—never a research artifact—and never recomputes.
- **D53-AC055:** Runtime never parses/fetches/joins/caches the evidence artifact
  or research system.
- **D53-AC056:** Release validation deterministically proves every activated
  profile exactly links one qualified candidate; retired definitions remain
  only for selected-head/decoder/history compatibility.
- **D53-AC057:** Missing/mismatched/duplicate proposal-to-activation link blocks
  release without fallback; ordinary retirement blocks new selection/
  reselection but preserves current-head admission, UI, compatibility/history.
- **D53-AC058:** Evidence qualification permits later design only; implementation/
  activation still requires all governing approvals and proofs.
- **D53-AC059:** Pair evidence cannot qualify a different pair, semantic/
  interaction contract, cohort, workflow, channel meaning, or expanded market.
- **D53-AC060:** Release archives exact local evidence decision,
  **research_candidate_id**, activated profile identity/revision link, and
  verification provenance without D53 runtime telemetry.

### Change, withdrawal, concurrency, and failure

- **D53-AC061:** Pair/value/meaning/tested interaction/cohort/workflow/channel/
  privacy/accessibility/limitation change that could affect comprehension,
  fatigue, fairness, or harm requires requalification; meaning-preserving
  editorial/a11y/localization corrections use normal review and mint no ID.
- **D53-AC062:** Corrections never rewrite the meaning of a prior release commit;
  they append a linked successor with reason/effect.
- **D53-AC063:** Retirement/supersession blocks new offering/selection/API/
  reselection but preserves selected-head read-only current truth, prospective
  D43 admission until deliberate policy change, and decoder/history support.
- **D53-AC064:** Qualification-decision withdrawal/supersession alone creates no
  runtime Off, task/message, provider effect, migration, or current-work mutation.
- **D53-AC065:** D53 does not choose urgent safety retirement/current-head
  mutation; no profile activates until a later explicit decision predefines
  incident containment and product transitions.
- **D53-AC066:** Two concurrent decisions for one **research_candidate_id**/
  protocol version cannot both
  become canonical; conflict fails closed.
- **D53-AC067:** Replayed reviews do not create a second qualification/proposal.
- **D53-AC068:** Reviewer/repository compromise invokes security incident and
  complete trusted re-review before reference.
- **D53-AC069:** Repo/CI outage blocks new qualification/release changes;
  evidence-store outage blocks initial qualification/planned rereview but does
  not silently deactivate a durable local qualified/activated contract.
- **D53-AC070:** Evidence-link repair preserves provenance and requires recheck;
  it cannot substitute new results under an old decision.

### Research security and privacy

- **D53-AC071:** Every participant gives informed consent covering purpose,
  methods, recording, access, retention, withdrawal, and contact.
- **D53-AC072:** Research collects only data necessary for preregistered
  questions and prohibits real protected D43 request content in prototypes.
- **D53-AC073:** Raw data resides only in approved access-controlled research
  storage, not Git/tickets/PR comments/logs/analytics.
- **D53-AC074:** Retention/deletion schedules and withdrawal handling are
  approved before collection and independently verified.
- **D53-AC075:** Artifact aggregates/suppresses small cells and prevents
  re-identification of Tenant, ministry, participant, staff role, or disability.
- **D53-AC076:** Research exports/backups/vendors/subprocessors follow the same
  purpose/access/retention/incident limits.
- **D53-AC077:** Secrets/contact links/tokens/private URLs never enter the
  repository; references use safe opaque identifiers.
- **D53-AC078:** Repository access/reviews follow least privilege/branch
  protection and retain actor attribution.
- **D53-AC079:** Any research/repository privacy/security incident blocks
  qualification until contained, assessed, repaired, and re-reviewed.
- **D53-AC080:** D53 evidence cannot be used for person scoring, performance,
  deadline compliance, marketing claims, or unrelated research.

### Current and future UX

- **D53-AC081:** Current application has no Courtesy reminder navigation,
  summary, Off-only/disabled control, placeholder, waitlist, or hidden copy.
- **D53-AC082:** Current schema/API/types/events/jobs/fixtures contain no
  placeholder profile for future UI compatibility.
- **D53-AC083:** Research prototypes are non-production, consented, accessible,
  contain no protected data, and communicate no roadmap promise.
- **D53-AC084:** Later UI appears only after a qualified proposal becomes an
  activated access-review timing profile and every remaining gate passes.
- **D53-AC085:** First complete UI uses the future governed route-addressable
  Base Maia Access requests form/Sheet with Off plus one activated card; D53
  does not claim that settings surface exists today.
- **D53-AC086:** Each card maps one indivisible exact pair and exposes no
  independent **useful_for_seconds**, free-form number, slider, or advanced mode.
- **D53-AC087:** Card retains the tested courtesy/still-waiting, D50 no-due/
  no-access, and skip-instead-of-late semantic contract without freezing literal English.
- **D53-AC088:** An available, collapsed-by-default **How timing works**
  disclosure states the selected exact pair in plain language, for example
  **Eligible after 7 elapsed days; if it cannot be created within the next 7
  days, it is skipped**, never internal field names.
- **D53-AC089:** UI exposes no evidence score, approval state, participant
  count, experiment badge, runtime gate, provider state, or internal profile
  field names; opening the disclosure is optional but availability/content are required.
- **D53-AC090:** Keyboard/AT/focus/labels/status/forced-colors/targets/reflow/
  RTL/CJK/localization/mobile/low-bandwidth tests pass before activation.

### Authorization, RLS, and runtime separation

- **D53-AC091:** Repository review identity cannot grant application capability,
  Tenant role, request visibility, policy selection, or database privilege.
- **D53-AC092:** Evidence qualification creates no application table/RLS policy/
  RPC/view/function/grant/service-role path.
- **D53-AC093:** Later policy mutation still derives Tenant/actor/profile/source
  server-side and requires current application authorization.
- **D53-AC094:** Later runtime persistence uses same-Tenant composites,
  restrictive delete, least grants, RLS **USING/WITH CHECK**, and privileged parity.
- **D53-AC095:** Caller cannot supply evidence status, approval, profile
  admissibility, pair values, reviewer, or attribution to a runtime command.
- **D53-AC096:** Evidence/release check runs in build/repository context only and
  outputs no participant/protected data.
- **D53-AC097:** Build/release checks use local bounded versioned inputs and do
  not depend on network availability at runtime.
- **D53-AC098:** Support/AI/import/automation cannot evidence-qualify a
  candidate, activate/override/extend/synthesize a profile, or select a policy.
- **D53-AC099:** Later owner/service/BYPASSRLS product paths prove same profile/
  Tenant/source outcomes as ordinary paths.
- **D53-AC100:** Evidence qualification never bypasses OpenSpec, threat-model,
  migration, content/channel, test, or release approval.

### Scale, maintenance, and release operations

- **D53-AC101:** Initial activation supports at most one non-Off profile card;
  every added pair independently passes full evidence and option-count review.
- **D53-AC102:** Release checks locally index exact
  **research_candidate_id→activated profile identity/revision** and do not scan
  raw research or make external/network calls.
- **D53-AC103:** Validation publishes deterministic duration/result/provenance
  equality and completes within an approved repository-check budget.
- **D53-AC104:** Missing budget or repeated budget breach blocks pair expansion,
  not general development or current reminder-free product.
- **D53-AC105:** Artifact template/check ownership/runbook and successor/
  withdrawal procedure are documented without a new operational service.
- **D53-AC106:** Research-store migration preserves authorized provenance links/
  hashes and privacy; unavailable evidence blocks new reference.
- **D53-AC107:** Git/repository migration preserves decisions, reviews, history,
  integrity, and release references.
- **D53-AC108:** Later rollout is additive/deny-first/new-request-only/complete-
  Tenant/killable and never auto-enables or backfills from qualification/activation.
- **D53-AC109:** Rollback after later writes preserves evidence/code/policy/
  request histories and rolls forward rather than deleting pair proof.
- **D53-AC110:** No periodic cleanup/manual reconciliation/direct DB repair is
  required to keep D53 evidence qualification correct.

### Tests, traceability, and final proof

- **D53-AC111:** Golden valid artifact passes only when every required field/
  reviewer/evidence dimension is exact and complete.
- **D53-AC112:** Golden invalid artifacts cover missing/negative/conditional
  reviewer, wrong pair, stale/context drift, contradiction, broken hash, and PII.
- **D53-AC113:** Mutation/property tests alter each pair digit/revision/context/
  criterion/disposition/reference and prove release fails closed.
- **D53-AC114:** No-artifact architecture tests scan schema/migrations/API/types/
  UI/events/jobs/flags/keys/providers/telemetry for premature work.
- **D53-AC115:** Security tests cover branch/reviewer compromise, forged actor,
  secret/PII/small-cell leakage, dependency outage, and artifact collision.
- **D53-AC116:** UX/research tests cover no current surface, prototype consent/
  accessibility, and future one-card comprehension across roles/locales/devices.
- **D53-AC117:** Migration tests cover evidence/repo/tool moves, retirement/
  release race, old/new artifact validator, and preserved release provenance.
- **D53-AC118:** Traceability maps every D53-R/AC through decision/glossary/ADR/
  OpenSpec/design/tickets/code/tests/evidence/release with exact terms.
- **D53-AC119:** Every named monitor below has a tested owner/runbook and cannot
  activate, select, modify, or message anything.
- **D53-AC120:** Activation/reference remains blocked unless every R/AC, D47
  dimension, durable local qualified proposal, exact activation link/static
  match, urgent-retirement/current-head decision, remaining product gate, and
  zero-tolerance audit is green.

## Implementation and proof matrices

### Source, authority, and invariant matrix

| Fact/invariant                 | Authority                                                  | Enforcement/review seam                            | Forbidden substitute                                 |
| ------------------------------ | ---------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| Timing-pair candidate/protocol | Preregistered **research_candidate_id** brief              | Time-stamped immutable reference before collection | Product profile ID, post-result edit, vendor default |
| Aggregate findings/limits      | Approved research source                                   | UX Research analysis/review                        | Anecdote, click/open metric                          |
| Privacy/consent                | Privacy + approved research system                         | Protocol, access/retention/withdrawal audit        | Git copy/raw export                                  |
| Evidence qualification         | Canonical D53 repository artifact                          | Exact six D47-domain PR reviews                    | Ticket/chat/flag/table                               |
| Activated profile              | Later code registry + activation package linking candidate | Static exact-link release validation               | Runtime fetch of evidence                            |
| Tenant selection               | Later Phase 12 selected policy head                        | Application auth/RLS/expected head                 | Evidence review                                      |
| Historical facts               | Immutable D43 pinned source tuple                          | D48–D52 source transaction                         | Research artifact/current registry                   |
| No-build                       | Absence/not-qualified disposition                          | No-artifact audit                                  | Off-only placeholder                                 |

### Artifact field and privacy matrix

| Artifact section | Required                                                                           | Forbidden                                   |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| Identity         | Decision/**research_candidate_id**/protocol version/exact pair/context/predecessor | Product profile ID, placeholder/range/ratio |
| Protocol         | Time-stamped link/hash, questions, methods, criteria, stop rules                   | Mutable after-result criteria               |
| Cohorts          | Aggregate recruitment/coverage/exclusions/sample rationale                         | Names, contacts, Tenant/ministry IDs        |
| Results          | Aggregate per-criterion outcomes, contradictions, limitations                      | Raw response/transcript/recording           |
| Safety           | Accessibility/privacy/fatigue/harm/source/technical proof                          | Protected request examples                  |
| Reviews          | Named repo identities, dimensions, dispositions, dates                             | App roles/service approval                  |
| Provenance       | Safe opaque references/hashes/material-change triggers                             | Tokens/secrets/private URLs                 |
| Disposition      | Qualified/not-qualified/retired/superseded exact scope                             | Universal success/activation claim          |

### Authorization and RLS separation matrix

| Path                 | Authority                                    | May do                                                   | Cannot do                                             |
| -------------------- | -------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| Research participant | Informed consent                             | Participate/withdraw under protocol                      | Approve product/runtime                               |
| Researcher           | Approved research access                     | Collect/analyze within purpose                           | Evidence-qualify a candidate alone/export raw to repo |
| D47 review domain    | Repository identity + exact domain ownership | Review evidence dimension                                | Grant Tenant/application authority                    |
| Release validator    | Build identity/local artifacts               | Compare exact current references                         | Call runtime/research network/choose pair             |
| Later policy admin   | Phase 12 application auth                    | Select activated non-retired profile                     | Qualify evidence/change pair                          |
| Later worker/service | Registered product purpose                   | Use activated profile from pinned source tuple under RLS | Read research artifact/override qualification         |
| Owner/BYPASSRLS      | Server-only product purpose                  | Same later command                                       | Bypass Tenant/profile/source proof                    |

### Migration, scale, UX, and test matrix

| Concern                      | Proof                                                                                       | Required result                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Empty state                  | Whole-repo no-artifact scan                                                                 | No runtime/schema/UI/flag/key/profile                                                               |
| Evidence tool/repo migration | Hash/reference/history/review/privacy fixture                                               | Identical decision meaning; no raw leak                                                             |
| Validator versions           | Old/new valid/invalid golden corpus                                                         | Fail closed on unknown/mismatch                                                                     |
| Release scale                | Indexed local profile lookup, deterministic timing                                          | Approved budget; no network/all-raw scan                                                            |
| Option scale                 | One first pair; addition review per exact pair                                              | Small comprehensible UI; no combinatorial controls                                                  |
| Current UX                   | Route/snapshot/a11y scan                                                                    | No Off-only/placeholder/hidden surface                                                              |
| Future UX                    | Future governed Base Maia card + required collapsed disclosure across roles/locales/devices | Method-specific preregistered thresholds; zero critical deadline/access/automatic-decision misreads |
| Security/privacy             | Forgery/PII/secret/small-cell/branch compromise corpus                                      | Zero unauthorized qualification/activation/disclosure                                               |
| Traceability                 | Candidate decision→activation→selected head→pinned tuple→release                            | Exact IDs/pair/context at every seam                                                                |

## Named release and evidence monitors

These are repository/research/release audits, not runtime telemetry. No signal
may choose a pair, activate a feature, contact a person, or mutate product data.

| Signal                        | Threshold                                                                                                                                              | Owner                                          | Required response                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **D53-PREMATURE-ARTIFACT**    | Any product profile/schema/API/type/UI/event/job/key/flag/provider/telemetry artifact before activation design                                         | Architecture + affected owner                  | Block release; remove artifact/promise; prove no data/effect                                                              |
| **D53-OFF-PLACEHOLDER-UX**    | Any Off-only/disabled/Coming soon/waitlist/hidden reminder surface                                                                                     | UX + Accessibility + Access Product            | Block surface; remove all visible/programmatic traces                                                                     |
| **D53-RUNTIME-GATE**          | Any runtime table/workflow/API/cache/flag reads or stores evidence qualification                                                                       | Architecture + Security                        | Block/remove design; restore static release separation                                                                    |
| **D53-UNSUPPORTED-PAIR**      | Any activation/reference without one current exact qualified proposal and explicit activation package                                                  | Product Governance + Release Engineering       | Block release; remove reference or complete governing decisions                                                           |
| **D53-PAIR-MISMATCH**         | Any candidate→activated-profile pair/context mismatch                                                                                                  | Data Integrity + Phase 12                      | Block release; correct through review, never auto-rewrite                                                                 |
| **D53-PROTOCOL-DRIFT**        | Pair/criteria/method changed after confirmatory collection began                                                                                       | UX Research + Product Governance               | Mark not qualified; preregister new candidate                                                                             |
| **D53-REVIEW-INCOMPLETE**     | Any exact D47 domain lacks its preregistered evidence decision                                                                                         | Six D47 review domains                         | Keep not qualified; resolve/research, no override                                                                         |
| **D53-CONTEXT-DRIFT**         | Material semantic/interaction/cohort/workflow/channel/privacy/accessibility change affecting comprehension/fatigue/fairness/harm                       | Access Product + UX Research + Architecture    | Block new reference; requalify; normal review only for meaning-preserving edits                                           |
| **D53-EVIDENCE-INTEGRITY**    | Durable local decision/provenance hash invalid, or required raw source unavailable during initial qualification/planned rereview                       | UX Research + Release Engineering              | Block qualification/rereview; repair provenance; do not deactivate solely for lawful raw deletion/outage                  |
| **D53-PII-SECRET-SMALL-CELL** | Any raw/person/protected/secret/re-identifiable data in repo/ticket/PR/output                                                                          | Privacy + Security                             | Stop merge, contain/purge where lawful, incident/review, add regression                                                   |
| **D53-CONSENT-RETENTION**     | Any collection/use/access/retention/deletion/withdrawal outside approved protocol                                                                      | Privacy + UX Research                          | Stop research, contain/repair, honor withdrawal, invalidate evidence as needed                                            |
| **D53-PRODUCTION-EXPERIMENT** | Any live reminder/beta/canary/manual send used to qualify pair                                                                                         | Product Governance + Security + Access Product | Stop effects, incident/harm review, reject evidence, preserve source truth                                                |
| **D53-RETIRED-NEW-SELECTION** | Any ordinarily retired profile offered/selected/reselected for a different policy head; current-head D43 admission is excluded                         | Release Engineering + Phase 12                 | Block new selection; preserve current-head read-only/current admission and decoder/history until deliberate policy change |
| **D53-APPROVAL-IDENTITY**     | Any forged/compromised/unprotected D47-domain review or branch path                                                                                    | Privacy/Security + Repository Admin            | Freeze qualification, investigate, invalidate/re-review trusted commit                                                    |
| **D53-OPTION-COUNT**          | First release >1 non-Off card, or later set exceeds separately approved research/UX capacity                                                           | Access Product + UX Research                   | Block addition; reduce set or provide independent evidence/capacity proof                                                 |
| **D53-VALIDATOR-SLO**         | Missing approved local-check budget or two consecutive release windows above it                                                                        | Developer Experience + Release Engineering     | Optimize/index local inputs; never bypass or move check to runtime                                                        |
| **D53-TRACE-DRIFT**           | Any D53-R/AC, pair, context, disposition, owner, or non-effect contradiction                                                                           | Product Governance + Architecture              | Stop reconciliation/release; correct full artifact chain                                                                  |
| **D53-COMPREHENSION**         | Any material cohort misses its method-specific preregistered threshold, or any participant makes a critical deadline/access/automatic-decision misread | UX Research + Accessibility + Access Product   | Keep inactive; simplify/retest; never add training/extra controls first                                                   |

Having no evidence-qualified proposal and no activated timing profile is healthy
and is not a monitor, alert, SLA breach, or operational incident.

## Ruthless synthesis and ordered path

### Final disposition

**Accept with required amendments.**

Option 1 is correct only as a repository release-evidence contract with safe
absence. It must not become runtime governance, a placeholder implementation,
or permission to experiment on production users.

### Before recording D53

1. Define one **research_candidate_id**/protocol decision per exact pair/context;
   product profile identity exists only in a later activation package.
2. Require preregistration and the exact six D47 review domains independently:
   Access Product, UX Research, IAM, Privacy/Security, Accessibility, Architecture.
3. Separate raw research storage, minimized qualification decision,
   activated code registry, Tenant selected policy head, and D43 pinned source
   tuple ownership.
4. Make absent/not-qualified evidence mean no profile/no UI/runtime. Ordinary
   retirement blocks new selection/reselection while preserving a current
   selected head, prospective D43 admission, read-only UI, and compatibility/history.
5. Forbid production experiments, overrides, placeholders, and compensating
   approval.
6. Define successor/invalidation/qualification→activation linking and privacy limits.
7. Block activation until a later explicit decision defines urgent safety
   withdrawal authority, threshold, current-head/new-request sequencing, and UX.

### Later specification/design safeguards

After D54, the later urgent-withdrawal decision, and successful evidence only:
finalize artifact template/path/schema/CODEOWNERS/local validator; threat-model
repository/research/release paths;
complete OpenSpec and implementation tickets; prove no-artifact and exact-
subset tests; then implement additively/deny-first with all D47–D52,
content/channel/security/a11y/performance/migration gates. Activate only a
complete compatible Tenant cohort. Evidence qualification itself performs none.

The only monitorable residuals are durable local decision/provenance integrity,
planned-rereview source availability, local validator performance, later
option-set comprehension, and tool migration after their safety contracts
exist. Premature artifacts, unsupported/mismatched pairs,
protocol/review/context drift, privacy leakage, production experiments,
retired-new-selection, forged review, or trace contradiction are zero-tolerance
release incidents. Having no qualified proposal is healthy prose, never an alert.

## Exact corrected D53 decision to record

> **Option 1 — evidence qualifies each exact complete timing-pair proposal;
> remain Off until one passes.** Prequalification uses an immutable
> **research_candidate_id**, protocol version, exact positive whole-second
> **(wait_for_seconds, useful_for_seconds)** pair, and context—not a product
> profile ID. Until the candidate independently passes every D47/D53 dimension,
> Core has no product profile identifier/revision, executable
> registry, policy/default row, schema, flag, event/job/key/channel, runtime, or
> reminder UI—including no Off-only placeholder.
>
> Qualification is one privacy-minimized version-controlled repository evidence
> decision, reviewed by Access Product, UX Research, IAM, Privacy/Security,
> Accessibility, and Architecture. It binds the preregistered pair/protocol,
> representative cohorts/methods/criteria, aggregate results, contradictions/
> limitations, accessibility/privacy/fatigue/harm/source/technical proof,
> reviewer dispositions, provenance/integrity references, exact context, and
> invalidation triggers. Missing/failing/stale/partial/contradictory evidence is
> not qualified; rejection/no-build is valid. Raw/person-level research stays in
> approved consent/retention-controlled storage and never enters the artifact.
>
> The durable minimized local decision/provenance permits a later
> **evidence-qualified timing-pair proposal** only and is never runtime-read or
> network-dependent at ordinary release. Lawful raw-data deletion/vendor outage
> does not silently dequalify it, but blocks any rereview requiring that source.
> A later explicit activation package assigns an **activated access-review
> timing profile** identity/revision linking **research_candidate_id** and the exact pair. A
> Tenant later references it through a **selected policy head**; D43 pins
> profile identity/revision, pair values, and derived facts in its **pinned
> source tuple**, never research evidence. Qualification neither implements nor
> activates and never
> replaces remaining OpenSpec/content/channel/security/migration/test/rollout
> gates.
>
> Ordinary retirement uses a successor, removes the activated profile from new
> offering/selection/reselection, but leaves a Tenant's current selected head,
> prospective D43 admission, read-only/current UI, decoders, and pinned history
> truthful until deliberate policy change. Urgent safety withdrawal/current-
> head behavior is a later explicit pre-activation blocker; D53 chooses none.
>
> No production reminder, beta, canary, manual send, feature flag, or live
> experiment qualifies evidence. Current UX remains absent. A later complete
> future governed Base Maia UI may show Off plus one activated cadence card with
> no separate usefulness control. A collapsed-by-default but available **How
> timing works** disclosure states the selected exact pair in plain language,
> never internal field names. Evidence binds the tested semantic/interaction
> contract; meaning-preserving editorial/accessibility/localization corrections
> use normal review and mint no candidate/profile.

## D54 — What local in-product presentation should the reminder create?

### Context and example

D44's governing future contract calls for one source-backed task and initial
recipient-specific notification attention; none of this D43–D54 reminder
runtime is claimed implemented today. D47 adds one distinct courtesy-reminder
source occurrence. Example: a coordinator read the original **Access
review needs attention** item, the request remains pending, and the activated
profile's D52 timing interval later admits the reminder. Should Asym create
distinct local attention or rely on the existing item/task?

Resurfacing the original item, resetting unread, or mutating the task is not a
founder-selectable option: ADR-0027 preserves personal engagement history and
ADR-0183 keeps task state separate from notification presentation.

### Options

1. **Distinct recipient-specific grouped reminder item (Recommended).** Create
   one new reminder item for each exact D49 recipient, with its own engagement
   and the reminder occurrence identity, perceptually and programmatically
   grouped with the same access-request context under ADR-0027. Visual layout,
   reading order, accessible naming/description, and programmatic relationships
   must agree; color or proximity alone is insufficient. It creates no second task, does not alter the
   original item's read/archive state, and remains governed by current D43
   actionability. This makes the one reminder perceivable without corrupting
   personal history or fragmenting the inbox.
2. **No new in-product item.** Keep only the existing task/initial notification;
   the reminder occurrence may later have separately governed external
   delivery but adds no local attention. This is quietest, but an in-product-
   only recipient receives no new reminder signal.

**Recommendation:** Option 1. It preserves one source occurrence, independent
recipient engagement, grouping, and no duplicate task while providing a clear,
Core-consistent local reminder.

**Question:** Which D54 local-presentation model should Core record: Option 1,
one distinct perceptually/programmatically grouped item, or Option 2, no new
in-product item?
