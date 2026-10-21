#!/usr/bin/env python3
"""D15 local design model: no application, database, network or real provider."""
from __future__ import annotations

import copy
import hashlib
import json
import platform
from dataclasses import FrozenInstanceError, dataclass, field
from datetime import UTC, datetime
from pathlib import Path


class Blocked(Exception):
    pass


def sha(value: str | bytes) -> str:
    return hashlib.sha256(value.encode() if isinstance(value, str) else value).hexdigest()


@dataclass
class Draft:
    identity: str = "draft-a"
    tenant: str = "tenant-a"
    author: str = "missionary-a"
    revision: int = 1
    subject: str = "Synthetic follow-up"
    body: str = "A wholly synthetic private message."
    locked: bool = False


@dataclass(frozen=True)
class Seal:
    authorization_id: str
    tenant: str
    actor: str
    draft_id: str
    draft_revision: int
    source_fence: int
    recipient_party: str
    contact_revision: int
    recipient_address: str
    sender_account: str
    sender_address: str
    reply_address: str
    connection_id: str
    connection_generation: int
    payload_digest: str
    original_history_profile: str


@dataclass
class Intent:
    seal: Seal
    material: bytes | None
    # Synthetic monotonic clock units, not an adopted retention duration.
    purge_deadline: int = 10
    state: str = "prepared"
    delivery: str = "not_proved"
    lease_generation: int = 0
    attempt_id: str | None = None
    provider_id: str | None = None
    history_audience: frozenset[str] = frozenset({"missionary-a"})
    evidence: list[dict] = field(default_factory=list)
    evidence_ids: set[str] = field(default_factory=set)


class Remote:
    """No deduplication guarantee. A second call creates a second submission."""
    def __init__(self):
        self.submissions = []

    def submit(self, intent: Intent):
        if intent.material is None:
            raise Blocked("no prepared material")
        self.submissions.append((intent.seal.authorization_id, intent.seal.payload_digest,
                                 intent.seal.sender_account))
        return {"http": 202, "provider_id": None}


class Model:
    def __init__(self):
        self.tenant, self.actor = "tenant-a", "missionary-a"
        self.source_fence = 1
        self.source_allowed = True
        self.connection_enabled = True
        self.connection_id = "connection-a"
        self.connection_generation = 1
        self.sender_account = "account-a"
        self.sender_address = "sender@example.invalid"
        self.reply_address = "sender@example.invalid"
        self.recipient_party = "party-a"
        self.contact_revision = 1
        self.recipient_address = "recipient@example.invalid"
        self.contact_allowed = True
        self.restoring = False
        self.intents: dict[tuple, Intent] = {}
        self.remote = Remote()

    def authorize(self, draft: Draft, request_key="request-a", fail_before_release=False):
        if (draft.tenant, draft.author) != (self.tenant, self.actor):
            raise Blocked("wrong source tenant/actor")
        slot = (draft.tenant, draft.author, draft.identity, draft.revision)
        _ = request_key  # A browser key cannot manufacture a new Send authorization.
        if slot in self.intents:
            return self.intents[slot]
        if not (self.source_allowed and self.connection_enabled and self.contact_allowed):
            raise Blocked("source/connection/contact not admitted")
        raw = json.dumps({"subject": draft.subject, "body": draft.body,
                          "from": self.sender_address, "to": self.recipient_address,
                          "reply_to": self.reply_address}, sort_keys=True).encode()
        auth_id = sha(json.dumps(slot))[:24]
        seal = Seal(auth_id, self.tenant, self.actor, draft.identity, draft.revision,
                    self.source_fence, self.recipient_party, self.contact_revision,
                    self.recipient_address, self.sender_account, self.sender_address,
                    self.reply_address, self.connection_id, self.connection_generation,
                    sha(raw), "private-source-history-v1")
        candidate = Intent(seal, raw)
        self.evidence(candidate, "authorized", "authorization:" + auth_id)
        # Stage locally, then release all. This is NOT a transaction implementation.
        if fail_before_release:
            raise Blocked("simulated failure before atomic local release")
        self.intents[slot] = candidate
        draft.locked = True
        return candidate

    @staticmethod
    def edit(draft: Draft, body: str):
        if draft.locked:
            raise Blocked("authorized draft revision is immutable")
        draft.body = body
        draft.revision += 1

    @staticmethod
    def evidence(intent: Intent, kind: str, evidence_id: str):
        if evidence_id in intent.evidence_ids:
            return
        intent.evidence_ids.add(evidence_id)
        intent.evidence.append({"evidence_id": evidence_id, "kind": kind,
                                "authorization_id": intent.seal.authorization_id,
                                "tenant": intent.seal.tenant,
                                "payload_digest": intent.seal.payload_digest})

    def lease(self, intent: Intent):
        intent.lease_generation += 1
        return intent.lease_generation

    def admit(self, intent: Intent, lease: int, now=0):
        # Final durable attempt fence. Ordinary worker lease is not admission.
        seal = intent.seal
        if self.restoring:
            raise Blocked("restore reconciliation gate")
        if intent.state != "prepared":
            raise Blocked("already admitted or terminal; no blind replay")
        if lease != intent.lease_generation:
            raise Blocked("stale lease")
        if (seal.tenant, seal.actor) != (self.tenant, self.actor):
            raise Blocked("wrong current tenant/actor")
        if not self.source_allowed or seal.source_fence != self.source_fence:
            raise Blocked("source authority/fence changed")
        if not self.contact_allowed or (seal.recipient_party, seal.contact_revision,
                                       seal.recipient_address) != (
                self.recipient_party, self.contact_revision, self.recipient_address):
            raise Blocked("recipient admission changed; no silent retarget")
        if not self.connection_enabled or (
                seal.connection_id, seal.connection_generation, seal.sender_account,
                seal.sender_address, seal.reply_address) != (
                self.connection_id, self.connection_generation, self.sender_account,
                self.sender_address, self.reply_address):
            raise Blocked("connection/sender changed; no alternate route")
        if now >= intent.purge_deadline or intent.material is None:
            raise Blocked("prepared material unavailable or expired")
        if sha(intent.material) != seal.payload_digest:
            raise Blocked("sealed bytes changed")
        intent.attempt_id = "attempt:" + seal.authorization_id
        intent.state = "attempt_admitted"
        self.evidence(intent, "attempt_admitted", intent.attempt_id)

    @staticmethod
    def unknown(intent: Intent):
        if intent.state == "attempt_admitted":
            intent.state = "unknown"

    def accepted(self, intent: Intent, authorization_id: str, provider_id=None):
        # Exact correlated acceptance is an assumed verified input, not email search.
        if authorization_id != intent.seal.authorization_id:
            raise Blocked("proof belongs to another authorization")
        if intent.state not in {"attempt_admitted", "unknown", "accepted_for_processing"}:
            raise Blocked("acceptance lacks an admitted attempt")
        if intent.provider_id is not None and provider_id not in {None, intent.provider_id}:
            raise Blocked("contradictory exact provider identity; quarantine evidence")
        intent.state = "accepted_for_processing"
        if provider_id is not None:
            intent.provider_id = provider_id
        intent.material = None  # model adapter denial/purge; not cryptographic erasure
        self.evidence(intent, "provider_accepted", "accepted:" + authorization_id)
        # Delivery remains unproved; recipient reply and audience remain unchanged.

    @staticmethod
    def cancel(intent: Intent):
        if intent.state == "prepared":
            intent.state = "not_submitted"
            intent.material = None
        elif intent.state == "attempt_admitted":
            intent.state = "unknown"

    def revoke(self):
        self.source_allowed = False
        self.source_fence += 1

    def disconnect(self):
        self.connection_enabled = False
        self.connection_generation += 1

    @staticmethod
    def can_read_history(intent: Intent, principal: str):
        return principal in intent.history_audience

    @staticmethod
    def purge(intent: Intent):
        intent.material = None

    @staticmethod
    def retry_as_new(intent: Intent):
        if intent.state in {"attempt_admitted", "unknown", "accepted_for_processing"}:
            raise Blocked("cannot replace possibly submitted authorization")
        raise Blocked("new successor requires independently qualified producer action")

    def enter_restore(self, current_remote: Remote, erased: set[str], current_audience=frozenset()):
        self.remote = current_remote  # the external world was not rolled back
        self.restoring = True
        for intent in self.intents.values():
            intent.lease_generation += 1
            intent.history_audience = current_audience
            if intent.seal.authorization_id in erased:
                intent.material = None
            if intent.state in {"prepared", "attempt_admitted", "unknown"}:
                # Backup alone cannot prove a newer external attempt never happened.
                intent.state = "unknown"


RESULTS = []


def case(name):
    def register(fn):
        try:
            observed = fn()
            RESULTS.append({"id": f"D15-M{len(RESULTS)+1:02}", "name": name,
                            "passed": True, "observed": observed})
        except Exception as exc:
            RESULTS.append({"id": f"D15-M{len(RESULTS)+1:02}", "name": name,
                            "passed": False, "error": f"{type(exc).__name__}: {exc}"})
        return fn
    return register


def blocked(fn):
    try:
        fn()
    except Blocked as exc:
        return str(exc)
    raise AssertionError("unexpectedly admitted")


def prepared():
    model = Model(); draft = Draft(); intent = model.authorize(draft)
    return model, draft, intent


@case("doubleclick with different request keys retains one authorization and effect")
def _():
    m, d, a = prepared(); b = m.authorize(d, request_key="different-browser-key")
    assert a is b and len(m.intents) == 1 and len(a.evidence) == 1
    return {"intent_count": 1, "authorization_id": a.seal.authorization_id}


@case("failure before modeled local release leaves no intent audit or draft lock")
def _():
    m, d = Model(), Draft()
    reason = blocked(lambda: m.authorize(d, fail_before_release=True))
    assert not m.intents and not d.locked
    return {"blocked_reason": reason, "released_intents": 0, "draft_locked": False}


@case("authorized source draft cannot mutate its subject-body revision")
def _():
    m, d, i = prepared(); old = i.material
    reason = blocked(lambda: m.edit(d, "changed after authorization"))
    assert i.material == old
    return {"blocked_reason": reason, "payload_unchanged": True}


@case("sealed recipient sender connection and payload digest are immutable")
def _():
    _, _, i = prepared()
    denied = 0
    for name, value in [("recipient_address", "other@example.invalid"),
                        ("sender_account", "other-account"),
                        ("connection_id", "other-connection"), ("payload_digest", "forged")]:
        try:
            setattr(i.seal, name, value)
        except FrozenInstanceError:
            denied += 1
    assert denied == 4
    return {"frozen_field_mutations_rejected": denied}


@case("payload tampering cannot pass final admission")
def _():
    m, _, i = prepared(); i.material = b"altered synthetic bytes"
    return {"blocked_reason": blocked(lambda: m.admit(i, m.lease(i)))}


@case("recipient contact revision change blocks rather than retargets")
def _():
    m, _, i = prepared(); m.contact_revision = 2; m.recipient_address = "new@example.invalid"
    reason = blocked(lambda: m.admit(i, m.lease(i)))
    assert i.seal.recipient_address == "recipient@example.invalid"
    return {"blocked_reason": reason, "silent_retarget": False}


@case("wrong tenant or actor fails source authorization and dispatch")
def _():
    m = Model()
    first = blocked(lambda: m.authorize(Draft(tenant="tenant-b")))
    second = blocked(lambda: m.authorize(Draft(author="missionary-b")))
    i = m.authorize(Draft()); m.actor = "missionary-b"
    third = blocked(lambda: m.admit(i, m.lease(i)))
    return {"source_tenant": first, "source_actor": second, "dispatch_actor": third}


@case("stale worker lease cannot perform final admission")
def _():
    m, _, i = prepared(); old = m.lease(i); newest = m.lease(i)
    reason = blocked(lambda: m.admit(i, old)); m.admit(i, newest)
    assert i.state == "attempt_admitted"
    return {"old_lease": reason, "newest_lease_admitted": True}


@case("cancel before durable attempt admission prevents submission")
def _():
    m, _, i = prepared(); lease = m.lease(i); m.cancel(i)
    reason = blocked(lambda: m.admit(i, lease))
    assert i.state == "not_submitted" and not m.remote.submissions
    return {"order": "cancel -> admit", "state": i.state, "blocked_reason": reason}


@case("attempt admission before cancellation cannot promise no external effect")
def _():
    m, _, i = prepared(); m.admit(i, m.lease(i)); m.cancel(i)
    m.remote.submit(i); m.accepted(i, i.seal.authorization_id)
    assert i.state == "accepted_for_processing" and i.delivery == "not_proved"
    return {"order": "admit -> cancel -> acceptance", "submissions": 1,
            "state": i.state, "delivery": i.delivery}


@case("revocation before admission blocks a previously leased send")
def _():
    m, _, i = prepared(); lease = m.lease(i); m.revoke()
    return {"blocked_reason": blocked(lambda: m.admit(i, lease)), "submissions": len(m.remote.submissions)}


@case("revocation after admission preserves possible acceptance without restoring rights")
def _():
    m, _, i = prepared(); m.admit(i, m.lease(i)); m.revoke()
    m.remote.submit(i); m.accepted(i, i.seal.authorization_id)
    assert not m.source_allowed and i.state == "accepted_for_processing"
    return {"source_authority_restored": False, "provider_acceptance_retained": True}


@case("disconnect before admission blocks the exact prepared connection")
def _():
    m, _, i = prepared(); m.disconnect()
    return {"blocked_reason": blocked(lambda: m.admit(i, m.lease(i)))}


@case("disconnect after admission cannot erase a later acceptance fact")
def _():
    m, _, i = prepared(); m.admit(i, m.lease(i)); m.disconnect()
    m.remote.submit(i); m.accepted(i, i.seal.authorization_id)
    assert not m.connection_enabled and i.state == "accepted_for_processing"
    return {"connection_enabled": False, "state": i.state}


@case("accepted remotely with lost response cannot be retried under a fresh key")
def _():
    m, d, i = prepared(); m.admit(i, m.lease(i)); m.remote.submit(i); m.unknown(i)
    same = m.authorize(d, request_key="fresh-key")
    reason = blocked(lambda: m.admit(same, m.lease(same)))
    replacement = blocked(lambda: m.retry_as_new(i))
    assert len(m.remote.submissions) == 1 and same is i
    return {"state": i.state, "submissions": 1, "retry": reason, "new_occurrence": replacement}


@case("crash after admission before actual I/O remains uncertain without external proof")
def _():
    m, _, i = prepared(); m.admit(i, m.lease(i)); m.unknown(i)
    reason = blocked(lambda: m.admit(i, m.lease(i)))
    assert not m.remote.submissions
    return {"actual_stub_submissions": 0, "state": i.state, "blocked_reason": reason,
            "meaning": "model observer knows zero; recovering process lacks that proof"}


@case("changing account or reply address cannot become fallback delivery")
def _():
    m, _, i = prepared(); m.sender_account = "alternative-account"
    first = blocked(lambda: m.admit(i, m.lease(i)))
    m.sender_account = "account-a"; m.reply_address = "different@example.invalid"
    second = blocked(lambda: m.admit(i, m.lease(i)))
    return {"account_change": first, "reply_change": second}


@case("HTTP 202 records acceptance for processing, not delivery or exchange")
def _():
    m, _, i = prepared(); m.admit(i, m.lease(i)); response = m.remote.submit(i)
    m.accepted(i, i.seal.authorization_id, response["provider_id"])
    assert i.state == "accepted_for_processing" and i.delivery == "not_proved"
    assert i.provider_id is None
    return {"http": response["http"], "state": i.state, "delivery": i.delivery,
            "provider_id": None, "personal_exchange_created": False}


@case("late proof does not widen private history audience or duplicate evidence")
def _():
    m, _, i = prepared(); m.admit(i, m.lease(i)); m.remote.submit(i); m.unknown(i)
    m.accepted(i, i.seal.authorization_id); count = len(i.evidence)
    m.accepted(i, i.seal.authorization_id)
    assert len(i.evidence) == count and m.can_read_history(i, "missionary-a")
    assert not m.can_read_history(i, "staff-a") and not m.can_read_history(i, "coach-a")
    return {"history_audience_unchanged": True, "duplicate_evidence_added": False}


@case("body-free evidence contains no destination personalized content or raw payload")
def _():
    m, _, i = prepared(); m.admit(i, m.lease(i)); m.unknown(i)
    serialized = json.dumps(i.evidence)
    assert "@" not in serialized and "Synthetic follow-up" not in serialized
    assert "private message" not in serialized and "raw" not in serialized
    return {"evidence_fields": sorted(i.evidence[0]), "content_present": False}


@case("expired preparation cannot dispatch or be recreated by duplicate authorization")
def _():
    m, d, i = prepared(); reason = blocked(lambda: m.admit(i, m.lease(i), now=10))
    m.purge(i); same = m.authorize(d, request_key="after-expiry")
    assert same is i and i.material is None
    return {"blocked_reason": reason, "material_restored": False,
            "deadline_units_are_synthetic": True}


@case("body purge preserves unknown outcome and accepts body-free late proof")
def _():
    m, _, i = prepared(); m.admit(i, m.lease(i)); m.remote.submit(i); m.unknown(i)
    m.purge(i); assert i.material is None and i.state == "unknown"
    m.accepted(i, i.seal.authorization_id)
    assert i.material is None and i.delivery == "not_proved"
    return {"material_restored": False, "late_state": i.state, "delivery": i.delivery}


@case("proof for another authorization cannot attach by shared address")
def _():
    m, _, i = prepared(); m.admit(i, m.lease(i))
    return {"blocked_reason": blocked(lambda: m.accepted(i, "another-authorization"))}


@case("backup restore cannot assume the external world rolled back")
def _():
    m, _, i = prepared(); backup = copy.deepcopy(m)
    m.admit(i, m.lease(i)); m.remote.submit(i); m.unknown(i)
    restored = next(iter(backup.intents.values()))
    backup.enter_restore(m.remote, erased=set())
    reason = blocked(lambda: backup.admit(restored, backup.lease(restored)))
    assert restored.state == "unknown" and len(backup.remote.submissions) == 1
    return {"restored_state": restored.state, "blocked_reason": reason,
            "external_submissions": 1}


@case("restore applies erasure and current audience before reads or dispatch")
def _():
    m, _, i = prepared(); backup = copy.deepcopy(m)
    old = next(iter(backup.intents.values()))
    backup.enter_restore(m.remote, erased={old.seal.authorization_id}, current_audience=frozenset())
    assert old.material is None and not backup.can_read_history(old, "missionary-a")
    return {"expired_or_erased_material_restored": False, "old_audience_restored": False}


@case("unsafe blind retry counterexample creates duplicate external submissions")
def _():
    m, _, i = prepared(); m.admit(i, m.lease(i)); m.remote.submit(i); m.unknown(i)
    m.remote.submit(i)  # deliberately bypassing the model's dispatch gate
    assert len(m.remote.submissions) == 2
    return {"unsafe_control": True, "external_submissions": 2}


@case("unsafe backup replay counterexample duplicates an already accepted send")
def _():
    m, _, i = prepared(); backup = copy.deepcopy(m)
    m.admit(i, m.lease(i)); m.remote.submit(i)
    backup.remote = m.remote  # dangerous restore: no uncertainty/erasure reconciliation
    old = next(iter(backup.intents.values()))
    backup.admit(old, backup.lease(old)); backup.remote.submit(old)
    assert len(m.remote.submissions) == 2
    return {"unsafe_control": True, "external_submissions": 2,
            "cause": "prepared backup treated as proof of never-submitted"}


@case("late proof cannot overwrite an established exact provider identity")
def _():
    m, _, i = prepared(); m.admit(i, m.lease(i))
    m.accepted(i, i.seal.authorization_id, "provider-message-a")
    m.accepted(i, i.seal.authorization_id, None)
    reason = blocked(lambda: m.accepted(i, i.seal.authorization_id, "provider-message-b"))
    assert i.provider_id == "provider-message-a" and i.delivery == "not_proved"
    return {"blocked_reason": reason, "original_correlation_retained": True,
            "delivery": i.delivery}


def main():
    here = Path(__file__).resolve().parent
    root = here.parents[4]
    sources = ["docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md",
               "docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md",
               "docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md",
               "docs/prds/sitestacker-parity/roadmap.md",
               "docs/adr/0029-tenant-owned-resend-and-composed-delivery-identities.md"]
    result = {
        "schema": "phase28.d15.protocol_model.v1",
        "executed_at_utc": datetime.now(UTC).isoformat(),
        "python": platform.python_version(),
        "kind": "single-threaded deterministic local protocol model",
        "probe_sha256": sha(Path(__file__).read_bytes()),
        "source_sha256": {p: sha((root / p).read_bytes()) for p in sources},
        "passed": sum(r["passed"] for r in RESULTS), "total": len(RESULTS),
        "results": RESULTS,
        "assumptions": ["toy actor/source/contact admission inputs",
                        "current connection/account facts supplied, no OAuth verification",
                        "one exact source authorization slot and complete local release",
                        "durable attempt admission precedes possible network I/O",
                        "provider deliberately has no deduplication guarantee",
                        "late acceptance is assumed verified exact-identity evidence",
                        "history audience is an assumed source projection, not a new ACL proposal",
                        "synthetic clock units select no retention duration"],
        "not_proved": ["real transactions, concurrency, crash durability or atomic audit",
                       "PostgreSQL, RLS, grants, Supabase Auth or APIs", "provider behavior or OAuth",
                       "current source/contact/consent classification", "real crypto or deletion",
                       "actual backup/restore lifecycle", "exactly-once external delivery",
                       "complete P6 compiler or production shared writer", "UI or production load"],
        "cleanup": "No database, container, network, external effect or persistent service created. Only results JSON written.",
    }
    (here / "probe-results.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"passed": result["passed"], "total": result["total"],
                      "results": str(here / "probe-results.json")}))
    raise SystemExit(0 if result["passed"] == result["total"] else 1)


if __name__ == "__main__":
    main()
