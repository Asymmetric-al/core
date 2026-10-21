# Phase 28 D50 — preserve the campaign of continuing recurring support

October 18, 2026. **Q50 answered A; selected with completed research/review.**
The founder chose **“Keep the recurring gift’s original campaign”** and requested
deep modern best-practice research. **Disposition: Accept with required
amendments.** C01–C09 below clarify the selected behavior; their full wording is
not separately ratified merely by selecting A. This is a research/decision record,
not a formal specification, implementation or Phase 28 release qualification.

## Exact corrected decision

**D50 — An existing recurring gift keeps its campaign when its tracking code is
reassigned.** Preserve the campaign association accepted for each recurring line,
including a source-qualified absence of a campaign. Later source-generated
installments inherit the applicable accepted attribution. An ordinary code edit,
report refresh, amount/schedule/payment-method change, provider replacement or
pause/resume must not silently choose a different campaign.

Authorized staff may still deliberately amend campaign attribution for future
eligible occurrences through P16's existing prospective term-version boundary.
Show which occurrences the accepted change affects, preserve the original and
intervening history, and leave earlier accepted gifts under D49. A campaign-only
amendment preserves a truthful source code; it is not a new donation, a donor
instruction to change destination, or permission to edit posted financial facts.
Routine maintenance carries the applicable accepted attribution forward rather
than resolving the current code registry again.

An independently recorded gift retains its own accepted campaign/source
attribution when applied toward a commitment. Fulfillment records what that gift
satisfies; it does not rewrite what prompted the gift. Source-generated recurring
installments and independently captured gifts matched later must not be conflated.
Neither campaign attribution nor matching changes received money, designation,
donor credit, receipt ownership or payment authorization.

A closed/archived campaign or retired source code retains its historical reference;
that administrative status does not by itself move or cancel continuing support.
Current destination, payment authorization, privacy and other owner eligibility
rules still apply. A canceled recurring line remains canceled: P16's **Restart
giving** already uses fresh checkout and fresh attribution, unlike pause/resume.

Tenant control remains with existing permissions, campaign management and exact
recurring amendment capabilities. No tenant setting silently switches existing
commitments to today's campaign, and no new donor or missionary action is added.
Where staff have deliberately amended attribution, label the effective value
**Campaign attribution**; reserve **Original campaign** for the actual origin in
history. Do not mislabel an amended value as the original.

## What the research actually establishes

[Fresh primary research](d50-evidence/external-research.md) reviews current official
fundraising documentation and its limits. [UX guidance](d50-evidence/ux-research.md)
adds current accessibility guidance and established error-prevention research.
Retrieval is October 18, 2026; older publication dates are identified. None is a
user study of Asym or evidence that every nonprofit follows one campaign rule.

The strongest evidence supports **preservation by default plus a deliberate
amendment**, not an immutable-original-forever ban:

- [Donorbox](https://donorbox.zendesk.com/hc/en-us/articles/360020294052-What-happens-to-recurring-donations-once-the-campaign-is-archived)
  documents continuing recurring payments under an archived campaign
  and a separate plan-change path. This is a close lifecycle analogy; it does not
  prove Core's schema, permissions, historical reporting or restart behavior.
- [Salesforce NPSP](https://help.salesforce.com/s/articleView?id=sfdo.npsp_track_rd_changes.htm&language=en_US&type=5)
  documents a deliberate campaign change when an existing
  recurring donor responds to a later upgrade appeal, with change history. This
  supports retaining an explicit future amendment rather than treating any amount
  increase or tracking-code edit as evidence of a new appeal.
- Blackbaud documents prospective recurring amendments that preserve processed
  payments and explains a pending-retry boundary. A different manual-retry article
  uses the recurring record's current amount; it does not specify campaign retry
  semantics. Do not import that amount rule or claim vendors uniformly freeze
  every retry field. Core's accepted occurrence rules govern.
- CiviCRM specifies precedence for incoming, recurring and template attribution.
  Its documented override flexibility is counterevidence to a universal immutable
  origin rule. Core instead requires exact source authority and deliberate
  prospective versioning, under the selected A and existing owners.

The strongest alternative was B: later installments follow ordinary code
reassignment. It makes current campaign organization convenient but lets a setup
edit change attribution of support already established. A better matches Core's
recorded recurring-origin model while preserving explicitly authorized changes.
This is the founder's product judgment, supported by comparable practices rather
than imposed by a vendor standard.

## Repository facts and exact owner reconciliation

The [independent governance/code review](d50-evidence/governance-review.md) identifies
actual inspected sources and qualification limits. The important source facts are:

- [P13 recurring copy-forward](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1606)
  already freezes source-code origin and display facts, but not an unambiguous
  campaign mapping revision. D50 explicitly settles that recurring mapping seam.
- [P16 stable lines and ownership](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:410)
  places attribution on the recurring line, not the group, billing cohort or
  provider subscription. Different lines may retain different origins even when
  collected together; a cohort split or provider replacement is not a new gift origin.
- [P16 term versions](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1569)
  already permits deliberate prospective attribution changes. Preserve it, while
  replacing any interpretation that derives later installments from today's live
  source-code campaign mapping. Original and effective attribution are historical
  versions of one owner fact, not competing writable campaign fields.
- [P16 occurrence evidence](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1621)
  and [fulfillment](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1003)
  separate expected occurrences, source money and applications. Copy-forward needs
  exact source lineage; applying an unrelated captured gift cannot become a
  campaign correction or a retroactive amendment to that gift.
- [P16 pause/restart](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:677)
  already distinguishes a continuing commitment from a canceled-line restart.
  D50 preserves that distinction without another restart choice or setting.
- [D49](phase28-d49-preserve-earlier-campaign-attribution-decision.md),
  [ADR-0206](../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md)
  and [REQ27-F79](../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:747)
  retain original financial facts, qualified effective corrections and distinct
  historical artifacts. D50 never makes a projection a money writer.

Formal integration must reconcile P13 D14/D13, P16 line/term/occurrence contracts,
their declared OpenSpec projections, E7's program/P27 notices and downstream
consumers. Existing live-registry wording cannot remain normative for later
installments. Do not add a mutable campaign field on the posted line, a P28 ledger,
or provider metadata as the authoritative origin. The inspected code is not proof
that the intended line/term/campaign contract exists or is safe in production.
Formal owners and code remain unchanged under this research-only session.

## User journey and tenant control

In the existing tracking-code editor, show the current/proposed assignment and
**“Existing recurring gifts keep their campaign.”** The earlier-gift consequence
from D49 stays clear. This is a predictable rule, not a choice every staff member
must make each time a code changes.

In the permitted recurring detail, show its campaign attribution and a quiet
Closed/Archived label when relevant. Show the source-qualified **No campaign**
separately from **Attribution unavailable**. Restricted identity is omitted under
its existing disclosure rules. An inactive campaign is not an error badge on an
otherwise valid recurring payment and is not silently substituted with an active one.

A staff member with current amendment authority uses the existing recurring edit
and review path for **Change campaign for future gifts**. Show old/new campaign,
reason/history evidence and the qualified first affected occurrence or date.
Do not offer a user-selected arbitrary backdate or an “also rewrite past gifts”
checkbox. Past mistakes use D49's separate posted-attribution correction. A
preview is not approval; the command rechecks authority, term revision and actual
eligible scope at acceptance. Preserve existing owner approval requirements;
D48's posted-gift policy is not automatically a new recurring-amendment policy.

Ordinary amount, cadence, schedule, payment and pause changes require no new
campaign choice. A change of amount alone does not prove that another appeal
caused the gift. After an intentional amendment, show current effective attribution
and any pending future change truthfully, with history available in context.
Avoid calling the amended campaign “original.”

Use existing Base UI/base-maia controls, semantic tokens, visible labels and
keyboard/focus/status behavior. On a phone, the campaign label, affected scope
and primary action remain readable with long localized names. A lost response
reconciles the same command, a stale revision returns to review with safe input
preserved, and a pending result never says complete. No duplicate confirmation
wizard, new settings destination, donor interruption, missionary chore or
automatic outward notification is introduced.

## Required review amendments

These exact requirements complete the selected answer for later owner integration;
they do not prescribe a new database design or imply implementation authorization.

- **C01 — Stable line attribution.** Each recurring line SHALL retain the
  campaign association and known no-campaign state accepted with its qualified
  attribution version. Ordinary source-code remapping and non-attribution term
  changes SHALL carry that association forward, not recapture today's mapping.
  Resolve and retain exact source evidence; unknown is not known no-campaign.
- **C02 — Deliberate prospective amendment.** Existing P16 authority MAY create
  a new prospective attribution version for exact selected lines and eligible
  future occurrences. Preserve the truthful source code unless it too is being
  deliberately amended. Preserve prior versions and accepted gifts; disclose the
  actual effective scope. Original origin, effective version and an independently
  captured gift's source are distinct facts, not interchangeable report shortcuts.
- **C03 — Accepted occurrence boundary.** Pending, submitted, failed/retried,
  in-flight, late-imported and replayed work SHALL keep its source-qualified
  occurrence/term binding. An amendment cannot silently reinterpret already
  accepted work. Reconcile exact command/occurrence fences and effective-date
  rules through P16; no browser date, callback time or provider metadata alone
  selects a newer attribution. A date-only rule must not rebuild a submitted attempt.
  Unclaimed future work may be superseded only through the existing qualified
  command; immutable snapshots are never patched in place.
- **C04 — Fulfillment is not attribution.** Applying an independently captured
  contribution to a recurring occurrence or linked fixed pledge SHALL preserve
  that contribution's accepted attribution. Fulfillment changes coverage only.
  Source-generated recurring gifts use their exact occurrence-line attribution.
  Received-by-gift-campaign and fulfilled-toward-commitment are distinct, clearly
  labeled measures with no duplicate money. Any actual gift-attribution correction
  still uses P13/D49, and cannot be inferred from a match.
- **C05 — Lifecycle continuity.** Pause/resume, stable-line cohort/schedule/provider
  changes, campaign closure/archive and code retirement SHALL NOT silently reset
  attribution, redirect funds or cancel recurring authorization. Preserve current
  eligibility and source restrictions. Canceled-line restart follows P16's fresh
  checkout and new attribution; a reporting-history rule cannot revive an ended
  line or reuse old payment authority. A historical reference is not permission
  to select an inactive campaign for a new commitment.
- **C06 — Authorized, atomic, retry-safe acceptance.** Derive Tenant, actor and
  current authorization context from trusted server state. Check the exact line,
  term, proposed target and source revision; enforce same-Tenant/entity/currency
  boundaries where required. Configuration, recurring amendment, gift correction
  and payment powers stay distinct. Source mutation, durable audit and required
  effect intent commit coherently; retry returns the same semantic effect and
  stale/conflicting commands cannot create two current attribution versions.
- **C07 — Coherent projections and adoption.** Every consumer SHALL use the
  qualified P13/P16 attribution/fulfillment contracts, explicit currency/entity/
  period scope and disclosure before aggregation. Version/cache invalidation SHALL
  include attribution amendments and corrections, not only money postings. Keep
  history/artifacts intact. Preserve supported legacy evidence; do not reconstruct
  missing origin from today's registry. Qualify compatible writers/readers,
  replay/restore and migration before activation. Unavailable attribution gates
  the affected measure, not independently qualified relationship or payment work.
- **C08 — Simple truthful interaction.** Show the current campaign, intended
  amendment and actual affected scope in the existing flow. Use accurate lifecycle
  and source-backed save/pending/error states, accessible status feedback and
  recovery without duplicate commands. Tenant permissions may restrict actions;
  this answer adds no switch to change established attribution implicitly, no
  second reporting engine and no compulsory donor/missionary interaction.
- **C09 — Scoped reconciliation.** D50 SHALL settle recurring code-remapping
  behavior without claiming all E7 semantics or runtime qualification complete.
  Reconcile remaining hierarchy/current-versus-historical and precise temporal
  evidence using existing owner rules first. Preserve D49's separate review
  amendment status; neither answer bulk-ratifies earlier packets or authorizes
  `/to-prd`, `/to-issues`, deployment or live operations.

## Material findings and permanent prevention

Severity/likelihood are qualitative judgments about an incorrect implementation,
not observed incident rates. Exact requirements above are the prevention strategy.

| ID  | Failure and why it matters                                                                                                        | Severity / likelihood without prevention                             | Evidence and effect on answer                                                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | A code, amount or provider edit silently assigns later installments to another campaign, corrupting recurring-source performance. | High / likely if the live registry is reread during every term copy. | P13:1606 versus live exception; P16:1569 needs exact campaign-version interpretation. Require C01/C02/C05; this narrows the source contract, not the selected A. |
| F2  | “Original forever” blocks valid future amendments, or the UI labels a deliberately changed value as original.                     | Medium to high / plausible literal interpretation.                   | P16 prospective versions and official NPSP upgrade-campaign example. Preserve deliberate change and truthful labels through C02/C08.                             |
| F3  | Group/cohort-level copying collapses different line origins; retries or racing amendments take a later version.                   | High / plausible with subscription-centric legacy storage.           | P16 stable lines/occurrences and current source limitations. Pin exact line/term and command boundary, C01/C03/C06.                                              |
| F4  | Matching an independently captured gift rewrites its campaign or counts received money twice.                                     | High / plausible if expected support is treated as financial truth.  | P16 fulfillment authority plus D49/REQ27-F79. Keep matching and attribution separate, C04/C07.                                                                   |
| F5  | Retirement/closure accidentally stops giving, or a restart silently reuses old attribution/authorization.                         | High / plausible lifecycle conflation.                               | P13 retired-code history and P16 canceled-line restart. Apply C05; no new automatic lifecycle side effect.                                                       |
| F6  | Permission gaps, forged target/actor, missing legacy history or cache drift expose information or fabricate attribution.          | High / conditional; no deployed exploit or failure established.      | P12/P13/P16 same-scope constraints, source facts and incomplete implementation. C06/C07 require all-path authorization, versioning and evidence-based migration. |
| F7  | Unnecessary settings and confirmations obscure a simple rule, or an indeterminate save appears complete.                          | Medium / plausible; actual user research outstanding.                | W3C visible guidance and NN/G error prevention. One existing edit/review, stable default, truthful feedback and no new chore: C08.                               |

## Category-by-category review

Each material category references the fully described finding, its severity,
likelihood, evidence and exact C01–C09 prevention above. No material runtime
absence is inferred from a documentary review.

| Category                                                     | Material concern and disposition                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity and alternatives                 | **Yes — F1/F2.** Attribution explains the origin of continuing support. A avoids silent remapping; B favors current grouping. Preserve deliberate future amendments rather than an absolute freeze.                                                                                                                                    |
| Brittleness                                                  | **Yes — F1/F3.** Current-registry lookup, provider-subscription identity and timestamp guesses fail under ordinary changes. C01/C03 preserve source lineage.                                                                                                                                                                           |
| Technical debt                                               | **Yes — F1/F3/F6.** Duplicated campaign truth, legacy pledge reuse and unresolved owner wording become expensive. Reconcile the existing line/term authority, not a second model.                                                                                                                                                      |
| Edge cases                                                   | **Yes — F3/F4/F5.** Mixed-origin lines, no campaign, paused/ended/restarted gifts, manual matching, partial refunds, retired codes and stale amendments require explicit tests below.                                                                                                                                                  |
| Footguns                                                     | **Yes — F2/F4/F7.** An amount increase is not campaign intent; matching is not attribution; a code edit is not a recurring amendment. Separate those actions and label effects.                                                                                                                                                        |
| Tenant safety                                                | **Yes — F6.** Same code text, shared payer/email or provider customer cannot bind another tenant/line. Enforce exact source identities and authorized target selection.                                                                                                                                                                |
| Database, RLS and authorization safety                       | **Yes — F3/F6.** Qualify tenant/entity-aware relationships, required attribution-state validity, unique effective versions and immutable evidence. Grants/RLS including USING/WITH CHECK and privileged/import paths must preserve old/new-state authority. Tenant/actor/approval are trusted-context facts; no passing runtime claim. |
| Overengineering                                              | **Yes — F7.** Avoid a tenant rule matrix, new temporal engine, per-payment campaign prompt or duplicate audit UI. Reuse existing versions, commands and history.                                                                                                                                                                       |
| UX/UI and user friction                                      | **Yes — F2/F7.** Show effective attribution, archived status and actual amendment scope; no repeated confirmation or new donor task. Verify phone/keyboard/assistive feedback, localization, long names and poor-network recovery.                                                                                                     |
| Source of truth, ownership and invariants                    | **Yes — F1/F3/F4.** P16 owns line terms/occurrences; P13 gift facts; fulfillment only links them. One current effective version per owner grain and no campaign-induced money movement.                                                                                                                                                |
| Hidden coupling                                              | **Yes — F1/F5.** A report registry, campaign lifecycle or provider replacement must not indirectly edit recurring origin or stop payment. C01/C05 break that dependency.                                                                                                                                                               |
| Failure modes                                                | **Yes — F3/F6/F7.** Lost response, partial secondary update or stale source cannot manufacture success or a duplicate effect. C06/C07 preserve coherent recovery and unavailable reporting.                                                                                                                                            |
| Lifecycle, temporal correctness, concurrency and idempotency | **Yes — F3/F5.** Preserve exact occurrence version, amendment scope and stable line across continuity operations; restart creates new authorized work. Current commands serialize, retries return original effects.                                                                                                                    |
| Data integrity risks                                         | **Yes — F1/F4/F6.** Known no campaign differs from missing evidence; source generated and independently matched gifts differ. Protect accepted history and signed financial lineage.                                                                                                                                                   |
| Security and privacy risks                                   | **Yes — F6.** Campaign labels and totals can reveal restricted ministry context; audience access, exports/caches/logs and retention stay source-governed. Do not clone raw sensitive attribution into permanent versions.                                                                                                              |
| Scalability and performance risks                            | **Yes — F6.** Unbounded per-installment history joins and divergent caches can fail at volume. Require indexed source/version access, shared projections and measured representative budgets; no new throughput number asserted.                                                                                                       |
| Operational burden                                           | **Yes — F5/F6/F7.** False archived-campaign errors or manual database repairs would burden staff. Retain valid historical references, exact amendment tooling and source reconciliation; no routine campaign reassignment chore.                                                                                                       |
| Observability and auditability gaps                          | **Yes — F2/F3/F6.** Preserve original/effective attribution, amendment actor/reason/source revisions and outcome separately from technical logs; distinguish manual application from campaign correction.                                                                                                                              |
| Dependency and integration risks                             | **Yes — F3/F6.** Provider metadata/retries may disagree with Core's accepted intent. Qualified source mapping wins; ambiguous lineage remains unresolved. External researched products add no runtime dependency.                                                                                                                      |
| Migration, rollout and upgrade risks                         | **Yes — F6.** Do not infer legacy campaign from current registry or deploy mixed live/frozen readers. Preserve evidence and typed meaning through migration, restore and rollback.                                                                                                                                                     |
| Testability, traceability and proof                          | **Yes — F1/F6.** Tie this precise ruling to P13/P16/E7 and consumer requirements after authorization; planned assertions below are not passing runtime tests.                                                                                                                                                                          |
| Other development hazards                                    | **No additional independent concern found.** Checked designation, credit, receipts, donor payment authority, missionary capability, optional integrations and new glossary terms. Existing owner duties remain; no new financial or communication power.                                                                               |

## Adversarial check

### What could go wrong with this answer?

A routine edit could recapture today's campaign, or a fulfillment match could
rewrite an unrelated gift. Stable line attribution and separate source-generated
versus independently captured money prevent those two plausible failures.

### What hidden assumptions are we making?

“Original campaign” assumes qualified origin evidence and does not mean a value
can never be deliberately amended. A provider subscription, shared cohort or
latest gift does not prove that origin. Missing legacy evidence remains a gap.

### How does this affect the whole product?

P13/P16 must agree on exact line/term/occurrence meaning and provide one qualified
projection to P27/P28 and reporting. Ledger, recognition, fulfillment, receipt,
payment authorization and communication owners retain their existing boundaries.

### How does this affect the end-user experience?

Staff can reorganize tracking codes without disturbing established recurring
attribution. An intentional change uses the existing review/history flow. Donors
and missionaries receive no extra setup or administrative task.

### Does this follow modern best practices?

Current official documentation supports preservation plus explicit amendments,
with materially different product details. It does not establish a universal
immutable-origin policy. The selected rule fits Core's intent; researched UX
patterns support visible consequences and proportionate review, not more settings.

### Does this fit Asym’s existing repo and product direction?

Yes with the exact recurring attribution clarification and safeguards above.
Preserve stable line identities, prospective term versions, immutable financial
facts, current permissions and the shared design system. Do not preserve legacy
subscription shortcuts as the intended model.

### Should we adjust the recommendation?

**Accept with required amendments C01–C09.** Retain A and its deliberate-amendment
exception, truthful effective/original labels and the fulfillment boundary. No
additional campaign-policy setting or new product module is justified.

## Outcome proof to require

1. Reassign code A→B; later source-generated installments of each existing line
   retain its accepted campaign or known no-campaign association.
2. Amount/cadence/payment-method/provider/cohort changes and pause/resume retain
   attribution unless the exact command deliberately amends it.
3. Two differently attributed lines collected together remain distinct; a split,
   merge of execution cohorts or executor replacement never adopts the other line's origin.
4. A deliberate prospective campaign-only amendment preserves truthful source
   code and history, affects only eligible future occurrences, and leaves accepted
   earlier gifts unchanged. Non-attribution terms do not implicitly change with it.
5. Pending/submitted/retried/late/replayed occurrences retain qualified bindings
   across concurrent mapping or term edits; response-loss retries create one effect.
6. An independently recorded Campaign B gift applied toward a Campaign A
   commitment remains Campaign B; coverage updates separately and money counts once.
7. Partial/full refunds, returns and corrected fulfillment retain their own exact
   source lineage and do not reread today's registry or mutate historical gifts.
8. Closed/archived campaign and retired code preserve accepted attribution;
   currently invalid destination or payment authority still follows its owner.
9. Cancel remains terminal for that line; Restart giving creates fresh checkout/
   attribution, while pause/resume does not. No old authorization is silently reused.
10. Wrong-tenant/entity/source line, forged actor, stale revision, unauthorized
    campaign identity, expired permission and hidden target fail through real API,
    RPC, database grant/RLS and privileged paths; old and proposed state are checked.
11. Known absence, unknown legacy evidence and withheld identity remain distinct
    in totals, lists, export and recovery. Attribution changes invalidate projections
    even without new money postings; stale views never claim current completeness.
12. Adoption/mixed deployments/rebuild/restore preserve original and amended
    versions. No migration fabricates origin from current setup; historical artifacts survive.
13. Real users can understand and perform the short permitted edit on a phone,
    keyboard and screen reader, with truthful delayed/error feedback and no
    unintended belief that attribution moves money or approves a pending action.
14. Production-shaped access/query and latency budgets are specified and measured
    by source owners before activation; document checks alone do not prove scale.

## Synthesis and status

**Settled by this answer:** ordinary code reassignment leaves an existing
recurring line's campaign intact. Existing deliberate prospective term amendments
remain possible. D49 governs earlier accepted gifts. The new review safeguards
state the exact line, fulfillment, lifecycle and UI boundaries without inventing
another setting or silently ratifying all earlier amendment packets.

**Before formalization:** reconcile the selected D49/D50 policy with exact P13/P16
owner clauses and the remaining E7 temporal/hierarchy contract. The current
[session continuation](phase28-session.md#next-conversation-step) records whether
another actual product choice remains. Schema, locks, source clocks and migration
guesses are engineering work, not artificial founder questions.

**After the separately authorized transition:** prove source evidence, accepted
version/occurrence semantics, same-scope commands, immutable history and complete
consumer behavior; adopt retained data compatibly; prove whole user journeys and
restore before activating the affected capability. Formal owners await `/to-prd`,
tickets await `/to-issues`. No new ADR is needed merely to restate ADR0206.

**Monitored after qualification:** P13/P16 operations owns an attribution-drift
signal: any accepted installment that differs from its qualified occurrence-line
attribution without an authorized source correction stops publication of the
affected measure and triggers source reconciliation; independent valid payments
are not canceled by a reporting alarm. Security owns unauthorized scope/disclosure:
threshold one confirmed occurrence, disable the affected path and investigate.
Product/UX owns pilot comprehension: any critical confusion about moving money,
past gifts or completed-versus-pending changes blocks activation until corrected
and retested. These are proposed safeguards, not active monitors or observed incidents.

No previous executable/model/checker, runtime test, formal owner, code/schema,
live setting, GitHub record or real communication was changed or run. The glossary
needs no new term. Documentary verification does not establish deployment,
production correctness, all-E7 closure or Phase 28 completion.
