#!/usr/bin/env python3
"""Finite D30 need-purpose/policy examples; not SQL, runtime or concurrency proof.

Pure stdlib, synthetic inputs. Records below are reasoning variables, not a
schema, new ledger, role mapping, policy engine or implementation proposal.
One effective policy is modeled; organization-wide vs per-need customization
remains pending and is not inferred from this fixture.
"""

from copy import deepcopy
from dataclasses import dataclass, field, replace
from hashlib import sha256
import json
from pathlib import Path


SCOPE = ("tenant-a", "entity-a", "ministry:alpha", "supporter-grace")


@dataclass
class Need:
    identity: str = "need-1"
    owner_scope: tuple = SCOPE[:3]
    terms: dict = field(default_factory=lambda: {1: "specific_one_time_need"})
    invalid_terms: set = field(default_factory=set)
    source_revision: int = 1
    lifecycle: str = "open"
    permitted_title: str = "Vehicle repairs"


@dataclass
class Gift:
    identity: str = "gift-1"
    scope: tuple = SCOPE
    original_live: bool = True
    received: bool = False
    receipt_interval: int | None = None
    receipt_occurrence: str | None = None
    source_revision: int = 1
    qualified_parts: frozenset = frozenset({"canonical-portion-a"})
    positive_support: bool = True
    readable: bool = True
    # Financial facts are opaque fixture values, never mutated by D30 commands.
    source_money: tuple = ("USD", 12500, "financial-revision-1")


@dataclass(frozen=True)
class Purpose:
    identity: str = "purpose-1"
    gift: str = "gift-1"
    need: str = "need-1"
    scope: tuple = SCOPE
    accepted_terms: int = 1
    canonical_part: str = "canonical-portion-a"
    donor_accepted: bool = True
    confirmed: bool = True
    evidence_kind: str = "qualified_donor_instruction"
    current_scope: str = "positive"
    revision: int = 1
    # Independently qualified original/current portion facts; no P28 arithmetic.
    original_instruction: tuple = ("USD", 2500, "source-revision-1")
    current_support: tuple = ("USD", 1500, "owner-certified-current-scope")


@dataclass(frozen=True)
class Authority:
    scope: tuple = SCOPE
    configure: bool = True
    confirm_need: bool = True
    confirm_additional: bool = True
    admit: bool = True
    read_gift: bool = True
    read_reason: bool = True
    read_need_title: bool = True
    handle: bool = True
    epoch: int = 1


@dataclass(frozen=True)
class Admission:
    purpose: str
    gift_revision: int
    purpose_revision: int
    need_revision: int
    policy_revision: int
    interval: int
    authority_epoch: int


@dataclass
class World:
    needs: dict = field(default_factory=lambda: {"need-1": Need()})
    gifts: dict = field(default_factory=lambda: {"gift-1": Gift()})
    purposes: dict = field(default_factory=lambda: {"purpose-1": Purpose()})
    authority: Authority = field(default_factory=Authority)
    on: bool = False
    interval: int = 0
    policy_revision: int = 0
    policy_receipts: dict = field(default_factory=dict)
    # Abstract existing source/task owner effects. Reason identity does not
    # replace D20's stable contribution/Party/subject/purpose member identity.
    reasons: dict = field(default_factory=dict)
    covered: set = field(default_factory=set)
    disposition_receipts: dict = field(default_factory=dict)
    outward_effects: list = field(default_factory=list)

    def member_key(self, gift_id):
        return (self.gifts[gift_id].scope, gift_id, "existing-special-gift-follow-up")

    def can(self, action, gift_id="gift-1"):
        gift = self.gifts[gift_id]
        return (self.authority.scope == gift.scope and getattr(self.authority, action)
                and (action != "read_gift" or gift.readable))

    def set_policy(self, request_id, enabled):
        # Same-current-scope authorization also governs result recovery.
        if not self.can("configure"):
            return {"status": "unavailable"}
        if request_id in self.policy_receipts:
            old_payload, old_result = self.policy_receipts[request_id]
            return old_result if old_payload == enabled else {"status": "conflict"}
        if self.on != enabled:
            self.on = enabled
            self.policy_revision += 1
            if enabled:
                self.interval += 1
        result = {"status": "accepted", "accepted_on": self.on,
                  "accepted_revision": self.policy_revision, "accepted_interval": self.interval}
        self.policy_receipts[request_id] = (enabled, result)
        return result

    def receive(self, gift_id="gift-1", occurrence="live-receipt-1"):
        # This models the qualified owner's FIRST eligible received occurrence,
        # not a webhook, accounting date or worker delivery. It is an input event.
        gift = self.gifts[gift_id]
        if gift.received:
            return "same_original_occurrence"
        gift.received = True
        gift.receipt_interval = self.interval if self.on and gift.original_live else None
        gift.receipt_occurrence = occurrence
        gift.source_revision += 1
        return "received"

    def record_purpose(self, fact):
        if (not self.can("confirm_need", fact.gift)
                or self.gifts[fact.gift].scope != fact.scope
                or fact.need not in self.needs
                or self.needs[fact.need].owner_scope != fact.scope[:3]):
            return "unavailable"
        self.purposes[fact.identity] = fact
        # Recording purpose is not automatic-follow-up admission, even while On.
        return "purpose_recorded"

    def qualification(self, purpose_id):
        fact = self.purposes[purpose_id]
        gift, need = self.gifts[fact.gift], self.needs[fact.need]
        if (not fact.donor_accepted or not fact.confirmed
                or fact.evidence_kind != "qualified_donor_instruction"
                or fact.scope != gift.scope or need.owner_scope != gift.scope[:3]
                or fact.canonical_part not in gift.qualified_parts):
            return "unqualified"
        if need.terms.get(fact.accepted_terms) != "specific_one_time_need":
            return "unqualified"
        if fact.accepted_terms in need.invalid_terms:
            return "invalid"
        if not gift.received or not gift.positive_support:
            return "no_eligible_receipt"
        if fact.current_scope == "unknown":
            return "unavailable"
        if fact.current_scope != "positive":
            return "invalid"
        return "eligible"

    def prepare(self, purpose_id="purpose-1"):
        fact = self.purposes[purpose_id]
        gift = self.gifts[fact.gift]
        if (not self.can("admit", fact.gift) or not self.can("read_gift", fact.gift)
                or self.qualification(purpose_id) != "eligible" or not self.on
                or not gift.original_live or gift.receipt_interval != self.interval):
            return None
        return Admission(purpose_id, gift.source_revision, fact.revision,
                         self.needs[fact.need].source_revision, self.policy_revision,
                         self.interval, self.authority.epoch)

    def accept(self, intent):
        # An abstract serialized owner boundary, not a real lock/transaction.
        if intent is None:
            return "unavailable"
        current = self.prepare(intent.purpose)
        if current is None:
            return "unavailable"
        if current != intent:
            return "reevaluate"
        fact = self.purposes[intent.purpose]
        key = self.member_key(fact.gift)
        if key in self.covered:
            return "already_handled"
        reasons = self.reasons.setdefault(key, {})
        reasons.setdefault(intent.purpose, {"state": "active", "captured_interval": intent.interval,
                                           "captured_policy_revision": intent.policy_revision})
        return "admitted"

    def existing_reason(self, gift_id, reason):
        # Fixture: another owner already qualified D29/D22/etc. No classifier.
        key = self.member_key(gift_id)
        if key not in self.covered:
            self.reasons.setdefault(key, {})[reason] = {"state": "active", "independent": True}

    def reconcile(self, purpose_id="purpose-1"):
        fact = self.purposes[purpose_id]
        key = self.member_key(fact.gift)
        if not self.can("admit", fact.gift) or not self.can("read_gift", fact.gift):
            return "unavailable"
        if key in self.covered:
            return "already_handled"
        reason = self.reasons.get(key, {}).get(purpose_id)
        if reason is None:
            return "never_admitted"
        state = self.qualification(purpose_id)
        reason["state"] = "active" if state == "eligible" else "unavailable" if state == "unavailable" else "withdrawn"
        # Repair of the existing admitted reason uses captured lineage; Off does
        # not itself invalidate it or permit a never-admitted purpose to appear.
        return reason["state"]

    def pending(self):
        return {key for key, reasons in self.reasons.items()
                if key not in self.covered and any(r["state"] == "active" for r in reasons.values())}

    def project(self, gift_id="gift-1"):
        if not self.can("read_gift", gift_id):
            return {"status": "unavailable"}
        labels = set()
        for purpose_id, reason in self.reasons.get(self.member_key(gift_id), {}).items():
            if purpose_id not in self.purposes or reason["state"] != "active":
                continue
            if self.qualification(purpose_id) != "eligible":
                continue
            if not self.can("read_reason", gift_id):
                continue
            if self.can("read_need_title", gift_id):
                labels.add("Gift for " + self.needs[self.purposes[purpose_id].need].permitted_title)
            else:
                labels.add("One-time need purpose confirmed")
        return {"status": "permitted", "reasons": sorted(labels)}

    def review(self, gift_ids):
        selected = []
        for identity in gift_ids:
            if not self.can("handle", identity) or not self.can("read_gift", identity) or self.member_key(identity) not in self.pending():
                return None
            # Minimal source version binding, not all of D20's real task state.
            selected.append((identity, self.gifts[identity].source_revision))
        return tuple(sorted(selected)) if selected else None

    def finish(self, request_id, selected):
        if selected is None or any(not self.can("handle", identity) or not self.can("read_gift", identity)
                                   for identity, _ in selected):
            return {"status": "unavailable"}
        if request_id in self.disposition_receipts:
            old, receipt = self.disposition_receipts[request_id]
            return receipt if old == selected else {"status": "conflict"}
        if any(self.gifts[identity].source_revision != revision or self.member_key(identity) not in self.pending()
               for identity, revision in selected):
            return {"status": "conflict"}
        self.covered.update(self.member_key(identity) for identity, _ in selected)
        receipt = {"status": "handled", "gifts": [identity for identity, _ in selected]}
        self.disposition_receipts[request_id] = (selected, receipt)
        return receipt

    def add_need(self, identity):
        self.needs[identity] = Need(identity=identity, permitted_title="Private need " + identity)
        # Fixture supplies a distinct already-qualified part of the same gift;
        # this is not a D30 command creating a new financial allocation.
        part = "canonical-portion-" + identity
        self.gifts["gift-1"].qualified_parts |= frozenset({part})
        fact = replace(Purpose(), identity="purpose-" + identity, need=identity, canonical_part=part)
        self.record_purpose(fact)
        return fact.identity

    def add_gift(self, identity):
        self.gifts[identity] = Gift(identity=identity)
        fact = replace(Purpose(), identity="purpose-" + identity, gift=identity)
        self.record_purpose(fact)
        self.receive(identity, occurrence="live-" + identity)
        return fact.identity


def eligible_world():
    w = World()
    w.set_policy("enable", True)
    w.receive()
    return w


ASSERTIONS = 0


def expect(actual, expected, label):
    global ASSERTIONS
    ASSERTIONS += 1
    if actual != expected:
        raise AssertionError(f"{label}: expected {expected!r}, got {actual!r}")


def case(cid, name, unsafe, corrected, **detail):
    return {"id": cid, "name": name, "unsafe_observation": unsafe,
            "corrected_observation": corrected, "passed": True, **detail}


def label_shortcuts():
    rows = []
    for name, payload, predicate in [
        ("appeal link", {"appeal": "monthly-support"}, lambda p: bool(p["appeal"])),
        ("default fund", {"default_fund": "vehicle"}, lambda p: bool(p["default_fund"])),
        ("campaign end", {"end_date": 30}, lambda p: p["end_date"] is not None),
        ("paid once", {"frequency": "one_time"}, lambda p: p["frequency"] == "one_time"),
    ]:
        w = eligible_world()
        w.purposes["purpose-1"] = replace(Purpose(), donor_accepted=False, evidence_kind="unqualified_label")
        unsafe, corrected = predicate(payload), w.accept(w.prepare())
        expect((unsafe, corrected), (True, "unavailable"), name + " is not donor-accepted need purpose")
        rows.append({"shortcut": name, "unsafe": "admitted", "corrected": corrected})
    return case("B01", "Internal appeal/default-fund/payment labels stand in for donor purpose", "four false admissions", "four unavailable", variants=rows)


def additionality_veto():
    w = eligible_world()
    donor_said_additional = False
    unsafe = "admitted" if donor_said_additional else "rejected"
    corrected = w.accept(w.prepare())
    expect((unsafe, corrected), ("rejected", "admitted"), "one-time need is independently sufficient")
    return case("B02", "A need-purpose gift is rejected unless it also asserts additionality", unsafe, corrected)


def scope_shortcuts():
    rows = []
    for name, fact in [("wrong tenant", replace(Purpose(), scope=("tenant-b",) + SCOPE[1:])),
                       ("wrong subject", replace(Purpose(), scope=SCOPE[:2] + ("ministry:beta", SCOPE[3]))),
                       ("foreign need scope", Purpose()),
                       ("unrelated portion", replace(Purpose(), canonical_part="another-gift-portion")),
                       ("unknown surviving scope", replace(Purpose(), current_scope="unknown"))]:
        w = eligible_world()
        w.purposes["purpose-1"] = fact
        if name == "foreign need scope":
            w.needs["need-1"].owner_scope = ("tenant-b",) + SCOPE[1:3]
        unsafe = fact.confirmed
        corrected = w.accept(w.prepare())
        expect((unsafe, corrected), (True, "unavailable"), "gift-level flag ignores " + name)
        rows.append({"mismatch": name, "unsafe": "whole_gift_admitted", "corrected": corrected})
    return case("B03", "A need confirmation spreads to another scope or an uncertain portion", "five false admissions", "five unavailable", variants=rows)


def duplicate_needs_and_reasons():
    w = eligible_world()
    second = w.add_need("need-2")
    for purpose in ["purpose-1", second]:
        intent = w.prepare(purpose)
        w.accept(intent)
        w.accept(intent)
    w.existing_reason("gift-1", "D29-additional")
    w.existing_reason("gift-1", "D22-amount")
    unsafe_members = {("gift-1", reason) for reason in w.reasons[w.member_key("gift-1")]}
    expect((len(unsafe_members), len(w.pending())), (4, 1), "two needs and two other reasons remain one business member")
    return case("B04", "Every need, reason or retry creates another member", {"members": len(unsafe_members)}, {"members": len(w.pending())})


def closed_need():
    rows = []
    for lifecycle in ["closed", "funded"]:
        w = eligible_world()
        intent = w.prepare()
        w.needs["need-1"].lifecycle = lifecycle
        unsafe = "withdrawn" if lifecycle != "open" else "active"
        corrected = w.accept(intent)
        expect((unsafe, corrected, w.gifts["gift-1"].positive_support), ("withdrawn", "admitted", True), "need lifecycle does not invalidate receipt or captured purpose")
        rows.append({"lifecycle": lifecycle, "unsafe": unsafe, "corrected": corrected})
    return case("B05", "Closing or funding the need erases the gift's qualified purpose", "two withdrawals", "two valid admissions", variants=rows)


def term_reclassification():
    w = eligible_world()
    w.needs["need-1"].terms[1] = "ordinary_recurring_support"
    w.needs["need-1"].terms[2] = "specific_one_time_need"
    w.needs["need-1"].source_revision = 2
    unsafe = "admitted" if w.needs["need-1"].terms[2] == "specific_one_time_need" else "unavailable"
    corrected = w.accept(w.prepare())
    expect((unsafe, corrected, w.purposes["purpose-1"].accepted_terms), ("admitted", "unavailable", 1), "latest need terms cannot rewrite what the donor accepted")
    return case("B06", "Reclassifying today's need terms manufactures old donor purpose", unsafe, corrected, donor_accepted_terms_revision=1)


def worker_time_policy():
    rows = []
    for origin in ["receipt_while_off", "historical_acquisition"]:
        w = World()
        if origin == "historical_acquisition":
            w.gifts["gift-1"].original_live = False
        w.receive()
        original_occurrence = w.gifts["gift-1"].receipt_occurrence
        w.set_policy("enable-later", True)
        w.receive(occurrence="replayed-now")
        unsafe = "admitted" if w.on else "unavailable"
        corrected = w.accept(w.prepare())
        expect((unsafe, corrected, w.gifts["gift-1"].receipt_interval, w.gifts["gift-1"].receipt_occurrence),
               ("admitted", "unavailable", None, original_occurrence), "current On cannot replace original receipt interval")
        rows.append({"origin": origin, "unsafe": unsafe, "corrected": corrected})
    return case("B07", "The worker's current policy manufactures a live receipt cohort", "two late admissions", "two unavailable", variants=rows)


def old_interval_reenable():
    w = eligible_world()
    w.purposes["purpose-1"] = replace(Purpose(), confirmed=False)
    original_interval = w.gifts["gift-1"].receipt_interval
    w.set_policy("off", False)
    recorded = w.record_purpose(replace(Purpose(), confirmed=True, revision=2))
    w.set_policy("reenable", True)
    unsafe = "admitted" if w.on and w.purposes["purpose-1"].confirmed else "unavailable"
    corrected = w.accept(w.prepare())
    expect((recorded, unsafe, corrected, original_interval, w.interval), ("purpose_recorded", "admitted", "unavailable", 1, 2), "Off closes interval for never-admitted work without banning purpose recording")
    return case("B08", "A later confirmation or re-enable revives an unadmitted old interval", unsafe, corrected, receipt_interval=1, current_interval=2)


def off_existing_work():
    w = eligible_world()
    w.accept(w.prepare())
    captured = deepcopy(w.reasons)
    w.set_policy("off", False)
    unsafe_pending = set() if not w.on else w.pending()
    corrected = w.reconcile()
    expect((len(unsafe_pending), len(w.pending()), corrected, w.reasons == captured), (0, 1, "active", True), "Off stops new admission but preserves already accepted reason/intent")
    return case("B09", "Off cancels accepted work or prevents its pending materialization", {"pending": len(unsafe_pending)}, {"pending": len(w.pending()), "reconciled_reason": corrected}, limitation="Actual asynchronous task materialization is not implemented")


def acceptance_races():
    rows = []
    for change in ["Off", "source_reversal", "purpose_withdrawal", "permission_revocation", "source_revision"]:
        w = eligible_world()
        intent = w.prepare()
        if change == "Off":
            w.set_policy("off", False)
        elif change == "source_reversal":
            w.gifts["gift-1"].positive_support = False
            w.gifts["gift-1"].source_revision += 1
        elif change == "purpose_withdrawal":
            w.purposes["purpose-1"] = replace(Purpose(), confirmed=False, revision=2)
        elif change == "permission_revocation":
            w.authority = replace(w.authority, admit=False, epoch=2)
        else:
            w.gifts["gift-1"].source_revision += 1
        unsafe = "admitted" if intent is not None else "unavailable"
        corrected = w.accept(intent)
        expected = "reevaluate" if change == "source_revision" else "unavailable"
        expect((unsafe, corrected, len(w.reasons)), ("admitted", expected, 0), "acceptance rechecks " + change)
        rows.append({"order": ["prepare", change, "accept"], "unsafe": unsafe, "corrected": corrected})
    return case("B10", "A queued evaluation wins after a contrary policy/source/authority transition", "five stale admissions", "five fenced writes", schedules=rows)


def settings_retry_interval():
    w = eligible_world()
    receipt_interval = w.gifts["gift-1"].receipt_interval
    first = w.set_policy("same-on", True)
    repeat = w.set_policy("same-on", True)
    different_command_same_value = w.set_policy("still-on", True)
    unsafe_interval = receipt_interval
    for _ in [first, repeat, different_command_same_value]:
        unsafe_interval += 1
    accepted = w.accept(w.prepare())
    expect((unsafe_interval, w.interval, first, repeat, different_command_same_value, accepted),
           (4, 1, first, first, first, "admitted"), "no-op saves/retries cannot split the enabled interval")
    conflict = w.set_policy("same-on", False)
    expect((conflict, w.on, w.interval), ({"status": "conflict"}, True, 1), "changed payload under same command cannot turn Off")
    w.authority = replace(w.authority, configure=False, epoch=2)
    denied_recovery = w.set_policy("same-on", True)
    expect((denied_recovery, w.on), ({"status": "unavailable"}, True), "policy receipt recovery rechecks current authority without undoing accepted state")
    return case("B11", "Every save or retry starts a new enabled generation", {"interval": unsafe_interval}, {"interval": w.interval, "admission": accepted, "changed_payload": conflict, "revoked_recovery": denied_recovery})


def privacy_and_confirmation_authority():
    w = eligible_world()
    second = w.add_need("need-2")
    w.accept(w.prepare())
    w.accept(w.prepare(second))
    unsafe_labels = [w.needs[w.purposes[p].need].permitted_title for p in ["purpose-1", second]]
    w.authority = replace(w.authority, read_need_title=False)
    generic = w.project()
    expect(generic, {"status": "permitted", "reasons": ["One-time need purpose confirmed"]}, "title restriction exposes no hidden need names or count")
    w.authority = replace(w.authority, read_reason=False)
    withheld = w.project()
    expect(withheld, {"status": "permitted", "reasons": []}, "reason restriction does not leak reason existence")
    w.authority = replace(w.authority, confirm_need=False, confirm_additional=True)
    recorded = w.record_purpose(replace(Purpose(), revision=2))
    expect(recorded, "unavailable", "D29 confirmation power is not D30 purpose authority")
    w.authority = replace(w.authority, read_gift=False, epoch=2)
    expect(w.project(), {"status": "unavailable"}, "current gift revocation blocks projection")
    stale = eligible_world()
    stale.accept(stale.prepare())
    stale.gifts["gift-1"].positive_support = False
    current_projection = stale.project()
    expect(current_projection, {"status": "permitted", "reasons": []}, "projection rejects stale qualification before reason reconciliation catches up")
    return case("B12", "Task reasons expose protected need detail or inherit another purpose's authority", {"private_labels": unsafe_labels, "implicit_confirmation": "allowed"}, {"generic": generic, "reason_withheld": withheld, "need_confirmation": recorded, "source_changed_projection": current_projection})


def completed_coverage_and_new_arrivals():
    w = eligible_world()
    w.accept(w.prepare())
    reviewed = w.review(["gift-1"])
    newcomer = w.add_gift("gift-2")
    w.accept(w.prepare(newcomer))
    unsafe_coverage = sorted(key[1] for key in w.pending())
    first = w.finish("finish", reviewed)
    repeated = w.finish("finish", reviewed)
    extra_need = w.add_need("need-2")
    second_reason = w.accept(w.prepare(extra_need))
    expect((unsafe_coverage, first["gifts"], repeated["gifts"], second_reason, sorted(key[1] for key in w.pending())),
           (["gift-1", "gift-2"], ["gift-1"], ["gift-1"], "already_handled", ["gift-2"]), "new reasons cannot replay covered gift and old review cannot consume new gift")
    return case("B13", "Another need reopens handled coverage or retry consumes a newly arrived gift", {"covered": unsafe_coverage, "later_need": "new_task"}, {"covered": first["gifts"], "later_need": second_reason, "remaining": ["gift-2"]})


def controls():
    rows = []
    w = eligible_world()
    original_financial_fact = w.gifts["gift-1"].source_money
    result = w.accept(w.prepare())
    expect((result, w.gifts["gift-1"].source_money, w.outward_effects), ("admitted", original_financial_fact, []), "need-purpose admission changes no money and sends nothing")
    rows.append({"id": "P01", "name": "Qualified one-time need independently admits same gift without financial or outward effects", "result": result, "passed": True})

    w = World(purposes={})
    record = w.record_purpose(Purpose())
    before = w.accept(w.prepare())
    w.set_policy("enable", True)
    w.receive()
    after = w.accept(w.prepare())
    late = eligible_world()
    late.purposes["purpose-1"] = replace(Purpose(), confirmed=False)
    unconfirmed = late.accept(late.prepare())
    late.record_purpose(replace(Purpose(), revision=2))
    confirmed = late.accept(late.prepare())
    expect((record, before, after, unconfirmed, confirmed), ("purpose_recorded", "unavailable", "admitted", "unavailable", "admitted"), "either fact may arrive first, but both and same enabled interval are required")
    rows.append({"id": "P02", "name": "Pre-receipt evidence and genuine later confirmation each wait for complete same-interval qualification", "pre_receipt": before, "after_receipt": after, "late_confirmation": confirmed, "passed": True})

    w = eligible_world()
    w.accept(w.prepare())
    w.existing_reason("gift-1", "D29-additional")
    w.set_policy("off", False)
    w.needs["need-1"].invalid_terms.add(1)
    w.needs["need-1"].source_revision += 1
    invalid = w.reconcile()
    independent = w.reasons[w.member_key("gift-1")]["D29-additional"]["state"]
    w.needs["need-1"].invalid_terms.remove(1)
    w.needs["need-1"].source_revision += 1
    repair = w.reconcile()
    expect((invalid, independent, repair, len(w.pending())), ("withdrawn", "active", "active", 1), "source correction and repair preserve independent work while Off")
    w.finish("finish", w.review(["gift-1"]))
    expect(w.reconcile(), "already_handled", "source repair cannot replay human coverage")
    never = eligible_world()
    never.set_policy("off", False)
    expect(never.reconcile(), "never_admitted", "repair is not a new admission while Off")
    rows.append({"id": "P03", "name": "Owner correction repairs an admitted unconsumed reason while Off; handled and never-admitted work do not revive", "withdrawn": invalid, "repaired": repair, "independent_reason": independent, "passed": True})

    w = eligible_world()
    old_interval = w.gifts["gift-1"].receipt_interval
    w.set_policy("off", False)
    w.set_policy("reenable", True)
    fresh = w.add_gift("gift-fresh")
    old_result, fresh_result = w.accept(w.prepare()), w.accept(w.prepare(fresh))
    expect((old_interval, w.interval, old_result, fresh_result), (1, 2, "unavailable", "admitted"), "new interval admits genuine new receipt without sweeping old work")
    rows.append({"id": "P04", "name": "A new interval admits a new live receipt while preserving exclusion of old unadmitted gifts", "old": old_result, "new": fresh_result, "passed": True})
    return rows


def main():
    counterexamples = [label_shortcuts(), additionality_veto(), scope_shortcuts(), duplicate_needs_and_reasons(),
                       closed_need(), term_reclassification(), worker_time_policy(), old_interval_reenable(),
                       off_existing_work(), acceptance_races(), settings_retry_interval(),
                       privacy_and_confirmation_authority(), completed_coverage_and_new_arrivals()]
    positive_controls = controls()
    output = {
        "evidence_kind": "finite semantic counterexamples, not implementation verification",
        "selected_direction": "D30 specific one-time need purpose qualifies independently of additionality",
        "policy_scope_status": "Organization-wide versus per-need customization clarification pending; one abstract effective policy modeled",
        "temporal_rule_status": "Proposed review rule: initially Off; prospective enabled intervals; original live receipt must bind same still-enabled interval at new admission; accepted work and qualified repair retain captured lineage",
        "actor_policy": "Current qualified D30 action/scope is an abstract input; D29 or a role name cannot grant it",
        "script_sha256": sha256(Path(__file__).read_bytes()).hexdigest(),
        "reproduce": "python3 docs/features/missionary-workspace-depth/grill/d30-evidence/need-policy-counterexamples.py > /tmp/d30-need-policy-counterexamples.json",
        "summary": {"counterexample_families": len(counterexamples), "positive_controls": len(positive_controls), "assertions_passed": ASSERTIONS, "all_passed": True},
        "limitations": [
            "Synthetic finite cases and selected sequential orderings only; not exhaustive model checking, real concurrency, SQL, RLS, locks, transaction, runtime or production proof.",
            "Only this new stdlib model runs. No prior model, application, database, provider, network or private data is accessed; structures are not proposed schema, ledger or policy engine.",
            "One abstract effective policy is tested. Tenant customization shape remains pending; these examples do not select organization-wide or per-need controls.",
            "The source owner supplies original eligible receipt ordering/cohort and exact donor-accepted need terms. Actual activation history, financial finality, temporal attribution, donor standing and provenance producers are not tested.",
            "Original instruction and current positive surviving scope are separate opaque qualified facts. No allocation, refund calculation, recognition fold, FX or financial correction is implemented.",
            "Need-term classification/correction and current authorization are synthetic source inputs. Policy/confirmation capabilities, evidence-body access and recipient contact authority are not derived or tested against real roles.",
            "Abstract atomic acceptance, durable idempotency, covered identity and captured policy stand for required owner guarantees; actual persistence, crash recovery, queue materialization and one-current-task uniqueness are unproven.",
            "Reviewed coverage models only selected gift/source versions and benign arrivals; the complete D20 purpose/responsibility/authority review and conditional Undo contract remain implementation obligations.",
            "Safe labels demonstrate finite projection logic only; no browser cache eviction, route authorization, hidden-record timing analysis, accessibility, usability or production capacity is measured.",
            "The model does not create an additional-support statement, financial application, interaction, message, receipt or task-origin timestamp. A passing result does not ratify proposed amendments, amend source ownership or establish release readiness."
        ],
        "counterexamples": counterexamples,
        "positive_controls": positive_controls,
    }
    print(json.dumps(output, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
