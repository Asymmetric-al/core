"""Synthetic IANA calendar mechanics; no Core, database, or network calls."""

import datetime as dt
import json
from pathlib import Path
from zoneinfo import ZoneInfo

results = []


def check(name, actual, expected):
    assert actual == expected, (name, actual, expected)
    results.append({"name": name, "actual": actual, "expected": expected, "passed": True})


zone = ZoneInfo("America/New_York")
for label, day, next_day, hours in [
    ("spring", dt.date(2027, 3, 14), dt.date(2027, 3, 15), 23),
    ("fall", dt.date(2027, 11, 7), dt.date(2027, 11, 8), 25),
]:
    start = dt.datetime.combine(day, dt.time(), zone).astimezone(dt.timezone.utc)
    end = dt.datetime.combine(next_day, dt.time(), zone).astimezone(dt.timezone.utc)
    check(f"{label} calendar day is not always 24 hours", (end - start).total_seconds() / 3600, hours)

utc_midnight = dt.datetime(2027, 1, 15, tzinfo=dt.timezone.utc)
check("UTC midnight can display the previous local date",
      utc_midnight.astimezone(ZoneInfo("America/Los_Angeles")).date().isoformat(), "2027-01-14")

chosen_day = dt.date(2027, 1, 15)
saved_zone = ZoneInfo("Asia/Bangkok")
due = dt.datetime.combine(chosen_day, dt.time(), saved_zone).astimezone(dt.timezone.utc)
check("saved zone defines the chosen day independently of a travelling viewer",
      due.isoformat(), "2027-01-14T17:00:00+00:00")
check("another viewer can have a different local day at the same instant",
      due.astimezone(ZoneInfo("America/Los_Angeles")).date().isoformat(), "2027-01-14")

output = {"scope": "IANA calendar counterexamples only; not Core timing qualification",
          "checks": results}
Path(__file__).with_name("calendar-results.json").write_text(json.dumps(output, indent=2) + "\n")
print(f"PASS: {len(results)} synthetic calendar checks")
