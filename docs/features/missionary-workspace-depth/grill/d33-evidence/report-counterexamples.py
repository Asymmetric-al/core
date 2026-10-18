#!/usr/bin/env python3
"""Finite D33 semantic examples. No database, producer or actual concurrency proof."""

from copy import deepcopy
from dataclasses import asdict, dataclass, field, replace
from hashlib import sha256
import json
from pathlib import Path


@dataclass(frozen=True)
class Authority:
    tenant: str = "tenant-a"
    actor: str = "missionary-maya"
    ministry_scope: str = "ministry:alpha"
    report: bool = True
    read: bool = True
    correct: bool = False
    route: bool = False
    finance: bool = False


@dataclass(frozen=True)
class Form:
    ministry_context: str = "ministry:alpha"
    assertion: str = "actual_receipt"
    occurred_at: int = 1
    occurrence_precision: str = "day"
    reported_holder: str | None = "Maya"
    donor: str | None = "Grace"
    amount: int | None = 10000
    currency: str | None = "USD"
    intended_entity: str | None = "entity-a"
    wrong_payee: bool = False


@dataclass(frozen=True)
class Intake:
    identity: str
    tenant: str
    recorder: str
    form: Form
    accepted_at: int
    ministry_scope: str = "ministry:alpha"
    revision: int = 1
    evidence_history: tuple = ()
    next_work: str = "qualified-finance-handler"
    handling_needed: bool = True
    reported_transfer: str | None = None
    recording: str | None = None
    current_financial: str = "not_recorded"
    reconcile: bool = False


@dataclass(frozen=True)
class FinancialProof:
    contribution: str
    intake: str
    tenant: str = "tenant-a"
    entity: str = "entity-a"
    currency: str = "USD"
    complete: bool = True
    owner_qualified: bool = True


def fingerprint(command, form, intake=None):
    return sha256(json.dumps([command, intake, asdict(form)], sort_keys=True).encode()).hexdigest()


@dataclass
class World:
    on: bool = False
    policy_revision: int = 0
    context_tenant: str = "tenant-a"
    context_ministry: str = "ministry:alpha"
    authority: Authority = field(default_factory=Authority)
    source_available: bool = True
    recovery_owner: str | None = "qualified-intake-recovery"
    now: int = 10
    reports: dict = field(default_factory=dict)
    # Values contain payload digests and minimal immutable results, not old bodies.
    receipts: dict = field(default_factory=dict)
    audit: list = field(default_factory=list)
    intents: set = field(default_factory=set)
    duplicate_origins: dict = field(default_factory=dict)
    # Independently committed financial facts are fixture inputs, never posted here.
    posted: dict = field(default_factory=dict)

    def key(self, request):
        return self.authority.tenant, self.authority.actor, self.authority.ministry_scope, request

    def current(self):
        return (self.context_tenant == self.authority.tenant
                and self.context_ministry == self.authority.ministry_scope)

    def can_read(self, intake=None):
        return (self.current() and self.authority.read
                and (intake is None or (self.reports[intake].tenant == self.authority.tenant
                                      and self.reports[intake].ministry_scope == self.authority.ministry_scope)))

    def recover(self, key, digest):
        if not self.can_read():
            return {"status": "unavailable"}
        original_digest, result = self.receipts[key]
        return result if digest == original_digest else {"status": "payload_conflict"}

    def set_policy(self, on):
        # Policy authority is an already-qualified fixture event, not an actor grant.
        if on and (not self.source_available or not self.recovery_owner):
            return "unavailable"
        if self.on != on:
            self.on = on
            self.policy_revision += 1
        return "configured"

    def report(self, request, form=Form(), fail_before_commit=False, *, expected_policy_revision):
        key, digest = self.key(request), fingerprint("report", form)
        if not self.current() or form.ministry_context != self.authority.ministry_scope:
            return {"status": "unavailable"}
        if key in self.receipts:
            return self.recover(key, digest)
        if not self.authority.report or not self.source_available:
            return {"status": "unavailable"}
        if not self.on:
            result = {"status": "rejected_reporting_off"}
            # This is terminal no-effect, never an automatic submission queue.
            self.receipts[key] = digest, result
            self.audit.append(("report_rejected_off", key))
            return result
        if expected_policy_revision != self.policy_revision:
            result = {"status": "rejected_stale_policy_review"}
            self.receipts[key] = digest, result
            self.audit.append(("report_rejected_stale_policy_review", key))
            return result
        if form.assertion != "actual_receipt" or not self.recovery_owner:
            return {"status": "unqualified"}
        unknown = any(value is None for value in (form.reported_holder, form.donor, form.amount,
                                                  form.currency, form.intended_entity))
        identity = "intake-" + str(len(self.reports) + 1)
        item = Intake(identity, self.authority.tenant, self.authority.actor, form, self.now,
                      ministry_scope=self.authority.ministry_scope,
                      evidence_history=(form,),
                      next_work=self.recovery_owner if unknown or form.wrong_payee else "qualified-finance-handler")
        result = {"status": "accepted", "intake": identity}
        if fail_before_commit:
            return {"status": "unavailable"}
        # An assumed atomic local acceptance point, not a real transaction test.
        self.reports[identity] = item
        self.audit.append(("report_accepted", identity, self.authority.actor))
        self.intents.add(("intake_work", identity))
        self.receipts[key] = digest, result
        return result

    def correct(self, request, intake, form, expected_revision, fail_before_commit=False):
        key, digest = self.key(request), fingerprint("correct", form, intake)
        if form.ministry_context != self.authority.ministry_scope:
            return {"status": "unavailable"}
        if key in self.receipts:
            return self.recover(key, digest)
        if not self.can_read(intake) or not self.authority.correct:
            return {"status": "unavailable"}
        item = self.reports[intake]
        if item.revision != expected_revision:
            return {"status": "conflict"}
        revised = replace(item, form=form, revision=item.revision + 1,
                          evidence_history=item.evidence_history + (form,), reconcile=item.recording is not None)
        result = {"status": "corrected", "intake": intake, "revision": revised.revision}
        if fail_before_commit:
            return {"status": "unavailable"}
        self.reports[intake] = revised
        self.audit.append(("report_corrected", intake, revised.revision))
        self.intents.add(("reconcile_intake", intake, revised.revision))
        self.receipts[key] = digest, result
        return result

    def view(self, intake):
        if not self.can_read(intake):
            return {"status": "unavailable"}
        item = self.reports[intake]
        return {"status": "permitted_intake", "recording": item.current_financial,
                "recorded_ever": item.recording is not None, "handling_needed": item.handling_needed,
                "next_work": item.next_work, "correspondence_needs_review": item.reconcile}

    def record_transfer_assertion(self, intake):
        if not self.can_read(intake) or not self.authority.route:
            return "unavailable"
        self.reports[intake] = replace(self.reports[intake], reported_transfer="reported_sent")
        return "reported_sent"

    def resolve_handling(self, intake, owner_proves_no_remaining_work):
        if not self.can_read(intake) or not self.authority.route or not owner_proves_no_remaining_work:
            return "unavailable"
        self.reports[intake] = replace(self.reports[intake], handling_needed=False)
        return "handling_resolved"

    def resolve_recording(self, intake, proof, expected_revision):
        if not self.can_read(intake) or not self.authority.finance:
            return "unavailable"
        item = self.reports[intake]
        if (not proof.owner_qualified or proof.tenant != item.tenant or proof.intake != intake
                or not proof.entity or not proof.currency or self.posted.get(proof.contribution) != proof
                or item.form.intended_entity is not None and proof.entity != item.form.intended_entity
                or item.form.currency is not None and proof.currency != item.form.currency):
            return "unqualified"
        if not proof.complete:
            return "incomplete"
        if item.revision != expected_revision:
            self.reports[intake] = replace(item, reconcile=True)
            return "reconciliation_required"
        self.reports[intake] = replace(item, recording=proof.contribution, current_financial="recorded", reconcile=False)
        return "recording_resolved"

    def reconcile_duplicate(self, canonical, other, owner_proves_same_item):
        if (not self.can_read(canonical) or not self.can_read(other) or not self.authority.route
                or not owner_proves_same_item):
            return "unavailable"
        self.duplicate_origins.setdefault(canonical, {canonical}).add(other)
        return "origins_preserved"


ASSERTIONS = 0
CASES = []


def expect(actual, expected):
    global ASSERTIONS
    ASSERTIONS += 1
    if actual != expected:
        raise AssertionError({"actual": actual, "expected": expected})
    return actual


def case(identity, title, unsafe, corrected, schedule=None, control=False):
    item = {"id": identity, "title": title, "kind": "positive_control" if control else "counterexample",
            "unsafe": unsafe, "corrected": corrected}
    if schedule:
        item["schedule"] = schedule
    CASES.append(item)


def submit_fresh(world, request, form=Form(), fail_before_commit=False):
    """Routine fixture call: the test explicitly supplies a fresh policy review."""
    return world.report(request, form, fail_before_commit,
                        expected_policy_revision=world.policy_revision)


def accepted():
    world = World(on=True, policy_revision=1)
    intake = submit_fresh(world, "report-1")["intake"]
    return world, intake


def financial_fixture(world, intake, identity="contribution-1", **changes):
    proof = FinancialProof(identity, intake, **changes)
    world.posted[identity] = proof
    return proof


def run():
    w = World()
    expect(w.on, False)
    expect(submit_fresh(w, "off")["status"], "rejected_reporting_off")
    expect(len(w.reports), 0)
    w.set_policy(True)
    cached_on = w.on
    reviewed_revision = w.policy_revision
    w.set_policy(False)
    expect(cached_on, True)
    expect(w.report("stale-on", expected_policy_revision=reviewed_revision)["status"], "rejected_reporting_off")
    expect(len(w.reports), 0)
    case("B01", "Default Off and current acceptance beat cached On", cached_on,
         {"new_intakes": 0, "result": "rejected_reporting_off"}, ["read On", "Off accepted", "submit"])

    w, intake = accepted()
    original = submit_fresh(w, "report-1")
    accepted_review_revision = w.policy_revision
    w.set_policy(False)
    w.authority = replace(w.authority, report=False)
    expect(w.report("report-1", expected_policy_revision=accepted_review_revision), original)
    expect(len(w.reports), 1)
    case("B02", "Accepted response lost before Off remains recoverable", "Off implies no report",
         original, ["accept report", "lose response", "Off and create grant revoked", "recover under current read"])

    w = World()
    first = submit_fresh(w, "rejected-key")
    w.set_policy(True)
    expect(submit_fresh(w, "rejected-key"), first)
    expect(len(w.reports), 0)
    expect(submit_fresh(w, "rejected-key", replace(Form(), amount=20000))["status"], "payload_conflict")
    new = submit_fresh(w, "deliberately-reviewed-new-key", replace(Form(), occurred_at=1))
    expect(new["status"], "accepted")
    expect(w.reports[new["intake"]].form.occurred_at < w.reports[new["intake"]].accepted_at, True)
    case("B03", "A rejected key never becomes queued work after re-enable", "replay old rejected key when On",
         {"old_key": first, "new_deliberate_key": new["status"], "older_actual_receipt_allowed": True})

    w, intake = accepted()
    proof = financial_fixture(w, intake)
    expect(w.resolve_recording(intake, proof, 1), "unavailable")
    expect(w.correct("edit", intake, replace(Form(), amount=5000), 1)["status"], "unavailable")
    expect(w.record_transfer_assertion(intake), "unavailable")
    expect(w.view(intake)["recording"], "not_recorded")
    case("B04", "Report/read rights do not confer correction, routing or finance", "creator is financial owner",
         {"report_read": "permitted", "correct_route_finance": "unavailable"})

    w = World(on=True, policy_revision=1)
    unknown = Form(reported_holder=None, donor=None, amount=None, currency=None, intended_entity=None, wrong_payee=True)
    intake = submit_fresh(w, "unknown", unknown)["intake"]
    expect(w.reports[intake].form, unknown)
    expect(w.reports[intake].tenant, "tenant-a")
    expect(w.reports[intake].next_work, "qualified-intake-recovery")
    expect(w.posted, {})
    case("B05", "Unknown and wrong-payee reports remain scoped operational facts", {
        "unsafe_defaults": {"donor": "anonymous", "amount": 0, "currency": "USD", "entity": "default"}},
        {"unknowns_preserved": True, "trusted_tenant": "tenant-a", "owned_exception": True, "posted_money": 0})

    w, first = accepted()
    expect(submit_fresh(w, "report-1")["intake"], first)
    w.authority = replace(w.authority, actor="missionary-another")
    second = submit_fresh(w, "independent-report")["intake"]
    expect(first != second, True)
    unsafe_equal_fields = expect(w.reports[first].form == w.reports[second].form, True)
    w.authority = replace(w.authority, route=True)
    expect(w.reconcile_duplicate(first, second, False), "unavailable")
    expect(w.reconcile_duplicate(first, second, True), "origins_preserved")
    expect(w.duplicate_origins[first], {first, second})
    expect(len(w.reports), 2)
    case("B06", "Retry and independent duplicate assertions have different identities", {
        "equal_fields_would_auto_merge": unsafe_equal_fields},
        {"retry_same_intake": True, "independent_origins": 2, "merge_requires_owner_proof": True})

    w, intake = accepted()
    w.authority = replace(w.authority, finance=True, route=True)
    proof = financial_fixture(w, intake)
    expect(w.resolve_recording(intake, proof, 1), "recording_resolved")
    expect(w.view(intake)["handling_needed"], True)
    expect(w.record_transfer_assertion(intake), "reported_sent")
    expect(w.view(intake)["handling_needed"], True)
    expect(w.resolve_handling(intake, True), "handling_resolved")
    w.reports[intake] = replace(w.reports[intake], current_financial="reversed")  # qualified external correction fixture
    expect((w.view(intake)["recorded_ever"], w.view(intake)["handling_needed"]), (True, False))
    case("B07", "Posting, transfer assertion and financial reversal do not imply custody", "single Done/Received flag",
         {"posted_before_handling": True, "sent_still_needs_handling": True,
          "reversed_after_resolution_reopens_possession": False})

    w, intake = accepted()
    w.authority = replace(w.authority, finance=True)
    wrong = financial_fixture(w, "other-intake", identity="wrong")
    foreign = financial_fixture(w, intake, identity="foreign", tenant="tenant-b")
    other_entity = financial_fixture(w, intake, identity="other-entity", entity="entity-b")
    partial = financial_fixture(w, intake, identity="partial", complete=False)
    exact = financial_fixture(w, intake, identity="already-posted")
    expect(w.resolve_recording(intake, wrong, 1), "unqualified")
    expect(w.resolve_recording(intake, foreign, 1), "unqualified")
    expect(w.resolve_recording(intake, other_entity, 1), "unqualified")
    expect(w.resolve_recording(intake, partial, 1), "incomplete")
    posted_before = deepcopy(w.posted)
    expect(w.resolve_recording(intake, exact, 1), "recording_resolved")
    expect(w.resolve_recording(intake, exact, 1), "recording_resolved")
    expect(w.posted, posted_before)
    case("B08", "Exact existing recording lineage resolves intake without reposting", "post again to repair missing status",
         {"wrong_lineage": "unqualified", "partial": "incomplete", "new_postings": 0})

    results = {}
    for correction_first in (True, False):
        w, intake = accepted()
        w.authority = replace(w.authority, finance=True, correct=True)
        proof = financial_fixture(w, intake)
        if correction_first:
            w.correct("material", intake, replace(Form(), amount=9000), 1)
            results["correction_first"] = expect(w.resolve_recording(intake, proof, 1), "reconciliation_required")
            expect(w.reports[intake].recording, None)
        else:
            w.resolve_recording(intake, proof, 1)
            w.correct("material", intake, replace(Form(), amount=9000), 1)
            expect(w.reports[intake].recording, proof.contribution)
            results["resolution_first"] = expect(w.reports[intake].reconcile, True)
        expect(w.posted[proof.contribution], proof)
    case("B09", "Correction and exact resolution preserve independent posted history", "last writer overwrites lineage",
         results, ["material correction then stale resolution", "exact resolution then material correction"])

    w = World(on=True, policy_revision=1)
    expect(submit_fresh(w, "attempt", fail_before_commit=True)["status"], "unavailable")
    expect((len(w.reports), len(w.audit), len(w.receipts), len(w.intents)), (0, 0, 0, 0))
    intake = submit_fresh(w, "attempt")["intake"]
    expect((len(w.reports), len(w.audit), len(w.receipts), len(w.intents)), (1, 1, 1, 1))
    w.authority = replace(w.authority, correct=True)
    before = deepcopy((w.reports, w.audit, w.receipts, w.intents))
    expect(w.correct("edit", intake, replace(Form(), amount=9000), 1, fail_before_commit=True)["status"], "unavailable")
    expect((w.reports, w.audit, w.receipts, w.intents), before)
    case("B10", "Local acceptance includes evidence, audit, receipt and required intent", "save source then fail before intent",
         {"rejected_partial_effects": 0, "successful_report_effect_components": 4,
          "correction_partial_effects": 0})

    w, intake = accepted()
    w.authority = replace(w.authority, correct=True)
    w.correct("correction", intake, replace(Form(), donor="corrected reported identity"), 1)
    recovered = submit_fresh(w, "report-1")
    expect(set(recovered), {"status", "intake"})
    expect(len(w.reports[intake].evidence_history), 2)
    w.context_tenant = "tenant-b"
    expect(submit_fresh(w, "report-1")["status"], "unavailable")
    expect(w.view(intake)["status"], "unavailable")
    w.context_tenant = "tenant-a"
    w.authority = replace(w.authority, read=False)
    expect(submit_fresh(w, "report-1")["status"], "unavailable")
    case("B11", "Recovery neither resurrects old PII nor crosses current context", asdict(Form()),
         {"minimal_receipt_fields": sorted(recovered), "context_switch": "unavailable", "read_revoked": "unavailable"})

    w = World(recovery_owner=None)
    expect(w.set_policy(True), "unavailable")
    expect(w.on, False)
    w = World(source_available=False)
    expect(w.set_policy(True), "unavailable")
    expect(submit_fresh(w, "outage")["status"], "unavailable")
    expect(len(w.reports), 0)
    case("B12", "Missing source or recovery ownership has no local fallback", "create local gift and broadcast to finance",
         {"activation": "unavailable", "local_reports": 0})

    w = World(on=True, policy_revision=1)
    expect(submit_fresh(w, "promise", replace(Form(), assertion="promised_check"))["status"], "unqualified")
    expect(len(w.reports), 0)
    case("B13", "A promise with a received-date field is not actual receipt", Form().occurred_at is not None,
         {"promise_report": "unqualified", "intake_count": 0})

    cycle_world = World()
    cycle_world.set_policy(True)
    stale_review = cycle_world.policy_revision
    cached_on = cycle_world.on
    cycle_world.set_policy(False)
    cycle_world.set_policy(True)
    boolean_only = expect(cached_on == cycle_world.on, True)
    stale_result = cycle_world.report("old-on-form", expected_policy_revision=stale_review)
    expect(stale_result["status"], "rejected_stale_policy_review")
    expect((len(cycle_world.reports), len(cycle_world.intents)), (0, 0))
    expect(submit_fresh(cycle_world, "old-on-form"), stale_result)
    case("B14", "On again does not make an old policy review current", {
        "boolean_only_check_passes": boolean_only, "reviewed_revision": stale_review},
        {"current_revision": cycle_world.policy_revision, "outcome": stale_result,
         "new_intakes": 0, "old_key_replayed_after_fresh_review": stale_result},
        ["review On revision1", "Off revision2", "On revision3", "submit stale revision1"])

    w, intake = accepted()
    old_context_key = w.key("report-1")
    w.context_ministry = "ministry:beta"
    w.authority = replace(w.authority, ministry_scope="ministry:beta")
    expect(w.key("report-1") != old_context_key, True)
    expect(submit_fresh(w, "report-1")["status"], "unavailable")
    expect(w.view(intake)["status"], "unavailable")
    expect(len(w.reports), 1)
    case("B15", "The same actor and tenant do not make another ministry context equivalent", {
        "tenant_actor_only_key_collides": old_context_key[:2] == w.key("report-1")[:2]},
        {"ministry_scoped_keys_differ": True, "old_context_form_replay": "unavailable",
         "old_context_read": "unavailable", "new_intakes": 0})

    w, intake = accepted()
    financial_before = deepcopy(w.posted)
    expect(w.view(intake)["recording"], "not_recorded")
    expect(w.posted, financial_before)
    case("C01", "An ordinary report creates one operational intake and work intent", None,
         {"reports": expect(len(w.reports), 1), "work_intents": expect(len(w.intents), 1), "financial_records": 0}, control=True)

    w, intake = accepted()
    w.set_policy(False)
    w.authority = Authority(actor="finance-staff", report=False, correct=True, route=True, finance=True)
    expect(w.correct("staff-correct", intake, replace(Form(), amount=9500), 1)["status"], "corrected")
    proof = financial_fixture(w, intake)
    expect(w.resolve_recording(intake, proof, 2), "recording_resolved")
    expect(w.view(intake)["recording"], "recorded")
    case("C02", "Independently authorized continuation survives Off and reporter departure", None,
         {"staff_correction": "corrected", "finance_continuation": "recorded", "same_intake": intake}, control=True)

    w, intake = accepted()
    w.authority = replace(w.authority, route=True, finance=True)
    expect(w.resolve_handling(intake, True), "handling_resolved")
    expect(w.view(intake)["recording"], "not_recorded")
    proof = financial_fixture(w, intake)
    expect(w.resolve_recording(intake, proof, 1), "recording_resolved")
    expect(w.view(intake)["handling_needed"], False)
    case("C03", "Handling first leaves recording work independent", None,
         {"handling_resolved_before_posting": True, "recording_resolved_later": True}, control=True)

    w, intake = accepted()
    original = submit_fresh(w, "report-1")
    expect(submit_fresh(w, "report-1"), original)
    expect(submit_fresh(w, "report-1", replace(Form(), amount=20000))["status"], "payload_conflict")
    w.authority = replace(w.authority, actor="missionary-another")
    distinct = submit_fresh(w, "same-check-details-new-actual-item")["intake"]
    expect(distinct != intake, True)
    expect(len(w.reports), 2)
    case("C04", "An exact transport retry deduplicates while a distinct report remains distinct", None,
         {"same_intent": "original_receipt", "changed_payload": "payload_conflict", "independent_report_count": 2}, control=True)

    fresh_revision = cycle_world.policy_revision
    cycle_world.set_policy(True)
    expect(cycle_world.policy_revision, fresh_revision)
    fresh = cycle_world.report("fresh-reviewed-new-intent", expected_policy_revision=fresh_revision)
    expect(fresh["status"], "accepted")
    expect((len(cycle_world.reports), len(cycle_world.intents)), (1, 1))
    expect(cycle_world.report("old-on-form", expected_policy_revision=stale_review), stale_result)
    case("C05", "A fresh review and deliberate new intent may proceed after the policy cycle", None,
         {"fresh_revision": fresh_revision, "new_intake_count": 1,
          "no_op_policy_revision_change": 0, "old_rejection_preserved": True}, control=True)

    print(json.dumps({
        "evidence_kind": "bounded_stdlib_semantic_model",
        "decision": "D33 optional authorized missionary reporting through P15, organization Off by default",
        "status": "proposed D33 temporal rules and existing P15/P27 obligations illustrated; no runtime or ratification claim",
        "revision_reason": "Root audit found the initial boolean-only policy omitted On-Off-On stale review. Initial 13 counterexample families, 4 controls and 79 assertions are preserved in initial-model artifacts.",
        "key_rule": "Tenant/actor/ministry-scoped receipts: Off and stale-policy-review rejection are terminal minimal no-effect outcomes; deliberate fresh review uses a new intent/key; accepted exact retry recovers under current disclosure even Off, before new-admission revision checks",
        "policy_rule": "New report admission requires explicitly reviewed current policy revision; effective changes increment it, no-op saves do not. Routine submit_fresh fixture calls supply a newly reviewed revision explicitly.",
        "script_sha256": sha256(Path(__file__).read_bytes()).hexdigest(),
        "reproduction": "python3 docs/features/missionary-workspace-depth/grill/d33-evidence/report-counterexamples.py",
        "counts": {"counterexample_families": sum(item["kind"] == "counterexample" for item in CASES),
                   "positive_controls": sum(item["kind"] == "positive_control" for item in CASES),
                   "passed_outcome_assertions": ASSERTIONS},
        "limitations": [
            "Only synthetic finite standard-library examples ran; no application, database, provider, network, private data, older model or probe was executed.",
            "Acceptance points and ordered schedules assume atomic serialized owner commands; no SQL/RLS, locks, transaction isolation, durable delivery, real concurrency or crash recovery is proved.",
            "Receipt assertions are attributed reports, not verification of physical truth, custody, tax dates or money; financial and handling proof inputs are opaque owner-qualified fixtures.",
            "No finance entry/posting/receipt/fulfillment producer, ledger, bank clearance, check matching, sender, file upload or valuation is implemented.",
            "Duplicate resolution records qualified retained origins only; full canonical redirection, itemization, conflicting posted duplicates, appeal fanout and existing-task reconciliation remain unmodeled.",
            "Permission and policy events are qualified inputs; exact synthetic tenant/ministry context is checked, but real role grants, settings authority, clocks/expiry, field-level privacy, retained history, routing directory and browser context enforcement are untested.",
            "Terminal Off rejection and transient source failure are distinct modeled outcomes; other rejection classes, cancellation, policy-command idempotency, restore and mixed-version deployment are not implemented.",
            "Material correction versus source resolution is illustrated; full incidental edits, exact financial revision folds, exception closure and correction-retention contracts remain owner obligations.",
            "Minimal receipts avoid returning old form bodies in these examples; payload hashes are equality witnesses, not a storage/privacy design. Actual retention, disposal, cryptographic privacy and all result surfaces are not proved.",
            "Passing this model establishes no producer availability, deployed grant, production reliability or release readiness.",
        ],
        "cases": CASES,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    run()
