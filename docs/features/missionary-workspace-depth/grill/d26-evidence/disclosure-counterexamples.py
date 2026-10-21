#!/usr/bin/env python3
"""Finite D26 contract examples, not SQL, RLS, HTTP, or runtime proof.

Deliberately unsafe comparator trusts authorization captured before a read,
resolves a series to its newest task, and returns unreviewed source wording.
The guarded comparator sketches a fresh release decision over one coherent state.
This is a design falsifier: implementing this Python does not implement D26.
"""
from copy import deepcopy
from dataclasses import dataclass, field
import json
from pathlib import Path


@dataclass
class Task:
    task_id: str = "task-1"
    tenant: str = "tenant-a"
    subject: str = "ministry-a"
    owner: str = "maya"
    meaning_revision: int = 1
    title: str = "Prepare my introduction"
    status: str = "planned"
    due: str | None = "2026-10-23"
    eligible: bool = True


@dataclass
class World:
    task: Task = field(default_factory=Task)
    policy_on: bool = True
    epoch: int = 1
    episode: str = "episode-1"
    episode_active: bool = True
    share_active: bool = True
    expires: int = 100
    now: int = 1
    descriptor: str = "Prepare my introduction"
    approved_meaning_revision: int = 1
    consent_epoch: int = 1
    selected_task_id: str = "task-1"
    expected_tenant: str = "tenant-a"
    expected_subject: str = "ministry-a"
    expected_owner: str = "maya"


def currently_eligible(w):
    t = w.task
    return (
        w.policy_on and w.episode_active and w.share_active and w.now < w.expires
        and w.consent_epoch == w.epoch and t.eligible
        and t.task_id == w.selected_task_id
        and (t.tenant, t.subject, t.owner)
        == (w.expected_tenant, w.expected_subject, w.expected_owner)
        and t.meaning_revision == w.approved_meaning_revision
    )


def begin(w):
    return dict(was_allowed=currently_eligible(w), epoch=w.epoch,
                episode=w.episode, task_id=w.selected_task_id)


def unsafe_release(w, receipt):
    if not receipt["was_allowed"]:
        return None
    return dict(task=w.task.task_id, description=w.task.title,
                due=w.task.due, status=w.task.status)


def guarded_release(w, receipt):
    if not (
        currently_eligible(w) and receipt["epoch"] == w.epoch
        and receipt["episode"] == w.episode
        and receipt["task_id"] == w.selected_task_id
    ):
        return None
    return dict(task=w.selected_task_id, description=w.descriptor,
                due=w.task.due, status=w.task.status)


def run():
    rows = []

    def case(name, mutation, expected_allowed=False, expected_status=None):
        w = World()
        receipt = begin(w)
        mutation(w)
        bad = unsafe_release(w, receipt)
        safe = guarded_release(w, receipt)
        assert bad is not None, name + ": comparator did not exhibit old-read behavior"
        assert (safe is not None) == expected_allowed, name
        if expected_status:
            assert safe["status"] == expected_status, name
        rows.append(dict(name=name, expected_allowed=expected_allowed,
                         unsafe_releases=bad is not None,
                         guarded_releases=safe is not None,
                         unsafe_payload=bad, guarded_payload=safe))

    def rename(w):
        w.task.title = "Unreviewed private wording"
        w.task.meaning_revision += 1
    case("changed_source_wording_after_preview", rename)

    def move(w):
        w.task.subject = "ministry-b"
    case("selected_task_moved_to_different_scope", move)

    def successor(w):
        w.task.task_id = "task-2"
        w.task.due = "2026-10-30"
    case("recurrence_successor_resolved_from_series", successor)

    def revoke_regrant(w):
        w.share_active = False
        w.epoch += 1
        w.share_active = True
        w.epoch += 1
        w.consent_epoch = w.epoch
    case("revoke_then_fresh_regrant_does_not_validate_old_receipt", revoke_regrant)

    def expire(w):
        w.now = w.expires
    case("read_at_exact_expiry", expire)

    def revoke(w):
        w.episode_active = False
        w.epoch += 1
    case("late_result_after_old_permission_query", revoke)

    def off_on(w):
        w.policy_on = False
        w.epoch += 1
        w.policy_on = True
    case("policy_off_on_does_not_revive_old_consent", off_on)

    def revert_wording(w):
        rename(w)
        w.task.title = "Prepare my introduction"
        w.task.meaning_revision += 1
    case("restored_old_text_does_not_restore_old_approval", revert_wording)

    # A new share cannot use a still-valid preview as commit authority.
    # This bounded example only isolates expiry; task/recipient/policy revision
    # checks are additional production requirements, not supplied by this model.
    w = World(share_active=False)
    preview = dict(allowed=w.episode_active and w.now < w.expires,
                   epoch=w.epoch)
    w.now = w.expires
    unsafe = deepcopy(w)
    safe = deepcopy(w)
    if preview["allowed"]:
        unsafe.share_active = True
    if (preview["allowed"] and safe.episode_active and safe.policy_on
            and safe.now < safe.expires and safe.epoch == preview["epoch"]):
        safe.share_active = True
    assert unsafe.share_active and not safe.share_active
    rows.append(dict(name="share_preview_before_expiry_commit_at_expiry",
                     unsafe_committed_share=True, guarded_committed_share=False))

    def progress(w):
        w.task.status = "completed"
        w.task.due = None
    case("same_occurrence_status_and_due_remain_live", progress, True, "completed")

    def reopen(w):
        w.task.status = "completed"
        w.task.status = "planned"
    case("ordinary_source_authorized_reopen_same_occurrence", reopen, True, "planned")

    # A valid release before a subsequent revoke remains a historical release.
    # Neither comparator pretends the remote recipient can unsee already released bytes.
    w = World()
    released = guarded_release(w, begin(w))
    revoke(w)
    assert released is not None and not currently_eligible(w)
    rows.append(dict(name="release_precedes_revocation_no_recall_claim",
                     historical_release_valid=True, later_access_allowed=False))
    return dict(scope=__doc__.strip(), negative_counterexamples=9,
                positive_controls=3, passed=True, cases=rows)


if __name__ == "__main__":
    result = run()
    target = Path(__file__).with_name("disclosure-counterexamples.json")
    target.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({k: result[k] for k in
                      ("passed", "negative_counterexamples", "positive_controls")}))
