# Phase 24 D40 — Deliberate Continuity Direct Grant

**Decision date:** 2026-08-29  
**Founder direction:** Option 1 — allow a separate direct D38 source while
group-derived D38 exists only through a deliberate secondary action that shows
the existing source, requires a fresh concise reason and independent
unpreselected duration, and warns that group removal will not end access.  
**Scope:** Creation, provenance, lifecycle, revocation, explanation, and UX of
one direct D38 source created while the same Active Tenant Assignment already
has group-derived D38.  
**Method:** /grill-with-docs, repository and governing-document audit, current
primary-source research, Core UI/accessibility review, and a ruthless
22-category adversarial pass.  
**Verification note:** Per founder direction, broad formatting, local-link,
skill-parity, strict OpenSpec, lint, typecheck, unit, build, and git diff
checks remain deferred until the end of the Grill session. This artifact
received only focused structural and contract-count checks.

## Final disposition

**Accept with required amendments.**

A deliberate overlapping direct source is a valid continuity tool and is
consistent with modern additive IAM. Microsoft Purview explicitly documents
that an individual assignment and a security-group assignment retain
independent expirations and that access remains while either path is valid.
Entra exposes direct versus indirect assignment paths; AWS tells reviewers to
understand every contributing policy and justify individual grants.

The unqualified answer is unsafe because the new direct source changes no
present capability Boolean while materially changing future revocation. It can
quietly survive group removal, preserve access through a role change, or become
a self-granted persistence path. D40 must therefore govern **creation during
overlap**, not invent a permanently special authorization source.

The founder choice is accepted only with these amendments:

- D40 is available only when at least one complete current group-derived D38
  path exists and no current direct D38 source exists;
- every current group source is shown and bound to the review;
- the action records an immutable typed overlap creation basis, but the
  resulting direct grant is an ordinary independent D39 direct source;
- there is no ongoing “exception” Boolean, source priority, or second resolver;
- if the group-source set changes before confirmation, the command conflicts
  and never silently becomes an ordinary direct grant;
- a fresh reason and independent duration are mandatory and never inherited;
- same-Party self-grant/quorum controls apply despite no present capability
  widening;
- creating the source advances the Tenant authorization epoch exactly once
  because future continuity and current provenance changed;
- later group removal explicitly states that the direct source survives, while
  assignment suspension/end still wins; and
- the action creates no D37 application, task, notification, reminder,
  campaign, future-start scheduler, or Inngest-owned behavior.

These amendments complete Option 1 without replacing it.

## Exact corrected decision

> Core MAY create one direct D38 source for an Active Tenant Assignment that
> already receives D38 through one or more current protected Access groups, but
> only through a deliberate **Add a separate direct grant** action.
>
> The ordinary person-access surface first states that the person already has
> D38, lists every current group-derived source and duration, and describes the
> group as the simplest single source when it satisfies the need. **Add a
> separate direct grant** is a secondary action. It is never preselected,
> automatically recommended from a holder/group count, created as part of
> group membership, or hidden in a generic Save action.
>
> The review states that the direct grant changes future continuity rather than
> present ability:
>
> **Jordan already has this permission through the listed Access groups. This
> separate direct grant will remain if Jordan leaves every listed group. It
> ends only at its own expiry, through direct removal, applicable delegation
> loss, or when Jordan's organization access is suspended or ended.**
>
> The administrator enters one fresh concise governance reason and explicitly
> chooses an independent duration. D40 reuses Phase 12's one canonical grant-
> reason normalization and exact Unicode/storage/display bounds; it defines no
> local limit, and OpenSpec MUST declare those shared bounds before activation.
> No duration is preselected. The choices
> remain D38's **Ends on…** and **Until removed**. Phase 12's existing risk-
> based recertification applies according to capability/source classification;
> D40 adds no review-by date, timer, campaign, or competing lifecycle. **Ends on…**
> is described as proportionate for temporary coverage. Choosing **Until
> removed** shows a persistent-standing-access explanation but does not add a
> typed phrase, hidden checkbox, or second confirmation.
>
> Creation requires current same-Tenant `permissions.manage_grants` authority
> and a live assignable-capability ceiling covering D38. D38 possession,
> `permissions.manage_membership`, group ownership, Owner/Admin labels, policy
> editing, Website access, task authority, and current group-derived D38
> authorize nothing. Phase 12's same-Party self-grant, separation-of-duties,
> quorum-aware, and delegated-administration controls apply even though the
> target's current EffectiveAccess already includes D38.
>
> Confirmation proves that the target remains one exact eligible active same-
> Tenant staff Active Tenant Assignment; at least one complete current group-
> derived D38 path still exists; no current direct D38 source exists; every
> group source, membership edge, capability edge, bundle, expiry, delegation,
> and authorization-relevant group-source-set head shown during review remains
> current; grantor
> authority/ceiling remains current; and reason/duration remain valid.
>
> The complete current group-derived source set is canonicalized and bound to
> the review by stable source identities and authorization-relevant heads. If
> any source is added, removed, expires, changes its capability/membership/
> delegation meaning, becomes inert, or otherwise changes authorization before
> confirmation, nothing is written and Core returns current access for fresh
> review. A display-label rename alone does not change authority and uses the
> current label in the receipt. A disappeared final group path never causes the
> command to fall through into an ordinary direct grant.
>
> The direct grant uses D39's typed central
> `assignment_capability_grants` relation and ordinary D38/D39 lifecycle. It
> receives its own immutable identity, fresh reason, independent duration,
> grantor/delegation provenance, terminal history, semantic idempotency
> identity, and durable receipt. It is not linked as a child whose validity
> depends on a group.
>
> The command records an immutable typed **overlap creation basis** containing
> the exact reviewed group-derived path identities, relevant heads/source-set
> hash, and reviewed-warning contract version. This basis is audit provenance,
> not current authorization state. Core stores no ongoing `is_exception` or
> `is_redundant` Boolean: after creation, the direct source is ordinary and
> remains independently explainable even when all group sources end or return.
>
> Grant state, overlap basis, audit, durable receipt, and exactly one Tenant
> authorization-epoch advance commit atomically under Phase 12's locked
> mutation boundary. The epoch advances even though the target's current
> capability set does not widen, because current provenance, cache/explanation
> truth, and future revocation behavior changed.
>
> Exact semantic replay returns the original receipt. Reuse of the command
> identity with a changed Tenant, target, reason, duration, creation mode,
> overlap basis, source-set hash, warning version, or expected head conflicts.
> Concurrent creation yields at most one current direct D38 edge.
>
> Later group membership end, group-capability removal, expiry, delegation end,
> or archive ends only that group path. Review and success copy state that the
> separate direct grant survives and name its end condition. Removing or
> expiring the direct source while a group path survives states that group-
> derived access remains.
>
> Assignment suspension/end, the subtract-only floor, direct expiry/revoke, or
> applicable direct-grant delegation end can still deny the direct source.
> Recreated assignments inherit nothing. Only loss of the final current D38
> path fences later uncommitted D37 effects; already committed effects remain
> immutable and regrant never resumes a stopped D37 application.
>
> Creating a D40 direct source does not create, start, accept, resume, retry, or
> assign D37 work. It creates no Website table, per-group backup row, source
> priority, automatic conversion, automatic cleanup, scheduled start,
> notification, email, reminder, task, review campaign, local PIM/JIT system,
> or Inngest authorization path.

## Evidence classifications

- **Repository fact:** directly verified in the current Core checkout.
- **Verified external fact:** directly supported by a current primary source.
- **Reasonable inference:** follows from verified facts but is not measured
  product evidence.
- **Product judgment:** the chosen permanent tradeoff.
- **Assumption:** plausible but requires evidence before a quantitative product
  claim.
- **Unresolved decision:** must return to the founder as one Grill question.

## Verified repository facts

1. [Phase 12](./phase-12-full-role-permission-configuration.md) owns the
   capability registry, `assignment_capability_grants`, group/membership
   sources, administrative ceilings, EffectiveAccess, epoch, audit, RLS, and
   the sole grant-state mutation boundary.
2. [D38](./phase-24-d38-explicit-tenant-capability-grant-adversarial-review.md)
   permits Until removed or a future expiry, requires a fresh concise reason,
   makes grant administration possession-independent, and requires source-aware
   revocation.
3. [D39](./phase-24-d39-direct-and-governed-group-capability-assignment-adversarial-review.md)
   permits one typed direct source and one or more protected group paths through
   one EffectiveAccess model; neither source has precedence.
4. The pre-D40 D39 baseline permitted overlap as a representable current state
   but left deliberate creation closed; the now-landed D40 amendment defines
   the one allowed creation flow.
5. [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)
   now records D39–D40 direct/group source independence, deliberate continuity
   creation, complete provenance, and the protected administration boundary.
6. D37 authorization follows current D38 EffectiveAccess, not one specific
   source edge, and final-path loss alone fences later uncommitted effects.
7. The current Teams & Users page and admin workspace collections remain
   seed-backed prototypes with no authoritative grant command or provenance.
8. Current broad MVP role handling is not D40 grant authority.
9. Phase 12's source history is append-only/terminal and current holder status
   derives from the resolver rather than a persisted Boolean.
10. No D40 runtime, schema, production Tenant grants, or observed Tenant
    workflow currently exists.

## Current, intended, and best permanent behavior

| Concern                     | Current repository behavior | Intended governing behavior                                                                  | Best permanent D40 path                                                                       |
| --------------------------- | --------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Overlapping direct creation | No runtime support.         | D39 kept it closed pending a decision; the D40 amendment now admits one exact reviewed path. | One deliberate creation mode on the ordinary typed direct grant command.                      |
| Existing source explanation | Prototype has none.         | D39 explains every direct/group path.                                                        | Show and CAS-bind the complete current group-source set before creation.                      |
| “Exception” state           | No model.                   | D39 uses ordinary source types.                                                              | Immutable overlap creation basis only; no ongoing exception Boolean/engine.                   |
| Duration/reason             | No runtime support.         | D38 requires fresh reason and explicit duration.                                             | Independent values, never copied or defaulted from a group.                                   |
| Revocation                  | No source-aware runtime.    | D38/D39 remove one edge and explain survivors.                                               | Group removal explicitly names surviving direct source and end condition.                     |
| Epoch                       | No D40 behavior.            | Phase 12 advances on authority changes.                                                      | Advance once because future authority/provenance changed despite no present capability delta. |
| UX                          | Seed Teams Sheet.           | People & access/My Access.                                                                   | Source-first person detail with one secondary action and persistent receipt.                  |

## Current primary-source evidence

- [Microsoft Purview permissions](https://learn.microsoft.com/hr-hr/purview/purview-permissions)
  documents independent expiration for overlapping individual and security-
  group role assignments and confirms access remains while either assignment
  is current.
- [Microsoft Entra assignment-path explanation](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/groups-faq-troubleshooting)
  exposes direct versus indirect assignment paths.
- [Microsoft Entra source-specific removal](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/groups-remove-assignment)
  distinguishes removal of a direct assignment from removal of group-derived
  access.
- [Microsoft Entra direct-role guidance](https://learn.microsoft.com/en-us/entra/fundamentals/how-to-assign-roles-to-users)
  treats direct assignment as useful for one-off cases and groups as preferable
  at scale.
- [AWS IAM audit guidance](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-audit-guide.html)
  says an individual policy needs a understood reason and reviewers must
  consider every applicable policy contributing to access.
- [Google Policy Analyzer](https://docs.cloud.google.com/policy-intelligence/docs/policy-analyzer-overview)
  reports the role bindings that grant access rather than flattening them into
  one unexplained Boolean.
- [Google excessive-permission remediation](https://docs.cloud.google.com/iam/docs/pam-remediate-iam-recommendations)
  supports replacing unnecessary standing privilege with temporary/on-demand
  access when appropriate.
- [NIST SP 800-53 AC-5/AC-6](https://csrc.nist.gov/CSRC/media/Projects/risk-management/800-53%20Downloads/800-53r5/SP_800-53_v5_1-derived-OSCAL.pdf)
  supports separation of duties and least privilege.
- [OWASP Authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
  supports deny by default and current authorization on every request.
- [PostgreSQL row-security documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  distinguishes existing-row `USING` from resulting-row `WITH CHECK` and
  documents table-owner/`BYPASSRLS` behavior.
- [WAI-ARIA modal dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  supports explicit focus containment, initial focus, and focus restoration.

## Facts, judgments, assumptions, and unknowns

- **Verified external fact:** mature IAM can preserve independent direct and
  group paths with independent expiration.
- **Verified external fact:** source path must be visible to explain why one
  removal does not end access.
- **Repository fact:** D39 already represents the resulting overlap safely.
- **Product judgment:** rare intentional continuity justifies a secondary
  creation path, but ordinary redundant creation is rejected.
- **Product judgment:** “created during overlap” is immutable audit provenance,
  not a continuing authorization state.
- **Reasonable inference:** ministries may occasionally need a no-gap handoff
  from a job-function group to one continuing operator.
- **Assumption:** the frequency of that workflow is unknown; Core must not
  claim a percentage, infer it from group size, or auto-recommend D40.
- **Resolved presentation and disclosure:** D41 presents a surviving
  D40-origin direct source plainly as current direct access and retains
  **Added for continuity** only in authorized expanded provenance/history,
  without conversion or a current badge. D42 now defines the exact viewer/
  purpose disclosure tiers for historical group, reason, actor, and basis.

## Strongest plausible alternative

The strongest alternative is **prohibit a direct grant while any current group
path exists**.

It eliminates intentional overlap and is safer than a weak D40 implementation.
It is not the best permanent answer because handoff then requires an access gap
or a complex coordinated operation across grant and membership authority,
possibly removing unrelated capabilities carried by the group.

An atomic “replace group membership with direct D38” command is not a simpler
alternative: membership removal changes the entire group bundle and may be
owned by a different `permissions.manage_membership` actor. It would couple
authorization domains and SoD boundaries. The deliberate temporary overlap is
the proportionate permanent answer only with every D40 safeguard.

## Domain model, ownership, and invariants

### Authoritative concepts

- **Separate direct grant:** the ordinary typed D39 direct D38 source created
  through D40 while group-derived access was current.
- **Overlap creation basis:** immutable audit provenance proving the exact
  current group-derived path set, relevant heads/hash, and warning contract
  reviewed at creation.
- **Group-source-set head:** a canonical stable-identity representation of all
  current group-derived D38 paths shown in the review.
- **Creation mode:** immutable audit classification distinguishing this
  reviewed creation from an ordinary direct grant; it never participates in
  current authorization.
- **Current authority:** ordinary D39 EffectiveAccess over current direct/group
  sources and the floor. There is no ongoing D40 exception state.

### Ownership map

| Fact                    | Authority                               | Consumers                  | Never authority             |
| ----------------------- | --------------------------------------- | -------------------------- | --------------------------- |
| Current group paths     | Phase 12 source edges + PDP             | review, basis, explanation | client list, Team seed      |
| Direct grant            | Phase 12 `assignment_capability_grants` | PDP, People & access, D37  | overlap basis, reason       |
| Overlap creation basis  | Phase 12 grant/audit lineage            | audit, receipt, history    | direct-grant validity       |
| Reason/duration         | Direct grant governance state           | access history, expiry     | group reason/duration       |
| Current EffectiveAccess | `resolveProjection` at current epoch    | D37 PEP, explanation       | source count, creation mode |
| D37 application         | Website recovery domain                 | safe revoke consequence    | D40 grant state             |
| UI/Tasks/notifications  | projections only                        | authorized viewers         | grant, expiry, cleanup      |

### Invariants

1. D40 creation requires at least one complete current group-derived D38 path.
2. D40 creation requires zero current direct D38 paths.
3. At most one current direct D38 edge exists for the assignment.
4. The reviewed group-source set is complete, canonical, and head-bound.
5. Any relevant source-set change before commit conflicts.
6. No conflict silently falls back to ordinary direct creation.
7. The direct edge uses the ordinary D39 source type and PDP.
8. Creation mode/basis never grants, denies, prioritizes, or expires access.
9. The basis is immutable and survives group path end/rename/archive.
10. Basis links are typed/stable and never bare group labels.
11. The direct grant does not depend on group validity after commit.
12. The direct reason is fresh and never copied from a group or prior grant.
13. The direct duration is explicit, unpreselected, and independent.
14. A future expiry is one trusted UTC instant.
15. Until removed remains standing until direct revoke or another governing
    terminal/Phase 12 recertification condition; D40 owns no timer.
16. Current EffectiveAccess still contains one D38 capability.
17. Holder count still contains one Active Tenant Assignment.
18. Creating the source advances the Tenant epoch exactly once.
19. Removing a group edge never removes the direct edge.
20. Removing the direct edge never removes a group edge.
21. Group return/addition never auto-removes or rewrites the direct edge.
22. Group removal success never claims D38 ended while direct survives.
23. Assignment suspension/end and the floor always win.
24. Recreated assignment inherits nothing.
25. Terminal direct edge never reactivates; successor review is fresh.
26. Same-Party self-grant controls apply across every hat.
27. D40 creates no D37 operation or task.
28. Unknown basis/creation mode/state fails closed for new writes.
29. General logs/analytics contain identifiers and outcome only, not reason or
    group membership detail.
30. No automatic metric, timer, worker, or external event creates/removes D40.

## UX and UI contract

### Entry state

```text
Apply Website recovery settings to current work

Already has this permission
Through Website Operations · Until removed

Keeping the group as the only source is simplest.

Add a separate direct grant
```

The secondary action is visually subordinate but remains a labeled,
keyboard-focusable control. It is not hidden in an unlabeled overflow menu.

### Review

```text
Add a separate direct grant?

Jordan already has this permission through:
• Website Operations · Until removed
• Digital Ministry Coverage · Ends 30 September 2026

A separate direct grant will remain if Jordan leaves these groups.
Ending or suspending Jordan's organization access will still end the
permission.

Reason for separate access
[Required fresh concise reason]

Duration
( ) Ends on…
( ) Until removed

[Cancel] [Add separate grant]
```

Neither duration choice is initially selected. If **Until removed** is chosen:

```text
This direct grant will remain until an authorized access manager removes it,
even if every listed group source ends.
```

The source list is semantic text with expandable/paginated detail when needed.
It shows every current group source, state, and end condition without exposing
Website work.

### Success

```text
Separate direct grant added

Jordan will keep this permission if group access ends.
Direct grant · Ends 15 October 2026
```

The result is persistent, route-addressable, programmatically announced, and
backed by the durable receipt. A toast is supplementary.

### Later group removal

```text
Remove Jordan from Website Operations?

Jordan will lose the permissions provided by this group.
Jordan will keep Website recovery permission through a separate direct grant
until 15 October 2026.

[Cancel] [Remove member]
```

Success:

```text
Removed from Website Operations

Jordan still has Website recovery permission through a separate direct grant.
```

### Direct removal while a group survives

```text
Separate direct grant removed

Jordan still has Website recovery permission through Website Operations.
```

### Interaction and accessibility

- Use D39's People & access person detail and Base Maia semantic primitives.
- Do not add a modal inside the seed-backed Team Sheet.
- Use a semantic radio group for duration and associated descriptions/errors.
- Preserve at least 44-by-44 CSS-pixel important controls.
- Keep visible focus, logical order, focus containment/restoration, and
  programmatic status.
- Reflow at 320 CSS pixels and 400-percent zoom with no horizontal matrix.
- Support forced colors and reduced motion; color/icon/hover never carries
  unique meaning.
- Localize date, time, zone, and plural source counts.
- Preserve long/CJK/RTL/bidirectional names and labels without ambiguous
  truncation.
- Recover a durable receipt/current state after response loss before retry.

### Privacy and quiet behavior

Only authorized grant managers see other people's full source basis/reason.
The subject sees their current safe source, duration, and access explanation;
D40's governance reason is audit evidence, not a recipient message. General
staff cannot enumerate bases, reasons, holder identities, or history.

D40 creates no notification, unread, email, reminder, recurring task, SLA, or
escalation. It does not score staff or Tenants by exception use.

## Conceptual persistence, RLS, and authorization

D40 extends the ordinary Phase 12 direct-grant command and audit lineage; it
adds no Website or second grant table.

Required persistence behavior:

- direct grant remains a typed `assignment_capability_grants` edge;
- one immutable creation-mode value and typed overlap-basis relationship or
  equivalently constraint-complete audit structure records creation context;
- basis records exact same-Tenant group capability/membership path identities,
  relevant heads/canonical set hash, and warning contract version;
- basis identity is immutable, `ON DELETE RESTRICT`, and non-authoritative;
- no current `is_redundant` or `is_exception` Boolean is stored or recomputed;
- direct reason, duration, grantor/delegation, state, and receipt are
  independent of all group fields;
- one current semantic direct edge remains unique by Tenant/assignment/
  capability;
- Tenant, assignment, capability, basis, creation mode, grantor, delegation,
  and audit attribution cannot move by update;
- terminal lifecycle is append-only/immutable with successor lineage;
- ordinary group/assignment/identity deletion never cascades history;
- reason is normalized, bounded, Unicode-safe, and excludes protected
  Website/worker/care/donor/location/correction content;
- indexes support current assignment/capability lookup and basis/provenance
  reconstruction without group/audit scans;
- derived explanation caches key the Tenant epoch and never authorize.

RLS/authorization behavior:

- current `permissions.manage_grants` plus same-Tenant administrative scope/
  ceiling is required;
- same-Party self/quorum/SoD and delegation proofs run server-side;
- the server derives the entire current group source set and basis;
- caller-supplied Tenant, actor, target class, source IDs/hash, creation mode,
  reason provenance, time, or audit attribution is rejected/ignored;
- browser writes are revoked;
- grant/basis/audit/receipt relations `ENABLE` and `FORCE ROW LEVEL SECURITY`;
- operation-correct `USING` and `WITH CHECK` protect existing and resulting
  scope;
- the sole function pins `search_path` and cannot be bypassed by another RPC;
- table owner, service role, `BYPASSRLS`, worker, support, repair, import,
  export, Realtime, cache, AI, and Inngest preserve product-rule parity.

## Lifecycle, concurrency, and idempotency

```text
group-derived D38; no direct source
  |
  +-- current source review + reason + duration
  |      stale/unauthorized/ineligible/direct-exists -> no write
  |
  +-- locked confirm
  |      +-- direct edge + basis + audit + receipt + epoch
  |
  +-- later group path ends
  |      +-- direct source survives
  |
  +-- later direct path ends
  |      group survives -> D38 remains
  |      no path survives -> D37 fence
  |
  +-- assignment/floor/delegation ends
         +-- current authority re-resolves; no resurrection
```

Required command order:

1. derive Tenant Authorization Context and actual/acting actor;
2. take the Phase 12 grant-state lock;
3. re-prove grantor operation, administrative ceiling, self/SoD/quorum, and
   target eligibility;
4. prove no current direct edge;
5. enumerate/canonicalize every current complete group-derived D38 path;
6. compare the current source set and relevant heads to the reviewed basis;
7. validate fresh reason and independent duration;
8. compute unchanged present EffectiveAccess and changed provenance/future
   continuity;
9. append direct edge, basis, audit, receipt, and one epoch atomically;
10. return the receipt only after commit.

Race outcomes:

- group path ends first: D40 conflicts; ordinary direct grant requires fresh
  review;
- D40 commits first: later group removal sees and reports the direct survivor;
- another direct grant commits first: D40 conflicts and creates no duplicate;
- target offboarding commits first: D40 denies;
- grantor ceiling loss commits first: D40 denies;
- exact expiry boundary: trusted server time decides under lock;
- lost response: exact replay returns the original receipt.

Creating D40 during active D37 advances the epoch and causes safe reproof, but
does not stop/start/resume the application because current D38 remains. Later
final-path loss uses D37's existing commit-time fence.

## Normative requirements

1. **D40-R1 — Deliberate creation only.** Overlapping direct creation is one
   explicit secondary action, never a default or automation.
2. **D40-R2 — Current group precondition.** At least one complete current
   group-derived D38 path must exist at review and commit.
3. **D40-R3 — No existing direct source.** A current direct D38 edge makes D40
   creation unavailable.
4. **D40-R4 — Show existing sources first.** Review enumerates every current
   group source, state, and end condition.
5. **D40-R5 — Sticky-access warning.** Copy states that group removal does not
   end the direct grant and distinguishes assignment offboarding.
6. **D40-R6 — Fresh concise reason.** The direct source requires a new
   minimized reason and inherits none. It reuses Phase 12's one exact reason
   contract; D40 defines no local normalization or length rule.
7. **D40-R7 — Unpreselected independent duration.** The user must choose the
   direct source's own duration; nothing copies or defaults it.
8. **D40-R8 — Ordinary direct source.** After creation it is one ordinary typed
   D39 `assignment_capability_grants` edge.
9. **D40-R9 — Immutable overlap basis.** Creation records the reviewed
   group-path identities, heads/hash, and warning version.
10. **D40-R10 — Basis is not authority.** No ongoing redundant/exception
    Boolean, source priority, or group dependency governs the direct edge.
11. **D40-R11 — Current grant authority.** `permissions.manage_grants` plus
    live administrative ceiling owns creation.
12. **D40-R12 — Self/SoD/quorum parity.** Same-Party self creation uses Phase
    12's existing controls despite unchanged present EffectiveAccess.
13. **D40-R13 — Complete source-set CAS.** Every current group source and
    relevant head is bound to review/commit.
14. **D40-R14 — No stale fallback.** Changed/disappeared group basis conflicts
    and never becomes an ordinary direct grant.
15. **D40-R15 — One current direct edge.** Concurrency/uniqueness prevents
    duplicate direct D38 sources.
16. **D40-R16 — Trusted attribution.** Tenant, actors, subject, source set,
    capability, creation mode, time, and audit facts are server-derived.
17. **D40-R17 — One locked atomic mutation.** Direct edge, basis, audit,
    receipt, and epoch commit together.
18. **D40-R18 — Epoch advances once.** Creation advances the Tenant epoch even
    though the current capability set is unchanged.
19. **D40-R19 — Semantic idempotency.** Exact replay returns one receipt;
    changed intent/basis conflicts.
20. **D40-R20 — Independent lifecycle.** Group changes never automatically
    alter the direct reason, duration, state, or grant.
21. **D40-R21 — Honest later group removal.** Review/result names the surviving
    direct path and its end condition.
22. **D40-R22 — Honest direct removal.** If a group survives, direct removal
    reports that access remains.
23. **D40-R23 — Assignment/floor wins.** Suspension, assignment end, floor,
    direct expiry/revoke, and applicable delegation end can deny.
24. **D40-R24 — Final-path D37 fence.** Final current D38 loss alone fences
    later uncommitted D37 effects.
25. **D40-R25 — No D37 creation/resume.** D40 does not start, accept, assign,
    retry, or resume current-work application.
26. **D40-R26 — Tenant/RLS structure.** Same-Tenant typed relationships,
    immutable scope/basis, forced RLS, correct policies, and restrictive
    deletion protect the source.
27. **D40-R27 — Privacy/minimization.** Reason/basis/roster/history is
    governance-only and absent from logs/tasks/AI/analytics.
28. **D40-R28 — Accessible durable UX.** Source-first review and results are
    persistent, responsive, keyboard/screen-reader/touch safe.
29. **D40-R29 — No local machinery.** No new engine, scheduler, auto-cleanup,
    campaign, task, notification, external sync, or Inngest authority.
30. **D40-R30 — Proof gate.** D38–D42 are recorded; Phase 12/OpenSpec,
    implementation, tests, and release evidence must agree before activation.

## Ruthless adversarial review by category

### 1. Problem validity, necessity, and alternatives

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                      | Severity / likelihood | Evidence / effect                                                                                                                                                       | Permanent fix                                                               | Exact language                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| A “backup” source could solve an invented workflow and normalize duplicate privilege; prohibiting it can also create a real handoff gap or force removal of unrelated group capabilities. | Medium / Medium       | Continuity is a reasonable inference, not verified ministry research. Purview proves independent overlap is a valid IAM model. The choice is narrowed, not invalidated. | Keep D40 optional/secondary and measure use; never recommend automatically. | “D40 MAY be chosen deliberately and MUST NOT be required, inferred, seeded, or promoted from holder/group counts.” |
| A simpler atomic handoff appears attractive but crosses `manage_grants` and `manage_membership` and the group's entire bundle.                                                            | High / Medium         | D39 deliberately separates those operations/owners.                                                                                                                     | Preserve separate commands and allow a reviewed overlap interval.           | “D40 MUST NOT merge group-membership removal and direct grant creation into one hidden cross-authority command.”   |

### 2. Brittleness

**Material concern exists.**

| What could go wrong / why it matters                                                                                       | Severity / likelihood | Evidence / effect                                                | Permanent fix                                                                             | Exact language                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| The group basis can expire/change between preview and commit, changing a continuity exception into the only access source. | Critical / Medium     | D40's meaning depends on current overlap.                        | Canonical complete source-set head and CAS; conflict on any relevant change; no fallback. | “A changed, disappeared, added, or ineligible reviewed group source MUST produce no write and a fresh review.” |
| Group rename/restore could corrupt historical meaning if basis uses labels or mutable current state.                       | High / Medium         | Phase 12 names never authorize and terminal history is retained. | Stable typed path IDs/heads and immutable warning/version basis; labels display only.     | “Overlap basis MUST use stable source identities, never labels or a current redundancy Boolean.”               |

### 3. Technical debt

**Material concern exists.**

| What could go wrong / why it matters                                                                        | Severity / likelihood | Evidence / effect                                                                | Permanent fix                                                          | Exact language                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| A D40 table, subtype resolver, ongoing exception state machine, or automatic cleanup engine would fork D39. | High / Medium         | D39 already owns typed direct sources and additive EffectiveAccess.              | Extend ordinary direct-grant creation/audit with immutable basis only. | “After commit the source is an ordinary assignment capability grant; creation basis never participates in current authorization.” |
| Copying group reason/expiry looks convenient but couples independent lifecycles and makes audit misleading. | High / Medium         | Purview assigns independent expirations; founder requires fresh reason/duration. | Independent fields and validation.                                     | “D40 reason, duration, delegation, and terminal state MUST NOT inherit or synchronize with any group source.”                     |

### 4. Edge cases

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                                    | Severity / likelihood | Evidence / effect                                                             | Permanent fix                                                                                       | Exact language                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Multiple groups, one expiring, group rename/archive/return, direct already present, alternate hats, suspension, rehire, delegation end, Party merge, and active D37 can produce contradictory outcomes. | High / High aggregate | All are realistic additive IAM/lifecycle states.                              | Bind complete source set, retain ordinary direct lifecycle, final-path resolution, no resurrection. | “Every transition MUST re-resolve current paths independently; no group change rewrites the direct edge.”  |
| A direct grant expiring before every group may never affect EffectiveAccess.                                                                                                                            | Medium / Medium       | Independent duration can deliberately cover only a planned transition window. | Allow; explain duration independently; do not invent minimum relationship.                          | “D40 duration MAY be shorter or longer than group paths and MUST remain an explicit administrator choice.” |

### 5. Footguns

**Material concern exists.**

| What could go wrong / why it matters                                                                          | Severity / likelihood              | Evidence / effect                                                                  | Permanent fix                                                                               | Exact language                                                                                                               |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Staff may treat D40 as documentation because ability is unchanged, then believe group removal revokes access. | Critical / High without special UX | AWS requires understanding every contributing policy; Entra shows assignment path. | Source-first secondary action and explicit survival warning before grant and group removal. | “The review MUST say that group removal does not end the separate direct grant and MUST distinguish assignment offboarding.” |
| The actor may self-grant persistence while already holding D38 through a group.                               | Critical / Medium                  | Future survivability widens even if present ability does not.                      | Same-Party self/SoD/quorum rules.                                                           | “Unchanged current EffectiveAccess MUST NOT exempt D40 from self-grant controls.”                                            |
| A default Until removed or copied reason can create silent standing access.                                   | High / High if defaulted           | Google favors reducing unnecessary standing privilege.                             | No selected duration; fresh reason; stronger standing warning.                              | “No reason or duration choice is copied, inferred, or preselected.”                                                          |

### 6. Tenant safety

**Material concern exists.**

| What could go wrong / why it matters                                                                           | Severity / likelihood | Evidence / effect                                                             | Permanent fix                                                                             | Exact language                                                                                                          |
| -------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A cross-Tenant group path could be used as false basis for a direct grant or disclose another Tenant's groups. | Critical / Medium     | Phase 12 requires same-Tenant structural edges and one authorization context. | Same-Tenant composite basis/source relationships, server-derived context, uniform denial. | “Target, direct grant, every basis edge, grantor, delegation, audit, and receipt MUST share one server-derived Tenant.” |
| A person-global basis could attach to another Tenant hat.                                                      | Critical / Medium     | D39 binds exact Active Tenant Assignment.                                     | Assignment ID throughout; Party only for same-self check.                                 | “D40 MUST NOT resolve or transfer authority across a person's Tenant assignments.”                                      |

### 7. Database, RLS, and authorization safety

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                | Severity / likelihood              | Evidence / effect                                              | Permanent fix                                                                                                     | Exact language                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Caller-controlled basis/hash, missing `WITH CHECK`, mutable creation mode, broad service grants, owner bypass, or cascade deletion could forge/erase justification. | Critical / High if copied from MVP | PostgreSQL documents old/new row checks and privileged bypass. | Server-derived typed basis, forced RLS, no browser writes, immutable scope, restrict deletion, privileged parity. | “Grant/basis/audit/receipt relations MUST ENABLE and FORCE RLS; all writes use the sole pinned function with operation-correct USING/WITH CHECK.” |
| A free-form JSON basis cannot enforce source class/Tenant and may accumulate protected content.                                                                     | High / Medium                      | D39 source identities are typed; D38 minimizes audit reasons.  | Typed link/relation or equivalently constraint-complete structure with bounded fields.                            | “Overlap basis MUST be structurally same-Tenant and source-typed; arbitrary protected JSON is forbidden.”                                         |

### 8. Overengineering

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                  | Severity / likelihood | Evidence / effect                                                                       | Permanent fix                                                                   | Exact language                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Scheduled start, auto-removal when group returns, D40 PIM, second approval, reminders, recertification engine, or per-group backup rows create speculative machinery. | Medium / Medium       | D38/Phase 12 already own expiry, quorum, and risk-based recertification classification. | One creation mode; ordinary source lifecycle; inherit Phase 12 recertification. | “D40 MUST add no scheduler, automatic conversion/cleanup, local approval/review campaign, or asynchronous authority.” |
| A typed phrase or double modal can be added in the name of safety.                                                                                                    | Medium / Medium       | The risk is comprehension/current proof, not irreversible deletion.                     | One proportionate review with clear copy.                                       | “D40 requires one non-nested review and MUST NOT require a typed phrase or redundant confirmation.”                   |

### 9. UX/UI and user friction

**Material concern exists.**

| What could go wrong / why it matters                                                                    | Severity / likelihood | Evidence / effect                                                                | Permanent fix                                                                                   | Exact language                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Too little hierarchy hides sticky access; too much warning alarms users or makes the common flow noisy. | High / High           | D39 established person-detail source-first IA; current Teams demo is unsuitable. | Show current access normally; reveal one secondary action and concise review only when invoked. | “The normal D38 card MUST stay uncluttered; D40 appears as one labeled secondary action after current sources.”                                   |
| Multiple groups, long names, dates, and reason fields can break mobile/a11y/low bandwidth.              | High / Medium         | Core requires Base Maia, 44px targets, 320px/400%, localization.                 | Semantic list/radio group, persistent route/receipt, full accessibility contract.               | “Every D40 state MUST remain complete by keyboard/screen reader, at 320px/400%, forced colors, reduced motion, RTL/CJK, and after response loss.” |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists.**

| What could go wrong / why it matters                                                                                        | Severity / likelihood | Evidence / effect                                                             | Permanent fix                                                             | Exact language                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| “Redundant” can change later; storing it as current authority or making basis depend on group state creates dual ownership. | Critical / High       | D39 says source paths are independent and EffectiveAccess owns current truth. | Immutable creation basis; ordinary direct source; PDP current resolution. | “Created-during-overlap is historical provenance only; no current is-redundant/is-exception Boolean may authorize or clean up access.” |
| UI, Tasks Hub, D37, cache, or analytics could reverse-write D40.                                                            | High / Medium         | D38/D39 ownership maps forbid this.                                           | Phase 12 sole writer; every other surface projection.                     | “Only Phase 12 grant authority creates/removes D40; no source/work/task/UI event owns it.”                                             |

### 11. Hidden coupling

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                     | Severity / likelihood | Evidence / effect                                              | Permanent fix                                                                               | Exact language                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Group membership end, job/title change, task assignment, coordinator change, policy edit, or group return could auto-create/remove/retime direct access. | High / Medium         | D39 separates authorization groups from operational groupings. | No automatic lifecycle coupling; only assignment/floor/delegation/direct lifecycle governs. | “No group or work event may mutate the direct grant after creation.”                       |
| D37 could bind to the overlap basis/source and stop when that group ends.                                                                                | Critical / Medium     | D37 binds current D38 EffectiveAccess.                         | Final-path check only.                                                                      | “D37 MUST remain source-agnostic and MUST NOT bind to the D40 basis or originating group.” |

### 12. Failure modes

**Material concern exists.**

| What could go wrong / why it matters                                                                                    | Severity / likelihood | Evidence / effect                                     | Permanent fix                                                                       | Exact language                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Grant can commit without basis/audit/epoch/receipt; lost response can duplicate; projection lag can hide sticky access. | Critical / Medium     | Phase 12/D38 require atomic receipt-backed authority. | One transaction, semantic idempotency, durable receipt, projection-as-nonauthority. | “Direct edge, basis, audit, receipt, and exactly one epoch advance MUST commit atomically or not at all.” |
| Group source disappears after review and writer silently continues.                                                     | Critical / Medium     | The command's semantics changed.                      | Current source-set CAS and fresh ordinary grant route.                              | “No-current-group at D40 commit is a conflict, never success or fallback.”                                |
| Reason validation or persistent result fails after commit.                                                              | High / Low-to-Medium  | Staff may retry or believe nothing happened.          | Validate before write; return/recover durable receipt after commit.                 | “Post-commit presentation failure MUST recover the receipt before offering any retry.”                    |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists.**

| What could go wrong / why it matters                                                                               | Severity / likelihood           | Evidence / effect                                                 | Permanent fix                                                                                             | Exact language                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Direct creation races group removal/expiry, another direct grant, target offboarding, grantor loss, or D37 commit. | Critical / High enough to prove | D39 has one locked/CAS mutation boundary and epoch.               | One serial order, current server clock, expected source set, unique edge, D37 commit-time reproof.        | “Every competing action MUST have one ordered result; no stale basis or inactive assignment can produce a current direct grant.” |
| Transport idempotency could replay changed duration/reason/basis.                                                  | High / Medium                   | D38 requires semantic effect identity.                            | Include creation mode, target, capability, reason hash, duration, basis hash, warning version, and heads. | “Exact replay returns original receipt; changed semantic intent under one identity conflicts.”                                   |
| Adding a no-op-current source might skip epoch invalidation.                                                       | Critical / Medium               | Provenance and future revocation change even if cap set does not. | Exactly one epoch bump and cache invalidation.                                                            | “D40 creation is an authorization-governance mutation and MUST advance the Tenant epoch exactly once.”                           |

### 14. Data integrity risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                                 | Severity / likelihood | Evidence / effect                                                | Permanent fix                                                                                   | Exact language                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate current direct rows, dangling basis links, hard-deleted group history, or terminal-row reuse can make overlap audit false. | High / Medium         | D39 already requires unique current source and terminal history. | Unique current direct edge, typed restrict-linked basis, append-only successor, reconciliation. | “Every D40 receipt MUST resolve to one direct edge and one reconstructible immutable basis; ordinary delete/cascade is forbidden.” |
| Current source-set hash could be noncanonical/order-sensitive.                                                                       | High / Medium         | Multiple group paths have no meaningful iteration order.         | Sort stable typed path identities/version heads in one versioned canonical encoding.            | “Equivalent source sets MUST produce one canonical basis hash; encoding/version is audited and build-tested.”                      |
| Automatic dedupe could delete the direct source when a group returns.                                                                | High / Medium         | The direct grant carries independent intent/reason/duration.     | No auto-dedupe/merge/cleanup.                                                                   | “Source overlap MUST remain visible and independently governed; no background process consolidates it.”                            |

### 15. Security and privacy risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                           | Severity / likelihood | Evidence / effect                                                                             | Permanent fix                                                                                         | Exact language                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| D40 may preserve access after a role/group change, enable self-persistence, or launder a delegated grant into standing access. | Critical / Medium     | This is the intended effect and primary risk; AWS requires justification and least privilege. | Fresh reason/duration, manage-grants ceiling, same-Party controls, delegation lineage, current audit. | “D40 MUST NOT survive assignment end, floor denial, direct expiry/revoke, or applicable delegation end.”                         |
| Group names, basis, reason, or staffing plans can expose ministry responsibility.                                              | High / Medium         | D38 minimizes reason and roster disclosure.                                                   | Access-governance-only projections, bounded reason, scrubbed logs/events.                             | “General logs, analytics, tasks, notifications, prompts, and documents MUST contain no D40 reason or group membership detail.”   |
| A group-removal actor may lack permission to see direct reason but needs to know access survives.                              | High / Medium         | Split grant/membership authority is intentional.                                              | Reveal safe source/duration/consequence, not reason.                                                  | “Membership review MAY disclose surviving direct source and end condition but MUST NOT require or expose its governance reason.” |

### 16. Scalability and performance risks

**Material concern exists.**

| What could go wrong / why it matters                                                | Severity / likelihood | Evidence / effect                                              | Permanent fix                                                | Exact language                                                                                       |
| ----------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Complete path enumeration/basis hashing can perform N+1 group/member/audit queries. | High / Low-to-Medium  | No verified group count, but set-based complexity is knowable. | Indexed set query, canonical stable hash, no audit scan.     | “D40 review/commit MUST enumerate current paths set-wise within Phase 12's governance query budget.” |
| Creation can trigger per-group/per-member notification/cache/task writes.           | High / Medium         | D40 affects one assignment and needs only one epoch.           | O(1) authoritative write and derived async projections only. | “D40 MUST NOT synchronously fan out per-group/member/cache/notification/task state.”                 |
| Arbitrary maximum group paths may be frozen without evidence.                       | Medium / Low          | Product scale is unknown.                                      | Prove query/UX pagination bounds, not a speculative cap.     | “No D40 source-count cap is introduced without measured product/safety evidence.”                    |

### 17. Operational burden

**Material concern exists.**

| What could go wrong / why it matters                                                                                                           | Severity / likelihood | Evidence / effect                                            | Permanent fix                                                                       | Exact language                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Prohibition forces risky sequencing; routine presentation makes duplicate privilege common; extra approvals/reminders burden small ministries. | Medium / Medium       | Option 1 is proportional only when exceptional.              | Secondary action, one review, existing Phase 12 controls, no local campaign.        | “D40 adds friction only when deliberately creating overlap; normal direct/group flows remain unchanged.”                             |
| A membership manager removing a person may discover direct access but lack authority to remove it.                                             | Medium / Medium       | D39 deliberately splits operations.                          | Truthful read-only consequence and clear governance owner; no auto-task/escalation. | “Removal UI MUST state that a grant manager owns the surviving direct source and MUST NOT silently broaden the remover's authority.” |
| Inert/expired basis history can accumulate.                                                                                                    | Low / High over time  | History is required; correctness does not depend on cleanup. | Indexed history/retention policy; no manual correctness repair.                     | “Historical basis remains queryable under retention; no recurring cleanup is required for authorization correctness.”                |

### 18. Observability and auditability gaps

**Material concern exists.**

| What could go wrong / why it matters                                                                     | Severity / likelihood                        | Evidence / effect                                       | Permanent fix                                                                                                         | Exact language                                                                                                |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Audit may record only “direct grant,” losing proof that overlap and sticky-access warning were reviewed. | High / High if ordinary audit reused blindly | D40's justification is its deliberate creation context. | Audit creation mode, basis identities/heads/hash, warning version, reason, duration, actors, epoch, outcome, receipt. | “D40 history MUST reconstruct exactly what existing paths and consequence the grantor reviewed.”              |
| Technical logs may exist while group-removal receipt falsely says access ended.                          | Critical / Medium                            | User-visible truth is the safety control.               | Durable source-aware receipt plus monitor.                                                                            | “Technical traces do not replace source-aware business history and user-visible post-change EffectiveAccess.” |
| Metrics may show usage but not coverage/denial.                                                          | Medium / Medium                              | Security reconciliation needs positive coverage.        | Report evaluated Tenants/grants/bases/paths and mismatches.                                                           | “Reconciliation MUST state coverage counts, not only zero failures.”                                          |

### 19. Dependency and integration risks

**Material concern exists.**

| What could go wrong / why it matters                                                                     | Severity / likelihood | Evidence / effect                                      | Permanent fix                                                               | Exact language                                                                                            |
| -------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Group/IdP webhooks, Inngest, Realtime, cache, or analytics could auto-create/remove D40 or delay expiry. | High / Medium         | D38/D39 make synchronous Phase 12 state authoritative. | Identifier-only derived events; fire-time/current reproof; no async writer. | “No external/asynchronous system may decide, create, expire, revoke, convert, or clean up D40 authority.” |
| Vendor/source label changes could alter the basis.                                                       | Medium / Low in v1    | D39 rejects external groups; labels are display.       | Stable Core IDs/heads and current label projection.                         | “Core remains conflict winner; external identifiers and labels never authorize or rewrite basis.”         |

### 20. Migration, rollout, and upgrade risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                    | Severity / likelihood   | Evidence / effect                                      | Permanent fix                                                                                                        | Exact language                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Existing direct+group overlap could be backfilled as a documented exception without evidence/reason/warning.            | Critical / Medium later | No D40 runtime/users now; no historical review exists. | Backfill nothing; existing unknown overlap remains non-D40 history or blocks activation per migration design.        | “Migration MUST NOT infer overlap basis, warning acknowledgement, reason, or D40 creation mode.”                                         |
| Old writer may create an ordinary direct source while group access exists, bypassing warning; rollback may erase basis. | High / Medium           | D40 adds command precondition and audit fields.        | Writer capability/version gate, deny unknown creation mode, readers first/writer last, preserve history on rollback. | “Mixed-version writers unable to prove D40 MUST reject overlapping direct creation; rollback never rewrites or drops existing evidence.” |
| D40 may ship before group-removal survivor copy.                                                                        | Critical / Medium       | Creation safety depends on later truthful removal.     | Release both creation and every affected revoke/removal surface together.                                            | “D40 activation requires source-aware direct revoke, group membership removal, group capability removal, archive, and offboarding UX.”   |

### 21. Testability, traceability, and proof

**Material concern exists.**

| What could go wrong / why it matters                                                                                                   | Severity / likelihood | Evidence / effect                                                    | Permanent fix                                                                                                  | Exact language                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Tests may prove two rows coexist but miss stale source-set races, self-grant, epoch bump, survivor copy, RLS bypass, and D37 behavior. | Critical / High       | D40's effect is future continuity/provenance, not present cap delta. | Reference-model public-seam tests across current/later outcomes, privileged paths, concurrency, accessibility. | “Release evidence MUST prove present unchanged ability and every later source-removal/final-path consequence.”                             |
| D40 terminology/semantics may diverge across log, ADR, Phase 12, OpenSpec, tasks, tests, and release.                                  | High / Medium         | It refines D39 direct creation and D37 fencing.                      | Exact trace matrix, source/basis IDs, error/result language.                                                   | “Separate direct grant, overlap creation basis, source-set head, and no-fallback conflict MUST trace consistently through every artifact.” |
| No proof with multiple groups/long names/low bandwidth.                                                                                | High / Medium         | These states drive UX and canonical hashing.                         | Production-shaped multi-path/a11y/response-loss fixtures.                                                      | “Tests MUST cover multi-group ordering/canonicalization and complete mobile/international presentation.”                                   |

### 22. Other development hazards

**Material concern exists.**

| What could go wrong / why it matters                                                           | Severity / likelihood  | Evidence / effect                                                                              | Permanent fix                                                                 | Exact language                                                                                                              |
| ---------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| “Exception” can stigmatize staff or become employee/ministry scoring.                          | Medium / Low-to-Medium | D38 forbids scoring; creation mode is audit-only.                                              | User-facing “Separate direct grant”; governance-only metrics.                 | “D40 state MUST NOT feed performance, readiness, engagement, risk ranking, or ministry-health scoring.”                     |
| Automatic dedupe/cleanup can erase legitimate intent; never cleanup can leave standing access. | High / Medium          | Independent duration and Phase 12 risk-based recertification govern, not heuristic automation. | No auto cleanup; explicit expiry/removal; inherited Phase 12 review decision. | “No metric or overlap observation mutates authority; only a governed command or authoritative lifecycle condition ends it.” |
| A warning version can change and make old basis unreadable.                                    | Medium / Medium        | Audit must prove what was acknowledged historically.                                           | Immutable copy-contract version and durable display renderer.                 | “Every basis records a stable warning-contract version whose historical meaning remains renderable.”                        |

## Acceptance criteria

### Source model and creation state

- **D40-AC001:** D40 review is available only when the target has at least one
  complete current group-derived D38 path.
- **D40-AC002:** A current direct D38 source makes D40 creation unavailable and
  prevents a second current direct edge.
- **D40-AC003:** A successful D40 source is stored as the ordinary typed Phase
  12 `assignment_capability_grants` relation.
- **D40-AC004:** No current `is_redundant`, `is_exception`, source priority, or
  D40-specific EffectiveAccess state is created.
- **D40-AC005:** The direct source enters the same D39 `resolveProjection`
  union/floor as every ordinary direct source.
- **D40-AC006:** Current EffectiveAccess contains D38 before and after creation.
- **D40-AC007:** Current effective holder count contains the target assignment
  once before and after creation.
- **D40-AC008:** Group membership, policy save, holder count, task, coordinator,
  role, source, or external event never auto-opens/executes D40.
- **D40-AC009:** Migration, seed, import, restore, clone, or historical overlap
  creates no D40 source or overlap basis.
- **D40-AC010:** Unknown creation mode, basis version, source kind, capability,
  or group-path state fails closed for new D40 writes.

### Grant authority and target eligibility

- **D40-AC011:** One exact current active same-Tenant staff Active Tenant
  Assignment with group-derived D38 is an eligible target.
- **D40-AC012:** Pending, invited, inactive, ended, expired, wrong-Tenant,
  donor, missionary, external, service, AI, API-key, or operator targets fail.
- **D40-AC013:** Current same-Tenant `permissions.manage_grants` within scope
  may open/confirm D40.
- **D40-AC014:** D38 possession, `manage_membership`, group ownership,
  Owner/Admin labels, Website/policy/task access, and route visibility cannot.
- **D40-AC015:** Grantor's live assignable-capability ceiling must cover D38 at
  review and commit.
- **D40-AC016:** A grantor targeting their own Party invokes Phase 12's self-
  grant/SoD/quorum control.
- **D40-AC017:** Same-Party detection holds across alternate profiles, auth
  users, roles, and Tenant assignments.
- **D40-AC018:** A true small-Tenant quorum shortage uses Phase 12's existing
  recovery/loud-audit rule and no D40-specific bypass.
- **D40-AC019:** Server derives Tenant, actual/acting actor, grantor assignment,
  target, capability, clock, source set, creation mode, and attribution.
- **D40-AC020:** Owner, table-owner, service-role, RPC, worker, support, repair,
  import, export, cache, Realtime, AI, and Inngest paths enforce identical
  authority/eligibility.

### Current source review and immutable basis

- **D40-AC021:** Review lists every current complete group-derived D38 path,
  including safe group label, source state, and end condition.
- **D40-AC022:** The current group-path set uses one versioned canonical stable-
  identity encoding independent of database iteration order.
- **D40-AC023:** Basis identifies exact group-capability and membership path
  identities, not bare label, name, role, or client array.
- **D40-AC024:** Basis binds every relevant group, membership, capability,
  bundle, expiry, delegation, and source-set head.
- **D40-AC025:** Adding/removing/ending/renewing a relevant group path before
  commit conflicts and writes nothing.
- **D40-AC026:** If every group-derived path ends before commit, D40 conflicts;
  it never falls through to ordinary direct creation.
- **D40-AC027:** If another direct D38 source appears before commit, D40
  conflicts and creates no duplicate.
- **D40-AC028:** Successful creation stores one immutable typed overlap basis
  that reconstructs the reviewed source set.
- **D40-AC029:** Basis records the stable reviewed-warning contract version and
  remains historically renderable after copy evolves.
- **D40-AC030:** Basis never grants, denies, prioritizes, expires, or makes the
  ordinary direct edge depend on any group after commit.

### Fresh reason and independent duration

- **D40-AC031:** Review requires one fresh concise reason for the separate
  direct source.
- **D40-AC032:** Reason is not copied, inferred, suggested, or defaulted from a
  group, policy, task, previous grant, or profile.
- **D40-AC033:** Reason satisfies the single Phase 12/OpenSpec grant-reason
  contract's explicitly declared Unicode, normalization, storage-byte, and
  display bounds and remains durable governance evidence; D40 introduces no
  local variant.
- **D40-AC034:** Helper/validation prohibit protected Website, worker, care,
  donor, location, correction, return, or task detail.
- **D40-AC035:** Neither **Ends on…** nor **Until removed** is preselected.
- **D40-AC036:** Choosing **Ends on…** requires one valid future UTC instant
  and no timer/worker for authority.
- **D40-AC037:** Choosing **Until removed** displays the stronger persistent-
  access explanation before confirmation.
- **D40-AC038:** Direct duration is independent and may be shorter or longer
  than every current group path.
- **D40-AC039:** UI displays future expiry in viewer locale with explicit time
  zone while authority uses the trusted UTC instant.
- **D40-AC040:** Phase 12 risk-based recertification applies by current
  capability/source classification; D40 adds no review-by date, timer,
  campaign, or independent mutation authority.

### Atomicity, concurrency, and idempotency

- **D40-AC041:** Grant edge, overlap basis, audit, durable receipt, and exactly
  one Tenant epoch advance commit atomically or not at all.
- **D40-AC042:** Creating D40 advances the Tenant epoch exactly once even
  though current capability/holder sets remain unchanged.
- **D40-AC043:** A failed validation/conflict advances no epoch and creates no
  partial edge, basis, audit success, or receipt.
- **D40-AC044:** Exact semantic replay returns the original durable receipt and
  creates no additional state or epoch.
- **D40-AC045:** Reused identity with changed target, reason, duration,
  creation mode, basis/source-set hash, warning version, or relevant head
  conflicts.
- **D40-AC046:** Concurrent D40 and ordinary direct creation yield at most one
  current direct edge and one complete winner history.
- **D40-AC047:** Group membership/capability removal racing D40 has one ordered
  result: D40-first leaves direct survivor; group-first forces fresh review.
- **D40-AC048:** Target suspension/offboarding racing D40 has one fail-closed
  result and never grants an ended assignment.
- **D40-AC049:** Grantor authority/ceiling loss racing D40 denies if it commits
  first and is reflected if D40 committed first.
- **D40-AC050:** Exact group/direct expiry at confirmation uses trusted server
  time under the locked command and cannot create a stale basis/current edge.

### Independent lifecycle and source-aware removal

- **D40-AC051:** After commit, group membership end does not change the direct
  grant's reason, duration, state, delegation, or authority.
- **D40-AC052:** Group-capability removal, expiry, delegation end, or archive
  likewise leaves the independent direct source unchanged.
- **D40-AC053:** Adding/returning a group path later never auto-removes,
  shortens, extends, merges, or retags the direct source.
- **D40-AC054:** Group rename changes current display label only and does not
  alter basis identity or direct authority.
- **D40-AC055:** Group-removal review says the direct source survives and shows
  its current end condition.
- **D40-AC056:** Group-removal success never says D38 ended while the direct
  source remains effective.
- **D40-AC057:** Direct revoke/expiry while a group survives says the direct
  source ended and group-derived D38 remains.
- **D40-AC058:** Direct revoke/expiry after every group path ends removes the
  final path and reports current zero-holder/final-access consequence.
- **D40-AC059:** Tenant-root direct grant survives ordinary grantor departure
  with attribution; delegated-only grant follows D38 delegation-end rules.
- **D40-AC060:** A terminal direct source cannot reactivate; regrant creates a
  fresh reviewed successor and basis as applicable.

### Assignment, identity, and floor

- **D40-AC061:** Assignment suspension/freeze resolves D38 to zero from direct
  and group paths immediately.
- **D40-AC062:** Assignment termination ends current D40 exercise and the edge
  never attaches to a recreated assignment.
- **D40-AC063:** Restoring the same assignment sees only a still-current,
  unexpired, non-revoked direct edge under Phase 12 rules.
- **D40-AC064:** Party merge neither transfers, unions, discards, nor revives
  the D40 direct edge or basis.
- **D40-AC065:** The subtract-only floor can deny D38 despite current direct
  and group sources.
- **D40-AC066:** Capability retirement denies new exercise while preserving
  direct/basis/audit history.
- **D40-AC067:** Tenant clone, backup restore, environment promotion, import,
  or staging copy creates no effective D40 grant in another environment.
- **D40-AC068:** Direct grant and basis retain same-Tenant composite assignment
  and group-path relationships throughout lifecycle.
- **D40-AC069:** Direct duration or reason cannot be mutated because a group
  source changes; renewal/succession is explicit/audited.
- **D40-AC070:** Current explanation distinguishes active, expired, revoked,
  suspended, delegation-inert, and terminal direct states from authority.

### D37 and other product boundaries

- **D40-AC071:** Creating D40 does not create, start, accept, resume, retry,
  assign, or change a D37 application.
- **D40-AC072:** Creating D40 during active D37 advances the epoch and causes
  safe current reproof without stopping or duplicating work.
- **D40-AC073:** Ending a group path while direct survives does not fence D37.
- **D40-AC074:** Losing the final current direct/group path fences every later
  uncommitted D37 member at commit-time authority/epoch proof.
- **D40-AC075:** D37 effects committed before final-path loss remain immutable
  and recoverable through the authorized D37 receipt.
- **D40-AC076:** Regrant after final-path loss never resumes stopped D37; fresh
  D37 review/application is required.
- **D40-AC077:** D40 review/removal exposes no D37 member count, Site, title,
  recipient, return/correction reason, task, or result.
- **D40-AC078:** D40 creates no Tasks Hub item, Website attention item, unread,
  email, reminder, notification, SLA, or escalation.
- **D40-AC079:** Policy editors and ordinary D38 holders receive no D40 grant
  control merely from policy/action access.
- **D40-AC080:** External IdP, SCIM, webhook, plugin, Realtime, cache, worker,
  AI, analytics, and Inngest events cannot create/remove/retime D40.

### UX, accessibility, and privacy

- **D40-AC081:** Person detail first says the target already has D38 and lists
  every current group source before any D40 control.
- **D40-AC082:** Current source list includes safe group label, path state, and
  end condition as semantic text rather than color/icon-only chips.
- **D40-AC083:** **Add a separate direct grant** is a labeled secondary action,
  visually subordinate but keyboard/screen-reader discoverable.
- **D40-AC084:** No ordinary Grant permission control, default checkbox,
  immediate switch, auto-suggestion, or generic Save creates D40.
- **D40-AC085:** Review explicitly says the direct source survives every listed
  group removal/end.
- **D40-AC086:** Review also says assignment suspension/end still ends
  organization access, preventing an overbroad permanence interpretation.
- **D40-AC087:** Duration uses one semantic unselected radio group with
  associated field descriptions and inline errors.
- **D40-AC088:** Cancel precedes **Add separate grant** in logical/visual order
  and only one non-nested confirmation exists.
- **D40-AC089:** Success persistently states sticky-access consequence and the
  direct source's chosen end condition.
- **D40-AC090:** Later group-member/capability/archive review and receipt state
  the surviving direct source/end condition.
- **D40-AC091:** Later direct-removal review and receipt state any surviving
  group source.
- **D40-AC092:** Stale source/authority review says nothing changed and links
  to current access; it never preserves stale form assumptions.
- **D40-AC093:** Lost-response reload resolves the durable receipt/current
  source before offering retry.
- **D40-AC094:** Important controls are at least 44-by-44 CSS pixels with
  visible focus, logical keyboard order, labels/errors/status, and focus
  restoration.
- **D40-AC095:** Review/result reflow at 320 CSS pixels and 400-percent zoom,
  require no horizontal matrix, and preserve forced-color/reduced-motion
  meaning.
- **D40-AC096:** Localized dates/zones/plurals, Unicode reason, long/CJK names,
  duplicate names, and RTL/bidirectional content remain unambiguous.
- **D40-AC097:** The subject sees current safe source/duration and ordinary
  direct provenance, not another person's reason or protected audit basis.
- **D40-AC098:** Unauthorized staff cannot enumerate D40 targets, source basis,
  group membership, reason, grantor/delegation, or audit history.
- **D40-AC099:** General logs, traces, errors, tasks, notifications, documents,
  analytics, and AI prompts contain no D40 reason or membership detail.
- **D40-AC100:** D40 creation mode/basis is never used for staff performance,
  engagement, readiness, risk, or ministry-health scoring.

### Database, performance, migration, and proof

- **D40-AC101:** Direct grant and every typed basis link carry
  `tenant_id NOT NULL` and same-Tenant composite assignment/group-path FKs.
- **D40-AC102:** One current semantic direct D38 edge per Tenant/assignment is
  enforced under concurrent D40/ordinary grant creation.
- **D40-AC103:** Tenant, assignment, capability, creation mode, basis,
  grantor/delegation, duration identity, and audit attribution cannot move by
  update.
- **D40-AC104:** Group/assignment/user/Tenant lifecycle cannot cascade-delete
  direct, basis, terminal, audit, or receipt history.
- **D40-AC105:** Grant/basis/audit/receipt relations ENABLE and FORCE RLS, and
  browser roles have no direct mutation grants.
- **D40-AC106:** Operation policies/functions prove correct `USING` and
  `WITH CHECK` for existing/resulting scope and reject scope transformation.
- **D40-AC107:** Table-owner, service-role, `BYPASSRLS`, RPC, worker, support,
  repair, import, export, cache, Realtime, AI, and Inngest paths pass parity
  tests.
- **D40-AC108:** Indexes support current direct/group path lookup and basis
  reconstruction without audit/global scans.
- **D40-AC109:** Review/commit use one indexed set-based current path query and
  versioned canonical hash without N+1 behavior.
- **D40-AC110:** Successful creation writes O(1) authoritative grant/basis/
  audit/receipt/epoch state and no per-group/member/task/notification fan-out.
- **D40-AC111:** Migration/backfill produces zero inferred D40 creation modes,
  bases, reasons, acknowledgements, or direct grants.
- **D40-AC112:** Mixed-version old/unknown writers cannot create overlapping
  direct grants without current D40 proof.
- **D40-AC113:** Rollback disables new D40 writes but preserves current direct
  authority, basis, audit, receipts, epochs, and D37 history.
- **D40-AC114:** Reference-model tests prove unchanged current D38 and changed
  future continuity/provenance after creation.
- **D40-AC115:** Negative/poison tests cover absent/expired/wrong-Tenant group,
  existing direct, inactive target, missing ceiling, self bypass, caller basis,
  and every privileged door.
- **D40-AC116:** Concurrency tests cover group removal/expiry, other direct
  creation, offboarding, grantor loss, exact expiry, replay, and D37 commit.
- **D40-AC117:** Accessibility/production-shaped tests cover multiple groups,
  long/international labels, every duration, lost response, mobile/reflow, and
  low bandwidth.
- **D40-AC118:** Release exercises every named safety/integrity/privacy/
  performance/UX monitor and records owner response readiness.
- **D40-AC119:** D40 terms, IDs, rules, copy, and outcomes trace through Grill,
  glossary, ADRs, Phase 12/24, OpenSpec, design, tasks, tickets, tests, and
  release evidence.
- **D40-AC120:** D38–D42 are recorded; activation requires Phase 12/OpenSpec,
  positive/negative/poison/concurrency/temporal/migration/a11y/production-
  shaped proof and release monitors to agree.

## Named monitors

| Signal                                                      |                                                                       Threshold | Owner                 | Required response                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------: | --------------------- | ---------------------------------------------------------------------------------------------- |
| `website_recovery_d40_created_without_group_basis_total`    |                                                                             Any | Security + IAM        | P0 make source inert, preserve evidence, inspect writer and affected paths.                    |
| `website_recovery_d40_created_with_stale_basis_total`       |                                                                             Any | IAM Platform          | Make result inert, repair source-set CAS/head, require fresh review.                           |
| `website_recovery_d40_ordinary_flow_overlap_total`          |                                            Any overlap created outside D40 mode | IAM + Product         | Make source inert pending review, disable writer, inspect every affected grant.                |
| `website_recovery_d40_duplicate_current_direct_total`       |                                                                             Any | Data + IAM            | Make duplicate inert, repair uniqueness/idempotency/provenance.                                |
| `website_recovery_d40_without_manage_grants_total`          |                                                                             Any | Security              | P0 revoke/inert source, inspect authority and privileged paths.                                |
| `website_recovery_d40_same_party_self_bypass_total`         |                                                                             Any | Security              | P0 revoke, inspect alternate hats and quorum evidence.                                         |
| `website_recovery_d40_basis_hash_mismatch_total`            |                                                                             Any | IAM + Data            | Stop writer, rebuild canonicalization, reconcile basis/receipts.                               |
| `website_recovery_d40_group_removal_false_revoke_total`     |                                                                             Any | Product + IAM         | Correct receipt, preserve true access, pause group-removal UX.                                 |
| `website_recovery_d40_assignment_end_effective_total`       |                                                                             Any | Security              | P0 deny/session fence and inspect offboarding.                                                 |
| `website_recovery_d40_expired_direct_effective_total`       |                                                                             Any | Security + IAM        | P0 invalidate cache/token, repair expiry/current-time predicate.                               |
| `website_recovery_d40_epoch_not_advanced_total`             |                                                         Any successful creation | IAM Platform          | Disable writer/cache, repair atomic command and projections.                                   |
| `website_recovery_d40_partial_commit_total`                 |                                                                             Any | Database + IAM        | Stop writer, reconcile transaction evidence, roll forward atomically.                          |
| `website_recovery_d40_idempotency_mismatch_total`           |                                            Any changed semantic intent accepted | IAM Platform          | Make later effect inert, repair business identity/receipt.                                     |
| `website_recovery_d40_d37_wrong_fence_total`                |                                                 Any fence while direct survives | Website + IAM         | Repair final-path check and recover from D37 receipts.                                         |
| `website_recovery_d40_d37_post_final_loss_commit_total`     |                                                                             Any | Security + Website    | P0 contain D37, inspect source effects/epoch predicate.                                        |
| `website_recovery_d40_cross_tenant_basis_total`             |                                                                             Any | Security + Database   | P0 Tenant-isolation response, repair constraints/RLS, inspect exposure.                        |
| `website_recovery_d40_rls_contract_drift_total`             |                 Any required relation missing ENABLE/FORCE/correct policy/grant | Database Security     | Block deploy and restore policy/grant baseline.                                                |
| `website_recovery_d40_privileged_parity_failure_total`      |                                                                             Any | Security              | Disable failing RPC/worker/service path until parity passes.                                   |
| `website_recovery_d40_hard_deleted_basis_history_total`     |                                                                             Any | Compliance + Database | Stop deletion, recover evidence, repair restrictive FKs/retention.                             |
| `website_recovery_d40_reason_basis_unauthorized_read_total` |                                                                             Any | Privacy + Security    | Contain disclosure, inspect read audit, repair projection.                                     |
| `website_recovery_d40_notification_task_noise_total`        |                                                                             Any | Product               | Remove effect and repair no-noise/no-task boundary.                                            |
| `website_recovery_d40_accessibility_blocker_total`          |                                                        Any critical flow defect | Product Design        | Block release until complete manual/automated proof passes.                                    |
| `website_recovery_d40_exception_share`                      | Greater than 20% of D38 direct creations over 30 days and at least 50 creations | IAM Product           | Research misuse/comprehension; never auto-revoke/convert.                                      |
| `website_recovery_d40_until_removed_share`                  |                     Greater than 50% over 30 days and at least 50 D40 creations | Security Governance   | Review reasons/workflows and Phase 12 classification; never alter active grants automatically. |
| `website_recovery_d40_reversal_24h_rate`                    |                         Greater than 10% over 30 days and at least 20 creations | Product Design        | Run usability research and revise source/warning copy.                                         |
| `website_recovery_d40_stale_review_conflict_rate`           |                  Greater than 5% over 15 minutes and at least 100 confirmations | IAM Platform          | Inspect head granularity/lock contention; never weaken reproof.                                |

### Monitor-only hypotheses

No correctness, authorization, privacy, integrity, recertification, or recovery
requirement is deferred to monitoring. Only exception frequency,
Until-removed share, rapid reversal/comprehension, and source-head contention
are product hypotheses. Every signal above has a threshold, owner, and
response; none triggers an automatic grant mutation.

## Ruthless synthesis

### Must be resolved before this answer is recorded

1. Treat D40 as deliberate creation of an ordinary independent direct source,
   not a permanent exception source type.
2. Require a current complete group path and absence of a current direct path.
3. Bind the complete current group-source set to review/commit.
4. Store immutable typed overlap creation basis and warning contract version.
5. Require fresh reason and explicit unpreselected independent duration.
6. Apply `manage_grants`, assignable ceiling, same-Party self/SoD/quorum, and
   Tenant/assignment proof.
7. Advance one Tenant epoch despite unchanged present capability set.
8. Make group/direct removal copy source-aware and final-path correct.
9. Inherit Phase 12 risk-based recertification; add no D40 timer/campaign.
10. Apply D41's plain current-direct/expanded historical-origin presentation
    without changing authority; leave historical-detail visibility to D42.

### Must be captured in specification and design

1. Basis canonicalization, stable source IDs/heads/hash, warning version, and
   non-authoritative semantics.
2. Direct source independent reason/duration/delegation/terminal lifecycle.
3. No-current-group, existing-direct, self-grant, stale-head, and concurrency
   conflict outcomes.
4. People & access entry, review, success, group-removal, direct-removal, stale,
   expiry, and lost-response copy.
5. Assignment end/freeze/floor/delegation and D37 final-path interaction.
6. Schema/RLS/privileged/retention/index/canonical-hash behavior.
7. Reason/basis privacy, historical rendering, localization, accessibility,
   mobile, and low-bandwidth behavior.
8. D41 current-source/historical-origin presentation and D42 viewer/purpose
   disclosure after group paths end.

### Required implementation safeguards and order

1. Reconcile D40 with D38/D39, ADR-0184, Phase 12, glossary, and OpenSpec.
2. Add typed overlap-basis/audit contract and versioned canonical source-set
   encoder to Phase 12.
3. Extend the existing direct-grant command; add no second writer/resolver.
4. Add current source-set projection, CAS, self/SoD/quorum, epoch, and reference
   model.
5. Add source-aware group/direct removal and D37 final-path proof.
6. Add forced RLS/privileged-path/retention/index/canonicalization tests.
7. Add accessible source-first review and durable receipt UX.
8. Backfill/infer nothing; release read-only explanation before writer.
9. Canary with synthetic non-production Tenants and every worker disabled for
   expiry tests.
10. Expand only with clean safety, provenance, exception-share, reversal,
    conflict, query-budget, privacy, and accessibility evidence.

### Risks that may be monitored

Only the named product hypotheses may remain monitor items. D40 correctness
does not depend on adoption volume, a worker, reminder, manual cleanup, or
future research.

## Migration, rollout, upgrade, and rollback

1. Land additive basis/audit schema and deny-unknown readers before writers.
2. Version and build-test canonical source-set encoding and warning contracts.
3. Add read-only direct/group provenance and historical-basis rendering.
4. Add locked command/receipt/epoch with D40 disabled.
5. Prove RLS, privileged parity, current-time expiry, self/SoD/quorum, and
   no-fallback conflict.
6. Prove every group/direct removal surface before enabling creation.
7. Produce per-Tenant evidence showing zero inferred D40 bases/grants.
8. Canary D40 with synthetic data and complete concurrency/response-loss/D37
   tests.
9. Keep a kill switch for new D40 writes, not current direct authority or
   history.
10. Mixed-version writers lacking D40 proof reject overlap creation.
11. Rollback preserves direct sources, basis, audit, receipt, epoch, Phase 12
    recertification state, and committed D37 history.

## Traceability

| Artifact                            | Required D40 trace                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Grill decision log                  | Founder Option 1, corrected ordinary-source/basis decision, D41 presentation, D42 disclosure dependency |
| Root glossary                       | Separate direct grant, overlap creation basis, current source path                                      |
| ADR-0184 or successor ADR amendment | D39 source independence and D40 creation semantics                                                      |
| Phase 12                            | `assignment_capability_grants`, basis/audit, current grant authority, epoch, recertification, RLS       |
| D37–D39                             | final-path fence, D38 reason/duration, direct/group provenance                                          |
| Identity/access OpenSpec            | preconditions, basis, commands, conflicts, lifecycle, explanation                                       |
| Website recovery OpenSpec           | D37 no-start/no-resume and final-path behavior                                                          |
| Design/tasks/tickets                | Every D40-R/AC/monitor mapped with no second engine                                                     |
| Implementation/tests                | Public-seam present/future EffectiveAccess and UX proof                                                 |
| Release evidence                    | Positive/negative/poison/concurrency/temporal/migration/a11y/scale/monitor results                      |

## Decision to record

> **D40 — Deliberate continuity direct grant.** When an exact active same-
> Tenant staff Active Tenant Assignment already receives D38 through one or
> more current protected Access groups and has no current direct source, a
> current `permissions.manage_grants` actor within live assignable ceiling may
> deliberately choose **Add a separate direct grant**.
>
> Core first shows every current group source and states that the direct source
> survives group removal while assignment suspension/end still wins. One fresh
> concise reason and one explicit unpreselected independent duration are
> required. Same-Party self/SoD/quorum rules apply.
>
> Confirmation re-proves the complete canonical group-source set and heads. A
> changed/disappeared source or newly existing direct source conflicts and
> never falls through to ordinary creation. The resulting grant is one ordinary
> typed `assignment_capability_grants` edge with independent lifecycle.
>
> Phase 12 stores immutable typed overlap creation basis—source identities,
> heads/hash, and warning version—as audit provenance only. It stores no ongoing
> exception/redundancy Boolean and adds no second resolver/engine.
>
> Direct edge, basis, audit, receipt, and exactly one Tenant epoch commit
> atomically. Later group removal reports the surviving direct source; direct
> removal reports any surviving group source; final-path loss alone fences
> later D37 effects. D40 creates no D37 operation, task, notification,
> scheduler, local review campaign, or Inngest authority. Phase 12 risk-based
> recertification remains authoritative.

## D41 resolved — current direct source with expanded historical provenance

### Why this decision mattered

Jordan receives D38 through Website Operations and receives a D40 separate
direct grant for continuing responsibility. Later Jordan leaves Website
Operations. The direct grant is now the only current source.

Authorization is already settled: the direct grant remains ordinary,
independent, and current until its own end condition. D41 governs only the
ongoing presentation. The UI must preserve creation provenance without making
Jordan look permanently exceptional or rewriting history.

### Option 1 — plain current source with expanded continuity provenance — recommended

The ordinary person/My Access summary becomes:

```text
Granted directly · Ends 15 October 2026
```

Expanded **Why this person has access** / **Why you have access** or History
shows:

```text
Added for continuity while access also came through Website Operations.
Website Operations access ended 1 September 2026.
```

**User/Tenant UX:** current access is immediately understandable; historical
intent remains available to authorized viewers without a permanent warning
badge.

**Impact:** no state conversion, authority change, new timer, or audit rewrite.

### Option 2 — keep a prominent continuity badge on the current source

The current summary continues to show **Continuity exception** or similar even
after no group path remains.

**User/Tenant UX:** the unusual origin is always visible.

**Tradeoff:** historical creation context becomes a permanent current-status
label, can stigmatize the holder, and may imply the grant is less
authoritative or governed differently when it is not.

### Option 3 — automatically convert the source and discard overlap provenance

When the final group path ends, Core rewrites the source as an ordinary direct
grant and removes or suppresses its continuity origin.

**User/Tenant UX:** clean current display.

**Tradeoff:** silently rewrites administrator intent/audit provenance, creates
a new state transition and worker/race problem, and offers no benefit because
the source is already an ordinary direct grant. Reject.

### Recorded resolution and D42 boundary

The founder selected Option 1. After adversarial review, current presentation
MUST derive **Granted directly** from the current Phase 12 direct source and
EffectiveAccess, while **Added for continuity** remains authorized expanded
provenance/history derived from immutable D40 evidence. Last-group loss creates
no direct-grant mutation, conversion, badge, task, notification, or new epoch
mechanism; the source mutation's existing epoch drives the next derived view.
History failure cannot block or misstate canonical current access, and a later
group return simply restores both current source lines.

D42 now resolves that boundary: the exact subject receives only the safe
origin/date explanation; membership review receives survivor/end only; grant
governance receives floor-minimized evidence; and full typed evidence requires
the separate audit projection. See the [D42 adversarial review](./phase-24-d42-purpose-tiered-continuity-provenance-adversarial-review.md).
