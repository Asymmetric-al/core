#!/usr/bin/env python3
"""Finite D36 temporal semantics; synthetic owner inputs, no runtime proof.

The supported range 1..400 below is an explicit toy fixture, never a selected
product bound/default. The adopted review proposal uses exact elapsed days.
"""

from copy import deepcopy
from dataclasses import dataclass, field, replace
from datetime import datetime, timedelta, timezone
from hashlib import sha256
import json
from pathlib import Path
from zoneinfo import ZoneInfo


UTC = timezone.utc
DAY_SECONDS = 86400
UNAVAILABLE = {"outcome": "unavailable"}


def instant(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(UTC)


def stamp(value):
    return value.astimezone(UTC).isoformat()


@dataclass(frozen=True)
class Bounds:
    minimum: int
    maximum: int


TOY_BOUNDS = Bounds(1, 400)


def valid_days(value, bounds):
    return type(value) is int and value > 0 and bounds.minimum <= value <= bounds.maximum


def checked_end(start, days, bounds):
    if not valid_days(days, bounds) or start.tzinfo is None or start.utcoffset() is None:
        return None
    try:
        end = start.astimezone(UTC) + timedelta(seconds=days * DAY_SECONDS)
    except (OverflowError, ValueError):
        return None
    return end if end > start else None


def witness(end, zone):
    if end is None:
        return None
    local = end.astimezone(ZoneInfo(zone))
    return (zone, local.date().isoformat())


@dataclass(frozen=True)
class Policy:
    revision: int = 1  # Stable absence has a revision too.
    days: object = None


@dataclass(frozen=True)
class Cycle:
    ordinal: int
    accepted_at: datetime
    expires_at: datetime
    days: int | None
    policy_revision: int | None


@dataclass(frozen=True)
class Source:
    identity: str = "referral-1"
    revision: int = 1
    ordinary_window: bool = True
    cycles: tuple = (Cycle(1, instant("2025-12-01T00:00:00Z"), instant("2026-01-01T00:00:00Z"), None, None),)
    old_retention_end: datetime = instant("2026-06-01T00:00:00Z")
    old_body_present: bool = False
    contact_consent: bool = False


@dataclass(frozen=True)
class Review:
    actor: str
    path: str
    key: str
    source_identity: str
    source_revision: int
    cycle: int
    period_revision: int
    enable_revision: int
    preview_at: datetime
    preview_end: datetime | None
    display_witness: tuple | None
    override_end: str | None = None  # Adversarial extra input, not a proposed API field.


@dataclass
class World:
    now: datetime
    bounds: Bounds
    display_zone: str
    policy: Policy = field(default_factory=Policy)
    missionary_enabled: bool = False
    enable_revision: int = 1
    source: Source = field(default_factory=Source)
    context_current: bool = True
    action_current: bool = True
    source_action_floor: bool = True
    result_current: bool = True
    # Narrow owner outcome evidence, not a journal or storage prescription.
    outcomes: dict = field(default_factory=dict)
    effects: int = 0

    def configure(self, days):
        # Supplied qualified settings-owner event. Administration is not modeled.
        if not valid_days(days, self.bounds):
            return "invalid"
        if days != self.policy.days or type(days) is not type(self.policy.days):
            self.policy = Policy(self.policy.revision + 1, days)
        return "configured"

    def set_enabled(self, enabled):
        if enabled != self.missionary_enabled:
            self.missionary_enabled = enabled
            self.enable_revision += 1

    def review(self, key="intent-1", actor="maya", path="missionary"):
        end = checked_end(self.now, self.policy.days, self.bounds)
        return Review(actor, path, key, self.source.identity, self.source.revision,
                      self.source.cycles[-1].ordinal, self.policy.revision,
                      self.enable_revision, self.now, end, witness(end, self.display_zone))

    def result(self, body):
        return dict(body) if self.result_current else UNAVAILABLE

    def accept(self, review):
        # Current exact D35/P12 action and target qualification are supplied
        # inputs; this model does not reproduce the full authorization contract.
        if (not self.context_current or review.source_identity != self.source.identity
                or (review.actor, review.path) not in {("maya", "missionary"), ("staff", "staff")}):
            return UNAVAILABLE
        key = (review.actor, review.key)
        prior = self.outcomes.get(key)
        if prior is not None:
            original, body = prior
            if original != review:
                return self.result({"outcome": "conflict", "effect": "none"})
            return self.result(body)
        if not self.action_current or not self.source_action_floor:
            return UNAVAILABLE

        def reject(reason, terminal=False):
            body = {"outcome": "rejected", "effect": "none", "reason": reason}
            if terminal:
                self.outcomes[key] = (review, body)
            return self.result(body)

        if review.path == "missionary":
            if review.enable_revision != self.enable_revision:
                return reject("stale_review")
            if not self.missionary_enabled:
                return reject("unavailable")
        if (review.period_revision != self.policy.revision
                or review.source_revision != self.source.revision
                or review.cycle != self.source.cycles[-1].ordinal):
            return reject("stale_review")
        if review.override_end is not None:
            return reject("unsupported_override", terminal=True)
        if not self.source.ordinary_window or self.now < self.source.cycles[-1].expires_at:
            return reject("unavailable", terminal=True)
        end = checked_end(self.now, self.policy.days, self.bounds)
        if end is None:
            return reject("unqualified_period", terminal=True)
        if witness(end, self.display_zone) != review.display_witness:
            return reject("changed_displayed_terms", terminal=True)

        # The instant is sampled at this abstract acceptance boundary after any
        # waiting. Source/history and outcome acceptance are assumed atomic.
        cycle = Cycle(review.cycle + 1, self.now.astimezone(UTC), end,
                      self.policy.days, self.policy.revision)
        self.source = replace(self.source, revision=self.source.revision + 1,
                              cycles=self.source.cycles + (cycle,))
        self.effects += 1
        body = {"outcome": "accepted", "accepted_cycle": cycle.ordinal,
                "accepted_at": stamp(cycle.accepted_at), "expires_at": stamp(cycle.expires_at),
                "days": cycle.days, "period_revision": cycle.policy_revision}
        self.outcomes[key] = (review, body)
        return self.result(body)

    def read_current(self):
        if not self.result_current:
            return UNAVAILABLE
        cycle = self.source.cycles[-1]
        return {"active": self.source.ordinary_window and cycle.accepted_at <= self.now < cycle.expires_at,
                "expires_at": stamp(cycle.expires_at)}


def fixture(now="2026-01-10T12:00:00Z", days=2, zone="UTC", enabled=True):
    return World(instant(now), TOY_BOUNDS, zone, Policy(1, days), enabled)


ASSERTIONS = 0
CASES = []


def expect(actual, expected):
    global ASSERTIONS
    ASSERTIONS += 1
    if actual != expected:
        raise AssertionError({"actual": actual, "expected": expected})
    return actual


def record(identity, title, unsafe, corrected, schedule=None, control=False):
    row = {"id": identity, "title": title, "kind": "positive_control" if control else "counterexample",
           "unsafe": unsafe, "corrected": corrected}
    if schedule:
        row["schedule"] = schedule
    CASES.append(row)


def run():
    w = fixture()
    review = w.review()
    old_end = w.source.cycles[-1].expires_at
    w.now += timedelta(minutes=5)
    result = w.accept(review)
    expect(result["outcome"], "accepted")
    expect((result["accepted_at"], result["expires_at"]), (stamp(w.now), "2026-01-12T12:05:00+00:00"))
    expect((w.source.cycles[-1].expires_at - w.source.cycles[-1].accepted_at).total_seconds(), 2 * DAY_SECONDS)
    expect(result["expires_at"] != stamp(review.preview_end), True)
    record("B01", "Actual acceptance after waiting anchors the full period", {
        "preview_or_transaction_start_anchor": stamp(review.preview_end),
        "old_expiry_anchor": stamp(old_end + timedelta(days=2))}, result,
        ["review12:00", "wait five minutes", "accept12:05 with unchanged displayed date"])

    w = fixture(now="2026-01-10T23:59:50Z")
    review = w.review()
    w.now += timedelta(seconds=20)
    result = w.accept(review)
    expect((result["reason"], w.effects), ("changed_displayed_terms", 0))
    expect((review.display_witness[1], witness(checked_end(w.now, 2, w.bounds), w.display_zone)[1]),
           ("2026-01-12", "2026-01-13"))
    record("B02", "Crossing the displayed end date requires refreshed terms", "silently accept a different end date", result)
    date_refresh_world = w
    date_refresh_review = review

    dst = {}
    for label, start, unsafe_elapsed in (("spring", "2026-03-07T17:00:00Z", 23 * 3600),
                                          ("fall", "2026-10-31T16:00:00Z", 25 * 3600)):
        w = fixture(now=start, days=1, zone="America/New_York")
        local = w.now.astimezone(ZoneInfo(w.display_zone))
        wall_clock_end = (local + timedelta(days=1)).astimezone(UTC)
        expect((wall_clock_end - w.now).total_seconds(), unsafe_elapsed)
        result = w.accept(w.review())
        expect(result["outcome"], "accepted")
        expect((w.source.cycles[-1].expires_at - w.now).total_seconds(), DAY_SECONDS)
        dst[label] = {"unsafe_wall_clock_elapsed_seconds": unsafe_elapsed,
                      "correct_elapsed_seconds": DAY_SECONDS,
                      "actual_local_end": w.source.cycles[-1].expires_at.astimezone(ZoneInfo(w.display_zone)).isoformat()}
    record("B03", "Adding a local calendar day can produce 23 or 25 elapsed hours", "local datetime plus one day", dst)

    w = fixture(now="2026-03-07T06:59:59Z", days=1, zone="America/New_York")
    review = w.review()
    w.now += timedelta(seconds=2)
    actual_end = checked_end(w.now, 1, w.bounds)
    actual_witness = witness(actual_end, w.display_zone)
    expect(review.display_witness, actual_witness)
    preview_local = review.preview_end.astimezone(ZoneInfo(w.display_zone))
    actual_local = actual_end.astimezone(ZoneInfo(w.display_zone))
    expect((preview_local.utcoffset().total_seconds(), actual_local.utcoffset().total_seconds()), (-18000, -14400))
    stale_offset_rendering = actual_local.replace(tzinfo=timezone(preview_local.utcoffset()))
    expect((stale_offset_rendering.astimezone(UTC) - actual_end).total_seconds(), 3600)
    expect(actual_local.isoformat(), "2026-03-08T03:00:01-04:00")
    offset_world, offset_review = w, review
    w = fixture(zone="Europe/London")
    changed_zone_review = w.review()
    w.display_zone = "Africa/Abidjan"
    expect(changed_zone_review.display_witness[1:], witness(checked_end(w.now, 2, w.bounds), w.display_zone)[1:])
    zone_result = w.accept(changed_zone_review)
    expect((zone_result["reason"], w.effects), ("changed_displayed_terms", 0))
    record("B04", "A preview's cached UTC offset can misstate the actual endpoint by an hour",
           {"stale_offset_rendering": stale_offset_rendering.isoformat()},
           {"actual_time_and_offset_together": actual_local.isoformat(), "same_zone_date_witness": True,
            "different_display_zone_context": zone_result},
           ["preview end01:59:59 EST", "wait two seconds", "computed end03:00:01 EDT"])

    calendar = {}
    for start, expected in (("2028-02-28T15:30:00Z", "2028-02-29T15:30:00+00:00"),
                             ("2026-12-31T23:45:00Z", "2027-01-01T23:45:00+00:00")):
        w = fixture(now=start, days=1)
        result = w.accept(w.review())
        expect(result["expires_at"], expected)
        end = w.source.cycles[-1].expires_at
        midnight = end.replace(hour=0, minute=0, second=0, microsecond=0)
        expect(midnight < end, True)
        calendar[start] = {"unsafe_date_only_endpoint": stamp(midnight), "actual_endpoint": result["expires_at"]}
    record("B05", "Date-only truncation loses part of the promised elapsed period", "end at calendar midnight", calendar)

    invalid = {}
    for label, days in (("missing", None), ("zero", 0), ("negative", -1), ("fraction", 1.5),
                        ("boolean", True), ("string", "2"), ("outside_toy_owner_range", 401)):
        w = fixture(days=days)
        result = w.accept(w.review())
        expect((result["reason"], w.effects), ("unqualified_period", 0))
        invalid[label] = result["reason"]
    record("B06", "Absent, coerced or unsupported periods cannot manufacture a valid window",
           "parse, truncate, default or accept any positive-looking value", invalid)

    w = fixture(now="9999-12-31T12:00:00Z", days=1)
    expect(valid_days(1, w.bounds), True)
    expect(checked_end(w.now, 1, w.bounds), None)
    before = deepcopy(w.source)
    result = w.accept(w.review())
    expect((result["reason"], w.source, w.effects), ("unqualified_period", before, 0))
    record("B07", "A range-valid period still needs checked timestamp representation",
           "clamp, wrap, truncate or store an unrepresentable endpoint", result)

    w = fixture()
    review = w.review()
    expect(w.configure(4), "configured")
    result = w.accept(review)
    expect((result["reason"], w.effects), ("stale_review", 0))
    w = fixture()
    expect(w.accept(w.review())["outcome"], "accepted")
    accepted_source = deepcopy(w.source)
    w.configure(4)
    expect(w.source, accepted_source)
    record("B08", "A changed period fences unaccepted review and never rewrites an accepted cycle",
           "apply latest period to pending command or recompute every current deadline",
           {"before_acceptance": "stale_review", "existing_source_after_edit": "unchanged"})
    prospective_world = w

    w = fixture()
    review = w.review()
    w.configure(4)
    w.configure(2)
    expect(w.policy.days, 2)
    result = w.accept(review)
    expect((result["reason"], w.effects), ("stale_review", 0))
    record("B09", "Period value returning to its old value does not revive the old review", "compare days only", result)

    w = fixture(days=None, enabled=False)
    absent = w.review()
    expect(w.configure(2), "configured")
    expect(w.missionary_enabled, False)
    w.set_enabled(True)
    result = w.accept(absent)
    expect((result["reason"], w.effects), ("stale_review", 0))
    fresh = w.review(key="explicit-after-config-and-enable")
    expect(w.accept(fresh)["outcome"], "accepted")
    enabled_without_period = fixture(days=None)
    missing_period_review = enabled_without_period.review()
    enabled_without_period.configure(2)
    expect(enabled_without_period.enable_revision, missing_period_review.enable_revision)
    period_only = enabled_without_period.accept(missing_period_review)
    expect((period_only["reason"], enabled_without_period.effects), ("stale_review", 0))
    record("B10", "Stable absent-policy review cannot be upgraded by first configure and enable",
           "saving a period enables continuation or fills old request defaults",
           {"period_save_enabled": False, "old_review": "stale_review", "fresh_review": "accepted",
            "period_appears_without_enable_revision_change": "stale_review"})

    w = fixture()
    review = w.review()
    original = w.accept(review)
    w.configure(9)
    w.set_enabled(False)
    w.action_current = False
    w.now = instant(original["expires_at"]) + timedelta(days=1)
    expect(w.accept(review), original)
    expect((w.effects, len(w.source.cycles), w.read_current()["active"]), (1, 2, False))
    w.result_current = False
    expect(w.accept(review), UNAVAILABLE)
    expect(w.effects, 1)
    record("B11", "Lost-response or late-delivery recovery preserves the original endpoint even Off and later expired",
           "anchor a new deadline at retry, webhook delivery or current period",
           {"original_acceptance": original, "effects": 1, "current_active": False, "restricted_recovery": "unavailable"})

    w = fixture()
    expect(w.accept(w.review())["outcome"], "accepted")
    original_source = deepcopy(w.source)
    w.now += timedelta(hours=3)
    unsafe_activity_end = checked_end(w.now, w.policy.days, w.bounds)
    for activity in ("view", "ordinary_edit", "login"):
        expect(w.read_current()["expires_at"], stamp(original_source.cycles[-1].expires_at))
        expect(w.source, original_source)
    expect(unsafe_activity_end > original_source.cycles[-1].expires_at, True)
    expect((w.source.old_retention_end, w.source.old_body_present, w.source.contact_consent),
           (Source().old_retention_end, False, False))
    record("B12", "Ordinary activity does not run a renewed-window clock or restore personal data",
           {"activity_reset_end": stamp(unsafe_activity_end)},
           {"original_end": stamp(original_source.cycles[-1].expires_at), "source_unchanged": True})

    w = fixture()
    w.accept(w.review())
    end = w.source.cycles[-1].expires_at
    w.now = end - timedelta(microseconds=1)
    expect(w.read_current()["active"], True)
    w.now = end
    expect(w.read_current()["active"], False)
    w.now = end + timedelta(microseconds=1)
    expect(w.read_current()["active"], False)
    record("B13", "The exact stored endpoint is exclusive without waiting for a sweep or end of local day",
           "active through equality, local midnight or next sweep", {"before": True, "at": False, "after": False})

    w = fixture()
    review = replace(w.review(), override_end="2027-01-01T00:00:00Z")
    result = w.accept(review)
    expect((result["reason"], w.effects), ("unsupported_override", 0))
    record("B14", "The explanatory endpoint is not caller-supplied date-setting authority",
           "submit the displayed or edited endpoint as the new source deadline", result)

    w = fixture()
    w.source = replace(w.source, cycles=(replace(w.source.cycles[0], expires_at=instant("2026-01-10T12:30:00Z")),))
    review = w.review()
    rejected = w.accept(review)
    expect((rejected["outcome"], w.effects), ("rejected", 0))
    w.now += timedelta(hours=1)
    expect(witness(checked_end(w.now, 2, w.bounds), w.display_zone), review.display_witness)
    unsafe = deepcopy(w)
    unsafe.outcomes.clear()
    expect(unsafe.accept(review)["outcome"], "accepted")
    expect(w.accept(review), rejected)
    expect(w.effects, 0)
    record("B15", "Time-only source expiry cannot upgrade an already rejected intent",
           "forget terminal no-effect, then retry when time makes source eligible",
           {"same_display_terms": True, "old_intent": "rejected", "effects": 0})

    admitted = {}
    for days in (TOY_BOUNDS.minimum, TOY_BOUNDS.maximum):
        w = fixture(days=days)
        result = w.accept(w.review())
        expect(result["outcome"], "accepted")
        expect((w.source.cycles[-1].expires_at - w.source.cycles[-1].accepted_at).total_seconds(), days * DAY_SECONDS)
        admitted[str(days)] = result["expires_at"]
    record("C01", "Explicit toy owner-range endpoints produce exact finite elapsed periods", None,
           {"not_product_bounds": True, "fixture_endpoints": admitted}, control=True)

    w = fixture()
    review = w.review()
    before_revision = w.policy.revision
    w.configure(2)
    expect(w.policy.revision, before_revision)
    w.now += timedelta(seconds=7)
    expect(w.accept(review)["outcome"], "accepted")
    expect(w.source.cycles[-1].accepted_at, w.now)
    record("C02", "No-op save and ordinary seconds of waiting need no extra confirmation", None,
           {"same_revision": True, "actual_acceptance_anchor": True}, control=True)

    w = date_refresh_world
    expect(w.accept(date_refresh_review)["outcome"], "rejected")
    fresh = w.review(key="reviewed-new-displayed-date")
    result = w.accept(fresh)
    expect((result["outcome"], result["expires_at"]), ("accepted", "2026-01-13T00:00:10+00:00"))
    expect(w.accept(date_refresh_review)["outcome"], "rejected")
    record("C03", "Fresh deliberate review can accept changed displayed terms while the old intent stays rejected", None,
           result, control=True)

    missionary = fixture()
    staff = fixture(enabled=False)
    one = missionary.accept(missionary.review())
    two = staff.accept(staff.review(actor="staff", path="staff"))
    expect((one["days"], one["expires_at"]), (two["days"], two["expires_at"]))
    expect((two["outcome"], staff.missionary_enabled), ("accepted", False))
    record("C04", "Ordinary staff and missionary continuation use the same period without coupling staff to missionary On", None,
           {"same_period_and_endpoint": True, "staff_accepted_while_missionary_Off": True}, control=True)

    w = prospective_world
    previous = deepcopy(w.source.cycles[-1])
    w.now = previous.expires_at + timedelta(hours=1)
    result = w.accept(w.review(key="new-cycle-current-period"))
    expect((result["outcome"], result["days"], result["period_revision"]), ("accepted", 4, 2))
    expect(w.source.cycles[-2], previous)
    expect((w.source.cycles[-1].expires_at - w.now).total_seconds(), 4 * DAY_SECONDS)
    record("C05", "A later deliberate cycle captures new policy while the old cycle stays immutable", None,
           {"old_period_days": previous.days, "new_period_days": 4, "old_cycle_unchanged": True}, control=True)

    w, review = offset_world, offset_review
    result = w.accept(review)
    expect((result["outcome"], w.effects), ("accepted", 1))
    expect(result["expires_at"], "2026-03-08T07:00:01+00:00")
    rendered = w.source.cycles[-1].expires_at.astimezone(ZoneInfo(w.display_zone)).isoformat()
    expect(rendered, "2026-03-08T03:00:01-04:00")
    expect((w.source.cycles[-1].expires_at - w.source.cycles[-1].accepted_at).total_seconds(), DAY_SECONDS)
    record("C06", "Ordinary offset advance within the same displayed zone/date accepts with coherent actual rendering", None,
           {"accepted": True, "actual_local_endpoint": rendered, "elapsed_seconds": DAY_SECONDS}, control=True)

    print(json.dumps({
        "evidence_kind": "bounded_stdlib_temporal_semantic_model",
        "decision": "D36 uses the organization's configured finite renewed period, without a per-continuation date override",
        "status": "proposed elapsed-day and temporal owner contract illustration; not ratification or runtime proof",
        "unit": "One elapsed day is exactly 86400 seconds; E is computed from actual authoritative acceptance A after waits in UTC.",
        "bounds": {"fixture_only": True, "minimum": TOY_BOUNDS.minimum, "maximum": TOY_BOUNDS.maximum,
                   "product_default_or_numeric_bounds_selected": False},
        "script_sha256": sha256(Path(__file__).read_bytes()).hexdigest(),
        "reproduction": "python3 docs/features/missionary-workspace-depth/grill/d36-evidence/temporal-counterexamples.py",
        "counts": {"counterexample_families": sum(row["kind"] == "counterexample" for row in CASES),
                   "positive_controls": sum(row["kind"] == "positive_control" for row in CASES),
                   "passed_outcome_assertions": ASSERTIONS},
        "limitations": [
            "Only this new synthetic standard-library model runs; no older model/probe/verifier, app, SQL/RLS, database, provider, network or private data is exercised.",
            "Current action/source/result authority are opaque qualified inputs inherited from D35, not retested P9/P12 producers or a full authorization model.",
            "Ordered acceptance assumes authoritative clock and atomic current facts. Actual lock waits, transaction-start clocks, clock skew/rollback, replicas, concurrency and crash durability are not proved.",
            "The toy integer range 1..400 is not a product limit/default. Actual supported bounds, numeric transport types, settings authority and representable production timestamp domain remain owner qualification work.",
            "Python aware datetime has microsecond precision and no leap-second representation; these examples do not prove production precision, arithmetic, serialization or database timestamp limits.",
            "America/New_York uses the execution environment's IANA zoneinfo data for explicit 2026 examples; no production tzdb version, locale format, timezone preference product or UI witness authenticity is qualified.",
            "Reviewed zone/date are explanatory witness fixtures, never caller authority to write a date. An ordinary offset advance within the same zone/date is accepted and the actual endpoint is rendered with its own offset. Actual UI/accessibility, context binding and late responses are untested.",
            "outcomes is narrow semantic owner evidence, not a table/generic command journal. Terminal evidence persists for this finite run; lawful retirement must retain a non-replay fence and is not implemented here.",
            "Read-only activity examples compare stored facts with an unsafe reset formula; they do not run actual view/edit/login hooks, tasks, consent, grant expiry, retention or external integrations.",
            "Finite examples are not exhaustive scheduling, formal verification, a deployed grant, activation qualification or release readiness.",
        ],
        "cases": CASES,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    run()
