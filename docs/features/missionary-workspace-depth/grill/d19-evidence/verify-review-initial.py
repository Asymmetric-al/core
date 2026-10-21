"""Documentation/provenance checks only; not Core or financial qualification."""

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

E = Path(__file__).resolve().parent
G = E.parent
ROOT = E.parents[4]
MAIN = G / "phase28-d19-first-support-follow-up-adversarial-review.md"
FILES = [MAIN, G / "phase28-q19-first-support-follow-up-research.md",
         G / "phase28-session.md", *sorted(E.rglob("*.md"))]
errors = []
refs = anchors = line_refs = 0


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def targets(body):
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
            yield body[start:end - 1].strip("<>")


# Output exists before the self-referencing local-link check; overwritten below.
OUTPUT = E / "review-verification.json"
if not OUTPUT.exists():
    OUTPUT.write_text("{}\n")

for file in FILES:
    body = file.read_text()
    if any(line.rstrip() != line for line in body.splitlines()):
        errors.append(f"trailing whitespace: {file.name}")
    for target in targets(body):
        if re.match(r"^[a-z][a-z0-9+.-]*://", target) or target.startswith("mailto:"):
            continue
        path, _, anchor = unquote(target).partition("#")
        match = re.search(r":(\d+)$", path)
        lineno = int(match.group(1)) if match else None
        if match:
            path = path[:match.start()]
        dest = (file.parent / path).resolve() if path else file
        refs += 1
        if not dest.exists():
            errors.append(f"{file.name}: missing {target}")
            continue
        if lineno:
            line_refs += 1
            if not 1 <= lineno <= len(dest.read_text().splitlines()):
                errors.append(f"{file.name}: invalid line {target}")
        if anchor:
            heads = re.findall(r"^#+\s+(.+)$", dest.read_text(), re.M)
            slugs = [re.sub(r"[^\w\- ]", "", h.lower()).replace(" ", "-") for h in heads]
            slugs += re.findall(r'<a\s+(?:id|name)=["\']([^"\']+)["\']', dest.read_text())
            anchors += 1
            if anchor not in slugs:
                errors.append(f"{file.name}: missing anchor {target}")

main = MAIN.read_text()
counts = {
    "clauses": len(re.findall(r"^\*\*C\d\d —", main, re.M)),
    "proofs": len(re.findall(r"^\*\*P\d\d\.", main, re.M)),
    "concerns": len(re.findall(r"^\| F\d\d ", main, re.M)),
    "categories": len(re.findall(r"^\| \d\d ", main, re.M)),
}
assert counts == {"clauses": 24, "proofs": 30, "concerns": 14, "categories": 22}, counts
assert "no subsequent\nratification is claimed" in main
assert "Independent follow-up task" in main
assert "Not needed" in main and "invalid, unhandled admission" in main
assert "Sentry" in main and "before tests ran" in main
q19 = FILES[1].read_text()
assert "Founder answered A" in q19 and "Awaiting founder answer" not in q19
session = FILES[2].read_text()
assert "All nineteen review dispositions" in session
assert "D19 (answered Q19)" in session and "E19 (P28 design)" in session
assert "Q19: first support for a ministry or the organization (now answered A)" in session
assert "D18 explicit ratification" in session
assert "**First-support follow-up** (Phase 28 D19, selected; amendments reviewed):" in (ROOT / "CONTEXT.md").read_text()
brief = sha(G / "phase28-founder-brief.md")
assert brief == "464e3ceb675f1bd3926b0974b003e885ef1b115b5b516a37da3d84fbed8f1dcb"

P = E / "postgres-probe"
r = json.loads((P / "results.json").read_text())
assert r["passed"] == r["outcomes"] == 35 and r["failure"] is None
assert all(case["passed"] for case in r["results"])
races = [case for case in r["results"] if "actual_lock_wait" in case]
assert len(races) == 8 and all(case["actual_lock_wait"] == "Lock:transactionid" for case in races)
for name, digest in r["artifact_sha256"].items():
    assert sha(P / name) == digest, name
assert sha(G / "d1-evidence/postgres-probe/run.py") == r["helper_sha256"]
sources = json.loads((P / "sources.json").read_text())
for source in sources["local"]:
    assert sha(ROOT / source["path"]) == source["sha256"], source["path"]
for source in sources["fresh"] + sources["same_day_reused"]:
    assert sha(Path(source["raw_path"])) == source["sha256"], source["name"]
    if "text_path" in source:
        assert sha(Path(source["text_path"])) == source["text_sha256"], source["name"]
roles = json.loads((P / "roles.json").read_text())
assert len(roles) == 8 and all(not role["rolsuper"] and not role["rolbypassrls"] for role in roles)
env = json.loads((P / "environment.json").read_text())
assert env["server"].startswith("PostgreSQL 17.11") and env["network"] == "none" and not env["published_ports"]
cleanup = json.loads((P / "cleanup.json").read_text())
assert cleanup["container_absent"] and all(cleanup["volumes_absent"].values())
snapshots = sorted((P / "development-attempts").iterdir())
assert len(snapshots) == 2
for snapshot in snapshots:
    prior = json.loads((snapshot / "results.json").read_text())
    assert prior["passed"] == prior["outcomes"] == 35
    for name, digest in prior["artifact_sha256"].items():
        assert sha(snapshot / name) == digest, (snapshot.name, name)
    prior_cleanup = json.loads((snapshot / "cleanup.json").read_text())
    assert prior_cleanup["container_absent"] and all(prior_cleanup["volumes_absent"].values())
history = json.loads((E / "history-probe/results.json").read_text())
assert history["case_count"] == history["reproduced"] == 20
assert all(case["counterexample_reproduced"] for case in history["cases"])
assert len({case["id"] for case in history["cases"]}) == 20

# Earlier results remain historical snapshots. Do not rerun their old Q19-unanswered assertions.
d18 = json.loads((G / "d18-evidence/review-verification.json").read_text())
assert d18["d18_amendments_ratified"] is True and d18["q19_prepared_unanswered"] is True

result = {
    "checked_at_utc": datetime.now(timezone.utc).isoformat(),
    "scope": "Documentation structure/status/local references and retained research evidence only; not Core, finance, Supabase or UX qualification",
    "counts": counts,
    "local_references_checked": refs,
    "local_heading_anchors_checked": anchors,
    "local_line_references_checked": line_refs,
    "errors": errors,
    "founder_brief_sha256_unchanged": brief,
    "d19_a_selected": True,
    "d19_amendments_ratified": False,
    "q20_asked": False,
    "ratified_decisions": ["D2", "D4", "D5", "D7", "D8", "D9", "D10", "D14", "D15", "D16", "D17", "D18"],
    "postgres_version": "17.11",
    "postgres_outcomes_passed": 35,
    "actual_concurrent_races": 8,
    "preserved_development_runs": 2,
    "history_counterexamples_reproduced": 20,
    "technical_source_bodies_hash_verified": len(sources["fresh"] + sources["same_day_reused"]),
    "supabase_or_provider_calls": 0,
    "sha256": {str(file.relative_to(ROOT)): sha(file) for file in [*FILES, ROOT / "CONTEXT.md", Path(__file__), E / "history-probe/probe.py", E / "history-probe/results.json", P / "results.json", P / "cleanup.json"]},
}
OUTPUT.write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps({key: value for key, value in result.items() if key != "sha256"}, indent=2))
raise SystemExit(1 if errors else 0)
