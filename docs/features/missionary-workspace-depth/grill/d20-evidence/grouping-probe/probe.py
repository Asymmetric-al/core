"""D20 synthetic counterexamples to unsafe grouping shortcuts.

No Core implementation, database, RLS, provider, financial policy, concurrency
engine, user testing or performance is exercised. These small observations
disprove named shortcuts; they do not certify the proposed replacement.
"""

import json
from pathlib import Path
import platform


cases = []


def observe(case_id, shortcut, observation, reproduced):
    assert reproduced, case_id
    cases.append({"id": case_id, "shortcut": shortcut,
                  "observation": observation, "counterexample_reproduced": True})


scopes = [("tenantA", "entityA", "ministryA", "supporter1"),
          ("tenantA", "entityA", "ministryB", "supporter1"),
          ("tenantB", "entityB", "ministryA", "supporter1")]
observe("G01", "Group by donor alone",
        {"scoped_relationships": len(set(scopes)),
         "donor_only_groups": len({x[-1] for x in scopes})},
        len(set(scopes)) > len({x[-1] for x in scopes}))

purposes = [("supporter1", "ministryA", "special_gift"),
            ("supporter1", "ministryA", "first_support")]
observe("G02", "Same supporter and ministry imply the same follow-up purpose",
        {"purpose_keys": len(set(purposes)),
         "subject_only_keys": len({x[:2] for x in purposes})},
        len(set(purposes)) > len({x[:2] for x in purposes}))

header_allocations = [("header1", "ministryA", "qualified_occurrenceA"),
                      ("header1", "ministryB", "qualified_occurrenceB")]
observe("G03", "Gift header ID is the complete follow-up occurrence key",
        {"header_keys": 1, "qualified_occurrence_keys": len({x[2] for x in header_allocations})},
        len({x[0] for x in header_allocations}) < len({x[2] for x in header_allocations}))

line_evidence = [("line1", "same_owner_qualified_occurrence"),
                 ("line2", "same_owner_qualified_occurrence")]
observe("G04", "Every physical allocation line must create another obligation",
        {"line_keys": len({x[0] for x in line_evidence}),
         "qualified_occurrence_keys": len({x[1] for x in line_evidence})},
        len({x[0] for x in line_evidence}) > len({x[1] for x in line_evidence}))

events = [("transport1", "occurrence1"), ("transport2", "occurrence1")]
observe("G05", "Transport identity permanently prevents repeated gift coverage",
        {"transport_keys": len({x[0] for x in events}),
         "business_keys": len({x[1] for x in events})},
        len({x[0] for x in events}) > len({x[1] for x in events}))

separate_gifts = [("supporter1", "ministryA", "gift1"),
                  ("supporter1", "ministryA", "later_gift2")]
observe("G06", "One lifetime group key per supporter/ministry is enough for special gifts",
        {"relationship_keys": len({x[:2] for x in separate_gifts}),
         "distinct_qualified_occurrences": len({x[2] for x in separate_gifts})},
        len({x[:2] for x in separate_gifts}) < len({x[2] for x in separate_gifts}))

reviewed = {"giftA", "giftB"}
at_save = reviewed | {"new_giftC"}
observe("G07", "Mark the current whole group Done after review",
        {"reviewed": sorted(reviewed), "save_time_members": sorted(at_save),
         "unreviewed_marked_done": sorted(at_save - reviewed)}, bool(at_save - reviewed))

review_revisions = {"giftA": 3, "giftB": 5}
current_revisions = {**review_revisions, "new_giftC": 1}
unchanged_selected = {x: current_revisions[x] for x in review_revisions}
observe("G08", "Any group-head change must reject an otherwise unchanged reviewed set",
        {"whole_membership_changed": current_revisions != review_revisions,
         "selected_revisions_unchanged": unchanged_selected == review_revisions},
        current_revisions != review_revisions and unchanged_selected == review_revisions)

corrected = {"giftA": 4, "giftB": 5}
observe("G09", "Matching selected IDs means the reviewed evidence is unchanged",
        {"same_ids": set(corrected) == set(review_revisions),
         "changed_revisions": corrected != review_revisions},
        set(corrected) == set(review_revisions) and corrected != review_revisions)

current_allowed = {"giftA"}
silently_handled = reviewed & current_allowed
observe("G10", "Skip a selected ineligible member and call the reviewed group successful",
        {"reviewed": sorted(reviewed), "silently_handled": sorted(silently_handled),
         "missing_from_reported_group_success": sorted(reviewed - silently_handled)},
        silently_handled != reviewed)

source_revision_unchanged = True
permission_before, permission_now = True, False
observe("G11", "Unchanged financial revision preserves permission",
        {"source_revision_unchanged": source_revision_unchanged,
         "permitted_at_review": permission_before, "permitted_at_action": permission_now},
        source_revision_unchanged and permission_before != permission_now)

accepted_receipt = {"command": "finish1", "covered": sorted(reviewed)}
current_residue = {"new_giftC"}
naive_retry_covered = set(accepted_receipt["covered"]) | current_residue
observe("G12", "After response loss, rerun Done against the current remainder",
        {"accepted_coverage": accepted_receipt["covered"],
         "retry_added_coverage": sorted(naive_retry_covered - set(accepted_receipt["covered"]))},
        naive_retry_covered != set(accepted_receipt["covered"]))

payloads = [{"command": "finish1", "reviewed": ["giftA", "giftB"]},
            {"command": "finish1", "reviewed": ["new_giftC"]}]
observe("G13", "An equal request ID makes any subsequent body the same request",
        {"equal_command_ids": payloads[0]["command"] == payloads[1]["command"],
         "different_coverage": payloads[0]["reviewed"] != payloads[1]["reviewed"]},
        payloads[0]["command"] == payloads[1]["command"] and
        payloads[0]["reviewed"] != payloads[1]["reviewed"])

# Explicit interleaving, not a database isolation test.
outstanding = set(reviewed)
outstanding -= reviewed
observed_empty = not outstanding
outstanding.add("new_giftC")
task_status = "done" if observed_empty else "open"
observe("G14", "Check empty then close separately from admitting arrivals",
        {"final_task_status": task_status, "outstanding_members": sorted(outstanding)},
        task_status == "done" and bool(outstanding))

active_tasks = {"new_task_with_giftC"}
active_tasks.add("old_task_reopened_by_undo")
observe("G15", "Unconditionally reopen the older task after a newer compatible task exists",
        {"active_compatible_tasks": sorted(active_tasks)}, len(active_tasks) == 2)

latest = {"giftA": "disposition1", "giftB": "later_disposition2"}
bulk_undo_ids = {"giftA", "giftB"}
stale_targets = [gift for gift in bulk_undo_ids if latest[gift] != "disposition1"]
observe("G16", "Undo every originally covered member regardless of later disposition",
        {"undo_target": "disposition1", "later_outcome_overwritten": sorted(stale_targets)},
        bool(stale_targets))

amounts = [(100, "USD"), (100, "EUR")]
observe("G17", "One unlabeled numeric group total preserves source amounts",
        {"naive_total": sum(amount for amount, _ in amounts),
         "different_units": sorted({currency for _, currency in amounts})},
        len({currency for _, currency in amounts}) > 1)

all_members = {"permittedA", "permittedB", "restrictedC"}
visible_members = {"permittedA", "permittedB"}
observe("G18", "Showing total group count but hiding restricted rows avoids disclosure",
        {"shown_total": len(all_members), "visible_rows": len(visible_members),
         "inferred_hidden_count": len(all_members) - len(visible_members)},
        len(all_members) - len(visible_members) == 1)

group_outcome = {"task_done": True, "communication_events": [], "interactions": []}
observe("G19", "Done with the gift group proves one message or interaction",
        group_outcome, group_outcome["task_done"] and
        not group_outcome["communication_events"] and not group_outcome["interactions"])

old_members = {"giftA": 100, "giftB": 200}
replacement_members = {"giftA": 100, "giftC": 200}
observe("G20", "Unchanged member count and amount prove the reviewed group unchanged",
        {"same_count": len(old_members) == len(replacement_members),
         "same_sum": sum(old_members.values()) == sum(replacement_members.values()),
         "different_members": sorted(set(old_members) ^ set(replacement_members))},
        len(old_members) == len(replacement_members) and
        sum(old_members.values()) == sum(replacement_members.values()) and
        set(old_members) != set(replacement_members))

ordered_a = ["giftA", "giftB"]
ordered_b = ["giftB", "giftA"]
observe("G21", "Display order is part of exact reviewed-set identity",
        {"different_sequences": ordered_a != ordered_b,
         "same_members": set(ordered_a) == set(ordered_b)},
        ordered_a != ordered_b and set(ordered_a) == set(ordered_b))

known_actionable = set()
unresolved_members = {"giftC_qualification_pending"}
observe("G22", "Zero currently actionable rows proves no unresolved group work",
        {"actionable_count": len(known_actionable),
         "unresolved_members": sorted(unresolved_members)},
        not known_actionable and bool(unresolved_members))

result = {
    "scope": "Synthetic shortcut counterexamples only; no Core, database, RLS, finance, provider, concurrency-engine, UX or capacity qualification",
    "python": platform.python_version(),
    "case_count": len(cases),
    "reproduced": sum(x["counterexample_reproduced"] for x in cases),
    "cases": cases,
}
Path(__file__).with_name("results.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
print(f"{result['reproduced']}/{result['case_count']} synthetic counterexamples reproduced; no production qualification")
