"""Bounded D19 counterexamples, not Core implementation or database tests.

Standard library only. The observations disprove named shortcuts using synthetic
data; they do not certify a replacement history service, SQL locking, RLS, finance,
provider delivery, or performance. Run from any working directory.
"""

from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import platform


results = []


def observe(case_id, shortcut, observation, disproved):
    assert disproved, case_id
    results.append({"id": case_id, "shortcut": shortcut,
                    "observation": observation, "counterexample_reproduced": True})


# A correct, ordered viewport still omits older records.
history = list(range(251))
viewport = sorted(history, reverse=True)[:250]
observe("H01", "MIN of the newest 250 rows proves first-ever",
        {"all_history_min": min(history), "viewport_min": min(viewport)},
        min(viewport) != min(history))

days_ago = [900, 1]
roster = [day for day in days_ago if day <= 730]
observe("H02", "The current supporter roster contains all first-support evidence",
        {"history_days_ago": days_ago, "roster_days_ago": roster},
        max(roster) != max(days_ago))

# Identical observed data is compatible with incompatible complete histories.
observed = ["2026-10-16"]
world_a = observed[:]
world_b = ["2018-01-01"] + observed
observe("H03", "No visible older record means no older gift",
        {"visible_in_both_worlds": observed, "first_in_world_a": min(world_a),
         "first_in_world_b": min(world_b)}, min(world_a) != min(world_b))

arrivals = [{"id": "later", "source_day": 2}, {"id": "earlier", "source_day": 1}]
observe("H04", "First event arrival is first support",
        {"first_arrival": arrivals[0]["id"],
         "earliest_source": min(arrivals, key=lambda e: e["source_day"])["id"]},
        arrivals[0] != min(arrivals, key=lambda e: e["source_day"]))

same_day = [{"id": "a", "source_day": "2026-10-16"},
            {"id": "b", "source_day": "2026-10-16"}]
observe("H05", "Sorting only a shared date supplies unique historical order",
        {"forward_first": sorted(same_day, key=lambda e: e["source_day"])[0]["id"],
         "reverse_first": sorted(reversed(same_day), key=lambda e: e["source_day"])[0]["id"]},
        sorted(same_day, key=lambda e: e["source_day"])[0] !=
        sorted(reversed(same_day), key=lambda e: e["source_day"])[0])

support = [("one_time", "2025-01-01"), ("new_recurring_initial", "2026-10-16")]
observe("H06", "An initial recurring payment is first-ever support",
        {"first_support": support[0], "initial_recurring": support[1]},
        support[0][1] < support[1][1])

lines = [("gift1", "line1", "subjectA", "USD"),
         ("gift1", "line2", "subjectA", "USD"),
         ("gift1", "line3", "subjectB", "USD")]
observe("H07", "One task per allocation line preserves one task per supported subject",
        {"allocation_count": len(lines), "subject_count": len({x[2] for x in lines})},
        len(lines) > len({x[2] for x in lines}))

two_currencies = [("subjectA", "USD"), ("subjectA", "EUR")]
observe("H08", "Currency belongs in first-support identity",
        {"subject_currency_keys": len(set(two_currencies)), "subjects": 1},
        len(set(two_currencies)) > len({x[0] for x in two_currencies}))

assignments = [("subjectA", "Maya", "Old display name"),
               ("subjectA", "Jordan", "New display name")]
observe("H09", "Worker or display-name change starts a new support relationship",
        {"worker_name_keys": len(set((x[1], x[2]) for x in assignments)),
         "stable_subject_keys": len({x[0] for x in assignments})},
        len(set((x[1], x[2]) for x in assignments)) > len({x[0] for x in assignments}))

mapping = [{"from_day": 1, "until_day": 10, "subject": "A"},
           {"from_day": 10, "until_day": 20, "subject": "B"}]
gift_day = 5
historical = next(x["subject"] for x in mapping if x["from_day"] <= gift_day < x["until_day"])
observe("H10", "Current designation assignment correctly attributes old support",
        {"gift_day": gift_day, "effective_subject": historical,
         "current_subject": mapping[-1]["subject"]}, historical != mapping[-1]["subject"])

imported = {"occurred": "2018-01-01", "ingested": "2026-10-16", "origin": "historical_import"}
observe("H11", "Import time means new live support",
        imported, imported["occurred"] != imported["ingested"])

requests = [("native-event1", "first-support:A:party1"),
            ("studio-event2", "first-support:A:party1"),
            ("replay-event3", "first-support:A:party1")]
observe("H12", "Transport or workflow identity deduplicates the business effect",
        {"request_keys": len({x[0] for x in requests}),
         "effect_keys": len({x[1] for x in requests})},
        len({x[0] for x in requests}) > len({x[1] for x in requests}))

t0 = datetime(2026, 10, 16, tzinfo=timezone.utc)
replay = t0 + timedelta(hours=25)
observe("H13", "A 24-hour transport cache prevents permanent first-support repeats",
        {"replay_hours": (replay - t0).total_seconds() / 3600,
         "outside_documented_cache": replay - t0 > timedelta(hours=24)},
        replay - t0 > timedelta(hours=24))

# Explicit interleaving demonstrates why checking absence is not a unique claim.
rows = []
request_a_saw_absent = not rows
request_b_saw_absent = not rows
if request_a_saw_absent:
    rows.append("same-purpose")
if request_b_saw_absent:
    rows.append("same-purpose")
observe("H14", "Two check-then-insert callers cannot both create first work",
        {"duplicate_rows_after_interleaving": len(rows)}, len(rows) == 2)

postings = [100, -100, 100]
consumed_effect = True
observed_balances = [sum(postings[:i]) for i in range(1, 4)]
observe("H15", "Refund and undo reset a completed first-support purpose",
        {"effective_balances": observed_balances, "completed_effect_still_happened": consumed_effect},
        observed_balances == [100, 0, 100] and consumed_effect)

alias = {"party_old": "party_canonical", "party_duplicate": "party_canonical"}
claims = [("party_old", "subjectA"), ("party_duplicate", "subjectA")]
observe("H16", "Party merge cannot reveal overlapping first-support claims",
        {"pre_merge_keys": len(set(claims)),
         "resolved_keys": len({(alias[p], s) for p, s in claims})},
        len(set(claims)) > len({(alias[p], s) for p, s in claims}))

obligations = [("personal_first_support", "email"), ("official_receipt", "email")]
observe("H17", "Same recipient/channel means the same obligation",
        {"purposes": len({x[0] for x in obligations}),
         "channels": len({x[1] for x in obligations})},
        len({x[0] for x in obligations}) > len({x[1] for x in obligations}))

task = {"status": "completed", "communication_events": []}
observe("H18", "A completed task proves a sent message",
        task, task["status"] == "completed" and not task["communication_events"])

scope_keys = [("tenantA", "LE1", "subject1", "party1"),
              ("tenantB", "LE1", "subject1", "party1")]
observe("H19", "Locally equal subject and Party IDs make a global effect key safe",
        {"fully_scoped_keys": len(set(scope_keys)),
         "scope_omitted_keys": len({x[2:] for x in scope_keys})},
        len(set(scope_keys)) > len({x[2:] for x in scope_keys}))

origins = [{"event_type": "correction", "original_origin": "live", "consumed": False},
           {"event_type": "correction", "original_origin": "historical_import", "consumed": False}]
observe("H20", "Correction event type alone decides prospective task eligibility",
        {"same_event_type": origins[0]["event_type"],
         "different_original_origins": [x["original_origin"] for x in origins]},
        origins[0]["event_type"] == origins[1]["event_type"] and
        origins[0]["original_origin"] != origins[1]["original_origin"])

out = {"scope": "Synthetic counterexamples only; no Core, SQL, RLS, provider, financial owner, or performance qualification",
       "python": platform.python_version(), "case_count": len(results),
       "reproduced": sum(x["counterexample_reproduced"] for x in results),
       "cases": results}
Path(__file__).with_name("results.json").write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
print(f"{out['reproduced']}/{out['case_count']} bounded counterexamples reproduced; no production qualification")
