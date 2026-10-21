#!/usr/bin/env python3
"""New D43 bounded lifecycle model; no older/app code is imported or executed.

Integer time and lifetime=10 are arbitrary fixtures, NOT hours/days/policy.
Each method is an assumed atomic source operation. No real concurrency,
Auth/DB atomicity, source authorization, delivery or RLS is established here.
"""

from dataclasses import dataclass, replace
from hashlib import sha256
from itertools import permutations
import json
from pathlib import Path
import sys


FIXTURE_LIFETIME = 10  # Abstract time units; deliberately not a duration proposal.


@dataclass(frozen=True)
class Binding:
    tenant: str = "tenant-a"
    purpose: str = "newsletter-a"
    entry: str = "main"
    revision: int = 1


@dataclass(frozen=True)
class Offer:
    binding: Binding
    withdrawal_generation: int
    recipient_revision: int


@dataclass(frozen=True)
class Accepted:
    request: str
    offer: Offer
    accepted_at: int
    deadline: int


class World:
    """One exact newsletter/address, two independently controlled entry points.

    Binding revision is authoritative operational identity, not Page generation.
    Entry pointers may change while the original operational binding stays live.
    Visibility never cancels pending; only the source can retire its binding.
    Accepted evidence is immutable; its separate status can become terminal.
    """

    def __init__(self):
        self.now = 0
        self.visible = {"main": True, "alternate": True}
        self.bindings = {entry: Binding(entry=entry) for entry in self.visible}
        self.live_bindings = set(self.bindings.values())
        self.generation = 0
        self.recipient_revision = 1
        self.purpose_open = True
        self.recipient_allowed = True
        self.active = False
        self.admissions = 0
        self.accepted = {}
        self.status = {}
        self.intake_receipts = {}
        self.trace = []

    def event(self, operation, outcome, request=None, **extra):
        accepted = self.accepted.get(request)
        row = {"at": self.now, "operation": operation, "outcome": outcome,
               "request": request, "active": self.active,
               "admission_effects": self.admissions, "generation": self.generation,
               "original_deadline": accepted.deadline if accepted else None, **extra}
        self.trace.append(row)
        return row

    def advance(self, now):
        assert now >= self.now
        self.now = now

    def preview(self, entry="main"):
        return Offer(self.bindings[entry], self.generation, self.recipient_revision)

    def entry(self, on, entry="main"):
        self.visible[entry] = on
        return self.event("entry", "on" if on else "off", entry=entry)

    def guard(self, offer):
        binding = offer.binding
        if binding.tenant != "tenant-a" or binding.purpose != "newsletter-a":
            return "wrong_scope"
        if binding not in self.live_bindings:
            return "binding_retired"
        if not self.purpose_open:
            return "purpose_closed"
        if not self.recipient_allowed:
            return "recipient_restricted"
        if offer.recipient_revision != self.recipient_revision:
            return "recipient_changed"
        if offer.withdrawal_generation != self.generation:
            return "withdrawn_generation"
        return None

    def accept(self, request, offer):
        previous = self.intake_receipts.get(request)
        if previous:
            if previous[0] != offer:
                return self.event("accept", "payload_conflict", request)
            return self.event("accept", "receipt_only", request, original=previous[1])
        blocked = self.guard(offer)
        if not blocked and self.bindings.get(offer.binding.entry) != offer.binding:
            blocked = "entry_target_changed"
        if not blocked and not self.visible.get(offer.binding.entry, False):
            blocked = "entry_off"
        if blocked:
            self.intake_receipts[request] = (offer, blocked)
            return self.event("accept", blocked, request)
        if self.active:
            self.intake_receipts[request] = (offer, "already_active_noop")
            return self.event("accept", "already_active_noop", request)
        record = Accepted(request, offer, self.now, self.now + FIXTURE_LIFETIME)
        self.accepted[request] = record
        self.status[request] = "pending"
        self.intake_receipts[request] = (offer, "accepted_pending")
        return self.event("accept", "accepted_pending", request)

    def confirm(self, request, presented_binding=None):
        record = self.accepted.get(request)
        if record is None:
            return self.event("confirm", "no_accepted_request", request)
        if presented_binding is not None and presented_binding != record.offer.binding:
            return self.event("confirm", "wrong_presented_scope", request)
        if self.status[request] != "pending":
            return self.event("confirm", "receipt_only", request,
                              original=self.status[request])
        blocked = "expired" if self.now >= record.deadline else self.guard(record.offer)
        if blocked:
            self.status[request] = blocked
            return self.event("confirm", blocked, request)
        # Entry visibility is intentionally absent: only its original accepted
        # source authority, deadline and current purpose/recipient rules matter.
        if self.active:
            self.status[request] = "already_active_noop"
        else:
            self.active = True
            self.admissions += 1
            self.status[request] = "confirmed"
        return self.event("confirm", self.status[request], request)

    def withdraw(self):
        self.active = False
        self.generation += 1
        return self.event("withdraw", "withdrawn")

    def resend(self, request):
        """Assume separate resend authorization; no message is actually sent.

        This tests authority/deadline non-extension only, not availability,
        attempt limits, token rotation policy or provider acceptance.
        """
        record = self.accepted.get(request)
        if record is None:
            outcome = "no_accepted_request"
        elif self.status[request] != "pending":
            outcome = "terminal_no_resend"
        elif self.now >= record.deadline:
            outcome = "expired_no_resend"
        else:
            outcome = self.guard(record.offer) or "same_deadline_only"
        return self.event("resend", outcome, request)

    def observe_mail(self, request):
        return self.event("delayed_mail_observed", "no_source_mutation", request)

    def observe_response(self, request):
        return self.event("delayed_response_observed", "no_source_mutation", request)

    def visit(self, request):
        return self.event("GET_or_scanner", "no_source_mutation", request)

    def direct_join(self):
        """Assume a FRESH fully qualified D42 action, not proof/auth implementation."""
        if not self.visible["main"] or not self.purpose_open or not self.recipient_allowed:
            return self.event("qualified_D42_join", "unavailable")
        if not self.active:
            self.active = True
            self.admissions += 1
        return self.event("qualified_D42_join", "active")


def run():
    checks = []

    def check(name, condition, trace, expected):
        checks.append({"name": name, "pass": bool(condition),
                       "expected": expected, "trace": trace})

    # Deliberately naive algorithms: success below means the bug was exposed.
    accepted_pending, current_visible, before_deadline = True, False, True
    naive_confirm = accepted_pending and current_visible and before_deadline
    check("N01_current_visibility_strands_valid_pending", not naive_confirm,
          [{"accepted_pending": accepted_pending, "entry_visible": current_visible,
            "before_original_deadline": before_deadline, "naive_confirm": naive_confirm}],
          "Naive algorithm wrongly denies an eligible pre-Off request.")
    for invalid in ("expired", "withdrawn", "retargeted_to_other_purpose", "purpose_closed"):
        pending_flag = True
        naive_active = pending_flag
        check("N02_pending_flag_ignores_" + invalid, naive_active,
              [{"condition": invalid, "pending_flag": pending_flag,
                "naive_active": naive_active,
                "original_purpose": "newsletter-a",
                "naive_purpose": "newsletter-b" if invalid == "retargeted_to_other_purpose" else "newsletter-a"}],
              "Naive pending-flag-only algorithm activates despite an invalid current condition.")
    original_deadline, resend_at, confirm_at = 10, 8, 11
    naive_deadline = resend_at + FIXTURE_LIFETIME
    check("N03_resend_extends_authority", original_deadline <= confirm_at < naive_deadline,
          [{"original_deadline": original_deadline, "resend_at": resend_at,
            "naive_new_deadline": naive_deadline, "confirm_at": confirm_at}],
          "Naive resend extension allows confirmation beyond the accepted original deadline.")

    # All six serial orders, with a source offer captured before any operation.
    orders = list(permutations(("accept", "off", "confirm")))
    for order in orders:
        w = World()
        offer = w.preview()
        for time, operation in enumerate(order):
            w.advance(time)
            if operation == "accept":
                w.accept("request-a", offer)
            elif operation == "off":
                w.entry(False)
            else:
                w.confirm("request-a")
        expected_active = order.index("accept") < order.index("off") and order.index("accept") < order.index("confirm")
        check("R01_order_" + "_".join(order), w.active == expected_active
              and w.admissions == int(expected_active), w.trace,
              "Only a source acceptance preceding both Off and confirmation can admit in this trace.")

    for time, expected in ((9, True), (10, False), (11, False)):
        w = World()
        w.accept("expiry", w.preview())
        w.entry(False)
        w.advance(time)
        w.confirm("expiry")
        check("R02_deadline_boundary_" + str(time), w.active == expected,
              w.trace, "Confirmation requires t < original deadline; equality is expired.")

    w = World()
    offer = w.preview()
    w.accept("lost-accept-response", offer)
    w.entry(False)
    w.advance(5)
    w.accept("lost-accept-response", offer)
    w.resend("lost-accept-response")
    w.observe_mail("lost-accept-response")
    w.confirm("lost-accept-response")
    check("R03_retry_after_off_recovers_same_acceptance", w.active and w.admissions == 1
          and len(w.accepted) == 1 and w.accepted["lost-accept-response"].deadline == 10,
          w.trace, "Lost acceptance recovery and eligible resend retain the original pending record/deadline.")

    w = World()
    offer = w.preview()
    w.entry(False)
    w.accept("old-intake", offer)
    w.entry(True)
    w.accept("old-intake", offer)
    check("R04_off_rejected_intake_not_revived", not w.accepted and not w.active,
          list(w.trace), "An old terminally rejected intake is not accepted by an Off-to-On retry.")
    w.accept("fresh-human-intake", w.preview())
    w.confirm("fresh-human-intake")
    check("R05_fresh_intake_after_on_allowed", w.active and w.admissions == 1,
          w.trace, "A deliberate fresh eligible request after reopening may join.")

    for invalid in ("expired", "withdrawn", "superseded", "binding_retired"):
        w = World()
        w.accept("old", w.preview())
        w.entry(False)
        if invalid == "expired":
            w.advance(10)
        elif invalid == "withdrawn":
            w.withdraw()
        elif invalid == "superseded":
            w.status["old"] = "superseded"
        else:
            original = w.bindings["main"]
            w.live_bindings.remove(original)
            w.bindings["main"] = replace(original, purpose="newsletter-b", revision=2)
            w.bindings["main"] = replace(original, revision=3)  # ABA is still new scope evidence.
        w.entry(True)
        w.confirm("old")
        check("R06_off_on_no_resurrection_" + invalid, not w.active and w.admissions == 0,
              w.trace, "Reopening the entry cannot revive expired, withdrawn, superseded or changed-scope authority.")

    w = World()
    w.accept("still-valid", w.preview())
    w.entry(False)
    w.entry(True)
    w.advance(2)
    w.confirm("still-valid")
    check("R07_off_on_preserves_valid_pending", w.active and w.admissions == 1,
          w.trace, "Off-to-On does not cancel an original still-valid request under selected A.")

    for order in permutations(("pending-a", "pending-b")):
        w = World()
        for request in order:
            w.accept(request, w.preview())
        w.entry(False)
        for request in order:
            w.confirm(request)
        check("R08_dual_pending_" + "_".join(order), w.active and w.admissions == 1
              and w.status[order[-1]] == "already_active_noop", w.trace,
              "Two independently accepted pending requests converge on one active membership.")

    w = World()
    w.accept("pending-a", w.preview())
    w.accept("pending-b", w.preview())
    w.confirm("pending-a")
    w.withdraw()
    w.confirm("pending-b")
    w.confirm("pending-a")
    check("R09_other_pending_and_replay_cannot_undo_withdrawal", not w.active
          and w.admissions == 1 and w.status["pending-b"] == "withdrawn_generation",
          list(w.trace), "Withdrawal fences all older pending authority; accepted confirmation replay is non-mutating.")
    w.accept("new-human-rejoin", w.preview())
    w.confirm("new-human-rejoin")
    check("R10_fresh_human_rejoin_works", w.active and w.admissions == 2, w.trace,
          "An eligible fresh post-withdrawal request may rejoin; address-level lifetime dedupe is not used.")

    w = World()
    w.accept("pending-before-direct-join", w.preview())
    w.direct_join()
    w.entry(False)
    w.confirm("pending-before-direct-join")
    check("R11_current_member_and_pending_no_duplicate", w.active and w.admissions == 1
          and w.status["pending-before-direct-join"] == "already_active_noop", w.trace,
          "An assumed qualified D42 Join remains active after entry Off; older pending confirmation is a no-op.")

    for time in (9, 11):
        w = World()
        w.accept("delayed-mail", w.preview())
        w.entry(False)
        w.advance(time)
        w.observe_mail("delayed-mail")
        no_mail_effect = not w.active
        w.confirm("delayed-mail")
        check("R12_delayed_mail_" + str(time), no_mail_effect and w.active == (time < 10)
              and w.accepted["delayed-mail"].deadline == 10, w.trace,
              "Delivery observation grants no membership or fresh time; confirmation uses the original deadline.")

    w = World()
    w.accept("resend", w.preview())
    w.advance(8)
    w.resend("resend")
    w.advance(10)
    w.resend("resend")
    w.confirm("resend")
    check("R13_resend_never_extends_deadline", not w.active
          and w.accepted["resend"].deadline == 10 and w.status["resend"] == "expired",
          w.trace, "An eligible earlier resend and a later rejected resend cannot extend or revive pending authority.")

    w = World()
    w.accept("lost-confirm-response", w.preview())
    w.confirm("lost-confirm-response")
    w.withdraw()
    w.observe_response("lost-confirm-response")
    w.confirm("lost-confirm-response")
    check("R14_late_response_and_confirmation_replay_no_resubscribe", not w.active
          and w.admissions == 1 and w.trace[-1]["original"] == "confirmed", w.trace,
          "Historical success is recoverable evidence, not a current membership claim or another mutation.")

    w = World()
    w.accept("bound", w.preview())
    alternate_target = replace(w.accepted["bound"].offer.binding, purpose="newsletter-b")
    w.confirm("bound", presented_binding=alternate_target)
    check("R15_presented_other_purpose_rejected", not w.active
          and w.status["bound"] == "pending" and w.trace[-1]["outcome"] == "wrong_presented_scope",
          w.trace, "A different presented purpose cannot retarget the accepted request or consume it.")

    for invalid in ("purpose_closed", "recipient_restricted", "recipient_changed", "binding_retired"):
        w = World()
        w.accept("current-gates", w.preview())
        w.entry(False)
        if invalid == "purpose_closed":
            w.purpose_open = False
        elif invalid == "recipient_restricted":
            w.recipient_allowed = False
        elif invalid == "recipient_changed":
            w.recipient_revision += 1
        else:
            w.live_bindings.remove(w.bindings["main"])
        w.confirm("current-gates")
        check("R16_current_gate_" + invalid, not w.active
              and w.status["current-gates"] == invalid, w.trace,
              "The pending-after-Off exception never bypasses current purpose, recipient or exact-source scope.")

    w = World()
    w.entry(False)
    w.accept("other-entry", w.preview("alternate"))
    w.confirm("other-entry")
    check("R17_other_entry_independent", w.active and w.admissions == 1, w.trace,
          "Hiding main entry does not globally stop another independently authorized entry.")

    w = World()
    w.direct_join()
    w.accept("already-member", w.preview())
    w.entry(False)
    check("R18_active_member_intake_no_pending_duplicate", w.active and w.admissions == 1
          and not w.accepted and w.intake_receipts["already-member"][1] == "already_active_noop",
          w.trace, "An identical active membership causes no new pending confirmation or subscription effect.")

    w = World()
    offer = w.preview()
    w.accept("immutable-intake", offer)
    w.accept("immutable-intake", replace(offer, recipient_revision=2))
    check("R19_changed_payload_same_intent_conflicts", len(w.accepted) == 1
          and w.trace[-1]["outcome"] == "payload_conflict", w.trace,
          "Retry identity cannot be rebound to another recipient revision.")

    w = World()
    w.accept("scanner", w.preview())
    w.visit("scanner")
    check("R20_get_is_inert", not w.active and w.status["scanner"] == "pending",
          w.trace, "GET, scanner and landing-page observation cannot confirm membership.")

    w = World()
    w.accept("confirmed-in-time", w.preview())
    w.advance(9)
    w.confirm("confirmed-in-time")
    w.advance(11)
    w.confirm("confirmed-in-time")
    check("R21_proof_expiry_not_membership_expiry", w.active and w.admissions == 1
          and w.trace[-1]["original"] == "confirmed", w.trace,
          "The original confirmation deadline does not unsubscribe a successfully admitted member.")

    w = World()
    w.accept("original-purpose", w.preview())
    w.entry(False)
    original = w.bindings["main"]
    w.bindings["main"] = replace(original, purpose="newsletter-b", revision=2)
    w.confirm("original-purpose")
    check("R22_entry_retarget_does_not_replace_live_original_binding", w.active
          and w.admissions == 1 and w.accepted["original-purpose"].offer.binding == original
          and original in w.live_bindings, w.trace,
          "The source-authorized original purpose can still complete; current Page target/generation is not confirmation authority.")

    w = World()
    old_offer = w.preview()
    w.bindings["main"] = replace(w.bindings["main"], purpose="newsletter-b", revision=2)
    w.accept("stale-form-target", old_offer)
    check("R23_new_intake_checks_current_entry_target", not w.accepted and not w.active
          and w.trace[-1]["outcome"] == "entry_target_changed", w.trace,
          "An unaccepted old form cannot use an entry's prior target to bypass current intake binding.")

    return {"model": "D43 new bounded pending confirmation lifecycle",
            "research_date": "2026-10-18 Asia/Bangkok",
            "source_sha256": sha256(Path(__file__).read_bytes()).hexdigest(),
            "all_checks_pass": all(item["pass"] for item in checks),
            "check_count": len(checks), "expected_naive_counterexamples": 6,
            "accept_off_confirm_serial_orders": len(orders),
            "fixture_time": {"unit": "arbitrary abstract tick", "lifetime": FIXTURE_LIFETIME,
                             "product_duration_recommendation": False},
            "assumptions": [
                "One exact newsletter/address; two independently controlled entries.",
                "Operations have a single abstract linearization point and authoritative current time.",
                "Accepted pending source evidence and terminal operation receipts are durable and immutable where stated.",
                "Original operational binding liveness is source-owned and independent of current Page target/generation; source retirement blocks it.",
                "Current owner-qualified recipient, purpose and binding predicates are supplied, not implemented.",
                "Receipt recovery and resend already passed their separate authorization; diagnostics are not public response shapes.",
                "Fresh human intake/direct Join is distinct from a transport retry; human authenticity is assumed.",
            ],
            "not_proved": [
                "Actual DB/Auth/provider atomicity, concurrent workers, SQL/RLS, lock/constraint behavior or crash recovery.",
                "Real source binding survival rules, token authenticity, CSRF, email canonicalization or recipient proof.",
                "Finite proof duration, resend limits, secret rotation, deletion/retention policy or actual message delivery.",
                "Privacy-safe UI, cache fencing, late-response rendering, accessibility or production readiness.",
            ], "checks": checks}


if __name__ == "__main__":
    result = run()
    print(json.dumps(result, indent=2, sort_keys=True))
    sys.exit(0 if result["all_checks_pass"] else 1)
