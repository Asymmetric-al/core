"""D21 finite counterexamples, not a qualifying source or attention engine.

These calculations show ambiguity or contradiction in named shortcuts. They do
not execute Core, authorize an effect, choose financial criteria, or prove that
the proposed decision has been implemented. No third-party dependencies.
"""

import json
from pathlib import Path
import platform


cases = []


def observe(case_id, shortcut, observation, reproduced):
    assert reproduced, case_id
    cases.append({"id": case_id, "shortcut": shortcut,
                  "observation": observation, "counterexample_reproduced": True})


# Ratios are deliberately unsafe sample heuristics, never recommended criteria.
gift = 100
short_history, longer_history = [10], [100, 100, 100, 10]
mean = lambda values: sum(values) / len(values)
short_flag = gift > 2 * mean(short_history)
long_flag = gift > 2 * mean(longer_history)
observe("D01", "Historical-average comparison is a stable explicit gift fact",
        {"unchanged_gift": gift, "short_history_flag": short_flag,
         "long_history_flag": long_flag}, short_flag != long_flag)

observed_commitments = []
world_absent = {"visible": [], "owner_state": "known_none"}
world_hidden = {"visible": [], "owner_state": "exists_outside_projection"}
observe("D02", "An empty visible commitment list proves no commitment",
        {"same_visible_list": observed_commitments,
         "possible_owner_states": [world_absent["owner_state"], world_hidden["owner_state"]]},
        world_absent["visible"] == world_hidden["visible"] and
        world_absent["owner_state"] != world_hidden["owner_state"])

no_commitment_gift = 100
invented_baseline = 0
observe("D03", "Known absence of a commitment authorizes extra-gift classification",
        {"numeric_comparison": no_commitment_gift > invented_baseline,
         "facts_present": ["received_gift", "known_no_commitment"],
         "explicit_extra_support_fact_present": False},
        no_commitment_gift > invented_baseline)

same_payment = 600
possible_meanings = {"three_periods_of_ordinary_support", "extra_support", "other_intent"}
observe("D04", "A gift three times the earlier monthly amount proves extra support",
        {"payment": same_payment, "earlier_amount": 200,
         "indistinguishable_possible_meanings": sorted(possible_meanings)},
        same_payment / 200 == 3 and len(possible_meanings) > 1)

metadata = {"special": True, "tag": "extra gift", "import_source": "trusted-looking-name"}
qualified_source_records = []
observe("D05", "An explicit imported flag/tag/source label is qualification",
        {"metadata": metadata, "qualified_source_records": qualified_source_records},
        metadata["special"] and not qualified_source_records)

flags = [{"value": True, "basis": "historical_ratio_only"},
         {"value": True, "basis": "owner_qualified_source_fact"}]
observe("D06", "An upstream boolean hides no meaningful eligibility difference",
        {"same_flag_value": flags[0]["value"] == flags[1]["value"],
         "different_bases": [x["basis"] for x in flags]},
        flags[0]["value"] == flags[1]["value"] and flags[0]["basis"] != flags[1]["basis"])

attention = {"tasks": 0, "badge": 1, "notification": 1}
observe("D07", "Zero new tasks means no automatic attention",
        attention, attention["tasks"] == 0 and attention["badge"] + attention["notification"] > 0)

default_order = ["Grace", "Sam"]
history_ranked_order = ["Sam", "Grace"]
observe("D08", "Changing priority/order from history is only a passive chart update",
        {"default_queue": default_order, "history_ranked_queue": history_ranked_order,
         "new_tasks": 0}, default_order != history_ranked_order)

suggestion = {"button": "Create manual follow-up", "shown_because": "historical_ratio_only"}
observe("D09", "Calling a generated suggestion manual makes its initiation manual",
        suggestion, "manual" in suggestion["button"] and
        suggestion["shown_because"] == "historical_ratio_only")

features = {"permitted_history_chart": "history_dependent",
            "qualified_first_support": "history_dependent",
            "unusual_giving_attention": "history_dependent"}
observe("D10", "Ban every history-dependent feature to implement D21",
        {"indistinguishable_to_blanket_ban": list(features),
         "distinct_product_purposes": len(features)}, len(set(features.values())) == 1 and len(features) == 3)

source_history_before, source_history_after = ["gift_2026"], ["gift_2020", "gift_2026"]
observe("D11", "An owner-certified earlier gift cannot change first-support truth",
        {"first_before": min(source_history_before), "first_after": min(source_history_after)},
        min(source_history_before) != min(source_history_after))

fulfilled = 100
old_commitment, reduced_commitment = 100, 50
observe("D12", "Applied above current commitment proves a new special gift arrived",
        {"received_unchanged": fulfilled, "above_before": max(fulfilled-old_commitment, 0),
         "above_after": max(fulfilled-reduced_commitment, 0), "new_gifts": 0},
        max(fulfilled-old_commitment, 0) != max(fulfilled-reduced_commitment, 0))

same_title = [{"title": "Follow up with Grace", "intended_purpose": "promised_visit"},
              {"title": "Follow up with Grace", "intended_purpose": "qualified_special_gift"}]
observe("D13", "Matching manual/native task titles establish duplicate purpose",
        same_title, same_title[0]["title"] == same_title[1]["title"] and
        same_title[0]["intended_purpose"] != same_title[1]["intended_purpose"])

manual_result = {"state": "done", "gift_link": "gift1", "exact_native_coverage_receipt": None}
observe("D14", "A generic manual Done linked to a gift proves native coverage",
        manual_result, manual_result["state"] == "done" and
        manual_result["exact_native_coverage_receipt"] is None)

same_effect = [("manual-command1", "gift1:purpose1"), ("native-event2", "gift1:purpose1")]
observe("D15", "Separate manual/native transports imply separate intended work",
        {"transport_count": len({x[0] for x in same_effect}),
         "proved_purpose_count": len({x[1] for x in same_effect})},
        len({x[0] for x in same_effect}) > len({x[1] for x in same_effect}))

# Arbitrary numbers demonstrate replay risk, not a recommended threshold policy.
historic_gift = 100
old_rule, new_rule = 150, 50
observe("D16", "A changed qualification rule makes old evidence a new live gift",
        {"unchanged_historical_gift": historic_gift,
         "old_numeric_rule_matches": historic_gift >= old_rule,
         "new_numeric_rule_matches": historic_gift >= new_rule,
         "new_live_occurrences": 0},
        (historic_gift >= old_rule) != (historic_gift >= new_rule))

repair_cases = [{"event_type": "repair", "origin": "live_held"},
                {"event_type": "repair", "origin": "historical_import"}]
observe("D17", "The repair event label decides whether work is historical replay",
        repair_cases, repair_cases[0]["event_type"] == repair_cases[1]["event_type"] and
        repair_cases[0]["origin"] != repair_cases[1]["origin"])

actions = [{"action": "create_follow_up", "initiator": "user_deliberate", "history_context": True},
           {"action": "create_follow_up", "initiator": "history_classifier", "history_context": True}]
observe("D18", "Using history as context makes deliberate and automatic creation equivalent",
        actions, actions[0]["action"] == actions[1]["action"] and
        actions[0]["history_context"] == actions[1]["history_context"] and
        actions[0]["initiator"] != actions[1]["initiator"])

result = {
    "scope": "Finite semantic counterexamples only; no Core/runtime/database/provider/financial-policy/UX qualification",
    "python": platform.python_version(),
    "case_count": len(cases),
    "reproduced": sum(x["counterexample_reproduced"] for x in cases),
    "cases": cases,
}
Path(__file__).with_name("results.json").write_text(json.dumps(result, indent=2)+"\n", encoding="utf-8")
print(f"{result['reproduced']}/{result['case_count']} finite counterexamples reproduced; no implementation qualification")
