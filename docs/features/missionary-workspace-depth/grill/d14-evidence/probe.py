#!/usr/bin/env python3
"""Disposable D14 design model. No DB, provider, network, credentials or app code."""

from __future__ import annotations

import hashlib
import json
import platform
from dataclasses import dataclass, field
from datetime import UTC, date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo


class Blocked(Exception):
    pass


def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


@dataclass(frozen=True)
class CopyKey:
    tenant: str = "tenant-a"
    actor: str = "missionary-a"
    appointment: str = "appointment-a"
    provider: str = "synthetic"
    account: str = "account-a"
    calendar: str = "calendar-a"
    purpose: str = "personal-appointment-copy"


@dataclass
class Operation:
    identity: str
    key: CopyKey
    kind: str
    source_revision: int
    connection_generation: int
    payload_digest: str
    remote_id: str | None
    outcome: str = "in_flight"
    accepted_remote_id: str | None = None


@dataclass
class Copy:
    identity: str
    key: CopyKey
    payload_digest: str
    source_revision: int = 1
    desired_present: bool = True
    opted_in: bool = True
    remote_id: str | None = None
    synced_revision: int | None = None
    cleanup_required: bool = False
    cleanup_authorized: bool = False
    operations: dict[str, Operation] = field(default_factory=dict)


class Model:
    """Single-threaded protocol assumptions; a claim represents dispatch admission.

    An admitted operation may complete externally after a later local fence.
    This model does not claim to stop network effects already in flight.
    """

    def __init__(self):
        self.context = ("tenant-a", "missionary-a")
        self.destination = ("synthetic", "account-a", "calendar-a")
        self.generation = 1
        self.connected = True
        self.source_access = True
        self.copies: dict[CopyKey, Copy] = {}
        self.remote: dict[str, str] = {}
        self.remote_creates = 0

    def checked(self, key: CopyKey):
        if (key.tenant, key.actor) != self.context:
            raise Blocked("wrong tenant or actor")
        if (key.provider, key.account, key.calendar) != self.destination:
            raise Blocked("wrong exact destination")

    def add(self, key=CopyKey(), request_key="request-a", payload="generic appointment"):
        self.checked(key)
        if not self.connected or not self.source_access:
            raise Blocked("no current admission")
        # Caller request key is not the business identity. No credentials in key.
        _ = request_key
        if key in self.copies:
            return self.copies[key]
        identity = digest(json.dumps(key.__dict__, sort_keys=True))[:24]
        copy = Copy(identity, key, digest(payload))
        self.copies[key] = copy
        return copy

    def update_source(self, copy: Copy, payload: str):
        self.checked(copy.key)
        if not self.source_access or not copy.desired_present:
            raise Blocked("source update not admitted")
        copy.source_revision += 1
        copy.payload_digest = digest(payload)
        copy.synced_revision = None

    def cancel(self, copy: Copy):
        self.checked(copy.key)
        copy.source_revision += 1
        copy.desired_present = False
        copy.opted_in = False
        copy.synced_revision = None
        copy.cleanup_required = copy.remote_id is not None
        # Cancellation does not invent a surviving cleanup credential/grant.

    def disconnect(self):
        self.connected = False
        self.generation += 1
        for copy in self.copies.values():
            copy.opted_in = False
            copy.synced_revision = None

    def reconnect(self):
        self.connected = True
        self.generation += 1
        # No copy enrollment or operation is revived here.

    def resume_copy(self, copy: Copy):
        self.checked(copy.key)
        if not self.connected or not self.source_access or not copy.desired_present:
            raise Blocked("resume not admitted")
        copy.opted_in = True  # explicit modeled action, not automatic reconnect

    def claim(self, copy: Copy, kind="create") -> Operation:
        self.checked(copy.key)
        if not self.connected:
            raise Blocked("disconnected")
        if any(op.outcome in {"in_flight", "unknown"} for op in copy.operations.values()):
            raise Blocked("reconcile unresolved operation first")
        if kind == "delete":
            if copy.desired_present or not copy.remote_id or not copy.cleanup_authorized:
                raise Blocked("exact cleanup authority/mapping absent")
        elif not self.source_access or not copy.opted_in or not copy.desired_present:
            raise Blocked("ordinary export no longer admitted")
        if kind == "create" and copy.remote_id is not None:
            raise Blocked("mapped copy already exists")
        if kind == "update" and copy.remote_id is None:
            raise Blocked("create not reconciled")
        if kind not in {"create", "update", "delete"}:
            raise Blocked("unsupported kind")
        identity = f"{copy.identity}:{kind}:{copy.source_revision}"
        if identity in copy.operations:
            raise Blocked("existing operation: reconcile; do not rekey")
        op = Operation(identity, copy.key, kind, copy.source_revision,
                       self.generation, copy.payload_digest, copy.remote_id)
        copy.operations[identity] = op
        return op

    def provider_accept(self, op: Operation) -> str:
        # Deliberately NOT idempotent. Calling a create twice makes duplicates.
        # The tests exercise the model's admission, not provider guarantees.
        if op.kind == "create":
            self.remote_creates += 1
            remote_id = f"remote-{self.remote_creates}"
            self.remote[remote_id] = op.payload_digest
            return remote_id
        if op.remote_id is None:
            raise AssertionError("missing exact remote identity")
        if op.kind == "update":
            if op.remote_id not in self.remote:
                raise Blocked("external deletion; no automatic recreation")
            self.remote[op.remote_id] = op.payload_digest
        else:
            self.remote.pop(op.remote_id, None)
        return op.remote_id

    @staticmethod
    def lost_response(op: Operation):
        op.outcome = "unknown"

    def observe_acceptance(self, copy: Copy, op: Operation, remote_id: str):
        # Exact verified provider evidence is an ASSUMED input. No actual verifier.
        if op.key != copy.key or copy.operations.get(op.identity) is not op:
            raise Blocked("evidence belongs to another binding")
        if op.outcome == "accepted":
            if op.accepted_remote_id != remote_id:
                raise Blocked("conflicting acceptance identity")
            return  # Duplicate old evidence cannot regress a newer confirmed head.
        op.outcome = "accepted"
        op.accepted_remote_id = remote_id
        if op.kind == "delete":
            copy.remote_id = None
            copy.cleanup_required = False
            copy.synced_revision = None
            return
        if copy.remote_id not in {None, remote_id}:
            raise Blocked("ambiguous remote mapping")
        copy.remote_id = remote_id
        if (self.connected and self.source_access and copy.opted_in
                and copy.desired_present and self.generation == op.connection_generation
                and copy.source_revision == op.source_revision):
            copy.synced_revision = op.source_revision
        else:
            copy.synced_revision = None
        if not copy.desired_present:
            copy.cleanup_required = True


RESULTS = []


def case(name):
    def register(fn):
        try:
            observed = fn()
            RESULTS.append({"id": f"D14-M{len(RESULTS)+1:02}", "name": name,
                            "passed": True, "observed": observed})
        except Exception as exc:
            RESULTS.append({"id": f"D14-M{len(RESULTS)+1:02}", "name": name,
                            "passed": False, "error": f"{type(exc).__name__}: {exc}"})
        return fn
    return register


def blocked(fn):
    try:
        fn()
    except Blocked as exc:
        return str(exc)
    raise AssertionError("operation unexpectedly admitted")


def created():
    model = Model()
    copy = model.add()
    op = model.claim(copy)
    remote_id = model.provider_accept(op)
    model.observe_acceptance(copy, op, remote_id)
    return model, copy


@case("different request keys resolve one copy business identity")
def _():
    m = Model()
    a, b = m.add(request_key="one"), m.add(request_key="two")
    assert a is b and len(m.copies) == 1
    return {"bindings": len(m.copies), "identity": a.identity}


@case("lost create response blocks a fresh create and preserves exact identity")
def _():
    m = Model(); c = m.add(); op = m.claim(c)
    remote_id = m.provider_accept(op); m.lost_response(op)
    reason = blocked(lambda: m.claim(m.add(request_key="fresh-key")))
    assert m.remote_creates == 1 and c.remote_id is None
    return {"remote_events": len(m.remote), "remote_id_known_locally": False,
            "blocked_reason": reason, "original_operation": op.identity,
            "synthetic_remote_id": remote_id}


@case("credential generations do not create a new copy after uncertain submission")
def _():
    m = Model(); c = m.add(); op = m.claim(c)
    m.provider_accept(op); m.lost_response(op)
    m.disconnect(); m.reconnect()
    same = m.add(request_key="after-reconnect")
    assert same is c and not c.opted_in
    m.resume_copy(c)
    reason = blocked(lambda: m.claim(c))
    assert m.remote_creates == 1
    return {"generation": m.generation, "same_copy": True, "blocked_reason": reason}


@case("cancel before dispatch admission prevents external create")
def _():
    m = Model(); c = m.add(); m.cancel(c)
    reason = blocked(lambda: m.claim(c))
    assert m.remote_creates == 0
    return {"order": "cancel -> claim", "remote_creates": 0, "blocked_reason": reason}


@case("dispatch admission before cancel can leave an external copy needing cleanup")
def _():
    m = Model(); c = m.add(); op = m.claim(c); m.cancel(c)
    rid = m.provider_accept(op); m.observe_acceptance(c, op, rid)
    assert c.cleanup_required and not c.desired_present and c.synced_revision is None
    return {"order": "claim -> cancel -> provider acceptance", "external_copy_remains": True,
            "cleanup_required": c.cleanup_required, "current_synced_revision": c.synced_revision}


@case("disconnect before admission prevents external create")
def _():
    m = Model(); c = m.add(); m.disconnect()
    reason = blocked(lambda: m.claim(c))
    assert m.remote_creates == 0
    return {"order": "disconnect -> claim", "remote_creates": 0, "blocked_reason": reason}


@case("disconnect after admission cannot recall remote acceptance or restore opt-in")
def _():
    m = Model(); c = m.add(); op = m.claim(c); m.disconnect()
    rid = m.provider_accept(op); m.observe_acceptance(c, op, rid)
    assert c.remote_id == rid and not c.opted_in and c.synced_revision is None
    return {"order": "claim -> disconnect -> acceptance", "external_copy_remains": True,
            "opted_in": c.opted_in, "current_synced_revision": c.synced_revision}


@case("late acceptance from old revision cannot mark latest source synchronized")
def _():
    m = Model(); c = m.add(); op = m.claim(c)
    m.update_source(c, "changed safe time")
    rid = m.provider_accept(op); m.observe_acceptance(c, op, rid)
    assert c.synced_revision is None and c.source_revision == 2
    newer = m.claim(c, "update")
    assert newer.source_revision == 2 and newer.remote_id == rid
    return {"accepted_revision": op.source_revision, "desired_revision": 2,
            "next_operation": newer.kind, "same_remote_id": newer.remote_id == rid}


@case("unresolved old update blocks concurrent replacement dispatch")
def _():
    m, c = created(); m.update_source(c, "version two")
    op = m.claim(c, "update"); m.update_source(c, "version three")
    reason = blocked(lambda: m.claim(c, "update"))
    rid = m.provider_accept(op); m.observe_acceptance(c, op, rid)
    assert c.synced_revision is None
    newest = m.claim(c, "update")
    assert newest.source_revision == 3
    return {"blocked_reason": reason, "next_revision_after_reconcile": newest.source_revision}


@case("latest update may coalesce before any dispatch admission")
def _():
    m, c = created()
    m.update_source(c, "version two"); m.update_source(c, "version three")
    op = m.claim(c, "update")
    assert op.source_revision == 3 and op.payload_digest == digest("version three")
    return {"admitted_revision": 3, "intermediate_update_operations": 0}


@case("duplicate older acceptance cannot regress a newer confirmed revision")
def _():
    m, c = created(); original = next(iter(c.operations.values()))
    m.update_source(c, "version two"); update = m.claim(c, "update")
    rid = m.provider_accept(update); m.observe_acceptance(c, update, rid)
    assert c.synced_revision == 2
    m.observe_acceptance(c, original, rid)
    assert c.synced_revision == 2
    reason = blocked(lambda: m.observe_acceptance(c, original, "forged-other-id"))
    return {"current_synced_revision": 2, "conflicting_identity": reason}


@case("lost deletion response remains unknown until exact absence evidence")
def _():
    m, c = created(); rid = c.remote_id; m.cancel(c); c.cleanup_authorized = True
    op = m.claim(c, "delete"); m.provider_accept(op); m.lost_response(op)
    assert c.remote_id == rid and c.cleanup_required and rid not in m.remote
    reason = blocked(lambda: m.claim(c, "delete"))
    # Explicit synthetic exact-target absence evidence; not an arbitrary HTTP 404.
    m.observe_acceptance(c, op, rid)
    assert c.remote_id is None and not c.cleanup_required
    return {"lost_response_state": "unknown", "blocked_reason": reason,
            "final_state_after_assumed_exact_absence": "removed"}


@case("late create acceptance after cancellation requires explicit cleanup authority")
def _():
    m = Model(); c = m.add(); op = m.claim(c)
    rid = m.provider_accept(op); m.lost_response(op); m.cancel(c)
    m.observe_acceptance(c, op, rid)
    reason = blocked(lambda: m.claim(c, "delete"))
    c.cleanup_authorized = True
    deletion = m.claim(c, "delete")
    m.provider_accept(deletion); m.observe_acceptance(c, deletion, rid)
    assert not m.remote and not c.desired_present
    return {"without_cleanup_grant": reason, "remaining_remote_events": 0}


@case("disconnect prevents cleanup using obsolete connection")
def _():
    m, c = created(); m.cancel(c); c.cleanup_authorized = True; m.disconnect()
    reason = blocked(lambda: m.claim(c, "delete"))
    assert len(m.remote) == 1
    return {"blocked_reason": reason, "external_copy_may_remain": True}


@case("source read loss cannot authorize ordinary export; narrow cleanup is separate")
def _():
    m, c = created(); m.source_access = False
    reason = blocked(lambda: m.claim(c, "update"))
    m.cancel(c); c.cleanup_authorized = True
    op = m.claim(c, "delete")
    assert op.remote_id is not None
    return {"ordinary_export": reason, "cleanup_requires_explicit_assumed_grant": True}


@case("wrong tenant actor and destination are denied by assumed command boundary")
def _():
    m = Model()
    reasons = [blocked(lambda k=k: m.add(k)) for k in
               [CopyKey(tenant="tenant-b"), CopyKey(actor="missionary-b"),
                CopyKey(account="account-b"), CopyKey(calendar="calendar-b")]]
    assert len(m.copies) == 0
    return {"denials": reasons, "bindings": 0}


@case("acceptance cannot attach to a different appointment copy")
def _():
    m = Model(); first = m.add(); second = m.add(CopyKey(appointment="appointment-b"))
    op = m.claim(first); rid = m.provider_accept(op)
    reason = blocked(lambda: m.observe_acceptance(second, op, rid))
    assert second.remote_id is None
    return {"blocked_reason": reason, "other_copy_unmodified": True}


@case("external deletion is not permission to recreate automatically")
def _():
    m, c = created(); del m.remote[c.remote_id]
    m.update_source(c, "new safe time"); op = m.claim(c, "update")
    reason = blocked(lambda: m.provider_accept(op))
    assert m.remote_creates == 1
    return {"external_result": reason, "create_count": m.remote_creates}


@case("unsafe replay control demonstrates duplicate external events")
def _():
    m = Model(); c = m.add(); op = m.claim(c)
    one = m.provider_accept(op); m.lost_response(op)
    two = m.provider_accept(op)  # intentionally bypasses protocol/reconciliation
    assert one != two and len(m.remote) == 2
    return {"unsafe_bypass": True, "remote_events": 2,
            "meaning": "no inherent exactly-once provider guarantee"}


def local_candidates(local: datetime, zone_name: str):
    """Round-trip both folds; reject nonexistent wall times, expose ambiguity."""
    zone = ZoneInfo(zone_name)
    candidates = set()
    for fold in (0, 1):
        candidate = local.replace(tzinfo=zone, fold=fold).astimezone(UTC)
        if candidate.astimezone(zone).replace(tzinfo=None) == local:
            candidates.add(candidate)
    return sorted(candidates)


@case("DST spring gap has no valid instant; naive timezone attachment is insufficient")
def _():
    local = datetime(2026, 3, 8, 2, 30)
    candidates = local_candidates(local, "America/New_York")
    assert candidates == []
    naive_attachment = local.replace(tzinfo=ZoneInfo("America/New_York")).isoformat()
    return {"local": local.isoformat(), "valid_instants": [],
            "unsafe_naive_attachment_still_produces": naive_attachment}


@case("DST autumn fold has two valid instants requiring source disambiguation")
def _():
    candidates = local_candidates(datetime(2026, 11, 1, 1, 30), "America/New_York")
    values = [c.isoformat() for c in candidates]
    assert values == ["2026-11-01T05:30:00+00:00", "2026-11-01T06:30:00+00:00"]
    return {"valid_instants": values, "silent_choice_permitted": False}


@case("ordinary wall time has exactly one instant")
def _():
    candidates = local_candidates(datetime(2026, 10, 16, 9), "America/New_York")
    assert len(candidates) == 1 and candidates[0].isoformat() == "2026-10-16T13:00:00+00:00"
    return {"valid_instant": candidates[0].isoformat()}


@case("viewer timezone changes rendering not source instant or event identity")
def _():
    source = datetime(2026, 10, 16, 9, tzinfo=ZoneInfo("America/New_York"))
    instant = source.astimezone(UTC)
    tokyo = instant.astimezone(ZoneInfo("Asia/Tokyo"))
    honolulu = instant.astimezone(ZoneInfo("Pacific/Honolulu"))
    assert tokyo.hour == 22 and honolulu.hour == 3
    assert tokyo.astimezone(UTC) == honolulu.astimezone(UTC) == instant
    return {"source": source.isoformat(), "tokyo": tokyo.isoformat(),
            "honolulu": honolulu.isoformat(), "same_instant": True}


@case("all-day source dates retain exclusive end without inventing midnight UTC")
def _():
    start, end_exclusive = date(2026, 11, 1), date(2026, 11, 2)
    assert (end_exclusive - start).days == 1
    return {"start_date": start.isoformat(), "end_date_exclusive": end_exclusive.isoformat(),
            "time_kind": "date_only", "invented_timestamp": None}


def main():
    here = Path(__file__).resolve().parent
    root = here.parents[4]
    references = [
        "docs/prds/sitestacker-parity/roadmap.md",
        "docs/prds/program-roadmap/owner-constraints.md",
        "docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md",
        "docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md",
    ]
    tzdata = Path("/usr/share/zoneinfo/tzdata.zi")
    version = tzdata.read_text().splitlines()[0] if tzdata.exists() else "not discovered"
    output = {
        "schema": "phase28.d14.local_protocol_probe.v1",
        "executed_at_utc": datetime.now(UTC).isoformat(),
        "python": platform.python_version(),
        "tzdata_evidence": version,
        "kind": "single-threaded deterministic model and installed-zoneinfo examples",
        "assumptions": [
            "verified actor/context and source eligibility are supplied toy values",
            "exact provider acceptance/absence evidence is supplied, not verified",
            "claim models dispatch admission; an admitted call can finish after revocation",
            "cleanup authority is explicit synthetic input, not inherited from stale read access",
            "one unresolved operation per copy serializes the modeled protocol",
        ],
        "not_proved": ["actual concurrency or PostgreSQL transactions", "RLS or grants",
                       "Core implementation", "OAuth or provider behavior", "exactly-once delivery",
                       "notification suppression", "distributed/network races", "tzdb-version persistence",
                       "payload classification or external-calendar audience safety"],
        "probe_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "source_sha256": {p: hashlib.sha256((root / p).read_bytes()).hexdigest() for p in references},
        "passed": sum(r["passed"] for r in RESULTS),
        "total": len(RESULTS),
        "results": RESULTS,
        "cleanup": "No database, container, temporary directory, external effect or persistent service created; only this results JSON is written.",
    }
    (here / "probe-results.json").write_text(json.dumps(output, indent=2) + "\n")
    print(json.dumps({"passed": output["passed"], "total": output["total"],
                      "results": str(here / "probe-results.json")}))
    raise SystemExit(0 if output["passed"] == output["total"] else 1)


if __name__ == "__main__":
    main()
