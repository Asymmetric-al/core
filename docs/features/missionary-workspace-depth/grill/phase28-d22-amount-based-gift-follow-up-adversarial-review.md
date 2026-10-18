# Phase 28 D22 — optional organization amount rule

Research date: **October 17, 2026 UTC**. Repository: `Asymmetric-al/core`,
HEAD `9cada8f3d8ab59db391d3fd20df77fcadeb09813`.
Status: **Corrected decision and required amendments explicitly ratified on October 17, 2026 Asia/Bangkok.**
Disposition: **Accept with required amendments.**

This completed grill review records the product decision, its exact reviewed
amendments and the proof required for implementation. It does not change formal
owners, ADRs, OpenSpec, application code, schema, dependencies or live services.
D19–D21 remain ratified. No Q23 was posed in the initial review; subsequent
ratification and continuation are recorded below.

## Exact corrected decision to record

> **A — Optional organization-set amount rule.** The organization may enable one
> organization-wide amount-based personal follow-up policy. It starts Off, with
> no suggested monetary default. Authorized staff choose a positive amount for
> each supported currency. An eligible newly received gift qualifies when its
> source-certified support for the relevant supporter and ministry is **at least**
> that currency's amount. An unconfigured currency supplies no amount-based reason.
>
> The organization can turn the rule on or off and add, change or remove currency
> amounts. There are no per-missionary, project or donor overrides. Financial
> meaning, permissions, privacy and duplicate prevention remain fixed safeguards.
> Other qualified follow-up and Maya's manual actions continue independently.
>
> Maya sees a clear reason on the existing compatible follow-up, with the exact
> permitted gifts and the applicable amount. This does not classify a gift as
> extra support, rate the donor, change financial records or send anything.
>
> Amount edits apply prospectively. Turning Off stops new amount-based admissions;
> previously accepted follow-up remains, including work still appearing in the
> task list. Financial corrections continue to update the original reason against
> its captured rule. Re-enabling never sweeps old gifts or revives previously
> unadmitted work. One gift retains one business identity and exact handling
> evidence, even when several reasons qualify it.

The founder explicitly selected **one organization-wide policy** in the follow-up
clarification. Off by default, inclusive comparison, the precise financial basis
and temporal mechanics were proposed amendments at initial review and are now
explicitly ratified as recorded below. They are not retroactively attributed to
the earlier scope clarification. “Fully customizable” is fulfilled through the
bounded controls above; it is not interpreted as permission to disable financial
truth, privacy or every other native task family.

## Evidence and alternatives

| Evidence class                     | Verified finding and practical limit                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder facts                      | Optional tenant-set amounts, no automatic message or extra-support label, simple clear UX; subsequently one organization-wide policy. These establish direction, not implemented behavior.                                                                                                                                                                                                                                                                     |
| Governing intent                   | P28 required native stewardship, P13 money, P14 recognition, P16 commitment meaning, P12 current authorization and ADR-0183 shared task ownership constrain this feature. Exact references and conflicts are in the [owner review](d22-evidence/owner-policy-boundaries.md) and [finance review](d22-evidence/financial-basis.md).                                                                                                                             |
| Current code                       | The inspected org-settings route is a fixed-tenant visibility setting, not a qualified amount policy; it lacks the required revision/readback contract. Existing monetary helpers offer exact parsing, but other amount inputs hard-code USD/two decimals. Target auth documents are not evidence of deployed PDP behavior. See [source findings](d22-evidence/current-source-and-settings.md).                                                                |
| Current primary comparables        | Virtuous documents single-gift thresholds and prospective template edits. Bloomerang documents native journey filters separately from its Zapier task template; the latter's test creates a real task. HubSpot distinguishes matching a condition from actual enrollment. These support understandable controls and inert previews, not Core financial semantics. [Dated source register](d22-evidence/settings-and-task-ux.md#fresh-primary-source-register). |
| Technical primary evidence         | PostgreSQL/Supabase grants, RLS and function privileges remain distinct boundaries. Precision must be rejected before a coercing numeric assignment. Canonical currency metadata includes more than two decimal places and does not itself qualify a financial source. [Database evidence](d22-evidence/database-policy-lifecycle.md) and [amount counterexamples](d22-evidence/amount-policy-counterexamples.md).                                             |
| Executed bounded evidence          | 25/25 finite semantic counterexamples and 29/29 isolated PostgreSQL outcomes, including seven controlled lock races and one deliberately unsafe numeric-rounding counterexample. They exercise proposed mechanics using synthetic source/authority inputs; they do not qualify actual Core services, finance, P12, hosted Supabase, UI or capacity.                                                                                                            |
| Product judgments                  | One form, inclusive “at least,” no default amount, prospective edits, no historical backfill and preserved accepted work are the smallest coherent reviewed experience. No measured missionary satisfaction, optimal threshold or donor-retention benefit is claimed.                                                                                                                                                                                          |
| Unknowns with concrete obligations | Actual source-to-policy ordering, each supported monetary/recognition adapter, production task/PDP integration, accessible usability and operational capacity must pass the named proof gates below. No source lane may be advertised as supported before qualification. These are implementation obligations, not reasons to replace the permanent solution with manual work.                                                                                 |

**Strongest alternative:** do not build an amount-only criterion; retain qualified
first-support/special/above-commitment tasks and manual follow-up. That avoids
settings and unnecessary work for ordinary large installments. The selected
optional rule is justified as a transparent organization preference, not a
claim that large gifts inherently deserve different treatment. Off preserves the
simpler experience. No machine learning, giving-history anomaly detector,
Workflow Studio requirement or new vendor is needed.

External practice is subordinate to Core's owners. Virtuous's documented
“exceeded” comparator does not choose Core's ratified inclusive boundary.
Bloomerang's delay, Zapier and side-effecting test are not adopted. P27 ratings'
Off behavior does not govern this different P28 purpose. P13's finance-risk
threshold must not be reused to delay posting or set stewardship policy.

The [OpenSpec automation guard](../../../../openspec/specs/platform-boundaries/spec.md#requirement-mission-control-automations-are-declarative-and-guarded)
requires preview, test and activity history for its governed automation activation.
The bounded native rule SHALL preserve that guard: a declarative fixed definition
with source trigger, inclusive condition, shared-task action, run mode, reviewer,
failure policy and activity history; current management authority; exact-policy
preview; an inert test through the actual evaluator; and durable activation/test/
audit evidence. Numeric changes taking effect require a fresh bound test result.
The form can perform this within one deliberate Save/Turn on; no generic workflow
builder or additional approval wizard is needed. Failed preview/test blocks a new
activation or effective edit, never Turn off.

Formal specification must bind the existing `automation:manage` requirement to
P12's current capability contract for this exact native purpose rather than infer
that any staff role may manage it. This resolves the guard as a requirement here;
it does not claim the formal mapping is already implemented. Native P28 work
remains independent of optional P35 Workflow Studio. No governing requirement is
silently weakened by naming this a setting.

## Clean staff and missionary journeys

### Staff: one small settings section

Use existing organization settings and the shared Maia form/card primitives.
Suggested section name: **Amount-based follow-up**. The saved state is explicit:
**Off** or **On**. Loading/error is never displayed as Off.

| Control or information         | Meaning                                                                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Organization-wide scope        | Read-only text: “Applies to eligible missionary and project follow-up across your organization.” It grants no new access and does not combine Legal Entities or ministry amounts.                                        |
| Currency and “At least” amount | One row per supported currency. ISO code plus localized amount; no ambiguous `$` alone. Add/remove rows only as needed. No guessed amount or currency.                                                                   |
| Inline review                  | “Create follow-up when eligible support from one gift meets one of these amounts.” Explain that the relevant ministry amount is used. Recognized support is labeled where applicable.                                    |
| Example/test                   | Inert threshold check using clearly fictional amounts, including equality. “Meets amount condition” is different from “A task will be created.” No donor data required, historical scan, real task or message.           |
| Turn on / Save changes         | Explicit action persists the complete valid policy through the authoritative command and returns its current version. Show success only from that result/readback. No second approval page for an ordinary numeric edit. |
| Turn off                       | Separate action against the saved policy, usable even if an amount draft is invalid. It does not save malformed or unrelated draft edits. Later Save cannot silently turn the rule back on.                              |
| History                        | A concise audit link shows who changed which amounts and when, subject to permission. It is not a duplicate donor timeline or log viewer.                                                                                |

Main help text:

> **No messages are sent automatically.** Changes apply to new gifts. Existing
> follow-ups keep their original rule.

Off result:

> **Amount-based follow-up is off. Existing follow-ups remain.**

A secondary explanation covers the less common case: previously accepted work
may still appear or be corrected. Do not burden every missionary task with this
settings detail. Removing one currency stops future admissions for that currency;
removing the last requires explicitly turning Off rather than silently treating
an empty list as zero or active. Keep valid entered amounts when the global rule
is Off so staff can deliberately review them before a later Turn on.

Invalid amount errors identify the currency and repair: positive amount required,
unsupported decimal precision or supported range exceeded. Preserve other draft
rows. For a stale save, show the current saved settings and preserve the draft
for review; never overwrite another administrator silently. After a lost response,
resolve the durable command result before offering another mutation. On phones,
stack rows and keep actions legible without horizontal scrolling.

### Maya: familiar task, factual reason

Example, with illustrative USD amounts only:

> **Follow up with Grace**  
> **Added under your organization's amount rule**  
> USD 500.00 for Maya's ministry · amount rule used: at least USD 500.00  
> View gift · Open follow-up

For an eligible recognition route, use **Recognized support added under your
organization's amount rule**, with the permitted route/source explanation.
Never imply Grace legally paid a sponsor's entire gift. Show original gift date
and, where useful, received/recorded context using their true distinct meanings;
a delayed task must not masquerade as a newly made gift.

The existing task detail lists each permitted gift separately and shows all
qualified reasons without duplicating work. Multiple gifts are never summed to
cross this threshold. Do not use “extra,” “unusually generous,” urgent colors,
star ratings or a donor rank. If the rule later changes, the historical reason
continues to show its captured threshold; optional detail identifies **the rule
used for this gift**.

Maya reviews the gifts and can act, remind later, or mark the reviewed work
Done/Not needed through D20's existing controls. Logging an actual interaction is
optional, and contacting Grace is a separate deliberate action through an allowed
channel. **Done does not mean sent**. **Not needed** records disposition of that
reviewed work, not a permanent exemption. A new unreviewed gift remains work;
source-withdrawn reasons cannot consume independent promises or other valid
reasons. No automatic sending, newsletter subscription or consent change follows.
A task must never disclose hidden gifts through totals, counts, status, previews
or notifications. Normal manual follow-up remains available under current rights.

### Accessibility, restraint and recovery

Visible labels and persistent hints replace placeholder-only money input. Decimal
keyboard hints must not force two decimals or a US separator; the locale parser
rejects ambiguous input rather than guessing. Amount/currency comparisons remain
exact after localized display. Preserve international names; no new name/address
normalization belongs here. No date picker or user-configurable timezone is needed
for a source-ordered rule. Audit timestamps use the existing localized display.

Use semantic status messages, keyboard focus, inline errors and an error summary
when appropriate; do not rely on color. Core's shared components, restrained
spacing and typography supply visual coherence. Validate 320 CSS-pixel reflow,
200% zoom, keyboard/screen-reader operation and usable touch targets. The WCAG
2.2 AA target-size criterion is 24 CSS pixels with exceptions; a larger Core touch
target is a design choice, not a misquoted AA rule. Low-bandwidth retries must
preserve input and resolve saved status. Donors and public giving pages gain no
new step or exposed internal threshold.

## Exact financial, temporal and ownership contract

The comparison is **one contribution + one permitted follow-up Party + one typed
ministry subject + one currency**. Use one source-selected profile:

- **Direct support:** P13's sanctioned current effective fold of distinct relevant
  monetary allocation lines, excluding fee-cover and unrelated allocations,
  before processor fees and P21 assessments, after source-owned reversals.
- **Eligible recognized support:** P14 certifies the exact permitted Party's
  recognized amount for that contribution and subject backed by the same eligible non-fee-cover monetary
  source, excluding unrelated allocations and before processor fees/assessments.
  Recognition is labeled and never added to legal giving. P14 owns role
  deduplication and attribution. P28 cannot invent pro-rata, MIN or MAX arithmetic
  to turn an ambiguous header credit into a ministry amount.

A sponsor gift, multiple credit roles or allocation lines do not multiply support.
Noncash valuations, commitments, expected matches, settlement/net payout, cumulative
history and FX conversions do not qualify this amount profile. Currency metadata
is not proof that a source adapter supports that currency. Unknown/hidden/stale
source is not zero or disproved eligibility. Hold only the affected qualification,
with an owner and visible operational status; money posting and independent valid
purposes continue. See the [financial basis](d22-evidence/financial-basis.md).

**Admission** is the authoritative commit of the exact qualified reason and its
durable projection intent. Appearance in the task list is later presentation.
For each qualified tender/profile, the **original live boundary** is its first
owner-certified eligible received/support event, independent of the amount
threshold and downstream recognition/task delay. Processing alone is not that
event. A genuine later source-finality event may first qualify after enable; a
policy relaxation, historical reclassification or late delivery of an already
eligible receipt cannot manufacture a new boundary. The applicable policy must
be proved at that boundary using source lineage and immutable policy history.
Original gift dates,
caller clocks, webhook arrival and worker execution time cannot select a policy.
A historical acquisition remains historical even when its transport arrives now.

| Transition                                    | Required result                                                                                                                                                                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enable with valid currency amounts            | New prospective source boundary; no sweep of existing gift history.                                                                                                                                                                           |
| Edit an amount                                | New live receipts use the new rule. Accepted reasons retain the original. A held originally live candidate retains its captured rule only while its relevant enabled interval continues.                                                      |
| Turn Off or remove a currency                 | Stop new admissions at commit and end that relevant interval for unadmitted candidates. Preserve admitted reasons and durable intents; queued materialization may finish. No auto-cancel, Done, recipient notification or bulk cleanup.       |
| Re-enable or re-add a currency                | New prospective interval. Old unadmitted/held candidates and gifts whose qualified original live boundary occurred while Off cannot revive. Other continuously enabled currencies are unaffected.                                             |
| Admission races Off                           | One authoritative order: admission first survives as existing work; Off first denies the old unadmitted admission. A cached On snapshot cannot win later.                                                                                     |
| Source amount changes                         | Recheck current source against the captured rule. Actual invalidity withdraws only that reason; unknown availability does not erase it. Preserve history, handled evidence and independent reasons/promises.                                  |
| Actual source repair of earlier admitted work | Restore the same originally live unconsumed purpose when source and current authority permit, even while the amount rule is Off. This is repair of existing admitted work, not revival of never-admitted work or handled/Not needed coverage. |
| Duplicate/reordered events or repeated Save   | Reuse the durable intended effect/command result. A policy version, source revision or delivery ID is evidence, not a new gift or handling opportunity.                                                                                       |

The source-owner integration must prove that ordering without delaying financial
posting on human review or requiring one distributed transaction across finance
and the task system. Use existing durable source intents and shared task commands.
No second task table, coverage ledger, scheduler, event store or custom policy
engine is selected by this decision.

### Database and Supabase safety

Use the canonical tenant settings owner and immutable policy history, with one
current tenant policy, unique currency rows per version and positive exact amounts.
Preserve stable currency identity/exponent and policy evidence referenced by work.
Do not hard-delete referenced policy versions. Disabled configuration and a
missing currency are explicit states; neither is zero. An enabled configuration
must have at least one valid qualified currency. Reject nonfinite, negative, zero,
out-of-range or excess-precision inputs **before** coercion into an integer/numeric
storage type. Use the existing exact integer minor-unit boundary, with safe
transport; never a floating-point major-unit comparison.

Tenant-aware foreign keys must bind policy/version, source contribution, typed
subject, Party, intent and existing task references to the same tenant and exact
financial scope. The policy can be organization-wide while each financial effect
retains its Legal Entity and ministry boundaries. Composite relationships and
uniqueness enforce valid identity; service validation enforces source facts and
cross-row policy validity. Policy/current revision and source-current revision
are checked atomically at their owning acceptance boundary. Immutable audit actor,
tenant, owner, source and timestamps are derived or resolved from trusted context,
not a caller's update payload. No generic “update this JSON” endpoint.

P12's current PDP/Active Assignment and purpose-scoped authority remain canonical;
a string role or cached settings flag is not permission. Managing this policy
neither grants gift-reading nor source-management rights. RLS remains the intended
coarse tenant backstop, not a shadow fine-grained PDP. Review grants plus SELECT,
INSERT, UPDATE `USING` and resulting-state `WITH CHECK`, DELETE, functions/views,
service-worker access, caches and every exposed route. An omitted `WITH CHECK`
can inherit `USING`; omission alone is not proof of a vulnerability. Conversely,
a permissive predicate cannot make mutable tenant/actor fields safe by itself.

Keep browser grants narrow and respect Core's server boundary. Prefer invoker
execution where suitable; any justified definer function needs narrow execution
grants, a controlled search path and explicit authoritative checks. Definer status
does not inherently mean RLS bypass; actual ownership/privileges determine it.
Service-role/BYPASSRLS paths require the same application authorization and tenant
binding. No new storage uploads or public policy/feed endpoint is necessary.

These are required invariants, not a frozen new table design. The existing
[org-settings implementation](d22-evidence/current-source-and-settings.md) is not
a safe scaffold: fixed tenant, unrelated preference, incomplete persistence proof
and missing compare-and-set contract. Reuse sound money and UI primitives through
qualified shared owners, not those shortcuts.

## Material findings and exact amendments

Severity means consequence if the flaw ships; likelihood is qualitative for the
unamended proposal, not measured production incidence. Each finding specifies the
change to A and points to exact normative clauses/proofs below.

| Finding                                           | What fails and why it matters                                                                                                                                    | Severity / likelihood; evidence                                                                                                                       | Effect on decision and permanent correction                                                                                                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 — Unbounded customization                     | “Fully customizable” could become a hierarchy/rule builder or disable mandatory native work, raising cost and ambiguity.                                         | Medium / likely if unspecified. Founder explicitly chose one org policy; D16 overrides solve a different problem; P28/P35 owner separation.           | Narrows configuration, retains A. **C01–C03** fix controls and independent purposes; **P01–P03** prove scope/defaults.                                                      |
| F02 — Wrong monetary basis                        | Header totals, fee-cover, unrelated lines or sponsor credit trigger attention for money not attributable to this ministry/supporter.                             | High / plausible with existing scalar shortcuts. P13/P14 ownership and finance counterexamples.                                                       | Changes vague “gift amount” into one exact source measure. **C04–C06**, **P04–P08**; source-owner certification, no P28 attribution guesses.                                |
| F03 — Precision or currency coercion              | Rounded values cross the threshold; dollars are assumed; unsupported currency metadata activates a lane. Staff sees a rule that differs from evaluation.         | High / plausible. Current hard-coded inputs and actual PostgreSQL rounding counterexample.                                                            | Adds exact inclusive same-currency comparison. **C03/C06**, **P03/P07/P09**; parse before coercion, no FX, explicit supported range.                                        |
| F04 — Policy time and Off ambiguity               | Worker-time edits create retroactive tasks; Off deletes accepted work or stale work admits after Off; re-enable floods old gifts.                                | High / likely without lifecycle rules. Async source/intents, seven controlled races, comparable Off differences.                                      | Defines prospective edit/Off and stable admitted work. **C07–C10**, **P10–P18**; source-ordered history, continuity fence and exact receipts.                               |
| F05 — Duplicate or false completion               | Each reason/version makes another task, or completing G1/G2 consumes unseen G3. Source withdrawal deletes a promised call.                                       | High / plausible. Ratified D19/D20 and concurrent/replayed source patterns.                                                                           | Retains existing task ownership. **C11–C12**, **P19–P22**; stable purpose identity, exact reviewed set, independent obligation preservation.                                |
| F06 — Tenant/authority escape                     | Fixed-tenant settings, mutable identifiers, stale roles, broad views or service workers cross boundaries or save after permission loss.                          | Critical / plausible in a naive adaptation; not a verified hosted breach. Current source defects and P12/database boundaries.                         | Adds mandatory trusted command and current PDP enforcement. **C13–C16**, **P23–P26**; tenant-aware keys, grants/RLS, immutable attribution, worker checks.                  |
| F07 — Misleading or inaccessible interface        | Saved/Off is inferred from local state, invalid drafts block Off, currency labels are ambiguous, or a preview actually creates tasks. This undermines control.   | Medium / likely without explicit acceptance criteria. Existing local settings patterns; GOV.UK/W3C and vendor test distinctions.                      | Adds a single truthful form and recoverable actions. **C17–C19**, **P27–P29**; persisted status, independent Off, inert test, keyboard/mobile/error proof.                  |
| F08 — Privacy and misleading donor meaning        | Amount labels imply generosity/extra support; counts/reasons reveal hidden allocations or recipient routes; task creation is mistaken for consent or sending.    | High / plausible. D21, P14 recipient distinctions, current source projection limits.                                                                  | Narrows data and language. **C04/C12/C14/C19**, **P08/P22/P26/P29**; exact permitted projection, factual reason and separate deliberate communication.                      |
| F09 — Partial success and stale correction        | A policy or reason commits but its task/audit/result is lost; retries duplicate work; unavailable source is treated as invalid. Staff must repair by hand.       | High / plausible with async projection. Existing owner durable-intent requirements and isolated failure/replay experiments.                           | Requires durable local effect/intent and result recovery. **C08–C12/C16/C20**, **P13/P16–P22/P30**; idempotent projection, current source recheck, owned unresolved status. |
| F10 — Hidden dependency and competing authorities | P28 depends on optional P35, borrows a finance-risk/rating setting or writes CRM/tasks directly. Later owner changes silently alter meaning.                     | High / plausible across similarly named features. Owner review, OpenSpec activation guard and current unrelated settings API.                         | Fixes native/shared-owner composition and explicit guard reconciliation. **C02/C04/C15/C21**, **P02/P24/P31**; qualified typed contracts, no new vendor/parallel engine.    |
| F11 — Unbounded work or unproven capacity         | Low thresholds generate many legitimate tasks; per-user history scans, synchronous fan-out and cross-tenant caches degrade service. No measured capacity exists. | Medium / plausible; not an observed performance incident. Amount rule can match every eligible gift, and current capped reads cannot forecast volume. | Adds bounded source processing and qualification. **C20/C22**, **P30/P32**; indexed lookups, existing queue, pagination, load gates; no arbitrary silent dropping.          |
| F12 — Unsafe rollout or rollback                  | Existing gifts become live on deployment; old readers mishandle new evidence; reverting code repeats consumed work or deletes references.                        | High / plausible with mixed versions. New criterion with durable history and existing D20 coverage.                                                   | Adds Off-first compatible rollout and safe disable/roll-forward. **C07/C11/C23**, **P10/P19/P33**; explicit source origin and preserve history, no backfill task storm.     |
| F13 — Traceability and unsupported certainty      | Ratified direction or synthetic tests are mistaken for deployed source/UI qualification; divergent terminology reaches tickets and tests.                        | High / likely if the review is flattened into “done.” Current target specs and seeded experiment limits.                                              | Keeps evidence classes and release obligations explicit. **C24**, **P34**; owner-to-spec-to-proof trace and bounded claims.                                                 |

## Independent category review

Every requested category was evaluated independently. A referenced finding carries
all eight concern dimensions above; clauses provide the exact required language.
“No additional concern” is bounded to this decision, not a general certification.

| Category                                  | Material concern?                         | Checked conclusion and amendment                                                                                                                                                                                                                       |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Problem validity, necessity, alternatives | **Yes — F01/F13.**                        | Optional organization preference is valid; universal donor-care benefit is unproved. No-build/manual plus existing reasons is the strongest alternative. Bound controls and measure usefulness, C01–C03/C24.                                           |
| Brittleness                               | **Yes — F02/F03/F04.**                    | A scalar header, two-decimal assumption or worker-time policy fails realistic splits, currencies and delays. Exact sources/units/temporal contract, C04–C10.                                                                                           |
| Technical debt                            | **Yes — F01/F06/F10.**                    | Copying the fixed-tenant preference or adding another policy/task engine creates durable debt. Reuse qualified owners and exact money primitives, C13–C16/C21.                                                                                         |
| Edge cases                                | **Yes — F02–F05/F09.**                    | Equality, multiple lines, fee cover, indirect recognition, missing currencies, refunds, held work, Off/re-enable, source repair and concurrent review explicitly covered, P03–P22.                                                                     |
| Footguns                                  | **Yes — F03/F04/F07.**                    | Silent rounding, zero/default amount, automatic backfill, side-effecting preview and invalid-draft-blocked Off are prevented, C03/C06–C10/C17–C18.                                                                                                     |
| Tenant safety                             | **Yes — F06/F08.**                        | Organization-wide configuration cannot aggregate scopes or grant rights. Tenant-bound relationships, exact subject/LE, caches and notifications checked, C13–C16/C19.                                                                                  |
| Database, RLS, authorization safety       | **Yes — F03/F06/F09.**                    | Grants, both mutation predicates, FKs, null/default/uniqueness, deletion, money precision, functions, views, service workers and immutable audit all require proof, C06/C13–C16/P23–P26. No hosted audit is claimed.                                   |
| Overengineering                           | **Yes — F01/F10.**                        | No scope hierarchy, arbitrary comparator/formula, priority ladder, FX service, new vendor or independent engine. One org policy and per-currency rows, C01–C03/C21.                                                                                    |
| UX/UI and friction                        | **Yes — F07/F08.**                        | Explicit saved state, readable inclusive threshold, clear gift reason, independent Off, inert preview, mobile/accessibility/localization/low-bandwidth recovery. Donor journey unchanged, C17–C19/P27–P29.                                             |
| Source of truth, ownership, invariants    | **Yes — F02/F05/F10.**                    | Settings owns policy; P13/P14 own qualified amount; P12 owns authority; shared task owner owns work/coverage. Read models cannot write truth, C04/C11/C13/C15.                                                                                         |
| Hidden coupling                           | **Yes — F10.**                            | Do not reuse P13 risk/P27 ratings/P35 recipe semantics or introduce a finance-posting dependency on follow-up. Formal guard reconciliation is explicit, C21/P31.                                                                                       |
| Failure modes                             | **Yes — F04/F09.**                        | Lost response, committed intent without card, source outage, delayed projection and correction after acceptance have explicit recovery, C08–C12/C16/C20.                                                                                               |
| Lifecycle, time, concurrency, idempotency | **Yes — F04/F05.**                        | Original live boundary, prospective versions, Off fence, re-enable, accepted restoration, coverage and command receipts distinguish identity from evidence. Seven bounded races support mechanics, C07–C12/P10–P22.                                    |
| Data integrity                            | **Yes — F02/F03/F05.**                    | Exact amount/identity, no role/line duplication, no duplicate tasks or false completion; preserve correction history, C04–C06/C11–C12.                                                                                                                 |
| Security and privacy                      | **Yes — F06/F08.**                        | Hidden route/count leakage, settings vs gift-read authority, caller-controlled attribution, cache/log minimization and separate consent checked. No new public exports/uploads, C13–C16/C19.                                                           |
| Scalability and performance               | **Yes — F11.**                            | No full-history scan or synchronous tenant fan-out. Capacity and indexes require production-shaped proof, with explicit provisional operating targets, C20/C22/P32.                                                                                    |
| Operational burden                        | **Yes — F04/F09/F11.**                    | Self-service settings and durable recovery avoid manual DB repair; legitimate excessive workload needs tenant review, not silent suppression, C16/C20/C22.                                                                                             |
| Observability and auditability            | **Yes — F09/F13.**                        | Separate durable policy/reason/handling history from technical latency/errors. Record source/rule/version/actor without unrestricted donor payload logs, C16/C20/C24.                                                                                  |
| Dependency and integration                | **Yes — F10.**                            | Internal financial/task/PDP contracts are real dependencies. No new external provider or provider webhook directly creates this work. Duplicate/reordered delivery remains guarded, C04/C11/C21. No additional vendor-outage dependency is introduced. |
| Migration, rollout, upgrade               | **Yes — F12.**                            | Off-first activation, no historical admissions, version compatibility, safe disable and retained referenced evidence are required, C23/P33.                                                                                                            |
| Testability, traceability, proof          | **Yes — F13.**                            | Exact clauses and positive/negative/race/auth/migration/a11y/load tests below; synthetic evidence and future runtime proof remain distinct, C24/P34.                                                                                                   |
| Other development hazards                 | **No additional material concern found.** | Checked destructive actions, new storage/credentials, jurisdiction defaults, hidden scheduling and unsupported ownership. The proposal adds none; unsafe defaults, rollback and uncertain ownership are already captured in F01/F10/F12/F13.           |

## Required clauses for later specification

These clauses are ratified future obligations, not claims about current code.

- **C01 — Optional scope.** The system SHALL provide one organization-wide amount-based follow-up policy, initially Off, with no per-subject or per-donor overrides and no guessed monetary/currency default.
- **C02 — Independent purposes.** Enabling, disabling or changing this policy SHALL affect only this amount criterion; other qualified native purposes and authorized manual work SHALL retain their own rules.
- **C03 — Bounded controls.** Authorized staff MAY add, change or remove one positive threshold per supported currency and enable/disable the policy. The comparator SHALL be inclusive “at least.” No unconfigured currency SHALL inherit another amount or FX conversion. Enabled configuration SHALL contain at least one valid row.
- **C04 — Exact source basis.** A comparison SHALL use one source-certified amount for one contribution, qualified follow-up Party, typed ministry subject and currency. P13 direct and eligible P14 recognition profiles SHALL retain distinct vocabulary and shall never be summed. The source owner SHALL certify eligible route, role and exact scope.
- **C05 — Monetary meaning.** The direct amount SHALL include each distinct relevant effective monetary allocation once, exclude fee-cover/unrelated allocations, and precede processor fees/assessments. P14 SHALL own recognized attribution, certify the same eligible non-fee-cover source scope, exclude unrelated allocations, and preserve the before-fees/assessments basis. Neither profile SHALL substitute header totals, commitments, noncash valuation, cumulative gifts, inferred extra support or unqualified attribution arithmetic.
- **C06 — Exact units.** The command SHALL validate positive exact canonical minor units, source-supported currency/exponent and supported range before coercion. It SHALL reject unsupported precision, nonfinite values and unsafe transport rather than round or compare binary floating major units.
- **C07 — Original live policy.** Applicable policy evidence SHALL be proved at the first owner-certified eligible received/support event for the qualified source profile, independently of threshold and downstream recognition/task delay. Processing alone SHALL NOT define that event; a genuine later source-finality event MAY first qualify after enable. Historical acquisition, gift date, client clock, webhook arrival or worker lookup SHALL NOT manufacture a live occurrence or choose its policy. Numeric edits SHALL be prospective.
- **C08 — Admission.** Acceptance of a qualified amount reason and durable projection intent SHALL constitute admission. Settings, source revision and admission races SHALL have one authoritative order; durable task materialization SHALL recover without repeating the intended effect.
- **C09 — Off continuity.** Off/currency removal SHALL stop new admissions and end the relevant enabled interval for unadmitted work. Previously admitted reasons/intents SHALL remain. Re-enable/re-add SHALL NOT revive old unadmitted work, import history or gifts whose qualified original live boundary occurred while Off. Unaffected currency intervals SHALL continue.
- **C10 — Current correction.** Admitted reasons SHALL use their captured rule with current qualified source and authority. Actual invalidation SHALL withdraw only the affected reason; unknown availability SHALL NOT be treated as invalidity. Qualified restoration of the same previously admitted originally live unconsumed purpose MAY repair existing work, including while Off; source requalification alone SHALL NOT reopen human-handled coverage; qualified D20 correction/Undo SHALL remain distinct.
- **C11 — One shared work effect.** Stable business gift/purpose identity SHALL govern deduplication across criteria, policy versions and transport deliveries. Existing D19/D20/task-owner compatibility and exact reviewed-set coverage SHALL apply. No new shadow task or handling ledger SHALL be introduced.
- **C12 — Honest handling.** A new unreviewed gift SHALL remain uncovered by an earlier review. Withdrawn amount reasons SHALL NOT remove independent obligations. Done/Not needed SHALL NOT claim an interaction, sending, consent or permanent donor exemption.
- **C13 — Current authorization.** Policy management, gift reading, source production and task actions SHALL each use the current canonical PDP/Active Assignment and purpose boundaries. Client roles, IDs, cached On state or settings access SHALL NOT confer another capability.
- **C14 — Tenant and scope integrity.** Relationships, queries, caches, responses and notifications SHALL bind the trusted tenant and exact authorized financial/subject scope. Organization-wide policy SHALL NOT mix Legal Entities, reveal hidden existence/counts or permit a row to transform into another tenant/owner state.
- **C15 — Database boundary.** Schema and commands SHALL enforce unique current policy/currency identity, non-null valid required fields, positive exact values, tenant-aware references and immutable trusted attribution. Grants, RLS USING/WITH CHECK, views/functions and privileged paths SHALL preserve the same boundary; referenced evidence SHALL NOT be hard-deleted.
- **C16 — Durable changes.** A settings Save SHALL commit its complete validated multi-currency configuration, current revision and required audit atomically, with no partial per-currency success. Settings commands SHALL use expected revisions and durable result identity; lost responses SHALL resolve before repeating mutation. Immutable policy/source/handling history SHALL remain distinct from technical logs. Logs SHALL minimize private payloads and derive actor attribution from trusted context.
- **C17 — Truthful settings.** UI SHALL distinguish loading, error, saved Off/On and draft edits. Save/Turn on SHALL report persisted state. Turn off SHALL remain usable despite invalid drafts, SHALL NOT save those drafts, and a later Save SHALL NOT implicitly reactivate the policy.
- **C18 — Inert understandable preview.** Inline review/test SHALL explain threshold, currency, scope and prospective effect without writing a task, communicating, reading unauthorized gifts or implying condition match guarantees task creation. Activation and effective edits SHALL retain a declarative fixed definition, exact-policy preview, inert actual-evaluator test and durable activation/test/activity evidence under the existing automation-management authority mapped through P12; failed validation SHALL NOT block Off.
- **C19 — Clear accessible work.** The UI SHALL show permitted gifts and factual direct/recognized amount reasons with the captured rule, preserve D20 reviewed-set clarity, and meet the existing accessibility/localization/mobile standards. It SHALL NOT label donor generosity/extra support or expose internal criteria on donor/public surfaces.
- **C20 — Recovery and observability.** Source/intent projection SHALL use bounded existing recovery with idempotent effects and current checks. Unknown or held qualification SHALL have an accountable owner and safe recovery state. Policy changes, admissions, withdrawals/restorations, projection outcomes and handling SHALL be traceable without duplicating source truth.
- **C21 — Owner composition.** Native P28 work SHALL use qualified P13/P14/P12/shared-task interfaces and SHALL NOT depend on optional P35 activation, reuse finance-risk/rating semantics or write around existing domain commands. Formal specification SHALL reconcile applicable automation guards without silently weakening them.
- **C22 — Capacity and workload.** Evaluation SHALL use indexed bounded lookups and existing queue/pagination mechanisms, without per-user history scans or silent dropping of eligible work. Production-shaped latency/backlog and legitimate workload qualification SHALL precede activation; operational targets SHALL have owners and responses.
- **C23 — Safe rollout.** Deploy compatible schema/readers/commands before producer activation, initialize tenants Off, preserve source origin and referenced history, and introduce no historical task backfill. Disable SHALL stop new admission while preserving accepted evidence and safe recovery; rollback SHALL NOT replay consumed work.
- **C24 — Traceable proof.** Each clause SHALL trace from this decision through glossary, owner/ADR reconciliation, OpenSpec/design/tasks/tickets, implementation tests and release evidence. Ratification, synthetic fixtures and published target documents SHALL NOT be represented as production qualification.

## Falsifiable acceptance and release proof

These are required tests for the actual owner-bound implementation. Existing
fixtures demonstrate only the specifically reported mechanics.

| Proof | Required observable result                                                                                                                                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01   | New/migrated tenant is Off; no default amount/currency. Two projects in one tenant use the same configured rule without an override UI or API escape.                                                                                                                                 |
| P02   | Off and a high threshold leave unrelated first-support/special/above-commitment/manual work unchanged; optional P35 is not required.                                                                                                                                                  |
| P03   | Below/equal/above in configured currency gives false/true/true; missing currency gives no amount reason; no implicit FX or zero.                                                                                                                                                      |
| P04   | Relevant lines within one gift combine once; unrelated ministry/LE lines and fee-cover do not cross the threshold. Two separate gifts do not combine even in one task.                                                                                                                |
| P05   | Processor fees/assessments do not redefine support; effective owner-confirmed reversals/corrections do. Commitment payments are not labeled extra.                                                                                                                                    |
| P06   | Sponsor/batch, partial header recognition, duplicate roles and solicitor/honoree/member routes use only an exactly certified eligible P14 amount; ambiguity holds only the affected route.                                                                                            |
| P07   | Every supported exponent, including zero/three/four where source-qualified, exact maximum and maximum+one are tested. Fractional minor units, rounding/coercion, unsafe JSON numbers and unsupported precision are rejected.                                                          |
| P08   | Direct legal and recognized vocabulary match the source; no double count, false donor attribution or unqualified additional recipient.                                                                                                                                                |
| P09   | Locale decimal/grouping inputs either parse exactly under displayed locale or explain ambiguity; ISO currency remains visible. No hidden two-decimal or USD assumption.                                                                                                               |
| P10   | Source before/after activation uses the correct boundary; historical/backdated imports and already-eligible receipts while Off create no new amount work on activation. A genuinely newly eligible source-finality event after enable can qualify even if processing began while Off. |
| P11   | Both policy-edit/live-capture orders preserve the rule at original authoritative receipt; delayed workers cannot qualify using a later lower threshold.                                                                                                                               |
| P12   | Held original-live work retains captured threshold within its uninterrupted currency interval; Off/removal ends its eligibility; other currencies remain unaffected.                                                                                                                  |
| P13   | Both Off/admission orders give one valid outcome; accepted intent before Off materializes once afterward, while unadmitted work after Off is denied.                                                                                                                                  |
| P14   | Re-enable/re-add starts a new interval and never revives old unadmitted candidates, even on replay.                                                                                                                                                                                   |
| P15   | Genuine source correction of admitted work reevaluates its captured threshold, not current numeric policy; unavailable source does not masquerade as invalidity.                                                                                                                      |
| P16   | Previously admitted, source-withdrawn, originally live unconsumed work can restore while Off under current rights. Never-admitted and consumed/Not needed work cannot use that repair path.                                                                                           |
| P17   | Both source-correction/admission orders use one current certified amount/revision; stale source evidence cannot commit a contradictory reason.                                                                                                                                        |
| P18   | Permission loss or tenant/subject change before settings/admission/projection commit denies the effect; reconnect/refresh does not replay old authority.                                                                                                                              |
| P19   | Repeated events, source/policy revisions and overlapping criteria produce one intended compatible task/member; captured reason changes do not reset handled coverage.                                                                                                                 |
| P20   | Review G1/G2 with G3 arrival handles only the reviewed set; materially changed selected gifts require refresh, unrelated arrivals do not erase valid review.                                                                                                                          |
| P21   | Financial withdrawal preserves independent promised calls/reasons; qualified D20 restoration and conditional Undo preserve one current compatible task and history.                                                                                                                   |
| P22   | Task completion creates no sending/interaction/consent fact; connected-send outcomes remain independently truthful. Not needed is scoped to reviewed work.                                                                                                                            |
| P23   | Cross-tenant policy/source/task IDs, caller actor/owner/tenant/source forgery, reassignment mutations and unauthorized currencies are rejected at authoritative boundaries.                                                                                                           |
| P24   | Actual grants, RLS both mutation predicates, functions/views, browser endpoints and service-role paths preserve P12/coarse tenant boundaries. Test allowed-to-forbidden resulting-row changes.                                                                                        |
| P25   | Whole multi-currency Save is all-or-nothing, including a failing row; stale concurrent save conflicts. Repeated command has one policy version/effect; lost response resolves before retry. Global Off and currency remove/re-add affect exactly the intended intervals.              |
| P26   | Policy managers without gift-read rights receive no donor preview; missionaries/coach/public surfaces and cache/notification paths reveal no hidden data/count/status.                                                                                                                |
| P27   | Invalid draft cannot block persisted Off or be saved by it. Generic Save afterward cannot silently reactivate; failed/unknown saves never show false success/Off.                                                                                                                     |
| P28   | Keyboard and screen-reader journey, focused errors, status announcements, touch targets, 320px reflow/200% zoom, long names and slow/lost responses are tested in actual UI.                                                                                                          |
| P29   | Staff and missionaries can explain amount basis, “at least,” prospective edits, existing-work preservation and no automatic sending in a moderated task; fix every critical misunderstanding before release. No usability result is claimed yet.                                      |
| P30   | Crash before/after source acceptance, policy save, intent commit and task projection recovers once; missing/duplicate/out-of-order delivery has a traceable owned outcome and no silent work loss.                                                                                    |
| P31   | Applicable native/automation activation contract has inert preview/test, management authorization and audit; no bypass or optional-workflow prerequisite, no direct writes around shared owners.                                                                                      |
| P32   | With production-shaped largest qualified tenant, measured peak source concurrency and recovery backlog, query plans stay bounded and the operating targets below pass. Record dataset sizes/rates/hardware; no unsupported capacity number is claimed.                                |
| P33   | Old/new version compatibility, Off-first deployment, historical-origin preservation, disable/re-enable and rollback after admissions retain coverage/history without duplicate or historical work.                                                                                    |
| P34   | Clause/owner/spec/task/test/release mapping is complete; source lane/currency qualification, user study and performance results are explicit, while original synthetic evidence retains hashes and limits.                                                                            |

## Ordered synthesis and monitoring

1. **Before recording this reviewed answer:** resolve scope, amount meaning,
   comparison boundary, Off behavior and previous decisions. This review resolves
   them: founder-selected org-wide policy, ratified inclusive exact per-gift basis,
   prospective settings, retained accepted work, separate source correction and
   unchanged D19–D21. No further product question is required to state the corrected
   decision. The founder subsequently explicitly ratified these amendments, as
   recorded below.
2. **Capture in formal spec/design before implementation:** C01–C24, the source
   profile/temporal matrix, authoritative settings location and current permission
   binding, exact native activation guard reconciliation, accessible copy and P01–P34.
   The P14 partial-attribution adapter must be concrete; no permanent ambiguous
   header fallback. Owner responsibilities remain P28 product/tasks, P13/P14 source,
   P12 authority, shared settings and shared task services.
3. **Require in implementation:** qualify the source-to-policy ordering and exact
   amount adapters first; then typed settings commands/history and tenant boundary;
   then durable source admission/shared task projection; then the simple staff and
   missionary UI. Validate each actual currency/profile before exposing it. Complete
   authorization/concurrency/failure proof before enablement; UX proof before release.
4. **Roll out:** compatible schema/readers/commands, tenants Off, representative
   source/PDP/task integration and fault tests, moderated staff/missionary checks,
   production-shaped load, then deliberate authorized tenant activation. Preserve
   original coverage and historical origin through rollback. No historical task
   backfill or automatic communications are part of rollout.
5. **Monitor only residual operational/usefulness risks:** none of the financial,
   tenant or duplicate invariants is deferred to monitoring. Initial operational
   targets below are engineering/product targets ratified with D22, not measurements
   or existing canonical owner SLOs; reconcile any stricter canonical target first.

| Signal                                                                    | Initial threshold                                                                                                                        | Accountable owner                                        | Response                                                                                                                                                                              |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Forbidden tenant/subject disclosure or duplicate accepted business effect | Any confirmed occurrence                                                                                                                 | Platform security on-call + shared task owner            | Contain affected producer/read path, retain evidence, repair through owner commands and block reactivation until regression proof. Do not silently delete financial/handling history. |
| Accepted intent without projected work                                    | Oldest recoverable item over 5 minutes for 10 consecutive minutes, or any unrecoverable item                                             | Shared task service on-call                              | Inspect/replay existing durable intent, correct worker failure; if systemic, halt new affected admissions while preserving accepted work.                                             |
| Settings/admission command reliability                                    | Over 1% server failures in 15 minutes with at least 100 attempts; any repeatedly failing acknowledged command independently investigated | Settings/P28 service on-call                             | Diagnose database/authority path, recover result, throttle or disable affected producer safely; never return false saved state.                                                       |
| Settings and task-detail response latency                                 | p95 over 1 second for 15 minutes at qualified load, excluding user network                                                               | Owning service on-call                                   | Inspect query plans/queue saturation, restore bounded access; no permission/data shortcuts.                                                                                           |
| Unqualified/held source route                                             | Any previously advertised supported route unqualified; held original-live candidate older than 24 hours                                  | P13/P14 adapter owner                                    | Investigate missing/current evidence and repair through the same source contract; communicate unavailable route honestly. Do not replace unknown with zero.                           |
| Amount-only task usefulness                                               | At least 20 exact reviewed amount-only gift-purpose dispositions in rolling 30 days, with over 50% Not needed                            | Tenant stewardship administrator, with P28 product owner | Review threshold/scope expectations and decide whether to change amounts or turn Off; no automatic threshold learning or judgment about missionary effort.                            |

The workload numerator and denominator come from exact source-owned reviewed
gift-purpose dispositions, not task-card counts or a mixed task's overall status.
Other concurrent reasons exclude that member from this amount-only measure.
No new analytics engine or automatic policy learning is required.
Workload review is private operational feedback, not an individual
performance score. Low-volume organizations can review the ordinary history without
waiting for the aggregate threshold.

## Evidence integrity, limits and traceability

Six bounded workstreams support this report: [finance](d22-evidence/financial-basis.md),
[governance](d22-evidence/owner-policy-boundaries.md),
[UX](d22-evidence/settings-and-task-ux.md),
[current source](d22-evidence/current-source-and-settings.md),
[database/lifecycle](d22-evidence/database-policy-lifecycle.md), and
[counterexamples](d22-evidence/amount-policy-counterexamples.md).
The [cross-review reconciliation](d22-evidence/cross-review-reconciliation.md)
records independent corrections; [documentation verification](d22-evidence/review-verification.json)
checks exact status, references, clauses/proofs and preserved evidence.

The 25 finite examples validate a deliberately bounded semantic model. The 29
PostgreSQL outcomes include seven actual controlled races and an expected unsafe
rounding case; their passing count does not mean the unsafe behavior is acceptable.
The experiment seeds source eligibility, amount/basis and current authority. Its
settings function operates on one existing tenant/currency head per call; it does
not implement the full organization-wide multi-currency Save, global Off or
currency removal/re-add contract. It is not actual financial/P12/source-service qualification, nor a new task engine.
Durable settings-command retry receipts, source restoration while Off and actual
D20 review/Undo remain required tests, not outcomes proved by this new probe. Prior D20 38/38 outcomes/nine races and D21
18 examples retain their original scope; they were preserved, not rerun or counted
as new D22 results. No hosted database inspection, real provider delivery,
production load, authenticated competitor trial or missionary interview occurred.

The old DOCX remains contextual under the [legacy reconciliation](phase28-legacy-dashboard-context.md),
not authority for old dependencies. Formal trace sequence is this D22 answer →
[glossary](../../../../CONTEXT.md) → owning P28/P13/P14/P12/task/activation reconciliation →
OpenSpec requirements/design/tasks → implementation tickets → actual proofs →
release evidence. This session records the first two and the required mapping;
it does not fabricate downstream artifacts or qualification. No ticket or external
message was created. The founder brief and prior evidence remain unchanged.

## Subsequent explicit ratification

On **October 17, 2026 Asia/Bangkok**, the founder instructed: “Ratify this decision
and amendment. Then continue with this phase 28 grill-with-docs session.”

This explicitly ratifies the corrected decision, C01–C24 and P01–P34 as future
obligations: one organization-wide optional amount policy, Off by default,
positive inclusive per-currency thresholds, exact source-owned amount and
original-live boundary, prospective changes, preserved admitted work, current
correction and the existing task/coverage owners. Current authority, atomic
settings changes, inert activation proof and clear accessible UX remain required.
The initial operational targets and qualitative proof gates are ratified design
judgments, not measured production characteristics.

Ratification does not establish actual financial/P12/source/task/UI qualification
or change any prior experiment's scope. Twenty-five finite counterexamples and
29 isolated PostgreSQL outcomes/seven races retain their limits, including the
expected unsafe rounding case. Original verification and its script are preserved
as initial snapshots. No tests were rerun to manufacture a ratification result.
No formal owner/ADR/OpenSpec, app/schema, dependency, live/provider operation,
ticket or external contact changed. The founder brief remains unchanged.
