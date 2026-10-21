"""D24 finite disclosure/period counterexamples, not a privacy implementation.

All entities, quantities, permissions and time scopes are synthetic. These cases
demonstrate information loss/reconstruction or ambiguous policy inputs. They do
not establish a safe threshold, production inference resistance or source truth.
"""
from fractions import Fraction
from pathlib import Path
import json
import platform

cases = []


def observe(key, shortcut, facts, reproduced):
    assert reproduced, key
    cases.append({"id": key, "shortcut": shortcut, "observation": facts,
                  "counterexample_reproduced": bool(reproduced)})


rows = [{"id":i,"admitted": i < 5} for i in range(7)]
raw_total = len(rows)
post_floor_total = sum(x["admitted"] for x in rows)
observe("S01", "Remove protected details after counting all source rows",
        {"raw_count_returned":raw_total,"post_floor_count":post_floor_total,
         "details_removed_did_not_remove_count_contribution":raw_total-post_floor_total},
        raw_total != post_floor_total)

calls = [{"occurrence":i,"supporter":"personA"} for i in range(10)]
observe("S02", "A larger activity count proves a larger protected population",
        {"activity_count":len(calls),"distinct_supporters":len({x["supporter"] for x in calls})},
        len(calls) != len({x["supporter"] for x in calls}))

all_calls, answered_calls = 5,2
observe("S03", "Withholding an outcome count is enough while its complements are shown",
        {"total_calls":all_calls,"answered_calls":answered_calls,
         "withheld_unanswered_recovered":all_calls-answered_calls},
        all_calls-answered_calls == 3)
goal, hidden_count = 8,5
percent = Fraction(hidden_count,goal)*100
observe("S04", "Hide the numerator but expose target and exact percent",
        {"target":goal,"percent":str(percent),
         "recovered_count":str(percent*goal/100)}, percent*goal/100 == hidden_count)
remaining = goal-hidden_count
observe("S05", "Hide the count but expose target and remaining-to-target",
        {"target":goal,"remaining":remaining,"recovered_count":goal-remaining},
        goal-remaining == hidden_count)

before,after = 4,5
observe("S06", "Each separately released total can be assessed without the prior release",
        {"previous_release":before,"current_release":after,
         "single_added_contribution_recovered":after-before}, after-before == 1)
full_window = {"a","b","c","d","e"}
overlapping_window = {"a","b","c","d"}
observe("S07", "Overlapping authorized-looking windows reveal no finer interval",
        {"full_window_count":len(full_window),"overlapping_count":len(overlapping_window),
         "excluded_interval_count":len(full_window)-len(overlapping_window)},
        len(full_window-overlapping_window) == 1)

quantities = {"public_total":11,"other_admitted_subject":7,"protected_subject":4}
observe("S08", "A protected subject total stays hidden when sibling and parent totals remain",
        {**quantities,"recovered_protected":quantities["public_total"]-quantities["other_admitted_subject"]},
        quantities["public_total"]-quantities["other_admitted_subject"] == quantities["protected_subject"])

known_personal,coach_subset,goal = 5,3,8
observe("S09", "A permission-reduced numerator means complete personal attainment",
        {"owner_known_count":known_personal,"admitted_subset_count":coach_subset,"target":goal,
         "owner_ratio":str(Fraction(known_personal,goal)),
         "subset_ratio":str(Fraction(coach_subset,goal))},
        Fraction(known_personal,goal) != Fraction(coach_subset,goal))

old = {"target_revision":1,"quantity":8,"source_revision":1,"count":5}
current = {"target_revision":2,"quantity":4,"source_revision":2,"count":3}
observe("S10", "Refresh the denominator while a cached old count remains current-looking",
        {"old":old,"current":current,
         "mixed_ratio":str(Fraction(old["count"],current["quantity"])),
         "current_ratio":str(Fraction(current["count"],current["quantity"]))},
        Fraction(old["count"],current["quantity"]) != Fraction(current["count"],current["quantity"]))

complete_empty,unavailable = [],None
observe("S11", "Both an empty cohort and unavailable evidence can use count-or-zero",
        {"complete_empty":complete_empty,"unavailable":unavailable,
         "same_naive_display":[len(complete_empty or []),len(unavailable or [])]},
        complete_empty != unavailable and len(complete_empty or []) == len(unavailable or []))

old_context = ("tenant1","coach1","subject1","share-v1")
now_context = ("tenant1","coach1","subject1","share-v2-revoked")
naive_key = lambda x:x[:3]
observe("S12", "Tenant/coach/subject cache key proves current sharing authority",
        {"same_naive_key":naive_key(old_context)==naive_key(now_context),
         "different_share_evidence":old_context[-1]!=now_context[-1]},
        naive_key(old_context)==naive_key(now_context) and old_context!=now_context)

selected_periods = {"2026-W42"}
view_periods = {"2026-W42","2026-W43"}
observe("S13", "A view date filter may define the shared period grant",
        {"selected":sorted(selected_periods),"view_filter":sorted(view_periods),
         "newly_exposed":sorted(view_periods-selected_periods)},
        bool(view_periods-selected_periods))
same_episode = {"active":True,"scheduled_end":None}
observe("S14", "No scheduled share end determines fixed versus ongoing period scope",
        {"same_duration":same_episode,"fixed_period_scope":["2026-W42"],
         "possible_stream_scope":["2026-W42","2026-W43"],
         "duration_does_not_choose_between_them":True},
        {"2026-W42"} != {"2026-W42","2026-W43"})

reviewed = {"target_id":"t1","measure":"calls","subject":"ministryA"}
replacement = {"target_id":"t1","measure":"meetings","subject":"ministryB"}
observe("S15", "Sharing a stable target ID authorizes every later definition/scope",
        {"reviewed":reviewed,"changed":replacement},
        reviewed["target_id"]==replacement["target_id"] and reviewed!=replacement)

scope = {"2026-W42"}
before_period,corrected_period,correction_recorded_period = "2026-W42","2026-W41","2026-W42"
observe("S16", "A correction's new recorded timestamp keeps a fact in shared dates",
        {"granted_periods":sorted(scope),"original_occurrence_period":before_period,
         "corrected_occurrence_period":corrected_period,
         "correction_recorded_period":correction_recorded_period,
         "naive_count":int(correction_recorded_period in scope),
         "source_period_count":int(corrected_period in scope)},
        (correction_recorded_period in scope)!=(corrected_period in scope))

temporary = {"grant_valid":True,"profile_ready":False}
revoked = {"grant_valid":False,"profile_ready":True}
observe("S17", "Unavailable now is enough state to decide future recovery",
        {"temporarily_withheld":temporary,"removed_grant":revoked,
         "both_currently_unavailable":not all(temporary.values()) and not all(revoked.values()),
         "grant_after_profile_recovers":[temporary["grant_valid"],revoked["grant_valid"]]},
        not all(temporary.values()) and not all(revoked.values()) and temporary["grant_valid"]!=revoked["grant_valid"])

source_total,withheld_count = 7,2
observe("S18", "A missing-records badge is harmless even if raw identities are hidden",
        {"shown_admitted_count":source_total-withheld_count,"shown_excluded_badge":withheld_count,
         "recovered_full_count":source_total-withheld_count+withheld_count},
        source_total-withheld_count+withheld_count == source_total)

result={"scope":"Synthetic D24 aggregate disclosure and period-authority counterexamples only; no safe-profile, source, database, permission or UX qualification",
        "python":platform.python_version(),"case_count":len(cases),
        "reproduced":sum(x["counterexample_reproduced"] for x in cases),"cases":cases}
Path(__file__).with_name("results.json").write_text(json.dumps(result,indent=2)+"\n")
print(json.dumps({k:result[k] for k in ["case_count","reproduced","python"]},indent=2))
