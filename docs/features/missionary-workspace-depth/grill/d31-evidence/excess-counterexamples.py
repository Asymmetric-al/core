#!/usr/bin/env python3
"""Bounded D31 semantic examples using synthetic owner facts; no runtime proof.

This is neither a financial producer nor a schema/ledger proposal. Arithmetic
witnesses below cover named finite examples only. Source facts, causal order,
comparison completeness and current authority are qualified fixture inputs.
"""

from copy import deepcopy
from dataclasses import dataclass, field, replace
from hashlib import sha256
import json
from pathlib import Path


SCOPE = ("tenant-a", "entity-a", "ministry:alpha", "party-grace")
PURPOSE = "existing-special-gift-follow-up"


def marginal(before, gift, target):
    """Finite arithmetic witness, not a source-service implementation."""
    if any(type(value) is not int or value < 0 for value in (before, gift, target)):
        raise ValueError("exact nonnegative same-currency minor units required")
    return max(before + gift - target, 0) - max(before - target, 0)


def fixed_order_witness(order, amounts, target):
    """Order is a source-owned fixture input, never chosen by this consumer."""
    before, result = 0, {}
    for gift in order:
        result[gift] = marginal(before, amounts[gift], target)
        before += amounts[gift]
    return result


@dataclass(frozen=True)
class Gift:
    identity: str = "gift-1"
    scope: tuple = SCOPE
    currency: str = "USD"
    original_occurrence: str = "source-live-receipt-1"
    original_live_cohort: bool = True
    received: bool = True
    source_revision: int = 1
    original_eligible_units: int = 500
    eligible_current_units: int = 500
    canonical_part: str = "source-portion-1"
    comparison_identity: str = "fixed-pledge-designation-line-1"
    current_source_known: bool = True


@dataclass(frozen=True)
class Certificate:
    identity: str = "source-excess-proof-1"
    gift: str = "gift-1"
    scope: tuple = SCOPE
    currency: str = "USD"
    original_occurrence: str = "source-live-receipt-1"
    canonical_part: str = "source-portion-1"
    source_revision: int = 1
    comparison_revision: int = 1
    revision: int = 1
    owner_qualified: bool = True
    comparison_kind: str = "fixed-full-designation-line"
    comparison_identity: str = "fixed-pledge-designation-line-1"
    complete_comparison_scope: bool = True
    original_terms_qualified: bool = True
    attributable_to_original_money: bool = True
    original_excess_units: int = 500
    current_excess_units: int = 500
    current_state: str = "known"
    causal_evidence: str = "owner-original-comparison-event-1"


@dataclass(frozen=True)
class Authority:
    scope: tuple = SCOPE
    admit: bool = True
    read: bool = True
    read_reason: bool = True
    handle: bool = True
    epoch: int = 1


@dataclass(frozen=True)
class Ticket:
    gift: str
    source_revision: int
    certificate_revision: int
    comparison_revision: int
    authority_epoch: int


@dataclass
class World:
    gifts: dict = field(default_factory=lambda: {"gift-1": Gift()})
    certificates: dict = field(default_factory=lambda: {"gift-1": Certificate()})
    comparison_revision: int = 1
    authority: Authority = field(default_factory=Authority)
    members: dict = field(default_factory=dict)
    covered: set = field(default_factory=set)
    handling_results: dict = field(default_factory=dict)

    def key(self, gift):
        return (self.gifts[gift].scope, gift, PURPOSE)

    def can(self, action, gift):
        return self.authority.scope == self.gifts[gift].scope and getattr(self.authority, action)

    def qualification(self, gift):
        source = self.gifts[gift]
        proof = self.certificates.get(gift)
        if not source.received or not source.original_live_cohort:
            return "ineligible_occurrence"
        if not source.current_source_known or proof is None:
            return "unavailable"
        if (not proof.owner_qualified or proof.gift != source.identity
                or proof.scope != source.scope or proof.currency != source.currency
                or proof.original_occurrence != source.original_occurrence
                or proof.canonical_part != source.canonical_part
                or proof.comparison_identity != source.comparison_identity
                or not proof.complete_comparison_scope
                or proof.comparison_kind not in {"fixed-full-designation-line", "recurring-exact-occurrence-line"}
                or not proof.original_terms_qualified or not proof.attributable_to_original_money
                or not proof.causal_evidence):
            return "unqualified"
        if (proof.source_revision != source.source_revision
                or proof.comparison_revision != self.comparison_revision):
            return "unavailable"
        if proof.current_state == "uncertain":
            return "unavailable"
        if proof.current_state != "known":
            return "invalid"
        amounts = (proof.original_excess_units, proof.current_excess_units,
                   source.original_eligible_units, source.eligible_current_units)
        if any(type(value) is not int for value in amounts):
            return "unqualified"
        if proof.original_excess_units <= 0 or proof.current_excess_units <= 0:
            return "not_positive"
        if (proof.current_excess_units > proof.original_excess_units
                or proof.original_excess_units > source.original_eligible_units
                or proof.current_excess_units > source.eligible_current_units):
            return "unqualified"
        return "eligible"

    def prepare(self, gift="gift-1"):
        if not self.can("admit", gift) or not self.can("read", gift) or self.qualification(gift) != "eligible":
            return None
        proof, source = self.certificates[gift], self.gifts[gift]
        return Ticket(gift, source.source_revision, proof.revision,
                      self.comparison_revision, self.authority.epoch)

    def accept(self, ticket):
        # An assumed serialized boundary for examples, not SQL/lock execution.
        if ticket is None:
            return "unavailable"
        current = self.prepare(ticket.gift)
        if current is None:
            return "unavailable"
        if current != ticket:
            return "reevaluate"
        key = self.key(ticket.gift)
        if key in self.covered:
            return "already_handled"
        self.members.setdefault(key, {})["above_commitment"] = "active"
        return "admitted"

    def other_reason(self, gift, reason):
        # Independently owner-qualified fixture input, not another classifier.
        key = self.key(gift)
        if key not in self.covered:
            self.members.setdefault(key, {})[reason] = "active"

    def reconcile(self, gift="gift-1"):
        key = self.key(gift)
        if not self.can("admit", gift) or not self.can("read", gift):
            return "unavailable"
        if key in self.covered:
            return "already_handled"
        if "above_commitment" not in self.members.get(key, {}):
            return "never_admitted"
        state = self.qualification(gift)
        result = "active" if state == "eligible" else "unavailable" if state == "unavailable" else "withdrawn"
        self.members[key]["above_commitment"] = result
        return result

    def review(self, gifts):
        return tuple((gift, self.gifts[gift].source_revision,
                      self.certificates[gift].revision, self.comparison_revision)
                     for gift in sorted(gifts))

    def handle(self, request, reviewed):
        gifts = tuple(row[0] for row in reviewed)
        if any(not self.can("handle", gift) or not self.can("read", gift) for gift in gifts):
            return "unavailable"
        if request in self.handling_results:
            prior, result = self.handling_results[request]
            return result if prior == reviewed else "conflict"
        if reviewed != self.review(gifts):
            return "review_again"
        if any(self.key(gift) not in self.members for gift in gifts):
            return "unavailable"
        for gift in gifts:
            reasons = self.members[self.key(gift)]
            if not any(state == "active" and (reason != "above_commitment"
                       or self.qualification(gift) == "eligible") for reason, state in reasons.items()):
                return "unavailable"
        for gift in gifts:
            self.covered.add(self.key(gift))
        result = ("handled", gifts)
        self.handling_results[request] = (reviewed, result)
        return result

    def disclose(self, gift="gift-1"):
        if not self.can("read", gift):
            return "unavailable"
        if not self.can("read_reason", gift):
            return "gift_follow_up"
        return "above_commitment" if self.qualification(gift) == "eligible" else "gift_follow_up"


ASSERTIONS = 0
CASES = []


def expect(actual, expected):
    global ASSERTIONS
    ASSERTIONS += 1
    if actual != expected:
        raise AssertionError({"actual": actual, "expected": expected})
    return actual


def record(identity, title, unsafe, corrected, schedule=None, control=False):
    case = {"id": identity, "title": title, "kind": "positive_control" if control else "counterexample",
            "unsafe": unsafe, "corrected": corrected}
    if schedule:
        case["schedule"] = schedule
    CASES.append(case)


def add_gift(world, identity, units=500):
    world.gifts[identity] = replace(Gift(), identity=identity,
                                    original_occurrence="receipt-" + identity,
                                    canonical_part="part-" + identity,
                                    original_eligible_units=units,
                                    eligible_current_units=units)
    world.certificates[identity] = replace(Certificate(), identity="proof-" + identity,
                                          gift=identity, original_occurrence="receipt-" + identity,
                                          canonical_part="part-" + identity,
                                          original_excess_units=units, current_excess_units=units)


def run():
    # B01: D31 adds no floor in a currency's authoritative minor-unit scale.
    w = World()
    w.certificates["gift-1"] = replace(Certificate(), original_excess_units=1, current_excess_units=1)
    bad = expect(1 >= 100, False)
    good = expect(w.accept(w.prepare()), "admitted")
    record("B01", "One eligible minor unit is enough", {"one_dollar_floor_admits": bad}, good)

    # B02: these independent arithmetic shortcuts each invent qualification.
    rows = []
    for label, bad_positive, proof in [
        ("zero_is_not_positive", 0 >= 0, replace(Certificate(), original_excess_units=0, current_excess_units=0)),
        ("negative_is_not_nonzero_excess", -1 != 0, replace(Certificate(), original_excess_units=-1, current_excess_units=-1)),
        ("gross_fee_cover_is_not_support_excess", 10500 - 10000 > 0,
         replace(Certificate(), original_excess_units=0, current_excess_units=0)),
        ("float_residue_is_not_minor_unit_excess", 0.1 + 0.2 > 0.3,
         replace(Certificate(), original_excess_units=marginal(10, 20, 30), current_excess_units=0)),
        ("cross_currency_numbers_are_not_comparable", 120 > 100, replace(Certificate(), currency="EUR")),
    ]:
        w = World(certificates={"gift-1": proof})
        rows.append({"case": label, "unsafe_positive": expect(bad_positive, True),
                     "correct_admission": expect(w.accept(w.prepare()), "unavailable")})
    w = World(certificates={})
    rows.append({"case": "unmatched_remainder", "unsafe_positive": expect(500 > 0, True),
                 "correct_admission": expect(w.accept(w.prepare()), "unavailable")})
    record("B02", "Money type, certainty and precision precede positivity", rows, "all six unavailable")

    # B03: neither installment size nor whole gift size identifies exact scope.
    unsafe_installment = expect(max(15000 - 10000, 0), 5000)
    full_fixed = expect(marginal(0, 15000, 20000), 0)
    unsafe_whole_gift = expect(max(10000 - 5000, 0), 5000)
    exact_parts = expect([marginal(0, 5000, 5000), marginal(0, 5000, 5000)], [0, 0])
    record("B03", "Full fixed scope and exact recurring portions", {
        "gift_minus_installment": unsafe_installment, "whole_gift_minus_one_occurrence": unsafe_whole_gift},
        {"full_fixed_target_set": full_fixed, "two_explicit_occurrence_portions": exact_parts})

    # B04: existing aggregate overage cannot be attributed to the next gift.
    aggregate = expect(max(12000 + 500 - 10000, 0), 2500)
    incremental = expect(marginal(12000, 500, 10000), 500)
    record("B04", "A gift owns its marginal excess, not all current overage",
           {"attributed_to_new_gift": aggregate}, {"attributable_to_new_gift": incremental})

    # B05: arithmetic alone cannot select a causal order for concurrent money.
    amounts = {"gift-A": 6000, "gift-B": 6000}
    total = sum(amounts.values())
    leave_one_out = {gift: max(total - 10000, 0) - max(total - units - 10000, 0)
                     for gift, units in amounts.items()}
    expect(leave_one_out, {"gift-A": 2000, "gift-B": 2000})
    original = expect(fixed_order_witness(("gift-A", "gift-B"), amounts, 10000),
                      {"gift-A": 0, "gift-B": 2000})
    reversed_workers = fixed_order_witness(("gift-B", "gift-A"), amounts, 10000)
    expect(reversed_workers, {"gift-B": 0, "gift-A": 2000})
    expect(sum(original.values()), 2000)
    record("B05", "Concurrent gifts need the owner's causal attribution", {
        "leave_one_out_double_assigns": leave_one_out,
        "using_reversed_worker_order_changes_recipient": reversed_workers},
        {"qualified_source_order": ["gift-A", "gift-B"], "attribution": original},
        ["owner accepts A then B within the same typed comparison scope",
         "workers may deliver B before A; they consume the preserved attribution"])

    # B06: D18's current X is true without implying any new money event.
    ordinary_reduction = expect(max(10000 - 8000, 0), 2000)
    original_excess = expect(marginal(0, 10000, 10000), 0)
    w = World(certificates={"gift-1": replace(Certificate(), original_excess_units=0,
                                              current_excess_units=ordinary_reduction,
                                              attributable_to_original_money=False)})
    result = expect(w.accept(w.prepare()), "unavailable")
    record("B06", "A term reduction is not a new excess gift", {
        "current_applied_above_reduced_commitment": ordinary_reduction},
        {"original_money_excess": original_excess, "admission": result})

    # B07: a new evidence delivery is not a new live money occurrence.
    w = World(gifts={"gift-1": replace(Gift(), original_live_cohort=False)})
    historical = expect(w.accept(w.prepare()), "unavailable")
    late = World(certificates={})
    expect(late.accept(late.prepare()), "unavailable")
    late.certificates["gift-1"] = replace(Certificate(), revision=4)
    late_result = expect(late.accept(late.prepare()), "admitted")
    newly_delivered = expect(late.certificates["gift-1"].revision > 3, True)
    record("B07", "Late original evidence differs from historical reclassification", {
        "new_revision_delivery_admits_without_cohort_check": newly_delivered},
        {"historical_receipt": historical, "original_live_late_proof": late_result})

    # B08: original/current amounts are separate; ambiguous correction is unknown.
    w = World(gifts={"gift-1": replace(Gift(), original_eligible_units=1500, eligible_current_units=1500)})
    expect(w.accept(w.prepare()), "admitted")
    w.other_reason("gift-1", "independently_qualified_amount")
    w.gifts["gift-1"] = replace(w.gifts["gift-1"], source_revision=2, eligible_current_units=1000)
    w.certificates["gift-1"] = replace(Certificate(), source_revision=2, revision=2,
                                        current_state="uncertain")
    unknown = expect(w.reconcile(), "unavailable")
    independent = expect(w.members[w.key("gift-1")]["independently_qualified_amount"], "active")
    unsafe_prorated = expect(500 * 1000 // 1500, 333)
    w.certificates["gift-1"] = replace(w.certificates["gift-1"], revision=3,
                                        current_state="known", current_excess_units=0)
    known_none = expect(w.reconcile(), "withdrawn")
    record("B08", "An ambiguous partial reversal has no guessed excess portion", {
        "proportional_guess": unsafe_prorated, "collapse_unknown_to_zero": 0},
        {"uncertain_reason": unknown, "known_no_excess_reason": known_none,
         "independent_reason": independent})

    # B09: changing another gift can invalidate this gift's source certificate.
    w = World(gifts={"gift-1": replace(Gift(), original_eligible_units=6000, eligible_current_units=6000)},
              certificates={"gift-1": replace(Certificate(), original_excess_units=2000, current_excess_units=2000)})
    ticket = w.prepare()
    own_revision = w.gifts["gift-1"].source_revision
    w.comparison_revision = 2
    cached_gift_only_pass = expect(ticket.source_revision == own_revision, True)
    fenced = expect(w.accept(ticket), "unavailable")
    corrected_b = expect(marginal(0, 6000, 10000), 0)
    record("B09", "Fence comparison dependencies as well as this gift", {
        "gift_revision_only_passes": cached_gift_only_pass, "cached_excess": 2000},
        {"acceptance": fenced, "B_after_A_reversal": corrected_b},
        ["prepare B's original20 proof under comparison revision1",
         "reverse prior A; comparison revision2, B's own money revision unchanged",
         "accept must reject stale dependency proof"])

    # B10: source/certificate/auth changes must win before stale acceptance.
    results = {}
    for kind in ("source", "certificate", "authority"):
        w = World()
        ticket = w.prepare()
        unsafe_cached_eligible = ticket is not None
        if kind == "source":
            w.gifts["gift-1"] = replace(Gift(), source_revision=2)
        elif kind == "certificate":
            w.certificates["gift-1"] = replace(Certificate(), revision=2, current_excess_units=400)
        else:
            w.authority = replace(Authority(), admit=False, epoch=2)
        results[kind] = {"unsafe_cached_accept": expect(unsafe_cached_eligible, True),
                         "current_accept": expect(w.accept(ticket), "reevaluate" if kind == "certificate" else "unavailable")}
    record("B10", "A cached eligibility check is not authority to accept", {
        "cached_prechecks": "would accept all three"}, results,
        ["prepare", "source correction / proof revision / authority revoke", "accept"])

    # B11: one apparently positive number cannot cross financial/Party scope.
    mismatches = []
    for change in (
        {"scope": ("tenant-b",) + SCOPE[1:]},
        {"scope": SCOPE[:1] + ("entity-b",) + SCOPE[2:]},
        {"scope": SCOPE[:2] + ("ministry:beta", SCOPE[3])},
        {"scope": SCOPE[:3] + ("another-party",)},
        {"gift": "another-gift"}, {"canonical_part": "another-portion"},
        {"comparison_identity": "another-pledge-line"},
        {"complete_comparison_scope": False}, {"original_terms_qualified": False},
    ):
        w = World(certificates={"gift-1": replace(Certificate(), **change)})
        mismatches.append({"changed": change, "admission": expect(w.accept(w.prepare()), "unavailable")})
    privileged = World(authority=replace(Authority(), scope=("tenant-b",) + SCOPE[1:]))
    expect(privileged.accept(privileged.prepare()), "unavailable")
    unsafe_role_check = "admin" in {"admin", "staff"}
    record("B11", "Exact scope and qualified original comparison are mandatory",
           {"amount_only_admits": 500 > 0, "role_only_bypasses_scope": unsafe_role_check}, mismatches)

    # B12: revisions, reasons and repeated evidence do not identify a new member.
    w = World()
    for reason in ("first_support", "qualified_amount", "additional_purpose", "specific_need"):
        w.other_reason("gift-1", reason)
    for revision in (1, 2, 3):
        w.certificates["gift-1"] = replace(Certificate(), revision=revision)
        expect(w.accept(w.prepare()), "admitted")
    bad_keys = {(gift, reason, revision) for gift in ("gift-1",)
                for reason in ("qualified_amount", "above_commitment") for revision in (1, 2, 3)}
    expect(len(bad_keys), 6)
    expect(len(w.members), 1)
    expect(len(w.members[w.key("gift-1")]), 5)
    record("B12", "Reason and evidence revisions never multiply D20 members",
           {"reason_revision_keys": len(bad_keys)}, {"business_members": len(w.members), "reasons": 5})

    # B13: exact review and durable retry result do not absorb later arrivals.
    w = World()
    w.accept(w.prepare())
    review = w.review(("gift-1",))
    add_gift(w, "gift-2")
    w.accept(w.prepare("gift-2"))
    result = expect(w.handle("request-1", review), ("handled", ("gift-1",)))
    expect(w.handle("request-1", review), result)
    expect(w.key("gift-2") in w.covered, False)
    expect(w.handle("request-1", w.review(("gift-1", "gift-2"))), "conflict")
    w.certificates["gift-1"] = replace(Certificate(), revision=2)
    expect(w.accept(w.prepare()), "already_handled")
    expect(w.reconcile(), "already_handled")
    record("B13", "Grouped handling and lost-response retry cover reviewed gifts only",
           {"complete_current_group": ["gift-1", "gift-2"]},
           {"recovered_result": result, "new_gift_covered": False, "covered_gift_replay": False},
           ["review gift1", "gift2 arrives", "handle gift1 and lose response",
            "retry original request", "receive another proof for gift1"])

    # B14: authorization governs current disclosure and stored result recovery.
    w = World()
    w.accept(w.prepare())
    review = w.review(("gift-1",))
    prior = w.handle("request-1", review)
    w.authority = replace(Authority(), read_reason=False, epoch=2)
    neutral = expect(w.disclose(), "gift_follow_up")
    w.authority = replace(w.authority, read=False, epoch=3)
    no_read = expect(w.disclose(), "unavailable")
    no_recovery = expect(w.handle("request-1", review), "unavailable")
    record("B14", "Cached reason labels and receipts cannot bypass current access",
           {"cached_reason": "above_commitment", "cached_result": prior},
           {"reason_hidden": neutral, "read_revoked": no_read, "result_recovery": no_recovery})

    # C01: isolated Q31 example; all monetary facts remain the owner input.
    w = World()
    before = deepcopy(w.gifts)
    isolated = expect(marginal(10000, 500, 10000), 500)
    expect(w.accept(w.prepare()), "admitted")
    expect(w.gifts, before)
    expect(w.members[w.key("gift-1")], {"above_commitment": "active"})
    record("C01", "A small later gift after prior fulfillment qualifies alone", None,
           {"gift_excess": isolated, "one_reason": "above_commitment", "source_unchanged": True}, control=True)

    # C02: recurring exact occurrence is separate from fixed full-line scope.
    w = World()
    w.gifts["gift-1"] = replace(Gift(), comparison_identity="recurring-occurrence-line-1")
    w.certificates["gift-1"] = replace(Certificate(), comparison_kind="recurring-exact-occurrence-line",
                                        comparison_identity="recurring-occurrence-line-1")
    expect(w.accept(w.prepare()), "admitted")
    record("C02", "Qualified recurring occurrence excess needs no additional-purpose statement", None,
           {"admission": "admitted", "comparison": "exact recurring occurrence line"}, control=True)

    # C03: same original proof can withdraw/restore; no survivor redistribution.
    original = fixed_order_witness(("A", "B"), {"A": 6000, "B": 6000}, 10000)
    reversed_a = fixed_order_witness(("A", "B"), {"A": 0, "B": 6000}, 10000)
    restored_a = fixed_order_witness(("A", "B"), {"A": 6000, "B": 6000}, 10000)
    expect([original["B"], reversed_a["B"], min(original["B"], restored_a["B"])], [2000, 0, 2000])
    w = World(gifts={"gift-1": replace(Gift(), original_eligible_units=6000, eligible_current_units=6000)},
              certificates={"gift-1": replace(Certificate(), original_excess_units=2000, current_excess_units=2000)})
    w.accept(w.prepare())
    w.comparison_revision = 2
    w.certificates["gift-1"] = replace(w.certificates["gift-1"], revision=2,
                                        comparison_revision=2, current_excess_units=0)
    expect(w.reconcile(), "withdrawn")
    w.comparison_revision = 3
    w.certificates["gift-1"] = replace(w.certificates["gift-1"], revision=3,
                                        comparison_revision=3, current_excess_units=2000)
    expect(w.reconcile(), "active")
    expect(len(w.members), 1)
    w.handle("handled", w.review(("gift-1",)))
    expect(w.reconcile(), "already_handled")
    record("C03", "Owner correction restores only the original unconsumed identity", None,
           {"B_excess_history": [2000, 0, 2000], "member_count": 1, "covered_replay": False}, control=True)

    # C04: an explicitly identified surviving excess portion preserves history.
    w = World(gifts={"gift-1": replace(Gift(), original_eligible_units=1000, eligible_current_units=1000)})
    w.accept(w.prepare())
    w.gifts["gift-1"] = replace(w.gifts["gift-1"], source_revision=2, eligible_current_units=200)
    w.certificates["gift-1"] = replace(Certificate(), source_revision=2, revision=2, current_excess_units=200)
    expect(w.reconcile(), "active")
    expect(w.certificates["gift-1"].original_excess_units, 500)
    w.gifts["gift-1"] = replace(w.gifts["gift-1"], source_revision=3, eligible_current_units=800)
    w.certificates["gift-1"] = replace(w.certificates["gift-1"], source_revision=3,
                                        revision=3, current_excess_units=600)
    expect(w.qualification("gift-1"), "unqualified")
    record("C04", "Exact surviving excess is separate from the original proof", None,
           {"original_excess": 500, "owner_proved_survivor": 200, "increase_beyond_original": "unqualified"}, control=True)

    # C05: equal amounts do not collapse separate canonical business gifts.
    w = World()
    add_gift(w, "gift-2")
    expect(w.accept(w.prepare()), "admitted")
    expect(w.accept(w.prepare("gift-2")), "admitted")
    expect(len(w.members), 2)
    review = w.review(("gift-1",))
    w.certificates["gift-1"] = replace(Certificate(), revision=2, current_excess_units=400)
    expect(w.handle("stale-review", review), "review_again")
    expect(len(w.covered), 0)
    record("C05", "Distinct gifts remain distinct and selected changes require review", None,
           {"equal_amount_business_members": 2, "stale_selected_review": "review_again", "coverage": 0}, control=True)

    output = {
        "evidence_kind": "bounded_stdlib_semantic_model_with_finite_arithmetic_witnesses",
        "decision": "D31 A: any positive source-confirmed gift-attributable excess; no extra threshold",
        "contract_status": "source attribution and correction semantics are proposed review amendments, not implementation proof",
        "source_contract": {
            "original": "exact integer same-currency E=max(B+G-T,0)-max(B-T,0), original applicable terms and complete exact scope/prefix within its comparison epoch",
            "order": "original qualified source causal order, assigned by the owner; never worker/UUID/gift-date order",
            "current": "same original prefix/scope/terms/epoch, corrected owner association facts; current excess bounded by original E; later ordinary terms are prospective",
            "dependency": "both gift-source and comparison/certificate dependency revisions fenced at modeled acceptance",
            "consumer": "requires current owner-qualified positive excess; does not apply money or choose financial attribution",
        },
        "script_sha256": sha256(Path(__file__).read_bytes()).hexdigest(),
        "reproduction": "python3 docs/features/missionary-workspace-depth/grill/d31-evidence/excess-counterexamples.py",
        "counts": {"counterexample_families": sum(case["kind"] == "counterexample" for case in CASES),
                   "positive_controls": sum(case["kind"] == "positive_control" for case in CASES),
                   "passed_outcome_assertions": ASSERTIONS},
        "limitations": [
            "Synthetic public fixture inputs only; no application, database, provider, network, private data or prior evidence model was executed.",
            "Arithmetic witnesses cover named finite same-currency cases, not a financial producer, complete ledger, schema, migration or generalized attribution engine.",
            "The actual owner must prove exact comparison completeness, original terms, causal order, typed scope and dependencies; the model supplies these as qualified inputs.",
            "No SQL/RLS, locks, transaction isolation, durable outbox, crash recovery, database uniqueness or real concurrent execution was tested; schedules assume serialized boundaries.",
            "Only one comparison revision is modeled per world; multiple overlapping commitment scopes, linked recurring/fixed coverage, target-version transitions and baseline construction are not implemented.",
            "No FX, fee allocation, commitment matching, refund allocation, source-order discovery or donor/representative authority is inferred or computed.",
            "Historical-cohort qualification and permissions are abstract owner facts; no activation producer, identity role map or privacy surface was tested.",
            "D20 examples cover stable members, selected versions, exact reviewed gift sets and authorized result retry, not its entire grouping, responsibility, undo or UI contract.",
            "Passing assertions validate only this finite model; they do not establish source-producer availability, runtime enforcement, deployed grants or release readiness.",
        ],
        "cases": CASES,
    }
    print(json.dumps(output, indent=2, sort_keys=True))


if __name__ == "__main__":
    run()
