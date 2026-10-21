# Phase 28 Q48 — resolve C-01 posted-gift correction approval

October 18, 2026. **Answered A: let the organization choose.**
[D48](phase28-d48-tenant-correction-approval-decision.md) records the selected
policy and its supported tenant flexibility. The question and source search
below preserve the preparation evidence before that answer.

[D47](phase28-d47-coaching-share-through-date-decision.md) settles the selected
coaching-sharing date convention. This question addresses an existing finance
owner conflict affecting Phase 28's financial dependencies. It does not add a
missionary finance editor or reopen an already selected workspace feature.

## One question

**When finance staff correct an already-posted gift, should another authorized
person always approve it?**

- **A — Let the organization choose whether a second approver is required
  (recommended).** Otherwise, currently authorized finance staff can apply the
  correction with a reason and permanent audit history.
- **B — Always require a different approver.** Every staff-initiated correction
  to an already-posted gift waits for another authorized person.

Both preserve the original financial record, use separate corrective entries
and retain independently required risk and money-out safeguards. Authenticated
bank/provider settlement and return evidence does not wait for this manual
staff approval. Missionary visibility or reporting a gift in hand grants no
correction or approval authority.

## Verified repository conflict

The current [program gate](../../../prds/program-roadmap/decisions-and-gates.md#cross-owner-clarification-found-on-september-23)
explicitly requires the founder's ruling. The
[P13 contribution owner](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:113)
records capability-authorized correction with mandatory reason/audit and
optional tenant separation of duties. The
[P15 offline-gift owner](../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:1230)
retains a different-approver rule for post-commit amendments. Both currently
carry the same unresolved-conflict notice. P27's
[Requests contract](../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:119)
also preserves that upstream gate.

The [congruence audit](../../../ai/audits/2026-09-23-contract-congruence.md#one-unresolved-owner-decision)
states the precise alternatives and recommends the P13 default.
[ADR-0009](../../../adr/0009-validate-equals-post-default.md)
does not unambiguously resolve this correction exception. The separate
[ADR-0206 immutable posted-fact decision](../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md)
is already settled and is not reopened.

An independent read-only search of current `docs/` and `openspec/` found no later
C-01 resolution; the governing notices still mark it pending. This is a verified
repository decision gap, not a claim about deployed behavior or undiscovered
external conversations. No live provider, database or GitHub mutation occurred.

## Recommendation and practical tradeoff

Recommend A, following P13's recorded operating philosophy and the audit's
existing recommendation. It avoids making every correction depend on a second
available finance person while allowing organizations to require that review.
The responsibility for choosing the policy belongs to currently authorized
organization governance; it is not a bypass option on an individual correction.

B gives every such staff correction a consistent independent-review requirement,
with the corresponding wait and staffing requirement. Neither alternative lets
staff silently overwrite financial history or bypass an independently required
control. These are product/governance tradeoffs grounded in the repository;
no universal nonprofit best-practice claim, measured fraud reduction or observed
staffing prevalence is asserted.

## Consequences to carry into the owner amendment

Whichever answer is selected must explicitly reconcile P13/P15 and their declared
projections. The current session remains research and decision recording only;
formal owner edits require the separately authorized transition.

Use the existing policy and capability owners, not a second approval engine.
The correction UI must show the effective policy and truthful outcome, including
waiting for review when applicable. Permission, policy and source revision must
be current at acceptance; stale review cannot approve changed facts. Exact
atomicity, attribution, idempotency, audit and history protection remain owner
engineering obligations. Do not infer new refund powers, waive risk controls,
auto-approve pending work after a policy change or reinterpret a prior correction.

Q48 is answered A. D48 settles C-01's product-policy choice; formal P12/P13/P15
reconciliation and qualification still gate the affected correction path.
Independently qualified work continues. E7 campaign attribution remains open;
the [session continuation](phase28-session.md#next-conversation-step) tracks the
next question. No blanket earlier-packet adoption, formal specification or
Phase 28 completion follows from this answer.
