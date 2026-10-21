#!/usr/bin/env python3
"""Finite D29 semantic examples. Pure stdlib; not SQL, runtime or concurrency proof.

The synthetic facts below stand for owning-domain certifications. They are not
schema, API, role mappings or a second financial/task ledger. Authorized staff
and organization-permitted missionaries are selected actor classes; their exact
qualified permissions remain abstract inputs. Tick/amount values are test
fixtures, not monetary thresholds, rollout dates or product defaults.
"""

from copy import deepcopy
from dataclasses import dataclass, field, replace
from hashlib import sha256
import json
from pathlib import Path


SCOPE = ("tenant-a", "entity-a", "ministry:alpha", "supporter-grace")


@dataclass(frozen=True)
class Part:
    allocation: str
    currency: str
    minor: int


@dataclass
class Gift:
    identity: str = "gift-1"
    scope: tuple = SCOPE
    allocations: tuple = (Part("allocation-1", "USD", 1000),)
    received: bool = True
    received_at: int = 10
    source_revision: int = 1
    origin: str = "originally_live"
    d29_cohort: bool = True
    source_stance: str = "compatible"
    readable: bool = True
    source_snapshots: dict = field(default_factory=dict)

    def __post_init__(self):
        if not self.source_snapshots:
            self.source_snapshots = {self.source_revision: self.allocations}


@dataclass(frozen=True)
class Purpose:
    gift: str = "gift-1"
    scope: tuple = SCOPE
    portions: tuple = (Part("allocation-1", "USD", 200),)
    kind: str = "confirmed_additional"
    donor_origin: bool = True
    confirmed: bool = True
    origin: str = "actual_affirmation"
    affirmed_at: int = 11
    recorded_at: int = 12
    revision: int = 1
    evidence_id: str = "evidence-1"
    referenced_source_revision: int = 1


@dataclass(frozen=True)
class CurrentSupport:
    # An opaque owning-source certification, never a P28 refund calculation.
    source_revision: int = 1
    purpose_revision: int = 1
    certification_revision: int = 1
    state: str = "positive"
    portions: tuple = (Part("allocation-1", "USD", 200),)


@dataclass(frozen=True)
class Authority:
    scope: tuple = SCOPE
    actions: frozenset = frozenset({"confirm", "admit", "read", "handle"})
    epoch: int = 1


@dataclass(frozen=True)
class Admission:
    gift: str
    source_revision: int
    purpose_revision: int
    current_support_revision: int
    criterion_revision: int
    authority_epoch: int


@dataclass(frozen=True)
class Review:
    selected: tuple
    outcome: str = "done"


@dataclass
class World:
    gifts: dict = field(default_factory=lambda: {"gift-1": Gift()})
    purposes: dict = field(default_factory=lambda: {"gift-1": Purpose()})
    current_support: dict = field(default_factory=lambda: {"gift-1": CurrentSupport()})
    authority: Authority = field(default_factory=Authority)
    criterion_revision: int = 1
    # Abstract existing-owner facts/effects, not proposed persistence objects.
    members: dict = field(default_factory=dict)
    covered: set = field(default_factory=set)
    receipts: dict = field(default_factory=dict)
    outward_effects: list = field(default_factory=list)

    def key(self, identity):
        gift = self.gifts[identity]
        return (gift.scope, gift.identity, "existing-special-gift-follow-up")

    def can(self, action, identity):
        gift = self.gifts[identity]
        return (action in self.authority.actions and self.authority.scope == gift.scope
                and (action != "read" or gift.readable))

    def record_purpose(self, identity, purpose):
        if (not self.can("confirm", identity) or purpose.gift != identity
                or purpose.scope != self.gifts[identity].scope):
            return "unavailable"
        self.purposes[identity] = purpose
        return "purpose_recorded"

    def set_source_fixture(self, identity, portions, state="positive"):
        # Test setup only: supply an already-qualified survivor conclusion. The
        # caller must specify portions/state; this performs no refund arithmetic.
        prior = self.current_support.get(identity)
        self.current_support[identity] = CurrentSupport(
            self.gifts[identity].source_revision, self.purposes[identity].revision,
            prior.certification_revision + 1 if prior else 1, state, portions)

    def qualification(self, identity):
        gift, purpose = self.gifts[identity], self.purposes.get(identity)
        if purpose is None or not purpose.confirmed or not purpose.donor_origin:
            return "unqualified"
        if purpose.kind != "confirmed_additional" or purpose.origin != "actual_affirmation":
            return "unqualified"
        if purpose.gift != gift.identity or purpose.scope != gift.scope:
            return "unqualified"
        if gift.origin != "originally_live" or not gift.d29_cohort:
            return "historical_only"
        if not gift.received:
            return "not_received"
        if gift.source_stance == "unknown_partial_refund":
            return "unavailable"
        if gift.source_stance == "contradiction":
            return "invalid"
        original = gift.source_snapshots.get(purpose.referenced_source_revision)
        if original is None:
            return "unavailable"
        owners = {part.allocation: part for part in original}
        identities = [part.allocation for part in purpose.portions]
        if not identities or len(set(identities)) != len(identities):
            return "unqualified"
        for part in purpose.portions:
            allocation = owners.get(part.allocation)
            if (allocation is None or part.currency != allocation.currency
                    or type(part.minor) is not int or not 0 < part.minor <= allocation.minor):
                return "unqualified"
        current = self.current_support.get(identity)
        if (current is None or current.source_revision != gift.source_revision
                or current.purpose_revision != purpose.revision or current.state == "unknown"):
            return "unavailable"
        if current.state == "none":
            return "invalid"
        current_owners = {part.allocation: part for part in gift.allocations}
        current_ids = [part.allocation for part in current.portions]
        if (current.state != "positive" or not current.portions
                or len(set(current_ids)) != len(current_ids)):
            return "unavailable"
        for part in current.portions:
            allocation = current_owners.get(part.allocation)
            if (allocation is None or allocation.currency != part.currency
                    or type(part.minor) is not int or not 0 < part.minor <= allocation.minor):
                return "unavailable"
        return "eligible"

    def prepare(self, identity="gift-1"):
        if (not self.can("admit", identity) or not self.can("read", identity)
                or self.qualification(identity) != "eligible"):
            return None
        return Admission(identity, self.gifts[identity].source_revision,
                         self.purposes[identity].revision,
                         self.current_support[identity].certification_revision, self.criterion_revision,
                         self.authority.epoch)

    def accept(self, intent):
        # One abstract owner boundary: recheck facts/authority, resolve durable
        # covered business identity, then attach reason to existing membership.
        if (intent is None or not self.can("admit", intent.gift)
                or not self.can("read", intent.gift)
                or self.qualification(intent.gift) != "eligible"):
            return "unavailable"
        current = self.prepare(intent.gift)
        if current != intent:
            return "reevaluate"
        key = self.key(intent.gift)
        if key in self.covered:
            return "already_handled"
        self.members.setdefault(key, {})["additional"] = "active"
        return "admitted"

    def existing_reason(self, identity, reason):
        # Fixture input: another owner already qualified this independent reason.
        # This does NOT implement D19/D22/P16 or classify by amount.
        key = self.key(identity)
        if key not in self.covered:
            self.members.setdefault(key, {})[reason] = "active"

    def refresh(self, identity):
        key = self.key(identity)
        if "additional" not in self.members.get(key, {}):
            return "no_existing_reason"
        state = self.qualification(identity)
        status = "active" if state == "eligible" else "unavailable" if state == "unavailable" else "withdrawn"
        self.members[key]["additional"] = status
        return status

    def pending(self):
        return {key for key, reasons in self.members.items()
                if key not in self.covered and "active" in reasons.values()}

    def projection(self, identity):
        if not self.can("read", identity):
            return {"status": "unavailable"}
        if self.qualification(identity) != "eligible":
            return {"status": "unavailable"}
        # Only normalized, allowed portions; never supporting private prose.
        return {"status": "qualified", "gift": identity,
                "asserted_source_revision": self.purposes[identity].referenced_source_revision,
                "original_asserted_portions": [{"allocation": p.allocation, "currency": p.currency, "minor": p.minor}
                                               for p in self.purposes[identity].portions],
                "current_eligible_portions": [{"allocation": p.allocation, "currency": p.currency, "minor": p.minor}
                                              for p in self.current_support[identity].portions]}

    def review(self, identities):
        selected = []
        for identity in identities:
            if (not self.can("read", identity) or not self.can("handle", identity)
                    or self.key(identity) not in self.pending()):
                return None
            purpose = self.purposes.get(identity)
            current = self.current_support.get(identity)
            selected.append((identity, self.gifts[identity].source_revision,
                             purpose.revision if purpose else None,
                             current.certification_revision if current else None))
        return Review(tuple(sorted(selected))) if selected else None

    def finish(self, request_id, review):
        if review is None or any(not self.can("read", item[0]) or not self.can("handle", item[0])
                                 for item in review.selected):
            return {"status": "unavailable"}
        if request_id in self.receipts:
            old_review, result = self.receipts[request_id]
            return result if review == old_review else {"status": "conflict"}
        # Validate every selected member before writing any coverage. New gifts
        # outside this set do not participate in the comparison.
        for identity, source_revision, purpose_revision, support_revision in review.selected:
            purpose = self.purposes.get(identity)
            current = self.current_support.get(identity)
            if (self.key(identity) not in self.pending()
                    or self.gifts[identity].source_revision != source_revision
                    or (purpose.revision if purpose else None) != purpose_revision
                    or (current.certification_revision if current else None) != support_revision):
                return {"status": "conflict"}
        identities = [item[0] for item in review.selected]
        self.covered.update(self.key(identity) for identity in identities)
        result = {"status": "handled", "gifts": identities, "outcome": review.outcome}
        self.receipts[request_id] = (review, result)
        return result

    def add_gift(self, identity, currency="USD"):
        self.gifts[identity] = Gift(identity=identity, allocations=(Part(identity + "-allocation", currency, 1000),))
        self.purposes[identity] = Purpose(gift=identity, portions=(Part(identity + "-allocation", currency, 200),))
        self.set_source_fixture(identity, self.purposes[identity].portions)


ASSERTIONS = 0


def expect(actual, expected, label):
    global ASSERTIONS
    ASSERTIONS += 1
    if actual != expected:
        raise AssertionError(f"{label}: expected {expected!r}; got {actual!r}")


def result(cid, name, unsafe, corrected, **more):
    return {"id": cid, "name": name, "unsafe_observation": unsafe,
            "corrected_observation": corrected, "passed": True, **more}


def memo_and_flag():
    rows = []
    shortcuts = [
        ("raw_memo", {"memo": "An additional gift"}, lambda data: "additional" in data["memo"].lower()),
        ("imported_special_tag", {"special_tag": "yes"}, lambda data: bool(data["special_tag"])),
        ("staff_checkbox", {"special_checked": True}, lambda data: data["special_checked"]),
        ("ai_prose_classification", {"predicted_purpose": "extra"}, lambda data: data["predicted_purpose"] == "extra"),
    ]
    for kind, observed, shortcut in shortcuts:
        w = World()
        w.purposes["gift-1"] = replace(w.purposes["gift-1"], kind=kind, confirmed=False)
        unsafe = shortcut(observed) and w.gifts["gift-1"].received
        safe = w.accept(w.prepare())
        expect((unsafe, safe, len(w.pending())), (True, "unavailable", 0), kind + " is not a source affirmation")
        rows.append({"input": kind, "unsafe": "admitted", "corrected": safe})
    return result("B01", "Memo, imported tag or generic checkbox becomes an authorized purpose", "four false admissions", "four unavailable", variants=rows)


def inferred_purpose():
    rows = []
    shortcuts = [
        ("paid_once", {"payment_frequency": "one_time"}, lambda data: data["payment_frequency"] == "one_time"),
        ("no_recorded_commitment", {"certified_commitments": []}, lambda data: not data["certified_commitments"]),
        ("no_visible_commitment", {"visible_commitments": [], "complete": False}, lambda data: not data["visible_commitments"]),
        ("larger_than_history", {"received_minor": 1000, "previous_average_minor": 500}, lambda data: data["received_minor"] > data["previous_average_minor"]),
        ("appeal_link", {"appeal_id": "regular-support-appeal"}, lambda data: bool(data["appeal_id"])),
    ]
    for cue, observed, shortcut in shortcuts:
        w = World(purposes={})
        unsafe = shortcut(observed)
        safe = w.accept(w.prepare())
        expect((unsafe, safe), (True, "unavailable"), cue + " does not affirm additional purpose")
        rows.append({"cue": cue, "unsafe": "admitted", "corrected": safe})
    return result("B02", "Frequency, missing commitment, size or appeal stands in for purpose", "five false admissions", "five unavailable", variants=rows)


def purpose_before_money():
    w = World()
    w.gifts["gift-1"].received = False
    w.purposes["gift-1"] = replace(w.purposes["gift-1"], affirmed_at=5, recorded_at=6)
    unsafe = w.purposes["gift-1"].confirmed
    safe = w.accept(w.prepare())
    expect((unsafe, safe, len(w.members)), (True, "unavailable", 0), "purpose alone is not received support")
    return result("B03", "Confirmed purpose on a pending payment creates received-gift work", "admitted", safe)


def exact_portion():
    w = World()
    unsafe_minor = sum(p.minor for p in w.gifts["gift-1"].allocations)
    projection = w.projection("gift-1")
    expect((unsafe_minor, projection["current_eligible_portions"][0]["minor"]), (1000, 200), "whole gift is not the affirmed additional portion")
    variants = []
    for label, part in [("unrelated allocation", Part("other", "USD", 200)),
                        ("wrong currency", Part("allocation-1", "EUR", 200)),
                        ("exceeds allocation", Part("allocation-1", "USD", 1001))]:
        other = World()
        other.purposes["gift-1"] = replace(other.purposes["gift-1"], portions=(part,))
        denial = other.accept(other.prepare())
        expect(denial, "unavailable", label + " is not exact qualified portion")
        variants.append({"mismatch": label, "result": denial})
    return result("B04", "Purpose of one portion labels or exposes the whole gift", {"minor": unsafe_minor, "currency": "USD"}, projection, rejected_bindings=variants)


def mixed_currency():
    w = World()
    w.add_gift("gift-eur", "EUR")
    projections = [w.projection(identity) for identity in w.gifts]
    unsafe = sum(part["minor"] for projection in projections for part in projection["current_eligible_portions"])
    separated = {}
    for projection in projections:
        for part in projection["current_eligible_portions"]:
            separated[part["currency"]] = separated.get(part["currency"], 0) + part["minor"]
    expect((unsafe, separated), (400, {"USD": 200, "EUR": 200}), "mixed gift amounts cannot become one money total")
    return result("B05", "A grouped task invents a mixed-currency additional-support total", {"untyped_minor_total": unsafe}, {"separate_currency_groups": separated}, limit="Grouping fixture only; no FX, financial fold or amount-rule implementation")


def source_contradiction():
    rows = []
    for stance, expected in [("contradiction", "withdrawn"), ("unknown_partial_refund", "unavailable")]:
        w = World()
        w.accept(w.prepare())
        w.existing_reason("gift-1", "amount")
        w.gifts["gift-1"].source_stance = stance
        w.gifts["gift-1"].source_revision += 1
        # Unsafe worker trusts yesterday's affirmative purpose, or guesses how
        # the partial refund was distributed across ordinary/additional parts.
        unsafe = "active" if w.purposes["gift-1"].confirmed else "withdrawn"
        safe = w.refresh("gift-1")
        expect((unsafe, safe, w.members[w.key("gift-1")]["amount"]), ("active", expected, "active"), "only affected reason changes")
        expect(len(w.pending()), 1, "independent qualified amount reason remains actionable")
        rows.append({"source": stance, "unsafe_additional_reason": unsafe,
                     "corrected_additional_reason": safe, "amount_reason": "active"})
    return result("B06", "Old purpose overrides contradiction or guesses an unresolved refund portion", "additional remains active", "withdraw only invalidity; hold unknown; preserve amount", variants=rows)


def current_authority():
    rows = []
    for label, authority in [("wrong tenant", replace(Authority(), scope=("tenant-b",) + SCOPE[1:])),
                             ("wrong subject", replace(Authority(), scope=SCOPE[:2] + ("ministry:beta", SCOPE[3]))),
                             ("no confirmation permission", replace(Authority(), actions=frozenset({"read"})))]:
        w = World(authority=authority)
        unsafe = w.gifts["gift-1"].received
        safe = w.record_purpose("gift-1", Purpose())
        expect((unsafe, safe), (True, "unavailable"), "gift existence is not authority: " + label)
        rows.append({"scope_failure": label, "unsafe": "recorded", "corrected": safe})
    return result("B07", "A gift reader or privileged caller bypasses current purpose scope", "three unchecked writes", "three unavailable", variants=rows, actor_choice="Selected authorized staff and organization-permitted missionaries; role membership alone supplies no action/scope grant")


def duplicate_reasons():
    w = World()
    unsafe_keys = set()
    for evidence, revision, criterion in [("e1", 1, 1), ("e2", 2, 1), ("e3", 3, 2)]:
        w.purposes["gift-1"] = replace(w.purposes["gift-1"], evidence_id=evidence, revision=revision)
        w.set_source_fixture("gift-1", (Part("allocation-1", "USD", 200),))
        w.criterion_revision = criterion
        intent = w.prepare()
        w.accept(intent)
        w.accept(intent)  # lost response retry
        unsafe_keys.add(("gift-1", evidence, revision, criterion))
    w.existing_reason("gift-1", "amount")
    w.existing_reason("gift-1", "above_commitment")
    unsafe_keys.update({("gift-1", "amount"), ("gift-1", "above_commitment")})
    expect((len(unsafe_keys), len(w.pending()), set(w.members[w.key("gift-1")].keys())),
           (5, 1, {"additional", "amount", "above_commitment"}), "reasons and versions do not multiply one member")
    return result("B08", "Each evidence ID, policy revision or qualifying flag creates another task member", {"members": len(unsafe_keys)}, {"members": len(w.pending()), "reasons": sorted(w.members[w.key("gift-1")])})


def completed_coverage():
    w = World(purposes={})
    w.existing_reason("gift-1", "amount")
    original = w.finish("handled-on-amount", w.review(["gift-1"]))
    w.purposes["gift-1"] = Purpose(affirmed_at=30, recorded_at=30, revision=2)
    w.set_source_fixture("gift-1", (Part("allocation-1", "USD", 200),))
    w.criterion_revision = 2
    unsafe = "new_task" if w.purposes["gift-1"].confirmed else "none"
    safe = w.accept(w.prepare())
    expect((unsafe, safe, len(w.pending()), original["gifts"]), ("new_task", "already_handled", 0, ["gift-1"]), "new additional reason cannot replay handled gift-purpose")
    return result("B09", "Later confirmation or criterion version reopens an already-handled member", unsafe, safe, original_coverage=original)


def accept_races():
    rows = []
    for change in ["revocation", "financial_correction", "purpose_correction", "survivor_scope_correction", "criterion_revision"]:
        w = World()
        intent = w.prepare()
        if change == "revocation":
            w.authority = replace(w.authority, actions=frozenset(), epoch=2)
        elif change == "financial_correction":
            w.gifts["gift-1"].source_stance = "contradiction"
            w.gifts["gift-1"].source_revision += 1
        elif change == "purpose_correction":
            w.purposes["gift-1"] = replace(w.purposes["gift-1"], revision=2, portions=(Part("allocation-1", "USD", 100),))
            w.set_source_fixture("gift-1", (Part("allocation-1", "USD", 100),))
        elif change == "survivor_scope_correction":
            w.set_source_fixture("gift-1", (Part("allocation-1", "USD", 100),))
        else:
            w.criterion_revision = 2
        unsafe = "admitted" if intent is not None else "unavailable"
        safe = w.accept(intent)
        expected = "unavailable" if change in {"revocation", "financial_correction"} else "reevaluate"
        expect((unsafe, safe, len(w.members)), ("admitted", expected, 0), "commit rechecks " + change)
        rows.append({"order": ["prepare", change, "accept"], "unsafe": unsafe, "corrected": safe})
    w = World()
    w.accept(w.prepare())
    w.authority = replace(w.authority, actions=frozenset(), epoch=2)
    expect((len(w.members), w.projection("gift-1")), (1, {"status": "unavailable"}), "acceptance history survives later revoke but disclosure does not")
    return result("B10", "A prepared confirmation bypasses later correction or revocation", "five stale admissions", "five fenced writes", schedules=rows)


def historical_origin():
    rows = []
    for label in ["historical_import", "preactivation_history", "historical_reclassification", "unsupported_donor_origin"]:
        w = World()
        if label == "historical_import":
            w.gifts["gift-1"].origin = "historical_import"
        elif label == "preactivation_history":
            w.gifts["gift-1"].d29_cohort = False
        elif label == "historical_reclassification":
            w.purposes["gift-1"] = replace(w.purposes["gift-1"], origin="historical_reclassification")
        else:
            w.purposes["gift-1"] = replace(w.purposes["gift-1"], donor_origin=False)
        w.purposes["gift-1"] = replace(w.purposes["gift-1"], recorded_at=100, revision=5)
        w.criterion_revision = 5
        unsafe = w.purposes["gift-1"].recorded_at == 100
        safe = w.accept(w.prepare())
        expect((unsafe, safe), (True, "unavailable"), "recorded now is not new live origin: " + label)
        rows.append({"origin": label, "unsafe": "new_live_task", "corrected": safe})
    return result("B11", "Recent recording or policy version manufactures a live occurrence", "four historical/unsupported admissions", "four unavailable", variants=rows)


def reviewed_set_races():
    w = World()
    w.accept(w.prepare())
    review = w.review(["gift-1"])
    w.add_gift("gift-2")
    w.accept(w.prepare("gift-2"))
    unsafe_coverage = sorted(key[1] for key in w.pending())
    first = w.finish("finish-1", review)
    retry = w.finish("finish-1", review)
    expect((unsafe_coverage, first["gifts"], retry["gifts"], sorted(key[1] for key in w.pending())),
           (["gift-1", "gift-2"], ["gift-1"], ["gift-1"], ["gift-2"]), "completion and retry never consume unseen new gift")
    expect(w.finish("finish-1", w.review(["gift-2"])), {"status": "conflict"}, "same command key with changed reviewed set conflicts")
    changed = World()
    changed.add_gift("gift-2")
    for identity in changed.gifts:
        changed.accept(changed.prepare(identity))
    both = changed.review(["gift-1", "gift-2"])
    changed.gifts["gift-1"].source_revision += 1
    safe = changed.finish("finish-both", both)
    expect((safe, len(changed.covered)), ({"status": "conflict"}, 0), "material selected change rejects whole disposition")
    return result("B12", "Completion or retry resolves the latest group instead of the reviewed set",
                  {"covered": unsafe_coverage}, {"covered": first["gifts"], "residue": ["gift-2"], "changed_selected_source": safe},
                  schedules=[["review gift-1", "gift-2 arrives", "finish", "retry"], ["review both", "gift-1 changes", "finish"]])


def original_assertion_after_identified_refund():
    original_allocations = (Part("ordinary", "USD", 10000), Part("additional", "USD", 2500))
    original_assertion = (Part("additional", "USD", 2500),)
    w = World(gifts={"gift-1": Gift(allocations=original_allocations)},
              purposes={"gift-1": Purpose(portions=original_assertion)}, current_support={})
    w.set_source_fixture("gift-1", original_assertion)
    w.accept(w.prepare())
    # Input from the financial owner: the identified refund removes 10 of the
    # additional 25; ordinary 100 is unaffected. P28 does not derive this split.
    w.gifts["gift-1"].allocations = (Part("ordinary", "USD", 10000), Part("additional", "USD", 1500))
    w.gifts["gift-1"].source_revision = 2
    w.set_source_fixture("gift-1", (Part("additional", "USD", 1500),))
    current_by_id = {p.allocation: p for p in w.gifts["gift-1"].allocations}
    unsafe_revalidation = all(p.minor <= current_by_id[p.allocation].minor for p in original_assertion)
    unsafe_rewrite = tuple(replace(p, minor=current_by_id[p.allocation].minor) for p in original_assertion)
    safe = w.refresh("gift-1")
    shown = w.projection("gift-1")
    expect((unsafe_revalidation, unsafe_rewrite[0].minor, safe), (False, 1500, "active"), "current remainder neither falsifies nor rewrites original assertion")
    expect((shown["original_asserted_portions"][0]["minor"], shown["current_eligible_portions"][0]["minor"],
            w.gifts["gift-1"].source_snapshots[1], len(w.members)),
           (2500, 1500, original_allocations, 1), "original 25 of 125 and current 15 retain separate source evidence")
    return result("B13", "A known refund invalidates or rewrites the original donor-stated amount",
                  {"revalidating_against_current_remainder": "rejects original assertion", "rewritten_assertion_minor": 1500},
                  shown, current_reason=safe, fixture="Originally 25 additional of 125 total; owner-certifies 15 additional survives")


def guessed_mixed_refund():
    gift = Gift(allocations=(Part("mixed", "USD", 12500),))
    purpose = Purpose(portions=(Part("mixed", "USD", 2500),))
    w = World(gifts={"gift-1": gift}, purposes={"gift-1": purpose}, current_support={})
    w.set_source_fixture("gift-1", purpose.portions)
    w.accept(w.prepare())
    w.existing_reason("gift-1", "amount")
    gift.allocations = (Part("mixed", "USD", 11500),)
    gift.source_revision = 2
    w.set_source_fixture("gift-1", (), state="unknown")
    # Deliberately unsafe proportional allocation; only this bad alternative
    # performs refund arithmetic. The corrected path consumes an owner result.
    guessed_additional_minor = 2500 - (1000 * 2500 // 12500)
    safe = w.refresh("gift-1")
    expect((guessed_additional_minor, safe, w.purposes["gift-1"].portions[0].minor,
            w.members[w.key("gift-1")]["amount"]),
           (2300, "unavailable", 2500, "active"), "unidentified refund permits no proportional guess or original assertion rewrite")
    # A later distinct owner conclusion identifies no positive additional scope.
    gift.allocations = (Part("mixed", "USD", 10000),)
    gift.source_revision = 3
    w.set_source_fixture("gift-1", (), state="none")
    resolved = w.refresh("gift-1")
    expect((resolved, w.purposes["gift-1"].portions[0].minor), ("withdrawn", 2500), "known no surviving additional scope differs from uncertainty")
    return result("B14", "A mixed refund is allocated proportionally without owner evidence",
                  {"guessed_additional_minor": guessed_additional_minor},
                  {"while_unresolved": safe, "after_owner_proves_no_survivor": resolved,
                   "original_asserted_minor": 2500, "independent_amount_reason": "active"})


def controls():
    rows = []
    w = World()
    before = deepcopy(w.gifts)
    accepted = w.accept(w.prepare())
    expect((accepted, len(w.pending()), w.gifts == before, w.outward_effects), ("admitted", 1, True, []), "small affirmed portion needs no appeal, amount threshold or financial mutation")
    rows.append({"id": "P01", "name": "Small confirmed additional portion qualifies without appeal or amount rule", "result": accepted, "portion_minor": 200, "financial_facts_unchanged": True, "passed": True})

    w = World()
    w.gifts["gift-1"].received = False
    w.purposes["gift-1"] = replace(Purpose(), affirmed_at=5, recorded_at=6)
    before_receipt = w.accept(w.prepare())
    w.gifts["gift-1"].received = True
    w.gifts["gift-1"].source_revision += 1
    w.set_source_fixture("gift-1", (Part("allocation-1", "USD", 200),))
    after_receipt = w.accept(w.prepare())
    expect((before_receipt, after_receipt, w.gifts["gift-1"].received_at, w.purposes["gift-1"].affirmed_at),
           ("unavailable", "admitted", 10, 5), "pre-receipt purpose waits for actual qualified receipt")
    rows.append({"id": "P02", "name": "Pre-receipt affirmation can link later to qualified received money", "before_receipt": before_receipt, "after_receipt": after_receipt, "passed": True})

    w = World(purposes={})
    first = w.accept(w.prepare())
    w.record_purpose("gift-1", Purpose(affirmed_at=30, recorded_at=35))
    w.set_source_fixture("gift-1", (Part("allocation-1", "USD", 200),))
    late = w.accept(w.prepare())
    expect((first, late, w.gifts["gift-1"].received_at, w.purposes["gift-1"].affirmed_at, w.purposes["gift-1"].recorded_at),
           ("unavailable", "admitted", 10, 30, 35), "actual late first affirmation preserves distinct dates and original live cohort")
    rows.append({"id": "P03", "name": "Actual later first affirmation admits an uncovered originally live cohort gift", "result": late, "received_at": 10, "affirmed_at": 30, "recorded_at": 35, "passed": True})

    w = World()
    w.accept(w.prepare())
    w.existing_reason("gift-1", "amount")
    w.gifts["gift-1"].source_stance = "contradiction"
    w.gifts["gift-1"].source_revision += 1
    withdrawn = w.refresh("gift-1")
    w.gifts["gift-1"].source_stance = "compatible"
    w.gifts["gift-1"].source_revision += 1
    w.set_source_fixture("gift-1", (Part("allocation-1", "USD", 200),))
    restored = w.refresh("gift-1")
    expect((withdrawn, restored, len(w.members), len(w.pending())), ("withdrawn", "active", 1, 1), "qualified correction restores same unconsumed member")
    w.finish("finish", w.review(["gift-1"]))
    expect(w.outward_effects, [], "D20 handling does not send or invent an interaction")
    rows.append({"id": "P04", "name": "Correction repairs only the same unconsumed reason without an outward effect", "withdrawn": withdrawn, "restored": restored, "member_count": 1, "passed": True})

    whole = (Part("whole-additional", "USD", 12500),)
    w = World(gifts={"gift-1": Gift(allocations=whole)},
              purposes={"gift-1": Purpose(portions=whole)}, current_support={})
    w.set_source_fixture("gift-1", whole)
    w.accept(w.prepare())
    w.gifts["gift-1"].allocations = (Part("whole-additional", "USD", 1500),)
    w.gifts["gift-1"].source_revision = 2
    w.set_source_fixture("gift-1", (Part("whole-additional", "USD", 1500),))
    refreshed = w.refresh("gift-1")
    shown = w.projection("gift-1")
    expect((refreshed, shown["original_asserted_portions"][0]["minor"],
            shown["current_eligible_portions"][0]["minor"], len(w.members)),
           ("active", 12500, 1500, 1), "whole-additional gift can retain owner-proved positive surviving support")
    rows.append({"id": "P05", "name": "Whole-additional scope remains qualified after an owner-resolved partial refund",
                 "original_asserted_minor": 12500, "current_eligible_minor": 1500,
                 "reason": refreshed, "member_count": 1, "passed": True})
    return rows


def main():
    bad = [memo_and_flag(), inferred_purpose(), purpose_before_money(), exact_portion(),
           mixed_currency(), source_contradiction(), current_authority(), duplicate_reasons(),
           completed_coverage(), accept_races(), historical_origin(), reviewed_set_races(),
           original_assertion_after_identified_refund(), guessed_mixed_refund()]
    good = controls()
    output = {
        "evidence_kind": "finite semantic counterexamples and controls, not implementation verification",
        "actor_policy": "Founder selected authorized staff and missionaries when the organization permits; exact current action/scope permission remains an abstract qualified input, not an inferred role grant",
        "temporal_contract": "Proposed: both received support and actual affirmed purpose; only an originally live D29-enabled cohort can gain a new unconsumed reason",
        "script_sha256": sha256(Path(__file__).read_bytes()).hexdigest(),
        "reproduce": "python3 docs/features/missionary-workspace-depth/grill/d29-evidence/purpose-counterexamples.py > /tmp/d29-purpose-counterexamples.json",
        "summary": {"counterexample_families": len(bad), "positive_controls": len(good), "assertions_passed": ASSERTIONS, "all_passed": True},
        "limitations": [
            "Finite synthetic cases and selected orderings only; no exhaustive state-space, actual concurrency, SQL, RLS, transaction, lock, runtime or production proof.",
            "No application code, database, provider, private data, prior model or network is accessed; the structures are not a proposed schema, queue or duplicate financial/task ledger.",
            "Received support, exact portion compatibility, recipient route, current permission and D29 cohort are qualified input facts; actual P13/P14/P16/P12 producers and enforcement of the selected actor classes are not implemented or tested.",
            "One canonical direct-support profile and one compatible task-purpose family are represented; recognition attribution, aliases, noncash, household/DAF routes and complete P16 application logic are outside the model.",
            "Captured criterion revision is an invalidation/deduplication input, not a proposed D29 settings control, amount threshold or complete activation-policy history implementation.",
            "Amounts are positive synthetic integer minor units. Currency separation is demonstrated without FX or source financial-fold implementation; precision, supported exponents and production ranges remain untested.",
            "Original assertions bind their referenced source snapshot; current positive surviving support is a separate revision-bound owner certification. These input facts are not an implemented refund/attribution producer.",
            "Unknown partial refund is a synthetic owning-source state; corrected logic does not calculate refund allocation or infer how much remains additionally designated. Proportional arithmetic occurs only in the explicitly unsafe B14 alternative.",
            "Reviewed-set and durable membership behavior is an abstract existing-owner effect; task routing, transactional persistence, crash recovery, actual UI inspection and production one-current-task uniqueness are unproven.",
            "Authorization checks show modeled current disclosure denial; no cache eviction, timing side-channel, protected-body storage or offline recall is demonstrated.",
            "Return values expose synthetic internal diagnoses for review and are not proposed end-user error messages or permission to reveal hidden records.",
            "No interactions, sends, financial application or first-support obligation are produced. Passing the model does not implement the selected actor policy, ratify remaining amendments, amend a source owner or establish release readiness."
        ],
        "counterexamples": bad,
        "positive_controls": good,
    }
    print(json.dumps(output, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
