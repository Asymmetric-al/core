#!/usr/bin/env python3
"""Finite D27 design counterexamples; not application, SQL, or runtime tests.

Run from any directory with Python 3.10+; stdout is deterministic JSON. The
abstract Context/Grant/Source/Ticket fields are reasoning variables, NOT a
proposed schema, endpoint, credential, receipt format, or migration. All data is
synthetic. Atomic methods represent required ordering, not real locks.
"""

from copy import deepcopy
from dataclasses import asdict, dataclass, field, replace
from hashlib import sha256
import json
from pathlib import Path


@dataclass(frozen=True)
class Context:
    person: str = "person-maya"
    email: str = "maya@example.invalid"
    tenant: str = "tenant-a"
    ministry: str = "ministry-a"
    assignment: str = "assignment-current"
    generation: int = 2
    active: bool = True

    def scope(self):
        return (self.person, self.tenant, self.ministry, self.assignment, self.generation)


@dataclass
class Grant:
    scope: tuple
    source_id: str = "saved-1"
    historical_read: bool = True
    expires: int = 200
    revoked: bool = False
    depends_on_resumption_policy: bool = True


@dataclass
class Source:
    record_id: str = "saved-1"
    original_author: str = "person-maya"
    original_email: str = "maya@example.invalid"
    tenant: str = "tenant-a"
    ministry: str = "ministry-a"
    origin_assignment: str = "assignment-original"
    origin_generation: int = 1
    created_at: int = 10
    retention_deadline: int = 300
    body_state: str = "ordinary"
    body: str | None = "Historical contact assertion, not freshly verified."
    held_body: str | None = None
    retained_metadata: bool = True
    archived: bool = False
    version: int = 1


@dataclass(frozen=True)
class Ticket:
    scope: tuple
    source_id: str
    source_version: int
    authority_epoch: int
    operation_id: str


@dataclass
class World:
    context: Context = field(default_factory=Context)
    source: Source = field(default_factory=Source)
    now: int = 100
    policy_on: bool = True
    authority_epoch: int = 1
    grants: list = field(default_factory=list)
    # Sets/maps below stand for durable effects, not suggested storage objects.
    inclusions: set = field(default_factory=set)
    receipts: dict = field(default_factory=dict)
    inclusion_writes: int = 0
    live_effects: set = field(default_factory=set)

    def __post_init__(self):
        if not self.grants:
            self.grants = [Grant(self.context.scope())]

    def has_current_history(self):
        c, s = self.context, self.source
        if not c.active or c.person != s.original_author:
            return False
        if (c.tenant, c.ministry) != (s.tenant, s.ministry):
            return False
        if s.body_state != "ordinary" or s.body is None:
            return False
        if self.now >= s.retention_deadline:
            return False
        return any(
            g.scope == c.scope()
            and g.source_id == s.record_id
            and g.historical_read
            and not g.revoked
            and self.now < g.expires
            and (self.policy_on or not g.depends_on_resumption_policy)
            for g in self.grants
        )

    def discover(self):
        # No source IDs, counts, snippets, or existence distinction on denial.
        if not self.has_current_history() or not self.policy_on:
            return {"status": "unavailable"}
        return {"status": "eligible", "records": [self.source.record_id], "count": 1}

    def read_source(self):
        # Independent source authority can remain valid while D27 is off.
        if not self.has_current_history():
            return {"status": "unavailable"}
        return {"status": "readable", "body": self.source.body, "version": self.source.version}

    def prepare(self, operation_id):
        if self.discover()["status"] != "eligible":
            return None
        return Ticket(self.context.scope(), self.source.record_id, self.source.version,
                      self.authority_epoch, operation_id)

    def inclusion_key(self):
        return (self.source.record_id,) + self.context.scope()

    def commit(self, ticket):
        # One abstract atomic section: fence + current source/history decision +
        # effect/receipt. A later implementation must establish this ordering.
        if ticket is None or not self.policy_on or not self.has_current_history():
            return {"status": "unavailable"}
        if ticket.scope != self.context.scope() or ticket.source_id != self.source.record_id:
            return {"status": "unavailable"}
        if (ticket.authority_epoch != self.authority_epoch
                or ticket.source_version != self.source.version):
            return {"status": "reevaluate"}
        receipt_key = (ticket.scope, ticket.operation_id)
        if receipt_key not in self.receipts:
            inclusion = self.inclusion_key()
            if inclusion not in self.inclusions:
                self.inclusions.add(inclusion)
                self.inclusion_writes += 1
            self.receipts[receipt_key] = inclusion
        return self.recover(ticket)

    def recover(self, ticket):
        # A receipt is not permission; current read checks precede result data.
        if (ticket is None or not self.policy_on or not self.has_current_history()
                or ticket.scope != self.context.scope()):
            return {"status": "unavailable"}
        inclusion = self.receipts.get((ticket.scope, ticket.operation_id))
        if inclusion is None or inclusion != self.inclusion_key():
            return {"status": "unavailable"}
        return {"status": "resumed", "record": inclusion[0],
                "assignment": self.context.assignment, "generation": self.context.generation}

    def revoke(self):
        for grant in self.grants:
            grant.revoked = True
        self.authority_epoch += 1

    def set_policy(self, enabled):
        self.policy_on = enabled
        self.authority_epoch += 1

    def change_source(self, *, erased=False):
        self.source.version += 1
        self.source.body = None if erased else "Corrected historical assertion."
        if erased:
            self.source.body_state = "erased"

    def return_active(self, *, explicit=False):
        # D4 is a separate action. Assume separately qualified current D4 write
        # authority for this positive control; D27 does not establish it.
        if (not explicit or not self.has_current_history()
                or self.inclusion_key() not in self.inclusions):
            return {"status": "unavailable"}
        self.source.archived = False
        return {"status": "active"}


ASSERTIONS = 0


def expect(actual, expected, label):
    global ASSERTIONS
    ASSERTIONS += 1
    if actual != expected:
        raise AssertionError(f"{label}: expected {expected!r}; got {actual!r}")


def pair(case_id, name, unsafe, corrected, **details):
    return {"id": case_id, "name": name, "unsafe_observation": unsafe,
            "corrected_observation": corrected, "passed": True, **details}


def unsafe_email_discover(world):
    return [world.source.record_id] if world.context.email == world.source.original_email else []


def unsafe_author_discover(world):
    return [world.source.record_id] if world.context.person == world.source.original_author else []


def unsafe_person_grant_discover(world):
    # Unlike author-only admission, this consults a grant but drops its exact
    # tenant/ministry/assignment/generation binding during the lookup.
    permitted = world.context.person == world.source.original_author and any(
        grant.scope[0] == world.context.person
        and grant.source_id == world.source.record_id
        and grant.historical_read
        and not grant.revoked
        and world.now < grant.expires
        for grant in world.grants
    )
    return [world.source.record_id] if permitted else []


def unsafe_commit_from_ticket(world, ticket):
    # Deliberately missing the commit-time fence and permission recheck.
    world.inclusions.add((ticket.source_id,) + ticket.scope)
    world.inclusion_writes += 1
    return {"status": "resumed", "record": ticket.source_id}


def bad_email():
    w = World(context=replace(Context(), person="unrelated-person"))
    unsafe, safe = unsafe_email_discover(w), w.discover()
    expect(unsafe, ["saved-1"], "email reuse exposes another author's source")
    expect(safe, {"status": "unavailable"}, "canonical author blocks email reuse")
    return pair("B01", "Reused email treated as original authorship", unsafe, safe)


def bad_author_only():
    w = World()
    w.grants = []
    unsafe, safe = unsafe_author_discover(w), w.discover()
    expect(unsafe, ["saved-1"], "authorship-only list exposes existence")
    expect(safe, {"status": "unavailable"}, "history authority before enumeration")
    absent = World()
    absent.grants = []
    absent.source.retained_metadata = False
    absent.source.body_state, absent.source.body = "erased", None
    expect(w.discover(), absent.discover(), "denial does not distinguish body existence")
    return pair("B02", "Canonical author treated as sufficient discovery permission", unsafe, safe)


def bad_scope():
    rows = []
    for field_name, wrong in [("tenant", "tenant-b"), ("ministry", "ministry-b"),
                              ("assignment", "assignment-recreated"), ("generation", 3)]:
        w = World()
        # The grant remains bound to the former context.
        w.context = replace(w.context, **{field_name: wrong})
        unsafe = unsafe_person_grant_discover(w)
        safe = w.discover()
        expect(unsafe, ["saved-1"], f"loose scope exposes {field_name}")
        expect(safe, {"status": "unavailable"}, f"exact {field_name} required")
        rows.append({"changed": field_name, "unsafe": unsafe, "corrected": safe})
    return pair("B03", "Person grant reused across exact context boundaries",
                "source disclosed in all four variants", "all four unavailable", variants=rows)


def bad_retained():
    rows = []
    for body_state in ["hold_only", "erased"]:
        w = World()
        w.source.body_state = body_state
        w.source.body = None
        w.source.held_body = "Restricted evidence bytes" if body_state == "hold_only" else None
        unsafe = [w.source.record_id] if w.source.retained_metadata else []
        safe = w.discover()
        expect(unsafe, ["saved-1"], f"retention metadata exposes {body_state}")
        expect(safe, {"status": "unavailable"}, f"ordinary body excludes {body_state}")
        rows.append({"body_state": body_state, "unsafe": unsafe, "corrected": safe})
    return pair("B04", "Retained evidence mistaken for an ordinarily readable body",
                "metadata yields a resumable item", "both unavailable", variants=rows)


def bad_cache():
    w = World()
    cache = {(w.context.person, w.source.record_id): w.discover()}
    w.context = replace(w.context, generation=3)
    w.authority_epoch += 1
    unsafe = cache[(w.context.person, w.source.record_id)]
    safe = w.discover()
    expect(unsafe["records"], ["saved-1"], "person/source cache survives new activation")
    expect(safe, {"status": "unavailable"}, "fresh generation invalidates old admission")
    return pair("B05", "Discovery cache omits current activation generation", unsafe, safe,
                schedule=["generation 2 discovery cached", "activation becomes generation 3",
                          "old cache read; fresh evaluator denies old grant"])


def bad_clone():
    w = World()
    before = asdict(w.source)
    clone = replace(w.source, record_id="saved-copy", origin_assignment=w.context.assignment,
                    origin_generation=w.context.generation, created_at=w.now)
    unsafe_records = {w.source.record_id: w.source, clone.record_id: clone}
    unsafe = {"record_count": len(unsafe_records), "resumed_record": clone.record_id,
              "origin_assignment": clone.origin_assignment, "created_at": clone.created_at}
    safe = w.commit(w.prepare("resume"))
    expect(unsafe["resumed_record"] == w.source.record_id, False, "clone changes source identity")
    expect(clone.origin_assignment == before["origin_assignment"], False, "clone rebases origin")
    expect(asdict(w.source), before, "resume preserves original source/provenance")
    expect(safe["record"], "saved-1", "same source resumed")
    return pair("B06", "Copy saved preparation into a new source record", unsafe, safe)


def bad_old_inclusion():
    w = World()
    old = (w.source.record_id, w.context.person, w.context.tenant, w.context.ministry,
           w.source.origin_assignment, w.source.origin_generation)
    w.inclusions.add(old)
    # Unsafe id-only lookup reports success without establishing current inclusion.
    unsafe = next(item for item in w.inclusions if item[0] == w.source.record_id)
    expect(unsafe == w.inclusion_key(), False, "old inclusion is not current context")
    safe = w.commit(w.prepare("resume"))
    expect(w.inclusion_key() in w.inclusions, True, "explicit current inclusion established")
    expect(old in w.inclusions, True, "original inclusion not rewritten")
    expect(len(w.inclusions), 2, "historical and current inclusions remain distinct")
    return pair("B07", "Old inclusion reused because record ID matches",
                {"returned_assignment": unsafe[-2], "returned_generation": unsafe[-1]}, safe)


def bad_revival():
    w = World()
    w.source.archived = True
    unsafe = deepcopy(w)
    unsafe.source.archived = False
    unsafe.live_effects.update({"old_share", "coach_grant", "reminder", "scheduled_send",
                                "subscription", "connector", "completed_task", "cancelled_task"})
    safe = w.commit(w.prepare("resume"))
    expect(unsafe.source.archived, False, "automatic return changes archived state")
    expect(len(unsafe.live_effects), 8, "replay revives unrelated effects")
    expect(w.source.archived, True, "resume preserves archived state")
    expect(w.live_effects, set(), "resume restarts no effects")
    return pair("B08", "Resume treated as restore-all or automatic archive return",
                {"archived": unsafe.source.archived, "effects": sorted(unsafe.live_effects)},
                {"result": safe, "archived": w.source.archived, "effects": []})


def bad_retention_reset():
    w = World(now=290)
    w.grants[0].expires = 400
    unsafe = deepcopy(w)
    duration = unsafe.source.retention_deadline - unsafe.source.created_at
    unsafe.source.created_at, unsafe.source.retention_deadline = unsafe.now, unsafe.now + duration
    w.commit(w.prepare("resume"))
    unsafe.now = w.now = 301
    bad, good = unsafe.read_source(), w.read_source()
    expect(bad["status"], "readable", "reset deadline extends access")
    expect(good, {"status": "unavailable"}, "original deadline remains binding")
    expect(w.source.created_at, 10, "creation time preserved")
    expect(w.source.retention_deadline, 300, "retention clock preserved")
    return pair("B09", "Resume resets source retention clock", bad, good,
                deadlines={"unsafe": unsafe.source.retention_deadline, "corrected": 300})


def bad_revoke_race():
    w = World()
    ticket = w.prepare("tab-a")
    w.revoke()
    unsafe = deepcopy(w)
    bad, good = unsafe_commit_from_ticket(unsafe, ticket), w.commit(ticket)
    expect(unsafe.inclusion_writes, 1, "stale precheck writes after revoke")
    expect(good, {"status": "unavailable"}, "revoke-before-commit denies")
    expect(w.inclusion_writes, 0, "fenced write has no effect")
    ordered = World()
    prior = ordered.prepare("tab-a")
    first = ordered.commit(prior)
    ordered.revoke()
    recovery = ordered.recover(prior)
    expect(first["status"], "resumed", "commit-before-revoke can succeed")
    expect(recovery, {"status": "unavailable"}, "later recovery rechecks revoke")
    return pair("B10", "Separate precheck and write permits revoke race", bad, good,
                schedules=[{"order": ["prepare", "revoke", "commit"],
                            "unsafe_writes": 1, "corrected_writes": 0},
                           {"order": ["prepare", "commit", "revoke", "recover"],
                            "commit": first, "recover": recovery}])


def bad_source_race():
    rows = []
    for erased in [False, True]:
        w = World()
        ticket = w.prepare("resume")
        w.change_source(erased=erased)
        unsafe = deepcopy(w)
        bad, good = unsafe_commit_from_ticket(unsafe, ticket), w.commit(ticket)
        expect(bad["status"], "resumed", "stale source ticket applied")
        expect(good["status"], "unavailable" if erased else "reevaluate", "source fence outcome")
        expect(w.inclusion_writes, 0, "source conflict has no effect")
        rows.append({"source_change": "erase" if erased else "correction",
                     "unsafe": bad, "corrected": good, "checked_version": ticket.source_version,
                     "current_version": w.source.version})
    return pair("B11", "Commit ignores a source change after selection",
                "old version resumes in both schedules", "correction reread; erasure denied",
                schedules=rows)


def bad_lost_response():
    w = World()
    first, second = w.prepare("request-one"), w.prepare("request-two")
    unsafe = deepcopy(w)
    # Append-only resume events: same request retry and second tab each repeat effect.
    bad_effects = []
    for ticket in [first, first, second]:
        unsafe_commit_from_ticket(unsafe, ticket)
        bad_effects.append((ticket.operation_id, ticket.source_id))
    w.commit(first)  # committed response is lost before delivery
    # Model process restart: only durable state carries over; no caller reply cache.
    restarted = deepcopy(w)
    replay, other_tab = restarted.commit(first), restarted.commit(second)
    expect(len(bad_effects), 3, "append-only retries produce three effects")
    expect(restarted.inclusion_writes, 1, "durable inclusion deduplicates retries and tabs")
    expect(replay, other_tab, "both operations resolve same current source")
    expect(len(restarted.receipts), 2, "distinct request identities recover same inclusion")
    return pair("B12", "Lost response and second tab repeat an append-only effect",
                {"effect_count": len(bad_effects)},
                {"effect_count": restarted.inclusion_writes, "recovered": replay},
                schedule=["request one commits", "reply lost", "process restart",
                          "request one retries", "request two from another tab commits"])


def bad_policy_reenable():
    rows = []
    for invalidation in ["expired", "revoked"]:
        w = World()
        cached = w.discover()
        w.set_policy(False)
        expect(w.read_source(), {"status": "unavailable"}, "policy off fences dependent reads")
        if invalidation == "expired":
            w.now = w.grants[0].expires
        else:
            w.revoke()
        w.set_policy(True)
        # Unsafe feature toggle restores a cached previous authorization outcome.
        bad, good = cached, w.discover()
        expect(bad["status"], "eligible", "toggle restores invalidated cached grant")
        expect(good, {"status": "unavailable"}, "fresh evaluation does not revive grant")
        rows.append({"invalidation": invalidation, "unsafe": bad, "corrected": good})
    return pair("B13", "Policy re-enable resurrects expired or revoked admission",
                "both cached entries restored", "both unavailable", variants=rows)


def bad_result_recovery():
    rows = []
    for cause in ["revoked", "policy_off", "generation_changed", "source_erased"]:
        w = World()
        ticket = w.prepare("resume")
        stored = w.commit(ticket)
        if cause == "revoked":
            w.revoke()
        elif cause == "policy_off":
            w.set_policy(False)
        elif cause == "generation_changed":
            w.context = replace(w.context, generation=3)
            w.authority_epoch += 1
        else:
            w.change_source(erased=True)
        bad, good = stored, w.recover(ticket)
        expect(bad["record"], "saved-1", "stored response leaks after authority changes")
        expect(good, {"status": "unavailable"}, "recovery checks current authority")
        expect(w.inclusion_writes, 1, "denying recovery does not rewrite committed history")
        rows.append({"changed": cause, "unsafe": bad, "corrected": good})
    return pair("B14", "Durable receipt treated as perpetual result-read permission",
                "stored record/context disclosed in four cases", "four unavailable", variants=rows)


def positive_controls():
    rows = []
    w = World()
    before = asdict(w.source)
    discovery, result = w.discover(), w.commit(w.prepare("resume"))
    expect(discovery, {"status": "eligible", "records": ["saved-1"], "count": 1}, "qualified discovery")
    expect(result["status"], "resumed", "qualified active source resumes")
    expect(asdict(w.source), before, "source author origin body timestamps and state untouched")
    expect(w.live_effects, set(), "no revived work")
    rows.append({"id": "P01", "name": "Qualified original author resumes same active source",
                 "result": result, "source_unchanged": True, "passed": True})

    w = World()
    w.source.archived = True
    resumed = w.commit(w.prepare("resume"))
    expect(w.source.archived, True, "archived source stays archived after resume")
    expect(w.return_active(explicit=False)["status"], "unavailable", "D4 needs deliberate action")
    active = w.return_active(explicit=True)
    expect(active, {"status": "active"}, "independently qualified explicit D4 succeeds")
    expect(w.live_effects, set(), "D4 does not restart work")
    rows.append({"id": "P02", "name": "Archived resume and explicit qualified D4 return are separate",
                 "resume": resumed, "explicit_return": active, "passed": True})

    w = World()
    old_scope = w.context.scope()
    w.context = replace(w.context, assignment="assignment-new", generation=3)
    w.authority_epoch += 1
    expect(w.discover()["status"], "unavailable", "old assignment grant insufficient")
    w.grants.append(Grant(w.context.scope()))
    result = w.commit(w.prepare("fresh"))
    expect(result["assignment"], "assignment-new", "fresh qualified assignment can resume")
    expect(result["generation"], 3, "fresh qualified generation included")
    expect(w.grants[0].scope, old_scope, "old grant not rewritten")
    expect(w.source.origin_assignment, "assignment-original", "origin assignment unchanged")
    rows.append({"id": "P03", "name": "Fresh authority qualifies a new exact assignment and generation",
                 "result": result, "passed": True})

    w = World()
    w.grants.append(Grant(w.context.scope(), depends_on_resumption_policy=False))
    w.set_policy(False)
    expect(w.read_source()["status"], "readable", "independent source authority survives policy off")
    expect(w.discover(), {"status": "unavailable"}, "D27 discovery disabled")
    expect(w.commit(w.prepare("off")), {"status": "unavailable"}, "D27 mutation disabled")
    w.grants[0].revoked = True
    w.set_policy(True)
    result = w.commit(w.prepare("fresh-policy"))
    expect(result["status"], "resumed", "fresh evaluation uses still-valid independent authority")
    expect(w.grants[0].revoked, True, "dependent revoked grant remains revoked")
    rows.append({"id": "P04", "name": "Policy off preserves independent source authority; on evaluates afresh",
                 "off_independent_read": "readable", "off_resumption": "unavailable",
                 "fresh_result": result, "passed": True})

    w = World()
    stale = w.prepare("resume")
    w.change_source()
    expect(w.commit(stale)["status"], "reevaluate", "old version fenced")
    fresh = w.prepare("resume")
    result = w.commit(fresh)
    expect(result["status"], "resumed", "fresh source version may resume")
    expect(w.read_source()["body"], "Corrected historical assertion.", "reads current corrected body")
    w.set_policy(False)
    w.set_policy(True)
    expect(w.commit(fresh)["status"], "reevaluate", "authority epoch fences ABA policy toggle")
    retry = w.commit(w.prepare("resume"))
    expect(retry, result, "fresh authorized retry recovers original durable effect")
    expect(w.inclusion_writes, 1, "source refresh and policy retry keep one effect")
    rows.append({"id": "P05", "name": "Source correction and policy epoch require fresh evaluation",
                 "result": result, "fresh_retry": retry, "effect_count": 1, "passed": True})
    return rows


def main():
    cases = [bad_email(), bad_author_only(), bad_scope(), bad_retained(), bad_cache(),
             bad_clone(), bad_old_inclusion(), bad_revival(), bad_retention_reset(),
             bad_revoke_race(), bad_source_race(), bad_lost_response(),
             bad_policy_reenable(), bad_result_recovery()]
    controls = positive_controls()
    expect(len(cases), 14, "fourteen unsafe alternatives")
    expect(len(controls), 5, "five positive controls")
    output = {
        "evidence_kind": "finite executable design counterexamples, not implementation verification",
        "decision": "D27 proposed qualified resumption of own earlier private preparation",
        "fixture": "synthetic; no database, app, provider, network, or production data access",
        "script_sha256": sha256(Path(__file__).read_bytes()).hexdigest(),
        "reproduce": "python3 docs/features/missionary-workspace-depth/grill/d27-evidence/"
                     "resumption-counterexamples.py > /tmp/d27-resumption-counterexamples.json",
        "summary": {"unsafe_alternatives": len(cases), "positive_controls": len(controls),
                    "assertions_passed": ASSERTIONS, "all_passed": True},
        "limitations": [
            "Explicit finite cases and selected two-operation schedules only; no exhaustive state-space exploration.",
            "Python state transitions do not prove real SQL transactions, row locks, RLS, CAS, cache eviction, or isolation.",
            "Context, grant, inclusion, receipt, epoch and source-version variables are abstract obligations, not a schema proposal.",
            "Current identity and grants are synthetic inputs; no proof of session validation, grant issuance, author binding or administration.",
            "Atomic commit and durable restart are assumptions under test as design requirements; no real crash recovery, WAL, unique constraint or distributed lock is exercised.",
            "Discovery denial compares outward modeled responses only; no timing, query-plan, cross-record count, search-index or client-cache side-channel assessment.",
            "One source and one current actor per case; no field/purpose lattice, independent D4 write-policy implementation or multi-source pagination proof.",
            "Retention times are arbitrary test numbers; no retention duration, hold policy, physical erasure, backup restoration or readability is selected or verified.",
            "Body snapshots represent historical assertions; no contact matching, canonical-person deduplication, correction UI or freshness-validation implementation is exercised.",
            "No source-owner amendment, production permission, shipped behavior or runtime readiness is established by passing this model."
        ],
        "counterexamples": cases,
        "positive_controls": controls,
    }
    print(json.dumps(output, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
