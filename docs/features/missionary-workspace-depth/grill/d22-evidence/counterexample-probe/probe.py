"""D22 small semantic counterexamples, not a policy evaluator or money parser.

Python integers/Decimal provide exact comparison examples; float examples expose
binary64 loss. No Core, PostgreSQL, provider, route, authorization or UI is tested.
All monetary examples are synthetic; no suggested tenant threshold is implied.
"""

from decimal import Decimal, ROUND_HALF_UP
import json
from pathlib import Path
import platform


cases = []


def observe(case_id, shortcut, observation, reproduced):
    assert reproduced, case_id
    cases.append({"id": case_id, "shortcut": shortcut,
                  "observation": observation, "counterexample_reproduced": True})


naive_minor = int(0.29 * 100)
observe("A01", "Multiply a binary major-unit float by 100 and truncate",
        {"decimal_input": "0.29", "exact_minor": 29, "naive_minor": naive_minor}, naive_minor != 29)

observe("A02", "Every currency uses two decimals",
        {"JPY_major": "500", "canonical_minor": 500, "hardcoded_times100": 50000}, 500 != 50000)

bhd = Decimal("1.001")
observe("A03", "Two-decimal normalization preserves a three-decimal threshold",
        {"BHD_input": str(bhd), "canonical_minor": int(bhd * 1000),
         "incorrect_two_decimal_minor": int(bhd * 100)}, int(bhd * 1000) != int(bhd * 100))

excess = Decimal("1.005")
rounded = excess.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
observe("A04", "Rounding excess precision accepts the amount the administrator entered",
        {"USD_input": str(excess), "rounded_input": str(rounded)}, excess != rounded)

unsafe_a, unsafe_b = 2**53, 2**53 + 1
observe("A05", "Distinct large integers remain distinct after binary64 conversion",
        {"exact_a": str(unsafe_a), "exact_b": str(unsafe_b),
         "converted_equal": float(unsafe_a) == float(unsafe_b)},
        unsafe_a != unsafe_b and float(unsafe_a) == float(unsafe_b))

ambiguous = "1,000"
interpretations = [Decimal(ambiguous.replace(",", "")), Decimal(ambiguous.replace(",", "."))]
observe("A06", "Strip or replace punctuation without a declared locale",
        {"input": ambiguous, "possible_values": [str(x) for x in interpretations]},
        interpretations[0] != interpretations[1])

gift = threshold = 50000
observe("A07", "Greater than is interchangeable with at least",
        {"gift_minor": gift, "threshold_minor": threshold,
         "strict_result": gift > threshold, "inclusive_result": gift >= threshold},
        (gift > threshold) != (gift >= threshold))

observe("A08", "Zero can mean Off and also remain an ordinary numeric rule",
        {"threshold": 0, "zero_meets_rule": 0 >= 0, "positive_meets_rule": 1 >= 0},
        0 >= 0 and 1 >= 0)

metadata_exists, source_profile_ready = True, False
observe("A09", "A currency exponent lookup proves its source profile is enabled",
        {"metadata_exists": metadata_exists, "qualified_profile": source_profile_ready},
        metadata_exists != source_profile_ready)

header, relevant_subject = 70000, 20000
observe("A10", "The contribution header amount is every ministry's relevant amount",
        {"header": header, "subject_allocation": relevant_subject, "threshold": 50000,
         "header_matches": header >= 50000, "subject_matches": relevant_subject >= 50000},
        (header >= 50000) != (relevant_subject >= 50000))

same_gift_lines = [30000, 25000]
observe("A11", "Test each physical line separately instead of the owner's same-gift subject amount",
        {"line_amounts": same_gift_lines, "threshold": 50000,
         "any_line_matches": any(x >= 50000 for x in same_gift_lines),
         "qualified_subject_amount_matches": sum(same_gift_lines) >= 50000},
        not any(x >= 50000 for x in same_gift_lines) and sum(same_gift_lines) >= 50000)

different_gifts = [30000, 25000]
observe("A12", "Sum grouped follow-up gifts before qualifying each gift",
        {"separate_gifts": different_gifts, "threshold": 50000,
         "group_matches": sum(different_gifts) >= 50000,
         "any_individual_matches": any(x >= 50000 for x in different_gifts)},
        sum(different_gifts) >= 50000 and not any(x >= 50000 for x in different_gifts))

base, fee_cover = 49500, 500
observe("A13", "Fee cover belongs in ministry support for the amount rule",
        {"support": base, "fee_cover": fee_cover, "threshold": 50000,
         "including_fee_matches": base + fee_cover >= 50000,
         "support_only_matches": base >= 50000},
        (base + fee_cover >= 50000) != (base >= 50000))

support, assessment = 51000, 3000
observe("A14", "After-assessment amount is interchangeable with received allocated support",
        {"support": support, "assessment": assessment, "threshold": 50000,
         "before_matches": support >= 50000, "after_matches": support - assessment >= 50000},
        (support >= 50000) != (support - assessment >= 50000))

legal, recognized = 50000, 50000
observe("A15", "Add legal money and recognition of that same support",
        {"same_support_legal": legal, "same_support_recognized": recognized,
         "incorrect_added_amount": legal + recognized, "threshold": 75000},
        legal + recognized >= 75000 and legal < 75000 and recognized < 75000)

gross, refund = 60000, 15000
observe("A16", "The original posted amount is enough after a refund",
        {"original": gross, "effective": gross - refund, "threshold": 50000,
         "original_matches": gross >= 50000, "effective_matches": gross - refund >= 50000},
        (gross >= 50000) != (gross - refund >= 50000))

before = {"A": 60000, "B": 10000}
after = {"A": 40000, "B": 30000}
observe("A17", "An unchanged header total means the ministry amount did not change",
        {"same_header_total": sum(before.values()) == sum(after.values()),
         "A_matched_before": before["A"] >= 50000, "A_matches_after": after["A"] >= 50000},
        sum(before.values()) == sum(after.values()) and (before["A"] >= 50000) != (after["A"] >= 50000))

amount, original_threshold, worker_time_threshold = 15000, 10000, 20000
observe("A18", "Use whichever policy is current when a delayed worker runs",
        {"gift": amount, "original_policy_result": amount >= original_threshold,
         "worker_time_policy_result": amount >= worker_time_threshold},
        (amount >= original_threshold) != (amount >= worker_time_threshold))

historical_amount, old_threshold, lowered_threshold = 5000, 10000, 4000
observe("A19", "Lowering a rule turns an old unqualified gift into a new live occurrence",
        {"same_historical_gift": historical_amount,
         "old_match": historical_amount >= old_threshold,
         "new_match": historical_amount >= lowered_threshold, "new_gift_count": 0},
        (historical_amount >= old_threshold) != (historical_amount >= lowered_threshold))

pending = [{"task_row_exists": False, "committed_reason_and_intent": True},
           {"task_row_exists": False, "committed_reason_and_intent": False}]
observe("A20", "No task row means no accepted work when the rule is switched Off",
        pending, pending[0]["task_row_exists"] == pending[1]["task_row_exists"] and
        pending[0]["committed_reason_and_intent"] != pending[1]["committed_reason_and_intent"])

generation_states = [{"on_now": True, "captured_generation": "old_ended"},
                     {"on_now": True, "captured_generation": "current"}]
observe("A21", "An On boolean alone permits every old held candidate after re-enable",
        generation_states, generation_states[0]["on_now"] == generation_states[1]["on_now"] and
        generation_states[0]["captured_generation"] != generation_states[1]["captured_generation"])

reasons_before, reasons_after_correction = {"amount", "qualified_special"}, {"qualified_special"}
observe("A22", "Losing the amount reason withdraws the whole gift-purpose member",
        {"before": sorted(reasons_before), "after": sorted(reasons_after_correction),
         "other_qualified_reason_remains": bool(reasons_after_correction)},
        "amount" not in reasons_after_correction and bool(reasons_after_correction))

requests = [("gift1", "purpose1", "amount", "policy_v1"),
            ("gift1", "purpose1", "qualified_special", "source_v2")]
observe("A23", "Reason or rule revision belongs in the complete task-effect identity",
        {"reason_revision_keys": len(set(requests)),
         "gift_purpose_keys": len({x[:2] for x in requests})},
        len(set(requests)) > len({x[:2] for x in requests}))

reviewed = {"gift": "gift1", "amount": 60000, "source_revision": 1}
corrected = {"gift": "gift1", "amount": 45000, "source_revision": 2}
observe("A24", "Same gift ID lets a D20 review complete after an amount correction",
        {"reviewed": reviewed, "current": corrected},
        reviewed["gift"] == corrected["gift"] and reviewed != corrected)

inactive_reasons = [{"currently_active": False, "prior_accepted_intent": True,
                     "cause": "source_invalidated_then_genuinely_restored"},
                    {"currently_active": False, "prior_accepted_intent": False,
                     "cause": "never_admitted_hold"}]
observe("A25", "Off may treat source repair and never-admitted work identically",
        inactive_reasons, inactive_reasons[0]["currently_active"] == inactive_reasons[1]["currently_active"] and
        inactive_reasons[0]["prior_accepted_intent"] != inactive_reasons[1]["prior_accepted_intent"])

result = {"scope": "Synthetic semantic counterexamples only; no Core/parser/database/source-policy/provider/UI qualification",
          "python": platform.python_version(), "case_count": len(cases),
          "reproduced": sum(x["counterexample_reproduced"] for x in cases), "cases": cases}
Path(__file__).with_name("results.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
print(f"{result['reproduced']}/{result['case_count']} semantic counterexamples reproduced; no implementation qualification")
