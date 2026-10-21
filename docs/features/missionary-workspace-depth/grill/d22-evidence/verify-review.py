#!/usr/bin/env python3
"""D22 document/provenance checks only; never execute probes or product commands."""

import hashlib
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

E = Path(__file__).resolve().parent
G = E.parent
ROOT = E.parents[4]
MAIN = G / "phase28-d22-amount-based-gift-follow-up-adversarial-review.md"
Q22 = G / "phase28-q22-amount-based-gift-follow-up-research.md"
Q23 = G / "phase28-q23-activity-target-measures-research.md"
SESSION = G / "phase28-session.md"
CONTEXT = ROOT / "CONTEXT.md"
RECONCILIATION = E / "cross-review-reconciliation.md"
OUTPUT = E / "review-verification.json"
FOUNDER_SHA = "464e3ceb675f1bd3926b0974b003e885ef1b115b5b516a37da3d84fbed8f1dcb"
INITIAL_REPORT_SHA = "0913ad4bb9e6a74cdb9e97cc717a81d756ec85315606d19b9b3d991567fbe190"
# Captured from the retained artifacts before this verifier's first run. These
# pins stop a later rerun from silently accepting rewritten experiments/snapshots.
PINS = {
    "prior-evidence-sha256.json": "4f534a6022b78d5df28aa0ae778c5fd5d9389dac4914cfbf0e3d8dcc66defe10",
    "counterexample-probe/probe.py": "94fa7628a4490ccc45132f625dea27010c2d95036c71ca27a74d3908cbe09f1b",
    "counterexample-probe/results.json": "c3a2b85de548883f6416c396d037f29663bae86f24bd1db28e869d117e5e4ba2",
    "postgres-probe/results.json": "ed3d6774e8795821de8e253a0c04f6316b6f4d6cb2f9ac846c34f9d09363d59a",
    "postgres-probe/cleanup.json": "34d5935b5518be385aeeb7974732920a80aa792159b8836204dbadb1af0305fe",
    "postgres-probe/environment.json": "aee9d1470a9343e87cb3a8a8c14cf343d67f1b31d991eba6a3f5ff081cf335c9",
    "postgres-probe/roles.json": "8dac61b23719a9a1b4d65aed8584dbcae73d5fcfa840eaf7cc6f03f1a8c8409e",
    "postgres-probe/privileges.json": "0ee153d9dfa53e9ad8768757a9a42660db1798767c7b920faed03a37c4b5bfae",
}
errors = []
pending = []
references = line_references = anchor_references = 0


def require(condition, message):
    if not condition:
        errors.append(message)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def targets(body):
    """Inline Markdown destinations, including angle-wrapped/spaced/() paths."""
    for match in re.finditer(r"\]\(", body):
        start = end = match.end()
        depth = 1
        while end < len(body) and depth:
            if body[end] == "(" and body[end - 1] != "\\":
                depth += 1
            elif body[end] == ")" and body[end - 1] != "\\":
                depth -= 1
            end += 1
        if depth == 0:
            yield body[start:end - 1].strip().strip("<>")


def heading_anchors(body):
    slugs = []
    counts = Counter()
    for heading in re.findall(r"^#{1,6}\s+(.+?)\s*#*\s*$", body, re.M):
        # GitHub-style slugs for headings used in these documentation files.
        heading = re.sub(r"<[^>]+>", "", heading).lower()
        slug = re.sub(r"[^\w\- ]", "", heading).replace(" ", "-")
        duplicate = counts[slug]
        counts[slug] += 1
        slugs.append(slug if duplicate == 0 else f"{slug}-{duplicate}")
    slugs.extend(re.findall(r"<(?:a|span)\s+(?:id|name)=[\"']([^\"']+)[\"']", body))
    return set(slugs)


def section(body, heading):
    match = re.search(r"^## " + re.escape(heading) + r"\s*$", body, re.M)
    require(match is not None, f"missing main section: {heading}")
    if not match:
        return ""
    following = body[match.end():]
    return re.split(r"^## ", following, maxsplit=1, flags=re.M)[0]


if not OUTPUT.exists():
    OUTPUT.write_text("{}\n", encoding="utf-8")
if not RECONCILIATION.exists():
    pending.append("cross-review-reconciliation.md not yet present")

files = [MAIN, Q22, SESSION, *sorted(E.rglob("*.md"))]
if Q23.exists():
    files.append(Q23)
else:
    pending.append("Q23 activity-target-measures research not yet present")
for file in files:
    body = file.read_text(encoding="utf-8")
    # Exactly two terminal spaces after content are an intentional CommonMark
    # hard break (used in the main task sketch), not stray trailing whitespace.
    require(all(line.rstrip() == line or
                (bool(line.strip()) and line.endswith("  ") and not line.endswith("   ")
                 and line[:-2].rstrip() == line[:-2])
                for line in body.splitlines()),
            f"trailing whitespace: {file.relative_to(ROOT)}")
    for target in targets(body):
        if re.match(r"^[a-z][a-z0-9+.-]*:", target, re.I):
            continue
        path, _, anchor = unquote(target).partition("#")
        match = re.search(r":(\d+)$", path)
        line = int(match.group(1)) if match else None
        if match:
            path = path[:match.start()]
        destination = (file.parent / path).resolve() if path else file
        references += 1
        if not destination.exists():
            if destination == RECONCILIATION:
                continue
            errors.append(f"{file.relative_to(ROOT)}: missing {target}")
            continue
        if line is not None or anchor:
            text = destination.read_text(encoding="utf-8")
            if line is not None:
                line_references += 1
                require(1 <= line <= len(text.splitlines()),
                        f"{file.name}: line out of bounds {target}")
            if anchor:
                anchor_references += 1
                require(anchor in heading_anchors(text),
                        f"{file.name}: missing heading anchor {target}")

main = MAIN.read_text(encoding="utf-8")
clause_ids = re.findall(r"^- \*\*(C\d{2}) —", main, re.M)
proof_ids = re.findall(r"^\| (P\d{2})\s+\|", main, re.M)
finding_ids = re.findall(r"^\| (F\d{2}) —", main, re.M)
category_section = section(main, "Independent category review")
category_rows = [line for line in category_section.splitlines()
                 if line.startswith("| ") and not line.startswith("| Category")
                 and not re.match(r"^\| [-: ]+\|", line)]
counts = {"clauses": len(clause_ids), "proofs": len(proof_ids),
          "findings": len(finding_ids), "categories": len(category_rows)}
for ids, prefix, count in [(clause_ids, "C", 24), (proof_ids, "P", 34),
                           (finding_ids, "F", 13)]:
    require(ids == [f"{prefix}{number:02d}" for number in range(1, count + 1)],
            f"{prefix} sequence/count mismatch: {ids}")
require(len(category_rows) == 22, f"category count: {len(category_rows)}")
require(len(set(row.split("|")[1].strip() for row in category_rows)) == 22,
        "duplicate category labels")

for marker in ["Corrected decision and required amendments explicitly ratified on October 17, 2026 Asia/Bangkok",
               "Subsequent explicit ratification",
               "Accept with required amendments", "one organization-wide policy",
               "Off by default, inclusive comparison", "proposed amendments",
               "25/25", "29/29", "seven controlled lock races",
               "one deliberately unsafe numeric-rounding counterexample",
               "settings function operates on one existing tenant/currency head per call",
               "not implement the full organization-wide multi-currency Save, global Off",
               "current revision and required audit atomically, with no partial per-currency success",
               "Whole multi-currency Save is all-or-nothing, including a failing row",
               "Global Off and currency remove/re-add affect exactly the intended intervals",
               "Durable settings-command retry receipts", "source restoration while Off",
               "preserved, not rerun", "No Q23 was posed in the initial review"]:
    require(marker in main, f"main missing status/limit marker: {marker}")

q22 = Q22.read_text(encoding="utf-8")
require("Founder answered A; corrected decision and amendments explicitly ratified October 17, 2026 Asia/Bangkok" in q22,
        "Q22 missing selected A/ratification status")
require("Awaiting founder answer" not in q22, "Q22 retains awaiting-answer status")
session = SESSION.read_text(encoding="utf-8")
for marker in ["Q22: amount-based native follow-up (now answered A)",
               "D22 answer and completed adversarial review",
               "### D22 explicit ratification", "C01–C24/P01–P34",
               "On October 17, 2026 Asia/Bangkok"]:
    require(marker in session, f"session missing marker: {marker}")
q22_session = session.split("### Q22: amount-based native follow-up", 1)[-1].split("### Q23:", 1)[0]
require("Neither answer is assumed" not in q22_session,
        "answered Q22 session still says Neither answer is assumed")
q23_session_marker = re.search(r"^### Q23: .+\(awaiting answer\)\s*$", session, re.M)
if not q23_session_marker:
    pending.append("session Q23 awaiting-answer marker not yet present")
require(not re.search(r"^\| D23\b|^### D23 (?:answer|explicit ratification)", session, re.M),
        "session prematurely selects or ratifies D23")
if Q23.exists():
    q23 = Q23.read_text(encoding="utf-8")
    require("Awaiting founder answer" in q23 and "neither option below has been selected" in q23,
            "Q23 is not explicitly prepared and unanswered")
    require("Founder answered" not in q23, "Q23 prematurely records an answer")
glossary = CONTEXT.read_text(encoding="utf-8")
require("**Amount-based follow-up** (Phase 28 D22, ratified):" in glossary,
        "glossary D22 status missing")
require("An optional organization-wide policy, explicitly chosen without workspace" in glossary,
        "glossary D22 org-wide scope missing")
require("**Giving-history context** (Phase 28 D21, ratified):" in glossary,
        "glossary D21 ratification lost")

for relative, digest in PINS.items():
    require(sha(E / relative) == digest, f"pinned D22 artifact changed: {relative}")
prior = read_json(E / "prior-evidence-sha256.json")
require(len(prior) == 37, f"prior artifact count: {len(prior)}")
for relative, digest in prior.items():
    require(sha(ROOT / relative) == digest, f"prior artifact changed: {relative}")
require(any("/d20-evidence/" in path for path in prior), "D20 preservation absent")
require(any("/d21-evidence/" in path for path in prior), "D21 preservation absent")
founder = sha(G / "phase28-founder-brief.md")
require(founder == FOUNDER_SHA, "founder brief changed")

# Ratification is a documentation transition, not a replacement experiment.
# Preserve the actual initially unratified report and the exact script that
# produced it, including its original current-script key in the hash map.
initial_path = E / "review-verification-initial.json"
initial_script = E / "verify-review-initial.py"
require(sha(initial_path) == INITIAL_REPORT_SHA, "initial verification report changed")
initial = read_json(initial_path)
require(initial["passed"] is True and not initial["errors"] and not initial["pending"],
        "initial successful verification evidence missing")
require(initial["d22_a_selected"] is True and initial["organization_wide_explicitly_selected"] is True
        and initial["d22_amendments_ratified"] is False and initial["q23_asked"] is False,
        "initial unratified D22/no-Q23 status changed")
original_script_key = str((E / "verify-review.py").relative_to(ROOT))
require(sha(initial_script) == initial["sha256"][original_script_key],
        "initial script does not match the original stored current-script hash")
preserved_d22_artifacts = 0
for relative, digest in initial["sha256"].items():
    if "/d22-evidence/" in relative and relative != original_script_key:
        require(sha(ROOT / relative) == digest, f"original D22 artifact changed: {relative}")
        preserved_d22_artifacts += 1

pg_dir = E / "postgres-probe"
pg = read_json(pg_dir / "results.json")
require(pg["passed"] == pg["outcomes"] == len(pg["results"]) == 29
        and pg["failure"] is None and all(row["passed"] is True for row in pg["results"]),
        "PostgreSQL retained outcome summary inconsistent")
races = [row for row in pg["results"] if "actual_lock_wait" in row]
require(len(races) == 7 and all(row["actual_lock_wait"] == "Lock:transactionid" for row in races),
        "expected seven actual PostgreSQL lock waits")
require(all(row.get("first") and row.get("second") and row.get("outcome") for row in races),
        "race transcript/outcome absent")
rounding = [row for row in pg["results"] if row.get("counterexample") is True]
require(len(rounding) == 1 and rounding[0]["name"] == "unsafe_numeric_typmod_rounds_fractional_minor_unit"
        and rounding[0]["expected"] == rounding[0]["stdout"] == "t"
        and rounding[0]["exit_code"] == 0, "unsafe rounding counterexample not preserved")
for name, digest in pg["artifact_sha256"].items():
    require(sha(pg_dir / name) == digest, f"executed PostgreSQL artifact changed: {name}")
require(sha(G / "d1-evidence/postgres-probe/run.py") == pg["helper_sha256"],
        "reused D1 helper differs from executed hash")
environment = read_json(pg_dir / "environment.json")
cleanup = read_json(pg_dir / "cleanup.json")
require(environment["network"] == "none" and environment["published_ports"] == {},
        "recorded experiment network isolation mismatch")
require("PostgreSQL 17.11" in environment["server"], "recorded PostgreSQL version mismatch")
require(cleanup["container_id"] == environment["container_id"]
        and cleanup["container_absent"] is True and cleanup["stop_exit_code"] == 0,
        "recorded container cleanup mismatch")
require(cleanup["volume_names"] == environment["volume_names"]
        and all(cleanup["volumes_absent"].get(volume) is True for volume in environment["volume_names"]),
        "recorded volume cleanup mismatch")
roles = read_json(pg_dir / "roles.json")
require(len(roles) == 7 and all(not role["rolsuper"] and not role["rolbypassrls"] for role in roles),
        "recorded role constraints mismatch")
privileges = read_json(pg_dir / "privileges.json")
require(len({row["relname"] for row in privileges["tables"]}) == 9
        and all(row["relrowsecurity"] and row["relforcerowsecurity"] for row in privileges["tables"]),
        "recorded forced-RLS tables mismatch")

sources = read_json(pg_dir / "sources.json")
require(len(sources["fresh"]) == 5 and len(sources["same_day_reused"]) == 6
        and len(sources["local"]) == 5, "technical source register counts mismatch")
for source in [*sources["fresh"], *sources["same_day_reused"]]:
    require(source["status"] == 200 and source["fetched_at"].startswith("2026-10-17"),
            f"technical source status/date: {source['name']}")
    require(sha(Path(source["raw_path"])) == source["sha256"],
            f"technical source body changed: {source['name']}")
    if "text_path" in source:
        require(sha(Path(source["text_path"])) == source["text_sha256"],
                f"technical source text changed: {source['name']}")
for source in sources["local"]:
    require(sha(ROOT / source["path"]) == source["sha256"],
            f"recorded source owner changed: {source['path']}")

semantic = read_json(E / "counterexample-probe/results.json")
require(semantic["case_count"] == semantic["reproduced"] == len(semantic["cases"]) == 25,
        "retained semantic summary mismatch")
require([case["id"] for case in semantic["cases"]] == [f"A{i:02d}" for i in range(1, 26)]
        and all(case["counterexample_reproduced"] is True for case in semantic["cases"]),
        "retained semantic cases mismatch")

checked = sorted({*files, CONTEXT, *[path for path in E.rglob("*")
                                   if path.is_file() and path != OUTPUT]})
report = {
    "checked_at_utc": datetime.now(timezone.utc).isoformat(),
    "scope": "D22 documentation structure, local Markdown destinations/line bounds/anchors, explicit ratification and unanswered Q23 status, initial verification and retained artifact integrity only; not Core/source/Auth/PDP/database/user/production qualification",
    "counts": counts, "errors": errors, "pending": pending,
    "passed": not errors and not pending,
    "local_references_checked": references,
    "local_line_references_checked": line_references,
    "local_heading_anchors_checked": anchor_references,
    "d22_a_selected": True, "organization_wide_explicitly_selected": True,
    "d22_amendments_ratified": True,
    "d22_ratification_date": "2026-10-17", "d22_ratification_timezone": "Asia/Bangkok",
    "q23_prepared_unanswered": True, "q23_selected": False,
    "initial_verification_preserved": True,
    "initial_report_sha256_unchanged": sha(initial_path),
    "original_d22_artifacts_unchanged": preserved_d22_artifacts,
    "founder_brief_sha256_unchanged": founder,
    "unchanged_prior_artifacts_checked": len(prior),
    "retained_postgres_outcomes": 29, "retained_actual_lock_waits": len(races),
    "retained_expected_unsafe_rounding_counterexamples": len(rounding),
    "recorded_cleanup_verified": True, "retained_semantic_counterexamples": 25,
    "fresh_technical_source_bodies_hash_verified": len(sources["fresh"]),
    "same_day_reused_technical_source_bodies_hash_verified": len(sources["same_day_reused"]),
    "new_experiments_run_by_validator": 0, "prior_probe_rerun": False,
    "live_supabase_or_provider_operations": 0,
    "sha256": {str(file.relative_to(ROOT)): sha(file) for file in checked},
}
OUTPUT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps({key: value for key, value in report.items() if key != "sha256"}, indent=2))
sys.exit(1 if errors else 2 if pending else 0)
