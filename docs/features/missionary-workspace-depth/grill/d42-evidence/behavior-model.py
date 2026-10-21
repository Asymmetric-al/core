#!/usr/bin/env python3
"""New D42 counterexample model; standard library only, no application imports.

This is an atomic in-memory specification sketch, not an Auth/database proof.
Intent issuance and current trusted evidence are assumptions, not implementations.
Only the JSON printed by this new file is used as its execution evidence.
"""

from dataclasses import dataclass, replace
from hashlib import sha256
from itertools import permutations
import json
from pathlib import Path
import sys


@dataclass(frozen=True)
class Auth:
    principal: str | None = "reader-a"
    account_revision: int = 1
    email: str = "reader@example.test"
    email_revision: int = 1
    proof_revision: int = 1
    qualified: bool = True
    session_current: bool = True


@dataclass(frozen=True)
class Preview:
    tenant: str
    newsletter: str
    address: str
    withdrawal_generation: int
    auth: Auth


@dataclass(frozen=True)
class Intent:
    identity: str
    reviewed: Preview


class Source:
    """One exact tenant/newsletter/address; dicts stand for durable native facts.

    commit() is ONE abstract serial operation. A real deployment must establish
    the current-proof check and source-write relationship; Python does not do so.
    A withdrawal increments the barrier even if currently inactive. Admission
    does not increment it: simultaneous eligible Joins converge on one membership.
    This barrier is a behavioral device, not a proposed database schema.
    """

    def __init__(self):
        self.tenant = "tenant-a"
        self.newsletter = "newsletter-a"
        self.address = "reader@example.test"
        self.auth = Auth()
        self.generation = 0
        self.active = False
        self.admission_effects = 0
        self.reuse_allowed = True
        self.policy_known = True
        self.admission_allowed = True
        self.receipts = {}
        self.trace = []

    def state(self):
        return {"active": self.active, "withdrawal_generation": self.generation,
                "admission_effects": self.admission_effects}

    def preview(self, address=None):
        return Preview(self.tenant, self.newsletter, address or self.address,
                       self.generation, self.auth)

    def record(self, event, outcome, **extra):
        result = {"event": event, "outcome": outcome, **self.state(), **extra}
        self.trace.append(result)
        return result

    def withdraw(self):
        self.active = False
        self.generation += 1
        return self.record("withdraw", "withdrawn")

    def commit(self, intent, transport_key):
        reviewed = intent.reviewed
        scope = (reviewed.tenant, reviewed.newsletter)
        if scope != (self.tenant, self.newsletter):
            return self.record("join", "scope_rejected", key=transport_key)
        # The same intent cannot be rebound to another purpose/address/proof.
        prior = self.receipts.get(intent.identity)
        if prior and prior[0] != reviewed:
            return self.record("join", "intent_payload_conflict", key=transport_key)
        # Even historical receipt disclosure requires current same-reader access.
        if reviewed.auth.principal is not None and (
                not self.auth.session_current
                or self.auth.principal != reviewed.auth.principal):
            return self.record("join", "current_reader_unavailable", key=transport_key)
        if prior:
            return self.record("join", "receipt_only", original=prior[1],
                               replay=True, key=transport_key)

        def finish(outcome):
            self.receipts[intent.identity] = (reviewed, outcome)
            return self.record("join", outcome, replay=False, key=transport_key)

        if reviewed.withdrawal_generation != self.generation:
            return finish("stale_withdrawal_generation")
        if not self.policy_known:
            return finish("policy_unavailable")
        if not self.admission_allowed:
            return finish("current_restriction")
        if not self.reuse_allowed:
            return finish("confirmation_required")
        if reviewed.auth.principal is None or self.auth.principal is None:
            return finish("confirmation_required")
        # Conservative snapshot fence: a changed revision cannot reuse OLD
        # evidence, even if the address text returns to its previous value.
        revisions = ("account_revision", "email", "email_revision", "proof_revision")
        if any(getattr(reviewed.auth, name) != getattr(self.auth, name)
               for name in revisions):
            return finish("current_evidence_review_required")
        if (reviewed.address != self.auth.email or not self.auth.qualified
                or not reviewed.auth.qualified):
            return finish("confirmation_required")
        if reviewed.address != self.address:
            return finish("different_destination_outside_fixture")
        if self.active:
            return finish("already_active_noop")
        self.active = True
        self.admission_effects += 1
        return finish("joined")


def human_join(identity, preview):
    """Assume one deliberate named-newsletter Join, NOT a transport retry.

    The model cannot establish a human action, token authenticity or CSRF safety.
    Changing transport_key alone must never call this with a new identity.
    """
    return Intent(identity, preview)


def run():
    checks = []

    def check(name, condition, trace, expected):
        checks.append({"name": name, "pass": bool(condition),
                       "expected": expected, "trace": trace})

    # Deliberately broken alternative 1: address-level dedupe lasts forever.
    active, ever_joined = False, set()
    address = "reader@example.test"
    ever_joined.add(address)
    active = True
    naive_trace = [{"event": "first_human_join", "active": active}]
    active = False
    naive_trace.append({"event": "withdraw", "active": active})
    if address not in ever_joined:
        active = True
    naive_trace.append({"event": "fresh_human_rejoin", "active": active,
                        "outcome": "deduped_by_address"})
    check("N01_address_forever_dedupe_blocks_valid_rejoin", not active,
          naive_trace, "Counterexample found: a genuine new rejoin remains blocked.")

    # Broken alternative 2: only HTTP keys identify effects; old intent is ignored.
    active, applied_keys = False, set()
    naive_trace = []
    for event, key in (("original_join", "http-1"), ("withdraw", None),
                       ("old_human_intent_retry", "http-2")):
        if event == "withdraw":
            active = False
        elif key not in applied_keys:
            applied_keys.add(key)
            active = True
        naive_trace.append({"event": event, "key": key, "active": active})
    check("N02_transport_key_only_revives_old_intent", active, naive_trace,
          "Counterexample found: a new transport key revives withdrawn membership without new human intent.")

    # Broken alternative 3: proof was valid at preview, so it is trusted forever.
    preview_proof, current_proof = True, False
    naive_active = preview_proof
    check("N03_preview_only_proof_admits_after_revocation",
          naive_active and not current_proof,
          [{"preview_qualified": preview_proof, "current_qualified": current_proof,
            "naive_active": naive_active}],
          "Counterexample found: stale preview evidence activates membership.")

    s = Source()
    first = human_join("human-1", s.preview())
    s.commit(first, "http-1")
    s.withdraw()
    s.commit(first, "http-1")
    s.commit(first, "http-2")
    check("R01_old_accepted_intent_never_reapplies", not s.active
          and s.admission_effects == 1 and s.trace[-1]["original"] == "joined",
          list(s.trace), "Same or changed transport keys return the old receipt; current state stays withdrawn.")
    fresh = human_join("human-2", s.preview())
    s.commit(fresh, "http-3")
    check("R02_fresh_deliberate_rejoin_allowed", s.active
          and s.admission_effects == 2, list(s.trace),
          "A deliberate new intent after withdrawal admits once.")

    s = Source()
    held = human_join("held", s.preview())
    s.withdraw()
    s.commit(held, "delayed-http")
    check("R03_unsubmitted_old_intent_fenced", not s.active
          and s.trace[-1]["outcome"] == "stale_withdrawal_generation", s.trace,
          "Withdrawal fences an old intent even when no previous Join receipt exists.")

    # Two independent tabs capture the same pre-withdrawal generation.
    orders = list(permutations(("tab-a", "tab-b", "withdraw")))
    for order in orders:
        s = Source()
        tabs = {tab: human_join(tab, s.preview()) for tab in ("tab-a", "tab-b")}
        for event in order:
            s.withdraw() if event == "withdraw" else s.commit(tabs[event], event)
        check("R04_two_tabs_and_withdraw_" + "_".join(order),
              not s.active and s.admission_effects <= 1, s.trace,
              "Every serialized ordering ends withdrawn; no pre-withdrawal intent revives it.")

    for order in permutations(("tab-a", "tab-b")):
        s = Source()
        tabs = {tab: human_join(tab, s.preview()) for tab in order}
        for event in order:
            s.commit(tabs[event], event)
        check("R05_two_tabs_join_once_" + "_".join(order), s.active
              and s.admission_effects == 1
              and s.trace[-1]["outcome"] == "already_active_noop", s.trace,
              "Distinct deliberate tab intents converge on one active membership without a second effect.")

    changes = {
        "proof_revoked": {"qualified": False, "proof_revision": 2},
        "proof_replaced_same_address": {"proof_revision": 2},
        "account_revision_changed": {"account_revision": 2},
        "email_changed": {"email": "other@example.test", "email_revision": 2},
        "email_ABA_same_string": {"email_revision": 3, "proof_revision": 3},
    }
    for label, changeset in changes.items():
        s = Source()
        intent = human_join(label, s.preview())
        s.auth = replace(s.auth, **changeset)
        s.commit(intent, "http-change")
        check("R06_" + label, not s.active and s.admission_effects == 0
              and s.trace[-1]["outcome"] == "current_evidence_review_required",
              s.trace, "Changed evidence cannot commit using the previously reviewed proof snapshot.")

    for label, changeset in {
        "signed_out": {"session_current": False},
        "different_account": {"principal": "reader-b", "account_revision": 2},
    }.items():
        s = Source()
        intent = human_join(label, s.preview())
        s.auth = replace(s.auth, **changeset)
        s.commit(intent, "http-session")
        check("R07_" + label, not s.active
              and s.trace[-1]["outcome"] == "current_reader_unavailable", s.trace,
              "Current principal/session mismatch prevents the original direct Join.")

    for label in ("guest", "unqualified_proof", "different_address"):
        s = Source()
        if label == "guest":
            s.auth = replace(s.auth, principal=None, qualified=False, session_current=False)
        if label == "unqualified_proof":
            s.auth = replace(s.auth, qualified=False)
        preview = s.preview("other@example.test" if label == "different_address" else None)
        s.commit(human_join(label, preview), "http-fallback")
        check("R08_" + label, not s.active and s.admission_effects == 0
              and s.trace[-1]["outcome"] == "confirmation_required", s.trace,
              "Ordinary confirmation is required; this model neither sends nor completes it.")

    s = Source()
    intent = human_join("before-restriction", s.preview())
    s.admission_allowed = False
    s.commit(intent, "http-blocked")
    s.admission_allowed = True
    s.commit(intent, "http-blocked-retry")
    check("R09_restriction_rechecked_and_old_rejection_terminal",
          not s.active and s.admission_effects == 0
          and s.trace[-1]["original"] == "current_restriction", s.trace,
          "A current restriction blocks admission; later lifting it does not replay the old intent.")

    s = Source()
    s.commit(human_join("first", s.preview()), "http-first")
    s.withdraw()
    s.admission_allowed = False
    s.commit(human_join("new-rejoin", s.preview()), "http-rejoin")
    check("R10_fresh_rejoin_does_not_clear_broader_restriction", not s.active
          and s.admission_effects == 1
          and s.trace[-1]["outcome"] == "current_restriction", s.trace,
          "Fresh intent is insufficient while a current stronger restriction applies.")

    s = Source()
    intent = human_join("before-off", s.preview())
    s.reuse_allowed = False
    s.commit(intent, "http-off")
    s.reuse_allowed = True
    s.commit(intent, "http-on-retry")
    check("R11_off_on_does_not_replay_old_intent", not s.active
          and s.trace[-1]["original"] == "confirmation_required", list(s.trace),
          "Off selects the confirmation branch; On cannot resurrect that old immediate-Join attempt.")
    s.commit(human_join("fresh-after-on", s.preview()), "http-new")
    check("R12_new_intent_after_on_can_join", s.active and s.admission_effects == 1,
          s.trace, "A later deliberate eligible Join may use the currently enabled branch.")

    s = Source()
    intent = human_join("unknown-policy", s.preview())
    s.policy_known = False
    s.commit(intent, "http-unknown")
    check("R13_unknown_policy_not_on", not s.active
          and s.trace[-1]["outcome"] == "policy_unavailable", s.trace,
          "No missing-policy default silently permits proof reuse.")

    s = Source()
    foreign = replace(s.preview(), tenant="tenant-b")
    s.commit(human_join("foreign", foreign), "http-foreign")
    check("R14_exact_tenant_scope", not s.active and not s.receipts
          and s.trace[-1]["outcome"] == "scope_rejected", s.trace,
          "A foreign intent cannot use this source or receive a stored receipt.")

    s = Source()
    intent = human_join("stable", s.preview())
    s.commit(intent, "http-1")
    altered = replace(intent, reviewed=replace(intent.reviewed, address="other@example.test"))
    s.commit(altered, "http-2")
    check("R15_same_intent_changed_payload_conflicts", s.admission_effects == 1
          and s.trace[-1]["outcome"] == "intent_payload_conflict", s.trace,
          "An old identity cannot be rebound to a different destination.")

    s = Source()
    intent = human_join("active", s.preview())
    s.commit(intent, "http-1")
    s.reuse_allowed = False
    s.commit(intent, "http-replay")
    check("R16_off_preserves_accepted_membership", s.active
          and s.admission_effects == 1 and s.trace[-1]["outcome"] == "receipt_only",
          s.trace, "Turning proof reuse Off neither removes accepted membership nor reapplies its Join.")

    s = Source()
    intent = human_join("recover", s.preview())
    s.commit(intent, "http-1")
    s.auth = replace(s.auth, session_current=False)
    s.commit(intent, "http-recover")
    check("R17_recovery_checks_current_reader", s.admission_effects == 1
          and s.trace[-1]["outcome"] == "current_reader_unavailable", s.trace,
          "A historical receipt is not unconditional permission to disclose its result.")

    s = Source()
    s.auth = replace(s.auth, principal=None, qualified=False, session_current=False)
    guest_intent = human_join("guest-before-signin", s.preview())
    s.auth = Auth()
    s.commit(guest_intent, "http-after-signin")
    check("R18_signin_does_not_upgrade_old_guest_intent", not s.active
          and s.trace[-1]["outcome"] == "confirmation_required", s.trace,
          "Signing in alone cannot turn an earlier guest request into an immediate qualified-account Join.")

    s = Source()
    stale = human_join("before-proof-change", s.preview())
    s.auth = replace(s.auth, proof_revision=2)
    s.commit(stale, "http-stale-proof")
    s.commit(human_join("new-current-proof", s.preview()), "http-current-proof")
    check("R19_current_qualified_new_intent_not_permanently_blocked", s.active
          and s.admission_effects == 1 and s.trace[-1]["outcome"] == "joined", s.trace,
          "Fresh deliberate intent with the replacement qualified proof remains eligible.")

    return {
        "model": "D42 new bounded Join intent and withdrawal-generation model",
        "research_date": "2026-10-18 Asia/Bangkok",
        "source_sha256": sha256(Path(__file__).read_bytes()).hexdigest(),
        "all_checks_pass": all(c["pass"] for c in checks),
        "check_count": len(checks),
        "naive_counterexamples": 3,
        "two_tab_withdrawal_serial_orders": len(orders),
        "assumptions": [
            "One exact tenant/newsletter/address state; exact string equality is a fixture, not email canonicalization policy.",
            "Intent identity represents a deliberate human action; transport retries retain it.",
            "Intent/receipt storage and restriction checks are durable and serialized in the abstract model.",
            "Current trusted Auth evidence and source state are supplied at one abstract commit boundary.",
            "Revision-change rejection is conservative; it forbids using stale evidence, not a mandatory extra confirmation screen.",
            "No send, confirmation completion, expiry/retention rule or protected access is implemented.",
        ],
        "not_proved": [
            "Supabase Auth/newsletter database cross-service atomicity or proof freshness.",
            "Actual SQL transactions, locking, unique constraints, RLS, HTTP/CSRF or token authenticity.",
            "Human intent authenticity, duplicate keys across real workers, crash recovery or durable receipt retention.",
            "Production eligibility, global suppression qualification, identity ownership, privacy-safe UI or accessibility.",
            "Policy for pending confirmation after Page-entry Off, numerical proof lifetime or email delivery.",
        ],
        "checks": checks,
    }


if __name__ == "__main__":
    results = run()
    print(json.dumps(results, indent=2, sort_keys=True))
    sys.exit(0 if results["all_checks_pass"] else 1)
