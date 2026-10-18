"""Finite D23 counterexamples, not a Core activity-target implementation/test.

Uses synthetic facts and the installed Python/system IANA timezone data. Calendar
examples use Monday and named zones for illustration, not selected product defaults.
"""

from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo, TZPATH
import hashlib
import json
import platform


cases = []


def case(key, shortcut, observation, contradicted):
    assert contradicted, key
    cases.append({"id": key, "shortcut": shortcut, "observation": observation,
                  "counterexample_reproduced": bool(contradicted)})


def week_start(day, first=0):
    return day - timedelta(days=(day.weekday() - first) % 7)


utc = timezone.utc
ny = ZoneInfo("America/New_York")
la = ZoneInfo("America/Los_Angeles")
bangkok = ZoneInfo("Asia/Bangkok")

spring = datetime(2026, 3, 2, tzinfo=ny)
spring_end = datetime(2026, 3, 9, tzinfo=ny)
spring_hours = (spring_end.astimezone(utc) - spring.astimezone(utc)).total_seconds()/3600
case("T01", "Every calendar week is 168 elapsed hours",
     {"local_start": spring.isoformat(), "local_end": spring_end.isoformat(),
      "elapsed_hours": spring_hours}, spring_hours == 167)
autumn = datetime(2026, 10, 26, tzinfo=ny)
autumn_end = datetime(2026, 11, 2, tzinfo=ny)
autumn_hours = (autumn_end.astimezone(utc) - autumn.astimezone(utc)).total_seconds()/3600
case("T02", "A fixed 168-hour end covers the autumn calendar week",
     {"local_start": autumn.isoformat(), "local_end": autumn_end.isoformat(),
      "elapsed_hours": autumn_hours}, autumn_hours == 169)

boundary = date(2026, 10, 19)
inclusive_hits = sum(a <= boundary <= b for a,b in [(date(2026,10,12),boundary),
                                                   (boundary,date(2026,10,26))])
exclusive_hits = sum(a <= boundary < b for a,b in [(date(2026,10,12),boundary),
                                                  (boundary,date(2026,10,26))])
case("T03", "Both adjacent weeks include their shared end/start boundary",
     {"inclusive_hits": inclusive_hits, "half_open_hits": exclusive_hits},
     inclusive_hits == 2 and exclusive_hits == 1)

fixed_end = spring_end.replace(tzinfo=timezone(spring.utcoffset())).astimezone(utc)
actual_end = spring_end.astimezone(utc)
case("T04", "The start-of-week UTC offset remains correct at the end",
     {"fixed_offset_end": fixed_end.isoformat(), "zone_rule_end": actual_end.isoformat()},
     fixed_end != actual_end)

instant = datetime(2026, 10, 18, 18, tzinfo=utc)
la_day, bkk_day = instant.astimezone(la).date(), instant.astimezone(bangkok).date()
case("T05", "Viewer device timezone can select the target week",
     {"instant": instant.isoformat(), "Los_Angeles_date": str(la_day),
      "Bangkok_date": str(bkk_day), "Los_Angeles_week": str(week_start(la_day)),
      "Bangkok_week": str(week_start(bkk_day))}, week_start(la_day) != week_start(bkk_day))

plain = date(2026, 10, 19)
invented_midnight = datetime.combine(plain,time(),utc).astimezone(la).date()
case("T06", "A date-only fact can be converted through midnight UTC",
     {"asserted_date": str(plain), "invented_LA_date": str(invented_midnight)},
     week_start(plain) != week_start(invented_midnight))

occurred, entered = date(2026,10,16), date(2026,10,20)
case("T07", "Entry time is an equivalent period key for a backdated encounter",
     {"occurred_week": str(week_start(occurred)), "entered_week": str(week_start(entered))},
     week_start(occurred) != week_start(entered))
unknown_date, known_date, entry_date = None, date(2026,10,20), date(2026,10,20)
case("T08", "Unknown occurrence may use created_at without changing knowledge",
     {"source_occurrences": [None,str(known_date)], "entry_date": str(entry_date),
      "both_fallback_dates": [str(unknown_date or entry_date),str(known_date or entry_date)]},
     unknown_date != known_date and (unknown_date or entry_date) == (known_date or entry_date))

sunday = date(2026,10,18)
case("T09", "Locale-dependent week start is only presentation",
     {"date": str(sunday), "Monday_start": str(week_start(sunday,0)),
      "Sunday_start": str(week_start(sunday,6))}, week_start(sunday,0) != week_start(sunday,6))
jan1 = date(2027,1,1)
iso = jan1.isocalendar()
case("T10", "Calendar year plus week number identifies the ISO week",
     {"date": str(jan1), "calendar_year": jan1.year, "ISO_year": iso.year,
      "ISO_week": iso.week}, jan1.year != iso.year)

fold0 = datetime(2026,11,1,1,30,tzinfo=ny,fold=0)
fold1 = datetime(2026,11,1,1,30,tzinfo=ny,fold=1)
case("T11", "The same local date/time string identifies one occurrence",
     {"wall_time": fold0.strftime("%Y-%m-%d %H:%M"),
      "first_UTC": fold0.astimezone(utc).isoformat(),
      "second_UTC": fold1.astimezone(utc).isoformat()},
     fold0.astimezone(utc) != fold1.astimezone(utc))
gap = datetime(2026,3,8,2,30,tzinfo=ny)
roundtrip = gap.astimezone(utc).astimezone(ny)
case("T12", "Attaching a zone validates that a local wall time existed",
     {"input_wall": gap.strftime("%Y-%m-%d %H:%M"),
      "roundtrip_wall": roundtrip.strftime("%Y-%m-%d %H:%M")},
     gap.replace(tzinfo=None) != roundtrip.replace(tzinfo=None))

old_week, corrected_week = date(2026,10,12), date(2026,10,19)
case("T13", "A correction can increment the new week without invalidating the old",
     {"one_encounter_id": "e1", "old_week": str(old_week),
      "corrected_week": str(corrected_week), "append_increment_total": 2,
      "current_distinct_encounters": 1}, old_week != corrected_week)

period_start, created_on, period_end = date(2026,10,12), date(2026,10,16), date(2026,10,19)
activity_dates = [date(2026,10,12),date(2026,10,14),date(2026,10,17)]
whole_period = sum(period_start <= x < period_end for x in activity_dates)
after_creation = sum(created_on <= x < period_end for x in activity_dates)
case("T14", "Target creation time is the beginning of its selected period",
     {"target_created": str(created_on), "whole_period_count": whole_period,
      "created_since_count": after_creation}, whole_period != after_creation)
month_days = [(date(2026,3,1)-date(2026,2,1)).days,
              (date(2028,3,1)-date(2028,2,1)).days,
              (date(2026,5,1)-date(2026,4,1)).days,
              (date(2026,2,1)-date(2026,1,1)).days]
case("T15", "A monthly target period is always thirty calendar dates",
     {"February_2026_February_2028_April_2026_January_2026_days": month_days},
     len(set(month_days)) == 4 and set(month_days) == {28,29,30,31})

calls = {"c1","c2","c3","c4","c5"}
exchanges = {"c2","c5"}
case("C01", "Outreach and exchange totals are additive",
     {"calls": len(calls), "answered_exchange_calls": len(exchanges),
      "sum_of_measures": len(calls)+len(exchanges), "distinct_calls": len(calls|exchanges)},
     len(calls)+len(exchanges) != len(calls|exchanges))

narratives = [("meeting1","noteA"),("meeting1","noteB")]
case("C02", "Each saved narrative is a separate meeting",
     {"narratives": len(narratives), "distinct_meetings": len({x[0] for x in narratives})},
     len(narratives) != len({x[0] for x in narratives}))
participant_rows = [("meeting1","Maya"),("meeting1","Jordan")]
case("C03", "Summing participant activity counts gives unique team encounters",
     {"per_person_counts": {"Maya":1,"Jordan":1}, "summed": 2,
      "unique_team_encounters": len({x[0] for x in participant_rows})},
     len(participant_rows) != len({x[0] for x in participant_rows}))
subject_rows = [("call1","ministryA"),("call1","ministryB")]
case("C04", "Project relationship joins are unique activity rows",
     {"qualified_subject_links": len(subject_rows),
      "unique_underlying_calls": len({x[0] for x in subject_rows})},
     len(subject_rows) != len({x[0] for x in subject_rows}))

shadows = [("manual-row", "message7"),("provider-row","message7")]
case("C05", "Manual and provider row IDs prove two outreach actions",
     {"source_rows": len(shadows), "proved_same_underlying_action": len({x[1] for x in shadows})},
     len(shadows) != len({x[1] for x in shadows}))
retries = [("request1","call8"),("request2","call8")]
case("C06", "Unique transport request IDs imply unique business activity",
     {"requests": len(retries), "business_activity_ids": len({x[1] for x in retries})},
     len(retries) != len({x[1] for x in retries}))

case("C07", "Today's scalar target can explain last week's attainment",
     {"last_week_actual": 4, "last_week_target": 10, "new_target": 5,
      "historical_ratio": 4/10, "naive_recomputed_ratio": 4/5}, 4/10 != 4/5)
case("C08", "Capping progress at 100 percent permits capping the recorded count",
     {"target": 5, "actual": 7, "bar_fraction_capped": min(7/5,1),
      "naive_capped_actual": 5}, 7 != 5)
zero_division = None
try:
    3 / 0
except ZeroDivisionError as exc:
    zero_division = type(exc).__name__
case("C09", "No target and a numeric zero denominator mean the same thing",
     {"optional_target": None, "actual": 3, "ratio_defined": False,
      "zero_denominator_error": zero_division}, zero_division == "ZeroDivisionError")
page = [{"id":i} for i in range(50)]
all_rows = [{"id":i} for i in range(51)]
case("C10", "Counting the loaded page proves complete period activity",
     {"loaded_rows": len(page), "eligible_rows_in_fixture": len(all_rows)},
     len(page) != len(all_rows))
case("C11", "Empty successful data and an unavailable query may both show zero",
     {"complete_empty": [], "query_unavailable": None,
      "coalesced_counts": [len([] or []),len(None or [])]},
     [] != None and len([] or []) == len(None or []))
outcome_records = [("Call","no answer"),("Call","actual conversation")]
case("C12", "An activity label determines an actual exchange",
     {"same_label": "Call", "outcomes": ["no answer", "actual conversation"],
      "distinct_methods": len({x[0] for x in outcome_records}),
      "distinct_outcomes": len({x[1] for x in outcome_records})},
     len({x[0] for x in outcome_records}) == 1 and len({x[1] for x in outcome_records}) == 2)

tzfile = next((Path(p)/"tzdata.zi" for p in TZPATH if (Path(p)/"tzdata.zi").is_file()),None)
tzfacts = None if tzfile is None else {"path":str(tzfile),
    "header":tzfile.read_text().splitlines()[0],
    "sha256":hashlib.sha256(tzfile.read_bytes()).hexdigest()}
result = {"scope":"Synthetic D23 temporal/counting counterexamples only; no Core/source/schema/provider/authorization/UI qualification",
          "python":platform.python_version(), "timezone_data":tzfacts,
          "case_count":len(cases),
          "reproduced":sum(x["counterexample_reproduced"] for x in cases), "cases":cases}
Path(__file__).with_name("results.json").write_text(json.dumps(result,indent=2)+"\n")
print(json.dumps({"case_count":result["case_count"],"reproduced":result["reproduced"],
                  "python":result["python"],"timezone_data":result["timezone_data"]},indent=2))
