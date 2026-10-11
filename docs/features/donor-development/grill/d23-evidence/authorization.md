# D23 — Request-review authority and disclosure

Research-only review of the founder's selected A: built-in organization-required review where needed, with ordinary authorized requests proceeding without additional review by default. **Recommend Accept A with the bounded safeguards below.** This does not select universal dual control, a general approval designer, new role grants or financial authority. Grades describe plausible implementation failures, not deployed vulnerability findings.

## Evidence and current limits

Reviewed repository HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`. No live database, grants, credentials, production traffic or reviewer population was inspected. A bounded source search found contribution correction review, not a qualified P27 request-review service.

- [Q23:33–75](../phase27-q23-request-review-policy.md:33) defines optional organizational review, exact proposed terms/action, truthful recording of past events, and no implied downstream authority. It was posed before the founder's subsequent A answer, now recorded there. [Ratified D22:22–63](../phase27-d22-adversarial-review.md:22) distinguishes responsibility, request/response/fulfillment and current field/purpose access.
- [P12:1464–1470](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1464), [1552–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [1644](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1644) and [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) govern resolved capabilities, current exact context, self/chain identity, scoped grants and all-path enforcement. These are accepted intent, not proof every adjacent implementation meets it.
- **Current finance-specific implementation:** [approval-policy:81–99,106–158](../../../../../packages/api/src/admin/contribution-operations/approval-policy.ts:81) derives correction review and uses `contributions.approve_corrections`; its self-check compares profile IDs only when its separation mode applies. [Unit source:73–110](../../../../../tests/unit/packages/api/admin/contribution-approval-policy.test.ts:73) tests separate-review and capability-qualified self-review modes. Neither supplies D23's policy or permission mapping.
- [Correction decision:193–223](../../../../../packages/api/src/admin/contribution-operations/correction-requests.ts:193) performs a Tenant/ID/pending compare-and-set. [315–350](../../../../../packages/api/src/admin/contribution-operations/correction-requests.ts:315) handles terminal same-outcome replay before the function's later policy/decider assertion; outer authorization is not disproved by that observation. [444–450](../../../../../packages/api/src/admin/contribution-operations/correction-requests.ts:444) deliberately drops a stale stored revision for that financial flow. Copying these details would not prove D23 replay authorization or exact reviewed terms.
- [Notification discovery:218–253](../../../../../packages/api/src/admin/contribution-operations/approval-notifications.ts:218) queries admin/super-admin profiles; [481–486](../../../../../packages/api/src/admin/contribution-operations/approval-notifications.ts:481) copies the correction reason to a queue-only task. [The migration:23–74](../../../../../supabase/migrations/20260611120000_contribution_correction_requests.sql:23) stores financial payloads, mutable decision columns, nullable profile references and raw-table revocations. It is not a P27 schema, routing contract or immutable-history proof.
- [ADR0183:24–36,57–69,87–119](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24) owns exact source work, safe projections, current recipients, source-controlled completion and handoff. [DON-15:1689–1707](../../../../prds/workflow-studio/07-core-workflow-catalog.md:1689) consumes exact proposal approval but remains disabled; native review gains no Studio dependency.

## A23-01 — Preparing, owning, reviewing and configuring are different authority

**Critical; plausible.** “Owner,” “prepared by,” assigned reviewer and administrator are product relationships, not interchangeable authorization. An otherwise authorized preparer could select themself, another Tenant's reviewer or a leader who lacks clearance.

**Clause:** “Resolve the current P12 action capability, exact source scope and field/purpose authority independently for preparation, submission, review decision, reviewer/responsibility change, organization policy or request-specific review-choice changes, and prospective use. Derive actor/context at the server; preserve actual preparer and decision actor separately from current responsibility. Reviewer selection or ownership never grants read, decide, configure or presentation authority.”

Do not prescribe capability names or a new role hierarchy before the owner-qualified mapping exists. Policy administration is neither implied by request editing nor required for ordinary review. A trusted service context carries its own bounded authority and actual initiating provenance; it cannot invent a human reviewer or approve by timeout.

**Acceptance:** read-only, prepare-only, review-only and policy-admin-only actors; foreign reviewer; owner reassignment; old owner versus actual preparer; role label without effective grant; another Active Tenant Assignment of the same user. All unqualified actions fail without partial writes or new access.

## A23-02 — Small-team flexibility must respect actual separation requirements

**High; plausible.** Importing finance's default separation mode would add universal dual control; importing its profile-only comparison could let one person satisfy a governing two-person rule through multiple hats. Replacing the owner must not erase who prepared or submitted the reviewed terms.

**Clause:** “D23 does not itself require a distinct second person. A single actor may decide only where the qualified review policy and current authority permit it and no governing separation rule forbids it. Where self/chain exclusion applies, evaluate the P12 stable person/Party identity and retained relevant authorship, not merely the current owner, profile label or chosen assignment. Missing identity evidence cannot prove independence.”

“Small organization” is not a silent bypass of a financial, restricted-data or access-governance requirement. A required review with no eligible reviewer remains visibly unresolved to an authorized recovery actor. The permitted recovery is eligible reassignment or an explicit policy/request-choice change by an independently authorized actor where allowed. It does not become Approved, automatically select an admin, or silently weaken policy. D23 adds no degraded two-person mode, external-reviewer fallback or global exception authority. A permitted self-review remains a deliberate recorded decision, never automatic approval.

**Acceptance:** allowed single-actor policy; independently required review; one human/two assignments; preparer replaced before decision; deleted profile; no reviewer versus failed eligibility lookup. Policy changes require their own authority and truthful history.

## A23-03 — A reviewer must be authorized for the exact meaningful terms

**Critical disclosure / High decision integrity; plausible.** Showing protected proposal terms to every assigned reviewer is a leak; approving an unseen funding amount, location or condition is not a meaningful review. Copying a full proposal into a task, email or audit snapshot creates an uncontrolled second reader.

**Clause:** “Bind review to the exact request, prospective action and material terms/version under the governing policy. Supply the minimum sufficient decision projection through current source authorization, including permitted relevant attachments and conditions. A reviewer need not receive unrelated private history, but cannot approve material terms the authorized projection cannot meaningfully establish. Assignment does not widen that projection; route or repair authority through existing mechanisms instead.”

Record immutable decision identity, actor, time, scoped target/version and applicable policy evidence, with qualified source references. Reconstructing lawful reviewed terms must not require permanent plaintext copies in general audit. Current access and retention still govern retained source evidence, decision reasons, diffs and results. An inaccessible term is not absent, zero, approved or irrelevant.

**Acceptance:** reviewer can see request but not material monetary term; protected missionary itinerary in attachment; confidential internal preparation note unnecessary to decision; redaction after accepted review; unauthorized request history. Permit sufficient scoped review without granting the whole dossier; withhold an action that cannot be meaningfully authorized.

## A23-04 — Ordinary edits cannot erase an explicit review requirement

**High; likely with generic form defaults or replacement writes.** Clearing an amount, changing a type, losing a policy lookup or dropping hidden fields can otherwise make a required review appear unnecessary.

**Clause:** “Use the finite organization default of not required or required, and the separately authorized request-specific choice of inherit, require or not required. Resolve the applicable choice from its authoritative current source; an ordinary request editor cannot overwrite it. Default changes preserve explicit request-specific choices. Confirmed not-required is distinct from missing, contradictory, stale or failed policy evidence. Unknown amount, changed purpose/type, omitted protected input or retired classification cannot clear the choice or become an exemption.”

This is the root/owner's proposed bounded implementation judgment, not a previously implemented registry. No amount detector, condition builder, custom-field rule scripting or classification-driven permission grant is needed. Material edits still re-evaluate approval coverage, not silently mutate the requirement. [P11:12](../../../../prds/sitestacker-parity/phase-11-custom-fields-custom-collections.md:12) separates stable meaning from labels. Expose only an independently authorized minimum requirement/status; policy editor impact counts and filters obey P12 floors. An authorized prospective not-required choice may remove this D23 gate, but cannot make stale approval current, retroactively approve a past action, or waive independent binding restrictions.

**Acceptance:** ordinary editor tampers with choice; default changes with inherit/require/not-required requests; renamed or retired type; amount unknown; failed policy read versus confirmed routine path; unauthorized requirement metadata; stale draft after policy change; authorized exemption with an independently required financial review. Historical fact entry remains available under its own authority and records compliance honestly, as Q23 requires; it cannot mint retrospective approval or unlock new outward action.

## A23-05 — Decision authority at acceptance differs from authority to use it later

**Critical authority / High stale-state integrity; plausible.** A valid decision can be attached to changed terms, or a stale reviewer can decide after revocation. Conversely, continuously requiring an old reviewer to remain employed would erase the practical value of lawful historical decisions.

**Clause:** “At decision acceptance, atomically validate current decision authority, exact pending review identity, material terms, applicable policy and relevant source/authorization heads. Competing edits, decisions, replacement or revocation have one ordered outcome. Later loss of reviewer authority does not falsify a decision validly accepted earlier. Before prospective use, independently validate the current acting principal, source action, terms and required review coverage under the applicable current policy, plus all financial and communication gates.”

Material changes cannot reuse stale approval; rejected, withdrawn, superseded or otherwise unusable decisions remain historical facts. Corrections append an authorized disposition instead of forging the original reviewer/time. Do not require re-review for an unrelated edit or reviewer departure unless the qualified policy actually requires it. If a currently authorized change makes this review unnecessary, evaluate the prospective action on that truthful basis instead of pretending an obsolete approval covers it. Review approval alone never sends, grants, commits money, resumes cultivation or records donor acceptance.

**Acceptance:** both orders of edit/approve, revoke/approve, reviewer-replacement/approve and policy-change/use; same terms revisited after an intervening change; historical approval after reviewer departure; a different currently authorized presenter; no contact consent despite approved terms. A timestamp or pending-status check alone does not prove these boundaries.

## A23-06 — Tasks and messages project current source work safely

**Critical; plausible.** Admin broadcast, permanent previews or a generic Complete button can expose the proposal or falsely approve it.

**Clause:** “Review work projects through ADR0183's exact source occurrence and current eligible responsibility. Use safe source-owned list facts and protected detail loading. Search, comments, notifications, exports and caches gain no protected bodies by assignment. A task action is the qualified source decision, never generic completion; access loss removes presentation without fabricating completion. No eligible recipient and indeterminate routing remain distinct, actionable source states without guessed fallback.”

Use one eligible internal reviewer with explicit source-owned reassignment in this bounded proposal. Replacement re-proves the new recipient and ends the old applicability; decision, withdrawal or supersession ends the corresponding work. Notification preferences only narrow delivery. P6/P17 govern any email and its current recipient/purpose/consent checks; no parallel sender, full-proposal attachment default, default-admin broadcast or mandatory reminder engine follows from D23.

**Acceptance:** reassigned reviewer with no detail clearance; removed recipient before delivery; stale notification deep link; decision while task creation retries; zero/indeterminate eligible reviewers; private prayer/location in title or reason. Already released external content cannot be recalled by later revocation; no unreleased new disclosure should follow it.

## A23-07 — Database, replay and restore cannot provide alternate approval paths

**Critical; plausible.** A secure page is insufficient if direct writes change decision actors, source keys, status or approval coverage, or a retry returns protected historical content before current authorization.

**Clause:** “Use complete Tenant/source/review references and server-owned actor/decision provenance. Enforce permitted old and resulting states across commands, grants, RLS, views, functions and service/import/repair paths. Raw status/actor edits cannot manufacture a review decision. Commit the accepted decision and its required local evidence/work disposition coherently, with scoped same-intent idempotency; replays reauthorize their permitted result and never reapply decisions or overwrite newer truth.”

Fresh primary checks: [PG17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html) and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). UPDATE/ALL omitted `WITH CHECK` inherits `USING`; omission is not inherently unsafe. Effective grants, policy composition and actual function/view execution privileges matter. Allowed-row selection is distinct from resulting-row validity, field authority and transactional cross-row policy fencing. A zero-row denied UPDATE is not a successful decision; FK/uniqueness errors must not reveal hidden reviews or parties.

Retain lawful structural decision evidence under [D22's privacy boundary](../d22-evidence/authorization.md:75), not permanent sensitive snapshots. Restore must reconcile current decision/terms/policy, revocation, consumed effects and disposal fences before affected readers/workers activate; unrecoverable fences hold those paths. Old backups, receipt retries or stale callbacks cannot revive approved status, recipients or erased bodies.

**Acceptance:** wrong Tenant/source/resulting reviewer; forged decided-by/time/status; exact versus changed-intent retry; unauthorized terminal replay; duplicate decisions; source/evidence failure; raw browser/privileged writer parity; restored pending review after later decision or revocation. Actual nonowner-role tests and source command races are required before implementation qualification.

## Disposition and proof limits

The smallest sufficient design is a bounded source-owned review with explicit applicable terms, qualified responsibility, current permissions and truthful decisions. No broader workflow or grant is justified. Current unit tests were inspected as adjacent evidence, not run or claimed as D23 verification. This appendix runs no SQL/API/browser test and establishes no live policy state. The clauses and acceptance cases are implementation/release gates; ordinary policy/routing UX remains delegated under Q23, while a genuine incompatible owner authority would require a concrete reconciliation.
