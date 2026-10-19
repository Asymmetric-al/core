# D23 independent integrated review

Initial integrated read: **2026-10-10 18:11 UTC** / 2026-10-11 Asia/Bangkok.
Research only. This reviewer read the complete [main review](../phase27-d23-adversarial-review.md),
[Q23](../phase27-q23-request-review-policy.md), all five evidence appendices and
the isolated review-round experiment's setup, results, provenance and limits.
No application, live data or other author's document was changed; no new test,
browser session, interview or external fetch was performed.

## Initial disposition

**Accept A.** The integrated recommendation is a bounded native decision over a
Request, not a general approvals platform. Its finite organization default and
authorized request choice, one eligible reviewer, current prospective applicability
and contextual recovery are reasonable uses of D21's delegated design judgment.
They do not introduce a new material owner conflict or require another founder
ratification loop. The two corrections below make existing behavior and its proof
more precise; neither expands the selected capability.

## Initial findings

### IR1 — Do not make known review-free work depend on reviewer discovery

**Medium severity; plausible likelihood if independent reads share one failure
state.** This is an ambiguity in failure handling, not an observed product defect.
The main's state table, R01 and AC09 distinguish unavailable policy/eligibility
from known not-required. They should also explicitly separate their dependencies:
failure to load reviewer options does not make an independently established
not-required policy unknown. Otherwise an unrelated directory outage could block
the routine path that the exact decision and AC01 promise to keep direct.

**Exact corrective language:** “When current policy is authoritatively known not
to require review, the ordinary independently authorized action does not depend
on reviewer-option discovery. A failed reviewer lookup blocks only actions that
actually need a qualified reviewer; it neither clears required review nor changes
the known policy result.”

**Meaningful acceptance:** With an authoritative not-required result and valid
ordinary action authority, fail reviewer discovery and complete the ordinary
action without review steps. With review required, the same failure permits
retaining preparation but cannot create routed waiting or approve/present. A
failed policy or ordinary-action authority check remains a separate failure and
does not pass merely because reviewer discovery is optional.

**Effect:** Clarifies the existing default and dependency boundary. No new optional
policy, fallback recipient or permission is proposed.

### IR2 — Make the authority-loss/decision race explicit in acceptance

**High severity if an unauthorized decision accepts; plausible likelihood without
a qualified fence.** This is a future qualification gap, not proof of a source
vulnerability. R12 already requires ordered acceptance against authority changes.
The initial AC16 states that loss blocks new decisions and preserves valid prior
approval, but does not explicitly test the competing acceptance boundary. The
experiment's case 9 removes synthetic eligibility after acceptance and attempts
a later decision; it is not a concurrent real-P12 revocation test.

**Exact corrective language:** “Race current reviewer authority loss against
decision acceptance in both controlled orders. Authority loss accepted first
prevents the new decision. A decision validly accepted first remains historical;
later reviewer departure alone does not erase it. Future use still requires the
presenting actor's current authority, compatible exact terms/policy and the
independent action-owner requirements.”

**Meaningful acceptance:** Use actual nonowner roles and the qualified P12/source
fence, observe the intended ordering, and assert decision/history/result/native
intent cardinality as well as the returned error. Do not count the sequential
synthetic flag case as this release proof. The existing action-start, reassignment
and terms races remain distinct.

**Effect:** Strengthens AC16 to prove R03/R06/R12; does not change reviewer policy,
require permanent reviewer employment or add universal two-person control.

## Substantive boundaries checked

- **Scope and strongest alternative:** Tasks/conversations and the smaller
  case-specific-only policy are fairly described. The selected finite default and
  exceptions do not imply amount thresholds, a purpose catalog, multi-step chains,
  external invitations, a mandatory coordinator or Studio activation.
- **Authority and privacy:** Ordinary editing cannot waive review. Configuration,
  decision, reassignment and prospective action require their actual powers.
  Assignment is not an access grant. A sufficient permitted view of material terms
  is required without opening the whole dossier. Applicable independent-human
  floors stay with their source owners; no universal floor or automatic self-review
  grant is invented.
- **Exact terms and recurrence:** The source-defined reviewed-field contract
  distinguishes outward terms from incidental notes/forecasts. A changed outward
  typo is conservatively a new reviewed version; this avoids inventing a browser
  or AI semantic-equivalence exemption. The ownership table, lifecycle and AC04
  explicitly prevent returning earlier values from reviving a superseded round.
  Genuine reconsideration can submit unchanged terms as a new occurrence.
- **Policy and work lifecycle:** Requirement alone is not submitted review work.
  Removing a requirement ends unnecessary pending work as No longer required,
  never Approved. Explicit request choices survive default changes. An unchanged
  valid decision can satisfy the current rule; irrelevant settings changes do not
  demand fresh approval. A later required review gets new work rather than reviving
  ended tasks. Reviewer loss before a new decision differs from departure after a
  valid decision.
- **Prospective use and historical truth:** Approval neither presents the request
  nor creates response, money, consent, publication or journey lifecycle changes.
  Authorized past-fact recording remains available without fabricated compliance.
  A queued action is not grandfathered; real P6/P17 acceptance and uncertainty must
  be qualified before enabling that integration. Local database markers cannot
  prove actual presentation or undo released communication.
- **UX and recovery:** The compact summary, relevant terms, one next actor and
  contextual actions are sufficiently concrete without adding a required wizard,
  duplicate form or second acknowledgment. No-recipient, unresolved, unsubmitted,
  routed and decided meanings remain distinct. Accepted source outcome is separate
  from notification failure, and an old receipt cannot appear as current clearance.
- **All 22 categories:** All have concern, qualitative severity/likelihood,
  evidence/limit, answer effect, permanent R language and mapped AC proof. Coverage
  includes retention, hidden projections, mixed writers, restore, provider
  ambiguity, performance and rollout rather than only happy-path approval.
  Overlap does not itself establish exhaustive proof of an unimplemented feature.
- **Operations and metrics:** Monitoring follows preventive gates. Proposed
  five-minute/three-window triggers are labeled operating choices, not measured
  service levels. Named ownership and numerical workload/budget evidence are
  release obligations; correctness failures cannot be accepted as mere metrics.

## Evidence assessment

The retained [experiment](review-round-probe/README.md) reports **10/10 first-attempt
cases**, PostgreSQL 17.11 at read committed, six observed exact-backend blocking
schedules, bounded local isolation and exact-container cleanup. The stored results
and metadata support that account. Cases cover selected transaction, duplicate,
competing-decision, version and policy-marker mechanics. The appendix and main
correctly identify synthetic flags, owner execution, no P12/RLS, no immutable-history
enforcement, no actual source-work/dispatch and no UI/load proof. This review did
not rerun them or independently qualify their hypothetical product design.

The fresh CRM/CMS sources are analogies with edition/date limits. The old Reliant
document is explicitly older narrow evidence, not a claimed current universal
agency policy. Accessibility and practitioner acceptance remain future product
proof. No additional research or test is necessary to resolve these two document
corrections.

## Resolution readback

Targeted readback completed **2026-10-10 18:12 UTC**:

- **IR1 resolved.** The main's Small policy surface now expressly makes the proved
  no-review path independent of reviewer options and retains other required action
  checks. AC02 requires the directory-outage counterexample. AC09 still preserves
  safe required-review and unknown-policy handling.
- **IR2 resolved.** AC16 now requires both reviewer-authority-loss/decision orders:
  revocation first rejects, valid decision first remains historical, and the
  presenter still needs current action checks. The main's experiment section
  continues to identify actual P12 qualification as unproved; it does not claim
  that the synthetic sequential departure case fulfills this stronger test.
- Q23 now accurately records selected A and the completed review without claiming
  subsequent explicit ratification. The original question and alternatives remain
  visible, and the completed interpretation introduces no further micro-vote.

**Final disposition: Accept A.** No remaining material contradiction or new owner
conflict was found in this bounded integrated review. The corrections strengthen
existing safeguards; they are not a materially amended choice. Actual implementation
and release qualification remain required, and no production readiness is claimed.
