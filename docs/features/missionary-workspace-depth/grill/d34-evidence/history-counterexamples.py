#!/usr/bin/env python3
"""Finite D34 projection examples; synthetic owner inputs, no runtime proof.

Policy is a required fixture input. Deadline instants are arbitrary examples,
not a selected default, duration, retention period or continuation policy.
"""

from copy import deepcopy
from dataclasses import dataclass, field, replace
from hashlib import sha256
import json
from pathlib import Path


PURPOSE = "expired-referral-history"
UNAVAILABLE = {"status": "unavailable"}


@dataclass(frozen=True)
class Authority:
    tenant: str = "tenant-a"
    actor: str = "person-maya"
    ministry: str = "ministry-alpha"
    assignment_current: bool = True
    history_read: bool = True
    active_referral_read: bool = True
    purpose: str = PURPOSE
    epoch: int = 1
    # Each tuple is independently qualified ordinary supporter/contact read.
    independent_parties: frozenset = frozenset()


@dataclass(frozen=True)
class Referral:
    identity: str = "referral-1"
    tenant: str = "tenant-a"
    ministry: str = "ministry-alpha"
    party: str = "party-grace"
    # Source-qualified eligible recipients before expiry, not creator/assignee.
    preexpiry_recipients: frozenset = frozenset({("person-maya", "ministry-alpha")})
    creator: str = "staff-creator"
    current_assignee: str = "person-maya"
    source_readable: bool = True
    source_identity_current: bool = True
    retention: str = "ordinary_readable"
    disposition: str = "ordinary_window"
    expiry_known: bool = True
    expires_at: int = 10
    stale_display_status: str = "active"
    safe_label: str | None = "Grace"
    label_permitted: bool = True
    private_contact: str = "555-SECRET-CONTACT"
    private_context: str = "PRIVATE-INTRODUCTION-DETAIL"
    revision: int = 1


@dataclass(frozen=True)
class Ticket:
    referral: str
    context: tuple
    policy_revision: int
    authority_epoch: int
    source_revision: int
    prepared_projection: dict


@dataclass(frozen=True)
class Cursor:
    context: tuple
    policy_revision: int
    authority_epoch: int
    query: str
    last_visible_id: str


@dataclass
class World:
    now: int
    policy_enabled: bool
    authority: Authority = field(default_factory=Authority)
    context_tenant: str = "tenant-a"
    context_ministry: str = "ministry-alpha"
    policy_revision: int = 1
    referrals: dict = field(default_factory=lambda: {"referral-1": Referral()})
    cursors: dict = field(default_factory=dict)

    def context(self):
        return self.context_tenant, self.authority.actor, self.context_ministry, PURPOSE

    def current_context(self):
        return (self.context_tenant == self.authority.tenant
                and self.context_ministry == self.authority.ministry
                and self.authority.assignment_current)

    def history_door(self):
        return (self.current_context() and self.policy_enabled
                and self.authority.history_read and self.authority.purpose == PURPOSE)

    def scope(self, source):
        return source.tenant == self.authority.tenant and source.ministry == self.authority.ministry

    def ordinary_expired(self, source):
        return (source.expiry_known and source.disposition == "ordinary_window"
                and self.now >= source.expires_at)

    def history_eligible(self, source):
        return (self.history_door() and self.scope(source) and self.ordinary_expired(source)
                and source.source_readable and source.source_identity_current
                and source.retention == "ordinary_readable"
                and (self.authority.actor, self.authority.ministry) in source.preexpiry_recipients
                and source.label_permitted and bool(source.safe_label and source.safe_label.strip()))

    def projection(self, source):
        return {"referral": source.identity, "label": source.safe_label, "status": "Expired"}

    def read(self, identity):
        source = self.referrals.get(identity)
        return self.projection(source) if source is not None and self.history_eligible(source) else UNAVAILABLE

    def active_from_referral(self, identity):
        source = self.referrals[identity]
        return (self.current_context() and self.scope(source) and self.authority.active_referral_read
                and source.expiry_known and self.now < source.expires_at
                and source.disposition == "ordinary_window" and source.source_readable
                and source.source_identity_current and source.retention == "ordinary_readable"
                and (self.authority.actor, self.authority.ministry) in source.preexpiry_recipients)

    def ordinary_party_read(self, party):
        target = self.authority.tenant, self.authority.ministry, party
        if not self.current_context() or target not in self.authority.independent_parties:
            return UNAVAILABLE
        # An independently qualified ordinary projection, never the old referral body.
        return {"party": party, "contact": "separately authorized current contact"}

    def prepare(self, identity):
        result = self.read(identity)
        if result == UNAVAILABLE:
            return None
        return Ticket(identity, self.context(), self.policy_revision, self.authority.epoch,
                      self.referrals[identity].revision, result)

    def disclose(self, ticket):
        if ticket is None or ticket.referral not in self.referrals:
            return UNAVAILABLE
        if (ticket.context != self.context() or ticket.policy_revision != self.policy_revision
                or ticket.authority_epoch != self.authority.epoch
                or ticket.source_revision != self.referrals[ticket.referral].revision):
            return UNAVAILABLE
        # Current source/time/privacy evaluation precedes use of the cached body.
        return self.read(ticket.referral)

    def set_policy(self, enabled):
        # A qualified policy event fixture, not an implemented setting command.
        if enabled != self.policy_enabled:
            self.policy_enabled = enabled
            self.policy_revision += 1

    def page(self, query="", limit=1, cursor=None):
        if not self.history_door():
            return UNAVAILABLE
        after = ""
        if cursor is not None:
            prior = self.cursors.get(cursor)
            if (prior is None or prior.context != self.context()
                    or prior.policy_revision != self.policy_revision
                    or prior.authority_epoch != self.authority.epoch or prior.query != query):
                return UNAVAILABLE
            after = prior.last_visible_id
        # Match and count only currently authorized projection fields. Hidden
        # source changes do not create a public global-revision conflict.
        allowed = sorted((self.projection(source) for source in self.referrals.values()
                          if self.history_eligible(source)
                          and query.casefold() in source.safe_label.casefold()),
                         key=lambda row: row["referral"])
        remaining = [row for row in allowed if row["referral"] > after]
        rows = remaining[:limit]
        token = None
        if len(remaining) > limit:
            token = "opaque-fixture-cursor-" + str(len(self.cursors) + 1)
            self.cursors[token] = Cursor(self.context(), self.policy_revision, self.authority.epoch,
                                        query, rows[-1]["referral"])
        return {"rows": rows, "permitted_count": len(allowed), "next": token}


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
    w = World(now=9, policy_enabled=True)
    expect(w.active_from_referral("referral-1"), True)
    w.now = 10
    cached_active = expect(w.referrals["referral-1"].stale_display_status == "active", True)
    expect(w.active_from_referral("referral-1"), False)
    expect(w.read("referral-1")["status"], "Expired")
    record("B01", "Authority time expires active access before the sweeper", cached_active,
           {"active_access": False, "qualified_history": "Expired"},
           ["active display at9", "deadline10 reached", "read before any sweeper update"])

    states = {}
    for status in ("withdrawn", "revoked", "invalidated", "cannot_pursue"):
        w = World(now=20, policy_enabled=True, referrals={"referral-1": replace(Referral(), disposition=status)})
        states[status] = expect(w.read("referral-1"), UNAVAILABLE)
    record("B02", "Ordinary expiry is not every terminal source disposition", 20 >= 10, states)

    w = World(now=20, policy_enabled=True)
    result = w.read("referral-1")
    unsafe_full_record = {"contact": w.referrals["referral-1"].private_contact,
                          "context": w.referrals["referral-1"].private_context}
    expect(set(result), {"referral", "label", "status"})
    expect(w.ordinary_party_read("party-grace"), UNAVAILABLE)
    record("B03", "Limited history never becomes ordinary Party or referral-body access", unsafe_full_record, result)

    independent = frozenset({("tenant-a", "ministry-alpha", "party-grace")})
    w = World(now=20, policy_enabled=True, authority=replace(Authority(), independent_parties=independent))
    ordinary = w.ordinary_party_read("party-grace")
    w.set_policy(False)
    expect(w.read("referral-1"), UNAVAILABLE)
    expect(w.ordinary_party_read("party-grace"), ordinary)
    w.set_policy(True)
    w.referrals["referral-1"] = replace(Referral(), source_readable=False)
    expect(w.read("referral-1"), UNAVAILABLE)
    expect(w.ordinary_party_read("party-grace"), ordinary)
    record("B04", "Historical and independent current access do not grant or cancel each other", {
        "Off_removes_all_contact": True, "Party_read_opens_old_body": True},
        {"history": "unavailable", "ordinary_contact": "independently permitted"})

    denied = {}
    for label, source, authority in (
        ("creator", replace(Referral(), creator="person-other"), replace(Authority(), actor="person-other")),
        ("new_assignee", replace(Referral(), current_assignee="person-other"), replace(Authority(), actor="person-other")),
        ("past_recipient_without_current_grant", Referral(), replace(Authority(), history_read=False)),
        ("inactive_assignment", Referral(), replace(Authority(), assignment_current=False)),
    ):
        w = World(now=20, policy_enabled=True, authority=authority, referrals={"referral-1": source})
        denied[label] = expect(w.read("referral-1"), UNAVAILABLE)
    record("B05", "Creator, reassignment or historical membership is insufficient", "use creator/assignee/history alone", denied)

    w = World(now=20, policy_enabled=True, referrals={"referral-1": replace(Referral(), label_permitted=False)})
    unsafe_placeholder = {"label": "Private referral", "count": len(w.referrals)}
    expect(w.read("referral-1"), UNAVAILABLE)
    expect(w.page(), {"rows": [], "permitted_count": 0, "next": None})
    record("B06", "No safe useful label means no row or count", unsafe_placeholder, w.page())

    w = World(now=20, policy_enabled=True)
    private_query = "SECRET-CONTACT"
    unsafe_match = expect(private_query in w.referrals["referral-1"].private_contact, True)
    expect(w.page(private_query), {"rows": [], "permitted_count": 0, "next": None})
    expect(w.page("Grace")["permitted_count"], 1)
    record("B07", "Searching hidden fields leaks even when returned rows are redacted", unsafe_match,
           {"private_query_matches": 0, "approved_label_query_matches": 1})

    w = World(now=20, policy_enabled=True)
    w.referrals["referral-hidden"] = replace(Referral(), identity="referral-hidden", label_permitted=False)
    unsafe_has_more = expect(len(w.referrals) > 1, True)
    first = w.page(limit=1)
    expect((first["permitted_count"], first["next"]), (1, None))
    w.referrals["referral-z"] = replace(Referral(), identity="referral-z", safe_label="Zoe")
    first = w.page(limit=1)
    token = first["next"]
    w.referrals["referral-hidden-2"] = replace(Referral(), identity="referral-hidden-2", label_permitted=False)
    second = w.page(limit=1, cursor=token)
    expect([row["referral"] for row in second["rows"]], ["referral-z"])
    expect((second["permitted_count"], second["next"]), (2, None))
    w.referrals["referral-z"] = replace(w.referrals["referral-z"], label_permitted=False, revision=2)
    expect(w.page(limit=1, cursor=token), {"rows": [], "permitted_count": 1, "next": None})
    record("B08", "Count and cursor derive from permitted rows only", unsafe_has_more,
           {"one_visible_has_next": False, "hidden_insertion_changes_continuation": False,
            "later_private_row_reappears_on_continuation": False})

    schedules = {}
    for change in ("Off", "grant_revoked", "label_revoked", "source_withdrawn", "context_changed"):
        w = World(now=20, policy_enabled=True)
        ticket = w.prepare("referral-1")
        if change == "Off":
            w.set_policy(False)
        elif change == "grant_revoked":
            w.authority = replace(w.authority, history_read=False, epoch=2)
        elif change == "label_revoked":
            w.referrals["referral-1"] = replace(Referral(), label_permitted=False, revision=2)
        elif change == "source_withdrawn":
            w.referrals["referral-1"] = replace(Referral(), disposition="withdrawn", revision=2)
        else:
            w.context_ministry = "ministry-other"
        schedules[change] = expect(w.disclose(ticket), UNAVAILABLE)
    record("B09", "A previously permitted response must pass current disclosure", "return cached Grace row", schedules,
           ["prepare permitted projection", "policy/grant/source/context changes", "disclose"])

    w = World(now=20, policy_enabled=True)
    ticket = w.prepare("referral-1")
    w.set_policy(False)
    w.set_policy(True)
    expect(w.disclose(ticket), UNAVAILABLE)
    expect(w.read("referral-1")["label"], "Grace")
    record("B10", "Re-enable requires fresh evaluation rather than reviving a response", {
        "boolean_enabled_again": w.policy_enabled}, {"old_response": "unavailable", "fresh_read": "Grace"})

    rejected = {}
    for label, changes in (
        ("foreign_tenant", {"tenant": "tenant-b"}),
        ("other_ministry", {"ministry": "ministry-other"}),
        ("merged_identity_not_requalified", {"party": "merged-party", "source_identity_current": False}),
        ("hold_only", {"retention": "hold_only"}),
        ("erased", {"retention": "erased"}),
        ("unknown_expiry", {"expiry_known": False}),
    ):
        w = World(now=20, policy_enabled=True, referrals={"referral-1": replace(Referral(), **changes)})
        rejected[label] = expect(w.read("referral-1"), UNAVAILABLE)
        expect(w.page()["permitted_count"], 0)
    w = World(now=20, policy_enabled=True, authority=replace(Authority(), purpose="ordinary-contact"))
    expect(w.read("referral-1"), UNAVAILABLE)
    record("B11", "Source identity, scope, retention and purpose remain separate gates", "organization permits history, so show retained rows", rejected)

    w = World(now=20, policy_enabled=True)
    ticket = w.prepare("referral-1")
    w.referrals["referral-1"] = replace(Referral(), expires_at=30, revision=2)  # external qualified active-again fact
    expect(w.read("referral-1"), UNAVAILABLE)
    expect(w.disclose(ticket), UNAVAILABLE)
    expect(w.page()["permitted_count"], 0)
    expect("referral-1" in w.referrals, True)
    record("B12", "Active-again source leaves Expired projection without deleting history", "once expired, always in history list",
           {"expired_projection_count": 0, "source_retained": True})

    w = World(now=20, policy_enabled=True)
    w.referrals["referral-z"] = replace(Referral(), identity="referral-z", safe_label="Zoe")
    cursor = w.page()["next"]
    w.authority = replace(w.authority, history_read=False, epoch=2)
    expect(w.page(cursor=cursor), UNAVAILABLE)
    expect(w.read("missing-id"), w.read("referral-1"))
    w = World(now=20, policy_enabled=True)
    w.referrals["referral-z"] = replace(Referral(), identity="referral-z", safe_label="Zoe")
    cursor = w.page()["next"]
    expect(w.page(query="changed-query", cursor=cursor), UNAVAILABLE)
    w.context_tenant = "tenant-b"
    expect(w.page(cursor=cursor), UNAVAILABLE)
    record("B13", "Cursor reuse cannot bypass current authority, query or context", "cursor is a durable historical read grant",
           {"revoked": "unavailable", "wrong_query": "unavailable", "wrong_context": "unavailable",
            "denied_and_missing_logical_response_equal": True})

    w = World(now=20, policy_enabled=True)
    before = deepcopy(w.referrals)
    expect(w.read("referral-1"), {"referral": "referral-1", "label": "Grace", "status": "Expired"})
    expect(w.active_from_referral("referral-1"), False)
    expect(w.ordinary_party_read("party-grace"), UNAVAILABLE)
    expect(w.referrals, before)
    record("C01", "Eligible expired-only history is readable without expanding authority", None,
           {"history": "Expired", "active_or_ordinary_access_added": False,
            "expiry_retention_source_state_unchanged": True}, control=True)

    recipients = frozenset({("person-maya", "ministry-alpha"), ("person-handoff", "ministry-alpha")})
    w = World(now=20, policy_enabled=True, authority=replace(Authority(), actor="person-handoff"),
              referrals={"referral-1": replace(Referral(), preexpiry_recipients=recipients)})
    expect(w.read("referral-1")["status"], "Expired")
    expect(w.authority.actor != w.referrals["referral-1"].current_assignee, True)
    record("C02", "A qualified pre-expiry handoff recipient can have current history authority", None,
           {"current_history": "Expired", "first_recipient_only_rule": False}, control=True)

    w = World(now=20, policy_enabled=True, referrals={"referral-1": replace(Referral(), safe_label="Approved alias Q")})
    result = w.read("referral-1")
    expect(result["label"], "Approved alias Q")
    expect(w.page("Approved alias Q")["permitted_count"], 1)
    expect(w.page("Grace")["permitted_count"], 0)
    record("C03", "A separately source-approved useful alias is sufficient", None,
           {"shown_label": result["label"], "original_name_search_matches": 0}, control=True)

    w = World(now=20, policy_enabled=False)
    expect(w.read("referral-1"), UNAVAILABLE)
    w.set_policy(True)
    first = w.prepare("referral-1")
    expect(w.disclose(first)["status"], "Expired")
    before = deepcopy(w.referrals)
    w.page("Grace")
    w.read("referral-1")
    expect(w.referrals, before)
    record("C04", "Enabling permits current minimal reads without a lifecycle action", None,
           {"current_qualified_read": "Expired", "source_state_unchanged": True}, control=True)

    print(json.dumps({
        "evidence_kind": "bounded_stdlib_projection_semantic_model",
        "decision": "D34 organization-permitted limited expired-referral history; contact/private context excluded; continuation separate",
        "status": "proposed source-purpose boundaries illustrated; no implementation or ratification claim",
        "unspecified": ["organization default", "expiry duration", "retention period", "continuation actor", "renewal workflow"],
        "script_sha256": sha256(Path(__file__).read_bytes()).hexdigest(),
        "reproduction": "python3 docs/features/missionary-workspace-depth/grill/d34-evidence/history-counterexamples.py",
        "counts": {"counterexample_families": sum(row["kind"] == "counterexample" for row in CASES),
                   "positive_controls": sum(row["kind"] == "positive_control" for row in CASES),
                   "passed_outcome_assertions": ASSERTIONS},
        "limitations": [
            "Only synthetic finite standard-library examples ran; no application, database, provider, network, private data, previous model or probe was executed.",
            "Exact source-qualified pre-expiry recipients, ordinary expiry, current grants, retention and safe useful labels are fixture inputs, not a proven P9/P12 producer.",
            "Policy is explicitly supplied for each world. Arbitrary example instants are not selected product defaults, time windows or retention periods.",
            "Ordered reads assume authoritative current time and serialized owner facts; no actual clock, expiry scheduler, SQL/RLS, locks, transactions, real concurrency or distributed cache behavior is proved.",
            "Opaque cursor tokens use an in-memory lookup for semantic illustration only, not a token format, security scheme, pagination implementation or schema proposal.",
            "Logical unavailable responses are compared only for shape/value; no timing, statistical noninterference, network oracle or production privacy proof is supplied.",
            "Independent ordinary contact-read authority is an opaque current grant; active-relationship production, contactability, consent and sending are not implemented.",
            "Source identity merge/reassignment/retention results are supplied facts; actual canonicalization, erasure, legal holds, handoff provenance, restored data and lineage producers remain untested.",
            "Read examples preserve source state. There are no continuation, interaction, send or task-writing methods; absence of effects here does not test real downstream integrations.",
            "No UI/client late-response enforcement, exports, logs, analytics, realtime, multiple-source watermarks or user studies are exercised.",
            "Passing the finite examples establishes no deployed grant, source availability, release readiness or runtime enforcement.",
        ],
        "cases": CASES,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    run()
