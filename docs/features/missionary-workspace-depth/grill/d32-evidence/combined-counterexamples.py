#!/usr/bin/env python3
"""Finite D32 purpose/placement/coverage examples, not SQL or runtime proof.

All records are synthetic reasoning variables. Pledge line facts and authority
are qualified owner inputs; this file is not a financial or task implementation.
"""

from copy import deepcopy
from dataclasses import dataclass, field, replace
from hashlib import sha256
import json
from pathlib import Path


SCOPE = ("tenant-a", "entity-a", "ministry:alpha", "party-grace")


@dataclass(frozen=True)
class Line:
    identity: str
    capacity: int
    received_applied: int
    released: int = 0
    ended: int = 0
    currency: str = "USD"
    application_currency: str = "USD"
    conserved: bool = True
    known: bool = True


@dataclass(frozen=True)
class Source:
    identity: str
    kind: str
    scope: tuple = SCOPE
    display_label: str = "Grace"
    revision: int = 1
    eligible_live: bool = True
    known: bool = True
    gift_independently_qualified: bool = True
    pledge_kind: str = "fixed"
    # Owner-qualified original milestone and its current completing/restoring
    # contributions. These are inputs, not inferred from the task's neighbors.
    money_caused_fulfillment: bool = True
    causal_gifts: frozenset = frozenset({"gift-1"})
    lines: tuple = (Line("line-1", 10000, 10000),)

    def qualified(self):
        if not self.known or not self.eligible_live:
            return False
        if self.kind == "gift":
            return self.gift_independently_qualified
        if self.kind != "fulfillment":
            return False
        return (self.pledge_kind == "fixed" and self.money_caused_fulfillment
                and bool(self.lines) and all(
                    line.known and line.conserved and type(line.capacity) is int
                    and type(line.received_applied) is int and line.capacity > 0
                    and line.received_applied >= line.capacity
                    and line.application_currency == line.currency for line in self.lines))


@dataclass(frozen=True)
class Purpose:
    identity: tuple
    source: str
    kind: str
    scope: tuple
    responsibility: str = "responsibility-maya"
    completion_authority: str = "personal-follow-up"
    revision: int = 1

    def compatibility(self):
        return self.scope, self.responsibility, self.completion_authority


@dataclass(frozen=True)
class Authority:
    scopes: frozenset = frozenset({SCOPE})
    configure: bool = True
    admit: bool = True
    handle: bool = True
    read: bool = True
    epoch: int = 1


@dataclass
class Task:
    identity: str
    kind: str
    state: str = "current"


@dataclass(frozen=True)
class Review:
    selected: tuple
    policy_revision: int
    authority_epoch: int
    outcome: str = "done"


@dataclass
class World:
    sources: dict = field(default_factory=lambda: {
        "gift-1": Source("gift-1", "gift"), "pledge-1": Source("pledge-1", "fulfillment")})
    purposes: dict = field(default_factory=dict)
    combine: bool = True
    policy_revision: int = 1
    authority: Authority = field(default_factory=Authority)
    tasks: dict = field(default_factory=dict)
    gift_anchors: dict = field(default_factory=dict)
    fulfillment_shells: dict = field(default_factory=dict)
    placement: dict = field(default_factory=dict)
    placement_revision: dict = field(default_factory=dict)
    covered: set = field(default_factory=set)
    receipts: dict = field(default_factory=dict)
    durable_intents: set = field(default_factory=set)
    next_task: int = 1
    # A pre-existing interaction is a separate owner fact, never task evidence.
    interactions: tuple = ("existing-actual-interaction-1",)

    def identity(self, source):
        item = self.sources[source]
        return item.scope, item.kind, source

    def can(self, action, purpose):
        return self.purposes[purpose].scope in self.authority.scopes and getattr(self.authority, action)

    def source_current(self, purpose):
        member = self.purposes[purpose]
        source = self.sources[member.source]
        return (source.identity == member.source and source.kind == member.kind
                and source.scope == member.scope and source.qualified())

    def new_task(self, kind):
        task = "task-" + str(self.next_task)
        self.next_task += 1
        self.tasks[task] = Task(task, kind)
        return task

    def current_task(self, task):
        return task is not None and self.tasks[task].state == "current"

    def admit(self, source, delivery="transport-1", responsibility="responsibility-maya",
              completion_authority="personal-follow-up"):
        item = self.sources[source]
        if item.scope not in self.authority.scopes or not self.authority.admit or not item.qualified():
            return None
        identity = self.identity(source)
        if identity not in self.purposes:
            self.purposes[identity] = Purpose(identity, source, item.kind, item.scope,
                                              responsibility, completion_authority)
        # Transport identity deliberately does not identify the business effect.
        self.durable_intents.add(identity)
        self.reflow()
        return identity

    def reflow(self):
        """Assumed serialized owner placement; no database behavior is exercised."""
        pending = [key for key in self.purposes if key not in self.covered and self.source_current(key)]
        # A container with only fulfillment residue is no longer D20's current
        # gift group. It can retain that residue without claiming the gift slot.
        for bucket, anchor in tuple(self.gift_anchors.items()):
            if not any(self.purposes[key].kind == "gift" and self.placement.get(key) == anchor
                       for key in pending):
                del self.gift_anchors[bucket]
        groups = {}
        for key in pending:
            groups.setdefault(self.purposes[key].compatibility(), []).append(key)
        desired = {}
        for bucket, members in groups.items():
            gifts = [key for key in members if self.purposes[key].kind == "gift"]
            fulfillments = [key for key in members if self.purposes[key].kind == "fulfillment"]
            anchor = self.gift_anchors.get(bucket)
            if not self.current_task(anchor):
                anchor = None
            if gifts and anchor is None:
                anchor = self.new_task("gift-anchor")
                self.gift_anchors[bucket] = anchor
            for key in gifts:
                desired[key] = anchor
            for key in fulfillments:
                source = self.sources[self.purposes[key].source]
                causal_pending = any(self.purposes[gift].source in source.causal_gifts for gift in gifts)
                old_container = self.placement.get(key)
                if self.combine and anchor is not None and causal_pending:
                    desired[key] = anchor
                elif (self.combine and self.current_task(old_container)
                      and self.tasks[old_container].kind == "gift-anchor"
                      and not any(self.purposes[gift].kind == "gift"
                                  and self.placement.get(gift) == old_container for gift in pending)):
                    # Retaining fulfillment-only residue is not a new joint
                    # placement and does not reserve a slot for later gifts.
                    desired[key] = old_container
                else:
                    shell = self.fulfillment_shells.get(key)
                    if not self.current_task(shell):
                        shell = self.new_task("fulfillment-shell")
                        self.fulfillment_shells[key] = shell
                    desired[key] = shell
        for key in set(self.placement) | set(desired):
            if self.placement.get(key) != desired.get(key):
                self.placement_revision[key] = self.placement_revision.get(key, 0) + 1
        self.placement = desired
        for task in self.tasks.values():
            if task.state == "current" and task.identity not in desired.values():
                task.state = "superseded"

    def set_policy(self, combine):
        if not self.authority.configure:
            return "unavailable"
        if combine != self.combine:
            self.combine = combine
            self.policy_revision += 1
            self.reflow()
        return "configured"

    def review(self, selected, outcome="done"):
        rows = tuple(sorted((key, self.sources[self.purposes[key].source].revision,
                             self.purposes[key].revision, self.placement.get(key),
                             self.placement_revision.get(key, 0)) for key in selected))
        return Review(rows, self.policy_revision, self.authority.epoch, outcome)

    def handle(self, request, review):
        selected = tuple(row[0] for row in review.selected)
        if not selected or len(set(selected)) != len(selected):
            return "invalid_selection"
        if any(not self.can("handle", key) or not self.can("read", key) for key in selected):
            return "unavailable"
        # Recovery validates current disclosure, then returns the accepted result
        # before evaluating current routing policy or changed source versions.
        if request in self.receipts:
            payload, receipt = self.receipts[request]
            return receipt if payload == review else "payload_conflict"
        if any(key in self.covered for key in selected):
            return "conflict"
        current = self.review(selected, review.outcome)
        if review.selected != current.selected or review.authority_epoch != current.authority_epoch:
            return "conflict"
        if any(not self.source_current(key) or key not in self.placement for key in selected):
            return "conflict"
        if len({self.purposes[key].compatibility() for key in selected}) != 1:
            return "conflict"
        joint = {self.purposes[key].kind for key in selected} == {"gift", "fulfillment"}
        if joint and not self.combine:
            return "conflict"
        if len({self.placement[key] for key in selected}) != 1:
            return "conflict"
        if joint:
            for key in selected:
                if self.purposes[key].kind != "fulfillment":
                    continue
                source = self.sources[self.purposes[key].source]
                if not any(self.purposes[gift].kind == "gift" and self.source_current(gift)
                           and self.purposes[gift].source in source.causal_gifts
                           and task == self.placement[key] for gift, task in self.placement.items()):
                    return "conflict"
        if review.outcome not in {"done", "not_needed"}:
            return "invalid_outcome"
        # Validate everything before making any per-purpose coverage effect.
        affected_tasks = {self.placement[key] for key in selected}
        self.covered.update(selected)
        for key in selected:
            del self.placement[key]
            self.placement_revision[key] += 1
        for task in affected_tasks:
            if task not in self.placement.values():
                self.tasks[task].state = "done"
        receipt = ("handled", review.outcome, selected)
        self.receipts[request] = (review, receipt)
        self.reflow()
        return receipt


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


def pair(combine=True):
    world = World(combine=combine)
    gift = world.admit("gift-1")
    fulfillment = world.admit("pledge-1")
    return world, gift, fulfillment


def run():
    # B01: remaining==0 does not establish money-caused whole-pledge fulfillment.
    scenarios = {
        "internal_release": Source("p", "fulfillment", lines=(Line("L", 100, 0, released=100),)),
        "donor_end": Source("p", "fulfillment", lines=(Line("L", 100, 0, ended=100),)),
        "ordinary_terms_reduction": Source("p", "fulfillment", money_caused_fulfillment=False,
                                             lines=(Line("L", 80, 80),)),
        "zero_capacity": Source("p", "fulfillment", lines=(Line("L", 0, 0),)),
        "recurring_schedule_end": Source("p", "fulfillment", pledge_kind="recurring"),
    }
    outcomes = []
    for label, source in scenarios.items():
        remaining = sum(max(line.capacity - line.received_applied - line.released - line.ended, 0)
                        for line in source.lines)
        outcomes.append({"scenario": label, "unsafe_remaining_zero": expect(remaining == 0, True),
                         "qualified": expect(source.qualified(), False)})
    record("B01", "Zero remaining is not the fulfillment milestone", outcomes, "all five rejected")

    # B02: every applicable positive capacity line needs exact received evidence.
    partial = Source("p", "fulfillment", lines=(Line("A", 50, 50), Line("B", 50, 0)))
    misleading_total = Source("p", "fulfillment", lines=(Line("A", 50, 100), Line("B", 50, 0)))
    unknown = replace(partial, lines=(Line("A", 50, 50), Line("B", 50, 50, known=False)))
    mismatched = Source("p", "fulfillment", lines=(Line("A", 100, 100, application_currency="EUR"),))
    unconserved = Source("p", "fulfillment", lines=(Line("A", 100, 100, conserved=False),))
    expect(any(line.received_applied == line.capacity for line in partial.lines), True)
    expect(sum(line.received_applied for line in misleading_total.lines) == sum(line.capacity for line in misleading_total.lines), True)
    expect([source.qualified() for source in (partial, misleading_total, unknown, mismatched, unconserved)], [False] * 5)
    record("B02", "One paid installment or aggregate total cannot fulfill every line", {
        "any_installment_paid": True, "aggregate_offsets_unpaid_line": True},
        {"partial_overapplied_unknown_currency_mismatch_unconserved": [False] * 5})

    # B03: neither line identities nor outbox deliveries define the purpose.
    w = World()
    w.sources["pledge-1"] = replace(w.sources["pledge-1"], lines=(Line("A", 50, 50), Line("B", 50, 50)))
    ids = [w.admit("pledge-1", delivery=delivery) for delivery in ("event-1", "retry-2", "repair-3")]
    unsafe_keys = {(line.identity, delivery) for line in w.sources["pledge-1"].lines
                   for delivery in ("event-1", "retry-2", "repair-3")}
    expect(len(unsafe_keys), 6)
    expect(len(set(ids)), 1)
    expect(len(w.durable_intents), 1)
    record("B03", "One continuing fixed pledge has one fulfillment purpose", {
        "line_delivery_purposes": len(unsafe_keys)}, {"stable_purposes": len(set(ids)), "semantic_intents": 1})

    # B04: one work unit must not collapse two independent coverage identities.
    w, gift, fulfillment = pair()
    unsafe_identity_count = len({w.placement[key] for key in (gift, fulfillment)})
    unsafe_task_coverage = {key for key, task in w.placement.items() if task == w.placement[gift]}
    expect(unsafe_identity_count, 1)
    expect(len(unsafe_task_coverage), 2)
    expect(gift != fulfillment, True)
    w.handle("gift-only", w.review((gift,)))
    expect(fulfillment in w.covered, False)
    expect(w.tasks[w.placement[fulfillment]].state, "current")
    record("B04", "Task identity is not purpose identity", {"task_keyed_coverage_would_cover": len(unsafe_task_coverage)},
           {"handled_purposes": 1, "fulfillment_remaining": True})

    # B05: rerouting attaches/detaches; cloning or marking empty shells Done lies.
    w, gift, fulfillment = pair(combine=False)
    anchor, shell = w.placement[gift], w.placement[fulfillment]
    unsafe_clone = list(w.placement.items()) + [(fulfillment, anchor)]
    cloned_placements = expect(sum(key == fulfillment for key, _ in unsafe_clone), 2)
    before_sources, before_interactions = deepcopy(w.sources), w.interactions
    w.set_policy(True)
    expect(w.placement[gift], anchor)
    expect(w.placement[fulfillment], anchor)
    expect(w.tasks[shell].state, "superseded")
    expect(len(w.covered), 0)
    expect((w.sources, w.interactions), (before_sources, before_interactions))
    expect(len(w.placement), 2)
    unsafe_empty_status = "done" if shell not in w.placement.values() else "current"
    record("B05", "Changing pending placement does not handle or duplicate work", {
        "clone_fulfillment_active_placements": cloned_placements, "empty_shell_generic_terminal_status": unsafe_empty_status},
        {"gift_anchor": anchor, "fulfillment_placement": anchor, "old_shell": "superseded", "coverage": 0})

    # B06: policy, selected placement, source and authority are all final fences.
    results = {}
    for event in ("policy", "placement", "source", "authority"):
        w, gift, fulfillment = pair()
        review = w.review((gift, fulfillment))
        cached_ready = all(key in w.placement for key in (gift, fulfillment))
        if event == "policy":
            w.set_policy(False)
        elif event == "placement":
            w.purposes[fulfillment] = replace(w.purposes[fulfillment], responsibility="responsibility-other", revision=2)
            w.reflow()
        elif event == "source":
            w.sources["pledge-1"] = replace(w.sources["pledge-1"], revision=2,
                                             lines=(Line("L", 100, 50),))
        else:
            w.authority = replace(w.authority, handle=False, epoch=2)
        results[event] = {"unsafe_cached_ready": expect(cached_ready, True),
                          "accepted": expect(w.handle("joint", review), "unavailable" if event == "authority" else "conflict"),
                          "coverage": expect(len(w.covered), 0)}
    record("B06", "Recheck all relevant fences after waiting", "accept from cached precheck", results,
           ["review gift and fulfillment", "wait; relevant owner state changes", "joint handling rechecks before any effect"])

    # B07: selecting two purposes never authorizes best-effort handling of one.
    w, gift, fulfillment = pair()
    review = w.review((gift, fulfillment))
    w.sources["pledge-1"] = replace(w.sources["pledge-1"], revision=2, known=False)
    unsafe_partial = {key for key in (gift, fulfillment) if w.source_current(key)}
    expect(unsafe_partial, {gift})
    expect(w.handle("joint", review), "conflict")
    expect(w.covered, set())
    record("B07", "A changed selected source rejects the complete reviewed command", {
        "best_effort_new_coverage_count": len(unsafe_partial)}, {"new_coverage": 0, "result": "conflict"})

    # B08: a concurrent disposition is a selected-state conflict, not a skip.
    w, gift, fulfillment = pair()
    review = w.review((gift, fulfillment))
    w.handle("other-writer", w.review((fulfillment,)))
    already = set(w.covered)
    unsafe_remaining = {gift, fulfillment} - already
    expect(unsafe_remaining, {gift})
    expect(w.handle("joint", review), "conflict")
    expect(w.covered, already)
    record("B08", "Concurrent handling of a selected purpose causes no partial second effect", {
        "skip_handled_then_cover": 1}, {"additional_coverage": 0, "result": "conflict"},
        ["review both", "another command handles fulfillment", "original joint command conflicts atomically"])

    # B09: global group versions block harmless arrivals; latest-group coverage consumes them.
    w, gift, fulfillment = pair()
    review = w.review((gift, fulfillment))
    old_group = set(w.placement)
    w.sources["gift-2"] = Source("gift-2", "gift")
    new_gift = w.admit("gift-2")
    global_cas_conflict = expect(set(w.placement) != old_group, True)
    latest_group_size = expect(len(w.placement), 3)
    receipt = w.handle("reviewed", review)
    expect(receipt[0], "handled")
    expect(w.covered, {gift, fulfillment})
    expect(new_gift in w.placement, True)
    record("B09", "An unrelated new gift neither blocks nor joins reviewed coverage", {
        "global_group_cas_conflicts": global_cas_conflict, "complete_current_group_count": latest_group_size},
        {"covered_reviewed_count": 2, "new_gift_pending": True})

    # B10: exact receipt recovery precedes current routing evaluation.
    w, gift, fulfillment = pair()
    review = w.review((gift, fulfillment))
    receipt = w.handle("lost-response", review)
    w.set_policy(False)
    expect(w.handle("lost-response", review), receipt)
    expect(w.handle("lost-response", replace(review, outcome="not_needed")), "payload_conflict")
    w.authority = replace(w.authority, read=False, epoch=2)
    expect(w.handle("lost-response", review), "unavailable")
    record("B10", "Retry recovers the old exact outcome after a policy flip", {
        "revalidate_policy_before_receipt": "false conflict", "reexecute_with_new_outcome": "false second effect"},
        {"same_payload": "original_receipt", "changed_payload": "payload_conflict", "read_revoked": "unavailable"})

    # B11: a later purpose cannot be retrocovered by an earlier gift action.
    w = World()
    gift = w.admit("gift-1")
    old_task = w.placement[gift]
    w.handle("gift-finished", w.review((gift,)))
    fulfillment = w.admit("pledge-1")
    expect(w.tasks[old_task].state, "done")
    expect(w.placement[fulfillment] != old_task, True)
    expect(fulfillment in w.covered, False)
    w.sources["gift-2"] = Source("gift-2", "gift")
    later_gift = w.admit("gift-2")
    expect(w.placement[later_gift] != old_task, True)
    expect(w.covered, {gift})
    record("B11", "Late work does not reopen a handled task or inherit its coverage", {
        "reuse_done_anchor": old_task, "same_context_inherits_done": True},
        {"old_task": "done", "late_fulfillment_pending": True, "new_gift_pending": True})

    # B12: financial restoration is neither a new purpose nor an automatic replay.
    w, gift, fulfillment = pair()
    w.sources["pledge-1"] = replace(w.sources["pledge-1"], revision=2, lines=(Line("L", 100, 80),))
    w.reflow()
    expect(fulfillment in w.placement, False)
    w.sources["pledge-1"] = replace(w.sources["pledge-1"], revision=3, lines=(Line("L", 100, 100),))
    expect(w.admit("pledge-1", delivery="restore"), fulfillment)
    expect(fulfillment in w.placement, True)
    w.handle("fulfillment-finished", w.review((fulfillment,)))
    w.sources["pledge-1"] = replace(w.sources["pledge-1"], revision=4, lines=(Line("L", 200, 200),))
    expect(w.admit("pledge-1", delivery="later-restoration"), fulfillment)
    expect(fulfillment in w.placement, False)
    expect(gift in w.placement, True)
    record("B12", "Correction restores only the same unhandled pledge purpose", {
        "source_revision_as_new_purpose": [1, 3, 4]},
        {"stable_fulfillment_id": True, "unhandled_restores": True, "handled_replays": False, "gift_preserved": True})

    # B13: similar donor/name is not shared completion authority.
    results = {}
    for dimension in ("tenant", "entity", "ministry", "party", "responsibility", "completion_authority"):
        w = World()
        altered = list(SCOPE)
        if dimension in ("tenant", "entity", "ministry", "party"):
            altered[("tenant", "entity", "ministry", "party").index(dimension)] += "-other"
        other_scope = tuple(altered)
        w.sources["pledge-1"] = replace(w.sources["pledge-1"], scope=other_scope)
        # Broad synthetic authority does not weaken exact combination compatibility.
        w.authority = replace(w.authority, scopes=frozenset({SCOPE, other_scope}))
        gift = w.admit("gift-1")
        fulfillment = w.admit("pledge-1", responsibility="other" if dimension == "responsibility" else "responsibility-maya",
                              completion_authority="other" if dimension == "completion_authority" else "personal-follow-up")
        expect(w.placement[gift] != w.placement[fulfillment], True)
        results[dimension] = {
            "unsafe_same_display_label": expect(w.sources["gift-1"].display_label == w.sources["pledge-1"].display_label, True),
            "handling": expect(w.handle("incompatible", w.review((gift, fulfillment))), "conflict"),
        }
    record("B13", "Every financial, recipient and responsibility boundary remains exact", {
        "same_display_name_groups_all": True}, results)

    # B14: fulfillment cannot manufacture a separate gift qualification or empty coverage.
    w = World()
    w.sources["gift-1"] = replace(w.sources["gift-1"], gift_independently_qualified=False)
    expect(w.admit("gift-1"), None)
    fulfillment = w.admit("pledge-1")
    unsafe_final_payment = expect(w.sources["pledge-1"].qualified(), True)
    expect(len(w.purposes), 1)
    expect(w.handle("empty", w.review(())), "invalid_selection")
    expect(len(w.covered), 0)
    record("B14", "Combination requires independently qualified, explicitly selected purposes", {
        "final_payment_automatically_special": unsafe_final_payment, "empty_all_true_validation": all([])},
        {"fulfillment_only": fulfillment is not None, "gift_admitted": False, "empty_selection": "invalid_selection"})

    # B15: fulfillment residue does not hold D20's current gift-group slot.
    w, gift, fulfillment = pair()
    residue_container = w.placement[gift]
    w.handle("gift-only", w.review((gift,)))
    expect(w.placement[fulfillment], residue_container)
    expect(w.gift_anchors, {})
    w.sources["gift-2"] = Source("gift-2", "gift")
    later_gift = w.admit("gift-2")
    unsafe_old_anchor = residue_container
    expect(w.placement[later_gift] != unsafe_old_anchor, True)
    expect(w.placement[fulfillment], residue_container)
    expect(w.tasks[residue_container].state, "current")
    record("B15", "Fulfillment-only residue cannot absorb unrelated future gifts", {
        "retained_current_gift_slot_would_route_to": unsafe_old_anchor},
        {"residue_container": residue_container, "new_gift_anchor": w.placement[later_gift],
         "residue_covered": False}, ["handle all gifts", "retain unhandled fulfillment container",
                                   "clear gift-group slot", "unrelated new gift starts its current group"])

    # B16: equal scope is necessary but insufficient for a causal combination.
    w = World()
    w.sources["pledge-1"] = replace(w.sources["pledge-1"], causal_gifts=frozenset({"different-completing-gift"}))
    gift, fulfillment = w.admit("gift-1"), w.admit("pledge-1")
    same_scope = expect(w.purposes[gift].compatibility() == w.purposes[fulfillment].compatibility(), True)
    expect(w.placement[gift] != w.placement[fulfillment], True)
    expect(w.handle("unrelated-joint", w.review((gift, fulfillment))), "conflict")
    late = World()
    handled_cause = late.admit("gift-1")
    late.handle("causal-gift-done", late.review((handled_cause,)))
    late.sources["gift-2"] = Source("gift-2", "gift")
    pending_other = late.admit("gift-2")
    late_milestone = late.admit("pledge-1")
    expect(late.placement[late_milestone] != late.placement[pending_other], True)
    expect(late.covered, {handled_cause})
    record("B16", "Only a pending completing or restoring gift permits new attachment", {
        "scope_only_matches": same_scope, "handled_causal_gift_reused": "would attach to unrelated pending gift"},
        {"unrelated_joint": "conflict", "late_milestone_separate": True, "old_gift_reopened": False})

    # B17: mode changes matter only through relevant placement/current joint permission.
    w, gift, fulfillment = pair()
    gift_review = w.review((gift,))
    anchor = w.placement[gift]
    w.set_policy(False)
    global_policy_conflict = expect(gift_review.policy_revision != w.policy_revision, True)
    expect(w.placement[gift], anchor)
    expect(w.handle("unaffected-gift", gift_review)[0], "handled")
    expect(fulfillment in w.covered, False)
    deferred, gift, fulfillment = pair()
    joint_review = deferred.review((gift, fulfillment))
    # Policy acceptance precedes asynchronous placement repair in this schedule.
    deferred.combine = False
    deferred.policy_revision += 1
    expect(deferred.handle("stale-joint", joint_review), "conflict")
    expect(deferred.covered, set())
    record("B17", "A policy revision alone does not invalidate unchanged gift handling", {
        "global_policy_revision_would_conflict": global_policy_conflict},
        {"unchanged_gift": "handled", "joint_with_current_Separate_before_repair": "conflict"})

    # B18: present amount above amended terms does not erase a proven milestone.
    proved = Source("pledge-1", "fulfillment", lines=(Line("L", 90, 100),))
    no_money_milestone = replace(proved, money_caused_fulfillment=False)
    unsafe_equality = expect(all(line.received_applied == line.capacity for line in proved.lines), False)
    expect(proved.qualified(), True)
    expect(no_money_milestone.qualified(), False)
    record("B18", "Current amount equality is not the financial domain rule", {
        "equality_rejects_preserved_money_milestone": not unsafe_equality},
        {"qualified_original_proof_with_current_above_terms": True, "reduction_without_money_milestone": False})

    # C01: complete every line using qualified conserved received applications.
    w = World()
    w.sources["pledge-1"] = replace(w.sources["pledge-1"], lines=(Line("A", 7500, 7500), Line("B", 2500, 2500)))
    expect(w.sources["pledge-1"].qualified(), True)
    fulfillment = w.admit("pledge-1")
    expect(fulfillment is not None, True)
    expect(len(w.purposes), 1)
    record("C01", "Whole fixed pledge money fulfillment admits one native purpose", None,
           {"qualified_lines": 2, "fulfillment_purposes": 1}, control=True)

    # C02: routing can change both ways without changing anchor or purpose IDs.
    w, gift, fulfillment = pair()
    anchor, identities = w.placement[gift], set(w.purposes)
    w.set_policy(False)
    expect(w.placement[gift], anchor)
    expect(w.placement[fulfillment] != anchor, True)
    detached_shell = w.placement[fulfillment]
    w.set_policy(True)
    expect(w.placement[gift], anchor)
    expect(w.placement[fulfillment], anchor)
    expect(w.tasks[detached_shell].state, "superseded")
    expect(set(w.purposes), identities)
    expect(w.covered, set())
    revision = w.policy_revision
    w.set_policy(True)
    expect(w.policy_revision, revision)
    record("C02", "Combine, Separate and recombine preserve pending identities", None,
           {"gift_anchor_stable": True, "purpose_count": 2, "coverage": 0, "no_op_revision_changes": 0}, control=True)

    # C03: a deliberate subset leaves the other purpose available in the same task.
    w, gift, fulfillment = pair()
    anchor = w.placement[gift]
    result = w.handle("deliberate-subset", w.review((fulfillment,), outcome="not_needed"))
    expect(result[0:2], ("handled", "not_needed"))
    expect(w.covered, {fulfillment})
    expect(w.placement[gift], anchor)
    expect(w.tasks[anchor].state, "current")
    record("C03", "An explicitly chosen nonempty subset is legitimate", None,
           {"covered_fulfillment": True, "gift_pending": True, "task": "current"}, control=True)

    # C04: one joint command records both purposes and changes no source/interaction fact.
    w, gift, fulfillment = pair()
    source_before, interaction_before = deepcopy(w.sources), w.interactions
    anchor = w.placement[gift]
    receipt = w.handle("both", w.review((gift, fulfillment)))
    expect(receipt[0], "handled")
    expect(w.covered, {gift, fulfillment})
    expect(len(w.receipts), 1)
    expect(w.tasks[anchor].state, "done")
    expect((w.sources, w.interactions), (source_before, interaction_before))
    record("C04", "Exact compatible joint handling records distinct purpose coverage", None,
           {"receipt_count": 1, "covered_purposes": 2, "task": "done", "financial_and_interaction_facts_unchanged": True}, control=True)

    # C05: Separate keeps both eligible and independently handleable.
    w, gift, fulfillment = pair(combine=False)
    expect(w.placement[gift] != w.placement[fulfillment], True)
    expect(w.handle("gift", w.review((gift,)))[0], "handled")
    expect(w.handle("fulfillment", w.review((fulfillment,)))[0], "handled")
    expect(w.covered, {gift, fulfillment})
    record("C05", "Separate changes placement, not eligibility or completion rights", None,
           {"separate_tasks": 2, "independently_handled_purposes": 2}, control=True)

    # C06: the money crossing can be under a valid amended promise's same terms.
    before = Source("pledge-1", "fulfillment", money_caused_fulfillment=False,
                    lines=(Line("L", 90, 80),), causal_gifts=frozenset({"new-gift-10"}))
    after = replace(before, revision=2, money_caused_fulfillment=True, lines=(Line("L", 90, 90),))
    expect(before.qualified(), False)
    expect(after.qualified(), True)
    w = World(sources={"pledge-1": after, "new-gift-10": Source("new-gift-10", "gift")})
    gift, fulfillment = w.admit("new-gift-10"), w.admit("pledge-1")
    expect(w.placement[gift], w.placement[fulfillment])
    record("C06", "A valid amended promise can be completed by later new money", None,
           {"original_promise": 100, "accepted_amended_promise": 90, "money_before": 80,
            "new_applied_money": 10, "qualified_money_milestone": True}, control=True)

    # C07: source correction supplies a current restoring set, preserving purpose.
    w, gift, fulfillment = pair()
    w.handle("original-gift-finished", w.review((gift,)))
    w.sources["pledge-1"] = replace(w.sources["pledge-1"], revision=2, lines=(Line("L", 100, 80),))
    w.reflow()
    w.sources["restoring-gift"] = Source("restoring-gift", "gift")
    restoring = w.admit("restoring-gift")
    w.sources["pledge-1"] = replace(w.sources["pledge-1"], revision=3, lines=(Line("L", 100, 100),),
                                    causal_gifts=frozenset({"restoring-gift"}))
    expect(w.admit("pledge-1", delivery="restored"), fulfillment)
    expect(w.placement[fulfillment], w.placement[restoring])
    expect(w.covered, {gift})
    record("C07", "Current restoring evidence can attach the same unhandled milestone", None,
           {"fulfillment_identity_preserved": True, "current_restoring_gift_joined": True,
            "original_gift_coverage_preserved": True}, control=True)

    output = {
        "evidence_kind": "bounded_stdlib_semantic_counterexamples",
        "decision": "D32 A: one compatible follow-up may show and deliberately handle distinct gift and fixed-pledge-fulfillment purposes",
        "contract_status": "proposed owner amendments illustrated; no implementation or ratification claim",
        "revision_reason": "root audit found retained gift-slot, missing causal gift link, overbroad policy-revision conflict and overly narrow amount equality; initial artifacts are preserved separately",
        "script_sha256": sha256(Path(__file__).read_bytes()).hexdigest(),
        "reproduction": "python3 docs/features/missionary-workspace-depth/grill/d32-evidence/combined-counterexamples.py",
        "counts": {"counterexample_families": sum(case["kind"] == "counterexample" for case in CASES),
                   "positive_controls": sum(case["kind"] == "positive_control" for case in CASES),
                   "passed_outcome_assertions": ASSERTIONS},
        "limitations": [
            "Synthetic inputs only. No application, SQL, live database, provider, network, private data or earlier model/probe was executed.",
            "Pledge line capacities, conserved received applications, original money-caused milestone, current completing/restoring gift set and original-live eligibility are supplied owner facts; no actual financial producer, ledger, refunds, matching or FX is implemented.",
            "Finite sequential schedules assume serialized owner boundaries. They do not prove locks, waits, transaction isolation, database constraints, RLS, durable outbox, crash recovery or real concurrency.",
            "Purpose maps and placement revisions are reasoning variables, not selected schema, a second task engine or an operational implementation.",
            "Authority is abstract current permission and exact scope. Actual role grants, tenant policy storage, denial audit and privacy surfaces are untested.",
            "The single modeled policy is a supplied effective organization setting. Multiple organizations' policy administration, migrations, mixed-version writers, configuration retry and activation are outside this model.",
            "No UI, communication, consent or real interaction command is modeled. Existing interaction and financial fixtures are checked for preservation only.",
            "D20/D32 examples cover selected-purpose versions, placement, exact coverage and recovery; full responsibility lifecycle, Undo, task pagination and partial-disclosure results are not implemented.",
            "Passing assertions establish only these finite modeled outcomes, not runtime producer availability, enforcement, release readiness or production behavior.",
        ],
        "cases": CASES,
    }
    print(json.dumps(output, indent=2, sort_keys=True))


if __name__ == "__main__":
    run()
