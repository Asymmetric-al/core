#!/usr/bin/env python3
"""Finite D28 retention design examples, not implementation verification.

Python 3.10+. Stdout is deterministic JSON. All identities and time units are
synthetic. These dataclasses are reasoning variables, NOT a database schema,
API, job format or proposed additional retention store. Atomic methods denote
required ordering; they do not implement or test a real transaction/lock.
"""

from copy import deepcopy
from dataclasses import dataclass, field, replace
from hashlib import sha256
import json
import math
from pathlib import Path


# Both branches are tested while the founder clarification remains pending.
# Neither branch is selected by this artifact. They are separate from period
# selection and MUST NOT be inferred from the existence of a finite timer.
RETURN_RULE_OPTIONS = ("qualified_current_source_transition", "departure_deadline_continues")


@dataclass(frozen=True)
class Actor:
    person: str = "maya"
    tenant: str = "tenant-a"
    current_history: bool = True
    generation: int = 2
    can_configure: bool = False
    can_dispose: bool = False
    authorized: bool = True
    epoch: int = 1


@dataclass(frozen=True)
class Period:
    ticks: object
    source_qualified: bool = True

    def valid(self):
        # Technical positivity/finite checks are not legal or product bounds.
        return (type(self.ticks) is int and self.ticks > 0
                and self.source_qualified)


@dataclass
class Policy:
    tenant: str = "tenant-a"
    revision: int = 1
    effective_at: int = 0
    period: Period = field(default_factory=lambda: Period(10))


@dataclass
class Source:
    record_id: str = "private-preparation-1"
    tenant: str = "tenant-a"
    author: str = "maya"
    version: int = 1
    body_stored: bool = True
    hold: bool = False
    tombstone: bool = False
    departed_at: int | None = None
    episode: str | None = None
    departure_policy_revision: int | None = None
    departure_deadline: int | None = None
    departure_timer_applies: bool = False
    included_generation: int | None = None
    # Qualification comes from the ordinary preparation source, not a guessed
    # replacement duration started by return.
    current_source_retention_allows: bool = True
    archived: bool = False
    authored_at: int = 1
    verified_at: int = 2


@dataclass(frozen=True)
class PolicyReview:
    tenant: str
    policy_revision: int
    admin_epoch: int
    proposed: Period
    mode: str = "future_departures_only"


@dataclass(frozen=True)
class Job:
    tenant: str
    source_id: str
    source_version: int
    episode: str | None


@dataclass(frozen=True)
class ResumeIntent:
    tenant: str
    person: str
    generation: int
    actor_epoch: int
    source_version: int


@dataclass
class World:
    now: int = 10
    return_rule: str = "pending"
    policy: Policy = field(default_factory=Policy)
    source: Source = field(default_factory=Source)
    owner: Actor = field(default_factory=Actor)
    admin: Actor = field(default_factory=lambda: Actor(person="admin", can_configure=True))
    worker: Actor = field(default_factory=lambda: Actor(person="worker", can_dispose=True))
    policy_history: list = field(default_factory=list)
    policy_results: dict = field(default_factory=dict)
    policy_writes: int = 0
    dispositions: dict = field(default_factory=dict)
    disposition_writes: int = 0
    resume_writes: int = 0
    outward_effects: list = field(default_factory=list)

    def __post_init__(self):
        if not self.policy_history:
            self.policy_history = [deepcopy(self.policy)]

    def policy_effective_at(self, instant):
        # This small synthetic history is declared complete from its first
        # effective instant. No latest-policy fallback for an unknown past.
        candidates = [p for p in self.policy_history
                      if p.tenant == self.source.tenant and p.effective_at <= instant]
        return max(candidates, key=lambda p: (p.effective_at, p.revision)) if candidates else None

    def depart(self, *, episode, effective_at, authority_confirmed=True):
        # Authority confirms the departure independently of its effective instant.
        # A missing login or client flag supplies neither authoritative fact.
        if not authority_confirmed:
            return "unavailable"
        if effective_at > self.now:
            return "unavailable"
        if self.source.episode == episode:
            return "already_recorded"
        if self.source.episode is not None:
            return "outside_single_episode_model"
        applicable = self.policy_effective_at(effective_at)
        if applicable is None or not applicable.period.valid():
            return "policy_history_unqualified"
        self.source.departed_at = effective_at
        self.source.episode = episode
        self.source.departure_policy_revision = applicable.revision
        self.source.departure_deadline = effective_at + applicable.period.ticks
        self.source.departure_timer_applies = True
        self.source.version += 1
        return "departure_recorded"

    def expired(self):
        return (self.source.departure_timer_applies
                and self.source.departure_deadline is not None
                and self.now >= self.source.departure_deadline)

    def ordinary_read(self, actor):
        s = self.source
        permitted = (actor.authorized and actor.tenant == s.tenant
                     and actor.person == s.author and actor.current_history
                     and s.body_stored and not s.tombstone and not self.expired()
                     and (s.departure_timer_applies or s.current_source_retention_allows))
        return {"status": "readable", "record": s.record_id} if permitted else {"status": "unavailable"}

    def prepare_policy_review(self, actor, proposed):
        if (not actor.authorized or not actor.can_configure
                or actor.tenant != self.policy.tenant or not proposed.valid()):
            return None
        # The token is internal. No body, source identifiers or protected cohort
        # count need appear in policy administration merely to obtain a review.
        return PolicyReview(actor.tenant, self.policy.revision, actor.epoch, proposed)

    def apply_policy(self, actor, review):
        if (review is None or not actor.authorized or not actor.can_configure
                or actor.tenant != self.policy.tenant or review.tenant != actor.tenant
                or review.admin_epoch != actor.epoch):
            return "unavailable"
        # The finite model identifies the exact reviewed intent. A real command
        # needs its qualified idempotency/argument-binding contract; no API or
        # durable receipt format is selected by this tuple.
        intent_key = (review.tenant, actor.person, review.policy_revision,
                      review.proposed.ticks, review.mode)
        if intent_key in self.policy_results:
            return self.policy_results[intent_key]
        if review.policy_revision != self.policy.revision:
            return "review_again"
        if review.mode != "future_departures_only" or not review.proposed.valid():
            return "unqualified_existing_cohort_change"
        # Changing the organization setting never rewrites an existing record's
        # captured policy or deadline in this prospective-only model.
        self.policy.period = review.proposed
        self.policy.revision += 1
        self.policy.effective_at = self.now
        self.policy_history.append(deepcopy(self.policy))
        self.policy_writes += 1
        self.policy_results[intent_key] = "future_policy_changed"
        return "future_policy_changed"

    def queue_job(self):
        return Job(self.source.tenant, self.source.record_id,
                   self.source.version, self.source.episode)

    def run_job(self, actor, job):
        # Abstract atomic boundary includes tenant, deadline, hold and source
        # checks, the disposition effect and durable result evidence.
        if (not actor.authorized or not actor.can_dispose or actor.tenant != self.source.tenant
                or job.tenant != self.source.tenant or job.source_id != self.source.record_id
                or job.episode != self.source.episode):
            return {"status": "unavailable"}
        receipt_key = (job.tenant, job.source_id, job.episode)
        if receipt_key in self.dispositions:
            return self.recover_job(actor, job)
        if job.source_version != self.source.version:
            return {"status": "reevaluate"}
        if not self.expired():
            return {"status": "not_due"}
        if self.source.hold:
            # Ordinary reads are already denied at the deadline. Hold retains
            # bytes as evidence without treating this as completed destruction.
            return {"status": "held_evidence_only"}
        self.source.body_stored = False
        self.source.tombstone = True
        self.source.version += 1
        self.disposition_writes += 1
        self.dispositions[receipt_key] = "body_removed"
        return self.recover_job(actor, job)

    def recover_job(self, actor, job):
        if (not actor.authorized or not actor.can_dispose
                or actor.tenant != self.source.tenant or job.tenant != actor.tenant):
            return {"status": "unavailable"}
        key = (job.tenant, job.source_id, job.episode)
        result = self.dispositions.get(key)
        return {"status": result} if result else {"status": "unavailable"}

    def set_hold(self, enabled):
        self.source.hold = enabled
        self.source.version += 1

    def erase_under_independent_source_rule(self):
        # This models a pre-existing qualified erasure rule, not D28 selecting
        # an erasure right or deleting held evidence.
        if self.source.hold:
            return "held"
        self.source.body_stored = False
        self.source.tombstone = True
        self.source.version += 1
        return "erased"

    def reconcile_restore(self, image):
        # Current monotonic disposition is authoritative over a stale image.
        if self.source.tombstone or self.expired():
            return "ordinary_body_not_restored"
        if (image.tenant != self.source.tenant or image.record_id != self.source.record_id
                or image.version != self.source.version):
            return "source_reconciliation_required"
        return "same_eligible_source"

    def prepare_resume(self, actor):
        if self.ordinary_read(actor)["status"] != "readable":
            return None
        return ResumeIntent(actor.tenant, actor.person, actor.generation,
                            actor.epoch, self.source.version)

    def commit_resume(self, actor, intent):
        if (intent is None or self.ordinary_read(actor)["status"] != "readable"
                or (intent.tenant, intent.person, intent.generation, intent.actor_epoch)
                != (actor.tenant, actor.person, actor.generation, actor.epoch)):
            return {"status": "unavailable"}
        if intent.source_version != self.source.version:
            return {"status": "reevaluate"}
        if self.return_rule == "pending":
            raise RuntimeError("Founder return/disposition decision is pending; do not infer it")
        if (self.return_rule == "qualified_current_source_transition"
                and not self.source.current_source_retention_allows):
            return {"status": "unavailable"}
        if self.source.included_generation != actor.generation:
            self.source.included_generation = actor.generation
            self.resume_writes += 1
            if self.return_rule == "qualified_current_source_transition":
                self.source.departure_timer_applies = False
            elif self.return_rule != "departure_deadline_continues":
                raise RuntimeError("Unknown return rule")
            self.source.version += 1
        return {"status": "resumed", "record": self.source.record_id}


def departed(**kwargs):
    w = World(**kwargs)
    result = w.depart(episode="departure-1", effective_at=10)
    if result != "departure_recorded":
        raise AssertionError(result)
    return w


ASSERTIONS = 0


def expect(actual, expected, label):
    global ASSERTIONS
    ASSERTIONS += 1
    if actual != expected:
        raise AssertionError(f"{label}: expected {expected!r}; got {actual!r}")


def case(cid, name, unsafe, corrected, **details):
    return {"id": cid, "name": name, "unsafe_observation": unsafe,
            "corrected_observation": corrected, "passed": True, **details}


def bad_inactivity_trigger():
    w = World()
    # Unsafe: manufacture departure from a missing login at time 10.
    unsafe_deadline = w.now + w.policy.period.ticks
    good = w.depart(episode="guessed", effective_at=w.now, authority_confirmed=False)
    expect(good, "unavailable", "unconfirmed departure rejected")
    expect(w.source.departure_deadline, None, "missing login creates no countdown")
    return case("B01", "Missing login or a caller flag starts departure retention",
                {"invented_deadline": unsafe_deadline}, {"status": good, "deadline": None})


def bad_unqualified_period():
    rows = []
    for label, period in [("missing", Period(None)), ("infinity", Period(math.inf)),
                          ("NaN", Period(math.nan)), ("zero", Period(0)),
                          ("negative", Period(-1)), ("boolean", Period(True)),
                          ("unqualified finite", Period(10, source_qualified=False))]:
        w = World()
        # Unsafe fallback treats malformed/missing configuration as retain forever.
        unsafe = "retain_indefinitely" if not period.valid() else "configured"
        good = w.prepare_policy_review(w.admin, period)
        expect(unsafe, "retain_indefinitely", f"bad fallback for {label}")
        expect(good, None, f"{label} cannot create supported finite policy")
        rows.append({"input": label, "unsafe": unsafe, "corrected": "unqualified"})
    return case("B02", "Invalid or unsupported period silently becomes indefinite retention",
                "seven invalid policies fall back to infinity", "seven fail qualification", variants=rows)


def bad_privileged_tenant():
    w = departed()
    foreign_admin = replace(w.admin, tenant="tenant-b")
    foreign_worker = replace(w.worker, tenant="tenant-b")
    # Unsafe privileged paths consult only the operation capability.
    bad_config = foreign_admin.can_configure
    bad_read = w.admin.can_configure and w.source.body_stored
    w.now = 20
    bad_dispose = foreign_worker.can_dispose
    expect(bad_config, True, "foreign admin capability alone would configure")
    expect(bad_read, True, "configuration mistaken for private read")
    expect(bad_dispose, True, "privileged worker would cross tenant")
    expect(w.prepare_policy_review(foreign_admin, Period(5)), None, "tenant bound admin")
    expect(w.ordinary_read(w.admin), {"status": "unavailable"}, "admin gains no author body access")
    expect(w.run_job(foreign_worker, w.queue_job()), {"status": "unavailable"}, "worker tenant enforced")
    expect(w.source.body_stored, True, "foreign worker has no destructive effect")
    return case("B03", "Privileged configuration or worker capability bypasses tenant and body boundaries",
                {"foreign_config": bad_config, "admin_body": bad_read, "foreign_disposal": bad_dispose},
                {"foreign_config": "unavailable", "admin_body": "unavailable", "foreign_disposal": "unavailable"})


def bad_purge_lag():
    rows = []
    for now in [20, 21, 1000]:
        w = departed(now=now)
        bad = "readable" if w.source.body_stored else "unavailable"
        good = w.ordinary_read(w.owner)
        expect(bad, "readable", "physical-body predicate leaks during purge lag")
        expect(good, {"status": "unavailable"}, "deadline enforced independently of deletion")
        expect(w.source.body_stored, True, "fixture intentionally leaves bytes pending")
        rows.append({"now": now, "deadline": 20, "unsafe": bad, "corrected": good})
    return case("B04", "Only the purge job makes a body unavailable",
                "readable at and after deadline", "deadline denies despite delayed job", timeline=rows)


def bad_silent_shorten():
    w = departed(now=16)
    review = w.prepare_policy_review(w.admin, Period(5))
    w.apply_policy(w.admin, review)
    # Unsafe readers recompute every past departure from the latest setting.
    recomputed = w.source.departed_at + w.policy.period.ticks
    bad = "expired" if w.now >= recomputed else "readable"
    good = w.ordinary_read(w.owner)
    expect(bad, "expired", "silent policy rewrite expires existing source")
    expect(good["status"], "readable", "prospective change preserves existing deadline")
    expect(w.source.departure_deadline, 20, "old deadline stays captured")
    unreviewed = w.apply_policy(w.admin, None)
    expect(unreviewed, "unavailable", "policy mutation requires qualified impact review")
    return case("B05", "Shorter new policy silently rewrites existing departure deadlines",
                {"recomputed_deadline": recomputed, "status": bad},
                {"captured_deadline": 20, "status": good["status"]},
                scope="Prospective-only period edits; existing-cohort change is not enabled by this model")


def bad_extension_resurrection():
    w = departed(now=21)
    w.apply_policy(w.admin, w.prepare_policy_review(w.admin, Period(100)))
    bad_deadline = w.source.departed_at + w.policy.period.ticks
    bad = "readable" if w.source.body_stored and w.now < bad_deadline else "unavailable"
    good = w.ordinary_read(w.owner)
    expect(bad, "readable", "longer current policy revives expired stored body")
    expect(good, {"status": "unavailable"}, "new policy cannot extend existing deadline")
    expect(w.source.departure_policy_revision, 1, "origin policy binding remains")
    return case("B06", "Lengthening policy revives expired content awaiting physical purge",
                {"deadline": bad_deadline, "status": bad}, {"deadline": 20, "result": good})


def bad_stale_review():
    rows = []
    for change in ["policy_revision", "admin_revocation", "admin_epoch"]:
        w = departed()
        review = w.prepare_policy_review(w.admin, Period(5))
        if change == "policy_revision":
            w.apply_policy(w.admin, w.prepare_policy_review(w.admin, Period(7)))
        elif change == "admin_revocation":
            w.admin = replace(w.admin, authorized=False, epoch=2)
        else:
            w.admin = replace(w.admin, epoch=2)
        before = w.policy.period.ticks
        # Unsafe UI submits a once-approved preview without present fencing.
        bad_period = review.proposed.ticks
        good = w.apply_policy(w.admin, review)
        expect(bad_period, 5, "stale reviewed proposal would overwrite")
        expect(good, "review_again" if change == "policy_revision" else "unavailable", "stale review fenced")
        expect(w.policy.period.ticks, before, "rejected preview changes no policy")
        rows.append({"intervening_change": change, "unsafe_period": bad_period,
                     "corrected": good, "retained_period": before})
    return case("B07", "An old impact preview is treated as permanent mutation authority",
                "three stale proposals accepted", "three stale proposals fenced", schedules=rows)


def bad_hold_read():
    w = departed(now=20)
    w.set_hold(True)
    job = w.run_job(w.worker, w.queue_job())
    bad = "readable" if w.source.hold and w.source.body_stored else "unavailable"
    good = w.ordinary_read(w.owner)
    expect(job, {"status": "held_evidence_only"}, "hold preserves bytes")
    expect(bad, "readable", "hold override would disclose expired body")
    expect(good, {"status": "unavailable"}, "hold supplies no ordinary access")
    w.set_hold(False)
    expect(w.ordinary_read(w.owner), {"status": "unavailable"}, "hold release does not revive access")
    return case("B08", "A hold extends ordinary preparation access",
                bad, good, after_hold_release="unavailable", bytes_preserved=True)


def bad_stale_hold_job():
    w = departed(now=20)
    queued = w.queue_job()
    w.set_hold(True)
    # Unsafe worker executes its queued pre-hold delete instruction blindly.
    unsafe = deepcopy(w)
    unsafe.source.body_stored = False
    good = w.run_job(w.worker, queued)
    expect(unsafe.source.body_stored, False, "stale job destroys held evidence")
    expect(good, {"status": "reevaluate"}, "changed hold/source version fences stale job")
    fresh = w.run_job(w.worker, w.queue_job())
    expect(fresh, {"status": "held_evidence_only"}, "fresh job honors current hold")
    expect(w.source.body_stored, True, "held bytes remain")
    return case("B09", "A queued purge ignores a subsequently applied hold",
                {"body_stored": False}, {"stale_job": good, "fresh_job": fresh, "body_stored": True},
                schedule=["queue job", "apply hold", "execute queued job", "re-evaluate current hold"])


def bad_duplicate_job():
    w = departed(now=20)
    job = w.queue_job()
    bad_effects = []
    for _ in range(3):
        # Unsafe append-only completion records/restarted side effects.
        bad_effects.append("disposal_and_notification")
    w.run_job(w.worker, job)  # response lost
    restarted = deepcopy(w)  # only modeled durable state survives
    first_retry = restarted.run_job(restarted.worker, job)
    second_retry = restarted.run_job(restarted.worker, job)
    expect(len(bad_effects), 3, "duplicate jobs repeat completion effects")
    expect(restarted.disposition_writes, 1, "one durable body disposition")
    expect(first_retry, second_retry, "lost response recovers same result")
    expect(restarted.outward_effects, [], "disposition schedules no sharing or sending")
    restarted.worker = replace(restarted.worker, authorized=False, epoch=2)
    recovery = restarted.recover_job(restarted.worker, job)
    expect(recovery, {"status": "unavailable"}, "job recovery checks current authority")
    policy_world = departed()
    review = policy_world.prepare_policy_review(policy_world.admin, Period(7))
    unsafe_policy = deepcopy(policy_world)
    for _ in range(3):
        unsafe_policy.policy.period = review.proposed
        unsafe_policy.policy.revision += 1
        unsafe_policy.policy_writes += 1
    expect(unsafe_policy.policy_writes, 3, "unconditional policy retry creates three effects")
    policy_first = policy_world.apply_policy(policy_world.admin, review)  # reply lost
    policy_restart = deepcopy(policy_world)
    policy_retry = policy_restart.apply_policy(policy_restart.admin, review)
    expect(policy_retry, policy_first, "same reviewed policy intent recovers accepted result")
    expect(policy_restart.policy_writes, 1, "lost policy response does not create another revision")
    expect(policy_restart.policy.revision, 2, "accepted prospective revision remains exact")
    policy_restart.admin = replace(policy_restart.admin, authorized=False, epoch=2)
    expect(policy_restart.apply_policy(policy_restart.admin, review), "unavailable", "policy result recovery checks current admin authority")
    return case("B10", "Duplicate jobs and lost responses repeat disposal or policy effects",
                {"disposal_effect_count": len(bad_effects), "policy_writes": unsafe_policy.policy_writes,
                 "policy_revision": unsafe_policy.policy.revision},
                {"effect_count": restarted.disposition_writes, "retry": first_retry,
                 "after_worker_revocation": recovery, "policy_writes": policy_restart.policy_writes,
                 "policy_revision": policy_restart.policy.revision, "policy_retry": policy_retry},
                schedule=["job commits", "response lost", "modeled process restart", "two retries"])


def bad_cache():
    rows = []
    for reason in ["deadline", "history_revoked", "tenant_changed"]:
        w = departed(now=19)
        cache = w.ordinary_read(w.owner)
        if reason == "deadline":
            w.now = 20
        elif reason == "history_revoked":
            w.owner = replace(w.owner, current_history=False, epoch=2)
        else:
            w.owner = replace(w.owner, tenant="tenant-b", epoch=2)
        bad, good = cache, w.ordinary_read(w.owner)
        expect(bad["status"], "readable", "TTL cache retains former response")
        expect(good, {"status": "unavailable"}, "current authority and deadline invalidate payload")
        rows.append({"change": reason, "unsafe": bad, "corrected": good})
    return case("B11", "Cached readable result outlives deadline or authority",
                "three obsolete payloads replayed", "three current reads unavailable", variants=rows)


def bad_restore():
    w = departed(now=15)
    image = deepcopy(w.source)
    w.erase_under_independent_source_rule()
    unsafe = deepcopy(w)
    unsafe.source = image
    bad = unsafe.ordinary_read(unsafe.owner)
    reconciliation = w.reconcile_restore(image)
    good = w.ordinary_read(w.owner)
    expect(bad["status"], "readable", "stale image loses newer disposition tombstone")
    expect(reconciliation, "ordinary_body_not_restored", "restore respects current tombstone")
    expect(good, {"status": "unavailable"}, "restoration does not revive erased body")
    expect(w.source.body_stored, False, "rejected body is not rematerialized")
    return case("B12", "Backup restoration overwrites a later source erasure tombstone",
                bad, good, restore_result=reconciliation,
                note="The independent erasure obligation is a synthetic already-qualified source rule, not a new D28 right")


def bad_expiry_resume_race():
    w = departed(now=19)
    intent = w.prepare_resume(w.owner)
    w.now = 20
    # Unsafe commit relies only on eligibility when the user opened the entry.
    bad = "resumed" if intent else "unavailable"
    good = w.commit_resume(w.owner, intent)
    expect(bad, "resumed", "selection before expiry is not a reservation")
    expect(good, {"status": "unavailable"}, "deadline wins when ordered before acceptance")
    expect(w.resume_writes, 0, "expired intent has no inclusion effect")
    return case("B13", "Return selection before expiry reserves content past its deadline",
                bad, good, schedule=["select at tick 19", "deadline tick 20", "attempt Resume"])


def bad_resume_reset():
    rows = []
    for rule in RETURN_RULE_OPTIONS:
        w = departed(now=19, return_rule=rule)
        before = (w.source.departed_at, w.source.departure_deadline,
                  w.source.authored_at, w.source.verified_at)
        unsafe = deepcopy(w)
        unsafe.source.departed_at = unsafe.now
        unsafe.source.departure_deadline = unsafe.now + unsafe.policy.period.ticks
        unsafe.source.authored_at = unsafe.source.verified_at = unsafe.now
        good = w.commit_resume(w.owner, w.prepare_resume(w.owner))
        after = (w.source.departed_at, w.source.departure_deadline,
                 w.source.authored_at, w.source.verified_at)
        expect(unsafe.source.departure_deadline, 29, "naive resume restarts departure duration")
        expect(after, before, "resume never rewrites origin clock or freshness evidence")
        expect(good["status"], "resumed", "qualified pre-expiry return accepted")
        rows.append({"hypothetical_return_rule": rule, "result": good,
                     "departure_deadline_evidence": w.source.departure_deadline,
                     "departure_timer_applies": w.source.departure_timer_applies,
                     "authored_at": w.source.authored_at, "verified_at": w.source.verified_at})
    return case("B14", "Resume restarts the departure period and makes old claims look new",
                {"departure_deadline": 29, "authored_at": 19, "verified_at": 19},
                "Neither hypothetical return branch resets departure/freshness evidence",
                hypothetical_branches=rows)


def bad_late_departure_policy():
    rows = []
    for edit, now, period, unsafe_status, safe_status in [
            ("longer", 30, 100, "readable", "unavailable"),
            ("shorter", 15, 1, "unavailable", "readable")]:
        w = World(now=now)
        w.apply_policy(w.admin, w.prepare_policy_review(w.admin, Period(period)))
        # Both processors receive a legitimate event late: its authoritative
        # departure was tick 10, before the new policy became effective.
        unsafe = deepcopy(w)
        unsafe.source.departed_at = 10
        unsafe.source.episode = "late-departure"
        unsafe.source.departure_policy_revision = unsafe.policy.revision
        unsafe.source.departure_deadline = 10 + unsafe.policy.period.ticks
        unsafe.source.departure_timer_applies = True
        recorded = w.depart(episode="late-departure", effective_at=10)
        bad, good = unsafe.ordinary_read(unsafe.owner), w.ordinary_read(w.owner)
        expect(recorded, "departure_recorded", "known historical policy qualifies late event")
        expect(bad["status"], unsafe_status, "today's period changes historical retention")
        expect(good["status"], safe_status, "departure-time policy determines current expiry")
        expect(w.source.departure_policy_revision, 1, "bind policy effective at authoritative departure")
        expect(w.source.departure_deadline, 20, "late arrival does not move deadline")
        rows.append({"new_policy": edit, "departure_at": 10, "received_at": now,
                     "new_policy_effective_at": w.policy.effective_at,
                     "unsafe": {"revision": unsafe.source.departure_policy_revision,
                                "deadline": unsafe.source.departure_deadline, "read": bad},
                     "corrected": {"revision": w.source.departure_policy_revision,
                                   "deadline": w.source.departure_deadline, "read": good}})
    return case("B15", "Late authoritative departure is bound to today's policy instead of its effective historical revision",
                "longer edit revives; shorter edit prematurely expires",
                "both bind revision 1 and deadline 20", schedules=rows)


def positive_controls():
    rows = []
    w = departed(now=19)
    deadline = w.source.departure_deadline
    expect(w.depart(episode="departure-1", effective_at=19), "already_recorded", "duplicate departure is same episode")
    expect(w.source.departure_deadline, deadline, "duplicate event never moves trigger")
    expect(w.ordinary_read(w.owner)["status"], "readable", "qualified owner can read before expiry")
    w.now = 20
    expect(w.ordinary_read(w.owner)["status"], "unavailable", "inclusive expiry boundary")
    rows.append({"id": "P01", "name": "Confirmed departure captures one deadline; exact boundary denies",
                 "deadline": deadline, "at_deadline": "unavailable", "passed": True})

    w = departed()
    old = (w.source.departure_policy_revision, w.source.departure_deadline)
    result = w.apply_policy(w.admin, w.prepare_policy_review(w.admin, Period(7)))
    future = World(now=30, policy=deepcopy(w.policy))
    future.depart(episode="future-departure", effective_at=30)
    expect(result, "future_policy_changed", "reviewed prospective policy change")
    expect((w.source.departure_policy_revision, w.source.departure_deadline), old, "existing binding stable")
    expect(future.source.departure_deadline, 37, "new departure uses newly qualified period")
    expect(future.source.departure_policy_revision, 2, "new departure records current policy revision")
    rows.append({"id": "P02", "name": "Reviewed policy revision applies to future confirmed departures",
                 "existing_deadline": old[1], "future_deadline": 37, "passed": True})

    w = departed(now=20)
    w.set_hold(True)
    expect(w.run_job(w.worker, w.queue_job())["status"], "held_evidence_only", "hold blocks destruction")
    expect(w.ordinary_read(w.owner)["status"], "unavailable", "held body never ordinary after expiry")
    w.set_hold(False)
    result = w.run_job(w.worker, w.queue_job())
    expect(result, {"status": "body_removed"}, "release allows still-due qualified disposal")
    expect(w.source.body_stored, False, "held expired body removed after release")
    rows.append({"id": "P03", "name": "Hold preserves evidence; release resumes due disposition without access revival",
                 "result": result, "passed": True})

    w = departed(now=19)
    job = w.queue_job()
    expect(w.run_job(w.worker, job), {"status": "not_due"}, "early queue is not expiry authority")
    w.now = 20
    first = w.run_job(w.worker, job)
    repeat = w.run_job(w.worker, job)
    expect(first, {"status": "body_removed"}, "due body disposed")
    expect(repeat, first, "duplicate recovers same completed effect")
    expect(w.disposition_writes, 1, "one durable disposition effect")
    rows.append({"id": "P04", "name": "Early job is harmless; deadline job and duplicate have one effect",
                 "result": first, "writes": w.disposition_writes, "passed": True})

    branches = []
    for rule in RETURN_RULE_OPTIONS:
        w = departed(now=19, return_rule=rule)
        w.source.archived = True
        before = deepcopy(w.source)
        queued_before_return = w.queue_job()
        result = w.commit_resume(w.owner, w.prepare_resume(w.owner))
        expect(result["status"], "resumed", "pre-expiry qualified Resume")
        expect(w.source.record_id, before.record_id, "same source remains")
        expect(w.source.archived, True, "archive state stays independent")
        expect(w.source.departure_deadline, before.departure_deadline, "original deadline evidence retained")
        w.now = 20
        expected_read = "readable" if rule == "qualified_current_source_transition" else "unavailable"
        expect(w.ordinary_read(w.owner)["status"], expected_read, "hypothetical return rule controls subsequent eligibility")
        expect(w.run_job(w.worker, queued_before_return), {"status": "reevaluate"}, "old departure job rechecks changed source after return")
        if rule == "qualified_current_source_transition":
            expect(w.run_job(w.worker, w.queue_job()), {"status": "not_due"}, "departure job no longer governs current source")
            w.source.current_source_retention_allows = False
            expect(w.ordinary_read(w.owner), {"status": "unavailable"}, "ordinary source retention still applies")
            unqualified = departed(now=19, return_rule=rule)
            unqualified.source.current_source_retention_allows = False
            denial = unqualified.commit_resume(unqualified.owner, unqualified.prepare_resume(unqualified.owner))
            expect(denial, {"status": "unavailable"}, "current-work retention qualification required before ending departure timer")
            expect(unqualified.source.departure_timer_applies, True, "unqualified current source cannot cancel departure obligation")
        else:
            expect(w.run_job(w.worker, w.queue_job()), {"status": "body_removed"}, "continuing-deadline branch still disposes resumed source when due")
        expect(w.outward_effects, [], "return restarts no independent effect")
        branches.append({"hypothetical_return_rule": rule, "result": result,
                         "read_at_old_deadline": expected_read,
                         "original_deadline_evidence": before.departure_deadline})
    rows.append({"id": "P05", "name": "Qualified pre-expiry return exposes the explicit choice between two disposition rules",
                 "hypothetical_branches": branches, "neither_branch_selected_by_this_model": True,
                 "passed": True})

    w = World(now=15)
    w.apply_policy(w.admin, w.prepare_policy_review(w.admin, Period(1)))
    expect(w.depart(episode="late-departure", effective_at=10), "departure_recorded", "known late event accepted")
    expect(w.source.departure_policy_revision, 1, "late departure binds known original policy")
    expect(w.source.departure_deadline, 20, "late departure preserves original deadline")
    expect(w.ordinary_read(w.owner)["status"], "readable", "earlier qualified duration still applies")
    expect(w.depart(episode="late-departure", effective_at=10), "already_recorded", "late-event replay is idempotent")
    unknown = World(now=30, policy=Policy(revision=7, effective_at=20, period=Period(5)))
    denial = unknown.depart(episode="unknown-past", effective_at=10)
    expect(denial, "policy_history_unqualified", "missing history does not borrow current policy")
    expect(unknown.source.departure_deadline, None, "unknown historical policy invents no timer")
    rows.append({"id": "P06", "name": "Known late departure uses historical policy; unknown historical coverage fails qualification",
                 "known_policy_revision": 1, "known_deadline": 20,
                 "unknown_history_result": denial, "passed": True})
    return rows


def main():
    cases = [bad_inactivity_trigger(), bad_unqualified_period(), bad_privileged_tenant(),
             bad_purge_lag(), bad_silent_shorten(), bad_extension_resurrection(),
             bad_stale_review(), bad_hold_read(), bad_stale_hold_job(), bad_duplicate_job(),
             bad_cache(), bad_restore(), bad_expiry_resume_race(), bad_resume_reset(),
             bad_late_departure_policy()]
    controls = positive_controls()
    expect(len(cases), 15, "fifteen unsafe alternatives")
    expect(len(controls), 6, "six positive controls")
    output = {
        "evidence_kind": "finite executable design counterexamples, not implementation verification",
        "decision": "D28 organization-set finite departure retention; no numeric period selected",
        "return_rule_status": "founder clarification pending; both branches are hypothetical and neither is selected here",
        "hypothetical_return_rules": list(RETURN_RULE_OPTIONS),
        "period_change_rule": "proposed qualified prospective revisions only; existing-cohort changes are not enabled or selected by this model",
        "time_units": "arbitrary synthetic ticks; no legal duration, product default, bound or purge SLA",
        "script_sha256": sha256(Path(__file__).read_bytes()).hexdigest(),
        "reproduce": "python3 docs/features/missionary-workspace-depth/grill/d28-evidence/retention-counterexamples.py > /tmp/d28-retention-counterexamples.json",
        "summary": {"unsafe_alternatives": len(cases), "positive_controls": len(controls),
                    "assertions_passed": ASSERTIONS, "all_passed": True},
        "limitations": [
            "Synthetic finite cases and selected schedules only; not exhaustive model checking, real concurrency, SQL, RLS, locks, CAS or production proof.",
            "No application, schema, database, provider, network or real private data is accessed; dataclasses are not proposed schema or APIs.",
            "Periods and instants are arbitrary integer ticks; timezone, leap-calendar, clock synchronization, supported product durations and legal limits are not tested or selected.",
            "Qualified departure, history authority, policy administration, holds and source erasure are assumed input authorities; their real issuance and identity binding are not proven.",
            "Policy history is a tiny synthetic timeline with known effective instants and revision ordering; no actual departure producer, historical policy coverage, timestamp authenticity or event-time correction is tested.",
            "Atomic transitions, durable disposition evidence and restart persistence are abstract requirements, not demonstrated transactions, durable queues, WAL or crash recovery.",
            "Policy review proves revision/authority fencing and prospective scope only; no real UI impact preview, user comprehension or authorization to disclose aggregate counts is established.",
            "One source and one departure episode per world; later genuine departures, multiple records, partial batch failures and independent CRM/financial data are outside this model.",
            "Current-source retention after qualified return is an externally qualified predicate, not a newly selected duration or proof of indefinite retention.",
            "Hold and tombstone values represent authoritative obligations; physical bytes, backups, replicas, derivatives, exports, indexes and irreversible purge completeness are not inspected.",
            "Cached response checks show current logical denial; no browser eviction, offline erasure, timing side-channel resistance or recall of previously viewed content is proven.",
            "Passing this model establishes no shipped feature, source-owner amendment, runtime readiness or production permission."
        ],
        "counterexamples": cases,
        "positive_controls": controls,
    }
    print(json.dumps(output, indent=2, sort_keys=True, allow_nan=False))


if __name__ == "__main__":
    main()
