# D16 — goal identity, financial meaning and lifecycle

Research date: 2026-10-16. Research only; no application, schema, formal-spec or
live-system changes. The founder selected missionary goal editing when the
organization permits it, with staff-controlled configuration for the eligible
missionary/project scope. At the time of this note, whether the additional
on/off/optional wording concerns **goal use** or only **editing permission** is
still being clarified. No Required/Optional/Not-used policy is inferred here.

## Conclusion

Use one source-owned goal identity with immutable Goal Versions and one current
head for that identity. The ordinary edit changes a fundraising target, not
money, commitments, an approved finance plan or a public page. An eligible
missionary and eligible staff member use the same source command and current
P12 decision. Preserve exact subject, purpose, currency, goal kind, measurement
basis and effective period; the view must name what its numerator means.

The important project qualification is that **not every project target is a new
P28 goal**. P13 already owns campaign and fund/designation targets. P22 explicitly
supports exact P13 campaign goals or P28 missionary Support-Raising Goal
Versions. D16 needs a closed owner-qualified project binding/command: reuse the
actual P13 target where that is what the product edits, with an explicit bounded
missionary capability amendment if needed; do not clone it into P28. If a
distinct P28 project support-raising target is needed, name that distinct
purpose and subject explicitly, without relabeling a P13 target. This is an
owner-qualification obligation, not another architecture choice for the founder.

The smallest useful temporal rule is prospective ordinary editing: the newly
accepted version is the current target, while older versions and qualified
historical comparisons retain their original denominator identity. Current
P13/P16 corrections may still update a comparison's numerator through its
owner's effective fold. A current goal is not silently imposed on past periods,
and immutable goal versions do not freeze money by value.

## Exact source map and authority status

This is targeted primary-clause coverage, not a claim to reread every long PRD.
Accepted intent does not prove implementation. The current scalar fields noted
in [Q16 research](../phase28-q16-goal-authority-research.md) are legacy behavior,
not an adequate goal contract.

| Source                                                                                                                                  | Governing fact                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:109,147–155`                                                   | P28 owns qualified fundraising goals; recurring and special-gift goals, periods, exact currency/cadence/scope and multiple commitments are required coverage. P21 plan adoption and P22 publication remain separate.                                                                                                                                |
| `docs/prds/sitestacker-parity/roadmap.md:4171,4179,4187–4189`                                                                           | Organization-configurable goals, distinct currencies, start/end dates and optional activity targets; goals are not balances/plans/compensation/payment instructions. Shared history does not enroll someone into targets/coaching or performance scoring.                                                                                           |
| `docs/prds/program-roadmap/owner-constraints.md:128–139`                                                                                | P28 Goal Version owns the fundraising/coaching goal and applicable dates/targets; deliberate adoption of exact approved Plan Version; later plan changes only suggest comparison; exact goal reaches public use only through P22 prospective release.                                                                                               |
| `docs/adr/0098-optional-approved-support-plans-and-bounded-workspace-publication.md:5–26,65–76`                                         | Accepted independent sources, presentation cannot widen access or redefine calculations, absence differs from zero, explicit copy-with-provenance, no live synchronization or retroactive mutation. Its default “planning not managed” applies to **P21 Support Plans**, not automatically to D16 goal-use settings.                                |
| `docs/prds/sitestacker-parity/phase-21-field-accounts-decision-log.md:2823–2870,3042–3058`                                              | Five independent authorities; exact Plan scope; authorized user creates a new immutable P28 Goal Version with source Plan/version provenance; neither goal/plan action automatically changes public giving, commitments, compensation, alerts or money.                                                                                             |
| `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1084–1126,1150–1158,1946–1950`                                  | Received effective money, normal dated occurrences and cadence-normalized monthly planning are different. Exact rational monthly factors, recurring lifecycle composition, no fixed-total pledge divided into sustaining monthly coverage. Registry qualifies grain/window/currency/privacy/freshness; aggregate is independent of list pagination. |
| `docs/prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1236–1252,1620–1626,1826–1828,2327–2345` | Current corrected effective fold and per-currency goal truth; campaign goals zero-or-more typed, independent and never auto-summed; fund/campaign views overlap. P13 received and P16 commitment projection are different valid sources, not a universal money numerator.                                                                           |
| `docs/adr/0123-page-resolved-source-authoritative-public-support-progress.md:16–40`                                                     | Accepted exact page-profile/metric pin; goal, period, currency or meaning changes require a prospective release. Compatible corrected source numbers refresh; page visibility/giving remains separately owned.                                                                                                                                      |
| `docs/prds/sitestacker-parity/phase-22-public-ministry-pages.md:420–440`; decision log `856–937,976–1008`                               | P13 campaign goal or P28 missionary Goal Version; page family does not dictate monthly versus finite; exact source/currency/formula/coverage; no negative or missing-as-zero goals; public gross excludes fee-cover and assessments. Contributor status cannot edit protected progress meaning.                                                     |
| `openspec/changes/add-field-account-operations/specs/field-account-operations/spec.md:623–642`                                          | Active intended Plan and publication contract keeps goal/activity/commitment/balance authorities separate. It does not already implement a P28 goal command.                                                                                                                                                                                        |
| `openspec/changes/add-public-ministry-pages/specs/public-ministry-pages/spec.md:290–333`                                                | Active intended public-goal successor-release rule and missing/zero distinction. Source qualification is required; no live internal-goal default.                                                                                                                                                                                                   |
| `CONTEXT.md:4171–4180`                                                                                                                  | Derived glossary accurately names monthly goal coverage as current qualified P28 goal versus P16 normalized recurring support; Plan is never a fallback denominator. This is a glossary, not new independent authority.                                                                                                                             |
| Ratified Phase 28 D9, D10 and their `d9-evidence/financial-truth.md`, `d10-evidence/financial-history.md`                               | Optional coach financial summaries and earlier financial periods do not automatically grant old goal versions, new ratios, wider periods, balances or donor details. The D9 chosen received meaning uses current effective source gift-date cohorts before assessments.                                                                             |

## Minimum precise goal and comparison contract

The inspected sources establish immutable Goal Versions and owner separation,
but do not provide a complete P28 schema, cardinality key, ordinary effective-date
rule or complete project editing contract. The following is the recommended
bounded owner extension, not a claim that those details are already accepted.

- **Identity:** one stable goal identity references a closed source family and
  exact tenant/eligible subject. Its qualified financial scope includes Legal
  Entity and designation/campaign coverage where applicable, purpose and ISO
  currency. A user, Party, Ministry Assignment, Support Assignment, project,
  Designation and Page are not interchangeable IDs. The source adapter establishes
  their actual mapping; neither the browser nor a current team-membership join
  does so. Displaying the same project in two workspaces does not create two goals.
- **Version:** each saved revision binds target amount, exact goal kind and
  measurement basis, applicable period/cadence and dates, author, recorded time,
  effective boundary, previous version and optional exact adoption provenance.
  The current head advances atomically with the accepted command and audit using
  the expected head. Only one version wins at a time for that goal. Currency,
  subject and purpose cannot be casually reassigned by an amount edit.
- **Cardinality:** “one current version” does not mean “one goal per person.”
  Concurrent recurring and separately identified special-gift goals and distinct
  currencies are legitimate. The owner names their closed purpose/period identity
  and prevents competing accidental duplicates of the same logical target.
  Do not add arbitrary metric types, hierarchy or a general formula builder.
- **Numbers:** use exact validated minor-unit money under the existing currency
  owner, not JavaScript float arithmetic or an assumed two-decimal currency.
  Recommend a positive target for a newly authored monetary goal; leaving a goal
  unset/stopping its use is an explicit state, not typing zero. This is a proposed
  input rule, not a discovered universal P28 zero-goal constraint. Any inherited
  source-valid zero still has no ratio; legacy zero does not prove an intentional
  goal. No negative denominator, infinity or cross-currency headline.
- **Purpose:** the current recurring planning goal compares only to P16's
  compatible monthly-equivalent planning projection. A finite goal uses an exact
  qualified dated received/expected meaning, not annualized cash or all gifts
  ever received. A project is not necessarily finite and a missionary is not
  necessarily monthly. No metric is silently selected from the subject label.

For an illustrative same-currency current monthly planning target of 4,500
changed to 5,000, the new current planning view uses the new exact version and
can say when it changed. September's previously qualified target is not changed
to 5,000. This does not select a lookback, future scheduling feature or backdated
goal editing. Nor does it prorate 4,500/5,000 across the month: no accepted owner
rule supplies such a formula. An explicitly qualified current comparison is
distinct from an as-of-period comparison; the UI cannot silently swap them.

## Material concerns, exact proposed clauses and proof

Severity is potential harm if the defect ships. Likelihood is conditional design
risk, not an observed production failure. These are proposed D16 amendments.

### GF01 — The edited target belongs to the wrong source or subject

**High / likely if generic `funding_goal` editing is reused.** P13:1620–1626,
P22 decision log:864–868,919–925 and P21:3044 distinguish canonical goals.

**Clause:** “Resolve every goal read/create/change/end through its exact typed
source owner and same-Tenant subject. P28 goal-edit permission SHALL NOT write a
P13 campaign/Designation goal, P21 Plan or public binding without that owner's
explicit bounded capability and command. Reuse a shared project goal identity;
do not copy a project target into each missionary's record.”

**Proof:** two missionaries on one project; two projects with similar names;
changed assignment; same user in two Tenants; a campaign spanning multiple
Designations; project Page with a P13 campaign goal. No duplicate target or
retargeted historical money results from adding/removing a participant.

### GF02 — Goal use, edit permission, visibility and lifecycle collapse

**High / plausible.** Q16 selects editing discretion; the usage clarification
is pending. ADR0098:16–26 makes publication separate from truth; P28 roadmap:4179
preserves voluntary activity/coaching qualification.

**Clause:** “The resolved permission to edit SHALL remain distinct from whether
the organization uses a goal, whether a goal exists, who may read it, and whether
the goal is current/ended. Turning editing off SHALL NOT zero, delete, end,
publish or otherwise alter an existing goal. Missing/optional goals SHALL NOT
create automatic targets, approved needs or performance penalties. Any required
goal-use rule requires the founder's actual clarification and a separate exact
scope; it does not require activity logs, coaching or a finance Plan.”

**Proof:** staff-managed existing goal after missionary editing is disabled;
absent goal; no goal-use mode chosen; goal hidden from coach but visible to its
author; saved goal when tenant configuration changes. No fake default target.

### GF03 — Recurring planning, dated expectations and received money blend

**High / likely if all amounts feed one progress bar.** P16:1090–1126 fixes
the three meanings and the exact rational planning transform.

**Clause:** “Bind each goal comparison to one qualified metric contract and
compatible subject, purpose, currency, period/cadence and gross/net basis.
Monthly-equivalent recurring planning SHALL use P16's exact rational transform
and lifecycle composition. Dated expected support SHALL use authoritative named
occurrences. Received SHALL use P13 effective facts. Do not add these measures,
divide fixed-total pledges into sustaining monthly support, or treat remaining
goal as debt, guaranteed income or an instruction to collect.”

**Proof:** weekly versus every-four-week support; paused/future-start/cancelled
line; annual gift; irregular/manual commitment; one-time pledge with no dated
plan; retry for last month's occurrence. Planning can be useful without claiming
cash will arrive in this month.

### GF04 — Editing a target silently changes historical meaning

**High / likely with a mutable scalar.** P21:3048, ADR0098:74–75 and P22
D6:882 preserve immutability/no retroactive rewriting; ratified D10 does not
grant historical goal versions simply by allowing earlier financial periods.

**Clause:** “An ordinary accepted goal change SHALL create a prospective new
version with an explicit effective boundary. Retain the original version of any
admitted earlier comparison; do not backdate, overwrite, rebase or prorate it
automatically. Where an earlier period lacks a qualified goal version or its
audience lacks access, show the independently permitted financial amount without
an invented historical ratio. A current-goal comparison must be labeled as such
and separately qualified.”

**Proof:** midmonth change; December target edited while viewing September;
tenant timezone changes; simultaneous staff/missionary edits; a coach with prior
financial periods but no historical-goal grant. Financial trends cannot be
reinterpreted as performance against today's target.

### GF05 — “Correction” bypasses normal versioning or freezes the numerator

**High / plausible.** P13:1240–1244,2329–2343 retains the effective fold and
source watermarks; ADR0123:34–38 separates corrected facts from profile changes.

**Clause:** “Goal correction SHALL retain attributed supersession evidence and
original versions; it SHALL NOT rewrite accepted prior denominators under an
ordinary Edit command. Any retrospective correction path must have explicit
source semantics and audience handling before exposure. Financial corrections
continue through P13/P16's current effective fold without copying amounts into
the Goal Version. A fixed goal pin is not a frozen financial total.”

**Proof:** typo entered today; partial refund; late imported eligible gift;
source gift-date correction moving a gift to another period; redesignation to
another subject; commitment amendment. A change outside the viewer's scope
cannot leak its new recipient/period through a repair message.

### GF06 — Plan adoption exposes hidden finance or synchronizes targets

**High / plausible.** P21:3046–3055 and ADR0098:65–69 require a deliberate
copy and exact provenance, not live binding.

**Clause:** “Create-from-plan SHALL require current permission for the exact
source projection and the target goal command. Copy only compatible explicitly
admitted target facts and retain immutable Plan identity/version provenance.
Do not expose salary, reserve, balance, assessment or other hidden Plan details
through prefill, comparison, provenance labels or notifications. Later Plan
changes may offer an authorized comparison, never auto-update the goal; goal
changes never update the Plan or other financial effects.”

**Proof:** missionary may edit goal but cannot read Plan; Plan changed after
preview; different currency or purpose; terminated plan; hidden Plan provenance;
repeated adoption Save. Direct ordinary goal entry remains useful without Plan
adoption and no mandatory approval queue follows from the bridge.

### GF07 — Internal Save changes the public denominator or access audience

**High / likely with shared legacy fields.** ADR0123:34–40,
owner-constraints:136–139 and active public-page OpenSpec:290–319 fix the boundary.

**Clause:** “Saving a goal SHALL NOT publish it, replace a Page's pinned goal,
grant coach/staff access or emit a public change. P22 adopts an exact compatible
version through its normal prospective release. A current page retains its
pinned denominator while compatible source numeric facts refresh. Source
restriction/incompatibility invokes the existing P22 suppression rule, never a
new denominator or zero fallback.”

**Proof:** public page pins v1, internal Save creates v2; existing coach grant
contains a narrower module/history; page contributor has no protected financial
control; source safety restriction occurs during refresh. Giving remains
independently eligible rather than being disabled merely because a goal is absent.

### GF08 — A shared project or campaign doubles support and targets

**High / likely if dashboards are summed.** P13:1625–1626,1828 explicitly
rejects automatically summed goals and additive campaign/fund overlap.

**Clause:** “A shared goal's target and supporting allocations SHALL be counted
at their canonical source grain. Showing the same project in multiple authorized
workspaces creates neither duplicate goals nor personal shares. Do not sum
overlapping missionary/project/campaign/fund cards into raised money, target,
shortfall or portfolio progress. An independently qualified disjoint rollup
must use its source's exact set and scope.”

**Proof:** a 100-unit contribution split 60/40; the same 60-unit allocation seen
by two participating missionaries; campaign and Designation views of the same
gift; parent and child campaign. User membership never implies a percentage share.

### GF09 — Currency/zero/overage rendering invents finance

**High / likely with existing scalar fallbacks.** P13:1248; P16:1122,1152;
P22:425–426; D9 qualified goal comparisons.

**Clause:** “Store and compare exact source-supported currency amounts and keep
unlike currencies separate. Do not silently convert, round each recurring line
before summing, or reinterpret a changed currency as the same denominator.
Missing, invalid, hidden, ended and zero remain distinct; zero has no percentage.
Above-goal activity remains numerically truthful and creates no automatic
redesignation, surplus transfer, spending right or goal increase.”

**Proof:** USD/JPY with similar symbols; exact rational weekly values; unusually
large amounts; zero legacy field; 120% completion; negative correction; current
goal in one currency and eligible gifts in two. No ratio over incompatible money.

### GF10 — Period/calendar changes alter a goal's cohort

**High / plausible across histories and imports.** P16:1097,1152 and the
ratified D9/D10 source-date contract preserve exact dates and windows.

**Clause:** “A goal/comparison SHALL carry its exact source-supported period,
cadence/calendar and effective boundaries. Received history retains P13/P7's
current effective source gift-date precision/basis; expected periods retain P16
occurrence rules. Do not regroup by record creation, retry, refund processing,
browser timezone or today's changed calendar. Full-period expected and received
to date SHALL not silently become a collectible remainder.”

**Proof:** date-only offline gift; DST month boundary; calendar changed later;
fundraising start/end inside a month; future planned gift; late receipt for an
old expected occurrence. No universal lookback, future goal scheduling or new
FX/reporting formula is selected by D16.

### GF11 — Ending/removing a goal destroys history or stops independent work

**High / plausible.** Goal ownership is independent under P21:2852–2863,
3044–3055. No inspected clause supplies a comprehensive P28 end-goal command.

**Clause:** “If ending a goal is offered, use an attributed source lifecycle
transition, not target zero, deletion of referenced versions or cancellation of
donor commitments. Stop its use as a current active goal under that exact
source rule; retain admitted historical identity/provenance under the applicable
retention policy. An ordinary completed/ended goal is not automatically a privacy
revocation of every pinned historical version. Public and coaching consumers
re-prove their own exact binding and current validity; they neither auto-replace
the goal nor gain new history.”

**Proof:** stop current monthly goal; completed finite project; reopened work;
old public release references a still-valid period goal; actual source erasure
or restriction; goal edit rights revoked. No fabricated retention duration,
mandatory archive UI or automatic downstream notifications is implied.

### GF12 — Goal versions become an unbounded evidence/permission shortcut

**High / plausible.** P12 current-authority requirements apply to every source
command and projection; P16:1152–1158 requires privacy before aggregation.

**Clause:** “Saving, re-reading a receipt, comparing versions, reading history,
adopting a Plan and deriving a ratio SHALL each use current exact P12/source
authority. Source version retention is not an audience grant. Unknown/incomplete
coverage cannot be a zero or complete goal comparison; don't expose a hidden
numerator through a percentage, complement, previous target or changed-total
message. Goal changes SHALL NOT create donor ratings, missing-log penalties or
automatic coaching enrollment.”

**Proof:** disable edit before Save versus Save before disable; stale browser;
lost response with current permission changed; coach ratio reconstructs hidden
money; inaccessible old target; missing historical denominator. Use the actual
PDP and source projection tests, not just a toy `can_edit` flag.

## Required owner extensions and what is not selected

1. **P28/source registration:** exact supported monetary goal kinds, subject
   identity and financial scope, one current head per logical goal, amount and
   period validation, prospective edit/end behavior, and goal-version provenance.
   The bounded project binding must preserve P13 ownership where applicable.
2. **P12/tenant configuration:** implement the founder's actual clarified policy
   with current source-qualified settings and commands; goal usage, edit rights,
   visibility and public release stay distinct. No parallel role/ACL engine.
3. **P16/P13 projections:** name compatible goal comparison contracts and source
   watermarks; reuse exact amounts/occurrences, not a new P28 accounting engine.
   Earlier comparisons need exact denominator and audience qualification.
4. **P21/P22 seam tests:** explicit authorized Plan adoption, no synchronization,
   no hidden finance leakage, public pin unchanged on internal Save, and source
   corrections refresh only compatible authorized results.

No goal-use default, requirement mode, numerical target, historical access
window, future scheduling UI, universal retrospective correction workflow,
retention duration, new financial approval queue, FX formula, notification,
coach write right or public publishing right is selected here. These sources
settle the financial boundaries; they do not turn a goal edit into finance
approval or a new balance.

No executable probe was run for this note. The separate D16 database evidence
must label its supplied subject/permission/metric facts as assumptions and avoid
claiming that a synthetic valid zero or generic project ID is the qualified
production owner contract.

## Subsequent review synthesis

After the initial review, the founder explicitly clarified: **editing permission
only; staff allow or disable missionary editing, and setting a goal remains
optional**. This supersedes this note's earlier pending-clarification language.
The [completed D16 review](../phase28-d16-goal-management-adversarial-review.md)
records that confirmed meaning. Its recommended Staff-managed / Missionary-managed
labels, organization-default inheritance and remaining amendments are not fully
ratified by this clarification. No Required/Optional/Not-used goal usage is added.
The main review reconciles individual View only versus Staff-managed,
one canonical goal-policy scope across aliases, applicable Legal Entity,
conditional ending and all-path restore fencing. Earlier conditional exploration
in this evidence note is preserved as research, not competing final design.

Actual probe claims retain their exact limits: permission re-enable is not a
backup restore test; no-op and a separately read-authorized receipt endpoint
were not executed. The completed review's C01–C20/P01–P24 govern the proposed
future proof, not a claim that those features are implemented.

## Subsequent ratification

On October 16, 2026 UTC the founder explicitly ratified the corrected D16 decision
and required amendments, including C01–C20 and P01–P24 as future acceptance
obligations. The [main D16 review](../phase28-d16-goal-management-adversarial-review.md)
is the reconciled decision; conditional alternatives and recommendation labels
above describe research before ratification, not competing current decisions.
The earlier clarification alone was narrower; the subsequent ratification accepts
the full corrected amendment package. This changes intended-behavior status only.
Executed probes, source snapshots and all runtime/qualification limits remain
unchanged. No full application, live database or production claim follows.
