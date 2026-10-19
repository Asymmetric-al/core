# D30 ownership — reviewed transfers with optional automatic replacement

2026-10-11 UTC. Research against HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. The founder selected reviewed
transfers by default while permitting tenants to enable automatic changes to
existing rule-managed assignments. This is the combined direction, not removal
of the already-required initial auto-assignment capability. No ratification,
formal owner edit, implementation or live qualification is claimed here.

**Recommendation:** accept the direction with the explicit policy/provenance and
handoff qualifications below. The strongest simpler alternative remains initial
routing plus reviewed individual/bulk transfers only: less machinery and less
unexpected movement, but no continuously aligned rule-managed assignments. The
selected optional mode is coherent if it remains bounded and genuinely optional.

## Verified governing evidence

- [Q30:10–23, 39–85](../phase27-q30-assignment-rule-changes.md:10) identifies the
  open replacement policy and protects scoped responsibility, manual exceptions,
  source handoffs and native independence. Its historical unanswered heading
  predates the founder's selection.
- [P27 roadmap:4085–4105](../../../../prds/sitestacker-parity/roadmap.md:4085)
  and [retained obligations:13–16](../../../../prds/program-roadmap/owner-constraints.md:13)
  already require native rule-based assignment, manual override, transfer and
  history; portfolios derive from source edges, never another membership store.
- [P9 A4:353–358](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353)
  owns one time-bounded canonical edge and active `(from,to,type)` uniqueness.
  [A12:484–494](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:484)
  requires N role-qualified assignees and one primary. [User story:226–229](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:226)
  confirms this is a product requirement, not a replace-all owner field.
- [D5:182–195](../phase27-q5-accountability-default.md:182) distinguishes Party
  representative, partnership lead and Request/task owner; initial defaulting
  is not standing reassignment or visibility authority. D21 delegates routine
  UI/recovery, not undocumented source-policy changes.
- [P12:1542–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1542)
  requires current exact context/capabilities and an NHI's live human-owner
  ceiling. [1600–1604](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1600)
  protects field predicates and distinguishes exceptional authorization-bearing
  managerial scope from ordinary responsibility edges.
- [P34:4723–4739](../../../../prds/sitestacker-parity/roadmap.md:4723) recognizes
  source-managed native settings, versioned definitions and true/false/unknown
  source facts. [4751–4759](../../../../prds/sitestacker-parity/roadmap.md:4751)
  requires qualified actions/current NHI authority and forbids optional workflows
  delaying identity revocation. Native P27 assignment does not wait for Studio.
- [ADM-02:45–81](../../../../prds/workflow-studio/07-core-workflow-catalog.md:45)
  is a default-disabled staff-transition workflow, triggered after a responsibility
  change. Its completion requires source assignment versions and receiving-owner
  acknowledgment. Its binding is explicitly unresolved, not a delivered handoff
  API. ADM-01 is the distinct onboarding recipe, not this transfer contract.
- [P44:5740–5752](../../../../prds/sitestacker-parity/roadmap.md:5740) separates
  human, Tenant assignment and operational responsibility; directory attributes
  cannot rewrite CRM ownership. Deactivation invokes P12 immediately, without
  waiting for bulk-change approval or handoff. [5787](../../../../prds/sitestacker-parity/roadmap.md:5787)
  rejects directory-inferred successors and NHI ownership transfers.
- [ADR0183:24–69](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24)
  requires concrete source work and eligible responsibility; [93–100](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:93)
  distinguishes reassignment from completion. [ADR0216:17–40](../../../../adr/0216-non-destructive-source-governed-replayable-donor-merge.md:17)
  permits only qualified current-reference repair and restriction-safe Undo.

Bounded searches in current CRM API files and CRM-named migrations found no
`staff_assignment`, `assignment_rule` or `rule_managed` implementation hits.
This is limited checkout evidence, not proof that no implementation or retained
data exists anywhere. No production census or executable probe was performed.

## Exact qualifications and concerns

### O1 — “Unassigned” silently defeats deliberate exceptions

**High severity; likely unless management provenance is explicit.**

**Required clause:** “Initial routing applies only to a qualified genuinely new
or unassigned responsibility that is eligible for rules. A deliberate manual
assignment, protected exception or deliberate unassignment is not silently
overwritten or refilled. Only a separately deliberate authorized return-to-rule
action ends that protection. Unknown provenance is not rule-managed.”

Record current management basis and its source history; a name, current rule
match, imported value or prior automation account cannot prove it. Do not infer
manual takeover from an unrelated edit, merely opening a proposal or a retry.
An explicitly requested change of management basis can matter even when the
staff person stays the same; explain and audit that policy effect rather than
creating a fictitious representative transfer. Losing eligibility never restores
access or makes the departed incumbent a valid current recipient.

### O2 — Replacing a role flattens responsibility or changes the primary

**High severity; plausible with a single owner column or coarse edge key.**

**Required clause:** “Every proposal and mutation names one exact existing source
responsibility and role/scope. Preserve other active assignments and the P9
primary invariant. Primary status changes only when the exact authorized source
operation includes and validates that consequence; initial routing does not infer
it. Changing a Party edge does not transfer a partnership lead, Request or task.”

**Exact proposed P9 reconciliation:** “For the staff-assignment family, active
canonical assignment identity distinguishes the named role-qualified
responsibility. The same staff person and Party may hold multiple distinct
roles without one replacing another. Prevent duplicate active copies of the
same qualified assignment; preserve A4's existing uniqueness rule for other
relationship families. This does not impose one assignee per role. A transfer
affects only its named role-qualified responsibility and any explicitly included,
valid primary consequence.”

This is a required additive owner amendment, not a claim that A4's currently
published `(from,to,type)` already implements it. If roles are edge attributes,
the staff-family identity must be role-aware; an equivalent normalized role or
per-role-type representation is acceptable only within P9's agreed owner model.
Physical representation remains the owner's design responsibility, while this
logical requirement is resolved now. Do not invent a second portfolio table.
Multiple compatible matches resolving to one qualified outcome need not
manufacture several assignments. No schema alteration is made here.

### O3 — Tenant rules become an unrestricted automation or access engine

**Critical severity; plausible if generic filters or directory fields are trusted.**

**Required clause:** “P27 owns bounded native assignment policy over registered
source-approved criteria and eligible targets for the exact role/scope. No
arbitrary formulas, executable predicates, write-any-field actions, permission
grants or parallel workflow language. Advanced recipes consume the same source
commands through P34. Policy configuration does not itself grant runtime authority.”

Current P12 authority governs rule administration, evaluated inputs, source
mutation and recipient eligibility independently. Hidden/unknown facts cannot
be treated as false to force another branch. Use a deterministic explained
qualified outcome; unresolved competing outcomes, no eligible destination or
uncertain evaluation do not pick the first row or silently clear an incumbent.
No automatic unassignment is authorized merely because this replacement policy
finds no new match. Expose the source-owned repair without an invented queue.
P9 representative edges must not mutate P12's separately governed manager/grant
topology. Region, Site, employment label or directory group is not entity/access
authority. Source NHI execution rechecks its active owner ceiling; historical
approval and service credentials are not durable permission.

### O4 — Optional mode unexpectedly sweeps history or revives queued changes

**High severity; plausible with asynchronous rule evaluation.**

**Required clause:** “Reviewed transfer is the default for existing assignments.
An authorized tenant policy can explicitly permit prospective automatic
replacement only of current rule-managed responsibilities in its named scope.
Show current impact and explain continuing application to future relevant
changes. Enabling, editing or disabling policy never rewrites past responsibility.”

Automatic mode evaluates eligible current state, not old event history. A
standing policy is not a frozen preview population or blanket grant. Conversely
a reviewed manual group binds the actual selected responsibilities and intended
changes; it cannot re-run a live filter and add replacements during execution.

Turning automatic replacement Off fences uncommitted automatic mutations and
leaves initial routing governed separately. It does not reverse transfers already
accepted, erase history or automatically transfer everyone back. Re-enable
establishes a new valid policy generation for future qualified events, with
fresh current qualification when those events execute; it does not start a
background sweep. Applying current matches is a separate finite reviewed action.
Old queued transfer intents cannot regain authority. A changed target needs a
current new intent, not reuse of an old receipt with different consequences.

### O5 — Assignment update is mistaken for acknowledged handoff

**High severity; likely if one success label covers several owners.**

**Required clause:** “Before a transfer, determine the bounded source work whose
applicability or accountability the actual change affects. Preserve independent
owners; obtain any required source disposition or acknowledgment before claiming
its consequence complete. Display assignment change, pending handoff and completed
handoff separately. Missing source proof is not successful work transfer.”

This does not require moving all linked work, loading every record in the CRM,
or installing Studio before an unaffected Party edge can change. An eligible
existing partnership lead or task owner can remain responsible. Where a required
handoff condition blocks the exact proposed replacement, automatic mode leaves
the qualified exception/proposal rather than bypassing it. Applicable ADM-02
completion still needs acknowledgment; there is no universal manager approval or
receiving acknowledgment ceremony for every native edge edit. Do not fabricate
source acknowledgment from notification read state, task completion or a directory
change. Rule mismatch alone does not create one mandatory task per Party.

### O6 — Reviewed transfer delays revocation or infers a successor

**Critical severity; plausible during departure, leave and capability loss.**

**Required clause:** “Apply source-authorized access revocation independently
and immediately. Reviewed-transfer mode, unresolved handoff or an unavailable
successor cannot preserve access. Neither directory reactivation nor a region,
manager or group change appoints a new business owner or restores old grants.”

Preserve responsibility history and expose genuinely unassigned/ineligible work
through its qualified source path. A valid new recipient needs independent
current visibility/action authority. Do not delay deny-first access loss until
all assignments are repaired, or delete operational/financial history because
the person left. The configuring human's historical authorship, current policy
authority and an NHI's live owner are distinct; apply each actual source rule
rather than a blanket delete-all-jobs or keep-all-jobs rule.

### O7 — Concurrency, merge or retries overwrite later human intent

**High severity; plausible when automatic and manual changes coexist.**

**Required clause:** “At acceptance, re-prove current assignment/management basis,
policy generation, relevant source facts, eligible target, authority and required
handoff conditions under the qualified source concurrency boundary. Commit the
accepted assignment, primary consequence, history and receipt together. Retry the
same effect without rewriting dates or later choices; stale proposals conflict.”

A rule job losing a race to manual takeover, policy Off, target revocation or
source reassignment cannot overwrite the winner. Independent reviewed members
may succeed separately with truthful results; there is no implied all-portfolio
transaction. Current target unchanged means no representative transfer, not a
fresh start date or new task. Merge/Undo preserves source-approved references,
later restrictions and manual exceptions; it does not union rules, pick a new
primary or convert unknown history into automatic-management eligibility.

## Formal reconciliation and acceptance

At /to-prd, qualify P27 roadmap/retained rule and transfer wording with the default
and optional mode, exact source scope, provenance, exception and lifecycle rules.
P9 must own the role/primary identity and source transfer operation; P12 supplies
current grants/floors; any consumed handoff adapter requires explicit owner
binding. Preserve D5. No P34/ADM or P44 approval rule is weakened, and their
publication does not prove runtime readiness.

Required acceptance cases:

1. Initial qualified routing succeeds; ordinary existing assignments remain
   unchanged until reviewed transfer or applicable opt-in automatic replacement.
2. Manual assignment, deliberate unassignment, unknown imported provenance and
   explicit return-to-rule retain their distinct, explainable behavior.
3. The same staff person and Party retain two distinct roles; transferring one
   preserves the other and the primary invariant. Multiple legitimate assignees
   in one role remain supported, duplicate copies do not appear, and non-staff
   edge uniqueness is unchanged. Partnership/Request/task owners and permissions
   remain independently correct.
4. Multiple/unknown/no-eligible matches never guess, clear responsibility silently
   or leak hidden inputs. Same target creates no duplicate transfer.
5. Policy activation, edit, Off/re-enable, manual takeover, revocation and merge
   race safely with deferred changes; current receipts distinguish accepted,
   unaccepted, pending handoff and unknown outcomes.
6. Actual required handoff acknowledgment remains required; an unrelated optional
   workflow is not a prerequisite for a valid native operation.
7. Access revocation succeeds while transfer is blocked; no directory successor,
   stale NHI authority, role-label grant or reactivation shortcut is accepted.
8. Reviewed groups preserve finite intent, per-member source effects, current
   disclosure and honest recovery without duplicate messages or review tasks.

These are proposed proof obligations, not executed tests or a qualified release.
No new assignment, portfolio, task, permission or generic workflow engine is
required; the unresolved source bindings must be concretely proved before use.
