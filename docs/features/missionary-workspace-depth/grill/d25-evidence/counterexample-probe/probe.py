"""Finite shortcut counterexamples, not a check-in implementation or race test.

Only synthetic strings and sets are used. This script implements no authorization,
database, HTTP endpoint, template service, notification or production recovery.
Assertions establish the stated ambiguity or unsafe seeded outcome, not a fix.
"""

from itertools import permutations
from pathlib import Path
import json
import platform


cases = []


def record(case_id, shortcut, observation, reproduced):
    assert reproduced, case_id
    cases.append({"id": case_id, "shortcut": shortcut, "observation": observation})


questions = [("q1", "What went well?"), ("q2", "What would help?")]
answers = ["A useful conversation", "Help planning the next step"]
reordered = list(reversed(questions))
position_join = list(zip([q[0] for q in reordered], answers))
record("L01", "Bind answers by current display position", position_join,
       position_join[0] == ("q2", "A useful conversation"))

original = {"id": "q1", "text": "What went well?", "revision": 1}
changed = {"id": "q1", "text": "What are you worried about?", "revision": 2}
record("L02", "Render an old answer using the latest question text",
       {"answer": answers[0], "original_prompt": original["text"],
        "latest_join_prompt": changed["text"], "same_question_id": True},
       original["id"] == changed["id"] and original["text"] != changed["text"])

retained_answers = {"q1": answers[0], "q2": answers[1]}
remaining_question_ids = {"q1"}
current_inner_join = {k: v for k, v in retained_answers.items() if k in remaining_question_ids}
record("L03", "Render only answers joined to currently offered questions",
       {"saved_answers": len(retained_answers), "displayed_answers": len(current_inner_join)},
       len(retained_answers) == 2 and len(current_inner_join) == 1)

arrivals = list(permutations([1, 2, 3]))
bad_orders = [list(order) for order in arrivals if order[-1] != 3]
record("L04", "Last arrival wins for three full-body autosaves from one editor",
       {"arrival_orders": len(arrivals), "orders_losing_latest_authored_body": len(bad_orders),
        "counterexample_orders": bad_orders}, len(arrivals) == 6 and len(bad_orders) == 4)

visible_generation, ack_generation = 3, 2
record("L05", "Any autosave acknowledgment means all displayed text is saved",
       {"displayed_generation": visible_generation, "acknowledged_generation": ack_generation,
        "naive_label": "Saved"}, ack_generation < visible_generation)

draft = {"id": "draft1", "body": "Reviewed wording"}
shared_pointer = draft
draft["body"] = "Later private thought"
record("L06", "Share a pointer to the mutable draft",
       {"coach_visible_after_autosave": shared_pointer["body"]},
       shared_pointer["body"] == "Later private thought")

preview = {"revision": 4, "body": "Reviewed wording"}
latest = {"revision": 5, "body": "Unreviewed addition"}
record("L07", "Share whichever draft revision is latest when the worker runs",
       {"previewed_body": preview["body"], "shared_body": latest["body"]},
       preview["body"] != latest["body"])

reviewed_recipient, currently_assigned_coach = "Jordan/episode1", "Casey/episode2"
record("L08", "Resolve the current coach from subject at dispatch",
       {"reviewed": reviewed_recipient, "resolved_later": currently_assigned_coach},
       reviewed_recipient != currently_assigned_coach)

attempts = [("http1", "share-intent7"), ("http2", "share-intent7")]
record("L09", "Deduplicate only by transport request ID",
       {"distinct_requests": len({r for r, _ in attempts}),
        "distinct_deliberate_intents": len({i for _, i in attempts})},
       len({r for r, _ in attempts}) == 2 and len({i for _, i in attempts}) == 1)

accepted_payload = {"body_revision": 4, "recipients": ["Jordan/episode1"]}
changed_payload = {"body_revision": 5, "recipients": ["Casey/episode2"]}
record("L10", "An idempotency key alone proves a changed payload succeeded",
       {"same_key": "share-intent7", "accepted": accepted_payload, "retry_payload": changed_payload},
       accepted_payload != changed_payload)

accepted_receipt = {"intent": "share-intent7", "accepted_revision": 1}
current = {"publication_revision": 2, "withdrawn": True}
record("L11", "Recover lost Share response by applying its old desired state again",
       {"receipt": accepted_receipt, "current": current, "old_payload_would_set_withdrawn": False},
       accepted_receipt["accepted_revision"] < current["publication_revision"] and current["withdrawn"])

before = {"body_revision": 4, "audience_revision": 1, "recipients": ["Jordan", "Casey"]}
after_removal = {"body_revision": 4, "audience_revision": 2, "recipients": ["Jordan"]}
record("L12", "Check only body revision when updating content plus audience",
       {"body_revision_check_passes": before["body_revision"] == after_removal["body_revision"],
        "stale_audience_restores": sorted(set(before["recipients"]) - set(after_removal["recipients"]))},
       before["body_revision"] == after_removal["body_revision"] and
       set(before["recipients"]) - set(after_removal["recipients"]) == {"Casey"})

desired = {"Jordan/episode1", "Casey/episode2"}
eligible = {"Jordan/episode1"}
record("L13", "Intersect a stale requested audience and report the original request as successful",
       {"requested": sorted(desired), "silently_applied": sorted(desired & eligible)},
       desired != desired & eligible)

old_audience, replacement_context = {"Jordan/episode1"}, "Jordan/episode2"
record("L14", "Account identity alone inherits a former coaching episode's history",
       {"old_audience": sorted(old_audience), "replacement": replacement_context,
        "same_account": replacement_context.split('/')[0] == next(iter(old_audience)).split('/')[0]},
       replacement_context not in old_audience)

template, freeform = [], "A brief update in my own words"
record("L15", "Allow a check-in only if a template has questions",
       {"template_questions": len(template), "freeform_characters": len(freeform),
        "naive_can_continue": bool(template)}, not template and bool(freeform))

capabilities = {"manage_questions"}
record("L16", "Template maintenance implies response-reading authority",
       {"capabilities": sorted(capabilities), "response_read_capability_present": "read_responses" in capabilities},
       "manage_questions" in capabilities and "read_responses" not in capabilities)

same_text_intents = [{"intent": "i1", "body": "Thank you"}, {"intent": "i2", "body": "Thank you"}]
record("L17", "Deduplicate publication solely by body hash",
       {"distinct_bodies": len({i['body'] for i in same_text_intents}),
        "distinct_deliberate_intents": len({i['intent'] for i in same_text_intents})},
       len({i['body'] for i in same_text_intents}) == 1 and len({i['intent'] for i in same_text_intents}) == 2)

results = {
    "scope": "Synthetic finite ambiguity/unsafe-shortcut counterexamples only; no implementation or real concurrency proof.",
    "python": platform.python_version(),
    "case_count": len(cases),
    "reproduced": len(cases),
    "cases": cases,
}
Path(__file__).with_name("results.json").write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n")
print(json.dumps({k: results[k] for k in ("case_count", "reproduced", "python")}, indent=2))
