"""Illustrative D39 calendar arithmetic, not Core source/runtime qualification.

The deliberately small boundary search checks named examples against installed
zoneinfo data. It is not a production resolver, database probe or universal
timezone algorithm. It executes no older evidence program.
"""

from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
import json
import platform
from zoneinfo import ZoneInfo


CASES = [
    ("one_day", "2026-10-01", 1, "Asia/Bangkok", "2026-10-02T00:00:00+07:00"),
    ("thirty_days", "2026-10-01", 30, "Asia/Bangkok", "2026-10-31T00:00:00+07:00"),
    ("leap_day", "2028-02-28", 2, "Etc/UTC", "2028-03-01T00:00:00+00:00"),
    ("spring_dst", "2026-03-08", 1, "America/New_York", "2026-03-09T00:00:00-04:00"),
    ("fall_dst", "2026-11-01", 1, "America/New_York", "2026-11-02T00:00:00-05:00"),
    ("missing_midnight", "2018-11-03", 1, "America/Sao_Paulo", "2018-11-04T01:00:00-02:00"),
    ("repeated_midnight", "2020-10-31", 1, "America/Havana", "2020-11-01T00:00:00-04:00"),
    ("skipped_date", "2011-12-29", 1, "Pacific/Apia", "2011-12-31T00:00:00+14:00"),
]


def illustrative_boundary(target, zone):
    pivot = datetime.combine(target, time(), timezone.utc)
    for minute in range(-48 * 60, 48 * 60 + 1):
        instant = pivot + timedelta(minutes=minute)
        local = instant.astimezone(zone)
        if local.date() >= target:
            return local
    raise AssertionError("Example search range exhausted")


results = []
for name, day, count, zone_name, expected in CASES:
    original = date.fromisoformat(day)
    zone = ZoneInfo(zone_name)
    target = original + timedelta(days=count)
    endpoint = illustrative_boundary(target, zone)
    assert endpoint.isoformat() == expected, (name, endpoint, expected)
    just_before = (endpoint.astimezone(timezone.utc) - timedelta(microseconds=1)).astimezone(zone)
    assert just_before.date() < target, (name, just_before, target)
    results.append({
        "case": name, "original_date": day, "calendar_days": count,
        "zone": zone_name, "last_nominal_day": str(target - timedelta(days=1)),
        "exclusive_endpoint": endpoint.isoformat(), "expected": expected,
        "one_microsecond_before_is_before_target_date": True,
    })

spring_start = datetime(2026, 3, 8, tzinfo=ZoneInfo("America/New_York"))
spring_end = datetime(2026, 3, 9, tzinfo=ZoneInfo("America/New_York"))
fall_start = datetime(2026, 11, 1, tzinfo=ZoneInfo("America/New_York"))
fall_end = datetime(2026, 11, 2, tzinfo=ZoneInfo("America/New_York"))
elapsed_hours = [
    (end.astimezone(timezone.utc) - start.astimezone(timezone.utc)).total_seconds() / 3600
    for start, end in [(spring_start, spring_end), (fall_start, fall_end)]
]
assert elapsed_hours == [23, 25]

tzdata = Path("/usr/share/zoneinfo/tzdata.zi")
report = {
    "status": "passed", "date": "2026-10-18",
    "scope": "Eight illustrative calendar examples and DST elapsed-hours contrast only",
    "python": platform.python_version(),
    "tzdata_header": tzdata.read_text().splitlines()[0] if tzdata.exists() else "not inspected",
    "cases": results, "NY_calendar_day_elapsed_hours": elapsed_hours,
    "prior_programs_executed": False,
    "Core_database_UI_runtime_or_user_study_proof": False,
    "production_algorithm": False,
}
Path(__file__).with_name("calendar-examples.json").write_text(json.dumps(report, indent=2) + "\n")
print("Eight illustrative boundary cases passed; New York calendar days were 23/25 hours.")
