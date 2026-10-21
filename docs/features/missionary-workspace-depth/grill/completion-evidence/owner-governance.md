# Fresh completion audit — owner and policy seams

October 18, 2026. Research-only review of the current Core working tree. This
note rechecks the prior closure rather than treating its conclusion as evidence.
It does not ratify amendments, change canonical owner contracts, create a formal
specification or ticket, activate anything, or claim runtime qualification.
No earlier probe, model or verification program was run. The searches and reads
below were static; no external tracker or provider state was refreshed.

## Disposition

**Reject and replace the unconditional decision-frontier closure; retain the
selected D1–D41 product direction and each decision's exact approval status.**

The prior synthesis properly names several gates, but its opening claim that no
additional Phase 28 feature choice warrants Q42 is stronger than the evidence.
P14 explicitly deferred the supports-edge choice to P28. Saying that separate
policies remain unchanged pending owner reconciliation is a safe interim rule;
it does not dispose of that deferred choice. A second unresolved seam is the
required P28 recurring-attention task purpose: the current P16 contract supplies
source facts and role-safe actions, but does not supply the promised automatic
missionary review obligation merely because it displays an action-needed state.

The six selected-only review packets also contain concrete policy proposals,
not just implementation details. They must receive explicit scoped dispositions.
This does not justify reopening every selected feature or inventing a long new
questionnaire. Resolve the narrow deferred support-policy choice, reconcile the
recurring task purpose, and finish the existing amendment dispositions before
declaring the product decision frontier empty.

## Evidence and authority

- `AGENTS.md:24–43` and `openspec/project.md:7–19` distinguish accepted intent,
  active change, implementation and runtime. A later consumer cannot acquire an
  owner's authority by shorthand.
- `docs/ai/document-authority.md:9–34` requires exact owner/supersession analysis,
  coordinated canonical/projection changes and preservation of the last agreed
  behavior while a genuine disagreement remains.
- `docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:21–31`
  restricts this session to research/grill, requests genuine product choices one
  at a time and reserves formalization/tickets for explicit transitions.
- Active OpenSpec was inspected directly, including
  `openspec/changes/sitestacker-parity/specs/platform-product-intent/spec.md`,
  `openspec/changes/sitestacker-parity/design.md`,
  `openspec/changes/add-recurring-giving/specs/donation-lifecycle/spec.md`,
  `openspec/changes/add-donor-development/specs/crm-core/spec.md`,
  `openspec/changes/add-donor-development/specs/donor-development/spec.md`, and
  `openspec/changes/fix-missionary-partner-roster-safety/specs/crm-core/spec.md`.
  The latter is a bounded current-roster safety change, not P28/P14 policy adoption.
- A delegated independent read checked D6 against its current owners, active
  Web Studio OpenSpec, D7/D17 and `packages/api/src/email/consent.ts`. Its results
  are recorded below with exact references; no delegated mutation or test ran.

Severity/likelihood below are reasoned design-risk assessments, not measured
production incident rates. “Current” means the inspected repository source or
document; deployed behavior was not tested.

## O1 — Deferred financial-support policy is still a product decision

**Material concern: yes. High severity; likely semantic inconsistency if left
to consumer convention. Changes the prior closure, not the selected native CRM
direction.**

**Evidence.** P9 B3 defines `supports_policy_v1` as a settled adjustment-folded
gift in trailing 365 days, eligible current recurring intent, or an explicitly
qualifying fixed-total pledge, with named version/provenance
(`docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:616–622`).
P14 H4 defines recognition-based v2 for its roster, expressly keeps the graph's
v1 and defers the edge upgrade decision to P28
(`docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md:1071–1078`).
The same H4 calls 365–730-day entries “lapsed” and drops rows after 730 days.
P28 owner constraints prohibit person-level lapse labels and retain nonfinancial
partnerships (`docs/prds/program-roadmap/owner-constraints.md:60–80`).

**What could go wrong and why it matters.** A developer could silently upgrade
every graph consumer to recognition, silently exclude indirect supporters, or
use the financial roster as the relationship directory and hide a prayer partner
or current commitment after a gift-recency boundary. The neutral intention in a
closure note does not resolve conflicting canonical clauses or tell graph
consumers which predicate applies. Historical support, current commitment,
ongoing relationship, contact permission and retention are different facts.

**Current versus intended.** The named P9/P14 predicates are intended contracts,
not proof of current implementation. The inspected native roster still reads
`donors` by tenant and `missionary_id`, then legacy `donor_pledges`
(`packages/api/src/missionary-portal/donors.ts:490–549`). Its status normalizer
returns person labels `Lapsed`/`At Risk` (`:174–191`). A fresh bounded symbol
search under apps/packages/supabase found no `getSupporterRoster` or
`supports_policy_v1/v2`; this is not a complete runtime census. Active roster
safety OpenSpec addresses pagination, visible identity and interface controls
(`openspec/changes/fix-missionary-partner-roster-safety/specs/crm-core/spec.md:3–74`),
not adoption of either future financial policy.

**Strongest alternative.** Upgrading the graph to v2 could make recognized
indirect supporters appear consistently across graph consumers. It also changes
the existing edge's meaning beyond the roster and requires enumerating and
requalifying every consumer. Native relationship continuity does not require
this change. The narrower permanent recommendation is to explicitly retain the
two purpose-specific financial policies and compose the workspace with its
independently authorized relationship sources.

**Exact proposed decision for explicit adoption, not a ratified result:**

> Keep financial support and continuing relationships distinct. The P14
> recognition roster continues to show permitted direct and indirect support.
> The P9 supports edge retains its named v1 financial predicate; Phase 28 does
> not upgrade it to v2. Maya's native relationship workspace includes every
> independently authorized continuing financial or nonfinancial relationship,
> without aging it out solely because of giving recency. Financial views use
> neutral recency wording rather than a person-level “lapsed” label. A historical
> recency band does not override an independently qualifying current P16
> commitment, grant contact access, or establish retention. Use the existing
> source-owned graph, recognition and relationship contracts; create no new CRM
> or copied roster authority.

**Exact reconciliation after adoption.** Keep P9 B3 unchanged. Replace P14 H4's
stale v1 paraphrase at `:1073` with the current B3 predicate/reference; replace
the deferred-to-P28 sentence at `:1076` with the adopted scope disposition. At
`:1077`, replace “lapsed” with neutral historical-recognition wording, and state
that the 730-day exclusion applies only to historical-recency roster inclusion,
not to another independently qualifying current typed commitment or native
relationship. Preserve numerical bands unless separately amended; pin their
boundary/calendar semantics in the owning policy. Preserve H3's one-row grain,
same fold/cursor and legal-versus-recognition vocabulary (`:1052–1069`) and H5's
immutable missionary projection floor (`:1080–1094`). Reconcile declared owner
and OpenSpec projections together at the authorized formalization transition.

**Proof.** Direct and indirect supporter examples; 365/730 boundary cases;
refund-to-zero; no gift for over 730 days plus qualifying current commitment;
prayer/practical/church relationship with no contribution; expired financial
history with lawful continuing contact work; restricted and anonymous paths;
no contact details added to the financial projection; no consumer silently
switches edge policy. A source/consumer inventory must show the exact policy
version consumed by every financial edge and roster view.

## O2 — Required recurring-attention work lacks an exact product outcome

**Material concern: yes. High severity; plausible task spam or missing required
work. Changes the claim that remaining task binding is solely engineering.**

**Evidence.** P28 promises automatic tasks to review a named P16 attention
transition and owns task/audience purpose
(`docs/prds/program-roadmap/owner-constraints.md:74–80`). D40 C01 excludes an
automatic review or outreach obligation from its one confirmed missed occurrence
with a continuing normal schedule; it preserves other qualified requirements
(`phase28-d40-informational-missed-gift-adversarial-review.md:258–264`, relative
to this note's parent grill directory).

P16 D9 currently says “New action required” gives the missionary a high-level
source projection only; terminal Missed adds one in-product notice only after
its exact contract is Live; schedule amendment has no missionary message
(`docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:893–905`).
P16's evaluator emits safe next actions by role and source applicability
(`:1055–1068`); its missionary list has no mutation controls (`:1144`).
The active OpenSpec recurring amendment delegates detailed behavior to this
P16 contract (`openspec/changes/sitestacker-parity/specs/platform-product-intent/spec.md:358–365`)
and requires source/recipient/consent proof for communication candidates
(`:502–511`). It does not establish a new automatic missionary review purpose.

**What could go wrong and why it matters.** Treating any attention label as a
missionary task can create a demand the person cannot act on, reveal provider
repair details, duplicate staff incidents or send unwanted donor outreach.
Conversely, treating D40 as a blanket no-task answer deletes a promised native
outcome. Saying “bind an exact purpose later” does not answer which human action
is actually required or what completing it means.

**Existing source-supported distinctions, not invented triggers:**

| Source condition                                                  | Actual current owner treatment                                                                                                | Safe P28 consequence now                                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Missed occurrence; regular schedule continues                     | D40 informational; P16 `:881–887`, `:901`                                                                                     | No automatic task from this condition alone; deliberate ordinary follow-up remains.                |
| Future automatic collection actually unavailable or safely parked | P16 `:1051` distinguishes this from timers/miss counts; `:1045` permits action-needed copy; `:899` missionary projection only | Candidate for a separately adopted narrow review purpose, not existing permission to generate one. |
| Stale/conflicting/unavailable source                              | P16 `:1068` says Status updating, suppress negative outreach and raise a staff incident                                       | Never manufacture a missionary debt/outreach task from missing evidence.                           |
| Manual/offline expected-date review becomes due                   | P16 `:1072–1080` defines staff attention and prospectively bounded evidence policy                                            | Keep staff review scope; do not infer missionary responsibility.                                   |
| Provider observation/control problem                              | P16 `:1258–1264` fences affected operations and distinguishes real impact from observation degradation                        | Keep source repair responsibility; no missionary alarm merely from a timeout.                      |
| Paused, ended as scheduled or corrected history                   | P16 `:1046–1051`, `:904–905`, `:1144` preserve specific source meaning                                                        | Not an automatic generic “recover support” obligation.                                             |

**Narrow permanent recommendation.** Add no additional automatic missionary
recurring-attention task in this release. The strongest bounded alternative is
one required missionary relationship review when automatic gifts cannot continue.
That could improve accountability, but the inspected source does not establish
what Maya must do that donor/staff repair and optional relationship follow-up
cannot already accomplish. The P16 action-needed transition deliberately gives
her a high-level projection only. Inventing a mandatory “reviewed” acknowledgement
would manufacture a human job to satisfy a broad task promise. Prefer explicitly
narrowing that promise, preserving actual donor/staff action obligations and
letting Maya choose ordinary follow-up. This is a proposed product amendment,
not an interpretation that D40 already removed every other task.

**Exact proposed decision for explicit adoption:**

> For the initial Phase 28 release, missionary recurring attention uses the
> permitted factual P16 source views, D40's optional informational notice, and
> deliberate ordinary follow-up. Phase 28 adds no automatic missionary
> recurring-review or donor-outreach obligation. Actual source-owned donor
> actions and staff repair work remain required through their existing owners.
> This explicitly narrows the broad Phase 28 promise to generate a missionary
> task for a named P16 attention transition; it does not remove first-gift,
> special-gift, fulfillment or other independently adopted native work. A future
> automatic missionary recurring-attention purpose requires an identified human
> job and explicit owner/product adoption, not a generic attention label or an
> acknowledgement invented to clear a queue.

After adoption, reconcile the exact recurring-review item in
`docs/prds/program-roadmap/owner-constraints.md:74–80` and its corresponding P28
roadmap/phase package projections while preserving the other listed automatic
tasks. P16's source action, recovery and notification contracts remain unchanged.
No tenant-specific trigger matrix, new workflow switch, missed-gift store or
task lifecycle is needed. If new evidence identifies an already accepted exact
mandatory missionary action, reconcile that concrete conflict before adoption;
none was identified in the source sections inspected for this note.

ADR-0183 requires the finite source work contract and current concrete action
(`docs/adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24–36`),
source-controlled closure (`:71–100`) and current recipient rights (`:57–69`).
It cannot supply the missing purpose by itself. The inspected current create
route writes manual `missionary_tasks` with `is_auto_generated: false`
(`packages/api/src/missionary-portal/tasks.ts:67–113`); its existence is not the
missing future task producer.

**Proof.** D40 miss and other recurring states create no additional automatic
missionary task; source unavailability creates no negative outreach; actual
staff/donor work still appears through its own qualified source purpose and
does not leak protected repair details to missionaries. Deliberate follow-up
still creates one ordinary task for the same accepted intent; source correction
does not falsely complete that independent task. First/special/fulfillment work
remains intact. Existing retained tasks require a source/purpose census and
explicit migration treatment; adoption cannot authorize mass deletion, false
completion or revival of historical task effects.

## O3 — D6 admission and pending-work policies still need adoption

**Material concern: yes. High severity; likely inconsistent consent or Off
behavior if recommendations are mistaken for decisions. Narrows closure and
requires existing amendment disposition, not another native-versus-request fork.**

**Selected intent.** Direct native signup and exact Page control are selected
(`phase28-d6-adversarial-review.md:69–77`; `phase28-session.md:1558–1563`, both in
the parent grill directory). D6 status explicitly says the detailed amendments
are recommendations (`phase28-d6-adversarial-review.md:8–13`). D7 expressly does
not ratify D6 (`phase28-d7-adversarial-review.md:13–17`).

**Concrete unratified choices.** D6 C05 (`:346–351`) recommends exact fresh
confirmation for every new admission/re-subscription, no verified-profile
shortcut and no repeated challenge for an identical active subscription. C07
(`:359–365`) recommends that an already accepted pending confirmation can finish
after Page signup Off, within its original validity. C15 (`:418–430`) recommends
72-hour pending/proof life and 24-hour terminal-material purge. These alter the
user's outcome and data lifecycle; implementation qualification cannot ratify them.

**Already settled and not reopened.** D7 C12 (`:499–505`) separates Page signup
Off from a global send stop, purpose closure and withdrawal. D7 positive
eligibility (`:454–461`) and D17 C08
(`phase28-d17-contact-import-adversarial-review.md:235–249`) forbid a gift, prior
request, affirmative CSV flag or lack of suppression from manufacturing opt-in.
Independently valid existing subscription authority survives a signup toggle;
unrelated lawful communications retain their own exact rights.

**Current versus intended.** `packages/api/src/email/consent.ts:110–137,178–232`
checks opt-outs/address suppression and may return allowed when neither blocks.
Its input does not prove native newsletter-purpose membership/confirmation. This
is a negative delivery gate, not positive admission proof. No execution or
complete native-source census was performed. Owner reconciliation is also real:
`docs/adr/0170-purpose-bounded-public-form-definitions-and-domain-owned-routing.md:119–125`
still routes newsletter confirmation/consent through P32,
while the later ratified D7 native source is independent of optional P32
(`phase28-d7-adversarial-review.md:61–69`). P25 EX11 remains a distinct external
request journey with no visitor confirmation
(`docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/experience.md:161–169`;
`openspec/changes/add-web-studio-cms/specs/web-studio-cms/spec.md:1018–1046`).

**Permanent fix and exact disposition language:**

> Record an explicit scoped acceptance or correction of D6 C05, C07 and C15
> together with its remaining reviewed amendments. Until that disposition,
> direct native signup remains selected while its exact admission, accepted
> pending-after-Off and retention policy remains proposed. Preserve D7's
> independently authorized sending/withdrawal boundaries and D17's prohibition
> on import-created consent. Reconcile the narrow native confirmation owner
> without changing the separate external request-only journey. Activation
> requires both positive current newsletter eligibility and current negative
> suppression checks; absence of suppression is never enrollment.

**Proof.** New signup, re-subscribe, identical active subscription, typo/address
change, Page Off before acceptance versus after acceptance, withdrawal while
pending, broader suppression, old external request/import, expiry and restore,
and independently valid unrelated communications. Pin the accepted clock/profile
only after its adoption; do not manufacture those results from the current
negative gate.

## O4 — The other selected-only packets contain real policy proposals

**Material concern: yes. Medium-to-high severity according to affected audience;
likely silent approval if packaged as a general shared-understanding confirmation.
Changes the completion standard, not already selected directions.**

The synthesis already lists D1, D3, D6 and D11–D13 as status exceptions
(`phase28-post-d41-coverage-synthesis.md:89–111`, parent grill). The problem is
not omission of the list; it is treating the decision frontier as empty before
disposition of actual pending policy. Examples: D1 explicitly is not an approved
owner amendment (`phase28-d1-adversarial-review.md:5–13`); D11's calendar-day
cutoff, extension and expired-episode behavior are reviewed recommendations
(`phase28-d11-coaching-duration-decision.md:8–34`); D12's exact resource
publication/custody extension is recommended; D13's initial Off/List and control
composition remain recommended
(`phase28-d13-regional-map-decision.md:9–10,22–23,59,177`).

**Permanent fix.** Reconcile each exact unratified clause against later adopted
decisions and present only the surviving policy deltas for explicit disposition.
Do not ask the founder to reselect restricted preparation, departure rights,
optional ongoing coaching, curated resources or regional browsing. Do not
silently adopt expiry/default/audience/retention rules as implementation details.

**Exact completion rule:**

> Each selected-only packet shall retain its explicit status until its surviving
> amendments receive an explicit scoped disposition. Later ratification applies
> only where its text actually supersedes the earlier clause. A general agreement
> with the product summary is not bulk ratification. The decision-closure record
> shall enumerate any remaining unadopted observable policy and shall not call
> that policy settled merely because a complete recommendation exists.

**Proof.** A clause-level status/supersession ledger links selection, reviewed
proposal, later adoption and owning canonical amendment. No changed approval
state is inferred from formatting, local validation, age or a generic checkpoint.

## O5 — E7 and C-01 remain policy gates, not qualification details

**Material concern: yes. High severity; plausible invented financial meaning or
unauthorized posted correction. The synthesis correctly preserves the gates;
their status still prevents an unqualified all-decisions-complete claim.**

E7 conflicts live campaign/source-code reporting with frozen posting-time
identity and mapping restrictions. It requires decisions about prior unmapped
gifts, hierarchy/remapping, corrections, recurring origin and historical/current
measures (`docs/prds/program-roadmap/decisions-and-gates.md:51–63`). C-01 requires
an explicit founder ruling between optional tenant separation and a mandatory
different approver (`:36–40`). Active OpenSpec says qualification cannot provide
this missing policy (`openspec/changes/sitestacker-parity/design.md:258–277`).
P27's current behavioral projection independently requires Unavailable for the
affected E7 measure and a blocked dependent correction lane for unresolved C-01
(`openspec/changes/add-donor-development/specs/donor-development/spec.md:8769–8787`).

**Permanent narrow resolution.** Use the owning financial scope for the explicit
E7 ruling and C-01 founder decision, then amend the exact conflicting P13/P15
clauses/projections. Do not make a P28 task, intake report or review action a
surrogate approval. This note has not gathered sufficient domain evidence to
choose optional versus mandatory dual approval or frozen versus live campaign
attribution; inventing either is not a finished solution.

**Exact retained clause:**

> E7 and C-01 remain named upstream policy decisions. Their affected measures or
> commands remain unavailable/undispatched under the current owning contracts;
> independent qualified work remains usable. The P28 closure shall distinguish
> unresolved financial policy from implementation qualification and shall not
> claim that adapters, immutable posting, Site attribution, Request review or
> missionary intake settles either decision. Required financial outcomes remain
> in scope and require their owning resolution before activation.

**Proof.** Current OpenSpec negative cases above; after ruling, independently
prove previously unmapped/reassigned source codes, corrections/refunds and
historical/current reporting, as well as actor/approver separation under the
adopted exact rule. No P28 record manufactures correction authority.

## O6 — Producer availability is unproved, not a new product-choice substitute

**Material concern: yes. High severity; plausible stranded native send or unsafe
direct-provider workaround. Does not itself require a founder feature choice.**

The last inspected external issue evidence is dated October 15. It records #897
as reporting a missing exact P6 immutable-preparation/sealed-submission producer
allocation and component proof; #888's occurrence compiler is not the producer
(`phase28-communication-evidence.md:3,10,38–47`, parent grill). This fresh task
did not re-read external issues. Therefore “still missing on the current tracker”
is unverified. A bounded local search for the named compiler/roster/missed-event
symbols returned no source hits; this does not prove every relevant implementation
or alternate symbol absent.

**Permanent fix.** Before dependent implementation planning, inspect the actual
current producer/source ownership, existing issue bodies/dependencies and
component evidence. Reuse or explicitly complete the existing narrow owner
allocation rather than fabricate a ticket, assume a facade is enough, require
an unrelated whole phase or silently remove the complete native outcome.

**Exact clause:**

> Producer readiness shall be stated with its inspected date, exact code/contract
> and actual component proof. A current accepted plan or issue is not activation.
> Missing qualification blocks only the affected effect. Preparation, sealed
> dispatch, bound recipients/content, durable outcome recovery and correction
> must all be proved through their owners; direct-provider or copied-state
> substitutes are forbidden. Dated missing-producer evidence shall not be
> presented as a fresh tracker census.

**Proof.** Complete journey from accepted issue/recipient preparation through
sealed dispatch and definitive/unknown outcome; current authority, suppression,
concurrency/retry, partial outcomes, expired provider idempotency and restore;
independent native work remains usable while an exact send lane is unavailable.

## Recommended sequence and corrected closure language

1. Correct the prior no-Q42 closure now. No D1–D41 selection is reversed.
2. Present the explicit C4 permanent proposal above as the narrow next product
   decision; record its actual adoption or correction before canonical changes.
3. Explicitly adopt or correct the narrow recurring-attention recommendation:
   no additional automatic missionary task this release, with actual donor/staff
   repair and optional ordinary follow-up intact. Keep D40 intact; do not call
   this amendment an already settled engineering detail.
4. Dispose of surviving D1/D3/D6/D11–D13 amendments with exact scope. Do not
   reopen later ratified policies or infer approval from a summary.
5. Preserve E7/C-01 in their owning financial scope; obtain those explicit rulings
   before the dependent effects. Recheck current producer allocation/proof before
   formal mapping; do not equate either gate with a need for new product features.
6. Only after decision closure and the user's explicit formalization transition,
   reconcile canonical clauses and OpenSpec projections, with source/role,
   lifecycle, migration and complete-journey proof requirements carried through.

**Corrected closure for recording now:**

> D41 and its amendments are ratified, and the selected D1–D41 direction remains
> intact. The prior unconditional conclusion that the Phase 28 decision frontier
> was empty is withdrawn. The expressly deferred P9/P14 support-policy choice,
> exact required recurring-attention purpose and surviving selected-only
> amendments require scoped disposition. E7, C-01 and exact source-producer
> qualification remain distinct owner gates. Continue with the narrow decisions
> and amendment reconciliation above; do not invent unrelated features, silently
> ratify earlier proposals or treat document verification as implementation proof.

None of these policy/authorization gates is a monitor-only risk. Operational
monitoring cannot substitute for deciding the product meaning or proving the
source boundary before the affected capability is activated.
